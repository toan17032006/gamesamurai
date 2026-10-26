// engine/scripts/scan-constant-output.mjs
//
// Dò các method trả về kết quả KHÔNG đổi bất kể đầu vào là gì — dấu hiệu của
// "return có sẵn, không phù hợp" (hàm trả giá trị hằng thay vì tính từ dữ liệu).
//
// Cách dò: gọi hàm với nhiều bộ đầu vào rất khác nhau. Nếu kết quả giống hệt
// nhau ở mọi bộ và là hằng số "tầm thường" (0, 1, 0.5, false, null, rỗng…)
// thì hàm đó không hề tính toán.
//
// V1: probe nghèo → báo sai rất nhiều (hàm đọc `entity.velocity` bị coi là
// hằng vì probe không có field đó).
// V2:
//   - Probe giàu dữ liệu: position/quaternion/rotation/matrix/scale/size/
//     velocity/acceleration/angular*/children/bones/joints/jointAngles/
//     fingerAngles/fingers/bounds/target/neighbors…
//   - Nhiều DẠNG tham số: vì cùng một tên hàm có thể nhận
//     (entity, a, b) hoặc (entity, options, b) hoặc (a, b, entity)…
//     Nếu chỉ dùng một dạng, hàm số nhận dạng khác sẽ bị báo nhầm.
//   - Chỉ coi là "HẰNG" khi KHÔNG dạng nào phản ứng với 3 bộ dữ liệu khác nhau.
// V3 (bản này):
//   - Probe đa DẤU / đa CHIỀU: V2 nhân mọi giá trị với 1 hệ số nên các hàm
//     `max(0, ±euler.x)` luôn ra 0, `max(0, velocity.y)` luôn ra 0… V3 dùng 3
//     "hình học" khác hẳn nhau (cao/thấp, lên/xuống, xoay trái/phải).
//   - Quaternion xương dựng từ EULER thật (qua `eulerToQuaternion` của engine)
//     nên góc X và Z khác 0 như tư thế thật.
//
// Dùng: npx tsx scripts/scan-constant-output.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { eulerToQuaternion } from '../src/spatial-ui/spatial-primitives.ts';

const SRC = path.resolve('src/spatial-ui/subsystems');

/**
 * Dựng một "thực thể" giàu dữ liệu.
 *
 * `variant` quyết định HÌNH HỌC (vị trí, vận tốc, góc xoay) — ba probe phải
 * khác nhau về DẤU và CHIỀU, không chỉ khác về độ lớn.
 */
