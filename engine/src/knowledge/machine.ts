/**
 * @file machine.ts
 * @module @aetheria/engine/knowledge/machine
 * @description Máy móc mô phỏng thực tế: bản vẽ (blueprint) do kỹ sư thiết kế
 * từ tri thức đã thu thập, cấu thành từ bộ phận có thông số vật lý thật (tai
 * máy, tỷ lệ truyền lực, hiệu suất nhiệt, công suất, tải). Máy chạy thật:
 * hao mòn theo giờ vận hành, sinh nhiệt, hỏng hóc theo xác suất dựa trên tải,
 * bảo trì kéo dài tuổi thọ, tai nạn máy móc (văng mảnh, cháy, nổ nồi hơi) có
 * thể gây thương vong — mọi con số vận hành chạy trên mô hình vật lý đơn giản
 * nhưng nhất quán, không phải số hoa mỹ.
 */

import { LifeRandom } from '../life/stochastic.js';
import { clamp01, clampRange, hashSeed } from '../deeplearning/random.js';

/** Loại bộ phận máy. */
export type MachinePartType =
  | 'frame'
  | 'power_source'
  | 'transmission'
  | 'working_head'
  | 'control'
  | 'safety'
  | 'heat_management';

/** Một bộ phận trong bản vẽ. */
export interface MachinePart {
  id: string;
  type: MachinePartType;
  name: string;
  /** Trọng lượng (kg). */
  massKg: number;
  /** Hiệu suất riêng `[0, 1]` (ma sát, rò rỉ, tổn thất nhiệt…). */
  efficiency: number;
  /** Độ bền nền (giờ vận hành trước khi hao mòn nặng). */
  durabilityHours: number;
  /** Chi phí nguyên liệu (đơn vị tài nguyên thế giới). */
  materialCost: number;
}

/** Bản vẽ máy móc — đầu ra của kỹ sư. */
export interface MachineBlueprint {
  id: string;
  name: string;
  designerId: string;
  year: number;
  parts: MachinePart[];
  /** Công suất danh định (W). */
  ratedPowerWatts: number;
  /** Vận hành dự kiến: nhiệm vụ (mài, bơm, dệt, kéo…). */
  task: string;
  /** Yêu cầu tri thức tối thiểu để thiết kế (id → mastery). */
  designPrerequisites: Record<string, number>;
  /** Mức nguy cơ nền khi vận hành `[0, 1]` (nồi hơi > cối xay > cối quay tay). */
  baseHazard: number;
}

/** Trạng thái vận hành một cỗ máy đã lắp ráp. */
export interface MachineInstance {
  id: string;
  blueprintId: string;
  ownerId: string;
  /** Giờ vận hành tích luỹ. */
  operatingHours: number;
  /** Hao mòn `[0, 1]` (1 = hỏng hoàn toàn). */
  wear: number;
  /** Hiệu suất thực tế đang đạt được `[0, 1]`. */
  currentEfficiency: number;
  /** Nhiệt độ nhân máy (°C) so với môi trường. */
  coreTemperatureC: number;
  running: boolean;
  /** Tổng công suất đã sinh (Wh) — sản lượng thực tế. */
  energyOutputWh: number;
  breakdowns: number;
  lastBreakdownHour?: number;
}

/** Kết quả một bước vận hành máy. */
export interface MachineStepResult {
  machineId: string;
  hours: number;
  /** Công suất đầu ra trung bình trong bước (W). */
  outputPowerWatts: number;
  /** Sản lượng (Wh). */
  outputWh: number;
  wearDelta: number;
  /** Có sự cố không. */
  breakdown: boolean;
  /** Loại sự cố nếu có. */
  breakdownType?: 'seizure' | 'overheat' | 'part_failure' | 'explosion' | 'fire';
  /** Sát thương người vận hành (nếu có tai nạn). */
  operatorDamage: number;
  /** Thông số đo được để agent học/nghiên cứu. */
  measurements: { efficiency: number; coreTemperatureC: number; vibration: number };
  note: string;
}

