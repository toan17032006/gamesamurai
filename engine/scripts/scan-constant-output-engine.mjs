// engine/scripts/scan-constant-output-engine.mjs
//
// Mở rộng `scan-constant-output.mjs` sang các subsystem CÒN LẠI của engine:
// `behavior/`, `world/`, `animal/`.
//
// Mục đích: trục "loại bỏ các return có sẵn" chỉ được kiểm chứng cho
// `spatial-ui` (0/1800). Ba nhóm còn lại (behavior 1198, world 794,
// animal 798 method) chưa từng được quét bằng probe động.
//
// Nguyên tắc giữ nguyên từ scanner gốc:
//   - Một method chỉ bị coi là HẰNG khi MỌI dạng tham số đều cho cùng một
//     kết quả giữa 3 probe giàu dữ liệu, VÀ kết quả đó là giá trị "tầm
//     thường" (0, 1, 0.5, false, chuỗi rỗng, object rỗng…).
//   - Chỉ cần một dạng gọi cho ra kết quả khác nhau giữa các probe ⇒ method
//     có thực sự tính toán ⇒ bỏ qua.
//
// Khác biệt so với scanner spatial-ui:
//   - Mỗi lần gọi dùng một instance MỚI ⇒ không bị nhiễu bởi state tích luỹ
//     của các lần gọi trước (với subsystem mô phỏng, state tích luỹ làm mọi
//     method trông như "phản ứng" và che mất return có sẵn).
//   - Kết quả `null`/`undefined` ở MỌI dạng gọi được tách riêng: đó có thể
//     là "không có dữ liệu để tính" chứ không phải "return có sẵn" ⇒ cần
//     người đọc phân loại, không tự động kết luận.
//
// Dùng: npx tsx scripts/scan-constant-output-engine.mjs [nhóm...]
//   nhóm: behavior | world | animal  (mặc định: cả ba)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROBES, VARIANTS, buildProbe } from './scan-constant-output.mjs';

const GROUPS = [
  { name: 'behavior', dir: path.resolve('src/behavior/subsystems') },
  { name: 'world', dir: path.resolve('src/world/subsystems') },
  { name: 'animal', dir: path.resolve('src/animal/subsystems') },
];

const selected = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const groups = selected.length > 0 ? GROUPS.filter((g) => selected.includes(g.name)) : GROUPS;
if (groups.length === 0) {
  console.error(`Nhóm không hợp lệ. Chọn trong: ${GROUPS.map((g) => g.name).join(', ')}`);
  process.exit(2);
}

/**
 * Bổ sung field đặc thù cho behavior / world / animal vào probe.
 *
 * Probe của scanner spatial-ui đã rất giàu, nhưng các subsystem này đọc
 * những field riêng (cảm xúc, đặc tính, khí hậu, sinh thái…). Thiếu field
 * ⇒ method rơi về giá trị mặc định ⇒ dễ bị báo nhầm là hằng.
 */
