// Terrain — ENGINE (bước 3): texture canvas tự vẽ (detail albedo + normal map
// bằng CanvasTexture) ĐÃ XÓA. Mặt đất giờ chỉ dùng vertex colors theo palette
// + material chuẩn của engine (roughness/envMapIntensity qua preset ultra),
// chiều cao lấy qua TerrainSystem.getDeformedHeight(base) của engine — nếu
// sau này có applyCrater/applyFissure thì mesh và heightFn cùng đổi theo
// (xem systems/world.js: heightFn cũng qua terrainSystem).
// Segment giữ nguyên preset ultra: 192, anisotropy tới 16.
import * as THREE from 'three';
import { ENGINE_PRESET, terrainSystem } from '../assets/engineAssets.js';

function anisotropyFor(world) {
  try { return Math.min(16, world.game.engine.renderer.capabilities.getMaxAnisotropy()); } catch { return 8; }
}

export function buildTerrain(world, def, quality = 'high') {
  const size = def.size;
  const seg = quality === 'ultra' ? 192 : quality === 'low' ? 128 : 160;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);

  const aniso = anisotropyFor(world);

  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const colors = new Float32Array(pos.count * 3);
  const pal = new THREE.Color(def.palette.grass);
  const pal2 = pal.clone().offsetHSL(0.03, 0.02, -0.06);
  const dirt = new THREE.Color(def.palette.dirt);
  const rock = new THREE.Color(def.palette.rock);
  const pathC = new THREE.Color(def.palette.path);
  const c = new THREE.Color();
  // deterministic per-vertex jitter
  let s = def.seed * 7 + 13;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = terrainSystem.getDeformedHeight(x, z, world.heightFn(x, z));
    pos.setY(i, y);
    // tile the detail textures across the map (~7m per tile)
    uv.setXY(i, uv.getX(i) * (size / 7), uv.getY(i) * (size / 7));

    const hN = (y - world.baseY) / 14;
    c.copy(pal).lerp(pal2, rnd());
    if (hN > 0.35) c.lerp(rock, Math.min((hN - 0.35) / 0.5, 1));
    if (hN < 0.08) c.lerp(dirt, 0.55);
    const road = Math.max(0, 1 - Math.abs(x - world.roadX) / 5.5) * (1 - Math.abs(z) / (size / 2));
    if (road > 0.01) c.lerp(pathC, road * 0.85);
    // valley + crease AO, subtle vertex jitter
    const ao = 0.78 + 0.22 * Math.min(1, Math.max(0, (y - world.baseY) / 6 + 0.35));
    const j = 0.94 + rnd() * 0.12;
    const a = ao * j;
    colors[i * 3] = c.r * a; colors[i * 3 + 1] = c.g * a; colors[i * 3 + 2] = c.b * a;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.96, metalness: 0,
    envMapIntensity: 0.25,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'terrain';
  return { mesh, geo, mat };
}
