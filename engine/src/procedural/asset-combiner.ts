/**
 * @file asset-combiner.ts
 * @module @aetheria/engine/procedural/asset-combiner
 * @description Advanced runtime combiner uniting loaded 3D models (OBJ, GLTF, FBX)
 * with procedural components, sockets, dynamic scaling/zoom, and physics joints.
 */

import * as THREE from 'three';
import { Scaler } from '../transformer/scaler.js';
import { PivotAdjuster } from '../transformer/pivot-adjuster.js';
import { GeometryOptimizer } from '../transformer/geometry-optimizer.js';
import { SocketBinder } from '../combiner/socket-binder.js';
import { ProceduralCharacterResult } from './character-factory.js';
import { ProceduralMonsterResult } from './monster-factory.js';
import { PrimitiveFactory } from './primitive-factory.js';

export interface AssetAttachmentSpec {
  name: string;
  asset: THREE.Object3D;
  socketName?: string;
  relativePosition?: [number, number, number];
  relativeRotation?: [number, number, number]; // Euler angles in radians
  scale?: [number, number, number] | number;
  zoomTargetHeight?: number;
  pivot?: 'bottom' | 'center' | 'origin' | [number, number, number];
  materialOverride?: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

export interface AssetCombinationResult {
  root: THREE.Group;
  attachments: Map<string, THREE.Object3D>;
  sockets: Map<string, THREE.Object3D>;
  totalTriangles: number;
}

export class AssetCombiner {
  /**
   * Combine a base asset with a variable number of attachments, resolving sockets, pivots, and scales.
   */
  public static combineAssets(
    base: THREE.Object3D,
    attachments: AssetAttachmentSpec[],
    options: { mergeStaticMeshes?: boolean; name?: string } = {}
  ): AssetCombinationResult {
    const root = new THREE.Group();
    root.name = options.name ?? `Combined_${base.name || 'Model'}`;
    root.add(base);

    // Locate sockets in base
    const sockets = new Map<string, THREE.Object3D>();
    base.traverse((child) => {
      if (child.name.startsWith('socket_') || child.userData?.isSocket) {
        const socketId = child.name.replace('socket_', '');
        sockets.set(socketId, child);
      }
    });

    const attachmentMap = new Map<string, THREE.Object3D>();
    let totalTriangles = 0;

    for (const spec of attachments) {
      let attachmentObj = spec.asset.clone();
      attachmentObj.name = spec.name;

      // Adjust pivot if requested
      if (spec.pivot) {
        attachmentObj = PivotAdjuster.createPivotOffset(attachmentObj, spec.pivot);
      }

      // Apply zoom / scaling
      if (spec.zoomTargetHeight) {
        Scaler.zoomAsset(attachmentObj, { targetHeight: spec.zoomTargetHeight });
      } else if (spec.scale !== undefined) {
        if (typeof spec.scale === 'number') {
          attachmentObj.scale.setScalar(spec.scale);
        } else {
          attachmentObj.scale.set(spec.scale[0], spec.scale[1], spec.scale[2]);
        }
      }

      // Apply relative offsets
      if (spec.relativePosition) {
        attachmentObj.position.set(spec.relativePosition[0], spec.relativePosition[1], spec.relativePosition[2]);
      }
      if (spec.relativeRotation) {
        attachmentObj.rotation.set(spec.relativeRotation[0], spec.relativeRotation[1], spec.relativeRotation[2]);
      }

      // Material overrides & shadows
      attachmentObj.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          if (spec.materialOverride) {
            c.material = spec.materialOverride;
          }
          if (spec.castShadow !== undefined) c.castShadow = spec.castShadow;
          if (spec.receiveShadow !== undefined) c.receiveShadow = spec.receiveShadow;
          if (c.geometry) {
            const posAttr = c.geometry.getAttribute('position');
            const index = c.geometry.getIndex();
            totalTriangles += index ? index.count / 3 : (posAttr ? posAttr.count / 3 : 0);
          }
        }
      });

      // Bind to socket if requested
      if (spec.socketName) {
        const socketTarget = sockets.get(spec.socketName) || base.getObjectByName(`socket_${spec.socketName}`) || base.getObjectByName(spec.socketName);
        if (socketTarget) {
          SocketBinder.attachToSocket(socketTarget, attachmentObj, { preserveWorldTransform: false });
        } else {
          root.add(attachmentObj);
        }
      } else {
        root.add(attachmentObj);
      }

