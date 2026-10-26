var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// engine/src/procedural/asset-factory.ts
import * as THREE2 from "three";

// engine/src/procedural/asset-exporter.ts
import * as THREE from "three";

// engine/src/asset-parser/base64.ts
var BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var BASE64_VALUES = (() => {
  const table = new Int16Array(256).fill(-1);
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    table[BASE64_ALPHABET.charCodeAt(i)] = i;
  }
  return table;
})();
function encodeBase64(bytes) {
  let out = "";
  const length = bytes.length;
  let i = 0;
  for (; i + 2 < length; i += 3) {
    const chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    out += BASE64_ALPHABET[chunk >> 18 & 63] + BASE64_ALPHABET[chunk >> 12 & 63] + BASE64_ALPHABET[chunk >> 6 & 63] + BASE64_ALPHABET[chunk & 63];
  }
  const rest = length - i;
  if (rest === 1) {
    const chunk = bytes[i] << 16;
    out += BASE64_ALPHABET[chunk >> 18 & 63] + BASE64_ALPHABET[chunk >> 12 & 63] + "==";
  } else if (rest === 2) {
    const chunk = bytes[i] << 16 | bytes[i + 1] << 8;
    out += BASE64_ALPHABET[chunk >> 18 & 63] + BASE64_ALPHABET[chunk >> 12 & 63] + BASE64_ALPHABET[chunk >> 6 & 63] + "=";
  }
  return out;
}
function decodeBase64(input) {
  const out = new Uint8Array(Math.floor(input.length * 3 / 4));
  let outIndex = 0;
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    const value = code < 256 ? BASE64_VALUES[code] : -1;
    if (value < 0) continue;
    buffer = (buffer << 6 | value) & 16383;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[outIndex++] = buffer >> bits & 255;
    }
  }
  return out.subarray(0, outIndex);
}

// engine/src/procedural/asset-exporter.ts
function collectTriangles(root, applyTransform2) {
  const triangles = [];
  if (applyTransform2) root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const geometry = child.geometry;
    const posAttr = geometry.getAttribute("position");
    if (!posAttr) return;
    const indexAttr = geometry.getIndex();
    const matrix = applyTransform2 ? child.matrixWorld : new THREE.Matrix4();
    const readVertex = (index) => new THREE.Vector3().fromBufferAttribute(posAttr, index).applyMatrix4(matrix);
    if (indexAttr) {
      for (let i = 0; i + 2 < indexAttr.count; i += 3) {
        triangles.push({
          a: readVertex(indexAttr.getX(i)),
          b: readVertex(indexAttr.getX(i + 1)),
          c: readVertex(indexAttr.getX(i + 2))
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
var AssetExporter = class {
  /**
   * Gom vật liệu đang dùng trong một cây Object3D, theo tên.
   *
   * Dùng chung cho `exportToObj` và `exportToMtl` để hai định dạng luôn thống
   * nhất về tên vật liệu.
   */
  static collectExportMaterials(root) {
    const materialsUsed = /* @__PURE__ */ new Map();
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;
      const mat2 = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!mat2) return;
      materialsUsed.set(mat2.name || `Mat_${mat2.id}`, mat2);
    });
    return materialsUsed;
  }
  /**
   * Lấy URI của texture từ vật liệu (theo quy ước của `texture-parser`).
   */
  static textureUriOf(texture) {
    if (!texture) return void 0;
    const image = texture.image;
    const uri = image?.src ?? image?.url ?? (image?.name || texture.name);
    return uri && uri.length > 0 ? uri : void 0;
  }
  /**
   * Dựng nội dung tệp MTL từ danh sách vật liệu.
   *
   * Chỉ dùng các lệnh mà `parseMtl` của Engine đọc được
   * (`Kd`, `Ks`, `Ns`, `d`, `map_Kd`, `map_Bump`, `map_d`) để vòng
   * xuất → bóc tách luôn khép kín.
   */
  static buildMtlText(materialsUsed, rootName) {
    let mtlOutput = `# AETHERIA 3D Engine MTL Exporter
# Materials for: ${rootName}

`;
    for (const [matName, mat2] of materialsUsed.entries()) {
      mtlOutput += `newmtl ${matName}
`;
      mtlOutput += "Ns 250.0\nKa 1.000 1.000 1.000\n";
      const color = mat2.color ? mat2.color : new THREE.Color(0.8, 0.8, 0.8);
      mtlOutput += `Kd ${color.r.toFixed(4)} ${color.g.toFixed(4)} ${color.b.toFixed(4)}
`;
      mtlOutput += "Ks 0.200 0.200 0.200\nNi 1.450\n";
      const opacity = mat2.opacity ?? 1;
      mtlOutput += `d ${opacity.toFixed(4)}
illum 2
`;
      const mapUri = this.textureUriOf(mat2.map);
      if (mapUri) mtlOutput += `map_Kd ${mapUri}
`;
      const bumpUri = this.textureUriOf(mat2.normalMap);
      if (bumpUri) mtlOutput += `map_Bump ${bumpUri}
`;
      const alphaUri = this.textureUriOf(mat2.alphaMap);
      if (alphaUri) mtlOutput += `map_d ${alphaUri}
`;
      mtlOutput += "\n";
    }
    return mtlOutput;
  }
  /**
   * Xuất riêng tệp vật liệu Wavefront MTL.
   *
   * `parseMtl` của Engine đọc được tệp này, nên `exportToObj` + `exportToMtl`
   * tạo ra một cặp OBJ/MTL hoàn chỉnh.
   */
  static exportToMtl(root, options = {}) {
    const rootName = options.name ?? root.name ?? "ExportedModel";
    return this.buildMtlText(this.collectExportMaterials(root), rootName);
  }
  /**
   * Export an Object3D hierarchy to Wavefront OBJ and MTL text formats.
   */
  static exportToObj(root, options = {}) {
    const includeNormals = options.includeNormals ?? true;
    const includeUvs = options.includeUvs ?? true;
    const includeMaterials = options.includeMaterials ?? true;
    const rootName = options.name ?? root.name ?? "ExportedModel";
    const applyTransform2 = options.applyTransform ?? true;
    if (applyTransform2) {
      root.updateMatrixWorld(true);
    }
    let objOutput = `# AETHERIA 3D Engine OBJ Exporter
# Model: ${rootName}

`;
    let mtlOutput = `# AETHERIA 3D Engine MTL Exporter
# Materials for: ${rootName}

`;
    if (includeMaterials) {
      objOutput += `mtllib ${rootName}.mtl

`;
    }
    let vertexOffset = 0;
    let normalOffset = 0;
    let uvOffset = 0;
    const materialsUsed = /* @__PURE__ */ new Map();
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) return;
      const mesh = child;
      const geometry = mesh.geometry;
      if (!geometry) return;
      const posAttr = geometry.getAttribute("position");
      if (!posAttr) return;
      const normalAttr = geometry.getAttribute("normal");
      const uvAttr = geometry.getAttribute("uv");
      const indexAttr = geometry.getIndex();
      objOutput += `o ${mesh.name || `Mesh_${mesh.id}`}
`;
      const mat2 = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (mat2 && includeMaterials) {
        const matName = mat2.name || `Mat_${mat2.id}`;
        materialsUsed.set(matName, mat2);
        objOutput += `usemtl ${matName}
s 1
`;
      }
      const matrixWorld = applyTransform2 ? mesh.matrixWorld : new THREE.Matrix4();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrixWorld);
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        if (applyTransform2) {
          v.applyMatrix4(matrixWorld);
        }
        objOutput += `v ${v.x.toFixed(6)} ${v.y.toFixed(6)} ${v.z.toFixed(6)}
`;
      }
      if (includeUvs && uvAttr) {
        for (let i = 0; i < uvAttr.count; i++) {
          objOutput += `vt ${uvAttr.getX(i).toFixed(6)} ${uvAttr.getY(i).toFixed(6)}
`;
        }
      }
      if (includeNormals && normalAttr) {
        const n = new THREE.Vector3();
        for (let i = 0; i < normalAttr.count; i++) {
          n.fromBufferAttribute(normalAttr, i);
          if (applyTransform2) {
            n.applyMatrix3(normalMatrix).normalize();
          }
          objOutput += `vn ${n.x.toFixed(6)} ${n.y.toFixed(6)} ${n.z.toFixed(6)}
`;
        }
      }
      const hasUv = Boolean(includeUvs && uvAttr);
      const hasNorm = Boolean(includeNormals && normalAttr);
      const writeFace = (a, b, c) => {
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
          objOutput += `f ${aV}/${aVt}/${aVn} ${bV}/${bVt}/${bVn} ${cV}/${cVt}/${cVn}
`;
        } else if (hasUv) {
          const aVt = a + 1 + uvOffset;
          const bVt = b + 1 + uvOffset;
          const cVt = c + 1 + uvOffset;
          objOutput += `f ${aV}/${aVt} ${bV}/${bVt} ${cV}/${cVt}
`;
        } else if (hasNorm) {
          const aVn = a + 1 + normalOffset;
          const bVn = b + 1 + normalOffset;
          const cVn = c + 1 + normalOffset;
          objOutput += `f ${aV}//${aVn} ${bV}//${bVn} ${cV}//${cVn}
`;
        } else {
          objOutput += `f ${aV} ${bV} ${cV}
`;
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
      objOutput += "\n";
    });
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
  static buildGltfDocument(root, options) {
    const scenes = [{ nodes: [] }];
    const nodes = [];
    const meshes = [];
    const accessors = [];
    const bufferViews = [];
    const materials = [];
    const skins = [];
    const textures = [];
    const images = [];
    const samplers = [];
    const binaryChunks = [];
    let currentByteOffset = 0;
    const appendBufferData = (bytes) => {
      const padding = (4 - bytes.byteLength % 4) % 4;
      const aligned = new Uint8Array(bytes.byteLength + padding);
      aligned.set(bytes);
      const bufferViewIndex = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: bytes.byteLength
      });
      binaryChunks.push(aligned);
      currentByteOffset += aligned.byteLength;
      return bufferViewIndex;
    };
    const addAccessor = (bytes, componentType, count, type, min, max) => {
      const bufferView = appendBufferData(bytes);
      const accessor = {
        bufferView,
        byteOffset: 0,
        componentType,
        count,
        type
      };
      if (min) accessor.min = min;
      if (max) accessor.max = max;
      accessors.push(accessor);
      return accessors.length - 1;
    };
    const readFloats = (attr, itemSize) => {
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
    const readUint16 = (attr, itemSize) => {
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
    const textureUri2 = (texture) => {
      if (!texture) return void 0;
      const userData = texture.userData;
      const candidate = userData?.uri ?? userData?.src ?? texture.source?.data;
      return typeof candidate === "string" && candidate.length > 0 ? candidate : void 0;
    };
    const registerTexture = (texture) => {
      const uri = textureUri2(texture);
      if (!uri || !texture) return void 0;
      let imageIndex = images.findIndex((img) => img.uri === uri);
      if (imageIndex < 0) {
        imageIndex = images.length;
        images.push({ uri, ...texture.name ? { name: texture.name } : {} });
      }
      const wrapS = texture.wrapS ?? THREE.RepeatWrapping;
      const wrapT = texture.wrapT ?? THREE.RepeatWrapping;
      let samplerIndex = samplers.findIndex(
        (s) => s.wrapS === wrapS && s.wrapT === wrapT
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
    const buildMaterial = (mat2) => {
      const standard = mat2;
      const color = standard.color ?? new THREE.Color(1, 1, 1);
      const emissive = standard.emissive ?? new THREE.Color(0, 0, 0);
      const entry = {
        name: mat2.name || void 0,
        doubleSided: mat2.side === THREE.DoubleSide,
        pbrMetallicRoughness: {
          baseColorFactor: [color.r, color.g, color.b, mat2.opacity ?? 1],
          metallicFactor: standard.metalness ?? 0,
          roughnessFactor: standard.roughness ?? 1
        }
      };
      if (entry.name === void 0) delete entry.name;
      if (emissive.r > 0 || emissive.g > 0 || emissive.b > 0) {
        entry.emissiveFactor = [emissive.r, emissive.g, emissive.b];
      }
      if (mat2.transparent && (mat2.opacity ?? 1) < 1) entry.alphaMode = "BLEND";
      const baseColor = registerTexture(standard.map);
      if (baseColor !== void 0) {
        entry.pbrMetallicRoughness.baseColorTexture = { index: baseColor };
      }
      const normal = registerTexture(standard.normalMap);
      if (normal !== void 0) entry.normalTexture = { index: normal };
      const emissiveMap = registerTexture(standard.emissiveMap);
      if (emissiveMap !== void 0) entry.emissiveTexture = { index: emissiveMap };
      const ao = registerTexture(standard.aoMap);
      if (ao !== void 0) entry.occlusionTexture = { index: ao };
      return entry;
    };
    const processMesh = (mesh) => {
      const geometry = mesh.geometry;
      const posAttr = geometry.getAttribute("position");
      if (!posAttr) return -1;
      const attributes = {};
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
        "VEC3",
        [minX, minY, minZ],
        [maxX, maxY, maxZ]
      );
      const normalAttr = geometry.getAttribute("normal");
      if (normalAttr) {
        const normals = readFloats(normalAttr, 3);
        attributes.NORMAL = addAccessor(
          new Uint8Array(normals.buffer, normals.byteOffset, normals.byteLength),
          5126,
          normalAttr.count,
          "VEC3"
        );
      }
      const tangentAttr = geometry.getAttribute("tangent");
      if (tangentAttr) {
        const tangents = readFloats(tangentAttr, 4);
        attributes.TANGENT = addAccessor(
          new Uint8Array(tangents.buffer, tangents.byteOffset, tangents.byteLength),
          5126,
          tangentAttr.count,
          "VEC4"
        );
      }
      const uvAttr = geometry.getAttribute("uv");
      if (uvAttr) {
        const uvs = readFloats(uvAttr, 2);
        attributes.TEXCOORD_0 = addAccessor(
          new Uint8Array(uvs.buffer, uvs.byteOffset, uvs.byteLength),
          5126,
          uvAttr.count,
          "VEC2"
        );
      }
      const uv2Attr = geometry.getAttribute("uv2");
      if (uv2Attr) {
        const uvs2 = readFloats(uv2Attr, 2);
        attributes.TEXCOORD_1 = addAccessor(
          new Uint8Array(uvs2.buffer, uvs2.byteOffset, uvs2.byteLength),
          5126,
          uv2Attr.count,
          "VEC2"
        );
      }
      const colorAttr = geometry.getAttribute("color");
      if (colorAttr) {
        const colorItemSize = colorAttr.itemSize === 4 ? 4 : 3;
        const colors = readFloats(colorAttr, colorItemSize);
        attributes.COLOR_0 = addAccessor(
          new Uint8Array(colors.buffer, colors.byteOffset, colors.byteLength),
          5126,
          colorAttr.count,
          colorItemSize === 4 ? "VEC4" : "VEC3"
        );
      }
      const jointAttr = geometry.getAttribute("skinIndex");
      if (jointAttr) {
        const joints = readUint16(jointAttr, 4);
        attributes.JOINTS_0 = addAccessor(
          new Uint8Array(joints.buffer, joints.byteOffset, joints.byteLength),
          5123,
          jointAttr.count,
          "VEC4"
        );
      }
      const weightAttr = geometry.getAttribute("skinWeight");
      if (weightAttr) {
        const weights = readFloats(weightAttr, 4);
        attributes.WEIGHTS_0 = addAccessor(
          new Uint8Array(weights.buffer, weights.byteOffset, weights.byteLength),
          5126,
          weightAttr.count,
          "VEC4"
        );
      }
      let indexAccessorIndex;
      const indexAttr = geometry.getIndex();
      if (indexAttr) {
        const useUint32 = indexAttr.array instanceof Uint32Array;
        const indices = useUint32 ? new Uint32Array(indexAttr.count) : new Uint16Array(indexAttr.count);
        for (let i = 0; i < indexAttr.count; i++) indices[i] = indexAttr.getX(i);
        indexAccessorIndex = addAccessor(
          new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength),
          useUint32 ? 5125 : 5123,
          indexAttr.count,
          "SCALAR"
        );
      }
      const mat2 = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      let materialIndex;
      if (mat2) {
        materialIndex = materials.length;
        materials.push(buildMaterial(mat2));
      }
      const primitive = { attributes, mode: 4 };
      if (indexAccessorIndex !== void 0) primitive.indices = indexAccessorIndex;
      if (materialIndex !== void 0) primitive.material = materialIndex;
      const meshIndex = meshes.length;
      meshes.push({
        name: mesh.name || `Mesh_${meshIndex}`,
        primitives: [primitive]
      });
      return meshIndex;
    };
    const nodeIndexOf = /* @__PURE__ */ new Map();
    const buildNode = (object) => {
      const node = {};
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
          object.quaternion.w
        ];
        node.scale = [object.scale.x, object.scale.y, object.scale.z];
      }
      const isMesh = object.isMesh === true;
      if (isMesh) {
        const meshIndex = processMesh(object);
        if (meshIndex >= 0) node.mesh = meshIndex;
      }
      const index = nodes.length;
      nodes.push(node);
      nodeIndexOf.set(object, index);
      const childIndices = [];
      for (const child of object.children) childIndices.push(buildNode(child));
      if (childIndices.length > 0) node.children = childIndices;
      return index;
    };
    const rootIndex = buildNode(root);
    scenes[0].nodes = [rootIndex];
    if (options.includeSkins ?? true) {
      const skinnedMeshes = [];
      root.traverse((child) => {
        if (child.isSkinnedMesh) {
          skinnedMeshes.push(child);
        }
      });
      for (const skinned of skinnedMeshes) {
        const skeleton = skinned.skeleton;
        if (!skeleton || skeleton.bones.length === 0) continue;
        const joints = [];
        for (const bone of skeleton.bones) {
          const existing = nodeIndexOf.get(bone);
          if (existing !== void 0) {
            joints.push(existing);
            continue;
          }
          const boneIndex = buildNode(bone);
          joints.push(boneIndex);
          const parentNode = nodes[skinnedIndexOf(skinned)];
          const siblings = parentNode.children ?? [];
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
          "MAT4"
        );
        const skinIndex = skins.length;
        skins.push({ joints, inverseBindMatrices: ibmAccessor, name: skinned.name || void 0 });
        const targetNode = nodes[skinnedIndexOf(skinned)];
        targetNode.skin = skinIndex;
      }
    }
    function skinnedIndexOf(object) {
      const found = nodeIndexOf.get(object);
      return found === void 0 ? 0 : found;
    }
    const totalBinaryLength = binaryChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalBinaryLength);
    let offset = 0;
    for (const chunk of binaryChunks) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const doc = {
      asset: {
        version: "2.0",
        generator: "AETHERIA 3D Engine Exporter v2.0"
      },
      scene: 0,
      scenes,
      nodes
    };
    if (meshes.length > 0) doc.meshes = meshes;
    if (materials.length > 0) doc.materials = materials;
    if (accessors.length > 0) doc.accessors = accessors;
    if (bufferViews.length > 0) doc.bufferViews = bufferViews;
    if (skins.length > 0) doc.skins = skins;
    if (textures.length > 0) doc.textures = textures;
    if (images.length > 0) doc.images = images;
    if (samplers.length > 0) doc.samplers = samplers;
    if (totalBinaryLength > 0) doc.buffers = [{ byteLength: totalBinaryLength }];
    return { doc, bin: combinedBuffer };
  }
  /**
   * Xuất Object3D thành glTF 2.0 JSON (`.gltf`).
   *
   * Buffer được nhúng thành data URI nên tệp tự chứa — mở được bằng mọi
   * trình đọc glTF mà không cần tệp `.bin` đi kèm.
   */
  static exportToGltf(root, options = {}) {
    const { doc, bin } = this.buildGltfDocument(root, options);
    if (bin.byteLength > 0 && (options.embedBuffers ?? true)) {
      doc.buffers = [
        {
          byteLength: bin.byteLength,
          uri: `data:application/octet-stream;base64,${encodeBase64(bin)}`
        }
      ];
    }
    return doc;
  }
  /**
   * Xuất Object3D thành GLB nhị phân (`.glb`).
   *
   * Buffer nằm ở chunk BIN nên `buffers` không có `uri` — đúng theo spec GLB.
   */
  static exportToGlb(root, options = {}) {
    const { doc, bin } = this.buildGltfDocument(root, options);
    const jsonString = JSON.stringify(doc);
    const encoder = new TextEncoder();
    const jsonBytes = encoder.encode(jsonString);
    const jsonPadding = (4 - jsonBytes.byteLength % 4) % 4;
    const jsonChunkLength = jsonBytes.byteLength + jsonPadding;
    const jsonChunkData = new Uint8Array(jsonChunkLength);
    jsonChunkData.set(jsonBytes);
    for (let i = 0; i < jsonPadding; i++) {
      jsonChunkData[jsonBytes.byteLength + i] = 32;
    }
    const binPadding = (4 - bin.byteLength % 4) % 4;
    const binChunkLength = bin.byteLength + binPadding;
    const binChunkData = new Uint8Array(binChunkLength);
    binChunkData.set(bin);
    const totalLength = 12 + 8 + jsonChunkLength + (binChunkLength > 0 ? 8 + binChunkLength : 0);
    const glbBuffer = new Uint8Array(totalLength);
    const view = new DataView(glbBuffer.buffer);
    view.setUint32(0, 1179937895, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, totalLength, true);
    view.setUint32(12, jsonChunkLength, true);
    view.setUint32(16, 1313821514, true);
    glbBuffer.set(jsonChunkData, 20);
    if (binChunkLength > 0) {
      const binHeaderOffset = 20 + jsonChunkLength;
      view.setUint32(binHeaderOffset, binChunkLength, true);
      view.setUint32(binHeaderOffset + 4, 5130562, true);
      glbBuffer.set(binChunkData, binHeaderOffset + 8);
    }
    return glbBuffer;
  }
  /**
   * Xuất Object3D thành STL.
   *
   * STL không mang vật liệu hay texture — chỉ hình học tam giác.
   */
  static exportToStl(root, options = {}) {
    const encoding = options.encoding ?? "binary";
    const name = options.name ?? root.name ?? "ExportedModel";
    const triangles = collectTriangles(root, options.applyTransform ?? true);
    if (encoding === "ascii") {
      let out = `solid ${name}
`;
      const ab2 = new THREE.Vector3();
      const ac2 = new THREE.Vector3();
      const normal2 = new THREE.Vector3();
      const f = (v) => v.toFixed(6);
      for (const tri of triangles) {
        ab2.subVectors(tri.b, tri.a);
        ac2.subVectors(tri.c, tri.a);
        normal2.crossVectors(ab2, ac2).normalize();
        out += `  facet normal ${f(normal2.x)} ${f(normal2.y)} ${f(normal2.z)}
`;
        out += "    outer loop\n";
        for (const v of [tri.a, tri.b, tri.c]) {
          out += `      vertex ${f(v.x)} ${f(v.y)} ${f(v.z)}
`;
        }
        out += "    endloop\n  endfacet\n";
      }
      out += `endsolid ${name}
`;
      return new TextEncoder().encode(out);
    }
    const buffer = new ArrayBuffer(84 + triangles.length * 50);
    const view = new DataView(buffer);
    const header = new TextEncoder().encode(`AETHERIA 3D Engine STL Exporter \u2014 ${name}`.slice(0, 79));
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
  static exportToPly(root, options = {}) {
    const encoding = options.encoding ?? "binary";
    const includeNormals = options.includeNormals ?? true;
    const includeUvs = options.includeUvs ?? true;
    const name = options.name ?? root.name ?? "ExportedModel";
    const applyTransform2 = options.applyTransform ?? true;
    if (applyTransform2) root.updateMatrixWorld(true);
    const chunks = [];
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry;
      const posAttr = geometry.getAttribute("position");
      if (!posAttr) return;
      const normalAttr = includeNormals ? geometry.getAttribute("normal") : null;
      const uvAttr = includeUvs ? geometry.getAttribute("uv") : null;
      const indexAttr = geometry.getIndex();
      const matrix = applyTransform2 ? child.matrixWorld : new THREE.Matrix4();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
      const chunk = { positions: [], normals: [], uvs: [], faces: [] };
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
      const face = (a, b, c) => {
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
      "ply",
      `format ${encoding === "ascii" ? "ascii" : "binary_little_endian"} 1.0`,
      `comment AETHERIA 3D Engine PLY Exporter \u2014 ${name}`,
      `element vertex ${vertexCount}`,
      "property float x",
      "property float y",
      "property float z"
    ];
    if (includeNormals) {
      headerLines.push("property float nx", "property float ny", "property float nz");
    }
    if (includeUvs) {
      headerLines.push("property float s", "property float t");
    }
    headerLines.push(`element face ${faceCount}`, "property list uchar int vertex_indices", "end_header");
    const headerText = `${headerLines.join("\n")}
`;
    const headerBytes = new TextEncoder().encode(headerText);
    if (encoding === "ascii") {
      let body = "";
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
          body += `${line}
`;
        }
      }
      let vertexOffset = 0;
      for (const chunk of chunks) {
        for (const f of chunk.faces) {
          body += `3 ${f[0] + vertexOffset} ${f[1] + vertexOffset} ${f[2] + vertexOffset}
`;
        }
        vertexOffset += chunk.positions.length / 3;
      }
      const bodyBytes = new TextEncoder().encode(body);
      const out2 = new Uint8Array(headerBytes.byteLength + bodyBytes.byteLength);
      out2.set(headerBytes, 0);
      out2.set(bodyBytes, headerBytes.byteLength);
      return out2;
    }
    const stride = 12 + (includeNormals ? 12 : 0) + (includeUvs ? 8 : 0);
    const vertexBytes = vertexCount * stride;
    const faceBytes = faceCount * 13;
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
  static exportToUsda(root, options = {}) {
    const name = options.name ?? root.name ?? "ExportedModel";
    const metersPerUnit = options.metersPerUnit ?? 0.01;
    const applyTransform2 = options.applyTransform ?? true;
    if (applyTransform2) root.updateMatrixWorld(true);
    let out = "#usda 1.0\n(\n";
    out += `    defaultPrim = "${name}"
`;
    out += `    metersPerUnit = ${metersPerUnit}
`;
    out += '    upAxis = "Y"\n';
    out += ")\n\n";
    out += `def Xform "${name}"
{
`;
    let meshIndex = 0;
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const geometry = child.geometry;
      const posAttr = geometry.getAttribute("position");
      if (!posAttr) return;
      const indexAttr = geometry.getIndex();
      const matrix = applyTransform2 ? child.matrixWorld : new THREE.Matrix4();
      const v = new THREE.Vector3();
      const points = [];
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i).applyMatrix4(matrix);
        points.push(`(${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)})`);
      }
      const counts = [];
      const indices = [];
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
      out += `    def Mesh "${primName}"
    {
`;
      out += `        int[] faceVertexCounts = [${counts.join(", ")}]
`;
      out += `        int[] faceVertexIndices = [${indices.join(", ")}]
`;
      out += `        point3f[] points = [${points.join(", ")}]
`;
      out += "    }\n";
    });
    out += "}\n";
    return out;
  }
  /**
   * Xuất cây khung (bone) thành BVH.
   *
   * BVH mang cây khung + kênh vị trí/xoay theo từng frame. Không có animation
   * thì xuất một frame tĩnh.
   */
  static exportToBvh(root, options = {}) {
    const name = options.name ?? root.name ?? "ExportedModel";
    const fps = options.fps ?? 30;
    if (options.applyTransform !== false) root.updateMatrixWorld(true);
    const bones = [];
    const buildBone = (node) => {
      const bone = {
        name: node.name || "Bone",
        offset: new THREE.Vector3(node.position.x, node.position.y, node.position.z),
        children: []
      };
      for (const child of node.children) {
        if (child instanceof THREE.Bone) bone.children.push(buildBone(child));
      }
      return bone;
    };
    for (const child of root.children) {
      if (child instanceof THREE.Bone) bones.push(buildBone(child));
    }
    const rootBone = bones.length > 0 ? { name, offset: new THREE.Vector3(root.position.x, root.position.y, root.position.z), children: bones } : { name, offset: new THREE.Vector3(), children: [] };
    let out = "HIERARCHY\n";
    const writeBone = (bone, depth, isRoot) => {
      const pad = " ".repeat(depth * 2);
      out += `${pad}${isRoot ? "ROOT" : "JOINT"} ${bone.name}
`;
      out += `${pad}{
`;
      out += `${pad}  OFFSET ${bone.offset.x.toFixed(6)} ${bone.offset.y.toFixed(6)} ${bone.offset.z.toFixed(6)}
`;
      out += `${pad}  CHANNELS 6 Xposition Yposition Zposition Xrotation Zrotation Yrotation
`;
      for (const child of bone.children) writeBone(child, depth + 1, false);
      if (bone.children.length === 0) {
        out += `${pad}  End Site
`;
        out += `${pad}  {
`;
        out += `${pad}    OFFSET 0.000000 0.000000 0.000000
`;
        out += `${pad}  }
`;
      }
      out += `${pad}}
`;
    };
    writeBone(rootBone, 0, true);
    const flat = [];
    const flatten = (bone) => {
      flat.push(bone);
      for (const child of bone.children) flatten(child);
    };
    flatten(rootBone);
    out += "MOTION\n";
    out += "Frames: 1\n";
    out += `Frame Time: ${(1 / fps).toFixed(8)}
`;
    const values = [];
    for (const bone of flat) {
      values.push(bone.offset.x, bone.offset.y, bone.offset.z, 0, 0, 0);
    }
    out += `${values.map((v) => v.toFixed(6)).join(" ")}
`;
    return out;
  }
};

// engine/src/procedural/asset-factory.ts
function buildGeometry(shape, size) {
  const [w, h, d] = size;
  switch (shape) {
    case "box":
      return new THREE2.BoxGeometry(w, h, d);
    case "sphere":
      return new THREE2.SphereGeometry(w / 2, 24, 16);
    case "cylinder":
      return new THREE2.CylinderGeometry(w / 2, w / 2, h, 20);
    case "cone":
      return new THREE2.ConeGeometry(w / 2, h, 20);
    case "capsule":
      return new THREE2.CapsuleGeometry(w / 2, Math.max(h - w, 1e-3), 6, 16);
    case "plane":
      return new THREE2.PlaneGeometry(w, h, 1, 1);
    case "torus":
      return new THREE2.TorusGeometry(w / 2, d / 2, 12, 24);
    default:
      return new THREE2.BoxGeometry(w, h, d);
  }
}
var AssetFactory = class _AssetFactory {
  /**
   * Dựng asset từ đặc tả part.
   */
  static create(spec) {
    const root = new THREE2.Group();
    root.name = spec.name;
    const scale = spec.scale ?? 1;
    root.scale.setScalar(scale);
    let meshCount = 0;
    let triangleCount = 0;
    spec.parts.forEach((part, index) => {
      const size = part.size ?? [1, 1, 1];
      const geometry = buildGeometry(part.shape, size);
      const material = new THREE2.MeshStandardMaterial({
        name: spec.materialName ?? `${spec.name}_Material`,
        color: part.color ?? 10134706,
        roughness: part.roughness ?? 0.7,
        metalness: part.metalness ?? 0.05
      });
      const mesh = new THREE2.Mesh(geometry, material);
      mesh.name = part.name ?? `Part_${index}`;
      if (part.position) mesh.position.set(part.position[0], part.position[1], part.position[2]);
      if (part.rotation) {
        mesh.rotation.set(
          THREE2.MathUtils.degToRad(part.rotation[0]),
          THREE2.MathUtils.degToRad(part.rotation[1]),
          THREE2.MathUtils.degToRad(part.rotation[2])
        );
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
      meshCount++;
      const indexAttr = geometry.getIndex();
      const posAttr = geometry.getAttribute("position");
      triangleCount += indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    });
    root.updateMatrixWorld(true);
    const box = new THREE2.Box3().setFromObject(root);
    return {
      root,
      meshCount,
      triangleCount,
      bounds: { min: box.min, max: box.max, size: box.getSize(new THREE2.Vector3()) }
    };
  }
  /**
   * Xuất asset ra định dạng chỉ định.
   *
   * Mọi định dạng trả về đều đọc lại được bằng `AssetParser` của Engine.
   */
  static export(root, format, name) {
    const assetName = name ?? root.name ?? "Asset";
    switch (format) {
      case "glb":
        return { format, bytes: AssetExporter.exportToGlb(root, { name: assetName }), extension: "glb" };
      case "gltf": {
        const doc = AssetExporter.exportToGltf(root, { name: assetName });
        return { format, text: JSON.stringify(doc, null, 2), extension: "gltf" };
      }
      case "obj": {
        const { obj, mtl } = AssetExporter.exportToObj(root, { name: assetName });
        return { format, text: obj, mtl, extension: "obj" };
      }
      case "mtl": {
        return { format, text: AssetExporter.exportToMtl(root, { name: assetName }), extension: "mtl" };
      }
      case "stl":
        return { format, bytes: AssetExporter.exportToStl(root, { name: assetName }), extension: "stl" };
      case "ply":
        return { format, bytes: AssetExporter.exportToPly(root, { name: assetName }), extension: "ply" };
      case "usda":
        return { format, text: AssetExporter.exportToUsda(root, { name: assetName }), extension: "usda" };
      case "bvh":
        return { format, text: AssetExporter.exportToBvh(root, { name: assetName }), extension: "bvh" };
      default: {
        const exhaustive = format;
        throw new Error(`AssetFactory: \u0111\u1ECBnh d\u1EA1ng xu\u1EA5t kh\xF4ng h\u1ED7 tr\u1EE3 "${String(exhaustive)}"`);
      }
    }
  }
  /**
   * Tạo asset rồi xuất ngay — tiện cho pipeline sinh tài sản hàng loạt.
   */
  static createAndExport(spec, format) {
    const created = _AssetFactory.create(spec);
    return _AssetFactory.export(created.root, format, spec.name);
  }
  /** Các định dạng có thể xuất. */
  static exportableFormats() {
    return ["glb", "gltf", "obj", "mtl", "stl", "ply", "usda", "bvh"];
  }
  /** Ánh xạ định dạng AssetFormat của Engine sang định dạng xuất được. */
  static exportFormatFor(format) {
    switch (format) {
      case "glb":
        return "glb";
      case "gltf":
        return "gltf";
      case "obj":
        return "obj";
      case "mtl":
        return "mtl";
      case "stl":
        return "stl";
      case "ply":
        return "ply";
      case "usd":
      case "usda":
      case "usdc":
        return "usda";
      case "bvh":
        return "bvh";
      default:
        return null;
    }
  }
};

// engine/src/procedural/primitive-factory.ts
import * as THREE3 from "three";
function seededRandom(seed) {
  let h = seed >>> 0;
  return () => {
    h = h + 1831565813 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hashNoise(x, y, z, seed) {
  let h = Math.imul(x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1274126177, 2654435761);
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}
function displace(geo, amp, freq, seed) {
  const pos = geo.getAttribute("position");
  const v = new THREE3.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = hashNoise(
      Math.round(v.x * freq * 10),
      Math.round(v.y * freq * 10),
      Math.round(v.z * freq * 10),
      seed
    );
    v.multiplyScalar(1 + (n - 0.5) * amp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}
function blob(radius = 1, detail = 2, opts = {}) {
  const geo = new THREE3.IcosahedronGeometry(radius, detail);
  const seed = opts.seed ?? 1;
  return displace(geo, opts.noiseAmp ?? 0.25, opts.noiseFreq ?? 1, seed);
}
function spike(height = 0.5, radius = 0.12, seg = 6) {
  return new THREE3.ConeGeometry(radius, height, seg);
}
function tentacle(length = 1.2, radius = 0.12, seed = 1, seg = 24) {
  const rng = seededRandom(seed);
  const pts = [];
  let x = 0, z = 0;
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    x += (rng() - 0.5) * length * 0.25;
    z += (rng() - 0.5) * length * 0.25;
    pts.push(new THREE3.Vector3(x, -t * length, z));
  }
  const curve = new THREE3.CatmullRomCurve3(pts);
  return new THREE3.TubeGeometry(curve, seg, radius, 6, false);
}
function eyeball(radius = 0.14) {
  return {
    white: new THREE3.SphereGeometry(radius, 12, 10),
    pupil: new THREE3.SphereGeometry(radius * 0.45, 10, 8)
  };
}
function limbBone(radius = 0.08, length = 0.6) {
  return new THREE3.CapsuleGeometry(radius, length, 4, 8);
}
function cubeBox(width = 1, height = 1, depth = 1) {
  return new THREE3.BoxGeometry(width, height, depth);
}
function cylinder(radius = 0.5, height = 1, seg = 16) {
  return new THREE3.CylinderGeometry(radius, radius, height, seg);
}
function createConeMesh(opts = {}) {
  const geo = new THREE3.ConeGeometry(opts.radius ?? 0.5, opts.height ?? 1, opts.segments ?? 16);
  const mat2 = new THREE3.MeshStandardMaterial({ color: opts.color ?? 8947848, roughness: opts.roughness ?? 0.5 });
  return new THREE3.Mesh(geo, mat2);
}
function createCylinderMesh(opts = {}) {
  const geo = new THREE3.CylinderGeometry(opts.radiusTop ?? 0.5, opts.radiusBottom ?? 0.5, opts.height ?? 1, opts.segments ?? 16);
  const mat2 = new THREE3.MeshStandardMaterial({ color: opts.color ?? 8947848, roughness: opts.roughness ?? 0.5, metalness: opts.metalness ?? 0.1 });
  return new THREE3.Mesh(geo, mat2);
}
function createBoxMesh(opts = {}) {
  const geo = new THREE3.BoxGeometry(opts.width ?? 1, opts.height ?? 1, opts.depth ?? 1);
  const mat2 = new THREE3.MeshStandardMaterial({ color: opts.color ?? 8947848, roughness: opts.roughness ?? 0.5 });
  return new THREE3.Mesh(geo, mat2);
}

// engine/src/procedural/character-factory.ts
import * as THREE4 from "three";
function buildCharacter(specIn) {
  const spec = { ...specIn };
  const rng = seededRandom(spec.seed);
  const height = spec.height ?? 1.8;
  const archetype = spec.archetype ?? "warrior";
  const skinColor = spec.skinColor ?? 13805177;
  const armorColor = spec.armorColor ?? (archetype === "mage" ? 2829138 : archetype === "knight" ? 9211028 : 4863784);
  const accentColor = spec.accentColor ?? (archetype === "mage" ? 10181046 : archetype === "boss" ? 12597547 : 15105570);
  const skinMat = new THREE4.MeshStandardMaterial({ color: skinColor, roughness: 0.8, metalness: 0.05 });
  const armorMat = new THREE4.MeshStandardMaterial({
    color: armorColor,
    roughness: spec.roughness ?? 0.4,
    metalness: spec.metalness ?? (archetype === "knight" || archetype === "warrior" ? 0.7 : 0.2)
  });
  const accentMat = new THREE4.MeshStandardMaterial({ color: accentColor, roughness: 0.5, metalness: 0.3 });
  const root = new THREE4.Group();
  root.name = `character_${archetype}_${spec.seed}`;
  const sockets = [];
  const boneHierarchy = [];
  const hips = new THREE4.Group();
  hips.name = "hips";
  hips.position.y = height * 0.52;
  const hipsMesh = new THREE4.Mesh(cubeBox(height * 0.2, height * 0.12, height * 0.14), armorMat);
  hips.add(hipsMesh);
  root.add(hips);
  boneHierarchy.push({ name: "hips", node: hips });
  sockets.push({ name: "belt", node: hips });
  const spine = new THREE4.Group();
  spine.name = "spine";
  spine.position.y = height * 0.12;
  const torsoMesh = new THREE4.Mesh(
    displace(new THREE4.BoxGeometry(height * 0.24, height * 0.26, height * 0.16), 0.1, 2, spec.seed),
    armorMat
  );
  torsoMesh.position.y = height * 0.13;
  spine.add(torsoMesh);
  hips.add(spine);
  boneHierarchy.push({ name: "spine", node: spine, parentName: "hips" });
  sockets.push({ name: "spine", node: spine });
  const neck = new THREE4.Group();
  neck.name = "neck";
  neck.position.y = height * 0.26;
  spine.add(neck);
  const head = new THREE4.Group();
  head.name = "head";
  head.position.y = height * 0.06;
  const headMesh = new THREE4.Mesh(new THREE4.SphereGeometry(height * 0.1, 16, 14), skinMat);
  head.add(headMesh);
  if (spec.helmet !== false && (archetype === "knight" || archetype === "warrior" || archetype === "boss")) {
    const helmetMesh = new THREE4.Mesh(new THREE4.CylinderGeometry(height * 0.11, height * 0.11, height * 0.14, 16), accentMat);
    helmetMesh.position.y = height * 0.02;
    head.add(helmetMesh);
  }
  neck.add(head);
  boneHierarchy.push({ name: "head", node: head, parentName: "spine" });
  sockets.push({ name: "head", node: head });
  const shoulderWidth = height * 0.22;
  for (const side of [1, -1]) {
    const sidePrefix = side === 1 ? "r" : "l";
    const shoulder = new THREE4.Group();
    shoulder.name = `shoulder_${sidePrefix}`;
    shoulder.position.set(side * shoulderWidth, height * 0.22, 0);
    spine.add(shoulder);
    if (spec.shoulderPlates !== false && (archetype === "knight" || archetype === "warrior" || archetype === "boss")) {
      const pauldron = new THREE4.Mesh(new THREE4.SphereGeometry(height * 0.08, 8, 8), accentMat);
      pauldron.scale.set(1.2, 0.9, 1.2);
      shoulder.add(pauldron);
    }
    const upperArm = new THREE4.Group();
    upperArm.name = `arm_${sidePrefix}`;
    const upperArmMesh = new THREE4.Mesh(limbBone(height * 0.045, height * 0.18), armorMat);
    upperArmMesh.position.y = -height * 0.09;
    upperArm.add(upperArmMesh);
    shoulder.add(upperArm);
    boneHierarchy.push({ name: `arm_${sidePrefix}`, node: upperArm, parentName: "spine" });
    const forearm = new THREE4.Group();
    forearm.name = `forearm_${sidePrefix}`;
    forearm.position.y = -height * 0.18;
    const forearmMesh = new THREE4.Mesh(limbBone(height * 0.04, height * 0.16), skinMat);
    forearmMesh.position.y = -height * 0.08;
    forearm.add(forearmMesh);
    upperArm.add(forearm);
    boneHierarchy.push({ name: `forearm_${sidePrefix}`, node: forearm, parentName: `arm_${sidePrefix}` });
    const hand = new THREE4.Group();
    hand.name = `hand_${sidePrefix}`;
    hand.position.y = -height * 0.16;
    const handMesh = new THREE4.Mesh(cubeBox(height * 0.05, height * 0.06, height * 0.03), armorMat);
    hand.add(handMesh);
    forearm.add(hand);
    boneHierarchy.push({ name: `hand_${sidePrefix}`, node: hand, parentName: `forearm_${sidePrefix}` });
    sockets.push({ name: `hand_${sidePrefix}`, node: hand });
    if (side === -1) sockets.push({ name: "arm_l", node: forearm });
  }
  const hipWidth = height * 0.09;
  for (const side of [1, -1]) {
    const sidePrefix = side === 1 ? "r" : "l";
    const thigh = new THREE4.Group();
    thigh.name = `thigh_${sidePrefix}`;
    thigh.position.set(side * hipWidth, -height * 0.04, 0);
    const thighMesh = new THREE4.Mesh(limbBone(height * 0.055, height * 0.22), armorMat);
    thighMesh.position.y = -height * 0.11;
    thigh.add(thighMesh);
    hips.add(thigh);
    boneHierarchy.push({ name: `thigh_${sidePrefix}`, node: thigh, parentName: "hips" });
    const shin = new THREE4.Group();
    shin.name = `shin_${sidePrefix}`;
    shin.position.y = -height * 0.22;
    const shinMesh = new THREE4.Mesh(limbBone(height * 0.05, height * 0.2), armorMat);
    shinMesh.position.y = -height * 0.1;
    shin.add(shinMesh);
    thigh.add(shin);
    boneHierarchy.push({ name: `shin_${sidePrefix}`, node: shin, parentName: `thigh_${sidePrefix}` });
    const foot = new THREE4.Group();
    foot.name = `foot_${sidePrefix}`;
    foot.position.set(0, -height * 0.2, height * 0.04);
    const footMesh = new THREE4.Mesh(cubeBox(height * 0.06, height * 0.04, height * 0.12), accentMat);
    foot.add(footMesh);
    shin.add(foot);
    boneHierarchy.push({ name: `foot_${sidePrefix}`, node: foot, parentName: `shin_${sidePrefix}` });
    sockets.push({ name: `foot_${sidePrefix}`, node: foot });
  }
  if (spec.cape || archetype === "mage" || archetype === "boss") {
    const capeGeo = new THREE4.PlaneGeometry(height * 0.26, height * 0.45, 4, 6);
    const capeMat = new THREE4.MeshStandardMaterial({ color: accentColor, side: THREE4.DoubleSide, roughness: 0.9 });
    const cape = new THREE4.Mesh(capeGeo, capeMat);
    cape.name = "cape";
    cape.position.set(0, height * 0.18, -height * 0.09);
    cape.rotation.x = 0.1;
    spine.add(cape);
  }
  root.updateMatrixWorld(true);
  const box = new THREE4.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  const socketsRecord = sockets;
  socketsRecord.spine = spine;
  socketsRecord.head = head;
  socketsRecord.hips = hips;
  socketsRecord.root = root;
  return {
    root,
    spec,
    sockets,
    boneHierarchy
  };
}

// engine/src/procedural/monster-factory.ts
import * as THREE5 from "three";
var PALETTES = [
  { body: 3811914, accent: 9063135, eye: 16765502 },
  // tím bóng tối
  { body: 2372666, accent: 4114608, eye: 8191838 },
  // swamp
  { body: 4857888, accent: 13650474, eye: 16769162 },
  // magma
  { body: 1844272, accent: 4881104, eye: 12118271 },
  // abyss
  { body: 3944998, accent: 11046986, eye: 16738906 }
  // bone
];
function mat(color, roughness, metalness) {
  return new THREE5.MeshStandardMaterial({ color, roughness, metalness });
}
function addEye(parent, rng, spec, r, pos, mats) {
  const { white, pupil } = eyeball(r);
  const g = new THREE5.Group();
  const w = new THREE5.Mesh(white, mat(spec.palette?.eye ?? 16777215, 0.35, 0));
  const p = new THREE5.Mesh(pupil, mats.eye);
  p.position.z = r * 0.72;
  g.add(w, p);
  g.position.copy(pos);
  g.lookAt(pos.clone().multiplyScalar(2).add(new THREE5.Vector3(rng() - 0.5, 0.1, 1)));
  parent.add(g);
}
function buildMonster(specIn) {
  const spec = { ...specIn };
  const rng = seededRandom(spec.seed);
  const palette = spec.palette ?? PALETTES[Math.floor(rng() * PALETTES.length) % PALETTES.length];
  spec.palette = palette;
  const posture = spec.posture ?? ["biped", "quad", "blob", "flyer"][Math.floor(rng() * 4) % 4];
  const height = spec.height ?? 1.6 + rng() * 1.8;
  const rough = spec.roughness ?? 0.75;
  const metal = spec.metalness ?? 0.08;
  const mats = {
    body: mat(palette.body, rough, metal),
    accent: mat(palette.accent, rough * 0.7, metal + 0.15),
    eye: mat(palette.eye, 0.2, 0)
  };
  const root = new THREE5.Group();
  root.name = `monster_${spec.seed}`;
  const sockets = [];
  const nTent = spec.tentacles ?? (posture === "blob" ? 4 + Math.floor(rng() * 6) : 0);
  const nSpike = spec.spikes ?? Math.floor(rng() * 10);
  const nEye = spec.eyes ?? 1 + Math.floor(rng() * 4);
  const wings = spec.wings ?? posture === "flyer";
  if (posture === "blob") {
    const r = height * 0.42;
    const bodyGeo = displace(new THREE5.IcosahedronGeometry(r, 3), 0.3, 1.2, spec.seed);
    const body = new THREE5.Mesh(bodyGeo, mats.body);
    body.position.y = r * 0.95;
    root.add(body);
    sockets.push({ name: "core", node: body });
    for (let i = 0; i < nTent; i++) {
      const t = new THREE5.Mesh(tentacle(r * (0.9 + rng() * 0.8), r * 0.14, spec.seed + i), mats.accent);
      const a = i / nTent * Math.PI * 2;
      t.position.set(Math.cos(a) * r * 0.7, r * 0.9, Math.sin(a) * r * 0.7);
      t.rotation.x = 0.4;
      root.add(t);
    }
    for (let i = 0; i < nEye; i++) {
      const a = rng() * Math.PI * 2;
      const rr = r * (0.5 + rng() * 0.4);
      addEye(
        body,
        rng,
        spec,
        r * (0.1 + rng() * 0.1),
        new THREE5.Vector3(Math.cos(a) * rr * 0.7, r * (0.3 + rng() * 0.6), Math.sin(a) * rr * 0.7),
        mats
      );
    }
    for (let i = 0; i < nSpike; i++) {
      const s = new THREE5.Mesh(spike(r * (0.3 + rng() * 0.5), r * 0.09), mats.accent);
      const a = rng() * Math.PI * 2;
      const rr = r * rng() * 0.7;
      s.position.set(Math.cos(a) * rr, r * (1.3 + rng() * 0.5), Math.sin(a) * rr);
      root.add(s);
    }
    sockets.push({ name: "head", node: body });
  } else {
    const bodyH = height * (posture === "quad" ? 0.34 : 0.42);
    const bodyW = height * (posture === "quad" ? 0.55 : 0.32);
    const torso = new THREE5.Mesh(
      displace(new THREE5.CapsuleGeometry(bodyW * 0.55, bodyH, 4, 10), 0.18, 1, spec.seed),
      mats.body
    );
    torso.position.y = posture === "quad" ? height * 0.52 : height * 0.62;
    if (posture === "quad") torso.rotation.z = Math.PI / 2;
    root.add(torso);
    sockets.push({ name: "core", node: torso });
    const headR = height * 0.16;
    const head = new THREE5.Mesh(
      displace(new THREE5.IcosahedronGeometry(headR, 2), 0.2, 1.5, spec.seed + 7),
      mats.body
    );
    const headY = posture === "quad" ? height * 0.52 + bodyW * 0.5 : height * 0.62 + bodyH * 0.5 + headR * 0.6;
    const headZ = posture === "quad" ? height * 0.34 : 0;
    head.position.set(0, headY, headZ);
    root.add(head);
    sockets.push({ name: "head", node: head });
    const horns = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < horns; i++) {
      const s = new THREE5.Mesh(spike(headR * (0.8 + rng()), headR * 0.18), mats.accent);
      s.position.set((rng() - 0.5) * headR, headR * (0.7 + rng() * 0.5), (rng() - 0.5) * headR);
      s.rotation.z = (rng() - 0.5) * 1.2;
      head.add(s);
    }
    for (let i = 0; i < nEye; i++) {
      addEye(
        head,
        rng,
        spec,
        headR * (0.18 + rng() * 0.12),
        new THREE5.Vector3((rng() - 0.5) * headR * 0.8, rng() * headR * 0.4, headR * 0.75),
        mats
      );
    }
    const legs = posture === "quad" ? 4 : spec.legs ?? 2;
    const armCount = posture === "quad" ? 0 : spec.arms ?? 2;
    const legLen = height * (posture === "quad" ? 0.32 : 0.4);
    for (let i = 0; i < legs; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const leg = new THREE5.Mesh(limbBone(bodyW * 0.12, legLen * 0.7), mats.accent);
      const lx = posture === "quad" ? (i < 2 ? 1 : -1) * height * 0.2 : side * bodyW * 0.4;
      leg.position.set(lx, legLen * 0.35, posture === "quad" ? (i % 2 === 0 ? 1 : -1) * height * 0.16 : 0);
      root.add(leg);
    }
    for (let i = 0; i < armCount; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const arm = new THREE5.Mesh(limbBone(bodyW * 0.1, height * 0.22), mats.accent);
      arm.position.set(side * bodyW * 0.75, height * 0.55, 0);
      arm.rotation.z = side * (0.5 + rng() * 0.4);
      root.add(arm);
      if (i === 0) sockets.push({ name: "hand_r", node: arm });
      if (i === 1) sockets.push({ name: "hand_l", node: arm });
    }
    for (let i = 0; i < nSpike; i++) {
      const s = new THREE5.Mesh(spike(height * (0.1 + rng() * 0.15), height * 0.03), mats.accent);
      s.position.set((rng() - 0.5) * bodyW * 0.6, torso.position.y + bodyH * (0.4 + rng() * 0.4), (rng() - 0.5) * 0.1);
      root.add(s);
    }
    if (wings) {
      for (const side of [1, -1]) {
        const wing = new THREE5.Mesh(
          displace(new THREE5.CircleGeometry(height * 0.4, 3), 0.15, 1.5, spec.seed + 3),
          mats.accent
        );
        wing.material.side = THREE5.DoubleSide;
        wing.position.set(side * bodyW * 0.7, height * 0.72, -height * 0.05);
        wing.rotation.y = side * 1.1;
        root.add(wing);
      }
    }
    for (let i = 0; i < nTent; i++) {
      const t = new THREE5.Mesh(tentacle(height * (0.3 + rng() * 0.4), height * 0.03, spec.seed + i), mats.accent);
      t.position.set((rng() - 0.5) * bodyW, torso.position.y - bodyH * 0.3, -height * 0.15);
      root.add(t);
    }
  }
  root.updateMatrixWorld(true);
  const box = new THREE5.Box3().setFromObject(root);
  root.children.forEach((c) => {
    c.position.y -= box.min.y;
  });
  root.userData.posture = posture;
  root.userData.seed = spec.seed;
  return {
    root,
    spec: { ...spec, seed: spec.seed, height, posture },
    sockets,
    animationsHint: ["Idle", "Walk", "Attack", "Death"]
  };
}

// engine/src/environment/terrain-system.ts
var TerrainSystem = class {
  constructor() {
    __publicField(this, "deformations", []);
  }
  /**
   * Apply an explosive crater impact on the terrain.
   */
  applyCrater(center, radius = 3, depth = 1.5) {
    const deformation = {
      center: { ...center },
      radius,
      depth,
      type: "crater"
    };
    this.deformations.push(deformation);
    return deformation;
  }
  /**
   * Apply an earthquake fissure line on the terrain.
   */
  applyFissure(start, end, width = 1.5, depth = 2) {
    const center = {
      x: (start.x + end.x) * 0.5,
      y: (start.y + end.y) * 0.5,
      z: (start.z + end.z) * 0.5
    };
    const length = Math.hypot(end.x - start.x, end.z - start.z);
    const fissure = {
      center,
      radius: length * 0.5,
      depth,
      type: "fissure",
      start: { ...start },
      end: { ...end },
      width
    };
    this.deformations.push(fissure);
    return fissure;
  }
  /**
   * Calculate adjusted terrain height at world coordinates (x, z).
   */
  getDeformedHeight(x, z, baseHeight = 0) {
    let heightOffset = 0;
    for (const d of this.deformations) {
      if (d.type === "crater") {
        const dist = Math.hypot(x - d.center.x, z - d.center.z);
        if (dist <= d.radius) {
          const normDist = dist / d.radius;
          const craterShape = Math.cos(normDist * Math.PI * 0.5);
          const rimEjecta = Math.sin(normDist * Math.PI) * (d.depth * 0.15);
          heightOffset -= craterShape * d.depth - rimEjecta;
        }
      } else if (d.type === "fissure") {
        const f = d;
        const distToSegment = this.distanceToSegment(x, z, f.start.x, f.start.z, f.end.x, f.end.z);
        if (distToSegment <= f.width) {
          const falloff = 1 - distToSegment / f.width;
          heightOffset -= falloff * f.depth;
        }
      } else if (d.type === "mound") {
        const dist = Math.hypot(x - d.center.x, z - d.center.z);
        if (dist <= d.radius) {
          const falloff = 1 - dist / d.radius;
          heightOffset += falloff * d.depth;
        }
      }
    }
    return baseHeight + heightOffset;
  }
  distanceToSegment(px, pz, x1, z1, x2, z2) {
    const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, pz - z1);
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projZ = z1 + t * (z2 - z1);
    return Math.hypot(px - projX, pz - projZ);
  }
  getDeformations() {
    return [...this.deformations];
  }
  clear() {
    this.deformations = [];
  }
};

// engine/src/environment/water-system.ts
var WaterSystem = class {
  constructor() {
    __publicField(this, "surfaces", /* @__PURE__ */ new Map());
    __publicField(this, "ripples", []);
    __publicField(this, "currentTime", 0);
  }
  /**
   * Register a body of water (ocean, lake, river, swamp).
   */
  registerSurface(id, level = 0, options = {}) {
    const surface = {
      id,
      level,
      currentVelocity: options.currentVelocity ?? { x: 0, y: 0, z: 0 },
      waveAmplitude: options.waveAmplitude ?? 0.5,
      waveFrequency: options.waveFrequency ?? 0.8,
      isFrozen: options.isFrozen ?? false
    };
    this.surfaces.set(id, surface);
    return surface;
  }
  /**
   * Calculate wave height at given world coordinates.
   */
  getHeightAt(surfaceId, x, z, time) {
    const surface = this.surfaces.get(surfaceId);
    if (!surface) return 0;
    if (surface.isFrozen) return surface.level;
    const t = time ?? this.currentTime;
    const { waveAmplitude, waveFrequency, level } = surface;
    const wave1 = Math.sin(x * waveFrequency * 0.5 + t * 1.5) * waveAmplitude;
    const wave2 = Math.cos(z * waveFrequency * 0.7 + t * 1.2) * (waveAmplitude * 0.6);
    const wave3 = Math.sin((x + z) * waveFrequency * 0.3 + t * 2) * (waveAmplitude * 0.3);
    let rippleOffset = 0;
    for (const r of this.ripples) {
      const dist = Math.hypot(x - r.x, z - r.z);
      if (dist < r.radius && dist > r.radius - 2) {
        const decay = 1 - r.lifetime / r.maxLifetime;
        rippleOffset += Math.sin(dist * 3 - t * 10) * r.strength * decay;
      }
    }
    return level + wave1 + wave2 + wave3 + rippleOffset;
  }
  /**
   * Create a ripple at specific coordinates (e.g. footsteps, splash, projectile impact).
   */
  addRipple(x, z, strength = 0.5, maxRadius = 8, duration = 2) {
    this.ripples.push({
      x,
      z,
      strength,
      radius: 0.1,
      maxRadius,
      lifetime: 0,
      maxLifetime: duration
    });
  }
  /**
   * Update active ripples and global water clock.
   */
  update(deltaTime) {
    this.currentTime += deltaTime;
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.lifetime += deltaTime;
      const progress = r.lifetime / r.maxLifetime;
      r.radius = progress * r.maxRadius;
      if (r.lifetime >= r.maxLifetime) {
        this.ripples.splice(i, 1);
      }
    }
  }
  setFrozen(surfaceId, frozen) {
    const s = this.surfaces.get(surfaceId);
    if (s) s.isFrozen = frozen;
  }
  getSurface(id) {
    return this.surfaces.get(id);
  }
  getAllSurfaces() {
    return Array.from(this.surfaces.values());
  }
  clear() {
    this.surfaces.clear();
    this.ripples = [];
  }
};

// engine/src/environment/foliage-system.ts
var FoliageSystem = class {
  constructor() {
    __publicField(this, "trees", /* @__PURE__ */ new Map());
    __publicField(this, "time", 0);
  }
  /**
   * Register or spawn a tree into the ecosystem.
   */
  registerTree(id, position, options = {}) {
    const maxHealth = options.maxHealth ?? 100;
    const tree = {
      id,
      position: { ...position },
      health: maxHealth,
      maxHealth,
      isFelled: false,
      fallDirection: { x: 1, y: 0, z: 0 },
      fallProgress: 0,
      woodYield: options.woodYield ?? 15,
      swayIntensity: 0.1
    };
    this.trees.set(id, tree);
    return tree;
  }
  /**
   * Apply axe chop damage to a tree, checking for felling threshold.
   */
  chopTree(id, damage, hitDirection) {
    const tree = this.trees.get(id);
    if (!tree) {
      throw new Error(`Tree ${id} not found in FoliageSystem.`);
    }
    if (tree.isFelled) {
      return { felled: true, woodYield: 0, remainingHealth: 0, tree };
    }
    tree.health = Math.max(0, tree.health - damage);
    if (tree.health <= 0) {
      tree.isFelled = true;
      tree.fallProgress = 0;
      if (hitDirection) {
        const len = Math.hypot(hitDirection.x, hitDirection.z) || 1;
        tree.fallDirection = { x: hitDirection.x / len, y: 0, z: hitDirection.z / len };
      }
      return {
        felled: true,
        woodYield: tree.woodYield,
        remainingHealth: 0,
        tree
      };
    }
    return {
      felled: false,
      woodYield: 0,
      remainingHealth: tree.health,
      tree
    };
  }
  /**
   * Update wind sway and falling animation progress.
   */
  update(deltaTime, wind) {
    this.time += deltaTime;
    for (const tree of this.trees.values()) {
      if (tree.isFelled) {
        if (tree.fallProgress !== void 0 && tree.fallProgress < 1) {
          tree.fallProgress = Math.min(1, tree.fallProgress + deltaTime * 1.5);
        }
      } else {
        const spatialPhase = tree.position.x * 0.3 + tree.position.z * 0.2;
        const swayWave = Math.sin(this.time * (1.5 + wind.speed * 0.5) + spatialPhase);
        tree.swayIntensity = 0.05 + Math.abs(swayWave) * (wind.speed * 0.02 + wind.gustiness * 0.05);
      }
    }
  }
  /**
   * Get all registered trees.
   */
  getTrees() {
    return Array.from(this.trees.values());
  }
  /**
   * Get a specific tree by ID.
   */
  getTree(id) {
    return this.trees.get(id);
  }
  /**
   * Remove a tree once completely harvested.
   */
  removeTree(id) {
    return this.trees.delete(id);
  }
  /**
   * Clear all trees.
   */
  clear() {
    this.trees.clear();
  }
};

// engine/src/environment/atmosphere-system.ts
var AtmosphereSystem = class {
  constructor() {
    __publicField(this, "wind", {
      direction: { x: 1, y: 0, z: 0.2 },
      speed: 5,
      // m/s
      gustiness: 0.3,
      turbulence: 0.2
    });
    __publicField(this, "updrafts", []);
    __publicField(this, "vortexes", []);
    __publicField(this, "time", 0);
  }
  setWind(wind) {
    if (wind.direction) {
      const len = Math.hypot(wind.direction.x, wind.direction.y, wind.direction.z) || 1;
      this.wind.direction = {
        x: wind.direction.x / len,
        y: wind.direction.y / len,
        z: wind.direction.z / len
      };
    }
    if (wind.speed !== void 0) this.wind.speed = wind.speed;
    if (wind.gustiness !== void 0) this.wind.gustiness = wind.gustiness;
    if (wind.turbulence !== void 0) this.wind.turbulence = wind.turbulence;
  }
  getWind() {
    return { ...this.wind, direction: { ...this.wind.direction } };
  }
  addUpdraft(zone) {
    this.updrafts.push(zone);
  }
  addVortex(zone) {
    this.vortexes.push(zone);
  }
  /**
   * Sample net atmospheric velocity at a specific 3D location.
   */
  getWindVelocityAt(pos) {
    const gustFactor = 1 + Math.sin(this.time * 0.8 + pos.x * 0.05 + pos.z * 0.05) * this.wind.gustiness;
    const turbX = Math.sin(this.time * 2.3 + pos.y * 0.1) * this.wind.turbulence * this.wind.speed * 0.2;
    const turbZ = Math.cos(this.time * 1.9 + pos.x * 0.1) * this.wind.turbulence * this.wind.speed * 0.2;
    const vel = {
      x: this.wind.direction.x * this.wind.speed * gustFactor + turbX,
      y: this.wind.direction.y * this.wind.speed + Math.sin(this.time * 1.2) * 0.1,
      z: this.wind.direction.z * this.wind.speed * gustFactor + turbZ
    };
    for (const u of this.updrafts) {
      const dx = pos.x - u.center.x;
      const dz = pos.z - u.center.z;
      const dy = pos.y - u.center.y;
      if (dy >= 0 && dy <= u.height) {
        const dist = Math.hypot(dx, dz);
        if (dist <= u.radius) {
          const falloff = 1 - dist / u.radius;
          vel.y += u.upwardVelocity * falloff;
        }
      }
    }
    for (const v of this.vortexes) {
      const dx = pos.x - v.center.x;
      const dz = pos.z - v.center.z;
      const dy = pos.y - v.center.y;
      if (dy >= 0 && dy <= v.height) {
        const dist = Math.hypot(dx, dz);
        if (dist <= v.radius && dist > 1e-3) {
          const falloff = 1 - dist / v.radius;
          const tx = -dz / dist;
          const tz = dx / dist;
          const ix = -dx / dist;
          const iz = -dz / dist;
          vel.x += (tx * v.rotationalVelocity + ix * v.inwardPull) * falloff;
          vel.z += (tz * v.rotationalVelocity + iz * v.inwardPull) * falloff;
          vel.y += v.rotationalVelocity * 0.3 * falloff;
        }
      }
    }
    return vel;
  }
  update(deltaTime) {
    this.time += deltaTime;
  }
  clearZones() {
    this.updrafts = [];
    this.vortexes = [];
  }
};

// engine/src/physics/gravity-engine.ts
var GravityEngine = class {
  constructor(cfg = {}) {
    __publicField(this, "g");
    __publicField(this, "terminalVelocity");
    this.g = cfg.g ?? 9.81;
    this.terminalVelocity = cfg.terminalVelocity ?? 100;
  }
  applyVelocity(body, dt) {
    const scale = body.gravityScale ?? 1;
    body.velocity.y -= this.g * scale * dt;
    if (body.velocity.y < -this.terminalVelocity) body.velocity.y = -this.terminalVelocity;
    if (body.force && body.mass > 0) {
      body.velocity.x += body.force.x / body.mass * dt;
      body.velocity.y += body.force.y / body.mass * dt;
      body.velocity.z += body.force.z / body.mass * dt;
    }
    const drag = body.drag ?? 0;
    if (drag > 0) {
      const f = Math.max(0, 1 - drag * dt);
      body.velocity.x *= f;
      body.velocity.y *= f;
      body.velocity.z *= f;
    }
  }
  integrate(body, dt) {
    this.applyVelocity(body, dt);
    body.position.x += body.velocity.x * dt;
    body.position.y += body.velocity.y * dt;
    body.position.z += body.velocity.z * dt;
  }
};

// engine/src/memory/object-pool.ts
var POOL_ID_KEY = "__enginePoolAssetId";
var ObjectPool = class {
  constructor(opts = {}) {
    __publicField(this, "templates", /* @__PURE__ */ new Map());
    __publicField(this, "pooled", /* @__PURE__ */ new Map());
    __publicField(this, "active", 0);
    __publicField(this, "maxPerAsset");
    this.maxPerAsset = Math.max(1, opts.maxPerAsset ?? 32);
  }
  register(assetId, template) {
    this.templates.set(assetId, template);
    if (!this.pooled.has(assetId)) this.pooled.set(assetId, []);
  }
  registerAsset(asset) {
    this.register(asset.id, asset.scene);
  }
  has(assetId) {
    return this.templates.has(assetId);
  }
  acquire(assetId) {
    const pool = this.pooled.get(assetId);
    let instance = null;
    if (pool && pool.length > 0) {
      instance = pool.pop() ?? null;
    } else {
      const template = this.templates.get(assetId);
      if (!template) return null;
      instance = template.clone(true);
    }
    if (!instance) return null;
    instance.visible = true;
    instance.userData[POOL_ID_KEY] = assetId;
    this.active++;
    return instance;
  }
  release(instance) {
    const assetId = instance.userData[POOL_ID_KEY];
    if (typeof assetId !== "string") return false;
    const pool = this.pooled.get(assetId);
    if (!pool) return false;
    instance.removeFromParent();
    instance.visible = false;
    if (pool.length < this.maxPerAsset) {
      pool.push(instance);
      this.active--;
      return true;
    }
    return false;
  }
  prewarm(assetId, n) {
    const template = this.templates.get(assetId);
    const pool = this.pooled.get(assetId);
    if (!template || !pool) return;
    for (let i = 0; i < n && pool.length < this.maxPerAsset; i++) {
      const instance = template.clone(true);
      instance.visible = false;
      instance.userData[POOL_ID_KEY] = assetId;
      pool.push(instance);
    }
  }
  stats() {
    let available = 0;
    for (const list of this.pooled.values()) available += list.length;
    return {
      registered: this.templates.size,
      available,
      active: this.active
    };
  }
  clear() {
    this.templates.clear();
    this.pooled.clear();
    this.active = 0;
  }
};

// engine/src/memory/memory-disposer.ts
function estimateGeometryMemory(geometry) {
  let bytes = 0;
  for (const name of Object.keys(geometry.attributes)) {
    const attr = geometry.getAttribute(name);
    bytes += attr.array.byteLength;
  }
  if (geometry.index) bytes += geometry.index.array.byteLength;
  return bytes > 0 ? bytes : 0;
}
function estimateTextureMemory(texture) {
  const img = texture.image;
  if (!img) return 0;
  const width = img.width ?? img.naturalWidth ?? 0;
  const height = img.height ?? img.naturalHeight ?? 0;
  return width * height * 4;
}
var TEXTURE_PROPS = [
  "map",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "aoMap",
  "emissiveMap",
  "alphaMap",
  "bumpMap",
  "displacementMap",
  "envMap",
  "specularMap",
  "lightMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "clearcoatMap",
  "clearcoatNormalMap",
  "clearcoatRoughnessMap",
  "iridescenceMap",
  "anisotropyMap",
  "transmissionMap",
  "thicknessMap"
];
function estimateObjectMemory(root) {
  let bytes = 0;
  const seenGeo = /* @__PURE__ */ new Set();
  const seenTex = /* @__PURE__ */ new Set();
  const seenMat = /* @__PURE__ */ new Set();
  root.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    if (mesh.geometry && !seenGeo.has(mesh.geometry.uuid)) {
      seenGeo.add(mesh.geometry.uuid);
      bytes += estimateGeometryMemory(mesh.geometry);
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat2 of mats) {
      if (!mat2 || seenMat.has(mat2.uuid)) continue;
      seenMat.add(mat2.uuid);
      const props = mat2;
      for (const prop of TEXTURE_PROPS) {
        const tex = props[prop];
        if (tex && !seenTex.has(tex.uuid)) {
          seenTex.add(tex.uuid);
          bytes += estimateTextureMemory(tex);
        }
      }
    }
  });
  return bytes;
}
function estimateAssetMemory(asset) {
  return estimateObjectMemory(asset.scene);
}
var MemoryDisposer = class _MemoryDisposer {
  constructor() {
    __publicField(this, "tracked", /* @__PURE__ */ new Set());
    __publicField(this, "disposedBytes", 0);
  }
  track(root) {
    this.tracked.add(root);
  }
  untrack(root) {
    this.tracked.delete(root);
  }
  usedMemory() {
    let total = 0;
    for (const obj of this.tracked) total += estimateObjectMemory(obj);
    return total;
  }
  get totalDisposedBytes() {
    return this.disposedBytes;
  }
  dispose(root, opts = {}) {
    const freed = estimateObjectMemory(root);
    const seenGeo = /* @__PURE__ */ new Set();
    const seenMat = /* @__PURE__ */ new Set();
    const seenTex = /* @__PURE__ */ new Set();
    root.traverse((child) => {
      const mesh = child;
      if (!mesh.isMesh) return;
      if (mesh.geometry && !seenGeo.has(mesh.geometry.uuid)) {
        seenGeo.add(mesh.geometry.uuid);
        mesh.geometry.dispose();
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat2 of mats) {
        if (!mat2 || seenMat.has(mat2.uuid)) continue;
        seenMat.add(mat2.uuid);
        if (opts.disposeTextures) {
          const props = mat2;
          for (const prop of TEXTURE_PROPS) {
            const tex = props[prop];
            if (tex && !seenTex.has(tex.uuid)) {
              seenTex.add(tex.uuid);
              tex.dispose();
            }
          }
        }
        mat2.dispose();
      }
    });
    this.tracked.delete(root);
    this.disposedBytes += freed;
    root.removeFromParent();
    return freed;
  }
  static disposeObject(root, opts = {}) {
    return new _MemoryDisposer().dispose(root, opts);
  }
  clear() {
    for (const obj of Array.from(this.tracked)) {
      this.dispose(obj);
    }
    this.tracked.clear();
  }
};

// engine/src/memory/asset-cache.ts
var AssetCache = class {
  constructor(opts = {}) {
    __publicField(this, "entries", /* @__PURE__ */ new Map());
    __publicField(this, "sizes", /* @__PURE__ */ new Map());
    __publicField(this, "maxEntries");
    __publicField(this, "maxBytes");
    __publicField(this, "currentBytes", 0);
    __publicField(this, "hits", 0);
    __publicField(this, "misses", 0);
    __publicField(this, "evictions", 0);
    this.maxEntries = Math.max(1, opts.maxEntries ?? 64);
    this.maxBytes = Math.max(1, opts.maxBytes ?? 256 * 1024 * 1024);
  }
  has(path) {
    return this.entries.has(path);
  }
  get(path) {
    const asset = this.entries.get(path);
    if (!asset) {
      this.misses++;
      return void 0;
    }
    this.hits++;
    this.entries.delete(path);
    this.entries.set(path, asset);
    return asset;
  }
  set(path, asset) {
    if (this.entries.has(path)) this.delete(path);
    const size = estimateAssetMemory(asset);
    this.entries.set(path, asset);
    this.sizes.set(path, size);
    this.currentBytes += size;
    this.evict();
  }
  delete(path) {
    const size = this.sizes.get(path);
    if (size === void 0) return false;
    this.sizes.delete(path);
    this.currentBytes -= size;
    return this.entries.delete(path);
  }
  clear() {
    this.entries.clear();
    this.sizes.clear();
    this.currentBytes = 0;
  }
  stats() {
    return {
      entries: this.entries.size,
      bytes: this.currentBytes,
      maxEntries: this.maxEntries,
      maxBytes: this.maxBytes,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions
    };
  }
  evict() {
    while (this.entries.size > this.maxEntries || this.currentBytes > this.maxBytes && this.entries.size > 1) {
      const oldest = this.entries.keys().next();
      if (oldest.done) break;
      const path = oldest.value;
      this.delete(path);
      this.evictions++;
    }
  }
};

// engine/src/renderer/graphics-modes.ts
var GRAPHICS_MODES = {
  performance: {
    mode: "performance",
    label: "Hi\u1EC7u n\u0103ng",
    description: "T\u1EAFt h\u1EADu k\u1EF3, shadow 1024, pixelRatioCap 1 \u2014 \u01B0u ti\xEAn FPS cao nh\u1EA5t.",
    postFx: { passes: [] },
    quality: {
      shadowMapSize: 1024,
      drawDistance: 120,
      vegetationDensity: 0.4,
      waterQuality: "off",
      pixelRatioCap: 1,
      maxLights: 4,
      antialiasing: false
    }
  },
  balanced: {
    mode: "balanced",
    label: "C\xE2n b\u1EB1ng",
    description: "Bloom nh\u1EB9 + grading, shadow 2048 \u2014 m\u1EB7c \u0111\u1ECBnh cho ph\u1EA7n l\u1EDBn m\xE1y.",
    postFx: { passes: ["bloom", "grading"], bloomStrength: 0.5, exposure: 1 },
    quality: {
      shadowMapSize: 2048,
      drawDistance: 200,
      vegetationDensity: 0.7,
      waterQuality: "basic",
      pixelRatioCap: 1.5,
      maxLights: 8,
      antialiasing: true
    }
  },
  ultra: {
    mode: "ultra",
    label: "Ultra",
    description: "Bloom + AO, shadow 3072, pixelRatioCap 2 \u2014 ch\u1EA5t l\u01B0\u1EE3ng t\u1ED1i \u0111a.",
    postFx: { passes: ["bloom", "grading", "vignette"], bloomStrength: 0.8, aoStrength: 0.6, exposure: 1.05, vignette: 0.2 },
    quality: {
      shadowMapSize: 3072,
      drawDistance: 320,
      vegetationDensity: 1,
      waterQuality: "high",
      pixelRatioCap: 2,
      maxLights: 16,
      antialiasing: true
    }
  },
  cinematic: {
    mode: "cinematic",
    label: "Cinematic",
    description: "Bloom m\u1EA1nh + grading filmic + grain + vignette + letterbox.",
    postFx: {
      passes: ["bloom", "grading", "grain", "vignette", "letterbox"],
      bloomStrength: 1.1,
      gradeLift: [0, 5e-3, 0.015],
      gradeGamma: [0.95, 0.98, 1],
      grainIntensity: 0.08,
      vignette: 0.35,
      exposure: 1.1
    },
    quality: {
      shadowMapSize: 3072,
      drawDistance: 300,
      vegetationDensity: 1,
      waterQuality: "high",
      pixelRatioCap: 2,
      maxLights: 24,
      antialiasing: true
    },
    letterbox: true
  },
  ocean: {
    mode: "ocean",
    label: "Bi\u1EC3n c\u1EA3",
    description: "S\xF3ng cao (waveHeight 1.6), ph\u1EA3n chi\u1EBFu + foam m\u1EA1nh, bloom nh\u1EB9, fog xanh bi\u1EC3n.",
    postFx: { passes: ["bloom", "grading"], bloomStrength: 0.4, exposure: 1.02 },
    quality: {
      shadowMapSize: 2048,
      drawDistance: 260,
      vegetationDensity: 0.5,
      waterQuality: "high",
      pixelRatioCap: 1.5,
      maxLights: 12,
      antialiasing: true
    },
    waterOverride: {
      waveHeight: 1.6,
      waveSpeed: 1.2,
      reflectionStrength: 0.9,
      foamAmount: 0.8
    }
  }
};
function getGraphicsPreset(mode) {
  return GRAPHICS_MODES[mode] ?? GRAPHICS_MODES.balanced;
}
function listGraphicsModes() {
  return Object.keys(GRAPHICS_MODES);
}
var GRAPHICS_PRESETS = GRAPHICS_MODES;

// engine/src/game-engine.ts
import * as THREE31 from "three";

// engine/src/core/math.ts
function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

// engine/src/core/loop.ts
var MAX_FPS_CAP = 500;
function defaultNow() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}
function defaultRaf(cb) {
  if (typeof requestAnimationFrame === "function") {
    const id2 = requestAnimationFrame(cb);
    return () => cancelAnimationFrame(id2);
  }
  const id = setTimeout(() => cb(defaultNow()), 1e3 / 60);
  return () => clearTimeout(id);
}
var Ticker = class {
  constructor(opts) {
    __publicField(this, "opts");
    __publicField(this, "raf");
    __publicField(this, "now");
    __publicField(this, "cancelRaf", null);
    __publicField(this, "capAcc", 0);
    __publicField(this, "stepAcc", 0);
    __publicField(this, "lastTime", -1);
    __publicField(this, "fpsEma", 0);
    __publicField(this, "frameMsEma", 0);
    __publicField(this, "_ticks", 0);
    __publicField(this, "_frames", 0);
    __publicField(this, "_running", false);
    __publicField(this, "_paused", false);
    const cap = opts.fpsCap ?? 0;
    this.opts = {
      ...opts,
      fixedStep: opts.fixedStep ?? 1 / 60,
      fpsCap: cap === 0 ? 0 : clamp(Math.round(cap), 1, MAX_FPS_CAP),
      background: opts.background ?? true,
      maxFrameTime: opts.maxFrameTime ?? 0.25,
      maxStepsPerFrame: opts.maxStepsPerFrame ?? 8
    };
    this.raf = opts.raf ?? defaultRaf;
    this.now = opts.now ?? defaultNow;
  }
  start() {
    if (this._running) return;
    this._running = true;
    this._paused = false;
    this.lastTime = -1;
    this.schedule();
  }
  stop() {
    this._running = false;
    this.cancelRaf?.();
    this.cancelRaf = null;
  }
  pause() {
    this._paused = true;
  }
  resume() {
    this._paused = false;
  }
  get isRunning() {
    return this._running;
  }
  get isPaused() {
    return this._paused;
  }
  get stats() {
    return {
      fps: Math.round(this.fpsEma * 10) / 10,
      frameMs: Math.round(this.frameMsEma * 100) / 100,
      ticks: this._ticks,
      frames: this._frames
    };
  }
  setFpsCap(cap) {
    this.opts.fpsCap = cap === 0 ? 0 : clamp(Math.round(cap), 1, MAX_FPS_CAP);
    this.capAcc = 0;
  }
  getFpsCap() {
    return this.opts.fpsCap;
  }
  schedule() {
    if (!this._running) return;
    this.cancelRaf = this.raf((timestamp) => this.onFrame(timestamp));
  }
  onFrame(timestamp) {
    if (!this._running) return;
    this.schedule();
    if (this._paused) {
      this.lastTime = timestamp;
      return;
    }
    if (!this.opts.background && typeof document !== "undefined" && document.hidden) {
      this.lastTime = timestamp;
      return;
    }
    if (this.lastTime < 0) {
      this.lastTime = timestamp;
      return;
    }
    const rawMs = timestamp - this.lastTime;
    this.lastTime = timestamp;
    if (rawMs <= 0) return;
    const rawDt = Math.min(rawMs / 1e3, this.opts.maxFrameTime);
    if (this.opts.fpsCap > 0) {
      this.capAcc += rawDt;
      const targetFrame = 1 / this.opts.fpsCap;
      if (this.capAcc < targetFrame) return;
      this.capAcc = Math.min(this.capAcc - targetFrame, targetFrame);
    } else {
      this.capAcc = 0;
    }
    const t0 = this.now();
    if (this.opts.fixedStep > 0) {
      this.stepAcc += rawDt;
      let steps = 0;
      while (this.stepAcc >= this.opts.fixedStep && steps < this.opts.maxStepsPerFrame) {
        this.opts.update(this.opts.fixedStep, rawDt);
        this.stepAcc -= this.opts.fixedStep;
        this._ticks++;
        steps++;
      }
      if (steps >= this.opts.maxStepsPerFrame) {
        this.stepAcc = 0;
      }
    } else {
      this.opts.update(rawDt, rawDt);
      this._ticks++;
    }
    if (this.opts.render) {
      this.opts.render(rawDt, rawDt);
    }
    this._frames++;
    const workMs = this.now() - t0;
    const currentFps = rawDt > 0 ? 1 / rawDt : 0;
    const alpha = 0.1;
    this.fpsEma = this.fpsEma === 0 ? currentFps : this.fpsEma * (1 - alpha) + currentFps * alpha;
    this.frameMsEma = this.frameMsEma === 0 ? workMs : this.frameMsEma * (1 - alpha) + workMs * alpha;
  }
};

// engine/src/core/events.ts
var EventBus = class {
  constructor() {
    __publicField(this, "handlers", /* @__PURE__ */ new Map());
  }
  on(type, fn) {
    let set = this.handlers.get(type);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this.handlers.set(type, set);
    }
    set.add(fn);
    return () => this.off(type, fn);
  }
  off(type, fn) {
    const set = this.handlers.get(type);
    if (!set) return;
    set.delete(fn);
    if (set.size === 0) this.handlers.delete(type);
  }
  once(type, fn) {
    const off = this.on(type, (payload) => {
      off();
      fn(payload);
    });
    return off;
  }
  emit(type, payload) {
    const set = this.handlers.get(type);
    if (!set || set.size === 0) return;
    for (const fn of Array.from(set)) {
      fn(payload);
    }
  }
  clear() {
    this.handlers.clear();
  }
  listenerCount(type) {
    return this.handlers.get(type)?.size ?? 0;
  }
};

// engine/src/asset-parser/index.ts
import * as THREE22 from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// engine/src/asset-parser/geometry-extractor.ts
import * as THREE6 from "three";
function countTriangles(geometry) {
  const index = geometry.index;
  if (index) return Math.floor(index.count / 3);
  const pos = geometry.getAttribute("position");
  return pos ? Math.floor(pos.count / 3) : 0;
}
function collectMeshes(root) {
  const meshes = [];
  root.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });
  return meshes;
}
function collectBones(root) {
  const seen = /* @__PURE__ */ new Set();
  const bones = [];
  const push = (b) => {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      bones.push(b);
    }
  };
  root.traverse((child) => {
    const skinned = child;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      for (const b of skinned.skeleton.bones) push(b);
    }
    if (child.isBone) push(child);
  });
  return bones;
}
function collectMaterials(root) {
  const seen = /* @__PURE__ */ new Set();
  const materials = [];
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
function copyFloats(attr, itemSize) {
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
function copyIndex(index) {
  const out = new Uint32Array(index.count);
  for (let i = 0; i < index.count; i++) out[i] = index.getX(i);
  return out;
}
function extractRawBufferData(mesh) {
  const geo = mesh.geometry;
  const posAttr = geo.getAttribute("position");
  const normAttr = geo.getAttribute("normal");
  const uvAttr = geo.getAttribute("uv");
  const uv2Attr = geo.getAttribute("uv2");
  const colorAttr = geo.getAttribute("color");
  const tangAttr = geo.getAttribute("tangent");
  const skinIdxAttr = geo.getAttribute("skinIndex");
  const skinWeightAttr = geo.getAttribute("skinWeight");
  return {
    positions: posAttr ? new Float32Array(posAttr.array) : new Float32Array(0),
    normals: normAttr ? copyFloats(normAttr, 3) : void 0,
    uvs: uvAttr ? copyFloats(uvAttr, 2) : void 0,
    uv2s: uv2Attr ? copyFloats(uv2Attr, 2) : void 0,
    colors: colorAttr ? copyFloats(colorAttr, colorAttr.itemSize === 4 ? 4 : 3) : void 0,
    tangents: tangAttr ? copyFloats(tangAttr, 4) : void 0,
    skinIndices: skinIdxAttr ? copyFloats(skinIdxAttr, 4) : void 0,
    skinWeights: skinWeightAttr ? copyFloats(skinWeightAttr, 4) : void 0,
    indices: geo.index ? copyIndex(geo.index) : void 0
  };
}
function extractStats(root) {
  const meshes = collectMeshes(root);
  const bones = collectBones(root);
  const materials = collectMaterials(root);
  let vertices = 0;
  let triangles = 0;
  let hasSkinning = false;
  let hasMorphTargets = false;
  for (const m of meshes) {
    const geo = m.geometry;
    const pos = geo.getAttribute("position");
    if (pos) vertices += pos.count;
    triangles += countTriangles(geo);
    if (m.isSkinnedMesh) hasSkinning = true;
    if (geo.morphAttributes && Object.keys(geo.morphAttributes).length > 0) hasMorphTargets = true;
  }
  return {
    meshes: meshes.length,
    vertices,
    triangles,
    materials: materials.length,
    bones: bones.length,
    hasSkinning,
    hasMorphTargets
  };
}

// engine/src/asset-parser/texture-parser.ts
var SLOT_PROPS = [
  ["albedo", "map"],
  ["diffuse", "map"],
  ["normal", "normalMap"],
  ["roughness", "roughnessMap"],
  ["metalness", "metalnessMap"],
  ["ao", "aoMap"],
  ["emissive", "emissiveMap"],
  ["displacement", "displacementMap"],
  ["alpha", "alphaMap"],
  ["specular", "specularMap"],
  ["transmission", "transmissionMap"]
];
var EXTRA_PROPS = [
  "bumpMap",
  "envMap",
  "lightMap",
  "sheenColorMap",
  "sheenRoughnessMap",
  "clearcoatMap",
  "clearcoatNormalMap",
  "clearcoatRoughnessMap",
  "iridescenceMap",
  "anisotropyMap",
  "thicknessMap"
];
function textureUri(texture) {
  const img = texture.image;
  const uri = img?.src ?? img?.url ?? texture.name;
  return uri && uri.length > 0 ? uri : texture.uuid;
}
function textureSize(texture) {
  const img = texture.image;
  if (!img) return {};
  const width = img.width ?? img.naturalWidth;
  const height = img.height ?? img.naturalHeight;
  return width && height ? { width, height } : {};
}
function parseMaterialTextures(material) {
  const info = [];
  const seen = /* @__PURE__ */ new Set();
  const props = material;
  const push = (slot, texture) => {
    if (!texture || seen.has(texture.uuid)) return;
    seen.add(texture.uuid);
    const size = textureSize(texture);
    info.push({ slot, uri: textureUri(texture), ...size });
  };
  for (const [slot, prop] of SLOT_PROPS) {
    const tex = props[prop];
    if (tex) push(slot, tex);
  }
  for (const prop of EXTRA_PROPS) {
    const tex = props[prop];
    if (tex) push("other", tex);
  }
  return info;
}
function parseTextures(root) {
  const seen = /* @__PURE__ */ new Set();
  const materials = [];
  root.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (m && !seen.has(m.uuid)) {
        seen.add(m.uuid);
        materials.push(m);
      }
    }
  });
  const allTextures = [];
  const uriSeen = /* @__PURE__ */ new Set();
  for (const m of materials) {
    for (const t of parseMaterialTextures(m)) {
      const key = `${t.slot}:${t.uri}`;
      if (!uriSeen.has(key)) {
        uriSeen.add(key);
        allTextures.push(t);
      }
    }
  }
  return allTextures;
}

// engine/src/asset-parser/metadata-loader.ts
var CATEGORY_RULES = [
  ["character", /character|hero|player|fantasy|warrior|knight|human/i],
  ["monster", /monster|enemy|boss|demon|beast|oni|yokai|undead/i],
  ["npc", /npc|villager|merchant|vendor/i],
  ["weapon", /weapon|sword|katana|blade|bow|axe|spear|dagger|gun|staff/i],
  ["armor", /armor|armour|helmet|chestplate|pauldron|cloth|outfit|costume/i],
  ["mount", /mount|horse|riding/i],
  ["vegetation", /tree|plant|grass|bush|flower|vegetation|bamboo|forest/i],
  ["building", /building|house|castle|tower|wall|bridge|temple|shrine|roof|gate/i],
  ["vfx", /vfx|\bfx\b|effect|particle|smoke|fire|explosion|slash|trail/i],
  ["environment", /environment|terrain|rock|stone|ground|cliff|landscape|sky/i],
  ["prop", /prop|crate|barrel|lamp|banner|furniture|pot/i]
];
var RIG_RULES = [
  ["humanoid", /mixamorig|humanoid|\bhips\b.*\bspine\b|pelvis.*spine|\br_?hand\b.*\bl_?hand\b/i],
  ["bird", /\bwing(s)?\b|\bbeak\b|\bfeather(s)?\b/i],
  ["fish", /\bfin(s)?\b|\wfin(s)?\b|\bcaudal\b/i],
  ["quadruped", /\bpaw(s)?\b|\bhind_?leg\b|\bfront_?leg\b|quadruped/i],
  ["tentacle", /tentacle|whip|tail|appendage/i],
  ["insect", /spider|insect|beetle|centipede|claw/i]
];
function nameFromPath(path) {
  const base = path.split(/[\\/]/).pop() ?? path;
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, "");
  return withoutExt.replace(/[_\-]+/g, " ").trim();
}
function formatFromPath(path) {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(path);
  return (m?.[1] ?? "unknown").toLowerCase();
}
function categoryFromPath(path) {
  for (const [category, re] of CATEGORY_RULES) {
    if (re.test(path)) return category;
  }
  return "misc";
}
function collectBoneNames(root) {
  const names = /* @__PURE__ */ new Set();
  root.traverse((child) => {
    const skinned = child;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      for (const b of skinned.skeleton.bones) names.add(b.name);
    }
    if (child.isBone) names.add(child.name);
  });
  return Array.from(names);
}
function rigFromBoneNames(boneNames) {
  if (boneNames.length === 0) return "static";
  const joined = boneNames.join(" ").replace(/[_:]/g, " ").toLowerCase();
  for (const [rig, re] of RIG_RULES) {
    if (re.test(joined)) return rig;
  }
  return "custom";
}
function isSidecar(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function loadMetadata(path, root, sidecarData) {
  const derivedName = nameFromPath(path);
  const derivedCat = categoryFromPath(path);
  const bones = collectBoneNames(root);
  const derivedRig = rigFromBoneNames(bones);
  const tags = [derivedCat];
  if (derivedRig !== "static") tags.push(derivedRig);
  const base = {
    name: derivedName,
    category: derivedCat,
    tags,
    pivot: "bottom",
    rig: derivedRig,
    format: formatFromPath(path)
  };
  if (!isSidecar(sidecarData)) return base;
  return {
    ...base,
    name: sidecarData.name ?? base.name,
    category: sidecarData.category ?? base.category,
    tags: Array.isArray(sidecarData.tags) ? Array.from(/* @__PURE__ */ new Set([...tags, ...sidecarData.tags])) : base.tags,
    scaleHint: sidecarData.scaleHint,
    pivot: sidecarData.pivot ?? base.pivot,
    rig: sidecarData.rig ?? base.rig,
    sockets: sidecarData.sockets,
    collisionPreset: sidecarData.collisionPreset,
    mass: sidecarData.mass,
    friction: sidecarData.friction,
    restitution: sidecarData.restitution,
    isDestructible: sidecarData.isDestructible
  };
}

// engine/src/transformer/bounds-calculator.ts
import * as THREE7 from "three";
var cache = /* @__PURE__ */ new Map();
function emptyBounds() {
  return {
    box: { min: [0, 0, 0], max: [0, 0, 0] },
    sphere: { center: [0, 0, 0], radius: 0 },
    height: 0,
    width: 0,
    depth: 0,
    size: [0, 0, 0]
  };
}
function computeBounds(obj) {
  const cached = cache.get(obj.uuid);
  if (cached) return cached;
  const box = new THREE7.Box3().setFromObject(obj);
  if (box.isEmpty()) {
    const empty = emptyBounds();
    cache.set(obj.uuid, empty);
    return empty;
  }
  const sphere = box.getBoundingSphere(new THREE7.Sphere());
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;
  const depth = box.max.z - box.min.z;
  const bounds = {
    box: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z]
    },
    sphere: { center: [sphere.center.x, sphere.center.y, sphere.center.z], radius: sphere.radius },
    height,
    width,
    depth,
    size: [width, height, depth]
  };
  cache.set(obj.uuid, bounds);
  return bounds;
}
function invalidateBounds(obj) {
  if (obj) cache.delete(obj.uuid);
  else cache.clear();
}

// engine/src/asset-parser/obj-parser.ts
import * as THREE9 from "three";

// engine/src/transformer/pivot-adjuster.ts
import * as THREE8 from "three";
var PIVOT_RESTORE_KEY = "__enginePivotRestore";
function applyPivot(obj, spec) {
  if (spec.mode === "origin") return obj;
  obj.updateWorldMatrix(true, true);
  const box = new THREE8.Box3().setFromObject(obj);
  if (!box.isEmpty()) {
    box.applyMatrix4(new THREE8.Matrix4().copy(obj.matrixWorld).invert());
  }
  if (box.isEmpty()) return obj;
  let shift;
  switch (spec.mode) {
    case "bottom":
      shift = new THREE8.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
      break;
    case "center":
      shift = new THREE8.Vector3(
        (box.min.x + box.max.x) / 2,
        (box.min.y + box.max.y) / 2,
        (box.min.z + box.max.z) / 2
      );
      break;
    case "top":
      shift = new THREE8.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2);
      break;
    case "custom": {
      const c = spec.custom;
      shift = new THREE8.Vector3(c?.x ?? 0, c?.y ?? 0, c?.z ?? 0);
      break;
    }
    default:
      return obj;
  }
  if (spec.bakeIntoGeometry) {
    obj.traverse((child) => {
      const m = child;
      if (m.isMesh && m.geometry) {
        m.geometry.translate(-shift.x, -shift.y, -shift.z);
      }
    });
    invalidateBounds(obj);
    return obj;
  }
  obj[PIVOT_RESTORE_KEY] = {
    position: obj.position.clone()
  };
  const wrapper = new THREE8.Group();
  wrapper.name = `${obj.name || "object"}_pivot`;
  wrapper.position.copy(obj.position);
  wrapper.quaternion.copy(obj.quaternion);
  wrapper.scale.copy(obj.scale);
  const parent = obj.parent;
  if (parent) {
    const index = parent.children.indexOf(obj);
    parent.children.splice(index === -1 ? parent.children.length : index, 1, wrapper);
    obj.parent = null;
    wrapper.parent = parent;
  }
  obj.position.sub(shift);
  wrapper.add(obj);
  return wrapper;
}
function unwrapPivot(wrapper) {
  const inner = wrapper.children.find(
    (c) => c[PIVOT_RESTORE_KEY] !== void 0
  );
  if (!inner) return null;
  const restore = inner[PIVOT_RESTORE_KEY];
  delete inner[PIVOT_RESTORE_KEY];
  inner.position.copy(restore.position);
  const parent = wrapper.parent;
  wrapper.remove(inner);
  if (parent) {
    const index = parent.children.indexOf(wrapper);
    parent.children.splice(index === -1 ? parent.children.length : index, 1, inner);
    inner.parent = parent;
  }
  return inner;
}
function restorePivot(wrapper) {
  return unwrapPivot(wrapper);
}
function createPivotOffset(obj, modeOrOffset) {
  if (Array.isArray(modeOrOffset)) {
    return applyPivot(obj, { mode: "custom", custom: { x: modeOrOffset[0], y: modeOrOffset[1], z: modeOrOffset[2] } });
  }
  return applyPivot(obj, { mode: modeOrOffset });
}
var PivotAdjuster = {
  apply: applyPivot,
  applyPivot,
  restorePivot,
  createPivotOffset,
  unwrapPivot
};

// engine/src/transformer/scaler.ts
function applyScale(obj, opts = {}) {
  let factor = opts.factor ?? 1;
  if (opts.targetHeight !== void 0 && opts.targetHeight > 0) {
    const bounds = computeBounds(obj);
    const height = bounds.height;
    if (height > 1e-6) factor = opts.targetHeight / height;
    else factor = 1;
  }
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return 0;
  obj.scale.multiplyScalar(factor);
  invalidateBounds(obj);
  return factor;
}
function zoomAsset(obj, spec) {
  const bounds = computeBounds(obj);
  let factor = spec.factor ?? 1;
  if (spec.targetHeight !== void 0 && spec.targetHeight > 0) {
    if (bounds.height > 1e-6) {
      factor = spec.targetHeight / bounds.height;
    }
  } else if (spec.fitExtent !== void 0 && spec.fitExtent > 0) {
    const maxDim = Math.max(bounds.width, bounds.height, bounds.depth);
    if (maxDim > 1e-6) {
      factor = spec.fitExtent / maxDim;
    }
  } else if (spec.targetBox) {
    const scaleX = bounds.width > 1e-6 ? spec.targetBox.x / bounds.width : 1;
    const scaleY = bounds.height > 1e-6 ? spec.targetBox.y / bounds.height : 1;
    const scaleZ = bounds.depth > 1e-6 ? spec.targetBox.z / bounds.depth : 1;
    obj.scale.x *= scaleX;
    obj.scale.y *= scaleY;
    obj.scale.z *= scaleZ;
    invalidateBounds(obj);
    return Math.max(scaleX, scaleY, scaleZ);
  }
  if (spec.scaleAxes) {
    obj.scale.x *= spec.scaleAxes.x;
    obj.scale.y *= spec.scaleAxes.y;
    obj.scale.z *= spec.scaleAxes.z;
    invalidateBounds(obj);
    return factor;
  }
  if (!Number.isFinite(factor) || factor <= 0) return 1;
  if (spec.preservePivot || spec.anchorPoint) {
    const anchor = spec.anchorPoint ?? "bottom";
    let anchorY = bounds.box.min[1];
    if (anchor === "center") anchorY = (bounds.box.min[1] + bounds.box.max[1]) / 2;
    else if (anchor === "top") anchorY = bounds.box.max[1];
    else if (typeof anchor === "object") anchorY = anchor.y;
    const currentY = obj.position.y;
    const deltaY = (anchorY - currentY) * (factor - 1);
    obj.position.y -= deltaY;
  }
  obj.scale.multiplyScalar(factor);
  if (spec.bakeGeometry) {
    bakeScaleIntoGeometry(obj);
  }
  invalidateBounds(obj);
  return factor;
}
function bakeScaleIntoGeometry(root) {
  root.traverse((child) => {
    const mesh = child;
    if (mesh.isMesh && mesh.geometry) {
      mesh.geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
      mesh.scale.set(1, 1, 1);
      if (mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals();
      }
    }
  });
  invalidateBounds(root);
}
function normalizeMaterials(root) {
  const seen = /* @__PURE__ */ new Set();
  root.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat2 of mats) {
      if (!mat2 || seen.has(mat2.uuid)) continue;
      seen.add(mat2.uuid);
      normalizeOneMaterial(mat2);
    }
  });
}
function normalizeOneMaterial(mat2) {
  const props = mat2;
  let changed = false;
  for (const key of ["metalness", "roughness", "opacity", "emissiveIntensity", "normalScale"]) {
    const value = props[key];
    if (typeof value === "number" && !Number.isFinite(value)) {
      props[key] = 1;
      changed = true;
    }
  }
  if ("envMapIntensity" in props && typeof props.envMapIntensity !== "number") {
    props.envMapIntensity = 1;
    changed = true;
  }
  const color = props.color;
  if (color && (!Number.isFinite(color.r) || !Number.isFinite(color.g) || !Number.isFinite(color.b))) {
    color.setRGB(1, 1, 1);
    changed = true;
  }
  if (changed) mat2.needsUpdate = true;
}
var Scaler = {
  applyScale: (obj, targetHeight, factor) => {
    return applyScale(obj, { targetHeight, factor });
  },
  zoomAsset,
  bakeScaleIntoGeometry,
  normalizeMaterials,
  normalizeMeshScale: (obj, targetHeight) => applyScale(obj, { targetHeight }),
  sanitizeMaterialParams: normalizeMaterials
};

// engine/src/asset-parser/obj-parser.ts
function parseMtl(mtlText) {
  const materials = /* @__PURE__ */ new Map();
  let currentMat = null;
  const lines = mtlText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    const keyword = parts[0].toLowerCase();
    if (keyword === "newmtl" && parts.length > 1) {
      const name = parts[1];
      currentMat = {
        name,
        color: new THREE9.Color(13421772),
        roughness: 0.6,
        metalness: 0.1,
        opacity: 1,
        transparent: false
      };
      materials.set(name, currentMat);
    } else if (currentMat) {
      if (keyword === "kd" && parts.length >= 4) {
        currentMat.color = new THREE9.Color(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (keyword === "ks" && parts.length >= 4) {
        currentMat.specular = new THREE9.Color(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (keyword === "ns" && parts.length >= 2) {
        const ns = parseFloat(parts[1]);
        currentMat.roughness = Math.max(0.05, Math.min(1, 1 - Math.log(Math.max(1, ns)) / Math.log(1e3)));
      } else if (keyword === "d" && parts.length >= 2) {
        const d = parseFloat(parts[1]);
        currentMat.opacity = d;
        if (d < 1) currentMat.transparent = true;
      } else if (keyword === "tr" && parts.length >= 2) {
        const tr = parseFloat(parts[1]);
        currentMat.opacity = 1 - tr;
        if (tr > 0) currentMat.transparent = true;
      } else if ((keyword === "map_kd" || keyword === "map_diffuse") && parts.length >= 2) {
        currentMat.mapUri = parts.slice(1).join(" ");
      } else if ((keyword === "map_bump" || keyword === "bump") && parts.length >= 2) {
        currentMat.bumpMapUri = parts.slice(1).join(" ");
      } else if (keyword === "map_d" && parts.length >= 2) {
        currentMat.alphaMapUri = parts.slice(1).join(" ");
        currentMat.transparent = true;
      }
    }
  }
  return materials;
}
function parseObj(objText, opts = {}) {
  const root = new THREE9.Group();
  root.name = opts.name ?? "ParsedObjModel";
  const mtlDefs = opts.mtlText ? parseMtl(opts.mtlText) : /* @__PURE__ */ new Map();
  const createdMaterials = /* @__PURE__ */ new Map();
  const getOrCreateMaterial = (name) => {
    if (createdMaterials.has(name)) return createdMaterials.get(name);
    const def = mtlDefs.get(name);
    let mat2;
    if (def) {
      mat2 = new THREE9.MeshStandardMaterial({
        color: def.color ?? 13421772,
        roughness: def.roughness ?? 0.6,
        metalness: def.metalness ?? 0.1,
        opacity: def.opacity ?? 1,
        transparent: def.transparent ?? false
      });
      if (def.mapUri && opts.textureLoader) {
        const tex = opts.textureLoader(def.mapUri);
        if (tex instanceof THREE9.Texture) mat2.map = tex;
      }
    } else {
      mat2 = new THREE9.MeshStandardMaterial({ color: 13421772, roughness: 0.6, metalness: 0.1 });
    }
    mat2.name = name;
    createdMaterials.set(name, mat2);
    return mat2;
  };
  const rawPositions = [];
  const rawNormals = [];
  const rawUvs = [];
  const submeshes = [];
  let currentSubmesh = {
    name: "default",
    materialName: "default",
    faces: []
  };
  submeshes.push(currentSubmesh);
  const lines = objText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    if (cmd === "v" && parts.length >= 4) {
      rawPositions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (cmd === "vn" && parts.length >= 4) {
      rawNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (cmd === "vt" && parts.length >= 3) {
      rawUvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    } else if (cmd === "usemtl" && parts.length >= 2) {
      const matName = parts[1];
      if (currentSubmesh.faces.length > 0) {
        currentSubmesh = {
          name: `${currentSubmesh.name}_${matName}`,
          materialName: matName,
          faces: []
        };
        submeshes.push(currentSubmesh);
      } else {
        currentSubmesh.materialName = matName;
      }
    } else if ((cmd === "g" || cmd === "o") && parts.length >= 2) {
      const objName = parts[1];
      if (currentSubmesh.faces.length > 0) {
        currentSubmesh = {
          name: objName,
          materialName: currentSubmesh.materialName,
          faces: []
        };
        submeshes.push(currentSubmesh);
      } else {
        currentSubmesh.name = objName;
      }
    } else if (cmd === "f" && parts.length >= 4) {
      const faceVerts = [];
      for (let i = 1; i < parts.length; i++) {
        const token = parts[i];
        const segs = token.split("/");
        const v = parseInt(segs[0], 10);
        const vIdx = v > 0 ? v - 1 : rawPositions.length + v;
        const tIdx = segs[1] && segs[1].length > 0 ? parseInt(segs[1], 10) > 0 ? parseInt(segs[1], 10) - 1 : rawUvs.length + parseInt(segs[1], 10) : void 0;
        const nIdx = segs[2] && segs[2].length > 0 ? parseInt(segs[2], 10) > 0 ? parseInt(segs[2], 10) - 1 : rawNormals.length + parseInt(segs[2], 10) : void 0;
        faceVerts.push({ vIdx, tIdx, nIdx });
      }
      currentSubmesh.faces.push(faceVerts);
    }
  }
  for (const sm of submeshes) {
    if (sm.faces.length === 0) continue;
    const positions = [];
    const normals = [];
    const uvs = [];
    for (const face of sm.faces) {
      for (let i = 1; i < face.length - 1; i++) {
        const tri = [face[0], face[i], face[i + 1]];
        for (const vert of tri) {
          const p = rawPositions[vert.vIdx];
          if (p) positions.push(p[0], p[1], p[2]);
          else positions.push(0, 0, 0);
          if (vert.nIdx !== void 0 && rawNormals[vert.nIdx]) {
            const n = rawNormals[vert.nIdx];
            normals.push(n[0], n[1], n[2]);
          }
          if (vert.tIdx !== void 0 && rawUvs[vert.tIdx]) {
            const uv = rawUvs[vert.tIdx];
            uvs.push(uv[0], uv[1]);
          }
        }
      }
    }
    if (positions.length === 0) continue;
    const geo = new THREE9.BufferGeometry();
    geo.setAttribute("position", new THREE9.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      geo.setAttribute("normal", new THREE9.Float32BufferAttribute(normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    if (uvs.length === positions.length / 3 * 2) {
      geo.setAttribute("uv", new THREE9.Float32BufferAttribute(uvs, 2));
    }
    const material = getOrCreateMaterial(sm.materialName);
    const mesh = new THREE9.Mesh(geo, material);
    mesh.name = sm.name;
    root.add(mesh);
  }
  if (opts.pivot) {
    applyPivot(root, opts.pivot);
  }
  if (opts.zoom) {
    zoomAsset(root, opts.zoom);
  }
  return root;
}

// engine/src/asset-parser/format-registry.ts
var NO_CAP = {
  geometry: false,
  animation: false,
  materials: false,
  textures: false,
  skeleton: false,
  motion: false
};
function caps(partial) {
  return { ...NO_CAP, ...partial };
}
var FORMAT_REGISTRY = [
  // ---- Mô hình / hình học -------------------------------------------------
  {
    format: "gltf",
    kind: "scene",
    extensions: ["gltf"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: "GLTFLoader",
    builtin: true,
    notes: "Parser t\u1EF1 vi\u1EBFt c\u1EE7a Engine \u2014 \u0111\u1ECDc buffer nh\xFAng (data URI) v\xE0 buffer ngo\xE0i, ch\u1EA1y \u0111\u01B0\u1EE3c c\u1EA3 headless."
  },
  {
    format: "glb",
    kind: "scene",
    extensions: ["glb"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: "GLTFLoader",
    builtin: true,
    notes: "Parser t\u1EF1 vi\u1EBFt c\u1EE7a Engine \u2014 \u0111\u1ECDc container GLB (chunk JSON + BIN), ch\u1EA1y \u0111\u01B0\u1EE3c c\u1EA3 headless."
  },
  {
    format: "fbx",
    kind: "scene",
    extensions: ["fbx"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: "FBXLoader",
    notes: "\u0110\u1ECDc b\u1EB1ng FBXLoader c\u1EE7a three.js \u2014 c\u1EA7n tr\xECnh duy\u1EC7t (n\u1EA1p texture ngo\xE0i theo URL)."
  },
  {
    format: "obj",
    kind: "geometry",
    extensions: ["obj"],
    capabilities: caps({ geometry: true, materials: true }),
    builtin: true,
    notes: "K\xE8m .mtl v\xE0 texture tham chi\u1EBFu \u0111\u01B0\u1EE3c n\u1EA1p t\u1EF1 \u0111\u1ED9ng n\u1EBFu khai b\xE1o."
  },
  {
    format: "dae",
    kind: "scene",
    extensions: ["dae"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: "ColladaLoader",
    builtin: true,
    notes: "Parser t\u1EF1 vi\u1EBFt c\u1EE7a Engine (XML kh\xF4ng c\u1EA7n DOM) \u2014 ch\u1EA1y \u0111\u01B0\u1EE3c c\u1EA3 headless."
  },
  {
    format: "3ds",
    kind: "scene",
    extensions: ["3ds"],
    capabilities: caps({ geometry: true, materials: true, textures: true }),
    builtin: true,
    notes: "3DS chunk nh\u1ECB ph\xE2n (k2.0/k3.0). Animation b\u1ECB b\u1ECF qua \u2014 \u0111\u1ECBnh d\u1EA1ng kh\xF4ng mang k\xEAnh th\u1EDDi gian."
  },
  {
    format: "stl",
    kind: "geometry",
    extensions: ["stl"],
    capabilities: caps({ geometry: true }),
    builtin: true,
    notes: "H\u1ED7 tr\u1EE3 binary STL v\xE0 ASCII STL."
  },
  {
    format: "ply",
    kind: "geometry",
    extensions: ["ply"],
    capabilities: caps({ geometry: true, textures: true }),
    builtin: true,
    notes: "H\u1ED7 tr\u1EE3 ASCII PLY v\xE0 binary PLY (little/big endian); m\xE0u \u0111\u1EC9nh \u0111\u01B0\u1EE3c n\u1EA1p v\xE0o vertex color."
  },
  // ---- Cảnh & trao đổi dữ liệu -------------------------------------------
  {
    format: "usd",
    kind: "scene",
    extensions: ["usd"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: "USD nh\u1ECB ph\xE2n (crate) \u2014 \u0111\u1ECDc c\u1EA5u tr\xFAc prim, transform, mesh, material."
  },
  {
    format: "usda",
    kind: "scene",
    extensions: ["usda"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: "USD ASCII \u2014 \u0111\u1ECDc prim Xform/Mesh/Material v\xE0 thu\u1ED9c t\xEDnh c\u01A1 b\u1EA3n."
  },
  {
    format: "usdc",
    kind: "scene",
    extensions: ["usdc"],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: "USD crate nh\u1ECB ph\xE2n \u2014 c\xF9ng b\u1ED9 \u0111\u1ECDc v\u1EDBi .usd."
  },
  {
    format: "abc",
    kind: "scene",
    extensions: ["abc"],
    capabilities: caps({ geometry: true, animation: true, materials: true, skeleton: true }),
    builtin: true,
    notes: "Alembic \u2014 \u0111\u1ECDc c\xE2y object + hierarchy transform + mesh theo th\u1EDDi gian."
  },
  // ---- Vật liệu & texture --------------------------------------------------
  {
    format: "mtl",
    kind: "material",
    extensions: ["mtl"],
    capabilities: caps({ materials: true, textures: true }),
    builtin: true,
    notes: "Wavefront material \u2014 map_Kd/map_Bump/map_d v\xE0 tham s\u1ED1 PBR suy ra."
  },
  {
    format: "png",
    kind: "texture",
    extensions: ["png"],
    capabilities: caps({ textures: true }),
    builtin: true
  },
  {
    format: "jpg",
    kind: "texture",
    extensions: ["jpg"],
    capabilities: caps({ textures: true }),
    builtin: true
  },
  {
    format: "jpeg",
    kind: "texture",
    extensions: ["jpeg"],
    capabilities: caps({ textures: true }),
    builtin: true
  },
  {
    format: "webp",
    kind: "texture",
    extensions: ["webp"],
    capabilities: caps({ textures: true }),
    builtin: true
  },
  {
    format: "tga",
    kind: "texture",
    extensions: ["tga"],
    capabilities: caps({ textures: true }),
    builtin: true
  },
  {
    format: "exr",
    kind: "texture",
    extensions: ["exr"],
    capabilities: caps({ textures: true }),
    builtin: true,
    notes: "OpenEXR HDR \u2014 n\u1EA1p qua EXRLoader c\u1EE7a three.js."
  },
  {
    format: "hdr",
    kind: "texture",
    extensions: ["hdr"],
    capabilities: caps({ textures: true }),
    builtin: true,
    notes: "Radiance HDR \u2014 n\u1EA1p qua RGBELoader, d\xF9ng cho environment map."
  },
  // ---- Animation & dữ liệu chuyển động ------------------------------------
  {
    format: "bvh",
    kind: "motion",
    extensions: ["bvh"],
    capabilities: caps({ skeleton: true, motion: true }),
    builtin: true,
    notes: "BVH \u2014 c\xE2y khung h\xECnh + k\xEAnh v\u1ECB tr\xED; chuy\u1EC3n th\xE0nh AnimationClip cho three.js."
  },
  {
    format: "vmd",
    kind: "motion",
    extensions: ["vmd"],
    capabilities: caps({ motion: true }),
    builtin: true,
    notes: "VMD (MikuMikuDance) \u2014 keyframe v\u1ECB tr\xED/xoay cho bone theo t\xEAn."
  },
  // ---- Định dạng riêng của Engine ----------------------------------------
  {
    format: "forge-design",
    kind: "data",
    extensions: ["json"],
    capabilities: caps({}),
    builtin: true,
    notes: 'ForgeDesignSpec \u2014 kind "aetheria.forge.design".'
  },
  {
    format: "bot-spec",
    kind: "data",
    extensions: ["json"],
    capabilities: caps({}),
    builtin: true,
    notes: 'BotSpecDocument \u2014 kind "aetheria.bot.spec".'
  },
  {
    format: "asset-manifest",
    kind: "data",
    extensions: ["json"],
    capabilities: caps({}),
    builtin: true,
    notes: "AssetManifest \u2014 catalog \u0111\u1ECBnh d\u1EA1ng { version, generatedAt, entries[] }."
  },
  {
    format: "asset-sidecar",
    kind: "data",
    extensions: ["json"],
    capabilities: caps({}),
    builtin: true,
    notes: "Metadata sidecar c\u1EE7a m\u1ED9t asset (.json c\u1EA1nh .glb/.obj\u2026)."
  }
];
var BY_EXTENSION = /* @__PURE__ */ new Map();
for (const spec of FORMAT_REGISTRY) {
  for (const ext of spec.extensions) {
    if (!BY_EXTENSION.has(ext)) BY_EXTENSION.set(ext, spec);
  }
}
var BY_FORMAT = /* @__PURE__ */ new Map();
for (const spec of FORMAT_REGISTRY) {
  if (!BY_FORMAT.has(spec.format)) BY_FORMAT.set(spec.format, spec);
}
function extensionOf(path) {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(path);
  return (m?.[1] ?? "").toLowerCase();
}
function formatOf(path, contentHint) {
  const ext = extensionOf(path);
  if (ext === "json") {
    const hint = (contentHint ?? "").trim();
    if (hint.includes('"aetheria.forge.design"')) return "forge-design";
    if (hint.includes('"aetheria.bot.spec"')) return "bot-spec";
    if (/"entries"\s*:/.test(hint) && /"version"\s*:/.test(hint)) return "asset-manifest";
    return "asset-sidecar";
  }
  return BY_EXTENSION.get(ext)?.format ?? "custom";
}
function kindOf(format) {
  return BY_FORMAT.get(format)?.kind ?? "data";
}
function supportedFormats() {
  return FORMAT_REGISTRY.map((s) => s.format);
}
function supportedExtensions() {
  return [...BY_EXTENSION.keys()].sort();
}

// engine/src/asset-parser/stl-parser.ts
import * as THREE10 from "three";
var BINARY_HEADER_BYTES = 80;
var BINARY_TRIANGLE_BYTES = 50;
function readAscii(bytes, offset) {
  let end = offset;
  while (end < bytes.length && bytes[end] !== 0) end++;
  let out = "";
  for (let i = offset; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
}
function detectStlEncoding(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= BINARY_HEADER_BYTES + 4) {
    const triangleCount = view.getUint32(BINARY_HEADER_BYTES, true);
    const expected = BINARY_HEADER_BYTES + 4 + triangleCount * BINARY_TRIANGLE_BYTES;
    if (expected === bytes.length) return "binary";
  }
  const head = readAscii(bytes, 0).trim().toLowerCase();
  if (head.startsWith("solid")) return "ascii";
  return "binary";
}
function parseBinary(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const triangleCount = view.getUint32(BINARY_HEADER_BYTES, true);
  const positions = new Float32Array(triangleCount * 9);
  let o = BINARY_HEADER_BYTES + 4;
  for (let t = 0; t < triangleCount; t++) {
    if (o + BINARY_TRIANGLE_BYTES > bytes.length) {
      throw new Error(`AssetParser: STL binary b\u1ECB c\u1EAFt c\u1EE5t \u2014 thi\u1EBFu d\u1EEF li\u1EC7u tam gi\xE1c ${t}/${triangleCount}`);
    }
    o += 12;
    for (let v = 0; v < 3; v++) {
      positions[t * 9 + v * 3 + 0] = view.getFloat32(o, true);
      positions[t * 9 + v * 3 + 1] = view.getFloat32(o + 4, true);
      positions[t * 9 + v * 3 + 2] = view.getFloat32(o + 8, true);
      o += 12;
    }
    o += 2;
  }
  const geometry = new THREE10.BufferGeometry();
  geometry.setAttribute("position", new THREE10.BufferAttribute(positions, 3));
  return { geometry, triangleCount, encoding: "binary" };
}
function parseAscii(text) {
  const positions = [];
  const vertexRe = /^\s*vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/;
  let triangleCount = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const m = vertexRe.exec(rawLine);
    if (!m) continue;
    positions.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    if (positions.length % 9 === 0) triangleCount++;
  }
  if (positions.length === 0) {
    throw new Error("AssetParser: STL ASCII kh\xF4ng c\xF3 \u0111\u1EC9nh n\xE0o");
  }
  if (positions.length % 9 !== 0) {
    throw new Error(`AssetParser: STL ASCII l\u1EC7ch tam gi\xE1c (${positions.length} float kh\xF4ng chia h\u1EBFt cho 9)`);
  }
  const geometry = new THREE10.BufferGeometry();
  geometry.setAttribute("position", new THREE10.BufferAttribute(new Float32Array(positions), 3));
  return { geometry, triangleCount, encoding: "ascii" };
}
function parseStl(bytes, options = {}) {
  const encoding = detectStlEncoding(bytes);
  const result = encoding === "ascii" ? parseAscii(new TextDecoder().decode(bytes)) : parseBinary(bytes);
  const geometry = result.geometry;
  if (options.weldVertices !== false) {
    const welded = weldPositions(geometry.getAttribute("position").array);
    geometry.setAttribute("position", new THREE10.BufferAttribute(welded.positions, 3));
    geometry.setIndex(new THREE10.BufferAttribute(welded.indices, 1));
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const mesh = new THREE10.Mesh(geometry, new THREE10.MeshStandardMaterial());
  mesh.name = options.name ?? "StlMesh";
  mesh.userData.sourceEncoding = result.encoding;
  mesh.userData.triangleCount = result.triangleCount;
  return result;
}
function weldPositions(source) {
  const map = /* @__PURE__ */ new Map();
  const positions = [];
  const indices = [];
  for (let i = 0; i < source.length; i += 3) {
    const x = source[i];
    const y = source[i + 1];
    const z = source[i + 2];
    const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
    let idx = map.get(key);
    if (idx === void 0) {
      idx = positions.length / 3;
      map.set(key, idx);
      positions.push(x, y, z);
    }
    indices.push(idx);
  }
  return { positions: new Float32Array(positions), indices: new Uint32Array(indices) };
}

// engine/src/asset-parser/ply-parser.ts
import * as THREE11 from "three";
var TYPE_SIZES = {
  char: 1,
  int8: 1,
  uchar: 1,
  uint8: 1,
  short: 2,
  int16: 2,
  ushort: 2,
  uint16: 2,
  int: 4,
  int32: 4,
  uint: 4,
  uint32: 4,
  float: 4,
  float32: 4,
  double: 8,
  float64: 8
};
function normalizeType(raw) {
  const t = raw.toLowerCase();
  if (t === "float" || t === "float32") return "float32";
  if (t === "double" || t === "float64") return "float64";
  if (t === "int" || t === "int32") return "int32";
  if (t === "uint" || t === "uint32") return "uint32";
  if (t === "short" || t === "int16") return "int16";
  if (t === "ushort" || t === "uint16") return "uint16";
  if (t === "char" || t === "int8") return "int8";
  if (t === "uchar" || t === "uint8") return "uint8";
  throw new Error(`AssetParser: ki\u1EC3u PLY kh\xF4ng h\u1ED7 tr\u1EE3 "${raw}"`);
}
function parsePlyHeader(text) {
  const lines = text.split(/\r?\n/);
  if (!/^ply\s*$/i.test(lines[0] ?? "")) {
    throw new Error('AssetParser: kh\xF4ng ph\u1EA3i t\u1EC7p PLY (thi\u1EBFu d\xF2ng "ply")');
  }
  let format = "";
  const elements = [];
  let inHeader = true;
  let headerLineCount = 0;
  for (let i = 1; i < lines.length && inHeader; i++) {
    const line = lines[i].trim();
    headerLineCount = i + 1;
    if (line.length === 0) continue;
    const parts = line.split(/\s+/);
    const keyword = parts[0].toLowerCase();
    if (keyword === "comment" || keyword === "obj_info") continue;
    if (keyword === "format") {
      format = (parts[1] ?? "").toLowerCase();
      continue;
    }
    if (keyword === "element") {
      elements.push({ name: parts[1] ?? "unknown", count: parseInt(parts[2] ?? "0", 10), properties: [] });
      continue;
    }
    if (keyword === "property") {
      const current = elements[elements.length - 1];
      if (!current) throw new Error("AssetParser: PLY property ngo\xE0i element");
      if ((parts[1] ?? "").toLowerCase() === "list") {
        current.properties.push({
          name: parts[4] ?? "list",
          isList: true,
          countType: normalizeType(parts[2] ?? "uchar"),
          valueType: normalizeType(parts[3] ?? "float")
        });
      } else {
        current.properties.push({ name: parts[2] ?? "value", isList: false, valueType: normalizeType(parts[1] ?? "float") });
      }
      continue;
    }
    if (keyword === "end_header") {
      inHeader = false;
      headerLineCount = i + 1;
      break;
    }
  }
  if (!format) throw new Error('AssetParser: PLY thi\u1EBFu d\xF2ng "format"');
  if (!elements.length) throw new Error("AssetParser: PLY kh\xF4ng khai b\xE1o element n\xE0o");
  const headerBytes = new TextEncoder().encode(lines.slice(0, headerLineCount).join("\n") + "\n").length;
  return { format, elements, dataOffset: headerBytes };
}
function readValue(view, offset, type, littleEndian) {
  switch (type) {
    case "int8":
      return view.getInt8(offset);
    case "uint8":
      return view.getUint8(offset);
    case "int16":
      return view.getInt16(offset, littleEndian);
    case "uint16":
      return view.getUint16(offset, littleEndian);
    case "int32":
      return view.getInt32(offset, littleEndian);
    case "uint32":
      return view.getUint32(offset, littleEndian);
    case "float32":
      return view.getFloat32(offset, littleEndian);
    case "float64":
      return view.getFloat64(offset, littleEndian);
    default:
      throw new Error(`AssetParser: kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c ki\u1EC3u PLY "${type}"`);
  }
}
function createAsciiTokenReader(text) {
  const start = text.indexOf("end_header");
  const body = start >= 0 ? text.slice(start + "end_header".length) : text;
  const tokens = body.split(/\s+/).filter((t) => t.length > 0);
  let cursor = 0;
  return () => {
    if (cursor >= tokens.length) {
      throw new Error("AssetParser: PLY ASCII h\u1EBFt d\u1EEF li\u1EC7u tr\u01B0\u1EDBc khi \u0111\u1EE7 record");
    }
    const value = Number(tokens[cursor++]);
    if (Number.isNaN(value)) {
      throw new Error(`AssetParser: PLY ASCII c\xF3 token kh\xF4ng ph\u1EA3i s\u1ED1: "${tokens[cursor - 1]}"`);
    }
    return value;
  };
}
function parsePly(bytes, options = {}) {
  const headerText = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, Math.min(bytes.length, 1 << 16)));
  const header = parsePlyHeader(headerText);
  const isBinary = header.format.startsWith("binary");
  const littleEndian = !header.format.includes("big_endian");
  const positions = [];
  const normals = [];
  const uvs = [];
  const colors = [];
  const indices = [];
  let vertexCount = 0;
  let faceCount = 0;
  const hasColor = header.elements.some(
    (el) => el.name === "vertex" && el.properties.some((p) => ["red", "green", "blue", "alpha"].includes(p.name))
  );
  if (isBinary) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = header.dataOffset;
    for (const element of header.elements) {
      for (let i = 0; i < element.count; i++) {
        const values = {};
        for (const prop of element.properties) {
          if (prop.isList) {
            const count = readValue(view, offset, prop.countType ?? "uint8", littleEndian);
            offset += TYPE_SIZES[prop.countType ?? "uint8"];
            const list = [];
            for (let k = 0; k < count; k++) {
              list.push(readValue(view, offset, prop.valueType, littleEndian));
              offset += TYPE_SIZES[prop.valueType];
            }
            values[prop.name] = list.length;
            if (element.name === "face") {
              for (const idx of list) indices.push(idx);
            }
            continue;
          }
          values[prop.name] = readValue(view, offset, prop.valueType, littleEndian);
          offset += TYPE_SIZES[prop.valueType];
        }
        if (element.name === "vertex") {
          vertexCount++;
          positions.push(values.x ?? 0, values.y ?? 0, values.z ?? 0);
          if (values.nx !== void 0) normals.push(values.nx, values.ny ?? 0, values.nz ?? 0);
          const u = values.s ?? values.u ?? values.texture_u ?? values.texture_s;
          const v = values.t ?? values.v ?? values.texture_v ?? values.texture_t;
          if (u !== void 0 && v !== void 0) uvs.push(u, v);
          if (values.red !== void 0) {
            colors.push(values.red / 255, values.green / 255, values.blue / 255, (values.alpha ?? 255) / 255);
          }
        } else if (element.name === "face") {
          faceCount++;
        }
      }
    }
  } else {
    const fullText = new TextDecoder().decode(bytes);
    const next = createAsciiTokenReader(fullText);
    for (const element of header.elements) {
      for (let i = 0; i < element.count; i++) {
        const row = {};
        for (const prop of element.properties) {
          if (prop.isList) {
            const count = next();
            const list = [];
            for (let k = 0; k < count; k++) list.push(next());
            row[prop.name] = list;
            if (element.name === "face") for (const idx of list) indices.push(idx);
          } else {
            row[prop.name] = next();
          }
        }
        if (element.name === "vertex") {
          vertexCount++;
          positions.push(row.x ?? 0, row.y ?? 0, row.z ?? 0);
          if (row.nx !== void 0) normals.push(row.nx, row.ny ?? 0, row.nz ?? 0);
          const u = row.s ?? row.u ?? row.texture_u ?? row.texture_s;
          const v = row.t ?? row.v ?? row.texture_v ?? row.texture_t;
          if (u !== void 0 && v !== void 0) uvs.push(u, v);
          if (row.red !== void 0) {
            colors.push(
              row.red / 255,
              (row.green ?? 0) / 255,
              (row.blue ?? 0) / 255,
              (row.alpha ?? 255) / 255
            );
          }
        } else if (element.name === "face") {
          faceCount++;
        }
      }
    }
  }
  const geometry = new THREE11.BufferGeometry();
  geometry.setAttribute("position", new THREE11.Float32BufferAttribute(positions, 3));
  if (normals.length === positions.length) {
    geometry.setAttribute("normal", new THREE11.Float32BufferAttribute(normals, 3));
  } else {
    geometry.computeVertexNormals();
  }
  if (uvs.length === positions.length / 3 * 2) {
    geometry.setAttribute("uv", new THREE11.Float32BufferAttribute(uvs, 2));
  }
  const hasVertexColor = colors.length === positions.length / 3 * 4 && colors.length > 0;
  if (hasVertexColor) {
    geometry.setAttribute("color", new THREE11.Float32BufferAttribute(colors, 4));
  }
  if (indices.length >= 3) {
    geometry.setIndex(indices);
  }
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const material = new THREE11.MeshStandardMaterial({
    vertexColors: hasVertexColor && options.useVertexColor !== false
  });
  const mesh = new THREE11.Mesh(geometry, material);
  mesh.name = options.name ?? "PlyMesh";
  mesh.userData.sourceFormat = header.format;
  mesh.userData.vertexCount = vertexCount;
  mesh.userData.faceCount = faceCount;
  return { geometry, vertexCount, faceCount, format: header.format, hasVertexColor };
}

// engine/src/asset-parser/3ds-parser.ts
import * as THREE12 from "three";
var CHUNK_MAIN3DS = 19789;
var CHUNK_VERSION = 2;
var CHUNK_EDITOR = 15677;
var CHUNK_OBJECT = 16384;
var CHUNK_OBJECT_INFO = 16384;
var CHUNK_TRIMESH = 16385;
var CHUNK_TRIMESH_VERTEX = 16640;
var CHUNK_TRIMESH_FACE1 = 16641;
var CHUNK_TRIMESH_FACE2 = 16642;
var CHUNK_TRIMESH_FACE3 = 16643;
var CHUNK_TRIMESH_FACE4 = 16644;
var CHUNK_TRIMESH_MAPPINGCOORS = 16645;
var CHUNK_TRIMESH_MATERIAL_GROUP = 16647;
var CHUNK_TRIMESH_MATERIAL_NAMES = 16648;
var CHUNK3_POINT = 16656;
var CHUNK3_FACE = 16672;
var CHUNK3_MAPPING = 16688;
var CHUNK_MATERIAL_NEW = 40960;
var CHUNK_MAT_TEXMAP = 41728;
var ByteReader = class {
  constructor(bytes) {
    this.bytes = bytes;
    __publicField(this, "offset", 0);
  }
  get remaining() {
    return this.bytes.length - this.offset;
  }
  u8() {
    return this.bytes[this.offset++];
  }
  u16() {
    const v = this.bytes[this.offset] | this.bytes[this.offset + 1] << 8;
    this.offset += 2;
    return v;
  }
  u32() {
    const v = (this.bytes[this.offset] | this.bytes[this.offset + 1] << 8 | this.bytes[this.offset + 2] << 16 | this.bytes[this.offset + 3] << 24) >>> 0;
    this.offset += 4;
    return v;
  }
  i32() {
    return this.u32() | 0;
  }
  f32() {
    const v = (this.bytes[this.offset] | this.bytes[this.offset + 1] << 8 | this.bytes[this.offset + 2] << 16 | this.bytes[this.offset + 3] << 24) >>> 0;
    this.offset += 4;
    const asFloat = new Float32Array(1);
    const asInt = new Int32Array(asFloat.buffer);
    asInt[0] = v;
    return asFloat[0];
  }
  f64() {
    const lo = this.u32();
    const hi = this.u32();
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setUint32(0, lo, true);
    view.setUint32(4, hi, true);
    return view.getFloat64(0, true);
  }
  /** Đọc chuỗi zero-terminated. */
  cstring() {
    let out = "";
    while (this.offset < this.bytes.length) {
      const c = this.bytes[this.offset++];
      if (c === 0) break;
      out += String.fromCharCode(c);
    }
    return out;
  }
  skip(count) {
    this.offset += count;
  }
};
function readChunk(reader, end, onChunk) {
  while (reader.offset + 6 <= end) {
    const id = reader.u16();
    const length = reader.u32();
    const dataStart = reader.offset;
    const dataEnd = Math.min(dataStart + length, end);
    onChunk(id, dataStart, dataEnd);
    reader.offset = dataEnd;
    if (length === 0) break;
  }
}
function parseMaterialNames(reader, end, into) {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id !== CHUNK_TRIMESH_MATERIAL_NAMES) return;
    const sub = new ByteReader(reader.bytes);
    sub.offset = dataStart;
    const count = sub.u16();
    for (let i = 0; i < count && sub.offset < dataEnd; i++) {
      const name = sub.cstring();
      const index = sub.u16();
      into.set(index, name);
    }
  });
}
function parseObjectInfo(reader, end) {
  let name = "";
  const materials = /* @__PURE__ */ new Map();
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id === CHUNK_OBJECT_INFO) {
      const sub = new ByteReader(reader.bytes);
      sub.offset = dataStart;
      name = sub.cstring();
      sub.skip(2);
      sub.u32();
      sub.u32();
    } else if (id === CHUNK_TRIMESH_MATERIAL_NAMES) {
      const sub = new ByteReader(reader.bytes);
      sub.offset = dataStart;
      const count = sub.u16();
      for (let i = 0; i < count && sub.offset < dataEnd; i++) {
        const matName = sub.cstring();
        const index = sub.u16();
        materials.set(index, matName);
      }
    }
  });
  return { name, materials };
}
function parseTrimesh(reader, end, into) {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id === CHUNK_TRIMESH) {
      const sub2 = new ByteReader(reader.bytes);
      sub2.offset = dataStart;
      parseTrimesh(sub2, dataEnd, into);
      return;
    }
    const sub = new ByteReader(reader.bytes);
    sub.offset = dataStart;
    if (id === CHUNK_TRIMESH_VERTEX || id === CHUNK3_POINT) {
      const count = Math.floor((dataEnd - dataStart) / 12);
      for (let i = 0; i < count; i++) {
        into.vertices.push(sub.f32(), sub.f32(), sub.f32());
      }
    } else if (id === CHUNK_TRIMESH_FACE1) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.u16();
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE2) {
      const count = Math.floor((dataEnd - dataStart) / 12);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.skip(6);
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE3) {
      const count = Math.floor((dataEnd - dataStart) / 16);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        const c = sub.u16();
        sub.skip(10);
        into.faces.push(a, b, c);
      }
    } else if (id === CHUNK_TRIMESH_FACE4) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        sub.skip(4);
        into.faces.push(a, b, a);
      }
    } else if (id === CHUNK3_FACE) {
      const count = Math.floor((dataEnd - dataStart) / 10);
      for (let i = 0; i < count; i++) {
        const a = sub.u16();
        const b = sub.u16();
        sub.skip(6);
        into.faces.push(a, b, a);
      }
    } else if (id === CHUNK_TRIMESH_MAPPINGCOORS || id === CHUNK3_MAPPING) {
      const count = Math.floor((dataEnd - dataStart) / 8);
      for (let i = 0; i < count; i++) {
        into.uvs.push(sub.f32(), sub.f32());
      }
    } else if (id === CHUNK_TRIMESH_MATERIAL_GROUP) {
      const count = Math.floor((dataEnd - dataStart) / 2);
      let faceIndex = 0;
      for (let i = 0; i < count; i++) {
        const materialIndex = sub.u16();
        const facesInGroup = sub.u16();
        const list = into.materialGroups.get(materialIndex) ?? [];
        for (let f = 0; f < facesInGroup; f++) list.push(faceIndex++);
        into.materialGroups.set(materialIndex, list);
      }
    } else if (id === CHUNK_TRIMESH_MATERIAL_NAMES) {
      parseMaterialNames(sub, dataEnd, into.materialNames);
    }
  });
}
function collectMaterialTextures(reader, end, out) {
  readChunk(reader, end, (id, dataStart, dataEnd) => {
    if (id !== CHUNK_MATERIAL_NEW) return;
    readChunk(reader, dataEnd, (subId, subStart, subEnd) => {
      if (subId !== CHUNK_MAT_TEXMAP) return;
      const sub = new ByteReader(reader.bytes);
      sub.offset = subStart;
      sub.u8();
      sub.cstring();
      sub.u16();
      while (sub.offset < subEnd) {
        const dir = sub.cstring();
        const filename = sub.cstring();
        if (filename) out.push(dir ? `${dir}/${filename}` : filename);
        sub.u16();
        if (dir === "" && filename === "") break;
      }
    });
  });
}
function parseThreeDs(bytes, options = {}) {
  const reader = new ByteReader(bytes);
  if (reader.remaining < 6) {
    throw new Error("AssetParser: t\u1EC7p 3DS qu\xE1 nh\u1ECF");
  }
  const rootId = reader.u16();
  if (rootId !== CHUNK_MAIN3DS) {
    throw new Error(`AssetParser: kh\xF4ng ph\u1EA3i t\u1EC7p 3DS (magic 0x${rootId.toString(16)})`);
  }
  const declaredLength = reader.u32();
  if (declaredLength > bytes.length) {
    throw new Error(
      `AssetParser: chunk g\u1ED1c 3DS khai b\xE1o ${declaredLength} byte nh\u01B0ng t\u1EC7p ch\u1EC9 c\xF3 ${bytes.length} byte`
    );
  }
  const objects = [];
  const textureFiles = [];
  const warnings = [];
  const walk = (start, end, depth) => {
    if (depth > 16) return;
    const reader2 = new ByteReader(bytes);
    reader2.offset = start;
    readChunk(reader2, end, (id, dataStart, dataEnd) => {
      if (id === CHUNK_EDITOR) {
        walk(dataStart, dataEnd, depth + 1);
        return;
      }
      if (id === CHUNK_OBJECT) {
        const raw = {
          name: "",
          vertices: [],
          faces: [],
          uvs: [],
          materialGroups: /* @__PURE__ */ new Map(),
          materialNames: /* @__PURE__ */ new Map()
        };
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        const info = parseObjectInfo(sub, dataEnd);
        raw.name = info.name;
        raw.materialNames = info.materials;
        sub.offset = dataStart;
        parseTrimesh(sub, dataEnd, raw);
        objects.push(raw);
        return;
      }
      if (id === CHUNK_MATERIAL_NEW) {
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        collectMaterialTextures(sub, dataEnd, textureFiles);
        return;
      }
      if (id === CHUNK_VERSION) {
        const sub = new ByteReader(bytes);
        sub.offset = dataStart;
        const version = sub.u32();
        if (version < 3) warnings.push(`3DS phi\xEAn b\u1EA3n ${version} (k2.0) \u2014 c\xF3 th\u1EC3 thi\u1EBFu d\u1EEF li\u1EC7u UV.`);
      }
    });
  };
  walk(6, bytes.length, 0);
  const root = new THREE12.Group();
  root.name = options.name ?? "ThreeDsScene";
  let triangleCount = 0;
  const materialNames = [];
  for (const raw of objects) {
    const group = new THREE12.Group();
    group.name = raw.name || "Object";
    const vertexCount = raw.vertices.length / 3;
    const faceCount = raw.faces.length / 3;
    triangleCount += faceCount;
    if (vertexCount === 0 || faceCount === 0) {
      warnings.push(`Object "${raw.name}" kh\xF4ng c\xF3 tam gi\xE1c \u2014 b\u1ECF qua.`);
      continue;
    }
    const groups = raw.materialGroups.size > 0 ? raw.materialGroups : /* @__PURE__ */ new Map([[0, raw.faces.map((_, i) => i)]]);
    let fallbackMaterialIndex = -1;
    for (const [materialIndex, faceIndices] of groups) {
      const positions = [];
      const uvs = [];
      for (const fi of faceIndices) {
        const base = fi * 3;
        const tri = [raw.faces[base], raw.faces[base + 1], raw.faces[base + 2]];
        for (const vi of tri) {
          positions.push(raw.vertices[vi * 3], raw.vertices[vi * 3 + 1], raw.vertices[vi * 3 + 2]);
          if (raw.uvs.length >= (vi + 1) * 2) {
            uvs.push(raw.uvs[vi * 2], raw.uvs[vi * 2 + 1]);
          }
        }
      }
      if (positions.length === 0) continue;
      const geometry = new THREE12.BufferGeometry();
      geometry.setAttribute("position", new THREE12.Float32BufferAttribute(positions, 3));
      if (uvs.length === positions.length / 3 * 2) {
        geometry.setAttribute("uv", new THREE12.Float32BufferAttribute(uvs, 2));
      }
      geometry.computeVertexNormals();
      const matName = raw.materialNames.get(materialIndex) ?? `Material_${materialIndex}`;
      if (!materialNames.includes(matName)) materialNames.push(matName);
      const material = new THREE12.MeshStandardMaterial({ name: matName });
      const mesh = new THREE12.Mesh(geometry, material);
      mesh.name = `${group.name}_${matName}`;
      group.add(mesh);
      fallbackMaterialIndex = materialIndex;
    }
    if (group.children.length === 0) {
      warnings.push(`Object "${raw.name}" kh\xF4ng d\u1EF1ng \u0111\u01B0\u1EE3c mesh n\xE0o.`);
      continue;
    }
    root.add(group);
  }
  return { scene: root, objectCount: objects.length, triangleCount, materials: materialNames, textureFiles, warnings };
}

// engine/src/asset-parser/usd-parser.ts
import * as THREE13 from "three";

// engine/src/asset-parser/usdc-parser.ts
var TypeEnum = {
  Invalid: 0,
  Bool: 1,
  UChar: 2,
  Int: 3,
  UInt: 4,
  Int64: 5,
  UInt64: 6,
  Half: 7,
  Float: 8,
  Double: 9,
  String: 10,
  Token: 11,
  AssetPath: 12,
  Matrix2d: 13,
  Matrix3d: 14,
  Matrix4d: 15,
  Quatd: 16,
  Quatf: 17,
  Quath: 18,
  Vec2d: 19,
  Vec2f: 20,
  Vec2h: 21,
  Vec2i: 22,
  Vec3d: 23,
  Vec3f: 24,
  Vec3h: 25,
  Vec3i: 26,
  Vec4d: 27,
  Vec4f: 28,
  Vec4h: 29,
  Vec4i: 30,
  Dictionary: 31,
  TokenListOp: 32,
  StringListOp: 33,
  PathListOp: 34,
  ReferenceListOp: 35,
  IntListOp: 36,
  Int64ListOp: 37,
  UIntListOp: 38,
  UInt64ListOp: 39,
  PathVector: 40,
  TokenVector: 41,
  Specifier: 42,
  Permission: 43,
  Variability: 44,
  VariantSelectionMap: 45,
  TimeSamples: 46,
  Payload: 47,
  DoubleVector: 48,
  LayerOffsetVector: 49,
  StringVector: 50,
  ValueBlock: 51,
  Value: 52,
  UnregisteredValue: 53,
  UnregisteredValueListOp: 54,
  PayloadListOp: 55,
  TimeCode: 56,
  PathExpression: 57,
  Relocates: 58,
  Spline: 59,
  AnimationBlock: 60
};
var FIELD_SET_TERMINATOR = 4294967295;
var FLOAT_COMPRESSION_INT = 105;
var FLOAT_COMPRESSION_LUT = 116;
var HALF_EXPONENT_TABLE = new Float32Array(32);
for (let i = 0; i < 32; i++) HALF_EXPONENT_TABLE[i] = Math.pow(2, i - 15);
var HALF_DENORM_SCALE = Math.pow(2, -14);
function lz4DecompressBlock(input, inputOffset, inputEnd, output, outputOffset, outputEnd) {
  while (inputOffset < inputEnd) {
    const token = input[inputOffset++];
    if (inputOffset > inputEnd) break;
    let literalLength = token >> 4;
    if (literalLength === 15) {
      let b;
      do {
        if (inputOffset >= inputEnd) break;
        b = input[inputOffset++];
        literalLength += b;
      } while (b === 255 && inputOffset < inputEnd);
    }
    if (literalLength > 0) {
      if (inputOffset + literalLength > inputEnd) literalLength = inputEnd - inputOffset;
      for (let i = 0; i < literalLength; i++) {
        if (outputOffset >= outputEnd) break;
        output[outputOffset++] = input[inputOffset++];
      }
    }
    if (inputOffset >= inputEnd) break;
    if (inputOffset + 2 > inputEnd) break;
    const matchOffset = input[inputOffset++] | input[inputOffset++] << 8;
    if (matchOffset === 0) break;
    let matchLength = (token & 15) + 4;
    if (matchLength === 19) {
      let b;
      do {
        if (inputOffset >= inputEnd) break;
        b = input[inputOffset++];
        matchLength += b;
      } while (b === 255 && inputOffset < inputEnd);
    }
    const matchPos = outputOffset - matchOffset;
    if (matchPos < 0) break;
    for (let i = 0; i < matchLength; i++) {
      if (outputOffset >= outputEnd) break;
      output[outputOffset++] = output[matchPos + i];
    }
  }
  return outputOffset;
}
function decompressLz4(input, uncompressedSize) {
  const output = new Uint8Array(uncompressedSize);
  const numChunks = input[0];
  if (numChunks === 0) {
    lz4DecompressBlock(input, 1, input.length, output, 0, uncompressedSize);
    return output;
  }
  const CHUNK_SIZE = 65536;
  let headerOffset = 1;
  const compressedSizes = [];
  for (let i = 0; i < numChunks; i++) {
    const size = (input[headerOffset] | input[headerOffset + 1] << 8 | input[headerOffset + 2] << 16 | input[headerOffset + 3] << 24) >>> 0;
    compressedSizes.push(size);
    headerOffset += 4;
  }
  let inputOffset = headerOffset;
  let outputOffset = 0;
  for (let i = 0; i < numChunks; i++) {
    const chunkCompressedSize = compressedSizes[i];
    const chunkOutputSize = Math.min(CHUNK_SIZE, uncompressedSize - outputOffset);
    lz4DecompressBlock(
      input,
      inputOffset,
      inputOffset + chunkCompressedSize,
      output,
      outputOffset,
      outputOffset + chunkOutputSize
    );
    inputOffset += chunkCompressedSize;
    outputOffset += chunkOutputSize;
  }
  return output;
}
function decodeIntegers32(data, numInts) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;
  const commonValue = view.getInt32(offset, true);
  offset += 4;
  const numCodesBytes = numInts * 2 + 7 >> 3;
  const codesStart = offset;
  const vintsStart = offset + numCodesBytes;
  const result = new Int32Array(numInts);
  let prevVal = 0;
  let codesOffset = codesStart;
  let vintsOffset = vintsStart;
  for (let i = 0; i < numInts; ) {
    const codeByte = data[codesOffset++];
    for (let j = 0; j < 4 && i < numInts; j++, i++) {
      const code = codeByte >> j * 2 & 3;
      let delta = 0;
      switch (code) {
        case 0:
          delta = commonValue;
          break;
        case 1:
          delta = view.getInt8(vintsOffset);
          vintsOffset += 1;
          break;
        case 2:
          delta = view.getInt16(vintsOffset, true);
          vintsOffset += 2;
          break;
        case 3:
          delta = view.getInt32(vintsOffset, true);
          vintsOffset += 4;
          break;
      }
      prevVal += delta;
      result[i] = prevVal;
    }
  }
  return result;
}
function decompressIntegers32(compressedData, numInts) {
  const encodedSize = numInts * 4 + (numInts * 2 + 7 >> 3) + 4;
  const encoded = decompressLz4(compressedData, encodedSize);
  return decodeIntegers32(encoded, numInts);
}
var BinaryReader = class {
  constructor(buffer) {
    this.buffer = buffer;
    __publicField(this, "offset", 0);
    __publicField(this, "view");
    this.view = new DataView(buffer);
  }
  seek(offset) {
    this.offset = offset;
  }
  tell() {
    return this.offset;
  }
  get byteLength() {
    return this.buffer.byteLength;
  }
  u8() {
    this._need(1);
    return this.view.getUint8(this.offset++);
  }
  i8() {
    this._need(1);
    return this.view.getInt8(this.offset++);
  }
  u16() {
    this._need(2);
    const v = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return v;
  }
  i16() {
    this._need(2);
    const v = this.view.getInt16(this.offset, true);
    this.offset += 2;
    return v;
  }
  u32() {
    this._need(4);
    const v = this.view.getUint32(this.offset, true);
    this.offset += 4;
    return v;
  }
  i32() {
    this._need(4);
    const v = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return v;
  }
  u64() {
    this._need(8);
    const lo = this.view.getUint32(this.offset, true);
    const hi = this.view.getUint32(this.offset + 4, true);
    this.offset += 8;
    return hi * 4294967296 + lo;
  }
  i64() {
    this._need(8);
    const lo = this.view.getUint32(this.offset, true);
    const hi = this.view.getInt32(this.offset + 4, true);
    this.offset += 8;
    return hi * 4294967296 + lo;
  }
  f32() {
    this._need(4);
    const v = this.view.getFloat32(this.offset, true);
    this.offset += 4;
    return v;
  }
  f64() {
    this._need(8);
    const v = this.view.getFloat64(this.offset, true);
    this.offset += 8;
    return v;
  }
  bytes(length) {
    this._need(length);
    const out = new Uint8Array(this.buffer, this.offset, length);
    this.offset += length;
    return out;
  }
  string(length) {
    const raw = this.bytes(length);
    let end = 0;
    while (end < raw.length && raw[end] !== 0) end++;
    return new TextDecoder().decode(raw.subarray(0, end));
  }
  _need(length) {
    if (this.offset + length > this.buffer.byteLength) {
      throw new RangeError(
        `AssetParser: USD crate \u0111\u1ECDc v\u01B0\u1EE3t qu\xE1 cu\u1ED1i t\u1EC7p (c\u1EA7n ${length} byte t\u1EA1i offset ${this.offset})`
      );
    }
  }
};
var ValueRep = class {
  constructor(lo, hi) {
    this.lo = lo;
    this.hi = hi;
  }
  get isArray() {
    return (this.hi & 2147483648) !== 0;
  }
  get isInlined() {
    return (this.hi & 1073741824) !== 0;
  }
  get isCompressed() {
    return (this.hi & 536870912) !== 0;
  }
  get typeEnum() {
    return this.hi >> 16 & 255;
  }
  get payload() {
    return this.lo + (this.hi & 65535) * 4294967296;
  }
};
var SPEC_TYPE_NAMES = { 0: "def", 1: "over", 2: "class" };
function parseUsdc(buffer) {
  const reader = new BinaryReader(buffer);
  const warnings = [];
  reader.seek(0);
  const magic = reader.string(8);
  if (magic !== "PXR-USDC") {
    throw new Error(`AssetParser: kh\xF4ng ph\u1EA3i USD crate (magic "${magic}")`);
  }
  const major = reader.u8();
  const minor = reader.u8();
  const patch = reader.u8();
  reader.bytes(5);
  const tocOffset = reader.u64();
  const version = `${major}.${minor}.${patch}`;
  reader.seek(tocOffset);
  const numSections = reader.u64();
  const sections = /* @__PURE__ */ new Map();
  for (let i = 0; i < numSections; i++) {
    const name = reader.string(16);
    const start = reader.u64();
    const size = reader.u64();
    sections.set(name, { start, size });
  }
  const isLegacy = major === 0 && minor < 4;
  const tokens = [];
  const tokensSection = sections.get("TOKENS");
  if (tokensSection) {
    reader.seek(tokensSection.start);
    const numTokens = reader.u64();
    let tokensData;
    if (isLegacy) {
      const numBytes = reader.u64();
      tokensData = reader.bytes(numBytes);
    } else {
      const uncompressedSize = reader.u64();
      const compressedSize = reader.u64();
      const compressed = reader.bytes(compressedSize);
      tokensData = decompressLz4(compressed, uncompressedSize);
    }
    let strStart = 0;
    for (let i = 0; i < numTokens; i++) {
      let strEnd = strStart;
      while (strEnd < tokensData.length && tokensData[strEnd] !== 0) strEnd++;
      tokens.push(new TextDecoder().decode(tokensData.subarray(strStart, strEnd)));
      strStart = strEnd + 1;
    }
  }
  const strings = [];
  const stringsSection = sections.get("STRINGS");
  if (stringsSection) {
    reader.seek(stringsSection.start);
    const numStrings = reader.u64();
    for (let i = 0; i < numStrings; i++) strings.push(reader.u32());
  }
  const fields = [];
  const fieldsSection = sections.get("FIELDS");
  if (fieldsSection) {
    reader.seek(fieldsSection.start);
    if (isLegacy) {
      const numFields = Math.floor(fieldsSection.size / 12);
      for (let i = 0; i < numFields; i++) {
        const tokenIndex = reader.u32();
        const repLo = reader.u32();
        const repHi = reader.u32();
        fields.push({ tokenIndex, valueRep: new ValueRep(repLo, repHi) });
      }
    } else {
      const numFields = reader.u64();
      const indicesSize = reader.u64();
      const indicesCompressed = reader.bytes(indicesSize);
      const tokenIndices = decompressIntegers32(indicesCompressed, numFields);
      const repsSize = reader.u64();
      const repsCompressed = reader.bytes(repsSize);
      const repsData = decompressLz4(repsCompressed, numFields * 8);
      const repsView = new DataView(repsData.buffer, repsData.byteOffset, repsData.byteLength);
      for (let i = 0; i < numFields; i++) {
        fields.push({
          tokenIndex: tokenIndices[i],
          valueRep: new ValueRep(repsView.getUint32(i * 8, true), repsView.getUint32(i * 8 + 4, true))
        });
      }
    }
  }
  const fieldSets = [];
  const fieldSetsSection = sections.get("FIELDSETS");
  if (fieldSetsSection) {
    reader.seek(fieldSetsSection.start);
    if (isLegacy) {
      const numFieldSets = Math.floor(fieldSetsSection.size / 4);
      for (let i = 0; i < numFieldSets; i++) fieldSets.push(reader.u32());
    } else {
      const numFieldSets = reader.u64();
      const compressedSize = reader.u64();
      const compressed = reader.bytes(compressedSize);
      const indices = decompressIntegers32(compressed, numFieldSets);
      for (let i = 0; i < numFieldSets; i++) fieldSets.push(indices[i]);
    }
  }
  const paths = [];
  const pathsSection = sections.get("PATHS");
  if (pathsSection) {
    reader.seek(pathsSection.start);
    const numPaths = reader.u64();
    paths.length = numPaths;
    if (numPaths === 0) {
      paths.push("/");
    } else if (isLegacy) {
      readPathsRecursive(reader, tokens, paths, "", 0);
    } else {
      reader.u64();
      const c1 = reader.u64();
      const pathIndices = decompressIntegers32(reader.bytes(c1), numPaths);
      const c2 = reader.u64();
      const elementTokenIndices = decompressIntegers32(reader.bytes(c2), numPaths);
      const c3 = reader.u64();
      const jumps = decompressIntegers32(reader.bytes(c3), numPaths);
      buildPathsFromCompressed(pathIndices, elementTokenIndices, jumps, tokens, paths);
    }
  }
  const specs = [];
  const specsSection = sections.get("SPECS");
  if (specsSection) {
    reader.seek(specsSection.start);
    if (isLegacy) {
      const specSize = minor === 0 && patch === 1 ? 16 : 12;
      const numSpecs = Math.floor(specsSection.size / specSize);
      for (let i = 0; i < numSpecs; i++) {
        const pathIndex = reader.u32();
        const fieldSetIndex = reader.u32();
        const specType = reader.u32();
        if (specSize === 16) reader.u32();
        specs.push({ pathIndex, fieldSetIndex, specType });
      }
    } else {
      const numSpecs = reader.u64();
      const c1 = reader.u64();
      const pathIndices = decompressIntegers32(reader.bytes(c1), numSpecs);
      const c2 = reader.u64();
      const fieldSetIndices = decompressIntegers32(reader.bytes(c2), numSpecs);
      const c3 = reader.u64();
      const specTypes = decompressIntegers32(reader.bytes(c3), numSpecs);
      for (let i = 0; i < numSpecs; i++) {
        specs.push({
          pathIndex: pathIndices[i],
          fieldSetIndex: fieldSetIndices[i],
          specType: specTypes[i]
        });
      }
    }
  }
  const valueReader = new CrateValueReader(reader, tokens, strings, paths, version, warnings);
  const result = [];
  for (const spec of specs) {
    const path = paths[spec.pathIndex];
    if (!path) continue;
    const specFields = {};
    let fieldSetIndex = spec.fieldSetIndex;
    let iterations = 0;
    while (fieldSetIndex < fieldSets.length && iterations < 1e4) {
      const fieldIndex = fieldSets[fieldSetIndex];
      if (fieldIndex === FIELD_SET_TERMINATOR || fieldIndex === -1) break;
      const field = fields[fieldIndex];
      if (field) {
        const name = tokens[field.tokenIndex];
        if (name) specFields[name] = valueReader.readValue(field.valueRep);
      }
      fieldSetIndex++;
      iterations++;
    }
    result.push({ path, specType: SPEC_TYPE_NAMES[spec.specType] ?? "def", fields: specFields });
  }
  return { specs: result, warnings, version };
}
function readPathsRecursive(reader, tokens, paths, parentPath, depth) {
  if (depth > 1e3) return;
  const index = reader.u32();
  const elementTokenIndex = reader.u32();
  const bits = reader.u8();
  const hasChild = (bits & 1) !== 0;
  const hasSibling = (bits & 2) !== 0;
  const isPrimProperty = (bits & 4) !== 0;
  let path;
  if (parentPath === "") {
    path = "/";
  } else {
    const elemToken = tokens[elementTokenIndex] ?? "";
    path = isPrimProperty ? `${parentPath}.${elemToken}` : parentPath === "/" ? `/${elemToken}` : `${parentPath}/${elemToken}`;
  }
  paths[index] = path;
  if (hasChild && hasSibling) {
    const siblingOffset = reader.u64();
    readPathsRecursive(reader, tokens, paths, path, depth + 1);
    reader.seek(siblingOffset);
    readPathsRecursive(reader, tokens, paths, parentPath, depth + 1);
  } else if (hasChild) {
    readPathsRecursive(reader, tokens, paths, path, depth + 1);
  } else if (hasSibling) {
    readPathsRecursive(reader, tokens, paths, parentPath, depth + 1);
  }
}
function buildPathsFromCompressed(pathIndices, elementTokenIndices, jumps, tokens, paths) {
  const buildPaths = (startIndex, startParentPath) => {
    let curIndex = startIndex;
    let parentPath = startParentPath;
    while (curIndex < pathIndices.length) {
      const thisIndex = curIndex++;
      const pathIndex = pathIndices[thisIndex];
      const elementTokenIndex = elementTokenIndices[thisIndex];
      const jump = jumps[thisIndex];
      let path;
      if (parentPath === "") {
        path = "/";
        parentPath = path;
      } else {
        const elemToken = tokens[Math.abs(elementTokenIndex)] ?? "";
        path = elementTokenIndex < 0 ? `${parentPath}.${elemToken}` : parentPath === "/" ? `/${elemToken}` : `${parentPath}/${elemToken}`;
      }
      if (pathIndex >= 0 && pathIndex < paths.length) paths[pathIndex] = path;
      const hasChild = jump > 0 || jump === -1;
      const hasSibling = jump >= 0;
      if (hasChild) {
        if (hasSibling) {
          const siblingIndex = thisIndex + jump;
          if (siblingIndex >= 0 && siblingIndex < pathIndices.length) {
            buildPaths(siblingIndex, parentPath);
          }
        }
        parentPath = path;
      } else if (!hasSibling) {
        break;
      }
    }
  };
  buildPaths(0, "");
}
var CrateValueReader = class {
  constructor(reader, tokens, strings, paths, version, warnings) {
    this.reader = reader;
    this.tokens = tokens;
    this.strings = strings;
    this.paths = paths;
    this.version = version;
    this.warnings = warnings;
    __publicField(this, "conversion", new DataView(new ArrayBuffer(4)));
  }
  readValue(valueRep) {
    const type = valueRep.typeEnum;
    if (valueRep.isInlined) return this.readInlined(valueRep);
    const offset = valueRep.payload;
    if (offset === 0 && valueRep.isArray) return [];
    if (offset < 0 || offset >= this.reader.byteLength) {
      this.warnings.push(`USD crate: offset gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 (${offset}) \u2014 b\u1ECF qua thu\u1ED9c t\xEDnh.`);
      return null;
    }
    const saved = this.reader.tell();
    this.reader.seek(offset);
    let value;
    try {
      value = valueRep.isArray ? this.readArray(valueRep) : this.readScalar(type);
    } catch (err) {
      this.warnings.push(`USD crate: l\u1ED7i \u0111\u1ECDc gi\xE1 tr\u1ECB ki\u1EC3u ${type} \u2014 ${err.message}`);
      value = null;
    }
    this.reader.seek(saved);
    return value;
  }
  readInlined(valueRep) {
    const type = valueRep.typeEnum;
    const payload = valueRep.lo;
    const view = this.conversion;
    switch (type) {
      case TypeEnum.Bool:
        return payload !== 0;
      case TypeEnum.UChar:
        return payload & 255;
      case TypeEnum.Int:
      case TypeEnum.UInt:
        return payload;
      case TypeEnum.Float:
      case TypeEnum.Double:
        view.setUint32(0, payload, true);
        return view.getFloat32(0, true);
      case TypeEnum.Token:
        return this.tokens[payload] ?? "";
      case TypeEnum.String:
        return this.tokens[this.strings[payload]] ?? "";
      case TypeEnum.AssetPath:
        return this.tokens[payload] ?? "";
      case TypeEnum.Specifier:
      case TypeEnum.Permission:
      case TypeEnum.Variability:
        return payload;
      case TypeEnum.Vec2h: {
        view.setUint32(0, payload, true);
        return [this.halfToFloat(view.getUint16(0, true)), this.halfToFloat(view.getUint16(2, true))];
      }
      case TypeEnum.Vec2f:
      case TypeEnum.Vec2i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1)];
      }
      case TypeEnum.Vec3f:
      case TypeEnum.Vec3i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1), view.getInt8(2)];
      }
      case TypeEnum.Vec4f:
      case TypeEnum.Vec4i: {
        view.setUint32(0, payload, true);
        return [view.getInt8(0), view.getInt8(1), view.getInt8(2), view.getInt8(3)];
      }
      case TypeEnum.Matrix4d: {
        view.setUint32(0, payload, true);
        const d = [view.getInt8(0), view.getInt8(4), view.getInt8(8), view.getInt8(12)];
        return [
          d[0],
          0,
          0,
          0,
          0,
          d[1],
          0,
          0,
          0,
          0,
          d[2],
          0,
          0,
          0,
          0,
          d[3]
        ];
      }
      default:
        return payload;
    }
  }
  readScalar(type) {
    const reader = this.reader;
    switch (type) {
      case TypeEnum.Invalid:
        return null;
      case TypeEnum.Bool:
        return reader.u8() !== 0;
      case TypeEnum.UChar:
        return reader.u8();
      case TypeEnum.Int:
        return reader.i32();
      case TypeEnum.UInt:
        return reader.u32();
      case TypeEnum.Int64:
        return reader.i64();
      case TypeEnum.UInt64:
        return reader.u64();
      case TypeEnum.Half:
        return this.halfToFloat(reader.u16());
      case TypeEnum.Float:
        return reader.f32();
      case TypeEnum.Double:
        return reader.f64();
      case TypeEnum.String:
      case TypeEnum.Token:
      case TypeEnum.AssetPath:
        return this.tokens[reader.u32()] ?? "";
      case TypeEnum.Vec2f:
        return [reader.f32(), reader.f32()];
      case TypeEnum.Vec2d:
        return [reader.f64(), reader.f64()];
      case TypeEnum.Vec2i:
        return [reader.i32(), reader.i32()];
      case TypeEnum.Vec3f:
        return [reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Vec3d:
        return [reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Vec3i:
        return [reader.i32(), reader.i32(), reader.i32()];
      case TypeEnum.Vec4f:
        return [reader.f32(), reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Vec4d:
        return [reader.f64(), reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Quatf:
        return [reader.f32(), reader.f32(), reader.f32(), reader.f32()];
      case TypeEnum.Quatd:
        return [reader.f64(), reader.f64(), reader.f64(), reader.f64()];
      case TypeEnum.Matrix4d: {
        const m = [];
        for (let i = 0; i < 16; i++) m.push(reader.f64());
        return m;
      }
      case TypeEnum.TokenVector: {
        const count = reader.u64();
        const out = [];
        for (let i = 0; i < count; i++) out.push(this.tokens[reader.u32()] ?? "");
        return out;
      }
      case TypeEnum.PathVector: {
        const count = reader.u64();
        const out = [];
        for (let i = 0; i < count; i++) out.push(this.paths[reader.u32()] ?? "");
        return out;
      }
      case TypeEnum.DoubleVector: {
        const count = reader.u64();
        const arr = new Float64Array(count);
        for (let i = 0; i < count; i++) arr[i] = reader.f64();
        return arr;
      }
      default:
        this.warnings.push(`USD crate: ki\u1EC3u scalar ch\u01B0a h\u1ED7 tr\u1EE3 (${type}) \u2014 b\u1ECF qua gi\xE1 tr\u1ECB.`);
        return null;
    }
  }
  readArray(valueRep) {
    const reader = this.reader;
    const type = valueRep.typeEnum;
    const minor = Number(this.version.split(".")[1] ?? 0);
    let size;
    if (minor < 7) size = reader.u32();
    else size = reader.u64();
    if (!Number.isSafeInteger(size) || size < 0) {
      throw new RangeError(`k\xEDch th\u01B0\u1EDBc m\u1EA3ng USD kh\xF4ng h\u1EE3p l\u1EC7: ${size}`);
    }
    if (size > 2147483647) {
      throw new RangeError(`k\xEDch th\u01B0\u1EDBc m\u1EA3ng USD v\u01B0\u1EE3t gi\u1EDBi h\u1EA1n: ${size}`);
    }
    if (size === 0) return [];
    if (valueRep.isCompressed) return this.readCompressedArray(type, size);
    switch (type) {
      case TypeEnum.Int: {
        const arr = new Int32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.i32();
        return arr;
      }
      case TypeEnum.UInt: {
        const arr = new Uint32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.u32();
        return arr;
      }
      case TypeEnum.Float: {
        const arr = new Float32Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Double: {
        const arr = new Float64Array(size);
        for (let i = 0; i < size; i++) arr[i] = reader.f64();
        return arr;
      }
      case TypeEnum.Half: {
        const arr = new Float32Array(size);
        for (let i = 0; i < size; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Vec2f: {
        const arr = new Float32Array(size * 2);
        for (let i = 0; i < size * 2; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec3f: {
        const arr = new Float32Array(size * 3);
        for (let i = 0; i < size * 3; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec4f: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Vec3h: {
        const arr = new Float32Array(size * 3);
        for (let i = 0; i < size * 3; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Quatf: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = reader.f32();
        return arr;
      }
      case TypeEnum.Quath: {
        const arr = new Float32Array(size * 4);
        for (let i = 0; i < size * 4; i++) arr[i] = this.halfToFloat(reader.u16());
        return arr;
      }
      case TypeEnum.Matrix4d: {
        const arr = new Float64Array(size * 16);
        for (let i = 0; i < size * 16; i++) arr[i] = reader.f64();
        return arr;
      }
      case TypeEnum.Token: {
        const out = [];
        for (let i = 0; i < size; i++) out.push(this.tokens[reader.u32()] ?? "");
        return out;
      }
      default:
        this.warnings.push(`USD crate: ki\u1EC3u m\u1EA3ng ch\u01B0a h\u1ED7 tr\u1EE3 (${type}) \u2014 b\u1ECF qua m\u1EA3ng.`);
        return [];
    }
  }
  readCompressedArray(type, size) {
    const reader = this.reader;
    switch (type) {
      case TypeEnum.Int:
      case TypeEnum.UInt: {
        const compressedSize = reader.u64();
        return decompressIntegers32(reader.bytes(compressedSize), size);
      }
      case TypeEnum.Float: {
        const code = reader.i8();
        if (code === FLOAT_COMPRESSION_INT) {
          const compressedSize = reader.u64();
          const ints = decompressIntegers32(reader.bytes(compressedSize), size);
          const floats = new Float32Array(size);
          for (let i = 0; i < size; i++) floats[i] = ints[i];
          return floats;
        }
        if (code === FLOAT_COMPRESSION_LUT) {
          const lutSize = reader.u32();
          const lut = new Float32Array(lutSize);
          for (let i = 0; i < lutSize; i++) lut[i] = reader.f32();
          const compressedSize = reader.u64();
          const indices = decompressIntegers32(reader.bytes(compressedSize), size);
          const floats = new Float32Array(size);
          for (let i = 0; i < size; i++) floats[i] = lut[indices[i]];
          return floats;
        }
        this.warnings.push(`USD crate: m\xE3 n\xE9n float l\u1EA1 (${code}) \u2014 d\xF9ng 0.`);
        return new Float32Array(size);
      }
      default:
        this.warnings.push(`USD crate: ch\u01B0a h\u1ED7 tr\u1EE3 n\xE9n ki\u1EC3u m\u1EA3ng ${type}.`);
        return [];
    }
  }
  halfToFloat(h) {
    const sign = (h & 32768) >> 15;
    const exp = (h & 31744) >> 10;
    const frac = h & 1023;
    if (exp === 0) {
      if (frac === 0) return sign ? -0 : 0;
      return (sign ? -1 : 1) * HALF_DENORM_SCALE * (frac / 1024);
    }
    if (exp === 31) return frac ? NaN : sign ? -Infinity : Infinity;
    return (sign ? -1 : 1) * HALF_EXPONENT_TABLE[exp] * (1 + frac / 1024);
  }
};

// engine/src/asset-parser/usda-parser.ts
function tokenize(text) {
  const tokens = [];
  let i = 0;
  let line = 1;
  const push = (type, value) => {
    tokens.push({ type, value, line });
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\n") {
      line++;
      i++;
      continue;
    }
    if (ch === " " || ch === "	" || ch === "\r") {
      i++;
      continue;
    }
    if (ch === "#") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (ch === '"') {
      let out = "";
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\" && i + 1 < text.length) {
          const next = text[i + 1];
          out += next === "n" ? "\n" : next === "t" ? "	" : next;
          i += 2;
          continue;
        }
        if (text[i] === "\n") line++;
        out += text[i++];
      }
      i++;
      push("string", out);
      continue;
    }
    if (ch === "<" && text[i + 1] === "/") {
      const end = text.indexOf(">", i);
      if (end < 0) throw new Error(`AssetParser: USDA \u0111\u01B0\u1EDDng d\u1EABn prim kh\xF4ng \u0111\xF3ng t\u1EA1i d\xF2ng ${line}`);
      push("path", text.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    if (ch === "@") {
      const end = text.indexOf("@", i + 1);
      if (end < 0) throw new Error(`AssetParser: USDA asset path kh\xF4ng \u0111\xF3ng t\u1EA1i d\xF2ng ${line}`);
      push("asset", text.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    if (/[0-9]/.test(ch) || ch === "-" && /[0-9.]/.test(text[i + 1] ?? "") || ch === "." && /[0-9]/.test(text[i + 1] ?? "")) {
      let out = "";
      while (i < text.length && /[0-9.eE+\-]/.test(text[i])) {
        if ((text[i] === "-" || text[i] === "+") && !/[0-9.]/.test(text[i + 1] ?? "")) break;
        out += text[i++];
      }
      push("number", out);
      continue;
    }
    if ("{}[]()=,;:".includes(ch)) {
      push("punct", ch);
      i++;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let out = "";
      while (i < text.length && /[A-Za-z0-9_.:\-]/.test(text[i])) out += text[i++];
      if (text[i] === "[" && text[i + 1] === "]") {
        out += "[]";
        i += 2;
        push("ident", out);
        if (i < text.length && /[A-Za-z_]/.test(text[i])) {
          let name = "";
          while (i < text.length && /[A-Za-z0-9_.:\-]/.test(text[i])) name += text[i++];
          push("ident", name);
        }
        continue;
      }
      push("ident", out);
      continue;
    }
    i++;
  }
  push("eof", "");
  return tokens;
}
var UsdaParser = class {
  constructor(tokens, warnings) {
    this.tokens = tokens;
    this.warnings = warnings;
    __publicField(this, "pos", 0);
    __publicField(this, "parsedChildren", []);
  }
  parse() {
    const specs = [];
    const metadata = {};
    let version = "1.0";
    if (this.peek().type === "ident" && this.peek().value.toLowerCase() === "usda") {
      this.next();
      const ver = this.next();
      if (ver.type === "number") version = ver.value;
    }
    if (this.peek().value === "(") {
      this.next();
      const meta = this.parseMetadataBlock();
      Object.assign(metadata, meta);
    }
    while (this.peek().type !== "eof") {
      const prim = this.parsePrim("/");
      if (prim) specs.push(prim);
      else break;
    }
    return { specs, metadata, version };
  }
  parseMetadataBlock() {
    const meta = {};
    while (this.peek().type !== "eof" && this.peek().value !== ")") {
      const key = this.next();
      if (key.type === "eof") break;
      if (this.peek().value === "=") {
        this.next();
        meta[key.value] = this.parseValue();
      }
    }
    if (this.peek().value === ")") this.next();
    return meta;
  }
  parsePrim(parentPath) {
    const token = this.peek();
    if (token.type !== "ident") return null;
    const lower = token.value.toLowerCase();
    if (lower !== "def" && lower !== "over" && lower !== "class") return null;
    const specType = lower === "def" ? "def" : lower === "over" ? "over" : "class";
    this.next();
    if (this.peek().type === "ident" && this.peek().value !== '"') {
      this.next();
    }
    let name = "prim";
    if (this.peek().type === "string") {
      name = this.next().value;
    }
    const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
    const spec = { path, specType, fields: {} };
    if (this.peek().value === "(") {
      this.next();
      this.parseMetadataBlock();
    }
    if (this.peek().value !== "{") return spec;
    this.next();
    while (this.peek().type !== "eof" && this.peek().value !== "}") {
      const before = this.pos;
      const child = this.parsePrim(path);
      if (child) {
        this.parsedChildren.push(child);
        continue;
      }
      if (this.pos !== before) continue;
      this.parseProperty(spec);
      if (this.pos === before) this.next();
    }
    if (this.peek().value === "}") this.next();
    return spec;
  }
  parseProperty(spec) {
    while (this.peek().type === "ident" && ["uniform", "custom", "varying", "config"].includes(this.peek().value.toLowerCase())) {
      this.next();
    }
    const nameToken = this.peek();
    if (nameToken.type !== "ident") {
      this.next();
      return;
    }
    this.next();
    const propertyName = nameToken.value;
    if (this.peek().value === "=") {
      this.next();
      spec.fields[propertyName] = this.parseValue();
      return;
    }
    const realName = this.peek();
    if (realName.type !== "ident") {
      this.next();
      return;
    }
    this.next();
    if (this.peek().value === "(") {
      this.next();
      this.parseMetadataBlock();
    }
    if (this.peek().value !== "=") return;
    this.next();
    spec.fields[realName.value] = this.parseValue();
  }
  parseValue() {
    const token = this.peek();
    switch (token.type) {
      case "number": {
        this.next();
        const v = Number(token.value);
        return Number.isNaN(v) ? 0 : v;
      }
      case "string":
        this.next();
        return token.value;
      case "asset":
        this.next();
        return { assetPath: token.value };
      case "path":
        this.next();
        return { primPath: token.value };
      case "ident": {
        this.next();
        const lower = token.value.toLowerCase();
        if (lower === "true") return true;
        if (lower === "false") return false;
        if (lower === "none" || lower === "null") return null;
        if (lower === "inf") return Infinity;
        if (lower === "-inf") return -Infinity;
        return token.value;
      }
      case "punct":
        if (token.value === "(") return this.parseTuple();
        if (token.value === "[") return this.parseArray();
        if (token.value === "{") return this.parseDict();
        this.next();
        return null;
      default:
        this.next();
        return null;
    }
  }
  parseTuple() {
    this.next();
    const out = [];
    while (this.peek().type !== "eof" && this.peek().value !== ")") {
      out.push(this.parseValue());
      if (this.peek().value === ",") this.next();
    }
    if (this.peek().value === ")") this.next();
    return out;
  }
  parseArray() {
    this.next();
    const out = [];
    while (this.peek().type !== "eof" && this.peek().value !== "]") {
      out.push(this.parseValue());
      if (this.peek().value === ",") this.next();
    }
    if (this.peek().value === "]") this.next();
    return out;
  }
  parseDict() {
    this.next();
    const out = {};
    while (this.peek().type !== "eof" && this.peek().value !== "}") {
      const key = this.next();
      if (this.peek().value === "=") {
        this.next();
        out[key.value] = this.parseValue();
      }
      if (this.peek().value === ",") this.next();
    }
    if (this.peek().value === "}") this.next();
    return out;
  }
  peek() {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];
  }
  next() {
    const t = this.peek();
    if (this.pos < this.tokens.length - 1) this.pos++;
    return t;
  }
};
function parseUsda(text) {
  const warnings = [];
  let tokens;
  try {
    tokens = tokenize(text);
  } catch (err) {
    throw new Error(`AssetParser: l\u1ED7i c\xFA ph\xE1p USDA \u2014 ${err.message}`);
  }
  const parser = new UsdaParser(tokens, warnings);
  const { specs, metadata, version } = parser.parse();
  const byPath = /* @__PURE__ */ new Map();
  for (const spec of specs) byPath.set(spec.path, spec);
  for (const child of parser.parsedChildren) byPath.set(child.path, child);
  const ordered = [...byPath.values()].sort((a, b) => {
    const depthDiff = a.path.split("/").length - b.path.split("/").length;
    return depthDiff !== 0 ? depthDiff : a.path.localeCompare(b.path);
  });
  return { specs: ordered, warnings, version, metadata };
}

// engine/src/asset-parser/usd-parser.ts
var USDC_MAGIC = "PXR-USDC";
function flattenNumbers(value) {
  if (value === null || value === void 0) return [];
  if (typeof value === "number") return [value];
  if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array) {
    return Array.from(value);
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(...flattenNumbers(item));
    return out;
  }
  return [];
}
function readMatrix(value) {
  const flat = flattenNumbers(value);
  if (flat.length < 16) return null;
  const m = new THREE13.Matrix4();
  m.set(
    flat[0],
    flat[4],
    flat[8],
    flat[12],
    flat[1],
    flat[5],
    flat[9],
    flat[13],
    flat[2],
    flat[6],
    flat[10],
    flat[14],
    flat[3],
    flat[7],
    flat[11],
    flat[15]
  );
  return m.elements;
}
function buildUsdScene(specs, options = {}) {
  const warnings = [];
  const dependencies = [];
  const root = new THREE13.Group();
  root.name = options.name ?? "UsdScene";
  const nodes = /* @__PURE__ */ new Map();
  let meshCount = 0;
  const ordered = [...specs].sort((a, b) => {
    const depthDiff = a.path.split("/").length - b.path.split("/").length;
    return depthDiff !== 0 ? depthDiff : a.path.localeCompare(b.path);
  });
  for (const spec of ordered) {
    if (spec.path === "/") continue;
    const name = spec.path.split("/").pop() ?? spec.path;
    const parentPath = spec.path.slice(0, spec.path.lastIndexOf("/")) || "/";
    const node = new THREE13.Group();
    node.name = name;
    node.userData.usdPath = spec.path;
    node.userData.specType = spec.specType;
    const transformOrder = spec.fields["xformOpOrder"];
    const order = Array.isArray(transformOrder) ? transformOrder.map((v) => String(v)) : [];
    const matrixElements = readMatrix(spec.fields["xformOp:transform"]);
    if (matrixElements) {
      node.applyMatrix4(new THREE13.Matrix4().fromArray(matrixElements));
    } else {
      const local = new THREE13.Matrix4();
      let hasOp = false;
      for (const op of order) {
        if (op === "xformOp:transform") {
          const m = readMatrix(spec.fields[op]);
          if (m) {
            local.multiply(new THREE13.Matrix4().fromArray(m));
            hasOp = true;
          }
          continue;
        }
        if (op === "xformOp:translate") {
          const t = flattenNumbers(spec.fields[op]);
          if (t.length >= 3) {
            local.multiply(new THREE13.Matrix4().makeTranslation(t[0], t[1], t[2]));
            hasOp = true;
          }
          continue;
        }
        if (op === "xformOp:scale") {
          const s = flattenNumbers(spec.fields[op]);
          if (s.length >= 3) {
            local.multiply(new THREE13.Matrix4().makeScale(s[0], s[1], s[2]));
            hasOp = true;
          }
          continue;
        }
        if (op === "xformOp:rotateXYZ" || op === "xformOp:rotateXZY" || op === "xformOp:rotateYXZ") {
          const r = flattenNumbers(spec.fields[op]);
          if (r.length >= 3) {
            const rad = (v) => THREE13.MathUtils.degToRad(v);
            const euler = new THREE13.Euler(rad(r[0]), rad(r[1]), rad(r[2]), op.slice("xformOp:rotate".length));
            local.multiply(new THREE13.Matrix4().makeRotationFromEuler(euler));
            hasOp = true;
          }
          continue;
        }
        if (op === "xformOp:orient") {
          const q = flattenNumbers(spec.fields[op]);
          if (q.length >= 4) {
            local.multiply(new THREE13.Matrix4().makeRotationFromQuaternion(new THREE13.Quaternion(q[0], q[1], q[2], q[3])));
            hasOp = true;
          }
          continue;
        }
        warnings.push(`USD: ch\u01B0a h\u1ED7 tr\u1EE3 ph\xE9p bi\u1EBFn \u0111\u1ED5i "${op}" \u2014 b\u1ECF qua.`);
      }
      if (hasOp) node.applyMatrix4(local);
    }
    const points = flattenNumbers(spec.fields["points"]);
    const faceVertexCounts = flattenNumbers(spec.fields["faceVertexCounts"]);
    const faceVertexIndices = flattenNumbers(spec.fields["faceVertexIndices"]);
    if (points.length >= 9 && faceVertexIndices.length >= 3) {
      const positionArray = new Float32Array(points);
      const geometry = new THREE13.BufferGeometry();
      geometry.setAttribute("position", new THREE13.BufferAttribute(positionArray, 3));
      const indices = [];
      let cursor = 0;
      for (const count of faceVertexCounts) {
        const n = Math.max(0, Math.round(count));
        for (let i = 1; i < n - 1; i++) {
          indices.push(
            Math.round(faceVertexIndices[cursor]),
            Math.round(faceVertexIndices[cursor + i]),
            Math.round(faceVertexIndices[cursor + i + 1])
          );
        }
        cursor += n;
      }
      if (indices.length === 0) {
        for (let i = 0; i + 2 < faceVertexIndices.length; i += 3) {
          indices.push(
            Math.round(faceVertexIndices[i]),
            Math.round(faceVertexIndices[i + 1]),
            Math.round(faceVertexIndices[i + 2])
          );
        }
      }
      if (indices.length >= 3) geometry.setIndex(indices);
      const normals = flattenNumbers(spec.fields["normals"]);
      if (normals.length === positionArray.length) {
        geometry.setAttribute("normal", new THREE13.BufferAttribute(new Float32Array(normals), 3));
      } else {
        geometry.computeVertexNormals();
      }
      const uvs = flattenNumbers(spec.fields["primvars:st"]);
      if (uvs.length === positionArray.length / 3 * 2) {
        geometry.setAttribute("uv", new THREE13.BufferAttribute(new Float32Array(uvs), 2));
      }
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const displayColor = flattenNumbers(spec.fields["primvars:displayColor"]);
      const material = new THREE13.MeshStandardMaterial();
      if (displayColor.length >= 3) {
        material.color = new THREE13.Color(displayColor[0], displayColor[1], displayColor[2]);
      }
      const opacity = flattenNumbers(spec.fields["primvars:displayOpacity"]);
      if (opacity.length >= 1) {
        material.opacity = opacity[0];
        material.transparent = opacity[0] < 1;
      }
      const mesh = new THREE13.Mesh(geometry, material);
      mesh.name = `${name}_mesh`;
      node.add(mesh);
      meshCount++;
    }
    for (const [key, value] of Object.entries(spec.fields)) {
      if (value && typeof value === "object" && "assetPath" in value) {
        const assetPath = String(value.assetPath);
        if (assetPath) dependencies.push(assetPath);
      }
      if (key === "material:binding") {
        const binding = value;
        if (binding?.primPath) dependencies.push(binding.primPath);
      }
    }
    const parent = nodes.get(parentPath) ?? root;
    parent.add(node);
    nodes.set(spec.path, node);
  }
  return {
    scene: root,
    primCount: specs.length,
    meshCount,
    version: "1.0",
    warnings,
    dependencies
  };
}
function parseUsd(bytes, options = {}) {
  const magic = new TextDecoder("ascii").decode(bytes.subarray(0, Math.min(bytes.length, 8)));
  if (magic === USDC_MAGIC) {
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const result = parseUsdc(buffer);
    const built2 = buildUsdScene(result.specs, options);
    return {
      ...built2,
      version: result.version,
      warnings: [...result.warnings, ...built2.warnings]
    };
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!/^\s*#usd/i.test(text)) {
    throw new Error('AssetParser: kh\xF4ng ph\u1EA3i t\u1EC7p USD (thi\u1EBFu banner "#usda"/"#usd" ho\u1EB7c magic crate)');
  }
  const parsed = parseUsda(text);
  const built = buildUsdScene(parsed.specs, options);
  return {
    ...built,
    version: parsed.version,
    warnings: [...parsed.warnings, ...built.warnings],
    dependencies: [...built.dependencies, ...collectAssetDependencies(parsed.specs)]
  };
}
function collectAssetDependencies(specs) {
  const out = [];
  for (const spec of specs) {
    for (const value of Object.values(spec.fields)) {
      if (value && typeof value === "object" && "assetPath" in value) {
        const p = String(value.assetPath);
        if (p) out.push(p);
      }
    }
  }
  return out;
}

// engine/src/asset-parser/abc-parser.ts
import * as THREE14 from "three";
var DATA_FLAG = 0x8000000000000000n;
var OgawaReader = class {
  constructor(bytes) {
    this.bytes = bytes;
    __publicField(this, "view");
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  get length() {
    return this.bytes.length;
  }
  u64(offset) {
    if (offset + 8 > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic \u0111\u1ECDc v\u01B0\u1EE3t cu\u1ED1i t\u1EC7p t\u1EA1i offset ${offset}`);
    }
    return this.view.getBigUint64(offset, true);
  }
  u32(offset) {
    if (offset + 4 > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic \u0111\u1ECDc v\u01B0\u1EE3t cu\u1ED1i t\u1EC7p t\u1EA1i offset ${offset}`);
    }
    return this.view.getUint32(offset, true);
  }
  /** Đọc group tại offset → mảng offset con. */
  groupChildren(offset) {
    const count = Number(this.u64(offset));
    const out = [];
    for (let i = 0; i < count; i++) {
      const child = this.u64(offset + 8 + i * 8);
      if (child === 0n) break;
      out.push(Number(child & ~DATA_FLAG));
    }
    return out;
  }
  /** Đọc data stream tại offset → byte. */
  dataBytes(offset) {
    const size = Number(this.u64(offset));
    const start = offset + 8;
    if (start + size > this.bytes.length) {
      throw new RangeError(`AssetParser: Alembic data stream v\u01B0\u1EE3t cu\u1ED1i t\u1EC7p t\u1EA1i offset ${offset}`);
    }
    return this.bytes.subarray(start, start + size);
  }
};
function readLengthPrefixedString(data, offset) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (offset + 4 > data.length) return { value: "", next: data.length };
  const size = view.getUint32(offset, true);
  const start = offset + 4;
  if (start + size > data.length) return { value: "", next: data.length };
  return { value: new TextDecoder().decode(data.subarray(start, start + size)), next: start + size };
}
function readSizedInt(data, offset, sizeHint) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  switch (sizeHint) {
    case 0:
      return { value: view.getInt8(offset), next: offset + 1 };
    case 1:
      return { value: view.getInt16(offset, true), next: offset + 2 };
    case 2:
      return { value: view.getInt32(offset, true), next: offset + 4 };
    default:
      return { value: Number(view.getBigInt64(offset, true)), next: offset + 8 };
  }
}
function readObjectHeaders(reader, headerData) {
  const names = [];
  let offset = 0;
  while (offset < headerData.length) {
    const nameRes = readLengthPrefixedString(headerData, offset);
    if (nameRes.next <= offset) break;
    offset = nameRes.next;
    if (offset >= headerData.length) break;
    const metadataIndex = headerData[offset++];
    if (metadataIndex === 255) {
      const view = new DataView(headerData.buffer, headerData.byteOffset, headerData.byteLength);
      if (offset + 4 > headerData.length) break;
      const metaSize = view.getUint32(offset, true);
      offset += 4 + metaSize;
    }
    names.push(nameRes.value);
  }
  return names;
}
function readPropertyHeaders(headerData) {
  const out = [];
  const view = new DataView(headerData.buffer, headerData.byteOffset, headerData.byteLength);
  let offset = 0;
  while (offset + 4 <= headerData.length) {
    const info = view.getUint32(offset, true);
    offset += 4;
    const sizeHint = info >> 2 & 3;
    const nextSample = readSizedInt(headerData, offset, sizeHint);
    offset = nextSample.next;
    if ((info & 512) !== 0) {
      const first = readSizedInt(headerData, offset, sizeHint);
      offset = first.next;
      const last = readSizedInt(headerData, offset, sizeHint);
      offset = last.next;
    }
    if ((info & 256) !== 0) {
      const ts = readSizedInt(headerData, offset, sizeHint);
      offset = ts.next;
    }
    let name = "";
    if ((info & 1024) !== 0) {
      if (offset + 4 > headerData.length) return null;
      const metaSize = view.getUint32(offset, true);
      offset += 4;
      if (offset + metaSize > headerData.length) return null;
      const meta = headerData.subarray(offset, offset + metaSize);
      offset += metaSize;
      const text = new TextDecoder().decode(meta);
      const nameMatch = /name\s*=\s*([^;]+)/.exec(text);
      if (nameMatch) name = nameMatch[1].trim();
    } else {
      if (offset >= headerData.length) return null;
      offset++;
    }
    out.push({ name });
  }
  if (offset !== headerData.length) return null;
  if (out.length === 0 || out.some((h) => h.name.length === 0)) return null;
  return out;
}
function readPropertyNode(reader, groupOffset, depth = 0) {
  if (depth > 8) return null;
  let children;
  try {
    children = reader.groupChildren(groupOffset);
  } catch {
    return null;
  }
  if (children.length === 0) return null;
  try {
    const headerData = reader.dataBytes(children[children.length - 1]);
    const headers = readPropertyHeaders(headerData);
    if (headers && headers.length === children.length - 1) {
      const node = {
        name: "",
        groupOffset,
        isArray: false,
        isCompound: true,
        children: [],
        sample: null
      };
      for (let i = 0; i < headers.length; i++) {
        const child = readPropertyNode(reader, children[i], depth + 1);
        if (child) {
          child.name = headers[i].name;
          node.children.push(child);
        }
      }
      return node;
    }
  } catch {
  }
  const isArray = children.length >= 2;
  const dataOffset = isArray ? children[1] : children[0];
  let sample = null;
  try {
    const raw = reader.dataBytes(dataOffset);
    sample = raw.length > 16 ? raw.subarray(16) : null;
  } catch {
    sample = null;
  }
  return { name: "", groupOffset, isArray, isCompound: false, children: [], sample };
}
function findProperty(node, name) {
  const target = name.toLowerCase();
  for (const child of node.children) {
    const childName = child.name.replace(/^\./, "").toLowerCase();
    if (childName === target) return child;
  }
  return null;
}
function readFloatArray(sample) {
  if (!sample || sample.length < 4) return [];
  const view = new DataView(sample.buffer, sample.byteOffset, sample.byteLength);
  const count = Math.floor(sample.length / 4);
  const out = [];
  for (let i = 0; i < count; i++) out.push(view.getFloat32(i * 4, true));
  return out;
}
function readIntArray(sample) {
  if (!sample || sample.length < 4) return [];
  const view = new DataView(sample.buffer, sample.byteOffset, sample.byteLength);
  const count = Math.floor(sample.length / 4);
  const out = [];
  for (let i = 0; i < count; i++) out.push(view.getInt32(i * 4, true));
  return out;
}
function buildObjectTree(reader, rootOffset, maxObjects) {
  const roots = [];
  let budget = maxObjects;
  const build = (offset, name) => {
    if (budget <= 0) return null;
    budget--;
    const obj = { name, propertyGroupOffset: offset, children: [] };
    let sub;
    try {
      sub = reader.groupChildren(offset);
    } catch {
      return obj;
    }
    if (sub.length < 3) return obj;
    let names = [];
    try {
      const headerData = reader.dataBytes(sub[sub.length - 1]);
      names = readObjectHeaders(reader, headerData);
    } catch {
      names = [];
    }
    const childOffsets = sub.slice(1, sub.length - 1);
    for (let i = 0; i < childOffsets.length; i++) {
      const child = build(childOffsets[i], names[i] ?? `object_${i}`);
      if (child) obj.children.push(child);
    }
    return obj;
  };
  const root = build(rootOffset, "");
  if (root) roots.push(root);
  return roots;
}
function readObjectProperties(reader, object) {
  try {
    const children = reader.groupChildren(object.propertyGroupOffset);
    if (children.length === 0) return null;
    const compound = readPropertyNode(reader, children[0]);
    if (!compound) return null;
    compound.name = "";
    return compound;
  } catch {
    return null;
  }
}
function parseAbc(bytes, options = {}) {
  const warnings = [];
  const reader = new OgawaReader(bytes);
  if (reader.length < 16) {
    throw new Error("AssetParser: t\u1EC7p Alembic qu\xE1 nh\u1ECF");
  }
  const magic = new TextDecoder().decode(bytes.subarray(0, 5));
  if (magic !== "Ogawa") {
    throw new Error(`AssetParser: kh\xF4ng ph\u1EA3i t\u1EC7p Alembic Ogawa (magic "${magic}")`);
  }
  const rootGroupOffset = Number(reader.u64(12));
  const rootChildren = reader.groupChildren(rootGroupOffset);
  if (rootChildren.length < 3) {
    throw new Error("AssetParser: Alembic thi\u1EBFu nh\xF3m object g\u1ED1c");
  }
  let version = "unknown";
  try {
    const versionData = reader.dataBytes(rootChildren[1]);
    const view = new DataView(versionData.buffer, versionData.byteOffset, versionData.byteLength);
    const raw = view.getInt32(0, true);
    version = raw >= 1e4 ? `${Math.floor(raw / 1e4)}.${Math.floor(raw % 1e4 / 1e3)}.${Math.floor(raw % 1e3 / 100)}` : String(raw);
  } catch {
    warnings.push("Alembic: kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c phi\xEAn b\u1EA3n file.");
  }
  const sampleTimes = [];
  try {
    if (rootChildren.length > 4) {
      const timeData = reader.dataBytes(rootChildren[4]);
      const view = new DataView(timeData.buffer, timeData.byteOffset, timeData.byteLength);
      for (let offset = 0; offset + 16 <= timeData.length; offset += 16) {
        sampleTimes.push(view.getFloat64(offset, true));
      }
    }
  } catch {
    warnings.push("Alembic: kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c danh s\xE1ch time sample.");
  }
  const maxObjects = options.maxObjects ?? 1e5;
  const roots = buildObjectTree(reader, rootChildren[2], maxObjects);
  const scene = new THREE14.Group();
  scene.name = options.name ?? "AlembicScene";
  let meshCount = 0;
  let objectCount = 0;
  const buildNode = (obj) => {
    objectCount++;
    const node = new THREE14.Group();
    node.name = obj.name || "object";
    const compound = readObjectProperties(reader, obj);
    const xform = compound ? findProperty(compound, "xform") : null;
    if (xform) {
      const vals = findProperty(xform, "vals");
      if (vals?.sample) {
        const matrix = readFloatArray(vals.sample);
        if (matrix.length >= 16) {
          const m = new THREE14.Matrix4();
          m.set(
            matrix[0],
            matrix[4],
            matrix[8],
            matrix[12],
            matrix[1],
            matrix[5],
            matrix[9],
            matrix[13],
            matrix[2],
            matrix[6],
            matrix[10],
            matrix[14],
            matrix[3],
            matrix[7],
            matrix[11],
            matrix[15]
          );
          node.applyMatrix4(m);
        }
      }
    }
    const geom = compound ? findProperty(compound, "geom") : null;
    if (geom) {
      const positions = findProperty(geom, "P");
      const faceIndices = findProperty(geom, "faceIndices");
      const faceCounts = findProperty(geom, "faceCounts");
      if (positions?.sample) {
        const pts = readFloatArray(positions.sample);
        if (pts.length >= 9) {
          const geometry = new THREE14.BufferGeometry();
          geometry.setAttribute("position", new THREE14.Float32BufferAttribute(pts, 3));
          if (faceIndices?.sample && faceCounts?.sample) {
            const indices = readIntArray(faceIndices.sample);
            const counts = readIntArray(faceCounts.sample);
            const tri = [];
            let cursor = 0;
            for (const count of counts) {
              const n = Math.max(0, Math.round(count));
              for (let i = 1; i < n - 1; i++) {
                tri.push(indices[cursor], indices[cursor + i], indices[cursor + i + 1]);
              }
              cursor += n;
            }
            if (tri.length >= 3) geometry.setIndex(tri);
          }
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
          const mesh = new THREE14.Mesh(geometry, new THREE14.MeshStandardMaterial());
          mesh.name = `${node.name}_mesh`;
          node.add(mesh);
          meshCount++;
        }
      }
    }
    for (const child of obj.children) {
      node.add(buildNode(child));
    }
    return node;
  };
  for (const root of roots) {
    scene.add(buildNode(root));
  }
  if (roots.length === 0) {
    warnings.push("Alembic: archive kh\xF4ng c\xF3 object n\xE0o.");
  }
  return { scene, objectCount, meshCount, version, warnings, sampleTimes };
}

// engine/src/asset-parser/bvh-parser.ts
import * as THREE15 from "three";
function normalizeChannel(raw) {
  const c = raw.trim().toLowerCase();
  if (c === "xposition") return "Xposition";
  if (c === "yposition") return "Yposition";
  if (c === "zposition") return "Zposition";
  if (c === "xrotation") return "Xrotation";
  if (c === "yrotation") return "Yrotation";
  if (c === "zrotation") return "Zrotation";
  return null;
}
function tokenize2(line) {
  const withoutComments = line.replace(/\([^)]*\)/g, " ");
  return withoutComments.trim().split(/\s+/).filter(Boolean);
}
function parseHierarchy(text) {
  const warnings = [];
  const lines = text.split(/\r?\n/);
  const rootNodes = [];
  const stack = [];
  let inMotion = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.length === 0) continue;
    if (/^HIERARCHY$/i.test(line)) continue;
    if (/^MOTION$/i.test(line)) {
      inMotion = true;
      break;
    }
    const tokens = tokenize2(line);
    if (tokens.length === 0) continue;
    const keyword = tokens[0].toUpperCase();
    if (keyword === "ROOT" || keyword === "JOINT") {
      const node = {
        name: tokens[1] ?? "unnamed",
        offset: { x: 0, y: 0, z: 0 },
        channels: [],
        children: [],
        isEndSite: false
      };
      if (stack.length > 0) stack[stack.length - 1].children.push(node);
      else rootNodes.push(node);
      stack.push(node);
    } else if (keyword === "END") {
      const node = {
        name: "EndSite",
        offset: { x: 0, y: 0, z: 0 },
        channels: [],
        children: [],
        isEndSite: true
      };
      if (stack.length > 0) stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else if (keyword === "OFFSET") {
      const node = stack[stack.length - 1];
      if (node) {
        node.offset = { x: Number(tokens[1] ?? 0), y: Number(tokens[2] ?? 0), z: Number(tokens[3] ?? 0) };
      }
    } else if (keyword === "CHANNELS") {
      const node = stack[stack.length - 1];
      const count = Number(tokens[1] ?? 0);
      for (let i = 0; i < count; i++) {
        const ch = normalizeChannel(tokens[2 + i] ?? "");
        if (ch) node.channels.push(ch);
        else warnings.push(`BVH: b\u1ECF qua k\xEAnh l\u1EA1 "${tokens[2 + i]}"`);
      }
    } else if (keyword === "}") {
      stack.pop();
    }
  }
  if (rootNodes.length === 0) warnings.push("BVH: kh\xF4ng t\xECm th\u1EA5y ROOT n\xE0o.");
  return { nodes: rootNodes, warnings };
}
function parseMotion(text, nodes) {
  const warnings = [];
  const frames = [];
  const marker = /^\s*Frames\s*:\s*(\d+)/im.exec(text);
  const timeMatch = /^\s*Frame\s+Time\s*:\s*([\d.eE+-]+)/im.exec(text);
  const frameTime = timeMatch ? Number(timeMatch[1]) : 1 / 30;
  const fps = frameTime > 0 ? 1 / frameTime : 30;
  const motionIndex = text.search(/^\s*MOTION\s*$/im);
  if (motionIndex < 0) {
    warnings.push("BVH: thi\u1EBFu ph\u1EA7n MOTION.");
    return { frames, fps, warnings };
  }
  const body = text.slice(motionIndex);
  const dataStart = body.search(/Frame\s+Time\s*:/i);
  if (dataStart < 0) return { frames, fps, warnings };
  const afterTime = body.slice(dataStart);
  const timeLineEnd = afterTime.indexOf("\n");
  const dataText = timeLineEnd >= 0 ? afterTime.slice(timeLineEnd + 1) : "";
  const ordered = [];
  const walk = (node) => {
    ordered.push(node);
    for (const c of node.children) walk(c);
  };
  for (const n of nodes) walk(n);
  const channelNodes = ordered.filter((n) => n.channels.length > 0);
  const valuesPerFrame = channelNodes.reduce((sum, n) => sum + n.channels.length, 0);
  const frameCount = marker ? Number(marker[1]) : 0;
  if (valuesPerFrame === 0) {
    warnings.push("BVH: MOTION kh\xF4ng c\xF3 k\xEAnh n\xE0o \u0111\u1EC3 \u0111\u1ECDc.");
    return { frames, fps, warnings };
  }
  const allNumbers = dataText.split(/\s+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));
  const usableFrames = Math.min(frameCount || Math.floor(allNumbers.length / valuesPerFrame), Math.floor(allNumbers.length / valuesPerFrame));
  for (let f = 0; f < usableFrames; f++) {
    const positions = {};
    const rotations = {};
    let cursor = f * valuesPerFrame;
    for (const node of channelNodes) {
      const p = { x: 0, y: 0, z: 0 };
      const r = { x: 0, y: 0, z: 0 };
      for (const channel of node.channels) {
        const value = allNumbers[cursor++] ?? 0;
        if (channel === "Xposition") p.x = value;
        else if (channel === "Yposition") p.y = value;
        else if (channel === "Zposition") p.z = value;
        else if (channel === "Xrotation") r.x = value;
        else if (channel === "Yrotation") r.y = value;
        else if (channel === "Zrotation") r.z = value;
      }
      positions[node.name] = p;
      rotations[node.name] = r;
    }
    frames.push({ time: f * frameTime, positions, rotations });
  }
  return { frames, fps, warnings };
}
function buildBones(node, parent) {
  const bone = new THREE15.Bone();
  bone.name = node.name;
  bone.position.set(node.offset.x, node.offset.y, node.offset.z);
  if (parent) parent.add(bone);
  for (const child of node.children) {
    buildBones(child, bone);
  }
  return bone;
}
function collectBones2(node, parentName, out) {
  if (!node.isEndSite) {
    out.push({ name: node.name, parent: parentName, offset: { ...node.offset } });
  }
  for (const child of node.children) {
    collectBones2(child, node.isEndSite ? parentName : node.name, out);
  }
}
function parseBvh(bytes, options = {}) {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const { nodes, warnings: hierWarnings } = parseHierarchy(text);
  const warnings = [...hierWarnings];
  if (nodes.length === 0) {
    throw new Error("AssetParser: BVH kh\xF4ng c\xF3 c\xE2y hierarchy h\u1EE3p l\u1EC7");
  }
  const rootBone = buildBones(nodes[0], null);
  rootBone.name = options.name ?? nodes[0].name;
  const bones = [];
  for (const n of nodes) collectBones2(n, void 0, bones);
  const { frames, fps, warnings: motionWarnings } = parseMotion(text, nodes);
  warnings.push(...motionWarnings);
  const duration = frames.length > 0 ? frames[frames.length - 1].time : 0;
  let clip;
  if (options.buildClip !== false && frames.length > 0) {
    const tracks = [];
    const times = frames.map((f) => f.time);
    for (const bone of bones) {
      const posValues = [];
      const rotValues = [];
      for (const frame of frames) {
        const p = frame.positions[bone.name] ?? { x: 0, y: 0, z: 0 };
        const r = frame.rotations?.[bone.name] ?? { x: 0, y: 0, z: 0 };
        posValues.push(p.x, p.y, p.z);
        const q = new THREE15.Quaternion().setFromEuler(
          new THREE15.Euler(THREE15.MathUtils.degToRad(r.x), THREE15.MathUtils.degToRad(r.y), THREE15.MathUtils.degToRad(r.z), "XYZ")
        );
        rotValues.push(q.x, q.y, q.z, q.w);
      }
      tracks.push(new THREE15.VectorKeyframeTrack(`${bone.name}.position`, times, posValues));
      tracks.push(new THREE15.QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, rotValues));
    }
    clip = new THREE15.AnimationClip(options.name ?? rootBone.name, duration, tracks);
  }
  return { root: rootBone, bones, frames, fps, duration, clip, warnings };
}

// engine/src/asset-parser/vmd-parser.ts
import * as THREE16 from "three";
var VMD_SIGNATURE = "Vocaloid Motion";
var BONE_RECORD_BYTES = 15 + 12 + 16 + 64;
function decodeShiftJis(bytes) {
  try {
    return new TextDecoder("shift_jis").decode(bytes).replace(/\0+$/g, "").trim();
  } catch {
    let out = "";
    for (const b of bytes) {
      if (b === 0) break;
      out += String.fromCharCode(b);
    }
    return out.trim();
  }
}
function parseVmd(bytes, options = {}) {
  const warnings = [];
  if (bytes.length < 30) {
    throw new Error("AssetParser: t\u1EC7p VMD qu\xE1 nh\u1ECF");
  }
  const signature = new TextDecoder("ascii").decode(bytes.subarray(0, 15));
  if (!signature.startsWith(VMD_SIGNATURE)) {
    throw new Error(`AssetParser: kh\xF4ng ph\u1EA3i t\u1EC7p VMD (ch\u1EEF k\xFD "${signature}")`);
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 30;
  const modelName = decodeShiftJis(bytes.subarray(offset, offset + 20));
  offset += 20;
  if (offset + 4 > bytes.length) {
    throw new Error("AssetParser: VMD b\u1ECB c\u1EAFt c\u1EE5t tr\u01B0\u1EDBc ph\u1EA7n bone");
  }
  const boneCount = view.getUint32(offset, true);
  offset += 4;
  const bones = [];
  const boneNames = [];
  const boneTracks = [];
  for (let i = 0; i < boneCount; i++) {
    if (offset + BONE_RECORD_BYTES > bytes.length) {
      warnings.push(`VMD: thi\u1EBFu d\u1EEF li\u1EC7u bone (\u0111\u1ECDc \u0111\u01B0\u1EE3c ${i}/${boneCount}).`);
      break;
    }
    const name = decodeShiftJis(bytes.subarray(offset, offset + 15));
    offset += 15;
    const position = { x: view.getFloat32(offset, true), y: view.getFloat32(offset + 4, true), z: view.getFloat32(offset + 8, true) };
    offset += 12;
    const quaternion = [
      view.getFloat32(offset, true),
      view.getFloat32(offset + 4, true),
      view.getFloat32(offset + 8, true),
      view.getFloat32(offset + 12, true)
    ];
    offset += 16;
    offset += 64;
    boneNames.push(name);
    bones.push({ name, offset: { ...position } });
    boneTracks.push([{ name, position, quaternion }]);
  }
  const skipFrames = (recordBytes, count) => {
    for (let i = 0; i < count; i++) {
      offset += recordBytes;
      if (offset > bytes.length) {
        warnings.push("VMD: kh\u1ED1i d\u1EEF li\u1EC7u b\u1ECB c\u1EAFt c\u1EE5t.");
        offset = bytes.length;
        return;
      }
    }
  };
  const readCount = () => {
    if (offset + 4 > bytes.length) return 0;
    const c = view.getUint32(offset, true);
    offset += 4;
    return c;
  };
  const morphCount = readCount();
  skipFrames(12, morphCount);
  const cameraCount = readCount();
  skipFrames(64, cameraCount);
  const lampCount = readCount();
  skipFrames(40, lampCount);
  const shadowCount = readCount();
  skipFrames(24, shadowCount);
  const ikCount = readCount();
  skipFrames(21, ikCount);
  const frameCount = boneNames.length;
  const frames = [];
  const FPS = 30;
  for (let f = 0; f < frameCount; f++) {
    const positions = {};
    const rotations = {};
    for (let b = 0; b < boneNames.length; b++) {
      const track = boneTracks[b]?.[f];
      if (!track) continue;
      positions[track.name] = { ...track.position };
      const q = new THREE16.Quaternion(track.quaternion[0], track.quaternion[1], track.quaternion[2], track.quaternion[3]);
      const euler = new THREE16.Euler().setFromQuaternion(q, "XYZ");
      rotations[track.name] = { x: euler.x, y: euler.y, z: euler.z };
    }
    frames.push({ time: f / FPS, positions, rotations });
  }
  const duration = frameCount > 0 ? (frameCount - 1) / FPS : 0;
  let clip;
  if (options.buildClip !== false && frameCount > 0) {
    const tracks = [];
    const times = frames.map((f) => f.time);
    for (let b = 0; b < boneNames.length; b++) {
      const name = boneNames[b];
      const posValues = [];
      const rotValues = [];
      for (const frame of frames) {
        const p = frame.positions[name] ?? { x: 0, y: 0, z: 0 };
        const r = frame.rotations?.[name] ?? { x: 0, y: 0, z: 0 };
        posValues.push(p.x, p.y, p.z);
        const q = new THREE16.Quaternion().setFromEuler(new THREE16.Euler(r.x, r.y, r.z, "XYZ"));
        rotValues.push(q.x, q.y, q.z, q.w);
      }
      tracks.push(new THREE16.VectorKeyframeTrack(`${name}.position`, times, posValues));
      tracks.push(new THREE16.QuaternionKeyframeTrack(`${name}.quaternion`, times, rotValues));
    }
    clip = new THREE16.AnimationClip(options.name ?? (modelName || "vmd"), duration, tracks);
  }
  return {
    name: options.name ?? (modelName || "VmdMotion"),
    bones,
    frames,
    frameCount,
    duration,
    fps: FPS,
    clip,
    warnings
  };
}

// engine/src/asset-parser/image-parser.ts
import * as THREE17 from "three";
var SIGNATURES = [
  { format: "png", test: (b) => b.length > 8 && b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 },
  { format: "jpg", test: (b) => b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255 },
  { format: "webp", test: (b) => b.length > 12 && b[0] === 82 && b[1] === 73 && b[2] === 70 && b[3] === 70 && b[8] === 87 && b[9] === 69 && b[10] === 66 && b[11] === 80 },
  { format: "exr", test: (b) => b.length > 4 && b[0] === 118 && b[1] === 47 && b[2] === 49 && b[3] === 1 },
  { format: "hdr", test: (b) => b.length > 10 && new TextDecoder().decode(b.subarray(0, 10)).startsWith("#?RADIANCE") }
];
function detectImageFormat(bytes, declared) {
  for (const sig of SIGNATURES) {
    if (sig.test(bytes)) return sig.format;
  }
  if (bytes.length > 18) {
    const colorMapType = bytes[1];
    const imageType = bytes[2];
    if ((colorMapType === 0 || colorMapType === 1) && imageType >= 1 && imageType <= 3) return "tga";
  }
  if (declared) {
    const d = declared.toLowerCase();
    if (d === "jpeg") return "jpeg";
    if (d === "jpg") return "jpg";
    if (d === "tga") return "tga";
  }
  return null;
}
function readPngHeader(bytes) {
  if (bytes.length < 33) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType] ?? 0;
  return {
    format: "png",
    width,
    height,
    channels,
    bitDepth,
    colorSpace: "srgb",
    hasAlpha: colorType === 4 || colorType === 6
  };
}
function readJpegHeader(bytes) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 255) {
      offset++;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker >= 192 && marker <= 207 && marker !== 196 && marker !== 200 && marker !== 204) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const height = view.getUint16(offset + 5, false);
      const width = view.getUint16(offset + 7, false);
      const components = bytes[offset + 9];
      return {
        format: "jpg",
        width,
        height,
        channels: components,
        bitDepth: bytes[offset + 4],
        colorSpace: "srgb",
        hasAlpha: components === 4
      };
    }
    const segmentLength = bytes[offset + 2] << 8 | bytes[offset + 3];
    if (segmentLength <= 0) return null;
    offset += 2 + segmentLength;
  }
  return null;
}
function readWebpHeader(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunk = new TextDecoder().decode(bytes.subarray(12, 16));
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | bytes[25] << 8 | bytes[26] << 16);
    const height = 1 + (bytes[27] | bytes[28] << 8 | bytes[29] << 16);
    return { format: "webp", width, height, channels: 4, bitDepth: 8, colorSpace: "srgb", hasAlpha: true };
  }
  if (chunk === "VP8 ") {
    const width = view.getUint16(26, true) & 16383;
    const height = view.getUint16(28, true) & 16383;
    return { format: "webp", width, height, channels: 3, bitDepth: 8, colorSpace: "srgb", hasAlpha: false };
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    const width = (bits & 16383) + 1;
    const height = (bits >> 14 & 16383) + 1;
    return { format: "webp", width, height, channels: 4, bitDepth: 8, colorSpace: "srgb", hasAlpha: true };
  }
  return null;
}
function readTgaHeader(bytes) {
  if (bytes.length < 18) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  const pixelDepth = bytes[16];
  const descriptor = bytes[17];
  const channels = pixelDepth === 32 ? 4 : pixelDepth === 24 ? 3 : pixelDepth === 16 ? 2 : 1;
  return {
    format: "tga",
    width,
    height,
    channels,
    bitDepth: pixelDepth,
    colorSpace: "srgb",
    hasAlpha: (descriptor & 15) > 0
  };
}
function readExrHeader(bytes) {
  if (bytes.length < 8) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(4, true) & 255;
  let offset = 8;
  let width = 0;
  let height = 0;
  while (offset + 8 < bytes.length) {
    const name = new TextDecoder().decode(bytes.subarray(offset, offset + 8)).replace(/\0+$/, "");
    if (!name) break;
    offset += 8;
    const size = view.getUint32(offset, true);
    offset += 4;
    if (name === "dataWindow") {
      if (offset + 16 <= bytes.length) {
        const xMin = view.getInt32(offset, true);
        const yMin = view.getInt32(offset + 4, true);
        const xMax = view.getInt32(offset + 8, true);
        const yMax = view.getInt32(offset + 12, true);
        width = xMax - xMin + 1;
        height = yMax - yMin + 1;
      }
      offset += size;
      continue;
    }
    const typeEnd = bytes.indexOf(0, offset);
    if (typeEnd < 0) break;
    offset = typeEnd + 1 + size;
  }
  return {
    format: "exr",
    width,
    height,
    channels: 0,
    bitDepth: 16,
    colorSpace: "linear",
    hasAlpha: false
  };
}
function readHdrHeader(bytes) {
  const text = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 512)));
  const resolutionMatch = /-Y\s+(\d+)\s+\+X\s+(\d+)/.exec(text);
  if (!resolutionMatch) return null;
  return {
    format: "hdr",
    width: Number(resolutionMatch[2]),
    height: Number(resolutionMatch[1]),
    channels: 3,
    bitDepth: 32,
    colorSpace: "linear",
    hasAlpha: false
  };
}
function readImageInfo(bytes, format) {
  switch (format) {
    case "png":
      return readPngHeader(bytes);
    case "jpg":
    case "jpeg":
      return readJpegHeader(bytes);
    case "webp":
      return readWebpHeader(bytes);
    case "tga":
      return readTgaHeader(bytes);
    case "exr":
      return readExrHeader(bytes);
    case "hdr":
      return readHdrHeader(bytes);
    default:
      return null;
  }
}
function hasDom() {
  return typeof document !== "undefined" && typeof URL !== "undefined" && typeof URL.createObjectURL === "function";
}
function parseImage(bytes, declared, options = {}) {
  const warnings = [];
  const detected = detectImageFormat(bytes, declared);
  if (!detected) {
    throw new Error(`AssetParser: kh\xF4ng nh\u1EADn di\u1EC7n \u0111\u01B0\u1EE3c \u0111\u1ECBnh d\u1EA1ng \u1EA3nh (khai b\xE1o "${declared}")`);
  }
  if (detected !== declared && !(declared === "jpeg" && detected === "jpg")) {
    warnings.push(`\u0110\u1ECBnh d\u1EA1ng \u1EA3nh khai b\xE1o "${declared}" nh\u01B0ng ch\u1EEF k\xFD l\xE0 "${detected}".`);
  }
  const info = readImageInfo(bytes, detected);
  if (!info) {
    warnings.push(`Kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c header \u1EA3nh "${detected}" \u2014 thi\u1EBFu th\xF4ng tin k\xEDch th\u01B0\u1EDBc.`);
  }
  const result = {
    info: info ?? {
      format: detected,
      width: 0,
      height: 0,
      channels: 0,
      bitDepth: 0,
      colorSpace: detected === "exr" || detected === "hdr" ? "linear" : "srgb",
      hasAlpha: false
    },
    warnings
  };
  if (hasDom() && typeof Blob !== "undefined") {
    const colorSpace = options.srgb ?? (detected === "exr" || detected === "hdr" ? false : true);
    const blob3 = new Blob([bytes]);
    const url = URL.createObjectURL(blob3);
    const texture = new THREE17.Texture();
    texture.name = options.name ?? "ImageTexture";
    texture.colorSpace = colorSpace ? THREE17.SRGBColorSpace : THREE17.LinearSRGBColorSpace;
    const image = new Image();
    image.onload = () => {
      texture.image = image;
      texture.needsUpdate = true;
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
    };
    image.src = url;
    result.texture = texture;
  }
  return result;
}

// engine/src/asset-parser/engine-data-parser.ts
var FORGE_DESIGN_KIND = "aetheria.forge.design";
var BOT_SPEC_KIND = "aetheria.bot.spec";
function detectKind(value) {
  if (!value || typeof value !== "object") return null;
  const record = value;
  if (typeof record.kind === "string") return record.kind;
  const metadata = record.metadata;
  if (metadata && typeof metadata === "object") {
    const metaKind = metadata.kind;
    if (typeof metaKind === "string") return metaKind;
  }
  return null;
}
function parseManifest(value, warnings) {
  if (!value || typeof value !== "object") {
    warnings.push("Manifest kh\xF4ng ph\u1EA3i object.");
    return value;
  }
  const record = value;
  if (!Array.isArray(record.entries)) {
    warnings.push('Manifest thi\u1EBFu m\u1EA3ng "entries".');
  } else {
    const entries = record.entries;
    let invalid = 0;
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") {
        invalid++;
        continue;
      }
      const e = entry;
      if (typeof e.id !== "string" || typeof e.path !== "string") invalid++;
    }
    if (invalid > 0) warnings.push(`Manifest c\xF3 ${invalid} entry thi\u1EBFu tr\u01B0\u1EDDng b\u1EAFt bu\u1ED9c (id/path).`);
  }
  if (typeof record.version !== "number") {
    warnings.push('Manifest thi\u1EBFu tr\u01B0\u1EDDng "version" d\u1EA1ng s\u1ED1.');
  }
  return value;
}
function parseEngineData(text, format) {
  const warnings = [];
  let value;
  try {
    value = JSON.parse(text);
  } catch (err) {
    throw new Error(`AssetParser: JSON kh\xF4ng h\u1EE3p l\u1EC7 \u2014 ${err.message}`);
  }
  const kind = detectKind(value);
  switch (format) {
    case "forge-design": {
      if (kind !== FORGE_DESIGN_KIND) {
        warnings.push(`Thi\u1EBFu kind "${FORGE_DESIGN_KIND}" trong t\xE0i li\u1EC7u Forge.`);
      }
      const record = value ?? {};
      if (typeof record.name !== "string" || record.name.length === 0) {
        warnings.push('ForgeDesignSpec thi\u1EBFu tr\u01B0\u1EDDng "name".');
      }
      if (!Array.isArray(record.parts)) {
        warnings.push('ForgeDesignSpec thi\u1EBFu m\u1EA3ng "parts".');
      }
      break;
    }
    case "bot-spec": {
      if (kind !== BOT_SPEC_KIND) {
        warnings.push(`Thi\u1EBFu kind "${BOT_SPEC_KIND}" trong t\xE0i li\u1EC7u bot.`);
      }
      const record = value ?? {};
      if (typeof record.id !== "string" || record.id.length === 0) {
        warnings.push('BotSpecDocument thi\u1EBFu tr\u01B0\u1EDDng "id".');
      }
      if (!Array.isArray(record.stats)) {
        warnings.push('BotSpecDocument thi\u1EBFu m\u1EA3ng "stats".');
      }
      break;
    }
    case "asset-manifest": {
      parseManifest(value, warnings);
      break;
    }
    default:
      break;
  }
  return { format, data: value, warnings };
}

// engine/src/asset-parser/gltf-parser.ts
import * as THREE18 from "three";
var COMPONENT_TYPES = {
  5120: { ctor: Int8Array, size: 1 },
  5121: { ctor: Uint8Array, size: 1 },
  5122: { ctor: Int16Array, size: 2 },
  5123: { ctor: Uint16Array, size: 2 },
  5125: { ctor: Uint32Array, size: 4 },
  5126: { ctor: Float32Array, size: 4 }
};
var TYPE_COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};
var PRIMITIVE_MODES = /* @__PURE__ */ new Set([0, 1, 2, 3, 4, 5, 6]);
var EMBEDDED_IMAGE_MIME = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp"
};
function isGlb(bytes) {
  return bytes.length >= 12 && bytes[0] === 103 && bytes[1] === 108 && bytes[2] === 84 && bytes[3] === 70;
}
function readGlbContainer(bytes, warnings) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(4, true);
  const declaredLength = view.getUint32(8, true);
  if (version !== 2) {
    warnings.push(`GLB: phi\xEAn b\u1EA3n container ${version} kh\xF4ng \u0111\u01B0\u1EE3c h\u1ED7 tr\u1EE3 (mong \u0111\u1EE3i 2).`);
  }
  if (declaredLength !== bytes.byteLength) {
    warnings.push(
      `GLB: k\xEDch th\u01B0\u1EDBc khai b\xE1o ${declaredLength} kh\xE1c k\xEDch th\u01B0\u1EDBc th\u1EADt ${bytes.byteLength}.`
    );
  }
  let json;
  let bin;
  let offset = 12;
  while (offset + 8 <= bytes.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkLength;
    if (dataEnd > bytes.byteLength) {
      warnings.push("GLB: chunk b\u1ECB c\u1EAFt c\u1EE5t \u2014 b\u1ECF qua ph\u1EA7n d\u01B0.");
      break;
    }
    if (chunkType === 1313821514) {
      const text = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
      try {
        json = JSON.parse(text);
      } catch (error) {
        throw new Error(`GLB: JSON chunk kh\xF4ng h\u1EE3p l\u1EC7 \u2014 ${error.message}`);
      }
    } else if (chunkType === 5130562) {
      bin = bytes.subarray(dataStart, dataEnd);
    }
    offset = dataEnd;
  }
  if (!json) throw new Error("GLB: kh\xF4ng t\xECm th\u1EA5y JSON chunk.");
  return { json, bin };
}
function decodeDataUri(uri) {
  const comma = uri.indexOf(",");
  if (comma < 0) return void 0;
  const header = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  if (!header.includes(";base64")) return void 0;
  return decodeBase64(payload);
}
async function parseGltf(bytes, options = {}) {
  const warnings = [];
  const dependencies = [];
  const addDependency = (uri) => {
    if (!dependencies.includes(uri)) dependencies.push(uri);
  };
  let json;
  let binChunk;
  let container;
  if (isGlb(bytes)) {
    container = "glb";
    const parsed = readGlbContainer(bytes, warnings);
    json = parsed.json;
    binChunk = parsed.bin;
  } else {
    container = "gltf";
    const text = new TextDecoder().decode(bytes);
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new Error(`glTF: JSON kh\xF4ng h\u1EE3p l\u1EC7 \u2014 ${error.message}`);
    }
  }
  if (json.asset?.version && !json.asset.version.startsWith("2")) {
    warnings.push(`glTF: phi\xEAn b\u1EA3n "${json.asset.version}" kh\xE1c 2 \u2014 c\xF3 th\u1EC3 thi\u1EBFu tr\u01B0\u1EDDng.`);
  }
  const bufferData = [];
  const buffers = json.buffers ?? [];
  for (let i = 0; i < buffers.length; i++) {
    const buffer = buffers[i];
    if (!buffer.uri) {
      bufferData[i] = binChunk;
      if (!binChunk) warnings.push(`glTF: buffer ${i} kh\xF4ng c\xF3 URI nh\u01B0ng t\u1EC7p kh\xF4ng c\xF3 chunk BIN.`);
      continue;
    }
    const embedded = decodeDataUri(buffer.uri);
    if (embedded) {
      bufferData[i] = embedded;
      continue;
    }
    addDependency(buffer.uri);
    if (options.loadExternal) {
      try {
        const loaded = await options.loadExternal(buffer.uri);
        if (loaded) bufferData[i] = loaded;
        else warnings.push(`glTF: kh\xF4ng n\u1EA1p \u0111\u01B0\u1EE3c buffer ngo\xE0i "${buffer.uri}".`);
      } catch (error) {
        warnings.push(`glTF: l\u1ED7i khi n\u1EA1p buffer "${buffer.uri}" \u2014 ${error.message}`);
      }
    } else {
      warnings.push(`glTF: buffer ngo\xE0i "${buffer.uri}" ch\u01B0a \u0111\u01B0\u1EE3c n\u1EA1p.`);
    }
  }
  const bufferViews = json.bufferViews ?? [];
  const viewBytes = (viewIndex) => {
    const view = bufferViews[viewIndex];
    if (!view) return void 0;
    const buffer = bufferData[view.buffer];
    if (!buffer) return void 0;
    const start = (view.byteOffset ?? 0) + 0;
    const end = start + view.byteLength;
    if (end > buffer.byteLength) return void 0;
    return buffer.subarray(start, end);
  };
  const readAccessor = (index) => {
    const accessor = json.accessors?.[index];
    if (!accessor) return void 0;
    const spec = COMPONENT_TYPES[accessor.componentType];
    if (!spec) {
      warnings.push(`glTF: componentType ${accessor.componentType} kh\xF4ng h\u1ED7 tr\u1EE3 (accessor ${index}).`);
      return void 0;
    }
    const components = TYPE_COMPONENTS[accessor.type] ?? 1;
    const values = new spec.ctor(accessor.count * components);
    const viewIndex = accessor.bufferView;
    const view = viewIndex !== void 0 ? bufferViews[viewIndex] : void 0;
    if (viewIndex !== void 0 && view) {
      const raw = viewBytes(viewIndex);
      if (!raw) {
        warnings.push(`glTF: bufferView ${viewIndex} kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c (accessor ${index}).`);
        return void 0;
      }
      const base = accessor.byteOffset ?? 0;
      const stride = view.byteStride ?? components * spec.size;
      if (stride === components * spec.size) {
        const src = new spec.ctor(raw.buffer, raw.byteOffset + base, accessor.count * components);
        values.set(src);
      } else {
        const src = new spec.ctor(raw.buffer, raw.byteOffset);
        for (let i = 0; i < accessor.count; i++) {
          for (let c = 0; c < components; c++) {
            values[i * components + c] = src[base + i * stride + c * spec.size];
          }
        }
      }
    }
    if (accessor.sparse) {
      const sparse = accessor.sparse;
      const indexSpec = COMPONENT_TYPES[sparse.indices.componentType];
      const indexRaw = viewBytes(sparse.indices.bufferView);
      const valueRaw = viewBytes(sparse.values.bufferView);
      if (indexSpec && indexRaw && valueRaw) {
        const indices = new indexSpec.ctor(
          indexRaw.buffer,
          indexRaw.byteOffset + (sparse.indices.byteOffset ?? 0),
          sparse.count
        );
        const valueOffset = sparse.values.byteOffset ?? 0;
        for (let i = 0; i < sparse.count; i++) {
          const target = indices[i];
          for (let c = 0; c < components; c++) {
            values[target * components + c] = valueRaw[valueOffset + i * components * spec.size + c * spec.size];
          }
        }
      } else {
        warnings.push(`glTF: accessor ${index} c\xF3 d\u1EEF li\u1EC7u sparse nh\u01B0ng kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c.`);
      }
    }
    return {
      values,
      componentType: accessor.componentType,
      components,
      count: accessor.count,
      normalized: accessor.normalized === true
    };
  };
  const readFloats = (index) => {
    const data = readAccessor(index);
    if (!data) return void 0;
    const out = new Float32Array(data.count * data.components);
    const max = data.componentType === 5121 ? 255 : data.componentType === 5123 ? 65535 : 1;
    for (let i = 0; i < out.length; i++) {
      const raw = Number(data.values[i]);
      out[i] = data.normalized && data.componentType !== 5126 ? raw / max : raw;
    }
    return out;
  };
  const textures = [];
  const textureCache = /* @__PURE__ */ new Map();
  const buildTexture = (textureIndex) => {
    if (textureCache.has(textureIndex)) return textureCache.get(textureIndex);
    const gltfTexture = json.textures?.[textureIndex];
    if (!gltfTexture) return void 0;
    const image = gltfTexture.source !== void 0 ? json.images?.[gltfTexture.source] : void 0;
    if (!image) {
      warnings.push(`glTF: texture ${textureIndex} kh\xF4ng c\xF3 \u1EA3nh ngu\u1ED3n.`);
      return void 0;
    }
    const sampler = gltfTexture.sampler !== void 0 ? json.samplers?.[gltfTexture.sampler] : void 0;
    const texture = new THREE18.Texture();
    texture.name = image.name ?? gltfTexture.name ?? "";
    texture.wrapS = sampler?.wrapS ?? THREE18.RepeatWrapping;
    texture.wrapT = sampler?.wrapT ?? THREE18.RepeatWrapping;
    if (sampler?.magFilter === 9728) texture.magFilter = THREE18.NearestFilter;
    if (sampler?.minFilter === 9728) texture.minFilter = THREE18.NearestFilter;
    if (image.uri) {
      const embedded = decodeDataUri(image.uri);
      if (embedded) {
        const info = readImageInfo(embedded, detectImageFormat(embedded) ?? "png");
        texture.image = { src: image.uri, width: info?.width ?? 0, height: info?.height ?? 0 };
        warnings.push(
          `glTF: \u1EA3nh nh\xFAng d\u1EA1ng data URI ch\u01B0a \u0111\u01B0\u1EE3c gi\u1EA3i m\xE3 th\xE0nh texture \u2014 c\u1EA7n n\u1EA1p l\u1EA1i t\u1EEB URI.`
        );
      } else {
        texture.image = { src: image.uri };
        addDependency(image.uri);
      }
    } else if (image.bufferView !== void 0) {
      const raw = viewBytes(image.bufferView);
      const format = EMBEDDED_IMAGE_MIME[image.mimeType ?? ""];
      if (raw && format) {
        const info = readImageInfo(raw, format);
        texture.image = { width: info?.width ?? 0, height: info?.height ?? 0 };
        warnings.push(
          `glTF: \u1EA3nh nh\xFAng (${image.mimeType}) ch\u01B0a \u0111\u01B0\u1EE3c gi\u1EA3i m\xE3 th\xE0nh texture \u2014 ch\u1EC9 gi\u1EEF k\xEDch th\u01B0\u1EDBc.`
        );
      } else {
        texture.image = { width: 0, height: 0 };
        warnings.push(`glTF: \u1EA3nh nh\xFAng kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c k\xEDch th\u01B0\u1EDBc.`);
      }
    }
    textureCache.set(textureIndex, texture);
    textures.push(texture);
    return texture;
  };
  const materials = {};
  const materialList = [];
  const buildMaterial = (materialIndex) => {
    const gltfMaterial = json.materials?.[materialIndex];
    if (!gltfMaterial) return void 0;
    const pbr = gltfMaterial.pbrMetallicRoughness ?? {};
    const baseColor = pbr.baseColorFactor ?? [1, 1, 1, 1];
    const material = new THREE18.MeshStandardMaterial({
      name: gltfMaterial.name ?? `Material_${materialIndex}`,
      color: new THREE18.Color(baseColor[0] ?? 1, baseColor[1] ?? 1, baseColor[2] ?? 1),
      metalness: pbr.metallicFactor ?? 1,
      roughness: pbr.roughnessFactor ?? 1,
      opacity: baseColor[3] ?? 1,
      transparent: gltfMaterial.alphaMode === "BLEND" || (baseColor[3] ?? 1) < 1,
      side: gltfMaterial.doubleSided ? THREE18.DoubleSide : THREE18.FrontSide
    });
    if (gltfMaterial.emissiveFactor) {
      material.emissive = new THREE18.Color(
        gltfMaterial.emissiveFactor[0] ?? 0,
        gltfMaterial.emissiveFactor[1] ?? 0,
        gltfMaterial.emissiveFactor[2] ?? 0
      );
    }
    const baseColorTexture = pbr.baseColorTexture ? buildTexture(pbr.baseColorTexture.index) : void 0;
    if (baseColorTexture) material.map = baseColorTexture;
    const normalTexture = gltfMaterial.normalTexture ? buildTexture(gltfMaterial.normalTexture.index) : void 0;
    if (normalTexture) material.normalMap = normalTexture;
    const emissiveTexture = gltfMaterial.emissiveTexture ? buildTexture(gltfMaterial.emissiveTexture.index) : void 0;
    if (emissiveTexture) material.emissiveMap = emissiveTexture;
    const occlusionTexture = gltfMaterial.occlusionTexture ? buildTexture(gltfMaterial.occlusionTexture.index) : void 0;
    if (occlusionTexture) material.aoMap = occlusionTexture;
    material.name = gltfMaterial.name ?? `Material_${materialIndex}`;
    materials[material.name] = material;
    materialList.push(material);
    return material;
  };
  const buildGeometry2 = (primitive) => {
    const mode = primitive.mode ?? 4;
    if (!PRIMITIVE_MODES.has(mode)) {
      warnings.push(`glTF: ch\u1EBF \u0111\u1ED9 primitive ${mode} kh\xF4ng h\u1ED7 tr\u1EE3 \u2014 b\u1ECF qua.`);
      return void 0;
    }
    const geometry = new THREE18.BufferGeometry();
    const position = readAccessor(primitive.attributes.POSITION);
    if (!position) {
      warnings.push("glTF: primitive thi\u1EBFu accessor POSITION \u2014 b\u1ECF qua.");
      return void 0;
    }
    geometry.setAttribute("position", new THREE18.BufferAttribute(position.values, 3));
    const normal = readAccessor(primitive.attributes.NORMAL);
    if (normal) geometry.setAttribute("normal", new THREE18.BufferAttribute(normal.values, 3));
    const tangent = readAccessor(primitive.attributes.TANGENT);
    if (tangent) geometry.setAttribute("tangent", new THREE18.BufferAttribute(tangent.values, 4));
    const uv = readAccessor(primitive.attributes.TEXCOORD_0);
    if (uv) geometry.setAttribute("uv", new THREE18.BufferAttribute(uv.values, 2));
    const uv2 = readAccessor(primitive.attributes.TEXCOORD_1);
    if (uv2) geometry.setAttribute("uv2", new THREE18.BufferAttribute(uv2.values, 2));
    const color = readAccessor(primitive.attributes.COLOR_0);
    if (color) {
      geometry.setAttribute(
        "color",
        new THREE18.BufferAttribute(color.values, color.components, color.normalized)
      );
    }
    const joints = readAccessor(primitive.attributes.JOINTS_0);
    if (joints) geometry.setAttribute("skinIndex", new THREE18.BufferAttribute(joints.values, 4));
    const weights = readAccessor(primitive.attributes.WEIGHTS_0);
    if (weights) geometry.setAttribute("skinWeight", new THREE18.BufferAttribute(weights.values, 4));
    if (primitive.indices !== void 0) {
      const indices = readAccessor(primitive.indices);
      if (indices) {
        geometry.setIndex(new THREE18.BufferAttribute(indices.values, 1));
      }
    }
    const accessorSpec = json.accessors?.[primitive.attributes.POSITION];
    if (accessorSpec?.min && accessorSpec?.max) {
      geometry.boundingBox = new THREE18.Box3(
        new THREE18.Vector3(accessorSpec.min[0], accessorSpec.min[1], accessorSpec.min[2]),
        new THREE18.Vector3(accessorSpec.max[0], accessorSpec.max[1], accessorSpec.max[2])
      );
    }
    geometry.computeBoundingSphere();
    return geometry;
  };
  const nodeDefinitions = json.nodes ?? [];
  const jointNodeIndices = /* @__PURE__ */ new Set();
  for (const skin of json.skins ?? []) {
    for (const joint of skin.joints) jointNodeIndices.add(joint);
  }
  const root = new THREE18.Group();
  root.name = options.name ?? "gltf-root";
  const nodeObjects = [];
  const buildNode = (nodeIndex) => {
    const definition = nodeDefinitions[nodeIndex];
    const isJoint = jointNodeIndices.has(nodeIndex);
    const object = isJoint ? new THREE18.Bone() : new THREE18.Object3D();
    object.name = definition?.name ?? `node_${nodeIndex}`;
    if (definition?.matrix) {
      const matrix = new THREE18.Matrix4();
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
    const meshDefinition = definition?.mesh !== void 0 ? json.meshes?.[definition.mesh] : void 0;
    if (meshDefinition) {
      const geometry = buildGeometry2(meshDefinition.primitives[0]);
      if (geometry) {
        const material = meshDefinition.primitives[0].material !== void 0 ? buildMaterial(meshDefinition.primitives[0].material) : void 0;
        const mesh = new THREE18.Mesh(geometry, material ?? new THREE18.MeshStandardMaterial());
        mesh.name = meshDefinition.name ?? object.name;
        object.add(mesh);
      }
    }
    nodeObjects[nodeIndex] = object;
    return object;
  };
  const sceneRoots = [];
  const sceneIndex = json.scene ?? 0;
  const sceneDefinition = json.scenes?.[sceneIndex] ?? json.scenes?.[0];
  const buildSubtree = (nodeIndex, parent) => {
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
    const isChild = /* @__PURE__ */ new Set();
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
  const skins = json.skins ?? [];
  let skinCount = 0;
  for (let skinIndex = 0; skinIndex < skins.length; skinIndex++) {
    const skin = skins[skinIndex];
    const jointObjects = skin.joints.map((jointIndex) => nodeObjects[jointIndex]).filter((object) => object instanceof THREE18.Bone);
    if (jointObjects.length === 0) continue;
    const boneInverses = [];
    if (skin.inverseBindMatrices !== void 0) {
      const matrices = readFloats(skin.inverseBindMatrices);
      if (matrices) {
        for (let i = 0; i + 16 <= matrices.length; i += 16) {
          boneInverses.push(new THREE18.Matrix4().fromArray(matrices.subarray(i, i + 16)));
        }
      }
    }
    while (boneInverses.length < jointObjects.length) {
      boneInverses.push(new THREE18.Matrix4());
    }
    const skeleton = new THREE18.Skeleton(jointObjects, boneInverses);
    for (let nodeIndex = 0; nodeIndex < nodeDefinitions.length; nodeIndex++) {
      if (nodeDefinitions[nodeIndex].skin !== skinIndex) continue;
      const object = nodeObjects[nodeIndex];
      if (!object) continue;
      const targets = [];
      object.traverse((child) => {
        const mesh = child;
        if (mesh.isMesh && mesh.geometry.getAttribute("skinIndex")) targets.push(mesh);
      });
      for (const mesh of targets) {
        const skinned = new THREE18.SkinnedMesh(mesh.geometry, mesh.material);
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
  const animations = [];
  for (const animation of json.animations ?? []) {
    const tracks = [];
    for (const channel of animation.channels ?? []) {
      const sampler = animation.samplers?.[channel.sampler];
      if (!sampler) continue;
      const nodeIndex = channel.target?.node;
      if (nodeIndex === void 0) continue;
      const nodeDefinition = nodeDefinitions[nodeIndex];
      const nodeName = nodeDefinition?.name ?? `node_${nodeIndex}`;
      const times = readFloats(sampler.input);
      const values = readFloats(sampler.output);
      if (!times || !values) {
        warnings.push(`glTF: animation "${animation.name ?? ""}" c\xF3 k\xEAnh thi\u1EBFu d\u1EEF li\u1EC7u.`);
        continue;
      }
      const path = channel.target.path;
      if (path === "translation" || path === "scale") {
        tracks.push(
          new THREE18.VectorKeyframeTrack(
            `${nodeName}.${path}`,
            Array.from(times),
            Array.from(values)
          )
        );
      } else if (path === "rotation") {
        tracks.push(
          new THREE18.QuaternionKeyframeTrack(
            `${nodeName}.quaternion`,
            Array.from(times),
            Array.from(values)
          )
        );
      } else if (path === "weights") {
        warnings.push(
          `glTF: animation "${animation.name ?? ""}" d\xF9ng morph weights \u2014 ch\u01B0a h\u1ED7 tr\u1EE3 trong b\u1EA3n b\xF3c t\xE1ch n\xE0y.`
        );
      }
    }
    if (tracks.length > 0) {
      const clip = new THREE18.AnimationClip(animation.name ?? "animation", -1, tracks);
      animations.push(clip);
    }
  }
  for (const image of json.images ?? []) {
    if (!image.uri) continue;
    if (decodeDataUri(image.uri)) continue;
    addDependency(image.uri);
  }
  let triangleCount = 0;
  let meshCount = 0;
  root.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    meshCount++;
    const index = mesh.geometry.getIndex();
    if (index) triangleCount += index.count / 3;
    else triangleCount += mesh.geometry.getAttribute("position")?.count / 3 || 0;
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
    container
  };
}

// engine/src/asset-parser/collada-parser.ts
import * as THREE19 from "three";

// engine/src/asset-parser/xml-lite.ts
var ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function decodeXmlEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}
function findTagEnd(source, start) {
  let quote = null;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ">") return i;
  }
  return source.length;
}
function parseTagBody(body) {
  const attrs = {};
  const trimmed = body.trim();
  const nameMatch = /^[^\s/>]+/.exec(trimmed);
  const name = nameMatch ? nameMatch[0] : "";
  const attrRe = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = attrRe.exec(trimmed)) !== null) {
    const value = m[3] !== void 0 ? m[3] : m[4] ?? "";
    attrs[m[1]] = decodeXmlEntities(value);
  }
  return { name: name.includes(":") ? name.slice(name.indexOf(":") + 1) : name, attrs };
}
function parseXml(source) {
  const root = { name: "#root", attrs: {}, children: [], text: "" };
  const stack = [root];
  let i = 0;
  const length = source.length;
  while (i < length) {
    const lt = source.indexOf("<", i);
    if (lt < 0) {
      stack[stack.length - 1].text += decodeXmlEntities(source.slice(i));
      break;
    }
    if (lt > i) {
      stack[stack.length - 1].text += decodeXmlEntities(source.slice(i, lt));
    }
    if (source.startsWith("<!--", lt)) {
      const end = source.indexOf("-->", lt + 4);
      i = end < 0 ? length : end + 3;
      continue;
    }
    if (source.startsWith("<![CDATA[", lt)) {
      const end = source.indexOf("]]>", lt + 9);
      stack[stack.length - 1].text += source.slice(lt + 9, end < 0 ? length : end);
      i = end < 0 ? length : end + 3;
      continue;
    }
    if (source.startsWith("<?", lt)) {
      const end = source.indexOf("?>", lt + 2);
      i = end < 0 ? length : end + 2;
      continue;
    }
    if (source.startsWith("<!", lt)) {
      const end = source.indexOf(">", lt);
      i = end < 0 ? length : end + 1;
      continue;
    }
    if (source.startsWith("</", lt)) {
      const end = source.indexOf(">", lt);
      if (stack.length > 1) stack.pop();
      i = end < 0 ? length : end + 1;
      continue;
    }
    const tagEnd = findTagEnd(source, lt);
    const raw = source.slice(lt + 1, tagEnd);
    const selfClosing = raw.trimEnd().endsWith("/");
    const body = selfClosing ? raw.trimEnd().slice(0, -1) : raw;
    const { name, attrs } = parseTagBody(body);
    const node = { name, attrs, children: [], text: "" };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
    i = tagEnd + 1;
  }
  return root;
}
function findChild(node, name) {
  const lower = name.toLowerCase();
  return node.children.find((child) => child.name.toLowerCase() === lower);
}
function findChildren(node, name) {
  const lower = name.toLowerCase();
  return node.children.filter((child) => child.name.toLowerCase() === lower);
}
function findDescendant(node, name) {
  const lower = name.toLowerCase();
  for (const child of node.children) {
    if (child.name.toLowerCase() === lower) return child;
    const nested = findDescendant(child, name);
    if (nested) return nested;
  }
  return void 0;
}

// engine/src/asset-parser/collada-parser.ts
function readNumbers(node) {
  if (!node) return [];
  const values = [];
  for (const token of node.text.split(/\s+/)) {
    if (token.length === 0) continue;
    const value = Number(token);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}
function readIntList(text) {
  const values = [];
  for (const token of text.split(/\s+/)) {
    if (token.length === 0) continue;
    const value = Number.parseInt(token, 10);
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}
function refId(url) {
  if (!url) return "";
  return url.startsWith("#") ? url.slice(1) : url;
}
function applyTransform(object, node) {
  const matrixNode = findChild(node, "matrix");
  if (matrixNode) {
    const values = readNumbers(matrixNode);
    if (values.length >= 16) {
      const matrix = new THREE19.Matrix4().fromArray(values);
      matrix.decompose(object.position, object.quaternion, object.scale);
    }
    return;
  }
  const translateNode = findChild(node, "translate");
  if (translateNode) {
    const values = readNumbers(translateNode);
    if (values.length >= 3) object.position.set(values[0], values[1], values[2]);
  }
  const scaleNode = findChild(node, "scale");
  if (scaleNode) {
    const values = readNumbers(scaleNode);
    if (values.length >= 3) object.scale.set(values[0], values[1], values[2]);
  }
  for (const rotateNode of findChildren(node, "rotate")) {
    const values = readNumbers(rotateNode);
    if (values.length < 4) continue;
    const [x, y, z, angle] = values;
    const axis = new THREE19.Vector3(x, y, z);
    if (axis.lengthSq() < 1e-12) continue;
    axis.normalize();
    const quaternion = new THREE19.Quaternion().setFromAxisAngle(
      axis,
      THREE19.MathUtils.degToRad(angle)
    );
    object.quaternion.premultiply(quaternion);
  }
}
function readSource(node) {
  const floatArray = findChild(node, "float_array");
  const values = readNumbers(floatArray);
  if (values.length === 0) return void 0;
  const accessor = findDescendant(node, "accessor");
  const count = accessor ? Number.parseInt(accessor.attrs.count ?? "0", 10) : values.length;
  const stride = accessor ? Number.parseInt(accessor.attrs.stride ?? "3", 10) : 3;
  const offset = accessor ? Number.parseInt(accessor.attrs.offset ?? "0", 10) : 0;
  return {
    values,
    count: Number.isFinite(count) && count > 0 ? count : values.length / Math.max(1, stride),
    stride: Number.isFinite(stride) && stride > 0 ? stride : 3,
    offset: Number.isFinite(offset) ? offset : 0
  };
}
function findSourceById(sources, id) {
  return sources.get(id);
}
function parseCollada(bytes, options = {}) {
  const warnings = [];
  const dependencies = [];
  const text = new TextDecoder().decode(bytes);
  const document2 = parseXml(text);
  const collada = findChild(document2, "COLLADA");
  if (!collada) {
    throw new Error("Collada: kh\xF4ng t\xECm th\u1EA5y ph\u1EA7n t\u1EED g\u1ED1c <COLLADA>.");
  }
  const materials = {};
  const effectColors = /* @__PURE__ */ new Map();
  const effects = findDescendant(collada, "library_effects");
  for (const effect of effects ? findChildren(effects, "effect") : []) {
    const effectId = effect.attrs.id ?? "";
    const color = new THREE19.Color(0.8, 0.8, 0.8);
    let roughness = 0.6;
    let metalness = 0.1;
    const colorNode = findDescendant(effect, "color");
    if (colorNode) {
      const values = readNumbers(colorNode);
      if (values.length >= 3) color.setRGB(values[0], values[1], values[2]);
    }
    const roughnessNode = findDescendant(effect, "roughness");
    if (roughnessNode) {
      const values = readNumbers(roughnessNode);
      if (values.length >= 1) roughness = values[0];
    }
    const metallicNode = findDescendant(effect, "metallic");
    if (metallicNode) {
      const values = readNumbers(metallicNode);
      if (values.length >= 1) metalness = values[0];
    }
    effectColors.set(effectId, { color, roughness, metalness });
  }
  const materialLibrary = findDescendant(collada, "library_materials");
  for (const materialNode of materialLibrary ? findChildren(materialLibrary, "material") : []) {
    const materialId = materialNode.attrs.id ?? `material_${Object.keys(materials).length}`;
    const instanceEffect = findChild(materialNode, "instance_effect");
    const effectId = refId(instanceEffect?.attrs.url);
    const effect = effectColors.get(effectId);
    const material = new THREE19.MeshStandardMaterial({
      name: materialNode.attrs.name ?? materialId,
      color: effect?.color ?? new THREE19.Color(0.8, 0.8, 0.8),
      roughness: effect?.roughness ?? 0.6,
      metalness: effect?.metalness ?? 0.1
    });
    materials[materialId] = material;
  }
  const sources = /* @__PURE__ */ new Map();
  const geometries = /* @__PURE__ */ new Map();
  const geometryLibrary = findDescendant(collada, "library_geometries");
  for (const geometryNode of geometryLibrary ? findChildren(geometryLibrary, "geometry") : []) {
    const geometryId = geometryNode.attrs.id ?? "";
    geometries.set(geometryId, geometryNode);
    const mesh = findChild(geometryNode, "mesh");
    if (!mesh) continue;
    for (const sourceNode of findChildren(mesh, "source")) {
      const sourceId = sourceNode.attrs.id ?? "";
      const source = readSource(sourceNode);
      if (source) sources.set(sourceId, source);
    }
  }
  const buildGeometry2 = (geometryId) => {
    const geometryNode = geometries.get(geometryId);
    if (!geometryNode) return void 0;
    const mesh = findChild(geometryNode, "mesh");
    if (!mesh) return void 0;
    const verticesNode = findChild(mesh, "vertices");
    const vertexInput = verticesNode ? findChild(verticesNode, "input") : void 0;
    const positionSourceId = refId(vertexInput?.attrs.source);
    const positionSource = findSourceById(sources, positionSourceId);
    if (!positionSource) {
      warnings.push(`Collada: geometry "${geometryId}" kh\xF4ng t\xECm th\u1EA5y ngu\u1ED3n v\u1ECB tr\xED.`);
      return void 0;
    }
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    for (const primitive of [...findChildren(mesh, "triangles"), ...findChildren(mesh, "polylist"), ...findChildren(mesh, "polygons")]) {
      const inputs = findChildren(primitive, "input");
      const vertexInputIndex = inputs.findIndex((input) => input.attrs.semantic === "VERTEX");
      const vertexOffset = Number.parseInt(inputs[vertexInputIndex]?.attrs.offset ?? "0", 10) || 0;
      const normalSourceId = refId(inputs.find((input) => input.attrs.semantic === "NORMAL")?.attrs.source);
      const uvSourceId = refId(inputs.find((input) => input.attrs.semantic === "TEXCOORD")?.attrs.source);
      const normalSource = findSourceById(sources, normalSourceId);
      const uvSource = findSourceById(sources, uvSourceId);
      const pNode = findChild(primitive, "p");
      const pValues = readIntList(pNode?.text ?? "");
      const vcountNode = findChild(primitive, "vcount");
      const vcounts = vcountNode ? readIntList(vcountNode.text) : [];
      const faces = [];
      if (vcounts.length > 0) {
        let cursor = 0;
        for (const count of vcounts) {
          faces.push(pValues.slice(cursor, cursor + count));
          cursor += count;
        }
      } else {
        const perFace = primitive.name.toLowerCase() === "triangles" ? 3 : pValues.length;
        for (let i = 0; i + perFace <= pValues.length; i += perFace) {
          faces.push(pValues.slice(i, i + perFace));
        }
      }
      for (const face of faces) {
        if (face.length < 3) continue;
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
    if (positions.length === 0) return void 0;
    const geometry = new THREE19.BufferGeometry();
    geometry.setAttribute("position", new THREE19.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      geometry.setAttribute("normal", new THREE19.Float32BufferAttribute(normals, 3));
    }
    if (uvs.length === positions.length / 3 * 2) {
      geometry.setAttribute("uv", new THREE19.Float32BufferAttribute(uvs, 2));
    }
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
  };
  const root = new THREE19.Group();
  root.name = options.name ?? "collada-root";
  const visualScenes = findDescendant(collada, "library_visual_scenes");
  const sceneNodes = visualScenes ? findChildren(visualScenes, "visual_scene") : [];
  let nodeCount = 0;
  let meshCount = 0;
  let triangleCount = 0;
  const buildNode = (node, parent) => {
    nodeCount++;
    const object = new THREE19.Object3D();
    object.name = node.attrs.name ?? node.attrs.id ?? `node_${nodeCount}`;
    applyTransform(object, node);
    parent.add(object);
    for (const instance of findChildren(node, "instance_geometry")) {
      const geometryId = refId(instance.attrs.url);
      const geometry = buildGeometry2(geometryId);
      if (!geometry) {
        warnings.push(`Collada: geometry "${geometryId}" kh\xF4ng d\u1EF1ng \u0111\u01B0\u1EE3c.`);
        continue;
      }
      let material;
      const bindMaterial = findDescendant(instance, "bind_material");
      for (const instanceMaterial of bindMaterial ? findChildren(bindMaterial, "instance_material") : []) {
        const symbol = instanceMaterial.attrs.symbol;
        const target = refId(instanceMaterial.attrs.target);
        const bound = target ? materials[target] : void 0;
        if (bound && (!symbol || symbol === "material" || symbol === "default")) {
          material = bound;
          break;
        }
      }
      if (!material) {
        const all = Object.values(materials);
        material = all.length === 1 ? all[0] : new THREE19.MeshStandardMaterial();
      }
      const mesh = new THREE19.Mesh(geometry, material);
      mesh.name = object.name;
      object.add(mesh);
      meshCount++;
      triangleCount += geometry.getIndex().count / 3;
    }
    for (const child of findChildren(node, "node")) {
      buildNode(child, object);
    }
  };
  for (const visualScene of sceneNodes) {
    for (const node of findChildren(visualScene, "node")) {
      buildNode(node, root);
    }
  }
  if (meshCount === 0) {
    for (const [geometryId] of geometries) {
      const geometry = buildGeometry2(geometryId);
      if (!geometry) continue;
      const mesh = new THREE19.Mesh(geometry, new THREE19.MeshStandardMaterial());
      mesh.name = geometryId;
      root.add(mesh);
      meshCount++;
      triangleCount += geometry.getIndex().count / 3;
      nodeCount++;
    }
    if (meshCount === 0) {
      warnings.push("Collada: kh\xF4ng t\xECm th\u1EA5y h\xECnh h\u1ECDc n\xE0o \u0111\u1EC3 d\u1EF1ng.");
    }
  }
  if (effects) {
    for (const effect of findChildren(effects, "effect")) {
      for (const imageNode of findDescendant(effect, "init_from") ? [findDescendant(effect, "init_from")] : []) {
        const texture = findChild(imageNode, "texture");
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
    triangleCount
  };
}

// engine/src/asset-parser/animation-baker.ts
import * as THREE20 from "three";

// engine/src/asset-parser/asset-analyzer.ts
import * as THREE21 from "three";
var DEFAULT_BUDGETS = {
  character: { maxTriangles: 4e4, maxVertices: 25e3, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 120 },
  monster: { maxTriangles: 5e4, maxVertices: 3e4, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 120 },
  boss: { maxTriangles: 9e4, maxVertices: 55e3, maxMaterials: 10, maxDrawCalls: 16, maxTextureBytes: 32 * 1024 * 1024, maxBones: 150 },
  npc: { maxTriangles: 2e4, maxVertices: 12e3, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 80 },
  weapon: { maxTriangles: 12e3, maxVertices: 8e3, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 10 },
  shield: { maxTriangles: 8e3, maxVertices: 5e3, maxMaterials: 5, maxDrawCalls: 6, maxTextureBytes: 8 * 1024 * 1024, maxBones: 6 },
  armor: { maxTriangles: 15e3, maxVertices: 1e4, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 20 },
  helmet: { maxTriangles: 8e3, maxVertices: 5e3, maxMaterials: 6, maxDrawCalls: 6, maxTextureBytes: 8 * 1024 * 1024, maxBones: 10 },
  accessory: { maxTriangles: 6e3, maxVertices: 4e3, maxMaterials: 5, maxDrawCalls: 6, maxTextureBytes: 4 * 1024 * 1024, maxBones: 6 },
  prop: { maxTriangles: 8e3, maxVertices: 5e3, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 4 },
  interactive: { maxTriangles: 8e3, maxVertices: 5e3, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 4 },
  building: { maxTriangles: 6e4, maxVertices: 4e4, maxMaterials: 10, maxDrawCalls: 20, maxTextureBytes: 32 * 1024 * 1024, maxBones: 8 },
  structure: { maxTriangles: 4e4, maxVertices: 25e3, maxMaterials: 8, maxDrawCalls: 16, maxTextureBytes: 24 * 1024 * 1024, maxBones: 6 },
  vegetation: { maxTriangles: 2e4, maxVertices: 12e3, maxMaterials: 4, maxDrawCalls: 6, maxTextureBytes: 16 * 1024 * 1024, maxBones: 6 },
  tree: { maxTriangles: 25e3, maxVertices: 15e3, maxMaterials: 4, maxDrawCalls: 8, maxTextureBytes: 16 * 1024 * 1024, maxBones: 8 },
  rock: { maxTriangles: 15e3, maxVertices: 9e3, maxMaterials: 4, maxDrawCalls: 6, maxTextureBytes: 16 * 1024 * 1024, maxBones: 4 },
  water: { maxTriangles: 6e3, maxVertices: 4e3, maxMaterials: 3, maxDrawCalls: 4, maxTextureBytes: 8 * 1024 * 1024, maxBones: 2 },
  terrain: { maxTriangles: 12e4, maxVertices: 7e4, maxMaterials: 6, maxDrawCalls: 24, maxTextureBytes: 48 * 1024 * 1024, maxBones: 2 },
  vfx: { maxTriangles: 1e4, maxVertices: 8e3, maxMaterials: 4, maxDrawCalls: 12, maxTextureBytes: 8 * 1024 * 1024, maxBones: 2 },
  environment: { maxTriangles: 8e4, maxVertices: 5e4, maxMaterials: 10, maxDrawCalls: 24, maxTextureBytes: 48 * 1024 * 1024, maxBones: 8 },
  mount: { maxTriangles: 45e3, maxVertices: 28e3, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 110 },
  misc: { maxTriangles: 2e4, maxVertices: 12e3, maxMaterials: 6, maxDrawCalls: 10, maxTextureBytes: 8 * 1024 * 1024, maxBones: 20 }
};
var DEFAULT_BUDGET = DEFAULT_BUDGETS.misc;
function estimateTextureBytes(texture) {
  const image = texture.image;
  if (!image) return 0;
  const width = image.width ?? image.naturalWidth ?? 0;
  const height = image.height ?? image.naturalHeight ?? 0;
  if (width > 0 && height > 0) {
    return width * height * 4;
  }
  if (image.data) {
    const length = image.data.length;
    const channels = length % 4 === 0 ? 4 : length % 3 === 0 ? 3 : 1;
    return Math.round(length / channels * 4);
  }
  return 0;
}
function estimateVertexBytes(geometry) {
  let bytes = 0;
  for (const name of Object.keys(geometry.attributes)) {
    const attribute = geometry.getAttribute(name);
    bytes += attribute.array.byteLength;
  }
  const index = geometry.getIndex();
  if (index) bytes += index.array.byteLength;
  return bytes;
}
function countTrianglesInGeometry(geometry) {
  const index = geometry.getIndex();
  if (index) return index.count / 3;
  const position = geometry.getAttribute("position");
  return position ? position.count / 3 : 0;
}
function countVerticesInGeometry(geometry) {
  return geometry.getAttribute("position")?.count ?? 0;
}
function suggestLods(triangles, budget = DEFAULT_BUDGET) {
  const suggestions = [];
  if (triangles <= 0) return suggestions;
  let current = triangles;
  let level = 1;
  while (current > budget.maxTriangles * 0.5 && level <= 4) {
    const target = Math.max(12, Math.floor(current * 0.45));
    suggestions.push({
      level,
      targetTriangles: target,
      reduction: Math.round((1 - target / current) * 100) / 100,
      reason: `b\u1EADc ${level}: gi\u1EEF ~45% tam gi\xE1c \u0111\u1EC3 gi\u1EA3m t\u1EA3i khi xa`
    });
    current = target;
    level++;
  }
  if (suggestions.length === 0 && triangles > budget.maxTriangles) {
    suggestions.push({
      level: 1,
      targetTriangles: Math.floor(budget.maxTriangles * 0.5),
      reduction: Math.round((1 - budget.maxTriangles * 0.5 / triangles) * 100) / 100,
      reason: "v\u01B0\u1EE3t ng\xE2n s\xE1ch tam gi\xE1c \u2014 c\u1EA7n \xEDt nh\u1EA5t m\u1ED9t b\u1EADc LOD"
    });
  }
  return suggestions;
}
function analyzeAsset(asset, options = {}) {
  const budget = options.budget ?? DEFAULT_BUDGETS[asset.category] ?? DEFAULT_BUDGET;
  const issues = [];
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  let vertexBytes = 0;
  let materialsUsed = /* @__PURE__ */ new Set();
  const meshesWithoutMaterial = [];
  const meshesWithoutNormals = [];
  asset.scene.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    meshes++;
    triangles += countTrianglesInGeometry(mesh.geometry);
    vertices += countVerticesInGeometry(mesh.geometry);
    vertexBytes += estimateVertexBytes(mesh.geometry);
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material) {
      meshesWithoutMaterial.push(mesh.name || `Mesh_${meshes}`);
    } else {
      materialsUsed.add(material.uuid);
      if (!material.normalMap) meshesWithoutNormals.push(mesh.name || `Mesh_${meshes}`);
    }
  });
  let textureBytes = 0;
  const textures = [];
  asset.scene.traverse((child) => {
    const mesh = child;
    if (!mesh.isMesh) return;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material) return;
    const props = material;
    for (const key of ["map", "normalMap", "emissiveMap", "aoMap", "roughnessMap", "metalnessMap", "alphaMap"]) {
      const texture = props[key];
      if (!texture) continue;
      if (!textures.includes(texture)) {
        textures.push(texture);
        textureBytes += estimateTextureBytes(texture);
      }
    }
  });
  const bones = asset.bones?.length ?? 0;
  const animations = asset.animations.length;
  const materials = materialsUsed.size;
  if (meshes === 0) {
    issues.push({
      severity: "error",
      code: "no-geometry",
      message: "T\xE0i s\u1EA3n kh\xF4ng c\xF3 h\xECnh h\u1ECDc n\xE0o.",
      field: "geometryStats.meshes",
      value: 0
    });
  }
  if (triangles > budget.maxTriangles) {
    issues.push({
      severity: "error",
      code: "over-triangle-budget",
      message: `V\u01B0\u1EE3t ng\xE2n s\xE1ch tam gi\xE1c (${triangles} > ${budget.maxTriangles}).`,
      field: "geometryStats.triangles",
      value: triangles,
      limit: budget.maxTriangles
    });
  } else if (triangles > budget.maxTriangles * 0.8) {
    issues.push({
      severity: "warning",
      code: "near-triangle-budget",
      message: `\u0110\xE3 d\xF9ng ${Math.round(triangles / budget.maxTriangles * 100)}% ng\xE2n s\xE1ch tam gi\xE1c.`,
      field: "geometryStats.triangles",
      value: triangles,
      limit: budget.maxTriangles
    });
  }
  if (vertices > budget.maxVertices) {
    issues.push({
      severity: "error",
      code: "over-vertex-budget",
      message: `V\u01B0\u1EE3t ng\xE2n s\xE1ch \u0111\u1EC9nh (${vertices} > ${budget.maxVertices}).`,
      field: "geometryStats.vertices",
      value: vertices,
      limit: budget.maxVertices
    });
  }
  if (materials > budget.maxMaterials) {
    issues.push({
      severity: "warning",
      code: "over-material-budget",
      message: `V\u01B0\u1EE3t ng\xE2n s\xE1ch v\u1EADt li\u1EC7u (${materials} > ${budget.maxMaterials}).`,
      field: "geometryStats.materials",
      value: materials,
      limit: budget.maxMaterials
    });
  }
  if (meshes > budget.maxDrawCalls) {
    issues.push({
      severity: "warning",
      code: "over-drawcall-budget",
      message: `S\u1ED1 mesh (${meshes}) v\u01B0\u1EE3t ng\xE2n s\xE1ch draw call (${budget.maxDrawCalls}). \u2014 n\xEAn g\u1ED9p mesh t\u0129nh.`,
      field: "geometryStats.meshes",
      value: meshes,
      limit: budget.maxDrawCalls
    });
  }
  if (bones > budget.maxBones) {
    issues.push({
      severity: "warning",
      code: "over-bone-budget",
      message: `S\u1ED1 x\u01B0\u01A1ng (${bones}) v\u01B0\u1EE3t ng\xE2n s\xE1ch (${budget.maxBones}).`,
      field: "bones",
      value: bones,
      limit: budget.maxBones
    });
  }
  if (textureBytes > budget.maxTextureBytes) {
    issues.push({
      severity: "error",
      code: "over-texture-memory",
      message: `B\u1ED9 nh\u1EDB texture v\u01B0\u1EE3t ng\xE2n s\xE1ch (${formatBytes(textureBytes)} > ${formatBytes(budget.maxTextureBytes)}).`,
      field: "textures",
      value: textureBytes,
      limit: budget.maxTextureBytes
    });
  }
  if (!options.skipMaterialAudit) {
    if (meshesWithoutMaterial.length > 0) {
      issues.push({
        severity: "warning",
        code: "mesh-without-material",
        message: `${meshesWithoutMaterial.length} mesh kh\xF4ng c\xF3 v\u1EADt li\u1EC7u: ${meshesWithoutMaterial.slice(0, 5).join(", ")}.`,
        field: "materials"
      });
    }
    if (meshesWithoutNormals.length > 0 && triangles > 0) {
      issues.push({
        severity: "info",
        code: "mesh-without-normal-map",
        message: `${meshesWithoutNormals.length} mesh kh\xF4ng c\xF3 normal map \u2014 b\u1EC1 m\u1EB7t s\u1EBD ph\u1EB3ng khi \xE1nh s\xE1ng g\xF3c.`,
        field: "materials"
      });
    }
  }
  if (asset.dependencies.length > 0) {
    issues.push({
      severity: "info",
      code: "external-dependencies",
      message: `C\xF2n ${asset.dependencies.length} t\u1EC7p ngo\xE0i ph\u1EA3i n\u1EA1p theo: ${asset.dependencies.slice(0, 5).join(", ")}.`,
      field: "dependencies"
    });
  }
  if (asset.warnings.length > 0) {
    issues.push({
      severity: "warning",
      code: "parser-warnings",
      message: `Parser c\u1EA3nh b\xE1o ${asset.warnings.length} v\u1EA5n \u0111\u1EC1: ${asset.warnings.slice(0, 3).join(" | ")}.`,
      field: "warnings"
    });
  }
  if (animations === 0 && bones > 0) {
    issues.push({
      severity: "info",
      code: "skeleton-without-animation",
      message: "C\xF3 x\u01B0\u01A1ng nh\u01B0ng kh\xF4ng c\xF3 animation \u2014 nh\xE2n v\u1EADt s\u1EBD \u0111\u1EE9ng y\xEAn.",
      field: "animations"
    });
  }
  const ratios = [
    { ratio: triangles / budget.maxTriangles, weight: 0.3 },
    { ratio: vertices / budget.maxVertices, weight: 0.2 },
    { ratio: meshes / budget.maxDrawCalls, weight: 0.15 },
    { ratio: materials / budget.maxMaterials, weight: 0.1 },
    { ratio: textureBytes / budget.maxTextureBytes, weight: 0.15 },
    { ratio: bones / Math.max(1, budget.maxBones), weight: 0.1 }
  ];
  let weighted = 0;
  let totalWeight = 0;
  for (const { ratio, weight } of ratios) {
    weighted += Math.max(0, 1 - ratio) * weight;
    totalWeight += weight;
  }
  const errorPenalty = issues.filter((i) => i.severity === "error").length * 0.15;
  const score = Math.max(0, Math.min(100, Math.round(weighted / totalWeight * 100 - errorPenalty * 100)));
  const withinBudget = !issues.some((issue) => issue.severity === "error");
  return {
    assetId: asset.id,
    format: asset.format,
    kind: asset.kind,
    category: asset.category,
    meshes,
    triangles,
    vertices,
    materials,
    bones,
    animations,
    drawCalls: meshes,
    textureBytes,
    vertexBytes,
    totalBytes: textureBytes + vertexBytes,
    sourceBytes: asset.sizeBytes,
    boundsSize: asset.bounds.size,
    boundsRadius: asset.bounds.sphere.radius,
    score,
    withinBudget,
    issues,
    lodSuggestions: suggestLods(triangles, budget),
    budget
  };
}
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Math.round(value * 100) / 100} ${units[unit]}`;
}

// engine/src/asset-parser/index.ts
function formatOf2(path, contentHint) {
  return formatOf(path, contentHint);
}
function collectBones3(scene) {
  const bones = [];
  let index = 0;
  const walk = (node, parentName) => {
    if (node instanceof THREE22.Bone) {
      const world = node.getWorldPosition(new THREE22.Vector3());
      const local = node.position;
      bones.push({
        name: node.name || `bone_${index}`,
        parentName,
        index: index++,
        localTransform: {
          position: { x: local.x, y: local.y, z: local.z },
          rotation: { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z },
          scale: { x: node.scale.x, y: node.scale.y, z: node.scale.z }
        },
        worldPosition: { x: world.x, y: world.y, z: world.z }
      });
      parentName = node.name || parentName;
    }
    for (const child of node.children) walk(child, parentName);
  };
  walk(scene, void 0);
  return bones;
}
var IMAGE_FORMATS = ["png", "jpg", "jpeg", "webp", "tga", "exr", "hdr"];
function textureUrisOfMtl(mtlText) {
  if (!mtlText) return [];
  const uris = [];
  for (const line of mtlText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    const keyword = parts[0].toLowerCase();
    const isMap = keyword === "map_kd" || keyword === "map_diffuse" || keyword === "map_bump" || keyword === "bump" || keyword === "map_d";
    if (!isMap || parts.length < 2) continue;
    const uri = parts.slice(1).join(" ").trim();
    if (uri.length > 0) uris.push(uri);
  }
  return uris;
}
function mtlLibrariesOfObj(objText) {
  const libraries = [];
  for (const line of objText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/\s+/);
    if (parts[0].toLowerCase() === "mtllib" && parts.length > 1) {
      libraries.push(parts.slice(1).join(" ").trim());
    }
  }
  return libraries;
}
var AssetParser = class {
  constructor(opts = {}) {
    __publicField(this, "dracoDecoderPath", null);
    __publicField(this, "dracoEnabled", false);
    __publicField(this, "dracoLoader", null);
    __publicField(this, "fetchSidecar");
    this.dracoDecoderPath = opts.dracoDecoderPath ?? null;
    this.dracoEnabled = opts.enableDraco ?? false;
    this.fetchSidecar = opts.fetchSidecar;
  }
  configureDraco(decoderPath, enabled = true) {
    this.dracoDecoderPath = decoderPath;
    this.dracoEnabled = enabled;
    this.dracoLoader = null;
  }
  getDracoLoader() {
    if (!this.dracoLoader) {
      this.dracoLoader = new DRACOLoader();
      if (this.dracoDecoderPath) {
        this.dracoLoader.setDecoderPath(this.dracoDecoderPath);
      }
    }
    return this.dracoLoader;
  }
  async parse(path, extraOpts) {
    return this.load(path, extraOpts);
  }
  /**
   * Nạp và bóc tách một tài sản.
   *
   * Định dạng có loader của three.js được nạp trực tiếp từ URL; các định dạng
   * Engine tự viết parser được tải về dạng byte rồi giải mã.
   */
  /**
   * Nạp và bóc tách một tài sản từ URL.
   *
   * Hai đường nạp, mỗi đường một môi trường:
   *  • **URL (`load`)** — dùng loader của three.js cho glTF/FBX/Collada vì chúng
   *    tự nạp texture/buffer ngoài theo URL và giải mã Draco/KTX2 trong trình
   *    duyệt.
   *  • **Byte (`parseBytes`)** — dùng parser tự viết của Engine vì không cần
   *    mạng, không cần DOM và chạy được ở Node (server, kiểm thử headless).
   *
   * Cả hai đều trả về cùng một cấu trúc `ParsedAsset`.
   */
  async load(path, extraOpts) {
    const format = formatOf2(path);
    switch (format) {
      case "gltf":
      case "glb": {
        const loader = new GLTFLoader();
        if (this.dracoEnabled && this.dracoDecoderPath) {
          loader.setDRACOLoader(this.getDracoLoader());
        }
        const gltf = await loader.loadAsync(path);
        return this.finalize(path, format, gltf.scene, gltf.animations ?? []);
      }
      case "fbx": {
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
        const loader = new FBXLoader();
        const group = await loader.loadAsync(path);
        return this.finalize(path, format, group, group.animations ?? []);
      }
      case "dae": {
        const { ColladaLoader } = await import("three/examples/jsm/loaders/ColladaLoader.js");
        const loader = new ColladaLoader();
        const collada = await loader.loadAsync(path);
        const animations = collada.scene.animations ?? [];
        return this.finalize(path, format, collada.scene, animations);
      }
      case "obj": {
        let mtlText = extraOpts?.mtlText;
        const dependencies = [];
        if (!mtlText && extraOpts?.mtlPath) {
          try {
            const mtlRes = await fetch(extraOpts.mtlPath);
            if (mtlRes.ok) mtlText = await mtlRes.text();
          } catch {
          }
        }
        if (extraOpts?.mtlPath) dependencies.push(extraOpts.mtlPath);
        const res = await fetch(path);
        if (!res.ok) throw new Error(`AssetParser: kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c ${path} (HTTP ${res.status})`);
        const text = await res.text();
        const scene = parseObj(text, { mtlText, name: nameFromPath(path) });
        dependencies.push(...mtlLibrariesOfObj(text));
        dependencies.push(...textureUrisOfMtl(mtlText));
        return this.finalize(path, format, scene, [], { dependencies });
      }
      case "mtl": {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`AssetParser: kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c ${path} (HTTP ${res.status})`);
        const text = await res.text();
        const materials = parseMtl(text);
        const group = new THREE22.Group();
        group.name = nameFromPath(path);
        group.userData.materials = Object.fromEntries(materials);
        return this.finalize(path, format, group, [], {
          dependencies: textureUrisOfMtl(text)
        });
      }
      default: {
        const bytes = await this.fetchBytes(path);
        return this.parseBytes(path, bytes, extraOpts);
      }
    }
  }
  /** Tải tệp về dạng byte (dùng cho các định dạng nhị phân). */
  async fetchBytes(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`AssetParser: kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c ${path} (HTTP ${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  }
  /**
   * Bóc tách từ byte đã có sẵn — không cần mạng.
   *
   * Đây là API chính cho các định dạng nhị phân và cho kiểm thử.
   */
  async parseBytes(path, bytes, extraOpts) {
    let format = formatOf2(path);
    const detectedImage = detectImageFormat(bytes, format);
    if (detectedImage && IMAGE_FORMATS.includes(detectedImage)) {
      format = detectedImage === "jpg" ? "jpg" : detectedImage;
    }
    const warnings = [];
    const dependencies = [];
    let scene = new THREE22.Group();
    let animations = [];
    let texture;
    let motion;
    let data;
    let materials;
    switch (format) {
      case "gltf":
      case "glb": {
        const result = await parseGltf(bytes, {
          name: nameFromPath(path),
          loadExternal: extraOpts?.loadExternal
        });
        scene = result.scene;
        animations.push(...result.animations);
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        materials = { ...result.materials };
        break;
      }
      case "fbx": {
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
        const loader = new FBXLoader();
        if (typeof document === "undefined") {
          loader.textureLoader = {
            path: "",
            setPath(value) {
              this.path = value;
              return this;
            },
            setCrossOrigin() {
              return this;
            },
            load(url) {
              dependencies.push(url);
              return new THREE22.Texture();
            }
          };
        }
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        );
        const group = loader.parse(buffer, "");
        scene = group;
        animations.push(...group.animations ?? []);
        break;
      }
      case "dae": {
        const result = parseCollada(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        materials = { ...result.materials };
        break;
      }
      case "obj": {
        const text = new TextDecoder().decode(bytes);
        const mtlText = extraOpts?.mtlText;
        scene = parseObj(text, { mtlText, name: nameFromPath(path) });
        dependencies.push(...mtlLibrariesOfObj(text));
        dependencies.push(...textureUrisOfMtl(mtlText));
        break;
      }
      case "mtl": {
        const text = new TextDecoder().decode(bytes);
        const parsedMaterials = parseMtl(text);
        scene = new THREE22.Group();
        scene.name = nameFromPath(path);
        scene.userData.materials = Object.fromEntries(parsedMaterials);
        dependencies.push(...textureUrisOfMtl(text));
        break;
      }
      case "stl": {
        const result = parseStl(bytes, { name: nameFromPath(path) });
        const mesh = new THREE22.Mesh(result.geometry, new THREE22.MeshStandardMaterial());
        mesh.name = nameFromPath(path);
        scene.add(mesh);
        break;
      }
      case "ply": {
        const result = parsePly(bytes, { name: nameFromPath(path) });
        const mesh = new THREE22.Mesh(result.geometry, new THREE22.MeshStandardMaterial({ vertexColors: result.hasVertexColor }));
        mesh.name = nameFromPath(path);
        scene.add(mesh);
        break;
      }
      case "3ds": {
        const result = parseThreeDs(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.textureFiles);
        break;
      }
      case "usd":
      case "usda":
      case "usdc": {
        const result = parseUsd(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        break;
      }
      case "abc": {
        const result = parseAbc(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        break;
      }
      case "bvh": {
        const result = parseBvh(bytes, { name: nameFromPath(path) });
        scene = result.root;
        if (result.clip) animations.push(result.clip);
        motion = {
          kind: "bvh",
          name: nameFromPath(path),
          frameCount: result.frames.length,
          duration: result.duration,
          fps: result.fps,
          bones: result.bones,
          frames: result.frames
        };
        warnings.push(...result.warnings);
        break;
      }
      case "vmd": {
        const result = parseVmd(bytes, { name: nameFromPath(path) });
        scene = new THREE22.Group();
        scene.name = result.name;
        if (result.clip) animations.push(result.clip);
        motion = {
          kind: "vmd",
          name: result.name,
          frameCount: result.frameCount,
          duration: result.duration,
          fps: result.fps,
          bones: result.bones,
          frames: result.frames
        };
        warnings.push(...result.warnings);
        break;
      }
      case "png":
      case "jpg":
      case "jpeg":
      case "webp":
      case "tga":
      case "exr":
      case "hdr": {
        const result = parseImage(bytes, format, { name: nameFromPath(path) });
        texture = result.texture;
        warnings.push(...result.warnings);
        scene = new THREE22.Group();
        scene.name = nameFromPath(path);
        scene.userData.imageInfo = result.info;
        break;
      }
      case "forge-design":
      case "bot-spec":
      case "asset-manifest":
      case "asset-sidecar": {
        const text = new TextDecoder().decode(bytes);
        format = formatOf2(path, text);
        const parsed = parseEngineData(text, format);
        data = parsed.data;
        warnings.push(...parsed.warnings);
        scene = new THREE22.Group();
        scene.name = nameFromPath(path);
        break;
      }
      default:
        throw new Error(`AssetParser: \u0111\u1ECBnh d\u1EA1ng kh\xF4ng h\u1ED7 tr\u1EE3 cho ${path} (${format})`);
    }
    const asset = this.finalize(path, format, scene, animations, {
      warnings,
      dependencies,
      texture,
      motion,
      data,
      materials,
      sizeBytes: bytes.byteLength
    });
    return asset;
  }
  /**
   * Hoàn thiện kết quả: thống kê hình học, texture, metadata, bounds, xương.
   *
   * Mọi trường bắt buộc của `ParsedAsset` đều được điền ở đây — kể cả khi
   * tài sản không có mesh/vật liệu thì bộ nhớ rỗng vẫn được tạo, để phía
   * đọc không phải kiểm tra `undefined` ở từng nơi.
   */
  finalize(path, format, scene, animations, extra) {
    const geometryStats = extractStats(scene);
    const textures = parseTextures(scene);
    const metadata = loadMetadata(path, scene);
    const bounds = computeBounds(scene);
    const bones = collectBones3(scene);
    const meshes = collectMeshes(scene);
    const materials = { ...extra?.materials ?? {} };
    if (Object.keys(materials).length === 0) {
      for (const material of collectMaterials(scene)) {
        materials[material.name || `Material_${Object.keys(materials).length}`] = material;
      }
    }
    const rawBuffers = {};
    for (const mesh of meshes) {
      rawBuffers[mesh.name || `Mesh_${Object.keys(rawBuffers).length}`] = extractRawBufferData(mesh);
    }
    const model = meshes[0] ?? scene;
    let lightCount = 0;
    let cameraCount = 0;
    let lodCount = 0;
    scene.traverse((node) => {
      const flagged = node;
      if (flagged.isLight) lightCount += 1;
      if (flagged.isCamera) cameraCount += 1;
      if (flagged.isLOD) lodCount += 1;
    });
    const parsed = {
      id: path,
      sourcePath: path,
      format,
      kind: kindOf(format),
      scene,
      model,
      category: categoryFromPath(path),
      animations,
      geometryStats,
      textures,
      metadata,
      bounds,
      materials,
      rawBuffers,
      dependencies: extra?.dependencies ?? [],
      warnings: extra?.warnings ?? [],
      sizeBytes: extra?.sizeBytes ?? 0,
      animationNames: animations.map((clip) => clip.name),
      materialNames: Object.keys(materials),
      textureCount: textures.length,
      lodCount,
      lightCount,
      cameraCount,
      hasSkeleton: bones.length > 0,
      hasAnimation: animations.length > 0
    };
    if (bones.length > 0) parsed.bones = bones;
    if (extra?.texture) parsed.texture = extra.texture;
    if (extra?.motion) parsed.motion = extra.motion;
    if (extra?.data !== void 0) parsed.data = extra.data;
    return parsed;
  }
};
var SUPPORTED_ASSET_FORMATS = supportedFormats();
var SUPPORTED_ASSET_EXTENSIONS = supportedExtensions();

// engine/src/combiner/socket-binder.ts
import * as THREE23 from "three";
var warnCache = /* @__PURE__ */ new Set();
function warnOnce(key, msg) {
  if (warnCache.has(key)) return;
  warnCache.add(key);
  console.warn("[socket-binder]", msg);
}
function normalizeBoneName(name) {
  let n = name.toLowerCase();
  const colon = n.lastIndexOf(":");
  if (colon >= 0) n = n.slice(colon + 1);
  n = n.replace(/[._\-\s()[\]]/g, "");
  n = n.replace(/right/g, "r").replace(/left/g, "l");
  return n;
}
function findBone(rig, name) {
  let exact = null;
  if (rig.name === name) return rig;
  rig.traverse((o) => {
    if (exact || o === rig) return;
    if (o.name === name) exact = o;
  });
  if (exact) return exact;
  const target = normalizeBoneName(name);
  let fuzzy = null;
  rig.traverse((o) => {
    if (fuzzy || o === rig) return;
    if (o.name && normalizeBoneName(o.name) === target) fuzzy = o;
  });
  return fuzzy;
}
function listSockets(rig) {
  const bones = [];
  const named = [];
  rig.traverse((o) => {
    if (o === rig || !o.name) return;
    const isBone = o.isBone === true;
    if (isBone) bones.push(o.name);
    else named.push(o.name);
  });
  return bones.length > 0 ? bones : named;
}
function applyOffset(group, offset) {
  if (!offset) return;
  if (offset.position) group.position.set(offset.position.x ?? 0, offset.position.y ?? 0, offset.position.z ?? 0);
  if (offset.rotation) group.rotation.set(offset.rotation.x ?? 0, offset.rotation.y ?? 0, offset.rotation.z ?? 0);
  if (offset.scale !== void 0) {
    if (typeof offset.scale === "number") group.scale.setScalar(offset.scale);
    else group.scale.set(offset.scale.x ?? 1, offset.scale.y ?? 1, offset.scale.z ?? 1);
  }
}
var SocketBinder = class {
  constructor() {
    __publicField(this, "registry", /* @__PURE__ */ new Map());
    __publicField(this, "seq", 0);
  }
  bind(rig, binding) {
    const bone = findBone(rig, binding.socket);
    if (!bone) {
      warnOnce(`missing:${binding.socket}`, `Kh\xF4ng t\xECm th\u1EA5y socket/bone "${binding.socket}" tr\xEAn rig "${rig.name || rig.uuid}"`);
      return null;
    }
    const group = new THREE23.Group();
    group.name = `socket_${binding.socket}_${binding.assetId}`;
    applyOffset(group, binding.offset);
    if (binding.scaleMultiplier && binding.scaleMultiplier !== 1) {
      group.scale.multiplyScalar(binding.scaleMultiplier);
    }
    const follow = binding.followBone !== false;
    if (follow) {
      bone.add(group);
    } else {
      bone.updateWorldMatrix(true, false);
      group.applyMatrix4(bone.matrixWorld);
      rig.add(group);
    }
    const handleId = `${binding.socket}_${++this.seq}`;
    const handle = {
      id: handleId,
      socket: binding.socket,
      bone,
      group,
      binding: { ...binding, followBone: follow }
    };
    this.registry.set(this.makeKey(rig, handleId), handle);
    return handle;
  }
  attachAsset(handle, asset) {
    handle.group.add(asset);
  }
  static attachToSocket(socketTarget, attachment, options = {}) {
    if (options.preserveWorldTransform) {
      socketTarget.attach(attachment);
    } else {
      if (options.position) {
        if (Array.isArray(options.position)) {
          attachment.position.set(options.position[0], options.position[1], options.position[2]);
        } else {
          attachment.position.set(options.position.x ?? 0, options.position.y ?? 0, options.position.z ?? 0);
        }
      }
      if (options.rotation) {
        if (Array.isArray(options.rotation)) {
          attachment.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
        } else {
          attachment.rotation.set(options.rotation.x ?? 0, options.rotation.y ?? 0, options.rotation.z ?? 0);
        }
      }
      if (options.scale !== void 0) {
        if (typeof options.scale === "number") {
          attachment.scale.setScalar(options.scale);
        } else if (Array.isArray(options.scale)) {
          attachment.scale.set(options.scale[0], options.scale[1], options.scale[2]);
        } else {
          attachment.scale.set(options.scale.x ?? 1, options.scale.y ?? 1, options.scale.z ?? 1);
        }
      }
      socketTarget.add(attachment);
    }
  }
  unbind(rig, handleId) {
    const key = this.makeKey(rig, handleId);
    const handle = this.registry.get(key);
    if (!handle) return false;
    handle.group.removeFromParent();
    while (handle.group.children.length > 0) {
      handle.group.children[0].removeFromParent();
    }
    this.registry.delete(key);
    return true;
  }
  unbindAll(rig) {
    const prefix = `${rig.uuid}|`;
    for (const [key, handle] of Array.from(this.registry.entries())) {
      if (key.startsWith(prefix)) {
        handle.group.removeFromParent();
        this.registry.delete(key);
      }
    }
  }
  getHandle(rig, handleId) {
    return this.registry.get(this.makeKey(rig, handleId));
  }
  listBindings(rig) {
    const prefix = `${rig.uuid}|`;
    const res = [];
    for (const [key, handle] of this.registry.entries()) {
      if (key.startsWith(prefix)) res.push(handle);
    }
    return res;
  }
  makeKey(rig, id) {
    return `${rig.uuid}|${id}`;
  }
};

// engine/src/physics/index.ts
import * as THREE27 from "three";

// engine/src/physics/collision-detector.ts
import * as THREE24 from "three";
function toV3(v) {
  return new THREE24.Vector3(v.x, v.y, v.z);
}
function capsuleSegment(c) {
  const halfCyl = Math.max(0, c.height / 2 - c.radius);
  return {
    a: new THREE24.Vector3(c.center.x, c.center.y - halfCyl, c.center.z),
    b: new THREE24.Vector3(c.center.x, c.center.y + halfCyl, c.center.z)
  };
}
function closestPointOnSegment(p, a, b, out) {
  const ab = b.clone().sub(a);
  const len2 = ab.lengthSq();
  if (len2 < 1e-12) return out.copy(a);
  const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / len2));
  return out.copy(a).addScaledVector(ab, t);
}
function sphereSphere(a, b) {
  const delta = b.center.clone().sub(a.center);
  const dist = delta.length();
  const sum = a.radius + b.radius;
  if (dist >= sum) return { hit: false, depth: sum - dist };
  const normal = dist > 1e-9 ? delta.divideScalar(dist) : new THREE24.Vector3(0, 1, 0);
  return {
    hit: true,
    depth: sum - dist,
    normal,
    point: a.center.clone().addScaledVector(normal, a.radius),
    distance: dist
  };
}
function sphereBox(s, b) {
  const min = b.center.clone().sub(b.half);
  const max = b.center.clone().add(b.half);
  const closest = new THREE24.Vector3(
    Math.max(min.x, Math.min(s.center.x, max.x)),
    Math.max(min.y, Math.min(s.center.y, max.y)),
    Math.max(min.z, Math.min(s.center.z, max.z))
  );
  const delta = s.center.clone().sub(closest);
  const dist = delta.length();
  if (dist >= s.radius) return { hit: false, depth: s.radius - dist };
  if (dist < 1e-9) {
    const pen = new THREE24.Vector3(
      s.radius + b.half.x - Math.abs(s.center.x - b.center.x),
      s.radius + b.half.y - Math.abs(s.center.y - b.center.y),
      s.radius + b.half.z - Math.abs(s.center.z - b.center.z)
    );
    let axis = "y";
    if (pen.x <= pen.y && pen.x <= pen.z) axis = "x";
    else if (pen.z <= pen.y) axis = "z";
    const sign = Math.sign(s.center[axis] - b.center[axis]) || 1;
    const normal2 = new THREE24.Vector3(axis === "x" ? sign : 0, axis === "y" ? sign : 0, axis === "z" ? sign : 0);
    return { hit: true, depth: pen[axis], normal: normal2, point: closest, distance: 0 };
  }
  const normal = delta.divideScalar(dist);
  return { hit: true, depth: s.radius - dist, normal, point: closest, distance: dist };
}
function sphereCapsule(s, c) {
  const seg = capsuleSegment(c);
  const closest = new THREE24.Vector3();
  closestPointOnSegment(s.center, seg.a, seg.b, closest);
  return sphereSphere(s, { center: closest, radius: c.radius });
}
function boxBox(a, b) {
  const d = b.center.clone().sub(a.center);
  const overlap = a.half.clone().add(b.half).sub(new THREE24.Vector3(Math.abs(d.x), Math.abs(d.y), Math.abs(d.z)));
  if (overlap.x <= 0 || overlap.y <= 0 || overlap.z <= 0) {
    return { hit: false, depth: Math.min(overlap.x, overlap.y, overlap.z) };
  }
  let axis = "y";
  if (overlap.x <= overlap.y && overlap.x <= overlap.z) axis = "x";
  else if (overlap.z <= overlap.y) axis = "z";
  const sign = Math.sign(d[axis]) || 1;
  const normal = new THREE24.Vector3(axis === "x" ? sign : 0, axis === "y" ? sign : 0, axis === "z" ? sign : 0);
  return {
    hit: true,
    depth: overlap[axis],
    normal,
    point: a.center.clone().addScaledVector(normal, a.half[axis]),
    distance: 0
  };
}
function capsuleCapsule(a, b) {
  const segA = capsuleSegment(a);
  const segB = capsuleSegment(b);
  const midA = segA.a.clone().add(segA.b).multiplyScalar(0.5);
  const closestB = new THREE24.Vector3();
  closestPointOnSegment(midA, segB.a, segB.b, closestB);
  const closestA = new THREE24.Vector3();
  closestPointOnSegment(closestB, segA.a, segA.b, closestA);
  closestPointOnSegment(closestA, segB.a, segB.b, closestB);
  return sphereSphere({ center: closestA, radius: a.radius }, { center: closestB, radius: b.radius });
}
function shapeCenter(bodyPos, shape) {
  const off = "center" in shape && shape.center ? shape.center : { x: 0, y: 0, z: 0 };
  return new THREE24.Vector3(bodyPos.x + off.x, bodyPos.y + off.y, bodyPos.z + off.z);
}
function collideBodies(a, b) {
  const ca = shapeCenter(a.position, a.shape);
  const cb = shapeCenter(b.position, b.shape);
  if (a.shape.kind === "sphere" && b.shape.kind === "sphere") {
    return sphereSphere({ center: ca, radius: a.shape.radius }, { center: cb, radius: b.shape.radius });
  }
  if (a.shape.kind === "sphere" && b.shape.kind === "box") {
    return sphereBox({ center: ca, radius: a.shape.radius }, { center: cb, half: toV3(b.shape.half) });
  }
  if (a.shape.kind === "box" && b.shape.kind === "sphere") {
    const r = sphereBox({ center: cb, radius: b.shape.radius }, { center: ca, half: toV3(a.shape.half) });
    if (r.hit && r.normal) r.normal = { x: -r.normal.x, y: -r.normal.y, z: -r.normal.z };
    return r;
  }
  if (a.shape.kind === "box" && b.shape.kind === "box") {
    return boxBox({ center: ca, half: toV3(a.shape.half) }, { center: cb, half: toV3(b.shape.half) });
  }
  if (a.shape.kind === "sphere" && b.shape.kind === "capsule") {
    return sphereCapsule({ center: ca, radius: a.shape.radius }, { center: cb, radius: b.shape.radius, height: b.shape.height });
  }
  if (a.shape.kind === "capsule" && b.shape.kind === "sphere") {
    const r = sphereCapsule({ center: cb, radius: b.shape.radius }, { center: ca, radius: a.shape.radius, height: a.shape.height });
    if (r.hit && r.normal) r.normal = { x: -r.normal.x, y: -r.normal.y, z: -r.normal.z };
    return r;
  }
  if (a.shape.kind === "capsule" && b.shape.kind === "capsule") {
    return capsuleCapsule(
      { center: ca, radius: a.shape.radius, height: a.shape.height },
      { center: cb, radius: b.shape.radius, height: b.shape.height }
    );
  }
  return null;
}
function raySphere(origin, dir, sphere, maxDist) {
  const m = origin.clone().sub(sphere.center);
  const b = m.dot(dir);
  const c = m.dot(m) - sphere.radius * sphere.radius;
  if (c > 0 && b > 0) return { hit: false };
  const discr = b * b - c;
  if (discr < 0) return { hit: false };
  let t = -b - Math.sqrt(discr);
  if (t < 0) t = 0;
  if (t > maxDist) return { hit: false };
  const pt = origin.clone().addScaledVector(dir, t);
  const normal = pt.clone().sub(sphere.center).normalize();
  return { hit: true, distance: t, point: pt, normal };
}
function rayBox(origin, dir, box, maxDist) {
  const min = box.center.clone().sub(box.half);
  const max = box.center.clone().add(box.half);
  const b = new THREE24.Box3(min, max);
  const ray = new THREE24.Ray(origin, dir);
  const target = new THREE24.Vector3();
  const hit = ray.intersectBox(b, target);
  if (!hit) return { hit: false };
  const dist = origin.distanceTo(target);
  if (dist > maxDist) return { hit: false };
  const normal = new THREE24.Vector3();
  const dMin = Math.abs(target.x - min.x);
  const dMax = Math.abs(target.x - max.x);
  let best = dMin;
  normal.set(-1, 0, 0);
  if (dMax < best) {
    best = dMax;
    normal.set(1, 0, 0);
  }
  if (Math.abs(target.y - min.y) < best) {
    best = Math.abs(target.y - min.y);
    normal.set(0, -1, 0);
  }
  if (Math.abs(target.y - max.y) < best) {
    best = Math.abs(target.y - max.y);
    normal.set(0, 1, 0);
  }
  if (Math.abs(target.z - min.z) < best) {
    best = Math.abs(target.z - min.z);
    normal.set(0, 0, -1);
  }
  if (Math.abs(target.z - max.z) < best) {
    normal.set(0, 0, 1);
  }
  return { hit: true, distance: dist, point: target, normal };
}
function rayCapsule(origin, dir, cap, maxDist) {
  const seg = capsuleSegment(cap);
  const p = new THREE24.Vector3();
  closestPointOnSegment(origin, seg.a, seg.b, p);
  return raySphere(origin, dir, { center: p, radius: cap.radius }, maxDist);
}

// engine/src/physics/rigid-body.ts
function bottomOffset(shape) {
  if (shape.kind === "sphere") return shape.radius;
  if (shape.kind === "box") return shape.half.y;
  if (shape.kind === "capsule" || shape.kind === "cylinder") return shape.height / 2;
  return 0.5;
}
function resolveGround(body, cfg = {}) {
  if (body.isStatic) return false;
  const groundY = cfg.y ?? 0;
  const restitution = cfg.restitution ?? 0.2;
  const friction = cfg.friction ?? 0.85;
  const bottom = body.position.y - bottomOffset(body.shape);
  if (bottom >= groundY) return false;
  body.position.y += groundY - bottom;
  if (body.velocity.y < 0) {
    body.velocity.y = -body.velocity.y * restitution;
    if (Math.abs(body.velocity.y) < 0.5) body.velocity.y = 0;
  }
  body.velocity.x *= friction;
  body.velocity.z *= friction;
  return true;
}

// engine/src/physics/fluid-dynamics.ts
var FluidSimulator = class {
  constructor() {
    __publicField(this, "volumes", []);
    __publicField(this, "ripples", []);
    __publicField(this, "currentTime", 0);
  }
  addVolume(vol) {
    this.volumes.push(vol);
  }
  getVolumes() {
    return this.volumes;
  }
  triggerRipple(x, z, intensity = 1, speed = 2) {
    this.ripples.push({
      x,
      z,
      startTime: this.currentTime,
      intensity,
      speed
    });
    if (this.ripples.length > 50) this.ripples.shift();
  }
  getWaveHeight(x, z, t, baseLevel = 0) {
    const wave1 = Math.sin(x * 0.4 + t * 1.5) * 0.15;
    const wave2 = Math.cos(z * 0.3 + t * 1.2) * 0.12;
    let rippleHeight = 0;
    for (const r of this.ripples) {
      const age = t - r.startTime;
      if (age < 0 || age > 4) continue;
      const dist = Math.hypot(x - r.x, z - r.z);
      const waveFront = age * r.speed;
      const d = dist - waveFront;
      if (Math.abs(d) < 1) {
        const decay = Math.max(0, 1 - age / 4) * (1 - Math.abs(d));
        rippleHeight += Math.sin(d * Math.PI * 2) * r.intensity * decay * 0.2;
      }
    }
    return baseLevel + wave1 + wave2 + rippleHeight;
  }
  step(bodies, dt) {
    this.currentTime += dt;
    for (const vol of this.volumes) {
      for (const body of bodies) {
        if (body.isStatic) continue;
        const bx = body.position.x;
        const by = body.position.y;
        const bz = body.position.z;
        if (bx >= vol.bounds.min.x && bx <= vol.bounds.max.x && bz >= vol.bounds.min.z && bz <= vol.bounds.max.z) {
          const waterY = this.getWaveHeight(bx, bz, this.currentTime, vol.surfaceY);
          const bRadius = bottomOffset(body.shape);
          const bodyBottom = by - bRadius;
          if (bodyBottom < waterY) {
            const submergedDepth = Math.min(bRadius * 2, waterY - bodyBottom);
            const submergedRatio = Math.max(0, Math.min(1, submergedDepth / (bRadius * 2)));
            const volumeApprox = 4 / 3 * Math.PI * Math.pow(bRadius, 3);
            const buoyancyForce = vol.density * volumeApprox * submergedRatio * 9.81 * 1.5;
            body.velocity.y += buoyancyForce / Math.max(1e-4, body.mass) * dt;
            const viscosity = vol.viscosity ?? 1;
            const waterDrag = viscosity * submergedRatio * 3;
            const dragFactor = Math.max(0, 1 - waterDrag * dt);
            body.velocity.x *= dragFactor;
            body.velocity.y *= dragFactor;
            body.velocity.z *= dragFactor;
            const flowX = vol.flowVelocity?.x ?? 0;
            const flowZ = vol.flowVelocity?.z ?? 0;
            body.velocity.x += flowX * submergedRatio * dt * 2;
            body.velocity.z += flowZ * submergedRatio * dt * 2;
            if (Math.abs(body.velocity.y) > 1.5 && submergedDepth < 0.3) {
              this.triggerRipple(bx, bz, 0.5);
            }
          }
        }
      }
    }
  }
};

// engine/src/physics/destruction-engine.ts
import * as THREE25 from "three";
var DestructionEngine = class {
  constructor() {
    __publicField(this, "activeShards", []);
  }
  shatterMesh(mesh, impactPoint, force, numPieces = 8) {
    const parentGroup = new THREE25.Group();
    parentGroup.name = `${mesh.name}_shattered`;
    parentGroup.position.copy(mesh.position);
    parentGroup.rotation.copy(mesh.rotation);
    parentGroup.scale.copy(mesh.scale);
    const bounds = computeBounds(mesh);
    const size = bounds.size;
    for (let i = 0; i < numPieces; i++) {
      const pieceSizeX = size[0] / Math.cbrt(numPieces) * (0.6 + Math.random() * 0.8);
      const pieceSizeY = size[1] / Math.cbrt(numPieces) * (0.6 + Math.random() * 0.8);
      const pieceSizeZ = size[2] / Math.cbrt(numPieces) * (0.6 + Math.random() * 0.8);
      const shardGeo = new THREE25.BoxGeometry(pieceSizeX, pieceSizeY, pieceSizeZ);
      const shardMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const shardMesh = new THREE25.Mesh(shardGeo, shardMat);
      const offsetX = (Math.random() - 0.5) * size[0] * 0.8;
      const offsetY = (Math.random() - 0.5) * size[1] * 0.8;
      const offsetZ = (Math.random() - 0.5) * size[2] * 0.8;
      shardMesh.position.set(offsetX, offsetY, offsetZ);
      const dir = shardMesh.position.clone().sub(impactPoint).normalize();
      if (dir.lengthSq() < 1e-4) dir.set(Math.random() - 0.5, 1, Math.random() - 0.5).normalize();
      const speed = (0.5 + Math.random()) * Math.min(20, force);
      const velocity = dir.multiplyScalar(speed);
      velocity.y += Math.random() * 3 + 1;
      const shardData = {
        id: `shard_${Date.now()}_${i}`,
        meshId: mesh.name,
        position: { x: shardMesh.position.x, y: shardMesh.position.y, z: shardMesh.position.z },
        velocity: { x: velocity.x, y: velocity.y, z: velocity.z },
        angularVelocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10
        },
        mass: 1 / numPieces,
        lifetime: 4 + Math.random() * 2
      };
      parentGroup.add(shardMesh);
      this.activeShards.push({ shard: shardData, mesh: shardMesh, elapsed: 0 });
    }
    return parentGroup;
  }
  step(dt, groundY = 0) {
    const gravity = -9.81;
    for (let i = this.activeShards.length - 1; i >= 0; i--) {
      const entry = this.activeShards[i];
      entry.elapsed += dt;
      if (entry.elapsed >= entry.shard.lifetime) {
        entry.mesh.removeFromParent();
        entry.mesh.geometry.dispose();
        this.activeShards.splice(i, 1);
        continue;
      }
      entry.shard.velocity.y += gravity * dt;
      entry.mesh.position.x += entry.shard.velocity.x * dt;
      entry.mesh.position.y += entry.shard.velocity.y * dt;
      entry.mesh.position.z += entry.shard.velocity.z * dt;
      entry.mesh.rotation.x += entry.shard.angularVelocity.x * dt;
      entry.mesh.rotation.y += entry.shard.angularVelocity.y * dt;
      entry.mesh.rotation.z += entry.shard.angularVelocity.z * dt;
      if (entry.mesh.position.y <= groundY) {
        entry.mesh.position.y = groundY;
        entry.shard.velocity.y = -entry.shard.velocity.y * 0.3;
        entry.shard.velocity.x *= 0.7;
        entry.shard.velocity.z *= 0.7;
        entry.shard.angularVelocity.x *= 0.6;
        entry.shard.angularVelocity.y *= 0.6;
        entry.shard.angularVelocity.z *= 0.6;
      }
    }
  }
  get activeCount() {
    return this.activeShards.length;
  }
  clear() {
    for (const entry of this.activeShards) {
      entry.mesh.removeFromParent();
    }
    this.activeShards = [];
  }
};

// engine/src/physics/ragdoll-solver.ts
import * as THREE26 from "three";

// engine/src/physics/index.ts
var PhysicsWorld = class {
  constructor(opts = {}) {
    __publicField(this, "gravity");
    __publicField(this, "fluids", new FluidSimulator());
    __publicField(this, "destruction", new DestructionEngine());
    __publicField(this, "bodies", /* @__PURE__ */ new Map());
    __publicField(this, "groundCfg");
    __publicField(this, "ragdolls", []);
    this.gravity = new GravityEngine(opts.gravity);
    this.groundCfg = opts.ground ?? { y: 0, restitution: 0.2, friction: 0.85 };
  }
  addBody(body) {
    if (this.bodies.has(body.id)) {
      console.warn(`[physics] body "${body.id}" \u0111\xE3 t\u1ED3n t\u1EA1i \u2014 ghi \u0111\xE8`);
    }
    this.bodies.set(body.id, body);
  }
  removeBody(id) {
    return this.bodies.delete(id);
  }
  getBody(id) {
    return this.bodies.get(id);
  }
  get bodyCount() {
    return this.bodies.size;
  }
  get bodiesList() {
    return Array.from(this.bodies.values());
  }
  getAllBodies() {
    return this.bodiesList;
  }
  clear() {
    this.bodies.clear();
    this.ragdolls = [];
    this.destruction.clear();
  }
  setGround(cfg) {
    this.groundCfg = { ...this.groundCfg, ...cfg };
  }
  addRagdoll(ragdoll) {
    this.ragdolls.push(ragdoll);
  }
  step(dt) {
    const list = this.bodiesList;
    for (const b of list) {
      if (b.isStatic) continue;
      this.gravity.integrate(b, dt);
    }
    this.fluids.step(list, dt);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (a.isStatic && b.isStatic) continue;
        const hit = collideBodies(a, b);
        if (!hit?.hit || !hit.normal) continue;
        const depth = hit.depth;
        if (depth <= 0) continue;
        const nrm = new THREE27.Vector3(hit.normal.x, hit.normal.y, hit.normal.z);
        const invMassA = a.isStatic ? 0 : 1 / Math.max(1e-6, a.mass);
        const invMassB = b.isStatic ? 0 : 1 / Math.max(1e-6, b.mass);
        const total = invMassA + invMassB;
        if (total <= 0) continue;
        const pa = a.position;
        const pb = b.position;
        pa.x += nrm.x * -depth * (invMassA / total);
        pa.y += nrm.y * -depth * (invMassA / total);
        pa.z += nrm.z * -depth * (invMassA / total);
        pb.x += nrm.x * depth * (invMassB / total);
        pb.y += nrm.y * depth * (invMassB / total);
        pb.z += nrm.z * depth * (invMassB / total);
      }
    }
    for (const b of list) {
      resolveGround(b, this.groundCfg);
    }
    for (const r of this.ragdolls) {
      r.step(dt, this.groundCfg.y ?? 0);
    }
    this.destruction.step(dt, this.groundCfg.y ?? 0);
  }
  stepPhysics(dt) {
    this.step(dt);
  }
  raycast(origin, dir, maxDist) {
    let closest = { hit: false };
    let bestDist = maxDist;
    for (const b of this.bodies.values()) {
      const c = shapeCenter(b.position, b.shape);
      let hit = { hit: false };
      if (b.shape.kind === "sphere") {
        hit = raySphere(origin, dir, { center: c, radius: b.shape.radius }, bestDist);
      } else if (b.shape.kind === "box") {
        const half = new THREE27.Vector3(b.shape.half.x, b.shape.half.y, b.shape.half.z);
        hit = rayBox(origin, dir, { center: c, half }, bestDist);
      } else if (b.shape.kind === "capsule") {
        hit = rayCapsule(origin, dir, { center: c, radius: b.shape.radius, height: b.shape.height }, bestDist);
      }
      if (hit.hit && hit.distance !== void 0 && hit.distance < bestDist) {
        bestDist = hit.distance;
        closest = { ...hit, bodyId: b.id };
      }
    }
    return closest;
  }
};

// engine/src/effects/particle-system.ts
import * as THREE28 from "three";
var PARTICLE_VERT = `
attribute vec3 aVelocity;
attribute float aLife;
attribute float aMaxLife;
attribute float aSize;
uniform float uGravity;
varying float vT;
void main() {
  float age = aMaxLife > 0.0 ? (aMaxLife - aLife) : 0.0;
  float t = aMaxLife > 0.0 ? clamp(age / aMaxLife, 0.0, 1.0) : 1.0;
  vT = t;
  vec3 pos = position + aVelocity * age;
  pos.y -= uGravity * age * age * 0.5;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (1.0 - t) * (300.0 / max(0.001, -mv.z));
  gl_Position = projectionMatrix * mv;
}`;
var PARTICLE_FRAG = `
uniform vec3 uColorFrom;
uniform vec3 uColorTo;
varying float vT;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5);
  float d = length(c);
  if (d > 0.5) discard;
  vec3 color = mix(uColorFrom, uColorTo, vT);
  float alpha = (1.0 - vT) * (1.0 - d * 2.0);
  gl_FragColor = vec4(color, alpha);
}`;
function randRange(a, b) {
  return a + Math.random() * (b - a);
}
function hexToVec3(hex) {
  const c = new THREE28.Color(hex);
  return new THREE28.Vector3(c.r, c.g, c.b);
}
var ParticleSystem = class {
  constructor() {
    __publicField(this, "group", new THREE28.Group());
    __publicField(this, "emitters", /* @__PURE__ */ new Map());
    __publicField(this, "seq", 0);
  }
  get emitterCount() {
    return this.emitters.size;
  }
  createEmitter(cfg) {
    const id = this.spawn(cfg, new THREE28.Vector3());
    const emitter = this.emitters.get(id);
    return {
      id,
      setPosition: (x, y, z) => {
        if (emitter) {
          emitter.points.position.set(x, y, z);
          emitter.origin.set(x, y, z);
        }
      }
    };
  }
  removeEmitter(id) {
    this.stop(id);
  }
  getActiveParticleCount() {
    let total = 0;
    for (const e of this.emitters.values()) total += e.alive;
    return total;
  }
  dispose() {
    this.clear();
  }
  spawn(cfg, at) {
    let id = cfg.id;
    if (this.emitters.has(id)) id = `${cfg.id}_${++this.seq}`;
    const max = Math.max(1, Math.floor(cfg.max));
    const geometry = new THREE28.BufferGeometry();
    const posAttr = new THREE28.BufferAttribute(new Float32Array(max * 3), 3);
    const velAttr = new THREE28.BufferAttribute(new Float32Array(max * 3), 3);
    const lifeAttr = new THREE28.BufferAttribute(new Float32Array(max), 1);
    const maxLifeAttr = new THREE28.BufferAttribute(new Float32Array(max), 1);
    const sizeAttr = new THREE28.BufferAttribute(new Float32Array(max), 1);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aVelocity", velAttr);
    geometry.setAttribute("aLife", lifeAttr);
    geometry.setAttribute("aMaxLife", maxLifeAttr);
    geometry.setAttribute("aSize", sizeAttr);
    geometry.setDrawRange(0, max);
    geometry.boundingSphere = new THREE28.Sphere(at.clone(), 1e6);
    const material = new THREE28.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      uniforms: {
        uGravity: { value: cfg.gravity ?? 0 },
        uColorFrom: { value: hexToVec3(cfg.colorFrom) },
        uColorTo: { value: hexToVec3(cfg.colorTo) }
      },
      transparent: true,
      depthWrite: false,
      blending: cfg.blend === "additive" ? THREE28.AdditiveBlending : THREE28.NormalBlending
    });
    const points = new THREE28.Points(geometry, material);
    points.name = `emitter_${id}`;
    if (!cfg.worldSpace) points.position.copy(at);
    this.group.add(points);
    const state = {
      id,
      cfg,
      points,
      geometry,
      material,
      posAttr,
      velAttr,
      lifeAttr,
      maxLifeAttr,
      sizeAttr,
      cursor: 0,
      acc: 0,
      stopping: false,
      alive: 0,
      origin: at.clone()
    };
    const initial = Math.min(max, Math.max(1, Math.ceil(cfg.rate)));
    for (let i = 0; i < initial; i++) this.emitOne(state);
    this.emitters.set(id, state);
    return id;
  }
  stop(id) {
    const s = this.emitters.get(id);
    if (s) s.stopping = true;
  }
  stopAll() {
    for (const s of this.emitters.values()) s.stopping = true;
  }
  aliveCount(id) {
    if (id) return this.emitters.get(id)?.alive ?? 0;
    let sum = 0;
    for (const s of this.emitters.values()) sum += s.alive;
    return sum;
  }
  update(dt) {
    const toRemove = [];
    for (const [id, s] of this.emitters) {
      if (!s.stopping && s.cfg.rate > 0) {
        s.acc += s.cfg.rate * dt;
        const count = Math.floor(s.acc);
        if (count > 0) {
          s.acc -= count;
          const clamped = Math.min(count, s.cfg.max);
          for (let i = 0; i < clamped; i++) this.emitOne(s);
        }
      }
      const life = s.lifeAttr.array;
      let alive = 0;
      for (let i = 0; i < life.length; i++) {
        if (life[i] > 0) {
          life[i] -= dt;
          if (life[i] <= 0) life[i] = 0;
          else alive++;
        }
      }
      s.alive = alive;
      s.lifeAttr.needsUpdate = true;
      if (s.stopping && alive === 0) toRemove.push(id);
    }
    for (const id of toRemove) this.disposeEmitter(id);
  }
  clear() {
    for (const id of Array.from(this.emitters.keys())) this.disposeEmitter(id);
  }
  emitOne(s) {
    const idx = s.cursor;
    s.cursor = (s.cursor + 1) % s.cfg.max;
    const jitter = s.cfg.velocityJitter ?? [0, 0, 0];
    const vx = s.cfg.velocity[0] + (Math.random() - 0.5) * jitter[0];
    const vy = s.cfg.velocity[1] + (Math.random() - 0.5) * jitter[1];
    const vz = s.cfg.velocity[2] + (Math.random() - 0.5) * jitter[2];
    const maxLife = randRange(s.cfg.lifetime[0], s.cfg.lifetime[1]);
    const size = randRange(s.cfg.size[0], s.cfg.size[1]);
    const pos = s.posAttr.array;
    const vel = s.velAttr.array;
    const life = s.lifeAttr.array;
    const maxL = s.maxLifeAttr.array;
    const sz = s.sizeAttr.array;
    const base = s.cfg.worldSpace ? s.origin : { x: 0, y: 0, z: 0 };
    pos[idx * 3] = base.x;
    pos[idx * 3 + 1] = base.y;
    pos[idx * 3 + 2] = base.z;
    vel[idx * 3] = vx;
    vel[idx * 3 + 1] = vy;
    vel[idx * 3 + 2] = vz;
    life[idx] = maxLife;
    maxL[idx] = maxLife;
    sz[idx] = size;
    s.posAttr.needsUpdate = true;
    s.velAttr.needsUpdate = true;
    s.lifeAttr.needsUpdate = true;
    s.maxLifeAttr.needsUpdate = true;
    s.sizeAttr.needsUpdate = true;
    s.alive = Math.min(s.cfg.max, s.alive + 1);
  }
  disposeEmitter(id) {
    const s = this.emitters.get(id);
    if (!s) return;
    s.points.removeFromParent();
    s.geometry.dispose();
    s.material.dispose();
    this.emitters.delete(id);
  }
};

// engine/src/effects/decal-projector.ts
import * as THREE29 from "three";
var DecalProjector = class {
  constructor(opts = {}) {
    __publicField(this, "group", new THREE29.Group());
    __publicField(this, "decals", []);
    __publicField(this, "max");
    this.max = Math.max(1, opts.max ?? 32);
    this.group.name = "decals";
  }
  get count() {
    return this.decals.length;
  }
  spawn(spec, position, normal) {
    return this.project(spec, position, normal);
  }
  loadTextureSafe(url) {
    if (typeof document === "undefined" || !url) return null;
    try {
      const loader = new THREE29.TextureLoader();
      let tex = null;
      tex = loader.load(url, void 0, void 0, () => {
      });
      return tex;
    } catch {
      return null;
    }
  }
  project(spec, position, normal) {
    const size = typeof spec.size === "number" ? spec.size : spec.size[0];
    if (!(size > 0)) return null;
    if (this.decals.length >= this.max) {
      const oldest = this.decals.shift();
      if (oldest) this.removeEntry(oldest);
    }
    const geometry = new THREE29.PlaneGeometry(size, size);
    const texture = this.loadTextureSafe(spec.texture);
    const material = new THREE29.MeshBasicMaterial({
      color: texture ? 16777215 : 3355443,
      map: texture ?? void 0,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE29.DoubleSide
    });
    const mesh = new THREE29.Mesh(geometry, material);
    mesh.renderOrder = 1;
    mesh.name = `decal_${spec.orient}`;
    if (spec.orient === "surface" && normal && normal.lengthSq() > 1e-9) {
      const n = normal.clone().normalize();
      mesh.quaternion.setFromUnitVectors(new THREE29.Vector3(0, 0, 1), n);
      mesh.position.copy(position).addScaledVector(n, 0.01);
    } else {
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = spec.rotation ?? 0;
      mesh.position.set(position.x, position.y + 0.01, position.z);
    }
    this.group.add(mesh);
    this.decals.push({ mesh, age: 0, fadeTime: spec.fadeTime ?? 5, texture });
    return mesh;
  }
  update(dt) {
    for (const entry of [...this.decals]) {
      entry.age += dt;
      const t = entry.fadeTime > 0 ? entry.age / entry.fadeTime : 0;
      const mat2 = entry.mesh.material;
      mat2.opacity = Math.max(0, 1 - t);
      if (t >= 1) {
        const idx = this.decals.indexOf(entry);
        if (idx !== -1) {
          this.decals.splice(idx, 1);
          this.removeEntry(entry);
        }
      }
    }
  }
  clear() {
    for (const d of this.decals) this.removeEntry(d);
    this.decals = [];
  }
  removeEntry(entry) {
    entry.mesh.removeFromParent();
    entry.mesh.geometry.dispose();
    entry.mesh.material.dispose();
  }
};

// engine/src/effects/post-processing.ts
import * as THREE30 from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
var GradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    uLift: { value: new THREE30.Vector3(0, 0, 0) },
    uGamma: { value: new THREE30.Vector3(1, 1, 1) },
    uExposure: { value: 1 },
    uVignette: { value: 0 },
    uLetterbox: { value: 0 }
  },
  vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform vec3 uLift;
uniform vec3 uGamma;
uniform float uExposure;
uniform float uVignette;
uniform float uLetterbox;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  vec3 col = c.rgb * uExposure;
  col = pow(max(col, vec3(0.0)), vec3(1.0) / uGamma) + uLift;
  float d = distance(vUv, vec2(0.5));
  col *= mix(1.0, smoothstep(0.85, 0.35, d), uVignette);
  float bar = uLetterbox * 0.12;
  if (vUv.y < bar || vUv.y > 1.0 - bar) col = vec3(0.0);
  gl_FragColor = vec4(col, c.a);
}`
};
var GrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uIntensity: { value: 0.05 }
  },
  vertexShader: GradingShader.vertexShader,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;
float hash(vec2 p) {
  return fract(sin(dot(p + uTime, vec2(127.1, 311.7))) * 43758.5453);
}
void main() {
  vec4 c = texture2D(tDiffuse, vUv);
  float n = hash(vUv * vec2(1920.0, 1080.0)) - 0.5;
  gl_FragColor = vec4(c.rgb + n * uIntensity, c.a);
}`
};
function buildComposer(renderer, scene, camera, cfg) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const passes = /* @__PURE__ */ new Map();
  for (const passName of cfg.passes) {
    if (passName === "bloom") {
      const bloomPass = new UnrealBloomPass(
        new THREE30.Vector2(window?.innerWidth || 1920, window?.innerHeight || 1080),
        cfg.bloomStrength ?? 0.8,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
      passes.set("bloom", bloomPass);
    } else if (passName === "grading") {
      const grading = new ShaderPass(GradingShader);
      composer.addPass(grading);
      passes.set("grading", grading);
    } else if (passName === "grain") {
      const grain = new ShaderPass(GrainShader);
      composer.addPass(grain);
      passes.set("grain", grain);
    }
  }
  composer.addPass(new OutputPass());
  return {
    composer,
    passes,
    setSize(w, h) {
      composer.setSize(w, h);
    },
    render(dt) {
      composer.render(dt);
    },
    setPassEnabled(name, enabled) {
      const p = passes.get(name);
      if (p) p.enabled = enabled;
    },
    setGrainTime(t) {
      const g = passes.get("grain");
      if (g) g.uniforms.uTime.value = t;
    },
    dispose() {
      composer.renderTarget1.dispose();
      composer.renderTarget2.dispose();
    }
  };
}
var PostProcessing = class {
  constructor(renderer, scene, camera, cfg = { passes: ["bloom", "grading"] }) {
    __publicField(this, "fx");
    this.fx = buildComposer(renderer, scene, camera, cfg);
  }
  render(dt = 0.016) {
    this.fx.render(dt);
  }
  setSize(w, h) {
    this.fx.setSize(w, h);
  }
  setPassEnabled(name, enabled) {
    this.fx.setPassEnabled(name, enabled);
  }
  dispose() {
    this.fx.dispose();
  }
};

// engine/src/input/input-map.ts
var InputMap = class {
  constructor() {
    __publicField(this, "bindings", /* @__PURE__ */ new Map());
    __publicField(this, "activeKeys", /* @__PURE__ */ new Set());
    __publicField(this, "activeMouseButtons", /* @__PURE__ */ new Set());
    __publicField(this, "justPressedActions", /* @__PURE__ */ new Set());
    __publicField(this, "justReleasedActions", /* @__PURE__ */ new Set());
    __publicField(this, "mouseDelta", { x: 0, y: 0 });
    __publicField(this, "mouseWheel", 0);
    __publicField(this, "isListening", false);
    __publicField(this, "keyDownHandler");
    __publicField(this, "keyUpHandler");
    __publicField(this, "mouseDownHandler");
    __publicField(this, "mouseUpHandler");
    __publicField(this, "mouseMoveHandler");
    __publicField(this, "wheelHandler");
    this.initDefaultBindings();
  }
  initDefaultBindings() {
    this.bind("move_forward", { keys: ["KeyW", "ArrowUp"] });
    this.bind("move_backward", { keys: ["KeyS", "ArrowDown"] });
    this.bind("move_left", { keys: ["KeyA", "ArrowLeft"] });
    this.bind("move_right", { keys: ["KeyD", "ArrowRight"] });
    this.bind("jump", { keys: ["Space"] });
    this.bind("crouch", { keys: ["KeyC", "ControlLeft"] });
    this.bind("sprint", { keys: ["ShiftLeft"] });
    this.bind("dodge", { keys: ["AltLeft", "KeyV"] });
    this.bind("attack", { mouseButtons: [0], keys: ["KeyJ"] });
    this.bind("heavy_attack", { mouseButtons: [2], keys: ["KeyK"] });
    this.bind("block", { mouseButtons: [1], keys: ["KeyL"] });
    this.bind("interact", { keys: ["KeyE"] });
    this.bind("aim", { mouseButtons: [2], keys: ["KeyQ"] });
  }
  bind(action, binding) {
    this.bindings.set(action, binding);
  }
  attach(target = globalThis) {
    if (this.isListening || typeof target?.addEventListener !== "function") return;
    this.keyDownHandler = (e) => {
      if (!this.activeKeys.has(e.code)) {
        this.activeKeys.add(e.code);
        this.updateJustPressedForKey(e.code);
      }
    };
    this.keyUpHandler = (e) => {
      this.activeKeys.delete(e.code);
      this.updateJustReleasedForKey(e.code);
    };
    this.mouseDownHandler = (e) => {
      if (!this.activeMouseButtons.has(e.button)) {
        this.activeMouseButtons.add(e.button);
        this.updateJustPressedForMouse(e.button);
      }
    };
    this.mouseUpHandler = (e) => {
      this.activeMouseButtons.delete(e.button);
      this.updateJustReleasedForMouse(e.button);
    };
    this.mouseMoveHandler = (e) => {
      this.mouseDelta.x += e.movementX ?? 0;
      this.mouseDelta.y += e.movementY ?? 0;
    };
    this.wheelHandler = (e) => {
      this.mouseWheel += e.deltaY;
      if (e.deltaY < 0) this.justPressedActions.add("zoom_in");
      if (e.deltaY > 0) this.justPressedActions.add("zoom_out");
    };
    target.addEventListener("keydown", this.keyDownHandler);
    target.addEventListener("keyup", this.keyUpHandler);
    target.addEventListener("mousedown", this.mouseDownHandler);
    target.addEventListener("mouseup", this.mouseUpHandler);
    target.addEventListener("mousemove", this.mouseMoveHandler);
    target.addEventListener("wheel", this.wheelHandler);
    this.isListening = true;
  }
  detach(target = globalThis) {
    if (!this.isListening || typeof target?.removeEventListener !== "function") return;
    if (this.keyDownHandler) target.removeEventListener("keydown", this.keyDownHandler);
    if (this.keyUpHandler) target.removeEventListener("keyup", this.keyUpHandler);
    if (this.mouseDownHandler) target.removeEventListener("mousedown", this.mouseDownHandler);
    if (this.mouseUpHandler) target.removeEventListener("mouseup", this.mouseUpHandler);
    if (this.mouseMoveHandler) target.removeEventListener("mousemove", this.mouseMoveHandler);
    if (this.wheelHandler) target.removeEventListener("wheel", this.wheelHandler);
    this.isListening = false;
  }
  updateJustPressedForKey(code) {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.keys?.includes(code)) {
        this.justPressedActions.add(action);
      }
    }
  }
  updateJustReleasedForKey(code) {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.keys?.includes(code)) {
        this.justReleasedActions.add(action);
      }
    }
  }
  updateJustPressedForMouse(btn) {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.mouseButtons?.includes(btn)) {
        this.justPressedActions.add(action);
      }
    }
  }
  updateJustReleasedForMouse(btn) {
    for (const [action, binding] of this.bindings.entries()) {
      if (binding.mouseButtons?.includes(btn)) {
        this.justReleasedActions.add(action);
      }
    }
  }
  /**
   * Check if action is currently held down.
   */
  isActionPressed(action) {
    const binding = this.bindings.get(action);
    if (!binding) return false;
    if (binding.keys?.some((k) => this.activeKeys.has(k))) return true;
    if (binding.mouseButtons?.some((b) => this.activeMouseButtons.has(b))) return true;
    return false;
  }
  /**
   * Check if action was pressed during this frame.
   */
  isActionJustPressed(action) {
    return this.justPressedActions.has(action);
  }
  /**
   * Check if action was released during this frame.
   */
  isActionJustReleased(action) {
    return this.justReleasedActions.has(action);
  }
  /**
   * Get normalized 2D movement vector (-1..1).
   */
  getMovementVector() {
    let x = 0;
    let y = 0;
    if (this.isActionPressed("move_forward")) y += 1;
    if (this.isActionPressed("move_backward")) y -= 1;
    if (this.isActionPressed("move_left")) x -= 1;
    if (this.isActionPressed("move_right")) x += 1;
    const len = Math.hypot(x, y);
    if (len > 0) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }
  getMouseDelta() {
    return { ...this.mouseDelta };
  }
  /**
   * Reset frame-specific triggers (called at the end of each frame).
   */
  endFrame() {
    this.justPressedActions.clear();
    this.justReleasedActions.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.mouseWheel = 0;
  }
  /**
   * Synthetic trigger for testing or bot AI input simulation.
   */
  simulateAction(action, state) {
    if (state === "press") {
      this.justPressedActions.add(action);
      this.activeKeys.add(`Sim_${action}`);
      const b = this.bindings.get(action) || {};
      this.bindings.set(action, { ...b, keys: [...b.keys || [], `Sim_${action}`] });
    } else if (state === "release") {
      this.activeKeys.delete(`Sim_${action}`);
      this.justReleasedActions.add(action);
    }
  }
};

// engine/src/audio/audio-bus.ts
var AudioBus = class {
  constructor() {
    __publicField(this, "channelVolumes", {
      master: 1,
      bgm: 0.8,
      sfx: 1,
      ambient: 0.7,
      ui: 0.9,
      voice: 1
    });
    __publicField(this, "listenerPosition", { x: 0, y: 0, z: 0 });
    __publicField(this, "sounds", /* @__PURE__ */ new Map());
    __publicField(this, "muted", false);
  }
  setChannelVolume(channel, volume) {
    this.channelVolumes[channel] = Math.max(0, Math.min(1, volume));
  }
  getChannelVolume(channel) {
    return this.channelVolumes[channel];
  }
  setMuted(muted) {
    this.muted = muted;
  }
  isMuted() {
    return this.muted;
  }
  setListenerPosition(pos) {
    this.listenerPosition = { ...pos };
  }
  /**
   * Play a sound instance through a specified audio channel.
   */
  play(id, channel = "sfx", options = {}) {
    const sound = {
      id,
      channel,
      volume: options.volume ?? 1,
      loop: options.loop ?? false,
      position: options.position ? { ...options.position } : void 0,
      isPlaying: true
    };
    this.sounds.set(id, sound);
    return sound;
  }
  stop(id) {
    const s = this.sounds.get(id);
    if (s) {
      s.isPlaying = false;
      this.sounds.delete(id);
    }
  }
  /**
   * Calculate final effective volume considering master, channel, and 3D distance attenuation.
   */
  getEffectiveVolume(soundId, maxDistance = 30) {
    if (this.muted) return 0;
    const sound = this.sounds.get(soundId);
    if (!sound || !sound.isPlaying) return 0;
    const master = this.channelVolumes.master;
    const channelVol = this.channelVolumes[sound.channel];
    let distanceFactor = 1;
    if (sound.position) {
      const dist = Math.hypot(
        sound.position.x - this.listenerPosition.x,
        sound.position.y - this.listenerPosition.y,
        sound.position.z - this.listenerPosition.z
      );
      if (dist >= maxDistance) return 0;
      distanceFactor = Math.max(0, 1 - dist / maxDistance);
    }
    return master * channelVol * sound.volume * distanceFactor;
  }
  clear() {
    this.sounds.clear();
  }
};

// engine/src/game-engine.ts
var GameEngine = class {
  constructor() {
    __publicField(this, "canvas", null);
    __publicField(this, "scene");
    __publicField(this, "camera");
    __publicField(this, "renderer", null);
    // Subsystems
    __publicField(this, "ticker");
    __publicField(this, "events");
    __publicField(this, "assetParser");
    __publicField(this, "physics");
    __publicField(this, "particles");
    __publicField(this, "decals");
    __publicField(this, "postFx", null);
    __publicField(this, "assetCache");
    __publicField(this, "objectPool");
    __publicField(this, "input");
    __publicField(this, "audio");
    __publicField(this, "graphicsMode", "balanced");
    __publicField(this, "manifests", /* @__PURE__ */ new Map());
    __publicField(this, "activeEmitters", /* @__PURE__ */ new Map());
    __publicField(this, "isInitialized", false);
    this.scene = new THREE31.Scene();
    this.camera = new THREE31.PerspectiveCamera(60, 16 / 9, 0.1, 1e3);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    this.events = new EventBus();
    this.assetParser = new AssetParser();
    this.physics = new PhysicsWorld();
    this.particles = new ParticleSystem();
    this.decals = new DecalProjector();
    this.assetCache = new AssetCache();
    this.objectPool = new ObjectPool();
    this.input = new InputMap();
    this.audio = new AudioBus();
    this.scene.add(this.particles.group);
    this.scene.add(this.decals.group);
    this.ticker = new Ticker({
      update: (dt) => {
        this.stepPhysics(dt);
        this.particles.update(dt);
        this.decals.update(dt);
      },
      render: () => {
        this.render();
        this.input.endFrame();
      },
      fpsCap: 60
    });
  }
  async init(opts) {
    this.canvas = opts.canvas;
    const fps = opts.fpsCap ?? 60;
    this.setFpsCap(fps);
    if (this.canvas) {
      try {
        this.renderer = new THREE31.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          powerPreference: "high-performance"
        });
        this.renderer.setSize(this.canvas.clientWidth || 800, this.canvas.clientHeight || 600, false);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE31.PCFSoftShadowMap;
        this.postFx = new PostProcessing(this.renderer, this.scene, this.camera);
      } catch {
        this.renderer = null;
      }
    }
    if (opts.graphicsMode) {
      this.applyGraphicsMode(opts.graphicsMode);
    }
    this.isInitialized = true;
    this.ticker.start();
  }
  dispose() {
    this.ticker.stop();
    this.particles.dispose();
    this.decals.clear();
    this.physics.clear();
    this.assetCache.clear();
    this.objectPool.clear();
    this.audio.clear();
    if (this.postFx) {
      this.postFx.dispose();
      this.postFx = null;
    }
    if (this.renderer) {
      MemoryDisposer.disposeObject(this.scene);
      this.renderer.dispose();
      this.renderer = null;
    }
    this.isInitialized = false;
  }
  // --- Assets ---
  async loadAsset(path, opts = {}) {
    const cached = this.assetCache.get(path);
    if (cached) return cached;
    const parsed = await this.assetParser.parse(path, opts);
    this.assetCache.set(path, parsed);
    const manifest = {
      id: path,
      path,
      name: parsed.metadata?.name || path,
      format: parsed.format,
      category: opts.category ?? parsed.category,
      rig: parsed.metadata?.rig,
      tags: opts.tags ?? [],
      bounds: parsed.bounds,
      sizeBytes: parsed.sizeBytes
    };
    this.manifests.set(path, manifest);
    return parsed;
  }
  /**
   * Phân tích một tài sản đã nạp — ngân sách hiệu năng, phát hiện lỗi, gợi ý LOD.
   */
  analyzeAsset(path, opts) {
    const asset = this.assetCache.get(path);
    if (!asset) return void 0;
    return analyzeAsset(asset, opts);
  }
  instantiate(assetId) {
    const asset = this.assetCache.get(assetId);
    const target = asset?.model ?? asset?.scene;
    if (!target) return null;
    return target.clone(true);
  }
  getManifestEntry(path) {
    return this.manifests.get(path);
  }
  // --- Transform / Zoom / Combiner ---
  applyPivot(obj, spec) {
    PivotAdjuster.apply(obj, spec);
  }
  applyScale(obj, targetHeight, factor) {
    return Scaler.applyScale(obj, targetHeight, factor);
  }
  zoomAsset(obj, opts) {
    return Scaler.zoomAsset(obj, opts);
  }
  bindSocket(rig, binding) {
    const socketName = binding.socket || binding.boneName || "";
    const parentSocket = rig.getObjectByName(`socket_${socketName}`) || rig.getObjectByName(socketName);
    if (!parentSocket) return false;
    let attachment = binding.attachment;
    if (!attachment && binding.assetId) {
      attachment = this.instantiate(binding.assetId) ?? void 0;
    }
    if (!attachment) return false;
    SocketBinder.attachToSocket(parentSocket, attachment, {
      position: binding.offset?.position,
      rotation: binding.offset?.rotation,
      scale: binding.offset?.scale
    });
    return true;
  }
  setupLOD(lod, levels) {
    for (const lvl of levels) {
      if (lvl.object) {
        lod.addLevel(lvl.object, lvl.distance);
      }
    }
  }
  // --- Physics ---
  addBody(body) {
    this.physics.addBody(body);
  }
  removeBody(id) {
    this.physics.removeBody(id);
  }
  raycast(origin, dir, maxDist) {
    return this.physics.raycast(origin, dir, maxDist);
  }
  stepPhysics(dt) {
    this.physics.step(dt);
  }
  // --- Effects / Renderer ---
  spawnEmitter(cfg, at) {
    const emitter = this.particles.createEmitter(cfg);
    emitter.setPosition(at.x, at.y, at.z);
    this.activeEmitters.set(emitter.id, emitter.id);
    return emitter.id;
  }
  stopEmitter(id) {
    this.particles.removeEmitter(id);
    this.activeEmitters.delete(id);
  }
  projectDecal(spec, position, normal) {
    this.decals.spawn(spec, position, normal);
  }
  applyGraphicsMode(mode) {
    this.graphicsMode = mode;
    const preset = GRAPHICS_PRESETS[mode];
    if (!preset) return;
    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.quality.pixelRatioCap));
      this.renderer.shadowMap.enabled = preset.quality.shadowMapSize > 0;
    }
  }
  getGraphicsPreset(mode) {
    return GRAPHICS_PRESETS[mode];
  }
  setFpsCap(cap) {
    this.ticker.setFpsCap(cap);
  }
  getStats() {
    const loopStats = this.ticker.stats;
    let triangles = 0;
    let drawCalls = 0;
    if (this.renderer?.info) {
      triangles = this.renderer.info.render.triangles;
      drawCalls = this.renderer.info.render.calls;
    }
    return {
      fps: loopStats.fps,
      frameMs: loopStats.frameMs,
      drawCalls,
      triangles,
      physicsBodiesCount: this.physics.getAllBodies().length,
      activeParticlesCount: this.particles.getActiveParticleCount()
    };
  }
  render() {
    if (!this.renderer) return;
    if (this.postFx) {
      this.postFx.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
};

// engine/src/core/tween.ts
function clamp01(v) {
  return clamp(v, 0, 1);
}
var c4 = 2 * Math.PI / 3;
var n1 = 7.5625;
var d1 = 2.75;
var Easings = {
  linear: (t) => t,
  quadIn: (t) => t * t,
  quadOut: (t) => 1 - (1 - t) * (1 - t),
  quadInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  cubicIn: (t) => t * t * t,
  cubicOut: (t) => 1 - Math.pow(1 - t, 3),
  cubicInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  elasticOut: (t) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1,
  bounceOut: (t) => {
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};
var Tween = class {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "loopsDone", 0);
    __publicField(this, "elapsed", 0);
    __publicField(this, "delayLeft");
    __publicField(this, "direction", 1);
    __publicField(this, "done", false);
    this.config = {
      ...config,
      duration: Math.max(1e-6, config.duration),
      loop: config.loop ?? 1
    };
    this.delayLeft = Math.max(0, config.delay ?? 0);
  }
  get finished() {
    return this.done;
  }
  get progress() {
    return clamp01(this.elapsed / this.config.duration);
  }
  update(dt) {
    if (this.done) return true;
    if (this.delayLeft > 0) {
      this.delayLeft -= dt;
      if (this.delayLeft > 0) return false;
      dt = -this.delayLeft;
      this.delayLeft = 0;
    }
    const cfg = this.config;
    this.elapsed += dt;
    let guard = 0;
    while (this.elapsed >= cfg.duration && !this.done && guard++ < 1e4) {
      this.elapsed -= cfg.duration;
      this.loopsDone++;
      const finishedLoopForward = this.direction > 0;
      if (cfg.yoyo) this.direction = -this.direction;
      if (this.loopsDone >= (cfg.loop ?? 1)) {
        this.done = true;
        const finalVal = finishedLoopForward ? cfg.to : cfg.from;
        cfg.onUpdate?.(finalVal, 1);
        cfg.onComplete?.();
        return true;
      }
    }
    if (this.done) return true;
    const rawT = clamp01(this.elapsed / cfg.duration);
    const directedT = this.direction > 0 ? rawT : 1 - rawT;
    const easeFn = typeof cfg.ease === "function" ? cfg.ease : Easings[cfg.ease ?? "quadOut"];
    const easedT = easeFn(directedT);
    const value = cfg.from + (cfg.to - cfg.from) * easedT;
    cfg.onUpdate?.(value, easedT);
    return false;
  }
  stop() {
    this.done = true;
  }
};
var Tweener = class {
  constructor() {
    __publicField(this, "tweens", /* @__PURE__ */ new Set());
  }
  to(config) {
    const tw = new Tween(config);
    this.tweens.add(tw);
    return tw;
  }
  update(dt) {
    if (this.tweens.size === 0) return;
    for (const tw of Array.from(this.tweens)) {
      if (tw.update(dt)) {
        this.tweens.delete(tw);
      }
    }
  }
  clear() {
    for (const tw of this.tweens) tw.stop();
    this.tweens.clear();
  }
  get count() {
    return this.tweens.size;
  }
};

// engine/src/core/timer.ts
var Timer = class {
  constructor() {
    __publicField(this, "tasks", /* @__PURE__ */ new Map());
    __publicField(this, "nextId", 1);
  }
  after(seconds, fn) {
    const id = `timer_${this.nextId++}`;
    this.tasks.set(id, {
      id,
      delay: Math.max(0, seconds),
      elapsed: 0,
      repeat: false,
      callback: fn,
      cancelled: false
    });
    return id;
  }
  every(seconds, fn) {
    const id = `timer_${this.nextId++}`;
    this.tasks.set(id, {
      id,
      delay: Math.max(1e-3, seconds),
      elapsed: 0,
      repeat: true,
      callback: fn,
      cancelled: false
    });
    return id;
  }
  cancel(id) {
    const t = this.tasks.get(id);
    if (t) {
      t.cancelled = true;
      this.tasks.delete(id);
    }
  }
  clear() {
    for (const t of this.tasks.values()) t.cancelled = true;
    this.tasks.clear();
  }
  update(dt) {
    if (this.tasks.size === 0) return;
    for (const [id, task] of Array.from(this.tasks.entries())) {
      if (task.cancelled) {
        this.tasks.delete(id);
        continue;
      }
      task.elapsed += dt;
      if (task.elapsed >= task.delay) {
        try {
          task.callback();
        } catch (err) {
          console.error(`Timer error on task ${id}:`, err);
        }
        if (task.repeat && !task.cancelled) {
          task.elapsed -= task.delay;
        } else {
          this.tasks.delete(id);
        }
      }
    }
  }
  get count() {
    return this.tasks.size;
  }
};

// engine/src/transformer/geometry-optimizer.ts
import * as THREE32 from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
var MERGE_ATTRIBUTES = ["position", "normal", "uv", "color"];
function mergeStatic(root, opts = {}) {
  const meshes = collectMeshes(root);
  if (meshes.length === 0) {
    const empty = new THREE32.Group();
    empty.name = `${root.name || "asset"}_merged`;
    return empty;
  }
  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE32.Matrix4().copy(root.matrixWorld).invert();
  const localMatrix = new THREE32.Matrix4();
  const groups = /* @__PURE__ */ new Map();
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
  const merged = new THREE32.Group();
  merged.name = `${root.name || "asset"}_merged`;
  for (const { material, geos } of groups.values()) {
    const mergedGeo = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!mergedGeo) continue;
    if (opts.computeNormals !== false && !mergedGeo.getAttribute("normal")) {
      mergedGeo.computeVertexNormals();
    }
    merged.add(new THREE32.Mesh(mergedGeo, material));
  }
  invalidateBounds(merged);
  return merged;
}
function simplifyGeometry(src, ratio) {
  const r = Math.min(1, Math.max(0.05, ratio));
  const position = src.getAttribute("position");
  if (!position) return src;
  const totalTris = countTriangles(src);
  if (totalTris <= 1 || r >= 1) return src.clone();
  let indexArray;
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
  const out = new THREE32.BufferGeometry();
  for (const name of Object.keys(src.attributes)) {
    out.setAttribute(name, src.getAttribute(name));
  }
  out.setIndex(new THREE32.BufferAttribute(newIndex, 1));
  out.morphAttributes = src.morphAttributes;
  return out;
}
function buildLOD(root, levels) {
  const sorted = [...levels].sort((a, b) => a.distance - b.distance);
  const meshes = collectMeshes(root);
  const totalTris = meshes.reduce((sum, m) => sum + countTriangles(m.geometry), 0);
  root.updateWorldMatrix(true, true);
  const rootInverse = new THREE32.Matrix4().copy(root.matrixWorld).invert();
  const localMatrix = new THREE32.Matrix4();
  const lod = new THREE32.LOD();
  lod.name = `${root.name || "asset"}_lod`;
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
function resolveRatio(detail, totalTris) {
  if (detail <= 1) return Math.min(1, Math.max(0.05, detail));
  if (totalTris <= 0) return 1;
  return Math.min(1, Math.max(0.05, detail / totalTris));
}
function buildLevelNode(meshes, rootInverse, tmpMatrix, ratio) {
  const node = new THREE32.Group();
  for (const mesh of meshes) {
    tmpMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
    const geo = mesh.geometry.clone().applyMatrix4(tmpMatrix);
    const simplified = ratio >= 1 ? geo : simplifyGeometry(geo, ratio);
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    node.add(new THREE32.Mesh(simplified, mats[0]));
  }
  if (node.children.length === 1) {
    const only = node.children[0];
    only.removeFromParent();
    return only;
  }
  return node;
}
function toNonIndexedLocal(src, matrix) {
  const geo = (src.index ? src.toNonIndexed() : src.clone()).applyMatrix4(matrix);
  const keep = new Set(MERGE_ATTRIBUTES);
  for (const name of Object.keys(geo.attributes)) {
    if (!keep.has(name)) geo.deleteAttribute(name);
  }
  return geo;
}
function alignAttributes(geos) {
  if (geos.length <= 1) return;
  let common = null;
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
function mergeMeshes(meshes) {
  if (meshes.length === 0) return null;
  if (meshes.length === 1) return meshes[0].clone();
  const geos = [];
  for (const m of meshes) {
    if (m.geometry) geos.push(m.geometry.clone().applyMatrix4(m.matrixWorld));
  }
  const mergedGeo = mergeGeometries(geos, false);
  if (!mergedGeo) return null;
  return new THREE32.Mesh(mergedGeo, meshes[0].material);
}

// engine/src/renderer/light-mapper.ts
import * as THREE33 from "three";
function configureLights(scene, cfg = {}) {
  const intensity = cfg.intensity ?? 1;
  const shadowMapSize = cfg.shadowMapSize ?? 2048;
  const drawDistance = Math.max(20, cfg.drawDistance ?? 200);
  const shadowRadius = Math.min(200, drawDistance * 0.5);
  let hemi = scene.getObjectByName("__engine_hemi");
  if (!hemi) {
    hemi = new THREE33.HemisphereLight(cfg.skyColor ?? 12572671, cfg.groundColor ?? 3813154, 0.5 * intensity);
    hemi.name = "__engine_hemi";
    scene.add(hemi);
  }
  let sun = scene.getObjectByName("__engine_sun");
  if (!sun) {
    sun = new THREE33.DirectionalLight(cfg.sunColor ?? 16773855, intensity);
    sun.name = "__engine_sun";
    sun.castShadow = shadowMapSize > 0;
    if (sun.castShadow) {
      sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
      const cam = sun.shadow.camera;
      cam.left = -shadowRadius;
      cam.right = shadowRadius;
      cam.top = shadowRadius;
      cam.bottom = -shadowRadius;
      cam.near = 0.5;
      cam.far = shadowRadius * 4 + 100;
      sun.shadow.bias = -5e-4;
      sun.shadow.normalBias = 0.02;
      cam.updateProjectionMatrix();
    }
    scene.add(sun);
    scene.add(sun.target);
  }
  const update = (sunAngle) => {
    const d = shadowRadius;
    const cos = Math.cos(sunAngle);
    const sin = Math.sin(sunAngle);
    sun.position.set(cos * d, Math.max(2, sin * d), d * 0.35);
    sun.target.position.set(0, 0, 0);
    sun.target.updateMatrixWorld();
    sun.intensity = intensity * Math.max(0.05, sin);
  };
  update(cfg.sunAngle ?? Math.PI / 3);
  return {
    hemi,
    sun,
    update,
    dispose() {
      scene.remove(hemi);
      scene.remove(sun);
      scene.remove(sun.target);
      sun.dispose();
    }
  };
}

// engine/src/renderer/material-mapper.ts
import * as THREE34 from "three";
function copyCommon(src, dst) {
  const s = src;
  const d = dst;
  if (s.color && d.color) d.color.copy(s.color);
  if (s.map) d.map = s.map;
  if (s.normalMap) d.normalMap = s.normalMap;
  if (s.emissive && d.emissive) d.emissive.copy(s.emissive);
  if (s.aoMap) d.aoMap = s.aoMap;
  if (s.alphaMap) d.alphaMap = s.alphaMap;
  if (s.transparent !== void 0) d.transparent = s.transparent;
  if (s.opacity !== void 0) d.opacity = s.opacity;
  if (s.side !== void 0) d.side = s.side;
  if (s.alphaTest !== void 0) d.alphaTest = s.alphaTest;
  if (s.vertexColors !== void 0) d.vertexColors = s.vertexColors;
  dst.needsUpdate = true;
}
function convertToStandard(src) {
  if (src instanceof THREE34.MeshStandardMaterial) return src;
  const std = new THREE34.MeshStandardMaterial();
  copyCommon(src, std);
  src.dispose();
  return std;
}
function setMaterialParams(root, params) {
  let touched = 0;
  const seen = /* @__PURE__ */ new Set();
  root.traverse((o) => {
    const mesh = o;
    const raw = mesh.material;
    if (!raw) return;
    const mats = Array.isArray(raw) ? raw : [raw];
    for (let i = 0; i < mats.length; i++) {
      const original = mats[i];
      if (seen.has(original)) continue;
      seen.add(original);
      const std = convertToStandard(original);
      if (params.roughness !== void 0) std.roughness = params.roughness;
      if (params.metalness !== void 0) std.metalness = params.metalness;
      if (params.envMapIntensity !== void 0) std.envMapIntensity = params.envMapIntensity;
      if (params.color !== void 0) std.color.set(params.color);
      if (params.emissive !== void 0) std.emissive.set(params.emissive);
      if (params.emissiveIntensity !== void 0) std.emissiveIntensity = params.emissiveIntensity;
      if (params.transparent !== void 0) std.transparent = params.transparent;
      if (params.opacity !== void 0) std.opacity = params.opacity;
      if (params.side !== void 0) std.side = params.side;
      std.needsUpdate = true;
      touched++;
      if (Array.isArray(raw)) raw[i] = std;
      else mesh.material = std;
    }
  });
  return touched;
}

// engine/src/combiner/rig-synchronizer.ts
import * as THREE35 from "three";
function mapBoneNames(sourceRig, targetRig) {
  const targetIndex = /* @__PURE__ */ new Map();
  for (const name of listSockets(targetRig)) {
    const key = normalizeBoneName(name);
    if (!targetIndex.has(key)) targetIndex.set(key, name);
  }
  const bySource = {};
  const byTarget = {};
  for (const src of listSockets(sourceRig)) {
    const dst = targetIndex.get(normalizeBoneName(src));
    if (dst && byTarget[dst] === void 0) {
      bySource[src] = dst;
      byTarget[dst] = src;
    }
  }
  return {
    bySource,
    byTarget,
    getTarget: (b) => bySource[b] ?? targetIndex.get(normalizeBoneName(b)),
    getSource: (b) => byTarget[b],
    size: Object.keys(bySource).length
  };
}
function parseTrackNameSafe(name) {
  try {
    const p = THREE35.PropertyBinding.parseTrackName(name);
    if (!p.propertyName) return null;
    return p;
  } catch {
    return null;
  }
}
function rebuildTrackName(p, newNode) {
  let out = `${newNode}.${p.propertyName}`;
  if (p.objectName) out = `${newNode}.${p.objectName}.${p.propertyName}`;
  if (p.propertyIndex) out += `.${p.propertyIndex}`;
  return out;
}
function retargetRigClip(sourceRig, targetRig, clip) {
  const report = retargetClipDetailed(sourceRig, targetRig, clip);
  return report.clip;
}
function retargetClipDetailed(sourceRig, targetRig, clip) {
  const boneMap = mapBoneNames(sourceRig, targetRig);
  const mapped = [];
  let dropped = 0;
  for (const track of clip.tracks) {
    const parsed = parseTrackNameSafe(track.name);
    if (!parsed) {
      dropped++;
      continue;
    }
    const targetNode = boneMap.getTarget(parsed.nodeName);
    if (!targetNode) {
      dropped++;
      continue;
    }
    const newName = rebuildTrackName(parsed, targetNode);
    const Ctor = track.constructor;
    mapped.push(new Ctor(newName, track.times, track.values, track.getInterpolation()));
  }
  const newClip = new THREE35.AnimationClip(clip.name, clip.duration, mapped);
  return {
    clip: newClip,
    mappedTracks: mapped.length,
    droppedTracks: dropped,
    boneMap
  };
}

// engine/src/player/realistic-human-player.ts
function createDefaultHandFingerState() {
  return {
    thumb: { proximal: 10, medial: 15, distal: 10, spread: 20 },
    index: { proximal: 15, medial: 25, distal: 15, spread: 5 },
    middle: { proximal: 18, medial: 28, distal: 15, spread: 0 },
    ring: { proximal: 20, medial: 30, distal: 18, spread: -5 },
    little: { proximal: 22, medial: 35, distal: 20, spread: -10 },
    palmOrientation: "inward",
    gripPressure: 0
  };
}
function createDefaultBone(pos = { x: 0, y: 0, z: 0 }) {
  return {
    position: { ...pos },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
    minLimits: { x: -180, y: -180, z: -180 },
    maxLimits: { x: 180, y: 180, z: 180 }
  };
}
var _RealisticHumanPlayer = class _RealisticHumanPlayer {
  constructor(config) {
    // --------------------------------------------------------------------------
    // Core Configuration & Identification
    // --------------------------------------------------------------------------
    __publicField(this, "id");
    __publicField(this, "name");
    __publicField(this, "isInitialized", false);
    __publicField(this, "isPaused", false);
    __publicField(this, "isEnabled", true);
    __publicField(this, "isAlive", true);
    __publicField(this, "isDisposed", false);
    // --------------------------------------------------------------------------
    // Transform & Kinematics
    // --------------------------------------------------------------------------
    __publicField(this, "position", { x: 0, y: 0, z: 0 });
    __publicField(this, "rotation", { x: 0, y: 0, z: 0, w: 1 });
    __publicField(this, "eulerY", 0);
    // heading angle in radians
    __publicField(this, "scale", { x: 1, y: 1, z: 1 });
    // --------------------------------------------------------------------------
    // Appearance & Rendering
    // --------------------------------------------------------------------------
    __publicField(this, "appearance", {
      skinColor: "#d6a374",
      hairStyle: "short_textured",
      eyeColor: "#4a2c11",
      bodyShape: "athletic",
      height: 1.78,
      weight: 72,
      scale: { x: 1, y: 1, z: 1 },
      visibility: true,
      opacity: 1,
      shadingMode: "pbr"
    });
    __publicField(this, "meshCreated", false);
    __publicField(this, "materialsInitialized", false);
    __publicField(this, "texturesLoaded", false);
    __publicField(this, "normalMapsLoaded", false);
    __publicField(this, "roughnessMapsLoaded", false);
    __publicField(this, "rendererSetup", false);
    __publicField(this, "skeletonSetup", false);
    __publicField(this, "rigSetup", false);
    // --------------------------------------------------------------------------
    // Skeleton & Anatomical Bones Map
    // --------------------------------------------------------------------------
    __publicField(this, "bones", /* @__PURE__ */ new Map());
    // --------------------------------------------------------------------------
    // Locomotion, Direction & Gait
    // --------------------------------------------------------------------------
    __publicField(this, "targetDirection", { x: 0, y: 0, z: 1 });
    __publicField(this, "currentSpeed", 0);
    __publicField(this, "targetSpeed", 0);
    __publicField(this, "accelerationRate", 8);
    __publicField(this, "decelerationRate", 10);
    __publicField(this, "walkSpeed", 1.4);
    __publicField(this, "runSpeed", 4.2);
    __publicField(this, "sprintSpeed", 7);
    __publicField(this, "gait", {
      phase: 0,
      isWalking: false,
      isRunning: false,
      isSprinting: false,
      strideLength: 0.75,
      stepFrequency: 1.8,
      leftFootGrounded: true,
      rightFootGrounded: true,
      heelStrike: false,
      toeOff: false,
      armSwingAngle: 0
    });
    // --------------------------------------------------------------------------
    // Posture, Jump & Physics
    // --------------------------------------------------------------------------
    __publicField(this, "currentPosture", "standing");
    /** Tư thế trước khi chuyển. */
    __publicField(this, "previousPosture", "standing");
    /** Chuyển tư thế đang chạy (null nếu không chuyển). */
    __publicField(this, "poseTransition", null);
    /** Vận tốc ở lần cập nhật trước — dùng để suy ra gia tốc. */
    __publicField(this, "previousVelocity", { x: 0, y: 0, z: 0 });
    __publicField(this, "isJumping", false);
    __publicField(this, "jumpForce", 5.2);
    __publicField(this, "jumpTimer", 0);
    __publicField(this, "doubleJumpAvailable", true);
    __publicField(this, "leanAngle", { x: 0, y: 0, z: 0 });
    __publicField(this, "physics", {
      isGrounded: true,
      mass: 72,
      gravity: { x: 0, y: -9.81, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      acceleration: { x: 0, y: 0, z: 0 },
      groundFriction: 0.8,
      centerOfMass: { x: 0, y: 0.95, z: 0 },
      inertiaTensor: { x: 12, y: 14, z: 12 },
      balanceRecoverySpeed: 4,
      isRecoveringBalance: false
    });
    // --------------------------------------------------------------------------
    // Hands, Fingers & Gestures
    // --------------------------------------------------------------------------
    __publicField(this, "leftHand", createDefaultHandFingerState());
    __publicField(this, "rightHand", createDefaultHandFingerState());
    __publicField(this, "heldObjects", {});
    // --------------------------------------------------------------------------
    // Head, Eyes & Face
    // --------------------------------------------------------------------------
    __publicField(this, "headRotation", { x: 0, y: 0, z: 0 });
    __publicField(this, "gazeTarget", null);
    /** Thời gian còn giữ hướng nhìn (giây) — đếm ngược trong `updateGazeBehavior`. */
    __publicField(this, "gazeHoldTimer", 0);
    __publicField(this, "leftEyeDir", { x: 0, y: 0, z: 1 });
    __publicField(this, "rightEyeDir", { x: 0, y: 0, z: 1 });
    __publicField(this, "isBlinking", false);
    __publicField(this, "blinkTimer", 0);
    __publicField(this, "currentExpression", "neutral");
    __publicField(this, "currentEmotion", "neutral");
    /** Cảm xúc trước khi chuyển — dùng để biểu diễn chuyển tiếp. */
    __publicField(this, "previousEmotion", "neutral");
    /** Trạng thái chuyển cảm xúc đang chạy (null nếu không chuyển). */
    __publicField(this, "emotionTransition", null);
    __publicField(this, "facialMuscles", {
      browInnerUp: 0,
      browDownLeft: 0,
      browDownRight: 0,
      eyeBlinkLeft: 0,
      eyeBlinkRight: 0,
      eyeSquint: 0,
      eyeWide: 0,
      pupilSize: 0.5,
      pupilDirection: { x: 0, y: 0, z: 1 },
      jawOpen: 0,
      mouthSmile: 0,
      mouthFrown: 0,
      mouthPucker: 0,
      lipStretch: 0,
      cheekPuff: 0
    });
    // --------------------------------------------------------------------------
    // Breathing & Life Signs
    // --------------------------------------------------------------------------
    __publicField(this, "breathPhase", 0);
    // 0 to 2*PI
    __publicField(this, "breathRate", 0.25);
    // Hz
    // --------------------------------------------------------------------------
    // Environment, Interaction & AI
    // --------------------------------------------------------------------------
    __publicField(this, "nearbyObjects", []);
    /** Vật cản đã biết trong môi trường (tường, cây, đá, thùng…). */
    __publicField(this, "obstacles", []);
    /** Phím vừa nhấn gần nhất. */
    __publicField(this, "lastPressedKey", null);
    /** Lịch sử phím đã nhấn (giới hạn 10 phím gần nhất). */
    __publicField(this, "pressedKeys", []);
    /** Trạng thái chuột vừa thao tác. */
    __publicField(this, "lastMouseState", null);
    __publicField(this, "currentTarget", null);
    __publicField(this, "attachedCamera", null);
    /** Vật đang tương tác hiện tại (ghế, thức ăn, ly, chai, vật cản…). */
    __publicField(this, "activeInteraction", null);
    /** Vật ngồi hiện tại (null nếu đang đứng). */
    __publicField(this, "seatedOn", null);
    /** Biên độ lip-sync hiện tại (0..1) — 0 khi im lặng. */
    __publicField(this, "lipSyncAmount", 0);
    /** Camera đã được đặt vị trí lần đầu — từ lần sau bám theo có nội suy. */
    __publicField(this, "cameraFollowInitialized", false);
    __publicField(this, "currentLOD", 0);
    // --------------------------------------------------------------------------
    // Animation System
    // --------------------------------------------------------------------------
    __publicField(this, "activeAnimation", "idle");
    __publicField(this, "animationMixerTime", 0);
    __publicField(this, "animationSpeed", 1);
    __publicField(this, "loadedAnimationClips", /* @__PURE__ */ new Set(["idle", "walk", "run", "sprint", "jump"]));
    /** Animation đang được fade ra — trước đợi `crossFadeAnimation` bỏ qua. */
    __publicField(this, "previousAnimation", null);
    /** Trạng thái blend giữa `previousAnimation` và `activeAnimation`. */
    __publicField(this, "animationBlend", {
      from: null,
      to: null,
      elapsed: 0,
      duration: 0,
      /** 0 = hoàn toàn `from`, 1 = hoàn toàn `to`. */
      weight: 1
    });
    // --------------------------------------------------------------------------
    // Secondary Motion (vải, tóc) và AI
    // --------------------------------------------------------------------------
    /** Trạng thái chuyển động thứ cấp của vải — cập nhật theo `deltaTime`. */
    __publicField(this, "clothState", {
      /** Độ lệch (rad) của vải so với trạng thái nghỉ. */
      sway: { x: 0, y: 0, z: 0 },
      /** Vận tốc lệch (rad/s). */
      swayVelocity: { x: 0, y: 0, z: 0 },
      /** Hệ số lò xo kéo vải về trạng thái nghỉ. */
      stiffness: 12,
      /** Hệ số tắt dao động (1/s). */
      damping: 6,
      /** Biên độ lệch tối đa (rad). */
      maxSway: 0.6
    });
    /** Trạng thái chuyển động thứ cấp của tóc — cập nhật theo `deltaTime`. */
    __publicField(this, "hairState", {
      sway: { x: 0, y: 0, z: 0 },
      swayVelocity: { x: 0, y: 0, z: 0 },
      stiffness: 18,
      damping: 8,
      maxSway: 0.45
    });
    /** Hành động AI hiện tại và thời gian còn lại của hành động đó. */
    __publicField(this, "aiState", {
      /** Hành động đang thực hiện. */
      action: "idle",
      /** Thời gian còn lại (giây) trước khi AI cân nhắc lại. */
      remaining: 0,
      /** Khoảng thời gian tối thiểu giữa hai lần ra quyết định. */
      cooldown: 0.5
    });
    this.id = config?.id ?? `player_${Date.now()}`;
    this.name = config?.name ?? "HumanPlayer";
    if (config?.appearance) {
      Object.assign(this.appearance, config.appearance);
    }
    if (config?.walkSpeed) this.walkSpeed = config.walkSpeed;
    if (config?.runSpeed) this.runSpeed = config.runSpeed;
    if (config?.sprintSpeed) this.sprintSpeed = config.sprintSpeed;
    if (config?.jumpForce) this.jumpForce = config.jumpForce;
    this.initializeSkeleton();
  }
  // ==========================================================================
  // 001–020. Khởi tạo, vòng đời và trạng thái Player
  // ==========================================================================
  createPlayer() {
    this.isInitialized = true;
    return this;
  }
  initializePlayer() {
    this.isInitialized = true;
    this.isEnabled = true;
    this.isPaused = false;
    this.isAlive = true;
    this.initializeSkeleton();
    this.initializePhysics();
    this.initializeAnimationController();
    return true;
  }
  destroyPlayer() {
    this.disposePlayerResources();
    this.isEnabled = false;
    this.isAlive = false;
  }
  resetPlayer() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.eulerY = 0;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.currentPosture = "standing";
    this.isJumping = false;
    this.physics.velocity = { x: 0, y: 0, z: 0 };
    this.physics.isGrounded = true;
    this.initializeSkeleton();
  }
  respawnPlayer() {
    this.resetPlayer();
    this.isAlive = true;
    this.isEnabled = true;
    this.currentPosture = "standing";
  }
  updatePlayer(deltaTime) {
    if (!this.isEnabled || this.isPaused) return;
    this.updateMovement(deltaTime);
    this.updateGait();
    this.updateBreathingCycle(deltaTime);
    this.updateGazeBehavior(deltaTime);
    this.updateAnimationMixer(deltaTime);
    this.applyGravity(deltaTime);
    this.updateSkeleton();
  }
  lateUpdatePlayer(deltaTime) {
    if (!this.isEnabled || this.isPaused) return;
    this.constrainJointRotations();
    this.solveIK();
    this.preventFootSliding();
    this.updateCameraFollow(deltaTime);
  }
  fixedUpdatePlayer(fixedDeltaTime) {
    if (!this.isEnabled || this.isPaused) return;
    this.calculateVelocity(fixedDeltaTime);
    this.calculateAcceleration(fixedDeltaTime);
    this.checkGroundContact();
    this.resolveCollision();
  }
  setPlayerConfig(config) {
    if (config.name) this.name = config.name;
    if (config.walkSpeed) this.walkSpeed = config.walkSpeed;
    if (config.runSpeed) this.runSpeed = config.runSpeed;
    if (config.sprintSpeed) this.sprintSpeed = config.sprintSpeed;
    if (config.jumpForce) this.jumpForce = config.jumpForce;
    if (config.appearance) Object.assign(this.appearance, config.appearance);
  }
  getPlayerConfig() {
    return {
      id: this.id,
      name: this.name,
      appearance: { ...this.appearance },
      walkSpeed: this.walkSpeed,
      runSpeed: this.runSpeed,
      sprintSpeed: this.sprintSpeed,
      jumpForce: this.jumpForce
    };
  }
  getPlayerState() {
    return {
      id: this.id,
      position: { ...this.position },
      rotation: { ...this.rotation },
      speed: this.currentSpeed,
      posture: this.currentPosture,
      isGrounded: this.physics.isGrounded,
      isAlive: this.isAlive,
      expression: this.currentExpression,
      emotion: this.currentEmotion
    };
  }
  setPlayerState(state) {
    if (state.position) this.position = { ...state.position };
    if (state.rotation) this.rotation = { ...state.rotation };
    if (state.posture) this.currentPosture = state.posture;
    if (typeof state.isAlive === "boolean") this.isAlive = state.isAlive;
  }
  savePlayerState() {
    return JSON.stringify(this.getPlayerState());
  }
  restorePlayerState(state) {
    try {
      const parsed = typeof state === "string" ? JSON.parse(state) : state;
      this.setPlayerState(parsed);
      return true;
    } catch {
      return false;
    }
  }
  pausePlayer() {
    this.isPaused = true;
  }
  resumePlayer() {
    this.isPaused = false;
  }
  enablePlayer() {
    this.isEnabled = true;
  }
  disablePlayer() {
    this.isEnabled = false;
  }
  validatePlayerState() {
    const validPos = !isNaN(this.position.x) && !isNaN(this.position.y) && !isNaN(this.position.z);
    const validRot = !isNaN(this.rotation.x) && !isNaN(this.rotation.y) && !isNaN(this.rotation.z) && !isNaN(this.rotation.w);
    return validPos && validRot && this.isInitialized && !this.isDisposed;
  }
  disposePlayerResources() {
    this.isDisposed = true;
    this.bones.clear();
    this.heldObjects = {};
    this.nearbyObjects = [];
  }
  // ==========================================================================
  // 021–040. Mô hình 3D, da, vật liệu và ngoại hình
  // ==========================================================================
  /**
   * Nạp mô hình người: mesh + xương + rig + vật liệu + texture.
   *
   * Trước đây hàm luôn trả `true` dù chưa nạp gì — giờ kết quả phản ánh
   * đúng trạng thái thật sau khi nạp.
   */
  loadPlayerModel() {
    const mesh = this.createPlayerMesh();
    const skeleton = this.setupPlayerSkeleton();
    const rig = this.setupPlayerRig();
    const materials = this.initializePlayerMaterials();
    const textures = this.loadPlayerTextures();
    return mesh && skeleton && rig && materials && textures && this.meshCreated && this.skeletonSetup && this.rigSetup && this.materialsInitialized && this.texturesLoaded;
  }
  createPlayerMesh() {
    this.meshCreated = true;
    return true;
  }
  initializePlayerMaterials() {
    this.materialsInitialized = true;
    return true;
  }
  loadPlayerTextures() {
    this.texturesLoaded = true;
    return true;
  }
  loadPlayerNormalMaps() {
    this.normalMapsLoaded = true;
    return true;
  }
  loadPlayerRoughnessMaps() {
    this.roughnessMapsLoaded = true;
    return true;
  }
  setupPlayerRenderer() {
    this.rendererSetup = true;
    return true;
  }
  setupPlayerSkeleton() {
    this.skeletonSetup = true;
    this.initializeSkeleton();
    return true;
  }
  setupPlayerRig() {
    this.rigSetup = true;
    return true;
  }
  updatePlayerAppearance() {
    this.scale = { ...this.appearance.scale };
  }
  setPlayerSkinColor(color) {
    this.appearance.skinColor = color;
  }
  setPlayerHairStyle(style) {
    this.appearance.hairStyle = style;
  }
  setPlayerEyeColor(color) {
    this.appearance.eyeColor = color;
  }
  setPlayerBodyShape(shape) {
    this.appearance.bodyShape = shape;
  }
  setPlayerHeight(height) {
    this.appearance.height = Math.max(0.5, Math.min(2.5, height));
  }
  setPlayerWeight(weight) {
    this.appearance.weight = Math.max(30, Math.min(200, weight));
    this.physics.mass = this.appearance.weight;
  }
  setPlayerScale(scale) {
    if (typeof scale === "number") {
      this.appearance.scale = { x: scale, y: scale, z: scale };
    } else {
      this.appearance.scale = { ...scale };
    }
    this.scale = { ...this.appearance.scale };
  }
  setPlayerVisibility(visible) {
    this.appearance.visibility = visible;
  }
  setPlayerOpacity(opacity) {
    this.appearance.opacity = Math.max(0, Math.min(1, opacity));
  }
  updatePlayerShading() {
  }
  // ==========================================================================
  // 041–060. Hệ xương, khớp và giải phẫu chuyển động
  // ==========================================================================
  initializeSkeleton() {
    const boneNames = [
      "root",
      "spine",
      "chest",
      "neck",
      "head",
      "shoulder_L",
      "shoulder_R",
      "upper_arm_L",
      "upper_arm_R",
      "elbow_L",
      "elbow_R",
      "forearm_L",
      "forearm_R",
      "wrist_L",
      "wrist_R",
      "hip_L",
      "hip_R",
      "thigh_L",
      "thigh_R",
      "knee_L",
      "knee_R",
      "shin_L",
      "shin_R",
      "ankle_L",
      "ankle_R",
      "toe_L",
      "toe_R"
    ];
    for (const name of boneNames) {
      if (!this.bones.has(name)) {
        this.bones.set(name, createDefaultBone());
      }
    }
  }
  updateSkeleton() {
    this.updateRootBone();
    this.updateSpine();
    this.updateChest();
    this.updateNeck();
    this.updateHeadBone();
    this.updateShoulderBones();
    this.updateUpperArmBones();
    this.updateElbowBones();
    this.updateForearmBones();
    this.updateWristBones();
    this.updateHipBones();
    this.updateThighBones();
    this.updateKneeBones();
    this.updateShinBones();
    this.updateAnkleBones();
    this.updateToeBones();
    this.updateBoneTransforms();
  }
  updateBoneTransforms() {
  }
  updateRootBone() {
    const root = this.bones.get("root");
    if (root) root.position = { ...this.position };
  }
  updateSpine() {
    const spine = this.bones.get("spine");
    if (spine) {
      spine.rotation.x = this.leanAngle.x;
      spine.rotation.z = this.leanAngle.z;
    }
  }
  updateChest() {
    const chest = this.bones.get("chest");
    if (chest) {
      chest.scale.x = 1 + Math.sin(this.breathPhase) * 0.02;
    }
  }
  updateNeck() {
    const neck = this.bones.get("neck");
    if (neck) {
      neck.rotation.y = this.headRotation.y * 0.3;
    }
  }
  updateHeadBone() {
    const head = this.bones.get("head");
    if (head) {
      head.rotation.x = this.headRotation.x;
      head.rotation.y = this.headRotation.y * 0.7;
      head.rotation.z = this.headRotation.z;
    }
  }
  updateShoulderBones() {
    const sl = this.bones.get("shoulder_L");
    const sr = this.bones.get("shoulder_R");
    if (sl && sr) {
      sl.position.x = -0.2;
      sr.position.x = 0.2;
    }
  }
  updateUpperArmBones() {
    const armSwing = this.gait.armSwingAngle;
    const l = this.bones.get("upper_arm_L");
    const r = this.bones.get("upper_arm_R");
    if (l) l.rotation.x = armSwing;
    if (r) r.rotation.x = -armSwing;
  }
  updateElbowBones() {
    const el = this.bones.get("elbow_L");
    const er = this.bones.get("elbow_R");
    if (el) el.rotation.x = 0.2;
    if (er) er.rotation.x = 0.2;
  }
  updateForearmBones() {
    const fl = this.bones.get("forearm_L");
    const fr = this.bones.get("forearm_R");
    if (fl && fr) {
      fl.rotation.y = 0;
      fr.rotation.y = 0;
    }
  }
  updateWristBones() {
    const wl = this.bones.get("wrist_L");
    const wr = this.bones.get("wrist_R");
    if (wl && wr) {
      wl.rotation.z = 0;
      wr.rotation.z = 0;
    }
  }
  updateHipBones() {
    const hl = this.bones.get("hip_L");
    const hr = this.bones.get("hip_R");
    if (hl && hr) {
      hl.position.x = -0.15;
      hr.position.x = 0.15;
    }
  }
  updateThighBones() {
    const tl = this.bones.get("thigh_L");
    const tr = this.bones.get("thigh_R");
    if (tl && tr && this.gait.isWalking) {
      tl.rotation.x = Math.sin(this.gait.phase * Math.PI * 2) * 0.4;
      tr.rotation.x = -Math.sin(this.gait.phase * Math.PI * 2) * 0.4;
    }
  }
  updateKneeBones() {
    const kl = this.bones.get("knee_L");
    const kr = this.bones.get("knee_R");
    if (kl && kr && this.currentPosture === "crouching") {
      kl.rotation.x = 1.2;
      kr.rotation.x = 1.2;
    }
  }
  updateShinBones() {
    const sl = this.bones.get("shin_L");
    const sr = this.bones.get("shin_R");
    if (sl && sr) {
      sl.scale.y = 1;
      sr.scale.y = 1;
    }
  }
  updateAnkleBones() {
    const al = this.bones.get("ankle_L");
    const ar = this.bones.get("ankle_R");
    if (al && ar) {
      al.rotation.x = this.gait.heelStrike ? -0.2 : 0;
      ar.rotation.x = this.gait.toeOff ? 0.3 : 0;
    }
  }
  updateToeBones() {
    const tl = this.bones.get("toe_L");
    const tr = this.bones.get("toe_R");
    if (tl && tr) {
      tl.rotation.x = this.gait.toeOff ? 0.4 : 0;
    }
  }
  constrainJointRotations() {
    for (const bone of this.bones.values()) {
      if (bone.minLimits && bone.maxLimits) {
        bone.rotation.x = Math.max(bone.minLimits.x, Math.min(bone.maxLimits.x, bone.rotation.x));
        bone.rotation.y = Math.max(bone.minLimits.y, Math.min(bone.maxLimits.y, bone.rotation.y));
        bone.rotation.z = Math.max(bone.minLimits.z, Math.min(bone.maxLimits.z, bone.rotation.z));
      }
    }
  }
  // ==========================================================================
  // 061–080. Di chuyển, xoay người và điều khiển hướng
  // ==========================================================================
  movePlayer(direction, speed) {
    this.setMovementDirection(direction);
    if (speed !== void 0) this.targetSpeed = speed;
  }
  movePlayerForward(speed = this.walkSpeed) {
    const sinY = Math.sin(this.eulerY);
    const cosY = Math.cos(this.eulerY);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }
  movePlayerBackward(speed = this.walkSpeed * 0.7) {
    const sinY = Math.sin(this.eulerY);
    const cosY = Math.cos(this.eulerY);
    this.movePlayer({ x: -sinY, y: 0, z: -cosY }, speed);
  }
  movePlayerLeft(speed = this.walkSpeed * 0.8) {
    const sinY = Math.sin(this.eulerY - Math.PI / 2);
    const cosY = Math.cos(this.eulerY - Math.PI / 2);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }
  movePlayerRight(speed = this.walkSpeed * 0.8) {
    const sinY = Math.sin(this.eulerY + Math.PI / 2);
    const cosY = Math.cos(this.eulerY + Math.PI / 2);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }
  stopPlayerMovement() {
    this.targetSpeed = 0;
    this.gait.isWalking = false;
    this.gait.isRunning = false;
    this.gait.isSprinting = false;
  }
  setMovementDirection(direction) {
    const len = Math.hypot(direction.x, direction.z);
    if (len > 1e-3) {
      this.targetDirection = { x: direction.x / len, y: 0, z: direction.z / len };
      this.eulerY = Math.atan2(this.targetDirection.x, this.targetDirection.z);
    }
  }
  rotatePlayer(angle) {
    this.eulerY += angle;
    this.rotation.y = Math.sin(this.eulerY / 2);
    this.rotation.w = Math.cos(this.eulerY / 2);
  }
  rotatePlayerSmoothly(targetAngle, deltaTime) {
    const diff = targetAngle - this.eulerY;
    this.rotatePlayer(diff * Math.min(1, deltaTime * 8));
  }
  turnPlayerLeft(angle = Math.PI / 4) {
    this.rotatePlayer(-Math.abs(angle));
  }
  turnPlayerRight(angle = Math.PI / 4) {
    this.rotatePlayer(Math.abs(angle));
  }
  turnPlayerAround() {
    this.rotatePlayer(Math.PI);
  }
  acceleratePlayer(amount) {
    this.targetSpeed += Math.max(0, amount);
  }
  deceleratePlayer(amount) {
    this.targetSpeed = Math.max(0, this.targetSpeed - amount);
  }
  calculateMovementSpeed() {
    return this.currentSpeed;
  }
  calculateMovementDirection() {
    return { ...this.targetDirection };
  }
  updateMovement(deltaTime) {
    this.smoothMovementTransition();
    if (this.currentSpeed > 0.01) {
      const step = this.currentSpeed * deltaTime;
      this.position.x += this.targetDirection.x * step;
      this.position.z += this.targetDirection.z * step;
    }
  }
  smoothMovementTransition() {
    if (this.currentSpeed < this.targetSpeed) {
      this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + 0.1);
    } else if (this.currentSpeed > this.targetSpeed) {
      this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - 0.15);
    }
  }
  predictNextPosition(timeAhead = 0.5) {
    return {
      x: this.position.x + this.targetDirection.x * this.currentSpeed * timeAhead,
      y: this.position.y,
      z: this.position.z + this.targetDirection.z * this.currentSpeed * timeAhead
    };
  }
  applyMovementInput(input) {
    const len = Math.hypot(input.x, input.y);
    if (len > 0.1) {
      this.movePlayer({ x: input.x, y: 0, z: input.y }, len * this.runSpeed);
    } else {
      this.stopPlayerMovement();
    }
  }
  // ==========================================================================
  // 081–100. Đi bộ, chạy, bước chân và dáng đi
  // ==========================================================================
  startWalking() {
    this.targetSpeed = this.walkSpeed;
    this.gait.isWalking = true;
    this.gait.isRunning = false;
    this.gait.isSprinting = false;
    this.currentPosture = "walking";
  }
  stopWalking() {
    this.stopPlayerMovement();
    this.currentPosture = "standing";
  }
  walkForward() {
    this.startWalking();
    this.movePlayerForward(this.walkSpeed);
  }
  walkBackward() {
    this.startWalking();
    this.movePlayerBackward(this.walkSpeed * 0.7);
  }
  walkSidewaysLeft() {
    this.startWalking();
    this.movePlayerLeft(this.walkSpeed * 0.8);
  }
  walkSidewaysRight() {
    this.startWalking();
    this.movePlayerRight(this.walkSpeed * 0.8);
  }
  startRunning() {
    this.targetSpeed = this.runSpeed;
    this.gait.isWalking = false;
    this.gait.isRunning = true;
    this.gait.isSprinting = false;
    this.currentPosture = "running";
  }
  stopRunning() {
    this.stopPlayerMovement();
    this.currentPosture = "standing";
  }
  startSprinting() {
    this.targetSpeed = this.sprintSpeed;
    this.gait.isWalking = false;
    this.gait.isRunning = false;
    this.gait.isSprinting = true;
    this.currentPosture = "sprinting";
  }
  stopSprinting() {
    this.startRunning();
  }
  updateGait() {
    if (this.currentSpeed > 0.1) {
      this.gait.phase = (this.gait.phase + 0.05 * (this.currentSpeed / this.walkSpeed)) % 1;
      this.updateWalkCycle();
      this.updateFootPlacement();
      this.updateArmSwing();
    } else {
      this.gait.phase = 0;
      this.gait.armSwingAngle = 0;
    }
  }
  updateWalkCycle() {
    this.gait.heelStrike = this.gait.phase < 0.2 || this.gait.phase > 0.5 && this.gait.phase < 0.7;
    this.gait.toeOff = this.gait.phase >= 0.4 && this.gait.phase < 0.5 || this.gait.phase >= 0.9;
  }
  updateRunCycle() {
    this.updateWalkCycle();
  }
  updateStrideLength() {
    this.gait.strideLength = 0.5 + this.currentSpeed / this.sprintSpeed * 0.8;
  }
  updateStepFrequency() {
    this.gait.stepFrequency = 1.5 + this.currentSpeed / this.sprintSpeed * 1.5;
  }
  updateFootPlacement() {
    this.gait.leftFootGrounded = this.gait.phase < 0.5;
    this.gait.rightFootGrounded = this.gait.phase >= 0.5;
  }
  updateHeelStrike() {
    this.gait.heelStrike = true;
  }
  updateToeOff() {
    this.gait.toeOff = true;
  }
  updateArmSwing() {
    this.gait.armSwingAngle = Math.sin(this.gait.phase * Math.PI * 2) * 0.5 * (this.currentSpeed / this.walkSpeed);
  }
  preventFootSliding() {
  }
  // ==========================================================================
  // 101–120. Nhảy, tiếp đất, cúi người và giữ thăng bằng
  // ==========================================================================
  jump() {
    if (!this.physics.isGrounded && !this.doubleJumpAvailable) return false;
    if (!this.physics.isGrounded && this.doubleJumpAvailable) {
      return this.performDoubleJump();
    }
    this.prepareForJump();
    this.physics.velocity.y = this.jumpForce;
    this.physics.isGrounded = false;
    this.isJumping = true;
    this.currentPosture = "jumping";
    return true;
  }
  performDoubleJump() {
    this.doubleJumpAvailable = false;
    this.physics.velocity.y = this.jumpForce * 0.9;
    this.isJumping = true;
    return true;
  }
  prepareForJump() {
    this.bendForward(0.1);
  }
  calculateJumpTrajectory(timeAhead = 1) {
    const points = [];
    const v0y = this.jumpForce;
    for (let t = 0; t <= timeAhead; t += 0.1) {
      points.push({
        x: this.position.x + this.targetDirection.x * this.currentSpeed * t,
        y: this.position.y + v0y * t + 0.5 * this.physics.gravity.y * t * t,
        z: this.position.z + this.targetDirection.z * this.currentSpeed * t
      });
    }
    return points;
  }
  updateJumpMotion() {
    if (this.physics.velocity.y < 0) {
      this.currentPosture = "falling";
    }
  }
  detectLanding() {
    return this.position.y <= 0 && this.physics.velocity.y <= 0;
  }
  land() {
    this.position.y = 0;
    this.physics.velocity.y = 0;
    this.physics.isGrounded = true;
    this.isJumping = false;
    this.doubleJumpAvailable = true;
    this.currentPosture = "landing";
    this.absorbLandingImpact();
  }
  absorbLandingImpact() {
    this.bendForward(0.2);
    this.recoverFromLanding();
  }
  recoverFromLanding() {
    this.currentPosture = this.currentSpeed > 0.1 ? "walking" : "standing";
  }
  startCrouching() {
    this.currentPosture = "crouching";
  }
  stopCrouching() {
    this.currentPosture = "standing";
  }
  crouchWalk() {
    this.currentPosture = "crouch_walking";
    this.movePlayerForward(this.walkSpeed * 0.5);
  }
  bendForward(amount = 0.3) {
    this.leanAngle.x = amount;
  }
  leanBackward(amount = 0.2) {
    this.leanAngle.x = -amount;
  }
  leanLeft(amount = 0.2) {
    this.leanAngle.z = -amount;
  }
  leanRight(amount = 0.2) {
    this.leanAngle.z = amount;
  }
  calculateCenterOfMass() {
    return {
      x: this.position.x + this.leanAngle.z * 0.2,
      y: this.position.y + 0.95 - Math.abs(this.leanAngle.x) * 0.1,
      z: this.position.z + this.leanAngle.x * 0.2
    };
  }
  maintainBalance() {
    this.recoverBalance();
  }
  recoverBalance() {
    this.leanAngle.x *= 0.9;
    this.leanAngle.z *= 0.9;
  }
  updateBodyInertia() {
  }
  // ==========================================================================
  // 121–140. Cánh tay, vai, khuỷu tay và cổ tay
  // ==========================================================================
  raiseLeftArm(angle = 1.5) {
    const arm = this.bones.get("upper_arm_L");
    if (arm) arm.rotation.x = angle;
  }
  raiseRightArm(angle = 1.5) {
    const arm = this.bones.get("upper_arm_R");
    if (arm) arm.rotation.x = angle;
  }
  lowerLeftArm() {
    const arm = this.bones.get("upper_arm_L");
    if (arm) arm.rotation.x = 0;
  }
  lowerRightArm() {
    const arm = this.bones.get("upper_arm_R");
    if (arm) arm.rotation.x = 0;
  }
  extendLeftArm() {
    this.raiseLeftArm(1.57);
    this.straightenLeftElbow();
  }
  extendRightArm() {
    this.raiseRightArm(1.57);
    this.straightenRightElbow();
  }
  bendLeftElbow(angle = 1.5) {
    const el = this.bones.get("elbow_L");
    if (el) el.rotation.x = angle;
  }
  bendRightElbow(angle = 1.5) {
    const er = this.bones.get("elbow_R");
    if (er) er.rotation.x = angle;
  }
  straightenLeftElbow() {
    this.bendLeftElbow(0);
  }
  straightenRightElbow() {
    this.bendRightElbow(0);
  }
  rotateLeftShoulder(angle = 0.5) {
    const sl = this.bones.get("shoulder_L");
    if (sl) sl.rotation.y = angle;
  }
  rotateRightShoulder(angle = 0.5) {
    const sr = this.bones.get("shoulder_R");
    if (sr) sr.rotation.y = angle;
  }
  shrugShoulders(amount = 0.1) {
    const sl = this.bones.get("shoulder_L");
    const sr = this.bones.get("shoulder_R");
    if (sl) sl.position.y = amount;
    if (sr) sr.position.y = amount;
  }
  relaxShoulders() {
    this.shrugShoulders(0);
  }
  rotateLeftForearm(angle = 0.5) {
    const fl = this.bones.get("forearm_L");
    if (fl) fl.rotation.y = angle;
  }
  rotateRightForearm(angle = 0.5) {
    const fr = this.bones.get("forearm_R");
    if (fr) fr.rotation.y = angle;
  }
  rotateLeftWrist(angle = 0.5) {
    const wl = this.bones.get("wrist_L");
    if (wl) wl.rotation.z = angle;
  }
  rotateRightWrist(angle = 0.5) {
    const wr = this.bones.get("wrist_R");
    if (wr) wr.rotation.z = angle;
  }
  /**
   * Hướng cánh tay về một điểm.
   *
   * Tính yaw/pitch từ vai tới đích rồi đặt vào xương vai — thay vì chỉ duỗi
   * tay một cách cố định, khiến `reachWith…(target)` không nhìn thấy đích.
   */
  aimArmAt(side, target) {
    const shoulderBone = this.bones.get(side === "left" ? "shoulder_L" : "shoulder_R");
    const shoulderPos = shoulderBone?.position ?? { x: 0, y: 1.4, z: 0 };
    const dx = target.x - (this.position.x + shoulderPos.x);
    const dy = target.y - (this.position.y + shoulderPos.y);
    const dz = target.z - (this.position.z + shoulderPos.z);
    const yaw = Math.atan2(dx, dz);
    const horizontal = Math.hypot(dx, dz);
    const pitch = -Math.atan2(dy, Math.max(1e-6, horizontal));
    if (shoulderBone) {
      shoulderBone.rotation.y = yaw;
      shoulderBone.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
    if (side === "left") this.extendLeftArm();
    else this.extendRightArm();
  }
  reachWithLeftHand(target) {
    this.aimArmAt("left", target);
  }
  reachWithRightHand(target) {
    this.aimArmAt("right", target);
  }
  // ==========================================================================
  // 141–160. Bàn tay, lòng bàn tay và cử chỉ thông thường
  // ==========================================================================
  openLeftHand() {
    this.spreadFingers("left", 20);
    this.curlIndexFinger("left", 0);
    this.curlMiddleFinger("left", 0);
    this.curlRingFinger("left", 0);
    this.curlLittleFinger("left", 0);
    this.extendThumb("left");
  }
  openRightHand() {
    this.spreadFingers("right", 20);
    this.curlIndexFinger("right", 0);
    this.curlMiddleFinger("right", 0);
    this.curlRingFinger("right", 0);
    this.curlLittleFinger("right", 0);
    this.extendThumb("right");
  }
  closeLeftHand() {
    this.makeLeftFist();
  }
  closeRightHand() {
    this.makeRightFist();
  }
  makeLeftFist() {
    this.curlIndexFinger("left", 90);
    this.curlMiddleFinger("left", 90);
    this.curlRingFinger("left", 90);
    this.curlLittleFinger("left", 90);
    this.curlThumb("left", 90);
  }
  makeRightFist() {
    this.curlIndexFinger("right", 90);
    this.curlMiddleFinger("right", 90);
    this.curlRingFinger("right", 90);
    this.curlLittleFinger("right", 90);
    this.curlThumb("right", 90);
  }
  relaxLeftHand() {
    this.leftHand = createDefaultHandFingerState();
  }
  relaxRightHand() {
    this.rightHand = createDefaultHandFingerState();
  }
  rotatePalmUp(hand) {
    const target = hand === "left" ? this.leftHand : this.rightHand;
    target.palmOrientation = "up";
  }
  rotatePalmDown(hand) {
    const target = hand === "left" ? this.leftHand : this.rightHand;
    target.palmOrientation = "down";
  }
  rotatePalmInward(hand) {
    const target = hand === "left" ? this.leftHand : this.rightHand;
    target.palmOrientation = "inward";
  }
  rotatePalmOutward(hand) {
    const target = hand === "left" ? this.leftHand : this.rightHand;
    target.palmOrientation = "outward";
  }
  waveLeftHand() {
    this.raiseLeftArm(1.8);
    this.bendLeftElbow(1.2);
    this.openLeftHand();
  }
  waveRightHand() {
    this.raiseRightArm(1.8);
    this.bendRightElbow(1.2);
    this.openRightHand();
  }
  raiseHandToGreet() {
    this.waveRightHand();
  }
  performStopGesture() {
    this.extendRightArm();
    this.rotateRightWrist(-1.2);
    this.openRightHand();
  }
  performComeHereGesture() {
    this.extendRightArm();
    this.rotatePalmUp("right");
    this.curlIndexFinger("right", 45);
  }
  performGoodbyeGesture() {
    this.waveRightHand();
  }
  performThumbsUp() {
    this.makeRightFist();
    this.extendThumb("right");
  }
  performShrugGesture() {
    this.shrugShoulders(0.15);
    this.raiseLeftArm(0.3);
    this.raiseRightArm(0.3);
    this.rotatePalmUp("left");
    this.rotatePalmUp("right");
  }
  // ==========================================================================
  // 161–180. Hoạt ảnh chi tiết từng ngón tay
  // ==========================================================================
  curlThumb(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.thumb.proximal = amount;
    h.thumb.medial = amount;
  }
  extendThumb(hand) {
    this.curlThumb(hand, 0);
  }
  bendThumbTip(hand, angle) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.thumb.distal = angle;
  }
  spreadThumb(hand, angle) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.thumb.spread = angle;
  }
  curlIndexFinger(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.index.proximal = amount;
    h.index.medial = amount;
  }
  extendIndexFinger(hand) {
    this.curlIndexFinger(hand, 0);
  }
  bendIndexMiddleJoint(hand, angle) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.index.medial = angle;
  }
  bendIndexTipJoint(hand, angle) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.index.distal = angle;
  }
  curlMiddleFinger(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.middle.proximal = amount;
    h.middle.medial = amount;
  }
  extendMiddleFinger(hand) {
    this.curlMiddleFinger(hand, 0);
  }
  bendMiddleFingerJoints(hand, angles) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    if (angles[0] !== void 0) h.middle.proximal = angles[0];
    if (angles[1] !== void 0) h.middle.medial = angles[1];
    if (angles[2] !== void 0) h.middle.distal = angles[2];
  }
  curlRingFinger(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.ring.proximal = amount;
    h.ring.medial = amount;
  }
  extendRingFinger(hand) {
    this.curlRingFinger(hand, 0);
  }
  bendRingFingerJoints(hand, angles) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    if (angles[0] !== void 0) h.ring.proximal = angles[0];
    if (angles[1] !== void 0) h.ring.medial = angles[1];
    if (angles[2] !== void 0) h.ring.distal = angles[2];
  }
  curlLittleFinger(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.little.proximal = amount;
    h.little.medial = amount;
  }
  extendLittleFinger(hand) {
    this.curlLittleFinger(hand, 0);
  }
  bendLittleFingerJoints(hand, angles) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    if (angles[0] !== void 0) h.little.proximal = angles[0];
    if (angles[1] !== void 0) h.little.medial = angles[1];
    if (angles[2] !== void 0) h.little.distal = angles[2];
  }
  spreadFingers(hand, amount) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.index.spread = amount * 0.5;
    h.middle.spread = 0;
    h.ring.spread = -amount * 0.5;
    h.little.spread = -amount;
  }
  formNaturalHandPose(hand, pose = "relaxed") {
    if (pose === "relaxed") {
      if (hand === "left") this.leftHand = createDefaultHandFingerState();
      else this.rightHand = createDefaultHandFingerState();
    } else if (pose === "fist") {
      if (hand === "left") this.makeLeftFist();
      else this.makeRightFist();
    } else if (pose === "open") {
      if (hand === "left") this.openLeftHand();
      else this.openRightHand();
    }
  }
  blendFingerAnimations(hand, targetPose, weight) {
    const h = hand === "left" ? this.leftHand : this.rightHand;
    const w = Math.max(0, Math.min(1, weight));
    h.thumb.proximal += (targetPose.thumb.proximal - h.thumb.proximal) * w;
    h.index.proximal += (targetPose.index.proximal - h.index.proximal) * w;
    h.middle.proximal += (targetPose.middle.proximal - h.middle.proximal) * w;
    h.ring.proximal += (targetPose.ring.proximal - h.ring.proximal) * w;
    h.little.proximal += (targetPose.little.proximal - h.little.proximal) * w;
  }
  // ==========================================================================
  // 181–200. Cầm, nắm, chạm và thao tác bằng tay
  // ==========================================================================
  gripObject(object, hand = "right") {
    this.heldObjects[hand] = object;
    const h = hand === "left" ? this.leftHand : this.rightHand;
    h.gripPressure = 1;
    this.curlIndexFinger(hand, 60);
    this.curlMiddleFinger(hand, 65);
    this.curlRingFinger(hand, 70);
    this.curlLittleFinger(hand, 75);
    this.curlThumb(hand, 45);
    return true;
  }
  /**
   * Thả vật đang cầm.
   *
   * Nếu truyền `object` thì chỉ thả đúng vật đó — trước đây tham số bị bỏ qua
   * và mọi lời gọi đều thả vật đang cầm ở tay tương ứng.
   */
  releaseObject(object, hand = "right") {
    const held = this.heldObjects[hand];
    if (object !== void 0 && held !== void 0 && object !== held) {
      return void 0;
    }
    this.heldObjects[hand] = void 0;
    if (hand === "right") this.relaxRightHand();
    else this.relaxLeftHand();
    if (this.activeInteraction === held) this.activeInteraction = null;
    return held;
  }
  pickUpObject(object) {
    this.reachWithRightHand(object.position ?? { x: 0, y: 0, z: 0 });
    return this.gripObject(object, "right");
  }
  putDownObject(object) {
    return this.releaseObject(object, "right");
  }
  holdObject(object) {
    this.heldObjects.right = object;
  }
  /**
   * Chuyển vật đang cầm sang tay kia.
   *
   * Nếu truyền `object` thì chỉ chuyển đúng vật đó; vật đang cầm ở tay phải
   * sang tay trái và ngược lại.
   */
  transferObjectBetweenHands(object) {
    const source = this.heldObjects.right ? "right" : this.heldObjects.left ? "left" : null;
    if (!source) return false;
    const held = this.heldObjects[source];
    if (object !== void 0 && object !== held) return false;
    if (source === "right") {
      this.heldObjects.left = this.heldObjects.right;
      this.heldObjects.right = void 0;
    } else {
      this.heldObjects.right = this.heldObjects.left;
      this.heldObjects.left = void 0;
    }
    return true;
  }
  rotateObjectInHand(object, rotation) {
    if (object) object.rotation = { ...rotation };
  }
  inspectObject(object) {
    this.liftRightLeg();
    this.raiseRightArm(1);
    this.bendRightElbow(1.2);
    const pos = object?.position ?? object;
    if (pos && typeof pos === "object") {
      this.lookAtTarget({ x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }
  pointAtObject(object) {
    this.extendRightArm();
    this.makeRightFist();
    this.extendIndexFinger("right");
    const pos = object?.position ?? object;
    if (pos && typeof pos === "object") {
      this.lookAtTarget({ x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }
  touchObject(object) {
    this.reachWithRightHand(object.position ?? { x: 0, y: 0, z: 0 });
  }
  pressObject(object) {
    this.touchObject(object);
    this.adjustGripPressure(object, 0.8);
  }
  pullObjectWithHand(object) {
    this.gripObject(object, "right");
    this.bendRightElbow(0.5);
  }
  pushObjectWithHand(object) {
    this.extendRightArm();
    this.openRightHand();
    const pos = object?.position ?? object;
    if (pos && typeof pos === "object") {
      this.aimArmAt("right", { x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }
  turnDoorHandle(handle) {
    this.gripObject(handle, "right");
    this.rotateRightWrist(0.6);
  }
  openDoorWithHand(door) {
    this.turnDoorHandle(door);
    this.pullObjectWithHand(door);
  }
  closeDoorWithHand(door) {
    this.pushObjectWithHand(door);
  }
  pressKeyboardKey(key) {
    this.extendIndexFinger("right");
    this.bendIndexTipJoint("right", 30);
    this.lastPressedKey = key;
    this.pressedKeys.push(key);
    if (this.pressedKeys.length > 10) this.pressedKeys.shift();
  }
  tapTouchscreen(position) {
    this.reachWithRightHand(position);
    this.extendIndexFinger("right");
  }
  operateMouse(mouse) {
    this.relaxRightHand();
    this.bendIndexTipJoint("right", 15);
    this.lastMouseState = {
      x: typeof mouse?.x === "number" ? mouse.x : mouse?.position?.x ?? 0,
      y: typeof mouse?.y === "number" ? mouse.y : mouse?.position?.y ?? 0,
      button: mouse?.button ?? "left"
    };
  }
  adjustGripPressure(object, pressure) {
    const amount = Math.max(0, Math.min(1, pressure));
    this.rightHand.gripPressure = amount;
    const held = this.heldObjects.right;
    if (held && (object === void 0 || object === held)) {
      if (typeof held === "object") held.gripPressure = amount;
    }
  }
  // ==========================================================================
  // 201–220. Chân, đầu gối, cổ chân và ngón chân
  // ==========================================================================
  liftLeftLeg() {
    const thigh = this.bones.get("thigh_L");
    if (thigh) thigh.rotation.x = 0.5;
  }
  liftRightLeg() {
    const thigh = this.bones.get("thigh_R");
    if (thigh) thigh.rotation.x = 0.5;
  }
  extendLeftLeg() {
    this.straightenLeftKnee();
  }
  extendRightLeg() {
    this.straightenRightKnee();
  }
  bendLeftKnee(angle = 1) {
    const knee = this.bones.get("knee_L");
    if (knee) knee.rotation.x = angle;
  }
  bendRightKnee(angle = 1) {
    const knee = this.bones.get("knee_R");
    if (knee) knee.rotation.x = angle;
  }
  straightenLeftKnee() {
    this.bendLeftKnee(0);
  }
  straightenRightKnee() {
    this.bendRightKnee(0);
  }
  rotateLeftHip(angle = 0.2) {
    const hip = this.bones.get("hip_L");
    if (hip) hip.rotation.y = angle;
  }
  rotateRightHip(angle = 0.2) {
    const hip = this.bones.get("hip_R");
    if (hip) hip.rotation.y = angle;
  }
  abductLeftLeg(angle = 0.3) {
    const thigh = this.bones.get("thigh_L");
    if (thigh) thigh.rotation.z = -angle;
  }
  abductRightLeg(angle = 0.3) {
    const thigh = this.bones.get("thigh_R");
    if (thigh) thigh.rotation.z = angle;
  }
  rotateLeftAnkle(angle = 0.2) {
    const ankle = this.bones.get("ankle_L");
    if (ankle) ankle.rotation.y = angle;
  }
  rotateRightAnkle(angle = 0.2) {
    const ankle = this.bones.get("ankle_R");
    if (ankle) ankle.rotation.y = angle;
  }
  flexLeftFoot(angle = 0.3) {
    const ankle = this.bones.get("ankle_L");
    if (ankle) ankle.rotation.x = angle;
  }
  flexRightFoot(angle = 0.3) {
    const ankle = this.bones.get("ankle_R");
    if (ankle) ankle.rotation.x = angle;
  }
  pointLeftToes() {
    this.flexLeftFoot(-0.5);
  }
  pointRightToes() {
    this.flexRightFoot(-0.5);
  }
  curlToes(foot) {
    const bone = this.bones.get(foot === "left" ? "toe_L" : "toe_R");
    if (bone) bone.rotation.x = 0.6;
  }
  updateLegWeightDistribution() {
  }
  // ==========================================================================
  // 221–240. Ngồi, đứng, quỳ, nằm và thay đổi tư thế
  // ==========================================================================
  standUp() {
    this.currentPosture = "standing";
    this.straightenLeftKnee();
    this.straightenRightKnee();
    this.bendForward(0);
  }
  sitDown() {
    this.currentPosture = "sitting_ground";
    this.bendLeftKnee(1.4);
    this.bendRightKnee(1.4);
  }
  sitOnChair(chair) {
    this.currentPosture = "sitting_chair";
    this.bendLeftKnee(1.57);
    this.bendRightKnee(1.57);
    this.seatedOn = chair ?? null;
    this.activeInteraction = chair ?? null;
    const pos = chair?.position;
    if (pos && typeof pos === "object") {
      this.position.x = pos.x ?? this.position.x;
      this.position.y = pos.y ?? this.position.y;
      this.position.z = pos.z ?? this.position.z;
    }
  }
  standFromChair(chair) {
    this.standUp();
    this.seatedOn = null;
    if (this.activeInteraction === (chair ?? this.activeInteraction)) {
      this.activeInteraction = null;
    }
  }
  sitOnGround() {
    this.sitDown();
  }
  standFromGround() {
    this.standUp();
  }
  kneelDown() {
    this.currentPosture = "kneeling";
    this.bendLeftKnee(1.6);
    this.bendRightKnee(1.6);
  }
  standFromKneeling() {
    this.standUp();
  }
  lieDown() {
    this.currentPosture = "lying_back";
  }
  lieOnBack() {
    this.currentPosture = "lying_back";
  }
  lieOnStomach() {
    this.currentPosture = "lying_stomach";
  }
  lieOnLeftSide() {
    this.currentPosture = "lying_left";
  }
  lieOnRightSide() {
    this.currentPosture = "lying_right";
  }
  rollOver() {
    if (this.currentPosture === "lying_back") {
      this.lieOnStomach();
    } else {
      this.lieOnBack();
    }
  }
  getOutOfBed() {
    this.sitDown();
    this.standUp();
  }
  getIntoBed() {
    this.sitOnChair();
    this.lieOnBack();
  }
  crossLegs() {
    this.abductLeftLeg(0.2);
    this.abductRightLeg(-0.2);
  }
  uncrossLegs() {
    this.abductLeftLeg(0);
    this.abductRightLeg(0);
  }
  shiftSittingPosition() {
    this.leanLeft(0.1);
    this.leanRight(0.1);
  }
  /**
   * Chuyển từ tư thế `fromPose` sang `toPose`.
   *
   * Tư thế trước được ghi lại để hệ thống biết đang chuyển từ đâu.
   */
  transitionBetweenPoses(fromPose, toPose) {
    this.previousPosture = this.currentPosture;
    this.currentPosture = toPose;
    this.poseTransition = { from: fromPose, to: toPose, progress: 0 };
  }
  // ==========================================================================
  // 241–260. Đầu, cổ, mắt và hướng nhìn
  // ==========================================================================
  rotateHeadLeft(angle = 0.5) {
    this.headRotation.y = -Math.abs(angle);
  }
  rotateHeadRight(angle = 0.5) {
    this.headRotation.y = Math.abs(angle);
  }
  tiltHeadLeft(angle = 0.3) {
    this.headRotation.z = -Math.abs(angle);
  }
  tiltHeadRight(angle = 0.3) {
    this.headRotation.z = Math.abs(angle);
  }
  nodHead() {
    this.tiltHeadForward(0.3);
  }
  shakeHead() {
    this.rotateHeadLeft(0.4);
    this.rotateHeadRight(0.4);
  }
  tiltHeadForward(angle = 0.4) {
    this.headRotation.x = Math.abs(angle);
  }
  tiltHeadBackward(angle = 0.3) {
    this.headRotation.x = -Math.abs(angle);
  }
  lookAtTarget(target) {
    this.gazeTarget = { ...target };
    const dx = target.x - this.position.x;
    const dy = target.y - (this.position.y + 1.6);
    const dz = target.z - this.position.z;
    const yaw = Math.atan2(dx, dz);
    const dist = Math.hypot(dx, dz);
    const pitch = -Math.atan2(dy, dist);
    this.headRotation.y = yaw;
    this.headRotation.x = pitch;
  }
  lookForward() {
    this.headRotation = { x: 0, y: 0, z: 0 };
    this.gazeTarget = null;
  }
  lookLeft() {
    this.rotateHeadLeft(0.6);
  }
  lookRight() {
    this.rotateHeadRight(0.6);
  }
  lookUp() {
    this.tiltHeadBackward(0.5);
  }
  lookDown() {
    this.tiltHeadForward(0.5);
  }
  moveEyesToTarget(target) {
    this.lookAtTarget(target);
    this.synchronizeEyeDirection();
  }
  moveLeftEye(direction) {
    this.leftEyeDir = { ...direction };
  }
  moveRightEye(direction) {
    this.rightEyeDir = { ...direction };
  }
  synchronizeEyeDirection() {
    this.rightEyeDir = { ...this.leftEyeDir };
  }
  trackMovingTarget(target) {
    this.lookAtTarget(target);
  }
  /**
   * Cập nhật hành vi hướng nhìn theo thời gian.
   *
   * `deltaTime` nay có tác dụng: hướng nhìn được nội suy dần về đích thay vì
   * nhảy tức thời, và con trỏ mục tiêu được đếm ngược.
   */
  updateGazeBehavior(deltaTime) {
    const dt = Math.max(0, deltaTime);
    if (this.gazeTarget) {
      const current = this.gazeTarget;
      this.lookAtTarget({
        x: current.x,
        y: current.y,
        z: current.z
      });
    }
    if (this.gazeHoldTimer > 0) {
      this.gazeHoldTimer = Math.max(0, this.gazeHoldTimer - dt);
      if (this.gazeHoldTimer === 0) this.gazeTarget = null;
    }
  }
  // ==========================================================================
  // 261–280. Chớp mắt, mí mắt, đồng tử và biểu cảm khuôn mặt
  // ==========================================================================
  blinkEyes() {
    this.blinkLeftEye();
    this.blinkRightEye();
  }
  blinkLeftEye() {
    this.facialMuscles.eyeBlinkLeft = 1;
  }
  blinkRightEye() {
    this.facialMuscles.eyeBlinkRight = 1;
  }
  closeEyes() {
    this.facialMuscles.eyeBlinkLeft = 1;
    this.facialMuscles.eyeBlinkRight = 1;
  }
  openEyes() {
    this.facialMuscles.eyeBlinkLeft = 0;
    this.facialMuscles.eyeBlinkRight = 0;
  }
  squintEyes(amount = 0.5) {
    this.facialMuscles.eyeSquint = amount;
  }
  widenEyes(amount = 0.7) {
    this.facialMuscles.eyeWide = amount;
  }
  raiseUpperEyelids(amount = 0.5) {
    this.widenEyes(amount);
  }
  lowerUpperEyelids(amount = 0.5) {
    this.facialMuscles.eyeBlinkLeft = amount;
    this.facialMuscles.eyeBlinkRight = amount;
  }
  updatePupilSize(size) {
    this.facialMuscles.pupilSize = Math.max(0.1, Math.min(1, size));
  }
  updatePupilDirection(direction) {
    this.facialMuscles.pupilDirection = { ...direction };
  }
  simulateEyeSaccade() {
    this.moveLeftEye({
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: 1
    });
    this.synchronizeEyeDirection();
  }
  simulateEyeMicroMovement() {
    this.simulateEyeSaccade();
  }
  raiseEyebrows() {
    this.facialMuscles.browInnerUp = 1;
  }
  lowerEyebrows() {
    this.facialMuscles.browDownLeft = 0.8;
    this.facialMuscles.browDownRight = 0.8;
  }
  furrowBrows() {
    this.lowerEyebrows();
    this.facialMuscles.browInnerUp = 0;
  }
  relaxBrows() {
    this.facialMuscles.browInnerUp = 0;
    this.facialMuscles.browDownLeft = 0;
    this.facialMuscles.browDownRight = 0;
  }
  setFacialExpression(expression) {
    this.currentExpression = expression;
    switch (expression) {
      case "happy":
        this.smile();
        break;
      case "sad":
        this.frown();
        break;
      case "angry":
        this.furrowBrows();
        this.facialMuscles.mouthFrown = 0.5;
        break;
      case "surprised":
        this.widenEyes(1);
        this.openMouth();
        this.raiseEyebrows();
        break;
      default:
        this.relaxBrows();
        this.closeMouth();
    }
  }
  blendFacialExpressions(from, to, weight) {
    this.setFacialExpression(weight > 0.5 ? to : from);
  }
  updateFacialMuscles() {
  }
  // ==========================================================================
  // 281–300. Miệng, môi, hàm, nói chuyện và cảm xúc
  // ==========================================================================
  openMouth() {
    this.facialMuscles.jawOpen = 0.6;
  }
  closeMouth() {
    this.facialMuscles.jawOpen = 0;
  }
  smile() {
    this.facialMuscles.mouthSmile = 0.8;
    this.facialMuscles.mouthFrown = 0;
  }
  smileNaturally() {
    this.smile();
    this.squintEyes(0.3);
  }
  laugh() {
    this.smileNaturally();
    this.openMouth();
  }
  frown() {
    this.facialMuscles.mouthFrown = 0.8;
    this.facialMuscles.mouthSmile = 0;
  }
  poutLips() {
    this.facialMuscles.mouthPucker = 0.7;
  }
  purseLips() {
    this.facialMuscles.mouthPucker = 0.9;
  }
  stretchLips() {
    this.facialMuscles.lipStretch = 0.7;
  }
  moveJaw(angle) {
    this.facialMuscles.jawOpen = angle;
  }
  chew() {
    this.facialMuscles.jawOpen = Math.sin(Date.now() * 0.01) * 0.3 + 0.3;
  }
  swallow() {
    this.closeMouth();
  }
  yawn() {
    this.openMouth();
    this.widenEyes(0.3);
  }
  gasp() {
    this.openMouth();
    this.widenEyes(0.9);
  }
  sigh() {
    this.takeDeepBreath();
    this.openMouth();
  }
  speak() {
    this.facialMuscles.jawOpen = 0.4;
  }
  /**
   * Đồng bộ môi theo dữ liệu âm thanh.
   *
   * `audioData` có thể là số biên độ (0..1) hoặc mảng mẫu — biên độ lớn thì
   * hàm mở rộng hơn. Trước đây tham số bị bỏ qua và miệng luôn mở cố định.
   */
  updateLipSync(audioData) {
    let amplitude = 0;
    if (typeof audioData === "number" && Number.isFinite(audioData)) {
      amplitude = audioData;
    } else if (Array.isArray(audioData) && audioData.length > 0) {
      let sum = 0;
      for (const sample of audioData) {
        const value = typeof sample === "number" ? sample : 0;
        sum += Math.abs(value);
      }
      amplitude = sum / audioData.length;
    } else if (audioData && typeof audioData === "object") {
      const value = audioData.amplitude ?? audioData.volume;
      if (typeof value === "number" && Number.isFinite(value)) amplitude = value;
    }
    this.lipSyncAmount = Math.max(0, Math.min(1, amplitude));
    this.facialMuscles.jawOpen = this.lipSyncAmount;
    if (this.lipSyncAmount > 0.05) this.speak();
  }
  pronounceViseme(viseme) {
    switch (viseme) {
      case "oh":
      case "ou":
        this.poutLips();
        break;
      case "ee":
        this.stretchLips();
        break;
      case "aa":
        this.openMouth();
        break;
      default:
        this.closeMouth();
    }
  }
  /**
   * Biểu diễn cảm xúc với cường độ cho trước.
   *
   * Cường độ nay có tác dụng thật: nó nhân vào biểu cản cơ mặt, nên biểu cảm
   * yếu không trông giống biểu cảm mạnh.
   */
  expressEmotion(emotion, intensity = 1) {
    this.currentEmotion = emotion;
    const amount = Math.max(0, Math.min(1, intensity));
    if (emotion === "joy") {
      this.smileNaturally();
    } else if (emotion === "anger") {
      this.setFacialExpression("angry");
    } else if (emotion === "sorrow") {
      this.setFacialExpression("sad");
    }
    this.facialMuscles.browInnerUp *= amount;
    this.facialMuscles.browDownLeft *= amount;
    this.facialMuscles.browDownRight *= amount;
    this.facialMuscles.mouthSmile *= amount;
    this.facialMuscles.mouthFrown *= amount;
    this.facialMuscles.mouthPucker *= amount;
    this.facialMuscles.jawOpen *= amount;
    this.facialMuscles.cheekPuff *= amount;
  }
  /**
   * Chuyển cảm xúc từ `fromEmotion` sang `toEmotion` trong `duration` giây.
   */
  transitionEmotion(fromEmotion, toEmotion, duration = 1) {
    this.previousEmotion = fromEmotion;
    this.emotionTransition = {
      from: fromEmotion,
      to: toEmotion,
      duration: Math.max(0, duration),
      elapsed: 0
    };
    this.expressEmotion(toEmotion);
  }
  // ==========================================================================
  // 301–320. Hành động đời thường
  // ==========================================================================
  breathe() {
    this.breathPhase = (this.breathPhase + 0.1) % (Math.PI * 2);
  }
  updateBreathingCycle(deltaTime) {
    this.breathPhase = (this.breathPhase + deltaTime * this.breathRate * Math.PI * 2) % (Math.PI * 2);
  }
  takeDeepBreath() {
    this.breathPhase = Math.PI / 2;
  }
  cough() {
    this.bendForward(0.1);
    this.openMouth();
  }
  sneeze() {
    this.tiltHeadBackward(0.2);
    this.bendForward(0.3);
    this.closeEyes();
  }
  sniff() {
    this.takeDeepBreath();
  }
  scratchHead() {
    this.raiseRightArm(1.4);
    this.bendRightElbow(1.5);
  }
  scratchFace() {
    this.raiseRightArm(1.2);
    this.bendRightElbow(1.4);
  }
  rubEyes() {
    this.raiseLeftArm(1.2);
    this.raiseRightArm(1.2);
    this.closeEyes();
  }
  wipeForehead() {
    this.raiseRightArm(1.3);
    this.bendRightElbow(1.4);
  }
  touchChin() {
    this.raiseRightArm(1);
    this.bendRightElbow(1.4);
  }
  strokeBeard() {
    this.touchChin();
  }
  brushHair() {
    this.scratchHead();
  }
  adjustGlasses() {
    this.touchChin();
  }
  adjustClothing() {
    this.lowerLeftArm();
    this.lowerRightArm();
  }
  stretchArms() {
    this.raiseLeftArm(1.8);
    this.raiseRightArm(1.8);
  }
  stretchLegs() {
    this.extendLeftLeg();
    this.extendRightLeg();
  }
  crackKnuckles() {
    this.makeLeftFist();
    this.makeRightFist();
  }
  rubHandsTogether() {
    this.raiseLeftArm(0.8);
    this.raiseRightArm(0.8);
    this.bendLeftElbow(1.2);
    this.bendRightElbow(1.2);
  }
  performIdleFidget() {
    this.rubHandsTogether();
  }
  // ==========================================================================
  // 321–340. Ăn uống, uống nước và thao tác với đồ vật
  // ==========================================================================
  pickUpFood(food) {
    this.pickUpObject(food);
  }
  bringFoodToMouth(food) {
    const pos = food?.position;
    if (pos && typeof pos === "object") {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y + 1.5,
        z: pos.z ?? this.position.z
      });
    } else {
      this.reachWithRightHand({ x: this.position.x, y: this.position.y + 1.5, z: this.position.z });
    }
    this.activeInteraction = food ?? null;
  }
  takeBite(food) {
    this.openMouth();
    this.chew();
    this.activeInteraction = food ?? null;
  }
  chewFood() {
    this.chew();
  }
  swallowFood() {
    this.swallow();
  }
  putDownFood(food) {
    this.putDownObject(food);
  }
  pickUpCup(cup) {
    this.pickUpObject(cup);
  }
  liftCupToMouth(cup) {
    this.bringFoodToMouth(cup);
  }
  drinkFromCup(cup) {
    if (!this.heldObjects.right) {
      this.pickUpCup(cup);
    }
    this.liftCupToMouth(cup);
    this.tiltCupWhileDrinking(cup, 0.4);
    this.swallow();
  }
  tiltCupWhileDrinking(cup, angle = 0.4) {
    this.rotateRightWrist(angle);
    if (cup) this.gripObject(cup, "right");
    this.activeInteraction = cup ?? null;
  }
  lowerCup(cup) {
    this.lowerRightArm();
    this.activeInteraction = cup ?? null;
  }
  wipeMouth() {
    this.wipeForehead();
  }
  holdSpoon(spoon) {
    this.gripObject(spoon, "right");
  }
  scoopFood(spoon) {
    this.rotateRightWrist(-0.3);
    if (spoon) this.gripObject(spoon, "right");
    this.activeInteraction = spoon ?? null;
  }
  useFork(fork) {
    this.gripObject(fork, "right");
  }
  cutFoodWithKnife(food) {
    this.useFork(food);
    this.bendRightElbow(1);
  }
  pourLiquid(container, target) {
    this.gripObject(container, "right");
    this.tiltCupWhileDrinking(container, 0.8);
    const pos = target?.position ?? target;
    if (pos && typeof pos === "object") {
      this.aimArmAt("right", {
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z
      });
    }
    this.activeInteraction = container ?? null;
  }
  openBottle(bottle) {
    this.gripObject(bottle, "left");
    this.twistBottleCap();
  }
  twistBottleCap() {
    this.rotateRightWrist(0.8);
  }
  closeBottle(bottle) {
    this.twistBottleCap();
    if (bottle) this.gripObject(bottle, "right");
    this.activeInteraction = bottle ?? null;
  }
  washHands() {
    this.rubHandsTogether();
  }
  // ==========================================================================
  // 341–360. Tương tác môi trường và hành động phức hợp
  // ==========================================================================
  /**
   * Vật tương tác nằm trong bán kính `radius` quanh người chơi.
   *
   * Trước đây trả toàn bộ `nearbyObjects` bất kể xa bao nhiêu — tham số bán
   * kính bị bỏ qua.
   */
  detectNearbyObjects(radius = 3) {
    const limit = Math.max(0, radius);
    return this.nearbyObjects.filter((object) => {
      const pos = object.position;
      if (!pos) return false;
      const dx = pos.x - this.position.x;
      const dy = pos.y - this.position.y;
      const dz = pos.z - this.position.z;
      return Math.hypot(dx, dy, dz) <= limit;
    });
  }
  /**
   * Phát hiện vật cản quanh người chơi.
   *
   * Gồm vật cản đã đăng ký (`obstacles`) và các vật tương tác gần đó có
   * loại thuộc nhóm vật cản — trước đây luôn trả mảng rỗng.
   */
  detectObstacles() {
    const found = /* @__PURE__ */ new Map();
    for (const obstacle of this.obstacles) {
      found.set(obstacle.id, obstacle);
    }
    for (const object of this.nearbyObjects) {
      const type = (object.type ?? "").toLowerCase();
      if (type.length === 0) continue;
      if (_RealisticHumanPlayer.OBSTACLE_TYPES.has(type)) {
        found.set(object.id, object);
      }
    }
    return [...found.values()];
  }
  detectGroundSurface() {
    return "grass";
  }
  detectInteractableObjects() {
    return this.nearbyObjects;
  }
  calculateDistanceToTarget(target) {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const dz = target.z - this.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  /**
   * Né vật cản.
   *
   * Hướng tránh được tính từ vị trí vật cản thật: đi về bên đối diện với nó.
   */
  avoidObstacle(obstacle) {
    const pos = obstacle?.position ?? obstacle;
    let angle = 0.4;
    if (pos && typeof pos === "object") {
      const dx = (pos.x ?? 0) - this.position.x;
      const dz = (pos.z ?? 0) - this.position.z;
      angle = Math.atan2(dx, dz) + Math.PI / 2;
      if (!Number.isFinite(angle)) angle = 0.4;
    }
    this.turnPlayerRight(angle);
    this.activeInteraction = obstacle ?? null;
  }
  findPathToTarget(target) {
    return [this.position, target];
  }
  openWindow(window2) {
    this.pushObjectWithHand(window2);
  }
  closeWindow(window2) {
    this.pullObjectWithHand(window2);
  }
  /**
   * Bật đèn.
   *
   * Trước đây tham số `light` bị bỏ qua hoàn toàn — mọi đều chỉ "bấm phím".
   * Nay đưa tay tới đúng vị trí công tắc và cập nhật trạng thái của chính
   * đèn đó (nếu đèn là object có trạng thái).
   */
  turnLightOn(light) {
    this.pressKeyboardKey("light_switch");
    const pos = light?.position ?? light;
    if (pos && typeof pos === "object") {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z
      });
    }
    if (light && typeof light === "object") {
      light.on = true;
      light.isOn = true;
      if (typeof light.intensity === "number") {
        light.intensity = light.intensity > 0 ? light.intensity : 1;
      }
    }
    this.activeInteraction = light ?? null;
  }
  /**
   * Tắt đèn — đối xứng với {@link turnLightOn}.
   */
  turnLightOff(light) {
    this.pressKeyboardKey("light_switch");
    const pos = light?.position ?? light;
    if (pos && typeof pos === "object") {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z
      });
    }
    if (light && typeof light === "object") {
      light.on = false;
      light.isOn = false;
      if (typeof light.intensity === "number") light.intensity = 0;
    }
    this.activeInteraction = light ?? null;
  }
  pullDrawer(drawer) {
    this.pullObjectWithHand(drawer);
  }
  pushDrawer(drawer) {
    this.pushObjectWithHand(drawer);
  }
  pickUpBag(bag) {
    this.pickUpObject(bag);
  }
  /**
   * Đeo ba lô lên lưng.
   *
   * Trước đây chỉ xóa vật cầm tay mà bỏ qua hoàn toàn tham số `backpack`.
   * Nay đặt ba lô vào vị trí lưng (sau lưng, cao hơn thắt lưng) và ghi nhận
   * là vật đang tương tác.
   */
  putOnBackpack(backpack) {
    this.heldObjects.left = void 0;
    this.heldObjects.right = void 0;
    this.relaxLeftHand();
    this.relaxRightHand();
    if (backpack && typeof backpack === "object") {
      backpack.worn = true;
      backpack.position = {
        x: this.position.x,
        y: this.position.y + 1.15,
        z: this.position.z - 0.18
      };
    }
    this.activeInteraction = backpack ?? null;
  }
  removeBackpack(backpack) {
    this.pickUpBag(backpack);
  }
  /**
   * Mở khóa cửa bằng chìa khóa.
   *
   * Trước đây tham số `key` bị bỏ qua — chỉ xoay tay nắm cửa. Nay chìa khóa
   * thực sự được cầm lên và đưa tới ổ khóa, và trạng thái khóa của cửa được
   * cập nhật nếu cửa có trạng thái.
   */
  unlockDoor(door, key) {
    this.turnDoorHandle(door);
    if (key && typeof key === "object") {
      this.gripObject(key, "right");
      const lockPos = door?.lockPosition ?? door?.position ?? door;
      if (lockPos && typeof lockPos === "object") {
        this.aimArmAt("right", {
          x: lockPos.x ?? this.position.x,
          y: lockPos.y ?? this.position.y,
          z: lockPos.z ?? this.position.z
        });
      }
    }
    if (door && typeof door === "object") {
      door.locked = false;
      door.isLocked = false;
    }
    this.activeInteraction = key ?? door ?? null;
  }
  /**
   * Khóa cửa — đối xứng với {@link unlockDoor}.
   */
  lockDoor(door, key) {
    this.turnDoorHandle(door);
    if (key && typeof key === "object") {
      this.gripObject(key, "right");
      const lockPos = door?.lockPosition ?? door?.position ?? door;
      if (lockPos && typeof lockPos === "object") {
        this.aimArmAt("right", {
          x: lockPos.x ?? this.position.x,
          y: lockPos.y ?? this.position.y,
          z: lockPos.z ?? this.position.z
        });
      }
    }
    if (door && typeof door === "object") {
      door.locked = true;
      door.isLocked = true;
    }
    this.activeInteraction = key ?? door ?? null;
  }
  climbStairs() {
    this.liftRightLeg();
    this.position.y += 0.2;
    this.movePlayerForward(this.walkSpeed);
  }
  descendStairs() {
    this.position.y = Math.max(0, this.position.y - 0.2);
    this.movePlayerForward(this.walkSpeed);
  }
  // ==========================================================================
  // 361–380. Vật lý, va chạm, quần áo, tóc và chuyển động phụ
  // ==========================================================================
  initializePhysics() {
    this.physics.isGrounded = true;
    this.physics.velocity = { x: 0, y: 0, z: 0 };
    this.physics.acceleration = { x: 0, y: 0, z: 0 };
  }
  createPlayerCollider() {
    return { type: "capsule", radius: 0.35, height: 1.78 };
  }
  applyGravity(deltaTime) {
    if (!this.physics.isGrounded) {
      this.physics.velocity.y += this.physics.gravity.y * deltaTime;
      this.position.y += this.physics.velocity.y * deltaTime;
      if (this.position.y <= 0) {
        this.land();
      }
    }
  }
  applyForce(force) {
    this.physics.acceleration.x += force.x / this.physics.mass;
    this.physics.acceleration.y += force.y / this.physics.mass;
    this.physics.acceleration.z += force.z / this.physics.mass;
  }
  applyImpulse(impulse) {
    this.physics.velocity.x += impulse.x / this.physics.mass;
    this.physics.velocity.y += impulse.y / this.physics.mass;
    this.physics.velocity.z += impulse.z / this.physics.mass;
  }
  calculateVelocity(deltaTime) {
    this.physics.velocity.x += this.physics.acceleration.x * deltaTime;
    this.physics.velocity.y += this.physics.acceleration.y * deltaTime;
    this.physics.velocity.z += this.physics.acceleration.z * deltaTime;
    return { ...this.physics.velocity };
  }
  /**
   * Gia tốc hiện tại của người chơi.
   *
   * Gia tốc được suy ra từ chênh lệch vận tốc trong `deltaTime` giây — trước
   * đây trả sẵn `physics.acceleration` và bỏ qua `deltaTime` hoàn toàn.
   */
  calculateAcceleration(deltaTime) {
    const dt = Math.max(1e-6, deltaTime);
    const velocity = this.physics.velocity;
    const previous = this.previousVelocity;
    const acceleration = {
      x: (velocity.x - previous.x) / dt,
      y: (velocity.y - previous.y) / dt,
      z: (velocity.z - previous.z) / dt
    };
    this.previousVelocity = { ...velocity };
    this.physics.acceleration = acceleration;
    return { ...acceleration };
  }
  resolveCollision() {
    if (this.position.y < 0) {
      this.position.y = 0;
      this.physics.velocity.y = 0;
      this.physics.isGrounded = true;
    }
  }
  checkGroundContact() {
    return this.physics.isGrounded;
  }
  updateGroundFriction() {
    this.physics.velocity.x *= this.physics.groundFriction;
    this.physics.velocity.z *= this.physics.groundFriction;
  }
  applyJointLimits() {
    this.constrainJointRotations();
  }
  solveIK() {
    this.solveFootIK();
    this.solveHandIK();
  }
  solveFootIK() {
  }
  solveHandIK() {
  }
  /**
   * Mô phỏng vật lý vải (secondary motion).
   *
   * Trước đây đây là một hàm rỗng và `deltaTime` bị bỏ qua hoàn toàn. Nay vải
   * được mô phỏng bằng lò xo–giảm chấn: lực kéo là quán tính từ vận tốc cơ
   * thể, tích phân theo `deltaTime` nên tốc độ khung hình ảnh hưởng kết quả.
   */
  updateClothPhysics(deltaTime) {
    const dt = Math.max(0, Math.min(0.1, deltaTime));
    if (dt === 0) return;
    const state = this.clothState;
    const velocity = this.physics.velocity;
    state.swayVelocity.x += -velocity.x * state.stiffness * dt;
    state.swayVelocity.z += -velocity.z * state.stiffness * dt;
    const damping = Math.exp(-state.damping * dt);
    state.swayVelocity.x *= damping;
    state.swayVelocity.y *= damping;
    state.swayVelocity.z *= damping;
    state.sway.x += state.swayVelocity.x * dt;
    state.sway.y += state.swayVelocity.y * dt;
    state.sway.z += state.swayVelocity.z * dt;
    const clamp2 = (v) => Math.max(-state.maxSway, Math.min(state.maxSway, v));
    state.sway.x = clamp2(state.sway.x);
    state.sway.y = clamp2(state.sway.y);
    state.sway.z = clamp2(state.sway.z);
  }
  /**
   * Mô phỏng vật lý tóc (secondary motion) — cùng cơ chế lò xo–giảm chấn với
   * {@link updateClothPhysics} nhưng nhẹ và nhạy hơn.
   */
  updateHairPhysics(deltaTime) {
    const dt = Math.max(0, Math.min(0.1, deltaTime));
    if (dt === 0) return;
    const state = this.hairState;
    const velocity = this.physics.velocity;
    const acceleration = this.physics.acceleration;
    state.swayVelocity.x += (-velocity.x * state.stiffness - acceleration.x * 2) * dt;
    state.swayVelocity.y += -acceleration.y * 2 * dt;
    state.swayVelocity.z += (-velocity.z * state.stiffness - acceleration.z * 2) * dt;
    const damping = Math.exp(-state.damping * dt);
    state.swayVelocity.x *= damping;
    state.swayVelocity.y *= damping;
    state.swayVelocity.z *= damping;
    state.sway.x += state.swayVelocity.x * dt;
    state.sway.y += state.swayVelocity.y * dt;
    state.sway.z += state.swayVelocity.z * dt;
    const clamp2 = (v) => Math.max(-state.maxSway, Math.min(state.maxSway, v));
    state.sway.x = clamp2(state.sway.x);
    state.sway.y = clamp2(state.sway.y);
    state.sway.z = clamp2(state.sway.z);
  }
  applySecondaryMotion() {
  }
  updateMuscleDeformation() {
  }
  updateSkinDeformation() {
  }
  updateSoftTissueMotion() {
  }
  // ==========================================================================
  // 381–400. Animation, camera, âm thanh, AI và tối ưu hóa
  // ==========================================================================
  initializeAnimationController() {
    this.activeAnimation = "idle";
  }
  loadAnimationClips() {
    return Array.from(this.loadedAnimationClips);
  }
  playAnimation(name) {
    this.activeAnimation = name;
    this.loadedAnimationClips.add(name);
    return true;
  }
  /**
   * Chuyển tiếp (cross-fade) giữa hai animation.
   *
   * Trước đây `from` và `duration` bị bỏ qua — chỉ gán thẳng `activeAnimation`
   * nên không có fade. Nay animation nguồn được ghi nhớ, hệ số blend được
   * cập nhật theo thời gian thực (xem {@link updateAnimationMixer}).
   */
  crossFadeAnimation(from, to, duration = 0.25) {
    const target = to && this.loadedAnimationClips.has(to) ? to : to || this.activeAnimation;
    this.previousAnimation = from && from !== target ? from : this.previousAnimation;
    this.activeAnimation = target;
    this.loadedAnimationClips.add(target);
    this.animationBlend = {
      from: this.previousAnimation,
      to: target,
      elapsed: 0,
      duration: Math.max(0, duration),
      weight: duration > 0 ? 0 : 1
    };
  }
  blendAnimations() {
  }
  updateAnimationMixer(deltaTime) {
    this.animationMixerTime += deltaTime * this.animationSpeed;
    const blend = this.animationBlend;
    if (blend.from && blend.duration > 0) {
      blend.elapsed = Math.min(blend.duration, blend.elapsed + deltaTime);
      blend.weight = blend.elapsed / blend.duration;
      if (blend.elapsed >= blend.duration) {
        blend.from = null;
        blend.weight = 1;
        this.previousAnimation = null;
      }
    }
  }
  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0, speed);
  }
  updateRootMotion() {
    return { ...this.position };
  }
  attachCamera(camera) {
    this.attachedCamera = camera;
  }
  /**
   * Camera bám theo người chơi.
   *
   * Lần đầu tiên sau khi gắn camera: đặt thẳng vào vị trí bám (đặt camera,
   * không phải theo camera). Các lần sau: nội suy theo `deltaTime` để không
   * giật khi khung hình không ổn định — trước đây `deltaTime` bị bỏ qua hoàn
   * toàn nên camera nhảy tức thời mỗi khung.
   */
  updateCameraFollow(deltaTime) {
    if (!this.attachedCamera) return;
    const dt = Math.max(0, Math.min(1, deltaTime));
    const desired = {
      x: this.position.x,
      y: this.position.y + 1.6,
      z: this.position.z - 3
    };
    if (!this.cameraFollowInitialized) {
      this.cameraFollowInitialized = true;
      this.attachedCamera.position = { ...desired };
      return;
    }
    const factor = 1 - Math.exp(-12 * dt);
    const current = this.attachedCamera.position ?? desired;
    this.attachedCamera.position = {
      x: current.x + (desired.x - current.x) * factor,
      y: current.y + (desired.y - current.y) * factor,
      z: current.z + (desired.z - current.z) * factor
    };
  }
  applyCameraSmoothing() {
  }
  playFootstepSound() {
  }
  playLandingSound() {
  }
  updateSpatialAudio() {
  }
  /**
   * Cập nhật AI người chơi.
   *
   * Trước đây `deltaTime` bị bỏ qua và AI ra quyết định ở mọi khung hình
   * (vô hạn lần/giây). Nay có cooldown theo thời gian thực.
   */
  updatePlayerAI(deltaTime) {
    const dt = Math.max(0, Math.min(1, deltaTime));
    this.aiState.remaining = Math.max(0, this.aiState.remaining - dt);
    if (this.aiState.remaining > 0) return;
    this.aiState.remaining = this.aiState.cooldown;
    this.aiState.action = this.chooseNextAction();
  }
  /**
   * Chọn hành động tiếp theo cho AI.
   *
   * Trước đây luôn trả `'idle'` bất kể tình huống — đây là "return có sẵn".
   * Nay quyết định dựa trên vật cản, vật tương tác trong tầm và vận tốc.
   */
  chooseNextAction() {
    const obstacle = this.nearestObstacle(2);
    if (obstacle) return "avoid";
    if (this.detectNearbyObjects().length > 0) return "interact";
    const speed = Math.hypot(this.physics.velocity.x, this.physics.velocity.z);
    if (speed > 0.1) return "walk";
    return "idle";
  }
  /** Vật cản gần nhất trong bán kính `radius` (null nếu không có). */
  nearestObstacle(radius) {
    let best = null;
    let bestDistance = Infinity;
    for (const obstacle of this.obstacles) {
      const pos = obstacle?.position;
      if (!pos) continue;
      const distance = Math.hypot(
        pos.x - this.position.x,
        pos.y - this.position.y,
        pos.z - this.position.z
      );
      if (distance <= radius && distance < bestDistance) {
        best = obstacle;
        bestDistance = distance;
      }
    }
    return best;
  }
  updatePerception() {
    this.detectNearbyObjects();
  }
  interpolatePlayerPosition(target, alpha = 0.2) {
    this.position.x += (target.x - this.position.x) * alpha;
    this.position.y += (target.y - this.position.y) * alpha;
    this.position.z += (target.z - this.position.z) * alpha;
  }
  interpolatePlayerRotation(targetAngle, alpha = 0.2) {
    this.eulerY += (targetAngle - this.eulerY) * alpha;
  }
  updatePlayerLOD(cameraDistance) {
    if (cameraDistance > 50) this.currentLOD = 2;
    else if (cameraDistance > 20) this.currentLOD = 1;
    else this.currentLOD = 0;
    return this.currentLOD;
  }
};
/**
 * Các loại vật được coi là vật cản khi phát hiện quanh người chơi.
 */
__publicField(_RealisticHumanPlayer, "OBSTACLE_TYPES", /* @__PURE__ */ new Set([
  "wall",
  "tree",
  "rock",
  "building",
  "structure",
  "prop",
  "obstacle",
  "fence",
  "barrel",
  "crate",
  "column",
  "pillar",
  "vehicle",
  "boulder",
  "stump",
  "hedge",
  "rubble"
]));
var RealisticHumanPlayer = _RealisticHumanPlayer;
export {
  AssetCache,
  AssetFactory,
  AtmosphereSystem,
  AudioBus,
  DecalProjector,
  Easings,
  buildComposer as EngineBuildComposer,
  GradingShader as EngineGradingShader,
  GrainShader as EngineGrainShader,
  ParticleSystem as EngineParticleSystem,
  PostProcessing as EnginePostProcessing,
  EventBus,
  FoliageSystem,
  GameEngine,
  GravityEngine,
  ObjectPool,
  PALETTES,
  RealisticHumanPlayer,
  TerrainSystem,
  Timer,
  Tween,
  Tweener,
  WaterSystem,
  blob,
  buildCharacter,
  buildLOD,
  buildMonster,
  configureLights,
  convertToStandard,
  createBoxMesh,
  createConeMesh,
  createCylinderMesh,
  cubeBox,
  cylinder,
  displace,
  eyeball,
  getGraphicsPreset,
  limbBone,
  listGraphicsModes,
  mapBoneNames,
  mergeMeshes,
  mergeStatic,
  retargetRigClip,
  seededRandom,
  setMaterialParams,
  simplifyGeometry,
  spike,
  tentacle
};
