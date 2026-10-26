/**
 * @file bvh-parser.ts
 * @module @aetheria/engine/asset-parser/bvh-parser
 * @description Bóc tách BVH — cây khung hình + kênh chuyển động.
 *
 * BVH gồm hai phần: `HIERARCHY` (cây JOINT/End Site kèm OFFSET/CHANNELS) và
 * `MOTION` (các frame góc Euler + vị trí). Engine chuyển cây khung thành
 * `THREE.Bone` và chuyển kênh chuyển động thành `THREE.AnimationClip`.
 */

import * as THREE from 'three';
import type { MotionBone, MotionFrame } from '../types/asset.types.js';
import type { Vec3 } from '../types/transform.types.js';

export interface BvhParseOptions {
  name?: string;
  /** Tạo AnimationClip cho three.js (mặc định true). */
  buildClip?: boolean;
}

export interface BvhParseResult {
  /** Cây xương (root là `THREE.Bone`). */
  root: THREE.Bone;
  bones: MotionBone[];
  frames: MotionFrame[];
  fps: number;
  duration: number;
  clip?: THREE.AnimationClip;
  warnings: string[];
}

type Channel = 'Xposition' | 'Yposition' | 'Zposition' | 'Xrotation' | 'Yrotation' | 'Zrotation';

interface BvhNode {
  name: string;
  offset: Vec3;
  channels: Channel[];
  children: BvhNode[];
  isEndSite: boolean;
}

/** Chuẩn hoá tên kênh (BVH viết "Xrotation" hoặc "Xrotation"). */
function normalizeChannel(raw: string): Channel | null {
  const c = raw.trim().toLowerCase();
  if (c === 'xposition') return 'Xposition';
  if (c === 'yposition') return 'Yposition';
  if (c === 'zposition') return 'Zposition';
  if (c === 'xrotation') return 'Xrotation';
  if (c === 'yrotation') return 'Yrotation';
  if (c === 'zrotation') return 'Zrotation';
  return null;
}

/** Tách các từ khóa + số trên một dòng, bỏ qua phần trong ngoặc. */
function tokenize(line: string): string[] {
  const withoutComments = line.replace(/\([^)]*\)/g, ' ');
  return withoutComments.trim().split(/\s+/).filter(Boolean);
}

function parseHierarchy(text: string): { nodes: BvhNode[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);
  const rootNodes: BvhNode[] = [];
  const stack: BvhNode[] = [];

  let inMotion = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (line.length === 0) continue;

    if (/^HIERARCHY$/i.test(line)) continue;
    if (/^MOTION$/i.test(line)) {
      inMotion = true;
      break;
    }

    const tokens = tokenize(line);
    if (tokens.length === 0) continue;
    const keyword = tokens[0].toUpperCase();

    if (keyword === 'ROOT' || keyword === 'JOINT') {
      const node: BvhNode = {
        name: tokens[1] ?? 'unnamed',
        offset: { x: 0, y: 0, z: 0 },
        channels: [],
        children: [],
        isEndSite: false,
      };
      if (stack.length > 0) stack[stack.length - 1].children.push(node);
      else rootNodes.push(node);
      stack.push(node);
    } else if (keyword === 'END') {
      // "End Site" — đẩy node ẩn
      const node: BvhNode = {
        name: 'EndSite',
        offset: { x: 0, y: 0, z: 0 },
        channels: [],
        children: [],
        isEndSite: true,
      };
      if (stack.length > 0) stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else if (keyword === 'OFFSET') {
      const node = stack[stack.length - 1];
      if (node) {
        node.offset = { x: Number(tokens[1] ?? 0), y: Number(tokens[2] ?? 0), z: Number(tokens[3] ?? 0) };
      }
    } else if (keyword === 'CHANNELS') {
      const node = stack[stack.length - 1];
      const count = Number(tokens[1] ?? 0);
      for (let i = 0; i < count; i++) {
        const ch = normalizeChannel(tokens[2 + i] ?? '');
        if (ch) node.channels.push(ch);
        else warnings.push(`BVH: bỏ qua kênh lạ "${tokens[2 + i]}"`);
      }
    } else if (keyword === '}') {
      stack.pop();
    }
  }

  if (rootNodes.length === 0) warnings.push('BVH: không tìm thấy ROOT nào.');
  return { nodes: rootNodes, warnings };
}

