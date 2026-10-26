import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { parseObj, parseMtl } from '../src/asset-parser/obj-parser.js';
import { Scaler } from '../src/transformer/scaler.js';

describe('OBJ & MTL Parser Engine Tests', () => {
  it('parses valid Wavefront OBJ into THREE.Mesh with vertices and normals', () => {
    const sampleObj = `
# Sample Cube OBJ
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v -1.0 1.0 1.0
v 1.0 1.0 1.0
vn 0.0 0.0 1.0
vt 0.0 0.0
vt 1.0 0.0
vt 0.0 1.0
vt 1.0 1.0
f 1/1/1 2/2/1 3/3/1
f 2/2/1 4/4/1 3/3/1
`;

    const model = parseObj(sampleObj, { name: 'TestCube' });
    expect(model).toBeInstanceOf(THREE.Object3D);

    let meshFound: THREE.Mesh | null = null;
    model.traverse((c) => {
      if (c instanceof THREE.Mesh) meshFound = c;
    });

    expect(meshFound).not.toBeNull();
    const geo = meshFound!.geometry;
    expect(geo.getAttribute('position').count).toBe(6); // 2 triangles = 6 vertices
  });

  it('parses MTL material and assigns colors', () => {
    const sampleMtl = `
newmtl RedMaterial
Kd 1.0000 0.2000 0.2000
Ks 0.5000 0.5000 0.5000
Ns 100.0
d 1.0
`;
    const materials = parseMtl(sampleMtl);
    expect(materials.has('RedMaterial')).toBe(true);

    const mat = materials.get('RedMaterial') as THREE.MeshStandardMaterial;
    expect(mat).toBeDefined();
    expect(mat.color.r).toBeCloseTo(1.0);
    expect(mat.color.g).toBeCloseTo(0.2);
  });

  it('correctly scales and zooms loaded OBJ mesh', () => {
    const sampleObj = `
v 0 0 0
v 2 0 0
v 0 4 0
f 1 2 3
`;
    const model = parseObj(sampleObj);
    const originalHeight = 4;

    const zoomFactor = Scaler.zoomAsset(model, { targetHeight: 8 });
    expect(zoomFactor).toBeCloseTo(2.0);

    const box = new THREE.Box3().setFromObject(model);
    const newHeight = box.max.y - box.min.y;
    expect(newHeight).toBeCloseTo(8.0);
  });
});
