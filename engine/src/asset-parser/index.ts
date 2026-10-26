// engine/src/asset-parser/index.ts — Facade phân giải & bóc tách toàn diện tài sản 3D
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { ParsedAsset, AssetFormat, AssetKind, BoneNodeInfo, MotionData, VertexBufferData } from '../types/asset.types';
import { extractStats, extractGeometry, collectMeshes, collectMaterials, countTriangles, extractRawBufferData } from './geometry-extractor';
import { parseTextures, parseMaterialTextures, detectKhrMaterialFeatures } from './texture-parser';
import { bakeClip, bakeClips, retargetClip, retargetClips } from './animation-baker';
import { loadMetadata, categoryFromPath, rigFromBoneNames, nameFromPath, formatFromPath } from './metadata-loader';
import { computeBounds } from '../transformer/bounds-calculator';
import { parseObj, parseMtl } from './obj-parser';
import type { ObjParseOptions } from './obj-parser';
import {
  formatOf as registryFormatOf,
  kindOf,
  capabilitiesOf,
  supportedFormats,
  supportedExtensions,
  isSupportedFormat,
  specOf,
} from './format-registry';
import { parseStl } from './stl-parser';
import { parsePly } from './ply-parser';
import { parseThreeDs } from './3ds-parser';
import { parseUsd } from './usd-parser';
import { parseAbc } from './abc-parser';
import { parseBvh } from './bvh-parser';
import { parseVmd } from './vmd-parser';
import { parseImage, detectImageFormat } from './image-parser';
import type { ImageFormat } from './image-parser';
import { parseEngineData } from './engine-data-parser';
import { parseGltf, isGlb } from './gltf-parser';
import { parseCollada } from './collada-parser';

export {
  extractGeometry,
  extractStats,
  collectMeshes,
  collectMaterials,
  countTriangles,
  extractRawBufferData,
} from './geometry-extractor';
export { parseTextures, parseMaterialTextures, detectKhrMaterialFeatures } from './texture-parser';
export {
  bakeClip,
  bakeClips,
  bakeClipDetailed,
  bakeClipsDetailed,
  analyzeClip,
  optimizeClipKeyframes,
  retargetClip,
  retargetClips,
  retargetClipWithReport,
  retargetClipsWithReport,
  estimateClipBytes,
  trackKind,
  trackComponentSize,
} from './animation-baker';
export type {
  BakeOptions,
  BakeReport,
  ClipAnalysis,
  OptimizeOptions,
  OptimizeReport,
  RetargetOptions,
  ClipRetargetReport,
  TrackBakeStats,
  TrackKind,
} from './animation-baker';
export { loadMetadata, categoryFromPath, rigFromBoneNames, nameFromPath, formatFromPath } from './metadata-loader';
export type { MetadataSidecar } from './metadata-loader';
export { parseObj, parseMtl } from './obj-parser';
export type { ObjParseOptions } from './obj-parser';

// Registry định dạng
export {
  FORMAT_REGISTRY,
  capabilitiesOf,
  extensionOf,
  isSupportedFormat,
  kindOf,
  specOf,
  supportedExtensions,
  supportedFormats,
} from './format-registry';
export type { AssetFormatCapabilities, AssetFormatSpec } from './format-registry';

