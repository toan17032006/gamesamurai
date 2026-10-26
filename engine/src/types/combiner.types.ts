// engine/src/types/combiner.types.ts — Kiểu dữ liệu cho toàn bộ hệ thống ghép nối
import type * as THREE from 'three';
import type { BlendMode, Transform } from './transform.types';

export interface IBlenderLayer {
  name: string;
  action: THREE.AnimationAction | null;
  mode: BlendMode;
  weight: number;
  timeScale: number;
  enabled: boolean;
  maskBones?: string[];
  /** Tên clip đang phát. */
  clipName?: string | null;
  /** Chế độ lặp của action. */
  loop?: THREE.AnimationActionLoopStyles;
  /** Số lần lặp (Infinity = lặp vô hạn). */
  repetitions?: number;
  /** Giữ pose cuối khi hết clip. */
  clampWhenFinished?: boolean;
  /** Layer tạm dừng. */
  paused?: boolean;
}

export interface SocketHandle {
  id?: string;
  socket?: string;
  bone: THREE.Object3D;
  asset?: THREE.Object3D;
  /** Nhóm chứa asset gắn vào socket — luôn tồn tại với handle do SocketBinder tạo. */
  group: THREE.Group;
  binding: {
    socket: string;
    assetId: string;
    offset?: Partial<Transform>;
    followBone?: boolean;
    scaleMultiplier?: number;
    slotTag?: string;
  };
}

export type UtilArg = number | string | boolean | Record<string, unknown> | THREE.Object3D;

export interface CombineOptions {
  speed?: number;
  weight?: number;
  fade?: number;
  assetId?: string;
  offset?: Partial<Transform>;
  followBone?: boolean;
  scaleMultiplier?: number;
  slotTag?: string;
  data?: UtilArg;
  intensity?: number;
  duration?: number;
}

export interface CombineResult {
  ok: boolean;
  fn: string;
  group?: string;
  layers?: any[];
  socket?: SocketHandle | null;
  info?: Record<string, unknown>;
}

export type CombinerGroup =
  | 'move'
  | 'attach'
  | 'creature'
  | 'blend'
  | 'util'
  | 'creatureCombat'
  | 'action'
  | 'acro'
  | 'env'
  | 'humanoid'
  | 'destructible'
  | 'foliage'
  | 'structure'
  | 'water'
  | 'atmosphere'
  | 'earth'
  | 'props'
  | 'animalAdvanced';

export interface CombinatorSpec {
  readonly name: string;
  readonly group: CombinerGroup;
  readonly kind: 'move' | 'attach' | 'blend' | 'util' | 'physics' | 'environment';
  readonly baseClip?: string;
  readonly overlayClip?: string;
  readonly socket?: string;
  readonly mode: BlendMode;
  readonly timeScaleKey: 'speed' | 'none';
  readonly description?: string;
}
