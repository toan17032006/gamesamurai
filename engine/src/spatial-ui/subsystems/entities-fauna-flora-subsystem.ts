/**
 * @file entities-fauna-flora-subsystem.ts
 * @module @aetheria/engine/spatial-ui/subsystems/entities-fauna-flora-subsystem
 * @description NPC, Bosses, Animals, Birds, Vegetation & 3D Props Subsystem (1101–1390).
 *
 * Trước đây gần như **mọi** method trong file này trả về cùng một giá trị giả:
 * vị trí giải phẫu lệch 0 mét (mọi điểm trùng nhau), phép đo trả `1.0`, góc trả
 * `0.0`, hướng trả `{0,0,1}`, va chạm luôn `hit: true`.
 *
 * Nay mỗi method đọc số đo từ **bảng loài** (`SPECIES_PROFILES`) nên chim có sải
 * cánh thật, cây có chiều cao thật, cá sấu dài hơn cá mặt trăng, …
 *
 * Quy ước chung:
 * - Hệ toạ độ Y-up, +X sang phải, +Y lên, +Z về phía trước; đơn vị mét.
 * - Mỗi entity có thể khai báo loài qua `species` / `speciesId` / `type` / `kind`
 *   / `name`; nếu không có thì dùng loài mặc định của nhóm (`SPECIES_FAMILY_DEFAULT`)
 *   — xem `resolveSpecies()`.
 * - Offset giải phẫu được xoay theo quaternion của entity nên đầu/mỏ/cánh/đuôi
 *   luôn nằm đúng hướng nhìn của sinh vật.
 */

import type {
  Vec2D,
  Vec3D,
  Vec4D,
  QuatD,
  Mat4D,
  EulerAngles,
  Box3D,
  Sphere3D,
  Capsule3D,
  Cylinder3D,
  Ray3D,
  Plane3D,
  Triangle3D,
  ViewportRect,
  CameraFrustum,
  UIAnchor,
  UIHitResult,
  SpatialGridCell,
  SplinePoint,
  TrajectoryPoint,
  SpatialUIConfig
} from '../types.js';

import {
  namedResult,
  measurement,
  directionResult,
  orientationResult,
  boundsResult,
  aabbResult,
  entityPosition,
  entityQuaternion,
  entityForward,
  toVec3,
  num,
  distance3D,
  distance2D,
  normalize,
  dot,
  cross,
  add,
  subtract,
  scale,
  magnitude,
  boundingBox,
  boundingSphere,
  boxesOverlap,
  distanceBetweenBoxes,
  eulerToQuaternion,
  quaternionToEuler,
  normalizeQuaternion,
  clamp,
  clamp01,
  lerp,
  UP3,
  FORWARD3,
  RIGHT3,
  ZERO3,
  IDENTITY_QUAT,
} from '../spatial-primitives.js';

// ---------------------------------------------------------------------------
// Bảng loài — số đo sinh học thật cho từng loài
// ---------------------------------------------------------------------------

/**
 * Hồ sơ sinh học của một loài (đơn vị mét / kg / m·s⁻¹).
 *
 * Mọi method trong file đọc số đo từ đây thay vì dùng hằng số chung.
 */
interface SpeciesProfile {
  /** Chiều dài thân (m) — từ mũi/mỏ tới đuôi. */
  length: number;
  /** Chiều cao thân (m) — khi đứng/đậu. */
  height: number;
  /** Chiều rộng thân (m). */
  width: number;
  /** Sải cánh (m) — 0 nếu loài không có cánh. */
  wingspan: number;
  /** Tốc độ di chuyển thường lệ (m/s). */
  speed: number;
  /** Bán kính bao quanh thân (m). */
  radius: number;
  /** Tầm phát hiện theo từng giác quan (m). */
  senses: { sight: number; hearing: number; smell: number };
  /** Số chân / số cánh. */
  limbs: number;
  /** Khối lượng (kg). */
  mass: number;
  /** Khối lượng riêng (kg/m³). */
  density: number;
  /** Chiều dài chân (m). */
  legLength: number;
  /** Chiều dài mỏ (m). */
  beakLength: number;
  /** Tần số vỗ cánh (Hz). */
  flapFrequency: number;
  /** Chiều cao thân cây (m). */
  trunkHeight: number;
  /** Bán kính tán cây (m). */
  canopyRadius: number;
  /** Chiều dài cành (m). */
  branchLength: number;
  /** Chiều dài lá (m). */
  leafLength: number;
  /** Chiều rộng lá (m). */
  leafWidth: number;
  /** Bán kính hoa (m). */
  flowerRadius: number;
  /** Bán kính quả / nấm (m). */
  fruitRadius: number;
  /** Độ sâu hệ rễ (m). */
  rootDepth: number;
  /** Độ lan rộng hệ rễ (m). */
  rootSpread: number;
}

/** Giá trị mặc định cho mọi trường chưa khai báo của một loài. */
const DEFAULT_PROFILE: SpeciesProfile = {
  length: 1,
  height: 1,
  width: 1,
  wingspan: 0,
  speed: 1,
  radius: 0.5,
  senses: { sight: 0, hearing: 0, smell: 0 },
  limbs: 0,
  mass: 1,
  density: 1000,
  legLength: 0,
  beakLength: 0,
  flapFrequency: 0,
  trunkHeight: 0,
  canopyRadius: 0,
  branchLength: 0,
  leafLength: 0,
  leafWidth: 0,
  flowerRadius: 0,
  fruitRadius: 0,
  rootDepth: 0,
  rootSpread: 0,
};

/**
 * Số đo thật của từng loài.
 * Nguồn: kích thước trung bình của cá thể trưởng thành ngoài tự nhiên.
 */
const RAW_SPECIES: Readonly<Record<string, Partial<SpeciesProfile>>> = {
  // --- Nhân vật / NPC ---
  humanoid: {
    length: 0.5, height: 1.75, width: 0.45, speed: 4.2, radius: 0.45,
    senses: { sight: 30, hearing: 15, smell: 10 }, limbs: 4, mass: 70, density: 985,
    legLength: 0.85,
  },

  // --- Boss ---
  boss: {
    length: 3.2, height: 4.6, width: 2.4, speed: 6.5, radius: 1.9,
    senses: { sight: 45, hearing: 25, smell: 20 }, limbs: 4, mass: 2600, density: 900,
    legLength: 1.9,
  },
  dragon: {
    length: 5.4, height: 3.4, width: 2.6, wingspan: 9.6, speed: 12, radius: 2.5,
    senses: { sight: 70, hearing: 35, smell: 45 }, limbs: 4, mass: 1900, density: 750,
    legLength: 1.5, flapFrequency: 0.6,
  },

  // --- Quái vật ---
  monster: {
    length: 1.8, height: 2.1, width: 1.3, speed: 5.5, radius: 1.05,
    senses: { sight: 25, hearing: 22, smell: 25 }, limbs: 4, mass: 340, density: 1050,
    legLength: 0.8,
  },

  // --- Thú (động vật có vú) ---
  wolf: {
    length: 1.3, height: 0.85, width: 0.42, speed: 12, radius: 0.5,
    senses: { sight: 45, hearing: 65, smell: 50 }, limbs: 4, mass: 40, density: 990,
    legLength: 0.42,
  },
  fox: {
    length: 0.72, height: 0.4, width: 0.22, speed: 9, radius: 0.28,
    senses: { sight: 35, hearing: 50, smell: 45 }, limbs: 4, mass: 7, density: 990,
    legLength: 0.2,
  },
  deer: {
    length: 1.65, height: 1.3, width: 0.45, speed: 8, radius: 0.62,
    senses: { sight: 55, hearing: 70, smell: 55 }, limbs: 4, mass: 120, density: 1000,
    legLength: 0.75,
  },
  horse: {
    length: 2.4, height: 1.6, width: 0.7, speed: 12, radius: 0.9,
    senses: { sight: 45, hearing: 65, smell: 40 }, limbs: 4, mass: 500, density: 1000,
    legLength: 0.85,
  },
  bear: {
    length: 2.05, height: 1.1, width: 0.82, speed: 9, radius: 0.95,
    senses: { sight: 30, hearing: 55, smell: 50 }, limbs: 4, mass: 350, density: 1000,
    legLength: 0.5,
  },
  rabbit: {
    length: 0.45, height: 0.25, width: 0.15, speed: 6, radius: 0.18,
    senses: { sight: 20, hearing: 30, smell: 25 }, limbs: 4, mass: 2.5, density: 1000,
    legLength: 0.1,
  },
  /** Thú bố chân chung — loài mặc định của nhóm "con vật". */
  quadruped: {
    length: 1.2, height: 0.8, width: 0.4, speed: 8, radius: 0.5,
    senses: { sight: 35, hearing: 50, smell: 40 }, limbs: 4, mass: 60, density: 1000,
    legLength: 0.4,
  },

  // --- Chim ---
  sparrow: {
    length: 0.15, height: 0.11, width: 0.07, wingspan: 0.22, speed: 10, radius: 0.08,
    senses: { sight: 20, hearing: 15, smell: 5 }, limbs: 2, mass: 0.03, density: 1000,
    beakLength: 0.012, flapFrequency: 8,
  },
  eagle: {
    length: 0.85, height: 0.45, width: 0.35, wingspan: 2.2, speed: 16, radius: 0.55,
    senses: { sight: 80, hearing: 40, smell: 15 }, limbs: 2, mass: 4.5, density: 1000,
    beakLength: 0.06, flapFrequency: 2.6,
  },
  crow: {
    length: 0.45, height: 0.3, width: 0.16, wingspan: 0.95, speed: 12, radius: 0.3,
    senses: { sight: 40, hearing: 30, smell: 20 }, limbs: 2, mass: 0.4, density: 1000,
    beakLength: 0.045, flapFrequency: 5.5,
  },
  owl: {
    length: 0.4, height: 0.34, width: 0.24, wingspan: 0.9, speed: 6, radius: 0.28,
    senses: { sight: 60, hearing: 90, smell: 10 }, limbs: 2, mass: 1.2, density: 1000,
    beakLength: 0.03, flapFrequency: 3.2,
  },
  hummingbird: {
    length: 0.09, height: 0.07, width: 0.04, wingspan: 0.16, speed: 9, radius: 0.05,
    senses: { sight: 15, hearing: 10, smell: 3 }, limbs: 2, mass: 0.003, density: 1000,
    beakLength: 0.02, flapFrequency: 50,
  },
  penguin: {
    length: 0.9, height: 0.85, width: 0.45, wingspan: 0.55, speed: 4, radius: 0.45,
    senses: { sight: 25, hearing: 30, smell: 10 }, limbs: 2, mass: 12, density: 1000,
    beakLength: 0.05, flapFrequency: 3,
  },
  /** Chim chung — loài mặc định của nhóm "chim". */
  bird: {
    length: 0.35, height: 0.25, width: 0.18, wingspan: 0.75, speed: 10, radius: 0.25,
    senses: { sight: 30, hearing: 30, smell: 12 }, limbs: 2, mass: 0.6, density: 1000,
    beakLength: 0.035, flapFrequency: 5,
  },

  // --- Thực vật ---
  oak: {
    length: 0.9, height: 18, width: 0.9, speed: 0, radius: 0.45,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 1500, density: 700,
    trunkHeight: 9, canopyRadius: 6.5, branchLength: 3.2,
    leafLength: 0.12, leafWidth: 0.08, rootDepth: 1.8, rootSpread: 4.5,
  },
  pine: {
    length: 0.8, height: 22, width: 0.8, speed: 0, radius: 0.4,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 1800, density: 650,
    trunkHeight: 14, canopyRadius: 3.2, branchLength: 1.6,
    leafLength: 0.06, leafWidth: 0.006, rootDepth: 2.2, rootSpread: 3.2,
  },
  palm: {
    length: 0.35, height: 9, width: 0.35, speed: 0, radius: 0.2,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 600, density: 600,
    trunkHeight: 7.5, canopyRadius: 2.6, branchLength: 1.8,
    leafLength: 2.4, leafWidth: 0.5, rootDepth: 1.2, rootSpread: 1.6,
  },
  bush: {
    length: 1.4, height: 1.2, width: 1.4, speed: 0, radius: 0.7,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 45, density: 600,
    trunkHeight: 0.25, canopyRadius: 0.7, branchLength: 0.6,
    leafLength: 0.05, leafWidth: 0.02, rootDepth: 0.3, rootSpread: 0.5,
  },
  grass: {
    length: 0.05, height: 0.25, width: 0.05, speed: 0, radius: 0.03,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 0.01, density: 400,
    trunkHeight: 0.02, canopyRadius: 0.03, branchLength: 0.02,
    leafLength: 0.25, leafWidth: 0.004, rootDepth: 0.08, rootSpread: 0.05,
  },
  flower: {
    length: 0.08, height: 0.45, width: 0.08, speed: 0, radius: 0.05,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 0.05, density: 400,
    trunkHeight: 0.4, canopyRadius: 0.06, branchLength: 0.05,
    leafLength: 0.08, leafWidth: 0.03, flowerRadius: 0.03,
    rootDepth: 0.15, rootSpread: 0.08,
  },
  mushroom: {
    length: 0.09, height: 0.12, width: 0.09, speed: 0, radius: 0.05,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 0.03, density: 300,
    trunkHeight: 0.07, canopyRadius: 0.045, branchLength: 0.02,
    leafLength: 0.02, leafWidth: 0.02, fruitRadius: 0.045,
    rootDepth: 0.05, rootSpread: 0.03,
  },

  // --- Vật thể / đạo cụ 3D ---
  /** Vật thể chung (thùng gỗ 1×1×1 m) — loài mặc định của nhóm "vật thể". */
  prop: {
    length: 1, height: 1, width: 1, speed: 0, radius: 0.87,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 600, density: 600,
  },
  rock: {
    length: 0.8, height: 0.55, width: 0.7, speed: 0, radius: 0.5,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 480, density: 2600,
  },
  barrel: {
    length: 0.6, height: 0.9, width: 0.6, speed: 0, radius: 0.45,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 260, density: 780,
  },
  column: {
    length: 0.5, height: 4, width: 0.5, speed: 0, radius: 2,
    senses: { sight: 0, hearing: 0, smell: 0 }, limbs: 0, mass: 950, density: 2400,
  },
};

/** Bảng loài đã chuẩn hoá (mọi trường đều có giá trị). */
const SPECIES_PROFILES: Readonly<Record<string, SpeciesProfile>> = (() => {
  const table: Record<string, SpeciesProfile> = {};
  for (const [key, raw] of Object.entries(RAW_SPECIES)) {
    table[key] = {
      ...DEFAULT_PROFILE,
      ...raw,
      senses: { ...DEFAULT_PROFILE.senses, ...(raw.senses ?? {}) },
    };
  }
  return table;
})();

/** Loài thuộc mỗi nhóm (dùng cho tra cứu và để chọn loài mặc định). */
const SPECIES_FAMILY: Readonly<Record<string, readonly string[]>> = {
  humanoid: ['humanoid'],
  boss: ['boss', 'dragon'],
  monster: ['monster', 'dragon'],
  animal: ['wolf', 'fox', 'deer', 'horse', 'bear', 'rabbit', 'quadruped'],
  bird: ['sparrow', 'eagle', 'crow', 'owl', 'hummingbird', 'penguin', 'bird'],
  plant: ['oak', 'pine', 'palm', 'bush', 'grass', 'flower', 'mushroom'],
  object: ['rock', 'barrel', 'column', 'prop'],
};

/** Loài mặc định của mỗi nhóm khi entity không khai báo loài. */
const SPECIES_FAMILY_DEFAULT: Readonly<Record<string, string>> = {
  humanoid: 'humanoid',
  boss: 'boss',
  monster: 'monster',
  animal: 'quadruped',
  bird: 'bird',
  plant: 'oak',
  object: 'prop',
};

/** Tên gọi khác (tiếng Anh, tiếng Việt, tên hiển thị) → khoá trong bảng loài. */
const SPECIES_ALIASES: Readonly<Record<string, string>> = {
  human: 'humanoid', humanoid: 'humanoid', npc: 'humanoid', person: 'humanoid',
  player: 'humanoid', character: 'humanoid', 'người': 'humanoid',

  canine: 'wolf', dog: 'wolf', wolf: 'wolf', coyote: 'wolf', 'sói': 'wolf', 'chó': 'wolf',
  fox: 'fox', vixen: 'fox', 'cáo': 'fox',
  deer: 'deer', stag: 'deer', doe: 'deer', elk: 'deer', moose: 'deer', 'hươu': 'deer',
  horse: 'horse', stallion: 'horse', mare: 'horse', pony: 'horse', 'ngựa': 'horse',
  bear: 'bear', grizzly: 'bear', 'gấu': 'bear',
  rabbit: 'rabbit', hare: 'rabbit', bunny: 'rabbit', 'thỏ': 'rabbit',
  quadruped: 'quadruped', mammal: 'quadruped', beast: 'quadruped', 'thú': 'quadruped',

  sparrow: 'sparrow', housefinch: 'sparrow', finch: 'sparrow', 'chim sẻ': 'sparrow',
  eagle: 'eagle', falcon: 'eagle', hawk: 'eagle', raptor: 'eagle', 'đại bàng': 'eagle',
  crow: 'crow', raven: 'crow', rook: 'crow', 'quạ': 'crow',
  owl: 'owl', 'cú': 'owl',
  hummingbird: 'hummingbird', 'chim ruồi': 'hummingbird',
  penguin: 'penguin', 'chim cánh cứt': 'penguin',
  bird: 'bird', avian: 'bird', 'chim': 'bird',

  oak: 'oak', deciduous: 'oak', 'sồi': 'oak',
  pine: 'pine', conifer: 'pine', spruce: 'pine', fir: 'pine', 'thông': 'pine',
  palm: 'palm', coconut: 'palm', 'cọ': 'palm',
  bush: 'bush', shrub: 'bush', hedge: 'bush', 'bụi': 'bush',
  grass: 'grass', turf: 'grass', 'cỏ': 'grass',
  flower: 'flower', blossom: 'flower', 'hoa': 'flower',
  mushroom: 'mushroom', fungus: 'mushroom', toadstool: 'mushroom', 'nấm': 'mushroom',
  plant: 'oak', tree: 'oak', 'cây': 'oak',

  prop: 'prop', crate: 'prop', box: 'prop', object: 'prop', 'vật': 'prop',
  rock: 'rock', stone: 'rock', boulder: 'rock', 'đá': 'rock',
  barrel: 'barrel', drum: 'barrel', 'thùng': 'barrel',
  column: 'column', pillar: 'column', 'cột': 'column',

  boss: 'boss', overlord: 'boss', titan: 'boss',
  dragon: 'dragon', wyvern: 'dragon', rồng: 'dragon',
  monster: 'monster', golem: 'monster', quái: 'monster',
};

/** Gia tốc trọng trường (m/s²) và hằng số khí động học dùng cho lực nâng/cản. */
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;
const WATER_DENSITY = 1000;
const DRAG_COEFFICIENT = 0.05;
const FRICTION_COEFFICIENT = 0.4;

/**
 * Khoảng cách tham chiếu (m) dùng khi không có dữ liệu vị trí của đối tượng
 * thứ hai — đây là **giá trị mặc định có tài liệu**, không phải số đo sinh học.
 */
const REFERENCE_SEPARATIONS: Readonly<Record<string, number>> = {
  npcPlayer: 3,
  npcTarget: 2,
  npcWaypoint: 5,
  npcObstacle: 2,
  bossPlayer: 5,
  bossWeakPoint: 1.2,
  monsterAttack: 2,
  objectWall: 0.5,
  objectCeiling: 0.5,
  objectCamera: 5,
  objectPlayer: 2,
  objectTarget: 2,
};

// ---------------------------------------------------------------------------
// Tiện ích cục bộ
// ---------------------------------------------------------------------------

/**
 * Chuẩn hoá chuỗi thành khoá tra cứu: bỏ dấu tiếng Việt, chữ thường, bỏ ký tự lạ.
 * "Đại Bàng" → "daibang", "sói" → "soi".
 */
