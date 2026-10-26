/**
 * @file asset-designer.ts
 * @module @aetheria/engine/procedural/asset-designer
 * @description Thiết kế tài sản 3D từ đặc tả và kiểm định kết quả.
 *
 * `AssetFactory` dựng hình học theo đặc tả; `AssetDesigner` bổ sung phần
 * **thiết kế**: chuẩn hoá kích thước theo yêu cầu, phân tích ngay kết quả và
 * đề xuất điều chỉnh cụ thể khi vượt ngân sách hiệu năng.
 *
 * Vòng khép kín: đặc tả → dựng → cân kích thước → phân tích → đề xuất sửa.
 */

import * as THREE from 'three';
import { AssetFactory } from './asset-factory.js';
import type { AssetPartSpec } from './asset-factory.js';
import {
  analyzeScene,
  formatBytes,
  DEFAULT_BUDGETS,
} from '../asset-parser/asset-analyzer.js';
import type {
  AssetAnalysisReport,
  AssetBudget,
  AssetIssue,
} from '../asset-parser/asset-analyzer.js';
import type { AssetCategory } from '../types/asset.types.js';

/** Một phần của tài sản trong đặc tả thiết kế. */
export interface AssetDesignPart extends AssetPartSpec {
  /** Tên phần — cũng là tên node khi dựng. */
  name: string;
}

/** Đặc tả thiết kế tài sản. */
export interface AssetDesignSpec {
  /** Tên tài sản. */
  name: string;
  /** Nhóm tài sản — quyết định ngân sách áp dụng. */
  category: AssetCategory;
  /** Các phần cấu thành. */
  parts: AssetDesignPart[];
  /**
   * Kích thước tổng thể mong muốn (đơn vị scene).
   * Tài sản được cân lại cho khớp — giúp asset vào game đúng tỉ lệ.
   */
  targetSize?: [number, number, number];
  /** Tỷ lệ chung (chỉ dùng khi không có `targetSize`). */
  scale?: number;
  /** Tên vật liệu dùng chung. */
  materialName?: string;
  /** Ngân sách dùng để kiểm định (mặc định lấy theo nhóm tài sản). */
  budget?: AssetBudget;
}

/** Kết quả thiết kế. */
export interface AssetDesignResult {
  /** Cây tài sản đã dựng. */
  root: THREE.Group;
  /** Báo cáo phân tích của chính tài sản vừa dựng. */
  report: AssetAnalysisReport;
  /** Tài sản có đạt ngân sách không. */
  valid: boolean;
  /** Các đề xuất điều chỉnh cụ thể (rỗng khi đã đạt). */
  adjustments: string[];
}

/**
 * Thiết kế một tài sản từ đặc tả.
 *
 * @param spec - đặc tả thiết kế
 */
export function designAsset(spec: AssetDesignSpec): AssetDesignResult {
  const budget = spec.budget ?? DEFAULT_BUDGETS[spec.category] ?? DEFAULT_BUDGETS.misc;

  // ---- 1. Dựng hình học --------------------------------------------------
  const created = AssetFactory.create({
    name: spec.name,
    parts: spec.parts.map((part) => ({
      shape: part.shape,
      size: part.size,
      position: part.position,
      rotation: part.rotation,
      color: part.color,
      roughness: part.roughness,
      metalness: part.metalness,
      name: part.name,
    })),
    scale: spec.scale ?? 1,
    materialName: spec.materialName,
  });

  const root = created.root;

  // ---- 2. Cân kích thước theo yêu cầu ----------------------------------
  if (spec.targetSize) {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());

    // Cân theo cạnh lớn nhất để giữ tỉ lệ (không méo asset).
    const largest = Math.max(size.x, size.y, size.z);
    const targetLargest = Math.max(...spec.targetSize);
    if (largest > 1e-6 && targetLargest > 0) {
      const factor = targetLargest / largest;
      root.scale.multiplyScalar(factor);
      root.updateMatrixWorld(true);
    }
  }

  // ---- 3. Phân tích ------------------------------------------------------
  const report = analyzeScene(root, spec.category, { budget });

  // ---- 4. Đề xuất điều chỉnh ---------------------------------------------
  const adjustments: string[] = [];
  for (const issue of report.issues) {
    const suggestion = suggestAdjustment(issue, report, budget);
    if (suggestion) adjustments.push(suggestion);
  }
  if (report.lodSuggestions.length > 0) {
    adjustments.push(
      `Thêm ${report.lodSuggestions.length} bậc LOD (mục tiêu tam giác: ${report.lodSuggestions
        .map((lod) => lod.targetTriangles)
        .join(' → ')}).`,
    );
  }

  return {
    root,
    report,
    valid: report.withinBudget,
    adjustments,
  };
}

/** Sinh đề xuất điều chỉnh cụ thể cho một phát hiện. */
function suggestAdjustment(
  issue: AssetIssue,
  report: AssetAnalysisReport,
  budget: AssetBudget,
): string | undefined {
  switch (issue.code) {
    case 'over-triangle-budget': {
      const excess = report.triangles - budget.maxTriangles;
      const ratio = Math.round((budget.maxTriangles / report.triangles) * 100);
      return `Giảm tam giác: đang có ${report.triangles}, cần ≤ ${budget.maxTriangles} (giảm ~${ratio}%, tức ${excess} tam giác). Giảm số lưới của hình học tròn hoặc tách chi tiết sang LOD.`;
    }
    case 'over-vertex-budget':
      return `Giảm đỉnh: đang có ${report.vertices}, cần ≤ ${budget.maxVertices}.`;
    case 'over-drawcall-budget':
      return `Gộp mesh: ${report.meshes} mesh vượt ngân sách ${budget.maxDrawCalls}. Gộp các mesh tĩnh theo vật liệu.`;
    case 'over-material-budget':
      return `Giảm vật liệu: ${report.materials} vượt ngân sách ${budget.maxMaterials}. Dùng chung atlas hoặc giảm số vật liệu.`;
    case 'over-texture-memory':
      return `Giảm texture: đang dùng ${formatBytes(report.textureBytes)}, cần ≤ ${formatBytes(budget.maxTextureBytes)}. Nén hoặc giảm kích thước.`;
    case 'over-bone-budget':
      return `Giảm xương: ${report.bones} vượt ngân sách ${budget.maxBones}.`;
    case 'mesh-without-material':
      return 'Gán vật liệu cho các mesh còn trống — hiện chúng vẽ bằng vật liệu mặc định.';
    default:
      return undefined;
  }
}

/**
 * Thiết kế và xuất tài sản trong một lệnh.
 *
 * @param spec - đặc tả thiết kế
 * @param format - định dạng xuất ra
 */
export function designAndExport(
  spec: AssetDesignSpec,
  format: Parameters<typeof AssetFactory.export>[1],
) {
  const designed = designAsset(spec);
  return {
    ...designed,
    exported: AssetFactory.export(designed.root, format, spec.name),
  };
}
