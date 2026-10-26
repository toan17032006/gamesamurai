// engine/tests/world-parameter-semantics.test.ts
//
// Kiểm chứng trục "Hoạt động" — các method world/subsystems nhận tham số bắt buộc
// nhưng trước đây bỏ qua hoàn toàn (return có sẵn / không phù hợp).
//
//   vegetation-subsystem.ts      → bendBranch, flutterLeaf, calculateWindPressure,
//                                  breakBranch, snapBranchAtJoint, createVine,
//                                  flattenGrassPatch, dryGrassPatch, crushShrub
//   physics-materials-subsystem.ts → sliceObject, splitWoodLog, snapObjectInHalf,
//                                  shatterObject, calculateImpactEnergy
import { describe, it, expect } from 'vitest';
import { VegetationSubsystem } from '../src/world/subsystems/vegetation-subsystem.js';
import { PhysicsMaterialsSubsystem } from '../src/world/subsystems/physics-materials-subsystem.js';

/** Cây mẫu cho test. */
function makeTree(id = 't1') {
  return {
    id,
    species: 'Oak',
    age: 1,
    height: 5,
    thickness: 0.3,
    health: 100,
    canopyRadius: 2,
    branches: [] as string[],
    roots: [] as string[],
    position: { x: 0, y: 0, z: 0 },
  };
}

describe('VegetationSubsystem — tham số thật sự điều khiển kết quả', () => {
  it('bendBranch: lực lớn làm cành uốn nhiều hơn lực nhỏ', () => {
    const veg = new VegetationSubsystem();
    const tree = makeTree();

    const weak = veg.createBranch(tree);
    const strong = veg.createBranch(tree);

    veg.bendBranch(weak, 1);
    veg.bendBranch(strong, 50);

    expect(strong.flexForce).toBeGreaterThan(weak.flexForce);
  });

  it('flutterLeaf: tốc độ gió khác nhau cho độ rung khác nhau', () => {
    const veg = new VegetationSubsystem();
    const tree = makeTree();

    const light = veg.createLeaf(tree);
    const strong = veg.createLeaf(tree);

    veg.flutterLeaf(light, { speed: 2 });
    veg.flutterLeaf(strong, { speed: 20 });

    expect(strong.flutter).toBeGreaterThan(light.flutter);
    expect(strong.flutter).toBeLessThanOrEqual(1);
  });

  it('calculateWindPressure: vật lớn chịu áp suất gió lớn hơn vật nhỏ', () => {
    const veg = new VegetationSubsystem();
    const wind = { speed: 20 };
    const small = veg.calculateWindPressure({ size: { x: 0.2, y: 0.2, z: 0.2 } }, wind);
    const large = veg.calculateWindPressure({ size: { x: 2, y: 2, z: 2 } }, wind);
    expect(large).toBeGreaterThan(small);
    expect(small).toBeGreaterThan(0);
  });

  it('calculateWindPressure: gió mạnh hơn thì áp suất lớn hơn', () => {
    const veg = new VegetationSubsystem();
    const obj = { size: { x: 1, y: 1, z: 1 } };
    expect(veg.calculateWindPressure(obj, { speed: 30 })).toBeGreaterThan(
      veg.calculateWindPressure(obj, { speed: 10 }),
    );
  });

  it('breakBranch: lực được cộng vào ứng lực, nhánh gãy', () => {
    const veg = new VegetationSubsystem();
    const tree = makeTree();
    const branch = veg.createBranch(tree);

    veg.breakBranch(branch, 30);
    expect(branch.isBroken).toBe(true);
    expect(branch.flexForce).toBeGreaterThan(0);
  });

  it('snapBranchAtJoint: ghi nhận khớp bị gãy', () => {
    const veg = new VegetationSubsystem();
    const tree = makeTree();
    const branch = veg.createBranch(tree);

    veg.snapBranchAtJoint(branch, { id: 'joint_a' });
    expect(branch.isBroken).toBe(true);
    expect((branch as unknown as { brokenAtJoint?: unknown }).brokenAtJoint).toBe('joint_a');
  });

  it('createVine: dây leo biết mình bám vào cây nào', () => {
    const veg = new VegetationSubsystem();
    const vine = veg.createVine({ id: 'tree_7' });
    expect(vine.plantId).toBe('tree_7');
    expect(vine.attachedTo).toEqual({ id: 'tree_7' });

    const vine2 = veg.createVine('tree_8');
    expect(vine2.plantId).toBe('tree_8');
  });

  it('flattenGrassPatch: lực quyết định mức dập, vẫn giữ cờ trampled', () => {
    const veg = new VegetationSubsystem();
    const grass = veg.createGrassPatch({ x: 0, z: 0 });

    veg.flattenGrassPatch(grass, 40);
    expect(grass.trampled).toBe(true);
    expect(grass.height).toBeLessThan(grass.initialHeight);

    veg.restoreGrassPatch(grass);
    expect(grass.trampled).toBe(false);
    expect(grass.height).toBeCloseTo(grass.initialHeight, 6);
  });

  it('dryGrassPatch: tốc độ khô quyết định mức khô', () => {
    const veg = new VegetationSubsystem();
    const grass = veg.createGrassPatch({ x: 0, z: 0 });

    veg.dryGrassPatch(grass, 0.5);
    expect(grass.dryness).toBeGreaterThan(0);
    expect(grass.isDry).toBe(false);

    veg.dryGrassPatch(grass, 20);
    expect(grass.isDry).toBe(true);
  });

  it('crushShrub: lực lớn làm bụi nhỏ hơn', () => {
    const veg = new VegetationSubsystem();
    const shrub = veg.createShrub('Rose');

    veg.crushShrub(shrub, 100);
    expect(shrub.isCrushed).toBe(true);
    expect(shrub.size).toBeLessThan(1);
  });

  it('dryLeaf: tốc độ khô làm lá co lại', () => {
    const veg = new VegetationSubsystem();
    const tree = makeTree();
    const leaf = veg.createLeaf(tree);
    const initialSize = leaf.size;

    veg.dryLeaf(leaf, 2);
    expect(leaf.size).toBeLessThan(initialSize);
    expect(leaf.color).toBe('#b45309');
  });
});

