/**
 * @file met-subsystem.ts
 * @module @aetheria/engine/npc
 * @description MET — Lưu trữ và cập nhật chỉ số (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module MET.
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

export interface INPCMetricsStatsSubsystem {
  met_initialize_health_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_skill_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_trust_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_emotion_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_learning_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_performance_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_relationship_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_resource_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_behavior_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_initialize_system_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_health_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_skill_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_trust_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_emotion_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_learning_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_performance_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_relationship_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_resource_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_behavior_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_capture_system_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  met_validate_health_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_skill_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_trust_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_emotion_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_learning_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_performance_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_relationship_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_resource_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_behavior_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_validate_system_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  met_normalize_health_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_skill_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_trust_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_emotion_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_learning_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_performance_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_relationship_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_resource_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_behavior_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_normalize_system_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  met_update_health_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_skill_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_trust_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_emotion_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_learning_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_performance_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_relationship_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_resource_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_behavior_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_update_system_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  met_evaluate_health_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_skill_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_trust_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_emotion_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_learning_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_performance_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_relationship_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_resource_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_behavior_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_evaluate_system_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  met_retrieve_health_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_skill_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_trust_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_emotion_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_learning_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_performance_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_relationship_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_resource_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_behavior_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_retrieve_system_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  met_serialize_health_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_skill_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_trust_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_emotion_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_learning_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_performance_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_relationship_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_resource_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_behavior_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_serialize_system_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  met_compare_health_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_skill_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_trust_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_emotion_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_learning_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_performance_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_relationship_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_resource_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_behavior_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_compare_system_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  met_prune_health_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_skill_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_trust_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_emotion_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_learning_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_performance_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_relationship_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_resource_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_behavior_stat(agentId: string, options?: PruningOptions): PruningResult;
  met_prune_system_stat(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCMetricsStatsSubsystem extends NPCBaseSubsystem implements INPCMetricsStatsSubsystem {
  public readonly moduleCode = 'MET';
  public readonly moduleTitle = 'MET — Lưu trữ và cập nhật chỉ số (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-05-001
   * Khởi tạo chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số máu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_health_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'health_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-002
   * Khởi tạo chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_skill_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-003
   * Khởi tạo chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số tin tưởng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_trust_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trust_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-004
   * Khởi tạo chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số cảm xúc.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_emotion_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'emotion_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-005
   * Khởi tạo chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số học tập.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_learning_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-006
   * Khởi tạo chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hiệu suất.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_performance_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'performance_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-007
   * Khởi tạo chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số quan hệ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_relationship_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-008
   * Khởi tạo chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số tài nguyên.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_resource_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'resource_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-009
   * Khởi tạo chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hành vi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_behavior_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-010
   * Khởi tạo chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_initialize_system_stat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'system_stat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-05-011
   * Thu thập chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số máu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_health_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'health_stat', data, context);
  }

  /**
   * @id AI-05-012
   * Thu thập chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_skill_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_stat', data, context);
  }

  /**
   * @id AI-05-013
   * Thu thập chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số tin tưởng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_trust_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trust_stat', data, context);
  }

  /**
   * @id AI-05-014
   * Thu thập chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số cảm xúc từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_emotion_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'emotion_stat', data, context);
  }

  /**
   * @id AI-05-015
   * Thu thập chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số học tập từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_learning_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_stat', data, context);
  }

  /**
   * @id AI-05-016
   * Thu thập chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hiệu suất từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_performance_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'performance_stat', data, context);
  }

  /**
   * @id AI-05-017
   * Thu thập chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số quan hệ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_relationship_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_stat', data, context);
  }

  /**
   * @id AI-05-018
   * Thu thập chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số tài nguyên từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_resource_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'resource_stat', data, context);
  }

  /**
   * @id AI-05-019
   * Thu thập chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hành vi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_behavior_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_stat', data, context);
  }

  /**
   * @id AI-05-020
   * Thu thập chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hệ thống từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_capture_system_stat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'system_stat', data, context);
  }

  /**
   * @id AI-05-021
   * Kiểm tra tính hợp lệ của chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số máu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_health_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-022
   * Kiểm tra tính hợp lệ của chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_skill_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-023
   * Kiểm tra tính hợp lệ của chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số tin tưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_trust_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-024
   * Kiểm tra tính hợp lệ của chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_emotion_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-025
   * Kiểm tra tính hợp lệ của chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_learning_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-026
   * Kiểm tra tính hợp lệ của chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hiệu suất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_performance_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-027
   * Kiểm tra tính hợp lệ của chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_relationship_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-028
   * Kiểm tra tính hợp lệ của chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số tài nguyên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_resource_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-029
   * Kiểm tra tính hợp lệ của chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_behavior_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-030
   * Kiểm tra tính hợp lệ của chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hệ thống.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_validate_system_stat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-05-031
   * Chuẩn hóa chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số máu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_health_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-032
   * Chuẩn hóa chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_skill_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-033
   * Chuẩn hóa chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số tin tưởng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_trust_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-034
   * Chuẩn hóa chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số cảm xúc để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_emotion_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-035
   * Chuẩn hóa chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số học tập để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_learning_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-036
   * Chuẩn hóa chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số hiệu suất để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_performance_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-037
   * Chuẩn hóa chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số quan hệ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_relationship_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-038
   * Chuẩn hóa chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số tài nguyên để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_resource_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-039
   * Chuẩn hóa chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số hành vi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_behavior_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-040
   * Chuẩn hóa chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số hệ thống để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_normalize_system_stat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-05-041
   * Cập nhật chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số máu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_health_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'health_stat', updateData, context);
  }

  /**
   * @id AI-05-042
   * Cập nhật chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_skill_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_stat', updateData, context);
  }

  /**
   * @id AI-05-043
   * Cập nhật chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số tin tưởng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_trust_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'trust_stat', updateData, context);
  }

  /**
   * @id AI-05-044
   * Cập nhật chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số cảm xúc dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_emotion_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'emotion_stat', updateData, context);
  }

  /**
   * @id AI-05-045
   * Cập nhật chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số học tập dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_learning_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'learning_stat', updateData, context);
  }

  /**
   * @id AI-05-046
   * Cập nhật chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số hiệu suất dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_performance_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'performance_stat', updateData, context);
  }

  /**
   * @id AI-05-047
   * Cập nhật chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số quan hệ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_relationship_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'relationship_stat', updateData, context);
  }

  /**
   * @id AI-05-048
   * Cập nhật chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số tài nguyên dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_resource_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'resource_stat', updateData, context);
  }

  /**
   * @id AI-05-049
   * Cập nhật chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số hành vi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_behavior_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'behavior_stat', updateData, context);
  }

  /**
   * @id AI-05-050
   * Cập nhật chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Cập nhật chỉ số hệ thống dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_update_system_stat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'system_stat', updateData, context);
  }

  /**
   * @id AI-05-051
   * Đánh giá chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số máu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_health_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-052
   * Đánh giá chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_skill_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-053
   * Đánh giá chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số tin tưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_trust_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-054
   * Đánh giá chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_emotion_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-055
   * Đánh giá chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_learning_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-056
   * Đánh giá chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hiệu suất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_performance_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-057
   * Đánh giá chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_relationship_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-058
   * Đánh giá chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số tài nguyên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_resource_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-059
   * Đánh giá chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_behavior_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-060
   * Đánh giá chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hệ thống.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_evaluate_system_stat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-05-061
   * Truy xuất chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số máu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_health_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'health_stat', query);
  }

  /**
   * @id AI-05-062
   * Truy xuất chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_skill_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_stat', query);
  }

  /**
   * @id AI-05-063
   * Truy xuất chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số tin tưởng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_trust_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'trust_stat', query);
  }

  /**
   * @id AI-05-064
   * Truy xuất chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số cảm xúc phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_emotion_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'emotion_stat', query);
  }

  /**
   * @id AI-05-065
   * Truy xuất chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số học tập phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_learning_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'learning_stat', query);
  }

  /**
   * @id AI-05-066
   * Truy xuất chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số hiệu suất phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_performance_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'performance_stat', query);
  }

  /**
   * @id AI-05-067
   * Truy xuất chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số quan hệ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_relationship_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'relationship_stat', query);
  }

  /**
   * @id AI-05-068
   * Truy xuất chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số tài nguyên phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_resource_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'resource_stat', query);
  }

  /**
   * @id AI-05-069
   * Truy xuất chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số hành vi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_behavior_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'behavior_stat', query);
  }

  /**
   * @id AI-05-070
   * Truy xuất chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Tìm và trả về chỉ số hệ thống phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_retrieve_system_stat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'system_stat', query);
  }

  /**
   * @id AI-05-071
   * Tuần tự hóa chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số máu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_health_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-072
   * Tuần tự hóa chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_skill_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-073
   * Tuần tự hóa chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số tin tưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_trust_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-074
   * Tuần tự hóa chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số cảm xúc sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_emotion_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-075
   * Tuần tự hóa chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số học tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_learning_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-076
   * Tuần tự hóa chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số hiệu suất sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_performance_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-077
   * Tuần tự hóa chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_relationship_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-078
   * Tuần tự hóa chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số tài nguyên sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_resource_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-079
   * Tuần tự hóa chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_behavior_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-080
   * Tuần tự hóa chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Chuyển chỉ số hệ thống sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_serialize_system_stat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-05-081
   * So sánh chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số máu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_health_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-082
   * So sánh chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_skill_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-083
   * So sánh chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số tin tưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_trust_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-084
   * So sánh chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số cảm xúc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_emotion_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-085
   * So sánh chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_learning_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-086
   * So sánh chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hiệu suất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_performance_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-087
   * So sánh chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_relationship_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-088
   * So sánh chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số tài nguyên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_resource_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-089
   * So sánh chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_behavior_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-090
   * So sánh chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hệ thống.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public met_compare_system_stat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-05-091
   * Tinh gọn chỉ số máu trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số máu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_health_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'health_stat', options);
  }

  /**
   * @id AI-05-092
   * Tinh gọn chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_skill_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_stat', options);
  }

  /**
   * @id AI-05-093
   * Tinh gọn chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số tin tưởng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_trust_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'trust_stat', options);
  }

  /**
   * @id AI-05-094
   * Tinh gọn chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số cảm xúc lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_emotion_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'emotion_stat', options);
  }

  /**
   * @id AI-05-095
   * Tinh gọn chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số học tập lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_learning_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'learning_stat', options);
  }

  /**
   * @id AI-05-096
   * Tinh gọn chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số hiệu suất lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_performance_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'performance_stat', options);
  }

  /**
   * @id AI-05-097
   * Tinh gọn chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số quan hệ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_relationship_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'relationship_stat', options);
  }

  /**
   * @id AI-05-098
   * Tinh gọn chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số tài nguyên lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_resource_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'resource_stat', options);
  }

  /**
   * @id AI-05-099
   * Tinh gọn chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số hành vi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_behavior_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'behavior_stat', options);
  }

  /**
   * @id AI-05-100
   * Tinh gọn chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số hệ thống lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public met_prune_system_stat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'system_stat', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for MET)
// ============================================================================

let defaultSubsystem: NPCMetricsStatsSubsystem | null = null;
function getSubsystem(): NPCMetricsStatsSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCMetricsStatsSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-05-001
 * Khởi tạo chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số máu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_health_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_health_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-002
 * Khởi tạo chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_skill_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_skill_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-003
 * Khởi tạo chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số tin tưởng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_trust_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_trust_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-004
 * Khởi tạo chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số cảm xúc.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_emotion_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_emotion_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-005
 * Khởi tạo chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số học tập.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_learning_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_learning_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-006
 * Khởi tạo chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hiệu suất.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_performance_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_performance_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-007
 * Khởi tạo chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số quan hệ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_relationship_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_relationship_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-008
 * Khởi tạo chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số tài nguyên.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_resource_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_resource_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-009
 * Khởi tạo chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hành vi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_behavior_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_behavior_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-010
 * Khởi tạo chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_initialize_system_stat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_initialize_system_stat<T>(agentId, initialData, context);
}

/**
 * @id AI-05-011
 * Thu thập chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số máu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_health_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_health_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-012
 * Thu thập chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_skill_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_skill_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-013
 * Thu thập chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số tin tưởng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_trust_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_trust_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-014
 * Thu thập chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số cảm xúc từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_emotion_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_emotion_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-015
 * Thu thập chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số học tập từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_learning_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_learning_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-016
 * Thu thập chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hiệu suất từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_performance_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_performance_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-017
 * Thu thập chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số quan hệ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_relationship_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_relationship_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-018
 * Thu thập chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số tài nguyên từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_resource_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_resource_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-019
 * Thu thập chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hành vi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_behavior_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_behavior_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-020
 * Thu thập chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số hệ thống từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_capture_system_stat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_capture_system_stat<T>(agentId, data, context);
}

/**
 * @id AI-05-021
 * Kiểm tra tính hợp lệ của chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số máu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_health_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-022
 * Kiểm tra tính hợp lệ của chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_skill_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-023
 * Kiểm tra tính hợp lệ của chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số tin tưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_trust_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-024
 * Kiểm tra tính hợp lệ của chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_emotion_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-025
 * Kiểm tra tính hợp lệ của chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_learning_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-026
 * Kiểm tra tính hợp lệ của chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hiệu suất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_performance_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-027
 * Kiểm tra tính hợp lệ của chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_relationship_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-028
 * Kiểm tra tính hợp lệ của chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số tài nguyên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_resource_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-029
 * Kiểm tra tính hợp lệ của chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_behavior_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-030
 * Kiểm tra tính hợp lệ của chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số hệ thống.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_validate_system_stat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-05-031
 * Chuẩn hóa chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số máu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_health_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-032
 * Chuẩn hóa chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_skill_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-033
 * Chuẩn hóa chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số tin tưởng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_trust_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-034
 * Chuẩn hóa chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số cảm xúc để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_emotion_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-035
 * Chuẩn hóa chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số học tập để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_learning_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-036
 * Chuẩn hóa chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số hiệu suất để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_performance_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-037
 * Chuẩn hóa chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số quan hệ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_relationship_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-038
 * Chuẩn hóa chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số tài nguyên để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_resource_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-039
 * Chuẩn hóa chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số hành vi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_behavior_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-040
 * Chuẩn hóa chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số hệ thống để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_normalize_system_stat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-05-041
 * Cập nhật chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số máu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_health_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_health_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-042
 * Cập nhật chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_skill_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_skill_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-043
 * Cập nhật chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số tin tưởng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_trust_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_trust_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-044
 * Cập nhật chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số cảm xúc dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_emotion_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_emotion_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-045
 * Cập nhật chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số học tập dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_learning_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_learning_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-046
 * Cập nhật chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số hiệu suất dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_performance_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_performance_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-047
 * Cập nhật chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số quan hệ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_relationship_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_relationship_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-048
 * Cập nhật chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số tài nguyên dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_resource_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_resource_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-049
 * Cập nhật chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số hành vi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_behavior_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_behavior_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-050
 * Cập nhật chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Cập nhật chỉ số hệ thống dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_update_system_stat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).met_update_system_stat<T>(agentId, updateData, context);
}

/**
 * @id AI-05-051
 * Đánh giá chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số máu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_health_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-052
 * Đánh giá chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_skill_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-053
 * Đánh giá chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số tin tưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_trust_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-054
 * Đánh giá chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_emotion_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-055
 * Đánh giá chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_learning_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-056
 * Đánh giá chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hiệu suất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_performance_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-057
 * Đánh giá chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_relationship_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-058
 * Đánh giá chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số tài nguyên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_resource_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-059
 * Đánh giá chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_behavior_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-060
 * Đánh giá chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số hệ thống.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_evaluate_system_stat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-05-061
 * Truy xuất chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số máu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_health_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_health_stat<T>(agentId, query);
}

/**
 * @id AI-05-062
 * Truy xuất chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_skill_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_skill_stat<T>(agentId, query);
}

/**
 * @id AI-05-063
 * Truy xuất chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số tin tưởng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_trust_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_trust_stat<T>(agentId, query);
}

/**
 * @id AI-05-064
 * Truy xuất chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số cảm xúc phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_emotion_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_emotion_stat<T>(agentId, query);
}

/**
 * @id AI-05-065
 * Truy xuất chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số học tập phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_learning_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_learning_stat<T>(agentId, query);
}

/**
 * @id AI-05-066
 * Truy xuất chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số hiệu suất phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_performance_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_performance_stat<T>(agentId, query);
}

/**
 * @id AI-05-067
 * Truy xuất chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số quan hệ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_relationship_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_relationship_stat<T>(agentId, query);
}

/**
 * @id AI-05-068
 * Truy xuất chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số tài nguyên phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_resource_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_resource_stat<T>(agentId, query);
}

/**
 * @id AI-05-069
 * Truy xuất chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số hành vi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_behavior_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_behavior_stat<T>(agentId, query);
}

/**
 * @id AI-05-070
 * Truy xuất chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Tìm và trả về chỉ số hệ thống phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_retrieve_system_stat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCMetricsStatsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).met_retrieve_system_stat<T>(agentId, query);
}

/**
 * @id AI-05-071
 * Tuần tự hóa chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số máu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_health_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-072
 * Tuần tự hóa chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_skill_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-073
 * Tuần tự hóa chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số tin tưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_trust_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-074
 * Tuần tự hóa chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số cảm xúc sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_emotion_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-075
 * Tuần tự hóa chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số học tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_learning_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-076
 * Tuần tự hóa chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số hiệu suất sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_performance_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-077
 * Tuần tự hóa chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_relationship_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-078
 * Tuần tự hóa chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số tài nguyên sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_resource_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-079
 * Tuần tự hóa chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_behavior_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-080
 * Tuần tự hóa chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Chuyển chỉ số hệ thống sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_serialize_system_stat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-05-081
 * So sánh chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số máu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_health_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-082
 * So sánh chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_skill_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-083
 * So sánh chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số tin tưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_trust_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-084
 * So sánh chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số cảm xúc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_emotion_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-085
 * So sánh chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_learning_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-086
 * So sánh chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hiệu suất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_performance_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-087
 * So sánh chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_relationship_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-088
 * So sánh chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số tài nguyên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_resource_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-089
 * So sánh chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_behavior_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-090
 * So sánh chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số hệ thống.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function met_compare_system_stat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-05-091
 * Tinh gọn chỉ số máu trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số máu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_health_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_health_stat(agentId, options);
}

/**
 * @id AI-05-092
 * Tinh gọn chỉ số kỹ năng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_skill_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_skill_stat(agentId, options);
}

/**
 * @id AI-05-093
 * Tinh gọn chỉ số tin tưởng trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số tin tưởng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_trust_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_trust_stat(agentId, options);
}

/**
 * @id AI-05-094
 * Tinh gọn chỉ số cảm xúc trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số cảm xúc lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_emotion_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_emotion_stat(agentId, options);
}

/**
 * @id AI-05-095
 * Tinh gọn chỉ số học tập trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số học tập lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_learning_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_learning_stat(agentId, options);
}

/**
 * @id AI-05-096
 * Tinh gọn chỉ số hiệu suất trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số hiệu suất lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_performance_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_performance_stat(agentId, options);
}

/**
 * @id AI-05-097
 * Tinh gọn chỉ số quan hệ trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số quan hệ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_relationship_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_relationship_stat(agentId, options);
}

/**
 * @id AI-05-098
 * Tinh gọn chỉ số tài nguyên trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số tài nguyên lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_resource_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_resource_stat(agentId, options);
}

/**
 * @id AI-05-099
 * Tinh gọn chỉ số hành vi trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số hành vi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_behavior_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_behavior_stat(agentId, options);
}

/**
 * @id AI-05-100
 * Tinh gọn chỉ số hệ thống trong module lưu trữ và cập nhật chỉ số.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số hệ thống lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function met_prune_system_stat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCMetricsStatsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).met_prune_system_stat(agentId, options);
}

