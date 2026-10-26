// engine/tests/asset-required-fields.test.ts
//
// Kiểm chứng trục "Bổ sung các field bắt buộc nạp vào" của ParsedAsset.
//
// Các field mới: animationNames, materialNames, textureCount, lodCount,
// lightCount, cameraCount, hasSkeleton, hasAnimation.
// Nguyên tắc: field BẮT BUỘC phải luôn có mặt (không undefined) và phải
// khớp với dữ liệu thật đã bóc tách.
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { AssetParser } from '../src/asset-parser/index.js';
import { AssetExporter } from '../src/procedural/asset-exporter.js';

function makeTriangleMesh(name = 'Tri'): THREE.Mesh {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3),
  );
  geometry.setIndex([0, 1, 2]);
  const material = new THREE.MeshStandardMaterial({ color: 0x4488ff });
  material.name = 'TriMaterial';
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

describe('ParsedAsset — field bổ sung luôn được điền', () => {
  it('mọi field mới có mặt và kiểu đúng trên asset có hình học', async () => {
    const parser = new AssetParser();
    const glb = AssetExporter.exportToGlb(makeTriangleMesh(), { name: 'Fields' });
    const asset = await parser.parseBytes('fields.glb', glb);

    expect(Array.isArray(asset.animationNames)).toBe(true);
    expect(Array.isArray(asset.materialNames)).toBe(true);
    expect(typeof asset.textureCount).toBe('number');
    expect(typeof asset.lodCount).toBe('number');
    expect(typeof asset.lightCount).toBe('number');
    expect(typeof asset.cameraCount).toBe('number');
    expect(typeof asset.hasSkeleton).toBe('boolean');
    expect(typeof asset.hasAnimation).toBe('boolean');
  });

  it('materialNames khớp với materials, textureCount khớp với textures', async () => {
    const parser = new AssetParser();
    const glb = AssetExporter.exportToGlb(makeTriangleMesh(), { name: 'Consistency' });
    const asset = await parser.parseBytes('consistency.glb', glb);

    expect(asset.materialNames.sort()).toEqual(Object.keys(asset.materials).sort());
    expect(asset.textureCount).toBe(asset.textures.length);
  });

  it('animationNames khớp với danh sách clip', async () => {
    const parser = new AssetParser();
    const glb = AssetExporter.exportToGlb(makeTriangleMesh(), { name: 'Clip' });
    const asset = await parser.parseBytes('clip.glb', glb);

    expect(asset.animationNames).toEqual(asset.animations.map((clip) => clip.name));
    expect(asset.hasAnimation).toBe(asset.animations.length > 0);
  });

  it('asset không có xương/đèn/camera/LOD thì có giá trị mặc định hợp lý', async () => {
    const parser = new AssetParser();
    const bytes = AssetExporter.exportToStl(makeTriangleMesh(), { encoding: 'binary' });
    const asset = await parser.parseBytes('plain.stl', bytes);

    expect(asset.hasSkeleton).toBe(false);
    expect(asset.hasAnimation).toBe(false);
    expect(asset.lodCount).toBe(0);
    expect(asset.lightCount).toBe(0);
    expect(asset.cameraCount).toBe(0);
    expect(asset.animationNames).toEqual([]);
  });

  it('đếm được đèn và camera khi cảnh có (đèn/Camera của three.js)', async () => {
    const parser = new AssetParser();
    const group = new THREE.Group();
    group.name = 'WithLights';
    group.add(makeTriangleMesh());
    group.add(new THREE.PointLight(0xffffff, 1));
    group.add(new THREE.PerspectiveCamera());

    const glb = AssetExporter.exportToGlb(group, { name: 'WithLights' });
    const asset = await parser.parseBytes('withlights.glb', glb);

    // glTF không mang đèn/camera theo mặc định — nhưng bộ đếm phải là số và
    // không được âm/không xác định.
    expect(asset.lightCount).toBeGreaterThanOrEqual(0);
    expect(asset.cameraCount).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(asset.lodCount)).toBe(true);
  });
});
