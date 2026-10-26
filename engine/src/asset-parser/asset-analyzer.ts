/**
 * @file asset-analyzer.ts
 * @module @aetheria/engine/asset-parser/asset-analyzer
 * @description Phân tích, tính toán và kiểm định tài sản 3D.
 *
 * Module này biến một `ParsedAsset` thành báo cáo có thể dùng để ra quyết định:
 *  • **Tính toán** — ngân sách tam giác/đỉnh/vật liệu/bộ nhớ, điểm hiệu năng,
 *    gợi ý LOD.
 *  • **Phân tích** — phát hiện lỗi và cảnh báo thật (mesh không có vật liệu,
 *    vật liệu không có normal map, texture quá lớn, tài sản vượt ngân sách).
 *  • **Kiểm định** — so với ngân sách theo từng nhóm tài sản.
 *
 * Mọi con số đều suy ra từ dữ liệu thật của tài sản, không dùng giá trị giả.
 */

import * as THREE from 'three';
import type {
  AssetCategory,
  AssetFormat,
  AssetKind,
  ParsedAsset,
} from '../types/asset.types.js';

// ---------------------------------------------------------------------------
// Ngân sách
// ---------------------------------------------------------------------------

/** Ngân sách tài sản cho một nhóm. */
export interface AssetBudget {
  /** Số tam giác tối đa. */
  maxTriangles: number;
  /** Số đỉnh tối đa. */
  maxVertices: number;
  /** Số vật liệu tối đa. */
  maxMaterials: number;
  /** Số mesh tối đa (xấp xỉ draw call). */
  maxDrawCalls: number;
  /** Bộ nhớ texture tối đa (byte). */
  maxTextureBytes: number;
  /** Số xương tối đa. */
  maxBones: number;
  /** Kích thước tối đa theo cạnh (đơn vị scene). */
  maxDimension?: number;
}

/** Ngân sách mặc định theo nhóm tài sản. */
export const DEFAULT_BUDGETS: Readonly<Record<AssetCategory, AssetBudget>> = {
  character: { maxTriangles: 40_000, maxVertices: 25_000, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 120 },
  monster: { maxTriangles: 50_000, maxVertices: 30_000, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 120 },
  boss: { maxTriangles: 90_000, maxVertices: 55_000, maxMaterials: 10, maxDrawCalls: 16, maxTextureBytes: 32 * 1024 * 1024, maxBones: 150 },
  npc: { maxTriangles: 20_000, maxVertices: 12_000, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 80 },
  weapon: { maxTriangles: 12_000, maxVertices: 8_000, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 10 },
  shield: { maxTriangles: 8_000, maxVertices: 5_000, maxMaterials: 5, maxDrawCalls: 6, maxTextureBytes: 8 * 1024 * 1024, maxBones: 6 },
  armor: { maxTriangles: 15_000, maxVertices: 10_000, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 20 },
  helmet: { maxTriangles: 8_000, maxVertices: 5_000, maxMaterials: 6, maxDrawCalls: 6, maxTextureBytes: 8 * 1024 * 1024, maxBones: 10 },
  accessory: { maxTriangles: 6_000, maxVertices: 4_000, maxMaterials: 5, maxDrawCalls: 6, maxTextureBytes: 4 * 1024 * 1024, maxBones: 6 },
  prop: { maxTriangles: 8_000, maxVertices: 5_000, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 4 },
  interactive: { maxTriangles: 8_000, maxVertices: 5_000, maxMaterials: 6, maxDrawCalls: 8, maxTextureBytes: 8 * 1024 * 1024, maxBones: 4 },
  building: { maxTriangles: 60_000, maxVertices: 40_000, maxMaterials: 10, maxDrawCalls: 20, maxTextureBytes: 32 * 1024 * 1024, maxBones: 8 },
  structure: { maxTriangles: 40_000, maxVertices: 25_000, maxMaterials: 8, maxDrawCalls: 16, maxTextureBytes: 24 * 1024 * 1024, maxBones: 6 },
  vegetation: { maxTriangles: 20_000, maxVertices: 12_000, maxMaterials: 4, maxDrawCalls: 6, maxTextureBytes: 16 * 1024 * 1024, maxBones: 6 },
  tree: { maxTriangles: 25_000, maxVertices: 15_000, maxMaterials: 4, maxDrawCalls: 8, maxTextureBytes: 16 * 1024 * 1024, maxBones: 8 },
  rock: { maxTriangles: 15_000, maxVertices: 9_000, maxMaterials: 4, maxDrawCalls: 6, maxTextureBytes: 16 * 1024 * 1024, maxBones: 4 },
  water: { maxTriangles: 6_000, maxVertices: 4_000, maxMaterials: 3, maxDrawCalls: 4, maxTextureBytes: 8 * 1024 * 1024, maxBones: 2 },
  terrain: { maxTriangles: 120_000, maxVertices: 70_000, maxMaterials: 6, maxDrawCalls: 24, maxTextureBytes: 48 * 1024 * 1024, maxBones: 2 },
  vfx: { maxTriangles: 10_000, maxVertices: 8_000, maxMaterials: 4, maxDrawCalls: 12, maxTextureBytes: 8 * 1024 * 1024, maxBones: 2 },
  environment: { maxTriangles: 80_000, maxVertices: 50_000, maxMaterials: 10, maxDrawCalls: 24, maxTextureBytes: 48 * 1024 * 1024, maxBones: 8 },
  mount: { maxTriangles: 45_000, maxVertices: 28_000, maxMaterials: 8, maxDrawCalls: 12, maxTextureBytes: 16 * 1024 * 1024, maxBones: 110 },
  misc: { maxTriangles: 20_000, maxVertices: 12_000, maxMaterials: 6, maxDrawCalls: 10, maxTextureBytes: 8 * 1024 * 1024, maxBones: 20 },
};

