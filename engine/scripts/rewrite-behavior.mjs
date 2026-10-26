// engine/scripts/rewrite-behavior.mjs
// Tối ưu 7 subsystem hành vi: gom 13 nhóm thân hàm sao chép về một lớp cơ sở
// chung, đồng thời sửa trạng thái trả về cho đúng nghĩa (vd. "hủy" không còn
// báo status 'active').
//
// Dùng: node scripts/rewrite-behavior.mjs [--dry]
import fs from 'fs';
import path from 'path';

const DIR = path.resolve('src/behavior/subsystems');
const DRY = process.argv.includes('--dry');

/** 13 mẫu thân hàm → lệnh gọi thay thế. `FN` = tên method. */
const TEMPLATES = [
  {
    id: 'operation',
    body: "return { operation: 'FN', intensity, context: context ?? {}, status: 'active', timestamp: Date.now() };",
    call: (n) => `return this.applyOperation('${n}', intensity, context);`,
  },
  {
    id: 'adaptation',
    body: "const adaptedLevel = Math.min(1.0, 0.5 * factor); return { response: 'FN', stimulus: stimulus ?? 'environmental', factor, success: true };",
    call: (n) => `return this.applyAdaptation('${n}', factor, stimulus);`,
  },
  {
    id: 'detection',
    body: "const detected = Math.random() >= threshold * 0.5; return { detected, signal: 'FN', strength: detected ? 0.85 : 0.1, timestamp: Date.now() };",
    call: (n) => `return this.applyDetection('${n}', threshold, environment);`,
  },
  {
    id: 'emotion',
    body: "const current = this.emotionLevels.get('FN') ?? 0; const factor = 'FN'.startsWith('suppress') ? -intensity : intensity; const nextVal = Math.max(0, Math.min(1.0, current + factor)); this.emotionLevels.set('FN', nextVal); this.recordEvent('FN', nextVal, cause); return { emotion: 'FN', intensity: nextVal, cause: cause ?? 'internal', active: nextVal > 0.05 };",
    call: (n) => `return this.applyEmotion('${n}', intensity, cause);`,
  },
  {
    id: 'movement',
    body: "return { movement: 'FN', target: targetEntity ?? 'waypoint_default', urgency, active: true };",
    call: (n) => `return this.applyMovement('${n}', targetEntity, urgency);`,
  },
  {
    id: 'memory',
    body: "const memId = 'mem_' + Date.now() + '_' + Math.floor(Math.random() * 1000); this.knowledgeStore.set(memId, { key: 'FN', data: experienceData ?? {}, retention }); return { stored: true, memoryId: memId, type: 'FN', count: this.knowledgeStore.size };",
    call: (n) => `return this.applyMemory('${n}', experienceData, retention);`,
  },
  {
    id: 'update',
    body: "this.lastUpdateTime = Date.now(); this.simulationTicks++; if (context) Object.assign(this.context, context); return { updated: true, deltaTime, ticks: this.simulationTicks, func: 'FN' };",
    call: (n) => `return this.applyUpdate('${n}', deltaTime, context);`,
  },
  {
    id: 'init',
    body: "this.isInitialized = true; if (config) Object.assign(this.state, config); return { initialized: true, timestamp: Date.now(), func: 'FN' };",
    call: (n) => `return this.applyInitialization('${n}', config);`,
  },
  {
    id: 'selection',
    body: "const pool = candidates && candidates.length > 0 ? candidates : ['option_alpha', 'option_beta', 'option_gamma']; const chosen = pool[Math.floor(Math.random() * pool.length)]; return { action: 'FN', selected: chosen, rationale: 'heuristic_optimal' };",
    call: (n) => `return this.applySelection('${n}', candidates, criteria);`,
  },
  {
    id: 'coordination',
    body: "return { synchronized: true, target: peerOrTarget ?? 'global_peer', weight: blendWeight, routine: 'FN' };",
    call: (n) => `return this.applyCoordination('${n}', peerOrTarget, blendWeight);`,
  },
  {
    id: 'execution',
    body: "this.actionHistory.push({ action: 'FN', payload: actionPayload, urgency, timestamp: Date.now() }); if (this.actionHistory.length > 100) this.actionHistory.shift(); return { executed: true, action: 'FN', status: 'completed', urgency };",
    call: (n) => `return this.applyExecution('${n}', actionPayload, urgency);`,
  },
  {
    id: 'expression',
    body: "return { expressed: true, channel: 'FN', intensity, message: message ?? 'salient_affect' };",
    call: (n) => `return this.applyExpression('${n}', message, intensity);`,
  },
  {
    id: 'reset',
    body: "this.resetCounter++; return { reset: true, timestamp: Date.now(), count: this.resetCounter, func: 'FN' };",
    call: (n) => `return this.applyReset('${n}', options);`,
  },
];

