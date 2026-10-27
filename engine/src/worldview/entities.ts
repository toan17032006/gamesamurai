/**
 * @file entities.ts
 * @module @aetheria/engine/worldview/entities
 * @description Các renderer tự sinh cho mọi đối tượng thế giới: cây lớn lên
 * từng ngày (mầm → cây non → tán đầy → bị chặt còn gốc), nhà xây dở theo tiến
 * độ (nền → tường → mái → cửa sổ/ống khói + khói bay), agent (player/npc/động
 * vật/quái thú) với tư thế hành động (chặt cây, xây, làm ruộng, may vá, đào,
 * khuân vác), nước động (ao/hồ/sông/bể sóng sin), ruộng đồng chín vàng, núi
 * đồi từ heightmap, núi lửa phun trào với mảnh dung岩 bay, sóng thần tiến vào
 * bờ, vệt gió, và màu bầu trời ngày/đêm.
 */

import type {
  AgentRenderState,
  CaveState,
  RuinState,
  HouseState,
  RenderStyle,
  RiceFieldState,
  SceneNode,
  Shape,
  TreeState,
  Vec2,
  VolcanoState,
  WaterBodyState,
  WeatherState,
  WorldEventMark,
} from './types.js';
import { blobPoints, circlePoints, hash2, noise2D, swayAt, waveAt } from './geometry.js';

const S = (shapes: Shape[], style: RenderStyle = {}): RenderStyle => ({ ...style });
void S;

function node(id: string, kind: string, z: number, origin: Vec2, shapes: Shape[], style: RenderStyle = {}): SceneNode {
  return { id, kind, z, origin, shapes, style };
}

// ---------------------------------------------------------------------------
// Cây — lớn lên từng ngày, chặt còn gốc
// ---------------------------------------------------------------------------

/**
 * Render cây theo `growth` [0,1]: 0 = mầm non, 1 = cây trưởng thành;
 * `chopped = true` → gốc cây với vân tuổi. Tán lay theo gió.
 */
export function renderTree(state: TreeState, weather: WeatherState, worldTime: number): SceneNode {
  const ground = { x: state.x, y: state.y };
  if (state.chopped) {
    return node(`tree_${state.id}`, 'tree', 20, ground, [
      { kind: 'rect', topLeft: { x: state.x - 3, y: state.y - 8 }, width: 6, height: 8 },
      { kind: 'ellipse', center: { x: state.x, y: state.y - 8 }, rx: 3, ry: 1.2 },
      // Vân tuổi.
      { kind: 'ellipse', center: { x: state.x, y: state.y - 8 }, rx: 1.8, ry: 0.7 },
    ], { fill: '#8a5a33', stroke: '#5e3a1c', strokeWidth: 0.6 });
  }

  const growth = Math.max(0.02, Math.min(1, state.growth));
  const trunkHeight = 4 + growth * 26;
  const trunkWidth = 1 + growth * 3.4;
  const crownR = growth * (state.species === 'pine' ? 9 : 12);
  const sway = swayAt(state.x, worldTime, weather.windStrength) * growth;

  const shapes: Shape[] = [
    // Thân — hơi cong theo gió.
    { kind: 'path', points: [
      { x: state.x - trunkWidth / 2, y: ground.y },
      { x: state.x - trunkWidth / 4 + sway * 0.4, y: ground.y - trunkHeight * 0.6 },
      { x: state.x + trunkWidth / 2 + sway, y: ground.y - trunkHeight },
      { x: state.x + trunkWidth / 2 + sway, y: ground.y - trunkHeight + 1 },
      { x: state.x + trunkWidth / 4 + sway * 0.4, y: ground.y - trunkHeight * 0.6 },
      { x: state.x + trunkWidth / 2, y: ground.y },
    ], closed: true },
  ];

  if (state.species === 'pine') {
    // Thông: chồng tam giác tán.
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      const layerY = ground.y - trunkHeight * (0.35 + (layer / layers) * 0.62);
      const layerW = crownR * (1.5 - layer * 0.35);
      shapes.push({
        kind: 'polygon',
        points: [
          { x: state.x - layerW + sway * (layer + 1) * 0.5, y: layerY },
          { x: state.x + sway * (layer + 1) * 0.6, y: layerY - crownR * 0.9 },
          { x: state.x + layerW + sway * (layer + 1) * 0.5, y: layerY },
        ],
      });
    }
  } else {
    // Cây tán tròn (oak/palm): cụm blob — palm tán dạng quạt xòe.
    if (state.species === 'palm') {
      for (let frond = 0; frond < 6; frond++) {
        const angle = (frond / 6) * Math.PI - Math.PI / 2;
        const tipX = state.x + sway + Math.cos(angle) * crownR * 1.2;
        const tipY = ground.y - trunkHeight - crownR * 0.4 + Math.abs(Math.sin(angle)) * crownR * 0.6;
        shapes.push({ kind: 'path', points: [
          { x: state.x + sway, y: ground.y - trunkHeight },
          { x: state.x + sway * 0.5 + Math.cos(angle) * crownR * 0.6, y: ground.y - trunkHeight - crownR * 0.35 + tipY * 0 },
          { x: tipX, y: tipY },
        ], closed: false });
      }
    } else {
      const blobColor = growth > 0.7 ? '#3f7d3a' : '#6aa84f';
      shapes.push({ kind: 'polygon', points: blobPoints({ x: state.x + sway, y: ground.y - trunkHeight - crownR * 0.5 }, crownR, Math.round(state.x * 7 + growth * 100), 0.3) });
      shapes.push({ kind: 'polygon', points: blobPoints({ x: state.x + sway * 1.1 - crownR * 0.4, y: ground.y - trunkHeight - crownR * 0.2 }, crownR * 0.7, Math.round(state.x * 11), 0.3) });
      void blobColor;
    }
  }
  // Trái khi chín cây.
  if (growth > 0.85 && state.species === 'oak') {
    shapes.push({ kind: 'circle', center: { x: state.x + sway + crownR * 0.4, y: ground.y - trunkHeight - crownR * 0.6 }, radius: 0.9 });
  }

  return node(`tree_${state.id}`, 'tree', 20, ground, shapes, { fill: '#4b7d3f', stroke: '#2d5427', strokeWidth: 0.5 });
}

// ---------------------------------------------------------------------------
// Nhà — xây dở theo progress
// ---------------------------------------------------------------------------