describe('PhysicsMaterialsSubsystem — phá hủy theo lực/động lượng thật', () => {
  it('shatterObject: động lượng lớn cho nhiều mảnh hơn', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const weak = phys.shatterObject({ id: 'box' }, 1);
    const strong = phys.shatterObject({ id: 'box2' }, 200);
    expect(strong.length).toBeGreaterThan(weak.length);
    expect(strong.every((f: any) => f.id.startsWith('box2'))).toBe(true);
  });

  it('sliceObject: mảnh mang id gắn với vật bị cắt', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const slices = phys.sliceObject({ id: 'rock' }, { normal: { x: 0, y: 1, z: 0 } });
    expect(slices.length).toBeGreaterThan(0);
    expect(slices[0].id).toContain('rock');
  });

  it('snapObjectInHalf: lực > 0 làm vật bị phá hủy', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const obj = { id: 'stick' };
    phys.snapObjectInHalf(obj, 10);
    expect(phys.destructionStates.get('stick')?.isDestroyed).toBe(true);
  });

  it('calculateImpactEnergy: va chạm nhanh hơn thì năng lượng lớn hơn', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const a = { id: 'a' };
    const b = { id: 'b' };
    phys.initializeRigidBody(a);
    phys.initializeRigidBody(b);

    phys.rigidBodies.get('a')!.velocity = { x: 10, y: 0, z: 0 };
    phys.rigidBodies.get('b')!.velocity = { x: 0, y: 0, z: 0 };
    const fast = phys.calculateImpactEnergy(a, b);

    phys.rigidBodies.get('a')!.velocity = { x: 1, y: 0, z: 0 };
    const slow = phys.calculateImpactEnergy(a, b);

    expect(fast).toBeGreaterThan(slow);
    expect(fast).toBeGreaterThan(0);
  });

  it('defineFractureRegions: số vùng gãy phụ thuộc kích thước vật', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const small = phys.defineFractureRegions({ id: 's', size: { x: 1, y: 1, z: 1 } });
    const large = phys.defineFractureRegions({ id: 'l', size: { x: 5, y: 5, z: 5 } });
    expect(large.length).toBeGreaterThan(small.length);
  });

  it('deformSoftBody: lực lớn làm biến dạng nhiều hơn', () => {
    const phys = new PhysicsMaterialsSubsystem();
    const soft = { id: 'cloth1' };
    phys.createSoftBody(soft);

    phys.deformSoftBody(soft, 1);
    const weak = phys.softBodyStates.get('cloth1')!.deformation;
    phys.deformSoftBody(soft, 10);
    const strong = phys.softBodyStates.get('cloth1')!.deformation;

    expect(strong).toBeGreaterThan(weak);
  });
});