// Parser theo định dạng
export { parseStl, detectStlEncoding } from './stl-parser';
export type { StlParseOptions, StlParseResult } from './stl-parser';
export { parsePly, parsePlyHeader } from './ply-parser';
export type { PlyParseOptions, PlyParseResult } from './ply-parser';
export { parseThreeDs } from './3ds-parser';
export type { ThreeDsParseOptions, ThreeDsParseResult } from './3ds-parser';
export { parseUsd, buildUsdScene } from './usd-parser';
export type { UsdParseOptions, UsdParseResult } from './usd-parser';
export { parseUsdc } from './usdc-parser';
export type { UsdSpec, UsdSpecType } from './usdc-parser';
export { parseUsda } from './usda-parser';
export type { UsdaParseResult } from './usda-parser';
export { parseAbc } from './abc-parser';
export type { AbcParseOptions, AbcParseResult } from './abc-parser';
export { parseBvh } from './bvh-parser';
export type { BvhParseOptions, BvhParseResult } from './bvh-parser';
export { parseVmd } from './vmd-parser';
export type { VmdParseOptions, VmdParseResult } from './vmd-parser';
export { parseImage, detectImageFormat, readImageInfo } from './image-parser';
export type { ImageInfo, ImageFormat, ImageParseResult } from './image-parser';
export { parseEngineData, FORGE_DESIGN_KIND, BOT_SPEC_KIND } from './engine-data-parser';
export type { EngineDataParseResult } from './engine-data-parser';
export { parseGltf, isGlb } from './gltf-parser';
export type { GltfParseOptions, GltfParseResult } from './gltf-parser';
export { parseCollada } from './collada-parser';
export type { ColladaParseOptions, ColladaParseResult } from './collada-parser';
export { parseFbx, detectFbxEncoding, fbxMetricsOf } from './fbx-parser';
export type { FbxParseOptions, FbxParseResult } from './fbx-parser';
export { parseXml, findChild, findChildren, findDescendant } from './xml-lite';
export type { XmlNode } from './xml-lite';
export { encodeBase64, decodeBase64 } from './base64';
export {
  analyzeAsset,
  analyzeScene,
  suggestLods,
  estimateTextureBytes,
  estimateVertexBytes,
  countTrianglesInGeometry,
  countVerticesInGeometry,
  formatBytes,
  DEFAULT_BUDGET,
  DEFAULT_BUDGETS,
} from './asset-analyzer';
export type {
  AssetAnalysisReport,
  AssetAnalysisOptions,
  AssetBudget,
  AssetIssue,
  AssetIssueSeverity,
  LodSuggestion,
} from './asset-analyzer';

export interface AssetParserOptions {
  dracoDecoderPath?: string;
  enableDraco?: boolean;
  fetchSidecar?: (path: string) => Promise<unknown>;
}

/**
 * Định dạng của một đường dẫn (dùng registry chung).
 *
 * Với `.json`, định dạng riêng của Engine không suy ra được từ phần mở rộng —
 * cần nội dung. `contentHint` là nội dung (hoặc phần đầu nội dung) để phân biệt
 * forge-design / bot-spec / asset-manifest / sidecar.
 */
export function formatOf(path: string, contentHint?: string): AssetFormat {
  return registryFormatOf(path, contentHint);
}

/** Thu thập thông tin xương từ scene. */
function collectBones(scene: THREE.Object3D): BoneNodeInfo[] {
  const bones: BoneNodeInfo[] = [];
  let index = 0;

  const walk = (node: THREE.Object3D, parentName: string | undefined): void => {
    if (node instanceof THREE.Bone) {
      const world = node.getWorldPosition(new THREE.Vector3());
      const local = node.position;
      bones.push({
        name: node.name || `bone_${index}`,
        parentName,
        index: index++,
        localTransform: {
          position: { x: local.x, y: local.y, z: local.z },
          rotation: { x: node.rotation.x, y: node.rotation.y, z: node.rotation.z },
          scale: { x: node.scale.x, y: node.scale.y, z: node.scale.z },
        },
        worldPosition: { x: world.x, y: world.y, z: world.z },
      });
      parentName = node.name || parentName;
    }
    for (const child of node.children) walk(child, parentName);
  };

  walk(scene, undefined);
  return bones;
}

const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'tga', 'exr', 'hdr'];

/**
 * Trích URI texture mà một tệp MTL trỏ tới (`map_Kd`, `map_Bump`, `map_d`).
 *
 * Đây là các tệp ngoài mà tài sản phụ thuộc — pipeline phải nạp theo.
 */
