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
  public calculateDistance3D(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistance3D']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistance3D']> {
    return this.distanceVectorMath.calculateDistance3D(...args);
  }

  /**
   * [0002] calculateDistance2D
   * Tính khoảng cách giữa hai điểm 2D.
   */
  public calculateDistance2D(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistance2D']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistance2D']> {
    return this.distanceVectorMath.calculateDistance2D(...args);
  }

  /**
   * [0003] calculateHorizontalDistance
   * Tính khoảng cách theo mặt phẳng ngang.
   */
  public calculateHorizontalDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateHorizontalDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateHorizontalDistance']> {
    return this.distanceVectorMath.calculateHorizontalDistance(...args);
  }

  /**
   * [0004] calculateVerticalDistance
   * Tính khoảng cách theo phương đứng.
   */
  public calculateVerticalDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVerticalDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVerticalDistance']> {
    return this.distanceVectorMath.calculateVerticalDistance(...args);
  }

  /**
   * [0005] calculateDepthDistance
   * Tính khoảng cách theo chiều sâu.
   */
  public calculateDepthDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDepthDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDepthDistance']> {
    return this.distanceVectorMath.calculateDepthDistance(...args);
  }

  /**
   * [0006] calculateEuclideanDistance
   * Tính khoảng cách Euclid.
   */
  public calculateEuclideanDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateEuclideanDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateEuclideanDistance']> {
    return this.distanceVectorMath.calculateEuclideanDistance(...args);
  }

  /**
   * [0007] calculateManhattanDistance
   * Tính khoảng cách Manhattan.
   */
  public calculateManhattanDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateManhattanDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateManhattanDistance']> {
    return this.distanceVectorMath.calculateManhattanDistance(...args);
  }

  /**
   * [0008] calculateChebyshevDistance
   * Tính khoảng cách Chebyshev.
   */
  public calculateChebyshevDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateChebyshevDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateChebyshevDistance']> {
    return this.distanceVectorMath.calculateChebyshevDistance(...args);
  }

  /**
   * [0009] calculateSquaredDistance
   * Tính bình phương khoảng cách.
   */
  public calculateSquaredDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateSquaredDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateSquaredDistance']> {
    return this.distanceVectorMath.calculateSquaredDistance(...args);
  }

  /**
   * [0010] calculateDistanceToOrigin
   * Tính khoảng cách đến gốc tọa độ.
   */
  public calculateDistanceToOrigin(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToOrigin']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToOrigin']> {
    return this.distanceVectorMath.calculateDistanceToOrigin(...args);
  }

  /**
   * [0011] calculateDistanceToCamera
   * Tính khoảng cách đến camera.
   */
  public calculateDistanceToCamera(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToCamera']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToCamera']> {
    return this.distanceVectorMath.calculateDistanceToCamera(...args);
  }

  /**
   * [0012] calculateDistanceToPlayer
   * Tính khoảng cách đến người chơi.
   */
  public calculateDistanceToPlayer(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToPlayer']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToPlayer']> {
    return this.distanceVectorMath.calculateDistanceToPlayer(...args);
  }

  /**
   * [0013] calculateDistanceToTarget
   * Tính khoảng cách đến mục tiêu.
   */
  public calculateDistanceToTarget(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToTarget']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToTarget']> {
    return this.distanceVectorMath.calculateDistanceToTarget(...args);
  }

  /**
   * [0014] calculateDistanceToBone
   * Tính khoảng cách đến xương.
   */
  public calculateDistanceToBone(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToBone']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToBone']> {
    return this.distanceVectorMath.calculateDistanceToBone(...args);
  }

  /**
   * [0015] calculateDistanceToJoint
   * Tính khoảng cách đến khớp.
   */
  public calculateDistanceToJoint(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToJoint']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToJoint']> {
    return this.distanceVectorMath.calculateDistanceToJoint(...args);
  }

  /**
   * [0016] calculateDistanceToSurface
   * Tính khoảng cách đến bề mặt.
   */
  public calculateDistanceToSurface(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToSurface']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToSurface']> {
    return this.distanceVectorMath.calculateDistanceToSurface(...args);
  }

  /**
   * [0017] calculateDistanceToCenter
   * Tính khoảng cách đến tâm vật thể.
   */
  public calculateDistanceToCenter(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToCenter']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToCenter']> {
    return this.distanceVectorMath.calculateDistanceToCenter(...args);
  }

  /**
   * [0018] calculateDistanceToEdge
   * Tính khoảng cách đến cạnh.
   */
  public calculateDistanceToEdge(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToEdge']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToEdge']> {
    return this.distanceVectorMath.calculateDistanceToEdge(...args);
  }

  /**
   * [0019] calculateDistanceToBoundary
   * Tính khoảng cách đến ranh giới.
   */
  public calculateDistanceToBoundary(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToBoundary']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToBoundary']> {
    return this.distanceVectorMath.calculateDistanceToBoundary(...args);
  }

  /**
   * [0020] calculateDistanceToGround
   * Tính khoảng cách đến mặt đất.
   */
  public calculateDistanceToGround(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToGround']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToGround']> {
    return this.distanceVectorMath.calculateDistanceToGround(...args);
  }

  /**
   * [0021] calculateDistanceToCeiling
   * Tính khoảng cách đến trần.
   */
  public calculateDistanceToCeiling(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToCeiling']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToCeiling']> {
    return this.distanceVectorMath.calculateDistanceToCeiling(...args);
  }

  /**
   * [0022] calculateDistanceToWall
   * Tính khoảng cách đến tường.
   */
  public calculateDistanceToWall(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToWall']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToWall']> {
    return this.distanceVectorMath.calculateDistanceToWall(...args);
  }

  /**
   * [0023] calculateDistanceToNearestObject
   * Tính khoảng cách đến vật thể gần nhất.
   */
  public calculateDistanceToNearestObject(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToNearestObject']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToNearestObject']> {
    return this.distanceVectorMath.calculateDistanceToNearestObject(...args);
  }

  /**
   * [0024] calculateDistanceToFarthestObject
   * Tính khoảng cách đến vật thể xa nhất.
   */
  public calculateDistanceToFarthestObject(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceToFarthestObject']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceToFarthestObject']> {
    return this.distanceVectorMath.calculateDistanceToFarthestObject(...args);
  }

  /**
   * [0025] calculateMinimumDistance
   * Tìm khoảng cách nhỏ nhất.
   */
  public calculateMinimumDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateMinimumDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateMinimumDistance']> {
    return this.distanceVectorMath.calculateMinimumDistance(...args);
  }

  /**
   * [0026] calculateMaximumDistance
   * Tìm khoảng cách lớn nhất.
   */
  public calculateMaximumDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateMaximumDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateMaximumDistance']> {
    return this.distanceVectorMath.calculateMaximumDistance(...args);
  }

  /**
   * [0027] calculateAverageDistance
   * Tính khoảng cách trung bình.
   */
  public calculateAverageDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAverageDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAverageDistance']> {
    return this.distanceVectorMath.calculateAverageDistance(...args);
  }

  /**
   * [0028] calculateDistanceAlongPath
   * Tính độ dài dọc đường đi.
   */
  public calculateDistanceAlongPath(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceAlongPath']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceAlongPath']> {
    return this.distanceVectorMath.calculateDistanceAlongPath(...args);
  }

  /**
   * [0029] calculateDistanceAlongCurve
   * Tính độ dài dọc đường cong.
   */
  public calculateDistanceAlongCurve(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceAlongCurve']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceAlongCurve']> {
    return this.distanceVectorMath.calculateDistanceAlongCurve(...args);
  }

  /**
   * [0030] calculateDistanceAlongSpline
   * Tính độ dài dọc spline.
   */
  public calculateDistanceAlongSpline(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceAlongSpline']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceAlongSpline']> {
    return this.distanceVectorMath.calculateDistanceAlongSpline(...args);
  }

  /**
   * [0031] calculateDistanceBetweenSegments
   * Tính khoảng cách giữa hai đoạn thẳng.
   */
  public calculateDistanceBetweenSegments(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenSegments']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenSegments']> {
    return this.distanceVectorMath.calculateDistanceBetweenSegments(...args);
  }

  /**
   * [0032] calculateDistanceBetweenRays
   * Tính khoảng cách giữa hai tia.
   */
  public calculateDistanceBetweenRays(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenRays']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenRays']> {
    return this.distanceVectorMath.calculateDistanceBetweenRays(...args);
  }

  /**
   * [0033] calculateDistanceBetweenPlanes
   * Tính khoảng cách giữa hai mặt phẳng.
   */
  public calculateDistanceBetweenPlanes(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenPlanes']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenPlanes']> {
    return this.distanceVectorMath.calculateDistanceBetweenPlanes(...args);
  }

  /**
   * [0034] calculateDistanceBetweenSpheres
   * Tính khoảng cách giữa hai hình cầu.
   */
  public calculateDistanceBetweenSpheres(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenSpheres']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenSpheres']> {
    return this.distanceVectorMath.calculateDistanceBetweenSpheres(...args);
  }

  /**
   * [0035] calculateDistanceBetweenBoxes
   * Tính khoảng cách giữa hai hộp.
   */
  public calculateDistanceBetweenBoxes(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenBoxes']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenBoxes']> {
    return this.distanceVectorMath.calculateDistanceBetweenBoxes(...args);
  }

  /**
   * [0036] calculateDistanceBetweenCapsules
   * Tính khoảng cách giữa hai capsule.
   */
  public calculateDistanceBetweenCapsules(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenCapsules']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenCapsules']> {
    return this.distanceVectorMath.calculateDistanceBetweenCapsules(...args);
  }

  /**
   * [0037] calculateDistanceBetweenMeshes
   * Tính khoảng cách giữa hai mesh.
   */
  public calculateDistanceBetweenMeshes(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenMeshes']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenMeshes']> {
    return this.distanceVectorMath.calculateDistanceBetweenMeshes(...args);
  }

  /**
   * [0038] calculateDistanceBetweenCharacters
   * Tính khoảng cách giữa hai nhân vật.
   */
  public calculateDistanceBetweenCharacters(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenCharacters']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenCharacters']> {
    return this.distanceVectorMath.calculateDistanceBetweenCharacters(...args);
  }

  /**
   * [0039] calculateDistanceBetweenBones
   * Tính khoảng cách giữa hai xương.
   */
  public calculateDistanceBetweenBones(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenBones']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenBones']> {
    return this.distanceVectorMath.calculateDistanceBetweenBones(...args);
  }

  /**
   * [0040] calculateDistanceBetweenHands
   * Tính khoảng cách giữa hai bàn tay.
   */
  public calculateDistanceBetweenHands(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenHands']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenHands']> {
    return this.distanceVectorMath.calculateDistanceBetweenHands(...args);
  }

  /**
   * [0041] calculateDistanceBetweenFeet
   * Tính khoảng cách giữa hai bàn chân.
   */
  public calculateDistanceBetweenFeet(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenFeet']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenFeet']> {
    return this.distanceVectorMath.calculateDistanceBetweenFeet(...args);
  }

  /**
   * [0042] calculateDistanceBetweenEyes
   * Tính khoảng cách giữa hai mắt.
   */
  public calculateDistanceBetweenEyes(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenEyes']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenEyes']> {
    return this.distanceVectorMath.calculateDistanceBetweenEyes(...args);
  }

  /**
   * [0043] calculateDistanceBetweenShoulders
   * Tính khoảng cách giữa hai vai.
   */
  public calculateDistanceBetweenShoulders(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenShoulders']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenShoulders']> {
    return this.distanceVectorMath.calculateDistanceBetweenShoulders(...args);
  }

  /**
   * [0044] calculateDistanceBetweenHips
   * Tính khoảng cách giữa hai hông.
   */
  public calculateDistanceBetweenHips(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenHips']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenHips']> {
    return this.distanceVectorMath.calculateDistanceBetweenHips(...args);
  }

  /**
   * [0045] calculateDistanceBetweenFingers
   * Tính khoảng cách giữa các ngón tay.
   */
  public calculateDistanceBetweenFingers(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenFingers']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenFingers']> {
    return this.distanceVectorMath.calculateDistanceBetweenFingers(...args);
  }

  /**
   * [0046] calculateDistanceBetweenObjects
   * Tính khoảng cách giữa hai vật thể.
   */
  public calculateDistanceBetweenObjects(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenObjects']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenObjects']> {
    return this.distanceVectorMath.calculateDistanceBetweenObjects(...args);
  }

  /**
   * [0047] calculateDistanceBetweenTrees
   * Tính khoảng cách giữa hai cây.
   */
  public calculateDistanceBetweenTrees(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenTrees']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenTrees']> {
    return this.distanceVectorMath.calculateDistanceBetweenTrees(...args);
  }

  /**
   * [0048] calculateDistanceBetweenAnimals
   * Tính khoảng cách giữa hai con vật.
   */
  public calculateDistanceBetweenAnimals(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenAnimals']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenAnimals']> {
    return this.distanceVectorMath.calculateDistanceBetweenAnimals(...args);
  }

  /**
   * [0049] calculateDistanceBetweenNPCs
   * Tính khoảng cách giữa hai NPC.
   */
  public calculateDistanceBetweenNPCs(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenNPCs']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenNPCs']> {
    return this.distanceVectorMath.calculateDistanceBetweenNPCs(...args);
  }

  /**
   * [0050] calculateDistanceBetweenBosses
   * Tính khoảng cách giữa hai boss.
   */
  public calculateDistanceBetweenBosses(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDistanceBetweenBosses']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDistanceBetweenBosses']> {
    return this.distanceVectorMath.calculateDistanceBetweenBosses(...args);
  }

  /**
   * [0051] getWorldPosition
   * Lấy tọa độ thế giới.
   */
  public getWorldPosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getWorldPosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getWorldPosition']> {
    return this.distanceVectorMath.getWorldPosition(...args);
  }

  /**
   * [0052] getLocalPosition
   * Lấy tọa độ cục bộ.
   */
  public getLocalPosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getLocalPosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getLocalPosition']> {
    return this.distanceVectorMath.getLocalPosition(...args);
  }

  /**
   * [0053] getParentPosition
   * Lấy tọa độ của đối tượng cha.
   */
  public getParentPosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getParentPosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getParentPosition']> {
    return this.distanceVectorMath.getParentPosition(...args);
  }

  /**
   * [0054] getRelativePosition
   * Lấy tọa độ tương đối.
   */
  public getRelativePosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getRelativePosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getRelativePosition']> {
    return this.distanceVectorMath.getRelativePosition(...args);
  }

  /**
   * [0055] getAbsolutePosition
   * Lấy tọa độ tuyệt đối.
   */
  public getAbsolutePosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getAbsolutePosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getAbsolutePosition']> {
    return this.distanceVectorMath.getAbsolutePosition(...args);
  }

  /**
   * [0056] getScreenPosition
   * Chuyển vị trí 3D sang tọa độ màn hình.
   */
  public getScreenPosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getScreenPosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getScreenPosition']> {
    return this.distanceVectorMath.getScreenPosition(...args);
  }

  /**
   * [0057] getViewportPosition
   * Lấy vị trí trong viewport.
   */
  public getViewportPosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getViewportPosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getViewportPosition']> {
    return this.distanceVectorMath.getViewportPosition(...args);
  }

  /**
   * [0058] getNormalizedDeviceCoordinates
   * Chuyển sang tọa độ NDC.
   */
  public getNormalizedDeviceCoordinates(
    ...args: Parameters<DistanceVectorMathSubsystem['getNormalizedDeviceCoordinates']>
  ): ReturnType<DistanceVectorMathSubsystem['getNormalizedDeviceCoordinates']> {
    return this.distanceVectorMath.getNormalizedDeviceCoordinates(...args);
  }

  /**
   * [0059] getCameraSpacePosition
   * Lấy tọa độ trong không gian camera.
   */
  public getCameraSpacePosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getCameraSpacePosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getCameraSpacePosition']> {
    return this.distanceVectorMath.getCameraSpacePosition(...args);
  }

  /**
   * [0060] getObjectSpacePosition
   * Lấy tọa độ trong không gian vật thể.
   */
  public getObjectSpacePosition(
    ...args: Parameters<DistanceVectorMathSubsystem['getObjectSpacePosition']>
  ): ReturnType<DistanceVectorMathSubsystem['getObjectSpacePosition']> {
    return this.distanceVectorMath.getObjectSpacePosition(...args);
  }

  /**
   * [0061] transformLocalToWorld
   * Chuyển tọa độ cục bộ sang thế giới.
   */
  public transformLocalToWorld(
    ...args: Parameters<DistanceVectorMathSubsystem['transformLocalToWorld']>
  ): ReturnType<DistanceVectorMathSubsystem['transformLocalToWorld']> {
    return this.distanceVectorMath.transformLocalToWorld(...args);
  }

  /**
   * [0062] transformWorldToLocal
   * Chuyển tọa độ thế giới sang cục bộ.
   */
  public transformWorldToLocal(
    ...args: Parameters<DistanceVectorMathSubsystem['transformWorldToLocal']>
  ): ReturnType<DistanceVectorMathSubsystem['transformWorldToLocal']> {
    return this.distanceVectorMath.transformWorldToLocal(...args);
  }

  /**
   * [0063] transformWorldToScreen
   * Chuyển tọa độ thế giới sang màn hình.
   */
  public transformWorldToScreen(
    ...args: Parameters<DistanceVectorMathSubsystem['transformWorldToScreen']>
  ): ReturnType<DistanceVectorMathSubsystem['transformWorldToScreen']> {
    return this.distanceVectorMath.transformWorldToScreen(...args);
  }

  /**
   * [0064] transformScreenToWorld
   * Chuyển tọa độ màn hình sang thế giới.
   */
  public transformScreenToWorld(
    ...args: Parameters<DistanceVectorMathSubsystem['transformScreenToWorld']>
  ): ReturnType<DistanceVectorMathSubsystem['transformScreenToWorld']> {
    return this.distanceVectorMath.transformScreenToWorld(...args);
  }

  /**
   * [0065] transformCameraToWorld
   * Chuyển tọa độ camera sang thế giới.
   */
  public transformCameraToWorld(
    ...args: Parameters<DistanceVectorMathSubsystem['transformCameraToWorld']>
  ): ReturnType<DistanceVectorMathSubsystem['transformCameraToWorld']> {
    return this.distanceVectorMath.transformCameraToWorld(...args);
  }

  /**
   * [0066] transformWorldToCamera
   * Chuyển tọa độ thế giới sang camera.
   */
  public transformWorldToCamera(
    ...args: Parameters<DistanceVectorMathSubsystem['transformWorldToCamera']>
  ): ReturnType<DistanceVectorMathSubsystem['transformWorldToCamera']> {
    return this.distanceVectorMath.transformWorldToCamera(...args);
  }

  /**
   * [0067] calculatePositionOffset
   * Tính độ lệch vị trí.
   */
  public calculatePositionOffset(
    ...args: Parameters<DistanceVectorMathSubsystem['calculatePositionOffset']>
  ): ReturnType<DistanceVectorMathSubsystem['calculatePositionOffset']> {
    return this.distanceVectorMath.calculatePositionOffset(...args);
  }

  /**
   * [0068] calculateRelativeOffset
   * Tính độ lệch tương đối.
   */
  public calculateRelativeOffset(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRelativeOffset']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRelativeOffset']> {
    return this.distanceVectorMath.calculateRelativeOffset(...args);
  }

  /**
   * [0069] calculateWorldOffset
   * Tính độ lệch trong thế giới.
   */
  public calculateWorldOffset(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateWorldOffset']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateWorldOffset']> {
    return this.distanceVectorMath.calculateWorldOffset(...args);
  }

  /**
   * [0070] calculateLocalOffset
   * Tính độ lệch cục bộ.
   */
  public calculateLocalOffset(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLocalOffset']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLocalOffset']> {
    return this.distanceVectorMath.calculateLocalOffset(...args);
  }

  /**
   * [0071] calculatePositionDelta
   * Tính độ thay đổi vị trí.
   */
  public calculatePositionDelta(
    ...args: Parameters<DistanceVectorMathSubsystem['calculatePositionDelta']>
  ): ReturnType<DistanceVectorMathSubsystem['calculatePositionDelta']> {
    return this.distanceVectorMath.calculatePositionDelta(...args);
  }

  /**
   * [0072] calculateVelocityVector
   * Tính vector vận tốc.
   */
  public calculateVelocityVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVelocityVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVelocityVector']> {
    return this.distanceVectorMath.calculateVelocityVector(...args);
  }

  /**
   * [0073] calculateAccelerationVector
   * Tính vector gia tốc.
   */
  public calculateAccelerationVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAccelerationVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAccelerationVector']> {
    return this.distanceVectorMath.calculateAccelerationVector(...args);
  }

  /**
   * [0074] calculateDirectionVector
   * Tính vector hướng.
   */
  public calculateDirectionVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDirectionVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDirectionVector']> {
    return this.distanceVectorMath.calculateDirectionVector(...args);
  }

  /**
   * [0075] calculateNormalizedDirection
   * Tính hướng chuẩn hóa.
   */
  public calculateNormalizedDirection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateNormalizedDirection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateNormalizedDirection']> {
    return this.distanceVectorMath.calculateNormalizedDirection(...args);
  }

  /**
   * [0076] calculateForwardVector
   * Tính vector phía trước.
   */
  public calculateForwardVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateForwardVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateForwardVector']> {
    return this.distanceVectorMath.calculateForwardVector(...args);
  }

  /**
   * [0077] calculateBackwardVector
   * Tính vector phía sau.
   */
  public calculateBackwardVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateBackwardVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateBackwardVector']> {
    return this.distanceVectorMath.calculateBackwardVector(...args);
  }

  /**
   * [0078] calculateRightVector
   * Tính vector bên phải.
   */
  public calculateRightVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRightVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRightVector']> {
    return this.distanceVectorMath.calculateRightVector(...args);
  }

  /**
   * [0079] calculateLeftVector
   * Tính vector bên trái.
   */
  public calculateLeftVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLeftVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLeftVector']> {
    return this.distanceVectorMath.calculateLeftVector(...args);
  }

  /**
   * [0080] calculateUpVector
   * Tính vector phía trên.
   */
  public calculateUpVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateUpVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateUpVector']> {
    return this.distanceVectorMath.calculateUpVector(...args);
  }

  /**
   * [0081] calculateDownVector
   * Tính vector phía dưới.
   */
  public calculateDownVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDownVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDownVector']> {
    return this.distanceVectorMath.calculateDownVector(...args);
  }

  /**
   * [0082] calculateLookDirection
   * Tính hướng nhìn.
   */
  public calculateLookDirection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLookDirection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLookDirection']> {
    return this.distanceVectorMath.calculateLookDirection(...args);
  }

  /**
   * [0083] calculateAimDirection
   * Tính hướng ngắm.
   */
  public calculateAimDirection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAimDirection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAimDirection']> {
    return this.distanceVectorMath.calculateAimDirection(...args);
  }

  /**
   * [0084] calculateMovementDirection
   * Tính hướng di chuyển.
   */
  public calculateMovementDirection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateMovementDirection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateMovementDirection']> {
    return this.distanceVectorMath.calculateMovementDirection(...args);
  }

  /**
   * [0085] calculateSurfaceNormal
   * Tính vector pháp tuyến bề mặt.
   */
  public calculateSurfaceNormal(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateSurfaceNormal']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateSurfaceNormal']> {
    return this.distanceVectorMath.calculateSurfaceNormal(...args);
  }

  /**
   * [0086] calculateTangentVector
   * Tính vector tiếp tuyến.
   */
  public calculateTangentVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateTangentVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateTangentVector']> {
    return this.distanceVectorMath.calculateTangentVector(...args);
  }

  /**
   * [0087] calculateBitangentVector
   * Tính vector tiếp tuyến phụ.
   */
  public calculateBitangentVector(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateBitangentVector']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateBitangentVector']> {
    return this.distanceVectorMath.calculateBitangentVector(...args);
  }

  /**
   * [0088] calculateCrossProduct
   * Tính tích có hướng.
   */
  public calculateCrossProduct(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateCrossProduct']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateCrossProduct']> {
    return this.distanceVectorMath.calculateCrossProduct(...args);
  }

  /**
   * [0089] calculateDotProduct
   * Tính tích vô hướng.
   */
  public calculateDotProduct(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateDotProduct']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateDotProduct']> {
    return this.distanceVectorMath.calculateDotProduct(...args);
  }

  /**
   * [0090] calculateVectorMagnitude
   * Tính độ lớn vector.
   */
  public calculateVectorMagnitude(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVectorMagnitude']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVectorMagnitude']> {
    return this.distanceVectorMath.calculateVectorMagnitude(...args);
  }

  /**
   * [0091] normalizeVector
   * Chuẩn hóa vector.
   */
  public normalizeVector(
    ...args: Parameters<DistanceVectorMathSubsystem['normalizeVector']>
  ): ReturnType<DistanceVectorMathSubsystem['normalizeVector']> {
    return this.distanceVectorMath.normalizeVector(...args);
  }

  /**
   * [0092] projectVector
   * Chiếu vector lên vector khác.
   */
  public projectVector(
    ...args: Parameters<DistanceVectorMathSubsystem['projectVector']>
  ): ReturnType<DistanceVectorMathSubsystem['projectVector']> {
    return this.distanceVectorMath.projectVector(...args);
  }

  /**
   * [0093] reflectVector
   * Phản xạ vector.
   */
  public reflectVector(
    ...args: Parameters<DistanceVectorMathSubsystem['reflectVector']>
  ): ReturnType<DistanceVectorMathSubsystem['reflectVector']> {
    return this.distanceVectorMath.reflectVector(...args);
  }

  /**
   * [0094] refractVector
   * Khúc xạ vector.
   */
  public refractVector(
    ...args: Parameters<DistanceVectorMathSubsystem['refractVector']>
  ): ReturnType<DistanceVectorMathSubsystem['refractVector']> {
    return this.distanceVectorMath.refractVector(...args);
  }

  /**
   * [0095] lerpVector
   * Nội suy tuyến tính vector.
   */
  public lerpVector(
    ...args: Parameters<DistanceVectorMathSubsystem['lerpVector']>
  ): ReturnType<DistanceVectorMathSubsystem['lerpVector']> {
    return this.distanceVectorMath.lerpVector(...args);
  }

  /**
   * [0096] slerpVector
   * Nội suy cầu vector.
   */
  public slerpVector(
    ...args: Parameters<DistanceVectorMathSubsystem['slerpVector']>
  ): ReturnType<DistanceVectorMathSubsystem['slerpVector']> {
    return this.distanceVectorMath.slerpVector(...args);
  }

  /**
   * [0097] clampVectorMagnitude
   * Giới hạn độ lớn vector.
   */
  public clampVectorMagnitude(
    ...args: Parameters<DistanceVectorMathSubsystem['clampVectorMagnitude']>
  ): ReturnType<DistanceVectorMathSubsystem['clampVectorMagnitude']> {
    return this.distanceVectorMath.clampVectorMagnitude(...args);
  }

  /**
   * [0098] calculateVectorAngle
   * Tính góc giữa hai vector.
   */
  public calculateVectorAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVectorAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVectorAngle']> {
    return this.distanceVectorMath.calculateVectorAngle(...args);
  }

  /**
   * [0099] calculateVectorProjection
   * Tính hình chiếu vector.
   */
  public calculateVectorProjection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVectorProjection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVectorProjection']> {
    return this.distanceVectorMath.calculateVectorProjection(...args);
  }

  /**
   * [0100] calculateVectorRejection
   * Tính thành phần vuông góc của vector.
   */
  public calculateVectorRejection(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateVectorRejection']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateVectorRejection']> {
    return this.distanceVectorMath.calculateVectorRejection(...args);
  }

  /**
   * [0101] calculateEulerAngles
   * Tính góc Euler.
   */
  public calculateEulerAngles(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateEulerAngles']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateEulerAngles']> {
    return this.distanceVectorMath.calculateEulerAngles(...args);
  }

  /**
   * [0102] calculateYaw
   * Tính góc quay quanh trục đứng.
   */
  public calculateYaw(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateYaw']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateYaw']> {
    return this.distanceVectorMath.calculateYaw(...args);
  }

  /**
   * [0103] calculatePitch
   * Tính góc nghiêng lên xuống.
   */
  public calculatePitch(
    ...args: Parameters<DistanceVectorMathSubsystem['calculatePitch']>
  ): ReturnType<DistanceVectorMathSubsystem['calculatePitch']> {
    return this.distanceVectorMath.calculatePitch(...args);
  }

  /**
   * [0104] calculateRoll
   * Tính góc lăn quanh trục trước sau.
   */
  public calculateRoll(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRoll']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRoll']> {
    return this.distanceVectorMath.calculateRoll(...args);
  }

  /**
   * [0105] calculateAngleBetweenPoints
   * Tính góc giữa hai điểm.
   */
  public calculateAngleBetweenPoints(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngleBetweenPoints']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngleBetweenPoints']> {
    return this.distanceVectorMath.calculateAngleBetweenPoints(...args);
  }

  /**
   * [0106] calculateAngleBetweenVectors
   * Tính góc giữa hai vector.
   */
  public calculateAngleBetweenVectors(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngleBetweenVectors']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngleBetweenVectors']> {
    return this.distanceVectorMath.calculateAngleBetweenVectors(...args);
  }

  /**
   * [0107] calculateAngleToTarget
   * Tính góc hướng tới mục tiêu.
   */
  public calculateAngleToTarget(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngleToTarget']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngleToTarget']> {
    return this.distanceVectorMath.calculateAngleToTarget(...args);
  }

  /**
   * [0108] calculateAngleToCamera
   * Tính góc so với camera.
   */
  public calculateAngleToCamera(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngleToCamera']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngleToCamera']> {
    return this.distanceVectorMath.calculateAngleToCamera(...args);
  }

  /**
   * [0109] calculateAngleToGround
   * Tính góc so với mặt đất.
   */
  public calculateAngleToGround(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngleToGround']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngleToGround']> {
    return this.distanceVectorMath.calculateAngleToGround(...args);
  }

  /**
   * [0110] calculateSignedAngle
   * Tính góc có dấu.
   */
  public calculateSignedAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateSignedAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateSignedAngle']> {
    return this.distanceVectorMath.calculateSignedAngle(...args);
  }

  /**
   * [0111] calculateUnsignedAngle
   * Tính góc không dấu.
   */
  public calculateUnsignedAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateUnsignedAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateUnsignedAngle']> {
    return this.distanceVectorMath.calculateUnsignedAngle(...args);
  }

  /**
   * [0112] calculateAngularVelocity
   * Tính vận tốc góc.
   */
  public calculateAngularVelocity(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngularVelocity']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngularVelocity']> {
    return this.distanceVectorMath.calculateAngularVelocity(...args);
  }

  /**
   * [0113] calculateAngularAcceleration
   * Tính gia tốc góc.
   */
  public calculateAngularAcceleration(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngularAcceleration']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngularAcceleration']> {
    return this.distanceVectorMath.calculateAngularAcceleration(...args);
  }

  /**
   * [0114] calculateAngularDistance
   * Tính khoảng cách góc.
   */
  public calculateAngularDistance(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngularDistance']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngularDistance']> {
    return this.distanceVectorMath.calculateAngularDistance(...args);
  }

  /**
   * [0115] calculateAngularDifference
   * Tính độ chênh góc.
   */
  public calculateAngularDifference(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateAngularDifference']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateAngularDifference']> {
    return this.distanceVectorMath.calculateAngularDifference(...args);
  }

  /**
   * [0116] normalizeAngle
   * Chuẩn hóa góc.
   */
  public normalizeAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['normalizeAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['normalizeAngle']> {
    return this.distanceVectorMath.normalizeAngle(...args);
  }

  /**
   * [0117] clampAngle
   * Giới hạn góc.
   */
  public clampAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['clampAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['clampAngle']> {
    return this.distanceVectorMath.clampAngle(...args);
  }

  /**
   * [0118] interpolateAngle
   * Nội suy góc.
   */
  public interpolateAngle(
    ...args: Parameters<DistanceVectorMathSubsystem['interpolateAngle']>
  ): ReturnType<DistanceVectorMathSubsystem['interpolateAngle']> {
    return this.distanceVectorMath.interpolateAngle(...args);
  }

  /**
   * [0119] calculateRotationMatrix
   * Tính ma trận quay.
   */
  public calculateRotationMatrix(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRotationMatrix']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRotationMatrix']> {
    return this.distanceVectorMath.calculateRotationMatrix(...args);
  }

  /**
   * [0120] calculateInverseRotation
   * Tính phép quay nghịch đảo.
   */
  public calculateInverseRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateInverseRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateInverseRotation']> {
    return this.distanceVectorMath.calculateInverseRotation(...args);
  }

  /**
   * [0121] calculateQuaternion
   * Tính quaternion.
   */
  public calculateQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateQuaternion']> {
    return this.distanceVectorMath.calculateQuaternion(...args);
  }

  /**
   * [0122] normalizeQuaternion
   * Chuẩn hóa quaternion.
   */
  public normalizeQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['normalizeQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['normalizeQuaternion']> {
    return this.distanceVectorMath.normalizeQuaternion(...args);
  }

  /**
   * [0123] multiplyQuaternions
   * Nhân hai quaternion.
   */
  public multiplyQuaternions(
    ...args: Parameters<DistanceVectorMathSubsystem['multiplyQuaternions']>
  ): ReturnType<DistanceVectorMathSubsystem['multiplyQuaternions']> {
    return this.distanceVectorMath.multiplyQuaternions(...args);
  }

  /**
   * [0124] invertQuaternion
   * Đảo quaternion.
   */
  public invertQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['invertQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['invertQuaternion']> {
    return this.distanceVectorMath.invertQuaternion(...args);
  }

  /**
   * [0125] slerpQuaternion
   * Nội suy cầu quaternion.
   */
  public slerpQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['slerpQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['slerpQuaternion']> {
    return this.distanceVectorMath.slerpQuaternion(...args);
  }

  /**
   * [0126] nlerpQuaternion
   * Nội suy tuyến tính chuẩn hóa quaternion.
   */
  public nlerpQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['nlerpQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['nlerpQuaternion']> {
    return this.distanceVectorMath.nlerpQuaternion(...args);
  }

  /**
   * [0127] quaternionToEuler
   * Chuyển quaternion sang Euler.
   */
  public quaternionToEuler(
    ...args: Parameters<DistanceVectorMathSubsystem['quaternionToEuler']>
  ): ReturnType<DistanceVectorMathSubsystem['quaternionToEuler']> {
    return this.distanceVectorMath.quaternionToEuler(...args);
  }

  /**
   * [0128] eulerToQuaternion
   * Chuyển Euler sang quaternion.
   */
  public eulerToQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['eulerToQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['eulerToQuaternion']> {
    return this.distanceVectorMath.eulerToQuaternion(...args);
  }

  /**
   * [0129] quaternionToMatrix
   * Chuyển quaternion sang ma trận.
   */
  public quaternionToMatrix(
    ...args: Parameters<DistanceVectorMathSubsystem['quaternionToMatrix']>
  ): ReturnType<DistanceVectorMathSubsystem['quaternionToMatrix']> {
    return this.distanceVectorMath.quaternionToMatrix(...args);
  }

  /**
   * [0130] matrixToQuaternion
   * Chuyển ma trận sang quaternion.
   */
  public matrixToQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['matrixToQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['matrixToQuaternion']> {
    return this.distanceVectorMath.matrixToQuaternion(...args);
  }

  /**
   * [0131] calculateLookAtRotation
   * Tính góc quay để nhìn mục tiêu.
   */
  public calculateLookAtRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLookAtRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLookAtRotation']> {
    return this.distanceVectorMath.calculateLookAtRotation(...args);
  }

  /**
   * [0132] calculateLookAtQuaternion
   * Tính quaternion hướng nhìn.
   */
  public calculateLookAtQuaternion(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLookAtQuaternion']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLookAtQuaternion']> {
    return this.distanceVectorMath.calculateLookAtQuaternion(...args);
  }

  /**
   * [0133] calculateRotationAroundAxis
   * Tính phép quay quanh trục.
   */
  public calculateRotationAroundAxis(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRotationAroundAxis']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRotationAroundAxis']> {
    return this.distanceVectorMath.calculateRotationAroundAxis(...args);
  }

  /**
   * [0134] calculateRotationBetweenVectors
   * Tính phép quay giữa hai vector.
   */
  public calculateRotationBetweenVectors(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRotationBetweenVectors']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRotationBetweenVectors']> {
    return this.distanceVectorMath.calculateRotationBetweenVectors(...args);
  }

  /**
   * [0135] calculateRelativeRotation
   * Tính góc quay tương đối.
   */
  public calculateRelativeRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateRelativeRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateRelativeRotation']> {
    return this.distanceVectorMath.calculateRelativeRotation(...args);
  }

  /**
   * [0136] calculateWorldRotation
   * Tính góc quay thế giới.
   */
  public calculateWorldRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateWorldRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateWorldRotation']> {
    return this.distanceVectorMath.calculateWorldRotation(...args);
  }

  /**
   * [0137] calculateLocalRotation
   * Tính góc quay cục bộ.
   */
  public calculateLocalRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateLocalRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateLocalRotation']> {
    return this.distanceVectorMath.calculateLocalRotation(...args);
  }

  /**
   * [0138] calculateBoneRotation
   * Tính góc quay xương.
   */
  public calculateBoneRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateBoneRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateBoneRotation']> {
    return this.distanceVectorMath.calculateBoneRotation(...args);
  }

  /**
   * [0139] calculateJointRotation
   * Tính góc quay khớp.
   */
  public calculateJointRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateJointRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateJointRotation']> {
    return this.distanceVectorMath.calculateJointRotation(...args);
  }

  /**
   * [0140] calculateHeadRotation
   * Tính góc quay đầu.
   */
  public calculateHeadRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateHeadRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateHeadRotation']> {
    return this.distanceVectorMath.calculateHeadRotation(...args);
  }

  /**
   * [0141] calculateHandRotation
   * Tính góc quay bàn tay.
   */
  public calculateHandRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateHandRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateHandRotation']> {
    return this.distanceVectorMath.calculateHandRotation(...args);
  }

  /**
   * [0142 / 0884] calculateFootRotation
   * Tính góc quay bàn chân (toán học quaternion hoặc giải phẫu mắt cá & bàn chân).
   */
  public calculateFootRotation(entityOrAngle?: unknown, options?: unknown) {
    const r1 = this.distanceVectorMath.calculateFootRotation(entityOrAngle, options);
    const r2 = this.anatomicalLowerBody.calculateFootRotation(entityOrAngle, options);
    return r2 ?? r1;
  }

  /**
   * [0143] calculateShoulderRotation
   * Tính góc quay vai.
   */
  public calculateShoulderRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateShoulderRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateShoulderRotation']> {
    return this.distanceVectorMath.calculateShoulderRotation(...args);
  }

  /**
   * [0144] calculateHipRotation
   * Tính góc quay hông.
   */
  public calculateHipRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateHipRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateHipRotation']> {
    return this.distanceVectorMath.calculateHipRotation(...args);
  }

  /**
   * [0145] calculateWristRotation
   * Tính góc quay cổ tay.
   */
  public calculateWristRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateWristRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateWristRotation']> {
    return this.distanceVectorMath.calculateWristRotation(...args);
  }

  /**
   * [0146] calculateElbowRotation
   * Tính góc quay khuỷu tay.
   */
  public calculateElbowRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateElbowRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateElbowRotation']> {
    return this.distanceVectorMath.calculateElbowRotation(...args);
  }

  /**
   * [0147 / 0811] calculateKneeRotation
   * Tính góc quay đầu gối (toán học quaternion hoặc giải phẫu khớp gối).
   */
  public calculateKneeRotation(entityOrAngle?: unknown, options?: unknown) {
    const r1 = this.distanceVectorMath.calculateKneeRotation(entityOrAngle, options);
    const r2 = this.anatomicalLowerBody.calculateKneeRotation(entityOrAngle, options);
    return r2 ?? r1;
  }

  /**
   * [0148] calculateSpineRotation
   * Tính góc quay cột sống.
   */
  public calculateSpineRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateSpineRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateSpineRotation']> {
    return this.distanceVectorMath.calculateSpineRotation(...args);
  }

  /**
   * [0149] calculateTailRotation
   * Tính góc quay đuôi.
   */
  public calculateTailRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateTailRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateTailRotation']> {
    return this.distanceVectorMath.calculateTailRotation(...args);
  }

  /**
   * [0150] calculateWingRotation
   * Tính góc quay cánh.
   */
  public calculateWingRotation(
    ...args: Parameters<DistanceVectorMathSubsystem['calculateWingRotation']>
  ): ReturnType<DistanceVectorMathSubsystem['calculateWingRotation']> {
    return this.distanceVectorMath.calculateWingRotation(...args);
  }

  /**
   * [0151] getHeadPosition
   * Lấy tọa độ đầu.
   */
  public getHeadPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadPosition']> {
    return this.anatomicalUpperBody.getHeadPosition(...args);
  }

  /**
   * [0152] getHeadCenter
   * Lấy tâm đầu.
   */
  public getHeadCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadCenter']> {
    return this.anatomicalUpperBody.getHeadCenter(...args);
  }

  /**
   * [0153] getHeadTopPosition
   * Lấy tọa độ đỉnh đầu.
   */
  public getHeadTopPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadTopPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadTopPosition']> {
    return this.anatomicalUpperBody.getHeadTopPosition(...args);
  }

  /**
   * [0154] getHeadBottomPosition
   * Lấy tọa độ đáy đầu.
   */
  public getHeadBottomPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadBottomPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadBottomPosition']> {
    return this.anatomicalUpperBody.getHeadBottomPosition(...args);
  }

  /**
   * [0155] getHeadFrontPosition
   * Lấy tọa độ phía trước đầu.
   */
  public getHeadFrontPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadFrontPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadFrontPosition']> {
    return this.anatomicalUpperBody.getHeadFrontPosition(...args);
  }

  /**
   * [0156] getHeadBackPosition
   * Lấy tọa độ phía sau đầu.
   */
  public getHeadBackPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadBackPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadBackPosition']> {
    return this.anatomicalUpperBody.getHeadBackPosition(...args);
  }

  /**
   * [0157] getHeadLeftPosition
   * Lấy tọa độ bên trái đầu.
   */
  public getHeadLeftPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadLeftPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadLeftPosition']> {
    return this.anatomicalUpperBody.getHeadLeftPosition(...args);
  }

  /**
   * [0158] getHeadRightPosition
   * Lấy tọa độ bên phải đầu.
   */
  public getHeadRightPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadRightPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadRightPosition']> {
    return this.anatomicalUpperBody.getHeadRightPosition(...args);
  }

  /**
   * [0159] getHeadForwardVector
   * Lấy hướng phía trước đầu.
   */
  public getHeadForwardVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadForwardVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadForwardVector']> {
    return this.anatomicalUpperBody.getHeadForwardVector(...args);
  }

  /**
   * [0160] getHeadUpVector
   * Lấy hướng phía trên đầu.
   */
  public getHeadUpVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadUpVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadUpVector']> {
    return this.anatomicalUpperBody.getHeadUpVector(...args);
  }

  /**
   * [0161] getHeadRightVector
   * Lấy hướng bên phải đầu.
   */
  public getHeadRightVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getHeadRightVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getHeadRightVector']> {
    return this.anatomicalUpperBody.getHeadRightVector(...args);
  }

  /**
   * [0162] calculateHeadCenterOffset
   * Tính độ lệch tâm đầu.
   */
  public calculateHeadCenterOffset(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadCenterOffset']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadCenterOffset']> {
    return this.anatomicalUpperBody.calculateHeadCenterOffset(...args);
  }

  /**
   * [0163] calculateHeadBoundingBox
   * Tính hộp bao đầu.
   */
  public calculateHeadBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadBoundingBox']> {
    return this.anatomicalUpperBody.calculateHeadBoundingBox(...args);
  }

  /**
   * [0164] calculateHeadBoundingSphere
   * Tính hình cầu bao đầu.
   */
  public calculateHeadBoundingSphere(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadBoundingSphere']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadBoundingSphere']> {
    return this.anatomicalUpperBody.calculateHeadBoundingSphere(...args);
  }

  /**
   * [0165] calculateHeadOrientation
   * Tính hướng đầu.
   */
  public calculateHeadOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadOrientation']> {
    return this.anatomicalUpperBody.calculateHeadOrientation(...args);
  }

  /**
   * [0166] calculateHeadLookDirection
   * Tính hướng nhìn của đầu.
   */
  public calculateHeadLookDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadLookDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadLookDirection']> {
    return this.anatomicalUpperBody.calculateHeadLookDirection(...args);
  }

  /**
   * [0167] calculateHeadAimDirection
   * Tính hướng ngắm của đầu.
   */
  public calculateHeadAimDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadAimDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadAimDirection']> {
    return this.anatomicalUpperBody.calculateHeadAimDirection(...args);
  }

  /**
   * [0168] calculateHeadTilt
   * Tính độ nghiêng đầu.
   */
  public calculateHeadTilt(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadTilt']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadTilt']> {
    return this.anatomicalUpperBody.calculateHeadTilt(...args);
  }

  /**
   * [0169] calculateHeadYaw
   * Tính góc quay ngang đầu.
   */
  public calculateHeadYaw(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadYaw']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadYaw']> {
    return this.anatomicalUpperBody.calculateHeadYaw(...args);
  }

  /**
   * [0170] calculateHeadPitch
   * Tính góc cúi ngẩng đầu.
   */
  public calculateHeadPitch(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadPitch']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadPitch']> {
    return this.anatomicalUpperBody.calculateHeadPitch(...args);
  }

  /**
   * [0171] calculateHeadRoll
   * Tính góc nghiêng sang bên của đầu.
   */
  public calculateHeadRoll(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHeadRoll']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHeadRoll']> {
    return this.anatomicalUpperBody.calculateHeadRoll(...args);
  }

  /**
   * [0172] getFaceCenter
   * Lấy tâm khuôn mặt.
   */
  public getFaceCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getFaceCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getFaceCenter']> {
    return this.anatomicalUpperBody.getFaceCenter(...args);
  }

  /**
   * [0173] getForeheadPosition
   * Lấy tọa độ trán.
   */
  public getForeheadPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getForeheadPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getForeheadPosition']> {
    return this.anatomicalUpperBody.getForeheadPosition(...args);
  }

  /**
   * [0174] getChinPosition
   * Lấy tọa độ cằm.
   */
  public getChinPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getChinPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getChinPosition']> {
    return this.anatomicalUpperBody.getChinPosition(...args);
  }

  /**
   * [0175] getJawPosition
   * Lấy tọa độ hàm.
   */
  public getJawPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getJawPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getJawPosition']> {
    return this.anatomicalUpperBody.getJawPosition(...args);
  }

  /**
   * [0176] getLeftEyePosition
   * Lấy tọa độ mắt trái.
   */
  public getLeftEyePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftEyePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftEyePosition']> {
    return this.anatomicalUpperBody.getLeftEyePosition(...args);
  }

  /**
   * [0177] getRightEyePosition
   * Lấy tọa độ mắt phải.
   */
  public getRightEyePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightEyePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightEyePosition']> {
    return this.anatomicalUpperBody.getRightEyePosition(...args);
  }

  /**
   * [0178] getLeftPupilPosition
   * Lấy tọa độ đồng tử trái.
   */
  public getLeftPupilPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftPupilPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftPupilPosition']> {
    return this.anatomicalUpperBody.getLeftPupilPosition(...args);
  }

  /**
   * [0179] getRightPupilPosition
   * Lấy tọa độ đồng tử phải.
   */
  public getRightPupilPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightPupilPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightPupilPosition']> {
    return this.anatomicalUpperBody.getRightPupilPosition(...args);
  }

  /**
   * [0180] getNosePosition
   * Lấy tọa độ mũi.
   */
  public getNosePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNosePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNosePosition']> {
    return this.anatomicalUpperBody.getNosePosition(...args);
  }

  /**
   * [0181] getNoseTipPosition
   * Lấy tọa độ chóp mũi.
   */
  public getNoseTipPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNoseTipPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNoseTipPosition']> {
    return this.anatomicalUpperBody.getNoseTipPosition(...args);
  }

  /**
   * [0182] getMouthCenter
   * Lấy tâm miệng.
   */
  public getMouthCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getMouthCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getMouthCenter']> {
    return this.anatomicalUpperBody.getMouthCenter(...args);
  }

  /**
   * [0183] getUpperLipPosition
   * Lấy tọa độ môi trên.
   */
  public getUpperLipPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getUpperLipPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getUpperLipPosition']> {
    return this.anatomicalUpperBody.getUpperLipPosition(...args);
  }

  /**
   * [0184] getLowerLipPosition
   * Lấy tọa độ môi dưới.
   */
  public getLowerLipPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLowerLipPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLowerLipPosition']> {
    return this.anatomicalUpperBody.getLowerLipPosition(...args);
  }

  /**
   * [0185] getLeftEarPosition
   * Lấy tọa độ tai trái.
   */
  public getLeftEarPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftEarPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftEarPosition']> {
    return this.anatomicalUpperBody.getLeftEarPosition(...args);
  }

  /**
   * [0186] getRightEarPosition
   * Lấy tọa độ tai phải.
   */
  public getRightEarPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightEarPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightEarPosition']> {
    return this.anatomicalUpperBody.getRightEarPosition(...args);
  }

  /**
   * [0187] getLeftEyebrowPosition
   * Lấy tọa độ lông mày trái.
   */
  public getLeftEyebrowPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftEyebrowPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftEyebrowPosition']> {
    return this.anatomicalUpperBody.getLeftEyebrowPosition(...args);
  }

  /**
   * [0188] getRightEyebrowPosition
   * Lấy tọa độ lông mày phải.
   */
  public getRightEyebrowPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightEyebrowPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightEyebrowPosition']> {
    return this.anatomicalUpperBody.getRightEyebrowPosition(...args);
  }

  /**
   * [0189] getLeftCheekPosition
   * Lấy tọa độ má trái.
   */
  public getLeftCheekPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftCheekPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftCheekPosition']> {
    return this.anatomicalUpperBody.getLeftCheekPosition(...args);
  }

  /**
   * [0190] getRightCheekPosition
   * Lấy tọa độ má phải.
   */
  public getRightCheekPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightCheekPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightCheekPosition']> {
    return this.anatomicalUpperBody.getRightCheekPosition(...args);
  }

  /**
   * [0191] calculateEyeDistance
   * Tính khoảng cách giữa hai mắt.
   */
  public calculateEyeDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateEyeDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateEyeDistance']> {
    return this.anatomicalUpperBody.calculateEyeDistance(...args);
  }

  /**
   * [0192] calculateEyeGazeDirection
   * Tính hướng nhìn của mắt.
   */
  public calculateEyeGazeDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateEyeGazeDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateEyeGazeDirection']> {
    return this.anatomicalUpperBody.calculateEyeGazeDirection(...args);
  }

  /**
   * [0193] calculatePupilOffset
   * Tính độ lệch đồng tử.
   */
  public calculatePupilOffset(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePupilOffset']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePupilOffset']> {
    return this.anatomicalUpperBody.calculatePupilOffset(...args);
  }

  /**
   * [0194] calculateFaceOrientation
   * Tính hướng khuôn mặt.
   */
  public calculateFaceOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateFaceOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateFaceOrientation']> {
    return this.anatomicalUpperBody.calculateFaceOrientation(...args);
  }

  /**
   * [0195] calculateFaceNormal
   * Tính pháp tuyến khuôn mặt.
   */
  public calculateFaceNormal(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateFaceNormal']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateFaceNormal']> {
    return this.anatomicalUpperBody.calculateFaceNormal(...args);
  }

  /**
   * [0196] calculateFaceSymmetry
   * Tính độ đối xứng khuôn mặt.
   */
  public calculateFaceSymmetry(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateFaceSymmetry']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateFaceSymmetry']> {
    return this.anatomicalUpperBody.calculateFaceSymmetry(...args);
  }

  /**
   * [0197] calculateMouthOpening
   * Tính độ mở miệng.
   */
  public calculateMouthOpening(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateMouthOpening']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateMouthOpening']> {
    return this.anatomicalUpperBody.calculateMouthOpening(...args);
  }

  /**
   * [0198] calculateJawOpeningAngle
   * Tính góc mở hàm.
   */
  public calculateJawOpeningAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateJawOpeningAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateJawOpeningAngle']> {
    return this.anatomicalUpperBody.calculateJawOpeningAngle(...args);
  }

  /**
   * [0199] calculateBlinkAmount
   * Tính mức độ nhắm mắt.
   */
  public calculateBlinkAmount(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateBlinkAmount']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateBlinkAmount']> {
    return this.anatomicalUpperBody.calculateBlinkAmount(...args);
  }

  /**
   * [0200] calculateFacialLandmarkDistance
   * Tính khoảng cách giữa các điểm mốc khuôn mặt.
   */
  public calculateFacialLandmarkDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateFacialLandmarkDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateFacialLandmarkDistance']> {
    return this.anatomicalUpperBody.calculateFacialLandmarkDistance(...args);
  }

  /**
   * [0201] getNeckPosition
   * Lấy tọa độ cổ.
   */
  public getNeckPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckPosition']> {
    return this.anatomicalUpperBody.getNeckPosition(...args);
  }

  /**
   * [0202] getNeckCenter
   * Lấy tâm cổ.
   */
  public getNeckCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckCenter']> {
    return this.anatomicalUpperBody.getNeckCenter(...args);
  }

  /**
   * [0203] getNeckBasePosition
   * Lấy tọa độ gốc cổ.
   */
  public getNeckBasePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckBasePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckBasePosition']> {
    return this.anatomicalUpperBody.getNeckBasePosition(...args);
  }

  /**
   * [0204] getNeckTopPosition
   * Lấy tọa độ đỉnh cổ.
   */
  public getNeckTopPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckTopPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckTopPosition']> {
    return this.anatomicalUpperBody.getNeckTopPosition(...args);
  }

  /**
   * [0205] getNeckForwardVector
   * Lấy hướng phía trước cổ.
   */
  public getNeckForwardVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckForwardVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckForwardVector']> {
    return this.anatomicalUpperBody.getNeckForwardVector(...args);
  }

  /**
   * [0206] getNeckUpVector
   * Lấy hướng phía trên cổ.
   */
  public getNeckUpVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getNeckUpVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getNeckUpVector']> {
    return this.anatomicalUpperBody.getNeckUpVector(...args);
  }

  /**
   * [0207] calculateNeckLength
   * Tính chiều dài cổ.
   */
  public calculateNeckLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckLength']> {
    return this.anatomicalUpperBody.calculateNeckLength(...args);
  }

  /**
   * [0208] calculateNeckOrientation
   * Tính hướng cổ.
   */
  public calculateNeckOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckOrientation']> {
    return this.anatomicalUpperBody.calculateNeckOrientation(...args);
  }

  /**
   * [0209] calculateNeckBendAngle
   * Tính góc gập cổ.
   */
  public calculateNeckBendAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckBendAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckBendAngle']> {
    return this.anatomicalUpperBody.calculateNeckBendAngle(...args);
  }

  /**
   * [0210] calculateNeckTwistAngle
   * Tính góc xoay cổ.
   */
  public calculateNeckTwistAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckTwistAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckTwistAngle']> {
    return this.anatomicalUpperBody.calculateNeckTwistAngle(...args);
  }

  /**
   * [0211] calculateNeckCurvature
   * Tính độ cong cổ.
   */
  public calculateNeckCurvature(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckCurvature']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckCurvature']> {
    return this.anatomicalUpperBody.calculateNeckCurvature(...args);
  }

  /**
   * [0212] calculateNeckToHeadDistance
   * Tính khoảng cách cổ đến đầu.
   */
  public calculateNeckToHeadDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckToHeadDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckToHeadDistance']> {
    return this.anatomicalUpperBody.calculateNeckToHeadDistance(...args);
  }

  /**
   * [0213] calculateNeckToShoulderDistance
   * Tính khoảng cách cổ đến vai.
   */
  public calculateNeckToShoulderDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckToShoulderDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckToShoulderDistance']> {
    return this.anatomicalUpperBody.calculateNeckToShoulderDistance(...args);
  }

  /**
   * [0214] calculateNeckBoundingBox
   * Tính hộp bao cổ.
   */
  public calculateNeckBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckBoundingBox']> {
    return this.anatomicalUpperBody.calculateNeckBoundingBox(...args);
  }

  /**
   * [0215] calculateNeckJointRotation
   * Tính góc quay khớp cổ.
   */
  public calculateNeckJointRotation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateNeckJointRotation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateNeckJointRotation']> {
    return this.anatomicalUpperBody.calculateNeckJointRotation(...args);
  }

  /**
   * [0216] getLeftShoulderPosition
   * Lấy tọa độ vai trái.
   */
  public getLeftShoulderPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftShoulderPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftShoulderPosition']> {
    return this.anatomicalUpperBody.getLeftShoulderPosition(...args);
  }

  /**
   * [0217] getRightShoulderPosition
   * Lấy tọa độ vai phải.
   */
  public getRightShoulderPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightShoulderPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightShoulderPosition']> {
    return this.anatomicalUpperBody.getRightShoulderPosition(...args);
  }

  /**
   * [0218] getShoulderCenter
   * Lấy tâm hai vai.
   */
  public getShoulderCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getShoulderCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getShoulderCenter']> {
    return this.anatomicalUpperBody.getShoulderCenter(...args);
  }

  /**
   * [0219] getLeftShoulderTip
   * Lấy tọa độ đầu ngoài vai trái.
   */
  public getLeftShoulderTip(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftShoulderTip']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftShoulderTip']> {
    return this.anatomicalUpperBody.getLeftShoulderTip(...args);
  }

  /**
   * [0220] getRightShoulderTip
   * Lấy tọa độ đầu ngoài vai phải.
   */
  public getRightShoulderTip(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightShoulderTip']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightShoulderTip']> {
    return this.anatomicalUpperBody.getRightShoulderTip(...args);
  }

  /**
   * [0221] getLeftClaviclePosition
   * Lấy tọa độ xương đòn trái.
   */
  public getLeftClaviclePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftClaviclePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftClaviclePosition']> {
    return this.anatomicalUpperBody.getLeftClaviclePosition(...args);
  }

  /**
   * [0222] getRightClaviclePosition
   * Lấy tọa độ xương đòn phải.
   */
  public getRightClaviclePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightClaviclePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightClaviclePosition']> {
    return this.anatomicalUpperBody.getRightClaviclePosition(...args);
  }

  /**
   * [0223] getLeftScapulaPosition
   * Lấy tọa độ xương bả vai trái.
   */
  public getLeftScapulaPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftScapulaPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftScapulaPosition']> {
    return this.anatomicalUpperBody.getLeftScapulaPosition(...args);
  }

  /**
   * [0224] getRightScapulaPosition
   * Lấy tọa độ xương bả vai phải.
   */
  public getRightScapulaPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightScapulaPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightScapulaPosition']> {
    return this.anatomicalUpperBody.getRightScapulaPosition(...args);
  }

  /**
   * [0225] calculateShoulderWidth
   * Tính chiều rộng vai.
   */
  public calculateShoulderWidth(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderWidth']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderWidth']> {
    return this.anatomicalUpperBody.calculateShoulderWidth(...args);
  }

  /**
   * [0226] calculateShoulderHeight
   * Tính độ cao vai.
   */
  public calculateShoulderHeight(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderHeight']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderHeight']> {
    return this.anatomicalUpperBody.calculateShoulderHeight(...args);
  }

  /**
   * [0227] calculateShoulderSlope
   * Tính độ dốc đường vai.
   */
  public calculateShoulderSlope(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderSlope']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderSlope']> {
    return this.anatomicalUpperBody.calculateShoulderSlope(...args);
  }

  /**
   * [0228] calculateShoulderSymmetry
   * Tính độ đối xứng vai.
   */
  public calculateShoulderSymmetry(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderSymmetry']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderSymmetry']> {
    return this.anatomicalUpperBody.calculateShoulderSymmetry(...args);
  }

  /**
   * [0229] calculateShoulderDistanceToHead
   * Tính khoảng cách vai đến đầu.
   */
  public calculateShoulderDistanceToHead(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderDistanceToHead']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderDistanceToHead']> {
    return this.anatomicalUpperBody.calculateShoulderDistanceToHead(...args);
  }

  /**
   * [0230] calculateShoulderDistanceToHip
   * Tính khoảng cách vai đến hông.
   */
  public calculateShoulderDistanceToHip(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderDistanceToHip']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderDistanceToHip']> {
    return this.anatomicalUpperBody.calculateShoulderDistanceToHip(...args);
  }

  /**
   * [0231] calculateShoulderToShoulderVector
   * Tính vector giữa hai vai.
   */
  public calculateShoulderToShoulderVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderToShoulderVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderToShoulderVector']> {
    return this.anatomicalUpperBody.calculateShoulderToShoulderVector(...args);
  }

  /**
   * [0232] calculateShoulderForwardDirection
   * Tính hướng trước của vai.
   */
  public calculateShoulderForwardDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderForwardDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderForwardDirection']> {
    return this.anatomicalUpperBody.calculateShoulderForwardDirection(...args);
  }

  /**
   * [0233] calculateShoulderUpDirection
   * Tính hướng trên của vai.
   */
  public calculateShoulderUpDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderUpDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderUpDirection']> {
    return this.anatomicalUpperBody.calculateShoulderUpDirection(...args);
  }

  /**
   * [0234] calculateShoulderJointAngle
   * Tính góc khớp vai.
   */
  public calculateShoulderJointAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderJointAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderJointAngle']> {
    return this.anatomicalUpperBody.calculateShoulderJointAngle(...args);
  }

  /**
   * [0235] calculateShoulderAbduction
   * Tính góc dạng vai.
   */
  public calculateShoulderAbduction(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderAbduction']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderAbduction']> {
    return this.anatomicalUpperBody.calculateShoulderAbduction(...args);
  }

  /**
   * [0236] calculateShoulderAdduction
   * Tính góc khép vai.
   */
  public calculateShoulderAdduction(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderAdduction']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderAdduction']> {
    return this.anatomicalUpperBody.calculateShoulderAdduction(...args);
  }

  /**
   * [0237] calculateShoulderFlexion
   * Tính góc gập vai.
   */
  public calculateShoulderFlexion(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderFlexion']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderFlexion']> {
    return this.anatomicalUpperBody.calculateShoulderFlexion(...args);
  }

  /**
   * [0238] calculateShoulderExtension
   * Tính góc duỗi vai.
   */
  public calculateShoulderExtension(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderExtension']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderExtension']> {
    return this.anatomicalUpperBody.calculateShoulderExtension(...args);
  }

  /**
   * [0239] calculateShoulderInternalRotation
   * Tính góc xoay trong vai.
   */
  public calculateShoulderInternalRotation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderInternalRotation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderInternalRotation']> {
    return this.anatomicalUpperBody.calculateShoulderInternalRotation(...args);
  }

  /**
   * [0240] calculateShoulderExternalRotation
   * Tính góc xoay ngoài vai.
   */
  public calculateShoulderExternalRotation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderExternalRotation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderExternalRotation']> {
    return this.anatomicalUpperBody.calculateShoulderExternalRotation(...args);
  }

  /**
   * [0241] calculateShoulderBoundingBox
   * Tính hộp bao vùng vai.
   */
  public calculateShoulderBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderBoundingBox']> {
    return this.anatomicalUpperBody.calculateShoulderBoundingBox(...args);
  }

  /**
   * [0242] calculateShoulderCenterOfMass
   * Tính tâm khối lượng vùng vai.
   */
  public calculateShoulderCenterOfMass(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderCenterOfMass']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderCenterOfMass']> {
    return this.anatomicalUpperBody.calculateShoulderCenterOfMass(...args);
  }

  /**
   * [0243] calculateClavicleLength
   * Tính chiều dài xương đòn.
   */
  public calculateClavicleLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateClavicleLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateClavicleLength']> {
    return this.anatomicalUpperBody.calculateClavicleLength(...args);
  }

  /**
   * [0244] calculateScapulaOrientation
   * Tính hướng xương bả vai.
   */
  public calculateScapulaOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateScapulaOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateScapulaOrientation']> {
    return this.anatomicalUpperBody.calculateScapulaOrientation(...args);
  }

  /**
   * [0245] calculateShoulderToElbowDistance
   * Tính khoảng cách vai đến khuỷu.
   */
  public calculateShoulderToElbowDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderToElbowDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderToElbowDistance']> {
    return this.anatomicalUpperBody.calculateShoulderToElbowDistance(...args);
  }

  /**
   * [0246] calculateShoulderToWristDistance
   * Tính khoảng cách vai đến cổ tay.
   */
  public calculateShoulderToWristDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderToWristDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderToWristDistance']> {
    return this.anatomicalUpperBody.calculateShoulderToWristDistance(...args);
  }

  /**
   * [0247] calculateShoulderToHandDistance
   * Tính khoảng cách vai đến bàn tay.
   */
  public calculateShoulderToHandDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderToHandDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderToHandDistance']> {
    return this.anatomicalUpperBody.calculateShoulderToHandDistance(...args);
  }

  /**
   * [0248] calculateShoulderMotionVector
   * Tính vector chuyển động vai.
   */
  public calculateShoulderMotionVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderMotionVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderMotionVector']> {
    return this.anatomicalUpperBody.calculateShoulderMotionVector(...args);
  }

  /**
   * [0249] calculateShoulderVelocity
   * Tính vận tốc vai.
   */
  public calculateShoulderVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderVelocity']> {
    return this.anatomicalUpperBody.calculateShoulderVelocity(...args);
  }

  /**
   * [0250] calculateShoulderAcceleration
   * Tính gia tốc vai.
   */
  public calculateShoulderAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateShoulderAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateShoulderAcceleration']> {
    return this.anatomicalUpperBody.calculateShoulderAcceleration(...args);
  }

  /**
   * [0251] getLeftUpperArmPosition
   * Lấy tọa độ cánh tay trên trái.
   */
  public getLeftUpperArmPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftUpperArmPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftUpperArmPosition']> {
    return this.anatomicalUpperBody.getLeftUpperArmPosition(...args);
  }

  /**
   * [0252] getRightUpperArmPosition
   * Lấy tọa độ cánh tay trên phải.
   */
  public getRightUpperArmPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightUpperArmPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightUpperArmPosition']> {
    return this.anatomicalUpperBody.getRightUpperArmPosition(...args);
  }

  /**
   * [0253] getLeftUpperArmCenter
   * Lấy tâm cánh tay trên trái.
   */
  public getLeftUpperArmCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftUpperArmCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftUpperArmCenter']> {
    return this.anatomicalUpperBody.getLeftUpperArmCenter(...args);
  }

  /**
   * [0254] getRightUpperArmCenter
   * Lấy tâm cánh tay trên phải.
   */
  public getRightUpperArmCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightUpperArmCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightUpperArmCenter']> {
    return this.anatomicalUpperBody.getRightUpperArmCenter(...args);
  }

  /**
   * [0255] getLeftUpperArmStart
   * Lấy điểm đầu cánh tay trên trái.
   */
  public getLeftUpperArmStart(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftUpperArmStart']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftUpperArmStart']> {
    return this.anatomicalUpperBody.getLeftUpperArmStart(...args);
  }

  /**
   * [0256] getRightUpperArmStart
   * Lấy điểm đầu cánh tay trên phải.
   */
  public getRightUpperArmStart(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightUpperArmStart']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightUpperArmStart']> {
    return this.anatomicalUpperBody.getRightUpperArmStart(...args);
  }

  /**
   * [0257] getLeftUpperArmEnd
   * Lấy điểm cuối cánh tay trên trái.
   */
  public getLeftUpperArmEnd(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftUpperArmEnd']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftUpperArmEnd']> {
    return this.anatomicalUpperBody.getLeftUpperArmEnd(...args);
  }

  /**
   * [0258] getRightUpperArmEnd
   * Lấy điểm cuối cánh tay trên phải.
   */
  public getRightUpperArmEnd(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightUpperArmEnd']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightUpperArmEnd']> {
    return this.anatomicalUpperBody.getRightUpperArmEnd(...args);
  }

  /**
   * [0259] calculateUpperArmLength
   * Tính chiều dài cánh tay trên.
   */
  public calculateUpperArmLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmLength']> {
    return this.anatomicalUpperBody.calculateUpperArmLength(...args);
  }

  /**
   * [0260] calculateUpperArmDirection
   * Tính hướng cánh tay trên.
   */
  public calculateUpperArmDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmDirection']> {
    return this.anatomicalUpperBody.calculateUpperArmDirection(...args);
  }

  /**
   * [0261] calculateUpperArmOrientation
   * Tính hướng quay cánh tay trên.
   */
  public calculateUpperArmOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmOrientation']> {
    return this.anatomicalUpperBody.calculateUpperArmOrientation(...args);
  }

  /**
   * [0262] calculateUpperArmAngle
   * Tính góc cánh tay trên.
   */
  public calculateUpperArmAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmAngle']> {
    return this.anatomicalUpperBody.calculateUpperArmAngle(...args);
  }

  /**
   * [0263] calculateUpperArmVelocity
   * Tính vận tốc cánh tay trên.
   */
  public calculateUpperArmVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmVelocity']> {
    return this.anatomicalUpperBody.calculateUpperArmVelocity(...args);
  }

  /**
   * [0264] calculateUpperArmAcceleration
   * Tính gia tốc cánh tay trên.
   */
  public calculateUpperArmAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmAcceleration']> {
    return this.anatomicalUpperBody.calculateUpperArmAcceleration(...args);
  }

  /**
   * [0265] calculateUpperArmBoundingBox
   * Tính hộp bao cánh tay trên.
   */
  public calculateUpperArmBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmBoundingBox']> {
    return this.anatomicalUpperBody.calculateUpperArmBoundingBox(...args);
  }

  /**
   * [0266] calculateUpperArmRadius
   * Tính bán kính cánh tay trên.
   */
  public calculateUpperArmRadius(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmRadius']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmRadius']> {
    return this.anatomicalUpperBody.calculateUpperArmRadius(...args);
  }

  /**
   * [0267] calculateUpperArmVolume
   * Tính thể tích cánh tay trên.
   */
  public calculateUpperArmVolume(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmVolume']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmVolume']> {
    return this.anatomicalUpperBody.calculateUpperArmVolume(...args);
  }

  /**
   * [0268] calculateUpperArmSurfaceArea
   * Tính diện tích bề mặt cánh tay trên.
   */
  public calculateUpperArmSurfaceArea(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmSurfaceArea']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmSurfaceArea']> {
    return this.anatomicalUpperBody.calculateUpperArmSurfaceArea(...args);
  }

  /**
   * [0269] calculateUpperArmCenterOfMass
   * Tính tâm khối lượng cánh tay trên.
   */
  public calculateUpperArmCenterOfMass(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmCenterOfMass']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmCenterOfMass']> {
    return this.anatomicalUpperBody.calculateUpperArmCenterOfMass(...args);
  }

  /**
   * [0270] calculateUpperArmToTorsoDistance
   * Tính khoảng cách cánh tay trên đến thân.
   */
  public calculateUpperArmToTorsoDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateUpperArmToTorsoDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateUpperArmToTorsoDistance']> {
    return this.anatomicalUpperBody.calculateUpperArmToTorsoDistance(...args);
  }

  /**
   * [0271] getLeftElbowPosition
   * Lấy tọa độ khuỷu tay trái.
   */
  public getLeftElbowPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftElbowPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftElbowPosition']> {
    return this.anatomicalUpperBody.getLeftElbowPosition(...args);
  }

  /**
   * [0272] getRightElbowPosition
   * Lấy tọa độ khuỷu tay phải.
   */
  public getRightElbowPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightElbowPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightElbowPosition']> {
    return this.anatomicalUpperBody.getRightElbowPosition(...args);
  }

  /**
   * [0273] getLeftElbowCenter
   * Lấy tâm khuỷu tay trái.
   */
  public getLeftElbowCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftElbowCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftElbowCenter']> {
    return this.anatomicalUpperBody.getLeftElbowCenter(...args);
  }

  /**
   * [0274] getRightElbowCenter
   * Lấy tâm khuỷu tay phải.
   */
  public getRightElbowCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightElbowCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightElbowCenter']> {
    return this.anatomicalUpperBody.getRightElbowCenter(...args);
  }

  /**
   * [0275] getLeftElbowTip
   * Lấy tọa độ đầu khuỷu trái.
   */
  public getLeftElbowTip(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftElbowTip']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftElbowTip']> {
    return this.anatomicalUpperBody.getLeftElbowTip(...args);
  }

  /**
   * [0276] getRightElbowTip
   * Lấy tọa độ đầu khuỷu phải.
   */
  public getRightElbowTip(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightElbowTip']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightElbowTip']> {
    return this.anatomicalUpperBody.getRightElbowTip(...args);
  }

  /**
   * [0277] calculateElbowToShoulderDistance
   * Tính khoảng cách khuỷu đến vai.
   */
  public calculateElbowToShoulderDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowToShoulderDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowToShoulderDistance']> {
    return this.anatomicalUpperBody.calculateElbowToShoulderDistance(...args);
  }

  /**
   * [0278] calculateElbowToWristDistance
   * Tính khoảng cách khuỷu đến cổ tay.
   */
  public calculateElbowToWristDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowToWristDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowToWristDistance']> {
    return this.anatomicalUpperBody.calculateElbowToWristDistance(...args);
  }

  /**
   * [0279] calculateElbowToHandDistance
   * Tính khoảng cách khuỷu đến bàn tay.
   */
  public calculateElbowToHandDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowToHandDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowToHandDistance']> {
    return this.anatomicalUpperBody.calculateElbowToHandDistance(...args);
  }

  /**
   * [0280] calculateElbowBendAngle
   * Tính góc gập khuỷu.
   */
  public calculateElbowBendAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowBendAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowBendAngle']> {
    return this.anatomicalUpperBody.calculateElbowBendAngle(...args);
  }

  /**
   * [0281] calculateElbowExtensionAngle
   * Tính góc duỗi khuỷu.
   */
  public calculateElbowExtensionAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowExtensionAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowExtensionAngle']> {
    return this.anatomicalUpperBody.calculateElbowExtensionAngle(...args);
  }

  /**
   * [0282] calculateElbowFlexionAngle
   * Tính góc gập khuỷu theo khớp.
   */
  public calculateElbowFlexionAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowFlexionAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowFlexionAngle']> {
    return this.anatomicalUpperBody.calculateElbowFlexionAngle(...args);
  }

  /**
   * [0283] calculateElbowTwistAngle
   * Tính góc xoay khuỷu.
   */
  public calculateElbowTwistAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowTwistAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowTwistAngle']> {
    return this.anatomicalUpperBody.calculateElbowTwistAngle(...args);
  }

  /**
   * [0284] calculateElbowJointAxis
   * Tính trục khớp khuỷu.
   */
  public calculateElbowJointAxis(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowJointAxis']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowJointAxis']> {
    return this.anatomicalUpperBody.calculateElbowJointAxis(...args);
  }

  /**
   * [0285] calculateElbowJointNormal
   * Tính pháp tuyến khớp khuỷu.
   */
  public calculateElbowJointNormal(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowJointNormal']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowJointNormal']> {
    return this.anatomicalUpperBody.calculateElbowJointNormal(...args);
  }

  /**
   * [0286] calculateElbowVelocity
   * Tính vận tốc khuỷu.
   */
  public calculateElbowVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowVelocity']> {
    return this.anatomicalUpperBody.calculateElbowVelocity(...args);
  }

  /**
   * [0287] calculateElbowAcceleration
   * Tính gia tốc khuỷu.
   */
  public calculateElbowAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowAcceleration']> {
    return this.anatomicalUpperBody.calculateElbowAcceleration(...args);
  }

  /**
   * [0288] calculateElbowBoundingBox
   * Tính hộp bao khuỷu.
   */
  public calculateElbowBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowBoundingBox']> {
    return this.anatomicalUpperBody.calculateElbowBoundingBox(...args);
  }

  /**
   * [0289] calculateElbowBoundingSphere
   * Tính hình cầu bao khuỷu.
   */
  public calculateElbowBoundingSphere(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowBoundingSphere']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowBoundingSphere']> {
    return this.anatomicalUpperBody.calculateElbowBoundingSphere(...args);
  }

  /**
   * [0290] calculateElbowSymmetry
   * Tính độ đối xứng khuỷu tay.
   */
  public calculateElbowSymmetry(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateElbowSymmetry']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateElbowSymmetry']> {
    return this.anatomicalUpperBody.calculateElbowSymmetry(...args);
  }

  /**
   * [0291] calculateArmReachDistance
   * Tính khoảng với của cánh tay.
   */
  public calculateArmReachDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmReachDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmReachDistance']> {
    return this.anatomicalUpperBody.calculateArmReachDistance(...args);
  }

  /**
   * [0292] calculateArmReachDirection
   * Tính hướng với của cánh tay.
   */
  public calculateArmReachDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmReachDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmReachDirection']> {
    return this.anatomicalUpperBody.calculateArmReachDirection(...args);
  }

  /**
   * [0293] calculateArmReachEnvelope
   * Tính vùng không gian cánh tay có thể với tới.
   */
  public calculateArmReachEnvelope(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmReachEnvelope']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmReachEnvelope']> {
    return this.anatomicalUpperBody.calculateArmReachEnvelope(...args);
  }

  /**
   * [0294] calculateArmSweepAngle
   * Tính góc quét cánh tay.
   */
  public calculateArmSweepAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmSweepAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmSweepAngle']> {
    return this.anatomicalUpperBody.calculateArmSweepAngle(...args);
  }

  /**
   * [0295] calculateArmSwingAmplitude
   * Tính biên độ vung tay.
   */
  public calculateArmSwingAmplitude(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmSwingAmplitude']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmSwingAmplitude']> {
    return this.anatomicalUpperBody.calculateArmSwingAmplitude(...args);
  }

  /**
   * [0296] calculateArmPoseError
   * Tính sai lệch tư thế cánh tay.
   */
  public calculateArmPoseError(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmPoseError']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmPoseError']> {
    return this.anatomicalUpperBody.calculateArmPoseError(...args);
  }

  /**
   * [0297] calculateArmSegmentAlignment
   * Tính độ thẳng hàng các đoạn cánh tay.
   */
  public calculateArmSegmentAlignment(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmSegmentAlignment']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmSegmentAlignment']> {
    return this.anatomicalUpperBody.calculateArmSegmentAlignment(...args);
  }

  /**
   * [0298] calculateArmJointChainLength
   * Tính tổng chiều dài chuỗi khớp tay.
   */
  public calculateArmJointChainLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmJointChainLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmJointChainLength']> {
    return this.anatomicalUpperBody.calculateArmJointChainLength(...args);
  }

  /**
   * [0299] calculateArmEndEffectorPosition
   * Tính vị trí đầu công tác của tay.
   */
  public calculateArmEndEffectorPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmEndEffectorPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmEndEffectorPosition']> {
    return this.anatomicalUpperBody.calculateArmEndEffectorPosition(...args);
  }

  /**
   * [0300] calculateArmInverseKinematics
   * Tính động học ngược cánh tay.
   */
  public calculateArmInverseKinematics(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateArmInverseKinematics']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateArmInverseKinematics']> {
    return this.anatomicalUpperBody.calculateArmInverseKinematics(...args);
  }

  /**
   * [0301] getLeftForearmPosition
   * Lấy tọa độ cẳng tay trái.
   */
  public getLeftForearmPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftForearmPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftForearmPosition']> {
    return this.anatomicalUpperBody.getLeftForearmPosition(...args);
  }

  /**
   * [0302] getRightForearmPosition
   * Lấy tọa độ cẳng tay phải.
   */
  public getRightForearmPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightForearmPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightForearmPosition']> {
    return this.anatomicalUpperBody.getRightForearmPosition(...args);
  }

  /**
   * [0303] getLeftForearmCenter
   * Lấy tâm cẳng tay trái.
   */
  public getLeftForearmCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftForearmCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftForearmCenter']> {
    return this.anatomicalUpperBody.getLeftForearmCenter(...args);
  }

  /**
   * [0304] getRightForearmCenter
   * Lấy tâm cẳng tay phải.
   */
  public getRightForearmCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightForearmCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightForearmCenter']> {
    return this.anatomicalUpperBody.getRightForearmCenter(...args);
  }

  /**
   * [0305] getLeftForearmStart
   * Lấy điểm đầu cẳng tay trái.
   */
  public getLeftForearmStart(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftForearmStart']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftForearmStart']> {
    return this.anatomicalUpperBody.getLeftForearmStart(...args);
  }

  /**
   * [0306] getRightForearmStart
   * Lấy điểm đầu cẳng tay phải.
   */
  public getRightForearmStart(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightForearmStart']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightForearmStart']> {
    return this.anatomicalUpperBody.getRightForearmStart(...args);
  }

  /**
   * [0307] getLeftForearmEnd
   * Lấy điểm cuối cẳng tay trái.
   */
  public getLeftForearmEnd(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftForearmEnd']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftForearmEnd']> {
    return this.anatomicalUpperBody.getLeftForearmEnd(...args);
  }

  /**
   * [0308] getRightForearmEnd
   * Lấy điểm cuối cẳng tay phải.
   */
  public getRightForearmEnd(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightForearmEnd']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightForearmEnd']> {
    return this.anatomicalUpperBody.getRightForearmEnd(...args);
  }

  /**
   * [0309] calculateForearmLength
   * Tính chiều dài cẳng tay.
   */
  public calculateForearmLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmLength']> {
    return this.anatomicalUpperBody.calculateForearmLength(...args);
  }

  /**
   * [0310] calculateForearmDirection
   * Tính hướng cẳng tay.
   */
  public calculateForearmDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmDirection']> {
    return this.anatomicalUpperBody.calculateForearmDirection(...args);
  }

  /**
   * [0311] calculateForearmOrientation
   * Tính hướng quay cẳng tay.
   */
  public calculateForearmOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmOrientation']> {
    return this.anatomicalUpperBody.calculateForearmOrientation(...args);
  }

  /**
   * [0312] calculateForearmAngle
   * Tính góc cẳng tay.
   */
  public calculateForearmAngle(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmAngle']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmAngle']> {
    return this.anatomicalUpperBody.calculateForearmAngle(...args);
  }

  /**
   * [0313] calculateForearmVelocity
   * Tính vận tốc cẳng tay.
   */
  public calculateForearmVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmVelocity']> {
    return this.anatomicalUpperBody.calculateForearmVelocity(...args);
  }

  /**
   * [0314] calculateForearmAcceleration
   * Tính gia tốc cẳng tay.
   */
  public calculateForearmAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmAcceleration']> {
    return this.anatomicalUpperBody.calculateForearmAcceleration(...args);
  }

  /**
   * [0315] calculateForearmBoundingBox
   * Tính hộp bao cẳng tay.
   */
  public calculateForearmBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmBoundingBox']> {
    return this.anatomicalUpperBody.calculateForearmBoundingBox(...args);
  }

  /**
   * [0316] calculateForearmRadius
   * Tính bán kính cẳng tay.
   */
  public calculateForearmRadius(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmRadius']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmRadius']> {
    return this.anatomicalUpperBody.calculateForearmRadius(...args);
  }

  /**
   * [0317] calculateForearmVolume
   * Tính thể tích cẳng tay.
   */
  public calculateForearmVolume(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmVolume']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmVolume']> {
    return this.anatomicalUpperBody.calculateForearmVolume(...args);
  }

  /**
   * [0318] calculateForearmSurfaceArea
   * Tính diện tích bề mặt cẳng tay.
   */
  public calculateForearmSurfaceArea(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmSurfaceArea']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmSurfaceArea']> {
    return this.anatomicalUpperBody.calculateForearmSurfaceArea(...args);
  }

  /**
   * [0319] calculateForearmCenterOfMass
   * Tính tâm khối lượng cẳng tay.
   */
  public calculateForearmCenterOfMass(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmCenterOfMass']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmCenterOfMass']> {
    return this.anatomicalUpperBody.calculateForearmCenterOfMass(...args);
  }

  /**
   * [0320] calculateForearmTwist
   * Tính độ xoay dọc cẳng tay.
   */
  public calculateForearmTwist(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateForearmTwist']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateForearmTwist']> {
    return this.anatomicalUpperBody.calculateForearmTwist(...args);
  }

  /**
   * [0321] getLeftWristPosition
   * Lấy tọa độ cổ tay trái.
   */
  public getLeftWristPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftWristPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftWristPosition']> {
    return this.anatomicalUpperBody.getLeftWristPosition(...args);
  }

  /**
   * [0322] getRightWristPosition
   * Lấy tọa độ cổ tay phải.
   */
  public getRightWristPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightWristPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightWristPosition']> {
    return this.anatomicalUpperBody.getRightWristPosition(...args);
  }

  /**
   * [0323] getLeftWristCenter
   * Lấy tâm cổ tay trái.
   */
  public getLeftWristCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftWristCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftWristCenter']> {
    return this.anatomicalUpperBody.getLeftWristCenter(...args);
  }

  /**
   * [0324] getRightWristCenter
   * Lấy tâm cổ tay phải.
   */
  public getRightWristCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightWristCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightWristCenter']> {
    return this.anatomicalUpperBody.getRightWristCenter(...args);
  }

  /**
   * [0325] getLeftWristJointPosition
   * Lấy tọa độ khớp cổ tay trái.
   */
  public getLeftWristJointPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftWristJointPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftWristJointPosition']> {
    return this.anatomicalUpperBody.getLeftWristJointPosition(...args);
  }

  /**
   * [0326] getRightWristJointPosition
   * Lấy tọa độ khớp cổ tay phải.
   */
  public getRightWristJointPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightWristJointPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightWristJointPosition']> {
    return this.anatomicalUpperBody.getRightWristJointPosition(...args);
  }

  /**
   * [0327] getLeftWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay trái.
   */
  public getLeftWristFrontPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftWristFrontPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftWristFrontPosition']> {
    return this.anatomicalUpperBody.getLeftWristFrontPosition(...args);
  }

  /**
   * [0328] getRightWristFrontPosition
   * Lấy tọa độ mặt trước cổ tay phải.
   */
  public getRightWristFrontPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightWristFrontPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightWristFrontPosition']> {
    return this.anatomicalUpperBody.getRightWristFrontPosition(...args);
  }

  /**
   * [0329] getLeftWristBackPosition
   * Lấy tọa độ mặt sau cổ tay trái.
   */
  public getLeftWristBackPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftWristBackPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftWristBackPosition']> {
    return this.anatomicalUpperBody.getLeftWristBackPosition(...args);
  }

  /**
   * [0330] getRightWristBackPosition
   * Lấy tọa độ mặt sau cổ tay phải.
   */
  public getRightWristBackPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightWristBackPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightWristBackPosition']> {
    return this.anatomicalUpperBody.getRightWristBackPosition(...args);
  }

  /**
   * [0331] calculateWristToElbowDistance
   * Tính khoảng cách cổ tay đến khuỷu.
   */
  public calculateWristToElbowDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristToElbowDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristToElbowDistance']> {
    return this.anatomicalUpperBody.calculateWristToElbowDistance(...args);
  }

  /**
   * [0332] calculateWristToPalmDistance
   * Tính khoảng cách cổ tay đến lòng bàn tay.
   */
  public calculateWristToPalmDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristToPalmDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristToPalmDistance']> {
    return this.anatomicalUpperBody.calculateWristToPalmDistance(...args);
  }

  /**
   * [0333] calculateWristWidth
   * Tính chiều rộng cổ tay.
   */
  public calculateWristWidth(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristWidth']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristWidth']> {
    return this.anatomicalUpperBody.calculateWristWidth(...args);
  }

  /**
   * [0334] calculateWristThickness
   * Tính độ dày cổ tay.
   */
  public calculateWristThickness(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristThickness']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristThickness']> {
    return this.anatomicalUpperBody.calculateWristThickness(...args);
  }

  /**
   * [0335] calculateWristFlexion
   * Tính góc gập cổ tay.
   */
  public calculateWristFlexion(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristFlexion']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristFlexion']> {
    return this.anatomicalUpperBody.calculateWristFlexion(...args);
  }

  /**
   * [0336] calculateWristExtension
   * Tính góc duỗi cổ tay.
   */
  public calculateWristExtension(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristExtension']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristExtension']> {
    return this.anatomicalUpperBody.calculateWristExtension(...args);
  }

  /**
   * [0337] calculateWristAbduction
   * Tính góc nghiêng cổ tay theo hướng dạng.
   */
  public calculateWristAbduction(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristAbduction']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristAbduction']> {
    return this.anatomicalUpperBody.calculateWristAbduction(...args);
  }

  /**
   * [0338] calculateWristAdduction
   * Tính góc nghiêng cổ tay theo hướng khép.
   */
  public calculateWristAdduction(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristAdduction']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristAdduction']> {
    return this.anatomicalUpperBody.calculateWristAdduction(...args);
  }

  /**
   * [0339] calculateWristPronation
   * Tính góc sấp cổ tay.
   */
  public calculateWristPronation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristPronation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristPronation']> {
    return this.anatomicalUpperBody.calculateWristPronation(...args);
  }

  /**
   * [0340] calculateWristSupination
   * Tính góc ngửa cổ tay.
   */
  public calculateWristSupination(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristSupination']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristSupination']> {
    return this.anatomicalUpperBody.calculateWristSupination(...args);
  }

  /**
   * [0341] calculateWristJointAxis
   * Tính trục khớp cổ tay.
   */
  public calculateWristJointAxis(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristJointAxis']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristJointAxis']> {
    return this.anatomicalUpperBody.calculateWristJointAxis(...args);
  }

  /**
   * [0342] calculateWristJointNormal
   * Tính pháp tuyến khớp cổ tay.
   */
  public calculateWristJointNormal(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristJointNormal']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristJointNormal']> {
    return this.anatomicalUpperBody.calculateWristJointNormal(...args);
  }

  /**
   * [0343] calculateWristVelocity
   * Tính vận tốc cổ tay.
   */
  public calculateWristVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristVelocity']> {
    return this.anatomicalUpperBody.calculateWristVelocity(...args);
  }

  /**
   * [0344] calculateWristAcceleration
   * Tính gia tốc cổ tay.
   */
  public calculateWristAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristAcceleration']> {
    return this.anatomicalUpperBody.calculateWristAcceleration(...args);
  }

  /**
   * [0345] calculateWristBoundingBox
   * Tính hộp bao cổ tay.
   */
  public calculateWristBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristBoundingBox']> {
    return this.anatomicalUpperBody.calculateWristBoundingBox(...args);
  }

  /**
   * [0346] calculateWristBoundingSphere
   * Tính hình cầu bao cổ tay.
   */
  public calculateWristBoundingSphere(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristBoundingSphere']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristBoundingSphere']> {
    return this.anatomicalUpperBody.calculateWristBoundingSphere(...args);
  }

  /**
   * [0347] calculateWristTrajectory
   * Tính quỹ đạo cổ tay.
   */
  public calculateWristTrajectory(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristTrajectory']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristTrajectory']> {
    return this.anatomicalUpperBody.calculateWristTrajectory(...args);
  }

  /**
   * [0348] calculateWristMotionSmoothness
   * Tính độ mượt chuyển động cổ tay.
   */
  public calculateWristMotionSmoothness(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristMotionSmoothness']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristMotionSmoothness']> {
    return this.anatomicalUpperBody.calculateWristMotionSmoothness(...args);
  }

  /**
   * [0349] calculateWristPoseError
   * Tính sai lệch tư thế cổ tay.
   */
  public calculateWristPoseError(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristPoseError']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristPoseError']> {
    return this.anatomicalUpperBody.calculateWristPoseError(...args);
  }

  /**
   * [0350] calculateWristTargetOffset
   * Tính độ lệch cổ tay so với mục tiêu.
   */
  public calculateWristTargetOffset(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateWristTargetOffset']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateWristTargetOffset']> {
    return this.anatomicalUpperBody.calculateWristTargetOffset(...args);
  }

  /**
   * [0351] getLeftHandPosition
   * Lấy tọa độ bàn tay trái.
   */
  public getLeftHandPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftHandPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftHandPosition']> {
    return this.anatomicalUpperBody.getLeftHandPosition(...args);
  }

  /**
   * [0352] getRightHandPosition
   * Lấy tọa độ bàn tay phải.
   */
  public getRightHandPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightHandPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightHandPosition']> {
    return this.anatomicalUpperBody.getRightHandPosition(...args);
  }

  /**
   * [0353] getLeftHandCenter
   * Lấy tâm bàn tay trái.
   */
  public getLeftHandCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getLeftHandCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getLeftHandCenter']> {
    return this.anatomicalUpperBody.getLeftHandCenter(...args);
  }

  /**
   * [0354] getRightHandCenter
   * Lấy tâm bàn tay phải.
   */
  public getRightHandCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getRightHandCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getRightHandCenter']> {
    return this.anatomicalUpperBody.getRightHandCenter(...args);
  }

  /**
   * [0355] getPalmCenter
   * Lấy tâm lòng bàn tay.
   */
  public getPalmCenter(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmCenter']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmCenter']> {
    return this.anatomicalUpperBody.getPalmCenter(...args);
  }

  /**
   * [0356] getPalmBasePosition
   * Lấy tọa độ gốc lòng bàn tay.
   */
  public getPalmBasePosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmBasePosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmBasePosition']> {
    return this.anatomicalUpperBody.getPalmBasePosition(...args);
  }

  /**
   * [0357] getPalmTopPosition
   * Lấy tọa độ đầu lòng bàn tay.
   */
  public getPalmTopPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmTopPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmTopPosition']> {
    return this.anatomicalUpperBody.getPalmTopPosition(...args);
  }

  /**
   * [0358] getPalmLeftEdge
   * Lấy tọa độ mép trái lòng bàn tay.
   */
  public getPalmLeftEdge(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmLeftEdge']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmLeftEdge']> {
    return this.anatomicalUpperBody.getPalmLeftEdge(...args);
  }

  /**
   * [0359] getPalmRightEdge
   * Lấy tọa độ mép phải lòng bàn tay.
   */
  public getPalmRightEdge(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmRightEdge']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmRightEdge']> {
    return this.anatomicalUpperBody.getPalmRightEdge(...args);
  }

  /**
   * [0360] getPalmFrontPosition
   * Lấy tọa độ mặt trước lòng bàn tay.
   */
  public getPalmFrontPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmFrontPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmFrontPosition']> {
    return this.anatomicalUpperBody.getPalmFrontPosition(...args);
  }

  /**
   * [0361] getPalmBackPosition
   * Lấy tọa độ mặt sau bàn tay.
   */
  public getPalmBackPosition(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmBackPosition']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmBackPosition']> {
    return this.anatomicalUpperBody.getPalmBackPosition(...args);
  }

  /**
   * [0362] getPalmNormal
   * Lấy pháp tuyến lòng bàn tay.
   */
  public getPalmNormal(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmNormal']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmNormal']> {
    return this.anatomicalUpperBody.getPalmNormal(...args);
  }

  /**
   * [0363] getPalmForwardVector
   * Lấy hướng phía trước lòng bàn tay.
   */
  public getPalmForwardVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmForwardVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmForwardVector']> {
    return this.anatomicalUpperBody.getPalmForwardVector(...args);
  }

  /**
   * [0364] getPalmUpVector
   * Lấy hướng phía trên lòng bàn tay.
   */
  public getPalmUpVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmUpVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmUpVector']> {
    return this.anatomicalUpperBody.getPalmUpVector(...args);
  }

  /**
   * [0365] getPalmRightVector
   * Lấy hướng bên phải lòng bàn tay.
   */
  public getPalmRightVector(
    ...args: Parameters<AnatomicalUpperBodySubsystem['getPalmRightVector']>
  ): ReturnType<AnatomicalUpperBodySubsystem['getPalmRightVector']> {
    return this.anatomicalUpperBody.getPalmRightVector(...args);
  }

  /**
   * [0366] calculatePalmWidth
   * Tính chiều rộng lòng bàn tay.
   */
  public calculatePalmWidth(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmWidth']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmWidth']> {
    return this.anatomicalUpperBody.calculatePalmWidth(...args);
  }

  /**
   * [0367] calculatePalmLength
   * Tính chiều dài lòng bàn tay.
   */
  public calculatePalmLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmLength']> {
    return this.anatomicalUpperBody.calculatePalmLength(...args);
  }

  /**
   * [0368] calculatePalmThickness
   * Tính độ dày lòng bàn tay.
   */
  public calculatePalmThickness(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmThickness']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmThickness']> {
    return this.anatomicalUpperBody.calculatePalmThickness(...args);
  }

  /**
   * [0369] calculatePalmArea
   * Tính diện tích lòng bàn tay.
   */
  public calculatePalmArea(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmArea']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmArea']> {
    return this.anatomicalUpperBody.calculatePalmArea(...args);
  }

  /**
   * [0370] calculatePalmVolume
   * Tính thể tích bàn tay.
   */
  public calculatePalmVolume(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmVolume']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmVolume']> {
    return this.anatomicalUpperBody.calculatePalmVolume(...args);
  }

  /**
   * [0371] calculatePalmOrientation
   * Tính hướng lòng bàn tay.
   */
  public calculatePalmOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmOrientation']> {
    return this.anatomicalUpperBody.calculatePalmOrientation(...args);
  }

  /**
   * [0372] calculatePalmRotation
   * Tính góc quay lòng bàn tay.
   */
  public calculatePalmRotation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmRotation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmRotation']> {
    return this.anatomicalUpperBody.calculatePalmRotation(...args);
  }

  /**
   * [0373] calculatePalmTilt
   * Tính độ nghiêng lòng bàn tay.
   */
  public calculatePalmTilt(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmTilt']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmTilt']> {
    return this.anatomicalUpperBody.calculatePalmTilt(...args);
  }

  /**
   * [0374] calculatePalmCurvature
   * Tính độ cong lòng bàn tay.
   */
  public calculatePalmCurvature(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmCurvature']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmCurvature']> {
    return this.anatomicalUpperBody.calculatePalmCurvature(...args);
  }

  /**
   * [0375] calculatePalmCenterOfMass
   * Tính tâm khối lượng bàn tay.
   */
  public calculatePalmCenterOfMass(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmCenterOfMass']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmCenterOfMass']> {
    return this.anatomicalUpperBody.calculatePalmCenterOfMass(...args);
  }

  /**
   * [0376] calculatePalmBoundingBox
   * Tính hộp bao bàn tay.
   */
  public calculatePalmBoundingBox(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmBoundingBox']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmBoundingBox']> {
    return this.anatomicalUpperBody.calculatePalmBoundingBox(...args);
  }

  /**
   * [0377] calculatePalmBoundingSphere
   * Tính hình cầu bao bàn tay.
   */
  public calculatePalmBoundingSphere(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmBoundingSphere']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmBoundingSphere']> {
    return this.anatomicalUpperBody.calculatePalmBoundingSphere(...args);
  }

  /**
   * [0378] calculatePalmSymmetry
   * Tính độ đối xứng bàn tay.
   */
  public calculatePalmSymmetry(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmSymmetry']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmSymmetry']> {
    return this.anatomicalUpperBody.calculatePalmSymmetry(...args);
  }

  /**
   * [0379] calculatePalmToWristDistance
   * Tính khoảng cách lòng bàn tay đến cổ tay.
   */
  public calculatePalmToWristDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmToWristDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmToWristDistance']> {
    return this.anatomicalUpperBody.calculatePalmToWristDistance(...args);
  }

  /**
   * [0380] calculatePalmToFingerBaseDistance
   * Tính khoảng cách lòng bàn tay đến gốc ngón tay.
   */
  public calculatePalmToFingerBaseDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculatePalmToFingerBaseDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculatePalmToFingerBaseDistance']> {
    return this.anatomicalUpperBody.calculatePalmToFingerBaseDistance(...args);
  }

  /**
   * [0381] calculateHandSpan
   * Tính độ sải bàn tay.
   */
  public calculateHandSpan(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandSpan']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandSpan']> {
    return this.anatomicalUpperBody.calculateHandSpan(...args);
  }

  /**
   * [0382] calculateHandWidth
   * Tính chiều rộng bàn tay.
   */
  public calculateHandWidth(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandWidth']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandWidth']> {
    return this.anatomicalUpperBody.calculateHandWidth(...args);
  }

  /**
   * [0383] calculateHandLength
   * Tính chiều dài bàn tay.
   */
  public calculateHandLength(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandLength']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandLength']> {
    return this.anatomicalUpperBody.calculateHandLength(...args);
  }

  /**
   * [0384] calculateHandThickness
   * Tính độ dày bàn tay.
   */
  public calculateHandThickness(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandThickness']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandThickness']> {
    return this.anatomicalUpperBody.calculateHandThickness(...args);
  }

  /**
   * [0385] calculateHandOrientation
   * Tính hướng bàn tay.
   */
  public calculateHandOrientation(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandOrientation']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandOrientation']> {
    return this.anatomicalUpperBody.calculateHandOrientation(...args);
  }

  /**
   * [0386] calculateHandForwardDirection
   * Tính hướng phía trước bàn tay.
   */
  public calculateHandForwardDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandForwardDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandForwardDirection']> {
    return this.anatomicalUpperBody.calculateHandForwardDirection(...args);
  }

  /**
   * [0387] calculateHandUpDirection
   * Tính hướng phía trên bàn tay.
   */
  public calculateHandUpDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandUpDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandUpDirection']> {
    return this.anatomicalUpperBody.calculateHandUpDirection(...args);
  }

  /**
   * [0388] calculateHandRightDirection
   * Tính hướng bên phải bàn tay.
   */
  public calculateHandRightDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandRightDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandRightDirection']> {
    return this.anatomicalUpperBody.calculateHandRightDirection(...args);
  }

  /**
   * [0389] calculateHandVelocity
   * Tính vận tốc bàn tay.
   */
  public calculateHandVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandVelocity']> {
    return this.anatomicalUpperBody.calculateHandVelocity(...args);
  }

  /**
   * [0390] calculateHandAcceleration
   * Tính gia tốc bàn tay.
   */
  public calculateHandAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandAcceleration']> {
    return this.anatomicalUpperBody.calculateHandAcceleration(...args);
  }

  /**
   * [0391] calculateHandAngularVelocity
   * Tính vận tốc góc bàn tay.
   */
  public calculateHandAngularVelocity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandAngularVelocity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandAngularVelocity']> {
    return this.anatomicalUpperBody.calculateHandAngularVelocity(...args);
  }

  /**
   * [0392] calculateHandAngularAcceleration
   * Tính gia tốc góc bàn tay.
   */
  public calculateHandAngularAcceleration(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandAngularAcceleration']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandAngularAcceleration']> {
    return this.anatomicalUpperBody.calculateHandAngularAcceleration(...args);
  }

  /**
   * [0393] calculateHandTrajectory
   * Tính quỹ đạo bàn tay.
   */
  public calculateHandTrajectory(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandTrajectory']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandTrajectory']> {
    return this.anatomicalUpperBody.calculateHandTrajectory(...args);
  }

  /**
   * [0394] calculateHandMotionDirection
   * Tính hướng chuyển động bàn tay.
   */
  public calculateHandMotionDirection(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandMotionDirection']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandMotionDirection']> {
    return this.anatomicalUpperBody.calculateHandMotionDirection(...args);
  }

  /**
   * [0395] calculateHandMotionDistance
   * Tính quãng đường bàn tay di chuyển.
   */
  public calculateHandMotionDistance(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandMotionDistance']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandMotionDistance']> {
    return this.anatomicalUpperBody.calculateHandMotionDistance(...args);
  }

  /**
   * [0396] calculateHandPose
   * Tính tư thế bàn tay.
   */
  public calculateHandPose(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandPose']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandPose']> {
    return this.anatomicalUpperBody.calculateHandPose(...args);
  }

  /**
   * [0397] calculateHandPoseDifference
   * Tính chênh lệch tư thế bàn tay.
   */
  public calculateHandPoseDifference(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandPoseDifference']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandPoseDifference']> {
    return this.anatomicalUpperBody.calculateHandPoseDifference(...args);
  }

  /**
   * [0398] calculateHandPoseSimilarity
   * Tính độ tương đồng tư thế bàn tay.
   */
  public calculateHandPoseSimilarity(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandPoseSimilarity']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandPoseSimilarity']> {
    return this.anatomicalUpperBody.calculateHandPoseSimilarity(...args);
  }

  /**
   * [0399] calculateHandJointAngles
   * Tính các góc khớp bàn tay.
   */
  public calculateHandJointAngles(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandJointAngles']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandJointAngles']> {
    return this.anatomicalUpperBody.calculateHandJointAngles(...args);
  }

  /**
   * [0400] calculateHandInverseKinematics
   * Tính động học ngược bàn tay.
   */
  public calculateHandInverseKinematics(
    ...args: Parameters<AnatomicalUpperBodySubsystem['calculateHandInverseKinematics']>
  ): ReturnType<AnatomicalUpperBodySubsystem['calculateHandInverseKinematics']> {
    return this.anatomicalUpperBody.calculateHandInverseKinematics(...args);
  }

  /**
   * [0401] getThumbRootPosition
   * Lấy tọa độ gốc ngón cái.
   */
  public getThumbRootPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbRootPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbRootPosition']> {
    return this.anatomicalHandDigits.getThumbRootPosition(...args);
  }

  /**
   * [0402] getThumbCMCPosition
   * Lấy tọa độ khớp CMC ngón cái.
   */
  public getThumbCMCPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbCMCPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbCMCPosition']> {
    return this.anatomicalHandDigits.getThumbCMCPosition(...args);
  }

  /**
   * [0403] getThumbMCPPosition
   * Lấy tọa độ khớp MCP ngón cái.
   */
  public getThumbMCPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbMCPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbMCPPosition']> {
    return this.anatomicalHandDigits.getThumbMCPPosition(...args);
  }

  /**
   * [0404] getThumbIPPosition
   * Lấy tọa độ khớp IP ngón cái.
   */
  public getThumbIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbIPPosition']> {
    return this.anatomicalHandDigits.getThumbIPPosition(...args);
  }

  /**
   * [0405] getThumbTipPosition
   * Lấy tọa độ đầu ngón cái.
   */
  public getThumbTipPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbTipPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbTipPosition']> {
    return this.anatomicalHandDigits.getThumbTipPosition(...args);
  }

  /**
   * [0406] getThumbNailPosition
   * Lấy tọa độ móng ngón cái.
   */
  public getThumbNailPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbNailPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbNailPosition']> {
    return this.anatomicalHandDigits.getThumbNailPosition(...args);
  }

  /**
   * [0407] getThumbPadPosition
   * Lấy tọa độ đệm ngón cái.
   */
  public getThumbPadPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbPadPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbPadPosition']> {
    return this.anatomicalHandDigits.getThumbPadPosition(...args);
  }

  /**
   * [0408] getThumbBasePosition
   * Lấy tọa độ đáy ngón cái.
   */
  public getThumbBasePosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbBasePosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbBasePosition']> {
    return this.anatomicalHandDigits.getThumbBasePosition(...args);
  }

  /**
   * [0409] getThumbProximalJoint
   * Lấy tọa độ khớp gần ngón cái.
   */
  public getThumbProximalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbProximalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbProximalJoint']> {
    return this.anatomicalHandDigits.getThumbProximalJoint(...args);
  }

  /**
   * [0410] getThumbDistalJoint
   * Lấy tọa độ khớp xa ngón cái.
   */
  public getThumbDistalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getThumbDistalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getThumbDistalJoint']> {
    return this.anatomicalHandDigits.getThumbDistalJoint(...args);
  }

  /**
   * [0411] calculateThumbLength
   * Tính chiều dài ngón cái.
   */
  public calculateThumbLength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbLength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbLength']> {
    return this.anatomicalHandDigits.calculateThumbLength(...args);
  }

  /**
   * [0412] calculateThumbWidth
   * Tính chiều rộng ngón cái.
   */
  public calculateThumbWidth(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbWidth']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbWidth']> {
    return this.anatomicalHandDigits.calculateThumbWidth(...args);
  }

  /**
   * [0413] calculateThumbThickness
   * Tính độ dày ngón cái.
   */
  public calculateThumbThickness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbThickness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbThickness']> {
    return this.anatomicalHandDigits.calculateThumbThickness(...args);
  }

  /**
   * [0414] calculateThumbCurvature
   * Tính độ cong ngón cái.
   */
  public calculateThumbCurvature(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbCurvature']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbCurvature']> {
    return this.anatomicalHandDigits.calculateThumbCurvature(...args);
  }

  /**
   * [0415] calculateThumbDirection
   * Tính hướng ngón cái.
   */
  public calculateThumbDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbDirection']> {
    return this.anatomicalHandDigits.calculateThumbDirection(...args);
  }

  /**
   * [0416] calculateThumbOrientation
   * Tính hướng quay ngón cái.
   */
  public calculateThumbOrientation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbOrientation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbOrientation']> {
    return this.anatomicalHandDigits.calculateThumbOrientation(...args);
  }

  /**
   * [0417] calculateThumbFlexion
   * Tính góc gập ngón cái.
   */
  public calculateThumbFlexion(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbFlexion']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbFlexion']> {
    return this.anatomicalHandDigits.calculateThumbFlexion(...args);
  }

  /**
   * [0418] calculateThumbExtension
   * Tính góc duỗi ngón cái.
   */
  public calculateThumbExtension(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbExtension']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbExtension']> {
    return this.anatomicalHandDigits.calculateThumbExtension(...args);
  }

  /**
   * [0419] calculateThumbAbduction
   * Tính góc dạng ngón cái.
   */
  public calculateThumbAbduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbAbduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbAbduction']> {
    return this.anatomicalHandDigits.calculateThumbAbduction(...args);
  }

  /**
   * [0420] calculateThumbAdduction
   * Tính góc khép ngón cái.
   */
  public calculateThumbAdduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbAdduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbAdduction']> {
    return this.anatomicalHandDigits.calculateThumbAdduction(...args);
  }

  /**
   * [0421] calculateThumbOpposition
   * Tính mức độ đối chiếu ngón cái.
   */
  public calculateThumbOpposition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbOpposition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbOpposition']> {
    return this.anatomicalHandDigits.calculateThumbOpposition(...args);
  }

  /**
   * [0422] calculateThumbRotation
   * Tính góc quay ngón cái.
   */
  public calculateThumbRotation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbRotation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbRotation']> {
    return this.anatomicalHandDigits.calculateThumbRotation(...args);
  }

  /**
   * [0423] calculateThumbTipVelocity
   * Tính vận tốc đầu ngón cái.
   */
  public calculateThumbTipVelocity(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipVelocity']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipVelocity']> {
    return this.anatomicalHandDigits.calculateThumbTipVelocity(...args);
  }

  /**
   * [0424] calculateThumbTipAcceleration
   * Tính gia tốc đầu ngón cái.
   */
  public calculateThumbTipAcceleration(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipAcceleration']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipAcceleration']> {
    return this.anatomicalHandDigits.calculateThumbTipAcceleration(...args);
  }

  /**
   * [0425] calculateThumbJointAngles
   * Tính các góc khớp ngón cái.
   */
  public calculateThumbJointAngles(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbJointAngles']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbJointAngles']> {
    return this.anatomicalHandDigits.calculateThumbJointAngles(...args);
  }

  /**
   * [0426] calculateThumbSegmentLengths
   * Tính chiều dài các đốt ngón cái.
   */
  public calculateThumbSegmentLengths(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbSegmentLengths']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbSegmentLengths']> {
    return this.anatomicalHandDigits.calculateThumbSegmentLengths(...args);
  }

  /**
   * [0427] calculateThumbBoundingBox
   * Tính hộp bao ngón cái.
   */
  public calculateThumbBoundingBox(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbBoundingBox']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbBoundingBox']> {
    return this.anatomicalHandDigits.calculateThumbBoundingBox(...args);
  }

  /**
   * [0428] calculateThumbBoundingSphere
   * Tính hình cầu bao ngón cái.
   */
  public calculateThumbBoundingSphere(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbBoundingSphere']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbBoundingSphere']> {
    return this.anatomicalHandDigits.calculateThumbBoundingSphere(...args);
  }

  /**
   * [0429] calculateThumbTipDistanceToIndex
   * Tính khoảng cách đầu ngón cái đến ngón trỏ.
   */
  public calculateThumbTipDistanceToIndex(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToIndex']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToIndex']> {
    return this.anatomicalHandDigits.calculateThumbTipDistanceToIndex(...args);
  }

  /**
   * [0430] calculateThumbTipDistanceToMiddle
   * Tính khoảng cách đầu ngón cái đến ngón giữa.
   */
  public calculateThumbTipDistanceToMiddle(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToMiddle']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToMiddle']> {
    return this.anatomicalHandDigits.calculateThumbTipDistanceToMiddle(...args);
  }

  /**
   * [0431] calculateThumbTipDistanceToRing
   * Tính khoảng cách đầu ngón cái đến ngón áp út.
   */
  public calculateThumbTipDistanceToRing(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToRing']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToRing']> {
    return this.anatomicalHandDigits.calculateThumbTipDistanceToRing(...args);
  }

  /**
   * [0432] calculateThumbTipDistanceToLittle
   * Tính khoảng cách đầu ngón cái đến ngón út.
   */
  public calculateThumbTipDistanceToLittle(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToLittle']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbTipDistanceToLittle']> {
    return this.anatomicalHandDigits.calculateThumbTipDistanceToLittle(...args);
  }

  /**
   * [0433] calculateThumbPinchDistance
   * Tính khoảng cách kẹp giữa ngón cái và ngón khác.
   */
  public calculateThumbPinchDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbPinchDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbPinchDistance']> {
    return this.anatomicalHandDigits.calculateThumbPinchDistance(...args);
  }

  /**
   * [0434] calculateThumbPinchStrength
   * Ước lượng lực kẹp từ mô hình vật lý.
   */
  public calculateThumbPinchStrength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbPinchStrength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbPinchStrength']> {
    return this.anatomicalHandDigits.calculateThumbPinchStrength(...args);
  }

  /**
   * [0435] calculateThumbReachEnvelope
   * Tính vùng với tới của ngón cái.
   */
  public calculateThumbReachEnvelope(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbReachEnvelope']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbReachEnvelope']> {
    return this.anatomicalHandDigits.calculateThumbReachEnvelope(...args);
  }

  /**
   * [0436] calculateThumbContactPoint
   * Tính điểm tiếp xúc ngón cái.
   */
  public calculateThumbContactPoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbContactPoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbContactPoint']> {
    return this.anatomicalHandDigits.calculateThumbContactPoint(...args);
  }

  /**
   * [0437] calculateThumbSurfaceNormal
   * Tính pháp tuyến bề mặt ngón cái.
   */
  public calculateThumbSurfaceNormal(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbSurfaceNormal']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbSurfaceNormal']> {
    return this.anatomicalHandDigits.calculateThumbSurfaceNormal(...args);
  }

  /**
   * [0438] calculateThumbPoseError
   * Tính sai lệch tư thế ngón cái.
   */
  public calculateThumbPoseError(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbPoseError']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbPoseError']> {
    return this.anatomicalHandDigits.calculateThumbPoseError(...args);
  }

  /**
   * [0439] calculateThumbMotionSmoothness
   * Tính độ mượt chuyển động ngón cái.
   */
  public calculateThumbMotionSmoothness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbMotionSmoothness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbMotionSmoothness']> {
    return this.anatomicalHandDigits.calculateThumbMotionSmoothness(...args);
  }

  /**
   * [0440] calculateThumbCollision
   * Kiểm tra va chạm ngón cái.
   */
  public calculateThumbCollision(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateThumbCollision']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateThumbCollision']> {
    return this.anatomicalHandDigits.calculateThumbCollision(...args);
  }

  /**
   * [0441] getIndexFingerRootPosition
   * Lấy tọa độ gốc ngón trỏ.
   */
  public getIndexFingerRootPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerRootPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerRootPosition']> {
    return this.anatomicalHandDigits.getIndexFingerRootPosition(...args);
  }

  /**
   * [0442] getIndexFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón trỏ.
   */
  public getIndexFingerMCPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerMCPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerMCPPosition']> {
    return this.anatomicalHandDigits.getIndexFingerMCPPosition(...args);
  }

  /**
   * [0443] getIndexFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón trỏ.
   */
  public getIndexFingerPIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerPIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerPIPPosition']> {
    return this.anatomicalHandDigits.getIndexFingerPIPPosition(...args);
  }

  /**
   * [0444] getIndexFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón trỏ.
   */
  public getIndexFingerDIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerDIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerDIPPosition']> {
    return this.anatomicalHandDigits.getIndexFingerDIPPosition(...args);
  }

  /**
   * [0445] getIndexFingerTipPosition
   * Lấy tọa độ đầu ngón trỏ.
   */
  public getIndexFingerTipPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerTipPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerTipPosition']> {
    return this.anatomicalHandDigits.getIndexFingerTipPosition(...args);
  }

  /**
   * [0446] getIndexFingerNailPosition
   * Lấy tọa độ móng ngón trỏ.
   */
  public getIndexFingerNailPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerNailPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerNailPosition']> {
    return this.anatomicalHandDigits.getIndexFingerNailPosition(...args);
  }

  /**
   * [0447] getIndexFingerPadPosition
   * Lấy tọa độ đệm ngón trỏ.
   */
  public getIndexFingerPadPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerPadPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerPadPosition']> {
    return this.anatomicalHandDigits.getIndexFingerPadPosition(...args);
  }

  /**
   * [0448] getIndexFingerBasePosition
   * Lấy tọa độ đáy ngón trỏ.
   */
  public getIndexFingerBasePosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerBasePosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerBasePosition']> {
    return this.anatomicalHandDigits.getIndexFingerBasePosition(...args);
  }

  /**
   * [0449] getIndexFingerProximalJoint
   * Lấy tọa độ khớp gần ngón trỏ.
   */
  public getIndexFingerProximalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerProximalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerProximalJoint']> {
    return this.anatomicalHandDigits.getIndexFingerProximalJoint(...args);
  }

  /**
   * [0450] getIndexFingerDistalJoint
   * Lấy tọa độ khớp xa ngón trỏ.
   */
  public getIndexFingerDistalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getIndexFingerDistalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getIndexFingerDistalJoint']> {
    return this.anatomicalHandDigits.getIndexFingerDistalJoint(...args);
  }

  /**
   * [0451] calculateIndexFingerLength
   * Tính chiều dài ngón trỏ.
   */
  public calculateIndexFingerLength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerLength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerLength']> {
    return this.anatomicalHandDigits.calculateIndexFingerLength(...args);
  }

  /**
   * [0452] calculateIndexFingerWidth
   * Tính chiều rộng ngón trỏ.
   */
  public calculateIndexFingerWidth(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerWidth']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerWidth']> {
    return this.anatomicalHandDigits.calculateIndexFingerWidth(...args);
  }

  /**
   * [0453] calculateIndexFingerThickness
   * Tính độ dày ngón trỏ.
   */
  public calculateIndexFingerThickness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerThickness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerThickness']> {
    return this.anatomicalHandDigits.calculateIndexFingerThickness(...args);
  }

  /**
   * [0454] calculateIndexFingerCurvature
   * Tính độ cong ngón trỏ.
   */
  public calculateIndexFingerCurvature(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerCurvature']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerCurvature']> {
    return this.anatomicalHandDigits.calculateIndexFingerCurvature(...args);
  }

  /**
   * [0455] calculateIndexFingerDirection
   * Tính hướng ngón trỏ.
   */
  public calculateIndexFingerDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerDirection']> {
    return this.anatomicalHandDigits.calculateIndexFingerDirection(...args);
  }

  /**
   * [0456] calculateIndexFingerOrientation
   * Tính hướng quay ngón trỏ.
   */
  public calculateIndexFingerOrientation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerOrientation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerOrientation']> {
    return this.anatomicalHandDigits.calculateIndexFingerOrientation(...args);
  }

  /**
   * [0457] calculateIndexFingerFlexion
   * Tính góc gập ngón trỏ.
   */
  public calculateIndexFingerFlexion(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerFlexion']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerFlexion']> {
    return this.anatomicalHandDigits.calculateIndexFingerFlexion(...args);
  }

  /**
   * [0458] calculateIndexFingerExtension
   * Tính góc duỗi ngón trỏ.
   */
  public calculateIndexFingerExtension(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerExtension']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerExtension']> {
    return this.anatomicalHandDigits.calculateIndexFingerExtension(...args);
  }

  /**
   * [0459] calculateIndexFingerAbduction
   * Tính góc dạng ngón trỏ.
   */
  public calculateIndexFingerAbduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerAbduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerAbduction']> {
    return this.anatomicalHandDigits.calculateIndexFingerAbduction(...args);
  }

  /**
   * [0460] calculateIndexFingerAdduction
   * Tính góc khép ngón trỏ.
   */
  public calculateIndexFingerAdduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerAdduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerAdduction']> {
    return this.anatomicalHandDigits.calculateIndexFingerAdduction(...args);
  }

  /**
   * [0461] calculateIndexFingerRotation
   * Tính góc quay ngón trỏ.
   */
  public calculateIndexFingerRotation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerRotation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerRotation']> {
    return this.anatomicalHandDigits.calculateIndexFingerRotation(...args);
  }

  /**
   * [0462] calculateIndexFingerTipVelocity
   * Tính vận tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipVelocity(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerTipVelocity']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerTipVelocity']> {
    return this.anatomicalHandDigits.calculateIndexFingerTipVelocity(...args);
  }

  /**
   * [0463] calculateIndexFingerTipAcceleration
   * Tính gia tốc đầu ngón trỏ.
   */
  public calculateIndexFingerTipAcceleration(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerTipAcceleration']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerTipAcceleration']> {
    return this.anatomicalHandDigits.calculateIndexFingerTipAcceleration(...args);
  }

  /**
   * [0464] calculateIndexFingerJointAngles
   * Tính các góc khớp ngón trỏ.
   */
  public calculateIndexFingerJointAngles(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerJointAngles']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerJointAngles']> {
    return this.anatomicalHandDigits.calculateIndexFingerJointAngles(...args);
  }

  /**
   * [0465] calculateIndexFingerSegmentLengths
   * Tính chiều dài các đốt ngón trỏ.
   */
  public calculateIndexFingerSegmentLengths(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerSegmentLengths']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerSegmentLengths']> {
    return this.anatomicalHandDigits.calculateIndexFingerSegmentLengths(...args);
  }

  /**
   * [0466] calculateIndexFingerBoundingBox
   * Tính hộp bao ngón trỏ.
   */
  public calculateIndexFingerBoundingBox(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerBoundingBox']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerBoundingBox']> {
    return this.anatomicalHandDigits.calculateIndexFingerBoundingBox(...args);
  }

  /**
   * [0467] calculateIndexFingerBoundingSphere
   * Tính hình cầu bao ngón trỏ.
   */
  public calculateIndexFingerBoundingSphere(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerBoundingSphere']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerBoundingSphere']> {
    return this.anatomicalHandDigits.calculateIndexFingerBoundingSphere(...args);
  }

  /**
   * [0468] calculateIndexToThumbDistance
   * Tính khoảng cách ngón trỏ đến ngón cái.
   */
  public calculateIndexToThumbDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexToThumbDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexToThumbDistance']> {
    return this.anatomicalHandDigits.calculateIndexToThumbDistance(...args);
  }

  /**
   * [0469] calculateIndexToMiddleDistance
   * Tính khoảng cách ngón trỏ đến ngón giữa.
   */
  public calculateIndexToMiddleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexToMiddleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexToMiddleDistance']> {
    return this.anatomicalHandDigits.calculateIndexToMiddleDistance(...args);
  }

  /**
   * [0470] calculateIndexToRingDistance
   * Tính khoảng cách ngón trỏ đến ngón áp út.
   */
  public calculateIndexToRingDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexToRingDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexToRingDistance']> {
    return this.anatomicalHandDigits.calculateIndexToRingDistance(...args);
  }

  /**
   * [0471] calculateIndexToLittleDistance
   * Tính khoảng cách ngón trỏ đến ngón út.
   */
  public calculateIndexToLittleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexToLittleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexToLittleDistance']> {
    return this.anatomicalHandDigits.calculateIndexToLittleDistance(...args);
  }

  /**
   * [0472] calculateIndexPointingDirection
   * Tính hướng chỉ của ngón trỏ.
   */
  public calculateIndexPointingDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexPointingDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexPointingDirection']> {
    return this.anatomicalHandDigits.calculateIndexPointingDirection(...args);
  }

  /**
   * [0473] calculateIndexReachEnvelope
   * Tính vùng với tới của ngón trỏ.
   */
  public calculateIndexReachEnvelope(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexReachEnvelope']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexReachEnvelope']> {
    return this.anatomicalHandDigits.calculateIndexReachEnvelope(...args);
  }

  /**
   * [0474] calculateIndexContactPoint
   * Tính điểm tiếp xúc ngón trỏ.
   */
  public calculateIndexContactPoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexContactPoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexContactPoint']> {
    return this.anatomicalHandDigits.calculateIndexContactPoint(...args);
  }

  /**
   * [0475] calculateIndexSurfaceNormal
   * Tính pháp tuyến bề mặt ngón trỏ.
   */
  public calculateIndexSurfaceNormal(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexSurfaceNormal']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexSurfaceNormal']> {
    return this.anatomicalHandDigits.calculateIndexSurfaceNormal(...args);
  }

  /**
   * [0476] calculateIndexPoseError
   * Tính sai lệch tư thế ngón trỏ.
   */
  public calculateIndexPoseError(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexPoseError']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexPoseError']> {
    return this.anatomicalHandDigits.calculateIndexPoseError(...args);
  }

  /**
   * [0477] calculateIndexMotionSmoothness
   * Tính độ mượt chuyển động ngón trỏ.
   */
  public calculateIndexMotionSmoothness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexMotionSmoothness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexMotionSmoothness']> {
    return this.anatomicalHandDigits.calculateIndexMotionSmoothness(...args);
  }

  /**
   * [0478] calculateIndexCollision
   * Kiểm tra va chạm ngón trỏ.
   */
  public calculateIndexCollision(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexCollision']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexCollision']> {
    return this.anatomicalHandDigits.calculateIndexCollision(...args);
  }

  /**
   * [0479] calculateIndexFingerCurl
   * Tính độ cuộn ngón trỏ.
   */
  public calculateIndexFingerCurl(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerCurl']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerCurl']> {
    return this.anatomicalHandDigits.calculateIndexFingerCurl(...args);
  }

  /**
   * [0480] calculateIndexFingerSpread
   * Tính độ xòe ngón trỏ.
   */
  public calculateIndexFingerSpread(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateIndexFingerSpread']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateIndexFingerSpread']> {
    return this.anatomicalHandDigits.calculateIndexFingerSpread(...args);
  }

  /**
   * [0481] getMiddleFingerRootPosition
   * Lấy tọa độ gốc ngón giữa.
   */
  public getMiddleFingerRootPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerRootPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerRootPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerRootPosition(...args);
  }

  /**
   * [0482] getMiddleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón giữa.
   */
  public getMiddleFingerMCPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerMCPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerMCPPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerMCPPosition(...args);
  }

  /**
   * [0483] getMiddleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón giữa.
   */
  public getMiddleFingerPIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerPIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerPIPPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerPIPPosition(...args);
  }

  /**
   * [0484] getMiddleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón giữa.
   */
  public getMiddleFingerDIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerDIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerDIPPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerDIPPosition(...args);
  }

  /**
   * [0485] getMiddleFingerTipPosition
   * Lấy tọa độ đầu ngón giữa.
   */
  public getMiddleFingerTipPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerTipPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerTipPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerTipPosition(...args);
  }

  /**
   * [0486] getMiddleFingerNailPosition
   * Lấy tọa độ móng ngón giữa.
   */
  public getMiddleFingerNailPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerNailPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerNailPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerNailPosition(...args);
  }

  /**
   * [0487] getMiddleFingerPadPosition
   * Lấy tọa độ đệm ngón giữa.
   */
  public getMiddleFingerPadPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerPadPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerPadPosition']> {
    return this.anatomicalHandDigits.getMiddleFingerPadPosition(...args);
  }

  /**
   * [0488] getMiddleFingerBasePosition
   * Lấy tọa độ đáy ngón giữa.
   */
  public getMiddleFingerBasePosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerBasePosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerBasePosition']> {
    return this.anatomicalHandDigits.getMiddleFingerBasePosition(...args);
  }

  /**
   * [0489] getMiddleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón giữa.
   */
  public getMiddleFingerProximalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerProximalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerProximalJoint']> {
    return this.anatomicalHandDigits.getMiddleFingerProximalJoint(...args);
  }

  /**
   * [0490] getMiddleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón giữa.
   */
  public getMiddleFingerDistalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getMiddleFingerDistalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getMiddleFingerDistalJoint']> {
    return this.anatomicalHandDigits.getMiddleFingerDistalJoint(...args);
  }

  /**
   * [0491] calculateMiddleFingerLength
   * Tính chiều dài ngón giữa.
   */
  public calculateMiddleFingerLength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerLength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerLength']> {
    return this.anatomicalHandDigits.calculateMiddleFingerLength(...args);
  }

  /**
   * [0492] calculateMiddleFingerWidth
   * Tính chiều rộng ngón giữa.
   */
  public calculateMiddleFingerWidth(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerWidth']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerWidth']> {
    return this.anatomicalHandDigits.calculateMiddleFingerWidth(...args);
  }

  /**
   * [0493] calculateMiddleFingerThickness
   * Tính độ dày ngón giữa.
   */
  public calculateMiddleFingerThickness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerThickness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerThickness']> {
    return this.anatomicalHandDigits.calculateMiddleFingerThickness(...args);
  }

  /**
   * [0494] calculateMiddleFingerCurvature
   * Tính độ cong ngón giữa.
   */
  public calculateMiddleFingerCurvature(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCurvature']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCurvature']> {
    return this.anatomicalHandDigits.calculateMiddleFingerCurvature(...args);
  }

  /**
   * [0495] calculateMiddleFingerDirection
   * Tính hướng ngón giữa.
   */
  public calculateMiddleFingerDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerDirection']> {
    return this.anatomicalHandDigits.calculateMiddleFingerDirection(...args);
  }

  /**
   * [0496] calculateMiddleFingerOrientation
   * Tính hướng quay ngón giữa.
   */
  public calculateMiddleFingerOrientation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerOrientation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerOrientation']> {
    return this.anatomicalHandDigits.calculateMiddleFingerOrientation(...args);
  }

  /**
   * [0497] calculateMiddleFingerFlexion
   * Tính góc gập ngón giữa.
   */
  public calculateMiddleFingerFlexion(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerFlexion']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerFlexion']> {
    return this.anatomicalHandDigits.calculateMiddleFingerFlexion(...args);
  }

  /**
   * [0498] calculateMiddleFingerExtension
   * Tính góc duỗi ngón giữa.
   */
  public calculateMiddleFingerExtension(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerExtension']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerExtension']> {
    return this.anatomicalHandDigits.calculateMiddleFingerExtension(...args);
  }

  /**
   * [0499] calculateMiddleFingerAbduction
   * Tính góc dạng ngón giữa.
   */
  public calculateMiddleFingerAbduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAbduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAbduction']> {
    return this.anatomicalHandDigits.calculateMiddleFingerAbduction(...args);
  }

  /**
   * [0500] calculateMiddleFingerAdduction
   * Tính góc khép ngón giữa.
   */
  public calculateMiddleFingerAdduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAdduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAdduction']> {
    return this.anatomicalHandDigits.calculateMiddleFingerAdduction(...args);
  }

  /**
   * [0501] calculateMiddleFingerRotation
   * Tính góc quay ngón giữa.
   */
  public calculateMiddleFingerRotation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerRotation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerRotation']> {
    return this.anatomicalHandDigits.calculateMiddleFingerRotation(...args);
  }

  /**
   * [0502] calculateMiddleFingerTipVelocity
   * Tính vận tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipVelocity(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerTipVelocity']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerTipVelocity']> {
    return this.anatomicalHandDigits.calculateMiddleFingerTipVelocity(...args);
  }

  /**
   * [0503] calculateMiddleFingerTipAcceleration
   * Tính gia tốc đầu ngón giữa.
   */
  public calculateMiddleFingerTipAcceleration(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerTipAcceleration']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerTipAcceleration']> {
    return this.anatomicalHandDigits.calculateMiddleFingerTipAcceleration(...args);
  }

  /**
   * [0504] calculateMiddleFingerJointAngles
   * Tính các góc khớp ngón giữa.
   */
  public calculateMiddleFingerJointAngles(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerJointAngles']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerJointAngles']> {
    return this.anatomicalHandDigits.calculateMiddleFingerJointAngles(...args);
  }

  /**
   * [0505] calculateMiddleFingerSegmentLengths
   * Tính chiều dài các đốt ngón giữa.
   */
  public calculateMiddleFingerSegmentLengths(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSegmentLengths']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSegmentLengths']> {
    return this.anatomicalHandDigits.calculateMiddleFingerSegmentLengths(...args);
  }

  /**
   * [0506] calculateMiddleFingerBoundingBox
   * Tính hộp bao ngón giữa.
   */
  public calculateMiddleFingerBoundingBox(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerBoundingBox']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerBoundingBox']> {
    return this.anatomicalHandDigits.calculateMiddleFingerBoundingBox(...args);
  }

  /**
   * [0507] calculateMiddleFingerBoundingSphere
   * Tính hình cầu bao ngón giữa.
   */
  public calculateMiddleFingerBoundingSphere(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerBoundingSphere']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerBoundingSphere']> {
    return this.anatomicalHandDigits.calculateMiddleFingerBoundingSphere(...args);
  }

  /**
   * [0508] calculateMiddleToThumbDistance
   * Tính khoảng cách ngón giữa đến ngón cái.
   */
  public calculateMiddleToThumbDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleToThumbDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleToThumbDistance']> {
    return this.anatomicalHandDigits.calculateMiddleToThumbDistance(...args);
  }

  /**
   * [0509] calculateMiddleToIndexDistance
   * Tính khoảng cách ngón giữa đến ngón trỏ.
   */
  public calculateMiddleToIndexDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleToIndexDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleToIndexDistance']> {
    return this.anatomicalHandDigits.calculateMiddleToIndexDistance(...args);
  }

  /**
   * [0510] calculateMiddleToRingDistance
   * Tính khoảng cách ngón giữa đến ngón áp út.
   */
  public calculateMiddleToRingDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleToRingDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleToRingDistance']> {
    return this.anatomicalHandDigits.calculateMiddleToRingDistance(...args);
  }

  /**
   * [0511] calculateMiddleToLittleDistance
   * Tính khoảng cách ngón giữa đến ngón út.
   */
  public calculateMiddleToLittleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleToLittleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleToLittleDistance']> {
    return this.anatomicalHandDigits.calculateMiddleToLittleDistance(...args);
  }

  /**
   * [0512] calculateMiddleFingerReachEnvelope
   * Tính vùng với tới của ngón giữa.
   */
  public calculateMiddleFingerReachEnvelope(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerReachEnvelope']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerReachEnvelope']> {
    return this.anatomicalHandDigits.calculateMiddleFingerReachEnvelope(...args);
  }

  /**
   * [0513] calculateMiddleFingerContactPoint
   * Tính điểm tiếp xúc ngón giữa.
   */
  public calculateMiddleFingerContactPoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerContactPoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerContactPoint']> {
    return this.anatomicalHandDigits.calculateMiddleFingerContactPoint(...args);
  }

  /**
   * [0514] calculateMiddleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón giữa.
   */
  public calculateMiddleFingerSurfaceNormal(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSurfaceNormal']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSurfaceNormal']> {
    return this.anatomicalHandDigits.calculateMiddleFingerSurfaceNormal(...args);
  }

  /**
   * [0515] calculateMiddleFingerPoseError
   * Tính sai lệch tư thế ngón giữa.
   */
  public calculateMiddleFingerPoseError(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerPoseError']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerPoseError']> {
    return this.anatomicalHandDigits.calculateMiddleFingerPoseError(...args);
  }

  /**
   * [0516] calculateMiddleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón giữa.
   */
  public calculateMiddleFingerMotionSmoothness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerMotionSmoothness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerMotionSmoothness']> {
    return this.anatomicalHandDigits.calculateMiddleFingerMotionSmoothness(...args);
  }

  /**
   * [0517] calculateMiddleFingerCollision
   * Kiểm tra va chạm ngón giữa.
   */
  public calculateMiddleFingerCollision(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCollision']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCollision']> {
    return this.anatomicalHandDigits.calculateMiddleFingerCollision(...args);
  }

  /**
   * [0518] calculateMiddleFingerCurl
   * Tính độ cuộn ngón giữa.
   */
  public calculateMiddleFingerCurl(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCurl']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerCurl']> {
    return this.anatomicalHandDigits.calculateMiddleFingerCurl(...args);
  }

  /**
   * [0519] calculateMiddleFingerSpread
   * Tính độ xòe ngón giữa.
   */
  public calculateMiddleFingerSpread(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSpread']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerSpread']> {
    return this.anatomicalHandDigits.calculateMiddleFingerSpread(...args);
  }

  /**
   * [0520] calculateMiddleFingerAlignment
   * Tính độ thẳng hàng ngón giữa.
   */
  public calculateMiddleFingerAlignment(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAlignment']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateMiddleFingerAlignment']> {
    return this.anatomicalHandDigits.calculateMiddleFingerAlignment(...args);
  }

  /**
   * [0521] getRingFingerRootPosition
   * Lấy tọa độ gốc ngón áp út.
   */
  public getRingFingerRootPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerRootPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerRootPosition']> {
    return this.anatomicalHandDigits.getRingFingerRootPosition(...args);
  }

  /**
   * [0522] getRingFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón áp út.
   */
  public getRingFingerMCPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerMCPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerMCPPosition']> {
    return this.anatomicalHandDigits.getRingFingerMCPPosition(...args);
  }

  /**
   * [0523] getRingFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón áp út.
   */
  public getRingFingerPIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerPIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerPIPPosition']> {
    return this.anatomicalHandDigits.getRingFingerPIPPosition(...args);
  }

  /**
   * [0524] getRingFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón áp út.
   */
  public getRingFingerDIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerDIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerDIPPosition']> {
    return this.anatomicalHandDigits.getRingFingerDIPPosition(...args);
  }

  /**
   * [0525] getRingFingerTipPosition
   * Lấy tọa độ đầu ngón áp út.
   */
  public getRingFingerTipPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerTipPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerTipPosition']> {
    return this.anatomicalHandDigits.getRingFingerTipPosition(...args);
  }

  /**
   * [0526] getRingFingerNailPosition
   * Lấy tọa độ móng ngón áp út.
   */
  public getRingFingerNailPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerNailPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerNailPosition']> {
    return this.anatomicalHandDigits.getRingFingerNailPosition(...args);
  }

  /**
   * [0527] getRingFingerPadPosition
   * Lấy tọa độ đệm ngón áp út.
   */
  public getRingFingerPadPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerPadPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerPadPosition']> {
    return this.anatomicalHandDigits.getRingFingerPadPosition(...args);
  }

  /**
   * [0528] getRingFingerBasePosition
   * Lấy tọa độ đáy ngón áp út.
   */
  public getRingFingerBasePosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerBasePosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerBasePosition']> {
    return this.anatomicalHandDigits.getRingFingerBasePosition(...args);
  }

  /**
   * [0529] getRingFingerProximalJoint
   * Lấy tọa độ khớp gần ngón áp út.
   */
  public getRingFingerProximalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerProximalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerProximalJoint']> {
    return this.anatomicalHandDigits.getRingFingerProximalJoint(...args);
  }

  /**
   * [0530] getRingFingerDistalJoint
   * Lấy tọa độ khớp xa ngón áp út.
   */
  public getRingFingerDistalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getRingFingerDistalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getRingFingerDistalJoint']> {
    return this.anatomicalHandDigits.getRingFingerDistalJoint(...args);
  }

  /**
   * [0531] calculateRingFingerLength
   * Tính chiều dài ngón áp út.
   */
  public calculateRingFingerLength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerLength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerLength']> {
    return this.anatomicalHandDigits.calculateRingFingerLength(...args);
  }

  /**
   * [0532] calculateRingFingerWidth
   * Tính chiều rộng ngón áp út.
   */
  public calculateRingFingerWidth(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerWidth']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerWidth']> {
    return this.anatomicalHandDigits.calculateRingFingerWidth(...args);
  }

  /**
   * [0533] calculateRingFingerThickness
   * Tính độ dày ngón áp út.
   */
  public calculateRingFingerThickness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerThickness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerThickness']> {
    return this.anatomicalHandDigits.calculateRingFingerThickness(...args);
  }

  /**
   * [0534] calculateRingFingerCurvature
   * Tính độ cong ngón áp út.
   */
  public calculateRingFingerCurvature(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerCurvature']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerCurvature']> {
    return this.anatomicalHandDigits.calculateRingFingerCurvature(...args);
  }

  /**
   * [0535] calculateRingFingerDirection
   * Tính hướng ngón áp út.
   */
  public calculateRingFingerDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerDirection']> {
    return this.anatomicalHandDigits.calculateRingFingerDirection(...args);
  }

  /**
   * [0536] calculateRingFingerOrientation
   * Tính hướng quay ngón áp út.
   */
  public calculateRingFingerOrientation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerOrientation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerOrientation']> {
    return this.anatomicalHandDigits.calculateRingFingerOrientation(...args);
  }

  /**
   * [0537] calculateRingFingerFlexion
   * Tính góc gập ngón áp út.
   */
  public calculateRingFingerFlexion(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerFlexion']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerFlexion']> {
    return this.anatomicalHandDigits.calculateRingFingerFlexion(...args);
  }

  /**
   * [0538] calculateRingFingerExtension
   * Tính góc duỗi ngón áp út.
   */
  public calculateRingFingerExtension(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerExtension']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerExtension']> {
    return this.anatomicalHandDigits.calculateRingFingerExtension(...args);
  }

  /**
   * [0539] calculateRingFingerAbduction
   * Tính góc dạng ngón áp út.
   */
  public calculateRingFingerAbduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerAbduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerAbduction']> {
    return this.anatomicalHandDigits.calculateRingFingerAbduction(...args);
  }

  /**
   * [0540] calculateRingFingerAdduction
   * Tính góc khép ngón áp út.
   */
  public calculateRingFingerAdduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerAdduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerAdduction']> {
    return this.anatomicalHandDigits.calculateRingFingerAdduction(...args);
  }

  /**
   * [0541] calculateRingFingerRotation
   * Tính góc quay ngón áp út.
   */
  public calculateRingFingerRotation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerRotation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerRotation']> {
    return this.anatomicalHandDigits.calculateRingFingerRotation(...args);
  }

  /**
   * [0542] calculateRingFingerTipVelocity
   * Tính vận tốc đầu ngón áp út.
   */
  public calculateRingFingerTipVelocity(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerTipVelocity']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerTipVelocity']> {
    return this.anatomicalHandDigits.calculateRingFingerTipVelocity(...args);
  }

  /**
   * [0543] calculateRingFingerTipAcceleration
   * Tính gia tốc đầu ngón áp út.
   */
  public calculateRingFingerTipAcceleration(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerTipAcceleration']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerTipAcceleration']> {
    return this.anatomicalHandDigits.calculateRingFingerTipAcceleration(...args);
  }

  /**
   * [0544] calculateRingFingerJointAngles
   * Tính các góc khớp ngón áp út.
   */
  public calculateRingFingerJointAngles(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerJointAngles']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerJointAngles']> {
    return this.anatomicalHandDigits.calculateRingFingerJointAngles(...args);
  }

  /**
   * [0545] calculateRingFingerSegmentLengths
   * Tính chiều dài các đốt ngón áp út.
   */
  public calculateRingFingerSegmentLengths(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerSegmentLengths']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerSegmentLengths']> {
    return this.anatomicalHandDigits.calculateRingFingerSegmentLengths(...args);
  }

  /**
   * [0546] calculateRingFingerBoundingBox
   * Tính hộp bao ngón áp út.
   */
  public calculateRingFingerBoundingBox(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerBoundingBox']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerBoundingBox']> {
    return this.anatomicalHandDigits.calculateRingFingerBoundingBox(...args);
  }

  /**
   * [0547] calculateRingFingerBoundingSphere
   * Tính hình cầu bao ngón áp út.
   */
  public calculateRingFingerBoundingSphere(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerBoundingSphere']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerBoundingSphere']> {
    return this.anatomicalHandDigits.calculateRingFingerBoundingSphere(...args);
  }

  /**
   * [0548] calculateRingToThumbDistance
   * Tính khoảng cách ngón áp út đến ngón cái.
   */
  public calculateRingToThumbDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingToThumbDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingToThumbDistance']> {
    return this.anatomicalHandDigits.calculateRingToThumbDistance(...args);
  }

  /**
   * [0549] calculateRingToIndexDistance
   * Tính khoảng cách ngón áp út đến ngón trỏ.
   */
  public calculateRingToIndexDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingToIndexDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingToIndexDistance']> {
    return this.anatomicalHandDigits.calculateRingToIndexDistance(...args);
  }

  /**
   * [0550] calculateRingToMiddleDistance
   * Tính khoảng cách ngón áp út đến ngón giữa.
   */
  public calculateRingToMiddleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingToMiddleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingToMiddleDistance']> {
    return this.anatomicalHandDigits.calculateRingToMiddleDistance(...args);
  }

  /**
   * [0551] calculateRingToLittleDistance
   * Tính khoảng cách ngón áp út đến ngón út.
   */
  public calculateRingToLittleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingToLittleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingToLittleDistance']> {
    return this.anatomicalHandDigits.calculateRingToLittleDistance(...args);
  }

  /**
   * [0552] calculateRingFingerReachEnvelope
   * Tính vùng với tới của ngón áp út.
   */
  public calculateRingFingerReachEnvelope(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerReachEnvelope']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerReachEnvelope']> {
    return this.anatomicalHandDigits.calculateRingFingerReachEnvelope(...args);
  }

  /**
   * [0553] calculateRingFingerContactPoint
   * Tính điểm tiếp xúc ngón áp út.
   */
  public calculateRingFingerContactPoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerContactPoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerContactPoint']> {
    return this.anatomicalHandDigits.calculateRingFingerContactPoint(...args);
  }

  /**
   * [0554] calculateRingFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón áp út.
   */
  public calculateRingFingerSurfaceNormal(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerSurfaceNormal']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerSurfaceNormal']> {
    return this.anatomicalHandDigits.calculateRingFingerSurfaceNormal(...args);
  }

  /**
   * [0555] calculateRingFingerPoseError
   * Tính sai lệch tư thế ngón áp út.
   */
  public calculateRingFingerPoseError(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerPoseError']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerPoseError']> {
    return this.anatomicalHandDigits.calculateRingFingerPoseError(...args);
  }

  /**
   * [0556] calculateRingFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón áp út.
   */
  public calculateRingFingerMotionSmoothness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerMotionSmoothness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerMotionSmoothness']> {
    return this.anatomicalHandDigits.calculateRingFingerMotionSmoothness(...args);
  }

  /**
   * [0557] calculateRingFingerCollision
   * Kiểm tra va chạm ngón áp út.
   */
  public calculateRingFingerCollision(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerCollision']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerCollision']> {
    return this.anatomicalHandDigits.calculateRingFingerCollision(...args);
  }

  /**
   * [0558] calculateRingFingerCurl
   * Tính độ cuộn ngón áp út.
   */
  public calculateRingFingerCurl(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerCurl']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerCurl']> {
    return this.anatomicalHandDigits.calculateRingFingerCurl(...args);
  }

  /**
   * [0559] calculateRingFingerSpread
   * Tính độ xòe ngón áp út.
   */
  public calculateRingFingerSpread(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerSpread']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerSpread']> {
    return this.anatomicalHandDigits.calculateRingFingerSpread(...args);
  }

  /**
   * [0560] calculateRingFingerAlignment
   * Tính độ thẳng hàng ngón áp út.
   */
  public calculateRingFingerAlignment(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateRingFingerAlignment']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateRingFingerAlignment']> {
    return this.anatomicalHandDigits.calculateRingFingerAlignment(...args);
  }

  /**
   * [0561] getLittleFingerRootPosition
   * Lấy tọa độ gốc ngón út.
   */
  public getLittleFingerRootPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerRootPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerRootPosition']> {
    return this.anatomicalHandDigits.getLittleFingerRootPosition(...args);
  }

  /**
   * [0562] getLittleFingerMCPPosition
   * Lấy tọa độ khớp MCP ngón út.
   */
  public getLittleFingerMCPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerMCPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerMCPPosition']> {
    return this.anatomicalHandDigits.getLittleFingerMCPPosition(...args);
  }

  /**
   * [0563] getLittleFingerPIPPosition
   * Lấy tọa độ khớp PIP ngón út.
   */
  public getLittleFingerPIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerPIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerPIPPosition']> {
    return this.anatomicalHandDigits.getLittleFingerPIPPosition(...args);
  }

  /**
   * [0564] getLittleFingerDIPPosition
   * Lấy tọa độ khớp DIP ngón út.
   */
  public getLittleFingerDIPPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerDIPPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerDIPPosition']> {
    return this.anatomicalHandDigits.getLittleFingerDIPPosition(...args);
  }

  /**
   * [0565] getLittleFingerTipPosition
   * Lấy tọa độ đầu ngón út.
   */
  public getLittleFingerTipPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerTipPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerTipPosition']> {
    return this.anatomicalHandDigits.getLittleFingerTipPosition(...args);
  }

  /**
   * [0566] getLittleFingerNailPosition
   * Lấy tọa độ móng ngón út.
   */
  public getLittleFingerNailPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerNailPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerNailPosition']> {
    return this.anatomicalHandDigits.getLittleFingerNailPosition(...args);
  }

  /**
   * [0567] getLittleFingerPadPosition
   * Lấy tọa độ đệm ngón út.
   */
  public getLittleFingerPadPosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerPadPosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerPadPosition']> {
    return this.anatomicalHandDigits.getLittleFingerPadPosition(...args);
  }

  /**
   * [0568] getLittleFingerBasePosition
   * Lấy tọa độ đáy ngón út.
   */
  public getLittleFingerBasePosition(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerBasePosition']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerBasePosition']> {
    return this.anatomicalHandDigits.getLittleFingerBasePosition(...args);
  }

  /**
   * [0569] getLittleFingerProximalJoint
   * Lấy tọa độ khớp gần ngón út.
   */
  public getLittleFingerProximalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerProximalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerProximalJoint']> {
    return this.anatomicalHandDigits.getLittleFingerProximalJoint(...args);
  }

  /**
   * [0570] getLittleFingerDistalJoint
   * Lấy tọa độ khớp xa ngón út.
   */
  public getLittleFingerDistalJoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['getLittleFingerDistalJoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['getLittleFingerDistalJoint']> {
    return this.anatomicalHandDigits.getLittleFingerDistalJoint(...args);
  }

  /**
   * [0571] calculateLittleFingerLength
   * Tính chiều dài ngón út.
   */
  public calculateLittleFingerLength(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerLength']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerLength']> {
    return this.anatomicalHandDigits.calculateLittleFingerLength(...args);
  }

  /**
   * [0572] calculateLittleFingerWidth
   * Tính chiều rộng ngón út.
   */
  public calculateLittleFingerWidth(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerWidth']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerWidth']> {
    return this.anatomicalHandDigits.calculateLittleFingerWidth(...args);
  }

  /**
   * [0573] calculateLittleFingerThickness
   * Tính độ dày ngón út.
   */
  public calculateLittleFingerThickness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerThickness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerThickness']> {
    return this.anatomicalHandDigits.calculateLittleFingerThickness(...args);
  }

  /**
   * [0574] calculateLittleFingerCurvature
   * Tính độ cong ngón út.
   */
  public calculateLittleFingerCurvature(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerCurvature']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerCurvature']> {
    return this.anatomicalHandDigits.calculateLittleFingerCurvature(...args);
  }

  /**
   * [0575] calculateLittleFingerDirection
   * Tính hướng ngón út.
   */
  public calculateLittleFingerDirection(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerDirection']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerDirection']> {
    return this.anatomicalHandDigits.calculateLittleFingerDirection(...args);
  }

  /**
   * [0576] calculateLittleFingerOrientation
   * Tính hướng quay ngón út.
   */
  public calculateLittleFingerOrientation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerOrientation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerOrientation']> {
    return this.anatomicalHandDigits.calculateLittleFingerOrientation(...args);
  }

  /**
   * [0577] calculateLittleFingerFlexion
   * Tính góc gập ngón út.
   */
  public calculateLittleFingerFlexion(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerFlexion']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerFlexion']> {
    return this.anatomicalHandDigits.calculateLittleFingerFlexion(...args);
  }

  /**
   * [0578] calculateLittleFingerExtension
   * Tính góc duỗi ngón út.
   */
  public calculateLittleFingerExtension(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerExtension']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerExtension']> {
    return this.anatomicalHandDigits.calculateLittleFingerExtension(...args);
  }

  /**
   * [0579] calculateLittleFingerAbduction
   * Tính góc dạng ngón út.
   */
  public calculateLittleFingerAbduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerAbduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerAbduction']> {
    return this.anatomicalHandDigits.calculateLittleFingerAbduction(...args);
  }

  /**
   * [0580] calculateLittleFingerAdduction
   * Tính góc khép ngón út.
   */
  public calculateLittleFingerAdduction(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerAdduction']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerAdduction']> {
    return this.anatomicalHandDigits.calculateLittleFingerAdduction(...args);
  }

  /**
   * [0581] calculateLittleFingerRotation
   * Tính góc quay ngón út.
   */
  public calculateLittleFingerRotation(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerRotation']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerRotation']> {
    return this.anatomicalHandDigits.calculateLittleFingerRotation(...args);
  }

  /**
   * [0582] calculateLittleFingerTipVelocity
   * Tính vận tốc đầu ngón út.
   */
  public calculateLittleFingerTipVelocity(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerTipVelocity']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerTipVelocity']> {
    return this.anatomicalHandDigits.calculateLittleFingerTipVelocity(...args);
  }

  /**
   * [0583] calculateLittleFingerTipAcceleration
   * Tính gia tốc đầu ngón út.
   */
  public calculateLittleFingerTipAcceleration(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerTipAcceleration']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerTipAcceleration']> {
    return this.anatomicalHandDigits.calculateLittleFingerTipAcceleration(...args);
  }

  /**
   * [0584] calculateLittleFingerJointAngles
   * Tính các góc khớp ngón út.
   */
  public calculateLittleFingerJointAngles(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerJointAngles']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerJointAngles']> {
    return this.anatomicalHandDigits.calculateLittleFingerJointAngles(...args);
  }

  /**
   * [0585] calculateLittleFingerSegmentLengths
   * Tính chiều dài các đốt ngón út.
   */
  public calculateLittleFingerSegmentLengths(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerSegmentLengths']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerSegmentLengths']> {
    return this.anatomicalHandDigits.calculateLittleFingerSegmentLengths(...args);
  }

  /**
   * [0586] calculateLittleFingerBoundingBox
   * Tính hộp bao ngón út.
   */
  public calculateLittleFingerBoundingBox(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerBoundingBox']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerBoundingBox']> {
    return this.anatomicalHandDigits.calculateLittleFingerBoundingBox(...args);
  }

  /**
   * [0587] calculateLittleFingerBoundingSphere
   * Tính hình cầu bao ngón út.
   */
  public calculateLittleFingerBoundingSphere(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerBoundingSphere']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerBoundingSphere']> {
    return this.anatomicalHandDigits.calculateLittleFingerBoundingSphere(...args);
  }

  /**
   * [0588] calculateLittleToThumbDistance
   * Tính khoảng cách ngón út đến ngón cái.
   */
  public calculateLittleToThumbDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleToThumbDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleToThumbDistance']> {
    return this.anatomicalHandDigits.calculateLittleToThumbDistance(...args);
  }

  /**
   * [0589] calculateLittleToIndexDistance
   * Tính khoảng cách ngón út đến ngón trỏ.
   */
  public calculateLittleToIndexDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleToIndexDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleToIndexDistance']> {
    return this.anatomicalHandDigits.calculateLittleToIndexDistance(...args);
  }

  /**
   * [0590] calculateLittleToMiddleDistance
   * Tính khoảng cách ngón út đến ngón giữa.
   */
  public calculateLittleToMiddleDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleToMiddleDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleToMiddleDistance']> {
    return this.anatomicalHandDigits.calculateLittleToMiddleDistance(...args);
  }

  /**
   * [0591] calculateLittleToRingDistance
   * Tính khoảng cách ngón út đến ngón áp út.
   */
  public calculateLittleToRingDistance(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleToRingDistance']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleToRingDistance']> {
    return this.anatomicalHandDigits.calculateLittleToRingDistance(...args);
  }

  /**
   * [0592] calculateLittleFingerReachEnvelope
   * Tính vùng với tới của ngón út.
   */
  public calculateLittleFingerReachEnvelope(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerReachEnvelope']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerReachEnvelope']> {
    return this.anatomicalHandDigits.calculateLittleFingerReachEnvelope(...args);
  }

  /**
   * [0593] calculateLittleFingerContactPoint
   * Tính điểm tiếp xúc ngón út.
   */
  public calculateLittleFingerContactPoint(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerContactPoint']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerContactPoint']> {
    return this.anatomicalHandDigits.calculateLittleFingerContactPoint(...args);
  }

  /**
   * [0594] calculateLittleFingerSurfaceNormal
   * Tính pháp tuyến bề mặt ngón út.
   */
  public calculateLittleFingerSurfaceNormal(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerSurfaceNormal']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerSurfaceNormal']> {
    return this.anatomicalHandDigits.calculateLittleFingerSurfaceNormal(...args);
  }

  /**
   * [0595] calculateLittleFingerPoseError
   * Tính sai lệch tư thế ngón út.
   */
  public calculateLittleFingerPoseError(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerPoseError']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerPoseError']> {
    return this.anatomicalHandDigits.calculateLittleFingerPoseError(...args);
  }

  /**
   * [0596] calculateLittleFingerMotionSmoothness
   * Tính độ mượt chuyển động ngón út.
   */
  public calculateLittleFingerMotionSmoothness(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerMotionSmoothness']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerMotionSmoothness']> {
    return this.anatomicalHandDigits.calculateLittleFingerMotionSmoothness(...args);
  }

  /**
   * [0597] calculateLittleFingerCollision
   * Kiểm tra va chạm ngón út.
   */
  public calculateLittleFingerCollision(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerCollision']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerCollision']> {
    return this.anatomicalHandDigits.calculateLittleFingerCollision(...args);
  }

  /**
   * [0598] calculateLittleFingerCurl
   * Tính độ cuộn ngón út.
   */
  public calculateLittleFingerCurl(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerCurl']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerCurl']> {
    return this.anatomicalHandDigits.calculateLittleFingerCurl(...args);
  }

  /**
   * [0599] calculateLittleFingerSpread
   * Tính độ xòe ngón út.
   */
  public calculateLittleFingerSpread(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerSpread']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerSpread']> {
    return this.anatomicalHandDigits.calculateLittleFingerSpread(...args);
  }

  /**
   * [0600] calculateLittleFingerAlignment
   * Tính độ thẳng hàng ngón út.
   */
  public calculateLittleFingerAlignment(
    ...args: Parameters<AnatomicalHandDigitsSubsystem['calculateLittleFingerAlignment']>
  ): ReturnType<AnatomicalHandDigitsSubsystem['calculateLittleFingerAlignment']> {
    return this.anatomicalHandDigits.calculateLittleFingerAlignment(...args);
  }

  /**
   * [0601] getHeldObjectPosition
   * Lấy tọa độ vật thể đang cầm.
   */
  public getHeldObjectPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectPosition']> {
    return this.anatomicalLowerBody.getHeldObjectPosition(...args);
  }

  /**
   * [0602] getHeldObjectCenter
   * Lấy tâm vật thể đang cầm.
   */
  public getHeldObjectCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectCenter']> {
    return this.anatomicalLowerBody.getHeldObjectCenter(...args);
  }

  /**
   * [0603] getHeldObjectRotation
   * Lấy góc quay vật thể đang cầm.
   */
  public getHeldObjectRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectRotation']> {
    return this.anatomicalLowerBody.getHeldObjectRotation(...args);
  }

  /**
   * [0604] getHeldObjectScale
   * Lấy tỷ lệ kích thước vật thể đang cầm.
   */
  public getHeldObjectScale(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectScale']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectScale']> {
    return this.anatomicalLowerBody.getHeldObjectScale(...args);
  }

  /**
   * [0605] getHeldObjectWorldPosition
   * Lấy tọa độ thế giới của vật thể đang cầm.
   */
  public getHeldObjectWorldPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectWorldPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectWorldPosition']> {
    return this.anatomicalLowerBody.getHeldObjectWorldPosition(...args);
  }

  /**
   * [0606] getHeldObjectLocalPosition
   * Lấy tọa độ cục bộ của vật thể đang cầm.
   */
  public getHeldObjectLocalPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectLocalPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectLocalPosition']> {
    return this.anatomicalLowerBody.getHeldObjectLocalPosition(...args);
  }

  /**
   * [0607] getHeldObjectAnchor
   * Lấy điểm neo vật thể đang cầm.
   */
  public getHeldObjectAnchor(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectAnchor']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectAnchor']> {
    return this.anatomicalLowerBody.getHeldObjectAnchor(...args);
  }

  /**
   * [0608] getHeldObjectPivot
   * Lấy điểm xoay vật thể đang cầm.
   */
  public getHeldObjectPivot(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectPivot']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectPivot']> {
    return this.anatomicalLowerBody.getHeldObjectPivot(...args);
  }

  /**
   * [0609] getHeldObjectGripPoint
   * Lấy điểm nắm vật thể.
   */
  public getHeldObjectGripPoint(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectGripPoint']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectGripPoint']> {
    return this.anatomicalLowerBody.getHeldObjectGripPoint(...args);
  }

  /**
   * [0610] getHeldObjectContactPoint
   * Lấy điểm tiếp xúc vật thể.
   */
  public getHeldObjectContactPoint(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectContactPoint']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectContactPoint']> {
    return this.anatomicalLowerBody.getHeldObjectContactPoint(...args);
  }

  /**
   * [0611] getHeldObjectTipPosition
   * Lấy tọa độ đầu vật thể.
   */
  public getHeldObjectTipPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectTipPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectTipPosition']> {
    return this.anatomicalLowerBody.getHeldObjectTipPosition(...args);
  }

  /**
   * [0612] getHeldObjectBasePosition
   * Lấy tọa độ đáy vật thể.
   */
  public getHeldObjectBasePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectBasePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectBasePosition']> {
    return this.anatomicalLowerBody.getHeldObjectBasePosition(...args);
  }

  /**
   * [0613] getHeldObjectFrontPosition
   * Lấy tọa độ mặt trước vật thể.
   */
  public getHeldObjectFrontPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectFrontPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectFrontPosition']> {
    return this.anatomicalLowerBody.getHeldObjectFrontPosition(...args);
  }

  /**
   * [0614] getHeldObjectBackPosition
   * Lấy tọa độ mặt sau vật thể.
   */
  public getHeldObjectBackPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectBackPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectBackPosition']> {
    return this.anatomicalLowerBody.getHeldObjectBackPosition(...args);
  }

  /**
   * [0615] getHeldObjectLeftPosition
   * Lấy tọa độ bên trái vật thể.
   */
  public getHeldObjectLeftPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectLeftPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectLeftPosition']> {
    return this.anatomicalLowerBody.getHeldObjectLeftPosition(...args);
  }

  /**
   * [0616] getHeldObjectRightPosition
   * Lấy tọa độ bên phải vật thể.
   */
  public getHeldObjectRightPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectRightPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectRightPosition']> {
    return this.anatomicalLowerBody.getHeldObjectRightPosition(...args);
  }

  /**
   * [0617] getHeldObjectUpPosition
   * Lấy tọa độ phía trên vật thể.
   */
  public getHeldObjectUpPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectUpPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectUpPosition']> {
    return this.anatomicalLowerBody.getHeldObjectUpPosition(...args);
  }

  /**
   * [0618] getHeldObjectDownPosition
   * Lấy tọa độ phía dưới vật thể.
   */
  public getHeldObjectDownPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHeldObjectDownPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHeldObjectDownPosition']> {
    return this.anatomicalLowerBody.getHeldObjectDownPosition(...args);
  }

  /**
   * [0619] calculateHeldObjectLength
   * Tính chiều dài vật thể đang cầm.
   */
  public calculateHeldObjectLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectLength']> {
    return this.anatomicalLowerBody.calculateHeldObjectLength(...args);
  }

  /**
   * [0620] calculateHeldObjectWidth
   * Tính chiều rộng vật thể đang cầm.
   */
  public calculateHeldObjectWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectWidth']> {
    return this.anatomicalLowerBody.calculateHeldObjectWidth(...args);
  }

  /**
   * [0621] calculateHeldObjectHeight
   * Tính chiều cao vật thể đang cầm.
   */
  public calculateHeldObjectHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectHeight']> {
    return this.anatomicalLowerBody.calculateHeldObjectHeight(...args);
  }

  /**
   * [0622] calculateHeldObjectVolume
   * Tính thể tích vật thể đang cầm.
   */
  public calculateHeldObjectVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectVolume']> {
    return this.anatomicalLowerBody.calculateHeldObjectVolume(...args);
  }

  /**
   * [0623] calculateHeldObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateHeldObjectSurfaceArea(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectSurfaceArea']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectSurfaceArea']> {
    return this.anatomicalLowerBody.calculateHeldObjectSurfaceArea(...args);
  }

  /**
   * [0624] calculateHeldObjectMass
   * Tính khối lượng vật thể.
   */
  public calculateHeldObjectMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectMass']> {
    return this.anatomicalLowerBody.calculateHeldObjectMass(...args);
  }

  /**
   * [0625] calculateHeldObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateHeldObjectCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectCenterOfMass']> {
    return this.anatomicalLowerBody.calculateHeldObjectCenterOfMass(...args);
  }

  /**
   * [0626] calculateHeldObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateHeldObjectInertiaTensor(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectInertiaTensor']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectInertiaTensor']> {
    return this.anatomicalLowerBody.calculateHeldObjectInertiaTensor(...args);
  }

  /**
   * [0627] calculateHeldObjectBoundingBox
   * Tính hộp bao vật thể.
   */
  public calculateHeldObjectBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingBox']> {
    return this.anatomicalLowerBody.calculateHeldObjectBoundingBox(...args);
  }

  /**
   * [0628] calculateHeldObjectBoundingSphere
   * Tính hình cầu bao vật thể.
   */
  public calculateHeldObjectBoundingSphere(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingSphere']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingSphere']> {
    return this.anatomicalLowerBody.calculateHeldObjectBoundingSphere(...args);
  }

  /**
   * [0629] calculateHeldObjectBoundingCapsule
   * Tính capsule bao vật thể.
   */
  public calculateHeldObjectBoundingCapsule(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingCapsule']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingCapsule']> {
    return this.anatomicalLowerBody.calculateHeldObjectBoundingCapsule(...args);
  }

  /**
   * [0630] calculateHeldObjectBoundingCylinder
   * Tính hình trụ bao vật thể.
   */
  public calculateHeldObjectBoundingCylinder(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingCylinder']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectBoundingCylinder']> {
    return this.anatomicalLowerBody.calculateHeldObjectBoundingCylinder(...args);
  }

  /**
   * [0631] calculateHeldObjectDistanceToHand
   * Tính khoảng cách vật thể đến bàn tay.
   */
  public calculateHeldObjectDistanceToHand(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToHand']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToHand']> {
    return this.anatomicalLowerBody.calculateHeldObjectDistanceToHand(...args);
  }

  /**
   * [0632] calculateHeldObjectDistanceToWrist
   * Tính khoảng cách vật thể đến cổ tay.
   */
  public calculateHeldObjectDistanceToWrist(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToWrist']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToWrist']> {
    return this.anatomicalLowerBody.calculateHeldObjectDistanceToWrist(...args);
  }

  /**
   * [0633] calculateHeldObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateHeldObjectDistanceToCamera(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToCamera']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToCamera']> {
    return this.anatomicalLowerBody.calculateHeldObjectDistanceToCamera(...args);
  }

  /**
   * [0634] calculateHeldObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateHeldObjectDistanceToTarget(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToTarget']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectDistanceToTarget']> {
    return this.anatomicalLowerBody.calculateHeldObjectDistanceToTarget(...args);
  }

  /**
   * [0635] calculateHeldObjectGripAlignment
   * Tính độ thẳng hàng giữa tay và điểm nắm.
   */
  public calculateHeldObjectGripAlignment(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectGripAlignment']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectGripAlignment']> {
    return this.anatomicalLowerBody.calculateHeldObjectGripAlignment(...args);
  }

  /**
   * [0636] calculateHeldObjectGripOffset
   * Tính độ lệch điểm nắm.
   */
  public calculateHeldObjectGripOffset(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectGripOffset']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectGripOffset']> {
    return this.anatomicalLowerBody.calculateHeldObjectGripOffset(...args);
  }

  /**
   * [0637] calculateHeldObjectGripRotation
   * Tính góc xoay khi cầm.
   */
  public calculateHeldObjectGripRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectGripRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectGripRotation']> {
    return this.anatomicalLowerBody.calculateHeldObjectGripRotation(...args);
  }

  /**
   * [0638] calculateHeldObjectGripStability
   * Tính độ ổn định khi cầm.
   */
  public calculateHeldObjectGripStability(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectGripStability']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectGripStability']> {
    return this.anatomicalLowerBody.calculateHeldObjectGripStability(...args);
  }

  /**
   * [0639] calculateHeldObjectHandPose
   * Tính tư thế bàn tay khi cầm.
   */
  public calculateHeldObjectHandPose(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectHandPose']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectHandPose']> {
    return this.anatomicalLowerBody.calculateHeldObjectHandPose(...args);
  }

  /**
   * [0640] calculateHeldObjectFingerContact
   * Tính tiếp xúc giữa ngón tay và vật thể.
   */
  public calculateHeldObjectFingerContact(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectFingerContact']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectFingerContact']> {
    return this.anatomicalLowerBody.calculateHeldObjectFingerContact(...args);
  }

  /**
   * [0641] calculateHeldObjectCollision
   * Kiểm tra va chạm vật thể đang cầm.
   */
  public calculateHeldObjectCollision(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectCollision']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectCollision']> {
    return this.anatomicalLowerBody.calculateHeldObjectCollision(...args);
  }

  /**
   * [0642] calculateHeldObjectPenetrationDepth
   * Tính độ xuyên lấn khi va chạm.
   */
  public calculateHeldObjectPenetrationDepth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectPenetrationDepth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectPenetrationDepth']> {
    return this.anatomicalLowerBody.calculateHeldObjectPenetrationDepth(...args);
  }

  /**
   * [0643] calculateHeldObjectVelocity
   * Tính vận tốc vật thể đang cầm.
   */
  public calculateHeldObjectVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectVelocity']> {
    return this.anatomicalLowerBody.calculateHeldObjectVelocity(...args);
  }

  /**
   * [0644] calculateHeldObjectAcceleration
   * Tính gia tốc vật thể đang cầm.
   */
  public calculateHeldObjectAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectAcceleration']> {
    return this.anatomicalLowerBody.calculateHeldObjectAcceleration(...args);
  }

  /**
   * [0645] calculateHeldObjectAngularVelocity
   * Tính vận tốc góc vật thể.
   */
  public calculateHeldObjectAngularVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectAngularVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectAngularVelocity']> {
    return this.anatomicalLowerBody.calculateHeldObjectAngularVelocity(...args);
  }

  /**
   * [0646] calculateHeldObjectAngularAcceleration
   * Tính gia tốc góc vật thể.
   */
  public calculateHeldObjectAngularAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectAngularAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectAngularAcceleration']> {
    return this.anatomicalLowerBody.calculateHeldObjectAngularAcceleration(...args);
  }

  /**
   * [0647] calculateHeldObjectTrajectory
   * Tính quỹ đạo vật thể đang cầm.
   */
  public calculateHeldObjectTrajectory(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectTrajectory']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectTrajectory']> {
    return this.anatomicalLowerBody.calculateHeldObjectTrajectory(...args);
  }

  /**
   * [0648] calculateHeldObjectThrowVelocity
   * Tính vận tốc ném vật thể.
   */
  public calculateHeldObjectThrowVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectThrowVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectThrowVelocity']> {
    return this.anatomicalLowerBody.calculateHeldObjectThrowVelocity(...args);
  }

  /**
   * [0649] calculateHeldObjectReleasePosition
   * Tính vị trí thả vật thể.
   */
  public calculateHeldObjectReleasePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectReleasePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectReleasePosition']> {
    return this.anatomicalLowerBody.calculateHeldObjectReleasePosition(...args);
  }

  /**
   * [0650] calculateHeldObjectReleaseRotation
   * Tính góc quay lúc thả vật thể.
   */
  public calculateHeldObjectReleaseRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHeldObjectReleaseRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHeldObjectReleaseRotation']> {
    return this.anatomicalLowerBody.calculateHeldObjectReleaseRotation(...args);
  }

  /**
   * [0651] getTorsoPosition
   * Lấy tọa độ thân.
   */
  public getTorsoPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoPosition']> {
    return this.anatomicalLowerBody.getTorsoPosition(...args);
  }

  /**
   * [0652] getTorsoCenter
   * Lấy tâm thân.
   */
  public getTorsoCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoCenter']> {
    return this.anatomicalLowerBody.getTorsoCenter(...args);
  }

  /**
   * [0653] getTorsoTopPosition
   * Lấy tọa độ đỉnh thân.
   */
  public getTorsoTopPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoTopPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoTopPosition']> {
    return this.anatomicalLowerBody.getTorsoTopPosition(...args);
  }

  /**
   * [0654] getTorsoBottomPosition
   * Lấy tọa độ đáy thân.
   */
  public getTorsoBottomPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoBottomPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoBottomPosition']> {
    return this.anatomicalLowerBody.getTorsoBottomPosition(...args);
  }

  /**
   * [0655] getTorsoFrontPosition
   * Lấy tọa độ mặt trước thân.
   */
  public getTorsoFrontPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoFrontPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoFrontPosition']> {
    return this.anatomicalLowerBody.getTorsoFrontPosition(...args);
  }

  /**
   * [0656] getTorsoBackPosition
   * Lấy tọa độ mặt sau thân.
   */
  public getTorsoBackPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoBackPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoBackPosition']> {
    return this.anatomicalLowerBody.getTorsoBackPosition(...args);
  }

  /**
   * [0657] getTorsoLeftPosition
   * Lấy tọa độ bên trái thân.
   */
  public getTorsoLeftPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoLeftPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoLeftPosition']> {
    return this.anatomicalLowerBody.getTorsoLeftPosition(...args);
  }

  /**
   * [0658] getTorsoRightPosition
   * Lấy tọa độ bên phải thân.
   */
  public getTorsoRightPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTorsoRightPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTorsoRightPosition']> {
    return this.anatomicalLowerBody.getTorsoRightPosition(...args);
  }

  /**
   * [0659] getChestPosition
   * Lấy tọa độ ngực.
   */
  public getChestPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getChestPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getChestPosition']> {
    return this.anatomicalLowerBody.getChestPosition(...args);
  }

  /**
   * [0660] getChestCenter
   * Lấy tâm ngực.
   */
  public getChestCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getChestCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getChestCenter']> {
    return this.anatomicalLowerBody.getChestCenter(...args);
  }

  /**
   * [0661] getChestFrontPosition
   * Lấy tọa độ phía trước ngực.
   */
  public getChestFrontPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getChestFrontPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getChestFrontPosition']> {
    return this.anatomicalLowerBody.getChestFrontPosition(...args);
  }

  /**
   * [0662] getChestBackPosition
   * Lấy tọa độ phía sau ngực.
   */
  public getChestBackPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getChestBackPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getChestBackPosition']> {
    return this.anatomicalLowerBody.getChestBackPosition(...args);
  }

  /**
   * [0663] getRibcageCenter
   * Lấy tâm lồng ngực.
   */
  public getRibcageCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRibcageCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRibcageCenter']> {
    return this.anatomicalLowerBody.getRibcageCenter(...args);
  }

  /**
   * [0664] getSternumPosition
   * Lấy tọa độ xương ức.
   */
  public getSternumPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getSternumPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getSternumPosition']> {
    return this.anatomicalLowerBody.getSternumPosition(...args);
  }

  /**
   * [0665] getSpinePosition
   * Lấy tọa độ cột sống.
   */
  public getSpinePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getSpinePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getSpinePosition']> {
    return this.anatomicalLowerBody.getSpinePosition(...args);
  }

  /**
   * [0666] getUpperSpinePosition
   * Lấy tọa độ cột sống trên.
   */
  public getUpperSpinePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getUpperSpinePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getUpperSpinePosition']> {
    return this.anatomicalLowerBody.getUpperSpinePosition(...args);
  }

  /**
   * [0667] getMiddleSpinePosition
   * Lấy tọa độ cột sống giữa.
   */
  public getMiddleSpinePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getMiddleSpinePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getMiddleSpinePosition']> {
    return this.anatomicalLowerBody.getMiddleSpinePosition(...args);
  }

  /**
   * [0668] getLowerSpinePosition
   * Lấy tọa độ cột sống dưới.
   */
  public getLowerSpinePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLowerSpinePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLowerSpinePosition']> {
    return this.anatomicalLowerBody.getLowerSpinePosition(...args);
  }

  /**
   * [0669] calculateTorsoLength
   * Tính chiều dài thân.
   */
  public calculateTorsoLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoLength']> {
    return this.anatomicalLowerBody.calculateTorsoLength(...args);
  }

  /**
   * [0670] calculateTorsoWidth
   * Tính chiều rộng thân.
   */
  public calculateTorsoWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoWidth']> {
    return this.anatomicalLowerBody.calculateTorsoWidth(...args);
  }

  /**
   * [0671] calculateTorsoHeight
   * Tính chiều cao thân.
   */
  public calculateTorsoHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoHeight']> {
    return this.anatomicalLowerBody.calculateTorsoHeight(...args);
  }

  /**
   * [0672] calculateTorsoDepth
   * Tính chiều sâu thân.
   */
  public calculateTorsoDepth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoDepth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoDepth']> {
    return this.anatomicalLowerBody.calculateTorsoDepth(...args);
  }

  /**
   * [0673] calculateTorsoVolume
   * Tính thể tích thân.
   */
  public calculateTorsoVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoVolume']> {
    return this.anatomicalLowerBody.calculateTorsoVolume(...args);
  }

  /**
   * [0674] calculateTorsoSurfaceArea
   * Tính diện tích bề mặt thân.
   */
  public calculateTorsoSurfaceArea(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoSurfaceArea']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoSurfaceArea']> {
    return this.anatomicalLowerBody.calculateTorsoSurfaceArea(...args);
  }

  /**
   * [0675] calculateTorsoBoundingBox
   * Tính hộp bao thân.
   */
  public calculateTorsoBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoBoundingBox']> {
    return this.anatomicalLowerBody.calculateTorsoBoundingBox(...args);
  }

  /**
   * [0676] calculateTorsoBoundingSphere
   * Tính hình cầu bao thân.
   */
  public calculateTorsoBoundingSphere(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoBoundingSphere']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoBoundingSphere']> {
    return this.anatomicalLowerBody.calculateTorsoBoundingSphere(...args);
  }

  /**
   * [0677] calculateTorsoCenterOfMass
   * Tính tâm khối lượng thân.
   */
  public calculateTorsoCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoCenterOfMass']> {
    return this.anatomicalLowerBody.calculateTorsoCenterOfMass(...args);
  }

  /**
   * [0678] calculateTorsoOrientation
   * Tính hướng thân.
   */
  public calculateTorsoOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoOrientation']> {
    return this.anatomicalLowerBody.calculateTorsoOrientation(...args);
  }

  /**
   * [0679] calculateTorsoRotation
   * Tính góc quay thân.
   */
  public calculateTorsoRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoRotation']> {
    return this.anatomicalLowerBody.calculateTorsoRotation(...args);
  }

  /**
   * [0680] calculateTorsoTilt
   * Tính độ nghiêng thân.
   */
  public calculateTorsoTilt(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoTilt']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoTilt']> {
    return this.anatomicalLowerBody.calculateTorsoTilt(...args);
  }

  /**
   * [0681] calculateTorsoTwist
   * Tính góc xoắn thân.
   */
  public calculateTorsoTwist(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoTwist']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoTwist']> {
    return this.anatomicalLowerBody.calculateTorsoTwist(...args);
  }

  /**
   * [0682] calculateTorsoBend
   * Tính độ gập thân.
   */
  public calculateTorsoBend(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoBend']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoBend']> {
    return this.anatomicalLowerBody.calculateTorsoBend(...args);
  }

  /**
   * [0683] calculateTorsoLeanAngle
   * Tính góc nghiêng người.
   */
  public calculateTorsoLeanAngle(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoLeanAngle']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoLeanAngle']> {
    return this.anatomicalLowerBody.calculateTorsoLeanAngle(...args);
  }

  /**
   * [0684] calculateTorsoFlexion
   * Tính góc gập thân về trước.
   */
  public calculateTorsoFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoFlexion']> {
    return this.anatomicalLowerBody.calculateTorsoFlexion(...args);
  }

  /**
   * [0685] calculateTorsoExtension
   * Tính góc ngả thân về sau.
   */
  public calculateTorsoExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoExtension']> {
    return this.anatomicalLowerBody.calculateTorsoExtension(...args);
  }

  /**
   * [0686] calculateTorsoLateralBend
   * Tính góc nghiêng thân sang bên.
   */
  public calculateTorsoLateralBend(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoLateralBend']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoLateralBend']> {
    return this.anatomicalLowerBody.calculateTorsoLateralBend(...args);
  }

  /**
   * [0687] calculateTorsoVelocity
   * Tính vận tốc thân.
   */
  public calculateTorsoVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoVelocity']> {
    return this.anatomicalLowerBody.calculateTorsoVelocity(...args);
  }

  /**
   * [0688] calculateTorsoAcceleration
   * Tính gia tốc thân.
   */
  public calculateTorsoAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoAcceleration']> {
    return this.anatomicalLowerBody.calculateTorsoAcceleration(...args);
  }

  /**
   * [0689] calculateTorsoAngularVelocity
   * Tính vận tốc góc thân.
   */
  public calculateTorsoAngularVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoAngularVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoAngularVelocity']> {
    return this.anatomicalLowerBody.calculateTorsoAngularVelocity(...args);
  }

  /**
   * [0690] calculateTorsoAngularAcceleration
   * Tính gia tốc góc thân.
   */
  public calculateTorsoAngularAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoAngularAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoAngularAcceleration']> {
    return this.anatomicalLowerBody.calculateTorsoAngularAcceleration(...args);
  }

  /**
   * [0691] calculateTorsoToHeadDistance
   * Tính khoảng cách thân đến đầu.
   */
  public calculateTorsoToHeadDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoToHeadDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoToHeadDistance']> {
    return this.anatomicalLowerBody.calculateTorsoToHeadDistance(...args);
  }

  /**
   * [0692] calculateTorsoToHipDistance
   * Tính khoảng cách thân đến hông.
   */
  public calculateTorsoToHipDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoToHipDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoToHipDistance']> {
    return this.anatomicalLowerBody.calculateTorsoToHipDistance(...args);
  }

  /**
   * [0693] calculateTorsoToShoulderDistance
   * Tính khoảng cách thân đến vai.
   */
  public calculateTorsoToShoulderDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoToShoulderDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoToShoulderDistance']> {
    return this.anatomicalLowerBody.calculateTorsoToShoulderDistance(...args);
  }

  /**
   * [0694] calculateTorsoSymmetry
   * Tính độ đối xứng thân.
   */
  public calculateTorsoSymmetry(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoSymmetry']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoSymmetry']> {
    return this.anatomicalLowerBody.calculateTorsoSymmetry(...args);
  }

  /**
   * [0695] calculateTorsoPoseError
   * Tính sai lệch tư thế thân.
   */
  public calculateTorsoPoseError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoPoseError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoPoseError']> {
    return this.anatomicalLowerBody.calculateTorsoPoseError(...args);
  }

  /**
   * [0696] calculateTorsoMotionSmoothness
   * Tính độ mượt chuyển động thân.
   */
  public calculateTorsoMotionSmoothness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoMotionSmoothness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoMotionSmoothness']> {
    return this.anatomicalLowerBody.calculateTorsoMotionSmoothness(...args);
  }

  /**
   * [0697] calculateTorsoSurfaceNormal
   * Tính pháp tuyến bề mặt thân.
   */
  public calculateTorsoSurfaceNormal(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoSurfaceNormal']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoSurfaceNormal']> {
    return this.anatomicalLowerBody.calculateTorsoSurfaceNormal(...args);
  }

  /**
   * [0698] calculateTorsoCollision
   * Kiểm tra va chạm thân.
   */
  public calculateTorsoCollision(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoCollision']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoCollision']> {
    return this.anatomicalLowerBody.calculateTorsoCollision(...args);
  }

  /**
   * [0699] calculateTorsoGroundClearance
   * Tính khoảng cách thân đến mặt đất.
   */
  public calculateTorsoGroundClearance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoGroundClearance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoGroundClearance']> {
    return this.anatomicalLowerBody.calculateTorsoGroundClearance(...args);
  }

  /**
   * [0700] calculateTorsoJointChain
   * Tính chuỗi khớp thân.
   */
  public calculateTorsoJointChain(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateTorsoJointChain']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateTorsoJointChain']> {
    return this.anatomicalLowerBody.calculateTorsoJointChain(...args);
  }

  /**
   * [0701] getAbdomenPosition
   * Lấy tọa độ bụng.
   */
  public getAbdomenPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getAbdomenPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getAbdomenPosition']> {
    return this.anatomicalLowerBody.getAbdomenPosition(...args);
  }

  /**
   * [0702] getAbdomenCenter
   * Lấy tâm bụng.
   */
  public getAbdomenCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getAbdomenCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getAbdomenCenter']> {
    return this.anatomicalLowerBody.getAbdomenCenter(...args);
  }

  /**
   * [0703] getUpperAbdomenPosition
   * Lấy tọa độ bụng trên.
   */
  public getUpperAbdomenPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getUpperAbdomenPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getUpperAbdomenPosition']> {
    return this.anatomicalLowerBody.getUpperAbdomenPosition(...args);
  }

  /**
   * [0704] getLowerAbdomenPosition
   * Lấy tọa độ bụng dưới.
   */
  public getLowerAbdomenPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLowerAbdomenPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLowerAbdomenPosition']> {
    return this.anatomicalLowerBody.getLowerAbdomenPosition(...args);
  }

  /**
   * [0705] getNavelPosition
   * Lấy tọa độ rốn.
   */
  public getNavelPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getNavelPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getNavelPosition']> {
    return this.anatomicalLowerBody.getNavelPosition(...args);
  }

  /**
   * [0706] getPelvisPosition
   * Lấy tọa độ xương chậu.
   */
  public getPelvisPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getPelvisPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getPelvisPosition']> {
    return this.anatomicalLowerBody.getPelvisPosition(...args);
  }

  /**
   * [0707] getPelvisCenter
   * Lấy tâm xương chậu.
   */
  public getPelvisCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getPelvisCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getPelvisCenter']> {
    return this.anatomicalLowerBody.getPelvisCenter(...args);
  }

  /**
   * [0708] getPelvisFrontPosition
   * Lấy tọa độ phía trước xương chậu.
   */
  public getPelvisFrontPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getPelvisFrontPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getPelvisFrontPosition']> {
    return this.anatomicalLowerBody.getPelvisFrontPosition(...args);
  }

  /**
   * [0709] getPelvisBackPosition
   * Lấy tọa độ phía sau xương chậu.
   */
  public getPelvisBackPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getPelvisBackPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getPelvisBackPosition']> {
    return this.anatomicalLowerBody.getPelvisBackPosition(...args);
  }

  /**
   * [0710] getLeftHipPosition
   * Lấy tọa độ hông trái.
   */
  public getLeftHipPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftHipPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftHipPosition']> {
    return this.anatomicalLowerBody.getLeftHipPosition(...args);
  }

  /**
   * [0711] getRightHipPosition
   * Lấy tọa độ hông phải.
   */
  public getRightHipPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightHipPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightHipPosition']> {
    return this.anatomicalLowerBody.getRightHipPosition(...args);
  }

  /**
   * [0712] getHipCenter
   * Lấy tâm hai hông.
   */
  public getHipCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHipCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHipCenter']> {
    return this.anatomicalLowerBody.getHipCenter(...args);
  }

  /**
   * [0713] getHipJointPosition
   * Lấy tọa độ khớp hông.
   */
  public getHipJointPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getHipJointPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getHipJointPosition']> {
    return this.anatomicalLowerBody.getHipJointPosition(...args);
  }

  /**
   * [0714] getSacrumPosition
   * Lấy tọa độ xương cùng.
   */
  public getSacrumPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getSacrumPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getSacrumPosition']> {
    return this.anatomicalLowerBody.getSacrumPosition(...args);
  }

  /**
   * [0715] getTailbonePosition
   * Lấy tọa độ xương cụt.
   */
  public getTailbonePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getTailbonePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getTailbonePosition']> {
    return this.anatomicalLowerBody.getTailbonePosition(...args);
  }

  /**
   * [0716] calculateAbdomenWidth
   * Tính chiều rộng bụng.
   */
  public calculateAbdomenWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAbdomenWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAbdomenWidth']> {
    return this.anatomicalLowerBody.calculateAbdomenWidth(...args);
  }

  /**
   * [0717] calculateAbdomenHeight
   * Tính chiều cao bụng.
   */
  public calculateAbdomenHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAbdomenHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAbdomenHeight']> {
    return this.anatomicalLowerBody.calculateAbdomenHeight(...args);
  }

  /**
   * [0718] calculateAbdomenDepth
   * Tính chiều sâu bụng.
   */
  public calculateAbdomenDepth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAbdomenDepth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAbdomenDepth']> {
    return this.anatomicalLowerBody.calculateAbdomenDepth(...args);
  }

  /**
   * [0719] calculateAbdomenVolume
   * Tính thể tích bụng.
   */
  public calculateAbdomenVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAbdomenVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAbdomenVolume']> {
    return this.anatomicalLowerBody.calculateAbdomenVolume(...args);
  }

  /**
   * [0720] calculateAbdomenCenterOfMass
   * Tính tâm khối lượng bụng.
   */
  public calculateAbdomenCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAbdomenCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAbdomenCenterOfMass']> {
    return this.anatomicalLowerBody.calculateAbdomenCenterOfMass(...args);
  }

  /**
   * [0721] calculatePelvisWidth
   * Tính chiều rộng xương chậu.
   */
  public calculatePelvisWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisWidth']> {
    return this.anatomicalLowerBody.calculatePelvisWidth(...args);
  }

  /**
   * [0722] calculatePelvisHeight
   * Tính chiều cao xương chậu.
   */
  public calculatePelvisHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisHeight']> {
    return this.anatomicalLowerBody.calculatePelvisHeight(...args);
  }

  /**
   * [0723] calculatePelvisDepth
   * Tính chiều sâu xương chậu.
   */
  public calculatePelvisDepth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisDepth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisDepth']> {
    return this.anatomicalLowerBody.calculatePelvisDepth(...args);
  }

  /**
   * [0724] calculatePelvisOrientation
   * Tính hướng xương chậu.
   */
  public calculatePelvisOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisOrientation']> {
    return this.anatomicalLowerBody.calculatePelvisOrientation(...args);
  }

  /**
   * [0725] calculatePelvisRotation
   * Tính góc quay xương chậu.
   */
  public calculatePelvisRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisRotation']> {
    return this.anatomicalLowerBody.calculatePelvisRotation(...args);
  }

  /**
   * [0726] calculatePelvisTilt
   * Tính độ nghiêng xương chậu.
   */
  public calculatePelvisTilt(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisTilt']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisTilt']> {
    return this.anatomicalLowerBody.calculatePelvisTilt(...args);
  }

  /**
   * [0727] calculatePelvisTwist
   * Tính góc xoay xương chậu.
   */
  public calculatePelvisTwist(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisTwist']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisTwist']> {
    return this.anatomicalLowerBody.calculatePelvisTwist(...args);
  }

  /**
   * [0728] calculateHipWidth
   * Tính chiều rộng hông.
   */
  public calculateHipWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipWidth']> {
    return this.anatomicalLowerBody.calculateHipWidth(...args);
  }

  /**
   * [0729] calculateHipSymmetry
   * Tính độ đối xứng hông.
   */
  public calculateHipSymmetry(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipSymmetry']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipSymmetry']> {
    return this.anatomicalLowerBody.calculateHipSymmetry(...args);
  }

  /**
   * [0730] calculateHipJointAngle
   * Tính góc khớp hông.
   */
  public calculateHipJointAngle(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipJointAngle']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipJointAngle']> {
    return this.anatomicalLowerBody.calculateHipJointAngle(...args);
  }

  /**
   * [0731] calculateHipFlexion
   * Tính góc gập hông.
   */
  public calculateHipFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipFlexion']> {
    return this.anatomicalLowerBody.calculateHipFlexion(...args);
  }

  /**
   * [0732] calculateHipExtension
   * Tính góc duỗi hông.
   */
  public calculateHipExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipExtension']> {
    return this.anatomicalLowerBody.calculateHipExtension(...args);
  }

  /**
   * [0733] calculateHipAbduction
   * Tính góc dạng hông.
   */
  public calculateHipAbduction(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipAbduction']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipAbduction']> {
    return this.anatomicalLowerBody.calculateHipAbduction(...args);
  }

  /**
   * [0734] calculateHipAdduction
   * Tính góc khép hông.
   */
  public calculateHipAdduction(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipAdduction']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipAdduction']> {
    return this.anatomicalLowerBody.calculateHipAdduction(...args);
  }

  /**
   * [0735] calculateHipInternalRotation
   * Tính góc xoay trong hông.
   */
  public calculateHipInternalRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipInternalRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipInternalRotation']> {
    return this.anatomicalLowerBody.calculateHipInternalRotation(...args);
  }

  /**
   * [0736] calculateHipExternalRotation
   * Tính góc xoay ngoài hông.
   */
  public calculateHipExternalRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipExternalRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipExternalRotation']> {
    return this.anatomicalLowerBody.calculateHipExternalRotation(...args);
  }

  /**
   * [0737] calculateHipVelocity
   * Tính vận tốc hông.
   */
  public calculateHipVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipVelocity']> {
    return this.anatomicalLowerBody.calculateHipVelocity(...args);
  }

  /**
   * [0738] calculateHipAcceleration
   * Tính gia tốc hông.
   */
  public calculateHipAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipAcceleration']> {
    return this.anatomicalLowerBody.calculateHipAcceleration(...args);
  }

  /**
   * [0739] calculateHipBoundingBox
   * Tính hộp bao hông.
   */
  public calculateHipBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipBoundingBox']> {
    return this.anatomicalLowerBody.calculateHipBoundingBox(...args);
  }

  /**
   * [0740] calculateHipCenterOfMass
   * Tính tâm khối lượng hông.
   */
  public calculateHipCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipCenterOfMass']> {
    return this.anatomicalLowerBody.calculateHipCenterOfMass(...args);
  }

  /**
   * [0741] calculateHipToKneeDistance
   * Tính khoảng cách hông đến đầu gối.
   */
  public calculateHipToKneeDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipToKneeDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipToKneeDistance']> {
    return this.anatomicalLowerBody.calculateHipToKneeDistance(...args);
  }

  /**
   * [0742] calculateHipToAnkleDistance
   * Tính khoảng cách hông đến mắt cá.
   */
  public calculateHipToAnkleDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipToAnkleDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipToAnkleDistance']> {
    return this.anatomicalLowerBody.calculateHipToAnkleDistance(...args);
  }

  /**
   * [0743] calculateHipToFootDistance
   * Tính khoảng cách hông đến bàn chân.
   */
  public calculateHipToFootDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipToFootDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipToFootDistance']> {
    return this.anatomicalLowerBody.calculateHipToFootDistance(...args);
  }

  /**
   * [0744] calculatePelvisGroundClearance
   * Tính khoảng cách xương chậu đến mặt đất.
   */
  public calculatePelvisGroundClearance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisGroundClearance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisGroundClearance']> {
    return this.anatomicalLowerBody.calculatePelvisGroundClearance(...args);
  }

  /**
   * [0745] calculatePelvisMotionVector
   * Tính vector chuyển động xương chậu.
   */
  public calculatePelvisMotionVector(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisMotionVector']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisMotionVector']> {
    return this.anatomicalLowerBody.calculatePelvisMotionVector(...args);
  }

  /**
   * [0746] calculatePelvisPoseError
   * Tính sai lệch tư thế xương chậu.
   */
  public calculatePelvisPoseError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisPoseError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisPoseError']> {
    return this.anatomicalLowerBody.calculatePelvisPoseError(...args);
  }

  /**
   * [0747] calculatePelvisStability
   * Tính độ ổn định xương chậu.
   */
  public calculatePelvisStability(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisStability']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisStability']> {
    return this.anatomicalLowerBody.calculatePelvisStability(...args);
  }

  /**
   * [0748] calculatePelvisCollision
   * Kiểm tra va chạm xương chậu.
   */
  public calculatePelvisCollision(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePelvisCollision']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePelvisCollision']> {
    return this.anatomicalLowerBody.calculatePelvisCollision(...args);
  }

  /**
   * [0749] calculateHipJointAxis
   * Tính trục khớp hông.
   */
  public calculateHipJointAxis(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipJointAxis']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipJointAxis']> {
    return this.anatomicalLowerBody.calculateHipJointAxis(...args);
  }

  /**
   * [0750] calculateHipJointNormal
   * Tính pháp tuyến khớp hông.
   */
  public calculateHipJointNormal(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateHipJointNormal']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateHipJointNormal']> {
    return this.anatomicalLowerBody.calculateHipJointNormal(...args);
  }

  /**
   * [0751] getLeftLegPosition
   * Lấy tọa độ chân trái.
   */
  public getLeftLegPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftLegPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftLegPosition']> {
    return this.anatomicalLowerBody.getLeftLegPosition(...args);
  }

  /**
   * [0752] getRightLegPosition
   * Lấy tọa độ chân phải.
   */
  public getRightLegPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightLegPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightLegPosition']> {
    return this.anatomicalLowerBody.getRightLegPosition(...args);
  }

  /**
   * [0753] getLeftLegCenter
   * Lấy tâm chân trái.
   */
  public getLeftLegCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftLegCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftLegCenter']> {
    return this.anatomicalLowerBody.getLeftLegCenter(...args);
  }

  /**
   * [0754] getRightLegCenter
   * Lấy tâm chân phải.
   */
  public getRightLegCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightLegCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightLegCenter']> {
    return this.anatomicalLowerBody.getRightLegCenter(...args);
  }

  /**
   * [0755] getLeftThighPosition
   * Lấy tọa độ đùi trái.
   */
  public getLeftThighPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftThighPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftThighPosition']> {
    return this.anatomicalLowerBody.getLeftThighPosition(...args);
  }

  /**
   * [0756] getRightThighPosition
   * Lấy tọa độ đùi phải.
   */
  public getRightThighPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightThighPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightThighPosition']> {
    return this.anatomicalLowerBody.getRightThighPosition(...args);
  }

  /**
   * [0757] getLeftThighCenter
   * Lấy tâm đùi trái.
   */
  public getLeftThighCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftThighCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftThighCenter']> {
    return this.anatomicalLowerBody.getLeftThighCenter(...args);
  }

  /**
   * [0758] getRightThighCenter
   * Lấy tâm đùi phải.
   */
  public getRightThighCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightThighCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightThighCenter']> {
    return this.anatomicalLowerBody.getRightThighCenter(...args);
  }

  /**
   * [0759] getLeftThighStart
   * Lấy điểm đầu đùi trái.
   */
  public getLeftThighStart(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftThighStart']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftThighStart']> {
    return this.anatomicalLowerBody.getLeftThighStart(...args);
  }

  /**
   * [0760] getRightThighStart
   * Lấy điểm đầu đùi phải.
   */
  public getRightThighStart(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightThighStart']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightThighStart']> {
    return this.anatomicalLowerBody.getRightThighStart(...args);
  }

  /**
   * [0761] getLeftThighEnd
   * Lấy điểm cuối đùi trái.
   */
  public getLeftThighEnd(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftThighEnd']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftThighEnd']> {
    return this.anatomicalLowerBody.getLeftThighEnd(...args);
  }

  /**
   * [0762] getRightThighEnd
   * Lấy điểm cuối đùi phải.
   */
  public getRightThighEnd(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightThighEnd']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightThighEnd']> {
    return this.anatomicalLowerBody.getRightThighEnd(...args);
  }

  /**
   * [0763] calculateThighLength
   * Tính chiều dài đùi.
   */
  public calculateThighLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighLength']> {
    return this.anatomicalLowerBody.calculateThighLength(...args);
  }

  /**
   * [0764] calculateThighWidth
   * Tính chiều rộng đùi.
   */
  public calculateThighWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighWidth']> {
    return this.anatomicalLowerBody.calculateThighWidth(...args);
  }

  /**
   * [0765] calculateThighThickness
   * Tính độ dày đùi.
   */
  public calculateThighThickness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighThickness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighThickness']> {
    return this.anatomicalLowerBody.calculateThighThickness(...args);
  }

  /**
   * [0766] calculateThighVolume
   * Tính thể tích đùi.
   */
  public calculateThighVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighVolume']> {
    return this.anatomicalLowerBody.calculateThighVolume(...args);
  }

  /**
   * [0767] calculateThighSurfaceArea
   * Tính diện tích bề mặt đùi.
   */
  public calculateThighSurfaceArea(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighSurfaceArea']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighSurfaceArea']> {
    return this.anatomicalLowerBody.calculateThighSurfaceArea(...args);
  }

  /**
   * [0768] calculateThighDirection
   * Tính hướng đùi.
   */
  public calculateThighDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighDirection']> {
    return this.anatomicalLowerBody.calculateThighDirection(...args);
  }

  /**
   * [0769] calculateThighOrientation
   * Tính hướng quay đùi.
   */
  public calculateThighOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighOrientation']> {
    return this.anatomicalLowerBody.calculateThighOrientation(...args);
  }

  /**
   * [0770] calculateThighRotation
   * Tính góc quay đùi.
   */
  public calculateThighRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighRotation']> {
    return this.anatomicalLowerBody.calculateThighRotation(...args);
  }

  /**
   * [0771] calculateThighVelocity
   * Tính vận tốc đùi.
   */
  public calculateThighVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighVelocity']> {
    return this.anatomicalLowerBody.calculateThighVelocity(...args);
  }

  /**
   * [0772] calculateThighAcceleration
   * Tính gia tốc đùi.
   */
  public calculateThighAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighAcceleration']> {
    return this.anatomicalLowerBody.calculateThighAcceleration(...args);
  }

  /**
   * [0773] calculateThighBoundingBox
   * Tính hộp bao đùi.
   */
  public calculateThighBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighBoundingBox']> {
    return this.anatomicalLowerBody.calculateThighBoundingBox(...args);
  }

  /**
   * [0774] calculateThighBoundingSphere
   * Tính hình cầu bao đùi.
   */
  public calculateThighBoundingSphere(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighBoundingSphere']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighBoundingSphere']> {
    return this.anatomicalLowerBody.calculateThighBoundingSphere(...args);
  }

  /**
   * [0775] calculateThighCenterOfMass
   * Tính tâm khối lượng đùi.
   */
  public calculateThighCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighCenterOfMass']> {
    return this.anatomicalLowerBody.calculateThighCenterOfMass(...args);
  }

  /**
   * [0776] calculateThighToHipDistance
   * Tính khoảng cách đùi đến hông.
   */
  public calculateThighToHipDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighToHipDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighToHipDistance']> {
    return this.anatomicalLowerBody.calculateThighToHipDistance(...args);
  }

  /**
   * [0777] calculateThighToKneeDistance
   * Tính khoảng cách đùi đến đầu gối.
   */
  public calculateThighToKneeDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighToKneeDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighToKneeDistance']> {
    return this.anatomicalLowerBody.calculateThighToKneeDistance(...args);
  }

  /**
   * [0778] calculateThighSymmetry
   * Tính độ đối xứng đùi.
   */
  public calculateThighSymmetry(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighSymmetry']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighSymmetry']> {
    return this.anatomicalLowerBody.calculateThighSymmetry(...args);
  }

  /**
   * [0779] calculateThighFlexion
   * Tính góc gập đùi.
   */
  public calculateThighFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighFlexion']> {
    return this.anatomicalLowerBody.calculateThighFlexion(...args);
  }

  /**
   * [0780] calculateThighExtension
   * Tính góc duỗi đùi.
   */
  public calculateThighExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighExtension']> {
    return this.anatomicalLowerBody.calculateThighExtension(...args);
  }

  /**
   * [0781] calculateThighAbduction
   * Tính góc dạng đùi.
   */
  public calculateThighAbduction(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighAbduction']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighAbduction']> {
    return this.anatomicalLowerBody.calculateThighAbduction(...args);
  }

  /**
   * [0782] calculateThighAdduction
   * Tính góc khép đùi.
   */
  public calculateThighAdduction(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighAdduction']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighAdduction']> {
    return this.anatomicalLowerBody.calculateThighAdduction(...args);
  }

  /**
   * [0783] calculateThighInternalRotation
   * Tính góc xoay trong đùi.
   */
  public calculateThighInternalRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighInternalRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighInternalRotation']> {
    return this.anatomicalLowerBody.calculateThighInternalRotation(...args);
  }

  /**
   * [0784] calculateThighExternalRotation
   * Tính góc xoay ngoài đùi.
   */
  public calculateThighExternalRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateThighExternalRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateThighExternalRotation']> {
    return this.anatomicalLowerBody.calculateThighExternalRotation(...args);
  }

  /**
   * [0785] calculateLegLength
   * Tính chiều dài chân.
   */
  public calculateLegLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegLength']> {
    return this.anatomicalLowerBody.calculateLegLength(...args);
  }

  /**
   * [0786] calculateLegDirection
   * Tính hướng chân.
   */
  public calculateLegDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegDirection']> {
    return this.anatomicalLowerBody.calculateLegDirection(...args);
  }

  /**
   * [0787] calculateLegOrientation
   * Tính hướng quay chân.
   */
  public calculateLegOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegOrientation']> {
    return this.anatomicalLowerBody.calculateLegOrientation(...args);
  }

  /**
   * [0788] calculateLegVelocity
   * Tính vận tốc chân.
   */
  public calculateLegVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegVelocity']> {
    return this.anatomicalLowerBody.calculateLegVelocity(...args);
  }

  /**
   * [0789] calculateLegAcceleration
   * Tính gia tốc chân.
   */
  public calculateLegAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegAcceleration']> {
    return this.anatomicalLowerBody.calculateLegAcceleration(...args);
  }

  /**
   * [0790] calculateLegBoundingBox
   * Tính hộp bao chân.
   */
  public calculateLegBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegBoundingBox']> {
    return this.anatomicalLowerBody.calculateLegBoundingBox(...args);
  }

  /**
   * [0791] calculateLegCenterOfMass
   * Tính tâm khối lượng chân.
   */
  public calculateLegCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegCenterOfMass']> {
    return this.anatomicalLowerBody.calculateLegCenterOfMass(...args);
  }

  /**
   * [0792] calculateLegSwingAngle
   * Tính góc vung chân.
   */
  public calculateLegSwingAngle(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegSwingAngle']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegSwingAngle']> {
    return this.anatomicalLowerBody.calculateLegSwingAngle(...args);
  }

  /**
   * [0793] calculateLegStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateLegStrideLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegStrideLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegStrideLength']> {
    return this.anatomicalLowerBody.calculateLegStrideLength(...args);
  }

  /**
   * [0794] calculateLegStrideFrequency
   * Tính tần số bước chân.
   */
  public calculateLegStrideFrequency(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegStrideFrequency']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegStrideFrequency']> {
    return this.anatomicalLowerBody.calculateLegStrideFrequency(...args);
  }

  /**
   * [0795] calculateLegGroundClearance
   * Tính khoảng cách chân đến mặt đất.
   */
  public calculateLegGroundClearance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegGroundClearance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegGroundClearance']> {
    return this.anatomicalLowerBody.calculateLegGroundClearance(...args);
  }

  /**
   * [0796] calculateLegContactPoint
   * Tính điểm tiếp xúc chân.
   */
  public calculateLegContactPoint(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegContactPoint']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegContactPoint']> {
    return this.anatomicalLowerBody.calculateLegContactPoint(...args);
  }

  /**
   * [0797] calculateLegContactNormal
   * Tính pháp tuyến điểm tiếp xúc chân.
   */
  public calculateLegContactNormal(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegContactNormal']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegContactNormal']> {
    return this.anatomicalLowerBody.calculateLegContactNormal(...args);
  }

  /**
   * [0798] calculateLegPoseError
   * Tính sai lệch tư thế chân.
   */
  public calculateLegPoseError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegPoseError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegPoseError']> {
    return this.anatomicalLowerBody.calculateLegPoseError(...args);
  }

  /**
   * [0799] calculateLegMotionSmoothness
   * Tính độ mượt chuyển động chân.
   */
  public calculateLegMotionSmoothness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegMotionSmoothness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegMotionSmoothness']> {
    return this.anatomicalLowerBody.calculateLegMotionSmoothness(...args);
  }

  /**
   * [0800] calculateLegInverseKinematics
   * Tính động học ngược chân.
   */
  public calculateLegInverseKinematics(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegInverseKinematics']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegInverseKinematics']> {
    return this.anatomicalLowerBody.calculateLegInverseKinematics(...args);
  }

  /**
   * [0801] getLeftKneePosition
   * Lấy tọa độ đầu gối trái.
   */
  public getLeftKneePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftKneePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftKneePosition']> {
    return this.anatomicalLowerBody.getLeftKneePosition(...args);
  }

  /**
   * [0802] getRightKneePosition
   * Lấy tọa độ đầu gối phải.
   */
  public getRightKneePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightKneePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightKneePosition']> {
    return this.anatomicalLowerBody.getRightKneePosition(...args);
  }

  /**
   * [0803] getLeftKneeCenter
   * Lấy tâm đầu gối trái.
   */
  public getLeftKneeCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftKneeCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftKneeCenter']> {
    return this.anatomicalLowerBody.getLeftKneeCenter(...args);
  }

  /**
   * [0804] getRightKneeCenter
   * Lấy tâm đầu gối phải.
   */
  public getRightKneeCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightKneeCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightKneeCenter']> {
    return this.anatomicalLowerBody.getRightKneeCenter(...args);
  }

  /**
   * [0805] getLeftKneeCapPosition
   * Lấy tọa độ xương bánh chè trái.
   */
  public getLeftKneeCapPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftKneeCapPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftKneeCapPosition']> {
    return this.anatomicalLowerBody.getLeftKneeCapPosition(...args);
  }

  /**
   * [0806] getRightKneeCapPosition
   * Lấy tọa độ xương bánh chè phải.
   */
  public getRightKneeCapPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightKneeCapPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightKneeCapPosition']> {
    return this.anatomicalLowerBody.getRightKneeCapPosition(...args);
  }

  /**
   * [0807] calculateKneeWidth
   * Tính chiều rộng đầu gối.
   */
  public calculateKneeWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeWidth']> {
    return this.anatomicalLowerBody.calculateKneeWidth(...args);
  }

  /**
   * [0808] calculateKneeThickness
   * Tính độ dày đầu gối.
   */
  public calculateKneeThickness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeThickness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeThickness']> {
    return this.anatomicalLowerBody.calculateKneeThickness(...args);
  }

  /**
   * [0809] calculateKneeFlexion
   * Tính góc gập đầu gối.
   */
  public calculateKneeFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeFlexion']> {
    return this.anatomicalLowerBody.calculateKneeFlexion(...args);
  }

  /**
   * [0810] calculateKneeExtension
   * Tính góc duỗi đầu gối.
   */
  public calculateKneeExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeExtension']> {
    return this.anatomicalLowerBody.calculateKneeExtension(...args);
  }

  /**
   * [0812] calculateKneeJointAxis
   * Tính trục khớp gối.
   */
  public calculateKneeJointAxis(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeJointAxis']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeJointAxis']> {
    return this.anatomicalLowerBody.calculateKneeJointAxis(...args);
  }

  /**
   * [0813] calculateKneeJointNormal
   * Tính pháp tuyến khớp gối.
   */
  public calculateKneeJointNormal(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeJointNormal']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeJointNormal']> {
    return this.anatomicalLowerBody.calculateKneeJointNormal(...args);
  }

  /**
   * [0814] calculateKneeVelocity
   * Tính vận tốc đầu gối.
   */
  public calculateKneeVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeVelocity']> {
    return this.anatomicalLowerBody.calculateKneeVelocity(...args);
  }

  /**
   * [0815] calculateKneeAcceleration
   * Tính gia tốc đầu gối.
   */
  public calculateKneeAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeAcceleration']> {
    return this.anatomicalLowerBody.calculateKneeAcceleration(...args);
  }

  /**
   * [0816] calculateKneeBoundingBox
   * Tính hộp bao đầu gối.
   */
  public calculateKneeBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeBoundingBox']> {
    return this.anatomicalLowerBody.calculateKneeBoundingBox(...args);
  }

  /**
   * [0817] calculateKneeBoundingSphere
   * Tính hình cầu bao đầu gối.
   */
  public calculateKneeBoundingSphere(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeBoundingSphere']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeBoundingSphere']> {
    return this.anatomicalLowerBody.calculateKneeBoundingSphere(...args);
  }

  /**
   * [0818] calculateKneeToHipDistance
   * Tính khoảng cách đầu gối đến hông.
   */
  public calculateKneeToHipDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeToHipDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeToHipDistance']> {
    return this.anatomicalLowerBody.calculateKneeToHipDistance(...args);
  }

  /**
   * [0819] calculateKneeToAnkleDistance
   * Tính khoảng cách đầu gối đến mắt cá.
   */
  public calculateKneeToAnkleDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeToAnkleDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeToAnkleDistance']> {
    return this.anatomicalLowerBody.calculateKneeToAnkleDistance(...args);
  }

  /**
   * [0820] calculateKneeSymmetry
   * Tính độ đối xứng đầu gối.
   */
  public calculateKneeSymmetry(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateKneeSymmetry']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateKneeSymmetry']> {
    return this.anatomicalLowerBody.calculateKneeSymmetry(...args);
  }

  /**
   * [0821] getLeftShinPosition
   * Lấy tọa độ cẳng chân trái.
   */
  public getLeftShinPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftShinPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftShinPosition']> {
    return this.anatomicalLowerBody.getLeftShinPosition(...args);
  }

  /**
   * [0822] getRightShinPosition
   * Lấy tọa độ cẳng chân phải.
   */
  public getRightShinPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightShinPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightShinPosition']> {
    return this.anatomicalLowerBody.getRightShinPosition(...args);
  }

  /**
   * [0823] getLeftShinCenter
   * Lấy tâm cẳng chân trái.
   */
  public getLeftShinCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftShinCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftShinCenter']> {
    return this.anatomicalLowerBody.getLeftShinCenter(...args);
  }

  /**
   * [0824] getRightShinCenter
   * Lấy tâm cẳng chân phải.
   */
  public getRightShinCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightShinCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightShinCenter']> {
    return this.anatomicalLowerBody.getRightShinCenter(...args);
  }

  /**
   * [0825] getLeftShinStart
   * Lấy điểm đầu cẳng chân trái.
   */
  public getLeftShinStart(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftShinStart']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftShinStart']> {
    return this.anatomicalLowerBody.getLeftShinStart(...args);
  }

  /**
   * [0826] getRightShinStart
   * Lấy điểm đầu cẳng chân phải.
   */
  public getRightShinStart(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightShinStart']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightShinStart']> {
    return this.anatomicalLowerBody.getRightShinStart(...args);
  }

  /**
   * [0827] getLeftShinEnd
   * Lấy điểm cuối cẳng chân trái.
   */
  public getLeftShinEnd(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftShinEnd']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftShinEnd']> {
    return this.anatomicalLowerBody.getLeftShinEnd(...args);
  }

  /**
   * [0828] getRightShinEnd
   * Lấy điểm cuối cẳng chân phải.
   */
  public getRightShinEnd(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightShinEnd']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightShinEnd']> {
    return this.anatomicalLowerBody.getRightShinEnd(...args);
  }

  /**
   * [0829] calculateShinLength
   * Tính chiều dài cẳng chân.
   */
  public calculateShinLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinLength']> {
    return this.anatomicalLowerBody.calculateShinLength(...args);
  }

  /**
   * [0830] calculateShinWidth
   * Tính chiều rộng cẳng chân.
   */
  public calculateShinWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinWidth']> {
    return this.anatomicalLowerBody.calculateShinWidth(...args);
  }

  /**
   * [0831] calculateShinThickness
   * Tính độ dày cẳng chân.
   */
  public calculateShinThickness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinThickness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinThickness']> {
    return this.anatomicalLowerBody.calculateShinThickness(...args);
  }

  /**
   * [0832] calculateShinVolume
   * Tính thể tích cẳng chân.
   */
  public calculateShinVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinVolume']> {
    return this.anatomicalLowerBody.calculateShinVolume(...args);
  }

  /**
   * [0833] calculateShinDirection
   * Tính hướng cẳng chân.
   */
  public calculateShinDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinDirection']> {
    return this.anatomicalLowerBody.calculateShinDirection(...args);
  }

  /**
   * [0834] calculateShinOrientation
   * Tính hướng quay cẳng chân.
   */
  public calculateShinOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinOrientation']> {
    return this.anatomicalLowerBody.calculateShinOrientation(...args);
  }

  /**
   * [0835] calculateShinVelocity
   * Tính vận tốc cẳng chân.
   */
  public calculateShinVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinVelocity']> {
    return this.anatomicalLowerBody.calculateShinVelocity(...args);
  }

  /**
   * [0836] calculateShinAcceleration
   * Tính gia tốc cẳng chân.
   */
  public calculateShinAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinAcceleration']> {
    return this.anatomicalLowerBody.calculateShinAcceleration(...args);
  }

  /**
   * [0837] calculateShinBoundingBox
   * Tính hộp bao cẳng chân.
   */
  public calculateShinBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinBoundingBox']> {
    return this.anatomicalLowerBody.calculateShinBoundingBox(...args);
  }

  /**
   * [0838] calculateShinCenterOfMass
   * Tính tâm khối lượng cẳng chân.
   */
  public calculateShinCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinCenterOfMass']> {
    return this.anatomicalLowerBody.calculateShinCenterOfMass(...args);
  }

  /**
   * [0839] calculateShinToKneeDistance
   * Tính khoảng cách cẳng chân đến đầu gối.
   */
  public calculateShinToKneeDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinToKneeDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinToKneeDistance']> {
    return this.anatomicalLowerBody.calculateShinToKneeDistance(...args);
  }

  /**
   * [0840] calculateShinToAnkleDistance
   * Tính khoảng cách cẳng chân đến mắt cá.
   */
  public calculateShinToAnkleDistance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinToAnkleDistance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinToAnkleDistance']> {
    return this.anatomicalLowerBody.calculateShinToAnkleDistance(...args);
  }

  /**
   * [0841] calculateShinRotation
   * Tính góc quay cẳng chân.
   */
  public calculateShinRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinRotation']> {
    return this.anatomicalLowerBody.calculateShinRotation(...args);
  }

  /**
   * [0842] calculateShinTwist
   * Tính góc xoắn cẳng chân.
   */
  public calculateShinTwist(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinTwist']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinTwist']> {
    return this.anatomicalLowerBody.calculateShinTwist(...args);
  }

  /**
   * [0843] calculateShinSurfaceNormal
   * Tính pháp tuyến bề mặt cẳng chân.
   */
  public calculateShinSurfaceNormal(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinSurfaceNormal']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinSurfaceNormal']> {
    return this.anatomicalLowerBody.calculateShinSurfaceNormal(...args);
  }

  /**
   * [0844] calculateShinGroundClearance
   * Tính khoảng cách cẳng chân đến mặt đất.
   */
  public calculateShinGroundClearance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinGroundClearance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinGroundClearance']> {
    return this.anatomicalLowerBody.calculateShinGroundClearance(...args);
  }

  /**
   * [0845] calculateShinCollision
   * Kiểm tra va chạm cẳng chân.
   */
  public calculateShinCollision(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinCollision']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinCollision']> {
    return this.anatomicalLowerBody.calculateShinCollision(...args);
  }

  /**
   * [0846] calculateShinPoseError
   * Tính sai lệch tư thế cẳng chân.
   */
  public calculateShinPoseError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinPoseError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinPoseError']> {
    return this.anatomicalLowerBody.calculateShinPoseError(...args);
  }

  /**
   * [0847] calculateShinMotionSmoothness
   * Tính độ mượt chuyển động cẳng chân.
   */
  public calculateShinMotionSmoothness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinMotionSmoothness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinMotionSmoothness']> {
    return this.anatomicalLowerBody.calculateShinMotionSmoothness(...args);
  }

  /**
   * [0848] calculateShinSegmentAlignment
   * Tính độ thẳng hàng cẳng chân.
   */
  public calculateShinSegmentAlignment(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinSegmentAlignment']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinSegmentAlignment']> {
    return this.anatomicalLowerBody.calculateShinSegmentAlignment(...args);
  }

  /**
   * [0849] calculateShinJointChain
   * Tính chuỗi khớp cẳng chân.
   */
  public calculateShinJointChain(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinJointChain']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinJointChain']> {
    return this.anatomicalLowerBody.calculateShinJointChain(...args);
  }

  /**
   * [0850] calculateShinInverseKinematics
   * Tính động học ngược cẳng chân.
   */
  public calculateShinInverseKinematics(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateShinInverseKinematics']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateShinInverseKinematics']> {
    return this.anatomicalLowerBody.calculateShinInverseKinematics(...args);
  }

  /**
   * [0851] getLeftAnklePosition
   * Lấy tọa độ mắt cá trái.
   */
  public getLeftAnklePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftAnklePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftAnklePosition']> {
    return this.anatomicalLowerBody.getLeftAnklePosition(...args);
  }

  /**
   * [0852] getRightAnklePosition
   * Lấy tọa độ mắt cá phải.
   */
  public getRightAnklePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightAnklePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightAnklePosition']> {
    return this.anatomicalLowerBody.getRightAnklePosition(...args);
  }

  /**
   * [0853] getLeftAnkleCenter
   * Lấy tâm mắt cá trái.
   */
  public getLeftAnkleCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftAnkleCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftAnkleCenter']> {
    return this.anatomicalLowerBody.getLeftAnkleCenter(...args);
  }

  /**
   * [0854] getRightAnkleCenter
   * Lấy tâm mắt cá phải.
   */
  public getRightAnkleCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightAnkleCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightAnkleCenter']> {
    return this.anatomicalLowerBody.getRightAnkleCenter(...args);
  }

  /**
   * [0855] getLeftHeelPosition
   * Lấy tọa độ gót chân trái.
   */
  public getLeftHeelPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftHeelPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftHeelPosition']> {
    return this.anatomicalLowerBody.getLeftHeelPosition(...args);
  }

  /**
   * [0856] getRightHeelPosition
   * Lấy tọa độ gót chân phải.
   */
  public getRightHeelPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightHeelPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightHeelPosition']> {
    return this.anatomicalLowerBody.getRightHeelPosition(...args);
  }

  /**
   * [0857] getLeftFootPosition
   * Lấy tọa độ bàn chân trái.
   */
  public getLeftFootPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftFootPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftFootPosition']> {
    return this.anatomicalLowerBody.getLeftFootPosition(...args);
  }

  /**
   * [0858] getRightFootPosition
   * Lấy tọa độ bàn chân phải.
   */
  public getRightFootPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightFootPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightFootPosition']> {
    return this.anatomicalLowerBody.getRightFootPosition(...args);
  }

  /**
   * [0859] getLeftFootCenter
   * Lấy tâm bàn chân trái.
   */
  public getLeftFootCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLeftFootCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLeftFootCenter']> {
    return this.anatomicalLowerBody.getLeftFootCenter(...args);
  }

  /**
   * [0860] getRightFootCenter
   * Lấy tâm bàn chân phải.
   */
  public getRightFootCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getRightFootCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getRightFootCenter']> {
    return this.anatomicalLowerBody.getRightFootCenter(...args);
  }

  /**
   * [0861] getFootToePosition
   * Lấy tọa độ đầu bàn chân.
   */
  public getFootToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootToePosition']> {
    return this.anatomicalLowerBody.getFootToePosition(...args);
  }

  /**
   * [0862] getFootHeelPosition
   * Lấy tọa độ gót bàn chân.
   */
  public getFootHeelPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootHeelPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootHeelPosition']> {
    return this.anatomicalLowerBody.getFootHeelPosition(...args);
  }

  /**
   * [0863] getFootArchPosition
   * Lấy tọa độ vòm bàn chân.
   */
  public getFootArchPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootArchPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootArchPosition']> {
    return this.anatomicalLowerBody.getFootArchPosition(...args);
  }

  /**
   * [0864] getFootSolePosition
   * Lấy tọa độ lòng bàn chân.
   */
  public getFootSolePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootSolePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootSolePosition']> {
    return this.anatomicalLowerBody.getFootSolePosition(...args);
  }

  /**
   * [0865] getFootTopPosition
   * Lấy tọa độ mu bàn chân.
   */
  public getFootTopPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootTopPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootTopPosition']> {
    return this.anatomicalLowerBody.getFootTopPosition(...args);
  }

  /**
   * [0866] getFootInnerEdge
   * Lấy tọa độ mép trong bàn chân.
   */
  public getFootInnerEdge(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootInnerEdge']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootInnerEdge']> {
    return this.anatomicalLowerBody.getFootInnerEdge(...args);
  }

  /**
   * [0867] getFootOuterEdge
   * Lấy tọa độ mép ngoài bàn chân.
   */
  public getFootOuterEdge(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFootOuterEdge']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFootOuterEdge']> {
    return this.anatomicalLowerBody.getFootOuterEdge(...args);
  }

  /**
   * [0868] calculateAnkleWidth
   * Tính chiều rộng mắt cá.
   */
  public calculateAnkleWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleWidth']> {
    return this.anatomicalLowerBody.calculateAnkleWidth(...args);
  }

  /**
   * [0869] calculateAnkleFlexion
   * Tính góc gập mắt cá.
   */
  public calculateAnkleFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleFlexion']> {
    return this.anatomicalLowerBody.calculateAnkleFlexion(...args);
  }

  /**
   * [0870] calculateAnkleExtension
   * Tính góc duỗi mắt cá.
   */
  public calculateAnkleExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleExtension']> {
    return this.anatomicalLowerBody.calculateAnkleExtension(...args);
  }

  /**
   * [0871] calculateAnkleInversion
   * Tính góc nghiêng lòng bàn chân vào trong.
   */
  public calculateAnkleInversion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleInversion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleInversion']> {
    return this.anatomicalLowerBody.calculateAnkleInversion(...args);
  }

  /**
   * [0872] calculateAnkleEversion
   * Tính góc nghiêng lòng bàn chân ra ngoài.
   */
  public calculateAnkleEversion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleEversion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleEversion']> {
    return this.anatomicalLowerBody.calculateAnkleEversion(...args);
  }

  /**
   * [0873] calculateAnkleRotation
   * Tính góc quay mắt cá.
   */
  public calculateAnkleRotation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleRotation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleRotation']> {
    return this.anatomicalLowerBody.calculateAnkleRotation(...args);
  }

  /**
   * [0874] calculateAnkleVelocity
   * Tính vận tốc mắt cá.
   */
  public calculateAnkleVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleVelocity']> {
    return this.anatomicalLowerBody.calculateAnkleVelocity(...args);
  }

  /**
   * [0875] calculateAnkleAcceleration
   * Tính gia tốc mắt cá.
   */
  public calculateAnkleAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateAnkleAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateAnkleAcceleration']> {
    return this.anatomicalLowerBody.calculateAnkleAcceleration(...args);
  }

  /**
   * [0876] calculateFootLength
   * Tính chiều dài bàn chân.
   */
  public calculateFootLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootLength']> {
    return this.anatomicalLowerBody.calculateFootLength(...args);
  }

  /**
   * [0877] calculateFootWidth
   * Tính chiều rộng bàn chân.
   */
  public calculateFootWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootWidth']> {
    return this.anatomicalLowerBody.calculateFootWidth(...args);
  }

  /**
   * [0878] calculateFootHeight
   * Tính chiều cao bàn chân.
   */
  public calculateFootHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootHeight']> {
    return this.anatomicalLowerBody.calculateFootHeight(...args);
  }

  /**
   * [0879] calculateFootThickness
   * Tính độ dày bàn chân.
   */
  public calculateFootThickness(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootThickness']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootThickness']> {
    return this.anatomicalLowerBody.calculateFootThickness(...args);
  }

  /**
   * [0880] calculateFootVolume
   * Tính thể tích bàn chân.
   */
  public calculateFootVolume(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootVolume']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootVolume']> {
    return this.anatomicalLowerBody.calculateFootVolume(...args);
  }

  /**
   * [0881] calculateFootSurfaceArea
   * Tính diện tích bề mặt bàn chân.
   */
  public calculateFootSurfaceArea(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootSurfaceArea']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootSurfaceArea']> {
    return this.anatomicalLowerBody.calculateFootSurfaceArea(...args);
  }

  /**
   * [0882] calculateFootOrientation
   * Tính hướng bàn chân.
   */
  public calculateFootOrientation(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootOrientation']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootOrientation']> {
    return this.anatomicalLowerBody.calculateFootOrientation(...args);
  }

  /**
   * [0883] calculateFootDirection
   * Tính hướng di chuyển của bàn chân.
   */
  public calculateFootDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootDirection']> {
    return this.anatomicalLowerBody.calculateFootDirection(...args);
  }

  /**
   * [0885] calculateFootPitch
   * Tính góc chúi/ngẩng bàn chân.
   */
  public calculateFootPitch(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootPitch']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootPitch']> {
    return this.anatomicalLowerBody.calculateFootPitch(...args);
  }

  /**
   * [0886] calculateFootRoll
   * Tính góc lăn bàn chân.
   */
  public calculateFootRoll(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootRoll']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootRoll']> {
    return this.anatomicalLowerBody.calculateFootRoll(...args);
  }

  /**
   * [0887] calculateFootYaw
   * Tính góc quay ngang bàn chân.
   */
  public calculateFootYaw(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootYaw']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootYaw']> {
    return this.anatomicalLowerBody.calculateFootYaw(...args);
  }

  /**
   * [0888] calculateFootVelocity
   * Tính vận tốc bàn chân.
   */
  public calculateFootVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootVelocity']> {
    return this.anatomicalLowerBody.calculateFootVelocity(...args);
  }

  /**
   * [0889] calculateFootAcceleration
   * Tính gia tốc bàn chân.
   */
  public calculateFootAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootAcceleration']> {
    return this.anatomicalLowerBody.calculateFootAcceleration(...args);
  }

  /**
   * [0890] calculateFootAngularVelocity
   * Tính vận tốc góc bàn chân.
   */
  public calculateFootAngularVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootAngularVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootAngularVelocity']> {
    return this.anatomicalLowerBody.calculateFootAngularVelocity(...args);
  }

  /**
   * [0891] calculateFootBoundingBox
   * Tính hộp bao bàn chân.
   */
  public calculateFootBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootBoundingBox']> {
    return this.anatomicalLowerBody.calculateFootBoundingBox(...args);
  }

  /**
   * [0892] calculateFootBoundingSphere
   * Tính hình cầu bao bàn chân.
   */
  public calculateFootBoundingSphere(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootBoundingSphere']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootBoundingSphere']> {
    return this.anatomicalLowerBody.calculateFootBoundingSphere(...args);
  }

  /**
   * [0893] calculateFootCenterOfMass
   * Tính tâm khối lượng bàn chân.
   */
  public calculateFootCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootCenterOfMass']> {
    return this.anatomicalLowerBody.calculateFootCenterOfMass(...args);
  }

  /**
   * [0894] calculateFootGroundContact
   * Kiểm tra bàn chân tiếp xúc mặt đất.
   */
  public calculateFootGroundContact(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootGroundContact']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootGroundContact']> {
    return this.anatomicalLowerBody.calculateFootGroundContact(...args);
  }

  /**
   * [0895] calculateFootGroundClearance
   * Tính khoảng cách bàn chân đến mặt đất.
   */
  public calculateFootGroundClearance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootGroundClearance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootGroundClearance']> {
    return this.anatomicalLowerBody.calculateFootGroundClearance(...args);
  }

  /**
   * [0896] calculateFootPressureCenter
   * Tính tâm áp lực bàn chân.
   */
  public calculateFootPressureCenter(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootPressureCenter']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootPressureCenter']> {
    return this.anatomicalLowerBody.calculateFootPressureCenter(...args);
  }

  /**
   * [0897] calculateFootContactArea
   * Tính diện tích tiếp xúc bàn chân.
   */
  public calculateFootContactArea(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootContactArea']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootContactArea']> {
    return this.anatomicalLowerBody.calculateFootContactArea(...args);
  }

  /**
   * [0898] calculateFootSlipVelocity
   * Tính vận tốc trượt bàn chân.
   */
  public calculateFootSlipVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootSlipVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootSlipVelocity']> {
    return this.anatomicalLowerBody.calculateFootSlipVelocity(...args);
  }

  /**
   * [0899] calculateFootStrideLength
   * Tính chiều dài bước chân.
   */
  public calculateFootStrideLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootStrideLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootStrideLength']> {
    return this.anatomicalLowerBody.calculateFootStrideLength(...args);
  }

  /**
   * [0900] calculateFootInverseKinematics
   * Tính động học ngược bàn chân.
   */
  public calculateFootInverseKinematics(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootInverseKinematics']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootInverseKinematics']> {
    return this.anatomicalLowerBody.calculateFootInverseKinematics(...args);
  }

  /**
   * [0901] getBigToePosition
   * Lấy tọa độ ngón chân cái.
   */
  public getBigToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getBigToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getBigToePosition']> {
    return this.anatomicalLowerBody.getBigToePosition(...args);
  }

  /**
   * [0902] getSecondToePosition
   * Lấy tọa độ ngón chân thứ hai.
   */
  public getSecondToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getSecondToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getSecondToePosition']> {
    return this.anatomicalLowerBody.getSecondToePosition(...args);
  }

  /**
   * [0903] getThirdToePosition
   * Lấy tọa độ ngón chân thứ ba.
   */
  public getThirdToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getThirdToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getThirdToePosition']> {
    return this.anatomicalLowerBody.getThirdToePosition(...args);
  }

  /**
   * [0904] getFourthToePosition
   * Lấy tọa độ ngón chân thứ tư.
   */
  public getFourthToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getFourthToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getFourthToePosition']> {
    return this.anatomicalLowerBody.getFourthToePosition(...args);
  }

  /**
   * [0905] getLittleToePosition
   * Lấy tọa độ ngón chân út.
   */
  public getLittleToePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getLittleToePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getLittleToePosition']> {
    return this.anatomicalLowerBody.getLittleToePosition(...args);
  }

  /**
   * [0906] getToeTipPosition
   * Lấy tọa độ đầu ngón chân.
   */
  public getToeTipPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getToeTipPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getToeTipPosition']> {
    return this.anatomicalLowerBody.getToeTipPosition(...args);
  }

  /**
   * [0907] getToeBasePosition
   * Lấy tọa độ gốc ngón chân.
   */
  public getToeBasePosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getToeBasePosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getToeBasePosition']> {
    return this.anatomicalLowerBody.getToeBasePosition(...args);
  }

  /**
   * [0908] getToeJointPosition
   * Lấy tọa độ khớp ngón chân.
   */
  public getToeJointPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getToeJointPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getToeJointPosition']> {
    return this.anatomicalLowerBody.getToeJointPosition(...args);
  }

  /**
   * [0909] getToeNailPosition
   * Lấy tọa độ móng ngón chân.
   */
  public getToeNailPosition(
    ...args: Parameters<AnatomicalLowerBodySubsystem['getToeNailPosition']>
  ): ReturnType<AnatomicalLowerBodySubsystem['getToeNailPosition']> {
    return this.anatomicalLowerBody.getToeNailPosition(...args);
  }

  /**
   * [0910] calculateToeLength
   * Tính chiều dài ngón chân.
   */
  public calculateToeLength(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeLength']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeLength']> {
    return this.anatomicalLowerBody.calculateToeLength(...args);
  }

  /**
   * [0911] calculateToeWidth
   * Tính chiều rộng ngón chân.
   */
  public calculateToeWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeWidth']> {
    return this.anatomicalLowerBody.calculateToeWidth(...args);
  }

  /**
   * [0912] calculateToeFlexion
   * Tính góc gập ngón chân.
   */
  public calculateToeFlexion(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeFlexion']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeFlexion']> {
    return this.anatomicalLowerBody.calculateToeFlexion(...args);
  }

  /**
   * [0913] calculateToeExtension
   * Tính góc duỗi ngón chân.
   */
  public calculateToeExtension(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeExtension']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeExtension']> {
    return this.anatomicalLowerBody.calculateToeExtension(...args);
  }

  /**
   * [0914] calculateToeSpread
   * Tính độ xòe ngón chân.
   */
  public calculateToeSpread(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeSpread']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeSpread']> {
    return this.anatomicalLowerBody.calculateToeSpread(...args);
  }

  /**
   * [0915] calculateToeCurl
   * Tính độ cuộn ngón chân.
   */
  public calculateToeCurl(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeCurl']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeCurl']> {
    return this.anatomicalLowerBody.calculateToeCurl(...args);
  }

  /**
   * [0916] calculateToeDirection
   * Tính hướng ngón chân.
   */
  public calculateToeDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeDirection']> {
    return this.anatomicalLowerBody.calculateToeDirection(...args);
  }

  /**
   * [0917] calculateToeVelocity
   * Tính vận tốc ngón chân.
   */
  public calculateToeVelocity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeVelocity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeVelocity']> {
    return this.anatomicalLowerBody.calculateToeVelocity(...args);
  }

  /**
   * [0918] calculateToeAcceleration
   * Tính gia tốc ngón chân.
   */
  public calculateToeAcceleration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeAcceleration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeAcceleration']> {
    return this.anatomicalLowerBody.calculateToeAcceleration(...args);
  }

  /**
   * [0919] calculateToeJointAngles
   * Tính các góc khớp ngón chân.
   */
  public calculateToeJointAngles(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeJointAngles']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeJointAngles']> {
    return this.anatomicalLowerBody.calculateToeJointAngles(...args);
  }

  /**
   * [0920] calculateToeBoundingBox
   * Tính hộp bao ngón chân.
   */
  public calculateToeBoundingBox(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateToeBoundingBox']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateToeBoundingBox']> {
    return this.anatomicalLowerBody.calculateToeBoundingBox(...args);
  }

  /**
   * [0921] calculateStandingHeight
   * Tính chiều cao khi đứng.
   */
  public calculateStandingHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateStandingHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateStandingHeight']> {
    return this.anatomicalLowerBody.calculateStandingHeight(...args);
  }

  /**
   * [0922] calculateBodyBalance
   * Tính độ cân bằng cơ thể.
   */
  public calculateBodyBalance(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateBodyBalance']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateBodyBalance']> {
    return this.anatomicalLowerBody.calculateBodyBalance(...args);
  }

  /**
   * [0923] calculateCenterOfGravity
   * Tính trọng tâm cơ thể.
   */
  public calculateCenterOfGravity(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateCenterOfGravity']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateCenterOfGravity']> {
    return this.anatomicalLowerBody.calculateCenterOfGravity(...args);
  }

  /**
   * [0924] calculateCenterOfMass
   * Tính tâm khối lượng cơ thể.
   */
  public calculateCenterOfMass(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateCenterOfMass']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateCenterOfMass']> {
    return this.anatomicalLowerBody.calculateCenterOfMass(...args);
  }

  /**
   * [0925] calculateBaseOfSupport
   * Tính vùng chân đế hỗ trợ cơ thể.
   */
  public calculateBaseOfSupport(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateBaseOfSupport']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateBaseOfSupport']> {
    return this.anatomicalLowerBody.calculateBaseOfSupport(...args);
  }

  /**
   * [0926] calculateBalanceMargin
   * Tính biên an toàn cân bằng.
   */
  public calculateBalanceMargin(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateBalanceMargin']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateBalanceMargin']> {
    return this.anatomicalLowerBody.calculateBalanceMargin(...args);
  }

  /**
   * [0927] calculateBodySway
   * Tính độ lắc cơ thể.
   */
  public calculateBodySway(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateBodySway']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateBodySway']> {
    return this.anatomicalLowerBody.calculateBodySway(...args);
  }

  /**
   * [0928] calculateBodyLean
   * Tính độ nghiêng cơ thể.
   */
  public calculateBodyLean(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateBodyLean']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateBodyLean']> {
    return this.anatomicalLowerBody.calculateBodyLean(...args);
  }

  /**
   * [0929] calculatePostureStability
   * Tính độ ổn định tư thế.
   */
  public calculatePostureStability(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculatePostureStability']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculatePostureStability']> {
    return this.anatomicalLowerBody.calculatePostureStability(...args);
  }

  /**
   * [0930] calculateStandingPoseError
   * Tính sai lệch tư thế đứng.
   */
  public calculateStandingPoseError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateStandingPoseError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateStandingPoseError']> {
    return this.anatomicalLowerBody.calculateStandingPoseError(...args);
  }

  /**
   * [0931] calculateSittingHeight
   * Tính chiều cao khi ngồi.
   */
  public calculateSittingHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateSittingHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateSittingHeight']> {
    return this.anatomicalLowerBody.calculateSittingHeight(...args);
  }

  /**
   * [0932] calculateSittingPose
   * Tính tư thế ngồi.
   */
  public calculateSittingPose(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateSittingPose']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateSittingPose']> {
    return this.anatomicalLowerBody.calculateSittingPose(...args);
  }

  /**
   * [0933] calculateSquatDepth
   * Tính độ sâu động tác ngồi xổm.
   */
  public calculateSquatDepth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateSquatDepth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateSquatDepth']> {
    return this.anatomicalLowerBody.calculateSquatDepth(...args);
  }

  /**
   * [0934] calculateJumpHeight
   * Tính độ cao nhảy.
   */
  public calculateJumpHeight(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateJumpHeight']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateJumpHeight']> {
    return this.anatomicalLowerBody.calculateJumpHeight(...args);
  }

  /**
   * [0935] calculateLandingImpact
   * Ước lượng lực va chạm khi tiếp đất.
   */
  public calculateLandingImpact(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLandingImpact']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLandingImpact']> {
    return this.anatomicalLowerBody.calculateLandingImpact(...args);
  }

  /**
   * [0936] calculateGroundReactionForce
   * Ước lượng phản lực mặt đất.
   */
  public calculateGroundReactionForce(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateGroundReactionForce']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateGroundReactionForce']> {
    return this.anatomicalLowerBody.calculateGroundReactionForce(...args);
  }

  /**
   * [0937] calculateGaitCycle
   * Tính chu kỳ dáng đi.
   */
  public calculateGaitCycle(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateGaitCycle']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateGaitCycle']> {
    return this.anatomicalLowerBody.calculateGaitCycle(...args);
  }

  /**
   * [0938] calculateGaitPhase
   * Xác định pha của chu kỳ dáng đi.
   */
  public calculateGaitPhase(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateGaitPhase']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateGaitPhase']> {
    return this.anatomicalLowerBody.calculateGaitPhase(...args);
  }

  /**
   * [0939] calculateStepFrequency
   * Tính tần số bước chân.
   */
  public calculateStepFrequency(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateStepFrequency']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateStepFrequency']> {
    return this.anatomicalLowerBody.calculateStepFrequency(...args);
  }

  /**
   * [0940] calculateWalkingSpeed
   * Tính tốc độ đi bộ.
   */
  public calculateWalkingSpeed(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateWalkingSpeed']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateWalkingSpeed']> {
    return this.anatomicalLowerBody.calculateWalkingSpeed(...args);
  }

  /**
   * [0941] calculateRunningSpeed
   * Tính tốc độ chạy.
   */
  public calculateRunningSpeed(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateRunningSpeed']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateRunningSpeed']> {
    return this.anatomicalLowerBody.calculateRunningSpeed(...args);
  }

  /**
   * [0942] calculateStrideWidth
   * Tính chiều rộng bước chân.
   */
  public calculateStrideWidth(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateStrideWidth']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateStrideWidth']> {
    return this.anatomicalLowerBody.calculateStrideWidth(...args);
  }

  /**
   * [0943] calculateStrideSymmetry
   * Tính độ đối xứng bước chân.
   */
  public calculateStrideSymmetry(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateStrideSymmetry']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateStrideSymmetry']> {
    return this.anatomicalLowerBody.calculateStrideSymmetry(...args);
  }

  /**
   * [0944] calculateFootPlacement
   * Tính vị trí đặt chân.
   */
  public calculateFootPlacement(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootPlacement']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootPlacement']> {
    return this.anatomicalLowerBody.calculateFootPlacement(...args);
  }

  /**
   * [0945] calculateFootPlacementError
   * Tính sai lệch vị trí đặt chân.
   */
  public calculateFootPlacementError(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateFootPlacementError']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateFootPlacementError']> {
    return this.anatomicalLowerBody.calculateFootPlacementError(...args);
  }

  /**
   * [0946] calculateGroundPenetration
   * Tính độ xuyên chân xuống mặt đất.
   */
  public calculateGroundPenetration(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateGroundPenetration']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateGroundPenetration']> {
    return this.anatomicalLowerBody.calculateGroundPenetration(...args);
  }

  /**
   * [0947] calculateGroundAlignment
   * Tính độ căn chỉnh chân với mặt đất.
   */
  public calculateGroundAlignment(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateGroundAlignment']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateGroundAlignment']> {
    return this.anatomicalLowerBody.calculateGroundAlignment(...args);
  }

  /**
   * [0948] calculateLegSupportPhase
   * Xác định pha chân trụ.
   */
  public calculateLegSupportPhase(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLegSupportPhase']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLegSupportPhase']> {
    return this.anatomicalLowerBody.calculateLegSupportPhase(...args);
  }

  /**
   * [0949] calculateSwingPhase
   * Xác định pha chân vung.
   */
  public calculateSwingPhase(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateSwingPhase']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateSwingPhase']> {
    return this.anatomicalLowerBody.calculateSwingPhase(...args);
  }

  /**
   * [0950] calculateLocomotionDirection
   * Tính hướng di chuyển cơ thể.
   */
  public calculateLocomotionDirection(
    ...args: Parameters<AnatomicalLowerBodySubsystem['calculateLocomotionDirection']>
  ): ReturnType<AnatomicalLowerBodySubsystem['calculateLocomotionDirection']> {
    return this.anatomicalLowerBody.calculateLocomotionDirection(...args);
  }

  /**
   * [0951] getBonePosition
   * Lấy tọa độ xương.
   */
  public getBonePosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBonePosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBonePosition']> {
    return this.skeletalKinematicsCharacter.getBonePosition(...args);
  }

  /**
   * [0952] getBoneStartPosition
   * Lấy điểm đầu xương.
   */
  public getBoneStartPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneStartPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneStartPosition']> {
    return this.skeletalKinematicsCharacter.getBoneStartPosition(...args);
  }

  /**
   * [0953] getBoneEndPosition
   * Lấy điểm cuối xương.
   */
  public getBoneEndPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneEndPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneEndPosition']> {
    return this.skeletalKinematicsCharacter.getBoneEndPosition(...args);
  }

  /**
   * [0954] getBoneCenter
   * Lấy tâm xương.
   */
  public getBoneCenter(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneCenter']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneCenter']> {
    return this.skeletalKinematicsCharacter.getBoneCenter(...args);
  }

  /**
   * [0955] getBoneDirection
   * Lấy hướng xương.
   */
  public getBoneDirection(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneDirection']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneDirection']> {
    return this.skeletalKinematicsCharacter.getBoneDirection(...args);
  }

  /**
   * [0956] getBoneOrientation
   * Lấy hướng quay xương.
   */
  public getBoneOrientation(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneOrientation']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneOrientation']> {
    return this.skeletalKinematicsCharacter.getBoneOrientation(...args);
  }

  /**
   * [0957] getBoneLength
   * Lấy chiều dài xương.
   */
  public getBoneLength(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneLength']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneLength']> {
    return this.skeletalKinematicsCharacter.getBoneLength(...args);
  }

  /**
   * [0958] getBoneScale
   * Lấy tỷ lệ kích thước xương.
   */
  public getBoneScale(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneScale']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneScale']> {
    return this.skeletalKinematicsCharacter.getBoneScale(...args);
  }

  /**
   * [0959] getBoneParent
   * Lấy xương cha.
   */
  public getBoneParent(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneParent']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneParent']> {
    return this.skeletalKinematicsCharacter.getBoneParent(...args);
  }

  /**
   * [0960] getBoneChildren
   * Lấy danh sách xương con.
   */
  public getBoneChildren(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getBoneChildren']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getBoneChildren']> {
    return this.skeletalKinematicsCharacter.getBoneChildren(...args);
  }

  /**
   * [0961] calculateBoneDistance
   * Tính khoảng cách giữa các xương.
   */
  public calculateBoneDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneDistance']> {
    return this.skeletalKinematicsCharacter.calculateBoneDistance(...args);
  }

  /**
   * [0962] calculateBoneAngle
   * Tính góc giữa các xương.
   */
  public calculateBoneAngle(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneAngle']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneAngle']> {
    return this.skeletalKinematicsCharacter.calculateBoneAngle(...args);
  }

  /**
   * [0963] calculateBoneAlignment
   * Tính độ thẳng hàng xương.
   */
  public calculateBoneAlignment(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneAlignment']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneAlignment']> {
    return this.skeletalKinematicsCharacter.calculateBoneAlignment(...args);
  }

  /**
   * [0964] calculateBoneChainLength
   * Tính chiều dài chuỗi xương.
   */
  public calculateBoneChainLength(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneChainLength']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneChainLength']> {
    return this.skeletalKinematicsCharacter.calculateBoneChainLength(...args);
  }

  /**
   * [0965] calculateBoneHierarchyDepth
   * Tính độ sâu phân cấp xương.
   */
  public calculateBoneHierarchyDepth(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneHierarchyDepth']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneHierarchyDepth']> {
    return this.skeletalKinematicsCharacter.calculateBoneHierarchyDepth(...args);
  }

  /**
   * [0966] calculateBoneWorldTransform
   * Tính phép biến đổi xương trong thế giới.
   */
  public calculateBoneWorldTransform(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneWorldTransform']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneWorldTransform']> {
    return this.skeletalKinematicsCharacter.calculateBoneWorldTransform(...args);
  }

  /**
   * [0967] calculateBoneLocalTransform
   * Tính phép biến đổi xương cục bộ.
   */
  public calculateBoneLocalTransform(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneLocalTransform']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneLocalTransform']> {
    return this.skeletalKinematicsCharacter.calculateBoneLocalTransform(...args);
  }

  /**
   * [0968] calculateBoneInverseTransform
   * Tính phép biến đổi nghịch đảo xương.
   */
  public calculateBoneInverseTransform(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneInverseTransform']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneInverseTransform']> {
    return this.skeletalKinematicsCharacter.calculateBoneInverseTransform(...args);
  }

  /**
   * [0969] calculateBoneBindPose
   * Tính tư thế gốc của xương.
   */
  public calculateBoneBindPose(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneBindPose']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneBindPose']> {
    return this.skeletalKinematicsCharacter.calculateBoneBindPose(...args);
  }

  /**
   * [0970] calculateBonePoseDelta
   * Tính độ thay đổi tư thế xương.
   */
  public calculateBonePoseDelta(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBonePoseDelta']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBonePoseDelta']> {
    return this.skeletalKinematicsCharacter.calculateBonePoseDelta(...args);
  }

  /**
   * [0971] calculateBoneVelocity
   * Tính vận tốc xương.
   */
  public calculateBoneVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneVelocity']> {
    return this.skeletalKinematicsCharacter.calculateBoneVelocity(...args);
  }

  /**
   * [0972] calculateBoneAcceleration
   * Tính gia tốc xương.
   */
  public calculateBoneAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateBoneAcceleration(...args);
  }

  /**
   * [0973] calculateBoneAngularVelocity
   * Tính vận tốc góc xương.
   */
  public calculateBoneAngularVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneAngularVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneAngularVelocity']> {
    return this.skeletalKinematicsCharacter.calculateBoneAngularVelocity(...args);
  }

  /**
   * [0974] calculateBoneAngularAcceleration
   * Tính gia tốc góc xương.
   */
  public calculateBoneAngularAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneAngularAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneAngularAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateBoneAngularAcceleration(...args);
  }

  /**
   * [0975] calculateBoneBoundingBox
   * Tính hộp bao xương.
   */
  public calculateBoneBoundingBox(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneBoundingBox']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneBoundingBox']> {
    return this.skeletalKinematicsCharacter.calculateBoneBoundingBox(...args);
  }

  /**
   * [0976] calculateBoneBoundingSphere
   * Tính hình cầu bao xương.
   */
  public calculateBoneBoundingSphere(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneBoundingSphere']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneBoundingSphere']> {
    return this.skeletalKinematicsCharacter.calculateBoneBoundingSphere(...args);
  }

  /**
   * [0977] calculateBoneCapsule
   * Tính capsule đại diện xương.
   */
  public calculateBoneCapsule(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneCapsule']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneCapsule']> {
    return this.skeletalKinematicsCharacter.calculateBoneCapsule(...args);
  }

  /**
   * [0978] calculateBoneCollision
   * Kiểm tra va chạm xương.
   */
  public calculateBoneCollision(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneCollision']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneCollision']> {
    return this.skeletalKinematicsCharacter.calculateBoneCollision(...args);
  }

  /**
   * [0979] calculateBoneIntersection
   * Tính giao điểm giữa các xương.
   */
  public calculateBoneIntersection(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneIntersection']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneIntersection']> {
    return this.skeletalKinematicsCharacter.calculateBoneIntersection(...args);
  }

  /**
   * [0980] calculateBoneClosestPoint
   * Tìm điểm gần nhất trên xương.
   */
  public calculateBoneClosestPoint(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneClosestPoint']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneClosestPoint']> {
    return this.skeletalKinematicsCharacter.calculateBoneClosestPoint(...args);
  }

  /**
   * [0981] getJointPosition
   * Lấy tọa độ khớp.
   */
  public getJointPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointPosition']> {
    return this.skeletalKinematicsCharacter.getJointPosition(...args);
  }

  /**
   * [0982] getJointCenter
   * Lấy tâm khớp.
   */
  public getJointCenter(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointCenter']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointCenter']> {
    return this.skeletalKinematicsCharacter.getJointCenter(...args);
  }

  /**
   * [0983] getJointAxis
   * Lấy trục khớp.
   */
  public getJointAxis(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointAxis']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointAxis']> {
    return this.skeletalKinematicsCharacter.getJointAxis(...args);
  }

  /**
   * [0984] getJointNormal
   * Lấy pháp tuyến khớp.
   */
  public getJointNormal(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointNormal']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointNormal']> {
    return this.skeletalKinematicsCharacter.getJointNormal(...args);
  }

  /**
   * [0985] getJointParentBone
   * Lấy xương cha của khớp.
   */
  public getJointParentBone(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointParentBone']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointParentBone']> {
    return this.skeletalKinematicsCharacter.getJointParentBone(...args);
  }

  /**
   * [0986] getJointChildBone
   * Lấy xương con của khớp.
   */
  public getJointChildBone(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getJointChildBone']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getJointChildBone']> {
    return this.skeletalKinematicsCharacter.getJointChildBone(...args);
  }

  /**
   * [0987] calculateJointAngle
   * Tính góc khớp.
   */
  public calculateJointAngle(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointAngle']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointAngle']> {
    return this.skeletalKinematicsCharacter.calculateJointAngle(...args);
  }

  /**
   * [0988] calculateJointLimit
   * Tính hoặc áp dụng giới hạn khớp.
   */
  public calculateJointLimit(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointLimit']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointLimit']> {
    return this.skeletalKinematicsCharacter.calculateJointLimit(...args);
  }

  /**
   * [0989] calculateJointConstraint
   * Tính ràng buộc khớp.
   */
  public calculateJointConstraint(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointConstraint']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointConstraint']> {
    return this.skeletalKinematicsCharacter.calculateJointConstraint(...args);
  }

  /**
   * [0990] calculateJointVelocity
   * Tính vận tốc khớp.
   */
  public calculateJointVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointVelocity']> {
    return this.skeletalKinematicsCharacter.calculateJointVelocity(...args);
  }

  /**
   * [0991] calculateJointAcceleration
   * Tính gia tốc khớp.
   */
  public calculateJointAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateJointAcceleration(...args);
  }

  /**
   * [0992] calculateJointTorque
   * Tính mô-men xoắn khớp.
   */
  public calculateJointTorque(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointTorque']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointTorque']> {
    return this.skeletalKinematicsCharacter.calculateJointTorque(...args);
  }

  /**
   * [0993] calculateJointForce
   * Tính lực tại khớp.
   */
  public calculateJointForce(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointForce']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointForce']> {
    return this.skeletalKinematicsCharacter.calculateJointForce(...args);
  }

  /**
   * [0994] calculateJointStiffness
   * Tính độ cứng khớp.
   */
  public calculateJointStiffness(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointStiffness']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointStiffness']> {
    return this.skeletalKinematicsCharacter.calculateJointStiffness(...args);
  }

  /**
   * [0995] calculateJointDamping
   * Tính hệ số giảm chấn khớp.
   */
  public calculateJointDamping(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointDamping']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointDamping']> {
    return this.skeletalKinematicsCharacter.calculateJointDamping(...args);
  }

  /**
   * [0996] calculateJointFriction
   * Tính ma sát khớp.
   */
  public calculateJointFriction(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointFriction']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointFriction']> {
    return this.skeletalKinematicsCharacter.calculateJointFriction(...args);
  }

  /**
   * [0997] calculateJointCollision
   * Kiểm tra va chạm khớp.
   */
  public calculateJointCollision(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointCollision']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointCollision']> {
    return this.skeletalKinematicsCharacter.calculateJointCollision(...args);
  }

  /**
   * [0998] calculateJointChain
   * Tính chuỗi liên kết khớp.
   */
  public calculateJointChain(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointChain']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointChain']> {
    return this.skeletalKinematicsCharacter.calculateJointChain(...args);
  }

  /**
   * [0999] calculateJointPoseError
   * Tính sai lệch tư thế khớp.
   */
  public calculateJointPoseError(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointPoseError']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointPoseError']> {
    return this.skeletalKinematicsCharacter.calculateJointPoseError(...args);
  }

  /**
   * [1000] calculateJointInverseKinematics
   * Tính động học ngược chuỗi khớp.
   */
  public calculateJointInverseKinematics(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateJointInverseKinematics']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateJointInverseKinematics']> {
    return this.skeletalKinematicsCharacter.calculateJointInverseKinematics(...args);
  }

  /**
   * [1001] calculateForwardKinematics
   * Tính động học thuận.
   */
  public calculateForwardKinematics(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateForwardKinematics']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateForwardKinematics']> {
    return this.skeletalKinematicsCharacter.calculateForwardKinematics(...args);
  }

  /**
   * [1002] calculateInverseKinematics
   * Tính động học ngược.
   */
  public calculateInverseKinematics(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateInverseKinematics']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateInverseKinematics']> {
    return this.skeletalKinematicsCharacter.calculateInverseKinematics(...args);
  }

  /**
   * [1003] solveTwoBoneIK
   * Giải động học ngược chuỗi hai xương.
   */
  public solveTwoBoneIK(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['solveTwoBoneIK']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['solveTwoBoneIK']> {
    return this.skeletalKinematicsCharacter.solveTwoBoneIK(...args);
  }

  /**
   * [1004] solveThreeBoneIK
   * Giải động học ngược chuỗi ba xương.
   */
  public solveThreeBoneIK(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['solveThreeBoneIK']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['solveThreeBoneIK']> {
    return this.skeletalKinematicsCharacter.solveThreeBoneIK(...args);
  }

  /**
   * [1005] solveFullBodyIK
   * Giải động học ngược toàn thân.
   */
  public solveFullBodyIK(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['solveFullBodyIK']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['solveFullBodyIK']> {
    return this.skeletalKinematicsCharacter.solveFullBodyIK(...args);
  }

  /**
   * [1006] calculateIKTargetError
   * Tính sai lệch mục tiêu IK.
   */
  public calculateIKTargetError(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateIKTargetError']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateIKTargetError']> {
    return this.skeletalKinematicsCharacter.calculateIKTargetError(...args);
  }

  /**
   * [1007] calculateIKJointWeights
   * Tính trọng số ảnh hưởng các khớp.
   */
  public calculateIKJointWeights(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateIKJointWeights']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateIKJointWeights']> {
    return this.skeletalKinematicsCharacter.calculateIKJointWeights(...args);
  }

  /**
   * [1008] calculateIKReachability
   * Kiểm tra mục tiêu có thể với tới.
   */
  public calculateIKReachability(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateIKReachability']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateIKReachability']> {
    return this.skeletalKinematicsCharacter.calculateIKReachability(...args);
  }

  /**
   * [1009] calculateIKPoleVector
   * Tính vector định hướng khuỷu hoặc gối.
   */
  public calculateIKPoleVector(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateIKPoleVector']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateIKPoleVector']> {
    return this.skeletalKinematicsCharacter.calculateIKPoleVector(...args);
  }

  /**
   * [1010] calculateIKChainStretch
   * Tính mức kéo giãn chuỗi IK.
   */
  public calculateIKChainStretch(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateIKChainStretch']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateIKChainStretch']> {
    return this.skeletalKinematicsCharacter.calculateIKChainStretch(...args);
  }

  /**
   * [1011] calculateSkeletonRootPosition
   * Tính vị trí gốc bộ xương.
   */
  public calculateSkeletonRootPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonRootPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonRootPosition']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonRootPosition(...args);
  }

  /**
   * [1012] calculateSkeletonOrientation
   * Tính hướng bộ xương.
   */
  public calculateSkeletonOrientation(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonOrientation']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonOrientation']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonOrientation(...args);
  }

  /**
   * [1013] calculateSkeletonBounds
   * Tính giới hạn bộ xương.
   */
  public calculateSkeletonBounds(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonBounds']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonBounds']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonBounds(...args);
  }

  /**
   * [1014] calculateSkeletonCenterOfMass
   * Tính tâm khối lượng bộ xương.
   */
  public calculateSkeletonCenterOfMass(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonCenterOfMass']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonCenterOfMass']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonCenterOfMass(...args);
  }

  /**
   * [1015] calculateSkeletonPose
   * Tính tư thế bộ xương.
   */
  public calculateSkeletonPose(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPose']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPose']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonPose(...args);
  }

  /**
   * [1016] calculateSkeletonPoseDifference
   * Tính chênh lệch tư thế bộ xương.
   */
  public calculateSkeletonPoseDifference(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPoseDifference']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPoseDifference']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonPoseDifference(...args);
  }

  /**
   * [1017] calculateSkeletonPoseSimilarity
   * Tính độ tương đồng tư thế bộ xương.
   */
  public calculateSkeletonPoseSimilarity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPoseSimilarity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonPoseSimilarity']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonPoseSimilarity(...args);
  }

  /**
   * [1018] calculateSkeletonRetargeting
   * Tính ánh xạ hoạt ảnh giữa các bộ xương.
   */
  public calculateSkeletonRetargeting(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateSkeletonRetargeting']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateSkeletonRetargeting']> {
    return this.skeletalKinematicsCharacter.calculateSkeletonRetargeting(...args);
  }

  /**
   * [1019] calculateBoneRetargeting
   * Tính ánh xạ hoạt ảnh giữa các xương.
   */
  public calculateBoneRetargeting(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateBoneRetargeting']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateBoneRetargeting']> {
    return this.skeletalKinematicsCharacter.calculateBoneRetargeting(...args);
  }

  /**
   * [1020] calculateAnimationBlendWeight
   * Tính trọng số pha trộn hoạt ảnh.
   */
  public calculateAnimationBlendWeight(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationBlendWeight']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationBlendWeight']> {
    return this.skeletalKinematicsCharacter.calculateAnimationBlendWeight(...args);
  }

  /**
   * [1021] calculateAnimationBlendFactor
   * Tính hệ số pha trộn hoạt ảnh.
   */
  public calculateAnimationBlendFactor(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationBlendFactor']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationBlendFactor']> {
    return this.skeletalKinematicsCharacter.calculateAnimationBlendFactor(...args);
  }

  /**
   * [1022] calculateAnimationTime
   * Tính thời gian hoạt ảnh.
   */
  public calculateAnimationTime(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationTime']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationTime']> {
    return this.skeletalKinematicsCharacter.calculateAnimationTime(...args);
  }

  /**
   * [1023] calculateAnimationPhase
   * Tính pha hoạt ảnh.
   */
  public calculateAnimationPhase(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationPhase']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationPhase']> {
    return this.skeletalKinematicsCharacter.calculateAnimationPhase(...args);
  }

  /**
   * [1024] calculateAnimationPlaybackSpeed
   * Tính tốc độ phát hoạt ảnh.
   */
  public calculateAnimationPlaybackSpeed(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationPlaybackSpeed']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationPlaybackSpeed']> {
    return this.skeletalKinematicsCharacter.calculateAnimationPlaybackSpeed(...args);
  }

  /**
   * [1025] calculateAnimationRootMotion
   * Tính chuyển động gốc hoạt ảnh.
   */
  public calculateAnimationRootMotion(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootMotion']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootMotion']> {
    return this.skeletalKinematicsCharacter.calculateAnimationRootMotion(...args);
  }

  /**
   * [1026] calculateAnimationRootVelocity
   * Tính vận tốc chuyển động gốc.
   */
  public calculateAnimationRootVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootVelocity']> {
    return this.skeletalKinematicsCharacter.calculateAnimationRootVelocity(...args);
  }

  /**
   * [1027] calculateAnimationRootAcceleration
   * Tính gia tốc chuyển động gốc.
   */
  public calculateAnimationRootAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationRootAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateAnimationRootAcceleration(...args);
  }

  /**
   * [1028] calculateAnimationPoseAtTime
   * Tính tư thế tại thời điểm xác định.
   */
  public calculateAnimationPoseAtTime(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationPoseAtTime']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationPoseAtTime']> {
    return this.skeletalKinematicsCharacter.calculateAnimationPoseAtTime(...args);
  }

  /**
   * [1029] calculateAnimationInterpolation
   * Tính nội suy hoạt ảnh.
   */
  public calculateAnimationInterpolation(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationInterpolation']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationInterpolation']> {
    return this.skeletalKinematicsCharacter.calculateAnimationInterpolation(...args);
  }

  /**
   * [1030] calculateAnimationCurveValue
   * Tính giá trị đường cong hoạt ảnh.
   */
  public calculateAnimationCurveValue(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveValue']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveValue']> {
    return this.skeletalKinematicsCharacter.calculateAnimationCurveValue(...args);
  }

  /**
   * [1031] calculateAnimationCurveDerivative
   * Tính đạo hàm đường cong hoạt ảnh.
   */
  public calculateAnimationCurveDerivative(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveDerivative']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveDerivative']> {
    return this.skeletalKinematicsCharacter.calculateAnimationCurveDerivative(...args);
  }

  /**
   * [1032] calculateAnimationCurveIntegral
   * Tính tích phân đường cong hoạt ảnh.
   */
  public calculateAnimationCurveIntegral(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveIntegral']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationCurveIntegral']> {
    return this.skeletalKinematicsCharacter.calculateAnimationCurveIntegral(...args);
  }

  /**
   * [1033] calculateAnimationVelocity
   * Tính vận tốc hoạt ảnh.
   */
  public calculateAnimationVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationVelocity']> {
    return this.skeletalKinematicsCharacter.calculateAnimationVelocity(...args);
  }

  /**
   * [1034] calculateAnimationAcceleration
   * Tính gia tốc hoạt ảnh.
   */
  public calculateAnimationAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAnimationAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAnimationAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateAnimationAcceleration(...args);
  }

  /**
   * [1035] calculatePoseTransition
   * Tính chuyển tiếp giữa các tư thế.
   */
  public calculatePoseTransition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseTransition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseTransition']> {
    return this.skeletalKinematicsCharacter.calculatePoseTransition(...args);
  }

  /**
   * [1036] calculatePoseTransitionDuration
   * Tính thời lượng chuyển tư thế.
   */
  public calculatePoseTransitionDuration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseTransitionDuration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseTransitionDuration']> {
    return this.skeletalKinematicsCharacter.calculatePoseTransitionDuration(...args);
  }

  /**
   * [1037] calculatePoseBlend
   * Tính pha trộn tư thế.
   */
  public calculatePoseBlend(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseBlend']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseBlend']> {
    return this.skeletalKinematicsCharacter.calculatePoseBlend(...args);
  }

  /**
   * [1038] calculatePoseStability
   * Tính độ ổn định tư thế.
   */
  public calculatePoseStability(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseStability']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseStability']> {
    return this.skeletalKinematicsCharacter.calculatePoseStability(...args);
  }

  /**
   * [1039] calculatePoseReachability
   * Tính khả năng đạt tư thế.
   */
  public calculatePoseReachability(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseReachability']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseReachability']> {
    return this.skeletalKinematicsCharacter.calculatePoseReachability(...args);
  }

  /**
   * [1040] calculatePoseConstraintError
   * Tính sai lệch ràng buộc tư thế.
   */
  public calculatePoseConstraintError(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculatePoseConstraintError']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculatePoseConstraintError']> {
    return this.skeletalKinematicsCharacter.calculatePoseConstraintError(...args);
  }

  /**
   * [1041] calculateFootLockPosition
   * Tính vị trí khóa chân.
   */
  public calculateFootLockPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateFootLockPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateFootLockPosition']> {
    return this.skeletalKinematicsCharacter.calculateFootLockPosition(...args);
  }

  /**
   * [1042] calculateFootLockWeight
   * Tính trọng số khóa chân.
   */
  public calculateFootLockWeight(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateFootLockWeight']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateFootLockWeight']> {
    return this.skeletalKinematicsCharacter.calculateFootLockWeight(...args);
  }

  /**
   * [1043] calculateHandIKTarget
   * Tính mục tiêu IK bàn tay.
   */
  public calculateHandIKTarget(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateHandIKTarget']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateHandIKTarget']> {
    return this.skeletalKinematicsCharacter.calculateHandIKTarget(...args);
  }

  /**
   * [1044] calculateLookAtTarget
   * Tính mục tiêu nhìn.
   */
  public calculateLookAtTarget(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateLookAtTarget']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateLookAtTarget']> {
    return this.skeletalKinematicsCharacter.calculateLookAtTarget(...args);
  }

  /**
   * [1045] calculateHeadLookAt
   * Tính hướng đầu nhìn mục tiêu.
   */
  public calculateHeadLookAt(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateHeadLookAt']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateHeadLookAt']> {
    return this.skeletalKinematicsCharacter.calculateHeadLookAt(...args);
  }

  /**
   * [1046] calculateEyeLookAt
   * Tính hướng mắt nhìn mục tiêu.
   */
  public calculateEyeLookAt(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateEyeLookAt']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateEyeLookAt']> {
    return this.skeletalKinematicsCharacter.calculateEyeLookAt(...args);
  }

  /**
   * [1047] calculateAimOffset
   * Tính độ lệch hướng ngắm.
   */
  public calculateAimOffset(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAimOffset']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAimOffset']> {
    return this.skeletalKinematicsCharacter.calculateAimOffset(...args);
  }

  /**
   * [1048] calculateAimPose
   * Tính tư thế ngắm.
   */
  public calculateAimPose(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateAimPose']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateAimPose']> {
    return this.skeletalKinematicsCharacter.calculateAimPose(...args);
  }

  /**
   * [1049] calculateReachPose
   * Tính tư thế với tới.
   */
  public calculateReachPose(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateReachPose']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateReachPose']> {
    return this.skeletalKinematicsCharacter.calculateReachPose(...args);
  }

  /**
   * [1050] calculateCharacterPoseError
   * Tính sai lệch tư thế nhân vật.
   */
  public calculateCharacterPoseError(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPoseError']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPoseError']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPoseError(...args);
  }

  /**
   * [1051] getCharacterPosition
   * Lấy tọa độ nhân vật.
   */
  public getCharacterPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterPosition']> {
    return this.skeletalKinematicsCharacter.getCharacterPosition(...args);
  }

  /**
   * [1052] getCharacterRotation
   * Lấy góc quay nhân vật.
   */
  public getCharacterRotation(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterRotation']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterRotation']> {
    return this.skeletalKinematicsCharacter.getCharacterRotation(...args);
  }

  /**
   * [1053] getCharacterScale
   * Lấy tỷ lệ kích thước nhân vật.
   */
  public getCharacterScale(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterScale']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterScale']> {
    return this.skeletalKinematicsCharacter.getCharacterScale(...args);
  }

  /**
   * [1054] getCharacterVelocity
   * Lấy vận tốc nhân vật.
   */
  public getCharacterVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterVelocity']> {
    return this.skeletalKinematicsCharacter.getCharacterVelocity(...args);
  }

  /**
   * [1055] getCharacterAcceleration
   * Lấy gia tốc nhân vật.
   */
  public getCharacterAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterAcceleration']> {
    return this.skeletalKinematicsCharacter.getCharacterAcceleration(...args);
  }

  /**
   * [1056] getCharacterForwardVector
   * Lấy hướng phía trước nhân vật.
   */
  public getCharacterForwardVector(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterForwardVector']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterForwardVector']> {
    return this.skeletalKinematicsCharacter.getCharacterForwardVector(...args);
  }

  /**
   * [1057] getCharacterRightVector
   * Lấy hướng bên phải nhân vật.
   */
  public getCharacterRightVector(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterRightVector']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterRightVector']> {
    return this.skeletalKinematicsCharacter.getCharacterRightVector(...args);
  }

  /**
   * [1058] getCharacterUpVector
   * Lấy hướng phía trên nhân vật.
   */
  public getCharacterUpVector(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['getCharacterUpVector']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['getCharacterUpVector']> {
    return this.skeletalKinematicsCharacter.getCharacterUpVector(...args);
  }

  /**
   * [1059] calculateCharacterHeight
   * Tính chiều cao nhân vật.
   */
  public calculateCharacterHeight(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterHeight']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterHeight']> {
    return this.skeletalKinematicsCharacter.calculateCharacterHeight(...args);
  }

  /**
   * [1060] calculateCharacterWidth
   * Tính chiều rộng nhân vật.
   */
  public calculateCharacterWidth(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterWidth']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterWidth']> {
    return this.skeletalKinematicsCharacter.calculateCharacterWidth(...args);
  }

  /**
   * [1061] calculateCharacterDepth
   * Tính chiều sâu nhân vật.
   */
  public calculateCharacterDepth(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterDepth']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterDepth']> {
    return this.skeletalKinematicsCharacter.calculateCharacterDepth(...args);
  }

  /**
   * [1062] calculateCharacterRadius
   * Tính bán kính đại diện nhân vật.
   */
  public calculateCharacterRadius(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterRadius']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterRadius']> {
    return this.skeletalKinematicsCharacter.calculateCharacterRadius(...args);
  }

  /**
   * [1063] calculateCharacterBounds
   * Tính giới hạn không gian nhân vật.
   */
  public calculateCharacterBounds(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterBounds']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterBounds']> {
    return this.skeletalKinematicsCharacter.calculateCharacterBounds(...args);
  }

  /**
   * [1064] calculateCharacterBoundingBox
   * Tính hộp bao nhân vật.
   */
  public calculateCharacterBoundingBox(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingBox']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingBox']> {
    return this.skeletalKinematicsCharacter.calculateCharacterBoundingBox(...args);
  }

  /**
   * [1065] calculateCharacterBoundingSphere
   * Tính hình cầu bao nhân vật.
   */
  public calculateCharacterBoundingSphere(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingSphere']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingSphere']> {
    return this.skeletalKinematicsCharacter.calculateCharacterBoundingSphere(...args);
  }

  /**
   * [1066] calculateCharacterBoundingCapsule
   * Tính capsule bao nhân vật.
   */
  public calculateCharacterBoundingCapsule(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingCapsule']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterBoundingCapsule']> {
    return this.skeletalKinematicsCharacter.calculateCharacterBoundingCapsule(...args);
  }

  /**
   * [1067] calculateCharacterCenterOfMass
   * Tính tâm khối lượng nhân vật.
   */
  public calculateCharacterCenterOfMass(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterCenterOfMass']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterCenterOfMass']> {
    return this.skeletalKinematicsCharacter.calculateCharacterCenterOfMass(...args);
  }

  /**
   * [1068] calculateCharacterGroundDistance
   * Tính khoảng cách nhân vật đến mặt đất.
   */
  public calculateCharacterGroundDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterGroundDistance(...args);
  }

  /**
   * [1069] calculateCharacterGroundContact
   * Kiểm tra nhân vật chạm mặt đất.
   */
  public calculateCharacterGroundContact(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundContact']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundContact']> {
    return this.skeletalKinematicsCharacter.calculateCharacterGroundContact(...args);
  }

  /**
   * [1070] calculateCharacterGroundNormal
   * Tính pháp tuyến mặt đất tại nhân vật.
   */
  public calculateCharacterGroundNormal(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundNormal']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterGroundNormal']> {
    return this.skeletalKinematicsCharacter.calculateCharacterGroundNormal(...args);
  }

  /**
   * [1071] calculateCharacterSlopeAngle
   * Tính góc dốc dưới nhân vật.
   */
  public calculateCharacterSlopeAngle(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterSlopeAngle']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterSlopeAngle']> {
    return this.skeletalKinematicsCharacter.calculateCharacterSlopeAngle(...args);
  }

  /**
   * [1072] calculateCharacterMovementDirection
   * Tính hướng di chuyển nhân vật.
   */
  public calculateCharacterMovementDirection(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementDirection']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementDirection']> {
    return this.skeletalKinematicsCharacter.calculateCharacterMovementDirection(...args);
  }

  /**
   * [1073] calculateCharacterMovementSpeed
   * Tính tốc độ di chuyển nhân vật.
   */
  public calculateCharacterMovementSpeed(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementSpeed']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementSpeed']> {
    return this.skeletalKinematicsCharacter.calculateCharacterMovementSpeed(...args);
  }

  /**
   * [1074] calculateCharacterMovementDistance
   * Tính quãng đường di chuyển nhân vật.
   */
  public calculateCharacterMovementDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterMovementDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterMovementDistance(...args);
  }

  /**
   * [1075] calculateCharacterTurningRate
   * Tính tốc độ đổi hướng nhân vật.
   */
  public calculateCharacterTurningRate(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterTurningRate']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterTurningRate']> {
    return this.skeletalKinematicsCharacter.calculateCharacterTurningRate(...args);
  }

  /**
   * [1076] calculateCharacterTurningAngle
   * Tính góc đổi hướng nhân vật.
   */
  public calculateCharacterTurningAngle(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterTurningAngle']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterTurningAngle']> {
    return this.skeletalKinematicsCharacter.calculateCharacterTurningAngle(...args);
  }

  /**
   * [1077] calculateCharacterStoppingDistance
   * Tính quãng đường dừng nhân vật.
   */
  public calculateCharacterStoppingDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterStoppingDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterStoppingDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterStoppingDistance(...args);
  }

  /**
   * [1078] calculateCharacterBrakingAcceleration
   * Tính gia tốc hãm nhân vật.
   */
  public calculateCharacterBrakingAcceleration(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterBrakingAcceleration']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterBrakingAcceleration']> {
    return this.skeletalKinematicsCharacter.calculateCharacterBrakingAcceleration(...args);
  }

  /**
   * [1079] calculateCharacterJumpVelocity
   * Tính vận tốc nhảy nhân vật.
   */
  public calculateCharacterJumpVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterJumpVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterJumpVelocity']> {
    return this.skeletalKinematicsCharacter.calculateCharacterJumpVelocity(...args);
  }

  /**
   * [1080] calculateCharacterJumpHeight
   * Tính độ cao nhảy nhân vật.
   */
  public calculateCharacterJumpHeight(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterJumpHeight']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterJumpHeight']> {
    return this.skeletalKinematicsCharacter.calculateCharacterJumpHeight(...args);
  }

  /**
   * [1081] calculateCharacterFallVelocity
   * Tính vận tốc rơi nhân vật.
   */
  public calculateCharacterFallVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterFallVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterFallVelocity']> {
    return this.skeletalKinematicsCharacter.calculateCharacterFallVelocity(...args);
  }

  /**
   * [1082] calculateCharacterFallDistance
   * Tính quãng đường rơi nhân vật.
   */
  public calculateCharacterFallDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterFallDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterFallDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterFallDistance(...args);
  }

  /**
   * [1083] calculateCharacterLandingPosition
   * Tính vị trí tiếp đất nhân vật.
   */
  public calculateCharacterLandingPosition(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterLandingPosition']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterLandingPosition']> {
    return this.skeletalKinematicsCharacter.calculateCharacterLandingPosition(...args);
  }

  /**
   * [1084] calculateCharacterLandingVelocity
   * Tính vận tốc khi tiếp đất.
   */
  public calculateCharacterLandingVelocity(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterLandingVelocity']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterLandingVelocity']> {
    return this.skeletalKinematicsCharacter.calculateCharacterLandingVelocity(...args);
  }

  /**
   * [1085] calculateCharacterCollision
   * Kiểm tra va chạm nhân vật.
   */
  public calculateCharacterCollision(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterCollision']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterCollision']> {
    return this.skeletalKinematicsCharacter.calculateCharacterCollision(...args);
  }

  /**
   * [1086] calculateCharacterCollisionResponse
   * Tính phản ứng khi va chạm.
   */
  public calculateCharacterCollisionResponse(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterCollisionResponse']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterCollisionResponse']> {
    return this.skeletalKinematicsCharacter.calculateCharacterCollisionResponse(...args);
  }

  /**
   * [1087] calculateCharacterPenetrationDepth
   * Tính độ xuyên lấn nhân vật.
   */
  public calculateCharacterPenetrationDepth(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPenetrationDepth']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPenetrationDepth']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPenetrationDepth(...args);
  }

  /**
   * [1088] calculateCharacterSeparationVector
   * Tính vector tách hai nhân vật.
   */
  public calculateCharacterSeparationVector(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterSeparationVector']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterSeparationVector']> {
    return this.skeletalKinematicsCharacter.calculateCharacterSeparationVector(...args);
  }

  /**
   * [1089] calculateCharacterAvoidanceDirection
   * Tính hướng tránh chướng ngại.
   */
  public calculateCharacterAvoidanceDirection(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterAvoidanceDirection']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterAvoidanceDirection']> {
    return this.skeletalKinematicsCharacter.calculateCharacterAvoidanceDirection(...args);
  }

  /**
   * [1090] calculateCharacterPathDistance
   * Tính độ dài đường đi nhân vật.
   */
  public calculateCharacterPathDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPathDistance(...args);
  }

  /**
   * [1091] calculateCharacterPathDeviation
   * Tính sai lệch khỏi đường đi.
   */
  public calculateCharacterPathDeviation(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathDeviation']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathDeviation']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPathDeviation(...args);
  }

  /**
   * [1092] calculateCharacterPathCurvature
   * Tính độ cong đường đi.
   */
  public calculateCharacterPathCurvature(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathCurvature']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathCurvature']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPathCurvature(...args);
  }

  /**
   * [1093] calculateCharacterPathTangent
   * Tính tiếp tuyến đường đi.
   */
  public calculateCharacterPathTangent(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathTangent']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathTangent']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPathTangent(...args);
  }

  /**
   * [1094] calculateCharacterPathNormal
   * Tính pháp tuyến đường đi.
   */
  public calculateCharacterPathNormal(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathNormal']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterPathNormal']> {
    return this.skeletalKinematicsCharacter.calculateCharacterPathNormal(...args);
  }

  /**
   * [1095] calculateCharacterNavigationCost
   * Tính chi phí điều hướng.
   */
  public calculateCharacterNavigationCost(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterNavigationCost']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterNavigationCost']> {
    return this.skeletalKinematicsCharacter.calculateCharacterNavigationCost(...args);
  }

  /**
   * [1096] calculateCharacterReachDistance
   * Tính khoảng với tới của nhân vật.
   */
  public calculateCharacterReachDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterReachDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterReachDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterReachDistance(...args);
  }

  /**
   * [1097] calculateCharacterInteractionRange
   * Tính phạm vi tương tác nhân vật.
   */
  public calculateCharacterInteractionRange(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterInteractionRange']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterInteractionRange']> {
    return this.skeletalKinematicsCharacter.calculateCharacterInteractionRange(...args);
  }

  /**
   * [1098] calculateCharacterVisibilityRange
   * Tính phạm vi nhìn thấy nhân vật.
   */
  public calculateCharacterVisibilityRange(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterVisibilityRange']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterVisibilityRange']> {
    return this.skeletalKinematicsCharacter.calculateCharacterVisibilityRange(...args);
  }

  /**
   * [1099] calculateCharacterTargetDistance
   * Tính khoảng cách nhân vật đến mục tiêu.
   */
  public calculateCharacterTargetDistance(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterTargetDistance']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterTargetDistance']> {
    return this.skeletalKinematicsCharacter.calculateCharacterTargetDistance(...args);
  }

  /**
   * [1100] calculateCharacterTargetAngle
   * Tính góc hướng nhân vật đến mục tiêu.
   */
  public calculateCharacterTargetAngle(
    ...args: Parameters<SkeletalKinematicsCharacterSubsystem['calculateCharacterTargetAngle']>
  ): ReturnType<SkeletalKinematicsCharacterSubsystem['calculateCharacterTargetAngle']> {
    return this.skeletalKinematicsCharacter.calculateCharacterTargetAngle(...args);
  }

  /**
   * [1101] calculateNPCPosition
   * Tính vị trí NPC.
   */
  public calculateNPCPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPosition']> {
    return this.entitiesFaunaFlora.calculateNPCPosition(...args);
  }

  /**
   * [1102] calculateNPCVelocity
   * Tính vận tốc NPC.
   */
  public calculateNPCVelocity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCVelocity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCVelocity']> {
    return this.entitiesFaunaFlora.calculateNPCVelocity(...args);
  }

  /**
   * [1103] calculateNPCAcceleration
   * Tính gia tốc NPC.
   */
  public calculateNPCAcceleration(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCAcceleration']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCAcceleration']> {
    return this.entitiesFaunaFlora.calculateNPCAcceleration(...args);
  }

  /**
   * [1104] calculateNPCFacingDirection
   * Tính hướng mặt NPC.
   */
  public calculateNPCFacingDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFacingDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFacingDirection']> {
    return this.entitiesFaunaFlora.calculateNPCFacingDirection(...args);
  }

  /**
   * [1105] calculateNPCOrientation
   * Tính hướng quay NPC.
   */
  public calculateNPCOrientation(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCOrientation']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCOrientation']> {
    return this.entitiesFaunaFlora.calculateNPCOrientation(...args);
  }

  /**
   * [1106] calculateNPCDistanceToPlayer
   * Tính khoảng cách NPC đến người chơi.
   */
  public calculateNPCDistanceToPlayer(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToPlayer']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToPlayer']> {
    return this.entitiesFaunaFlora.calculateNPCDistanceToPlayer(...args);
  }

  /**
   * [1107] calculateNPCDistanceToTarget
   * Tính khoảng cách NPC đến mục tiêu.
   */
  public calculateNPCDistanceToTarget(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToTarget']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToTarget']> {
    return this.entitiesFaunaFlora.calculateNPCDistanceToTarget(...args);
  }

  /**
   * [1108] calculateNPCDistanceToWaypoint
   * Tính khoảng cách NPC đến điểm đường đi.
   */
  public calculateNPCDistanceToWaypoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToWaypoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCDistanceToWaypoint']> {
    return this.entitiesFaunaFlora.calculateNPCDistanceToWaypoint(...args);
  }

  /**
   * [1109] calculateNPCNearestNeighbor
   * Tìm NPC gần nhất.
   */
  public calculateNPCNearestNeighbor(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCNearestNeighbor']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCNearestNeighbor']> {
    return this.entitiesFaunaFlora.calculateNPCNearestNeighbor(...args);
  }

  /**
   * [1110] calculateNPCGroupCenter
   * Tính tâm nhóm NPC.
   */
  public calculateNPCGroupCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCGroupCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCGroupCenter']> {
    return this.entitiesFaunaFlora.calculateNPCGroupCenter(...args);
  }

  /**
   * [1111] calculateNPCGroupRadius
   * Tính bán kính nhóm NPC.
   */
  public calculateNPCGroupRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCGroupRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCGroupRadius']> {
    return this.entitiesFaunaFlora.calculateNPCGroupRadius(...args);
  }

  /**
   * [1112] calculateNPCFormationOffset
   * Tính độ lệch đội hình NPC.
   */
  public calculateNPCFormationOffset(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFormationOffset']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFormationOffset']> {
    return this.entitiesFaunaFlora.calculateNPCFormationOffset(...args);
  }

  /**
   * [1113] calculateNPCFormationPosition
   * Tính vị trí đội hình NPC.
   */
  public calculateNPCFormationPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFormationPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFormationPosition']> {
    return this.entitiesFaunaFlora.calculateNPCFormationPosition(...args);
  }

  /**
   * [1114] calculateNPCFormationDirection
   * Tính hướng đội hình NPC.
   */
  public calculateNPCFormationDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFormationDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFormationDirection']> {
    return this.entitiesFaunaFlora.calculateNPCFormationDirection(...args);
  }

  /**
   * [1115] calculateNPCFormationSpacing
   * Tính khoảng cách giữa NPC trong đội hình.
   */
  public calculateNPCFormationSpacing(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFormationSpacing']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFormationSpacing']> {
    return this.entitiesFaunaFlora.calculateNPCFormationSpacing(...args);
  }

  /**
   * [1116] calculateNPCSeparationForce
   * Tính lực tách NPC.
   */
  public calculateNPCSeparationForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCSeparationForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCSeparationForce']> {
    return this.entitiesFaunaFlora.calculateNPCSeparationForce(...args);
  }

  /**
   * [1117] calculateNPCAlignmentForce
   * Tính lực căn chỉnh hướng NPC.
   */
  public calculateNPCAlignmentForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCAlignmentForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCAlignmentForce']> {
    return this.entitiesFaunaFlora.calculateNPCAlignmentForce(...args);
  }

  /**
   * [1118] calculateNPCCohesionForce
   * Tính lực tập hợp NPC.
   */
  public calculateNPCCohesionForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCCohesionForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCCohesionForce']> {
    return this.entitiesFaunaFlora.calculateNPCCohesionForce(...args);
  }

  /**
   * [1119] calculateNPCSteeringForce
   * Tính lực điều hướng NPC.
   */
  public calculateNPCSteeringForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCSteeringForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCSteeringForce']> {
    return this.entitiesFaunaFlora.calculateNPCSteeringForce(...args);
  }

  /**
   * [1120] calculateNPCAvoidanceForce
   * Tính lực tránh vật cản NPC.
   */
  public calculateNPCAvoidanceForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCAvoidanceForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCAvoidanceForce']> {
    return this.entitiesFaunaFlora.calculateNPCAvoidanceForce(...args);
  }

  /**
   * [1121] calculateNPCObstacleDistance
   * Tính khoảng cách NPC đến chướng ngại.
   */
  public calculateNPCObstacleDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCObstacleDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCObstacleDistance']> {
    return this.entitiesFaunaFlora.calculateNPCObstacleDistance(...args);
  }

  /**
   * [1122] calculateNPCObstacleNormal
   * Tính pháp tuyến chướng ngại đối với NPC.
   */
  public calculateNPCObstacleNormal(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCObstacleNormal']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCObstacleNormal']> {
    return this.entitiesFaunaFlora.calculateNPCObstacleNormal(...args);
  }

  /**
   * [1123] calculateNPCPathfindingCost
   * Tính chi phí tìm đường NPC.
   */
  public calculateNPCPathfindingCost(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPathfindingCost']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPathfindingCost']> {
    return this.entitiesFaunaFlora.calculateNPCPathfindingCost(...args);
  }

  /**
   * [1124] calculateNPCPathLength
   * Tính độ dài đường đi NPC.
   */
  public calculateNPCPathLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPathLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPathLength']> {
    return this.entitiesFaunaFlora.calculateNPCPathLength(...args);
  }

  /**
   * [1125] calculateNPCPathSmoothing
   * Tính đường đi mượt cho NPC.
   */
  public calculateNPCPathSmoothing(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPathSmoothing']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPathSmoothing']> {
    return this.entitiesFaunaFlora.calculateNPCPathSmoothing(...args);
  }

  /**
   * [1126] calculateNPCWaypointIndex
   * Xác định điểm đường đi hiện tại của NPC.
   */
  public calculateNPCWaypointIndex(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCWaypointIndex']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCWaypointIndex']> {
    return this.entitiesFaunaFlora.calculateNPCWaypointIndex(...args);
  }

  /**
   * [1127] calculateNPCWaypointDistance
   * Tính khoảng cách đến waypoint.
   */
  public calculateNPCWaypointDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCWaypointDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCWaypointDistance']> {
    return this.entitiesFaunaFlora.calculateNPCWaypointDistance(...args);
  }

  /**
   * [1128] calculateNPCWaypointArrival
   * Xác định NPC đã đến waypoint.
   */
  public calculateNPCWaypointArrival(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCWaypointArrival']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCWaypointArrival']> {
    return this.entitiesFaunaFlora.calculateNPCWaypointArrival(...args);
  }

  /**
   * [1129] calculateNPCPatrolRadius
   * Tính bán kính tuần tra NPC.
   */
  public calculateNPCPatrolRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPatrolRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPatrolRadius']> {
    return this.entitiesFaunaFlora.calculateNPCPatrolRadius(...args);
  }

  /**
   * [1130] calculateNPCPatrolPosition
   * Tính vị trí tuần tra NPC.
   */
  public calculateNPCPatrolPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPatrolPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPatrolPosition']> {
    return this.entitiesFaunaFlora.calculateNPCPatrolPosition(...args);
  }

  /**
   * [1131] calculateNPCDetectionRange
   * Tính phạm vi phát hiện NPC.
   */
  public calculateNPCDetectionRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCDetectionRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCDetectionRange']> {
    return this.entitiesFaunaFlora.calculateNPCDetectionRange(...args);
  }

  /**
   * [1132] calculateNPCFieldOfView
   * Tính góc nhìn NPC.
   */
  public calculateNPCFieldOfView(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFieldOfView']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFieldOfView']> {
    return this.entitiesFaunaFlora.calculateNPCFieldOfView(...args);
  }

  /**
   * [1133] calculateNPCLineOfSight
   * Kiểm tra đường nhìn NPC.
   */
  public calculateNPCLineOfSight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCLineOfSight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCLineOfSight']> {
    return this.entitiesFaunaFlora.calculateNPCLineOfSight(...args);
  }

  /**
   * [1134] calculateNPCVisibilityScore
   * Tính điểm khả năng nhìn thấy mục tiêu.
   */
  public calculateNPCVisibilityScore(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCVisibilityScore']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCVisibilityScore']> {
    return this.entitiesFaunaFlora.calculateNPCVisibilityScore(...args);
  }

  /**
   * [1135] calculateNPCThreatScore
   * Tính điểm đe dọa của NPC.
   */
  public calculateNPCThreatScore(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCThreatScore']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCThreatScore']> {
    return this.entitiesFaunaFlora.calculateNPCThreatScore(...args);
  }

  /**
   * [1136] calculateNPCInterestScore
   * Tính điểm quan tâm NPC.
   */
  public calculateNPCInterestScore(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCInterestScore']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCInterestScore']> {
    return this.entitiesFaunaFlora.calculateNPCInterestScore(...args);
  }

  /**
   * [1137] calculateNPCTargetPriority
   * Tính mức ưu tiên mục tiêu NPC.
   */
  public calculateNPCTargetPriority(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCTargetPriority']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCTargetPriority']> {
    return this.entitiesFaunaFlora.calculateNPCTargetPriority(...args);
  }

  /**
   * [1138] calculateNPCAttackRange
   * Tính tầm đánh NPC.
   */
  public calculateNPCAttackRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCAttackRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCAttackRange']> {
    return this.entitiesFaunaFlora.calculateNPCAttackRange(...args);
  }

  /**
   * [1139] calculateNPCInteractionDistance
   * Tính khoảng cách tương tác NPC.
   */
  public calculateNPCInteractionDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCInteractionDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCInteractionDistance']> {
    return this.entitiesFaunaFlora.calculateNPCInteractionDistance(...args);
  }

  /**
   * [1140] calculateNPCInteractionAngle
   * Tính góc tương tác NPC.
   */
  public calculateNPCInteractionAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCInteractionAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCInteractionAngle']> {
    return this.entitiesFaunaFlora.calculateNPCInteractionAngle(...args);
  }

  /**
   * [1141] calculateNPCApproachPosition
   * Tính vị trí NPC tiếp cận mục tiêu.
   */
  public calculateNPCApproachPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCApproachPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCApproachPosition']> {
    return this.entitiesFaunaFlora.calculateNPCApproachPosition(...args);
  }

  /**
   * [1142] calculateNPCFleeDirection
   * Tính hướng chạy trốn NPC.
   */
  public calculateNPCFleeDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCFleeDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCFleeDirection']> {
    return this.entitiesFaunaFlora.calculateNPCFleeDirection(...args);
  }

  /**
   * [1143] calculateNPCChaseDirection
   * Tính hướng đuổi bắt NPC.
   */
  public calculateNPCChaseDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCChaseDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCChaseDirection']> {
    return this.entitiesFaunaFlora.calculateNPCChaseDirection(...args);
  }

  /**
   * [1144] calculateNPCInterceptPoint
   * Tính điểm chặn mục tiêu của NPC.
   */
  public calculateNPCInterceptPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCInterceptPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCInterceptPoint']> {
    return this.entitiesFaunaFlora.calculateNPCInterceptPoint(...args);
  }

  /**
   * [1145] calculateNPCPredictionPosition
   * Dự đoán vị trí NPC.
   */
  public calculateNPCPredictionPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCPredictionPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCPredictionPosition']> {
    return this.entitiesFaunaFlora.calculateNPCPredictionPosition(...args);
  }

  /**
   * [1146] calculateNPCTargetPrediction
   * Dự đoán vị trí mục tiêu của NPC.
   */
  public calculateNPCTargetPrediction(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCTargetPrediction']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCTargetPrediction']> {
    return this.entitiesFaunaFlora.calculateNPCTargetPrediction(...args);
  }

  /**
   * [1147] calculateNPCDecisionScore
   * Tính điểm quyết định hành động NPC.
   */
  public calculateNPCDecisionScore(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCDecisionScore']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCDecisionScore']> {
    return this.entitiesFaunaFlora.calculateNPCDecisionScore(...args);
  }

  /**
   * [1148] calculateNPCStateTransition
   * Tính điều kiện chuyển trạng thái NPC.
   */
  public calculateNPCStateTransition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCStateTransition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCStateTransition']> {
    return this.entitiesFaunaFlora.calculateNPCStateTransition(...args);
  }

  /**
   * [1149] calculateNPCAnimationBlend
   * Tính pha trộn hoạt ảnh NPC.
   */
  public calculateNPCAnimationBlend(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCAnimationBlend']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCAnimationBlend']> {
    return this.entitiesFaunaFlora.calculateNPCAnimationBlend(...args);
  }

  /**
   * [1150] calculateNPCNavigationError
   * Tính sai lệch điều hướng NPC.
   */
  public calculateNPCNavigationError(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateNPCNavigationError']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateNPCNavigationError']> {
    return this.entitiesFaunaFlora.calculateNPCNavigationError(...args);
  }

  /**
   * [1151] getBossPosition
   * Lấy tọa độ boss.
   */
  public getBossPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossPosition']> {
    return this.entitiesFaunaFlora.getBossPosition(...args);
  }

  /**
   * [1152] getBossCenter
   * Lấy tâm boss.
   */
  public getBossCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossCenter']> {
    return this.entitiesFaunaFlora.getBossCenter(...args);
  }

  /**
   * [1153] getBossHeadPosition
   * Lấy tọa độ đầu boss.
   */
  public getBossHeadPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossHeadPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossHeadPosition']> {
    return this.entitiesFaunaFlora.getBossHeadPosition(...args);
  }

  /**
   * [1154] getBossChestPosition
   * Lấy tọa độ ngực boss.
   */
  public getBossChestPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossChestPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossChestPosition']> {
    return this.entitiesFaunaFlora.getBossChestPosition(...args);
  }

  /**
   * [1155] getBossCorePosition
   * Lấy tọa độ lõi boss.
   */
  public getBossCorePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossCorePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossCorePosition']> {
    return this.entitiesFaunaFlora.getBossCorePosition(...args);
  }

  /**
   * [1156] getBossWeakPointPosition
   * Lấy tọa độ điểm yếu boss.
   */
  public getBossWeakPointPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossWeakPointPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossWeakPointPosition']> {
    return this.entitiesFaunaFlora.getBossWeakPointPosition(...args);
  }

  /**
   * [1157] getBossHitboxCenter
   * Lấy tâm vùng trúng đòn boss.
   */
  public getBossHitboxCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossHitboxCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossHitboxCenter']> {
    return this.entitiesFaunaFlora.getBossHitboxCenter(...args);
  }

  /**
   * [1158] getBossAttackOrigin
   * Lấy điểm xuất phát đòn đánh boss.
   */
  public getBossAttackOrigin(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossAttackOrigin']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossAttackOrigin']> {
    return this.entitiesFaunaFlora.getBossAttackOrigin(...args);
  }

  /**
   * [1159] getBossTargetPosition
   * Lấy tọa độ mục tiêu boss.
   */
  public getBossTargetPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBossTargetPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBossTargetPosition']> {
    return this.entitiesFaunaFlora.getBossTargetPosition(...args);
  }

  /**
   * [1160] calculateBossHeight
   * Tính chiều cao boss.
   */
  public calculateBossHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossHeight']> {
    return this.entitiesFaunaFlora.calculateBossHeight(...args);
  }

  /**
   * [1161] calculateBossWidth
   * Tính chiều rộng boss.
   */
  public calculateBossWidth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossWidth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossWidth']> {
    return this.entitiesFaunaFlora.calculateBossWidth(...args);
  }

  /**
   * [1162] calculateBossDepth
   * Tính chiều sâu boss.
   */
  public calculateBossDepth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossDepth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossDepth']> {
    return this.entitiesFaunaFlora.calculateBossDepth(...args);
  }

  /**
   * [1163] calculateBossBounds
   * Tính giới hạn không gian boss.
   */
  public calculateBossBounds(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossBounds']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossBounds']> {
    return this.entitiesFaunaFlora.calculateBossBounds(...args);
  }

  /**
   * [1164] calculateBossBoundingBox
   * Tính hộp bao boss.
   */
  public calculateBossBoundingBox(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossBoundingBox']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossBoundingBox']> {
    return this.entitiesFaunaFlora.calculateBossBoundingBox(...args);
  }

  /**
   * [1165] calculateBossBoundingSphere
   * Tính hình cầu bao boss.
   */
  public calculateBossBoundingSphere(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossBoundingSphere']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossBoundingSphere']> {
    return this.entitiesFaunaFlora.calculateBossBoundingSphere(...args);
  }

  /**
   * [1166] calculateBossBoundingCapsule
   * Tính capsule bao boss.
   */
  public calculateBossBoundingCapsule(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossBoundingCapsule']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossBoundingCapsule']> {
    return this.entitiesFaunaFlora.calculateBossBoundingCapsule(...args);
  }

  /**
   * [1167] calculateBossCenterOfMass
   * Tính tâm khối lượng boss.
   */
  public calculateBossCenterOfMass(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossCenterOfMass']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossCenterOfMass']> {
    return this.entitiesFaunaFlora.calculateBossCenterOfMass(...args);
  }

  /**
   * [1168] calculateBossDistanceToPlayer
   * Tính khoảng cách boss đến người chơi.
   */
  public calculateBossDistanceToPlayer(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossDistanceToPlayer']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossDistanceToPlayer']> {
    return this.entitiesFaunaFlora.calculateBossDistanceToPlayer(...args);
  }

  /**
   * [1169] calculateBossDistanceToWeakPoint
   * Tính khoảng cách đến điểm yếu boss.
   */
  public calculateBossDistanceToWeakPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossDistanceToWeakPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossDistanceToWeakPoint']> {
    return this.entitiesFaunaFlora.calculateBossDistanceToWeakPoint(...args);
  }

  /**
   * [1170] calculateBossFacingDirection
   * Tính hướng mặt boss.
   */
  public calculateBossFacingDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossFacingDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossFacingDirection']> {
    return this.entitiesFaunaFlora.calculateBossFacingDirection(...args);
  }

  /**
   * [1171] calculateBossTurningAngle
   * Tính góc xoay boss.
   */
  public calculateBossTurningAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossTurningAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossTurningAngle']> {
    return this.entitiesFaunaFlora.calculateBossTurningAngle(...args);
  }

  /**
   * [1172] calculateBossMovementSpeed
   * Tính tốc độ di chuyển boss.
   */
  public calculateBossMovementSpeed(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossMovementSpeed']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossMovementSpeed']> {
    return this.entitiesFaunaFlora.calculateBossMovementSpeed(...args);
  }

  /**
   * [1173] calculateBossAttackRange
   * Tính tầm đánh boss.
   */
  public calculateBossAttackRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAttackRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAttackRange']> {
    return this.entitiesFaunaFlora.calculateBossAttackRange(...args);
  }

  /**
   * [1174] calculateBossAttackAngle
   * Tính góc đánh boss.
   */
  public calculateBossAttackAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAttackAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAttackAngle']> {
    return this.entitiesFaunaFlora.calculateBossAttackAngle(...args);
  }

  /**
   * [1175] calculateBossAttackTrajectory
   * Tính quỹ đạo đòn đánh boss.
   */
  public calculateBossAttackTrajectory(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAttackTrajectory']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAttackTrajectory']> {
    return this.entitiesFaunaFlora.calculateBossAttackTrajectory(...args);
  }

  /**
   * [1176] calculateBossProjectileVelocity
   * Tính vận tốc đạn boss.
   */
  public calculateBossProjectileVelocity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossProjectileVelocity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossProjectileVelocity']> {
    return this.entitiesFaunaFlora.calculateBossProjectileVelocity(...args);
  }

  /**
   * [1177] calculateBossProjectileDirection
   * Tính hướng đạn boss.
   */
  public calculateBossProjectileDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossProjectileDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossProjectileDirection']> {
    return this.entitiesFaunaFlora.calculateBossProjectileDirection(...args);
  }

  /**
   * [1178] calculateBossProjectileImpactPoint
   * Tính điểm va chạm đạn boss.
   */
  public calculateBossProjectileImpactPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossProjectileImpactPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossProjectileImpactPoint']> {
    return this.entitiesFaunaFlora.calculateBossProjectileImpactPoint(...args);
  }

  /**
   * [1179] calculateBossAreaAttackRadius
   * Tính bán kính đòn đánh diện rộng.
   */
  public calculateBossAreaAttackRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackRadius']> {
    return this.entitiesFaunaFlora.calculateBossAreaAttackRadius(...args);
  }

  /**
   * [1180] calculateBossAreaAttackCenter
   * Tính tâm vùng đòn đánh diện rộng.
   */
  public calculateBossAreaAttackCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackCenter']> {
    return this.entitiesFaunaFlora.calculateBossAreaAttackCenter(...args);
  }

  /**
   * [1181] calculateBossAreaAttackOverlap
   * Kiểm tra vùng đòn đánh có chồng lấn mục tiêu.
   */
  public calculateBossAreaAttackOverlap(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackOverlap']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossAreaAttackOverlap']> {
    return this.entitiesFaunaFlora.calculateBossAreaAttackOverlap(...args);
  }

  /**
   * [1182] calculateBossHitboxOverlap
   * Kiểm tra vùng trúng đòn boss có chồng lấn.
   */
  public calculateBossHitboxOverlap(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossHitboxOverlap']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossHitboxOverlap']> {
    return this.entitiesFaunaFlora.calculateBossHitboxOverlap(...args);
  }

  /**
   * [1183] calculateBossDamageDirection
   * Tính hướng nhận sát thương của boss.
   */
  public calculateBossDamageDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossDamageDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossDamageDirection']> {
    return this.entitiesFaunaFlora.calculateBossDamageDirection(...args);
  }

  /**
   * [1184] calculateBossKnockbackDirection
   * Tính hướng đẩy lùi boss.
   */
  public calculateBossKnockbackDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossKnockbackDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossKnockbackDirection']> {
    return this.entitiesFaunaFlora.calculateBossKnockbackDirection(...args);
  }

  /**
   * [1185] calculateBossKnockbackDistance
   * Tính khoảng cách đẩy lùi boss.
   */
  public calculateBossKnockbackDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossKnockbackDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossKnockbackDistance']> {
    return this.entitiesFaunaFlora.calculateBossKnockbackDistance(...args);
  }

  /**
   * [1186] calculateBossStaggerAngle
   * Tính góc choáng boss.
   */
  public calculateBossStaggerAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossStaggerAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossStaggerAngle']> {
    return this.entitiesFaunaFlora.calculateBossStaggerAngle(...args);
  }

  /**
   * [1187] calculateBossStaggerDuration
   * Tính thời gian choáng boss.
   */
  public calculateBossStaggerDuration(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossStaggerDuration']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossStaggerDuration']> {
    return this.entitiesFaunaFlora.calculateBossStaggerDuration(...args);
  }

  /**
   * [1188] calculateBossPhaseTransition
   * Tính điều kiện chuyển pha boss.
   */
  public calculateBossPhaseTransition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossPhaseTransition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossPhaseTransition']> {
    return this.entitiesFaunaFlora.calculateBossPhaseTransition(...args);
  }

  /**
   * [1189] calculateBossPhasePosition
   * Tính vị trí theo pha boss.
   */
  public calculateBossPhasePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossPhasePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossPhasePosition']> {
    return this.entitiesFaunaFlora.calculateBossPhasePosition(...args);
  }

  /**
   * [1190] calculateBossWeakPointExposure
   * Tính mức lộ điểm yếu boss.
   */
  public calculateBossWeakPointExposure(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBossWeakPointExposure']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBossWeakPointExposure']> {
    return this.entitiesFaunaFlora.calculateBossWeakPointExposure(...args);
  }

  /**
   * [1191] calculateMonsterPosition
   * Lấy tọa độ quái vật.
   */
  public calculateMonsterPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterPosition']> {
    return this.entitiesFaunaFlora.calculateMonsterPosition(...args);
  }

  /**
   * [1192] calculateMonsterMovementDirection
   * Tính hướng di chuyển quái vật.
   */
  public calculateMonsterMovementDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterMovementDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterMovementDirection']> {
    return this.entitiesFaunaFlora.calculateMonsterMovementDirection(...args);
  }

  /**
   * [1193] calculateMonsterSpeed
   * Tính tốc độ quái vật.
   */
  public calculateMonsterSpeed(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterSpeed']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterSpeed']> {
    return this.entitiesFaunaFlora.calculateMonsterSpeed(...args);
  }

  /**
   * [1194] calculateMonsterAttackDistance
   * Tính khoảng cách đánh quái vật.
   */
  public calculateMonsterAttackDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterAttackDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterAttackDistance']> {
    return this.entitiesFaunaFlora.calculateMonsterAttackDistance(...args);
  }

  /**
   * [1195] calculateMonsterDetectionRange
   * Tính phạm vi phát hiện quái vật.
   */
  public calculateMonsterDetectionRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterDetectionRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterDetectionRange']> {
    return this.entitiesFaunaFlora.calculateMonsterDetectionRange(...args);
  }

  /**
   * [1196] calculateMonsterCollision
   * Kiểm tra va chạm quái vật.
   */
  public calculateMonsterCollision(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterCollision']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterCollision']> {
    return this.entitiesFaunaFlora.calculateMonsterCollision(...args);
  }

  /**
   * [1197] calculateMonsterBoundingBox
   * Tính hộp bao quái vật.
   */
  public calculateMonsterBoundingBox(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterBoundingBox']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterBoundingBox']> {
    return this.entitiesFaunaFlora.calculateMonsterBoundingBox(...args);
  }

  /**
   * [1198] calculateMonsterBoundingSphere
   * Tính hình cầu bao quái vật.
   */
  public calculateMonsterBoundingSphere(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterBoundingSphere']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterBoundingSphere']> {
    return this.entitiesFaunaFlora.calculateMonsterBoundingSphere(...args);
  }

  /**
   * [1199] calculateMonsterWeakPoint
   * Tính vị trí điểm yếu quái vật.
   */
  public calculateMonsterWeakPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterWeakPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterWeakPoint']> {
    return this.entitiesFaunaFlora.calculateMonsterWeakPoint(...args);
  }

  /**
   * [1200] calculateMonsterThreatLevel
   * Tính mức độ đe dọa quái vật.
   */
  public calculateMonsterThreatLevel(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateMonsterThreatLevel']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateMonsterThreatLevel']> {
    return this.entitiesFaunaFlora.calculateMonsterThreatLevel(...args);
  }

  /**
   * [1201] getAnimalPosition
   * Lấy tọa độ con vật.
   */
  public getAnimalPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalPosition']> {
    return this.entitiesFaunaFlora.getAnimalPosition(...args);
  }

  /**
   * [1202] getAnimalCenter
   * Lấy tâm con vật.
   */
  public getAnimalCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalCenter']> {
    return this.entitiesFaunaFlora.getAnimalCenter(...args);
  }

  /**
   * [1203] getAnimalHeadPosition
   * Lấy tọa độ đầu con vật.
   */
  public getAnimalHeadPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalHeadPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalHeadPosition']> {
    return this.entitiesFaunaFlora.getAnimalHeadPosition(...args);
  }

  /**
   * [1204] getAnimalSnoutPosition
   * Lấy tọa độ mõm con vật.
   */
  public getAnimalSnoutPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalSnoutPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalSnoutPosition']> {
    return this.entitiesFaunaFlora.getAnimalSnoutPosition(...args);
  }

  /**
   * [1205] getAnimalNosePosition
   * Lấy tọa độ mũi con vật.
   */
  public getAnimalNosePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalNosePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalNosePosition']> {
    return this.entitiesFaunaFlora.getAnimalNosePosition(...args);
  }

  /**
   * [1206] getAnimalEyePosition
   * Lấy tọa độ mắt con vật.
   */
  public getAnimalEyePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalEyePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalEyePosition']> {
    return this.entitiesFaunaFlora.getAnimalEyePosition(...args);
  }

  /**
   * [1207] getAnimalEarPosition
   * Lấy tọa độ tai con vật.
   */
  public getAnimalEarPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalEarPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalEarPosition']> {
    return this.entitiesFaunaFlora.getAnimalEarPosition(...args);
  }

  /**
   * [1208] getAnimalNeckPosition
   * Lấy tọa độ cổ con vật.
   */
  public getAnimalNeckPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalNeckPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalNeckPosition']> {
    return this.entitiesFaunaFlora.getAnimalNeckPosition(...args);
  }

  /**
   * [1209] getAnimalTorsoPosition
   * Lấy tọa độ thân con vật.
   */
  public getAnimalTorsoPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalTorsoPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalTorsoPosition']> {
    return this.entitiesFaunaFlora.getAnimalTorsoPosition(...args);
  }

  /**
   * [1210] getAnimalChestPosition
   * Lấy tọa độ ngực con vật.
   */
  public getAnimalChestPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalChestPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalChestPosition']> {
    return this.entitiesFaunaFlora.getAnimalChestPosition(...args);
  }

  /**
   * [1211] getAnimalAbdomenPosition
   * Lấy tọa độ bụng con vật.
   */
  public getAnimalAbdomenPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalAbdomenPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalAbdomenPosition']> {
    return this.entitiesFaunaFlora.getAnimalAbdomenPosition(...args);
  }

  /**
   * [1212] getAnimalHipPosition
   * Lấy tọa độ hông con vật.
   */
  public getAnimalHipPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalHipPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalHipPosition']> {
    return this.entitiesFaunaFlora.getAnimalHipPosition(...args);
  }

  /**
   * [1213] getAnimalTailPosition
   * Lấy tọa độ đuôi con vật.
   */
  public getAnimalTailPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalTailPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalTailPosition']> {
    return this.entitiesFaunaFlora.getAnimalTailPosition(...args);
  }

  /**
   * [1214] getAnimalTailTipPosition
   * Lấy tọa độ chóp đuôi con vật.
   */
  public getAnimalTailTipPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalTailTipPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalTailTipPosition']> {
    return this.entitiesFaunaFlora.getAnimalTailTipPosition(...args);
  }

  /**
   * [1215] getAnimalFrontLeftLegPosition
   * Lấy tọa độ chân trước trái con vật.
   */
  public getAnimalFrontLeftLegPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalFrontLeftLegPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalFrontLeftLegPosition']> {
    return this.entitiesFaunaFlora.getAnimalFrontLeftLegPosition(...args);
  }

  /**
   * [1216] getAnimalFrontRightLegPosition
   * Lấy tọa độ chân trước phải con vật.
   */
  public getAnimalFrontRightLegPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalFrontRightLegPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalFrontRightLegPosition']> {
    return this.entitiesFaunaFlora.getAnimalFrontRightLegPosition(...args);
  }

  /**
   * [1217] getAnimalRearLeftLegPosition
   * Lấy tọa độ chân sau trái con vật.
   */
  public getAnimalRearLeftLegPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalRearLeftLegPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalRearLeftLegPosition']> {
    return this.entitiesFaunaFlora.getAnimalRearLeftLegPosition(...args);
  }

  /**
   * [1218] getAnimalRearRightLegPosition
   * Lấy tọa độ chân sau phải con vật.
   */
  public getAnimalRearRightLegPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalRearRightLegPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalRearRightLegPosition']> {
    return this.entitiesFaunaFlora.getAnimalRearRightLegPosition(...args);
  }

  /**
   * [1219] getAnimalPawPosition
   * Lấy tọa độ bàn chân con vật.
   */
  public getAnimalPawPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalPawPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalPawPosition']> {
    return this.entitiesFaunaFlora.getAnimalPawPosition(...args);
  }

  /**
   * [1220] getAnimalClawPosition
   * Lấy tọa độ móng vuốt con vật.
   */
  public getAnimalClawPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getAnimalClawPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getAnimalClawPosition']> {
    return this.entitiesFaunaFlora.getAnimalClawPosition(...args);
  }

  /**
   * [1221] calculateAnimalBodyLength
   * Tính chiều dài thân con vật.
   */
  public calculateAnimalBodyLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBodyLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBodyLength']> {
    return this.entitiesFaunaFlora.calculateAnimalBodyLength(...args);
  }

  /**
   * [1222] calculateAnimalBodyHeight
   * Tính chiều cao thân con vật.
   */
  public calculateAnimalBodyHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBodyHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBodyHeight']> {
    return this.entitiesFaunaFlora.calculateAnimalBodyHeight(...args);
  }

  /**
   * [1223] calculateAnimalBodyWidth
   * Tính chiều rộng thân con vật.
   */
  public calculateAnimalBodyWidth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBodyWidth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBodyWidth']> {
    return this.entitiesFaunaFlora.calculateAnimalBodyWidth(...args);
  }

  /**
   * [1224] calculateAnimalCenterOfMass
   * Tính tâm khối lượng con vật.
   */
  public calculateAnimalCenterOfMass(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalCenterOfMass']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalCenterOfMass']> {
    return this.entitiesFaunaFlora.calculateAnimalCenterOfMass(...args);
  }

  /**
   * [1225] calculateAnimalSpineCurvature
   * Tính độ cong cột sống con vật.
   */
  public calculateAnimalSpineCurvature(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalSpineCurvature']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalSpineCurvature']> {
    return this.entitiesFaunaFlora.calculateAnimalSpineCurvature(...args);
  }

  /**
   * [1226] calculateAnimalNeckAngle
   * Tính góc cổ con vật.
   */
  public calculateAnimalNeckAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalNeckAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalNeckAngle']> {
    return this.entitiesFaunaFlora.calculateAnimalNeckAngle(...args);
  }

  /**
   * [1227] calculateAnimalHeadAngle
   * Tính góc đầu con vật.
   */
  public calculateAnimalHeadAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalHeadAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalHeadAngle']> {
    return this.entitiesFaunaFlora.calculateAnimalHeadAngle(...args);
  }

  /**
   * [1228] calculateAnimalTailCurvature
   * Tính độ cong đuôi con vật.
   */
  public calculateAnimalTailCurvature(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalTailCurvature']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalTailCurvature']> {
    return this.entitiesFaunaFlora.calculateAnimalTailCurvature(...args);
  }

  /**
   * [1229] calculateAnimalTailSwing
   * Tính độ vung đuôi con vật.
   */
  public calculateAnimalTailSwing(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalTailSwing']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalTailSwing']> {
    return this.entitiesFaunaFlora.calculateAnimalTailSwing(...args);
  }

  /**
   * [1230] calculateAnimalLegLength
   * Tính chiều dài chân con vật.
   */
  public calculateAnimalLegLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalLegLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalLegLength']> {
    return this.entitiesFaunaFlora.calculateAnimalLegLength(...args);
  }

  /**
   * [1231] calculateAnimalStrideLength
   * Tính chiều dài bước con vật.
   */
  public calculateAnimalStrideLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalStrideLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalStrideLength']> {
    return this.entitiesFaunaFlora.calculateAnimalStrideLength(...args);
  }

  /**
   * [1232] calculateAnimalStrideFrequency
   * Tính tần số bước con vật.
   */
  public calculateAnimalStrideFrequency(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalStrideFrequency']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalStrideFrequency']> {
    return this.entitiesFaunaFlora.calculateAnimalStrideFrequency(...args);
  }

  /**
   * [1233] calculateAnimalWalkingSpeed
   * Tính tốc độ đi con vật.
   */
  public calculateAnimalWalkingSpeed(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalWalkingSpeed']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalWalkingSpeed']> {
    return this.entitiesFaunaFlora.calculateAnimalWalkingSpeed(...args);
  }

  /**
   * [1234] calculateAnimalRunningSpeed
   * Tính tốc độ chạy con vật.
   */
  public calculateAnimalRunningSpeed(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalRunningSpeed']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalRunningSpeed']> {
    return this.entitiesFaunaFlora.calculateAnimalRunningSpeed(...args);
  }

  /**
   * [1235] calculateAnimalJumpHeight
   * Tính độ cao nhảy con vật.
   */
  public calculateAnimalJumpHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalJumpHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalJumpHeight']> {
    return this.entitiesFaunaFlora.calculateAnimalJumpHeight(...args);
  }

  /**
   * [1236] calculateAnimalLandingPosition
   * Tính vị trí tiếp đất con vật.
   */
  public calculateAnimalLandingPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalLandingPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalLandingPosition']> {
    return this.entitiesFaunaFlora.calculateAnimalLandingPosition(...args);
  }

  /**
   * [1237] calculateAnimalGroundContact
   * Kiểm tra chân con vật tiếp xúc mặt đất.
   */
  public calculateAnimalGroundContact(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalGroundContact']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalGroundContact']> {
    return this.entitiesFaunaFlora.calculateAnimalGroundContact(...args);
  }

  /**
   * [1238] calculateAnimalFootPlacement
   * Tính vị trí đặt chân con vật.
   */
  public calculateAnimalFootPlacement(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalFootPlacement']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalFootPlacement']> {
    return this.entitiesFaunaFlora.calculateAnimalFootPlacement(...args);
  }

  /**
   * [1239] calculateAnimalBalance
   * Tính độ cân bằng con vật.
   */
  public calculateAnimalBalance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBalance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBalance']> {
    return this.entitiesFaunaFlora.calculateAnimalBalance(...args);
  }

  /**
   * [1240] calculateAnimalGaitPhase
   * Tính pha dáng đi con vật.
   */
  public calculateAnimalGaitPhase(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalGaitPhase']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalGaitPhase']> {
    return this.entitiesFaunaFlora.calculateAnimalGaitPhase(...args);
  }

  /**
   * [1241] calculateAnimalHeadToGroundDistance
   * Tính khoảng cách đầu con vật đến mặt đất.
   */
  public calculateAnimalHeadToGroundDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalHeadToGroundDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalHeadToGroundDistance']> {
    return this.entitiesFaunaFlora.calculateAnimalHeadToGroundDistance(...args);
  }

  /**
   * [1242] calculateAnimalNoseToTargetDistance
   * Tính khoảng cách mũi đến mục tiêu.
   */
  public calculateAnimalNoseToTargetDistance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalNoseToTargetDistance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalNoseToTargetDistance']> {
    return this.entitiesFaunaFlora.calculateAnimalNoseToTargetDistance(...args);
  }

  /**
   * [1243] calculateAnimalSightDirection
   * Tính hướng nhìn con vật.
   */
  public calculateAnimalSightDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalSightDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalSightDirection']> {
    return this.entitiesFaunaFlora.calculateAnimalSightDirection(...args);
  }

  /**
   * [1244] calculateAnimalFieldOfView
   * Tính trường nhìn con vật.
   */
  public calculateAnimalFieldOfView(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalFieldOfView']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalFieldOfView']> {
    return this.entitiesFaunaFlora.calculateAnimalFieldOfView(...args);
  }

  /**
   * [1245] calculateAnimalHearingRange
   * Tính phạm vi nghe con vật.
   */
  public calculateAnimalHearingRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalHearingRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalHearingRange']> {
    return this.entitiesFaunaFlora.calculateAnimalHearingRange(...args);
  }

  /**
   * [1246] calculateAnimalSmellRange
   * Tính phạm vi ngửi con vật.
   */
  public calculateAnimalSmellRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalSmellRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalSmellRange']> {
    return this.entitiesFaunaFlora.calculateAnimalSmellRange(...args);
  }

  /**
   * [1247] calculateAnimalAttackRange
   * Tính tầm tấn công con vật.
   */
  public calculateAnimalAttackRange(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalAttackRange']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalAttackRange']> {
    return this.entitiesFaunaFlora.calculateAnimalAttackRange(...args);
  }

  /**
   * [1248] calculateAnimalBitePoint
   * Tính điểm cắn con vật.
   */
  public calculateAnimalBitePoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBitePoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBitePoint']> {
    return this.entitiesFaunaFlora.calculateAnimalBitePoint(...args);
  }

  /**
   * [1249] calculateAnimalBiteDirection
   * Tính hướng cắn con vật.
   */
  public calculateAnimalBiteDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalBiteDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalBiteDirection']> {
    return this.entitiesFaunaFlora.calculateAnimalBiteDirection(...args);
  }

  /**
   * [1250] calculateAnimalCollision
   * Kiểm tra va chạm con vật.
   */
  public calculateAnimalCollision(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateAnimalCollision']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateAnimalCollision']> {
    return this.entitiesFaunaFlora.calculateAnimalCollision(...args);
  }

  /**
   * [1251] getBirdPosition
   * Lấy tọa độ chim.
   */
  public getBirdPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdPosition']> {
    return this.entitiesFaunaFlora.getBirdPosition(...args);
  }

  /**
   * [1252] getBirdHeadPosition
   * Lấy tọa độ đầu chim.
   */
  public getBirdHeadPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdHeadPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdHeadPosition']> {
    return this.entitiesFaunaFlora.getBirdHeadPosition(...args);
  }

  /**
   * [1253] getBirdBeakPosition
   * Lấy tọa độ mỏ chim.
   */
  public getBirdBeakPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdBeakPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdBeakPosition']> {
    return this.entitiesFaunaFlora.getBirdBeakPosition(...args);
  }

  /**
   * [1254] getBirdEyePosition
   * Lấy tọa độ mắt chim.
   */
  public getBirdEyePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdEyePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdEyePosition']> {
    return this.entitiesFaunaFlora.getBirdEyePosition(...args);
  }

  /**
   * [1255] getBirdBodyCenter
   * Lấy tâm thân chim.
   */
  public getBirdBodyCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdBodyCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdBodyCenter']> {
    return this.entitiesFaunaFlora.getBirdBodyCenter(...args);
  }

  /**
   * [1256] getBirdWingRootPosition
   * Lấy tọa độ gốc cánh chim.
   */
  public getBirdWingRootPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdWingRootPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdWingRootPosition']> {
    return this.entitiesFaunaFlora.getBirdWingRootPosition(...args);
  }

  /**
   * [1257] getBirdLeftWingTip
   * Lấy tọa độ đầu cánh trái.
   */
  public getBirdLeftWingTip(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdLeftWingTip']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdLeftWingTip']> {
    return this.entitiesFaunaFlora.getBirdLeftWingTip(...args);
  }

  /**
   * [1258] getBirdRightWingTip
   * Lấy tọa độ đầu cánh phải.
   */
  public getBirdRightWingTip(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdRightWingTip']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdRightWingTip']> {
    return this.entitiesFaunaFlora.getBirdRightWingTip(...args);
  }

  /**
   * [1259] getBirdWingCenter
   * Lấy tâm cánh chim.
   */
  public getBirdWingCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdWingCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdWingCenter']> {
    return this.entitiesFaunaFlora.getBirdWingCenter(...args);
  }

  /**
   * [1260] getBirdTailTipPosition
   * Lấy tọa độ chóp đuôi chim.
   */
  public getBirdTailTipPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdTailTipPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdTailTipPosition']> {
    return this.entitiesFaunaFlora.getBirdTailTipPosition(...args);
  }

  /**
   * [1261] getBirdLeftFootPosition
   * Lấy tọa độ chân trái chim.
   */
  public getBirdLeftFootPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdLeftFootPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdLeftFootPosition']> {
    return this.entitiesFaunaFlora.getBirdLeftFootPosition(...args);
  }

  /**
   * [1262] getBirdRightFootPosition
   * Lấy tọa độ chân phải chim.
   */
  public getBirdRightFootPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBirdRightFootPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBirdRightFootPosition']> {
    return this.entitiesFaunaFlora.getBirdRightFootPosition(...args);
  }

  /**
   * [1263] calculateBirdWingspan
   * Tính sải cánh chim.
   */
  public calculateBirdWingspan(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingspan']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingspan']> {
    return this.entitiesFaunaFlora.calculateBirdWingspan(...args);
  }

  /**
   * [1264] calculateBirdWingLength
   * Tính chiều dài cánh chim.
   */
  public calculateBirdWingLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingLength']> {
    return this.entitiesFaunaFlora.calculateBirdWingLength(...args);
  }

  /**
   * [1265] calculateBirdWingArea
   * Tính diện tích cánh chim.
   */
  public calculateBirdWingArea(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingArea']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingArea']> {
    return this.entitiesFaunaFlora.calculateBirdWingArea(...args);
  }

  /**
   * [1266] calculateBirdWingAngle
   * Tính góc cánh chim.
   */
  public calculateBirdWingAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingAngle']> {
    return this.entitiesFaunaFlora.calculateBirdWingAngle(...args);
  }

  /**
   * [1267] calculateBirdWingFlapAmplitude
   * Tính biên độ vỗ cánh.
   */
  public calculateBirdWingFlapAmplitude(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapAmplitude']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapAmplitude']> {
    return this.entitiesFaunaFlora.calculateBirdWingFlapAmplitude(...args);
  }

  /**
   * [1268] calculateBirdWingFlapFrequency
   * Tính tần số vỗ cánh.
   */
  public calculateBirdWingFlapFrequency(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapFrequency']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapFrequency']> {
    return this.entitiesFaunaFlora.calculateBirdWingFlapFrequency(...args);
  }

  /**
   * [1269] calculateBirdWingFlapPhase
   * Tính pha vỗ cánh.
   */
  public calculateBirdWingFlapPhase(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapPhase']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingFlapPhase']> {
    return this.entitiesFaunaFlora.calculateBirdWingFlapPhase(...args);
  }

  /**
   * [1270] calculateBirdWingVelocity
   * Tính vận tốc cánh chim.
   */
  public calculateBirdWingVelocity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingVelocity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingVelocity']> {
    return this.entitiesFaunaFlora.calculateBirdWingVelocity(...args);
  }

  /**
   * [1271] calculateBirdWingAcceleration
   * Tính gia tốc cánh chim.
   */
  public calculateBirdWingAcceleration(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdWingAcceleration']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdWingAcceleration']> {
    return this.entitiesFaunaFlora.calculateBirdWingAcceleration(...args);
  }

  /**
   * [1272] calculateBirdFlightDirection
   * Tính hướng bay chim.
   */
  public calculateBirdFlightDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFlightDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFlightDirection']> {
    return this.entitiesFaunaFlora.calculateBirdFlightDirection(...args);
  }

  /**
   * [1273] calculateBirdFlightSpeed
   * Tính tốc độ bay chim.
   */
  public calculateBirdFlightSpeed(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFlightSpeed']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFlightSpeed']> {
    return this.entitiesFaunaFlora.calculateBirdFlightSpeed(...args);
  }

  /**
   * [1274] calculateBirdFlightAltitude
   * Tính độ cao bay chim.
   */
  public calculateBirdFlightAltitude(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFlightAltitude']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFlightAltitude']> {
    return this.entitiesFaunaFlora.calculateBirdFlightAltitude(...args);
  }

  /**
   * [1275] calculateBirdFlightPath
   * Tính đường bay chim.
   */
  public calculateBirdFlightPath(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFlightPath']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFlightPath']> {
    return this.entitiesFaunaFlora.calculateBirdFlightPath(...args);
  }

  /**
   * [1276] calculateBirdGlideAngle
   * Tính góc lượn chim.
   */
  public calculateBirdGlideAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdGlideAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdGlideAngle']> {
    return this.entitiesFaunaFlora.calculateBirdGlideAngle(...args);
  }

  /**
   * [1277] calculateBirdTurnRadius
   * Tính bán kính vòng lượn chim.
   */
  public calculateBirdTurnRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdTurnRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdTurnRadius']> {
    return this.entitiesFaunaFlora.calculateBirdTurnRadius(...args);
  }

  /**
   * [1278] calculateBirdBankAngle
   * Tính góc nghiêng khi chim rẽ.
   */
  public calculateBirdBankAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdBankAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdBankAngle']> {
    return this.entitiesFaunaFlora.calculateBirdBankAngle(...args);
  }

  /**
   * [1279] calculateBirdLiftForce
   * Tính lực nâng cánh chim.
   */
  public calculateBirdLiftForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdLiftForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdLiftForce']> {
    return this.entitiesFaunaFlora.calculateBirdLiftForce(...args);
  }

  /**
   * [1280] calculateBirdDragForce
   * Tính lực cản không khí chim.
   */
  public calculateBirdDragForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdDragForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdDragForce']> {
    return this.entitiesFaunaFlora.calculateBirdDragForce(...args);
  }

  /**
   * [1281] calculateBirdHoverPosition
   * Tính vị trí chim bay lơ lửng.
   */
  public calculateBirdHoverPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdHoverPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdHoverPosition']> {
    return this.entitiesFaunaFlora.calculateBirdHoverPosition(...args);
  }

  /**
   * [1282] calculateBirdLandingPoint
   * Tính điểm hạ cánh chim.
   */
  public calculateBirdLandingPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdLandingPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdLandingPoint']> {
    return this.entitiesFaunaFlora.calculateBirdLandingPoint(...args);
  }

  /**
   * [1283] calculateBirdTakeoffVelocity
   * Tính vận tốc cất cánh chim.
   */
  public calculateBirdTakeoffVelocity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdTakeoffVelocity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdTakeoffVelocity']> {
    return this.entitiesFaunaFlora.calculateBirdTakeoffVelocity(...args);
  }

  /**
   * [1284] calculateBirdObstacleAvoidance
   * Tính hướng tránh vật cản khi bay.
   */
  public calculateBirdObstacleAvoidance(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdObstacleAvoidance']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdObstacleAvoidance']> {
    return this.entitiesFaunaFlora.calculateBirdObstacleAvoidance(...args);
  }

  /**
   * [1285] calculateBirdFormationPosition
   * Tính vị trí chim trong đội hình.
   */
  public calculateBirdFormationPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFormationPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFormationPosition']> {
    return this.entitiesFaunaFlora.calculateBirdFormationPosition(...args);
  }

  /**
   * [1286] calculateBirdFormationSpacing
   * Tính khoảng cách giữa các chim.
   */
  public calculateBirdFormationSpacing(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdFormationSpacing']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdFormationSpacing']> {
    return this.entitiesFaunaFlora.calculateBirdFormationSpacing(...args);
  }

  /**
   * [1287] calculateBirdTargetIntercept
   * Tính điểm chặn mục tiêu trên không.
   */
  public calculateBirdTargetIntercept(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdTargetIntercept']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdTargetIntercept']> {
    return this.entitiesFaunaFlora.calculateBirdTargetIntercept(...args);
  }

  /**
   * [1288] calculateBirdBeakDirection
   * Tính hướng mỏ chim.
   */
  public calculateBirdBeakDirection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdBeakDirection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdBeakDirection']> {
    return this.entitiesFaunaFlora.calculateBirdBeakDirection(...args);
  }

  /**
   * [1289] calculateBirdTalonsPosition
   * Tính tọa độ móng vuốt chim.
   */
  public calculateBirdTalonsPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdTalonsPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdTalonsPosition']> {
    return this.entitiesFaunaFlora.calculateBirdTalonsPosition(...args);
  }

  /**
   * [1290] calculateBirdCollision
   * Kiểm tra va chạm chim.
   */
  public calculateBirdCollision(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBirdCollision']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBirdCollision']> {
    return this.entitiesFaunaFlora.calculateBirdCollision(...args);
  }

  /**
   * [1291] getPlantPosition
   * Lấy tọa độ cây hoặc thực vật.
   */
  public getPlantPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getPlantPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getPlantPosition']> {
    return this.entitiesFaunaFlora.getPlantPosition(...args);
  }

  /**
   * [1292] getPlantRootPosition
   * Lấy tọa độ gốc cây.
   */
  public getPlantRootPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getPlantRootPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getPlantRootPosition']> {
    return this.entitiesFaunaFlora.getPlantRootPosition(...args);
  }

  /**
   * [1293] getPlantStemPosition
   * Lấy tọa độ thân thực vật.
   */
  public getPlantStemPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getPlantStemPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getPlantStemPosition']> {
    return this.entitiesFaunaFlora.getPlantStemPosition(...args);
  }

  /**
   * [1294] getPlantStemBase
   * Lấy tọa độ gốc thân cây.
   */
  public getPlantStemBase(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getPlantStemBase']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getPlantStemBase']> {
    return this.entitiesFaunaFlora.getPlantStemBase(...args);
  }

  /**
   * [1295] getPlantStemTip
   * Lấy tọa độ ngọn thân cây.
   */
  public getPlantStemTip(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getPlantStemTip']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getPlantStemTip']> {
    return this.entitiesFaunaFlora.getPlantStemTip(...args);
  }

  /**
   * [1296] getTreeTrunkPosition
   * Lấy tọa độ thân cây gỗ.
   */
  public getTreeTrunkPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeTrunkPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeTrunkPosition']> {
    return this.entitiesFaunaFlora.getTreeTrunkPosition(...args);
  }

  /**
   * [1297] getTreeTrunkCenter
   * Lấy tâm thân cây.
   */
  public getTreeTrunkCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeTrunkCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeTrunkCenter']> {
    return this.entitiesFaunaFlora.getTreeTrunkCenter(...args);
  }

  /**
   * [1298] getTreeTrunkBase
   * Lấy tọa độ gốc thân cây.
   */
  public getTreeTrunkBase(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeTrunkBase']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeTrunkBase']> {
    return this.entitiesFaunaFlora.getTreeTrunkBase(...args);
  }

  /**
   * [1299] getTreeTrunkTop
   * Lấy tọa độ đỉnh thân cây.
   */
  public getTreeTrunkTop(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeTrunkTop']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeTrunkTop']> {
    return this.entitiesFaunaFlora.getTreeTrunkTop(...args);
  }

  /**
   * [1300] getTreeCanopyCenter
   * Lấy tâm tán cây.
   */
  public getTreeCanopyCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeCanopyCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeCanopyCenter']> {
    return this.entitiesFaunaFlora.getTreeCanopyCenter(...args);
  }

  /**
   * [1301] getTreeCanopyTop
   * Lấy tọa độ đỉnh tán cây.
   */
  public getTreeCanopyTop(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeCanopyTop']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeCanopyTop']> {
    return this.entitiesFaunaFlora.getTreeCanopyTop(...args);
  }

  /**
   * [1302] getTreeCanopyBottom
   * Lấy tọa độ đáy tán cây.
   */
  public getTreeCanopyBottom(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeCanopyBottom']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeCanopyBottom']> {
    return this.entitiesFaunaFlora.getTreeCanopyBottom(...args);
  }

  /**
   * [1303] getTreeCanopyLeft
   * Lấy tọa độ mép trái tán cây.
   */
  public getTreeCanopyLeft(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeCanopyLeft']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeCanopyLeft']> {
    return this.entitiesFaunaFlora.getTreeCanopyLeft(...args);
  }

  /**
   * [1304] getTreeCanopyRight
   * Lấy tọa độ mép phải tán cây.
   */
  public getTreeCanopyRight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getTreeCanopyRight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getTreeCanopyRight']> {
    return this.entitiesFaunaFlora.getTreeCanopyRight(...args);
  }

  /**
   * [1305] getBranchPosition
   * Lấy tọa độ cành cây.
   */
  public getBranchPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBranchPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBranchPosition']> {
    return this.entitiesFaunaFlora.getBranchPosition(...args);
  }

  /**
   * [1306] getBranchStartPosition
   * Lấy điểm đầu cành cây.
   */
  public getBranchStartPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBranchStartPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBranchStartPosition']> {
    return this.entitiesFaunaFlora.getBranchStartPosition(...args);
  }

  /**
   * [1307] getBranchEndPosition
   * Lấy điểm cuối cành cây.
   */
  public getBranchEndPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBranchEndPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBranchEndPosition']> {
    return this.entitiesFaunaFlora.getBranchEndPosition(...args);
  }

  /**
   * [1308] getBranchJunctionPosition
   * Lấy tọa độ điểm phân nhánh.
   */
  public getBranchJunctionPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getBranchJunctionPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getBranchJunctionPosition']> {
    return this.entitiesFaunaFlora.getBranchJunctionPosition(...args);
  }

  /**
   * [1309] getLeafPosition
   * Lấy tọa độ lá.
   */
  public getLeafPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getLeafPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getLeafPosition']> {
    return this.entitiesFaunaFlora.getLeafPosition(...args);
  }

  /**
   * [1310] getLeafTipPosition
   * Lấy tọa độ chóp lá.
   */
  public getLeafTipPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getLeafTipPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getLeafTipPosition']> {
    return this.entitiesFaunaFlora.getLeafTipPosition(...args);
  }

  /**
   * [1311] getLeafBasePosition
   * Lấy tọa độ gốc lá.
   */
  public getLeafBasePosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getLeafBasePosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getLeafBasePosition']> {
    return this.entitiesFaunaFlora.getLeafBasePosition(...args);
  }

  /**
   * [1312] getLeafCenter
   * Lấy tâm lá.
   */
  public getLeafCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getLeafCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getLeafCenter']> {
    return this.entitiesFaunaFlora.getLeafCenter(...args);
  }

  /**
   * [1313] getFlowerPosition
   * Lấy tọa độ hoa.
   */
  public getFlowerPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getFlowerPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getFlowerPosition']> {
    return this.entitiesFaunaFlora.getFlowerPosition(...args);
  }

  /**
   * [1314] getFlowerCenter
   * Lấy tâm hoa.
   */
  public getFlowerCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getFlowerCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getFlowerCenter']> {
    return this.entitiesFaunaFlora.getFlowerCenter(...args);
  }

  /**
   * [1315] getFruitPosition
   * Lấy tọa độ quả.
   */
  public getFruitPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getFruitPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getFruitPosition']> {
    return this.entitiesFaunaFlora.getFruitPosition(...args);
  }

  /**
   * [1316] getFruitCenter
   * Lấy tâm quả.
   */
  public getFruitCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getFruitCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getFruitCenter']> {
    return this.entitiesFaunaFlora.getFruitCenter(...args);
  }

  /**
   * [1317] getSeedPosition
   * Lấy tọa độ hạt.
   */
  public getSeedPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getSeedPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getSeedPosition']> {
    return this.entitiesFaunaFlora.getSeedPosition(...args);
  }

  /**
   * [1318] calculatePlantHeight
   * Tính chiều cao thực vật.
   */
  public calculatePlantHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculatePlantHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculatePlantHeight']> {
    return this.entitiesFaunaFlora.calculatePlantHeight(...args);
  }

  /**
   * [1319] calculateTreeHeight
   * Tính chiều cao cây.
   */
  public calculateTreeHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeHeight']> {
    return this.entitiesFaunaFlora.calculateTreeHeight(...args);
  }

  /**
   * [1320] calculateTreeTrunkDiameter
   * Tính đường kính thân cây.
   */
  public calculateTreeTrunkDiameter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeTrunkDiameter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeTrunkDiameter']> {
    return this.entitiesFaunaFlora.calculateTreeTrunkDiameter(...args);
  }

  /**
   * [1321] calculateTreeTrunkRadius
   * Tính bán kính thân cây.
   */
  public calculateTreeTrunkRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeTrunkRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeTrunkRadius']> {
    return this.entitiesFaunaFlora.calculateTreeTrunkRadius(...args);
  }

  /**
   * [1322] calculateTreeCanopyRadius
   * Tính bán kính tán cây.
   */
  public calculateTreeCanopyRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeCanopyRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeCanopyRadius']> {
    return this.entitiesFaunaFlora.calculateTreeCanopyRadius(...args);
  }

  /**
   * [1323] calculateTreeCanopyVolume
   * Tính thể tích tán cây.
   */
  public calculateTreeCanopyVolume(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeCanopyVolume']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeCanopyVolume']> {
    return this.entitiesFaunaFlora.calculateTreeCanopyVolume(...args);
  }

  /**
   * [1324] calculateTreeCanopyBounds
   * Tính giới hạn tán cây.
   */
  public calculateTreeCanopyBounds(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeCanopyBounds']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeCanopyBounds']> {
    return this.entitiesFaunaFlora.calculateTreeCanopyBounds(...args);
  }

  /**
   * [1325] calculateTreeBranchLength
   * Tính chiều dài cành cây.
   */
  public calculateTreeBranchLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeBranchLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeBranchLength']> {
    return this.entitiesFaunaFlora.calculateTreeBranchLength(...args);
  }

  /**
   * [1326] calculateBranchAngle
   * Tính góc cành cây.
   */
  public calculateBranchAngle(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBranchAngle']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBranchAngle']> {
    return this.entitiesFaunaFlora.calculateBranchAngle(...args);
  }

  /**
   * [1327] calculateBranchCurvature
   * Tính độ cong cành cây.
   */
  public calculateBranchCurvature(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBranchCurvature']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBranchCurvature']> {
    return this.entitiesFaunaFlora.calculateBranchCurvature(...args);
  }

  /**
   * [1328] calculateBranchTaper
   * Tính độ thuôn của cành cây.
   */
  public calculateBranchTaper(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateBranchTaper']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateBranchTaper']> {
    return this.entitiesFaunaFlora.calculateBranchTaper(...args);
  }

  /**
   * [1329] calculateLeafLength
   * Tính chiều dài lá.
   */
  public calculateLeafLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafLength']> {
    return this.entitiesFaunaFlora.calculateLeafLength(...args);
  }

  /**
   * [1330] calculateLeafWidth
   * Tính chiều rộng lá.
   */
  public calculateLeafWidth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafWidth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafWidth']> {
    return this.entitiesFaunaFlora.calculateLeafWidth(...args);
  }

  /**
   * [1331] calculateLeafNormal
   * Tính pháp tuyến bề mặt lá.
   */
  public calculateLeafNormal(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafNormal']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafNormal']> {
    return this.entitiesFaunaFlora.calculateLeafNormal(...args);
  }

  /**
   * [1332] calculateLeafOrientation
   * Tính hướng lá.
   */
  public calculateLeafOrientation(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafOrientation']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafOrientation']> {
    return this.entitiesFaunaFlora.calculateLeafOrientation(...args);
  }

  /**
   * [1333] calculateLeafCurvature
   * Tính độ cong lá.
   */
  public calculateLeafCurvature(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafCurvature']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafCurvature']> {
    return this.entitiesFaunaFlora.calculateLeafCurvature(...args);
  }

  /**
   * [1334] calculateLeafArea
   * Tính diện tích lá.
   */
  public calculateLeafArea(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateLeafArea']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateLeafArea']> {
    return this.entitiesFaunaFlora.calculateLeafArea(...args);
  }

  /**
   * [1335] calculateFlowerRadius
   * Tính bán kính hoa.
   */
  public calculateFlowerRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateFlowerRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateFlowerRadius']> {
    return this.entitiesFaunaFlora.calculateFlowerRadius(...args);
  }

  /**
   * [1336] calculateFruitRadius
   * Tính bán kính quả.
   */
  public calculateFruitRadius(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateFruitRadius']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateFruitRadius']> {
    return this.entitiesFaunaFlora.calculateFruitRadius(...args);
  }

  /**
   * [1337] calculateRootDepth
   * Tính độ sâu rễ.
   */
  public calculateRootDepth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateRootDepth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateRootDepth']> {
    return this.entitiesFaunaFlora.calculateRootDepth(...args);
  }

  /**
   * [1338] calculateRootSpread
   * Tính độ lan rộng rễ.
   */
  public calculateRootSpread(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateRootSpread']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateRootSpread']> {
    return this.entitiesFaunaFlora.calculateRootSpread(...args);
  }

  /**
   * [1339] calculatePlantWindDeflection
   * Tính độ lệch cây do gió.
   */
  public calculatePlantWindDeflection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculatePlantWindDeflection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculatePlantWindDeflection']> {
    return this.entitiesFaunaFlora.calculatePlantWindDeflection(...args);
  }

  /**
   * [1340] calculateTreeWindSway
   * Tính độ lắc cây do gió.
   */
  public calculateTreeWindSway(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateTreeWindSway']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateTreeWindSway']> {
    return this.entitiesFaunaFlora.calculateTreeWindSway(...args);
  }

  /**
   * [1341] getObjectPosition
   * Lấy tọa độ vật thể.
   */
  public getObjectPosition(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectPosition']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectPosition']> {
    return this.entitiesFaunaFlora.getObjectPosition(...args);
  }

  /**
   * [1342] getObjectCenter
   * Lấy tâm vật thể.
   */
  public getObjectCenter(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectCenter']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectCenter']> {
    return this.entitiesFaunaFlora.getObjectCenter(...args);
  }

  /**
   * [1343] getObjectRotation
   * Lấy góc quay vật thể.
   */
  public getObjectRotation(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectRotation']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectRotation']> {
    return this.entitiesFaunaFlora.getObjectRotation(...args);
  }

  /**
   * [1344] getObjectScale
   * Lấy tỷ lệ kích thước vật thể.
   */
  public getObjectScale(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectScale']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectScale']> {
    return this.entitiesFaunaFlora.getObjectScale(...args);
  }

  /**
   * [1345] getObjectForwardVector
   * Lấy hướng phía trước vật thể.
   */
  public getObjectForwardVector(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectForwardVector']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectForwardVector']> {
    return this.entitiesFaunaFlora.getObjectForwardVector(...args);
  }

  /**
   * [1346] getObjectRightVector
   * Lấy hướng bên phải vật thể.
   */
  public getObjectRightVector(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectRightVector']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectRightVector']> {
    return this.entitiesFaunaFlora.getObjectRightVector(...args);
  }

  /**
   * [1347] getObjectUpVector
   * Lấy hướng phía trên vật thể.
   */
  public getObjectUpVector(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectUpVector']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectUpVector']> {
    return this.entitiesFaunaFlora.getObjectUpVector(...args);
  }

  /**
   * [1348] getObjectBoundingBox
   * Lấy hộp bao vật thể.
   */
  public getObjectBoundingBox(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectBoundingBox']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectBoundingBox']> {
    return this.entitiesFaunaFlora.getObjectBoundingBox(...args);
  }

  /**
   * [1349] getObjectBoundingSphere
   * Lấy hình cầu bao vật thể.
   */
  public getObjectBoundingSphere(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectBoundingSphere']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectBoundingSphere']> {
    return this.entitiesFaunaFlora.getObjectBoundingSphere(...args);
  }

  /**
   * [1350] getObjectBoundingCapsule
   * Lấy capsule bao vật thể.
   */
  public getObjectBoundingCapsule(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['getObjectBoundingCapsule']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['getObjectBoundingCapsule']> {
    return this.entitiesFaunaFlora.getObjectBoundingCapsule(...args);
  }

  /**
   * [1351] calculateObjectLength
   * Tính chiều dài vật thể.
   */
  public calculateObjectLength(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectLength']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectLength']> {
    return this.entitiesFaunaFlora.calculateObjectLength(...args);
  }

  /**
   * [1352] calculateObjectWidth
   * Tính chiều rộng vật thể.
   */
  public calculateObjectWidth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectWidth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectWidth']> {
    return this.entitiesFaunaFlora.calculateObjectWidth(...args);
  }

  /**
   * [1353] calculateObjectHeight
   * Tính chiều cao vật thể.
   */
  public calculateObjectHeight(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectHeight']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectHeight']> {
    return this.entitiesFaunaFlora.calculateObjectHeight(...args);
  }

  /**
   * [1354] calculateObjectDepth
   * Tính chiều sâu vật thể.
   */
  public calculateObjectDepth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDepth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDepth']> {
    return this.entitiesFaunaFlora.calculateObjectDepth(...args);
  }

  /**
   * [1355] calculateObjectVolume
   * Tính thể tích vật thể.
   */
  public calculateObjectVolume(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectVolume']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectVolume']> {
    return this.entitiesFaunaFlora.calculateObjectVolume(...args);
  }

  /**
   * [1356] calculateObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateObjectSurfaceArea(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectSurfaceArea']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectSurfaceArea']> {
    return this.entitiesFaunaFlora.calculateObjectSurfaceArea(...args);
  }

  /**
   * [1357] calculateObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateObjectCenterOfMass(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectCenterOfMass']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectCenterOfMass']> {
    return this.entitiesFaunaFlora.calculateObjectCenterOfMass(...args);
  }

  /**
   * [1358] calculateObjectDensity
   * Tính khối lượng riêng vật thể.
   */
  public calculateObjectDensity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDensity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDensity']> {
    return this.entitiesFaunaFlora.calculateObjectDensity(...args);
  }

  /**
   * [1359] calculateObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateObjectInertiaTensor(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectInertiaTensor']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectInertiaTensor']> {
    return this.entitiesFaunaFlora.calculateObjectInertiaTensor(...args);
  }

  /**
   * [1360] calculateObjectWorldTransform
   * Tính phép biến đổi thế giới vật thể.
   */
  public calculateObjectWorldTransform(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectWorldTransform']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectWorldTransform']> {
    return this.entitiesFaunaFlora.calculateObjectWorldTransform(...args);
  }

  /**
   * [1361] calculateObjectLocalTransform
   * Tính phép biến đổi cục bộ vật thể.
   */
  public calculateObjectLocalTransform(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectLocalTransform']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectLocalTransform']> {
    return this.entitiesFaunaFlora.calculateObjectLocalTransform(...args);
  }

  /**
   * [1362] calculateObjectPivotOffset
   * Tính độ lệch điểm xoay vật thể.
   */
  public calculateObjectPivotOffset(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectPivotOffset']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectPivotOffset']> {
    return this.entitiesFaunaFlora.calculateObjectPivotOffset(...args);
  }

  /**
   * [1363] calculateObjectOriginOffset
   * Tính độ lệch gốc vật thể.
   */
  public calculateObjectOriginOffset(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectOriginOffset']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectOriginOffset']> {
    return this.entitiesFaunaFlora.calculateObjectOriginOffset(...args);
  }

  /**
   * [1364] calculateObjectDistanceToGround
   * Tính khoảng cách vật thể đến mặt đất.
   */
  public calculateObjectDistanceToGround(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToGround']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToGround']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToGround(...args);
  }

  /**
   * [1365] calculateObjectDistanceToWall
   * Tính khoảng cách vật thể đến tường.
   */
  public calculateObjectDistanceToWall(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToWall']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToWall']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToWall(...args);
  }

  /**
   * [1366] calculateObjectDistanceToCeiling
   * Tính khoảng cách vật thể đến trần.
   */
  public calculateObjectDistanceToCeiling(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToCeiling']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToCeiling']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToCeiling(...args);
  }

  /**
   * [1367] calculateObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateObjectDistanceToCamera(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToCamera']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToCamera']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToCamera(...args);
  }

  /**
   * [1368] calculateObjectDistanceToPlayer
   * Tính khoảng cách vật thể đến người chơi.
   */
  public calculateObjectDistanceToPlayer(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToPlayer']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToPlayer']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToPlayer(...args);
  }

  /**
   * [1369] calculateObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateObjectDistanceToTarget(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToTarget']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDistanceToTarget']> {
    return this.entitiesFaunaFlora.calculateObjectDistanceToTarget(...args);
  }

  /**
   * [1370] calculateObjectClosestPoint
   * Tính điểm gần nhất trên vật thể.
   */
  public calculateObjectClosestPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectClosestPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectClosestPoint']> {
    return this.entitiesFaunaFlora.calculateObjectClosestPoint(...args);
  }

  /**
   * [1371] calculateObjectFarthestPoint
   * Tính điểm xa nhất trên vật thể.
   */
  public calculateObjectFarthestPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectFarthestPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectFarthestPoint']> {
    return this.entitiesFaunaFlora.calculateObjectFarthestPoint(...args);
  }

  /**
   * [1372] calculateObjectSurfaceNormal
   * Tính pháp tuyến bề mặt vật thể.
   */
  public calculateObjectSurfaceNormal(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectSurfaceNormal']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectSurfaceNormal']> {
    return this.entitiesFaunaFlora.calculateObjectSurfaceNormal(...args);
  }

  /**
   * [1373] calculateObjectTangent
   * Tính tiếp tuyến bề mặt vật thể.
   */
  public calculateObjectTangent(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectTangent']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectTangent']> {
    return this.entitiesFaunaFlora.calculateObjectTangent(...args);
  }

  /**
   * [1374] calculateObjectCurvature
   * Tính độ cong bề mặt vật thể.
   */
  public calculateObjectCurvature(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectCurvature']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectCurvature']> {
    return this.entitiesFaunaFlora.calculateObjectCurvature(...args);
  }

  /**
   * [1375] calculateObjectIntersection
   * Tính giao điểm vật thể.
   */
  public calculateObjectIntersection(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectIntersection']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectIntersection']> {
    return this.entitiesFaunaFlora.calculateObjectIntersection(...args);
  }

  /**
   * [1376] calculateObjectOverlap
   * Tính mức độ chồng lấn vật thể.
   */
  public calculateObjectOverlap(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectOverlap']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectOverlap']> {
    return this.entitiesFaunaFlora.calculateObjectOverlap(...args);
  }

  /**
   * [1377] calculateObjectCollision
   * Kiểm tra va chạm vật thể.
   */
  public calculateObjectCollision(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectCollision']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectCollision']> {
    return this.entitiesFaunaFlora.calculateObjectCollision(...args);
  }

  /**
   * [1378] calculateObjectPenetrationDepth
   * Tính độ xuyên lấn vật thể.
   */
  public calculateObjectPenetrationDepth(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectPenetrationDepth']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectPenetrationDepth']> {
    return this.entitiesFaunaFlora.calculateObjectPenetrationDepth(...args);
  }

  /**
   * [1379] calculateObjectSeparationVector
   * Tính vector tách vật thể.
   */
  public calculateObjectSeparationVector(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectSeparationVector']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectSeparationVector']> {
    return this.entitiesFaunaFlora.calculateObjectSeparationVector(...args);
  }

  /**
   * [1380] calculateObjectContactPoint
   * Tính điểm tiếp xúc vật thể.
   */
  public calculateObjectContactPoint(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectContactPoint']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectContactPoint']> {
    return this.entitiesFaunaFlora.calculateObjectContactPoint(...args);
  }

  /**
   * [1381] calculateObjectContactNormal
   * Tính pháp tuyến điểm tiếp xúc.
   */
  public calculateObjectContactNormal(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectContactNormal']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectContactNormal']> {
    return this.entitiesFaunaFlora.calculateObjectContactNormal(...args);
  }

  /**
   * [1382] calculateObjectContactArea
   * Tính diện tích tiếp xúc vật thể.
   */
  public calculateObjectContactArea(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectContactArea']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectContactArea']> {
    return this.entitiesFaunaFlora.calculateObjectContactArea(...args);
  }

  /**
   * [1383] calculateObjectFrictionForce
   * Tính lực ma sát vật thể.
   */
  public calculateObjectFrictionForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectFrictionForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectFrictionForce']> {
    return this.entitiesFaunaFlora.calculateObjectFrictionForce(...args);
  }

  /**
   * [1384] calculateObjectNormalForce
   * Tính lực pháp tuyến vật thể.
   */
  public calculateObjectNormalForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectNormalForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectNormalForce']> {
    return this.entitiesFaunaFlora.calculateObjectNormalForce(...args);
  }

  /**
   * [1385] calculateObjectGravityForce
   * Tính lực hấp dẫn tác dụng lên vật thể.
   */
  public calculateObjectGravityForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectGravityForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectGravityForce']> {
    return this.entitiesFaunaFlora.calculateObjectGravityForce(...args);
  }

  /**
   * [1386] calculateObjectBuoyancyForce
   * Tính lực đẩy nổi vật thể.
   */
  public calculateObjectBuoyancyForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectBuoyancyForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectBuoyancyForce']> {
    return this.entitiesFaunaFlora.calculateObjectBuoyancyForce(...args);
  }

  /**
   * [1387] calculateObjectDragForce
   * Tính lực cản vật thể.
   */
  public calculateObjectDragForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectDragForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectDragForce']> {
    return this.entitiesFaunaFlora.calculateObjectDragForce(...args);
  }

  /**
   * [1388] calculateObjectLiftForce
   * Tính lực nâng vật thể.
   */
  public calculateObjectLiftForce(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectLiftForce']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectLiftForce']> {
    return this.entitiesFaunaFlora.calculateObjectLiftForce(...args);
  }

  /**
   * [1389] calculateObjectVelocity
   * Tính vận tốc vật thể.
   */
  public calculateObjectVelocity(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectVelocity']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectVelocity']> {
    return this.entitiesFaunaFlora.calculateObjectVelocity(...args);
  }

  /**
   * [1390] calculateObjectAcceleration
   * Tính gia tốc vật thể.
   */
  public calculateObjectAcceleration(
    ...args: Parameters<EntitiesFaunaFloraSubsystem['calculateObjectAcceleration']>
  ): ReturnType<EntitiesFaunaFloraSubsystem['calculateObjectAcceleration']> {
    return this.entitiesFaunaFlora.calculateObjectAcceleration(...args);
  }

  /**
   * [1391] getCameraPosition
   * Lấy tọa độ camera.
   */
  public getCameraPosition(
    ...args: Parameters<CameraViewportUISubsystem['getCameraPosition']>
  ): ReturnType<CameraViewportUISubsystem['getCameraPosition']> {
    return this.cameraViewportUI.getCameraPosition(...args);
  }

  /**
   * [1392] getCameraRotation
   * Lấy góc quay camera.
   */
  public getCameraRotation(
    ...args: Parameters<CameraViewportUISubsystem['getCameraRotation']>
  ): ReturnType<CameraViewportUISubsystem['getCameraRotation']> {
    return this.cameraViewportUI.getCameraRotation(...args);
  }

  /**
   * [1393] getCameraForwardVector
   * Lấy hướng nhìn phía trước camera.
   */
  public getCameraForwardVector(
    ...args: Parameters<CameraViewportUISubsystem['getCameraForwardVector']>
  ): ReturnType<CameraViewportUISubsystem['getCameraForwardVector']> {
    return this.cameraViewportUI.getCameraForwardVector(...args);
  }

  /**
   * [1394] getCameraRightVector
   * Lấy hướng bên phải camera.
   */
  public getCameraRightVector(
    ...args: Parameters<CameraViewportUISubsystem['getCameraRightVector']>
  ): ReturnType<CameraViewportUISubsystem['getCameraRightVector']> {
    return this.cameraViewportUI.getCameraRightVector(...args);
  }

  /**
   * [1395] getCameraUpVector
   * Lấy hướng phía trên camera.
   */
  public getCameraUpVector(
    ...args: Parameters<CameraViewportUISubsystem['getCameraUpVector']>
  ): ReturnType<CameraViewportUISubsystem['getCameraUpVector']> {
    return this.cameraViewportUI.getCameraUpVector(...args);
  }

  /**
   * [1396] getCameraTargetPosition
   * Lấy tọa độ mục tiêu camera.
   */
  public getCameraTargetPosition(
    ...args: Parameters<CameraViewportUISubsystem['getCameraTargetPosition']>
  ): ReturnType<CameraViewportUISubsystem['getCameraTargetPosition']> {
    return this.cameraViewportUI.getCameraTargetPosition(...args);
  }

  /**
   * [1397] getCameraFocalPoint
   * Lấy tiêu điểm camera.
   */
  public getCameraFocalPoint(
    ...args: Parameters<CameraViewportUISubsystem['getCameraFocalPoint']>
  ): ReturnType<CameraViewportUISubsystem['getCameraFocalPoint']> {
    return this.cameraViewportUI.getCameraFocalPoint(...args);
  }

  /**
   * [1398] getCameraNearPlane
   * Lấy mặt phẳng cắt gần camera.
   */
  public getCameraNearPlane(
    ...args: Parameters<CameraViewportUISubsystem['getCameraNearPlane']>
  ): ReturnType<CameraViewportUISubsystem['getCameraNearPlane']> {
    return this.cameraViewportUI.getCameraNearPlane(...args);
  }

  /**
   * [1399] getCameraFarPlane
   * Lấy mặt phẳng cắt xa camera.
   */
  public getCameraFarPlane(
    ...args: Parameters<CameraViewportUISubsystem['getCameraFarPlane']>
  ): ReturnType<CameraViewportUISubsystem['getCameraFarPlane']> {
    return this.cameraViewportUI.getCameraFarPlane(...args);
  }

  /**
   * [1400] getCameraFieldOfView
   * Lấy trường nhìn camera.
   */
  public getCameraFieldOfView(
    ...args: Parameters<CameraViewportUISubsystem['getCameraFieldOfView']>
  ): ReturnType<CameraViewportUISubsystem['getCameraFieldOfView']> {
    return this.cameraViewportUI.getCameraFieldOfView(...args);
  }

  /**
   * [1401] calculateCameraDistance
   * Tính khoảng cách camera đến mục tiêu.
   */
  public calculateCameraDistance(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraDistance']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraDistance']> {
    return this.cameraViewportUI.calculateCameraDistance(...args);
  }

  /**
   * [1402] calculateCameraOrbitPosition
   * Tính vị trí camera quỹ đạo.
   */
  public calculateCameraOrbitPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraOrbitPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraOrbitPosition']> {
    return this.cameraViewportUI.calculateCameraOrbitPosition(...args);
  }

  /**
   * [1403] calculateCameraOrbitAngle
   * Tính góc quỹ đạo camera.
   */
  public calculateCameraOrbitAngle(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraOrbitAngle']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraOrbitAngle']> {
    return this.cameraViewportUI.calculateCameraOrbitAngle(...args);
  }

  /**
   * [1404] calculateCameraOrbitRadius
   * Tính bán kính quỹ đạo camera.
   */
  public calculateCameraOrbitRadius(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraOrbitRadius']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraOrbitRadius']> {
    return this.cameraViewportUI.calculateCameraOrbitRadius(...args);
  }

  /**
   * [1405] calculateCameraLookAt
   * Tính hướng camera nhìn mục tiêu.
   */
  public calculateCameraLookAt(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraLookAt']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraLookAt']> {
    return this.cameraViewportUI.calculateCameraLookAt(...args);
  }

  /**
   * [1406] calculateCameraLookAtMatrix
   * Tính ma trận hướng nhìn camera.
   */
  public calculateCameraLookAtMatrix(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraLookAtMatrix']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraLookAtMatrix']> {
    return this.cameraViewportUI.calculateCameraLookAtMatrix(...args);
  }

  /**
   * [1407] calculateCameraViewMatrix
   * Tính ma trận nhìn camera.
   */
  public calculateCameraViewMatrix(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraViewMatrix']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraViewMatrix']> {
    return this.cameraViewportUI.calculateCameraViewMatrix(...args);
  }

  /**
   * [1408] calculateCameraProjectionMatrix
   * Tính ma trận chiếu camera.
   */
  public calculateCameraProjectionMatrix(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraProjectionMatrix']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraProjectionMatrix']> {
    return this.cameraViewportUI.calculateCameraProjectionMatrix(...args);
  }

  /**
   * [1409] calculateCameraViewProjectionMatrix
   * Tính ma trận nhìn và chiếu.
   */
  public calculateCameraViewProjectionMatrix(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraViewProjectionMatrix']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraViewProjectionMatrix']> {
    return this.cameraViewportUI.calculateCameraViewProjectionMatrix(...args);
  }

  /**
   * [1410] calculateCameraFrustum
   * Tính thể tích nhìn camera.
   */
  public calculateCameraFrustum(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraFrustum']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraFrustum']> {
    return this.cameraViewportUI.calculateCameraFrustum(...args);
  }

  /**
   * [1411] calculateCameraFrustumPlanes
   * Tính các mặt phẳng của thể tích nhìn.
   */
  public calculateCameraFrustumPlanes(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraFrustumPlanes']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraFrustumPlanes']> {
    return this.cameraViewportUI.calculateCameraFrustumPlanes(...args);
  }

  /**
   * [1412] calculateCameraFrustumCorners
   * Tính các góc của thể tích nhìn.
   */
  public calculateCameraFrustumCorners(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraFrustumCorners']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraFrustumCorners']> {
    return this.cameraViewportUI.calculateCameraFrustumCorners(...args);
  }

  /**
   * [1413] calculateCameraVisibility
   * Kiểm tra vật thể có nằm trong tầm nhìn.
   */
  public calculateCameraVisibility(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraVisibility']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraVisibility']> {
    return this.cameraViewportUI.calculateCameraVisibility(...args);
  }

  /**
   * [1414] calculateCameraOcclusion
   * Kiểm tra vật thể bị che khuất.
   */
  public calculateCameraOcclusion(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraOcclusion']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraOcclusion']> {
    return this.cameraViewportUI.calculateCameraOcclusion(...args);
  }

  /**
   * [1415] calculateCameraDepth
   * Tính độ sâu vật thể theo camera.
   */
  public calculateCameraDepth(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraDepth']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraDepth']> {
    return this.cameraViewportUI.calculateCameraDepth(...args);
  }

  /**
   * [1416] calculateCameraScreenPosition
   * Tính vị trí màn hình từ camera.
   */
  public calculateCameraScreenPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraScreenPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraScreenPosition']> {
    return this.cameraViewportUI.calculateCameraScreenPosition(...args);
  }

  /**
   * [1417] calculateCameraScreenRay
   * Tính tia từ camera qua điểm màn hình.
   */
  public calculateCameraScreenRay(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraScreenRay']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraScreenRay']> {
    return this.cameraViewportUI.calculateCameraScreenRay(...args);
  }

  /**
   * [1418] calculateCameraWorldRay
   * Tính tia trong thế giới từ camera.
   */
  public calculateCameraWorldRay(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraWorldRay']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraWorldRay']> {
    return this.cameraViewportUI.calculateCameraWorldRay(...args);
  }

  /**
   * [1419] calculateCameraPickingRay
   * Tính tia chọn vật thể.
   */
  public calculateCameraPickingRay(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraPickingRay']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraPickingRay']> {
    return this.cameraViewportUI.calculateCameraPickingRay(...args);
  }

  /**
   * [1420] calculateCameraRayIntersection
   * Tính giao điểm tia camera.
   */
  public calculateCameraRayIntersection(
    ...args: Parameters<CameraViewportUISubsystem['calculateCameraRayIntersection']>
  ): ReturnType<CameraViewportUISubsystem['calculateCameraRayIntersection']> {
    return this.cameraViewportUI.calculateCameraRayIntersection(...args);
  }

  /**
   * [1421] calculateScreenToWorldRay
   * Chuyển tọa độ màn hình thành tia thế giới.
   */
  public calculateScreenToWorldRay(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenToWorldRay']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenToWorldRay']> {
    return this.cameraViewportUI.calculateScreenToWorldRay(...args);
  }

  /**
   * [1422] calculateWorldToScreenPosition
   * Chuyển tọa độ thế giới sang màn hình.
   */
  public calculateWorldToScreenPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateWorldToScreenPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateWorldToScreenPosition']> {
    return this.cameraViewportUI.calculateWorldToScreenPosition(...args);
  }

  /**
   * [1423] calculateScreenToWorldPosition
   * Chuyển tọa độ màn hình sang thế giới tại độ sâu cho trước.
   */
  public calculateScreenToWorldPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenToWorldPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenToWorldPosition']> {
    return this.cameraViewportUI.calculateScreenToWorldPosition(...args);
  }

  /**
   * [1424] calculateViewportAspectRatio
   * Tính tỷ lệ khung hình viewport.
   */
  public calculateViewportAspectRatio(
    ...args: Parameters<CameraViewportUISubsystem['calculateViewportAspectRatio']>
  ): ReturnType<CameraViewportUISubsystem['calculateViewportAspectRatio']> {
    return this.cameraViewportUI.calculateViewportAspectRatio(...args);
  }

  /**
   * [1425] calculateViewportCenter
   * Tính tâm viewport.
   */
  public calculateViewportCenter(
    ...args: Parameters<CameraViewportUISubsystem['calculateViewportCenter']>
  ): ReturnType<CameraViewportUISubsystem['calculateViewportCenter']> {
    return this.cameraViewportUI.calculateViewportCenter(...args);
  }

  /**
   * [1426] calculateViewportBounds
   * Tính giới hạn viewport.
   */
  public calculateViewportBounds(
    ...args: Parameters<CameraViewportUISubsystem['calculateViewportBounds']>
  ): ReturnType<CameraViewportUISubsystem['calculateViewportBounds']> {
    return this.cameraViewportUI.calculateViewportBounds(...args);
  }

  /**
   * [1427] calculateScreenSpaceDistance
   * Tính khoảng cách trên màn hình.
   */
  public calculateScreenSpaceDistance(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceDistance']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceDistance']> {
    return this.cameraViewportUI.calculateScreenSpaceDistance(...args);
  }

  /**
   * [1428] calculateScreenSpaceAngle
   * Tính góc trên màn hình.
   */
  public calculateScreenSpaceAngle(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceAngle']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceAngle']> {
    return this.cameraViewportUI.calculateScreenSpaceAngle(...args);
  }

  /**
   * [1429] calculateScreenSpaceBoundingBox
   * Tính hộp bao 2D của vật thể 3D.
   */
  public calculateScreenSpaceBoundingBox(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceBoundingBox']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceBoundingBox']> {
    return this.cameraViewportUI.calculateScreenSpaceBoundingBox(...args);
  }

  /**
   * [1430] calculateScreenSpaceBoundingSphere
   * Tính hình cầu chiếu lên màn hình.
   */
  public calculateScreenSpaceBoundingSphere(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceBoundingSphere']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceBoundingSphere']> {
    return this.cameraViewportUI.calculateScreenSpaceBoundingSphere(...args);
  }

  /**
   * [1431] calculateScreenSpaceArea
   * Tính diện tích chiếm trên màn hình.
   */
  public calculateScreenSpaceArea(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceArea']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceArea']> {
    return this.cameraViewportUI.calculateScreenSpaceArea(...args);
  }

  /**
   * [1432] calculateScreenSpaceScale
   * Tính tỷ lệ kích thước trên màn hình.
   */
  public calculateScreenSpaceScale(
    ...args: Parameters<CameraViewportUISubsystem['calculateScreenSpaceScale']>
  ): ReturnType<CameraViewportUISubsystem['calculateScreenSpaceScale']> {
    return this.cameraViewportUI.calculateScreenSpaceScale(...args);
  }

  /**
   * [1433] calculatePixelDistance
   * Tính khoảng cách theo pixel.
   */
  public calculatePixelDistance(
    ...args: Parameters<CameraViewportUISubsystem['calculatePixelDistance']>
  ): ReturnType<CameraViewportUISubsystem['calculatePixelDistance']> {
    return this.cameraViewportUI.calculatePixelDistance(...args);
  }

  /**
   * [1434] calculatePixelPosition
   * Tính vị trí pixel.
   */
  public calculatePixelPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculatePixelPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculatePixelPosition']> {
    return this.cameraViewportUI.calculatePixelPosition(...args);
  }

  /**
   * [1435] calculatePixelToWorldScale
   * Tính tỷ lệ chuyển pixel sang đơn vị thế giới.
   */
  public calculatePixelToWorldScale(
    ...args: Parameters<CameraViewportUISubsystem['calculatePixelToWorldScale']>
  ): ReturnType<CameraViewportUISubsystem['calculatePixelToWorldScale']> {
    return this.cameraViewportUI.calculatePixelToWorldScale(...args);
  }

  /**
   * [1436] calculateWorldToPixelScale
   * Tính tỷ lệ chuyển đơn vị thế giới sang pixel.
   */
  public calculateWorldToPixelScale(
    ...args: Parameters<CameraViewportUISubsystem['calculateWorldToPixelScale']>
  ): ReturnType<CameraViewportUISubsystem['calculateWorldToPixelScale']> {
    return this.cameraViewportUI.calculateWorldToPixelScale(...args);
  }

  /**
   * [1437] calculateUIAnchorPosition
   * Tính vị trí neo giao diện.
   */
  public calculateUIAnchorPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIAnchorPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIAnchorPosition']> {
    return this.cameraViewportUI.calculateUIAnchorPosition(...args);
  }

  /**
   * [1438] calculateUIWorldAnchor
   * Tính điểm neo giao diện trong thế giới 3D.
   */
  public calculateUIWorldAnchor(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIWorldAnchor']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIWorldAnchor']> {
    return this.cameraViewportUI.calculateUIWorldAnchor(...args);
  }

  /**
   * [1439] calculateUIBillboardRotation
   * Tính góc quay UI hướng về camera.
   */
  public calculateUIBillboardRotation(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIBillboardRotation']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIBillboardRotation']> {
    return this.cameraViewportUI.calculateUIBillboardRotation(...args);
  }

  /**
   * [1440] calculateUIBillboardPosition
   * Tính vị trí UI dạng billboard.
   */
  public calculateUIBillboardPosition(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIBillboardPosition']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIBillboardPosition']> {
    return this.cameraViewportUI.calculateUIBillboardPosition(...args);
  }

  /**
   * [1441] calculateUIFollowTarget
   * Tính vị trí UI bám theo mục tiêu.
   */
  public calculateUIFollowTarget(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIFollowTarget']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIFollowTarget']> {
    return this.cameraViewportUI.calculateUIFollowTarget(...args);
  }

  /**
   * [1442] calculateUIFollowOffset
   * Tính độ lệch UI so với mục tiêu.
   */
  public calculateUIFollowOffset(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIFollowOffset']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIFollowOffset']> {
    return this.cameraViewportUI.calculateUIFollowOffset(...args);
  }

  /**
   * [1443] calculateUIVisibility
   * Tính trạng thái hiển thị UI.
   */
  public calculateUIVisibility(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIVisibility']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIVisibility']> {
    return this.cameraViewportUI.calculateUIVisibility(...args);
  }

  /**
   * [1444] calculateUIOcclusion
   * Kiểm tra UI bị vật thể che khuất.
   */
  public calculateUIOcclusion(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIOcclusion']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIOcclusion']> {
    return this.cameraViewportUI.calculateUIOcclusion(...args);
  }

  /**
   * [1445] calculateUIDistanceScale
   * Tính tỷ lệ UI theo khoảng cách.
   */
  public calculateUIDistanceScale(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIDistanceScale']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIDistanceScale']> {
    return this.cameraViewportUI.calculateUIDistanceScale(...args);
  }

  /**
   * [1446] calculateUIDepthOrder
   * Tính thứ tự độ sâu UI.
   */
  public calculateUIDepthOrder(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIDepthOrder']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIDepthOrder']> {
    return this.cameraViewportUI.calculateUIDepthOrder(...args);
  }

  /**
   * [1447] calculateUIProjectionBounds
   * Tính giới hạn UI sau phép chiếu.
   */
  public calculateUIProjectionBounds(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIProjectionBounds']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIProjectionBounds']> {
    return this.cameraViewportUI.calculateUIProjectionBounds(...args);
  }

  /**
   * [1448] calculateUIInteractionRay
   * Tính tia tương tác UI trong không gian 3D.
   */
  public calculateUIInteractionRay(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIInteractionRay']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIInteractionRay']> {
    return this.cameraViewportUI.calculateUIInteractionRay(...args);
  }

  /**
   * [1449] calculateUIHitTest
   * Kiểm tra điểm tương tác có chạm UI.
   */
  public calculateUIHitTest(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIHitTest']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIHitTest']> {
    return this.cameraViewportUI.calculateUIHitTest(...args);
  }

  /**
   * [1450] calculateUIWorldToScreenOffset
   * Tính độ lệch chiếu UI từ thế giới sang màn hình.
   */
  public calculateUIWorldToScreenOffset(
    ...args: Parameters<CameraViewportUISubsystem['calculateUIWorldToScreenOffset']>
  ): ReturnType<CameraViewportUISubsystem['calculateUIWorldToScreenOffset']> {
    return this.cameraViewportUI.calculateUIWorldToScreenOffset(...args);
  }

  /**
   * [1451] calculateAABBOverlap
   * Kiểm tra hai hộp AABB có chồng lấn.
   */
  public calculateAABBOverlap(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateAABBOverlap']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateAABBOverlap']> {
    return this.physicsCollisionProjectile.calculateAABBOverlap(...args);
  }

  /**
   * [1452] calculateOBBOverlap
   * Kiểm tra hai hộp OBB có chồng lấn.
   */
  public calculateOBBOverlap(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateOBBOverlap']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateOBBOverlap']> {
    return this.physicsCollisionProjectile.calculateOBBOverlap(...args);
  }

  /**
   * [1453] calculateSphereOverlap
   * Kiểm tra hai hình cầu có chồng lấn.
   */
  public calculateSphereOverlap(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSphereOverlap']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSphereOverlap']> {
    return this.physicsCollisionProjectile.calculateSphereOverlap(...args);
  }

  /**
   * [1454] calculateCapsuleOverlap
   * Kiểm tra hai capsule có chồng lấn.
   */
  public calculateCapsuleOverlap(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCapsuleOverlap']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCapsuleOverlap']> {
    return this.physicsCollisionProjectile.calculateCapsuleOverlap(...args);
  }

  /**
   * [1455] calculateCylinderOverlap
   * Kiểm tra hai hình trụ có chồng lấn.
   */
  public calculateCylinderOverlap(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCylinderOverlap']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCylinderOverlap']> {
    return this.physicsCollisionProjectile.calculateCylinderOverlap(...args);
  }

  /**
   * [1456] calculatePlaneIntersection
   * Tính giao điểm với mặt phẳng.
   */
  public calculatePlaneIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculatePlaneIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculatePlaneIntersection']> {
    return this.physicsCollisionProjectile.calculatePlaneIntersection(...args);
  }

  /**
   * [1457] calculateRayPlaneIntersection
   * Tính giao điểm tia và mặt phẳng.
   */
  public calculateRayPlaneIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRayPlaneIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRayPlaneIntersection']> {
    return this.physicsCollisionProjectile.calculateRayPlaneIntersection(...args);
  }

  /**
   * [1458] calculateRaySphereIntersection
   * Tính giao điểm tia và hình cầu.
   */
  public calculateRaySphereIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRaySphereIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRaySphereIntersection']> {
    return this.physicsCollisionProjectile.calculateRaySphereIntersection(...args);
  }

  /**
   * [1459] calculateRayBoxIntersection
   * Tính giao điểm tia và hộp.
   */
  public calculateRayBoxIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRayBoxIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRayBoxIntersection']> {
    return this.physicsCollisionProjectile.calculateRayBoxIntersection(...args);
  }

  /**
   * [1460] calculateRayCapsuleIntersection
   * Tính giao điểm tia và capsule.
   */
  public calculateRayCapsuleIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRayCapsuleIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRayCapsuleIntersection']> {
    return this.physicsCollisionProjectile.calculateRayCapsuleIntersection(...args);
  }

  /**
   * [1461] calculateRayTriangleIntersection
   * Tính giao điểm tia và tam giác.
   */
  public calculateRayTriangleIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRayTriangleIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRayTriangleIntersection']> {
    return this.physicsCollisionProjectile.calculateRayTriangleIntersection(...args);
  }

  /**
   * [1462] calculateSegmentSegmentDistance
   * Tính khoảng cách giữa hai đoạn.
   */
  public calculateSegmentSegmentDistance(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSegmentSegmentDistance']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSegmentSegmentDistance']> {
    return this.physicsCollisionProjectile.calculateSegmentSegmentDistance(...args);
  }

  /**
   * [1463] calculateSegmentTriangleIntersection
   * Kiểm tra giao nhau giữa đoạn và tam giác.
   */
  public calculateSegmentTriangleIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSegmentTriangleIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSegmentTriangleIntersection']> {
    return this.physicsCollisionProjectile.calculateSegmentTriangleIntersection(...args);
  }

  /**
   * [1464] calculateTriangleTriangleIntersection
   * Kiểm tra giao nhau giữa hai tam giác.
   */
  public calculateTriangleTriangleIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateTriangleTriangleIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateTriangleTriangleIntersection']> {
    return this.physicsCollisionProjectile.calculateTriangleTriangleIntersection(...args);
  }

  /**
   * [1465] calculateMeshMeshIntersection
   * Kiểm tra giao nhau giữa hai mesh.
   */
  public calculateMeshMeshIntersection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateMeshMeshIntersection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateMeshMeshIntersection']> {
    return this.physicsCollisionProjectile.calculateMeshMeshIntersection(...args);
  }

  /**
   * [1466] calculateMeshSurfaceDistance
   * Tính khoảng cách giữa các bề mặt mesh.
   */
  public calculateMeshSurfaceDistance(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateMeshSurfaceDistance']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateMeshSurfaceDistance']> {
    return this.physicsCollisionProjectile.calculateMeshSurfaceDistance(...args);
  }

  /**
   * [1467] calculateClosestPointOnTriangle
   * Tìm điểm gần nhất trên tam giác.
   */
  public calculateClosestPointOnTriangle(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnTriangle']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnTriangle']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnTriangle(...args);
  }

  /**
   * [1468] calculateClosestPointOnSegment
   * Tìm điểm gần nhất trên đoạn.
   */
  public calculateClosestPointOnSegment(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnSegment']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnSegment']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnSegment(...args);
  }

  /**
   * [1469] calculateClosestPointOnPlane
   * Tìm điểm gần nhất trên mặt phẳng.
   */
  public calculateClosestPointOnPlane(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnPlane']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnPlane']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnPlane(...args);
  }

  /**
   * [1470] calculateClosestPointOnSphere
   * Tìm điểm gần nhất trên hình cầu.
   */
  public calculateClosestPointOnSphere(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnSphere']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnSphere']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnSphere(...args);
  }

  /**
   * [1471] calculateClosestPointOnBox
   * Tìm điểm gần nhất trên hộp.
   */
  public calculateClosestPointOnBox(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnBox']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnBox']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnBox(...args);
  }

  /**
   * [1472] calculateClosestPointOnCapsule
   * Tìm điểm gần nhất trên capsule.
   */
  public calculateClosestPointOnCapsule(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnCapsule']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnCapsule']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnCapsule(...args);
  }

  /**
   * [1473] calculateClosestPointOnMesh
   * Tìm điểm gần nhất trên mesh.
   */
  public calculateClosestPointOnMesh(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnMesh']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateClosestPointOnMesh']> {
    return this.physicsCollisionProjectile.calculateClosestPointOnMesh(...args);
  }

  /**
   * [1474] calculateContactManifold
   * Tính tập điểm tiếp xúc va chạm.
   */
  public calculateContactManifold(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateContactManifold']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateContactManifold']> {
    return this.physicsCollisionProjectile.calculateContactManifold(...args);
  }

  /**
   * [1475] calculateCollisionNormal
   * Tính pháp tuyến va chạm.
   */
  public calculateCollisionNormal(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCollisionNormal']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCollisionNormal']> {
    return this.physicsCollisionProjectile.calculateCollisionNormal(...args);
  }

  /**
   * [1476] calculateCollisionDepth
   * Tính độ sâu va chạm.
   */
  public calculateCollisionDepth(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCollisionDepth']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCollisionDepth']> {
    return this.physicsCollisionProjectile.calculateCollisionDepth(...args);
  }

  /**
   * [1477] calculateCollisionTimeOfImpact
   * Tính thời điểm hai vật thể va chạm.
   */
  public calculateCollisionTimeOfImpact(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCollisionTimeOfImpact']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCollisionTimeOfImpact']> {
    return this.physicsCollisionProjectile.calculateCollisionTimeOfImpact(...args);
  }

  /**
   * [1478] calculateSweptAABB
   * Tính hộp quét theo chuyển động.
   */
  public calculateSweptAABB(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSweptAABB']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSweptAABB']> {
    return this.physicsCollisionProjectile.calculateSweptAABB(...args);
  }

  /**
   * [1479] calculateSweptSphere
   * Tính hình cầu quét theo chuyển động.
   */
  public calculateSweptSphere(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSweptSphere']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSweptSphere']> {
    return this.physicsCollisionProjectile.calculateSweptSphere(...args);
  }

  /**
   * [1480] calculateContinuousCollision
   * Kiểm tra va chạm liên tục.
   */
  public calculateContinuousCollision(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateContinuousCollision']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateContinuousCollision']> {
    return this.physicsCollisionProjectile.calculateContinuousCollision(...args);
  }

  /**
   * [1481] calculateRigidBodyVelocity
   * Tính vận tốc vật rắn.
   */
  public calculateRigidBodyVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRigidBodyVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRigidBodyVelocity']> {
    return this.physicsCollisionProjectile.calculateRigidBodyVelocity(...args);
  }

  /**
   * [1482] calculateRigidBodyAcceleration
   * Tính gia tốc vật rắn.
   */
  public calculateRigidBodyAcceleration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAcceleration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAcceleration']> {
    return this.physicsCollisionProjectile.calculateRigidBodyAcceleration(...args);
  }

  /**
   * [1483] calculateRigidBodyAngularVelocity
   * Tính vận tốc góc vật rắn.
   */
  public calculateRigidBodyAngularVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAngularVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAngularVelocity']> {
    return this.physicsCollisionProjectile.calculateRigidBodyAngularVelocity(...args);
  }

  /**
   * [1484] calculateRigidBodyAngularAcceleration
   * Tính gia tốc góc vật rắn.
   */
  public calculateRigidBodyAngularAcceleration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAngularAcceleration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRigidBodyAngularAcceleration']> {
    return this.physicsCollisionProjectile.calculateRigidBodyAngularAcceleration(...args);
  }

  /**
   * [1485] calculateRigidBodyMomentum
   * Tính động lượng vật rắn.
   */
  public calculateRigidBodyMomentum(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRigidBodyMomentum']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRigidBodyMomentum']> {
    return this.physicsCollisionProjectile.calculateRigidBodyMomentum(...args);
  }

  /**
   * [1486] calculateAngularMomentum
   * Tính mô-men động lượng.
   */
  public calculateAngularMomentum(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateAngularMomentum']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateAngularMomentum']> {
    return this.physicsCollisionProjectile.calculateAngularMomentum(...args);
  }

  /**
   * [1487] calculateImpulse
   * Tính xung lực.
   */
  public calculateImpulse(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateImpulse']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateImpulse']> {
    return this.physicsCollisionProjectile.calculateImpulse(...args);
  }

  /**
   * [1488] calculateCollisionImpulse
   * Tính xung lực va chạm.
   */
  public calculateCollisionImpulse(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateCollisionImpulse']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateCollisionImpulse']> {
    return this.physicsCollisionProjectile.calculateCollisionImpulse(...args);
  }

  /**
   * [1489] calculateRestitutionVelocity
   * Tính vận tốc bật lại.
   */
  public calculateRestitutionVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRestitutionVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRestitutionVelocity']> {
    return this.physicsCollisionProjectile.calculateRestitutionVelocity(...args);
  }

  /**
   * [1490] calculateFrictionImpulse
   * Tính xung lực ma sát.
   */
  public calculateFrictionImpulse(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateFrictionImpulse']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateFrictionImpulse']> {
    return this.physicsCollisionProjectile.calculateFrictionImpulse(...args);
  }

  /**
   * [1491] calculateGravityAcceleration
   * Tính gia tốc trọng trường.
   */
  public calculateGravityAcceleration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateGravityAcceleration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateGravityAcceleration']> {
    return this.physicsCollisionProjectile.calculateGravityAcceleration(...args);
  }

  /**
   * [1492] calculateSpringForce
   * Tính lực đàn hồi lò xo.
   */
  public calculateSpringForce(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateSpringForce']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateSpringForce']> {
    return this.physicsCollisionProjectile.calculateSpringForce(...args);
  }

  /**
   * [1493] calculateDampingForce
   * Tính lực giảm chấn.
   */
  public calculateDampingForce(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateDampingForce']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateDampingForce']> {
    return this.physicsCollisionProjectile.calculateDampingForce(...args);
  }

  /**
   * [1494] calculateConstraintForce
   * Tính lực ràng buộc.
   */
  public calculateConstraintForce(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateConstraintForce']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateConstraintForce']> {
    return this.physicsCollisionProjectile.calculateConstraintForce(...args);
  }

  /**
   * [1495] calculateConstraintError
   * Tính sai số ràng buộc.
   */
  public calculateConstraintError(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateConstraintError']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateConstraintError']> {
    return this.physicsCollisionProjectile.calculateConstraintError(...args);
  }

  /**
   * [1496] calculatePhysicsIntegration
   * Tính bước tích phân vật lý.
   */
  public calculatePhysicsIntegration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculatePhysicsIntegration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculatePhysicsIntegration']> {
    return this.physicsCollisionProjectile.calculatePhysicsIntegration(...args);
  }

  /**
   * [1497] calculateVerletIntegration
   * Tính bước tích phân Verlet.
   */
  public calculateVerletIntegration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateVerletIntegration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateVerletIntegration']> {
    return this.physicsCollisionProjectile.calculateVerletIntegration(...args);
  }

  /**
   * [1498] calculateRungeKuttaIntegration
   * Tính bước tích phân Runge–Kutta.
   */
  public calculateRungeKuttaIntegration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateRungeKuttaIntegration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateRungeKuttaIntegration']> {
    return this.physicsCollisionProjectile.calculateRungeKuttaIntegration(...args);
  }

  /**
   * [1499] calculatePhysicsSubsteps
   * Tính số bước phụ vật lý.
   */
  public calculatePhysicsSubsteps(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculatePhysicsSubsteps']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculatePhysicsSubsteps']> {
    return this.physicsCollisionProjectile.calculatePhysicsSubsteps(...args);
  }

  /**
   * [1500] calculatePhysicsStability
   * Tính độ ổn định mô phỏng vật lý.
   */
  public calculatePhysicsStability(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculatePhysicsStability']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculatePhysicsStability']> {
    return this.physicsCollisionProjectile.calculatePhysicsStability(...args);
  }

  /**
   * [1501] getProjectilePosition
   * Lấy tọa độ đạn.
   */
  public getProjectilePosition(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getProjectilePosition']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getProjectilePosition']> {
    return this.physicsCollisionProjectile.getProjectilePosition(...args);
  }

  /**
   * [1502] getProjectileOrigin
   * Lấy điểm xuất phát đạn.
   */
  public getProjectileOrigin(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getProjectileOrigin']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getProjectileOrigin']> {
    return this.physicsCollisionProjectile.getProjectileOrigin(...args);
  }

  /**
   * [1503] getProjectileTarget
   * Lấy điểm mục tiêu của đạn.
   */
  public getProjectileTarget(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getProjectileTarget']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getProjectileTarget']> {
    return this.physicsCollisionProjectile.getProjectileTarget(...args);
  }

  /**
   * [1504] calculateProjectileDirection
   * Tính hướng bay đạn.
   */
  public calculateProjectileDirection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileDirection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileDirection']> {
    return this.physicsCollisionProjectile.calculateProjectileDirection(...args);
  }

  /**
   * [1505] calculateProjectileVelocity
   * Tính vận tốc đạn.
   */
  public calculateProjectileVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileVelocity']> {
    return this.physicsCollisionProjectile.calculateProjectileVelocity(...args);
  }

  /**
   * [1506] calculateProjectileAcceleration
   * Tính gia tốc đạn.
   */
  public calculateProjectileAcceleration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileAcceleration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileAcceleration']> {
    return this.physicsCollisionProjectile.calculateProjectileAcceleration(...args);
  }

  /**
   * [1507] calculateProjectileTrajectory
   * Tính quỹ đạo đạn.
   */
  public calculateProjectileTrajectory(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileTrajectory']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileTrajectory']> {
    return this.physicsCollisionProjectile.calculateProjectileTrajectory(...args);
  }

  /**
   * [1508] calculateProjectileFlightTime
   * Tính thời gian bay đạn.
   */
  public calculateProjectileFlightTime(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileFlightTime']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileFlightTime']> {
    return this.physicsCollisionProjectile.calculateProjectileFlightTime(...args);
  }

  /**
   * [1509] calculateProjectileImpactPoint
   * Tính điểm va chạm đạn.
   */
  public calculateProjectileImpactPoint(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileImpactPoint']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileImpactPoint']> {
    return this.physicsCollisionProjectile.calculateProjectileImpactPoint(...args);
  }

  /**
   * [1510] calculateProjectileImpactNormal
   * Tính pháp tuyến tại điểm va chạm đạn.
   */
  public calculateProjectileImpactNormal(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileImpactNormal']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileImpactNormal']> {
    return this.physicsCollisionProjectile.calculateProjectileImpactNormal(...args);
  }

  /**
   * [1511] calculateProjectileSpreadAngle
   * Tính góc tản mát đạn.
   */
  public calculateProjectileSpreadAngle(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileSpreadAngle']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileSpreadAngle']> {
    return this.physicsCollisionProjectile.calculateProjectileSpreadAngle(...args);
  }

  /**
   * [1512] calculateProjectileDropDistance
   * Tính độ rơi của đạn.
   */
  public calculateProjectileDropDistance(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileDropDistance']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileDropDistance']> {
    return this.physicsCollisionProjectile.calculateProjectileDropDistance(...args);
  }

  /**
   * [1513] calculateProjectileWindDrift
   * Tính độ lệch đạn do gió.
   */
  public calculateProjectileWindDrift(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileWindDrift']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileWindDrift']> {
    return this.physicsCollisionProjectile.calculateProjectileWindDrift(...args);
  }

  /**
   * [1514] calculateProjectileCollision
   * Kiểm tra va chạm đạn.
   */
  public calculateProjectileCollision(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileCollision']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileCollision']> {
    return this.physicsCollisionProjectile.calculateProjectileCollision(...args);
  }

  /**
   * [1515] calculateProjectileDistanceToTarget
   * Tính khoảng cách đạn đến mục tiêu.
   */
  public calculateProjectileDistanceToTarget(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateProjectileDistanceToTarget']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateProjectileDistanceToTarget']> {
    return this.physicsCollisionProjectile.calculateProjectileDistanceToTarget(...args);
  }

  /**
   * [1516] getItemPosition
   * Lấy tọa độ vật phẩm.
   */
  public getItemPosition(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getItemPosition']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getItemPosition']> {
    return this.physicsCollisionProjectile.getItemPosition(...args);
  }

  /**
   * [1517] getItemCenter
   * Lấy tâm vật phẩm.
   */
  public getItemCenter(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getItemCenter']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getItemCenter']> {
    return this.physicsCollisionProjectile.getItemCenter(...args);
  }

  /**
   * [1518] getItemRotation
   * Lấy góc quay vật phẩm.
   */
  public getItemRotation(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getItemRotation']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getItemRotation']> {
    return this.physicsCollisionProjectile.getItemRotation(...args);
  }

  /**
   * [1519] getItemPickupPosition
   * Lấy vị trí có thể nhặt vật phẩm.
   */
  public getItemPickupPosition(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['getItemPickupPosition']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['getItemPickupPosition']> {
    return this.physicsCollisionProjectile.getItemPickupPosition(...args);
  }

  /**
   * [1520] calculateItemDistanceToPlayer
   * Tính khoảng cách vật phẩm đến người chơi.
   */
  public calculateItemDistanceToPlayer(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemDistanceToPlayer']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemDistanceToPlayer']> {
    return this.physicsCollisionProjectile.calculateItemDistanceToPlayer(...args);
  }

  /**
   * [1521] calculateItemPickupRange
   * Tính phạm vi nhặt vật phẩm.
   */
  public calculateItemPickupRange(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemPickupRange']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemPickupRange']> {
    return this.physicsCollisionProjectile.calculateItemPickupRange(...args);
  }

  /**
   * [1522] calculateItemPickupOffset
   * Tính độ lệch vị trí nhặt vật phẩm.
   */
  public calculateItemPickupOffset(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemPickupOffset']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemPickupOffset']> {
    return this.physicsCollisionProjectile.calculateItemPickupOffset(...args);
  }

  /**
   * [1523] calculateItemMagnetDirection
   * Tính hướng hút vật phẩm.
   */
  public calculateItemMagnetDirection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemMagnetDirection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemMagnetDirection']> {
    return this.physicsCollisionProjectile.calculateItemMagnetDirection(...args);
  }

  /**
   * [1524] calculateItemMagnetVelocity
   * Tính vận tốc hút vật phẩm.
   */
  public calculateItemMagnetVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemMagnetVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemMagnetVelocity']> {
    return this.physicsCollisionProjectile.calculateItemMagnetVelocity(...args);
  }

  /**
   * [1525] calculateItemHoverHeight
   * Tính độ cao lơ lửng vật phẩm.
   */
  public calculateItemHoverHeight(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemHoverHeight']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemHoverHeight']> {
    return this.physicsCollisionProjectile.calculateItemHoverHeight(...args);
  }

  /**
   * [1526] calculateItemRotationSpeed
   * Tính tốc độ quay vật phẩm.
   */
  public calculateItemRotationSpeed(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemRotationSpeed']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemRotationSpeed']> {
    return this.physicsCollisionProjectile.calculateItemRotationSpeed(...args);
  }

  /**
   * [1527] calculateItemBobAmplitude
   * Tính biên độ nhấp nhô vật phẩm.
   */
  public calculateItemBobAmplitude(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemBobAmplitude']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemBobAmplitude']> {
    return this.physicsCollisionProjectile.calculateItemBobAmplitude(...args);
  }

  /**
   * [1528] calculateItemBobFrequency
   * Tính tần số nhấp nhô vật phẩm.
   */
  public calculateItemBobFrequency(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateItemBobFrequency']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateItemBobFrequency']> {
    return this.physicsCollisionProjectile.calculateItemBobFrequency(...args);
  }

  /**
   * [1529] calculateParticlePosition
   * Tính tọa độ hạt hiệu ứng.
   */
  public calculateParticlePosition(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticlePosition']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticlePosition']> {
    return this.physicsCollisionProjectile.calculateParticlePosition(...args);
  }

  /**
   * [1530] calculateParticleVelocity
   * Tính vận tốc hạt hiệu ứng.
   */
  public calculateParticleVelocity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleVelocity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleVelocity']> {
    return this.physicsCollisionProjectile.calculateParticleVelocity(...args);
  }

  /**
   * [1531] calculateParticleAcceleration
   * Tính gia tốc hạt hiệu ứng.
   */
  public calculateParticleAcceleration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleAcceleration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleAcceleration']> {
    return this.physicsCollisionProjectile.calculateParticleAcceleration(...args);
  }

  /**
   * [1532] calculateParticleLifetime
   * Tính thời gian tồn tại hạt.
   */
  public calculateParticleLifetime(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleLifetime']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleLifetime']> {
    return this.physicsCollisionProjectile.calculateParticleLifetime(...args);
  }

  /**
   * [1533] calculateParticleScale
   * Tính tỷ lệ kích thước hạt.
   */
  public calculateParticleScale(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleScale']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleScale']> {
    return this.physicsCollisionProjectile.calculateParticleScale(...args);
  }

  /**
   * [1534] calculateParticleRotation
   * Tính góc quay hạt.
   */
  public calculateParticleRotation(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleRotation']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleRotation']> {
    return this.physicsCollisionProjectile.calculateParticleRotation(...args);
  }

  /**
   * [1535] calculateParticleColorInterpolation
   * Tính nội suy màu hạt.
   */
  public calculateParticleColorInterpolation(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleColorInterpolation']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleColorInterpolation']> {
    return this.physicsCollisionProjectile.calculateParticleColorInterpolation(...args);
  }

  /**
   * [1536] calculateParticleOpacity
   * Tính độ trong suốt hạt.
   */
  public calculateParticleOpacity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleOpacity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleOpacity']> {
    return this.physicsCollisionProjectile.calculateParticleOpacity(...args);
  }

  /**
   * [1537] calculateParticleCollision
   * Kiểm tra va chạm hạt.
   */
  public calculateParticleCollision(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleCollision']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleCollision']> {
    return this.physicsCollisionProjectile.calculateParticleCollision(...args);
  }

  /**
   * [1538] calculateParticleAttractorForce
   * Tính lực hút tác động lên hạt.
   */
  public calculateParticleAttractorForce(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleAttractorForce']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleAttractorForce']> {
    return this.physicsCollisionProjectile.calculateParticleAttractorForce(...args);
  }

  /**
   * [1539] calculateParticleFieldDirection
   * Tính hướng trường tác động lên hạt.
   */
  public calculateParticleFieldDirection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateParticleFieldDirection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateParticleFieldDirection']> {
    return this.physicsCollisionProjectile.calculateParticleFieldDirection(...args);
  }

  /**
   * [1540] calculateEffectOrigin
   * Tính điểm xuất phát hiệu ứng.
   */
  public calculateEffectOrigin(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectOrigin']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectOrigin']> {
    return this.physicsCollisionProjectile.calculateEffectOrigin(...args);
  }

  /**
   * [1541] calculateEffectDirection
   * Tính hướng hiệu ứng.
   */
  public calculateEffectDirection(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectDirection']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectDirection']> {
    return this.physicsCollisionProjectile.calculateEffectDirection(...args);
  }

  /**
   * [1542] calculateEffectRadius
   * Tính bán kính hiệu ứng.
   */
  public calculateEffectRadius(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectRadius']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectRadius']> {
    return this.physicsCollisionProjectile.calculateEffectRadius(...args);
  }

  /**
   * [1543] calculateEffectExpansion
   * Tính độ mở rộng hiệu ứng.
   */
  public calculateEffectExpansion(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectExpansion']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectExpansion']> {
    return this.physicsCollisionProjectile.calculateEffectExpansion(...args);
  }

  /**
   * [1544] calculateEffectFalloff
   * Tính mức suy giảm hiệu ứng theo khoảng cách.
   */
  public calculateEffectFalloff(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectFalloff']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectFalloff']> {
    return this.physicsCollisionProjectile.calculateEffectFalloff(...args);
  }

  /**
   * [1545] calculateEffectDuration
   * Tính thời lượng hiệu ứng.
   */
  public calculateEffectDuration(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectDuration']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectDuration']> {
    return this.physicsCollisionProjectile.calculateEffectDuration(...args);
  }

  /**
   * [1546] calculateEffectIntensity
   * Tính cường độ hiệu ứng.
   */
  public calculateEffectIntensity(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectIntensity']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectIntensity']> {
    return this.physicsCollisionProjectile.calculateEffectIntensity(...args);
  }

  /**
   * [1547] calculateEffectOcclusion
   * Kiểm tra hiệu ứng bị che khuất.
   */
  public calculateEffectOcclusion(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectOcclusion']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectOcclusion']> {
    return this.physicsCollisionProjectile.calculateEffectOcclusion(...args);
  }

  /**
   * [1548] calculateEffectDistanceToCamera
   * Tính khoảng cách hiệu ứng đến camera.
   */
  public calculateEffectDistanceToCamera(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectDistanceToCamera']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectDistanceToCamera']> {
    return this.physicsCollisionProjectile.calculateEffectDistanceToCamera(...args);
  }

  /**
   * [1549] calculateEffectScreenBounds
   * Tính giới hạn hiệu ứng trên màn hình.
   */
  public calculateEffectScreenBounds(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectScreenBounds']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectScreenBounds']> {
    return this.physicsCollisionProjectile.calculateEffectScreenBounds(...args);
  }

  /**
   * [1550] calculateEffectLOD
   * Tính cấp độ chi tiết hiệu ứng.
   */
  public calculateEffectLOD(
    ...args: Parameters<PhysicsCollisionProjectileSubsystem['calculateEffectLOD']>
  ): ReturnType<PhysicsCollisionProjectileSubsystem['calculateEffectLOD']> {
    return this.physicsCollisionProjectile.calculateEffectLOD(...args);
  }

  /**
   * [1551] calculateLinearInterpolation
   * Tính nội suy tuyến tính.
   */
  public calculateLinearInterpolation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLinearInterpolation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLinearInterpolation']> {
    return this.curvesMatricesEnvironment.calculateLinearInterpolation(...args);
  }

  /**
   * [1552] calculateBilinearInterpolation
   * Tính nội suy song tuyến.
   */
  public calculateBilinearInterpolation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBilinearInterpolation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBilinearInterpolation']> {
    return this.curvesMatricesEnvironment.calculateBilinearInterpolation(...args);
  }

  /**
   * [1553] calculateTrilinearInterpolation
   * Tính nội suy tam tuyến.
   */
  public calculateTrilinearInterpolation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrilinearInterpolation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrilinearInterpolation']> {
    return this.curvesMatricesEnvironment.calculateTrilinearInterpolation(...args);
  }

  /**
   * [1554] calculateCubicInterpolation
   * Tính nội suy bậc ba.
   */
  public calculateCubicInterpolation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCubicInterpolation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCubicInterpolation']> {
    return this.curvesMatricesEnvironment.calculateCubicInterpolation(...args);
  }

  /**
   * [1555] calculateCatmullRomSpline
   * Tính điểm trên spline Catmull–Rom.
   */
  public calculateCatmullRomSpline(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCatmullRomSpline']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCatmullRomSpline']> {
    return this.curvesMatricesEnvironment.calculateCatmullRomSpline(...args);
  }

  /**
   * [1556] calculateBezierCurve
   * Tính điểm trên đường cong Bézier.
   */
  public calculateBezierCurve(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBezierCurve']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBezierCurve']> {
    return this.curvesMatricesEnvironment.calculateBezierCurve(...args);
  }

  /**
   * [1557] calculateQuadraticBezier
   * Tính điểm trên Bézier bậc hai.
   */
  public calculateQuadraticBezier(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateQuadraticBezier']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateQuadraticBezier']> {
    return this.curvesMatricesEnvironment.calculateQuadraticBezier(...args);
  }

  /**
   * [1558] calculateCubicBezier
   * Tính điểm trên Bézier bậc ba.
   */
  public calculateCubicBezier(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCubicBezier']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCubicBezier']> {
    return this.curvesMatricesEnvironment.calculateCubicBezier(...args);
  }

  /**
   * [1559] calculateBezierTangent
   * Tính tiếp tuyến đường Bézier.
   */
  public calculateBezierTangent(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBezierTangent']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBezierTangent']> {
    return this.curvesMatricesEnvironment.calculateBezierTangent(...args);
  }

  /**
   * [1560] calculateBezierNormal
   * Tính pháp tuyến đường Bézier.
   */
  public calculateBezierNormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBezierNormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBezierNormal']> {
    return this.curvesMatricesEnvironment.calculateBezierNormal(...args);
  }

  /**
   * [1561] calculateBezierCurvature
   * Tính độ cong đường Bézier.
   */
  public calculateBezierCurvature(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBezierCurvature']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBezierCurvature']> {
    return this.curvesMatricesEnvironment.calculateBezierCurvature(...args);
  }

  /**
   * [1562] calculateSplinePosition
   * Tính vị trí trên spline.
   */
  public calculateSplinePosition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplinePosition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplinePosition']> {
    return this.curvesMatricesEnvironment.calculateSplinePosition(...args);
  }

  /**
   * [1563] calculateSplineTangent
   * Tính tiếp tuyến spline.
   */
  public calculateSplineTangent(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineTangent']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineTangent']> {
    return this.curvesMatricesEnvironment.calculateSplineTangent(...args);
  }

  /**
   * [1564] calculateSplineNormal
   * Tính pháp tuyến spline.
   */
  public calculateSplineNormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineNormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineNormal']> {
    return this.curvesMatricesEnvironment.calculateSplineNormal(...args);
  }

  /**
   * [1565] calculateSplineBinormal
   * Tính nhị pháp tuyến spline.
   */
  public calculateSplineBinormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineBinormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineBinormal']> {
    return this.curvesMatricesEnvironment.calculateSplineBinormal(...args);
  }

  /**
   * [1566] calculateSplineCurvature
   * Tính độ cong spline.
   */
  public calculateSplineCurvature(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineCurvature']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineCurvature']> {
    return this.curvesMatricesEnvironment.calculateSplineCurvature(...args);
  }

  /**
   * [1567] calculateSplineArcLength
   * Tính độ dài cung spline.
   */
  public calculateSplineArcLength(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineArcLength']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineArcLength']> {
    return this.curvesMatricesEnvironment.calculateSplineArcLength(...args);
  }

  /**
   * [1568] calculateSplineParameterAtDistance
   * Tính tham số spline theo khoảng cách.
   */
  public calculateSplineParameterAtDistance(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineParameterAtDistance']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineParameterAtDistance']> {
    return this.curvesMatricesEnvironment.calculateSplineParameterAtDistance(...args);
  }

  /**
   * [1569] calculateSplineClosestPoint
   * Tìm điểm gần nhất trên spline.
   */
  public calculateSplineClosestPoint(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineClosestPoint']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineClosestPoint']> {
    return this.curvesMatricesEnvironment.calculateSplineClosestPoint(...args);
  }

  /**
   * [1570] calculateSplineProjection
   * Chiếu điểm lên spline.
   */
  public calculateSplineProjection(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineProjection']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineProjection']> {
    return this.curvesMatricesEnvironment.calculateSplineProjection(...args);
  }

  /**
   * [1571] calculateSplineUniformSampling
   * Lấy mẫu spline đồng đều.
   */
  public calculateSplineUniformSampling(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineUniformSampling']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineUniformSampling']> {
    return this.curvesMatricesEnvironment.calculateSplineUniformSampling(...args);
  }

  /**
   * [1572] calculateSplineFrame
   * Tính hệ trục cục bộ trên spline.
   */
  public calculateSplineFrame(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSplineFrame']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSplineFrame']> {
    return this.curvesMatricesEnvironment.calculateSplineFrame(...args);
  }

  /**
   * [1573] calculateTrajectoryPosition
   * Tính vị trí trên quỹ đạo.
   */
  public calculateTrajectoryPosition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryPosition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryPosition']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryPosition(...args);
  }

  /**
   * [1574] calculateTrajectoryVelocity
   * Tính vận tốc trên quỹ đạo.
   */
  public calculateTrajectoryVelocity(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryVelocity']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryVelocity']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryVelocity(...args);
  }

  /**
   * [1575] calculateTrajectoryAcceleration
   * Tính gia tốc trên quỹ đạo.
   */
  public calculateTrajectoryAcceleration(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryAcceleration']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryAcceleration']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryAcceleration(...args);
  }

  /**
   * [1576] calculateTrajectoryCurvature
   * Tính độ cong quỹ đạo.
   */
  public calculateTrajectoryCurvature(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryCurvature']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryCurvature']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryCurvature(...args);
  }

  /**
   * [1577] calculateTrajectoryTangent
   * Tính tiếp tuyến quỹ đạo.
   */
  public calculateTrajectoryTangent(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryTangent']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryTangent']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryTangent(...args);
  }

  /**
   * [1578] calculateTrajectoryNormal
   * Tính pháp tuyến quỹ đạo.
   */
  public calculateTrajectoryNormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryNormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryNormal']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryNormal(...args);
  }

  /**
   * [1579] calculateTrajectoryBinormal
   * Tính nhị pháp tuyến quỹ đạo.
   */
  public calculateTrajectoryBinormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryBinormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryBinormal']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryBinormal(...args);
  }

  /**
   * [1580] calculateTrajectoryClosestPoint
   * Tìm điểm gần nhất trên quỹ đạo.
   */
  public calculateTrajectoryClosestPoint(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryClosestPoint']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryClosestPoint']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryClosestPoint(...args);
  }

  /**
   * [1581] calculateTrajectoryDeviation
   * Tính sai lệch quỹ đạo.
   */
  public calculateTrajectoryDeviation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryDeviation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryDeviation']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryDeviation(...args);
  }

  /**
   * [1582] calculateTrajectoryLength
   * Tính tổng độ dài quỹ đạo.
   */
  public calculateTrajectoryLength(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryLength']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryLength']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryLength(...args);
  }

  /**
   * [1583] calculateTrajectoryDuration
   * Tính thời lượng quỹ đạo.
   */
  public calculateTrajectoryDuration(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryDuration']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryDuration']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryDuration(...args);
  }

  /**
   * [1584] calculateTrajectorySpeedProfile
   * Tính biểu đồ tốc độ quỹ đạo.
   */
  public calculateTrajectorySpeedProfile(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectorySpeedProfile']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectorySpeedProfile']> {
    return this.curvesMatricesEnvironment.calculateTrajectorySpeedProfile(...args);
  }

  /**
   * [1585] calculateTrajectoryTimeParameterization
   * Tính tham số thời gian quỹ đạo.
   */
  public calculateTrajectoryTimeParameterization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryTimeParameterization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryTimeParameterization']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryTimeParameterization(...args);
  }

  /**
   * [1586] calculateTrajectorySmoothing
   * Làm mượt quỹ đạo.
   */
  public calculateTrajectorySmoothing(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectorySmoothing']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectorySmoothing']> {
    return this.curvesMatricesEnvironment.calculateTrajectorySmoothing(...args);
  }

  /**
   * [1587] calculateTrajectoryOptimization
   * Tối ưu quỹ đạo.
   */
  public calculateTrajectoryOptimization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryOptimization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryOptimization']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryOptimization(...args);
  }

  /**
   * [1588] calculateTrajectoryCollisionAvoidance
   * Tính quỹ đạo tránh va chạm.
   */
  public calculateTrajectoryCollisionAvoidance(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryCollisionAvoidance']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryCollisionAvoidance']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryCollisionAvoidance(...args);
  }

  /**
   * [1589] calculateTrajectoryReachability
   * Kiểm tra khả năng đạt quỹ đạo.
   */
  public calculateTrajectoryReachability(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryReachability']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryReachability']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryReachability(...args);
  }

  /**
   * [1590] calculateTrajectoryPrediction
   * Dự đoán quỹ đạo tương lai.
   */
  public calculateTrajectoryPrediction(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryPrediction']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTrajectoryPrediction']> {
    return this.curvesMatricesEnvironment.calculateTrajectoryPrediction(...args);
  }

  /**
   * [1591] calculateMatrixMultiplication
   * Tính phép nhân ma trận.
   */
  public calculateMatrixMultiplication(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixMultiplication']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixMultiplication']> {
    return this.curvesMatricesEnvironment.calculateMatrixMultiplication(...args);
  }

  /**
   * [1592] calculateMatrixInverse
   * Tính ma trận nghịch đảo.
   */
  public calculateMatrixInverse(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixInverse']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixInverse']> {
    return this.curvesMatricesEnvironment.calculateMatrixInverse(...args);
  }

  /**
   * [1593] calculateMatrixTranspose
   * Tính ma trận chuyển vị.
   */
  public calculateMatrixTranspose(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixTranspose']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixTranspose']> {
    return this.curvesMatricesEnvironment.calculateMatrixTranspose(...args);
  }

  /**
   * [1594] calculateMatrixDeterminant
   * Tính định thức ma trận.
   */
  public calculateMatrixDeterminant(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixDeterminant']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixDeterminant']> {
    return this.curvesMatricesEnvironment.calculateMatrixDeterminant(...args);
  }

  /**
   * [1595] calculateMatrixTrace
   * Tính vết ma trận.
   */
  public calculateMatrixTrace(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixTrace']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixTrace']> {
    return this.curvesMatricesEnvironment.calculateMatrixTrace(...args);
  }

  /**
   * [1596] calculateMatrixDecomposition
   * Phân rã ma trận.
   */
  public calculateMatrixDecomposition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixDecomposition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixDecomposition']> {
    return this.curvesMatricesEnvironment.calculateMatrixDecomposition(...args);
  }

  /**
   * [1597] calculateMatrixOrthogonalization
   * Trực giao hóa ma trận.
   */
  public calculateMatrixOrthogonalization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixOrthogonalization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixOrthogonalization']> {
    return this.curvesMatricesEnvironment.calculateMatrixOrthogonalization(...args);
  }

  /**
   * [1598] calculateMatrixOrthonormalization
   * Chuẩn trực giao ma trận.
   */
  public calculateMatrixOrthonormalization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMatrixOrthonormalization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMatrixOrthonormalization']> {
    return this.curvesMatricesEnvironment.calculateMatrixOrthonormalization(...args);
  }

  /**
   * [1599] calculateAffineTransform
   * Tính phép biến đổi affine.
   */
  public calculateAffineTransform(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateAffineTransform']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateAffineTransform']> {
    return this.curvesMatricesEnvironment.calculateAffineTransform(...args);
  }

  /**
   * [1600] calculateHomogeneousTransform
   * Tính phép biến đổi tọa độ thuần nhất.
   */
  public calculateHomogeneousTransform(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateHomogeneousTransform']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateHomogeneousTransform']> {
    return this.curvesMatricesEnvironment.calculateHomogeneousTransform(...args);
  }

  /**
   * [1601] calculateTranslationMatrix
   * Tính ma trận tịnh tiến.
   */
  public calculateTranslationMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTranslationMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTranslationMatrix']> {
    return this.curvesMatricesEnvironment.calculateTranslationMatrix(...args);
  }

  /**
   * [1602] calculateScaleMatrix
   * Tính ma trận tỷ lệ.
   */
  public calculateScaleMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateScaleMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateScaleMatrix']> {
    return this.curvesMatricesEnvironment.calculateScaleMatrix(...args);
  }

  /**
   * [1603] calculateRotationXMatrix
   * Tính ma trận quay quanh trục X.
   */
  public calculateRotationXMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateRotationXMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateRotationXMatrix']> {
    return this.curvesMatricesEnvironment.calculateRotationXMatrix(...args);
  }

  /**
   * [1604] calculateRotationYMatrix
   * Tính ma trận quay quanh trục Y.
   */
  public calculateRotationYMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateRotationYMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateRotationYMatrix']> {
    return this.curvesMatricesEnvironment.calculateRotationYMatrix(...args);
  }

  /**
   * [1605] calculateRotationZMatrix
   * Tính ma trận quay quanh trục Z.
   */
  public calculateRotationZMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateRotationZMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateRotationZMatrix']> {
    return this.curvesMatricesEnvironment.calculateRotationZMatrix(...args);
  }

  /**
   * [1606] calculateNormalMatrix
   * Tính ma trận pháp tuyến.
   */
  public calculateNormalMatrix(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateNormalMatrix']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateNormalMatrix']> {
    return this.curvesMatricesEnvironment.calculateNormalMatrix(...args);
  }

  /**
   * [1607] calculateTransformHierarchy
   * Tính chuỗi biến đổi phân cấp.
   */
  public calculateTransformHierarchy(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformHierarchy']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformHierarchy']> {
    return this.curvesMatricesEnvironment.calculateTransformHierarchy(...args);
  }

  /**
   * [1608] calculateTransformComposition
   * Tính phép hợp thành biến đổi.
   */
  public calculateTransformComposition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformComposition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformComposition']> {
    return this.curvesMatricesEnvironment.calculateTransformComposition(...args);
  }

  /**
   * [1609] calculateTransformDecomposition
   * Tách phép biến đổi thành thành phần.
   */
  public calculateTransformDecomposition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformDecomposition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformDecomposition']> {
    return this.curvesMatricesEnvironment.calculateTransformDecomposition(...args);
  }

  /**
   * [1610] calculateTransformInterpolation
   * Nội suy phép biến đổi.
   */
  public calculateTransformInterpolation(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformInterpolation']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformInterpolation']> {
    return this.curvesMatricesEnvironment.calculateTransformInterpolation(...args);
  }

  /**
   * [1611] calculateTransformError
   * Tính sai lệch phép biến đổi.
   */
  public calculateTransformError(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformError']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformError']> {
    return this.curvesMatricesEnvironment.calculateTransformError(...args);
  }

  /**
   * [1612] calculateCoordinateBasis
   * Tính cơ sở tọa độ.
   */
  public calculateCoordinateBasis(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateBasis']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateBasis']> {
    return this.curvesMatricesEnvironment.calculateCoordinateBasis(...args);
  }

  /**
   * [1613] calculateCoordinateConversion
   * Chuyển đổi hệ tọa độ.
   */
  public calculateCoordinateConversion(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateConversion']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateConversion']> {
    return this.curvesMatricesEnvironment.calculateCoordinateConversion(...args);
  }

  /**
   * [1614] calculateCoordinateNormalization
   * Chuẩn hóa tọa độ.
   */
  public calculateCoordinateNormalization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateNormalization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateNormalization']> {
    return this.curvesMatricesEnvironment.calculateCoordinateNormalization(...args);
  }

  /**
   * [1615] calculateCoordinateQuantization
   * Lượng tử hóa tọa độ.
   */
  public calculateCoordinateQuantization(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateQuantization']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateQuantization']> {
    return this.curvesMatricesEnvironment.calculateCoordinateQuantization(...args);
  }

  /**
   * [1616] calculateCoordinateClamping
   * Giới hạn tọa độ.
   */
  public calculateCoordinateClamping(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateClamping']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateClamping']> {
    return this.curvesMatricesEnvironment.calculateCoordinateClamping(...args);
  }

  /**
   * [1617] calculateCoordinateWrapping
   * Cuộn tọa độ theo chu kỳ.
   */
  public calculateCoordinateWrapping(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateWrapping']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateWrapping']> {
    return this.curvesMatricesEnvironment.calculateCoordinateWrapping(...args);
  }

  /**
   * [1618] calculateCoordinateSnapping
   * Căn tọa độ theo lưới.
   */
  public calculateCoordinateSnapping(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateSnapping']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateSnapping']> {
    return this.curvesMatricesEnvironment.calculateCoordinateSnapping(...args);
  }

  /**
   * [1619] calculateCoordinateRounding
   * Làm tròn tọa độ.
   */
  public calculateCoordinateRounding(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinateRounding']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinateRounding']> {
    return this.curvesMatricesEnvironment.calculateCoordinateRounding(...args);
  }

  /**
   * [1620] calculateCoordinatePrecisionError
   * Tính sai số độ chính xác tọa độ.
   */
  public calculateCoordinatePrecisionError(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCoordinatePrecisionError']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCoordinatePrecisionError']> {
    return this.curvesMatricesEnvironment.calculateCoordinatePrecisionError(...args);
  }

  /**
   * [1621] getGridCellPosition
   * Lấy tọa độ ô lưới.
   */
  public getGridCellPosition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['getGridCellPosition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['getGridCellPosition']> {
    return this.curvesMatricesEnvironment.getGridCellPosition(...args);
  }

  /**
   * [1622] getGridCellCenter
   * Lấy tâm ô lưới.
   */
  public getGridCellCenter(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['getGridCellCenter']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['getGridCellCenter']> {
    return this.curvesMatricesEnvironment.getGridCellCenter(...args);
  }

  /**
   * [1623] getGridCellBounds
   * Lấy giới hạn ô lưới.
   */
  public getGridCellBounds(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['getGridCellBounds']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['getGridCellBounds']> {
    return this.curvesMatricesEnvironment.getGridCellBounds(...args);
  }

  /**
   * [1624] calculateGridCellIndex
   * Tính chỉ số ô lưới.
   */
  public calculateGridCellIndex(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridCellIndex']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridCellIndex']> {
    return this.curvesMatricesEnvironment.calculateGridCellIndex(...args);
  }

  /**
   * [1625] calculateGridCoordinates
   * Tính tọa độ lưới.
   */
  public calculateGridCoordinates(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridCoordinates']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridCoordinates']> {
    return this.curvesMatricesEnvironment.calculateGridCoordinates(...args);
  }

  /**
   * [1626] calculateGridDistance
   * Tính khoảng cách trên lưới.
   */
  public calculateGridDistance(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridDistance']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridDistance']> {
    return this.curvesMatricesEnvironment.calculateGridDistance(...args);
  }

  /**
   * [1627] calculateGridNeighborCells
   * Tìm các ô lân cận.
   */
  public calculateGridNeighborCells(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridNeighborCells']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridNeighborCells']> {
    return this.curvesMatricesEnvironment.calculateGridNeighborCells(...args);
  }

  /**
   * [1628] calculateGridWorldPosition
   * Chuyển ô lưới sang tọa độ thế giới.
   */
  public calculateGridWorldPosition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridWorldPosition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridWorldPosition']> {
    return this.curvesMatricesEnvironment.calculateGridWorldPosition(...args);
  }

  /**
   * [1629] calculateGridWorldToCell
   * Chuyển tọa độ thế giới sang ô lưới.
   */
  public calculateGridWorldToCell(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridWorldToCell']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridWorldToCell']> {
    return this.curvesMatricesEnvironment.calculateGridWorldToCell(...args);
  }

  /**
   * [1630] calculateGridOccupancy
   * Tính trạng thái chiếm dụng lưới.
   */
  public calculateGridOccupancy(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridOccupancy']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridOccupancy']> {
    return this.curvesMatricesEnvironment.calculateGridOccupancy(...args);
  }

  /**
   * [1631] calculateGridTraversalCost
   * Tính chi phí đi qua ô lưới.
   */
  public calculateGridTraversalCost(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridTraversalCost']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridTraversalCost']> {
    return this.curvesMatricesEnvironment.calculateGridTraversalCost(...args);
  }

  /**
   * [1632] calculateGridPathDistance
   * Tính độ dài đường đi trên lưới.
   */
  public calculateGridPathDistance(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateGridPathDistance']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateGridPathDistance']> {
    return this.curvesMatricesEnvironment.calculateGridPathDistance(...args);
  }

  /**
   * [1633] calculateTerrainHeight
   * Tính độ cao địa hình.
   */
  public calculateTerrainHeight(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainHeight']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainHeight']> {
    return this.curvesMatricesEnvironment.calculateTerrainHeight(...args);
  }

  /**
   * [1634] calculateTerrainNormal
   * Tính pháp tuyến địa hình.
   */
  public calculateTerrainNormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainNormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainNormal']> {
    return this.curvesMatricesEnvironment.calculateTerrainNormal(...args);
  }

  /**
   * [1635] calculateTerrainSlope
   * Tính độ dốc địa hình.
   */
  public calculateTerrainSlope(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainSlope']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainSlope']> {
    return this.curvesMatricesEnvironment.calculateTerrainSlope(...args);
  }

  /**
   * [1636] calculateTerrainCurvature
   * Tính độ cong địa hình.
   */
  public calculateTerrainCurvature(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainCurvature']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainCurvature']> {
    return this.curvesMatricesEnvironment.calculateTerrainCurvature(...args);
  }

  /**
   * [1637] calculateTerrainSurfaceArea
   * Tính diện tích bề mặt địa hình.
   */
  public calculateTerrainSurfaceArea(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainSurfaceArea']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainSurfaceArea']> {
    return this.curvesMatricesEnvironment.calculateTerrainSurfaceArea(...args);
  }

  /**
   * [1638] calculateTerrainVolume
   * Tính thể tích địa hình.
   */
  public calculateTerrainVolume(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainVolume']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainVolume']> {
    return this.curvesMatricesEnvironment.calculateTerrainVolume(...args);
  }

  /**
   * [1639] calculateTerrainBounds
   * Tính giới hạn địa hình.
   */
  public calculateTerrainBounds(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainBounds']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainBounds']> {
    return this.curvesMatricesEnvironment.calculateTerrainBounds(...args);
  }

  /**
   * [1640] calculateTerrainClosestPoint
   * Tìm điểm gần nhất trên địa hình.
   */
  public calculateTerrainClosestPoint(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainClosestPoint']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainClosestPoint']> {
    return this.curvesMatricesEnvironment.calculateTerrainClosestPoint(...args);
  }

  /**
   * [1641] calculateTerrainRayIntersection
   * Tính giao điểm tia với địa hình.
   */
  public calculateTerrainRayIntersection(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainRayIntersection']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainRayIntersection']> {
    return this.curvesMatricesEnvironment.calculateTerrainRayIntersection(...args);
  }

  /**
   * [1642] calculateTerrainCollision
   * Kiểm tra va chạm địa hình.
   */
  public calculateTerrainCollision(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainCollision']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainCollision']> {
    return this.curvesMatricesEnvironment.calculateTerrainCollision(...args);
  }

  /**
   * [1643] calculateTerrainGroundClearance
   * Tính khoảng cách đến địa hình.
   */
  public calculateTerrainGroundClearance(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainGroundClearance']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainGroundClearance']> {
    return this.curvesMatricesEnvironment.calculateTerrainGroundClearance(...args);
  }

  /**
   * [1644] calculateTerrainPathSlope
   * Tính độ dốc đường đi trên địa hình.
   */
  public calculateTerrainPathSlope(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainPathSlope']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainPathSlope']> {
    return this.curvesMatricesEnvironment.calculateTerrainPathSlope(...args);
  }

  /**
   * [1645] calculateTerrainNavigationCost
   * Tính chi phí điều hướng trên địa hình.
   */
  public calculateTerrainNavigationCost(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTerrainNavigationCost']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTerrainNavigationCost']> {
    return this.curvesMatricesEnvironment.calculateTerrainNavigationCost(...args);
  }

  /**
   * [1646] calculateWaterSurfaceHeight
   * Tính độ cao mặt nước.
   */
  public calculateWaterSurfaceHeight(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateWaterSurfaceHeight']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateWaterSurfaceHeight']> {
    return this.curvesMatricesEnvironment.calculateWaterSurfaceHeight(...args);
  }

  /**
   * [1647] calculateWaterSurfaceNormal
   * Tính pháp tuyến mặt nước.
   */
  public calculateWaterSurfaceNormal(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateWaterSurfaceNormal']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateWaterSurfaceNormal']> {
    return this.curvesMatricesEnvironment.calculateWaterSurfaceNormal(...args);
  }

  /**
   * [1648] calculateWaterDepth
   * Tính độ sâu nước.
   */
  public calculateWaterDepth(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateWaterDepth']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateWaterDepth']> {
    return this.curvesMatricesEnvironment.calculateWaterDepth(...args);
  }

  /**
   * [1649] calculateWaterBuoyancy
   * Tính lực nổi trong nước.
   */
  public calculateWaterBuoyancy(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateWaterBuoyancy']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateWaterBuoyancy']> {
    return this.curvesMatricesEnvironment.calculateWaterBuoyancy(...args);
  }

  /**
   * [1650] calculateEnvironmentWindVector
   * Tính vector gió môi trường.
   */
  public calculateEnvironmentWindVector(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateEnvironmentWindVector']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateEnvironmentWindVector']> {
    return this.curvesMatricesEnvironment.calculateEnvironmentWindVector(...args);
  }

  /**
   * [1651] calculateObjectLOD
   * Tính cấp độ chi tiết vật thể.
   */
  public calculateObjectLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateObjectLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateObjectLOD']> {
    return this.curvesMatricesEnvironment.calculateObjectLOD(...args);
  }

  /**
   * [1652] calculateCharacterLOD
   * Tính cấp độ chi tiết nhân vật.
   */
  public calculateCharacterLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCharacterLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCharacterLOD']> {
    return this.curvesMatricesEnvironment.calculateCharacterLOD(...args);
  }

  /**
   * [1653] calculateMeshLOD
   * Tính cấp độ chi tiết mesh.
   */
  public calculateMeshLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateMeshLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateMeshLOD']> {
    return this.curvesMatricesEnvironment.calculateMeshLOD(...args);
  }

  /**
   * [1654] calculateAnimationLOD
   * Tính cấp độ chi tiết hoạt ảnh.
   */
  public calculateAnimationLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateAnimationLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateAnimationLOD']> {
    return this.curvesMatricesEnvironment.calculateAnimationLOD(...args);
  }

  /**
   * [1655] calculateSkeletonLOD
   * Tính cấp độ chi tiết bộ xương.
   */
  public calculateSkeletonLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSkeletonLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSkeletonLOD']> {
    return this.curvesMatricesEnvironment.calculateSkeletonLOD(...args);
  }

  /**
   * [1656] calculateShadowLOD
   * Tính cấp độ chi tiết bóng.
   */
  public calculateShadowLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateShadowLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateShadowLOD']> {
    return this.curvesMatricesEnvironment.calculateShadowLOD(...args);
  }

  /**
   * [1657] calculateParticleLOD
   * Tính cấp độ chi tiết hệ hạt.
   */
  public calculateParticleLOD(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateParticleLOD']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateParticleLOD']> {
    return this.curvesMatricesEnvironment.calculateParticleLOD(...args);
  }

  /**
   * [1658] calculateLODTransition
   * Tính chuyển tiếp giữa các cấp LOD.
   */
  public calculateLODTransition(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODTransition']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODTransition']> {
    return this.curvesMatricesEnvironment.calculateLODTransition(...args);
  }

  /**
   * [1659] calculateLODThreshold
   * Tính ngưỡng đổi LOD.
   */
  public calculateLODThreshold(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODThreshold']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODThreshold']> {
    return this.curvesMatricesEnvironment.calculateLODThreshold(...args);
  }

  /**
   * [1660] calculateLODScreenSize
   * Tính kích thước chiếu trên màn hình.
   */
  public calculateLODScreenSize(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODScreenSize']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODScreenSize']> {
    return this.curvesMatricesEnvironment.calculateLODScreenSize(...args);
  }

  /**
   * [1661] calculateLODProjectedError
   * Tính sai số chiếu LOD.
   */
  public calculateLODProjectedError(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODProjectedError']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODProjectedError']> {
    return this.curvesMatricesEnvironment.calculateLODProjectedError(...args);
  }

  /**
   * [1662] calculateLODVisibility
   * Tính khả năng hiển thị LOD.
   */
  public calculateLODVisibility(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODVisibility']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODVisibility']> {
    return this.curvesMatricesEnvironment.calculateLODVisibility(...args);
  }

  /**
   * [1663] calculateLODUpdateFrequency
   * Tính tần suất cập nhật LOD.
   */
  public calculateLODUpdateFrequency(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODUpdateFrequency']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODUpdateFrequency']> {
    return this.curvesMatricesEnvironment.calculateLODUpdateFrequency(...args);
  }

  /**
   * [1664] calculateLODSelectionScore
   * Tính điểm chọn LOD.
   */
  public calculateLODSelectionScore(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateLODSelectionScore']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateLODSelectionScore']> {
    return this.curvesMatricesEnvironment.calculateLODSelectionScore(...args);
  }

  /**
   * [1665] calculateOcclusionBounds
   * Tính giới hạn vật thể để kiểm tra che khuất.
   */
  public calculateOcclusionBounds(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateOcclusionBounds']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateOcclusionBounds']> {
    return this.curvesMatricesEnvironment.calculateOcclusionBounds(...args);
  }

  /**
   * [1666] calculateOcclusionVisibility
   * Tính khả năng nhìn thấy sau kiểm tra che khuất.
   */
  public calculateOcclusionVisibility(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateOcclusionVisibility']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateOcclusionVisibility']> {
    return this.curvesMatricesEnvironment.calculateOcclusionVisibility(...args);
  }

  /**
   * [1667] calculateFrustumCulling
   * Kiểm tra loại bỏ vật thể ngoài thể tích nhìn.
   */
  public calculateFrustumCulling(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateFrustumCulling']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateFrustumCulling']> {
    return this.curvesMatricesEnvironment.calculateFrustumCulling(...args);
  }

  /**
   * [1668] calculateDistanceCulling
   * Kiểm tra loại bỏ vật thể theo khoảng cách.
   */
  public calculateDistanceCulling(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateDistanceCulling']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateDistanceCulling']> {
    return this.curvesMatricesEnvironment.calculateDistanceCulling(...args);
  }

  /**
   * [1669] calculateScreenSizeCulling
   * Kiểm tra loại bỏ vật thể theo kích thước màn hình.
   */
  public calculateScreenSizeCulling(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateScreenSizeCulling']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateScreenSizeCulling']> {
    return this.curvesMatricesEnvironment.calculateScreenSizeCulling(...args);
  }

  /**
   * [1670] calculateAnimationUpdatePriority
   * Tính ưu tiên cập nhật hoạt ảnh.
   */
  public calculateAnimationUpdatePriority(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateAnimationUpdatePriority']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateAnimationUpdatePriority']> {
    return this.curvesMatricesEnvironment.calculateAnimationUpdatePriority(...args);
  }

  /**
   * [1671] calculateBoneUpdatePriority
   * Tính ưu tiên cập nhật xương.
   */
  public calculateBoneUpdatePriority(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBoneUpdatePriority']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBoneUpdatePriority']> {
    return this.curvesMatricesEnvironment.calculateBoneUpdatePriority(...args);
  }

  /**
   * [1672] calculatePhysicsUpdatePriority
   * Tính ưu tiên cập nhật vật lý.
   */
  public calculatePhysicsUpdatePriority(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculatePhysicsUpdatePriority']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculatePhysicsUpdatePriority']> {
    return this.curvesMatricesEnvironment.calculatePhysicsUpdatePriority(...args);
  }

  /**
   * [1673] calculateCollisionUpdatePriority
   * Tính ưu tiên cập nhật va chạm.
   */
  public calculateCollisionUpdatePriority(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateCollisionUpdatePriority']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateCollisionUpdatePriority']> {
    return this.curvesMatricesEnvironment.calculateCollisionUpdatePriority(...args);
  }

  /**
   * [1674] calculateSpatialUpdateFrequency
   * Tính tần suất cập nhật không gian.
   */
  public calculateSpatialUpdateFrequency(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSpatialUpdateFrequency']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSpatialUpdateFrequency']> {
    return this.curvesMatricesEnvironment.calculateSpatialUpdateFrequency(...args);
  }

  /**
   * [1675] calculateTransformUpdateFrequency
   * Tính tần suất cập nhật biến đổi.
   */
  public calculateTransformUpdateFrequency(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateTransformUpdateFrequency']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateTransformUpdateFrequency']> {
    return this.curvesMatricesEnvironment.calculateTransformUpdateFrequency(...args);
  }

  /**
   * [1676] calculateBoundingVolumeUpdate
   * Cập nhật thể tích bao.
   */
  public calculateBoundingVolumeUpdate(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBoundingVolumeUpdate']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBoundingVolumeUpdate']> {
    return this.curvesMatricesEnvironment.calculateBoundingVolumeUpdate(...args);
  }

  /**
   * [1677] calculateSpatialPartitionIndex
   * Tính chỉ số phân vùng không gian.
   */
  public calculateSpatialPartitionIndex(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateSpatialPartitionIndex']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateSpatialPartitionIndex']> {
    return this.curvesMatricesEnvironment.calculateSpatialPartitionIndex(...args);
  }

  /**
   * [1678] calculateOctreeNode
   * Tính nút octree chứa vị trí.
   */
  public calculateOctreeNode(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateOctreeNode']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateOctreeNode']> {
    return this.curvesMatricesEnvironment.calculateOctreeNode(...args);
  }

  /**
   * [1679] calculateQuadtreeNode
   * Tính nút quadtree chứa vị trí.
   */
  public calculateQuadtreeNode(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateQuadtreeNode']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateQuadtreeNode']> {
    return this.curvesMatricesEnvironment.calculateQuadtreeNode(...args);
  }

  /**
   * [1680] calculateBVHTraversalCost
   * Tính chi phí duyệt cây BVH.
   */
  public calculateBVHTraversalCost(
    ...args: Parameters<CurvesMatricesEnvironmentSubsystem['calculateBVHTraversalCost']>
  ): ReturnType<CurvesMatricesEnvironmentSubsystem['calculateBVHTraversalCost']> {
    return this.curvesMatricesEnvironment.calculateBVHTraversalCost(...args);
  }

  /**
   * [1681] getClothingPosition
   * Lấy tọa độ trang phục.
   */
  public getClothingPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getClothingPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getClothingPosition']> {
    return this.spatialEquipmentArchitecture.getClothingPosition(...args);
  }

  /**
   * [1682] getClothingAnchor
   * Lấy điểm neo trang phục.
   */
  public getClothingAnchor(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getClothingAnchor']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getClothingAnchor']> {
    return this.spatialEquipmentArchitecture.getClothingAnchor(...args);
  }

  /**
   * [1683] getClothingSurfacePosition
   * Lấy tọa độ trên bề mặt trang phục.
   */
  public getClothingSurfacePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getClothingSurfacePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getClothingSurfacePosition']> {
    return this.spatialEquipmentArchitecture.getClothingSurfacePosition(...args);
  }

  /**
   * [1684] getClothingVertexPosition
   * Lấy tọa độ đỉnh lưới trang phục.
   */
  public getClothingVertexPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getClothingVertexPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getClothingVertexPosition']> {
    return this.spatialEquipmentArchitecture.getClothingVertexPosition(...args);
  }

  /**
   * [1685] calculateClothingFitOffset
   * Tính độ lệch trang phục theo cơ thể.
   */
  public calculateClothingFitOffset(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingFitOffset']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingFitOffset']> {
    return this.spatialEquipmentArchitecture.calculateClothingFitOffset(...args);
  }

  /**
   * [1686] calculateClothingBodyDistance
   * Tính khoảng cách trang phục đến cơ thể.
   */
  public calculateClothingBodyDistance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingBodyDistance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingBodyDistance']> {
    return this.spatialEquipmentArchitecture.calculateClothingBodyDistance(...args);
  }

  /**
   * [1687] calculateClothingPenetration
   * Tính độ xuyên trang phục vào cơ thể.
   */
  public calculateClothingPenetration(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingPenetration']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingPenetration']> {
    return this.spatialEquipmentArchitecture.calculateClothingPenetration(...args);
  }

  /**
   * [1688] calculateClothingCollision
   * Kiểm tra va chạm trang phục.
   */
  public calculateClothingCollision(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingCollision']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingCollision']> {
    return this.spatialEquipmentArchitecture.calculateClothingCollision(...args);
  }

  /**
   * [1689] calculateClothingDeformation
   * Tính biến dạng trang phục.
   */
  public calculateClothingDeformation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingDeformation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingDeformation']> {
    return this.spatialEquipmentArchitecture.calculateClothingDeformation(...args);
  }

  /**
   * [1690] calculateClothingWrinkleCurvature
   * Tính độ cong nếp nhăn trang phục.
   */
  public calculateClothingWrinkleCurvature(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingWrinkleCurvature']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingWrinkleCurvature']> {
    return this.spatialEquipmentArchitecture.calculateClothingWrinkleCurvature(...args);
  }

  /**
   * [1691] calculateClothingCenterOfMass
   * Tính tâm khối lượng trang phục.
   */
  public calculateClothingCenterOfMass(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingCenterOfMass']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingCenterOfMass']> {
    return this.spatialEquipmentArchitecture.calculateClothingCenterOfMass(...args);
  }

  /**
   * [1692] calculateClothingBoundingBox
   * Tính hộp bao trang phục.
   */
  public calculateClothingBoundingBox(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateClothingBoundingBox']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateClothingBoundingBox']> {
    return this.spatialEquipmentArchitecture.calculateClothingBoundingBox(...args);
  }

  /**
   * [1693] getHelmetPosition
   * Lấy tọa độ mũ bảo hiểm.
   */
  public getHelmetPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getHelmetPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getHelmetPosition']> {
    return this.spatialEquipmentArchitecture.getHelmetPosition(...args);
  }

  /**
   * [1694] getHelmetAnchor
   * Lấy điểm neo mũ bảo hiểm.
   */
  public getHelmetAnchor(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getHelmetAnchor']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getHelmetAnchor']> {
    return this.spatialEquipmentArchitecture.getHelmetAnchor(...args);
  }

  /**
   * [1695] calculateHelmetHeadOffset
   * Tính độ lệch mũ so với đầu.
   */
  public calculateHelmetHeadOffset(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateHelmetHeadOffset']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateHelmetHeadOffset']> {
    return this.spatialEquipmentArchitecture.calculateHelmetHeadOffset(...args);
  }

  /**
   * [1696] calculateHelmetOrientation
   * Tính hướng mũ bảo hiểm.
   */
  public calculateHelmetOrientation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateHelmetOrientation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateHelmetOrientation']> {
    return this.spatialEquipmentArchitecture.calculateHelmetOrientation(...args);
  }

  /**
   * [1697] calculateHelmetCollision
   * Kiểm tra va chạm mũ bảo hiểm.
   */
  public calculateHelmetCollision(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateHelmetCollision']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateHelmetCollision']> {
    return this.spatialEquipmentArchitecture.calculateHelmetCollision(...args);
  }

  /**
   * [1698] getGlassesPosition
   * Lấy tọa độ kính.
   */
  public getGlassesPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getGlassesPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getGlassesPosition']> {
    return this.spatialEquipmentArchitecture.getGlassesPosition(...args);
  }

  /**
   * [1699] calculateGlassesEyeAlignment
   * Tính độ căn chỉnh kính với mắt.
   */
  public calculateGlassesEyeAlignment(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateGlassesEyeAlignment']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateGlassesEyeAlignment']> {
    return this.spatialEquipmentArchitecture.calculateGlassesEyeAlignment(...args);
  }

  /**
   * [1700] calculateGlassesHeadOffset
   * Tính độ lệch kính so với đầu.
   */
  public calculateGlassesHeadOffset(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateGlassesHeadOffset']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateGlassesHeadOffset']> {
    return this.spatialEquipmentArchitecture.calculateGlassesHeadOffset(...args);
  }

  /**
   * [1701] getBackpackPosition
   * Lấy tọa độ ba lô.
   */
  public getBackpackPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBackpackPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBackpackPosition']> {
    return this.spatialEquipmentArchitecture.getBackpackPosition(...args);
  }

  /**
   * [1702] calculateBackpackSpineOffset
   * Tính độ lệch ba lô so với cột sống.
   */
  public calculateBackpackSpineOffset(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBackpackSpineOffset']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBackpackSpineOffset']> {
    return this.spatialEquipmentArchitecture.calculateBackpackSpineOffset(...args);
  }

  /**
   * [1703] calculateBackpackCenterOfMass
   * Tính tâm khối lượng ba lô.
   */
  public calculateBackpackCenterOfMass(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBackpackCenterOfMass']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBackpackCenterOfMass']> {
    return this.spatialEquipmentArchitecture.calculateBackpackCenterOfMass(...args);
  }

  /**
   * [1704] calculateBackpackSwing
   * Tính độ vung ba lô.
   */
  public calculateBackpackSwing(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBackpackSwing']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBackpackSwing']> {
    return this.spatialEquipmentArchitecture.calculateBackpackSwing(...args);
  }

  /**
   * [1705] getWeaponPosition
   * Lấy tọa độ vũ khí.
   */
  public getWeaponPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWeaponPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWeaponPosition']> {
    return this.spatialEquipmentArchitecture.getWeaponPosition(...args);
  }

  /**
   * [1706] getWeaponGripPosition
   * Lấy tọa độ điểm nắm vũ khí.
   */
  public getWeaponGripPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWeaponGripPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWeaponGripPosition']> {
    return this.spatialEquipmentArchitecture.getWeaponGripPosition(...args);
  }

  /**
   * [1707] getWeaponMuzzlePosition
   * Lấy tọa độ đầu nòng vũ khí.
   */
  public getWeaponMuzzlePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWeaponMuzzlePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWeaponMuzzlePosition']> {
    return this.spatialEquipmentArchitecture.getWeaponMuzzlePosition(...args);
  }

  /**
   * [1708] getWeaponStockPosition
   * Lấy tọa độ báng vũ khí.
   */
  public getWeaponStockPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWeaponStockPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWeaponStockPosition']> {
    return this.spatialEquipmentArchitecture.getWeaponStockPosition(...args);
  }

  /**
   * [1709] calculateWeaponAimDirection
   * Tính hướng ngắm vũ khí.
   */
  public calculateWeaponAimDirection(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponAimDirection']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponAimDirection']> {
    return this.spatialEquipmentArchitecture.calculateWeaponAimDirection(...args);
  }

  /**
   * [1710] calculateWeaponHandAlignment
   * Tính độ căn chỉnh vũ khí với bàn tay.
   */
  public calculateWeaponHandAlignment(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponHandAlignment']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponHandAlignment']> {
    return this.spatialEquipmentArchitecture.calculateWeaponHandAlignment(...args);
  }

  /**
   * [1711] calculateWeaponRecoilOffset
   * Tính độ lệch do giật vũ khí.
   */
  public calculateWeaponRecoilOffset(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponRecoilOffset']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponRecoilOffset']> {
    return this.spatialEquipmentArchitecture.calculateWeaponRecoilOffset(...args);
  }

  /**
   * [1712] calculateWeaponRecoilRotation
   * Tính góc quay do giật vũ khí.
   */
  public calculateWeaponRecoilRotation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponRecoilRotation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponRecoilRotation']> {
    return this.spatialEquipmentArchitecture.calculateWeaponRecoilRotation(...args);
  }

  /**
   * [1713] calculateWeaponMuzzleDirection
   * Tính hướng đầu nòng vũ khí.
   */
  public calculateWeaponMuzzleDirection(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponMuzzleDirection']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponMuzzleDirection']> {
    return this.spatialEquipmentArchitecture.calculateWeaponMuzzleDirection(...args);
  }

  /**
   * [1714] calculateWeaponCollision
   * Kiểm tra va chạm vũ khí.
   */
  public calculateWeaponCollision(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeaponCollision']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeaponCollision']> {
    return this.spatialEquipmentArchitecture.calculateWeaponCollision(...args);
  }

  /**
   * [1715] getShieldPosition
   * Lấy tọa độ khiên.
   */
  public getShieldPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getShieldPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getShieldPosition']> {
    return this.spatialEquipmentArchitecture.getShieldPosition(...args);
  }

  /**
   * [1716] getShieldCenter
   * Lấy tâm khiên.
   */
  public getShieldCenter(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getShieldCenter']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getShieldCenter']> {
    return this.spatialEquipmentArchitecture.getShieldCenter(...args);
  }

  /**
   * [1717] calculateShieldOrientation
   * Tính hướng khiên.
   */
  public calculateShieldOrientation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateShieldOrientation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateShieldOrientation']> {
    return this.spatialEquipmentArchitecture.calculateShieldOrientation(...args);
  }

  /**
   * [1718] calculateShieldSurfaceNormal
   * Tính pháp tuyến bề mặt khiên.
   */
  public calculateShieldSurfaceNormal(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateShieldSurfaceNormal']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateShieldSurfaceNormal']> {
    return this.spatialEquipmentArchitecture.calculateShieldSurfaceNormal(...args);
  }

  /**
   * [1719] calculateShieldCoverageAngle
   * Tính góc che chắn của khiên.
   */
  public calculateShieldCoverageAngle(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateShieldCoverageAngle']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateShieldCoverageAngle']> {
    return this.spatialEquipmentArchitecture.calculateShieldCoverageAngle(...args);
  }

  /**
   * [1720] calculateShieldCollision
   * Kiểm tra va chạm khiên.
   */
  public calculateShieldCollision(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateShieldCollision']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateShieldCollision']> {
    return this.spatialEquipmentArchitecture.calculateShieldCollision(...args);
  }

  /**
   * [1721] getVehiclePosition
   * Lấy tọa độ phương tiện.
   */
  public getVehiclePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehiclePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehiclePosition']> {
    return this.spatialEquipmentArchitecture.getVehiclePosition(...args);
  }

  /**
   * [1722] getVehicleCenter
   * Lấy tâm phương tiện.
   */
  public getVehicleCenter(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleCenter']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleCenter']> {
    return this.spatialEquipmentArchitecture.getVehicleCenter(...args);
  }

  /**
   * [1723] getVehicleFrontPosition
   * Lấy tọa độ đầu phương tiện.
   */
  public getVehicleFrontPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleFrontPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleFrontPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleFrontPosition(...args);
  }

  /**
   * [1724] getVehicleRearPosition
   * Lấy tọa độ đuôi phương tiện.
   */
  public getVehicleRearPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleRearPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleRearPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleRearPosition(...args);
  }

  /**
   * [1725] getVehicleLeftPosition
   * Lấy tọa độ bên trái phương tiện.
   */
  public getVehicleLeftPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleLeftPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleLeftPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleLeftPosition(...args);
  }

  /**
   * [1726] getVehicleRightPosition
   * Lấy tọa độ bên phải phương tiện.
   */
  public getVehicleRightPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleRightPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleRightPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleRightPosition(...args);
  }

  /**
   * [1727] getVehicleRoofPosition
   * Lấy tọa độ nóc phương tiện.
   */
  public getVehicleRoofPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleRoofPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleRoofPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleRoofPosition(...args);
  }

  /**
   * [1728] getVehicleUndersidePosition
   * Lấy tọa độ gầm phương tiện.
   */
  public getVehicleUndersidePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleUndersidePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleUndersidePosition']> {
    return this.spatialEquipmentArchitecture.getVehicleUndersidePosition(...args);
  }

  /**
   * [1729] getVehicleWheelPosition
   * Lấy tọa độ bánh xe.
   */
  public getVehicleWheelPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleWheelPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleWheelPosition']> {
    return this.spatialEquipmentArchitecture.getVehicleWheelPosition(...args);
  }

  /**
   * [1730] getVehicleAxlePosition
   * Lấy tọa độ trục bánh xe.
   */
  public getVehicleAxlePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getVehicleAxlePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getVehicleAxlePosition']> {
    return this.spatialEquipmentArchitecture.getVehicleAxlePosition(...args);
  }

  /**
   * [1731] calculateVehicleLength
   * Tính chiều dài phương tiện.
   */
  public calculateVehicleLength(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleLength']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleLength']> {
    return this.spatialEquipmentArchitecture.calculateVehicleLength(...args);
  }

  /**
   * [1732] calculateVehicleWidth
   * Tính chiều rộng phương tiện.
   */
  public calculateVehicleWidth(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleWidth']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleWidth']> {
    return this.spatialEquipmentArchitecture.calculateVehicleWidth(...args);
  }

  /**
   * [1733] calculateVehicleHeight
   * Tính chiều cao phương tiện.
   */
  public calculateVehicleHeight(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleHeight']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleHeight']> {
    return this.spatialEquipmentArchitecture.calculateVehicleHeight(...args);
  }

  /**
   * [1734] calculateVehicleWheelbase
   * Tính chiều dài cơ sở phương tiện.
   */
  public calculateVehicleWheelbase(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleWheelbase']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleWheelbase']> {
    return this.spatialEquipmentArchitecture.calculateVehicleWheelbase(...args);
  }

  /**
   * [1735] calculateVehicleTrackWidth
   * Tính chiều rộng vệt bánh xe.
   */
  public calculateVehicleTrackWidth(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleTrackWidth']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleTrackWidth']> {
    return this.spatialEquipmentArchitecture.calculateVehicleTrackWidth(...args);
  }

  /**
   * [1736] calculateVehicleTurningRadius
   * Tính bán kính quay vòng phương tiện.
   */
  public calculateVehicleTurningRadius(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleTurningRadius']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleTurningRadius']> {
    return this.spatialEquipmentArchitecture.calculateVehicleTurningRadius(...args);
  }

  /**
   * [1737] calculateVehicleTurningAngle
   * Tính góc đánh lái phương tiện.
   */
  public calculateVehicleTurningAngle(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleTurningAngle']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleTurningAngle']> {
    return this.spatialEquipmentArchitecture.calculateVehicleTurningAngle(...args);
  }

  /**
   * [1738] calculateVehicleSpeed
   * Tính tốc độ phương tiện.
   */
  public calculateVehicleSpeed(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleSpeed']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleSpeed']> {
    return this.spatialEquipmentArchitecture.calculateVehicleSpeed(...args);
  }

  /**
   * [1739] calculateVehicleAcceleration
   * Tính gia tốc phương tiện.
   */
  public calculateVehicleAcceleration(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleAcceleration']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleAcceleration']> {
    return this.spatialEquipmentArchitecture.calculateVehicleAcceleration(...args);
  }

  /**
   * [1740] calculateVehicleBrakingDistance
   * Tính quãng đường phanh phương tiện.
   */
  public calculateVehicleBrakingDistance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleBrakingDistance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleBrakingDistance']> {
    return this.spatialEquipmentArchitecture.calculateVehicleBrakingDistance(...args);
  }

  /**
   * [1741] calculateVehicleStoppingTime
   * Tính thời gian dừng phương tiện.
   */
  public calculateVehicleStoppingTime(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleStoppingTime']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleStoppingTime']> {
    return this.spatialEquipmentArchitecture.calculateVehicleStoppingTime(...args);
  }

  /**
   * [1742] calculateVehicleHeading
   * Tính hướng phương tiện.
   */
  public calculateVehicleHeading(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleHeading']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleHeading']> {
    return this.spatialEquipmentArchitecture.calculateVehicleHeading(...args);
  }

  /**
   * [1743] calculateVehicleYawRate
   * Tính tốc độ quay hướng phương tiện.
   */
  public calculateVehicleYawRate(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleYawRate']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleYawRate']> {
    return this.spatialEquipmentArchitecture.calculateVehicleYawRate(...args);
  }

  /**
   * [1744] calculateVehiclePitchAngle
   * Tính góc chúi/ngẩng phương tiện.
   */
  public calculateVehiclePitchAngle(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehiclePitchAngle']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehiclePitchAngle']> {
    return this.spatialEquipmentArchitecture.calculateVehiclePitchAngle(...args);
  }

  /**
   * [1745] calculateVehicleRollAngle
   * Tính góc nghiêng ngang phương tiện.
   */
  public calculateVehicleRollAngle(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleRollAngle']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleRollAngle']> {
    return this.spatialEquipmentArchitecture.calculateVehicleRollAngle(...args);
  }

  /**
   * [1746] calculateVehicleGroundClearance
   * Tính khoảng sáng gầm phương tiện.
   */
  public calculateVehicleGroundClearance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleGroundClearance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleGroundClearance']> {
    return this.spatialEquipmentArchitecture.calculateVehicleGroundClearance(...args);
  }

  /**
   * [1747] calculateVehicleCenterOfMass
   * Tính tâm khối lượng phương tiện.
   */
  public calculateVehicleCenterOfMass(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleCenterOfMass']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleCenterOfMass']> {
    return this.spatialEquipmentArchitecture.calculateVehicleCenterOfMass(...args);
  }

  /**
   * [1748] calculateVehicleCollisionBounds
   * Tính giới hạn va chạm phương tiện.
   */
  public calculateVehicleCollisionBounds(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleCollisionBounds']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleCollisionBounds']> {
    return this.spatialEquipmentArchitecture.calculateVehicleCollisionBounds(...args);
  }

  /**
   * [1749] calculateVehiclePathCurvature
   * Tính độ cong đường đi phương tiện.
   */
  public calculateVehiclePathCurvature(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehiclePathCurvature']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehiclePathCurvature']> {
    return this.spatialEquipmentArchitecture.calculateVehiclePathCurvature(...args);
  }

  /**
   * [1750] calculateVehicleWheelRotation
   * Tính góc quay bánh xe.
   */
  public calculateVehicleWheelRotation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateVehicleWheelRotation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateVehicleWheelRotation']> {
    return this.spatialEquipmentArchitecture.calculateVehicleWheelRotation(...args);
  }

  /**
   * [1751] getBuildingPosition
   * Lấy tọa độ công trình.
   */
  public getBuildingPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBuildingPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBuildingPosition']> {
    return this.spatialEquipmentArchitecture.getBuildingPosition(...args);
  }

  /**
   * [1752] getBuildingCenter
   * Lấy tâm công trình.
   */
  public getBuildingCenter(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBuildingCenter']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBuildingCenter']> {
    return this.spatialEquipmentArchitecture.getBuildingCenter(...args);
  }

  /**
   * [1753] getBuildingBasePosition
   * Lấy tọa độ đáy công trình.
   */
  public getBuildingBasePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBuildingBasePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBuildingBasePosition']> {
    return this.spatialEquipmentArchitecture.getBuildingBasePosition(...args);
  }

  /**
   * [1754] getBuildingTopPosition
   * Lấy tọa độ đỉnh công trình.
   */
  public getBuildingTopPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBuildingTopPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBuildingTopPosition']> {
    return this.spatialEquipmentArchitecture.getBuildingTopPosition(...args);
  }

  /**
   * [1755] getBuildingCornerPosition
   * Lấy tọa độ góc công trình.
   */
  public getBuildingCornerPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getBuildingCornerPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getBuildingCornerPosition']> {
    return this.spatialEquipmentArchitecture.getBuildingCornerPosition(...args);
  }

  /**
   * [1756] getWallCenter
   * Lấy tâm tường.
   */
  public getWallCenter(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWallCenter']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWallCenter']> {
    return this.spatialEquipmentArchitecture.getWallCenter(...args);
  }

  /**
   * [1757] getWallSurfacePosition
   * Lấy tọa độ trên bề mặt tường.
   */
  public getWallSurfacePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWallSurfacePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWallSurfacePosition']> {
    return this.spatialEquipmentArchitecture.getWallSurfacePosition(...args);
  }

  /**
   * [1758] getWallNormal
   * Lấy pháp tuyến tường.
   */
  public getWallNormal(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWallNormal']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWallNormal']> {
    return this.spatialEquipmentArchitecture.getWallNormal(...args);
  }

  /**
   * [1759] getFloorPosition
   * Lấy tọa độ sàn.
   */
  public getFloorPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getFloorPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getFloorPosition']> {
    return this.spatialEquipmentArchitecture.getFloorPosition(...args);
  }

  /**
   * [1760] getCeilingPosition
   * Lấy tọa độ trần.
   */
  public getCeilingPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getCeilingPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getCeilingPosition']> {
    return this.spatialEquipmentArchitecture.getCeilingPosition(...args);
  }

  /**
   * [1761] getDoorPosition
   * Lấy tọa độ cửa.
   */
  public getDoorPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getDoorPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getDoorPosition']> {
    return this.spatialEquipmentArchitecture.getDoorPosition(...args);
  }

  /**
   * [1762] getDoorHandlePosition
   * Lấy tọa độ tay nắm cửa.
   */
  public getDoorHandlePosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getDoorHandlePosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getDoorHandlePosition']> {
    return this.spatialEquipmentArchitecture.getDoorHandlePosition(...args);
  }

  /**
   * [1763] getWindowPosition
   * Lấy tọa độ cửa sổ.
   */
  public getWindowPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getWindowPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getWindowPosition']> {
    return this.spatialEquipmentArchitecture.getWindowPosition(...args);
  }

  /**
   * [1764] getStairPosition
   * Lấy tọa độ bậc thang.
   */
  public getStairPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getStairPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getStairPosition']> {
    return this.spatialEquipmentArchitecture.getStairPosition(...args);
  }

  /**
   * [1765] getRoofPosition
   * Lấy tọa độ mái nhà.
   */
  public getRoofPosition(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['getRoofPosition']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['getRoofPosition']> {
    return this.spatialEquipmentArchitecture.getRoofPosition(...args);
  }

  /**
   * [1766] calculateBuildingHeight
   * Tính chiều cao công trình.
   */
  public calculateBuildingHeight(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBuildingHeight']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBuildingHeight']> {
    return this.spatialEquipmentArchitecture.calculateBuildingHeight(...args);
  }

  /**
   * [1767] calculateBuildingFootprint
   * Tính diện tích chiếm đất công trình.
   */
  public calculateBuildingFootprint(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBuildingFootprint']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBuildingFootprint']> {
    return this.spatialEquipmentArchitecture.calculateBuildingFootprint(...args);
  }

  /**
   * [1768] calculateBuildingVolume
   * Tính thể tích công trình.
   */
  public calculateBuildingVolume(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBuildingVolume']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBuildingVolume']> {
    return this.spatialEquipmentArchitecture.calculateBuildingVolume(...args);
  }

  /**
   * [1769] calculateWallLength
   * Tính chiều dài tường.
   */
  public calculateWallLength(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWallLength']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWallLength']> {
    return this.spatialEquipmentArchitecture.calculateWallLength(...args);
  }

  /**
   * [1770] calculateWallHeight
   * Tính chiều cao tường.
   */
  public calculateWallHeight(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWallHeight']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWallHeight']> {
    return this.spatialEquipmentArchitecture.calculateWallHeight(...args);
  }

  /**
   * [1771] calculateWallThickness
   * Tính độ dày tường.
   */
  public calculateWallThickness(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWallThickness']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWallThickness']> {
    return this.spatialEquipmentArchitecture.calculateWallThickness(...args);
  }

  /**
   * [1772] calculateWallSurfaceArea
   * Tính diện tích bề mặt tường.
   */
  public calculateWallSurfaceArea(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWallSurfaceArea']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWallSurfaceArea']> {
    return this.spatialEquipmentArchitecture.calculateWallSurfaceArea(...args);
  }

  /**
   * [1773] calculateFloorArea
   * Tính diện tích sàn.
   */
  public calculateFloorArea(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateFloorArea']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateFloorArea']> {
    return this.spatialEquipmentArchitecture.calculateFloorArea(...args);
  }

  /**
   * [1774] calculateFloorElevation
   * Tính cao độ sàn.
   */
  public calculateFloorElevation(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateFloorElevation']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateFloorElevation']> {
    return this.spatialEquipmentArchitecture.calculateFloorElevation(...args);
  }

  /**
   * [1775] calculateCeilingHeight
   * Tính chiều cao trần.
   */
  public calculateCeilingHeight(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateCeilingHeight']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateCeilingHeight']> {
    return this.spatialEquipmentArchitecture.calculateCeilingHeight(...args);
  }

  /**
   * [1776] calculateDoorClearance
   * Tính khoảng trống cửa.
   */
  public calculateDoorClearance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateDoorClearance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateDoorClearance']> {
    return this.spatialEquipmentArchitecture.calculateDoorClearance(...args);
  }

  /**
   * [1777] calculateWindowOpening
   * Tính kích thước lỗ cửa sổ.
   */
  public calculateWindowOpening(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWindowOpening']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWindowOpening']> {
    return this.spatialEquipmentArchitecture.calculateWindowOpening(...args);
  }

  /**
   * [1778] calculateStairRise
   * Tính chiều cao cổ bậc.
   */
  public calculateStairRise(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateStairRise']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateStairRise']> {
    return this.spatialEquipmentArchitecture.calculateStairRise(...args);
  }

  /**
   * [1779] calculateStairTread
   * Tính chiều sâu mặt bậc.
   */
  public calculateStairTread(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateStairTread']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateStairTread']> {
    return this.spatialEquipmentArchitecture.calculateStairTread(...args);
  }

  /**
   * [1780] calculateRoofSlope
   * Tính độ dốc mái.
   */
  public calculateRoofSlope(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateRoofSlope']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateRoofSlope']> {
    return this.spatialEquipmentArchitecture.calculateRoofSlope(...args);
  }

  /**
   * [1781] calculateRoomBounds
   * Tính giới hạn không gian phòng.
   */
  public calculateRoomBounds(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateRoomBounds']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateRoomBounds']> {
    return this.spatialEquipmentArchitecture.calculateRoomBounds(...args);
  }

  /**
   * [1782] calculateRoomCenter
   * Tính tâm phòng.
   */
  public calculateRoomCenter(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateRoomCenter']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateRoomCenter']> {
    return this.spatialEquipmentArchitecture.calculateRoomCenter(...args);
  }

  /**
   * [1783] calculateRoomVolume
   * Tính thể tích phòng.
   */
  public calculateRoomVolume(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateRoomVolume']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateRoomVolume']> {
    return this.spatialEquipmentArchitecture.calculateRoomVolume(...args);
  }

  /**
   * [1784] calculateRoomNavigationDistance
   * Tính khoảng cách điều hướng trong phòng.
   */
  public calculateRoomNavigationDistance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateRoomNavigationDistance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateRoomNavigationDistance']> {
    return this.spatialEquipmentArchitecture.calculateRoomNavigationDistance(...args);
  }

  /**
   * [1785] calculateBuildingCollision
   * Kiểm tra va chạm với công trình.
   */
  public calculateBuildingCollision(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateBuildingCollision']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateBuildingCollision']> {
    return this.spatialEquipmentArchitecture.calculateBuildingCollision(...args);
  }

  /**
   * [1786] calculateSpatialDistanceMatrix
   * Tính ma trận khoảng cách không gian.
   */
  public calculateSpatialDistanceMatrix(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialDistanceMatrix']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialDistanceMatrix']> {
    return this.spatialEquipmentArchitecture.calculateSpatialDistanceMatrix(...args);
  }

  /**
   * [1787] calculatePairwiseDistances
   * Tính khoảng cách từng cặp điểm.
   */
  public calculatePairwiseDistances(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculatePairwiseDistances']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculatePairwiseDistances']> {
    return this.spatialEquipmentArchitecture.calculatePairwiseDistances(...args);
  }

  /**
   * [1788] calculateNearestNeighborDistance
   * Tính khoảng cách láng giềng gần nhất.
   */
  public calculateNearestNeighborDistance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateNearestNeighborDistance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateNearestNeighborDistance']> {
    return this.spatialEquipmentArchitecture.calculateNearestNeighborDistance(...args);
  }

  /**
   * [1789] calculateFarthestNeighborDistance
   * Tính khoảng cách láng giềng xa nhất.
   */
  public calculateFarthestNeighborDistance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateFarthestNeighborDistance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateFarthestNeighborDistance']> {
    return this.spatialEquipmentArchitecture.calculateFarthestNeighborDistance(...args);
  }

  /**
   * [1790] calculateSpatialCentroid
   * Tính tâm hình học tập điểm.
   */
  public calculateSpatialCentroid(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialCentroid']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialCentroid']> {
    return this.spatialEquipmentArchitecture.calculateSpatialCentroid(...args);
  }

  /**
   * [1791] calculateWeightedCentroid
   * Tính tâm có trọng số.
   */
  public calculateWeightedCentroid(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateWeightedCentroid']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateWeightedCentroid']> {
    return this.spatialEquipmentArchitecture.calculateWeightedCentroid(...args);
  }

  /**
   * [1792] calculateSpatialMedian
   * Tính trung vị không gian.
   */
  public calculateSpatialMedian(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialMedian']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialMedian']> {
    return this.spatialEquipmentArchitecture.calculateSpatialMedian(...args);
  }

  /**
   * [1793] calculateSpatialVariance
   * Tính phương sai tọa độ.
   */
  public calculateSpatialVariance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialVariance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialVariance']> {
    return this.spatialEquipmentArchitecture.calculateSpatialVariance(...args);
  }

  /**
   * [1794] calculateSpatialCovariance
   * Tính hiệp phương sai tọa độ.
   */
  public calculateSpatialCovariance(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialCovariance']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialCovariance']> {
    return this.spatialEquipmentArchitecture.calculateSpatialCovariance(...args);
  }

  /**
   * [1795] calculateSpatialDistribution
   * Tính phân bố không gian.
   */
  public calculateSpatialDistribution(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialDistribution']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialDistribution']> {
    return this.spatialEquipmentArchitecture.calculateSpatialDistribution(...args);
  }

  /**
   * [1796] calculateSpatialDensity
   * Tính mật độ điểm trong không gian.
   */
  public calculateSpatialDensity(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialDensity']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialDensity']> {
    return this.spatialEquipmentArchitecture.calculateSpatialDensity(...args);
  }

  /**
   * [1797] calculateSpatialClustering
   * Tính mức độ phân cụm không gian.
   */
  public calculateSpatialClustering(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialClustering']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialClustering']> {
    return this.spatialEquipmentArchitecture.calculateSpatialClustering(...args);
  }

  /**
   * [1798] calculateSpatialOutliers
   * Phát hiện điểm ngoại lệ không gian.
   */
  public calculateSpatialOutliers(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialOutliers']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialOutliers']> {
    return this.spatialEquipmentArchitecture.calculateSpatialOutliers(...args);
  }

  /**
   * [1799] calculateSpatialSymmetry
   * Tính độ đối xứng không gian.
   */
  public calculateSpatialSymmetry(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialSymmetry']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialSymmetry']> {
    return this.spatialEquipmentArchitecture.calculateSpatialSymmetry(...args);
  }

  /**
   * [1800] calculateSpatialOverlapRatio
   * Tính tỷ lệ chồng lấn không gian.
   */
  public calculateSpatialOverlapRatio(
    ...args: Parameters<SpatialEquipmentArchitectureSubsystem['calculateSpatialOverlapRatio']>
  ): ReturnType<SpatialEquipmentArchitectureSubsystem['calculateSpatialOverlapRatio']> {
    return this.spatialEquipmentArchitecture.calculateSpatialOverlapRatio(...args);
  }

}