/** Hiệu suất cơ học lý thuyết của bộ truyền đĩa xích — công thức xấp xỉ. */
export function transmissionEfficiency(parts: ReadonlyArray<MachinePart>): number {
  const transmission = parts.filter((p) => p.type === 'transmission');
  if (transmission.length === 0) return 1;
  // Mỗi cấp truyền mất (1 - eff); nhân chuỗi các cấp.
  return transmission.reduce((eff, part) => eff * clamp01(part.efficiency), 1);
}

/** Công suất đầu ra dự kiến của bản vẽ (W) theo vật lý xấp xỉ. */
export function blueprintOutputPower(blueprint: MachineBlueprint): number {
  const power = blueprint.parts.find((p) => p.type === 'power_source');
  if (!power) return 0;
  // P_out = P_rated × eff nguồn × eff truyền × eff đầu công tác, trừ tổn thất nhiệt.
  const head = blueprint.parts.find((p) => p.type === 'working_head');
  const cooling = blueprint.parts.find((p) => p.type === 'heat_management');
  const thermalLoss = cooling ? 0.03 : 0.1;
  return Math.max(
    0,
    Math.round(power.efficiency * blueprint.ratedPowerWatts * transmissionEfficiency(blueprint.parts) *
      (head?.efficiency ?? 0.8) * (1 - thermalLoss)),
  );
}

/** Trọng lượng toàn bộ máy (kg). */
export function blueprintMass(blueprint: MachineBlueprint): number {
  return Math.round(blueprint.parts.reduce((sum, part) => sum + part.massKg, 0) * 10) / 10;
}

/** Chi phí nguyên liệu toàn bộ bản vẽ. */
export function blueprintCost(blueprint: MachineBlueprint): number {
  return blueprint.parts.reduce((sum, part) => sum + part.materialCost, 0);
}

/** Tạo bộ phận có thông số ngẫu nhiên tất định quanh chuẩn. */
export function createPart(
  type: MachinePartType,
  name: string,
  seed: number | string,
  options: { massKg?: number; efficiency?: number; durabilityHours?: number; materialCost?: number } = {},
): MachinePart {
  const random = new LifeRandom(seed);
  const baseEfficiency: Record<MachinePartType, number> = {
    frame: 0.98,
    power_source: 0.55,
    transmission: 0.9,
    working_head: 0.8,
    control: 0.95,
    safety: 0.9,
    heat_management: 0.85,
  };
  return {
    id: `part_${type}_${random.int(1000, 9999)}`,
    type,
    name,
    massKg: Math.max(0.1, options.massKg ?? random.range(2, 40)),
    efficiency: clamp01(options.efficiency ?? clampRange(random.gaussian(baseEfficiency[type], 0.06), 0.3, 0.99)),
    durabilityHours: Math.max(50, options.durabilityHours ?? Math.round(random.range(600, 3000))),
    materialCost: Math.max(1, options.materialCost ?? Math.round(random.range(2, 30))),
  };
}

/**
 * Xây bản vẽ cơ bản theo nhiệm vụ — kỹ sư "thiết kế" bằng cách chọn bộ phận
 * từ tri thức đã có; tri thức càng tốt thì hiệu suất càng gần trần lý thuyết.
 */