function textureUrisOfMtl(mtlText?: string): string[] {
  if (!mtlText) return [];
  const uris: string[] = [];
  for (const line of mtlText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    const keyword = parts[0].toLowerCase();
    const isMap =
      keyword === 'map_kd' ||
      keyword === 'map_diffuse' ||
      keyword === 'map_bump' ||
      keyword === 'bump' ||
      keyword === 'map_d';
    if (!isMap || parts.length < 2) continue;
    const uri = parts.slice(1).join(' ').trim();
    if (uri.length > 0) uris.push(uri);
  }
  return uris;
}

/** Trích các lệnh `mtllib` mà tệp OBJ trỏ tới. */
function mtlLibrariesOfObj(objText: string): string[] {
  const libraries: string[] = [];
  for (const line of objText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts[0].toLowerCase() === 'mtllib' && parts.length > 1) {
      libraries.push(parts.slice(1).join(' ').trim());
    }
  }
  return libraries;
}

export class AssetParser {
  private dracoDecoderPath: string | null = null;
  private dracoEnabled = false;
  private dracoLoader: DRACOLoader | null = null;
  private fetchSidecar?: (path: string) => Promise<unknown>;

  constructor(opts: AssetParserOptions = {}) {
    this.dracoDecoderPath = opts.dracoDecoderPath ?? null;
    this.dracoEnabled = opts.enableDraco ?? false;
    this.fetchSidecar = opts.fetchSidecar;
  }

  configureDraco(decoderPath: string, enabled = true): void {
    this.dracoDecoderPath = decoderPath;
    this.dracoEnabled = enabled;
    this.dracoLoader = null;
  }

  private getDracoLoader(): DRACOLoader {
    if (!this.dracoLoader) {
      this.dracoLoader = new DRACOLoader();
      if (this.dracoDecoderPath) {
        this.dracoLoader.setDecoderPath(this.dracoDecoderPath);
      }
    }
    return this.dracoLoader;
  }

  async parse(path: string, extraOpts?: { mtlPath?: string; mtlText?: string; tags?: string[]; category?: any }): Promise<ParsedAsset> {
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
  async load(path: string, extraOpts?: { mtlPath?: string; mtlText?: string }): Promise<ParsedAsset> {
    const format = formatOf(path);

    switch (format) {
      case 'gltf':
      case 'glb': {
        const loader = new GLTFLoader();
        if (this.dracoEnabled && this.dracoDecoderPath) {
          loader.setDRACOLoader(this.getDracoLoader());
        }
        const gltf = await loader.loadAsync(path);
        return this.finalize(path, format, gltf.scene, gltf.animations ?? []);
      }
      case 'fbx': {
        const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
        const loader = new FBXLoader();
        const group = await loader.loadAsync(path);
        return this.finalize(path, format, group, group.animations ?? []);
      }
      case 'dae': {
        const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js');
        const loader = new ColladaLoader();
        const collada = await loader.loadAsync(path);
        // three.js gắn animation của Collada vào chính scene, không phải vào kết quả.
        const animations = (collada.scene as THREE.Scene & { animations?: THREE.AnimationClip[] }).animations ?? [];
        return this.finalize(path, format, collada.scene, animations);
      }
      case 'obj': {
        let mtlText = extraOpts?.mtlText;
        const dependencies: string[] = [];
        if (!mtlText && extraOpts?.mtlPath) {
          try {
            const mtlRes = await fetch(extraOpts.mtlPath);
            if (mtlRes.ok) mtlText = await mtlRes.text();
          } catch {
            // bỏ qua nếu không fetch được MTL
          }
        }
        // MTL là tệp ngoài mà OBJ phụ thuộc — phải nạp theo.
        if (extraOpts?.mtlPath) dependencies.push(extraOpts.mtlPath);

        const res = await fetch(path);
        if (!res.ok) throw new Error(`AssetParser: không tải được ${path} (HTTP ${res.status})`);
        const text = await res.text();
        const scene = parseObj(text, { mtlText, name: nameFromPath(path) });
        // MTL mà OBJ trỏ tới và texture mà MTL trỏ tới đều là phụ thuộc.
        dependencies.push(...mtlLibrariesOfObj(text));
        dependencies.push(...textureUrisOfMtl(mtlText));
        return this.finalize(path, format, scene, [], { dependencies });
      }
      case 'mtl': {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`AssetParser: không tải được ${path} (HTTP ${res.status})`);
        const text = await res.text();
        const materials = parseMtl(text);
        // Vật liệu không có hình học — dựng Group rỗng mang thông tin vật liệu.
        const group = new THREE.Group();
        group.name = nameFromPath(path);
        group.userData.materials = Object.fromEntries(materials);
        return this.finalize(path, format, group, [], {
          dependencies: textureUrisOfMtl(text),
        });
      }
      default: {
        // Định dạng Engine tự viết parser — tải byte rồi giải mã.
        const bytes = await this.fetchBytes(path);
        return this.parseBytes(path, bytes, extraOpts);
      }
    }
  }

