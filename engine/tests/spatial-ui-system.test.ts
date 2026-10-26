import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  SpatialUISystem,
  getActiveSpatialUISystem,
  setActiveSpatialUISystem,
  DistanceVectorMathSubsystem,
  AnatomicalUpperBodySubsystem,
  AnatomicalHandDigitsSubsystem,
  AnatomicalLowerBodySubsystem,
  SkeletalKinematicsCharacterSubsystem,
  EntitiesFaunaFloraSubsystem,
  CameraViewportUISubsystem,
  PhysicsCollisionProjectileSubsystem,
  CurvesMatricesEnvironmentSubsystem,
  SpatialEquipmentArchitectureSubsystem,
  calculateDistance3D,
  calculateEuclideanDistance,
  getHeadPosition,
  calculateHeadBoundingBox,
  getIndexFingerTipPosition,
  calculateThumbPinchDistance,
  getHeldObjectPosition,
  calculateFootRotation,
  calculateKneeRotation,
  calculateForwardKinematics,
  calculateBossPosition,
  getAnimalPosition,
  calculateBirdWingspan,
  calculateTreeHeight,
  calculateCameraDistance,
  calculateWorldToScreenPosition,
  calculateUIAnchorPosition,
  calculateUIBillboardRotation,
  calculateAABBOverlap,
  calculateProjectileTrajectory,
  calculateBezierCurve,
  calculateCatmullRomSpline,
  calculateMatrixMultiplication,
  calculateGridCellIndex,
  calculateObjectLOD,
  calculateClothingFitOffset,
  calculateVehicleSpeed,
  calculateBuildingHeight,
  calculateSpatialCentroid
} from '../src/spatial-ui/index.js';