/** Nhà theo tiến độ xây: nền → tường → mái → hoàn thiện (cửa, sổ, khói bay). */
export function renderHouse(state: HouseState, weather: WeatherState, worldTime: number): SceneNode {
  const base = { x: state.x, y: state.y };
  const w = state.width;
  const h = state.height;
  const progress = Math.max(0, Math.min(1, state.progress));
  const shapes: Shape[] = [];
  const scaffold: Shape[] = [];

  // Nền móng luôn có.
  shapes.push({ kind: 'rect', topLeft: { x: state.x - w / 2 - 1, y: base.y - 2 }, width: w + 2, height: 4, });
  // Sàn gỗ khi bắt đầu.
  if (progress > 0.1) {
    shapes.push({ kind: 'rect', topLeft: { x: state.x - w / 2, y: base.y - h * 0.25 }, width: w, height: h * 0.25 });
  }
  // Tường nâng dần 0.25 → 0.6.
  if (progress > 0.25) {
    const wallHeight = h * 0.75 * Math.min(1, (progress - 0.25) / 0.35);
    shapes.push({ kind: 'rect', topLeft: { x: state.x - w / 2, y: base.y - h * 0.25 - wallHeight }, width: w, height: wallHeight, });
  }
  // Khung giàn giáo trong khi xây.
  if (progress > 0.05 && progress < 0.92) {
    scaffold.push({ kind: 'line', from: { x: state.x - w / 2 - 2, y: base.y }, to: { x: state.x - w / 2 - 2, y: base.y - h * (0.5 + progress * 0.5) } });
    scaffold.push({ kind: 'line', from: { x: state.x + w / 2 + 2, y: base.y }, to: { x: state.x + w / 2 + 2, y: base.y - h * (0.5 + progress * 0.5) } });
    scaffold.push({ kind: 'line', from: { x: state.x - w / 2 - 2, y: base.y - h * 0.6 }, to: { x: state.x + w / 2 + 2, y: base.y - h * 0.6 } });
  }
  // Mái từ 0.6.
  if (progress > 0.6) {
    const roofRise = h * 0.55 * Math.min(1, (progress - 0.6) / 0.25);
    shapes.push({
      kind: 'polygon',
      points: [
        { x: state.x - w / 2 - 2, y: base.y - h * (0.25 + 0.75 * Math.min(1, (progress - 0.25) / 0.35)) },
        { x: state.x + Math.max(-6, Math.min(6, (progress - 0.6) * 40)), y: base.y - h * 0.7 - roofRise },
        { x: state.x + w / 2 + 2, y: base.y - h * (0.25 + 0.75 * Math.min(1, (progress - 0.25) / 0.35)) },
      ],
    });
  }
  // Hoàn thiện 0.85+: cửa, cửa sổ, ống khói + khói bay theo gió.
  if (progress > 0.85) {
    shapes.push({ kind: 'rect', topLeft: { x: state.x - w * 0.12, y: base.y - h * 0.45 }, width: w * 0.24, height: h * 0.45 });
    shapes.push({ kind: 'rect', topLeft: { x: state.x + w * 0.18, y: base.y - h * 0.85 }, width: w * 0.2, height: h * 0.2 });
    shapes.push({ kind: 'rect', topLeft: { x: state.x + w / 2 - 3, y: base.y - h * 1.15 }, width: 4, height: h * 0.35 });
    // Khói: chuỗi tròn bay lên, lệch theo gió.
    for (let puff = 0; puff < 4; puff++) {
      const phase = (worldTime * 0.4 + puff * 0.25) % 1;
      shapes.push({
        kind: 'circle',
        center: { x: state.x + w / 2 - 1 + phase * 6 * weather.windStrength, y: base.y - h * 1.2 - phase * 10 },
        radius: 1 + phase * 2.5,
      });
    }
  }

  return node(`house_${state.id}`, 'house', 22, base, [...shapes, ...scaffold], { fill: state.wallColor, stroke: '#3a2c1c', strokeWidth: 0.6 });
}

// ---------------------------------------------------------------------------
// Agent — player/npc/động vật/quái thú với tư thế hành động
// ---------------------------------------------------------------------------

/** Scale cm → đơn vị thế giới (1 world unit = 50cm). */
const CM_TO_WORLD = 1 / 50;

