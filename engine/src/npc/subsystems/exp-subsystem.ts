/**
 * @file exp-subsystem.ts
 * @module @aetheria/engine/npc
 * @description EXP — Thu thập dữ liệu và trải nghiệm (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module EXP.
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

export interface INPCExperienceSubsystem {
  exp_initialize_experience<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_outcome<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_event<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_context<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_feature<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_initialize_feedback<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_experience<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_outcome<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_event<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_context<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_feature<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_capture_feedback<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  exp_validate_experience<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_outcome<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_event<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_context<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_feature<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_validate_feedback<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  exp_normalize_experience<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_outcome<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_event<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_context<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_feature<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_normalize_feedback<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  exp_update_experience<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_outcome<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_event<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_context<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_feature<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_update_feedback<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  exp_evaluate_experience<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_outcome<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_event<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_context<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_feature<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_evaluate_feedback<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  exp_retrieve_experience<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_outcome<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_event<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_context<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_feature<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_retrieve_feedback<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  exp_serialize_experience<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_outcome<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_event<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_context<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_feature<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_serialize_feedback<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  exp_compare_experience<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_outcome<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_event<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_context<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_feature<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_compare_feedback<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  exp_prune_experience(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_observation(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_action(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_outcome(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_event(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_context(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_feature(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_pattern(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_episode(agentId: string, options?: PruningOptions): PruningResult;
  exp_prune_feedback(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCExperienceSubsystem extends NPCBaseSubsystem implements INPCExperienceSubsystem {
  public readonly moduleCode = 'EXP';
  public readonly moduleTitle = 'EXP — Thu thập dữ liệu và trải nghiệm (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-01-001
   * Khởi tạo trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trải nghiệm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_experience<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'experience', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-002
   * Khởi tạo quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_observation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'observation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-003
   * Khởi tạo hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_action<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-004
   * Khởi tạo kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_outcome<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'outcome', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-005
   * Khởi tạo sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_event<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'event', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-006
   * Khởi tạo bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bối cảnh.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_context<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'context', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-007
   * Khởi tạo đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc trưng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_feature<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-008
   * Khởi tạo mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_pattern<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'pattern', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-009
   * Khởi tạo phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên trải nghiệm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_episode<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'episode', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-010
   * Khởi tạo phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phản hồi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_initialize_feedback<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feedback', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-01-011
   * Thu thập trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến trải nghiệm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_experience<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'experience', data, context);
  }

  /**
   * @id AI-01-012
   * Thu thập quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến quan sát từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_observation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'observation', data, context);
  }

  /**
   * @id AI-01-013
   * Thu thập hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến hành động từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_action<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action', data, context);
  }

  /**
   * @id AI-01-014
   * Thu thập kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến kết quả từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_outcome<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'outcome', data, context);
  }

  /**
   * @id AI-01-015
   * Thu thập sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến sự kiện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_event<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'event', data, context);
  }

  /**
   * @id AI-01-016
   * Thu thập bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến bối cảnh từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_context<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'context', data, context);
  }

  /**
   * @id AI-01-017
   * Thu thập đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến đặc trưng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_feature<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature', data, context);
  }

  /**
   * @id AI-01-018
   * Thu thập mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_pattern<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'pattern', data, context);
  }

  /**
   * @id AI-01-019
   * Thu thập phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến phiên trải nghiệm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_episode<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'episode', data, context);
  }

  /**
   * @id AI-01-020
   * Thu thập phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Thu thập dữ liệu liên quan đến phản hồi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_capture_feedback<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feedback', data, context);
  }

  /**
   * @id AI-01-021
   * Kiểm tra tính hợp lệ của trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_experience<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-022
   * Kiểm tra tính hợp lệ của quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_observation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-023
   * Kiểm tra tính hợp lệ của hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_action<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-024
   * Kiểm tra tính hợp lệ của kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_outcome<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-025
   * Kiểm tra tính hợp lệ của sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_event<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-026
   * Kiểm tra tính hợp lệ của bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_context<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-027
   * Kiểm tra tính hợp lệ của đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_feature<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-028
   * Kiểm tra tính hợp lệ của mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_pattern<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-029
   * Kiểm tra tính hợp lệ của phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_episode<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-030
   * Kiểm tra tính hợp lệ của phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phản hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_validate_feedback<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-01-031
   * Chuẩn hóa trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn trải nghiệm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_experience<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-032
   * Chuẩn hóa quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn quan sát để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_observation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-033
   * Chuẩn hóa hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn hành động để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_action<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-034
   * Chuẩn hóa kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn kết quả để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_outcome<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-035
   * Chuẩn hóa sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn sự kiện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_event<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-036
   * Chuẩn hóa bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn bối cảnh để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_context<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-037
   * Chuẩn hóa đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn đặc trưng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_feature<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-038
   * Chuẩn hóa mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn mẫu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_pattern<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-039
   * Chuẩn hóa phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn phiên trải nghiệm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_episode<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-040
   * Chuẩn hóa phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuẩn hóa biểu diễn phản hồi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_normalize_feedback<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-01-041
   * Cập nhật trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_experience<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'experience', updateData, context);
  }

  /**
   * @id AI-01-042
   * Cập nhật quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật quan sát dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_observation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'observation', updateData, context);
  }

  /**
   * @id AI-01-043
   * Cập nhật hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật hành động dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_action<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'action', updateData, context);
  }

  /**
   * @id AI-01-044
   * Cập nhật kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật kết quả dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_outcome<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'outcome', updateData, context);
  }

  /**
   * @id AI-01-045
   * Cập nhật sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật sự kiện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_event<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'event', updateData, context);
  }

  /**
   * @id AI-01-046
   * Cập nhật bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật bối cảnh dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_context<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'context', updateData, context);
  }

  /**
   * @id AI-01-047
   * Cập nhật đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật đặc trưng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_feature<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'feature', updateData, context);
  }

  /**
   * @id AI-01-048
   * Cập nhật mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật mẫu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_pattern<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'pattern', updateData, context);
  }

  /**
   * @id AI-01-049
   * Cập nhật phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật phiên trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_episode<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'episode', updateData, context);
  }

  /**
   * @id AI-01-050
   * Cập nhật phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Cập nhật phản hồi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_update_feedback<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'feedback', updateData, context);
  }

  /**
   * @id AI-01-051
   * Đánh giá trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_experience<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-052
   * Đánh giá quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_observation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-053
   * Đánh giá hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_action<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-054
   * Đánh giá kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_outcome<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-055
   * Đánh giá sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_event<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-056
   * Đánh giá bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_context<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-057
   * Đánh giá đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_feature<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-058
   * Đánh giá mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_pattern<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-059
   * Đánh giá phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_episode<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-060
   * Đánh giá phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phản hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_evaluate_feedback<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-01-061
   * Truy xuất trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_experience<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'experience', query);
  }

  /**
   * @id AI-01-062
   * Truy xuất quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về quan sát phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_observation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'observation', query);
  }

  /**
   * @id AI-01-063
   * Truy xuất hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về hành động phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_action<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'action', query);
  }

  /**
   * @id AI-01-064
   * Truy xuất kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về kết quả phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_outcome<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'outcome', query);
  }

  /**
   * @id AI-01-065
   * Truy xuất sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về sự kiện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_event<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'event', query);
  }

  /**
   * @id AI-01-066
   * Truy xuất bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về bối cảnh phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_context<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'context', query);
  }

  /**
   * @id AI-01-067
   * Truy xuất đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về đặc trưng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_feature<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'feature', query);
  }

  /**
   * @id AI-01-068
   * Truy xuất mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về mẫu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_pattern<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'pattern', query);
  }

  /**
   * @id AI-01-069
   * Truy xuất phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về phiên trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_episode<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'episode', query);
  }

  /**
   * @id AI-01-070
   * Truy xuất phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Tìm và trả về phản hồi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_retrieve_feedback<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'feedback', query);
  }

  /**
   * @id AI-01-071
   * Tuần tự hóa trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_experience<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-072
   * Tuần tự hóa quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển quan sát sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_observation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-073
   * Tuần tự hóa hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_action<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-074
   * Tuần tự hóa kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển kết quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_outcome<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-075
   * Tuần tự hóa sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_event<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-076
   * Tuần tự hóa bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển bối cảnh sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_context<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-077
   * Tuần tự hóa đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_feature<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-078
   * Tuần tự hóa mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_pattern<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-079
   * Tuần tự hóa phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển phiên trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_episode<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-080
   * Tuần tự hóa phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Chuyển phản hồi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_serialize_feedback<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-01-081
   * So sánh trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_experience<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-082
   * So sánh quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_observation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-083
   * So sánh hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_action<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-084
   * So sánh kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_outcome<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-085
   * So sánh sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_event<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-086
   * So sánh bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_context<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-087
   * So sánh đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_feature<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-088
   * So sánh mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_pattern<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-089
   * So sánh phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_episode<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-090
   * So sánh phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phản hồi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public exp_compare_feedback<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-01-091
   * Tinh gọn trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_experience(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'experience', options);
  }

  /**
   * @id AI-01-092
   * Tinh gọn quan sát trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần quan sát lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_observation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'observation', options);
  }

  /**
   * @id AI-01-093
   * Tinh gọn hành động trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần hành động lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_action(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'action', options);
  }

  /**
   * @id AI-01-094
   * Tinh gọn kết quả trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần kết quả lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_outcome(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'outcome', options);
  }

  /**
   * @id AI-01-095
   * Tinh gọn sự kiện trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần sự kiện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_event(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'event', options);
  }

  /**
   * @id AI-01-096
   * Tinh gọn bối cảnh trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần bối cảnh lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_context(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'context', options);
  }

  /**
   * @id AI-01-097
   * Tinh gọn đặc trưng trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_feature(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'feature', options);
  }

  /**
   * @id AI-01-098
   * Tinh gọn mẫu trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_pattern(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'pattern', options);
  }

  /**
   * @id AI-01-099
   * Tinh gọn phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần phiên trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_episode(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'episode', options);
  }

  /**
   * @id AI-01-100
   * Tinh gọn phản hồi trong module thu thập dữ liệu và trải nghiệm.
   * Mục đích: Loại bỏ hoặc gộp phần phản hồi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public exp_prune_feedback(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'feedback', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for EXP)
// ============================================================================

let defaultSubsystem: NPCExperienceSubsystem | null = null;
function getSubsystem(): NPCExperienceSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCExperienceSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-01-001
 * Khởi tạo trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trải nghiệm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_experience<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_experience<T>(agentId, initialData, context);
}

/**
 * @id AI-01-002
 * Khởi tạo quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_observation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_observation<T>(agentId, initialData, context);
}

/**
 * @id AI-01-003
 * Khởi tạo hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_action<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_action<T>(agentId, initialData, context);
}

/**
 * @id AI-01-004
 * Khởi tạo kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kết quả.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_outcome<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_outcome<T>(agentId, initialData, context);
}

/**
 * @id AI-01-005
 * Khởi tạo sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_event<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_event<T>(agentId, initialData, context);
}

/**
 * @id AI-01-006
 * Khởi tạo bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bối cảnh.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_context<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_context<T>(agentId, initialData, context);
}

/**
 * @id AI-01-007
 * Khởi tạo đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc trưng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_feature<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_feature<T>(agentId, initialData, context);
}

/**
 * @id AI-01-008
 * Khởi tạo mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_pattern<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_pattern<T>(agentId, initialData, context);
}

/**
 * @id AI-01-009
 * Khởi tạo phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên trải nghiệm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_episode<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_episode<T>(agentId, initialData, context);
}

/**
 * @id AI-01-010
 * Khởi tạo phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phản hồi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_initialize_feedback<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_initialize_feedback<T>(agentId, initialData, context);
}

/**
 * @id AI-01-011
 * Thu thập trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến trải nghiệm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_experience<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_experience<T>(agentId, data, context);
}

/**
 * @id AI-01-012
 * Thu thập quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến quan sát từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_observation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_observation<T>(agentId, data, context);
}

/**
 * @id AI-01-013
 * Thu thập hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến hành động từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_action<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_action<T>(agentId, data, context);
}

/**
 * @id AI-01-014
 * Thu thập kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến kết quả từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_outcome<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_outcome<T>(agentId, data, context);
}

/**
 * @id AI-01-015
 * Thu thập sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến sự kiện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_event<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_event<T>(agentId, data, context);
}

/**
 * @id AI-01-016
 * Thu thập bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến bối cảnh từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_context<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_context<T>(agentId, data, context);
}

/**
 * @id AI-01-017
 * Thu thập đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến đặc trưng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_feature<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_feature<T>(agentId, data, context);
}

/**
 * @id AI-01-018
 * Thu thập mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_pattern<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_pattern<T>(agentId, data, context);
}

/**
 * @id AI-01-019
 * Thu thập phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến phiên trải nghiệm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_episode<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_episode<T>(agentId, data, context);
}

/**
 * @id AI-01-020
 * Thu thập phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Thu thập dữ liệu liên quan đến phản hồi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_capture_feedback<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_capture_feedback<T>(agentId, data, context);
}

/**
 * @id AI-01-021
 * Kiểm tra tính hợp lệ của trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_experience<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-022
 * Kiểm tra tính hợp lệ của quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_observation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-023
 * Kiểm tra tính hợp lệ của hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_action<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-024
 * Kiểm tra tính hợp lệ của kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_outcome<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-025
 * Kiểm tra tính hợp lệ của sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_event<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-026
 * Kiểm tra tính hợp lệ của bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_context<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-027
 * Kiểm tra tính hợp lệ của đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_feature<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-028
 * Kiểm tra tính hợp lệ của mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_pattern<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-029
 * Kiểm tra tính hợp lệ của phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_episode<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-030
 * Kiểm tra tính hợp lệ của phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phản hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_validate_feedback<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-01-031
 * Chuẩn hóa trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn trải nghiệm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_experience<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-032
 * Chuẩn hóa quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn quan sát để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_observation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-033
 * Chuẩn hóa hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn hành động để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_action<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-034
 * Chuẩn hóa kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn kết quả để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_outcome<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-035
 * Chuẩn hóa sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn sự kiện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_event<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-036
 * Chuẩn hóa bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn bối cảnh để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_context<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-037
 * Chuẩn hóa đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn đặc trưng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_feature<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-038
 * Chuẩn hóa mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn mẫu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_pattern<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-039
 * Chuẩn hóa phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn phiên trải nghiệm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_episode<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-040
 * Chuẩn hóa phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuẩn hóa biểu diễn phản hồi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_normalize_feedback<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-01-041
 * Cập nhật trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_experience<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_experience<T>(agentId, updateData, context);
}

/**
 * @id AI-01-042
 * Cập nhật quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật quan sát dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_observation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_observation<T>(agentId, updateData, context);
}

/**
 * @id AI-01-043
 * Cập nhật hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật hành động dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_action<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_action<T>(agentId, updateData, context);
}

/**
 * @id AI-01-044
 * Cập nhật kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật kết quả dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_outcome<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_outcome<T>(agentId, updateData, context);
}

/**
 * @id AI-01-045
 * Cập nhật sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật sự kiện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_event<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_event<T>(agentId, updateData, context);
}

/**
 * @id AI-01-046
 * Cập nhật bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật bối cảnh dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_context<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_context<T>(agentId, updateData, context);
}

/**
 * @id AI-01-047
 * Cập nhật đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật đặc trưng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_feature<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_feature<T>(agentId, updateData, context);
}

/**
 * @id AI-01-048
 * Cập nhật mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật mẫu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_pattern<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_pattern<T>(agentId, updateData, context);
}

/**
 * @id AI-01-049
 * Cập nhật phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật phiên trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_episode<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_episode<T>(agentId, updateData, context);
}

/**
 * @id AI-01-050
 * Cập nhật phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Cập nhật phản hồi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_update_feedback<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).exp_update_feedback<T>(agentId, updateData, context);
}

/**
 * @id AI-01-051
 * Đánh giá trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_experience<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-052
 * Đánh giá quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_observation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-053
 * Đánh giá hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_action<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-054
 * Đánh giá kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_outcome<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-055
 * Đánh giá sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_event<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-056
 * Đánh giá bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_context<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-057
 * Đánh giá đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_feature<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-058
 * Đánh giá mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_pattern<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-059
 * Đánh giá phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_episode<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-060
 * Đánh giá phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phản hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_evaluate_feedback<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-01-061
 * Truy xuất trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_experience<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_experience<T>(agentId, query);
}

/**
 * @id AI-01-062
 * Truy xuất quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về quan sát phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_observation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_observation<T>(agentId, query);
}

/**
 * @id AI-01-063
 * Truy xuất hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về hành động phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_action<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_action<T>(agentId, query);
}

/**
 * @id AI-01-064
 * Truy xuất kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về kết quả phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_outcome<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_outcome<T>(agentId, query);
}

/**
 * @id AI-01-065
 * Truy xuất sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về sự kiện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_event<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_event<T>(agentId, query);
}

/**
 * @id AI-01-066
 * Truy xuất bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về bối cảnh phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_context<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_context<T>(agentId, query);
}

/**
 * @id AI-01-067
 * Truy xuất đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về đặc trưng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_feature<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_feature<T>(agentId, query);
}

/**
 * @id AI-01-068
 * Truy xuất mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về mẫu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_pattern<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_pattern<T>(agentId, query);
}

/**
 * @id AI-01-069
 * Truy xuất phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về phiên trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_episode<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_episode<T>(agentId, query);
}

/**
 * @id AI-01-070
 * Truy xuất phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Tìm và trả về phản hồi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_retrieve_feedback<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCExperienceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).exp_retrieve_feedback<T>(agentId, query);
}

/**
 * @id AI-01-071
 * Tuần tự hóa trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_experience<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-072
 * Tuần tự hóa quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển quan sát sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_observation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-073
 * Tuần tự hóa hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_action<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-074
 * Tuần tự hóa kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển kết quả sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_outcome<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-075
 * Tuần tự hóa sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_event<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-076
 * Tuần tự hóa bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển bối cảnh sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_context<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-077
 * Tuần tự hóa đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_feature<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-078
 * Tuần tự hóa mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_pattern<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-079
 * Tuần tự hóa phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển phiên trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_episode<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-080
 * Tuần tự hóa phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Chuyển phản hồi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_serialize_feedback<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-01-081
 * So sánh trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_experience<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-082
 * So sánh quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_observation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-083
 * So sánh hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_action<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-084
 * So sánh kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kết quả.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_outcome<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-085
 * So sánh sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_event<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-086
 * So sánh bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_context<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-087
 * So sánh đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_feature<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-088
 * So sánh mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_pattern<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-089
 * So sánh phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_episode<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-090
 * So sánh phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phản hồi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function exp_compare_feedback<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-01-091
 * Tinh gọn trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_experience(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_experience(agentId, options);
}

/**
 * @id AI-01-092
 * Tinh gọn quan sát trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần quan sát lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_observation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_observation(agentId, options);
}

/**
 * @id AI-01-093
 * Tinh gọn hành động trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần hành động lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_action(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_action(agentId, options);
}

/**
 * @id AI-01-094
 * Tinh gọn kết quả trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần kết quả lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_outcome(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_outcome(agentId, options);
}

/**
 * @id AI-01-095
 * Tinh gọn sự kiện trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần sự kiện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_event(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_event(agentId, options);
}

/**
 * @id AI-01-096
 * Tinh gọn bối cảnh trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần bối cảnh lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_context(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_context(agentId, options);
}

/**
 * @id AI-01-097
 * Tinh gọn đặc trưng trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_feature(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_feature(agentId, options);
}

/**
 * @id AI-01-098
 * Tinh gọn mẫu trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_pattern(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_pattern(agentId, options);
}

/**
 * @id AI-01-099
 * Tinh gọn phiên trải nghiệm trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần phiên trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_episode(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_episode(agentId, options);
}

/**
 * @id AI-01-100
 * Tinh gọn phản hồi trong module thu thập dữ liệu và trải nghiệm.
 * Mục đích: Loại bỏ hoặc gộp phần phản hồi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function exp_prune_feedback(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCExperienceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).exp_prune_feedback(agentId, options);
}

