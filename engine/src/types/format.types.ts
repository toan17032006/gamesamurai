/**
 * @file format.types.ts
 * @module @aetheria/engine/types/format
 * @description Enumerations and contracts for 17+ 3D asset, material, animation, and custom engine formats.
 */

export type ModelFormat =
  | 'glb'
  | 'gltf'
  | 'fbx'
  | 'obj'
  | 'dae'
  | '3ds'
  | 'stl'
  | 'ply';

export type SceneExchangeFormat =
  | 'usd'
  | 'usda'
  | 'usdc'
  | 'abc';

export type MaterialTextureFormat =
  | 'mtl'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'tga'
  | 'exr'
  | 'hdr';

export type AnimationMotionFormat =
  | 'bvh'
  | 'vmd';

export type CustomEngineFormat =
  | 'forge-design'
  | 'bot-spec'
  | 'asset-manifest'
  | 'asset-sidecar'
  | 'custom';

export type UniversalAssetFormat =
  | ModelFormat
  | SceneExchangeFormat
  | MaterialTextureFormat
  | AnimationMotionFormat
  | CustomEngineFormat;

export type PBRTextureChannel =
  | 'albedo'
  | 'normal'
  | 'roughness'
  | 'metalness'
  | 'ambientOcclusion'
  | 'emissive'
  | 'height'
  | 'displacement'
  | 'opacity'
  | 'specular';

export type ColorSpace = 'sRGB' | 'Linear';

export interface PBRTextureMap {
  channel: PBRTextureChannel;
  format: MaterialTextureFormat;
  width: number;
  height: number;
  channels: number; // 1 (grayscale), 2 (RG), 3 (RGB), 4 (RGBA)
  colorSpace: ColorSpace;
  data: Uint8Array | Float32Array;
  uri?: string;
  sourceChannelIndex?: 0 | 1 | 2 | 3; // R, G, B, A for packed ORM maps
}

export interface PBRTextureSet {
  albedo?: PBRTextureMap;
  normal?: PBRTextureMap;
  roughness?: PBRTextureMap;
  metalness?: PBRTextureMap;
  ambientOcclusion?: PBRTextureMap;
  emissive?: PBRTextureMap;
  height?: PBRTextureMap;
  displacement?: PBRTextureMap;
  packedORM?: PBRTextureMap;
  customMaps?: Record<string, PBRTextureMap>;
}

export interface AssetParserPlugin<TOptions = unknown, TResult = unknown> {
  id: string;
  name: string;
  format: UniversalAssetFormat | string;
  extensions: string[];
  mimeTypes?: string[];
  magicBytes?: number[];
  canParse: (header: Uint8Array | string, extension: string) => boolean;
  parse: (
    input: ArrayBuffer | Uint8Array | string,
    options?: TOptions
  ) => Promise<TResult> | TResult;
}
