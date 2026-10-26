// engine/tests/activity-modules.test.ts — Kiểm chứng module "Hoạt động":
// animation-baker (nướng clip, retarget) + state-blender (pha trộn đa tầng).
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  bakeClip,
  bakeClipDetailed,
  bakeClipsDetailed,
  analyzeClip,
  estimateClipBytes,
  optimizeClipKeyframes,
  retargetClip,
  retargetClipWithReport,
  trackKind,
} from '../src/asset-parser/animation-baker.js';
import {
  StateBlender,
  filterClipByMask,
  filterClipByMaskDetailed,
} from '../src/combiner/state-blender.js';

function makeRig(): THREE.Object3D {
  const root = new THREE.Object3D();
  root.name = 'Root';
  const spine = new THREE.Bone();
  spine.name = 'Spine';
  const head = new THREE.Bone();
  head.name = 'Head';
  const legL = new THREE.Bone();
  legL.name = 'LegL';
  spine.add(head);
  root.add(spine);
  root.add(legL);
  return root;
}

function quatTrack(name: string, times: number[], quats: THREE.Quaternion[]): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  for (const q of quats) values.push(q.x, q.y, q.z, q.w);
  return new THREE.QuaternionKeyframeTrack(name, times, values);
}

const IDENTITY = new THREE.Quaternion(0, 0, 0, 1);

