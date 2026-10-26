/**
 * @file multi-format-parser.ts
 * @module @aetheria/engine/asset-parser/multi-format-parser
 * @description Unified multi-format 3D asset parser for every format supported
 * by the engine: models, exchange scenes, materials, textures, motion, engine
 * data documents and pluggable custom extensions.
 *
 * The parser always returns a structured `ParsedSceneData` result (or a typed
 * engine error), never an empty placeholder scene. Headless formats use the
 * engine's own parsers; FBX uses three.js's full binary/ASCII loader through a
 * DOM-free adapter.
 */

import * as THREE from 'three';
import { parseGltf } from './gltf-parser.js';
import { parseObj, parseMtl } from './obj-parser.js';
import { parseStl } from './stl-parser.js';
import { parsePly } from './ply-parser.js';
import { parseUsd, buildUsdScene } from './usd-parser.js';
import { parseUsda } from './usda-parser.js';
import { parseUsdc } from './usdc-parser.js';
import { parseThreeDs } from './3ds-parser.js';
import { parseCollada } from './collada-parser.js';
import { parseAbc } from './abc-parser.js';
import { parseBvh } from './bvh-parser.js';
import { parseVmd } from './vmd-parser.js';
import { parseImage, detectImageFormat, type ImageFormat } from './image-parser.js';
import { parseEngineData } from './engine-data-parser.js';
import { parseFbx } from './fbx-parser.js';
import { getExtensionRegistry } from './extension-registry.js';
import { extractRawBufferData } from './geometry-extractor.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';
import type { UniversalAssetFormat } from '../types/format.types.js';
import type { GeometryBuffers, TransformNode } from '../types/geometry.types.js';
import type { MotionData } from '../types/asset.types.js';

export interface MultiFormatParseOptions {
  name?: string;
  mtlText?: string;
  scale?: number;
  computeNormals?: boolean;
  computeTangents?: boolean;
  normalizeScale?: boolean;
  targetHeight?: number;
  /** Callback used to resolve external texture references in headless mode. */
  loadTexture?: (uri: string) => THREE.Texture | null;
}

export interface ParsedSceneData {
  root: THREE.Object3D;
  format: UniversalAssetFormat;
  geometryBuffers: GeometryBuffers[];
  nodes: TransformNode[];
  triangleCount: number;
  vertexCount: number;
  materialsCount: number;
  animationsCount: number;
  /** External files referenced by the asset (textures, buffers, MTL...). */
  dependencies: string[];
  /** Non-fatal problems encountered while parsing. */
  warnings: string[];
  /** Names of materials discovered in the scene. */
  materialNames: string[];
  /** Number of texture maps (image formats return 1). */
  textureCount: number;
  /** Number of skeleton bones discovered. */
  boneCount: number;
  /** Actual texture for image assets. */
  texture?: THREE.Texture;
  /** Motion payload for BVH/VMD assets. */
  motion?: MotionData;
  /** Parsed engine-data payload for forge/bot/manifest/sidecar documents. */
  data?: unknown;
}

const IMAGE_FORMATS: readonly ImageFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'tga', 'exr', 'hdr'];
const ENGINE_DATA_FORMATS: readonly UniversalAssetFormat[] = [
  'forge-design', 'bot-spec', 'asset-manifest', 'asset-sidecar',
];

const EXTENSION_TO_FORMAT: ReadonlyArray<readonly [string, UniversalAssetFormat]> = [
  ['.glb', 'glb'],
  ['.gltf', 'gltf'],
  ['.fbx', 'fbx'],
  ['.obj', 'obj'],
  ['.dae', 'dae'],
  ['.3ds', '3ds'],
  ['.stl', 'stl'],
  ['.ply', 'ply'],
  ['.usda', 'usda'],
  ['.usdc', 'usdc'],
  ['.usd', 'usd'],
  ['.abc', 'abc'],
  ['.bvh', 'bvh'],
  ['.vmd', 'vmd'],
  ['.mtl', 'mtl'],
  ['.png', 'png'],
  ['.jpg', 'jpg'],
  ['.jpeg', 'jpg'],
  ['.webp', 'webp'],
  ['.tga', 'tga'],
  ['.exr', 'exr'],
  ['.hdr', 'hdr'],
  ['.forge', 'forge-design'],
  ['.forge.json', 'forge-design'],
  ['.bot', 'bot-spec'],
  ['.bot.json', 'bot-spec'],
  ['.manifest', 'asset-manifest'],
  ['.manifest.json', 'asset-manifest'],
  ['.sidecar', 'asset-sidecar'],
  ['.sidecar.json', 'asset-sidecar'],
];

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isThreeObject3D(value: unknown): value is THREE.Object3D {
  return value instanceof THREE.Object3D;
}

