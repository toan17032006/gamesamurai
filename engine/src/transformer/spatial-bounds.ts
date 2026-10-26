/**
 * @file spatial-bounds.ts
 * @module @aetheria/engine/transformer/spatial-bounds
 * @description High-precision spatial bounds computation: AABB, OBB (PCA Covariance), Bounding Sphere (Ritter),
 * Bounding Capsule, and Center of Mass with volume and surface area metrics.
 */

import type { Vector3D } from '../types/geometry.types.js';
import type { AABB, OBB, BoundingSphere, BoundingCapsule, SpatialBoundsReport } from '../types/spatial.types.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';

export class SpatialBoundsCalculator {
  /**
   * Computes comprehensive spatial bounds from vertex positions
   */
  public static computeFromPositions(
    positions: Float32Array | number[]
  ): EngineResult<SpatialBoundsReport> {
    const vertexCount = Math.floor(positions.length / 3);
    if (vertexCount === 0) {
      return engineErr({
        code: 'EMPTY_POSITIONS_ARRAY',
        message: 'Cannot compute spatial bounds from empty positions array.',
        subsystem: 'SpatialBoundsCalculator'
      });
    }

    // 1. Compute AABB & Center of Mass (Mean)
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let sumX = 0, sumY = 0, sumZ = 0;

    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;

      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;

      sumX += x;
      sumY += y;
      sumZ += z;
    }

    const meanX = sumX / vertexCount;
    const meanY = sumY / vertexCount;
    const meanZ = sumZ / vertexCount;
    const centerOfMass: Vector3D<number> = { x: meanX, y: meanY, z: meanZ };

