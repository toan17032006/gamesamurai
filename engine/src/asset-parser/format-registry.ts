/**
 * @file format-registry.ts
 * @module @aetheria/engine/asset-parser/format-registry
 * @description Nguồn sự thật duy nhất cho các định dạng tài sản 3D mà Engine hỗ trợ.
 *
 * Mỗi định dạng được khai báo một lần: phần mở rộng file, nhóm định dạng, và các
 * năng lực (hình học / animation / vật liệu / texture / xương / motion). Nhờ đó
 * `formatOf()`, bộ phân tích và trình xuất đều dùng chung một bảng tra — thêm
 * định dạng mới chỉ cần sửa file này.
 */

import type { AssetFormat, AssetKind } from '../types/asset.types.js';

export interface AssetFormatCapabilities {
  /** Có hình học tam giác. */
  geometry: boolean;
  /** Có animation clip. */
  animation: boolean;
  /** Có định nghĩa vật liệu. */
  materials: boolean;
  /** Có texture nhúng/tham chiếu. */
  textures: boolean;
  /** Có hệ xương / bone. */
  skeleton: boolean;
  /** Có dữ liệu chuyển động (khung hình). */
  motion: boolean;
}

export interface AssetFormatSpec {
  format: AssetFormat;
  kind: AssetKind;
  /** Các phần mở rộng file (không có dấu chấm, chữ thường). */
  extensions: string[];
  capabilities: AssetFormatCapabilities;
  /** Loader của three.js dùng được, nếu có. */
  threeLoader?: string;
  /** Engine tự viết parser (không phụ thuộc three.js loader). */
  builtin?: boolean;
  /** Ghi chú giới hạn hỗ trợ. */
  notes?: string;
}

const NO_CAP: AssetFormatCapabilities = {
  geometry: false,
  animation: false,
  materials: false,
  textures: false,
  skeleton: false,
  motion: false,
};

function caps(partial: Partial<AssetFormatCapabilities>): AssetFormatCapabilities {
  return { ...NO_CAP, ...partial };
}

/**
 * Bảng tra định dạng. Thứ tự không quan trọng — tra cứu bằng extension.
 */
