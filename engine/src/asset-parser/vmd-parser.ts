/**
 * @file vmd-parser.ts
 * @module @aetheria/engine/asset-parser/vmd-parser
 * @description Bóc tách VMD (Vocaloid Motion Data) — chuyển động MikuMikuDance.
 *
 * Cấu trúc tệp:
 *   header 30 byte ("Vocaloid Motion Data 0002")
 *   tên model 20 byte (Shift-JIS, zero-padded)
 *   số bone (uint32)
 *   mỗi bone: tên 15 byte, vị trí 3×float32, xoay 4×float32, bảng nội suy 64 byte
 *   số morph (uint32) + frame morph
 *   số camera (uint32) + frame camera
 *   số lamp (uint32) + frame lamp
 *   số self-shadow (uint32) + frame self-shadow
 *   số IK (uint32) + dữ liệu IK
 */

import * as THREE from 'three';
import type { MotionBone, MotionFrame } from '../types/asset.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface VmdParseOptions {
  name?: string;
  /** Tạo AnimationClip cho three.js (mặc định true). */
  buildClip?: boolean;
}

export interface VmdParseResult {
  name: string;
  bones: MotionBone[];
  frames: MotionFrame[];
  frameCount: number;
  duration: number;
  fps: number;
  clip?: THREE.AnimationClip;
  warnings: string[];
}

const VMD_SIGNATURE = 'Vocaloid Motion';
const BONE_RECORD_BYTES = 15 + 12 + 16 + 64;

/** Giải mã chuỗi Shift-JIS (VMD dùng mã này cho tên bone/model). */
function decodeShiftJis(bytes: Uint8Array): string {
  try {
    return new TextDecoder('shift_jis').decode(bytes).replace(/\0+$/g, '').trim();
  } catch {
    // Môi trường không có ICU shift_jis — suy ra ASCII, vẫn giữ phần đọc được.
    let out = '';
    for (const b of bytes) {
      if (b === 0) break;
      out += String.fromCharCode(b);
    }
    return out.trim();
  }
}

