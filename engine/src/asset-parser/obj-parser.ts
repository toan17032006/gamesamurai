// engine/src/asset-parser/obj-parser.ts — Trình phân giải OBJ & MTL chuyên sâu kèm Zoom & Pivot trực tiếp
import * as THREE from 'three';
import { applyPivot } from '../transformer/pivot-adjuster';
import { zoomAsset } from '../transformer/scaler';
import type { ZoomSpec, PivotSpec } from '../types/transform.types';

export interface ObjParseOptions {
  mtlText?: string;
  textureLoader?: (uri: string) => THREE.Texture | Promise<THREE.Texture>;
  zoom?: ZoomSpec;
  pivot?: PivotSpec;
  name?: string;
}

export interface MtlMaterialDef {
  name: string;
  color?: THREE.Color;
  specular?: THREE.Color;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
  mapUri?: string;
  bumpMapUri?: string;
  alphaMapUri?: string;
}

export function parseMtl(mtlText: string): Map<string, MtlMaterialDef> {
  const materials = new Map<string, MtlMaterialDef>();
  let currentMat: MtlMaterialDef | null = null;

  const lines = mtlText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    const keyword = parts[0].toLowerCase();

    if (keyword === 'newmtl' && parts.length > 1) {
      const name = parts[1];
      currentMat = {
        name,
        color: new THREE.Color(0xcccccc),
        roughness: 0.6,
        metalness: 0.1,
        opacity: 1,
        transparent: false,
      };
      materials.set(name, currentMat);
    } else if (currentMat) {
      if (keyword === 'kd' && parts.length >= 4) {
        currentMat.color = new THREE.Color(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (keyword === 'ks' && parts.length >= 4) {
        currentMat.specular = new THREE.Color(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (keyword === 'ns' && parts.length >= 2) {
        const ns = parseFloat(parts[1]);
        currentMat.roughness = Math.max(0.05, Math.min(1.0, 1.0 - Math.log(Math.max(1, ns)) / Math.log(1000)));
      } else if (keyword === 'd' && parts.length >= 2) {
        const d = parseFloat(parts[1]);
        currentMat.opacity = d;
        if (d < 1) currentMat.transparent = true;
      } else if (keyword === 'tr' && parts.length >= 2) {
        const tr = parseFloat(parts[1]);
        currentMat.opacity = 1 - tr;
        if (tr > 0) currentMat.transparent = true;
      } else if ((keyword === 'map_kd' || keyword === 'map_diffuse') && parts.length >= 2) {
        currentMat.mapUri = parts.slice(1).join(' ');
      } else if ((keyword === 'map_bump' || keyword === 'bump') && parts.length >= 2) {
        currentMat.bumpMapUri = parts.slice(1).join(' ');
      } else if (keyword === 'map_d' && parts.length >= 2) {
        currentMat.alphaMapUri = parts.slice(1).join(' ');
        currentMat.transparent = true;
      }
    }
  }

  return materials;
}

export function parseObj(objText: string, opts: ObjParseOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = opts.name ?? 'ParsedObjModel';

  const mtlDefs = opts.mtlText ? parseMtl(opts.mtlText) : new Map<string, MtlMaterialDef>();
  const createdMaterials = new Map<string, THREE.Material>();

  const getOrCreateMaterial = (name: string): THREE.Material => {
    if (createdMaterials.has(name)) return createdMaterials.get(name)!;

    const def = mtlDefs.get(name);
    let mat: THREE.MeshStandardMaterial;
    if (def) {
      mat = new THREE.MeshStandardMaterial({
        color: def.color ?? 0xcccccc,
        roughness: def.roughness ?? 0.6,
        metalness: def.metalness ?? 0.1,
        opacity: def.opacity ?? 1,
        transparent: def.transparent ?? false,
      });
      if (def.mapUri && opts.textureLoader) {
        const tex = opts.textureLoader(def.mapUri);
        if (tex instanceof THREE.Texture) mat.map = tex;
      }
    } else {
      mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.1 });
    }
    mat.name = name;
    createdMaterials.set(name, mat);
    return mat;
  };

  const rawPositions: number[][] = [];
  const rawNormals: number[][] = [];
  const rawUvs: number[][] = [];

  interface FaceVertex {
    vIdx: number;
    tIdx?: number;
    nIdx?: number;
  }

  interface SubmeshBuild {
    name: string;
    materialName: string;
    faces: FaceVertex[][];
  }

  const submeshes: SubmeshBuild[] = [];
  let currentSubmesh: SubmeshBuild = {
    name: 'default',
    materialName: 'default',
    faces: [],
  };
  submeshes.push(currentSubmesh);

  const lines = objText.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === 'v' && parts.length >= 4) {
      rawPositions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (cmd === 'vn' && parts.length >= 4) {
      rawNormals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    } else if (cmd === 'vt' && parts.length >= 3) {
      rawUvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
    } else if (cmd === 'usemtl' && parts.length >= 2) {
      const matName = parts[1];
      if (currentSubmesh.faces.length > 0) {
        currentSubmesh = {
          name: `${currentSubmesh.name}_${matName}`,
          materialName: matName,
          faces: [],
        };
        submeshes.push(currentSubmesh);
      } else {
        currentSubmesh.materialName = matName;
      }
    } else if ((cmd === 'g' || cmd === 'o') && parts.length >= 2) {
      const objName = parts[1];
      if (currentSubmesh.faces.length > 0) {
        currentSubmesh = {
          name: objName,
          materialName: currentSubmesh.materialName,
          faces: [],
        };
        submeshes.push(currentSubmesh);
      } else {
        currentSubmesh.name = objName;
      }
    } else if (cmd === 'f' && parts.length >= 4) {
      const faceVerts: FaceVertex[] = [];
      for (let i = 1; i < parts.length; i++) {
        const token = parts[i];
        const segs = token.split('/');
        const v = parseInt(segs[0], 10);
        const vIdx = v > 0 ? v - 1 : rawPositions.length + v;
        const tIdx = segs[1] && segs[1].length > 0 ? (parseInt(segs[1], 10) > 0 ? parseInt(segs[1], 10) - 1 : rawUvs.length + parseInt(segs[1], 10)) : undefined;
        const nIdx = segs[2] && segs[2].length > 0 ? (parseInt(segs[2], 10) > 0 ? parseInt(segs[2], 10) - 1 : rawNormals.length + parseInt(segs[2], 10)) : undefined;
        faceVerts.push({ vIdx, tIdx, nIdx });
      }
      currentSubmesh.faces.push(faceVerts);
    }
  }

  for (const sm of submeshes) {
    if (sm.faces.length === 0) continue;

    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    for (const face of sm.faces) {
      // Triangulate convex n-gons (fan triangulation)
      for (let i = 1; i < face.length - 1; i++) {
        const tri = [face[0], face[i], face[i + 1]];
        for (const vert of tri) {
          const p = rawPositions[vert.vIdx];
          if (p) positions.push(p[0], p[1], p[2]);
          else positions.push(0, 0, 0);

          if (vert.nIdx !== undefined && rawNormals[vert.nIdx]) {
            const n = rawNormals[vert.nIdx];
            normals.push(n[0], n[1], n[2]);
          }

          if (vert.tIdx !== undefined && rawUvs[vert.tIdx]) {
            const uv = rawUvs[vert.tIdx];
            uvs.push(uv[0], uv[1]);
          }
        }
      }
    }

    if (positions.length === 0) continue;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    } else {
      geo.computeVertexNormals();
    }
    if (uvs.length === (positions.length / 3) * 2) {
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }

    const material = getOrCreateMaterial(sm.materialName);
    const mesh = new THREE.Mesh(geo, material);
    mesh.name = sm.name;
    root.add(mesh);
  }

  // Áp dụng Pivot điều chỉnh nếu có
  if (opts.pivot) {
    applyPivot(root, opts.pivot);
  }

  // Áp dụng Zoom hiệu chỉnh nếu có
  if (opts.zoom) {
    zoomAsset(root, opts.zoom);
  }

  return root;
}