function buildProbe(variant) {
  const s = variant.scale;
  const v = (x, y, z) => ({ x, y, z });
  const bone = (name, quat, pos) => ({
    name,
    quaternion: quat,
    rotation: { x: quat.x, y: quat.y, z: quat.z },
    position: pos,
    localPosition: pos,
  });

  /** Euler gốc của từng xương (radian) — có thành phần X và Z khác 0. */
  const BONE_EULERS = {
    hips: [0.05, -0.1, 0.05],
    spine: [0.45, 0.2, 0.35],
    chest: [0.2, -0.15, 0.25],
    neck: [-0.15, 0.3, 0.1],
    head: [0.3, 0.95, -0.25],
    shoulder_L: [0.35, -0.5, 0.6],
    elbow_L: [1.15, 0.25, -0.45],
    wrist_L: [0.2, 0.85, 0.95],
    hand_L: [0.1, -0.4, 0.2],
    leg_R: [0.55, -0.35, 0.7],
    knee_R: [1.25, 0.15, 0.25],
    ankle_R: [-0.45, 0.25, -0.65],
    toe_R: [0.2, 0.1, -0.3],
    tail: [0.25, -0.55, 0.45],
    wing_L: [0.95, 0.25, -0.75],
  };

  /** Cây xương: [tên, vị trí tương đối, chiều dài, tên con]. */
  const SKELETON_TREE = [
    ['hips', [0, 0.95, 0], 0.14, ['spine', 'leg_R', 'tail']],
    ['spine', [0, 0.14, 0], 0.28, ['chest']],
    ['chest', [0, 0.28, 0], 0.24, ['neck', 'shoulder_L']],
    ['neck', [0, 0.24, 0], 0.09, ['head']],
    ['head', [0, 0.1, 0.01], 0.22, []],
    ['shoulder_L', [0.17, 0.14, 0], 0.15, ['elbow_L']],
    ['elbow_L', [0.25, -0.07, 0.01], 0.27, ['wrist_L']],
    ['wrist_L', [0.25, -0.05, 0.02], 0.18, ['hand_L']],
    ['hand_L', [0.07, 0, 0], 0.1, []],
    ['leg_R', [0.1, -0.06, 0], 0.43, ['knee_R']],
    ['knee_R', [0, -0.43, 0.01], 0.41, ['ankle_R']],
    ['ankle_R', [0, -0.41, 0], 0.09, ['toe_R']],
    ['toe_R', [0.05, -0.02, 0.12], 0.07, []],
    ['tail', [0, -0.06, -0.13], 0.36, []],
    ['wing_L', [0.12, 0.2, 0.08], 0.55, []],
  ];

  const eulerFor = (name) => {
    const base = BONE_EULERS[name] ?? [0.1, 0.1, 0.1];
    return {
      x: base[0] * variant.eulerScale * (variant.flipX ? -1 : 1),
      y: base[1] * variant.eulerScale,
      z: base[2] * variant.eulerScale * (variant.flipZ ? -1 : 1),
    };
  };

  const scaleFactor = 1 + variant.variantIndex * 0.3;

  /** Dựng node xương (có `parent`/`children`/`length`/`scale` như `buildSkeleton` mong đợi). */
  const makeNode = (name, pos, length, childNames) => {
    const euler = eulerFor(name);
    const node = {
      name,
      position: v(pos[0] * s, pos[1] * s, pos[2] * s),
      localPosition: v(pos[0] * s, pos[1] * s, pos[2] * s),
      quaternion: eulerToQuaternion(euler.x, euler.y, euler.z),
      rotation: euler,
      scale: v(s * scaleFactor, s * scaleFactor, s * scaleFactor),
      length: length * s,
      children: [],
    };
    for (const childName of childNames) {
      const spec = SKELETON_TREE.find((t) => t[0] === childName);
      if (!spec) continue;
      const child = makeNode(spec[0], spec[1], spec[2], spec[3]);
      node.children.push(child);
    }
    return node;
  };

  const treeRoots = SKELETON_TREE.filter((t) => !SKELETON_TREE.some((o) => o[3].includes(t[0]))).map((t) =>
    makeNode(t[0], t[1], t[2], t[3]),
  );

  /** Danh sách phẳng của mọi xương — dùng cho các helper tìm theo tên. */
  const flatBones = [];
  const collect = (node) => {
    flatBones.push(node);
    node.children.forEach(collect);
  };
  treeRoots.forEach(collect);

  /** Bản phẳng (không lồng) để các helper tìm theo `children` vẫn thấy xương. */
  const children = flatBones.map((node) => ({
    name: node.name,
    quaternion: node.quaternion,
    rotation: node.rotation,
    position: node.position,
    localPosition: node.localPosition,
    scale: node.scale,
    length: node.length,
    children: [],
  }));

  const matrix = [
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    variant.pos.x, variant.pos.y, variant.pos.z, 1,
  ];

  const entity = {
    name: `probe_entity_${s}`,
    id: `probe_${s}`,
    type: 'probe',
    position: v(variant.pos.x, variant.pos.y, variant.pos.z),
    localPosition: v(0.1 * s, 0.2 * s, 0.3 * s),
    rotation: variant.rotation,
    quaternion: eulerToQuaternion(variant.rotation.x, variant.rotation.y, variant.rotation.z),
    matrix,
    scale: v(1 * s, 1.5 * s, 0.5 * s),
    size: v(0.4 * s, 0.8 * s, 0.3 * s),
    dimensions: v(0.4 * s, 0.8 * s, 0.3 * s),
    bounds: { min: v(-1 * s, -1 * s, -1 * s), max: v(1 * s, 1 * s, 1 * s) },
    length: 1.5 * s,
    height: 1.8 * s,
    width: 0.6 * s,
    depth: 0.3 * s,
    wingspan: 2 * s,
    volume: 3 * s,
    mass: 70 * s,
    velocity: v(variant.vel.x, variant.vel.y, variant.vel.z),
    previousVelocity: v(variant.vel.x * 0.3, variant.vel.y * 0.2, variant.vel.z * 0.4),
    acceleration: v(variant.acc.x, variant.acc.y, variant.acc.z),
    angularVelocity: v(0.1 * s, 0.2 * s, 0.3 * s),
    angularAcceleration: v(0.05 * s, 0.01 * s, 0.02 * s),
    target: v(4 * s, 5 * s, 6 * s),
    neighbors: [
      { position: v(2 * s, 0, 0), id: 'n1' },
      { position: v(-3 * s, 0, 0), id: 'n2' },
    ],
    children,
    bones: treeRoots,
    skeleton: treeRoots,
    root: treeRoots[0],
    joints: {
      shoulder_L: { position: v(0.2 * s, 1.4 * s, 0), quaternion: eulerToQuaternion(0.35, -0.5, 0.6) },
      elbow_L: { position: v(0.42 * s, 1.05 * s, 0.05 * s), quaternion: eulerToQuaternion(1.15, 0.25, -0.45) },
    },
    jointAngles: { shoulder_L: 0.4 * s, elbow_L: 0.9 * s },
    // Shape đúng của `fingerAngles` (mỗi ngón là object góc gập).
    fingerAngles: {
      thumb: { flexion: 0.2 * s, extension: 0.1 * s, abduction: 0.3 * s },
      index: { flexion: 0.4 * s, extension: 0.2 * s, abduction: 0.15 * s },
      middle: { flexion: 0.45 * s, extension: 0.25 * s, abduction: 0.1 * s },
      ring: { flexion: 0.5 * s, extension: 0.2 * s, abduction: 0.12 * s },
      little: { flexion: 0.55 * s, extension: 0.3 * s, abduction: 0.2 * s },
    },
    fingers: {
      thumb: { flexion: 0.2 * s, extension: 0.1 * s, abduction: 0.3 * s },
      index: { flexion: 0.4 * s, extension: 0.2 * s, abduction: 0.15 * s },
    },
    // Mắt / mí mắt.
    blink: 0.35 * s,
    blinkAmount: 0.35 * s,
    eyelid: 0.35 * s,
    eyeClose: 0.35 * s,
    eyeState: 'open',
    pupil: { x: 0.01 * s, y: 0.02 * s },
    // Animation.
    speed: 0.8 * s,
    playbackSpeed: 0.8 * s,
    timeScale: 0.8 * s,
    currentTime: 1.25 * s,
    loop: true,
    loopCount: 2,
    blendWeight: 0.35 * s,
    blendFrom: 'walk',
    blendTo: 'run',
    // Vật thể / hạt / hiệu ứng.
    opacity: 0.65 * s,
    rotationSpeed: 1.4 * s,
    bobFrequency: 0.8 * s,
    bobAmplitude: 0.05 * s,
    pickupOffset: v(0.2 * s, 0.1 * s, 0.3 * s),
    expansion: 0.45 * s,
    spreadAngle: 0.25 * s,
    lifetime: 2.5 * s,
    sizeScale: 1.2 * s,
    particleCount: 40,
    // NPC.
    npcState: 'idle',
    alertLevel: 0.4 * s,
    separationRadius: 2 * s,
    cohesionRadius: 3 * s,
    avoidanceRadius: 1.5 * s,
    alignmentRadius: 0.6 * s,
    bossPhase: 2,
    bossHealth: 0.75 * s,
    // Môi trường.
    waterLevel: 0.8 * s,
    waveHeight: 0.12 * s,
    windSpeed: 3.2 * s,
    windDirection: 0.4 * s,
    // Đường cong / quỹ đạo.
    points: [v(0, 0, 0), v(1 * s, 0.5 * s, 1 * s), v(2 * s, 0.2 * s, 3 * s), v(3 * s, 1.1 * s, 2 * s)],
    controlPoints: [v(0, 0, 0), v(1 * s, 2 * s, 0), v(3 * s, -1 * s, 1 * s), v(4 * s, 1 * s, 4 * s)],
    tangents: [v(1, 0, 0), v(0.5 * s, 1 * s, 0), v(-1 * s, 0.5 * s, 0.25 * s)],
    // Không gian / cụm.
    positions: [v(0, 0, 0), v(1 * s, 0, 1 * s), v(-2 * s, 0, 3 * s), v(4 * s, 0, -1 * s)],
    clusterCount: 3,
    outlierThreshold: 2.5 * s,
    // Va chạm / hình học.
    triangleA: {
      a: v(0, 0, 0), b: v(1 * s, 0, 0), c: v(0, 1 * s, 0),
    },
    triangleB: {
      a: v(0.5 * s, 0.2 * s, 0.3 * s), b: v(1.5 * s, 0.2 * s, 0.3 * s), c: v(0.5 * s, 1.2 * s, 0.3 * s),
    },
    mesh: {
      vertices: [v(0, 0, 0), v(1 * s, 0, 0), v(0, 1 * s, 0), v(0, 0, 1 * s)],
      indices: [0, 1, 2, 0, 2, 3],
    },
    ray: { origin: v(0, 1 * s, 0), direction: v(0, -1, 0) },
    plane: { normal: v(0, 1, 0), constant: 0.5 * s },
    obstacles: [{ position: v(1.5 * s, 0, 0), radius: 0.4 * s }],
    state: 'idle',
    phase: 0.3 * s,
    time: 1.25 * s,
    duration: 2 * s,
    intensity: 0.8 * s,
    count: 3 * s,
    radius: 1.2 * s,
    friction: 0.4 * s,
    restitution: 0.2 * s,
    gravity: v(0, -9.8, 0),
    isGrounded: true,
    waypoints: [v(0, 0, 0), v(1 * s, 0, 1 * s), v(2 * s, 0, 2 * s)],
    path: [v(0, 0, 0), v(1 * s, 0, 1 * s), v(2 * s, 0, 2 * s)],
  };

  const options = {
    from: v(0, 0, 0),
    to: v(1 * s, 2 * s, 3 * s),
    target: v(4 * s, 5 * s, 6 * s),
    matrix,
    object: { matrix, translationMatrix: matrix, position: entity.position },
    camera: {
      position: v(variant.cam.x, variant.cam.y, variant.cam.z),
      quaternion: eulerToQuaternion(variant.camRotation.x, variant.camRotation.y, variant.camRotation.z),
      matrix,
      projectionMatrix: matrix,
    },
    groundY: variant.groundY,
    density: 1.2 * s,
    bones: children,
    children,
    bone: 'shoulder_L',
    boneName: 'shoulder_L',
    angle: 0.5 * s,
    max: 10 * s,
    iterations: 4,
    duration: 1.5 * s,
    axis: v(0, 1, 0),
    hand: 'right',
    steps: 8,
    t: 0.5 * s,
    b: v(2 * s, 3 * s, 4 * s),
    reference: 'world',
    scene: { groundY: variant.groundY },
    environment: { wind: v(variant.wind.x, variant.wind.y, variant.wind.z) },
    wind: v(variant.wind.x, variant.wind.y, variant.wind.z),
  };

  const a = v(0.5 * s, 1.5 * s, 2.5 * s);
  const b = v(3 * s, 4 * s, 12 * s);
  return { entity, options, a, b };
}