function normalizeToken(value: string): string {
  return value
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/** Thu thập các chuỗi có thể chứa tên loài từ entity. */
function speciesCandidates(entity: unknown): string[] {
  if (!entity || typeof entity !== 'object') return [];
  const e = entity as Record<string, unknown>;
  const keys = ['species', 'speciesId', 'speciesKey', 'type', 'kind', 'tag', 'name', 'id', 'className'];
  const out: string[] = [];
  for (const key of keys) {
    const raw = e[key];
    if (typeof raw === 'string' && raw.length > 0) out.push(raw);
  }
  return out;
}

/**
 * Tra cứu hồ sơ loài của entity.
 *
 * Thứ tự ưu tiên: khớp chính xác/bí danh trong cùng nhóm → khớp chứa chuỗi
 * trong cùng nhóm → khớp chính xác trên toàn bảng → loài mặc định của nhóm.
 *
 * Sau khi chọn loài, các số đo **do chính entity cung cấp** (`entity.height`,
 * `entity.wingspan`, `entity.length`, …) được ghi đè lên hồ sơ loài — dữ liệu
 * rõ ràng của entity luôn thắng giá trị mặc định theo loài.
 */
function resolveSpecies(entity: unknown, family: string): SpeciesProfile {
  const members = SPECIES_FAMILY[family] ?? [];
  const fallbackKey = SPECIES_FAMILY_DEFAULT[family] ?? 'quadruped';
  const fallback = SPECIES_PROFILES[fallbackKey] ?? SPECIES_PROFILES.quadruped;
  const tokens = speciesCandidates(entity).map(normalizeToken).filter((t) => t.length > 0);

  let base = fallback;
  let matched = false;
  for (const token of tokens) {
    for (const member of members) {
      if (normalizeToken(member) === token) {
        base = SPECIES_PROFILES[member];
        matched = true;
      }
    }
    if (matched) break;
    const alias = SPECIES_ALIASES[token];
    if (alias && members.includes(alias)) {
      base = SPECIES_PROFILES[alias];
      matched = true;
      break;
    }
  }

  if (!matched) {
    for (const token of tokens) {
      let best: string | undefined;
      for (const member of members) {
        const key = normalizeToken(member);
        if (!key || !token.includes(key)) continue;
        if (!best || key.length > normalizeToken(best).length) best = member;
      }
      if (best) {
        base = SPECIES_PROFILES[best];
        matched = true;
        break;
      }
    }
  }

  if (!matched) {
    for (const token of tokens) {
      for (const key of Object.keys(SPECIES_PROFILES)) {
        if (normalizeToken(key) === token) {
          base = SPECIES_PROFILES[key];
          matched = true;
          break;
        }
      }
      if (matched) break;
      const alias = SPECIES_ALIASES[token];
      if (alias && SPECIES_PROFILES[alias]) {
        base = SPECIES_PROFILES[alias];
        matched = true;
        break;
      }
    }
  }

  return applyEntityMeasurements(base, entity);
}

/** Các trường số đo có thể bị entity ghi đè trực tiếp. */
const OVERRIDABLE_MEASUREMENTS = [
  'length', 'height', 'width', 'wingspan', 'speed', 'radius', 'mass', 'density',
  'legLength', 'beakLength', 'flapFrequency', 'trunkHeight', 'canopyRadius',
  'branchLength', 'leafLength', 'leafWidth', 'flowerRadius', 'fruitRadius',
  'rootDepth', 'rootSpread',
] as const;

/** Ghi đè số đo của hồ sơ loài bằng số đo do entity cung cấp (nếu hợp lệ). */
function applyEntityMeasurements(base: SpeciesProfile, entity: unknown): SpeciesProfile {
  if (!entity || typeof entity !== 'object') return base;
  const e = entity as Record<string, unknown>;
  const overlay: Partial<SpeciesProfile> = {};
  for (const key of OVERRIDABLE_MEASUREMENTS) {
    const raw = e[key];
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
      (overlay as Record<string, number>)[key] = raw;
    }
  }
  const sensesSource = (e.senses && typeof e.senses === 'object')
    ? (e.senses as Record<string, unknown>)
    : e;
  const senses = { ...base.senses };
  for (const key of ['sight', 'hearing', 'smell'] as const) {
    const raw = sensesSource[key];
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) senses[key] = raw;
  }
  return { ...base, ...overlay, senses };
}

/** Xoay vector theo quaternion (hệ Y-up, quy ước three.js). */
function rotateVector(quaternion: QuatD, vector: Vec3D): Vec3D {
  const q = normalizeQuaternion(quaternion);
  const { x, y, z } = vector;
  const { x: qx, y: qy, z: qz, w: qw } = q;
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  return {
    x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
    y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
    z: iz * qw + iw * -qz + ix * -qy - iy * -qx,
  };
}

/**
 * Vị trí giải phẫu: neo tại `entity.position`, cộng offset giải phẫu (đã xoay
 * theo hướng của entity) rồi cộng offset do caller truyền vào.
 */
function anatomicalPosition(entity: unknown, offset: Vec3D, callerOffset?: Vec3D): Vec3D {
  const base = entityPosition(entity);
  const rotated = rotateVector(entityQuaternion(entity), offset);
  const extra = callerOffset ?? ZERO3;
  return {
    x: base.x + rotated.x + num(extra.x),
    y: base.y + rotated.y + num(extra.y),
    z: base.z + rotated.z + num(extra.z),
  };
}

/** Đọc điểm từ entity (dùng `position`) hoặc từ vector trần; null nếu không có. */
function pointOf(value: unknown): Vec3D | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (v.position && typeof v.position === 'object') return toVec3(v.position);
  if (typeof v.x === 'number' || typeof v.y === 'number' || typeof v.z === 'number') {
    return toVec3(v);
  }
  return null;
}

/** Hướng đơn vị từ `from` tới `to`; vector 0 nếu trùng nhau. */
function directionTo(from: Vec3D, to: Vec3D): Vec3D {
  const delta = subtract(to, from);
  const len = magnitude(delta);
  if (len === 0 || !Number.isFinite(len)) return { x: 0, y: 0, z: 0 };
  return { x: delta.x / len, y: delta.y / len, z: delta.z / len };
}

/**
 * Hướng nhìn của thực thể: ưu tiên quaternion/`forward` có sẵn, sau đó mới quay
 * về phía đích, cuối cùng là forward mặc định +Z.
 */
function facingDirection(source: unknown, target: unknown): Vec3D {
  const e = (source ?? {}) as Record<string, unknown>;
  const hasQuaternion = (e.quaternion && typeof e.quaternion === 'object')
    || (e.rotation && typeof e.rotation === 'object');
  const hasForward = e.forward && typeof e.forward === 'object';
  if (hasQuaternion || hasForward) return entityForward(source);
  const from = pointOf(source);
  const to = pointOf(target);
  if (from && to) {
    const dir = directionTo(from, to);
    if (dir.x !== 0 || dir.y !== 0 || dir.z !== 0) return dir;
  }
  return { x: 0, y: 0, z: 1 };
}

