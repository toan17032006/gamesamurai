/**
 * @file motion-parser.ts
 * @module @aetheria/engine/asset-parser/motion-parser
 * @description Motion parser and retargeter for .bvh and .vmd animation formats.
 * Extracts skeletal tracks, performs coordinate adaptation, and generates baked animation clips.
 */

import * as THREE from 'three';
import { parseBvh } from './bvh-parser.js';
import { parseVmd } from './vmd-parser.js';
import { EngineResult, engineOk, engineErr } from '../types/engine.types.js';
import type { AnimationMotionFormat } from '../types/format.types.js';

export interface MotionTrack {
  boneName: string;
  times: Float32Array;
  positions?: Float32Array; // 3 floats per keyframe
  rotations: Float32Array; // 4 floats per keyframe (quaternion x,y,z,w)
  scales?: Float32Array;
}

export interface BakedMotionData {
  name: string;
  duration: number;
  fps: number;
  frameCount: number;
  tracks: MotionTrack[];
  bones: Array<{ name: string; parent?: string; restPosition?: [number, number, number] }>;
  threeClip?: THREE.AnimationClip;
}

export interface MotionParseOptions {
  name?: string;
  targetFPS?: number;
  scale?: number;
  retargetMap?: Record<string, string>; // sourceBone -> targetBone
}

export class MotionParser {
  /**
   * Parses motion from either BVH or VMD format
   */
  public static parse(
    input: ArrayBuffer | Uint8Array | string,
    format: AnimationMotionFormat,
    options?: MotionParseOptions
  ): EngineResult<BakedMotionData> {
    try {
      const bytes = input instanceof Uint8Array
        ? input
        : new Uint8Array(
            input instanceof ArrayBuffer
              ? input
              : new TextEncoder().encode(input)
          );

      if (format === 'bvh') {
        const bvhResult = parseBvh(bytes, { name: options?.name });

        const tracks: MotionTrack[] = [];
        if (bvhResult.clip) {
          for (const track of bvhResult.clip.tracks) {
            const rawBoneName = track.name.split('.')[0];
            const mappedName = options?.retargetMap?.[rawBoneName] ?? rawBoneName;

            if (track instanceof THREE.QuaternionKeyframeTrack) {
              tracks.push({
                boneName: mappedName,
                times: new Float32Array(track.times),
                rotations: new Float32Array(track.values)
              });
            } else if (track instanceof THREE.VectorKeyframeTrack) {
              const existing = tracks.find(t => t.boneName === mappedName);
              if (existing) {
                existing.positions = new Float32Array(track.values);
              } else {
                tracks.push({
                  boneName: mappedName,
                  times: new Float32Array(track.times),
                  rotations: new Float32Array(0),
                  positions: new Float32Array(track.values)
                });
              }
            }
          }
        }

        const scaleVal = options?.scale ?? 1.0;
        const bones = bvhResult.bones.map(b => ({
          name: options?.retargetMap?.[b.name] ?? b.name,
          parent: b.parent ? (options?.retargetMap?.[b.parent] ?? b.parent) : undefined,
          restPosition: [b.offset.x * scaleVal, b.offset.y * scaleVal, b.offset.z * scaleVal] as [number, number, number]
        }));

        return engineOk({
          name: options?.name ?? 'bvh_clip',
          duration: bvhResult.duration,
          fps: bvhResult.fps,
          frameCount: bvhResult.frames.length,
          tracks,
          bones,
          threeClip: bvhResult.clip
        });
      } else if (format === 'vmd') {
        const vmdResult = parseVmd(bytes);
        const tracks: MotionTrack[] = [];

        if (vmdResult.clip) {
          for (const track of vmdResult.clip.tracks) {
            const rawBoneName = track.name.split('.')[0];
            const mappedName = options?.retargetMap?.[rawBoneName] ?? rawBoneName;

            if (track instanceof THREE.QuaternionKeyframeTrack) {
              tracks.push({
                boneName: mappedName,
                times: new Float32Array(track.times),
                rotations: new Float32Array(track.values)
              });
            } else if (track instanceof THREE.VectorKeyframeTrack) {
              const existing = tracks.find(t => t.boneName === mappedName);
              if (existing) {
                existing.positions = new Float32Array(track.values);
              } else {
                tracks.push({
                  boneName: mappedName,
                  times: new Float32Array(track.times),
                  rotations: new Float32Array(0),
                  positions: new Float32Array(track.values)
                });
              }
            }
          }
        }

        const bones = vmdResult.bones.map(b => ({
          name: options?.retargetMap?.[b.name] ?? b.name,
          parent: b.parent ? (options?.retargetMap?.[b.parent] ?? b.parent) : undefined
        }));

        return engineOk({
          name: options?.name ?? vmdResult.name ?? 'vmd_clip',
          duration: vmdResult.duration,
          fps: vmdResult.fps,
          frameCount: vmdResult.frameCount,
          tracks,
          bones,
          threeClip: vmdResult.clip
        });
      }

      return engineErr({
        code: 'UNSUPPORTED_MOTION_FORMAT',
        message: `Unsupported motion format: ${format}`,
        subsystem: 'MotionParser'
      });
    } catch (err: unknown) {
      return engineErr({
        code: 'MOTION_PARSE_FAILED',
        message: `Failed to parse motion: ${err instanceof Error ? err.message : String(err)}`,
        subsystem: 'MotionParser',
        stack: err instanceof Error ? err.stack : undefined
      });
    }
  }

  /**
   * Retargets an existing baked motion dataset to a different skeletal topology
   */
  public static retarget(
    motion: BakedMotionData,
    retargetMap: Record<string, string>
  ): BakedMotionData {
    const newTracks: MotionTrack[] = motion.tracks.map(t => ({
      ...t,
      boneName: retargetMap[t.boneName] ?? t.boneName
    }));

    const newBones = motion.bones.map(b => ({
      ...b,
      name: retargetMap[b.name] ?? b.name,
      parent: b.parent ? (retargetMap[b.parent] ?? b.parent) : undefined
    }));

    return {
      ...motion,
      tracks: newTracks,
      bones: newBones
    };
  }
}