function enrich(probe, index) {
  const s = 1 + index * 0.8;
  const v = (x, y, z) => ({ x, y, z });
  const entity = probe.entity;

  // Cảm xúc / tâm trạng (behavior).
  entity.emotion = { happiness: 0.7 * s, anger: 0.2 * s, fear: 0.1 * s, sadness: 0.3 * s, joy: 0.5 * s };
  entity.mood = 'content';
  entity.emotionalState = 'calm';
  entity.stress = 0.25 * s;
  entity.cognitiveLoad = 0.4 * s;
  entity.traits = { courage: 0.6 * s, agility: 0.7 * s, intelligence: 0.8 * s, loyalty: 0.55 * s };
  entity.skills = { hunting: 0.7 * s, foraging: 0.4 * s, nesting: 0.6 * s };
  entity.preferences = { food: 'meat', shelter: 'cave', social: 'pack' };
  entity.socialRole = 'alpha';
  entity.knowledge = { tools: 0.3 * s, fire: 0.1 * s, agriculture: 0.05 * s };
  entity.culture = { tradition: 'ritual', wealth: 120 * s, population: 450 * s };
  entity.economy = { supply: 800 * s, demand: 650 * s, price: 2.4 * s };
  entity.occupation = 'hunter';
  entity.labor = { hours: 6 * s, productivity: 0.8 * s };
  entity.era = 'stone_age';
  entity.society = { size: 120 * s, cohesion: 0.7 * s, conflict: 0.2 * s };
  entity.migration = { active: true, distance: 240 * s, direction: 0.6 * s };
  entity.language = { words: 800 * s, complexity: 0.5 * s };
  entity.goal = { type: 'hunt', progress: 0.35 * s, priority: 0.8 * s };
  entity.action = 'wander';
  entity.target = v(4 * s, 5 * s, 6 * s);
  entity.memory = { shortTerm: 5 * s, longTerm: 40 * s, recall: 0.7 * s };

  // Môi trường (world).
  entity.temperature = 18 * s;
  entity.humidity = 0.45 * s;
  entity.pressure = 101.3 * s;
  entity.elevation = 120 * s;
  entity.slope = 0.3 * s;
  entity.terrain = { height: 12 * s, steepness: 0.25 * s, type: 'mountain' };
  entity.soil = { fertility: 0.6 * s, moisture: 0.4 * s, depth: 1.2 * s };
  entity.water = { level: 0.8 * s, flow: 2.4 * s, depth: 3 * s, ph: 7.2 };
  entity.weather = { state: 'rain', intensity: 0.6 * s, cloudCover: 0.8 * s };
  entity.biome = 'temperate_forest';
  entity.season = 'spring';
  entity.timeOfDay = 13.5;
  entity.sunlight = 0.85 * s;
  entity.precipitation = 12 * s;
  entity.windSpeed = 3.2 * s;
  entity.windDirection = 0.4 * s;
  entity.cloudCover = 0.7 * s;
  entity.stormIntensity = 0.2 * s;
  entity.wildfireRisk = 0.35 * s;
  entity.erosion = 0.15 * s;
  entity.sediment = 0.25 * s;
  entity.quakeMagnitude = 3.2 * s;
  entity.volcanicActivity = 0.1 * s;
  entity.seismicActivity = 0.2 * s;
  entity.snowCover = 0.3 * s;
  entity.vegetationDensity = 0.55 * s;
  entity.species = 'canis_lupus';

  // Sinh thể (animal).
  entity.age = 5 * s;
  entity.bodyWeight = 40 * s;

  // Field "ĐIỀU KIỆN" — KHÔNG nhân theo tỉ lệ `s`.
  //
  // Mọi field ở trên đều nhân cùng hệ số `s`, nên mọi TỶ LỆ so sánh ngưỡng
  // giữa chúng đều bất biến. Các field ở đây cố tình giữ nguyên, để một
  // phép so sánh "giá trị đo (theo s) vs ngưỡng (cố định)" thực sự thay đổi
  // giữa các probe. Nhờ đó method chỉ cần đọc đúng field là bị lộ ra.
  entity.hardness = 2;
  entity.toughness = 3;
  entity.thickness = 0.3;
  entity.health = 85;
  entity.strength = 0.7;
  entity.moisture = 0.4;
  entity.density = 1.2;
  entity.friction = 0.4;
  entity.resilience = 0.6;
  entity.flexForce = 0.5;
  entity.stability = 0.7;
  entity.windResistance = 0.5;
  entity.porosity = 0.35;
  entity.fertility = 0.6;
  entity.toxicity = 0.2;
  entity.integrity = 0.9;
  entity.sharpness = 1.2;
  entity.cutSpeed = 4;
  entity.health = 0.9 * s;
  entity.energy = 80 * s;
  entity.hunger = 0.4 * s;
  entity.thirst = 0.3 * s;
  entity.fatigue = 0.25 * s;
  entity.reproduction = { litter: 4, cycle: 220, fertile: true };
  entity.genes = { speed: 0.6 * s, strength: 0.7 * s, endurance: 0.5 * s, camouflage: 0.3 * s };
  entity.habitat = { type: 'forest', area: 40 * s, shelter: 0.7 * s };
  entity.diet = { type: 'carnivore', intake: 2.5 * s };
  entity.predators = ['wolf'];
  entity.prey = ['deer'];
  entity.metabolism = 0.4 * s;
  entity.senses = { sight: 0.85 * s, hearing: 0.9 * s, smell: 1.1 * s, touch: 0.5 * s };
  entity.thermoregulation = { target: 37 * s, tolerance: 1.5 * s };
  entity.muscle = { mass: 20 * s, fiberType: 'fast' };
  entity.organ = { heart: 0.4 * s, lungs: 0.6 * s };

  probe.options.mood = 'content';
  probe.options.temperature = 18 * s;
  probe.options.humidity = 0.45 * s;
  probe.options.duration = 1.5 * s;
  probe.options.magnitude = 2.5 * s;
  probe.options.frequency = 1.2 * s;
  probe.options.speed = 3 * s;
  probe.options.energy = 80 * s;
  probe.options.mass = 40 * s;
  probe.options.intensity = 0.8 * s;
  probe.options.threshold = 0.5 * s;
  probe.options.rate = 0.25 * s;
  probe.options.factor = 1.4 * s;
  probe.options.time = 1.25 * s;
  probe.options.deltaTime = 0.016;
  probe.options.strength = 0.7 * s;
  probe.options.level = 2 * s;
  probe.options.count = 3 * s;
  probe.options.capacity = 10 * s;
  probe.options.cost = 0.2 * s;
  probe.options.reward = 1.5 * s;
  probe.options.target = v(4 * s, 5 * s, 6 * s);
  probe.options.entity = entity;
  probe.options.from = v(0, 0, 0);
  probe.options.to = v(1 * s, 2 * s, 3 * s);
  probe.options.reference = entity;
  probe.options.context = { state: 'active', phase: 0.3 * s };
  probe.options.config = { max: 10 * s, min: 0.1 * s, threshold: 0.5 * s };
  probe.options.biome = 'temperate_forest';
  probe.options.species = 'canis_lupus';

  return probe;
}