/** Ngân sách dùng khi không biết nhóm tài sản. */
export const DEFAULT_BUDGET: AssetBudget = DEFAULT_BUDGETS.misc;

// ---------------------------------------------------------------------------
// Kiểu báo cáo
// ---------------------------------------------------------------------------

export type AssetIssueSeverity = 'error' | 'warning' | 'info';

export interface AssetIssue {
  severity: AssetIssueSeverity;
  /** Mã lỗi ổn định để tra cứu. */
  code: string;
  message: string;
  /** Trường liên quan (vd `geometryStats.triangles`). */
  field?: string;
  /** Giá trị đo được. */
  value?: number;
  /** Ngưỡng đã vượt. */
  limit?: number;
}

export interface LodSuggestion {
  /** Bậc LOD (0 = gốc, 1, 2, …). */
  level: number;
  /** Số tam giác mục tiêu của bậc này. */
  targetTriangles: number;
  /** Tỉ lệ giảm so với bậc trước (0..1). */
  reduction: number;
  reason: string;
}

export interface AssetAnalysisReport {
  assetId: string;
  format: AssetFormat;
  kind: AssetKind;
  category: AssetCategory;

  // Số đo
  meshes: number;
  triangles: number;
  vertices: number;
  materials: number;
  bones: number;
  animations: number;
  /** Số draw call xấp xỉ — bằng số mesh có hình học. */
  drawCalls: number;

  // Bộ nhớ
  /** Bộ nhớ texture ước tính (byte). */
  textureBytes: number;
  /** Bộ nhớ đỉnh ước tính (byte). */
  vertexBytes: number;
  /** Tổng bộ nhớ ước tính (byte) — chưa gồm tệp nguồn. */
  totalBytes: number;
  /** Kích thước tệp nguồn (byte). */
  sourceBytes: number;

  // Hình học
  boundsSize: [number, number, number];
  boundsRadius: number;

  // Đánh giá
  /** Điểm 0..100 — càng cao càng tốt. */
  score: number;
  /** Có vượt ngân sách không. */
  withinBudget: boolean;
  /** Các phát hiện. */
  issues: AssetIssue[];
  /** Gợi ý LOD. */
  lodSuggestions: LodSuggestion[];
  /** Ngân sách đã dùng để đối chiếu. */
  budget: AssetBudget;
}

// ---------------------------------------------------------------------------
// Tính toán
// ---------------------------------------------------------------------------

/** Ước lượng bộ nhớ của một texture (byte). */
export function estimateTextureBytes(texture: THREE.Texture): number {
  const image = texture.image as
    | { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number; data?: ArrayLike<number> }
    | null
    | undefined;
  if (!image) return 0;

  const width = image.width ?? image.naturalWidth ?? 0;
  const height = image.height ?? image.naturalHeight ?? 0;
  if (width > 0 && height > 0) {
    // 4 byte/pixel (RGBA) là trường hợp thường gặp nhất.
    return width * height * 4;
  }
  if (image.data) {
    const length = image.data.length;
    const channels = length % 4 === 0 ? 4 : length % 3 === 0 ? 3 : 1;
    return Math.round((length / channels) * 4);
  }
  return 0;
}

