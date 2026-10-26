import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Scaler } from '../src/transformer/scaler.js';
import { PivotAdjuster } from '../src/transformer/pivot-adjuster.js';
import { GeometryOptimizer } from '../src/transformer/geometry-optimizer.js';

describe('Transformer Engine Tests: Scaler & Pivot & Optimizer', () => {
  it('zooms asset to target height while maintaining aspect ratio', () => {
    const geo = new THREE.BoxGeometry(2, 4, 6);
    const mesh = new THREE.Mesh(geo);

    const factor = Scaler.zoomAsset(mesh, { targetHeight: 12 });
    expect(factor).toBeCloseTo(3);
    expect(mesh.scale.x).toBeCloseTo(3);
    expect(mesh.scale.y).toBeCloseTo(3);
    expect(mesh.scale.z).toBeCloseTo(3);
  });

  it('adjusts pivot to bottom so mesh rests on ground level (y=0)', () => {
    const geo = new THREE.BoxGeometry(2, 4, 2);
    const mesh = new THREE.Mesh(geo);
    mesh.position.set(0, 0, 0);

    const wrapper = PivotAdjuster.apply(mesh, { mode: 'bottom' });
    const box = new THREE.Box3().setFromObject(wrapper);

    expect(box.min.y).toBeCloseTo(0, 2);
    expect(box.max.y).toBeCloseTo(4, 2);
  });

  it('adjusts pivot with custom offset', () => {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const mesh = new THREE.Mesh(geo);

    const wrapper = PivotAdjuster.apply(mesh, { mode: 'custom', custom: { x: 1, y: 0, z: 0 } });
    expect(wrapper).toBeDefined();
  });

  it('merges multiple static meshes into a single draw call', () => {
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    m1.position.set(-2, 0, 0);
    const m2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    m2.position.set(2, 0, 0);

    const merged = GeometryOptimizer.mergeMeshes([m1, m2]);
    expect(merged).not.toBeNull();
    expect(merged?.geometry.getAttribute('position').count).toBe(m1.geometry.getAttribute('position').count * 2);
  });
});