/**
 * Ba hình học khác hẳn nhau.
 *
 * Mục tiêu: mọi hàm "ghì" một trong các lọc dấu (`max(0, ±x)`, `max(0, velocity.y)`,
 * so sánh trên/nhỏ hơn 0…) đều phải cho ít nhất một giá trị khác 0 ở đúng
 * một probe — để không bị báo nhầm là hằng.
 */
const VARIANTS = [
  {
    variantIndex: 0,
    scale: 1,
    pos: { x: 1, y: 2, z: 3 },
    vel: { x: 1.5, y: 6, z: 2 },
    acc: { x: 0.2, y: 9.8, z: 0.1 },
    rotation: { x: 0.4, y: -0.3, z: 0.25 },
    cam: { x: 0, y: 2, z: -5 },
    camRotation: { x: 0.1, y: 0.2, z: 0 },
    groundY: 0,
    wind: { x: 1, y: 0, z: 0 },
    eulerScale: 1,
    flipX: false,
    flipZ: false,
  },
  {
    variantIndex: 1,
    scale: 2.5,
    pos: { x: -90, y: -4, z: 7 },
    vel: { x: -3, y: -2.5, z: 1 },
    acc: { x: -0.4, y: -9.8, z: 0.3 },
    rotation: { x: -0.6, y: 0.9, z: -0.45 },
    cam: { x: 12, y: -1, z: 30 },
    camRotation: { x: -0.5, y: 1.2, z: 0.6 },
    groundY: -3,
    wind: { x: -4, y: 1, z: 2 },
    eulerScale: 1.7,
    flipX: true,
    flipZ: false,
  },
  {
    variantIndex: 2,
    scale: 4.75,
    pos: { x: 1000, y: 0, z: -0.5 },
    vel: { x: 0.4, y: 0, z: -6 },
    acc: { x: 0.05, y: 0, z: -0.2 },
    rotation: { x: 0.15, y: 2.4, z: 0.8 },
    cam: { x: -40, y: 12, z: 4 },
    camRotation: { x: 0.9, y: -0.3, z: -0.7 },
    groundY: 0.5,
    wind: { x: 0, y: -3, z: 5 },
    eulerScale: 2.4,
    flipX: false,
    flipZ: true,
  },
];

