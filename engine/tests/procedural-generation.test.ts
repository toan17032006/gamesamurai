import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { CharacterFactory } from '../src/procedural/character-factory.js';
import { MonsterFactory } from '../src/procedural/monster-factory.js';
import { AssetExporter } from '../src/procedural/asset-exporter.js';
import { AssetCombiner } from '../src/procedural/asset-combiner.js';

describe('Procedural Synthesis & Exporter Engine Tests', () => {
  it('generates fully rigged procedural humanoid character with sockets', () => {
    const character = CharacterFactory.buildCharacter({
      seed: 42,
      archetype: 'warrior',
      height: 1.85,
    });

    expect(character.root).toBeDefined();
    expect(character.boneHierarchy.length).toBeGreaterThan(5);
    expect(character.sockets.spine).toBeDefined();
    expect(character.sockets.head).toBeDefined();
  });

  it('generates procedural monsters deterministically from seed', () => {
    const m1 = MonsterFactory.buildMonster({ seed: 1337, posture: 'quad' });
    const m2 = MonsterFactory.buildMonster({ seed: 1337, posture: 'quad' });

    expect(m1.root.children.length).toBe(m2.root.children.length);
    expect(m1.animationsHint).toContain('Walk');
  });

  it('exports Object3D to Wavefront OBJ + MTL format', () => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    box.name = 'RedCube';

    const result = AssetExporter.exportToObj(box);
    expect(result.obj).toContain('o RedCube');
    expect(result.obj).toContain('v ');
    expect(result.obj).toContain('f ');
    expect(result.mtl).toContain('newmtl');
  });

  it('exports Object3D to standard binary GLB container', () => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial());
    sphere.name = 'TestSphere';

    const glb = AssetExporter.exportToGlb(sphere);
    expect(glb).toBeInstanceOf(Uint8Array);
    expect(glb.byteLength).toBeGreaterThan(50);

    // Verify GLB magic header 0x46546C67 ('glTF')
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    const magic = view.getUint32(0, true);
    expect(magic).toBe(0x46546c67);
  });

  it('combines procedural gear onto a character model via AssetCombiner', () => {
    const character = CharacterFactory.buildCharacter({ seed: 101, archetype: 'knight' });
    const wings = AssetCombiner.attachProceduralGear(character, 'wings', { color: 0xffeeaa });

    expect(wings).toBeDefined();
    expect(character.sockets.spine.children).toContain(wings);
  });
});
