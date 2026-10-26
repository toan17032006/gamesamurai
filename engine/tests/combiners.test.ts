import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { COMBINERS, createEngineCombiner } from '../src/combiner/combine.js';
import { StateBlender } from '../src/combiner/state-blender.js';
import { SocketBinder } from '../src/combiner/socket-binder.js';

describe('Combiner System Engine Tests (445+ functions)', () => {
  it('has at least 445 registered combinator specifications in dictionary', () => {
    expect(COMBINERS.length).toBeGreaterThanOrEqual(445);
  });

  it('contains entries across all major groups I through XVII', () => {
    const groups = new Set(COMBINERS.map((c) => c.group));
    expect(groups.has('move')).toBe(true);
    expect(groups.has('attach')).toBe(true);
    expect(groups.has('creature')).toBe(true);
    expect(groups.has('blend')).toBe(true);
    expect(groups.has('util')).toBe(true);
    expect(groups.has('creatureCombat')).toBe(true);
    expect(groups.has('action')).toBe(true);
    expect(groups.has('acro')).toBe(true);
    expect(groups.has('env')).toBe(true);
    expect(groups.has('humanoid')).toBe(true);
    expect(groups.has('destructible')).toBe(true);
    expect(groups.has('foliage')).toBe(true);
    expect(groups.has('structure')).toBe(true);
    expect(groups.has('water')).toBe(true);
    expect(groups.has('atmosphere')).toBe(true);
    expect(groups.has('earth')).toBe(true);
    expect(groups.has('props')).toBe(true);
    expect(groups.has('animalAdvanced')).toBe(true);
  });

  it('executes movement combiner functions with fallback gracefully', () => {
    const rig = new THREE.Group();
    const blender = new StateBlender(rig);
    const binder = new SocketBinder();
    const api = createEngineCombiner(blender, binder);

    // Missing clips returns layer with disabled state gracefully
    const res1 = api.combineIdleAndWalk({ speed: 1.2 });
    expect(res1.fn).toBe('combineIdleAndWalk');
    expect(res1.layers?.length).toBe(2);

    // When clips are provided, ok is true
    const track = new THREE.QuaternionKeyframeTrack('Root.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]);
    const idleClip = new THREE.AnimationClip('Idle', 1, [track]);
    const walkClip = new THREE.AnimationClip('Walk', 1, [track]);
    blender.registerClips([idleClip, walkClip]);

    const res2 = api.combineIdleAndWalk({ speed: 1.2 });
    expect(res2.ok).toBe(true);
  });

  it('attaches equipment via socket combiners', () => {
    const rig = new THREE.Group();
    const handBone = new THREE.Bone();
    handBone.name = 'hand_r';
    rig.add(handBone);

    const blender = new StateBlender(rig);
    const binder = new SocketBinder();
    const api = createEngineCombiner(blender, binder);

    const weaponMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1));
    const res = api.attachWeaponToHand(rig, weaponMesh, { slotTag: 'main_hand' });

    expect(res.ok).toBe(true);
    expect(res.socket).toBeDefined();
    expect(handBone.children.length).toBeGreaterThan(0);
  });

  it('executes environmental combiners (foliage, destructible, water, levers)', () => {
    const rig = new THREE.Group();
    const blender = new StateBlender(rig);
    const binder = new SocketBinder();
    const api = createEngineCombiner(blender, binder);

    const treeRoot = new THREE.Group();
    const chopRes = api.combineFoliageTreeChop(treeRoot, { intensity: 1.0 });
    expect(chopRes.ok).toBe(true);

    const leverRoot = new THREE.Group();
    const leverRes = api.combineInteractiveLeverPull(leverRoot);
    expect(leverRes.ok).toBe(true);

    const waterRes = api.combineWaterBuoyancyFloat(new THREE.Group());
    expect(waterRes.ok).toBe(true);
  });
});
