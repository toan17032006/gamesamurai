// Ribbon weapon trail — PHIÊN BẢN ENGINE: ring buffer giữ nguyên, nhưng
// đường cong fade giờ dùng Easings.quadOut của engine (thay pow 1.8 tự viết).
import * as THREE from 'three';
import { Easings } from '../assets/engine-lib.js';

const N = 22;
const LIFE = 0.17; // seconds of swing the ribbon covers, independent of frame rate

export class Trail {
  constructor(scene, color = 0xcfe0ff) {
    this.color = new THREE.Color(color);
    const geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.colAttr = new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', this.posAttr);
    geo.setAttribute('color', this.colAttr);
    const idx = [];
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    geo.setIndex(idx);
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending,
      depthWrite: false, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    this.mesh.visible = false;
    this.scene = scene;
    scene.add(this.mesh);
    // ring buffers of sampled blade endpoints (world space)
    this.baseRing = new Float32Array(N * 3);
    this.tipRing = new Float32Array(N * 3);
    this.timeRing = new Float32Array(N);
    this.head = 0;      // next slot to write (newest)
    this.count = 0;     // samples written, capped at N
    this._v1 = new THREE.Vector3(); this._v2 = new THREE.Vector3();
    this.strength = 0;
  }

  setColor(hex) { this.color.setHex(hex); }

  update(active, rig, dt) {
    if (!rig || !rig.trailBase) return;
    rig.trailBase.getWorldPosition(this._v1);
    rig.trailTip.getWorldPosition(this._v2);
    const s = this.head * 3;
    this.baseRing[s] = this._v1.x; this.baseRing[s + 1] = this._v1.y; this.baseRing[s + 2] = this._v1.z;
    this.tipRing[s] = this._v2.x; this.tipRing[s + 1] = this._v2.y; this.tipRing[s + 2] = this._v2.z;
    const now = performance.now() * 0.001;
    this.timeRing[this.head] = now;
    this.head = (this.head + 1) % N;
    this.count = Math.min(this.count + 1, N);
    this.strength = active ? Math.min(1, this.strength + dt * 12) : Math.max(0, this.strength - dt * 5);
    if (this.strength <= 0.01) { this.mesh.visible = false; return; }
    this.mesh.visible = true;
    const pa = this.posAttr.array, ca = this.colAttr.array;
    for (let i = 0; i < N; i++) {
      // newest sample first: index 0 = the sample written most recently
      const slot = (this.head - 1 - i + N * 2) % N;
      const age = now - this.timeRing[slot];
      const valid = i < this.count && age < LIFE;
      const o = slot * 3;
      pa[i * 6] = valid ? this.baseRing[o] : this._v1.x;
      pa[i * 6 + 1] = valid ? this.baseRing[o + 1] : this._v1.y;
      pa[i * 6 + 2] = valid ? this.baseRing[o + 2] : this._v1.z;
      pa[i * 6 + 3] = valid ? this.tipRing[o] : this._v2.x;
      pa[i * 6 + 4] = valid ? this.tipRing[o + 1] : this._v2.y;
      pa[i * 6 + 5] = valid ? this.tipRing[o + 2] : this._v2.z;
      const f = valid ? Easings.quadOut(Math.max(0, 1 - age / LIFE)) * this.strength * 0.7 : 0;
      const r = this.color.r * f, g = this.color.g * f, bl = this.color.b * f;
      ca[i * 6] = r; ca[i * 6 + 1] = g; ca[i * 6 + 2] = bl;
      ca[i * 6 + 3] = r; ca[i * 6 + 4] = g; ca[i * 6 + 5] = bl;
    }
    this.posAttr.needsUpdate = true;
    this.colAttr.needsUpdate = true;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