export function designBlueprint(
  designerId: string,
  name: string,
  task: string,
  knowledge: Record<string, number>,
  options: { seed?: number | string; year?: number; ratedPowerWatts?: number; baseHazard?: number } = {},
): { blueprint: MachineBlueprint | null; note: string } {
  const mechanics = knowledge.mechanics ?? 0;
  const required = options.ratedPowerWatts && options.ratedPowerWatts > 800 ? 0.55 : 0.3;
  if (mechanics < required) {
    return {
      blueprint: null,
      note: `thiếu tri thức cơ khí (cần mechanics ≥ ${required}) — bản vẽ chỉ là vẽ nguệch ngoạc`,
    };
  }
  const random = new LifeRandom(options.seed ?? `${designerId}:${name}`);
  const parts: MachinePart[] = [
    createPart('frame', `khung ${name}`, `${designerId}:${name}:frame`),
    createPart('power_source', `nguồn động lực ${task}`, `${designerId}:${name}:power`),
    createPart('transmission', 'bộ truyền', `${designerId}:${name}:trans`),
    createPart('working_head', `đầu công tác ${task}`, `${designerId}:${name}:head`),
    createPart('control', 'cần điều khiển', `${designerId}:${name}:ctrl`),
  ];
  // Tri thức an toàn tốt → tự thêm van an toàn/két nước.
  if ((knowledge.safety_engineering ?? 0) > 0.35) {
    parts.push(createPart('safety', 'van an toàn', `${designerId}:${name}:safety`));
  }
  if ((knowledge.thermodynamics ?? 0) > 0.4) {
    parts.push(createPart('heat_management', 'két tản nhiệt', `${designerId}:${name}:heat`));
  }
  const rated = Math.max(50, options.ratedPowerWatts ?? Math.round(random.range(120, 1500)));
  const blueprint: MachineBlueprint = {
    id: `bp_${hashSeed(`${designerId}:${name}:${options.year ?? 0}`).toString(16)}`,
    name,
    designerId,
    year: options.year ?? 0,
    parts,
    ratedPowerWatts: rated,
    task,
    designPrerequisites: { mechanics: required },
    baseHazard: clamp01((options.baseHazard ?? 0.15) * (1 - (knowledge.safety_engineering ?? 0) * 0.6)),
  };
  return { blueprint, note: `thiết kế xong: ${parts.length} bộ phận, dự kiến đầu ra ${blueprintOutputPower(blueprint)}W` };
}

/** Lắp ráp bản vẽ thành cỗ máy chạy được. */
export function assembleMachine(
  blueprint: MachineBlueprint,
  ownerId: string,
  options: { seed?: number | string; assemblyQuality?: number } = {},
): MachineInstance {
  const quality = clamp01(options.assemblyQuality ?? 0.6);
  const random = new LifeRandom(options.seed ?? `${blueprint.id}:${ownerId}`);
  return {
    id: `machine_${blueprint.id.slice(3)}_${random.int(100, 999)}`,
    blueprintId: blueprint.id,
    ownerId,
    operatingHours: 0,
    wear: clampRange(1 - quality, 0, 0.3) * 0.2,
    currentEfficiency: blueprintOutputPower(blueprint) / Math.max(1, blueprint.ratedPowerWatts),
    coreTemperatureC: 20,
    running: false,
    energyOutputWh: 0,
    breakdowns: 0,
  };
}

/**
 * Vận hành máy một số giờ: mô hình vật lý xấp xỉ — tổn thất theo hao mòn,
 * nhiệt độ tăng theo tải và hạ theo tản nhiệt, sự cố theo xác suất hao mòn.
 */
