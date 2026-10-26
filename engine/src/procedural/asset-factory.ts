/**
 * @file asset-factory.ts
 * @module @aetheria/engine/procedural/asset-factory
 * @description Tạo tài sản 3D hoàn chỉnh và xuất ra nhiều định dạng.
 *
 * `AssetFactory` là lớp trên cùng cho pipeline "tạo asset": dựng scene từ
 * đặc tả → gắn vật liệu → xuất ra định dạng mà Engine bóc tách được, nên vòng
 * lặp create → export → parse luôn khép kín.
 */

import * as THREE from 'three';
import { AssetExporter } from './asset-exporter.js';
import type { AssetFormat } from '../types/asset.types.js';

/** Định dạng mà `AssetFactory` có thể xuất ra. */
export type ExportableFormat = 'glb' | 'gltf' | 'obj' | 'mtl' | 'stl' | 'ply' | 'usda' | 'bvh';

export interface AssetPartSpec {
  /** Loại khối hình học. */
  shape: 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule' | 'plane' | 'torus';
  /** Kích thước theo từng trục. */
  size?: [number, number, number];
  /** Vị trí tương đối so với gốc asset. */
  position?: [number, number, number];
  /** Góc xoay (độ). */
  rotation?: [number, number, number];
  /** Màu sRGB (0xRRGGBB). */
  color?: number;
  /** Độ nhám vật liệu (0..1). */
  roughness?: number;
  /** Độ kim loại (0..1). */
  metalness?: number;
  /** Tên part — cũng là tên node khi xuất. */
  name?: string;
}

export interface AssetSpec {
  /** Tên asset (dùng làm tên node gốc và tên tệp khi xuất). */
  name: string;
  /** Các part cấu thành asset. */
  parts: AssetPartSpec[];
  /** Tỷ lệ chung cho toàn asset. */
  scale?: number;
  /** Tên vật liệu dùng chung cho mọi part (mặc định lấy từ part đầu). */
  materialName?: string;
}

export interface CreatedAsset {
  /** Scene đã dựng. */
  root: THREE.Group;
  /** Tổng số mesh trong asset. */
  meshCount: number;
  /** Tổng số tam giác. */
  triangleCount: number;
  /** Kích thước giới hạn của asset. */
  bounds: { min: THREE.Vector3; max: THREE.Vector3; size: THREE.Vector3 };
}

export interface ExportResult {
  format: ExportableFormat;
  /** Tệp nhị phân (glb, stl, ply). */
  bytes?: Uint8Array;
  /** Tệp văn bản (gltf, obj, usda, bvh). */
  text?: string;
  /** Vật liệu đi kèm (chỉ với obj). */
  mtl?: string;
  /** Phần mở rộng tệp đề xuất. */
  extension: string;
}

/** Tạo geometry theo loại part. */
function buildGeometry(shape: AssetPartSpec['shape'], size: [number, number, number]): THREE.BufferGeometry {
  const [w, h, d] = size;
  switch (shape) {
    case 'box':
      return new THREE.BoxGeometry(w, h, d);
    case 'sphere':
      return new THREE.SphereGeometry(w / 2, 24, 16);
    case 'cylinder':
      return new THREE.CylinderGeometry(w / 2, w / 2, h, 20);
    case 'cone':
      return new THREE.ConeGeometry(w / 2, h, 20);
    case 'capsule':
      return new THREE.CapsuleGeometry(w / 2, Math.max(h - w, 0.001), 6, 16);
    case 'plane':
      return new THREE.PlaneGeometry(w, h, 1, 1);
    case 'torus':
      return new THREE.TorusGeometry(w / 2, d / 2, 12, 24);
    default:
      return new THREE.BoxGeometry(w, h, d);
  }
}