describe('SpatialUISystem — Complete 1,800 Functions 3D Spatial UI & Math Suite', () => {
  let spatialSystem: SpatialUISystem;
  let allFunctions: Array<{ num: number; name: string; desc: string; section: string; sectionNum: number }>;

  beforeEach(() => {
    spatialSystem = new SpatialUISystem();
    setActiveSpatialUISystem(spatialSystem);
    const jsonPath = path.join(__dirname, 'spatial_ui_functions_1800.json');
    allFunctions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  });

  describe('1. Completeness & Integrity (All 1,800 Functions)', () => {
    it('contains exactly 1,800 functions across 40 sections', () => {
      expect(allFunctions.length).toBe(1800);
      const sections = new Set(allFunctions.map(f => f.section));
      expect(sections.size).toBe(40);
    });

    it('implements every unique function name as a callable method on SpatialUISystem', () => {
      const missingMethods: string[] = [];
      const checkedNames = new Set<string>();

      for (const fn of allFunctions) {
        if (checkedNames.has(fn.name)) continue;
        checkedNames.add(fn.name);

        const method = (spatialSystem as any)[fn.name];
        if (typeof method !== 'function') {
          missingMethods.push(`[#${fn.num}] ${fn.name} (Section ${fn.sectionNum}: ${fn.section})`);
        }
      }

      expect(missingMethods).toEqual([]);
    });

    it('executes all 1,800 functions without throwing exceptions and verifies return values', () => {
      let executedCount = 0;
      for (const fn of allFunctions) {
        const method = (spatialSystem as any)[fn.name];
        expect(typeof method).toBe('function');

        let result: any;
        expect(() => {
          result = method.call(spatialSystem);
        }).not.toThrow();

        expect(result).toBeDefined();
        executedCount++;
      }
      expect(executedCount).toBe(1800);
    });

    it('instantiates all 10 modular subsystems with their assigned ranges', () => {
      expect(spatialSystem.distanceVectorMath).toBeInstanceOf(DistanceVectorMathSubsystem);
      expect(spatialSystem.anatomicalUpperBody).toBeInstanceOf(AnatomicalUpperBodySubsystem);
      expect(spatialSystem.anatomicalHandDigits).toBeInstanceOf(AnatomicalHandDigitsSubsystem);
      expect(spatialSystem.anatomicalLowerBody).toBeInstanceOf(AnatomicalLowerBodySubsystem);
      expect(spatialSystem.skeletalKinematicsCharacter).toBeInstanceOf(SkeletalKinematicsCharacterSubsystem);
      expect(spatialSystem.entitiesFaunaFlora).toBeInstanceOf(EntitiesFaunaFloraSubsystem);
      expect(spatialSystem.cameraViewportUI).toBeInstanceOf(CameraViewportUISubsystem);
      expect(spatialSystem.physicsCollisionProjectile).toBeInstanceOf(PhysicsCollisionProjectileSubsystem);
      expect(spatialSystem.curvesMatricesEnvironment).toBeInstanceOf(CurvesMatricesEnvironmentSubsystem);
      expect(spatialSystem.spatialEquipmentArchitecture).toBeInstanceOf(SpatialEquipmentArchitectureSubsystem);
    });
  });

  describe('2. Subsystems 1–3: Distance, Upper Body & Digits (001–600)', () => {
    it('calculates 3D Euclidean distances accurately', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 3, y: 4, z: 0 };
      const d = spatialSystem.calculateDistance3D(p1, p2);
      expect(d).toBeCloseTo(5.0);

      const d2 = spatialSystem.calculateEuclideanDistance(p1, p2);
      expect(d2).toBeCloseTo(5.0);
    });

    it('computes head and facial bounding boxes and positions', () => {
      const headPos = spatialSystem.getHeadPosition({ position: { x: 1, y: 2, z: 3 } });
      expect(headPos).toEqual({ x: 1, y: 2, z: 3 });

      const bbox = spatialSystem.calculateHeadBoundingBox({ position: { x: 0, y: 1.7, z: 0 } }, { x: 0.3, y: 0.3, z: 0.3 });
      expect(bbox.min.y).toBeCloseTo(1.55);
      expect(bbox.max.y).toBeCloseTo(1.85);
    });

    it('handles digit positioning and pinch distances', () => {
      const tip = spatialSystem.getIndexFingerTipPosition({ position: { x: 0.2, y: 1.1, z: 0.4 } });
      expect(tip.x).toBeCloseTo(0.2);

      const pinch = spatialSystem.calculateThumbPinchDistance();
      expect(pinch).toBeDefined();
    });
  });

  describe('3. Subsystems 4–6: Lower Body, Kinematics & Entities (601–1390)', () => {
    it('manages held object coordinates and posture balance', () => {
      const held = spatialSystem.getHeldObjectPosition({ position: { x: 0.5, y: 1.0, z: 0.2 } });
      expect(held).toBeDefined();

      const balance = spatialSystem.calculateBodyBalance();
      expect(balance).toBeDefined();
    });

    it('evaluates forward kinematics and character motion', () => {
      const fk = spatialSystem.calculateForwardKinematics();
      expect(fk).toBeDefined();
    });

    it('computes fauna, flora, and boss target positions', () => {
      const boss = spatialSystem.getBossPosition({ position: { x: 10, y: 0, z: 50 } });
      expect(boss).toBeDefined();

      const animal = spatialSystem.getAnimalPosition({ position: { x: -5, y: 0, z: 12 } });
      expect(animal).toBeDefined();

      const wingspan = spatialSystem.calculateBirdWingspan();
      expect(wingspan).toBeGreaterThan(0);

      const tree = spatialSystem.calculateTreeHeight();
      expect(tree).toBeGreaterThan(0);
    });
  });

  describe('4. Subsystems 7–10: Camera, Physics, Curves & Architecture (1391–1800)', () => {
    it('computes camera viewport, world-to-screen projection, and UI billboards', () => {
      const camDist = spatialSystem.calculateCameraDistance();
      expect(camDist).toBeDefined();

      const screenPos = spatialSystem.calculateWorldToScreenPosition({ x: 0, y: 2, z: 0 });
      expect(screenPos).toBeDefined();

      const anchor = spatialSystem.calculateUIAnchorPosition({ x: 10, y: 2, z: 5 });
      expect(anchor.visible).toBe(true);

      const billboard = spatialSystem.calculateUIBillboardRotation();
      expect(billboard).toBeDefined();
      expect(billboard.w).toBe(1);
    });

    it('handles physics collisions and projectile trajectories', () => {
      const overlap = spatialSystem.calculateAABBOverlap();
      expect(overlap.hit).toBe(true);

      const traj = spatialSystem.calculateProjectileTrajectory();
      expect(traj).toBeDefined();
    });

    it('interpolates splines, curves, matrices, and spatial partitioning', () => {
      const bezier = spatialSystem.calculateBezierCurve();
      expect(bezier).toBeDefined();

      const spline = spatialSystem.calculateCatmullRomSpline();
      expect(spline).toBeDefined();

      const mat = spatialSystem.calculateMatrixMultiplication();
      expect(Array.isArray(mat)).toBe(true);
      expect(mat.length).toBe(16);

      const cell = spatialSystem.calculateGridCellIndex();
      expect(cell).toBeDefined();

      const lod = spatialSystem.calculateObjectLOD();
      expect(lod.lodLevel).toBe(0);
    });

    it('measures clothing fit, vehicles, architecture, and spatial analytics', () => {
      const fit = spatialSystem.calculateClothingFitOffset();
      expect(fit).toBeDefined();

      const speed = spatialSystem.calculateVehicleSpeed();
      expect(speed).toBeGreaterThan(0);

      const height = spatialSystem.calculateBuildingHeight();
      expect(height).toBeGreaterThan(0);

      const centroid = spatialSystem.calculateSpatialCentroid();
      expect(centroid).toBeDefined();
    });
  });

  describe('5. Duplicate Function Resolution', () => {
    it('calculateFootRotation delegates safely and returns valid quaternion', () => {
      const r = spatialSystem.calculateFootRotation();
      expect(r).toBeDefined();
      expect(r.w).toBe(1);
    });

    it('calculateKneeRotation delegates safely and returns valid rotation', () => {
      const r = spatialSystem.calculateKneeRotation();
      expect(r).toBeDefined();
      expect(r.w).toBe(1);
    });
  });

  describe('6. Standalone Functional Exports', () => {
    it('executes standalone functions via getActiveSpatialUISystem()', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 0, y: 10, z: 0 };
      const dist = calculateDistance3D(p1, p2);
      expect(dist).toBeCloseTo(10.0);

      const head = getHeadPosition({ position: { x: 5, y: 6, z: 7 } });
      expect(head).toEqual({ x: 5, y: 6, z: 7 });

      const anchor = calculateUIAnchorPosition();
      expect(anchor.visible).toBe(true);

      const rot = calculateFootRotation();
      expect(rot).toBeDefined();
    });
  });
});
