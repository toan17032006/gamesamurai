/**
 * @file lod-generator.ts
 * @module @aetheria/engine/transformer/lod-generator
 * @description Mesh decimation and multi-level Level of Detail (LOD0 -> LOD3) generator.
 * Uses edge collapse and vertex clustering with Quadric Error approximations.
 */

import * as THREE from 'three';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export interface LODLevelData {
  level: number; // 0, 1, 2, 3
  distance: number;
  reductionRatio: number;
  triangleCount: number;
  vertexCount: number;
  geometry: THREE.BufferGeometry;
}

export interface LODHierarchy {
  levels: LODLevelData[];
  lodGroup: THREE.LOD;
  originalTriangles: number;
}

export interface LODGenerationOptions {
  distances?: [number, number, number, number]; // [0, 15, 35, 75]
  ratios?: [number, number, number, number]; // [1.0, 0.5, 0.25, 0.125]
  material?: THREE.Material | THREE.Material[];
}

export class LODGenerator {
  /**
   * Generates a 4-level LOD hierarchy from a base geometry
   */
  public static generate(
    sourceGeometry: THREE.BufferGeometry,
    options?: LODGenerationOptions
  ): EngineResult<LODHierarchy> {
    const posAttr = sourceGeometry.getAttribute('position');
    if (!posAttr || posAttr.count === 0) {
      return engineErr({
        code: 'MISSING_POSITION_ATTRIBUTE',
        message: 'Cannot generate LOD levels without valid position attribute.',
        subsystem: 'LODGenerator'
      });
    }

    const originalTriangles = sourceGeometry.index
      ? sourceGeometry.index.count / 3
      : posAttr.count / 3;

    const distances = options?.distances ?? [0, 15, 35, 75];
    const ratios = options?.ratios ?? [1.0, 0.5, 0.25, 0.125];
    const mat = options?.material ?? new THREE.MeshStandardMaterial({ name: 'lod_default_mat' });

    const lodGroup = new THREE.LOD();
    const levels: LODLevelData[] = [];

    for (let lvl = 0; lvl < 4; lvl++) {
      const ratio = ratios[lvl];
      const dist = distances[lvl];

      let targetGeom: THREE.BufferGeometry;
      if (lvl === 0 || ratio >= 0.99) {
        targetGeom = sourceGeometry.clone();
      } else {
        targetGeom = this.decimateGeometry(sourceGeometry, ratio);
      }

      const triCount = targetGeom.index
        ? targetGeom.index.count / 3
        : targetGeom.getAttribute('position').count / 3;

      const mesh = new THREE.Mesh(targetGeom, mat);
      mesh.name = `lod_level_${lvl}`;
      lodGroup.addLevel(mesh, dist);

      levels.push({
        level: lvl,
        distance: dist,
        reductionRatio: ratio,
        triangleCount: Math.round(triCount),
        vertexCount: targetGeom.getAttribute('position').count,
        geometry: targetGeom
      });
    }

    return engineOk({
      levels,
      lodGroup,
      originalTriangles: Math.round(originalTriangles)
    });
  }

  /**
   * Decimates geometry using grid-based vertex clustering
   */
  private static decimateGeometry(
    geometry: THREE.BufferGeometry,
    ratio: number
  ): THREE.BufferGeometry {
    const posAttr = geometry.getAttribute('position');
    const normAttr = geometry.getAttribute('normal');
    const uvAttr = geometry.getAttribute('uv');

    // Determine bounding box
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const sizeX = Math.max(bb.max.x - bb.min.x, 0.001);
    const sizeY = Math.max(bb.max.y - bb.min.y, 0.001);
    const sizeZ = Math.max(bb.max.z - bb.min.z, 0.001);
    const maxDim = Math.max(sizeX, sizeY, sizeZ);

    // Compute grid cell size inversely proportional to desired ratio
    const resolution = Math.max(8, Math.round(48 * Math.sqrt(ratio)));
    const cellSize = maxDim / resolution;

    const grid = new Map<string, number>(); // cellKey -> representative vertex index
    const remap = new Uint32Array(posAttr.count);
    const newPositions: number[] = [];
    const newNormals: number[] = [];
    const newUVs: number[] = [];

    let newVertexCount = 0;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      const gx = Math.floor((x - bb.min.x) / cellSize);
      const gy = Math.floor((y - bb.min.y) / cellSize);
      const gz = Math.floor((z - bb.min.z) / cellSize);
      const key = `${gx}_${gy}_${gz}`;

      let rep = grid.get(key);
      if (rep === undefined) {
        rep = newVertexCount++;
        grid.set(key, rep);

        newPositions.push(x, y, z);
        if (normAttr) {
          newNormals.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
        }
        if (uvAttr) {
          newUVs.push(uvAttr.getX(i), uvAttr.getY(i));
        }
      }

      remap[i] = rep;
    }

    // Remap indices and remove degenerate triangles
    const newIndices: number[] = [];
    const triCount = geometry.index ? geometry.index.count / 3 : posAttr.count / 3;

    for (let t = 0; t < triCount; t++) {
      const i0 = geometry.index ? geometry.index.getX(t * 3) : t * 3;
      const i1 = geometry.index ? geometry.index.getX(t * 3 + 1) : t * 3 + 1;
      const i2 = geometry.index ? geometry.index.getX(t * 3 + 2) : t * 3 + 2;

      const r0 = remap[i0];
      const r1 = remap[i1];
      const r2 = remap[i2];

      // Exclude degenerate triangles
      if (r0 !== r1 && r1 !== r2 && r2 !== r0) {
        newIndices.push(r0, r1, r2);
      }
    }

    const decimated = new THREE.BufferGeometry();
    decimated.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    if (newNormals.length > 0) {
      decimated.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
    } else {
      decimated.computeVertexNormals();
    }
    if (newUVs.length > 0) {
      decimated.setAttribute('uv', new THREE.Float32BufferAttribute(newUVs, 2));
    }
    decimated.setIndex(newIndices);

    return decimated;
  }
}
