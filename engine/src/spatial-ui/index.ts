/**
 * @file index.ts
 * @module @aetheria/engine/spatial-ui
 * @description Public API and standalone functional wrappers for 3D UI & Spatial Math (1,800 functions).
 */

export * from './types.js';
export * from './spatial-ui-system.js';
export * from './subsystems/distance-vector-math-subsystem.js';
export * from './subsystems/anatomical-upper-body-subsystem.js';
export * from './subsystems/anatomical-hand-digits-subsystem.js';
export * from './subsystems/anatomical-lower-body-subsystem.js';
export * from './subsystems/skeletal-kinematics-character-subsystem.js';
export * from './subsystems/entities-fauna-flora-subsystem.js';
export * from './subsystems/camera-viewport-ui-subsystem.js';
export * from './subsystems/physics-collision-projectile-subsystem.js';
export * from './subsystems/curves-matrices-environment-subsystem.js';
export * from './subsystems/spatial-equipment-architecture-subsystem.js';

// Ngữ nghĩa toán học dùng chung (phép tính thuần) — export theo namespace để
// không trùng tên với các subsystem (`named`, `scalar`, `opt`, `bounds`…).
export * as SpatialPrimitives from './spatial-primitives.js';
export * as AnatomyMetrics from './anatomy-metrics.js';
export * as CameraSemantics from './semantics/camera-semantics.js';
export * as PhysicsSemantics from './semantics/physics-semantics.js';
export * as CurveSemantics from './semantics/curve-semantics.js';
export * as KinematicsSemantics from './semantics/kinematics-semantics.js';
export * as EquipmentSemantics from './semantics/equipment-semantics.js';
export * as EntitiesSemantics from './semantics/entities-semantics.js';

import { SpatialUISystem } from './spatial-ui-system.js';

let activeSpatialUISystem: SpatialUISystem | null = null;

export function getActiveSpatialUISystem(): SpatialUISystem {
  if (!activeSpatialUISystem) {
    activeSpatialUISystem = new SpatialUISystem();
  }
  return activeSpatialUISystem;
}

export function setActiveSpatialUISystem(system: SpatialUISystem | null): void {
  activeSpatialUISystem = system;
}

export function calculateDistance3D(
  ...args: Parameters<SpatialUISystem['calculateDistance3D']>
): ReturnType<SpatialUISystem['calculateDistance3D']> {
  return getActiveSpatialUISystem().calculateDistance3D(...args);
}
export function calculateDistance2D(
  ...args: Parameters<SpatialUISystem['calculateDistance2D']>
): ReturnType<SpatialUISystem['calculateDistance2D']> {
  return getActiveSpatialUISystem().calculateDistance2D(...args);
}
export function calculateHorizontalDistance(
  ...args: Parameters<SpatialUISystem['calculateHorizontalDistance']>
): ReturnType<SpatialUISystem['calculateHorizontalDistance']> {
  return getActiveSpatialUISystem().calculateHorizontalDistance(...args);
}
export function calculateVerticalDistance(
  ...args: Parameters<SpatialUISystem['calculateVerticalDistance']>
): ReturnType<SpatialUISystem['calculateVerticalDistance']> {
  return getActiveSpatialUISystem().calculateVerticalDistance(...args);
}
export function calculateDepthDistance(
  ...args: Parameters<SpatialUISystem['calculateDepthDistance']>
): ReturnType<SpatialUISystem['calculateDepthDistance']> {
  return getActiveSpatialUISystem().calculateDepthDistance(...args);
}
export function calculateEuclideanDistance(
  ...args: Parameters<SpatialUISystem['calculateEuclideanDistance']>
): ReturnType<SpatialUISystem['calculateEuclideanDistance']> {
  return getActiveSpatialUISystem().calculateEuclideanDistance(...args);
}
export function calculateManhattanDistance(
  ...args: Parameters<SpatialUISystem['calculateManhattanDistance']>
): ReturnType<SpatialUISystem['calculateManhattanDistance']> {
  return getActiveSpatialUISystem().calculateManhattanDistance(...args);
}
export function calculateChebyshevDistance(
  ...args: Parameters<SpatialUISystem['calculateChebyshevDistance']>
): ReturnType<SpatialUISystem['calculateChebyshevDistance']> {
  return getActiveSpatialUISystem().calculateChebyshevDistance(...args);
}
export function calculateSquaredDistance(
  ...args: Parameters<SpatialUISystem['calculateSquaredDistance']>
): ReturnType<SpatialUISystem['calculateSquaredDistance']> {
  return getActiveSpatialUISystem().calculateSquaredDistance(...args);
}
export function calculateDistanceToOrigin(
  ...args: Parameters<SpatialUISystem['calculateDistanceToOrigin']>
): ReturnType<SpatialUISystem['calculateDistanceToOrigin']> {
  return getActiveSpatialUISystem().calculateDistanceToOrigin(...args);
}
export function calculateDistanceToCamera(
  ...args: Parameters<SpatialUISystem['calculateDistanceToCamera']>
): ReturnType<SpatialUISystem['calculateDistanceToCamera']> {
  return getActiveSpatialUISystem().calculateDistanceToCamera(...args);
}
export function calculateDistanceToPlayer(
  ...args: Parameters<SpatialUISystem['calculateDistanceToPlayer']>
): ReturnType<SpatialUISystem['calculateDistanceToPlayer']> {
  return getActiveSpatialUISystem().calculateDistanceToPlayer(...args);
}
export function calculateDistanceToTarget(
  ...args: Parameters<SpatialUISystem['calculateDistanceToTarget']>
): ReturnType<SpatialUISystem['calculateDistanceToTarget']> {
  return getActiveSpatialUISystem().calculateDistanceToTarget(...args);
}
export function calculateDistanceToBone(
  ...args: Parameters<SpatialUISystem['calculateDistanceToBone']>
): ReturnType<SpatialUISystem['calculateDistanceToBone']> {
  return getActiveSpatialUISystem().calculateDistanceToBone(...args);
}
export function calculateDistanceToJoint(
  ...args: Parameters<SpatialUISystem['calculateDistanceToJoint']>
): ReturnType<SpatialUISystem['calculateDistanceToJoint']> {
  return getActiveSpatialUISystem().calculateDistanceToJoint(...args);
}
export function calculateDistanceToSurface(
  ...args: Parameters<SpatialUISystem['calculateDistanceToSurface']>
): ReturnType<SpatialUISystem['calculateDistanceToSurface']> {
  return getActiveSpatialUISystem().calculateDistanceToSurface(...args);
}
export function calculateDistanceToCenter(
  ...args: Parameters<SpatialUISystem['calculateDistanceToCenter']>
): ReturnType<SpatialUISystem['calculateDistanceToCenter']> {
  return getActiveSpatialUISystem().calculateDistanceToCenter(...args);
}
export function calculateDistanceToEdge(
  ...args: Parameters<SpatialUISystem['calculateDistanceToEdge']>
): ReturnType<SpatialUISystem['calculateDistanceToEdge']> {
  return getActiveSpatialUISystem().calculateDistanceToEdge(...args);
}
export function calculateDistanceToBoundary(
  ...args: Parameters<SpatialUISystem['calculateDistanceToBoundary']>
): ReturnType<SpatialUISystem['calculateDistanceToBoundary']> {
  return getActiveSpatialUISystem().calculateDistanceToBoundary(...args);
}
export function calculateDistanceToGround(
  ...args: Parameters<SpatialUISystem['calculateDistanceToGround']>
): ReturnType<SpatialUISystem['calculateDistanceToGround']> {
  return getActiveSpatialUISystem().calculateDistanceToGround(...args);
}
export function calculateDistanceToCeiling(
  ...args: Parameters<SpatialUISystem['calculateDistanceToCeiling']>
): ReturnType<SpatialUISystem['calculateDistanceToCeiling']> {
  return getActiveSpatialUISystem().calculateDistanceToCeiling(...args);
}
export function calculateDistanceToWall(
  ...args: Parameters<SpatialUISystem['calculateDistanceToWall']>
): ReturnType<SpatialUISystem['calculateDistanceToWall']> {
  return getActiveSpatialUISystem().calculateDistanceToWall(...args);
}
export function calculateDistanceToNearestObject(
  ...args: Parameters<SpatialUISystem['calculateDistanceToNearestObject']>
): ReturnType<SpatialUISystem['calculateDistanceToNearestObject']> {
  return getActiveSpatialUISystem().calculateDistanceToNearestObject(...args);
}
export function calculateDistanceToFarthestObject(
  ...args: Parameters<SpatialUISystem['calculateDistanceToFarthestObject']>
): ReturnType<SpatialUISystem['calculateDistanceToFarthestObject']> {
  return getActiveSpatialUISystem().calculateDistanceToFarthestObject(...args);
}
export function calculateMinimumDistance(
  ...args: Parameters<SpatialUISystem['calculateMinimumDistance']>
): ReturnType<SpatialUISystem['calculateMinimumDistance']> {
  return getActiveSpatialUISystem().calculateMinimumDistance(...args);
}
export function calculateMaximumDistance(
  ...args: Parameters<SpatialUISystem['calculateMaximumDistance']>
): ReturnType<SpatialUISystem['calculateMaximumDistance']> {
  return getActiveSpatialUISystem().calculateMaximumDistance(...args);
}
export function calculateAverageDistance(
  ...args: Parameters<SpatialUISystem['calculateAverageDistance']>
): ReturnType<SpatialUISystem['calculateAverageDistance']> {
  return getActiveSpatialUISystem().calculateAverageDistance(...args);
}
export function calculateDistanceAlongPath(
  ...args: Parameters<SpatialUISystem['calculateDistanceAlongPath']>
): ReturnType<SpatialUISystem['calculateDistanceAlongPath']> {
  return getActiveSpatialUISystem().calculateDistanceAlongPath(...args);
}
export function calculateDistanceAlongCurve(
  ...args: Parameters<SpatialUISystem['calculateDistanceAlongCurve']>
): ReturnType<SpatialUISystem['calculateDistanceAlongCurve']> {
  return getActiveSpatialUISystem().calculateDistanceAlongCurve(...args);
}
export function calculateDistanceAlongSpline(
  ...args: Parameters<SpatialUISystem['calculateDistanceAlongSpline']>
): ReturnType<SpatialUISystem['calculateDistanceAlongSpline']> {
  return getActiveSpatialUISystem().calculateDistanceAlongSpline(...args);
}
export function calculateDistanceBetweenSegments(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenSegments']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenSegments']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenSegments(...args);
}
export function calculateDistanceBetweenRays(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenRays']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenRays']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenRays(...args);
}
export function calculateDistanceBetweenPlanes(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenPlanes']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenPlanes']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenPlanes(...args);
}
export function calculateDistanceBetweenSpheres(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenSpheres']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenSpheres']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenSpheres(...args);
}
export function calculateDistanceBetweenBoxes(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenBoxes']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenBoxes']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenBoxes(...args);
}
export function calculateDistanceBetweenCapsules(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenCapsules']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenCapsules']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenCapsules(...args);
}
export function calculateDistanceBetweenMeshes(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenMeshes']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenMeshes']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenMeshes(...args);
}
export function calculateDistanceBetweenCharacters(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenCharacters']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenCharacters']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenCharacters(...args);
}
export function calculateDistanceBetweenBones(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenBones']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenBones']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenBones(...args);
}
export function calculateDistanceBetweenHands(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenHands']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenHands']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenHands(...args);
}
export function calculateDistanceBetweenFeet(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenFeet']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenFeet']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenFeet(...args);
}
export function calculateDistanceBetweenEyes(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenEyes']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenEyes']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenEyes(...args);
}
export function calculateDistanceBetweenShoulders(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenShoulders']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenShoulders']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenShoulders(...args);
}
export function calculateDistanceBetweenHips(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenHips']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenHips']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenHips(...args);
}
export function calculateDistanceBetweenFingers(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenFingers']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenFingers']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenFingers(...args);
}
export function calculateDistanceBetweenObjects(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenObjects']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenObjects']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenObjects(...args);
}
export function calculateDistanceBetweenTrees(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenTrees']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenTrees']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenTrees(...args);
}
export function calculateDistanceBetweenAnimals(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenAnimals']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenAnimals']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenAnimals(...args);
}
export function calculateDistanceBetweenNPCs(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenNPCs']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenNPCs']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenNPCs(...args);
}
export function calculateDistanceBetweenBosses(
  ...args: Parameters<SpatialUISystem['calculateDistanceBetweenBosses']>
): ReturnType<SpatialUISystem['calculateDistanceBetweenBosses']> {
  return getActiveSpatialUISystem().calculateDistanceBetweenBosses(...args);
}
export function getWorldPosition(
  ...args: Parameters<SpatialUISystem['getWorldPosition']>
): ReturnType<SpatialUISystem['getWorldPosition']> {
  return getActiveSpatialUISystem().getWorldPosition(...args);
}
export function getLocalPosition(
  ...args: Parameters<SpatialUISystem['getLocalPosition']>
): ReturnType<SpatialUISystem['getLocalPosition']> {
  return getActiveSpatialUISystem().getLocalPosition(...args);
}
export function getParentPosition(
  ...args: Parameters<SpatialUISystem['getParentPosition']>
): ReturnType<SpatialUISystem['getParentPosition']> {
  return getActiveSpatialUISystem().getParentPosition(...args);
}
export function getRelativePosition(
  ...args: Parameters<SpatialUISystem['getRelativePosition']>
): ReturnType<SpatialUISystem['getRelativePosition']> {
  return getActiveSpatialUISystem().getRelativePosition(...args);
}
export function getAbsolutePosition(
  ...args: Parameters<SpatialUISystem['getAbsolutePosition']>
): ReturnType<SpatialUISystem['getAbsolutePosition']> {
  return getActiveSpatialUISystem().getAbsolutePosition(...args);
}
export function getScreenPosition(
  ...args: Parameters<SpatialUISystem['getScreenPosition']>
): ReturnType<SpatialUISystem['getScreenPosition']> {
  return getActiveSpatialUISystem().getScreenPosition(...args);
}
export function getViewportPosition(
  ...args: Parameters<SpatialUISystem['getViewportPosition']>
): ReturnType<SpatialUISystem['getViewportPosition']> {
  return getActiveSpatialUISystem().getViewportPosition(...args);
}
export function getNormalizedDeviceCoordinates(
  ...args: Parameters<SpatialUISystem['getNormalizedDeviceCoordinates']>
): ReturnType<SpatialUISystem['getNormalizedDeviceCoordinates']> {
  return getActiveSpatialUISystem().getNormalizedDeviceCoordinates(...args);
}
export function getCameraSpacePosition(
  ...args: Parameters<SpatialUISystem['getCameraSpacePosition']>
): ReturnType<SpatialUISystem['getCameraSpacePosition']> {
  return getActiveSpatialUISystem().getCameraSpacePosition(...args);
}
export function getObjectSpacePosition(
  ...args: Parameters<SpatialUISystem['getObjectSpacePosition']>
): ReturnType<SpatialUISystem['getObjectSpacePosition']> {
  return getActiveSpatialUISystem().getObjectSpacePosition(...args);
}
export function transformLocalToWorld(
  ...args: Parameters<SpatialUISystem['transformLocalToWorld']>
): ReturnType<SpatialUISystem['transformLocalToWorld']> {
  return getActiveSpatialUISystem().transformLocalToWorld(...args);
}
export function transformWorldToLocal(
  ...args: Parameters<SpatialUISystem['transformWorldToLocal']>
): ReturnType<SpatialUISystem['transformWorldToLocal']> {
  return getActiveSpatialUISystem().transformWorldToLocal(...args);
}
export function transformWorldToScreen(
  ...args: Parameters<SpatialUISystem['transformWorldToScreen']>
): ReturnType<SpatialUISystem['transformWorldToScreen']> {
  return getActiveSpatialUISystem().transformWorldToScreen(...args);
}
export function transformScreenToWorld(
  ...args: Parameters<SpatialUISystem['transformScreenToWorld']>
): ReturnType<SpatialUISystem['transformScreenToWorld']> {
  return getActiveSpatialUISystem().transformScreenToWorld(...args);
}
export function transformCameraToWorld(
  ...args: Parameters<SpatialUISystem['transformCameraToWorld']>
): ReturnType<SpatialUISystem['transformCameraToWorld']> {
  return getActiveSpatialUISystem().transformCameraToWorld(...args);
}
export function transformWorldToCamera(
  ...args: Parameters<SpatialUISystem['transformWorldToCamera']>
): ReturnType<SpatialUISystem['transformWorldToCamera']> {
  return getActiveSpatialUISystem().transformWorldToCamera(...args);
}
export function calculatePositionOffset(
  ...args: Parameters<SpatialUISystem['calculatePositionOffset']>
): ReturnType<SpatialUISystem['calculatePositionOffset']> {
  return getActiveSpatialUISystem().calculatePositionOffset(...args);
}
export function calculateRelativeOffset(
  ...args: Parameters<SpatialUISystem['calculateRelativeOffset']>
): ReturnType<SpatialUISystem['calculateRelativeOffset']> {
  return getActiveSpatialUISystem().calculateRelativeOffset(...args);
}
export function calculateWorldOffset(
  ...args: Parameters<SpatialUISystem['calculateWorldOffset']>
): ReturnType<SpatialUISystem['calculateWorldOffset']> {
  return getActiveSpatialUISystem().calculateWorldOffset(...args);
}
export function calculateLocalOffset(
  ...args: Parameters<SpatialUISystem['calculateLocalOffset']>
): ReturnType<SpatialUISystem['calculateLocalOffset']> {
  return getActiveSpatialUISystem().calculateLocalOffset(...args);
}
export function calculatePositionDelta(
  ...args: Parameters<SpatialUISystem['calculatePositionDelta']>
): ReturnType<SpatialUISystem['calculatePositionDelta']> {
  return getActiveSpatialUISystem().calculatePositionDelta(...args);
}
export function calculateVelocityVector(
  ...args: Parameters<SpatialUISystem['calculateVelocityVector']>
): ReturnType<SpatialUISystem['calculateVelocityVector']> {
  return getActiveSpatialUISystem().calculateVelocityVector(...args);
}
export function calculateAccelerationVector(
  ...args: Parameters<SpatialUISystem['calculateAccelerationVector']>
): ReturnType<SpatialUISystem['calculateAccelerationVector']> {
  return getActiveSpatialUISystem().calculateAccelerationVector(...args);
}
export function calculateDirectionVector(
  ...args: Parameters<SpatialUISystem['calculateDirectionVector']>
): ReturnType<SpatialUISystem['calculateDirectionVector']> {
  return getActiveSpatialUISystem().calculateDirectionVector(...args);
}
export function calculateNormalizedDirection(
  ...args: Parameters<SpatialUISystem['calculateNormalizedDirection']>
): ReturnType<SpatialUISystem['calculateNormalizedDirection']> {
  return getActiveSpatialUISystem().calculateNormalizedDirection(...args);
}
export function calculateForwardVector(
  ...args: Parameters<SpatialUISystem['calculateForwardVector']>
): ReturnType<SpatialUISystem['calculateForwardVector']> {
  return getActiveSpatialUISystem().calculateForwardVector(...args);
}
export function calculateBackwardVector(
  ...args: Parameters<SpatialUISystem['calculateBackwardVector']>
): ReturnType<SpatialUISystem['calculateBackwardVector']> {
  return getActiveSpatialUISystem().calculateBackwardVector(...args);
}
export function calculateRightVector(
  ...args: Parameters<SpatialUISystem['calculateRightVector']>
): ReturnType<SpatialUISystem['calculateRightVector']> {
  return getActiveSpatialUISystem().calculateRightVector(...args);
}
export function calculateLeftVector(
  ...args: Parameters<SpatialUISystem['calculateLeftVector']>
): ReturnType<SpatialUISystem['calculateLeftVector']> {
  return getActiveSpatialUISystem().calculateLeftVector(...args);
}
export function calculateUpVector(
  ...args: Parameters<SpatialUISystem['calculateUpVector']>
): ReturnType<SpatialUISystem['calculateUpVector']> {
  return getActiveSpatialUISystem().calculateUpVector(...args);
}
export function calculateDownVector(
  ...args: Parameters<SpatialUISystem['calculateDownVector']>
): ReturnType<SpatialUISystem['calculateDownVector']> {
  return getActiveSpatialUISystem().calculateDownVector(...args);
}
export function calculateLookDirection(
  ...args: Parameters<SpatialUISystem['calculateLookDirection']>
): ReturnType<SpatialUISystem['calculateLookDirection']> {
  return getActiveSpatialUISystem().calculateLookDirection(...args);
}
export function calculateAimDirection(
  ...args: Parameters<SpatialUISystem['calculateAimDirection']>
): ReturnType<SpatialUISystem['calculateAimDirection']> {
  return getActiveSpatialUISystem().calculateAimDirection(...args);
}
export function calculateMovementDirection(
  ...args: Parameters<SpatialUISystem['calculateMovementDirection']>
): ReturnType<SpatialUISystem['calculateMovementDirection']> {
  return getActiveSpatialUISystem().calculateMovementDirection(...args);
}
export function calculateSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateSurfaceNormal(...args);
}
export function calculateTangentVector(
  ...args: Parameters<SpatialUISystem['calculateTangentVector']>
): ReturnType<SpatialUISystem['calculateTangentVector']> {
  return getActiveSpatialUISystem().calculateTangentVector(...args);
}
export function calculateBitangentVector(
  ...args: Parameters<SpatialUISystem['calculateBitangentVector']>
): ReturnType<SpatialUISystem['calculateBitangentVector']> {
  return getActiveSpatialUISystem().calculateBitangentVector(...args);
}
export function calculateCrossProduct(
  ...args: Parameters<SpatialUISystem['calculateCrossProduct']>
): ReturnType<SpatialUISystem['calculateCrossProduct']> {
  return getActiveSpatialUISystem().calculateCrossProduct(...args);
}
export function calculateDotProduct(
  ...args: Parameters<SpatialUISystem['calculateDotProduct']>
): ReturnType<SpatialUISystem['calculateDotProduct']> {
  return getActiveSpatialUISystem().calculateDotProduct(...args);
}
export function calculateVectorMagnitude(
  ...args: Parameters<SpatialUISystem['calculateVectorMagnitude']>
): ReturnType<SpatialUISystem['calculateVectorMagnitude']> {
  return getActiveSpatialUISystem().calculateVectorMagnitude(...args);
}
export function normalizeVector(
  ...args: Parameters<SpatialUISystem['normalizeVector']>
): ReturnType<SpatialUISystem['normalizeVector']> {
  return getActiveSpatialUISystem().normalizeVector(...args);
}
export function projectVector(
  ...args: Parameters<SpatialUISystem['projectVector']>
): ReturnType<SpatialUISystem['projectVector']> {
  return getActiveSpatialUISystem().projectVector(...args);
}
export function reflectVector(
  ...args: Parameters<SpatialUISystem['reflectVector']>
): ReturnType<SpatialUISystem['reflectVector']> {
  return getActiveSpatialUISystem().reflectVector(...args);
}
export function refractVector(
  ...args: Parameters<SpatialUISystem['refractVector']>
): ReturnType<SpatialUISystem['refractVector']> {
  return getActiveSpatialUISystem().refractVector(...args);
}
export function lerpVector(
  ...args: Parameters<SpatialUISystem['lerpVector']>
): ReturnType<SpatialUISystem['lerpVector']> {
  return getActiveSpatialUISystem().lerpVector(...args);
}
export function slerpVector(
  ...args: Parameters<SpatialUISystem['slerpVector']>
): ReturnType<SpatialUISystem['slerpVector']> {
  return getActiveSpatialUISystem().slerpVector(...args);
}
export function clampVectorMagnitude(
  ...args: Parameters<SpatialUISystem['clampVectorMagnitude']>
): ReturnType<SpatialUISystem['clampVectorMagnitude']> {
  return getActiveSpatialUISystem().clampVectorMagnitude(...args);
}
export function calculateVectorAngle(
  ...args: Parameters<SpatialUISystem['calculateVectorAngle']>
): ReturnType<SpatialUISystem['calculateVectorAngle']> {
  return getActiveSpatialUISystem().calculateVectorAngle(...args);
}
export function calculateVectorProjection(
  ...args: Parameters<SpatialUISystem['calculateVectorProjection']>
): ReturnType<SpatialUISystem['calculateVectorProjection']> {
  return getActiveSpatialUISystem().calculateVectorProjection(...args);
}
export function calculateVectorRejection(
  ...args: Parameters<SpatialUISystem['calculateVectorRejection']>
): ReturnType<SpatialUISystem['calculateVectorRejection']> {
  return getActiveSpatialUISystem().calculateVectorRejection(...args);
}
export function calculateEulerAngles(
  ...args: Parameters<SpatialUISystem['calculateEulerAngles']>
): ReturnType<SpatialUISystem['calculateEulerAngles']> {
  return getActiveSpatialUISystem().calculateEulerAngles(...args);
}
export function calculateYaw(
  ...args: Parameters<SpatialUISystem['calculateYaw']>
): ReturnType<SpatialUISystem['calculateYaw']> {
  return getActiveSpatialUISystem().calculateYaw(...args);
}
export function calculatePitch(
  ...args: Parameters<SpatialUISystem['calculatePitch']>
): ReturnType<SpatialUISystem['calculatePitch']> {
  return getActiveSpatialUISystem().calculatePitch(...args);
}
export function calculateRoll(
  ...args: Parameters<SpatialUISystem['calculateRoll']>
): ReturnType<SpatialUISystem['calculateRoll']> {
  return getActiveSpatialUISystem().calculateRoll(...args);
}
export function calculateAngleBetweenPoints(
  ...args: Parameters<SpatialUISystem['calculateAngleBetweenPoints']>
): ReturnType<SpatialUISystem['calculateAngleBetweenPoints']> {
  return getActiveSpatialUISystem().calculateAngleBetweenPoints(...args);
}
export function calculateAngleBetweenVectors(
  ...args: Parameters<SpatialUISystem['calculateAngleBetweenVectors']>
): ReturnType<SpatialUISystem['calculateAngleBetweenVectors']> {
  return getActiveSpatialUISystem().calculateAngleBetweenVectors(...args);
}
export function calculateAngleToTarget(
  ...args: Parameters<SpatialUISystem['calculateAngleToTarget']>
): ReturnType<SpatialUISystem['calculateAngleToTarget']> {
  return getActiveSpatialUISystem().calculateAngleToTarget(...args);
}
export function calculateAngleToCamera(
  ...args: Parameters<SpatialUISystem['calculateAngleToCamera']>
): ReturnType<SpatialUISystem['calculateAngleToCamera']> {
  return getActiveSpatialUISystem().calculateAngleToCamera(...args);
}
export function calculateAngleToGround(
  ...args: Parameters<SpatialUISystem['calculateAngleToGround']>
): ReturnType<SpatialUISystem['calculateAngleToGround']> {
  return getActiveSpatialUISystem().calculateAngleToGround(...args);
}
export function calculateSignedAngle(
  ...args: Parameters<SpatialUISystem['calculateSignedAngle']>
): ReturnType<SpatialUISystem['calculateSignedAngle']> {
  return getActiveSpatialUISystem().calculateSignedAngle(...args);
}
export function calculateUnsignedAngle(
  ...args: Parameters<SpatialUISystem['calculateUnsignedAngle']>
): ReturnType<SpatialUISystem['calculateUnsignedAngle']> {
  return getActiveSpatialUISystem().calculateUnsignedAngle(...args);
}
export function calculateAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateAngularVelocity']>
): ReturnType<SpatialUISystem['calculateAngularVelocity']> {
  return getActiveSpatialUISystem().calculateAngularVelocity(...args);
}
export function calculateAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateAngularAcceleration(...args);
}
export function calculateAngularDistance(
  ...args: Parameters<SpatialUISystem['calculateAngularDistance']>
): ReturnType<SpatialUISystem['calculateAngularDistance']> {
  return getActiveSpatialUISystem().calculateAngularDistance(...args);
}
export function calculateAngularDifference(
  ...args: Parameters<SpatialUISystem['calculateAngularDifference']>
): ReturnType<SpatialUISystem['calculateAngularDifference']> {
  return getActiveSpatialUISystem().calculateAngularDifference(...args);
}
export function normalizeAngle(
  ...args: Parameters<SpatialUISystem['normalizeAngle']>
): ReturnType<SpatialUISystem['normalizeAngle']> {
  return getActiveSpatialUISystem().normalizeAngle(...args);
}
export function clampAngle(
  ...args: Parameters<SpatialUISystem['clampAngle']>
): ReturnType<SpatialUISystem['clampAngle']> {
  return getActiveSpatialUISystem().clampAngle(...args);
}
export function interpolateAngle(
  ...args: Parameters<SpatialUISystem['interpolateAngle']>
): ReturnType<SpatialUISystem['interpolateAngle']> {
  return getActiveSpatialUISystem().interpolateAngle(...args);
}
export function calculateRotationMatrix(
  ...args: Parameters<SpatialUISystem['calculateRotationMatrix']>
): ReturnType<SpatialUISystem['calculateRotationMatrix']> {
  return getActiveSpatialUISystem().calculateRotationMatrix(...args);
}
export function calculateInverseRotation(
  ...args: Parameters<SpatialUISystem['calculateInverseRotation']>
): ReturnType<SpatialUISystem['calculateInverseRotation']> {
  return getActiveSpatialUISystem().calculateInverseRotation(...args);
}
export function calculateQuaternion(
  ...args: Parameters<SpatialUISystem['calculateQuaternion']>
): ReturnType<SpatialUISystem['calculateQuaternion']> {
  return getActiveSpatialUISystem().calculateQuaternion(...args);
}
export function normalizeQuaternion(
  ...args: Parameters<SpatialUISystem['normalizeQuaternion']>
): ReturnType<SpatialUISystem['normalizeQuaternion']> {
  return getActiveSpatialUISystem().normalizeQuaternion(...args);
}
export function multiplyQuaternions(
  ...args: Parameters<SpatialUISystem['multiplyQuaternions']>
): ReturnType<SpatialUISystem['multiplyQuaternions']> {
  return getActiveSpatialUISystem().multiplyQuaternions(...args);
}
export function invertQuaternion(
  ...args: Parameters<SpatialUISystem['invertQuaternion']>
): ReturnType<SpatialUISystem['invertQuaternion']> {
  return getActiveSpatialUISystem().invertQuaternion(...args);
}
export function slerpQuaternion(
  ...args: Parameters<SpatialUISystem['slerpQuaternion']>
): ReturnType<SpatialUISystem['slerpQuaternion']> {
  return getActiveSpatialUISystem().slerpQuaternion(...args);
}
export function nlerpQuaternion(
  ...args: Parameters<SpatialUISystem['nlerpQuaternion']>
): ReturnType<SpatialUISystem['nlerpQuaternion']> {
  return getActiveSpatialUISystem().nlerpQuaternion(...args);
}
export function quaternionToEuler(
  ...args: Parameters<SpatialUISystem['quaternionToEuler']>
): ReturnType<SpatialUISystem['quaternionToEuler']> {
  return getActiveSpatialUISystem().quaternionToEuler(...args);
}
export function eulerToQuaternion(
  ...args: Parameters<SpatialUISystem['eulerToQuaternion']>
): ReturnType<SpatialUISystem['eulerToQuaternion']> {
  return getActiveSpatialUISystem().eulerToQuaternion(...args);
}
export function quaternionToMatrix(
  ...args: Parameters<SpatialUISystem['quaternionToMatrix']>
): ReturnType<SpatialUISystem['quaternionToMatrix']> {
  return getActiveSpatialUISystem().quaternionToMatrix(...args);
}
export function matrixToQuaternion(
  ...args: Parameters<SpatialUISystem['matrixToQuaternion']>
): ReturnType<SpatialUISystem['matrixToQuaternion']> {
  return getActiveSpatialUISystem().matrixToQuaternion(...args);
}
export function calculateLookAtRotation(
  ...args: Parameters<SpatialUISystem['calculateLookAtRotation']>
): ReturnType<SpatialUISystem['calculateLookAtRotation']> {
  return getActiveSpatialUISystem().calculateLookAtRotation(...args);
}
export function calculateLookAtQuaternion(
  ...args: Parameters<SpatialUISystem['calculateLookAtQuaternion']>
): ReturnType<SpatialUISystem['calculateLookAtQuaternion']> {
  return getActiveSpatialUISystem().calculateLookAtQuaternion(...args);
}
export function calculateRotationAroundAxis(
  ...args: Parameters<SpatialUISystem['calculateRotationAroundAxis']>
): ReturnType<SpatialUISystem['calculateRotationAroundAxis']> {
  return getActiveSpatialUISystem().calculateRotationAroundAxis(...args);
}
export function calculateRotationBetweenVectors(
  ...args: Parameters<SpatialUISystem['calculateRotationBetweenVectors']>
): ReturnType<SpatialUISystem['calculateRotationBetweenVectors']> {
  return getActiveSpatialUISystem().calculateRotationBetweenVectors(...args);
}
export function calculateRelativeRotation(
  ...args: Parameters<SpatialUISystem['calculateRelativeRotation']>
): ReturnType<SpatialUISystem['calculateRelativeRotation']> {
  return getActiveSpatialUISystem().calculateRelativeRotation(...args);
}
export function calculateWorldRotation(
  ...args: Parameters<SpatialUISystem['calculateWorldRotation']>
): ReturnType<SpatialUISystem['calculateWorldRotation']> {
  return getActiveSpatialUISystem().calculateWorldRotation(...args);
}
export function calculateLocalRotation(
  ...args: Parameters<SpatialUISystem['calculateLocalRotation']>
): ReturnType<SpatialUISystem['calculateLocalRotation']> {
  return getActiveSpatialUISystem().calculateLocalRotation(...args);
}
export function calculateBoneRotation(
  ...args: Parameters<SpatialUISystem['calculateBoneRotation']>
): ReturnType<SpatialUISystem['calculateBoneRotation']> {
  return getActiveSpatialUISystem().calculateBoneRotation(...args);
}
export function calculateJointRotation(
  ...args: Parameters<SpatialUISystem['calculateJointRotation']>
): ReturnType<SpatialUISystem['calculateJointRotation']> {
  return getActiveSpatialUISystem().calculateJointRotation(...args);
}
export function calculateHeadRotation(
  ...args: Parameters<SpatialUISystem['calculateHeadRotation']>
): ReturnType<SpatialUISystem['calculateHeadRotation']> {
  return getActiveSpatialUISystem().calculateHeadRotation(...args);
}
export function calculateHandRotation(
  ...args: Parameters<SpatialUISystem['calculateHandRotation']>
): ReturnType<SpatialUISystem['calculateHandRotation']> {
  return getActiveSpatialUISystem().calculateHandRotation(...args);
}
export function calculateFootRotation(
  ...args: Parameters<SpatialUISystem['calculateFootRotation']>
): ReturnType<SpatialUISystem['calculateFootRotation']> {
  return getActiveSpatialUISystem().calculateFootRotation(...args);
}
export function calculateShoulderRotation(
  ...args: Parameters<SpatialUISystem['calculateShoulderRotation']>
): ReturnType<SpatialUISystem['calculateShoulderRotation']> {
  return getActiveSpatialUISystem().calculateShoulderRotation(...args);
}
export function calculateHipRotation(
  ...args: Parameters<SpatialUISystem['calculateHipRotation']>
): ReturnType<SpatialUISystem['calculateHipRotation']> {
  return getActiveSpatialUISystem().calculateHipRotation(...args);
}
export function calculateWristRotation(
  ...args: Parameters<SpatialUISystem['calculateWristRotation']>
): ReturnType<SpatialUISystem['calculateWristRotation']> {
  return getActiveSpatialUISystem().calculateWristRotation(...args);
}
export function calculateElbowRotation(
  ...args: Parameters<SpatialUISystem['calculateElbowRotation']>
): ReturnType<SpatialUISystem['calculateElbowRotation']> {
  return getActiveSpatialUISystem().calculateElbowRotation(...args);
}
export function calculateKneeRotation(
  ...args: Parameters<SpatialUISystem['calculateKneeRotation']>
): ReturnType<SpatialUISystem['calculateKneeRotation']> {
  return getActiveSpatialUISystem().calculateKneeRotation(...args);
}
export function calculateSpineRotation(
  ...args: Parameters<SpatialUISystem['calculateSpineRotation']>
): ReturnType<SpatialUISystem['calculateSpineRotation']> {
  return getActiveSpatialUISystem().calculateSpineRotation(...args);
}
export function calculateTailRotation(
  ...args: Parameters<SpatialUISystem['calculateTailRotation']>
): ReturnType<SpatialUISystem['calculateTailRotation']> {
  return getActiveSpatialUISystem().calculateTailRotation(...args);
}
export function calculateWingRotation(
  ...args: Parameters<SpatialUISystem['calculateWingRotation']>
): ReturnType<SpatialUISystem['calculateWingRotation']> {
  return getActiveSpatialUISystem().calculateWingRotation(...args);
}
export function getHeadPosition(
  ...args: Parameters<SpatialUISystem['getHeadPosition']>
): ReturnType<SpatialUISystem['getHeadPosition']> {
  return getActiveSpatialUISystem().getHeadPosition(...args);
}
export function getHeadCenter(
  ...args: Parameters<SpatialUISystem['getHeadCenter']>
): ReturnType<SpatialUISystem['getHeadCenter']> {
  return getActiveSpatialUISystem().getHeadCenter(...args);
}
export function getHeadTopPosition(
  ...args: Parameters<SpatialUISystem['getHeadTopPosition']>
): ReturnType<SpatialUISystem['getHeadTopPosition']> {
  return getActiveSpatialUISystem().getHeadTopPosition(...args);
}
export function getHeadBottomPosition(
  ...args: Parameters<SpatialUISystem['getHeadBottomPosition']>
): ReturnType<SpatialUISystem['getHeadBottomPosition']> {
  return getActiveSpatialUISystem().getHeadBottomPosition(...args);
}
export function getHeadFrontPosition(
  ...args: Parameters<SpatialUISystem['getHeadFrontPosition']>
): ReturnType<SpatialUISystem['getHeadFrontPosition']> {
  return getActiveSpatialUISystem().getHeadFrontPosition(...args);
}
export function getHeadBackPosition(
  ...args: Parameters<SpatialUISystem['getHeadBackPosition']>
): ReturnType<SpatialUISystem['getHeadBackPosition']> {
  return getActiveSpatialUISystem().getHeadBackPosition(...args);
}
export function getHeadLeftPosition(
  ...args: Parameters<SpatialUISystem['getHeadLeftPosition']>
): ReturnType<SpatialUISystem['getHeadLeftPosition']> {
  return getActiveSpatialUISystem().getHeadLeftPosition(...args);
}
export function getHeadRightPosition(
  ...args: Parameters<SpatialUISystem['getHeadRightPosition']>
): ReturnType<SpatialUISystem['getHeadRightPosition']> {
  return getActiveSpatialUISystem().getHeadRightPosition(...args);
}
export function getHeadForwardVector(
  ...args: Parameters<SpatialUISystem['getHeadForwardVector']>
): ReturnType<SpatialUISystem['getHeadForwardVector']> {
  return getActiveSpatialUISystem().getHeadForwardVector(...args);
}
export function getHeadUpVector(
  ...args: Parameters<SpatialUISystem['getHeadUpVector']>
): ReturnType<SpatialUISystem['getHeadUpVector']> {
  return getActiveSpatialUISystem().getHeadUpVector(...args);
}
export function getHeadRightVector(
  ...args: Parameters<SpatialUISystem['getHeadRightVector']>
): ReturnType<SpatialUISystem['getHeadRightVector']> {
  return getActiveSpatialUISystem().getHeadRightVector(...args);
}
export function calculateHeadCenterOffset(
  ...args: Parameters<SpatialUISystem['calculateHeadCenterOffset']>
): ReturnType<SpatialUISystem['calculateHeadCenterOffset']> {
  return getActiveSpatialUISystem().calculateHeadCenterOffset(...args);
}
export function calculateHeadBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateHeadBoundingBox']>
): ReturnType<SpatialUISystem['calculateHeadBoundingBox']> {
  return getActiveSpatialUISystem().calculateHeadBoundingBox(...args);
}
export function calculateHeadBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateHeadBoundingSphere']>
): ReturnType<SpatialUISystem['calculateHeadBoundingSphere']> {
  return getActiveSpatialUISystem().calculateHeadBoundingSphere(...args);
}
export function calculateHeadOrientation(
  ...args: Parameters<SpatialUISystem['calculateHeadOrientation']>
): ReturnType<SpatialUISystem['calculateHeadOrientation']> {
  return getActiveSpatialUISystem().calculateHeadOrientation(...args);
}
export function calculateHeadLookDirection(
  ...args: Parameters<SpatialUISystem['calculateHeadLookDirection']>
): ReturnType<SpatialUISystem['calculateHeadLookDirection']> {
  return getActiveSpatialUISystem().calculateHeadLookDirection(...args);
}
export function calculateHeadAimDirection(
  ...args: Parameters<SpatialUISystem['calculateHeadAimDirection']>
): ReturnType<SpatialUISystem['calculateHeadAimDirection']> {
  return getActiveSpatialUISystem().calculateHeadAimDirection(...args);
}
export function calculateHeadTilt(
  ...args: Parameters<SpatialUISystem['calculateHeadTilt']>
): ReturnType<SpatialUISystem['calculateHeadTilt']> {
  return getActiveSpatialUISystem().calculateHeadTilt(...args);
}
export function calculateHeadYaw(
  ...args: Parameters<SpatialUISystem['calculateHeadYaw']>
): ReturnType<SpatialUISystem['calculateHeadYaw']> {
  return getActiveSpatialUISystem().calculateHeadYaw(...args);
}
export function calculateHeadPitch(
  ...args: Parameters<SpatialUISystem['calculateHeadPitch']>
): ReturnType<SpatialUISystem['calculateHeadPitch']> {
  return getActiveSpatialUISystem().calculateHeadPitch(...args);
}
export function calculateHeadRoll(
  ...args: Parameters<SpatialUISystem['calculateHeadRoll']>
): ReturnType<SpatialUISystem['calculateHeadRoll']> {
  return getActiveSpatialUISystem().calculateHeadRoll(...args);
}
export function getFaceCenter(
  ...args: Parameters<SpatialUISystem['getFaceCenter']>
): ReturnType<SpatialUISystem['getFaceCenter']> {
  return getActiveSpatialUISystem().getFaceCenter(...args);
}
export function getForeheadPosition(
  ...args: Parameters<SpatialUISystem['getForeheadPosition']>
): ReturnType<SpatialUISystem['getForeheadPosition']> {
  return getActiveSpatialUISystem().getForeheadPosition(...args);
}
export function getChinPosition(
  ...args: Parameters<SpatialUISystem['getChinPosition']>
): ReturnType<SpatialUISystem['getChinPosition']> {
  return getActiveSpatialUISystem().getChinPosition(...args);
}
export function getJawPosition(
  ...args: Parameters<SpatialUISystem['getJawPosition']>
): ReturnType<SpatialUISystem['getJawPosition']> {
  return getActiveSpatialUISystem().getJawPosition(...args);
}
export function getLeftEyePosition(
  ...args: Parameters<SpatialUISystem['getLeftEyePosition']>
): ReturnType<SpatialUISystem['getLeftEyePosition']> {
  return getActiveSpatialUISystem().getLeftEyePosition(...args);
}
export function getRightEyePosition(
  ...args: Parameters<SpatialUISystem['getRightEyePosition']>
): ReturnType<SpatialUISystem['getRightEyePosition']> {
  return getActiveSpatialUISystem().getRightEyePosition(...args);
}
export function getLeftPupilPosition(
  ...args: Parameters<SpatialUISystem['getLeftPupilPosition']>
): ReturnType<SpatialUISystem['getLeftPupilPosition']> {
  return getActiveSpatialUISystem().getLeftPupilPosition(...args);
}
export function getRightPupilPosition(
  ...args: Parameters<SpatialUISystem['getRightPupilPosition']>
): ReturnType<SpatialUISystem['getRightPupilPosition']> {
  return getActiveSpatialUISystem().getRightPupilPosition(...args);
}
export function getNosePosition(
  ...args: Parameters<SpatialUISystem['getNosePosition']>
): ReturnType<SpatialUISystem['getNosePosition']> {
  return getActiveSpatialUISystem().getNosePosition(...args);
}
export function getNoseTipPosition(
  ...args: Parameters<SpatialUISystem['getNoseTipPosition']>
): ReturnType<SpatialUISystem['getNoseTipPosition']> {
  return getActiveSpatialUISystem().getNoseTipPosition(...args);
}
export function getMouthCenter(
  ...args: Parameters<SpatialUISystem['getMouthCenter']>
): ReturnType<SpatialUISystem['getMouthCenter']> {
  return getActiveSpatialUISystem().getMouthCenter(...args);
}
export function getUpperLipPosition(
  ...args: Parameters<SpatialUISystem['getUpperLipPosition']>
): ReturnType<SpatialUISystem['getUpperLipPosition']> {
  return getActiveSpatialUISystem().getUpperLipPosition(...args);
}
export function getLowerLipPosition(
  ...args: Parameters<SpatialUISystem['getLowerLipPosition']>
): ReturnType<SpatialUISystem['getLowerLipPosition']> {
  return getActiveSpatialUISystem().getLowerLipPosition(...args);
}
export function getLeftEarPosition(
  ...args: Parameters<SpatialUISystem['getLeftEarPosition']>
): ReturnType<SpatialUISystem['getLeftEarPosition']> {
  return getActiveSpatialUISystem().getLeftEarPosition(...args);
}
export function getRightEarPosition(
  ...args: Parameters<SpatialUISystem['getRightEarPosition']>
): ReturnType<SpatialUISystem['getRightEarPosition']> {
  return getActiveSpatialUISystem().getRightEarPosition(...args);
}
export function getLeftEyebrowPosition(
  ...args: Parameters<SpatialUISystem['getLeftEyebrowPosition']>
): ReturnType<SpatialUISystem['getLeftEyebrowPosition']> {
  return getActiveSpatialUISystem().getLeftEyebrowPosition(...args);
}
export function getRightEyebrowPosition(
  ...args: Parameters<SpatialUISystem['getRightEyebrowPosition']>
): ReturnType<SpatialUISystem['getRightEyebrowPosition']> {
  return getActiveSpatialUISystem().getRightEyebrowPosition(...args);
}
export function getLeftCheekPosition(
  ...args: Parameters<SpatialUISystem['getLeftCheekPosition']>
): ReturnType<SpatialUISystem['getLeftCheekPosition']> {
  return getActiveSpatialUISystem().getLeftCheekPosition(...args);
}
export function getRightCheekPosition(
  ...args: Parameters<SpatialUISystem['getRightCheekPosition']>
): ReturnType<SpatialUISystem['getRightCheekPosition']> {
  return getActiveSpatialUISystem().getRightCheekPosition(...args);
}
export function calculateEyeDistance(
  ...args: Parameters<SpatialUISystem['calculateEyeDistance']>
): ReturnType<SpatialUISystem['calculateEyeDistance']> {
  return getActiveSpatialUISystem().calculateEyeDistance(...args);
}
export function calculateEyeGazeDirection(
  ...args: Parameters<SpatialUISystem['calculateEyeGazeDirection']>
): ReturnType<SpatialUISystem['calculateEyeGazeDirection']> {
  return getActiveSpatialUISystem().calculateEyeGazeDirection(...args);
}
export function calculatePupilOffset(
  ...args: Parameters<SpatialUISystem['calculatePupilOffset']>
): ReturnType<SpatialUISystem['calculatePupilOffset']> {
  return getActiveSpatialUISystem().calculatePupilOffset(...args);
}
export function calculateFaceOrientation(
  ...args: Parameters<SpatialUISystem['calculateFaceOrientation']>
): ReturnType<SpatialUISystem['calculateFaceOrientation']> {
  return getActiveSpatialUISystem().calculateFaceOrientation(...args);
}
export function calculateFaceNormal(
  ...args: Parameters<SpatialUISystem['calculateFaceNormal']>
): ReturnType<SpatialUISystem['calculateFaceNormal']> {
  return getActiveSpatialUISystem().calculateFaceNormal(...args);
}
export function calculateFaceSymmetry(
  ...args: Parameters<SpatialUISystem['calculateFaceSymmetry']>
): ReturnType<SpatialUISystem['calculateFaceSymmetry']> {
  return getActiveSpatialUISystem().calculateFaceSymmetry(...args);
}
export function calculateMouthOpening(
  ...args: Parameters<SpatialUISystem['calculateMouthOpening']>
): ReturnType<SpatialUISystem['calculateMouthOpening']> {
  return getActiveSpatialUISystem().calculateMouthOpening(...args);
}
export function calculateJawOpeningAngle(
  ...args: Parameters<SpatialUISystem['calculateJawOpeningAngle']>
): ReturnType<SpatialUISystem['calculateJawOpeningAngle']> {
  return getActiveSpatialUISystem().calculateJawOpeningAngle(...args);
}
export function calculateBlinkAmount(
  ...args: Parameters<SpatialUISystem['calculateBlinkAmount']>
): ReturnType<SpatialUISystem['calculateBlinkAmount']> {
  return getActiveSpatialUISystem().calculateBlinkAmount(...args);
}
export function calculateFacialLandmarkDistance(
  ...args: Parameters<SpatialUISystem['calculateFacialLandmarkDistance']>
): ReturnType<SpatialUISystem['calculateFacialLandmarkDistance']> {
  return getActiveSpatialUISystem().calculateFacialLandmarkDistance(...args);
}
export function getNeckPosition(
  ...args: Parameters<SpatialUISystem['getNeckPosition']>
): ReturnType<SpatialUISystem['getNeckPosition']> {
  return getActiveSpatialUISystem().getNeckPosition(...args);
}
export function getNeckCenter(
  ...args: Parameters<SpatialUISystem['getNeckCenter']>
): ReturnType<SpatialUISystem['getNeckCenter']> {
  return getActiveSpatialUISystem().getNeckCenter(...args);
}
export function getNeckBasePosition(
  ...args: Parameters<SpatialUISystem['getNeckBasePosition']>
): ReturnType<SpatialUISystem['getNeckBasePosition']> {
  return getActiveSpatialUISystem().getNeckBasePosition(...args);
}
export function getNeckTopPosition(
  ...args: Parameters<SpatialUISystem['getNeckTopPosition']>
): ReturnType<SpatialUISystem['getNeckTopPosition']> {
  return getActiveSpatialUISystem().getNeckTopPosition(...args);
}
export function getNeckForwardVector(
  ...args: Parameters<SpatialUISystem['getNeckForwardVector']>
): ReturnType<SpatialUISystem['getNeckForwardVector']> {
  return getActiveSpatialUISystem().getNeckForwardVector(...args);
}
export function getNeckUpVector(
  ...args: Parameters<SpatialUISystem['getNeckUpVector']>
): ReturnType<SpatialUISystem['getNeckUpVector']> {
  return getActiveSpatialUISystem().getNeckUpVector(...args);
}
export function calculateNeckLength(
  ...args: Parameters<SpatialUISystem['calculateNeckLength']>
): ReturnType<SpatialUISystem['calculateNeckLength']> {
  return getActiveSpatialUISystem().calculateNeckLength(...args);
}
export function calculateNeckOrientation(
  ...args: Parameters<SpatialUISystem['calculateNeckOrientation']>
): ReturnType<SpatialUISystem['calculateNeckOrientation']> {
  return getActiveSpatialUISystem().calculateNeckOrientation(...args);
}
export function calculateNeckBendAngle(
  ...args: Parameters<SpatialUISystem['calculateNeckBendAngle']>
): ReturnType<SpatialUISystem['calculateNeckBendAngle']> {
  return getActiveSpatialUISystem().calculateNeckBendAngle(...args);
}
export function calculateNeckTwistAngle(
  ...args: Parameters<SpatialUISystem['calculateNeckTwistAngle']>
): ReturnType<SpatialUISystem['calculateNeckTwistAngle']> {
  return getActiveSpatialUISystem().calculateNeckTwistAngle(...args);
}
export function calculateNeckCurvature(
  ...args: Parameters<SpatialUISystem['calculateNeckCurvature']>
): ReturnType<SpatialUISystem['calculateNeckCurvature']> {
  return getActiveSpatialUISystem().calculateNeckCurvature(...args);
}
export function calculateNeckToHeadDistance(
  ...args: Parameters<SpatialUISystem['calculateNeckToHeadDistance']>
): ReturnType<SpatialUISystem['calculateNeckToHeadDistance']> {
  return getActiveSpatialUISystem().calculateNeckToHeadDistance(...args);
}
export function calculateNeckToShoulderDistance(
  ...args: Parameters<SpatialUISystem['calculateNeckToShoulderDistance']>
): ReturnType<SpatialUISystem['calculateNeckToShoulderDistance']> {
  return getActiveSpatialUISystem().calculateNeckToShoulderDistance(...args);
}
export function calculateNeckBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateNeckBoundingBox']>
): ReturnType<SpatialUISystem['calculateNeckBoundingBox']> {
  return getActiveSpatialUISystem().calculateNeckBoundingBox(...args);
}
export function calculateNeckJointRotation(
  ...args: Parameters<SpatialUISystem['calculateNeckJointRotation']>
): ReturnType<SpatialUISystem['calculateNeckJointRotation']> {
  return getActiveSpatialUISystem().calculateNeckJointRotation(...args);
}
export function getLeftShoulderPosition(
  ...args: Parameters<SpatialUISystem['getLeftShoulderPosition']>
): ReturnType<SpatialUISystem['getLeftShoulderPosition']> {
  return getActiveSpatialUISystem().getLeftShoulderPosition(...args);
}
export function getRightShoulderPosition(
  ...args: Parameters<SpatialUISystem['getRightShoulderPosition']>
): ReturnType<SpatialUISystem['getRightShoulderPosition']> {
  return getActiveSpatialUISystem().getRightShoulderPosition(...args);
}
export function getShoulderCenter(
  ...args: Parameters<SpatialUISystem['getShoulderCenter']>
): ReturnType<SpatialUISystem['getShoulderCenter']> {
  return getActiveSpatialUISystem().getShoulderCenter(...args);
}
export function getLeftShoulderTip(
  ...args: Parameters<SpatialUISystem['getLeftShoulderTip']>
): ReturnType<SpatialUISystem['getLeftShoulderTip']> {
  return getActiveSpatialUISystem().getLeftShoulderTip(...args);
}
export function getRightShoulderTip(
  ...args: Parameters<SpatialUISystem['getRightShoulderTip']>
): ReturnType<SpatialUISystem['getRightShoulderTip']> {
  return getActiveSpatialUISystem().getRightShoulderTip(...args);
}
export function getLeftClaviclePosition(
  ...args: Parameters<SpatialUISystem['getLeftClaviclePosition']>
): ReturnType<SpatialUISystem['getLeftClaviclePosition']> {
  return getActiveSpatialUISystem().getLeftClaviclePosition(...args);
}
export function getRightClaviclePosition(
  ...args: Parameters<SpatialUISystem['getRightClaviclePosition']>
): ReturnType<SpatialUISystem['getRightClaviclePosition']> {
  return getActiveSpatialUISystem().getRightClaviclePosition(...args);
}
export function getLeftScapulaPosition(
  ...args: Parameters<SpatialUISystem['getLeftScapulaPosition']>
): ReturnType<SpatialUISystem['getLeftScapulaPosition']> {
  return getActiveSpatialUISystem().getLeftScapulaPosition(...args);
}
export function getRightScapulaPosition(
  ...args: Parameters<SpatialUISystem['getRightScapulaPosition']>
): ReturnType<SpatialUISystem['getRightScapulaPosition']> {
  return getActiveSpatialUISystem().getRightScapulaPosition(...args);
}
export function calculateShoulderWidth(
  ...args: Parameters<SpatialUISystem['calculateShoulderWidth']>
): ReturnType<SpatialUISystem['calculateShoulderWidth']> {
  return getActiveSpatialUISystem().calculateShoulderWidth(...args);
}
export function calculateShoulderHeight(
  ...args: Parameters<SpatialUISystem['calculateShoulderHeight']>
): ReturnType<SpatialUISystem['calculateShoulderHeight']> {
  return getActiveSpatialUISystem().calculateShoulderHeight(...args);
}
export function calculateShoulderSlope(
  ...args: Parameters<SpatialUISystem['calculateShoulderSlope']>
): ReturnType<SpatialUISystem['calculateShoulderSlope']> {
  return getActiveSpatialUISystem().calculateShoulderSlope(...args);
}
export function calculateShoulderSymmetry(
  ...args: Parameters<SpatialUISystem['calculateShoulderSymmetry']>
): ReturnType<SpatialUISystem['calculateShoulderSymmetry']> {
  return getActiveSpatialUISystem().calculateShoulderSymmetry(...args);
}
export function calculateShoulderDistanceToHead(
  ...args: Parameters<SpatialUISystem['calculateShoulderDistanceToHead']>
): ReturnType<SpatialUISystem['calculateShoulderDistanceToHead']> {
  return getActiveSpatialUISystem().calculateShoulderDistanceToHead(...args);
}
export function calculateShoulderDistanceToHip(
  ...args: Parameters<SpatialUISystem['calculateShoulderDistanceToHip']>
): ReturnType<SpatialUISystem['calculateShoulderDistanceToHip']> {
  return getActiveSpatialUISystem().calculateShoulderDistanceToHip(...args);
}
export function calculateShoulderToShoulderVector(
  ...args: Parameters<SpatialUISystem['calculateShoulderToShoulderVector']>
): ReturnType<SpatialUISystem['calculateShoulderToShoulderVector']> {
  return getActiveSpatialUISystem().calculateShoulderToShoulderVector(...args);
}
export function calculateShoulderForwardDirection(
  ...args: Parameters<SpatialUISystem['calculateShoulderForwardDirection']>
): ReturnType<SpatialUISystem['calculateShoulderForwardDirection']> {
  return getActiveSpatialUISystem().calculateShoulderForwardDirection(...args);
}
export function calculateShoulderUpDirection(
  ...args: Parameters<SpatialUISystem['calculateShoulderUpDirection']>
): ReturnType<SpatialUISystem['calculateShoulderUpDirection']> {
  return getActiveSpatialUISystem().calculateShoulderUpDirection(...args);
}
export function calculateShoulderJointAngle(
  ...args: Parameters<SpatialUISystem['calculateShoulderJointAngle']>
): ReturnType<SpatialUISystem['calculateShoulderJointAngle']> {
  return getActiveSpatialUISystem().calculateShoulderJointAngle(...args);
}
export function calculateShoulderAbduction(
  ...args: Parameters<SpatialUISystem['calculateShoulderAbduction']>
): ReturnType<SpatialUISystem['calculateShoulderAbduction']> {
  return getActiveSpatialUISystem().calculateShoulderAbduction(...args);
}
export function calculateShoulderAdduction(
  ...args: Parameters<SpatialUISystem['calculateShoulderAdduction']>
): ReturnType<SpatialUISystem['calculateShoulderAdduction']> {
  return getActiveSpatialUISystem().calculateShoulderAdduction(...args);
}
export function calculateShoulderFlexion(
  ...args: Parameters<SpatialUISystem['calculateShoulderFlexion']>
): ReturnType<SpatialUISystem['calculateShoulderFlexion']> {
  return getActiveSpatialUISystem().calculateShoulderFlexion(...args);
}
export function calculateShoulderExtension(
  ...args: Parameters<SpatialUISystem['calculateShoulderExtension']>
): ReturnType<SpatialUISystem['calculateShoulderExtension']> {
  return getActiveSpatialUISystem().calculateShoulderExtension(...args);
}
export function calculateShoulderInternalRotation(
  ...args: Parameters<SpatialUISystem['calculateShoulderInternalRotation']>
): ReturnType<SpatialUISystem['calculateShoulderInternalRotation']> {
  return getActiveSpatialUISystem().calculateShoulderInternalRotation(...args);
}
export function calculateShoulderExternalRotation(
  ...args: Parameters<SpatialUISystem['calculateShoulderExternalRotation']>
): ReturnType<SpatialUISystem['calculateShoulderExternalRotation']> {
  return getActiveSpatialUISystem().calculateShoulderExternalRotation(...args);
}
export function calculateShoulderBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateShoulderBoundingBox']>
): ReturnType<SpatialUISystem['calculateShoulderBoundingBox']> {
  return getActiveSpatialUISystem().calculateShoulderBoundingBox(...args);
}
export function calculateShoulderCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateShoulderCenterOfMass']>
): ReturnType<SpatialUISystem['calculateShoulderCenterOfMass']> {
  return getActiveSpatialUISystem().calculateShoulderCenterOfMass(...args);
}
export function calculateClavicleLength(
  ...args: Parameters<SpatialUISystem['calculateClavicleLength']>
): ReturnType<SpatialUISystem['calculateClavicleLength']> {
  return getActiveSpatialUISystem().calculateClavicleLength(...args);
}
export function calculateScapulaOrientation(
  ...args: Parameters<SpatialUISystem['calculateScapulaOrientation']>
): ReturnType<SpatialUISystem['calculateScapulaOrientation']> {
  return getActiveSpatialUISystem().calculateScapulaOrientation(...args);
}
export function calculateShoulderToElbowDistance(
  ...args: Parameters<SpatialUISystem['calculateShoulderToElbowDistance']>
): ReturnType<SpatialUISystem['calculateShoulderToElbowDistance']> {
  return getActiveSpatialUISystem().calculateShoulderToElbowDistance(...args);
}
export function calculateShoulderToWristDistance(
  ...args: Parameters<SpatialUISystem['calculateShoulderToWristDistance']>
): ReturnType<SpatialUISystem['calculateShoulderToWristDistance']> {
  return getActiveSpatialUISystem().calculateShoulderToWristDistance(...args);
}
export function calculateShoulderToHandDistance(
  ...args: Parameters<SpatialUISystem['calculateShoulderToHandDistance']>
): ReturnType<SpatialUISystem['calculateShoulderToHandDistance']> {
  return getActiveSpatialUISystem().calculateShoulderToHandDistance(...args);
}
export function calculateShoulderMotionVector(
  ...args: Parameters<SpatialUISystem['calculateShoulderMotionVector']>
): ReturnType<SpatialUISystem['calculateShoulderMotionVector']> {
  return getActiveSpatialUISystem().calculateShoulderMotionVector(...args);
}
export function calculateShoulderVelocity(
  ...args: Parameters<SpatialUISystem['calculateShoulderVelocity']>
): ReturnType<SpatialUISystem['calculateShoulderVelocity']> {
  return getActiveSpatialUISystem().calculateShoulderVelocity(...args);
}
export function calculateShoulderAcceleration(
  ...args: Parameters<SpatialUISystem['calculateShoulderAcceleration']>
): ReturnType<SpatialUISystem['calculateShoulderAcceleration']> {
  return getActiveSpatialUISystem().calculateShoulderAcceleration(...args);
}
export function getLeftUpperArmPosition(
  ...args: Parameters<SpatialUISystem['getLeftUpperArmPosition']>
): ReturnType<SpatialUISystem['getLeftUpperArmPosition']> {
  return getActiveSpatialUISystem().getLeftUpperArmPosition(...args);
}
export function getRightUpperArmPosition(
  ...args: Parameters<SpatialUISystem['getRightUpperArmPosition']>
): ReturnType<SpatialUISystem['getRightUpperArmPosition']> {
  return getActiveSpatialUISystem().getRightUpperArmPosition(...args);
}
export function getLeftUpperArmCenter(
  ...args: Parameters<SpatialUISystem['getLeftUpperArmCenter']>
): ReturnType<SpatialUISystem['getLeftUpperArmCenter']> {
  return getActiveSpatialUISystem().getLeftUpperArmCenter(...args);
}
export function getRightUpperArmCenter(
  ...args: Parameters<SpatialUISystem['getRightUpperArmCenter']>
): ReturnType<SpatialUISystem['getRightUpperArmCenter']> {
  return getActiveSpatialUISystem().getRightUpperArmCenter(...args);
}
export function getLeftUpperArmStart(
  ...args: Parameters<SpatialUISystem['getLeftUpperArmStart']>
): ReturnType<SpatialUISystem['getLeftUpperArmStart']> {
  return getActiveSpatialUISystem().getLeftUpperArmStart(...args);
}
export function getRightUpperArmStart(
  ...args: Parameters<SpatialUISystem['getRightUpperArmStart']>
): ReturnType<SpatialUISystem['getRightUpperArmStart']> {
  return getActiveSpatialUISystem().getRightUpperArmStart(...args);
}
export function getLeftUpperArmEnd(
  ...args: Parameters<SpatialUISystem['getLeftUpperArmEnd']>
): ReturnType<SpatialUISystem['getLeftUpperArmEnd']> {
  return getActiveSpatialUISystem().getLeftUpperArmEnd(...args);
}
export function getRightUpperArmEnd(
  ...args: Parameters<SpatialUISystem['getRightUpperArmEnd']>
): ReturnType<SpatialUISystem['getRightUpperArmEnd']> {
  return getActiveSpatialUISystem().getRightUpperArmEnd(...args);
}
export function calculateUpperArmLength(
  ...args: Parameters<SpatialUISystem['calculateUpperArmLength']>
): ReturnType<SpatialUISystem['calculateUpperArmLength']> {
  return getActiveSpatialUISystem().calculateUpperArmLength(...args);
}
export function calculateUpperArmDirection(
  ...args: Parameters<SpatialUISystem['calculateUpperArmDirection']>
): ReturnType<SpatialUISystem['calculateUpperArmDirection']> {
  return getActiveSpatialUISystem().calculateUpperArmDirection(...args);
}
export function calculateUpperArmOrientation(
  ...args: Parameters<SpatialUISystem['calculateUpperArmOrientation']>
): ReturnType<SpatialUISystem['calculateUpperArmOrientation']> {
  return getActiveSpatialUISystem().calculateUpperArmOrientation(...args);
}
export function calculateUpperArmAngle(
  ...args: Parameters<SpatialUISystem['calculateUpperArmAngle']>
): ReturnType<SpatialUISystem['calculateUpperArmAngle']> {
  return getActiveSpatialUISystem().calculateUpperArmAngle(...args);
}
export function calculateUpperArmVelocity(
  ...args: Parameters<SpatialUISystem['calculateUpperArmVelocity']>
): ReturnType<SpatialUISystem['calculateUpperArmVelocity']> {
  return getActiveSpatialUISystem().calculateUpperArmVelocity(...args);
}
export function calculateUpperArmAcceleration(
  ...args: Parameters<SpatialUISystem['calculateUpperArmAcceleration']>
): ReturnType<SpatialUISystem['calculateUpperArmAcceleration']> {
  return getActiveSpatialUISystem().calculateUpperArmAcceleration(...args);
}
export function calculateUpperArmBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateUpperArmBoundingBox']>
): ReturnType<SpatialUISystem['calculateUpperArmBoundingBox']> {
  return getActiveSpatialUISystem().calculateUpperArmBoundingBox(...args);
}
export function calculateUpperArmRadius(
  ...args: Parameters<SpatialUISystem['calculateUpperArmRadius']>
): ReturnType<SpatialUISystem['calculateUpperArmRadius']> {
  return getActiveSpatialUISystem().calculateUpperArmRadius(...args);
}
export function calculateUpperArmVolume(
  ...args: Parameters<SpatialUISystem['calculateUpperArmVolume']>
): ReturnType<SpatialUISystem['calculateUpperArmVolume']> {
  return getActiveSpatialUISystem().calculateUpperArmVolume(...args);
}
export function calculateUpperArmSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateUpperArmSurfaceArea']>
): ReturnType<SpatialUISystem['calculateUpperArmSurfaceArea']> {
  return getActiveSpatialUISystem().calculateUpperArmSurfaceArea(...args);
}
export function calculateUpperArmCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateUpperArmCenterOfMass']>
): ReturnType<SpatialUISystem['calculateUpperArmCenterOfMass']> {
  return getActiveSpatialUISystem().calculateUpperArmCenterOfMass(...args);
}
export function calculateUpperArmToTorsoDistance(
  ...args: Parameters<SpatialUISystem['calculateUpperArmToTorsoDistance']>
): ReturnType<SpatialUISystem['calculateUpperArmToTorsoDistance']> {
  return getActiveSpatialUISystem().calculateUpperArmToTorsoDistance(...args);
}
export function getLeftElbowPosition(
  ...args: Parameters<SpatialUISystem['getLeftElbowPosition']>
): ReturnType<SpatialUISystem['getLeftElbowPosition']> {
  return getActiveSpatialUISystem().getLeftElbowPosition(...args);
}
export function getRightElbowPosition(
  ...args: Parameters<SpatialUISystem['getRightElbowPosition']>
): ReturnType<SpatialUISystem['getRightElbowPosition']> {
  return getActiveSpatialUISystem().getRightElbowPosition(...args);
}
export function getLeftElbowCenter(
  ...args: Parameters<SpatialUISystem['getLeftElbowCenter']>
): ReturnType<SpatialUISystem['getLeftElbowCenter']> {
  return getActiveSpatialUISystem().getLeftElbowCenter(...args);
}
export function getRightElbowCenter(
  ...args: Parameters<SpatialUISystem['getRightElbowCenter']>
): ReturnType<SpatialUISystem['getRightElbowCenter']> {
  return getActiveSpatialUISystem().getRightElbowCenter(...args);
}
export function getLeftElbowTip(
  ...args: Parameters<SpatialUISystem['getLeftElbowTip']>
): ReturnType<SpatialUISystem['getLeftElbowTip']> {
  return getActiveSpatialUISystem().getLeftElbowTip(...args);
}
export function getRightElbowTip(
  ...args: Parameters<SpatialUISystem['getRightElbowTip']>
): ReturnType<SpatialUISystem['getRightElbowTip']> {
  return getActiveSpatialUISystem().getRightElbowTip(...args);
}
export function calculateElbowToShoulderDistance(
  ...args: Parameters<SpatialUISystem['calculateElbowToShoulderDistance']>
): ReturnType<SpatialUISystem['calculateElbowToShoulderDistance']> {
  return getActiveSpatialUISystem().calculateElbowToShoulderDistance(...args);
}
export function calculateElbowToWristDistance(
  ...args: Parameters<SpatialUISystem['calculateElbowToWristDistance']>
): ReturnType<SpatialUISystem['calculateElbowToWristDistance']> {
  return getActiveSpatialUISystem().calculateElbowToWristDistance(...args);
}
export function calculateElbowToHandDistance(
  ...args: Parameters<SpatialUISystem['calculateElbowToHandDistance']>
): ReturnType<SpatialUISystem['calculateElbowToHandDistance']> {
  return getActiveSpatialUISystem().calculateElbowToHandDistance(...args);
}
export function calculateElbowBendAngle(
  ...args: Parameters<SpatialUISystem['calculateElbowBendAngle']>
): ReturnType<SpatialUISystem['calculateElbowBendAngle']> {
  return getActiveSpatialUISystem().calculateElbowBendAngle(...args);
}
export function calculateElbowExtensionAngle(
  ...args: Parameters<SpatialUISystem['calculateElbowExtensionAngle']>
): ReturnType<SpatialUISystem['calculateElbowExtensionAngle']> {
  return getActiveSpatialUISystem().calculateElbowExtensionAngle(...args);
}
export function calculateElbowFlexionAngle(
  ...args: Parameters<SpatialUISystem['calculateElbowFlexionAngle']>
): ReturnType<SpatialUISystem['calculateElbowFlexionAngle']> {
  return getActiveSpatialUISystem().calculateElbowFlexionAngle(...args);
}
export function calculateElbowTwistAngle(
  ...args: Parameters<SpatialUISystem['calculateElbowTwistAngle']>
): ReturnType<SpatialUISystem['calculateElbowTwistAngle']> {
  return getActiveSpatialUISystem().calculateElbowTwistAngle(...args);
}
export function calculateElbowJointAxis(
  ...args: Parameters<SpatialUISystem['calculateElbowJointAxis']>
): ReturnType<SpatialUISystem['calculateElbowJointAxis']> {
  return getActiveSpatialUISystem().calculateElbowJointAxis(...args);
}
export function calculateElbowJointNormal(
  ...args: Parameters<SpatialUISystem['calculateElbowJointNormal']>
): ReturnType<SpatialUISystem['calculateElbowJointNormal']> {
  return getActiveSpatialUISystem().calculateElbowJointNormal(...args);
}
export function calculateElbowVelocity(
  ...args: Parameters<SpatialUISystem['calculateElbowVelocity']>
): ReturnType<SpatialUISystem['calculateElbowVelocity']> {
  return getActiveSpatialUISystem().calculateElbowVelocity(...args);
}
export function calculateElbowAcceleration(
  ...args: Parameters<SpatialUISystem['calculateElbowAcceleration']>
): ReturnType<SpatialUISystem['calculateElbowAcceleration']> {
  return getActiveSpatialUISystem().calculateElbowAcceleration(...args);
}
export function calculateElbowBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateElbowBoundingBox']>
): ReturnType<SpatialUISystem['calculateElbowBoundingBox']> {
  return getActiveSpatialUISystem().calculateElbowBoundingBox(...args);
}
export function calculateElbowBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateElbowBoundingSphere']>
): ReturnType<SpatialUISystem['calculateElbowBoundingSphere']> {
  return getActiveSpatialUISystem().calculateElbowBoundingSphere(...args);
}
export function calculateElbowSymmetry(
  ...args: Parameters<SpatialUISystem['calculateElbowSymmetry']>
): ReturnType<SpatialUISystem['calculateElbowSymmetry']> {
  return getActiveSpatialUISystem().calculateElbowSymmetry(...args);
}
export function calculateArmReachDistance(
  ...args: Parameters<SpatialUISystem['calculateArmReachDistance']>
): ReturnType<SpatialUISystem['calculateArmReachDistance']> {
  return getActiveSpatialUISystem().calculateArmReachDistance(...args);
}
export function calculateArmReachDirection(
  ...args: Parameters<SpatialUISystem['calculateArmReachDirection']>
): ReturnType<SpatialUISystem['calculateArmReachDirection']> {
  return getActiveSpatialUISystem().calculateArmReachDirection(...args);
}
export function calculateArmReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateArmReachEnvelope']>
): ReturnType<SpatialUISystem['calculateArmReachEnvelope']> {
  return getActiveSpatialUISystem().calculateArmReachEnvelope(...args);
}
export function calculateArmSweepAngle(
  ...args: Parameters<SpatialUISystem['calculateArmSweepAngle']>
): ReturnType<SpatialUISystem['calculateArmSweepAngle']> {
  return getActiveSpatialUISystem().calculateArmSweepAngle(...args);
}
export function calculateArmSwingAmplitude(
  ...args: Parameters<SpatialUISystem['calculateArmSwingAmplitude']>
): ReturnType<SpatialUISystem['calculateArmSwingAmplitude']> {
  return getActiveSpatialUISystem().calculateArmSwingAmplitude(...args);
}
export function calculateArmPoseError(
  ...args: Parameters<SpatialUISystem['calculateArmPoseError']>
): ReturnType<SpatialUISystem['calculateArmPoseError']> {
  return getActiveSpatialUISystem().calculateArmPoseError(...args);
}
export function calculateArmSegmentAlignment(
  ...args: Parameters<SpatialUISystem['calculateArmSegmentAlignment']>
): ReturnType<SpatialUISystem['calculateArmSegmentAlignment']> {
  return getActiveSpatialUISystem().calculateArmSegmentAlignment(...args);
}
export function calculateArmJointChainLength(
  ...args: Parameters<SpatialUISystem['calculateArmJointChainLength']>
): ReturnType<SpatialUISystem['calculateArmJointChainLength']> {
  return getActiveSpatialUISystem().calculateArmJointChainLength(...args);
}
export function calculateArmEndEffectorPosition(
  ...args: Parameters<SpatialUISystem['calculateArmEndEffectorPosition']>
): ReturnType<SpatialUISystem['calculateArmEndEffectorPosition']> {
  return getActiveSpatialUISystem().calculateArmEndEffectorPosition(...args);
}
export function calculateArmInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateArmInverseKinematics']>
): ReturnType<SpatialUISystem['calculateArmInverseKinematics']> {
  return getActiveSpatialUISystem().calculateArmInverseKinematics(...args);
}
export function getLeftForearmPosition(
  ...args: Parameters<SpatialUISystem['getLeftForearmPosition']>
): ReturnType<SpatialUISystem['getLeftForearmPosition']> {
  return getActiveSpatialUISystem().getLeftForearmPosition(...args);
}
export function getRightForearmPosition(
  ...args: Parameters<SpatialUISystem['getRightForearmPosition']>
): ReturnType<SpatialUISystem['getRightForearmPosition']> {
  return getActiveSpatialUISystem().getRightForearmPosition(...args);
}
export function getLeftForearmCenter(
  ...args: Parameters<SpatialUISystem['getLeftForearmCenter']>
): ReturnType<SpatialUISystem['getLeftForearmCenter']> {
  return getActiveSpatialUISystem().getLeftForearmCenter(...args);
}
export function getRightForearmCenter(
  ...args: Parameters<SpatialUISystem['getRightForearmCenter']>
): ReturnType<SpatialUISystem['getRightForearmCenter']> {
  return getActiveSpatialUISystem().getRightForearmCenter(...args);
}
export function getLeftForearmStart(
  ...args: Parameters<SpatialUISystem['getLeftForearmStart']>
): ReturnType<SpatialUISystem['getLeftForearmStart']> {
  return getActiveSpatialUISystem().getLeftForearmStart(...args);
}
export function getRightForearmStart(
  ...args: Parameters<SpatialUISystem['getRightForearmStart']>
): ReturnType<SpatialUISystem['getRightForearmStart']> {
  return getActiveSpatialUISystem().getRightForearmStart(...args);
}
export function getLeftForearmEnd(
  ...args: Parameters<SpatialUISystem['getLeftForearmEnd']>
): ReturnType<SpatialUISystem['getLeftForearmEnd']> {
  return getActiveSpatialUISystem().getLeftForearmEnd(...args);
}
export function getRightForearmEnd(
  ...args: Parameters<SpatialUISystem['getRightForearmEnd']>
): ReturnType<SpatialUISystem['getRightForearmEnd']> {
  return getActiveSpatialUISystem().getRightForearmEnd(...args);
}
export function calculateForearmLength(
  ...args: Parameters<SpatialUISystem['calculateForearmLength']>
): ReturnType<SpatialUISystem['calculateForearmLength']> {
  return getActiveSpatialUISystem().calculateForearmLength(...args);
}
export function calculateForearmDirection(
  ...args: Parameters<SpatialUISystem['calculateForearmDirection']>
): ReturnType<SpatialUISystem['calculateForearmDirection']> {
  return getActiveSpatialUISystem().calculateForearmDirection(...args);
}
export function calculateForearmOrientation(
  ...args: Parameters<SpatialUISystem['calculateForearmOrientation']>
): ReturnType<SpatialUISystem['calculateForearmOrientation']> {
  return getActiveSpatialUISystem().calculateForearmOrientation(...args);
}
export function calculateForearmAngle(
  ...args: Parameters<SpatialUISystem['calculateForearmAngle']>
): ReturnType<SpatialUISystem['calculateForearmAngle']> {
  return getActiveSpatialUISystem().calculateForearmAngle(...args);
}
export function calculateForearmVelocity(
  ...args: Parameters<SpatialUISystem['calculateForearmVelocity']>
): ReturnType<SpatialUISystem['calculateForearmVelocity']> {
  return getActiveSpatialUISystem().calculateForearmVelocity(...args);
}
export function calculateForearmAcceleration(
  ...args: Parameters<SpatialUISystem['calculateForearmAcceleration']>
): ReturnType<SpatialUISystem['calculateForearmAcceleration']> {
  return getActiveSpatialUISystem().calculateForearmAcceleration(...args);
}
export function calculateForearmBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateForearmBoundingBox']>
): ReturnType<SpatialUISystem['calculateForearmBoundingBox']> {
  return getActiveSpatialUISystem().calculateForearmBoundingBox(...args);
}
export function calculateForearmRadius(
  ...args: Parameters<SpatialUISystem['calculateForearmRadius']>
): ReturnType<SpatialUISystem['calculateForearmRadius']> {
  return getActiveSpatialUISystem().calculateForearmRadius(...args);
}
export function calculateForearmVolume(
  ...args: Parameters<SpatialUISystem['calculateForearmVolume']>
): ReturnType<SpatialUISystem['calculateForearmVolume']> {
  return getActiveSpatialUISystem().calculateForearmVolume(...args);
}
export function calculateForearmSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateForearmSurfaceArea']>
): ReturnType<SpatialUISystem['calculateForearmSurfaceArea']> {
  return getActiveSpatialUISystem().calculateForearmSurfaceArea(...args);
}
export function calculateForearmCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateForearmCenterOfMass']>
): ReturnType<SpatialUISystem['calculateForearmCenterOfMass']> {
  return getActiveSpatialUISystem().calculateForearmCenterOfMass(...args);
}
export function calculateForearmTwist(
  ...args: Parameters<SpatialUISystem['calculateForearmTwist']>
): ReturnType<SpatialUISystem['calculateForearmTwist']> {
  return getActiveSpatialUISystem().calculateForearmTwist(...args);
}
export function getLeftWristPosition(
  ...args: Parameters<SpatialUISystem['getLeftWristPosition']>
): ReturnType<SpatialUISystem['getLeftWristPosition']> {
  return getActiveSpatialUISystem().getLeftWristPosition(...args);
}
export function getRightWristPosition(
  ...args: Parameters<SpatialUISystem['getRightWristPosition']>
): ReturnType<SpatialUISystem['getRightWristPosition']> {
  return getActiveSpatialUISystem().getRightWristPosition(...args);
}
export function getLeftWristCenter(
  ...args: Parameters<SpatialUISystem['getLeftWristCenter']>
): ReturnType<SpatialUISystem['getLeftWristCenter']> {
  return getActiveSpatialUISystem().getLeftWristCenter(...args);
}
export function getRightWristCenter(
  ...args: Parameters<SpatialUISystem['getRightWristCenter']>
): ReturnType<SpatialUISystem['getRightWristCenter']> {
  return getActiveSpatialUISystem().getRightWristCenter(...args);
}
export function getLeftWristJointPosition(
  ...args: Parameters<SpatialUISystem['getLeftWristJointPosition']>
): ReturnType<SpatialUISystem['getLeftWristJointPosition']> {
  return getActiveSpatialUISystem().getLeftWristJointPosition(...args);
}
export function getRightWristJointPosition(
  ...args: Parameters<SpatialUISystem['getRightWristJointPosition']>
): ReturnType<SpatialUISystem['getRightWristJointPosition']> {
  return getActiveSpatialUISystem().getRightWristJointPosition(...args);
}
export function getLeftWristFrontPosition(
  ...args: Parameters<SpatialUISystem['getLeftWristFrontPosition']>
): ReturnType<SpatialUISystem['getLeftWristFrontPosition']> {
  return getActiveSpatialUISystem().getLeftWristFrontPosition(...args);
}
export function getRightWristFrontPosition(
  ...args: Parameters<SpatialUISystem['getRightWristFrontPosition']>
): ReturnType<SpatialUISystem['getRightWristFrontPosition']> {
  return getActiveSpatialUISystem().getRightWristFrontPosition(...args);
}
export function getLeftWristBackPosition(
  ...args: Parameters<SpatialUISystem['getLeftWristBackPosition']>
): ReturnType<SpatialUISystem['getLeftWristBackPosition']> {
  return getActiveSpatialUISystem().getLeftWristBackPosition(...args);
}
export function getRightWristBackPosition(
  ...args: Parameters<SpatialUISystem['getRightWristBackPosition']>
): ReturnType<SpatialUISystem['getRightWristBackPosition']> {
  return getActiveSpatialUISystem().getRightWristBackPosition(...args);
}
export function calculateWristToElbowDistance(
  ...args: Parameters<SpatialUISystem['calculateWristToElbowDistance']>
): ReturnType<SpatialUISystem['calculateWristToElbowDistance']> {
  return getActiveSpatialUISystem().calculateWristToElbowDistance(...args);
}
export function calculateWristToPalmDistance(
  ...args: Parameters<SpatialUISystem['calculateWristToPalmDistance']>
): ReturnType<SpatialUISystem['calculateWristToPalmDistance']> {
  return getActiveSpatialUISystem().calculateWristToPalmDistance(...args);
}
export function calculateWristWidth(
  ...args: Parameters<SpatialUISystem['calculateWristWidth']>
): ReturnType<SpatialUISystem['calculateWristWidth']> {
  return getActiveSpatialUISystem().calculateWristWidth(...args);
}
export function calculateWristThickness(
  ...args: Parameters<SpatialUISystem['calculateWristThickness']>
): ReturnType<SpatialUISystem['calculateWristThickness']> {
  return getActiveSpatialUISystem().calculateWristThickness(...args);
}
export function calculateWristFlexion(
  ...args: Parameters<SpatialUISystem['calculateWristFlexion']>
): ReturnType<SpatialUISystem['calculateWristFlexion']> {
  return getActiveSpatialUISystem().calculateWristFlexion(...args);
}
export function calculateWristExtension(
  ...args: Parameters<SpatialUISystem['calculateWristExtension']>
): ReturnType<SpatialUISystem['calculateWristExtension']> {
  return getActiveSpatialUISystem().calculateWristExtension(...args);
}
export function calculateWristAbduction(
  ...args: Parameters<SpatialUISystem['calculateWristAbduction']>
): ReturnType<SpatialUISystem['calculateWristAbduction']> {
  return getActiveSpatialUISystem().calculateWristAbduction(...args);
}
export function calculateWristAdduction(
  ...args: Parameters<SpatialUISystem['calculateWristAdduction']>
): ReturnType<SpatialUISystem['calculateWristAdduction']> {
  return getActiveSpatialUISystem().calculateWristAdduction(...args);
}
export function calculateWristPronation(
  ...args: Parameters<SpatialUISystem['calculateWristPronation']>
): ReturnType<SpatialUISystem['calculateWristPronation']> {
  return getActiveSpatialUISystem().calculateWristPronation(...args);
}
export function calculateWristSupination(
  ...args: Parameters<SpatialUISystem['calculateWristSupination']>
): ReturnType<SpatialUISystem['calculateWristSupination']> {
  return getActiveSpatialUISystem().calculateWristSupination(...args);
}
export function calculateWristJointAxis(
  ...args: Parameters<SpatialUISystem['calculateWristJointAxis']>
): ReturnType<SpatialUISystem['calculateWristJointAxis']> {
  return getActiveSpatialUISystem().calculateWristJointAxis(...args);
}
export function calculateWristJointNormal(
  ...args: Parameters<SpatialUISystem['calculateWristJointNormal']>
): ReturnType<SpatialUISystem['calculateWristJointNormal']> {
  return getActiveSpatialUISystem().calculateWristJointNormal(...args);
}
export function calculateWristVelocity(
  ...args: Parameters<SpatialUISystem['calculateWristVelocity']>
): ReturnType<SpatialUISystem['calculateWristVelocity']> {
  return getActiveSpatialUISystem().calculateWristVelocity(...args);
}
export function calculateWristAcceleration(
  ...args: Parameters<SpatialUISystem['calculateWristAcceleration']>
): ReturnType<SpatialUISystem['calculateWristAcceleration']> {
  return getActiveSpatialUISystem().calculateWristAcceleration(...args);
}
export function calculateWristBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateWristBoundingBox']>
): ReturnType<SpatialUISystem['calculateWristBoundingBox']> {
  return getActiveSpatialUISystem().calculateWristBoundingBox(...args);
}
export function calculateWristBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateWristBoundingSphere']>
): ReturnType<SpatialUISystem['calculateWristBoundingSphere']> {
  return getActiveSpatialUISystem().calculateWristBoundingSphere(...args);
}
export function calculateWristTrajectory(
  ...args: Parameters<SpatialUISystem['calculateWristTrajectory']>
): ReturnType<SpatialUISystem['calculateWristTrajectory']> {
  return getActiveSpatialUISystem().calculateWristTrajectory(...args);
}
export function calculateWristMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateWristMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateWristMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateWristMotionSmoothness(...args);
}
export function calculateWristPoseError(
  ...args: Parameters<SpatialUISystem['calculateWristPoseError']>
): ReturnType<SpatialUISystem['calculateWristPoseError']> {
  return getActiveSpatialUISystem().calculateWristPoseError(...args);
}
export function calculateWristTargetOffset(
  ...args: Parameters<SpatialUISystem['calculateWristTargetOffset']>
): ReturnType<SpatialUISystem['calculateWristTargetOffset']> {
  return getActiveSpatialUISystem().calculateWristTargetOffset(...args);
}
export function getLeftHandPosition(
  ...args: Parameters<SpatialUISystem['getLeftHandPosition']>
): ReturnType<SpatialUISystem['getLeftHandPosition']> {
  return getActiveSpatialUISystem().getLeftHandPosition(...args);
}
export function getRightHandPosition(
  ...args: Parameters<SpatialUISystem['getRightHandPosition']>
): ReturnType<SpatialUISystem['getRightHandPosition']> {
  return getActiveSpatialUISystem().getRightHandPosition(...args);
}
export function getLeftHandCenter(
  ...args: Parameters<SpatialUISystem['getLeftHandCenter']>
): ReturnType<SpatialUISystem['getLeftHandCenter']> {
  return getActiveSpatialUISystem().getLeftHandCenter(...args);
}
export function getRightHandCenter(
  ...args: Parameters<SpatialUISystem['getRightHandCenter']>
): ReturnType<SpatialUISystem['getRightHandCenter']> {
  return getActiveSpatialUISystem().getRightHandCenter(...args);
}
export function getPalmCenter(
  ...args: Parameters<SpatialUISystem['getPalmCenter']>
): ReturnType<SpatialUISystem['getPalmCenter']> {
  return getActiveSpatialUISystem().getPalmCenter(...args);
}
export function getPalmBasePosition(
  ...args: Parameters<SpatialUISystem['getPalmBasePosition']>
): ReturnType<SpatialUISystem['getPalmBasePosition']> {
  return getActiveSpatialUISystem().getPalmBasePosition(...args);
}
export function getPalmTopPosition(
  ...args: Parameters<SpatialUISystem['getPalmTopPosition']>
): ReturnType<SpatialUISystem['getPalmTopPosition']> {
  return getActiveSpatialUISystem().getPalmTopPosition(...args);
}
export function getPalmLeftEdge(
  ...args: Parameters<SpatialUISystem['getPalmLeftEdge']>
): ReturnType<SpatialUISystem['getPalmLeftEdge']> {
  return getActiveSpatialUISystem().getPalmLeftEdge(...args);
}
export function getPalmRightEdge(
  ...args: Parameters<SpatialUISystem['getPalmRightEdge']>
): ReturnType<SpatialUISystem['getPalmRightEdge']> {
  return getActiveSpatialUISystem().getPalmRightEdge(...args);
}
export function getPalmFrontPosition(
  ...args: Parameters<SpatialUISystem['getPalmFrontPosition']>
): ReturnType<SpatialUISystem['getPalmFrontPosition']> {
  return getActiveSpatialUISystem().getPalmFrontPosition(...args);
}
export function getPalmBackPosition(
  ...args: Parameters<SpatialUISystem['getPalmBackPosition']>
): ReturnType<SpatialUISystem['getPalmBackPosition']> {
  return getActiveSpatialUISystem().getPalmBackPosition(...args);
}
export function getPalmNormal(
  ...args: Parameters<SpatialUISystem['getPalmNormal']>
): ReturnType<SpatialUISystem['getPalmNormal']> {
  return getActiveSpatialUISystem().getPalmNormal(...args);
}
export function getPalmForwardVector(
  ...args: Parameters<SpatialUISystem['getPalmForwardVector']>
): ReturnType<SpatialUISystem['getPalmForwardVector']> {
  return getActiveSpatialUISystem().getPalmForwardVector(...args);
}
export function getPalmUpVector(
  ...args: Parameters<SpatialUISystem['getPalmUpVector']>
): ReturnType<SpatialUISystem['getPalmUpVector']> {
  return getActiveSpatialUISystem().getPalmUpVector(...args);
}
export function getPalmRightVector(
  ...args: Parameters<SpatialUISystem['getPalmRightVector']>
): ReturnType<SpatialUISystem['getPalmRightVector']> {
  return getActiveSpatialUISystem().getPalmRightVector(...args);
}
export function calculatePalmWidth(
  ...args: Parameters<SpatialUISystem['calculatePalmWidth']>
): ReturnType<SpatialUISystem['calculatePalmWidth']> {
  return getActiveSpatialUISystem().calculatePalmWidth(...args);
}
export function calculatePalmLength(
  ...args: Parameters<SpatialUISystem['calculatePalmLength']>
): ReturnType<SpatialUISystem['calculatePalmLength']> {
  return getActiveSpatialUISystem().calculatePalmLength(...args);
}
export function calculatePalmThickness(
  ...args: Parameters<SpatialUISystem['calculatePalmThickness']>
): ReturnType<SpatialUISystem['calculatePalmThickness']> {
  return getActiveSpatialUISystem().calculatePalmThickness(...args);
}
export function calculatePalmArea(
  ...args: Parameters<SpatialUISystem['calculatePalmArea']>
): ReturnType<SpatialUISystem['calculatePalmArea']> {
  return getActiveSpatialUISystem().calculatePalmArea(...args);
}
export function calculatePalmVolume(
  ...args: Parameters<SpatialUISystem['calculatePalmVolume']>
): ReturnType<SpatialUISystem['calculatePalmVolume']> {
  return getActiveSpatialUISystem().calculatePalmVolume(...args);
}
export function calculatePalmOrientation(
  ...args: Parameters<SpatialUISystem['calculatePalmOrientation']>
): ReturnType<SpatialUISystem['calculatePalmOrientation']> {
  return getActiveSpatialUISystem().calculatePalmOrientation(...args);
}
export function calculatePalmRotation(
  ...args: Parameters<SpatialUISystem['calculatePalmRotation']>
): ReturnType<SpatialUISystem['calculatePalmRotation']> {
  return getActiveSpatialUISystem().calculatePalmRotation(...args);
}
export function calculatePalmTilt(
  ...args: Parameters<SpatialUISystem['calculatePalmTilt']>
): ReturnType<SpatialUISystem['calculatePalmTilt']> {
  return getActiveSpatialUISystem().calculatePalmTilt(...args);
}
export function calculatePalmCurvature(
  ...args: Parameters<SpatialUISystem['calculatePalmCurvature']>
): ReturnType<SpatialUISystem['calculatePalmCurvature']> {
  return getActiveSpatialUISystem().calculatePalmCurvature(...args);
}
export function calculatePalmCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculatePalmCenterOfMass']>
): ReturnType<SpatialUISystem['calculatePalmCenterOfMass']> {
  return getActiveSpatialUISystem().calculatePalmCenterOfMass(...args);
}
export function calculatePalmBoundingBox(
  ...args: Parameters<SpatialUISystem['calculatePalmBoundingBox']>
): ReturnType<SpatialUISystem['calculatePalmBoundingBox']> {
  return getActiveSpatialUISystem().calculatePalmBoundingBox(...args);
}
export function calculatePalmBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculatePalmBoundingSphere']>
): ReturnType<SpatialUISystem['calculatePalmBoundingSphere']> {
  return getActiveSpatialUISystem().calculatePalmBoundingSphere(...args);
}
export function calculatePalmSymmetry(
  ...args: Parameters<SpatialUISystem['calculatePalmSymmetry']>
): ReturnType<SpatialUISystem['calculatePalmSymmetry']> {
  return getActiveSpatialUISystem().calculatePalmSymmetry(...args);
}
export function calculatePalmToWristDistance(
  ...args: Parameters<SpatialUISystem['calculatePalmToWristDistance']>
): ReturnType<SpatialUISystem['calculatePalmToWristDistance']> {
  return getActiveSpatialUISystem().calculatePalmToWristDistance(...args);
}
export function calculatePalmToFingerBaseDistance(
  ...args: Parameters<SpatialUISystem['calculatePalmToFingerBaseDistance']>
): ReturnType<SpatialUISystem['calculatePalmToFingerBaseDistance']> {
  return getActiveSpatialUISystem().calculatePalmToFingerBaseDistance(...args);
}
export function calculateHandSpan(
  ...args: Parameters<SpatialUISystem['calculateHandSpan']>
): ReturnType<SpatialUISystem['calculateHandSpan']> {
  return getActiveSpatialUISystem().calculateHandSpan(...args);
}
export function calculateHandWidth(
  ...args: Parameters<SpatialUISystem['calculateHandWidth']>
): ReturnType<SpatialUISystem['calculateHandWidth']> {
  return getActiveSpatialUISystem().calculateHandWidth(...args);
}
export function calculateHandLength(
  ...args: Parameters<SpatialUISystem['calculateHandLength']>
): ReturnType<SpatialUISystem['calculateHandLength']> {
  return getActiveSpatialUISystem().calculateHandLength(...args);
}
export function calculateHandThickness(
  ...args: Parameters<SpatialUISystem['calculateHandThickness']>
): ReturnType<SpatialUISystem['calculateHandThickness']> {
  return getActiveSpatialUISystem().calculateHandThickness(...args);
}
export function calculateHandOrientation(
  ...args: Parameters<SpatialUISystem['calculateHandOrientation']>
): ReturnType<SpatialUISystem['calculateHandOrientation']> {
  return getActiveSpatialUISystem().calculateHandOrientation(...args);
}
export function calculateHandForwardDirection(
  ...args: Parameters<SpatialUISystem['calculateHandForwardDirection']>
): ReturnType<SpatialUISystem['calculateHandForwardDirection']> {
  return getActiveSpatialUISystem().calculateHandForwardDirection(...args);
}
export function calculateHandUpDirection(
  ...args: Parameters<SpatialUISystem['calculateHandUpDirection']>
): ReturnType<SpatialUISystem['calculateHandUpDirection']> {
  return getActiveSpatialUISystem().calculateHandUpDirection(...args);
}
export function calculateHandRightDirection(
  ...args: Parameters<SpatialUISystem['calculateHandRightDirection']>
): ReturnType<SpatialUISystem['calculateHandRightDirection']> {
  return getActiveSpatialUISystem().calculateHandRightDirection(...args);
}
export function calculateHandVelocity(
  ...args: Parameters<SpatialUISystem['calculateHandVelocity']>
): ReturnType<SpatialUISystem['calculateHandVelocity']> {
  return getActiveSpatialUISystem().calculateHandVelocity(...args);
}
export function calculateHandAcceleration(
  ...args: Parameters<SpatialUISystem['calculateHandAcceleration']>
): ReturnType<SpatialUISystem['calculateHandAcceleration']> {
  return getActiveSpatialUISystem().calculateHandAcceleration(...args);
}
export function calculateHandAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateHandAngularVelocity']>
): ReturnType<SpatialUISystem['calculateHandAngularVelocity']> {
  return getActiveSpatialUISystem().calculateHandAngularVelocity(...args);
}
export function calculateHandAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateHandAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateHandAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateHandAngularAcceleration(...args);
}
export function calculateHandTrajectory(
  ...args: Parameters<SpatialUISystem['calculateHandTrajectory']>
): ReturnType<SpatialUISystem['calculateHandTrajectory']> {
  return getActiveSpatialUISystem().calculateHandTrajectory(...args);
}
export function calculateHandMotionDirection(
  ...args: Parameters<SpatialUISystem['calculateHandMotionDirection']>
): ReturnType<SpatialUISystem['calculateHandMotionDirection']> {
  return getActiveSpatialUISystem().calculateHandMotionDirection(...args);
}
export function calculateHandMotionDistance(
  ...args: Parameters<SpatialUISystem['calculateHandMotionDistance']>
): ReturnType<SpatialUISystem['calculateHandMotionDistance']> {
  return getActiveSpatialUISystem().calculateHandMotionDistance(...args);
}
export function calculateHandPose(
  ...args: Parameters<SpatialUISystem['calculateHandPose']>
): ReturnType<SpatialUISystem['calculateHandPose']> {
  return getActiveSpatialUISystem().calculateHandPose(...args);
}
export function calculateHandPoseDifference(
  ...args: Parameters<SpatialUISystem['calculateHandPoseDifference']>
): ReturnType<SpatialUISystem['calculateHandPoseDifference']> {
  return getActiveSpatialUISystem().calculateHandPoseDifference(...args);
}
export function calculateHandPoseSimilarity(
  ...args: Parameters<SpatialUISystem['calculateHandPoseSimilarity']>
): ReturnType<SpatialUISystem['calculateHandPoseSimilarity']> {
  return getActiveSpatialUISystem().calculateHandPoseSimilarity(...args);
}
export function calculateHandJointAngles(
  ...args: Parameters<SpatialUISystem['calculateHandJointAngles']>
): ReturnType<SpatialUISystem['calculateHandJointAngles']> {
  return getActiveSpatialUISystem().calculateHandJointAngles(...args);
}
export function calculateHandInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateHandInverseKinematics']>
): ReturnType<SpatialUISystem['calculateHandInverseKinematics']> {
  return getActiveSpatialUISystem().calculateHandInverseKinematics(...args);
}
export function getThumbRootPosition(
  ...args: Parameters<SpatialUISystem['getThumbRootPosition']>
): ReturnType<SpatialUISystem['getThumbRootPosition']> {
  return getActiveSpatialUISystem().getThumbRootPosition(...args);
}
export function getThumbCMCPosition(
  ...args: Parameters<SpatialUISystem['getThumbCMCPosition']>
): ReturnType<SpatialUISystem['getThumbCMCPosition']> {
  return getActiveSpatialUISystem().getThumbCMCPosition(...args);
}
export function getThumbMCPPosition(
  ...args: Parameters<SpatialUISystem['getThumbMCPPosition']>
): ReturnType<SpatialUISystem['getThumbMCPPosition']> {
  return getActiveSpatialUISystem().getThumbMCPPosition(...args);
}
export function getThumbIPPosition(
  ...args: Parameters<SpatialUISystem['getThumbIPPosition']>
): ReturnType<SpatialUISystem['getThumbIPPosition']> {
  return getActiveSpatialUISystem().getThumbIPPosition(...args);
}
export function getThumbTipPosition(
  ...args: Parameters<SpatialUISystem['getThumbTipPosition']>
): ReturnType<SpatialUISystem['getThumbTipPosition']> {
  return getActiveSpatialUISystem().getThumbTipPosition(...args);
}
export function getThumbNailPosition(
  ...args: Parameters<SpatialUISystem['getThumbNailPosition']>
): ReturnType<SpatialUISystem['getThumbNailPosition']> {
  return getActiveSpatialUISystem().getThumbNailPosition(...args);
}
export function getThumbPadPosition(
  ...args: Parameters<SpatialUISystem['getThumbPadPosition']>
): ReturnType<SpatialUISystem['getThumbPadPosition']> {
  return getActiveSpatialUISystem().getThumbPadPosition(...args);
}
export function getThumbBasePosition(
  ...args: Parameters<SpatialUISystem['getThumbBasePosition']>
): ReturnType<SpatialUISystem['getThumbBasePosition']> {
  return getActiveSpatialUISystem().getThumbBasePosition(...args);
}
export function getThumbProximalJoint(
  ...args: Parameters<SpatialUISystem['getThumbProximalJoint']>
): ReturnType<SpatialUISystem['getThumbProximalJoint']> {
  return getActiveSpatialUISystem().getThumbProximalJoint(...args);
}
export function getThumbDistalJoint(
  ...args: Parameters<SpatialUISystem['getThumbDistalJoint']>
): ReturnType<SpatialUISystem['getThumbDistalJoint']> {
  return getActiveSpatialUISystem().getThumbDistalJoint(...args);
}
export function calculateThumbLength(
  ...args: Parameters<SpatialUISystem['calculateThumbLength']>
): ReturnType<SpatialUISystem['calculateThumbLength']> {
  return getActiveSpatialUISystem().calculateThumbLength(...args);
}
export function calculateThumbWidth(
  ...args: Parameters<SpatialUISystem['calculateThumbWidth']>
): ReturnType<SpatialUISystem['calculateThumbWidth']> {
  return getActiveSpatialUISystem().calculateThumbWidth(...args);
}
export function calculateThumbThickness(
  ...args: Parameters<SpatialUISystem['calculateThumbThickness']>
): ReturnType<SpatialUISystem['calculateThumbThickness']> {
  return getActiveSpatialUISystem().calculateThumbThickness(...args);
}
export function calculateThumbCurvature(
  ...args: Parameters<SpatialUISystem['calculateThumbCurvature']>
): ReturnType<SpatialUISystem['calculateThumbCurvature']> {
  return getActiveSpatialUISystem().calculateThumbCurvature(...args);
}
export function calculateThumbDirection(
  ...args: Parameters<SpatialUISystem['calculateThumbDirection']>
): ReturnType<SpatialUISystem['calculateThumbDirection']> {
  return getActiveSpatialUISystem().calculateThumbDirection(...args);
}
export function calculateThumbOrientation(
  ...args: Parameters<SpatialUISystem['calculateThumbOrientation']>
): ReturnType<SpatialUISystem['calculateThumbOrientation']> {
  return getActiveSpatialUISystem().calculateThumbOrientation(...args);
}
export function calculateThumbFlexion(
  ...args: Parameters<SpatialUISystem['calculateThumbFlexion']>
): ReturnType<SpatialUISystem['calculateThumbFlexion']> {
  return getActiveSpatialUISystem().calculateThumbFlexion(...args);
}
export function calculateThumbExtension(
  ...args: Parameters<SpatialUISystem['calculateThumbExtension']>
): ReturnType<SpatialUISystem['calculateThumbExtension']> {
  return getActiveSpatialUISystem().calculateThumbExtension(...args);
}
export function calculateThumbAbduction(
  ...args: Parameters<SpatialUISystem['calculateThumbAbduction']>
): ReturnType<SpatialUISystem['calculateThumbAbduction']> {
  return getActiveSpatialUISystem().calculateThumbAbduction(...args);
}
export function calculateThumbAdduction(
  ...args: Parameters<SpatialUISystem['calculateThumbAdduction']>
): ReturnType<SpatialUISystem['calculateThumbAdduction']> {
  return getActiveSpatialUISystem().calculateThumbAdduction(...args);
}
export function calculateThumbOpposition(
  ...args: Parameters<SpatialUISystem['calculateThumbOpposition']>
): ReturnType<SpatialUISystem['calculateThumbOpposition']> {
  return getActiveSpatialUISystem().calculateThumbOpposition(...args);
}
export function calculateThumbRotation(
  ...args: Parameters<SpatialUISystem['calculateThumbRotation']>
): ReturnType<SpatialUISystem['calculateThumbRotation']> {
  return getActiveSpatialUISystem().calculateThumbRotation(...args);
}
export function calculateThumbTipVelocity(
  ...args: Parameters<SpatialUISystem['calculateThumbTipVelocity']>
): ReturnType<SpatialUISystem['calculateThumbTipVelocity']> {
  return getActiveSpatialUISystem().calculateThumbTipVelocity(...args);
}
export function calculateThumbTipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateThumbTipAcceleration']>
): ReturnType<SpatialUISystem['calculateThumbTipAcceleration']> {
  return getActiveSpatialUISystem().calculateThumbTipAcceleration(...args);
}
export function calculateThumbJointAngles(
  ...args: Parameters<SpatialUISystem['calculateThumbJointAngles']>
): ReturnType<SpatialUISystem['calculateThumbJointAngles']> {
  return getActiveSpatialUISystem().calculateThumbJointAngles(...args);
}
export function calculateThumbSegmentLengths(
  ...args: Parameters<SpatialUISystem['calculateThumbSegmentLengths']>
): ReturnType<SpatialUISystem['calculateThumbSegmentLengths']> {
  return getActiveSpatialUISystem().calculateThumbSegmentLengths(...args);
}
export function calculateThumbBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateThumbBoundingBox']>
): ReturnType<SpatialUISystem['calculateThumbBoundingBox']> {
  return getActiveSpatialUISystem().calculateThumbBoundingBox(...args);
}
export function calculateThumbBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateThumbBoundingSphere']>
): ReturnType<SpatialUISystem['calculateThumbBoundingSphere']> {
  return getActiveSpatialUISystem().calculateThumbBoundingSphere(...args);
}
export function calculateThumbTipDistanceToIndex(
  ...args: Parameters<SpatialUISystem['calculateThumbTipDistanceToIndex']>
): ReturnType<SpatialUISystem['calculateThumbTipDistanceToIndex']> {
  return getActiveSpatialUISystem().calculateThumbTipDistanceToIndex(...args);
}
export function calculateThumbTipDistanceToMiddle(
  ...args: Parameters<SpatialUISystem['calculateThumbTipDistanceToMiddle']>
): ReturnType<SpatialUISystem['calculateThumbTipDistanceToMiddle']> {
  return getActiveSpatialUISystem().calculateThumbTipDistanceToMiddle(...args);
}
export function calculateThumbTipDistanceToRing(
  ...args: Parameters<SpatialUISystem['calculateThumbTipDistanceToRing']>
): ReturnType<SpatialUISystem['calculateThumbTipDistanceToRing']> {
  return getActiveSpatialUISystem().calculateThumbTipDistanceToRing(...args);
}
export function calculateThumbTipDistanceToLittle(
  ...args: Parameters<SpatialUISystem['calculateThumbTipDistanceToLittle']>
): ReturnType<SpatialUISystem['calculateThumbTipDistanceToLittle']> {
  return getActiveSpatialUISystem().calculateThumbTipDistanceToLittle(...args);
}
export function calculateThumbPinchDistance(
  ...args: Parameters<SpatialUISystem['calculateThumbPinchDistance']>
): ReturnType<SpatialUISystem['calculateThumbPinchDistance']> {
  return getActiveSpatialUISystem().calculateThumbPinchDistance(...args);
}
export function calculateThumbPinchStrength(
  ...args: Parameters<SpatialUISystem['calculateThumbPinchStrength']>
): ReturnType<SpatialUISystem['calculateThumbPinchStrength']> {
  return getActiveSpatialUISystem().calculateThumbPinchStrength(...args);
}
export function calculateThumbReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateThumbReachEnvelope']>
): ReturnType<SpatialUISystem['calculateThumbReachEnvelope']> {
  return getActiveSpatialUISystem().calculateThumbReachEnvelope(...args);
}
export function calculateThumbContactPoint(
  ...args: Parameters<SpatialUISystem['calculateThumbContactPoint']>
): ReturnType<SpatialUISystem['calculateThumbContactPoint']> {
  return getActiveSpatialUISystem().calculateThumbContactPoint(...args);
}
export function calculateThumbSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateThumbSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateThumbSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateThumbSurfaceNormal(...args);
}
export function calculateThumbPoseError(
  ...args: Parameters<SpatialUISystem['calculateThumbPoseError']>
): ReturnType<SpatialUISystem['calculateThumbPoseError']> {
  return getActiveSpatialUISystem().calculateThumbPoseError(...args);
}
export function calculateThumbMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateThumbMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateThumbMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateThumbMotionSmoothness(...args);
}
export function calculateThumbCollision(
  ...args: Parameters<SpatialUISystem['calculateThumbCollision']>
): ReturnType<SpatialUISystem['calculateThumbCollision']> {
  return getActiveSpatialUISystem().calculateThumbCollision(...args);
}
export function getIndexFingerRootPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerRootPosition']>
): ReturnType<SpatialUISystem['getIndexFingerRootPosition']> {
  return getActiveSpatialUISystem().getIndexFingerRootPosition(...args);
}
export function getIndexFingerMCPPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerMCPPosition']>
): ReturnType<SpatialUISystem['getIndexFingerMCPPosition']> {
  return getActiveSpatialUISystem().getIndexFingerMCPPosition(...args);
}
export function getIndexFingerPIPPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerPIPPosition']>
): ReturnType<SpatialUISystem['getIndexFingerPIPPosition']> {
  return getActiveSpatialUISystem().getIndexFingerPIPPosition(...args);
}
export function getIndexFingerDIPPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerDIPPosition']>
): ReturnType<SpatialUISystem['getIndexFingerDIPPosition']> {
  return getActiveSpatialUISystem().getIndexFingerDIPPosition(...args);
}
export function getIndexFingerTipPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerTipPosition']>
): ReturnType<SpatialUISystem['getIndexFingerTipPosition']> {
  return getActiveSpatialUISystem().getIndexFingerTipPosition(...args);
}
export function getIndexFingerNailPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerNailPosition']>
): ReturnType<SpatialUISystem['getIndexFingerNailPosition']> {
  return getActiveSpatialUISystem().getIndexFingerNailPosition(...args);
}
export function getIndexFingerPadPosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerPadPosition']>
): ReturnType<SpatialUISystem['getIndexFingerPadPosition']> {
  return getActiveSpatialUISystem().getIndexFingerPadPosition(...args);
}
export function getIndexFingerBasePosition(
  ...args: Parameters<SpatialUISystem['getIndexFingerBasePosition']>
): ReturnType<SpatialUISystem['getIndexFingerBasePosition']> {
  return getActiveSpatialUISystem().getIndexFingerBasePosition(...args);
}
export function getIndexFingerProximalJoint(
  ...args: Parameters<SpatialUISystem['getIndexFingerProximalJoint']>
): ReturnType<SpatialUISystem['getIndexFingerProximalJoint']> {
  return getActiveSpatialUISystem().getIndexFingerProximalJoint(...args);
}
export function getIndexFingerDistalJoint(
  ...args: Parameters<SpatialUISystem['getIndexFingerDistalJoint']>
): ReturnType<SpatialUISystem['getIndexFingerDistalJoint']> {
  return getActiveSpatialUISystem().getIndexFingerDistalJoint(...args);
}
export function calculateIndexFingerLength(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerLength']>
): ReturnType<SpatialUISystem['calculateIndexFingerLength']> {
  return getActiveSpatialUISystem().calculateIndexFingerLength(...args);
}
export function calculateIndexFingerWidth(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerWidth']>
): ReturnType<SpatialUISystem['calculateIndexFingerWidth']> {
  return getActiveSpatialUISystem().calculateIndexFingerWidth(...args);
}
export function calculateIndexFingerThickness(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerThickness']>
): ReturnType<SpatialUISystem['calculateIndexFingerThickness']> {
  return getActiveSpatialUISystem().calculateIndexFingerThickness(...args);
}
export function calculateIndexFingerCurvature(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerCurvature']>
): ReturnType<SpatialUISystem['calculateIndexFingerCurvature']> {
  return getActiveSpatialUISystem().calculateIndexFingerCurvature(...args);
}
export function calculateIndexFingerDirection(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerDirection']>
): ReturnType<SpatialUISystem['calculateIndexFingerDirection']> {
  return getActiveSpatialUISystem().calculateIndexFingerDirection(...args);
}
export function calculateIndexFingerOrientation(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerOrientation']>
): ReturnType<SpatialUISystem['calculateIndexFingerOrientation']> {
  return getActiveSpatialUISystem().calculateIndexFingerOrientation(...args);
}
export function calculateIndexFingerFlexion(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerFlexion']>
): ReturnType<SpatialUISystem['calculateIndexFingerFlexion']> {
  return getActiveSpatialUISystem().calculateIndexFingerFlexion(...args);
}
export function calculateIndexFingerExtension(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerExtension']>
): ReturnType<SpatialUISystem['calculateIndexFingerExtension']> {
  return getActiveSpatialUISystem().calculateIndexFingerExtension(...args);
}
export function calculateIndexFingerAbduction(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerAbduction']>
): ReturnType<SpatialUISystem['calculateIndexFingerAbduction']> {
  return getActiveSpatialUISystem().calculateIndexFingerAbduction(...args);
}
export function calculateIndexFingerAdduction(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerAdduction']>
): ReturnType<SpatialUISystem['calculateIndexFingerAdduction']> {
  return getActiveSpatialUISystem().calculateIndexFingerAdduction(...args);
}
export function calculateIndexFingerRotation(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerRotation']>
): ReturnType<SpatialUISystem['calculateIndexFingerRotation']> {
  return getActiveSpatialUISystem().calculateIndexFingerRotation(...args);
}
export function calculateIndexFingerTipVelocity(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerTipVelocity']>
): ReturnType<SpatialUISystem['calculateIndexFingerTipVelocity']> {
  return getActiveSpatialUISystem().calculateIndexFingerTipVelocity(...args);
}
export function calculateIndexFingerTipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerTipAcceleration']>
): ReturnType<SpatialUISystem['calculateIndexFingerTipAcceleration']> {
  return getActiveSpatialUISystem().calculateIndexFingerTipAcceleration(...args);
}
export function calculateIndexFingerJointAngles(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerJointAngles']>
): ReturnType<SpatialUISystem['calculateIndexFingerJointAngles']> {
  return getActiveSpatialUISystem().calculateIndexFingerJointAngles(...args);
}
export function calculateIndexFingerSegmentLengths(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerSegmentLengths']>
): ReturnType<SpatialUISystem['calculateIndexFingerSegmentLengths']> {
  return getActiveSpatialUISystem().calculateIndexFingerSegmentLengths(...args);
}
export function calculateIndexFingerBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerBoundingBox']>
): ReturnType<SpatialUISystem['calculateIndexFingerBoundingBox']> {
  return getActiveSpatialUISystem().calculateIndexFingerBoundingBox(...args);
}
export function calculateIndexFingerBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerBoundingSphere']>
): ReturnType<SpatialUISystem['calculateIndexFingerBoundingSphere']> {
  return getActiveSpatialUISystem().calculateIndexFingerBoundingSphere(...args);
}
export function calculateIndexToThumbDistance(
  ...args: Parameters<SpatialUISystem['calculateIndexToThumbDistance']>
): ReturnType<SpatialUISystem['calculateIndexToThumbDistance']> {
  return getActiveSpatialUISystem().calculateIndexToThumbDistance(...args);
}
export function calculateIndexToMiddleDistance(
  ...args: Parameters<SpatialUISystem['calculateIndexToMiddleDistance']>
): ReturnType<SpatialUISystem['calculateIndexToMiddleDistance']> {
  return getActiveSpatialUISystem().calculateIndexToMiddleDistance(...args);
}
export function calculateIndexToRingDistance(
  ...args: Parameters<SpatialUISystem['calculateIndexToRingDistance']>
): ReturnType<SpatialUISystem['calculateIndexToRingDistance']> {
  return getActiveSpatialUISystem().calculateIndexToRingDistance(...args);
}
export function calculateIndexToLittleDistance(
  ...args: Parameters<SpatialUISystem['calculateIndexToLittleDistance']>
): ReturnType<SpatialUISystem['calculateIndexToLittleDistance']> {
  return getActiveSpatialUISystem().calculateIndexToLittleDistance(...args);
}
export function calculateIndexPointingDirection(
  ...args: Parameters<SpatialUISystem['calculateIndexPointingDirection']>
): ReturnType<SpatialUISystem['calculateIndexPointingDirection']> {
  return getActiveSpatialUISystem().calculateIndexPointingDirection(...args);
}
export function calculateIndexReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateIndexReachEnvelope']>
): ReturnType<SpatialUISystem['calculateIndexReachEnvelope']> {
  return getActiveSpatialUISystem().calculateIndexReachEnvelope(...args);
}
export function calculateIndexContactPoint(
  ...args: Parameters<SpatialUISystem['calculateIndexContactPoint']>
): ReturnType<SpatialUISystem['calculateIndexContactPoint']> {
  return getActiveSpatialUISystem().calculateIndexContactPoint(...args);
}
export function calculateIndexSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateIndexSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateIndexSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateIndexSurfaceNormal(...args);
}
export function calculateIndexPoseError(
  ...args: Parameters<SpatialUISystem['calculateIndexPoseError']>
): ReturnType<SpatialUISystem['calculateIndexPoseError']> {
  return getActiveSpatialUISystem().calculateIndexPoseError(...args);
}
export function calculateIndexMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateIndexMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateIndexMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateIndexMotionSmoothness(...args);
}
export function calculateIndexCollision(
  ...args: Parameters<SpatialUISystem['calculateIndexCollision']>
): ReturnType<SpatialUISystem['calculateIndexCollision']> {
  return getActiveSpatialUISystem().calculateIndexCollision(...args);
}
export function calculateIndexFingerCurl(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerCurl']>
): ReturnType<SpatialUISystem['calculateIndexFingerCurl']> {
  return getActiveSpatialUISystem().calculateIndexFingerCurl(...args);
}
export function calculateIndexFingerSpread(
  ...args: Parameters<SpatialUISystem['calculateIndexFingerSpread']>
): ReturnType<SpatialUISystem['calculateIndexFingerSpread']> {
  return getActiveSpatialUISystem().calculateIndexFingerSpread(...args);
}
export function getMiddleFingerRootPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerRootPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerRootPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerRootPosition(...args);
}
export function getMiddleFingerMCPPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerMCPPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerMCPPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerMCPPosition(...args);
}
export function getMiddleFingerPIPPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerPIPPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerPIPPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerPIPPosition(...args);
}
export function getMiddleFingerDIPPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerDIPPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerDIPPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerDIPPosition(...args);
}
export function getMiddleFingerTipPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerTipPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerTipPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerTipPosition(...args);
}
export function getMiddleFingerNailPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerNailPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerNailPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerNailPosition(...args);
}
export function getMiddleFingerPadPosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerPadPosition']>
): ReturnType<SpatialUISystem['getMiddleFingerPadPosition']> {
  return getActiveSpatialUISystem().getMiddleFingerPadPosition(...args);
}
export function getMiddleFingerBasePosition(
  ...args: Parameters<SpatialUISystem['getMiddleFingerBasePosition']>
): ReturnType<SpatialUISystem['getMiddleFingerBasePosition']> {
  return getActiveSpatialUISystem().getMiddleFingerBasePosition(...args);
}
export function getMiddleFingerProximalJoint(
  ...args: Parameters<SpatialUISystem['getMiddleFingerProximalJoint']>
): ReturnType<SpatialUISystem['getMiddleFingerProximalJoint']> {
  return getActiveSpatialUISystem().getMiddleFingerProximalJoint(...args);
}
export function getMiddleFingerDistalJoint(
  ...args: Parameters<SpatialUISystem['getMiddleFingerDistalJoint']>
): ReturnType<SpatialUISystem['getMiddleFingerDistalJoint']> {
  return getActiveSpatialUISystem().getMiddleFingerDistalJoint(...args);
}
export function calculateMiddleFingerLength(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerLength']>
): ReturnType<SpatialUISystem['calculateMiddleFingerLength']> {
  return getActiveSpatialUISystem().calculateMiddleFingerLength(...args);
}
export function calculateMiddleFingerWidth(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerWidth']>
): ReturnType<SpatialUISystem['calculateMiddleFingerWidth']> {
  return getActiveSpatialUISystem().calculateMiddleFingerWidth(...args);
}
export function calculateMiddleFingerThickness(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerThickness']>
): ReturnType<SpatialUISystem['calculateMiddleFingerThickness']> {
  return getActiveSpatialUISystem().calculateMiddleFingerThickness(...args);
}
export function calculateMiddleFingerCurvature(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerCurvature']>
): ReturnType<SpatialUISystem['calculateMiddleFingerCurvature']> {
  return getActiveSpatialUISystem().calculateMiddleFingerCurvature(...args);
}
export function calculateMiddleFingerDirection(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerDirection']>
): ReturnType<SpatialUISystem['calculateMiddleFingerDirection']> {
  return getActiveSpatialUISystem().calculateMiddleFingerDirection(...args);
}
export function calculateMiddleFingerOrientation(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerOrientation']>
): ReturnType<SpatialUISystem['calculateMiddleFingerOrientation']> {
  return getActiveSpatialUISystem().calculateMiddleFingerOrientation(...args);
}
export function calculateMiddleFingerFlexion(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerFlexion']>
): ReturnType<SpatialUISystem['calculateMiddleFingerFlexion']> {
  return getActiveSpatialUISystem().calculateMiddleFingerFlexion(...args);
}
export function calculateMiddleFingerExtension(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerExtension']>
): ReturnType<SpatialUISystem['calculateMiddleFingerExtension']> {
  return getActiveSpatialUISystem().calculateMiddleFingerExtension(...args);
}
export function calculateMiddleFingerAbduction(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerAbduction']>
): ReturnType<SpatialUISystem['calculateMiddleFingerAbduction']> {
  return getActiveSpatialUISystem().calculateMiddleFingerAbduction(...args);
}
export function calculateMiddleFingerAdduction(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerAdduction']>
): ReturnType<SpatialUISystem['calculateMiddleFingerAdduction']> {
  return getActiveSpatialUISystem().calculateMiddleFingerAdduction(...args);
}
export function calculateMiddleFingerRotation(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerRotation']>
): ReturnType<SpatialUISystem['calculateMiddleFingerRotation']> {
  return getActiveSpatialUISystem().calculateMiddleFingerRotation(...args);
}
export function calculateMiddleFingerTipVelocity(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerTipVelocity']>
): ReturnType<SpatialUISystem['calculateMiddleFingerTipVelocity']> {
  return getActiveSpatialUISystem().calculateMiddleFingerTipVelocity(...args);
}
export function calculateMiddleFingerTipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerTipAcceleration']>
): ReturnType<SpatialUISystem['calculateMiddleFingerTipAcceleration']> {
  return getActiveSpatialUISystem().calculateMiddleFingerTipAcceleration(...args);
}
export function calculateMiddleFingerJointAngles(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerJointAngles']>
): ReturnType<SpatialUISystem['calculateMiddleFingerJointAngles']> {
  return getActiveSpatialUISystem().calculateMiddleFingerJointAngles(...args);
}
export function calculateMiddleFingerSegmentLengths(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerSegmentLengths']>
): ReturnType<SpatialUISystem['calculateMiddleFingerSegmentLengths']> {
  return getActiveSpatialUISystem().calculateMiddleFingerSegmentLengths(...args);
}
export function calculateMiddleFingerBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerBoundingBox']>
): ReturnType<SpatialUISystem['calculateMiddleFingerBoundingBox']> {
  return getActiveSpatialUISystem().calculateMiddleFingerBoundingBox(...args);
}
export function calculateMiddleFingerBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerBoundingSphere']>
): ReturnType<SpatialUISystem['calculateMiddleFingerBoundingSphere']> {
  return getActiveSpatialUISystem().calculateMiddleFingerBoundingSphere(...args);
}
export function calculateMiddleToThumbDistance(
  ...args: Parameters<SpatialUISystem['calculateMiddleToThumbDistance']>
): ReturnType<SpatialUISystem['calculateMiddleToThumbDistance']> {
  return getActiveSpatialUISystem().calculateMiddleToThumbDistance(...args);
}
export function calculateMiddleToIndexDistance(
  ...args: Parameters<SpatialUISystem['calculateMiddleToIndexDistance']>
): ReturnType<SpatialUISystem['calculateMiddleToIndexDistance']> {
  return getActiveSpatialUISystem().calculateMiddleToIndexDistance(...args);
}
export function calculateMiddleToRingDistance(
  ...args: Parameters<SpatialUISystem['calculateMiddleToRingDistance']>
): ReturnType<SpatialUISystem['calculateMiddleToRingDistance']> {
  return getActiveSpatialUISystem().calculateMiddleToRingDistance(...args);
}
export function calculateMiddleToLittleDistance(
  ...args: Parameters<SpatialUISystem['calculateMiddleToLittleDistance']>
): ReturnType<SpatialUISystem['calculateMiddleToLittleDistance']> {
  return getActiveSpatialUISystem().calculateMiddleToLittleDistance(...args);
}
export function calculateMiddleFingerReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerReachEnvelope']>
): ReturnType<SpatialUISystem['calculateMiddleFingerReachEnvelope']> {
  return getActiveSpatialUISystem().calculateMiddleFingerReachEnvelope(...args);
}
export function calculateMiddleFingerContactPoint(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerContactPoint']>
): ReturnType<SpatialUISystem['calculateMiddleFingerContactPoint']> {
  return getActiveSpatialUISystem().calculateMiddleFingerContactPoint(...args);
}
export function calculateMiddleFingerSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateMiddleFingerSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateMiddleFingerSurfaceNormal(...args);
}
export function calculateMiddleFingerPoseError(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerPoseError']>
): ReturnType<SpatialUISystem['calculateMiddleFingerPoseError']> {
  return getActiveSpatialUISystem().calculateMiddleFingerPoseError(...args);
}
export function calculateMiddleFingerMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateMiddleFingerMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateMiddleFingerMotionSmoothness(...args);
}
export function calculateMiddleFingerCollision(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerCollision']>
): ReturnType<SpatialUISystem['calculateMiddleFingerCollision']> {
  return getActiveSpatialUISystem().calculateMiddleFingerCollision(...args);
}
export function calculateMiddleFingerCurl(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerCurl']>
): ReturnType<SpatialUISystem['calculateMiddleFingerCurl']> {
  return getActiveSpatialUISystem().calculateMiddleFingerCurl(...args);
}
export function calculateMiddleFingerSpread(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerSpread']>
): ReturnType<SpatialUISystem['calculateMiddleFingerSpread']> {
  return getActiveSpatialUISystem().calculateMiddleFingerSpread(...args);
}
export function calculateMiddleFingerAlignment(
  ...args: Parameters<SpatialUISystem['calculateMiddleFingerAlignment']>
): ReturnType<SpatialUISystem['calculateMiddleFingerAlignment']> {
  return getActiveSpatialUISystem().calculateMiddleFingerAlignment(...args);
}
export function getRingFingerRootPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerRootPosition']>
): ReturnType<SpatialUISystem['getRingFingerRootPosition']> {
  return getActiveSpatialUISystem().getRingFingerRootPosition(...args);
}
export function getRingFingerMCPPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerMCPPosition']>
): ReturnType<SpatialUISystem['getRingFingerMCPPosition']> {
  return getActiveSpatialUISystem().getRingFingerMCPPosition(...args);
}
export function getRingFingerPIPPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerPIPPosition']>
): ReturnType<SpatialUISystem['getRingFingerPIPPosition']> {
  return getActiveSpatialUISystem().getRingFingerPIPPosition(...args);
}
export function getRingFingerDIPPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerDIPPosition']>
): ReturnType<SpatialUISystem['getRingFingerDIPPosition']> {
  return getActiveSpatialUISystem().getRingFingerDIPPosition(...args);
}
export function getRingFingerTipPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerTipPosition']>
): ReturnType<SpatialUISystem['getRingFingerTipPosition']> {
  return getActiveSpatialUISystem().getRingFingerTipPosition(...args);
}
export function getRingFingerNailPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerNailPosition']>
): ReturnType<SpatialUISystem['getRingFingerNailPosition']> {
  return getActiveSpatialUISystem().getRingFingerNailPosition(...args);
}
export function getRingFingerPadPosition(
  ...args: Parameters<SpatialUISystem['getRingFingerPadPosition']>
): ReturnType<SpatialUISystem['getRingFingerPadPosition']> {
  return getActiveSpatialUISystem().getRingFingerPadPosition(...args);
}
export function getRingFingerBasePosition(
  ...args: Parameters<SpatialUISystem['getRingFingerBasePosition']>
): ReturnType<SpatialUISystem['getRingFingerBasePosition']> {
  return getActiveSpatialUISystem().getRingFingerBasePosition(...args);
}
export function getRingFingerProximalJoint(
  ...args: Parameters<SpatialUISystem['getRingFingerProximalJoint']>
): ReturnType<SpatialUISystem['getRingFingerProximalJoint']> {
  return getActiveSpatialUISystem().getRingFingerProximalJoint(...args);
}
export function getRingFingerDistalJoint(
  ...args: Parameters<SpatialUISystem['getRingFingerDistalJoint']>
): ReturnType<SpatialUISystem['getRingFingerDistalJoint']> {
  return getActiveSpatialUISystem().getRingFingerDistalJoint(...args);
}
export function calculateRingFingerLength(
  ...args: Parameters<SpatialUISystem['calculateRingFingerLength']>
): ReturnType<SpatialUISystem['calculateRingFingerLength']> {
  return getActiveSpatialUISystem().calculateRingFingerLength(...args);
}
export function calculateRingFingerWidth(
  ...args: Parameters<SpatialUISystem['calculateRingFingerWidth']>
): ReturnType<SpatialUISystem['calculateRingFingerWidth']> {
  return getActiveSpatialUISystem().calculateRingFingerWidth(...args);
}
export function calculateRingFingerThickness(
  ...args: Parameters<SpatialUISystem['calculateRingFingerThickness']>
): ReturnType<SpatialUISystem['calculateRingFingerThickness']> {
  return getActiveSpatialUISystem().calculateRingFingerThickness(...args);
}
export function calculateRingFingerCurvature(
  ...args: Parameters<SpatialUISystem['calculateRingFingerCurvature']>
): ReturnType<SpatialUISystem['calculateRingFingerCurvature']> {
  return getActiveSpatialUISystem().calculateRingFingerCurvature(...args);
}
export function calculateRingFingerDirection(
  ...args: Parameters<SpatialUISystem['calculateRingFingerDirection']>
): ReturnType<SpatialUISystem['calculateRingFingerDirection']> {
  return getActiveSpatialUISystem().calculateRingFingerDirection(...args);
}
export function calculateRingFingerOrientation(
  ...args: Parameters<SpatialUISystem['calculateRingFingerOrientation']>
): ReturnType<SpatialUISystem['calculateRingFingerOrientation']> {
  return getActiveSpatialUISystem().calculateRingFingerOrientation(...args);
}
export function calculateRingFingerFlexion(
  ...args: Parameters<SpatialUISystem['calculateRingFingerFlexion']>
): ReturnType<SpatialUISystem['calculateRingFingerFlexion']> {
  return getActiveSpatialUISystem().calculateRingFingerFlexion(...args);
}
export function calculateRingFingerExtension(
  ...args: Parameters<SpatialUISystem['calculateRingFingerExtension']>
): ReturnType<SpatialUISystem['calculateRingFingerExtension']> {
  return getActiveSpatialUISystem().calculateRingFingerExtension(...args);
}
export function calculateRingFingerAbduction(
  ...args: Parameters<SpatialUISystem['calculateRingFingerAbduction']>
): ReturnType<SpatialUISystem['calculateRingFingerAbduction']> {
  return getActiveSpatialUISystem().calculateRingFingerAbduction(...args);
}
export function calculateRingFingerAdduction(
  ...args: Parameters<SpatialUISystem['calculateRingFingerAdduction']>
): ReturnType<SpatialUISystem['calculateRingFingerAdduction']> {
  return getActiveSpatialUISystem().calculateRingFingerAdduction(...args);
}
export function calculateRingFingerRotation(
  ...args: Parameters<SpatialUISystem['calculateRingFingerRotation']>
): ReturnType<SpatialUISystem['calculateRingFingerRotation']> {
  return getActiveSpatialUISystem().calculateRingFingerRotation(...args);
}
export function calculateRingFingerTipVelocity(
  ...args: Parameters<SpatialUISystem['calculateRingFingerTipVelocity']>
): ReturnType<SpatialUISystem['calculateRingFingerTipVelocity']> {
  return getActiveSpatialUISystem().calculateRingFingerTipVelocity(...args);
}
export function calculateRingFingerTipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateRingFingerTipAcceleration']>
): ReturnType<SpatialUISystem['calculateRingFingerTipAcceleration']> {
  return getActiveSpatialUISystem().calculateRingFingerTipAcceleration(...args);
}
export function calculateRingFingerJointAngles(
  ...args: Parameters<SpatialUISystem['calculateRingFingerJointAngles']>
): ReturnType<SpatialUISystem['calculateRingFingerJointAngles']> {
  return getActiveSpatialUISystem().calculateRingFingerJointAngles(...args);
}
export function calculateRingFingerSegmentLengths(
  ...args: Parameters<SpatialUISystem['calculateRingFingerSegmentLengths']>
): ReturnType<SpatialUISystem['calculateRingFingerSegmentLengths']> {
  return getActiveSpatialUISystem().calculateRingFingerSegmentLengths(...args);
}
export function calculateRingFingerBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateRingFingerBoundingBox']>
): ReturnType<SpatialUISystem['calculateRingFingerBoundingBox']> {
  return getActiveSpatialUISystem().calculateRingFingerBoundingBox(...args);
}
export function calculateRingFingerBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateRingFingerBoundingSphere']>
): ReturnType<SpatialUISystem['calculateRingFingerBoundingSphere']> {
  return getActiveSpatialUISystem().calculateRingFingerBoundingSphere(...args);
}
export function calculateRingToThumbDistance(
  ...args: Parameters<SpatialUISystem['calculateRingToThumbDistance']>
): ReturnType<SpatialUISystem['calculateRingToThumbDistance']> {
  return getActiveSpatialUISystem().calculateRingToThumbDistance(...args);
}
export function calculateRingToIndexDistance(
  ...args: Parameters<SpatialUISystem['calculateRingToIndexDistance']>
): ReturnType<SpatialUISystem['calculateRingToIndexDistance']> {
  return getActiveSpatialUISystem().calculateRingToIndexDistance(...args);
}
export function calculateRingToMiddleDistance(
  ...args: Parameters<SpatialUISystem['calculateRingToMiddleDistance']>
): ReturnType<SpatialUISystem['calculateRingToMiddleDistance']> {
  return getActiveSpatialUISystem().calculateRingToMiddleDistance(...args);
}
export function calculateRingToLittleDistance(
  ...args: Parameters<SpatialUISystem['calculateRingToLittleDistance']>
): ReturnType<SpatialUISystem['calculateRingToLittleDistance']> {
  return getActiveSpatialUISystem().calculateRingToLittleDistance(...args);
}
export function calculateRingFingerReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateRingFingerReachEnvelope']>
): ReturnType<SpatialUISystem['calculateRingFingerReachEnvelope']> {
  return getActiveSpatialUISystem().calculateRingFingerReachEnvelope(...args);
}
export function calculateRingFingerContactPoint(
  ...args: Parameters<SpatialUISystem['calculateRingFingerContactPoint']>
): ReturnType<SpatialUISystem['calculateRingFingerContactPoint']> {
  return getActiveSpatialUISystem().calculateRingFingerContactPoint(...args);
}
export function calculateRingFingerSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateRingFingerSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateRingFingerSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateRingFingerSurfaceNormal(...args);
}
export function calculateRingFingerPoseError(
  ...args: Parameters<SpatialUISystem['calculateRingFingerPoseError']>
): ReturnType<SpatialUISystem['calculateRingFingerPoseError']> {
  return getActiveSpatialUISystem().calculateRingFingerPoseError(...args);
}
export function calculateRingFingerMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateRingFingerMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateRingFingerMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateRingFingerMotionSmoothness(...args);
}
export function calculateRingFingerCollision(
  ...args: Parameters<SpatialUISystem['calculateRingFingerCollision']>
): ReturnType<SpatialUISystem['calculateRingFingerCollision']> {
  return getActiveSpatialUISystem().calculateRingFingerCollision(...args);
}
export function calculateRingFingerCurl(
  ...args: Parameters<SpatialUISystem['calculateRingFingerCurl']>
): ReturnType<SpatialUISystem['calculateRingFingerCurl']> {
  return getActiveSpatialUISystem().calculateRingFingerCurl(...args);
}
export function calculateRingFingerSpread(
  ...args: Parameters<SpatialUISystem['calculateRingFingerSpread']>
): ReturnType<SpatialUISystem['calculateRingFingerSpread']> {
  return getActiveSpatialUISystem().calculateRingFingerSpread(...args);
}
export function calculateRingFingerAlignment(
  ...args: Parameters<SpatialUISystem['calculateRingFingerAlignment']>
): ReturnType<SpatialUISystem['calculateRingFingerAlignment']> {
  return getActiveSpatialUISystem().calculateRingFingerAlignment(...args);
}
export function getLittleFingerRootPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerRootPosition']>
): ReturnType<SpatialUISystem['getLittleFingerRootPosition']> {
  return getActiveSpatialUISystem().getLittleFingerRootPosition(...args);
}
export function getLittleFingerMCPPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerMCPPosition']>
): ReturnType<SpatialUISystem['getLittleFingerMCPPosition']> {
  return getActiveSpatialUISystem().getLittleFingerMCPPosition(...args);
}
export function getLittleFingerPIPPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerPIPPosition']>
): ReturnType<SpatialUISystem['getLittleFingerPIPPosition']> {
  return getActiveSpatialUISystem().getLittleFingerPIPPosition(...args);
}
export function getLittleFingerDIPPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerDIPPosition']>
): ReturnType<SpatialUISystem['getLittleFingerDIPPosition']> {
  return getActiveSpatialUISystem().getLittleFingerDIPPosition(...args);
}
export function getLittleFingerTipPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerTipPosition']>
): ReturnType<SpatialUISystem['getLittleFingerTipPosition']> {
  return getActiveSpatialUISystem().getLittleFingerTipPosition(...args);
}
export function getLittleFingerNailPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerNailPosition']>
): ReturnType<SpatialUISystem['getLittleFingerNailPosition']> {
  return getActiveSpatialUISystem().getLittleFingerNailPosition(...args);
}
export function getLittleFingerPadPosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerPadPosition']>
): ReturnType<SpatialUISystem['getLittleFingerPadPosition']> {
  return getActiveSpatialUISystem().getLittleFingerPadPosition(...args);
}
export function getLittleFingerBasePosition(
  ...args: Parameters<SpatialUISystem['getLittleFingerBasePosition']>
): ReturnType<SpatialUISystem['getLittleFingerBasePosition']> {
  return getActiveSpatialUISystem().getLittleFingerBasePosition(...args);
}
export function getLittleFingerProximalJoint(
  ...args: Parameters<SpatialUISystem['getLittleFingerProximalJoint']>
): ReturnType<SpatialUISystem['getLittleFingerProximalJoint']> {
  return getActiveSpatialUISystem().getLittleFingerProximalJoint(...args);
}
export function getLittleFingerDistalJoint(
  ...args: Parameters<SpatialUISystem['getLittleFingerDistalJoint']>
): ReturnType<SpatialUISystem['getLittleFingerDistalJoint']> {
  return getActiveSpatialUISystem().getLittleFingerDistalJoint(...args);
}
export function calculateLittleFingerLength(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerLength']>
): ReturnType<SpatialUISystem['calculateLittleFingerLength']> {
  return getActiveSpatialUISystem().calculateLittleFingerLength(...args);
}
export function calculateLittleFingerWidth(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerWidth']>
): ReturnType<SpatialUISystem['calculateLittleFingerWidth']> {
  return getActiveSpatialUISystem().calculateLittleFingerWidth(...args);
}
export function calculateLittleFingerThickness(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerThickness']>
): ReturnType<SpatialUISystem['calculateLittleFingerThickness']> {
  return getActiveSpatialUISystem().calculateLittleFingerThickness(...args);
}
export function calculateLittleFingerCurvature(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerCurvature']>
): ReturnType<SpatialUISystem['calculateLittleFingerCurvature']> {
  return getActiveSpatialUISystem().calculateLittleFingerCurvature(...args);
}
export function calculateLittleFingerDirection(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerDirection']>
): ReturnType<SpatialUISystem['calculateLittleFingerDirection']> {
  return getActiveSpatialUISystem().calculateLittleFingerDirection(...args);
}
export function calculateLittleFingerOrientation(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerOrientation']>
): ReturnType<SpatialUISystem['calculateLittleFingerOrientation']> {
  return getActiveSpatialUISystem().calculateLittleFingerOrientation(...args);
}
export function calculateLittleFingerFlexion(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerFlexion']>
): ReturnType<SpatialUISystem['calculateLittleFingerFlexion']> {
  return getActiveSpatialUISystem().calculateLittleFingerFlexion(...args);
}
export function calculateLittleFingerExtension(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerExtension']>
): ReturnType<SpatialUISystem['calculateLittleFingerExtension']> {
  return getActiveSpatialUISystem().calculateLittleFingerExtension(...args);
}
export function calculateLittleFingerAbduction(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerAbduction']>
): ReturnType<SpatialUISystem['calculateLittleFingerAbduction']> {
  return getActiveSpatialUISystem().calculateLittleFingerAbduction(...args);
}
export function calculateLittleFingerAdduction(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerAdduction']>
): ReturnType<SpatialUISystem['calculateLittleFingerAdduction']> {
  return getActiveSpatialUISystem().calculateLittleFingerAdduction(...args);
}
export function calculateLittleFingerRotation(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerRotation']>
): ReturnType<SpatialUISystem['calculateLittleFingerRotation']> {
  return getActiveSpatialUISystem().calculateLittleFingerRotation(...args);
}
export function calculateLittleFingerTipVelocity(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerTipVelocity']>
): ReturnType<SpatialUISystem['calculateLittleFingerTipVelocity']> {
  return getActiveSpatialUISystem().calculateLittleFingerTipVelocity(...args);
}
export function calculateLittleFingerTipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerTipAcceleration']>
): ReturnType<SpatialUISystem['calculateLittleFingerTipAcceleration']> {
  return getActiveSpatialUISystem().calculateLittleFingerTipAcceleration(...args);
}
export function calculateLittleFingerJointAngles(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerJointAngles']>
): ReturnType<SpatialUISystem['calculateLittleFingerJointAngles']> {
  return getActiveSpatialUISystem().calculateLittleFingerJointAngles(...args);
}
export function calculateLittleFingerSegmentLengths(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerSegmentLengths']>
): ReturnType<SpatialUISystem['calculateLittleFingerSegmentLengths']> {
  return getActiveSpatialUISystem().calculateLittleFingerSegmentLengths(...args);
}
export function calculateLittleFingerBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerBoundingBox']>
): ReturnType<SpatialUISystem['calculateLittleFingerBoundingBox']> {
  return getActiveSpatialUISystem().calculateLittleFingerBoundingBox(...args);
}
export function calculateLittleFingerBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerBoundingSphere']>
): ReturnType<SpatialUISystem['calculateLittleFingerBoundingSphere']> {
  return getActiveSpatialUISystem().calculateLittleFingerBoundingSphere(...args);
}
export function calculateLittleToThumbDistance(
  ...args: Parameters<SpatialUISystem['calculateLittleToThumbDistance']>
): ReturnType<SpatialUISystem['calculateLittleToThumbDistance']> {
  return getActiveSpatialUISystem().calculateLittleToThumbDistance(...args);
}
export function calculateLittleToIndexDistance(
  ...args: Parameters<SpatialUISystem['calculateLittleToIndexDistance']>
): ReturnType<SpatialUISystem['calculateLittleToIndexDistance']> {
  return getActiveSpatialUISystem().calculateLittleToIndexDistance(...args);
}
export function calculateLittleToMiddleDistance(
  ...args: Parameters<SpatialUISystem['calculateLittleToMiddleDistance']>
): ReturnType<SpatialUISystem['calculateLittleToMiddleDistance']> {
  return getActiveSpatialUISystem().calculateLittleToMiddleDistance(...args);
}
export function calculateLittleToRingDistance(
  ...args: Parameters<SpatialUISystem['calculateLittleToRingDistance']>
): ReturnType<SpatialUISystem['calculateLittleToRingDistance']> {
  return getActiveSpatialUISystem().calculateLittleToRingDistance(...args);
}
export function calculateLittleFingerReachEnvelope(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerReachEnvelope']>
): ReturnType<SpatialUISystem['calculateLittleFingerReachEnvelope']> {
  return getActiveSpatialUISystem().calculateLittleFingerReachEnvelope(...args);
}
export function calculateLittleFingerContactPoint(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerContactPoint']>
): ReturnType<SpatialUISystem['calculateLittleFingerContactPoint']> {
  return getActiveSpatialUISystem().calculateLittleFingerContactPoint(...args);
}
export function calculateLittleFingerSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateLittleFingerSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateLittleFingerSurfaceNormal(...args);
}
export function calculateLittleFingerPoseError(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerPoseError']>
): ReturnType<SpatialUISystem['calculateLittleFingerPoseError']> {
  return getActiveSpatialUISystem().calculateLittleFingerPoseError(...args);
}
export function calculateLittleFingerMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateLittleFingerMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateLittleFingerMotionSmoothness(...args);
}
export function calculateLittleFingerCollision(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerCollision']>
): ReturnType<SpatialUISystem['calculateLittleFingerCollision']> {
  return getActiveSpatialUISystem().calculateLittleFingerCollision(...args);
}
export function calculateLittleFingerCurl(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerCurl']>
): ReturnType<SpatialUISystem['calculateLittleFingerCurl']> {
  return getActiveSpatialUISystem().calculateLittleFingerCurl(...args);
}
export function calculateLittleFingerSpread(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerSpread']>
): ReturnType<SpatialUISystem['calculateLittleFingerSpread']> {
  return getActiveSpatialUISystem().calculateLittleFingerSpread(...args);
}
export function calculateLittleFingerAlignment(
  ...args: Parameters<SpatialUISystem['calculateLittleFingerAlignment']>
): ReturnType<SpatialUISystem['calculateLittleFingerAlignment']> {
  return getActiveSpatialUISystem().calculateLittleFingerAlignment(...args);
}
export function getHeldObjectPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectPosition']>
): ReturnType<SpatialUISystem['getHeldObjectPosition']> {
  return getActiveSpatialUISystem().getHeldObjectPosition(...args);
}
export function getHeldObjectCenter(
  ...args: Parameters<SpatialUISystem['getHeldObjectCenter']>
): ReturnType<SpatialUISystem['getHeldObjectCenter']> {
  return getActiveSpatialUISystem().getHeldObjectCenter(...args);
}
export function getHeldObjectRotation(
  ...args: Parameters<SpatialUISystem['getHeldObjectRotation']>
): ReturnType<SpatialUISystem['getHeldObjectRotation']> {
  return getActiveSpatialUISystem().getHeldObjectRotation(...args);
}
export function getHeldObjectScale(
  ...args: Parameters<SpatialUISystem['getHeldObjectScale']>
): ReturnType<SpatialUISystem['getHeldObjectScale']> {
  return getActiveSpatialUISystem().getHeldObjectScale(...args);
}
export function getHeldObjectWorldPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectWorldPosition']>
): ReturnType<SpatialUISystem['getHeldObjectWorldPosition']> {
  return getActiveSpatialUISystem().getHeldObjectWorldPosition(...args);
}
export function getHeldObjectLocalPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectLocalPosition']>
): ReturnType<SpatialUISystem['getHeldObjectLocalPosition']> {
  return getActiveSpatialUISystem().getHeldObjectLocalPosition(...args);
}
export function getHeldObjectAnchor(
  ...args: Parameters<SpatialUISystem['getHeldObjectAnchor']>
): ReturnType<SpatialUISystem['getHeldObjectAnchor']> {
  return getActiveSpatialUISystem().getHeldObjectAnchor(...args);
}
export function getHeldObjectPivot(
  ...args: Parameters<SpatialUISystem['getHeldObjectPivot']>
): ReturnType<SpatialUISystem['getHeldObjectPivot']> {
  return getActiveSpatialUISystem().getHeldObjectPivot(...args);
}
export function getHeldObjectGripPoint(
  ...args: Parameters<SpatialUISystem['getHeldObjectGripPoint']>
): ReturnType<SpatialUISystem['getHeldObjectGripPoint']> {
  return getActiveSpatialUISystem().getHeldObjectGripPoint(...args);
}
export function getHeldObjectContactPoint(
  ...args: Parameters<SpatialUISystem['getHeldObjectContactPoint']>
): ReturnType<SpatialUISystem['getHeldObjectContactPoint']> {
  return getActiveSpatialUISystem().getHeldObjectContactPoint(...args);
}
export function getHeldObjectTipPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectTipPosition']>
): ReturnType<SpatialUISystem['getHeldObjectTipPosition']> {
  return getActiveSpatialUISystem().getHeldObjectTipPosition(...args);
}
export function getHeldObjectBasePosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectBasePosition']>
): ReturnType<SpatialUISystem['getHeldObjectBasePosition']> {
  return getActiveSpatialUISystem().getHeldObjectBasePosition(...args);
}
export function getHeldObjectFrontPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectFrontPosition']>
): ReturnType<SpatialUISystem['getHeldObjectFrontPosition']> {
  return getActiveSpatialUISystem().getHeldObjectFrontPosition(...args);
}
export function getHeldObjectBackPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectBackPosition']>
): ReturnType<SpatialUISystem['getHeldObjectBackPosition']> {
  return getActiveSpatialUISystem().getHeldObjectBackPosition(...args);
}
export function getHeldObjectLeftPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectLeftPosition']>
): ReturnType<SpatialUISystem['getHeldObjectLeftPosition']> {
  return getActiveSpatialUISystem().getHeldObjectLeftPosition(...args);
}
export function getHeldObjectRightPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectRightPosition']>
): ReturnType<SpatialUISystem['getHeldObjectRightPosition']> {
  return getActiveSpatialUISystem().getHeldObjectRightPosition(...args);
}
export function getHeldObjectUpPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectUpPosition']>
): ReturnType<SpatialUISystem['getHeldObjectUpPosition']> {
  return getActiveSpatialUISystem().getHeldObjectUpPosition(...args);
}
export function getHeldObjectDownPosition(
  ...args: Parameters<SpatialUISystem['getHeldObjectDownPosition']>
): ReturnType<SpatialUISystem['getHeldObjectDownPosition']> {
  return getActiveSpatialUISystem().getHeldObjectDownPosition(...args);
}
export function calculateHeldObjectLength(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectLength']>
): ReturnType<SpatialUISystem['calculateHeldObjectLength']> {
  return getActiveSpatialUISystem().calculateHeldObjectLength(...args);
}
export function calculateHeldObjectWidth(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectWidth']>
): ReturnType<SpatialUISystem['calculateHeldObjectWidth']> {
  return getActiveSpatialUISystem().calculateHeldObjectWidth(...args);
}
export function calculateHeldObjectHeight(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectHeight']>
): ReturnType<SpatialUISystem['calculateHeldObjectHeight']> {
  return getActiveSpatialUISystem().calculateHeldObjectHeight(...args);
}
export function calculateHeldObjectVolume(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectVolume']>
): ReturnType<SpatialUISystem['calculateHeldObjectVolume']> {
  return getActiveSpatialUISystem().calculateHeldObjectVolume(...args);
}
export function calculateHeldObjectSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectSurfaceArea']>
): ReturnType<SpatialUISystem['calculateHeldObjectSurfaceArea']> {
  return getActiveSpatialUISystem().calculateHeldObjectSurfaceArea(...args);
}
export function calculateHeldObjectMass(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectMass']>
): ReturnType<SpatialUISystem['calculateHeldObjectMass']> {
  return getActiveSpatialUISystem().calculateHeldObjectMass(...args);
}
export function calculateHeldObjectCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectCenterOfMass']>
): ReturnType<SpatialUISystem['calculateHeldObjectCenterOfMass']> {
  return getActiveSpatialUISystem().calculateHeldObjectCenterOfMass(...args);
}
export function calculateHeldObjectInertiaTensor(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectInertiaTensor']>
): ReturnType<SpatialUISystem['calculateHeldObjectInertiaTensor']> {
  return getActiveSpatialUISystem().calculateHeldObjectInertiaTensor(...args);
}
export function calculateHeldObjectBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectBoundingBox']>
): ReturnType<SpatialUISystem['calculateHeldObjectBoundingBox']> {
  return getActiveSpatialUISystem().calculateHeldObjectBoundingBox(...args);
}
export function calculateHeldObjectBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectBoundingSphere']>
): ReturnType<SpatialUISystem['calculateHeldObjectBoundingSphere']> {
  return getActiveSpatialUISystem().calculateHeldObjectBoundingSphere(...args);
}
export function calculateHeldObjectBoundingCapsule(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectBoundingCapsule']>
): ReturnType<SpatialUISystem['calculateHeldObjectBoundingCapsule']> {
  return getActiveSpatialUISystem().calculateHeldObjectBoundingCapsule(...args);
}
export function calculateHeldObjectBoundingCylinder(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectBoundingCylinder']>
): ReturnType<SpatialUISystem['calculateHeldObjectBoundingCylinder']> {
  return getActiveSpatialUISystem().calculateHeldObjectBoundingCylinder(...args);
}
export function calculateHeldObjectDistanceToHand(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectDistanceToHand']>
): ReturnType<SpatialUISystem['calculateHeldObjectDistanceToHand']> {
  return getActiveSpatialUISystem().calculateHeldObjectDistanceToHand(...args);
}
export function calculateHeldObjectDistanceToWrist(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectDistanceToWrist']>
): ReturnType<SpatialUISystem['calculateHeldObjectDistanceToWrist']> {
  return getActiveSpatialUISystem().calculateHeldObjectDistanceToWrist(...args);
}
export function calculateHeldObjectDistanceToCamera(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectDistanceToCamera']>
): ReturnType<SpatialUISystem['calculateHeldObjectDistanceToCamera']> {
  return getActiveSpatialUISystem().calculateHeldObjectDistanceToCamera(...args);
}
export function calculateHeldObjectDistanceToTarget(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectDistanceToTarget']>
): ReturnType<SpatialUISystem['calculateHeldObjectDistanceToTarget']> {
  return getActiveSpatialUISystem().calculateHeldObjectDistanceToTarget(...args);
}
export function calculateHeldObjectGripAlignment(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectGripAlignment']>
): ReturnType<SpatialUISystem['calculateHeldObjectGripAlignment']> {
  return getActiveSpatialUISystem().calculateHeldObjectGripAlignment(...args);
}
export function calculateHeldObjectGripOffset(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectGripOffset']>
): ReturnType<SpatialUISystem['calculateHeldObjectGripOffset']> {
  return getActiveSpatialUISystem().calculateHeldObjectGripOffset(...args);
}
export function calculateHeldObjectGripRotation(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectGripRotation']>
): ReturnType<SpatialUISystem['calculateHeldObjectGripRotation']> {
  return getActiveSpatialUISystem().calculateHeldObjectGripRotation(...args);
}
export function calculateHeldObjectGripStability(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectGripStability']>
): ReturnType<SpatialUISystem['calculateHeldObjectGripStability']> {
  return getActiveSpatialUISystem().calculateHeldObjectGripStability(...args);
}
export function calculateHeldObjectHandPose(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectHandPose']>
): ReturnType<SpatialUISystem['calculateHeldObjectHandPose']> {
  return getActiveSpatialUISystem().calculateHeldObjectHandPose(...args);
}
export function calculateHeldObjectFingerContact(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectFingerContact']>
): ReturnType<SpatialUISystem['calculateHeldObjectFingerContact']> {
  return getActiveSpatialUISystem().calculateHeldObjectFingerContact(...args);
}
export function calculateHeldObjectCollision(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectCollision']>
): ReturnType<SpatialUISystem['calculateHeldObjectCollision']> {
  return getActiveSpatialUISystem().calculateHeldObjectCollision(...args);
}
export function calculateHeldObjectPenetrationDepth(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectPenetrationDepth']>
): ReturnType<SpatialUISystem['calculateHeldObjectPenetrationDepth']> {
  return getActiveSpatialUISystem().calculateHeldObjectPenetrationDepth(...args);
}
export function calculateHeldObjectVelocity(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectVelocity']>
): ReturnType<SpatialUISystem['calculateHeldObjectVelocity']> {
  return getActiveSpatialUISystem().calculateHeldObjectVelocity(...args);
}
export function calculateHeldObjectAcceleration(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectAcceleration']>
): ReturnType<SpatialUISystem['calculateHeldObjectAcceleration']> {
  return getActiveSpatialUISystem().calculateHeldObjectAcceleration(...args);
}
export function calculateHeldObjectAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectAngularVelocity']>
): ReturnType<SpatialUISystem['calculateHeldObjectAngularVelocity']> {
  return getActiveSpatialUISystem().calculateHeldObjectAngularVelocity(...args);
}
export function calculateHeldObjectAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateHeldObjectAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateHeldObjectAngularAcceleration(...args);
}
export function calculateHeldObjectTrajectory(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectTrajectory']>
): ReturnType<SpatialUISystem['calculateHeldObjectTrajectory']> {
  return getActiveSpatialUISystem().calculateHeldObjectTrajectory(...args);
}
export function calculateHeldObjectThrowVelocity(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectThrowVelocity']>
): ReturnType<SpatialUISystem['calculateHeldObjectThrowVelocity']> {
  return getActiveSpatialUISystem().calculateHeldObjectThrowVelocity(...args);
}
export function calculateHeldObjectReleasePosition(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectReleasePosition']>
): ReturnType<SpatialUISystem['calculateHeldObjectReleasePosition']> {
  return getActiveSpatialUISystem().calculateHeldObjectReleasePosition(...args);
}
export function calculateHeldObjectReleaseRotation(
  ...args: Parameters<SpatialUISystem['calculateHeldObjectReleaseRotation']>
): ReturnType<SpatialUISystem['calculateHeldObjectReleaseRotation']> {
  return getActiveSpatialUISystem().calculateHeldObjectReleaseRotation(...args);
}
export function getTorsoPosition(
  ...args: Parameters<SpatialUISystem['getTorsoPosition']>
): ReturnType<SpatialUISystem['getTorsoPosition']> {
  return getActiveSpatialUISystem().getTorsoPosition(...args);
}
export function getTorsoCenter(
  ...args: Parameters<SpatialUISystem['getTorsoCenter']>
): ReturnType<SpatialUISystem['getTorsoCenter']> {
  return getActiveSpatialUISystem().getTorsoCenter(...args);
}
export function getTorsoTopPosition(
  ...args: Parameters<SpatialUISystem['getTorsoTopPosition']>
): ReturnType<SpatialUISystem['getTorsoTopPosition']> {
  return getActiveSpatialUISystem().getTorsoTopPosition(...args);
}
export function getTorsoBottomPosition(
  ...args: Parameters<SpatialUISystem['getTorsoBottomPosition']>
): ReturnType<SpatialUISystem['getTorsoBottomPosition']> {
  return getActiveSpatialUISystem().getTorsoBottomPosition(...args);
}
export function getTorsoFrontPosition(
  ...args: Parameters<SpatialUISystem['getTorsoFrontPosition']>
): ReturnType<SpatialUISystem['getTorsoFrontPosition']> {
  return getActiveSpatialUISystem().getTorsoFrontPosition(...args);
}
export function getTorsoBackPosition(
  ...args: Parameters<SpatialUISystem['getTorsoBackPosition']>
): ReturnType<SpatialUISystem['getTorsoBackPosition']> {
  return getActiveSpatialUISystem().getTorsoBackPosition(...args);
}
export function getTorsoLeftPosition(
  ...args: Parameters<SpatialUISystem['getTorsoLeftPosition']>
): ReturnType<SpatialUISystem['getTorsoLeftPosition']> {
  return getActiveSpatialUISystem().getTorsoLeftPosition(...args);
}
export function getTorsoRightPosition(
  ...args: Parameters<SpatialUISystem['getTorsoRightPosition']>
): ReturnType<SpatialUISystem['getTorsoRightPosition']> {
  return getActiveSpatialUISystem().getTorsoRightPosition(...args);
}
export function getChestPosition(
  ...args: Parameters<SpatialUISystem['getChestPosition']>
): ReturnType<SpatialUISystem['getChestPosition']> {
  return getActiveSpatialUISystem().getChestPosition(...args);
}
export function getChestCenter(
  ...args: Parameters<SpatialUISystem['getChestCenter']>
): ReturnType<SpatialUISystem['getChestCenter']> {
  return getActiveSpatialUISystem().getChestCenter(...args);
}
export function getChestFrontPosition(
  ...args: Parameters<SpatialUISystem['getChestFrontPosition']>
): ReturnType<SpatialUISystem['getChestFrontPosition']> {
  return getActiveSpatialUISystem().getChestFrontPosition(...args);
}
export function getChestBackPosition(
  ...args: Parameters<SpatialUISystem['getChestBackPosition']>
): ReturnType<SpatialUISystem['getChestBackPosition']> {
  return getActiveSpatialUISystem().getChestBackPosition(...args);
}
export function getRibcageCenter(
  ...args: Parameters<SpatialUISystem['getRibcageCenter']>
): ReturnType<SpatialUISystem['getRibcageCenter']> {
  return getActiveSpatialUISystem().getRibcageCenter(...args);
}
export function getSternumPosition(
  ...args: Parameters<SpatialUISystem['getSternumPosition']>
): ReturnType<SpatialUISystem['getSternumPosition']> {
  return getActiveSpatialUISystem().getSternumPosition(...args);
}
export function getSpinePosition(
  ...args: Parameters<SpatialUISystem['getSpinePosition']>
): ReturnType<SpatialUISystem['getSpinePosition']> {
  return getActiveSpatialUISystem().getSpinePosition(...args);
}
export function getUpperSpinePosition(
  ...args: Parameters<SpatialUISystem['getUpperSpinePosition']>
): ReturnType<SpatialUISystem['getUpperSpinePosition']> {
  return getActiveSpatialUISystem().getUpperSpinePosition(...args);
}
export function getMiddleSpinePosition(
  ...args: Parameters<SpatialUISystem['getMiddleSpinePosition']>
): ReturnType<SpatialUISystem['getMiddleSpinePosition']> {
  return getActiveSpatialUISystem().getMiddleSpinePosition(...args);
}
export function getLowerSpinePosition(
  ...args: Parameters<SpatialUISystem['getLowerSpinePosition']>
): ReturnType<SpatialUISystem['getLowerSpinePosition']> {
  return getActiveSpatialUISystem().getLowerSpinePosition(...args);
}
export function calculateTorsoLength(
  ...args: Parameters<SpatialUISystem['calculateTorsoLength']>
): ReturnType<SpatialUISystem['calculateTorsoLength']> {
  return getActiveSpatialUISystem().calculateTorsoLength(...args);
}
export function calculateTorsoWidth(
  ...args: Parameters<SpatialUISystem['calculateTorsoWidth']>
): ReturnType<SpatialUISystem['calculateTorsoWidth']> {
  return getActiveSpatialUISystem().calculateTorsoWidth(...args);
}
export function calculateTorsoHeight(
  ...args: Parameters<SpatialUISystem['calculateTorsoHeight']>
): ReturnType<SpatialUISystem['calculateTorsoHeight']> {
  return getActiveSpatialUISystem().calculateTorsoHeight(...args);
}
export function calculateTorsoDepth(
  ...args: Parameters<SpatialUISystem['calculateTorsoDepth']>
): ReturnType<SpatialUISystem['calculateTorsoDepth']> {
  return getActiveSpatialUISystem().calculateTorsoDepth(...args);
}
export function calculateTorsoVolume(
  ...args: Parameters<SpatialUISystem['calculateTorsoVolume']>
): ReturnType<SpatialUISystem['calculateTorsoVolume']> {
  return getActiveSpatialUISystem().calculateTorsoVolume(...args);
}
export function calculateTorsoSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateTorsoSurfaceArea']>
): ReturnType<SpatialUISystem['calculateTorsoSurfaceArea']> {
  return getActiveSpatialUISystem().calculateTorsoSurfaceArea(...args);
}
export function calculateTorsoBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateTorsoBoundingBox']>
): ReturnType<SpatialUISystem['calculateTorsoBoundingBox']> {
  return getActiveSpatialUISystem().calculateTorsoBoundingBox(...args);
}
export function calculateTorsoBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateTorsoBoundingSphere']>
): ReturnType<SpatialUISystem['calculateTorsoBoundingSphere']> {
  return getActiveSpatialUISystem().calculateTorsoBoundingSphere(...args);
}
export function calculateTorsoCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateTorsoCenterOfMass']>
): ReturnType<SpatialUISystem['calculateTorsoCenterOfMass']> {
  return getActiveSpatialUISystem().calculateTorsoCenterOfMass(...args);
}
export function calculateTorsoOrientation(
  ...args: Parameters<SpatialUISystem['calculateTorsoOrientation']>
): ReturnType<SpatialUISystem['calculateTorsoOrientation']> {
  return getActiveSpatialUISystem().calculateTorsoOrientation(...args);
}
export function calculateTorsoRotation(
  ...args: Parameters<SpatialUISystem['calculateTorsoRotation']>
): ReturnType<SpatialUISystem['calculateTorsoRotation']> {
  return getActiveSpatialUISystem().calculateTorsoRotation(...args);
}
export function calculateTorsoTilt(
  ...args: Parameters<SpatialUISystem['calculateTorsoTilt']>
): ReturnType<SpatialUISystem['calculateTorsoTilt']> {
  return getActiveSpatialUISystem().calculateTorsoTilt(...args);
}
export function calculateTorsoTwist(
  ...args: Parameters<SpatialUISystem['calculateTorsoTwist']>
): ReturnType<SpatialUISystem['calculateTorsoTwist']> {
  return getActiveSpatialUISystem().calculateTorsoTwist(...args);
}
export function calculateTorsoBend(
  ...args: Parameters<SpatialUISystem['calculateTorsoBend']>
): ReturnType<SpatialUISystem['calculateTorsoBend']> {
  return getActiveSpatialUISystem().calculateTorsoBend(...args);
}
export function calculateTorsoLeanAngle(
  ...args: Parameters<SpatialUISystem['calculateTorsoLeanAngle']>
): ReturnType<SpatialUISystem['calculateTorsoLeanAngle']> {
  return getActiveSpatialUISystem().calculateTorsoLeanAngle(...args);
}
export function calculateTorsoFlexion(
  ...args: Parameters<SpatialUISystem['calculateTorsoFlexion']>
): ReturnType<SpatialUISystem['calculateTorsoFlexion']> {
  return getActiveSpatialUISystem().calculateTorsoFlexion(...args);
}
export function calculateTorsoExtension(
  ...args: Parameters<SpatialUISystem['calculateTorsoExtension']>
): ReturnType<SpatialUISystem['calculateTorsoExtension']> {
  return getActiveSpatialUISystem().calculateTorsoExtension(...args);
}
export function calculateTorsoLateralBend(
  ...args: Parameters<SpatialUISystem['calculateTorsoLateralBend']>
): ReturnType<SpatialUISystem['calculateTorsoLateralBend']> {
  return getActiveSpatialUISystem().calculateTorsoLateralBend(...args);
}
export function calculateTorsoVelocity(
  ...args: Parameters<SpatialUISystem['calculateTorsoVelocity']>
): ReturnType<SpatialUISystem['calculateTorsoVelocity']> {
  return getActiveSpatialUISystem().calculateTorsoVelocity(...args);
}
export function calculateTorsoAcceleration(
  ...args: Parameters<SpatialUISystem['calculateTorsoAcceleration']>
): ReturnType<SpatialUISystem['calculateTorsoAcceleration']> {
  return getActiveSpatialUISystem().calculateTorsoAcceleration(...args);
}
export function calculateTorsoAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateTorsoAngularVelocity']>
): ReturnType<SpatialUISystem['calculateTorsoAngularVelocity']> {
  return getActiveSpatialUISystem().calculateTorsoAngularVelocity(...args);
}
export function calculateTorsoAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateTorsoAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateTorsoAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateTorsoAngularAcceleration(...args);
}
export function calculateTorsoToHeadDistance(
  ...args: Parameters<SpatialUISystem['calculateTorsoToHeadDistance']>
): ReturnType<SpatialUISystem['calculateTorsoToHeadDistance']> {
  return getActiveSpatialUISystem().calculateTorsoToHeadDistance(...args);
}
export function calculateTorsoToHipDistance(
  ...args: Parameters<SpatialUISystem['calculateTorsoToHipDistance']>
): ReturnType<SpatialUISystem['calculateTorsoToHipDistance']> {
  return getActiveSpatialUISystem().calculateTorsoToHipDistance(...args);
}
export function calculateTorsoToShoulderDistance(
  ...args: Parameters<SpatialUISystem['calculateTorsoToShoulderDistance']>
): ReturnType<SpatialUISystem['calculateTorsoToShoulderDistance']> {
  return getActiveSpatialUISystem().calculateTorsoToShoulderDistance(...args);
}
export function calculateTorsoSymmetry(
  ...args: Parameters<SpatialUISystem['calculateTorsoSymmetry']>
): ReturnType<SpatialUISystem['calculateTorsoSymmetry']> {
  return getActiveSpatialUISystem().calculateTorsoSymmetry(...args);
}
export function calculateTorsoPoseError(
  ...args: Parameters<SpatialUISystem['calculateTorsoPoseError']>
): ReturnType<SpatialUISystem['calculateTorsoPoseError']> {
  return getActiveSpatialUISystem().calculateTorsoPoseError(...args);
}
export function calculateTorsoMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateTorsoMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateTorsoMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateTorsoMotionSmoothness(...args);
}
export function calculateTorsoSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateTorsoSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateTorsoSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateTorsoSurfaceNormal(...args);
}
export function calculateTorsoCollision(
  ...args: Parameters<SpatialUISystem['calculateTorsoCollision']>
): ReturnType<SpatialUISystem['calculateTorsoCollision']> {
  return getActiveSpatialUISystem().calculateTorsoCollision(...args);
}
export function calculateTorsoGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateTorsoGroundClearance']>
): ReturnType<SpatialUISystem['calculateTorsoGroundClearance']> {
  return getActiveSpatialUISystem().calculateTorsoGroundClearance(...args);
}
export function calculateTorsoJointChain(
  ...args: Parameters<SpatialUISystem['calculateTorsoJointChain']>
): ReturnType<SpatialUISystem['calculateTorsoJointChain']> {
  return getActiveSpatialUISystem().calculateTorsoJointChain(...args);
}
export function getAbdomenPosition(
  ...args: Parameters<SpatialUISystem['getAbdomenPosition']>
): ReturnType<SpatialUISystem['getAbdomenPosition']> {
  return getActiveSpatialUISystem().getAbdomenPosition(...args);
}
export function getAbdomenCenter(
  ...args: Parameters<SpatialUISystem['getAbdomenCenter']>
): ReturnType<SpatialUISystem['getAbdomenCenter']> {
  return getActiveSpatialUISystem().getAbdomenCenter(...args);
}
export function getUpperAbdomenPosition(
  ...args: Parameters<SpatialUISystem['getUpperAbdomenPosition']>
): ReturnType<SpatialUISystem['getUpperAbdomenPosition']> {
  return getActiveSpatialUISystem().getUpperAbdomenPosition(...args);
}
export function getLowerAbdomenPosition(
  ...args: Parameters<SpatialUISystem['getLowerAbdomenPosition']>
): ReturnType<SpatialUISystem['getLowerAbdomenPosition']> {
  return getActiveSpatialUISystem().getLowerAbdomenPosition(...args);
}
export function getNavelPosition(
  ...args: Parameters<SpatialUISystem['getNavelPosition']>
): ReturnType<SpatialUISystem['getNavelPosition']> {
  return getActiveSpatialUISystem().getNavelPosition(...args);
}
export function getPelvisPosition(
  ...args: Parameters<SpatialUISystem['getPelvisPosition']>
): ReturnType<SpatialUISystem['getPelvisPosition']> {
  return getActiveSpatialUISystem().getPelvisPosition(...args);
}
export function getPelvisCenter(
  ...args: Parameters<SpatialUISystem['getPelvisCenter']>
): ReturnType<SpatialUISystem['getPelvisCenter']> {
  return getActiveSpatialUISystem().getPelvisCenter(...args);
}
export function getPelvisFrontPosition(
  ...args: Parameters<SpatialUISystem['getPelvisFrontPosition']>
): ReturnType<SpatialUISystem['getPelvisFrontPosition']> {
  return getActiveSpatialUISystem().getPelvisFrontPosition(...args);
}
export function getPelvisBackPosition(
  ...args: Parameters<SpatialUISystem['getPelvisBackPosition']>
): ReturnType<SpatialUISystem['getPelvisBackPosition']> {
  return getActiveSpatialUISystem().getPelvisBackPosition(...args);
}
export function getLeftHipPosition(
  ...args: Parameters<SpatialUISystem['getLeftHipPosition']>
): ReturnType<SpatialUISystem['getLeftHipPosition']> {
  return getActiveSpatialUISystem().getLeftHipPosition(...args);
}
export function getRightHipPosition(
  ...args: Parameters<SpatialUISystem['getRightHipPosition']>
): ReturnType<SpatialUISystem['getRightHipPosition']> {
  return getActiveSpatialUISystem().getRightHipPosition(...args);
}
export function getHipCenter(
  ...args: Parameters<SpatialUISystem['getHipCenter']>
): ReturnType<SpatialUISystem['getHipCenter']> {
  return getActiveSpatialUISystem().getHipCenter(...args);
}
export function getHipJointPosition(
  ...args: Parameters<SpatialUISystem['getHipJointPosition']>
): ReturnType<SpatialUISystem['getHipJointPosition']> {
  return getActiveSpatialUISystem().getHipJointPosition(...args);
}
export function getSacrumPosition(
  ...args: Parameters<SpatialUISystem['getSacrumPosition']>
): ReturnType<SpatialUISystem['getSacrumPosition']> {
  return getActiveSpatialUISystem().getSacrumPosition(...args);
}
export function getTailbonePosition(
  ...args: Parameters<SpatialUISystem['getTailbonePosition']>
): ReturnType<SpatialUISystem['getTailbonePosition']> {
  return getActiveSpatialUISystem().getTailbonePosition(...args);
}
export function calculateAbdomenWidth(
  ...args: Parameters<SpatialUISystem['calculateAbdomenWidth']>
): ReturnType<SpatialUISystem['calculateAbdomenWidth']> {
  return getActiveSpatialUISystem().calculateAbdomenWidth(...args);
}
export function calculateAbdomenHeight(
  ...args: Parameters<SpatialUISystem['calculateAbdomenHeight']>
): ReturnType<SpatialUISystem['calculateAbdomenHeight']> {
  return getActiveSpatialUISystem().calculateAbdomenHeight(...args);
}
export function calculateAbdomenDepth(
  ...args: Parameters<SpatialUISystem['calculateAbdomenDepth']>
): ReturnType<SpatialUISystem['calculateAbdomenDepth']> {
  return getActiveSpatialUISystem().calculateAbdomenDepth(...args);
}
export function calculateAbdomenVolume(
  ...args: Parameters<SpatialUISystem['calculateAbdomenVolume']>
): ReturnType<SpatialUISystem['calculateAbdomenVolume']> {
  return getActiveSpatialUISystem().calculateAbdomenVolume(...args);
}
export function calculateAbdomenCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateAbdomenCenterOfMass']>
): ReturnType<SpatialUISystem['calculateAbdomenCenterOfMass']> {
  return getActiveSpatialUISystem().calculateAbdomenCenterOfMass(...args);
}
export function calculatePelvisWidth(
  ...args: Parameters<SpatialUISystem['calculatePelvisWidth']>
): ReturnType<SpatialUISystem['calculatePelvisWidth']> {
  return getActiveSpatialUISystem().calculatePelvisWidth(...args);
}
export function calculatePelvisHeight(
  ...args: Parameters<SpatialUISystem['calculatePelvisHeight']>
): ReturnType<SpatialUISystem['calculatePelvisHeight']> {
  return getActiveSpatialUISystem().calculatePelvisHeight(...args);
}
export function calculatePelvisDepth(
  ...args: Parameters<SpatialUISystem['calculatePelvisDepth']>
): ReturnType<SpatialUISystem['calculatePelvisDepth']> {
  return getActiveSpatialUISystem().calculatePelvisDepth(...args);
}
export function calculatePelvisOrientation(
  ...args: Parameters<SpatialUISystem['calculatePelvisOrientation']>
): ReturnType<SpatialUISystem['calculatePelvisOrientation']> {
  return getActiveSpatialUISystem().calculatePelvisOrientation(...args);
}
export function calculatePelvisRotation(
  ...args: Parameters<SpatialUISystem['calculatePelvisRotation']>
): ReturnType<SpatialUISystem['calculatePelvisRotation']> {
  return getActiveSpatialUISystem().calculatePelvisRotation(...args);
}
export function calculatePelvisTilt(
  ...args: Parameters<SpatialUISystem['calculatePelvisTilt']>
): ReturnType<SpatialUISystem['calculatePelvisTilt']> {
  return getActiveSpatialUISystem().calculatePelvisTilt(...args);
}
export function calculatePelvisTwist(
  ...args: Parameters<SpatialUISystem['calculatePelvisTwist']>
): ReturnType<SpatialUISystem['calculatePelvisTwist']> {
  return getActiveSpatialUISystem().calculatePelvisTwist(...args);
}
export function calculateHipWidth(
  ...args: Parameters<SpatialUISystem['calculateHipWidth']>
): ReturnType<SpatialUISystem['calculateHipWidth']> {
  return getActiveSpatialUISystem().calculateHipWidth(...args);
}
export function calculateHipSymmetry(
  ...args: Parameters<SpatialUISystem['calculateHipSymmetry']>
): ReturnType<SpatialUISystem['calculateHipSymmetry']> {
  return getActiveSpatialUISystem().calculateHipSymmetry(...args);
}
export function calculateHipJointAngle(
  ...args: Parameters<SpatialUISystem['calculateHipJointAngle']>
): ReturnType<SpatialUISystem['calculateHipJointAngle']> {
  return getActiveSpatialUISystem().calculateHipJointAngle(...args);
}
export function calculateHipFlexion(
  ...args: Parameters<SpatialUISystem['calculateHipFlexion']>
): ReturnType<SpatialUISystem['calculateHipFlexion']> {
  return getActiveSpatialUISystem().calculateHipFlexion(...args);
}
export function calculateHipExtension(
  ...args: Parameters<SpatialUISystem['calculateHipExtension']>
): ReturnType<SpatialUISystem['calculateHipExtension']> {
  return getActiveSpatialUISystem().calculateHipExtension(...args);
}
export function calculateHipAbduction(
  ...args: Parameters<SpatialUISystem['calculateHipAbduction']>
): ReturnType<SpatialUISystem['calculateHipAbduction']> {
  return getActiveSpatialUISystem().calculateHipAbduction(...args);
}
export function calculateHipAdduction(
  ...args: Parameters<SpatialUISystem['calculateHipAdduction']>
): ReturnType<SpatialUISystem['calculateHipAdduction']> {
  return getActiveSpatialUISystem().calculateHipAdduction(...args);
}
export function calculateHipInternalRotation(
  ...args: Parameters<SpatialUISystem['calculateHipInternalRotation']>
): ReturnType<SpatialUISystem['calculateHipInternalRotation']> {
  return getActiveSpatialUISystem().calculateHipInternalRotation(...args);
}
export function calculateHipExternalRotation(
  ...args: Parameters<SpatialUISystem['calculateHipExternalRotation']>
): ReturnType<SpatialUISystem['calculateHipExternalRotation']> {
  return getActiveSpatialUISystem().calculateHipExternalRotation(...args);
}
export function calculateHipVelocity(
  ...args: Parameters<SpatialUISystem['calculateHipVelocity']>
): ReturnType<SpatialUISystem['calculateHipVelocity']> {
  return getActiveSpatialUISystem().calculateHipVelocity(...args);
}
export function calculateHipAcceleration(
  ...args: Parameters<SpatialUISystem['calculateHipAcceleration']>
): ReturnType<SpatialUISystem['calculateHipAcceleration']> {
  return getActiveSpatialUISystem().calculateHipAcceleration(...args);
}
export function calculateHipBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateHipBoundingBox']>
): ReturnType<SpatialUISystem['calculateHipBoundingBox']> {
  return getActiveSpatialUISystem().calculateHipBoundingBox(...args);
}
export function calculateHipCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateHipCenterOfMass']>
): ReturnType<SpatialUISystem['calculateHipCenterOfMass']> {
  return getActiveSpatialUISystem().calculateHipCenterOfMass(...args);
}
export function calculateHipToKneeDistance(
  ...args: Parameters<SpatialUISystem['calculateHipToKneeDistance']>
): ReturnType<SpatialUISystem['calculateHipToKneeDistance']> {
  return getActiveSpatialUISystem().calculateHipToKneeDistance(...args);
}
export function calculateHipToAnkleDistance(
  ...args: Parameters<SpatialUISystem['calculateHipToAnkleDistance']>
): ReturnType<SpatialUISystem['calculateHipToAnkleDistance']> {
  return getActiveSpatialUISystem().calculateHipToAnkleDistance(...args);
}
export function calculateHipToFootDistance(
  ...args: Parameters<SpatialUISystem['calculateHipToFootDistance']>
): ReturnType<SpatialUISystem['calculateHipToFootDistance']> {
  return getActiveSpatialUISystem().calculateHipToFootDistance(...args);
}
export function calculatePelvisGroundClearance(
  ...args: Parameters<SpatialUISystem['calculatePelvisGroundClearance']>
): ReturnType<SpatialUISystem['calculatePelvisGroundClearance']> {
  return getActiveSpatialUISystem().calculatePelvisGroundClearance(...args);
}
export function calculatePelvisMotionVector(
  ...args: Parameters<SpatialUISystem['calculatePelvisMotionVector']>
): ReturnType<SpatialUISystem['calculatePelvisMotionVector']> {
  return getActiveSpatialUISystem().calculatePelvisMotionVector(...args);
}
export function calculatePelvisPoseError(
  ...args: Parameters<SpatialUISystem['calculatePelvisPoseError']>
): ReturnType<SpatialUISystem['calculatePelvisPoseError']> {
  return getActiveSpatialUISystem().calculatePelvisPoseError(...args);
}
export function calculatePelvisStability(
  ...args: Parameters<SpatialUISystem['calculatePelvisStability']>
): ReturnType<SpatialUISystem['calculatePelvisStability']> {
  return getActiveSpatialUISystem().calculatePelvisStability(...args);
}
export function calculatePelvisCollision(
  ...args: Parameters<SpatialUISystem['calculatePelvisCollision']>
): ReturnType<SpatialUISystem['calculatePelvisCollision']> {
  return getActiveSpatialUISystem().calculatePelvisCollision(...args);
}
export function calculateHipJointAxis(
  ...args: Parameters<SpatialUISystem['calculateHipJointAxis']>
): ReturnType<SpatialUISystem['calculateHipJointAxis']> {
  return getActiveSpatialUISystem().calculateHipJointAxis(...args);
}
export function calculateHipJointNormal(
  ...args: Parameters<SpatialUISystem['calculateHipJointNormal']>
): ReturnType<SpatialUISystem['calculateHipJointNormal']> {
  return getActiveSpatialUISystem().calculateHipJointNormal(...args);
}
export function getLeftLegPosition(
  ...args: Parameters<SpatialUISystem['getLeftLegPosition']>
): ReturnType<SpatialUISystem['getLeftLegPosition']> {
  return getActiveSpatialUISystem().getLeftLegPosition(...args);
}
export function getRightLegPosition(
  ...args: Parameters<SpatialUISystem['getRightLegPosition']>
): ReturnType<SpatialUISystem['getRightLegPosition']> {
  return getActiveSpatialUISystem().getRightLegPosition(...args);
}
export function getLeftLegCenter(
  ...args: Parameters<SpatialUISystem['getLeftLegCenter']>
): ReturnType<SpatialUISystem['getLeftLegCenter']> {
  return getActiveSpatialUISystem().getLeftLegCenter(...args);
}
export function getRightLegCenter(
  ...args: Parameters<SpatialUISystem['getRightLegCenter']>
): ReturnType<SpatialUISystem['getRightLegCenter']> {
  return getActiveSpatialUISystem().getRightLegCenter(...args);
}
export function getLeftThighPosition(
  ...args: Parameters<SpatialUISystem['getLeftThighPosition']>
): ReturnType<SpatialUISystem['getLeftThighPosition']> {
  return getActiveSpatialUISystem().getLeftThighPosition(...args);
}
export function getRightThighPosition(
  ...args: Parameters<SpatialUISystem['getRightThighPosition']>
): ReturnType<SpatialUISystem['getRightThighPosition']> {
  return getActiveSpatialUISystem().getRightThighPosition(...args);
}
export function getLeftThighCenter(
  ...args: Parameters<SpatialUISystem['getLeftThighCenter']>
): ReturnType<SpatialUISystem['getLeftThighCenter']> {
  return getActiveSpatialUISystem().getLeftThighCenter(...args);
}
export function getRightThighCenter(
  ...args: Parameters<SpatialUISystem['getRightThighCenter']>
): ReturnType<SpatialUISystem['getRightThighCenter']> {
  return getActiveSpatialUISystem().getRightThighCenter(...args);
}
export function getLeftThighStart(
  ...args: Parameters<SpatialUISystem['getLeftThighStart']>
): ReturnType<SpatialUISystem['getLeftThighStart']> {
  return getActiveSpatialUISystem().getLeftThighStart(...args);
}
export function getRightThighStart(
  ...args: Parameters<SpatialUISystem['getRightThighStart']>
): ReturnType<SpatialUISystem['getRightThighStart']> {
  return getActiveSpatialUISystem().getRightThighStart(...args);
}
export function getLeftThighEnd(
  ...args: Parameters<SpatialUISystem['getLeftThighEnd']>
): ReturnType<SpatialUISystem['getLeftThighEnd']> {
  return getActiveSpatialUISystem().getLeftThighEnd(...args);
}
export function getRightThighEnd(
  ...args: Parameters<SpatialUISystem['getRightThighEnd']>
): ReturnType<SpatialUISystem['getRightThighEnd']> {
  return getActiveSpatialUISystem().getRightThighEnd(...args);
}
export function calculateThighLength(
  ...args: Parameters<SpatialUISystem['calculateThighLength']>
): ReturnType<SpatialUISystem['calculateThighLength']> {
  return getActiveSpatialUISystem().calculateThighLength(...args);
}
export function calculateThighWidth(
  ...args: Parameters<SpatialUISystem['calculateThighWidth']>
): ReturnType<SpatialUISystem['calculateThighWidth']> {
  return getActiveSpatialUISystem().calculateThighWidth(...args);
}
export function calculateThighThickness(
  ...args: Parameters<SpatialUISystem['calculateThighThickness']>
): ReturnType<SpatialUISystem['calculateThighThickness']> {
  return getActiveSpatialUISystem().calculateThighThickness(...args);
}
export function calculateThighVolume(
  ...args: Parameters<SpatialUISystem['calculateThighVolume']>
): ReturnType<SpatialUISystem['calculateThighVolume']> {
  return getActiveSpatialUISystem().calculateThighVolume(...args);
}
export function calculateThighSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateThighSurfaceArea']>
): ReturnType<SpatialUISystem['calculateThighSurfaceArea']> {
  return getActiveSpatialUISystem().calculateThighSurfaceArea(...args);
}
export function calculateThighDirection(
  ...args: Parameters<SpatialUISystem['calculateThighDirection']>
): ReturnType<SpatialUISystem['calculateThighDirection']> {
  return getActiveSpatialUISystem().calculateThighDirection(...args);
}
export function calculateThighOrientation(
  ...args: Parameters<SpatialUISystem['calculateThighOrientation']>
): ReturnType<SpatialUISystem['calculateThighOrientation']> {
  return getActiveSpatialUISystem().calculateThighOrientation(...args);
}
export function calculateThighRotation(
  ...args: Parameters<SpatialUISystem['calculateThighRotation']>
): ReturnType<SpatialUISystem['calculateThighRotation']> {
  return getActiveSpatialUISystem().calculateThighRotation(...args);
}
export function calculateThighVelocity(
  ...args: Parameters<SpatialUISystem['calculateThighVelocity']>
): ReturnType<SpatialUISystem['calculateThighVelocity']> {
  return getActiveSpatialUISystem().calculateThighVelocity(...args);
}
export function calculateThighAcceleration(
  ...args: Parameters<SpatialUISystem['calculateThighAcceleration']>
): ReturnType<SpatialUISystem['calculateThighAcceleration']> {
  return getActiveSpatialUISystem().calculateThighAcceleration(...args);
}
export function calculateThighBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateThighBoundingBox']>
): ReturnType<SpatialUISystem['calculateThighBoundingBox']> {
  return getActiveSpatialUISystem().calculateThighBoundingBox(...args);
}
export function calculateThighBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateThighBoundingSphere']>
): ReturnType<SpatialUISystem['calculateThighBoundingSphere']> {
  return getActiveSpatialUISystem().calculateThighBoundingSphere(...args);
}
export function calculateThighCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateThighCenterOfMass']>
): ReturnType<SpatialUISystem['calculateThighCenterOfMass']> {
  return getActiveSpatialUISystem().calculateThighCenterOfMass(...args);
}
export function calculateThighToHipDistance(
  ...args: Parameters<SpatialUISystem['calculateThighToHipDistance']>
): ReturnType<SpatialUISystem['calculateThighToHipDistance']> {
  return getActiveSpatialUISystem().calculateThighToHipDistance(...args);
}
export function calculateThighToKneeDistance(
  ...args: Parameters<SpatialUISystem['calculateThighToKneeDistance']>
): ReturnType<SpatialUISystem['calculateThighToKneeDistance']> {
  return getActiveSpatialUISystem().calculateThighToKneeDistance(...args);
}
export function calculateThighSymmetry(
  ...args: Parameters<SpatialUISystem['calculateThighSymmetry']>
): ReturnType<SpatialUISystem['calculateThighSymmetry']> {
  return getActiveSpatialUISystem().calculateThighSymmetry(...args);
}
export function calculateThighFlexion(
  ...args: Parameters<SpatialUISystem['calculateThighFlexion']>
): ReturnType<SpatialUISystem['calculateThighFlexion']> {
  return getActiveSpatialUISystem().calculateThighFlexion(...args);
}
export function calculateThighExtension(
  ...args: Parameters<SpatialUISystem['calculateThighExtension']>
): ReturnType<SpatialUISystem['calculateThighExtension']> {
  return getActiveSpatialUISystem().calculateThighExtension(...args);
}
export function calculateThighAbduction(
  ...args: Parameters<SpatialUISystem['calculateThighAbduction']>
): ReturnType<SpatialUISystem['calculateThighAbduction']> {
  return getActiveSpatialUISystem().calculateThighAbduction(...args);
}
export function calculateThighAdduction(
  ...args: Parameters<SpatialUISystem['calculateThighAdduction']>
): ReturnType<SpatialUISystem['calculateThighAdduction']> {
  return getActiveSpatialUISystem().calculateThighAdduction(...args);
}
export function calculateThighInternalRotation(
  ...args: Parameters<SpatialUISystem['calculateThighInternalRotation']>
): ReturnType<SpatialUISystem['calculateThighInternalRotation']> {
  return getActiveSpatialUISystem().calculateThighInternalRotation(...args);
}
export function calculateThighExternalRotation(
  ...args: Parameters<SpatialUISystem['calculateThighExternalRotation']>
): ReturnType<SpatialUISystem['calculateThighExternalRotation']> {
  return getActiveSpatialUISystem().calculateThighExternalRotation(...args);
}
export function calculateLegLength(
  ...args: Parameters<SpatialUISystem['calculateLegLength']>
): ReturnType<SpatialUISystem['calculateLegLength']> {
  return getActiveSpatialUISystem().calculateLegLength(...args);
}
export function calculateLegDirection(
  ...args: Parameters<SpatialUISystem['calculateLegDirection']>
): ReturnType<SpatialUISystem['calculateLegDirection']> {
  return getActiveSpatialUISystem().calculateLegDirection(...args);
}
export function calculateLegOrientation(
  ...args: Parameters<SpatialUISystem['calculateLegOrientation']>
): ReturnType<SpatialUISystem['calculateLegOrientation']> {
  return getActiveSpatialUISystem().calculateLegOrientation(...args);
}
export function calculateLegVelocity(
  ...args: Parameters<SpatialUISystem['calculateLegVelocity']>
): ReturnType<SpatialUISystem['calculateLegVelocity']> {
  return getActiveSpatialUISystem().calculateLegVelocity(...args);
}
export function calculateLegAcceleration(
  ...args: Parameters<SpatialUISystem['calculateLegAcceleration']>
): ReturnType<SpatialUISystem['calculateLegAcceleration']> {
  return getActiveSpatialUISystem().calculateLegAcceleration(...args);
}
export function calculateLegBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateLegBoundingBox']>
): ReturnType<SpatialUISystem['calculateLegBoundingBox']> {
  return getActiveSpatialUISystem().calculateLegBoundingBox(...args);
}
export function calculateLegCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateLegCenterOfMass']>
): ReturnType<SpatialUISystem['calculateLegCenterOfMass']> {
  return getActiveSpatialUISystem().calculateLegCenterOfMass(...args);
}
export function calculateLegSwingAngle(
  ...args: Parameters<SpatialUISystem['calculateLegSwingAngle']>
): ReturnType<SpatialUISystem['calculateLegSwingAngle']> {
  return getActiveSpatialUISystem().calculateLegSwingAngle(...args);
}
export function calculateLegStrideLength(
  ...args: Parameters<SpatialUISystem['calculateLegStrideLength']>
): ReturnType<SpatialUISystem['calculateLegStrideLength']> {
  return getActiveSpatialUISystem().calculateLegStrideLength(...args);
}
export function calculateLegStrideFrequency(
  ...args: Parameters<SpatialUISystem['calculateLegStrideFrequency']>
): ReturnType<SpatialUISystem['calculateLegStrideFrequency']> {
  return getActiveSpatialUISystem().calculateLegStrideFrequency(...args);
}
export function calculateLegGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateLegGroundClearance']>
): ReturnType<SpatialUISystem['calculateLegGroundClearance']> {
  return getActiveSpatialUISystem().calculateLegGroundClearance(...args);
}
export function calculateLegContactPoint(
  ...args: Parameters<SpatialUISystem['calculateLegContactPoint']>
): ReturnType<SpatialUISystem['calculateLegContactPoint']> {
  return getActiveSpatialUISystem().calculateLegContactPoint(...args);
}
export function calculateLegContactNormal(
  ...args: Parameters<SpatialUISystem['calculateLegContactNormal']>
): ReturnType<SpatialUISystem['calculateLegContactNormal']> {
  return getActiveSpatialUISystem().calculateLegContactNormal(...args);
}
export function calculateLegPoseError(
  ...args: Parameters<SpatialUISystem['calculateLegPoseError']>
): ReturnType<SpatialUISystem['calculateLegPoseError']> {
  return getActiveSpatialUISystem().calculateLegPoseError(...args);
}
export function calculateLegMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateLegMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateLegMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateLegMotionSmoothness(...args);
}
export function calculateLegInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateLegInverseKinematics']>
): ReturnType<SpatialUISystem['calculateLegInverseKinematics']> {
  return getActiveSpatialUISystem().calculateLegInverseKinematics(...args);
}
export function getLeftKneePosition(
  ...args: Parameters<SpatialUISystem['getLeftKneePosition']>
): ReturnType<SpatialUISystem['getLeftKneePosition']> {
  return getActiveSpatialUISystem().getLeftKneePosition(...args);
}
export function getRightKneePosition(
  ...args: Parameters<SpatialUISystem['getRightKneePosition']>
): ReturnType<SpatialUISystem['getRightKneePosition']> {
  return getActiveSpatialUISystem().getRightKneePosition(...args);
}
export function getLeftKneeCenter(
  ...args: Parameters<SpatialUISystem['getLeftKneeCenter']>
): ReturnType<SpatialUISystem['getLeftKneeCenter']> {
  return getActiveSpatialUISystem().getLeftKneeCenter(...args);
}
export function getRightKneeCenter(
  ...args: Parameters<SpatialUISystem['getRightKneeCenter']>
): ReturnType<SpatialUISystem['getRightKneeCenter']> {
  return getActiveSpatialUISystem().getRightKneeCenter(...args);
}
export function getLeftKneeCapPosition(
  ...args: Parameters<SpatialUISystem['getLeftKneeCapPosition']>
): ReturnType<SpatialUISystem['getLeftKneeCapPosition']> {
  return getActiveSpatialUISystem().getLeftKneeCapPosition(...args);
}
export function getRightKneeCapPosition(
  ...args: Parameters<SpatialUISystem['getRightKneeCapPosition']>
): ReturnType<SpatialUISystem['getRightKneeCapPosition']> {
  return getActiveSpatialUISystem().getRightKneeCapPosition(...args);
}
export function calculateKneeWidth(
  ...args: Parameters<SpatialUISystem['calculateKneeWidth']>
): ReturnType<SpatialUISystem['calculateKneeWidth']> {
  return getActiveSpatialUISystem().calculateKneeWidth(...args);
}
export function calculateKneeThickness(
  ...args: Parameters<SpatialUISystem['calculateKneeThickness']>
): ReturnType<SpatialUISystem['calculateKneeThickness']> {
  return getActiveSpatialUISystem().calculateKneeThickness(...args);
}
export function calculateKneeFlexion(
  ...args: Parameters<SpatialUISystem['calculateKneeFlexion']>
): ReturnType<SpatialUISystem['calculateKneeFlexion']> {
  return getActiveSpatialUISystem().calculateKneeFlexion(...args);
}
export function calculateKneeExtension(
  ...args: Parameters<SpatialUISystem['calculateKneeExtension']>
): ReturnType<SpatialUISystem['calculateKneeExtension']> {
  return getActiveSpatialUISystem().calculateKneeExtension(...args);
}
export function calculateKneeJointAxis(
  ...args: Parameters<SpatialUISystem['calculateKneeJointAxis']>
): ReturnType<SpatialUISystem['calculateKneeJointAxis']> {
  return getActiveSpatialUISystem().calculateKneeJointAxis(...args);
}
export function calculateKneeJointNormal(
  ...args: Parameters<SpatialUISystem['calculateKneeJointNormal']>
): ReturnType<SpatialUISystem['calculateKneeJointNormal']> {
  return getActiveSpatialUISystem().calculateKneeJointNormal(...args);
}
export function calculateKneeVelocity(
  ...args: Parameters<SpatialUISystem['calculateKneeVelocity']>
): ReturnType<SpatialUISystem['calculateKneeVelocity']> {
  return getActiveSpatialUISystem().calculateKneeVelocity(...args);
}
export function calculateKneeAcceleration(
  ...args: Parameters<SpatialUISystem['calculateKneeAcceleration']>
): ReturnType<SpatialUISystem['calculateKneeAcceleration']> {
  return getActiveSpatialUISystem().calculateKneeAcceleration(...args);
}
export function calculateKneeBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateKneeBoundingBox']>
): ReturnType<SpatialUISystem['calculateKneeBoundingBox']> {
  return getActiveSpatialUISystem().calculateKneeBoundingBox(...args);
}
export function calculateKneeBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateKneeBoundingSphere']>
): ReturnType<SpatialUISystem['calculateKneeBoundingSphere']> {
  return getActiveSpatialUISystem().calculateKneeBoundingSphere(...args);
}
export function calculateKneeToHipDistance(
  ...args: Parameters<SpatialUISystem['calculateKneeToHipDistance']>
): ReturnType<SpatialUISystem['calculateKneeToHipDistance']> {
  return getActiveSpatialUISystem().calculateKneeToHipDistance(...args);
}
export function calculateKneeToAnkleDistance(
  ...args: Parameters<SpatialUISystem['calculateKneeToAnkleDistance']>
): ReturnType<SpatialUISystem['calculateKneeToAnkleDistance']> {
  return getActiveSpatialUISystem().calculateKneeToAnkleDistance(...args);
}
export function calculateKneeSymmetry(
  ...args: Parameters<SpatialUISystem['calculateKneeSymmetry']>
): ReturnType<SpatialUISystem['calculateKneeSymmetry']> {
  return getActiveSpatialUISystem().calculateKneeSymmetry(...args);
}
export function getLeftShinPosition(
  ...args: Parameters<SpatialUISystem['getLeftShinPosition']>
): ReturnType<SpatialUISystem['getLeftShinPosition']> {
  return getActiveSpatialUISystem().getLeftShinPosition(...args);
}
export function getRightShinPosition(
  ...args: Parameters<SpatialUISystem['getRightShinPosition']>
): ReturnType<SpatialUISystem['getRightShinPosition']> {
  return getActiveSpatialUISystem().getRightShinPosition(...args);
}
export function getLeftShinCenter(
  ...args: Parameters<SpatialUISystem['getLeftShinCenter']>
): ReturnType<SpatialUISystem['getLeftShinCenter']> {
  return getActiveSpatialUISystem().getLeftShinCenter(...args);
}
export function getRightShinCenter(
  ...args: Parameters<SpatialUISystem['getRightShinCenter']>
): ReturnType<SpatialUISystem['getRightShinCenter']> {
  return getActiveSpatialUISystem().getRightShinCenter(...args);
}
export function getLeftShinStart(
  ...args: Parameters<SpatialUISystem['getLeftShinStart']>
): ReturnType<SpatialUISystem['getLeftShinStart']> {
  return getActiveSpatialUISystem().getLeftShinStart(...args);
}
export function getRightShinStart(
  ...args: Parameters<SpatialUISystem['getRightShinStart']>
): ReturnType<SpatialUISystem['getRightShinStart']> {
  return getActiveSpatialUISystem().getRightShinStart(...args);
}
export function getLeftShinEnd(
  ...args: Parameters<SpatialUISystem['getLeftShinEnd']>
): ReturnType<SpatialUISystem['getLeftShinEnd']> {
  return getActiveSpatialUISystem().getLeftShinEnd(...args);
}
export function getRightShinEnd(
  ...args: Parameters<SpatialUISystem['getRightShinEnd']>
): ReturnType<SpatialUISystem['getRightShinEnd']> {
  return getActiveSpatialUISystem().getRightShinEnd(...args);
}
export function calculateShinLength(
  ...args: Parameters<SpatialUISystem['calculateShinLength']>
): ReturnType<SpatialUISystem['calculateShinLength']> {
  return getActiveSpatialUISystem().calculateShinLength(...args);
}
export function calculateShinWidth(
  ...args: Parameters<SpatialUISystem['calculateShinWidth']>
): ReturnType<SpatialUISystem['calculateShinWidth']> {
  return getActiveSpatialUISystem().calculateShinWidth(...args);
}
export function calculateShinThickness(
  ...args: Parameters<SpatialUISystem['calculateShinThickness']>
): ReturnType<SpatialUISystem['calculateShinThickness']> {
  return getActiveSpatialUISystem().calculateShinThickness(...args);
}
export function calculateShinVolume(
  ...args: Parameters<SpatialUISystem['calculateShinVolume']>
): ReturnType<SpatialUISystem['calculateShinVolume']> {
  return getActiveSpatialUISystem().calculateShinVolume(...args);
}
export function calculateShinDirection(
  ...args: Parameters<SpatialUISystem['calculateShinDirection']>
): ReturnType<SpatialUISystem['calculateShinDirection']> {
  return getActiveSpatialUISystem().calculateShinDirection(...args);
}
export function calculateShinOrientation(
  ...args: Parameters<SpatialUISystem['calculateShinOrientation']>
): ReturnType<SpatialUISystem['calculateShinOrientation']> {
  return getActiveSpatialUISystem().calculateShinOrientation(...args);
}
export function calculateShinVelocity(
  ...args: Parameters<SpatialUISystem['calculateShinVelocity']>
): ReturnType<SpatialUISystem['calculateShinVelocity']> {
  return getActiveSpatialUISystem().calculateShinVelocity(...args);
}
export function calculateShinAcceleration(
  ...args: Parameters<SpatialUISystem['calculateShinAcceleration']>
): ReturnType<SpatialUISystem['calculateShinAcceleration']> {
  return getActiveSpatialUISystem().calculateShinAcceleration(...args);
}
export function calculateShinBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateShinBoundingBox']>
): ReturnType<SpatialUISystem['calculateShinBoundingBox']> {
  return getActiveSpatialUISystem().calculateShinBoundingBox(...args);
}
export function calculateShinCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateShinCenterOfMass']>
): ReturnType<SpatialUISystem['calculateShinCenterOfMass']> {
  return getActiveSpatialUISystem().calculateShinCenterOfMass(...args);
}
export function calculateShinToKneeDistance(
  ...args: Parameters<SpatialUISystem['calculateShinToKneeDistance']>
): ReturnType<SpatialUISystem['calculateShinToKneeDistance']> {
  return getActiveSpatialUISystem().calculateShinToKneeDistance(...args);
}
export function calculateShinToAnkleDistance(
  ...args: Parameters<SpatialUISystem['calculateShinToAnkleDistance']>
): ReturnType<SpatialUISystem['calculateShinToAnkleDistance']> {
  return getActiveSpatialUISystem().calculateShinToAnkleDistance(...args);
}
export function calculateShinRotation(
  ...args: Parameters<SpatialUISystem['calculateShinRotation']>
): ReturnType<SpatialUISystem['calculateShinRotation']> {
  return getActiveSpatialUISystem().calculateShinRotation(...args);
}
export function calculateShinTwist(
  ...args: Parameters<SpatialUISystem['calculateShinTwist']>
): ReturnType<SpatialUISystem['calculateShinTwist']> {
  return getActiveSpatialUISystem().calculateShinTwist(...args);
}
export function calculateShinSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateShinSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateShinSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateShinSurfaceNormal(...args);
}
export function calculateShinGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateShinGroundClearance']>
): ReturnType<SpatialUISystem['calculateShinGroundClearance']> {
  return getActiveSpatialUISystem().calculateShinGroundClearance(...args);
}
export function calculateShinCollision(
  ...args: Parameters<SpatialUISystem['calculateShinCollision']>
): ReturnType<SpatialUISystem['calculateShinCollision']> {
  return getActiveSpatialUISystem().calculateShinCollision(...args);
}
export function calculateShinPoseError(
  ...args: Parameters<SpatialUISystem['calculateShinPoseError']>
): ReturnType<SpatialUISystem['calculateShinPoseError']> {
  return getActiveSpatialUISystem().calculateShinPoseError(...args);
}
export function calculateShinMotionSmoothness(
  ...args: Parameters<SpatialUISystem['calculateShinMotionSmoothness']>
): ReturnType<SpatialUISystem['calculateShinMotionSmoothness']> {
  return getActiveSpatialUISystem().calculateShinMotionSmoothness(...args);
}
export function calculateShinSegmentAlignment(
  ...args: Parameters<SpatialUISystem['calculateShinSegmentAlignment']>
): ReturnType<SpatialUISystem['calculateShinSegmentAlignment']> {
  return getActiveSpatialUISystem().calculateShinSegmentAlignment(...args);
}
export function calculateShinJointChain(
  ...args: Parameters<SpatialUISystem['calculateShinJointChain']>
): ReturnType<SpatialUISystem['calculateShinJointChain']> {
  return getActiveSpatialUISystem().calculateShinJointChain(...args);
}
export function calculateShinInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateShinInverseKinematics']>
): ReturnType<SpatialUISystem['calculateShinInverseKinematics']> {
  return getActiveSpatialUISystem().calculateShinInverseKinematics(...args);
}
export function getLeftAnklePosition(
  ...args: Parameters<SpatialUISystem['getLeftAnklePosition']>
): ReturnType<SpatialUISystem['getLeftAnklePosition']> {
  return getActiveSpatialUISystem().getLeftAnklePosition(...args);
}
export function getRightAnklePosition(
  ...args: Parameters<SpatialUISystem['getRightAnklePosition']>
): ReturnType<SpatialUISystem['getRightAnklePosition']> {
  return getActiveSpatialUISystem().getRightAnklePosition(...args);
}
export function getLeftAnkleCenter(
  ...args: Parameters<SpatialUISystem['getLeftAnkleCenter']>
): ReturnType<SpatialUISystem['getLeftAnkleCenter']> {
  return getActiveSpatialUISystem().getLeftAnkleCenter(...args);
}
export function getRightAnkleCenter(
  ...args: Parameters<SpatialUISystem['getRightAnkleCenter']>
): ReturnType<SpatialUISystem['getRightAnkleCenter']> {
  return getActiveSpatialUISystem().getRightAnkleCenter(...args);
}
export function getLeftHeelPosition(
  ...args: Parameters<SpatialUISystem['getLeftHeelPosition']>
): ReturnType<SpatialUISystem['getLeftHeelPosition']> {
  return getActiveSpatialUISystem().getLeftHeelPosition(...args);
}
export function getRightHeelPosition(
  ...args: Parameters<SpatialUISystem['getRightHeelPosition']>
): ReturnType<SpatialUISystem['getRightHeelPosition']> {
  return getActiveSpatialUISystem().getRightHeelPosition(...args);
}
export function getLeftFootPosition(
  ...args: Parameters<SpatialUISystem['getLeftFootPosition']>
): ReturnType<SpatialUISystem['getLeftFootPosition']> {
  return getActiveSpatialUISystem().getLeftFootPosition(...args);
}
export function getRightFootPosition(
  ...args: Parameters<SpatialUISystem['getRightFootPosition']>
): ReturnType<SpatialUISystem['getRightFootPosition']> {
  return getActiveSpatialUISystem().getRightFootPosition(...args);
}
export function getLeftFootCenter(
  ...args: Parameters<SpatialUISystem['getLeftFootCenter']>
): ReturnType<SpatialUISystem['getLeftFootCenter']> {
  return getActiveSpatialUISystem().getLeftFootCenter(...args);
}
export function getRightFootCenter(
  ...args: Parameters<SpatialUISystem['getRightFootCenter']>
): ReturnType<SpatialUISystem['getRightFootCenter']> {
  return getActiveSpatialUISystem().getRightFootCenter(...args);
}
export function getFootToePosition(
  ...args: Parameters<SpatialUISystem['getFootToePosition']>
): ReturnType<SpatialUISystem['getFootToePosition']> {
  return getActiveSpatialUISystem().getFootToePosition(...args);
}
export function getFootHeelPosition(
  ...args: Parameters<SpatialUISystem['getFootHeelPosition']>
): ReturnType<SpatialUISystem['getFootHeelPosition']> {
  return getActiveSpatialUISystem().getFootHeelPosition(...args);
}
export function getFootArchPosition(
  ...args: Parameters<SpatialUISystem['getFootArchPosition']>
): ReturnType<SpatialUISystem['getFootArchPosition']> {
  return getActiveSpatialUISystem().getFootArchPosition(...args);
}
export function getFootSolePosition(
  ...args: Parameters<SpatialUISystem['getFootSolePosition']>
): ReturnType<SpatialUISystem['getFootSolePosition']> {
  return getActiveSpatialUISystem().getFootSolePosition(...args);
}
export function getFootTopPosition(
  ...args: Parameters<SpatialUISystem['getFootTopPosition']>
): ReturnType<SpatialUISystem['getFootTopPosition']> {
  return getActiveSpatialUISystem().getFootTopPosition(...args);
}
export function getFootInnerEdge(
  ...args: Parameters<SpatialUISystem['getFootInnerEdge']>
): ReturnType<SpatialUISystem['getFootInnerEdge']> {
  return getActiveSpatialUISystem().getFootInnerEdge(...args);
}
export function getFootOuterEdge(
  ...args: Parameters<SpatialUISystem['getFootOuterEdge']>
): ReturnType<SpatialUISystem['getFootOuterEdge']> {
  return getActiveSpatialUISystem().getFootOuterEdge(...args);
}
export function calculateAnkleWidth(
  ...args: Parameters<SpatialUISystem['calculateAnkleWidth']>
): ReturnType<SpatialUISystem['calculateAnkleWidth']> {
  return getActiveSpatialUISystem().calculateAnkleWidth(...args);
}
export function calculateAnkleFlexion(
  ...args: Parameters<SpatialUISystem['calculateAnkleFlexion']>
): ReturnType<SpatialUISystem['calculateAnkleFlexion']> {
  return getActiveSpatialUISystem().calculateAnkleFlexion(...args);
}
export function calculateAnkleExtension(
  ...args: Parameters<SpatialUISystem['calculateAnkleExtension']>
): ReturnType<SpatialUISystem['calculateAnkleExtension']> {
  return getActiveSpatialUISystem().calculateAnkleExtension(...args);
}
export function calculateAnkleInversion(
  ...args: Parameters<SpatialUISystem['calculateAnkleInversion']>
): ReturnType<SpatialUISystem['calculateAnkleInversion']> {
  return getActiveSpatialUISystem().calculateAnkleInversion(...args);
}
export function calculateAnkleEversion(
  ...args: Parameters<SpatialUISystem['calculateAnkleEversion']>
): ReturnType<SpatialUISystem['calculateAnkleEversion']> {
  return getActiveSpatialUISystem().calculateAnkleEversion(...args);
}
export function calculateAnkleRotation(
  ...args: Parameters<SpatialUISystem['calculateAnkleRotation']>
): ReturnType<SpatialUISystem['calculateAnkleRotation']> {
  return getActiveSpatialUISystem().calculateAnkleRotation(...args);
}
export function calculateAnkleVelocity(
  ...args: Parameters<SpatialUISystem['calculateAnkleVelocity']>
): ReturnType<SpatialUISystem['calculateAnkleVelocity']> {
  return getActiveSpatialUISystem().calculateAnkleVelocity(...args);
}
export function calculateAnkleAcceleration(
  ...args: Parameters<SpatialUISystem['calculateAnkleAcceleration']>
): ReturnType<SpatialUISystem['calculateAnkleAcceleration']> {
  return getActiveSpatialUISystem().calculateAnkleAcceleration(...args);
}
export function calculateFootLength(
  ...args: Parameters<SpatialUISystem['calculateFootLength']>
): ReturnType<SpatialUISystem['calculateFootLength']> {
  return getActiveSpatialUISystem().calculateFootLength(...args);
}
export function calculateFootWidth(
  ...args: Parameters<SpatialUISystem['calculateFootWidth']>
): ReturnType<SpatialUISystem['calculateFootWidth']> {
  return getActiveSpatialUISystem().calculateFootWidth(...args);
}
export function calculateFootHeight(
  ...args: Parameters<SpatialUISystem['calculateFootHeight']>
): ReturnType<SpatialUISystem['calculateFootHeight']> {
  return getActiveSpatialUISystem().calculateFootHeight(...args);
}
export function calculateFootThickness(
  ...args: Parameters<SpatialUISystem['calculateFootThickness']>
): ReturnType<SpatialUISystem['calculateFootThickness']> {
  return getActiveSpatialUISystem().calculateFootThickness(...args);
}
export function calculateFootVolume(
  ...args: Parameters<SpatialUISystem['calculateFootVolume']>
): ReturnType<SpatialUISystem['calculateFootVolume']> {
  return getActiveSpatialUISystem().calculateFootVolume(...args);
}
export function calculateFootSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateFootSurfaceArea']>
): ReturnType<SpatialUISystem['calculateFootSurfaceArea']> {
  return getActiveSpatialUISystem().calculateFootSurfaceArea(...args);
}
export function calculateFootOrientation(
  ...args: Parameters<SpatialUISystem['calculateFootOrientation']>
): ReturnType<SpatialUISystem['calculateFootOrientation']> {
  return getActiveSpatialUISystem().calculateFootOrientation(...args);
}
export function calculateFootDirection(
  ...args: Parameters<SpatialUISystem['calculateFootDirection']>
): ReturnType<SpatialUISystem['calculateFootDirection']> {
  return getActiveSpatialUISystem().calculateFootDirection(...args);
}
export function calculateFootPitch(
  ...args: Parameters<SpatialUISystem['calculateFootPitch']>
): ReturnType<SpatialUISystem['calculateFootPitch']> {
  return getActiveSpatialUISystem().calculateFootPitch(...args);
}
export function calculateFootRoll(
  ...args: Parameters<SpatialUISystem['calculateFootRoll']>
): ReturnType<SpatialUISystem['calculateFootRoll']> {
  return getActiveSpatialUISystem().calculateFootRoll(...args);
}
export function calculateFootYaw(
  ...args: Parameters<SpatialUISystem['calculateFootYaw']>
): ReturnType<SpatialUISystem['calculateFootYaw']> {
  return getActiveSpatialUISystem().calculateFootYaw(...args);
}
export function calculateFootVelocity(
  ...args: Parameters<SpatialUISystem['calculateFootVelocity']>
): ReturnType<SpatialUISystem['calculateFootVelocity']> {
  return getActiveSpatialUISystem().calculateFootVelocity(...args);
}
export function calculateFootAcceleration(
  ...args: Parameters<SpatialUISystem['calculateFootAcceleration']>
): ReturnType<SpatialUISystem['calculateFootAcceleration']> {
  return getActiveSpatialUISystem().calculateFootAcceleration(...args);
}
export function calculateFootAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateFootAngularVelocity']>
): ReturnType<SpatialUISystem['calculateFootAngularVelocity']> {
  return getActiveSpatialUISystem().calculateFootAngularVelocity(...args);
}
export function calculateFootBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateFootBoundingBox']>
): ReturnType<SpatialUISystem['calculateFootBoundingBox']> {
  return getActiveSpatialUISystem().calculateFootBoundingBox(...args);
}
export function calculateFootBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateFootBoundingSphere']>
): ReturnType<SpatialUISystem['calculateFootBoundingSphere']> {
  return getActiveSpatialUISystem().calculateFootBoundingSphere(...args);
}
export function calculateFootCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateFootCenterOfMass']>
): ReturnType<SpatialUISystem['calculateFootCenterOfMass']> {
  return getActiveSpatialUISystem().calculateFootCenterOfMass(...args);
}
export function calculateFootGroundContact(
  ...args: Parameters<SpatialUISystem['calculateFootGroundContact']>
): ReturnType<SpatialUISystem['calculateFootGroundContact']> {
  return getActiveSpatialUISystem().calculateFootGroundContact(...args);
}
export function calculateFootGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateFootGroundClearance']>
): ReturnType<SpatialUISystem['calculateFootGroundClearance']> {
  return getActiveSpatialUISystem().calculateFootGroundClearance(...args);
}
export function calculateFootPressureCenter(
  ...args: Parameters<SpatialUISystem['calculateFootPressureCenter']>
): ReturnType<SpatialUISystem['calculateFootPressureCenter']> {
  return getActiveSpatialUISystem().calculateFootPressureCenter(...args);
}
export function calculateFootContactArea(
  ...args: Parameters<SpatialUISystem['calculateFootContactArea']>
): ReturnType<SpatialUISystem['calculateFootContactArea']> {
  return getActiveSpatialUISystem().calculateFootContactArea(...args);
}
export function calculateFootSlipVelocity(
  ...args: Parameters<SpatialUISystem['calculateFootSlipVelocity']>
): ReturnType<SpatialUISystem['calculateFootSlipVelocity']> {
  return getActiveSpatialUISystem().calculateFootSlipVelocity(...args);
}
export function calculateFootStrideLength(
  ...args: Parameters<SpatialUISystem['calculateFootStrideLength']>
): ReturnType<SpatialUISystem['calculateFootStrideLength']> {
  return getActiveSpatialUISystem().calculateFootStrideLength(...args);
}
export function calculateFootInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateFootInverseKinematics']>
): ReturnType<SpatialUISystem['calculateFootInverseKinematics']> {
  return getActiveSpatialUISystem().calculateFootInverseKinematics(...args);
}
export function getBigToePosition(
  ...args: Parameters<SpatialUISystem['getBigToePosition']>
): ReturnType<SpatialUISystem['getBigToePosition']> {
  return getActiveSpatialUISystem().getBigToePosition(...args);
}
export function getSecondToePosition(
  ...args: Parameters<SpatialUISystem['getSecondToePosition']>
): ReturnType<SpatialUISystem['getSecondToePosition']> {
  return getActiveSpatialUISystem().getSecondToePosition(...args);
}
export function getThirdToePosition(
  ...args: Parameters<SpatialUISystem['getThirdToePosition']>
): ReturnType<SpatialUISystem['getThirdToePosition']> {
  return getActiveSpatialUISystem().getThirdToePosition(...args);
}
export function getFourthToePosition(
  ...args: Parameters<SpatialUISystem['getFourthToePosition']>
): ReturnType<SpatialUISystem['getFourthToePosition']> {
  return getActiveSpatialUISystem().getFourthToePosition(...args);
}
export function getLittleToePosition(
  ...args: Parameters<SpatialUISystem['getLittleToePosition']>
): ReturnType<SpatialUISystem['getLittleToePosition']> {
  return getActiveSpatialUISystem().getLittleToePosition(...args);
}
export function getToeTipPosition(
  ...args: Parameters<SpatialUISystem['getToeTipPosition']>
): ReturnType<SpatialUISystem['getToeTipPosition']> {
  return getActiveSpatialUISystem().getToeTipPosition(...args);
}
export function getToeBasePosition(
  ...args: Parameters<SpatialUISystem['getToeBasePosition']>
): ReturnType<SpatialUISystem['getToeBasePosition']> {
  return getActiveSpatialUISystem().getToeBasePosition(...args);
}
export function getToeJointPosition(
  ...args: Parameters<SpatialUISystem['getToeJointPosition']>
): ReturnType<SpatialUISystem['getToeJointPosition']> {
  return getActiveSpatialUISystem().getToeJointPosition(...args);
}
export function getToeNailPosition(
  ...args: Parameters<SpatialUISystem['getToeNailPosition']>
): ReturnType<SpatialUISystem['getToeNailPosition']> {
  return getActiveSpatialUISystem().getToeNailPosition(...args);
}
export function calculateToeLength(
  ...args: Parameters<SpatialUISystem['calculateToeLength']>
): ReturnType<SpatialUISystem['calculateToeLength']> {
  return getActiveSpatialUISystem().calculateToeLength(...args);
}
export function calculateToeWidth(
  ...args: Parameters<SpatialUISystem['calculateToeWidth']>
): ReturnType<SpatialUISystem['calculateToeWidth']> {
  return getActiveSpatialUISystem().calculateToeWidth(...args);
}
export function calculateToeFlexion(
  ...args: Parameters<SpatialUISystem['calculateToeFlexion']>
): ReturnType<SpatialUISystem['calculateToeFlexion']> {
  return getActiveSpatialUISystem().calculateToeFlexion(...args);
}
export function calculateToeExtension(
  ...args: Parameters<SpatialUISystem['calculateToeExtension']>
): ReturnType<SpatialUISystem['calculateToeExtension']> {
  return getActiveSpatialUISystem().calculateToeExtension(...args);
}
export function calculateToeSpread(
  ...args: Parameters<SpatialUISystem['calculateToeSpread']>
): ReturnType<SpatialUISystem['calculateToeSpread']> {
  return getActiveSpatialUISystem().calculateToeSpread(...args);
}
export function calculateToeCurl(
  ...args: Parameters<SpatialUISystem['calculateToeCurl']>
): ReturnType<SpatialUISystem['calculateToeCurl']> {
  return getActiveSpatialUISystem().calculateToeCurl(...args);
}
export function calculateToeDirection(
  ...args: Parameters<SpatialUISystem['calculateToeDirection']>
): ReturnType<SpatialUISystem['calculateToeDirection']> {
  return getActiveSpatialUISystem().calculateToeDirection(...args);
}
export function calculateToeVelocity(
  ...args: Parameters<SpatialUISystem['calculateToeVelocity']>
): ReturnType<SpatialUISystem['calculateToeVelocity']> {
  return getActiveSpatialUISystem().calculateToeVelocity(...args);
}
export function calculateToeAcceleration(
  ...args: Parameters<SpatialUISystem['calculateToeAcceleration']>
): ReturnType<SpatialUISystem['calculateToeAcceleration']> {
  return getActiveSpatialUISystem().calculateToeAcceleration(...args);
}
export function calculateToeJointAngles(
  ...args: Parameters<SpatialUISystem['calculateToeJointAngles']>
): ReturnType<SpatialUISystem['calculateToeJointAngles']> {
  return getActiveSpatialUISystem().calculateToeJointAngles(...args);
}
export function calculateToeBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateToeBoundingBox']>
): ReturnType<SpatialUISystem['calculateToeBoundingBox']> {
  return getActiveSpatialUISystem().calculateToeBoundingBox(...args);
}
export function calculateStandingHeight(
  ...args: Parameters<SpatialUISystem['calculateStandingHeight']>
): ReturnType<SpatialUISystem['calculateStandingHeight']> {
  return getActiveSpatialUISystem().calculateStandingHeight(...args);
}
export function calculateBodyBalance(
  ...args: Parameters<SpatialUISystem['calculateBodyBalance']>
): ReturnType<SpatialUISystem['calculateBodyBalance']> {
  return getActiveSpatialUISystem().calculateBodyBalance(...args);
}
export function calculateCenterOfGravity(
  ...args: Parameters<SpatialUISystem['calculateCenterOfGravity']>
): ReturnType<SpatialUISystem['calculateCenterOfGravity']> {
  return getActiveSpatialUISystem().calculateCenterOfGravity(...args);
}
export function calculateCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateCenterOfMass']>
): ReturnType<SpatialUISystem['calculateCenterOfMass']> {
  return getActiveSpatialUISystem().calculateCenterOfMass(...args);
}
export function calculateBaseOfSupport(
  ...args: Parameters<SpatialUISystem['calculateBaseOfSupport']>
): ReturnType<SpatialUISystem['calculateBaseOfSupport']> {
  return getActiveSpatialUISystem().calculateBaseOfSupport(...args);
}
export function calculateBalanceMargin(
  ...args: Parameters<SpatialUISystem['calculateBalanceMargin']>
): ReturnType<SpatialUISystem['calculateBalanceMargin']> {
  return getActiveSpatialUISystem().calculateBalanceMargin(...args);
}
export function calculateBodySway(
  ...args: Parameters<SpatialUISystem['calculateBodySway']>
): ReturnType<SpatialUISystem['calculateBodySway']> {
  return getActiveSpatialUISystem().calculateBodySway(...args);
}
export function calculateBodyLean(
  ...args: Parameters<SpatialUISystem['calculateBodyLean']>
): ReturnType<SpatialUISystem['calculateBodyLean']> {
  return getActiveSpatialUISystem().calculateBodyLean(...args);
}
export function calculatePostureStability(
  ...args: Parameters<SpatialUISystem['calculatePostureStability']>
): ReturnType<SpatialUISystem['calculatePostureStability']> {
  return getActiveSpatialUISystem().calculatePostureStability(...args);
}
export function calculateStandingPoseError(
  ...args: Parameters<SpatialUISystem['calculateStandingPoseError']>
): ReturnType<SpatialUISystem['calculateStandingPoseError']> {
  return getActiveSpatialUISystem().calculateStandingPoseError(...args);
}
export function calculateSittingHeight(
  ...args: Parameters<SpatialUISystem['calculateSittingHeight']>
): ReturnType<SpatialUISystem['calculateSittingHeight']> {
  return getActiveSpatialUISystem().calculateSittingHeight(...args);
}
export function calculateSittingPose(
  ...args: Parameters<SpatialUISystem['calculateSittingPose']>
): ReturnType<SpatialUISystem['calculateSittingPose']> {
  return getActiveSpatialUISystem().calculateSittingPose(...args);
}
export function calculateSquatDepth(
  ...args: Parameters<SpatialUISystem['calculateSquatDepth']>
): ReturnType<SpatialUISystem['calculateSquatDepth']> {
  return getActiveSpatialUISystem().calculateSquatDepth(...args);
}
export function calculateJumpHeight(
  ...args: Parameters<SpatialUISystem['calculateJumpHeight']>
): ReturnType<SpatialUISystem['calculateJumpHeight']> {
  return getActiveSpatialUISystem().calculateJumpHeight(...args);
}
export function calculateLandingImpact(
  ...args: Parameters<SpatialUISystem['calculateLandingImpact']>
): ReturnType<SpatialUISystem['calculateLandingImpact']> {
  return getActiveSpatialUISystem().calculateLandingImpact(...args);
}
export function calculateGroundReactionForce(
  ...args: Parameters<SpatialUISystem['calculateGroundReactionForce']>
): ReturnType<SpatialUISystem['calculateGroundReactionForce']> {
  return getActiveSpatialUISystem().calculateGroundReactionForce(...args);
}
export function calculateGaitCycle(
  ...args: Parameters<SpatialUISystem['calculateGaitCycle']>
): ReturnType<SpatialUISystem['calculateGaitCycle']> {
  return getActiveSpatialUISystem().calculateGaitCycle(...args);
}
export function calculateGaitPhase(
  ...args: Parameters<SpatialUISystem['calculateGaitPhase']>
): ReturnType<SpatialUISystem['calculateGaitPhase']> {
  return getActiveSpatialUISystem().calculateGaitPhase(...args);
}
export function calculateStepFrequency(
  ...args: Parameters<SpatialUISystem['calculateStepFrequency']>
): ReturnType<SpatialUISystem['calculateStepFrequency']> {
  return getActiveSpatialUISystem().calculateStepFrequency(...args);
}
export function calculateWalkingSpeed(
  ...args: Parameters<SpatialUISystem['calculateWalkingSpeed']>
): ReturnType<SpatialUISystem['calculateWalkingSpeed']> {
  return getActiveSpatialUISystem().calculateWalkingSpeed(...args);
}
export function calculateRunningSpeed(
  ...args: Parameters<SpatialUISystem['calculateRunningSpeed']>
): ReturnType<SpatialUISystem['calculateRunningSpeed']> {
  return getActiveSpatialUISystem().calculateRunningSpeed(...args);
}
export function calculateStrideWidth(
  ...args: Parameters<SpatialUISystem['calculateStrideWidth']>
): ReturnType<SpatialUISystem['calculateStrideWidth']> {
  return getActiveSpatialUISystem().calculateStrideWidth(...args);
}
export function calculateStrideSymmetry(
  ...args: Parameters<SpatialUISystem['calculateStrideSymmetry']>
): ReturnType<SpatialUISystem['calculateStrideSymmetry']> {
  return getActiveSpatialUISystem().calculateStrideSymmetry(...args);
}
export function calculateFootPlacement(
  ...args: Parameters<SpatialUISystem['calculateFootPlacement']>
): ReturnType<SpatialUISystem['calculateFootPlacement']> {
  return getActiveSpatialUISystem().calculateFootPlacement(...args);
}
export function calculateFootPlacementError(
  ...args: Parameters<SpatialUISystem['calculateFootPlacementError']>
): ReturnType<SpatialUISystem['calculateFootPlacementError']> {
  return getActiveSpatialUISystem().calculateFootPlacementError(...args);
}
export function calculateGroundPenetration(
  ...args: Parameters<SpatialUISystem['calculateGroundPenetration']>
): ReturnType<SpatialUISystem['calculateGroundPenetration']> {
  return getActiveSpatialUISystem().calculateGroundPenetration(...args);
}
export function calculateGroundAlignment(
  ...args: Parameters<SpatialUISystem['calculateGroundAlignment']>
): ReturnType<SpatialUISystem['calculateGroundAlignment']> {
  return getActiveSpatialUISystem().calculateGroundAlignment(...args);
}
export function calculateLegSupportPhase(
  ...args: Parameters<SpatialUISystem['calculateLegSupportPhase']>
): ReturnType<SpatialUISystem['calculateLegSupportPhase']> {
  return getActiveSpatialUISystem().calculateLegSupportPhase(...args);
}
export function calculateSwingPhase(
  ...args: Parameters<SpatialUISystem['calculateSwingPhase']>
): ReturnType<SpatialUISystem['calculateSwingPhase']> {
  return getActiveSpatialUISystem().calculateSwingPhase(...args);
}
export function calculateLocomotionDirection(
  ...args: Parameters<SpatialUISystem['calculateLocomotionDirection']>
): ReturnType<SpatialUISystem['calculateLocomotionDirection']> {
  return getActiveSpatialUISystem().calculateLocomotionDirection(...args);
}
export function getBonePosition(
  ...args: Parameters<SpatialUISystem['getBonePosition']>
): ReturnType<SpatialUISystem['getBonePosition']> {
  return getActiveSpatialUISystem().getBonePosition(...args);
}
export function getBoneStartPosition(
  ...args: Parameters<SpatialUISystem['getBoneStartPosition']>
): ReturnType<SpatialUISystem['getBoneStartPosition']> {
  return getActiveSpatialUISystem().getBoneStartPosition(...args);
}
export function getBoneEndPosition(
  ...args: Parameters<SpatialUISystem['getBoneEndPosition']>
): ReturnType<SpatialUISystem['getBoneEndPosition']> {
  return getActiveSpatialUISystem().getBoneEndPosition(...args);
}
export function getBoneCenter(
  ...args: Parameters<SpatialUISystem['getBoneCenter']>
): ReturnType<SpatialUISystem['getBoneCenter']> {
  return getActiveSpatialUISystem().getBoneCenter(...args);
}
export function getBoneDirection(
  ...args: Parameters<SpatialUISystem['getBoneDirection']>
): ReturnType<SpatialUISystem['getBoneDirection']> {
  return getActiveSpatialUISystem().getBoneDirection(...args);
}
export function getBoneOrientation(
  ...args: Parameters<SpatialUISystem['getBoneOrientation']>
): ReturnType<SpatialUISystem['getBoneOrientation']> {
  return getActiveSpatialUISystem().getBoneOrientation(...args);
}
export function getBoneLength(
  ...args: Parameters<SpatialUISystem['getBoneLength']>
): ReturnType<SpatialUISystem['getBoneLength']> {
  return getActiveSpatialUISystem().getBoneLength(...args);
}
export function getBoneScale(
  ...args: Parameters<SpatialUISystem['getBoneScale']>
): ReturnType<SpatialUISystem['getBoneScale']> {
  return getActiveSpatialUISystem().getBoneScale(...args);
}
export function getBoneParent(
  ...args: Parameters<SpatialUISystem['getBoneParent']>
): ReturnType<SpatialUISystem['getBoneParent']> {
  return getActiveSpatialUISystem().getBoneParent(...args);
}
export function getBoneChildren(
  ...args: Parameters<SpatialUISystem['getBoneChildren']>
): ReturnType<SpatialUISystem['getBoneChildren']> {
  return getActiveSpatialUISystem().getBoneChildren(...args);
}
export function calculateBoneDistance(
  ...args: Parameters<SpatialUISystem['calculateBoneDistance']>
): ReturnType<SpatialUISystem['calculateBoneDistance']> {
  return getActiveSpatialUISystem().calculateBoneDistance(...args);
}
export function calculateBoneAngle(
  ...args: Parameters<SpatialUISystem['calculateBoneAngle']>
): ReturnType<SpatialUISystem['calculateBoneAngle']> {
  return getActiveSpatialUISystem().calculateBoneAngle(...args);
}
export function calculateBoneAlignment(
  ...args: Parameters<SpatialUISystem['calculateBoneAlignment']>
): ReturnType<SpatialUISystem['calculateBoneAlignment']> {
  return getActiveSpatialUISystem().calculateBoneAlignment(...args);
}
export function calculateBoneChainLength(
  ...args: Parameters<SpatialUISystem['calculateBoneChainLength']>
): ReturnType<SpatialUISystem['calculateBoneChainLength']> {
  return getActiveSpatialUISystem().calculateBoneChainLength(...args);
}
export function calculateBoneHierarchyDepth(
  ...args: Parameters<SpatialUISystem['calculateBoneHierarchyDepth']>
): ReturnType<SpatialUISystem['calculateBoneHierarchyDepth']> {
  return getActiveSpatialUISystem().calculateBoneHierarchyDepth(...args);
}
export function calculateBoneWorldTransform(
  ...args: Parameters<SpatialUISystem['calculateBoneWorldTransform']>
): ReturnType<SpatialUISystem['calculateBoneWorldTransform']> {
  return getActiveSpatialUISystem().calculateBoneWorldTransform(...args);
}
export function calculateBoneLocalTransform(
  ...args: Parameters<SpatialUISystem['calculateBoneLocalTransform']>
): ReturnType<SpatialUISystem['calculateBoneLocalTransform']> {
  return getActiveSpatialUISystem().calculateBoneLocalTransform(...args);
}
export function calculateBoneInverseTransform(
  ...args: Parameters<SpatialUISystem['calculateBoneInverseTransform']>
): ReturnType<SpatialUISystem['calculateBoneInverseTransform']> {
  return getActiveSpatialUISystem().calculateBoneInverseTransform(...args);
}
export function calculateBoneBindPose(
  ...args: Parameters<SpatialUISystem['calculateBoneBindPose']>
): ReturnType<SpatialUISystem['calculateBoneBindPose']> {
  return getActiveSpatialUISystem().calculateBoneBindPose(...args);
}
export function calculateBonePoseDelta(
  ...args: Parameters<SpatialUISystem['calculateBonePoseDelta']>
): ReturnType<SpatialUISystem['calculateBonePoseDelta']> {
  return getActiveSpatialUISystem().calculateBonePoseDelta(...args);
}
export function calculateBoneVelocity(
  ...args: Parameters<SpatialUISystem['calculateBoneVelocity']>
): ReturnType<SpatialUISystem['calculateBoneVelocity']> {
  return getActiveSpatialUISystem().calculateBoneVelocity(...args);
}
export function calculateBoneAcceleration(
  ...args: Parameters<SpatialUISystem['calculateBoneAcceleration']>
): ReturnType<SpatialUISystem['calculateBoneAcceleration']> {
  return getActiveSpatialUISystem().calculateBoneAcceleration(...args);
}
export function calculateBoneAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateBoneAngularVelocity']>
): ReturnType<SpatialUISystem['calculateBoneAngularVelocity']> {
  return getActiveSpatialUISystem().calculateBoneAngularVelocity(...args);
}
export function calculateBoneAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateBoneAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateBoneAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateBoneAngularAcceleration(...args);
}
export function calculateBoneBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateBoneBoundingBox']>
): ReturnType<SpatialUISystem['calculateBoneBoundingBox']> {
  return getActiveSpatialUISystem().calculateBoneBoundingBox(...args);
}
export function calculateBoneBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateBoneBoundingSphere']>
): ReturnType<SpatialUISystem['calculateBoneBoundingSphere']> {
  return getActiveSpatialUISystem().calculateBoneBoundingSphere(...args);
}
export function calculateBoneCapsule(
  ...args: Parameters<SpatialUISystem['calculateBoneCapsule']>
): ReturnType<SpatialUISystem['calculateBoneCapsule']> {
  return getActiveSpatialUISystem().calculateBoneCapsule(...args);
}
export function calculateBoneCollision(
  ...args: Parameters<SpatialUISystem['calculateBoneCollision']>
): ReturnType<SpatialUISystem['calculateBoneCollision']> {
  return getActiveSpatialUISystem().calculateBoneCollision(...args);
}
export function calculateBoneIntersection(
  ...args: Parameters<SpatialUISystem['calculateBoneIntersection']>
): ReturnType<SpatialUISystem['calculateBoneIntersection']> {
  return getActiveSpatialUISystem().calculateBoneIntersection(...args);
}
export function calculateBoneClosestPoint(
  ...args: Parameters<SpatialUISystem['calculateBoneClosestPoint']>
): ReturnType<SpatialUISystem['calculateBoneClosestPoint']> {
  return getActiveSpatialUISystem().calculateBoneClosestPoint(...args);
}
export function getJointPosition(
  ...args: Parameters<SpatialUISystem['getJointPosition']>
): ReturnType<SpatialUISystem['getJointPosition']> {
  return getActiveSpatialUISystem().getJointPosition(...args);
}
export function getJointCenter(
  ...args: Parameters<SpatialUISystem['getJointCenter']>
): ReturnType<SpatialUISystem['getJointCenter']> {
  return getActiveSpatialUISystem().getJointCenter(...args);
}
export function getJointAxis(
  ...args: Parameters<SpatialUISystem['getJointAxis']>
): ReturnType<SpatialUISystem['getJointAxis']> {
  return getActiveSpatialUISystem().getJointAxis(...args);
}
export function getJointNormal(
  ...args: Parameters<SpatialUISystem['getJointNormal']>
): ReturnType<SpatialUISystem['getJointNormal']> {
  return getActiveSpatialUISystem().getJointNormal(...args);
}
export function getJointParentBone(
  ...args: Parameters<SpatialUISystem['getJointParentBone']>
): ReturnType<SpatialUISystem['getJointParentBone']> {
  return getActiveSpatialUISystem().getJointParentBone(...args);
}
export function getJointChildBone(
  ...args: Parameters<SpatialUISystem['getJointChildBone']>
): ReturnType<SpatialUISystem['getJointChildBone']> {
  return getActiveSpatialUISystem().getJointChildBone(...args);
}
export function calculateJointAngle(
  ...args: Parameters<SpatialUISystem['calculateJointAngle']>
): ReturnType<SpatialUISystem['calculateJointAngle']> {
  return getActiveSpatialUISystem().calculateJointAngle(...args);
}
export function calculateJointLimit(
  ...args: Parameters<SpatialUISystem['calculateJointLimit']>
): ReturnType<SpatialUISystem['calculateJointLimit']> {
  return getActiveSpatialUISystem().calculateJointLimit(...args);
}
export function calculateJointConstraint(
  ...args: Parameters<SpatialUISystem['calculateJointConstraint']>
): ReturnType<SpatialUISystem['calculateJointConstraint']> {
  return getActiveSpatialUISystem().calculateJointConstraint(...args);
}
export function calculateJointVelocity(
  ...args: Parameters<SpatialUISystem['calculateJointVelocity']>
): ReturnType<SpatialUISystem['calculateJointVelocity']> {
  return getActiveSpatialUISystem().calculateJointVelocity(...args);
}
export function calculateJointAcceleration(
  ...args: Parameters<SpatialUISystem['calculateJointAcceleration']>
): ReturnType<SpatialUISystem['calculateJointAcceleration']> {
  return getActiveSpatialUISystem().calculateJointAcceleration(...args);
}
export function calculateJointTorque(
  ...args: Parameters<SpatialUISystem['calculateJointTorque']>
): ReturnType<SpatialUISystem['calculateJointTorque']> {
  return getActiveSpatialUISystem().calculateJointTorque(...args);
}
export function calculateJointForce(
  ...args: Parameters<SpatialUISystem['calculateJointForce']>
): ReturnType<SpatialUISystem['calculateJointForce']> {
  return getActiveSpatialUISystem().calculateJointForce(...args);
}
export function calculateJointStiffness(
  ...args: Parameters<SpatialUISystem['calculateJointStiffness']>
): ReturnType<SpatialUISystem['calculateJointStiffness']> {
  return getActiveSpatialUISystem().calculateJointStiffness(...args);
}
export function calculateJointDamping(
  ...args: Parameters<SpatialUISystem['calculateJointDamping']>
): ReturnType<SpatialUISystem['calculateJointDamping']> {
  return getActiveSpatialUISystem().calculateJointDamping(...args);
}
export function calculateJointFriction(
  ...args: Parameters<SpatialUISystem['calculateJointFriction']>
): ReturnType<SpatialUISystem['calculateJointFriction']> {
  return getActiveSpatialUISystem().calculateJointFriction(...args);
}
export function calculateJointCollision(
  ...args: Parameters<SpatialUISystem['calculateJointCollision']>
): ReturnType<SpatialUISystem['calculateJointCollision']> {
  return getActiveSpatialUISystem().calculateJointCollision(...args);
}
export function calculateJointChain(
  ...args: Parameters<SpatialUISystem['calculateJointChain']>
): ReturnType<SpatialUISystem['calculateJointChain']> {
  return getActiveSpatialUISystem().calculateJointChain(...args);
}
export function calculateJointPoseError(
  ...args: Parameters<SpatialUISystem['calculateJointPoseError']>
): ReturnType<SpatialUISystem['calculateJointPoseError']> {
  return getActiveSpatialUISystem().calculateJointPoseError(...args);
}
export function calculateJointInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateJointInverseKinematics']>
): ReturnType<SpatialUISystem['calculateJointInverseKinematics']> {
  return getActiveSpatialUISystem().calculateJointInverseKinematics(...args);
}
export function calculateForwardKinematics(
  ...args: Parameters<SpatialUISystem['calculateForwardKinematics']>
): ReturnType<SpatialUISystem['calculateForwardKinematics']> {
  return getActiveSpatialUISystem().calculateForwardKinematics(...args);
}
export function calculateInverseKinematics(
  ...args: Parameters<SpatialUISystem['calculateInverseKinematics']>
): ReturnType<SpatialUISystem['calculateInverseKinematics']> {
  return getActiveSpatialUISystem().calculateInverseKinematics(...args);
}
export function solveTwoBoneIK(
  ...args: Parameters<SpatialUISystem['solveTwoBoneIK']>
): ReturnType<SpatialUISystem['solveTwoBoneIK']> {
  return getActiveSpatialUISystem().solveTwoBoneIK(...args);
}
export function solveThreeBoneIK(
  ...args: Parameters<SpatialUISystem['solveThreeBoneIK']>
): ReturnType<SpatialUISystem['solveThreeBoneIK']> {
  return getActiveSpatialUISystem().solveThreeBoneIK(...args);
}
export function solveFullBodyIK(
  ...args: Parameters<SpatialUISystem['solveFullBodyIK']>
): ReturnType<SpatialUISystem['solveFullBodyIK']> {
  return getActiveSpatialUISystem().solveFullBodyIK(...args);
}
export function calculateIKTargetError(
  ...args: Parameters<SpatialUISystem['calculateIKTargetError']>
): ReturnType<SpatialUISystem['calculateIKTargetError']> {
  return getActiveSpatialUISystem().calculateIKTargetError(...args);
}
export function calculateIKJointWeights(
  ...args: Parameters<SpatialUISystem['calculateIKJointWeights']>
): ReturnType<SpatialUISystem['calculateIKJointWeights']> {
  return getActiveSpatialUISystem().calculateIKJointWeights(...args);
}
export function calculateIKReachability(
  ...args: Parameters<SpatialUISystem['calculateIKReachability']>
): ReturnType<SpatialUISystem['calculateIKReachability']> {
  return getActiveSpatialUISystem().calculateIKReachability(...args);
}
export function calculateIKPoleVector(
  ...args: Parameters<SpatialUISystem['calculateIKPoleVector']>
): ReturnType<SpatialUISystem['calculateIKPoleVector']> {
  return getActiveSpatialUISystem().calculateIKPoleVector(...args);
}
export function calculateIKChainStretch(
  ...args: Parameters<SpatialUISystem['calculateIKChainStretch']>
): ReturnType<SpatialUISystem['calculateIKChainStretch']> {
  return getActiveSpatialUISystem().calculateIKChainStretch(...args);
}
export function calculateSkeletonRootPosition(
  ...args: Parameters<SpatialUISystem['calculateSkeletonRootPosition']>
): ReturnType<SpatialUISystem['calculateSkeletonRootPosition']> {
  return getActiveSpatialUISystem().calculateSkeletonRootPosition(...args);
}
export function calculateSkeletonOrientation(
  ...args: Parameters<SpatialUISystem['calculateSkeletonOrientation']>
): ReturnType<SpatialUISystem['calculateSkeletonOrientation']> {
  return getActiveSpatialUISystem().calculateSkeletonOrientation(...args);
}
export function calculateSkeletonBounds(
  ...args: Parameters<SpatialUISystem['calculateSkeletonBounds']>
): ReturnType<SpatialUISystem['calculateSkeletonBounds']> {
  return getActiveSpatialUISystem().calculateSkeletonBounds(...args);
}
export function calculateSkeletonCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateSkeletonCenterOfMass']>
): ReturnType<SpatialUISystem['calculateSkeletonCenterOfMass']> {
  return getActiveSpatialUISystem().calculateSkeletonCenterOfMass(...args);
}
export function calculateSkeletonPose(
  ...args: Parameters<SpatialUISystem['calculateSkeletonPose']>
): ReturnType<SpatialUISystem['calculateSkeletonPose']> {
  return getActiveSpatialUISystem().calculateSkeletonPose(...args);
}
export function calculateSkeletonPoseDifference(
  ...args: Parameters<SpatialUISystem['calculateSkeletonPoseDifference']>
): ReturnType<SpatialUISystem['calculateSkeletonPoseDifference']> {
  return getActiveSpatialUISystem().calculateSkeletonPoseDifference(...args);
}
export function calculateSkeletonPoseSimilarity(
  ...args: Parameters<SpatialUISystem['calculateSkeletonPoseSimilarity']>
): ReturnType<SpatialUISystem['calculateSkeletonPoseSimilarity']> {
  return getActiveSpatialUISystem().calculateSkeletonPoseSimilarity(...args);
}
export function calculateSkeletonRetargeting(
  ...args: Parameters<SpatialUISystem['calculateSkeletonRetargeting']>
): ReturnType<SpatialUISystem['calculateSkeletonRetargeting']> {
  return getActiveSpatialUISystem().calculateSkeletonRetargeting(...args);
}
export function calculateBoneRetargeting(
  ...args: Parameters<SpatialUISystem['calculateBoneRetargeting']>
): ReturnType<SpatialUISystem['calculateBoneRetargeting']> {
  return getActiveSpatialUISystem().calculateBoneRetargeting(...args);
}
export function calculateAnimationBlendWeight(
  ...args: Parameters<SpatialUISystem['calculateAnimationBlendWeight']>
): ReturnType<SpatialUISystem['calculateAnimationBlendWeight']> {
  return getActiveSpatialUISystem().calculateAnimationBlendWeight(...args);
}
export function calculateAnimationBlendFactor(
  ...args: Parameters<SpatialUISystem['calculateAnimationBlendFactor']>
): ReturnType<SpatialUISystem['calculateAnimationBlendFactor']> {
  return getActiveSpatialUISystem().calculateAnimationBlendFactor(...args);
}
export function calculateAnimationTime(
  ...args: Parameters<SpatialUISystem['calculateAnimationTime']>
): ReturnType<SpatialUISystem['calculateAnimationTime']> {
  return getActiveSpatialUISystem().calculateAnimationTime(...args);
}
export function calculateAnimationPhase(
  ...args: Parameters<SpatialUISystem['calculateAnimationPhase']>
): ReturnType<SpatialUISystem['calculateAnimationPhase']> {
  return getActiveSpatialUISystem().calculateAnimationPhase(...args);
}
export function calculateAnimationPlaybackSpeed(
  ...args: Parameters<SpatialUISystem['calculateAnimationPlaybackSpeed']>
): ReturnType<SpatialUISystem['calculateAnimationPlaybackSpeed']> {
  return getActiveSpatialUISystem().calculateAnimationPlaybackSpeed(...args);
}
export function calculateAnimationRootMotion(
  ...args: Parameters<SpatialUISystem['calculateAnimationRootMotion']>
): ReturnType<SpatialUISystem['calculateAnimationRootMotion']> {
  return getActiveSpatialUISystem().calculateAnimationRootMotion(...args);
}
export function calculateAnimationRootVelocity(
  ...args: Parameters<SpatialUISystem['calculateAnimationRootVelocity']>
): ReturnType<SpatialUISystem['calculateAnimationRootVelocity']> {
  return getActiveSpatialUISystem().calculateAnimationRootVelocity(...args);
}
export function calculateAnimationRootAcceleration(
  ...args: Parameters<SpatialUISystem['calculateAnimationRootAcceleration']>
): ReturnType<SpatialUISystem['calculateAnimationRootAcceleration']> {
  return getActiveSpatialUISystem().calculateAnimationRootAcceleration(...args);
}
export function calculateAnimationPoseAtTime(
  ...args: Parameters<SpatialUISystem['calculateAnimationPoseAtTime']>
): ReturnType<SpatialUISystem['calculateAnimationPoseAtTime']> {
  return getActiveSpatialUISystem().calculateAnimationPoseAtTime(...args);
}
export function calculateAnimationInterpolation(
  ...args: Parameters<SpatialUISystem['calculateAnimationInterpolation']>
): ReturnType<SpatialUISystem['calculateAnimationInterpolation']> {
  return getActiveSpatialUISystem().calculateAnimationInterpolation(...args);
}
export function calculateAnimationCurveValue(
  ...args: Parameters<SpatialUISystem['calculateAnimationCurveValue']>
): ReturnType<SpatialUISystem['calculateAnimationCurveValue']> {
  return getActiveSpatialUISystem().calculateAnimationCurveValue(...args);
}
export function calculateAnimationCurveDerivative(
  ...args: Parameters<SpatialUISystem['calculateAnimationCurveDerivative']>
): ReturnType<SpatialUISystem['calculateAnimationCurveDerivative']> {
  return getActiveSpatialUISystem().calculateAnimationCurveDerivative(...args);
}
export function calculateAnimationCurveIntegral(
  ...args: Parameters<SpatialUISystem['calculateAnimationCurveIntegral']>
): ReturnType<SpatialUISystem['calculateAnimationCurveIntegral']> {
  return getActiveSpatialUISystem().calculateAnimationCurveIntegral(...args);
}
export function calculateAnimationVelocity(
  ...args: Parameters<SpatialUISystem['calculateAnimationVelocity']>
): ReturnType<SpatialUISystem['calculateAnimationVelocity']> {
  return getActiveSpatialUISystem().calculateAnimationVelocity(...args);
}
export function calculateAnimationAcceleration(
  ...args: Parameters<SpatialUISystem['calculateAnimationAcceleration']>
): ReturnType<SpatialUISystem['calculateAnimationAcceleration']> {
  return getActiveSpatialUISystem().calculateAnimationAcceleration(...args);
}
export function calculatePoseTransition(
  ...args: Parameters<SpatialUISystem['calculatePoseTransition']>
): ReturnType<SpatialUISystem['calculatePoseTransition']> {
  return getActiveSpatialUISystem().calculatePoseTransition(...args);
}
export function calculatePoseTransitionDuration(
  ...args: Parameters<SpatialUISystem['calculatePoseTransitionDuration']>
): ReturnType<SpatialUISystem['calculatePoseTransitionDuration']> {
  return getActiveSpatialUISystem().calculatePoseTransitionDuration(...args);
}
export function calculatePoseBlend(
  ...args: Parameters<SpatialUISystem['calculatePoseBlend']>
): ReturnType<SpatialUISystem['calculatePoseBlend']> {
  return getActiveSpatialUISystem().calculatePoseBlend(...args);
}
export function calculatePoseStability(
  ...args: Parameters<SpatialUISystem['calculatePoseStability']>
): ReturnType<SpatialUISystem['calculatePoseStability']> {
  return getActiveSpatialUISystem().calculatePoseStability(...args);
}
export function calculatePoseReachability(
  ...args: Parameters<SpatialUISystem['calculatePoseReachability']>
): ReturnType<SpatialUISystem['calculatePoseReachability']> {
  return getActiveSpatialUISystem().calculatePoseReachability(...args);
}
export function calculatePoseConstraintError(
  ...args: Parameters<SpatialUISystem['calculatePoseConstraintError']>
): ReturnType<SpatialUISystem['calculatePoseConstraintError']> {
  return getActiveSpatialUISystem().calculatePoseConstraintError(...args);
}
export function calculateFootLockPosition(
  ...args: Parameters<SpatialUISystem['calculateFootLockPosition']>
): ReturnType<SpatialUISystem['calculateFootLockPosition']> {
  return getActiveSpatialUISystem().calculateFootLockPosition(...args);
}
export function calculateFootLockWeight(
  ...args: Parameters<SpatialUISystem['calculateFootLockWeight']>
): ReturnType<SpatialUISystem['calculateFootLockWeight']> {
  return getActiveSpatialUISystem().calculateFootLockWeight(...args);
}
export function calculateHandIKTarget(
  ...args: Parameters<SpatialUISystem['calculateHandIKTarget']>
): ReturnType<SpatialUISystem['calculateHandIKTarget']> {
  return getActiveSpatialUISystem().calculateHandIKTarget(...args);
}
export function calculateLookAtTarget(
  ...args: Parameters<SpatialUISystem['calculateLookAtTarget']>
): ReturnType<SpatialUISystem['calculateLookAtTarget']> {
  return getActiveSpatialUISystem().calculateLookAtTarget(...args);
}
export function calculateHeadLookAt(
  ...args: Parameters<SpatialUISystem['calculateHeadLookAt']>
): ReturnType<SpatialUISystem['calculateHeadLookAt']> {
  return getActiveSpatialUISystem().calculateHeadLookAt(...args);
}
export function calculateEyeLookAt(
  ...args: Parameters<SpatialUISystem['calculateEyeLookAt']>
): ReturnType<SpatialUISystem['calculateEyeLookAt']> {
  return getActiveSpatialUISystem().calculateEyeLookAt(...args);
}
export function calculateAimOffset(
  ...args: Parameters<SpatialUISystem['calculateAimOffset']>
): ReturnType<SpatialUISystem['calculateAimOffset']> {
  return getActiveSpatialUISystem().calculateAimOffset(...args);
}
export function calculateAimPose(
  ...args: Parameters<SpatialUISystem['calculateAimPose']>
): ReturnType<SpatialUISystem['calculateAimPose']> {
  return getActiveSpatialUISystem().calculateAimPose(...args);
}
export function calculateReachPose(
  ...args: Parameters<SpatialUISystem['calculateReachPose']>
): ReturnType<SpatialUISystem['calculateReachPose']> {
  return getActiveSpatialUISystem().calculateReachPose(...args);
}
export function calculateCharacterPoseError(
  ...args: Parameters<SpatialUISystem['calculateCharacterPoseError']>
): ReturnType<SpatialUISystem['calculateCharacterPoseError']> {
  return getActiveSpatialUISystem().calculateCharacterPoseError(...args);
}
export function getCharacterPosition(
  ...args: Parameters<SpatialUISystem['getCharacterPosition']>
): ReturnType<SpatialUISystem['getCharacterPosition']> {
  return getActiveSpatialUISystem().getCharacterPosition(...args);
}
export function getCharacterRotation(
  ...args: Parameters<SpatialUISystem['getCharacterRotation']>
): ReturnType<SpatialUISystem['getCharacterRotation']> {
  return getActiveSpatialUISystem().getCharacterRotation(...args);
}
export function getCharacterScale(
  ...args: Parameters<SpatialUISystem['getCharacterScale']>
): ReturnType<SpatialUISystem['getCharacterScale']> {
  return getActiveSpatialUISystem().getCharacterScale(...args);
}
export function getCharacterVelocity(
  ...args: Parameters<SpatialUISystem['getCharacterVelocity']>
): ReturnType<SpatialUISystem['getCharacterVelocity']> {
  return getActiveSpatialUISystem().getCharacterVelocity(...args);
}
export function getCharacterAcceleration(
  ...args: Parameters<SpatialUISystem['getCharacterAcceleration']>
): ReturnType<SpatialUISystem['getCharacterAcceleration']> {
  return getActiveSpatialUISystem().getCharacterAcceleration(...args);
}
export function getCharacterForwardVector(
  ...args: Parameters<SpatialUISystem['getCharacterForwardVector']>
): ReturnType<SpatialUISystem['getCharacterForwardVector']> {
  return getActiveSpatialUISystem().getCharacterForwardVector(...args);
}
export function getCharacterRightVector(
  ...args: Parameters<SpatialUISystem['getCharacterRightVector']>
): ReturnType<SpatialUISystem['getCharacterRightVector']> {
  return getActiveSpatialUISystem().getCharacterRightVector(...args);
}
export function getCharacterUpVector(
  ...args: Parameters<SpatialUISystem['getCharacterUpVector']>
): ReturnType<SpatialUISystem['getCharacterUpVector']> {
  return getActiveSpatialUISystem().getCharacterUpVector(...args);
}
export function calculateCharacterHeight(
  ...args: Parameters<SpatialUISystem['calculateCharacterHeight']>
): ReturnType<SpatialUISystem['calculateCharacterHeight']> {
  return getActiveSpatialUISystem().calculateCharacterHeight(...args);
}
export function calculateCharacterWidth(
  ...args: Parameters<SpatialUISystem['calculateCharacterWidth']>
): ReturnType<SpatialUISystem['calculateCharacterWidth']> {
  return getActiveSpatialUISystem().calculateCharacterWidth(...args);
}
export function calculateCharacterDepth(
  ...args: Parameters<SpatialUISystem['calculateCharacterDepth']>
): ReturnType<SpatialUISystem['calculateCharacterDepth']> {
  return getActiveSpatialUISystem().calculateCharacterDepth(...args);
}
export function calculateCharacterRadius(
  ...args: Parameters<SpatialUISystem['calculateCharacterRadius']>
): ReturnType<SpatialUISystem['calculateCharacterRadius']> {
  return getActiveSpatialUISystem().calculateCharacterRadius(...args);
}
export function calculateCharacterBounds(
  ...args: Parameters<SpatialUISystem['calculateCharacterBounds']>
): ReturnType<SpatialUISystem['calculateCharacterBounds']> {
  return getActiveSpatialUISystem().calculateCharacterBounds(...args);
}
export function calculateCharacterBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateCharacterBoundingBox']>
): ReturnType<SpatialUISystem['calculateCharacterBoundingBox']> {
  return getActiveSpatialUISystem().calculateCharacterBoundingBox(...args);
}
export function calculateCharacterBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateCharacterBoundingSphere']>
): ReturnType<SpatialUISystem['calculateCharacterBoundingSphere']> {
  return getActiveSpatialUISystem().calculateCharacterBoundingSphere(...args);
}
export function calculateCharacterBoundingCapsule(
  ...args: Parameters<SpatialUISystem['calculateCharacterBoundingCapsule']>
): ReturnType<SpatialUISystem['calculateCharacterBoundingCapsule']> {
  return getActiveSpatialUISystem().calculateCharacterBoundingCapsule(...args);
}
export function calculateCharacterCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateCharacterCenterOfMass']>
): ReturnType<SpatialUISystem['calculateCharacterCenterOfMass']> {
  return getActiveSpatialUISystem().calculateCharacterCenterOfMass(...args);
}
export function calculateCharacterGroundDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterGroundDistance']>
): ReturnType<SpatialUISystem['calculateCharacterGroundDistance']> {
  return getActiveSpatialUISystem().calculateCharacterGroundDistance(...args);
}
export function calculateCharacterGroundContact(
  ...args: Parameters<SpatialUISystem['calculateCharacterGroundContact']>
): ReturnType<SpatialUISystem['calculateCharacterGroundContact']> {
  return getActiveSpatialUISystem().calculateCharacterGroundContact(...args);
}
export function calculateCharacterGroundNormal(
  ...args: Parameters<SpatialUISystem['calculateCharacterGroundNormal']>
): ReturnType<SpatialUISystem['calculateCharacterGroundNormal']> {
  return getActiveSpatialUISystem().calculateCharacterGroundNormal(...args);
}
export function calculateCharacterSlopeAngle(
  ...args: Parameters<SpatialUISystem['calculateCharacterSlopeAngle']>
): ReturnType<SpatialUISystem['calculateCharacterSlopeAngle']> {
  return getActiveSpatialUISystem().calculateCharacterSlopeAngle(...args);
}
export function calculateCharacterMovementDirection(
  ...args: Parameters<SpatialUISystem['calculateCharacterMovementDirection']>
): ReturnType<SpatialUISystem['calculateCharacterMovementDirection']> {
  return getActiveSpatialUISystem().calculateCharacterMovementDirection(...args);
}
export function calculateCharacterMovementSpeed(
  ...args: Parameters<SpatialUISystem['calculateCharacterMovementSpeed']>
): ReturnType<SpatialUISystem['calculateCharacterMovementSpeed']> {
  return getActiveSpatialUISystem().calculateCharacterMovementSpeed(...args);
}
export function calculateCharacterMovementDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterMovementDistance']>
): ReturnType<SpatialUISystem['calculateCharacterMovementDistance']> {
  return getActiveSpatialUISystem().calculateCharacterMovementDistance(...args);
}
export function calculateCharacterTurningRate(
  ...args: Parameters<SpatialUISystem['calculateCharacterTurningRate']>
): ReturnType<SpatialUISystem['calculateCharacterTurningRate']> {
  return getActiveSpatialUISystem().calculateCharacterTurningRate(...args);
}
export function calculateCharacterTurningAngle(
  ...args: Parameters<SpatialUISystem['calculateCharacterTurningAngle']>
): ReturnType<SpatialUISystem['calculateCharacterTurningAngle']> {
  return getActiveSpatialUISystem().calculateCharacterTurningAngle(...args);
}
export function calculateCharacterStoppingDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterStoppingDistance']>
): ReturnType<SpatialUISystem['calculateCharacterStoppingDistance']> {
  return getActiveSpatialUISystem().calculateCharacterStoppingDistance(...args);
}
export function calculateCharacterBrakingAcceleration(
  ...args: Parameters<SpatialUISystem['calculateCharacterBrakingAcceleration']>
): ReturnType<SpatialUISystem['calculateCharacterBrakingAcceleration']> {
  return getActiveSpatialUISystem().calculateCharacterBrakingAcceleration(...args);
}
export function calculateCharacterJumpVelocity(
  ...args: Parameters<SpatialUISystem['calculateCharacterJumpVelocity']>
): ReturnType<SpatialUISystem['calculateCharacterJumpVelocity']> {
  return getActiveSpatialUISystem().calculateCharacterJumpVelocity(...args);
}
export function calculateCharacterJumpHeight(
  ...args: Parameters<SpatialUISystem['calculateCharacterJumpHeight']>
): ReturnType<SpatialUISystem['calculateCharacterJumpHeight']> {
  return getActiveSpatialUISystem().calculateCharacterJumpHeight(...args);
}
export function calculateCharacterFallVelocity(
  ...args: Parameters<SpatialUISystem['calculateCharacterFallVelocity']>
): ReturnType<SpatialUISystem['calculateCharacterFallVelocity']> {
  return getActiveSpatialUISystem().calculateCharacterFallVelocity(...args);
}
export function calculateCharacterFallDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterFallDistance']>
): ReturnType<SpatialUISystem['calculateCharacterFallDistance']> {
  return getActiveSpatialUISystem().calculateCharacterFallDistance(...args);
}
export function calculateCharacterLandingPosition(
  ...args: Parameters<SpatialUISystem['calculateCharacterLandingPosition']>
): ReturnType<SpatialUISystem['calculateCharacterLandingPosition']> {
  return getActiveSpatialUISystem().calculateCharacterLandingPosition(...args);
}
export function calculateCharacterLandingVelocity(
  ...args: Parameters<SpatialUISystem['calculateCharacterLandingVelocity']>
): ReturnType<SpatialUISystem['calculateCharacterLandingVelocity']> {
  return getActiveSpatialUISystem().calculateCharacterLandingVelocity(...args);
}
export function calculateCharacterCollision(
  ...args: Parameters<SpatialUISystem['calculateCharacterCollision']>
): ReturnType<SpatialUISystem['calculateCharacterCollision']> {
  return getActiveSpatialUISystem().calculateCharacterCollision(...args);
}
export function calculateCharacterCollisionResponse(
  ...args: Parameters<SpatialUISystem['calculateCharacterCollisionResponse']>
): ReturnType<SpatialUISystem['calculateCharacterCollisionResponse']> {
  return getActiveSpatialUISystem().calculateCharacterCollisionResponse(...args);
}
export function calculateCharacterPenetrationDepth(
  ...args: Parameters<SpatialUISystem['calculateCharacterPenetrationDepth']>
): ReturnType<SpatialUISystem['calculateCharacterPenetrationDepth']> {
  return getActiveSpatialUISystem().calculateCharacterPenetrationDepth(...args);
}
export function calculateCharacterSeparationVector(
  ...args: Parameters<SpatialUISystem['calculateCharacterSeparationVector']>
): ReturnType<SpatialUISystem['calculateCharacterSeparationVector']> {
  return getActiveSpatialUISystem().calculateCharacterSeparationVector(...args);
}
export function calculateCharacterAvoidanceDirection(
  ...args: Parameters<SpatialUISystem['calculateCharacterAvoidanceDirection']>
): ReturnType<SpatialUISystem['calculateCharacterAvoidanceDirection']> {
  return getActiveSpatialUISystem().calculateCharacterAvoidanceDirection(...args);
}
export function calculateCharacterPathDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterPathDistance']>
): ReturnType<SpatialUISystem['calculateCharacterPathDistance']> {
  return getActiveSpatialUISystem().calculateCharacterPathDistance(...args);
}
export function calculateCharacterPathDeviation(
  ...args: Parameters<SpatialUISystem['calculateCharacterPathDeviation']>
): ReturnType<SpatialUISystem['calculateCharacterPathDeviation']> {
  return getActiveSpatialUISystem().calculateCharacterPathDeviation(...args);
}
export function calculateCharacterPathCurvature(
  ...args: Parameters<SpatialUISystem['calculateCharacterPathCurvature']>
): ReturnType<SpatialUISystem['calculateCharacterPathCurvature']> {
  return getActiveSpatialUISystem().calculateCharacterPathCurvature(...args);
}
export function calculateCharacterPathTangent(
  ...args: Parameters<SpatialUISystem['calculateCharacterPathTangent']>
): ReturnType<SpatialUISystem['calculateCharacterPathTangent']> {
  return getActiveSpatialUISystem().calculateCharacterPathTangent(...args);
}
export function calculateCharacterPathNormal(
  ...args: Parameters<SpatialUISystem['calculateCharacterPathNormal']>
): ReturnType<SpatialUISystem['calculateCharacterPathNormal']> {
  return getActiveSpatialUISystem().calculateCharacterPathNormal(...args);
}
export function calculateCharacterNavigationCost(
  ...args: Parameters<SpatialUISystem['calculateCharacterNavigationCost']>
): ReturnType<SpatialUISystem['calculateCharacterNavigationCost']> {
  return getActiveSpatialUISystem().calculateCharacterNavigationCost(...args);
}
export function calculateCharacterReachDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterReachDistance']>
): ReturnType<SpatialUISystem['calculateCharacterReachDistance']> {
  return getActiveSpatialUISystem().calculateCharacterReachDistance(...args);
}
export function calculateCharacterInteractionRange(
  ...args: Parameters<SpatialUISystem['calculateCharacterInteractionRange']>
): ReturnType<SpatialUISystem['calculateCharacterInteractionRange']> {
  return getActiveSpatialUISystem().calculateCharacterInteractionRange(...args);
}
export function calculateCharacterVisibilityRange(
  ...args: Parameters<SpatialUISystem['calculateCharacterVisibilityRange']>
): ReturnType<SpatialUISystem['calculateCharacterVisibilityRange']> {
  return getActiveSpatialUISystem().calculateCharacterVisibilityRange(...args);
}
export function calculateCharacterTargetDistance(
  ...args: Parameters<SpatialUISystem['calculateCharacterTargetDistance']>
): ReturnType<SpatialUISystem['calculateCharacterTargetDistance']> {
  return getActiveSpatialUISystem().calculateCharacterTargetDistance(...args);
}
export function calculateCharacterTargetAngle(
  ...args: Parameters<SpatialUISystem['calculateCharacterTargetAngle']>
): ReturnType<SpatialUISystem['calculateCharacterTargetAngle']> {
  return getActiveSpatialUISystem().calculateCharacterTargetAngle(...args);
}
export function calculateNPCPosition(
  ...args: Parameters<SpatialUISystem['calculateNPCPosition']>
): ReturnType<SpatialUISystem['calculateNPCPosition']> {
  return getActiveSpatialUISystem().calculateNPCPosition(...args);
}
export function calculateNPCVelocity(
  ...args: Parameters<SpatialUISystem['calculateNPCVelocity']>
): ReturnType<SpatialUISystem['calculateNPCVelocity']> {
  return getActiveSpatialUISystem().calculateNPCVelocity(...args);
}
export function calculateNPCAcceleration(
  ...args: Parameters<SpatialUISystem['calculateNPCAcceleration']>
): ReturnType<SpatialUISystem['calculateNPCAcceleration']> {
  return getActiveSpatialUISystem().calculateNPCAcceleration(...args);
}
export function calculateNPCFacingDirection(
  ...args: Parameters<SpatialUISystem['calculateNPCFacingDirection']>
): ReturnType<SpatialUISystem['calculateNPCFacingDirection']> {
  return getActiveSpatialUISystem().calculateNPCFacingDirection(...args);
}
export function calculateNPCOrientation(
  ...args: Parameters<SpatialUISystem['calculateNPCOrientation']>
): ReturnType<SpatialUISystem['calculateNPCOrientation']> {
  return getActiveSpatialUISystem().calculateNPCOrientation(...args);
}
export function calculateNPCDistanceToPlayer(
  ...args: Parameters<SpatialUISystem['calculateNPCDistanceToPlayer']>
): ReturnType<SpatialUISystem['calculateNPCDistanceToPlayer']> {
  return getActiveSpatialUISystem().calculateNPCDistanceToPlayer(...args);
}
export function calculateNPCDistanceToTarget(
  ...args: Parameters<SpatialUISystem['calculateNPCDistanceToTarget']>
): ReturnType<SpatialUISystem['calculateNPCDistanceToTarget']> {
  return getActiveSpatialUISystem().calculateNPCDistanceToTarget(...args);
}
export function calculateNPCDistanceToWaypoint(
  ...args: Parameters<SpatialUISystem['calculateNPCDistanceToWaypoint']>
): ReturnType<SpatialUISystem['calculateNPCDistanceToWaypoint']> {
  return getActiveSpatialUISystem().calculateNPCDistanceToWaypoint(...args);
}
export function calculateNPCNearestNeighbor(
  ...args: Parameters<SpatialUISystem['calculateNPCNearestNeighbor']>
): ReturnType<SpatialUISystem['calculateNPCNearestNeighbor']> {
  return getActiveSpatialUISystem().calculateNPCNearestNeighbor(...args);
}
export function calculateNPCGroupCenter(
  ...args: Parameters<SpatialUISystem['calculateNPCGroupCenter']>
): ReturnType<SpatialUISystem['calculateNPCGroupCenter']> {
  return getActiveSpatialUISystem().calculateNPCGroupCenter(...args);
}
export function calculateNPCGroupRadius(
  ...args: Parameters<SpatialUISystem['calculateNPCGroupRadius']>
): ReturnType<SpatialUISystem['calculateNPCGroupRadius']> {
  return getActiveSpatialUISystem().calculateNPCGroupRadius(...args);
}
export function calculateNPCFormationOffset(
  ...args: Parameters<SpatialUISystem['calculateNPCFormationOffset']>
): ReturnType<SpatialUISystem['calculateNPCFormationOffset']> {
  return getActiveSpatialUISystem().calculateNPCFormationOffset(...args);
}
export function calculateNPCFormationPosition(
  ...args: Parameters<SpatialUISystem['calculateNPCFormationPosition']>
): ReturnType<SpatialUISystem['calculateNPCFormationPosition']> {
  return getActiveSpatialUISystem().calculateNPCFormationPosition(...args);
}
export function calculateNPCFormationDirection(
  ...args: Parameters<SpatialUISystem['calculateNPCFormationDirection']>
): ReturnType<SpatialUISystem['calculateNPCFormationDirection']> {
  return getActiveSpatialUISystem().calculateNPCFormationDirection(...args);
}
export function calculateNPCFormationSpacing(
  ...args: Parameters<SpatialUISystem['calculateNPCFormationSpacing']>
): ReturnType<SpatialUISystem['calculateNPCFormationSpacing']> {
  return getActiveSpatialUISystem().calculateNPCFormationSpacing(...args);
}
export function calculateNPCSeparationForce(
  ...args: Parameters<SpatialUISystem['calculateNPCSeparationForce']>
): ReturnType<SpatialUISystem['calculateNPCSeparationForce']> {
  return getActiveSpatialUISystem().calculateNPCSeparationForce(...args);
}
export function calculateNPCAlignmentForce(
  ...args: Parameters<SpatialUISystem['calculateNPCAlignmentForce']>
): ReturnType<SpatialUISystem['calculateNPCAlignmentForce']> {
  return getActiveSpatialUISystem().calculateNPCAlignmentForce(...args);
}
export function calculateNPCCohesionForce(
  ...args: Parameters<SpatialUISystem['calculateNPCCohesionForce']>
): ReturnType<SpatialUISystem['calculateNPCCohesionForce']> {
  return getActiveSpatialUISystem().calculateNPCCohesionForce(...args);
}
export function calculateNPCSteeringForce(
  ...args: Parameters<SpatialUISystem['calculateNPCSteeringForce']>
): ReturnType<SpatialUISystem['calculateNPCSteeringForce']> {
  return getActiveSpatialUISystem().calculateNPCSteeringForce(...args);
}
export function calculateNPCAvoidanceForce(
  ...args: Parameters<SpatialUISystem['calculateNPCAvoidanceForce']>
): ReturnType<SpatialUISystem['calculateNPCAvoidanceForce']> {
  return getActiveSpatialUISystem().calculateNPCAvoidanceForce(...args);
}
export function calculateNPCObstacleDistance(
  ...args: Parameters<SpatialUISystem['calculateNPCObstacleDistance']>
): ReturnType<SpatialUISystem['calculateNPCObstacleDistance']> {
  return getActiveSpatialUISystem().calculateNPCObstacleDistance(...args);
}
export function calculateNPCObstacleNormal(
  ...args: Parameters<SpatialUISystem['calculateNPCObstacleNormal']>
): ReturnType<SpatialUISystem['calculateNPCObstacleNormal']> {
  return getActiveSpatialUISystem().calculateNPCObstacleNormal(...args);
}
export function calculateNPCPathfindingCost(
  ...args: Parameters<SpatialUISystem['calculateNPCPathfindingCost']>
): ReturnType<SpatialUISystem['calculateNPCPathfindingCost']> {
  return getActiveSpatialUISystem().calculateNPCPathfindingCost(...args);
}
export function calculateNPCPathLength(
  ...args: Parameters<SpatialUISystem['calculateNPCPathLength']>
): ReturnType<SpatialUISystem['calculateNPCPathLength']> {
  return getActiveSpatialUISystem().calculateNPCPathLength(...args);
}
export function calculateNPCPathSmoothing(
  ...args: Parameters<SpatialUISystem['calculateNPCPathSmoothing']>
): ReturnType<SpatialUISystem['calculateNPCPathSmoothing']> {
  return getActiveSpatialUISystem().calculateNPCPathSmoothing(...args);
}
export function calculateNPCWaypointIndex(
  ...args: Parameters<SpatialUISystem['calculateNPCWaypointIndex']>
): ReturnType<SpatialUISystem['calculateNPCWaypointIndex']> {
  return getActiveSpatialUISystem().calculateNPCWaypointIndex(...args);
}
export function calculateNPCWaypointDistance(
  ...args: Parameters<SpatialUISystem['calculateNPCWaypointDistance']>
): ReturnType<SpatialUISystem['calculateNPCWaypointDistance']> {
  return getActiveSpatialUISystem().calculateNPCWaypointDistance(...args);
}
export function calculateNPCWaypointArrival(
  ...args: Parameters<SpatialUISystem['calculateNPCWaypointArrival']>
): ReturnType<SpatialUISystem['calculateNPCWaypointArrival']> {
  return getActiveSpatialUISystem().calculateNPCWaypointArrival(...args);
}
export function calculateNPCPatrolRadius(
  ...args: Parameters<SpatialUISystem['calculateNPCPatrolRadius']>
): ReturnType<SpatialUISystem['calculateNPCPatrolRadius']> {
  return getActiveSpatialUISystem().calculateNPCPatrolRadius(...args);
}
export function calculateNPCPatrolPosition(
  ...args: Parameters<SpatialUISystem['calculateNPCPatrolPosition']>
): ReturnType<SpatialUISystem['calculateNPCPatrolPosition']> {
  return getActiveSpatialUISystem().calculateNPCPatrolPosition(...args);
}
export function calculateNPCDetectionRange(
  ...args: Parameters<SpatialUISystem['calculateNPCDetectionRange']>
): ReturnType<SpatialUISystem['calculateNPCDetectionRange']> {
  return getActiveSpatialUISystem().calculateNPCDetectionRange(...args);
}
export function calculateNPCFieldOfView(
  ...args: Parameters<SpatialUISystem['calculateNPCFieldOfView']>
): ReturnType<SpatialUISystem['calculateNPCFieldOfView']> {
  return getActiveSpatialUISystem().calculateNPCFieldOfView(...args);
}
export function calculateNPCLineOfSight(
  ...args: Parameters<SpatialUISystem['calculateNPCLineOfSight']>
): ReturnType<SpatialUISystem['calculateNPCLineOfSight']> {
  return getActiveSpatialUISystem().calculateNPCLineOfSight(...args);
}
export function calculateNPCVisibilityScore(
  ...args: Parameters<SpatialUISystem['calculateNPCVisibilityScore']>
): ReturnType<SpatialUISystem['calculateNPCVisibilityScore']> {
  return getActiveSpatialUISystem().calculateNPCVisibilityScore(...args);
}
export function calculateNPCThreatScore(
  ...args: Parameters<SpatialUISystem['calculateNPCThreatScore']>
): ReturnType<SpatialUISystem['calculateNPCThreatScore']> {
  return getActiveSpatialUISystem().calculateNPCThreatScore(...args);
}
export function calculateNPCInterestScore(
  ...args: Parameters<SpatialUISystem['calculateNPCInterestScore']>
): ReturnType<SpatialUISystem['calculateNPCInterestScore']> {
  return getActiveSpatialUISystem().calculateNPCInterestScore(...args);
}
export function calculateNPCTargetPriority(
  ...args: Parameters<SpatialUISystem['calculateNPCTargetPriority']>
): ReturnType<SpatialUISystem['calculateNPCTargetPriority']> {
  return getActiveSpatialUISystem().calculateNPCTargetPriority(...args);
}
export function calculateNPCAttackRange(
  ...args: Parameters<SpatialUISystem['calculateNPCAttackRange']>
): ReturnType<SpatialUISystem['calculateNPCAttackRange']> {
  return getActiveSpatialUISystem().calculateNPCAttackRange(...args);
}
export function calculateNPCInteractionDistance(
  ...args: Parameters<SpatialUISystem['calculateNPCInteractionDistance']>
): ReturnType<SpatialUISystem['calculateNPCInteractionDistance']> {
  return getActiveSpatialUISystem().calculateNPCInteractionDistance(...args);
}
export function calculateNPCInteractionAngle(
  ...args: Parameters<SpatialUISystem['calculateNPCInteractionAngle']>
): ReturnType<SpatialUISystem['calculateNPCInteractionAngle']> {
  return getActiveSpatialUISystem().calculateNPCInteractionAngle(...args);
}
export function calculateNPCApproachPosition(
  ...args: Parameters<SpatialUISystem['calculateNPCApproachPosition']>
): ReturnType<SpatialUISystem['calculateNPCApproachPosition']> {
  return getActiveSpatialUISystem().calculateNPCApproachPosition(...args);
}
export function calculateNPCFleeDirection(
  ...args: Parameters<SpatialUISystem['calculateNPCFleeDirection']>
): ReturnType<SpatialUISystem['calculateNPCFleeDirection']> {
  return getActiveSpatialUISystem().calculateNPCFleeDirection(...args);
}
export function calculateNPCChaseDirection(
  ...args: Parameters<SpatialUISystem['calculateNPCChaseDirection']>
): ReturnType<SpatialUISystem['calculateNPCChaseDirection']> {
  return getActiveSpatialUISystem().calculateNPCChaseDirection(...args);
}
export function calculateNPCInterceptPoint(
  ...args: Parameters<SpatialUISystem['calculateNPCInterceptPoint']>
): ReturnType<SpatialUISystem['calculateNPCInterceptPoint']> {
  return getActiveSpatialUISystem().calculateNPCInterceptPoint(...args);
}
export function calculateNPCPredictionPosition(
  ...args: Parameters<SpatialUISystem['calculateNPCPredictionPosition']>
): ReturnType<SpatialUISystem['calculateNPCPredictionPosition']> {
  return getActiveSpatialUISystem().calculateNPCPredictionPosition(...args);
}
export function calculateNPCTargetPrediction(
  ...args: Parameters<SpatialUISystem['calculateNPCTargetPrediction']>
): ReturnType<SpatialUISystem['calculateNPCTargetPrediction']> {
  return getActiveSpatialUISystem().calculateNPCTargetPrediction(...args);
}
export function calculateNPCDecisionScore(
  ...args: Parameters<SpatialUISystem['calculateNPCDecisionScore']>
): ReturnType<SpatialUISystem['calculateNPCDecisionScore']> {
  return getActiveSpatialUISystem().calculateNPCDecisionScore(...args);
}
export function calculateNPCStateTransition(
  ...args: Parameters<SpatialUISystem['calculateNPCStateTransition']>
): ReturnType<SpatialUISystem['calculateNPCStateTransition']> {
  return getActiveSpatialUISystem().calculateNPCStateTransition(...args);
}
export function calculateNPCAnimationBlend(
  ...args: Parameters<SpatialUISystem['calculateNPCAnimationBlend']>
): ReturnType<SpatialUISystem['calculateNPCAnimationBlend']> {
  return getActiveSpatialUISystem().calculateNPCAnimationBlend(...args);
}
export function calculateNPCNavigationError(
  ...args: Parameters<SpatialUISystem['calculateNPCNavigationError']>
): ReturnType<SpatialUISystem['calculateNPCNavigationError']> {
  return getActiveSpatialUISystem().calculateNPCNavigationError(...args);
}
export function getBossPosition(
  ...args: Parameters<SpatialUISystem['getBossPosition']>
): ReturnType<SpatialUISystem['getBossPosition']> {
  return getActiveSpatialUISystem().getBossPosition(...args);
}
export function getBossCenter(
  ...args: Parameters<SpatialUISystem['getBossCenter']>
): ReturnType<SpatialUISystem['getBossCenter']> {
  return getActiveSpatialUISystem().getBossCenter(...args);
}
export function getBossHeadPosition(
  ...args: Parameters<SpatialUISystem['getBossHeadPosition']>
): ReturnType<SpatialUISystem['getBossHeadPosition']> {
  return getActiveSpatialUISystem().getBossHeadPosition(...args);
}
export function getBossChestPosition(
  ...args: Parameters<SpatialUISystem['getBossChestPosition']>
): ReturnType<SpatialUISystem['getBossChestPosition']> {
  return getActiveSpatialUISystem().getBossChestPosition(...args);
}
export function getBossCorePosition(
  ...args: Parameters<SpatialUISystem['getBossCorePosition']>
): ReturnType<SpatialUISystem['getBossCorePosition']> {
  return getActiveSpatialUISystem().getBossCorePosition(...args);
}
export function getBossWeakPointPosition(
  ...args: Parameters<SpatialUISystem['getBossWeakPointPosition']>
): ReturnType<SpatialUISystem['getBossWeakPointPosition']> {
  return getActiveSpatialUISystem().getBossWeakPointPosition(...args);
}
export function getBossHitboxCenter(
  ...args: Parameters<SpatialUISystem['getBossHitboxCenter']>
): ReturnType<SpatialUISystem['getBossHitboxCenter']> {
  return getActiveSpatialUISystem().getBossHitboxCenter(...args);
}
export function getBossAttackOrigin(
  ...args: Parameters<SpatialUISystem['getBossAttackOrigin']>
): ReturnType<SpatialUISystem['getBossAttackOrigin']> {
  return getActiveSpatialUISystem().getBossAttackOrigin(...args);
}
export function getBossTargetPosition(
  ...args: Parameters<SpatialUISystem['getBossTargetPosition']>
): ReturnType<SpatialUISystem['getBossTargetPosition']> {
  return getActiveSpatialUISystem().getBossTargetPosition(...args);
}
export function calculateBossHeight(
  ...args: Parameters<SpatialUISystem['calculateBossHeight']>
): ReturnType<SpatialUISystem['calculateBossHeight']> {
  return getActiveSpatialUISystem().calculateBossHeight(...args);
}
export function calculateBossWidth(
  ...args: Parameters<SpatialUISystem['calculateBossWidth']>
): ReturnType<SpatialUISystem['calculateBossWidth']> {
  return getActiveSpatialUISystem().calculateBossWidth(...args);
}
export function calculateBossDepth(
  ...args: Parameters<SpatialUISystem['calculateBossDepth']>
): ReturnType<SpatialUISystem['calculateBossDepth']> {
  return getActiveSpatialUISystem().calculateBossDepth(...args);
}
export function calculateBossBounds(
  ...args: Parameters<SpatialUISystem['calculateBossBounds']>
): ReturnType<SpatialUISystem['calculateBossBounds']> {
  return getActiveSpatialUISystem().calculateBossBounds(...args);
}
export function calculateBossBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateBossBoundingBox']>
): ReturnType<SpatialUISystem['calculateBossBoundingBox']> {
  return getActiveSpatialUISystem().calculateBossBoundingBox(...args);
}
export function calculateBossBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateBossBoundingSphere']>
): ReturnType<SpatialUISystem['calculateBossBoundingSphere']> {
  return getActiveSpatialUISystem().calculateBossBoundingSphere(...args);
}
export function calculateBossBoundingCapsule(
  ...args: Parameters<SpatialUISystem['calculateBossBoundingCapsule']>
): ReturnType<SpatialUISystem['calculateBossBoundingCapsule']> {
  return getActiveSpatialUISystem().calculateBossBoundingCapsule(...args);
}
export function calculateBossCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateBossCenterOfMass']>
): ReturnType<SpatialUISystem['calculateBossCenterOfMass']> {
  return getActiveSpatialUISystem().calculateBossCenterOfMass(...args);
}
export function calculateBossDistanceToPlayer(
  ...args: Parameters<SpatialUISystem['calculateBossDistanceToPlayer']>
): ReturnType<SpatialUISystem['calculateBossDistanceToPlayer']> {
  return getActiveSpatialUISystem().calculateBossDistanceToPlayer(...args);
}
export function calculateBossDistanceToWeakPoint(
  ...args: Parameters<SpatialUISystem['calculateBossDistanceToWeakPoint']>
): ReturnType<SpatialUISystem['calculateBossDistanceToWeakPoint']> {
  return getActiveSpatialUISystem().calculateBossDistanceToWeakPoint(...args);
}
export function calculateBossFacingDirection(
  ...args: Parameters<SpatialUISystem['calculateBossFacingDirection']>
): ReturnType<SpatialUISystem['calculateBossFacingDirection']> {
  return getActiveSpatialUISystem().calculateBossFacingDirection(...args);
}
export function calculateBossTurningAngle(
  ...args: Parameters<SpatialUISystem['calculateBossTurningAngle']>
): ReturnType<SpatialUISystem['calculateBossTurningAngle']> {
  return getActiveSpatialUISystem().calculateBossTurningAngle(...args);
}
export function calculateBossMovementSpeed(
  ...args: Parameters<SpatialUISystem['calculateBossMovementSpeed']>
): ReturnType<SpatialUISystem['calculateBossMovementSpeed']> {
  return getActiveSpatialUISystem().calculateBossMovementSpeed(...args);
}
export function calculateBossAttackRange(
  ...args: Parameters<SpatialUISystem['calculateBossAttackRange']>
): ReturnType<SpatialUISystem['calculateBossAttackRange']> {
  return getActiveSpatialUISystem().calculateBossAttackRange(...args);
}
export function calculateBossAttackAngle(
  ...args: Parameters<SpatialUISystem['calculateBossAttackAngle']>
): ReturnType<SpatialUISystem['calculateBossAttackAngle']> {
  return getActiveSpatialUISystem().calculateBossAttackAngle(...args);
}
export function calculateBossAttackTrajectory(
  ...args: Parameters<SpatialUISystem['calculateBossAttackTrajectory']>
): ReturnType<SpatialUISystem['calculateBossAttackTrajectory']> {
  return getActiveSpatialUISystem().calculateBossAttackTrajectory(...args);
}
export function calculateBossProjectileVelocity(
  ...args: Parameters<SpatialUISystem['calculateBossProjectileVelocity']>
): ReturnType<SpatialUISystem['calculateBossProjectileVelocity']> {
  return getActiveSpatialUISystem().calculateBossProjectileVelocity(...args);
}
export function calculateBossProjectileDirection(
  ...args: Parameters<SpatialUISystem['calculateBossProjectileDirection']>
): ReturnType<SpatialUISystem['calculateBossProjectileDirection']> {
  return getActiveSpatialUISystem().calculateBossProjectileDirection(...args);
}
export function calculateBossProjectileImpactPoint(
  ...args: Parameters<SpatialUISystem['calculateBossProjectileImpactPoint']>
): ReturnType<SpatialUISystem['calculateBossProjectileImpactPoint']> {
  return getActiveSpatialUISystem().calculateBossProjectileImpactPoint(...args);
}
export function calculateBossAreaAttackRadius(
  ...args: Parameters<SpatialUISystem['calculateBossAreaAttackRadius']>
): ReturnType<SpatialUISystem['calculateBossAreaAttackRadius']> {
  return getActiveSpatialUISystem().calculateBossAreaAttackRadius(...args);
}
export function calculateBossAreaAttackCenter(
  ...args: Parameters<SpatialUISystem['calculateBossAreaAttackCenter']>
): ReturnType<SpatialUISystem['calculateBossAreaAttackCenter']> {
  return getActiveSpatialUISystem().calculateBossAreaAttackCenter(...args);
}
export function calculateBossAreaAttackOverlap(
  ...args: Parameters<SpatialUISystem['calculateBossAreaAttackOverlap']>
): ReturnType<SpatialUISystem['calculateBossAreaAttackOverlap']> {
  return getActiveSpatialUISystem().calculateBossAreaAttackOverlap(...args);
}
export function calculateBossHitboxOverlap(
  ...args: Parameters<SpatialUISystem['calculateBossHitboxOverlap']>
): ReturnType<SpatialUISystem['calculateBossHitboxOverlap']> {
  return getActiveSpatialUISystem().calculateBossHitboxOverlap(...args);
}
export function calculateBossDamageDirection(
  ...args: Parameters<SpatialUISystem['calculateBossDamageDirection']>
): ReturnType<SpatialUISystem['calculateBossDamageDirection']> {
  return getActiveSpatialUISystem().calculateBossDamageDirection(...args);
}
export function calculateBossKnockbackDirection(
  ...args: Parameters<SpatialUISystem['calculateBossKnockbackDirection']>
): ReturnType<SpatialUISystem['calculateBossKnockbackDirection']> {
  return getActiveSpatialUISystem().calculateBossKnockbackDirection(...args);
}
export function calculateBossKnockbackDistance(
  ...args: Parameters<SpatialUISystem['calculateBossKnockbackDistance']>
): ReturnType<SpatialUISystem['calculateBossKnockbackDistance']> {
  return getActiveSpatialUISystem().calculateBossKnockbackDistance(...args);
}
export function calculateBossStaggerAngle(
  ...args: Parameters<SpatialUISystem['calculateBossStaggerAngle']>
): ReturnType<SpatialUISystem['calculateBossStaggerAngle']> {
  return getActiveSpatialUISystem().calculateBossStaggerAngle(...args);
}
export function calculateBossStaggerDuration(
  ...args: Parameters<SpatialUISystem['calculateBossStaggerDuration']>
): ReturnType<SpatialUISystem['calculateBossStaggerDuration']> {
  return getActiveSpatialUISystem().calculateBossStaggerDuration(...args);
}
export function calculateBossPhaseTransition(
  ...args: Parameters<SpatialUISystem['calculateBossPhaseTransition']>
): ReturnType<SpatialUISystem['calculateBossPhaseTransition']> {
  return getActiveSpatialUISystem().calculateBossPhaseTransition(...args);
}
export function calculateBossPhasePosition(
  ...args: Parameters<SpatialUISystem['calculateBossPhasePosition']>
): ReturnType<SpatialUISystem['calculateBossPhasePosition']> {
  return getActiveSpatialUISystem().calculateBossPhasePosition(...args);
}
export function calculateBossWeakPointExposure(
  ...args: Parameters<SpatialUISystem['calculateBossWeakPointExposure']>
): ReturnType<SpatialUISystem['calculateBossWeakPointExposure']> {
  return getActiveSpatialUISystem().calculateBossWeakPointExposure(...args);
}
export function calculateMonsterPosition(
  ...args: Parameters<SpatialUISystem['calculateMonsterPosition']>
): ReturnType<SpatialUISystem['calculateMonsterPosition']> {
  return getActiveSpatialUISystem().calculateMonsterPosition(...args);
}
export function calculateMonsterMovementDirection(
  ...args: Parameters<SpatialUISystem['calculateMonsterMovementDirection']>
): ReturnType<SpatialUISystem['calculateMonsterMovementDirection']> {
  return getActiveSpatialUISystem().calculateMonsterMovementDirection(...args);
}
export function calculateMonsterSpeed(
  ...args: Parameters<SpatialUISystem['calculateMonsterSpeed']>
): ReturnType<SpatialUISystem['calculateMonsterSpeed']> {
  return getActiveSpatialUISystem().calculateMonsterSpeed(...args);
}
export function calculateMonsterAttackDistance(
  ...args: Parameters<SpatialUISystem['calculateMonsterAttackDistance']>
): ReturnType<SpatialUISystem['calculateMonsterAttackDistance']> {
  return getActiveSpatialUISystem().calculateMonsterAttackDistance(...args);
}
export function calculateMonsterDetectionRange(
  ...args: Parameters<SpatialUISystem['calculateMonsterDetectionRange']>
): ReturnType<SpatialUISystem['calculateMonsterDetectionRange']> {
  return getActiveSpatialUISystem().calculateMonsterDetectionRange(...args);
}
export function calculateMonsterCollision(
  ...args: Parameters<SpatialUISystem['calculateMonsterCollision']>
): ReturnType<SpatialUISystem['calculateMonsterCollision']> {
  return getActiveSpatialUISystem().calculateMonsterCollision(...args);
}
export function calculateMonsterBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateMonsterBoundingBox']>
): ReturnType<SpatialUISystem['calculateMonsterBoundingBox']> {
  return getActiveSpatialUISystem().calculateMonsterBoundingBox(...args);
}
export function calculateMonsterBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateMonsterBoundingSphere']>
): ReturnType<SpatialUISystem['calculateMonsterBoundingSphere']> {
  return getActiveSpatialUISystem().calculateMonsterBoundingSphere(...args);
}
export function calculateMonsterWeakPoint(
  ...args: Parameters<SpatialUISystem['calculateMonsterWeakPoint']>
): ReturnType<SpatialUISystem['calculateMonsterWeakPoint']> {
  return getActiveSpatialUISystem().calculateMonsterWeakPoint(...args);
}
export function calculateMonsterThreatLevel(
  ...args: Parameters<SpatialUISystem['calculateMonsterThreatLevel']>
): ReturnType<SpatialUISystem['calculateMonsterThreatLevel']> {
  return getActiveSpatialUISystem().calculateMonsterThreatLevel(...args);
}
export function getAnimalPosition(
  ...args: Parameters<SpatialUISystem['getAnimalPosition']>
): ReturnType<SpatialUISystem['getAnimalPosition']> {
  return getActiveSpatialUISystem().getAnimalPosition(...args);
}
export function getAnimalCenter(
  ...args: Parameters<SpatialUISystem['getAnimalCenter']>
): ReturnType<SpatialUISystem['getAnimalCenter']> {
  return getActiveSpatialUISystem().getAnimalCenter(...args);
}
export function getAnimalHeadPosition(
  ...args: Parameters<SpatialUISystem['getAnimalHeadPosition']>
): ReturnType<SpatialUISystem['getAnimalHeadPosition']> {
  return getActiveSpatialUISystem().getAnimalHeadPosition(...args);
}
export function getAnimalSnoutPosition(
  ...args: Parameters<SpatialUISystem['getAnimalSnoutPosition']>
): ReturnType<SpatialUISystem['getAnimalSnoutPosition']> {
  return getActiveSpatialUISystem().getAnimalSnoutPosition(...args);
}
export function getAnimalNosePosition(
  ...args: Parameters<SpatialUISystem['getAnimalNosePosition']>
): ReturnType<SpatialUISystem['getAnimalNosePosition']> {
  return getActiveSpatialUISystem().getAnimalNosePosition(...args);
}
export function getAnimalEyePosition(
  ...args: Parameters<SpatialUISystem['getAnimalEyePosition']>
): ReturnType<SpatialUISystem['getAnimalEyePosition']> {
  return getActiveSpatialUISystem().getAnimalEyePosition(...args);
}
export function getAnimalEarPosition(
  ...args: Parameters<SpatialUISystem['getAnimalEarPosition']>
): ReturnType<SpatialUISystem['getAnimalEarPosition']> {
  return getActiveSpatialUISystem().getAnimalEarPosition(...args);
}
export function getAnimalNeckPosition(
  ...args: Parameters<SpatialUISystem['getAnimalNeckPosition']>
): ReturnType<SpatialUISystem['getAnimalNeckPosition']> {
  return getActiveSpatialUISystem().getAnimalNeckPosition(...args);
}
export function getAnimalTorsoPosition(
  ...args: Parameters<SpatialUISystem['getAnimalTorsoPosition']>
): ReturnType<SpatialUISystem['getAnimalTorsoPosition']> {
  return getActiveSpatialUISystem().getAnimalTorsoPosition(...args);
}
export function getAnimalChestPosition(
  ...args: Parameters<SpatialUISystem['getAnimalChestPosition']>
): ReturnType<SpatialUISystem['getAnimalChestPosition']> {
  return getActiveSpatialUISystem().getAnimalChestPosition(...args);
}
export function getAnimalAbdomenPosition(
  ...args: Parameters<SpatialUISystem['getAnimalAbdomenPosition']>
): ReturnType<SpatialUISystem['getAnimalAbdomenPosition']> {
  return getActiveSpatialUISystem().getAnimalAbdomenPosition(...args);
}
export function getAnimalHipPosition(
  ...args: Parameters<SpatialUISystem['getAnimalHipPosition']>
): ReturnType<SpatialUISystem['getAnimalHipPosition']> {
  return getActiveSpatialUISystem().getAnimalHipPosition(...args);
}
export function getAnimalTailPosition(
  ...args: Parameters<SpatialUISystem['getAnimalTailPosition']>
): ReturnType<SpatialUISystem['getAnimalTailPosition']> {
  return getActiveSpatialUISystem().getAnimalTailPosition(...args);
}
export function getAnimalTailTipPosition(
  ...args: Parameters<SpatialUISystem['getAnimalTailTipPosition']>
): ReturnType<SpatialUISystem['getAnimalTailTipPosition']> {
  return getActiveSpatialUISystem().getAnimalTailTipPosition(...args);
}
export function getAnimalFrontLeftLegPosition(
  ...args: Parameters<SpatialUISystem['getAnimalFrontLeftLegPosition']>
): ReturnType<SpatialUISystem['getAnimalFrontLeftLegPosition']> {
  return getActiveSpatialUISystem().getAnimalFrontLeftLegPosition(...args);
}
export function getAnimalFrontRightLegPosition(
  ...args: Parameters<SpatialUISystem['getAnimalFrontRightLegPosition']>
): ReturnType<SpatialUISystem['getAnimalFrontRightLegPosition']> {
  return getActiveSpatialUISystem().getAnimalFrontRightLegPosition(...args);
}
export function getAnimalRearLeftLegPosition(
  ...args: Parameters<SpatialUISystem['getAnimalRearLeftLegPosition']>
): ReturnType<SpatialUISystem['getAnimalRearLeftLegPosition']> {
  return getActiveSpatialUISystem().getAnimalRearLeftLegPosition(...args);
}
export function getAnimalRearRightLegPosition(
  ...args: Parameters<SpatialUISystem['getAnimalRearRightLegPosition']>
): ReturnType<SpatialUISystem['getAnimalRearRightLegPosition']> {
  return getActiveSpatialUISystem().getAnimalRearRightLegPosition(...args);
}
export function getAnimalPawPosition(
  ...args: Parameters<SpatialUISystem['getAnimalPawPosition']>
): ReturnType<SpatialUISystem['getAnimalPawPosition']> {
  return getActiveSpatialUISystem().getAnimalPawPosition(...args);
}
export function getAnimalClawPosition(
  ...args: Parameters<SpatialUISystem['getAnimalClawPosition']>
): ReturnType<SpatialUISystem['getAnimalClawPosition']> {
  return getActiveSpatialUISystem().getAnimalClawPosition(...args);
}
export function calculateAnimalBodyLength(
  ...args: Parameters<SpatialUISystem['calculateAnimalBodyLength']>
): ReturnType<SpatialUISystem['calculateAnimalBodyLength']> {
  return getActiveSpatialUISystem().calculateAnimalBodyLength(...args);
}
export function calculateAnimalBodyHeight(
  ...args: Parameters<SpatialUISystem['calculateAnimalBodyHeight']>
): ReturnType<SpatialUISystem['calculateAnimalBodyHeight']> {
  return getActiveSpatialUISystem().calculateAnimalBodyHeight(...args);
}
export function calculateAnimalBodyWidth(
  ...args: Parameters<SpatialUISystem['calculateAnimalBodyWidth']>
): ReturnType<SpatialUISystem['calculateAnimalBodyWidth']> {
  return getActiveSpatialUISystem().calculateAnimalBodyWidth(...args);
}
export function calculateAnimalCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateAnimalCenterOfMass']>
): ReturnType<SpatialUISystem['calculateAnimalCenterOfMass']> {
  return getActiveSpatialUISystem().calculateAnimalCenterOfMass(...args);
}
export function calculateAnimalSpineCurvature(
  ...args: Parameters<SpatialUISystem['calculateAnimalSpineCurvature']>
): ReturnType<SpatialUISystem['calculateAnimalSpineCurvature']> {
  return getActiveSpatialUISystem().calculateAnimalSpineCurvature(...args);
}
export function calculateAnimalNeckAngle(
  ...args: Parameters<SpatialUISystem['calculateAnimalNeckAngle']>
): ReturnType<SpatialUISystem['calculateAnimalNeckAngle']> {
  return getActiveSpatialUISystem().calculateAnimalNeckAngle(...args);
}
export function calculateAnimalHeadAngle(
  ...args: Parameters<SpatialUISystem['calculateAnimalHeadAngle']>
): ReturnType<SpatialUISystem['calculateAnimalHeadAngle']> {
  return getActiveSpatialUISystem().calculateAnimalHeadAngle(...args);
}
export function calculateAnimalTailCurvature(
  ...args: Parameters<SpatialUISystem['calculateAnimalTailCurvature']>
): ReturnType<SpatialUISystem['calculateAnimalTailCurvature']> {
  return getActiveSpatialUISystem().calculateAnimalTailCurvature(...args);
}
export function calculateAnimalTailSwing(
  ...args: Parameters<SpatialUISystem['calculateAnimalTailSwing']>
): ReturnType<SpatialUISystem['calculateAnimalTailSwing']> {
  return getActiveSpatialUISystem().calculateAnimalTailSwing(...args);
}
export function calculateAnimalLegLength(
  ...args: Parameters<SpatialUISystem['calculateAnimalLegLength']>
): ReturnType<SpatialUISystem['calculateAnimalLegLength']> {
  return getActiveSpatialUISystem().calculateAnimalLegLength(...args);
}
export function calculateAnimalStrideLength(
  ...args: Parameters<SpatialUISystem['calculateAnimalStrideLength']>
): ReturnType<SpatialUISystem['calculateAnimalStrideLength']> {
  return getActiveSpatialUISystem().calculateAnimalStrideLength(...args);
}
export function calculateAnimalStrideFrequency(
  ...args: Parameters<SpatialUISystem['calculateAnimalStrideFrequency']>
): ReturnType<SpatialUISystem['calculateAnimalStrideFrequency']> {
  return getActiveSpatialUISystem().calculateAnimalStrideFrequency(...args);
}
export function calculateAnimalWalkingSpeed(
  ...args: Parameters<SpatialUISystem['calculateAnimalWalkingSpeed']>
): ReturnType<SpatialUISystem['calculateAnimalWalkingSpeed']> {
  return getActiveSpatialUISystem().calculateAnimalWalkingSpeed(...args);
}
export function calculateAnimalRunningSpeed(
  ...args: Parameters<SpatialUISystem['calculateAnimalRunningSpeed']>
): ReturnType<SpatialUISystem['calculateAnimalRunningSpeed']> {
  return getActiveSpatialUISystem().calculateAnimalRunningSpeed(...args);
}
export function calculateAnimalJumpHeight(
  ...args: Parameters<SpatialUISystem['calculateAnimalJumpHeight']>
): ReturnType<SpatialUISystem['calculateAnimalJumpHeight']> {
  return getActiveSpatialUISystem().calculateAnimalJumpHeight(...args);
}
export function calculateAnimalLandingPosition(
  ...args: Parameters<SpatialUISystem['calculateAnimalLandingPosition']>
): ReturnType<SpatialUISystem['calculateAnimalLandingPosition']> {
  return getActiveSpatialUISystem().calculateAnimalLandingPosition(...args);
}
export function calculateAnimalGroundContact(
  ...args: Parameters<SpatialUISystem['calculateAnimalGroundContact']>
): ReturnType<SpatialUISystem['calculateAnimalGroundContact']> {
  return getActiveSpatialUISystem().calculateAnimalGroundContact(...args);
}
export function calculateAnimalFootPlacement(
  ...args: Parameters<SpatialUISystem['calculateAnimalFootPlacement']>
): ReturnType<SpatialUISystem['calculateAnimalFootPlacement']> {
  return getActiveSpatialUISystem().calculateAnimalFootPlacement(...args);
}
export function calculateAnimalBalance(
  ...args: Parameters<SpatialUISystem['calculateAnimalBalance']>
): ReturnType<SpatialUISystem['calculateAnimalBalance']> {
  return getActiveSpatialUISystem().calculateAnimalBalance(...args);
}
export function calculateAnimalGaitPhase(
  ...args: Parameters<SpatialUISystem['calculateAnimalGaitPhase']>
): ReturnType<SpatialUISystem['calculateAnimalGaitPhase']> {
  return getActiveSpatialUISystem().calculateAnimalGaitPhase(...args);
}
export function calculateAnimalHeadToGroundDistance(
  ...args: Parameters<SpatialUISystem['calculateAnimalHeadToGroundDistance']>
): ReturnType<SpatialUISystem['calculateAnimalHeadToGroundDistance']> {
  return getActiveSpatialUISystem().calculateAnimalHeadToGroundDistance(...args);
}
export function calculateAnimalNoseToTargetDistance(
  ...args: Parameters<SpatialUISystem['calculateAnimalNoseToTargetDistance']>
): ReturnType<SpatialUISystem['calculateAnimalNoseToTargetDistance']> {
  return getActiveSpatialUISystem().calculateAnimalNoseToTargetDistance(...args);
}
export function calculateAnimalSightDirection(
  ...args: Parameters<SpatialUISystem['calculateAnimalSightDirection']>
): ReturnType<SpatialUISystem['calculateAnimalSightDirection']> {
  return getActiveSpatialUISystem().calculateAnimalSightDirection(...args);
}
export function calculateAnimalFieldOfView(
  ...args: Parameters<SpatialUISystem['calculateAnimalFieldOfView']>
): ReturnType<SpatialUISystem['calculateAnimalFieldOfView']> {
  return getActiveSpatialUISystem().calculateAnimalFieldOfView(...args);
}
export function calculateAnimalHearingRange(
  ...args: Parameters<SpatialUISystem['calculateAnimalHearingRange']>
): ReturnType<SpatialUISystem['calculateAnimalHearingRange']> {
  return getActiveSpatialUISystem().calculateAnimalHearingRange(...args);
}
export function calculateAnimalSmellRange(
  ...args: Parameters<SpatialUISystem['calculateAnimalSmellRange']>
): ReturnType<SpatialUISystem['calculateAnimalSmellRange']> {
  return getActiveSpatialUISystem().calculateAnimalSmellRange(...args);
}
export function calculateAnimalAttackRange(
  ...args: Parameters<SpatialUISystem['calculateAnimalAttackRange']>
): ReturnType<SpatialUISystem['calculateAnimalAttackRange']> {
  return getActiveSpatialUISystem().calculateAnimalAttackRange(...args);
}
export function calculateAnimalBitePoint(
  ...args: Parameters<SpatialUISystem['calculateAnimalBitePoint']>
): ReturnType<SpatialUISystem['calculateAnimalBitePoint']> {
  return getActiveSpatialUISystem().calculateAnimalBitePoint(...args);
}
export function calculateAnimalBiteDirection(
  ...args: Parameters<SpatialUISystem['calculateAnimalBiteDirection']>
): ReturnType<SpatialUISystem['calculateAnimalBiteDirection']> {
  return getActiveSpatialUISystem().calculateAnimalBiteDirection(...args);
}
export function calculateAnimalCollision(
  ...args: Parameters<SpatialUISystem['calculateAnimalCollision']>
): ReturnType<SpatialUISystem['calculateAnimalCollision']> {
  return getActiveSpatialUISystem().calculateAnimalCollision(...args);
}
export function getBirdPosition(
  ...args: Parameters<SpatialUISystem['getBirdPosition']>
): ReturnType<SpatialUISystem['getBirdPosition']> {
  return getActiveSpatialUISystem().getBirdPosition(...args);
}
export function getBirdHeadPosition(
  ...args: Parameters<SpatialUISystem['getBirdHeadPosition']>
): ReturnType<SpatialUISystem['getBirdHeadPosition']> {
  return getActiveSpatialUISystem().getBirdHeadPosition(...args);
}
export function getBirdBeakPosition(
  ...args: Parameters<SpatialUISystem['getBirdBeakPosition']>
): ReturnType<SpatialUISystem['getBirdBeakPosition']> {
  return getActiveSpatialUISystem().getBirdBeakPosition(...args);
}
export function getBirdEyePosition(
  ...args: Parameters<SpatialUISystem['getBirdEyePosition']>
): ReturnType<SpatialUISystem['getBirdEyePosition']> {
  return getActiveSpatialUISystem().getBirdEyePosition(...args);
}
export function getBirdBodyCenter(
  ...args: Parameters<SpatialUISystem['getBirdBodyCenter']>
): ReturnType<SpatialUISystem['getBirdBodyCenter']> {
  return getActiveSpatialUISystem().getBirdBodyCenter(...args);
}
export function getBirdWingRootPosition(
  ...args: Parameters<SpatialUISystem['getBirdWingRootPosition']>
): ReturnType<SpatialUISystem['getBirdWingRootPosition']> {
  return getActiveSpatialUISystem().getBirdWingRootPosition(...args);
}
export function getBirdLeftWingTip(
  ...args: Parameters<SpatialUISystem['getBirdLeftWingTip']>
): ReturnType<SpatialUISystem['getBirdLeftWingTip']> {
  return getActiveSpatialUISystem().getBirdLeftWingTip(...args);
}
export function getBirdRightWingTip(
  ...args: Parameters<SpatialUISystem['getBirdRightWingTip']>
): ReturnType<SpatialUISystem['getBirdRightWingTip']> {
  return getActiveSpatialUISystem().getBirdRightWingTip(...args);
}
export function getBirdWingCenter(
  ...args: Parameters<SpatialUISystem['getBirdWingCenter']>
): ReturnType<SpatialUISystem['getBirdWingCenter']> {
  return getActiveSpatialUISystem().getBirdWingCenter(...args);
}
export function getBirdTailTipPosition(
  ...args: Parameters<SpatialUISystem['getBirdTailTipPosition']>
): ReturnType<SpatialUISystem['getBirdTailTipPosition']> {
  return getActiveSpatialUISystem().getBirdTailTipPosition(...args);
}
export function getBirdLeftFootPosition(
  ...args: Parameters<SpatialUISystem['getBirdLeftFootPosition']>
): ReturnType<SpatialUISystem['getBirdLeftFootPosition']> {
  return getActiveSpatialUISystem().getBirdLeftFootPosition(...args);
}
export function getBirdRightFootPosition(
  ...args: Parameters<SpatialUISystem['getBirdRightFootPosition']>
): ReturnType<SpatialUISystem['getBirdRightFootPosition']> {
  return getActiveSpatialUISystem().getBirdRightFootPosition(...args);
}
export function calculateBirdWingspan(
  ...args: Parameters<SpatialUISystem['calculateBirdWingspan']>
): ReturnType<SpatialUISystem['calculateBirdWingspan']> {
  return getActiveSpatialUISystem().calculateBirdWingspan(...args);
}
export function calculateBirdWingLength(
  ...args: Parameters<SpatialUISystem['calculateBirdWingLength']>
): ReturnType<SpatialUISystem['calculateBirdWingLength']> {
  return getActiveSpatialUISystem().calculateBirdWingLength(...args);
}
export function calculateBirdWingArea(
  ...args: Parameters<SpatialUISystem['calculateBirdWingArea']>
): ReturnType<SpatialUISystem['calculateBirdWingArea']> {
  return getActiveSpatialUISystem().calculateBirdWingArea(...args);
}
export function calculateBirdWingAngle(
  ...args: Parameters<SpatialUISystem['calculateBirdWingAngle']>
): ReturnType<SpatialUISystem['calculateBirdWingAngle']> {
  return getActiveSpatialUISystem().calculateBirdWingAngle(...args);
}
export function calculateBirdWingFlapAmplitude(
  ...args: Parameters<SpatialUISystem['calculateBirdWingFlapAmplitude']>
): ReturnType<SpatialUISystem['calculateBirdWingFlapAmplitude']> {
  return getActiveSpatialUISystem().calculateBirdWingFlapAmplitude(...args);
}
export function calculateBirdWingFlapFrequency(
  ...args: Parameters<SpatialUISystem['calculateBirdWingFlapFrequency']>
): ReturnType<SpatialUISystem['calculateBirdWingFlapFrequency']> {
  return getActiveSpatialUISystem().calculateBirdWingFlapFrequency(...args);
}
export function calculateBirdWingFlapPhase(
  ...args: Parameters<SpatialUISystem['calculateBirdWingFlapPhase']>
): ReturnType<SpatialUISystem['calculateBirdWingFlapPhase']> {
  return getActiveSpatialUISystem().calculateBirdWingFlapPhase(...args);
}
export function calculateBirdWingVelocity(
  ...args: Parameters<SpatialUISystem['calculateBirdWingVelocity']>
): ReturnType<SpatialUISystem['calculateBirdWingVelocity']> {
  return getActiveSpatialUISystem().calculateBirdWingVelocity(...args);
}
export function calculateBirdWingAcceleration(
  ...args: Parameters<SpatialUISystem['calculateBirdWingAcceleration']>
): ReturnType<SpatialUISystem['calculateBirdWingAcceleration']> {
  return getActiveSpatialUISystem().calculateBirdWingAcceleration(...args);
}
export function calculateBirdFlightDirection(
  ...args: Parameters<SpatialUISystem['calculateBirdFlightDirection']>
): ReturnType<SpatialUISystem['calculateBirdFlightDirection']> {
  return getActiveSpatialUISystem().calculateBirdFlightDirection(...args);
}
export function calculateBirdFlightSpeed(
  ...args: Parameters<SpatialUISystem['calculateBirdFlightSpeed']>
): ReturnType<SpatialUISystem['calculateBirdFlightSpeed']> {
  return getActiveSpatialUISystem().calculateBirdFlightSpeed(...args);
}
export function calculateBirdFlightAltitude(
  ...args: Parameters<SpatialUISystem['calculateBirdFlightAltitude']>
): ReturnType<SpatialUISystem['calculateBirdFlightAltitude']> {
  return getActiveSpatialUISystem().calculateBirdFlightAltitude(...args);
}
export function calculateBirdFlightPath(
  ...args: Parameters<SpatialUISystem['calculateBirdFlightPath']>
): ReturnType<SpatialUISystem['calculateBirdFlightPath']> {
  return getActiveSpatialUISystem().calculateBirdFlightPath(...args);
}
export function calculateBirdGlideAngle(
  ...args: Parameters<SpatialUISystem['calculateBirdGlideAngle']>
): ReturnType<SpatialUISystem['calculateBirdGlideAngle']> {
  return getActiveSpatialUISystem().calculateBirdGlideAngle(...args);
}
export function calculateBirdTurnRadius(
  ...args: Parameters<SpatialUISystem['calculateBirdTurnRadius']>
): ReturnType<SpatialUISystem['calculateBirdTurnRadius']> {
  return getActiveSpatialUISystem().calculateBirdTurnRadius(...args);
}
export function calculateBirdBankAngle(
  ...args: Parameters<SpatialUISystem['calculateBirdBankAngle']>
): ReturnType<SpatialUISystem['calculateBirdBankAngle']> {
  return getActiveSpatialUISystem().calculateBirdBankAngle(...args);
}
export function calculateBirdLiftForce(
  ...args: Parameters<SpatialUISystem['calculateBirdLiftForce']>
): ReturnType<SpatialUISystem['calculateBirdLiftForce']> {
  return getActiveSpatialUISystem().calculateBirdLiftForce(...args);
}
export function calculateBirdDragForce(
  ...args: Parameters<SpatialUISystem['calculateBirdDragForce']>
): ReturnType<SpatialUISystem['calculateBirdDragForce']> {
  return getActiveSpatialUISystem().calculateBirdDragForce(...args);
}
export function calculateBirdHoverPosition(
  ...args: Parameters<SpatialUISystem['calculateBirdHoverPosition']>
): ReturnType<SpatialUISystem['calculateBirdHoverPosition']> {
  return getActiveSpatialUISystem().calculateBirdHoverPosition(...args);
}
export function calculateBirdLandingPoint(
  ...args: Parameters<SpatialUISystem['calculateBirdLandingPoint']>
): ReturnType<SpatialUISystem['calculateBirdLandingPoint']> {
  return getActiveSpatialUISystem().calculateBirdLandingPoint(...args);
}
export function calculateBirdTakeoffVelocity(
  ...args: Parameters<SpatialUISystem['calculateBirdTakeoffVelocity']>
): ReturnType<SpatialUISystem['calculateBirdTakeoffVelocity']> {
  return getActiveSpatialUISystem().calculateBirdTakeoffVelocity(...args);
}
export function calculateBirdObstacleAvoidance(
  ...args: Parameters<SpatialUISystem['calculateBirdObstacleAvoidance']>
): ReturnType<SpatialUISystem['calculateBirdObstacleAvoidance']> {
  return getActiveSpatialUISystem().calculateBirdObstacleAvoidance(...args);
}
export function calculateBirdFormationPosition(
  ...args: Parameters<SpatialUISystem['calculateBirdFormationPosition']>
): ReturnType<SpatialUISystem['calculateBirdFormationPosition']> {
  return getActiveSpatialUISystem().calculateBirdFormationPosition(...args);
}
export function calculateBirdFormationSpacing(
  ...args: Parameters<SpatialUISystem['calculateBirdFormationSpacing']>
): ReturnType<SpatialUISystem['calculateBirdFormationSpacing']> {
  return getActiveSpatialUISystem().calculateBirdFormationSpacing(...args);
}
export function calculateBirdTargetIntercept(
  ...args: Parameters<SpatialUISystem['calculateBirdTargetIntercept']>
): ReturnType<SpatialUISystem['calculateBirdTargetIntercept']> {
  return getActiveSpatialUISystem().calculateBirdTargetIntercept(...args);
}
export function calculateBirdBeakDirection(
  ...args: Parameters<SpatialUISystem['calculateBirdBeakDirection']>
): ReturnType<SpatialUISystem['calculateBirdBeakDirection']> {
  return getActiveSpatialUISystem().calculateBirdBeakDirection(...args);
}
export function calculateBirdTalonsPosition(
  ...args: Parameters<SpatialUISystem['calculateBirdTalonsPosition']>
): ReturnType<SpatialUISystem['calculateBirdTalonsPosition']> {
  return getActiveSpatialUISystem().calculateBirdTalonsPosition(...args);
}
export function calculateBirdCollision(
  ...args: Parameters<SpatialUISystem['calculateBirdCollision']>
): ReturnType<SpatialUISystem['calculateBirdCollision']> {
  return getActiveSpatialUISystem().calculateBirdCollision(...args);
}
export function getPlantPosition(
  ...args: Parameters<SpatialUISystem['getPlantPosition']>
): ReturnType<SpatialUISystem['getPlantPosition']> {
  return getActiveSpatialUISystem().getPlantPosition(...args);
}
export function getPlantRootPosition(
  ...args: Parameters<SpatialUISystem['getPlantRootPosition']>
): ReturnType<SpatialUISystem['getPlantRootPosition']> {
  return getActiveSpatialUISystem().getPlantRootPosition(...args);
}
export function getPlantStemPosition(
  ...args: Parameters<SpatialUISystem['getPlantStemPosition']>
): ReturnType<SpatialUISystem['getPlantStemPosition']> {
  return getActiveSpatialUISystem().getPlantStemPosition(...args);
}
export function getPlantStemBase(
  ...args: Parameters<SpatialUISystem['getPlantStemBase']>
): ReturnType<SpatialUISystem['getPlantStemBase']> {
  return getActiveSpatialUISystem().getPlantStemBase(...args);
}
export function getPlantStemTip(
  ...args: Parameters<SpatialUISystem['getPlantStemTip']>
): ReturnType<SpatialUISystem['getPlantStemTip']> {
  return getActiveSpatialUISystem().getPlantStemTip(...args);
}
export function getTreeTrunkPosition(
  ...args: Parameters<SpatialUISystem['getTreeTrunkPosition']>
): ReturnType<SpatialUISystem['getTreeTrunkPosition']> {
  return getActiveSpatialUISystem().getTreeTrunkPosition(...args);
}
export function getTreeTrunkCenter(
  ...args: Parameters<SpatialUISystem['getTreeTrunkCenter']>
): ReturnType<SpatialUISystem['getTreeTrunkCenter']> {
  return getActiveSpatialUISystem().getTreeTrunkCenter(...args);
}
export function getTreeTrunkBase(
  ...args: Parameters<SpatialUISystem['getTreeTrunkBase']>
): ReturnType<SpatialUISystem['getTreeTrunkBase']> {
  return getActiveSpatialUISystem().getTreeTrunkBase(...args);
}
export function getTreeTrunkTop(
  ...args: Parameters<SpatialUISystem['getTreeTrunkTop']>
): ReturnType<SpatialUISystem['getTreeTrunkTop']> {
  return getActiveSpatialUISystem().getTreeTrunkTop(...args);
}
export function getTreeCanopyCenter(
  ...args: Parameters<SpatialUISystem['getTreeCanopyCenter']>
): ReturnType<SpatialUISystem['getTreeCanopyCenter']> {
  return getActiveSpatialUISystem().getTreeCanopyCenter(...args);
}
export function getTreeCanopyTop(
  ...args: Parameters<SpatialUISystem['getTreeCanopyTop']>
): ReturnType<SpatialUISystem['getTreeCanopyTop']> {
  return getActiveSpatialUISystem().getTreeCanopyTop(...args);
}
export function getTreeCanopyBottom(
  ...args: Parameters<SpatialUISystem['getTreeCanopyBottom']>
): ReturnType<SpatialUISystem['getTreeCanopyBottom']> {
  return getActiveSpatialUISystem().getTreeCanopyBottom(...args);
}
export function getTreeCanopyLeft(
  ...args: Parameters<SpatialUISystem['getTreeCanopyLeft']>
): ReturnType<SpatialUISystem['getTreeCanopyLeft']> {
  return getActiveSpatialUISystem().getTreeCanopyLeft(...args);
}
export function getTreeCanopyRight(
  ...args: Parameters<SpatialUISystem['getTreeCanopyRight']>
): ReturnType<SpatialUISystem['getTreeCanopyRight']> {
  return getActiveSpatialUISystem().getTreeCanopyRight(...args);
}
export function getBranchPosition(
  ...args: Parameters<SpatialUISystem['getBranchPosition']>
): ReturnType<SpatialUISystem['getBranchPosition']> {
  return getActiveSpatialUISystem().getBranchPosition(...args);
}
export function getBranchStartPosition(
  ...args: Parameters<SpatialUISystem['getBranchStartPosition']>
): ReturnType<SpatialUISystem['getBranchStartPosition']> {
  return getActiveSpatialUISystem().getBranchStartPosition(...args);
}
export function getBranchEndPosition(
  ...args: Parameters<SpatialUISystem['getBranchEndPosition']>
): ReturnType<SpatialUISystem['getBranchEndPosition']> {
  return getActiveSpatialUISystem().getBranchEndPosition(...args);
}
export function getBranchJunctionPosition(
  ...args: Parameters<SpatialUISystem['getBranchJunctionPosition']>
): ReturnType<SpatialUISystem['getBranchJunctionPosition']> {
  return getActiveSpatialUISystem().getBranchJunctionPosition(...args);
}
export function getLeafPosition(
  ...args: Parameters<SpatialUISystem['getLeafPosition']>
): ReturnType<SpatialUISystem['getLeafPosition']> {
  return getActiveSpatialUISystem().getLeafPosition(...args);
}
export function getLeafTipPosition(
  ...args: Parameters<SpatialUISystem['getLeafTipPosition']>
): ReturnType<SpatialUISystem['getLeafTipPosition']> {
  return getActiveSpatialUISystem().getLeafTipPosition(...args);
}
export function getLeafBasePosition(
  ...args: Parameters<SpatialUISystem['getLeafBasePosition']>
): ReturnType<SpatialUISystem['getLeafBasePosition']> {
  return getActiveSpatialUISystem().getLeafBasePosition(...args);
}
export function getLeafCenter(
  ...args: Parameters<SpatialUISystem['getLeafCenter']>
): ReturnType<SpatialUISystem['getLeafCenter']> {
  return getActiveSpatialUISystem().getLeafCenter(...args);
}
export function getFlowerPosition(
  ...args: Parameters<SpatialUISystem['getFlowerPosition']>
): ReturnType<SpatialUISystem['getFlowerPosition']> {
  return getActiveSpatialUISystem().getFlowerPosition(...args);
}
export function getFlowerCenter(
  ...args: Parameters<SpatialUISystem['getFlowerCenter']>
): ReturnType<SpatialUISystem['getFlowerCenter']> {
  return getActiveSpatialUISystem().getFlowerCenter(...args);
}
export function getFruitPosition(
  ...args: Parameters<SpatialUISystem['getFruitPosition']>
): ReturnType<SpatialUISystem['getFruitPosition']> {
  return getActiveSpatialUISystem().getFruitPosition(...args);
}
export function getFruitCenter(
  ...args: Parameters<SpatialUISystem['getFruitCenter']>
): ReturnType<SpatialUISystem['getFruitCenter']> {
  return getActiveSpatialUISystem().getFruitCenter(...args);
}
export function getSeedPosition(
  ...args: Parameters<SpatialUISystem['getSeedPosition']>
): ReturnType<SpatialUISystem['getSeedPosition']> {
  return getActiveSpatialUISystem().getSeedPosition(...args);
}
export function calculatePlantHeight(
  ...args: Parameters<SpatialUISystem['calculatePlantHeight']>
): ReturnType<SpatialUISystem['calculatePlantHeight']> {
  return getActiveSpatialUISystem().calculatePlantHeight(...args);
}
export function calculateTreeHeight(
  ...args: Parameters<SpatialUISystem['calculateTreeHeight']>
): ReturnType<SpatialUISystem['calculateTreeHeight']> {
  return getActiveSpatialUISystem().calculateTreeHeight(...args);
}
export function calculateTreeTrunkDiameter(
  ...args: Parameters<SpatialUISystem['calculateTreeTrunkDiameter']>
): ReturnType<SpatialUISystem['calculateTreeTrunkDiameter']> {
  return getActiveSpatialUISystem().calculateTreeTrunkDiameter(...args);
}
export function calculateTreeTrunkRadius(
  ...args: Parameters<SpatialUISystem['calculateTreeTrunkRadius']>
): ReturnType<SpatialUISystem['calculateTreeTrunkRadius']> {
  return getActiveSpatialUISystem().calculateTreeTrunkRadius(...args);
}
export function calculateTreeCanopyRadius(
  ...args: Parameters<SpatialUISystem['calculateTreeCanopyRadius']>
): ReturnType<SpatialUISystem['calculateTreeCanopyRadius']> {
  return getActiveSpatialUISystem().calculateTreeCanopyRadius(...args);
}
export function calculateTreeCanopyVolume(
  ...args: Parameters<SpatialUISystem['calculateTreeCanopyVolume']>
): ReturnType<SpatialUISystem['calculateTreeCanopyVolume']> {
  return getActiveSpatialUISystem().calculateTreeCanopyVolume(...args);
}
export function calculateTreeCanopyBounds(
  ...args: Parameters<SpatialUISystem['calculateTreeCanopyBounds']>
): ReturnType<SpatialUISystem['calculateTreeCanopyBounds']> {
  return getActiveSpatialUISystem().calculateTreeCanopyBounds(...args);
}
export function calculateTreeBranchLength(
  ...args: Parameters<SpatialUISystem['calculateTreeBranchLength']>
): ReturnType<SpatialUISystem['calculateTreeBranchLength']> {
  return getActiveSpatialUISystem().calculateTreeBranchLength(...args);
}
export function calculateBranchAngle(
  ...args: Parameters<SpatialUISystem['calculateBranchAngle']>
): ReturnType<SpatialUISystem['calculateBranchAngle']> {
  return getActiveSpatialUISystem().calculateBranchAngle(...args);
}
export function calculateBranchCurvature(
  ...args: Parameters<SpatialUISystem['calculateBranchCurvature']>
): ReturnType<SpatialUISystem['calculateBranchCurvature']> {
  return getActiveSpatialUISystem().calculateBranchCurvature(...args);
}
export function calculateBranchTaper(
  ...args: Parameters<SpatialUISystem['calculateBranchTaper']>
): ReturnType<SpatialUISystem['calculateBranchTaper']> {
  return getActiveSpatialUISystem().calculateBranchTaper(...args);
}
export function calculateLeafLength(
  ...args: Parameters<SpatialUISystem['calculateLeafLength']>
): ReturnType<SpatialUISystem['calculateLeafLength']> {
  return getActiveSpatialUISystem().calculateLeafLength(...args);
}
export function calculateLeafWidth(
  ...args: Parameters<SpatialUISystem['calculateLeafWidth']>
): ReturnType<SpatialUISystem['calculateLeafWidth']> {
  return getActiveSpatialUISystem().calculateLeafWidth(...args);
}
export function calculateLeafNormal(
  ...args: Parameters<SpatialUISystem['calculateLeafNormal']>
): ReturnType<SpatialUISystem['calculateLeafNormal']> {
  return getActiveSpatialUISystem().calculateLeafNormal(...args);
}
export function calculateLeafOrientation(
  ...args: Parameters<SpatialUISystem['calculateLeafOrientation']>
): ReturnType<SpatialUISystem['calculateLeafOrientation']> {
  return getActiveSpatialUISystem().calculateLeafOrientation(...args);
}
export function calculateLeafCurvature(
  ...args: Parameters<SpatialUISystem['calculateLeafCurvature']>
): ReturnType<SpatialUISystem['calculateLeafCurvature']> {
  return getActiveSpatialUISystem().calculateLeafCurvature(...args);
}
export function calculateLeafArea(
  ...args: Parameters<SpatialUISystem['calculateLeafArea']>
): ReturnType<SpatialUISystem['calculateLeafArea']> {
  return getActiveSpatialUISystem().calculateLeafArea(...args);
}
export function calculateFlowerRadius(
  ...args: Parameters<SpatialUISystem['calculateFlowerRadius']>
): ReturnType<SpatialUISystem['calculateFlowerRadius']> {
  return getActiveSpatialUISystem().calculateFlowerRadius(...args);
}
export function calculateFruitRadius(
  ...args: Parameters<SpatialUISystem['calculateFruitRadius']>
): ReturnType<SpatialUISystem['calculateFruitRadius']> {
  return getActiveSpatialUISystem().calculateFruitRadius(...args);
}
export function calculateRootDepth(
  ...args: Parameters<SpatialUISystem['calculateRootDepth']>
): ReturnType<SpatialUISystem['calculateRootDepth']> {
  return getActiveSpatialUISystem().calculateRootDepth(...args);
}
export function calculateRootSpread(
  ...args: Parameters<SpatialUISystem['calculateRootSpread']>
): ReturnType<SpatialUISystem['calculateRootSpread']> {
  return getActiveSpatialUISystem().calculateRootSpread(...args);
}
export function calculatePlantWindDeflection(
  ...args: Parameters<SpatialUISystem['calculatePlantWindDeflection']>
): ReturnType<SpatialUISystem['calculatePlantWindDeflection']> {
  return getActiveSpatialUISystem().calculatePlantWindDeflection(...args);
}
export function calculateTreeWindSway(
  ...args: Parameters<SpatialUISystem['calculateTreeWindSway']>
): ReturnType<SpatialUISystem['calculateTreeWindSway']> {
  return getActiveSpatialUISystem().calculateTreeWindSway(...args);
}
export function getObjectPosition(
  ...args: Parameters<SpatialUISystem['getObjectPosition']>
): ReturnType<SpatialUISystem['getObjectPosition']> {
  return getActiveSpatialUISystem().getObjectPosition(...args);
}
export function getObjectCenter(
  ...args: Parameters<SpatialUISystem['getObjectCenter']>
): ReturnType<SpatialUISystem['getObjectCenter']> {
  return getActiveSpatialUISystem().getObjectCenter(...args);
}
export function getObjectRotation(
  ...args: Parameters<SpatialUISystem['getObjectRotation']>
): ReturnType<SpatialUISystem['getObjectRotation']> {
  return getActiveSpatialUISystem().getObjectRotation(...args);
}
export function getObjectScale(
  ...args: Parameters<SpatialUISystem['getObjectScale']>
): ReturnType<SpatialUISystem['getObjectScale']> {
  return getActiveSpatialUISystem().getObjectScale(...args);
}
export function getObjectForwardVector(
  ...args: Parameters<SpatialUISystem['getObjectForwardVector']>
): ReturnType<SpatialUISystem['getObjectForwardVector']> {
  return getActiveSpatialUISystem().getObjectForwardVector(...args);
}
export function getObjectRightVector(
  ...args: Parameters<SpatialUISystem['getObjectRightVector']>
): ReturnType<SpatialUISystem['getObjectRightVector']> {
  return getActiveSpatialUISystem().getObjectRightVector(...args);
}
export function getObjectUpVector(
  ...args: Parameters<SpatialUISystem['getObjectUpVector']>
): ReturnType<SpatialUISystem['getObjectUpVector']> {
  return getActiveSpatialUISystem().getObjectUpVector(...args);
}
export function getObjectBoundingBox(
  ...args: Parameters<SpatialUISystem['getObjectBoundingBox']>
): ReturnType<SpatialUISystem['getObjectBoundingBox']> {
  return getActiveSpatialUISystem().getObjectBoundingBox(...args);
}
export function getObjectBoundingSphere(
  ...args: Parameters<SpatialUISystem['getObjectBoundingSphere']>
): ReturnType<SpatialUISystem['getObjectBoundingSphere']> {
  return getActiveSpatialUISystem().getObjectBoundingSphere(...args);
}
export function getObjectBoundingCapsule(
  ...args: Parameters<SpatialUISystem['getObjectBoundingCapsule']>
): ReturnType<SpatialUISystem['getObjectBoundingCapsule']> {
  return getActiveSpatialUISystem().getObjectBoundingCapsule(...args);
}
export function calculateObjectLength(
  ...args: Parameters<SpatialUISystem['calculateObjectLength']>
): ReturnType<SpatialUISystem['calculateObjectLength']> {
  return getActiveSpatialUISystem().calculateObjectLength(...args);
}
export function calculateObjectWidth(
  ...args: Parameters<SpatialUISystem['calculateObjectWidth']>
): ReturnType<SpatialUISystem['calculateObjectWidth']> {
  return getActiveSpatialUISystem().calculateObjectWidth(...args);
}
export function calculateObjectHeight(
  ...args: Parameters<SpatialUISystem['calculateObjectHeight']>
): ReturnType<SpatialUISystem['calculateObjectHeight']> {
  return getActiveSpatialUISystem().calculateObjectHeight(...args);
}
export function calculateObjectDepth(
  ...args: Parameters<SpatialUISystem['calculateObjectDepth']>
): ReturnType<SpatialUISystem['calculateObjectDepth']> {
  return getActiveSpatialUISystem().calculateObjectDepth(...args);
}
export function calculateObjectVolume(
  ...args: Parameters<SpatialUISystem['calculateObjectVolume']>
): ReturnType<SpatialUISystem['calculateObjectVolume']> {
  return getActiveSpatialUISystem().calculateObjectVolume(...args);
}
export function calculateObjectSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateObjectSurfaceArea']>
): ReturnType<SpatialUISystem['calculateObjectSurfaceArea']> {
  return getActiveSpatialUISystem().calculateObjectSurfaceArea(...args);
}
export function calculateObjectCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateObjectCenterOfMass']>
): ReturnType<SpatialUISystem['calculateObjectCenterOfMass']> {
  return getActiveSpatialUISystem().calculateObjectCenterOfMass(...args);
}
export function calculateObjectDensity(
  ...args: Parameters<SpatialUISystem['calculateObjectDensity']>
): ReturnType<SpatialUISystem['calculateObjectDensity']> {
  return getActiveSpatialUISystem().calculateObjectDensity(...args);
}
export function calculateObjectInertiaTensor(
  ...args: Parameters<SpatialUISystem['calculateObjectInertiaTensor']>
): ReturnType<SpatialUISystem['calculateObjectInertiaTensor']> {
  return getActiveSpatialUISystem().calculateObjectInertiaTensor(...args);
}
export function calculateObjectWorldTransform(
  ...args: Parameters<SpatialUISystem['calculateObjectWorldTransform']>
): ReturnType<SpatialUISystem['calculateObjectWorldTransform']> {
  return getActiveSpatialUISystem().calculateObjectWorldTransform(...args);
}
export function calculateObjectLocalTransform(
  ...args: Parameters<SpatialUISystem['calculateObjectLocalTransform']>
): ReturnType<SpatialUISystem['calculateObjectLocalTransform']> {
  return getActiveSpatialUISystem().calculateObjectLocalTransform(...args);
}
export function calculateObjectPivotOffset(
  ...args: Parameters<SpatialUISystem['calculateObjectPivotOffset']>
): ReturnType<SpatialUISystem['calculateObjectPivotOffset']> {
  return getActiveSpatialUISystem().calculateObjectPivotOffset(...args);
}
export function calculateObjectOriginOffset(
  ...args: Parameters<SpatialUISystem['calculateObjectOriginOffset']>
): ReturnType<SpatialUISystem['calculateObjectOriginOffset']> {
  return getActiveSpatialUISystem().calculateObjectOriginOffset(...args);
}
export function calculateObjectDistanceToGround(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToGround']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToGround']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToGround(...args);
}
export function calculateObjectDistanceToWall(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToWall']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToWall']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToWall(...args);
}
export function calculateObjectDistanceToCeiling(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToCeiling']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToCeiling']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToCeiling(...args);
}
export function calculateObjectDistanceToCamera(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToCamera']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToCamera']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToCamera(...args);
}
export function calculateObjectDistanceToPlayer(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToPlayer']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToPlayer']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToPlayer(...args);
}
export function calculateObjectDistanceToTarget(
  ...args: Parameters<SpatialUISystem['calculateObjectDistanceToTarget']>
): ReturnType<SpatialUISystem['calculateObjectDistanceToTarget']> {
  return getActiveSpatialUISystem().calculateObjectDistanceToTarget(...args);
}
export function calculateObjectClosestPoint(
  ...args: Parameters<SpatialUISystem['calculateObjectClosestPoint']>
): ReturnType<SpatialUISystem['calculateObjectClosestPoint']> {
  return getActiveSpatialUISystem().calculateObjectClosestPoint(...args);
}
export function calculateObjectFarthestPoint(
  ...args: Parameters<SpatialUISystem['calculateObjectFarthestPoint']>
): ReturnType<SpatialUISystem['calculateObjectFarthestPoint']> {
  return getActiveSpatialUISystem().calculateObjectFarthestPoint(...args);
}
export function calculateObjectSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateObjectSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateObjectSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateObjectSurfaceNormal(...args);
}
export function calculateObjectTangent(
  ...args: Parameters<SpatialUISystem['calculateObjectTangent']>
): ReturnType<SpatialUISystem['calculateObjectTangent']> {
  return getActiveSpatialUISystem().calculateObjectTangent(...args);
}
export function calculateObjectCurvature(
  ...args: Parameters<SpatialUISystem['calculateObjectCurvature']>
): ReturnType<SpatialUISystem['calculateObjectCurvature']> {
  return getActiveSpatialUISystem().calculateObjectCurvature(...args);
}
export function calculateObjectIntersection(
  ...args: Parameters<SpatialUISystem['calculateObjectIntersection']>
): ReturnType<SpatialUISystem['calculateObjectIntersection']> {
  return getActiveSpatialUISystem().calculateObjectIntersection(...args);
}
export function calculateObjectOverlap(
  ...args: Parameters<SpatialUISystem['calculateObjectOverlap']>
): ReturnType<SpatialUISystem['calculateObjectOverlap']> {
  return getActiveSpatialUISystem().calculateObjectOverlap(...args);
}
export function calculateObjectCollision(
  ...args: Parameters<SpatialUISystem['calculateObjectCollision']>
): ReturnType<SpatialUISystem['calculateObjectCollision']> {
  return getActiveSpatialUISystem().calculateObjectCollision(...args);
}
export function calculateObjectPenetrationDepth(
  ...args: Parameters<SpatialUISystem['calculateObjectPenetrationDepth']>
): ReturnType<SpatialUISystem['calculateObjectPenetrationDepth']> {
  return getActiveSpatialUISystem().calculateObjectPenetrationDepth(...args);
}
export function calculateObjectSeparationVector(
  ...args: Parameters<SpatialUISystem['calculateObjectSeparationVector']>
): ReturnType<SpatialUISystem['calculateObjectSeparationVector']> {
  return getActiveSpatialUISystem().calculateObjectSeparationVector(...args);
}
export function calculateObjectContactPoint(
  ...args: Parameters<SpatialUISystem['calculateObjectContactPoint']>
): ReturnType<SpatialUISystem['calculateObjectContactPoint']> {
  return getActiveSpatialUISystem().calculateObjectContactPoint(...args);
}
export function calculateObjectContactNormal(
  ...args: Parameters<SpatialUISystem['calculateObjectContactNormal']>
): ReturnType<SpatialUISystem['calculateObjectContactNormal']> {
  return getActiveSpatialUISystem().calculateObjectContactNormal(...args);
}
export function calculateObjectContactArea(
  ...args: Parameters<SpatialUISystem['calculateObjectContactArea']>
): ReturnType<SpatialUISystem['calculateObjectContactArea']> {
  return getActiveSpatialUISystem().calculateObjectContactArea(...args);
}
export function calculateObjectFrictionForce(
  ...args: Parameters<SpatialUISystem['calculateObjectFrictionForce']>
): ReturnType<SpatialUISystem['calculateObjectFrictionForce']> {
  return getActiveSpatialUISystem().calculateObjectFrictionForce(...args);
}
export function calculateObjectNormalForce(
  ...args: Parameters<SpatialUISystem['calculateObjectNormalForce']>
): ReturnType<SpatialUISystem['calculateObjectNormalForce']> {
  return getActiveSpatialUISystem().calculateObjectNormalForce(...args);
}
export function calculateObjectGravityForce(
  ...args: Parameters<SpatialUISystem['calculateObjectGravityForce']>
): ReturnType<SpatialUISystem['calculateObjectGravityForce']> {
  return getActiveSpatialUISystem().calculateObjectGravityForce(...args);
}
export function calculateObjectBuoyancyForce(
  ...args: Parameters<SpatialUISystem['calculateObjectBuoyancyForce']>
): ReturnType<SpatialUISystem['calculateObjectBuoyancyForce']> {
  return getActiveSpatialUISystem().calculateObjectBuoyancyForce(...args);
}
export function calculateObjectDragForce(
  ...args: Parameters<SpatialUISystem['calculateObjectDragForce']>
): ReturnType<SpatialUISystem['calculateObjectDragForce']> {
  return getActiveSpatialUISystem().calculateObjectDragForce(...args);
}
export function calculateObjectLiftForce(
  ...args: Parameters<SpatialUISystem['calculateObjectLiftForce']>
): ReturnType<SpatialUISystem['calculateObjectLiftForce']> {
  return getActiveSpatialUISystem().calculateObjectLiftForce(...args);
}
export function calculateObjectVelocity(
  ...args: Parameters<SpatialUISystem['calculateObjectVelocity']>
): ReturnType<SpatialUISystem['calculateObjectVelocity']> {
  return getActiveSpatialUISystem().calculateObjectVelocity(...args);
}
export function calculateObjectAcceleration(
  ...args: Parameters<SpatialUISystem['calculateObjectAcceleration']>
): ReturnType<SpatialUISystem['calculateObjectAcceleration']> {
  return getActiveSpatialUISystem().calculateObjectAcceleration(...args);
}
export function getCameraPosition(
  ...args: Parameters<SpatialUISystem['getCameraPosition']>
): ReturnType<SpatialUISystem['getCameraPosition']> {
  return getActiveSpatialUISystem().getCameraPosition(...args);
}
export function getCameraRotation(
  ...args: Parameters<SpatialUISystem['getCameraRotation']>
): ReturnType<SpatialUISystem['getCameraRotation']> {
  return getActiveSpatialUISystem().getCameraRotation(...args);
}
export function getCameraForwardVector(
  ...args: Parameters<SpatialUISystem['getCameraForwardVector']>
): ReturnType<SpatialUISystem['getCameraForwardVector']> {
  return getActiveSpatialUISystem().getCameraForwardVector(...args);
}
export function getCameraRightVector(
  ...args: Parameters<SpatialUISystem['getCameraRightVector']>
): ReturnType<SpatialUISystem['getCameraRightVector']> {
  return getActiveSpatialUISystem().getCameraRightVector(...args);
}
export function getCameraUpVector(
  ...args: Parameters<SpatialUISystem['getCameraUpVector']>
): ReturnType<SpatialUISystem['getCameraUpVector']> {
  return getActiveSpatialUISystem().getCameraUpVector(...args);
}
export function getCameraTargetPosition(
  ...args: Parameters<SpatialUISystem['getCameraTargetPosition']>
): ReturnType<SpatialUISystem['getCameraTargetPosition']> {
  return getActiveSpatialUISystem().getCameraTargetPosition(...args);
}
export function getCameraFocalPoint(
  ...args: Parameters<SpatialUISystem['getCameraFocalPoint']>
): ReturnType<SpatialUISystem['getCameraFocalPoint']> {
  return getActiveSpatialUISystem().getCameraFocalPoint(...args);
}
export function getCameraNearPlane(
  ...args: Parameters<SpatialUISystem['getCameraNearPlane']>
): ReturnType<SpatialUISystem['getCameraNearPlane']> {
  return getActiveSpatialUISystem().getCameraNearPlane(...args);
}
export function getCameraFarPlane(
  ...args: Parameters<SpatialUISystem['getCameraFarPlane']>
): ReturnType<SpatialUISystem['getCameraFarPlane']> {
  return getActiveSpatialUISystem().getCameraFarPlane(...args);
}
export function getCameraFieldOfView(
  ...args: Parameters<SpatialUISystem['getCameraFieldOfView']>
): ReturnType<SpatialUISystem['getCameraFieldOfView']> {
  return getActiveSpatialUISystem().getCameraFieldOfView(...args);
}
export function calculateCameraDistance(
  ...args: Parameters<SpatialUISystem['calculateCameraDistance']>
): ReturnType<SpatialUISystem['calculateCameraDistance']> {
  return getActiveSpatialUISystem().calculateCameraDistance(...args);
}
export function calculateCameraOrbitPosition(
  ...args: Parameters<SpatialUISystem['calculateCameraOrbitPosition']>
): ReturnType<SpatialUISystem['calculateCameraOrbitPosition']> {
  return getActiveSpatialUISystem().calculateCameraOrbitPosition(...args);
}
export function calculateCameraOrbitAngle(
  ...args: Parameters<SpatialUISystem['calculateCameraOrbitAngle']>
): ReturnType<SpatialUISystem['calculateCameraOrbitAngle']> {
  return getActiveSpatialUISystem().calculateCameraOrbitAngle(...args);
}
export function calculateCameraOrbitRadius(
  ...args: Parameters<SpatialUISystem['calculateCameraOrbitRadius']>
): ReturnType<SpatialUISystem['calculateCameraOrbitRadius']> {
  return getActiveSpatialUISystem().calculateCameraOrbitRadius(...args);
}
export function calculateCameraLookAt(
  ...args: Parameters<SpatialUISystem['calculateCameraLookAt']>
): ReturnType<SpatialUISystem['calculateCameraLookAt']> {
  return getActiveSpatialUISystem().calculateCameraLookAt(...args);
}
export function calculateCameraLookAtMatrix(
  ...args: Parameters<SpatialUISystem['calculateCameraLookAtMatrix']>
): ReturnType<SpatialUISystem['calculateCameraLookAtMatrix']> {
  return getActiveSpatialUISystem().calculateCameraLookAtMatrix(...args);
}
export function calculateCameraViewMatrix(
  ...args: Parameters<SpatialUISystem['calculateCameraViewMatrix']>
): ReturnType<SpatialUISystem['calculateCameraViewMatrix']> {
  return getActiveSpatialUISystem().calculateCameraViewMatrix(...args);
}
export function calculateCameraProjectionMatrix(
  ...args: Parameters<SpatialUISystem['calculateCameraProjectionMatrix']>
): ReturnType<SpatialUISystem['calculateCameraProjectionMatrix']> {
  return getActiveSpatialUISystem().calculateCameraProjectionMatrix(...args);
}
export function calculateCameraViewProjectionMatrix(
  ...args: Parameters<SpatialUISystem['calculateCameraViewProjectionMatrix']>
): ReturnType<SpatialUISystem['calculateCameraViewProjectionMatrix']> {
  return getActiveSpatialUISystem().calculateCameraViewProjectionMatrix(...args);
}
export function calculateCameraFrustum(
  ...args: Parameters<SpatialUISystem['calculateCameraFrustum']>
): ReturnType<SpatialUISystem['calculateCameraFrustum']> {
  return getActiveSpatialUISystem().calculateCameraFrustum(...args);
}
export function calculateCameraFrustumPlanes(
  ...args: Parameters<SpatialUISystem['calculateCameraFrustumPlanes']>
): ReturnType<SpatialUISystem['calculateCameraFrustumPlanes']> {
  return getActiveSpatialUISystem().calculateCameraFrustumPlanes(...args);
}
export function calculateCameraFrustumCorners(
  ...args: Parameters<SpatialUISystem['calculateCameraFrustumCorners']>
): ReturnType<SpatialUISystem['calculateCameraFrustumCorners']> {
  return getActiveSpatialUISystem().calculateCameraFrustumCorners(...args);
}
export function calculateCameraVisibility(
  ...args: Parameters<SpatialUISystem['calculateCameraVisibility']>
): ReturnType<SpatialUISystem['calculateCameraVisibility']> {
  return getActiveSpatialUISystem().calculateCameraVisibility(...args);
}
export function calculateCameraOcclusion(
  ...args: Parameters<SpatialUISystem['calculateCameraOcclusion']>
): ReturnType<SpatialUISystem['calculateCameraOcclusion']> {
  return getActiveSpatialUISystem().calculateCameraOcclusion(...args);
}
export function calculateCameraDepth(
  ...args: Parameters<SpatialUISystem['calculateCameraDepth']>
): ReturnType<SpatialUISystem['calculateCameraDepth']> {
  return getActiveSpatialUISystem().calculateCameraDepth(...args);
}
export function calculateCameraScreenPosition(
  ...args: Parameters<SpatialUISystem['calculateCameraScreenPosition']>
): ReturnType<SpatialUISystem['calculateCameraScreenPosition']> {
  return getActiveSpatialUISystem().calculateCameraScreenPosition(...args);
}
export function calculateCameraScreenRay(
  ...args: Parameters<SpatialUISystem['calculateCameraScreenRay']>
): ReturnType<SpatialUISystem['calculateCameraScreenRay']> {
  return getActiveSpatialUISystem().calculateCameraScreenRay(...args);
}
export function calculateCameraWorldRay(
  ...args: Parameters<SpatialUISystem['calculateCameraWorldRay']>
): ReturnType<SpatialUISystem['calculateCameraWorldRay']> {
  return getActiveSpatialUISystem().calculateCameraWorldRay(...args);
}
export function calculateCameraPickingRay(
  ...args: Parameters<SpatialUISystem['calculateCameraPickingRay']>
): ReturnType<SpatialUISystem['calculateCameraPickingRay']> {
  return getActiveSpatialUISystem().calculateCameraPickingRay(...args);
}
export function calculateCameraRayIntersection(
  ...args: Parameters<SpatialUISystem['calculateCameraRayIntersection']>
): ReturnType<SpatialUISystem['calculateCameraRayIntersection']> {
  return getActiveSpatialUISystem().calculateCameraRayIntersection(...args);
}
export function calculateScreenToWorldRay(
  ...args: Parameters<SpatialUISystem['calculateScreenToWorldRay']>
): ReturnType<SpatialUISystem['calculateScreenToWorldRay']> {
  return getActiveSpatialUISystem().calculateScreenToWorldRay(...args);
}
export function calculateWorldToScreenPosition(
  ...args: Parameters<SpatialUISystem['calculateWorldToScreenPosition']>
): ReturnType<SpatialUISystem['calculateWorldToScreenPosition']> {
  return getActiveSpatialUISystem().calculateWorldToScreenPosition(...args);
}
export function calculateScreenToWorldPosition(
  ...args: Parameters<SpatialUISystem['calculateScreenToWorldPosition']>
): ReturnType<SpatialUISystem['calculateScreenToWorldPosition']> {
  return getActiveSpatialUISystem().calculateScreenToWorldPosition(...args);
}
export function calculateViewportAspectRatio(
  ...args: Parameters<SpatialUISystem['calculateViewportAspectRatio']>
): ReturnType<SpatialUISystem['calculateViewportAspectRatio']> {
  return getActiveSpatialUISystem().calculateViewportAspectRatio(...args);
}
export function calculateViewportCenter(
  ...args: Parameters<SpatialUISystem['calculateViewportCenter']>
): ReturnType<SpatialUISystem['calculateViewportCenter']> {
  return getActiveSpatialUISystem().calculateViewportCenter(...args);
}
export function calculateViewportBounds(
  ...args: Parameters<SpatialUISystem['calculateViewportBounds']>
): ReturnType<SpatialUISystem['calculateViewportBounds']> {
  return getActiveSpatialUISystem().calculateViewportBounds(...args);
}
export function calculateScreenSpaceDistance(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceDistance']>
): ReturnType<SpatialUISystem['calculateScreenSpaceDistance']> {
  return getActiveSpatialUISystem().calculateScreenSpaceDistance(...args);
}
export function calculateScreenSpaceAngle(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceAngle']>
): ReturnType<SpatialUISystem['calculateScreenSpaceAngle']> {
  return getActiveSpatialUISystem().calculateScreenSpaceAngle(...args);
}
export function calculateScreenSpaceBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceBoundingBox']>
): ReturnType<SpatialUISystem['calculateScreenSpaceBoundingBox']> {
  return getActiveSpatialUISystem().calculateScreenSpaceBoundingBox(...args);
}
export function calculateScreenSpaceBoundingSphere(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceBoundingSphere']>
): ReturnType<SpatialUISystem['calculateScreenSpaceBoundingSphere']> {
  return getActiveSpatialUISystem().calculateScreenSpaceBoundingSphere(...args);
}
export function calculateScreenSpaceArea(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceArea']>
): ReturnType<SpatialUISystem['calculateScreenSpaceArea']> {
  return getActiveSpatialUISystem().calculateScreenSpaceArea(...args);
}
export function calculateScreenSpaceScale(
  ...args: Parameters<SpatialUISystem['calculateScreenSpaceScale']>
): ReturnType<SpatialUISystem['calculateScreenSpaceScale']> {
  return getActiveSpatialUISystem().calculateScreenSpaceScale(...args);
}
export function calculatePixelDistance(
  ...args: Parameters<SpatialUISystem['calculatePixelDistance']>
): ReturnType<SpatialUISystem['calculatePixelDistance']> {
  return getActiveSpatialUISystem().calculatePixelDistance(...args);
}
export function calculatePixelPosition(
  ...args: Parameters<SpatialUISystem['calculatePixelPosition']>
): ReturnType<SpatialUISystem['calculatePixelPosition']> {
  return getActiveSpatialUISystem().calculatePixelPosition(...args);
}
export function calculatePixelToWorldScale(
  ...args: Parameters<SpatialUISystem['calculatePixelToWorldScale']>
): ReturnType<SpatialUISystem['calculatePixelToWorldScale']> {
  return getActiveSpatialUISystem().calculatePixelToWorldScale(...args);
}
export function calculateWorldToPixelScale(
  ...args: Parameters<SpatialUISystem['calculateWorldToPixelScale']>
): ReturnType<SpatialUISystem['calculateWorldToPixelScale']> {
  return getActiveSpatialUISystem().calculateWorldToPixelScale(...args);
}
export function calculateUIAnchorPosition(
  ...args: Parameters<SpatialUISystem['calculateUIAnchorPosition']>
): ReturnType<SpatialUISystem['calculateUIAnchorPosition']> {
  return getActiveSpatialUISystem().calculateUIAnchorPosition(...args);
}
export function calculateUIWorldAnchor(
  ...args: Parameters<SpatialUISystem['calculateUIWorldAnchor']>
): ReturnType<SpatialUISystem['calculateUIWorldAnchor']> {
  return getActiveSpatialUISystem().calculateUIWorldAnchor(...args);
}
export function calculateUIBillboardRotation(
  ...args: Parameters<SpatialUISystem['calculateUIBillboardRotation']>
): ReturnType<SpatialUISystem['calculateUIBillboardRotation']> {
  return getActiveSpatialUISystem().calculateUIBillboardRotation(...args);
}
export function calculateUIBillboardPosition(
  ...args: Parameters<SpatialUISystem['calculateUIBillboardPosition']>
): ReturnType<SpatialUISystem['calculateUIBillboardPosition']> {
  return getActiveSpatialUISystem().calculateUIBillboardPosition(...args);
}
export function calculateUIFollowTarget(
  ...args: Parameters<SpatialUISystem['calculateUIFollowTarget']>
): ReturnType<SpatialUISystem['calculateUIFollowTarget']> {
  return getActiveSpatialUISystem().calculateUIFollowTarget(...args);
}
export function calculateUIFollowOffset(
  ...args: Parameters<SpatialUISystem['calculateUIFollowOffset']>
): ReturnType<SpatialUISystem['calculateUIFollowOffset']> {
  return getActiveSpatialUISystem().calculateUIFollowOffset(...args);
}
export function calculateUIVisibility(
  ...args: Parameters<SpatialUISystem['calculateUIVisibility']>
): ReturnType<SpatialUISystem['calculateUIVisibility']> {
  return getActiveSpatialUISystem().calculateUIVisibility(...args);
}
export function calculateUIOcclusion(
  ...args: Parameters<SpatialUISystem['calculateUIOcclusion']>
): ReturnType<SpatialUISystem['calculateUIOcclusion']> {
  return getActiveSpatialUISystem().calculateUIOcclusion(...args);
}
export function calculateUIDistanceScale(
  ...args: Parameters<SpatialUISystem['calculateUIDistanceScale']>
): ReturnType<SpatialUISystem['calculateUIDistanceScale']> {
  return getActiveSpatialUISystem().calculateUIDistanceScale(...args);
}
export function calculateUIDepthOrder(
  ...args: Parameters<SpatialUISystem['calculateUIDepthOrder']>
): ReturnType<SpatialUISystem['calculateUIDepthOrder']> {
  return getActiveSpatialUISystem().calculateUIDepthOrder(...args);
}
export function calculateUIProjectionBounds(
  ...args: Parameters<SpatialUISystem['calculateUIProjectionBounds']>
): ReturnType<SpatialUISystem['calculateUIProjectionBounds']> {
  return getActiveSpatialUISystem().calculateUIProjectionBounds(...args);
}
export function calculateUIInteractionRay(
  ...args: Parameters<SpatialUISystem['calculateUIInteractionRay']>
): ReturnType<SpatialUISystem['calculateUIInteractionRay']> {
  return getActiveSpatialUISystem().calculateUIInteractionRay(...args);
}
export function calculateUIHitTest(
  ...args: Parameters<SpatialUISystem['calculateUIHitTest']>
): ReturnType<SpatialUISystem['calculateUIHitTest']> {
  return getActiveSpatialUISystem().calculateUIHitTest(...args);
}
export function calculateUIWorldToScreenOffset(
  ...args: Parameters<SpatialUISystem['calculateUIWorldToScreenOffset']>
): ReturnType<SpatialUISystem['calculateUIWorldToScreenOffset']> {
  return getActiveSpatialUISystem().calculateUIWorldToScreenOffset(...args);
}
export function calculateAABBOverlap(
  ...args: Parameters<SpatialUISystem['calculateAABBOverlap']>
): ReturnType<SpatialUISystem['calculateAABBOverlap']> {
  return getActiveSpatialUISystem().calculateAABBOverlap(...args);
}
export function calculateOBBOverlap(
  ...args: Parameters<SpatialUISystem['calculateOBBOverlap']>
): ReturnType<SpatialUISystem['calculateOBBOverlap']> {
  return getActiveSpatialUISystem().calculateOBBOverlap(...args);
}
export function calculateSphereOverlap(
  ...args: Parameters<SpatialUISystem['calculateSphereOverlap']>
): ReturnType<SpatialUISystem['calculateSphereOverlap']> {
  return getActiveSpatialUISystem().calculateSphereOverlap(...args);
}
export function calculateCapsuleOverlap(
  ...args: Parameters<SpatialUISystem['calculateCapsuleOverlap']>
): ReturnType<SpatialUISystem['calculateCapsuleOverlap']> {
  return getActiveSpatialUISystem().calculateCapsuleOverlap(...args);
}
export function calculateCylinderOverlap(
  ...args: Parameters<SpatialUISystem['calculateCylinderOverlap']>
): ReturnType<SpatialUISystem['calculateCylinderOverlap']> {
  return getActiveSpatialUISystem().calculateCylinderOverlap(...args);
}
export function calculatePlaneIntersection(
  ...args: Parameters<SpatialUISystem['calculatePlaneIntersection']>
): ReturnType<SpatialUISystem['calculatePlaneIntersection']> {
  return getActiveSpatialUISystem().calculatePlaneIntersection(...args);
}
export function calculateRayPlaneIntersection(
  ...args: Parameters<SpatialUISystem['calculateRayPlaneIntersection']>
): ReturnType<SpatialUISystem['calculateRayPlaneIntersection']> {
  return getActiveSpatialUISystem().calculateRayPlaneIntersection(...args);
}
export function calculateRaySphereIntersection(
  ...args: Parameters<SpatialUISystem['calculateRaySphereIntersection']>
): ReturnType<SpatialUISystem['calculateRaySphereIntersection']> {
  return getActiveSpatialUISystem().calculateRaySphereIntersection(...args);
}
export function calculateRayBoxIntersection(
  ...args: Parameters<SpatialUISystem['calculateRayBoxIntersection']>
): ReturnType<SpatialUISystem['calculateRayBoxIntersection']> {
  return getActiveSpatialUISystem().calculateRayBoxIntersection(...args);
}
export function calculateRayCapsuleIntersection(
  ...args: Parameters<SpatialUISystem['calculateRayCapsuleIntersection']>
): ReturnType<SpatialUISystem['calculateRayCapsuleIntersection']> {
  return getActiveSpatialUISystem().calculateRayCapsuleIntersection(...args);
}
export function calculateRayTriangleIntersection(
  ...args: Parameters<SpatialUISystem['calculateRayTriangleIntersection']>
): ReturnType<SpatialUISystem['calculateRayTriangleIntersection']> {
  return getActiveSpatialUISystem().calculateRayTriangleIntersection(...args);
}
export function calculateSegmentSegmentDistance(
  ...args: Parameters<SpatialUISystem['calculateSegmentSegmentDistance']>
): ReturnType<SpatialUISystem['calculateSegmentSegmentDistance']> {
  return getActiveSpatialUISystem().calculateSegmentSegmentDistance(...args);
}
export function calculateSegmentTriangleIntersection(
  ...args: Parameters<SpatialUISystem['calculateSegmentTriangleIntersection']>
): ReturnType<SpatialUISystem['calculateSegmentTriangleIntersection']> {
  return getActiveSpatialUISystem().calculateSegmentTriangleIntersection(...args);
}
export function calculateTriangleTriangleIntersection(
  ...args: Parameters<SpatialUISystem['calculateTriangleTriangleIntersection']>
): ReturnType<SpatialUISystem['calculateTriangleTriangleIntersection']> {
  return getActiveSpatialUISystem().calculateTriangleTriangleIntersection(...args);
}
export function calculateMeshMeshIntersection(
  ...args: Parameters<SpatialUISystem['calculateMeshMeshIntersection']>
): ReturnType<SpatialUISystem['calculateMeshMeshIntersection']> {
  return getActiveSpatialUISystem().calculateMeshMeshIntersection(...args);
}
export function calculateMeshSurfaceDistance(
  ...args: Parameters<SpatialUISystem['calculateMeshSurfaceDistance']>
): ReturnType<SpatialUISystem['calculateMeshSurfaceDistance']> {
  return getActiveSpatialUISystem().calculateMeshSurfaceDistance(...args);
}
export function calculateClosestPointOnTriangle(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnTriangle']>
): ReturnType<SpatialUISystem['calculateClosestPointOnTriangle']> {
  return getActiveSpatialUISystem().calculateClosestPointOnTriangle(...args);
}
export function calculateClosestPointOnSegment(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnSegment']>
): ReturnType<SpatialUISystem['calculateClosestPointOnSegment']> {
  return getActiveSpatialUISystem().calculateClosestPointOnSegment(...args);
}
export function calculateClosestPointOnPlane(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnPlane']>
): ReturnType<SpatialUISystem['calculateClosestPointOnPlane']> {
  return getActiveSpatialUISystem().calculateClosestPointOnPlane(...args);
}
export function calculateClosestPointOnSphere(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnSphere']>
): ReturnType<SpatialUISystem['calculateClosestPointOnSphere']> {
  return getActiveSpatialUISystem().calculateClosestPointOnSphere(...args);
}
export function calculateClosestPointOnBox(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnBox']>
): ReturnType<SpatialUISystem['calculateClosestPointOnBox']> {
  return getActiveSpatialUISystem().calculateClosestPointOnBox(...args);
}
export function calculateClosestPointOnCapsule(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnCapsule']>
): ReturnType<SpatialUISystem['calculateClosestPointOnCapsule']> {
  return getActiveSpatialUISystem().calculateClosestPointOnCapsule(...args);
}
export function calculateClosestPointOnMesh(
  ...args: Parameters<SpatialUISystem['calculateClosestPointOnMesh']>
): ReturnType<SpatialUISystem['calculateClosestPointOnMesh']> {
  return getActiveSpatialUISystem().calculateClosestPointOnMesh(...args);
}
export function calculateContactManifold(
  ...args: Parameters<SpatialUISystem['calculateContactManifold']>
): ReturnType<SpatialUISystem['calculateContactManifold']> {
  return getActiveSpatialUISystem().calculateContactManifold(...args);
}
export function calculateCollisionNormal(
  ...args: Parameters<SpatialUISystem['calculateCollisionNormal']>
): ReturnType<SpatialUISystem['calculateCollisionNormal']> {
  return getActiveSpatialUISystem().calculateCollisionNormal(...args);
}
export function calculateCollisionDepth(
  ...args: Parameters<SpatialUISystem['calculateCollisionDepth']>
): ReturnType<SpatialUISystem['calculateCollisionDepth']> {
  return getActiveSpatialUISystem().calculateCollisionDepth(...args);
}
export function calculateCollisionTimeOfImpact(
  ...args: Parameters<SpatialUISystem['calculateCollisionTimeOfImpact']>
): ReturnType<SpatialUISystem['calculateCollisionTimeOfImpact']> {
  return getActiveSpatialUISystem().calculateCollisionTimeOfImpact(...args);
}
export function calculateSweptAABB(
  ...args: Parameters<SpatialUISystem['calculateSweptAABB']>
): ReturnType<SpatialUISystem['calculateSweptAABB']> {
  return getActiveSpatialUISystem().calculateSweptAABB(...args);
}
export function calculateSweptSphere(
  ...args: Parameters<SpatialUISystem['calculateSweptSphere']>
): ReturnType<SpatialUISystem['calculateSweptSphere']> {
  return getActiveSpatialUISystem().calculateSweptSphere(...args);
}
export function calculateContinuousCollision(
  ...args: Parameters<SpatialUISystem['calculateContinuousCollision']>
): ReturnType<SpatialUISystem['calculateContinuousCollision']> {
  return getActiveSpatialUISystem().calculateContinuousCollision(...args);
}
export function calculateRigidBodyVelocity(
  ...args: Parameters<SpatialUISystem['calculateRigidBodyVelocity']>
): ReturnType<SpatialUISystem['calculateRigidBodyVelocity']> {
  return getActiveSpatialUISystem().calculateRigidBodyVelocity(...args);
}
export function calculateRigidBodyAcceleration(
  ...args: Parameters<SpatialUISystem['calculateRigidBodyAcceleration']>
): ReturnType<SpatialUISystem['calculateRigidBodyAcceleration']> {
  return getActiveSpatialUISystem().calculateRigidBodyAcceleration(...args);
}
export function calculateRigidBodyAngularVelocity(
  ...args: Parameters<SpatialUISystem['calculateRigidBodyAngularVelocity']>
): ReturnType<SpatialUISystem['calculateRigidBodyAngularVelocity']> {
  return getActiveSpatialUISystem().calculateRigidBodyAngularVelocity(...args);
}
export function calculateRigidBodyAngularAcceleration(
  ...args: Parameters<SpatialUISystem['calculateRigidBodyAngularAcceleration']>
): ReturnType<SpatialUISystem['calculateRigidBodyAngularAcceleration']> {
  return getActiveSpatialUISystem().calculateRigidBodyAngularAcceleration(...args);
}
export function calculateRigidBodyMomentum(
  ...args: Parameters<SpatialUISystem['calculateRigidBodyMomentum']>
): ReturnType<SpatialUISystem['calculateRigidBodyMomentum']> {
  return getActiveSpatialUISystem().calculateRigidBodyMomentum(...args);
}
export function calculateAngularMomentum(
  ...args: Parameters<SpatialUISystem['calculateAngularMomentum']>
): ReturnType<SpatialUISystem['calculateAngularMomentum']> {
  return getActiveSpatialUISystem().calculateAngularMomentum(...args);
}
export function calculateImpulse(
  ...args: Parameters<SpatialUISystem['calculateImpulse']>
): ReturnType<SpatialUISystem['calculateImpulse']> {
  return getActiveSpatialUISystem().calculateImpulse(...args);
}
export function calculateCollisionImpulse(
  ...args: Parameters<SpatialUISystem['calculateCollisionImpulse']>
): ReturnType<SpatialUISystem['calculateCollisionImpulse']> {
  return getActiveSpatialUISystem().calculateCollisionImpulse(...args);
}
export function calculateRestitutionVelocity(
  ...args: Parameters<SpatialUISystem['calculateRestitutionVelocity']>
): ReturnType<SpatialUISystem['calculateRestitutionVelocity']> {
  return getActiveSpatialUISystem().calculateRestitutionVelocity(...args);
}
export function calculateFrictionImpulse(
  ...args: Parameters<SpatialUISystem['calculateFrictionImpulse']>
): ReturnType<SpatialUISystem['calculateFrictionImpulse']> {
  return getActiveSpatialUISystem().calculateFrictionImpulse(...args);
}
export function calculateGravityAcceleration(
  ...args: Parameters<SpatialUISystem['calculateGravityAcceleration']>
): ReturnType<SpatialUISystem['calculateGravityAcceleration']> {
  return getActiveSpatialUISystem().calculateGravityAcceleration(...args);
}
export function calculateSpringForce(
  ...args: Parameters<SpatialUISystem['calculateSpringForce']>
): ReturnType<SpatialUISystem['calculateSpringForce']> {
  return getActiveSpatialUISystem().calculateSpringForce(...args);
}
export function calculateDampingForce(
  ...args: Parameters<SpatialUISystem['calculateDampingForce']>
): ReturnType<SpatialUISystem['calculateDampingForce']> {
  return getActiveSpatialUISystem().calculateDampingForce(...args);
}
export function calculateConstraintForce(
  ...args: Parameters<SpatialUISystem['calculateConstraintForce']>
): ReturnType<SpatialUISystem['calculateConstraintForce']> {
  return getActiveSpatialUISystem().calculateConstraintForce(...args);
}
export function calculateConstraintError(
  ...args: Parameters<SpatialUISystem['calculateConstraintError']>
): ReturnType<SpatialUISystem['calculateConstraintError']> {
  return getActiveSpatialUISystem().calculateConstraintError(...args);
}
export function calculatePhysicsIntegration(
  ...args: Parameters<SpatialUISystem['calculatePhysicsIntegration']>
): ReturnType<SpatialUISystem['calculatePhysicsIntegration']> {
  return getActiveSpatialUISystem().calculatePhysicsIntegration(...args);
}
export function calculateVerletIntegration(
  ...args: Parameters<SpatialUISystem['calculateVerletIntegration']>
): ReturnType<SpatialUISystem['calculateVerletIntegration']> {
  return getActiveSpatialUISystem().calculateVerletIntegration(...args);
}
export function calculateRungeKuttaIntegration(
  ...args: Parameters<SpatialUISystem['calculateRungeKuttaIntegration']>
): ReturnType<SpatialUISystem['calculateRungeKuttaIntegration']> {
  return getActiveSpatialUISystem().calculateRungeKuttaIntegration(...args);
}
export function calculatePhysicsSubsteps(
  ...args: Parameters<SpatialUISystem['calculatePhysicsSubsteps']>
): ReturnType<SpatialUISystem['calculatePhysicsSubsteps']> {
  return getActiveSpatialUISystem().calculatePhysicsSubsteps(...args);
}
export function calculatePhysicsStability(
  ...args: Parameters<SpatialUISystem['calculatePhysicsStability']>
): ReturnType<SpatialUISystem['calculatePhysicsStability']> {
  return getActiveSpatialUISystem().calculatePhysicsStability(...args);
}
export function getProjectilePosition(
  ...args: Parameters<SpatialUISystem['getProjectilePosition']>
): ReturnType<SpatialUISystem['getProjectilePosition']> {
  return getActiveSpatialUISystem().getProjectilePosition(...args);
}
export function getProjectileOrigin(
  ...args: Parameters<SpatialUISystem['getProjectileOrigin']>
): ReturnType<SpatialUISystem['getProjectileOrigin']> {
  return getActiveSpatialUISystem().getProjectileOrigin(...args);
}
export function getProjectileTarget(
  ...args: Parameters<SpatialUISystem['getProjectileTarget']>
): ReturnType<SpatialUISystem['getProjectileTarget']> {
  return getActiveSpatialUISystem().getProjectileTarget(...args);
}
export function calculateProjectileDirection(
  ...args: Parameters<SpatialUISystem['calculateProjectileDirection']>
): ReturnType<SpatialUISystem['calculateProjectileDirection']> {
  return getActiveSpatialUISystem().calculateProjectileDirection(...args);
}
export function calculateProjectileVelocity(
  ...args: Parameters<SpatialUISystem['calculateProjectileVelocity']>
): ReturnType<SpatialUISystem['calculateProjectileVelocity']> {
  return getActiveSpatialUISystem().calculateProjectileVelocity(...args);
}
export function calculateProjectileAcceleration(
  ...args: Parameters<SpatialUISystem['calculateProjectileAcceleration']>
): ReturnType<SpatialUISystem['calculateProjectileAcceleration']> {
  return getActiveSpatialUISystem().calculateProjectileAcceleration(...args);
}
export function calculateProjectileTrajectory(
  ...args: Parameters<SpatialUISystem['calculateProjectileTrajectory']>
): ReturnType<SpatialUISystem['calculateProjectileTrajectory']> {
  return getActiveSpatialUISystem().calculateProjectileTrajectory(...args);
}
export function calculateProjectileFlightTime(
  ...args: Parameters<SpatialUISystem['calculateProjectileFlightTime']>
): ReturnType<SpatialUISystem['calculateProjectileFlightTime']> {
  return getActiveSpatialUISystem().calculateProjectileFlightTime(...args);
}
export function calculateProjectileImpactPoint(
  ...args: Parameters<SpatialUISystem['calculateProjectileImpactPoint']>
): ReturnType<SpatialUISystem['calculateProjectileImpactPoint']> {
  return getActiveSpatialUISystem().calculateProjectileImpactPoint(...args);
}
export function calculateProjectileImpactNormal(
  ...args: Parameters<SpatialUISystem['calculateProjectileImpactNormal']>
): ReturnType<SpatialUISystem['calculateProjectileImpactNormal']> {
  return getActiveSpatialUISystem().calculateProjectileImpactNormal(...args);
}
export function calculateProjectileSpreadAngle(
  ...args: Parameters<SpatialUISystem['calculateProjectileSpreadAngle']>
): ReturnType<SpatialUISystem['calculateProjectileSpreadAngle']> {
  return getActiveSpatialUISystem().calculateProjectileSpreadAngle(...args);
}
export function calculateProjectileDropDistance(
  ...args: Parameters<SpatialUISystem['calculateProjectileDropDistance']>
): ReturnType<SpatialUISystem['calculateProjectileDropDistance']> {
  return getActiveSpatialUISystem().calculateProjectileDropDistance(...args);
}
export function calculateProjectileWindDrift(
  ...args: Parameters<SpatialUISystem['calculateProjectileWindDrift']>
): ReturnType<SpatialUISystem['calculateProjectileWindDrift']> {
  return getActiveSpatialUISystem().calculateProjectileWindDrift(...args);
}
export function calculateProjectileCollision(
  ...args: Parameters<SpatialUISystem['calculateProjectileCollision']>
): ReturnType<SpatialUISystem['calculateProjectileCollision']> {
  return getActiveSpatialUISystem().calculateProjectileCollision(...args);
}
export function calculateProjectileDistanceToTarget(
  ...args: Parameters<SpatialUISystem['calculateProjectileDistanceToTarget']>
): ReturnType<SpatialUISystem['calculateProjectileDistanceToTarget']> {
  return getActiveSpatialUISystem().calculateProjectileDistanceToTarget(...args);
}
export function getItemPosition(
  ...args: Parameters<SpatialUISystem['getItemPosition']>
): ReturnType<SpatialUISystem['getItemPosition']> {
  return getActiveSpatialUISystem().getItemPosition(...args);
}
export function getItemCenter(
  ...args: Parameters<SpatialUISystem['getItemCenter']>
): ReturnType<SpatialUISystem['getItemCenter']> {
  return getActiveSpatialUISystem().getItemCenter(...args);
}
export function getItemRotation(
  ...args: Parameters<SpatialUISystem['getItemRotation']>
): ReturnType<SpatialUISystem['getItemRotation']> {
  return getActiveSpatialUISystem().getItemRotation(...args);
}
export function getItemPickupPosition(
  ...args: Parameters<SpatialUISystem['getItemPickupPosition']>
): ReturnType<SpatialUISystem['getItemPickupPosition']> {
  return getActiveSpatialUISystem().getItemPickupPosition(...args);
}
export function calculateItemDistanceToPlayer(
  ...args: Parameters<SpatialUISystem['calculateItemDistanceToPlayer']>
): ReturnType<SpatialUISystem['calculateItemDistanceToPlayer']> {
  return getActiveSpatialUISystem().calculateItemDistanceToPlayer(...args);
}
export function calculateItemPickupRange(
  ...args: Parameters<SpatialUISystem['calculateItemPickupRange']>
): ReturnType<SpatialUISystem['calculateItemPickupRange']> {
  return getActiveSpatialUISystem().calculateItemPickupRange(...args);
}
export function calculateItemPickupOffset(
  ...args: Parameters<SpatialUISystem['calculateItemPickupOffset']>
): ReturnType<SpatialUISystem['calculateItemPickupOffset']> {
  return getActiveSpatialUISystem().calculateItemPickupOffset(...args);
}
export function calculateItemMagnetDirection(
  ...args: Parameters<SpatialUISystem['calculateItemMagnetDirection']>
): ReturnType<SpatialUISystem['calculateItemMagnetDirection']> {
  return getActiveSpatialUISystem().calculateItemMagnetDirection(...args);
}
export function calculateItemMagnetVelocity(
  ...args: Parameters<SpatialUISystem['calculateItemMagnetVelocity']>
): ReturnType<SpatialUISystem['calculateItemMagnetVelocity']> {
  return getActiveSpatialUISystem().calculateItemMagnetVelocity(...args);
}
export function calculateItemHoverHeight(
  ...args: Parameters<SpatialUISystem['calculateItemHoverHeight']>
): ReturnType<SpatialUISystem['calculateItemHoverHeight']> {
  return getActiveSpatialUISystem().calculateItemHoverHeight(...args);
}
export function calculateItemRotationSpeed(
  ...args: Parameters<SpatialUISystem['calculateItemRotationSpeed']>
): ReturnType<SpatialUISystem['calculateItemRotationSpeed']> {
  return getActiveSpatialUISystem().calculateItemRotationSpeed(...args);
}
export function calculateItemBobAmplitude(
  ...args: Parameters<SpatialUISystem['calculateItemBobAmplitude']>
): ReturnType<SpatialUISystem['calculateItemBobAmplitude']> {
  return getActiveSpatialUISystem().calculateItemBobAmplitude(...args);
}
export function calculateItemBobFrequency(
  ...args: Parameters<SpatialUISystem['calculateItemBobFrequency']>
): ReturnType<SpatialUISystem['calculateItemBobFrequency']> {
  return getActiveSpatialUISystem().calculateItemBobFrequency(...args);
}
export function calculateParticlePosition(
  ...args: Parameters<SpatialUISystem['calculateParticlePosition']>
): ReturnType<SpatialUISystem['calculateParticlePosition']> {
  return getActiveSpatialUISystem().calculateParticlePosition(...args);
}
export function calculateParticleVelocity(
  ...args: Parameters<SpatialUISystem['calculateParticleVelocity']>
): ReturnType<SpatialUISystem['calculateParticleVelocity']> {
  return getActiveSpatialUISystem().calculateParticleVelocity(...args);
}
export function calculateParticleAcceleration(
  ...args: Parameters<SpatialUISystem['calculateParticleAcceleration']>
): ReturnType<SpatialUISystem['calculateParticleAcceleration']> {
  return getActiveSpatialUISystem().calculateParticleAcceleration(...args);
}
export function calculateParticleLifetime(
  ...args: Parameters<SpatialUISystem['calculateParticleLifetime']>
): ReturnType<SpatialUISystem['calculateParticleLifetime']> {
  return getActiveSpatialUISystem().calculateParticleLifetime(...args);
}
export function calculateParticleScale(
  ...args: Parameters<SpatialUISystem['calculateParticleScale']>
): ReturnType<SpatialUISystem['calculateParticleScale']> {
  return getActiveSpatialUISystem().calculateParticleScale(...args);
}
export function calculateParticleRotation(
  ...args: Parameters<SpatialUISystem['calculateParticleRotation']>
): ReturnType<SpatialUISystem['calculateParticleRotation']> {
  return getActiveSpatialUISystem().calculateParticleRotation(...args);
}
export function calculateParticleColorInterpolation(
  ...args: Parameters<SpatialUISystem['calculateParticleColorInterpolation']>
): ReturnType<SpatialUISystem['calculateParticleColorInterpolation']> {
  return getActiveSpatialUISystem().calculateParticleColorInterpolation(...args);
}
export function calculateParticleOpacity(
  ...args: Parameters<SpatialUISystem['calculateParticleOpacity']>
): ReturnType<SpatialUISystem['calculateParticleOpacity']> {
  return getActiveSpatialUISystem().calculateParticleOpacity(...args);
}
export function calculateParticleCollision(
  ...args: Parameters<SpatialUISystem['calculateParticleCollision']>
): ReturnType<SpatialUISystem['calculateParticleCollision']> {
  return getActiveSpatialUISystem().calculateParticleCollision(...args);
}
export function calculateParticleAttractorForce(
  ...args: Parameters<SpatialUISystem['calculateParticleAttractorForce']>
): ReturnType<SpatialUISystem['calculateParticleAttractorForce']> {
  return getActiveSpatialUISystem().calculateParticleAttractorForce(...args);
}
export function calculateParticleFieldDirection(
  ...args: Parameters<SpatialUISystem['calculateParticleFieldDirection']>
): ReturnType<SpatialUISystem['calculateParticleFieldDirection']> {
  return getActiveSpatialUISystem().calculateParticleFieldDirection(...args);
}
export function calculateEffectOrigin(
  ...args: Parameters<SpatialUISystem['calculateEffectOrigin']>
): ReturnType<SpatialUISystem['calculateEffectOrigin']> {
  return getActiveSpatialUISystem().calculateEffectOrigin(...args);
}
export function calculateEffectDirection(
  ...args: Parameters<SpatialUISystem['calculateEffectDirection']>
): ReturnType<SpatialUISystem['calculateEffectDirection']> {
  return getActiveSpatialUISystem().calculateEffectDirection(...args);
}
export function calculateEffectRadius(
  ...args: Parameters<SpatialUISystem['calculateEffectRadius']>
): ReturnType<SpatialUISystem['calculateEffectRadius']> {
  return getActiveSpatialUISystem().calculateEffectRadius(...args);
}
export function calculateEffectExpansion(
  ...args: Parameters<SpatialUISystem['calculateEffectExpansion']>
): ReturnType<SpatialUISystem['calculateEffectExpansion']> {
  return getActiveSpatialUISystem().calculateEffectExpansion(...args);
}
export function calculateEffectFalloff(
  ...args: Parameters<SpatialUISystem['calculateEffectFalloff']>
): ReturnType<SpatialUISystem['calculateEffectFalloff']> {
  return getActiveSpatialUISystem().calculateEffectFalloff(...args);
}
export function calculateEffectDuration(
  ...args: Parameters<SpatialUISystem['calculateEffectDuration']>
): ReturnType<SpatialUISystem['calculateEffectDuration']> {
  return getActiveSpatialUISystem().calculateEffectDuration(...args);
}
export function calculateEffectIntensity(
  ...args: Parameters<SpatialUISystem['calculateEffectIntensity']>
): ReturnType<SpatialUISystem['calculateEffectIntensity']> {
  return getActiveSpatialUISystem().calculateEffectIntensity(...args);
}
export function calculateEffectOcclusion(
  ...args: Parameters<SpatialUISystem['calculateEffectOcclusion']>
): ReturnType<SpatialUISystem['calculateEffectOcclusion']> {
  return getActiveSpatialUISystem().calculateEffectOcclusion(...args);
}
export function calculateEffectDistanceToCamera(
  ...args: Parameters<SpatialUISystem['calculateEffectDistanceToCamera']>
): ReturnType<SpatialUISystem['calculateEffectDistanceToCamera']> {
  return getActiveSpatialUISystem().calculateEffectDistanceToCamera(...args);
}
export function calculateEffectScreenBounds(
  ...args: Parameters<SpatialUISystem['calculateEffectScreenBounds']>
): ReturnType<SpatialUISystem['calculateEffectScreenBounds']> {
  return getActiveSpatialUISystem().calculateEffectScreenBounds(...args);
}
export function calculateEffectLOD(
  ...args: Parameters<SpatialUISystem['calculateEffectLOD']>
): ReturnType<SpatialUISystem['calculateEffectLOD']> {
  return getActiveSpatialUISystem().calculateEffectLOD(...args);
}
export function calculateLinearInterpolation(
  ...args: Parameters<SpatialUISystem['calculateLinearInterpolation']>
): ReturnType<SpatialUISystem['calculateLinearInterpolation']> {
  return getActiveSpatialUISystem().calculateLinearInterpolation(...args);
}
export function calculateBilinearInterpolation(
  ...args: Parameters<SpatialUISystem['calculateBilinearInterpolation']>
): ReturnType<SpatialUISystem['calculateBilinearInterpolation']> {
  return getActiveSpatialUISystem().calculateBilinearInterpolation(...args);
}
export function calculateTrilinearInterpolation(
  ...args: Parameters<SpatialUISystem['calculateTrilinearInterpolation']>
): ReturnType<SpatialUISystem['calculateTrilinearInterpolation']> {
  return getActiveSpatialUISystem().calculateTrilinearInterpolation(...args);
}
export function calculateCubicInterpolation(
  ...args: Parameters<SpatialUISystem['calculateCubicInterpolation']>
): ReturnType<SpatialUISystem['calculateCubicInterpolation']> {
  return getActiveSpatialUISystem().calculateCubicInterpolation(...args);
}
export function calculateCatmullRomSpline(
  ...args: Parameters<SpatialUISystem['calculateCatmullRomSpline']>
): ReturnType<SpatialUISystem['calculateCatmullRomSpline']> {
  return getActiveSpatialUISystem().calculateCatmullRomSpline(...args);
}
export function calculateBezierCurve(
  ...args: Parameters<SpatialUISystem['calculateBezierCurve']>
): ReturnType<SpatialUISystem['calculateBezierCurve']> {
  return getActiveSpatialUISystem().calculateBezierCurve(...args);
}
export function calculateQuadraticBezier(
  ...args: Parameters<SpatialUISystem['calculateQuadraticBezier']>
): ReturnType<SpatialUISystem['calculateQuadraticBezier']> {
  return getActiveSpatialUISystem().calculateQuadraticBezier(...args);
}
export function calculateCubicBezier(
  ...args: Parameters<SpatialUISystem['calculateCubicBezier']>
): ReturnType<SpatialUISystem['calculateCubicBezier']> {
  return getActiveSpatialUISystem().calculateCubicBezier(...args);
}
export function calculateBezierTangent(
  ...args: Parameters<SpatialUISystem['calculateBezierTangent']>
): ReturnType<SpatialUISystem['calculateBezierTangent']> {
  return getActiveSpatialUISystem().calculateBezierTangent(...args);
}
export function calculateBezierNormal(
  ...args: Parameters<SpatialUISystem['calculateBezierNormal']>
): ReturnType<SpatialUISystem['calculateBezierNormal']> {
  return getActiveSpatialUISystem().calculateBezierNormal(...args);
}
export function calculateBezierCurvature(
  ...args: Parameters<SpatialUISystem['calculateBezierCurvature']>
): ReturnType<SpatialUISystem['calculateBezierCurvature']> {
  return getActiveSpatialUISystem().calculateBezierCurvature(...args);
}
export function calculateSplinePosition(
  ...args: Parameters<SpatialUISystem['calculateSplinePosition']>
): ReturnType<SpatialUISystem['calculateSplinePosition']> {
  return getActiveSpatialUISystem().calculateSplinePosition(...args);
}
export function calculateSplineTangent(
  ...args: Parameters<SpatialUISystem['calculateSplineTangent']>
): ReturnType<SpatialUISystem['calculateSplineTangent']> {
  return getActiveSpatialUISystem().calculateSplineTangent(...args);
}
export function calculateSplineNormal(
  ...args: Parameters<SpatialUISystem['calculateSplineNormal']>
): ReturnType<SpatialUISystem['calculateSplineNormal']> {
  return getActiveSpatialUISystem().calculateSplineNormal(...args);
}
export function calculateSplineBinormal(
  ...args: Parameters<SpatialUISystem['calculateSplineBinormal']>
): ReturnType<SpatialUISystem['calculateSplineBinormal']> {
  return getActiveSpatialUISystem().calculateSplineBinormal(...args);
}
export function calculateSplineCurvature(
  ...args: Parameters<SpatialUISystem['calculateSplineCurvature']>
): ReturnType<SpatialUISystem['calculateSplineCurvature']> {
  return getActiveSpatialUISystem().calculateSplineCurvature(...args);
}
export function calculateSplineArcLength(
  ...args: Parameters<SpatialUISystem['calculateSplineArcLength']>
): ReturnType<SpatialUISystem['calculateSplineArcLength']> {
  return getActiveSpatialUISystem().calculateSplineArcLength(...args);
}
export function calculateSplineParameterAtDistance(
  ...args: Parameters<SpatialUISystem['calculateSplineParameterAtDistance']>
): ReturnType<SpatialUISystem['calculateSplineParameterAtDistance']> {
  return getActiveSpatialUISystem().calculateSplineParameterAtDistance(...args);
}
export function calculateSplineClosestPoint(
  ...args: Parameters<SpatialUISystem['calculateSplineClosestPoint']>
): ReturnType<SpatialUISystem['calculateSplineClosestPoint']> {
  return getActiveSpatialUISystem().calculateSplineClosestPoint(...args);
}
export function calculateSplineProjection(
  ...args: Parameters<SpatialUISystem['calculateSplineProjection']>
): ReturnType<SpatialUISystem['calculateSplineProjection']> {
  return getActiveSpatialUISystem().calculateSplineProjection(...args);
}
export function calculateSplineUniformSampling(
  ...args: Parameters<SpatialUISystem['calculateSplineUniformSampling']>
): ReturnType<SpatialUISystem['calculateSplineUniformSampling']> {
  return getActiveSpatialUISystem().calculateSplineUniformSampling(...args);
}
export function calculateSplineFrame(
  ...args: Parameters<SpatialUISystem['calculateSplineFrame']>
): ReturnType<SpatialUISystem['calculateSplineFrame']> {
  return getActiveSpatialUISystem().calculateSplineFrame(...args);
}
export function calculateTrajectoryPosition(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryPosition']>
): ReturnType<SpatialUISystem['calculateTrajectoryPosition']> {
  return getActiveSpatialUISystem().calculateTrajectoryPosition(...args);
}
export function calculateTrajectoryVelocity(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryVelocity']>
): ReturnType<SpatialUISystem['calculateTrajectoryVelocity']> {
  return getActiveSpatialUISystem().calculateTrajectoryVelocity(...args);
}
export function calculateTrajectoryAcceleration(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryAcceleration']>
): ReturnType<SpatialUISystem['calculateTrajectoryAcceleration']> {
  return getActiveSpatialUISystem().calculateTrajectoryAcceleration(...args);
}
export function calculateTrajectoryCurvature(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryCurvature']>
): ReturnType<SpatialUISystem['calculateTrajectoryCurvature']> {
  return getActiveSpatialUISystem().calculateTrajectoryCurvature(...args);
}
export function calculateTrajectoryTangent(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryTangent']>
): ReturnType<SpatialUISystem['calculateTrajectoryTangent']> {
  return getActiveSpatialUISystem().calculateTrajectoryTangent(...args);
}
export function calculateTrajectoryNormal(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryNormal']>
): ReturnType<SpatialUISystem['calculateTrajectoryNormal']> {
  return getActiveSpatialUISystem().calculateTrajectoryNormal(...args);
}
export function calculateTrajectoryBinormal(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryBinormal']>
): ReturnType<SpatialUISystem['calculateTrajectoryBinormal']> {
  return getActiveSpatialUISystem().calculateTrajectoryBinormal(...args);
}
export function calculateTrajectoryClosestPoint(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryClosestPoint']>
): ReturnType<SpatialUISystem['calculateTrajectoryClosestPoint']> {
  return getActiveSpatialUISystem().calculateTrajectoryClosestPoint(...args);
}
export function calculateTrajectoryDeviation(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryDeviation']>
): ReturnType<SpatialUISystem['calculateTrajectoryDeviation']> {
  return getActiveSpatialUISystem().calculateTrajectoryDeviation(...args);
}
export function calculateTrajectoryLength(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryLength']>
): ReturnType<SpatialUISystem['calculateTrajectoryLength']> {
  return getActiveSpatialUISystem().calculateTrajectoryLength(...args);
}
export function calculateTrajectoryDuration(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryDuration']>
): ReturnType<SpatialUISystem['calculateTrajectoryDuration']> {
  return getActiveSpatialUISystem().calculateTrajectoryDuration(...args);
}
export function calculateTrajectorySpeedProfile(
  ...args: Parameters<SpatialUISystem['calculateTrajectorySpeedProfile']>
): ReturnType<SpatialUISystem['calculateTrajectorySpeedProfile']> {
  return getActiveSpatialUISystem().calculateTrajectorySpeedProfile(...args);
}
export function calculateTrajectoryTimeParameterization(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryTimeParameterization']>
): ReturnType<SpatialUISystem['calculateTrajectoryTimeParameterization']> {
  return getActiveSpatialUISystem().calculateTrajectoryTimeParameterization(...args);
}
export function calculateTrajectorySmoothing(
  ...args: Parameters<SpatialUISystem['calculateTrajectorySmoothing']>
): ReturnType<SpatialUISystem['calculateTrajectorySmoothing']> {
  return getActiveSpatialUISystem().calculateTrajectorySmoothing(...args);
}
export function calculateTrajectoryOptimization(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryOptimization']>
): ReturnType<SpatialUISystem['calculateTrajectoryOptimization']> {
  return getActiveSpatialUISystem().calculateTrajectoryOptimization(...args);
}
export function calculateTrajectoryCollisionAvoidance(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryCollisionAvoidance']>
): ReturnType<SpatialUISystem['calculateTrajectoryCollisionAvoidance']> {
  return getActiveSpatialUISystem().calculateTrajectoryCollisionAvoidance(...args);
}
export function calculateTrajectoryReachability(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryReachability']>
): ReturnType<SpatialUISystem['calculateTrajectoryReachability']> {
  return getActiveSpatialUISystem().calculateTrajectoryReachability(...args);
}
export function calculateTrajectoryPrediction(
  ...args: Parameters<SpatialUISystem['calculateTrajectoryPrediction']>
): ReturnType<SpatialUISystem['calculateTrajectoryPrediction']> {
  return getActiveSpatialUISystem().calculateTrajectoryPrediction(...args);
}
export function calculateMatrixMultiplication(
  ...args: Parameters<SpatialUISystem['calculateMatrixMultiplication']>
): ReturnType<SpatialUISystem['calculateMatrixMultiplication']> {
  return getActiveSpatialUISystem().calculateMatrixMultiplication(...args);
}
export function calculateMatrixInverse(
  ...args: Parameters<SpatialUISystem['calculateMatrixInverse']>
): ReturnType<SpatialUISystem['calculateMatrixInverse']> {
  return getActiveSpatialUISystem().calculateMatrixInverse(...args);
}
export function calculateMatrixTranspose(
  ...args: Parameters<SpatialUISystem['calculateMatrixTranspose']>
): ReturnType<SpatialUISystem['calculateMatrixTranspose']> {
  return getActiveSpatialUISystem().calculateMatrixTranspose(...args);
}
export function calculateMatrixDeterminant(
  ...args: Parameters<SpatialUISystem['calculateMatrixDeterminant']>
): ReturnType<SpatialUISystem['calculateMatrixDeterminant']> {
  return getActiveSpatialUISystem().calculateMatrixDeterminant(...args);
}
export function calculateMatrixTrace(
  ...args: Parameters<SpatialUISystem['calculateMatrixTrace']>
): ReturnType<SpatialUISystem['calculateMatrixTrace']> {
  return getActiveSpatialUISystem().calculateMatrixTrace(...args);
}
export function calculateMatrixDecomposition(
  ...args: Parameters<SpatialUISystem['calculateMatrixDecomposition']>
): ReturnType<SpatialUISystem['calculateMatrixDecomposition']> {
  return getActiveSpatialUISystem().calculateMatrixDecomposition(...args);
}
export function calculateMatrixOrthogonalization(
  ...args: Parameters<SpatialUISystem['calculateMatrixOrthogonalization']>
): ReturnType<SpatialUISystem['calculateMatrixOrthogonalization']> {
  return getActiveSpatialUISystem().calculateMatrixOrthogonalization(...args);
}
export function calculateMatrixOrthonormalization(
  ...args: Parameters<SpatialUISystem['calculateMatrixOrthonormalization']>
): ReturnType<SpatialUISystem['calculateMatrixOrthonormalization']> {
  return getActiveSpatialUISystem().calculateMatrixOrthonormalization(...args);
}
export function calculateAffineTransform(
  ...args: Parameters<SpatialUISystem['calculateAffineTransform']>
): ReturnType<SpatialUISystem['calculateAffineTransform']> {
  return getActiveSpatialUISystem().calculateAffineTransform(...args);
}
export function calculateHomogeneousTransform(
  ...args: Parameters<SpatialUISystem['calculateHomogeneousTransform']>
): ReturnType<SpatialUISystem['calculateHomogeneousTransform']> {
  return getActiveSpatialUISystem().calculateHomogeneousTransform(...args);
}
export function calculateTranslationMatrix(
  ...args: Parameters<SpatialUISystem['calculateTranslationMatrix']>
): ReturnType<SpatialUISystem['calculateTranslationMatrix']> {
  return getActiveSpatialUISystem().calculateTranslationMatrix(...args);
}
export function calculateScaleMatrix(
  ...args: Parameters<SpatialUISystem['calculateScaleMatrix']>
): ReturnType<SpatialUISystem['calculateScaleMatrix']> {
  return getActiveSpatialUISystem().calculateScaleMatrix(...args);
}
export function calculateRotationXMatrix(
  ...args: Parameters<SpatialUISystem['calculateRotationXMatrix']>
): ReturnType<SpatialUISystem['calculateRotationXMatrix']> {
  return getActiveSpatialUISystem().calculateRotationXMatrix(...args);
}
export function calculateRotationYMatrix(
  ...args: Parameters<SpatialUISystem['calculateRotationYMatrix']>
): ReturnType<SpatialUISystem['calculateRotationYMatrix']> {
  return getActiveSpatialUISystem().calculateRotationYMatrix(...args);
}
export function calculateRotationZMatrix(
  ...args: Parameters<SpatialUISystem['calculateRotationZMatrix']>
): ReturnType<SpatialUISystem['calculateRotationZMatrix']> {
  return getActiveSpatialUISystem().calculateRotationZMatrix(...args);
}
export function calculateNormalMatrix(
  ...args: Parameters<SpatialUISystem['calculateNormalMatrix']>
): ReturnType<SpatialUISystem['calculateNormalMatrix']> {
  return getActiveSpatialUISystem().calculateNormalMatrix(...args);
}
export function calculateTransformHierarchy(
  ...args: Parameters<SpatialUISystem['calculateTransformHierarchy']>
): ReturnType<SpatialUISystem['calculateTransformHierarchy']> {
  return getActiveSpatialUISystem().calculateTransformHierarchy(...args);
}
export function calculateTransformComposition(
  ...args: Parameters<SpatialUISystem['calculateTransformComposition']>
): ReturnType<SpatialUISystem['calculateTransformComposition']> {
  return getActiveSpatialUISystem().calculateTransformComposition(...args);
}
export function calculateTransformDecomposition(
  ...args: Parameters<SpatialUISystem['calculateTransformDecomposition']>
): ReturnType<SpatialUISystem['calculateTransformDecomposition']> {
  return getActiveSpatialUISystem().calculateTransformDecomposition(...args);
}
export function calculateTransformInterpolation(
  ...args: Parameters<SpatialUISystem['calculateTransformInterpolation']>
): ReturnType<SpatialUISystem['calculateTransformInterpolation']> {
  return getActiveSpatialUISystem().calculateTransformInterpolation(...args);
}
export function calculateTransformError(
  ...args: Parameters<SpatialUISystem['calculateTransformError']>
): ReturnType<SpatialUISystem['calculateTransformError']> {
  return getActiveSpatialUISystem().calculateTransformError(...args);
}
export function calculateCoordinateBasis(
  ...args: Parameters<SpatialUISystem['calculateCoordinateBasis']>
): ReturnType<SpatialUISystem['calculateCoordinateBasis']> {
  return getActiveSpatialUISystem().calculateCoordinateBasis(...args);
}
export function calculateCoordinateConversion(
  ...args: Parameters<SpatialUISystem['calculateCoordinateConversion']>
): ReturnType<SpatialUISystem['calculateCoordinateConversion']> {
  return getActiveSpatialUISystem().calculateCoordinateConversion(...args);
}
export function calculateCoordinateNormalization(
  ...args: Parameters<SpatialUISystem['calculateCoordinateNormalization']>
): ReturnType<SpatialUISystem['calculateCoordinateNormalization']> {
  return getActiveSpatialUISystem().calculateCoordinateNormalization(...args);
}
export function calculateCoordinateQuantization(
  ...args: Parameters<SpatialUISystem['calculateCoordinateQuantization']>
): ReturnType<SpatialUISystem['calculateCoordinateQuantization']> {
  return getActiveSpatialUISystem().calculateCoordinateQuantization(...args);
}
export function calculateCoordinateClamping(
  ...args: Parameters<SpatialUISystem['calculateCoordinateClamping']>
): ReturnType<SpatialUISystem['calculateCoordinateClamping']> {
  return getActiveSpatialUISystem().calculateCoordinateClamping(...args);
}
export function calculateCoordinateWrapping(
  ...args: Parameters<SpatialUISystem['calculateCoordinateWrapping']>
): ReturnType<SpatialUISystem['calculateCoordinateWrapping']> {
  return getActiveSpatialUISystem().calculateCoordinateWrapping(...args);
}
export function calculateCoordinateSnapping(
  ...args: Parameters<SpatialUISystem['calculateCoordinateSnapping']>
): ReturnType<SpatialUISystem['calculateCoordinateSnapping']> {
  return getActiveSpatialUISystem().calculateCoordinateSnapping(...args);
}
export function calculateCoordinateRounding(
  ...args: Parameters<SpatialUISystem['calculateCoordinateRounding']>
): ReturnType<SpatialUISystem['calculateCoordinateRounding']> {
  return getActiveSpatialUISystem().calculateCoordinateRounding(...args);
}
export function calculateCoordinatePrecisionError(
  ...args: Parameters<SpatialUISystem['calculateCoordinatePrecisionError']>
): ReturnType<SpatialUISystem['calculateCoordinatePrecisionError']> {
  return getActiveSpatialUISystem().calculateCoordinatePrecisionError(...args);
}
export function getGridCellPosition(
  ...args: Parameters<SpatialUISystem['getGridCellPosition']>
): ReturnType<SpatialUISystem['getGridCellPosition']> {
  return getActiveSpatialUISystem().getGridCellPosition(...args);
}
export function getGridCellCenter(
  ...args: Parameters<SpatialUISystem['getGridCellCenter']>
): ReturnType<SpatialUISystem['getGridCellCenter']> {
  return getActiveSpatialUISystem().getGridCellCenter(...args);
}
export function getGridCellBounds(
  ...args: Parameters<SpatialUISystem['getGridCellBounds']>
): ReturnType<SpatialUISystem['getGridCellBounds']> {
  return getActiveSpatialUISystem().getGridCellBounds(...args);
}
export function calculateGridCellIndex(
  ...args: Parameters<SpatialUISystem['calculateGridCellIndex']>
): ReturnType<SpatialUISystem['calculateGridCellIndex']> {
  return getActiveSpatialUISystem().calculateGridCellIndex(...args);
}
export function calculateGridCoordinates(
  ...args: Parameters<SpatialUISystem['calculateGridCoordinates']>
): ReturnType<SpatialUISystem['calculateGridCoordinates']> {
  return getActiveSpatialUISystem().calculateGridCoordinates(...args);
}
export function calculateGridDistance(
  ...args: Parameters<SpatialUISystem['calculateGridDistance']>
): ReturnType<SpatialUISystem['calculateGridDistance']> {
  return getActiveSpatialUISystem().calculateGridDistance(...args);
}
export function calculateGridNeighborCells(
  ...args: Parameters<SpatialUISystem['calculateGridNeighborCells']>
): ReturnType<SpatialUISystem['calculateGridNeighborCells']> {
  return getActiveSpatialUISystem().calculateGridNeighborCells(...args);
}
export function calculateGridWorldPosition(
  ...args: Parameters<SpatialUISystem['calculateGridWorldPosition']>
): ReturnType<SpatialUISystem['calculateGridWorldPosition']> {
  return getActiveSpatialUISystem().calculateGridWorldPosition(...args);
}
export function calculateGridWorldToCell(
  ...args: Parameters<SpatialUISystem['calculateGridWorldToCell']>
): ReturnType<SpatialUISystem['calculateGridWorldToCell']> {
  return getActiveSpatialUISystem().calculateGridWorldToCell(...args);
}
export function calculateGridOccupancy(
  ...args: Parameters<SpatialUISystem['calculateGridOccupancy']>
): ReturnType<SpatialUISystem['calculateGridOccupancy']> {
  return getActiveSpatialUISystem().calculateGridOccupancy(...args);
}
export function calculateGridTraversalCost(
  ...args: Parameters<SpatialUISystem['calculateGridTraversalCost']>
): ReturnType<SpatialUISystem['calculateGridTraversalCost']> {
  return getActiveSpatialUISystem().calculateGridTraversalCost(...args);
}
export function calculateGridPathDistance(
  ...args: Parameters<SpatialUISystem['calculateGridPathDistance']>
): ReturnType<SpatialUISystem['calculateGridPathDistance']> {
  return getActiveSpatialUISystem().calculateGridPathDistance(...args);
}
export function calculateTerrainHeight(
  ...args: Parameters<SpatialUISystem['calculateTerrainHeight']>
): ReturnType<SpatialUISystem['calculateTerrainHeight']> {
  return getActiveSpatialUISystem().calculateTerrainHeight(...args);
}
export function calculateTerrainNormal(
  ...args: Parameters<SpatialUISystem['calculateTerrainNormal']>
): ReturnType<SpatialUISystem['calculateTerrainNormal']> {
  return getActiveSpatialUISystem().calculateTerrainNormal(...args);
}
export function calculateTerrainSlope(
  ...args: Parameters<SpatialUISystem['calculateTerrainSlope']>
): ReturnType<SpatialUISystem['calculateTerrainSlope']> {
  return getActiveSpatialUISystem().calculateTerrainSlope(...args);
}
export function calculateTerrainCurvature(
  ...args: Parameters<SpatialUISystem['calculateTerrainCurvature']>
): ReturnType<SpatialUISystem['calculateTerrainCurvature']> {
  return getActiveSpatialUISystem().calculateTerrainCurvature(...args);
}
export function calculateTerrainSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateTerrainSurfaceArea']>
): ReturnType<SpatialUISystem['calculateTerrainSurfaceArea']> {
  return getActiveSpatialUISystem().calculateTerrainSurfaceArea(...args);
}
export function calculateTerrainVolume(
  ...args: Parameters<SpatialUISystem['calculateTerrainVolume']>
): ReturnType<SpatialUISystem['calculateTerrainVolume']> {
  return getActiveSpatialUISystem().calculateTerrainVolume(...args);
}
export function calculateTerrainBounds(
  ...args: Parameters<SpatialUISystem['calculateTerrainBounds']>
): ReturnType<SpatialUISystem['calculateTerrainBounds']> {
  return getActiveSpatialUISystem().calculateTerrainBounds(...args);
}
export function calculateTerrainClosestPoint(
  ...args: Parameters<SpatialUISystem['calculateTerrainClosestPoint']>
): ReturnType<SpatialUISystem['calculateTerrainClosestPoint']> {
  return getActiveSpatialUISystem().calculateTerrainClosestPoint(...args);
}
export function calculateTerrainRayIntersection(
  ...args: Parameters<SpatialUISystem['calculateTerrainRayIntersection']>
): ReturnType<SpatialUISystem['calculateTerrainRayIntersection']> {
  return getActiveSpatialUISystem().calculateTerrainRayIntersection(...args);
}
export function calculateTerrainCollision(
  ...args: Parameters<SpatialUISystem['calculateTerrainCollision']>
): ReturnType<SpatialUISystem['calculateTerrainCollision']> {
  return getActiveSpatialUISystem().calculateTerrainCollision(...args);
}
export function calculateTerrainGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateTerrainGroundClearance']>
): ReturnType<SpatialUISystem['calculateTerrainGroundClearance']> {
  return getActiveSpatialUISystem().calculateTerrainGroundClearance(...args);
}
export function calculateTerrainPathSlope(
  ...args: Parameters<SpatialUISystem['calculateTerrainPathSlope']>
): ReturnType<SpatialUISystem['calculateTerrainPathSlope']> {
  return getActiveSpatialUISystem().calculateTerrainPathSlope(...args);
}
export function calculateTerrainNavigationCost(
  ...args: Parameters<SpatialUISystem['calculateTerrainNavigationCost']>
): ReturnType<SpatialUISystem['calculateTerrainNavigationCost']> {
  return getActiveSpatialUISystem().calculateTerrainNavigationCost(...args);
}
export function calculateWaterSurfaceHeight(
  ...args: Parameters<SpatialUISystem['calculateWaterSurfaceHeight']>
): ReturnType<SpatialUISystem['calculateWaterSurfaceHeight']> {
  return getActiveSpatialUISystem().calculateWaterSurfaceHeight(...args);
}
export function calculateWaterSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateWaterSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateWaterSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateWaterSurfaceNormal(...args);
}
export function calculateWaterDepth(
  ...args: Parameters<SpatialUISystem['calculateWaterDepth']>
): ReturnType<SpatialUISystem['calculateWaterDepth']> {
  return getActiveSpatialUISystem().calculateWaterDepth(...args);
}
export function calculateWaterBuoyancy(
  ...args: Parameters<SpatialUISystem['calculateWaterBuoyancy']>
): ReturnType<SpatialUISystem['calculateWaterBuoyancy']> {
  return getActiveSpatialUISystem().calculateWaterBuoyancy(...args);
}
export function calculateEnvironmentWindVector(
  ...args: Parameters<SpatialUISystem['calculateEnvironmentWindVector']>
): ReturnType<SpatialUISystem['calculateEnvironmentWindVector']> {
  return getActiveSpatialUISystem().calculateEnvironmentWindVector(...args);
}
export function calculateObjectLOD(
  ...args: Parameters<SpatialUISystem['calculateObjectLOD']>
): ReturnType<SpatialUISystem['calculateObjectLOD']> {
  return getActiveSpatialUISystem().calculateObjectLOD(...args);
}
export function calculateCharacterLOD(
  ...args: Parameters<SpatialUISystem['calculateCharacterLOD']>
): ReturnType<SpatialUISystem['calculateCharacterLOD']> {
  return getActiveSpatialUISystem().calculateCharacterLOD(...args);
}
export function calculateMeshLOD(
  ...args: Parameters<SpatialUISystem['calculateMeshLOD']>
): ReturnType<SpatialUISystem['calculateMeshLOD']> {
  return getActiveSpatialUISystem().calculateMeshLOD(...args);
}
export function calculateAnimationLOD(
  ...args: Parameters<SpatialUISystem['calculateAnimationLOD']>
): ReturnType<SpatialUISystem['calculateAnimationLOD']> {
  return getActiveSpatialUISystem().calculateAnimationLOD(...args);
}
export function calculateSkeletonLOD(
  ...args: Parameters<SpatialUISystem['calculateSkeletonLOD']>
): ReturnType<SpatialUISystem['calculateSkeletonLOD']> {
  return getActiveSpatialUISystem().calculateSkeletonLOD(...args);
}
export function calculateShadowLOD(
  ...args: Parameters<SpatialUISystem['calculateShadowLOD']>
): ReturnType<SpatialUISystem['calculateShadowLOD']> {
  return getActiveSpatialUISystem().calculateShadowLOD(...args);
}
export function calculateParticleLOD(
  ...args: Parameters<SpatialUISystem['calculateParticleLOD']>
): ReturnType<SpatialUISystem['calculateParticleLOD']> {
  return getActiveSpatialUISystem().calculateParticleLOD(...args);
}
export function calculateLODTransition(
  ...args: Parameters<SpatialUISystem['calculateLODTransition']>
): ReturnType<SpatialUISystem['calculateLODTransition']> {
  return getActiveSpatialUISystem().calculateLODTransition(...args);
}
export function calculateLODThreshold(
  ...args: Parameters<SpatialUISystem['calculateLODThreshold']>
): ReturnType<SpatialUISystem['calculateLODThreshold']> {
  return getActiveSpatialUISystem().calculateLODThreshold(...args);
}
export function calculateLODScreenSize(
  ...args: Parameters<SpatialUISystem['calculateLODScreenSize']>
): ReturnType<SpatialUISystem['calculateLODScreenSize']> {
  return getActiveSpatialUISystem().calculateLODScreenSize(...args);
}
export function calculateLODProjectedError(
  ...args: Parameters<SpatialUISystem['calculateLODProjectedError']>
): ReturnType<SpatialUISystem['calculateLODProjectedError']> {
  return getActiveSpatialUISystem().calculateLODProjectedError(...args);
}
export function calculateLODVisibility(
  ...args: Parameters<SpatialUISystem['calculateLODVisibility']>
): ReturnType<SpatialUISystem['calculateLODVisibility']> {
  return getActiveSpatialUISystem().calculateLODVisibility(...args);
}
export function calculateLODUpdateFrequency(
  ...args: Parameters<SpatialUISystem['calculateLODUpdateFrequency']>
): ReturnType<SpatialUISystem['calculateLODUpdateFrequency']> {
  return getActiveSpatialUISystem().calculateLODUpdateFrequency(...args);
}
export function calculateLODSelectionScore(
  ...args: Parameters<SpatialUISystem['calculateLODSelectionScore']>
): ReturnType<SpatialUISystem['calculateLODSelectionScore']> {
  return getActiveSpatialUISystem().calculateLODSelectionScore(...args);
}
export function calculateOcclusionBounds(
  ...args: Parameters<SpatialUISystem['calculateOcclusionBounds']>
): ReturnType<SpatialUISystem['calculateOcclusionBounds']> {
  return getActiveSpatialUISystem().calculateOcclusionBounds(...args);
}
export function calculateOcclusionVisibility(
  ...args: Parameters<SpatialUISystem['calculateOcclusionVisibility']>
): ReturnType<SpatialUISystem['calculateOcclusionVisibility']> {
  return getActiveSpatialUISystem().calculateOcclusionVisibility(...args);
}
export function calculateFrustumCulling(
  ...args: Parameters<SpatialUISystem['calculateFrustumCulling']>
): ReturnType<SpatialUISystem['calculateFrustumCulling']> {
  return getActiveSpatialUISystem().calculateFrustumCulling(...args);
}
export function calculateDistanceCulling(
  ...args: Parameters<SpatialUISystem['calculateDistanceCulling']>
): ReturnType<SpatialUISystem['calculateDistanceCulling']> {
  return getActiveSpatialUISystem().calculateDistanceCulling(...args);
}
export function calculateScreenSizeCulling(
  ...args: Parameters<SpatialUISystem['calculateScreenSizeCulling']>
): ReturnType<SpatialUISystem['calculateScreenSizeCulling']> {
  return getActiveSpatialUISystem().calculateScreenSizeCulling(...args);
}
export function calculateAnimationUpdatePriority(
  ...args: Parameters<SpatialUISystem['calculateAnimationUpdatePriority']>
): ReturnType<SpatialUISystem['calculateAnimationUpdatePriority']> {
  return getActiveSpatialUISystem().calculateAnimationUpdatePriority(...args);
}
export function calculateBoneUpdatePriority(
  ...args: Parameters<SpatialUISystem['calculateBoneUpdatePriority']>
): ReturnType<SpatialUISystem['calculateBoneUpdatePriority']> {
  return getActiveSpatialUISystem().calculateBoneUpdatePriority(...args);
}
export function calculatePhysicsUpdatePriority(
  ...args: Parameters<SpatialUISystem['calculatePhysicsUpdatePriority']>
): ReturnType<SpatialUISystem['calculatePhysicsUpdatePriority']> {
  return getActiveSpatialUISystem().calculatePhysicsUpdatePriority(...args);
}
export function calculateCollisionUpdatePriority(
  ...args: Parameters<SpatialUISystem['calculateCollisionUpdatePriority']>
): ReturnType<SpatialUISystem['calculateCollisionUpdatePriority']> {
  return getActiveSpatialUISystem().calculateCollisionUpdatePriority(...args);
}
export function calculateSpatialUpdateFrequency(
  ...args: Parameters<SpatialUISystem['calculateSpatialUpdateFrequency']>
): ReturnType<SpatialUISystem['calculateSpatialUpdateFrequency']> {
  return getActiveSpatialUISystem().calculateSpatialUpdateFrequency(...args);
}
export function calculateTransformUpdateFrequency(
  ...args: Parameters<SpatialUISystem['calculateTransformUpdateFrequency']>
): ReturnType<SpatialUISystem['calculateTransformUpdateFrequency']> {
  return getActiveSpatialUISystem().calculateTransformUpdateFrequency(...args);
}
export function calculateBoundingVolumeUpdate(
  ...args: Parameters<SpatialUISystem['calculateBoundingVolumeUpdate']>
): ReturnType<SpatialUISystem['calculateBoundingVolumeUpdate']> {
  return getActiveSpatialUISystem().calculateBoundingVolumeUpdate(...args);
}
export function calculateSpatialPartitionIndex(
  ...args: Parameters<SpatialUISystem['calculateSpatialPartitionIndex']>
): ReturnType<SpatialUISystem['calculateSpatialPartitionIndex']> {
  return getActiveSpatialUISystem().calculateSpatialPartitionIndex(...args);
}
export function calculateOctreeNode(
  ...args: Parameters<SpatialUISystem['calculateOctreeNode']>
): ReturnType<SpatialUISystem['calculateOctreeNode']> {
  return getActiveSpatialUISystem().calculateOctreeNode(...args);
}
export function calculateQuadtreeNode(
  ...args: Parameters<SpatialUISystem['calculateQuadtreeNode']>
): ReturnType<SpatialUISystem['calculateQuadtreeNode']> {
  return getActiveSpatialUISystem().calculateQuadtreeNode(...args);
}
export function calculateBVHTraversalCost(
  ...args: Parameters<SpatialUISystem['calculateBVHTraversalCost']>
): ReturnType<SpatialUISystem['calculateBVHTraversalCost']> {
  return getActiveSpatialUISystem().calculateBVHTraversalCost(...args);
}
export function getClothingPosition(
  ...args: Parameters<SpatialUISystem['getClothingPosition']>
): ReturnType<SpatialUISystem['getClothingPosition']> {
  return getActiveSpatialUISystem().getClothingPosition(...args);
}
export function getClothingAnchor(
  ...args: Parameters<SpatialUISystem['getClothingAnchor']>
): ReturnType<SpatialUISystem['getClothingAnchor']> {
  return getActiveSpatialUISystem().getClothingAnchor(...args);
}
export function getClothingSurfacePosition(
  ...args: Parameters<SpatialUISystem['getClothingSurfacePosition']>
): ReturnType<SpatialUISystem['getClothingSurfacePosition']> {
  return getActiveSpatialUISystem().getClothingSurfacePosition(...args);
}
export function getClothingVertexPosition(
  ...args: Parameters<SpatialUISystem['getClothingVertexPosition']>
): ReturnType<SpatialUISystem['getClothingVertexPosition']> {
  return getActiveSpatialUISystem().getClothingVertexPosition(...args);
}
export function calculateClothingFitOffset(
  ...args: Parameters<SpatialUISystem['calculateClothingFitOffset']>
): ReturnType<SpatialUISystem['calculateClothingFitOffset']> {
  return getActiveSpatialUISystem().calculateClothingFitOffset(...args);
}
export function calculateClothingBodyDistance(
  ...args: Parameters<SpatialUISystem['calculateClothingBodyDistance']>
): ReturnType<SpatialUISystem['calculateClothingBodyDistance']> {
  return getActiveSpatialUISystem().calculateClothingBodyDistance(...args);
}
export function calculateClothingPenetration(
  ...args: Parameters<SpatialUISystem['calculateClothingPenetration']>
): ReturnType<SpatialUISystem['calculateClothingPenetration']> {
  return getActiveSpatialUISystem().calculateClothingPenetration(...args);
}
export function calculateClothingCollision(
  ...args: Parameters<SpatialUISystem['calculateClothingCollision']>
): ReturnType<SpatialUISystem['calculateClothingCollision']> {
  return getActiveSpatialUISystem().calculateClothingCollision(...args);
}
export function calculateClothingDeformation(
  ...args: Parameters<SpatialUISystem['calculateClothingDeformation']>
): ReturnType<SpatialUISystem['calculateClothingDeformation']> {
  return getActiveSpatialUISystem().calculateClothingDeformation(...args);
}
export function calculateClothingWrinkleCurvature(
  ...args: Parameters<SpatialUISystem['calculateClothingWrinkleCurvature']>
): ReturnType<SpatialUISystem['calculateClothingWrinkleCurvature']> {
  return getActiveSpatialUISystem().calculateClothingWrinkleCurvature(...args);
}
export function calculateClothingCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateClothingCenterOfMass']>
): ReturnType<SpatialUISystem['calculateClothingCenterOfMass']> {
  return getActiveSpatialUISystem().calculateClothingCenterOfMass(...args);
}
export function calculateClothingBoundingBox(
  ...args: Parameters<SpatialUISystem['calculateClothingBoundingBox']>
): ReturnType<SpatialUISystem['calculateClothingBoundingBox']> {
  return getActiveSpatialUISystem().calculateClothingBoundingBox(...args);
}
export function getHelmetPosition(
  ...args: Parameters<SpatialUISystem['getHelmetPosition']>
): ReturnType<SpatialUISystem['getHelmetPosition']> {
  return getActiveSpatialUISystem().getHelmetPosition(...args);
}
export function getHelmetAnchor(
  ...args: Parameters<SpatialUISystem['getHelmetAnchor']>
): ReturnType<SpatialUISystem['getHelmetAnchor']> {
  return getActiveSpatialUISystem().getHelmetAnchor(...args);
}
export function calculateHelmetHeadOffset(
  ...args: Parameters<SpatialUISystem['calculateHelmetHeadOffset']>
): ReturnType<SpatialUISystem['calculateHelmetHeadOffset']> {
  return getActiveSpatialUISystem().calculateHelmetHeadOffset(...args);
}
export function calculateHelmetOrientation(
  ...args: Parameters<SpatialUISystem['calculateHelmetOrientation']>
): ReturnType<SpatialUISystem['calculateHelmetOrientation']> {
  return getActiveSpatialUISystem().calculateHelmetOrientation(...args);
}
export function calculateHelmetCollision(
  ...args: Parameters<SpatialUISystem['calculateHelmetCollision']>
): ReturnType<SpatialUISystem['calculateHelmetCollision']> {
  return getActiveSpatialUISystem().calculateHelmetCollision(...args);
}
export function getGlassesPosition(
  ...args: Parameters<SpatialUISystem['getGlassesPosition']>
): ReturnType<SpatialUISystem['getGlassesPosition']> {
  return getActiveSpatialUISystem().getGlassesPosition(...args);
}
export function calculateGlassesEyeAlignment(
  ...args: Parameters<SpatialUISystem['calculateGlassesEyeAlignment']>
): ReturnType<SpatialUISystem['calculateGlassesEyeAlignment']> {
  return getActiveSpatialUISystem().calculateGlassesEyeAlignment(...args);
}
export function calculateGlassesHeadOffset(
  ...args: Parameters<SpatialUISystem['calculateGlassesHeadOffset']>
): ReturnType<SpatialUISystem['calculateGlassesHeadOffset']> {
  return getActiveSpatialUISystem().calculateGlassesHeadOffset(...args);
}
export function getBackpackPosition(
  ...args: Parameters<SpatialUISystem['getBackpackPosition']>
): ReturnType<SpatialUISystem['getBackpackPosition']> {
  return getActiveSpatialUISystem().getBackpackPosition(...args);
}
export function calculateBackpackSpineOffset(
  ...args: Parameters<SpatialUISystem['calculateBackpackSpineOffset']>
): ReturnType<SpatialUISystem['calculateBackpackSpineOffset']> {
  return getActiveSpatialUISystem().calculateBackpackSpineOffset(...args);
}
export function calculateBackpackCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateBackpackCenterOfMass']>
): ReturnType<SpatialUISystem['calculateBackpackCenterOfMass']> {
  return getActiveSpatialUISystem().calculateBackpackCenterOfMass(...args);
}
export function calculateBackpackSwing(
  ...args: Parameters<SpatialUISystem['calculateBackpackSwing']>
): ReturnType<SpatialUISystem['calculateBackpackSwing']> {
  return getActiveSpatialUISystem().calculateBackpackSwing(...args);
}
export function getWeaponPosition(
  ...args: Parameters<SpatialUISystem['getWeaponPosition']>
): ReturnType<SpatialUISystem['getWeaponPosition']> {
  return getActiveSpatialUISystem().getWeaponPosition(...args);
}
export function getWeaponGripPosition(
  ...args: Parameters<SpatialUISystem['getWeaponGripPosition']>
): ReturnType<SpatialUISystem['getWeaponGripPosition']> {
  return getActiveSpatialUISystem().getWeaponGripPosition(...args);
}
export function getWeaponMuzzlePosition(
  ...args: Parameters<SpatialUISystem['getWeaponMuzzlePosition']>
): ReturnType<SpatialUISystem['getWeaponMuzzlePosition']> {
  return getActiveSpatialUISystem().getWeaponMuzzlePosition(...args);
}
export function getWeaponStockPosition(
  ...args: Parameters<SpatialUISystem['getWeaponStockPosition']>
): ReturnType<SpatialUISystem['getWeaponStockPosition']> {
  return getActiveSpatialUISystem().getWeaponStockPosition(...args);
}
export function calculateWeaponAimDirection(
  ...args: Parameters<SpatialUISystem['calculateWeaponAimDirection']>
): ReturnType<SpatialUISystem['calculateWeaponAimDirection']> {
  return getActiveSpatialUISystem().calculateWeaponAimDirection(...args);
}
export function calculateWeaponHandAlignment(
  ...args: Parameters<SpatialUISystem['calculateWeaponHandAlignment']>
): ReturnType<SpatialUISystem['calculateWeaponHandAlignment']> {
  return getActiveSpatialUISystem().calculateWeaponHandAlignment(...args);
}
export function calculateWeaponRecoilOffset(
  ...args: Parameters<SpatialUISystem['calculateWeaponRecoilOffset']>
): ReturnType<SpatialUISystem['calculateWeaponRecoilOffset']> {
  return getActiveSpatialUISystem().calculateWeaponRecoilOffset(...args);
}
export function calculateWeaponRecoilRotation(
  ...args: Parameters<SpatialUISystem['calculateWeaponRecoilRotation']>
): ReturnType<SpatialUISystem['calculateWeaponRecoilRotation']> {
  return getActiveSpatialUISystem().calculateWeaponRecoilRotation(...args);
}
export function calculateWeaponMuzzleDirection(
  ...args: Parameters<SpatialUISystem['calculateWeaponMuzzleDirection']>
): ReturnType<SpatialUISystem['calculateWeaponMuzzleDirection']> {
  return getActiveSpatialUISystem().calculateWeaponMuzzleDirection(...args);
}
export function calculateWeaponCollision(
  ...args: Parameters<SpatialUISystem['calculateWeaponCollision']>
): ReturnType<SpatialUISystem['calculateWeaponCollision']> {
  return getActiveSpatialUISystem().calculateWeaponCollision(...args);
}
export function getShieldPosition(
  ...args: Parameters<SpatialUISystem['getShieldPosition']>
): ReturnType<SpatialUISystem['getShieldPosition']> {
  return getActiveSpatialUISystem().getShieldPosition(...args);
}
export function getShieldCenter(
  ...args: Parameters<SpatialUISystem['getShieldCenter']>
): ReturnType<SpatialUISystem['getShieldCenter']> {
  return getActiveSpatialUISystem().getShieldCenter(...args);
}
export function calculateShieldOrientation(
  ...args: Parameters<SpatialUISystem['calculateShieldOrientation']>
): ReturnType<SpatialUISystem['calculateShieldOrientation']> {
  return getActiveSpatialUISystem().calculateShieldOrientation(...args);
}
export function calculateShieldSurfaceNormal(
  ...args: Parameters<SpatialUISystem['calculateShieldSurfaceNormal']>
): ReturnType<SpatialUISystem['calculateShieldSurfaceNormal']> {
  return getActiveSpatialUISystem().calculateShieldSurfaceNormal(...args);
}
export function calculateShieldCoverageAngle(
  ...args: Parameters<SpatialUISystem['calculateShieldCoverageAngle']>
): ReturnType<SpatialUISystem['calculateShieldCoverageAngle']> {
  return getActiveSpatialUISystem().calculateShieldCoverageAngle(...args);
}
export function calculateShieldCollision(
  ...args: Parameters<SpatialUISystem['calculateShieldCollision']>
): ReturnType<SpatialUISystem['calculateShieldCollision']> {
  return getActiveSpatialUISystem().calculateShieldCollision(...args);
}
export function getVehiclePosition(
  ...args: Parameters<SpatialUISystem['getVehiclePosition']>
): ReturnType<SpatialUISystem['getVehiclePosition']> {
  return getActiveSpatialUISystem().getVehiclePosition(...args);
}
export function getVehicleCenter(
  ...args: Parameters<SpatialUISystem['getVehicleCenter']>
): ReturnType<SpatialUISystem['getVehicleCenter']> {
  return getActiveSpatialUISystem().getVehicleCenter(...args);
}
export function getVehicleFrontPosition(
  ...args: Parameters<SpatialUISystem['getVehicleFrontPosition']>
): ReturnType<SpatialUISystem['getVehicleFrontPosition']> {
  return getActiveSpatialUISystem().getVehicleFrontPosition(...args);
}
export function getVehicleRearPosition(
  ...args: Parameters<SpatialUISystem['getVehicleRearPosition']>
): ReturnType<SpatialUISystem['getVehicleRearPosition']> {
  return getActiveSpatialUISystem().getVehicleRearPosition(...args);
}
export function getVehicleLeftPosition(
  ...args: Parameters<SpatialUISystem['getVehicleLeftPosition']>
): ReturnType<SpatialUISystem['getVehicleLeftPosition']> {
  return getActiveSpatialUISystem().getVehicleLeftPosition(...args);
}
export function getVehicleRightPosition(
  ...args: Parameters<SpatialUISystem['getVehicleRightPosition']>
): ReturnType<SpatialUISystem['getVehicleRightPosition']> {
  return getActiveSpatialUISystem().getVehicleRightPosition(...args);
}
export function getVehicleRoofPosition(
  ...args: Parameters<SpatialUISystem['getVehicleRoofPosition']>
): ReturnType<SpatialUISystem['getVehicleRoofPosition']> {
  return getActiveSpatialUISystem().getVehicleRoofPosition(...args);
}
export function getVehicleUndersidePosition(
  ...args: Parameters<SpatialUISystem['getVehicleUndersidePosition']>
): ReturnType<SpatialUISystem['getVehicleUndersidePosition']> {
  return getActiveSpatialUISystem().getVehicleUndersidePosition(...args);
}
export function getVehicleWheelPosition(
  ...args: Parameters<SpatialUISystem['getVehicleWheelPosition']>
): ReturnType<SpatialUISystem['getVehicleWheelPosition']> {
  return getActiveSpatialUISystem().getVehicleWheelPosition(...args);
}
export function getVehicleAxlePosition(
  ...args: Parameters<SpatialUISystem['getVehicleAxlePosition']>
): ReturnType<SpatialUISystem['getVehicleAxlePosition']> {
  return getActiveSpatialUISystem().getVehicleAxlePosition(...args);
}
export function calculateVehicleLength(
  ...args: Parameters<SpatialUISystem['calculateVehicleLength']>
): ReturnType<SpatialUISystem['calculateVehicleLength']> {
  return getActiveSpatialUISystem().calculateVehicleLength(...args);
}
export function calculateVehicleWidth(
  ...args: Parameters<SpatialUISystem['calculateVehicleWidth']>
): ReturnType<SpatialUISystem['calculateVehicleWidth']> {
  return getActiveSpatialUISystem().calculateVehicleWidth(...args);
}
export function calculateVehicleHeight(
  ...args: Parameters<SpatialUISystem['calculateVehicleHeight']>
): ReturnType<SpatialUISystem['calculateVehicleHeight']> {
  return getActiveSpatialUISystem().calculateVehicleHeight(...args);
}
export function calculateVehicleWheelbase(
  ...args: Parameters<SpatialUISystem['calculateVehicleWheelbase']>
): ReturnType<SpatialUISystem['calculateVehicleWheelbase']> {
  return getActiveSpatialUISystem().calculateVehicleWheelbase(...args);
}
export function calculateVehicleTrackWidth(
  ...args: Parameters<SpatialUISystem['calculateVehicleTrackWidth']>
): ReturnType<SpatialUISystem['calculateVehicleTrackWidth']> {
  return getActiveSpatialUISystem().calculateVehicleTrackWidth(...args);
}
export function calculateVehicleTurningRadius(
  ...args: Parameters<SpatialUISystem['calculateVehicleTurningRadius']>
): ReturnType<SpatialUISystem['calculateVehicleTurningRadius']> {
  return getActiveSpatialUISystem().calculateVehicleTurningRadius(...args);
}
export function calculateVehicleTurningAngle(
  ...args: Parameters<SpatialUISystem['calculateVehicleTurningAngle']>
): ReturnType<SpatialUISystem['calculateVehicleTurningAngle']> {
  return getActiveSpatialUISystem().calculateVehicleTurningAngle(...args);
}
export function calculateVehicleSpeed(
  ...args: Parameters<SpatialUISystem['calculateVehicleSpeed']>
): ReturnType<SpatialUISystem['calculateVehicleSpeed']> {
  return getActiveSpatialUISystem().calculateVehicleSpeed(...args);
}
export function calculateVehicleAcceleration(
  ...args: Parameters<SpatialUISystem['calculateVehicleAcceleration']>
): ReturnType<SpatialUISystem['calculateVehicleAcceleration']> {
  return getActiveSpatialUISystem().calculateVehicleAcceleration(...args);
}
export function calculateVehicleBrakingDistance(
  ...args: Parameters<SpatialUISystem['calculateVehicleBrakingDistance']>
): ReturnType<SpatialUISystem['calculateVehicleBrakingDistance']> {
  return getActiveSpatialUISystem().calculateVehicleBrakingDistance(...args);
}
export function calculateVehicleStoppingTime(
  ...args: Parameters<SpatialUISystem['calculateVehicleStoppingTime']>
): ReturnType<SpatialUISystem['calculateVehicleStoppingTime']> {
  return getActiveSpatialUISystem().calculateVehicleStoppingTime(...args);
}
export function calculateVehicleHeading(
  ...args: Parameters<SpatialUISystem['calculateVehicleHeading']>
): ReturnType<SpatialUISystem['calculateVehicleHeading']> {
  return getActiveSpatialUISystem().calculateVehicleHeading(...args);
}
export function calculateVehicleYawRate(
  ...args: Parameters<SpatialUISystem['calculateVehicleYawRate']>
): ReturnType<SpatialUISystem['calculateVehicleYawRate']> {
  return getActiveSpatialUISystem().calculateVehicleYawRate(...args);
}
export function calculateVehiclePitchAngle(
  ...args: Parameters<SpatialUISystem['calculateVehiclePitchAngle']>
): ReturnType<SpatialUISystem['calculateVehiclePitchAngle']> {
  return getActiveSpatialUISystem().calculateVehiclePitchAngle(...args);
}
export function calculateVehicleRollAngle(
  ...args: Parameters<SpatialUISystem['calculateVehicleRollAngle']>
): ReturnType<SpatialUISystem['calculateVehicleRollAngle']> {
  return getActiveSpatialUISystem().calculateVehicleRollAngle(...args);
}
export function calculateVehicleGroundClearance(
  ...args: Parameters<SpatialUISystem['calculateVehicleGroundClearance']>
): ReturnType<SpatialUISystem['calculateVehicleGroundClearance']> {
  return getActiveSpatialUISystem().calculateVehicleGroundClearance(...args);
}
export function calculateVehicleCenterOfMass(
  ...args: Parameters<SpatialUISystem['calculateVehicleCenterOfMass']>
): ReturnType<SpatialUISystem['calculateVehicleCenterOfMass']> {
  return getActiveSpatialUISystem().calculateVehicleCenterOfMass(...args);
}
export function calculateVehicleCollisionBounds(
  ...args: Parameters<SpatialUISystem['calculateVehicleCollisionBounds']>
): ReturnType<SpatialUISystem['calculateVehicleCollisionBounds']> {
  return getActiveSpatialUISystem().calculateVehicleCollisionBounds(...args);
}
export function calculateVehiclePathCurvature(
  ...args: Parameters<SpatialUISystem['calculateVehiclePathCurvature']>
): ReturnType<SpatialUISystem['calculateVehiclePathCurvature']> {
  return getActiveSpatialUISystem().calculateVehiclePathCurvature(...args);
}
export function calculateVehicleWheelRotation(
  ...args: Parameters<SpatialUISystem['calculateVehicleWheelRotation']>
): ReturnType<SpatialUISystem['calculateVehicleWheelRotation']> {
  return getActiveSpatialUISystem().calculateVehicleWheelRotation(...args);
}
export function getBuildingPosition(
  ...args: Parameters<SpatialUISystem['getBuildingPosition']>
): ReturnType<SpatialUISystem['getBuildingPosition']> {
  return getActiveSpatialUISystem().getBuildingPosition(...args);
}
export function getBuildingCenter(
  ...args: Parameters<SpatialUISystem['getBuildingCenter']>
): ReturnType<SpatialUISystem['getBuildingCenter']> {
  return getActiveSpatialUISystem().getBuildingCenter(...args);
}
export function getBuildingBasePosition(
  ...args: Parameters<SpatialUISystem['getBuildingBasePosition']>
): ReturnType<SpatialUISystem['getBuildingBasePosition']> {
  return getActiveSpatialUISystem().getBuildingBasePosition(...args);
}
export function getBuildingTopPosition(
  ...args: Parameters<SpatialUISystem['getBuildingTopPosition']>
): ReturnType<SpatialUISystem['getBuildingTopPosition']> {
  return getActiveSpatialUISystem().getBuildingTopPosition(...args);
}
export function getBuildingCornerPosition(
  ...args: Parameters<SpatialUISystem['getBuildingCornerPosition']>
): ReturnType<SpatialUISystem['getBuildingCornerPosition']> {
  return getActiveSpatialUISystem().getBuildingCornerPosition(...args);
}
export function getWallCenter(
  ...args: Parameters<SpatialUISystem['getWallCenter']>
): ReturnType<SpatialUISystem['getWallCenter']> {
  return getActiveSpatialUISystem().getWallCenter(...args);
}
export function getWallSurfacePosition(
  ...args: Parameters<SpatialUISystem['getWallSurfacePosition']>
): ReturnType<SpatialUISystem['getWallSurfacePosition']> {
  return getActiveSpatialUISystem().getWallSurfacePosition(...args);
}
export function getWallNormal(
  ...args: Parameters<SpatialUISystem['getWallNormal']>
): ReturnType<SpatialUISystem['getWallNormal']> {
  return getActiveSpatialUISystem().getWallNormal(...args);
}
export function getFloorPosition(
  ...args: Parameters<SpatialUISystem['getFloorPosition']>
): ReturnType<SpatialUISystem['getFloorPosition']> {
  return getActiveSpatialUISystem().getFloorPosition(...args);
}
export function getCeilingPosition(
  ...args: Parameters<SpatialUISystem['getCeilingPosition']>
): ReturnType<SpatialUISystem['getCeilingPosition']> {
  return getActiveSpatialUISystem().getCeilingPosition(...args);
}
export function getDoorPosition(
  ...args: Parameters<SpatialUISystem['getDoorPosition']>
): ReturnType<SpatialUISystem['getDoorPosition']> {
  return getActiveSpatialUISystem().getDoorPosition(...args);
}
export function getDoorHandlePosition(
  ...args: Parameters<SpatialUISystem['getDoorHandlePosition']>
): ReturnType<SpatialUISystem['getDoorHandlePosition']> {
  return getActiveSpatialUISystem().getDoorHandlePosition(...args);
}
export function getWindowPosition(
  ...args: Parameters<SpatialUISystem['getWindowPosition']>
): ReturnType<SpatialUISystem['getWindowPosition']> {
  return getActiveSpatialUISystem().getWindowPosition(...args);
}
export function getStairPosition(
  ...args: Parameters<SpatialUISystem['getStairPosition']>
): ReturnType<SpatialUISystem['getStairPosition']> {
  return getActiveSpatialUISystem().getStairPosition(...args);
}
export function getRoofPosition(
  ...args: Parameters<SpatialUISystem['getRoofPosition']>
): ReturnType<SpatialUISystem['getRoofPosition']> {
  return getActiveSpatialUISystem().getRoofPosition(...args);
}
export function calculateBuildingHeight(
  ...args: Parameters<SpatialUISystem['calculateBuildingHeight']>
): ReturnType<SpatialUISystem['calculateBuildingHeight']> {
  return getActiveSpatialUISystem().calculateBuildingHeight(...args);
}
export function calculateBuildingFootprint(
  ...args: Parameters<SpatialUISystem['calculateBuildingFootprint']>
): ReturnType<SpatialUISystem['calculateBuildingFootprint']> {
  return getActiveSpatialUISystem().calculateBuildingFootprint(...args);
}
export function calculateBuildingVolume(
  ...args: Parameters<SpatialUISystem['calculateBuildingVolume']>
): ReturnType<SpatialUISystem['calculateBuildingVolume']> {
  return getActiveSpatialUISystem().calculateBuildingVolume(...args);
}
export function calculateWallLength(
  ...args: Parameters<SpatialUISystem['calculateWallLength']>
): ReturnType<SpatialUISystem['calculateWallLength']> {
  return getActiveSpatialUISystem().calculateWallLength(...args);
}
export function calculateWallHeight(
  ...args: Parameters<SpatialUISystem['calculateWallHeight']>
): ReturnType<SpatialUISystem['calculateWallHeight']> {
  return getActiveSpatialUISystem().calculateWallHeight(...args);
}
export function calculateWallThickness(
  ...args: Parameters<SpatialUISystem['calculateWallThickness']>
): ReturnType<SpatialUISystem['calculateWallThickness']> {
  return getActiveSpatialUISystem().calculateWallThickness(...args);
}
export function calculateWallSurfaceArea(
  ...args: Parameters<SpatialUISystem['calculateWallSurfaceArea']>
): ReturnType<SpatialUISystem['calculateWallSurfaceArea']> {
  return getActiveSpatialUISystem().calculateWallSurfaceArea(...args);
}
export function calculateFloorArea(
  ...args: Parameters<SpatialUISystem['calculateFloorArea']>
): ReturnType<SpatialUISystem['calculateFloorArea']> {
  return getActiveSpatialUISystem().calculateFloorArea(...args);
}
export function calculateFloorElevation(
  ...args: Parameters<SpatialUISystem['calculateFloorElevation']>
): ReturnType<SpatialUISystem['calculateFloorElevation']> {
  return getActiveSpatialUISystem().calculateFloorElevation(...args);
}
export function calculateCeilingHeight(
  ...args: Parameters<SpatialUISystem['calculateCeilingHeight']>
): ReturnType<SpatialUISystem['calculateCeilingHeight']> {
  return getActiveSpatialUISystem().calculateCeilingHeight(...args);
}
export function calculateDoorClearance(
  ...args: Parameters<SpatialUISystem['calculateDoorClearance']>
): ReturnType<SpatialUISystem['calculateDoorClearance']> {
  return getActiveSpatialUISystem().calculateDoorClearance(...args);
}
export function calculateWindowOpening(
  ...args: Parameters<SpatialUISystem['calculateWindowOpening']>
): ReturnType<SpatialUISystem['calculateWindowOpening']> {
  return getActiveSpatialUISystem().calculateWindowOpening(...args);
}
export function calculateStairRise(
  ...args: Parameters<SpatialUISystem['calculateStairRise']>
): ReturnType<SpatialUISystem['calculateStairRise']> {
  return getActiveSpatialUISystem().calculateStairRise(...args);
}
export function calculateStairTread(
  ...args: Parameters<SpatialUISystem['calculateStairTread']>
): ReturnType<SpatialUISystem['calculateStairTread']> {
  return getActiveSpatialUISystem().calculateStairTread(...args);
}
export function calculateRoofSlope(
  ...args: Parameters<SpatialUISystem['calculateRoofSlope']>
): ReturnType<SpatialUISystem['calculateRoofSlope']> {
  return getActiveSpatialUISystem().calculateRoofSlope(...args);
}
export function calculateRoomBounds(
  ...args: Parameters<SpatialUISystem['calculateRoomBounds']>
): ReturnType<SpatialUISystem['calculateRoomBounds']> {
  return getActiveSpatialUISystem().calculateRoomBounds(...args);
}
export function calculateRoomCenter(
  ...args: Parameters<SpatialUISystem['calculateRoomCenter']>
): ReturnType<SpatialUISystem['calculateRoomCenter']> {
  return getActiveSpatialUISystem().calculateRoomCenter(...args);
}
export function calculateRoomVolume(
  ...args: Parameters<SpatialUISystem['calculateRoomVolume']>
): ReturnType<SpatialUISystem['calculateRoomVolume']> {
  return getActiveSpatialUISystem().calculateRoomVolume(...args);
}
export function calculateRoomNavigationDistance(
  ...args: Parameters<SpatialUISystem['calculateRoomNavigationDistance']>
): ReturnType<SpatialUISystem['calculateRoomNavigationDistance']> {
  return getActiveSpatialUISystem().calculateRoomNavigationDistance(...args);
}
export function calculateBuildingCollision(
  ...args: Parameters<SpatialUISystem['calculateBuildingCollision']>
): ReturnType<SpatialUISystem['calculateBuildingCollision']> {
  return getActiveSpatialUISystem().calculateBuildingCollision(...args);
}
export function calculateSpatialDistanceMatrix(
  ...args: Parameters<SpatialUISystem['calculateSpatialDistanceMatrix']>
): ReturnType<SpatialUISystem['calculateSpatialDistanceMatrix']> {
  return getActiveSpatialUISystem().calculateSpatialDistanceMatrix(...args);
}
export function calculatePairwiseDistances(
  ...args: Parameters<SpatialUISystem['calculatePairwiseDistances']>
): ReturnType<SpatialUISystem['calculatePairwiseDistances']> {
  return getActiveSpatialUISystem().calculatePairwiseDistances(...args);
}
export function calculateNearestNeighborDistance(
  ...args: Parameters<SpatialUISystem['calculateNearestNeighborDistance']>
): ReturnType<SpatialUISystem['calculateNearestNeighborDistance']> {
  return getActiveSpatialUISystem().calculateNearestNeighborDistance(...args);
}
export function calculateFarthestNeighborDistance(
  ...args: Parameters<SpatialUISystem['calculateFarthestNeighborDistance']>
): ReturnType<SpatialUISystem['calculateFarthestNeighborDistance']> {
  return getActiveSpatialUISystem().calculateFarthestNeighborDistance(...args);
}
export function calculateSpatialCentroid(
  ...args: Parameters<SpatialUISystem['calculateSpatialCentroid']>
): ReturnType<SpatialUISystem['calculateSpatialCentroid']> {
  return getActiveSpatialUISystem().calculateSpatialCentroid(...args);
}
export function calculateWeightedCentroid(
  ...args: Parameters<SpatialUISystem['calculateWeightedCentroid']>
): ReturnType<SpatialUISystem['calculateWeightedCentroid']> {
  return getActiveSpatialUISystem().calculateWeightedCentroid(...args);
}
export function calculateSpatialMedian(
  ...args: Parameters<SpatialUISystem['calculateSpatialMedian']>
): ReturnType<SpatialUISystem['calculateSpatialMedian']> {
  return getActiveSpatialUISystem().calculateSpatialMedian(...args);
}
export function calculateSpatialVariance(
  ...args: Parameters<SpatialUISystem['calculateSpatialVariance']>
): ReturnType<SpatialUISystem['calculateSpatialVariance']> {
  return getActiveSpatialUISystem().calculateSpatialVariance(...args);
}
export function calculateSpatialCovariance(
  ...args: Parameters<SpatialUISystem['calculateSpatialCovariance']>
): ReturnType<SpatialUISystem['calculateSpatialCovariance']> {
  return getActiveSpatialUISystem().calculateSpatialCovariance(...args);
}
export function calculateSpatialDistribution(
  ...args: Parameters<SpatialUISystem['calculateSpatialDistribution']>
): ReturnType<SpatialUISystem['calculateSpatialDistribution']> {
  return getActiveSpatialUISystem().calculateSpatialDistribution(...args);
}
export function calculateSpatialDensity(
  ...args: Parameters<SpatialUISystem['calculateSpatialDensity']>
): ReturnType<SpatialUISystem['calculateSpatialDensity']> {
  return getActiveSpatialUISystem().calculateSpatialDensity(...args);
}
export function calculateSpatialClustering(
  ...args: Parameters<SpatialUISystem['calculateSpatialClustering']>
): ReturnType<SpatialUISystem['calculateSpatialClustering']> {
  return getActiveSpatialUISystem().calculateSpatialClustering(...args);
}
export function calculateSpatialOutliers(
  ...args: Parameters<SpatialUISystem['calculateSpatialOutliers']>
): ReturnType<SpatialUISystem['calculateSpatialOutliers']> {
  return getActiveSpatialUISystem().calculateSpatialOutliers(...args);
}
export function calculateSpatialSymmetry(
  ...args: Parameters<SpatialUISystem['calculateSpatialSymmetry']>
): ReturnType<SpatialUISystem['calculateSpatialSymmetry']> {
  return getActiveSpatialUISystem().calculateSpatialSymmetry(...args);
}
export function calculateSpatialOverlapRatio(
  ...args: Parameters<SpatialUISystem['calculateSpatialOverlapRatio']>
): ReturnType<SpatialUISystem['calculateSpatialOverlapRatio']> {
  return getActiveSpatialUISystem().calculateSpatialOverlapRatio(...args);
}
