const fs = require('fs');
const path = require('path');

const data = require('../tests/ai_npc_functions_2400.json');

function toPascal(s) {
  return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

const MODULE_NAMES = {
  EXP: 'Experience',
  STM: 'ShortTermMemory',
  LTM: 'LongTermMemory',
  RET: 'MemoryRetrieval',
  MET: 'MetricsStats',
  OUT: 'OutcomeLearning',
  RL: 'ReinforcementLearning',
  SUP: 'SupervisedLearning',
  UNS: 'UnsupervisedLearning',
  ONL: 'OnlineLearning',
  EMO: 'Emotion',
  PER: 'Personality',
  MOT: 'Motivation',
  PRC: 'Perception',
  RSN: 'Reasoning',
  PLN: 'Planning',
  SKL: 'Skills',
  REL: 'Relationship',
  SOC: 'Social',
  CBT: 'Combat',
  WRL: 'World',
  EVA: 'Evaluation',
  PST: 'Persistence',
  GOV: 'Governance'
};

// -----------------------------------------------------------------------------
// 1. Generate types.ts
// -----------------------------------------------------------------------------
function generateTypes() {
  let code = `/**
 * @file types.ts
 * @module @aetheria/engine/npc
 * @description Type definitions and domain contracts for the AI NPC Learning & Memory Engine (2,400 functions).
 */

// ============================================================================
// Core Framework Interfaces & Generic Contracts
// ============================================================================

/** Entity identifier representing an NPC agent */
export type NPCAgentId = string;

/** Universal NPC memory and learning record */
export interface NPCRecord<T = Record<string, unknown>> {
  id: string;
  agentId: string;
  concept: string;
  module: string;
  timestamp: number;
  data: T;
  weight: number;
  confidence: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/** Criteria for querying agent memory records */
export interface MemoryQuery {
  limit?: number;
  offset?: number;
  since?: number;
  until?: number;
  minConfidence?: number;
  minWeight?: number;
  tags?: string[];
  sortBy?: 'timestamp' | 'confidence' | 'weight';
  sortOrder?: 'asc' | 'desc';
  filter?: (record: NPCRecord<any>) => boolean;
}

/** Result of schema validation */
export interface ValidationResult {
  valid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  details?: Record<string, unknown>;
}

/** Schema specification for generic validation */
export interface ValidationSchema<T = any> {
  requiredFields?: Array<keyof T | string>;
  numericRanges?: Partial<Record<keyof T | string, { min?: number; max?: number }>>;
  allowedValues?: Partial<Record<keyof T | string, unknown[]>>;
  customValidator?: (value: T) => boolean | string;
}

/** Result of heuristic or model evaluation */
export interface EvaluationResult {
  score: number;
  passed: boolean;
  metrics: Record<string, number>;
  confidence: number;
  summary: string;
  recommendation?: string;
}

/** Evaluation criteria configuration */
export interface EvaluationCriteria {
  minScore?: number;
  weights?: Record<string, number>;
  benchmark?: unknown;
  targetFields?: string[];
}

/** Comparison outcome difference item */
export interface ComparisonDifference {
  field: string;
  valA: unknown;
  valB: unknown;
  diff?: number;
}

/** Comparison outcome between two values or records */
export interface ComparisonResult<T = unknown> {
  similarity: number;
  distance: number;
  identical: boolean;
  differences: ComparisonDifference[];
  meta?: Record<string, unknown>;
}

/** Comparison options */
export interface ComparisonOptions {
  tolerance?: number;
  ignoredFields?: string[];
  weightFields?: Record<string, number>;
  metric?: 'euclidean' | 'manhattan' | 'cosine' | 'jaccard';
}

/** Result of memory pruning operations */
export interface PruningResult {
  prunedCount: number;
  retainedCount: number;
  freedBytes: number;
  criteria: string;
  prunedIds: string[];
}

/** Options for memory retention and pruning */
export interface PruningOptions {
  maxRecords?: number;
  maxAgeMs?: number;
  minConfidence?: number;
  preserveHighWeight?: boolean;
  tags?: string[];
}

/** Serialized record structure */
export interface SerializedRecord<T = unknown> {
  id: string;
  format: 'json' | 'binary' | 'blob' | 'custom';
  payload: string;
  schemaVersion: number;
  checksum: string;
  timestamp: number;
  data?: T;
}

/** Generic NPC entity contract */
export interface INPCEntity {
  id: string;
  name: string;
  role?: string;
  faction?: string;
  level?: number;
  state?: Record<string, unknown>;
}

/** Global configuration for the NPC Learning & Memory System */
export interface NPCSystemConfig {
  maxMemoryPerAgent?: number;
  defaultConfidence?: number;
  autoPruneThreshold?: number;
  persistenceEnabled?: boolean;
  debugLogging?: boolean;
}

// ============================================================================
// Module Domain Concept Models (240 Concept Interfaces across 24 Modules)
// ============================================================================
`;

  data.forEach(m => {
    code += `\n// --- Module ${m.code}: ${m.title} ---\n`;
    const concepts = m.functions.slice(0, 10).map(f => {
      return {
        concept: f.name.replace(new RegExp('^' + m.code.toLowerCase() + '_initialize_'), ''),
        desc: f.desc,
        purpose: f.purpose
      };
    });
    concepts.forEach(c => {
      const typeName = 'NPC' + toPascal(m.code) + toPascal(c.concept) + 'Data';
      code += `/**\n`;
      code += ` * ${c.desc}\n`;
      code += ` * Mục đích: ${c.purpose}\n`;
      code += ` */\n`;
      code += `export interface ${typeName} extends Record<string, unknown> {\n`;
      code += `  [key: string]: unknown;\n`;
      code += `  name?: string;\n`;
      code += `  value?: unknown;\n`;
      code += `  intensity?: number;\n`;
      code += `  score?: number;\n`;
      code += `  status?: string;\n`;
      code += `  tags?: string[];\n`;
      code += `  timestamp?: number;\n`;
      code += `}\n\n`;
    });
  });

  fs.writeFileSync(path.join(__dirname, '../src/npc/types.ts'), code, 'utf-8');
  console.log('src/npc/types.ts generated successfully.');
}

// -----------------------------------------------------------------------------
// 2. Generate primitives.ts
// -----------------------------------------------------------------------------
function generatePrimitives() {
  const code = `/**
 * @file primitives.ts
 * @module @aetheria/engine/npc
 * @description Core memory repository, generic normalization, serialization, evaluation and comparison logic.
 */

import {
  NPCRecord,
  MemoryQuery,
  ValidationResult,
  ValidationSchema,
  EvaluationResult,
  EvaluationCriteria,
  ComparisonResult,
  ComparisonOptions,
  ComparisonDifference,
  PruningResult,
  PruningOptions,
  SerializedRecord
} from './types.js';

/** Deterministic FNV-1a 32-bit checksum for payload integrity verification */
export function fnv1aChecksum(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Generates a unique record identifier */
export function generateRecordId(prefix = 'rec'): string {
  const ts = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffff).toString(36).padStart(4, '0');
  return \`\${prefix}_\${ts}_\${rand}\`;
}

/**
 * Normalizes input data:
 * - Trims string fields
 * - Clamps numeric values according to schema
 * - Preserves structural typing <T>
 */
export function normalizeData<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item)) as unknown as T;
  }

  const clone: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (typeof value === 'string') {
      clone[key] = value.trim();
    } else if (typeof value === 'number') {
      let num = Number.isFinite(value) ? value : 0;
      if (schema?.numericRanges && schema.numericRanges[key]) {
        const range = schema.numericRanges[key];
        if (range && range.min !== undefined) num = Math.max(range.min, num);
        if (range && range.max !== undefined) num = Math.min(range.max, num);
      }
      clone[key] = num;
    } else if (typeof value === 'object' && value !== null) {
      clone[key] = normalizeData(value);
    } else {
      clone[key] = value;
    }
  }

  return clone as T;
}

/**
 * Serializes data into a verifiable format with checksum and schema metadata
 */
export function serializeData<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  const payload = JSON.stringify(data ?? {});
  const checksum = fnv1aChecksum(payload);
  return {
    id: generateRecordId('ser'),
    format,
    payload,
    schemaVersion: 1,
    checksum,
    timestamp: Date.now(),
    data
  };
}

/**
 * Validates data against structural constraints and schema
 */
export function validateData<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value === null || value === undefined) {
    return {
      valid: false,
      score: 0,
      errors: ['Giá trị kiểm tra rỗng (null hoặc undefined).'],
      warnings
    };
  }

  if (schema) {
    const obj = value as Record<string, unknown>;

    if (schema.requiredFields) {
      for (const field of schema.requiredFields) {
        const fKey = String(field);
        if (obj[fKey] === undefined || obj[fKey] === null || obj[fKey] === '') {
          errors.push(\`Trường bắt buộc "\${fKey}" bị thiếu hoặc rỗng.\`);
        }
      }
    }

    if (schema.numericRanges) {
      for (const [key, range] of Object.entries(schema.numericRanges)) {
        if (!range) continue;
        const val = obj[key];
        if (typeof val === 'number') {
          if (range.min !== undefined && val < range.min) {
            errors.push(\`Trường "\${key}" có giá trị \${val} nhỏ hơn mức tối thiểu \${range.min}.\`);
          }
          if (range.max !== undefined && val > range.max) {
            errors.push(\`Trường "\${key}" có giá trị \${val} vượt quá mức tối đa \${range.max}.\`);
          }
        }
      }
    }

    if (schema.customValidator) {
      const res = schema.customValidator(value);
      if (typeof res === 'string') {
        errors.push(res);
      } else if (!res) {
        errors.push('Xác thực tùy chỉnh thất bại.');
      }
    }
  }

  const valid = errors.length === 0;
  const score = valid ? 1.0 : Math.max(0, 1.0 - errors.length * 0.25);

  return {
    valid,
    score,
    errors,
    warnings
  };
}

/**
 * Evaluates record quality, completeness, and confidence score
 */
export function evaluateData<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
  const metrics: Record<string, number> = {};

  if (value === null || value === undefined) {
    return {
      score: 0,
      passed: false,
      metrics: { completeness: 0, confidence: 0 },
      confidence: 0,
      summary: 'Dữ liệu đánh giá rỗng.'
    };
  }

  let completeness = 0.5;
  let confidence = 0.8;

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    completeness = Math.min(1.0, keys.length / 5);
    const obj = value as Record<string, unknown>;
    if (typeof obj.confidence === 'number') {
      confidence = Math.max(0, Math.min(1, obj.confidence));
    }
    if (typeof obj.score === 'number') {
      metrics.score = obj.score;
    }
  }

  metrics.completeness = completeness;
  metrics.confidence = confidence;

  const score = (completeness * 0.4) + (confidence * 0.6);
  const minScore = criteria?.minScore ?? 0.5;
  const passed = score >= minScore;

  return {
    score,
    passed,
    metrics,
    confidence,
    summary: passed ? 'Đánh giá đạt chuẩn yêu cầu.' : 'Đánh giá chưa đạt ngưỡng tối thiểu.'
  };
}

/**
 * Compares two objects or values for equality, distance, and similarity
 */
export function compareData<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
  const differences: ComparisonDifference[] = [];
  const ignored = new Set(options?.ignoredFields ?? []);

  if (a === b) {
    return {
      similarity: 1.0,
      distance: 0,
      identical: true,
      differences: []
    };
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return {
      similarity: 0,
      distance: 1.0,
      identical: false,
      differences: [{ field: 'value', valA: a, valB: b }]
    };
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const allKeys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));

  let matchingKeys = 0;
  let totalCompared = 0;
  let totalDistance = 0;

  for (const key of allKeys) {
    if (ignored.has(key)) continue;
    totalCompared++;

    const valA = objA[key];
    const valB = objB[key];

    if (valA === valB) {
      matchingKeys++;
    } else {
      let diffNum: number | undefined = undefined;
      if (typeof valA === 'number' && typeof valB === 'number') {
        diffNum = Math.abs(valA - valB);
        totalDistance += diffNum;
        if (options?.tolerance && diffNum <= options.tolerance) {
          matchingKeys++;
          continue;
        }
      } else {
        totalDistance += 1.0;
      }
      differences.push({ field: key, valA, valB, diff: diffNum });
    }
  }

  const similarity = totalCompared > 0 ? matchingKeys / totalCompared : 1.0;
  const identical = differences.length === 0;

  return {
    similarity,
    distance: totalDistance,
    identical,
    differences
  };
}

/**
 * Generic In-Memory Repository for NPC Knowledge & Memory Records
 */
export class NPCMemoryRepository {
  private records = new Map<string, NPCRecord<any>[]>();

  private makeKey(agentId: string, concept: string): string {
    return \`\${agentId}::\${concept}\`;
  }

  public insert<T = Record<string, unknown>>(record: NPCRecord<T>): NPCRecord<T> {
    const key = this.makeKey(record.agentId, record.concept);
    let list = this.records.get(key);
    if (!list) {
      list = [];
      this.records.set(key, list);
    }
    list.push(record);
    return record;
  }

  public update<T = Record<string, unknown>>(
    agentId: string,
    concept: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    const key = this.makeKey(agentId, concept);
    let list = this.records.get(key);
    if (!list || list.length === 0) {
      // Create new if none exists
      const newRec: NPCRecord<T> = {
        id: generateRecordId(concept.slice(0, 3)),
        agentId,
        concept,
        module: '',
        timestamp: Date.now(),
        data: updateData as T,
        weight: 1.0,
        confidence: 0.9,
        metadata: context
      };
      return this.insert(newRec);
    }

    const latest = list[list.length - 1];
    latest.data = { ...latest.data, ...updateData };
    latest.timestamp = Date.now();
    if (context) {
      latest.metadata = { ...latest.metadata, ...context };
    }
    return latest;
  }

  public query<T = Record<string, unknown>>(
    agentId: string,
    concept: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    const key = this.makeKey(agentId, concept);
    const list = this.records.get(key) || [];
    let result = [...list];

    if (query?.minConfidence !== undefined) {
      result = result.filter(r => r.confidence >= query.minConfidence!);
    }
    if (query?.minWeight !== undefined) {
      result = result.filter(r => r.weight >= query.minWeight!);
    }
    if (query?.since !== undefined) {
      result = result.filter(r => r.timestamp >= query.since!);
    }
    if (query?.until !== undefined) {
      result = result.filter(r => r.timestamp <= query.until!);
    }
    if (query?.filter) {
      result = result.filter(query.filter);
    }

    if (query?.sortBy) {
      const field = query.sortBy;
      const asc = query.sortOrder === 'asc';
      result.sort((a, b) => {
        const valA = (a as any)[field] ?? 0;
        const valB = (b as any)[field] ?? 0;
        return asc ? valA - valB : valB - valA;
      });
    }

    if (query?.offset !== undefined) {
      result = result.slice(query.offset);
    }
    if (query?.limit !== undefined) {
      result = result.slice(0, query.limit);
    }

    return result as NPCRecord<T>[];
  }

  public prune(agentId: string, concept: string, options?: PruningOptions): PruningResult {
    const key = this.makeKey(agentId, concept);
    const list = this.records.get(key) || [];
    const initialCount = list.length;

    const maxRecords = options?.maxRecords ?? 100;
    const maxAgeMs = options?.maxAgeMs;
    const minConfidence = options?.minConfidence;
    const now = Date.now();

    const prunedIds: string[] = [];
    const retained: NPCRecord<any>[] = [];

    for (const rec of list) {
      let keep = true;
      if (maxAgeMs !== undefined && (now - rec.timestamp) > maxAgeMs) {
        keep = false;
      }
      if (minConfidence !== undefined && rec.confidence < minConfidence) {
        keep = false;
      }

      if (keep) {
        retained.push(rec);
      } else {
        prunedIds.push(rec.id);
      }
    }

    // Limit maximum size
    while (retained.length > maxRecords) {
      const removed = retained.shift();
      if (removed) prunedIds.push(removed.id);
    }

    this.records.set(key, retained);

    return {
      prunedCount: initialCount - retained.length,
      retainedCount: retained.length,
      freedBytes: prunedIds.length * 128,
      criteria: \`max=\${maxRecords}\`,
      prunedIds
    };
  }

  public count(agentId?: string, concept?: string): number {
    if (!agentId && !concept) {
      let total = 0;
      for (const list of this.records.values()) total += list.length;
      return total;
    }
    if (agentId && concept) {
      return (this.records.get(this.makeKey(agentId, concept)) || []).length;
    }
    let total = 0;
    for (const [key, list] of this.records.entries()) {
      if (agentId && key.startsWith(\`\${agentId}::\`)) total += list.length;
      if (concept && key.endsWith(\`::\${concept}\`)) total += list.length;
    }
    return total;
  }

  public clear(): void {
    this.records.clear();
  }
}

/**
 * Base class for all NPC Subsystems
 */
export abstract class NPCBaseSubsystem {
  public abstract readonly moduleCode: string;
  public abstract readonly moduleTitle: string;
  protected repository: NPCMemoryRepository;

  constructor(repository?: NPCMemoryRepository) {
    this.repository = repository || new NPCMemoryRepository();
  }

  public getRepository(): NPCMemoryRepository {
    return this.repository;
  }

  public setRepository(repo: NPCMemoryRepository): void {
    this.repository = repo;
  }

  protected createRecord<T = Record<string, unknown>>(
    agentId: string,
    concept: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    const record: NPCRecord<T> = {
      id: generateRecordId(concept.slice(0, 3)),
      agentId,
      concept,
      module: this.moduleCode,
      timestamp: Date.now(),
      data: data ?? ({} as T),
      weight: 1.0,
      confidence: 1.0,
      metadata: context
    };
    return this.repository.insert(record);
  }

  protected updateRecord<T = Record<string, unknown>>(
    agentId: string,
    concept: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.repository.update<T>(agentId, concept, updateData, context);
  }

  protected queryRecords<T = Record<string, unknown>>(
    agentId: string,
    concept: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.repository.query<T>(agentId, concept, query);
  }

  protected pruneRecords(
    agentId: string,
    concept: string,
    options?: PruningOptions
  ): PruningResult {
    return this.repository.prune(agentId, concept, options);
  }
}
`;

  fs.writeFileSync(path.join(__dirname, '../src/npc/primitives.ts'), code, 'utf-8');
  console.log('src/npc/primitives.ts generated successfully.');
}

// -----------------------------------------------------------------------------
// 3. Generate 24 Subsystems
// -----------------------------------------------------------------------------
function generateSubsystems() {
  const subsystemsDir = path.join(__dirname, '../src/npc/subsystems');
  if (!fs.existsSync(subsystemsDir)) {
    fs.mkdirSync(subsystemsDir, { recursive: true });
  }

  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    const className = 'NPC' + MODULE_NAMES[m.code] + 'Subsystem';
    const ifaceName = 'INPC' + MODULE_NAMES[m.code] + 'Subsystem';
    const fileName = `${codeLower}-subsystem.ts`;

    const concepts = m.functions.slice(0, 10).map(f => {
      return {
        concept: f.name.replace(new RegExp('^' + codeLower + '_initialize_'), ''),
        desc: f.desc,
        purpose: f.purpose,
        io: f.io
      };
    });

    let code = `/**
 * @file ${fileName}
 * @module @aetheria/engine/npc
 * @description ${m.title}
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module ${m.code}.
 */

import {
  NPCRecord,
  MemoryQuery,
  ValidationResult,
  ValidationSchema,
  EvaluationResult,
  EvaluationCriteria,
  ComparisonResult,
  ComparisonOptions,
  PruningResult,
  PruningOptions,
  SerializedRecord
} from '../types.js';

import {
  NPCBaseSubsystem,
  NPCMemoryRepository,
  normalizeData,
  serializeData,
  validateData,
  evaluateData,
  compareData
} from '../primitives.js';

// ============================================================================
// Subsystem Interface
// ============================================================================

export interface ${ifaceName} {
`;

    // Add method signatures to interface
    m.functions.forEach(f => {
      const parts = f.name.split('_');
      const verb = parts[1];
      const concept = parts.slice(2).join('_');

      if (verb === 'initialize') {
        code += `  ${f.name}<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;\n`;
      } else if (verb === 'capture') {
        code += `  ${f.name}<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;\n`;
      } else if (verb === 'validate') {
        code += `  ${f.name}<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;\n`;
      } else if (verb === 'normalize') {
        code += `  ${f.name}<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;\n`;
      } else if (verb === 'update') {
        code += `  ${f.name}<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;\n`;
      } else if (verb === 'evaluate') {
        code += `  ${f.name}<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;\n`;
      } else if (verb === 'retrieve') {
        code += `  ${f.name}<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];\n`;
      } else if (verb === 'serialize') {
        code += `  ${f.name}<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;\n`;
      } else if (verb === 'compare') {
        code += `  ${f.name}<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;\n`;
      } else if (verb === 'prune') {
        code += `  ${f.name}(agentId: string, options?: PruningOptions): PruningResult;\n`;
      }
    });

    code += `}\n\n`;

    // Subsystem Class
    code += `// ============================================================================\n`;
    code += `// Subsystem Implementation Class\n`;
    code += `// ============================================================================\n\n`;

    code += `export class ${className} extends NPCBaseSubsystem implements ${ifaceName} {\n`;
    code += `  public readonly moduleCode = '${m.code}';\n`;
    code += `  public readonly moduleTitle = '${m.title}';\n\n`;
    code += `  constructor(repository?: NPCMemoryRepository) {\n`;
    code += `    super(repository);\n`;
    code += `  }\n\n`;

    // Implement all 100 methods in class
    m.functions.forEach(f => {
      const parts = f.name.split('_');
      const verb = parts[1];
      const concept = parts.slice(2).join('_');

      code += `  /**\n`;
      code += `   * @id ${f.id}\n`;
      code += `   * ${f.desc}\n`;
      code += `   * Mục đích: ${f.purpose}\n`;
      code += `   * ${f.io}\n`;
      code += `   */\n`;

      if (verb === 'initialize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    agentId: string,\n`;
        code += `    initialData?: T,\n`;
        code += `    context?: Record<string, unknown>\n`;
        code += `  ): NPCRecord<T> {\n`;
        code += `    return this.createRecord<T>(agentId, '${concept}', (initialData ?? {}) as T, context);\n`;
        code += `  }\n\n`;
      } else if (verb === 'capture') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    agentId: string,\n`;
        code += `    data: T,\n`;
        code += `    context?: Record<string, unknown>\n`;
        code += `  ): NPCRecord<T> {\n`;
        code += `    return this.createRecord<T>(agentId, '${concept}', data, context);\n`;
        code += `  }\n\n`;
      } else if (verb === 'validate') {
        code += `  public ${f.name}<T = unknown>(\n`;
        code += `    value: T,\n`;
        code += `    schema?: ValidationSchema<T>\n`;
        code += `  ): ValidationResult {\n`;
        code += `    return validateData<T>(value, schema);\n`;
        code += `  }\n\n`;
      } else if (verb === 'normalize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    data: T,\n`;
        code += `    schema?: ValidationSchema<T>\n`;
        code += `  ): T {\n`;
        code += `    return normalizeData<T>(data, schema);\n`;
        code += `  }\n\n`;
      } else if (verb === 'update') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    agentId: string,\n`;
        code += `    updateData: Partial<T>,\n`;
        code += `    context?: Record<string, unknown>\n`;
        code += `  ): NPCRecord<T> {\n`;
        code += `    return this.updateRecord<T>(agentId, '${concept}', updateData, context);\n`;
        code += `  }\n\n`;
      } else if (verb === 'evaluate') {
        code += `  public ${f.name}<T = unknown>(\n`;
        code += `    value: T,\n`;
        code += `    criteria?: EvaluationCriteria\n`;
        code += `  ): EvaluationResult {\n`;
        code += `    return evaluateData<T>(value, criteria);\n`;
        code += `  }\n\n`;
      } else if (verb === 'retrieve') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    agentId: string,\n`;
        code += `    query?: MemoryQuery\n`;
        code += `  ): NPCRecord<T>[] {\n`;
        code += `    return this.queryRecords<T>(agentId, '${concept}', query);\n`;
        code += `  }\n\n`;
      } else if (verb === 'serialize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(\n`;
        code += `    data: T,\n`;
        code += `    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'\n`;
        code += `  ): SerializedRecord<T> {\n`;
        code += `    return serializeData<T>(data, format);\n`;
        code += `  }\n\n`;
      } else if (verb === 'compare') {
        code += `  public ${f.name}<T = unknown>(\n`;
        code += `    a: T,\n`;
        code += `    b: T,\n`;
        code += `    options?: ComparisonOptions\n`;
        code += `  ): ComparisonResult<T> {\n`;
        code += `    return compareData<T>(a, b, options);\n`;
        code += `  }\n\n`;
      } else if (verb === 'prune') {
        code += `  public ${f.name}(\n`;
        code += `    agentId: string,\n`;
        code += `    options?: PruningOptions\n`;
        code += `  ): PruningResult {\n`;
        code += `    return this.pruneRecords(agentId, '${concept}', options);\n`;
        code += `  }\n\n`;
      }
    });

    code += `}\n\n`;

    // Standalone Functions
    code += `// ============================================================================\n`;
    code += `// Standalone Functions (100 Functional Endpoints for ${m.code})\n`;
    code += `// ============================================================================\n\n`;

    code += `let defaultSubsystem: ${className} | null = null;\n`;
    code += `function getSubsystem(): ${className} {\n`;
    code += `  if (!defaultSubsystem) {\n`;
    code += `    defaultSubsystem = new ${className}();\n`;
    code += `  }\n`;
    code += `  return defaultSubsystem;\n`;
    code += `}\n\n`;

    m.functions.forEach(f => {
      const parts = f.name.split('_');
      const verb = parts[1];
      const concept = parts.slice(2).join('_');

      code += `/**\n`;
      code += ` * @id ${f.id}\n`;
      code += ` * ${f.desc}\n`;
      code += ` * Mục đích: ${f.purpose}\n`;
      code += ` * ${f.io}\n`;
      code += ` */\n`;

      if (verb === 'initialize') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  agentId: string,\n`;
        code += `  initialData?: T,\n`;
        code += `  context?: Record<string, unknown>,\n`;
        code += `  subsystem?: ${className}\n`;
        code += `): NPCRecord<T> {\n`;
        code += `  return (subsystem || getSubsystem()).${f.name}<T>(agentId, initialData, context);\n`;
        code += `}\n\n`;
      } else if (verb === 'capture') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  agentId: string,\n`;
        code += `  data: T,\n`;
        code += `  context?: Record<string, unknown>,\n`;
        code += `  subsystem?: ${className}\n`;
        code += `): NPCRecord<T> {\n`;
        code += `  return (subsystem || getSubsystem()).${f.name}<T>(agentId, data, context);\n`;
        code += `}\n\n`;
      } else if (verb === 'validate') {
        code += `export function ${f.name}<T = unknown>(\n`;
        code += `  value: T,\n`;
        code += `  schema?: ValidationSchema<T>\n`;
        code += `): ValidationResult {\n`;
        code += `  return validateData<T>(value, schema);\n`;
        code += `}\n\n`;
      } else if (verb === 'normalize') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  data: T,\n`;
        code += `  schema?: ValidationSchema<T>\n`;
        code += `): T {\n`;
        code += `  return normalizeData<T>(data, schema);\n`;
        code += `}\n\n`;
      } else if (verb === 'update') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  agentId: string,\n`;
        code += `  updateData: Partial<T>,\n`;
        code += `  context?: Record<string, unknown>,\n`;
        code += `  subsystem?: ${className}\n`;
        code += `): NPCRecord<T> {\n`;
        code += `  return (subsystem || getSubsystem()).${f.name}<T>(agentId, updateData, context);\n`;
        code += `}\n\n`;
      } else if (verb === 'evaluate') {
        code += `export function ${f.name}<T = unknown>(\n`;
        code += `  value: T,\n`;
        code += `  criteria?: EvaluationCriteria\n`;
        code += `): EvaluationResult {\n`;
        code += `  return evaluateData<T>(value, criteria);\n`;
        code += `}\n\n`;
      } else if (verb === 'retrieve') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  agentId: string,\n`;
        code += `  query?: MemoryQuery,\n`;
        code += `  subsystem?: ${className}\n`;
        code += `): NPCRecord<T>[] {\n`;
        code += `  return (subsystem || getSubsystem()).${f.name}<T>(agentId, query);\n`;
        code += `}\n\n`;
      } else if (verb === 'serialize') {
        code += `export function ${f.name}<T = Record<string, unknown>>(\n`;
        code += `  data: T,\n`;
        code += `  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'\n`;
        code += `): SerializedRecord<T> {\n`;
        code += `  return serializeData<T>(data, format);\n`;
        code += `}\n\n`;
      } else if (verb === 'compare') {
        code += `export function ${f.name}<T = unknown>(\n`;
        code += `  a: T,\n`;
        code += `  b: T,\n`;
        code += `  options?: ComparisonOptions\n`;
        code += `): ComparisonResult<T> {\n`;
        code += `  return compareData<T>(a, b, options);\n`;
        code += `}\n\n`;
      } else if (verb === 'prune') {
        code += `export function ${f.name}(\n`;
        code += `  agentId: string,\n`;
        code += `  options?: PruningOptions,\n`;
        code += `  subsystem?: ${className}\n`;
        code += `): PruningResult {\n`;
        code += `  return (subsystem || getSubsystem()).${f.name}(agentId, options);\n`;
        code += `}\n\n`;
      }
    });

    fs.writeFileSync(path.join(subsystemsDir, fileName), code, 'utf-8');
    console.log(`src/npc/subsystems/${fileName} generated.`);
  });
}