/** Khối trạng thái trùng lặp ở đầu mỗi class — sẽ xoá đi (đã có ở lớp cơ sở). */
const STATE_BLOCK = [
  '  public isInitialized = false;',
  '  public simulationTicks = 0;',
  '  public lastUpdateTime = 0;',
  '  public resetCounter = 0;',
  '  public state: Record<string, any> = {};',
  '  public context: Record<string, any> = {};',
  '  public emotionLevels: Map<string, number> = new Map();',
  "  public actionHistory: Array<{ action: string; payload?: any; urgency: number; timestamp: number }> = [];",
  "  public knowledgeStore: Map<string, { key: string; data: any; retention: number }> = new Map();",
  "  public eventLog: Array<{ event: string; intensity: number; cause?: string; timestamp: number }> = [];",
].join('\n');

const RECORD_EVENT_BLOCK = [
  '  public recordEvent(event: string, intensity: number, cause?: string) {',
  '    this.eventLog.push({ event, intensity, cause, timestamp: Date.now() });',
  '    if (this.eventLog.length > 200) this.eventLog.shift();',
  '  }',
].join('\n');

/** Tìm các method public và khoảng thân hàm (offset trong file). */
function findMethods(src) {
  const out = [];
  const re = /^[ \t]*public\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*:\s*[^{]+?\{\s*$/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    const bodyStart = src.indexOf('{', m.index);
    let depth = 0;
    let i = bodyStart;
    for (; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push({ name: m[1], params: m[2], bodyStart: bodyStart + 1, bodyEnd: i, body: src.slice(bodyStart + 1, i) });
  }
  return out;
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const stats = {};

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.ts'))) {
  const full = path.join(DIR, file);
  let src = fs.readFileSync(full, 'utf8');

  // 1) Lớp kế thừa lớp cơ sở.
  src = src.replace(
    /export class (\w+Subsystem) \{/,
    'export class $1 extends BehaviorSubsystemBase {',
  );

  // 2) Import lớp cơ sở.
  if (!src.includes("from '../behavior-primitives.js'")) {
    src = src.replace(
      /^(import type \{[\s\S]*?\} from '\.\.\/types\.js';)/m,
      "$1\nimport { BehaviorSubsystemBase } from '../behavior-primitives.js';",
    );
  }

  // 3) Xoá khối trạng thái + recordEvent trùng lặp.
  src = src.replace(STATE_BLOCK + '\n\n', '');
  src = src.replace(STATE_BLOCK + '\n', '');
  src = src.replace(RECORD_EVENT_BLOCK + '\n\n', '');
  src = src.replace(RECORD_EVENT_BLOCK + '\n', '');
  src = src.replace(/\n{3,}/g, '\n\n');

  // 4) Thay từng thân hàm theo mẫu.
  //    Duyệt ngược để các offset phía trước không bị dịch chuyển khi sửa.
  const methods = findMethods(src);
  let replaced = 0;
  for (let idx = methods.length - 1; idx >= 0; idx--) {
    const meth = methods[idx];
    const bodyNorm = norm(meth.body);
    for (const tpl of TEMPLATES) {
      const tplNorm = norm(tpl.body).replace(/'FN'/g, `'${meth.name}'`);
      if (bodyNorm === tplNorm) {
        const replacement = tpl.call(meth.name);
        src = src.slice(0, meth.bodyStart) + '\n    ' + replacement + '\n  ' + src.slice(meth.bodyEnd);
        replaced++;
        stats[tpl.id] = (stats[tpl.id] ?? 0) + 1;
        break;
      }
    }
  }

  if (!DRY) fs.writeFileSync(full, src, 'utf8');
  console.log(`${file}: ${replaced} thân hàm đã gom về lớp cơ sở`);
}

console.log('\nTheo nhóm:', stats);
console.log(DRY ? '(DRY RUN — chưa ghi file)' : 'Đã ghi file.');