      attachmentMap.set(spec.name, attachmentObj);
    }

    // Merge static meshes if requested
    if (options.mergeStaticMeshes) {
      const staticMeshes: THREE.Mesh[] = [];
      root.traverse((c) => {
        if (c instanceof THREE.Mesh && !c.userData?.dynamic && !(c.parent instanceof THREE.Bone)) {
          staticMeshes.push(c);
        }
      });
      if (staticMeshes.length > 1) {
        const merged = GeometryOptimizer.mergeMeshes(staticMeshes);
        if (merged) {
          staticMeshes.forEach((m) => m.removeFromParent());
          root.add(merged);
        }
      }
    }

    return {
      root,
      attachments: attachmentMap,
      sockets,
      totalTriangles,
    };
  }

  /**
   * Attaches procedural accessories (wings, capes, auras, crowns, horns) to a procedural humanoid character.
   */
  public static attachProceduralGear(
    character: ProceduralCharacterResult,
    gearType: 'wings' | 'cape' | 'crown' | 'aura' | 'pauldrons',
    options: { color?: number; scale?: number; roughness?: number } = {}
  ): THREE.Object3D {
    const color = options.color ?? 0xddaa33;
    const scale = options.scale ?? 1.0;
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.3,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });

    const gearGroup = new THREE.Group();
    gearGroup.name = `gear_${gearType}`;

    switch (gearType) {
      case 'wings': {
        const spine = character.sockets.spine;
        if (!spine) break;

        const leftWing = PrimitiveFactory.createConeMesh({
          radius: 0.25 * scale,
          height: 1.2 * scale,
          color,
          roughness: 0.4,
        });
        leftWing.rotation.z = Math.PI / 3;
        leftWing.rotation.x = 0.2;
        leftWing.position.set(-0.35 * scale, 0.2 * scale, -0.2 * scale);

        const rightWing = leftWing.clone();
        rightWing.rotation.z = -Math.PI / 3;
        rightWing.position.x = 0.35 * scale;

        gearGroup.add(leftWing, rightWing);
        spine.add(gearGroup);
        break;
      }

      case 'cape': {
        const spine = character.sockets.spine;
        if (!spine) break;

        const capeGeo = new THREE.PlaneGeometry(0.7 * scale, 1.4 * scale, 8, 12);
        const capeMat = new THREE.MeshStandardMaterial({
          color: options.color ?? 0x881122,
          roughness: 0.8,
          side: THREE.DoubleSide,
        });
        const capeMesh = new THREE.Mesh(capeGeo, capeMat);
        capeMesh.position.set(0, -0.4 * scale, -0.22 * scale);
        capeMesh.rotation.x = 0.15;
        gearGroup.add(capeMesh);
        spine.add(gearGroup);
        break;
      }

      case 'crown': {
        const head = character.sockets.head;
        if (!head) break;

        const crownMesh = PrimitiveFactory.createCylinderMesh({
          radiusTop: 0.22 * scale,
          radiusBottom: 0.2 * scale,
          height: 0.12 * scale,
          color: 0xffcc00,
          roughness: 0.2,
          metalness: 0.9,
        });
        crownMesh.position.set(0, 0.25 * scale, 0);
        gearGroup.add(crownMesh);
        head.add(gearGroup);
        break;
      }

      case 'aura': {
        const auraGeo = new THREE.SphereGeometry(1.2 * scale, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);
        auraMesh.position.set(0, 1.0 * scale, 0);
        gearGroup.add(auraMesh);
        character.root.add(gearGroup);
        break;
      }

      case 'pauldrons': {
        const spine = character.sockets.spine;
        if (!spine) break;

        const pauldronGeo = new THREE.SphereGeometry(0.18 * scale, 8, 8);
        const leftP = new THREE.Mesh(pauldronGeo, mat);
        leftP.position.set(-0.45 * scale, 0.1 * scale, 0);
        leftP.scale.set(1.2, 0.7, 1.0);

        const rightP = leftP.clone();
        rightP.position.x = 0.45 * scale;

        gearGroup.add(leftP, rightP);
        spine.add(gearGroup);
        break;
      }
    }

    return gearGroup;
  }

  /**
   * Fuse a loaded static 3D mesh with procedural body parts, limbs, or sockets.
   */
  public static createHybridModel(
    loadedMesh: THREE.Object3D,
    proceduralAddition: ProceduralMonsterResult | ProceduralCharacterResult
  ): THREE.Group {
    const hybridGroup = new THREE.Group();
    hybridGroup.name = `Hybrid_${loadedMesh.name || 'Asset'}_${proceduralAddition.root.name}`;

    hybridGroup.add(loadedMesh);
    hybridGroup.add(proceduralAddition.root);

    return hybridGroup;
  }
}
