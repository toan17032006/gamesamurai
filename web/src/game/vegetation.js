// Cây cối — thân + tán đều là AssetFactory của engine, đăng ký vào
// FoliageSystem của engine. Vị trí gieo bằng RNG có seed để map ổn định.
import { AssetFactory } from '../assets/engine-lib.js';
import { CONFIG } from './config.js';

function seededRandom(seed) {
  let v = seed;
  return () => { v = (v * 16807) % 2147483647; return v / 2147483647; };
}

export function buildTrees(scene, heightAt, foliage) {
  const { count, seed, margin, minHeight } = CONFIG.world.trees;
  const size = CONFIG.world.size;
  const rand = seededRandom(seed);
  const trees = [];
  for (let i = 0; i < count; i++) {
    const x = (rand() - 0.5) * (size - margin);
    const z = (rand() - 0.5) * (size - margin);
    const y = heightAt(x, z);
    if (y < minHeight) continue; // không trồng cây dưới hồ
    const s = 0.8 + rand() * 0.8;
    const tree = AssetFactory.create({
      name: `tree_${i}`,
      parts: [
        { name: 'trunk', shape: 'cylinder', size: [0.25 * s, 1.6 * s, 0.25 * s], position: [0, 0.8 * s, 0], color: 0x6b4a2f },
        { name: 'crown', shape: 'cone', size: [1.6 * s, 2.2 * s, 1.6 * s], position: [0, 2.4 * s, 0], color: 0x2f6b2a },
      ],
    }).root;
    tree.position.set(x, y, z);
    tree.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(tree);
    foliage.registerTree(`tree_${i}`, { x, y, z });
    trees.push(tree);
  }
  return trees;
}
