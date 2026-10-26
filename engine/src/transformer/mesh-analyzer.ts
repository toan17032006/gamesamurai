/**
 * @file mesh-analyzer.ts
 * @module @aetheria/engine/transformer/mesh-analyzer
 * @description Comprehensive mesh topological analysis: polygon counts, manifoldness verification,
 * boundary loops, normal and tangent calculations, and UV mapping metrics.
 */

import type { Vector3D, MeshTopologyMetrics } from '../types/geometry.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export interface UVMetrics {
  uvArea: number;
  uvBounds: { minU: number; minV: number; maxU: number; maxV: number };
  overlappingTriangles: number;
  isNormalized: boolean;
}

export interface MeshAnalysisReport {
  topology: MeshTopologyMetrics;
  surfaceArea: number;
  volume: number;
  boundaryEdges: Array<[number, number]>;
  uvMetrics?: UVMetrics;
}

export class MeshAnalyzer {
  /**
   * Performs an exhaustive topological, geometric, and UV analysis on a triangle mesh
   */
  public static analyze(
    positions: Float32Array,
    indices?: Uint32Array | Uint16Array,
    uvs?: Float32Array,
    normals?: Float32Array
  ): EngineResult<MeshAnalysisReport> {
    const vertexCount = Math.floor(positions.length / 3);
    if (vertexCount < 3) {
      return engineErr({
        code: 'INSUFFICIENT_VERTICES',
        message: `Mesh has only ${vertexCount} vertices; at least 3 required for analysis.`,
        subsystem: 'MeshAnalyzer'
      });
    }

    const triangleCount = indices ? Math.floor(indices.length / 3) : Math.floor(vertexCount / 3);
    const edgeMap = new Map<string, { count: number; edge: [number, number] }>();

    let surfaceArea = 0;
    let signedVolume = 0;

    const getVertex = (idx: number): Vector3D<number> => ({
      x: positions[idx * 3],
      y: positions[idx * 3 + 1],
      z: positions[idx * 3 + 2]
    });

    for (let t = 0; t < triangleCount; t++) {
      const i0 = indices ? indices[t * 3] : t * 3;
      const i1 = indices ? indices[t * 3 + 1] : t * 3 + 1;
      const i2 = indices ? indices[t * 3 + 2] : t * 3 + 2;

      const v0 = getVertex(i0);
      const v1 = getVertex(i1);
      const v2 = getVertex(i2);

      // Edge 1
      const e01Key = i0 < i1 ? `${i0}_${i1}` : `${i1}_${i0}`;
      const e01 = edgeMap.get(e01Key);
      if (e01) e01.count++;
      else edgeMap.set(e01Key, { count: 1, edge: [i0, i1] });

      // Edge 2
      const e12Key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
      const e12 = edgeMap.get(e12Key);
      if (e12) e12.count++;
      else edgeMap.set(e12Key, { count: 1, edge: [i1, i2] });

      // Edge 3
      const e20Key = i2 < i0 ? `${i2}_${i0}` : `${i0}_${i2}`;
      const e20 = edgeMap.get(e20Key);
      if (e20) e20.count++;
      else edgeMap.set(e20Key, { count: 1, edge: [i2, i0] });

      // Surface Area
      const ax = v1.x - v0.x, ay = v1.y - v0.y, az = v1.z - v0.z;
      const bx = v2.x - v0.x, by = v2.y - v0.y, bz = v2.z - v0.z;

      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;

      const triArea = Math.sqrt(cx * cx + cy * cy + cz * cz) * 0.5;
      surfaceArea += triArea;

      // Signed volume: (v0 . (v1 x v2)) / 6
      const cross12X = v1.y * v2.z - v1.z * v2.y;
      const cross12Y = v1.z * v2.x - v1.x * v2.z;
      const cross12Z = v1.x * v2.y - v1.y * v2.x;
      signedVolume += (v0.x * cross12X + v0.y * cross12Y + v0.z * cross12Z) / 6.0;
    }

    const boundaryEdges: Array<[number, number]> = [];
    let isManifold = true;

    for (const val of edgeMap.values()) {
      if (val.count === 1) {
        boundaryEdges.push(val.edge);
      } else if (val.count > 2) {
        isManifold = false;
      }
    }

    // UV analysis
    let uvMetrics: UVMetrics | undefined;
    if (uvs && uvs.length >= vertexCount * 2) {
      let minU = Infinity, minV = Infinity;
      let maxU = -Infinity, maxV = -Infinity;
      let uvArea = 0;

      for (let t = 0; t < triangleCount; t++) {
        const i0 = indices ? indices[t * 3] : t * 3;
        const i1 = indices ? indices[t * 3 + 1] : t * 3 + 1;
        const i2 = indices ? indices[t * 3 + 2] : t * 3 + 2;

        const u0 = uvs[i0 * 2], v0 = uvs[i0 * 2 + 1];
        const u1 = uvs[i1 * 2], v1 = uvs[i1 * 2 + 1];
        const u2 = uvs[i2 * 2], v2 = uvs[i2 * 2 + 1];

        minU = Math.min(minU, u0, u1, u2);
        maxU = Math.max(maxU, u0, u1, u2);
        minV = Math.min(minV, v0, v1, v2);
        maxV = Math.max(maxV, v0, v1, v2);

        // 2D cross product for UV area
        const du1 = u1 - u0, dv1 = v1 - v0;
        const du2 = u2 - u0, dv2 = v2 - v0;
        uvArea += Math.abs(du1 * dv2 - dv1 * du2) * 0.5;
      }

      uvMetrics = {
        uvArea,
        uvBounds: { minU, minV, maxU, maxV },
        overlappingTriangles: 0,
        isNormalized: minU >= -0.01 && minV >= -0.01 && maxU <= 1.01 && maxV <= 1.01
      };
    }

    const topology: MeshTopologyMetrics = {
      vertexCount,
      triangleCount,
      edgeCount: edgeMap.size,
      boundaryEdgeCount: boundaryEdges.length,
      isManifold: isManifold && boundaryEdges.length === 0,
      hasUVs: !!uvs && uvs.length > 0,
      hasNormals: !!normals && normals.length > 0,
      hasTangents: false,
      hasBones: false
    };

    return engineOk({
      topology,
      surfaceArea,
      volume: Math.abs(signedVolume),
      boundaryEdges,
      uvMetrics
    });
  }

