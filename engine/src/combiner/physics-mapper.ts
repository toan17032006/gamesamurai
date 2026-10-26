// engine/src/combiner/physics-mapper.ts — Gắn khớp nối vật lý, trọng tâm và cấu hình Ragdoll
import * as THREE from 'three';
import type { RagdollConfig, RagdollJoint, PhysicsBody } from '../types/physics.types';
import type { RigKind } from '../types/asset.types';
import { listSockets, findBone } from './socket-binder';
import { computeBounds } from '../transformer/bounds-calculator';

export interface PhysicsMapperOptions {
  totalMass?: number;
  damping?: number;
  stiffness?: number;
  rigKind?: RigKind;
}

const HUMANOID_JOINT_SPECS: Array<{
  bone: string;
  parent: string;
  min: [number, number, number];
  max: [number, number, number];
  stiffness: number;
}> = [
  { bone: 'spine', parent: 'hips', min: [-0.3, -0.4, -0.3], max: [0.5, 0.4, 0.3], stiffness: 0.8 },
  { bone: 'head', parent: 'spine', min: [-0.4, -0.6, -0.3], max: [0.4, 0.6, 0.3], stiffness: 0.6 },
  { bone: 'arm_l', parent: 'spine', min: [-1.2, -0.8, -1.0], max: [1.2, 0.8, 1.0], stiffness: 0.5 },
  { bone: 'arm_r', parent: 'spine', min: [-1.2, -0.8, -1.0], max: [1.2, 0.8, 1.0], stiffness: 0.5 },
  { bone: 'forearm_l', parent: 'arm_l', min: [0, 0, -2.4], max: [0, 0, 0], stiffness: 0.7 },
  { bone: 'forearm_r', parent: 'arm_r', min: [0, 0, 0], max: [0, 0, 2.4], stiffness: 0.7 },
  { bone: 'thigh_l', parent: 'hips', min: [-1.5, -0.3, -0.4], max: [0.5, 0.3, 0.4], stiffness: 0.6 },
  { bone: 'thigh_r', parent: 'hips', min: [-1.5, -0.3, -0.4], max: [0.5, 0.3, 0.4], stiffness: 0.6 },
  { bone: 'shin_l', parent: 'thigh_l', min: [0, 0, 0], max: [2.5, 0, 0], stiffness: 0.7 },
  { bone: 'shin_r', parent: 'thigh_r', min: [0, 0, 0], max: [2.5, 0, 0], stiffness: 0.7 },
];

export function calculateCenterOfMass(rig: THREE.Object3D): THREE.Vector3 {
  rig.updateWorldMatrix(true, true);
  const bounds = computeBounds(rig);
  const center = new THREE.Vector3(bounds.sphere.center[0], bounds.sphere.center[1], bounds.sphere.center[2]);

  const hips = findBone(rig, 'hips') ?? findBone(rig, 'pelvis');
  if (hips) {
    const hipsWorld = new THREE.Vector3();
    hips.getWorldPosition(hipsWorld);
    return hipsWorld.lerp(center, 0.3);
  }
  return center;
}

export function buildRagdollConfig(rig: THREE.Object3D, opts: PhysicsMapperOptions = {}): RagdollConfig {
  const bones = listSockets(rig);
  const joints: RagdollJoint[] = [];
  const totalMass = opts.totalMass ?? 70;
  const damping = opts.damping ?? 0.05;

  for (const spec of HUMANOID_JOINT_SPECS) {
    const bNode = findBone(rig, spec.bone);
    const pNode = findBone(rig, spec.parent);
    if (bNode && pNode) {
      joints.push({
        bone: bNode.name,
        parentBone: pNode.name,
        limits: {
          min: { x: spec.min[0], y: spec.min[1], z: spec.min[2] },
          max: { x: spec.max[0], y: spec.max[1], z: spec.max[2] },
        },
        stiffness: spec.stiffness * (opts.stiffness ?? 1),
        damping,
      });
    }
  }

  return {
    bones,
    joints,
    totalMass,
    damping,
    enableSelfCollision: false,
  };
}

export function mapRigidBodiesToBones(rig: THREE.Object3D, config: RagdollConfig): Map<string, PhysicsBody> {
  const bodies = new Map<string, PhysicsBody>();
  const massPerBone = config.totalMass / Math.max(1, config.joints.length + 1);

  rig.updateWorldMatrix(true, true);

  for (const boneName of config.bones) {
    const bone = findBone(rig, boneName);
    if (!bone) continue;

    const worldPos = new THREE.Vector3();
    bone.getWorldPosition(worldPos);

    const body: PhysicsBody = {
      id: `rb_${boneName}`,
      mass: massPerBone,
      position: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
      velocity: { x: 0, y: 0, z: 0 },
      drag: config.damping,
      gravityScale: 1,
      shape: {
        kind: 'capsule',
        radius: 0.12,
        height: 0.35,
      },
    };
    bodies.set(boneName, body);
  }

  return bodies;
}

export function syncBonesToRagdoll(
  rig: THREE.Object3D,
  bodies: Map<string, PhysicsBody>,
  blendWeight = 1.0,
): void {
  const clampedWeight = Math.max(0, Math.min(1, blendWeight));
  if (clampedWeight <= 0) return;

  rig.updateWorldMatrix(true, false);
  const invRig = new THREE.Matrix4().copy(rig.matrixWorld).invert();
  const targetPos = new THREE.Vector3();

  for (const [boneName, body] of bodies) {
    const bone = findBone(rig, boneName);
    if (!bone) continue;

    targetPos.set(body.position.x, body.position.y, body.position.z).applyMatrix4(invRig);

    if (clampedWeight >= 1) {
      bone.position.copy(targetPos);
    } else {
      bone.position.lerp(targetPos, clampedWeight);
    }
  }
}
