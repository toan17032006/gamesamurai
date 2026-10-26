#!/usr/bin/env node
/**
 * Thay thế thân hàm "giả" của nhóm estimate/evaluate/predict trong các subsystem
 * hành vi bằng phép đánh giá dựa trên bằng chứng thật.
 *
 * Trước:
 *   const confidence = Math.min(1.0, 0.75 + Math.random() * 0.25);
 *   const score = Math.round((Math.sin(this.simulationTicks * 0.1 + 87) * 0.5 + 0.5) * 100) / 100;
 *   return { query: 'estimateThreatSeverity', score, confidence, target: target ?? 'self', valid: true };
 *
 * Sau:
 *   const evaluation = this.evaluateEstimate('estimateThreatSeverity', target, options);
 *   return {
 *     query: 'estimateThreatSeverity',
 *     score: evaluation.score,
 *     confidence: evaluation.confidence,
 *     value: evaluation.value,
 *     factors: evaluation.factors,
 *     basis: evaluation.basis,
 *     evidenceCount: evaluation.evidenceCount,
 *     target: target ?? 'self',
 *     valid: true,
 *     tick: this.simulationTicks,
 *   };
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = resolve(ROOT, 'src/behavior/subsystems');

const BODY_PATTERN = new RegExp(
  [
    "    const confidence = Math\\.min\\(1\\.0, 0\\.75 \\+ Math\\.random\\(\\) \\* 0\\.25\\);",
    "    const score = Math\\.round\\(\\(Math\\.sin\\(this\\.simulationTicks \\* 0\\.1 \\+ \\d+\\) \\* 0\\.5 \\+ 0\\.5\\) \\* 100\\) / 100;",
    "    return \\{ query: '(\\w+)', score, confidence, target: target \\?\\? 'self', valid: true \\};",
  ].join('\\r?\\n'),
  'g',
);

function replacement(methodName) {
  return [
    `    const evaluation = this.evaluateEstimate('${methodName}', target, options);`,
    '    return {',
    `      query: '${methodName}',`,
    '      score: evaluation.score,',
    '      confidence: evaluation.confidence,',
    '      value: evaluation.value,',
    '      factors: evaluation.factors,',
    '      basis: evaluation.basis,',
    '      evidenceCount: evaluation.evidenceCount,',
    "      target: target ?? 'self',",
    '      valid: true,',
    '      tick: this.simulationTicks,',
    '    };',
  ].join('\n');
}

const files = process.argv.slice(2).length > 0
  ? process.argv.slice(2).map((f) => resolve(ROOT, f))
  : ['human-emotion-subsystem.ts', 'human-cognition-social-subsystem.ts', 'somatic-lifestyle-subsystem.ts',
     'simulation-ai-subsystem.ts', 'zoological-species-subsystem.ts', 'ecological-taxa-subsystem.ts',
     'culture-labor-subsystem.ts'].map((f) => resolve(DIR, f));

let total = 0;
for (const abs of files) {
  const before = readFileSync(abs, 'utf8');
  let count = 0;
  const after = before.replace(BODY_PATTERN, (_m, methodName) => {
    count++;
    return replacement(methodName);
  });
  if (count > 0) writeFileSync(abs, after, 'utf8');
  total += count;
  console.log(`• ${relative(ROOT, abs)}: ${count} thân hàm đã thay`);
}

console.log(`\nTổng: ${total} thân hàm estimate/evaluate/predict được thay bằng phép đánh giá theo bằng chứng.`);