const PROBES = VARIANTS.map(buildProbe);

export { buildProbe, PROBES, VARIANTS };

/** True khi script này được chạy trực tiếp (không phải bị import). */
export const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

/**
 * Các DẠNG tham số thử.
 *
 * Một tên hàm có thể nhận (entity, a, b) hoặc (entity, options, b)… Nếu chỉ
 * thử một dạng thì hàm nhận dạng khác sẽ bị báo nhầm là "hằng".
 */
const ARG_FORMS = [
  { name: 'entity,a,b', build: (p) => [p.entity, p.a, p.b] },
  { name: 'entity,options,b', build: (p) => [p.entity, p.options, p.b] },
  { name: 'entity,options,a', build: (p) => [p.entity, p.options, p.a] },
  { name: 'a,b,entity', build: (p) => [p.a, p.b, p.entity] },
  { name: 'options,entity,a', build: (p) => [p.options, p.entity, p.a] },
  { name: 'a,entity,options', build: (p) => [p.a, p.entity, p.options] },
];

/** Hằng số "tầm thường" — không mang thông tin. */
const TRIVIAL = new Set([0, 1, -1, 0.5, true, false, null, undefined, '']);

function isTrivial(value) {
  if (TRIVIAL.has(value)) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null) {
    const leaves = collectLeaves(value);
    if (leaves.length === 0) return true;
    return leaves.every((leaf) => TRIVIAL.has(leaf));
  }
  return false;
}

