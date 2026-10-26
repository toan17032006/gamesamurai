// engine/src/asset-parser/metadata-loader.ts — Đọc file cấu hình JSON/YAML & suy đoán metadata asset
import * as THREE from 'three';
import type { AssetCategory, AssetMetadata, RigKind } from '../types/asset.types';

const CATEGORY_RULES: ReadonlyArray<readonly [AssetCategory, RegExp]> = [
  ['character', /character|hero|player|fantasy|warrior|knight|human/i],
  ['monster', /monster|enemy|boss|demon|beast|oni|yokai|undead/i],
  ['npc', /npc|villager|merchant|vendor/i],
  ['weapon', /weapon|sword|katana|blade|bow|axe|spear|dagger|gun|staff/i],
  ['armor', /armor|armour|helmet|chestplate|pauldron|cloth|outfit|costume/i],
  ['mount', /mount|horse|riding/i],
  ['vegetation', /tree|plant|grass|bush|flower|vegetation|bamboo|forest/i],
  ['building', /building|house|castle|tower|wall|bridge|temple|shrine|roof|gate/i],
  ['vfx', /vfx|\bfx\b|effect|particle|smoke|fire|explosion|slash|trail/i],
  ['environment', /environment|terrain|rock|stone|ground|cliff|landscape|sky/i],
  ['prop', /prop|crate|barrel|lamp|banner|furniture|pot/i],
];

const RIG_RULES: ReadonlyArray<readonly [RigKind, RegExp]> = [
  ['humanoid', /mixamorig|humanoid|\bhips\b.*\bspine\b|pelvis.*spine|\br_?hand\b.*\bl_?hand\b/i],
  ['bird', /\bwing(s)?\b|\bbeak\b|\bfeather(s)?\b/i],
  ['fish', /\bfin(s)?\b|\wfin(s)?\b|\bcaudal\b/i],
  ['quadruped', /\bpaw(s)?\b|\bhind_?leg\b|\bfront_?leg\b|quadruped/i],
  ['tentacle', /tentacle|whip|tail|appendage/i],
  ['insect', /spider|insect|beetle|centipede|claw/i],
];

export function nameFromPath(path: string): string {
  const base = path.split(/[\\/]/).pop() ?? path;
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, '');
  return withoutExt.replace(/[_\-]+/g, ' ').trim();
}

export function formatFromPath(path: string): string {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(path);
  return (m?.[1] ?? 'unknown').toLowerCase();
}

export function categoryFromPath(path: string): AssetCategory {
  for (const [category, re] of CATEGORY_RULES) {
    if (re.test(path)) return category;
  }
  return 'misc';
}

export function collectBoneNames(root: THREE.Object3D): string[] {
  const names = new Set<string>();
  root.traverse((child) => {
    const skinned = child as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      for (const b of skinned.skeleton.bones) names.add(b.name);
    }
    if ((child as THREE.Bone).isBone) names.add(child.name);
  });
  return Array.from(names);
}

export function rigFromBoneNames(boneNames: string[]): RigKind {
  if (boneNames.length === 0) return 'static';
  const joined = boneNames.join(' ').replace(/[_:]/g, ' ').toLowerCase();
  for (const [rig, re] of RIG_RULES) {
    if (re.test(joined)) return rig;
  }
  return 'custom';
}

export interface MetadataSidecar {
  name?: string;
  category?: AssetCategory;
  tags?: string[];
  scaleHint?: number;
  pivot?: AssetMetadata['pivot'];
  rig?: RigKind;
  sockets?: AssetMetadata['sockets'];
  collisionPreset?: AssetMetadata['collisionPreset'];
  mass?: number;
  friction?: number;
  restitution?: number;
  isDestructible?: boolean;
}

function isSidecar(value: unknown): value is MetadataSidecar {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function loadMetadata(path: string, root: THREE.Object3D, sidecarData?: unknown): AssetMetadata {
  const derivedName = nameFromPath(path);
  const derivedCat = categoryFromPath(path);
  const bones = collectBoneNames(root);
  const derivedRig = rigFromBoneNames(bones);

  const tags: string[] = [derivedCat];
  if (derivedRig !== 'static') tags.push(derivedRig);

  const base: AssetMetadata = {
    name: derivedName,
    category: derivedCat,
    tags,
    pivot: 'bottom',
    rig: derivedRig,
    format: formatFromPath(path),
  };

  if (!isSidecar(sidecarData)) return base;

  return {
    ...base,
    name: sidecarData.name ?? base.name,
    category: sidecarData.category ?? base.category,
    tags: Array.isArray(sidecarData.tags) ? Array.from(new Set([...tags, ...sidecarData.tags])) : base.tags,
    scaleHint: sidecarData.scaleHint,
    pivot: sidecarData.pivot ?? base.pivot,
    rig: sidecarData.rig ?? base.rig,
    sockets: sidecarData.sockets,
    collisionPreset: sidecarData.collisionPreset,
    mass: sidecarData.mass,
    friction: sidecarData.friction,
    restitution: sidecarData.restitution,
    isDestructible: sidecarData.isDestructible,
  };
}
