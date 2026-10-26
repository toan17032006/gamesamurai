/**
 * @file out-subsystem.ts
 * @module @aetheria/engine/npc
 * @description OUT — Học từ thành công và thất bại (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module OUT.
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

export interface INPCOutcomeLearningSubsystem {
  out_initialize_success_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_failure_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_prediction_error<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_action_result<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_mistake_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_success_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_lesson_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_causal_hypothesis<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_recovery_attempt<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_initialize_outcome_summary<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_success_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_failure_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_prediction_error<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_action_result<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_mistake_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_success_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_lesson_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_causal_hypothesis<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_recovery_attempt<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_capture_outcome_summary<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  out_validate_success_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_failure_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_prediction_error<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_action_result<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_mistake_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_success_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_lesson_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_causal_hypothesis<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_recovery_attempt<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_validate_outcome_summary<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  out_normalize_success_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_failure_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_prediction_error<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_action_result<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_mistake_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_success_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_lesson_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_causal_hypothesis<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_recovery_attempt<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_normalize_outcome_summary<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  out_update_success_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_failure_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_prediction_error<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_action_result<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_mistake_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_success_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_lesson_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_causal_hypothesis<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_recovery_attempt<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_update_outcome_summary<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  out_evaluate_success_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_failure_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_prediction_error<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_action_result<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_mistake_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_success_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_lesson_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_causal_hypothesis<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_recovery_attempt<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_evaluate_outcome_summary<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  out_retrieve_success_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_failure_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_prediction_error<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_action_result<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_mistake_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_success_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_lesson_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_causal_hypothesis<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_recovery_attempt<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_retrieve_outcome_summary<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  out_serialize_success_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_failure_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_prediction_error<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_action_result<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_mistake_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_success_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_lesson_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_causal_hypothesis<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_recovery_attempt<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_serialize_outcome_summary<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  out_compare_success_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_failure_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_prediction_error<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_action_result<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_mistake_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_success_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_lesson_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_causal_hypothesis<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_recovery_attempt<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_compare_outcome_summary<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  out_prune_success_episode(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_failure_episode(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_prediction_error(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_action_result(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_mistake_pattern(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_success_pattern(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_lesson_record(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_causal_hypothesis(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_recovery_attempt(agentId: string, options?: PruningOptions): PruningResult;
  out_prune_outcome_summary(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCOutcomeLearningSubsystem extends NPCBaseSubsystem implements INPCOutcomeLearningSubsystem {
  public readonly moduleCode = 'OUT';
  public readonly moduleTitle = 'OUT — Học từ thành công và thất bại (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-06-001
   * Khởi tạo lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thành công.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_success_episode<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'success_episode', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-002
   * Khởi tạo lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thất bại.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_failure_episode<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'failure_episode', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-003
   * Khởi tạo sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_error', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-004
   * Khởi tạo kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả hành động.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_action_result<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_result', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-005
   * Khởi tạo mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu sai lầm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_mistake_pattern<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'mistake_pattern', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-006
   * Khởi tạo mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu thành công.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_success_pattern<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'success_pattern', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-007
   * Khởi tạo bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi bài học.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_lesson_record<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'lesson_record', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-008
   * Khởi tạo giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giả thuyết nguyên nhân.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_causal_hypothesis<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'causal_hypothesis', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-009
   * Khởi tạo lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thử phục hồi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_recovery_attempt<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recovery_attempt', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-010
   * Khởi tạo tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tóm tắt kết quả.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_initialize_outcome_summary<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'outcome_summary', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-06-011
   * Thu thập lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến lần thành công từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_success_episode<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'success_episode', data, context);
  }

  /**
   * @id AI-06-012
   * Thu thập lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến lần thất bại từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_failure_episode<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'failure_episode', data, context);
  }

  /**
   * @id AI-06-013
   * Thu thập sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_error', data, context);
  }

  /**
   * @id AI-06-014
   * Thu thập kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến kết quả hành động từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_action_result<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_result', data, context);
  }

  /**
   * @id AI-06-015
   * Thu thập mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu sai lầm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_mistake_pattern<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'mistake_pattern', data, context);
  }

  /**
   * @id AI-06-016
   * Thu thập mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu thành công từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_success_pattern<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'success_pattern', data, context);
  }

  /**
   * @id AI-06-017
   * Thu thập bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến bản ghi bài học từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_lesson_record<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'lesson_record', data, context);
  }

  /**
   * @id AI-06-018
   * Thu thập giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến giả thuyết nguyên nhân từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_causal_hypothesis<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'causal_hypothesis', data, context);
  }

  /**
   * @id AI-06-019
   * Thu thập lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến lần thử phục hồi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_recovery_attempt<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recovery_attempt', data, context);
  }

  /**
   * @id AI-06-020
   * Thu thập tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Thu thập dữ liệu liên quan đến tóm tắt kết quả từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_capture_outcome_summary<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'outcome_summary', data, context);
  }

  /**
   * @id AI-06-021
   * Kiểm tra tính hợp lệ của lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_success_episode<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-022
   * Kiểm tra tính hợp lệ của lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thất bại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_failure_episode<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-023
   * Kiểm tra tính hợp lệ của sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_prediction_error<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-024
   * Kiểm tra tính hợp lệ của kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_action_result<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-025
   * Kiểm tra tính hợp lệ của mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu sai lầm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_mistake_pattern<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-026
   * Kiểm tra tính hợp lệ của mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_success_pattern<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-027
   * Kiểm tra tính hợp lệ của bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi bài học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_lesson_record<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-028
   * Kiểm tra tính hợp lệ của giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giả thuyết nguyên nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_causal_hypothesis<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-029
   * Kiểm tra tính hợp lệ của lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thử phục hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_recovery_attempt<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-030
   * Kiểm tra tính hợp lệ của tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tóm tắt kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_validate_outcome_summary<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-06-031
   * Chuẩn hóa lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn lần thành công để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_success_episode<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-032
   * Chuẩn hóa lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn lần thất bại để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_failure_episode<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-033
   * Chuẩn hóa sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_prediction_error<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-034
   * Chuẩn hóa kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn kết quả hành động để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_action_result<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-035
   * Chuẩn hóa mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn mẫu sai lầm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_mistake_pattern<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-036
   * Chuẩn hóa mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn mẫu thành công để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_success_pattern<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-037
   * Chuẩn hóa bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn bản ghi bài học để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_lesson_record<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-038
   * Chuẩn hóa giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn giả thuyết nguyên nhân để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_causal_hypothesis<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-039
   * Chuẩn hóa lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn lần thử phục hồi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_recovery_attempt<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-040
   * Chuẩn hóa tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Chuẩn hóa biểu diễn tóm tắt kết quả để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_normalize_outcome_summary<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-06-041
   * Cập nhật lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật lần thành công dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_success_episode<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'success_episode', updateData, context);
  }

  /**
   * @id AI-06-042
   * Cập nhật lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật lần thất bại dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_failure_episode<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'failure_episode', updateData, context);
  }

  /**
   * @id AI-06-043
   * Cập nhật sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'prediction_error', updateData, context);
  }

  /**
   * @id AI-06-044
   * Cập nhật kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật kết quả hành động dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_action_result<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'action_result', updateData, context);
  }

  /**
   * @id AI-06-045
   * Cập nhật mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật mẫu sai lầm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_mistake_pattern<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'mistake_pattern', updateData, context);
  }

  /**
   * @id AI-06-046
   * Cập nhật mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật mẫu thành công dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_success_pattern<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'success_pattern', updateData, context);
  }

  /**
   * @id AI-06-047
   * Cập nhật bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật bản ghi bài học dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_lesson_record<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'lesson_record', updateData, context);
  }

  /**
   * @id AI-06-048
   * Cập nhật giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật giả thuyết nguyên nhân dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_causal_hypothesis<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'causal_hypothesis', updateData, context);
  }

  /**
   * @id AI-06-049
   * Cập nhật lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật lần thử phục hồi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_recovery_attempt<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'recovery_attempt', updateData, context);
  }

  /**
   * @id AI-06-050
   * Cập nhật tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Cập nhật tóm tắt kết quả dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_update_outcome_summary<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'outcome_summary', updateData, context);
  }

  /**
   * @id AI-06-051
   * Đánh giá lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_success_episode<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-052
   * Đánh giá lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thất bại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_failure_episode<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-053
   * Đánh giá sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_prediction_error<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-054
   * Đánh giá kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_action_result<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-055
   * Đánh giá mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu sai lầm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_mistake_pattern<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-056
   * Đánh giá mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_success_pattern<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-057
   * Đánh giá bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi bài học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_lesson_record<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-058
   * Đánh giá giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giả thuyết nguyên nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_causal_hypothesis<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-059
   * Đánh giá lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thử phục hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_recovery_attempt<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-060
   * Đánh giá tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tóm tắt kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_evaluate_outcome_summary<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-06-061
   * Truy xuất lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về lần thành công phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_success_episode<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'success_episode', query);
  }

  /**
   * @id AI-06-062
   * Truy xuất lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về lần thất bại phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_failure_episode<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'failure_episode', query);
  }

  /**
   * @id AI-06-063
   * Truy xuất sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'prediction_error', query);
  }

  /**
   * @id AI-06-064
   * Truy xuất kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về kết quả hành động phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_action_result<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'action_result', query);
  }

  /**
   * @id AI-06-065
   * Truy xuất mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về mẫu sai lầm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_mistake_pattern<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'mistake_pattern', query);
  }

  /**
   * @id AI-06-066
   * Truy xuất mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về mẫu thành công phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_success_pattern<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'success_pattern', query);
  }

  /**
   * @id AI-06-067
   * Truy xuất bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về bản ghi bài học phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_lesson_record<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'lesson_record', query);
  }

  /**
   * @id AI-06-068
   * Truy xuất giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về giả thuyết nguyên nhân phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_causal_hypothesis<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'causal_hypothesis', query);
  }

  /**
   * @id AI-06-069
   * Truy xuất lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về lần thử phục hồi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_recovery_attempt<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'recovery_attempt', query);
  }

  /**
   * @id AI-06-070
   * Truy xuất tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Tìm và trả về tóm tắt kết quả phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_retrieve_outcome_summary<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'outcome_summary', query);
  }

  /**
   * @id AI-06-071
   * Tuần tự hóa lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Chuyển lần thành công sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_success_episode<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-072
   * Tuần tự hóa lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Chuyển lần thất bại sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_failure_episode<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-073
   * Tuần tự hóa sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_prediction_error<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-074
   * Tuần tự hóa kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Chuyển kết quả hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_action_result<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-075
   * Tuần tự hóa mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Chuyển mẫu sai lầm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_mistake_pattern<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-076
   * Tuần tự hóa mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Chuyển mẫu thành công sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_success_pattern<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-077
   * Tuần tự hóa bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Chuyển bản ghi bài học sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_lesson_record<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-078
   * Tuần tự hóa giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Chuyển giả thuyết nguyên nhân sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_causal_hypothesis<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-079
   * Tuần tự hóa lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Chuyển lần thử phục hồi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_recovery_attempt<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-080
   * Tuần tự hóa tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Chuyển tóm tắt kết quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_serialize_outcome_summary<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-06-081
   * So sánh lần thành công trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_success_episode<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-082
   * So sánh lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thất bại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_failure_episode<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-083
   * So sánh sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_prediction_error<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-084
   * So sánh kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_action_result<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-085
   * So sánh mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu sai lầm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_mistake_pattern<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-086
   * So sánh mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu thành công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_success_pattern<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-087
   * So sánh bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi bài học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_lesson_record<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-088
   * So sánh giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của giả thuyết nguyên nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_causal_hypothesis<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-089
   * So sánh lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thử phục hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_recovery_attempt<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-090
   * So sánh tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tóm tắt kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public out_compare_outcome_summary<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-06-091
   * Tinh gọn lần thành công trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần lần thành công lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_success_episode(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'success_episode', options);
  }

  /**
   * @id AI-06-092
   * Tinh gọn lần thất bại trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần lần thất bại lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_failure_episode(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'failure_episode', options);
  }

  /**
   * @id AI-06-093
   * Tinh gọn sai số dự đoán trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_prediction_error(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'prediction_error', options);
  }

  /**
   * @id AI-06-094
   * Tinh gọn kết quả hành động trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần kết quả hành động lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_action_result(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'action_result', options);
  }

  /**
   * @id AI-06-095
   * Tinh gọn mẫu sai lầm trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu sai lầm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_mistake_pattern(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'mistake_pattern', options);
  }

  /**
   * @id AI-06-096
   * Tinh gọn mẫu thành công trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu thành công lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_success_pattern(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'success_pattern', options);
  }

  /**
   * @id AI-06-097
   * Tinh gọn bản ghi bài học trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần bản ghi bài học lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_lesson_record(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'lesson_record', options);
  }

  /**
   * @id AI-06-098
   * Tinh gọn giả thuyết nguyên nhân trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần giả thuyết nguyên nhân lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_causal_hypothesis(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'causal_hypothesis', options);
  }

  /**
   * @id AI-06-099
   * Tinh gọn lần thử phục hồi trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần lần thử phục hồi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_recovery_attempt(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'recovery_attempt', options);
  }

  /**
   * @id AI-06-100
   * Tinh gọn tóm tắt kết quả trong module học từ thành công và thất bại.
   * Mục đích: Loại bỏ hoặc gộp phần tóm tắt kết quả lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public out_prune_outcome_summary(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'outcome_summary', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for OUT)
// ============================================================================

let defaultSubsystem: NPCOutcomeLearningSubsystem | null = null;
function getSubsystem(): NPCOutcomeLearningSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCOutcomeLearningSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-06-001
 * Khởi tạo lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thành công.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_success_episode<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_success_episode<T>(agentId, initialData, context);
}

/**
 * @id AI-06-002
 * Khởi tạo lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thất bại.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_failure_episode<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_failure_episode<T>(agentId, initialData, context);
}

/**
 * @id AI-06-003
 * Khởi tạo sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_prediction_error<T>(agentId, initialData, context);
}

/**
 * @id AI-06-004
 * Khởi tạo kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả hành động.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_action_result<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_action_result<T>(agentId, initialData, context);
}

/**
 * @id AI-06-005
 * Khởi tạo mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu sai lầm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_mistake_pattern<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_mistake_pattern<T>(agentId, initialData, context);
}

/**
 * @id AI-06-006
 * Khởi tạo mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu thành công.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_success_pattern<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_success_pattern<T>(agentId, initialData, context);
}

/**
 * @id AI-06-007
 * Khởi tạo bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi bài học.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_lesson_record<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_lesson_record<T>(agentId, initialData, context);
}

/**
 * @id AI-06-008
 * Khởi tạo giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giả thuyết nguyên nhân.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_causal_hypothesis<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_causal_hypothesis<T>(agentId, initialData, context);
}

/**
 * @id AI-06-009
 * Khởi tạo lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lần thử phục hồi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_recovery_attempt<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_recovery_attempt<T>(agentId, initialData, context);
}

/**
 * @id AI-06-010
 * Khởi tạo tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tóm tắt kết quả.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_initialize_outcome_summary<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_initialize_outcome_summary<T>(agentId, initialData, context);
}

/**
 * @id AI-06-011
 * Thu thập lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến lần thành công từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_success_episode<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_success_episode<T>(agentId, data, context);
}

/**
 * @id AI-06-012
 * Thu thập lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến lần thất bại từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_failure_episode<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_failure_episode<T>(agentId, data, context);
}

/**
 * @id AI-06-013
 * Thu thập sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_prediction_error<T>(agentId, data, context);
}

/**
 * @id AI-06-014
 * Thu thập kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến kết quả hành động từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_action_result<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_action_result<T>(agentId, data, context);
}

/**
 * @id AI-06-015
 * Thu thập mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu sai lầm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_mistake_pattern<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_mistake_pattern<T>(agentId, data, context);
}

/**
 * @id AI-06-016
 * Thu thập mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu thành công từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_success_pattern<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_success_pattern<T>(agentId, data, context);
}

/**
 * @id AI-06-017
 * Thu thập bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến bản ghi bài học từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_lesson_record<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_lesson_record<T>(agentId, data, context);
}

/**
 * @id AI-06-018
 * Thu thập giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến giả thuyết nguyên nhân từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_causal_hypothesis<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_causal_hypothesis<T>(agentId, data, context);
}

/**
 * @id AI-06-019
 * Thu thập lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến lần thử phục hồi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_recovery_attempt<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_recovery_attempt<T>(agentId, data, context);
}

/**
 * @id AI-06-020
 * Thu thập tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Thu thập dữ liệu liên quan đến tóm tắt kết quả từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_capture_outcome_summary<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_capture_outcome_summary<T>(agentId, data, context);
}

/**
 * @id AI-06-021
 * Kiểm tra tính hợp lệ của lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_success_episode<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-022
 * Kiểm tra tính hợp lệ của lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thất bại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_failure_episode<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-023
 * Kiểm tra tính hợp lệ của sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_prediction_error<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-024
 * Kiểm tra tính hợp lệ của kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_action_result<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-025
 * Kiểm tra tính hợp lệ của mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu sai lầm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_mistake_pattern<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-026
 * Kiểm tra tính hợp lệ của mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_success_pattern<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-027
 * Kiểm tra tính hợp lệ của bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi bài học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_lesson_record<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-028
 * Kiểm tra tính hợp lệ của giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giả thuyết nguyên nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_causal_hypothesis<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-029
 * Kiểm tra tính hợp lệ của lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lần thử phục hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_recovery_attempt<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-030
 * Kiểm tra tính hợp lệ của tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tóm tắt kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_validate_outcome_summary<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-06-031
 * Chuẩn hóa lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn lần thành công để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_success_episode<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-032
 * Chuẩn hóa lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn lần thất bại để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_failure_episode<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-033
 * Chuẩn hóa sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_prediction_error<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-034
 * Chuẩn hóa kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn kết quả hành động để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_action_result<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-035
 * Chuẩn hóa mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn mẫu sai lầm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_mistake_pattern<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-036
 * Chuẩn hóa mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn mẫu thành công để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_success_pattern<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-037
 * Chuẩn hóa bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn bản ghi bài học để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_lesson_record<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-038
 * Chuẩn hóa giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn giả thuyết nguyên nhân để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_causal_hypothesis<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-039
 * Chuẩn hóa lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn lần thử phục hồi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_recovery_attempt<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-040
 * Chuẩn hóa tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Chuẩn hóa biểu diễn tóm tắt kết quả để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_normalize_outcome_summary<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-06-041
 * Cập nhật lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật lần thành công dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_success_episode<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_success_episode<T>(agentId, updateData, context);
}

/**
 * @id AI-06-042
 * Cập nhật lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật lần thất bại dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_failure_episode<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_failure_episode<T>(agentId, updateData, context);
}

/**
 * @id AI-06-043
 * Cập nhật sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_prediction_error<T>(agentId, updateData, context);
}

/**
 * @id AI-06-044
 * Cập nhật kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật kết quả hành động dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_action_result<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_action_result<T>(agentId, updateData, context);
}

/**
 * @id AI-06-045
 * Cập nhật mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật mẫu sai lầm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_mistake_pattern<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_mistake_pattern<T>(agentId, updateData, context);
}

/**
 * @id AI-06-046
 * Cập nhật mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật mẫu thành công dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_success_pattern<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_success_pattern<T>(agentId, updateData, context);
}

/**
 * @id AI-06-047
 * Cập nhật bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật bản ghi bài học dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_lesson_record<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_lesson_record<T>(agentId, updateData, context);
}

/**
 * @id AI-06-048
 * Cập nhật giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật giả thuyết nguyên nhân dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_causal_hypothesis<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_causal_hypothesis<T>(agentId, updateData, context);
}

/**
 * @id AI-06-049
 * Cập nhật lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật lần thử phục hồi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_recovery_attempt<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_recovery_attempt<T>(agentId, updateData, context);
}

/**
 * @id AI-06-050
 * Cập nhật tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Cập nhật tóm tắt kết quả dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_update_outcome_summary<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).out_update_outcome_summary<T>(agentId, updateData, context);
}

/**
 * @id AI-06-051
 * Đánh giá lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_success_episode<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-052
 * Đánh giá lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thất bại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_failure_episode<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-053
 * Đánh giá sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_prediction_error<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-054
 * Đánh giá kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_action_result<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-055
 * Đánh giá mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu sai lầm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_mistake_pattern<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-056
 * Đánh giá mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_success_pattern<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-057
 * Đánh giá bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi bài học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_lesson_record<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-058
 * Đánh giá giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giả thuyết nguyên nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_causal_hypothesis<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-059
 * Đánh giá lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lần thử phục hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_recovery_attempt<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-060
 * Đánh giá tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tóm tắt kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_evaluate_outcome_summary<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-06-061
 * Truy xuất lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về lần thành công phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_success_episode<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_success_episode<T>(agentId, query);
}

/**
 * @id AI-06-062
 * Truy xuất lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về lần thất bại phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_failure_episode<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_failure_episode<T>(agentId, query);
}

/**
 * @id AI-06-063
 * Truy xuất sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_prediction_error<T>(agentId, query);
}

/**
 * @id AI-06-064
 * Truy xuất kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về kết quả hành động phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_action_result<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_action_result<T>(agentId, query);
}

/**
 * @id AI-06-065
 * Truy xuất mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về mẫu sai lầm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_mistake_pattern<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_mistake_pattern<T>(agentId, query);
}

/**
 * @id AI-06-066
 * Truy xuất mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về mẫu thành công phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_success_pattern<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_success_pattern<T>(agentId, query);
}

/**
 * @id AI-06-067
 * Truy xuất bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về bản ghi bài học phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_lesson_record<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_lesson_record<T>(agentId, query);
}

/**
 * @id AI-06-068
 * Truy xuất giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về giả thuyết nguyên nhân phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_causal_hypothesis<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_causal_hypothesis<T>(agentId, query);
}

/**
 * @id AI-06-069
 * Truy xuất lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về lần thử phục hồi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_recovery_attempt<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_recovery_attempt<T>(agentId, query);
}

/**
 * @id AI-06-070
 * Truy xuất tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Tìm và trả về tóm tắt kết quả phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_retrieve_outcome_summary<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCOutcomeLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).out_retrieve_outcome_summary<T>(agentId, query);
}

/**
 * @id AI-06-071
 * Tuần tự hóa lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Chuyển lần thành công sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_success_episode<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-072
 * Tuần tự hóa lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Chuyển lần thất bại sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_failure_episode<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-073
 * Tuần tự hóa sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_prediction_error<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-074
 * Tuần tự hóa kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Chuyển kết quả hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_action_result<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-075
 * Tuần tự hóa mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Chuyển mẫu sai lầm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_mistake_pattern<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-076
 * Tuần tự hóa mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Chuyển mẫu thành công sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_success_pattern<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-077
 * Tuần tự hóa bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Chuyển bản ghi bài học sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_lesson_record<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-078
 * Tuần tự hóa giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Chuyển giả thuyết nguyên nhân sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_causal_hypothesis<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-079
 * Tuần tự hóa lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Chuyển lần thử phục hồi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_recovery_attempt<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-080
 * Tuần tự hóa tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Chuyển tóm tắt kết quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_serialize_outcome_summary<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-06-081
 * So sánh lần thành công trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_success_episode<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-082
 * So sánh lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thất bại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_failure_episode<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-083
 * So sánh sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_prediction_error<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-084
 * So sánh kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_action_result<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-085
 * So sánh mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu sai lầm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_mistake_pattern<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-086
 * So sánh mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu thành công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_success_pattern<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-087
 * So sánh bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi bài học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_lesson_record<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-088
 * So sánh giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của giả thuyết nguyên nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_causal_hypothesis<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-089
 * So sánh lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lần thử phục hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_recovery_attempt<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-090
 * So sánh tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tóm tắt kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function out_compare_outcome_summary<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-06-091
 * Tinh gọn lần thành công trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần lần thành công lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_success_episode(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_success_episode(agentId, options);
}

/**
 * @id AI-06-092
 * Tinh gọn lần thất bại trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần lần thất bại lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_failure_episode(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_failure_episode(agentId, options);
}

/**
 * @id AI-06-093
 * Tinh gọn sai số dự đoán trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_prediction_error(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_prediction_error(agentId, options);
}

/**
 * @id AI-06-094
 * Tinh gọn kết quả hành động trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần kết quả hành động lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_action_result(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_action_result(agentId, options);
}

/**
 * @id AI-06-095
 * Tinh gọn mẫu sai lầm trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu sai lầm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_mistake_pattern(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_mistake_pattern(agentId, options);
}

/**
 * @id AI-06-096
 * Tinh gọn mẫu thành công trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu thành công lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_success_pattern(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_success_pattern(agentId, options);
}

/**
 * @id AI-06-097
 * Tinh gọn bản ghi bài học trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần bản ghi bài học lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_lesson_record(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_lesson_record(agentId, options);
}

/**
 * @id AI-06-098
 * Tinh gọn giả thuyết nguyên nhân trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần giả thuyết nguyên nhân lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_causal_hypothesis(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_causal_hypothesis(agentId, options);
}

/**
 * @id AI-06-099
 * Tinh gọn lần thử phục hồi trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần lần thử phục hồi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_recovery_attempt(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_recovery_attempt(agentId, options);
}

/**
 * @id AI-06-100
 * Tinh gọn tóm tắt kết quả trong module học từ thành công và thất bại.
 * Mục đích: Loại bỏ hoặc gộp phần tóm tắt kết quả lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function out_prune_outcome_summary(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCOutcomeLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).out_prune_outcome_summary(agentId, options);
}

