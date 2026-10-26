/**
 * @file types.ts
 * @module @aetheria/engine/player/types
 * @description Type definitions, interfaces, joint constraints, and states for Realistic Human Player.
 */

export type HandSide = 'left' | 'right';
export type FootSide = 'left' | 'right';

export type BodyPosture =
  | 'standing'
  | 'walking'
  | 'running'
  | 'sprinting'
  | 'crouching'
  | 'crouch_walking'
  | 'sitting_chair'
  | 'sitting_ground'
  | 'kneeling'
  | 'lying_back'
  | 'lying_stomach'
  | 'lying_left'
  | 'lying_right'
  | 'jumping'
  | 'falling'
  | 'landing';

export type FacialExpressionType =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'
  | 'smirk'
  | 'skeptical';

export type VisemeType =
  | 'silence'
  | 'aa'
  | 'ee'
  | 'ih'
  | 'oh'
  | 'ou'
  | 'ch'
  | 'th'
  | 'nn'
  | 'ff'
  | 'pp'
  | 'kk';

import type { Vec3 } from '../types/index.js';
export type { Vec3 };


export interface Quat4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface BoneTransform {
  position: Vec3;
  rotation: Quat4; // or Euler angles
  scale: Vec3;
  minLimits?: Vec3;
  maxLimits?: Vec3;
}

export interface PlayerAppearanceConfig {
  skinColor: string;
  hairStyle: string;
  eyeColor: string;
  bodyShape: 'lean' | 'athletic' | 'muscular' | 'heavy' | 'slim';
  height: number; // in meters (e.g. 1.78)
  weight: number; // in kg (e.g. 72)
  scale: Vec3;
  visibility: boolean;
  opacity: number;
  shadingMode: 'pbr' | 'toon' | 'unlit' | 'subsurface';
}

export interface FingerJoints {
  proximal: number; // angle in degrees/radians
  medial: number;
  distal: number;
  spread: number;
}

export interface HandFingerState {
  thumb: FingerJoints;
  index: FingerJoints;
  middle: FingerJoints;
  ring: FingerJoints;
  little: FingerJoints;
  palmOrientation: 'up' | 'down' | 'inward' | 'outward';
  gripPressure: number;
}

export interface FacialMusclesState {
  browInnerUp: number;
  browDownLeft: number;
  browDownRight: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeSquint: number;
  eyeWide: number;
  pupilSize: number;
  pupilDirection: Vec3;
  jawOpen: number;
  mouthSmile: number;
  mouthFrown: number;
  mouthPucker: number;
  lipStretch: number;
  cheekPuff: number;
}

export interface GaitCycleState {
  phase: number; // 0 to 1
  isWalking: boolean;
  isRunning: boolean;
  isSprinting: boolean;
  strideLength: number;
  stepFrequency: number;
  leftFootGrounded: boolean;
  rightFootGrounded: boolean;
  heelStrike: boolean;
  toeOff: boolean;
  armSwingAngle: number;
}

export interface HumanPlayerConfig {
  id: string;
  name: string;
  appearance?: Partial<PlayerAppearanceConfig>;
  walkSpeed?: number;
  runSpeed?: number;
  sprintSpeed?: number;
  jumpForce?: number;
  doubleJumpAllowed?: boolean;
}

export interface PlayerPhysicsState {
  isGrounded: boolean;
  mass: number;
  gravity: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  groundFriction: number;
  centerOfMass: Vec3;
  inertiaTensor: Vec3;
  balanceRecoverySpeed: number;
  isRecoveringBalance: boolean;
}

export interface PlayerInteractable {
  id: string;
  name: string;
  type: string;
  position: Vec3;
  interactionDistance?: number;
}