/** Render agent: vóc dáng từ thông số, tư thế theo hành động, đạo cụ trên tay. */
export function renderAgent(state: AgentRenderState, weather: WeatherState, worldTime: number): SceneNode {
  const ground = { x: state.x, y: state.y };
  const scale = Math.max(0.3, state.heightCm * CM_TO_WORLD);
  const bob = state.action === 'walk' ? Math.sin(worldTime * 6) * 0.4 : Math.sin(worldTime * 1.5) * 0.15;
  const shapes: Shape[] = [];
  const sway = swayAt(state.x, worldTime, weather.windStrength) * 0.2;

  if (state.kind === 'animal' || state.kind === 'monster') {
    // Tứ thế: thân bầu + 4 chân + đầu, quái thú thêm sừng + mắt đỏ.
    const bodyW = scale * 1.4;
    const bodyH = scale * 0.7;
    shapes.push({ kind: 'ellipse', center: { x: ground.x, y: ground.y - bodyH }, rx: bodyW, ry: bodyH });
    shapes.push({ kind: 'circle', center: { x: ground.x + state.facing * bodyW * 0.9, y: ground.y - bodyH * 1.35 }, radius: scale * 0.35 });
    for (const legOffset of [-0.6, -0.2, 0.2, 0.6]) {
      const step = state.action === 'walk' ? Math.sin(worldTime * 8 + legOffset * 3) * 0.3 : 0;
      shapes.push({ kind: 'line', from: { x: ground.x + legOffset * bodyW, y: ground.y - bodyH * 0.5 }, to: { x: ground.x + legOffset * bodyW + step, y: ground.y } });
    }
    if (state.kind === 'monster') {
      shapes.push({ kind: 'polygon', points: [
        { x: ground.x + state.facing * bodyW * 0.7 - scale * 0.15, y: ground.y - bodyH * 1.6 },
        { x: ground.x + state.facing * bodyW * 0.75, y: ground.y - bodyH * 2 },
        { x: ground.x + state.facing * bodyW * 0.85, y: ground.y - bodyH * 1.55 },
      ] });
      shapes.push({ kind: 'circle', center: { x: ground.x + state.facing * bodyW * 0.95, y: ground.y - bodyH * 1.4 }, radius: scale * 0.08 });
    }
    return node(`agent_${state.id}`, `agent_${state.kind}`, 30, ground, shapes, { fill: state.bodyColor, stroke: '#1a1a1a', strokeWidth: 0.4 });
  }

  // Người: đầu + thân + hai chân + hai tay (tay vung theo hành động).
  const headR = scale * 0.22;
  const torsoH = scale * 0.42;
  const torsoW = scale * (0.3 + state.bodyRoundness * 0.14);
  const legPhase = state.action === 'walk' ? Math.sin(worldTime * 8) : 0;
  // Biểu cảm: rung (fear) rung tần số cao, cười/vui nảy cao hơn, khóc trượt xuống.
  const expressiveBob =
    state.action === 'tremble' ? Math.sin(worldTime * 30) * scale * 0.05
    : state.action === 'laugh' || state.action === 'cheer' || state.action === 'celebrate' ? Math.abs(Math.sin(worldTime * 7)) * scale * 0.15
    : state.action === 'cry' ? scale * 0.08
    : state.action === 'bow' ? scale * 0.25
    : bob;
  const headDrop =
    state.action === 'cry' ? scale * 0.12
    : state.action === 'bow' ? scale * 0.3
    : state.action === 'tremble' ? Math.sin(worldTime * 30) * scale * 0.03
    : 0;
  const torsoTop = ground.y - scale + headR * 2 + expressiveBob;

  shapes.push({ kind: 'circle', center: { x: ground.x + sway, y: ground.y - scale - headR + expressiveBob - headDrop }, radius: headR });
  shapes.push({ kind: 'rect', topLeft: { x: ground.x - torsoW / 2 + sway, y: torsoTop }, width: torsoW, height: torsoH });
  // Chân bước.
  shapes.push({ kind: 'line', from: { x: ground.x - torsoW * 0.2 + sway, y: ground.y - scale + headR * 2 + torsoH + bob }, to: { x: ground.x - torsoW * 0.2 + legPhase * 1.2, y: ground.y } });
  shapes.push({ kind: 'line', from: { x: ground.x + torsoW * 0.2 + sway, y: ground.y - scale + headR * 2 + torsoH + bob }, to: { x: ground.x + torsoW * 0.2 - legPhase * 1.2, y: ground.y } });

  // Tay + đạo cụ theo hành động.
  const shoulderY = torsoTop + torsoH * 0.15;
  const swingPhase = worldTime * (state.action === 'chop' || state.action === 'dig' ? 5 : 3);
  const armSwing = state.action === 'idle' ? 0 : Math.sin(swingPhase) * scale * 0.25;
  shapes.push({ kind: 'line', from: { x: ground.x - torsoW * 0.4 + sway, y: shoulderY }, to: { x: ground.x - torsoW * 0.4 - armSwing, y: shoulderY + torsoH * 0.6 } });
  const handX = ground.x + state.facing * (torsoW * 0.4 + armSwing * state.facing);
  const handY = shoulderY + torsoH * 0.6 - Math.abs(armSwing);
  shapes.push({ kind: 'line', from: { x: ground.x + torsoW * 0.4 + sway, y: shoulderY }, to: { x: handX, y: handY } });

  // Đạo cụ.
  if (state.action === 'chop') shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 3, y: handY - 4 } });
  if (state.action === 'dig') shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 1.5, y: handY + 5 } });
  if (state.action === 'sew') shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 2, y: handY - 2 } });
  if (state.action === 'build') shapes.push({ kind: 'rect', topLeft: { x: handX - 1, y: handY - 1 }, width: 2.5, height: 1.2 });
  if (state.action === 'farm') shapes.push({ kind: 'path', points: [{ x: handX, y: handY }, { x: handX + state.facing * 3, y: handY + 1 }, { x: handX + state.facing * 4, y: handY + 4 }], closed: false });
  // Chăn nuôi: gay chan; san bat: cung ten; hai luom: gio day.
  if (state.action === 'herd') shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 4, y: handY - 6 } });
  if (state.action === 'hunt') {
    shapes.push({ kind: 'path', points: [{ x: handX, y: handY - 2 }, { x: handX + state.facing * 4, y: handY - 4 }, { x: handX, y: handY + 2 }], closed: false });
    shapes.push({ kind: 'line', from: { x: handX, y: handY - 2 }, to: { x: handX, y: handY + 2 } });
  }
  if (state.action === 'gather') {
    shapes.push({ kind: 'path', points: [{ x: handX - 1.5, y: handY }, { x: handX + 1.5, y: handY }, { x: handX + 1, y: handY + 2 }, { x: handX - 1, y: handY + 2 }], closed: true });
    shapes.push({ kind: 'circle', center: { x: handX, y: handY + 0.5 }, radius: 0.5 });
  }
  // Chem giat: kiem + tia toe khi vung.
  if (state.action === 'fight') {
    shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 4.5, y: handY - 5 } });
    const clashPhase = (worldTime * 6) % 1;
    if (clashPhase < 0.25) {
      for (let spark = 0; spark < 3; spark++) {
        shapes.push({ kind: 'line', from: { x: handX + state.facing * 4.5, y: handY - 5 }, to: { x: handX + state.facing * (5.5 + spark), y: handY - 5 - spark * 1.5 } });
      }
    }
  }
  // Tu hinh: riu lon ha theo nhip cham.
  if (state.action === 'execute') {
    const chopT = (worldTime * 0.5) % 1;
    const bladeY = handY - 8 + chopT * 10;
    shapes.push({ kind: 'line', from: { x: handX, y: handY }, to: { x: handX + state.facing * 2, y: bladeY } });
    shapes.push({ kind: 'rect', topLeft: { x: handX + state.facing * 1.2, y: bladeY - 1 }, width: 3.5 * state.facing, height: 2.4 });
  }
  if (state.propColor) {
    shapes.push({ kind: 'circle', center: { x: handX, y: handY - 1 }, radius: 1.1 });
  }

  // Biểu cảm khuôn mặt: nước mắt (cry), má hồng (laugh), sao vui (cheer/celebrate).
  const headCX = ground.x + sway;
  const headCY = ground.y - scale - headR + expressiveBob - headDrop;
  if (state.action === 'cry') {
    const tearPhase = (worldTime * 0.8) % 1;
    shapes.push({ kind: 'circle', center: { x: headCX - headR * 0.4, y: headCY + headR * 0.3 + tearPhase * headR * 1.6 }, radius: 0.35 * (1 - tearPhase) + 0.15 });
    shapes.push({ kind: 'circle', center: { x: headCX + headR * 0.4, y: headCY + headR * 0.3 + ((tearPhase + 0.5) % 1) * headR * 1.6 }, radius: 0.35 * (1 - ((tearPhase + 0.5) % 1)) + 0.15 });
  }
  if (state.action === 'laugh') {
    shapes.push({ kind: 'circle', center: { x: headCX - headR * 0.55, y: headCY + headR * 0.15 }, radius: headR * 0.28 });
    shapes.push({ kind: 'circle', center: { x: headCX + headR * 0.55, y: headCY + headR * 0.15 }, radius: headR * 0.28 });
  }
  if (state.action === 'cheer' || state.action === 'celebrate') {
    for (let star = 0; star < 4; star++) {
      const angle = (star / 4) * Math.PI * 2 + worldTime;
      shapes.push({ kind: 'circle', center: { x: headCX + Math.cos(angle) * headR * 1.7, y: headCY + Math.sin(angle) * headR * 1.2 - headR * 0.6 }, radius: 0.35 });
    }
  }

  return node(`agent_${state.id}`, `agent_${state.kind}`, 30, ground, shapes, { fill: state.bodyColor, stroke: '#222', strokeWidth: 0.4 });
}