export function operateMachine(
  machine: MachineInstance,
  blueprint: MachineBlueprint,
  hours: number,
  options: { random?: LifeRandom; ambientTemperatureC?: number; loadRatio?: number } = {},
): MachineStepResult {
  const random = options.random ?? new LifeRandom(`${machine.id}:${machine.operatingHours}`);
  const ambient = options.ambientTemperatureC ?? 20;
  const load = clampRange(options.loadRatio ?? 0.8, 0.05, 1.2);
  const h = clampRange(hours, 0, 720);
  const hasCooling = blueprint.parts.some((p) => p.type === 'heat_management');
  const hasSafety = blueprint.parts.some((p) => p.type === 'safety');
  const mass = blueprintMass(blueprint);

  machine.running = h > 0;
  machine.operatingHours += h;

  // Hao mòn: tăng nhanh theo tải và khối lượng chuyển động.
  const wearRate = (0.00008 + load * 0.00012) * (1 + mass / 400);
  const wearDelta = clampRange(wearRate * h, 0, 1);
  machine.wear = clamp01(machine.wear + wearDelta);

  // Nhiệt: dT tăng theo công suất (chuẩn hoá 600W = 1 đơn vị nhiệt), giảm 55% nếu có két.
  const heatFactor = 0.45 * load * (blueprint.ratedPowerWatts / 600);
  const cooling = hasCooling ? 0.45 : 1;
  machine.coreTemperatureC = ambient + heatFactor * 90 * cooling * (0.7 + machine.wear * 0.6);

  // Hiệu suất giảm theo hao mòn; quá nhiệt cũng làm rớt hiệu suất.
  const thermalPenalty = machine.coreTemperatureC > 90 ? (machine.coreTemperatureC - 90) / 200 : 0;
  machine.currentEfficiency = clamp01(
    (blueprintOutputPower(blueprint) / Math.max(1, blueprint.ratedPowerWatts)) * (1 - machine.wear * 0.5) - thermalPenalty,
  );
  const outputPower = Math.round(machine.currentEfficiency * blueprint.ratedPowerWatts * load);
  const outputWh = Math.round(outputPower * h);
  machine.energyOutputWh += outputWh;

  // Xác suất sự cố: tăng theo hao mòn, tải, nguy cơ nền; van an toàn giảm nổ.
  const breakdownChance = clamp01(
    (0.002 + machine.wear * 0.05 + blueprint.baseHazard * 0.02) * h * load * (hasSafety ? 0.6 : 1),
  );
  const vibration = clampRange(machine.wear * 0.8 + load * 0.2 + random.gaussian(0, 0.05), 0, 1);

  let breakdown = false;
  let breakdownType: MachineStepResult['breakdownType'];
  let operatorDamage = 0;
  let note = `vận hành êm ${h}h, đầu ra ${outputPower}W, nhiệt ${machine.coreTemperatureC.toFixed(0)}°C`;

  if (random.chance(breakdownChance)) {
    breakdown = true;
    machine.breakdowns++;
    machine.lastBreakdownHour = machine.operatingHours;
    const roll = random.next();
    if (machine.coreTemperatureC > 150 && !hasCooling && roll < 0.55) {
      breakdownType = 'explosion';
      operatorDamage = Math.round(random.range(35, 95));
      note = `NỔ! Áp suất hơi vượt ngưỡng (${machine.coreTemperatureC.toFixed(0)}°C), văng mảnh kim loại — người vận hành mất ${operatorDamage} máu`;
    } else if (machine.coreTemperatureC > 120 && roll < 0.7) {
      breakdownType = 'fire';
      operatorDamage = Math.round(random.range(10, 40));
      note = `bốc cháy do quá nhiệt (${machine.coreTemperatureC.toFixed(0)}°C) — bỏng nhẹ ${operatorDamage} máu`;
    } else if (roll < 0.75) {
      breakdownType = 'part_failure';
      const victimPart = random.weighted(
        blueprint.parts.map((part) => ({ value: part, weight: part.durabilityHours > 0 ? 1 : 0.1 })),
      );
      note = `hỏng ${victimPart?.name ?? 'bộ phận'} sau ${machine.operatingHours}h — cần thay thế`;
    } else if (roll < 0.9) {
      breakdownType = 'overheat';
      note = `quá nhiệt (${machine.coreTemperatureC.toFixed(0)}°C) phải dừng để nguội`;
    } else {
      breakdownType = 'seizure';
      operatorDamage = Math.round(random.range(5, 25));
      note = `kẹt cứng trục quay — người vận hành bị vướng, thương nhẹ ${operatorDamage} máu`;
    }
  }

  return {
    machineId: machine.id,
    hours: h,
    outputPowerWatts: outputPower,
    outputWh,
    wearDelta,
    breakdown,
    breakdownType,
    operatorDamage,
    measurements: { efficiency: machine.currentEfficiency, coreTemperatureC: machine.coreTemperatureC, vibration },
    note,
  };
}

/** Bảo trì: giảm hao mòn theo chất lượng thợ và phụ tùng. */
export function maintainMachine(
  machine: MachineInstance,
  options: { quality?: number; spareParts?: number } = {},
): { wearBefore: number; wearAfter: number; note: string } {
  const quality = clamp01(options.quality ?? 0.5);
  const parts = clampRange(options.spareParts ?? 1, 0, 5);
  const before = machine.wear;
  machine.wear = clamp01(machine.wear - quality * 0.35 * Math.min(1, parts));
  return {
    wearBefore: before,
    wearAfter: machine.wear,
    note: machine.wear < before
      ? `bảo trì giảm hao mòn ${((before - machine.wear) * 100).toFixed(1)}%`
      : 'không có phụ tùng, bảo trì không giúp được gì',
  };
}

/** Máy đã hỏng hoàn toàn chưa. */
export function isBroken(machine: MachineInstance): boolean {
  return machine.wear >= 0.95;
}
