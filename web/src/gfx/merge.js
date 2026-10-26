// Draw-call reduction — PHIÊN BẢN ENGINE: bucketing theo material/cell/shadow
// vẫn là logic riêng của game (giữ sway/noMerge riêng), nhưng việc gộp geometry
// trong mỗi bucket giờ qua mergeStatic của engine (GeometryOptimizer),
// thay cho mergeGeometries trực tiếp cũ.
import * as THREE from 'three';
import { mergeStatic } from '../assets/engine-lib.js';

const _m = new THREE.Matrix4();

function bakeGeometry(mesh) {
  const src = mesh.geometry;
  const g = src.index ? src.toNonIndexed() : src.clone();
  // keep only attributes every primitive shares, so buckets always align
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
  }
  g.applyMatrix4(mesh.matrixWorld);
  return g;
}

export function mergeStaticProps(regionGroup, cellSize = 26) {
  regionGroup.updateMatrixWorld(true);
  const buckets = new Map(); // `${cx}|${cz}|${matId}|${flags}` -> {mat, castShadow, receiveShadow, geos}
  const originals = [];
  regionGroup.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.noMerge) return;
    const mat = o.material;
    if (!mat || (mat.userData && mat.userData.windUniforms)) return; // sway mesh: keep separate
    const geo = o.geometry;
    if (!geo || !geo.attributes.position || !geo.attributes.normal) return;
    // visible world position determines the chunk (groups may be nested)
    const wp = o.getWorldPosition(new THREE.Vector3());
    const cx = Math.floor(wp.x / cellSize), cz = Math.floor(wp.z / cellSize);
    const key = `${cx}|${cz}|${mat.uuid}|${o.castShadow ? 1 : 0}${o.receiveShadow ? 1 : 0}`;
    let b = buckets.get(key);
    if (!b) {
      b = { mat, castShadow: o.castShadow, receiveShadow: o.receiveShadow, geos: [] };
      buckets.set(key, b);
    }
    b.geos.push(bakeGeometry(o));
    originals.push(o);
  });
  if (!originals.length) return [];
  const merged = [];
  for (const b of buckets.values()) {
    // Gộp qua engine: dựng group tạm từ các geometry đã bake, mergeStatic
    // trả về group đã gộp theo material, rồi gắn shadow flags của bucket.
    const tmp = new THREE.Group();
    for (const g of b.geos) {
      const m = new THREE.Mesh(g, b.mat);
      tmp.add(m);
    }
    tmp.updateMatrixWorld(true);
    const mergedGroup = mergeStatic(tmp);
    for (const g of b.geos) g.dispose();
    const outMeshes = [];
    mergedGroup.traverse((o) => { if (o.isMesh) outMeshes.push(o); });
    for (const o of outMeshes) {
      o.castShadow = b.castShadow;
      o.receiveShadow = b.receiveShadow;
      o.matrixAutoUpdate = false;
      regionGroup.add(o);
      merged.push(o);
    }
  }
  for (const o of originals) o.parent.remove(o);
  return merged;
}