// ---------------------------------------------------------------------------
// Nước — ao/hồ/sông/bể với sóng sin động
// ---------------------------------------------------------------------------

/** Mặt nước: mép gợn sin theo thời gian + gió, sông có vệt chảy. */
export function renderWater(state: WaterBodyState, weather: WeatherState, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const surface: Vec2[] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const x = state.x - state.width / 2 + (state.width * i) / segments;
    const wave = waveAt(x, worldTime + state.wavePhase, weather.windStrength) * (state.kind === 'pond' ? 0.3 : 1);
    surface.push({ x, y: state.y + wave });
  }
  shapes.push({ kind: 'path', points: [...surface, { x: state.x + state.width / 2, y: state.y + state.depth }, { x: state.x - state.width / 2, y: state.y + state.depth }], closed: true, smooth: false });
  // Sáng phản chiếu dưới mặt nước.
  shapes.push({ kind: 'path', points: surface.map((p) => ({ x: p.x, y: p.y + 1.5 })), closed: false });
  // Sông: vệt dòng chảy.
  if (state.kind === 'river' && state.flowDirection) {
    for (let i = 0; i < 3; i++) {
      const flowPhase = (worldTime * 0.5 + i / 3) % 1;
      const fx = state.x - state.width / 2 + flowPhase * state.width;
      shapes.push({ kind: 'line', from: { x: fx, y: state.y + 2 + i * 1.5 }, to: { x: fx + state.flowDirection * 4, y: state.y + 2 + i * 1.5 } });
    }
  }
  const fill = state.kind === 'sea' ? '#1d4e6b' : state.kind === 'river' ? '#2d6a8a' : '#3a7ca5';
  return node(`water_${state.id}`, 'water', 10, { x: state.x, y: state.y }, shapes, { fill, opacity: 0.85, stroke: '#5b93b3', strokeWidth: 0.4 });
}

// ---------------------------------------------------------------------------
// Ruộng đồng — lúa xanh non đến chín vàng theo giai đoạn
// ---------------------------------------------------------------------------

/** Ruộng: bờ ruộng + hàng lúa + mặt nước phản chiếu, màu theo cropGrowth. */
export function renderRiceField(state: RiceFieldState, weather: WeatherState, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const fieldHeight = state.rows * 2.2 + 2;
  shapes.push({ kind: 'rect', topLeft: { x: state.x - state.width / 2, y: state.y - fieldHeight }, width: state.width, height: fieldHeight });
  // Màu lúa: xanh non → vàng chín.
  const green = Math.round(120 + (1 - state.cropGrowth) * 80);
  const red = Math.round(60 + state.cropGrowth * 160);
  const riceColor = `rgb(${red},${green},60)`;
  for (let row = 0; row < state.rows; row++) {
    const rowY = state.y - fieldHeight + 2 + row * 2.2;
    // Bờ ruộng.
    shapes.push({ kind: 'line', from: { x: state.x - state.width / 2, y: rowY - 1 }, to: { x: state.x + state.width / 2, y: rowY - 1 } });
    for (let i = 0; i < Math.floor(state.width / 3); i++) {
      const plantX = state.x - state.width / 2 + 1.5 + i * 3;
      const plantH = 0.5 + state.cropGrowth * 2.2;
      const sway = swayAt(plantX, worldTime, weather.windStrength) * 0.6 * state.cropGrowth;
      shapes.push({ kind: 'line', from: { x: plantX, y: rowY }, to: { x: plantX + sway, y: rowY - plantH } });
      // Bông lúa khi chín.
      if (state.cropGrowth > 0.8) {
        shapes.push({ kind: 'circle', center: { x: plantX + sway, y: rowY - plantH }, radius: 0.5 });
      }
    }
  }
  return node(`rice_${state.id}`, 'rice_field', 12, { x: state.x, y: state.y }, shapes, { fill: `rgba(90,140,180,${0.35 + state.cropGrowth * 0.2})`, stroke: '#7a6a4a', strokeWidth: 0.5 });
}

// ---------------------------------------------------------------------------
// Núi/đồi từ heightmap + núi lửa phun trào
// ---------------------------------------------------------------------------

/** Đường viền terrain từ heightmap — đồi/núi tự nhiên. */
export function renderTerrain(heights: number[], baseY: number, seed: number): SceneNode {
  const points: Vec2[] = [{ x: 0, y: baseY + 5 }];
  for (let i = 0; i < heights.length; i++) {
    points.push({ x: i, y: baseY - heights[i] });
  }
  points.push({ x: heights.length - 1, y: baseY + 5 });
  return node('terrain', 'terrain', 5, { x: 0, y: baseY }, [{ kind: 'polygon', points }], { fill: '#6b7a4a', stroke: '#4a5533', strokeWidth: 0.6 });
}

/** Núi lửa: nón + miệng + phun trào (mảnh lửa bay theo t, dung岩 chảy xuống sườn). */
export function renderVolcano(state: VolcanoState, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const halfW = state.width / 2;
  const craterHalfW = halfW * 0.18;
  shapes.push({
    kind: 'polygon',
    points: [
      { x: state.x - halfW, y: state.y },
      { x: state.x - craterHalfW, y: state.y - state.height },
      { x: state.x + craterHalfW, y: state.y - state.height },
      { x: state.x + halfW, y: state.y },
    ],
  });
  // Hoạt động: ánh đỏ trong miệng.
  shapes.push({ kind: 'ellipse', center: { x: state.x, y: state.y - state.height }, rx: craterHalfW, ry: craterHalfW * 0.35 });
  if (state.erupting) {
    // Mảnh lửa bay lên: vị trí tự tính theo t = (time*speed + i/n) % 1.
    const particles = 12;
    for (let i = 0; i < particles; i++) {
      const t = (worldTime * 0.35 + i / particles) % 1;
      const angle = hashSeedAngle(state.x, i);
      const px = state.x + Math.cos(angle) * t * state.width * 0.5;
      const py = state.y - state.height - Math.sin(t * Math.PI) * state.height * (0.6 + (i % 3) * 0.25);
      shapes.push({ kind: 'circle', center: { x: px, y: py }, radius: 0.8 + (1 - t) * 1.6 });
    }
    // Dòng dung岩 chảy xuống hai sườn.
    for (const side of [-1, 1] as const) {
      shapes.push({
        kind: 'path',
        points: [
          { x: state.x + side * craterHalfW, y: state.y - state.height },
          { x: state.x + side * halfW * 0.55, y: state.y - state.height * 0.45 },
          { x: state.x + side * halfW * 0.8, y: state.y },
        ],
        closed: false,
      });
    }
  }
  const glow = state.activity;
  return node(`volcano_${state.id}`, 'volcano', 6, { x: state.x, y: state.y }, shapes, {
    fill: '#4a3a35',
    stroke: glow > 0.5 ? `rgba(255,${Math.round(90 - glow * 40)},20,1)` : '#332822',
    strokeWidth: glow > 0.5 ? 1.2 : 0.6,
  });
}