// -----------------------------------------------------------------------------
// 4. Generate npc-system.ts (Master orchestrator with all 2,400 methods)
// -----------------------------------------------------------------------------
function generateMasterSystem() {
  let code = `/**
 * @file npc-system.ts
 * @module @aetheria/engine/npc
 * @description Master NPC Memory & Learning System orchestrator implementing all 2,400 methods.
 */

import {
  NPCRecord,
  MemoryQuery,
  ValidationResult,
  ValidationSchema,
  EvaluationResult,
  EvaluationCriteria,
  ComparisonResult,
  ComparisonOptions,
  PruningResult,
  PruningOptions,
  SerializedRecord,
  NPCSystemConfig
} from './types.js';

import { NPCMemoryRepository } from './primitives.js';

`;

  // Imports of all 24 subsystems
  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    const className = 'NPC' + MODULE_NAMES[m.code] + 'Subsystem';
    code += `import { ${className} } from './subsystems/${codeLower}-subsystem.js';\n`;
  });

  code += `\nexport class NPCMemoryLearningSystem {\n`;
  code += `  public readonly repository: NPCMemoryRepository;\n\n`;

  // Declare all 24 subsystem properties
  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    const className = 'NPC' + MODULE_NAMES[m.code] + 'Subsystem';
    code += `  public readonly ${codeLower}: ${className};\n`;
  });

  code += `\n  constructor(config?: NPCSystemConfig, repository?: NPCMemoryRepository) {\n`;
  code += `    this.repository = repository || new NPCMemoryRepository();\n`;

  // Instantiate each subsystem with shared repository
  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    const className = 'NPC' + MODULE_NAMES[m.code] + 'Subsystem';
    code += `    this.${codeLower} = new ${className}(this.repository);\n`;
  });

  code += `  }\n\n`;

  // General Lifecycle methods
  code += `  public reset(): void {\n`;
  code += `    this.repository.clear();\n`;
  code += `  }\n\n`;

  code += `  public totalRecordCount(): number {\n`;
  code += `    return this.repository.count();\n`;
  code += `  }\n\n`;

  // Implement all 2,400 methods directly on the class
  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    code += `  // ==========================================================================\n`;
    code += `  // Module ${m.code}: ${m.title}\n`;
    code += `  // ==========================================================================\n\n`;

    m.functions.forEach(f => {
      const parts = f.name.split('_');
      const verb = parts[1];

      if (verb === 'initialize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(agentId, initialData, context);\n`;
        code += `  }\n`;
      } else if (verb === 'capture') {
        code += `  public ${f.name}<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(agentId, data, context);\n`;
        code += `  }\n`;
      } else if (verb === 'validate') {
        code += `  public ${f.name}<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(value, schema);\n`;
        code += `  }\n`;
      } else if (verb === 'normalize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(data, schema);\n`;
        code += `  }\n`;
      } else if (verb === 'update') {
        code += `  public ${f.name}<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(agentId, updateData, context);\n`;
        code += `  }\n`;
      } else if (verb === 'evaluate') {
        code += `  public ${f.name}<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(value, criteria);\n`;
        code += `  }\n`;
      } else if (verb === 'retrieve') {
        code += `  public ${f.name}<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(agentId, query);\n`;
        code += `  }\n`;
      } else if (verb === 'serialize') {
        code += `  public ${f.name}<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(data, format);\n`;
        code += `  }\n`;
      } else if (verb === 'compare') {
        code += `  public ${f.name}<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {\n`;
        code += `    return this.${codeLower}.${f.name}<T>(a, b, options);\n`;
        code += `  }\n`;
      } else if (verb === 'prune') {
        code += `  public ${f.name}(agentId: string, options?: PruningOptions): PruningResult {\n`;
        code += `    return this.${codeLower}.${f.name}(agentId, options);\n`;
        code += `  }\n`;
      }
    });
    code += `\n`;
  });

  code += `}\n`;

  fs.writeFileSync(path.join(__dirname, '../src/npc/npc-system.ts'), code, 'utf-8');
  console.log('src/npc/npc-system.ts generated successfully.');
}