/** Đọc phần MOTION: số frame, frame time và các giá trị kênh. */
function parseMotion(
  text: string,
  nodes: BvhNode[],
): { frames: MotionFrame[]; fps: number; warnings: string[] } {
  const warnings: string[] = [];
  const frames: MotionFrame[] = [];
  const marker = /^\s*Frames\s*:\s*(\d+)/im.exec(text);
  const timeMatch = /^\s*Frame\s+Time\s*:\s*([\d.eE+-]+)/im.exec(text);
  const frameTime = timeMatch ? Number(timeMatch[1]) : 1 / 30;
  const fps = frameTime > 0 ? 1 / frameTime : 30;

  const motionIndex = text.search(/^\s*MOTION\s*$/im);
  if (motionIndex < 0) {
    warnings.push('BVH: thiếu phần MOTION.');
    return { frames, fps, warnings };
  }

  const body = text.slice(motionIndex);
  const dataStart = body.search(/Frame\s+Time\s*:/i);
  if (dataStart < 0) return { frames, fps, warnings };
  const afterTime = body.slice(dataStart);
  const timeLineEnd = afterTime.indexOf('\n');
  const dataText = timeLineEnd >= 0 ? afterTime.slice(timeLineEnd + 1) : '';

  // Duyệt cây theo thứ tự để biết kênh nào thuộc node nào.
  const ordered: BvhNode[] = [];
  const walk = (node: BvhNode) => {
    ordered.push(node);
    for (const c of node.children) walk(c);
  };
  for (const n of nodes) walk(n);

  const channelNodes = ordered.filter((n) => n.channels.length > 0);
  const valuesPerFrame = channelNodes.reduce((sum, n) => sum + n.channels.length, 0);
  const frameCount = marker ? Number(marker[1]) : 0;

  if (valuesPerFrame === 0) {
    warnings.push('BVH: MOTION không có kênh nào để đọc.');
    return { frames, fps, warnings };
  }

  const allNumbers = dataText
    .split(/\s+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));

  const usableFrames = Math.min(frameCount || Math.floor(allNumbers.length / valuesPerFrame), Math.floor(allNumbers.length / valuesPerFrame));

  for (let f = 0; f < usableFrames; f++) {
    const positions: Record<string, Vec3> = {};
    const rotations: Record<string, Vec3> = {};
    let cursor = f * valuesPerFrame;

    for (const node of channelNodes) {
      const p: Vec3 = { x: 0, y: 0, z: 0 };
      const r: Vec3 = { x: 0, y: 0, z: 0 };
      for (const channel of node.channels) {
        const value = allNumbers[cursor++] ?? 0;
        if (channel === 'Xposition') p.x = value;
        else if (channel === 'Yposition') p.y = value;
        else if (channel === 'Zposition') p.z = value;
        else if (channel === 'Xrotation') r.x = value;
        else if (channel === 'Yrotation') r.y = value;
        else if (channel === 'Zrotation') r.z = value;
      }
      positions[node.name] = p;
      rotations[node.name] = r;
    }

    frames.push({ time: f * frameTime, positions, rotations });
  }

  return { frames, fps, warnings };
}

/** Đệ quy dựng THREE.Bone từ cây BVH. */
function buildBones(node: BvhNode, parent: THREE.Bone | null): THREE.Bone {
  const bone = new THREE.Bone();
  bone.name = node.name;
  bone.position.set(node.offset.x, node.offset.y, node.offset.z);
  if (parent) parent.add(bone);
  for (const child of node.children) {
    buildBones(child, bone);
  }
  return bone;
}

/** Thu thập danh sách xương phẳng (không bao gồm EndSite). */
function collectBones(node: BvhNode, parentName: string | undefined, out: MotionBone[]): void {
  if (!node.isEndSite) {
    out.push({ name: node.name, parent: parentName, offset: { ...node.offset } });
  }
  for (const child of node.children) {
    collectBones(child, node.isEndSite ? parentName : node.name, out);
  }
}

export function parseBvh(bytes: Uint8Array, options: BvhParseOptions = {}): BvhParseResult {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  const { nodes, warnings: hierWarnings } = parseHierarchy(text);
  const warnings = [...hierWarnings];

  if (nodes.length === 0) {
    throw new Error('AssetParser: BVH không có cây hierarchy hợp lệ');
  }

  const rootBone = buildBones(nodes[0], null);
  rootBone.name = options.name ?? nodes[0].name;

  const bones: MotionBone[] = [];
  for (const n of nodes) collectBones(n, undefined, bones);

  const { frames, fps, warnings: motionWarnings } = parseMotion(text, nodes);
  warnings.push(...motionWarnings);

  const duration = frames.length > 0 ? frames[frames.length - 1].time : 0;

  let clip: THREE.AnimationClip | undefined;
  if (options.buildClip !== false && frames.length > 0) {
    const tracks: THREE.KeyframeTrack[] = [];
    const times = frames.map((f) => f.time);

    for (const bone of bones) {
      const posValues: number[] = [];
      const rotValues: number[] = [];
      for (const frame of frames) {
        const p = frame.positions[bone.name] ?? { x: 0, y: 0, z: 0 };
        const r = frame.rotations?.[bone.name] ?? { x: 0, y: 0, z: 0 };
        posValues.push(p.x, p.y, p.z);
        const q = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(THREE.MathUtils.degToRad(r.x), THREE.MathUtils.degToRad(r.y), THREE.MathUtils.degToRad(r.z), 'XYZ'),
        );
        rotValues.push(q.x, q.y, q.z, q.w);
      }
      tracks.push(new THREE.VectorKeyframeTrack(`${bone.name}.position`, times, posValues));
      tracks.push(new THREE.QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, rotValues));
    }
    clip = new THREE.AnimationClip(options.name ?? rootBone.name, duration, tracks);
  }

  return { root: rootBone, bones, frames, fps, duration, clip, warnings };
}