const ENGINE_PROBES = VARIANTS.map((variant, index) => enrich(buildProbe(variant), index));

/**
 * Probe ĐỘT BIẾN.
 *
 * Mọi field của probe gốc đều nhân cùng một hệ số `s`, nên mọi TỶ LỆ so
 * sánh ngưỡng (độ cứng / kích thước, sức gió / độ dày…) đều không đổi ⇒ các
 * method so sánh vẫn ra hằng. Các probe này cố ý đổi tỉ lệ của một nhóm
 * field, buộc method phải thực sự tính toán mới cho kết quả khác.
 */
function mutate(probe, mutation) {
  const entity = probe.entity;
  const options = probe.options;
  switch (mutation) {
    case 'size': {
      const scaleVec = (v, k) => ({ x: v.x * k, y: v.y * k, z: v.z * k });
      entity.size = scaleVec(entity.size, 9);
      entity.dimensions = scaleVec(entity.dimensions, 9);
      entity.bounds = {
        min: scaleVec(entity.bounds.min, 9),
        max: scaleVec(entity.bounds.max, 9),
      };
      entity.mass = entity.mass * 9;
      entity.width = entity.width * 9;
      entity.height = entity.height * 9;
      entity.depth = entity.depth * 9;
      entity.length = entity.length * 9;
      options.density = options.density * 9;
      break;
    }
    case 'condition': {
      entity.health = 4;
      entity.hardness = 9;
      entity.toughness = 7;
      entity.thickness = 2.4;
      entity.strength = 0.08;
      entity.energy = 6;
      entity.moisture = 0.03;
      entity.density = 9;
      entity.friction = 0.95;
      entity.resilience = 0.05;
      entity.flexForce = 4.5;
      entity.stability = 0.1;
      entity.windResistance = 0.05;
      entity.toughnessValue = 7;
      break;
    }
    case 'motion': {
      entity.position = { x: 480, y: -220, z: 310 };
      entity.velocity = { x: 9, y: -14, z: 7 };
      entity.windSpeed = 22;
      entity.rainfall = 140;
      entity.precipitation = 140;
      entity.temperature = 46;
      entity.humidity = 0.92;
      options.wind = { x: 9, y: -14, z: 7 };
      options.environment = { wind: { x: 9, y: -14, z: 7 } };
      break;
    }
    default:
      break;
  }
  return probe;
}