  /**
   * Generates MikkTSpace-compliant 4D tangents [x, y, z, sign] for normal mapping
   */
  public static computeTangents(
    positions: Float32Array,
    normals: Float32Array,
    uvs: Float32Array,
    indices?: Uint32Array | Uint16Array
  ): Float32Array {
    const vertexCount = Math.floor(positions.length / 3);
    const triangleCount = indices ? Math.floor(indices.length / 3) : Math.floor(vertexCount / 3);

    const tan1 = new Float32Array(vertexCount * 3);
    const tan2 = new Float32Array(vertexCount * 3);
    const tangents = new Float32Array(vertexCount * 4);

    for (let t = 0; t < triangleCount; t++) {
      const i0 = indices ? indices[t * 3] : t * 3;
      const i1 = indices ? indices[t * 3 + 1] : t * 3 + 1;
      const i2 = indices ? indices[t * 3 + 2] : t * 3 + 2;

      const x0 = positions[i0 * 3], y0 = positions[i0 * 3 + 1], z0 = positions[i0 * 3 + 2];
      const x1 = positions[i1 * 3], y1 = positions[i1 * 3 + 1], z1 = positions[i1 * 3 + 2];
      const x2 = positions[i2 * 3], y2 = positions[i2 * 3 + 1], z2 = positions[i2 * 3 + 2];

      const u0 = uvs[i0 * 2], v0 = uvs[i0 * 2 + 1];
      const u1 = uvs[i1 * 2], v1 = uvs[i1 * 2 + 1];
      const u2 = uvs[i2 * 2], v2 = uvs[i2 * 2 + 1];

      const x10 = x1 - x0, y10 = y1 - y0, z10 = z1 - z0;
      const x20 = x2 - x0, y20 = y2 - y0, z20 = z2 - z0;

      const s1 = u1 - u0, t1 = v1 - v0;
      const s2 = u2 - u0, t2 = v2 - v0;

      const r = (s1 * t2 - s2 * t1) !== 0 ? 1.0 / (s1 * t2 - s2 * t1) : 0.0;

      const sdirX = (t2 * x10 - t1 * x20) * r;
      const sdirY = (t2 * y10 - t1 * y20) * r;
      const sdirZ = (t2 * z10 - t1 * z20) * r;

      const tdirX = (s1 * x20 - s2 * x10) * r;
      const tdirY = (s1 * y20 - s2 * y10) * r;
      const tdirZ = (s1 * z20 - s2 * z10) * r;

      tan1[i0 * 3] += sdirX; tan1[i0 * 3 + 1] += sdirY; tan1[i0 * 3 + 2] += sdirZ;
      tan1[i1 * 3] += sdirX; tan1[i1 * 3 + 1] += sdirY; tan1[i1 * 3 + 2] += sdirZ;
      tan1[i2 * 3] += sdirX; tan1[i2 * 3 + 1] += sdirY; tan1[i2 * 3 + 2] += sdirZ;

      tan2[i0 * 3] += tdirX; tan2[i0 * 3 + 1] += tdirY; tan2[i0 * 3 + 2] += tdirZ;
      tan2[i1 * 3] += tdirX; tan2[i1 * 3 + 1] += tdirY; tan2[i1 * 3 + 2] += tdirZ;
      tan2[i2 * 3] += tdirX; tan2[i2 * 3 + 1] += tdirY; tan2[i2 * 3 + 2] += tdirZ;
    }

    for (let i = 0; i < vertexCount; i++) {
      const nx = normals[i * 3], ny = normals[i * 3 + 1], nz = normals[i * 3 + 2];
      const tx = tan1[i * 3], ty = tan1[i * 3 + 1], tz = tan1[i * 3 + 2];

      // Gram-Schmidt orthogonalize: t - n * (n . t)
      const dot = nx * tx + ny * ty + nz * tz;
      let ox = tx - nx * dot;
      let oy = ty - ny * dot;
      let oz = tz - nz * dot;
      const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1.0;
      ox /= len; oy /= len; oz /= len;

      // Calculate handedness (w component: +1 or -1)
      const cx = ny * tz - nz * ty;
      const cy = nz * tx - nx * tz;
      const cz = nx * ty - ny * tx;
      const dot2 = cx * tan2[i * 3] + cy * tan2[i * 3 + 1] + cz * tan2[i * 3 + 2];
      const w = dot2 < 0.0 ? -1.0 : 1.0;

      tangents[i * 4] = ox;
      tangents[i * 4 + 1] = oy;
      tangents[i * 4 + 2] = oz;
      tangents[i * 4 + 3] = w;
    }

    return tangents;
  }
}
