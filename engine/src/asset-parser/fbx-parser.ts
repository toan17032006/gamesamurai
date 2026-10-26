/**
 * @file fbx-parser.ts
 * @module @aetheria/engine/asset-parser/fbx-parser
 * @description Headless-safe FBX adapter built on three.js's FBXLoader.
 *
 * FBX is a complex binary/ASCII container (binary record tree, compressed array
 * properties, skin clusters, blend shapes, animation stacks). three.js ships a
 * complete parser for both encodings; this module wraps it with:
 *  - deterministic ArrayBuffer handling for string/typed-array inputs,
 *  - a DOM-free texture loader for Node/server execution,
 *  - dependency collection for external texture URIs,
 *  - structural metrics and a typed result contract.
 */

import * as THREE from 'three';
import type { AssetFormat } from '../types/asset.types.js';

export interface FbxParseOptions {
  /** Root scene name. */
  name?: string;
  /** Override the loader's resource path (external texture folder). */
  resourcePath?: string;
  /** Optional external loader for textures. */
  loadTexture?: (uri: string) => THREE.Texture | null;
}

export interface FbxParseResult {
  scene: THREE.Group;
  format: AssetFormat;
  animations: THREE.AnimationClip[];
  dependencies: string[];
  warnings: string[];
  nodeCount: number;
  meshCount: number;
  triangleCount: number;
  materialCount: number;
  boneCount: number;
}

/** Detect the ASCII vs binary FBX container without decoding the whole file. */
export function detectFbxEncoding(bytes: Uint8Array): 'ascii' | 'binary' {
  const header = new TextDecoder('ascii').decode(bytes.subarray(0, 32)).replace(/\0/g, '');
  if (header.startsWith('Kaydara FBX Binary')) return 'binary';
  const text = new TextDecoder('utf-8').decode(bytes.subarray(0, 256));
  if (text.includes('FBXHeaderExtension') || /^\s*;\s*FBX/i.test(text)) return 'ascii';
  return 'binary';
}

function toArrayBuffer(input: ArrayBuffer | Uint8Array | string): ArrayBuffer {
  if (typeof input === 'string') return new TextEncoder().encode(input).buffer as ArrayBuffer;
  if (input instanceof Uint8Array) {
    const copy = new Uint8Array(input.byteLength);
    copy.set(input);
    return copy.buffer;
  }
  return input;
}

/**
 * Parse an FBX scene from text or binary input.
 *
 * Throws a descriptive error for corrupt containers. `warnings` is populated
 * when a valid FBX contains no renderable mesh.
 */
export async function parseFbx(
  input: ArrayBuffer | Uint8Array | string,
  options: FbxParseOptions = {},
): Promise<FbxParseResult> {
  const buffer = toArrayBuffer(input);
  if (buffer.byteLength < 16) {
    throw new Error('FBX: dữ liệu quá ngắn (thiếu header container).');
  }

  const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
  const loader = new FBXLoader();

  const dependencies: string[] = [];
  const warnings: string[] = [];

  // FBXLoader's default TextureLoader uses document/Image. In a headless
  // runtime we record external texture URIs and return an empty texture so the
  // rest of the scene still parses.
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
        if (options.loadTexture) {
          const external = options.loadTexture(url);
          if (external) return external;
        }
        return new THREE.Texture();
      },
    } as unknown as THREE.TextureLoader;
  }

  let scene: THREE.Group;
  try {
    scene = loader.parse(buffer, options.resourcePath ?? '') as THREE.Group;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`FBX: không thể bóc tách container (${message}).`);
  }

  if (!(scene instanceof THREE.Object3D)) {
    throw new Error('FBX: loader không trả về scene hợp lệ.');
  }

  scene.name = options.name ?? scene.name ?? 'fbx_scene';

  let nodeCount = 0;
  let meshCount = 0;
  let triangleCount = 0;
  const materials = new Set<THREE.Material>();
  const bones = new Set<THREE.Bone>();

  scene.traverse((node) => {
    nodeCount += 1;
    if ((node as THREE.Mesh).isMesh) {
      meshCount += 1;
      const mesh = node as THREE.Mesh;
      const geometry = mesh.geometry;
      const position = geometry.getAttribute('position');
      if (position) {
        triangleCount += geometry.index ? Math.floor(geometry.index.count / 3) : Math.floor(position.count / 3);
      }
      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const m of material) materials.add(m);
      } else if (material) {
        materials.add(material);
      }
    }
    if ((node as THREE.Bone).isBone) bones.add(node as THREE.Bone);
  });

  if (meshCount === 0) {
    warnings.push('FBX: tệp không chứa mesh hình học (có thể chỉ có xương hoặc camera).');
  }

  const animations = scene.animations ?? [];
  return {
    scene,
    format: 'fbx',
    animations,
    dependencies,
    warnings,
    nodeCount,
    meshCount,
    triangleCount,
    materialCount: materials.size,
    boneCount: bones.size,
  };
}

/** Convert a parsed FBX result into scene data used by `MultiFormatParser`. */
export function fbxMetricsOf(result: FbxParseResult): {
  triangleCount: number;
  vertexCount: number;
  materialsCount: number;
  animationsCount: number;
} {
  let vertexCount = 0;
  result.scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) {
      const attr = mesh.geometry.getAttribute('position');
      if (attr) vertexCount += attr.count;
    }
  });
  return {
    triangleCount: result.triangleCount,
    vertexCount,
    materialsCount: result.materialCount,
    animationsCount: result.animations.length,
  };
}