for (const mutation of ['size', 'condition', 'motion']) {
  ENGINE_PROBES.push(mutate(enrich(buildProbe(VARIANTS[0]), 0), mutation));
}

/**
 * Probe thứ 4: dữ liệu CỐ Ý SAI.
 *
 * Nhiệt độ vượt miền, cân bằng hệ sinh thái > 1, sức khoẻ âm… Nếu chỉ dùng
 * dữ liệu hợp lệ thì mọi method kiểm tra (`validate*`, `detect*`, `is*`) đều
 * trả cùng một giá trị ⇒ bị báo nhầm là hằng dù hoàn toàn đúng. Probe này bắt
 * buộc chúng phải thực sự kiểm tra dữ liệu.
 */
const INVALID_PROBE = enrich(buildProbe(VARIANTS[0]), 0);
Object.assign(INVALID_PROBE.entity, {
  temperature: 500,
  humidity: 4.5,
  balance: 3.2,
  ecosystemBalance: 3.2,
  vegetationDensity: 9,
  density: 9,
  health: -40,
  age: -5,
  energy: -10,
});
INVALID_PROBE.options.temperature = 500;
INVALID_PROBE.options.humidity = 4.5;
ENGINE_PROBES.push(INVALID_PROBE);

/** Các DẠNG tham số thử (giống scanner spatial-ui). */
const ARG_FORMS = [
  { name: 'entity,a,b', build: (p) => [p.entity, p.a, p.b] },
  { name: 'entity,options,b', build: (p) => [p.entity, p.options, p.b] },
  { name: 'entity,options,a', build: (p) => [p.entity, p.options, p.a] },
  { name: 'a,b,entity', build: (p) => [p.a, p.b, p.entity] },
  { name: 'options,entity,a', build: (p) => [p.options, p.entity, p.a] },
  { name: 'a,entity,options', build: (p) => [p.a, p.entity, p.options] },
  { name: 'entity', build: (p) => [p.entity] },
  { name: 'entity,options', build: (p) => [p.entity, p.options] },
  { name: 'a,b', build: (p) => [p.a, p.b] },
];

/** Hằng số "tầm thường" — không mang thông tin. */
const TRIVIAL = new Set([0, 1, -1, 0.5, true, false, null, undefined, '']);

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

/** Chuỗi hoá kết quả để so sánh ổn định (bỏ `timestamp`/`name` — không phản ánh đầu vào). */
function stable(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? `n:${value}` : `n:${String(value)}`;
  if (typeof value === 'boolean' || typeof value === 'string') return `${typeof value}:${value}`;
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort().filter((k) => k !== 'timestamp' && k !== 'name');
    return `{${keys.map((k) => `${k}:${stable(value[k])}`).join(',')}}`;
  }
  return `u:${String(value)}`;
}

const PRIMARY_KEYS = [
  'value', 'result', 'distance', 'angle', 'score', 'position', 'direction',
  'orientation', 'normal', 'vector', 'quaternion', 'offset', 'delta',
  'curvature', 'length', 'area', 'radius', 'magnitude', 'total', 'count',
  'width', 'height', 'depth', 'amount', 'ratio', 'level', 'intensity',
];

function primaryValue(result) {
  if (!result || typeof result !== 'object') return result;
  // Mảng: lấy chính nội dung mảng — `length` là số phần tử nên hai mảng khác
  // nhau vẫn bị coi là bằng nhau.
  if (Array.isArray(result)) return result;
  for (const key of PRIMARY_KEYS) {
    if (key in result) return result[key];
  }
  return result;
}

/** Tạo instance mới cho mỗi method (state tích luỹ trong các lần gọi của cùng method). */
function makeFactory(Cls) {
  try {
    // eslint-disable-next-line no-new
    new Cls();
    return () => new Cls();
  } catch {
    // Constructor cần tham số ⇒ dùng prototype trần; method cần state sẽ ném lỗi
    // và bị bỏ qua (không đưa vào danh sách phát hiện).
    return () => Object.create(Cls.prototype);
  }
}

