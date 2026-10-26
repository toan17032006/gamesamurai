/**
 * @file texture-pbr-unpacker.ts
 * @module @aetheria/engine/asset-parser/texture-pbr-unpacker
 * @description PBR texture maps unpacker (.png, .jpg, .webp, .tga, .exr, .hdr).
 * Decomposes combined ORM/RMA channels, manages color spaces, and inverts normal map Y channels.
 */

import type {
  PBRTextureMap,
  PBRTextureSet,
  PBRTextureChannel,
  MaterialTextureFormat,
  ColorSpace
} from '../types/format.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export interface TextureUnpackOptions {
  detectORM?: boolean;
  detectRMA?: boolean;
  invertNormalY?: boolean;
  targetColorSpace?: ColorSpace;
}

export class TexturePBRUnpacker {
  /**
   * Identifies the material texture format from file extension or signature
   */
  public static detectFormat(pathOrName: string): MaterialTextureFormat {
    const lower = pathOrName.toLowerCase();
    if (lower.endsWith('.png')) return 'png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
    if (lower.endsWith('.webp')) return 'webp';
    if (lower.endsWith('.tga')) return 'tga';
    if (lower.endsWith('.exr')) return 'exr';
    if (lower.endsWith('.hdr')) return 'hdr';
    if (lower.endsWith('.mtl')) return 'mtl';
    return 'png';
  }

  /**
   * Unpacks a packed ORM texture (Occlusion in R, Roughness in G, Metalness in B)
   * into three discrete single-channel texture maps.
   */
  public static unpackORM(
    ormTexture: PBRTextureMap
  ): EngineResult<{
    ambientOcclusion: PBRTextureMap;
    roughness: PBRTextureMap;
    metalness: PBRTextureMap;
  }> {
    const pixelCount = ormTexture.width * ormTexture.height;
    if (ormTexture.data.length < pixelCount * 3) {
      return engineErr({
        code: 'INVALID_ORM_BUFFER_SIZE',
        message: `ORM buffer size (${ormTexture.data.length}) is insufficient for ${ormTexture.width}x${ormTexture.height} image.`,
        subsystem: 'TexturePBRUnpacker'
      });
    }

    const aoData = new Uint8Array(pixelCount);
    const roughData = new Uint8Array(pixelCount);
    const metalData = new Uint8Array(pixelCount);

    const step = ormTexture.channels;
    const src = ormTexture.data;

    for (let i = 0; i < pixelCount; i++) {
      const srcIdx = i * step;
      aoData[i] = src[srcIdx]; // Red -> AO
      roughData[i] = src[srcIdx + 1]; // Green -> Roughness
      metalData[i] = src[srcIdx + 2]; // Blue -> Metalness
    }

    const common = {
      format: ormTexture.format,
      width: ormTexture.width,
      height: ormTexture.height,
      channels: 1,
      colorSpace: 'Linear' as ColorSpace
    };

    return engineOk({
      ambientOcclusion: {
        ...common,
        channel: 'ambientOcclusion',
        data: aoData,
        sourceChannelIndex: 0
      },
      roughness: {
        ...common,
        channel: 'roughness',
        data: roughData,
        sourceChannelIndex: 1
      },
      metalness: {
        ...common,
        channel: 'metalness',
        data: metalData,
        sourceChannelIndex: 2
      }
    });
  }

  /**
   * Inverts the Normal map Y channel (flips between DirectX and OpenGL standards)
   */
  public static flipNormalY(normalMap: PBRTextureMap): PBRTextureMap {
    const data = new Uint8Array(normalMap.data);
    const pixelCount = normalMap.width * normalMap.height;
    const step = normalMap.channels;

    for (let i = 0; i < pixelCount; i++) {
      const gIndex = i * step + 1; // Green channel = Y axis
      data[gIndex] = 255 - data[gIndex];
    }

    return {
      ...normalMap,
      data
    };
  }

  /**
   * Builds a complete PBR texture set from an inventory of named maps
   */
  public static buildPBRSet(
    maps: Array<{ name: string; map: PBRTextureMap }>,
    options?: TextureUnpackOptions
  ): EngineResult<PBRTextureSet> {
    const result: PBRTextureSet = {
      customMaps: {}
    };

    for (const item of maps) {
      const name = item.name.toLowerCase();
      const map = item.map;

      if (name.includes('albedo') || name.includes('basecolor') || name.includes('diffuse')) {
        result.albedo = { ...map, channel: 'albedo', colorSpace: 'sRGB' };
      } else if (name.includes('normal') || name.includes('norm')) {
        let normMap = { ...map, channel: 'normal' as PBRTextureChannel, colorSpace: 'Linear' as ColorSpace };
        if (options?.invertNormalY) {
          normMap = this.flipNormalY(normMap);
        }
        result.normal = normMap;
      } else if (name.includes('orm') || name.includes('occlusionroughnessmetallic')) {
        result.packedORM = map;
        if (options?.detectORM !== false) {
          const unpacked = this.unpackORM(map);
          if (unpacked.ok) {
            result.ambientOcclusion = unpacked.value.ambientOcclusion;
            result.roughness = unpacked.value.roughness;
            result.metalness = unpacked.value.metalness;
          }
        }
      } else if (name.includes('roughness') || name.includes('rough')) {
        result.roughness = { ...map, channel: 'roughness', colorSpace: 'Linear' };
      } else if (name.includes('metal') || name.includes('metallic')) {
        result.metalness = { ...map, channel: 'metalness', colorSpace: 'Linear' };
      } else if (name.includes('ao') || name.includes('ambientocclusion') || name.includes('occlusion')) {
        result.ambientOcclusion = { ...map, channel: 'ambientOcclusion', colorSpace: 'Linear' };
      } else if (name.includes('emissive') || name.includes('emission')) {
        result.emissive = { ...map, channel: 'emissive', colorSpace: 'sRGB' };
      } else if (name.includes('height') || name.includes('disp') || name.includes('displacement')) {
        result.height = { ...map, channel: 'height', colorSpace: 'Linear' };
      } else {
        result.customMaps![item.name] = map;
      }
    }

    return engineOk(result, { mapCount: maps.length });
  }
}