export class AssetFactory {
  /**
   * Dựng asset từ đặc tả part.
   */
  public static create(spec: AssetSpec): CreatedAsset {
    const root = new THREE.Group();
    root.name = spec.name;

    const scale = spec.scale ?? 1;
    root.scale.setScalar(scale);

    let meshCount = 0;
    let triangleCount = 0;

    spec.parts.forEach((part, index) => {
      const size = part.size ?? [1, 1, 1];
      const geometry = buildGeometry(part.shape, size);

      const material = new THREE.MeshStandardMaterial({
        name: spec.materialName ?? `${spec.name}_Material`,
        color: part.color ?? 0x9aa4b2,
        roughness: part.roughness ?? 0.7,
        metalness: part.metalness ?? 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = part.name ?? `Part_${index}`;
      if (part.position) mesh.position.set(part.position[0], part.position[1], part.position[2]);
      if (part.rotation) {
        mesh.rotation.set(
          THREE.MathUtils.degToRad(part.rotation[0]),
          THREE.MathUtils.degToRad(part.rotation[1]),
          THREE.MathUtils.degToRad(part.rotation[2]),
        );
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      root.add(mesh);
      meshCount++;

      const indexAttr = geometry.getIndex();
      const posAttr = geometry.getAttribute('position');
      triangleCount += indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
    });

    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);

    return {
      root,
      meshCount,
      triangleCount,
      bounds: { min: box.min, max: box.max, size: box.getSize(new THREE.Vector3()) },
    };
  }

  /**
   * Xuất asset ra định dạng chỉ định.
   *
   * Mọi định dạng trả về đều đọc lại được bằng `AssetParser` của Engine.
   */
  public static export(root: THREE.Object3D, format: ExportableFormat, name?: string): ExportResult {
    const assetName = name ?? root.name ?? 'Asset';

    switch (format) {
      case 'glb':
        return { format, bytes: AssetExporter.exportToGlb(root, { name: assetName }), extension: 'glb' };
      case 'gltf': {
        const doc = AssetExporter.exportToGltf(root, { name: assetName });
        return { format, text: JSON.stringify(doc, null, 2), extension: 'gltf' };
      }
      case 'obj': {
        const { obj, mtl } = AssetExporter.exportToObj(root, { name: assetName });
        return { format, text: obj, mtl, extension: 'obj' };
      }
      case 'mtl': {
        return { format, text: AssetExporter.exportToMtl(root, { name: assetName }), extension: 'mtl' };
      }
      case 'stl':
        return { format, bytes: AssetExporter.exportToStl(root, { name: assetName }), extension: 'stl' };
      case 'ply':
        return { format, bytes: AssetExporter.exportToPly(root, { name: assetName }), extension: 'ply' };
      case 'usda':
        return { format, text: AssetExporter.exportToUsda(root, { name: assetName }), extension: 'usda' };
      case 'bvh':
        return { format, text: AssetExporter.exportToBvh(root, { name: assetName }), extension: 'bvh' };
      default: {
        const exhaustive: never = format;
        throw new Error(`AssetFactory: định dạng xuất không hỗ trợ "${String(exhaustive)}"`);
      }
    }
  }

  /**
   * Tạo asset rồi xuất ngay — tiện cho pipeline sinh tài sản hàng loạt.
   */
  public static createAndExport(spec: AssetSpec, format: ExportableFormat): ExportResult {
    const created = AssetFactory.create(spec);
    return AssetFactory.export(created.root, format, spec.name);
  }

  /** Các định dạng có thể xuất. */
  public static exportableFormats(): ExportableFormat[] {
    return ['glb', 'gltf', 'obj', 'mtl', 'stl', 'ply', 'usda', 'bvh'];
  }

  /** Ánh xạ định dạng AssetFormat của Engine sang định dạng xuất được. */
  public static exportFormatFor(format: AssetFormat): ExportableFormat | null {
    switch (format) {
      case 'glb':
        return 'glb';
      case 'gltf':
        return 'gltf';
      case 'obj':
        return 'obj';
      case 'mtl':
        return 'mtl';
      case 'stl':
        return 'stl';
      case 'ply':
        return 'ply';
      case 'usd':
      case 'usda':
      case 'usdc':
        return 'usda';
      case 'bvh':
        return 'bvh';
      default:
        return null;
    }
  }
}