/** Thu thập các giá trị lá (số / boolean) bên trong một cấu trúc. */
function collectLeaves(value, out = []) {
  if (value === null || value === undefined) return out;
  if (typeof value === 'number' || typeof value === 'boolean') {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectLeaves(v, out));
    return out;
  }
  if (typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key === 'timestamp' || key === 'name' || key === 'valid' || key === 'unit') continue;
      collectLeaves(value[key], out);
    }
  }
  return out;
}

/** Chuỗi hoá kết quả để so sánh ổn định. */
function stable(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? `n:${value}` : `n:${String(value)}`;
  if (typeof value === 'boolean' || typeof value === 'string') return `${typeof value}:${value}`;
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    // `timestamp` (Date.now()) và `name` KHÔNG phản ánh dữ liệu đầu vào —
    // bỏ qua chúng, nếu không mọi method trả về object có timestamp sẽ bị coi
    // là "phản ứng" một cách giả (false negative) vì 3 lần gọi rơi vào 3 ms khác nhau.
    const filtered = keys.filter((k) => k !== 'timestamp' && k !== 'name');
    return `{${filtered.map((k) => `${k}:${stable(value[k])}`).join(',')}}`;
  }
  return `u:${String(value)}`;
}

/** Trường mang giá trị chính của kết quả (nếu có). */
const PRIMARY_KEYS = [
  'value', 'result', 'distance', 'angle', 'score', 'position', 'direction',
  'orientation', 'normal', 'vector', 'quaternion', 'offset', 'delta',
  'curvature', 'length', 'area', 'radius', 'magnitude', 'total', 'count',
  'width', 'height', 'depth',
];