/** Vận tốc của entity: đọc `velocity`, nếu không có thì suy ra từ vị trí trước. */
function entityVelocity(entity: unknown, dt: number): Vec3D {
  const e = (entity ?? {}) as Record<string, unknown>;
  if (e.velocity && typeof e.velocity === 'object') return toVec3(e.velocity);
  const previous = e.previousPosition;
  if (previous && typeof previous === 'object' && dt > 0) {
    return scale(subtract(entityPosition(entity), toVec3(previous)), 1 / dt);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Gia tốc của entity: đọc `acceleration`, nếu không có thì suy ra từ vận tốc. */
function entityAcceleration(entity: unknown, dt: number): Vec3D {
  const e = (entity ?? {}) as Record<string, unknown>;
  if (e.acceleration && typeof e.acceleration === 'object') return toVec3(e.acceleration);
  const previous = e.previousVelocity;
  const current = e.velocity;
  if (previous && current && typeof previous === 'object' && typeof current === 'object' && dt > 0) {
    return scale(subtract(toVec3(current), toVec3(previous)), 1 / dt);
  }
  return { x: 0, y: 0, z: 0 };
}

/** Trung tâm trọng tâm của một danh sách điểm. */
function centroidOf(points: Vec3D[]): Vec3D {
  if (points.length === 0) return { x: 0, y: 0, z: 0 };
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
    z += p.z;
  }
  return { x: x / points.length, y: y / points.length, z: z / points.length };
}

/** Bán kính bao quanh tâm của một danh sách điểm. */
function spreadRadius(center: Vec3D, points: Vec3D[]): number {
  let radius = 0;
  for (const p of points) radius = Math.max(radius, distance3D(center, p));
  return radius;
}

/** Chuyển một mảng entity/điểm thành danh sách điểm hợp lệ. */
function pointList(value: unknown): Vec3D[] {
  if (!Array.isArray(value)) return [];
  const out: Vec3D[] = [];
  for (const item of value) {
    const p = pointOf(item);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Danh sách NPC lân cận.
 *
 * Nhóm lực đàn nhận tham số thứ hai là `dt`; nếu tham số đó là một **mảng** thì
 * được hiểu là danh sách lân cận (dạng gọi thực tế của hệ đàn). Ngoài ra danh
 * sách có thể khai báo trực tiếp trên entity qua `entity.neighbors`.
 */
function neighborList(entity: unknown, second?: unknown): Vec3D[] {
  const fromSecond = Array.isArray(second) ? pointList(second) : [];
  if (fromSecond.length > 0) return fromSecond;
  const e = (entity ?? {}) as Record<string, unknown>;
  return pointList(e.neighbors);
}

/** Đọc một số tuỳ chọn từ `options`. */
function optNumber(options: unknown, key: string, fallback: number): number {
  if (!options || typeof options !== 'object') return fallback;
  return num((options as Record<string, unknown>)[key], fallback);
}

/** Đọc một vector tuỳ chọn từ `options`. */
function optVec3(options: unknown, key: string): Vec3D | undefined {
  if (!options || typeof options !== 'object') return undefined;
  const raw = (options as Record<string, unknown>)[key];
  if (!raw || typeof raw !== 'object') return undefined;
  return toVec3(raw);
}

/** Thời gian hiện tại của mô phỏng (dùng cho pha vỗ cánh / pha dáng đi). */
function simulationTime(entity: unknown, options: unknown): number {
  const explicit = optNumber(options, 'time', Number.NaN);
  if (Number.isFinite(explicit)) return explicit;
  const e = (entity ?? {}) as Record<string, unknown>;
  if (typeof e.time === 'number') return e.time;
  if (typeof e.elapsed === 'number') return e.elapsed;
  return 0;
}

/**
 * Nguồn dữ liệu NPC từ các tham số truyền vào.
 *
 * Method có thể được gọi với (entity, options, …) hoặc (…, entity, options), nên
 * chọn argument đầu tiên mang dữ liệu trạng thái/giác quan thật.
 */
function npcSource(...sources: unknown[]): Record<string, unknown> {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    const o = source as Record<string, unknown>;
    if (
      o.npcState !== undefined ||
      o.alertLevel !== undefined ||
      o.state !== undefined ||
      o.position !== undefined ||
      o.neighbors !== undefined ||
      o.blendWeight !== undefined
    ) {
      return o;
    }
  }
  return {};
}

/**
 * Các trạng thái NPC theo thứ tự leo thang — chỉ số trong danh sách là
 * "mã trạng thái" dùng để báo cáo.
 */
const NPC_STATE_ORDER: readonly string[] = ['idle', 'alert', 'chase', 'attack', 'flee', 'dead'];

/** Các pha hoạt ảnh di chuyển (dùng để đánh chỉ số pha trộn). */
const ANIMATION_STATE_ORDER: readonly string[] = ['idle', 'walk', 'run', 'sprint'];

/** Chỉ số của một tên trạng thái trong danh sách; -1 nếu không biết tên đó. */
function stateIndex(order: readonly string[], name: unknown): number {
  if (typeof name !== 'string') return -1;
  const key = name.trim().toLowerCase();
  if (key.length === 0) return -1;
  return order.findIndex((s) => s === key);
}

/**
 * Bán kính ngang của phần đầu/cụm của entity.
 *
 * Dùng làm fallback khi entity không khai báo cỡ hoa/quả riêng: bán kính
 * đĩa = nửa đường kính ngang lớn nhất trong `size`/`dimensions`/`bounds`/`scale`.
 */
function headRadius(entity: unknown): number {
  const e = (entity ?? {}) as Record<string, unknown>;
  const size = pointOf(e.size) ?? pointOf(e.dimensions);
  if (size) {
    const half = Math.max(size.x, size.z) / 2;
    if (half > 0) return half;
  }
  const bounds = e.bounds as { min?: Vec3D; max?: Vec3D } | undefined;
  if (bounds && bounds.min && bounds.max) {
    const half = Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z) / 2;
    if (half > 0) return half;
  }
  const scale = pointOf(e.scale);
  if (scale) {
    const half = Math.max(scale.x, scale.z) / 2;
    if (half > 0) return half;
  }
  return 0;
}

/** Bản ghi chuẩn hoá cho hình cầu bao (chưa có sẵn trong spatial-primitives). */
function sphereResult(name: string, sphere: Sphere3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: Number.isFinite(sphere.radius) && sphere.radius >= 0,
    center: { x: sphere.center.x, y: sphere.center.y, z: sphere.center.z },
    radius: sphere.radius,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Bản ghi chuẩn hoá cho capsule bao. */
function capsuleResult(name: string, capsule: Capsule3D, extra?: Record<string, unknown>): Record<string, unknown> {
  return {
    name,
    valid: Number.isFinite(capsule.radius) && capsule.radius >= 0,
    start: { x: capsule.start.x, y: capsule.start.y, z: capsule.start.z },
    end: { x: capsule.end.x, y: capsule.end.y, z: capsule.end.z },
    radius: capsule.radius,
    timestamp: Date.now(),
    ...(extra ?? {}),
  };
}

/** Hộp bao AABB của một thân thể, dựng từ hồ sơ loài. */
function bodyBox(entity: unknown, profile: SpeciesProfile): Box3D {
  return boundingBox(entityPosition(entity), {
    x: profile.width,
    y: profile.height,
    z: profile.length,
  });
}

/** Diện tích một cánh (m²) — nửa hình chữ nhật: sải cánh × số dọc cánh. */
function wingAreaOf(profile: SpeciesProfile): number {
  const chord = profile.length * 0.55;
  return 0.5 * chord * profile.wingspan;
}

/** Hệ số nâng động: chim nhỏ cần C_L cao (vỗ cánh mạnh), chim lớn lượn C_L thấp. */
function liftCoefficientOf(profile: SpeciesProfile): number {
  return clamp(1.2 - profile.length * 0.7, 0.5, 1.2);
}

/** Lực nâng của đôi cánh (N) theo công thức L = ½·ρ·S·v²·C_L. */
function liftOf(profile: SpeciesProfile): number {
  const area = wingAreaOf(profile);
  if (area <= 0) return 0;
  return 0.5 * AIR_DENSITY * area * profile.speed * profile.speed * liftCoefficientOf(profile);
}

/** Lực cản không khí (N) theo công thức D = ½·ρ·S·v²·C_D. */
function dragOf(profile: SpeciesProfile): number {
  const area = wingAreaOf(profile);
  if (area <= 0) return 0;
  return 0.5 * AIR_DENSITY * area * profile.speed * profile.speed * DRAG_COEFFICIENT;
}

/** Thể tích hộp bao (m³). */
function volumeOf(profile: SpeciesProfile): number {
  return profile.width * profile.height * profile.length;
}

/** Ma trận 4×4 (column-major) từ vị trí / quaternion / tỷ lệ. */
function composeMatrix(position: Vec3D, quaternion: QuatD, scale: Vec3D): number[] {
  const q = normalizeQuaternion(quaternion);
  const { x, y, z, w } = q;
  const { x: sx, y: sy, z: sz } = scale;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    position.x, position.y, position.z, 1,
  ];
}

/** Ma trận 4×4 chỉ có tỷ lệ (biến đổi cục bộ). */
function scaleMatrix(scale: Vec3D): number[] {
  return [
    scale.x, 0, 0, 0,
    0, scale.y, 0, 0,
    0, 0, scale.z, 0,
    0, 0, 0, 1,
  ];
}

/** Độ xuyên lấn nhỏ nhất giữa hai AABB (m). */
function penetrationDepth(a: Box3D, b: Box3D): number {
  const dx = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const dy = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
  const dz = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (dx <= 0 || dy <= 0 || dz <= 0) return 0;
  return Math.min(dx, dy, dz);
}

/** Tỷ lệ co giãn của entity (1 nếu không có). */
function scaleOf(entity: unknown): Vec3D {
  const e = (entity ?? {}) as Record<string, unknown>;
  const raw = e.scale;
  if (typeof raw === 'number') return { x: raw, y: raw, z: raw };
  if (raw && typeof raw === 'object') return toVec3(raw);
  return { x: 1, y: 1, z: 1 };
}

/** Điểm trên vật thể gần nhất với một điểm bên ngoài. */
function closestPointOnBox(point: Vec3D, box: Box3D): Vec3D {
  return {
    x: clamp(point.x, box.min.x, box.max.x),
    y: clamp(point.y, box.min.y, box.max.y),
    z: clamp(point.z, box.min.z, box.max.z),
  };
}

/** Điểm trên vật thể xa nhất so với một điểm. */
function farthestPointOnBox(point: Vec3D, box: Box3D): Vec3D {
  const candidates: Vec3D[] = [];
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        candidates.push({ x, y, z });
      }
    }
  }
  let best = candidates[0];
  let bestDistance = distance3D(point, best);
  for (const candidate of candidates) {
    const d = distance3D(point, candidate);
    if (d > bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Subsystem
// ---------------------------------------------------------------------------

export class EntitiesFaunaFloraSubsystem {
  public config: SpatialUIConfig;

  constructor(config?: SpatialUIConfig) {
    this.config = config ?? {
      screenWidth: 1920,
      screenHeight: 1080,
      fov: 60,
      nearPlane: 0.1,
      farPlane: 1000,
      aspectRatio: 16 / 9,
      unitScale: 1.0,
    };
  }

  // ==========================================================================
  // 24. NPC và AI
  // ==========================================================================

  /**
   * [1101] calculateNPCPosition
   * Tính vị trí NPC.
   */
  public calculateNPCPosition(a?: any, b?: any, options?: any): any {
    const entity = a ?? optVec3(options, 'entity') ?? b;
    const profile = resolveSpecies(entity, 'humanoid');
    const position = entityPosition(entity);
    return namedResult('calculateNPCPosition', {
      position,
      radius: profile.radius,
      height: profile.height,
      species: profile === SPECIES_PROFILES.humanoid ? 'humanoid' : 'custom',
    });
  }
  /**
   * [1102] calculateNPCVelocity
   * Tính vận tốc NPC.
   */
  public calculateNPCVelocity(entity?: any, dt = 0.016): any {
    const velocity = entityVelocity(entity, dt);
    return directionResult('calculateNPCVelocity', velocity, { source: 'entity.velocity' });
  }
  /**
   * [1103] calculateNPCAcceleration
   * Tính gia tốc NPC.
   */
  public calculateNPCAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = entityAcceleration(entity, dt);
    return directionResult('calculateNPCAcceleration', acceleration, { source: 'entity.acceleration' });
  }
  /**
   * [1104] calculateNPCFacingDirection
   * Tính hướng mặt NPC.
   */
  public calculateNPCFacingDirection(a?: any, b?: any): any {
    return directionResult('calculateNPCFacingDirection', facingDirection(a, b));
  }
  /**
   * [1105] calculateNPCOrientation
   * Tính hướng quay NPC.
   */
  public calculateNPCOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateNPCOrientation', entityQuaternion(entityOrAngle), {
      source: 'entity.quaternion',
    });
  }
  /**
   * [1106] calculateNPCDistanceToPlayer
   * Tính khoảng cách NPC đến người chơi.
   */
  public calculateNPCDistanceToPlayer(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcPlayer;
    return measurement('calculateNPCDistanceToPlayer', distance, 'm', { resolved });
  }
  /**
   * [1107] calculateNPCDistanceToTarget
   * Tính khoảng cách NPC đến mục tiêu.
   */
  public calculateNPCDistanceToTarget(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcTarget;
    return measurement('calculateNPCDistanceToTarget', distance, 'm', { resolved });
  }
  /**
   * [1108] calculateNPCDistanceToWaypoint
   * Tính khoảng cách NPC đến điểm đường đi.
   */
  public calculateNPCDistanceToWaypoint(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcWaypoint;
    return measurement('calculateNPCDistanceToWaypoint', distance, 'm', { resolved });
  }
  /**
   * [1109] calculateNPCNearestNeighbor
   * Tìm NPC gần nhất.
   */
  public calculateNPCNearestNeighbor(a?: any, b?: any, options?: any): any {
    const origin = pointOf(a) ?? ZERO3;
    const neighbors = pointList(
      (options && typeof options === 'object' ? (options as Record<string, unknown>).neighbors : undefined)
      ?? (Array.isArray(b) ? b : undefined),
    );
    let index = -1;
    let nearest = Number.POSITIVE_INFINITY;
    let nearestPosition: Vec3D = ZERO3;
    for (let i = 0; i < neighbors.length; i += 1) {
      const d = distance3D(origin, neighbors[i]);
      if (d < nearest) {
        nearest = d;
        index = i;
        nearestPosition = neighbors[i];
      }
    }
    return namedResult('calculateNPCNearestNeighbor', {
      index,
      distance: Number.isFinite(nearest) ? nearest : 0,
      position: nearestPosition,
      count: neighbors.length,
    });
  }
  /**
   * [1110] calculateNPCGroupCenter
   * Tính tâm nhóm NPC.
   */
  public calculateNPCGroupCenter(a?: any, b?: any, options?: any): any {
    const members = pointList(
      (options && typeof options === 'object' ? (options as Record<string, unknown>).members : undefined)
      ?? (Array.isArray(b) ? b : undefined)
      ?? (Array.isArray(a) ? a : undefined),
    );
    const center = members.length > 0 ? centroidOf(members) : entityPosition(a);
    return namedResult('calculateNPCGroupCenter', {
      center,
      count: members.length,
      radius: spreadRadius(center, members),
    });
  }
  /**
   * [1111] calculateNPCGroupRadius
   * Tính bán kính nhóm NPC.
   */
  public calculateNPCGroupRadius(entity?: any, options?: any): any {
    const members = pointList(
      options && typeof options === 'object' ? (options as Record<string, unknown>).members : undefined,
    );
    if (members.length > 0) {
      const center = centroidOf(members);
      return measurement('calculateNPCGroupRadius', spreadRadius(center, members), 'm', {
        resolved: true,
      });
    }
    const profile = resolveSpecies(entity, 'humanoid');
    return measurement('calculateNPCGroupRadius', profile.radius, 'm', { resolved: false });
  }
  /**
   * [1112] calculateNPCFormationOffset
   * Tính độ lệch đội hình NPC.
   */
  public calculateNPCFormationOffset(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const index = Math.max(0, Math.round(optNumber(options, 'index', 0)));
    const count = Math.max(1, Math.round(optNumber(options, 'count', 1)));
    const spacing = optNumber(options, 'spacing', profile.radius * 3);
    const lateral = (index - (count - 1) / 2) * spacing;
    const depth = index * spacing * 0.5;
    const offset = { x: lateral, y: 0, z: depth };
    return namedResult('calculateNPCFormationOffset', { offset, index, count, spacing });
  }
  /**
   * [1113] calculateNPCFormationPosition
   * Tính vị trí đội hình NPC.
   */
  public calculateNPCFormationPosition(a?: any, b?: any, options?: any): any {
    const formation = this.calculateNPCFormationOffset(a, b, options) as Record<string, unknown>;
    const offset = (formation.result as { offset: Vec3D }).offset;
    const base = entityPosition(a);
    const position = { x: base.x + offset.x, y: base.y + offset.y, z: base.z + offset.z };
    return namedResult('calculateNPCFormationPosition', { position, offset });
  }
  /**
   * [1114] calculateNPCFormationDirection
   * Tính hướng đội hình NPC.
   */
  public calculateNPCFormationDirection(a?: any, b?: any): any {
    return directionResult('calculateNPCFormationDirection', facingDirection(a, b));
  }
  /**
   * [1115] calculateNPCFormationSpacing
   * Tính khoảng cách giữa NPC trong đội hình.
   */
  public calculateNPCFormationSpacing(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const count = Math.max(1, Math.round(optNumber(options, 'count', 1)));
    const spacing = optNumber(options, 'spacing', profile.radius * 3);
    return namedResult('calculateNPCFormationSpacing', {
      spacing,
      count,
      rowWidth: spacing * (count - 1),
    });
  }
  /**
   * [1116] calculateNPCSeparationForce
   * Tính lực tách NPC.
   *
   * Tham số thứ hai là `dt` theo hợp đồng, nhưng nếu truyền một **mảng** thì
   * được hiểu là danh sách NPC lân cận (`entity.neighbors` cũng được dùng).
   *
   * Bán kính tách là bán kính cá nhân (`entity.separationRadius`) và không được
   * nhỏ hơn bán kính không gian cá nhân mặc định theo loài (để hai NPC không
   * chồng lên nhau). Lực đẩy tính trong mặt phẳng ngang — NPC đứng trên mặt
   * đất — và suy giảm tuyến tính khi khoảng cách tiến gần mép vùng cá nhân.
   */
  public calculateNPCSeparationForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const neighbors = neighborList(entity, dt);
    const origin = entityPosition(entity);
    const declared = num((entity as Record<string, unknown> | null)?.separationRadius, Number.NaN);
    const radius = Math.max(Number.isFinite(declared) ? declared : 0, profile.radius * 3);
    const force = { x: 0, y: 0, z: 0 };
    let nearest = Number.POSITIVE_INFINITY;
    for (const neighbor of neighbors) {
      const dx = origin.x - neighbor.x;
      const dz = origin.z - neighbor.z;
      const d = Math.hypot(dx, dz);
      if (d < nearest) nearest = d;
      if (d > 1e-6 && d < radius) {
        const strength = (radius - d) / radius;
        force.x += (dx / d) * strength;
        force.z += (dz / d) * strength;
      }
    }
    return directionResult('calculateNPCSeparationForce', force, {
      neighbors: neighbors.length,
      separationRadius: radius,
      distance: Number.isFinite(nearest) ? nearest : 0,
    });
  }
  /**
   * [1117] calculateNPCAlignmentForce
   * Tính lực căn chỉnh hướng NPC.
   *
   * Tham số thứ hai là `dt` theo hợp đồng, nhưng nếu truyền một **mảng** thì
   * được hiểu là danh sách NPC lân cận.
   */
  public calculateNPCAlignmentForce(entity?: any, dt = 0.016): any {
    const neighbors = neighborList(entity, dt);
    const self = entityPosition(entity);
    const average = neighbors.length > 0 ? centroidOf(neighbors) : self;
    const alignment = directionTo(self, average);
    return directionResult('calculateNPCAlignmentForce', alignment, { neighbors: neighbors.length });
  }
  /**
   * [1118] calculateNPCCohesionForce
   * Tính lực tập hợp NPC.
   *
   * Tham số thứ hai là `dt` theo hợp đồng, nhưng nếu truyền một **mảng** thì
   * được hiểu là danh sách NPC lân cận.
   */
  public calculateNPCCohesionForce(entity?: any, dt = 0.016): any {
    const neighbors = neighborList(entity, dt);
    const self = entityPosition(entity);
    const center = neighbors.length > 0 ? centroidOf(neighbors) : self;
    const cohesion = directionTo(self, center);
    return directionResult('calculateNPCCohesionForce', cohesion, { neighbors: neighbors.length });
  }
  /**
   * [1119] calculateNPCSteeringForce
   * Tính lực điều hướng NPC.
   */
  public calculateNPCSteeringForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const desired = optVec3(
      entity && typeof entity === 'object'
        ? { target: (entity as Record<string, unknown>).target }
        : undefined,
      'target',
    );
    const current = entityPosition(entity);
    const velocity = entityVelocity(entity, dt);
    const desiredDirection = desired ? directionTo(current, desired) : entityForward(entity);
    const steering = subtract(scale(desiredDirection, profile.speed), velocity);
    return directionResult('calculateNPCSteeringForce', steering, { maxSpeed: profile.speed });
  }
  /**
   * [1120] calculateNPCAvoidanceForce
   * Tính lực tránh vật cản NPC.
   */
  public calculateNPCAvoidanceForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const obstacles = pointList(
      entity && typeof entity === 'object'
        ? (entity as Record<string, unknown>).obstacles
        : undefined,
    );
    const origin = entityPosition(entity);
    const force = { x: 0, y: 0, z: 0 };
    const trigger = profile.radius * 4;
    for (const obstacle of obstacles) {
      const delta = subtract(origin, obstacle);
      const d = magnitude(delta);
      if (d > 1e-6 && d < trigger) {
        const weight = (trigger - d) / trigger;
        force.x += (delta.x / d) * weight;
        force.y += (delta.y / d) * weight;
        force.z += (delta.z / d) * weight;
      }
    }
    return directionResult('calculateNPCAvoidanceForce', force, { obstacles: obstacles.length });
  }
  /**
   * [1121] calculateNPCObstacleDistance
   * Tính khoảng cách NPC đến chướng ngại.
   */
  public calculateNPCObstacleDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcObstacle;
    return measurement('calculateNPCObstacleDistance', distance, 'm', { resolved });
  }
  /**
   * [1122] calculateNPCObstacleNormal
   * Tính pháp tuyến chướng ngại đối với NPC.
   */
  public calculateNPCObstacleNormal(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let normal: Vec3D = { x: 0, y: 1, z: 0 };
    if (from && to) {
      normal = directionTo(to, from);
      if (normal.x === 0 && normal.y === 0 && normal.z === 0) normal = { x: 0, y: 1, z: 0 };
    }
    return directionResult('calculateNPCObstacleNormal', normal);
  }
  /**
   * [1123] calculateNPCPathfindingCost
   * Tính chi phí tìm đường NPC.
   */
  public calculateNPCPathfindingCost(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const target = optVec3(options, 'target');
    const origin = entityPosition(entity);
    const travel = target ? distance3D(origin, target) : 0;
    const obstacles = Math.max(0, Math.round(optNumber(options, 'obstacles', 0)));
    const terrain = optNumber(options, 'terrainPenalty', 1);
    const cost = travel * terrain + obstacles * profile.radius * 2;
    return measurement('calculateNPCPathfindingCost', cost, 'cost', {
      travel,
      obstacles,
      terrain,
    });
  }
  /**
   * [1124] calculateNPCPathLength
   * Tính độ dài đường đi NPC.
   */
  public calculateNPCPathLength(entity?: any, options?: any): any {
    const path = pointList(
      options && typeof options === 'object' ? (options as Record<string, unknown>).path : undefined,
    );
    let length = 0;
    for (let i = 1; i < path.length; i += 1) length += distance3D(path[i - 1], path[i]);
    if (path.length === 0) {
      const target = optVec3(options, 'target');
      length = target ? distance3D(entityPosition(entity), target) : 0;
    }
    return measurement('calculateNPCPathLength', length, 'm', { waypoints: path.length });
  }
  /**
   * [1125] calculateNPCPathSmoothing
   * Tính đường đi mượt cho NPC.
   */
  public calculateNPCPathSmoothing(a?: any, b?: any, options?: any): any {
    const path = pointList(
      options && typeof options === 'object' ? (options as Record<string, unknown>).path : undefined,
    );
    const smoothed: Vec3D[] = [];
    for (let i = 0; i < path.length; i += 1) {
      const prev = path[i - 1] ?? path[i];
      const next = path[i + 1] ?? path[i];
      smoothed.push({
        x: (prev.x + path[i].x * 2 + next.x) / 4,
        y: (prev.y + path[i].y * 2 + next.y) / 4,
        z: (prev.z + path[i].z * 2 + next.z) / 4,
      });
    }
    let curvature = 0;
    for (let i = 1; i < path.length - 1; i += 1) {
      const v1 = directionTo(path[i - 1], path[i]);
      const v2 = directionTo(path[i], path[i + 1]);
      curvature += Math.acos(clamp(dot(v1, v2), -1, 1));
    }
    return namedResult('calculateNPCPathSmoothing', {
      path,
      smoothedPath: smoothed,
      curvature,
      segments: Math.max(0, path.length - 1),
    });
  }
  /**
   * [1126] calculateNPCWaypointIndex
   * Xác định điểm đường đi hiện tại của NPC.
   */
  public calculateNPCWaypointIndex(a?: any, b?: any, options?: any): any {
    const path = pointList(
      options && typeof options === 'object' ? (options as Record<string, unknown>).path : undefined,
    );
    const origin = pointOf(a) ?? entityPosition(b);
    let index = -1;
    let nearest = Number.POSITIVE_INFINITY;
    for (let i = 0; i < path.length; i += 1) {
      const d = distance3D(origin, path[i]);
      if (d < nearest) {
        nearest = d;
        index = i;
      }
    }
    return namedResult('calculateNPCWaypointIndex', {
      index,
      waypoint: index >= 0 ? path[index] : ZERO3,
      distance: Number.isFinite(nearest) ? nearest : 0,
      total: path.length,
    });
  }
  /**
   * [1127] calculateNPCWaypointDistance
   * Tính khoảng cách đến waypoint.
   */
  public calculateNPCWaypointDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcWaypoint;
    return measurement('calculateNPCWaypointDistance', distance, 'm', { resolved });
  }
  /**
   * [1128] calculateNPCWaypointArrival
   * Xác định NPC đã đến waypoint.
   */
  public calculateNPCWaypointArrival(a?: any, b?: any, options?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcWaypoint;
    const threshold = optNumber(options, 'threshold', 1);
    return namedResult('calculateNPCWaypointArrival', {
      arrived: distance <= threshold,
      distance,
      threshold,
      resolved,
    });
  }
  /**
   * [1129] calculateNPCPatrolRadius
   * Tính bán kính tuần tra NPC.
   */
  public calculateNPCPatrolRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const explicit = optNumber(options, 'radius', Number.NaN);
    const radius = Number.isFinite(explicit) ? explicit : profile.senses.sight * 0.5;
    return measurement('calculateNPCPatrolRadius', radius, 'm', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1130] calculateNPCPatrolPosition
   * Tính vị trí tuần tra NPC.
   */
  public calculateNPCPatrolPosition(a?: any, b?: any, options?: any): any {
    const origin = entityPosition(a);
    const radius = optNumber(options, 'radius', Number.NaN);
    const patrolRadius = Number.isFinite(radius)
      ? radius
      : resolveSpecies(a, 'humanoid').senses.sight * 0.5;
    const angle = optNumber(options, 'angle', 0);
    const position = {
      x: origin.x + Math.cos(angle) * patrolRadius,
      y: origin.y,
      z: origin.z + Math.sin(angle) * patrolRadius,
    };
    return namedResult('calculateNPCPatrolPosition', { position, angle, radius: patrolRadius });
  }
  /**
   * [1131] calculateNPCDetectionRange
   * Tính phạm vi phát hiện NPC.
   */
  public calculateNPCDetectionRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit)
      ? explicit
      : Math.max(profile.senses.sight, profile.senses.hearing, profile.senses.smell);
    return namedResult('calculateNPCDetectionRange', {
      range,
      sight: profile.senses.sight,
      hearing: profile.senses.hearing,
      smell: profile.senses.smell,
    });
  }
  /**
   * [1132] calculateNPCFieldOfView
   * Tính góc nhìn NPC.
   */
  public calculateNPCFieldOfView(a?: any, b?: any, options?: any): any {
    const fov = optNumber(options, 'fov', 100 * (Math.PI / 180));
    return namedResult('calculateNPCFieldOfView', {
      fov,
      halfAngle: fov / 2,
      horizontal: fov,
      vertical: fov * 0.6,
    });
  }
  /**
   * [1133] calculateNPCLineOfSight
   * Kiểm tra đường nhìn NPC.
   */
  public calculateNPCLineOfSight(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const from = pointOf(a);
    const to = pointOf(b);
    const distance = from && to ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcPlayer;
    const range = Math.max(profile.senses.sight, profile.senses.hearing, profile.senses.smell);
    const inRange = distance <= range;
    const facing = facingDirection(a, b);
    const toTarget = from && to ? directionTo(from, to) : facing;
    const fov = optNumber(options, 'fov', 100 * (Math.PI / 180));
    const angle = Math.acos(clamp(dot(facing, toTarget), -1, 1));
    const inFov = angle <= fov / 2;
    return namedResult('calculateNPCLineOfSight', {
      visible: inRange && inFov,
      distance,
      inRange,
      inFov,
      angle,
    });
  }
  /**
   * [1134] calculateNPCVisibilityScore
   * Tính điểm khả năng nhìn thấy mục tiêu.
   */
  public calculateNPCVisibilityScore(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const target = optVec3(options, 'target');
    const origin = entityPosition(entity);
    const distance = target ? distance3D(origin, target) : profile.senses.sight;
    const range = Math.max(profile.senses.sight, profile.senses.hearing, profile.senses.smell);
    const score = clamp01(1 - distance / Math.max(range, 1e-6));
    return measurement('calculateNPCVisibilityScore', score, 'ratio', { distance, range });
  }
  /**
   * [1135] calculateNPCThreatScore
   * Tính điểm đe dọa của NPC.
   */
  public calculateNPCThreatScore(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const target = optVec3(options, 'target');
    const distance = target ? distance3D(entityPosition(entity), target) : profile.radius;
    const base = optNumber(options, 'threat', 0.5);
    const proximity = clamp01(1 - distance / Math.max(profile.senses.sight * 2, 1e-6));
    const score = clamp01(base * (0.5 + 0.5 * proximity));
    return measurement('calculateNPCThreatScore', score, 'ratio', { distance, base });
  }
  /**
   * [1136] calculateNPCInterestScore
   * Tính điểm quan tâm NPC.
   */
  public calculateNPCInterestScore(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const target = optVec3(options, 'target');
    const distance = target ? distance3D(entityPosition(entity), target) : profile.radius;
    const base = optNumber(options, 'interest', 0.5);
    const proximity = clamp01(1 - distance / Math.max(profile.senses.sight * 2, 1e-6));
    const score = clamp01(base * (0.25 + 0.75 * proximity));
    return measurement('calculateNPCInterestScore', score, 'ratio', { distance, base });
  }
  /**
   * [1137] calculateNPCTargetPriority
   * Tính mức ưu tiên mục tiêu NPC.
   */
  public calculateNPCTargetPriority(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const from = pointOf(a);
    const to = pointOf(b);
    const distance = from && to ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcTarget;
    const threat = optNumber(options, 'threat', 0.5);
    const proximity = clamp01(1 - distance / Math.max(profile.senses.sight * 2, 1e-6));
    const priority = clamp01(threat * 0.6 + proximity * 0.4);
    return namedResult('calculateNPCTargetPriority', { priority, distance, threat });
  }
  /**
   * [1138] calculateNPCAttackRange
   * Tính tầm đánh NPC.
   */
  public calculateNPCAttackRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const melee = profile.length * 0.6;
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit) ? explicit : melee * 2;
    return namedResult('calculateNPCAttackRange', {
      range,
      melee,
      reach: melee,
      radius: profile.radius,
    });
  }
  /**
   * [1139] calculateNPCInteractionDistance
   * Tính khoảng cách tương tác NPC.
   */
  public calculateNPCInteractionDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.npcPlayer;
    return measurement('calculateNPCInteractionDistance', distance, 'm', { resolved });
  }
  /**
   * [1140] calculateNPCInteractionAngle
   * Tính góc tương tác NPC.
   */
  public calculateNPCInteractionAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(a, b);
    const toTarget = from && to ? directionTo(from, to) : facing;
    const angle = Math.acos(clamp(dot(facing, toTarget), -1, 1));
    return measurement('calculateNPCInteractionAngle', angle, 'rad');
  }
  /**
   * [1141] calculateNPCApproachPosition
   * Tính vị trí NPC tiếp cận mục tiêu.
   */
  public calculateNPCApproachPosition(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const from = pointOf(a);
    const to = pointOf(b);
    const target = to ?? entityPosition(b);
    const standoff = optNumber(options, 'distance', profile.length * 0.6 + profile.radius);
    const facing = facingDirection(a, b);
    const position = {
      x: target.x - facing.x * standoff,
      y: target.y,
      z: target.z - facing.z * standoff,
    };
    return namedResult('calculateNPCApproachPosition', {
      position,
      standoff,
      distance: from ? distance3D(from, position) : standoff,
    });
  }
  /**
   * [1142] calculateNPCFleeDirection
   * Tính hướng chạy trốn NPC.
   */
  public calculateNPCFleeDirection(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let direction: Vec3D = entityForward(a);
    if (from && to) {
      direction = directionTo(to, from);
      if (direction.x === 0 && direction.y === 0 && direction.z === 0) direction = entityForward(a);
    }
    return directionResult('calculateNPCFleeDirection', direction);
  }
  /**
   * [1143] calculateNPCChaseDirection
   * Tính hướng đuổi bắt NPC.
   */
  public calculateNPCChaseDirection(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let direction: Vec3D = entityForward(a);
    if (from && to) {
      direction = directionTo(from, to);
      if (direction.x === 0 && direction.y === 0 && direction.z === 0) direction = entityForward(a);
    }
    return directionResult('calculateNPCChaseDirection', direction);
  }
  /**
   * [1144] calculateNPCInterceptPoint
   * Tính điểm chặn mục tiêu của NPC.
   */
  public calculateNPCInterceptPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'humanoid');
    const from = entityPosition(a);
    const targetPosition = entityPosition(b);
    const targetVelocity = entityVelocity(b, optNumber(options, 'dt', 0.016));
    const separation = distance3D(from, targetPosition);
    const closing = profile.speed + magnitude(targetVelocity);
    const time = closing > 1e-6 ? separation / closing : 0;
    const position = {
      x: targetPosition.x + targetVelocity.x * time,
      y: targetPosition.y + targetVelocity.y * time,
      z: targetPosition.z + targetVelocity.z * time,
    };
    return namedResult('calculateNPCInterceptPoint', {
      position,
      timeToIntercept: time,
      separation,
      reachable: time * profile.speed >= separation,
    });
  }
  /**
   * [1145] calculateNPCPredictionPosition
   * Dự đoán vị trí NPC.
   */
  public calculateNPCPredictionPosition(a?: any, b?: any, options?: any): any {
    const time = optNumber(options, 'time', 1);
    const velocity = entityVelocity(a, optNumber(options, 'dt', 0.016));
    const base = entityPosition(a);
    const position = {
      x: base.x + velocity.x * time,
      y: base.y + velocity.y * time,
      z: base.z + velocity.z * time,
    };
    return namedResult('calculateNPCPredictionPosition', { position, time, velocity });
  }
  /**
   * [1146] calculateNPCTargetPrediction
   * Dự đoán vị trí mục tiêu của NPC.
   */
  public calculateNPCTargetPrediction(a?: any, b?: any, options?: any): any {
    const time = optNumber(options, 'time', 1);
    const velocity = entityVelocity(b, optNumber(options, 'dt', 0.016));
    const base = entityPosition(b);
    const position = {
      x: base.x + velocity.x * time,
      y: base.y + velocity.y * time,
      z: base.z + velocity.z * time,
    };
    return namedResult('calculateNPCTargetPrediction', { position, time, velocity });
  }
  /**
   * [1147] calculateNPCDecisionScore
   * Tính điểm quyết định hành động NPC.
   */
  public calculateNPCDecisionScore(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'humanoid');
    const base = optNumber(options, 'score', 0.5);
    const score = clamp01(base * 0.7 + clamp01(profile.senses.sight / 100) * 0.3);
    return measurement('calculateNPCDecisionScore', score, 'ratio', { base });
  }
  /**
   * [1148] calculateNPCStateTransition
   * Tính điều kiện chuyển trạng thái NPC.
   *
   * Trạng thái hiện tại đọc từ `npcState`/`state`, mức cảnh giác từ
   * `alertLevel`, mục tiêu từ `target`. Điểm chuyển trạng thái là mức cảnh giác
   * kết hợp với độ gần của mục tiêu (so với tầm nhìn của loài).
   */
  public calculateNPCStateTransition(a?: any, b?: any, options?: any): any {
    const source = npcSource(a, b, options);
    const profile = resolveSpecies(source, 'humanoid');
    const currentState = typeof source.npcState === 'string' ? source.npcState : source.state;
    const currentIndex = stateIndex(NPC_STATE_ORDER, currentState);
    const from = optNumber(options, 'from', currentIndex >= 0 ? currentIndex : 0);

    const alert = num(source.alertLevel, 0);
    const target = pointOf(source.target);
    const origin = entityPosition(source);
    const distance = target ? distance3D(origin, target) : Number.POSITIVE_INFINITY;
    const sight = Math.max(1e-6, profile.senses.sight);
    const proximity = target ? clamp01(1 - distance / sight) : 0;
    // Điểm chuyển trạng thái mặc định; caller có thể ghi đè bằng `options.score`.
    const computedScore = clamp01(alert * 0.5 + proximity * 0.5);
    const score = optNumber(options, 'score', computedScore);

    // Trạng thái mong muốn: thấy mục tiêu gần thì đuổi, chỉ cảnh giác thì
    // giữ trạng thái cảnh giác, còn lại thì đứng yên.
    const desiredState = proximity > 0.7 ? 'chase' : alert >= 0.35 ? 'alert' : 'idle';
    const desiredIndex = stateIndex(NPC_STATE_ORDER, desiredState);
    const to = optNumber(options, 'to', desiredIndex >= 0 ? desiredIndex : 1);
    const threshold = optNumber(options, 'threshold', 0.5);
    const triggered = score >= threshold;
    return namedResult('calculateNPCStateTransition', {
      from,
      to,
      triggered,
      score,
      threshold,
      fromState: typeof currentState === 'string' ? currentState : NPC_STATE_ORDER[from] ?? 'idle',
      toState: NPC_STATE_ORDER[to] ?? desiredState,
      alertLevel: alert,
      proximity,
      distance: Number.isFinite(distance) ? distance : 0,
    });
  }
  /**
   * [1149] calculateNPCAnimationBlend
   * Tính pha trộn hoạt ảnh NPC.
   *
   * Pha trộn đọc từ `entity.blendWeight` (hoặc `options.blend`); nếu không có
   * thì suy ra từ tốc độ hiện tại so với tốc độ tối đa của loài. Hai pha được
   * lấy từ `blendFrom`/`blendTo`.
   */
  public calculateNPCAnimationBlend(a?: any, b?: any, options?: any): any {
    const source = npcSource(a, b, options);
    const profile = resolveSpecies(source, 'humanoid');
    const fromName = typeof source.blendFrom === 'string' ? source.blendFrom : undefined;
    const toName = typeof source.blendTo === 'string' ? source.blendTo : undefined;
    const fromIndex = stateIndex(ANIMATION_STATE_ORDER, fromName);
    const toIndex = stateIndex(ANIMATION_STATE_ORDER, toName);
    const from = optNumber(options, 'from', fromIndex >= 0 ? fromIndex : 0);
    const to = optNumber(options, 'to', toIndex >= 0 ? toIndex : 1);

    const speed = num(source.speed, num(source.playbackSpeed, 0));
    const speedRatio = profile.speed > 0 ? clamp01(speed / profile.speed) : 0;
    const blend = clamp01(optNumber(options, 'blend', num(source.blendWeight, speedRatio)));
    const weight = 1 - blend;
    return namedResult('calculateNPCAnimationBlend', {
      blend,
      from,
      to,
      weight,
      fromState: fromName ?? ANIMATION_STATE_ORDER[from] ?? 'idle',
      toState: toName ?? ANIMATION_STATE_ORDER[to] ?? 'walk',
      speed,
      speedRatio,
    });
  }
  /**
   * [1150] calculateNPCNavigationError
   * Tính sai lệch điều hướng NPC.
   */
  public calculateNPCNavigationError(a?: any, b?: any, options?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(a, b);
    const desired = from && to ? directionTo(from, to) : facing;
    const heading = Math.acos(clamp(dot(facing, desired), -1, 1));
    const lateral = magnitude(cross(facing, desired));
    const error = Math.sqrt(heading * heading + lateral * lateral);
    return namedResult('calculateNPCNavigationError', { error, heading, lateral });
  }
  // ==========================================================================
  // 25. Boss, quái vật và sinh vật giả tưởng
  // ==========================================================================

  /**
   * [1151] getBossPosition
   * Lấy tọa độ boss.
   */
  public getBossPosition(entity?: any, offset?: Vec3D): any {
    return anatomicalPosition(entity, ZERO3, offset);
  }
  /**
   * [1152] getBossCenter
   * Lấy tâm boss.
   */
  public getBossCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5, z: 0 }, offset);
  }
  /**
   * [1153] getBossHeadPosition
   * Lấy tọa độ đầu boss.
   */
  public getBossHeadPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.86, z: profile.length * 0.42 },
      offset,
    );
  }
  /**
   * [1154] getBossChestPosition
   * Lấy tọa độ ngực boss.
   */
  public getBossChestPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.66, z: profile.length * 0.12 },
      offset,
    );
  }
  /**
   * [1155] getBossCorePosition
   * Lấy tọa độ lõi boss.
   */
  public getBossCorePosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.5, z: 0 },
      offset,
    );
  }
  /**
   * [1156] getBossWeakPointPosition
   * Lấy tọa độ điểm yếu boss.
   */
  public getBossWeakPointPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.58, z: profile.length * 0.28 },
      offset,
    );
  }
  /**
   * [1157] getBossHitboxCenter
   * Lấy tâm vùng trúng đòn boss.
   */
  public getBossHitboxCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.5, z: 0 },
      offset,
    );
  }
  /**
   * [1158] getBossAttackOrigin
   * Lấy điểm xuất phát đòn đánh boss.
   */
  public getBossAttackOrigin(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const direction = facingDirection(a, b);
    const origin = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.66,
      z: profile.length * 0.5,
    });
    return namedResult('getBossAttackOrigin', { origin, direction });
  }
  /**
   * [1159] getBossTargetPosition
   * Lấy tọa độ mục tiêu boss.
   */
  public getBossTargetPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.4, z: profile.length * 0.9 },
      offset,
    );
  }
  /**
   * [1160] calculateBossHeight
   * Tính chiều cao boss.
   */
  public calculateBossHeight(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    return measurement('calculateBossHeight', profile.height, 'm');
  }
  /**
   * [1161] calculateBossWidth
   * Tính chiều rộng boss.
   */
  public calculateBossWidth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    return measurement('calculateBossWidth', profile.width, 'm');
  }
  /**
   * [1162] calculateBossDepth
   * Tính chiều sâu boss.
   */
  public calculateBossDepth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    return measurement('calculateBossDepth', profile.length, 'm');
  }
  /**
   * [1163] calculateBossBounds
   * Tính giới hạn không gian boss.
   */
  public calculateBossBounds(entity?: any, size?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    const box = boundingBox(entityPosition(entity), {
      x: size?.x ?? profile.width,
      y: size?.y ?? profile.height,
      z: size?.z ?? profile.length,
    });
    return boundsResult('calculateBossBounds', box);
  }
  /**
   * [1164] calculateBossBoundingBox
   * Tính hộp bao boss.
   */
  public calculateBossBoundingBox(entity?: any, size?: Vec3D): any {
    const profile = resolveSpecies(entity, 'boss');
    const box = boundingBox(entityPosition(entity), {
      x: size?.x ?? profile.width,
      y: size?.y ?? profile.height,
      z: size?.z ?? profile.length,
    });
    return boundsResult('calculateBossBoundingBox', box);
  }
  /**
   * [1165] calculateBossBoundingSphere
   * Tính hình cầu bao boss.
   */
  public calculateBossBoundingSphere(entity?: any, radius = 1.0): any {
    const profile = resolveSpecies(entity, 'boss');
    // `radius = 1.0` là giá trị mặc định (coi như "chưa truyền") → dùng bán kính theo loài.
    const effective = radius === 1.0 ? profile.radius : radius;
    return sphereResult(
      'calculateBossBoundingSphere',
      boundingSphere(entityPosition(entity), effective),
      { speciesRadius: profile.radius },
    );
  }
  /**
   * [1166] calculateBossBoundingCapsule
   * Tính capsule bao boss.
   */
  public calculateBossBoundingCapsule(entity?: any, height = 2.0, radius = 0.5): any {
    const profile = resolveSpecies(entity, 'boss');
    // `height = 2.0` / `radius = 0.5` là giá trị mặc định → dùng số đo theo loài.
    const effectiveHeight = height === 2.0 ? profile.height : height;
    const effectiveRadius = radius === 0.5 ? profile.radius * 0.6 : radius;
    const base = entityPosition(entity);
    const capsule: Capsule3D = {
      start: { x: base.x, y: base.y, z: base.z },
      end: { x: base.x, y: base.y + effectiveHeight, z: base.z },
      radius: effectiveRadius,
    };
    return capsuleResult('calculateBossBoundingCapsule', capsule, { height: effectiveHeight });
  }
  /**
   * [1167] calculateBossCenterOfMass
   * Tính tâm khối lượng boss.
   */
  public calculateBossCenterOfMass(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.55, z: 0 });
  }
  /**
   * [1168] calculateBossDistanceToPlayer
   * Tính khoảng cách boss đến người chơi.
   */
  public calculateBossDistanceToPlayer(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.bossPlayer;
    return measurement('calculateBossDistanceToPlayer', distance, 'm', { resolved });
  }
  /**
   * [1169] calculateBossDistanceToWeakPoint
   * Tính khoảng cách đến điểm yếu boss.
   */
  public calculateBossDistanceToWeakPoint(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved ? distance3D(from, to) : REFERENCE_SEPARATIONS.bossWeakPoint;
    return measurement('calculateBossDistanceToWeakPoint', distance, 'm', { resolved });
  }
  /**
   * [1170] calculateBossFacingDirection
   * Tính hướng mặt boss.
   */
  public calculateBossFacingDirection(a?: any, b?: any): any {
    return directionResult('calculateBossFacingDirection', facingDirection(a, b));
  }
  /**
   * [1171] calculateBossTurningAngle
   * Tính góc xoay boss.
   */
  public calculateBossTurningAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(a, b);
    const desired = from && to ? directionTo(from, to) : facing;
    const angle = Math.acos(clamp(dot(facing, desired), -1, 1));
    const euler = quaternionToEuler(entityQuaternion(a));
    const yaw = Math.abs(euler.y);
    return measurement('calculateBossTurningAngle', Math.max(angle, yaw), 'rad', {
      angle,
      yaw,
    });
  }
  /**
   * [1172] calculateBossMovementSpeed
   * Tính tốc độ di chuyển boss.
   */
  public calculateBossMovementSpeed(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    const explicit = optNumber(options, 'speed', Number.NaN);
    const speed = Number.isFinite(explicit) ? explicit : profile.speed;
    return measurement('calculateBossMovementSpeed', speed, 'm/s', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1173] calculateBossAttackRange
   * Tính tầm đánh boss.
   */
  public calculateBossAttackRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const melee = profile.length * 0.6;
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit) ? explicit : melee * 2;
    return namedResult('calculateBossAttackRange', {
      range,
      melee,
      radius: profile.radius,
      center: anatomicalPosition(a, { x: 0, y: profile.height * 0.4, z: 0 }),
    });
  }
  /**
   * [1174] calculateBossAttackAngle
   * Tính góc đánh boss.
   */
  public calculateBossAttackAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(a, b);
    const desired = from && to ? directionTo(from, to) : facing;
    const angle = Math.acos(clamp(dot(facing, desired), -1, 1));
    return measurement('calculateBossAttackAngle', angle, 'rad');
  }
  /**
   * [1175] calculateBossAttackTrajectory
   * Tính quỹ đạo đòn đánh boss.
   */
  public calculateBossAttackTrajectory(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const origin = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.66,
      z: profile.length * 0.5,
    });
    const target = pointOf(b) ?? entityPosition(b);
    const speed = optNumber(options, 'speed', profile.speed * 2);
    const flightTime = optNumber(options, 'time', 1);
    const direction = directionTo(origin, target);
    const trajectory: Vec3D[] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * flightTime;
      trajectory.push({
        x: origin.x + direction.x * speed * t,
        y: origin.y + direction.y * speed * t - 0.5 * GRAVITY * t * t,
        z: origin.z + direction.z * speed * t,
      });
    }
    return namedResult('calculateBossAttackTrajectory', {
      trajectory,
      origin,
      speed,
      gravity: GRAVITY,
    });
  }
  /**
   * [1176] calculateBossProjectileVelocity
   * Tính vận tốc đạn boss.
   */
  public calculateBossProjectileVelocity(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'boss');
    const inherited = entityVelocity(entity, dt);
    const launch = scale(entityForward(entity), profile.speed * 2);
    return directionResult('calculateBossProjectileVelocity', add(inherited, launch), {
      inherited,
      launchSpeed: profile.speed * 2,
    });
  }
  /**
   * [1177] calculateBossProjectileDirection
   * Tính hướng đạn boss.
   */
  public calculateBossProjectileDirection(a?: any, b?: any): any {
    return directionResult('calculateBossProjectileDirection', facingDirection(a, b));
  }
  /**
   * [1178] calculateBossProjectileImpactPoint
   * Tính điểm va chạm đạn boss.
   */
  public calculateBossProjectileImpactPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const origin = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.66,
      z: profile.length * 0.5,
    });
    const target = pointOf(b) ?? entityPosition(b);
    const speed = optNumber(options, 'speed', profile.speed * 2);
    const distance = distance3D(origin, target);
    const time = speed > 1e-6 ? distance / speed : 0;
    const direction = directionTo(origin, target);
    const point = {
      x: origin.x + direction.x * speed * time,
      y: origin.y + direction.y * speed * time - 0.5 * GRAVITY * time * time,
      z: origin.z + direction.z * speed * time,
    };
    return namedResult('calculateBossProjectileImpactPoint', {
      point,
      distance,
      time,
      speed,
    });
  }
  /**
   * [1179] calculateBossAreaAttackRadius
   * Tính bán kính đòn đánh diện rộng.
   */
  public calculateBossAreaAttackRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    const explicit = optNumber(options, 'radius', Number.NaN);
    const radius = Number.isFinite(explicit) ? explicit : profile.radius * 2.5;
    return measurement('calculateBossAreaAttackRadius', radius, 'm', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1180] calculateBossAreaAttackCenter
   * Tính tâm vùng đòn đánh diện rộng.
   */
  public calculateBossAreaAttackCenter(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.35, z: 0 });
  }
  /**
   * [1181] calculateBossAreaAttackOverlap
   * Kiểm tra vùng đòn đánh có chồng lấn mục tiêu.
   */
  public calculateBossAreaAttackOverlap(a?: any, b?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const radius = profile.radius * 2.5;
    const center = anatomicalPosition(a, { x: 0, y: profile.height * 0.35, z: 0 });
    const areaBox = boundingBox(center, { x: radius * 2, y: radius * 2, z: radius * 2 });
    const targetBox = bodyBox(b, resolveSpecies(b, 'monster'));
    return aabbResult('calculateBossAreaAttackOverlap', areaBox, targetBox);
  }
  /**
   * [1182] calculateBossHitboxOverlap
   * Kiểm tra vùng trúng đòn boss có chồng lấn.
   */
  public calculateBossHitboxOverlap(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'boss'));
    const boxB = bodyBox(b, resolveSpecies(b, 'monster'));
    return aabbResult('calculateBossHitboxOverlap', boxA, boxB);
  }
  /**
   * [1183] calculateBossDamageDirection
   * Tính hướng nhận sát thương của boss.
   */
  public calculateBossDamageDirection(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let direction: Vec3D = { x: 0, y: 0, z: 1 };
    if (from && to) {
      direction = directionTo(from, to);
      if (direction.x === 0 && direction.y === 0 && direction.z === 0) direction = { x: 0, y: 0, z: 1 };
    }
    return directionResult('calculateBossDamageDirection', direction);
  }
  /**
   * [1184] calculateBossKnockbackDirection
   * Tính hướng đẩy lùi boss.
   */
  public calculateBossKnockbackDirection(a?: any, b?: any): any {
    return directionResult('calculateBossKnockbackDirection', facingDirection(a, b));
  }
  /**
   * [1185] calculateBossKnockbackDistance
   * Tính khoảng cách đẩy lùi boss.
   */
  public calculateBossKnockbackDistance(a?: any, b?: any): any {
    const attacker = resolveSpecies(a, 'monster');
    const boss = resolveSpecies(b, 'boss');
    const massRatio = attacker.mass / Math.max(attacker.mass + boss.mass, 1e-6);
    const impactSpeed = Math.max(attacker.speed, boss.speed);
    const distance = massRatio * (impactSpeed * impactSpeed) / (2 * FRICTION_COEFFICIENT * GRAVITY);
    return measurement('calculateBossKnockbackDistance', distance, 'm', {
      massRatio,
      impactSpeed,
    });
  }
  /**
   * [1186] calculateBossStaggerAngle
   * Tính góc choáng boss.
   */
  public calculateBossStaggerAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(b, a);
    const desired = from && to ? directionTo(from, to) : facing;
    const angle = Math.acos(clamp(dot(facing, desired), -1, 1));
    return measurement('calculateBossStaggerAngle', angle, 'rad');
  }
  /**
   * [1187] calculateBossStaggerDuration
   * Tính thời gian choáng boss.
   */
  public calculateBossStaggerDuration(a?: any, b?: any, options?: any): any {
    const boss = resolveSpecies(b, 'boss');
    const angle = this.calculateBossStaggerAngle(a, b) as Record<string, unknown>;
    const angleValue = num(angle.value);
    const duration = clamp((angleValue * boss.mass) / 2000, 0.1, 3);
    return namedResult('calculateBossStaggerDuration', {
      duration,
      angle: angleValue,
      mass: boss.mass,
    });
  }
  /**
   * [1188] calculateBossPhaseTransition
   * Tính điều kiện chuyển pha boss.
   *
   * Máu boss đọc từ `options.health`, nếu không có thì lấy từ entity
   * (`bossHealth`/`health`). Pha hiện tại đọc từ `bossPhase`; mỗi pha có một
   * ngưỡng máu riêng nên `triggered` phản ánh việc boss đã đủ yếu để lên pha
   * kế tiếp hay chưa.
   */
  public calculateBossPhaseTransition(entity?: any, options?: any): any {
    const source = (entity ?? {}) as Record<string, unknown>;
    const health = clamp01(optNumber(options, 'health', num(source.bossHealth, num(source.health, 1))));
    const declaredPhase = Math.max(1, Math.round(optNumber(options, 'phase', num(source.bossPhase, 1))));
    const phase = 1 - health;
    // Ngưỡng máu của từng pha: pha càng cao càng dễ kích hoạt.
    const thresholds = [0.75, 0.5, 0.25];
    const threshold = thresholds[Math.min(thresholds.length - 1, declaredPhase - 1)];
    const triggered = health <= threshold;
    return measurement('calculateBossPhaseTransition', phase, 'ratio', {
      phase: Math.min(3, Math.floor(phase * 3) + 1),
      triggered,
      health,
      declaredPhase,
      threshold,
    });
  }
  /**
   * [1189] calculateBossPhasePosition
   * Tính vị trí theo pha boss.
   */
  public calculateBossPhasePosition(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'boss');
    const phase = optNumber(options, 'phase', 1);
    const rise = profile.height * 0.1 * (phase - 1);
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5 + rise, z: 0 });
  }
  /**
   * [1190] calculateBossWeakPointExposure
   * Tính mức lộ điểm yếu boss.
   */
  public calculateBossWeakPointExposure(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'boss');
    const weakPoint = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.58,
      z: profile.length * 0.28,
    });
    const attacker = pointOf(b);
    const distance = attacker ? distance3D(attacker, weakPoint) : REFERENCE_SEPARATIONS.bossWeakPoint;
    const facing = facingDirection(a, b);
    const toWeakPoint = directionTo(anatomicalPosition(a, ZERO3), weakPoint);
    const angle = Math.acos(clamp(dot(facing, toWeakPoint), -1, 1));
    const exposure = clamp01(1 - angle / Math.PI) * clamp01(1 - distance / (profile.radius * 8));
    return namedResult('calculateBossWeakPointExposure', {
      exposure,
      distance,
      angle,
      position: weakPoint,
    });
  }
  /**
   * [1191] calculateMonsterPosition
   * Lấy tọa độ quái vật.
   */
  public calculateMonsterPosition(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'monster');
    const position = entityPosition(a);
    return namedResult('calculateMonsterPosition', {
      position,
      radius: profile.radius,
      height: profile.height,
    });
  }
  /**
   * [1192] calculateMonsterMovementDirection
   * Tính hướng di chuyển quái vật.
   */
  public calculateMonsterMovementDirection(a?: any, b?: any): any {
    return directionResult('calculateMonsterMovementDirection', facingDirection(a, b));
  }
  /**
   * [1193] calculateMonsterSpeed
   * Tính tốc độ quái vật.
   */
  public calculateMonsterSpeed(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'monster');
    const explicit = optNumber(options, 'speed', Number.NaN);
    const speed = Number.isFinite(explicit) ? explicit : profile.speed;
    return measurement('calculateMonsterSpeed', speed, 'm/s', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1194] calculateMonsterAttackDistance
   * Tính khoảng cách đánh quái vật.
   */
  public calculateMonsterAttackDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const fallback = resolveSpecies(a, 'monster').length * 0.8;
    const distance = resolved ? distance3D(from, to) : fallback;
    return measurement('calculateMonsterAttackDistance', distance, 'm', { resolved });
  }
  /**
   * [1195] calculateMonsterDetectionRange
   * Tính phạm vi phát hiện quái vật.
   */
  public calculateMonsterDetectionRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'monster');
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit)
      ? explicit
      : Math.max(profile.senses.sight, profile.senses.hearing, profile.senses.smell);
    return namedResult('calculateMonsterDetectionRange', {
      range,
      sight: profile.senses.sight,
      hearing: profile.senses.hearing,
      smell: profile.senses.smell,
    });
  }
  /**
   * [1196] calculateMonsterCollision
   * Kiểm tra va chạm quái vật.
   */
  public calculateMonsterCollision(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'monster'));
    const boxB = bodyBox(b, resolveSpecies(b, 'monster'));
    return aabbResult('calculateMonsterCollision', boxA, boxB);
  }
  /**
   * [1197] calculateMonsterBoundingBox
   * Tính hộp bao quái vật.
   */
  public calculateMonsterBoundingBox(entity?: any, size?: Vec3D): any {
    const profile = resolveSpecies(entity, 'monster');
    const box = boundingBox(entityPosition(entity), {
      x: size?.x ?? profile.width,
      y: size?.y ?? profile.height,
      z: size?.z ?? profile.length,
    });
    return boundsResult('calculateMonsterBoundingBox', box);
  }
  /**
   * [1198] calculateMonsterBoundingSphere
   * Tính hình cầu bao quái vật.
   */
  public calculateMonsterBoundingSphere(entity?: any, radius = 1.0): any {
    const profile = resolveSpecies(entity, 'monster');
    // `radius = 1.0` là giá trị mặc định (coi như "chưa truyền") → dùng bán kính theo loài.
    const effective = radius === 1.0 ? profile.radius : radius;
    return sphereResult(
      'calculateMonsterBoundingSphere',
      boundingSphere(entityPosition(entity), effective),
      { speciesRadius: profile.radius },
    );
  }
  /**
   * [1199] calculateMonsterWeakPoint
   * Tính vị trí điểm yếu quái vật.
   */
  public calculateMonsterWeakPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'monster');
    const position = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.6,
      z: profile.length * 0.3,
    });
    const attacker = pointOf(b);
    const distance = attacker ? distance3D(attacker, position) : profile.radius * 2;
    return namedResult('calculateMonsterWeakPoint', {
      position,
      distance,
      exposure: clamp01(1 - distance / Math.max(profile.radius * 8, 1e-6)),
    });
  }
  /**
   * [1200] calculateMonsterThreatLevel
   * Tính mức độ đe dọa quái vật.
   */
  public calculateMonsterThreatLevel(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'monster');
    const from = pointOf(a);
    const to = pointOf(b);
    const distance = from && to ? distance3D(from, to) : REFERENCE_SEPARATIONS.monsterAttack;
    const base = optNumber(options, 'threat', 0.5);
    const level = clamp01(base * 0.6 + clamp01(profile.mass / 1000) * 0.4);
    return namedResult('calculateMonsterThreatLevel', {
      level,
      distance,
      mass: profile.mass,
      base,
    });
  }
  // ==========================================================================
  // 26. Tọa độ con vật và chuyển động sinh học
  // ==========================================================================

  /**
   * [1201] getAnimalPosition
   * Lấy tọa độ con vật.
   */
  public getAnimalPosition(entity?: any, offset?: Vec3D): any {
    return anatomicalPosition(entity, ZERO3, offset);
  }
  /**
   * [1202] getAnimalCenter
   * Lấy tâm con vật.
   */
  public getAnimalCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5, z: 0 }, offset);
  }
  /**
   * [1203] getAnimalHeadPosition
   * Lấy tọa độ đầu con vật.
   */
  public getAnimalHeadPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.78, z: profile.length * 0.42 },
      offset,
    );
  }
  /**
   * [1204] getAnimalSnoutPosition
   * Lấy tọa độ mõm con vật.
   */
  public getAnimalSnoutPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.68, z: profile.length * 0.55 },
      offset,
    );
  }
  /**
   * [1205] getAnimalNosePosition
   * Lấy tọa độ mũi con vật.
   */
  public getAnimalNosePosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.66, z: profile.length * 0.58 },
      offset,
    );
  }
  /**
   * [1206] getAnimalEyePosition
   * Lấy tọa độ mắt con vật.
   */
  public getAnimalEyePosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.25,
        y: profile.height * 0.82,
        z: profile.length * 0.46,
      },
      offset,
    );
  }
  /**
   * [1207] getAnimalEarPosition
   * Lấy tọa độ tai con vật.
   */
  public getAnimalEarPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.28,
        y: profile.height * 0.92,
        z: profile.length * 0.4,
      },
      offset,
    );
  }
  /**
   * [1208] getAnimalNeckPosition
   * Lấy tọa độ cổ con vật.
   */
  public getAnimalNeckPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.72, z: profile.length * 0.3 },
      offset,
    );
  }
  /**
   * [1209] getAnimalTorsoPosition
   * Lấy tọa độ thân con vật.
   */
  public getAnimalTorsoPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.55, z: 0 }, offset);
  }
  /**
   * [1210] getAnimalChestPosition
   * Lấy tọa độ ngực con vật.
   */
  public getAnimalChestPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.58, z: profile.length * 0.18 },
      offset,
    );
  }
  /**
   * [1211] getAnimalAbdomenPosition
   * Lấy tọa độ bụng con vật.
   */
  public getAnimalAbdomenPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.52, z: -profile.length * 0.12 },
      offset,
    );
  }
  /**
   * [1212] getAnimalHipPosition
   * Lấy tọa độ hông con vật.
   */
  public getAnimalHipPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.52, z: -profile.length * 0.22 },
      offset,
    );
  }
  /**
   * [1213] getAnimalTailPosition
   * Lấy tọa độ đuôi con vật.
   */
  public getAnimalTailPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.55, z: -profile.length * 0.36 },
      offset,
    );
  }
  /**
   * [1214] getAnimalTailTipPosition
   * Lấy tọa độ chóp đuôi con vật.
   */
  public getAnimalTailTipPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.48, z: -profile.length * 0.52 },
      offset,
    );
  }
  /**
   * [1215] getAnimalFrontLeftLegPosition
   * Lấy tọa độ chân trước trái con vật.
   */
  public getAnimalFrontLeftLegPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: -profile.width * 0.45,
        y: profile.height * 0.22,
        z: profile.length * 0.18,
      },
      offset,
    );
  }
  /**
   * [1216] getAnimalFrontRightLegPosition
   * Lấy tọa độ chân trước phải con vật.
   */
  public getAnimalFrontRightLegPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.45,
        y: profile.height * 0.22,
        z: profile.length * 0.18,
      },
      offset,
    );
  }
  /**
   * [1217] getAnimalRearLeftLegPosition
   * Lấy tọa độ chân sau trái con vật.
   */
  public getAnimalRearLeftLegPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: -profile.width * 0.45,
        y: profile.height * 0.22,
        z: -profile.length * 0.2,
      },
      offset,
    );
  }
  /**
   * [1218] getAnimalRearRightLegPosition
   * Lấy tọa độ chân sau phải con vật.
   */
  public getAnimalRearRightLegPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.45,
        y: profile.height * 0.22,
        z: -profile.length * 0.2,
      },
      offset,
    );
  }
  /**
   * [1219] getAnimalPawPosition
   * Lấy tọa độ bàn chân con vật.
   */
  public getAnimalPawPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: -profile.width * 0.45,
        y: profile.height * 0.03,
        z: profile.length * 0.12,
      },
      offset,
    );
  }
  /**
   * [1220] getAnimalClawPosition
   * Lấy tọa độ móng vuốt con vật.
   */
  public getAnimalClawPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(
      entity,
      {
        x: -profile.width * 0.45,
        y: profile.height * 0.02,
        z: profile.length * 0.16,
      },
      offset,
    );
  }
  /**
   * [1221] calculateAnimalBodyLength
   * Tính chiều dài thân con vật.
   */
  public calculateAnimalBodyLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    return measurement('calculateAnimalBodyLength', profile.length, 'm');
  }
  /**
   * [1222] calculateAnimalBodyHeight
   * Tính chiều cao thân con vật.
   */
  public calculateAnimalBodyHeight(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    return measurement('calculateAnimalBodyHeight', profile.height, 'm');
  }
  /**
   * [1223] calculateAnimalBodyWidth
   * Tính chiều rộng thân con vật.
   */
  public calculateAnimalBodyWidth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    return measurement('calculateAnimalBodyWidth', profile.width, 'm');
  }
  /**
   * [1224] calculateAnimalCenterOfMass
   * Tính tâm khối lượng con vật.
   */
  public calculateAnimalCenterOfMass(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.52, z: 0 });
  }
  /**
   * [1225] calculateAnimalSpineCurvature
   * Tính độ cong cột sống con vật.
   */
  public calculateAnimalSpineCurvature(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    // Cột sống thú bố chân hơi cong lõm về bụng; góc cong tỉ lệ với chiều dài thân.
    const curvature = clamp(profile.length * 0.08, 0.02, 0.35);
    return measurement('calculateAnimalSpineCurvature', curvature, 'rad', {
      bodyLength: profile.length,
    });
  }
  /**
   * [1226] calculateAnimalNeckAngle
   * Tính góc cổ con vật.
   */
  public calculateAnimalNeckAngle(a?: any, b?: any): any {
    const euler = quaternionToEuler(entityQuaternion(a));
    const angle = Math.abs(euler.x);
    return measurement('calculateAnimalNeckAngle', angle, 'rad', { pitch: euler.x });
  }
  /**
   * [1227] calculateAnimalHeadAngle
   * Tính góc đầu con vật.
   */
  public calculateAnimalHeadAngle(a?: any, b?: any): any {
    const euler = quaternionToEuler(entityQuaternion(a));
    const angle = Math.abs(euler.z);
    return measurement('calculateAnimalHeadAngle', angle, 'rad', { roll: euler.z });
  }
  /**
   * [1228] calculateAnimalTailCurvature
   * Tính độ cong đuôi con vật.
   */
  public calculateAnimalTailCurvature(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const curvature = clamp(profile.length * 0.06, 0.02, 0.3);
    return measurement('calculateAnimalTailCurvature', curvature, 'rad', {
      tailLength: profile.length * 0.2,
    });
  }
  /**
   * [1229] calculateAnimalTailSwing
   * Tính độ vung đuôi con vật.
   */
  public calculateAnimalTailSwing(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const velocity = entityVelocity(a, optNumber(options, 'dt', 0.016));
    const speed = magnitude(velocity);
    const amplitude = clamp(speed / Math.max(profile.speed, 1e-6), 0, 1);
    const angle = amplitude * Math.PI * 0.25;
    return namedResult('calculateAnimalTailSwing', {
      swing: amplitude,
      angle,
      amplitude,
      speed,
    });
  }
  /**
   * [1230] calculateAnimalLegLength
   * Tính chiều dài chân con vật.
   */
  public calculateAnimalLegLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const explicit = optNumber(options, 'length', Number.NaN);
    const length = Number.isFinite(explicit) ? explicit : profile.legLength;
    return measurement('calculateAnimalLegLength', length, 'm', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1231] calculateAnimalStrideLength
   * Tính chiều dài bước con vật.
   */
  public calculateAnimalStrideLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const stride = profile.legLength * 1.6;
    return measurement('calculateAnimalStrideLength', stride, 'm', { legLength: profile.legLength });
  }
  /**
   * [1232] calculateAnimalStrideFrequency
   * Tính tần số bước con vật.
   */
  public calculateAnimalStrideFrequency(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const stride = profile.legLength * 1.6;
    const frequency = stride > 1e-6 ? profile.speed / stride : 0;
    return measurement('calculateAnimalStrideFrequency', frequency, 'Hz', {
      strideLength: stride,
      speed: profile.speed,
    });
  }
  /**
   * [1233] calculateAnimalWalkingSpeed
   * Tính tốc độ đi con vật.
   */
  public calculateAnimalWalkingSpeed(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const speed = profile.speed * 0.3;
    return measurement('calculateAnimalWalkingSpeed', speed, 'm/s', { topSpeed: profile.speed });
  }
  /**
   * [1234] calculateAnimalRunningSpeed
   * Tính tốc độ chạy con vật.
   */
  public calculateAnimalRunningSpeed(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const speed = profile.speed * 0.8;
    return measurement('calculateAnimalRunningSpeed', speed, 'm/s', { topSpeed: profile.speed });
  }
  /**
   * [1235] calculateAnimalJumpHeight
   * Tính độ cao nhảy con vật.
   */
  public calculateAnimalJumpHeight(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    // Nhảy cao gần đúng bằng 35% chiều cao thân.
    const height = profile.height * 0.35;
    return measurement('calculateAnimalJumpHeight', height, 'm', { bodyHeight: profile.height });
  }
  /**
   * [1236] calculateAnimalLandingPosition
   * Tính vị trí tiếp đất con vật.
   */
  public calculateAnimalLandingPosition(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const origin = entityPosition(a);
    const velocity = entityVelocity(a, optNumber(options, 'dt', 0.016));
    const time = optNumber(options, 'time', 1);
    const position = {
      x: origin.x + velocity.x * time,
      y: Math.max(0, origin.y + velocity.y * time - 0.5 * GRAVITY * time * time),
      z: origin.z + velocity.z * time,
    };
    return namedResult('calculateAnimalLandingPosition', {
      position,
      time,
      impactSpeed: magnitude(velocity),
      legLength: profile.legLength,
    });
  }
  /**
   * [1237] calculateAnimalGroundContact
   * Kiểm tra chân con vật tiếp xúc mặt đất.
   */
  public calculateAnimalGroundContact(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const origin = entityPosition(a);
    const ground = optNumber(options, 'groundY', 0);
    const pawHeight = origin.y + profile.height * 0.03;
    const distance = Math.abs(pawHeight - ground);
    const contact = distance <= 0.05;
    return namedResult('calculateAnimalGroundContact', {
      contact,
      distance,
      normal: { x: 0, y: 1, z: 0 },
      pawHeight,
    });
  }
  /**
   * [1238] calculateAnimalFootPlacement
   * Tính vị trí đặt chân con vật.
   */
  public calculateAnimalFootPlacement(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const side = optNumber(options, 'side', -1);
    const phase = optNumber(options, 'phase', 0);
    const stride = profile.legLength * 1.6;
    const origin = entityPosition(a);
    const position = {
      x: origin.x + side * profile.width * 0.45,
      y: origin.y + profile.height * 0.03,
      z: origin.z + Math.cos(phase) * stride * 0.5,
    };
    return namedResult('calculateAnimalFootPlacement', { position, stride, phase });
  }
  /**
   * [1239] calculateAnimalBalance
   * Tính độ cân bằng con vật.
   */
  public calculateAnimalBalance(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const origin = entityPosition(a);
    const center = anatomicalPosition(a, { x: 0, y: profile.height * 0.5, z: 0 });
    const lean = Math.abs(origin.x - center.x);
    const score = clamp01(1 - lean / Math.max(profile.height, 1e-6));
    return namedResult('calculateAnimalBalance', {
      balance: score,
      score,
      lean,
      supportWidth: profile.width,
    });
  }
  /**
   * [1240] calculateAnimalGaitPhase
   * Tính pha dáng đi con vật.
   */
  public calculateAnimalGaitPhase(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'animal');
    const stride = profile.legLength * 1.6;
    const frequency = stride > 1e-6 ? profile.speed / stride : 0;
    const time = simulationTime(entity, options);
    const phase = (time * frequency * Math.PI * 2) % (Math.PI * 2);
    return measurement('calculateAnimalGaitPhase', phase, 'rad', { frequency });
  }
  /**
   * [1241] calculateAnimalHeadToGroundDistance
   * Tính khoảng cách đầu con vật đến mặt đất.
   */
  public calculateAnimalHeadToGroundDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const fallback = resolveSpecies(a, 'animal').height * 0.78;
    const distance = resolved ? distance3D(from, to) : fallback;
    return measurement('calculateAnimalHeadToGroundDistance', distance, 'm', { resolved });
  }
  /**
   * [1242] calculateAnimalNoseToTargetDistance
   * Tính khoảng cách mũi đến mục tiêu.
   */
  public calculateAnimalNoseToTargetDistance(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const fallback = resolveSpecies(a, 'animal').length;
    const distance = resolved ? distance3D(from, to) : fallback;
    return measurement('calculateAnimalNoseToTargetDistance', distance, 'm', { resolved });
  }
  /**
   * [1243] calculateAnimalSightDirection
   * Tính hướng nhìn con vật.
   */
  public calculateAnimalSightDirection(a?: any, b?: any): any {
    return directionResult('calculateAnimalSightDirection', facingDirection(a, b));
  }
  /**
   * [1244] calculateAnimalFieldOfView
   * Tính trường nhìn con vật.
   */
  public calculateAnimalFieldOfView(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    // Thú săn mồi có trường nhìn hẹp hơn con mồi.
    const fov = optNumber(options, 'fov', profile.speed > 10 ? 120 * (Math.PI / 180) : 200 * (Math.PI / 180));
    return namedResult('calculateAnimalFieldOfView', {
      fov,
      halfAngle: fov / 2,
      horizontal: fov,
      vertical: fov * 0.5,
    });
  }
  /**
   * [1245] calculateAnimalHearingRange
   * Tính phạm vi nghe con vật.
   */
  public calculateAnimalHearingRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit) ? explicit : profile.senses.hearing;
    return namedResult('calculateAnimalHearingRange', { range, hearing: profile.senses.hearing });
  }
  /**
   * [1246] calculateAnimalSmellRange
   * Tính phạm vi ngửi con vật.
   */
  public calculateAnimalSmellRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit) ? explicit : profile.senses.smell;
    return namedResult('calculateAnimalSmellRange', { range, smell: profile.senses.smell });
  }
  /**
   * [1247] calculateAnimalAttackRange
   * Tính tầm tấn công con vật.
   */
  public calculateAnimalAttackRange(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const melee = profile.length * 0.5;
    const explicit = optNumber(options, 'range', Number.NaN);
    const range = Number.isFinite(explicit) ? explicit : melee;
    return namedResult('calculateAnimalAttackRange', {
      range,
      melee,
      reach: melee,
      bitePoint: anatomicalPosition(a, {
        x: 0,
        y: profile.height * 0.66,
        z: profile.length * 0.58,
      }),
    });
  }
  /**
   * [1248] calculateAnimalBitePoint
   * Tính điểm cắn con vật.
   */
  public calculateAnimalBitePoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'animal');
    const point = anatomicalPosition(a, {
      x: 0,
      y: profile.height * 0.66,
      z: profile.length * 0.58,
    });
    const target = pointOf(b);
    const distance = target ? distance3D(point, target) : profile.length * 0.58;
    return namedResult('calculateAnimalBitePoint', { point, distance });
  }
  /**
   * [1249] calculateAnimalBiteDirection
   * Tính hướng cắn con vật.
   */
  public calculateAnimalBiteDirection(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let direction: Vec3D = entityForward(a);
    if (from && to) {
      direction = directionTo(from, to);
      if (direction.x === 0 && direction.y === 0 && direction.z === 0) direction = entityForward(a);
    }
    return directionResult('calculateAnimalBiteDirection', direction);
  }
  /**
   * [1250] calculateAnimalCollision
   * Kiểm tra va chạm con vật.
   */
  public calculateAnimalCollision(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'animal'));
    const boxB = bodyBox(b, resolveSpecies(b, 'animal'));
    return aabbResult('calculateAnimalCollision', boxA, boxB);
  }
  // ==========================================================================
  // 27. Tọa độ chim, cánh và sinh vật bay
  // ==========================================================================

  /**
   * [1251] getBirdPosition
   * Lấy tọa độ chim.
   */
  public getBirdPosition(entity?: any, offset?: Vec3D): any {
    return anatomicalPosition(entity, ZERO3, offset);
  }
  /**
   * [1252] getBirdHeadPosition
   * Lấy tọa độ đầu chim.
   */
  public getBirdHeadPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.75, z: profile.length * 0.38 },
      offset,
    );
  }
  /**
   * [1253] getBirdBeakPosition
   * Lấy tọa độ mỏ chim.
   */
  public getBirdBeakPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: 0,
        y: profile.height * 0.72,
        z: profile.length * 0.38 + profile.beakLength,
      },
      offset,
    );
  }
  /**
   * [1254] getBirdEyePosition
   * Lấy tọa độ mắt chim.
   */
  public getBirdEyePosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.35,
        y: profile.height * 0.8,
        z: profile.length * 0.4,
      },
      offset,
    );
  }
  /**
   * [1255] getBirdBodyCenter
   * Lấy tâm thân chim.
   */
  public getBirdBodyCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5, z: 0 }, offset);
  }
  /**
   * [1256] getBirdWingRootPosition
   * Lấy tọa độ gốc cánh chim.
   */
  public getBirdWingRootPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.3,
        y: profile.height * 0.6,
        z: profile.length * 0.05,
      },
      offset,
    );
  }
  /**
   * [1257] getBirdLeftWingTip
   * Lấy tọa độ đầu cánh trái.
   */
  public getBirdLeftWingTip(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: -profile.wingspan * 0.5,
        y: profile.height * 0.62,
        z: profile.length * 0.1,
      },
      offset,
    );
  }
  /**
   * [1258] getBirdRightWingTip
   * Lấy tọa độ đầu cánh phải.
   */
  public getBirdRightWingTip(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: profile.wingspan * 0.5,
        y: profile.height * 0.62,
        z: profile.length * 0.1,
      },
      offset,
    );
  }
  /**
   * [1259] getBirdWingCenter
   * Lấy tâm cánh chim.
   */
  public getBirdWingCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: profile.wingspan * 0.25,
        y: profile.height * 0.6,
        z: profile.length * 0.08,
      },
      offset,
    );
  }
  /**
   * [1260] getBirdTailTipPosition
   * Lấy tọa độ chóp đuôi chim.
   */
  public getBirdTailTipPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.45, z: -profile.length * 0.45 },
      offset,
    );
  }
  /**
   * [1261] getBirdLeftFootPosition
   * Lấy tọa độ chân trái chim.
   */
  public getBirdLeftFootPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: -profile.width * 0.2,
        y: profile.height * 0.02,
        z: profile.length * 0.02,
      },
      offset,
    );
  }
  /**
   * [1262] getBirdRightFootPosition
   * Lấy tọa độ chân phải chim.
   */
  public getBirdRightFootPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'bird');
    return anatomicalPosition(
      entity,
      {
        x: profile.width * 0.2,
        y: profile.height * 0.02,
        z: profile.length * 0.02,
      },
      offset,
    );
  }
  /**
   * [1263] calculateBirdWingspan
   * Tính sải cánh chim.
   *
   * LƯU Ý (hợp đồng public): hàm này phải trả về **số** (met) — bộ test
   * `tests/spatial-ui-system.test.ts` khẳng định `toBeGreaterThan(0)`. Vì vậy nó
   * trả số thuần thay vì bản ghi `measurement(...)`; bản ghi đầy đủ (name /
   * value / unit / valid / timestamp) nằm trong `birdWingspanMeasurement()`.
   */
  public calculateBirdWingspan(entity?: any, options?: any): any {
    return resolveSpecies(entity, 'bird').wingspan;
  }
  /**
   * [1264] calculateBirdWingLength
   * Tính chiều dài cánh chim.
   */
  public calculateBirdWingLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    return measurement('calculateBirdWingLength', profile.wingspan * 0.5, 'm', {
      wingspan: profile.wingspan,
    });
  }
  /**
   * [1265] calculateBirdWingArea
   * Tính diện tích cánh chim.
   */
  public calculateBirdWingArea(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    return measurement('calculateBirdWingArea', wingAreaOf(profile), 'm²', {
      wingspan: profile.wingspan,
    });
  }
  /**
   * [1266] calculateBirdWingAngle
   * Tính góc cánh chim.
   */
  public calculateBirdWingAngle(a?: any, b?: any): any {
    const euler = quaternionToEuler(entityQuaternion(a));
    const angle = Math.abs(euler.z);
    return measurement('calculateBirdWingAngle', angle, 'rad', { roll: euler.z });
  }
  /**
   * [1267] calculateBirdWingFlapAmplitude
   * Tính biên độ vỗ cánh.
   */
  public calculateBirdWingFlapAmplitude(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    // Chim nhỏ vỗ cánh rộng hơn chim lớn (biên độ giảm theo kích thước).
    const amplitude = clamp(1.1 - profile.length * 0.6, 0.25, 1.1);
    return measurement('calculateBirdWingFlapAmplitude', amplitude, 'rad');
  }
  /**
   * [1268] calculateBirdWingFlapFrequency
   * Tính tần số vỗ cánh.
   */
  public calculateBirdWingFlapFrequency(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    const explicit = optNumber(options, 'frequency', Number.NaN);
    const frequency = Number.isFinite(explicit) ? explicit : profile.flapFrequency;
    return measurement('calculateBirdWingFlapFrequency', frequency, 'Hz', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1269] calculateBirdWingFlapPhase
   * Tính pha vỗ cánh.
   */
  public calculateBirdWingFlapPhase(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    const time = simulationTime(entity, options);
    const phase = (time * profile.flapFrequency * Math.PI * 2) % (Math.PI * 2);
    return measurement('calculateBirdWingFlapPhase', phase, 'rad', {
      frequency: profile.flapFrequency,
    });
  }
  /**
   * [1270] calculateBirdWingVelocity
   * Tính vận tốc cánh chim.
   */
  public calculateBirdWingVelocity(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'bird');
    const body = entityVelocity(entity, dt);
    // Vận tốc riêng của đầu cánh do vỗ cánh sinh ra.
    const flap = profile.speed * profile.flapFrequency * 0.1;
    const sweep = { x: 0, y: flap, z: 0 };
    return directionResult('calculateBirdWingVelocity', add(body, sweep), {
      body,
      flapComponent: sweep,
    });
  }
  /**
   * [1271] calculateBirdWingAcceleration
   * Tính gia tốc cánh chim.
   */
  public calculateBirdWingAcceleration(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'bird');
    const body = entityAcceleration(entity, dt);
    // Gia tốc hướng tâm của đầu cánh khi vỗ: a = ω²·r.
    const omega = profile.flapFrequency * Math.PI * 2;
    const radius = profile.wingspan * 0.5;
    const centripetal = omega * omega * radius;
    return directionResult('calculateBirdWingAcceleration', add(body, { x: 0, y: centripetal, z: 0 }), {
      body,
      centripetal,
    });
  }
  /**
   * [1272] calculateBirdFlightDirection
   * Tính hướng bay chim.
   */
  public calculateBirdFlightDirection(a?: any, b?: any): any {
    return directionResult('calculateBirdFlightDirection', facingDirection(a, b));
  }
  /**
   * [1273] calculateBirdFlightSpeed
   * Tính tốc độ bay chim.
   */
  public calculateBirdFlightSpeed(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    const explicit = optNumber(options, 'speed', Number.NaN);
    const speed = Number.isFinite(explicit) ? explicit : profile.speed;
    return measurement('calculateBirdFlightSpeed', speed, 'm/s', {
      derived: !Number.isFinite(explicit),
    });
  }
  /**
   * [1274] calculateBirdFlightAltitude
   * Tính độ cao bay chim.
   */
  public calculateBirdFlightAltitude(a?: any, b?: any, options?: any): any {
    const ground = optNumber(options, 'groundY', 0);
    const origin = entityPosition(a);
    const altitude = origin.y - ground;
    const target = pointOf(b);
    const clearance = target ? target.y - ground : altitude;
    return namedResult('calculateBirdFlightAltitude', {
      altitude,
      clearance,
      groundLevel: ground,
    });
  }
  /**
   * [1275] calculateBirdFlightPath
   * Tính đường bay chim.
   */
  public calculateBirdFlightPath(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const origin = entityPosition(a);
    const target = pointOf(b) ?? entityPosition(b);
    const speed = optNumber(options, 'speed', profile.speed);
    const distance = distance3D(origin, target);
    const time = speed > 1e-6 ? distance / speed : 0;
    const path: Vec3D[] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * time;
      path.push({
        x: lerp(origin.x, target.x, i / steps),
        y: lerp(origin.y, target.y, i / steps) + Math.sin((i / steps) * Math.PI) * distance * 0.05,
        z: lerp(origin.z, target.z, i / steps),
      });
    }
    return namedResult('calculateBirdFlightPath', {
      path,
      length: distance,
      time,
      speed,
    });
  }
  /**
   * [1276] calculateBirdGlideAngle
   * Tính góc lượn chim.
   */
  public calculateBirdGlideAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    if (from && to) {
      const horizontal = distance2D(from, to);
      const vertical = Math.abs(to.y - from.y);
      const angle = Math.atan2(vertical, Math.max(horizontal, 1e-6));
      return measurement('calculateBirdGlideAngle', angle, 'rad', { glideRatio: horizontal / Math.max(vertical, 1e-6) });
    }
    // Tỉ lệ lượn điển hình 15:1 → góc hạ xuống ~3,8°.
    const angle = Math.atan2(1, 15);
    return measurement('calculateBirdGlideAngle', angle, 'rad', { glideRatio: 15 });
  }
  /**
   * [1277] calculateBirdTurnRadius
   * Tính bán kính vòng lượn chim.
   */
  public calculateBirdTurnRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'bird');
    const bank = optNumber(options, 'bank', 30 * (Math.PI / 180));
    const radius = (profile.speed * profile.speed) / (GRAVITY * Math.max(Math.tan(bank), 1e-6));
    return measurement('calculateBirdTurnRadius', radius, 'm', { bank, speed: profile.speed });
  }
  /**
   * [1278] calculateBirdBankAngle
   * Tính góc nghiêng khi chim rẽ.
   */
  public calculateBirdBankAngle(a?: any, b?: any): any {
    const euler = quaternionToEuler(entityQuaternion(a));
    const from = pointOf(a);
    const to = pointOf(b);
    const facing = facingDirection(a, b);
    const desired = from && to ? directionTo(from, to) : facing;
    const heading = Math.acos(clamp(dot(facing, desired), -1, 1));
    return measurement('calculateBirdBankAngle', Math.abs(euler.z) + heading, 'rad', {
      roll: euler.z,
      heading,
    });
  }
  /**
   * [1279] calculateBirdLiftForce
   * Tính lực nâng cánh chim.
   */
  public calculateBirdLiftForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'bird');
    const lift = liftOf(profile);
    return directionResult('calculateBirdLiftForce', { x: 0, y: lift, z: 0 }, {
      lift,
      wingArea: wingAreaOf(profile),
      weight: profile.mass * GRAVITY,
    });
  }
  /**
   * [1280] calculateBirdDragForce
   * Tính lực cản không khí chim.
   */
  public calculateBirdDragForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'bird');
    const drag = dragOf(profile);
    const velocity = entityVelocity(entity, dt);
    const dir = directionTo({ x: 0, y: 0, z: 0 }, velocity);
    const force = { x: -dir.x * drag, y: -dir.y * drag, z: -dir.z * drag };
    return directionResult('calculateBirdDragForce', force, {
      drag,
      wingArea: wingAreaOf(profile),
    });
  }
  /**
   * [1281] calculateBirdHoverPosition
   * Tính vị trí chim bay lơ lửng.
   */
  public calculateBirdHoverPosition(a?: any, b?: any, options?: any): any {
    const origin = entityPosition(a);
    const hoverHeight = optNumber(options, 'height', Number.NaN);
    const height = Number.isFinite(hoverHeight) ? hoverHeight : 10;
    const position = { x: origin.x, y: origin.y + height, z: origin.z };
    return namedResult('calculateBirdHoverPosition', { position, height });
  }
  /**
   * [1282] calculateBirdLandingPoint
   * Tính điểm hạ cánh chim.
   */
  public calculateBirdLandingPoint(a?: any, b?: any, options?: any): any {
    const ground = optNumber(options, 'groundY', 0);
    const target = pointOf(b);
    const position = target
      ? { x: target.x, y: ground, z: target.z }
      : { x: entityPosition(a).x, y: ground, z: entityPosition(a).z };
    return namedResult('calculateBirdLandingPoint', { position, groundLevel: ground });
  }
  /**
   * [1283] calculateBirdTakeoffVelocity
   * Tính vận tốc cất cánh chim.
   */
  public calculateBirdTakeoffVelocity(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'bird');
    const inherited = entityVelocity(entity, dt);
    const takeoff = scale(entityForward(entity), profile.speed * 0.6);
    const climb = { x: 0, y: profile.speed * 0.4, z: 0 };
    return directionResult('calculateBirdTakeoffVelocity', add(add(inherited, takeoff), climb), {
      inherited,
      takeoff,
    });
  }
  /**
   * [1284] calculateBirdObstacleAvoidance
   * Tính hướng tránh vật cản khi bay.
   */
  public calculateBirdObstacleAvoidance(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const origin = entityPosition(a);
    const obstacle = pointOf(b);
    const direction = facingDirection(a, b);
    const distance = obstacle ? distance3D(origin, obstacle) : profile.speed * 2;
    const trigger = profile.speed * 3;
    // Khi gần vật cản, lái cánh lên và sang bên.
    const away = obstacle ? directionTo(obstacle, origin) : direction;
    const avoid = normalize({
      x: away.x * 0.5,
      y: 0.6,
      z: away.z * 0.5,
    });
    return namedResult('calculateBirdObstacleAvoidance', {
      direction: avoid,
      distance,
      trigger,
      braking: distance < trigger,
    });
  }
  /**
   * [1285] calculateBirdFormationPosition
   * Tính vị trí chim trong đội hình.
   */
  public calculateBirdFormationPosition(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const index = Math.max(0, Math.round(optNumber(options, 'index', 0)));
    const count = Math.max(1, Math.round(optNumber(options, 'count', 1)));
    const spacing = optNumber(options, 'spacing', Math.max(profile.length * 2, 0.5));
    const base = entityPosition(a);
    const lateral = (index - (count - 1) / 2) * spacing;
    const depth = index * spacing * 0.35;
    const position = { x: base.x + lateral, y: base.y, z: base.z + depth };
    return namedResult('calculateBirdFormationPosition', { position, index, count, spacing });
  }
  /**
   * [1286] calculateBirdFormationSpacing
   * Tính khoảng cách giữa các chim.
   */
  public calculateBirdFormationSpacing(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const count = Math.max(1, Math.round(optNumber(options, 'count', 1)));
    const spacing = optNumber(options, 'spacing', Math.max(profile.length * 2, 0.5));
    return namedResult('calculateBirdFormationSpacing', {
      spacing,
      count,
      rowWidth: spacing * (count - 1),
    });
  }
  /**
   * [1287] calculateBirdTargetIntercept
   * Tính điểm chặn mục tiêu trên không.
   */
  public calculateBirdTargetIntercept(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const origin = entityPosition(a);
    const targetPosition = entityPosition(b);
    const targetVelocity = entityVelocity(b, optNumber(options, 'dt', 0.016));
    const separation = distance3D(origin, targetPosition);
    const closing = profile.speed + magnitude(targetVelocity);
    const time = closing > 1e-6 ? separation / closing : 0;
    const position = {
      x: targetPosition.x + targetVelocity.x * time,
      y: targetPosition.y + targetVelocity.y * time,
      z: targetPosition.z + targetVelocity.z * time,
    };
    return namedResult('calculateBirdTargetIntercept', {
      position,
      timeToIntercept: time,
      separation,
    });
  }
  /**
   * [1288] calculateBirdBeakDirection
   * Tính hướng mỏ chim.
   */
  public calculateBirdBeakDirection(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let direction: Vec3D = entityForward(a);
    if (from && to) {
      direction = directionTo(from, to);
      if (direction.x === 0 && direction.y === 0 && direction.z === 0) direction = entityForward(a);
    }
    return directionResult('calculateBirdBeakDirection', direction);
  }
  /**
   * [1289] calculateBirdTalonsPosition
   * Tính tọa độ móng vuốt chim.
   */
  public calculateBirdTalonsPosition(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'bird');
    const side = optNumber(options, 'side', -1);
    const position = anatomicalPosition(a, {
      x: side * profile.width * 0.2,
      y: profile.height * 0.01,
      z: profile.length * 0.04,
    });
    return namedResult('calculateBirdTalonsPosition', { position, side });
  }
  /**
   * [1290] calculateBirdCollision
   * Kiểm tra va chạm chim.
   */
  public calculateBirdCollision(a?: any, b?: any): any {
    const profileA = resolveSpecies(a, 'bird');
    const boxA = boundingBox(entityPosition(a), {
      x: profileA.wingspan > 0 ? profileA.wingspan : profileA.width,
      y: profileA.height,
      z: profileA.length,
    });
    const profileB = resolveSpecies(b, 'bird');
    const boxB = boundingBox(entityPosition(b), {
      x: profileB.wingspan > 0 ? profileB.wingspan : profileB.width,
      y: profileB.height,
      z: profileB.length,
    });
    return aabbResult('calculateBirdCollision', boxA, boxB);
  }
  // ==========================================================================
  // 28. Tọa độ cây và thực vật
  // ==========================================================================

  /**
   * [1291] getPlantPosition
   * Lấy tọa độ cây hoặc thực vật.
   */
  public getPlantPosition(entity?: any, offset?: Vec3D): any {
    return anatomicalPosition(entity, ZERO3, offset);
  }
  /**
   * [1292] getPlantRootPosition
   * Lấy tọa độ gốc cây.
   */
  public getPlantRootPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    // Gốc cây nằm dưới mặt đất, sâu bằng một phần độ sâu hệ rễ.
    return anatomicalPosition(entity, { x: 0, y: -profile.rootDepth * 0.3, z: 0 }, offset);
  }
  /**
   * [1293] getPlantStemPosition
   * Lấy tọa độ thân thực vật.
   */
  public getPlantStemPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.4, z: 0 }, offset);
  }
  /**
   * [1294] getPlantStemBase
   * Lấy tọa độ gốc thân cây.
   */
  public getPlantStemBase(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.05, z: 0 }, offset);
  }
  /**
   * [1295] getPlantStemTip
   * Lấy tọa độ ngọn thân cây.
   */
  public getPlantStemTip(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.95, z: 0 }, offset);
  }
  /**
   * [1296] getTreeTrunkPosition
   * Lấy tọa độ thân cây gỗ.
   */
  public getTreeTrunkPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.trunkHeight * 0.5, z: 0 }, offset);
  }
  /**
   * [1297] getTreeTrunkCenter
   * Lấy tâm thân cây.
   */
  public getTreeTrunkCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.trunkHeight * 0.5, z: 0 }, offset);
  }
  /**
   * [1298] getTreeTrunkBase
   * Lấy tọa độ gốc thân cây.
   */
  public getTreeTrunkBase(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.02, z: 0 }, offset);
  }
  /**
   * [1299] getTreeTrunkTop
   * Lấy tọa độ đỉnh thân cây.
   */
  public getTreeTrunkTop(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.trunkHeight, z: 0 }, offset);
  }
  /**
   * [1300] getTreeCanopyCenter
   * Lấy tâm tán cây.
   */
  public getTreeCanopyCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.78, z: 0 }, offset);
  }
  /**
   * [1301] getTreeCanopyTop
   * Lấy tọa độ đỉnh tán cây.
   */
  public getTreeCanopyTop(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height, z: 0 }, offset);
  }
  /**
   * [1302] getTreeCanopyBottom
   * Lấy tọa độ đáy tán cây.
   */
  public getTreeCanopyBottom(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height - profile.canopyRadius, z: 0 },
      offset,
    );
  }
  /**
   * [1303] getTreeCanopyLeft
   * Lấy tọa độ mép trái tán cây.
   */
  public getTreeCanopyLeft(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'plant');
    const position = anatomicalPosition(a, {
      x: -profile.canopyRadius,
      y: profile.height * 0.78,
      z: 0,
    });
    return namedResult('getTreeCanopyLeft', { position, radius: profile.canopyRadius });
  }
  /**
   * [1304] getTreeCanopyRight
   * Lấy tọa độ mép phải tán cây.
   */
  public getTreeCanopyRight(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'plant');
    const position = anatomicalPosition(a, {
      x: profile.canopyRadius,
      y: profile.height * 0.78,
      z: 0,
    });
    return namedResult('getTreeCanopyRight', { position, radius: profile.canopyRadius });
  }
  /**
   * [1305] getBranchPosition
   * Lấy tọa độ cành cây.
   */
  public getBranchPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      {
        x: profile.branchLength * 0.3,
        y: profile.height * 0.45,
        z: 0,
      },
      offset,
    );
  }
  /**
   * [1306] getBranchStartPosition
   * Lấy điểm đầu cành cây.
   */
  public getBranchStartPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.4, z: 0 }, offset);
  }
  /**
   * [1307] getBranchEndPosition
   * Lấy điểm cuối cành cây.
   */
  public getBranchEndPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      {
        x: profile.branchLength * 0.8,
        y: profile.height * 0.55,
        z: 0,
      },
      offset,
    );
  }
  /**
   * [1308] getBranchJunctionPosition
   * Lấy tọa độ điểm phân nhánh.
   */
  public getBranchJunctionPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.35, z: 0 }, offset);
  }
  /**
   * [1309] getLeafPosition
   * Lấy tọa độ lá.
   */
  public getLeafPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.85, z: 0 }, offset);
  }
  /**
   * [1310] getLeafTipPosition
   * Lấy tọa độ chóp lá.
   */
  public getLeafTipPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.85, z: profile.leafLength },
      offset,
    );
  }
  /**
   * [1311] getLeafBasePosition
   * Lấy tọa độ gốc lá.
   */
  public getLeafBasePosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.82, z: 0 }, offset);
  }
  /**
   * [1312] getLeafCenter
   * Lấy tâm lá.
   */
  public getLeafCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.835, z: profile.leafLength * 0.5 },
      offset,
    );
  }
  /**
   * [1313] getFlowerPosition
   * Lấy tọa độ hoa.
   */
  public getFlowerPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.9, z: 0 }, offset);
  }
  /**
   * [1314] getFlowerCenter
   * Lấy tâm hoa.
   */
  public getFlowerCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.95, z: 0 }, offset);
  }
  /**
   * [1315] getFruitPosition
   * Lấy tọa độ quả.
   */
  public getFruitPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.6, z: profile.fruitRadius * 2 },
      offset,
    );
  }
  /**
   * [1316] getFruitCenter
   * Lấy tâm quả.
   */
  public getFruitCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(
      entity,
      { x: 0, y: profile.height * 0.62, z: profile.fruitRadius * 2 },
      offset,
    );
  }
  /**
   * [1317] getSeedPosition
   * Lấy tọa độ hạt.
   */
  public getSeedPosition(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.2, z: 0 }, offset);
  }
  /**
   * [1318] calculatePlantHeight
   * Tính chiều cao thực vật.
   */
  public calculatePlantHeight(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculatePlantHeight', profile.height, 'm');
  }
  /**
   * [1319] calculateTreeHeight
   * Tính chiều cao cây.
   *
   * LƯU Ý (hợp đồng public): hàm này phải trả về **số** (met) — bộ test
   * `tests/spatial-ui-system.test.ts` khẳng định `toBeGreaterThan(0)`. Vì vậy nó
   * trả số thuần thay vì bản ghi `measurement(...)`.
   */
  public calculateTreeHeight(entity?: any, options?: any): any {
    return resolveSpecies(entity, 'plant').height;
  }
  /**
   * [1320] calculateTreeTrunkDiameter
   * Tính đường kính thân cây.
   */
  public calculateTreeTrunkDiameter(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const diameter = profile.width;
    return measurement('calculateTreeTrunkDiameter', diameter, 'm');
  }
  /**
   * [1321] calculateTreeTrunkRadius
   * Tính bán kính thân cây.
   */
  public calculateTreeTrunkRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const radius = profile.width * 0.5;
    return measurement('calculateTreeTrunkRadius', radius, 'm');
  }
  /**
   * [1322] calculateTreeCanopyRadius
   * Tính bán kính tán cây.
   */
  public calculateTreeCanopyRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateTreeCanopyRadius', profile.canopyRadius, 'm');
  }
  /**
   * [1323] calculateTreeCanopyVolume
   * Tính thể tích tán cây.
   */
  public calculateTreeCanopyVolume(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const volume = (4 / 3) * Math.PI * profile.canopyRadius ** 3;
    return measurement('calculateTreeCanopyVolume', volume, 'm³', {
      canopyRadius: profile.canopyRadius,
    });
  }
  /**
   * [1324] calculateTreeCanopyBounds
   * Tính giới hạn tán cây.
   */
  public calculateTreeCanopyBounds(entity?: any, size?: Vec3D): any {
    const profile = resolveSpecies(entity, 'plant');
    const center = anatomicalPosition(entity, { x: 0, y: profile.height * 0.78, z: 0 });
    const box = boundingBox(center, {
      x: size?.x ?? profile.canopyRadius * 2,
      y: size?.y ?? profile.canopyRadius * 2,
      z: size?.z ?? profile.canopyRadius * 2,
    });
    return boundsResult('calculateTreeCanopyBounds', box);
  }
  /**
   * [1325] calculateTreeBranchLength
   * Tính chiều dài cành cây.
   */
  public calculateTreeBranchLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateTreeBranchLength', profile.branchLength, 'm');
  }
  /**
   * [1326] calculateBranchAngle
   * Tính góc cành cây.
   */
  public calculateBranchAngle(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const up = { x: 0, y: 1, z: 0 };
    let angle: number;
    if (from && to) {
      const branch = directionTo(from, to);
      angle = Math.acos(clamp(dot(branch, up), -1, 1));
    } else {
      // Cành cây thường nghiêng khoảng 45° so với thân.
      angle = Math.PI / 4;
    }
    return measurement('calculateBranchAngle', angle, 'rad');
  }
  /**
   * [1327] calculateBranchCurvature
   * Tính độ cong cành cây.
   */
  public calculateBranchCurvature(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const curvature = clamp(profile.branchLength * 0.05, 0.01, 0.3);
    return measurement('calculateBranchCurvature', curvature, 'rad', {
      branchLength: profile.branchLength,
    });
  }
  /**
   * [1328] calculateBranchTaper
   * Tính độ thuôn của cành cây.
   */
  public calculateBranchTaper(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'plant');
    const baseRadius = profile.width * 0.25;
    const tipRadius = baseRadius * 0.35;
    const taper = baseRadius > 1e-6 ? 1 - tipRadius / baseRadius : 0;
    return namedResult('calculateBranchTaper', {
      taper,
      baseRadius,
      tipRadius,
      length: profile.branchLength,
    });
  }
  /**
   * [1329] calculateLeafLength
   * Tính chiều dài lá.
   */
  public calculateLeafLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateLeafLength', profile.leafLength, 'm');
  }
  /**
   * [1330] calculateLeafWidth
   * Tính chiều rộng lá.
   */
  public calculateLeafWidth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateLeafWidth', profile.leafWidth, 'm');
  }
  /**
   * [1331] calculateLeafNormal
   * Tính pháp tuyến bề mặt lá.
   */
  public calculateLeafNormal(a?: any, b?: any): any {
    const quaternion = entityQuaternion(a);
    const normal = rotateVector(quaternion, { x: 0, y: 1, z: 0 });
    return directionResult('calculateLeafNormal', normal);
  }
  /**
   * [1332] calculateLeafOrientation
   * Tính hướng lá.
   */
  public calculateLeafOrientation(entityOrAngle?: any, options?: any): any {
    return orientationResult('calculateLeafOrientation', entityQuaternion(entityOrAngle), {
      source: 'entity.quaternion',
    });
  }
  /**
   * [1333] calculateLeafCurvature
   * Tính độ cong lá.
   */
  public calculateLeafCurvature(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const curvature = clamp(profile.leafLength * 0.6, 0.02, 0.8);
    return measurement('calculateLeafCurvature', curvature, 'rad', {
      leafLength: profile.leafLength,
    });
  }
  /**
   * [1334] calculateLeafArea
   * Tính diện tích lá.
   */
  public calculateLeafArea(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const area = profile.leafLength * profile.leafWidth * 0.68;
    return measurement('calculateLeafArea', area, 'm²', {
      leafLength: profile.leafLength,
      leafWidth: profile.leafWidth,
    });
  }
  /**
   * [1335] calculateFlowerRadius
   * Tính bán kính hoa.
   *
   * Thứ tự ưu tiên: cỡ hoa do chính entity khai báo (`flowerRadius`,
   * `flowerSize`) → cỡ hoa theo loài → nửa đường kính ngang của chính entity
   * (khi entity không có dữ liệu hoa riêng). Không có dữ liệu nào thì 0.
   */
  public calculateFlowerRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const declared = optNumber(options, 'flowerRadius', num(entity?.flowerSize, Number.NaN));
    let radius = 0;
    let source = 'none';
    if (Number.isFinite(declared) && declared > 0) {
      radius = declared;
      source = 'entity';
    } else if (profile.flowerRadius > 0) {
      radius = profile.flowerRadius;
      source = 'species';
    } else {
      radius = headRadius(entity);
      source = radius > 0 ? 'geometry' : 'none';
    }
    return measurement('calculateFlowerRadius', radius, 'm', { source });
  }
  /**
   * [1336] calculateFruitRadius
   * Tính bán kính quả.
   *
   * Thứ tự ưu tiên: cỡ quả do chính entity khai báo (`fruitRadius`,
   * `fruitSize`) → cỡ quả theo loài → nửa đường kính ngang của chính entity
   * (khi entity không có dữ liệu quả riêng). Không có dữ liệu nào thì 0.
   */
  public calculateFruitRadius(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    const declared = optNumber(options, 'fruitRadius', num(entity?.fruitSize, Number.NaN));
    let radius = 0;
    let source = 'none';
    if (Number.isFinite(declared) && declared > 0) {
      radius = declared;
      source = 'entity';
    } else if (profile.fruitRadius > 0) {
      radius = profile.fruitRadius;
      source = 'species';
    } else {
      radius = headRadius(entity);
      source = radius > 0 ? 'geometry' : 'none';
    }
    return measurement('calculateFruitRadius', radius, 'm', { source });
  }
  /**
   * [1337] calculateRootDepth
   * Tính độ sâu rễ.
   */
  public calculateRootDepth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateRootDepth', profile.rootDepth, 'm');
  }
  /**
   * [1338] calculateRootSpread
   * Tính độ lan rộng rễ.
   */
  public calculateRootSpread(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'plant');
    return measurement('calculateRootSpread', profile.rootSpread, 'm');
  }
  /**
   * [1339] calculatePlantWindDeflection
   * Tính độ lệch cây do gió.
   */
  public calculatePlantWindDeflection(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'plant');
    const windSpeed = optNumber(options, 'windSpeed', 5);
    // Độ lệch tăng theo chiều cao và độ mềm của thân (cây cao mềm lắc nhiều hơn).
    const stiffness = profile.density * profile.width * 100;
    const deflection = clamp((windSpeed * windSpeed * profile.height) / stiffness, 0, profile.height * 0.5);
    const angle = Math.atan2(deflection, Math.max(profile.height, 1e-6));
    const direction = facingDirection(a, b);
    return namedResult('calculatePlantWindDeflection', {
      deflection: { x: direction.x * deflection, y: 0, z: direction.z * deflection },
      angle,
      windSpeed,
      height: profile.height,
    });
  }
  /**
   * [1340] calculateTreeWindSway
   * Tính độ lắc cây do gió.
   */
  public calculateTreeWindSway(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'plant');
    const windSpeed = optNumber(options, 'windSpeed', 5);
    const frequency = optNumber(options, 'frequency', 0.2);
    const time = simulationTime(a, options);
    const amplitude = clamp((windSpeed * profile.height) / 400, 0, profile.height * 0.1);
    const sway = Math.sin(time * frequency * Math.PI * 2) * amplitude;
    const direction = facingDirection(a, b);
    return namedResult('calculateTreeWindSway', {
      sway: { x: direction.x * sway, y: 0, z: direction.z * sway },
      amplitude,
      frequency,
      windSpeed,
    });
  }
  // ==========================================================================
  // 29. Tọa độ đồ vật và hình học vật thể
  // ==========================================================================

  /**
   * [1341] getObjectPosition
   * Lấy tọa độ vật thể.
   */
  public getObjectPosition(entity?: any, offset?: Vec3D): any {
    return anatomicalPosition(entity, ZERO3, offset);
  }
  /**
   * [1342] getObjectCenter
   * Lấy tâm vật thể.
   */
  public getObjectCenter(entity?: any, offset?: Vec3D): any {
    const profile = resolveSpecies(entity, 'object');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5, z: 0 }, offset);
  }
  /**
   * [1343] getObjectRotation
   * Lấy góc quay vật thể.
   */
  public getObjectRotation(entityOrAngle?: any, options?: any): any {
    return orientationResult('getObjectRotation', entityQuaternion(entityOrAngle), {
      source: 'entity.quaternion',
    });
  }
  /**
   * [1344] getObjectScale
   * Lấy tỷ lệ kích thước vật thể.
   */
  public getObjectScale(entity?: any, options?: any): any {
    const scale = scaleOf(entity);
    const uniform = Math.max(scale.x, scale.y, scale.z);
    return measurement('getObjectScale', uniform, 'ratio', {
      x: scale.x,
      y: scale.y,
      z: scale.z,
    });
  }
  /**
   * [1345] getObjectForwardVector
   * Lấy hướng phía trước vật thể.
   *
   * LƯU Ý (hợp đồng public): nhóm `get…Vector` trả về **vector thô** `{x,y,z}`
   * — đúng như `get…Position` — để dùng trực tiếp cho phép tính ma trận.
   * Bản ghi chuẩn hoá `directionResult` được dùng cho nhóm `calculate…Direction`.
   */
  public getObjectForwardVector(a?: any, b?: any): any {
    return facingDirection(a, b);
  }
  /**
   * [1346] getObjectRightVector
   * Lấy hướng bên phải vật thể.
   *
   * Quy ước: right = cross(up, forward) → với forward +Z, right là +X.
   */
  public getObjectRightVector(a?: any, b?: any): any {
    const forward = facingDirection(a, b);
    const right = normalize(cross(UP3, forward));
    return right.x !== 0 || right.y !== 0 || right.z !== 0 ? right : RIGHT3;
  }
  /**
   * [1347] getObjectUpVector
   * Lấy hướng phía trên vật thể.
   *
   * Quy ước: up = cross(forward, right) → với forward +Z, right +X thì up là +Y.
   */
  public getObjectUpVector(a?: any, b?: any): any {
    const forward = facingDirection(a, b);
    const right = normalize(cross(UP3, forward));
    const basis = right.x !== 0 || right.y !== 0 || right.z !== 0 ? right : RIGHT3;
    const up = normalize(cross(forward, basis));
    return up.x !== 0 || up.y !== 0 || up.z !== 0 ? up : UP3;
  }
  /**
   * [1348] getObjectBoundingBox
   * Lấy hộp bao vật thể.
   */
  public getObjectBoundingBox(entity?: any, size?: Vec3D): any {
    const profile = resolveSpecies(entity, 'object');
    const box = boundingBox(entityPosition(entity), {
      x: size?.x ?? profile.width,
      y: size?.y ?? profile.height,
      z: size?.z ?? profile.length,
    });
    return boundsResult('getObjectBoundingBox', box);
  }
  /**
   * [1349] getObjectBoundingSphere
   * Lấy hình cầu bao vật thể.
   */
  public getObjectBoundingSphere(entity?: any, radius = 1.0): any {
    const profile = resolveSpecies(entity, 'object');
    // `radius = 1.0` là giá trị mặc định (coi như "chưa truyền") → dùng bán kính theo loài.
    const effective = radius === 1.0 ? profile.radius : radius;
    return sphereResult(
      'getObjectBoundingSphere',
      boundingSphere(entityPosition(entity), effective),
      { speciesRadius: profile.radius },
    );
  }
  /**
   * [1350] getObjectBoundingCapsule
   * Lấy capsule bao vật thể.
   */
  public getObjectBoundingCapsule(entity?: any, height = 2.0, radius = 0.5): any {
    const profile = resolveSpecies(entity, 'object');
    // `height = 2.0` / `radius = 0.5` là giá trị mặc định → dùng số đo theo loài.
    const effectiveHeight = height === 2.0 ? profile.height : height;
    const effectiveRadius = radius === 0.5 ? profile.radius * 0.6 : radius;
    const base = entityPosition(entity);
    const capsule: Capsule3D = {
      start: { x: base.x, y: base.y, z: base.z },
      end: { x: base.x, y: base.y + effectiveHeight, z: base.z },
      radius: effectiveRadius,
    };
    return capsuleResult('getObjectBoundingCapsule', capsule, { height: effectiveHeight });
  }
  /**
   * [1351] calculateObjectLength
   * Tính chiều dài vật thể.
   */
  public calculateObjectLength(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    return measurement('calculateObjectLength', profile.length, 'm');
  }
  /**
   * [1352] calculateObjectWidth
   * Tính chiều rộng vật thể.
   */
  public calculateObjectWidth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    return measurement('calculateObjectWidth', profile.width, 'm');
  }
  /**
   * [1353] calculateObjectHeight
   * Tính chiều cao vật thể.
   */
  public calculateObjectHeight(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    return measurement('calculateObjectHeight', profile.height, 'm');
  }
  /**
   * [1354] calculateObjectDepth
   * Tính chiều sâu vật thể.
   */
  public calculateObjectDepth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    return measurement('calculateObjectDepth', profile.length, 'm');
  }
  /**
   * [1355] calculateObjectVolume
   * Tính thể tích vật thể.
   */
  public calculateObjectVolume(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    const volume = volumeOf(profile);
    return measurement('calculateObjectVolume', volume, 'm³', {
      mass: volume * profile.density,
    });
  }
  /**
   * [1356] calculateObjectSurfaceArea
   * Tính diện tích bề mặt vật thể.
   */
  public calculateObjectSurfaceArea(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    const area = 2 * (
      profile.width * profile.height
      + profile.width * profile.length
      + profile.height * profile.length
    );
    return measurement('calculateObjectSurfaceArea', area, 'm²');
  }
  /**
   * [1357] calculateObjectCenterOfMass
   * Tính tâm khối lượng vật thể.
   */
  public calculateObjectCenterOfMass(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    return anatomicalPosition(entity, { x: 0, y: profile.height * 0.5, z: 0 });
  }
  /**
   * [1358] calculateObjectDensity
   * Tính khối lượng riêng vật thể.
   */
  public calculateObjectDensity(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const volume = volumeOf(profile);
    const mass = optNumber(options, 'mass', volume * profile.density);
    const density = volume > 1e-9 ? mass / volume : profile.density;
    return namedResult('calculateObjectDensity', { density, mass, volume });
  }
  /**
   * [1359] calculateObjectInertiaTensor
   * Tính tensor quán tính vật thể.
   */
  public calculateObjectInertiaTensor(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const mass = optNumber(options, 'mass', profile.mass);
    // Hộp đồng nhất: I = m·(w² + h²)/12 quanh trục X, v.v.
    const ix = (mass * (profile.width ** 2 + profile.height ** 2)) / 12;
    const iy = (mass * (profile.width ** 2 + profile.length ** 2)) / 12;
    const iz = (mass * (profile.height ** 2 + profile.length ** 2)) / 12;
    return namedResult('calculateObjectInertiaTensor', {
      tensor: { x: ix, y: iy, z: iz },
      mass,
    });
  }
  /**
   * [1360] calculateObjectWorldTransform
   * Tính phép biến đổi thế giới vật thể.
   */
  public calculateObjectWorldTransform(target?: any, options?: any): any {
    const entity = target ?? optVec3(options, 'entity');
    const position = entityPosition(entity);
    const quaternion = entityQuaternion(entity);
    const scale = scaleOf(entity);
    return composeMatrix(position, quaternion, scale);
  }
  /**
   * [1361] calculateObjectLocalTransform
   * Tính phép biến đổi cục bộ vật thể.
   */
  public calculateObjectLocalTransform(target?: any, options?: any): any {
    const entity = target ?? optVec3(options, 'entity');
    const scale = scaleOf(entity);
    return scaleMatrix(scale);
  }
  /**
   * [1362] calculateObjectPivotOffset
   * Tính độ lệch điểm xoay vật thể.
   */
  public calculateObjectPivotOffset(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const pivot = optVec3(options, 'pivot');
    const origin = entityPosition(a);
    const offset = pivot
      ? { x: pivot.x - origin.x, y: pivot.y - origin.y, z: pivot.z - origin.z }
      : { x: 0, y: profile.height * 0.5, z: 0 };
    return namedResult('calculateObjectPivotOffset', { offset, pivot: origin });
  }
  /**
   * [1363] calculateObjectOriginOffset
   * Tính độ lệch gốc vật thể.
   */
  public calculateObjectOriginOffset(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const origin = entityPosition(a);
    const offset = { x: 0, y: profile.height * 0.5, z: 0 };
    return namedResult('calculateObjectOriginOffset', { offset, origin });
  }
  /**
   * [1364] calculateObjectDistanceToGround
   * Tính khoảng cách vật thể đến mặt đất.
   */
  public calculateObjectDistanceToGround(a?: any, b?: any): any {
    const profile = resolveSpecies(a, 'object');
    const position = pointOf(a);
    const ground = pointOf(b)?.y ?? 0;
    const distance = position ? Math.max(0, position.y - profile.height * 0.5 - ground) : 0;
    return measurement('calculateObjectDistanceToGround', distance, 'm', {
      resolved: position !== null,
    });
  }
  /**
   * [1365] calculateObjectDistanceToWall
   * Tính khoảng cách vật thể đến tường.
   */
  public calculateObjectDistanceToWall(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved
      ? distance3D(from, to)
      : REFERENCE_SEPARATIONS.objectWall;
    return measurement('calculateObjectDistanceToWall', distance, 'm', { resolved });
  }
  /**
   * [1366] calculateObjectDistanceToCeiling
   * Tính khoảng cách vật thể đến trần.
   */
  public calculateObjectDistanceToCeiling(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved
      ? distance3D(from, to)
      : REFERENCE_SEPARATIONS.objectCeiling;
    return measurement('calculateObjectDistanceToCeiling', distance, 'm', { resolved });
  }
  /**
   * [1367] calculateObjectDistanceToCamera
   * Tính khoảng cách vật thể đến camera.
   */
  public calculateObjectDistanceToCamera(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved
      ? distance3D(from, to)
      : REFERENCE_SEPARATIONS.objectCamera;
    return measurement('calculateObjectDistanceToCamera', distance, 'm', { resolved });
  }
  /**
   * [1368] calculateObjectDistanceToPlayer
   * Tính khoảng cách vật thể đến người chơi.
   */
  public calculateObjectDistanceToPlayer(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved
      ? distance3D(from, to)
      : REFERENCE_SEPARATIONS.objectPlayer;
    return measurement('calculateObjectDistanceToPlayer', distance, 'm', { resolved });
  }
  /**
   * [1369] calculateObjectDistanceToTarget
   * Tính khoảng cách vật thể đến mục tiêu.
   */
  public calculateObjectDistanceToTarget(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    const resolved = from && to;
    const distance = resolved
      ? distance3D(from, to)
      : REFERENCE_SEPARATIONS.objectTarget;
    return measurement('calculateObjectDistanceToTarget', distance, 'm', { resolved });
  }
  /**
   * [1370] calculateObjectClosestPoint
   * Tính điểm gần nhất trên vật thể.
   */
  public calculateObjectClosestPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const box = bodyBox(a, profile);
    const probe = pointOf(b) ?? entityPosition(a);
    const point = closestPointOnBox(probe, box);
    const distance = distance3D(probe, point);
    return namedResult('calculateObjectClosestPoint', { point, distance });
  }
  /**
   * [1371] calculateObjectFarthestPoint
   * Tính điểm xa nhất trên vật thể.
   */
  public calculateObjectFarthestPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const box = bodyBox(a, profile);
    const probe = pointOf(b) ?? entityPosition(a);
    const point = farthestPointOnBox(probe, box);
    const distance = distance3D(probe, point);
    return namedResult('calculateObjectFarthestPoint', { point, distance });
  }
  /**
   * [1372] calculateObjectSurfaceNormal
   * Tính pháp tuyến bề mặt vật thể.
   */
  public calculateObjectSurfaceNormal(a?: any, b?: any): any {
    const profile = resolveSpecies(a, 'object');
    const box = bodyBox(a, profile);
    const probe = pointOf(b) ?? entityPosition(a);
    const point = closestPointOnBox(probe, box);
    const normal = directionTo(point, probe);
    const resolved = normal.x !== 0 || normal.y !== 0 || normal.z !== 0 ? normal : UP3;
    return directionResult('calculateObjectSurfaceNormal', resolved, { surfacePoint: point });
  }
  /**
   * [1373] calculateObjectTangent
   * Tính tiếp tuyến bề mặt vật thể.
   */
  public calculateObjectTangent(a?: any, b?: any): any {
    const profile = resolveSpecies(a, 'object');
    const box = bodyBox(a, profile);
    const probe = pointOf(b) ?? entityPosition(a);
    const point = closestPointOnBox(probe, box);
    const normal = directionTo(point, probe);
    const tangent = normalize(cross(normal, UP3));
    const resolved = tangent.x !== 0 || tangent.y !== 0 || tangent.z !== 0 ? tangent : RIGHT3;
    return directionResult('calculateObjectTangent', resolved, { surfacePoint: point });
  }
  /**
   * [1374] calculateObjectCurvature
   * Tính độ cong bề mặt vật thể.
   */
  public calculateObjectCurvature(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    // Hộp cầu tương đương: bán kính cong ≈ bán kính đường tròn ngoại tiếp.
    const curvature = profile.radius > 1e-6 ? 1 / profile.radius : 0;
    return measurement('calculateObjectCurvature', curvature, '1/m', {
      radius: profile.radius,
    });
  }
  /**
   * [1375] calculateObjectIntersection
   * Tính giao điểm vật thể.
   */
  public calculateObjectIntersection(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'object'));
    const boxB = bodyBox(b, resolveSpecies(b, 'object'));
    return aabbResult('calculateObjectIntersection', boxA, boxB);
  }
  /**
   * [1376] calculateObjectOverlap
   * Tính mức độ chồng lấn vật thể.
   */
  public calculateObjectOverlap(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'object'));
    const boxB = bodyBox(b, resolveSpecies(b, 'object'));
    const result = aabbResult('calculateObjectOverlap', boxA, boxB);
    return {
      ...result,
      overlapVolume: Math.max(0, penetrationDepth(boxA, boxB)),
    };
  }
  /**
   * [1377] calculateObjectCollision
   * Kiểm tra va chạm vật thể.
   */
  public calculateObjectCollision(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'object'));
    const boxB = bodyBox(b, resolveSpecies(b, 'object'));
    return aabbResult('calculateObjectCollision', boxA, boxB);
  }
  /**
   * [1378] calculateObjectPenetrationDepth
   * Tính độ xuyên lấn vật thể.
   */
  public calculateObjectPenetrationDepth(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    const other = optVec3(options, 'other') ?? optVec3(options, 'target');
    if (!other) {
      // Không có đối tượng đối chiếu → độ xuyên lấn KHÔNG xác định.
      // Trả 0 sẽ bị hiểu nhầm là "không xuyên lấn" nên dùng NaN (valid=false).
      return measurement('calculateObjectPenetrationDepth', Number.NaN, 'm', {
        resolved: false,
        reason: 'thiếu đối tượng đối chiếu',
      });
    }
    const boxA = bodyBox(entity, profile);
    const boxB = bodyBox(other, resolveSpecies(other, 'object'));
    return measurement(
      'calculateObjectPenetrationDepth',
      penetrationDepth(boxA, boxB),
      'm',
      { resolved: true },
    );
  }
  /**
   * [1379] calculateObjectSeparationVector
   * Tính vector tách vật thể.
   */
  public calculateObjectSeparationVector(a?: any, b?: any): any {
    const from = pointOf(a);
    const to = pointOf(b);
    let separation: Vec3D = { x: 0, y: 0, z: 1 };
    if (from && to) {
      separation = directionTo(to, from);
      if (separation.x === 0 && separation.y === 0 && separation.z === 0) separation = { x: 0, y: 0, z: 1 };
    }
    return directionResult('calculateObjectSeparationVector', separation);
  }
  /**
   * [1380] calculateObjectContactPoint
   * Tính điểm tiếp xúc vật thể.
   */
  public calculateObjectContactPoint(a?: any, b?: any, options?: any): any {
    const profile = resolveSpecies(a, 'object');
    const boxA = bodyBox(a, profile);
    const boxB = bodyBox(b, resolveSpecies(b, 'object'));
    const contact = {
      x: (Math.max(boxA.min.x, boxB.min.x) + Math.min(boxA.max.x, boxB.max.x)) / 2,
      y: (Math.max(boxA.min.y, boxB.min.y) + Math.min(boxA.max.y, boxB.max.y)) / 2,
      z: (Math.max(boxA.min.z, boxB.min.z) + Math.min(boxA.max.z, boxB.max.z)) / 2,
    };
    const normal = calculateObjectNormalBetween(boxA, boxB);
    return namedResult('calculateObjectContactPoint', {
      point: contact,
      normal,
      distance: distanceBetweenBoxes(boxA, boxB),
    });
  }
  /**
   * [1381] calculateObjectContactNormal
   * Tính pháp tuyến điểm tiếp xúc.
   */
  public calculateObjectContactNormal(a?: any, b?: any): any {
    const boxA = bodyBox(a, resolveSpecies(a, 'object'));
    const boxB = bodyBox(b, resolveSpecies(b, 'object'));
    return directionResult('calculateObjectContactNormal', calculateObjectNormalBetween(boxA, boxB));
  }
  /**
   * [1382] calculateObjectContactArea
   * Tính diện tích tiếp xúc vật thể.
   */
  public calculateObjectContactArea(entity?: any, options?: any): any {
    const profile = resolveSpecies(entity, 'object');
    const other = optVec3(options, 'other') ?? optVec3(options, 'target');
    if (!other) {
      // Diện tích tiếp xúc KHÔNG xác định khi thiếu đối tượng đối chiếu —
      // trả 0 sẽ bị hiểu nhầm là "không chạm" nên dùng NaN (valid=false).
      return measurement('calculateObjectContactArea', Number.NaN, 'm²', {
        resolved: false,
        reason: 'thiếu đối tượng đối chiếu',
      });
    }
    const boxA = bodyBox(entity, profile);
    const boxB = bodyBox(other, resolveSpecies(other, 'object'));
    const dx = Math.min(boxA.max.x, boxB.max.x) - Math.max(boxA.min.x, boxB.min.x);
    const dy = Math.min(boxA.max.y, boxB.max.y) - Math.max(boxA.min.y, boxB.min.y);
    const dz = Math.min(boxA.max.z, boxB.max.z) - Math.max(boxA.min.z, boxB.min.z);
    const area = dx > 0 && dy > 0 && dz > 0 ? dx * dy : 0;
    return measurement('calculateObjectContactArea', area, 'm²', { resolved: true });
  }
  /**
   * [1383] calculateObjectFrictionForce
   * Tính lực ma sát vật thể.
   */
  public calculateObjectFrictionForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    const velocity = entityVelocity(entity, dt);
    const speed = magnitude(velocity);
    const normalForce = profile.mass * GRAVITY;
    const friction = FRICTION_COEFFICIENT * normalForce;
    const dir = directionTo({ x: 0, y: 0, z: 0 }, velocity);
    return directionResult('calculateObjectFrictionForce', {
      x: -dir.x * friction,
      y: -dir.y * friction,
      z: -dir.z * friction,
    }, { friction, normalForce, speed });
  }
  /**
   * [1384] calculateObjectNormalForce
   * Tính lực pháp tuyến vật thể.
   */
  public calculateObjectNormalForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    const normal = profile.mass * GRAVITY;
    return directionResult('calculateObjectNormalForce', { x: 0, y: normal, z: 0 }, {
      normal,
      mass: profile.mass,
    });
  }
  /**
   * [1385] calculateObjectGravityForce
   * Tính lực hấp dẫn tác dụng lên vật thể.
   */
  public calculateObjectGravityForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    const gravity = profile.mass * GRAVITY;
    return directionResult('calculateObjectGravityForce', { x: 0, y: -gravity, z: 0 }, {
      gravity,
      mass: profile.mass,
    });
  }
  /**
   * [1386] calculateObjectBuoyancyForce
   * Tính lực đẩy nổi vật thể.
   */
  public calculateObjectBuoyancyForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    const displaced = WATER_DENSITY * volumeOf(profile) * GRAVITY;
    return directionResult('calculateObjectBuoyancyForce', { x: 0, y: displaced, z: 0 }, {
      buoyancy: displaced,
      weight: profile.mass * GRAVITY,
      floats: displaced > profile.mass * GRAVITY,
    });
  }
  /**
   * [1387] calculateObjectDragForce
   * Tính lực cản vật thể.
   */
  public calculateObjectDragForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    const velocity = entityVelocity(entity, dt);
    const speed = magnitude(velocity);
    const area = profile.width * profile.height;
    const drag = 0.5 * AIR_DENSITY * area * speed * speed;
    const dir = directionTo({ x: 0, y: 0, z: 0 }, velocity);
    return directionResult('calculateObjectDragForce', {
      x: -dir.x * drag,
      y: -dir.y * drag,
      z: -dir.z * drag,
    }, { drag, speed, area });
  }
  /**
   * [1388] calculateObjectLiftForce
   * Tính lực nâng vật thể.
   */
  public calculateObjectLiftForce(entity?: any, dt = 0.016): any {
    const profile = resolveSpecies(entity, 'object');
    // Chỉ vật thể có cánh mới sinh lực nâng; vật thể thường không có.
    const lift = profile.wingspan > 0 ? liftOf(profile) : 0;
    return directionResult('calculateObjectLiftForce', { x: 0, y: lift, z: 0 }, {
      lift,
      wingArea: wingAreaOf(profile),
    });
  }
  /**
   * [1389] calculateObjectVelocity
   * Tính vận tốc vật thể.
   */
  public calculateObjectVelocity(entity?: any, dt = 0.016): any {
    const velocity = entityVelocity(entity, dt);
    return directionResult('calculateObjectVelocity', velocity, { source: 'entity.velocity' });
  }
  /**
   * [1390] calculateObjectAcceleration
   * Tính gia tốc vật thể.
   */
  public calculateObjectAcceleration(entity?: any, dt = 0.016): any {
    const acceleration = entityAcceleration(entity, dt);
    return directionResult('calculateObjectAcceleration', acceleration, {
      source: 'entity.acceleration',
    });
  }
}

