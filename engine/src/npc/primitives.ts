/**
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
  SerializedRecord,
  NPCSystemConfig
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
  return `${prefix}_${ts}_${rand}`;
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
          errors.push(`Trường bắt buộc "${fKey}" bị thiếu hoặc rỗng.`);
        }
      }
    }

    if (schema.numericRanges) {
      for (const [key, range] of Object.entries(schema.numericRanges)) {
        if (!range) continue;
        const val = obj[key];
        if (typeof val === 'number') {
          if (range.min !== undefined && val < range.min) {
            errors.push(`Trường "${key}" có giá trị ${val} nhỏ hơn mức tối thiểu ${range.min}.`);
          }
          if (range.max !== undefined && val > range.max) {
            errors.push(`Trường "${key}" có giá trị ${val} vượt quá mức tối đa ${range.max}.`);
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
  private config: NPCSystemConfig;

  constructor(config: NPCSystemConfig = {}) {
    this.config = { ...config };
  }

  /** Returns a copy of the repository configuration. */
  public getConfig(): Readonly<NPCSystemConfig> {
    return { ...this.config };
  }

  /** Merges new configuration values into this repository. */
  public setConfig(config: NPCSystemConfig): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  private makeKey(agentId: string, concept: string): string {
    return `${agentId}::${concept}`;
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
      criteria: `max=${maxRecords}`,
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
      if (agentId && key.startsWith(`${agentId}::`)) total += list.length;
      if (concept && key.endsWith(`::${concept}`)) total += list.length;
    }
    return total;
  }

  /** Lists every agent id currently present in this repository. */
  public getAgentIds(): string[] {
    const ids = new Set<string>();
    for (const key of this.records.keys()) {
      const split = key.indexOf('::');
      if (split > 0) ids.add(key.slice(0, split));
    }
    return Array.from(ids);
  }

  /** Lists concepts recorded for one agent. */
  public getConcepts(agentId: string): string[] {
    const prefix = `${agentId}::`;
    return Array.from(this.records.keys())
      .filter((key) => key.startsWith(prefix))
      .map((key) => key.slice(prefix.length));
  }

  /** Applies a retention policy to every concept owned by one agent. */
  public pruneAgent(agentId: string, options?: PruningOptions): PruningResult {
    const concepts = this.getConcepts(agentId);
    const result: PruningResult = {
      prunedCount: 0,
      retainedCount: 0,
      freedBytes: 0,
      criteria: options?.maxRecords !== undefined ? `agent-max=${options.maxRecords}` : 'agent-prune',
      prunedIds: []
    };

    for (const concept of concepts) {
      const pruned = this.prune(agentId, concept, options);
      result.prunedCount += pruned.prunedCount;
      result.retainedCount += pruned.retainedCount;
      result.freedBytes += pruned.freedBytes;
      result.prunedIds.push(...pruned.prunedIds);
    }
    return result;
  }

  /** Export a plain snapshot of every record (used by agent serialization). */
  public snapshot(): NPCRecord<unknown>[] {
    const result: NPCRecord<unknown>[] = [];
    for (const list of this.records.values()) {
      for (const record of list) {
        result.push({
          ...record,
          tags: record.tags ? [...record.tags] : undefined,
          metadata: record.metadata ? { ...record.metadata } : undefined
        });
      }
    }
    return result;
  }

  /** Replace repository contents with a previously exported snapshot. */
  public load(records: readonly NPCRecord<unknown>[]): number {
    this.records.clear();
    let loaded = 0;
    for (const record of records) {
      if (!record || typeof record.agentId !== 'string' || typeof record.concept !== 'string') {
        continue;
      }
      this.insert<unknown>(record);
      loaded++;
    }
    return loaded;
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
      confidence: this.repository.getConfig().defaultConfidence ?? 1.0,
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