function primaryValue(result) {
  if (!result || typeof result !== 'object') return result;
  for (const key of PRIMARY_KEYS) {
    if (key in result) return result[key];
  }
  // Không có trường chính → chính kết quả là giá trị (vd hàm trả vector thô).
  return result;
}

/**
 * Quét toàn bộ subsystem spatial-ui.
 *
 * Chỉ chạy khi script được gọi trực tiếp — phần còn lại của file được export
 * để `scan-constant-output-engine.mjs` dùng lại bộ probe.
 */
export async function scanSpatialUi() {
const subsystemFiles = fs.readdirSync(SRC).filter((f) => f.endsWith('.ts')).sort();

const findings = [];
let scanned = 0;
let reactive = 0;

for (const file of subsystemFiles) {
  const modulePath = pathToFileURL(path.join(SRC, file).replace(/\.ts$/, '.js')).href;
  let module;
  try {
    module = await import(modulePath);
  } catch (error) {
    console.error(`Bỏ qua ${file}: ${error.message}`);
    continue;
  }

  const className = Object.keys(module).find((k) => k.endsWith('Subsystem'));
  const Cls = className ? module[className] : undefined;
  if (!Cls) continue;

  let instance;
  try {
    instance = new Cls();
  } catch (error) {
    console.error(`Không khởi tạo được ${className}: ${error.message}`);
    continue;
  }

  const proto = Object.getPrototypeOf(instance);
  // Chỉ xét method **public** — helper private trả hằng là chuyện bình thường.
  const source = fs.readFileSync(path.join(SRC, file), 'utf8');
  const publicNames = new Set();
  const publicRe = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  let pm;
  while ((pm = publicRe.exec(source)) !== null) publicNames.add(pm[1]);

  const names = Object.getOwnPropertyNames(proto).filter(
    (n) =>
      n !== 'constructor' &&
      publicNames.has(n) &&
      typeof instance[n] === 'function',
  );

  for (const name of names) {
    scanned++;

    let responded = false;
    const formResults = [];

    for (const form of ARG_FORMS) {
      const outputs = [];
      const primaries = [];
      let failed = false;

      for (const probe of PROBES) {
        try {
          const out = instance[name](...form.build(probe));
          outputs.push(stable(out));
          primaries.push(primaryValue(out));
        } catch {
          failed = true;
          break;
        }
      }

      if (failed || outputs.length < PROBES.length) continue;

      // Dạng này cho output KHÁC nhau giữa 3 probe → hàm có thực sự tính toán.
      if (!outputs.every((o) => o === outputs[0])) {
        responded = true;
        break;
      }

      formResults.push({ form: form.name, output: outputs[0], primary: primaries[0] });
    }

    if (responded) {
      reactive++;
      continue;
    }
    if (formResults.length === 0) continue;

    // Có dạng gọi nào cho ra giá trị KHÔNG tầm thường (vd 6, 0.42, -3) không?
    // Nếu có → hàm đã phản ánh dữ liệu thật ở ít nhất một cách gọi → không phải
    // "return có sẵn". (Trước đây tiêu chí này bị bỏ sót: hàm cho 6 khi đưa
    // entity đầy đủ nhưng 0 khi đưa Vec3 vẫn bị báo.)
    if (formResults.some((f) => !isTrivial(f.primary))) {
      reactive++;
      continue;
    }

    findings.push({
      file,
      className,
      name,
      primary: formResults[0].primary,
      form: formResults[0].form,
    });
  }
}

console.log(`Quét ${scanned} method của ${subsystemFiles.length} subsystem spatial-ui.`);
console.log(`  · ${reactive} method PHẢN ỨNG với dữ liệu (bỏ qua — không phải return có sẵn)`);
console.log(`Tìm ${findings.length} method trả giá trị HẰNG bất kể đầu vào:\n`);

const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file).push(f);
}

for (const [file, items] of byFile) {
  console.log(`── ${file}  (${items.length})`);
  for (const item of items) {
    console.log(`   ${item.name.padEnd(44)} -> ${String(item.primary)}`);
  }
  console.log('');
}

  return { findings, scanned, reactive };
}

if (isDirectRun) {
  const result = await scanSpatialUi();
  process.exit(result.findings.length === 0 ? 0 : 1);
}
