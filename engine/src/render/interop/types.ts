/**
 * @file types.ts
 * @module @aetheria/engine/render/interop/types
 * @description Hợp đồng cầu nối (interop) giữa scene trung tính của engine và
 * các thư viện đồ họa bên ngoài. Engine không phụ thuộc thư viện nào — mỗi cầu
 * nối sinh **descriptor** (JSON/markup/text) theo đúng idiom của thư viện đích;
 * tầng Application của game quyết định cách nạp payload đó.
 */

import type { LibraryAnimationExport } from '../../animation/types.js';
import type { IntermediateScene } from './scene-descriptors.js';

/** Nhóm thư viện theo kiểu tích hợp. */
export type InteropCategory =
  | 'engine'          // Three/Babylon/PlayCanvas/Verge3D — engine 3D đầy đủ
  | 'framework'       // R3F/Threlte/A-Frame — glue layer UI
  | 'webgl-utility'   // OGL/regl/twgl/luma.gl — tiện ích WebGL
  | 'data-viz'        // vtk.js/deck.gl/xeokit/Cesium — dữ liệu/BIM/địa lý
  | 'minimal'         // Zdog — đồ họa tối giản
  | 'native';         // Filament/OSG/OGRE/Babylon Native — native/ngoài trình duyệt

/** Loại payload descriptor. */
export type InteropPayloadKind = 'json' | 'markup' | 'text';

/** Descriptor scene cho một thư viện. */
export interface LibrarySceneExport {
  library: string;
  payloadKind: InteropPayloadKind;
  /** Số mesh/lights/camera đã chuyển (telemetry). */
  counts: { meshes: number; lights: number; hasCamera: boolean };
  payload: unknown;
}

/** Cầu nối một thư viện đồ họa. */
export interface LibraryInterop {
  /** Định danh khớp `animation/library-export.ts` (three, babylon...). */
  id: string;
  /** Tên hiển thị. */
  label: string;
  category: InteropCategory;
  /** Backend đồ họa mà thư viện chạy trên. */
  backends: readonly string[];
  /** Sinh descriptor scene từ bản trung gian (dùng `registry` để chuyển scene thô). */
  buildScene: (scene: IntermediateScene, options?: InteropOptions) => LibrarySceneExport;
  /** Mô tả năng lực (phục vụ UI chọn thư viện). */
  capabilities: readonly string[];
}

/** Tùy chọn chung khi dựng descriptor. */
export interface InteropOptions {
  /** Tên node gốc trong descriptor. */
  rootName?: string;
  /** Gắn thêm metadata tùy ý. */
  metadata?: Record<string, unknown>;
  /** FPS dùng khi xuất hoạt ảnh. */
  fps?: number;
}

/** Kết hợp descriptor scene + hoạt ảnh cho một thư viện. */
export interface FullLibraryExport {
  scene: LibrarySceneExport;
  animation: LibraryAnimationExport | null;
}
