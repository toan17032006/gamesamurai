/**
 * @file per-subsystem.ts
 * @module @aetheria/engine/npc
 * @description PER — Tính cách và xu hướng cá nhân (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module PER.
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

export interface INPCPersonalitySubsystem {
  per_initialize_personality_profile<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_risk_tolerance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_aggression_tendency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_curiosity_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_patience_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_loyalty_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_sociability_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_trait_stability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_personality_evidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_initialize_trait_expression<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_personality_profile<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_risk_tolerance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_aggression_tendency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_curiosity_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_patience_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_loyalty_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_sociability_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_trait_stability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_personality_evidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_capture_trait_expression<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  per_validate_personality_profile<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_risk_tolerance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_aggression_tendency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_curiosity_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_patience_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_loyalty_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_sociability_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_trait_stability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_personality_evidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_validate_trait_expression<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  per_normalize_personality_profile<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_risk_tolerance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_aggression_tendency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_curiosity_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_patience_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_loyalty_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_sociability_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_trait_stability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_personality_evidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_normalize_trait_expression<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  per_update_personality_profile<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_risk_tolerance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_aggression_tendency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_curiosity_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_patience_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_loyalty_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_sociability_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_trait_stability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_personality_evidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_update_trait_expression<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  per_evaluate_personality_profile<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_risk_tolerance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_aggression_tendency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_curiosity_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_patience_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_loyalty_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_sociability_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_trait_stability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_personality_evidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_evaluate_trait_expression<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  per_retrieve_personality_profile<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_risk_tolerance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_aggression_tendency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_curiosity_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_patience_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_loyalty_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_sociability_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_trait_stability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_personality_evidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_retrieve_trait_expression<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  per_serialize_personality_profile<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_risk_tolerance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_aggression_tendency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_curiosity_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_patience_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_loyalty_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_sociability_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_trait_stability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_personality_evidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_serialize_trait_expression<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  per_compare_personality_profile<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_risk_tolerance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_aggression_tendency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_curiosity_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_patience_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_loyalty_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_sociability_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_trait_stability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_personality_evidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_compare_trait_expression<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  per_prune_personality_profile(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_risk_tolerance(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_aggression_tendency(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_curiosity_trait(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_patience_trait(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_loyalty_trait(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_sociability_trait(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_trait_stability(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_personality_evidence(agentId: string, options?: PruningOptions): PruningResult;
  per_prune_trait_expression(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCPersonalitySubsystem extends NPCBaseSubsystem implements INPCPersonalitySubsystem {
  public readonly moduleCode = 'PER';
  public readonly moduleTitle = 'PER — Tính cách và xu hướng cá nhân (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-12-001
   * Khởi tạo hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hồ sơ tính cách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_personality_profile<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'personality_profile', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-002
   * Khởi tạo mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mức chấp nhận rủi ro.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_risk_tolerance<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'risk_tolerance', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-003
   * Khởi tạo xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xu hướng hung hăng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_aggression_tendency<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'aggression_tendency', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-004
   * Khởi tạo đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm tò mò.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_curiosity_trait<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'curiosity_trait', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-005
   * Khởi tạo đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm kiên nhẫn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_patience_trait<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'patience_trait', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-006
   * Khởi tạo đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm trung thành.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_loyalty_trait<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'loyalty_trait', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-007
   * Khởi tạo đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm hòa đồng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_sociability_trait<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sociability_trait', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-008
   * Khởi tạo độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ ổn định tính cách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_trait_stability<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trait_stability', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-009
   * Khởi tạo bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bằng chứng tính cách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_personality_evidence<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'personality_evidence', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-010
   * Khởi tạo biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho biểu hiện tính cách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_initialize_trait_expression<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trait_expression', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-12-011
   * Thu thập hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến hồ sơ tính cách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_personality_profile<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'personality_profile', data, context);
  }

  /**
   * @id AI-12-012
   * Thu thập mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến mức chấp nhận rủi ro từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_risk_tolerance<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'risk_tolerance', data, context);
  }

  /**
   * @id AI-12-013
   * Thu thập xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến xu hướng hung hăng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_aggression_tendency<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'aggression_tendency', data, context);
  }

  /**
   * @id AI-12-014
   * Thu thập đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm tò mò từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_curiosity_trait<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'curiosity_trait', data, context);
  }

  /**
   * @id AI-12-015
   * Thu thập đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm kiên nhẫn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_patience_trait<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'patience_trait', data, context);
  }

  /**
   * @id AI-12-016
   * Thu thập đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm trung thành từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_loyalty_trait<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'loyalty_trait', data, context);
  }

  /**
   * @id AI-12-017
   * Thu thập đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm hòa đồng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_sociability_trait<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sociability_trait', data, context);
  }

  /**
   * @id AI-12-018
   * Thu thập độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến độ ổn định tính cách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_trait_stability<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trait_stability', data, context);
  }

  /**
   * @id AI-12-019
   * Thu thập bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến bằng chứng tính cách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_personality_evidence<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'personality_evidence', data, context);
  }

  /**
   * @id AI-12-020
   * Thu thập biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến biểu hiện tính cách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_capture_trait_expression<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trait_expression', data, context);
  }

  /**
   * @id AI-12-021
   * Kiểm tra tính hợp lệ của hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hồ sơ tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_personality_profile<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-022
   * Kiểm tra tính hợp lệ của mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mức chấp nhận rủi ro.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_risk_tolerance<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-023
   * Kiểm tra tính hợp lệ của xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xu hướng hung hăng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_aggression_tendency<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-024
   * Kiểm tra tính hợp lệ của đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm tò mò.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_curiosity_trait<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-025
   * Kiểm tra tính hợp lệ của đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm kiên nhẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_patience_trait<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-026
   * Kiểm tra tính hợp lệ của đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm trung thành.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_loyalty_trait<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-027
   * Kiểm tra tính hợp lệ của đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm hòa đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_sociability_trait<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-028
   * Kiểm tra tính hợp lệ của độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ ổn định tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_trait_stability<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-029
   * Kiểm tra tính hợp lệ của bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bằng chứng tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_personality_evidence<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-030
   * Kiểm tra tính hợp lệ của biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của biểu hiện tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_validate_trait_expression<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-12-031
   * Chuẩn hóa hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn hồ sơ tính cách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_personality_profile<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-032
   * Chuẩn hóa mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn mức chấp nhận rủi ro để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_risk_tolerance<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-033
   * Chuẩn hóa xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn xu hướng hung hăng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_aggression_tendency<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-034
   * Chuẩn hóa đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn đặc điểm tò mò để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_curiosity_trait<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-035
   * Chuẩn hóa đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn đặc điểm kiên nhẫn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_patience_trait<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-036
   * Chuẩn hóa đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn đặc điểm trung thành để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_loyalty_trait<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-037
   * Chuẩn hóa đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn đặc điểm hòa đồng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_sociability_trait<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-038
   * Chuẩn hóa độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn độ ổn định tính cách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_trait_stability<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-039
   * Chuẩn hóa bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn bằng chứng tính cách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_personality_evidence<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-040
   * Chuẩn hóa biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn biểu hiện tính cách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_normalize_trait_expression<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-12-041
   * Cập nhật hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật hồ sơ tính cách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_personality_profile<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'personality_profile', updateData, context);
  }

  /**
   * @id AI-12-042
   * Cập nhật mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật mức chấp nhận rủi ro dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_risk_tolerance<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'risk_tolerance', updateData, context);
  }

  /**
   * @id AI-12-043
   * Cập nhật xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật xu hướng hung hăng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_aggression_tendency<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'aggression_tendency', updateData, context);
  }

  /**
   * @id AI-12-044
   * Cập nhật đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật đặc điểm tò mò dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_curiosity_trait<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'curiosity_trait', updateData, context);
  }

  /**
   * @id AI-12-045
   * Cập nhật đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật đặc điểm kiên nhẫn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_patience_trait<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'patience_trait', updateData, context);
  }

  /**
   * @id AI-12-046
   * Cập nhật đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật đặc điểm trung thành dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_loyalty_trait<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'loyalty_trait', updateData, context);
  }

  /**
   * @id AI-12-047
   * Cập nhật đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật đặc điểm hòa đồng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_sociability_trait<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'sociability_trait', updateData, context);
  }

  /**
   * @id AI-12-048
   * Cập nhật độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật độ ổn định tính cách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_trait_stability<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'trait_stability', updateData, context);
  }

  /**
   * @id AI-12-049
   * Cập nhật bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật bằng chứng tính cách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_personality_evidence<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'personality_evidence', updateData, context);
  }

  /**
   * @id AI-12-050
   * Cập nhật biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Cập nhật biểu hiện tính cách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_update_trait_expression<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'trait_expression', updateData, context);
  }

  /**
   * @id AI-12-051
   * Đánh giá hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hồ sơ tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_personality_profile<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-052
   * Đánh giá mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mức chấp nhận rủi ro.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_risk_tolerance<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-053
   * Đánh giá xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xu hướng hung hăng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_aggression_tendency<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-054
   * Đánh giá đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm tò mò.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_curiosity_trait<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-055
   * Đánh giá đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm kiên nhẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_patience_trait<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-056
   * Đánh giá đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm trung thành.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_loyalty_trait<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-057
   * Đánh giá đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm hòa đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_sociability_trait<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-058
   * Đánh giá độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ ổn định tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_trait_stability<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-059
   * Đánh giá bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bằng chứng tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_personality_evidence<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-060
   * Đánh giá biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của biểu hiện tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_evaluate_trait_expression<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-12-061
   * Truy xuất hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về hồ sơ tính cách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_personality_profile<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'personality_profile', query);
  }

  /**
   * @id AI-12-062
   * Truy xuất mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về mức chấp nhận rủi ro phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_risk_tolerance<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'risk_tolerance', query);
  }

  /**
   * @id AI-12-063
   * Truy xuất xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về xu hướng hung hăng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_aggression_tendency<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'aggression_tendency', query);
  }

  /**
   * @id AI-12-064
   * Truy xuất đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về đặc điểm tò mò phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_curiosity_trait<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'curiosity_trait', query);
  }

  /**
   * @id AI-12-065
   * Truy xuất đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về đặc điểm kiên nhẫn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_patience_trait<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'patience_trait', query);
  }

  /**
   * @id AI-12-066
   * Truy xuất đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về đặc điểm trung thành phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_loyalty_trait<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'loyalty_trait', query);
  }

  /**
   * @id AI-12-067
   * Truy xuất đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về đặc điểm hòa đồng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_sociability_trait<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'sociability_trait', query);
  }

  /**
   * @id AI-12-068
   * Truy xuất độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về độ ổn định tính cách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_trait_stability<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'trait_stability', query);
  }

  /**
   * @id AI-12-069
   * Truy xuất bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về bằng chứng tính cách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_personality_evidence<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'personality_evidence', query);
  }

  /**
   * @id AI-12-070
   * Truy xuất biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Tìm và trả về biểu hiện tính cách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_retrieve_trait_expression<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'trait_expression', query);
  }

  /**
   * @id AI-12-071
   * Tuần tự hóa hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển hồ sơ tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_personality_profile<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-072
   * Tuần tự hóa mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển mức chấp nhận rủi ro sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_risk_tolerance<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-073
   * Tuần tự hóa xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển xu hướng hung hăng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_aggression_tendency<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-074
   * Tuần tự hóa đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển đặc điểm tò mò sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_curiosity_trait<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-075
   * Tuần tự hóa đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển đặc điểm kiên nhẫn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_patience_trait<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-076
   * Tuần tự hóa đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển đặc điểm trung thành sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_loyalty_trait<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-077
   * Tuần tự hóa đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển đặc điểm hòa đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_sociability_trait<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-078
   * Tuần tự hóa độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển độ ổn định tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_trait_stability<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-079
   * Tuần tự hóa bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển bằng chứng tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_personality_evidence<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-080
   * Tuần tự hóa biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Chuyển biểu hiện tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_serialize_trait_expression<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-12-081
   * So sánh hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hồ sơ tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_personality_profile<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-082
   * So sánh mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mức chấp nhận rủi ro.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_risk_tolerance<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-083
   * So sánh xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của xu hướng hung hăng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_aggression_tendency<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-084
   * So sánh đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm tò mò.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_curiosity_trait<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-085
   * So sánh đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm kiên nhẫn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_patience_trait<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-086
   * So sánh đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm trung thành.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_loyalty_trait<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-087
   * So sánh đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm hòa đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_sociability_trait<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-088
   * So sánh độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ ổn định tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_trait_stability<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-089
   * So sánh bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bằng chứng tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_personality_evidence<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-090
   * So sánh biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của biểu hiện tính cách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public per_compare_trait_expression<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-12-091
   * Tinh gọn hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần hồ sơ tính cách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_personality_profile(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'personality_profile', options);
  }

  /**
   * @id AI-12-092
   * Tinh gọn mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần mức chấp nhận rủi ro lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_risk_tolerance(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'risk_tolerance', options);
  }

  /**
   * @id AI-12-093
   * Tinh gọn xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần xu hướng hung hăng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_aggression_tendency(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'aggression_tendency', options);
  }

  /**
   * @id AI-12-094
   * Tinh gọn đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần đặc điểm tò mò lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_curiosity_trait(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'curiosity_trait', options);
  }

  /**
   * @id AI-12-095
   * Tinh gọn đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần đặc điểm kiên nhẫn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_patience_trait(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'patience_trait', options);
  }

  /**
   * @id AI-12-096
   * Tinh gọn đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần đặc điểm trung thành lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_loyalty_trait(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'loyalty_trait', options);
  }

  /**
   * @id AI-12-097
   * Tinh gọn đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần đặc điểm hòa đồng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_sociability_trait(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'sociability_trait', options);
  }

  /**
   * @id AI-12-098
   * Tinh gọn độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần độ ổn định tính cách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_trait_stability(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'trait_stability', options);
  }

  /**
   * @id AI-12-099
   * Tinh gọn bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần bằng chứng tính cách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_personality_evidence(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'personality_evidence', options);
  }

  /**
   * @id AI-12-100
   * Tinh gọn biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần biểu hiện tính cách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public per_prune_trait_expression(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'trait_expression', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for PER)
// ============================================================================

let defaultSubsystem: NPCPersonalitySubsystem | null = null;
function getSubsystem(): NPCPersonalitySubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCPersonalitySubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-12-001
 * Khởi tạo hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hồ sơ tính cách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_personality_profile<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_personality_profile<T>(agentId, initialData, context);
}

/**
 * @id AI-12-002
 * Khởi tạo mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mức chấp nhận rủi ro.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_risk_tolerance<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_risk_tolerance<T>(agentId, initialData, context);
}

/**
 * @id AI-12-003
 * Khởi tạo xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xu hướng hung hăng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_aggression_tendency<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_aggression_tendency<T>(agentId, initialData, context);
}

/**
 * @id AI-12-004
 * Khởi tạo đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm tò mò.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_curiosity_trait<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_curiosity_trait<T>(agentId, initialData, context);
}

/**
 * @id AI-12-005
 * Khởi tạo đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm kiên nhẫn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_patience_trait<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_patience_trait<T>(agentId, initialData, context);
}

/**
 * @id AI-12-006
 * Khởi tạo đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm trung thành.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_loyalty_trait<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_loyalty_trait<T>(agentId, initialData, context);
}

/**
 * @id AI-12-007
 * Khởi tạo đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đặc điểm hòa đồng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_sociability_trait<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_sociability_trait<T>(agentId, initialData, context);
}

/**
 * @id AI-12-008
 * Khởi tạo độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ ổn định tính cách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_trait_stability<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_trait_stability<T>(agentId, initialData, context);
}

/**
 * @id AI-12-009
 * Khởi tạo bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bằng chứng tính cách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_personality_evidence<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_personality_evidence<T>(agentId, initialData, context);
}

/**
 * @id AI-12-010
 * Khởi tạo biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho biểu hiện tính cách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_initialize_trait_expression<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_initialize_trait_expression<T>(agentId, initialData, context);
}

/**
 * @id AI-12-011
 * Thu thập hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến hồ sơ tính cách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_personality_profile<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_personality_profile<T>(agentId, data, context);
}

/**
 * @id AI-12-012
 * Thu thập mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến mức chấp nhận rủi ro từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_risk_tolerance<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_risk_tolerance<T>(agentId, data, context);
}

/**
 * @id AI-12-013
 * Thu thập xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến xu hướng hung hăng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_aggression_tendency<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_aggression_tendency<T>(agentId, data, context);
}

/**
 * @id AI-12-014
 * Thu thập đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm tò mò từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_curiosity_trait<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_curiosity_trait<T>(agentId, data, context);
}

/**
 * @id AI-12-015
 * Thu thập đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm kiên nhẫn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_patience_trait<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_patience_trait<T>(agentId, data, context);
}

/**
 * @id AI-12-016
 * Thu thập đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm trung thành từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_loyalty_trait<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_loyalty_trait<T>(agentId, data, context);
}

/**
 * @id AI-12-017
 * Thu thập đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến đặc điểm hòa đồng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_sociability_trait<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_sociability_trait<T>(agentId, data, context);
}

/**
 * @id AI-12-018
 * Thu thập độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến độ ổn định tính cách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_trait_stability<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_trait_stability<T>(agentId, data, context);
}

/**
 * @id AI-12-019
 * Thu thập bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến bằng chứng tính cách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_personality_evidence<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_personality_evidence<T>(agentId, data, context);
}

/**
 * @id AI-12-020
 * Thu thập biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến biểu hiện tính cách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_capture_trait_expression<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_capture_trait_expression<T>(agentId, data, context);
}

/**
 * @id AI-12-021
 * Kiểm tra tính hợp lệ của hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hồ sơ tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_personality_profile<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-022
 * Kiểm tra tính hợp lệ của mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mức chấp nhận rủi ro.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_risk_tolerance<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-023
 * Kiểm tra tính hợp lệ của xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xu hướng hung hăng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_aggression_tendency<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-024
 * Kiểm tra tính hợp lệ của đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm tò mò.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_curiosity_trait<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-025
 * Kiểm tra tính hợp lệ của đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm kiên nhẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_patience_trait<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-026
 * Kiểm tra tính hợp lệ của đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm trung thành.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_loyalty_trait<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-027
 * Kiểm tra tính hợp lệ của đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đặc điểm hòa đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_sociability_trait<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-028
 * Kiểm tra tính hợp lệ của độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ ổn định tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_trait_stability<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-029
 * Kiểm tra tính hợp lệ của bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bằng chứng tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_personality_evidence<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-030
 * Kiểm tra tính hợp lệ của biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của biểu hiện tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_validate_trait_expression<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-12-031
 * Chuẩn hóa hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn hồ sơ tính cách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_personality_profile<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-032
 * Chuẩn hóa mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn mức chấp nhận rủi ro để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_risk_tolerance<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-033
 * Chuẩn hóa xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn xu hướng hung hăng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_aggression_tendency<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-034
 * Chuẩn hóa đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn đặc điểm tò mò để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_curiosity_trait<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-035
 * Chuẩn hóa đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn đặc điểm kiên nhẫn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_patience_trait<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-036
 * Chuẩn hóa đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn đặc điểm trung thành để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_loyalty_trait<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-037
 * Chuẩn hóa đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn đặc điểm hòa đồng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_sociability_trait<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-038
 * Chuẩn hóa độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn độ ổn định tính cách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_trait_stability<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-039
 * Chuẩn hóa bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn bằng chứng tính cách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_personality_evidence<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-040
 * Chuẩn hóa biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn biểu hiện tính cách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_normalize_trait_expression<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-12-041
 * Cập nhật hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật hồ sơ tính cách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_personality_profile<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_personality_profile<T>(agentId, updateData, context);
}

/**
 * @id AI-12-042
 * Cập nhật mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật mức chấp nhận rủi ro dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_risk_tolerance<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_risk_tolerance<T>(agentId, updateData, context);
}

/**
 * @id AI-12-043
 * Cập nhật xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật xu hướng hung hăng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_aggression_tendency<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_aggression_tendency<T>(agentId, updateData, context);
}

/**
 * @id AI-12-044
 * Cập nhật đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật đặc điểm tò mò dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_curiosity_trait<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_curiosity_trait<T>(agentId, updateData, context);
}

/**
 * @id AI-12-045
 * Cập nhật đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật đặc điểm kiên nhẫn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_patience_trait<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_patience_trait<T>(agentId, updateData, context);
}

/**
 * @id AI-12-046
 * Cập nhật đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật đặc điểm trung thành dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_loyalty_trait<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_loyalty_trait<T>(agentId, updateData, context);
}

/**
 * @id AI-12-047
 * Cập nhật đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật đặc điểm hòa đồng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_sociability_trait<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_sociability_trait<T>(agentId, updateData, context);
}

/**
 * @id AI-12-048
 * Cập nhật độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật độ ổn định tính cách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_trait_stability<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_trait_stability<T>(agentId, updateData, context);
}

/**
 * @id AI-12-049
 * Cập nhật bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật bằng chứng tính cách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_personality_evidence<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_personality_evidence<T>(agentId, updateData, context);
}

/**
 * @id AI-12-050
 * Cập nhật biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Cập nhật biểu hiện tính cách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_update_trait_expression<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).per_update_trait_expression<T>(agentId, updateData, context);
}

/**
 * @id AI-12-051
 * Đánh giá hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hồ sơ tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_personality_profile<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-052
 * Đánh giá mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mức chấp nhận rủi ro.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_risk_tolerance<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-053
 * Đánh giá xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xu hướng hung hăng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_aggression_tendency<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-054
 * Đánh giá đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm tò mò.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_curiosity_trait<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-055
 * Đánh giá đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm kiên nhẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_patience_trait<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-056
 * Đánh giá đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm trung thành.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_loyalty_trait<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-057
 * Đánh giá đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đặc điểm hòa đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_sociability_trait<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-058
 * Đánh giá độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ ổn định tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_trait_stability<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-059
 * Đánh giá bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bằng chứng tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_personality_evidence<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-060
 * Đánh giá biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của biểu hiện tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_evaluate_trait_expression<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-12-061
 * Truy xuất hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về hồ sơ tính cách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_personality_profile<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_personality_profile<T>(agentId, query);
}

/**
 * @id AI-12-062
 * Truy xuất mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về mức chấp nhận rủi ro phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_risk_tolerance<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_risk_tolerance<T>(agentId, query);
}

/**
 * @id AI-12-063
 * Truy xuất xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về xu hướng hung hăng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_aggression_tendency<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_aggression_tendency<T>(agentId, query);
}

/**
 * @id AI-12-064
 * Truy xuất đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về đặc điểm tò mò phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_curiosity_trait<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_curiosity_trait<T>(agentId, query);
}

/**
 * @id AI-12-065
 * Truy xuất đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về đặc điểm kiên nhẫn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_patience_trait<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_patience_trait<T>(agentId, query);
}

/**
 * @id AI-12-066
 * Truy xuất đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về đặc điểm trung thành phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_loyalty_trait<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_loyalty_trait<T>(agentId, query);
}

/**
 * @id AI-12-067
 * Truy xuất đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về đặc điểm hòa đồng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_sociability_trait<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_sociability_trait<T>(agentId, query);
}

/**
 * @id AI-12-068
 * Truy xuất độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về độ ổn định tính cách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_trait_stability<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_trait_stability<T>(agentId, query);
}

/**
 * @id AI-12-069
 * Truy xuất bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về bằng chứng tính cách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_personality_evidence<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_personality_evidence<T>(agentId, query);
}

/**
 * @id AI-12-070
 * Truy xuất biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Tìm và trả về biểu hiện tính cách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_retrieve_trait_expression<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersonalitySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).per_retrieve_trait_expression<T>(agentId, query);
}

/**
 * @id AI-12-071
 * Tuần tự hóa hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển hồ sơ tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_personality_profile<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-072
 * Tuần tự hóa mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển mức chấp nhận rủi ro sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_risk_tolerance<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-073
 * Tuần tự hóa xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển xu hướng hung hăng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_aggression_tendency<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-074
 * Tuần tự hóa đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển đặc điểm tò mò sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_curiosity_trait<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-075
 * Tuần tự hóa đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển đặc điểm kiên nhẫn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_patience_trait<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-076
 * Tuần tự hóa đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển đặc điểm trung thành sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_loyalty_trait<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-077
 * Tuần tự hóa đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển đặc điểm hòa đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_sociability_trait<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-078
 * Tuần tự hóa độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển độ ổn định tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_trait_stability<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-079
 * Tuần tự hóa bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển bằng chứng tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_personality_evidence<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-080
 * Tuần tự hóa biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Chuyển biểu hiện tính cách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_serialize_trait_expression<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-12-081
 * So sánh hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hồ sơ tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_personality_profile<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-082
 * So sánh mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mức chấp nhận rủi ro.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_risk_tolerance<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-083
 * So sánh xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của xu hướng hung hăng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_aggression_tendency<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-084
 * So sánh đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm tò mò.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_curiosity_trait<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-085
 * So sánh đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm kiên nhẫn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_patience_trait<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-086
 * So sánh đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm trung thành.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_loyalty_trait<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-087
 * So sánh đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đặc điểm hòa đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_sociability_trait<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-088
 * So sánh độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ ổn định tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_trait_stability<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-089
 * So sánh bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bằng chứng tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_personality_evidence<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-090
 * So sánh biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của biểu hiện tính cách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function per_compare_trait_expression<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-12-091
 * Tinh gọn hồ sơ tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần hồ sơ tính cách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_personality_profile(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_personality_profile(agentId, options);
}

/**
 * @id AI-12-092
 * Tinh gọn mức chấp nhận rủi ro trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần mức chấp nhận rủi ro lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_risk_tolerance(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_risk_tolerance(agentId, options);
}

/**
 * @id AI-12-093
 * Tinh gọn xu hướng hung hăng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần xu hướng hung hăng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_aggression_tendency(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_aggression_tendency(agentId, options);
}

/**
 * @id AI-12-094
 * Tinh gọn đặc điểm tò mò trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần đặc điểm tò mò lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_curiosity_trait(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_curiosity_trait(agentId, options);
}

/**
 * @id AI-12-095
 * Tinh gọn đặc điểm kiên nhẫn trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần đặc điểm kiên nhẫn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_patience_trait(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_patience_trait(agentId, options);
}

/**
 * @id AI-12-096
 * Tinh gọn đặc điểm trung thành trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần đặc điểm trung thành lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_loyalty_trait(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_loyalty_trait(agentId, options);
}

/**
 * @id AI-12-097
 * Tinh gọn đặc điểm hòa đồng trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần đặc điểm hòa đồng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_sociability_trait(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_sociability_trait(agentId, options);
}

/**
 * @id AI-12-098
 * Tinh gọn độ ổn định tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần độ ổn định tính cách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_trait_stability(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_trait_stability(agentId, options);
}

/**
 * @id AI-12-099
 * Tinh gọn bằng chứng tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần bằng chứng tính cách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_personality_evidence(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_personality_evidence(agentId, options);
}

/**
 * @id AI-12-100
 * Tinh gọn biểu hiện tính cách trong module tính cách và xu hướng cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần biểu hiện tính cách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function per_prune_trait_expression(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersonalitySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).per_prune_trait_expression(agentId, options);
}