describe('Hoạt động — animation-baker', () => {
  it('bakeClip resample đều theo sampleHz và giữ đúng mốc đầu/cuối', () => {
    const track = new THREE.VectorKeyframeTrack('Node.position', [0, 0.37, 1], [0, 0, 0, 0.5, 0.5, 0, 1, 0, 0]);
    const clip = new THREE.AnimationClip('walk', 1, [track]);
    const baked = bakeClip(clip, { sampleHz: 10 });

    const bakedTrack = baked.tracks[0];
    expect(bakedTrack.times.length).toBe(11);
    expect(bakedTrack.times[0]).toBe(0);
    expect(bakedTrack.times[bakedTrack.times.length - 1]).toBe(1);
    expect(bakedTrack.values.length).toBe(bakedTrack.times.length * 3);
  });

  it('bakeClip lược keyframe đứng yên (giữ key đầu + cuối)', () => {
    const times: number[] = [];
    const values: number[] = [];
    for (let i = 0; i <= 30; i++) {
      times.push(i / 30);
      values.push(1, 0, 0);
    }
    const clip = new THREE.AnimationClip('idle', 1, [new THREE.VectorKeyframeTrack('Node.position', times, values)]);
    const baked = bakeClip(clip, { sampleHz: 30, tolerance: 1e-4 });
    expect(baked.tracks[0].times.length).toBe(2);
    expect(baked.tracks[0].times[0]).toBe(0);
    expect(baked.tracks[0].times[1]).toBe(1);
  });

  it('bakeClip coi q và -q là CÙNG một hướng xoay → không giữ key thừa', () => {
    // q = (0,0,0,1), -q = (0,0,0,-1): cùng một hướng xoay nhưng khác dấu.
    const clip = new THREE.AnimationClip(
      'spin',
      1,
      [quatTrack('Node.quaternion', [0, 0.5, 1], [IDENTITY, new THREE.Quaternion(0, 0, 0, -1), IDENTITY])],
    );
    const baked = bakeClip(clip, { sampleHz: 30, tolerance: 1e-6, angleTolerance: 1e-3 });
    expect(baked.tracks[0].times.length).toBe(2);
  });

  it('bakeClip chuẩn hoá quaternion sau khi nướng', () => {
    const notNormalized = new THREE.Quaternion(0, 0, 0, 2); // độ dài = 2
    const clip = new THREE.AnimationClip('bad', 1, [quatTrack('Node.quaternion', [0, 1], [notNormalized, notNormalized])]);
    const baked = bakeClip(clip, { sampleHz: 10 });
    const v = baked.tracks[0].values;
    const len = Math.hypot(v[0], v[1], v[2], v[3]);
    expect(Math.abs(len - 1)).toBeLessThan(1e-5);
  });

  it('bakeClip giữ blendMode của clip gốc (clip additive không bị mất)', () => {
    const clip = new THREE.AnimationClip('add', 1, [quatTrack('Node.quaternion', [0, 1], [IDENTITY, IDENTITY])]);
    clip.blendMode = THREE.AdditiveAnimationBlendMode;
    const baked = bakeClip(clip, { sampleHz: 10 });
    expect(baked.blendMode).toBe(THREE.AdditiveAnimationBlendMode);
  });

  it('bakeClipDetailed trả báo cáo đầy đủ field', () => {
    const clip = new THREE.AnimationClip('report', 1, [
      new THREE.VectorKeyframeTrack('Bone.position', [0, 1], [0, 0, 0, 1, 1, 1]),
      quatTrack('Bone.quaternion', [0, 1], [IDENTITY, IDENTITY]),
    ]);
    const report = bakeClipDetailed(clip, { sampleHz: 10 });

    expect(report.clipName).toBe('report');
    expect(report.trackCount).toBe(2);
    expect(report.bakedTrackCount).toBe(2);
    expect(report.droppedTrackCount).toBe(0);
    expect(report.duration).toBe(1);
    expect(report.sampleHz).toBe(10);
    expect(report.positionTrackCount).toBe(1);
    expect(report.quaternionTrackCount).toBe(1);
    expect(report.originalKeyCount).toBe(4);
    expect(report.sampledKeyCount).toBe(22); // 2 track × 11 mẫu (10 Hz trong 1s)
    expect(report.bakedKeyCount).toBe(13); // track vị trí 11 key, track xoay đứng yên 2 key
    expect(report.removedKeyCount).toBe(report.sampledKeyCount - report.bakedKeyCount);
    expect(report.keyCountDelta).toBe(report.bakedKeyCount - report.originalKeyCount);
    expect(report.compressionRatio).toBeGreaterThan(0);
    expect(report.compressionRatio).toBeLessThanOrEqual(1);
    // Resample 10 Hz trên clip gốc chỉ có 2 key/track nên dung lượng có thể TĂNG.
    expect(report.estimatedBytesBefore).toBe(estimateClipBytes(clip));
    expect(report.estimatedBytesAfter).toBe(estimateClipBytes(report.clip));
    expect(report.tracks).toHaveLength(2);
    expect(report.tracks[0].kind).toBe('position');
    expect(report.tracks[1].kind).toBe('quaternion');
  });

  it('bakeClipsDetailed tổng hợp nhiều clip', () => {
    const clip = new THREE.AnimationClip('a', 1, [new THREE.VectorKeyframeTrack('B.position', [0, 1], [0, 0, 0, 1, 1, 1])]);
    const out = bakeClipsDetailed([clip, clip]);
    expect(out.clips).toHaveLength(2);
    expect(out.reports).toHaveLength(2);
    expect(out.totalOriginalKeys).toBe(4);
    expect(out.totalSampledKeys).toBe(62); // 2 clip × 1 track × 31 mẫu (mặc định 30 Hz)
    expect(out.totalBakedKeys).toBeGreaterThan(0);
    expect(out.compressionRatio).toBeGreaterThan(0);
  });

  it('analyzeClip đếm track/key/loại kênh/dung lượng/node animate', () => {
    const clip = new THREE.AnimationClip('analysis', 2, [
      new THREE.VectorKeyframeTrack('Bone.position', [0, 1], [0, 0, 0, 1, 1, 1]),
      quatTrack('Bone.quaternion', [0, 1], [IDENTITY, IDENTITY]),
      new THREE.VectorKeyframeTrack('Other.scale', [0, 1], [1, 1, 1, 1, 1, 1]),
    ]);
    const a = analyzeClip(clip);
    expect(a.name).toBe('analysis');
    expect(a.duration).toBe(2);
    expect(a.trackCount).toBe(3);
    expect(a.keyCount).toBe(6);
    expect(a.byKind.position).toBe(1);
    expect(a.byKind.quaternion).toBe(1);
    expect(a.byKind.scale).toBe(1);
    expect(a.animatedNodes).toEqual(['Bone', 'Other']);
    expect(a.estimatedBytes).toBe(estimateClipBytes(clip));
    expect(a.startTime).toBe(0);
    expect(a.endTime).toBe(1);
  });

  it('trackKind nhận diện đúng kênh', () => {
    const pos = new THREE.VectorKeyframeTrack('B.position', [0], [0, 0, 0]);
    const quat = quatTrack('B.quaternion', [0], [IDENTITY]);
    const scale = new THREE.VectorKeyframeTrack('B.scale', [0], [1, 1, 1]);
    const morph = new THREE.NumberKeyframeTrack('B.morphTargetInfluences', [0, 1], [0, 1]);
    expect(trackKind(pos)).toBe('position');
    expect(trackKind(quat)).toBe('quaternion');
    expect(trackKind(scale)).toBe('scale');
    expect(trackKind(morph)).toBe('morph');
  });

  it('optimizeClipKeyframes giảm key trên đường thẳng mà không vỡ hình dạng', () => {
    const times = [0, 1, 2, 3, 4];
    const values: number[] = [];
    for (let i = 0; i < times.length; i++) values.push(i, i * 2, i * 3);
    const clip = new THREE.AnimationClip('ramp', 4, [new THREE.VectorKeyframeTrack('B.position', times, values)]);

    const report = optimizeClipKeyframes(clip, { tolerance: 1e-3 });
    expect(report.originalKeyCount).toBe(5);
    expect(report.optimizedKeyCount).toBe(2);
    expect(report.removedKeyCount).toBe(3);
    expect(report.compressionRatio).toBeCloseTo(0.4, 5);

    // Giá trị sau tối ưu vẫn nội suy đúng tại các mốc đã bỏ.
    const track = report.clip.tracks[0];
    const interp = track.createInterpolant();
    const at = interp.evaluate(2);
    expect(at[0]).toBeCloseTo(2, 4);
    expect(at[1]).toBeCloseTo(4, 4);
    expect(at[2]).toBeCloseTo(6, 4);
  });

  it('optimizeClipKeyframes giữ key ở điểm gấp khúc', () => {
    const times = [0, 1, 2, 3];
    const values = [0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0]; // hình chữ nhật
    const clip = new THREE.AnimationClip('box', 3, [new THREE.VectorKeyframeTrack('B.position', times, values)]);
    const report = optimizeClipKeyframes(clip, { tolerance: 1e-3 });
    expect(report.optimizedKeyCount).toBe(4);
  });

  it('retargetClip đổi tên bone theo map và giữ blendMode', () => {
    const clip = new THREE.AnimationClip('a', 1, [
      new THREE.VectorKeyframeTrack('Hips.position', [0, 1], [0, 0, 0, 0, 1, 0]),
      quatTrack('Hips.quaternion', [0, 1], [IDENTITY, IDENTITY]),
    ]);
    clip.blendMode = THREE.AdditiveAnimationBlendMode;
    const retargeted = retargetClip(clip, { boneMap: { Hips: 'Bip01_Pelvis' } });
    expect(retargeted.tracks).toHaveLength(2);
    expect(retargeted.tracks[0].name).toBe('Bip01_Pelvis.position');
    expect(retargeted.tracks[1].name).toBe('Bip01_Pelvis.quaternion');
    expect(retargeted.blendMode).toBe(THREE.AdditiveAnimationBlendMode);
    expect(retargeted.tracks[0].values.length).toBe(6);
  });

  it('retargetClip hỗ trợ onlyMapped và báo cáo bone chưa map', () => {
    const clip = new THREE.AnimationClip('a', 1, [
      new THREE.VectorKeyframeTrack('Hips.position', [0, 1], [0, 0, 0, 0, 1, 0]),
      new THREE.VectorKeyframeTrack('LeftArm.position', [0, 1], [0, 0, 0, 0, 1, 0]),
    ]);
    const report = retargetClipWithReport(clip, { boneMap: { Hips: 'Pelvis' }, onlyMapped: true });
    expect(report.mappedTracks).toBe(1);
    expect(report.droppedTracks).toBe(1);
    expect(report.originalTrackCount).toBe(2);
    expect(report.keepRatio).toBeCloseTo(0.5, 5);
    expect(report.unmappedBones).toContain('LeftArm');
    expect(report.droppedTrackNames).toContain('LeftArm.position');
    expect(report.clip.tracks.map((t) => t.name)).toEqual(['Pelvis.position']);
  });

  it('retargetClip bỏ prefix và thêm prefix theo thứ tự đúng', () => {
    const clip = new THREE.AnimationClip('a', 1, [new THREE.VectorKeyframeTrack('mixamorig:Hips.position', [0], [0, 0, 0])]);
    const report = retargetClipWithReport(clip, {
      boneMap: { Hips: 'Pelvis' },
      prefixToRemove: 'mixamorig:',
      prefixToAdd: 'rig:',
    });
    expect(report.clip.tracks[0].name).toBe('rig:Pelvis.position');
  });
});