/** Read `mtllib` declarations from OBJ text. */
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

/** Read texture LRIs from MTL text. */
function textureUrisOfMtl(mtlText?: string): string[] {
  if (!mtlText) return [];
  const uris: string[] = [];
  for (const line of mtlText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    const keyword = parts[0].toLowerCase();
    if (!['map_kd', 'map_diffuse', 'map_bump', 'bump', 'map_d'].includes(keyword) || parts.length < 2) continue;
    const uri = parts.slice(1).join(' ').trim();
    if (uri.length > 0) uris.push(uri);
  }
  return uris;
}

function toBytes(input: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

export class MultiFormatParser {
  /**
   * Automatically identify a format from a path or extension. Unknown
   * extensions return `'custom'`; custom plugin formats are resolved through
   * the extension registry.
   */
  public static detectFormat(path: string): UniversalAssetFormat {
    const lower = path.toLowerCase();
    // Longest extension first so `.forge.json` wins over `.json`.
    const sorted = EXTENSION_TO_FORMAT.slice().sort((a, b) => b[0].length - a[0].length);
    for (const [extension, format] of sorted) {
      if (lower.endsWith(extension)) return format;
    }

    const registry = getExtensionRegistry();
    const plugin = registry.get(path);
    if (plugin && plugin.format !== 'custom') return plugin.format as UniversalAssetFormat;
    return 'custom';
  }

  /** Detect a format from the first bytes of a file. */
  public static detectFormatFromBytes(bytes: Uint8Array): UniversalAssetFormat | null {
    if (bytes.length >= 4 && bytes[0] === 0x67 && bytes[1] === 0x6c && bytes[2] === 0x54 && bytes[3] === 0x46) {
      return 'glb'; // 'glTF'
    }
    const header = new TextDecoder('utf-8').decode(bytes.subarray(0, 128)).replace(/\0/g, '');
    if (header.startsWith('Kaydara FBX Binary') || /^\s*;\s*FBX/i.test(header) || header.includes('FBXHeaderExtension')) {
      return 'fbx';
    }
    if (header.startsWith('ply')) return 'ply';
    if (header.startsWith('solid ') || header.startsWith('facet ')) return 'stl';
    if (header.startsWith('HIERARCHY')) return 'bvh';
    if (header.startsWith('Vocaloid Motion')) return 'vmd';
    if (header.includes('$fbx') || header.includes('# Blender') || header.includes('"asset"')) return 'gltf';
    if (header.startsWith('<?xml') || header.includes('<COLLADA')) return 'dae';
    if (header.startsWith('PXR-USDC') || header.startsWith('USD')) return 'usdc';
    const image = detectImageFormat(bytes);
    if (image) return image === 'jpg' ? 'jpg' : image;
    return null;
  }

  /**
   * Parse any supported model, scene, material, texture, motion or data asset
   * into one unified structure.
   */
  public static async parse(
    input: ArrayBuffer | Uint8Array | string,
    format?: UniversalAssetFormat,
    options: MultiFormatParseOptions = {},
  ): Promise<EngineResult<ParsedSceneData>> {
    const bytes = toBytes(input);
    const determinedFormat = format
      ?? (typeof input === 'string' && input.length < 4096 && !input.includes('\n')
        ? this.detectFormat(input)
        : this.detectFormatFromBytes(bytes) ?? 'custom');

    let rootObject: THREE.Object3D;
    const dependencies: string[] = [];
    const warnings: string[] = [];
    let animations: THREE.AnimationClip[] = [];
    let texture: THREE.Texture | undefined;
    let motion: MotionData | undefined;
    let data: unknown;
    let materialNames: string[] = [];

    try {
      switch (determinedFormat) {
        case 'glb':
        case 'gltf': {
          const result = await parseGltf(bytes, {
            name: options.name,
            loadExternal: async (uri) => {
              dependencies.push(uri);
              return undefined;
            },
          });
          rootObject = result.scene;
          animations = result.animations;
          warnings.push(...result.warnings);
          dependencies.push(...result.dependencies);
          materialNames = Object.keys(result.materials);
          break;
        }

        case 'fbx': {
          const result = await parseFbx(bytes, {
            name: options.name,
            loadTexture: options.loadTexture,
          });
          rootObject = result.scene;
          animations = result.animations;
          warnings.push(...result.warnings);
          dependencies.push(...result.dependencies);
          break;
        }

        case 'obj': {
          const text = typeof input === 'string' ? input : new TextDecoder().decode(bytes);
          rootObject = parseObj(text, {
            mtlText: options.mtlText,
            name: options.name,
          });
          dependencies.push(...mtlLibrariesOfObj(text));
          dependencies.push(...textureUrisOfMtl(options.mtlText));
          break;
        }

        case 'mtl': {
          const text = typeof input === 'string' ? input : new TextDecoder().decode(bytes);
          const materials = parseMtl(text);
          materialNames = Array.from(materials.keys());
          rootObject = new THREE.Group();
          rootObject.name = options.name ?? 'mtl_material_library';
          rootObject.userData.materials = Object.fromEntries(materials);
          dependencies.push(...textureUrisOfMtl(text));
          break;
        }

        case 'stl': {
          const result = parseStl(bytes, { name: options.name });
          rootObject = new THREE.Mesh(result.geometry, new THREE.MeshStandardMaterial({ name: 'stl_default' }));
          rootObject.name = options.name ?? 'stl_mesh';
          break;
        }

        case 'ply': {
          const result = parsePly(bytes, { name: options.name });
          rootObject = new THREE.Mesh(
            result.geometry,
            new THREE.MeshStandardMaterial({ name: 'ply_default', vertexColors: result.hasVertexColor }),
          );
          rootObject.name = options.name ?? 'ply_mesh';
          break;
        }

        case '3ds': {
          const result = parseThreeDs(bytes, { name: options.name });
          rootObject = result.scene;
          warnings.push(...result.warnings);
          dependencies.push(...result.textureFiles);
          break;
        }

        case 'dae': {
          const result = parseCollada(bytes, { name: options.name });
          rootObject = result.scene;
          warnings.push(...result.warnings);
          dependencies.push(...result.dependencies);
          materialNames = Object.keys(result.materials);
          break;
        }

        case 'usd': {
          const result = parseUsd(bytes, { name: options.name });
          rootObject = result.scene;
          warnings.push(...result.warnings);
          dependencies.push(...result.dependencies);
          break;
        }

        case 'usda': {
          const text = typeof input === 'string' ? input : new TextDecoder().decode(bytes);
          const result = parseUsda(text);
          rootObject = buildUsdScene(result.specs, { name: options.name }).scene;
          break;
        }

        case 'usdc': {
          const copy = new Uint8Array(bytes.byteLength);
          copy.set(bytes);
          const result = parseUsdc(copy.buffer);
          rootObject = buildUsdScene(result.specs, { name: options.name }).scene;
          break;
        }

        case 'abc': {
          const result = parseAbc(bytes, { name: options.name });
          rootObject = result.scene;
          warnings.push(...result.warnings);
          break;
        }

        case 'bvh': {
          const result = parseBvh(bytes, { name: options.name });
          rootObject = result.root;
          if (result.clip) animations.push(result.clip);
          warnings.push(...result.warnings);
          motion = {
            kind: 'bvh',
            name: result.root.name || options.name || 'bvh',
            frameCount: result.frames.length,
            duration: result.duration,
            fps: result.fps,
            bones: result.bones,
            frames: result.frames,
          };
          break;
        }

        case 'vmd': {
          const result = parseVmd(bytes, { name: options.name });
          rootObject = new THREE.Group();
          rootObject.name = result.name;
          if (result.clip) animations.push(result.clip);
          warnings.push(...result.warnings);
          motion = {
            kind: 'vmd',
            name: result.name,
            frameCount: result.frameCount,
            duration: result.duration,
            fps: result.fps,
            bones: result.bones,
            frames: result.frames,
          };
          break;
        }

        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'webp':
        case 'tga':
        case 'exr':
        case 'hdr': {
          const result = parseImage(bytes, determinedFormat as ImageFormat, { name: options.name });
          texture = result.texture;
          warnings.push(...result.warnings);
          rootObject = new THREE.Group();
          rootObject.name = options.name ?? `${determinedFormat}_texture`;
          rootObject.userData.imageInfo = result.info;
          break;
        }

        case 'forge-design':
        case 'bot-spec':
        case 'asset-manifest':
        case 'asset-sidecar': {
          const text = typeof input === 'string' ? input : new TextDecoder().decode(bytes);
          const parsed = parseEngineData(text, determinedFormat);
          data = parsed.data;
          warnings.push(...parsed.warnings);
          rootObject = new THREE.Group();
          rootObject.name = options.name ?? determinedFormat;
          rootObject.userData.engineData = data;
          rootObject.userData.format = determinedFormat;
          break;
        }

        case 'custom': {
          const registry = getExtensionRegistry();
          const plugin = registry.get(options.name ?? '')
            ?? registry.getByMagicBytes(bytes)
            ?? registry.get('custom');
          if (!plugin) {
            return engineErr({
              code: 'UNSUPPORTED_FORMAT',
              message: 'Unknown custom format: pass a registered format id or register a parser plugin.',
              subsystem: 'MultiFormatParser',
            });
          }
          const customResult = await plugin.parse(input, options);
          if (isThreeObject3D(customResult)) {
            rootObject = customResult;
          } else {
            data = customResult;
            rootObject = new THREE.Group();
            rootObject.name = options.name ?? plugin.name;
            rootObject.userData.data = customResult;
          }
          materialNames = plugin.name ? [plugin.name] : [];
          break;
        }

        default: {
          return engineErr({
            code: 'UNSUPPORTED_FORMAT',
            message: `Format "${String(determinedFormat)}" is not supported by MultiFormatParser.`,
            subsystem: 'MultiFormatParser',
          });
        }
      }

      // Collect metrics, nodes, geometry buffers and materials.
      let totalTriangles = 0;
      let totalVertices = 0;
      let boneCount = 0;
      const materialsSet = new Map<string, THREE.Material>();
      const geometryBuffers: GeometryBuffers[] = [];
      const nodes: TransformNode[] = [];

      rootObject.updateMatrixWorld(true);
      rootObject.traverse((obj) => {
        const position = obj.position;
        const rotation = obj.quaternion;
        const scale = obj.scale;
        nodes.push({
          uid: obj.uuid,
          name: obj.name || 'node',
          parentUid: obj.parent ? obj.parent.uuid : undefined,
          childrenUids: obj.children.map((child) => child.uuid),
          position: { x: position.x, y: position.y, z: position.z },
          rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
          scale: { x: scale.x, y: scale.y, z: scale.z },
          localMatrix: { elements: obj.matrix.toArray() },
          worldMatrix: { elements: obj.matrixWorld.toArray() },
          layerMask: obj.layers.mask,
          flags: {
            visible: obj.visible,
            isStatic: obj.matrixAutoUpdate === false,
            castShadow: obj.castShadow,
            receiveShadow: obj.receiveShadow,
            pickable: true,
          },
          data: obj.userData,
          meta: {},
        });

        if ((obj as THREE.Bone).isBone) boneCount += 1;

        if (obj instanceof THREE.Mesh && obj.geometry) {
          const geometry = obj.geometry;
          const positionAttribute = geometry.getAttribute('position');
          if (positionAttribute) {
            totalVertices += positionAttribute.count;
            totalTriangles += geometry.index
              ? Math.floor(geometry.index.count / 3)
              : Math.floor(positionAttribute.count / 3);

            const raw = extractRawBufferData(obj);
            geometryBuffers.push({
              vertex: {
                attributes: {
                  position: {
                    semantic: 'position',
                    name: 'position',
                    itemSize: 3,
                    format: 'float32',
                    offset: 0,
                  },
                },
                data: raw.positions,
                vertexCount: Math.round(raw.positions.length / 3),
              },
              index: raw.indices
                ? { format: 'uint32', data: raw.indices, count: raw.indices.length }
                : undefined,
              primitiveType: 'triangles',
            });
          }

          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const material of materials) {
            if (!material) continue;
            const key = material.name || `Material_${materialsSet.size}`;
            if (!materialsSet.has(key)) {
              materialsSet.set(key, material);
              if (!materialNames.includes(key)) materialNames.push(key);
            }
          }
        }
      });

      const animationsCount = animations.length > 0
        ? animations.length
        : (rootObject as THREE.Object3D & { animations?: THREE.AnimationClip[] }).animations?.length ?? 0;

      return engineOk({
        root: rootObject,
        format: determinedFormat,
        geometryBuffers,
        nodes,
        triangleCount: Math.round(totalTriangles),
        vertexCount: totalVertices,
        materialsCount: materialNames.length > 0 ? Math.max(materialsSet.size, materialNames.length) : materialsSet.size,
        animationsCount,
        dependencies,
        warnings,
        materialNames,
        textureCount: texture ? 1 : 0,
        boneCount,
        texture,
        motion,
        data,
      });
    } catch (err: unknown) {
      return engineErr({
        code: 'MULTI_FORMAT_PARSE_ERROR',
        message: `Failed to parse ${determinedFormat} asset: ${errorMessage(err)}`,
        subsystem: 'MultiFormatParser',
        stack: err instanceof Error ? err.stack : undefined,
      });
    }
  }
}
