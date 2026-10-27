/**
 * @file scene.ts
 * @module @aetheria/engine/worldview/scene
 * @description SceneAssembler: dựng toàn bộ scene từ trạng thái thế giới — tự
 * sắp z-order (trời → terrain → nước → ruộng → núi lửa → cây/nhà → agent →
 * hiệu ứng → mưa), tự culling theo camera, tự căn sâu theo y; và bộ render
 * SVG chính xác (vector, viewBox theo camera) — không dùng tệp render có sẵn.
 */

import type { Camera, SceneLayoutNode, SceneNode, Shape, WorldRenderState } from './types.js';
import { boundsIntersect, nodeBounds } from './geometry.js';
import {
  renderAgent,
  renderCave,
  renderRuin,
  renderBattle,
  renderExecution,
  renderBurial,
  renderRebuilding,
  renderHouse,
  renderMeteor,
  renderEarthquake,
  renderHarvestFestival,
  renderRandomEvent,
  renderRain,
  renderRiceField,
  renderTerrain,
  renderTree,
  renderVolcano,
  renderWater,
  renderWindStreaks,
  renderTsunami,
  skyColors,
} from './entities.js';

/** Assemble scene: mọi node tự sinh từ state, sắp z, culling theo camera. */
export function assembleScene(world: WorldRenderState, camera: Camera): SceneLayoutNode[] {
  const nodes: SceneNode[] = [];

  // Trời — luôn phủ toàn viewport.
  const sky = skyColors(world.weather.timeOfDay);
  nodes.push({
    id: 'sky',
    kind: 'sky',
    z: -1,
    origin: { x: camera.x, y: camera.y },
    shapes: [{ kind: 'rect', topLeft: { x: camera.x, y: camera.y }, width: camera.width, height: camera.height }],
    style: { fill: sky.bottom },
  });

  // Terrain.
  if (world.terrainHeights.length > 0) {
    nodes.push(renderTerrain(world.terrainHeights, camera.y + camera.height * 0.75, Math.round(world.terrainHeights.length)));
  }

  // Nước.
  for (const water of world.waters) nodes.push(renderWater(water, world.weather, world.worldTime));
  // Ruộng.
  for (const field of world.riceFields) nodes.push(renderRiceField(field, world.weather, world.worldTime));
  // Núi lửa.
  for (const volcano of world.volcanos) nodes.push(renderVolcano(volcano, world.worldTime));
  // Hang động — cùng lớp với terrain chi tiết.
  for (const cave of world.caves) nodes.push(renderCave(cave));
  // Phe tich — do vo / chon lap / tai xay (lop lich su).
  for (const ruin of world.ruins) nodes.push(renderRuin(ruin, world.weather, world.worldTime));
  // Cây.
  for (const tree of world.trees) nodes.push(renderTree(tree, world.weather, world.worldTime));
  // Nhà.
  for (const house of world.houses) nodes.push(renderHouse(house, world.weather, world.worldTime));
  // Agent — sắp sâu theo y: y nhỏ (xa) vẽ trước.
  const sortedAgents = [...world.agents].sort((a, b) => a.y - b.y);
  for (const agent of sortedAgents) nodes.push(renderAgent(agent, world.weather, world.worldTime));
  // Sự kiện: sóng thần, meteor, động đất, lễ hội, sự kiện ngẫu nhiên hệ thống.
  for (const event of world.events) {
    switch (event.kind) {
      case 'tsunami':
        nodes.push(renderTsunami(event, world.worldTime));
        break;
      case 'meteor':
        nodes.push(renderMeteor(event, world.worldTime));
        break;
      case 'earthquake':
        nodes.push(renderEarthquake(event, world.worldTime));
        break;
      case 'harvest_festival':
        nodes.push(renderHarvestFestival(event, world.worldTime));
        break;
      case 'execution':
        nodes.push(renderExecution(event, world.worldTime));
        break;
      case 'battle':
        nodes.push(renderBattle(event, world.worldTime));
        break;
      case 'burial':
        nodes.push(renderBurial(event, world.worldTime));
        break;
      case 'rebuilding':
        nodes.push(renderRebuilding(event, world.worldTime));
        break;
      case 'random_event':
      case 'eruption':
        nodes.push(renderRandomEvent(event, world.worldTime));
        break;
    }
  }
  // Gió + mưa.
  nodes.push(renderWindStreaks(world.weather, world.worldTime, { x: camera.x, width: camera.width, y: camera.y, height: camera.height }));
  if (world.weather.rainIntensity > 0.05) {
    nodes.push(renderRain(world.weather, world.worldTime, { x: camera.x, width: camera.width, y: camera.y, height: camera.height }));
  }

  // Culling + sắp z (trong cùng z thì sắp theo y gốc — gần camera vẽ sau).
  const cameraBounds = { minX: camera.x, minY: camera.y, maxX: camera.x + camera.width, maxY: camera.y + camera.height };
  const layout: SceneLayoutNode[] = nodes.map((node) => {
    const bounds = node.shapes.length > 0 ? nodeBounds(node.shapes) : nodeBounds([]);
    return { node, visible: boundsIntersect(bounds, cameraBounds) };
  });
  layout.sort((a, b) => a.node.z - b.node.z || a.node.origin.y - b.node.origin.y);
  return layout;
}