// ---------------------------------------------------------------------------
// Phe tich — do vo, chon lap, xay lai tren nen cu (lop lich su)
// ---------------------------------------------------------------------------

/**
 * Phe tich: tuong sup nghieng theo collapse, gach vun vang quanh, dat vui theo
 * buried che dan, va khi rebuilding thi gian giao moi moc ngay tren nen cu.
 */
export function renderRuin(state: RuinState, weather: WeatherState, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const w = state.width;
  const h = state.height;
  const base = { x: state.x, y: state.y };
  const collapse = clamp01Local(state.collapse);
  const buried = clamp01Local(state.buried);

  const standingH = h * (1 - collapse * 0.85);
  if (standingH > 1) {
    const tilt = (noise2D(state.x, state.x, 313) - 0.5) * collapse * 6;
    shapes.push({
      kind: 'polygon',
      points: [
        { x: state.x - w / 2, y: base.y },
        { x: state.x - w / 2 + tilt, y: base.y - standingH },
        { x: state.x + w * 0.15 + tilt, y: base.y - standingH * 0.9 },
        { x: state.x + w * 0.25, y: base.y },
      ],
    });
  }
  const debrisCount = Math.round(collapse * 8);
  for (let i = 0; i < debrisCount; i++) {
    const dx = (noise2D(i * 2.7, state.x, 91) - 0.5) * w * 1.6;
    const size = 0.8 + noise2D(i * 3.3, state.x, 92) * 1.8;
    shapes.push({ kind: 'rect', topLeft: { x: state.x + dx - size / 2, y: base.y - size }, width: size, height: size });
  }
  if (buried > 0.02) {
    const moundH = buried * h * 0.6;
    shapes.push({
      kind: 'polygon',
      points: blobPoints({ x: state.x, y: base.y - moundH * 0.3 }, w * (0.55 + buried * 0.2), Math.round(state.x), 0.25, 12),
    });
    for (let blade = 0; blade < 5; blade++) {
      const gx = state.x - w * 0.4 + blade * (w * 0.2);
      shapes.push({ kind: 'line', from: { x: gx, y: base.y - moundH * 0.55 }, to: { x: gx + swayAt(gx, worldTime, weather.windStrength) * 0.4, y: base.y - moundH * 0.55 - 1.5 } });
    }
  }
  if (state.rebuilding) {
    shapes.push({ kind: 'line', from: { x: state.x - w / 2 - 2, y: base.y }, to: { x: state.x - w / 2 - 2, y: base.y - h * 0.8 } });
    shapes.push({ kind: 'line', from: { x: state.x + w / 2 + 2, y: base.y }, to: { x: state.x + w / 2 + 2, y: base.y - h * 0.8 } });
    shapes.push({ kind: 'line', from: { x: state.x - w / 2 - 2, y: base.y - h * 0.5 }, to: { x: state.x + w / 2 + 2, y: base.y - h * 0.5 } });
    shapes.push({ kind: 'rect', topLeft: { x: state.x - w * 0.25, y: base.y - h * 0.35 }, width: w * 0.5, height: h * 0.35 });
  }

  const fade = clamp01Local(1 - collapse * 0.4 - buried * 0.3);
  return node(`ruin_${state.id}`, 'ruin', 21, base, shapes, {
    fill: state.originalWallColor,
    stroke: '#4a3a2a',
    strokeWidth: 0.6,
    opacity: 0.35 + fade * 0.65,
  });
}

// ---------------------------------------------------------------------------
// Su kien xa hoi: chem giat, tu hinh, chon lap, tai xay — marker chung
// ---------------------------------------------------------------------------

/** Chem giat: hai agent giao kiem + tia lua dam cheo, vet mau theo intensity. */
export function renderBattle(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const clashPhase = (worldTime * 4) % 1;
  const clashX = event.x + Math.sin(worldTime * 5) * 1.5;
  for (const side of [-1, 1] as const) {
    const px = clashX + side * 4;
    shapes.push({ kind: 'circle', center: { x: px, y: event.y - 6.5 }, radius: 0.8 });
    shapes.push({ kind: 'rect', topLeft: { x: px - 0.9, y: event.y - 5.7 }, width: 1.8, height: 3.4 });
    shapes.push({ kind: 'line', from: { x: px, y: event.y - 4.5 }, to: { x: clashX, y: event.y - 6 } });
    shapes.push({ kind: 'line', from: { x: px - side * 0.5, y: event.y - 5.2 }, to: { x: px - side * 2, y: event.y } });
  }
  if (clashPhase < 0.3) {
    for (let spark = 0; spark < 4; spark++) {
      const angle = -Math.PI / 2 + (spark - 1.5) * 0.5;
      shapes.push({
        kind: 'line',
        from: { x: clashX, y: event.y - 6 },
        to: { x: clashX + Math.cos(angle) * 2.5, y: event.y - 6 + Math.sin(angle) * 2.5 },
      });
    }
  }
  if (event.intensity > 0.5) {
    shapes.push({ kind: 'ellipse', center: { x: clashX, y: event.y + 0.5 }, rx: 3 * event.intensity, ry: 0.7 });
  }
  return node(`battle_${event.x}`, 'battle', 37, { x: event.x, y: event.y }, shapes, {
    fill: '#8a4a3a',
    stroke: '#33201a',
    strokeWidth: 0.5,
  });
}