/**
 * Thân của một method public (theo tên) — dùng để bỏ qua method `void`.
 *
 * Method không có từ khoá `return` không thể "trả giá trị có sẵn" — báo nó là
 * nhiễu. Dùng cân bằng ngoặc để lấy đúng thân (kể cả khi có `return` trong
 * chuỗi/nhánh lồng nhau).
 */
function methodBodies(source) {
  const bodies = new Map();
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(/gm;
  let m;
  while ((m = re.exec(source)) !== null) {
    const name = m[1];
    let i = re.lastIndex;
    let depth = 1;
    while (i < source.length && depth > 0) {
      const ch = source[i];
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      i++;
    }
    // Bỏ qua phần kiểu trả về và `=>`/`{` để tới thân.
    let j = i;
    while (j < source.length && source[j] !== '{' && source[j] !== ';') j++;
    if (j >= source.length || source[j] === ';') {
      bodies.set(name, '');
      continue;
    }
    let braces = 0;
    let k = j;
    for (; k < source.length; k++) {
      if (source[k] === '{') braces++;
      else if (source[k] === '}') {
        braces--;
        if (braces === 0) break;
      }
    }
    bodies.set(name, source.slice(j, k + 1));
  }
  return bodies;
}

/** Method có `return` không (bỏ qua `return` trong chuỗi/comment). */
function hasReturn(body) {
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  return /(^|[^.\w])return(\s|$)/.test(stripped);
}

/**
 * Method có ĐỌC state của đối tượng (`this.…`) không.
 *
 * Phân biệt hai nguyên nhân trả kết quả giống nhau:
 *  - KHÔNG đọc state ⇒ trả hằng cứng ⇒ "return có sẵn" thật.
 *  - CÓ đọc state ⇒ giá trị phụ thuộc state; probe chưa gọi setter tương ứng
 *    nên state vẫn ở giá trị mặc định ⇒ có thể là báo nhầm, cần người đọc.
 */
function readsState(body) {
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  return /(^|[^.\w])this\s*\./.test(stripped);
}

const findings = [];
const nullish = [];
let scanned = 0;
let reactive = 0;

for (const group of groups) {
  if (!fs.existsSync(group.dir)) {
    console.error(`Không có thư mục: ${group.dir}`);
    continue;
  }
  const files = fs.readdirSync(group.dir).filter((f) => f.endsWith('.ts')).sort();

  for (const file of files) {
    const filePath = path.join(group.dir, file);
    const modulePath = pathToFileURL(filePath.replace(/\.ts$/, '.js')).href;
    let module;
    try {
      module = await import(modulePath);
    } catch (error) {
      console.error(`Bỏ qua ${group.name}/${file}: ${error.message}`);
      continue;
    }

    const classNames = Object.keys(module).filter(
      (key) => key.endsWith('Subsystem') && typeof module[key] === 'function',
    );
    if (classNames.length === 0) continue;

    const source = fs.readFileSync(filePath, 'utf8');
    const publicNames = new Set();
    const publicRe = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(/gm;
    let pm;
    while ((pm = publicRe.exec(source)) !== null) publicNames.add(pm[1]);
    const bodies = methodBodies(source);

    for (const className of classNames) {
      const Cls = module[className];
      const makeInstance = makeFactory(Cls);
      const proto = Cls.prototype;
      const names = Object.getOwnPropertyNames(proto).filter(
        (n) =>
          n !== 'constructor' &&
          publicNames.has(n) &&
          typeof proto[n] === 'function',
      );

      for (const name of names) {
        // Method `void` không thể trả "giá trị có sẵn" ⇒ bỏ qua.
        if (!hasReturn(bodies.get(name) ?? '')) continue;
        scanned++;

        // MỘT instance cho cả method này: state tích luỹ giữa các lần gọi
        // (ví dụ `count: this.resetCounter`) phải được phản ánh đúng, còn
        // instance mới cho mỗi lần gọi sẽ làm mọi bộ đếm trông giống hằng.
        const instance = makeInstance();
        let responded = false;
        const formResults = [];

        for (const form of ARG_FORMS) {
          const outputs = [];
          const primaries = [];
          let failed = false;

          for (const probe of ENGINE_PROBES) {
            try {
              const out = instance[name](...form.build(probe));
              outputs.push(stable(out));
              primaries.push(primaryValue(out));
            } catch {
              failed = true;
              break;
            }
          }

          if (failed || outputs.length < ENGINE_PROBES.length) continue;

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

        // Giá trị chính có khác nhau giữa các DẠNG gọi không?
        // Nếu khác ⇒ method phụ thuộc đầu vào (vị trí tham số) ⇒ không phải hằng.
        const primaryKeys = new Set(formResults.map((f) => stable(f.primary)));
        const inputDependent = primaryKeys.size > 1;
        if (inputDependent) {
          reactive++;
          continue;
        }

        const item = {
          group: group.name,
          file: `${group.name}/subsystems/${file}`,
          className,
          name,
          primary: formResults[0].primary,
          form: formResults[0].form,
          stateDependent: readsState(bodies.get(name) ?? ''),
          tier: isTrivial(formResults[0].primary) ? 1 : 2,
        };

        // Phân loại: nullish (không đủ dữ liệu) vs constant (giá trị tầm thường).
        const allNullish = formResults.every(
          (f) => f.primary === null || f.primary === undefined,
        );
        if (allNullish) {
          nullish.push(item);
          continue;
        }
        findings.push(item);
      }
    }
  }
}

console.log(
  `Quét ${scanned} method của ${groups.map((g) => g.name).join(' + ')} ` +
  `(một instance cho mỗi method, method void bị bỏ qua).`,
);
console.log(`  · ${reactive} method PHẢN ỨNG với dữ liệu (bỏ qua — không phải return có sẵn)`);
console.log(`Tìm ${findings.length} method trả giá trị HẰNG bất kể đầu vào:`);
const tier1 = findings.filter((f) => f.tier === 1);
const tier2 = findings.filter((f) => f.tier === 2);
const canned = tier1.filter((f) => !f.stateDependent);
const stateDependent = tier1.filter((f) => f.stateDependent);
console.log(
  `  · TẦNG 1 — giá trị tầm thường (0/1/0.5/true/false): ${tier1.length}` +
  `  (hằng cứng: ${canned.length}, đọc state: ${stateDependent.length})`,
);
console.log(
  `  · TẦNG 2 — giá trị cụ thể nhưng cố định (0.05, 5000…): ${tier2.length} ⇒ cần rà soát`,
);
console.log(`  · ${nullish.length} trả null/undefined ở mọi dạng gọi — cần dữ liệu để phân loại\n`);

const byFile = new Map();
for (const f of [...findings, ...nullish]) {
  const key = f.file;
  if (!byFile.has(key)) byFile.set(key, { t1: [], t2: [], nullish: [] });
  const bucket = byFile.get(key);
  if (nullish.includes(f)) bucket.nullish.push(f);
  else if (f.tier === 1) bucket.t1.push(f);
  else bucket.t2.push(f);
}

for (const [file, buckets] of byFile) {
  console.log(
    `── ${file}  (tầng1: ${buckets.t1.length}, tầng2: ${buckets.t2.length}, nullish: ${buckets.nullish.length})`,
  );
  for (const item of buckets.t1) {
    const tag = item.stateDependent ? 'STATE' : 'CỨNG ';
    console.log(`   [T1 ${tag}] ${item.name.padEnd(40)} -> ${String(item.primary)}`);
  }
  for (const item of buckets.t2) {
    const tag = item.stateDependent ? 'STATE' : 'CỨNG ';
    console.log(`   [T2 ${tag}] ${item.name.padEnd(40)} -> ${String(item.primary)}`);
  }
  for (const item of buckets.nullish) {
    console.log(`   [NULL ] ${item.name.padEnd(40)} -> null/undefined`);
  }
  console.log('');
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) process.exit(findings.length === 0 ? 0 : 1);