// ---------------------------------------------------------------------------
// SVG renderer — vector chính xác, viewBox theo camera
// ---------------------------------------------------------------------------

function shapeToSvg(shape: Shape, style: { fill?: string; stroke?: string; strokeWidth?: number; cornerRadius?: number; opacity?: number }): string {
  const attrs = (extra = ''): string => {
    const parts: string[] = [];
    if (style.fill) parts.push(`fill="${style.fill}"`);
    if (style.stroke) parts.push(`stroke="${style.stroke}"`);
    if (style.strokeWidth) parts.push(`stroke-width="${style.strokeWidth}"`);
    if (style.opacity !== undefined) parts.push(`opacity="${style.opacity}"`);
    parts.push(extra);
    return parts.filter(Boolean).join(' ');
  };
  switch (shape.kind) {
    case 'circle':
      return `<circle cx="${round(shape.center.x)}" cy="${round(shape.center.y)}" r="${round(shape.radius)}" ${attrs()} />`;
    case 'ellipse': {
      const rotation = shape.rotationDeg ? ` transform="rotate(${shape.rotationDeg} ${round(shape.center.x)} ${round(shape.center.y)})"` : '';
      return `<ellipse cx="${round(shape.center.x)}" cy="${round(shape.center.y)}" rx="${round(shape.rx)}" ry="${round(shape.ry)}" ${attrs()}${rotation} />`;
    }
    case 'rect':
      return `<rect x="${round(shape.topLeft.x)}" y="${round(shape.topLeft.y)}" width="${round(shape.width)}" height="${round(shape.height)}"${style.cornerRadius ? ` rx="${style.cornerRadius}"` : ''} ${attrs()} />`;
    case 'polygon':
      return `<polygon points="${shape.points.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')}" ${attrs()} />`;
    case 'line':
      return `<line x1="${round(shape.from.x)}" y1="${round(shape.from.y)}" x2="${round(shape.to.x)}" y2="${round(shape.to.y)}" ${attrs()} />`;
    case 'path': {
      const d = shape.points.map((p, index) => `${index === 0 ? 'M' : 'L'}${round(p.x)} ${round(p.y)}`).join(' ') + (shape.closed ? ' Z' : '');
      return `<path d="${d}" ${attrs()} />`;
    }
  }
}

function round(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Render scene thành chuỗi SVG chính xác — viewBox là khung camera. */
export function renderToSVG(world: WorldRenderState, camera: Camera, options: { backgroundTop?: boolean } = {}): string {
  const layout = assembleScene(world, camera);
  const sky = skyColors(world.weather.timeOfDay);
  const body: string[] = [];
  if (options.backgroundTop !== false) {
    body.push(`<defs><linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="${sky.top}" /><stop offset="100%" stop-color="${sky.bottom}" /></linearGradient></defs>`);
    body.push(`<rect x="${round(camera.x)}" y="${round(camera.y)}" width="${round(camera.width)}" height="${round(camera.height)}" fill="url(#skyGrad)" />`);
  }
  for (const item of layout) {
    if (!item.visible || item.node.shapes.length === 0) continue;
    if (item.node.kind === 'sky') continue; // trời đã vẽ bằng gradient
    const groupAttrs = item.node.label ? ` data-label="${item.node.label}"` : '';
    body.push(`<g id="${item.node.id}" data-kind="${item.node.kind}" data-z="${item.node.z}"${groupAttrs}>`);
    for (const shape of item.node.shapes) body.push('  ' + shapeToSvg(shape, item.node.style));
    body.push('</g>');
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${round(camera.x)} ${round(camera.y)} ${round(camera.width)} ${round(camera.height)}">\n${body.join('\n')}\n</svg>`;
}

/** Đếm node/số hình visible — tiện test và log. */
export function sceneStats(world: WorldRenderState, camera: Camera): { total: number; visible: number; shapes: number } {
  const layout = assembleScene(world, camera);
  const visible = layout.filter((item) => item.visible);
  let shapes = 0;
  for (const item of visible) shapes += item.node.shapes.length;
  return { total: layout.length, visible: visible.length, shapes };
}

/** Cây text thụt lề cho debug — mỗi node một dòng. */
export function renderSceneToText(world: WorldRenderState, camera: Camera): string {
  const layout = assembleScene(world, camera);
  return layout
    .filter((item) => item.visible)
    .map((item) => {
      const b = nodeBounds(item.node.shapes);
      return `${item.node.kind} [z${item.node.z}] @(${Math.round(b.minX)},${Math.round(b.minY)}) shapes=${item.node.shapes.length}`;
    })
    .join('\n');
}