export const FORMAT_REGISTRY: readonly AssetFormatSpec[] = [
  // ---- Mô hình / hình học -------------------------------------------------
  {
    format: 'gltf',
    kind: 'scene',
    extensions: ['gltf'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: 'GLTFLoader',
    builtin: true,
    notes: 'Parser tự viết của Engine — đọc buffer nhúng (data URI) và buffer ngoài, chạy được cả headless.',
  },
  {
    format: 'glb',
    kind: 'scene',
    extensions: ['glb'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: 'GLTFLoader',
    builtin: true,
    notes: 'Parser tự viết của Engine — đọc container GLB (chunk JSON + BIN), chạy được cả headless.',
  },
  {
    format: 'fbx',
    kind: 'scene',
    extensions: ['fbx'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: 'FBXLoader',
    notes: 'Đọc bằng FBXLoader của three.js — cần trình duyệt (nạp texture ngoài theo URL).',
  },
  {
    format: 'obj',
    kind: 'geometry',
    extensions: ['obj'],
    capabilities: caps({ geometry: true, materials: true }),
    builtin: true,
    notes: 'Kèm .mtl và texture tham chiếu được nạp tự động nếu khai báo.',
  },
  {
    format: 'dae',
    kind: 'scene',
    extensions: ['dae'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    threeLoader: 'ColladaLoader',
    builtin: true,
    notes: 'Parser tự viết của Engine (XML không cần DOM) — chạy được cả headless.',
  },
  {
    format: '3ds',
    kind: 'scene',
    extensions: ['3ds'],
    capabilities: caps({ geometry: true, materials: true, textures: true }),
    builtin: true,
    notes: '3DS chunk nhị phân (k2.0/k3.0). Animation bị bỏ qua — định dạng không mang kênh thời gian.',
  },
  {
    format: 'stl',
    kind: 'geometry',
    extensions: ['stl'],
    capabilities: caps({ geometry: true }),
    builtin: true,
    notes: 'Hỗ trợ binary STL và ASCII STL.',
  },
  {
    format: 'ply',
    kind: 'geometry',
    extensions: ['ply'],
    capabilities: caps({ geometry: true, textures: true }),
    builtin: true,
    notes: 'Hỗ trợ ASCII PLY và binary PLY (little/big endian); màu đỉnh được nạp vào vertex color.',
  },

  // ---- Cảnh & trao đổi dữ liệu -------------------------------------------
  {
    format: 'usd',
    kind: 'scene',
    extensions: ['usd'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: 'USD nhị phân (crate) — đọc cấu trúc prim, transform, mesh, material.',
  },
  {
    format: 'usda',
    kind: 'scene',
    extensions: ['usda'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: 'USD ASCII — đọc prim Xform/Mesh/Material và thuộc tính cơ bản.',
  },
  {
    format: 'usdc',
    kind: 'scene',
    extensions: ['usdc'],
    capabilities: caps({ geometry: true, animation: true, materials: true, textures: true, skeleton: true }),
    builtin: true,
    notes: 'USD crate nhị phân — cùng bộ đọc với .usd.',
  },
  {
    format: 'abc',
    kind: 'scene',
    extensions: ['abc'],
    capabilities: caps({ geometry: true, animation: true, materials: true, skeleton: true }),
    builtin: true,
    notes: 'Alembic — đọc cây object + hierarchy transform + mesh theo thời gian.',
  },

  // ---- Vật liệu & texture --------------------------------------------------
  {
    format: 'mtl',
    kind: 'material',
    extensions: ['mtl'],
    capabilities: caps({ materials: true, textures: true }),
    builtin: true,
    notes: 'Wavefront material — map_Kd/map_Bump/map_d và tham số PBR suy ra.',
  },
  {
    format: 'png',
    kind: 'texture',
    extensions: ['png'],
    capabilities: caps({ textures: true }),
    builtin: true,
  },
  {
    format: 'jpg',
    kind: 'texture',
    extensions: ['jpg'],
    capabilities: caps({ textures: true }),
    builtin: true,
  },
  {
    format: 'jpeg',
    kind: 'texture',
    extensions: ['jpeg'],
    capabilities: caps({ textures: true }),
    builtin: true,
  },
  {
    format: 'webp',
    kind: 'texture',
    extensions: ['webp'],
    capabilities: caps({ textures: true }),
    builtin: true,
  },
  {
    format: 'tga',
    kind: 'texture',
    extensions: ['tga'],
    capabilities: caps({ textures: true }),
    builtin: true,
  },
  {
    format: 'exr',
    kind: 'texture',
    extensions: ['exr'],
    capabilities: caps({ textures: true }),
    builtin: true,
    notes: 'OpenEXR HDR — nạp qua EXRLoader của three.js.',
  },
  {
    format: 'hdr',
    kind: 'texture',
    extensions: ['hdr'],
    capabilities: caps({ textures: true }),
    builtin: true,
    notes: 'Radiance HDR — nạp qua RGBELoader, dùng cho environment map.',
  },

  // ---- Animation & dữ liệu chuyển động ------------------------------------
  {
    format: 'bvh',
    kind: 'motion',
    extensions: ['bvh'],
    capabilities: caps({ skeleton: true, motion: true }),
    builtin: true,
    notes: 'BVH — cây khung hình + kênh vị trí; chuyển thành AnimationClip cho three.js.',
  },
  {
    format: 'vmd',
    kind: 'motion',
    extensions: ['vmd'],
    capabilities: caps({ motion: true }),
    builtin: true,
    notes: 'VMD (MikuMikuDance) — keyframe vị trí/xoay cho bone theo tên.',
  },

  // ---- Định dạng riêng của Engine ----------------------------------------
  {
    format: 'forge-design',
    kind: 'data',
    extensions: ['json'],
    capabilities: caps({}),
    builtin: true,
    notes: 'ForgeDesignSpec — kind "aetheria.forge.design".',
  },
  {
    format: 'bot-spec',
    kind: 'data',
    extensions: ['json'],
    capabilities: caps({}),
    builtin: true,
    notes: 'BotSpecDocument — kind "aetheria.bot.spec".',
  },
  {
    format: 'asset-manifest',
    kind: 'data',
    extensions: ['json'],
    capabilities: caps({}),
    builtin: true,
    notes: 'AssetManifest — catalog định dạng { version, generatedAt, entries[] }.',
  },
  {
    format: 'asset-sidecar',
    kind: 'data',
    extensions: ['json'],
    capabilities: caps({}),
    builtin: true,
    notes: 'Metadata sidecar của một asset (.json cạnh .glb/.obj…).',
  },
];

/** extension -> spec (extension đầu tiên thắng). */
const BY_EXTENSION = new Map<string, AssetFormatSpec>();
for (const spec of FORMAT_REGISTRY) {
  for (const ext of spec.extensions) {
    if (!BY_EXTENSION.has(ext)) BY_EXTENSION.set(ext, spec);
  }
}

/** format -> spec */
const BY_FORMAT = new Map<string, AssetFormatSpec>();
for (const spec of FORMAT_REGISTRY) {
  if (!BY_FORMAT.has(spec.format)) BY_FORMAT.set(spec.format, spec);
}

/** Lấy phần mở rộng file (chữ thường, không dấu chấm). */
export function extensionOf(path: string): string {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(path);
  return (m?.[1] ?? '').toLowerCase();
}

/**
 * Định dạng của một đường dẫn.
 *
 * `.json` là định dạng riêng của Engine nên không thể suy từ phần mở rộng —
 * phải đọc nội dung (`kind` / cấu trúc) để phân biệt forge-design, bot-spec,
 * asset-manifest và sidecar.
 */
export function formatOf(path: string, contentHint?: string): AssetFormat {
  const ext = extensionOf(path);
  if (ext === 'json') {
    const hint = (contentHint ?? '').trim();
    if (hint.includes('"aetheria.forge.design"')) return 'forge-design';
    if (hint.includes('"aetheria.bot.spec"')) return 'bot-spec';
    if (/"entries"\s*:/.test(hint) && /"version"\s*:/.test(hint)) return 'asset-manifest';
    return 'asset-sidecar';
  }
  return BY_EXTENSION.get(ext)?.format ?? 'custom';
}

/** Spec của một định dạng (undefined nếu không hỗ trợ). */
export function specOf(format: AssetFormat): AssetFormatSpec | undefined {
  return BY_FORMAT.get(format);
}

/** Nhóm định dạng (mặc định 'data' cho định dạng lạ). */
export function kindOf(format: AssetFormat): AssetKind {
  return BY_FORMAT.get(format)?.kind ?? 'data';
}

/** Engine có hỗ trợ định dạng này không. */
export function isSupportedFormat(format: AssetFormat): boolean {
  return BY_FORMAT.has(format);
}

/** Năng lực của định dạng (toàn false nếu không hỗ trợ). */
export function capabilitiesOf(format: AssetFormat): AssetFormatCapabilities {
  return BY_FORMAT.get(format)?.capabilities ?? { ...NO_CAP };
}

/** Danh sách mọi định dạng mà Engine hỗ trợ. */
export function supportedFormats(): AssetFormat[] {
  return FORMAT_REGISTRY.map((s) => s.format);
}

/** Danh sách extension mà Engine hỗ trợ (duy nhất, đã sắp xếp). */
export function supportedExtensions(): string[] {
  return [...BY_EXTENSION.keys()].sort();
}
