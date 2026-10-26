import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PhysicsWorld } from '../src/physics/index.js';
import { GravityEngine } from '../src/physics/gravity-engine.js';
import { FluidSimulator } from '../src/physics/fluid-dynamics.js';
import { DestructionEngine } from '../src/physics/destruction-engine.js';
import { RagdollSolver } from '../src/physics/ragdoll-solver.js';

describe('Physics Systems Engine Tests', () => {
  it('applies gravity and respects terminal velocity', () => {
    const gravity = new GravityEngine({ g: 9.8, terminalVelocity: 30 });
    const body = {
      id: 'ball',
      mass: 5,
      position: { x: 0, y: 100, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      shape: { kind: 'sphere' as const, radius: 0.5 },
      restitution: 0.3,
      friction: 0.8,
    };

    for (let i = 0; i < 60; i++) {
      gravity.integrate(body, 0.1);
    }

    expect(body.velocity.y).toBeLessThan(0);
    expect(Math.abs(body.velocity.y)).toBeLessThanOrEqual(30.01);
  });

  it('performs accurate 3D raycasting against spheres and boxes', () => {
    const world = new PhysicsWorld();
    world.addBody({
      id: 'target_box',
      mass: 0,
      isStatic: true,
      position: { x: 0, y: 0, z: 10 },
      velocity: { x: 0, y: 0, z: 0 },
      shape: { kind: 'box', half: { x: 1, y: 1, z: 1 } },
      restitution: 0,
      friction: 1,
    });

    const hit = world.raycast(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1), 50);
    expect(hit.hit).toBe(true);
    expect(hit.bodyId).toBe('target_box');
    expect(hit.distance).toBeCloseTo(9.0, 1);
  });

  it('calculates buoyant force in fluid volumes', () => {
    const fluids = new FluidSimulator();
    fluids.addVolume({
      id: 'ocean',
      waterLevel: 0,
      density: 1.0,
      drag: 2.0,
      bounds: { min: { x: -100, y: -50, z: -100 }, max: { x: 100, y: 0, z: 100 } },
    });

    const floatingBody = {
      id: 'wood_crate',
      mass: 2,
      position: { x: 0, y: -2, z: 0 }, // submerged 2 units
      velocity: { x: 0, y: -5, z: 0 },
      shape: { kind: 'box' as const, half: { x: 0.5, y: 0.5, z: 0.5 } },
      restitution: 0.1,
      friction: 0.5,
    };

    fluids.step([floatingBody], 0.1);
    // Buoyancy should accelerate it upwards
    expect(floatingBody.velocity.y).toBeGreaterThan(-5);
  });

  it('shatters meshes into physics shards using DestructionEngine', () => {
    const destruction = new DestructionEngine();
    const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial());
    cube.position.set(0, 5, 0);

    const shatterGroup = destruction.shatterMesh(cube, new THREE.Vector3(0, 5, 0), 10, 8);
    expect(shatterGroup.children.length).toBe(8);
    expect(destruction.activeCount).toBe(8);

    destruction.step(0.1, 0);
    expect(destruction.activeCount).toBe(8);
  });

  it('simulates Verlet ragdoll skeleton joints', () => {
    const ragdoll = new RagdollSolver({
      rootPosition: new THREE.Vector3(0, 5, 0),
      points: [
        { id: 'head', position: new THREE.Vector3(0, 6, 0), mass: 1 },
        { id: 'torso', position: new THREE.Vector3(0, 5, 0), mass: 2 },
      ],
      constraints: [
        { a: 'head', b: 'torso', distance: 1.0, stiffness: 0.9 },
      ],
    });

    ragdoll.step(0.1, 0);
    const head = ragdoll.getPoint('head');
    const torso = ragdoll.getPoint('torso');

    expect(head).toBeDefined();
    expect(torso).toBeDefined();
    const currentDist = head!.position.distanceTo(torso!.position);
    expect(currentDist).toBeCloseTo(1.0, 1);
  });
});
