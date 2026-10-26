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

export function calculateDistance3D(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistance3D(...args);
}
export function calculateDistance2D(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistance2D(...args);
}
export function calculateHorizontalDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHorizontalDistance(...args);
}
export function calculateVerticalDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVerticalDistance(...args);
}
export function calculateDepthDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDepthDistance(...args);
}
export function calculateEuclideanDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEuclideanDistance(...args);
}
export function calculateManhattanDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateManhattanDistance(...args);
}
export function calculateChebyshevDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateChebyshevDistance(...args);
}
export function calculateSquaredDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSquaredDistance(...args);
}
export function calculateDistanceToOrigin(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToOrigin(...args);
}
export function calculateDistanceToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToCamera(...args);
}
export function calculateDistanceToPlayer(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToPlayer(...args);
}
export function calculateDistanceToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToTarget(...args);
}
export function calculateDistanceToBone(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToBone(...args);
}
export function calculateDistanceToJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToJoint(...args);
}
export function calculateDistanceToSurface(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToSurface(...args);
}
export function calculateDistanceToCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToCenter(...args);
}
export function calculateDistanceToEdge(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToEdge(...args);
}
export function calculateDistanceToBoundary(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToBoundary(...args);
}
export function calculateDistanceToGround(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToGround(...args);
}
export function calculateDistanceToCeiling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToCeiling(...args);
}
export function calculateDistanceToWall(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToWall(...args);
}
export function calculateDistanceToNearestObject(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToNearestObject(...args);
}
export function calculateDistanceToFarthestObject(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceToFarthestObject(...args);
}
export function calculateMinimumDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMinimumDistance(...args);
}
export function calculateMaximumDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMaximumDistance(...args);
}
export function calculateAverageDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAverageDistance(...args);
}
export function calculateDistanceAlongPath(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceAlongPath(...args);
}
export function calculateDistanceAlongCurve(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceAlongCurve(...args);
}
export function calculateDistanceAlongSpline(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceAlongSpline(...args);
}
export function calculateDistanceBetweenSegments(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenSegments(...args);
}
export function calculateDistanceBetweenRays(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenRays(...args);
}
export function calculateDistanceBetweenPlanes(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenPlanes(...args);
}
export function calculateDistanceBetweenSpheres(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenSpheres(...args);
}
export function calculateDistanceBetweenBoxes(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenBoxes(...args);
}
export function calculateDistanceBetweenCapsules(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenCapsules(...args);
}
export function calculateDistanceBetweenMeshes(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenMeshes(...args);
}
export function calculateDistanceBetweenCharacters(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenCharacters(...args);
}
export function calculateDistanceBetweenBones(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenBones(...args);
}
export function calculateDistanceBetweenHands(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenHands(...args);
}
export function calculateDistanceBetweenFeet(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenFeet(...args);
}
export function calculateDistanceBetweenEyes(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenEyes(...args);
}
export function calculateDistanceBetweenShoulders(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenShoulders(...args);
}
export function calculateDistanceBetweenHips(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenHips(...args);
}
export function calculateDistanceBetweenFingers(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenFingers(...args);
}
export function calculateDistanceBetweenObjects(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenObjects(...args);
}
export function calculateDistanceBetweenTrees(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenTrees(...args);
}
export function calculateDistanceBetweenAnimals(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenAnimals(...args);
}
export function calculateDistanceBetweenNPCs(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenNPCs(...args);
}
export function calculateDistanceBetweenBosses(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceBetweenBosses(...args);
}
export function getWorldPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWorldPosition(...args);
}
export function getLocalPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLocalPosition(...args);
}
export function getParentPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getParentPosition(...args);
}
export function getRelativePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRelativePosition(...args);
}
export function getAbsolutePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAbsolutePosition(...args);
}
export function getScreenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getScreenPosition(...args);
}
export function getViewportPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getViewportPosition(...args);
}
export function getNormalizedDeviceCoordinates(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNormalizedDeviceCoordinates(...args);
}
export function getCameraSpacePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraSpacePosition(...args);
}
export function getObjectSpacePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectSpacePosition(...args);
}
export function transformLocalToWorld(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformLocalToWorld(...args);
}
export function transformWorldToLocal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformWorldToLocal(...args);
}
export function transformWorldToScreen(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformWorldToScreen(...args);
}
export function transformScreenToWorld(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformScreenToWorld(...args);
}
export function transformCameraToWorld(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformCameraToWorld(...args);
}
export function transformWorldToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).transformWorldToCamera(...args);
}
export function calculatePositionOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePositionOffset(...args);
}
export function calculateRelativeOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRelativeOffset(...args);
}
export function calculateWorldOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWorldOffset(...args);
}
export function calculateLocalOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLocalOffset(...args);
}
export function calculatePositionDelta(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePositionDelta(...args);
}
export function calculateVelocityVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVelocityVector(...args);
}
export function calculateAccelerationVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAccelerationVector(...args);
}
export function calculateDirectionVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDirectionVector(...args);
}
export function calculateNormalizedDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNormalizedDirection(...args);
}
export function calculateForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForwardVector(...args);
}
export function calculateBackwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBackwardVector(...args);
}
export function calculateRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRightVector(...args);
}
export function calculateLeftVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeftVector(...args);
}
export function calculateUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpVector(...args);
}
export function calculateDownVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDownVector(...args);
}
export function calculateLookDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLookDirection(...args);
}
export function calculateAimDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAimDirection(...args);
}
export function calculateMovementDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMovementDirection(...args);
}
export function calculateSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSurfaceNormal(...args);
}
export function calculateTangentVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTangentVector(...args);
}
export function calculateBitangentVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBitangentVector(...args);
}
export function calculateCrossProduct(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCrossProduct(...args);
}
export function calculateDotProduct(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDotProduct(...args);
}
export function calculateVectorMagnitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVectorMagnitude(...args);
}
export function normalizeVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).normalizeVector(...args);
}
export function projectVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).projectVector(...args);
}
export function reflectVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).reflectVector(...args);
}
export function refractVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).refractVector(...args);
}
export function lerpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).lerpVector(...args);
}
export function slerpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).slerpVector(...args);
}
export function clampVectorMagnitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).clampVectorMagnitude(...args);
}
export function calculateVectorAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVectorAngle(...args);
}
export function calculateVectorProjection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVectorProjection(...args);
}
export function calculateVectorRejection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVectorRejection(...args);
}
export function calculateEulerAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEulerAngles(...args);
}
export function calculateYaw(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateYaw(...args);
}
export function calculatePitch(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePitch(...args);
}
export function calculateRoll(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoll(...args);
}
export function calculateAngleBetweenPoints(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngleBetweenPoints(...args);
}
export function calculateAngleBetweenVectors(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngleBetweenVectors(...args);
}
export function calculateAngleToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngleToTarget(...args);
}
export function calculateAngleToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngleToCamera(...args);
}
export function calculateAngleToGround(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngleToGround(...args);
}
export function calculateSignedAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSignedAngle(...args);
}
export function calculateUnsignedAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUnsignedAngle(...args);
}
export function calculateAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngularVelocity(...args);
}
export function calculateAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngularAcceleration(...args);
}
export function calculateAngularDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngularDistance(...args);
}
export function calculateAngularDifference(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngularDifference(...args);
}
export function normalizeAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).normalizeAngle(...args);
}
export function clampAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).clampAngle(...args);
}
export function interpolateAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).interpolateAngle(...args);
}
export function calculateRotationMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationMatrix(...args);
}
export function calculateInverseRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateInverseRotation(...args);
}
export function calculateQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateQuaternion(...args);
}
export function normalizeQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).normalizeQuaternion(...args);
}
export function multiplyQuaternions(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).multiplyQuaternions(...args);
}
export function invertQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).invertQuaternion(...args);
}
export function slerpQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).slerpQuaternion(...args);
}
export function nlerpQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).nlerpQuaternion(...args);
}
export function quaternionToEuler(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).quaternionToEuler(...args);
}
export function eulerToQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).eulerToQuaternion(...args);
}
export function quaternionToMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).quaternionToMatrix(...args);
}
export function matrixToQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).matrixToQuaternion(...args);
}
export function calculateLookAtRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLookAtRotation(...args);
}
export function calculateLookAtQuaternion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLookAtQuaternion(...args);
}
export function calculateRotationAroundAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationAroundAxis(...args);
}
export function calculateRotationBetweenVectors(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationBetweenVectors(...args);
}
export function calculateRelativeRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRelativeRotation(...args);
}
export function calculateWorldRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWorldRotation(...args);
}
export function calculateLocalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLocalRotation(...args);
}
export function calculateBoneRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneRotation(...args);
}
export function calculateJointRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointRotation(...args);
}
export function calculateHeadRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadRotation(...args);
}
export function calculateHandRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandRotation(...args);
}
export function calculateFootRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootRotation(...args);
}
export function calculateShoulderRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderRotation(...args);
}
export function calculateHipRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipRotation(...args);
}
export function calculateWristRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristRotation(...args);
}
export function calculateElbowRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowRotation(...args);
}
export function calculateKneeRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeRotation(...args);
}
export function calculateSpineRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpineRotation(...args);
}
export function calculateTailRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTailRotation(...args);
}
export function calculateWingRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWingRotation(...args);
}
export function getHeadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadPosition(...args);
}
export function getHeadCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadCenter(...args);
}
export function getHeadTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadTopPosition(...args);
}
export function getHeadBottomPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadBottomPosition(...args);
}
export function getHeadFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadFrontPosition(...args);
}
export function getHeadBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadBackPosition(...args);
}
export function getHeadLeftPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadLeftPosition(...args);
}
export function getHeadRightPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadRightPosition(...args);
}
export function getHeadForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadForwardVector(...args);
}
export function getHeadUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadUpVector(...args);
}
export function getHeadRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeadRightVector(...args);
}
export function calculateHeadCenterOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadCenterOffset(...args);
}
export function calculateHeadBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadBoundingBox(...args);
}
export function calculateHeadBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadBoundingSphere(...args);
}
export function calculateHeadOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadOrientation(...args);
}
export function calculateHeadLookDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadLookDirection(...args);
}
export function calculateHeadAimDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadAimDirection(...args);
}
export function calculateHeadTilt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadTilt(...args);
}
export function calculateHeadYaw(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadYaw(...args);
}
export function calculateHeadPitch(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadPitch(...args);
}
export function calculateHeadRoll(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadRoll(...args);
}
export function getFaceCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFaceCenter(...args);
}
export function getForeheadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getForeheadPosition(...args);
}
export function getChinPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getChinPosition(...args);
}
export function getJawPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJawPosition(...args);
}
export function getLeftEyePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftEyePosition(...args);
}
export function getRightEyePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightEyePosition(...args);
}
export function getLeftPupilPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftPupilPosition(...args);
}
export function getRightPupilPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightPupilPosition(...args);
}
export function getNosePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNosePosition(...args);
}
export function getNoseTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNoseTipPosition(...args);
}
export function getMouthCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMouthCenter(...args);
}
export function getUpperLipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getUpperLipPosition(...args);
}
export function getLowerLipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLowerLipPosition(...args);
}
export function getLeftEarPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftEarPosition(...args);
}
export function getRightEarPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightEarPosition(...args);
}
export function getLeftEyebrowPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftEyebrowPosition(...args);
}
export function getRightEyebrowPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightEyebrowPosition(...args);
}
export function getLeftCheekPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftCheekPosition(...args);
}
export function getRightCheekPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightCheekPosition(...args);
}
export function calculateEyeDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEyeDistance(...args);
}
export function calculateEyeGazeDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEyeGazeDirection(...args);
}
export function calculatePupilOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePupilOffset(...args);
}
export function calculateFaceOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFaceOrientation(...args);
}
export function calculateFaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFaceNormal(...args);
}
export function calculateFaceSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFaceSymmetry(...args);
}
export function calculateMouthOpening(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMouthOpening(...args);
}
export function calculateJawOpeningAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJawOpeningAngle(...args);
}
export function calculateBlinkAmount(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBlinkAmount(...args);
}
export function calculateFacialLandmarkDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFacialLandmarkDistance(...args);
}
export function getNeckPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckPosition(...args);
}
export function getNeckCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckCenter(...args);
}
export function getNeckBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckBasePosition(...args);
}
export function getNeckTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckTopPosition(...args);
}
export function getNeckForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckForwardVector(...args);
}
export function getNeckUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNeckUpVector(...args);
}
export function calculateNeckLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckLength(...args);
}
export function calculateNeckOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckOrientation(...args);
}
export function calculateNeckBendAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckBendAngle(...args);
}
export function calculateNeckTwistAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckTwistAngle(...args);
}
export function calculateNeckCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckCurvature(...args);
}
export function calculateNeckToHeadDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckToHeadDistance(...args);
}
export function calculateNeckToShoulderDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckToShoulderDistance(...args);
}
export function calculateNeckBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckBoundingBox(...args);
}
export function calculateNeckJointRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNeckJointRotation(...args);
}
export function getLeftShoulderPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShoulderPosition(...args);
}
export function getRightShoulderPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShoulderPosition(...args);
}
export function getShoulderCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getShoulderCenter(...args);
}
export function getLeftShoulderTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShoulderTip(...args);
}
export function getRightShoulderTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShoulderTip(...args);
}
export function getLeftClaviclePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftClaviclePosition(...args);
}
export function getRightClaviclePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightClaviclePosition(...args);
}
export function getLeftScapulaPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftScapulaPosition(...args);
}
export function getRightScapulaPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightScapulaPosition(...args);
}
export function calculateShoulderWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderWidth(...args);
}
export function calculateShoulderHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderHeight(...args);
}
export function calculateShoulderSlope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderSlope(...args);
}
export function calculateShoulderSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderSymmetry(...args);
}
export function calculateShoulderDistanceToHead(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderDistanceToHead(...args);
}
export function calculateShoulderDistanceToHip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderDistanceToHip(...args);
}
export function calculateShoulderToShoulderVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderToShoulderVector(...args);
}
export function calculateShoulderForwardDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderForwardDirection(...args);
}
export function calculateShoulderUpDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderUpDirection(...args);
}
export function calculateShoulderJointAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderJointAngle(...args);
}
export function calculateShoulderAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderAbduction(...args);
}
export function calculateShoulderAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderAdduction(...args);
}
export function calculateShoulderFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderFlexion(...args);
}
export function calculateShoulderExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderExtension(...args);
}
export function calculateShoulderInternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderInternalRotation(...args);
}
export function calculateShoulderExternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderExternalRotation(...args);
}
export function calculateShoulderBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderBoundingBox(...args);
}
export function calculateShoulderCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderCenterOfMass(...args);
}
export function calculateClavicleLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClavicleLength(...args);
}
export function calculateScapulaOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScapulaOrientation(...args);
}
export function calculateShoulderToElbowDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderToElbowDistance(...args);
}
export function calculateShoulderToWristDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderToWristDistance(...args);
}
export function calculateShoulderToHandDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderToHandDistance(...args);
}
export function calculateShoulderMotionVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderMotionVector(...args);
}
export function calculateShoulderVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderVelocity(...args);
}
export function calculateShoulderAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShoulderAcceleration(...args);
}
export function getLeftUpperArmPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftUpperArmPosition(...args);
}
export function getRightUpperArmPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightUpperArmPosition(...args);
}
export function getLeftUpperArmCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftUpperArmCenter(...args);
}
export function getRightUpperArmCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightUpperArmCenter(...args);
}
export function getLeftUpperArmStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftUpperArmStart(...args);
}
export function getRightUpperArmStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightUpperArmStart(...args);
}
export function getLeftUpperArmEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftUpperArmEnd(...args);
}
export function getRightUpperArmEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightUpperArmEnd(...args);
}
export function calculateUpperArmLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmLength(...args);
}
export function calculateUpperArmDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmDirection(...args);
}
export function calculateUpperArmOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmOrientation(...args);
}
export function calculateUpperArmAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmAngle(...args);
}
export function calculateUpperArmVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmVelocity(...args);
}
export function calculateUpperArmAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmAcceleration(...args);
}
export function calculateUpperArmBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmBoundingBox(...args);
}
export function calculateUpperArmRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmRadius(...args);
}
export function calculateUpperArmVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmVolume(...args);
}
export function calculateUpperArmSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmSurfaceArea(...args);
}
export function calculateUpperArmCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmCenterOfMass(...args);
}
export function calculateUpperArmToTorsoDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUpperArmToTorsoDistance(...args);
}
export function getLeftElbowPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftElbowPosition(...args);
}
export function getRightElbowPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightElbowPosition(...args);
}
export function getLeftElbowCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftElbowCenter(...args);
}
export function getRightElbowCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightElbowCenter(...args);
}
export function getLeftElbowTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftElbowTip(...args);
}
export function getRightElbowTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightElbowTip(...args);
}
export function calculateElbowToShoulderDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowToShoulderDistance(...args);
}
export function calculateElbowToWristDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowToWristDistance(...args);
}
export function calculateElbowToHandDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowToHandDistance(...args);
}
export function calculateElbowBendAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowBendAngle(...args);
}
export function calculateElbowExtensionAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowExtensionAngle(...args);
}
export function calculateElbowFlexionAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowFlexionAngle(...args);
}
export function calculateElbowTwistAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowTwistAngle(...args);
}
export function calculateElbowJointAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowJointAxis(...args);
}
export function calculateElbowJointNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowJointNormal(...args);
}
export function calculateElbowVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowVelocity(...args);
}
export function calculateElbowAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowAcceleration(...args);
}
export function calculateElbowBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowBoundingBox(...args);
}
export function calculateElbowBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowBoundingSphere(...args);
}
export function calculateElbowSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateElbowSymmetry(...args);
}
export function calculateArmReachDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmReachDistance(...args);
}
export function calculateArmReachDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmReachDirection(...args);
}
export function calculateArmReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmReachEnvelope(...args);
}
export function calculateArmSweepAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmSweepAngle(...args);
}
export function calculateArmSwingAmplitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmSwingAmplitude(...args);
}
export function calculateArmPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmPoseError(...args);
}
export function calculateArmSegmentAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmSegmentAlignment(...args);
}
export function calculateArmJointChainLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmJointChainLength(...args);
}
export function calculateArmEndEffectorPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmEndEffectorPosition(...args);
}
export function calculateArmInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateArmInverseKinematics(...args);
}
export function getLeftForearmPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftForearmPosition(...args);
}
export function getRightForearmPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightForearmPosition(...args);
}
export function getLeftForearmCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftForearmCenter(...args);
}
export function getRightForearmCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightForearmCenter(...args);
}
export function getLeftForearmStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftForearmStart(...args);
}
export function getRightForearmStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightForearmStart(...args);
}
export function getLeftForearmEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftForearmEnd(...args);
}
export function getRightForearmEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightForearmEnd(...args);
}
export function calculateForearmLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmLength(...args);
}
export function calculateForearmDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmDirection(...args);
}
export function calculateForearmOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmOrientation(...args);
}
export function calculateForearmAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmAngle(...args);
}
export function calculateForearmVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmVelocity(...args);
}
export function calculateForearmAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmAcceleration(...args);
}
export function calculateForearmBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmBoundingBox(...args);
}
export function calculateForearmRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmRadius(...args);
}
export function calculateForearmVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmVolume(...args);
}
export function calculateForearmSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmSurfaceArea(...args);
}
export function calculateForearmCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmCenterOfMass(...args);
}
export function calculateForearmTwist(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForearmTwist(...args);
}
export function getLeftWristPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftWristPosition(...args);
}
export function getRightWristPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightWristPosition(...args);
}
export function getLeftWristCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftWristCenter(...args);
}
export function getRightWristCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightWristCenter(...args);
}
export function getLeftWristJointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftWristJointPosition(...args);
}
export function getRightWristJointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightWristJointPosition(...args);
}
export function getLeftWristFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftWristFrontPosition(...args);
}
export function getRightWristFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightWristFrontPosition(...args);
}
export function getLeftWristBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftWristBackPosition(...args);
}
export function getRightWristBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightWristBackPosition(...args);
}
export function calculateWristToElbowDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristToElbowDistance(...args);
}
export function calculateWristToPalmDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristToPalmDistance(...args);
}
export function calculateWristWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristWidth(...args);
}
export function calculateWristThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristThickness(...args);
}
export function calculateWristFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristFlexion(...args);
}
export function calculateWristExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristExtension(...args);
}
export function calculateWristAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristAbduction(...args);
}
export function calculateWristAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristAdduction(...args);
}
export function calculateWristPronation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristPronation(...args);
}
export function calculateWristSupination(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristSupination(...args);
}
export function calculateWristJointAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristJointAxis(...args);
}
export function calculateWristJointNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristJointNormal(...args);
}
export function calculateWristVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristVelocity(...args);
}
export function calculateWristAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristAcceleration(...args);
}
export function calculateWristBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristBoundingBox(...args);
}
export function calculateWristBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristBoundingSphere(...args);
}
export function calculateWristTrajectory(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristTrajectory(...args);
}
export function calculateWristMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristMotionSmoothness(...args);
}
export function calculateWristPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristPoseError(...args);
}
export function calculateWristTargetOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWristTargetOffset(...args);
}
export function getLeftHandPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftHandPosition(...args);
}
export function getRightHandPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightHandPosition(...args);
}
export function getLeftHandCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftHandCenter(...args);
}
export function getRightHandCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightHandCenter(...args);
}
export function getPalmCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmCenter(...args);
}
export function getPalmBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmBasePosition(...args);
}
export function getPalmTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmTopPosition(...args);
}
export function getPalmLeftEdge(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmLeftEdge(...args);
}
export function getPalmRightEdge(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmRightEdge(...args);
}
export function getPalmFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmFrontPosition(...args);
}
export function getPalmBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmBackPosition(...args);
}
export function getPalmNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmNormal(...args);
}
export function getPalmForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmForwardVector(...args);
}
export function getPalmUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmUpVector(...args);
}
export function getPalmRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPalmRightVector(...args);
}
export function calculatePalmWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmWidth(...args);
}
export function calculatePalmLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmLength(...args);
}
export function calculatePalmThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmThickness(...args);
}
export function calculatePalmArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmArea(...args);
}
export function calculatePalmVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmVolume(...args);
}
export function calculatePalmOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmOrientation(...args);
}
export function calculatePalmRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmRotation(...args);
}
export function calculatePalmTilt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmTilt(...args);
}
export function calculatePalmCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmCurvature(...args);
}
export function calculatePalmCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmCenterOfMass(...args);
}
export function calculatePalmBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmBoundingBox(...args);
}
export function calculatePalmBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmBoundingSphere(...args);
}
export function calculatePalmSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmSymmetry(...args);
}
export function calculatePalmToWristDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmToWristDistance(...args);
}
export function calculatePalmToFingerBaseDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePalmToFingerBaseDistance(...args);
}
export function calculateHandSpan(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandSpan(...args);
}
export function calculateHandWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandWidth(...args);
}
export function calculateHandLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandLength(...args);
}
export function calculateHandThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandThickness(...args);
}
export function calculateHandOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandOrientation(...args);
}
export function calculateHandForwardDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandForwardDirection(...args);
}
export function calculateHandUpDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandUpDirection(...args);
}
export function calculateHandRightDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandRightDirection(...args);
}
export function calculateHandVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandVelocity(...args);
}
export function calculateHandAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandAcceleration(...args);
}
export function calculateHandAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandAngularVelocity(...args);
}
export function calculateHandAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandAngularAcceleration(...args);
}
export function calculateHandTrajectory(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandTrajectory(...args);
}
export function calculateHandMotionDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandMotionDirection(...args);
}
export function calculateHandMotionDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandMotionDistance(...args);
}
export function calculateHandPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandPose(...args);
}
export function calculateHandPoseDifference(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandPoseDifference(...args);
}
export function calculateHandPoseSimilarity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandPoseSimilarity(...args);
}
export function calculateHandJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandJointAngles(...args);
}
export function calculateHandInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandInverseKinematics(...args);
}
export function getThumbRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbRootPosition(...args);
}
export function getThumbCMCPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbCMCPosition(...args);
}
export function getThumbMCPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbMCPPosition(...args);
}
export function getThumbIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbIPPosition(...args);
}
export function getThumbTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbTipPosition(...args);
}
export function getThumbNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbNailPosition(...args);
}
export function getThumbPadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbPadPosition(...args);
}
export function getThumbBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbBasePosition(...args);
}
export function getThumbProximalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbProximalJoint(...args);
}
export function getThumbDistalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThumbDistalJoint(...args);
}
export function calculateThumbLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbLength(...args);
}
export function calculateThumbWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbWidth(...args);
}
export function calculateThumbThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbThickness(...args);
}
export function calculateThumbCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbCurvature(...args);
}
export function calculateThumbDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbDirection(...args);
}
export function calculateThumbOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbOrientation(...args);
}
export function calculateThumbFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbFlexion(...args);
}
export function calculateThumbExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbExtension(...args);
}
export function calculateThumbAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbAbduction(...args);
}
export function calculateThumbAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbAdduction(...args);
}
export function calculateThumbOpposition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbOpposition(...args);
}
export function calculateThumbRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbRotation(...args);
}
export function calculateThumbTipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipVelocity(...args);
}
export function calculateThumbTipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipAcceleration(...args);
}
export function calculateThumbJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbJointAngles(...args);
}
export function calculateThumbSegmentLengths(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbSegmentLengths(...args);
}
export function calculateThumbBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbBoundingBox(...args);
}
export function calculateThumbBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbBoundingSphere(...args);
}
export function calculateThumbTipDistanceToIndex(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipDistanceToIndex(...args);
}
export function calculateThumbTipDistanceToMiddle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipDistanceToMiddle(...args);
}
export function calculateThumbTipDistanceToRing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipDistanceToRing(...args);
}
export function calculateThumbTipDistanceToLittle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbTipDistanceToLittle(...args);
}
export function calculateThumbPinchDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbPinchDistance(...args);
}
export function calculateThumbPinchStrength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbPinchStrength(...args);
}
export function calculateThumbReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbReachEnvelope(...args);
}
export function calculateThumbContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbContactPoint(...args);
}
export function calculateThumbSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbSurfaceNormal(...args);
}
export function calculateThumbPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbPoseError(...args);
}
export function calculateThumbMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbMotionSmoothness(...args);
}
export function calculateThumbCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThumbCollision(...args);
}
export function getIndexFingerRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerRootPosition(...args);
}
export function getIndexFingerMCPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerMCPPosition(...args);
}
export function getIndexFingerPIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerPIPPosition(...args);
}
export function getIndexFingerDIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerDIPPosition(...args);
}
export function getIndexFingerTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerTipPosition(...args);
}
export function getIndexFingerNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerNailPosition(...args);
}
export function getIndexFingerPadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerPadPosition(...args);
}
export function getIndexFingerBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerBasePosition(...args);
}
export function getIndexFingerProximalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerProximalJoint(...args);
}
export function getIndexFingerDistalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getIndexFingerDistalJoint(...args);
}
export function calculateIndexFingerLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerLength(...args);
}
export function calculateIndexFingerWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerWidth(...args);
}
export function calculateIndexFingerThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerThickness(...args);
}
export function calculateIndexFingerCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerCurvature(...args);
}
export function calculateIndexFingerDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerDirection(...args);
}
export function calculateIndexFingerOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerOrientation(...args);
}
export function calculateIndexFingerFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerFlexion(...args);
}
export function calculateIndexFingerExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerExtension(...args);
}
export function calculateIndexFingerAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerAbduction(...args);
}
export function calculateIndexFingerAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerAdduction(...args);
}
export function calculateIndexFingerRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerRotation(...args);
}
export function calculateIndexFingerTipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerTipVelocity(...args);
}
export function calculateIndexFingerTipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerTipAcceleration(...args);
}
export function calculateIndexFingerJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerJointAngles(...args);
}
export function calculateIndexFingerSegmentLengths(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerSegmentLengths(...args);
}
export function calculateIndexFingerBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerBoundingBox(...args);
}
export function calculateIndexFingerBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerBoundingSphere(...args);
}
export function calculateIndexToThumbDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexToThumbDistance(...args);
}
export function calculateIndexToMiddleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexToMiddleDistance(...args);
}
export function calculateIndexToRingDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexToRingDistance(...args);
}
export function calculateIndexToLittleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexToLittleDistance(...args);
}
export function calculateIndexPointingDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexPointingDirection(...args);
}
export function calculateIndexReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexReachEnvelope(...args);
}
export function calculateIndexContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexContactPoint(...args);
}
export function calculateIndexSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexSurfaceNormal(...args);
}
export function calculateIndexPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexPoseError(...args);
}
export function calculateIndexMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexMotionSmoothness(...args);
}
export function calculateIndexCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexCollision(...args);
}
export function calculateIndexFingerCurl(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerCurl(...args);
}
export function calculateIndexFingerSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIndexFingerSpread(...args);
}
export function getMiddleFingerRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerRootPosition(...args);
}
export function getMiddleFingerMCPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerMCPPosition(...args);
}
export function getMiddleFingerPIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerPIPPosition(...args);
}
export function getMiddleFingerDIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerDIPPosition(...args);
}
export function getMiddleFingerTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerTipPosition(...args);
}
export function getMiddleFingerNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerNailPosition(...args);
}
export function getMiddleFingerPadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerPadPosition(...args);
}
export function getMiddleFingerBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerBasePosition(...args);
}
export function getMiddleFingerProximalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerProximalJoint(...args);
}
export function getMiddleFingerDistalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleFingerDistalJoint(...args);
}
export function calculateMiddleFingerLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerLength(...args);
}
export function calculateMiddleFingerWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerWidth(...args);
}
export function calculateMiddleFingerThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerThickness(...args);
}
export function calculateMiddleFingerCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerCurvature(...args);
}
export function calculateMiddleFingerDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerDirection(...args);
}
export function calculateMiddleFingerOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerOrientation(...args);
}
export function calculateMiddleFingerFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerFlexion(...args);
}
export function calculateMiddleFingerExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerExtension(...args);
}
export function calculateMiddleFingerAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerAbduction(...args);
}
export function calculateMiddleFingerAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerAdduction(...args);
}
export function calculateMiddleFingerRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerRotation(...args);
}
export function calculateMiddleFingerTipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerTipVelocity(...args);
}
export function calculateMiddleFingerTipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerTipAcceleration(...args);
}
export function calculateMiddleFingerJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerJointAngles(...args);
}
export function calculateMiddleFingerSegmentLengths(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerSegmentLengths(...args);
}
export function calculateMiddleFingerBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerBoundingBox(...args);
}
export function calculateMiddleFingerBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerBoundingSphere(...args);
}
export function calculateMiddleToThumbDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleToThumbDistance(...args);
}
export function calculateMiddleToIndexDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleToIndexDistance(...args);
}
export function calculateMiddleToRingDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleToRingDistance(...args);
}
export function calculateMiddleToLittleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleToLittleDistance(...args);
}
export function calculateMiddleFingerReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerReachEnvelope(...args);
}
export function calculateMiddleFingerContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerContactPoint(...args);
}
export function calculateMiddleFingerSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerSurfaceNormal(...args);
}
export function calculateMiddleFingerPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerPoseError(...args);
}
export function calculateMiddleFingerMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerMotionSmoothness(...args);
}
export function calculateMiddleFingerCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerCollision(...args);
}
export function calculateMiddleFingerCurl(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerCurl(...args);
}
export function calculateMiddleFingerSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerSpread(...args);
}
export function calculateMiddleFingerAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMiddleFingerAlignment(...args);
}
export function getRingFingerRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerRootPosition(...args);
}
export function getRingFingerMCPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerMCPPosition(...args);
}
export function getRingFingerPIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerPIPPosition(...args);
}
export function getRingFingerDIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerDIPPosition(...args);
}
export function getRingFingerTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerTipPosition(...args);
}
export function getRingFingerNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerNailPosition(...args);
}
export function getRingFingerPadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerPadPosition(...args);
}
export function getRingFingerBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerBasePosition(...args);
}
export function getRingFingerProximalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerProximalJoint(...args);
}
export function getRingFingerDistalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRingFingerDistalJoint(...args);
}
export function calculateRingFingerLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerLength(...args);
}
export function calculateRingFingerWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerWidth(...args);
}
export function calculateRingFingerThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerThickness(...args);
}
export function calculateRingFingerCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerCurvature(...args);
}
export function calculateRingFingerDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerDirection(...args);
}
export function calculateRingFingerOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerOrientation(...args);
}
export function calculateRingFingerFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerFlexion(...args);
}
export function calculateRingFingerExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerExtension(...args);
}
export function calculateRingFingerAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerAbduction(...args);
}
export function calculateRingFingerAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerAdduction(...args);
}
export function calculateRingFingerRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerRotation(...args);
}
export function calculateRingFingerTipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerTipVelocity(...args);
}
export function calculateRingFingerTipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerTipAcceleration(...args);
}
export function calculateRingFingerJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerJointAngles(...args);
}
export function calculateRingFingerSegmentLengths(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerSegmentLengths(...args);
}
export function calculateRingFingerBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerBoundingBox(...args);
}
export function calculateRingFingerBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerBoundingSphere(...args);
}
export function calculateRingToThumbDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingToThumbDistance(...args);
}
export function calculateRingToIndexDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingToIndexDistance(...args);
}
export function calculateRingToMiddleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingToMiddleDistance(...args);
}
export function calculateRingToLittleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingToLittleDistance(...args);
}
export function calculateRingFingerReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerReachEnvelope(...args);
}
export function calculateRingFingerContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerContactPoint(...args);
}
export function calculateRingFingerSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerSurfaceNormal(...args);
}
export function calculateRingFingerPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerPoseError(...args);
}
export function calculateRingFingerMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerMotionSmoothness(...args);
}
export function calculateRingFingerCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerCollision(...args);
}
export function calculateRingFingerCurl(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerCurl(...args);
}
export function calculateRingFingerSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerSpread(...args);
}
export function calculateRingFingerAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRingFingerAlignment(...args);
}
export function getLittleFingerRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerRootPosition(...args);
}
export function getLittleFingerMCPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerMCPPosition(...args);
}
export function getLittleFingerPIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerPIPPosition(...args);
}
export function getLittleFingerDIPPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerDIPPosition(...args);
}
export function getLittleFingerTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerTipPosition(...args);
}
export function getLittleFingerNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerNailPosition(...args);
}
export function getLittleFingerPadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerPadPosition(...args);
}
export function getLittleFingerBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerBasePosition(...args);
}
export function getLittleFingerProximalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerProximalJoint(...args);
}
export function getLittleFingerDistalJoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleFingerDistalJoint(...args);
}
export function calculateLittleFingerLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerLength(...args);
}
export function calculateLittleFingerWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerWidth(...args);
}
export function calculateLittleFingerThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerThickness(...args);
}
export function calculateLittleFingerCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerCurvature(...args);
}
export function calculateLittleFingerDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerDirection(...args);
}
export function calculateLittleFingerOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerOrientation(...args);
}
export function calculateLittleFingerFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerFlexion(...args);
}
export function calculateLittleFingerExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerExtension(...args);
}
export function calculateLittleFingerAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerAbduction(...args);
}
export function calculateLittleFingerAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerAdduction(...args);
}
export function calculateLittleFingerRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerRotation(...args);
}
export function calculateLittleFingerTipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerTipVelocity(...args);
}
export function calculateLittleFingerTipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerTipAcceleration(...args);
}
export function calculateLittleFingerJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerJointAngles(...args);
}
export function calculateLittleFingerSegmentLengths(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerSegmentLengths(...args);
}
export function calculateLittleFingerBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerBoundingBox(...args);
}
export function calculateLittleFingerBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerBoundingSphere(...args);
}
export function calculateLittleToThumbDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleToThumbDistance(...args);
}
export function calculateLittleToIndexDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleToIndexDistance(...args);
}
export function calculateLittleToMiddleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleToMiddleDistance(...args);
}
export function calculateLittleToRingDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleToRingDistance(...args);
}
export function calculateLittleFingerReachEnvelope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerReachEnvelope(...args);
}
export function calculateLittleFingerContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerContactPoint(...args);
}
export function calculateLittleFingerSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerSurfaceNormal(...args);
}
export function calculateLittleFingerPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerPoseError(...args);
}
export function calculateLittleFingerMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerMotionSmoothness(...args);
}
export function calculateLittleFingerCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerCollision(...args);
}
export function calculateLittleFingerCurl(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerCurl(...args);
}
export function calculateLittleFingerSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerSpread(...args);
}
export function calculateLittleFingerAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLittleFingerAlignment(...args);
}
export function getHeldObjectPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectPosition(...args);
}
export function getHeldObjectCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectCenter(...args);
}
export function getHeldObjectRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectRotation(...args);
}
export function getHeldObjectScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectScale(...args);
}
export function getHeldObjectWorldPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectWorldPosition(...args);
}
export function getHeldObjectLocalPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectLocalPosition(...args);
}
export function getHeldObjectAnchor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectAnchor(...args);
}
export function getHeldObjectPivot(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectPivot(...args);
}
export function getHeldObjectGripPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectGripPoint(...args);
}
export function getHeldObjectContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectContactPoint(...args);
}
export function getHeldObjectTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectTipPosition(...args);
}
export function getHeldObjectBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectBasePosition(...args);
}
export function getHeldObjectFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectFrontPosition(...args);
}
export function getHeldObjectBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectBackPosition(...args);
}
export function getHeldObjectLeftPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectLeftPosition(...args);
}
export function getHeldObjectRightPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectRightPosition(...args);
}
export function getHeldObjectUpPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectUpPosition(...args);
}
export function getHeldObjectDownPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHeldObjectDownPosition(...args);
}
export function calculateHeldObjectLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectLength(...args);
}
export function calculateHeldObjectWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectWidth(...args);
}
export function calculateHeldObjectHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectHeight(...args);
}
export function calculateHeldObjectVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectVolume(...args);
}
export function calculateHeldObjectSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectSurfaceArea(...args);
}
export function calculateHeldObjectMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectMass(...args);
}
export function calculateHeldObjectCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectCenterOfMass(...args);
}
export function calculateHeldObjectInertiaTensor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectInertiaTensor(...args);
}
export function calculateHeldObjectBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectBoundingBox(...args);
}
export function calculateHeldObjectBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectBoundingSphere(...args);
}
export function calculateHeldObjectBoundingCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectBoundingCapsule(...args);
}
export function calculateHeldObjectBoundingCylinder(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectBoundingCylinder(...args);
}
export function calculateHeldObjectDistanceToHand(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectDistanceToHand(...args);
}
export function calculateHeldObjectDistanceToWrist(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectDistanceToWrist(...args);
}
export function calculateHeldObjectDistanceToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectDistanceToCamera(...args);
}
export function calculateHeldObjectDistanceToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectDistanceToTarget(...args);
}
export function calculateHeldObjectGripAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectGripAlignment(...args);
}
export function calculateHeldObjectGripOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectGripOffset(...args);
}
export function calculateHeldObjectGripRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectGripRotation(...args);
}
export function calculateHeldObjectGripStability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectGripStability(...args);
}
export function calculateHeldObjectHandPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectHandPose(...args);
}
export function calculateHeldObjectFingerContact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectFingerContact(...args);
}
export function calculateHeldObjectCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectCollision(...args);
}
export function calculateHeldObjectPenetrationDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectPenetrationDepth(...args);
}
export function calculateHeldObjectVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectVelocity(...args);
}
export function calculateHeldObjectAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectAcceleration(...args);
}
export function calculateHeldObjectAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectAngularVelocity(...args);
}
export function calculateHeldObjectAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectAngularAcceleration(...args);
}
export function calculateHeldObjectTrajectory(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectTrajectory(...args);
}
export function calculateHeldObjectThrowVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectThrowVelocity(...args);
}
export function calculateHeldObjectReleasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectReleasePosition(...args);
}
export function calculateHeldObjectReleaseRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeldObjectReleaseRotation(...args);
}
export function getTorsoPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoPosition(...args);
}
export function getTorsoCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoCenter(...args);
}
export function getTorsoTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoTopPosition(...args);
}
export function getTorsoBottomPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoBottomPosition(...args);
}
export function getTorsoFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoFrontPosition(...args);
}
export function getTorsoBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoBackPosition(...args);
}
export function getTorsoLeftPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoLeftPosition(...args);
}
export function getTorsoRightPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTorsoRightPosition(...args);
}
export function getChestPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getChestPosition(...args);
}
export function getChestCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getChestCenter(...args);
}
export function getChestFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getChestFrontPosition(...args);
}
export function getChestBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getChestBackPosition(...args);
}
export function getRibcageCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRibcageCenter(...args);
}
export function getSternumPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getSternumPosition(...args);
}
export function getSpinePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getSpinePosition(...args);
}
export function getUpperSpinePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getUpperSpinePosition(...args);
}
export function getMiddleSpinePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getMiddleSpinePosition(...args);
}
export function getLowerSpinePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLowerSpinePosition(...args);
}
export function calculateTorsoLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoLength(...args);
}
export function calculateTorsoWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoWidth(...args);
}
export function calculateTorsoHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoHeight(...args);
}
export function calculateTorsoDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoDepth(...args);
}
export function calculateTorsoVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoVolume(...args);
}
export function calculateTorsoSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoSurfaceArea(...args);
}
export function calculateTorsoBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoBoundingBox(...args);
}
export function calculateTorsoBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoBoundingSphere(...args);
}
export function calculateTorsoCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoCenterOfMass(...args);
}
export function calculateTorsoOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoOrientation(...args);
}
export function calculateTorsoRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoRotation(...args);
}
export function calculateTorsoTilt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoTilt(...args);
}
export function calculateTorsoTwist(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoTwist(...args);
}
export function calculateTorsoBend(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoBend(...args);
}
export function calculateTorsoLeanAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoLeanAngle(...args);
}
export function calculateTorsoFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoFlexion(...args);
}
export function calculateTorsoExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoExtension(...args);
}
export function calculateTorsoLateralBend(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoLateralBend(...args);
}
export function calculateTorsoVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoVelocity(...args);
}
export function calculateTorsoAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoAcceleration(...args);
}
export function calculateTorsoAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoAngularVelocity(...args);
}
export function calculateTorsoAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoAngularAcceleration(...args);
}
export function calculateTorsoToHeadDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoToHeadDistance(...args);
}
export function calculateTorsoToHipDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoToHipDistance(...args);
}
export function calculateTorsoToShoulderDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoToShoulderDistance(...args);
}
export function calculateTorsoSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoSymmetry(...args);
}
export function calculateTorsoPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoPoseError(...args);
}
export function calculateTorsoMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoMotionSmoothness(...args);
}
export function calculateTorsoSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoSurfaceNormal(...args);
}
export function calculateTorsoCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoCollision(...args);
}
export function calculateTorsoGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoGroundClearance(...args);
}
export function calculateTorsoJointChain(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTorsoJointChain(...args);
}
export function getAbdomenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAbdomenPosition(...args);
}
export function getAbdomenCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAbdomenCenter(...args);
}
export function getUpperAbdomenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getUpperAbdomenPosition(...args);
}
export function getLowerAbdomenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLowerAbdomenPosition(...args);
}
export function getNavelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getNavelPosition(...args);
}
export function getPelvisPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPelvisPosition(...args);
}
export function getPelvisCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPelvisCenter(...args);
}
export function getPelvisFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPelvisFrontPosition(...args);
}
export function getPelvisBackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPelvisBackPosition(...args);
}
export function getLeftHipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftHipPosition(...args);
}
export function getRightHipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightHipPosition(...args);
}
export function getHipCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHipCenter(...args);
}
export function getHipJointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHipJointPosition(...args);
}
export function getSacrumPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getSacrumPosition(...args);
}
export function getTailbonePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTailbonePosition(...args);
}
export function calculateAbdomenWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAbdomenWidth(...args);
}
export function calculateAbdomenHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAbdomenHeight(...args);
}
export function calculateAbdomenDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAbdomenDepth(...args);
}
export function calculateAbdomenVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAbdomenVolume(...args);
}
export function calculateAbdomenCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAbdomenCenterOfMass(...args);
}
export function calculatePelvisWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisWidth(...args);
}
export function calculatePelvisHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisHeight(...args);
}
export function calculatePelvisDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisDepth(...args);
}
export function calculatePelvisOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisOrientation(...args);
}
export function calculatePelvisRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisRotation(...args);
}
export function calculatePelvisTilt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisTilt(...args);
}
export function calculatePelvisTwist(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisTwist(...args);
}
export function calculateHipWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipWidth(...args);
}
export function calculateHipSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipSymmetry(...args);
}
export function calculateHipJointAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipJointAngle(...args);
}
export function calculateHipFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipFlexion(...args);
}
export function calculateHipExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipExtension(...args);
}
export function calculateHipAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipAbduction(...args);
}
export function calculateHipAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipAdduction(...args);
}
export function calculateHipInternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipInternalRotation(...args);
}
export function calculateHipExternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipExternalRotation(...args);
}
export function calculateHipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipVelocity(...args);
}
export function calculateHipAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipAcceleration(...args);
}
export function calculateHipBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipBoundingBox(...args);
}
export function calculateHipCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipCenterOfMass(...args);
}
export function calculateHipToKneeDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipToKneeDistance(...args);
}
export function calculateHipToAnkleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipToAnkleDistance(...args);
}
export function calculateHipToFootDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipToFootDistance(...args);
}
export function calculatePelvisGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisGroundClearance(...args);
}
export function calculatePelvisMotionVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisMotionVector(...args);
}
export function calculatePelvisPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisPoseError(...args);
}
export function calculatePelvisStability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisStability(...args);
}
export function calculatePelvisCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePelvisCollision(...args);
}
export function calculateHipJointAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipJointAxis(...args);
}
export function calculateHipJointNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHipJointNormal(...args);
}
export function getLeftLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftLegPosition(...args);
}
export function getRightLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightLegPosition(...args);
}
export function getLeftLegCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftLegCenter(...args);
}
export function getRightLegCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightLegCenter(...args);
}
export function getLeftThighPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftThighPosition(...args);
}
export function getRightThighPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightThighPosition(...args);
}
export function getLeftThighCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftThighCenter(...args);
}
export function getRightThighCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightThighCenter(...args);
}
export function getLeftThighStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftThighStart(...args);
}
export function getRightThighStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightThighStart(...args);
}
export function getLeftThighEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftThighEnd(...args);
}
export function getRightThighEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightThighEnd(...args);
}
export function calculateThighLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighLength(...args);
}
export function calculateThighWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighWidth(...args);
}
export function calculateThighThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighThickness(...args);
}
export function calculateThighVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighVolume(...args);
}
export function calculateThighSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighSurfaceArea(...args);
}
export function calculateThighDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighDirection(...args);
}
export function calculateThighOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighOrientation(...args);
}
export function calculateThighRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighRotation(...args);
}
export function calculateThighVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighVelocity(...args);
}
export function calculateThighAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighAcceleration(...args);
}
export function calculateThighBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighBoundingBox(...args);
}
export function calculateThighBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighBoundingSphere(...args);
}
export function calculateThighCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighCenterOfMass(...args);
}
export function calculateThighToHipDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighToHipDistance(...args);
}
export function calculateThighToKneeDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighToKneeDistance(...args);
}
export function calculateThighSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighSymmetry(...args);
}
export function calculateThighFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighFlexion(...args);
}
export function calculateThighExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighExtension(...args);
}
export function calculateThighAbduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighAbduction(...args);
}
export function calculateThighAdduction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighAdduction(...args);
}
export function calculateThighInternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighInternalRotation(...args);
}
export function calculateThighExternalRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateThighExternalRotation(...args);
}
export function calculateLegLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegLength(...args);
}
export function calculateLegDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegDirection(...args);
}
export function calculateLegOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegOrientation(...args);
}
export function calculateLegVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegVelocity(...args);
}
export function calculateLegAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegAcceleration(...args);
}
export function calculateLegBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegBoundingBox(...args);
}
export function calculateLegCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegCenterOfMass(...args);
}
export function calculateLegSwingAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegSwingAngle(...args);
}
export function calculateLegStrideLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegStrideLength(...args);
}
export function calculateLegStrideFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegStrideFrequency(...args);
}
export function calculateLegGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegGroundClearance(...args);
}
export function calculateLegContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegContactPoint(...args);
}
export function calculateLegContactNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegContactNormal(...args);
}
export function calculateLegPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegPoseError(...args);
}
export function calculateLegMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegMotionSmoothness(...args);
}
export function calculateLegInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegInverseKinematics(...args);
}
export function getLeftKneePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftKneePosition(...args);
}
export function getRightKneePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightKneePosition(...args);
}
export function getLeftKneeCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftKneeCenter(...args);
}
export function getRightKneeCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightKneeCenter(...args);
}
export function getLeftKneeCapPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftKneeCapPosition(...args);
}
export function getRightKneeCapPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightKneeCapPosition(...args);
}
export function calculateKneeWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeWidth(...args);
}
export function calculateKneeThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeThickness(...args);
}
export function calculateKneeFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeFlexion(...args);
}
export function calculateKneeExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeExtension(...args);
}
export function calculateKneeJointAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeJointAxis(...args);
}
export function calculateKneeJointNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeJointNormal(...args);
}
export function calculateKneeVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeVelocity(...args);
}
export function calculateKneeAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeAcceleration(...args);
}
export function calculateKneeBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeBoundingBox(...args);
}
export function calculateKneeBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeBoundingSphere(...args);
}
export function calculateKneeToHipDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeToHipDistance(...args);
}
export function calculateKneeToAnkleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeToAnkleDistance(...args);
}
export function calculateKneeSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateKneeSymmetry(...args);
}
export function getLeftShinPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShinPosition(...args);
}
export function getRightShinPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShinPosition(...args);
}
export function getLeftShinCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShinCenter(...args);
}
export function getRightShinCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShinCenter(...args);
}
export function getLeftShinStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShinStart(...args);
}
export function getRightShinStart(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShinStart(...args);
}
export function getLeftShinEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftShinEnd(...args);
}
export function getRightShinEnd(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightShinEnd(...args);
}
export function calculateShinLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinLength(...args);
}
export function calculateShinWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinWidth(...args);
}
export function calculateShinThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinThickness(...args);
}
export function calculateShinVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinVolume(...args);
}
export function calculateShinDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinDirection(...args);
}
export function calculateShinOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinOrientation(...args);
}
export function calculateShinVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinVelocity(...args);
}
export function calculateShinAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinAcceleration(...args);
}
export function calculateShinBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinBoundingBox(...args);
}
export function calculateShinCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinCenterOfMass(...args);
}
export function calculateShinToKneeDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinToKneeDistance(...args);
}
export function calculateShinToAnkleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinToAnkleDistance(...args);
}
export function calculateShinRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinRotation(...args);
}
export function calculateShinTwist(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinTwist(...args);
}
export function calculateShinSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinSurfaceNormal(...args);
}
export function calculateShinGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinGroundClearance(...args);
}
export function calculateShinCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinCollision(...args);
}
export function calculateShinPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinPoseError(...args);
}
export function calculateShinMotionSmoothness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinMotionSmoothness(...args);
}
export function calculateShinSegmentAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinSegmentAlignment(...args);
}
export function calculateShinJointChain(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinJointChain(...args);
}
export function calculateShinInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShinInverseKinematics(...args);
}
export function getLeftAnklePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftAnklePosition(...args);
}
export function getRightAnklePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightAnklePosition(...args);
}
export function getLeftAnkleCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftAnkleCenter(...args);
}
export function getRightAnkleCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightAnkleCenter(...args);
}
export function getLeftHeelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftHeelPosition(...args);
}
export function getRightHeelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightHeelPosition(...args);
}
export function getLeftFootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftFootPosition(...args);
}
export function getRightFootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightFootPosition(...args);
}
export function getLeftFootCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeftFootCenter(...args);
}
export function getRightFootCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRightFootCenter(...args);
}
export function getFootToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootToePosition(...args);
}
export function getFootHeelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootHeelPosition(...args);
}
export function getFootArchPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootArchPosition(...args);
}
export function getFootSolePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootSolePosition(...args);
}
export function getFootTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootTopPosition(...args);
}
export function getFootInnerEdge(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootInnerEdge(...args);
}
export function getFootOuterEdge(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFootOuterEdge(...args);
}
export function calculateAnkleWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleWidth(...args);
}
export function calculateAnkleFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleFlexion(...args);
}
export function calculateAnkleExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleExtension(...args);
}
export function calculateAnkleInversion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleInversion(...args);
}
export function calculateAnkleEversion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleEversion(...args);
}
export function calculateAnkleRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleRotation(...args);
}
export function calculateAnkleVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleVelocity(...args);
}
export function calculateAnkleAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnkleAcceleration(...args);
}
export function calculateFootLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootLength(...args);
}
export function calculateFootWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootWidth(...args);
}
export function calculateFootHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootHeight(...args);
}
export function calculateFootThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootThickness(...args);
}
export function calculateFootVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootVolume(...args);
}
export function calculateFootSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootSurfaceArea(...args);
}
export function calculateFootOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootOrientation(...args);
}
export function calculateFootDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootDirection(...args);
}
export function calculateFootPitch(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootPitch(...args);
}
export function calculateFootRoll(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootRoll(...args);
}
export function calculateFootYaw(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootYaw(...args);
}
export function calculateFootVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootVelocity(...args);
}
export function calculateFootAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootAcceleration(...args);
}
export function calculateFootAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootAngularVelocity(...args);
}
export function calculateFootBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootBoundingBox(...args);
}
export function calculateFootBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootBoundingSphere(...args);
}
export function calculateFootCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootCenterOfMass(...args);
}
export function calculateFootGroundContact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootGroundContact(...args);
}
export function calculateFootGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootGroundClearance(...args);
}
export function calculateFootPressureCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootPressureCenter(...args);
}
export function calculateFootContactArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootContactArea(...args);
}
export function calculateFootSlipVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootSlipVelocity(...args);
}
export function calculateFootStrideLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootStrideLength(...args);
}
export function calculateFootInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootInverseKinematics(...args);
}
export function getBigToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBigToePosition(...args);
}
export function getSecondToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getSecondToePosition(...args);
}
export function getThirdToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getThirdToePosition(...args);
}
export function getFourthToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFourthToePosition(...args);
}
export function getLittleToePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLittleToePosition(...args);
}
export function getToeTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getToeTipPosition(...args);
}
export function getToeBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getToeBasePosition(...args);
}
export function getToeJointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getToeJointPosition(...args);
}
export function getToeNailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getToeNailPosition(...args);
}
export function calculateToeLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeLength(...args);
}
export function calculateToeWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeWidth(...args);
}
export function calculateToeFlexion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeFlexion(...args);
}
export function calculateToeExtension(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeExtension(...args);
}
export function calculateToeSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeSpread(...args);
}
export function calculateToeCurl(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeCurl(...args);
}
export function calculateToeDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeDirection(...args);
}
export function calculateToeVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeVelocity(...args);
}
export function calculateToeAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeAcceleration(...args);
}
export function calculateToeJointAngles(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeJointAngles(...args);
}
export function calculateToeBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateToeBoundingBox(...args);
}
export function calculateStandingHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStandingHeight(...args);
}
export function calculateBodyBalance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBodyBalance(...args);
}
export function calculateCenterOfGravity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCenterOfGravity(...args);
}
export function calculateCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCenterOfMass(...args);
}
export function calculateBaseOfSupport(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBaseOfSupport(...args);
}
export function calculateBalanceMargin(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBalanceMargin(...args);
}
export function calculateBodySway(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBodySway(...args);
}
export function calculateBodyLean(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBodyLean(...args);
}
export function calculatePostureStability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePostureStability(...args);
}
export function calculateStandingPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStandingPoseError(...args);
}
export function calculateSittingHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSittingHeight(...args);
}
export function calculateSittingPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSittingPose(...args);
}
export function calculateSquatDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSquatDepth(...args);
}
export function calculateJumpHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJumpHeight(...args);
}
export function calculateLandingImpact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLandingImpact(...args);
}
export function calculateGroundReactionForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGroundReactionForce(...args);
}
export function calculateGaitCycle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGaitCycle(...args);
}
export function calculateGaitPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGaitPhase(...args);
}
export function calculateStepFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStepFrequency(...args);
}
export function calculateWalkingSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWalkingSpeed(...args);
}
export function calculateRunningSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRunningSpeed(...args);
}
export function calculateStrideWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStrideWidth(...args);
}
export function calculateStrideSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStrideSymmetry(...args);
}
export function calculateFootPlacement(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootPlacement(...args);
}
export function calculateFootPlacementError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootPlacementError(...args);
}
export function calculateGroundPenetration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGroundPenetration(...args);
}
export function calculateGroundAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGroundAlignment(...args);
}
export function calculateLegSupportPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLegSupportPhase(...args);
}
export function calculateSwingPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSwingPhase(...args);
}
export function calculateLocomotionDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLocomotionDirection(...args);
}
export function getBonePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBonePosition(...args);
}
export function getBoneStartPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneStartPosition(...args);
}
export function getBoneEndPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneEndPosition(...args);
}
export function getBoneCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneCenter(...args);
}
export function getBoneDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneDirection(...args);
}
export function getBoneOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneOrientation(...args);
}
export function getBoneLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneLength(...args);
}
export function getBoneScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneScale(...args);
}
export function getBoneParent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneParent(...args);
}
export function getBoneChildren(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBoneChildren(...args);
}
export function calculateBoneDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneDistance(...args);
}
export function calculateBoneAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneAngle(...args);
}
export function calculateBoneAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneAlignment(...args);
}
export function calculateBoneChainLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneChainLength(...args);
}
export function calculateBoneHierarchyDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneHierarchyDepth(...args);
}
export function calculateBoneWorldTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneWorldTransform(...args);
}
export function calculateBoneLocalTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneLocalTransform(...args);
}
export function calculateBoneInverseTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneInverseTransform(...args);
}
export function calculateBoneBindPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneBindPose(...args);
}
export function calculateBonePoseDelta(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBonePoseDelta(...args);
}
export function calculateBoneVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneVelocity(...args);
}
export function calculateBoneAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneAcceleration(...args);
}
export function calculateBoneAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneAngularVelocity(...args);
}
export function calculateBoneAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneAngularAcceleration(...args);
}
export function calculateBoneBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneBoundingBox(...args);
}
export function calculateBoneBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneBoundingSphere(...args);
}
export function calculateBoneCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneCapsule(...args);
}
export function calculateBoneCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneCollision(...args);
}
export function calculateBoneIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneIntersection(...args);
}
export function calculateBoneClosestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneClosestPoint(...args);
}
export function getJointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointPosition(...args);
}
export function getJointCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointCenter(...args);
}
export function getJointAxis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointAxis(...args);
}
export function getJointNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointNormal(...args);
}
export function getJointParentBone(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointParentBone(...args);
}
export function getJointChildBone(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getJointChildBone(...args);
}
export function calculateJointAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointAngle(...args);
}
export function calculateJointLimit(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointLimit(...args);
}
export function calculateJointConstraint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointConstraint(...args);
}
export function calculateJointVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointVelocity(...args);
}
export function calculateJointAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointAcceleration(...args);
}
export function calculateJointTorque(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointTorque(...args);
}
export function calculateJointForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointForce(...args);
}
export function calculateJointStiffness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointStiffness(...args);
}
export function calculateJointDamping(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointDamping(...args);
}
export function calculateJointFriction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointFriction(...args);
}
export function calculateJointCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointCollision(...args);
}
export function calculateJointChain(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointChain(...args);
}
export function calculateJointPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointPoseError(...args);
}
export function calculateJointInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateJointInverseKinematics(...args);
}
export function calculateForwardKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateForwardKinematics(...args);
}
export function calculateInverseKinematics(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateInverseKinematics(...args);
}
export function solveTwoBoneIK(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).solveTwoBoneIK(...args);
}
export function solveThreeBoneIK(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).solveThreeBoneIK(...args);
}
export function solveFullBodyIK(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).solveFullBodyIK(...args);
}
export function calculateIKTargetError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIKTargetError(...args);
}
export function calculateIKJointWeights(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIKJointWeights(...args);
}
export function calculateIKReachability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIKReachability(...args);
}
export function calculateIKPoleVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIKPoleVector(...args);
}
export function calculateIKChainStretch(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateIKChainStretch(...args);
}
export function calculateSkeletonRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonRootPosition(...args);
}
export function calculateSkeletonOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonOrientation(...args);
}
export function calculateSkeletonBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonBounds(...args);
}
export function calculateSkeletonCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonCenterOfMass(...args);
}
export function calculateSkeletonPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonPose(...args);
}
export function calculateSkeletonPoseDifference(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonPoseDifference(...args);
}
export function calculateSkeletonPoseSimilarity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonPoseSimilarity(...args);
}
export function calculateSkeletonRetargeting(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonRetargeting(...args);
}
export function calculateBoneRetargeting(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneRetargeting(...args);
}
export function calculateAnimationBlendWeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationBlendWeight(...args);
}
export function calculateAnimationBlendFactor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationBlendFactor(...args);
}
export function calculateAnimationTime(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationTime(...args);
}
export function calculateAnimationPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationPhase(...args);
}
export function calculateAnimationPlaybackSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationPlaybackSpeed(...args);
}
export function calculateAnimationRootMotion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationRootMotion(...args);
}
export function calculateAnimationRootVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationRootVelocity(...args);
}
export function calculateAnimationRootAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationRootAcceleration(...args);
}
export function calculateAnimationPoseAtTime(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationPoseAtTime(...args);
}
export function calculateAnimationInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationInterpolation(...args);
}
export function calculateAnimationCurveValue(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationCurveValue(...args);
}
export function calculateAnimationCurveDerivative(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationCurveDerivative(...args);
}
export function calculateAnimationCurveIntegral(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationCurveIntegral(...args);
}
export function calculateAnimationVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationVelocity(...args);
}
export function calculateAnimationAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationAcceleration(...args);
}
export function calculatePoseTransition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseTransition(...args);
}
export function calculatePoseTransitionDuration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseTransitionDuration(...args);
}
export function calculatePoseBlend(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseBlend(...args);
}
export function calculatePoseStability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseStability(...args);
}
export function calculatePoseReachability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseReachability(...args);
}
export function calculatePoseConstraintError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePoseConstraintError(...args);
}
export function calculateFootLockPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootLockPosition(...args);
}
export function calculateFootLockWeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFootLockWeight(...args);
}
export function calculateHandIKTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHandIKTarget(...args);
}
export function calculateLookAtTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLookAtTarget(...args);
}
export function calculateHeadLookAt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHeadLookAt(...args);
}
export function calculateEyeLookAt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEyeLookAt(...args);
}
export function calculateAimOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAimOffset(...args);
}
export function calculateAimPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAimPose(...args);
}
export function calculateReachPose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateReachPose(...args);
}
export function calculateCharacterPoseError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPoseError(...args);
}
export function getCharacterPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterPosition(...args);
}
export function getCharacterRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterRotation(...args);
}
export function getCharacterScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterScale(...args);
}
export function getCharacterVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterVelocity(...args);
}
export function getCharacterAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterAcceleration(...args);
}
export function getCharacterForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterForwardVector(...args);
}
export function getCharacterRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterRightVector(...args);
}
export function getCharacterUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCharacterUpVector(...args);
}
export function calculateCharacterHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterHeight(...args);
}
export function calculateCharacterWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterWidth(...args);
}
export function calculateCharacterDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterDepth(...args);
}
export function calculateCharacterRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterRadius(...args);
}
export function calculateCharacterBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterBounds(...args);
}
export function calculateCharacterBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterBoundingBox(...args);
}
export function calculateCharacterBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterBoundingSphere(...args);
}
export function calculateCharacterBoundingCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterBoundingCapsule(...args);
}
export function calculateCharacterCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterCenterOfMass(...args);
}
export function calculateCharacterGroundDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterGroundDistance(...args);
}
export function calculateCharacterGroundContact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterGroundContact(...args);
}
export function calculateCharacterGroundNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterGroundNormal(...args);
}
export function calculateCharacterSlopeAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterSlopeAngle(...args);
}
export function calculateCharacterMovementDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterMovementDirection(...args);
}
export function calculateCharacterMovementSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterMovementSpeed(...args);
}
export function calculateCharacterMovementDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterMovementDistance(...args);
}
export function calculateCharacterTurningRate(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterTurningRate(...args);
}
export function calculateCharacterTurningAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterTurningAngle(...args);
}
export function calculateCharacterStoppingDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterStoppingDistance(...args);
}
export function calculateCharacterBrakingAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterBrakingAcceleration(...args);
}
export function calculateCharacterJumpVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterJumpVelocity(...args);
}
export function calculateCharacterJumpHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterJumpHeight(...args);
}
export function calculateCharacterFallVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterFallVelocity(...args);
}
export function calculateCharacterFallDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterFallDistance(...args);
}
export function calculateCharacterLandingPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterLandingPosition(...args);
}
export function calculateCharacterLandingVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterLandingVelocity(...args);
}
export function calculateCharacterCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterCollision(...args);
}
export function calculateCharacterCollisionResponse(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterCollisionResponse(...args);
}
export function calculateCharacterPenetrationDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPenetrationDepth(...args);
}
export function calculateCharacterSeparationVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterSeparationVector(...args);
}
export function calculateCharacterAvoidanceDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterAvoidanceDirection(...args);
}
export function calculateCharacterPathDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPathDistance(...args);
}
export function calculateCharacterPathDeviation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPathDeviation(...args);
}
export function calculateCharacterPathCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPathCurvature(...args);
}
export function calculateCharacterPathTangent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPathTangent(...args);
}
export function calculateCharacterPathNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterPathNormal(...args);
}
export function calculateCharacterNavigationCost(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterNavigationCost(...args);
}
export function calculateCharacterReachDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterReachDistance(...args);
}
export function calculateCharacterInteractionRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterInteractionRange(...args);
}
export function calculateCharacterVisibilityRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterVisibilityRange(...args);
}
export function calculateCharacterTargetDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterTargetDistance(...args);
}
export function calculateCharacterTargetAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterTargetAngle(...args);
}
export function calculateNPCPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPosition(...args);
}
export function calculateNPCVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCVelocity(...args);
}
export function calculateNPCAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCAcceleration(...args);
}
export function calculateNPCFacingDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFacingDirection(...args);
}
export function calculateNPCOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCOrientation(...args);
}
export function calculateNPCDistanceToPlayer(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCDistanceToPlayer(...args);
}
export function calculateNPCDistanceToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCDistanceToTarget(...args);
}
export function calculateNPCDistanceToWaypoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCDistanceToWaypoint(...args);
}
export function calculateNPCNearestNeighbor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCNearestNeighbor(...args);
}
export function calculateNPCGroupCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCGroupCenter(...args);
}
export function calculateNPCGroupRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCGroupRadius(...args);
}
export function calculateNPCFormationOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFormationOffset(...args);
}
export function calculateNPCFormationPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFormationPosition(...args);
}
export function calculateNPCFormationDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFormationDirection(...args);
}
export function calculateNPCFormationSpacing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFormationSpacing(...args);
}
export function calculateNPCSeparationForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCSeparationForce(...args);
}
export function calculateNPCAlignmentForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCAlignmentForce(...args);
}
export function calculateNPCCohesionForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCCohesionForce(...args);
}
export function calculateNPCSteeringForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCSteeringForce(...args);
}
export function calculateNPCAvoidanceForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCAvoidanceForce(...args);
}
export function calculateNPCObstacleDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCObstacleDistance(...args);
}
export function calculateNPCObstacleNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCObstacleNormal(...args);
}
export function calculateNPCPathfindingCost(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPathfindingCost(...args);
}
export function calculateNPCPathLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPathLength(...args);
}
export function calculateNPCPathSmoothing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPathSmoothing(...args);
}
export function calculateNPCWaypointIndex(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCWaypointIndex(...args);
}
export function calculateNPCWaypointDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCWaypointDistance(...args);
}
export function calculateNPCWaypointArrival(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCWaypointArrival(...args);
}
export function calculateNPCPatrolRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPatrolRadius(...args);
}
export function calculateNPCPatrolPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPatrolPosition(...args);
}
export function calculateNPCDetectionRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCDetectionRange(...args);
}
export function calculateNPCFieldOfView(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFieldOfView(...args);
}
export function calculateNPCLineOfSight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCLineOfSight(...args);
}
export function calculateNPCVisibilityScore(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCVisibilityScore(...args);
}
export function calculateNPCThreatScore(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCThreatScore(...args);
}
export function calculateNPCInterestScore(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCInterestScore(...args);
}
export function calculateNPCTargetPriority(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCTargetPriority(...args);
}
export function calculateNPCAttackRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCAttackRange(...args);
}
export function calculateNPCInteractionDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCInteractionDistance(...args);
}
export function calculateNPCInteractionAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCInteractionAngle(...args);
}
export function calculateNPCApproachPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCApproachPosition(...args);
}
export function calculateNPCFleeDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCFleeDirection(...args);
}
export function calculateNPCChaseDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCChaseDirection(...args);
}
export function calculateNPCInterceptPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCInterceptPoint(...args);
}
export function calculateNPCPredictionPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCPredictionPosition(...args);
}
export function calculateNPCTargetPrediction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCTargetPrediction(...args);
}
export function calculateNPCDecisionScore(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCDecisionScore(...args);
}
export function calculateNPCStateTransition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCStateTransition(...args);
}
export function calculateNPCAnimationBlend(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCAnimationBlend(...args);
}
export function calculateNPCNavigationError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNPCNavigationError(...args);
}
export function getBossPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossPosition(...args);
}
export function getBossCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossCenter(...args);
}
export function getBossHeadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossHeadPosition(...args);
}
export function getBossChestPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossChestPosition(...args);
}
export function getBossCorePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossCorePosition(...args);
}
export function getBossWeakPointPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossWeakPointPosition(...args);
}
export function getBossHitboxCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossHitboxCenter(...args);
}
export function getBossAttackOrigin(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossAttackOrigin(...args);
}
export function getBossTargetPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBossTargetPosition(...args);
}
export function calculateBossHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossHeight(...args);
}
export function calculateBossWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossWidth(...args);
}
export function calculateBossDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossDepth(...args);
}
export function calculateBossBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossBounds(...args);
}
export function calculateBossBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossBoundingBox(...args);
}
export function calculateBossBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossBoundingSphere(...args);
}
export function calculateBossBoundingCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossBoundingCapsule(...args);
}
export function calculateBossCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossCenterOfMass(...args);
}
export function calculateBossDistanceToPlayer(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossDistanceToPlayer(...args);
}
export function calculateBossDistanceToWeakPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossDistanceToWeakPoint(...args);
}
export function calculateBossFacingDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossFacingDirection(...args);
}
export function calculateBossTurningAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossTurningAngle(...args);
}
export function calculateBossMovementSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossMovementSpeed(...args);
}
export function calculateBossAttackRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAttackRange(...args);
}
export function calculateBossAttackAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAttackAngle(...args);
}
export function calculateBossAttackTrajectory(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAttackTrajectory(...args);
}
export function calculateBossProjectileVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossProjectileVelocity(...args);
}
export function calculateBossProjectileDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossProjectileDirection(...args);
}
export function calculateBossProjectileImpactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossProjectileImpactPoint(...args);
}
export function calculateBossAreaAttackRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAreaAttackRadius(...args);
}
export function calculateBossAreaAttackCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAreaAttackCenter(...args);
}
export function calculateBossAreaAttackOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossAreaAttackOverlap(...args);
}
export function calculateBossHitboxOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossHitboxOverlap(...args);
}
export function calculateBossDamageDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossDamageDirection(...args);
}
export function calculateBossKnockbackDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossKnockbackDirection(...args);
}
export function calculateBossKnockbackDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossKnockbackDistance(...args);
}
export function calculateBossStaggerAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossStaggerAngle(...args);
}
export function calculateBossStaggerDuration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossStaggerDuration(...args);
}
export function calculateBossPhaseTransition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossPhaseTransition(...args);
}
export function calculateBossPhasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossPhasePosition(...args);
}
export function calculateBossWeakPointExposure(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBossWeakPointExposure(...args);
}
export function calculateMonsterPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterPosition(...args);
}
export function calculateMonsterMovementDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterMovementDirection(...args);
}
export function calculateMonsterSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterSpeed(...args);
}
export function calculateMonsterAttackDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterAttackDistance(...args);
}
export function calculateMonsterDetectionRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterDetectionRange(...args);
}
export function calculateMonsterCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterCollision(...args);
}
export function calculateMonsterBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterBoundingBox(...args);
}
export function calculateMonsterBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterBoundingSphere(...args);
}
export function calculateMonsterWeakPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterWeakPoint(...args);
}
export function calculateMonsterThreatLevel(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMonsterThreatLevel(...args);
}
export function getAnimalPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalPosition(...args);
}
export function getAnimalCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalCenter(...args);
}
export function getAnimalHeadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalHeadPosition(...args);
}
export function getAnimalSnoutPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalSnoutPosition(...args);
}
export function getAnimalNosePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalNosePosition(...args);
}
export function getAnimalEyePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalEyePosition(...args);
}
export function getAnimalEarPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalEarPosition(...args);
}
export function getAnimalNeckPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalNeckPosition(...args);
}
export function getAnimalTorsoPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalTorsoPosition(...args);
}
export function getAnimalChestPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalChestPosition(...args);
}
export function getAnimalAbdomenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalAbdomenPosition(...args);
}
export function getAnimalHipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalHipPosition(...args);
}
export function getAnimalTailPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalTailPosition(...args);
}
export function getAnimalTailTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalTailTipPosition(...args);
}
export function getAnimalFrontLeftLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalFrontLeftLegPosition(...args);
}
export function getAnimalFrontRightLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalFrontRightLegPosition(...args);
}
export function getAnimalRearLeftLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalRearLeftLegPosition(...args);
}
export function getAnimalRearRightLegPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalRearRightLegPosition(...args);
}
export function getAnimalPawPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalPawPosition(...args);
}
export function getAnimalClawPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getAnimalClawPosition(...args);
}
export function calculateAnimalBodyLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBodyLength(...args);
}
export function calculateAnimalBodyHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBodyHeight(...args);
}
export function calculateAnimalBodyWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBodyWidth(...args);
}
export function calculateAnimalCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalCenterOfMass(...args);
}
export function calculateAnimalSpineCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalSpineCurvature(...args);
}
export function calculateAnimalNeckAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalNeckAngle(...args);
}
export function calculateAnimalHeadAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalHeadAngle(...args);
}
export function calculateAnimalTailCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalTailCurvature(...args);
}
export function calculateAnimalTailSwing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalTailSwing(...args);
}
export function calculateAnimalLegLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalLegLength(...args);
}
export function calculateAnimalStrideLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalStrideLength(...args);
}
export function calculateAnimalStrideFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalStrideFrequency(...args);
}
export function calculateAnimalWalkingSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalWalkingSpeed(...args);
}
export function calculateAnimalRunningSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalRunningSpeed(...args);
}
export function calculateAnimalJumpHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalJumpHeight(...args);
}
export function calculateAnimalLandingPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalLandingPosition(...args);
}
export function calculateAnimalGroundContact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalGroundContact(...args);
}
export function calculateAnimalFootPlacement(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalFootPlacement(...args);
}
export function calculateAnimalBalance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBalance(...args);
}
export function calculateAnimalGaitPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalGaitPhase(...args);
}
export function calculateAnimalHeadToGroundDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalHeadToGroundDistance(...args);
}
export function calculateAnimalNoseToTargetDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalNoseToTargetDistance(...args);
}
export function calculateAnimalSightDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalSightDirection(...args);
}
export function calculateAnimalFieldOfView(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalFieldOfView(...args);
}
export function calculateAnimalHearingRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalHearingRange(...args);
}
export function calculateAnimalSmellRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalSmellRange(...args);
}
export function calculateAnimalAttackRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalAttackRange(...args);
}
export function calculateAnimalBitePoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBitePoint(...args);
}
export function calculateAnimalBiteDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalBiteDirection(...args);
}
export function calculateAnimalCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimalCollision(...args);
}
export function getBirdPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdPosition(...args);
}
export function getBirdHeadPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdHeadPosition(...args);
}
export function getBirdBeakPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdBeakPosition(...args);
}
export function getBirdEyePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdEyePosition(...args);
}
export function getBirdBodyCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdBodyCenter(...args);
}
export function getBirdWingRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdWingRootPosition(...args);
}
export function getBirdLeftWingTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdLeftWingTip(...args);
}
export function getBirdRightWingTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdRightWingTip(...args);
}
export function getBirdWingCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdWingCenter(...args);
}
export function getBirdTailTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdTailTipPosition(...args);
}
export function getBirdLeftFootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdLeftFootPosition(...args);
}
export function getBirdRightFootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBirdRightFootPosition(...args);
}
export function calculateBirdWingspan(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingspan(...args);
}
export function calculateBirdWingLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingLength(...args);
}
export function calculateBirdWingArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingArea(...args);
}
export function calculateBirdWingAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingAngle(...args);
}
export function calculateBirdWingFlapAmplitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingFlapAmplitude(...args);
}
export function calculateBirdWingFlapFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingFlapFrequency(...args);
}
export function calculateBirdWingFlapPhase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingFlapPhase(...args);
}
export function calculateBirdWingVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingVelocity(...args);
}
export function calculateBirdWingAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdWingAcceleration(...args);
}
export function calculateBirdFlightDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFlightDirection(...args);
}
export function calculateBirdFlightSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFlightSpeed(...args);
}
export function calculateBirdFlightAltitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFlightAltitude(...args);
}
export function calculateBirdFlightPath(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFlightPath(...args);
}
export function calculateBirdGlideAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdGlideAngle(...args);
}
export function calculateBirdTurnRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdTurnRadius(...args);
}
export function calculateBirdBankAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdBankAngle(...args);
}
export function calculateBirdLiftForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdLiftForce(...args);
}
export function calculateBirdDragForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdDragForce(...args);
}
export function calculateBirdHoverPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdHoverPosition(...args);
}
export function calculateBirdLandingPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdLandingPoint(...args);
}
export function calculateBirdTakeoffVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdTakeoffVelocity(...args);
}
export function calculateBirdObstacleAvoidance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdObstacleAvoidance(...args);
}
export function calculateBirdFormationPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFormationPosition(...args);
}
export function calculateBirdFormationSpacing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdFormationSpacing(...args);
}
export function calculateBirdTargetIntercept(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdTargetIntercept(...args);
}
export function calculateBirdBeakDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdBeakDirection(...args);
}
export function calculateBirdTalonsPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdTalonsPosition(...args);
}
export function calculateBirdCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBirdCollision(...args);
}
export function getPlantPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPlantPosition(...args);
}
export function getPlantRootPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPlantRootPosition(...args);
}
export function getPlantStemPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPlantStemPosition(...args);
}
export function getPlantStemBase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPlantStemBase(...args);
}
export function getPlantStemTip(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getPlantStemTip(...args);
}
export function getTreeTrunkPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeTrunkPosition(...args);
}
export function getTreeTrunkCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeTrunkCenter(...args);
}
export function getTreeTrunkBase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeTrunkBase(...args);
}
export function getTreeTrunkTop(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeTrunkTop(...args);
}
export function getTreeCanopyCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeCanopyCenter(...args);
}
export function getTreeCanopyTop(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeCanopyTop(...args);
}
export function getTreeCanopyBottom(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeCanopyBottom(...args);
}
export function getTreeCanopyLeft(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeCanopyLeft(...args);
}
export function getTreeCanopyRight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getTreeCanopyRight(...args);
}
export function getBranchPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBranchPosition(...args);
}
export function getBranchStartPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBranchStartPosition(...args);
}
export function getBranchEndPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBranchEndPosition(...args);
}
export function getBranchJunctionPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBranchJunctionPosition(...args);
}
export function getLeafPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeafPosition(...args);
}
export function getLeafTipPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeafTipPosition(...args);
}
export function getLeafBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeafBasePosition(...args);
}
export function getLeafCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getLeafCenter(...args);
}
export function getFlowerPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFlowerPosition(...args);
}
export function getFlowerCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFlowerCenter(...args);
}
export function getFruitPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFruitPosition(...args);
}
export function getFruitCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFruitCenter(...args);
}
export function getSeedPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getSeedPosition(...args);
}
export function calculatePlantHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePlantHeight(...args);
}
export function calculateTreeHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeHeight(...args);
}
export function calculateTreeTrunkDiameter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeTrunkDiameter(...args);
}
export function calculateTreeTrunkRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeTrunkRadius(...args);
}
export function calculateTreeCanopyRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeCanopyRadius(...args);
}
export function calculateTreeCanopyVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeCanopyVolume(...args);
}
export function calculateTreeCanopyBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeCanopyBounds(...args);
}
export function calculateTreeBranchLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeBranchLength(...args);
}
export function calculateBranchAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBranchAngle(...args);
}
export function calculateBranchCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBranchCurvature(...args);
}
export function calculateBranchTaper(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBranchTaper(...args);
}
export function calculateLeafLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafLength(...args);
}
export function calculateLeafWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafWidth(...args);
}
export function calculateLeafNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafNormal(...args);
}
export function calculateLeafOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafOrientation(...args);
}
export function calculateLeafCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafCurvature(...args);
}
export function calculateLeafArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLeafArea(...args);
}
export function calculateFlowerRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFlowerRadius(...args);
}
export function calculateFruitRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFruitRadius(...args);
}
export function calculateRootDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRootDepth(...args);
}
export function calculateRootSpread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRootSpread(...args);
}
export function calculatePlantWindDeflection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePlantWindDeflection(...args);
}
export function calculateTreeWindSway(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTreeWindSway(...args);
}
export function getObjectPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectPosition(...args);
}
export function getObjectCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectCenter(...args);
}
export function getObjectRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectRotation(...args);
}
export function getObjectScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectScale(...args);
}
export function getObjectForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectForwardVector(...args);
}
export function getObjectRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectRightVector(...args);
}
export function getObjectUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectUpVector(...args);
}
export function getObjectBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectBoundingBox(...args);
}
export function getObjectBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectBoundingSphere(...args);
}
export function getObjectBoundingCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getObjectBoundingCapsule(...args);
}
export function calculateObjectLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectLength(...args);
}
export function calculateObjectWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectWidth(...args);
}
export function calculateObjectHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectHeight(...args);
}
export function calculateObjectDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDepth(...args);
}
export function calculateObjectVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectVolume(...args);
}
export function calculateObjectSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectSurfaceArea(...args);
}
export function calculateObjectCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectCenterOfMass(...args);
}
export function calculateObjectDensity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDensity(...args);
}
export function calculateObjectInertiaTensor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectInertiaTensor(...args);
}
export function calculateObjectWorldTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectWorldTransform(...args);
}
export function calculateObjectLocalTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectLocalTransform(...args);
}
export function calculateObjectPivotOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectPivotOffset(...args);
}
export function calculateObjectOriginOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectOriginOffset(...args);
}
export function calculateObjectDistanceToGround(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToGround(...args);
}
export function calculateObjectDistanceToWall(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToWall(...args);
}
export function calculateObjectDistanceToCeiling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToCeiling(...args);
}
export function calculateObjectDistanceToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToCamera(...args);
}
export function calculateObjectDistanceToPlayer(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToPlayer(...args);
}
export function calculateObjectDistanceToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDistanceToTarget(...args);
}
export function calculateObjectClosestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectClosestPoint(...args);
}
export function calculateObjectFarthestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectFarthestPoint(...args);
}
export function calculateObjectSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectSurfaceNormal(...args);
}
export function calculateObjectTangent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectTangent(...args);
}
export function calculateObjectCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectCurvature(...args);
}
export function calculateObjectIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectIntersection(...args);
}
export function calculateObjectOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectOverlap(...args);
}
export function calculateObjectCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectCollision(...args);
}
export function calculateObjectPenetrationDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectPenetrationDepth(...args);
}
export function calculateObjectSeparationVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectSeparationVector(...args);
}
export function calculateObjectContactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectContactPoint(...args);
}
export function calculateObjectContactNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectContactNormal(...args);
}
export function calculateObjectContactArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectContactArea(...args);
}
export function calculateObjectFrictionForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectFrictionForce(...args);
}
export function calculateObjectNormalForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectNormalForce(...args);
}
export function calculateObjectGravityForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectGravityForce(...args);
}
export function calculateObjectBuoyancyForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectBuoyancyForce(...args);
}
export function calculateObjectDragForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectDragForce(...args);
}
export function calculateObjectLiftForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectLiftForce(...args);
}
export function calculateObjectVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectVelocity(...args);
}
export function calculateObjectAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectAcceleration(...args);
}
export function getCameraPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraPosition(...args);
}
export function getCameraRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraRotation(...args);
}
export function getCameraForwardVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraForwardVector(...args);
}
export function getCameraRightVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraRightVector(...args);
}
export function getCameraUpVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraUpVector(...args);
}
export function getCameraTargetPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraTargetPosition(...args);
}
export function getCameraFocalPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraFocalPoint(...args);
}
export function getCameraNearPlane(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraNearPlane(...args);
}
export function getCameraFarPlane(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraFarPlane(...args);
}
export function getCameraFieldOfView(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCameraFieldOfView(...args);
}
export function calculateCameraDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraDistance(...args);
}
export function calculateCameraOrbitPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraOrbitPosition(...args);
}
export function calculateCameraOrbitAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraOrbitAngle(...args);
}
export function calculateCameraOrbitRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraOrbitRadius(...args);
}
export function calculateCameraLookAt(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraLookAt(...args);
}
export function calculateCameraLookAtMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraLookAtMatrix(...args);
}
export function calculateCameraViewMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraViewMatrix(...args);
}
export function calculateCameraProjectionMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraProjectionMatrix(...args);
}
export function calculateCameraViewProjectionMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraViewProjectionMatrix(...args);
}
export function calculateCameraFrustum(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraFrustum(...args);
}
export function calculateCameraFrustumPlanes(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraFrustumPlanes(...args);
}
export function calculateCameraFrustumCorners(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraFrustumCorners(...args);
}
export function calculateCameraVisibility(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraVisibility(...args);
}
export function calculateCameraOcclusion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraOcclusion(...args);
}
export function calculateCameraDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraDepth(...args);
}
export function calculateCameraScreenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraScreenPosition(...args);
}
export function calculateCameraScreenRay(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraScreenRay(...args);
}
export function calculateCameraWorldRay(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraWorldRay(...args);
}
export function calculateCameraPickingRay(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraPickingRay(...args);
}
export function calculateCameraRayIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCameraRayIntersection(...args);
}
export function calculateScreenToWorldRay(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenToWorldRay(...args);
}
export function calculateWorldToScreenPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWorldToScreenPosition(...args);
}
export function calculateScreenToWorldPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenToWorldPosition(...args);
}
export function calculateViewportAspectRatio(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateViewportAspectRatio(...args);
}
export function calculateViewportCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateViewportCenter(...args);
}
export function calculateViewportBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateViewportBounds(...args);
}
export function calculateScreenSpaceDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceDistance(...args);
}
export function calculateScreenSpaceAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceAngle(...args);
}
export function calculateScreenSpaceBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceBoundingBox(...args);
}
export function calculateScreenSpaceBoundingSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceBoundingSphere(...args);
}
export function calculateScreenSpaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceArea(...args);
}
export function calculateScreenSpaceScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSpaceScale(...args);
}
export function calculatePixelDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePixelDistance(...args);
}
export function calculatePixelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePixelPosition(...args);
}
export function calculatePixelToWorldScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePixelToWorldScale(...args);
}
export function calculateWorldToPixelScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWorldToPixelScale(...args);
}
export function calculateUIAnchorPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIAnchorPosition(...args);
}
export function calculateUIWorldAnchor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIWorldAnchor(...args);
}
export function calculateUIBillboardRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIBillboardRotation(...args);
}
export function calculateUIBillboardPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIBillboardPosition(...args);
}
export function calculateUIFollowTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIFollowTarget(...args);
}
export function calculateUIFollowOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIFollowOffset(...args);
}
export function calculateUIVisibility(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIVisibility(...args);
}
export function calculateUIOcclusion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIOcclusion(...args);
}
export function calculateUIDistanceScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIDistanceScale(...args);
}
export function calculateUIDepthOrder(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIDepthOrder(...args);
}
export function calculateUIProjectionBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIProjectionBounds(...args);
}
export function calculateUIInteractionRay(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIInteractionRay(...args);
}
export function calculateUIHitTest(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIHitTest(...args);
}
export function calculateUIWorldToScreenOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateUIWorldToScreenOffset(...args);
}
export function calculateAABBOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAABBOverlap(...args);
}
export function calculateOBBOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateOBBOverlap(...args);
}
export function calculateSphereOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSphereOverlap(...args);
}
export function calculateCapsuleOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCapsuleOverlap(...args);
}
export function calculateCylinderOverlap(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCylinderOverlap(...args);
}
export function calculatePlaneIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePlaneIntersection(...args);
}
export function calculateRayPlaneIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRayPlaneIntersection(...args);
}
export function calculateRaySphereIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRaySphereIntersection(...args);
}
export function calculateRayBoxIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRayBoxIntersection(...args);
}
export function calculateRayCapsuleIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRayCapsuleIntersection(...args);
}
export function calculateRayTriangleIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRayTriangleIntersection(...args);
}
export function calculateSegmentSegmentDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSegmentSegmentDistance(...args);
}
export function calculateSegmentTriangleIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSegmentTriangleIntersection(...args);
}
export function calculateTriangleTriangleIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTriangleTriangleIntersection(...args);
}
export function calculateMeshMeshIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMeshMeshIntersection(...args);
}
export function calculateMeshSurfaceDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMeshSurfaceDistance(...args);
}
export function calculateClosestPointOnTriangle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnTriangle(...args);
}
export function calculateClosestPointOnSegment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnSegment(...args);
}
export function calculateClosestPointOnPlane(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnPlane(...args);
}
export function calculateClosestPointOnSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnSphere(...args);
}
export function calculateClosestPointOnBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnBox(...args);
}
export function calculateClosestPointOnCapsule(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnCapsule(...args);
}
export function calculateClosestPointOnMesh(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClosestPointOnMesh(...args);
}
export function calculateContactManifold(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateContactManifold(...args);
}
export function calculateCollisionNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCollisionNormal(...args);
}
export function calculateCollisionDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCollisionDepth(...args);
}
export function calculateCollisionTimeOfImpact(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCollisionTimeOfImpact(...args);
}
export function calculateSweptAABB(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSweptAABB(...args);
}
export function calculateSweptSphere(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSweptSphere(...args);
}
export function calculateContinuousCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateContinuousCollision(...args);
}
export function calculateRigidBodyVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRigidBodyVelocity(...args);
}
export function calculateRigidBodyAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRigidBodyAcceleration(...args);
}
export function calculateRigidBodyAngularVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRigidBodyAngularVelocity(...args);
}
export function calculateRigidBodyAngularAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRigidBodyAngularAcceleration(...args);
}
export function calculateRigidBodyMomentum(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRigidBodyMomentum(...args);
}
export function calculateAngularMomentum(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAngularMomentum(...args);
}
export function calculateImpulse(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateImpulse(...args);
}
export function calculateCollisionImpulse(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCollisionImpulse(...args);
}
export function calculateRestitutionVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRestitutionVelocity(...args);
}
export function calculateFrictionImpulse(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFrictionImpulse(...args);
}
export function calculateGravityAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGravityAcceleration(...args);
}
export function calculateSpringForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpringForce(...args);
}
export function calculateDampingForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDampingForce(...args);
}
export function calculateConstraintForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateConstraintForce(...args);
}
export function calculateConstraintError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateConstraintError(...args);
}
export function calculatePhysicsIntegration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePhysicsIntegration(...args);
}
export function calculateVerletIntegration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVerletIntegration(...args);
}
export function calculateRungeKuttaIntegration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRungeKuttaIntegration(...args);
}
export function calculatePhysicsSubsteps(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePhysicsSubsteps(...args);
}
export function calculatePhysicsStability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePhysicsStability(...args);
}
export function getProjectilePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getProjectilePosition(...args);
}
export function getProjectileOrigin(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getProjectileOrigin(...args);
}
export function getProjectileTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getProjectileTarget(...args);
}
export function calculateProjectileDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileDirection(...args);
}
export function calculateProjectileVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileVelocity(...args);
}
export function calculateProjectileAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileAcceleration(...args);
}
export function calculateProjectileTrajectory(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileTrajectory(...args);
}
export function calculateProjectileFlightTime(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileFlightTime(...args);
}
export function calculateProjectileImpactPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileImpactPoint(...args);
}
export function calculateProjectileImpactNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileImpactNormal(...args);
}
export function calculateProjectileSpreadAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileSpreadAngle(...args);
}
export function calculateProjectileDropDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileDropDistance(...args);
}
export function calculateProjectileWindDrift(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileWindDrift(...args);
}
export function calculateProjectileCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileCollision(...args);
}
export function calculateProjectileDistanceToTarget(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateProjectileDistanceToTarget(...args);
}
export function getItemPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getItemPosition(...args);
}
export function getItemCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getItemCenter(...args);
}
export function getItemRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getItemRotation(...args);
}
export function getItemPickupPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getItemPickupPosition(...args);
}
export function calculateItemDistanceToPlayer(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemDistanceToPlayer(...args);
}
export function calculateItemPickupRange(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemPickupRange(...args);
}
export function calculateItemPickupOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemPickupOffset(...args);
}
export function calculateItemMagnetDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemMagnetDirection(...args);
}
export function calculateItemMagnetVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemMagnetVelocity(...args);
}
export function calculateItemHoverHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemHoverHeight(...args);
}
export function calculateItemRotationSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemRotationSpeed(...args);
}
export function calculateItemBobAmplitude(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemBobAmplitude(...args);
}
export function calculateItemBobFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateItemBobFrequency(...args);
}
export function calculateParticlePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticlePosition(...args);
}
export function calculateParticleVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleVelocity(...args);
}
export function calculateParticleAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleAcceleration(...args);
}
export function calculateParticleLifetime(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleLifetime(...args);
}
export function calculateParticleScale(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleScale(...args);
}
export function calculateParticleRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleRotation(...args);
}
export function calculateParticleColorInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleColorInterpolation(...args);
}
export function calculateParticleOpacity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleOpacity(...args);
}
export function calculateParticleCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleCollision(...args);
}
export function calculateParticleAttractorForce(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleAttractorForce(...args);
}
export function calculateParticleFieldDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleFieldDirection(...args);
}
export function calculateEffectOrigin(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectOrigin(...args);
}
export function calculateEffectDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectDirection(...args);
}
export function calculateEffectRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectRadius(...args);
}
export function calculateEffectExpansion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectExpansion(...args);
}
export function calculateEffectFalloff(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectFalloff(...args);
}
export function calculateEffectDuration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectDuration(...args);
}
export function calculateEffectIntensity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectIntensity(...args);
}
export function calculateEffectOcclusion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectOcclusion(...args);
}
export function calculateEffectDistanceToCamera(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectDistanceToCamera(...args);
}
export function calculateEffectScreenBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectScreenBounds(...args);
}
export function calculateEffectLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEffectLOD(...args);
}
export function calculateLinearInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLinearInterpolation(...args);
}
export function calculateBilinearInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBilinearInterpolation(...args);
}
export function calculateTrilinearInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrilinearInterpolation(...args);
}
export function calculateCubicInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCubicInterpolation(...args);
}
export function calculateCatmullRomSpline(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCatmullRomSpline(...args);
}
export function calculateBezierCurve(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBezierCurve(...args);
}
export function calculateQuadraticBezier(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateQuadraticBezier(...args);
}
export function calculateCubicBezier(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCubicBezier(...args);
}
export function calculateBezierTangent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBezierTangent(...args);
}
export function calculateBezierNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBezierNormal(...args);
}
export function calculateBezierCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBezierCurvature(...args);
}
export function calculateSplinePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplinePosition(...args);
}
export function calculateSplineTangent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineTangent(...args);
}
export function calculateSplineNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineNormal(...args);
}
export function calculateSplineBinormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineBinormal(...args);
}
export function calculateSplineCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineCurvature(...args);
}
export function calculateSplineArcLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineArcLength(...args);
}
export function calculateSplineParameterAtDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineParameterAtDistance(...args);
}
export function calculateSplineClosestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineClosestPoint(...args);
}
export function calculateSplineProjection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineProjection(...args);
}
export function calculateSplineUniformSampling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineUniformSampling(...args);
}
export function calculateSplineFrame(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSplineFrame(...args);
}
export function calculateTrajectoryPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryPosition(...args);
}
export function calculateTrajectoryVelocity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryVelocity(...args);
}
export function calculateTrajectoryAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryAcceleration(...args);
}
export function calculateTrajectoryCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryCurvature(...args);
}
export function calculateTrajectoryTangent(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryTangent(...args);
}
export function calculateTrajectoryNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryNormal(...args);
}
export function calculateTrajectoryBinormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryBinormal(...args);
}
export function calculateTrajectoryClosestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryClosestPoint(...args);
}
export function calculateTrajectoryDeviation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryDeviation(...args);
}
export function calculateTrajectoryLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryLength(...args);
}
export function calculateTrajectoryDuration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryDuration(...args);
}
export function calculateTrajectorySpeedProfile(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectorySpeedProfile(...args);
}
export function calculateTrajectoryTimeParameterization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryTimeParameterization(...args);
}
export function calculateTrajectorySmoothing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectorySmoothing(...args);
}
export function calculateTrajectoryOptimization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryOptimization(...args);
}
export function calculateTrajectoryCollisionAvoidance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryCollisionAvoidance(...args);
}
export function calculateTrajectoryReachability(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryReachability(...args);
}
export function calculateTrajectoryPrediction(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTrajectoryPrediction(...args);
}
export function calculateMatrixMultiplication(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixMultiplication(...args);
}
export function calculateMatrixInverse(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixInverse(...args);
}
export function calculateMatrixTranspose(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixTranspose(...args);
}
export function calculateMatrixDeterminant(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixDeterminant(...args);
}
export function calculateMatrixTrace(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixTrace(...args);
}
export function calculateMatrixDecomposition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixDecomposition(...args);
}
export function calculateMatrixOrthogonalization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixOrthogonalization(...args);
}
export function calculateMatrixOrthonormalization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMatrixOrthonormalization(...args);
}
export function calculateAffineTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAffineTransform(...args);
}
export function calculateHomogeneousTransform(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHomogeneousTransform(...args);
}
export function calculateTranslationMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTranslationMatrix(...args);
}
export function calculateScaleMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScaleMatrix(...args);
}
export function calculateRotationXMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationXMatrix(...args);
}
export function calculateRotationYMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationYMatrix(...args);
}
export function calculateRotationZMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRotationZMatrix(...args);
}
export function calculateNormalMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNormalMatrix(...args);
}
export function calculateTransformHierarchy(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformHierarchy(...args);
}
export function calculateTransformComposition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformComposition(...args);
}
export function calculateTransformDecomposition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformDecomposition(...args);
}
export function calculateTransformInterpolation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformInterpolation(...args);
}
export function calculateTransformError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformError(...args);
}
export function calculateCoordinateBasis(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateBasis(...args);
}
export function calculateCoordinateConversion(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateConversion(...args);
}
export function calculateCoordinateNormalization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateNormalization(...args);
}
export function calculateCoordinateQuantization(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateQuantization(...args);
}
export function calculateCoordinateClamping(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateClamping(...args);
}
export function calculateCoordinateWrapping(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateWrapping(...args);
}
export function calculateCoordinateSnapping(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateSnapping(...args);
}
export function calculateCoordinateRounding(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinateRounding(...args);
}
export function calculateCoordinatePrecisionError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCoordinatePrecisionError(...args);
}
export function getGridCellPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getGridCellPosition(...args);
}
export function getGridCellCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getGridCellCenter(...args);
}
export function getGridCellBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getGridCellBounds(...args);
}
export function calculateGridCellIndex(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridCellIndex(...args);
}
export function calculateGridCoordinates(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridCoordinates(...args);
}
export function calculateGridDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridDistance(...args);
}
export function calculateGridNeighborCells(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridNeighborCells(...args);
}
export function calculateGridWorldPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridWorldPosition(...args);
}
export function calculateGridWorldToCell(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridWorldToCell(...args);
}
export function calculateGridOccupancy(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridOccupancy(...args);
}
export function calculateGridTraversalCost(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridTraversalCost(...args);
}
export function calculateGridPathDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGridPathDistance(...args);
}
export function calculateTerrainHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainHeight(...args);
}
export function calculateTerrainNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainNormal(...args);
}
export function calculateTerrainSlope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainSlope(...args);
}
export function calculateTerrainCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainCurvature(...args);
}
export function calculateTerrainSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainSurfaceArea(...args);
}
export function calculateTerrainVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainVolume(...args);
}
export function calculateTerrainBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainBounds(...args);
}
export function calculateTerrainClosestPoint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainClosestPoint(...args);
}
export function calculateTerrainRayIntersection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainRayIntersection(...args);
}
export function calculateTerrainCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainCollision(...args);
}
export function calculateTerrainGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainGroundClearance(...args);
}
export function calculateTerrainPathSlope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainPathSlope(...args);
}
export function calculateTerrainNavigationCost(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTerrainNavigationCost(...args);
}
export function calculateWaterSurfaceHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWaterSurfaceHeight(...args);
}
export function calculateWaterSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWaterSurfaceNormal(...args);
}
export function calculateWaterDepth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWaterDepth(...args);
}
export function calculateWaterBuoyancy(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWaterBuoyancy(...args);
}
export function calculateEnvironmentWindVector(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateEnvironmentWindVector(...args);
}
export function calculateObjectLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateObjectLOD(...args);
}
export function calculateCharacterLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCharacterLOD(...args);
}
export function calculateMeshLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateMeshLOD(...args);
}
export function calculateAnimationLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationLOD(...args);
}
export function calculateSkeletonLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSkeletonLOD(...args);
}
export function calculateShadowLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShadowLOD(...args);
}
export function calculateParticleLOD(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateParticleLOD(...args);
}
export function calculateLODTransition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODTransition(...args);
}
export function calculateLODThreshold(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODThreshold(...args);
}
export function calculateLODScreenSize(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODScreenSize(...args);
}
export function calculateLODProjectedError(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODProjectedError(...args);
}
export function calculateLODVisibility(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODVisibility(...args);
}
export function calculateLODUpdateFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODUpdateFrequency(...args);
}
export function calculateLODSelectionScore(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateLODSelectionScore(...args);
}
export function calculateOcclusionBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateOcclusionBounds(...args);
}
export function calculateOcclusionVisibility(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateOcclusionVisibility(...args);
}
export function calculateFrustumCulling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFrustumCulling(...args);
}
export function calculateDistanceCulling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDistanceCulling(...args);
}
export function calculateScreenSizeCulling(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateScreenSizeCulling(...args);
}
export function calculateAnimationUpdatePriority(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateAnimationUpdatePriority(...args);
}
export function calculateBoneUpdatePriority(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoneUpdatePriority(...args);
}
export function calculatePhysicsUpdatePriority(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePhysicsUpdatePriority(...args);
}
export function calculateCollisionUpdatePriority(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCollisionUpdatePriority(...args);
}
export function calculateSpatialUpdateFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialUpdateFrequency(...args);
}
export function calculateTransformUpdateFrequency(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateTransformUpdateFrequency(...args);
}
export function calculateBoundingVolumeUpdate(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBoundingVolumeUpdate(...args);
}
export function calculateSpatialPartitionIndex(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialPartitionIndex(...args);
}
export function calculateOctreeNode(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateOctreeNode(...args);
}
export function calculateQuadtreeNode(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateQuadtreeNode(...args);
}
export function calculateBVHTraversalCost(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBVHTraversalCost(...args);
}
export function getClothingPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getClothingPosition(...args);
}
export function getClothingAnchor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getClothingAnchor(...args);
}
export function getClothingSurfacePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getClothingSurfacePosition(...args);
}
export function getClothingVertexPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getClothingVertexPosition(...args);
}
export function calculateClothingFitOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingFitOffset(...args);
}
export function calculateClothingBodyDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingBodyDistance(...args);
}
export function calculateClothingPenetration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingPenetration(...args);
}
export function calculateClothingCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingCollision(...args);
}
export function calculateClothingDeformation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingDeformation(...args);
}
export function calculateClothingWrinkleCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingWrinkleCurvature(...args);
}
export function calculateClothingCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingCenterOfMass(...args);
}
export function calculateClothingBoundingBox(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateClothingBoundingBox(...args);
}
export function getHelmetPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHelmetPosition(...args);
}
export function getHelmetAnchor(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getHelmetAnchor(...args);
}
export function calculateHelmetHeadOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHelmetHeadOffset(...args);
}
export function calculateHelmetOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHelmetOrientation(...args);
}
export function calculateHelmetCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateHelmetCollision(...args);
}
export function getGlassesPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getGlassesPosition(...args);
}
export function calculateGlassesEyeAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGlassesEyeAlignment(...args);
}
export function calculateGlassesHeadOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateGlassesHeadOffset(...args);
}
export function getBackpackPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBackpackPosition(...args);
}
export function calculateBackpackSpineOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBackpackSpineOffset(...args);
}
export function calculateBackpackCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBackpackCenterOfMass(...args);
}
export function calculateBackpackSwing(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBackpackSwing(...args);
}
export function getWeaponPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWeaponPosition(...args);
}
export function getWeaponGripPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWeaponGripPosition(...args);
}
export function getWeaponMuzzlePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWeaponMuzzlePosition(...args);
}
export function getWeaponStockPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWeaponStockPosition(...args);
}
export function calculateWeaponAimDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponAimDirection(...args);
}
export function calculateWeaponHandAlignment(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponHandAlignment(...args);
}
export function calculateWeaponRecoilOffset(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponRecoilOffset(...args);
}
export function calculateWeaponRecoilRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponRecoilRotation(...args);
}
export function calculateWeaponMuzzleDirection(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponMuzzleDirection(...args);
}
export function calculateWeaponCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeaponCollision(...args);
}
export function getShieldPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getShieldPosition(...args);
}
export function getShieldCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getShieldCenter(...args);
}
export function calculateShieldOrientation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShieldOrientation(...args);
}
export function calculateShieldSurfaceNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShieldSurfaceNormal(...args);
}
export function calculateShieldCoverageAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShieldCoverageAngle(...args);
}
export function calculateShieldCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateShieldCollision(...args);
}
export function getVehiclePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehiclePosition(...args);
}
export function getVehicleCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleCenter(...args);
}
export function getVehicleFrontPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleFrontPosition(...args);
}
export function getVehicleRearPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleRearPosition(...args);
}
export function getVehicleLeftPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleLeftPosition(...args);
}
export function getVehicleRightPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleRightPosition(...args);
}
export function getVehicleRoofPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleRoofPosition(...args);
}
export function getVehicleUndersidePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleUndersidePosition(...args);
}
export function getVehicleWheelPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleWheelPosition(...args);
}
export function getVehicleAxlePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getVehicleAxlePosition(...args);
}
export function calculateVehicleLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleLength(...args);
}
export function calculateVehicleWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleWidth(...args);
}
export function calculateVehicleHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleHeight(...args);
}
export function calculateVehicleWheelbase(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleWheelbase(...args);
}
export function calculateVehicleTrackWidth(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleTrackWidth(...args);
}
export function calculateVehicleTurningRadius(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleTurningRadius(...args);
}
export function calculateVehicleTurningAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleTurningAngle(...args);
}
export function calculateVehicleSpeed(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleSpeed(...args);
}
export function calculateVehicleAcceleration(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleAcceleration(...args);
}
export function calculateVehicleBrakingDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleBrakingDistance(...args);
}
export function calculateVehicleStoppingTime(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleStoppingTime(...args);
}
export function calculateVehicleHeading(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleHeading(...args);
}
export function calculateVehicleYawRate(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleYawRate(...args);
}
export function calculateVehiclePitchAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehiclePitchAngle(...args);
}
export function calculateVehicleRollAngle(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleRollAngle(...args);
}
export function calculateVehicleGroundClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleGroundClearance(...args);
}
export function calculateVehicleCenterOfMass(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleCenterOfMass(...args);
}
export function calculateVehicleCollisionBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleCollisionBounds(...args);
}
export function calculateVehiclePathCurvature(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehiclePathCurvature(...args);
}
export function calculateVehicleWheelRotation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateVehicleWheelRotation(...args);
}
export function getBuildingPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBuildingPosition(...args);
}
export function getBuildingCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBuildingCenter(...args);
}
export function getBuildingBasePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBuildingBasePosition(...args);
}
export function getBuildingTopPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBuildingTopPosition(...args);
}
export function getBuildingCornerPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getBuildingCornerPosition(...args);
}
export function getWallCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWallCenter(...args);
}
export function getWallSurfacePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWallSurfacePosition(...args);
}
export function getWallNormal(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWallNormal(...args);
}
export function getFloorPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getFloorPosition(...args);
}
export function getCeilingPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getCeilingPosition(...args);
}
export function getDoorPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getDoorPosition(...args);
}
export function getDoorHandlePosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getDoorHandlePosition(...args);
}
export function getWindowPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getWindowPosition(...args);
}
export function getStairPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getStairPosition(...args);
}
export function getRoofPosition(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).getRoofPosition(...args);
}
export function calculateBuildingHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBuildingHeight(...args);
}
export function calculateBuildingFootprint(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBuildingFootprint(...args);
}
export function calculateBuildingVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBuildingVolume(...args);
}
export function calculateWallLength(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWallLength(...args);
}
export function calculateWallHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWallHeight(...args);
}
export function calculateWallThickness(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWallThickness(...args);
}
export function calculateWallSurfaceArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWallSurfaceArea(...args);
}
export function calculateFloorArea(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFloorArea(...args);
}
export function calculateFloorElevation(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFloorElevation(...args);
}
export function calculateCeilingHeight(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateCeilingHeight(...args);
}
export function calculateDoorClearance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateDoorClearance(...args);
}
export function calculateWindowOpening(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWindowOpening(...args);
}
export function calculateStairRise(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStairRise(...args);
}
export function calculateStairTread(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateStairTread(...args);
}
export function calculateRoofSlope(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoofSlope(...args);
}
export function calculateRoomBounds(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoomBounds(...args);
}
export function calculateRoomCenter(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoomCenter(...args);
}
export function calculateRoomVolume(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoomVolume(...args);
}
export function calculateRoomNavigationDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateRoomNavigationDistance(...args);
}
export function calculateBuildingCollision(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateBuildingCollision(...args);
}
export function calculateSpatialDistanceMatrix(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialDistanceMatrix(...args);
}
export function calculatePairwiseDistances(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculatePairwiseDistances(...args);
}
export function calculateNearestNeighborDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateNearestNeighborDistance(...args);
}
export function calculateFarthestNeighborDistance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateFarthestNeighborDistance(...args);
}
export function calculateSpatialCentroid(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialCentroid(...args);
}
export function calculateWeightedCentroid(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateWeightedCentroid(...args);
}
export function calculateSpatialMedian(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialMedian(...args);
}
export function calculateSpatialVariance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialVariance(...args);
}
export function calculateSpatialCovariance(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialCovariance(...args);
}
export function calculateSpatialDistribution(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialDistribution(...args);
}
export function calculateSpatialDensity(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialDensity(...args);
}
export function calculateSpatialClustering(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialClustering(...args);
}
export function calculateSpatialOutliers(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialOutliers(...args);
}
export function calculateSpatialSymmetry(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialSymmetry(...args);
}
export function calculateSpatialOverlapRatio(...args: any[]): any {
  return (getActiveSpatialUISystem() as any).calculateSpatialOverlapRatio(...args);
}
