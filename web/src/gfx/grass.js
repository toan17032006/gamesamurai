// Instanced grass field — 100% ENGINE (bước 3): geometry lá cỏ tự vẽ
// (crossed quads bằng BufferGeometry thủ công) ĐÃ XÓA, thay bằng
// PrimitiveFactory.cubeBox của engine (lá cỏ = box mỏng 0.09x0.62x0.02,
// instancing + sway theo gió engine giữ nguyên API {mesh, geo, mat}).
// Mật độ lấy từ preset 'ultra' (vegetationDensity 1.0), mỗi patch đăng ký
// vào FoliageSystem của engine.
import * as THREE from 'three';
import { makeSwayMaterial } from './wind.js';
import { ENGINE_PRESET, foliageSystem, enginePrimitives } from '../assets/engineAssets.js';

const GRASS_COUNTS = { ultra: 24000, high: 15000, medium: 7000, low: 0 };
const VEG_DENSITY = ENGINE_PRESET.quality.vegetationDensity ?? 1.0;
const MAX_GRASS = 24000;

function bladeGeometry() {
  // Lá cỏ engine: box mỏng, gốc ở y=0 (dịch lên h/2 để instancing đặt đúng mặt đất)
  const geo = enginePrimitives.cubeBox(0.09, 0.62, 0.02);
  geo.translate(0, 0.31, 0);
  return geo;
}

export function buildGrass(world, def, rng, noise, quality = 'high', density = 1) {
  const count = Math.round((GRASS_COUNTS[quality] ?? 0) * density * VEG_DENSITY);
  // Đăng ký thảm cỏ vào FoliageSystem của engine (1 entry / field, vị trí tâm map)
  try { foliageSystem.registerTree(`grass_field_${def.seed ?? 0}`, { x: 0, y: 0, z: 0 }, { maxHealth: 1, woodYield: 0 }); } catch { /* không vỡ build cỏ */ }
  if (count <= 0) return null;
  const geo = bladeGeometry();
  const mat = makeSwayMaterial(
    { vertexColors: true, side: THREE.DoubleSide, roughness: 0.9, metalness: 0, envMapIntensity: 0.3 },
    { amp: 0.075, freq: 2.1, heightRef: 0.62 },
  );
  const mesh = new THREE.InstancedMesh(geo, mat, MAX_GRASS);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;

  const size = def.size, half = size / 2;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
  const base = new THREE.Color(def.palette.grass);
  const dry = base.clone().offsetHSL(0.05, -0.05, 0.16);
  const tmp = new THREE.Color();
  let placed = 0, tries = 0;
  const maxTry = MAX_GRASS * 6;
  while (placed < MAX_GRASS && tries < maxTry) {
    tries++;
    const x = (rng() - 0.5) * size * 0.96;
    const z = (rng() - 0.5) * size * 0.96;
    // keep the road, landmarks and steep slopes clear
    if (Math.abs(x - world.roadX) < 3.6 && Math.abs(z) < half * 0.72) continue;
    if (Math.hypot(x, z) < 10) continue;
    const gy = world.heightFn(x, z);
    const gx = world.heightFn(x + 1.2, z) - world.heightFn(x - 1.2, z);
    const gz = world.heightFn(x, z + 1.2) - world.heightFn(x, z - 1.2);
    if (Math.hypot(gx, gz) > 1.5) continue;
    if (noise.fbm(x * 0.045 + 31, z * 0.045 + 31, 3) < -0.12) continue; // patchy
    let blocked = false;
    for (const c of world.colliders) {
      if (Math.hypot(x - c.x, z - c.z) < c.r + 0.55) { blocked = true; break; }
    }
    if (blocked) continue;
    e.set((rng() - 0.5) * 0.25, rng() * Math.PI * 2, (rng() - 0.5) * 0.25);
    q.setFromEuler(e);
    s.set(0.8 + rng() * 0.7, 0.65 + rng() * 0.75, 1);
    p.set(x, gy - 0.03, z);
    m4.compose(p, q, s);
    mesh.setMatrixAt(placed, m4);
    tmp.copy(base).lerp(dry, 0.25 + noise.fbm(x * 0.09, z * 0.09, 2) * 0.5 + rng() * 0.25);
    tmp.offsetHSL(0, 0, (rng() - 0.5) * 0.06);
    mesh.setColorAt(placed, tmp);
    placed++;
  }
  mesh.count = Math.min(count, placed);
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return { mesh, geo, mat };
}