export function parseVmd(bytes: Uint8Array, options: VmdParseOptions = {}): VmdParseResult {
  const warnings: string[] = [];
  if (bytes.length < 30) {
    throw new Error('AssetParser: tệp VMD quá nhỏ');
  }

  const signature = new TextDecoder('ascii').decode(bytes.subarray(0, 15));
  if (!signature.startsWith(VMD_SIGNATURE)) {
    throw new Error(`AssetParser: không phải tệp VMD (chữ ký "${signature}")`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 30;

  const modelName = decodeShiftJis(bytes.subarray(offset, offset + 20));
  offset += 20;

  if (offset + 4 > bytes.length) {
    throw new Error('AssetParser: VMD bị cắt cụt trước phần bone');
  }
  const boneCount = view.getUint32(offset, true);
  offset += 4;

  const bones: MotionBone[] = [];
  const boneNames: string[] = [];
  /** Mỗi bone: vị trí + xoay theo frame. */
  const boneTracks: Array<{ name: string; position: Vec3; quaternion: [number, number, number, number] }[]> = [];

  for (let i = 0; i < boneCount; i++) {
    if (offset + BONE_RECORD_BYTES > bytes.length) {
      warnings.push(`VMD: thiếu dữ liệu bone (đọc được ${i}/${boneCount}).`);
      break;
    }
    const name = decodeShiftJis(bytes.subarray(offset, offset + 15));
    offset += 15;

    const position: Vec3 = { x: view.getFloat32(offset, true), y: view.getFloat32(offset + 4, true), z: view.getFloat32(offset + 8, true) };
    offset += 12;

    const quaternion: [number, number, number, number] = [
      view.getFloat32(offset, true),
      view.getFloat32(offset + 4, true),
      view.getFloat32(offset + 8, true),
      view.getFloat32(offset + 12, true),
    ];
    offset += 16;

    // Bảng nội suy 4 kênh × 16 đoạn (uint32) — Engine hiện dùng nội suy tuyến tính.
    offset += 64;

    boneNames.push(name);
    bones.push({ name, offset: { ...position } });
    boneTracks.push([{ name, position, quaternion }]);
  }

  // ---- Các khối còn lại: chỉ cần bỏ qua nhưng phải đọc đúng để không lệch ----
  const skipFrames = (recordBytes: number, count: number): void => {
    for (let i = 0; i < count; i++) {
      offset += recordBytes;
      if (offset > bytes.length) {
        warnings.push('VMD: khối dữ liệu bị cắt cụt.');
        offset = bytes.length;
        return;
      }
    }
  };

  const readCount = (): number => {
    if (offset + 4 > bytes.length) return 0;
    const c = view.getUint32(offset, true);
    offset += 4;
    return c;
  };

  // Morph: mỗi frame = frame number (uint32) + weight (float32) + time (uint32)
  const morphCount = readCount();
  skipFrames(12, morphCount);
  // Camera: frame number (uint32) + distance(4) + position(12) + rotation(12) + interval(24) + perspective(4)
  const cameraCount = readCount();
  skipFrames(64, cameraCount);
  // Lamp: frame number (uint32) + color(12) + position(12) + direction(12)
  const lampCount = readCount();
  skipFrames(40, lampCount);
  // Self shadow: frame number (uint32) + mode(1) + distance(4) + 2× color(12)
  const shadowCount = readCount();
  skipFrames(24, shadowCount);
  // IK: 4 x uint32 + 1 byte
  const ikCount = readCount();
  skipFrames(21, ikCount);

  // ---- Gom frame: mỗi bone có 1 keyframe trong VMD, frame number = 0-based theo thứ tự ----
  const frameCount = boneNames.length;
  const frames: MotionFrame[] = [];
  const FPS = 30;

  for (let f = 0; f < frameCount; f++) {
    const positions: Record<string, Vec3> = {};
    const rotations: Record<string, Vec3> = {};
    for (let b = 0; b < boneNames.length; b++) {
      const track = boneTracks[b]?.[f];
      if (!track) continue;
      positions[track.name] = { ...track.position };
      const q = new THREE.Quaternion(track.quaternion[0], track.quaternion[1], track.quaternion[2], track.quaternion[3]);
      const euler = new THREE.Euler().setFromQuaternion(q, 'XYZ');
      rotations[track.name] = { x: euler.x, y: euler.y, z: euler.z };
    }
    frames.push({ time: f / FPS, positions, rotations });
  }

  const duration = frameCount > 0 ? (frameCount - 1) / FPS : 0;

  let clip: THREE.AnimationClip | undefined;
  if (options.buildClip !== false && frameCount > 0) {
    const tracks: THREE.KeyframeTrack[] = [];
    const times = frames.map((f) => f.time);
    for (let b = 0; b < boneNames.length; b++) {
      const name = boneNames[b];
      const posValues: number[] = [];
      const rotValues: number[] = [];
      for (const frame of frames) {
        const p = frame.positions[name] ?? { x: 0, y: 0, z: 0 };
        const r = frame.rotations?.[name] ?? { x: 0, y: 0, z: 0 };
        posValues.push(p.x, p.y, p.z);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r.x, r.y, r.z, 'XYZ'));
        rotValues.push(q.x, q.y, q.z, q.w);
      }
      tracks.push(new THREE.VectorKeyframeTrack(`${name}.position`, times, posValues));
      tracks.push(new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, rotValues));
    }
    clip = new THREE.AnimationClip(options.name ?? (modelName || 'vmd'), duration, tracks);
  }

  return {
    name: options.name ?? (modelName || 'VmdMotion'),
    bones,
    frames,
    frameCount,
    duration,
    fps: FPS,
    clip,
    warnings,
  };
}