  /** Tải tệp về dạng byte (dùng cho các định dạng nhị phân). */
  private async fetchBytes(path: string): Promise<Uint8Array> {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`AssetParser: không tải được ${path} (HTTP ${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  }

  /**
   * Bóc tách từ byte đã có sẵn — không cần mạng.
   *
   * Đây là API chính cho các định dạng nhị phân và cho kiểm thử.
   */
  async parseBytes(
    path: string,
    bytes: Uint8Array,
    extraOpts?: { mtlText?: string; loadExternal?: (uri: string) => Promise<Uint8Array | undefined> },
  ): Promise<ParsedAsset> {
    let format = formatOf(path);

    // Ảnh: nhận diện bằng chữ ký, ưu tiên hơn phần mở rộng.
    const detectedImage = detectImageFormat(bytes, format as ImageFormat);
    if (detectedImage && IMAGE_FORMATS.includes(detectedImage)) {
      format = detectedImage === 'jpg' ? 'jpg' : detectedImage;
    }

    const warnings: string[] = [];
    const dependencies: string[] = [];
    let scene: THREE.Object3D = new THREE.Group();
    let animations: THREE.AnimationClip[] = [];
    let texture: THREE.Texture | undefined;
    let motion: MotionData | undefined;
    let data: unknown;
    let materials: Record<string, THREE.Material> | undefined;

    switch (format) {
      case 'gltf':
      case 'glb': {
        // Parser tự viết — chạy được cả headless (Node) lẫn trình duyệt,
        // không phụ thuộc `fetch`/DOM của loader three.js.
        const result = await parseGltf(bytes, {
          name: nameFromPath(path),
          loadExternal: extraOpts?.loadExternal,
        });
        scene = result.scene;
        animations.push(...result.animations);
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        materials = { ...result.materials };
        break;
      }
      case 'fbx': {
        const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
        const loader = new FBXLoader();
        // `TextureLoader` của three.js cần DOM để tạo thẻ <img> — ở môi
        // trường headless (Node) điều đó làm hỏng cả tệp FBX. Thay bằng bản
        // không cần DOM: ghi URI texture vào dependencies và trả texture rỗng.
        if (typeof document === 'undefined') {
          (loader as unknown as { textureLoader: THREE.TextureLoader }).textureLoader = {
            path: '',
            setPath(this: { path: string }, value: string) {
              this.path = value;
              return this;
            },
            setCrossOrigin() {
              return this;
            },
            load(url: string) {
              dependencies.push(url);
              return new THREE.Texture();
            },
          } as unknown as THREE.TextureLoader;
        }
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        const group = loader.parse(buffer, '');
        scene = group;
        animations.push(...(group.animations ?? []));
        break;
      }
      case 'dae': {
        // Parser tự viết — không cần DOMParser nên chạy được ở Node.
        const result = parseCollada(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        materials = { ...result.materials };
        break;
      }
      case 'obj': {
        // OBJ là định dạng văn bản — đọc trực tiếp từ byte đã có.
        const text = new TextDecoder().decode(bytes);
        const mtlText = extraOpts?.mtlText;
        scene = parseObj(text, { mtlText, name: nameFromPath(path) });
        dependencies.push(...mtlLibrariesOfObj(text));
        dependencies.push(...textureUrisOfMtl(mtlText));
        break;
      }
      case 'mtl': {
        const text = new TextDecoder().decode(bytes);
        const parsedMaterials = parseMtl(text);
        // Vật liệu không có hình học — dựng Group rỗng mang thông tin vật liệu.
        scene = new THREE.Group();
        scene.name = nameFromPath(path);
        scene.userData.materials = Object.fromEntries(parsedMaterials);
        dependencies.push(...textureUrisOfMtl(text));
        break;
      }
      case 'stl': {
        const result = parseStl(bytes, { name: nameFromPath(path) });
        const mesh = new THREE.Mesh(result.geometry, new THREE.MeshStandardMaterial());
        mesh.name = nameFromPath(path);
        scene.add(mesh);
        break;
      }
      case 'ply': {
        const result = parsePly(bytes, { name: nameFromPath(path) });
        const mesh = new THREE.Mesh(result.geometry, new THREE.MeshStandardMaterial({ vertexColors: result.hasVertexColor }));
        mesh.name = nameFromPath(path);
        scene.add(mesh);
        break;
      }
      case '3ds': {
        const result = parseThreeDs(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.textureFiles);
        break;
      }
      case 'usd':
      case 'usda':
      case 'usdc': {
        const result = parseUsd(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        dependencies.push(...result.dependencies);
        break;
      }
      case 'abc': {
        const result = parseAbc(bytes, { name: nameFromPath(path) });
        scene = result.scene;
        warnings.push(...result.warnings);
        break;
      }
      case 'bvh': {
        const result = parseBvh(bytes, { name: nameFromPath(path) });
        scene = result.root;
        if (result.clip) animations.push(result.clip);
        motion = {
          kind: 'bvh',
          name: nameFromPath(path),
          frameCount: result.frames.length,
          duration: result.duration,
          fps: result.fps,
          bones: result.bones,
          frames: result.frames,
        };
        warnings.push(...result.warnings);
        break;
      }
      case 'vmd': {
        const result = parseVmd(bytes, { name: nameFromPath(path) });
        scene = new THREE.Group();
        scene.name = result.name;
        if (result.clip) animations.push(result.clip);
        motion = {
          kind: 'vmd',
          name: result.name,
          frameCount: result.frameCount,
          duration: result.duration,
          fps: result.fps,
          bones: result.bones,
          frames: result.frames,
        };
        warnings.push(...result.warnings);
        break;
      }
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'tga':
      case 'exr':
      case 'hdr': {
        const result = parseImage(bytes, format as ImageFormat, { name: nameFromPath(path) });
        texture = result.texture;
        warnings.push(...result.warnings);
        scene = new THREE.Group();
        scene.name = nameFromPath(path);
        scene.userData.imageInfo = result.info;
        break;
      }
      case 'forge-design':
      case 'bot-spec':
      case 'asset-manifest':
      case 'asset-sidecar': {
        const text = new TextDecoder().decode(bytes);
        // Định dạng `.json` cần nội dung mới phân biệt được — xác định lại.
        format = formatOf(path, text);
        const parsed = parseEngineData(text, format);
        data = parsed.data;
        warnings.push(...parsed.warnings);
        scene = new THREE.Group();
        scene.name = nameFromPath(path);
        break;
      }
      default:
        throw new Error(`AssetParser: định dạng không hỗ trợ cho ${path} (${format})`);
    }

    const asset = this.finalize(path, format, scene, animations, {
      warnings,
      dependencies,
      texture,
      motion,
      data,
      materials,
      sizeBytes: bytes.byteLength,
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
  private finalize(
    path: string,
    format: AssetFormat,
    scene: THREE.Object3D,
    animations: THREE.AnimationClip[],
    extra?: {
      warnings?: string[];
      dependencies?: string[];
      texture?: THREE.Texture;
      motion?: MotionData;
      data?: unknown;
      materials?: Record<string, THREE.Material>;
      sizeBytes?: number;
    },
  ): ParsedAsset {
    const geometryStats = extractStats(scene);
    const textures = parseTextures(scene);
    const metadata = loadMetadata(path, scene);
    const bounds = computeBounds(scene);
    const bones = collectBones(scene);
    const meshes = collectMeshes(scene);

    // Vật liệu: ưu tiên bản do parser cung cấp, thiếu thì suy ra từ scene.
    const materials: Record<string, THREE.Material> = { ...(extra?.materials ?? {}) };
    if (Object.keys(materials).length === 0) {
      for (const material of collectMaterials(scene)) {
        materials[material.name || `Material_${Object.keys(materials).length}`] = material;
      }
    }

    // Dữ liệu đỉnh thô theo từng mesh.
    const rawBuffers: Record<string, VertexBufferData> = {};
    for (const mesh of meshes) {
      rawBuffers[mesh.name || `Mesh_${Object.keys(rawBuffers).length}`] = extractRawBufferData(mesh);
    }

    // Mô hình chính: mesh đầu tiên, hoặc chính scene khi không có mesh.
    const model = meshes[0] ?? scene;

    // Đếm các loại node đặc biệt có trong cảnh (đèn, camera, LOD).
    let lightCount = 0;
    let cameraCount = 0;
    let lodCount = 0;
    scene.traverse((node) => {
      const flagged = node as unknown as { isLight?: boolean; isCamera?: boolean; isLOD?: boolean };
      if (flagged.isLight) lightCount += 1;
      if (flagged.isCamera) cameraCount += 1;
      if (flagged.isLOD) lodCount += 1;
    });

    const parsed: ParsedAsset = {
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
      hasAnimation: animations.length > 0,
    };

    if (bones.length > 0) parsed.bones = bones;
    if (extra?.texture) parsed.texture = extra.texture;
    if (extra?.motion) parsed.motion = extra.motion;
    if (extra?.data !== undefined) parsed.data = extra.data;

    return parsed;
  }
}

/** Danh sách định dạng Engine hỗ trợ (dùng cho UI hiển thị). */
export const SUPPORTED_ASSET_FORMATS: readonly AssetFormat[] = supportedFormats();

/** Danh sách phần mở rộng Engine hỗ trợ. */
export const SUPPORTED_ASSET_EXTENSIONS: readonly string[] = supportedExtensions();

/** Kiểm tra một định dạng có được Engine hỗ trợ không. */
export function isFormatSupported(format: AssetFormat): boolean {
  return isSupportedFormat(format);
}

/** Năng lực của một định dạng (hình học/animation/vật liệu/texture/xương/motion). */
export function formatCapabilities(format: AssetFormat) {
  return capabilitiesOf(format);
}

/** Nhóm định dạng. */
export function formatKind(format: AssetFormat): AssetKind {
  return kindOf(format);
}

/** Spec của một định dạng. */
export function formatSpec(format: AssetFormat) {
  return specOf(format);
}

// ---------------------------------------------------------------------------
// Unified Multi-Format, PBR Unpacker, Motion & Extension Registry
// ---------------------------------------------------------------------------
export * from './extension-registry.js';
export * from './texture-pbr-unpacker.js';
export * from './motion-parser.js';
export * from './multi-format-parser.js';

