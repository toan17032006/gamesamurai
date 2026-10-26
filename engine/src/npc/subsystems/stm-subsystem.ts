/**
 * @file stm-subsystem.ts
 * @module @aetheria/engine/npc
 * @description STM — Ghi nhớ ngắn hạn (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module STM.
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

export interface INPCShortTermMemorySubsystem {
  stm_initialize_working_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_recent_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_recent_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_temporary_fact<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_active_context<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_attention_item<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_short_event<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_memory_trace<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_temporary_goal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_initialize_recall_queue<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_working_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_recent_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_recent_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_temporary_fact<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_active_context<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_attention_item<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_short_event<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_memory_trace<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_temporary_goal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_capture_recall_queue<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  stm_validate_working_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_recent_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_recent_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_temporary_fact<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_active_context<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_attention_item<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_short_event<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_memory_trace<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_temporary_goal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_validate_recall_queue<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  stm_normalize_working_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_recent_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_recent_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_temporary_fact<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_active_context<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_attention_item<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_short_event<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_memory_trace<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_temporary_goal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_normalize_recall_queue<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  stm_update_working_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_recent_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_recent_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_temporary_fact<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_active_context<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_attention_item<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_short_event<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_memory_trace<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_temporary_goal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_update_recall_queue<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  stm_evaluate_working_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_recent_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_recent_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_temporary_fact<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_active_context<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_attention_item<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_short_event<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_memory_trace<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_temporary_goal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_evaluate_recall_queue<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  stm_retrieve_working_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_recent_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_recent_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_temporary_fact<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_active_context<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_attention_item<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_short_event<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_memory_trace<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_temporary_goal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_retrieve_recall_queue<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  stm_serialize_working_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_recent_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_recent_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_temporary_fact<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_active_context<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_attention_item<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_short_event<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_memory_trace<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_temporary_goal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_serialize_recall_queue<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  stm_compare_working_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_recent_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_recent_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_temporary_fact<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_active_context<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_attention_item<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_short_event<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_memory_trace<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_temporary_goal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_compare_recall_queue<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  stm_prune_working_memory(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_recent_observation(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_recent_action(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_temporary_fact(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_active_context(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_attention_item(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_short_event(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_memory_trace(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_temporary_goal(agentId: string, options?: PruningOptions): PruningResult;
  stm_prune_recall_queue(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCShortTermMemorySubsystem extends NPCBaseSubsystem implements INPCShortTermMemorySubsystem {
  public readonly moduleCode = 'STM';
  public readonly moduleTitle = 'STM — Ghi nhớ ngắn hạn (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-02-001
   * Khởi tạo bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bộ nhớ làm việc.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_working_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'working_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-002
   * Khởi tạo quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát gần đây.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_recent_observation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recent_observation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-003
   * Khởi tạo hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động gần đây.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_recent_action<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recent_action', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-004
   * Khởi tạo sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện tạm thời.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_temporary_fact<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporary_fact', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-005
   * Khởi tạo bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bối cảnh hiện tại.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_active_context<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'active_context', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-006
   * Khởi tạo mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mục chú ý.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_attention_item<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'attention_item', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-007
   * Khởi tạo sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện ngắn hạn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_short_event<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'short_event', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-008
   * Khởi tạo dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dấu vết ký ức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_memory_trace<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_trace', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-009
   * Khởi tạo mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mục tiêu tạm thời.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_temporary_goal<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporary_goal', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-010
   * Khởi tạo hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hàng đợi truy xuất.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_initialize_recall_queue<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recall_queue', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-02-011
   * Thu thập bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến bộ nhớ làm việc từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_working_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'working_memory', data, context);
  }

  /**
   * @id AI-02-012
   * Thu thập quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến quan sát gần đây từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_recent_observation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recent_observation', data, context);
  }

  /**
   * @id AI-02-013
   * Thu thập hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến hành động gần đây từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_recent_action<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recent_action', data, context);
  }

  /**
   * @id AI-02-014
   * Thu thập sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến sự kiện tạm thời từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_temporary_fact<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporary_fact', data, context);
  }

  /**
   * @id AI-02-015
   * Thu thập bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến bối cảnh hiện tại từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_active_context<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'active_context', data, context);
  }

  /**
   * @id AI-02-016
   * Thu thập mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến mục chú ý từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_attention_item<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'attention_item', data, context);
  }

  /**
   * @id AI-02-017
   * Thu thập sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến sự kiện ngắn hạn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_short_event<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'short_event', data, context);
  }

  /**
   * @id AI-02-018
   * Thu thập dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến dấu vết ký ức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_memory_trace<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_trace', data, context);
  }

  /**
   * @id AI-02-019
   * Thu thập mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến mục tiêu tạm thời từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_temporary_goal<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'temporary_goal', data, context);
  }

  /**
   * @id AI-02-020
   * Thu thập hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến hàng đợi truy xuất từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_capture_recall_queue<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'recall_queue', data, context);
  }

  /**
   * @id AI-02-021
   * Kiểm tra tính hợp lệ của bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bộ nhớ làm việc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_working_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-022
   * Kiểm tra tính hợp lệ của quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_recent_observation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-023
   * Kiểm tra tính hợp lệ của hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_recent_action<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-024
   * Kiểm tra tính hợp lệ của sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_temporary_fact<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-025
   * Kiểm tra tính hợp lệ của bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bối cảnh hiện tại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_active_context<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-026
   * Kiểm tra tính hợp lệ của mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mục chú ý.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_attention_item<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-027
   * Kiểm tra tính hợp lệ của sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện ngắn hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_short_event<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-028
   * Kiểm tra tính hợp lệ của dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dấu vết ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_memory_trace<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-029
   * Kiểm tra tính hợp lệ của mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mục tiêu tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_temporary_goal<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-030
   * Kiểm tra tính hợp lệ của hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hàng đợi truy xuất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_validate_recall_queue<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-02-031
   * Chuẩn hóa bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn bộ nhớ làm việc để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_working_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-032
   * Chuẩn hóa quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn quan sát gần đây để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_recent_observation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-033
   * Chuẩn hóa hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn hành động gần đây để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_recent_action<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-034
   * Chuẩn hóa sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn sự kiện tạm thời để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_temporary_fact<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-035
   * Chuẩn hóa bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn bối cảnh hiện tại để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_active_context<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-036
   * Chuẩn hóa mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn mục chú ý để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_attention_item<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-037
   * Chuẩn hóa sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn sự kiện ngắn hạn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_short_event<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-038
   * Chuẩn hóa dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn dấu vết ký ức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_memory_trace<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-039
   * Chuẩn hóa mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn mục tiêu tạm thời để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_temporary_goal<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-040
   * Chuẩn hóa hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuẩn hóa biểu diễn hàng đợi truy xuất để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_normalize_recall_queue<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-02-041
   * Cập nhật bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật bộ nhớ làm việc dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_working_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'working_memory', updateData, context);
  }

  /**
   * @id AI-02-042
   * Cập nhật quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật quan sát gần đây dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_recent_observation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'recent_observation', updateData, context);
  }

  /**
   * @id AI-02-043
   * Cập nhật hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật hành động gần đây dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_recent_action<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'recent_action', updateData, context);
  }

  /**
   * @id AI-02-044
   * Cập nhật sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật sự kiện tạm thời dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_temporary_fact<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'temporary_fact', updateData, context);
  }

  /**
   * @id AI-02-045
   * Cập nhật bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật bối cảnh hiện tại dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_active_context<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'active_context', updateData, context);
  }

  /**
   * @id AI-02-046
   * Cập nhật mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật mục chú ý dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_attention_item<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'attention_item', updateData, context);
  }

  /**
   * @id AI-02-047
   * Cập nhật sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật sự kiện ngắn hạn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_short_event<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'short_event', updateData, context);
  }

  /**
   * @id AI-02-048
   * Cập nhật dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật dấu vết ký ức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_memory_trace<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_trace', updateData, context);
  }

  /**
   * @id AI-02-049
   * Cập nhật mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật mục tiêu tạm thời dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_temporary_goal<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'temporary_goal', updateData, context);
  }

  /**
   * @id AI-02-050
   * Cập nhật hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Cập nhật hàng đợi truy xuất dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_update_recall_queue<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'recall_queue', updateData, context);
  }

  /**
   * @id AI-02-051
   * Đánh giá bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bộ nhớ làm việc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_working_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-052
   * Đánh giá quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_recent_observation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-053
   * Đánh giá hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_recent_action<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-054
   * Đánh giá sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_temporary_fact<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-055
   * Đánh giá bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bối cảnh hiện tại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_active_context<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-056
   * Đánh giá mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mục chú ý.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_attention_item<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-057
   * Đánh giá sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện ngắn hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_short_event<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-058
   * Đánh giá dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dấu vết ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_memory_trace<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-059
   * Đánh giá mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mục tiêu tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_temporary_goal<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-060
   * Đánh giá hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hàng đợi truy xuất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_evaluate_recall_queue<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-02-061
   * Truy xuất bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về bộ nhớ làm việc phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_working_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'working_memory', query);
  }

  /**
   * @id AI-02-062
   * Truy xuất quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về quan sát gần đây phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_recent_observation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'recent_observation', query);
  }

  /**
   * @id AI-02-063
   * Truy xuất hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về hành động gần đây phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_recent_action<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'recent_action', query);
  }

  /**
   * @id AI-02-064
   * Truy xuất sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về sự kiện tạm thời phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_temporary_fact<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'temporary_fact', query);
  }

  /**
   * @id AI-02-065
   * Truy xuất bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về bối cảnh hiện tại phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_active_context<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'active_context', query);
  }

  /**
   * @id AI-02-066
   * Truy xuất mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về mục chú ý phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_attention_item<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'attention_item', query);
  }

  /**
   * @id AI-02-067
   * Truy xuất sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về sự kiện ngắn hạn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_short_event<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'short_event', query);
  }

  /**
   * @id AI-02-068
   * Truy xuất dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về dấu vết ký ức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_memory_trace<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_trace', query);
  }

  /**
   * @id AI-02-069
   * Truy xuất mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về mục tiêu tạm thời phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_temporary_goal<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'temporary_goal', query);
  }

  /**
   * @id AI-02-070
   * Truy xuất hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Tìm và trả về hàng đợi truy xuất phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_retrieve_recall_queue<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'recall_queue', query);
  }

  /**
   * @id AI-02-071
   * Tuần tự hóa bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển bộ nhớ làm việc sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_working_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-072
   * Tuần tự hóa quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển quan sát gần đây sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_recent_observation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-073
   * Tuần tự hóa hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển hành động gần đây sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_recent_action<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-074
   * Tuần tự hóa sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển sự kiện tạm thời sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_temporary_fact<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-075
   * Tuần tự hóa bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển bối cảnh hiện tại sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_active_context<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-076
   * Tuần tự hóa mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển mục chú ý sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_attention_item<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-077
   * Tuần tự hóa sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển sự kiện ngắn hạn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_short_event<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-078
   * Tuần tự hóa dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển dấu vết ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_memory_trace<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-079
   * Tuần tự hóa mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển mục tiêu tạm thời sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_temporary_goal<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-080
   * Tuần tự hóa hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Chuyển hàng đợi truy xuất sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_serialize_recall_queue<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-02-081
   * So sánh bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bộ nhớ làm việc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_working_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-082
   * So sánh quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_recent_observation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-083
   * So sánh hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động gần đây.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_recent_action<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-084
   * So sánh sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_temporary_fact<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-085
   * So sánh bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bối cảnh hiện tại.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_active_context<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-086
   * So sánh mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mục chú ý.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_attention_item<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-087
   * So sánh sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện ngắn hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_short_event<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-088
   * So sánh dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dấu vết ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_memory_trace<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-089
   * So sánh mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mục tiêu tạm thời.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_temporary_goal<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-090
   * So sánh hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hàng đợi truy xuất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public stm_compare_recall_queue<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-02-091
   * Tinh gọn bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần bộ nhớ làm việc lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_working_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'working_memory', options);
  }

  /**
   * @id AI-02-092
   * Tinh gọn quan sát gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần quan sát gần đây lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_recent_observation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'recent_observation', options);
  }

  /**
   * @id AI-02-093
   * Tinh gọn hành động gần đây trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần hành động gần đây lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_recent_action(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'recent_action', options);
  }

  /**
   * @id AI-02-094
   * Tinh gọn sự kiện tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần sự kiện tạm thời lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_temporary_fact(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'temporary_fact', options);
  }

  /**
   * @id AI-02-095
   * Tinh gọn bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần bối cảnh hiện tại lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_active_context(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'active_context', options);
  }

  /**
   * @id AI-02-096
   * Tinh gọn mục chú ý trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần mục chú ý lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_attention_item(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'attention_item', options);
  }

  /**
   * @id AI-02-097
   * Tinh gọn sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần sự kiện ngắn hạn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_short_event(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'short_event', options);
  }

  /**
   * @id AI-02-098
   * Tinh gọn dấu vết ký ức trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần dấu vết ký ức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_memory_trace(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_trace', options);
  }

  /**
   * @id AI-02-099
   * Tinh gọn mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần mục tiêu tạm thời lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_temporary_goal(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'temporary_goal', options);
  }

  /**
   * @id AI-02-100
   * Tinh gọn hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
   * Mục đích: Loại bỏ hoặc gộp phần hàng đợi truy xuất lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public stm_prune_recall_queue(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'recall_queue', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for STM)
// ============================================================================

let defaultSubsystem: NPCShortTermMemorySubsystem | null = null;
function getSubsystem(): NPCShortTermMemorySubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCShortTermMemorySubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-02-001
 * Khởi tạo bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bộ nhớ làm việc.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_working_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_working_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-02-002
 * Khởi tạo quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát gần đây.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_recent_observation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_recent_observation<T>(agentId, initialData, context);
}

/**
 * @id AI-02-003
 * Khởi tạo hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động gần đây.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_recent_action<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_recent_action<T>(agentId, initialData, context);
}

/**
 * @id AI-02-004
 * Khởi tạo sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện tạm thời.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_temporary_fact<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_temporary_fact<T>(agentId, initialData, context);
}

/**
 * @id AI-02-005
 * Khởi tạo bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bối cảnh hiện tại.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_active_context<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_active_context<T>(agentId, initialData, context);
}

/**
 * @id AI-02-006
 * Khởi tạo mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mục chú ý.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_attention_item<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_attention_item<T>(agentId, initialData, context);
}

/**
 * @id AI-02-007
 * Khởi tạo sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sự kiện ngắn hạn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_short_event<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_short_event<T>(agentId, initialData, context);
}

/**
 * @id AI-02-008
 * Khởi tạo dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dấu vết ký ức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_memory_trace<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_memory_trace<T>(agentId, initialData, context);
}

/**
 * @id AI-02-009
 * Khởi tạo mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mục tiêu tạm thời.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_temporary_goal<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_temporary_goal<T>(agentId, initialData, context);
}

/**
 * @id AI-02-010
 * Khởi tạo hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hàng đợi truy xuất.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_initialize_recall_queue<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_initialize_recall_queue<T>(agentId, initialData, context);
}

/**
 * @id AI-02-011
 * Thu thập bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến bộ nhớ làm việc từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_working_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_working_memory<T>(agentId, data, context);
}

/**
 * @id AI-02-012
 * Thu thập quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến quan sát gần đây từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_recent_observation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_recent_observation<T>(agentId, data, context);
}

/**
 * @id AI-02-013
 * Thu thập hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến hành động gần đây từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_recent_action<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_recent_action<T>(agentId, data, context);
}

/**
 * @id AI-02-014
 * Thu thập sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến sự kiện tạm thời từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_temporary_fact<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_temporary_fact<T>(agentId, data, context);
}

/**
 * @id AI-02-015
 * Thu thập bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến bối cảnh hiện tại từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_active_context<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_active_context<T>(agentId, data, context);
}

/**
 * @id AI-02-016
 * Thu thập mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến mục chú ý từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_attention_item<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_attention_item<T>(agentId, data, context);
}

/**
 * @id AI-02-017
 * Thu thập sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến sự kiện ngắn hạn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_short_event<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_short_event<T>(agentId, data, context);
}

/**
 * @id AI-02-018
 * Thu thập dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến dấu vết ký ức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_memory_trace<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_memory_trace<T>(agentId, data, context);
}

/**
 * @id AI-02-019
 * Thu thập mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến mục tiêu tạm thời từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_temporary_goal<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_temporary_goal<T>(agentId, data, context);
}

/**
 * @id AI-02-020
 * Thu thập hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến hàng đợi truy xuất từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_capture_recall_queue<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_capture_recall_queue<T>(agentId, data, context);
}

/**
 * @id AI-02-021
 * Kiểm tra tính hợp lệ của bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bộ nhớ làm việc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_working_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-022
 * Kiểm tra tính hợp lệ của quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_recent_observation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-023
 * Kiểm tra tính hợp lệ của hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_recent_action<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-024
 * Kiểm tra tính hợp lệ của sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_temporary_fact<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-025
 * Kiểm tra tính hợp lệ của bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bối cảnh hiện tại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_active_context<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-026
 * Kiểm tra tính hợp lệ của mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mục chú ý.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_attention_item<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-027
 * Kiểm tra tính hợp lệ của sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sự kiện ngắn hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_short_event<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-028
 * Kiểm tra tính hợp lệ của dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dấu vết ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_memory_trace<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-029
 * Kiểm tra tính hợp lệ của mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mục tiêu tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_temporary_goal<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-030
 * Kiểm tra tính hợp lệ của hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hàng đợi truy xuất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_validate_recall_queue<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-02-031
 * Chuẩn hóa bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn bộ nhớ làm việc để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_working_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-032
 * Chuẩn hóa quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn quan sát gần đây để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_recent_observation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-033
 * Chuẩn hóa hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn hành động gần đây để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_recent_action<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-034
 * Chuẩn hóa sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn sự kiện tạm thời để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_temporary_fact<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-035
 * Chuẩn hóa bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn bối cảnh hiện tại để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_active_context<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-036
 * Chuẩn hóa mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn mục chú ý để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_attention_item<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-037
 * Chuẩn hóa sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn sự kiện ngắn hạn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_short_event<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-038
 * Chuẩn hóa dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn dấu vết ký ức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_memory_trace<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-039
 * Chuẩn hóa mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn mục tiêu tạm thời để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_temporary_goal<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-040
 * Chuẩn hóa hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuẩn hóa biểu diễn hàng đợi truy xuất để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_normalize_recall_queue<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-02-041
 * Cập nhật bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật bộ nhớ làm việc dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_working_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_working_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-02-042
 * Cập nhật quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật quan sát gần đây dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_recent_observation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_recent_observation<T>(agentId, updateData, context);
}

/**
 * @id AI-02-043
 * Cập nhật hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật hành động gần đây dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_recent_action<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_recent_action<T>(agentId, updateData, context);
}

/**
 * @id AI-02-044
 * Cập nhật sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật sự kiện tạm thời dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_temporary_fact<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_temporary_fact<T>(agentId, updateData, context);
}

/**
 * @id AI-02-045
 * Cập nhật bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật bối cảnh hiện tại dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_active_context<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_active_context<T>(agentId, updateData, context);
}

/**
 * @id AI-02-046
 * Cập nhật mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật mục chú ý dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_attention_item<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_attention_item<T>(agentId, updateData, context);
}

/**
 * @id AI-02-047
 * Cập nhật sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật sự kiện ngắn hạn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_short_event<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_short_event<T>(agentId, updateData, context);
}

/**
 * @id AI-02-048
 * Cập nhật dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật dấu vết ký ức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_memory_trace<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_memory_trace<T>(agentId, updateData, context);
}

/**
 * @id AI-02-049
 * Cập nhật mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật mục tiêu tạm thời dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_temporary_goal<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_temporary_goal<T>(agentId, updateData, context);
}

/**
 * @id AI-02-050
 * Cập nhật hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Cập nhật hàng đợi truy xuất dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_update_recall_queue<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).stm_update_recall_queue<T>(agentId, updateData, context);
}

/**
 * @id AI-02-051
 * Đánh giá bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bộ nhớ làm việc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_working_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-052
 * Đánh giá quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_recent_observation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-053
 * Đánh giá hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_recent_action<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-054
 * Đánh giá sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_temporary_fact<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-055
 * Đánh giá bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bối cảnh hiện tại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_active_context<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-056
 * Đánh giá mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mục chú ý.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_attention_item<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-057
 * Đánh giá sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sự kiện ngắn hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_short_event<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-058
 * Đánh giá dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dấu vết ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_memory_trace<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-059
 * Đánh giá mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mục tiêu tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_temporary_goal<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-060
 * Đánh giá hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hàng đợi truy xuất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_evaluate_recall_queue<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-02-061
 * Truy xuất bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về bộ nhớ làm việc phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_working_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_working_memory<T>(agentId, query);
}

/**
 * @id AI-02-062
 * Truy xuất quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về quan sát gần đây phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_recent_observation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_recent_observation<T>(agentId, query);
}

/**
 * @id AI-02-063
 * Truy xuất hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về hành động gần đây phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_recent_action<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_recent_action<T>(agentId, query);
}

/**
 * @id AI-02-064
 * Truy xuất sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về sự kiện tạm thời phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_temporary_fact<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_temporary_fact<T>(agentId, query);
}

/**
 * @id AI-02-065
 * Truy xuất bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về bối cảnh hiện tại phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_active_context<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_active_context<T>(agentId, query);
}

/**
 * @id AI-02-066
 * Truy xuất mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về mục chú ý phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_attention_item<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_attention_item<T>(agentId, query);
}

/**
 * @id AI-02-067
 * Truy xuất sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về sự kiện ngắn hạn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_short_event<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_short_event<T>(agentId, query);
}

/**
 * @id AI-02-068
 * Truy xuất dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về dấu vết ký ức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_memory_trace<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_memory_trace<T>(agentId, query);
}

/**
 * @id AI-02-069
 * Truy xuất mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về mục tiêu tạm thời phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_temporary_goal<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_temporary_goal<T>(agentId, query);
}

/**
 * @id AI-02-070
 * Truy xuất hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Tìm và trả về hàng đợi truy xuất phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_retrieve_recall_queue<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCShortTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).stm_retrieve_recall_queue<T>(agentId, query);
}

/**
 * @id AI-02-071
 * Tuần tự hóa bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển bộ nhớ làm việc sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_working_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-072
 * Tuần tự hóa quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển quan sát gần đây sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_recent_observation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-073
 * Tuần tự hóa hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển hành động gần đây sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_recent_action<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-074
 * Tuần tự hóa sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển sự kiện tạm thời sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_temporary_fact<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-075
 * Tuần tự hóa bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển bối cảnh hiện tại sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_active_context<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-076
 * Tuần tự hóa mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển mục chú ý sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_attention_item<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-077
 * Tuần tự hóa sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển sự kiện ngắn hạn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_short_event<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-078
 * Tuần tự hóa dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển dấu vết ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_memory_trace<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-079
 * Tuần tự hóa mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển mục tiêu tạm thời sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_temporary_goal<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-080
 * Tuần tự hóa hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Chuyển hàng đợi truy xuất sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_serialize_recall_queue<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-02-081
 * So sánh bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bộ nhớ làm việc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_working_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-082
 * So sánh quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_recent_observation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-083
 * So sánh hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động gần đây.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_recent_action<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-084
 * So sánh sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_temporary_fact<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-085
 * So sánh bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bối cảnh hiện tại.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_active_context<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-086
 * So sánh mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mục chú ý.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_attention_item<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-087
 * So sánh sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sự kiện ngắn hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_short_event<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-088
 * So sánh dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dấu vết ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_memory_trace<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-089
 * So sánh mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mục tiêu tạm thời.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_temporary_goal<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-090
 * So sánh hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hàng đợi truy xuất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function stm_compare_recall_queue<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-02-091
 * Tinh gọn bộ nhớ làm việc trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần bộ nhớ làm việc lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_working_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_working_memory(agentId, options);
}

/**
 * @id AI-02-092
 * Tinh gọn quan sát gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần quan sát gần đây lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_recent_observation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_recent_observation(agentId, options);
}

/**
 * @id AI-02-093
 * Tinh gọn hành động gần đây trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần hành động gần đây lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_recent_action(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_recent_action(agentId, options);
}

/**
 * @id AI-02-094
 * Tinh gọn sự kiện tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần sự kiện tạm thời lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_temporary_fact(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_temporary_fact(agentId, options);
}

/**
 * @id AI-02-095
 * Tinh gọn bối cảnh hiện tại trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần bối cảnh hiện tại lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_active_context(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_active_context(agentId, options);
}

/**
 * @id AI-02-096
 * Tinh gọn mục chú ý trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần mục chú ý lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_attention_item(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_attention_item(agentId, options);
}

/**
 * @id AI-02-097
 * Tinh gọn sự kiện ngắn hạn trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần sự kiện ngắn hạn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_short_event(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_short_event(agentId, options);
}

/**
 * @id AI-02-098
 * Tinh gọn dấu vết ký ức trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần dấu vết ký ức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_memory_trace(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_memory_trace(agentId, options);
}

/**
 * @id AI-02-099
 * Tinh gọn mục tiêu tạm thời trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần mục tiêu tạm thời lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_temporary_goal(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_temporary_goal(agentId, options);
}

/**
 * @id AI-02-100
 * Tinh gọn hàng đợi truy xuất trong module ghi nhớ ngắn hạn.
 * Mục đích: Loại bỏ hoặc gộp phần hàng đợi truy xuất lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function stm_prune_recall_queue(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCShortTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).stm_prune_recall_queue(agentId, options);
}