describe('Hoạt động — state-blender', () => {
  it('layer() tạo và tái sử dụng layer; play + update(dt) làm mixer.time chạy', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);

    const idle = blender.layer('idle', { mode: 'override', weight: 1 });
    expect(blender.layer('idle')).toBe(idle);
    expect(blender.layerCount).toBe(1);

    blender.play(idle, 'Idle');
    expect(idle.enabled).toBe(true);
    expect(idle.action).not.toBeNull();
    const t0 = blender.update(0.016);
    const t1 = blender.update(0.016);
    expect(t1).toBeGreaterThan(t0);
    expect(blender.mixer.time).toBeGreaterThan(0);
    expect(blender.time).toBeCloseTo(0.032, 5);
  });

  it('2 layer dùng CÙNG một clip vẫn có action RIÊNG (không chia sẻ trọng số)', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    const a = blender.play(blender.layer('a'), 'Idle');
    const b = blender.play(blender.layer('b'), 'Idle');

    expect(a.action).not.toBeNull();
    expect(b.action).not.toBeNull();
    expect(a.action).not.toBe(b.action);
    expect(a.action?.getClip()).not.toBe(b.action?.getClip());
  });

  it('clip thiếu → layer disabled, không crash, warn đúng 1 lần', () => {
    const warn = console.warn;
    let warns = 0;
    console.warn = () => {
      warns++;
    };
    try {
      const blender = new StateBlender(makeRig());
      const l1 = blender.play(blender.layer('a'), 'NotExist');
      const l2 = blender.play(blender.layer('b'), 'NotExist');
      expect(l1.enabled).toBe(false);
      expect(l2.enabled).toBe(false);
      expect(warns).toBe(1);
    } finally {
      console.warn = warn;
    }
  });

  it('mode upperBody lọc track theo bone (bỏ track chân)', () => {
    const blender = new StateBlender(makeRig());
    const clip = new THREE.AnimationClip('Aim', 1, [
      quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY]),
      quatTrack('Head.quaternion', [0, 1], [IDENTITY, IDENTITY]),
      quatTrack('LegL.quaternion', [0, 1], [IDENTITY, IDENTITY]),
    ]);
    blender.registerClips([clip]);

    const layer = blender.layer('aim', { mode: 'upperBody' });
    blender.play(layer, 'Aim');
    const names = layer.action?.getClip().tracks.map((t) => t.name) ?? [];
    expect(names).toContain('Spine.quaternion');
    expect(names).toContain('Head.quaternion');
    expect(names).not.toContain('LegL.quaternion');

    const masked = filterClipByMask(clip, { bones: ['leg*'] });
    expect(masked.tracks.map((t) => t.name)).toEqual(['LegL.quaternion']);
  });

  it('filterClipByMaskDetailed báo cáo track giữ / bị loại', () => {
    const clip = new THREE.AnimationClip('M', 1, [
      quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY]),
      quatTrack('LegL.quaternion', [0, 1], [IDENTITY, IDENTITY]),
    ]);
    const out = filterClipByMaskDetailed(clip, { bones: ['spine'] });
    expect(out.keptTracks).toEqual(['Spine.quaternion']);
    expect(out.droppedTracks).toEqual(['LegL.quaternion']);
    expect(out.keepRatio).toBeCloseTo(0.5, 5);
  });

  it('mode additive GIỮ blendMode additive kể cả khi đi kèm mask', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Breath', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    const layer = blender.play(blender.layer('breath', { mode: 'additive' }), 'Breath');
    expect(layer.action?.getClip().blendMode).toBe(THREE.AdditiveAnimationBlendMode);

    const maskedAdditive = blender.play(
      blender.layer('breathMasked', { mode: 'additive', mask: { bones: ['spine'] } }),
      'Breath',
    );
    expect(maskedAdditive.action?.getClip().blendMode).toBe(THREE.AdditiveAnimationBlendMode);
    expect(maskedAdditive.action?.getClip().tracks.map((t) => t.name)).toEqual(['Spine.quaternion']);
  });

  it('crossFade giữa 2 layer; setWeight giới hạn 0..1; stop tắt layer', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
      new THREE.AnimationClip('Walk', 1, [quatTrack('LegL.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    const a = blender.play(blender.layer('a'), 'Idle');
    const b = blender.play(blender.layer('b'), 'Walk');
    expect(blender.crossFade(a, b, 0.3)).toBe(b);
    blender.update(0.016);
    expect(blender.setWeight(a, 2)).toBe(1);
    expect(blender.setWeight(b, -1)).toBe(0);
    expect(a.weight).toBe(1);
    expect(b.weight).toBe(0);
    expect(blender.stop(a)).toBe(true);
    expect(a.enabled).toBe(false);
    expect(blender.stop('khong-ton-tai')).toBe(false);
  });

  it('getState() trả đầy đủ trạng thái runtime của từng layer', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 2, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    const layer = blender.play(blender.layer('idle', { mode: 'upperBody', timeScale: 0.5 }), 'Idle');
    blender.update(0.5);

    const state = blender.getLayerState('idle');
    expect(state).toBeDefined();
    expect(state?.name).toBe('idle');
    expect(state?.enabled).toBe(true);
    expect(state?.mode).toBe('upperBody');
    expect(state?.clipName).toBe('Idle');
    expect(state?.running).toBe(true);
    expect(state?.timeScale).toBe(0.5);
    expect(state?.trackCount).toBe(1);
    expect(state?.masked).toBe(true);
    expect(state?.additive).toBe(false);
    expect(state?.actionDuration).toBe(2);
    expect(state?.actionProgress).toBeGreaterThan(0);
    expect(blender.getState()).toHaveLength(1);
    expect(blender.getLayerState('khong-co')).toBeUndefined();
    expect(blender.activeLayerCount).toBe(1);
    expect(layer.enabled).toBe(true);
  });

  it('normalizedWeights() chuẩn hoá trọng số các layer đang chạy', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    blender.play(blender.layer('a', { weight: 0.25 }), 'Idle');
    blender.play(blender.layer('b', { weight: 0.75 }), 'Idle');

    const norm = blender.normalizedWeights();
    expect(Object.keys(norm)).toEqual(['a', 'b']);
    expect(norm.a).toBeCloseTo(0.25, 5);
    expect(norm.b).toBeCloseTo(0.75, 5);
    expect(norm.a + norm.b).toBeCloseTo(1, 5);
  });

  it('setEnabled / setPaused / setTimeScale / setMode điều khiển layer', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    const layer = blender.play(blender.layer('idle'), 'Idle');

    expect(blender.setEnabled(layer, false)).toBe(false);
    expect(layer.enabled).toBe(false);
    expect(blender.setEnabled(layer, true)).toBe(true);

    expect(blender.setTimeScale(layer, 2)).toBe(2);
    expect(layer.timeScale).toBe(2);
    expect(blender.setTimeScale(layer, Number.NaN)).toBe(1);

    expect(blender.setMode(layer, 'additive')).toBe('additive');
    expect(layer.mode).toBe('additive');

    expect(blender.setPaused(layer, true)).toBe(true);
    expect(layer.paused).toBe(true);
    expect(layer.isRunning).toBe(false);
    expect(blender.setPaused(layer, false)).toBe(false);
    expect(layer.isRunning).toBe(true);
  });

  it('findClip fuzzy: chính xác → case-insensitive → contains; hasClip/unregisterClips', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('HumanoidIdle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    expect(blender.findClip('HumanoidIdle')?.name).toBe('HumanoidIdle');
    expect(blender.findClip('humanoididle')?.name).toBe('HumanoidIdle');
    expect(blender.findClip('Idle')?.name).toBe('HumanoidIdle');
    expect(blender.findClip('Nothing')).toBeUndefined();

    expect(blender.hasClip('HumanoidIdle')).toBe(true);
    expect(blender.hasClip('Nothing')).toBe(false);
    expect(blender.unregisterClips(['HumanoidIdle'])).toBe(true);
    expect(blender.clipCount).toBe(0);
  });

  it('update() bỏ qua delta âm / NaN (không tua ngược thời gian)', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    blender.play(blender.layer('idle'), 'Idle');
    blender.update(0.1);
    const t = blender.mixer.time;
    blender.update(-5);
    blender.update(Number.NaN);
    expect(blender.mixer.time).toBeCloseTo(t, 6);
  });

  it('stopAll() dừng mọi layer', () => {
    const blender = new StateBlender(makeRig());
    blender.registerClips([
      new THREE.AnimationClip('Idle', 1, [quatTrack('Spine.quaternion', [0, 1], [IDENTITY, IDENTITY])]),
    ]);
    blender.play(blender.layer('a'), 'Idle');
    blender.play(blender.layer('b'), 'Idle');
    expect(blender.stopAll()).toBe(2);
    expect(blender.activeLayerCount).toBe(0);
  });
});
