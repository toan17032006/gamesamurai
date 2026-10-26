// engine/src/renderer/material-mapper.ts — Áp dụng PBR Materials và chất liệu môi trường
import * as THREE from 'three';

export interface MaterialParams {
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  color?: number | string;
  emissive?: number;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
}

function copyCommon(src: THREE.Material, dst: THREE.MeshStandardMaterial): void {
  const s = src as unknown as Record<string, unknown>;
  const d = dst as unknown as Record<string, unknown>;
  if (s.color && d.color) (d.color as THREE.Color).copy(s.color as THREE.Color);
  if (s.map) d.map = s.map;
  if (s.normalMap) d.normalMap = s.normalMap;
  if (s.emissive && d.emissive) (d.emissive as THREE.Color).copy(s.emissive as THREE.Color);
  if (s.aoMap) d.aoMap = s.aoMap;
  if (s.alphaMap) d.alphaMap = s.alphaMap;
  if (s.transparent !== undefined) d.transparent = s.transparent as boolean;
  if (s.opacity !== undefined) d.opacity = s.opacity as number;
  if (s.side !== undefined) d.side = s.side as THREE.Side;
  if (s.alphaTest !== undefined) d.alphaTest = s.alphaTest as number;
  if (s.vertexColors !== undefined) d.vertexColors = s.vertexColors as boolean;
  dst.needsUpdate = true;
}

export function convertToStandard(src: THREE.Material): THREE.MeshStandardMaterial {
  if (src instanceof THREE.MeshStandardMaterial) return src;
  const std = new THREE.MeshStandardMaterial();
  copyCommon(src, std);
  src.dispose();
  return std;
}

export function setMaterialParams(root: THREE.Object3D, params: MaterialParams): number {
  let touched = 0;
  const seen = new Set<THREE.Material>();
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    const raw = (mesh as Partial<THREE.Mesh>).material;
    if (!raw) return;
    const mats = Array.isArray(raw) ? raw : [raw];
    for (let i = 0; i < mats.length; i++) {
      const original = mats[i];
      if (seen.has(original)) continue;
      seen.add(original);
      const std = convertToStandard(original);
      if (params.roughness !== undefined) std.roughness = params.roughness;
      if (params.metalness !== undefined) std.metalness = params.metalness;
      if (params.envMapIntensity !== undefined) std.envMapIntensity = params.envMapIntensity;
      if (params.color !== undefined) std.color.set(params.color);
      if (params.emissive !== undefined) std.emissive.set(params.emissive);
      if (params.emissiveIntensity !== undefined) std.emissiveIntensity = params.emissiveIntensity;
      if (params.transparent !== undefined) std.transparent = params.transparent;
      if (params.opacity !== undefined) std.opacity = params.opacity;
      if (params.side !== undefined) std.side = params.side;
      std.needsUpdate = true;
      touched++;
      if (Array.isArray(raw)) (raw as THREE.Material[])[i] = std;
      else (mesh as THREE.Mesh).material = std;
    }
  });
  return touched;
}