// -----------------------------------------------------------------------------
// 5. Generate index.ts
// -----------------------------------------------------------------------------
function generateIndex() {
  let code = `/**
 * @file index.ts
 * @module @aetheria/engine/npc
 * @description Public API and standalone functional exports for the AI NPC Learning & Memory Engine (2,400 functions).
 */

export * from './types.js';
export * from './primitives.js';
export * from './npc-system.js';

`;

  // Re-export subsystems
  data.forEach(m => {
    const codeLower = m.code.toLowerCase();
    code += `export * from './subsystems/${codeLower}-subsystem.js';\n`;
  });

  code += `\nimport { NPCMemoryLearningSystem } from './npc-system.js';\n\n`;

  code += `let activeSystem: NPCMemoryLearningSystem | null = null;\n\n`;

  code += `/** Gets or creates the global default active NPCMemoryLearningSystem */\n`;
  code += `export function getActiveNPCSystem(): NPCMemoryLearningSystem {\n`;
  code += `  if (!activeSystem) {\n`;
  code += `    activeSystem = new NPCMemoryLearningSystem();\n`;
  code += `  }\n`;
  code += `  return activeSystem;\n`;
  code += `}\n\n`;

  code += `/** Sets the global active NPCMemoryLearningSystem */\n`;
  code += `export function setActiveNPCSystem(system: NPCMemoryLearningSystem): void {\n`;
  code += `  activeSystem = system;\n`;
  code += `}\n\n`;

  code += `/** Resets the active NPCMemoryLearningSystem */\n`;
  code += `export function resetNPCSystem(): void {\n`;
  code += `  if (activeSystem) {\n`;
  code += `    activeSystem.reset();\n`;
  code += `  }\n`;
  code += `  activeSystem = null;\n`;
  code += `}\n`;

  fs.writeFileSync(path.join(__dirname, '../src/npc/index.ts'), code, 'utf-8');
  console.log('src/npc/index.ts generated successfully.');
}

// Execute all
console.log('Starting AI NPC 2,400 Engine Generation...');
generateTypes();
generatePrimitives();
generateSubsystems();
generateMasterSystem();
generateIndex();
console.log('Finished generating AI NPC 2,400 Engine!');
