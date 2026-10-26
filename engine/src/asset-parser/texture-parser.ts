// engine/src/asset-parser/texture-parser.ts — Phân tách Albedo, Normal, Roughness, Metalness, AO maps
import * as THREE from 'three';
import type { TextureMapInfo, TextureSlot } from '../types/asset.types';

const SLOT_PROPS: ReadonlyArray<readonly [TextureSlot, string]> = [
  ['albedo', 'map'],
  ['diffuse', 'map'],
  ['normal', 'normalMap'],
  ['roughness', 'roughnessMap'],
  ['metalness', 'metalnessMap'],
  ['ao', 'aoMap'],
  ['emissive', 'emissiveMap'],
  ['displacement', 'displacementMap'],
  ['alpha', 'alphaMap'],
  ['specular', 'specularMap'],
  ['transmission', 'transmissionMap'],
];

const EXTRA_PROPS: readonly string[] = [
  'bumpMap',
  'envMap',
  'lightMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'iridescenceMap',
  'anisotropyMap',
  'thicknessMap',
];

function textureUri(texture: THREE.Texture): string {
  const img = texture.image as
    | { src?: string; url?: string; name?: string; width?: number; height?: number }
    | null
    | undefined;
  const uri = img?.src ?? img?.url ?? texture.name;
  return uri && uri.length > 0 ? uri : texture.uuid;
}

function textureSize(texture: THREE.Texture): { width?: number; height?: number } {
  const img = texture.image as
    | { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number }
    | null
    | undefined;
  if (!img) return {};
  const width = img.width ?? img.naturalWidth;
  const height = img.height ?? img.naturalHeight;
  return width && height ? { width, height } : {};
}

export function parseMaterialTextures(material: THREE.Material): TextureMapInfo[] {
  const info: TextureMapInfo[] = [];
  const seen = new Set<string>();
  const props = material as unknown as Record<string, THREE.Texture | undefined | null>;

  const push = (slot: TextureSlot, texture: THREE.Texture) => {
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
    if (tex) push('other', tex);
  }
  return info;
}

export function parseTextures(root: THREE.Object3D): TextureMapInfo[] {
  const seen = new Set<string>();
  const materials: THREE.Material[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (m && !seen.has(m.uuid)) {
        seen.add(m.uuid);
        materials.push(m);
      }
    }
  });

  const allTextures: TextureMapInfo[] = [];
  const uriSeen = new Set<string>();
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

export function detectKhrMaterialFeatures(material: THREE.Material): string[] {
  const features: string[] = [];
  const m = material as unknown as Record<string, unknown>;
  if ('clearcoat' in m && typeof m.clearcoat === 'number' && m.clearcoat > 0) features.push('KHR_materials_clearcoat');
  if ('transmission' in m && typeof m.transmission === 'number' && m.transmission > 0)
    features.push('KHR_materials_transmission');
  if ('sheen' in m && typeof m.sheen === 'number' && m.sheen > 0) features.push('KHR_materials_sheen');
  if ('ior' in m && typeof m.ior === 'number' && Math.abs(m.ior - 1.5) > 1e-3) features.push('KHR_materials_ior');
  if ('iridescence' in m && typeof m.iridescence === 'number' && m.iridescence > 0)
    features.push('KHR_materials_iridescence');
  if ('anisotropy' in m && typeof m.anisotropy === 'number' && m.anisotropy > 0)
    features.push('KHR_materials_anisotropy');
  return features;
}
