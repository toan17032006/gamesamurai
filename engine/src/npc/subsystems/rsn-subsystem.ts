/**
 * @file rsn-subsystem.ts
 * @module @aetheria/engine/npc
 * @description RSN — Suy luận và ra quyết định (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module RSN.
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

export interface INPCReasoningSubsystem {
  rsn_initialize_candidate_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_action_utility<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_decision_alternative<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_decision_confidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_rule_conflict<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_decision_constraint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_action_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_decision_rationale<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_new_evidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_initialize_decision_trace<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_candidate_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_action_utility<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_decision_alternative<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_decision_confidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_rule_conflict<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_decision_constraint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_action_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_decision_rationale<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_new_evidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_capture_decision_trace<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_validate_candidate_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_action_utility<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_decision_alternative<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_decision_confidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_rule_conflict<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_decision_constraint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_action_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_decision_rationale<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_new_evidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_validate_decision_trace<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rsn_normalize_candidate_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_action_utility<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_decision_alternative<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_decision_confidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_rule_conflict<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_decision_constraint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_action_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_decision_rationale<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_new_evidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_normalize_decision_trace<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rsn_update_candidate_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_action_utility<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_decision_alternative<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_decision_confidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_rule_conflict<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_decision_constraint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_action_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_decision_rationale<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_new_evidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_update_decision_trace<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rsn_evaluate_candidate_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_action_utility<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_decision_alternative<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_decision_confidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_rule_conflict<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_decision_constraint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_action_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_decision_rationale<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_new_evidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_evaluate_decision_trace<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rsn_retrieve_candidate_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_action_utility<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_decision_alternative<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_decision_confidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_rule_conflict<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_decision_constraint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_action_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_decision_rationale<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_new_evidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_retrieve_decision_trace<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rsn_serialize_candidate_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_action_utility<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_decision_alternative<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_decision_confidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_rule_conflict<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_decision_constraint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_action_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_decision_rationale<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_new_evidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_serialize_decision_trace<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rsn_compare_candidate_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_action_utility<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_decision_alternative<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_decision_confidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_rule_conflict<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_decision_constraint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_action_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_decision_rationale<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_new_evidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_compare_decision_trace<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rsn_prune_candidate_action(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_action_utility(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_decision_alternative(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_decision_confidence(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_rule_conflict(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_decision_constraint(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_action_score(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_decision_rationale(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_new_evidence(agentId: string, options?: PruningOptions): PruningResult;
  rsn_prune_decision_trace(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCReasoningSubsystem extends NPCBaseSubsystem implements INPCReasoningSubsystem {
  public readonly moduleCode = 'RSN';
  public readonly moduleTitle = 'RSN — Suy luận và ra quyết định (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-15-001
   * Khởi tạo hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động ứng viên.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_candidate_action<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'candidate_action', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-002
   * Khởi tạo độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ hữu ích hành động.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_action_utility<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_utility', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-003
   * Khởi tạo phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phương án quyết định.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_decision_alternative<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_alternative', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-004
   * Khởi tạo độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy quyết định.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_decision_confidence<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_confidence', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-005
   * Khởi tạo xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xung đột quy tắc.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_rule_conflict<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'rule_conflict', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-006
   * Khởi tạo ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ràng buộc quyết định.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_decision_constraint<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_constraint', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-007
   * Khởi tạo điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm hành động.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_action_score<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_score', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-008
   * Khởi tạo lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lý do quyết định.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_decision_rationale<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_rationale', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-009
   * Khởi tạo bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bằng chứng mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_new_evidence<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'new_evidence', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-010
   * Khởi tạo dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dấu vết quyết định.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_initialize_decision_trace<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_trace', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-15-011
   * Thu thập hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến hành động ứng viên từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_candidate_action<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'candidate_action', data, context);
  }

  /**
   * @id AI-15-012
   * Thu thập độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến độ hữu ích hành động từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_action_utility<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_utility', data, context);
  }

  /**
   * @id AI-15-013
   * Thu thập phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến phương án quyết định từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_decision_alternative<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_alternative', data, context);
  }

  /**
   * @id AI-15-014
   * Thu thập độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy quyết định từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_decision_confidence<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_confidence', data, context);
  }

  /**
   * @id AI-15-015
   * Thu thập xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến xung đột quy tắc từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_rule_conflict<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'rule_conflict', data, context);
  }

  /**
   * @id AI-15-016
   * Thu thập ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến ràng buộc quyết định từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_decision_constraint<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_constraint', data, context);
  }

  /**
   * @id AI-15-017
   * Thu thập điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến điểm hành động từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_action_score<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_score', data, context);
  }

  /**
   * @id AI-15-018
   * Thu thập lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến lý do quyết định từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_decision_rationale<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_rationale', data, context);
  }

  /**
   * @id AI-15-019
   * Thu thập bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến bằng chứng mới từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_new_evidence<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'new_evidence', data, context);
  }

  /**
   * @id AI-15-020
   * Thu thập dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Thu thập dữ liệu liên quan đến dấu vết quyết định từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_capture_decision_trace<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'decision_trace', data, context);
  }

  /**
   * @id AI-15-021
   * Kiểm tra tính hợp lệ của hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động ứng viên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_candidate_action<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-022
   * Kiểm tra tính hợp lệ của độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ hữu ích hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_action_utility<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-023
   * Kiểm tra tính hợp lệ của phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phương án quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_decision_alternative<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-024
   * Kiểm tra tính hợp lệ của độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_decision_confidence<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-025
   * Kiểm tra tính hợp lệ của xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xung đột quy tắc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_rule_conflict<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-026
   * Kiểm tra tính hợp lệ của ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ràng buộc quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_decision_constraint<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-027
   * Kiểm tra tính hợp lệ của điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_action_score<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-028
   * Kiểm tra tính hợp lệ của lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lý do quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_decision_rationale<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-029
   * Kiểm tra tính hợp lệ của bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bằng chứng mới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_new_evidence<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-030
   * Kiểm tra tính hợp lệ của dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dấu vết quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_validate_decision_trace<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-15-031
   * Chuẩn hóa hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn hành động ứng viên để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_candidate_action<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-032
   * Chuẩn hóa độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn độ hữu ích hành động để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_action_utility<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-033
   * Chuẩn hóa phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn phương án quyết định để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_decision_alternative<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-034
   * Chuẩn hóa độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn độ tin cậy quyết định để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_decision_confidence<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-035
   * Chuẩn hóa xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn xung đột quy tắc để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_rule_conflict<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-036
   * Chuẩn hóa ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn ràng buộc quyết định để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_decision_constraint<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-037
   * Chuẩn hóa điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn điểm hành động để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_action_score<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-038
   * Chuẩn hóa lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn lý do quyết định để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_decision_rationale<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-039
   * Chuẩn hóa bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn bằng chứng mới để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_new_evidence<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-040
   * Chuẩn hóa dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuẩn hóa biểu diễn dấu vết quyết định để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_normalize_decision_trace<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-15-041
   * Cập nhật hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật hành động ứng viên dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_candidate_action<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'candidate_action', updateData, context);
  }

  /**
   * @id AI-15-042
   * Cập nhật độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật độ hữu ích hành động dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_action_utility<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'action_utility', updateData, context);
  }

  /**
   * @id AI-15-043
   * Cập nhật phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật phương án quyết định dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_decision_alternative<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'decision_alternative', updateData, context);
  }

  /**
   * @id AI-15-044
   * Cập nhật độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật độ tin cậy quyết định dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_decision_confidence<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'decision_confidence', updateData, context);
  }

  /**
   * @id AI-15-045
   * Cập nhật xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật xung đột quy tắc dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_rule_conflict<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'rule_conflict', updateData, context);
  }

  /**
   * @id AI-15-046
   * Cập nhật ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật ràng buộc quyết định dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_decision_constraint<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'decision_constraint', updateData, context);
  }

  /**
   * @id AI-15-047
   * Cập nhật điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật điểm hành động dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_action_score<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'action_score', updateData, context);
  }

  /**
   * @id AI-15-048
   * Cập nhật lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật lý do quyết định dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_decision_rationale<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'decision_rationale', updateData, context);
  }

  /**
   * @id AI-15-049
   * Cập nhật bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật bằng chứng mới dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_new_evidence<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'new_evidence', updateData, context);
  }

  /**
   * @id AI-15-050
   * Cập nhật dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Cập nhật dấu vết quyết định dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_update_decision_trace<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'decision_trace', updateData, context);
  }

  /**
   * @id AI-15-051
   * Đánh giá hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động ứng viên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_candidate_action<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-052
   * Đánh giá độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ hữu ích hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_action_utility<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-053
   * Đánh giá phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phương án quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_decision_alternative<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-054
   * Đánh giá độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_decision_confidence<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-055
   * Đánh giá xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xung đột quy tắc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_rule_conflict<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-056
   * Đánh giá ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ràng buộc quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_decision_constraint<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-057
   * Đánh giá điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_action_score<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-058
   * Đánh giá lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lý do quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_decision_rationale<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-059
   * Đánh giá bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bằng chứng mới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_new_evidence<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-060
   * Đánh giá dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dấu vết quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_evaluate_decision_trace<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-15-061
   * Truy xuất hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về hành động ứng viên phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_candidate_action<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'candidate_action', query);
  }

  /**
   * @id AI-15-062
   * Truy xuất độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về độ hữu ích hành động phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_action_utility<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'action_utility', query);
  }

  /**
   * @id AI-15-063
   * Truy xuất phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về phương án quyết định phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_decision_alternative<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'decision_alternative', query);
  }

  /**
   * @id AI-15-064
   * Truy xuất độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về độ tin cậy quyết định phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_decision_confidence<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'decision_confidence', query);
  }

  /**
   * @id AI-15-065
   * Truy xuất xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về xung đột quy tắc phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_rule_conflict<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'rule_conflict', query);
  }

  /**
   * @id AI-15-066
   * Truy xuất ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về ràng buộc quyết định phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_decision_constraint<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'decision_constraint', query);
  }

  /**
   * @id AI-15-067
   * Truy xuất điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về điểm hành động phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_action_score<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'action_score', query);
  }

  /**
   * @id AI-15-068
   * Truy xuất lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về lý do quyết định phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_decision_rationale<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'decision_rationale', query);
  }

  /**
   * @id AI-15-069
   * Truy xuất bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về bằng chứng mới phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_new_evidence<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'new_evidence', query);
  }

  /**
   * @id AI-15-070
   * Truy xuất dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Tìm và trả về dấu vết quyết định phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_retrieve_decision_trace<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'decision_trace', query);
  }

  /**
   * @id AI-15-071
   * Tuần tự hóa hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Chuyển hành động ứng viên sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_candidate_action<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-072
   * Tuần tự hóa độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Chuyển độ hữu ích hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_action_utility<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-073
   * Tuần tự hóa phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuyển phương án quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_decision_alternative<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-074
   * Tuần tự hóa độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuyển độ tin cậy quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_decision_confidence<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-075
   * Tuần tự hóa xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Chuyển xung đột quy tắc sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_rule_conflict<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-076
   * Tuần tự hóa ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuyển ràng buộc quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_decision_constraint<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-077
   * Tuần tự hóa điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Chuyển điểm hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_action_score<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-078
   * Tuần tự hóa lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuyển lý do quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_decision_rationale<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-079
   * Tuần tự hóa bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Chuyển bằng chứng mới sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_new_evidence<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-080
   * Tuần tự hóa dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Chuyển dấu vết quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_serialize_decision_trace<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-15-081
   * So sánh hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động ứng viên.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_candidate_action<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-082
   * So sánh độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ hữu ích hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_action_utility<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-083
   * So sánh phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phương án quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_decision_alternative<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-084
   * So sánh độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_decision_confidence<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-085
   * So sánh xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của xung đột quy tắc.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_rule_conflict<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-086
   * So sánh ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ràng buộc quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_decision_constraint<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-087
   * So sánh điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_action_score<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-088
   * So sánh lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lý do quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_decision_rationale<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-089
   * So sánh bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bằng chứng mới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_new_evidence<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-090
   * So sánh dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dấu vết quyết định.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rsn_compare_decision_trace<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-15-091
   * Tinh gọn hành động ứng viên trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần hành động ứng viên lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_candidate_action(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'candidate_action', options);
  }

  /**
   * @id AI-15-092
   * Tinh gọn độ hữu ích hành động trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần độ hữu ích hành động lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_action_utility(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'action_utility', options);
  }

  /**
   * @id AI-15-093
   * Tinh gọn phương án quyết định trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần phương án quyết định lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_decision_alternative(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'decision_alternative', options);
  }

  /**
   * @id AI-15-094
   * Tinh gọn độ tin cậy quyết định trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy quyết định lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_decision_confidence(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'decision_confidence', options);
  }

  /**
   * @id AI-15-095
   * Tinh gọn xung đột quy tắc trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần xung đột quy tắc lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_rule_conflict(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'rule_conflict', options);
  }

  /**
   * @id AI-15-096
   * Tinh gọn ràng buộc quyết định trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần ràng buộc quyết định lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_decision_constraint(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'decision_constraint', options);
  }

  /**
   * @id AI-15-097
   * Tinh gọn điểm hành động trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần điểm hành động lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_action_score(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'action_score', options);
  }

  /**
   * @id AI-15-098
   * Tinh gọn lý do quyết định trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần lý do quyết định lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_decision_rationale(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'decision_rationale', options);
  }

  /**
   * @id AI-15-099
   * Tinh gọn bằng chứng mới trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần bằng chứng mới lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_new_evidence(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'new_evidence', options);
  }

  /**
   * @id AI-15-100
   * Tinh gọn dấu vết quyết định trong module suy luận và ra quyết định.
   * Mục đích: Loại bỏ hoặc gộp phần dấu vết quyết định lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rsn_prune_decision_trace(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'decision_trace', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for RSN)
// ============================================================================

let defaultSubsystem: NPCReasoningSubsystem | null = null;
function getSubsystem(): NPCReasoningSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCReasoningSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-15-001
 * Khởi tạo hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành động ứng viên.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_candidate_action<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_candidate_action<T>(agentId, initialData, context);
}

/**
 * @id AI-15-002
 * Khởi tạo độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ hữu ích hành động.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_action_utility<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_action_utility<T>(agentId, initialData, context);
}

/**
 * @id AI-15-003
 * Khởi tạo phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phương án quyết định.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_decision_alternative<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_decision_alternative<T>(agentId, initialData, context);
}

/**
 * @id AI-15-004
 * Khởi tạo độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy quyết định.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_decision_confidence<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_decision_confidence<T>(agentId, initialData, context);
}

/**
 * @id AI-15-005
 * Khởi tạo xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xung đột quy tắc.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_rule_conflict<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_rule_conflict<T>(agentId, initialData, context);
}

/**
 * @id AI-15-006
 * Khởi tạo ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ràng buộc quyết định.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_decision_constraint<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_decision_constraint<T>(agentId, initialData, context);
}

/**
 * @id AI-15-007
 * Khởi tạo điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm hành động.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_action_score<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_action_score<T>(agentId, initialData, context);
}

/**
 * @id AI-15-008
 * Khởi tạo lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lý do quyết định.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_decision_rationale<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_decision_rationale<T>(agentId, initialData, context);
}

/**
 * @id AI-15-009
 * Khởi tạo bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bằng chứng mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_new_evidence<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_new_evidence<T>(agentId, initialData, context);
}

/**
 * @id AI-15-010
 * Khởi tạo dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dấu vết quyết định.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_initialize_decision_trace<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_initialize_decision_trace<T>(agentId, initialData, context);
}

/**
 * @id AI-15-011
 * Thu thập hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến hành động ứng viên từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_candidate_action<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_candidate_action<T>(agentId, data, context);
}

/**
 * @id AI-15-012
 * Thu thập độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến độ hữu ích hành động từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_action_utility<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_action_utility<T>(agentId, data, context);
}

/**
 * @id AI-15-013
 * Thu thập phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến phương án quyết định từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_decision_alternative<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_decision_alternative<T>(agentId, data, context);
}

/**
 * @id AI-15-014
 * Thu thập độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy quyết định từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_decision_confidence<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_decision_confidence<T>(agentId, data, context);
}

/**
 * @id AI-15-015
 * Thu thập xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến xung đột quy tắc từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_rule_conflict<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_rule_conflict<T>(agentId, data, context);
}

/**
 * @id AI-15-016
 * Thu thập ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến ràng buộc quyết định từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_decision_constraint<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_decision_constraint<T>(agentId, data, context);
}

/**
 * @id AI-15-017
 * Thu thập điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến điểm hành động từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_action_score<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_action_score<T>(agentId, data, context);
}

/**
 * @id AI-15-018
 * Thu thập lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến lý do quyết định từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_decision_rationale<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_decision_rationale<T>(agentId, data, context);
}

/**
 * @id AI-15-019
 * Thu thập bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến bằng chứng mới từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_new_evidence<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_new_evidence<T>(agentId, data, context);
}

/**
 * @id AI-15-020
 * Thu thập dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Thu thập dữ liệu liên quan đến dấu vết quyết định từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_capture_decision_trace<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_capture_decision_trace<T>(agentId, data, context);
}

/**
 * @id AI-15-021
 * Kiểm tra tính hợp lệ của hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành động ứng viên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_candidate_action<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-022
 * Kiểm tra tính hợp lệ của độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ hữu ích hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_action_utility<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-023
 * Kiểm tra tính hợp lệ của phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phương án quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_decision_alternative<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-024
 * Kiểm tra tính hợp lệ của độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_decision_confidence<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-025
 * Kiểm tra tính hợp lệ của xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xung đột quy tắc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_rule_conflict<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-026
 * Kiểm tra tính hợp lệ của ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ràng buộc quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_decision_constraint<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-027
 * Kiểm tra tính hợp lệ của điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_action_score<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-028
 * Kiểm tra tính hợp lệ của lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lý do quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_decision_rationale<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-029
 * Kiểm tra tính hợp lệ của bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bằng chứng mới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_new_evidence<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-030
 * Kiểm tra tính hợp lệ của dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dấu vết quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_validate_decision_trace<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-15-031
 * Chuẩn hóa hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn hành động ứng viên để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_candidate_action<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-032
 * Chuẩn hóa độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn độ hữu ích hành động để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_action_utility<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-033
 * Chuẩn hóa phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn phương án quyết định để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_decision_alternative<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-034
 * Chuẩn hóa độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn độ tin cậy quyết định để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_decision_confidence<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-035
 * Chuẩn hóa xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn xung đột quy tắc để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_rule_conflict<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-036
 * Chuẩn hóa ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn ràng buộc quyết định để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_decision_constraint<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-037
 * Chuẩn hóa điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn điểm hành động để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_action_score<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-038
 * Chuẩn hóa lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn lý do quyết định để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_decision_rationale<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-039
 * Chuẩn hóa bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn bằng chứng mới để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_new_evidence<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-040
 * Chuẩn hóa dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuẩn hóa biểu diễn dấu vết quyết định để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_normalize_decision_trace<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-15-041
 * Cập nhật hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật hành động ứng viên dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_candidate_action<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_candidate_action<T>(agentId, updateData, context);
}

/**
 * @id AI-15-042
 * Cập nhật độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật độ hữu ích hành động dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_action_utility<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_action_utility<T>(agentId, updateData, context);
}

/**
 * @id AI-15-043
 * Cập nhật phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật phương án quyết định dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_decision_alternative<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_decision_alternative<T>(agentId, updateData, context);
}

/**
 * @id AI-15-044
 * Cập nhật độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật độ tin cậy quyết định dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_decision_confidence<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_decision_confidence<T>(agentId, updateData, context);
}

/**
 * @id AI-15-045
 * Cập nhật xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật xung đột quy tắc dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_rule_conflict<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_rule_conflict<T>(agentId, updateData, context);
}

/**
 * @id AI-15-046
 * Cập nhật ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật ràng buộc quyết định dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_decision_constraint<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_decision_constraint<T>(agentId, updateData, context);
}

/**
 * @id AI-15-047
 * Cập nhật điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật điểm hành động dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_action_score<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_action_score<T>(agentId, updateData, context);
}

/**
 * @id AI-15-048
 * Cập nhật lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật lý do quyết định dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_decision_rationale<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_decision_rationale<T>(agentId, updateData, context);
}

/**
 * @id AI-15-049
 * Cập nhật bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật bằng chứng mới dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_new_evidence<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_new_evidence<T>(agentId, updateData, context);
}

/**
 * @id AI-15-050
 * Cập nhật dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Cập nhật dấu vết quyết định dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_update_decision_trace<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rsn_update_decision_trace<T>(agentId, updateData, context);
}

/**
 * @id AI-15-051
 * Đánh giá hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành động ứng viên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_candidate_action<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-052
 * Đánh giá độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ hữu ích hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_action_utility<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-053
 * Đánh giá phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phương án quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_decision_alternative<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-054
 * Đánh giá độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_decision_confidence<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-055
 * Đánh giá xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xung đột quy tắc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_rule_conflict<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-056
 * Đánh giá ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ràng buộc quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_decision_constraint<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-057
 * Đánh giá điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_action_score<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-058
 * Đánh giá lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lý do quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_decision_rationale<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-059
 * Đánh giá bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bằng chứng mới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_new_evidence<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-060
 * Đánh giá dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dấu vết quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_evaluate_decision_trace<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-15-061
 * Truy xuất hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về hành động ứng viên phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_candidate_action<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_candidate_action<T>(agentId, query);
}

/**
 * @id AI-15-062
 * Truy xuất độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về độ hữu ích hành động phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_action_utility<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_action_utility<T>(agentId, query);
}

/**
 * @id AI-15-063
 * Truy xuất phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về phương án quyết định phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_decision_alternative<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_decision_alternative<T>(agentId, query);
}

/**
 * @id AI-15-064
 * Truy xuất độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về độ tin cậy quyết định phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_decision_confidence<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_decision_confidence<T>(agentId, query);
}

/**
 * @id AI-15-065
 * Truy xuất xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về xung đột quy tắc phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_rule_conflict<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_rule_conflict<T>(agentId, query);
}

/**
 * @id AI-15-066
 * Truy xuất ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về ràng buộc quyết định phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_decision_constraint<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_decision_constraint<T>(agentId, query);
}

/**
 * @id AI-15-067
 * Truy xuất điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về điểm hành động phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_action_score<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_action_score<T>(agentId, query);
}

/**
 * @id AI-15-068
 * Truy xuất lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về lý do quyết định phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_decision_rationale<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_decision_rationale<T>(agentId, query);
}

/**
 * @id AI-15-069
 * Truy xuất bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về bằng chứng mới phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_new_evidence<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_new_evidence<T>(agentId, query);
}

/**
 * @id AI-15-070
 * Truy xuất dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Tìm và trả về dấu vết quyết định phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_retrieve_decision_trace<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReasoningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rsn_retrieve_decision_trace<T>(agentId, query);
}

/**
 * @id AI-15-071
 * Tuần tự hóa hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Chuyển hành động ứng viên sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_candidate_action<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-072
 * Tuần tự hóa độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Chuyển độ hữu ích hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_action_utility<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-073
 * Tuần tự hóa phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuyển phương án quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_decision_alternative<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-074
 * Tuần tự hóa độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuyển độ tin cậy quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_decision_confidence<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-075
 * Tuần tự hóa xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Chuyển xung đột quy tắc sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_rule_conflict<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-076
 * Tuần tự hóa ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuyển ràng buộc quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_decision_constraint<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-077
 * Tuần tự hóa điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Chuyển điểm hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_action_score<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-078
 * Tuần tự hóa lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuyển lý do quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_decision_rationale<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-079
 * Tuần tự hóa bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Chuyển bằng chứng mới sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_new_evidence<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-080
 * Tuần tự hóa dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Chuyển dấu vết quyết định sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_serialize_decision_trace<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-15-081
 * So sánh hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành động ứng viên.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_candidate_action<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-082
 * So sánh độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ hữu ích hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_action_utility<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-083
 * So sánh phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phương án quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_decision_alternative<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-084
 * So sánh độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_decision_confidence<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-085
 * So sánh xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của xung đột quy tắc.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_rule_conflict<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-086
 * So sánh ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ràng buộc quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_decision_constraint<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-087
 * So sánh điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_action_score<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-088
 * So sánh lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lý do quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_decision_rationale<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-089
 * So sánh bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bằng chứng mới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_new_evidence<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-090
 * So sánh dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dấu vết quyết định.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rsn_compare_decision_trace<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-15-091
 * Tinh gọn hành động ứng viên trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần hành động ứng viên lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_candidate_action(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_candidate_action(agentId, options);
}

/**
 * @id AI-15-092
 * Tinh gọn độ hữu ích hành động trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần độ hữu ích hành động lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_action_utility(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_action_utility(agentId, options);
}

/**
 * @id AI-15-093
 * Tinh gọn phương án quyết định trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần phương án quyết định lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_decision_alternative(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_decision_alternative(agentId, options);
}

/**
 * @id AI-15-094
 * Tinh gọn độ tin cậy quyết định trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy quyết định lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_decision_confidence(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_decision_confidence(agentId, options);
}

/**
 * @id AI-15-095
 * Tinh gọn xung đột quy tắc trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần xung đột quy tắc lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_rule_conflict(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_rule_conflict(agentId, options);
}

/**
 * @id AI-15-096
 * Tinh gọn ràng buộc quyết định trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần ràng buộc quyết định lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_decision_constraint(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_decision_constraint(agentId, options);
}

/**
 * @id AI-15-097
 * Tinh gọn điểm hành động trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần điểm hành động lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_action_score(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_action_score(agentId, options);
}

/**
 * @id AI-15-098
 * Tinh gọn lý do quyết định trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần lý do quyết định lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_decision_rationale(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_decision_rationale(agentId, options);
}

/**
 * @id AI-15-099
 * Tinh gọn bằng chứng mới trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần bằng chứng mới lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_new_evidence(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_new_evidence(agentId, options);
}

/**
 * @id AI-15-100
 * Tinh gọn dấu vết quyết định trong module suy luận và ra quyết định.
 * Mục đích: Loại bỏ hoặc gộp phần dấu vết quyết định lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rsn_prune_decision_trace(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReasoningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rsn_prune_decision_trace(agentId, options);
}