/** Tu hinh: dai go, luoi riu ha theo t, hanh khach quy, dao phu, dam dong cui dau. */
export function renderExecution(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const t = Math.max(0, Math.min(1, event.t));
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 6, y: event.y - 3 }, width: 12, height: 3 });
  shapes.push({ kind: 'line', from: { x: event.x - 5, y: event.y }, to: { x: event.x - 4.2, y: event.y + 3 } });
  shapes.push({ kind: 'line', from: { x: event.x + 5, y: event.y }, to: { x: event.x + 4.2, y: event.y + 3 } });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 0.7, y: event.y - 14 }, width: 1.4, height: 11 });
  const bladeY = event.y - 3.4 - (1 - t) * 8;
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 2.2, y: bladeY }, width: 4.4, height: 1.8 });
  shapes.push({ kind: 'circle', center: { x: event.x, y: event.y - 5.2 }, radius: 0.7 });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 0.8, y: event.y - 4.6 }, width: 1.6, height: 1.6 });
  shapes.push({ kind: 'circle', center: { x: event.x - 4.5, y: event.y - 9.5 }, radius: 0.8 });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 5.3, y: event.y - 8.8 }, width: 1.6, height: 3.6 });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 4.2, y: bladeY - 0.4 }, width: 2.2, height: 1.2 });
  const crowd = Math.round(6 + event.intensity * 6);
  for (let i = 0; i < crowd; i++) {
    const px = event.x - 10 + (i / crowd) * 20;
    shapes.push({ kind: 'circle', center: { x: px, y: event.y + 0.6 }, radius: 0.5 });
    shapes.push({ kind: 'rect', topLeft: { x: px - 0.45, y: event.y + 1 }, width: 0.9, height: 1.6 });
  }
  if (t > 0.96) {
    shapes.push({ kind: 'rect', topLeft: { x: event.x - 2, y: event.y - 3.2 }, width: 4, height: 0.6 });
  }
  return node(`execution_${event.x}`, 'execution', 38, { x: event.x, y: event.y }, shapes, {
    fill: '#5a3a2a',
    stroke: '#241a12',
    strokeWidth: 0.5,
  });
}

/** Chon lap: nam dat moi dap, bia da + hoa theo intensity, nguoi than tien. */
export function renderBurial(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const moundH = 2 + event.intensity * 2.5;
  shapes.push({ kind: 'polygon', points: blobPoints({ x: event.x, y: event.y - moundH * 0.35 }, 4 + event.intensity * 2, Math.round(event.x), 0.25, 12) });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 1, y: event.y - moundH - 4 }, width: 2, height: 4 });
  if (event.intensity > 0.4) {
    for (let flower = 0; flower < 3; flower++) {
      const fx = event.x - 1.5 + flower * 1.5;
      shapes.push({ kind: 'line', from: { x: fx, y: event.y - moundH * 0.5 }, to: { x: fx, y: event.y - moundH * 0.5 - 1.4 } });
      shapes.push({ kind: 'circle', center: { x: fx, y: event.y - moundH * 0.5 - 1.7 }, radius: 0.4 });
    }
  }
  const mourners = Math.round(3 + event.intensity * 5);
  for (let i = 0; i < mourners; i++) {
    const mx = event.x - 8 + (i / Math.max(1, mourners - 1)) * 16;
    const grief = Math.sin(worldTime * 0.8 + i) * 0.15;
    shapes.push({ kind: 'circle', center: { x: mx, y: event.y - 4.6 + grief }, radius: 0.55 });
    shapes.push({ kind: 'rect', topLeft: { x: mx - 0.5, y: event.y - 4.1 + grief }, width: 1, height: 2 });
  }
  return node(`burial_${event.x}`, 'burial', 37, { x: event.x, y: event.y }, shapes, {
    fill: '#6a5636',
    stroke: '#3a2c1c',
    strokeWidth: 0.5,
  });
}

/** Tai xay tren phe tich: tuong moi moc theo t, gian giao, can cau nang da, tho tren gian. */
export function renderRebuilding(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const progress = Math.max(0, Math.min(1, event.t));
  const w = 10 + event.intensity * 6;
  const h = 6 + event.intensity * 4;
  const wallH = h * progress;
  shapes.push({ kind: 'rect', topLeft: { x: event.x - w / 2, y: event.y - wallH }, width: w, height: wallH });
  for (const side of [-1, 1] as const) {
    shapes.push({ kind: 'line', from: { x: event.x + side * (w / 2 + 2), y: event.y }, to: { x: event.x + side * (w / 2 + 2), y: event.y - h * 1.1 } });
  }
  shapes.push({ kind: 'line', from: { x: event.x - w / 2 - 2, y: event.y - h * 0.7 }, to: { x: event.x + w / 2 + 2, y: event.y - h * 0.7 } });
  shapes.push({ kind: 'line', from: { x: event.x + w / 2 + 4, y: event.y }, to: { x: event.x + w / 2 + 4, y: event.y - h * 1.4 } });
  shapes.push({ kind: 'line', from: { x: event.x + w / 2 + 4, y: event.y - h * 1.4 }, to: { x: event.x + w / 2 - 2, y: event.y - h * 1.3 } });
  const lift = Math.sin(worldTime * 0.8) * 0.5 + 0.5;
  const blockY = event.y - h * (0.6 + lift * 0.5);
  shapes.push({ kind: 'line', from: { x: event.x + w / 2 - 2, y: event.y - h * 1.3 }, to: { x: event.x + w / 2 - 2, y: blockY } });
  shapes.push({ kind: 'rect', topLeft: { x: event.x + w / 2 - 3.2, y: blockY }, width: 2.4, height: 1.6 });
  shapes.push({ kind: 'circle', center: { x: event.x - w / 2 + 1, y: event.y - h * 0.7 - 1 }, radius: 0.5 });
  shapes.push({ kind: 'rect', topLeft: { x: event.x - w / 2 + 0.6, y: event.y - h * 0.7 - 0.55 }, width: 0.9, height: 1.6 });
  return node(`rebuild_${event.x}`, 'rebuilding', 38, { x: event.x, y: event.y }, shapes, {
    fill: '#d8c49a',
    stroke: '#6a5a3a',
    strokeWidth: 0.5,
  });
}

function hashSeedAngle(x: number, i: number): number {
  return ((Math.imul(Math.round(x * 31 + i), 2654435761) >>> 16) % 1000) / 1000 * Math.PI - Math.PI / 2;
}

// ---------------------------------------------------------------------------
// Hang động — miệng vòm + lòng hang + nhũ đá, hình dáng tự sinh từ noise
// ---------------------------------------------------------------------------

/**
 * Render hang động: miệng vòm đá mép gợn theo noise (mỗi hang một dáng),
 * lòng hang tối dần theo depth, nhũ đá (stalactites) rũ từ trần — toàn bộ
 * toạ độ tự tính từ `state.seed`, không hai hang giống nhau.
 */
