/**
 * @file ret-subsystem.ts
 * @module @aetheria/engine/npc
 * @description RET — Truy xuất và liên kết ký ức (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module RET.
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

export interface INPCMemoryRetrievalSubsystem {
  ret_initialize_event_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_entity_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_emotion_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_similarity_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_causal_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_temporal_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_spatial_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_social_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_strategy_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_initialize_conflicting_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_event_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_entity_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_emotion_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_similarity_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_causal_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_temporal_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_spatial_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_social_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_strategy_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_capture_conflicting_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ret_validate_event_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_entity_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_emotion_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_similarity_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_causal_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_temporal_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_spatial_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_social_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_strategy_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_validate_conflicting_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ret_normalize_event_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_entity_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_emotion_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_similarity_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_causal_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_temporal_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_spatial_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_social_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_strategy_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_normalize_conflicting_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ret_update_event_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_entity_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_emotion_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_similarity_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_causal_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_temporal_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_spatial_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_social_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_strategy_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_update_conflicting_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ret_evaluate_event_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_entity_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_emotion_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_similarity_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_causal_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_temporal_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_spatial_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_social_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_strategy_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_evaluate_conflicting_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ret_retrieve_event_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_entity_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_emotion_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_similarity_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_causal_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_temporal_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_spatial_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_social_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_strategy_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_retrieve_conflicting_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ret_serialize_event_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_entity_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_emotion_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_similarity_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_causal_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_temporal_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_spatial_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_social_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_strategy_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_serialize_conflicting_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ret_compare_event_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_entity_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_emotion_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_similarity_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_causal_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_temporal_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_spatial_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_social_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_strategy_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_compare_conflicting_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ret_prune_event_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_entity_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_emotion_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_similarity_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_causal_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_temporal_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_spatial_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_social_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_strategy_memory(agentId: string, options?: PruningOptions): PruningResult;
  ret_prune_conflicting_memory(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCMemoryRetrievalSubsystem extends NPCBaseSubsystem implements INPCMemoryRetrievalSubsystem {
  public readonly moduleCode = 'RET';
  public readonly moduleTitle = 'RET — Truy xuất và liên kết ký ức (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-04-001
   * Khởi tạo ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_event_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'event_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-002
   * Khởi tạo ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức thực thể.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_entity_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'entity_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-003
   * Khởi tạo ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức cảm xúc.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_emotion_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'emotion_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-004
   * Khởi tạo ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức tương đồng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_similarity_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'similarity_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-005
   * Khởi tạo ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức nhân quả.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_causal_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'causal_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-006
   * Khởi tạo ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức thời gian.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_temporal_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporal_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-007
   * Khởi tạo ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức không gian.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_spatial_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'spatial_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-008
   * Khởi tạo ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức xã hội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_social_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-009
   * Khởi tạo ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức chiến thuật.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_strategy_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'strategy_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-010
   * Khởi tạo ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức mâu thuẫn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_initialize_conflicting_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'conflicting_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-04-011
   * Thu thập ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức sự kiện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_event_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'event_memory', data, context);
  }

  /**
   * @id AI-04-012
   * Thu thập ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức thực thể từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_entity_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'entity_memory', data, context);
  }

  /**
   * @id AI-04-013
   * Thu thập ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức cảm xúc từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_emotion_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'emotion_memory', data, context);
  }

  /**
   * @id AI-04-014
   * Thu thập ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức tương đồng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_similarity_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'similarity_memory', data, context);
  }

  /**
   * @id AI-04-015
   * Thu thập ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức nhân quả từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_causal_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'causal_memory', data, context);
  }

  /**
   * @id AI-04-016
   * Thu thập ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức thời gian từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_temporal_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporal_memory', data, context);
  }

  /**
   * @id AI-04-017
   * Thu thập ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức không gian từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_spatial_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'spatial_memory', data, context);
  }

  /**
   * @id AI-04-018
   * Thu thập ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức xã hội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_social_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_memory', data, context);
  }

  /**
   * @id AI-04-019
   * Thu thập ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức chiến thuật từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_strategy_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'strategy_memory', data, context);
  }

  /**
   * @id AI-04-020
   * Thu thập ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức mâu thuẫn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_capture_conflicting_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'conflicting_memory', data, context);
  }

  /**
   * @id AI-04-021
   * Kiểm tra tính hợp lệ của ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_event_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-022
   * Kiểm tra tính hợp lệ của ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức thực thể.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_entity_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-023
   * Kiểm tra tính hợp lệ của ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_emotion_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-024
   * Kiểm tra tính hợp lệ của ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_similarity_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-025
   * Kiểm tra tính hợp lệ của ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức nhân quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_causal_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-026
   * Kiểm tra tính hợp lệ của ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức thời gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_temporal_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-027
   * Kiểm tra tính hợp lệ của ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức không gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_spatial_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-028
   * Kiểm tra tính hợp lệ của ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_social_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-029
   * Kiểm tra tính hợp lệ của ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức chiến thuật.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_strategy_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-030
   * Kiểm tra tính hợp lệ của ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức mâu thuẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_validate_conflicting_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-04-031
   * Chuẩn hóa ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức sự kiện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_event_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-032
   * Chuẩn hóa ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức thực thể để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_entity_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-033
   * Chuẩn hóa ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức cảm xúc để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_emotion_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-034
   * Chuẩn hóa ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức tương đồng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_similarity_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-035
   * Chuẩn hóa ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức nhân quả để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_causal_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-036
   * Chuẩn hóa ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức thời gian để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_temporal_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-037
   * Chuẩn hóa ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức không gian để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_spatial_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-038
   * Chuẩn hóa ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức xã hội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_social_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-039
   * Chuẩn hóa ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức chiến thuật để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_strategy_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-040
   * Chuẩn hóa ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuẩn hóa biểu diễn ký ức mâu thuẫn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_normalize_conflicting_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-04-041
   * Cập nhật ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức sự kiện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_event_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'event_memory', updateData, context);
  }

  /**
   * @id AI-04-042
   * Cập nhật ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức thực thể dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_entity_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'entity_memory', updateData, context);
  }

  /**
   * @id AI-04-043
   * Cập nhật ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức cảm xúc dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_emotion_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'emotion_memory', updateData, context);
  }

  /**
   * @id AI-04-044
   * Cập nhật ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức tương đồng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_similarity_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'similarity_memory', updateData, context);
  }

  /**
   * @id AI-04-045
   * Cập nhật ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức nhân quả dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_causal_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'causal_memory', updateData, context);
  }

  /**
   * @id AI-04-046
   * Cập nhật ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức thời gian dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_temporal_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'temporal_memory', updateData, context);
  }

  /**
   * @id AI-04-047
   * Cập nhật ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức không gian dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_spatial_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'spatial_memory', updateData, context);
  }

  /**
   * @id AI-04-048
   * Cập nhật ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức xã hội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_social_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'social_memory', updateData, context);
  }

  /**
   * @id AI-04-049
   * Cập nhật ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức chiến thuật dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_strategy_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'strategy_memory', updateData, context);
  }

  /**
   * @id AI-04-050
   * Cập nhật ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Cập nhật ký ức mâu thuẫn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_update_conflicting_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'conflicting_memory', updateData, context);
  }

  /**
   * @id AI-04-051
   * Đánh giá ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_event_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-052
   * Đánh giá ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức thực thể.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_entity_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-053
   * Đánh giá ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_emotion_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-054
   * Đánh giá ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_similarity_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-055
   * Đánh giá ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức nhân quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_causal_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-056
   * Đánh giá ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức thời gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_temporal_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-057
   * Đánh giá ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức không gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_spatial_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-058
   * Đánh giá ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_social_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-059
   * Đánh giá ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức chiến thuật.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_strategy_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-060
   * Đánh giá ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức mâu thuẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_evaluate_conflicting_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-04-061
   * Truy xuất ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức sự kiện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_event_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'event_memory', query);
  }

  /**
   * @id AI-04-062
   * Truy xuất ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức thực thể phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_entity_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'entity_memory', query);
  }

  /**
   * @id AI-04-063
   * Truy xuất ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức cảm xúc phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_emotion_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'emotion_memory', query);
  }

  /**
   * @id AI-04-064
   * Truy xuất ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức tương đồng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_similarity_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'similarity_memory', query);
  }

  /**
   * @id AI-04-065
   * Truy xuất ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức nhân quả phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_causal_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'causal_memory', query);
  }

  /**
   * @id AI-04-066
   * Truy xuất ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức thời gian phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_temporal_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'temporal_memory', query);
  }

  /**
   * @id AI-04-067
   * Truy xuất ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức không gian phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_spatial_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'spatial_memory', query);
  }

  /**
   * @id AI-04-068
   * Truy xuất ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức xã hội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_social_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'social_memory', query);
  }

  /**
   * @id AI-04-069
   * Truy xuất ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức chiến thuật phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_strategy_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'strategy_memory', query);
  }

  /**
   * @id AI-04-070
   * Truy xuất ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Tìm và trả về ký ức mâu thuẫn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_retrieve_conflicting_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'conflicting_memory', query);
  }

  /**
   * @id AI-04-071
   * Tuần tự hóa ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_event_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-072
   * Tuần tự hóa ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức thực thể sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_entity_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-073
   * Tuần tự hóa ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức cảm xúc sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_emotion_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-074
   * Tuần tự hóa ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức tương đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_similarity_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-075
   * Tuần tự hóa ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức nhân quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_causal_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-076
   * Tuần tự hóa ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức thời gian sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_temporal_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-077
   * Tuần tự hóa ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức không gian sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_spatial_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-078
   * Tuần tự hóa ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_social_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-079
   * Tuần tự hóa ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức chiến thuật sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_strategy_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-080
   * Tuần tự hóa ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Chuyển ký ức mâu thuẫn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_serialize_conflicting_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-04-081
   * So sánh ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_event_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-082
   * So sánh ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức thực thể.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_entity_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-083
   * So sánh ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_emotion_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-084
   * So sánh ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_similarity_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-085
   * So sánh ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức nhân quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_causal_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-086
   * So sánh ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức thời gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_temporal_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-087
   * So sánh ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức không gian.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_spatial_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-088
   * So sánh ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_social_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-089
   * So sánh ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức chiến thuật.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_strategy_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-090
   * So sánh ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức mâu thuẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ret_compare_conflicting_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-04-091
   * Tinh gọn ký ức sự kiện trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức sự kiện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_event_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'event_memory', options);
  }

  /**
   * @id AI-04-092
   * Tinh gọn ký ức thực thể trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức thực thể lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_entity_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'entity_memory', options);
  }

  /**
   * @id AI-04-093
   * Tinh gọn ký ức cảm xúc trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức cảm xúc lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_emotion_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'emotion_memory', options);
  }

  /**
   * @id AI-04-094
   * Tinh gọn ký ức tương đồng trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức tương đồng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_similarity_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'similarity_memory', options);
  }

  /**
   * @id AI-04-095
   * Tinh gọn ký ức nhân quả trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức nhân quả lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_causal_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'causal_memory', options);
  }

  /**
   * @id AI-04-096
   * Tinh gọn ký ức thời gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức thời gian lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_temporal_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'temporal_memory', options);
  }

  /**
   * @id AI-04-097
   * Tinh gọn ký ức không gian trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức không gian lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_spatial_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'spatial_memory', options);
  }

  /**
   * @id AI-04-098
   * Tinh gọn ký ức xã hội trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức xã hội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_social_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'social_memory', options);
  }

  /**
   * @id AI-04-099
   * Tinh gọn ký ức chiến thuật trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức chiến thuật lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_strategy_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'strategy_memory', options);
  }

  /**
   * @id AI-04-100
   * Tinh gọn ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức mâu thuẫn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ret_prune_conflicting_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'conflicting_memory', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for RET)
// ============================================================================

let defaultSubsystem: NPCMemoryRetrievalSubsystem | null = null;
function getSubsystem(): NPCMemoryRetrievalSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCMemoryRetrievalSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-04-001
 * Khởi tạo ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_event_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_event_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-002
 * Khởi tạo ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức thực thể.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_entity_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_entity_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-003
 * Khởi tạo ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức cảm xúc.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_emotion_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_emotion_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-004
 * Khởi tạo ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức tương đồng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_similarity_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_similarity_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-005
 * Khởi tạo ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức nhân quả.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_causal_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_causal_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-006
 * Khởi tạo ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức thời gian.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_temporal_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_temporal_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-007
 * Khởi tạo ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức không gian.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_spatial_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_spatial_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-008
 * Khởi tạo ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức xã hội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_social_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_social_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-009
 * Khởi tạo ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức chiến thuật.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_strategy_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_strategy_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-010
 * Khởi tạo ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức mâu thuẫn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_initialize_conflicting_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_initialize_conflicting_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-04-011
 * Thu thập ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức sự kiện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_event_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_event_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-012
 * Thu thập ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức thực thể từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_entity_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_entity_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-013
 * Thu thập ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức cảm xúc từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_emotion_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_emotion_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-014
 * Thu thập ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức tương đồng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_similarity_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_similarity_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-015
 * Thu thập ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức nhân quả từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_causal_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_causal_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-016
 * Thu thập ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức thời gian từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_temporal_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_temporal_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-017
 * Thu thập ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức không gian từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_spatial_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_spatial_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-018
 * Thu thập ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức xã hội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_social_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_social_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-019
 * Thu thập ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức chiến thuật từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_strategy_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_strategy_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-020
 * Thu thập ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức mâu thuẫn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_capture_conflicting_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_capture_conflicting_memory<T>(agentId, data, context);
}

/**
 * @id AI-04-021
 * Kiểm tra tính hợp lệ của ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_event_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-022
 * Kiểm tra tính hợp lệ của ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức thực thể.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_entity_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-023
 * Kiểm tra tính hợp lệ của ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_emotion_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-024
 * Kiểm tra tính hợp lệ của ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_similarity_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-025
 * Kiểm tra tính hợp lệ của ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức nhân quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_causal_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-026
 * Kiểm tra tính hợp lệ của ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức thời gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_temporal_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-027
 * Kiểm tra tính hợp lệ của ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức không gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_spatial_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-028
 * Kiểm tra tính hợp lệ của ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_social_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-029
 * Kiểm tra tính hợp lệ của ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức chiến thuật.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_strategy_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-030
 * Kiểm tra tính hợp lệ của ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức mâu thuẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_validate_conflicting_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-04-031
 * Chuẩn hóa ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức sự kiện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_event_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-032
 * Chuẩn hóa ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức thực thể để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_entity_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-033
 * Chuẩn hóa ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức cảm xúc để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_emotion_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-034
 * Chuẩn hóa ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức tương đồng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_similarity_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-035
 * Chuẩn hóa ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức nhân quả để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_causal_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-036
 * Chuẩn hóa ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức thời gian để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_temporal_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-037
 * Chuẩn hóa ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức không gian để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_spatial_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-038
 * Chuẩn hóa ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức xã hội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_social_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-039
 * Chuẩn hóa ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức chiến thuật để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_strategy_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-040
 * Chuẩn hóa ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuẩn hóa biểu diễn ký ức mâu thuẫn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_normalize_conflicting_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-04-041
 * Cập nhật ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức sự kiện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_event_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_event_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-042
 * Cập nhật ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức thực thể dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_entity_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_entity_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-043
 * Cập nhật ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức cảm xúc dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_emotion_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_emotion_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-044
 * Cập nhật ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức tương đồng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_similarity_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_similarity_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-045
 * Cập nhật ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức nhân quả dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_causal_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_causal_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-046
 * Cập nhật ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức thời gian dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_temporal_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_temporal_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-047
 * Cập nhật ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức không gian dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_spatial_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_spatial_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-048
 * Cập nhật ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức xã hội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_social_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_social_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-049
 * Cập nhật ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức chiến thuật dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_strategy_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_strategy_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-050
 * Cập nhật ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Cập nhật ký ức mâu thuẫn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_update_conflicting_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ret_update_conflicting_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-04-051
 * Đánh giá ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_event_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-052
 * Đánh giá ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức thực thể.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_entity_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-053
 * Đánh giá ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_emotion_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-054
 * Đánh giá ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_similarity_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-055
 * Đánh giá ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức nhân quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_causal_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-056
 * Đánh giá ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức thời gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_temporal_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-057
 * Đánh giá ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức không gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_spatial_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-058
 * Đánh giá ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_social_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-059
 * Đánh giá ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức chiến thuật.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_strategy_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-060
 * Đánh giá ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức mâu thuẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_evaluate_conflicting_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-04-061
 * Truy xuất ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức sự kiện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_event_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_event_memory<T>(agentId, query);
}

/**
 * @id AI-04-062
 * Truy xuất ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức thực thể phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_entity_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_entity_memory<T>(agentId, query);
}

/**
 * @id AI-04-063
 * Truy xuất ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức cảm xúc phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_emotion_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_emotion_memory<T>(agentId, query);
}

/**
 * @id AI-04-064
 * Truy xuất ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức tương đồng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_similarity_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_similarity_memory<T>(agentId, query);
}

/**
 * @id AI-04-065
 * Truy xuất ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức nhân quả phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_causal_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_causal_memory<T>(agentId, query);
}

/**
 * @id AI-04-066
 * Truy xuất ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức thời gian phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_temporal_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_temporal_memory<T>(agentId, query);
}

/**
 * @id AI-04-067
 * Truy xuất ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức không gian phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_spatial_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_spatial_memory<T>(agentId, query);
}

/**
 * @id AI-04-068
 * Truy xuất ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức xã hội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_social_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_social_memory<T>(agentId, query);
}

/**
 * @id AI-04-069
 * Truy xuất ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức chiến thuật phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_strategy_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_strategy_memory<T>(agentId, query);
}

/**
 * @id AI-04-070
 * Truy xuất ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Tìm và trả về ký ức mâu thuẫn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_retrieve_conflicting_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMemoryRetrievalSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ret_retrieve_conflicting_memory<T>(agentId, query);
}

/**
 * @id AI-04-071
 * Tuần tự hóa ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_event_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-072
 * Tuần tự hóa ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức thực thể sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_entity_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-073
 * Tuần tự hóa ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức cảm xúc sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_emotion_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-074
 * Tuần tự hóa ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức tương đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_similarity_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-075
 * Tuần tự hóa ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức nhân quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_causal_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-076
 * Tuần tự hóa ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức thời gian sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_temporal_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-077
 * Tuần tự hóa ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức không gian sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_spatial_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-078
 * Tuần tự hóa ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_social_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-079
 * Tuần tự hóa ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức chiến thuật sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_strategy_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-080
 * Tuần tự hóa ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Chuyển ký ức mâu thuẫn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_serialize_conflicting_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-04-081
 * So sánh ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_event_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-082
 * So sánh ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức thực thể.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_entity_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-083
 * So sánh ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_emotion_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-084
 * So sánh ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_similarity_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-085
 * So sánh ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức nhân quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_causal_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-086
 * So sánh ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức thời gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_temporal_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-087
 * So sánh ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức không gian.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_spatial_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-088
 * So sánh ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_social_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-089
 * So sánh ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức chiến thuật.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_strategy_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-090
 * So sánh ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức mâu thuẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ret_compare_conflicting_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-04-091
 * Tinh gọn ký ức sự kiện trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức sự kiện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_event_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_event_memory(agentId, options);
}

/**
 * @id AI-04-092
 * Tinh gọn ký ức thực thể trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức thực thể lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_entity_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_entity_memory(agentId, options);
}

/**
 * @id AI-04-093
 * Tinh gọn ký ức cảm xúc trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức cảm xúc lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_emotion_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_emotion_memory(agentId, options);
}

/**
 * @id AI-04-094
 * Tinh gọn ký ức tương đồng trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức tương đồng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_similarity_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_similarity_memory(agentId, options);
}

/**
 * @id AI-04-095
 * Tinh gọn ký ức nhân quả trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức nhân quả lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_causal_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_causal_memory(agentId, options);
}

/**
 * @id AI-04-096
 * Tinh gọn ký ức thời gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức thời gian lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_temporal_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_temporal_memory(agentId, options);
}

/**
 * @id AI-04-097
 * Tinh gọn ký ức không gian trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức không gian lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_spatial_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_spatial_memory(agentId, options);
}

/**
 * @id AI-04-098
 * Tinh gọn ký ức xã hội trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức xã hội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_social_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_social_memory(agentId, options);
}

/**
 * @id AI-04-099
 * Tinh gọn ký ức chiến thuật trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức chiến thuật lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_strategy_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_strategy_memory(agentId, options);
}

/**
 * @id AI-04-100
 * Tinh gọn ký ức mâu thuẫn trong module truy xuất và liên kết ký ức.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức mâu thuẫn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ret_prune_conflicting_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMemoryRetrievalSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ret_prune_conflicting_memory(agentId, options);
}