    const aabb: AABB<number> = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ }
    };

    const dimX = maxX - minX;
    const dimY = maxY - minY;
    const dimZ = maxZ - minZ;
    const dimensions: Vector3D<number> = { x: dimX, y: dimY, z: dimZ };

    // 2. Ritter's Bounding Sphere
    // Pass 1: Find point p1 furthest from mean
    let maxDistSq = 0;
    let p1Idx = 0;
    for (let i = 0; i < vertexCount; i++) {
      const dx = positions[i * 3] - meanX;
      const dy = positions[i * 3 + 1] - meanY;
      const dz = positions[i * 3 + 2] - meanZ;
      const dSq = dx * dx + dy * dy + dz * dz;
      if (dSq > maxDistSq) {
        maxDistSq = dSq;
        p1Idx = i;
      }
    }

    // Pass 2: Find point p2 furthest from p1
    const p1X = positions[p1Idx * 3];
    const p1Y = positions[p1Idx * 3 + 1];
    const p1Z = positions[p1Idx * 3 + 2];
    maxDistSq = 0;
    let p2Idx = 0;
    for (let i = 0; i < vertexCount; i++) {
      const dx = positions[i * 3] - p1X;
      const dy = positions[i * 3 + 1] - p1Y;
      const dz = positions[i * 3 + 2] - p1Z;
      const dSq = dx * dx + dy * dy + dz * dz;
      if (dSq > maxDistSq) {
        maxDistSq = dSq;
        p2Idx = i;
      }
    }

    // Initial sphere centered at midpoint of p1 and p2
    const p2X = positions[p2Idx * 3];
    const p2Y = positions[p2Idx * 3 + 1];
    const p2Z = positions[p2Idx * 3 + 2];

    let sCenterX = (p1X + p2X) * 0.5;
    let sCenterY = (p1Y + p2Y) * 0.5;
    let sCenterZ = (p1Z + p2Z) * 0.5;
    let sRadius = Math.sqrt(maxDistSq) * 0.5;

    // Pass 3: Expand sphere for remaining points
    for (let i = 0; i < vertexCount; i++) {
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];

      const dx = px - sCenterX;
      const dy = py - sCenterY;
      const dz = pz - sCenterZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > sRadius) {
        const newRadius = (sRadius + dist) * 0.5;
        const k = (newRadius - sRadius) / dist;
        sRadius = newRadius;
        sCenterX += dx * k;
        sCenterY += dy * k;
        sCenterZ += dz * k;
      }
    }

    const sphere: BoundingSphere<number> = {
      center: { x: sCenterX, y: sCenterY, z: sCenterZ },
      radius: sRadius
    };

    // 3. Principal Component Analysis (Covariance) for OBB
    let cXX = 0, cXY = 0, cXZ = 0;
    let cYY = 0, cYZ = 0, cZZ = 0;

    for (let i = 0; i < vertexCount; i++) {
      const rx = positions[i * 3] - meanX;
      const ry = positions[i * 3 + 1] - meanY;
      const rz = positions[i * 3 + 2] - meanZ;

      cXX += rx * rx;
      cXY += rx * ry;
      cXZ += rx * rz;
      cYY += ry * ry;
      cYZ += ry * rz;
      cZZ += rz * rz;
    }

    const invN = 1 / vertexCount;
    cXX *= invN; cXY *= invN; cXZ *= invN;
    cYY *= invN; cYZ *= invN; cZZ *= invN;

    // Approximate principal axes: fallback to standard coordinate frame or dominant dimensions
    let axisX: Vector3D<number> = { x: 1, y: 0, z: 0 };
    let axisY: Vector3D<number> = { x: 0, y: 1, z: 0 };
    let axisZ: Vector3D<number> = { x: 0, y: 0, z: 1 };

    if (Math.abs(cXY) > 1e-4 || Math.abs(cXZ) > 1e-4 || Math.abs(cYZ) > 1e-4) {
      // Gram-Schmidt orthogonalized covariance vector
      let v1X = cXX, v1Y = cXY, v1Z = cXZ;
      const len1 = Math.sqrt(v1X * v1X + v1Y * v1Y + v1Z * v1Z) || 1;
      axisX = { x: v1X / len1, y: v1Y / len1, z: v1Z / len1 };

      let v2X = cXY, v2Y = cYY, v2Z = cYZ;
      const dot = v2X * axisX.x + v2Y * axisX.y + v2Z * axisX.z;
      v2X -= dot * axisX.x;
      v2Y -= dot * axisX.y;
      v2Z -= dot * axisX.z;
      const len2 = Math.sqrt(v2X * v2X + v2Y * v2Y + v2Z * v2Z) || 1;
      axisY = { x: v2X / len2, y: v2Y / len2, z: v2Z / len2 };

      // Cross product axisX x axisY
      axisZ = {
        x: axisX.y * axisY.z - axisX.z * axisY.y,
        y: axisX.z * axisY.x - axisX.x * axisY.z,
        z: axisX.x * axisY.y - axisX.y * axisY.x
      };
    }

    // Project points onto OBB axes to find extents
    let obbMinX = Infinity, obbMaxX = -Infinity;
    let obbMinY = Infinity, obbMaxY = -Infinity;
    let obbMinZ = Infinity, obbMaxZ = -Infinity;

    for (let i = 0; i < vertexCount; i++) {
      const rx = positions[i * 3] - meanX;
      const ry = positions[i * 3 + 1] - meanY;
      const rz = positions[i * 3 + 2] - meanZ;

      const projX = rx * axisX.x + ry * axisX.y + rz * axisX.z;
      const projY = rx * axisY.x + ry * axisY.y + rz * axisY.z;
      const projZ = rx * axisZ.x + ry * axisZ.y + rz * axisZ.z;

      if (projX < obbMinX) obbMinX = projX;
      if (projX > obbMaxX) obbMaxX = projX;
      if (projY < obbMinY) obbMinY = projY;
      if (projY > obbMaxY) obbMaxY = projY;
      if (projZ < obbMinZ) obbMinZ = projZ;
      if (projZ > obbMaxZ) obbMaxZ = projZ;
    }

    const obbHalfX = (obbMaxX - obbMinX) * 0.5;
    const obbHalfY = (obbMaxY - obbMinY) * 0.5;
    const obbHalfZ = (obbMaxZ - obbMinZ) * 0.5;

    const obbCenterOffset = {
      x: (obbMinX + obbMaxX) * 0.5,
      y: (obbMinY + obbMaxY) * 0.5,
      z: (obbMinZ + obbMaxZ) * 0.5
    };

    const obbCenterX = meanX + obbCenterOffset.x * axisX.x + obbCenterOffset.y * axisY.x + obbCenterOffset.z * axisZ.x;
    const obbCenterY = meanY + obbCenterOffset.x * axisX.y + obbCenterOffset.y * axisY.y + obbCenterOffset.z * axisZ.y;
    const obbCenterZ = meanZ + obbCenterOffset.x * axisX.z + obbCenterOffset.y * axisY.z + obbCenterOffset.z * axisZ.z;

    const obb: OBB<number> = {
      center: { x: obbCenterX, y: obbCenterY, z: obbCenterZ },
      halfExtents: { x: obbHalfX, y: obbHalfY, z: obbHalfZ },
      axes: [axisX, axisY, axisZ]
    };

    // 4. Bounding Capsule along dominant axis
    let capRadius = Math.max(obbHalfX, obbHalfZ);
    let capAxis = axisY;
    let capHalfLen = Math.max(0, obbHalfY - capRadius);

    if (obbHalfX >= obbHalfY && obbHalfX >= obbHalfZ) {
      capRadius = Math.max(obbHalfY, obbHalfZ);
      capAxis = axisX;
      capHalfLen = Math.max(0, obbHalfX - capRadius);
    } else if (obbHalfZ >= obbHalfX && obbHalfZ >= obbHalfY) {
      capRadius = Math.max(obbHalfX, obbHalfY);
      capAxis = axisZ;
      capHalfLen = Math.max(0, obbHalfZ - capRadius);
    }

    const capsule: BoundingCapsule<number> = {
      start: {
        x: obbCenterX - capAxis.x * capHalfLen,
        y: obbCenterY - capAxis.y * capHalfLen,
        z: obbCenterZ - capAxis.z * capHalfLen
      },
      end: {
        x: obbCenterX + capAxis.x * capHalfLen,
        y: obbCenterY + capAxis.y * capHalfLen,
        z: obbCenterZ + capAxis.z * capHalfLen
      },
      radius: capRadius
    };

    const volume = dimX * dimY * dimZ;
    const surfaceArea = 2 * (dimX * dimY + dimY * dimZ + dimZ * dimX);

    return engineOk({
      aabb,
      obb,
      sphere,
      capsule,
      centerOfMass,
      dimensions,
      volume,
      surfaceArea
    });
  }
}