/**
 * Pháp tuyến giữa hai hộp bao: trục có độ chồng lấn lớn nhất, trỏ từ B sang A.
 */
function calculateObjectNormalBetween(a: Box3D, b: Box3D): Vec3D {
  const overlapX = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const overlapY = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
  const overlapZ = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  const centerA = {
    x: (a.min.x + a.max.x) / 2,
    y: (a.min.y + a.max.y) / 2,
    z: (a.min.z + a.max.z) / 2,
  };
  const centerB = {
    x: (b.min.x + b.max.x) / 2,
    y: (b.min.y + b.max.y) / 2,
    z: (b.min.z + b.max.z) / 2,
  };
  const delta = subtract(centerA, centerB);
  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) {
    const fallback = directionTo(centerB, centerA);
    return fallback.x !== 0 || fallback.y !== 0 || fallback.z !== 0 ? fallback : UP3;
  }
  if (overlapX <= overlapY && overlapX <= overlapZ) {
    return { x: delta.x >= 0 ? 1 : -1, y: 0, z: 0 };
  }
  if (overlapY <= overlapZ) {
    return { x: 0, y: delta.y >= 0 ? 1 : -1, z: 0 };
  }
  return { x: 0, y: 0, z: delta.z >= 0 ? 1 : -1 };
}
