import { describe, it, expect } from 'vitest';
import { FoliageSystem } from '../src/environment/foliage-system.js';
import { StructureSystem } from '../src/environment/structure-system.js';
import { WaterSystem } from '../src/environment/water-system.js';
import { AtmosphereSystem } from '../src/environment/atmosphere-system.js';
import { TerrainSystem } from '../src/environment/terrain-system.js';
import { InteractivePropsSystem } from '../src/environment/interactive-props.js';

describe('Environment Systems Engine Tests', () => {
  it('simulates foliage tree chopping and falling progress', () => {
    const foliage = new FoliageSystem();
    foliage.registerTree('oak_1', { x: 10, y: 0, z: 15 }, { maxHealth: 50, woodYield: 20 });

    const hit1 = foliage.chopTree('oak_1', 20);
    expect(hit1.felled).toBe(false);
    expect(hit1.remainingHealth).toBe(30);

    const hit2 = foliage.chopTree('oak_1', 35, { x: 1, y: 0, z: 0 });
    expect(hit2.felled).toBe(true);
    expect(hit2.woodYield).toBe(20);

    foliage.update(0.5, { direction: { x: 1, y: 0, z: 0 }, speed: 10, gustiness: 0.5, turbulence: 0.2 });
    const tree = foliage.getTree('oak_1');
    expect(tree?.fallProgress).toBeGreaterThan(0);
  });

  it('calculates building structural integrity and collapse upon pillar destruction', () => {
    const structures = new StructureSystem();
    structures.registerStructure('watchtower', 'Watchtower', { x: 0, y: 0, z: 0 }, [
      { id: 'pillar_1', name: 'Main Pillar', isLoadBearing: true, maxHealth: 100 },
      { id: 'pillar_2', name: 'Rear Pillar', isLoadBearing: true, maxHealth: 100 },
      { id: 'wall_1', name: 'Outer Wall', isLoadBearing: false, maxHealth: 50 },
    ]);

    const res1 = structures.damageSection('watchtower', 'wall_1', 50);
    expect(res1.sectionBroken).toBe(true);
    expect(res1.isCollapsed).toBe(false);

    // Destroy 1 load bearing pillar (>50% load loss condition)
    structures.damageSection('watchtower', 'pillar_1', 100);
    const res2 = structures.damageSection('watchtower', 'pillar_2', 100);
    expect(res2.isCollapsed).toBe(true);
    expect(res2.rubbleSpawned).toBe(true);
  });

  it('samples multi-wave water surface height and dynamic ripples', () => {
    const water = new WaterSystem();
    water.registerSurface('lake', 5.0, { waveAmplitude: 1.0 });

    const calmHeight = water.getHeightAt('lake', 0, 0, 0);
    expect(calmHeight).toBeGreaterThanOrEqual(4.0);

    water.addRipple(0, 0, 2.0);
    water.update(0.1);
    const rippleHeight = water.getHeightAt('lake', 0.5, 0.5);
    expect(typeof rippleHeight).toBe('number');

    water.setFrozen('lake', true);
    expect(water.getHeightAt('lake', 10, 10)).toBe(5.0); // flat when frozen
  });

  it('computes atmospheric velocity with updrafts and vortexes', () => {
    const atmosphere = new AtmosphereSystem();
    atmosphere.setWind({ speed: 10, direction: { x: 1, y: 0, z: 0 } });

    atmosphere.addUpdraft({
      center: { x: 0, y: 0, z: 0 },
      radius: 10,
      height: 30,
      upwardVelocity: 15,
    });

    const velInside = atmosphere.getWindVelocityAt({ x: 0, y: 5, z: 0 });
    expect(velInside.y).toBeGreaterThan(10);
  });

  it('deforms terrain with craters and fissures', () => {
    const terrain = new TerrainSystem();
    terrain.applyCrater({ x: 5, y: 0, z: 5 }, 4.0, 2.5);

    const baseHeight = 10;
    const centerHeight = terrain.getDeformedHeight(5, 5, baseHeight);
    expect(centerHeight).toBeLessThan(baseHeight); // deep center

    const outsideHeight = terrain.getDeformedHeight(50, 50, baseHeight);
    expect(outsideHeight).toBe(baseHeight); // untouched outside
  });

  it('handles interactive props, lock requirements, and linked trigger chains', () => {
    const props = new InteractivePropsSystem();
    props.registerProp('lever_1', 'lever');
    props.registerProp('door_1', 'door', { isLocked: true });

    props.linkProps('lever_1', 'door_1', { triggerCondition: 'on', action: 'open' });

    // Lever pull unlocks and opens linked door
    const result1 = props.interact('door_1'); // locked directly
    expect(result1.success).toBe(false);

    const leverResult = props.interact('lever_1');
    expect(leverResult.success).toBe(true);

    const door = props.getProp('door_1');
    expect(door?.isActivated).toBe(true);
  });
});