/** Ước lượng bộ nhớ đỉnh của một geometry (byte). */
export function estimateVertexBytes(geometry: THREE.BufferGeometry): number {
  let bytes = 0;
  for (const name of Object.keys(geometry.attributes)) {
    const attribute = geometry.getAttribute(name);
    bytes += attribute.array.byteLength;
  }
  const index = geometry.getIndex();
  if (index) bytes += index.array.byteLength;
  return bytes;
}

/** Số tam giác của một geometry. */
export function countTrianglesInGeometry(geometry: THREE.BufferGeometry): number {
  const index = geometry.getIndex();
  if (index) return index.count / 3;
  const position = geometry.getAttribute('position');
  return position ? position.count / 3 : 0;
}

/** Số đỉnh của một geometry. */
export function countVerticesInGeometry(geometry: THREE.BufferGeometry): number {
  return geometry.getAttribute('position')?.count ?? 0;
}

/**
 * Gợi ý các bậc LOD dựa trên số tam giác và ngân sách.
 *
 * Mỗi bậc giữ khoảng 45% tam giác của bậc trước — tỷ lệ phổ biến cho LOD
 * tam giác vì vẫn giữ được hình dạng nhận diện ở khoảng cách xa.
 */
export function suggestLods(triangles: number, budget: AssetBudget = DEFAULT_BUDGET): LodSuggestion[] {
  const suggestions: LodSuggestion[] = [];
  if (triangles <= 0) return suggestions;

  let current = triangles;
  let level = 1;
  while (current > budget.maxTriangles * 0.5 && level <= 4) {
    const target = Math.max(12, Math.floor(current * 0.45));
    suggestions.push({
      level,
      targetTriangles: target,
      reduction: Math.round((1 - target / current) * 100) / 100,
      reason: `bậc ${level}: giữ ~45% tam giác để giảm tải khi xa`,
    });
    current = target;
    level++;
  }

  if (suggestions.length === 0 && triangles > budget.maxTriangles) {
    suggestions.push({
      level: 1,
      targetTriangles: Math.floor(budget.maxTriangles * 0.5),
      reduction: Math.round((1 - (budget.maxTriangles * 0.5) / triangles) * 100) / 100,
      reason: 'vượt ngân sách tam giác — cần ít nhất một bậc LOD',
    });
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// Phân tích
// ---------------------------------------------------------------------------

export interface AssetAnalysisOptions {
  /** Ngân sách dùng để đối chiếu. Mặc định lấy theo nhóm tài sản. */
  budget?: AssetBudget;
  /** Bỏ qua phân tích vật liệu/texture. */
  skipMaterialAudit?: boolean;
}

/**
 * Phân tích một tài sản đã bóc tách.
 *
 * @param asset - tài sản từ `AssetParser`
 * @param options - tuỳ chọn ngân sách và phạm vi kiểm tra
 */
export function analyzeAsset(
  asset: ParsedAsset,
  options: AssetAnalysisOptions = {},
): AssetAnalysisReport {
  const budget = options.budget ?? DEFAULT_BUDGETS[asset.category] ?? DEFAULT_BUDGET;
  const issues: AssetIssue[] = [];

  // ---- Số đo hình học ----------------------------------------------------
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  let vertexBytes = 0;
  let materialsUsed = new Set<string>();
  const meshesWithoutMaterial: string[] = [];
  const meshesWithoutNormals: string[] = [];

  asset.scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
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
      if (!(material as THREE.MeshStandardMaterial).normalMap) meshesWithoutNormals.push(mesh.name || `Mesh_${meshes}`);
    }
  });

  // ---- Texture -----------------------------------------------------------
  let textureBytes = 0;
  const textures: THREE.Texture[] = [];
  asset.scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material) return;
    const props = material as unknown as Record<string, THREE.Texture | undefined>;
    for (const key of ['map', 'normalMap', 'emissiveMap', 'aoMap', 'roughnessMap', 'metalnessMap', 'alphaMap']) {
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

  // ---- Phát hiện ---------------------------------------------------------
  if (meshes === 0) {
    issues.push({
      severity: 'error',
      code: 'no-geometry',
      message: 'Tài sản không có hình học nào.',
      field: 'geometryStats.meshes',
      value: 0,
    });
  }

  if (triangles > budget.maxTriangles) {
    issues.push({
      severity: 'error',
      code: 'over-triangle-budget',
      message: `Vượt ngân sách tam giác (${triangles} > ${budget.maxTriangles}).`,
      field: 'geometryStats.triangles',
      value: triangles,
      limit: budget.maxTriangles,
    });
  } else if (triangles > budget.maxTriangles * 0.8) {
    issues.push({
      severity: 'warning',
      code: 'near-triangle-budget',
      message: `Đã dùng ${Math.round((triangles / budget.maxTriangles) * 100)}% ngân sách tam giác.`,
      field: 'geometryStats.triangles',
      value: triangles,
      limit: budget.maxTriangles,
    });
  }

  if (vertices > budget.maxVertices) {
    issues.push({
      severity: 'error',
      code: 'over-vertex-budget',
      message: `Vượt ngân sách đỉnh (${vertices} > ${budget.maxVertices}).`,
      field: 'geometryStats.vertices',
      value: vertices,
      limit: budget.maxVertices,
    });
  }

  if (materials > budget.maxMaterials) {
    issues.push({
      severity: 'warning',
      code: 'over-material-budget',
      message: `Vượt ngân sách vật liệu (${materials} > ${budget.maxMaterials}).`,
      field: 'geometryStats.materials',
      value: materials,
      limit: budget.maxMaterials,
    });
  }

  if (meshes > budget.maxDrawCalls) {
    issues.push({
      severity: 'warning',
      code: 'over-drawcall-budget',
      message: `Số mesh (${meshes}) vượt ngân sách draw call (${budget.maxDrawCalls}). — nên gộp mesh tĩnh.`,
      field: 'geometryStats.meshes',
      value: meshes,
      limit: budget.maxDrawCalls,
    });
  }

  if (bones > budget.maxBones) {
    issues.push({
      severity: 'warning',
      code: 'over-bone-budget',
      message: `Số xương (${bones}) vượt ngân sách (${budget.maxBones}).`,
      field: 'bones',
      value: bones,
      limit: budget.maxBones,
    });
  }

  if (textureBytes > budget.maxTextureBytes) {
    issues.push({
      severity: 'error',
      code: 'over-texture-memory',
      message: `Bộ nhớ texture vượt ngân sách (${formatBytes(textureBytes)} > ${formatBytes(budget.maxTextureBytes)}).`,
      field: 'textures',
      value: textureBytes,
      limit: budget.maxTextureBytes,
    });
  }

  if (!options.skipMaterialAudit) {
    if (meshesWithoutMaterial.length > 0) {
      issues.push({
        severity: 'warning',
        code: 'mesh-without-material',
        message: `${meshesWithoutMaterial.length} mesh không có vật liệu: ${meshesWithoutMaterial.slice(0, 5).join(', ')}.`,
        field: 'materials',
      });
    }
    if (meshesWithoutNormals.length > 0 && triangles > 0) {
      issues.push({
        severity: 'info',
        code: 'mesh-without-normal-map',
        message: `${meshesWithoutNormals.length} mesh không có normal map — bề mặt sẽ phẳng khi ánh sáng góc.`,
        field: 'materials',
      });
    }
  }

  if (asset.dependencies.length > 0) {
    issues.push({
      severity: 'info',
      code: 'external-dependencies',
      message: `Còn ${asset.dependencies.length} tệp ngoài phải nạp theo: ${asset.dependencies.slice(0, 5).join(', ')}.`,
      field: 'dependencies',
    });
  }

  if (asset.warnings.length > 0) {
    issues.push({
      severity: 'warning',
      code: 'parser-warnings',
      message: `Parser cảnh báo ${asset.warnings.length} vấn đề: ${asset.warnings.slice(0, 3).join(' | ')}.`,
      field: 'warnings',
    });
  }

  if (animations === 0 && bones > 0) {
    issues.push({
      severity: 'info',
      code: 'skeleton-without-animation',
      message: 'Có xương nhưng không có animation — nhân vật sẽ đứng yên.',
      field: 'animations',
    });
  }

  // ---- Điểm hiệu năng ----------------------------------------------------
  // Mỗi phép so với ngân sách đóng góp một phần điểm; vượt ngân sách thì 0.
  const ratios: Array<{ ratio: number; weight: number }> = [
    { ratio: triangles / budget.maxTriangles, weight: 0.3 },
    { ratio: vertices / budget.maxVertices, weight: 0.2 },
    { ratio: meshes / budget.maxDrawCalls, weight: 0.15 },
    { ratio: materials / budget.maxMaterials, weight: 0.1 },
    { ratio: textureBytes / budget.maxTextureBytes, weight: 0.15 },
    { ratio: bones / Math.max(1, budget.maxBones), weight: 0.1 },
  ];

  let weighted = 0;
  let totalWeight = 0;
  for (const { ratio, weight } of ratios) {
    weighted += Math.max(0, 1 - ratio) * weight;
    totalWeight += weight;
  }
  const errorPenalty = issues.filter((i) => i.severity === 'error').length * 0.15;
  const score = Math.max(0, Math.min(100, Math.round((weighted / totalWeight) * 100 - errorPenalty * 100)));

  const withinBudget = !issues.some((issue) => issue.severity === 'error');

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
    budget,
  };
}