export function renderCave(state: CaveState): SceneNode {
  const shapes: Shape[] = [];
  const halfW = state.width / 2;
  const mouthTop = state.y - state.width * 0.55;
  // Lòng hang: khối tối hình vòm hõm vào vách đá.
  const caveMouth: Vec2[] = [];
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = Math.PI - t * Math.PI; // vòm từ trái sang phải
    const wobble = (noise2D(Math.cos(angle) * 3 + state.seed, Math.sin(angle) * 3, state.seed) - 0.5) * state.width * 0.22;
    caveMouth.push({
      x: state.x + Math.cos(angle) * halfW + wobble,
      y: state.y - Math.sin(angle) * halfW * 0.85 + (noise2D(i * 1.7, state.seed, state.seed) - 0.5) * 2,
    });
  }
  shapes.push({ kind: 'polygon', points: [...caveMouth, { x: state.x + halfW * 0.7, y: state.y }, { x: state.x - halfW * 0.7, y: state.y }] });
  // Lòng tối hơn theo depth.
  const darkness = clamp01Local(state.depth / 20);
  shapes.push({ kind: 'polygon', points: blobPoints({ x: state.x, y: state.y - halfW * 0.32 }, halfW * 0.55, state.seed + 13, 0.4, 12) });
  // Nhũ đá từ trần vòm — số lượng tỉ lệ bề rộng, độ dài tự sinh theo noise.
  const stalactites = Math.max(3, Math.round(state.width / 2));
  for (let i = 1; i < stalactites; i++) {
    const t = i / stalactites;
    const sx = state.x - halfW * 0.7 + t * state.width * 0.7;
    const roofY = mouthTop + Math.sin(t * Math.PI) * state.width * 0.18;
    const length = 1 + noise2D(i * 3.3, state.seed, state.seed) * halfW * 0.5;
    shapes.push({ kind: 'polygon', points: [
      { x: sx - 0.7, y: roofY },
      { x: sx, y: roofY + length },
      { x: sx + 0.7, y: roofY },
    ] });
  }
  return node(`cave_${state.id}`, 'cave', 8, { x: state.x, y: state.y }, shapes, {
    fill: '#2a2320',
    stroke: '#4d4038',
    strokeWidth: 0.8,
    opacity: 1 - darkness * 0.35,
  });
}

