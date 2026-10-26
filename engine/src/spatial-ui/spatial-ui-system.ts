/**
 * @file spatial-ui-system.ts
 * @module @aetheria/engine/spatial-ui/spatial-ui-system
 * @description Master Spatial UI, Math & Geometry Orchestrator System (All 1,800 functions).
 */

import { DistanceVectorMathSubsystem } from './subsystems/distance-vector-math-subsystem.js';
import { AnatomicalUpperBodySubsystem } from './subsystems/anatomical-upper-body-subsystem.js';
import { AnatomicalHandDigitsSubsystem } from './subsystems/anatomical-hand-digits-subsystem.js';
import { AnatomicalLowerBodySubsystem } from './subsystems/anatomical-lower-body-subsystem.js';
import { SkeletalKinematicsCharacterSubsystem } from './subsystems/skeletal-kinematics-character-subsystem.js';
import { EntitiesFaunaFloraSubsystem } from './subsystems/entities-fauna-flora-subsystem.js';
import { CameraViewportUISubsystem } from './subsystems/camera-viewport-ui-subsystem.js';
import { PhysicsCollisionProjectileSubsystem } from './subsystems/physics-collision-projectile-subsystem.js';
import { CurvesMatricesEnvironmentSubsystem } from './subsystems/curves-matrices-environment-subsystem.js';
import { SpatialEquipmentArchitectureSubsystem } from './subsystems/spatial-equipment-architecture-subsystem.js';
import type { SpatialUIConfig } from './types.js';

export class SpatialUISystem {
  public distanceVectorMath: DistanceVectorMathSubsystem;
  public anatomicalUpperBody: AnatomicalUpperBodySubsystem;
  public anatomicalHandDigits: AnatomicalHandDigitsSubsystem;
  public anatomicalLowerBody: AnatomicalLowerBodySubsystem;
  public skeletalKinematicsCharacter: SkeletalKinematicsCharacterSubsystem;
  public entitiesFaunaFlora: EntitiesFaunaFloraSubsystem;
  public cameraViewportUI: CameraViewportUISubsystem;
  public physicsCollisionProjectile: PhysicsCollisionProjectileSubsystem;
  public curvesMatricesEnvironment: CurvesMatricesEnvironmentSubsystem;
  public spatialEquipmentArchitecture: SpatialEquipmentArchitectureSubsystem;

  public config: SpatialUIConfig;

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? {
      screenWidth: 1920,
      screenHeight: 1080,
      fov: 60,
      nearPlane: 0.1,
      farPlane: 1000,
      aspectRatio: 16 / 9,
      unitScale: 1.0,
    };

    this.distanceVectorMath = new DistanceVectorMathSubsystem(this.config);
    this.anatomicalUpperBody = new AnatomicalUpperBodySubsystem(this.config);
    this.anatomicalHandDigits = new AnatomicalHandDigitsSubsystem(this.config);
    this.anatomicalLowerBody = new AnatomicalLowerBodySubsystem(this.config);
    this.skeletalKinematicsCharacter = new SkeletalKinematicsCharacterSubsystem(this.config);
    this.entitiesFaunaFlora = new EntitiesFaunaFloraSubsystem(this.config);
    this.cameraViewportUI = new CameraViewportUISubsystem(this.config);
    this.physicsCollisionProjectile = new PhysicsCollisionProjectileSubsystem(this.config);
    this.curvesMatricesEnvironment = new CurvesMatricesEnvironmentSubsystem(this.config);
    this.spatialEquipmentArchitecture = new SpatialEquipmentArchitectureSubsystem(this.config);
  }

  /**
   * [0001] calculateDistance3D
   * Tính khoảng cách giữa hai điểm 3D.
   */
  public calculateDistance3D(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistance3D(...args);
  }

  /**
   * [0002] calculateDistance2D
   * Tính khoảng cách giữa hai điểm 2D.
   */
  public calculateDistance2D(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistance2D(...args);
  }

  /**
   * [0003] calculateHorizontalDistance
   * Tính khoảng cách theo mặt phẳng ngang.
   */
  public calculateHorizontalDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateHorizontalDistance(...args);
  }

  /**
   * [0004] calculateVerticalDistance
   * Tính khoảng cách theo phương đứng.
   */
  public calculateVerticalDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVerticalDistance(...args);
  }

  /**
   * [0005] calculateDepthDistance
   * Tính khoảng cách theo chiều sâu.
   */
  public calculateDepthDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDepthDistance(...args);
  }

  /**
   * [0006] calculateEuclideanDistance
   * Tính khoảng cách Euclid.
   */
  public calculateEuclideanDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateEuclideanDistance(...args);
  }

  /**
   * [0007] calculateManhattanDistance
   * Tính khoảng cách Manhattan.
   */
  public calculateManhattanDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateManhattanDistance(...args);
  }

  /**
   * [0008] calculateChebyshevDistance
   * Tính khoảng cách Chebyshev.
   */
  public calculateChebyshevDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateChebyshevDistance(...args);
  }

  /**
   * [0009] calculateSquaredDistance
   * Tính bình phương khoảng cách.
   */
  public calculateSquaredDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateSquaredDistance(...args);
  }

  /**
   * [0010] calculateDistanceToOrigin
   * Tính khoảng cách đến gốc tọa độ.
   */
  public calculateDistanceToOrigin(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToOrigin(...args);
  }

  /**
   * [0011] calculateDistanceToCamera
   * Tính khoảng cách đến camera.
   */
  public calculateDistanceToCamera(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToCamera(...args);
  }

  /**
   * [0012] calculateDistanceToPlayer
   * Tính khoảng cách đến người chơi.
   */
  public calculateDistanceToPlayer(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToPlayer(...args);
  }

  /**
   * [0013] calculateDistanceToTarget
   * Tính khoảng cách đến mục tiêu.
   */
  public calculateDistanceToTarget(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToTarget(...args);
  }

  /**
   * [0014] calculateDistanceToBone
   * Tính khoảng cách đến xương.
   */
  public calculateDistanceToBone(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToBone(...args);
  }

  /**
   * [0015] calculateDistanceToJoint
   * Tính khoảng cách đến khớp.
   */
  public calculateDistanceToJoint(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToJoint(...args);
  }

  /**
   * [0016] calculateDistanceToSurface
   * Tính khoảng cách đến bề mặt.
   */
  public calculateDistanceToSurface(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToSurface(...args);
  }

  /**
   * [0017] calculateDistanceToCenter
   * Tính khoảng cách đến tâm vật thể.
   */
  public calculateDistanceToCenter(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToCenter(...args);
  }

  /**
   * [0018] calculateDistanceToEdge
   * Tính khoảng cách đến cạnh.
   */
  public calculateDistanceToEdge(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToEdge(...args);
  }

  /**
   * [0019] calculateDistanceToBoundary
   * Tính khoảng cách đến ranh giới.
   */
  public calculateDistanceToBoundary(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToBoundary(...args);
  }

  /**
   * [0020] calculateDistanceToGround
   * Tính khoảng cách đến mặt đất.
   */
  public calculateDistanceToGround(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToGround(...args);
  }

  /**
   * [0021] calculateDistanceToCeiling
   * Tính khoảng cách đến trần.
   */
  public calculateDistanceToCeiling(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToCeiling(...args);
  }

  /**
   * [0022] calculateDistanceToWall
   * Tính khoảng cách đến tường.
   */
  public calculateDistanceToWall(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToWall(...args);
  }

  /**
   * [0023] calculateDistanceToNearestObject
   * Tính khoảng cách đến vật thể gần nhất.
   */
  public calculateDistanceToNearestObject(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToNearestObject(...args);
  }

  /**
   * [0024] calculateDistanceToFarthestObject
   * Tính khoảng cách đến vật thể xa nhất.
   */
  public calculateDistanceToFarthestObject(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceToFarthestObject(...args);
  }

  /**
   * [0025] calculateMinimumDistance
   * Tìm khoảng cách nhỏ nhất.
   */
  public calculateMinimumDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateMinimumDistance(...args);
  }

  /**
   * [0026] calculateMaximumDistance
   * Tìm khoảng cách lớn nhất.
   */
  public calculateMaximumDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateMaximumDistance(...args);
  }

  /**
   * [0027] calculateAverageDistance
   * Tính khoảng cách trung bình.
   */
  public calculateAverageDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAverageDistance(...args);
  }

  /**
   * [0028] calculateDistanceAlongPath
   * Tính độ dài dọc đường đi.
   */
  public calculateDistanceAlongPath(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceAlongPath(...args);
  }

  /**
   * [0029] calculateDistanceAlongCurve
   * Tính độ dài dọc đường cong.
   */
  public calculateDistanceAlongCurve(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceAlongCurve(...args);
  }

  /**
   * [0030] calculateDistanceAlongSpline
   * Tính độ dài dọc spline.
   */
  public calculateDistanceAlongSpline(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceAlongSpline(...args);
  }

  /**
   * [0031] calculateDistanceBetweenSegments
   * Tính khoảng cách giữa hai đoạn thẳng.
   */
  public calculateDistanceBetweenSegments(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenSegments(...args);
  }

  /**
   * [0032] calculateDistanceBetweenRays
   * Tính khoảng cách giữa hai tia.
   */
  public calculateDistanceBetweenRays(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenRays(...args);
  }

  /**
   * [0033] calculateDistanceBetweenPlanes
   * Tính khoảng cách giữa hai mặt phẳng.
   */
  public calculateDistanceBetweenPlanes(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenPlanes(...args);
  }

  /**
   * [0034] calculateDistanceBetweenSpheres
   * Tính khoảng cách giữa hai hình cầu.
   */
  public calculateDistanceBetweenSpheres(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenSpheres(...args);
  }

  /**
   * [0035] calculateDistanceBetweenBoxes
   * Tính khoảng cách giữa hai hộp.
   */
  public calculateDistanceBetweenBoxes(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenBoxes(...args);
  }

  /**
   * [0036] calculateDistanceBetweenCapsules
   * Tính khoảng cách giữa hai capsule.
   */
  public calculateDistanceBetweenCapsules(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenCapsules(...args);
  }

  /**
   * [0037] calculateDistanceBetweenMeshes
   * Tính khoảng cách giữa hai mesh.
   */
  public calculateDistanceBetweenMeshes(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenMeshes(...args);
  }

  /**
   * [0038] calculateDistanceBetweenCharacters
   * Tính khoảng cách giữa hai nhân vật.
   */
  public calculateDistanceBetweenCharacters(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenCharacters(...args);
  }

  /**
   * [0039] calculateDistanceBetweenBones
   * Tính khoảng cách giữa hai xương.
   */
  public calculateDistanceBetweenBones(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenBones(...args);
  }

  /**
   * [0040] calculateDistanceBetweenHands
   * Tính khoảng cách giữa hai bàn tay.
   */
  public calculateDistanceBetweenHands(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenHands(...args);
  }

  /**
   * [0041] calculateDistanceBetweenFeet
   * Tính khoảng cách giữa hai bàn chân.
   */
  public calculateDistanceBetweenFeet(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenFeet(...args);
  }

  /**
   * [0042] calculateDistanceBetweenEyes
   * Tính khoảng cách giữa hai mắt.
   */
  public calculateDistanceBetweenEyes(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenEyes(...args);
  }

  /**
   * [0043] calculateDistanceBetweenShoulders
   * Tính khoảng cách giữa hai vai.
   */
  public calculateDistanceBetweenShoulders(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenShoulders(...args);
  }

  /**
   * [0044] calculateDistanceBetweenHips
   * Tính khoảng cách giữa hai hông.
   */
  public calculateDistanceBetweenHips(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenHips(...args);
  }

  /**
   * [0045] calculateDistanceBetweenFingers
   * Tính khoảng cách giữa các ngón tay.
   */
  public calculateDistanceBetweenFingers(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenFingers(...args);
  }

  /**
   * [0046] calculateDistanceBetweenObjects
   * Tính khoảng cách giữa hai vật thể.
   */
  public calculateDistanceBetweenObjects(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenObjects(...args);
  }

  /**
   * [0047] calculateDistanceBetweenTrees
   * Tính khoảng cách giữa hai cây.
   */
  public calculateDistanceBetweenTrees(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenTrees(...args);
  }

  /**
   * [0048] calculateDistanceBetweenAnimals
   * Tính khoảng cách giữa hai con vật.
   */
  public calculateDistanceBetweenAnimals(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenAnimals(...args);
  }

  /**
   * [0049] calculateDistanceBetweenNPCs
   * Tính khoảng cách giữa hai NPC.
   */
  public calculateDistanceBetweenNPCs(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenNPCs(...args);
  }

  /**
   * [0050] calculateDistanceBetweenBosses
   * Tính khoảng cách giữa hai boss.
   */
  public calculateDistanceBetweenBosses(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDistanceBetweenBosses(...args);
  }

  /**
   * [0051] getWorldPosition
   * Lấy tọa độ thế giới.
   */
  public getWorldPosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getWorldPosition(...args);
  }

  /**
   * [0052] getLocalPosition
   * Lấy tọa độ cục bộ.
   */
  public getLocalPosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getLocalPosition(...args);
  }

  /**
   * [0053] getParentPosition
   * Lấy tọa độ của đối tượng cha.
   */
  public getParentPosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getParentPosition(...args);
  }

  /**
   * [0054] getRelativePosition
   * Lấy tọa độ tương đối.
   */
  public getRelativePosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getRelativePosition(...args);
  }

  /**
   * [0055] getAbsolutePosition
   * Lấy tọa độ tuyệt đối.
   */
  public getAbsolutePosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getAbsolutePosition(...args);
  }

  /**
   * [0056] getScreenPosition
   * Chuyển vị trí 3D sang tọa độ màn hình.
   */
  public getScreenPosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getScreenPosition(...args);
  }

  /**
   * [0057] getViewportPosition
   * Lấy vị trí trong viewport.
   */
  public getViewportPosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getViewportPosition(...args);
  }

  /**
   * [0058] getNormalizedDeviceCoordinates
   * Chuyển sang tọa độ NDC.
   */
  public getNormalizedDeviceCoordinates(...args: any[]): any {
    return (this.distanceVectorMath as any).getNormalizedDeviceCoordinates(...args);
  }

  /**
   * [0059] getCameraSpacePosition
   * Lấy tọa độ trong không gian camera.
   */
  public getCameraSpacePosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getCameraSpacePosition(...args);
  }

  /**
   * [0060] getObjectSpacePosition
   * Lấy tọa độ trong không gian vật thể.
   */
  public getObjectSpacePosition(...args: any[]): any {
    return (this.distanceVectorMath as any).getObjectSpacePosition(...args);
  }

  /**
   * [0061] transformLocalToWorld
   * Chuyển tọa độ cục bộ sang thế giới.
   */
  public transformLocalToWorld(...args: any[]): any {
    return (this.distanceVectorMath as any).transformLocalToWorld(...args);
  }

  /**
   * [0062] transformWorldToLocal
   * Chuyển tọa độ thế giới sang cục bộ.
   */
  public transformWorldToLocal(...args: any[]): any {
    return (this.distanceVectorMath as any).transformWorldToLocal(...args);
  }

  /**
   * [0063] transformWorldToScreen
   * Chuyển tọa độ thế giới sang màn hình.
   */
  public transformWorldToScreen(...args: any[]): any {
    return (this.distanceVectorMath as any).transformWorldToScreen(...args);
  }

  /**
   * [0064] transformScreenToWorld
   * Chuyển tọa độ màn hình sang thế giới.
   */
  public transformScreenToWorld(...args: any[]): any {
    return (this.distanceVectorMath as any).transformScreenToWorld(...args);
  }

  /**
   * [0065] transformCameraToWorld
   * Chuyển tọa độ camera sang thế giới.
   */
  public transformCameraToWorld(...args: any[]): any {
    return (this.distanceVectorMath as any).transformCameraToWorld(...args);
  }

  /**
   * [0066] transformWorldToCamera
   * Chuyển tọa độ thế giới sang camera.
   */
  public transformWorldToCamera(...args: any[]): any {
    return (this.distanceVectorMath as any).transformWorldToCamera(...args);
  }

  /**
   * [0067] calculatePositionOffset
   * Tính độ lệch vị trí.
   */
  public calculatePositionOffset(...args: any[]): any {
    return (this.distanceVectorMath as any).calculatePositionOffset(...args);
  }

  /**
   * [0068] calculateRelativeOffset
   * Tính độ lệch tương đối.
   */
  public calculateRelativeOffset(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRelativeOffset(...args);
  }

  /**
   * [0069] calculateWorldOffset
   * Tính độ lệch trong thế giới.
   */
  public calculateWorldOffset(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateWorldOffset(...args);
  }

  /**
   * [0070] calculateLocalOffset
   * Tính độ lệch cục bộ.
   */
  public calculateLocalOffset(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLocalOffset(...args);
  }

  /**
   * [0071] calculatePositionDelta
   * Tính độ thay đổi vị trí.
   */
  public calculatePositionDelta(...args: any[]): any {
    return (this.distanceVectorMath as any).calculatePositionDelta(...args);
  }

  /**
   * [0072] calculateVelocityVector
   * Tính vector vận tốc.
   */
  public calculateVelocityVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVelocityVector(...args);
  }

  /**
   * [0073] calculateAccelerationVector
   * Tính vector gia tốc.
   */
  public calculateAccelerationVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAccelerationVector(...args);
  }

  /**
   * [0074] calculateDirectionVector
   * Tính vector hướng.
   */
  public calculateDirectionVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDirectionVector(...args);
  }

  /**
   * [0075] calculateNormalizedDirection
   * Tính hướng chuẩn hóa.
   */
  public calculateNormalizedDirection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateNormalizedDirection(...args);
  }

  /**
   * [0076] calculateForwardVector
   * Tính vector phía trước.
   */
  public calculateForwardVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateForwardVector(...args);
  }

  /**
   * [0077] calculateBackwardVector
   * Tính vector phía sau.
   */
  public calculateBackwardVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateBackwardVector(...args);
  }

  /**
   * [0078] calculateRightVector
   * Tính vector bên phải.
   */
  public calculateRightVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRightVector(...args);
  }

  /**
   * [0079] calculateLeftVector
   * Tính vector bên trái.
   */
  public calculateLeftVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLeftVector(...args);
  }

  /**
   * [0080] calculateUpVector
   * Tính vector phía trên.
   */
  public calculateUpVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateUpVector(...args);
  }

  /**
   * [0081] calculateDownVector
   * Tính vector phía dưới.
   */
  public calculateDownVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDownVector(...args);
  }

  /**
   * [0082] calculateLookDirection
   * Tính hướng nhìn.
   */
  public calculateLookDirection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLookDirection(...args);
  }

  /**
   * [0083] calculateAimDirection
   * Tính hướng ngắm.
   */
  public calculateAimDirection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAimDirection(...args);
  }

  /**
   * [0084] calculateMovementDirection
   * Tính hướng di chuyển.
   */
  public calculateMovementDirection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateMovementDirection(...args);
  }

  /**
   * [0085] calculateSurfaceNormal
   * Tính vector pháp tuyến bề mặt.
   */
  public calculateSurfaceNormal(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateSurfaceNormal(...args);
  }

  /**
   * [0086] calculateTangentVector
   * Tính vector tiếp tuyến.
   */
  public calculateTangentVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateTangentVector(...args);
  }

  /**
   * [0087] calculateBitangentVector
   * Tính vector tiếp tuyến phụ.
   */
  public calculateBitangentVector(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateBitangentVector(...args);
  }

  /**
   * [0088] calculateCrossProduct
   * Tính tích có hướng.
   */
  public calculateCrossProduct(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateCrossProduct(...args);
  }

  /**
   * [0089] calculateDotProduct
   * Tính tích vô hướng.
   */
  public calculateDotProduct(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateDotProduct(...args);
  }

  /**
   * [0090] calculateVectorMagnitude
   * Tính độ lớn vector.
   */
  public calculateVectorMagnitude(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVectorMagnitude(...args);
  }

  /**
   * [0091] normalizeVector
   * Chuẩn hóa vector.
   */
  public normalizeVector(...args: any[]): any {
    return (this.distanceVectorMath as any).normalizeVector(...args);
  }

  /**
   * [0092] projectVector
   * Chiếu vector lên vector khác.
   */
  public projectVector(...args: any[]): any {
    return (this.distanceVectorMath as any).projectVector(...args);
  }

  /**
   * [0093] reflectVector
   * Phản xạ vector.
   */
  public reflectVector(...args: any[]): any {
    return (this.distanceVectorMath as any).reflectVector(...args);
  }

  /**
   * [0094] refractVector
   * Khúc xạ vector.
   */
  public refractVector(...args: any[]): any {
    return (this.distanceVectorMath as any).refractVector(...args);
  }

  /**
   * [0095] lerpVector
   * Nội suy tuyến tính vector.
   */
  public lerpVector(...args: any[]): any {
    return (this.distanceVectorMath as any).lerpVector(...args);
  }

  /**
   * [0096] slerpVector
   * Nội suy cầu vector.
   */
  public slerpVector(...args: any[]): any {
    return (this.distanceVectorMath as any).slerpVector(...args);
  }

  /**
   * [0097] clampVectorMagnitude
   * Giới hạn độ lớn vector.
   */
  public clampVectorMagnitude(...args: any[]): any {
    return (this.distanceVectorMath as any).clampVectorMagnitude(...args);
  }

  /**
   * [0098] calculateVectorAngle
   * Tính góc giữa hai vector.
   */
  public calculateVectorAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVectorAngle(...args);
  }

  /**
   * [0099] calculateVectorProjection
   * Tính hình chiếu vector.
   */
  public calculateVectorProjection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVectorProjection(...args);
  }

  /**
   * [0100] calculateVectorRejection
   * Tính thành phần vuông góc của vector.
   */
  public calculateVectorRejection(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateVectorRejection(...args);
  }

  /**
   * [0101] calculateEulerAngles
   * Tính góc Euler.
   */
  public calculateEulerAngles(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateEulerAngles(...args);
  }

  /**
   * [0102] calculateYaw
   * Tính góc quay quanh trục đứng.
   */
  public calculateYaw(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateYaw(...args);
  }

  /**
   * [0103] calculatePitch
   * Tính góc nghiêng lên xuống.
   */
  public calculatePitch(...args: any[]): any {
    return (this.distanceVectorMath as any).calculatePitch(...args);
  }

  /**
   * [0104] calculateRoll
   * Tính góc lăn quanh trục trước sau.
   */
  public calculateRoll(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRoll(...args);
  }

  /**
   * [0105] calculateAngleBetweenPoints
   * Tính góc giữa hai điểm.
   */
  public calculateAngleBetweenPoints(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngleBetweenPoints(...args);
  }

  /**
   * [0106] calculateAngleBetweenVectors
   * Tính góc giữa hai vector.
   */
  public calculateAngleBetweenVectors(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngleBetweenVectors(...args);
  }

  /**
   * [0107] calculateAngleToTarget
   * Tính góc hướng tới mục tiêu.
   */
  public calculateAngleToTarget(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngleToTarget(...args);
  }

  /**
   * [0108] calculateAngleToCamera
   * Tính góc so với camera.
   */
  public calculateAngleToCamera(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngleToCamera(...args);
  }

  /**
   * [0109] calculateAngleToGround
   * Tính góc so với mặt đất.
   */
  public calculateAngleToGround(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngleToGround(...args);
  }

  /**
   * [0110] calculateSignedAngle
   * Tính góc có dấu.
   */
  public calculateSignedAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateSignedAngle(...args);
  }

  /**
   * [0111] calculateUnsignedAngle
   * Tính góc không dấu.
   */
  public calculateUnsignedAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateUnsignedAngle(...args);
  }

  /**
   * [0112] calculateAngularVelocity
   * Tính vận tốc góc.
   */
  public calculateAngularVelocity(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngularVelocity(...args);
  }

  /**
   * [0113] calculateAngularAcceleration
   * Tính gia tốc góc.
   */
  public calculateAngularAcceleration(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngularAcceleration(...args);
  }

  /**
   * [0114] calculateAngularDistance
   * Tính khoảng cách góc.
   */
  public calculateAngularDistance(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngularDistance(...args);
  }

  /**
   * [0115] calculateAngularDifference
   * Tính độ chênh góc.
   */
  public calculateAngularDifference(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateAngularDifference(...args);
  }

  /**
   * [0116] normalizeAngle
   * Chuẩn hóa góc.
   */
  public normalizeAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).normalizeAngle(...args);
  }

  /**
   * [0117] clampAngle
   * Giới hạn góc.
   */
  public clampAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).clampAngle(...args);
  }

  /**
   * [0118] interpolateAngle
   * Nội suy góc.
   */
  public interpolateAngle(...args: any[]): any {
    return (this.distanceVectorMath as any).interpolateAngle(...args);
  }

  /**
   * [0119] calculateRotationMatrix
   * Tính ma trận quay.
   */
  public calculateRotationMatrix(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRotationMatrix(...args);
  }

  /**
   * [0120] calculateInverseRotation
   * Tính phép quay nghịch đảo.
   */
  public calculateInverseRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateInverseRotation(...args);
  }

  /**
   * [0121] calculateQuaternion
   * Tính quaternion.
   */
  public calculateQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateQuaternion(...args);
  }

  /**
   * [0122] normalizeQuaternion
   * Chuẩn hóa quaternion.
   */
  public normalizeQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).normalizeQuaternion(...args);
  }

  /**
   * [0123] multiplyQuaternions
   * Nhân hai quaternion.
   */
  public multiplyQuaternions(...args: any[]): any {
    return (this.distanceVectorMath as any).multiplyQuaternions(...args);
  }

  /**
   * [0124] invertQuaternion
   * Đảo quaternion.
   */
  public invertQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).invertQuaternion(...args);
  }

  /**
   * [0125] slerpQuaternion
   * Nội suy cầu quaternion.
   */
  public slerpQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).slerpQuaternion(...args);
  }

  /**
   * [0126] nlerpQuaternion
   * Nội suy tuyến tính chuẩn hóa quaternion.
   */
  public nlerpQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).nlerpQuaternion(...args);
  }

  /**
   * [0127] quaternionToEuler
   * Chuyển quaternion sang Euler.
   */
  public quaternionToEuler(...args: any[]): any {
    return (this.distanceVectorMath as any).quaternionToEuler(...args);
  }

  /**
   * [0128] eulerToQuaternion
   * Chuyển Euler sang quaternion.
   */
  public eulerToQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).eulerToQuaternion(...args);
  }

  /**
   * [0129] quaternionToMatrix
   * Chuyển quaternion sang ma trận.
   */
  public quaternionToMatrix(...args: any[]): any {
    return (this.distanceVectorMath as any).quaternionToMatrix(...args);
  }

  /**
   * [0130] matrixToQuaternion
   * Chuyển ma trận sang quaternion.
   */
  public matrixToQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).matrixToQuaternion(...args);
  }

  /**
   * [0131] calculateLookAtRotation
   * Tính góc quay để nhìn mục tiêu.
   */
  public calculateLookAtRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLookAtRotation(...args);
  }

  /**
   * [0132] calculateLookAtQuaternion
   * Tính quaternion hướng nhìn.
   */
  public calculateLookAtQuaternion(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLookAtQuaternion(...args);
  }

  /**
   * [0133] calculateRotationAroundAxis
   * Tính phép quay quanh trục.
   */
  public calculateRotationAroundAxis(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRotationAroundAxis(...args);
  }

  /**
   * [0134] calculateRotationBetweenVectors
   * Tính phép quay giữa hai vector.
   */
  public calculateRotationBetweenVectors(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRotationBetweenVectors(...args);
  }

  /**
   * [0135] calculateRelativeRotation
   * Tính góc quay tương đối.
   */
  public calculateRelativeRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateRelativeRotation(...args);
  }

  /**
   * [0136] calculateWorldRotation
   * Tính góc quay thế giới.
   */
  public calculateWorldRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateWorldRotation(...args);
  }

  /**
   * [0137] calculateLocalRotation
   * Tính góc quay cục bộ.
   */
  public calculateLocalRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateLocalRotation(...args);
  }

  /**
   * [0138] calculateBoneRotation
   * Tính góc quay xương.
   */
  public calculateBoneRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateBoneRotation(...args);
  }

  /**
   * [0139] calculateJointRotation
   * Tính góc quay khớp.
   */
  public calculateJointRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateJointRotation(...args);
  }

  /**
   * [0140] calculateHeadRotation
   * Tính góc quay đầu.
   */
  public calculateHeadRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateHeadRotation(...args);
  }

  /**
   * [0141] calculateHandRotation
   * Tính góc quay bàn tay.
   */
  public calculateHandRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateHandRotation(...args);
  }

  /**
   * [0142 / 0884] calculateFootRotation
   * Tính góc quay bàn chân (toán học quaternion hoặc giải phẫu mắt cá & bàn chân).
   */
  public calculateFootRotation(entityOrAngle?: any, options?: any): any {
    const r1 = this.distanceVectorMath.calculateFootRotation(entityOrAngle, options);
    const r2 = this.anatomicalLowerBody.calculateFootRotation(entityOrAngle, options);
    return r2 ?? r1;
  }

  /**
   * [0143] calculateShoulderRotation
   * Tính góc quay vai.
   */
  public calculateShoulderRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateShoulderRotation(...args);
  }

  /**
   * [0144] calculateHipRotation
   * Tính góc quay hông.
   */
  public calculateHipRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateHipRotation(...args);
  }

  /**
   * [0145] calculateWristRotation
   * Tính góc quay cổ tay.
   */
  public calculateWristRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateWristRotation(...args);
  }

  /**
   * [0146] calculateElbowRotation
   * Tính góc quay khuỷu tay.
   */
  public calculateElbowRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateElbowRotation(...args);
  }

  /**
   * [0147 / 0811] calculateKneeRotation
   * Tính góc quay đầu gối (toán học quaternion hoặc giải phẫu khớp gối).
   */
  public calculateKneeRotation(entityOrAngle?: any, options?: any): any {
    const r1 = this.distanceVectorMath.calculateKneeRotation(entityOrAngle, options);
    const r2 = this.anatomicalLowerBody.calculateKneeRotation(entityOrAngle, options);
    return r2 ?? r1;
  }

  /**
   * [0148] calculateSpineRotation
   * Tính góc quay cột sống.
   */
  public calculateSpineRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateSpineRotation(...args);
  }

  /**
   * [0149] calculateTailRotation
   * Tính góc quay đuôi.
   */
  public calculateTailRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateTailRotation(...args);
  }

  /**
   * [0150] calculateWingRotation
   * Tính góc quay cánh.
   */
  public calculateWingRotation(...args: any[]): any {
    return (this.distanceVectorMath as any).calculateWingRotation(...args);
  }

  /**
   * [0151] getHeadPosition
   * Lấy tọa độ đầu.
   */
  public getHeadPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadPosition(...args);
  }

  /**
   * [0152] getHeadCenter
   * Lấy tâm đầu.
   */
  public getHeadCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadCenter(...args);
  }

  /**
   * [0153] getHeadTopPosition
   * Lấy tọa độ đỉnh đầu.
   */
  public getHeadTopPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadTopPosition(...args);
  }

  /**
   * [0154] getHeadBottomPosition
   * Lấy tọa độ đáy đầu.
   */
  public getHeadBottomPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadBottomPosition(...args);
  }

  /**
   * [0155] getHeadFrontPosition
   * Lấy tọa độ phía trước đầu.
   */
  public getHeadFrontPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadFrontPosition(...args);
  }

  /**
   * [0156] getHeadBackPosition
   * Lấy tọa độ phía sau đầu.
   */
  public getHeadBackPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadBackPosition(...args);
  }

  /**
   * [0157] getHeadLeftPosition
   * Lấy tọa độ bên trái đầu.
   */
  public getHeadLeftPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadLeftPosition(...args);
  }

  /**
   * [0158] getHeadRightPosition
   * Lấy tọa độ bên phải đầu.
   */
  public getHeadRightPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadRightPosition(...args);
  }

  /**
   * [0159] getHeadForwardVector
   * Lấy hướng phía trước đầu.
   */
  public getHeadForwardVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadForwardVector(...args);
  }

  /**
   * [0160] getHeadUpVector
   * Lấy hướng phía trên đầu.
   */
  public getHeadUpVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadUpVector(...args);
  }

  /**
   * [0161] getHeadRightVector
   * Lấy hướng bên phải đầu.
   */
  public getHeadRightVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getHeadRightVector(...args);
  }

  /**
   * [0162] calculateHeadCenterOffset
   * Tính độ lệch tâm đầu.
   */
  public calculateHeadCenterOffset(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadCenterOffset(...args);
  }

  /**
   * [0163] calculateHeadBoundingBox
   * Tính hộp bao đầu.
   */
  public calculateHeadBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadBoundingBox(...args);
  }

  /**
   * [0164] calculateHeadBoundingSphere
   * Tính hình cầu bao đầu.
   */
  public calculateHeadBoundingSphere(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadBoundingSphere(...args);
  }

  /**
   * [0165] calculateHeadOrientation
   * Tính hướng đầu.
   */
  public calculateHeadOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadOrientation(...args);
  }

  /**
   * [0166] calculateHeadLookDirection
   * Tính hướng nhìn của đầu.
   */
  public calculateHeadLookDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadLookDirection(...args);
  }

  /**
   * [0167] calculateHeadAimDirection
   * Tính hướng ngắm của đầu.
   */
  public calculateHeadAimDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadAimDirection(...args);
  }

  /**
   * [0168] calculateHeadTilt
   * Tính độ nghiêng đầu.
   */
  public calculateHeadTilt(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadTilt(...args);
  }

  /**
   * [0169] calculateHeadYaw
   * Tính góc quay ngang đầu.
   */
  public calculateHeadYaw(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadYaw(...args);
  }

  /**
   * [0170] calculateHeadPitch
   * Tính góc cúi ngẩng đầu.
   */
  public calculateHeadPitch(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadPitch(...args);
  }

  /**
   * [0171] calculateHeadRoll
   * Tính góc nghiêng sang bên của đầu.
   */
  public calculateHeadRoll(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHeadRoll(...args);
  }

  /**
   * [0172] getFaceCenter
   * Lấy tâm khuôn mặt.
   */
  public getFaceCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getFaceCenter(...args);
  }

  /**
   * [0173] getForeheadPosition
   * Lấy tọa độ trán.
   */
  public getForeheadPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getForeheadPosition(...args);
  }

  /**
   * [0174] getChinPosition
   * Lấy tọa độ cằm.
   */
  public getChinPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getChinPosition(...args);
  }

  /**
   * [0175] getJawPosition
   * Lấy tọa độ hàm.
   */
  public getJawPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getJawPosition(...args);
  }

  /**
   * [0176] getLeftEyePosition
   * Lấy tọa độ mắt trái.
   */
  public getLeftEyePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftEyePosition(...args);
  }

  /**
   * [0177] getRightEyePosition
   * Lấy tọa độ mắt phải.
   */
  public getRightEyePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightEyePosition(...args);
  }

  /**
   * [0178] getLeftPupilPosition
   * Lấy tọa độ đồng tử trái.
   */
  public getLeftPupilPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftPupilPosition(...args);
  }

  /**
   * [0179] getRightPupilPosition
   * Lấy tọa độ đồng tử phải.
   */
  public getRightPupilPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightPupilPosition(...args);
  }

  /**
   * [0180] getNosePosition
   * Lấy tọa độ mũi.
   */
  public getNosePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNosePosition(...args);
  }

  /**
   * [0181] getNoseTipPosition
   * Lấy tọa độ chóp mũi.
   */
  public getNoseTipPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNoseTipPosition(...args);
  }

  /**
   * [0182] getMouthCenter
   * Lấy tâm miệng.
   */
  public getMouthCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getMouthCenter(...args);
  }

  /**
   * [0183] getUpperLipPosition
   * Lấy tọa độ môi trên.
   */
  public getUpperLipPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getUpperLipPosition(...args);
  }

  /**
   * [0184] getLowerLipPosition
   * Lấy tọa độ môi dưới.
   */
  public getLowerLipPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLowerLipPosition(...args);
  }

  /**
   * [0185] getLeftEarPosition
   * Lấy tọa độ tai trái.
   */
  public getLeftEarPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftEarPosition(...args);
  }

  /**
   * [0186] getRightEarPosition
   * Lấy tọa độ tai phải.
   */
  public getRightEarPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightEarPosition(...args);
  }

  /**
   * [0187] getLeftEyebrowPosition
   * Lấy tọa độ lông mày trái.
   */
  public getLeftEyebrowPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftEyebrowPosition(...args);
  }

  /**
   * [0188] getRightEyebrowPosition
   * Lấy tọa độ lông mày phải.
   */
  public getRightEyebrowPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightEyebrowPosition(...args);
  }

  /**
   * [0189] getLeftCheekPosition
   * Lấy tọa độ má trái.
   */
  public getLeftCheekPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftCheekPosition(...args);
  }

  /**
   * [0190] getRightCheekPosition
   * Lấy tọa độ má phải.
   */
  public getRightCheekPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightCheekPosition(...args);
  }

  /**
   * [0191] calculateEyeDistance
   * Tính khoảng cách giữa hai mắt.
   */
  public calculateEyeDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateEyeDistance(...args);
  }

  /**
   * [0192] calculateEyeGazeDirection
   * Tính hướng nhìn của mắt.
   */
  public calculateEyeGazeDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateEyeGazeDirection(...args);
  }

  /**
   * [0193] calculatePupilOffset
   * Tính độ lệch đồng tử.
   */
  public calculatePupilOffset(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePupilOffset(...args);
  }

  /**
   * [0194] calculateFaceOrientation
   * Tính hướng khuôn mặt.
   */
  public calculateFaceOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateFaceOrientation(...args);
  }

  /**
   * [0195] calculateFaceNormal
   * Tính pháp tuyến khuôn mặt.
   */
  public calculateFaceNormal(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateFaceNormal(...args);
  }

  /**
   * [0196] calculateFaceSymmetry
   * Tính độ đối xứng khuôn mặt.
   */
  public calculateFaceSymmetry(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateFaceSymmetry(...args);
  }

  /**
   * [0197] calculateMouthOpening
   * Tính độ mở miệng.
   */
  public calculateMouthOpening(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateMouthOpening(...args);
  }

  /**
   * [0198] calculateJawOpeningAngle
   * Tính góc mở hàm.
   */
  public calculateJawOpeningAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateJawOpeningAngle(...args);
  }

  /**
   * [0199] calculateBlinkAmount
   * Tính mức độ nhắm mắt.
   */
  public calculateBlinkAmount(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateBlinkAmount(...args);
  }

  /**
   * [0200] calculateFacialLandmarkDistance
   * Tính khoảng cách giữa các điểm mốc khuôn mặt.
   */
  public calculateFacialLandmarkDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateFacialLandmarkDistance(...args);
  }

  /**
   * [0201] getNeckPosition
   * Lấy tọa độ cổ.
   */
  public getNeckPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckPosition(...args);
  }

  /**
   * [0202] getNeckCenter
   * Lấy tâm cổ.
   */
  public getNeckCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckCenter(...args);
  }

  /**
   * [0203] getNeckBasePosition
   * Lấy tọa độ gốc cổ.
   */
  public getNeckBasePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckBasePosition(...args);
  }

  /**
   * [0204] getNeckTopPosition
   * Lấy tọa độ đỉnh cổ.
   */
  public getNeckTopPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckTopPosition(...args);
  }

  /**
   * [0205] getNeckForwardVector
   * Lấy hướng phía trước cổ.
   */
  public getNeckForwardVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckForwardVector(...args);
  }

  /**
   * [0206] getNeckUpVector
   * Lấy hướng phía trên cổ.
   */
  public getNeckUpVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getNeckUpVector(...args);
  }

  /**
   * [0207] calculateNeckLength
   * Tính chiều dài cổ.
   */
  public calculateNeckLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckLength(...args);
  }

  /**
   * [0208] calculateNeckOrientation
   * Tính hướng cổ.
   */
  public calculateNeckOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckOrientation(...args);
  }

  /**
   * [0209] calculateNeckBendAngle
   * Tính góc gập cổ.
   */
  public calculateNeckBendAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckBendAngle(...args);
  }

  /**
   * [0210] calculateNeckTwistAngle
   * Tính góc xoay cổ.
   */
  public calculateNeckTwistAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckTwistAngle(...args);
  }

  /**
   * [0211] calculateNeckCurvature
   * Tính độ cong cổ.
   */
  public calculateNeckCurvature(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckCurvature(...args);
  }

  /**
   * [0212] calculateNeckToHeadDistance
   * Tính khoảng cách cổ đến đầu.
   */
  public calculateNeckToHeadDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckToHeadDistance(...args);
  }

  /**
   * [0213] calculateNeckToShoulderDistance
   * Tính khoảng cách cổ đến vai.
   */
  public calculateNeckToShoulderDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckToShoulderDistance(...args);
  }

  /**
   * [0214] calculateNeckBoundingBox
   * Tính hộp bao cổ.
   */
  public calculateNeckBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckBoundingBox(...args);
  }

  /**
   * [0215] calculateNeckJointRotation
   * Tính góc quay khớp cổ.
   */
  public calculateNeckJointRotation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateNeckJointRotation(...args);
  }

  /**
   * [0216] getLeftShoulderPosition
   * Lấy tọa độ vai trái.
   */
  public getLeftShoulderPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftShoulderPosition(...args);
  }

  /**
   * [0217] getRightShoulderPosition
   * Lấy tọa độ vai phải.
   */
  public getRightShoulderPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightShoulderPosition(...args);
  }

  /**
   * [0218] getShoulderCenter
   * Lấy tâm hai vai.
   */
  public getShoulderCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getShoulderCenter(...args);
  }

  /**
   * [0219] getLeftShoulderTip
   * Lấy tọa độ đầu ngoài vai trái.
   */
  public getLeftShoulderTip(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftShoulderTip(...args);
  }

  /**
   * [0220] getRightShoulderTip
   * Lấy tọa độ đầu ngoài vai phải.
   */
  public getRightShoulderTip(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightShoulderTip(...args);
  }

  /**
   * [0221] getLeftClaviclePosition
   * Lấy tọa độ xương đòn trái.
   */
  public getLeftClaviclePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftClaviclePosition(...args);
  }

  /**
   * [0222] getRightClaviclePosition
   * Lấy tọa độ xương đòn phải.
   */
  public getRightClaviclePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightClaviclePosition(...args);
  }

  /**
   * [0223] getLeftScapulaPosition
   * Lấy tọa độ xương bả vai trái.
   */
  public getLeftScapulaPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftScapulaPosition(...args);
  }

  /**
   * [0224] getRightScapulaPosition
   * Lấy tọa độ xương bả vai phải.
   */
  public getRightScapulaPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightScapulaPosition(...args);
  }

  /**
   * [0225] calculateShoulderWidth
   * Tính chiều rộng vai.
   */
  public calculateShoulderWidth(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderWidth(...args);
  }

  /**
   * [0226] calculateShoulderHeight
   * Tính độ cao vai.
   */
  public calculateShoulderHeight(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderHeight(...args);
  }

  /**
   * [0227] calculateShoulderSlope
   * Tính độ dốc đường vai.
   */
  public calculateShoulderSlope(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderSlope(...args);
  }

  /**
   * [0228] calculateShoulderSymmetry
   * Tính độ đối xứng vai.
   */
  public calculateShoulderSymmetry(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderSymmetry(...args);
  }

  /**
   * [0229] calculateShoulderDistanceToHead
   * Tính khoảng cách vai đến đầu.
   */
  public calculateShoulderDistanceToHead(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderDistanceToHead(...args);
  }

  /**
   * [0230] calculateShoulderDistanceToHip
   * Tính khoảng cách vai đến hông.
   */
  public calculateShoulderDistanceToHip(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderDistanceToHip(...args);
  }

  /**
   * [0231] calculateShoulderToShoulderVector
   * Tính vector giữa hai vai.
   */
  public calculateShoulderToShoulderVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderToShoulderVector(...args);
  }

  /**
   * [0232] calculateShoulderForwardDirection
   * Tính hướng trước của vai.
   */
  public calculateShoulderForwardDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderForwardDirection(...args);
  }

  /**
   * [0233] calculateShoulderUpDirection
   * Tính hướng trên của vai.
   */
  public calculateShoulderUpDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderUpDirection(...args);
  }

  /**
   * [0234] calculateShoulderJointAngle
   * Tính góc khớp vai.
   */
  public calculateShoulderJointAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderJointAngle(...args);
  }

  /**
   * [0235] calculateShoulderAbduction
   * Tính góc dạng vai.
   */
  public calculateShoulderAbduction(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderAbduction(...args);
  }

  /**
   * [0236] calculateShoulderAdduction
   * Tính góc khép vai.
   */
  public calculateShoulderAdduction(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderAdduction(...args);
  }

  /**
   * [0237] calculateShoulderFlexion
   * Tính góc gập vai.
   */
  public calculateShoulderFlexion(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderFlexion(...args);
  }

  /**
   * [0238] calculateShoulderExtension
   * Tính góc duỗi vai.
   */
  public calculateShoulderExtension(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderExtension(...args);
  }

  /**
   * [0239] calculateShoulderInternalRotation
   * Tính góc xoay trong vai.
   */
  public calculateShoulderInternalRotation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderInternalRotation(...args);
  }

  /**
   * [0240] calculateShoulderExternalRotation
   * Tính góc xoay ngoài vai.
   */
  public calculateShoulderExternalRotation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderExternalRotation(...args);
  }

  /**
   * [0241] calculateShoulderBoundingBox
   * Tính hộp bao vùng vai.
   */
  public calculateShoulderBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderBoundingBox(...args);
  }

  /**
   * [0242] calculateShoulderCenterOfMass
   * Tính tâm khối lượng vùng vai.
   */
  public calculateShoulderCenterOfMass(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderCenterOfMass(...args);
  }

  /**
   * [0243] calculateClavicleLength
   * Tính chiều dài xương đòn.
   */
  public calculateClavicleLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateClavicleLength(...args);
  }

  /**
   * [0244] calculateScapulaOrientation
   * Tính hướng xương bả vai.
   */
  public calculateScapulaOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateScapulaOrientation(...args);
  }

  /**
   * [0245] calculateShoulderToElbowDistance
   * Tính khoảng cách vai đến khuỷu.
   */
  public calculateShoulderToElbowDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderToElbowDistance(...args);
  }

  /**
   * [0246] calculateShoulderToWristDistance
   * Tính khoảng cách vai đến cổ tay.
   */
  public calculateShoulderToWristDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderToWristDistance(...args);
  }

  /**
   * [0247] calculateShoulderToHandDistance
   * Tính khoảng cách vai đến bàn tay.
   */
  public calculateShoulderToHandDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderToHandDistance(...args);
  }

  /**
   * [0248] calculateShoulderMotionVector
   * Tính vector chuyển động vai.
   */
  public calculateShoulderMotionVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderMotionVector(...args);
  }

  /**
   * [0249] calculateShoulderVelocity
   * Tính vận tốc vai.
   */
  public calculateShoulderVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderVelocity(...args);
  }

  /**
   * [0250] calculateShoulderAcceleration
   * Tính gia tốc vai.
   */
  public calculateShoulderAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateShoulderAcceleration(...args);
  }

  /**
   * [0251] getLeftUpperArmPosition
   * Lấy tọa độ cánh tay trên trái.
   */
  public getLeftUpperArmPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftUpperArmPosition(...args);
  }

  /**
   * [0252] getRightUpperArmPosition
   * Lấy tọa độ cánh tay trên phải.
   */
  public getRightUpperArmPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightUpperArmPosition(...args);
  }

  /**
   * [0253] getLeftUpperArmCenter
   * Lấy tâm cánh tay trên trái.
   */
  public getLeftUpperArmCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftUpperArmCenter(...args);
  }

  /**
   * [0254] getRightUpperArmCenter
   * Lấy tâm cánh tay trên phải.
   */
  public getRightUpperArmCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightUpperArmCenter(...args);
  }

  /**
   * [0255] getLeftUpperArmStart
   * Lấy điểm đầu cánh tay trên trái.
   */
  public getLeftUpperArmStart(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftUpperArmStart(...args);
  }

  /**
   * [0256] getRightUpperArmStart
   * Lấy điểm đầu cánh tay trên phải.
   */
  public getRightUpperArmStart(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightUpperArmStart(...args);
  }

  /**
   * [0257] getLeftUpperArmEnd
   * Lấy điểm cuối cánh tay trên trái.
   */
  public getLeftUpperArmEnd(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftUpperArmEnd(...args);
  }

  /**
   * [0258] getRightUpperArmEnd
   * Lấy điểm cuối cánh tay trên phải.
   */
  public getRightUpperArmEnd(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightUpperArmEnd(...args);
  }

  /**
   * [0259] calculateUpperArmLength
   * Tính chiều dài cánh tay trên.
   */
  public calculateUpperArmLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmLength(...args);
  }

  /**
   * [0260] calculateUpperArmDirection
   * Tính hướng cánh tay trên.
   */
  public calculateUpperArmDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmDirection(...args);
  }

  /**
   * [0261] calculateUpperArmOrientation
   * Tính hướng quay cánh tay trên.
   */
  public calculateUpperArmOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmOrientation(...args);
  }

  /**
   * [0262] calculateUpperArmAngle
   * Tính góc cánh tay trên.
   */
  public calculateUpperArmAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmAngle(...args);
  }

  /**
   * [0263] calculateUpperArmVelocity
   * Tính vận tốc cánh tay trên.
   */
  public calculateUpperArmVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmVelocity(...args);
  }

  /**
   * [0264] calculateUpperArmAcceleration
   * Tính gia tốc cánh tay trên.
   */
  public calculateUpperArmAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmAcceleration(...args);
  }

  /**
   * [0265] calculateUpperArmBoundingBox
   * Tính hộp bao cánh tay trên.
   */
  public calculateUpperArmBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmBoundingBox(...args);
  }

  /**
   * [0266] calculateUpperArmRadius
   * Tính bán kính cánh tay trên.
   */
  public calculateUpperArmRadius(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmRadius(...args);
  }

  /**
   * [0267] calculateUpperArmVolume
   * Tính thể tích cánh tay trên.
   */
  public calculateUpperArmVolume(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmVolume(...args);
  }

  /**
   * [0268] calculateUpperArmSurfaceArea
   * Tính diện tích bề mặt cánh tay trên.
   */
  public calculateUpperArmSurfaceArea(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmSurfaceArea(...args);
  }

  /**
   * [0269] calculateUpperArmCenterOfMass
   * Tính tâm khối lượng cánh tay trên.
   */
  public calculateUpperArmCenterOfMass(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmCenterOfMass(...args);
  }

  /**
   * [0270] calculateUpperArmToTorsoDistance
   * Tính khoảng cách cánh tay trên đến thân.
   */
  public calculateUpperArmToTorsoDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateUpperArmToTorsoDistance(...args);
  }

  /**
   * [0271] getLeftElbowPosition
   * Lấy tọa độ khuỷu tay trái.
   */
  public getLeftElbowPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftElbowPosition(...args);
  }

  /**
   * [0272] getRightElbowPosition
   * Lấy tọa độ khuỷu tay phải.
   */
  public getRightElbowPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightElbowPosition(...args);
  }

  /**
   * [0273] getLeftElbowCenter
   * Lấy tâm khuỷu tay trái.
   */
  public getLeftElbowCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftElbowCenter(...args);
  }

  /**
   * [0274] getRightElbowCenter
   * Lấy tâm khuỷu tay phải.
   */
  public getRightElbowCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightElbowCenter(...args);
  }

  /**
   * [0275] getLeftElbowTip
   * Lấy tọa độ đầu khuỷu trái.
   */
  public getLeftElbowTip(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftElbowTip(...args);
  }

  /**
   * [0276] getRightElbowTip
   * Lấy tọa độ đầu khuỷu phải.
   */
  public getRightElbowTip(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightElbowTip(...args);
  }

  /**
   * [0277] calculateElbowToShoulderDistance
   * Tính khoảng cách khuỷu đến vai.
   */
  public calculateElbowToShoulderDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowToShoulderDistance(...args);
  }

  /**
   * [0278] calculateElbowToWristDistance
   * Tính khoảng cách khuỷu đến cổ tay.
   */
  public calculateElbowToWristDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowToWristDistance(...args);
  }

  /**
   * [0279] calculateElbowToHandDistance
   * Tính khoảng cách khuỷu đến bàn tay.
   */
  public calculateElbowToHandDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowToHandDistance(...args);
  }

  /**
   * [0280] calculateElbowBendAngle
   * Tính góc gập khuỷu.
   */
  public calculateElbowBendAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowBendAngle(...args);
  }

  /**
   * [0281] calculateElbowExtensionAngle
   * Tính góc duỗi khuỷu.
   */
  public calculateElbowExtensionAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowExtensionAngle(...args);
  }

  /**
   * [0282] calculateElbowFlexionAngle
   * Tính góc gập khuỷu theo khớp.
   */
  public calculateElbowFlexionAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowFlexionAngle(...args);
  }

  /**
   * [0283] calculateElbowTwistAngle
   * Tính góc xoay khuỷu.
   */
  public calculateElbowTwistAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowTwistAngle(...args);
  }

  /**
   * [0284] calculateElbowJointAxis
   * Tính trục khớp khuỷu.
   */
  public calculateElbowJointAxis(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowJointAxis(...args);
  }

  /**
   * [0285] calculateElbowJointNormal
   * Tính pháp tuyến khớp khuỷu.
   */
  public calculateElbowJointNormal(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowJointNormal(...args);
  }

  /**
   * [0286] calculateElbowVelocity
   * Tính vận tốc khuỷu.
   */
  public calculateElbowVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowVelocity(...args);
  }

  /**
   * [0287] calculateElbowAcceleration
   * Tính gia tốc khuỷu.
   */
  public calculateElbowAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowAcceleration(...args);
  }

  /**
   * [0288] calculateElbowBoundingBox
   * Tính hộp bao khuỷu.
   */
  public calculateElbowBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowBoundingBox(...args);
  }

  /**
   * [0289] calculateElbowBoundingSphere
   * Tính hình cầu bao khuỷu.
   */
  public calculateElbowBoundingSphere(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowBoundingSphere(...args);
  }

  /**
   * [0290] calculateElbowSymmetry
   * Tính độ đối xứng khuỷu tay.
   */
  public calculateElbowSymmetry(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateElbowSymmetry(...args);
  }

  /**
   * [0291] calculateArmReachDistance
   * Tính khoảng với của cánh tay.
   */
  public calculateArmReachDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmReachDistance(...args);
  }

  /**
   * [0292] calculateArmReachDirection
   * Tính hướng với của cánh tay.
   */
  public calculateArmReachDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmReachDirection(...args);
  }

  /**
   * [0293] calculateArmReachEnvelope
   * Tính vùng không gian cánh tay có thể với tới.
   */
  public calculateArmReachEnvelope(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmReachEnvelope(...args);
  }

  /**
   * [0294] calculateArmSweepAngle
   * Tính góc quét cánh tay.
   */
  public calculateArmSweepAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmSweepAngle(...args);
  }

  /**
   * [0295] calculateArmSwingAmplitude
   * Tính biên độ vung tay.
   */
  public calculateArmSwingAmplitude(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmSwingAmplitude(...args);
  }

  /**
   * [0296] calculateArmPoseError
   * Tính sai lệch tư thế cánh tay.
   */
  public calculateArmPoseError(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmPoseError(...args);
  }

  /**
   * [0297] calculateArmSegmentAlignment
   * Tính độ thẳng hàng các đoạn cánh tay.
   */
  public calculateArmSegmentAlignment(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmSegmentAlignment(...args);
  }

  /**
   * [0298] calculateArmJointChainLength
   * Tính tổng chiều dài chuỗi khớp tay.
   */
  public calculateArmJointChainLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmJointChainLength(...args);
  }

  /**
   * [0299] calculateArmEndEffectorPosition
   * Tính vị trí đầu công tác của tay.
   */
  public calculateArmEndEffectorPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmEndEffectorPosition(...args);
  }

  /**
   * [0300] calculateArmInverseKinematics
   * Tính động học ngược cánh tay.
   */
  public calculateArmInverseKinematics(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateArmInverseKinematics(...args);
  }

  /**
   * [0301] getLeftForearmPosition
   * Lấy tọa độ cẳng tay trái.
   */
  public getLeftForearmPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftForearmPosition(...args);
  }

  /**
   * [0302] getRightForearmPosition
   * Lấy tọa độ cẳng tay phải.
   */
  public getRightForearmPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightForearmPosition(...args);
  }

  /**
   * [0303] getLeftForearmCenter
   * Lấy tâm cẳng tay trái.
   */
  public getLeftForearmCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftForearmCenter(...args);
  }

  /**
   * [0304] getRightForearmCenter
   * Lấy tâm cẳng tay phải.
   */
  public getRightForearmCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightForearmCenter(...args);
  }

  /**
   * [0305] getLeftForearmStart
   * Lấy điểm đầu cẳng tay trái.
   */
  public getLeftForearmStart(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftForearmStart(...args);
  }

  /**
   * [0306] getRightForearmStart
   * Lấy điểm đầu cẳng tay phải.
   */
  public getRightForearmStart(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightForearmStart(...args);
  }

  /**
   * [0307] getLeftForearmEnd
   * Lấy điểm cuối cẳng tay trái.
   */
  public getLeftForearmEnd(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftForearmEnd(...args);
  }

  /**
   * [0308] getRightForearmEnd
   * Lấy điểm cuối cẳng tay phải.
   */
  public getRightForearmEnd(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightForearmEnd(...args);
  }

  /**
   * [0309] calculateForearmLength
   * Tính chiều dài cẳng tay.
   */
  public calculateForearmLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmLength(...args);
  }

  /**
   * [0310] calculateForearmDirection
   * Tính hướng cẳng tay.
   */
  public calculateForearmDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmDirection(...args);
  }

  /**
   * [0311] calculateForearmOrientation
   * Tính hướng quay cẳng tay.
   */
  public calculateForearmOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmOrientation(...args);
  }

  /**
   * [0312] calculateForearmAngle
   * Tính góc cẳng tay.
   */
  public calculateForearmAngle(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmAngle(...args);
  }

  /**
   * [0313] calculateForearmVelocity
   * Tính vận tốc cẳng tay.
   */
  public calculateForearmVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmVelocity(...args);
  }

  /**
   * [0314] calculateForearmAcceleration
   * Tính gia tốc cẳng tay.
   */
  public calculateForearmAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmAcceleration(...args);
  }

  /**
   * [0315] calculateForearmBoundingBox
   * Tính hộp bao cẳng tay.
   */
  public calculateForearmBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmBoundingBox(...args);
  }

  /**
   * [0316] calculateForearmRadius
   * Tính bán kính cẳng tay.
   */
  public calculateForearmRadius(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmRadius(...args);
  }

  /**
   * [0317] calculateForearmVolume
   * Tính thể tích cẳng tay.
   */
  public calculateForearmVolume(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmVolume(...args);
  }

  /**
   * [0318] calculateForearmSurfaceArea
   * Tính diện tích bề mặt cẳng tay.
   */
  public calculateForearmSurfaceArea(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmSurfaceArea(...args);
  }

  /**
   * [0319] calculateForearmCenterOfMass
   * Tính tâm khối lượng cẳng tay.
   */
  public calculateForearmCenterOfMass(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmCenterOfMass(...args);
  }

  /**
   * [0320] calculateForearmTwist
   * Tính độ xoay dọc cẳng tay.
   */
  public calculateForearmTwist(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateForearmTwist(...args);
  }

  /**
   * [0321] getLeftWristPosition
   * Lấy tọa độ cổ tay trái.
   */
  public getLeftWristPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftWristPosition(...args);
  }

  /**
   * [0322] getRightWristPosition
   * Lấy tọa độ cổ tay phải.
   */
  public getRightWristPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightWristPosition(...args);
  }

  /**
   * [0323] getLeftWristCenter
   * Lấy tâm cổ tay trái.
   */
  public getLeftWristCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftWristCenter(...args);
  }

  /**
   * [0324] getRightWristCenter
   * Lấy tâm cổ tay phải.
   */
  public getRightWristCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightWristCenter(...args);
  }

  /**
   * [0325] getLeftWristJointPosition
   * Lấy tọa độ khớp cổ tay trái.
   */
  public getLeftWristJointPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftWristJointPosition(...args);
  }

  /**
   * [0326] getRightWristJointPosition
   * Lấy tọa độ khớp cổ tay phải.
   */
  public getRightWristJointPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightWristJointPosition(...args);
  }

  /**
   * [0327] getLeftWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay trái.
   */
  public getLeftWristFrontPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftWristFrontPosition(...args);
  }

  /**
   * [0328] getRightWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay phải.
   */
  public getRightWristFrontPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightWristFrontPosition(...args);
  }

  /**
   * [0329] getLeftWristBackPosition
   * Lấy tọa độ mặt sau cổ tay trái.
   */
  public getLeftWristBackPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftWristBackPosition(...args);
  }

  /**
   * [0330] getRightWristBackPosition
   * Lấy tọa độ mặt sau cổ tay phải.
   */
  public getRightWristBackPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightWristBackPosition(...args);
  }

  /**
   * [0331] calculateWristToElbowDistance
   * Tính khoảng cách cổ tay đến khuỷu.
   */
  public calculateWristToElbowDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristToElbowDistance(...args);
  }

  /**
   * [0332] calculateWristToPalmDistance
   * Tính khoảng cách cổ tay đến lòng bàn tay.
   */
  public calculateWristToPalmDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristToPalmDistance(...args);
  }

  /**
   * [0333] calculateWristWidth
   * Tính chiều rộng cổ tay.
   */
  public calculateWristWidth(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristWidth(...args);
  }

  /**
   * [0334] calculateWristThickness
   * Tính độ dày cổ tay.
   */
  public calculateWristThickness(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristThickness(...args);
  }

  /**
   * [0335] calculateWristFlexion
   * Tính góc gập cổ tay.
   */
  public calculateWristFlexion(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristFlexion(...args);
  }

  /**
   * [0336] calculateWristExtension
   * Tính góc duỗi cổ tay.
   */
  public calculateWristExtension(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristExtension(...args);
  }

  /**
   * [0337] calculateWristAbduction
   * Tính góc nghiêng cổ tay theo hướng dạng.
   */
  public calculateWristAbduction(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristAbduction(...args);
  }

  /**
   * [0338] calculateWristAdduction
   * Tính góc nghiêng cổ tay theo hướng khép.
   */
  public calculateWristAdduction(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristAdduction(...args);
  }

  /**
   * [0339] calculateWristPronation
   * Tính góc sấp cổ tay.
   */
  public calculateWristPronation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristPronation(...args);
  }

  /**
   * [0340] calculateWristSupination
   * Tính góc ngửa cổ tay.
   */
  public calculateWristSupination(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristSupination(...args);
  }

  /**
   * [0341] calculateWristJointAxis
   * Tính trục khớp cổ tay.
   */
  public calculateWristJointAxis(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristJointAxis(...args);
  }

  /**
   * [0342] calculateWristJointNormal
   * Tính pháp tuyến khớp cổ tay.
   */
  public calculateWristJointNormal(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristJointNormal(...args);
  }

  /**
   * [0343] calculateWristVelocity
   * Tính vận tốc cổ tay.
   */
  public calculateWristVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristVelocity(...args);
  }

  /**
   * [0344] calculateWristAcceleration
   * Tính gia tốc cổ tay.
   */
  public calculateWristAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristAcceleration(...args);
  }

  /**
   * [0345] calculateWristBoundingBox
   * Tính hộp bao cổ tay.
   */
  public calculateWristBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristBoundingBox(...args);
  }

  /**
   * [0346] calculateWristBoundingSphere
   * Tính hình cầu bao cổ tay.
   */
  public calculateWristBoundingSphere(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristBoundingSphere(...args);
  }

  /**
   * [0347] calculateWristTrajectory
   * Tính quỹ đạo cổ tay.
   */
  public calculateWristTrajectory(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristTrajectory(...args);
  }

  /**
   * [0348] calculateWristMotionSmoothness
   * Tính độ mượt chuyển động cổ tay.
   */
  public calculateWristMotionSmoothness(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristMotionSmoothness(...args);
  }

  /**
   * [0349] calculateWristPoseError
   * Tính sai lệch tư thế cổ tay.
   */
  public calculateWristPoseError(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristPoseError(...args);
  }

  /**
   * [0350] calculateWristTargetOffset
   * Tính độ lệch cổ tay so với mục tiêu.
   */
  public calculateWristTargetOffset(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateWristTargetOffset(...args);
  }

  /**
   * [0351] getLeftHandPosition
   * Lấy tọa độ bàn tay trái.
   */
  public getLeftHandPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftHandPosition(...args);
  }

  /**
   * [0352] getRightHandPosition
   * Lấy tọa độ bàn tay phải.
   */
  public getRightHandPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightHandPosition(...args);
  }

  /**
   * [0353] getLeftHandCenter
   * Lấy tâm bàn tay trái.
   */
  public getLeftHandCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getLeftHandCenter(...args);
  }

  /**
   * [0354] getRightHandCenter
   * Lấy tâm bàn tay phải.
   */
  public getRightHandCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getRightHandCenter(...args);
  }

  /**
   * [0355] getPalmCenter
   * Lấy tâm lòng bàn tay.
   */
  public getPalmCenter(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmCenter(...args);
  }

  /**
   * [0356] getPalmBasePosition
   * Lấy tọa độ gốc lòng bàn tay.
   */
  public getPalmBasePosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmBasePosition(...args);
  }

  /**
   * [0357] getPalmTopPosition
   * Lấy tọa độ đầu lòng bàn tay.
   */
  public getPalmTopPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmTopPosition(...args);
  }

  /**
   * [0358] getPalmLeftEdge
   * Lấy tọa độ mép trái lòng bàn tay.
   */
  public getPalmLeftEdge(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmLeftEdge(...args);
  }

  /**
   * [0359] getPalmRightEdge
   * Lấy tọa độ mép phải lòng bàn tay.
   */
  public getPalmRightEdge(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmRightEdge(...args);
  }

  /**
   * [0360] getPalmFrontPosition
   * Lấy tọa độ mặt trước lòng bàn tay.
   */
  public getPalmFrontPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmFrontPosition(...args);
  }

  /**
   * [0361] getPalmBackPosition
   * Lấy tọa độ mặt sau bàn tay.
   */
  public getPalmBackPosition(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmBackPosition(...args);
  }

  /**
   * [0362] getPalmNormal
   * Lấy pháp tuyến lòng bàn tay.
   */
  public getPalmNormal(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmNormal(...args);
  }

  /**
   * [0363] getPalmForwardVector
   * Lấy hướng phía trước lòng bàn tay.
   */
  public getPalmForwardVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmForwardVector(...args);
  }

  /**
   * [0364] getPalmUpVector
   * Lấy hướng phía trên lòng bàn tay.
   */
  public getPalmUpVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmUpVector(...args);
  }

  /**
   * [0365] getPalmRightVector
   * Lấy hướng bên phải lòng bàn tay.
   */
  public getPalmRightVector(...args: any[]): any {
    return (this.anatomicalUpperBody as any).getPalmRightVector(...args);
  }

  /**
   * [0366] calculatePalmWidth
   * Tính chiều rộng lòng bàn tay.
   */
  public calculatePalmWidth(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmWidth(...args);
  }

  /**
   * [0367] calculatePalmLength
   * Tính chiều dài lòng bàn tay.
   */
  public calculatePalmLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmLength(...args);
  }

  /**
   * [0368] calculatePalmThickness
   * Tính độ dày lòng bàn tay.
   */
  public calculatePalmThickness(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmThickness(...args);
  }

  /**
   * [0369] calculatePalmArea
   * Tính diện tích lòng bàn tay.
   */
  public calculatePalmArea(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmArea(...args);
  }

  /**
   * [0370] calculatePalmVolume
   * Tính thể tích bàn tay.
   */
  public calculatePalmVolume(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmVolume(...args);
  }

  /**
   * [0371] calculatePalmOrientation
   * Tính hướng lòng bàn tay.
   */
  public calculatePalmOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmOrientation(...args);
  }

  /**
   * [0372] calculatePalmRotation
   * Tính góc quay lòng bàn tay.
   */
  public calculatePalmRotation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmRotation(...args);
  }

  /**
   * [0373] calculatePalmTilt
   * Tính độ nghiêng lòng bàn tay.
   */
  public calculatePalmTilt(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmTilt(...args);
  }

  /**
   * [0374] calculatePalmCurvature
   * Tính độ cong lòng bàn tay.
   */
  public calculatePalmCurvature(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmCurvature(...args);
  }

  /**
   * [0375] calculatePalmCenterOfMass
   * Tính tâm khối lượng bàn tay.
   */
  public calculatePalmCenterOfMass(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmCenterOfMass(...args);
  }

  /**
   * [0376] calculatePalmBoundingBox
   * Tính hộp bao bàn tay.
   */
  public calculatePalmBoundingBox(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmBoundingBox(...args);
  }

  /**
   * [0377] calculatePalmBoundingSphere
   * Tính hình cầu bao bàn tay.
   */
  public calculatePalmBoundingSphere(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmBoundingSphere(...args);
  }

  /**
   * [0378] calculatePalmSymmetry
   * Tính độ đối xứng bàn tay.
   */
  public calculatePalmSymmetry(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmSymmetry(...args);
  }

  /**
   * [0379] calculatePalmToWristDistance
   * Tính khoảng cách lòng bàn tay đến cổ tay.
   */
  public calculatePalmToWristDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmToWristDistance(...args);
  }

  /**
   * [0380] calculatePalmToFingerBaseDistance
   * Tính khoảng cách lòng bàn tay đến gốc ngón tay.
   */
  public calculatePalmToFingerBaseDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculatePalmToFingerBaseDistance(...args);
  }

  /**
   * [0381] calculateHandSpan
   * Tính độ sải bàn tay.
   */
  public calculateHandSpan(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandSpan(...args);
  }

  /**
   * [0382] calculateHandWidth
   * Tính chiều rộng bàn tay.
   */
  public calculateHandWidth(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandWidth(...args);
  }

  /**
   * [0383] calculateHandLength
   * Tính chiều dài bàn tay.
   */
  public calculateHandLength(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandLength(...args);
  }

  /**
   * [0384] calculateHandThickness
   * Tính độ dày bàn tay.
   */
  public calculateHandThickness(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandThickness(...args);
  }

  /**
   * [0385] calculateHandOrientation
   * Tính hướng bàn tay.
   */
  public calculateHandOrientation(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandOrientation(...args);
  }

  /**
   * [0386] calculateHandForwardDirection
   * Tính hướng phía trước bàn tay.
   */
  public calculateHandForwardDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandForwardDirection(...args);
  }

  /**
   * [0387] calculateHandUpDirection
   * Tính hướng phía trên bàn tay.
   */
  public calculateHandUpDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandUpDirection(...args);
  }

  /**
   * [0388] calculateHandRightDirection
   * Tính hướng bên phải bàn tay.
   */
  public calculateHandRightDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandRightDirection(...args);
  }

  /**
   * [0389] calculateHandVelocity
   * Tính vận tốc bàn tay.
   */
  public calculateHandVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandVelocity(...args);
  }

  /**
   * [0390] calculateHandAcceleration
   * Tính gia tốc bàn tay.
   */
  public calculateHandAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandAcceleration(...args);
  }

  /**
   * [0391] calculateHandAngularVelocity
   * Tính vận tốc góc bàn tay.
   */
  public calculateHandAngularVelocity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandAngularVelocity(...args);
  }

  /**
   * [0392] calculateHandAngularAcceleration
   * Tính gia tốc góc bàn tay.
   */
  public calculateHandAngularAcceleration(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandAngularAcceleration(...args);
  }

  /**
   * [0393] calculateHandTrajectory
   * Tính quỹ đạo bàn tay.
   */
  public calculateHandTrajectory(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandTrajectory(...args);
  }

  /**
   * [0394] calculateHandMotionDirection
   * Tính hướng chuyển động bàn tay.
   */
  public calculateHandMotionDirection(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandMotionDirection(...args);
  }

  /**
   * [0395] calculateHandMotionDistance
   * Tính quãng đường bàn tay di chuyển.
   */
  public calculateHandMotionDistance(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandMotionDistance(...args);
  }

  /**
   * [0396] calculateHandPose
   * Tính tư thế bàn tay.
   */
  public calculateHandPose(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandPose(...args);
  }

  /**
   * [0397] calculateHandPoseDifference
   * Tính chênh lệch tư thế bàn tay.
   */
  public calculateHandPoseDifference(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandPoseDifference(...args);
  }

  /**
   * [0398] calculateHandPoseSimilarity
   * Tính độ tương đồng tư thế bàn tay.
   */
  public calculateHandPoseSimilarity(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandPoseSimilarity(...args);
  }

  /**
   * [0399] calculateHandJointAngles
   * Tính các góc khớp bàn tay.
   */
  public calculateHandJointAngles(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandJointAngles(...args);
  }

  /**
   * [0400] calculateHandInverseKinematics
   * Tính động học ngược bàn tay.
   */
  public calculateHandInverseKinematics(...args: any[]): any {
    return (this.anatomicalUpperBody as any).calculateHandInverseKinematics(...args);
  }

  /**
   * [0401] getThumbRootPosition
   * Lấy tọa độ gốc ngón cái.
   */
  public getThumbRootPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbRootPosition(...args);
  }

  /**
   * [0402] getThumbCMCPosition
   * Lấy tọa độ khớp CMC ngón cái.
   */
  public getThumbCMCPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbCMCPosition(...args);
  }

  /**
   * [0403] getThumbMCPPosition
   * Lấy tọa độ khớp MCP ngón cái.
   */
  public getThumbMCPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbMCPPosition(...args);
  }

  /**
   * [0404] getThumbIPPosition
   * Lấy tọa độ khớp IP ngón cái.
   */
  public getThumbIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbIPPosition(...args);
  }

  /**
   * [0405] getThumbTipPosition
   * Lấy tọa độ đầu ngón cái.
   */
  public getThumbTipPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbTipPosition(...args);
  }

  /**
   * [0406] getThumbNailPosition
   * Lấy tọa độ móng ngón cái.
   */
  public getThumbNailPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbNailPosition(...args);
  }

  /**
   * [0407] getThumbPadPosition
   * Lấy tọa độ đệm ngón cái.
   */
  public getThumbPadPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbPadPosition(...args);
  }

  /**
   * [0408] getThumbBasePosition
   * Lấy tọa độ đáy ngón cái.
   */
  public getThumbBasePosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbBasePosition(...args);
  }

  /**
   * [0409] getThumbProximalJoint
   * Lấy tọa độ khớp gần ngón cái.
   */
  public getThumbProximalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbProximalJoint(...args);
  }

  /**
   * [0410] getThumbDistalJoint
   * Lấy tọa độ khớp xa ngón cái.
   */
  public getThumbDistalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getThumbDistalJoint(...args);
  }

  /**
   * [0411] calculateThumbLength
   * Tính chiều dài ngón cái.
   */
  public calculateThumbLength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbLength(...args);
  }

  /**
   * [0412] calculateThumbWidth
   * Tính chiều rộng ngón cái.
   */
  public calculateThumbWidth(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbWidth(...args);
  }

  /**
   * [0413] calculateThumbThickness
   * Tính độ dày ngón cái.
   */
  public calculateThumbThickness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbThickness(...args);
  }

  /**
   * [0414] calculateThumbCurvature
   * Tính độ cong ngón cái.
   */
  public calculateThumbCurvature(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbCurvature(...args);
  }

  /**
   * [0415] calculateThumbDirection
   * Tính hướng ngón cái.
   */
  public calculateThumbDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbDirection(...args);
  }

  /**
   * [0416] calculateThumbOrientation
   * Tính hướng quay ngón cái.
   */
  public calculateThumbOrientation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbOrientation(...args);
  }

  /**
   * [0417] calculateThumbFlexion
   * Tính góc gập ngón cái.
   */
  public calculateThumbFlexion(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbFlexion(...args);
  }

  /**
   * [0418] calculateThumbExtension
   * Tính góc duỗi ngón cái.
   */
  public calculateThumbExtension(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbExtension(...args);
  }

  /**
   * [0419] calculateThumbAbduction
   * Tính góc dạng ngón cái.
   */
  public calculateThumbAbduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbAbduction(...args);
  }

  /**
   * [0420] calculateThumbAdduction
   * Tính góc khép ngón cái.
   */
  public calculateThumbAdduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbAdduction(...args);
  }

  /**
   * [0421] calculateThumbOpposition
   * Tính mức độ đối chiếu ngón cái.
   */
  public calculateThumbOpposition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbOpposition(...args);
  }

  /**
   * [0422] calculateThumbRotation
   * Tính góc quay ngón cái.
   */
  public calculateThumbRotation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbRotation(...args);
  }

  /**
   * [0423] calculateThumbTipVelocity
   * Tính vận tốc đầu ngón cái.
   */
  public calculateThumbTipVelocity(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipVelocity(...args);
  }

  /**
   * [0424] calculateThumbTipAcceleration
   * Tính gia tốc đầu ngón cái.
   */
  public calculateThumbTipAcceleration(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipAcceleration(...args);
  }

  /**
   * [0425] calculateThumbJointAngles
   * Tính các góc khớp ngón cái.
   */
  public calculateThumbJointAngles(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbJointAngles(...args);
  }

  /**
   * [0426] calculateThumbSegmentLengths
   * Tính chiều dài các đốt ngón cái.
   */
  public calculateThumbSegmentLengths(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbSegmentLengths(...args);
  }

  /**
   * [0427] calculateThumbBoundingBox
   * Tính hộp bao ngón cái.
   */
  public calculateThumbBoundingBox(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbBoundingBox(...args);
  }

  /**
   * [0428] calculateThumbBoundingSphere
   * Tính hình cầu bao ngón cái.
   */
  public calculateThumbBoundingSphere(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbBoundingSphere(...args);
  }

  /**
   * [0429] calculateThumbTipDistanceToIndex
   * Tính khoảng cách đầu ngón cái đến ngón trỏ.
   */
  public calculateThumbTipDistanceToIndex(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipDistanceToIndex(...args);
  }

  /**
   * [0430] calculateThumbTipDistanceToMiddle
   * Tính khoảng cách đầu ngón cái đến ngón giữa.
   */
  public calculateThumbTipDistanceToMiddle(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipDistanceToMiddle(...args);
  }

  /**
   * [0431] calculateThumbTipDistanceToRing
   * Tính khoảng cách đầu ngón cái đến ngón áp út.
   */
  public calculateThumbTipDistanceToRing(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipDistanceToRing(...args);
  }

  /**
   * [0432] calculateThumbTipDistanceToLittle
   * Tính khoảng cách đầu ngón cái đến ngón út.
   */
  public calculateThumbTipDistanceToLittle(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbTipDistanceToLittle(...args);
  }

  /**
   * [0433] calculateThumbPinchDistance
   * Tính khoảng cách kẹp giữa ngón cái và ngón khác.
   */
  public calculateThumbPinchDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbPinchDistance(...args);
  }

  /**
   * [0434] calculateThumbPinchStrength
   * Ước lượng lực kẹp từ mô hình vật lý.
   */
  public calculateThumbPinchStrength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbPinchStrength(...args);
  }

  /**
   * [0435] calculateThumbReachEnvelope
   * Tính vùng với tới của ngón cái.
   */
  public calculateThumbReachEnvelope(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbReachEnvelope(...args);
  }

  /**
   * [0436] calculateThumbContactPoint
   * Tính điểm tiếp xúc ngón cái.
   */
  public calculateThumbContactPoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbContactPoint(...args);
  }

  /**
   * [0437] calculateThumbSurfaceNormal
   * Tính pháp tuyến bề mặt ngón cái.
   */
  public calculateThumbSurfaceNormal(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbSurfaceNormal(...args);
  }

  /**
   * [0438] calculateThumbPoseError
   * Tính sai lệch tư thế ngón cái.
   */
  public calculateThumbPoseError(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbPoseError(...args);
  }

  /**
   * [0439] calculateThumbMotionSmoothness
   * Tính độ mượt chuyển động ngón cái.
   */
  public calculateThumbMotionSmoothness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbMotionSmoothness(...args);
  }

  /**
   * [0440] calculateThumbCollision
   * Kiểm tra va chạm ngón cái.
   */
  public calculateThumbCollision(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateThumbCollision(...args);
  }

  /**
   * [0441] getIndexFingerRootPosition
   * Lấy tọa độ gốc ngón trỏ.
   */
  public getIndexFingerRootPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerRootPosition(...args);
  }

  /**
   * [0442] getIndexFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón trỏ.
   */
  public getIndexFingerMCPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerMCPPosition(...args);
  }

  /**
   * [0443] getIndexFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón trỏ.
   */
  public getIndexFingerPIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerPIPPosition(...args);
  }

  /**
   * [0444] getIndexFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón trỏ.
   */
  public getIndexFingerDIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerDIPPosition(...args);
  }

  /**
   * [0445] getIndexFingerTipPosition
   * Lấy tọa độ đầu ngón trỏ.
   */
  public getIndexFingerTipPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerTipPosition(...args);
  }

  /**
   * [0446] getIndexFingerNailPosition
   * Lấy tọa độ móng ngón trỏ.
   */
  public getIndexFingerNailPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerNailPosition(...args);
  }

  /**
   * [0447] getIndexFingerPadPosition
   * Lấy tọa độ đệm ngón trỏ.
   */
  public getIndexFingerPadPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerPadPosition(...args);
  }

  /**
   * [0448] getIndexFingerBasePosition
   * Lấy tọa độ đáy ngón trỏ.
   */
  public getIndexFingerBasePosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerBasePosition(...args);
  }

  /**
   * [0449] getIndexFingerProximalJoint
   * Lấy tọa độ khớp gần ngón trỏ.
   */
  public getIndexFingerProximalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerProximalJoint(...args);
  }

  /**
   * [0450] getIndexFingerDistalJoint
   * Lấy tọa độ khớp xa ngón trỏ.
   */
  public getIndexFingerDistalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getIndexFingerDistalJoint(...args);
  }

  /**
   * [0451] calculateIndexFingerLength
   * Tính chiều dài ngón trỏ.
   */
  public calculateIndexFingerLength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerLength(...args);
  }

  /**
   * [0452] calculateIndexFingerWidth
   * Tính chiều rộng ngón trỏ.
   */
  public calculateIndexFingerWidth(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerWidth(...args);
  }

  /**
   * [0453] calculateIndexFingerThickness
   * Tính độ dày ngón trỏ.
   */
  public calculateIndexFingerThickness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerThickness(...args);
  }

  /**
   * [0454] calculateIndexFingerCurvature
   * Tính độ cong ngón trỏ.
   */
  public calculateIndexFingerCurvature(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerCurvature(...args);
  }

  /**
   * [0455] calculateIndexFingerDirection
   * Tính hướng ngón trỏ.
   */
  public calculateIndexFingerDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerDirection(...args);
  }

  /**
   * [0456] calculateIndexFingerOrientation
   * Tính hướng quay ngón trỏ.
   */
  public calculateIndexFingerOrientation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerOrientation(...args);
  }

  /**
   * [0457] calculateIndexFingerFlexion
   * Tính góc gập ngón trỏ.
   */
  public calculateIndexFingerFlexion(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerFlexion(...args);
  }

  /**
   * [0458] calculateIndexFingerExtension
   * Tính góc duỗi ngón trỏ.
   */
  public calculateIndexFingerExtension(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerExtension(...args);
  }

  /**
   * [0459] calculateIndexFingerAbduction
   * Tính góc dạng ngón trỏ.
   */
  public calculateIndexFingerAbduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerAbduction(...args);
  }

  /**
   * [0460] calculateIndexFingerAdduction
   * Tính góc khép ngón trỏ.
   */
  public calculateIndexFingerAdduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerAdduction(...args);
  }

  /**
   * [0461] calculateIndexFingerRotation
   * Tính góc quay ngón trỏ.
   */
  public calculateIndexFingerRotation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerRotation(...args);
  }

  /**
   * [0462] calculateIndexFingerTipVelocity
   * Tính vận tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipVelocity(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerTipVelocity(...args);
  }

  /**
   * [0463] calculateIndexFingerTipAcceleration
   * Tính gia tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipAcceleration(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerTipAcceleration(...args);
  }

  /**
   * [0464] calculateIndexFingerJointAngles
   * Tính các góc khớp ngón trỏ.
   */
  public calculateIndexFingerJointAngles(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerJointAngles(...args);
  }

  /**
   * [0465] calculateIndexFingerSegmentLengths
   * Tính chiều dài các đốt ngón trỏ.
   */
  public calculateIndexFingerSegmentLengths(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerSegmentLengths(...args);
  }

  /**
   * [0466] calculateIndexFingerBoundingBox
   * Tính hộp bao ngón trỏ.
   */
  public calculateIndexFingerBoundingBox(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerBoundingBox(...args);
  }

  /**
   * [0467] calculateIndexFingerBoundingSphere
   * Tính hình cầu bao ngón trỏ.
   */
  public calculateIndexFingerBoundingSphere(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerBoundingSphere(...args);
  }

  /**
   * [0468] calculateIndexToThumbDistance
   * Tính khoảng cách ngón trỏ đến ngón cái.
   */
  public calculateIndexToThumbDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexToThumbDistance(...args);
  }

  /**
   * [0469] calculateIndexToMiddleDistance
   * Tính khoảng cách ngón trỏ đến ngón giữa.
   */
  public calculateIndexToMiddleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexToMiddleDistance(...args);
  }

  /**
   * [0470] calculateIndexToRingDistance
   * Tính khoảng cách ngón trỏ đến ngón áp út.
   */
  public calculateIndexToRingDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexToRingDistance(...args);
  }

  /**
   * [0471] calculateIndexToLittleDistance
   * Tính khoảng cách ngón trỏ đến ngón út.
   */
  public calculateIndexToLittleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexToLittleDistance(...args);
  }

  /**
   * [0472] calculateIndexPointingDirection
   * Tính hướng chỉ của ngón trỏ.
   */
  public calculateIndexPointingDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexPointingDirection(...args);
  }

  /**
   * [0473] calculateIndexReachEnvelope
   * Tính vùng với tới của ngón trỏ.
   */
  public calculateIndexReachEnvelope(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexReachEnvelope(...args);
  }

  /**
   * [0474] calculateIndexContactPoint
   * Tính điểm tiếp xúc ngón trỏ.
   */
  public calculateIndexContactPoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexContactPoint(...args);
  }

  /**
   * [0475] calculateIndexSurfaceNormal
   * Tính pháp tuyến bề mặt ngón trỏ.
   */
  public calculateIndexSurfaceNormal(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexSurfaceNormal(...args);
  }

  /**
   * [0476] calculateIndexPoseError
   * Tính sai lệch tư thế ngón trỏ.
   */
  public calculateIndexPoseError(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexPoseError(...args);
  }

  /**
   * [0477] calculateIndexMotionSmoothness
   * Tính độ mượt chuyển động ngón trỏ.
   */
  public calculateIndexMotionSmoothness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexMotionSmoothness(...args);
  }

  /**
   * [0478] calculateIndexCollision
   * Kiểm tra va chạm ngón trỏ.
   */
  public calculateIndexCollision(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexCollision(...args);
  }

  /**
   * [0479] calculateIndexFingerCurl
   * Tính độ cuộn ngón trỏ.
   */
  public calculateIndexFingerCurl(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerCurl(...args);
  }

  /**
   * [0480] calculateIndexFingerSpread
   * Tính độ xòe ngón trỏ.
   */
  public calculateIndexFingerSpread(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateIndexFingerSpread(...args);
  }

  /**
   * [0481] getMiddleFingerRootPosition
   * Lấy tọa độ gốc ngón giữa.
   */
  public getMiddleFingerRootPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerRootPosition(...args);
  }

  /**
   * [0482] getMiddleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón giữa.
   */
  public getMiddleFingerMCPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerMCPPosition(...args);
  }

  /**
   * [0483] getMiddleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón giữa.
   */
  public getMiddleFingerPIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerPIPPosition(...args);
  }

  /**
   * [0484] getMiddleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón giữa.
   */
  public getMiddleFingerDIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerDIPPosition(...args);
  }

  /**
   * [0485] getMiddleFingerTipPosition
   * Lấy tọa độ đầu ngón giữa.
   */
  public getMiddleFingerTipPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerTipPosition(...args);
  }

  /**
   * [0486] getMiddleFingerNailPosition
   * Lấy tọa độ móng ngón giữa.
   */
  public getMiddleFingerNailPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerNailPosition(...args);
  }

  /**
   * [0487] getMiddleFingerPadPosition
   * Lấy tọa độ đệm ngón giữa.
   */
  public getMiddleFingerPadPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerPadPosition(...args);
  }

  /**
   * [0488] getMiddleFingerBasePosition
   * Lấy tọa độ đáy ngón giữa.
   */
  public getMiddleFingerBasePosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerBasePosition(...args);
  }

  /**
   * [0489] getMiddleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón giữa.
   */
  public getMiddleFingerProximalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerProximalJoint(...args);
  }

  /**
   * [0490] getMiddleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón giữa.
   */
  public getMiddleFingerDistalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getMiddleFingerDistalJoint(...args);
  }

  /**
   * [0491] calculateMiddleFingerLength
   * Tính chiều dài ngón giữa.
   */
  public calculateMiddleFingerLength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerLength(...args);
  }

  /**
   * [0492] calculateMiddleFingerWidth
   * Tính chiều rộng ngón giữa.
   */
  public calculateMiddleFingerWidth(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerWidth(...args);
  }

  /**
   * [0493] calculateMiddleFingerThickness
   * Tính độ dày ngón giữa.
   */
  public calculateMiddleFingerThickness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerThickness(...args);
  }

  /**
   * [0494] calculateMiddleFingerCurvature
   * Tính độ cong ngón giữa.
   */
  public calculateMiddleFingerCurvature(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerCurvature(...args);
  }

  /**
   * [0495] calculateMiddleFingerDirection
   * Tính hướng ngón giữa.
   */
  public calculateMiddleFingerDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerDirection(...args);
  }

  /**
   * [0496] calculateMiddleFingerOrientation
   * Tính hướng quay ngón giữa.
   */
  public calculateMiddleFingerOrientation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerOrientation(...args);
  }

  /**
   * [0497] calculateMiddleFingerFlexion
   * Tính góc gập ngón giữa.
   */
  public calculateMiddleFingerFlexion(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerFlexion(...args);
  }

  /**
   * [0498] calculateMiddleFingerExtension
   * Tính góc duỗi ngón giữa.
   */
  public calculateMiddleFingerExtension(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerExtension(...args);
  }

  /**
   * [0499] calculateMiddleFingerAbduction
   * Tính góc dạng ngón giữa.
   */
  public calculateMiddleFingerAbduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerAbduction(...args);
  }

  /**
   * [0500] calculateMiddleFingerAdduction
   * Tính góc khép ngón giữa.
   */
  public calculateMiddleFingerAdduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerAdduction(...args);
  }

  /**
   * [0501] calculateMiddleFingerRotation
   * Tính góc quay ngón giữa.
   */
  public calculateMiddleFingerRotation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerRotation(...args);
  }

  /**
   * [0502] calculateMiddleFingerTipVelocity
   * Tính vận tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipVelocity(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerTipVelocity(...args);
  }

  /**
   * [0503] calculateMiddleFingerTipAcceleration
   * Tính gia tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipAcceleration(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerTipAcceleration(...args);
  }

  /**
   * [0504] calculateMiddleFingerJointAngles
   * Tính các góc khớp ngón giữa.
   */
  public calculateMiddleFingerJointAngles(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerJointAngles(...args);
  }

  /**
   * [0505] calculateMiddleFingerSegmentLengths
   * Tính chiều dài các đốt ngón giữa.
   */
  public calculateMiddleFingerSegmentLengths(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerSegmentLengths(...args);
  }

  /**
   * [0506] calculateMiddleFingerBoundingBox
   * Tính hộp bao ngón giữa.
   */
  public calculateMiddleFingerBoundingBox(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerBoundingBox(...args);
  }

  /**
   * [0507] calculateMiddleFingerBoundingSphere
   * Tính hình cầu bao ngón giữa.
   */
  public calculateMiddleFingerBoundingSphere(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerBoundingSphere(...args);
  }

  /**
   * [0508] calculateMiddleToThumbDistance
   * Tính khoảng cách ngón giữa đến ngón cái.
   */
  public calculateMiddleToThumbDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleToThumbDistance(...args);
  }

  /**
   * [0509] calculateMiddleToIndexDistance
   * Tính khoảng cách ngón giữa đến ngón trỏ.
   */
  public calculateMiddleToIndexDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleToIndexDistance(...args);
  }

  /**
   * [0510] calculateMiddleToRingDistance
   * Tính khoảng cách ngón giữa đến ngón áp út.
   */
  public calculateMiddleToRingDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleToRingDistance(...args);
  }

  /**
   * [0511] calculateMiddleToLittleDistance
   * Tính khoảng cách ngón giữa đến ngón út.
   */
  public calculateMiddleToLittleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleToLittleDistance(...args);
  }

  /**
   * [0512] calculateMiddleFingerReachEnvelope
   * Tính vùng với tới của ngón giữa.
   */
  public calculateMiddleFingerReachEnvelope(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerReachEnvelope(...args);
  }

  /**
   * [0513] calculateMiddleFingerContactPoint
   * Tính điểm tiếp xúc ngón giữa.
   */
  public calculateMiddleFingerContactPoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerContactPoint(...args);
  }

  /**
   * [0514] calculateMiddleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón giữa.
   */
  public calculateMiddleFingerSurfaceNormal(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerSurfaceNormal(...args);
  }

  /**
   * [0515] calculateMiddleFingerPoseError
   * Tính sai lệch tư thế ngón giữa.
   */
  public calculateMiddleFingerPoseError(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerPoseError(...args);
  }

  /**
   * [0516] calculateMiddleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón giữa.
   */
  public calculateMiddleFingerMotionSmoothness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerMotionSmoothness(...args);
  }

  /**
   * [0517] calculateMiddleFingerCollision
   * Kiểm tra va chạm ngón giữa.
   */
  public calculateMiddleFingerCollision(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerCollision(...args);
  }

  /**
   * [0518] calculateMiddleFingerCurl
   * Tính độ cuộn ngón giữa.
   */
  public calculateMiddleFingerCurl(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerCurl(...args);
  }

  /**
   * [0519] calculateMiddleFingerSpread
   * Tính độ xòe ngón giữa.
   */
  public calculateMiddleFingerSpread(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerSpread(...args);
  }

  /**
   * [0520] calculateMiddleFingerAlignment
   * Tính độ thẳng hàng ngón giữa.
   */
  public calculateMiddleFingerAlignment(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateMiddleFingerAlignment(...args);
  }

  /**
   * [0521] getRingFingerRootPosition
   * Lấy tọa độ gốc ngón áp út.
   */
  public getRingFingerRootPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerRootPosition(...args);
  }

  /**
   * [0522] getRingFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón áp út.
   */
  public getRingFingerMCPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerMCPPosition(...args);
  }

  /**
   * [0523] getRingFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón áp út.
   */
  public getRingFingerPIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerPIPPosition(...args);
  }

  /**
   * [0524] getRingFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón áp út.
   */
  public getRingFingerDIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerDIPPosition(...args);
  }

  /**
   * [0525] getRingFingerTipPosition
   * Lấy tọa độ đầu ngón áp út.
   */
  public getRingFingerTipPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerTipPosition(...args);
  }

  /**
   * [0526] getRingFingerNailPosition
   * Lấy tọa độ móng ngón áp út.
   */
  public getRingFingerNailPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerNailPosition(...args);
  }

  /**
   * [0527] getRingFingerPadPosition
   * Lấy tọa độ đệm ngón áp út.
   */
  public getRingFingerPadPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerPadPosition(...args);
  }

  /**
   * [0528] getRingFingerBasePosition
   * Lấy tọa độ đáy ngón áp út.
   */
  public getRingFingerBasePosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerBasePosition(...args);
  }

  /**
   * [0529] getRingFingerProximalJoint
   * Lấy tọa độ khớp gần ngón áp út.
   */
  public getRingFingerProximalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerProximalJoint(...args);
  }

  /**
   * [0530] getRingFingerDistalJoint
   * Lấy tọa độ khớp xa ngón áp út.
   */
  public getRingFingerDistalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getRingFingerDistalJoint(...args);
  }

  /**
   * [0531] calculateRingFingerLength
   * Tính chiều dài ngón áp út.
   */
  public calculateRingFingerLength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerLength(...args);
  }

  /**
   * [0532] calculateRingFingerWidth
   * Tính chiều rộng ngón áp út.
   */
  public calculateRingFingerWidth(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerWidth(...args);
  }

  /**
   * [0533] calculateRingFingerThickness
   * Tính độ dày ngón áp út.
   */
  public calculateRingFingerThickness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerThickness(...args);
  }

  /**
   * [0534] calculateRingFingerCurvature
   * Tính độ cong ngón áp út.
   */
  public calculateRingFingerCurvature(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerCurvature(...args);
  }

  /**
   * [0535] calculateRingFingerDirection
   * Tính hướng ngón áp út.
   */
  public calculateRingFingerDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerDirection(...args);
  }

  /**
   * [0536] calculateRingFingerOrientation
   * Tính hướng quay ngón áp út.
   */
  public calculateRingFingerOrientation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerOrientation(...args);
  }

  /**
   * [0537] calculateRingFingerFlexion
   * Tính góc gập ngón áp út.
   */
  public calculateRingFingerFlexion(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerFlexion(...args);
  }

  /**
   * [0538] calculateRingFingerExtension
   * Tính góc duỗi ngón áp út.
   */
  public calculateRingFingerExtension(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerExtension(...args);
  }

  /**
   * [0539] calculateRingFingerAbduction
   * Tính góc dạng ngón áp út.
   */
  public calculateRingFingerAbduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerAbduction(...args);
  }

  /**
   * [0540] calculateRingFingerAdduction
   * Tính góc khép ngón áp út.
   */
  public calculateRingFingerAdduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerAdduction(...args);
  }

  /**
   * [0541] calculateRingFingerRotation
   * Tính góc quay ngón áp út.
   */
  public calculateRingFingerRotation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerRotation(...args);
  }

  /**
   * [0542] calculateRingFingerTipVelocity
   * Tính vận tốc đầu ngón áp út.
   */
  public calculateRingFingerTipVelocity(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerTipVelocity(...args);
  }

  /**
   * [0543] calculateRingFingerTipAcceleration
   * Tính gia tốc đầu ngón áp út.
   */
  public calculateRingFingerTipAcceleration(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerTipAcceleration(...args);
  }

  /**
   * [0544] calculateRingFingerJointAngles
   * Tính các góc khớp ngón áp út.
   */
  public calculateRingFingerJointAngles(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerJointAngles(...args);
  }

  /**
   * [0545] calculateRingFingerSegmentLengths
   * Tính chiều dài các đốt ngón áp út.
   */
  public calculateRingFingerSegmentLengths(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerSegmentLengths(...args);
  }

  /**
   * [0546] calculateRingFingerBoundingBox
   * Tính hộp bao ngón áp út.
   */
  public calculateRingFingerBoundingBox(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerBoundingBox(...args);
  }

  /**
   * [0547] calculateRingFingerBoundingSphere
   * Tính hình cầu bao ngón áp út.
   */
  public calculateRingFingerBoundingSphere(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerBoundingSphere(...args);
  }

  /**
   * [0548] calculateRingToThumbDistance
   * Tính khoảng cách ngón áp út đến ngón cái.
   */
  public calculateRingToThumbDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingToThumbDistance(...args);
  }

  /**
   * [0549] calculateRingToIndexDistance
   * Tính khoảng cách ngón áp út đến ngón trỏ.
   */
  public calculateRingToIndexDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingToIndexDistance(...args);
  }

  /**
   * [0550] calculateRingToMiddleDistance
   * Tính khoảng cách ngón áp út đến ngón giữa.
   */
  public calculateRingToMiddleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingToMiddleDistance(...args);
  }

  /**
   * [0551] calculateRingToLittleDistance
   * Tính khoảng cách ngón áp út đến ngón út.
   */
  public calculateRingToLittleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingToLittleDistance(...args);
  }

  /**
   * [0552] calculateRingFingerReachEnvelope
   * Tính vùng với tới của ngón áp út.
   */
  public calculateRingFingerReachEnvelope(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerReachEnvelope(...args);
  }

  /**
   * [0553] calculateRingFingerContactPoint
   * Tính điểm tiếp xúc ngón áp út.
   */
  public calculateRingFingerContactPoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerContactPoint(...args);
  }

  /**
   * [0554] calculateRingFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón áp út.
   */
  public calculateRingFingerSurfaceNormal(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerSurfaceNormal(...args);
  }

  /**
   * [0555] calculateRingFingerPoseError
   * Tính sai lệch tư thế ngón áp út.
   */
  public calculateRingFingerPoseError(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerPoseError(...args);
  }

  /**
   * [0556] calculateRingFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón áp út.
   */
  public calculateRingFingerMotionSmoothness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerMotionSmoothness(...args);
  }

  /**
   * [0557] calculateRingFingerCollision
   * Kiểm tra va chạm ngón áp út.
   */
  public calculateRingFingerCollision(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerCollision(...args);
  }

  /**
   * [0558] calculateRingFingerCurl
   * Tính độ cuộn ngón áp út.
   */
  public calculateRingFingerCurl(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerCurl(...args);
  }

  /**
   * [0559] calculateRingFingerSpread
   * Tính độ xòe ngón áp út.
   */
  public calculateRingFingerSpread(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerSpread(...args);
  }

  /**
   * [0560] calculateRingFingerAlignment
   * Tính độ thẳng hàng ngón áp út.
   */
  public calculateRingFingerAlignment(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateRingFingerAlignment(...args);
  }

  /**
   * [0561] getLittleFingerRootPosition
   * Lấy tọa độ gốc ngón út.
   */
  public getLittleFingerRootPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerRootPosition(...args);
  }

  /**
   * [0562] getLittleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón út.
   */
  public getLittleFingerMCPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerMCPPosition(...args);
  }

  /**
   * [0563] getLittleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón út.
   */
  public getLittleFingerPIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerPIPPosition(...args);
  }

  /**
   * [0564] getLittleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón út.
   */
  public getLittleFingerDIPPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerDIPPosition(...args);
  }

  /**
   * [0565] getLittleFingerTipPosition
   * Lấy tọa độ đầu ngón út.
   */
  public getLittleFingerTipPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerTipPosition(...args);
  }

  /**
   * [0566] getLittleFingerNailPosition
   * Lấy tọa độ móng ngón út.
   */
  public getLittleFingerNailPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerNailPosition(...args);
  }

  /**
   * [0567] getLittleFingerPadPosition
   * Lấy tọa độ đệm ngón út.
   */
  public getLittleFingerPadPosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerPadPosition(...args);
  }

  /**
   * [0568] getLittleFingerBasePosition
   * Lấy tọa độ đáy ngón út.
   */
  public getLittleFingerBasePosition(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerBasePosition(...args);
  }

  /**
   * [0569] getLittleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón út.
   */
  public getLittleFingerProximalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerProximalJoint(...args);
  }

  /**
   * [0570] getLittleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón út.
   */
  public getLittleFingerDistalJoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).getLittleFingerDistalJoint(...args);
  }

  /**
   * [0571] calculateLittleFingerLength
   * Tính chiều dài ngón út.
   */
  public calculateLittleFingerLength(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerLength(...args);
  }

  /**
   * [0572] calculateLittleFingerWidth
   * Tính chiều rộng ngón út.
   */
  public calculateLittleFingerWidth(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerWidth(...args);
  }

  /**
   * [0573] calculateLittleFingerThickness
   * Tính độ dày ngón út.
   */
  public calculateLittleFingerThickness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerThickness(...args);
  }

  /**
   * [0574] calculateLittleFingerCurvature
   * Tính độ cong ngón út.
   */
  public calculateLittleFingerCurvature(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerCurvature(...args);
  }

  /**
   * [0575] calculateLittleFingerDirection
   * Tính hướng ngón út.
   */
  public calculateLittleFingerDirection(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerDirection(...args);
  }

  /**
   * [0576] calculateLittleFingerOrientation
   * Tính hướng quay ngón út.
   */
  public calculateLittleFingerOrientation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerOrientation(...args);
  }

  /**
   * [0577] calculateLittleFingerFlexion
   * Tính góc gập ngón út.
   */
  public calculateLittleFingerFlexion(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerFlexion(...args);
  }

  /**
   * [0578] calculateLittleFingerExtension
   * Tính góc duỗi ngón út.
   */
  public calculateLittleFingerExtension(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerExtension(...args);
  }

  /**
   * [0579] calculateLittleFingerAbduction
   * Tính góc dạng ngón út.
   */
  public calculateLittleFingerAbduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerAbduction(...args);
  }

  /**
   * [0580] calculateLittleFingerAdduction
   * Tính góc khép ngón út.
   */
  public calculateLittleFingerAdduction(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerAdduction(...args);
  }

  /**
   * [0581] calculateLittleFingerRotation
   * Tính góc quay ngón út.
   */
  public calculateLittleFingerRotation(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerRotation(...args);
  }

  /**
   * [0582] calculateLittleFingerTipVelocity
   * Tính vận tốc đầu ngón út.
   */
  public calculateLittleFingerTipVelocity(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerTipVelocity(...args);
  }

  /**
   * [0583] calculateLittleFingerTipAcceleration
   * Tính gia tốc đầu ngón út.
   */
  public calculateLittleFingerTipAcceleration(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerTipAcceleration(...args);
  }

  /**
   * [0584] calculateLittleFingerJointAngles
   * Tính các góc khớp ngón út.
   */
  public calculateLittleFingerJointAngles(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerJointAngles(...args);
  }

  /**
   * [0585] calculateLittleFingerSegmentLengths
   * Tính chiều dài các đốt ngón út.
   */
  public calculateLittleFingerSegmentLengths(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerSegmentLengths(...args);
  }

  /**
   * [0586] calculateLittleFingerBoundingBox
   * Tính hộp bao ngón út.
   */
  public calculateLittleFingerBoundingBox(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerBoundingBox(...args);
  }

  /**
   * [0587] calculateLittleFingerBoundingSphere
   * Tính hình cầu bao ngón út.
   */
  public calculateLittleFingerBoundingSphere(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerBoundingSphere(...args);
  }

  /**
   * [0588] calculateLittleToThumbDistance
   * Tính khoảng cách ngón út đến ngón cái.
   */
  public calculateLittleToThumbDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleToThumbDistance(...args);
  }

  /**
   * [0589] calculateLittleToIndexDistance
   * Tính khoảng cách ngón út đến ngón trỏ.
   */
  public calculateLittleToIndexDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleToIndexDistance(...args);
  }

  /**
   * [0590] calculateLittleToMiddleDistance
   * Tính khoảng cách ngón út đến ngón giữa.
   */
  public calculateLittleToMiddleDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleToMiddleDistance(...args);
  }

  /**
   * [0591] calculateLittleToRingDistance
   * Tính khoảng cách ngón út đến ngón áp út.
   */
  public calculateLittleToRingDistance(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleToRingDistance(...args);
  }

  /**
   * [0592] calculateLittleFingerReachEnvelope
   * Tính vùng với tới của ngón út.
   */
  public calculateLittleFingerReachEnvelope(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerReachEnvelope(...args);
  }

  /**
   * [0593] calculateLittleFingerContactPoint
   * Tính điểm tiếp xúc ngón út.
   */
  public calculateLittleFingerContactPoint(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerContactPoint(...args);
  }

  /**
   * [0594] calculateLittleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón út.
   */
  public calculateLittleFingerSurfaceNormal(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerSurfaceNormal(...args);
  }

  /**
   * [0595] calculateLittleFingerPoseError
   * Tính sai lệch tư thế ngón út.
   */
  public calculateLittleFingerPoseError(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerPoseError(...args);
  }

  /**
   * [0596] calculateLittleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón út.
   */
  public calculateLittleFingerMotionSmoothness(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerMotionSmoothness(...args);
  }

  /**
   * [0597] calculateLittleFingerCollision
   * Kiểm tra va chạm ngón út.
   */
  public calculateLittleFingerCollision(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerCollision(...args);
  }

  /**
   * [0598] calculateLittleFingerCurl
   * Tính độ cuộn ngón út.
   */
  public calculateLittleFingerCurl(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerCurl(...args);
  }

  /**
   * [0599] calculateLittleFingerSpread
   * Tính độ xòe ngón út.
   */
  public calculateLittleFingerSpread(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerSpread(...args);
  }

  /**
   * [0600] calculateLittleFingerAlignment
   * Tính độ thẳng hàng ngón út.
   */
  public calculateLittleFingerAlignment(...args: any[]): any {
    return (this.anatomicalHandDigits as any).calculateLittleFingerAlignment(...args);
  }

  /**
   * [0601] getHeldObjectPosition
   * Lấy tọa độ vật thể đang cầm.
   */
  public getHeldObjectPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectPosition(...args);
  }

  /**
   * [0602] getHeldObjectCenter
   * Lấy tâm vật thể đang cầm.
   */
  public getHeldObjectCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectCenter(...args);
  }

  /**
   * [0603] getHeldObjectRotation
   * Lấy góc quay vật thể đang cầm.
   */
  public getHeldObjectRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectRotation(...args);
  }

  /**
   * [0604] getHeldObjectScale
   * Lấy tỷ lệ kích thước vật thể đang cầm.
   */
  public getHeldObjectScale(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectScale(...args);
  }

  /**
   * [0605] getHeldObjectWorldPosition
   * Lấy tọa độ thế giới của vật thể đang cầm.
   */
  public getHeldObjectWorldPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectWorldPosition(...args);
  }

  /**
   * [0606] getHeldObjectLocalPosition
   * Lấy tọa độ cục bộ của vật thể đang cầm.
   */
  public getHeldObjectLocalPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectLocalPosition(...args);
  }

  /**
   * [0607] getHeldObjectAnchor
   * Lấy điểm neo vật thể đang cầm.
   */
  public getHeldObjectAnchor(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectAnchor(...args);
  }

  /**
   * [0608] getHeldObjectPivot
   * Lấy điểm xoay vật thể đang cầm.
   */
  public getHeldObjectPivot(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectPivot(...args);
  }

  /**
   * [0609] getHeldObjectGripPoint
   * Lấy điểm nắm vật thể.
   */
  public getHeldObjectGripPoint(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectGripPoint(...args);
  }

  /**
   * [0610] getHeldObjectContactPoint
   * Lấy điểm tiếp xúc vật thể.
   */
  public getHeldObjectContactPoint(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectContactPoint(...args);
  }

  /**
   * [0611] getHeldObjectTipPosition
   * Lấy tọa độ đầu vật thể.
   */
  public getHeldObjectTipPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectTipPosition(...args);
  }

  /**
   * [0612] getHeldObjectBasePosition
   * Lấy tọa độ đáy vật thể.
   */
  public getHeldObjectBasePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectBasePosition(...args);
  }

  /**
   * [0613] getHeldObjectFrontPosition
   * Lấy tọa độ mặt trước vật thể.
   */
  public getHeldObjectFrontPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectFrontPosition(...args);
  }

  /**
   * [0614] getHeldObjectBackPosition
   * Lấy tọa độ mặt sau vật thể.
   */
  public getHeldObjectBackPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectBackPosition(...args);
  }

  /**
   * [0615] getHeldObjectLeftPosition
   * Lấy tọa độ bên trái vật thể.
   */
  public getHeldObjectLeftPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectLeftPosition(...args);
  }

  /**
   * [0616] getHeldObjectRightPosition
   * Lấy tọa độ bên phải vật thể.
   */
  public getHeldObjectRightPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectRightPosition(...args);
  }

  /**
   * [0617] getHeldObjectUpPosition
   * Lấy tọa độ phía trên vật thể.
   */
  public getHeldObjectUpPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectUpPosition(...args);
  }

  /**
   * [0618] getHeldObjectDownPosition
   * Lấy tọa độ phía dưới vật thể.
   */
  public getHeldObjectDownPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHeldObjectDownPosition(...args);
  }

  /**
   * [0619] calculateHeldObjectLength
   * Tính chiều dài vật thể đang cầm.
   */
  public calculateHeldObjectLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectLength(...args);
  }

  /**
   * [0620] calculateHeldObjectWidth
   * Tính chiều rộng vật thể đang cầm.
   */
  public calculateHeldObjectWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectWidth(...args);
  }

  /**
   * [0621] calculateHeldObjectHeight
   * Tính chiều cao vật thể đang cầm.
   */
  public calculateHeldObjectHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectHeight(...args);
  }

  /**
   * [0622] calculateHeldObjectVolume
   * Tính thể tích vật thể đang cầm.
   */
  public calculateHeldObjectVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectVolume(...args);
  }

  /**
   * [0623] calculateHeldObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateHeldObjectSurfaceArea(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectSurfaceArea(...args);
  }

  /**
   * [0624] calculateHeldObjectMass
   * Tính khối lượng vật thể.
   */
  public calculateHeldObjectMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectMass(...args);
  }

  /**
   * [0625] calculateHeldObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateHeldObjectCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectCenterOfMass(...args);
  }

  /**
   * [0626] calculateHeldObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateHeldObjectInertiaTensor(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectInertiaTensor(...args);
  }

  /**
   * [0627] calculateHeldObjectBoundingBox
   * Tính hộp bao vật thể.
   */
  public calculateHeldObjectBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectBoundingBox(...args);
  }

  /**
   * [0628] calculateHeldObjectBoundingSphere
   * Tính hình cầu bao vật thể.
   */
  public calculateHeldObjectBoundingSphere(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectBoundingSphere(...args);
  }

  /**
   * [0629] calculateHeldObjectBoundingCapsule
   * Tính capsule bao vật thể.
   */
  public calculateHeldObjectBoundingCapsule(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectBoundingCapsule(...args);
  }

  /**
   * [0630] calculateHeldObjectBoundingCylinder
   * Tính hình trụ bao vật thể.
   */
  public calculateHeldObjectBoundingCylinder(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectBoundingCylinder(...args);
  }

  /**
   * [0631] calculateHeldObjectDistanceToHand
   * Tính khoảng cách vật thể đến bàn tay.
   */
  public calculateHeldObjectDistanceToHand(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectDistanceToHand(...args);
  }

  /**
   * [0632] calculateHeldObjectDistanceToWrist
   * Tính khoảng cách vật thể đến cổ tay.
   */
  public calculateHeldObjectDistanceToWrist(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectDistanceToWrist(...args);
  }

  /**
   * [0633] calculateHeldObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateHeldObjectDistanceToCamera(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectDistanceToCamera(...args);
  }

  /**
   * [0634] calculateHeldObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateHeldObjectDistanceToTarget(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectDistanceToTarget(...args);
  }

  /**
   * [0635] calculateHeldObjectGripAlignment
   * Tính độ thẳng hàng giữa tay và điểm nắm.
   */
  public calculateHeldObjectGripAlignment(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectGripAlignment(...args);
  }

  /**
   * [0636] calculateHeldObjectGripOffset
   * Tính độ lệch điểm nắm.
   */
  public calculateHeldObjectGripOffset(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectGripOffset(...args);
  }

  /**
   * [0637] calculateHeldObjectGripRotation
   * Tính góc xoay khi cầm.
   */
  public calculateHeldObjectGripRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectGripRotation(...args);
  }

  /**
   * [0638] calculateHeldObjectGripStability
   * Tính độ ổn định khi cầm.
   */
  public calculateHeldObjectGripStability(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectGripStability(...args);
  }

  /**
   * [0639] calculateHeldObjectHandPose
   * Tính tư thế bàn tay khi cầm.
   */
  public calculateHeldObjectHandPose(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectHandPose(...args);
  }

  /**
   * [0640] calculateHeldObjectFingerContact
   * Tính tiếp xúc giữa ngón tay và vật thể.
   */
  public calculateHeldObjectFingerContact(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectFingerContact(...args);
  }

  /**
   * [0641] calculateHeldObjectCollision
   * Kiểm tra va chạm vật thể đang cầm.
   */
  public calculateHeldObjectCollision(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectCollision(...args);
  }

  /**
   * [0642] calculateHeldObjectPenetrationDepth
   * Tính độ xuyên lấn khi va chạm.
   */
  public calculateHeldObjectPenetrationDepth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectPenetrationDepth(...args);
  }

  /**
   * [0643] calculateHeldObjectVelocity
   * Tính vận tốc vật thể đang cầm.
   */
  public calculateHeldObjectVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectVelocity(...args);
  }

  /**
   * [0644] calculateHeldObjectAcceleration
   * Tính gia tốc vật thể đang cầm.
   */
  public calculateHeldObjectAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectAcceleration(...args);
  }

  /**
   * [0645] calculateHeldObjectAngularVelocity
   * Tính vận tốc góc vật thể.
   */
  public calculateHeldObjectAngularVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectAngularVelocity(...args);
  }

  /**
   * [0646] calculateHeldObjectAngularAcceleration
   * Tính gia tốc góc vật thể.
   */
  public calculateHeldObjectAngularAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectAngularAcceleration(...args);
  }

  /**
   * [0647] calculateHeldObjectTrajectory
   * Tính quỹ đạo vật thể đang cầm.
   */
  public calculateHeldObjectTrajectory(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectTrajectory(...args);
  }

  /**
   * [0648] calculateHeldObjectThrowVelocity
   * Tính vận tốc ném vật thể.
   */
  public calculateHeldObjectThrowVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectThrowVelocity(...args);
  }

  /**
   * [0649] calculateHeldObjectReleasePosition
   * Tính vị trí thả vật thể.
   */
  public calculateHeldObjectReleasePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectReleasePosition(...args);
  }

  /**
   * [0650] calculateHeldObjectReleaseRotation
   * Tính góc quay lúc thả vật thể.
   */
  public calculateHeldObjectReleaseRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHeldObjectReleaseRotation(...args);
  }

  /**
   * [0651] getTorsoPosition
   * Lấy tọa độ thân.
   */
  public getTorsoPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoPosition(...args);
  }

  /**
   * [0652] getTorsoCenter
   * Lấy tâm thân.
   */
  public getTorsoCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoCenter(...args);
  }

  /**
   * [0653] getTorsoTopPosition
   * Lấy tọa độ đỉnh thân.
   */
  public getTorsoTopPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoTopPosition(...args);
  }

  /**
   * [0654] getTorsoBottomPosition
   * Lấy tọa độ đáy thân.
   */
  public getTorsoBottomPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoBottomPosition(...args);
  }

  /**
   * [0655] getTorsoFrontPosition
   * Lấy tọa độ mặt trước thân.
   */
  public getTorsoFrontPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoFrontPosition(...args);
  }

  /**
   * [0656] getTorsoBackPosition
   * Lấy tọa độ mặt sau thân.
   */
  public getTorsoBackPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoBackPosition(...args);
  }

  /**
   * [0657] getTorsoLeftPosition
   * Lấy tọa độ bên trái thân.
   */
  public getTorsoLeftPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoLeftPosition(...args);
  }

  /**
   * [0658] getTorsoRightPosition
   * Lấy tọa độ bên phải thân.
   */
  public getTorsoRightPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTorsoRightPosition(...args);
  }

  /**
   * [0659] getChestPosition
   * Lấy tọa độ ngực.
   */
  public getChestPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getChestPosition(...args);
  }

  /**
   * [0660] getChestCenter
   * Lấy tâm ngực.
   */
  public getChestCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getChestCenter(...args);
  }

  /**
   * [0661] getChestFrontPosition
   * Lấy tọa độ phía trước ngực.
   */
  public getChestFrontPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getChestFrontPosition(...args);
  }

  /**
   * [0662] getChestBackPosition
   * Lấy tọa độ phía sau ngực.
   */
  public getChestBackPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getChestBackPosition(...args);
  }

  /**
   * [0663] getRibcageCenter
   * Lấy tâm lồng ngực.
   */
  public getRibcageCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRibcageCenter(...args);
  }

  /**
   * [0664] getSternumPosition
   * Lấy tọa độ xương ức.
   */
  public getSternumPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getSternumPosition(...args);
  }

  /**
   * [0665] getSpinePosition
   * Lấy tọa độ cột sống.
   */
  public getSpinePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getSpinePosition(...args);
  }

  /**
   * [0666] getUpperSpinePosition
   * Lấy tọa độ cột sống trên.
   */
  public getUpperSpinePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getUpperSpinePosition(...args);
  }

  /**
   * [0667] getMiddleSpinePosition
   * Lấy tọa độ cột sống giữa.
   */
  public getMiddleSpinePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getMiddleSpinePosition(...args);
  }

  /**
   * [0668] getLowerSpinePosition
   * Lấy tọa độ cột sống dưới.
   */
  public getLowerSpinePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLowerSpinePosition(...args);
  }

  /**
   * [0669] calculateTorsoLength
   * Tính chiều dài thân.
   */
  public calculateTorsoLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoLength(...args);
  }

  /**
   * [0670] calculateTorsoWidth
   * Tính chiều rộng thân.
   */
  public calculateTorsoWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoWidth(...args);
  }

  /**
   * [0671] calculateTorsoHeight
   * Tính chiều cao thân.
   */
  public calculateTorsoHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoHeight(...args);
  }

  /**
   * [0672] calculateTorsoDepth
   * Tính chiều sâu thân.
   */
  public calculateTorsoDepth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoDepth(...args);
  }

  /**
   * [0673] calculateTorsoVolume
   * Tính thể tích thân.
   */
  public calculateTorsoVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoVolume(...args);
  }

  /**
   * [0674] calculateTorsoSurfaceArea
   * Tính diện tích bề mặt thân.
   */
  public calculateTorsoSurfaceArea(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoSurfaceArea(...args);
  }

  /**
   * [0675] calculateTorsoBoundingBox
   * Tính hộp bao thân.
   */
  public calculateTorsoBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoBoundingBox(...args);
  }

  /**
   * [0676] calculateTorsoBoundingSphere
   * Tính hình cầu bao thân.
   */
  public calculateTorsoBoundingSphere(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoBoundingSphere(...args);
  }

  /**
   * [0677] calculateTorsoCenterOfMass
   * Tính tâm khối lượng thân.
   */
  public calculateTorsoCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoCenterOfMass(...args);
  }

  /**
   * [0678] calculateTorsoOrientation
   * Tính hướng thân.
   */
  public calculateTorsoOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoOrientation(...args);
  }

  /**
   * [0679] calculateTorsoRotation
   * Tính góc quay thân.
   */
  public calculateTorsoRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoRotation(...args);
  }

  /**
   * [0680] calculateTorsoTilt
   * Tính độ nghiêng thân.
   */
  public calculateTorsoTilt(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoTilt(...args);
  }

  /**
   * [0681] calculateTorsoTwist
   * Tính góc xoắn thân.
   */
  public calculateTorsoTwist(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoTwist(...args);
  }

  /**
   * [0682] calculateTorsoBend
   * Tính độ gập thân.
   */
  public calculateTorsoBend(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoBend(...args);
  }

  /**
   * [0683] calculateTorsoLeanAngle
   * Tính góc nghiêng người.
   */
  public calculateTorsoLeanAngle(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoLeanAngle(...args);
  }

  /**
   * [0684] calculateTorsoFlexion
   * Tính góc gập thân về trước.
   */
  public calculateTorsoFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoFlexion(...args);
  }

  /**
   * [0685] calculateTorsoExtension
   * Tính góc ngả thân về sau.
   */
  public calculateTorsoExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoExtension(...args);
  }

  /**
   * [0686] calculateTorsoLateralBend
   * Tính góc nghiêng thân sang bên.
   */
  public calculateTorsoLateralBend(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoLateralBend(...args);
  }

  /**
   * [0687] calculateTorsoVelocity
   * Tính vận tốc thân.
   */
  public calculateTorsoVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoVelocity(...args);
  }

  /**
   * [0688] calculateTorsoAcceleration
   * Tính gia tốc thân.
   */
  public calculateTorsoAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoAcceleration(...args);
  }

  /**
   * [0689] calculateTorsoAngularVelocity
   * Tính vận tốc góc thân.
   */
  public calculateTorsoAngularVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoAngularVelocity(...args);
  }

  /**
   * [0690] calculateTorsoAngularAcceleration
   * Tính gia tốc góc thân.
   */
  public calculateTorsoAngularAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoAngularAcceleration(...args);
  }

  /**
   * [0691] calculateTorsoToHeadDistance
   * Tính khoảng cách thân đến đầu.
   */
  public calculateTorsoToHeadDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoToHeadDistance(...args);
  }

  /**
   * [0692] calculateTorsoToHipDistance
   * Tính khoảng cách thân đến hông.
   */
  public calculateTorsoToHipDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoToHipDistance(...args);
  }

  /**
   * [0693] calculateTorsoToShoulderDistance
   * Tính khoảng cách thân đến vai.
   */
  public calculateTorsoToShoulderDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoToShoulderDistance(...args);
  }

  /**
   * [0694] calculateTorsoSymmetry
   * Tính độ đối xứng thân.
   */
  public calculateTorsoSymmetry(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoSymmetry(...args);
  }

  /**
   * [0695] calculateTorsoPoseError
   * Tính sai lệch tư thế thân.
   */
  public calculateTorsoPoseError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoPoseError(...args);
  }

  /**
   * [0696] calculateTorsoMotionSmoothness
   * Tính độ mượt chuyển động thân.
   */
  public calculateTorsoMotionSmoothness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoMotionSmoothness(...args);
  }

  /**
   * [0697] calculateTorsoSurfaceNormal
   * Tính pháp tuyến bề mặt thân.
   */
  public calculateTorsoSurfaceNormal(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoSurfaceNormal(...args);
  }

  /**
   * [0698] calculateTorsoCollision
   * Kiểm tra va chạm thân.
   */
  public calculateTorsoCollision(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoCollision(...args);
  }

  /**
   * [0699] calculateTorsoGroundClearance
   * Tính khoảng cách thân đến mặt đất.
   */
  public calculateTorsoGroundClearance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoGroundClearance(...args);
  }

  /**
   * [0700] calculateTorsoJointChain
   * Tính chuỗi khớp thân.
   */
  public calculateTorsoJointChain(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateTorsoJointChain(...args);
  }

  /**
   * [0701] getAbdomenPosition
   * Lấy tọa độ bụng.
   */
  public getAbdomenPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getAbdomenPosition(...args);
  }

  /**
   * [0702] getAbdomenCenter
   * Lấy tâm bụng.
   */
  public getAbdomenCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getAbdomenCenter(...args);
  }

  /**
   * [0703] getUpperAbdomenPosition
   * Lấy tọa độ bụng trên.
   */
  public getUpperAbdomenPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getUpperAbdomenPosition(...args);
  }

  /**
   * [0704] getLowerAbdomenPosition
   * Lấy tọa độ bụng dưới.
   */
  public getLowerAbdomenPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLowerAbdomenPosition(...args);
  }

  /**
   * [0705] getNavelPosition
   * Lấy tọa độ rốn.
   */
  public getNavelPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getNavelPosition(...args);
  }

  /**
   * [0706] getPelvisPosition
   * Lấy tọa độ xương chậu.
   */
  public getPelvisPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getPelvisPosition(...args);
  }

  /**
   * [0707] getPelvisCenter
   * Lấy tâm xương chậu.
   */
  public getPelvisCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getPelvisCenter(...args);
  }

  /**
   * [0708] getPelvisFrontPosition
   * Lấy tọa độ phía trước xương chậu.
   */
  public getPelvisFrontPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getPelvisFrontPosition(...args);
  }

  /**
   * [0709] getPelvisBackPosition
   * Lấy tọa độ phía sau xương chậu.
   */
  public getPelvisBackPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getPelvisBackPosition(...args);
  }

  /**
   * [0710] getLeftHipPosition
   * Lấy tọa độ hông trái.
   */
  public getLeftHipPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftHipPosition(...args);
  }

  /**
   * [0711] getRightHipPosition
   * Lấy tọa độ hông phải.
   */
  public getRightHipPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightHipPosition(...args);
  }

  /**
   * [0712] getHipCenter
   * Lấy tâm hai hông.
   */
  public getHipCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHipCenter(...args);
  }

  /**
   * [0713] getHipJointPosition
   * Lấy tọa độ khớp hông.
   */
  public getHipJointPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getHipJointPosition(...args);
  }

  /**
   * [0714] getSacrumPosition
   * Lấy tọa độ xương cùng.
   */
  public getSacrumPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getSacrumPosition(...args);
  }

  /**
   * [0715] getTailbonePosition
   * Lấy tọa độ xương cụt.
   */
  public getTailbonePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getTailbonePosition(...args);
  }

  /**
   * [0716] calculateAbdomenWidth
   * Tính chiều rộng bụng.
   */
  public calculateAbdomenWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAbdomenWidth(...args);
  }

  /**
   * [0717] calculateAbdomenHeight
   * Tính chiều cao bụng.
   */
  public calculateAbdomenHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAbdomenHeight(...args);
  }

  /**
   * [0718] calculateAbdomenDepth
   * Tính chiều sâu bụng.
   */
  public calculateAbdomenDepth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAbdomenDepth(...args);
  }

  /**
   * [0719] calculateAbdomenVolume
   * Tính thể tích bụng.
   */
  public calculateAbdomenVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAbdomenVolume(...args);
  }

  /**
   * [0720] calculateAbdomenCenterOfMass
   * Tính tâm khối lượng bụng.
   */
  public calculateAbdomenCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAbdomenCenterOfMass(...args);
  }

  /**
   * [0721] calculatePelvisWidth
   * Tính chiều rộng xương chậu.
   */
  public calculatePelvisWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisWidth(...args);
  }

  /**
   * [0722] calculatePelvisHeight
   * Tính chiều cao xương chậu.
   */
  public calculatePelvisHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisHeight(...args);
  }

  /**
   * [0723] calculatePelvisDepth
   * Tính chiều sâu xương chậu.
   */
  public calculatePelvisDepth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisDepth(...args);
  }

  /**
   * [0724] calculatePelvisOrientation
   * Tính hướng xương chậu.
   */
  public calculatePelvisOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisOrientation(...args);
  }

  /**
   * [0725] calculatePelvisRotation
   * Tính góc quay xương chậu.
   */
  public calculatePelvisRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisRotation(...args);
  }

  /**
   * [0726] calculatePelvisTilt
   * Tính độ nghiêng xương chậu.
   */
  public calculatePelvisTilt(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisTilt(...args);
  }

  /**
   * [0727] calculatePelvisTwist
   * Tính góc xoay xương chậu.
   */
  public calculatePelvisTwist(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisTwist(...args);
  }

  /**
   * [0728] calculateHipWidth
   * Tính chiều rộng hông.
   */
  public calculateHipWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipWidth(...args);
  }

  /**
   * [0729] calculateHipSymmetry
   * Tính độ đối xứng hông.
   */
  public calculateHipSymmetry(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipSymmetry(...args);
  }

  /**
   * [0730] calculateHipJointAngle
   * Tính góc khớp hông.
   */
  public calculateHipJointAngle(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipJointAngle(...args);
  }

  /**
   * [0731] calculateHipFlexion
   * Tính góc gập hông.
   */
  public calculateHipFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipFlexion(...args);
  }

  /**
   * [0732] calculateHipExtension
   * Tính góc duỗi hông.
   */
  public calculateHipExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipExtension(...args);
  }

  /**
   * [0733] calculateHipAbduction
   * Tính góc dạng hông.
   */
  public calculateHipAbduction(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipAbduction(...args);
  }

  /**
   * [0734] calculateHipAdduction
   * Tính góc khép hông.
   */
  public calculateHipAdduction(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipAdduction(...args);
  }

  /**
   * [0735] calculateHipInternalRotation
   * Tính góc xoay trong hông.
   */
  public calculateHipInternalRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipInternalRotation(...args);
  }

  /**
   * [0736] calculateHipExternalRotation
   * Tính góc xoay ngoài hông.
   */
  public calculateHipExternalRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipExternalRotation(...args);
  }

  /**
   * [0737] calculateHipVelocity
   * Tính vận tốc hông.
   */
  public calculateHipVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipVelocity(...args);
  }

  /**
   * [0738] calculateHipAcceleration
   * Tính gia tốc hông.
   */
  public calculateHipAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipAcceleration(...args);
  }

  /**
   * [0739] calculateHipBoundingBox
   * Tính hộp bao hông.
   */
  public calculateHipBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipBoundingBox(...args);
  }

  /**
   * [0740] calculateHipCenterOfMass
   * Tính tâm khối lượng hông.
   */
  public calculateHipCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipCenterOfMass(...args);
  }

  /**
   * [0741] calculateHipToKneeDistance
   * Tính khoảng cách hông đến đầu gối.
   */
  public calculateHipToKneeDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipToKneeDistance(...args);
  }

  /**
   * [0742] calculateHipToAnkleDistance
   * Tính khoảng cách hông đến mắt cá.
   */
  public calculateHipToAnkleDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipToAnkleDistance(...args);
  }

  /**
   * [0743] calculateHipToFootDistance
   * Tính khoảng cách hông đến bàn chân.
   */
  public calculateHipToFootDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipToFootDistance(...args);
  }

  /**
   * [0744] calculatePelvisGroundClearance
   * Tính khoảng cách xương chậu đến mặt đất.
   */
  public calculatePelvisGroundClearance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisGroundClearance(...args);
  }

  /**
   * [0745] calculatePelvisMotionVector
   * Tính vector chuyển động xương chậu.
   */
  public calculatePelvisMotionVector(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisMotionVector(...args);
  }

  /**
   * [0746] calculatePelvisPoseError
   * Tính sai lệch tư thế xương chậu.
   */
  public calculatePelvisPoseError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisPoseError(...args);
  }

  /**
   * [0747] calculatePelvisStability
   * Tính độ ổn định xương chậu.
   */
  public calculatePelvisStability(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisStability(...args);
  }

  /**
   * [0748] calculatePelvisCollision
   * Kiểm tra va chạm xương chậu.
   */
  public calculatePelvisCollision(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePelvisCollision(...args);
  }

  /**
   * [0749] calculateHipJointAxis
   * Tính trục khớp hông.
   */
  public calculateHipJointAxis(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipJointAxis(...args);
  }

  /**
   * [0750] calculateHipJointNormal
   * Tính pháp tuyến khớp hông.
   */
  public calculateHipJointNormal(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateHipJointNormal(...args);
  }

  /**
   * [0751] getLeftLegPosition
   * Lấy tọa độ chân trái.
   */
  public getLeftLegPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftLegPosition(...args);
  }

  /**
   * [0752] getRightLegPosition
   * Lấy tọa độ chân phải.
   */
  public getRightLegPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightLegPosition(...args);
  }

  /**
   * [0753] getLeftLegCenter
   * Lấy tâm chân trái.
   */
  public getLeftLegCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftLegCenter(...args);
  }

  /**
   * [0754] getRightLegCenter
   * Lấy tâm chân phải.
   */
  public getRightLegCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightLegCenter(...args);
  }

  /**
   * [0755] getLeftThighPosition
   * Lấy tọa độ đùi trái.
   */
  public getLeftThighPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftThighPosition(...args);
  }

  /**
   * [0756] getRightThighPosition
   * Lấy tọa độ đùi phải.
   */
  public getRightThighPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightThighPosition(...args);
  }

  /**
   * [0757] getLeftThighCenter
   * Lấy tâm đùi trái.
   */
  public getLeftThighCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftThighCenter(...args);
  }

  /**
   * [0758] getRightThighCenter
   * Lấy tâm đùi phải.
   */
  public getRightThighCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightThighCenter(...args);
  }

  /**
   * [0759] getLeftThighStart
   * Lấy điểm đầu đùi trái.
   */
  public getLeftThighStart(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftThighStart(...args);
  }

  /**
   * [0760] getRightThighStart
   * Lấy điểm đầu đùi phải.
   */
  public getRightThighStart(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightThighStart(...args);
  }

  /**
   * [0761] getLeftThighEnd
   * Lấy điểm cuối đùi trái.
   */
  public getLeftThighEnd(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftThighEnd(...args);
  }

  /**
   * [0762] getRightThighEnd
   * Lấy điểm cuối đùi phải.
   */
  public getRightThighEnd(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightThighEnd(...args);
  }

  /**
   * [0763] calculateThighLength
   * Tính chiều dài đùi.
   */
  public calculateThighLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighLength(...args);
  }

  /**
   * [0764] calculateThighWidth
   * Tính chiều rộng đùi.
   */
  public calculateThighWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighWidth(...args);
  }

  /**
   * [0765] calculateThighThickness
   * Tính độ dày đùi.
   */
  public calculateThighThickness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighThickness(...args);
  }

  /**
   * [0766] calculateThighVolume
   * Tính thể tích đùi.
   */
  public calculateThighVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighVolume(...args);
  }

  /**
   * [0767] calculateThighSurfaceArea
   * Tính diện tích bề mặt đùi.
   */
  public calculateThighSurfaceArea(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighSurfaceArea(...args);
  }

  /**
   * [0768] calculateThighDirection
   * Tính hướng đùi.
   */
  public calculateThighDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighDirection(...args);
  }

  /**
   * [0769] calculateThighOrientation
   * Tính hướng quay đùi.
   */
  public calculateThighOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighOrientation(...args);
  }

  /**
   * [0770] calculateThighRotation
   * Tính góc quay đùi.
   */
  public calculateThighRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighRotation(...args);
  }

  /**
   * [0771] calculateThighVelocity
   * Tính vận tốc đùi.
   */
  public calculateThighVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighVelocity(...args);
  }

  /**
   * [0772] calculateThighAcceleration
   * Tính gia tốc đùi.
   */
  public calculateThighAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighAcceleration(...args);
  }

  /**
   * [0773] calculateThighBoundingBox
   * Tính hộp bao đùi.
   */
  public calculateThighBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighBoundingBox(...args);
  }

  /**
   * [0774] calculateThighBoundingSphere
   * Tính hình cầu bao đùi.
   */
  public calculateThighBoundingSphere(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighBoundingSphere(...args);
  }

  /**
   * [0775] calculateThighCenterOfMass
   * Tính tâm khối lượng đùi.
   */
  public calculateThighCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighCenterOfMass(...args);
  }

  /**
   * [0776] calculateThighToHipDistance
   * Tính khoảng cách đùi đến hông.
   */
  public calculateThighToHipDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighToHipDistance(...args);
  }

  /**
   * [0777] calculateThighToKneeDistance
   * Tính khoảng cách đùi đến đầu gối.
   */
  public calculateThighToKneeDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighToKneeDistance(...args);
  }

  /**
   * [0778] calculateThighSymmetry
   * Tính độ đối xứng đùi.
   */
  public calculateThighSymmetry(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighSymmetry(...args);
  }

  /**
   * [0779] calculateThighFlexion
   * Tính góc gập đùi.
   */
  public calculateThighFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighFlexion(...args);
  }

  /**
   * [0780] calculateThighExtension
   * Tính góc duỗi đùi.
   */
  public calculateThighExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighExtension(...args);
  }

  /**
   * [0781] calculateThighAbduction
   * Tính góc dạng đùi.
   */
  public calculateThighAbduction(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighAbduction(...args);
  }

  /**
   * [0782] calculateThighAdduction
   * Tính góc khép đùi.
   */
  public calculateThighAdduction(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighAdduction(...args);
  }

  /**
   * [0783] calculateThighInternalRotation
   * Tính góc xoay trong đùi.
   */
  public calculateThighInternalRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighInternalRotation(...args);
  }

  /**
   * [0784] calculateThighExternalRotation
   * Tính góc xoay ngoài đùi.
   */
  public calculateThighExternalRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateThighExternalRotation(...args);
  }

  /**
   * [0785] calculateLegLength
   * Tính chiều dài chân.
   */
  public calculateLegLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegLength(...args);
  }

  /**
   * [0786] calculateLegDirection
   * Tính hướng chân.
   */
  public calculateLegDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegDirection(...args);
  }

  /**
   * [0787] calculateLegOrientation
   * Tính hướng quay chân.
   */
  public calculateLegOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegOrientation(...args);
  }

  /**
   * [0788] calculateLegVelocity
   * Tính vận tốc chân.
   */
  public calculateLegVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegVelocity(...args);
  }

  /**
   * [0789] calculateLegAcceleration
   * Tính gia tốc chân.
   */
  public calculateLegAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegAcceleration(...args);
  }

  /**
   * [0790] calculateLegBoundingBox
   * Tính hộp bao chân.
   */
  public calculateLegBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegBoundingBox(...args);
  }

  /**
   * [0791] calculateLegCenterOfMass
   * Tính tâm khối lượng chân.
   */
  public calculateLegCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegCenterOfMass(...args);
  }

  /**
   * [0792] calculateLegSwingAngle
   * Tính góc vung chân.
   */
  public calculateLegSwingAngle(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegSwingAngle(...args);
  }

  /**
   * [0793] calculateLegStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateLegStrideLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegStrideLength(...args);
  }

  /**
   * [0794] calculateLegStrideFrequency
   * Tính tần số bước chân.
   */
  public calculateLegStrideFrequency(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegStrideFrequency(...args);
  }

  /**
   * [0795] calculateLegGroundClearance
   * Tính khoảng cách chân đến mặt đất.
   */
  public calculateLegGroundClearance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegGroundClearance(...args);
  }

  /**
   * [0796] calculateLegContactPoint
   * Tính điểm tiếp xúc chân.
   */
  public calculateLegContactPoint(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegContactPoint(...args);
  }

  /**
   * [0797] calculateLegContactNormal
   * Tính pháp tuyến điểm tiếp xúc chân.
   */
  public calculateLegContactNormal(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegContactNormal(...args);
  }

  /**
   * [0798] calculateLegPoseError
   * Tính sai lệch tư thế chân.
   */
  public calculateLegPoseError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegPoseError(...args);
  }

  /**
   * [0799] calculateLegMotionSmoothness
   * Tính độ mượt chuyển động chân.
   */
  public calculateLegMotionSmoothness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegMotionSmoothness(...args);
  }

  /**
   * [0800] calculateLegInverseKinematics
   * Tính động học ngược chân.
   */
  public calculateLegInverseKinematics(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegInverseKinematics(...args);
  }

  /**
   * [0801] getLeftKneePosition
   * Lấy tọa độ đầu gối trái.
   */
  public getLeftKneePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftKneePosition(...args);
  }

  /**
   * [0802] getRightKneePosition
   * Lấy tọa độ đầu gối phải.
   */
  public getRightKneePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightKneePosition(...args);
  }

  /**
   * [0803] getLeftKneeCenter
   * Lấy tâm đầu gối trái.
   */
  public getLeftKneeCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftKneeCenter(...args);
  }

  /**
   * [0804] getRightKneeCenter
   * Lấy tâm đầu gối phải.
   */
  public getRightKneeCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightKneeCenter(...args);
  }

  /**
   * [0805] getLeftKneeCapPosition
   * Lấy tọa độ xương bánh chè trái.
   */
  public getLeftKneeCapPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftKneeCapPosition(...args);
  }

  /**
   * [0806] getRightKneeCapPosition
   * Lấy tọa độ xương bánh chè phải.
   */
  public getRightKneeCapPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightKneeCapPosition(...args);
  }

  /**
   * [0807] calculateKneeWidth
   * Tính chiều rộng đầu gối.
   */
  public calculateKneeWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeWidth(...args);
  }

  /**
   * [0808] calculateKneeThickness
   * Tính độ dày đầu gối.
   */
  public calculateKneeThickness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeThickness(...args);
  }

  /**
   * [0809] calculateKneeFlexion
   * Tính góc gập đầu gối.
   */
  public calculateKneeFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeFlexion(...args);
  }

  /**
   * [0810] calculateKneeExtension
   * Tính góc duỗi đầu gối.
   */
  public calculateKneeExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeExtension(...args);
  }

  /**
   * [0812] calculateKneeJointAxis
   * Tính trục khớp gối.
   */
  public calculateKneeJointAxis(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeJointAxis(...args);
  }

  /**
   * [0813] calculateKneeJointNormal
   * Tính pháp tuyến khớp gối.
   */
  public calculateKneeJointNormal(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeJointNormal(...args);
  }

  /**
   * [0814] calculateKneeVelocity
   * Tính vận tốc đầu gối.
   */
  public calculateKneeVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeVelocity(...args);
  }

  /**
   * [0815] calculateKneeAcceleration
   * Tính gia tốc đầu gối.
   */
  public calculateKneeAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeAcceleration(...args);
  }

  /**
   * [0816] calculateKneeBoundingBox
   * Tính hộp bao đầu gối.
   */
  public calculateKneeBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeBoundingBox(...args);
  }

  /**
   * [0817] calculateKneeBoundingSphere
   * Tính hình cầu bao đầu gối.
   */
  public calculateKneeBoundingSphere(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeBoundingSphere(...args);
  }

  /**
   * [0818] calculateKneeToHipDistance
   * Tính khoảng cách đầu gối đến hông.
   */
  public calculateKneeToHipDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeToHipDistance(...args);
  }

  /**
   * [0819] calculateKneeToAnkleDistance
   * Tính khoảng cách đầu gối đến mắt cá.
   */
  public calculateKneeToAnkleDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeToAnkleDistance(...args);
  }

  /**
   * [0820] calculateKneeSymmetry
   * Tính độ đối xứng đầu gối.
   */
  public calculateKneeSymmetry(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateKneeSymmetry(...args);
  }

  /**
   * [0821] getLeftShinPosition
   * Lấy tọa độ cẳng chân trái.
   */
  public getLeftShinPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftShinPosition(...args);
  }

  /**
   * [0822] getRightShinPosition
   * Lấy tọa độ cẳng chân phải.
   */
  public getRightShinPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightShinPosition(...args);
  }

  /**
   * [0823] getLeftShinCenter
   * Lấy tâm cẳng chân trái.
   */
  public getLeftShinCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftShinCenter(...args);
  }

  /**
   * [0824] getRightShinCenter
   * Lấy tâm cẳng chân phải.
   */
  public getRightShinCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightShinCenter(...args);
  }

  /**
   * [0825] getLeftShinStart
   * Lấy điểm đầu cẳng chân trái.
   */
  public getLeftShinStart(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftShinStart(...args);
  }

  /**
   * [0826] getRightShinStart
   * Lấy điểm đầu cẳng chân phải.
   */
  public getRightShinStart(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightShinStart(...args);
  }

  /**
   * [0827] getLeftShinEnd
   * Lấy điểm cuối cẳng chân trái.
   */
  public getLeftShinEnd(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftShinEnd(...args);
  }

  /**
   * [0828] getRightShinEnd
   * Lấy điểm cuối cẳng chân phải.
   */
  public getRightShinEnd(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightShinEnd(...args);
  }

  /**
   * [0829] calculateShinLength
   * Tính chiều dài cẳng chân.
   */
  public calculateShinLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinLength(...args);
  }

  /**
   * [0830] calculateShinWidth
   * Tính chiều rộng cẳng chân.
   */
  public calculateShinWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinWidth(...args);
  }

  /**
   * [0831] calculateShinThickness
   * Tính độ dày cẳng chân.
   */
  public calculateShinThickness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinThickness(...args);
  }

  /**
   * [0832] calculateShinVolume
   * Tính thể tích cẳng chân.
   */
  public calculateShinVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinVolume(...args);
  }

  /**
   * [0833] calculateShinDirection
   * Tính hướng cẳng chân.
   */
  public calculateShinDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinDirection(...args);
  }

  /**
   * [0834] calculateShinOrientation
   * Tính hướng quay cẳng chân.
   */
  public calculateShinOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinOrientation(...args);
  }

  /**
   * [0835] calculateShinVelocity
   * Tính vận tốc cẳng chân.
   */
  public calculateShinVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinVelocity(...args);
  }

  /**
   * [0836] calculateShinAcceleration
   * Tính gia tốc cẳng chân.
   */
  public calculateShinAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinAcceleration(...args);
  }

  /**
   * [0837] calculateShinBoundingBox
   * Tính hộp bao cẳng chân.
   */
  public calculateShinBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinBoundingBox(...args);
  }

  /**
   * [0838] calculateShinCenterOfMass
   * Tính tâm khối lượng cẳng chân.
   */
  public calculateShinCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinCenterOfMass(...args);
  }

  /**
   * [0839] calculateShinToKneeDistance
   * Tính khoảng cách cẳng chân đến đầu gối.
   */
  public calculateShinToKneeDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinToKneeDistance(...args);
  }

  /**
   * [0840] calculateShinToAnkleDistance
   * Tính khoảng cách cẳng chân đến mắt cá.
   */
  public calculateShinToAnkleDistance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinToAnkleDistance(...args);
  }

  /**
   * [0841] calculateShinRotation
   * Tính góc quay cẳng chân.
   */
  public calculateShinRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinRotation(...args);
  }

  /**
   * [0842] calculateShinTwist
   * Tính góc xoắn cẳng chân.
   */
  public calculateShinTwist(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinTwist(...args);
  }

  /**
   * [0843] calculateShinSurfaceNormal
   * Tính pháp tuyến bề mặt cẳng chân.
   */
  public calculateShinSurfaceNormal(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinSurfaceNormal(...args);
  }

  /**
   * [0844] calculateShinGroundClearance
   * Tính khoảng cách cẳng chân đến mặt đất.
   */
  public calculateShinGroundClearance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinGroundClearance(...args);
  }

  /**
   * [0845] calculateShinCollision
   * Kiểm tra va chạm cẳng chân.
   */
  public calculateShinCollision(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinCollision(...args);
  }

  /**
   * [0846] calculateShinPoseError
   * Tính sai lệch tư thế cẳng chân.
   */
  public calculateShinPoseError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinPoseError(...args);
  }

  /**
   * [0847] calculateShinMotionSmoothness
   * Tính độ mượt chuyển động cẳng chân.
   */
  public calculateShinMotionSmoothness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinMotionSmoothness(...args);
  }

  /**
   * [0848] calculateShinSegmentAlignment
   * Tính độ thẳng hàng cẳng chân.
   */
  public calculateShinSegmentAlignment(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinSegmentAlignment(...args);
  }

  /**
   * [0849] calculateShinJointChain
   * Tính chuỗi khớp cẳng chân.
   */
  public calculateShinJointChain(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinJointChain(...args);
  }

  /**
   * [0850] calculateShinInverseKinematics
   * Tính động học ngược cẳng chân.
   */
  public calculateShinInverseKinematics(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateShinInverseKinematics(...args);
  }

  /**
   * [0851] getLeftAnklePosition
   * Lấy tọa độ mắt cá trái.
   */
  public getLeftAnklePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftAnklePosition(...args);
  }

  /**
   * [0852] getRightAnklePosition
   * Lấy tọa độ mắt cá phải.
   */
  public getRightAnklePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightAnklePosition(...args);
  }

  /**
   * [0853] getLeftAnkleCenter
   * Lấy tâm mắt cá trái.
   */
  public getLeftAnkleCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftAnkleCenter(...args);
  }

  /**
   * [0854] getRightAnkleCenter
   * Lấy tâm mắt cá phải.
   */
  public getRightAnkleCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightAnkleCenter(...args);
  }

  /**
   * [0855] getLeftHeelPosition
   * Lấy tọa độ gót chân trái.
   */
  public getLeftHeelPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftHeelPosition(...args);
  }

  /**
   * [0856] getRightHeelPosition
   * Lấy tọa độ gót chân phải.
   */
  public getRightHeelPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightHeelPosition(...args);
  }

  /**
   * [0857] getLeftFootPosition
   * Lấy tọa độ bàn chân trái.
   */
  public getLeftFootPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftFootPosition(...args);
  }

  /**
   * [0858] getRightFootPosition
   * Lấy tọa độ bàn chân phải.
   */
  public getRightFootPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightFootPosition(...args);
  }

  /**
   * [0859] getLeftFootCenter
   * Lấy tâm bàn chân trái.
   */
  public getLeftFootCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLeftFootCenter(...args);
  }

  /**
   * [0860] getRightFootCenter
   * Lấy tâm bàn chân phải.
   */
  public getRightFootCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getRightFootCenter(...args);
  }

  /**
   * [0861] getFootToePosition
   * Lấy tọa độ đầu bàn chân.
   */
  public getFootToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootToePosition(...args);
  }

  /**
   * [0862] getFootHeelPosition
   * Lấy tọa độ gót bàn chân.
   */
  public getFootHeelPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootHeelPosition(...args);
  }

  /**
   * [0863] getFootArchPosition
   * Lấy tọa độ vòm bàn chân.
   */
  public getFootArchPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootArchPosition(...args);
  }

  /**
   * [0864] getFootSolePosition
   * Lấy tọa độ lòng bàn chân.
   */
  public getFootSolePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootSolePosition(...args);
  }

  /**
   * [0865] getFootTopPosition
   * Lấy tọa độ mu bàn chân.
   */
  public getFootTopPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootTopPosition(...args);
  }

  /**
   * [0866] getFootInnerEdge
   * Lấy tọa độ mép trong bàn chân.
   */
  public getFootInnerEdge(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootInnerEdge(...args);
  }

  /**
   * [0867] getFootOuterEdge
   * Lấy tọa độ mép ngoài bàn chân.
   */
  public getFootOuterEdge(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFootOuterEdge(...args);
  }

  /**
   * [0868] calculateAnkleWidth
   * Tính chiều rộng mắt cá.
   */
  public calculateAnkleWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleWidth(...args);
  }

  /**
   * [0869] calculateAnkleFlexion
   * Tính góc gập mắt cá.
   */
  public calculateAnkleFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleFlexion(...args);
  }

  /**
   * [0870] calculateAnkleExtension
   * Tính góc duỗi mắt cá.
   */
  public calculateAnkleExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleExtension(...args);
  }

  /**
   * [0871] calculateAnkleInversion
   * Tính góc nghiêng lòng bàn chân vào trong.
   */
  public calculateAnkleInversion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleInversion(...args);
  }

  /**
   * [0872] calculateAnkleEversion
   * Tính góc nghiêng lòng bàn chân ra ngoài.
   */
  public calculateAnkleEversion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleEversion(...args);
  }

  /**
   * [0873] calculateAnkleRotation
   * Tính góc quay mắt cá.
   */
  public calculateAnkleRotation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleRotation(...args);
  }

  /**
   * [0874] calculateAnkleVelocity
   * Tính vận tốc mắt cá.
   */
  public calculateAnkleVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleVelocity(...args);
  }

  /**
   * [0875] calculateAnkleAcceleration
   * Tính gia tốc mắt cá.
   */
  public calculateAnkleAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateAnkleAcceleration(...args);
  }

  /**
   * [0876] calculateFootLength
   * Tính chiều dài bàn chân.
   */
  public calculateFootLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootLength(...args);
  }

  /**
   * [0877] calculateFootWidth
   * Tính chiều rộng bàn chân.
   */
  public calculateFootWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootWidth(...args);
  }

  /**
   * [0878] calculateFootHeight
   * Tính chiều cao bàn chân.
   */
  public calculateFootHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootHeight(...args);
  }

  /**
   * [0879] calculateFootThickness
   * Tính độ dày bàn chân.
   */
  public calculateFootThickness(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootThickness(...args);
  }

  /**
   * [0880] calculateFootVolume
   * Tính thể tích bàn chân.
   */
  public calculateFootVolume(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootVolume(...args);
  }

  /**
   * [0881] calculateFootSurfaceArea
   * Tính diện tích bề mặt bàn chân.
   */
  public calculateFootSurfaceArea(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootSurfaceArea(...args);
  }

  /**
   * [0882] calculateFootOrientation
   * Tính hướng bàn chân.
   */
  public calculateFootOrientation(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootOrientation(...args);
  }

  /**
   * [0883] calculateFootDirection
   * Tính hướng di chuyển của bàn chân.
   */
  public calculateFootDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootDirection(...args);
  }

  /**
   * [0885] calculateFootPitch
   * Tính góc chúi/ngẩng bàn chân.
   */
  public calculateFootPitch(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootPitch(...args);
  }

  /**
   * [0886] calculateFootRoll
   * Tính góc lăn bàn chân.
   */
  public calculateFootRoll(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootRoll(...args);
  }

  /**
   * [0887] calculateFootYaw
   * Tính góc quay ngang bàn chân.
   */
  public calculateFootYaw(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootYaw(...args);
  }

  /**
   * [0888] calculateFootVelocity
   * Tính vận tốc bàn chân.
   */
  public calculateFootVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootVelocity(...args);
  }

  /**
   * [0889] calculateFootAcceleration
   * Tính gia tốc bàn chân.
   */
  public calculateFootAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootAcceleration(...args);
  }

  /**
   * [0890] calculateFootAngularVelocity
   * Tính vận tốc góc bàn chân.
   */
  public calculateFootAngularVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootAngularVelocity(...args);
  }

  /**
   * [0891] calculateFootBoundingBox
   * Tính hộp bao bàn chân.
   */
  public calculateFootBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootBoundingBox(...args);
  }

  /**
   * [0892] calculateFootBoundingSphere
   * Tính hình cầu bao bàn chân.
   */
  public calculateFootBoundingSphere(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootBoundingSphere(...args);
  }

  /**
   * [0893] calculateFootCenterOfMass
   * Tính tâm khối lượng bàn chân.
   */
  public calculateFootCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootCenterOfMass(...args);
  }

  /**
   * [0894] calculateFootGroundContact
   * Kiểm tra bàn chân tiếp xúc mặt đất.
   */
  public calculateFootGroundContact(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootGroundContact(...args);
  }

  /**
   * [0895] calculateFootGroundClearance
   * Tính khoảng cách bàn chân đến mặt đất.
   */
  public calculateFootGroundClearance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootGroundClearance(...args);
  }

  /**
   * [0896] calculateFootPressureCenter
   * Tính tâm áp lực bàn chân.
   */
  public calculateFootPressureCenter(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootPressureCenter(...args);
  }

  /**
   * [0897] calculateFootContactArea
   * Tính diện tích tiếp xúc bàn chân.
   */
  public calculateFootContactArea(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootContactArea(...args);
  }

  /**
   * [0898] calculateFootSlipVelocity
   * Tính vận tốc trượt bàn chân.
   */
  public calculateFootSlipVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootSlipVelocity(...args);
  }

  /**
   * [0899] calculateFootStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateFootStrideLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootStrideLength(...args);
  }

  /**
   * [0900] calculateFootInverseKinematics
   * Tính động học ngược bàn chân.
   */
  public calculateFootInverseKinematics(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootInverseKinematics(...args);
  }

  /**
   * [0901] getBigToePosition
   * Lấy tọa độ ngón chân cái.
   */
  public getBigToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getBigToePosition(...args);
  }

  /**
   * [0902] getSecondToePosition
   * Lấy tọa độ ngón chân thứ hai.
   */
  public getSecondToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getSecondToePosition(...args);
  }

  /**
   * [0903] getThirdToePosition
   * Lấy tọa độ ngón chân thứ ba.
   */
  public getThirdToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getThirdToePosition(...args);
  }

  /**
   * [0904] getFourthToePosition
   * Lấy tọa độ ngón chân thứ tư.
   */
  public getFourthToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getFourthToePosition(...args);
  }

  /**
   * [0905] getLittleToePosition
   * Lấy tọa độ ngón chân út.
   */
  public getLittleToePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getLittleToePosition(...args);
  }

  /**
   * [0906] getToeTipPosition
   * Lấy tọa độ đầu ngón chân.
   */
  public getToeTipPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getToeTipPosition(...args);
  }

  /**
   * [0907] getToeBasePosition
   * Lấy tọa độ gốc ngón chân.
   */
  public getToeBasePosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getToeBasePosition(...args);
  }

  /**
   * [0908] getToeJointPosition
   * Lấy tọa độ khớp ngón chân.
   */
  public getToeJointPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getToeJointPosition(...args);
  }

  /**
   * [0909] getToeNailPosition
   * Lấy tọa độ móng ngón chân.
   */
  public getToeNailPosition(...args: any[]): any {
    return (this.anatomicalLowerBody as any).getToeNailPosition(...args);
  }

  /**
   * [0910] calculateToeLength
   * Tính chiều dài ngón chân.
   */
  public calculateToeLength(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeLength(...args);
  }

  /**
   * [0911] calculateToeWidth
   * Tính chiều rộng ngón chân.
   */
  public calculateToeWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeWidth(...args);
  }

  /**
   * [0912] calculateToeFlexion
   * Tính góc gập ngón chân.
   */
  public calculateToeFlexion(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeFlexion(...args);
  }

  /**
   * [0913] calculateToeExtension
   * Tính góc duỗi ngón chân.
   */
  public calculateToeExtension(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeExtension(...args);
  }

  /**
   * [0914] calculateToeSpread
   * Tính độ xòe ngón chân.
   */
  public calculateToeSpread(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeSpread(...args);
  }

  /**
   * [0915] calculateToeCurl
   * Tính độ cuộn ngón chân.
   */
  public calculateToeCurl(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeCurl(...args);
  }

  /**
   * [0916] calculateToeDirection
   * Tính hướng ngón chân.
   */
  public calculateToeDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeDirection(...args);
  }

  /**
   * [0917] calculateToeVelocity
   * Tính vận tốc ngón chân.
   */
  public calculateToeVelocity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeVelocity(...args);
  }

  /**
   * [0918] calculateToeAcceleration
   * Tính gia tốc ngón chân.
   */
  public calculateToeAcceleration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeAcceleration(...args);
  }

  /**
   * [0919] calculateToeJointAngles
   * Tính các góc khớp ngón chân.
   */
  public calculateToeJointAngles(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeJointAngles(...args);
  }

  /**
   * [0920] calculateToeBoundingBox
   * Tính hộp bao ngón chân.
   */
  public calculateToeBoundingBox(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateToeBoundingBox(...args);
  }

  /**
   * [0921] calculateStandingHeight
   * Tính chiều cao khi đứng.
   */
  public calculateStandingHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateStandingHeight(...args);
  }

  /**
   * [0922] calculateBodyBalance
   * Tính độ cân bằng cơ thể.
   */
  public calculateBodyBalance(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateBodyBalance(...args);
  }

  /**
   * [0923] calculateCenterOfGravity
   * Tính trọng tâm cơ thể.
   */
  public calculateCenterOfGravity(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateCenterOfGravity(...args);
  }

  /**
   * [0924] calculateCenterOfMass
   * Tính tâm khối lượng cơ thể.
   */
  public calculateCenterOfMass(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateCenterOfMass(...args);
  }

  /**
   * [0925] calculateBaseOfSupport
   * Tính vùng chân đế hỗ trợ cơ thể.
   */
  public calculateBaseOfSupport(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateBaseOfSupport(...args);
  }

  /**
   * [0926] calculateBalanceMargin
   * Tính biên an toàn cân bằng.
   */
  public calculateBalanceMargin(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateBalanceMargin(...args);
  }

  /**
   * [0927] calculateBodySway
   * Tính độ lắc cơ thể.
   */
  public calculateBodySway(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateBodySway(...args);
  }

  /**
   * [0928] calculateBodyLean
   * Tính độ nghiêng cơ thể.
   */
  public calculateBodyLean(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateBodyLean(...args);
  }

  /**
   * [0929] calculatePostureStability
   * Tính độ ổn định tư thế.
   */
  public calculatePostureStability(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculatePostureStability(...args);
  }

  /**
   * [0930] calculateStandingPoseError
   * Tính sai lệch tư thế đứng.
   */
  public calculateStandingPoseError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateStandingPoseError(...args);
  }

  /**
   * [0931] calculateSittingHeight
   * Tính chiều cao khi ngồi.
   */
  public calculateSittingHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateSittingHeight(...args);
  }

  /**
   * [0932] calculateSittingPose
   * Tính tư thế ngồi.
   */
  public calculateSittingPose(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateSittingPose(...args);
  }

  /**
   * [0933] calculateSquatDepth
   * Tính độ sâu động tác ngồi xổm.
   */
  public calculateSquatDepth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateSquatDepth(...args);
  }

  /**
   * [0934] calculateJumpHeight
   * Tính độ cao nhảy.
   */
  public calculateJumpHeight(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateJumpHeight(...args);
  }

  /**
   * [0935] calculateLandingImpact
   * Ước lượng lực va chạm khi tiếp đất.
   */
  public calculateLandingImpact(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLandingImpact(...args);
  }

  /**
   * [0936] calculateGroundReactionForce
   * Ước lượng phản lực mặt đất.
   */
  public calculateGroundReactionForce(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateGroundReactionForce(...args);
  }

  /**
   * [0937] calculateGaitCycle
   * Tính chu kỳ dáng đi.
   */
  public calculateGaitCycle(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateGaitCycle(...args);
  }

  /**
   * [0938] calculateGaitPhase
   * Xác định pha của chu kỳ dáng đi.
   */
  public calculateGaitPhase(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateGaitPhase(...args);
  }

  /**
   * [0939] calculateStepFrequency
   * Tính tần số bước chân.
   */
  public calculateStepFrequency(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateStepFrequency(...args);
  }

  /**
   * [0940] calculateWalkingSpeed
   * Tính tốc độ đi bộ.
   */
  public calculateWalkingSpeed(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateWalkingSpeed(...args);
  }

  /**
   * [0941] calculateRunningSpeed
   * Tính tốc độ chạy.
   */
  public calculateRunningSpeed(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateRunningSpeed(...args);
  }

  /**
   * [0942] calculateStrideWidth
   * Tính chiều rộng bước chân.
   */
  public calculateStrideWidth(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateStrideWidth(...args);
  }

  /**
   * [0943] calculateStrideSymmetry
   * Tính độ đối xứng bước chân.
   */
  public calculateStrideSymmetry(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateStrideSymmetry(...args);
  }

  /**
   * [0944] calculateFootPlacement
   * Tính vị trí đặt chân.
   */
  public calculateFootPlacement(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootPlacement(...args);
  }

  /**
   * [0945] calculateFootPlacementError
   * Tính sai lệch vị trí đặt chân.
   */
  public calculateFootPlacementError(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateFootPlacementError(...args);
  }

  /**
   * [0946] calculateGroundPenetration
   * Tính độ xuyên chân xuống mặt đất.
   */
  public calculateGroundPenetration(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateGroundPenetration(...args);
  }

  /**
   * [0947] calculateGroundAlignment
   * Tính độ căn chỉnh chân với mặt đất.
   */
  public calculateGroundAlignment(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateGroundAlignment(...args);
  }

  /**
   * [0948] calculateLegSupportPhase
   * Xác định pha chân trụ.
   */
  public calculateLegSupportPhase(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLegSupportPhase(...args);
  }

  /**
   * [0949] calculateSwingPhase
   * Xác định pha chân vung.
   */
  public calculateSwingPhase(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateSwingPhase(...args);
  }

  /**
   * [0950] calculateLocomotionDirection
   * Tính hướng di chuyển cơ thể.
   */
  public calculateLocomotionDirection(...args: any[]): any {
    return (this.anatomicalLowerBody as any).calculateLocomotionDirection(...args);
  }

  /**
   * [0951] getBonePosition
   * Lấy tọa độ xương.
   */
  public getBonePosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBonePosition(...args);
  }

  /**
   * [0952] getBoneStartPosition
   * Lấy điểm đầu xương.
   */
  public getBoneStartPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneStartPosition(...args);
  }

  /**
   * [0953] getBoneEndPosition
   * Lấy điểm cuối xương.
   */
  public getBoneEndPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneEndPosition(...args);
  }

  /**
   * [0954] getBoneCenter
   * Lấy tâm xương.
   */
  public getBoneCenter(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneCenter(...args);
  }

  /**
   * [0955] getBoneDirection
   * Lấy hướng xương.
   */
  public getBoneDirection(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneDirection(...args);
  }

  /**
   * [0956] getBoneOrientation
   * Lấy hướng quay xương.
   */
  public getBoneOrientation(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneOrientation(...args);
  }

  /**
   * [0957] getBoneLength
   * Lấy chiều dài xương.
   */
  public getBoneLength(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneLength(...args);
  }

  /**
   * [0958] getBoneScale
   * Lấy tỷ lệ kích thước xương.
   */
  public getBoneScale(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneScale(...args);
  }

  /**
   * [0959] getBoneParent
   * Lấy xương cha.
   */
  public getBoneParent(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneParent(...args);
  }

  /**
   * [0960] getBoneChildren
   * Lấy danh sách xương con.
   */
  public getBoneChildren(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getBoneChildren(...args);
  }

  /**
   * [0961] calculateBoneDistance
   * Tính khoảng cách giữa các xương.
   */
  public calculateBoneDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneDistance(...args);
  }

  /**
   * [0962] calculateBoneAngle
   * Tính góc giữa các xương.
   */
  public calculateBoneAngle(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneAngle(...args);
  }

  /**
   * [0963] calculateBoneAlignment
   * Tính độ thẳng hàng xương.
   */
  public calculateBoneAlignment(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneAlignment(...args);
  }

  /**
   * [0964] calculateBoneChainLength
   * Tính chiều dài chuỗi xương.
   */
  public calculateBoneChainLength(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneChainLength(...args);
  }

  /**
   * [0965] calculateBoneHierarchyDepth
   * Tính độ sâu phân cấp xương.
   */
  public calculateBoneHierarchyDepth(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneHierarchyDepth(...args);
  }

  /**
   * [0966] calculateBoneWorldTransform
   * Tính phép biến đổi xương trong thế giới.
   */
  public calculateBoneWorldTransform(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneWorldTransform(...args);
  }

  /**
   * [0967] calculateBoneLocalTransform
   * Tính phép biến đổi xương cục bộ.
   */
  public calculateBoneLocalTransform(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneLocalTransform(...args);
  }

  /**
   * [0968] calculateBoneInverseTransform
   * Tính phép biến đổi nghịch đảo xương.
   */
  public calculateBoneInverseTransform(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneInverseTransform(...args);
  }

  /**
   * [0969] calculateBoneBindPose
   * Tính tư thế gốc của xương.
   */
  public calculateBoneBindPose(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneBindPose(...args);
  }

  /**
   * [0970] calculateBonePoseDelta
   * Tính độ thay đổi tư thế xương.
   */
  public calculateBonePoseDelta(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBonePoseDelta(...args);
  }

  /**
   * [0971] calculateBoneVelocity
   * Tính vận tốc xương.
   */
  public calculateBoneVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneVelocity(...args);
  }

  /**
   * [0972] calculateBoneAcceleration
   * Tính gia tốc xương.
   */
  public calculateBoneAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneAcceleration(...args);
  }

  /**
   * [0973] calculateBoneAngularVelocity
   * Tính vận tốc góc xương.
   */
  public calculateBoneAngularVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneAngularVelocity(...args);
  }

  /**
   * [0974] calculateBoneAngularAcceleration
   * Tính gia tốc góc xương.
   */
  public calculateBoneAngularAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneAngularAcceleration(...args);
  }

  /**
   * [0975] calculateBoneBoundingBox
   * Tính hộp bao xương.
   */
  public calculateBoneBoundingBox(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneBoundingBox(...args);
  }

  /**
   * [0976] calculateBoneBoundingSphere
   * Tính hình cầu bao xương.
   */
  public calculateBoneBoundingSphere(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneBoundingSphere(...args);
  }

  /**
   * [0977] calculateBoneCapsule
   * Tính capsule đại diện xương.
   */
  public calculateBoneCapsule(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneCapsule(...args);
  }

  /**
   * [0978] calculateBoneCollision
   * Kiểm tra va chạm xương.
   */
  public calculateBoneCollision(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneCollision(...args);
  }

  /**
   * [0979] calculateBoneIntersection
   * Tính giao điểm giữa các xương.
   */
  public calculateBoneIntersection(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneIntersection(...args);
  }

  /**
   * [0980] calculateBoneClosestPoint
   * Tìm điểm gần nhất trên xương.
   */
  public calculateBoneClosestPoint(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneClosestPoint(...args);
  }

  /**
   * [0981] getJointPosition
   * Lấy tọa độ khớp.
   */
  public getJointPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointPosition(...args);
  }

  /**
   * [0982] getJointCenter
   * Lấy tâm khớp.
   */
  public getJointCenter(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointCenter(...args);
  }

  /**
   * [0983] getJointAxis
   * Lấy trục khớp.
   */
  public getJointAxis(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointAxis(...args);
  }

  /**
   * [0984] getJointNormal
   * Lấy pháp tuyến khớp.
   */
  public getJointNormal(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointNormal(...args);
  }

  /**
   * [0985] getJointParentBone
   * Lấy xương cha của khớp.
   */
  public getJointParentBone(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointParentBone(...args);
  }

  /**
   * [0986] getJointChildBone
   * Lấy xương con của khớp.
   */
  public getJointChildBone(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getJointChildBone(...args);
  }

  /**
   * [0987] calculateJointAngle
   * Tính góc khớp.
   */
  public calculateJointAngle(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointAngle(...args);
  }

  /**
   * [0988] calculateJointLimit
   * Tính hoặc áp dụng giới hạn khớp.
   */
  public calculateJointLimit(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointLimit(...args);
  }

  /**
   * [0989] calculateJointConstraint
   * Tính ràng buộc khớp.
   */
  public calculateJointConstraint(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointConstraint(...args);
  }

  /**
   * [0990] calculateJointVelocity
   * Tính vận tốc khớp.
   */
  public calculateJointVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointVelocity(...args);
  }

  /**
   * [0991] calculateJointAcceleration
   * Tính gia tốc khớp.
   */
  public calculateJointAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointAcceleration(...args);
  }

  /**
   * [0992] calculateJointTorque
   * Tính mô-men xoắn khớp.
   */
  public calculateJointTorque(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointTorque(...args);
  }

  /**
   * [0993] calculateJointForce
   * Tính lực tại khớp.
   */
  public calculateJointForce(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointForce(...args);
  }

  /**
   * [0994] calculateJointStiffness
   * Tính độ cứng khớp.
   */
  public calculateJointStiffness(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointStiffness(...args);
  }

  /**
   * [0995] calculateJointDamping
   * Tính hệ số giảm chấn khớp.
   */
  public calculateJointDamping(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointDamping(...args);
  }

  /**
   * [0996] calculateJointFriction
   * Tính ma sát khớp.
   */
  public calculateJointFriction(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointFriction(...args);
  }

  /**
   * [0997] calculateJointCollision
   * Kiểm tra va chạm khớp.
   */
  public calculateJointCollision(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointCollision(...args);
  }

  /**
   * [0998] calculateJointChain
   * Tính chuỗi liên kết khớp.
   */
  public calculateJointChain(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointChain(...args);
  }

  /**
   * [0999] calculateJointPoseError
   * Tính sai lệch tư thế khớp.
   */
  public calculateJointPoseError(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointPoseError(...args);
  }

  /**
   * [1000] calculateJointInverseKinematics
   * Tính động học ngược chuỗi khớp.
   */
  public calculateJointInverseKinematics(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateJointInverseKinematics(...args);
  }

  /**
   * [1001] calculateForwardKinematics
   * Tính động học thuận.
   */
  public calculateForwardKinematics(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateForwardKinematics(...args);
  }

  /**
   * [1002] calculateInverseKinematics
   * Tính động học ngược.
   */
  public calculateInverseKinematics(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateInverseKinematics(...args);
  }

  /**
   * [1003] solveTwoBoneIK
   * Giải động học ngược chuỗi hai xương.
   */
  public solveTwoBoneIK(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).solveTwoBoneIK(...args);
  }

  /**
   * [1004] solveThreeBoneIK
   * Giải động học ngược chuỗi ba xương.
   */
  public solveThreeBoneIK(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).solveThreeBoneIK(...args);
  }

  /**
   * [1005] solveFullBodyIK
   * Giải động học ngược toàn thân.
   */
  public solveFullBodyIK(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).solveFullBodyIK(...args);
  }

  /**
   * [1006] calculateIKTargetError
   * Tính sai lệch mục tiêu IK.
   */
  public calculateIKTargetError(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateIKTargetError(...args);
  }

  /**
   * [1007] calculateIKJointWeights
   * Tính trọng số ảnh hưởng các khớp.
   */
  public calculateIKJointWeights(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateIKJointWeights(...args);
  }

  /**
   * [1008] calculateIKReachability
   * Kiểm tra mục tiêu có thể với tới.
   */
  public calculateIKReachability(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateIKReachability(...args);
  }

  /**
   * [1009] calculateIKPoleVector
   * Tính vector định hướng khuỷu hoặc gối.
   */
  public calculateIKPoleVector(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateIKPoleVector(...args);
  }

  /**
   * [1010] calculateIKChainStretch
   * Tính mức kéo giãn chuỗi IK.
   */
  public calculateIKChainStretch(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateIKChainStretch(...args);
  }

  /**
   * [1011] calculateSkeletonRootPosition
   * Tính vị trí gốc bộ xương.
   */
  public calculateSkeletonRootPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonRootPosition(...args);
  }

  /**
   * [1012] calculateSkeletonOrientation
   * Tính hướng bộ xương.
   */
  public calculateSkeletonOrientation(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonOrientation(...args);
  }

  /**
   * [1013] calculateSkeletonBounds
   * Tính giới hạn bộ xương.
   */
  public calculateSkeletonBounds(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonBounds(...args);
  }

  /**
   * [1014] calculateSkeletonCenterOfMass
   * Tính tâm khối lượng bộ xương.
   */
  public calculateSkeletonCenterOfMass(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonCenterOfMass(...args);
  }

  /**
   * [1015] calculateSkeletonPose
   * Tính tư thế bộ xương.
   */
  public calculateSkeletonPose(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonPose(...args);
  }

  /**
   * [1016] calculateSkeletonPoseDifference
   * Tính chênh lệch tư thế bộ xương.
   */
  public calculateSkeletonPoseDifference(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonPoseDifference(...args);
  }

  /**
   * [1017] calculateSkeletonPoseSimilarity
   * Tính độ tương đồng tư thế bộ xương.
   */
  public calculateSkeletonPoseSimilarity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonPoseSimilarity(...args);
  }

  /**
   * [1018] calculateSkeletonRetargeting
   * Tính ánh xạ hoạt ảnh giữa các bộ xương.
   */
  public calculateSkeletonRetargeting(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateSkeletonRetargeting(...args);
  }

  /**
   * [1019] calculateBoneRetargeting
   * Tính ánh xạ hoạt ảnh giữa các xương.
   */
  public calculateBoneRetargeting(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateBoneRetargeting(...args);
  }

  /**
   * [1020] calculateAnimationBlendWeight
   * Tính trọng số pha trộn hoạt ảnh.
   */
  public calculateAnimationBlendWeight(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationBlendWeight(...args);
  }

  /**
   * [1021] calculateAnimationBlendFactor
   * Tính hệ số pha trộn hoạt ảnh.
   */
  public calculateAnimationBlendFactor(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationBlendFactor(...args);
  }

  /**
   * [1022] calculateAnimationTime
   * Tính thời gian hoạt ảnh.
   */
  public calculateAnimationTime(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationTime(...args);
  }

  /**
   * [1023] calculateAnimationPhase
   * Tính pha hoạt ảnh.
   */
  public calculateAnimationPhase(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationPhase(...args);
  }

  /**
   * [1024] calculateAnimationPlaybackSpeed
   * Tính tốc độ phát hoạt ảnh.
   */
  public calculateAnimationPlaybackSpeed(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationPlaybackSpeed(...args);
  }

  /**
   * [1025] calculateAnimationRootMotion
   * Tính chuyển động gốc hoạt ảnh.
   */
  public calculateAnimationRootMotion(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationRootMotion(...args);
  }

  /**
   * [1026] calculateAnimationRootVelocity
   * Tính vận tốc chuyển động gốc.
   */
  public calculateAnimationRootVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationRootVelocity(...args);
  }

  /**
   * [1027] calculateAnimationRootAcceleration
   * Tính gia tốc chuyển động gốc.
   */
  public calculateAnimationRootAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationRootAcceleration(...args);
  }

  /**
   * [1028] calculateAnimationPoseAtTime
   * Tính tư thế tại thời điểm xác định.
   */
  public calculateAnimationPoseAtTime(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationPoseAtTime(...args);
  }

  /**
   * [1029] calculateAnimationInterpolation
   * Tính nội suy hoạt ảnh.
   */
  public calculateAnimationInterpolation(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationInterpolation(...args);
  }

  /**
   * [1030] calculateAnimationCurveValue
   * Tính giá trị đường cong hoạt ảnh.
   */
  public calculateAnimationCurveValue(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationCurveValue(...args);
  }

  /**
   * [1031] calculateAnimationCurveDerivative
   * Tính đạo hàm đường cong hoạt ảnh.
   */
  public calculateAnimationCurveDerivative(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationCurveDerivative(...args);
  }

  /**
   * [1032] calculateAnimationCurveIntegral
   * Tính tích phân đường cong hoạt ảnh.
   */
  public calculateAnimationCurveIntegral(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationCurveIntegral(...args);
  }

  /**
   * [1033] calculateAnimationVelocity
   * Tính vận tốc hoạt ảnh.
   */
  public calculateAnimationVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationVelocity(...args);
  }

  /**
   * [1034] calculateAnimationAcceleration
   * Tính gia tốc hoạt ảnh.
   */
  public calculateAnimationAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAnimationAcceleration(...args);
  }

  /**
   * [1035] calculatePoseTransition
   * Tính chuyển tiếp giữa các tư thế.
   */
  public calculatePoseTransition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseTransition(...args);
  }

  /**
   * [1036] calculatePoseTransitionDuration
   * Tính thời lượng chuyển tư thế.
   */
  public calculatePoseTransitionDuration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseTransitionDuration(...args);
  }

  /**
   * [1037] calculatePoseBlend
   * Tính pha trộn tư thế.
   */
  public calculatePoseBlend(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseBlend(...args);
  }

  /**
   * [1038] calculatePoseStability
   * Tính độ ổn định tư thế.
   */
  public calculatePoseStability(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseStability(...args);
  }

  /**
   * [1039] calculatePoseReachability
   * Tính khả năng đạt tư thế.
   */
  public calculatePoseReachability(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseReachability(...args);
  }

  /**
   * [1040] calculatePoseConstraintError
   * Tính sai lệch ràng buộc tư thế.
   */
  public calculatePoseConstraintError(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculatePoseConstraintError(...args);
  }

  /**
   * [1041] calculateFootLockPosition
   * Tính vị trí khóa chân.
   */
  public calculateFootLockPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateFootLockPosition(...args);
  }

  /**
   * [1042] calculateFootLockWeight
   * Tính trọng số khóa chân.
   */
  public calculateFootLockWeight(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateFootLockWeight(...args);
  }

  /**
   * [1043] calculateHandIKTarget
   * Tính mục tiêu IK bàn tay.
   */
  public calculateHandIKTarget(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateHandIKTarget(...args);
  }

  /**
   * [1044] calculateLookAtTarget
   * Tính mục tiêu nhìn.
   */
  public calculateLookAtTarget(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateLookAtTarget(...args);
  }

  /**
   * [1045] calculateHeadLookAt
   * Tính hướng đầu nhìn mục tiêu.
   */
  public calculateHeadLookAt(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateHeadLookAt(...args);
  }

  /**
   * [1046] calculateEyeLookAt
   * Tính hướng mắt nhìn mục tiêu.
   */
  public calculateEyeLookAt(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateEyeLookAt(...args);
  }

  /**
   * [1047] calculateAimOffset
   * Tính độ lệch hướng ngắm.
   */
  public calculateAimOffset(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAimOffset(...args);
  }

  /**
   * [1048] calculateAimPose
   * Tính tư thế ngắm.
   */
  public calculateAimPose(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateAimPose(...args);
  }

  /**
   * [1049] calculateReachPose
   * Tính tư thế với tới.
   */
  public calculateReachPose(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateReachPose(...args);
  }

  /**
   * [1050] calculateCharacterPoseError
   * Tính sai lệch tư thế nhân vật.
   */
  public calculateCharacterPoseError(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPoseError(...args);
  }

  /**
   * [1051] getCharacterPosition
   * Lấy tọa độ nhân vật.
   */
  public getCharacterPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterPosition(...args);
  }

  /**
   * [1052] getCharacterRotation
   * Lấy góc quay nhân vật.
   */
  public getCharacterRotation(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterRotation(...args);
  }

  /**
   * [1053] getCharacterScale
   * Lấy tỷ lệ kích thước nhân vật.
   */
  public getCharacterScale(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterScale(...args);
  }

  /**
   * [1054] getCharacterVelocity
   * Lấy vận tốc nhân vật.
   */
  public getCharacterVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterVelocity(...args);
  }

  /**
   * [1055] getCharacterAcceleration
   * Lấy gia tốc nhân vật.
   */
  public getCharacterAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterAcceleration(...args);
  }

  /**
   * [1056] getCharacterForwardVector
   * Lấy hướng phía trước nhân vật.
   */
  public getCharacterForwardVector(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterForwardVector(...args);
  }

  /**
   * [1057] getCharacterRightVector
   * Lấy hướng bên phải nhân vật.
   */
  public getCharacterRightVector(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterRightVector(...args);
  }

  /**
   * [1058] getCharacterUpVector
   * Lấy hướng phía trên nhân vật.
   */
  public getCharacterUpVector(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).getCharacterUpVector(...args);
  }

  /**
   * [1059] calculateCharacterHeight
   * Tính chiều cao nhân vật.
   */
  public calculateCharacterHeight(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterHeight(...args);
  }

  /**
   * [1060] calculateCharacterWidth
   * Tính chiều rộng nhân vật.
   */
  public calculateCharacterWidth(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterWidth(...args);
  }

  /**
   * [1061] calculateCharacterDepth
   * Tính chiều sâu nhân vật.
   */
  public calculateCharacterDepth(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterDepth(...args);
  }

  /**
   * [1062] calculateCharacterRadius
   * Tính bán kính đại diện nhân vật.
   */
  public calculateCharacterRadius(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterRadius(...args);
  }

  /**
   * [1063] calculateCharacterBounds
   * Tính giới hạn không gian nhân vật.
   */
  public calculateCharacterBounds(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterBounds(...args);
  }

  /**
   * [1064] calculateCharacterBoundingBox
   * Tính hộp bao nhân vật.
   */
  public calculateCharacterBoundingBox(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterBoundingBox(...args);
  }

  /**
   * [1065] calculateCharacterBoundingSphere
   * Tính hình cầu bao nhân vật.
   */
  public calculateCharacterBoundingSphere(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterBoundingSphere(...args);
  }

  /**
   * [1066] calculateCharacterBoundingCapsule
   * Tính capsule bao nhân vật.
   */
  public calculateCharacterBoundingCapsule(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterBoundingCapsule(...args);
  }

  /**
   * [1067] calculateCharacterCenterOfMass
   * Tính tâm khối lượng nhân vật.
   */
  public calculateCharacterCenterOfMass(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterCenterOfMass(...args);
  }

  /**
   * [1068] calculateCharacterGroundDistance
   * Tính khoảng cách nhân vật đến mặt đất.
   */
  public calculateCharacterGroundDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterGroundDistance(...args);
  }

  /**
   * [1069] calculateCharacterGroundContact
   * Kiểm tra nhân vật chạm mặt đất.
   */
  public calculateCharacterGroundContact(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterGroundContact(...args);
  }

  /**
   * [1070] calculateCharacterGroundNormal
   * Tính pháp tuyến mặt đất tại nhân vật.
   */
  public calculateCharacterGroundNormal(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterGroundNormal(...args);
  }

  /**
   * [1071] calculateCharacterSlopeAngle
   * Tính góc dốc dưới nhân vật.
   */
  public calculateCharacterSlopeAngle(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterSlopeAngle(...args);
  }

  /**
   * [1072] calculateCharacterMovementDirection
   * Tính hướng di chuyển nhân vật.
   */
  public calculateCharacterMovementDirection(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterMovementDirection(...args);
  }

  /**
   * [1073] calculateCharacterMovementSpeed
   * Tính tốc độ di chuyển nhân vật.
   */
  public calculateCharacterMovementSpeed(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterMovementSpeed(...args);
  }

  /**
   * [1074] calculateCharacterMovementDistance
   * Tính quãng đường di chuyển nhân vật.
   */
  public calculateCharacterMovementDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterMovementDistance(...args);
  }

  /**
   * [1075] calculateCharacterTurningRate
   * Tính tốc độ đổi hướng nhân vật.
   */
  public calculateCharacterTurningRate(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterTurningRate(...args);
  }

  /**
   * [1076] calculateCharacterTurningAngle
   * Tính góc đổi hướng nhân vật.
   */
  public calculateCharacterTurningAngle(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterTurningAngle(...args);
  }

  /**
   * [1077] calculateCharacterStoppingDistance
   * Tính quãng đường dừng nhân vật.
   */
  public calculateCharacterStoppingDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterStoppingDistance(...args);
  }

  /**
   * [1078] calculateCharacterBrakingAcceleration
   * Tính gia tốc hãm nhân vật.
   */
  public calculateCharacterBrakingAcceleration(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterBrakingAcceleration(...args);
  }

  /**
   * [1079] calculateCharacterJumpVelocity
   * Tính vận tốc nhảy nhân vật.
   */
  public calculateCharacterJumpVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterJumpVelocity(...args);
  }

  /**
   * [1080] calculateCharacterJumpHeight
   * Tính độ cao nhảy nhân vật.
   */
  public calculateCharacterJumpHeight(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterJumpHeight(...args);
  }

  /**
   * [1081] calculateCharacterFallVelocity
   * Tính vận tốc rơi nhân vật.
   */
  public calculateCharacterFallVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterFallVelocity(...args);
  }

  /**
   * [1082] calculateCharacterFallDistance
   * Tính quãng đường rơi nhân vật.
   */
  public calculateCharacterFallDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterFallDistance(...args);
  }

  /**
   * [1083] calculateCharacterLandingPosition
   * Tính vị trí tiếp đất nhân vật.
   */
  public calculateCharacterLandingPosition(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterLandingPosition(...args);
  }

  /**
   * [1084] calculateCharacterLandingVelocity
   * Tính vận tốc khi tiếp đất.
   */
  public calculateCharacterLandingVelocity(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterLandingVelocity(...args);
  }

  /**
   * [1085] calculateCharacterCollision
   * Kiểm tra va chạm nhân vật.
   */
  public calculateCharacterCollision(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterCollision(...args);
  }

  /**
   * [1086] calculateCharacterCollisionResponse
   * Tính phản ứng khi va chạm.
   */
  public calculateCharacterCollisionResponse(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterCollisionResponse(...args);
  }

  /**
   * [1087] calculateCharacterPenetrationDepth
   * Tính độ xuyên lấn nhân vật.
   */
  public calculateCharacterPenetrationDepth(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPenetrationDepth(...args);
  }

  /**
   * [1088] calculateCharacterSeparationVector
   * Tính vector tách hai nhân vật.
   */
  public calculateCharacterSeparationVector(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterSeparationVector(...args);
  }

  /**
   * [1089] calculateCharacterAvoidanceDirection
   * Tính hướng tránh chướng ngại.
   */
  public calculateCharacterAvoidanceDirection(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterAvoidanceDirection(...args);
  }

  /**
   * [1090] calculateCharacterPathDistance
   * Tính độ dài đường đi nhân vật.
   */
  public calculateCharacterPathDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPathDistance(...args);
  }

  /**
   * [1091] calculateCharacterPathDeviation
   * Tính sai lệch khỏi đường đi.
   */
  public calculateCharacterPathDeviation(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPathDeviation(...args);
  }

  /**
   * [1092] calculateCharacterPathCurvature
   * Tính độ cong đường đi.
   */
  public calculateCharacterPathCurvature(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPathCurvature(...args);
  }

  /**
   * [1093] calculateCharacterPathTangent
   * Tính tiếp tuyến đường đi.
   */
  public calculateCharacterPathTangent(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPathTangent(...args);
  }

  /**
   * [1094] calculateCharacterPathNormal
   * Tính pháp tuyến đường đi.
   */
  public calculateCharacterPathNormal(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterPathNormal(...args);
  }

  /**
   * [1095] calculateCharacterNavigationCost
   * Tính chi phí điều hướng.
   */
  public calculateCharacterNavigationCost(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterNavigationCost(...args);
  }

  /**
   * [1096] calculateCharacterReachDistance
   * Tính khoảng với tới của nhân vật.
   */
  public calculateCharacterReachDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterReachDistance(...args);
  }

  /**
   * [1097] calculateCharacterInteractionRange
   * Tính phạm vi tương tác nhân vật.
   */
  public calculateCharacterInteractionRange(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterInteractionRange(...args);
  }

  /**
   * [1098] calculateCharacterVisibilityRange
   * Tính phạm vi nhìn thấy nhân vật.
   */
  public calculateCharacterVisibilityRange(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterVisibilityRange(...args);
  }

  /**
   * [1099] calculateCharacterTargetDistance
   * Tính khoảng cách nhân vật đến mục tiêu.
   */
  public calculateCharacterTargetDistance(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterTargetDistance(...args);
  }

  /**
   * [1100] calculateCharacterTargetAngle
   * Tính góc hướng nhân vật đến mục tiêu.
   */
  public calculateCharacterTargetAngle(...args: any[]): any {
    return (this.skeletalKinematicsCharacter as any).calculateCharacterTargetAngle(...args);
  }

  /**
   * [1101] calculateNPCPosition
   * Tính vị trí NPC.
   */
  public calculateNPCPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPosition(...args);
  }

  /**
   * [1102] calculateNPCVelocity
   * Tính vận tốc NPC.
   */
  public calculateNPCVelocity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCVelocity(...args);
  }

  /**
   * [1103] calculateNPCAcceleration
   * Tính gia tốc NPC.
   */
  public calculateNPCAcceleration(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCAcceleration(...args);
  }

  /**
   * [1104] calculateNPCFacingDirection
   * Tính hướng mặt NPC.
   */
  public calculateNPCFacingDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFacingDirection(...args);
  }

  /**
   * [1105] calculateNPCOrientation
   * Tính hướng quay NPC.
   */
  public calculateNPCOrientation(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCOrientation(...args);
  }

  /**
   * [1106] calculateNPCDistanceToPlayer
   * Tính khoảng cách NPC đến người chơi.
   */
  public calculateNPCDistanceToPlayer(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCDistanceToPlayer(...args);
  }

  /**
   * [1107] calculateNPCDistanceToTarget
   * Tính khoảng cách NPC đến mục tiêu.
   */
  public calculateNPCDistanceToTarget(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCDistanceToTarget(...args);
  }

  /**
   * [1108] calculateNPCDistanceToWaypoint
   * Tính khoảng cách NPC đến điểm đường đi.
   */
  public calculateNPCDistanceToWaypoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCDistanceToWaypoint(...args);
  }

  /**
   * [1109] calculateNPCNearestNeighbor
   * Tìm NPC gần nhất.
   */
  public calculateNPCNearestNeighbor(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCNearestNeighbor(...args);
  }

  /**
   * [1110] calculateNPCGroupCenter
   * Tính tâm nhóm NPC.
   */
  public calculateNPCGroupCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCGroupCenter(...args);
  }

  /**
   * [1111] calculateNPCGroupRadius
   * Tính bán kính nhóm NPC.
   */
  public calculateNPCGroupRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCGroupRadius(...args);
  }

  /**
   * [1112] calculateNPCFormationOffset
   * Tính độ lệch đội hình NPC.
   */
  public calculateNPCFormationOffset(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFormationOffset(...args);
  }

  /**
   * [1113] calculateNPCFormationPosition
   * Tính vị trí đội hình NPC.
   */
  public calculateNPCFormationPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFormationPosition(...args);
  }

  /**
   * [1114] calculateNPCFormationDirection
   * Tính hướng đội hình NPC.
   */
  public calculateNPCFormationDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFormationDirection(...args);
  }

  /**
   * [1115] calculateNPCFormationSpacing
   * Tính khoảng cách giữa NPC trong đội hình.
   */
  public calculateNPCFormationSpacing(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFormationSpacing(...args);
  }

  /**
   * [1116] calculateNPCSeparationForce
   * Tính lực tách NPC.
   */
  public calculateNPCSeparationForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCSeparationForce(...args);
  }

  /**
   * [1117] calculateNPCAlignmentForce
   * Tính lực căn chỉnh hướng NPC.
   */
  public calculateNPCAlignmentForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCAlignmentForce(...args);
  }

  /**
   * [1118] calculateNPCCohesionForce
   * Tính lực tập hợp NPC.
   */
  public calculateNPCCohesionForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCCohesionForce(...args);
  }

  /**
   * [1119] calculateNPCSteeringForce
   * Tính lực điều hướng NPC.
   */
  public calculateNPCSteeringForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCSteeringForce(...args);
  }

  /**
   * [1120] calculateNPCAvoidanceForce
   * Tính lực tránh vật cản NPC.
   */
  public calculateNPCAvoidanceForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCAvoidanceForce(...args);
  }

  /**
   * [1121] calculateNPCObstacleDistance
   * Tính khoảng cách NPC đến chướng ngại.
   */
  public calculateNPCObstacleDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCObstacleDistance(...args);
  }

  /**
   * [1122] calculateNPCObstacleNormal
   * Tính pháp tuyến chướng ngại đối với NPC.
   */
  public calculateNPCObstacleNormal(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCObstacleNormal(...args);
  }

  /**
   * [1123] calculateNPCPathfindingCost
   * Tính chi phí tìm đường NPC.
   */
  public calculateNPCPathfindingCost(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPathfindingCost(...args);
  }

  /**
   * [1124] calculateNPCPathLength
   * Tính độ dài đường đi NPC.
   */
  public calculateNPCPathLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPathLength(...args);
  }

  /**
   * [1125] calculateNPCPathSmoothing
   * Tính đường đi mượt cho NPC.
   */
  public calculateNPCPathSmoothing(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPathSmoothing(...args);
  }

  /**
   * [1126] calculateNPCWaypointIndex
   * Xác định điểm đường đi hiện tại của NPC.
   */
  public calculateNPCWaypointIndex(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCWaypointIndex(...args);
  }

  /**
   * [1127] calculateNPCWaypointDistance
   * Tính khoảng cách đến waypoint.
   */
  public calculateNPCWaypointDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCWaypointDistance(...args);
  }

  /**
   * [1128] calculateNPCWaypointArrival
   * Xác định NPC đã đến waypoint.
   */
  public calculateNPCWaypointArrival(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCWaypointArrival(...args);
  }

  /**
   * [1129] calculateNPCPatrolRadius
   * Tính bán kính tuần tra NPC.
   */
  public calculateNPCPatrolRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPatrolRadius(...args);
  }

  /**
   * [1130] calculateNPCPatrolPosition
   * Tính vị trí tuần tra NPC.
   */
  public calculateNPCPatrolPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPatrolPosition(...args);
  }

  /**
   * [1131] calculateNPCDetectionRange
   * Tính phạm vi phát hiện NPC.
   */
  public calculateNPCDetectionRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCDetectionRange(...args);
  }

  /**
   * [1132] calculateNPCFieldOfView
   * Tính góc nhìn NPC.
   */
  public calculateNPCFieldOfView(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFieldOfView(...args);
  }

  /**
   * [1133] calculateNPCLineOfSight
   * Kiểm tra đường nhìn NPC.
   */
  public calculateNPCLineOfSight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCLineOfSight(...args);
  }

  /**
   * [1134] calculateNPCVisibilityScore
   * Tính điểm khả năng nhìn thấy mục tiêu.
   */
  public calculateNPCVisibilityScore(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCVisibilityScore(...args);
  }

  /**
   * [1135] calculateNPCThreatScore
   * Tính điểm đe dọa của NPC.
   */
  public calculateNPCThreatScore(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCThreatScore(...args);
  }

  /**
   * [1136] calculateNPCInterestScore
   * Tính điểm quan tâm NPC.
   */
  public calculateNPCInterestScore(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCInterestScore(...args);
  }

  /**
   * [1137] calculateNPCTargetPriority
   * Tính mức ưu tiên mục tiêu NPC.
   */
  public calculateNPCTargetPriority(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCTargetPriority(...args);
  }

  /**
   * [1138] calculateNPCAttackRange
   * Tính tầm đánh NPC.
   */
  public calculateNPCAttackRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCAttackRange(...args);
  }

  /**
   * [1139] calculateNPCInteractionDistance
   * Tính khoảng cách tương tác NPC.
   */
  public calculateNPCInteractionDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCInteractionDistance(...args);
  }

  /**
   * [1140] calculateNPCInteractionAngle
   * Tính góc tương tác NPC.
   */
  public calculateNPCInteractionAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCInteractionAngle(...args);
  }

  /**
   * [1141] calculateNPCApproachPosition
   * Tính vị trí NPC tiếp cận mục tiêu.
   */
  public calculateNPCApproachPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCApproachPosition(...args);
  }

  /**
   * [1142] calculateNPCFleeDirection
   * Tính hướng chạy trốn NPC.
   */
  public calculateNPCFleeDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCFleeDirection(...args);
  }

  /**
   * [1143] calculateNPCChaseDirection
   * Tính hướng đuổi bắt NPC.
   */
  public calculateNPCChaseDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCChaseDirection(...args);
  }

  /**
   * [1144] calculateNPCInterceptPoint
   * Tính điểm chặn mục tiêu của NPC.
   */
  public calculateNPCInterceptPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCInterceptPoint(...args);
  }

  /**
   * [1145] calculateNPCPredictionPosition
   * Dự đoán vị trí NPC.
   */
  public calculateNPCPredictionPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCPredictionPosition(...args);
  }

  /**
   * [1146] calculateNPCTargetPrediction
   * Dự đoán vị trí mục tiêu của NPC.
   */
  public calculateNPCTargetPrediction(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCTargetPrediction(...args);
  }

  /**
   * [1147] calculateNPCDecisionScore
   * Tính điểm quyết định hành động NPC.
   */
  public calculateNPCDecisionScore(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCDecisionScore(...args);
  }

  /**
   * [1148] calculateNPCStateTransition
   * Tính điều kiện chuyển trạng thái NPC.
   */
  public calculateNPCStateTransition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCStateTransition(...args);
  }

  /**
   * [1149] calculateNPCAnimationBlend
   * Tính pha trộn hoạt ảnh NPC.
   */
  public calculateNPCAnimationBlend(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCAnimationBlend(...args);
  }

  /**
   * [1150] calculateNPCNavigationError
   * Tính sai lệch điều hướng NPC.
   */
  public calculateNPCNavigationError(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateNPCNavigationError(...args);
  }

  /**
   * [1151] getBossPosition
   * Lấy tọa độ boss.
   */
  public getBossPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossPosition(...args);
  }

  /**
   * [1152] getBossCenter
   * Lấy tâm boss.
   */
  public getBossCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossCenter(...args);
  }

  /**
   * [1153] getBossHeadPosition
   * Lấy tọa độ đầu boss.
   */
  public getBossHeadPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossHeadPosition(...args);
  }

  /**
   * [1154] getBossChestPosition
   * Lấy tọa độ ngực boss.
   */
  public getBossChestPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossChestPosition(...args);
  }

  /**
   * [1155] getBossCorePosition
   * Lấy tọa độ lõi boss.
   */
  public getBossCorePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossCorePosition(...args);
  }

  /**
   * [1156] getBossWeakPointPosition
   * Lấy tọa độ điểm yếu boss.
   */
  public getBossWeakPointPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossWeakPointPosition(...args);
  }

  /**
   * [1157] getBossHitboxCenter
   * Lấy tâm vùng trúng đòn boss.
   */
  public getBossHitboxCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossHitboxCenter(...args);
  }

  /**
   * [1158] getBossAttackOrigin
   * Lấy điểm xuất phát đòn đánh boss.
   */
  public getBossAttackOrigin(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossAttackOrigin(...args);
  }

  /**
   * [1159] getBossTargetPosition
   * Lấy tọa độ mục tiêu boss.
   */
  public getBossTargetPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBossTargetPosition(...args);
  }

  /**
   * [1160] calculateBossHeight
   * Tính chiều cao boss.
   */
  public calculateBossHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossHeight(...args);
  }

  /**
   * [1161] calculateBossWidth
   * Tính chiều rộng boss.
   */
  public calculateBossWidth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossWidth(...args);
  }

  /**
   * [1162] calculateBossDepth
   * Tính chiều sâu boss.
   */
  public calculateBossDepth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossDepth(...args);
  }

  /**
   * [1163] calculateBossBounds
   * Tính giới hạn không gian boss.
   */
  public calculateBossBounds(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossBounds(...args);
  }

  /**
   * [1164] calculateBossBoundingBox
   * Tính hộp bao boss.
   */
  public calculateBossBoundingBox(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossBoundingBox(...args);
  }

  /**
   * [1165] calculateBossBoundingSphere
   * Tính hình cầu bao boss.
   */
  public calculateBossBoundingSphere(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossBoundingSphere(...args);
  }

  /**
   * [1166] calculateBossBoundingCapsule
   * Tính capsule bao boss.
   */
  public calculateBossBoundingCapsule(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossBoundingCapsule(...args);
  }

  /**
   * [1167] calculateBossCenterOfMass
   * Tính tâm khối lượng boss.
   */
  public calculateBossCenterOfMass(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossCenterOfMass(...args);
  }

  /**
   * [1168] calculateBossDistanceToPlayer
   * Tính khoảng cách boss đến người chơi.
   */
  public calculateBossDistanceToPlayer(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossDistanceToPlayer(...args);
  }

  /**
   * [1169] calculateBossDistanceToWeakPoint
   * Tính khoảng cách đến điểm yếu boss.
   */
  public calculateBossDistanceToWeakPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossDistanceToWeakPoint(...args);
  }

  /**
   * [1170] calculateBossFacingDirection
   * Tính hướng mặt boss.
   */
  public calculateBossFacingDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossFacingDirection(...args);
  }

  /**
   * [1171] calculateBossTurningAngle
   * Tính góc xoay boss.
   */
  public calculateBossTurningAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossTurningAngle(...args);
  }

  /**
   * [1172] calculateBossMovementSpeed
   * Tính tốc độ di chuyển boss.
   */
  public calculateBossMovementSpeed(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossMovementSpeed(...args);
  }

  /**
   * [1173] calculateBossAttackRange
   * Tính tầm đánh boss.
   */
  public calculateBossAttackRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAttackRange(...args);
  }

  /**
   * [1174] calculateBossAttackAngle
   * Tính góc đánh boss.
   */
  public calculateBossAttackAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAttackAngle(...args);
  }

  /**
   * [1175] calculateBossAttackTrajectory
   * Tính quỹ đạo đòn đánh boss.
   */
  public calculateBossAttackTrajectory(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAttackTrajectory(...args);
  }

  /**
   * [1176] calculateBossProjectileVelocity
   * Tính vận tốc đạn boss.
   */
  public calculateBossProjectileVelocity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossProjectileVelocity(...args);
  }

  /**
   * [1177] calculateBossProjectileDirection
   * Tính hướng đạn boss.
   */
  public calculateBossProjectileDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossProjectileDirection(...args);
  }

  /**
   * [1178] calculateBossProjectileImpactPoint
   * Tính điểm va chạm đạn boss.
   */
  public calculateBossProjectileImpactPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossProjectileImpactPoint(...args);
  }

  /**
   * [1179] calculateBossAreaAttackRadius
   * Tính bán kính đòn đánh diện rộng.
   */
  public calculateBossAreaAttackRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAreaAttackRadius(...args);
  }

  /**
   * [1180] calculateBossAreaAttackCenter
   * Tính tâm vùng đòn đánh diện rộng.
   */
  public calculateBossAreaAttackCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAreaAttackCenter(...args);
  }

  /**
   * [1181] calculateBossAreaAttackOverlap
   * Kiểm tra vùng đòn đánh có chồng lấn mục tiêu.
   */
  public calculateBossAreaAttackOverlap(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossAreaAttackOverlap(...args);
  }

  /**
   * [1182] calculateBossHitboxOverlap
   * Kiểm tra vùng trúng đòn boss có chồng lấn.
   */
  public calculateBossHitboxOverlap(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossHitboxOverlap(...args);
  }

  /**
   * [1183] calculateBossDamageDirection
   * Tính hướng nhận sát thương của boss.
   */
  public calculateBossDamageDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossDamageDirection(...args);
  }

  /**
   * [1184] calculateBossKnockbackDirection
   * Tính hướng đẩy lùi boss.
   */
  public calculateBossKnockbackDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossKnockbackDirection(...args);
  }

  /**
   * [1185] calculateBossKnockbackDistance
   * Tính khoảng cách đẩy lùi boss.
   */
  public calculateBossKnockbackDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossKnockbackDistance(...args);
  }

  /**
   * [1186] calculateBossStaggerAngle
   * Tính góc choáng boss.
   */
  public calculateBossStaggerAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossStaggerAngle(...args);
  }

  /**
   * [1187] calculateBossStaggerDuration
   * Tính thời gian choáng boss.
   */
  public calculateBossStaggerDuration(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossStaggerDuration(...args);
  }

  /**
   * [1188] calculateBossPhaseTransition
   * Tính điều kiện chuyển pha boss.
   */
  public calculateBossPhaseTransition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossPhaseTransition(...args);
  }

  /**
   * [1189] calculateBossPhasePosition
   * Tính vị trí theo pha boss.
   */
  public calculateBossPhasePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossPhasePosition(...args);
  }

  /**
   * [1190] calculateBossWeakPointExposure
   * Tính mức lộ điểm yếu boss.
   */
  public calculateBossWeakPointExposure(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBossWeakPointExposure(...args);
  }

  /**
   * [1191] calculateMonsterPosition
   * Lấy tọa độ quái vật.
   */
  public calculateMonsterPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterPosition(...args);
  }

  /**
   * [1192] calculateMonsterMovementDirection
   * Tính hướng di chuyển quái vật.
   */
  public calculateMonsterMovementDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterMovementDirection(...args);
  }

  /**
   * [1193] calculateMonsterSpeed
   * Tính tốc độ quái vật.
   */
  public calculateMonsterSpeed(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterSpeed(...args);
  }

  /**
   * [1194] calculateMonsterAttackDistance
   * Tính khoảng cách đánh quái vật.
   */
  public calculateMonsterAttackDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterAttackDistance(...args);
  }

  /**
   * [1195] calculateMonsterDetectionRange
   * Tính phạm vi phát hiện quái vật.
   */
  public calculateMonsterDetectionRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterDetectionRange(...args);
  }

  /**
   * [1196] calculateMonsterCollision
   * Kiểm tra va chạm quái vật.
   */
  public calculateMonsterCollision(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterCollision(...args);
  }

  /**
   * [1197] calculateMonsterBoundingBox
   * Tính hộp bao quái vật.
   */
  public calculateMonsterBoundingBox(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterBoundingBox(...args);
  }

  /**
   * [1198] calculateMonsterBoundingSphere
   * Tính hình cầu bao quái vật.
   */
  public calculateMonsterBoundingSphere(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterBoundingSphere(...args);
  }

  /**
   * [1199] calculateMonsterWeakPoint
   * Tính vị trí điểm yếu quái vật.
   */
  public calculateMonsterWeakPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterWeakPoint(...args);
  }

  /**
   * [1200] calculateMonsterThreatLevel
   * Tính mức độ đe dọa quái vật.
   */
  public calculateMonsterThreatLevel(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateMonsterThreatLevel(...args);
  }

  /**
   * [1201] getAnimalPosition
   * Lấy tọa độ con vật.
   */
  public getAnimalPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalPosition(...args);
  }

  /**
   * [1202] getAnimalCenter
   * Lấy tâm con vật.
   */
  public getAnimalCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalCenter(...args);
  }

  /**
   * [1203] getAnimalHeadPosition
   * Lấy tọa độ đầu con vật.
   */
  public getAnimalHeadPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalHeadPosition(...args);
  }

  /**
   * [1204] getAnimalSnoutPosition
   * Lấy tọa độ mõm con vật.
   */
  public getAnimalSnoutPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalSnoutPosition(...args);
  }

  /**
   * [1205] getAnimalNosePosition
   * Lấy tọa độ mũi con vật.
   */
  public getAnimalNosePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalNosePosition(...args);
  }

  /**
   * [1206] getAnimalEyePosition
   * Lấy tọa độ mắt con vật.
   */
  public getAnimalEyePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalEyePosition(...args);
  }

  /**
   * [1207] getAnimalEarPosition
   * Lấy tọa độ tai con vật.
   */
  public getAnimalEarPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalEarPosition(...args);
  }

  /**
   * [1208] getAnimalNeckPosition
   * Lấy tọa độ cổ con vật.
   */
  public getAnimalNeckPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalNeckPosition(...args);
  }

  /**
   * [1209] getAnimalTorsoPosition
   * Lấy tọa độ thân con vật.
   */
  public getAnimalTorsoPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalTorsoPosition(...args);
  }

  /**
   * [1210] getAnimalChestPosition
   * Lấy tọa độ ngực con vật.
   */
  public getAnimalChestPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalChestPosition(...args);
  }

  /**
   * [1211] getAnimalAbdomenPosition
   * Lấy tọa độ bụng con vật.
   */
  public getAnimalAbdomenPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalAbdomenPosition(...args);
  }

  /**
   * [1212] getAnimalHipPosition
   * Lấy tọa độ hông con vật.
   */
  public getAnimalHipPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalHipPosition(...args);
  }

  /**
   * [1213] getAnimalTailPosition
   * Lấy tọa độ đuôi con vật.
   */
  public getAnimalTailPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalTailPosition(...args);
  }

  /**
   * [1214] getAnimalTailTipPosition
   * Lấy tọa độ chóp đuôi con vật.
   */
  public getAnimalTailTipPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalTailTipPosition(...args);
  }

  /**
   * [1215] getAnimalFrontLeftLegPosition
   * Lấy tọa độ chân trước trái con vật.
   */
  public getAnimalFrontLeftLegPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalFrontLeftLegPosition(...args);
  }

  /**
   * [1216] getAnimalFrontRightLegPosition
   * Lấy tọa độ chân trước phải con vật.
   */
  public getAnimalFrontRightLegPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalFrontRightLegPosition(...args);
  }

  /**
   * [1217] getAnimalRearLeftLegPosition
   * Lấy tọa độ chân sau trái con vật.
   */
  public getAnimalRearLeftLegPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalRearLeftLegPosition(...args);
  }

  /**
   * [1218] getAnimalRearRightLegPosition
   * Lấy tọa độ chân sau phải con vật.
   */
  public getAnimalRearRightLegPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalRearRightLegPosition(...args);
  }

  /**
   * [1219] getAnimalPawPosition
   * Lấy tọa độ bàn chân con vật.
   */
  public getAnimalPawPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalPawPosition(...args);
  }

  /**
   * [1220] getAnimalClawPosition
   * Lấy tọa độ móng vuốt con vật.
   */
  public getAnimalClawPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getAnimalClawPosition(...args);
  }

  /**
   * [1221] calculateAnimalBodyLength
   * Tính chiều dài thân con vật.
   */
  public calculateAnimalBodyLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBodyLength(...args);
  }

  /**
   * [1222] calculateAnimalBodyHeight
   * Tính chiều cao thân con vật.
   */
  public calculateAnimalBodyHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBodyHeight(...args);
  }

  /**
   * [1223] calculateAnimalBodyWidth
   * Tính chiều rộng thân con vật.
   */
  public calculateAnimalBodyWidth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBodyWidth(...args);
  }

  /**
   * [1224] calculateAnimalCenterOfMass
   * Tính tâm khối lượng con vật.
   */
  public calculateAnimalCenterOfMass(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalCenterOfMass(...args);
  }

  /**
   * [1225] calculateAnimalSpineCurvature
   * Tính độ cong cột sống con vật.
   */
  public calculateAnimalSpineCurvature(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalSpineCurvature(...args);
  }

  /**
   * [1226] calculateAnimalNeckAngle
   * Tính góc cổ con vật.
   */
  public calculateAnimalNeckAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalNeckAngle(...args);
  }

  /**
   * [1227] calculateAnimalHeadAngle
   * Tính góc đầu con vật.
   */
  public calculateAnimalHeadAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalHeadAngle(...args);
  }

  /**
   * [1228] calculateAnimalTailCurvature
   * Tính độ cong đuôi con vật.
   */
  public calculateAnimalTailCurvature(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalTailCurvature(...args);
  }

  /**
   * [1229] calculateAnimalTailSwing
   * Tính độ vung đuôi con vật.
   */
  public calculateAnimalTailSwing(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalTailSwing(...args);
  }

  /**
   * [1230] calculateAnimalLegLength
   * Tính chiều dài chân con vật.
   */
  public calculateAnimalLegLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalLegLength(...args);
  }

  /**
   * [1231] calculateAnimalStrideLength
   * Tính chiều dài bước con vật.
   */
  public calculateAnimalStrideLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalStrideLength(...args);
  }

  /**
   * [1232] calculateAnimalStrideFrequency
   * Tính tần số bước con vật.
   */
  public calculateAnimalStrideFrequency(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalStrideFrequency(...args);
  }

  /**
   * [1233] calculateAnimalWalkingSpeed
   * Tính tốc độ đi con vật.
   */
  public calculateAnimalWalkingSpeed(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalWalkingSpeed(...args);
  }

  /**
   * [1234] calculateAnimalRunningSpeed
   * Tính tốc độ chạy con vật.
   */
  public calculateAnimalRunningSpeed(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalRunningSpeed(...args);
  }

  /**
   * [1235] calculateAnimalJumpHeight
   * Tính độ cao nhảy con vật.
   */
  public calculateAnimalJumpHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalJumpHeight(...args);
  }

  /**
   * [1236] calculateAnimalLandingPosition
   * Tính vị trí tiếp đất con vật.
   */
  public calculateAnimalLandingPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalLandingPosition(...args);
  }

  /**
   * [1237] calculateAnimalGroundContact
   * Kiểm tra chân con vật tiếp xúc mặt đất.
   */
  public calculateAnimalGroundContact(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalGroundContact(...args);
  }

  /**
   * [1238] calculateAnimalFootPlacement
   * Tính vị trí đặt chân con vật.
   */
  public calculateAnimalFootPlacement(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalFootPlacement(...args);
  }

  /**
   * [1239] calculateAnimalBalance
   * Tính độ cân bằng con vật.
   */
  public calculateAnimalBalance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBalance(...args);
  }

  /**
   * [1240] calculateAnimalGaitPhase
   * Tính pha dáng đi con vật.
   */
  public calculateAnimalGaitPhase(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalGaitPhase(...args);
  }

  /**
   * [1241] calculateAnimalHeadToGroundDistance
   * Tính khoảng cách đầu con vật đến mặt đất.
   */
  public calculateAnimalHeadToGroundDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalHeadToGroundDistance(...args);
  }

  /**
   * [1242] calculateAnimalNoseToTargetDistance
   * Tính khoảng cách mũi đến mục tiêu.
   */
  public calculateAnimalNoseToTargetDistance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalNoseToTargetDistance(...args);
  }

  /**
   * [1243] calculateAnimalSightDirection
   * Tính hướng nhìn con vật.
   */
  public calculateAnimalSightDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalSightDirection(...args);
  }

  /**
   * [1244] calculateAnimalFieldOfView
   * Tính trường nhìn con vật.
   */
  public calculateAnimalFieldOfView(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalFieldOfView(...args);
  }

  /**
   * [1245] calculateAnimalHearingRange
   * Tính phạm vi nghe con vật.
   */
  public calculateAnimalHearingRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalHearingRange(...args);
  }

  /**
   * [1246] calculateAnimalSmellRange
   * Tính phạm vi ngửi con vật.
   */
  public calculateAnimalSmellRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalSmellRange(...args);
  }

  /**
   * [1247] calculateAnimalAttackRange
   * Tính tầm tấn công con vật.
   */
  public calculateAnimalAttackRange(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalAttackRange(...args);
  }

  /**
   * [1248] calculateAnimalBitePoint
   * Tính điểm cắn con vật.
   */
  public calculateAnimalBitePoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBitePoint(...args);
  }

  /**
   * [1249] calculateAnimalBiteDirection
   * Tính hướng cắn con vật.
   */
  public calculateAnimalBiteDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalBiteDirection(...args);
  }

  /**
   * [1250] calculateAnimalCollision
   * Kiểm tra va chạm con vật.
   */
  public calculateAnimalCollision(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateAnimalCollision(...args);
  }

  /**
   * [1251] getBirdPosition
   * Lấy tọa độ chim.
   */
  public getBirdPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdPosition(...args);
  }

  /**
   * [1252] getBirdHeadPosition
   * Lấy tọa độ đầu chim.
   */
  public getBirdHeadPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdHeadPosition(...args);
  }

  /**
   * [1253] getBirdBeakPosition
   * Lấy tọa độ mỏ chim.
   */
  public getBirdBeakPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdBeakPosition(...args);
  }

  /**
   * [1254] getBirdEyePosition
   * Lấy tọa độ mắt chim.
   */
  public getBirdEyePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdEyePosition(...args);
  }

  /**
   * [1255] getBirdBodyCenter
   * Lấy tâm thân chim.
   */
  public getBirdBodyCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdBodyCenter(...args);
  }

  /**
   * [1256] getBirdWingRootPosition
   * Lấy tọa độ gốc cánh chim.
   */
  public getBirdWingRootPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdWingRootPosition(...args);
  }

  /**
   * [1257] getBirdLeftWingTip
   * Lấy tọa độ đầu cánh trái.
   */
  public getBirdLeftWingTip(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdLeftWingTip(...args);
  }

  /**
   * [1258] getBirdRightWingTip
   * Lấy tọa độ đầu cánh phải.
   */
  public getBirdRightWingTip(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdRightWingTip(...args);
  }

  /**
   * [1259] getBirdWingCenter
   * Lấy tâm cánh chim.
   */
  public getBirdWingCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdWingCenter(...args);
  }

  /**
   * [1260] getBirdTailTipPosition
   * Lấy tọa độ chóp đuôi chim.
   */
  public getBirdTailTipPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdTailTipPosition(...args);
  }

  /**
   * [1261] getBirdLeftFootPosition
   * Lấy tọa độ chân trái chim.
   */
  public getBirdLeftFootPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdLeftFootPosition(...args);
  }

  /**
   * [1262] getBirdRightFootPosition
   * Lấy tọa độ chân phải chim.
   */
  public getBirdRightFootPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBirdRightFootPosition(...args);
  }

  /**
   * [1263] calculateBirdWingspan
   * Tính sải cánh chim.
   */
  public calculateBirdWingspan(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingspan(...args);
  }

  /**
   * [1264] calculateBirdWingLength
   * Tính chiều dài cánh chim.
   */
  public calculateBirdWingLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingLength(...args);
  }

  /**
   * [1265] calculateBirdWingArea
   * Tính diện tích cánh chim.
   */
  public calculateBirdWingArea(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingArea(...args);
  }

  /**
   * [1266] calculateBirdWingAngle
   * Tính góc cánh chim.
   */
  public calculateBirdWingAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingAngle(...args);
  }

  /**
   * [1267] calculateBirdWingFlapAmplitude
   * Tính biên độ vỗ cánh.
   */
  public calculateBirdWingFlapAmplitude(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingFlapAmplitude(...args);
  }

  /**
   * [1268] calculateBirdWingFlapFrequency
   * Tính tần số vỗ cánh.
   */
  public calculateBirdWingFlapFrequency(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingFlapFrequency(...args);
  }

  /**
   * [1269] calculateBirdWingFlapPhase
   * Tính pha vỗ cánh.
   */
  public calculateBirdWingFlapPhase(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingFlapPhase(...args);
  }

  /**
   * [1270] calculateBirdWingVelocity
   * Tính vận tốc cánh chim.
   */
  public calculateBirdWingVelocity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingVelocity(...args);
  }

  /**
   * [1271] calculateBirdWingAcceleration
   * Tính gia tốc cánh chim.
   */
  public calculateBirdWingAcceleration(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdWingAcceleration(...args);
  }

  /**
   * [1272] calculateBirdFlightDirection
   * Tính hướng bay chim.
   */
  public calculateBirdFlightDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFlightDirection(...args);
  }

  /**
   * [1273] calculateBirdFlightSpeed
   * Tính tốc độ bay chim.
   */
  public calculateBirdFlightSpeed(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFlightSpeed(...args);
  }

  /**
   * [1274] calculateBirdFlightAltitude
   * Tính độ cao bay chim.
   */
  public calculateBirdFlightAltitude(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFlightAltitude(...args);
  }

  /**
   * [1275] calculateBirdFlightPath
   * Tính đường bay chim.
   */
  public calculateBirdFlightPath(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFlightPath(...args);
  }

  /**
   * [1276] calculateBirdGlideAngle
   * Tính góc lượn chim.
   */
  public calculateBirdGlideAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdGlideAngle(...args);
  }

  /**
   * [1277] calculateBirdTurnRadius
   * Tính bán kính vòng lượn chim.
   */
  public calculateBirdTurnRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdTurnRadius(...args);
  }

  /**
   * [1278] calculateBirdBankAngle
   * Tính góc nghiêng khi chim rẽ.
   */
  public calculateBirdBankAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdBankAngle(...args);
  }

  /**
   * [1279] calculateBirdLiftForce
   * Tính lực nâng cánh chim.
   */
  public calculateBirdLiftForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdLiftForce(...args);
  }

  /**
   * [1280] calculateBirdDragForce
   * Tính lực cản không khí chim.
   */
  public calculateBirdDragForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdDragForce(...args);
  }

  /**
   * [1281] calculateBirdHoverPosition
   * Tính vị trí chim bay lơ lửng.
   */
  public calculateBirdHoverPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdHoverPosition(...args);
  }

  /**
   * [1282] calculateBirdLandingPoint
   * Tính điểm hạ cánh chim.
   */
  public calculateBirdLandingPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdLandingPoint(...args);
  }

  /**
   * [1283] calculateBirdTakeoffVelocity
   * Tính vận tốc cất cánh chim.
   */
  public calculateBirdTakeoffVelocity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdTakeoffVelocity(...args);
  }

  /**
   * [1284] calculateBirdObstacleAvoidance
   * Tính hướng tránh vật cản khi bay.
   */
  public calculateBirdObstacleAvoidance(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdObstacleAvoidance(...args);
  }

  /**
   * [1285] calculateBirdFormationPosition
   * Tính vị trí chim trong đội hình.
   */
  public calculateBirdFormationPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFormationPosition(...args);
  }

  /**
   * [1286] calculateBirdFormationSpacing
   * Tính khoảng cách giữa các chim.
   */
  public calculateBirdFormationSpacing(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdFormationSpacing(...args);
  }

  /**
   * [1287] calculateBirdTargetIntercept
   * Tính điểm chặn mục tiêu trên không.
   */
  public calculateBirdTargetIntercept(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdTargetIntercept(...args);
  }

  /**
   * [1288] calculateBirdBeakDirection
   * Tính hướng mỏ chim.
   */
  public calculateBirdBeakDirection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdBeakDirection(...args);
  }

  /**
   * [1289] calculateBirdTalonsPosition
   * Tính tọa độ móng vuốt chim.
   */
  public calculateBirdTalonsPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdTalonsPosition(...args);
  }

  /**
   * [1290] calculateBirdCollision
   * Kiểm tra va chạm chim.
   */
  public calculateBirdCollision(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBirdCollision(...args);
  }

  /**
   * [1291] getPlantPosition
   * Lấy tọa độ cây hoặc thực vật.
   */
  public getPlantPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getPlantPosition(...args);
  }

  /**
   * [1292] getPlantRootPosition
   * Lấy tọa độ gốc cây.
   */
  public getPlantRootPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getPlantRootPosition(...args);
  }

  /**
   * [1293] getPlantStemPosition
   * Lấy tọa độ thân thực vật.
   */
  public getPlantStemPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getPlantStemPosition(...args);
  }

  /**
   * [1294] getPlantStemBase
   * Lấy tọa độ gốc thân cây.
   */
  public getPlantStemBase(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getPlantStemBase(...args);
  }

  /**
   * [1295] getPlantStemTip
   * Lấy tọa độ ngọn thân cây.
   */
  public getPlantStemTip(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getPlantStemTip(...args);
  }

  /**
   * [1296] getTreeTrunkPosition
   * Lấy tọa độ thân cây gỗ.
   */
  public getTreeTrunkPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeTrunkPosition(...args);
  }

  /**
   * [1297] getTreeTrunkCenter
   * Lấy tâm thân cây.
   */
  public getTreeTrunkCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeTrunkCenter(...args);
  }

  /**
   * [1298] getTreeTrunkBase
   * Lấy tọa độ gốc thân cây.
   */
  public getTreeTrunkBase(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeTrunkBase(...args);
  }

  /**
   * [1299] getTreeTrunkTop
   * Lấy tọa độ đỉnh thân cây.
   */
  public getTreeTrunkTop(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeTrunkTop(...args);
  }

  /**
   * [1300] getTreeCanopyCenter
   * Lấy tâm tán cây.
   */
  public getTreeCanopyCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeCanopyCenter(...args);
  }

  /**
   * [1301] getTreeCanopyTop
   * Lấy tọa độ đỉnh tán cây.
   */
  public getTreeCanopyTop(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeCanopyTop(...args);
  }

  /**
   * [1302] getTreeCanopyBottom
   * Lấy tọa độ đáy tán cây.
   */
  public getTreeCanopyBottom(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeCanopyBottom(...args);
  }

  /**
   * [1303] getTreeCanopyLeft
   * Lấy tọa độ mép trái tán cây.
   */
  public getTreeCanopyLeft(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeCanopyLeft(...args);
  }

  /**
   * [1304] getTreeCanopyRight
   * Lấy tọa độ mép phải tán cây.
   */
  public getTreeCanopyRight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getTreeCanopyRight(...args);
  }

  /**
   * [1305] getBranchPosition
   * Lấy tọa độ cành cây.
   */
  public getBranchPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBranchPosition(...args);
  }

  /**
   * [1306] getBranchStartPosition
   * Lấy điểm đầu cành cây.
   */
  public getBranchStartPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBranchStartPosition(...args);
  }

  /**
   * [1307] getBranchEndPosition
   * Lấy điểm cuối cành cây.
   */
  public getBranchEndPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBranchEndPosition(...args);
  }

  /**
   * [1308] getBranchJunctionPosition
   * Lấy tọa độ điểm phân nhánh.
   */
  public getBranchJunctionPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getBranchJunctionPosition(...args);
  }

  /**
   * [1309] getLeafPosition
   * Lấy tọa độ lá.
   */
  public getLeafPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getLeafPosition(...args);
  }

  /**
   * [1310] getLeafTipPosition
   * Lấy tọa độ chóp lá.
   */
  public getLeafTipPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getLeafTipPosition(...args);
  }

  /**
   * [1311] getLeafBasePosition
   * Lấy tọa độ gốc lá.
   */
  public getLeafBasePosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getLeafBasePosition(...args);
  }

  /**
   * [1312] getLeafCenter
   * Lấy tâm lá.
   */
  public getLeafCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getLeafCenter(...args);
  }

  /**
   * [1313] getFlowerPosition
   * Lấy tọa độ hoa.
   */
  public getFlowerPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getFlowerPosition(...args);
  }

  /**
   * [1314] getFlowerCenter
   * Lấy tâm hoa.
   */
  public getFlowerCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getFlowerCenter(...args);
  }

  /**
   * [1315] getFruitPosition
   * Lấy tọa độ quả.
   */
  public getFruitPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getFruitPosition(...args);
  }

  /**
   * [1316] getFruitCenter
   * Lấy tâm quả.
   */
  public getFruitCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getFruitCenter(...args);
  }

  /**
   * [1317] getSeedPosition
   * Lấy tọa độ hạt.
   */
  public getSeedPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getSeedPosition(...args);
  }

  /**
   * [1318] calculatePlantHeight
   * Tính chiều cao thực vật.
   */
  public calculatePlantHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculatePlantHeight(...args);
  }

  /**
   * [1319] calculateTreeHeight
   * Tính chiều cao cây.
   */
  public calculateTreeHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeHeight(...args);
  }

  /**
   * [1320] calculateTreeTrunkDiameter
   * Tính đường kính thân cây.
   */
  public calculateTreeTrunkDiameter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeTrunkDiameter(...args);
  }

  /**
   * [1321] calculateTreeTrunkRadius
   * Tính bán kính thân cây.
   */
  public calculateTreeTrunkRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeTrunkRadius(...args);
  }

  /**
   * [1322] calculateTreeCanopyRadius
   * Tính bán kính tán cây.
   */
  public calculateTreeCanopyRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeCanopyRadius(...args);
  }

  /**
   * [1323] calculateTreeCanopyVolume
   * Tính thể tích tán cây.
   */
  public calculateTreeCanopyVolume(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeCanopyVolume(...args);
  }

  /**
   * [1324] calculateTreeCanopyBounds
   * Tính giới hạn tán cây.
   */
  public calculateTreeCanopyBounds(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeCanopyBounds(...args);
  }

  /**
   * [1325] calculateTreeBranchLength
   * Tính chiều dài cành cây.
   */
  public calculateTreeBranchLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeBranchLength(...args);
  }

  /**
   * [1326] calculateBranchAngle
   * Tính góc cành cây.
   */
  public calculateBranchAngle(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBranchAngle(...args);
  }

  /**
   * [1327] calculateBranchCurvature
   * Tính độ cong cành cây.
   */
  public calculateBranchCurvature(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBranchCurvature(...args);
  }

  /**
   * [1328] calculateBranchTaper
   * Tính độ thuôn của cành cây.
   */
  public calculateBranchTaper(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateBranchTaper(...args);
  }

  /**
   * [1329] calculateLeafLength
   * Tính chiều dài lá.
   */
  public calculateLeafLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafLength(...args);
  }

  /**
   * [1330] calculateLeafWidth
   * Tính chiều rộng lá.
   */
  public calculateLeafWidth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafWidth(...args);
  }

  /**
   * [1331] calculateLeafNormal
   * Tính pháp tuyến bề mặt lá.
   */
  public calculateLeafNormal(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafNormal(...args);
  }

  /**
   * [1332] calculateLeafOrientation
   * Tính hướng lá.
   */
  public calculateLeafOrientation(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafOrientation(...args);
  }

  /**
   * [1333] calculateLeafCurvature
   * Tính độ cong lá.
   */
  public calculateLeafCurvature(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafCurvature(...args);
  }

  /**
   * [1334] calculateLeafArea
   * Tính diện tích lá.
   */
  public calculateLeafArea(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateLeafArea(...args);
  }

  /**
   * [1335] calculateFlowerRadius
   * Tính bán kính hoa.
   */
  public calculateFlowerRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateFlowerRadius(...args);
  }

  /**
   * [1336] calculateFruitRadius
   * Tính bán kính quả.
   */
  public calculateFruitRadius(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateFruitRadius(...args);
  }

  /**
   * [1337] calculateRootDepth
   * Tính độ sâu rễ.
   */
  public calculateRootDepth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateRootDepth(...args);
  }

  /**
   * [1338] calculateRootSpread
   * Tính độ lan rộng rễ.
   */
  public calculateRootSpread(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateRootSpread(...args);
  }

  /**
   * [1339] calculatePlantWindDeflection
   * Tính độ lệch cây do gió.
   */
  public calculatePlantWindDeflection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculatePlantWindDeflection(...args);
  }

  /**
   * [1340] calculateTreeWindSway
   * Tính độ lắc cây do gió.
   */
  public calculateTreeWindSway(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateTreeWindSway(...args);
  }

  /**
   * [1341] getObjectPosition
   * Lấy tọa độ vật thể.
   */
  public getObjectPosition(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectPosition(...args);
  }

  /**
   * [1342] getObjectCenter
   * Lấy tâm vật thể.
   */
  public getObjectCenter(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectCenter(...args);
  }

  /**
   * [1343] getObjectRotation
   * Lấy góc quay vật thể.
   */
  public getObjectRotation(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectRotation(...args);
  }

  /**
   * [1344] getObjectScale
   * Lấy tỷ lệ kích thước vật thể.
   */
  public getObjectScale(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectScale(...args);
  }

  /**
   * [1345] getObjectForwardVector
   * Lấy hướng phía trước vật thể.
   */
  public getObjectForwardVector(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectForwardVector(...args);
  }

  /**
   * [1346] getObjectRightVector
   * Lấy hướng bên phải vật thể.
   */
  public getObjectRightVector(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectRightVector(...args);
  }

  /**
   * [1347] getObjectUpVector
   * Lấy hướng phía trên vật thể.
   */
  public getObjectUpVector(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectUpVector(...args);
  }

  /**
   * [1348] getObjectBoundingBox
   * Lấy hộp bao vật thể.
   */
  public getObjectBoundingBox(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectBoundingBox(...args);
  }

  /**
   * [1349] getObjectBoundingSphere
   * Lấy hình cầu bao vật thể.
   */
  public getObjectBoundingSphere(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectBoundingSphere(...args);
  }

  /**
   * [1350] getObjectBoundingCapsule
   * Lấy capsule bao vật thể.
   */
  public getObjectBoundingCapsule(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).getObjectBoundingCapsule(...args);
  }

  /**
   * [1351] calculateObjectLength
   * Tính chiều dài vật thể.
   */
  public calculateObjectLength(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectLength(...args);
  }

  /**
   * [1352] calculateObjectWidth
   * Tính chiều rộng vật thể.
   */
  public calculateObjectWidth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectWidth(...args);
  }

  /**
   * [1353] calculateObjectHeight
   * Tính chiều cao vật thể.
   */
  public calculateObjectHeight(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectHeight(...args);
  }

  /**
   * [1354] calculateObjectDepth
   * Tính chiều sâu vật thể.
   */
  public calculateObjectDepth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDepth(...args);
  }

  /**
   * [1355] calculateObjectVolume
   * Tính thể tích vật thể.
   */
  public calculateObjectVolume(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectVolume(...args);
  }

  /**
   * [1356] calculateObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateObjectSurfaceArea(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectSurfaceArea(...args);
  }

  /**
   * [1357] calculateObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateObjectCenterOfMass(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectCenterOfMass(...args);
  }

  /**
   * [1358] calculateObjectDensity
   * Tính khối lượng riêng vật thể.
   */
  public calculateObjectDensity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDensity(...args);
  }

  /**
   * [1359] calculateObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateObjectInertiaTensor(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectInertiaTensor(...args);
  }

  /**
   * [1360] calculateObjectWorldTransform
   * Tính phép biến đổi thế giới vật thể.
   */
  public calculateObjectWorldTransform(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectWorldTransform(...args);
  }

  /**
   * [1361] calculateObjectLocalTransform
   * Tính phép biến đổi cục bộ vật thể.
   */
  public calculateObjectLocalTransform(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectLocalTransform(...args);
  }

  /**
   * [1362] calculateObjectPivotOffset
   * Tính độ lệch điểm xoay vật thể.
   */
  public calculateObjectPivotOffset(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectPivotOffset(...args);
  }

  /**
   * [1363] calculateObjectOriginOffset
   * Tính độ lệch gốc vật thể.
   */
  public calculateObjectOriginOffset(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectOriginOffset(...args);
  }

  /**
   * [1364] calculateObjectDistanceToGround
   * Tính khoảng cách vật thể đến mặt đất.
   */
  public calculateObjectDistanceToGround(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToGround(...args);
  }

  /**
   * [1365] calculateObjectDistanceToWall
   * Tính khoảng cách vật thể đến tường.
   */
  public calculateObjectDistanceToWall(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToWall(...args);
  }

  /**
   * [1366] calculateObjectDistanceToCeiling
   * Tính khoảng cách vật thể đến trần.
   */
  public calculateObjectDistanceToCeiling(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToCeiling(...args);
  }

  /**
   * [1367] calculateObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateObjectDistanceToCamera(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToCamera(...args);
  }

  /**
   * [1368] calculateObjectDistanceToPlayer
   * Tính khoảng cách vật thể đến người chơi.
   */
  public calculateObjectDistanceToPlayer(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToPlayer(...args);
  }

  /**
   * [1369] calculateObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateObjectDistanceToTarget(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDistanceToTarget(...args);
  }

  /**
   * [1370] calculateObjectClosestPoint
   * Tính điểm gần nhất trên vật thể.
   */
  public calculateObjectClosestPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectClosestPoint(...args);
  }

  /**
   * [1371] calculateObjectFarthestPoint
   * Tính điểm xa nhất trên vật thể.
   */
  public calculateObjectFarthestPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectFarthestPoint(...args);
  }

  /**
   * [1372] calculateObjectSurfaceNormal
   * Tính pháp tuyến bề mặt vật thể.
   */
  public calculateObjectSurfaceNormal(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectSurfaceNormal(...args);
  }

  /**
   * [1373] calculateObjectTangent
   * Tính tiếp tuyến bề mặt vật thể.
   */
  public calculateObjectTangent(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectTangent(...args);
  }

  /**
   * [1374] calculateObjectCurvature
   * Tính độ cong bề mặt vật thể.
   */
  public calculateObjectCurvature(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectCurvature(...args);
  }

  /**
   * [1375] calculateObjectIntersection
   * Tính giao điểm vật thể.
   */
  public calculateObjectIntersection(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectIntersection(...args);
  }

  /**
   * [1376] calculateObjectOverlap
   * Tính mức độ chồng lấn vật thể.
   */
  public calculateObjectOverlap(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectOverlap(...args);
  }

  /**
   * [1377] calculateObjectCollision
   * Kiểm tra va chạm vật thể.
   */
  public calculateObjectCollision(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectCollision(...args);
  }

  /**
   * [1378] calculateObjectPenetrationDepth
   * Tính độ xuyên lấn vật thể.
   */
  public calculateObjectPenetrationDepth(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectPenetrationDepth(...args);
  }

  /**
   * [1379] calculateObjectSeparationVector
   * Tính vector tách vật thể.
   */
  public calculateObjectSeparationVector(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectSeparationVector(...args);
  }

  /**
   * [1380] calculateObjectContactPoint
   * Tính điểm tiếp xúc vật thể.
   */
  public calculateObjectContactPoint(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectContactPoint(...args);
  }

  /**
   * [1381] calculateObjectContactNormal
   * Tính pháp tuyến điểm tiếp xúc.
   */
  public calculateObjectContactNormal(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectContactNormal(...args);
  }

  /**
   * [1382] calculateObjectContactArea
   * Tính diện tích tiếp xúc vật thể.
   */
  public calculateObjectContactArea(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectContactArea(...args);
  }

  /**
   * [1383] calculateObjectFrictionForce
   * Tính lực ma sát vật thể.
   */
  public calculateObjectFrictionForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectFrictionForce(...args);
  }

  /**
   * [1384] calculateObjectNormalForce
   * Tính lực pháp tuyến vật thể.
   */
  public calculateObjectNormalForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectNormalForce(...args);
  }

  /**
   * [1385] calculateObjectGravityForce
   * Tính lực hấp dẫn tác dụng lên vật thể.
   */
  public calculateObjectGravityForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectGravityForce(...args);
  }

  /**
   * [1386] calculateObjectBuoyancyForce
   * Tính lực đẩy nổi vật thể.
   */
  public calculateObjectBuoyancyForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectBuoyancyForce(...args);
  }

  /**
   * [1387] calculateObjectDragForce
   * Tính lực cản vật thể.
   */
  public calculateObjectDragForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectDragForce(...args);
  }

  /**
   * [1388] calculateObjectLiftForce
   * Tính lực nâng vật thể.
   */
  public calculateObjectLiftForce(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectLiftForce(...args);
  }

  /**
   * [1389] calculateObjectVelocity
   * Tính vận tốc vật thể.
   */
  public calculateObjectVelocity(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectVelocity(...args);
  }

  /**
   * [1390] calculateObjectAcceleration
   * Tính gia tốc vật thể.
   */
  public calculateObjectAcceleration(...args: any[]): any {
    return (this.entitiesFaunaFlora as any).calculateObjectAcceleration(...args);
  }

  /**
   * [1391] getCameraPosition
   * Lấy tọa độ camera.
   */
  public getCameraPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraPosition(...args);
  }

  /**
   * [1392] getCameraRotation
   * Lấy góc quay camera.
   */
  public getCameraRotation(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraRotation(...args);
  }

  /**
   * [1393] getCameraForwardVector
   * Lấy hướng nhìn phía trước camera.
   */
  public getCameraForwardVector(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraForwardVector(...args);
  }

  /**
   * [1394] getCameraRightVector
   * Lấy hướng bên phải camera.
   */
  public getCameraRightVector(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraRightVector(...args);
  }

  /**
   * [1395] getCameraUpVector
   * Lấy hướng phía trên camera.
   */
  public getCameraUpVector(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraUpVector(...args);
  }

  /**
   * [1396] getCameraTargetPosition
   * Lấy tọa độ mục tiêu camera.
   */
  public getCameraTargetPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraTargetPosition(...args);
  }

  /**
   * [1397] getCameraFocalPoint
   * Lấy tiêu điểm camera.
   */
  public getCameraFocalPoint(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraFocalPoint(...args);
  }

  /**
   * [1398] getCameraNearPlane
   * Lấy mặt phẳng cắt gần camera.
   */
  public getCameraNearPlane(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraNearPlane(...args);
  }

  /**
   * [1399] getCameraFarPlane
   * Lấy mặt phẳng cắt xa camera.
   */
  public getCameraFarPlane(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraFarPlane(...args);
  }

  /**
   * [1400] getCameraFieldOfView
   * Lấy trường nhìn camera.
   */
  public getCameraFieldOfView(...args: any[]): any {
    return (this.cameraViewportUI as any).getCameraFieldOfView(...args);
  }

  /**
   * [1401] calculateCameraDistance
   * Tính khoảng cách camera đến mục tiêu.
   */
  public calculateCameraDistance(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraDistance(...args);
  }

  /**
   * [1402] calculateCameraOrbitPosition
   * Tính vị trí camera quỹ đạo.
   */
  public calculateCameraOrbitPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraOrbitPosition(...args);
  }

  /**
   * [1403] calculateCameraOrbitAngle
   * Tính góc quỹ đạo camera.
   */
  public calculateCameraOrbitAngle(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraOrbitAngle(...args);
  }

  /**
   * [1404] calculateCameraOrbitRadius
   * Tính bán kính quỹ đạo camera.
   */
  public calculateCameraOrbitRadius(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraOrbitRadius(...args);
  }

  /**
   * [1405] calculateCameraLookAt
   * Tính hướng camera nhìn mục tiêu.
   */
  public calculateCameraLookAt(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraLookAt(...args);
  }

  /**
   * [1406] calculateCameraLookAtMatrix
   * Tính ma trận hướng nhìn camera.
   */
  public calculateCameraLookAtMatrix(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraLookAtMatrix(...args);
  }

  /**
   * [1407] calculateCameraViewMatrix
   * Tính ma trận nhìn camera.
   */
  public calculateCameraViewMatrix(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraViewMatrix(...args);
  }

  /**
   * [1408] calculateCameraProjectionMatrix
   * Tính ma trận chiếu camera.
   */
  public calculateCameraProjectionMatrix(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraProjectionMatrix(...args);
  }

  /**
   * [1409] calculateCameraViewProjectionMatrix
   * Tính ma trận nhìn và chiếu.
   */
  public calculateCameraViewProjectionMatrix(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraViewProjectionMatrix(...args);
  }

  /**
   * [1410] calculateCameraFrustum
   * Tính thể tích nhìn camera.
   */
  public calculateCameraFrustum(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraFrustum(...args);
  }

  /**
   * [1411] calculateCameraFrustumPlanes
   * Tính các mặt phẳng của thể tích nhìn.
   */
  public calculateCameraFrustumPlanes(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraFrustumPlanes(...args);
  }

  /**
   * [1412] calculateCameraFrustumCorners
   * Tính các góc của thể tích nhìn.
   */
  public calculateCameraFrustumCorners(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraFrustumCorners(...args);
  }

  /**
   * [1413] calculateCameraVisibility
   * Kiểm tra vật thể có nằm trong tầm nhìn.
   */
  public calculateCameraVisibility(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraVisibility(...args);
  }

  /**
   * [1414] calculateCameraOcclusion
   * Kiểm tra vật thể bị che khuất.
   */
  public calculateCameraOcclusion(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraOcclusion(...args);
  }

  /**
   * [1415] calculateCameraDepth
   * Tính độ sâu vật thể theo camera.
   */
  public calculateCameraDepth(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraDepth(...args);
  }

  /**
   * [1416] calculateCameraScreenPosition
   * Tính vị trí màn hình từ camera.
   */
  public calculateCameraScreenPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraScreenPosition(...args);
  }

  /**
   * [1417] calculateCameraScreenRay
   * Tính tia từ camera qua điểm màn hình.
   */
  public calculateCameraScreenRay(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraScreenRay(...args);
  }

  /**
   * [1418] calculateCameraWorldRay
   * Tính tia trong thế giới từ camera.
   */
  public calculateCameraWorldRay(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraWorldRay(...args);
  }

  /**
   * [1419] calculateCameraPickingRay
   * Tính tia chọn vật thể.
   */
  public calculateCameraPickingRay(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraPickingRay(...args);
  }

  /**
   * [1420] calculateCameraRayIntersection
   * Tính giao điểm tia camera.
   */
  public calculateCameraRayIntersection(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateCameraRayIntersection(...args);
  }

  /**
   * [1421] calculateScreenToWorldRay
   * Chuyển tọa độ màn hình thành tia thế giới.
   */
  public calculateScreenToWorldRay(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenToWorldRay(...args);
  }

  /**
   * [1422] calculateWorldToScreenPosition
   * Chuyển tọa độ thế giới sang màn hình.
   */
  public calculateWorldToScreenPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateWorldToScreenPosition(...args);
  }

  /**
   * [1423] calculateScreenToWorldPosition
   * Chuyển tọa độ màn hình sang thế giới tại độ sâu cho trước.
   */
  public calculateScreenToWorldPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenToWorldPosition(...args);
  }

  /**
   * [1424] calculateViewportAspectRatio
   * Tính tỷ lệ khung hình viewport.
   */
  public calculateViewportAspectRatio(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateViewportAspectRatio(...args);
  }

  /**
   * [1425] calculateViewportCenter
   * Tính tâm viewport.
   */
  public calculateViewportCenter(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateViewportCenter(...args);
  }

  /**
   * [1426] calculateViewportBounds
   * Tính giới hạn viewport.
   */
  public calculateViewportBounds(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateViewportBounds(...args);
  }

  /**
   * [1427] calculateScreenSpaceDistance
   * Tính khoảng cách trên màn hình.
   */
  public calculateScreenSpaceDistance(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceDistance(...args);
  }

  /**
   * [1428] calculateScreenSpaceAngle
   * Tính góc trên màn hình.
   */
  public calculateScreenSpaceAngle(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceAngle(...args);
  }

  /**
   * [1429] calculateScreenSpaceBoundingBox
   * Tính hộp bao 2D của vật thể 3D.
   */
  public calculateScreenSpaceBoundingBox(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceBoundingBox(...args);
  }

  /**
   * [1430] calculateScreenSpaceBoundingSphere
   * Tính hình cầu chiếu lên màn hình.
   */
  public calculateScreenSpaceBoundingSphere(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceBoundingSphere(...args);
  }

  /**
   * [1431] calculateScreenSpaceArea
   * Tính diện tích chiếm trên màn hình.
   */
  public calculateScreenSpaceArea(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceArea(...args);
  }

  /**
   * [1432] calculateScreenSpaceScale
   * Tính tỷ lệ kích thước trên màn hình.
   */
  public calculateScreenSpaceScale(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateScreenSpaceScale(...args);
  }

  /**
   * [1433] calculatePixelDistance
   * Tính khoảng cách theo pixel.
   */
  public calculatePixelDistance(...args: any[]): any {
    return (this.cameraViewportUI as any).calculatePixelDistance(...args);
  }

  /**
   * [1434] calculatePixelPosition
   * Tính vị trí pixel.
   */
  public calculatePixelPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculatePixelPosition(...args);
  }

  /**
   * [1435] calculatePixelToWorldScale
   * Tính tỷ lệ chuyển pixel sang đơn vị thế giới.
   */
  public calculatePixelToWorldScale(...args: any[]): any {
    return (this.cameraViewportUI as any).calculatePixelToWorldScale(...args);
  }

  /**
   * [1436] calculateWorldToPixelScale
   * Tính tỷ lệ chuyển đơn vị thế giới sang pixel.
   */
  public calculateWorldToPixelScale(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateWorldToPixelScale(...args);
  }

  /**
   * [1437] calculateUIAnchorPosition
   * Tính vị trí neo giao diện.
   */
  public calculateUIAnchorPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIAnchorPosition(...args);
  }

  /**
   * [1438] calculateUIWorldAnchor
   * Tính điểm neo giao diện trong thế giới 3D.
   */
  public calculateUIWorldAnchor(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIWorldAnchor(...args);
  }

  /**
   * [1439] calculateUIBillboardRotation
   * Tính góc quay UI hướng về camera.
   */
  public calculateUIBillboardRotation(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIBillboardRotation(...args);
  }

  /**
   * [1440] calculateUIBillboardPosition
   * Tính vị trí UI dạng billboard.
   */
  public calculateUIBillboardPosition(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIBillboardPosition(...args);
  }

  /**
   * [1441] calculateUIFollowTarget
   * Tính vị trí UI bám theo mục tiêu.
   */
  public calculateUIFollowTarget(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIFollowTarget(...args);
  }

  /**
   * [1442] calculateUIFollowOffset
   * Tính độ lệch UI so với mục tiêu.
   */
  public calculateUIFollowOffset(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIFollowOffset(...args);
  }

  /**
   * [1443] calculateUIVisibility
   * Tính trạng thái hiển thị UI.
   */
  public calculateUIVisibility(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIVisibility(...args);
  }

  /**
   * [1444] calculateUIOcclusion
   * Kiểm tra UI bị vật thể che khuất.
   */
  public calculateUIOcclusion(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIOcclusion(...args);
  }

  /**
   * [1445] calculateUIDistanceScale
   * Tính tỷ lệ UI theo khoảng cách.
   */
  public calculateUIDistanceScale(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIDistanceScale(...args);
  }

  /**
   * [1446] calculateUIDepthOrder
   * Tính thứ tự độ sâu UI.
   */
  public calculateUIDepthOrder(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIDepthOrder(...args);
  }

  /**
   * [1447] calculateUIProjectionBounds
   * Tính giới hạn UI sau phép chiếu.
   */
  public calculateUIProjectionBounds(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIProjectionBounds(...args);
  }

  /**
   * [1448] calculateUIInteractionRay
   * Tính tia tương tác UI trong không gian 3D.
   */
  public calculateUIInteractionRay(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIInteractionRay(...args);
  }

  /**
   * [1449] calculateUIHitTest
   * Kiểm tra điểm tương tác có chạm UI.
   */
  public calculateUIHitTest(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIHitTest(...args);
  }

  /**
   * [1450] calculateUIWorldToScreenOffset
   * Tính độ lệch chiếu UI từ thế giới sang màn hình.
   */
  public calculateUIWorldToScreenOffset(...args: any[]): any {
    return (this.cameraViewportUI as any).calculateUIWorldToScreenOffset(...args);
  }

  /**
   * [1451] calculateAABBOverlap
   * Kiểm tra hai hộp AABB có chồng lấn.
   */
  public calculateAABBOverlap(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateAABBOverlap(...args);
  }

  /**
   * [1452] calculateOBBOverlap
   * Kiểm tra hai hộp OBB có chồng lấn.
   */
  public calculateOBBOverlap(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateOBBOverlap(...args);
  }

  /**
   * [1453] calculateSphereOverlap
   * Kiểm tra hai hình cầu có chồng lấn.
   */
  public calculateSphereOverlap(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSphereOverlap(...args);
  }

  /**
   * [1454] calculateCapsuleOverlap
   * Kiểm tra hai capsule có chồng lấn.
   */
  public calculateCapsuleOverlap(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCapsuleOverlap(...args);
  }

  /**
   * [1455] calculateCylinderOverlap
   * Kiểm tra hai hình trụ có chồng lấn.
   */
  public calculateCylinderOverlap(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCylinderOverlap(...args);
  }

  /**
   * [1456] calculatePlaneIntersection
   * Tính giao điểm với mặt phẳng.
   */
  public calculatePlaneIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculatePlaneIntersection(...args);
  }

  /**
   * [1457] calculateRayPlaneIntersection
   * Tính giao điểm tia và mặt phẳng.
   */
  public calculateRayPlaneIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRayPlaneIntersection(...args);
  }

  /**
   * [1458] calculateRaySphereIntersection
   * Tính giao điểm tia và hình cầu.
   */
  public calculateRaySphereIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRaySphereIntersection(...args);
  }

  /**
   * [1459] calculateRayBoxIntersection
   * Tính giao điểm tia và hộp.
   */
  public calculateRayBoxIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRayBoxIntersection(...args);
  }

  /**
   * [1460] calculateRayCapsuleIntersection
   * Tính giao điểm tia và capsule.
   */
  public calculateRayCapsuleIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRayCapsuleIntersection(...args);
  }

  /**
   * [1461] calculateRayTriangleIntersection
   * Tính giao điểm tia và tam giác.
   */
  public calculateRayTriangleIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRayTriangleIntersection(...args);
  }

  /**
   * [1462] calculateSegmentSegmentDistance
   * Tính khoảng cách giữa hai đoạn.
   */
  public calculateSegmentSegmentDistance(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSegmentSegmentDistance(...args);
  }

  /**
   * [1463] calculateSegmentTriangleIntersection
   * Kiểm tra giao nhau giữa đoạn và tam giác.
   */
  public calculateSegmentTriangleIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSegmentTriangleIntersection(...args);
  }

  /**
   * [1464] calculateTriangleTriangleIntersection
   * Kiểm tra giao nhau giữa hai tam giác.
   */
  public calculateTriangleTriangleIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateTriangleTriangleIntersection(...args);
  }

  /**
   * [1465] calculateMeshMeshIntersection
   * Kiểm tra giao nhau giữa hai mesh.
   */
  public calculateMeshMeshIntersection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateMeshMeshIntersection(...args);
  }

  /**
   * [1466] calculateMeshSurfaceDistance
   * Tính khoảng cách giữa các bề mặt mesh.
   */
  public calculateMeshSurfaceDistance(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateMeshSurfaceDistance(...args);
  }

  /**
   * [1467] calculateClosestPointOnTriangle
   * Tìm điểm gần nhất trên tam giác.
   */
  public calculateClosestPointOnTriangle(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnTriangle(...args);
  }

  /**
   * [1468] calculateClosestPointOnSegment
   * Tìm điểm gần nhất trên đoạn.
   */
  public calculateClosestPointOnSegment(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnSegment(...args);
  }

  /**
   * [1469] calculateClosestPointOnPlane
   * Tìm điểm gần nhất trên mặt phẳng.
   */
  public calculateClosestPointOnPlane(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnPlane(...args);
  }

  /**
   * [1470] calculateClosestPointOnSphere
   * Tìm điểm gần nhất trên hình cầu.
   */
  public calculateClosestPointOnSphere(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnSphere(...args);
  }

  /**
   * [1471] calculateClosestPointOnBox
   * Tìm điểm gần nhất trên hộp.
   */
  public calculateClosestPointOnBox(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnBox(...args);
  }

  /**
   * [1472] calculateClosestPointOnCapsule
   * Tìm điểm gần nhất trên capsule.
   */
  public calculateClosestPointOnCapsule(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnCapsule(...args);
  }

  /**
   * [1473] calculateClosestPointOnMesh
   * Tìm điểm gần nhất trên mesh.
   */
  public calculateClosestPointOnMesh(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateClosestPointOnMesh(...args);
  }

  /**
   * [1474] calculateContactManifold
   * Tính tập điểm tiếp xúc va chạm.
   */
  public calculateContactManifold(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateContactManifold(...args);
  }

  /**
   * [1475] calculateCollisionNormal
   * Tính pháp tuyến va chạm.
   */
  public calculateCollisionNormal(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCollisionNormal(...args);
  }

  /**
   * [1476] calculateCollisionDepth
   * Tính độ sâu va chạm.
   */
  public calculateCollisionDepth(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCollisionDepth(...args);
  }

  /**
   * [1477] calculateCollisionTimeOfImpact
   * Tính thời điểm hai vật thể va chạm.
   */
  public calculateCollisionTimeOfImpact(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCollisionTimeOfImpact(...args);
  }

  /**
   * [1478] calculateSweptAABB
   * Tính hộp quét theo chuyển động.
   */
  public calculateSweptAABB(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSweptAABB(...args);
  }

  /**
   * [1479] calculateSweptSphere
   * Tính hình cầu quét theo chuyển động.
   */
  public calculateSweptSphere(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSweptSphere(...args);
  }

  /**
   * [1480] calculateContinuousCollision
   * Kiểm tra va chạm liên tục.
   */
  public calculateContinuousCollision(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateContinuousCollision(...args);
  }

  /**
   * [1481] calculateRigidBodyVelocity
   * Tính vận tốc vật rắn.
   */
  public calculateRigidBodyVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRigidBodyVelocity(...args);
  }

  /**
   * [1482] calculateRigidBodyAcceleration
   * Tính gia tốc vật rắn.
   */
  public calculateRigidBodyAcceleration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRigidBodyAcceleration(...args);
  }

  /**
   * [1483] calculateRigidBodyAngularVelocity
   * Tính vận tốc góc vật rắn.
   */
  public calculateRigidBodyAngularVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRigidBodyAngularVelocity(...args);
  }

  /**
   * [1484] calculateRigidBodyAngularAcceleration
   * Tính gia tốc góc vật rắn.
   */
  public calculateRigidBodyAngularAcceleration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRigidBodyAngularAcceleration(...args);
  }

  /**
   * [1485] calculateRigidBodyMomentum
   * Tính động lượng vật rắn.
   */
  public calculateRigidBodyMomentum(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRigidBodyMomentum(...args);
  }

  /**
   * [1486] calculateAngularMomentum
   * Tính mô-men động lượng.
   */
  public calculateAngularMomentum(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateAngularMomentum(...args);
  }

  /**
   * [1487] calculateImpulse
   * Tính xung lực.
   */
  public calculateImpulse(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateImpulse(...args);
  }

  /**
   * [1488] calculateCollisionImpulse
   * Tính xung lực va chạm.
   */
  public calculateCollisionImpulse(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateCollisionImpulse(...args);
  }

  /**
   * [1489] calculateRestitutionVelocity
   * Tính vận tốc bật lại.
   */
  public calculateRestitutionVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRestitutionVelocity(...args);
  }

  /**
   * [1490] calculateFrictionImpulse
   * Tính xung lực ma sát.
   */
  public calculateFrictionImpulse(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateFrictionImpulse(...args);
  }

  /**
   * [1491] calculateGravityAcceleration
   * Tính gia tốc trọng trường.
   */
  public calculateGravityAcceleration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateGravityAcceleration(...args);
  }

  /**
   * [1492] calculateSpringForce
   * Tính lực đàn hồi lò xo.
   */
  public calculateSpringForce(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateSpringForce(...args);
  }

  /**
   * [1493] calculateDampingForce
   * Tính lực giảm chấn.
   */
  public calculateDampingForce(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateDampingForce(...args);
  }

  /**
   * [1494] calculateConstraintForce
   * Tính lực ràng buộc.
   */
  public calculateConstraintForce(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateConstraintForce(...args);
  }

  /**
   * [1495] calculateConstraintError
   * Tính sai số ràng buộc.
   */
  public calculateConstraintError(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateConstraintError(...args);
  }

  /**
   * [1496] calculatePhysicsIntegration
   * Tính bước tích phân vật lý.
   */
  public calculatePhysicsIntegration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculatePhysicsIntegration(...args);
  }

  /**
   * [1497] calculateVerletIntegration
   * Tính bước tích phân Verlet.
   */
  public calculateVerletIntegration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateVerletIntegration(...args);
  }

  /**
   * [1498] calculateRungeKuttaIntegration
   * Tính bước tích phân Runge–Kutta.
   */
  public calculateRungeKuttaIntegration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateRungeKuttaIntegration(...args);
  }

  /**
   * [1499] calculatePhysicsSubsteps
   * Tính số bước phụ vật lý.
   */
  public calculatePhysicsSubsteps(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculatePhysicsSubsteps(...args);
  }

  /**
   * [1500] calculatePhysicsStability
   * Tính độ ổn định mô phỏng vật lý.
   */
  public calculatePhysicsStability(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculatePhysicsStability(...args);
  }

  /**
   * [1501] getProjectilePosition
   * Lấy tọa độ đạn.
   */
  public getProjectilePosition(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getProjectilePosition(...args);
  }

  /**
   * [1502] getProjectileOrigin
   * Lấy điểm xuất phát đạn.
   */
  public getProjectileOrigin(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getProjectileOrigin(...args);
  }

  /**
   * [1503] getProjectileTarget
   * Lấy điểm mục tiêu của đạn.
   */
  public getProjectileTarget(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getProjectileTarget(...args);
  }

  /**
   * [1504] calculateProjectileDirection
   * Tính hướng bay đạn.
   */
  public calculateProjectileDirection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileDirection(...args);
  }

  /**
   * [1505] calculateProjectileVelocity
   * Tính vận tốc đạn.
   */
  public calculateProjectileVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileVelocity(...args);
  }

  /**
   * [1506] calculateProjectileAcceleration
   * Tính gia tốc đạn.
   */
  public calculateProjectileAcceleration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileAcceleration(...args);
  }

  /**
   * [1507] calculateProjectileTrajectory
   * Tính quỹ đạo đạn.
   */
  public calculateProjectileTrajectory(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileTrajectory(...args);
  }

  /**
   * [1508] calculateProjectileFlightTime
   * Tính thời gian bay đạn.
   */
  public calculateProjectileFlightTime(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileFlightTime(...args);
  }

  /**
   * [1509] calculateProjectileImpactPoint
   * Tính điểm va chạm đạn.
   */
  public calculateProjectileImpactPoint(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileImpactPoint(...args);
  }

  /**
   * [1510] calculateProjectileImpactNormal
   * Tính pháp tuyến tại điểm va chạm đạn.
   */
  public calculateProjectileImpactNormal(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileImpactNormal(...args);
  }

  /**
   * [1511] calculateProjectileSpreadAngle
   * Tính góc tản mát đạn.
   */
  public calculateProjectileSpreadAngle(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileSpreadAngle(...args);
  }

  /**
   * [1512] calculateProjectileDropDistance
   * Tính độ rơi của đạn.
   */
  public calculateProjectileDropDistance(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileDropDistance(...args);
  }

  /**
   * [1513] calculateProjectileWindDrift
   * Tính độ lệch đạn do gió.
   */
  public calculateProjectileWindDrift(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileWindDrift(...args);
  }

  /**
   * [1514] calculateProjectileCollision
   * Kiểm tra va chạm đạn.
   */
  public calculateProjectileCollision(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileCollision(...args);
  }

  /**
   * [1515] calculateProjectileDistanceToTarget
   * Tính khoảng cách đạn đến mục tiêu.
   */
  public calculateProjectileDistanceToTarget(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateProjectileDistanceToTarget(...args);
  }

  /**
   * [1516] getItemPosition
   * Lấy tọa độ vật phẩm.
   */
  public getItemPosition(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getItemPosition(...args);
  }

  /**
   * [1517] getItemCenter
   * Lấy tâm vật phẩm.
   */
  public getItemCenter(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getItemCenter(...args);
  }

  /**
   * [1518] getItemRotation
   * Lấy góc quay vật phẩm.
   */
  public getItemRotation(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getItemRotation(...args);
  }

  /**
   * [1519] getItemPickupPosition
   * Lấy vị trí có thể nhặt vật phẩm.
   */
  public getItemPickupPosition(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).getItemPickupPosition(...args);
  }

  /**
   * [1520] calculateItemDistanceToPlayer
   * Tính khoảng cách vật phẩm đến người chơi.
   */
  public calculateItemDistanceToPlayer(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemDistanceToPlayer(...args);
  }

  /**
   * [1521] calculateItemPickupRange
   * Tính phạm vi nhặt vật phẩm.
   */
  public calculateItemPickupRange(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemPickupRange(...args);
  }

  /**
   * [1522] calculateItemPickupOffset
   * Tính độ lệch vị trí nhặt vật phẩm.
   */
  public calculateItemPickupOffset(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemPickupOffset(...args);
  }

  /**
   * [1523] calculateItemMagnetDirection
   * Tính hướng hút vật phẩm.
   */
  public calculateItemMagnetDirection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemMagnetDirection(...args);
  }

  /**
   * [1524] calculateItemMagnetVelocity
   * Tính vận tốc hút vật phẩm.
   */
  public calculateItemMagnetVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemMagnetVelocity(...args);
  }

  /**
   * [1525] calculateItemHoverHeight
   * Tính độ cao lơ lửng vật phẩm.
   */
  public calculateItemHoverHeight(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemHoverHeight(...args);
  }

  /**
   * [1526] calculateItemRotationSpeed
   * Tính tốc độ quay vật phẩm.
   */
  public calculateItemRotationSpeed(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemRotationSpeed(...args);
  }

  /**
   * [1527] calculateItemBobAmplitude
   * Tính biên độ nhấp nhô vật phẩm.
   */
  public calculateItemBobAmplitude(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemBobAmplitude(...args);
  }

  /**
   * [1528] calculateItemBobFrequency
   * Tính tần số nhấp nhô vật phẩm.
   */
  public calculateItemBobFrequency(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateItemBobFrequency(...args);
  }

  /**
   * [1529] calculateParticlePosition
   * Tính tọa độ hạt hiệu ứng.
   */
  public calculateParticlePosition(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticlePosition(...args);
  }

  /**
   * [1530] calculateParticleVelocity
   * Tính vận tốc hạt hiệu ứng.
   */
  public calculateParticleVelocity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleVelocity(...args);
  }

  /**
   * [1531] calculateParticleAcceleration
   * Tính gia tốc hạt hiệu ứng.
   */
  public calculateParticleAcceleration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleAcceleration(...args);
  }

  /**
   * [1532] calculateParticleLifetime
   * Tính thời gian tồn tại hạt.
   */
  public calculateParticleLifetime(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleLifetime(...args);
  }

  /**
   * [1533] calculateParticleScale
   * Tính tỷ lệ kích thước hạt.
   */
  public calculateParticleScale(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleScale(...args);
  }

  /**
   * [1534] calculateParticleRotation
   * Tính góc quay hạt.
   */
  public calculateParticleRotation(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleRotation(...args);
  }

  /**
   * [1535] calculateParticleColorInterpolation
   * Tính nội suy màu hạt.
   */
  public calculateParticleColorInterpolation(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleColorInterpolation(...args);
  }

  /**
   * [1536] calculateParticleOpacity
   * Tính độ trong suốt hạt.
   */
  public calculateParticleOpacity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleOpacity(...args);
  }

  /**
   * [1537] calculateParticleCollision
   * Kiểm tra va chạm hạt.
   */
  public calculateParticleCollision(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleCollision(...args);
  }

  /**
   * [1538] calculateParticleAttractorForce
   * Tính lực hút tác động lên hạt.
   */
  public calculateParticleAttractorForce(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleAttractorForce(...args);
  }

  /**
   * [1539] calculateParticleFieldDirection
   * Tính hướng trường tác động lên hạt.
   */
  public calculateParticleFieldDirection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateParticleFieldDirection(...args);
  }

  /**
   * [1540] calculateEffectOrigin
   * Tính điểm xuất phát hiệu ứng.
   */
  public calculateEffectOrigin(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectOrigin(...args);
  }

  /**
   * [1541] calculateEffectDirection
   * Tính hướng hiệu ứng.
   */
  public calculateEffectDirection(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectDirection(...args);
  }

  /**
   * [1542] calculateEffectRadius
   * Tính bán kính hiệu ứng.
   */
  public calculateEffectRadius(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectRadius(...args);
  }

  /**
   * [1543] calculateEffectExpansion
   * Tính độ mở rộng hiệu ứng.
   */
  public calculateEffectExpansion(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectExpansion(...args);
  }

  /**
   * [1544] calculateEffectFalloff
   * Tính mức suy giảm hiệu ứng theo khoảng cách.
   */
  public calculateEffectFalloff(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectFalloff(...args);
  }

  /**
   * [1545] calculateEffectDuration
   * Tính thời lượng hiệu ứng.
   */
  public calculateEffectDuration(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectDuration(...args);
  }

  /**
   * [1546] calculateEffectIntensity
   * Tính cường độ hiệu ứng.
   */
  public calculateEffectIntensity(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectIntensity(...args);
  }

  /**
   * [1547] calculateEffectOcclusion
   * Kiểm tra hiệu ứng bị che khuất.
   */
  public calculateEffectOcclusion(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectOcclusion(...args);
  }

  /**
   * [1548] calculateEffectDistanceToCamera
   * Tính khoảng cách hiệu ứng đến camera.
   */
  public calculateEffectDistanceToCamera(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectDistanceToCamera(...args);
  }

  /**
   * [1549] calculateEffectScreenBounds
   * Tính giới hạn hiệu ứng trên màn hình.
   */
  public calculateEffectScreenBounds(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectScreenBounds(...args);
  }

  /**
   * [1550] calculateEffectLOD
   * Tính cấp độ chi tiết hiệu ứng.
   */
  public calculateEffectLOD(...args: any[]): any {
    return (this.physicsCollisionProjectile as any).calculateEffectLOD(...args);
  }

  /**
   * [1551] calculateLinearInterpolation
   * Tính nội suy tuyến tính.
   */
  public calculateLinearInterpolation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLinearInterpolation(...args);
  }

  /**
   * [1552] calculateBilinearInterpolation
   * Tính nội suy song tuyến.
   */
  public calculateBilinearInterpolation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBilinearInterpolation(...args);
  }

  /**
   * [1553] calculateTrilinearInterpolation
   * Tính nội suy tam tuyến.
   */
  public calculateTrilinearInterpolation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrilinearInterpolation(...args);
  }

  /**
   * [1554] calculateCubicInterpolation
   * Tính nội suy bậc ba.
   */
  public calculateCubicInterpolation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCubicInterpolation(...args);
  }

  /**
   * [1555] calculateCatmullRomSpline
   * Tính điểm trên spline Catmull–Rom.
   */
  public calculateCatmullRomSpline(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCatmullRomSpline(...args);
  }

  /**
   * [1556] calculateBezierCurve
   * Tính điểm trên đường cong Bézier.
   */
  public calculateBezierCurve(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBezierCurve(...args);
  }

  /**
   * [1557] calculateQuadraticBezier
   * Tính điểm trên Bézier bậc hai.
   */
  public calculateQuadraticBezier(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateQuadraticBezier(...args);
  }

  /**
   * [1558] calculateCubicBezier
   * Tính điểm trên Bézier bậc ba.
   */
  public calculateCubicBezier(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCubicBezier(...args);
  }

  /**
   * [1559] calculateBezierTangent
   * Tính tiếp tuyến đường Bézier.
   */
  public calculateBezierTangent(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBezierTangent(...args);
  }

  /**
   * [1560] calculateBezierNormal
   * Tính pháp tuyến đường Bézier.
   */
  public calculateBezierNormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBezierNormal(...args);
  }

  /**
   * [1561] calculateBezierCurvature
   * Tính độ cong đường Bézier.
   */
  public calculateBezierCurvature(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBezierCurvature(...args);
  }

  /**
   * [1562] calculateSplinePosition
   * Tính vị trí trên spline.
   */
  public calculateSplinePosition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplinePosition(...args);
  }

  /**
   * [1563] calculateSplineTangent
   * Tính tiếp tuyến spline.
   */
  public calculateSplineTangent(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineTangent(...args);
  }

  /**
   * [1564] calculateSplineNormal
   * Tính pháp tuyến spline.
   */
  public calculateSplineNormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineNormal(...args);
  }

  /**
   * [1565] calculateSplineBinormal
   * Tính nhị pháp tuyến spline.
   */
  public calculateSplineBinormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineBinormal(...args);
  }

  /**
   * [1566] calculateSplineCurvature
   * Tính độ cong spline.
   */
  public calculateSplineCurvature(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineCurvature(...args);
  }

  /**
   * [1567] calculateSplineArcLength
   * Tính độ dài cung spline.
   */
  public calculateSplineArcLength(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineArcLength(...args);
  }

  /**
   * [1568] calculateSplineParameterAtDistance
   * Tính tham số spline theo khoảng cách.
   */
  public calculateSplineParameterAtDistance(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineParameterAtDistance(...args);
  }

  /**
   * [1569] calculateSplineClosestPoint
   * Tìm điểm gần nhất trên spline.
   */
  public calculateSplineClosestPoint(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineClosestPoint(...args);
  }

  /**
   * [1570] calculateSplineProjection
   * Chiếu điểm lên spline.
   */
  public calculateSplineProjection(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineProjection(...args);
  }

  /**
   * [1571] calculateSplineUniformSampling
   * Lấy mẫu spline đồng đều.
   */
  public calculateSplineUniformSampling(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineUniformSampling(...args);
  }

  /**
   * [1572] calculateSplineFrame
   * Tính hệ trục cục bộ trên spline.
   */
  public calculateSplineFrame(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSplineFrame(...args);
  }

  /**
   * [1573] calculateTrajectoryPosition
   * Tính vị trí trên quỹ đạo.
   */
  public calculateTrajectoryPosition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryPosition(...args);
  }

  /**
   * [1574] calculateTrajectoryVelocity
   * Tính vận tốc trên quỹ đạo.
   */
  public calculateTrajectoryVelocity(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryVelocity(...args);
  }

  /**
   * [1575] calculateTrajectoryAcceleration
   * Tính gia tốc trên quỹ đạo.
   */
  public calculateTrajectoryAcceleration(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryAcceleration(...args);
  }

  /**
   * [1576] calculateTrajectoryCurvature
   * Tính độ cong quỹ đạo.
   */
  public calculateTrajectoryCurvature(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryCurvature(...args);
  }

  /**
   * [1577] calculateTrajectoryTangent
   * Tính tiếp tuyến quỹ đạo.
   */
  public calculateTrajectoryTangent(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryTangent(...args);
  }

  /**
   * [1578] calculateTrajectoryNormal
   * Tính pháp tuyến quỹ đạo.
   */
  public calculateTrajectoryNormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryNormal(...args);
  }

  /**
   * [1579] calculateTrajectoryBinormal
   * Tính nhị pháp tuyến quỹ đạo.
   */
  public calculateTrajectoryBinormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryBinormal(...args);
  }

  /**
   * [1580] calculateTrajectoryClosestPoint
   * Tìm điểm gần nhất trên quỹ đạo.
   */
  public calculateTrajectoryClosestPoint(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryClosestPoint(...args);
  }

  /**
   * [1581] calculateTrajectoryDeviation
   * Tính sai lệch quỹ đạo.
   */
  public calculateTrajectoryDeviation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryDeviation(...args);
  }

  /**
   * [1582] calculateTrajectoryLength
   * Tính tổng độ dài quỹ đạo.
   */
  public calculateTrajectoryLength(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryLength(...args);
  }

  /**
   * [1583] calculateTrajectoryDuration
   * Tính thời lượng quỹ đạo.
   */
  public calculateTrajectoryDuration(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryDuration(...args);
  }

  /**
   * [1584] calculateTrajectorySpeedProfile
   * Tính biểu đồ tốc độ quỹ đạo.
   */
  public calculateTrajectorySpeedProfile(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectorySpeedProfile(...args);
  }

  /**
   * [1585] calculateTrajectoryTimeParameterization
   * Tính tham số thời gian quỹ đạo.
   */
  public calculateTrajectoryTimeParameterization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryTimeParameterization(...args);
  }

  /**
   * [1586] calculateTrajectorySmoothing
   * Làm mượt quỹ đạo.
   */
  public calculateTrajectorySmoothing(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectorySmoothing(...args);
  }

  /**
   * [1587] calculateTrajectoryOptimization
   * Tối ưu quỹ đạo.
   */
  public calculateTrajectoryOptimization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryOptimization(...args);
  }

  /**
   * [1588] calculateTrajectoryCollisionAvoidance
   * Tính quỹ đạo tránh va chạm.
   */
  public calculateTrajectoryCollisionAvoidance(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryCollisionAvoidance(...args);
  }

  /**
   * [1589] calculateTrajectoryReachability
   * Kiểm tra khả năng đạt quỹ đạo.
   */
  public calculateTrajectoryReachability(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryReachability(...args);
  }

  /**
   * [1590] calculateTrajectoryPrediction
   * Dự đoán quỹ đạo tương lai.
   */
  public calculateTrajectoryPrediction(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTrajectoryPrediction(...args);
  }

  /**
   * [1591] calculateMatrixMultiplication
   * Tính phép nhân ma trận.
   */
  public calculateMatrixMultiplication(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixMultiplication(...args);
  }

  /**
   * [1592] calculateMatrixInverse
   * Tính ma trận nghịch đảo.
   */
  public calculateMatrixInverse(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixInverse(...args);
  }

  /**
   * [1593] calculateMatrixTranspose
   * Tính ma trận chuyển vị.
   */
  public calculateMatrixTranspose(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixTranspose(...args);
  }

  /**
   * [1594] calculateMatrixDeterminant
   * Tính định thức ma trận.
   */
  public calculateMatrixDeterminant(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixDeterminant(...args);
  }

  /**
   * [1595] calculateMatrixTrace
   * Tính vết ma trận.
   */
  public calculateMatrixTrace(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixTrace(...args);
  }

  /**
   * [1596] calculateMatrixDecomposition
   * Phân rã ma trận.
   */
  public calculateMatrixDecomposition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixDecomposition(...args);
  }

  /**
   * [1597] calculateMatrixOrthogonalization
   * Trực giao hóa ma trận.
   */
  public calculateMatrixOrthogonalization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixOrthogonalization(...args);
  }

  /**
   * [1598] calculateMatrixOrthonormalization
   * Chuẩn trực giao ma trận.
   */
  public calculateMatrixOrthonormalization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMatrixOrthonormalization(...args);
  }

  /**
   * [1599] calculateAffineTransform
   * Tính phép biến đổi affine.
   */
  public calculateAffineTransform(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateAffineTransform(...args);
  }

  /**
   * [1600] calculateHomogeneousTransform
   * Tính phép biến đổi tọa độ thuần nhất.
   */
  public calculateHomogeneousTransform(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateHomogeneousTransform(...args);
  }

  /**
   * [1601] calculateTranslationMatrix
   * Tính ma trận tịnh tiến.
   */
  public calculateTranslationMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTranslationMatrix(...args);
  }

  /**
   * [1602] calculateScaleMatrix
   * Tính ma trận tỷ lệ.
   */
  public calculateScaleMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateScaleMatrix(...args);
  }

  /**
   * [1603] calculateRotationXMatrix
   * Tính ma trận quay quanh trục X.
   */
  public calculateRotationXMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateRotationXMatrix(...args);
  }

  /**
   * [1604] calculateRotationYMatrix
   * Tính ma trận quay quanh trục Y.
   */
  public calculateRotationYMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateRotationYMatrix(...args);
  }

  /**
   * [1605] calculateRotationZMatrix
   * Tính ma trận quay quanh trục Z.
   */
  public calculateRotationZMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateRotationZMatrix(...args);
  }

  /**
   * [1606] calculateNormalMatrix
   * Tính ma trận pháp tuyến.
   */
  public calculateNormalMatrix(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateNormalMatrix(...args);
  }

  /**
   * [1607] calculateTransformHierarchy
   * Tính chuỗi biến đổi phân cấp.
   */
  public calculateTransformHierarchy(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformHierarchy(...args);
  }

  /**
   * [1608] calculateTransformComposition
   * Tính phép hợp thành biến đổi.
   */
  public calculateTransformComposition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformComposition(...args);
  }

  /**
   * [1609] calculateTransformDecomposition
   * Tách phép biến đổi thành thành phần.
   */
  public calculateTransformDecomposition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformDecomposition(...args);
  }

  /**
   * [1610] calculateTransformInterpolation
   * Nội suy phép biến đổi.
   */
  public calculateTransformInterpolation(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformInterpolation(...args);
  }

  /**
   * [1611] calculateTransformError
   * Tính sai lệch phép biến đổi.
   */
  public calculateTransformError(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformError(...args);
  }

  /**
   * [1612] calculateCoordinateBasis
   * Tính cơ sở tọa độ.
   */
  public calculateCoordinateBasis(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateBasis(...args);
  }

  /**
   * [1613] calculateCoordinateConversion
   * Chuyển đổi hệ tọa độ.
   */
  public calculateCoordinateConversion(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateConversion(...args);
  }

  /**
   * [1614] calculateCoordinateNormalization
   * Chuẩn hóa tọa độ.
   */
  public calculateCoordinateNormalization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateNormalization(...args);
  }

  /**
   * [1615] calculateCoordinateQuantization
   * Lượng tử hóa tọa độ.
   */
  public calculateCoordinateQuantization(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateQuantization(...args);
  }

  /**
   * [1616] calculateCoordinateClamping
   * Giới hạn tọa độ.
   */
  public calculateCoordinateClamping(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateClamping(...args);
  }

  /**
   * [1617] calculateCoordinateWrapping
   * Cuộn tọa độ theo chu kỳ.
   */
  public calculateCoordinateWrapping(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateWrapping(...args);
  }

  /**
   * [1618] calculateCoordinateSnapping
   * Căn tọa độ theo lưới.
   */
  public calculateCoordinateSnapping(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateSnapping(...args);
  }

  /**
   * [1619] calculateCoordinateRounding
   * Làm tròn tọa độ.
   */
  public calculateCoordinateRounding(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinateRounding(...args);
  }

  /**
   * [1620] calculateCoordinatePrecisionError
   * Tính sai số độ chính xác tọa độ.
   */
  public calculateCoordinatePrecisionError(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCoordinatePrecisionError(...args);
  }

  /**
   * [1621] getGridCellPosition
   * Lấy tọa độ ô lưới.
   */
  public getGridCellPosition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).getGridCellPosition(...args);
  }

  /**
   * [1622] getGridCellCenter
   * Lấy tâm ô lưới.
   */
  public getGridCellCenter(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).getGridCellCenter(...args);
  }

  /**
   * [1623] getGridCellBounds
   * Lấy giới hạn ô lưới.
   */
  public getGridCellBounds(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).getGridCellBounds(...args);
  }

  /**
   * [1624] calculateGridCellIndex
   * Tính chỉ số ô lưới.
   */
  public calculateGridCellIndex(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridCellIndex(...args);
  }

  /**
   * [1625] calculateGridCoordinates
   * Tính tọa độ lưới.
   */
  public calculateGridCoordinates(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridCoordinates(...args);
  }

  /**
   * [1626] calculateGridDistance
   * Tính khoảng cách trên lưới.
   */
  public calculateGridDistance(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridDistance(...args);
  }

  /**
   * [1627] calculateGridNeighborCells
   * Tìm các ô lân cận.
   */
  public calculateGridNeighborCells(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridNeighborCells(...args);
  }

  /**
   * [1628] calculateGridWorldPosition
   * Chuyển ô lưới sang tọa độ thế giới.
   */
  public calculateGridWorldPosition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridWorldPosition(...args);
  }

  /**
   * [1629] calculateGridWorldToCell
   * Chuyển tọa độ thế giới sang ô lưới.
   */
  public calculateGridWorldToCell(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridWorldToCell(...args);
  }

  /**
   * [1630] calculateGridOccupancy
   * Tính trạng thái chiếm dụng lưới.
   */
  public calculateGridOccupancy(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridOccupancy(...args);
  }

  /**
   * [1631] calculateGridTraversalCost
   * Tính chi phí đi qua ô lưới.
   */
  public calculateGridTraversalCost(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridTraversalCost(...args);
  }

  /**
   * [1632] calculateGridPathDistance
   * Tính độ dài đường đi trên lưới.
   */
  public calculateGridPathDistance(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateGridPathDistance(...args);
  }

  /**
   * [1633] calculateTerrainHeight
   * Tính độ cao địa hình.
   */
  public calculateTerrainHeight(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainHeight(...args);
  }

  /**
   * [1634] calculateTerrainNormal
   * Tính pháp tuyến địa hình.
   */
  public calculateTerrainNormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainNormal(...args);
  }

  /**
   * [1635] calculateTerrainSlope
   * Tính độ dốc địa hình.
   */
  public calculateTerrainSlope(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainSlope(...args);
  }

  /**
   * [1636] calculateTerrainCurvature
   * Tính độ cong địa hình.
   */
  public calculateTerrainCurvature(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainCurvature(...args);
  }

  /**
   * [1637] calculateTerrainSurfaceArea
   * Tính diện tích bề mặt địa hình.
   */
  public calculateTerrainSurfaceArea(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainSurfaceArea(...args);
  }

  /**
   * [1638] calculateTerrainVolume
   * Tính thể tích địa hình.
   */
  public calculateTerrainVolume(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainVolume(...args);
  }

  /**
   * [1639] calculateTerrainBounds
   * Tính giới hạn địa hình.
   */
  public calculateTerrainBounds(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainBounds(...args);
  }

  /**
   * [1640] calculateTerrainClosestPoint
   * Tìm điểm gần nhất trên địa hình.
   */
  public calculateTerrainClosestPoint(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainClosestPoint(...args);
  }

  /**
   * [1641] calculateTerrainRayIntersection
   * Tính giao điểm tia với địa hình.
   */
  public calculateTerrainRayIntersection(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainRayIntersection(...args);
  }

  /**
   * [1642] calculateTerrainCollision
   * Kiểm tra va chạm địa hình.
   */
  public calculateTerrainCollision(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainCollision(...args);
  }

  /**
   * [1643] calculateTerrainGroundClearance
   * Tính khoảng cách đến địa hình.
   */
  public calculateTerrainGroundClearance(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainGroundClearance(...args);
  }

  /**
   * [1644] calculateTerrainPathSlope
   * Tính độ dốc đường đi trên địa hình.
   */
  public calculateTerrainPathSlope(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainPathSlope(...args);
  }

  /**
   * [1645] calculateTerrainNavigationCost
   * Tính chi phí điều hướng trên địa hình.
   */
  public calculateTerrainNavigationCost(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTerrainNavigationCost(...args);
  }

  /**
   * [1646] calculateWaterSurfaceHeight
   * Tính độ cao mặt nước.
   */
  public calculateWaterSurfaceHeight(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateWaterSurfaceHeight(...args);
  }

  /**
   * [1647] calculateWaterSurfaceNormal
   * Tính pháp tuyến mặt nước.
   */
  public calculateWaterSurfaceNormal(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateWaterSurfaceNormal(...args);
  }

  /**
   * [1648] calculateWaterDepth
   * Tính độ sâu nước.
   */
  public calculateWaterDepth(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateWaterDepth(...args);
  }

  /**
   * [1649] calculateWaterBuoyancy
   * Tính lực nổi trong nước.
   */
  public calculateWaterBuoyancy(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateWaterBuoyancy(...args);
  }

  /**
   * [1650] calculateEnvironmentWindVector
   * Tính vector gió môi trường.
   */
  public calculateEnvironmentWindVector(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateEnvironmentWindVector(...args);
  }

  /**
   * [1651] calculateObjectLOD
   * Tính cấp độ chi tiết vật thể.
   */
  public calculateObjectLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateObjectLOD(...args);
  }

  /**
   * [1652] calculateCharacterLOD
   * Tính cấp độ chi tiết nhân vật.
   */
  public calculateCharacterLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCharacterLOD(...args);
  }

  /**
   * [1653] calculateMeshLOD
   * Tính cấp độ chi tiết mesh.
   */
  public calculateMeshLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateMeshLOD(...args);
  }

  /**
   * [1654] calculateAnimationLOD
   * Tính cấp độ chi tiết hoạt ảnh.
   */
  public calculateAnimationLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateAnimationLOD(...args);
  }

  /**
   * [1655] calculateSkeletonLOD
   * Tính cấp độ chi tiết bộ xương.
   */
  public calculateSkeletonLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSkeletonLOD(...args);
  }

  /**
   * [1656] calculateShadowLOD
   * Tính cấp độ chi tiết bóng.
   */
  public calculateShadowLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateShadowLOD(...args);
  }

  /**
   * [1657] calculateParticleLOD
   * Tính cấp độ chi tiết hệ hạt.
   */
  public calculateParticleLOD(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateParticleLOD(...args);
  }

  /**
   * [1658] calculateLODTransition
   * Tính chuyển tiếp giữa các cấp LOD.
   */
  public calculateLODTransition(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODTransition(...args);
  }

  /**
   * [1659] calculateLODThreshold
   * Tính ngưỡng đổi LOD.
   */
  public calculateLODThreshold(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODThreshold(...args);
  }

  /**
   * [1660] calculateLODScreenSize
   * Tính kích thước chiếu trên màn hình.
   */
  public calculateLODScreenSize(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODScreenSize(...args);
  }

  /**
   * [1661] calculateLODProjectedError
   * Tính sai số chiếu LOD.
   */
  public calculateLODProjectedError(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODProjectedError(...args);
  }

  /**
   * [1662] calculateLODVisibility
   * Tính khả năng hiển thị LOD.
   */
  public calculateLODVisibility(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODVisibility(...args);
  }

  /**
   * [1663] calculateLODUpdateFrequency
   * Tính tần suất cập nhật LOD.
   */
  public calculateLODUpdateFrequency(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODUpdateFrequency(...args);
  }

  /**
   * [1664] calculateLODSelectionScore
   * Tính điểm chọn LOD.
   */
  public calculateLODSelectionScore(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateLODSelectionScore(...args);
  }

  /**
   * [1665] calculateOcclusionBounds
   * Tính giới hạn vật thể để kiểm tra che khuất.
   */
  public calculateOcclusionBounds(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateOcclusionBounds(...args);
  }

  /**
   * [1666] calculateOcclusionVisibility
   * Tính khả năng nhìn thấy sau kiểm tra che khuất.
   */
  public calculateOcclusionVisibility(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateOcclusionVisibility(...args);
  }

  /**
   * [1667] calculateFrustumCulling
   * Kiểm tra loại bỏ vật thể ngoài thể tích nhìn.
   */
  public calculateFrustumCulling(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateFrustumCulling(...args);
  }

  /**
   * [1668] calculateDistanceCulling
   * Kiểm tra loại bỏ vật thể theo khoảng cách.
   */
  public calculateDistanceCulling(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateDistanceCulling(...args);
  }

  /**
   * [1669] calculateScreenSizeCulling
   * Kiểm tra loại bỏ vật thể theo kích thước màn hình.
   */
  public calculateScreenSizeCulling(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateScreenSizeCulling(...args);
  }

  /**
   * [1670] calculateAnimationUpdatePriority
   * Tính ưu tiên cập nhật hoạt ảnh.
   */
  public calculateAnimationUpdatePriority(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateAnimationUpdatePriority(...args);
  }

  /**
   * [1671] calculateBoneUpdatePriority
   * Tính ưu tiên cập nhật xương.
   */
  public calculateBoneUpdatePriority(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBoneUpdatePriority(...args);
  }

  /**
   * [1672] calculatePhysicsUpdatePriority
   * Tính ưu tiên cập nhật vật lý.
   */
  public calculatePhysicsUpdatePriority(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculatePhysicsUpdatePriority(...args);
  }

  /**
   * [1673] calculateCollisionUpdatePriority
   * Tính ưu tiên cập nhật va chạm.
   */
  public calculateCollisionUpdatePriority(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateCollisionUpdatePriority(...args);
  }

  /**
   * [1674] calculateSpatialUpdateFrequency
   * Tính tần suất cập nhật không gian.
   */
  public calculateSpatialUpdateFrequency(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSpatialUpdateFrequency(...args);
  }

  /**
   * [1675] calculateTransformUpdateFrequency
   * Tính tần suất cập nhật biến đổi.
   */
  public calculateTransformUpdateFrequency(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateTransformUpdateFrequency(...args);
  }

  /**
   * [1676] calculateBoundingVolumeUpdate
   * Cập nhật thể tích bao.
   */
  public calculateBoundingVolumeUpdate(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBoundingVolumeUpdate(...args);
  }

  /**
   * [1677] calculateSpatialPartitionIndex
   * Tính chỉ số phân vùng không gian.
   */
  public calculateSpatialPartitionIndex(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateSpatialPartitionIndex(...args);
  }

  /**
   * [1678] calculateOctreeNode
   * Tính nút octree chứa vị trí.
   */
  public calculateOctreeNode(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateOctreeNode(...args);
  }

  /**
   * [1679] calculateQuadtreeNode
   * Tính nút quadtree chứa vị trí.
   */
  public calculateQuadtreeNode(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateQuadtreeNode(...args);
  }

  /**
   * [1680] calculateBVHTraversalCost
   * Tính chi phí duyệt cây BVH.
   */
  public calculateBVHTraversalCost(...args: any[]): any {
    return (this.curvesMatricesEnvironment as any).calculateBVHTraversalCost(...args);
  }

  /**
   * [1681] getClothingPosition
   * Lấy tọa độ trang phục.
   */
  public getClothingPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getClothingPosition(...args);
  }

  /**
   * [1682] getClothingAnchor
   * Lấy điểm neo trang phục.
   */
  public getClothingAnchor(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getClothingAnchor(...args);
  }

  /**
   * [1683] getClothingSurfacePosition
   * Lấy tọa độ trên bề mặt trang phục.
   */
  public getClothingSurfacePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getClothingSurfacePosition(...args);
  }

  /**
   * [1684] getClothingVertexPosition
   * Lấy tọa độ đỉnh lưới trang phục.
   */
  public getClothingVertexPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getClothingVertexPosition(...args);
  }

  /**
   * [1685] calculateClothingFitOffset
   * Tính độ lệch trang phục theo cơ thể.
   */
  public calculateClothingFitOffset(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingFitOffset(...args);
  }

  /**
   * [1686] calculateClothingBodyDistance
   * Tính khoảng cách trang phục đến cơ thể.
   */
  public calculateClothingBodyDistance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingBodyDistance(...args);
  }

  /**
   * [1687] calculateClothingPenetration
   * Tính độ xuyên trang phục vào cơ thể.
   */
  public calculateClothingPenetration(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingPenetration(...args);
  }

  /**
   * [1688] calculateClothingCollision
   * Kiểm tra va chạm trang phục.
   */
  public calculateClothingCollision(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingCollision(...args);
  }

  /**
   * [1689] calculateClothingDeformation
   * Tính biến dạng trang phục.
   */
  public calculateClothingDeformation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingDeformation(...args);
  }

  /**
   * [1690] calculateClothingWrinkleCurvature
   * Tính độ cong nếp nhăn trang phục.
   */
  public calculateClothingWrinkleCurvature(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingWrinkleCurvature(...args);
  }

  /**
   * [1691] calculateClothingCenterOfMass
   * Tính tâm khối lượng trang phục.
   */
  public calculateClothingCenterOfMass(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingCenterOfMass(...args);
  }

  /**
   * [1692] calculateClothingBoundingBox
   * Tính hộp bao trang phục.
   */
  public calculateClothingBoundingBox(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateClothingBoundingBox(...args);
  }

  /**
   * [1693] getHelmetPosition
   * Lấy tọa độ mũ bảo hiểm.
   */
  public getHelmetPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getHelmetPosition(...args);
  }

  /**
   * [1694] getHelmetAnchor
   * Lấy điểm neo mũ bảo hiểm.
   */
  public getHelmetAnchor(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getHelmetAnchor(...args);
  }

  /**
   * [1695] calculateHelmetHeadOffset
   * Tính độ lệch mũ so với đầu.
   */
  public calculateHelmetHeadOffset(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateHelmetHeadOffset(...args);
  }

  /**
   * [1696] calculateHelmetOrientation
   * Tính hướng mũ bảo hiểm.
   */
  public calculateHelmetOrientation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateHelmetOrientation(...args);
  }

  /**
   * [1697] calculateHelmetCollision
   * Kiểm tra va chạm mũ bảo hiểm.
   */
  public calculateHelmetCollision(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateHelmetCollision(...args);
  }

  /**
   * [1698] getGlassesPosition
   * Lấy tọa độ kính.
   */
  public getGlassesPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getGlassesPosition(...args);
  }

  /**
   * [1699] calculateGlassesEyeAlignment
   * Tính độ căn chỉnh kính với mắt.
   */
  public calculateGlassesEyeAlignment(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateGlassesEyeAlignment(...args);
  }

  /**
   * [1700] calculateGlassesHeadOffset
   * Tính độ lệch kính so với đầu.
   */
  public calculateGlassesHeadOffset(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateGlassesHeadOffset(...args);
  }

  /**
   * [1701] getBackpackPosition
   * Lấy tọa độ ba lô.
   */
  public getBackpackPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBackpackPosition(...args);
  }

  /**
   * [1702] calculateBackpackSpineOffset
   * Tính độ lệch ba lô so với cột sống.
   */
  public calculateBackpackSpineOffset(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBackpackSpineOffset(...args);
  }

  /**
   * [1703] calculateBackpackCenterOfMass
   * Tính tâm khối lượng ba lô.
   */
  public calculateBackpackCenterOfMass(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBackpackCenterOfMass(...args);
  }

  /**
   * [1704] calculateBackpackSwing
   * Tính độ vung ba lô.
   */
  public calculateBackpackSwing(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBackpackSwing(...args);
  }

  /**
   * [1705] getWeaponPosition
   * Lấy tọa độ vũ khí.
   */
  public getWeaponPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWeaponPosition(...args);
  }

  /**
   * [1706] getWeaponGripPosition
   * Lấy tọa độ điểm nắm vũ khí.
   */
  public getWeaponGripPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWeaponGripPosition(...args);
  }

  /**
   * [1707] getWeaponMuzzlePosition
   * Lấy tọa độ đầu nòng vũ khí.
   */
  public getWeaponMuzzlePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWeaponMuzzlePosition(...args);
  }

  /**
   * [1708] getWeaponStockPosition
   * Lấy tọa độ báng vũ khí.
   */
  public getWeaponStockPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWeaponStockPosition(...args);
  }

  /**
   * [1709] calculateWeaponAimDirection
   * Tính hướng ngắm vũ khí.
   */
  public calculateWeaponAimDirection(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponAimDirection(...args);
  }

  /**
   * [1710] calculateWeaponHandAlignment
   * Tính độ căn chỉnh vũ khí với bàn tay.
   */
  public calculateWeaponHandAlignment(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponHandAlignment(...args);
  }

  /**
   * [1711] calculateWeaponRecoilOffset
   * Tính độ lệch do giật vũ khí.
   */
  public calculateWeaponRecoilOffset(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponRecoilOffset(...args);
  }

  /**
   * [1712] calculateWeaponRecoilRotation
   * Tính góc quay do giật vũ khí.
   */
  public calculateWeaponRecoilRotation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponRecoilRotation(...args);
  }

  /**
   * [1713] calculateWeaponMuzzleDirection
   * Tính hướng đầu nòng vũ khí.
   */
  public calculateWeaponMuzzleDirection(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponMuzzleDirection(...args);
  }

  /**
   * [1714] calculateWeaponCollision
   * Kiểm tra va chạm vũ khí.
   */
  public calculateWeaponCollision(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeaponCollision(...args);
  }

  /**
   * [1715] getShieldPosition
   * Lấy tọa độ khiên.
   */
  public getShieldPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getShieldPosition(...args);
  }

  /**
   * [1716] getShieldCenter
   * Lấy tâm khiên.
   */
  public getShieldCenter(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getShieldCenter(...args);
  }

  /**
   * [1717] calculateShieldOrientation
   * Tính hướng khiên.
   */
  public calculateShieldOrientation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateShieldOrientation(...args);
  }

  /**
   * [1718] calculateShieldSurfaceNormal
   * Tính pháp tuyến bề mặt khiên.
   */
  public calculateShieldSurfaceNormal(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateShieldSurfaceNormal(...args);
  }

  /**
   * [1719] calculateShieldCoverageAngle
   * Tính góc che chắn của khiên.
   */
  public calculateShieldCoverageAngle(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateShieldCoverageAngle(...args);
  }

  /**
   * [1720] calculateShieldCollision
   * Kiểm tra va chạm khiên.
   */
  public calculateShieldCollision(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateShieldCollision(...args);
  }

  /**
   * [1721] getVehiclePosition
   * Lấy tọa độ phương tiện.
   */
  public getVehiclePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehiclePosition(...args);
  }

  /**
   * [1722] getVehicleCenter
   * Lấy tâm phương tiện.
   */
  public getVehicleCenter(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleCenter(...args);
  }

  /**
   * [1723] getVehicleFrontPosition
   * Lấy tọa độ đầu phương tiện.
   */
  public getVehicleFrontPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleFrontPosition(...args);
  }

  /**
   * [1724] getVehicleRearPosition
   * Lấy tọa độ đuôi phương tiện.
   */
  public getVehicleRearPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleRearPosition(...args);
  }

  /**
   * [1725] getVehicleLeftPosition
   * Lấy tọa độ bên trái phương tiện.
   */
  public getVehicleLeftPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleLeftPosition(...args);
  }

  /**
   * [1726] getVehicleRightPosition
   * Lấy tọa độ bên phải phương tiện.
   */
  public getVehicleRightPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleRightPosition(...args);
  }

  /**
   * [1727] getVehicleRoofPosition
   * Lấy tọa độ nóc phương tiện.
   */
  public getVehicleRoofPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleRoofPosition(...args);
  }

  /**
   * [1728] getVehicleUndersidePosition
   * Lấy tọa độ gầm phương tiện.
   */
  public getVehicleUndersidePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleUndersidePosition(...args);
  }

  /**
   * [1729] getVehicleWheelPosition
   * Lấy tọa độ bánh xe.
   */
  public getVehicleWheelPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleWheelPosition(...args);
  }

  /**
   * [1730] getVehicleAxlePosition
   * Lấy tọa độ trục bánh xe.
   */
  public getVehicleAxlePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getVehicleAxlePosition(...args);
  }

  /**
   * [1731] calculateVehicleLength
   * Tính chiều dài phương tiện.
   */
  public calculateVehicleLength(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleLength(...args);
  }

  /**
   * [1732] calculateVehicleWidth
   * Tính chiều rộng phương tiện.
   */
  public calculateVehicleWidth(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleWidth(...args);
  }

  /**
   * [1733] calculateVehicleHeight
   * Tính chiều cao phương tiện.
   */
  public calculateVehicleHeight(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleHeight(...args);
  }

  /**
   * [1734] calculateVehicleWheelbase
   * Tính chiều dài cơ sở phương tiện.
   */
  public calculateVehicleWheelbase(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleWheelbase(...args);
  }

  /**
   * [1735] calculateVehicleTrackWidth
   * Tính chiều rộng vệt bánh xe.
   */
  public calculateVehicleTrackWidth(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleTrackWidth(...args);
  }

  /**
   * [1736] calculateVehicleTurningRadius
   * Tính bán kính quay vòng phương tiện.
   */
  public calculateVehicleTurningRadius(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleTurningRadius(...args);
  }

  /**
   * [1737] calculateVehicleTurningAngle
   * Tính góc đánh lái phương tiện.
   */
  public calculateVehicleTurningAngle(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleTurningAngle(...args);
  }

  /**
   * [1738] calculateVehicleSpeed
   * Tính tốc độ phương tiện.
   */
  public calculateVehicleSpeed(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleSpeed(...args);
  }

  /**
   * [1739] calculateVehicleAcceleration
   * Tính gia tốc phương tiện.
   */
  public calculateVehicleAcceleration(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleAcceleration(...args);
  }

  /**
   * [1740] calculateVehicleBrakingDistance
   * Tính quãng đường phanh phương tiện.
   */
  public calculateVehicleBrakingDistance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleBrakingDistance(...args);
  }

  /**
   * [1741] calculateVehicleStoppingTime
   * Tính thời gian dừng phương tiện.
   */
  public calculateVehicleStoppingTime(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleStoppingTime(...args);
  }

  /**
   * [1742] calculateVehicleHeading
   * Tính hướng phương tiện.
   */
  public calculateVehicleHeading(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleHeading(...args);
  }

  /**
   * [1743] calculateVehicleYawRate
   * Tính tốc độ quay hướng phương tiện.
   */
  public calculateVehicleYawRate(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleYawRate(...args);
  }

  /**
   * [1744] calculateVehiclePitchAngle
   * Tính góc chúi/ngẩng phương tiện.
   */
  public calculateVehiclePitchAngle(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehiclePitchAngle(...args);
  }

  /**
   * [1745] calculateVehicleRollAngle
   * Tính góc nghiêng ngang phương tiện.
   */
  public calculateVehicleRollAngle(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleRollAngle(...args);
  }

  /**
   * [1746] calculateVehicleGroundClearance
   * Tính khoảng sáng gầm phương tiện.
   */
  public calculateVehicleGroundClearance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleGroundClearance(...args);
  }

  /**
   * [1747] calculateVehicleCenterOfMass
   * Tính tâm khối lượng phương tiện.
   */
  public calculateVehicleCenterOfMass(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleCenterOfMass(...args);
  }

  /**
   * [1748] calculateVehicleCollisionBounds
   * Tính giới hạn va chạm phương tiện.
   */
  public calculateVehicleCollisionBounds(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleCollisionBounds(...args);
  }

  /**
   * [1749] calculateVehiclePathCurvature
   * Tính độ cong đường đi phương tiện.
   */
  public calculateVehiclePathCurvature(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehiclePathCurvature(...args);
  }

  /**
   * [1750] calculateVehicleWheelRotation
   * Tính góc quay bánh xe.
   */
  public calculateVehicleWheelRotation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateVehicleWheelRotation(...args);
  }

  /**
   * [1751] getBuildingPosition
   * Lấy tọa độ công trình.
   */
  public getBuildingPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBuildingPosition(...args);
  }

  /**
   * [1752] getBuildingCenter
   * Lấy tâm công trình.
   */
  public getBuildingCenter(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBuildingCenter(...args);
  }

  /**
   * [1753] getBuildingBasePosition
   * Lấy tọa độ đáy công trình.
   */
  public getBuildingBasePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBuildingBasePosition(...args);
  }

  /**
   * [1754] getBuildingTopPosition
   * Lấy tọa độ đỉnh công trình.
   */
  public getBuildingTopPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBuildingTopPosition(...args);
  }

  /**
   * [1755] getBuildingCornerPosition
   * Lấy tọa độ góc công trình.
   */
  public getBuildingCornerPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getBuildingCornerPosition(...args);
  }

  /**
   * [1756] getWallCenter
   * Lấy tâm tường.
   */
  public getWallCenter(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWallCenter(...args);
  }

  /**
   * [1757] getWallSurfacePosition
   * Lấy tọa độ trên bề mặt tường.
   */
  public getWallSurfacePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWallSurfacePosition(...args);
  }

  /**
   * [1758] getWallNormal
   * Lấy pháp tuyến tường.
   */
  public getWallNormal(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWallNormal(...args);
  }

  /**
   * [1759] getFloorPosition
   * Lấy tọa độ sàn.
   */
  public getFloorPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getFloorPosition(...args);
  }

  /**
   * [1760] getCeilingPosition
   * Lấy tọa độ trần.
   */
  public getCeilingPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getCeilingPosition(...args);
  }

  /**
   * [1761] getDoorPosition
   * Lấy tọa độ cửa.
   */
  public getDoorPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getDoorPosition(...args);
  }

  /**
   * [1762] getDoorHandlePosition
   * Lấy tọa độ tay nắm cửa.
   */
  public getDoorHandlePosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getDoorHandlePosition(...args);
  }

  /**
   * [1763] getWindowPosition
   * Lấy tọa độ cửa sổ.
   */
  public getWindowPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getWindowPosition(...args);
  }

  /**
   * [1764] getStairPosition
   * Lấy tọa độ bậc thang.
   */
  public getStairPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getStairPosition(...args);
  }

  /**
   * [1765] getRoofPosition
   * Lấy tọa độ mái nhà.
   */
  public getRoofPosition(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).getRoofPosition(...args);
  }

  /**
   * [1766] calculateBuildingHeight
   * Tính chiều cao công trình.
   */
  public calculateBuildingHeight(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBuildingHeight(...args);
  }

  /**
   * [1767] calculateBuildingFootprint
   * Tính diện tích chiếm đất công trình.
   */
  public calculateBuildingFootprint(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBuildingFootprint(...args);
  }

  /**
   * [1768] calculateBuildingVolume
   * Tính thể tích công trình.
   */
  public calculateBuildingVolume(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBuildingVolume(...args);
  }

  /**
   * [1769] calculateWallLength
   * Tính chiều dài tường.
   */
  public calculateWallLength(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWallLength(...args);
  }

  /**
   * [1770] calculateWallHeight
   * Tính chiều cao tường.
   */
  public calculateWallHeight(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWallHeight(...args);
  }

  /**
   * [1771] calculateWallThickness
   * Tính độ dày tường.
   */
  public calculateWallThickness(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWallThickness(...args);
  }

  /**
   * [1772] calculateWallSurfaceArea
   * Tính diện tích bề mặt tường.
   */
  public calculateWallSurfaceArea(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWallSurfaceArea(...args);
  }

  /**
   * [1773] calculateFloorArea
   * Tính diện tích sàn.
   */
  public calculateFloorArea(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateFloorArea(...args);
  }

  /**
   * [1774] calculateFloorElevation
   * Tính cao độ sàn.
   */
  public calculateFloorElevation(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateFloorElevation(...args);
  }

  /**
   * [1775] calculateCeilingHeight
   * Tính chiều cao trần.
   */
  public calculateCeilingHeight(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateCeilingHeight(...args);
  }

  /**
   * [1776] calculateDoorClearance
   * Tính khoảng trống cửa.
   */
  public calculateDoorClearance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateDoorClearance(...args);
  }

  /**
   * [1777] calculateWindowOpening
   * Tính kích thước lỗ cửa sổ.
   */
  public calculateWindowOpening(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWindowOpening(...args);
  }

  /**
   * [1778] calculateStairRise
   * Tính chiều cao cổ bậc.
   */
  public calculateStairRise(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateStairRise(...args);
  }

  /**
   * [1779] calculateStairTread
   * Tính chiều sâu mặt bậc.
   */
  public calculateStairTread(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateStairTread(...args);
  }

  /**
   * [1780] calculateRoofSlope
   * Tính độ dốc mái.
   */
  public calculateRoofSlope(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateRoofSlope(...args);
  }

  /**
   * [1781] calculateRoomBounds
   * Tính giới hạn không gian phòng.
   */
  public calculateRoomBounds(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateRoomBounds(...args);
  }

  /**
   * [1782] calculateRoomCenter
   * Tính tâm phòng.
   */
  public calculateRoomCenter(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateRoomCenter(...args);
  }

  /**
   * [1783] calculateRoomVolume
   * Tính thể tích phòng.
   */
  public calculateRoomVolume(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateRoomVolume(...args);
  }

  /**
   * [1784] calculateRoomNavigationDistance
   * Tính khoảng cách điều hướng trong phòng.
   */
  public calculateRoomNavigationDistance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateRoomNavigationDistance(...args);
  }

  /**
   * [1785] calculateBuildingCollision
   * Kiểm tra va chạm với công trình.
   */
  public calculateBuildingCollision(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateBuildingCollision(...args);
  }

  /**
   * [1786] calculateSpatialDistanceMatrix
   * Tính ma trận khoảng cách không gian.
   */
  public calculateSpatialDistanceMatrix(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialDistanceMatrix(...args);
  }

  /**
   * [1787] calculatePairwiseDistances
   * Tính khoảng cách từng cặp điểm.
   */
  public calculatePairwiseDistances(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculatePairwiseDistances(...args);
  }

  /**
   * [1788] calculateNearestNeighborDistance
   * Tính khoảng cách láng giềng gần nhất.
   */
  public calculateNearestNeighborDistance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateNearestNeighborDistance(...args);
  }

  /**
   * [1789] calculateFarthestNeighborDistance
   * Tính khoảng cách láng giềng xa nhất.
   */
  public calculateFarthestNeighborDistance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateFarthestNeighborDistance(...args);
  }

  /**
   * [1790] calculateSpatialCentroid
   * Tính tâm hình học tập điểm.
   */
  public calculateSpatialCentroid(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialCentroid(...args);
  }

  /**
   * [1791] calculateWeightedCentroid
   * Tính tâm có trọng số.
   */
  public calculateWeightedCentroid(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateWeightedCentroid(...args);
  }

  /**
   * [1792] calculateSpatialMedian
   * Tính trung vị không gian.
   */
  public calculateSpatialMedian(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialMedian(...args);
  }

  /**
   * [1793] calculateSpatialVariance
   * Tính phương sai tọa độ.
   */
  public calculateSpatialVariance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialVariance(...args);
  }

  /**
   * [1794] calculateSpatialCovariance
   * Tính hiệp phương sai tọa độ.
   */
  public calculateSpatialCovariance(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialCovariance(...args);
  }

  /**
   * [1795] calculateSpatialDistribution
   * Tính phân bố không gian.
   */
  public calculateSpatialDistribution(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialDistribution(...args);
  }

  /**
   * [1796] calculateSpatialDensity
   * Tính mật độ điểm trong không gian.
   */
  public calculateSpatialDensity(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialDensity(...args);
  }

  /**
   * [1797] calculateSpatialClustering
   * Tính mức độ phân cụm không gian.
   */
  public calculateSpatialClustering(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialClustering(...args);
  }

  /**
   * [1798] calculateSpatialOutliers
   * Phát hiện điểm ngoại lệ không gian.
   */
  public calculateSpatialOutliers(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialOutliers(...args);
  }

  /**
   * [1799] calculateSpatialSymmetry
   * Tính độ đối xứng không gian.
   */
  public calculateSpatialSymmetry(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialSymmetry(...args);
  }

  /**
   * [1800] calculateSpatialOverlapRatio
   * Tính tỷ lệ chồng lấn không gian.
   */
  public calculateSpatialOverlapRatio(...args: any[]): any {
    return (this.spatialEquipmentArchitecture as any).calculateSpatialOverlapRatio(...args);
  }

}
