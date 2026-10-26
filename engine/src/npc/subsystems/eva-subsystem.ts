/**
 * @file eva-subsystem.ts
 * @module @aetheria/engine/npc
 * @description EVA — Đánh giá và tự hiệu chỉnh (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module EVA.
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

export interface INPCEvaluationSubsystem {
  eva_initialize_behavior_outcome<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_prediction_residual<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_repeated_mistake<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_learning_regression<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_policy_version<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_confidence_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_learning_feedback<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_reward_hacking<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_behavior_diversity<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_initialize_model_update<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_behavior_outcome<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_prediction_residual<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_repeated_mistake<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_learning_regression<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_policy_version<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_confidence_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_learning_feedback<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_reward_hacking<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_behavior_diversity<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_capture_model_update<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  eva_validate_behavior_outcome<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_prediction_residual<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_repeated_mistake<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_learning_regression<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_policy_version<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_confidence_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_learning_feedback<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_reward_hacking<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_behavior_diversity<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_validate_model_update<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  eva_normalize_behavior_outcome<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_prediction_residual<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_repeated_mistake<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_learning_regression<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_policy_version<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_confidence_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_learning_feedback<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_reward_hacking<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_behavior_diversity<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_normalize_model_update<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  eva_update_behavior_outcome<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_prediction_residual<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_repeated_mistake<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_learning_regression<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_policy_version<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_confidence_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_learning_feedback<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_reward_hacking<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_behavior_diversity<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_update_model_update<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  eva_evaluate_behavior_outcome<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_prediction_residual<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_repeated_mistake<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_learning_regression<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_policy_version<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_confidence_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_learning_feedback<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_reward_hacking<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_behavior_diversity<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_evaluate_model_update<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  eva_retrieve_behavior_outcome<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_prediction_residual<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_repeated_mistake<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_learning_regression<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_policy_version<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_confidence_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_learning_feedback<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_reward_hacking<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_behavior_diversity<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_retrieve_model_update<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  eva_serialize_behavior_outcome<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_prediction_residual<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_repeated_mistake<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_learning_regression<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_policy_version<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_confidence_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_learning_feedback<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_reward_hacking<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_behavior_diversity<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_serialize_model_update<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  eva_compare_behavior_outcome<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_prediction_residual<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_repeated_mistake<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_learning_regression<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_policy_version<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_confidence_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_learning_feedback<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_reward_hacking<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_behavior_diversity<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_compare_model_update<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  eva_prune_behavior_outcome(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_prediction_residual(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_repeated_mistake(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_learning_regression(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_policy_version(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_confidence_score(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_learning_feedback(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_reward_hacking(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_behavior_diversity(agentId: string, options?: PruningOptions): PruningResult;
  eva_prune_model_update(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCEvaluationSubsystem extends NPCBaseSubsystem implements INPCEvaluationSubsystem {
  public readonly moduleCode = 'EVA';
  public readonly moduleTitle = 'EVA — Đánh giá và tự hiệu chỉnh (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-22-001
   * Khởi tạo kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả hành vi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_behavior_outcome<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_outcome', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-002
   * Khởi tạo sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_prediction_residual<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_residual', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-003
   * Khởi tạo sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai lầm lặp lại.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_repeated_mistake<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'repeated_mistake', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-004
   * Khởi tạo thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thoái lui năng lực.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_learning_regression<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_regression', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-005
   * Khởi tạo phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên bản chính sách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_policy_version<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_version', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-006
   * Khởi tạo điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm tin cậy.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_confidence_score<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'confidence_score', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-007
   * Khởi tạo phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phản hồi học tập.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_learning_feedback<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_feedback', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-008
   * Khởi tạo khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khai thác kẽ hở phần thưởng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_reward_hacking<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_hacking', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-009
   * Khởi tạo đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đa dạng hành vi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_behavior_diversity<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_diversity', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-010
   * Khởi tạo cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cập nhật mô hình.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_initialize_model_update<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'model_update', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-22-011
   * Thu thập kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến kết quả hành vi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_behavior_outcome<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_outcome', data, context);
  }

  /**
   * @id AI-22-012
   * Thu thập sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_prediction_residual<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_residual', data, context);
  }

  /**
   * @id AI-22-013
   * Thu thập sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến sai lầm lặp lại từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_repeated_mistake<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'repeated_mistake', data, context);
  }

  /**
   * @id AI-22-014
   * Thu thập thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến thoái lui năng lực từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_learning_regression<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_regression', data, context);
  }

  /**
   * @id AI-22-015
   * Thu thập phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến phiên bản chính sách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_policy_version<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_version', data, context);
  }

  /**
   * @id AI-22-016
   * Thu thập điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến điểm tin cậy từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_confidence_score<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'confidence_score', data, context);
  }

  /**
   * @id AI-22-017
   * Thu thập phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến phản hồi học tập từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_learning_feedback<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_feedback', data, context);
  }

  /**
   * @id AI-22-018
   * Thu thập khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến khai thác kẽ hở phần thưởng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_reward_hacking<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_hacking', data, context);
  }

  /**
   * @id AI-22-019
   * Thu thập đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến đa dạng hành vi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_behavior_diversity<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_diversity', data, context);
  }

  /**
   * @id AI-22-020
   * Thu thập cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Thu thập dữ liệu liên quan đến cập nhật mô hình từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_capture_model_update<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'model_update', data, context);
  }

  /**
   * @id AI-22-021
   * Kiểm tra tính hợp lệ của kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_behavior_outcome<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-022
   * Kiểm tra tính hợp lệ của sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_prediction_residual<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-023
   * Kiểm tra tính hợp lệ của sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai lầm lặp lại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_repeated_mistake<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-024
   * Kiểm tra tính hợp lệ của thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thoái lui năng lực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_learning_regression<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-025
   * Kiểm tra tính hợp lệ của phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên bản chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_policy_version<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-026
   * Kiểm tra tính hợp lệ của điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm tin cậy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_confidence_score<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-027
   * Kiểm tra tính hợp lệ của phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phản hồi học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_learning_feedback<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-028
   * Kiểm tra tính hợp lệ của khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khai thác kẽ hở phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_reward_hacking<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-029
   * Kiểm tra tính hợp lệ của đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đa dạng hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_behavior_diversity<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-030
   * Kiểm tra tính hợp lệ của cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cập nhật mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_validate_model_update<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-22-031
   * Chuẩn hóa kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn kết quả hành vi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_behavior_outcome<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-032
   * Chuẩn hóa sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_prediction_residual<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-033
   * Chuẩn hóa sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn sai lầm lặp lại để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_repeated_mistake<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-034
   * Chuẩn hóa thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn thoái lui năng lực để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_learning_regression<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-035
   * Chuẩn hóa phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn phiên bản chính sách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_policy_version<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-036
   * Chuẩn hóa điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn điểm tin cậy để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_confidence_score<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-037
   * Chuẩn hóa phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn phản hồi học tập để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_learning_feedback<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-038
   * Chuẩn hóa khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn khai thác kẽ hở phần thưởng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_reward_hacking<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-039
   * Chuẩn hóa đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn đa dạng hành vi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_behavior_diversity<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-040
   * Chuẩn hóa cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuẩn hóa biểu diễn cập nhật mô hình để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_normalize_model_update<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-22-041
   * Cập nhật kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật kết quả hành vi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_behavior_outcome<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'behavior_outcome', updateData, context);
  }

  /**
   * @id AI-22-042
   * Cập nhật sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_prediction_residual<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'prediction_residual', updateData, context);
  }

  /**
   * @id AI-22-043
   * Cập nhật sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật sai lầm lặp lại dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_repeated_mistake<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'repeated_mistake', updateData, context);
  }

  /**
   * @id AI-22-044
   * Cập nhật thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật thoái lui năng lực dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_learning_regression<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'learning_regression', updateData, context);
  }

  /**
   * @id AI-22-045
   * Cập nhật phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật phiên bản chính sách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_policy_version<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'policy_version', updateData, context);
  }

  /**
   * @id AI-22-046
   * Cập nhật điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật điểm tin cậy dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_confidence_score<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'confidence_score', updateData, context);
  }

  /**
   * @id AI-22-047
   * Cập nhật phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật phản hồi học tập dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_learning_feedback<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'learning_feedback', updateData, context);
  }

  /**
   * @id AI-22-048
   * Cập nhật khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật khai thác kẽ hở phần thưởng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_reward_hacking<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'reward_hacking', updateData, context);
  }

  /**
   * @id AI-22-049
   * Cập nhật đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật đa dạng hành vi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_behavior_diversity<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'behavior_diversity', updateData, context);
  }

  /**
   * @id AI-22-050
   * Cập nhật cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Cập nhật cập nhật mô hình dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_update_model_update<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'model_update', updateData, context);
  }

  /**
   * @id AI-22-051
   * Đánh giá kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_behavior_outcome<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-052
   * Đánh giá sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_prediction_residual<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-053
   * Đánh giá sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai lầm lặp lại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_repeated_mistake<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-054
   * Đánh giá thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thoái lui năng lực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_learning_regression<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-055
   * Đánh giá phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên bản chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_policy_version<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-056
   * Đánh giá điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm tin cậy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_confidence_score<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-057
   * Đánh giá phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phản hồi học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_learning_feedback<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-058
   * Đánh giá khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khai thác kẽ hở phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_reward_hacking<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-059
   * Đánh giá đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đa dạng hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_behavior_diversity<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-060
   * Đánh giá cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cập nhật mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_evaluate_model_update<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-22-061
   * Truy xuất kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về kết quả hành vi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_behavior_outcome<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'behavior_outcome', query);
  }

  /**
   * @id AI-22-062
   * Truy xuất sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_prediction_residual<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'prediction_residual', query);
  }

  /**
   * @id AI-22-063
   * Truy xuất sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về sai lầm lặp lại phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_repeated_mistake<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'repeated_mistake', query);
  }

  /**
   * @id AI-22-064
   * Truy xuất thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về thoái lui năng lực phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_learning_regression<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'learning_regression', query);
  }

  /**
   * @id AI-22-065
   * Truy xuất phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về phiên bản chính sách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_policy_version<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'policy_version', query);
  }

  /**
   * @id AI-22-066
   * Truy xuất điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về điểm tin cậy phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_confidence_score<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'confidence_score', query);
  }

  /**
   * @id AI-22-067
   * Truy xuất phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về phản hồi học tập phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_learning_feedback<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'learning_feedback', query);
  }

  /**
   * @id AI-22-068
   * Truy xuất khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về khai thác kẽ hở phần thưởng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_reward_hacking<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'reward_hacking', query);
  }

  /**
   * @id AI-22-069
   * Truy xuất đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về đa dạng hành vi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_behavior_diversity<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'behavior_diversity', query);
  }

  /**
   * @id AI-22-070
   * Truy xuất cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Tìm và trả về cập nhật mô hình phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_retrieve_model_update<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'model_update', query);
  }

  /**
   * @id AI-22-071
   * Tuần tự hóa kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển kết quả hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_behavior_outcome<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-072
   * Tuần tự hóa sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_prediction_residual<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-073
   * Tuần tự hóa sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển sai lầm lặp lại sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_repeated_mistake<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-074
   * Tuần tự hóa thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển thoái lui năng lực sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_learning_regression<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-075
   * Tuần tự hóa phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển phiên bản chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_policy_version<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-076
   * Tuần tự hóa điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển điểm tin cậy sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_confidence_score<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-077
   * Tuần tự hóa phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển phản hồi học tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_learning_feedback<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-078
   * Tuần tự hóa khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển khai thác kẽ hở phần thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_reward_hacking<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-079
   * Tuần tự hóa đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển đa dạng hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_behavior_diversity<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-080
   * Tuần tự hóa cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Chuyển cập nhật mô hình sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_serialize_model_update<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-22-081
   * So sánh kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_behavior_outcome<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-082
   * So sánh sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_prediction_residual<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-083
   * So sánh sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sai lầm lặp lại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_repeated_mistake<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-084
   * So sánh thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của thoái lui năng lực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_learning_regression<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-085
   * So sánh phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên bản chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_policy_version<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-086
   * So sánh điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm tin cậy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_confidence_score<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-087
   * So sánh phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phản hồi học tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_learning_feedback<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-088
   * So sánh khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của khai thác kẽ hở phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_reward_hacking<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-089
   * So sánh đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đa dạng hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_behavior_diversity<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-090
   * So sánh cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của cập nhật mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public eva_compare_model_update<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-22-091
   * Tinh gọn kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần kết quả hành vi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_behavior_outcome(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'behavior_outcome', options);
  }

  /**
   * @id AI-22-092
   * Tinh gọn sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_prediction_residual(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'prediction_residual', options);
  }

  /**
   * @id AI-22-093
   * Tinh gọn sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần sai lầm lặp lại lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_repeated_mistake(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'repeated_mistake', options);
  }

  /**
   * @id AI-22-094
   * Tinh gọn thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần thoái lui năng lực lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_learning_regression(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'learning_regression', options);
  }

  /**
   * @id AI-22-095
   * Tinh gọn phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần phiên bản chính sách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_policy_version(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'policy_version', options);
  }

  /**
   * @id AI-22-096
   * Tinh gọn điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần điểm tin cậy lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_confidence_score(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'confidence_score', options);
  }

  /**
   * @id AI-22-097
   * Tinh gọn phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần phản hồi học tập lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_learning_feedback(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'learning_feedback', options);
  }

  /**
   * @id AI-22-098
   * Tinh gọn khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần khai thác kẽ hở phần thưởng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_reward_hacking(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'reward_hacking', options);
  }

  /**
   * @id AI-22-099
   * Tinh gọn đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần đa dạng hành vi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_behavior_diversity(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'behavior_diversity', options);
  }

  /**
   * @id AI-22-100
   * Tinh gọn cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
   * Mục đích: Loại bỏ hoặc gộp phần cập nhật mô hình lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public eva_prune_model_update(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'model_update', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for EVA)
// ============================================================================

let defaultSubsystem: NPCEvaluationSubsystem | null = null;
function getSubsystem(): NPCEvaluationSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCEvaluationSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-22-001
 * Khởi tạo kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả hành vi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_behavior_outcome<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_behavior_outcome<T>(agentId, initialData, context);
}

/**
 * @id AI-22-002
 * Khởi tạo sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_prediction_residual<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_prediction_residual<T>(agentId, initialData, context);
}

/**
 * @id AI-22-003
 * Khởi tạo sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai lầm lặp lại.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_repeated_mistake<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_repeated_mistake<T>(agentId, initialData, context);
}

/**
 * @id AI-22-004
 * Khởi tạo thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thoái lui năng lực.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_learning_regression<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_learning_regression<T>(agentId, initialData, context);
}

/**
 * @id AI-22-005
 * Khởi tạo phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên bản chính sách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_policy_version<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_policy_version<T>(agentId, initialData, context);
}

/**
 * @id AI-22-006
 * Khởi tạo điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm tin cậy.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_confidence_score<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_confidence_score<T>(agentId, initialData, context);
}

/**
 * @id AI-22-007
 * Khởi tạo phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phản hồi học tập.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_learning_feedback<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_learning_feedback<T>(agentId, initialData, context);
}

/**
 * @id AI-22-008
 * Khởi tạo khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khai thác kẽ hở phần thưởng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_reward_hacking<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_reward_hacking<T>(agentId, initialData, context);
}

/**
 * @id AI-22-009
 * Khởi tạo đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đa dạng hành vi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_behavior_diversity<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_behavior_diversity<T>(agentId, initialData, context);
}

/**
 * @id AI-22-010
 * Khởi tạo cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cập nhật mô hình.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_initialize_model_update<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_initialize_model_update<T>(agentId, initialData, context);
}

/**
 * @id AI-22-011
 * Thu thập kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến kết quả hành vi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_behavior_outcome<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_behavior_outcome<T>(agentId, data, context);
}

/**
 * @id AI-22-012
 * Thu thập sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_prediction_residual<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_prediction_residual<T>(agentId, data, context);
}

/**
 * @id AI-22-013
 * Thu thập sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến sai lầm lặp lại từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_repeated_mistake<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_repeated_mistake<T>(agentId, data, context);
}

/**
 * @id AI-22-014
 * Thu thập thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến thoái lui năng lực từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_learning_regression<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_learning_regression<T>(agentId, data, context);
}

/**
 * @id AI-22-015
 * Thu thập phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến phiên bản chính sách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_policy_version<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_policy_version<T>(agentId, data, context);
}

/**
 * @id AI-22-016
 * Thu thập điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến điểm tin cậy từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_confidence_score<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_confidence_score<T>(agentId, data, context);
}

/**
 * @id AI-22-017
 * Thu thập phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến phản hồi học tập từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_learning_feedback<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_learning_feedback<T>(agentId, data, context);
}

/**
 * @id AI-22-018
 * Thu thập khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến khai thác kẽ hở phần thưởng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_reward_hacking<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_reward_hacking<T>(agentId, data, context);
}

/**
 * @id AI-22-019
 * Thu thập đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến đa dạng hành vi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_behavior_diversity<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_behavior_diversity<T>(agentId, data, context);
}

/**
 * @id AI-22-020
 * Thu thập cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Thu thập dữ liệu liên quan đến cập nhật mô hình từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_capture_model_update<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_capture_model_update<T>(agentId, data, context);
}

/**
 * @id AI-22-021
 * Kiểm tra tính hợp lệ của kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_behavior_outcome<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-022
 * Kiểm tra tính hợp lệ của sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_prediction_residual<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-023
 * Kiểm tra tính hợp lệ của sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai lầm lặp lại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_repeated_mistake<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-024
 * Kiểm tra tính hợp lệ của thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thoái lui năng lực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_learning_regression<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-025
 * Kiểm tra tính hợp lệ của phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên bản chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_policy_version<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-026
 * Kiểm tra tính hợp lệ của điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm tin cậy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_confidence_score<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-027
 * Kiểm tra tính hợp lệ của phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phản hồi học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_learning_feedback<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-028
 * Kiểm tra tính hợp lệ của khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khai thác kẽ hở phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_reward_hacking<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-029
 * Kiểm tra tính hợp lệ của đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đa dạng hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_behavior_diversity<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-030
 * Kiểm tra tính hợp lệ của cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cập nhật mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_validate_model_update<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-22-031
 * Chuẩn hóa kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn kết quả hành vi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_behavior_outcome<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-032
 * Chuẩn hóa sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_prediction_residual<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-033
 * Chuẩn hóa sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn sai lầm lặp lại để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_repeated_mistake<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-034
 * Chuẩn hóa thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn thoái lui năng lực để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_learning_regression<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-035
 * Chuẩn hóa phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn phiên bản chính sách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_policy_version<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-036
 * Chuẩn hóa điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn điểm tin cậy để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_confidence_score<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-037
 * Chuẩn hóa phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn phản hồi học tập để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_learning_feedback<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-038
 * Chuẩn hóa khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn khai thác kẽ hở phần thưởng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_reward_hacking<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-039
 * Chuẩn hóa đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn đa dạng hành vi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_behavior_diversity<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-040
 * Chuẩn hóa cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuẩn hóa biểu diễn cập nhật mô hình để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_normalize_model_update<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-22-041
 * Cập nhật kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật kết quả hành vi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_behavior_outcome<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_behavior_outcome<T>(agentId, updateData, context);
}

/**
 * @id AI-22-042
 * Cập nhật sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_prediction_residual<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_prediction_residual<T>(agentId, updateData, context);
}

/**
 * @id AI-22-043
 * Cập nhật sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật sai lầm lặp lại dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_repeated_mistake<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_repeated_mistake<T>(agentId, updateData, context);
}

/**
 * @id AI-22-044
 * Cập nhật thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật thoái lui năng lực dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_learning_regression<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_learning_regression<T>(agentId, updateData, context);
}

/**
 * @id AI-22-045
 * Cập nhật phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật phiên bản chính sách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_policy_version<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_policy_version<T>(agentId, updateData, context);
}

/**
 * @id AI-22-046
 * Cập nhật điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật điểm tin cậy dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_confidence_score<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_confidence_score<T>(agentId, updateData, context);
}

/**
 * @id AI-22-047
 * Cập nhật phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật phản hồi học tập dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_learning_feedback<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_learning_feedback<T>(agentId, updateData, context);
}

/**
 * @id AI-22-048
 * Cập nhật khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật khai thác kẽ hở phần thưởng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_reward_hacking<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_reward_hacking<T>(agentId, updateData, context);
}

/**
 * @id AI-22-049
 * Cập nhật đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật đa dạng hành vi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_behavior_diversity<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_behavior_diversity<T>(agentId, updateData, context);
}

/**
 * @id AI-22-050
 * Cập nhật cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Cập nhật cập nhật mô hình dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_update_model_update<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).eva_update_model_update<T>(agentId, updateData, context);
}

/**
 * @id AI-22-051
 * Đánh giá kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_behavior_outcome<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-052
 * Đánh giá sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_prediction_residual<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-053
 * Đánh giá sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai lầm lặp lại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_repeated_mistake<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-054
 * Đánh giá thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thoái lui năng lực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_learning_regression<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-055
 * Đánh giá phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên bản chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_policy_version<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-056
 * Đánh giá điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm tin cậy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_confidence_score<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-057
 * Đánh giá phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phản hồi học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_learning_feedback<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-058
 * Đánh giá khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khai thác kẽ hở phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_reward_hacking<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-059
 * Đánh giá đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đa dạng hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_behavior_diversity<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-060
 * Đánh giá cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cập nhật mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_evaluate_model_update<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-22-061
 * Truy xuất kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về kết quả hành vi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_behavior_outcome<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_behavior_outcome<T>(agentId, query);
}

/**
 * @id AI-22-062
 * Truy xuất sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_prediction_residual<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_prediction_residual<T>(agentId, query);
}

/**
 * @id AI-22-063
 * Truy xuất sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về sai lầm lặp lại phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_repeated_mistake<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_repeated_mistake<T>(agentId, query);
}

/**
 * @id AI-22-064
 * Truy xuất thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về thoái lui năng lực phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_learning_regression<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_learning_regression<T>(agentId, query);
}

/**
 * @id AI-22-065
 * Truy xuất phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về phiên bản chính sách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_policy_version<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_policy_version<T>(agentId, query);
}

/**
 * @id AI-22-066
 * Truy xuất điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về điểm tin cậy phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_confidence_score<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_confidence_score<T>(agentId, query);
}

/**
 * @id AI-22-067
 * Truy xuất phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về phản hồi học tập phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_learning_feedback<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_learning_feedback<T>(agentId, query);
}

/**
 * @id AI-22-068
 * Truy xuất khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về khai thác kẽ hở phần thưởng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_reward_hacking<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_reward_hacking<T>(agentId, query);
}

/**
 * @id AI-22-069
 * Truy xuất đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về đa dạng hành vi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_behavior_diversity<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_behavior_diversity<T>(agentId, query);
}

/**
 * @id AI-22-070
 * Truy xuất cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Tìm và trả về cập nhật mô hình phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_retrieve_model_update<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCEvaluationSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).eva_retrieve_model_update<T>(agentId, query);
}

/**
 * @id AI-22-071
 * Tuần tự hóa kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển kết quả hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_behavior_outcome<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-072
 * Tuần tự hóa sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_prediction_residual<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-073
 * Tuần tự hóa sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển sai lầm lặp lại sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_repeated_mistake<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-074
 * Tuần tự hóa thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển thoái lui năng lực sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_learning_regression<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-075
 * Tuần tự hóa phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển phiên bản chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_policy_version<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-076
 * Tuần tự hóa điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển điểm tin cậy sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_confidence_score<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-077
 * Tuần tự hóa phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển phản hồi học tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_learning_feedback<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-078
 * Tuần tự hóa khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển khai thác kẽ hở phần thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_reward_hacking<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-079
 * Tuần tự hóa đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển đa dạng hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_behavior_diversity<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-080
 * Tuần tự hóa cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Chuyển cập nhật mô hình sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_serialize_model_update<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-22-081
 * So sánh kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_behavior_outcome<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-082
 * So sánh sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_prediction_residual<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-083
 * So sánh sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sai lầm lặp lại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_repeated_mistake<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-084
 * So sánh thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của thoái lui năng lực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_learning_regression<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-085
 * So sánh phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên bản chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_policy_version<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-086
 * So sánh điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm tin cậy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_confidence_score<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-087
 * So sánh phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phản hồi học tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_learning_feedback<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-088
 * So sánh khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của khai thác kẽ hở phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_reward_hacking<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-089
 * So sánh đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đa dạng hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_behavior_diversity<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-090
 * So sánh cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của cập nhật mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function eva_compare_model_update<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-22-091
 * Tinh gọn kết quả hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần kết quả hành vi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_behavior_outcome(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_behavior_outcome(agentId, options);
}

/**
 * @id AI-22-092
 * Tinh gọn sai số dự đoán trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_prediction_residual(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_prediction_residual(agentId, options);
}

/**
 * @id AI-22-093
 * Tinh gọn sai lầm lặp lại trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần sai lầm lặp lại lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_repeated_mistake(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_repeated_mistake(agentId, options);
}

/**
 * @id AI-22-094
 * Tinh gọn thoái lui năng lực trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần thoái lui năng lực lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_learning_regression(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_learning_regression(agentId, options);
}

/**
 * @id AI-22-095
 * Tinh gọn phiên bản chính sách trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần phiên bản chính sách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_policy_version(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_policy_version(agentId, options);
}

/**
 * @id AI-22-096
 * Tinh gọn điểm tin cậy trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần điểm tin cậy lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_confidence_score(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_confidence_score(agentId, options);
}

/**
 * @id AI-22-097
 * Tinh gọn phản hồi học tập trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần phản hồi học tập lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_learning_feedback(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_learning_feedback(agentId, options);
}

/**
 * @id AI-22-098
 * Tinh gọn khai thác kẽ hở phần thưởng trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần khai thác kẽ hở phần thưởng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_reward_hacking(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_reward_hacking(agentId, options);
}

/**
 * @id AI-22-099
 * Tinh gọn đa dạng hành vi trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần đa dạng hành vi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_behavior_diversity(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_behavior_diversity(agentId, options);
}

/**
 * @id AI-22-100
 * Tinh gọn cập nhật mô hình trong module đánh giá và tự hiệu chỉnh.
 * Mục đích: Loại bỏ hoặc gộp phần cập nhật mô hình lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function eva_prune_model_update(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCEvaluationSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).eva_prune_model_update(agentId, options);
}