function clamp01Local(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ---------------------------------------------------------------------------
// Sự kiện còn lại: meteor, earthquake, harvest_festival, random_event
// ---------------------------------------------------------------------------

/** Meteor: đầu lửa + đuôi khói cắt trời theo t, khi t → 1 thì nổ chạm đất. */
export function renderMeteor(event: WorldEventMark, worldTime: number): SceneNode {
  const t = Math.max(0, Math.min(1, event.t));
  // Bay chéo từ trên cao xuống vị trí đích.
  const startX = event.x - 40;
  const startY = event.y - 55;
  const headX = startX + (event.x - startX) * t;
  const headY = startY + (event.y - startY) * t;
  const shapes: Shape[] = [];
  // Đuôi lửa — tam giác mờ dần về phía sau.
  shapes.push({
    kind: 'polygon',
    points: [
      { x: headX - 7, y: headY - 12 },
      { x: headX, y: headY },
      { x: headX - 2, y: headY - 14 },
    ],
  });
  shapes.push({ kind: 'circle', center: { x: headX, y: headY }, radius: 1.6 + event.intensity });
  // Tia lửa văng quanh đầu.
  for (let i = 0; i < 5; i++) {
    const sparkPhase = (worldTime * 0.9 + i / 5) % 1;
    shapes.push({ kind: 'circle', center: { x: headX - sparkPhase * 6, y: headY - sparkPhase * 8 }, radius: 0.4 * (1 - sparkPhase) + 0.2 });
  }
  // Vết va chạm khi sắp chạm đất.
  if (t > 0.92) {
    shapes.push({ kind: 'ellipse', center: { x: event.x, y: event.y }, rx: event.intensity * 10, ry: event.intensity * 2.5 });
  }
  return node(`meteor_${event.x}`, 'meteor', 42, { x: headX, y: headY }, shapes, { fill: '#ff8c3a', stroke: '#ffd27a', strokeWidth: 0.5 });
}

/** Động đất: vết nứt đất zigzag tự sinh + rung lệch vị trí theo t. */
export function renderEarthquake(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const shake = Math.sin(worldTime * 25) * event.intensity * 1.2;
  // Vết nứt chính: zigzag từ tâm rung lan hai bên.
  const crack: Vec2[] = [];
  const segments = 10;
  for (let i = 0; i <= segments; i++) {
    const x = event.x - 20 + (i / segments) * 40;
    const jitter = (noise2D(i * 2.1, event.y, 77) - 0.5) * 6;
    crack.push({ x: x + shake * (1 - i / segments), y: event.y + jitter });
  }
  shapes.push({ kind: 'path', points: crack, closed: false });
  // Nhánh nứt phụ.
  for (const branchT of [0.25, 0.55, 0.8]) {
    const origin = crack[Math.round(branchT * segments)];
    shapes.push({ kind: 'line', from: origin, to: { x: origin.x + 3 * (branchT > 0.5 ? 1 : -1), y: origin.y + 4 } });
  }
  return node(`earthquake_${event.x}`, 'earthquake', 41, { x: event.x, y: event.y }, shapes, {
    stroke: '#241d18',
    strokeWidth: 1 + event.intensity,
  });
}

/** Lễ hội mùa màng: cờ tam giác + đèn lồng + vòng đám đông quanh cột lễ. */
export function renderHarvestFestival(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const sway = swayAt(event.x, worldTime, 0.4) * 0.5;
  // Cột lễ trung tâm.
  shapes.push({ kind: 'rect', topLeft: { x: event.x - 0.6, y: event.y - 14 }, width: 1.2, height: 14 });
  // Cờ tam giác xà ngang — lay theo thời gian.
  shapes.push({ kind: 'line', from: { x: event.x - 8, y: event.y - 13 }, to: { x: event.x + 8 + sway, y: event.y - 12 } });
  for (let flag = 0; flag < 6; flag++) {
    const fx = event.x - 7 + flag * 2.8;
    const flutter = Math.sin(worldTime * 3 + flag) * 0.4;
    shapes.push({ kind: 'polygon', points: [
      { x: fx, y: event.y - 12.6 },
      { x: fx + 1.4, y: event.y - 12.6 },
      { x: fx + 0.7 + flutter, y: event.y - 11.2 },
    ] });
  }
  // Đèn lồng đỏ treo hai bên — lắc lư.
  for (const side of [-1, 1] as const) {
    const lanternSway = Math.sin(worldTime * 2.2 + (side > 0 ? 1.5 : 0)) * 0.8;
    shapes.push({ kind: 'circle', center: { x: event.x + side * 5 + lanternSway, y: event.y - 10.5 }, radius: 1.1 });
  }
  // Đám đông vòng tròn quanh cột (mỗi người một chấm đầu + thân).
  const crowd = Math.round(6 + event.intensity * 8);
  for (let i = 0; i < crowd; i++) {
    const angle = (i / crowd) * Math.PI * 2;
    const radius = 6 + noise2D(i, event.y, 55) * 2.5;
    const px = event.x + Math.cos(angle) * radius;
    const py = event.y - Math.abs(Math.sin(angle)) * 1.5;
    shapes.push({ kind: 'circle', center: { x: px, y: py - 2.4 }, radius: 0.55 });
    shapes.push({ kind: 'rect', topLeft: { x: px - 0.5, y: py - 1.9 }, width: 1, height: 1.9 });
  }
  // Bó lúa trang trí chân cột khi intensity cao.
  if (event.intensity > 0.5) {
    for (const side of [-1, 1] as const) {
      shapes.push({ kind: 'path', points: [
        { x: event.x + side * 1.2, y: event.y },
        { x: event.x + side * 2.2, y: event.y - 3 },
        { x: event.x + side * 1.6, y: event.y - 3.4 },
      ], closed: false });
    }
  }
  return node(`festival_${event.x}`, 'harvest_festival', 36, { x: event.x, y: event.y }, shapes, {
    fill: '#d4a017',
    stroke: '#8a5a1a',
    strokeWidth: 0.5,
  });
}

/** Sự kiện ngẫu nhiên hệ thống: marker xoay + dấu ? — đại diện mọi sự kiện lạ. */
export function renderRandomEvent(event: WorldEventMark, worldTime: number): SceneNode {
  const shapes: Shape[] = [];
  const bob = Math.sin(worldTime * 2) * 1.2;
  const spin = (worldTime * 40) % 360;
  // Vòng xoay nét đứt — hình thoi quay quanh tâm.
  const diamond: Vec2[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = ((spin + i * 90) * Math.PI) / 180;
    diamond.push({ x: event.x + Math.cos(angle) * 4, y: event.y - 12 + Math.sin(angle) * 4 });
  }
  shapes.push({ kind: 'path', points: diamond, closed: true });
  // Dấu ? làm từ path (câu hỏi) — nét đơn.
  shapes.push({ kind: 'path', points: [
    { x: event.x - 1.2, y: event.y - 14.5 + bob },
    { x: event.x - 1.4, y: event.y - 15.8 + bob },
    { x: event.x, y: event.y - 16.4 + bob },
    { x: event.x + 1.4, y: event.y - 15.8 + bob },
    { x: event.x + 0.6, y: event.y - 14.6 + bob },
    { x: event.x + 0.6, y: event.y - 13.8 + bob },
  ], closed: false });
  shapes.push({ kind: 'circle', center: { x: event.x + 0.6, y: event.y - 13.2 + bob }, radius: 0.35 });
  return node(`random_${event.x}`, 'random_event', 43, { x: event.x, y: event.y }, shapes, {
    stroke: `rgba(200,120,255,${0.5 + event.intensity * 0.5})`,
    strokeWidth: 0.7,
  });
}

/** Sóng thần: bức tường nước cao tiến dần vào bờ theo t, bọt trắng đỉnh sóng. */
export function renderTsunami(event: WorldEventMark, worldTime: number): SceneNode {
  const t = Math.max(0, Math.min(1, event.t));
  const waveHeight = 6 + event.intensity * 22;
  const waveX = event.x + (1 - t) * 60; // tiến dần vào bờ
  const shapes: Shape[] = [{
    kind: 'path',
    points: [
      { x: waveX - 18, y: event.y },
      { x: waveX - 6, y: event.y - waveHeight * 0.6 },
      { x: waveX, y: event.y - waveHeight },
      { x: waveX + 6, y: event.y - waveHeight * 0.6 },
      { x: waveX + 18, y: event.y },
      { x: waveX + 18, y: event.y + 10 },
      { x: waveX - 18, y: event.y + 10 },
    ],
    closed: true,
  }];
  // Bọt trắng trên đỉnh.
  for (let i = 0; i < 6; i++) {
    shapes.push({ kind: 'circle', center: { x: waveX - 5 + i * 2 + waveAt(waveX + i, worldTime, 0.8) * 0.3, y: event.y - waveHeight + Math.sin(worldTime * 3 + i) * 0.4 }, radius: 0.8 });
  }
  return node(`tsunami_${event.x}`, 'tsunami', 40, { x: waveX, y: event.y }, shapes, { fill: 'rgba(30,90,130,0.9)', stroke: '#cfe8f5', strokeWidth: 0.8 });
}

/** Vệt gió hiển thị: đường cong mờ bay theo hướng gió. */
export function renderWindStreaks(weather: WeatherState, worldTime: number, viewport: { x: number; width: number; y: number; height: number }): SceneNode {
  const shapes: Shape[] = [];
  const dir = Math.sign(weather.windStrength) || 1;
  const strength = Math.abs(weather.windStrength);
  if (strength < 0.1) return node('wind', 'wind', 35, { x: viewport.x, y: viewport.y }, [], {});
  for (let i = 0; i < 8; i++) {
    const phase = (worldTime * 0.15 * strength + i / 8) % 1;
    const startX = viewport.x + phase * viewport.width;
    const y = viewport.y + 8 + ((i * 37) % Math.max(1, Math.floor(viewport.height)));
    const len = 6 + strength * 10;
    shapes.push({
      kind: 'path',
      points: [
        { x: startX, y },
        { x: startX + dir * len * 0.5, y: y - 1.5 },
        { x: startX + dir * len, y },
      ],
      closed: false,
    });
  }
  return node('wind', 'wind', 35, { x: viewport.x, y: viewport.y }, shapes, { stroke: 'rgba(255,255,255,0.35)', strokeWidth: 0.6 });
}

/** Màu bầu trời theo giờ trong ngày — gradient hai tông tự tính. */
export function skyColors(timeOfDay: number): { top: string; bottom: string } {
  const t = ((timeOfDay % 24) + 24) % 24;
  if (t < 5) return { top: '#0a0e1e', bottom: '#141a30' }; // đêm khuya
  if (t < 7) return { top: '#2c3e6b', bottom: '#e8925a' }; // bình minh
  if (t < 17) return { top: '#4a90d9', bottom: '#a8d4f0' }; // ban ngày
  if (t < 19) return { top: '#4a3a7a', bottom: '#e8703a' }; // hoàng hôn
  return { top: '#0a0e1e', bottom: '#141a30' }; // đêm
}

/** Mưa: vệtRain rơi — density theo intensity. */
export function renderRain(weather: WeatherState, worldTime: number, viewport: { x: number; width: number; y: number; height: number }): SceneNode {
  const shapes: Shape[] = [];
  const drops = Math.round(weather.rainIntensity * 60);
  for (let i = 0; i < drops; i++) {
    const phase = (worldTime * 0.8 + hash2(i, 7, 12345)) % 1;
    const x = viewport.x + hash2(i, 3, 999) * viewport.width;
    const y = viewport.y + phase * viewport.height;
    shapes.push({ kind: 'line', from: { x, y }, to: { x: x - 0.6, y: y + 2.2 } });
  }
  return node('rain', 'rain', 45, { x: viewport.x, y: viewport.y }, shapes, { stroke: 'rgba(180,210,240,0.6)', strokeWidth: 0.35 });
}

// kết xuất metadata tiện dụng
export function describeNodeKind(kind: string): string {
  return kind;
}
void circlePoints;
void noise2D;