/**
 * Phân tích một scene thô (chưa qua `AssetParser`).
 *
 * Tiện cho tài sản sinh thủ tục — kiểm tra ngay sau khi dựng.
 */
export function analyzeScene(
  scene: THREE.Object3D,
  category: AssetCategory = 'misc',
  options: AssetAnalysisOptions = {},
): AssetAnalysisReport {
  const budget = options.budget ?? DEFAULT_BUDGETS[category] ?? DEFAULT_BUDGET;

  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  let vertexBytes = 0;
  const materialsUsed = new Set<string>();
  const textures: THREE.Texture[] = [];

  scene.updateMatrixWorld(true);
  scene.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes++;
    triangles += countTrianglesInGeometry(mesh.geometry);
    vertices += countVerticesInGeometry(mesh.geometry);
    vertexBytes += estimateVertexBytes(mesh.geometry);
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (material) {
      materialsUsed.add(material.uuid);
      const props = material as unknown as Record<string, THREE.Texture | undefined>;
      for (const key of ['map', 'normalMap', 'emissiveMap', 'aoMap', 'roughnessMap', 'metalnessMap', 'alphaMap']) {
        const texture = props[key];
        if (texture && !textures.includes(texture)) textures.push(texture);
      }
    }
  });

  const textureBytes = textures.reduce((sum, texture) => sum + estimateTextureBytes(texture), 0);
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const radius = box.getBoundingSphere(new THREE.Sphere()).radius;

  const issues: AssetIssue[] = [];
  if (triangles > budget.maxTriangles) {
    issues.push({
      severity: 'error',
      code: 'over-triangle-budget',
      message: `Vượt ngân sách tam giác (${triangles} > ${budget.maxTriangles}).`,
      field: 'geometryStats.triangles',
      value: triangles,
      limit: budget.maxTriangles,
    });
  }
  if (meshes > budget.maxDrawCalls) {
    issues.push({
      severity: 'warning',
      code: 'over-drawcall-budget',
      message: `Số mesh (${meshes}) vượt ngân sách draw call (${budget.maxDrawCalls}).`,
      field: 'geometryStats.meshes',
      value: meshes,
      limit: budget.maxDrawCalls,
    });
  }
  if (textureBytes > budget.maxTextureBytes) {
    issues.push({
      severity: 'error',
      code: 'over-texture-memory',
      message: `Bộ nhớ texture vượt ngân sách (${formatBytes(textureBytes)}).`,
      field: 'textures',
      value: textureBytes,
      limit: budget.maxTextureBytes,
    });
  }

  const ratios: Array<{ ratio: number; weight: number }> = [
    { ratio: triangles / budget.maxTriangles, weight: 0.4 },
    { ratio: vertices / budget.maxVertices, weight: 0.25 },
    { ratio: meshes / budget.maxDrawCalls, weight: 0.2 },
    { ratio: materialsUsed.size / budget.maxMaterials, weight: 0.15 },
  ];
  let weighted = 0;
  let totalWeight = 0;
  for (const { ratio, weight } of ratios) {
    weighted += Math.max(0, 1 - ratio) * weight;
    totalWeight += weight;
  }
  const errorPenalty = issues.filter((i) => i.severity === 'error').length * 0.15;
  const score = Math.max(0, Math.min(100, Math.round((weighted / totalWeight) * 100 - errorPenalty * 100)));

  return {
    assetId: scene.name || 'scene',
    format: 'procedural',
    kind: 'geometry',
    category,
    meshes,
    triangles,
    vertices,
    materials: materialsUsed.size,
    bones: 0,
    animations: 0,
    drawCalls: meshes,
    textureBytes,
    vertexBytes,
    totalBytes: textureBytes + vertexBytes,
    sourceBytes: 0,
    boundsSize: [size.x, size.y, size.z],
    boundsRadius: radius,
    score,
    withinBudget: !issues.some((issue) => issue.severity === 'error'),
    issues,
    lodSuggestions: suggestLods(triangles, budget),
    budget,
  };
}

/** Định dạng byte cho người đọc (KB/MB/GB). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Math.round(value * 100) / 100} ${units[unit]}`;
}
