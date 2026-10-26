/**
 * @file rel-subsystem.ts
 * @module @aetheria/engine/npc
 * @description REL — Quan hệ và danh tiếng (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module REL.
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

export interface INPCRelationshipSubsystem {
  rel_initialize_relationship_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_social_interaction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_reputation_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_relationship_trust<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_grievance_history<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_friendship_strength<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_faction_standing<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_broken_promise<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_relationship_conflict<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_initialize_social_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_relationship_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_social_interaction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_reputation_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_relationship_trust<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_grievance_history<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_friendship_strength<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_faction_standing<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_broken_promise<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_relationship_conflict<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_capture_social_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rel_validate_relationship_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_social_interaction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_reputation_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_relationship_trust<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_grievance_history<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_friendship_strength<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_faction_standing<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_broken_promise<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_relationship_conflict<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_validate_social_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rel_normalize_relationship_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_social_interaction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_reputation_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_relationship_trust<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_grievance_history<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_friendship_strength<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_faction_standing<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_broken_promise<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_relationship_conflict<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_normalize_social_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rel_update_relationship_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_social_interaction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_reputation_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_relationship_trust<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_grievance_history<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_friendship_strength<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_faction_standing<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_broken_promise<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_relationship_conflict<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_update_social_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rel_evaluate_relationship_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_social_interaction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_reputation_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_relationship_trust<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_grievance_history<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_friendship_strength<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_faction_standing<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_broken_promise<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_relationship_conflict<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_evaluate_social_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rel_retrieve_relationship_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_social_interaction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_reputation_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_relationship_trust<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_grievance_history<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_friendship_strength<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_faction_standing<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_broken_promise<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_relationship_conflict<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_retrieve_social_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rel_serialize_relationship_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_social_interaction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_reputation_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_relationship_trust<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_grievance_history<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_friendship_strength<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_faction_standing<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_broken_promise<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_relationship_conflict<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_serialize_social_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rel_compare_relationship_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_social_interaction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_reputation_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_relationship_trust<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_grievance_history<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_friendship_strength<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_faction_standing<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_broken_promise<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_relationship_conflict<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_compare_social_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rel_prune_relationship_record(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_social_interaction(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_reputation_score(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_relationship_trust(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_grievance_history(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_friendship_strength(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_faction_standing(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_broken_promise(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_relationship_conflict(agentId: string, options?: PruningOptions): PruningResult;
  rel_prune_social_memory(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCRelationshipSubsystem extends NPCBaseSubsystem implements INPCRelationshipSubsystem {
  public readonly moduleCode = 'REL';
  public readonly moduleTitle = 'REL — Quan hệ và danh tiếng (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-18-001
   * Khởi tạo bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi quan hệ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_relationship_record<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_record', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-002
   * Khởi tạo tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tương tác xã hội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_social_interaction<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_interaction', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-003
   * Khởi tạo điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm danh tiếng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_reputation_score<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reputation_score', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-004
   * Khởi tạo lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lòng tin quan hệ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_relationship_trust<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_trust', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-005
   * Khởi tạo lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lịch sử bất mãn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_grievance_history<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'grievance_history', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-006
   * Khởi tạo độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ thân thiết.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_friendship_strength<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'friendship_strength', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-007
   * Khởi tạo vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vị thế phe phái.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_faction_standing<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'faction_standing', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-008
   * Khởi tạo lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lời hứa bị phá vỡ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_broken_promise<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'broken_promise', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-009
   * Khởi tạo xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xung đột quan hệ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_relationship_conflict<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_conflict', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-010
   * Khởi tạo ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức xã hội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_initialize_social_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-18-011
   * Thu thập bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến bản ghi quan hệ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_relationship_record<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_record', data, context);
  }

  /**
   * @id AI-18-012
   * Thu thập tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến tương tác xã hội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_social_interaction<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_interaction', data, context);
  }

  /**
   * @id AI-18-013
   * Thu thập điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến điểm danh tiếng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_reputation_score<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reputation_score', data, context);
  }

  /**
   * @id AI-18-014
   * Thu thập lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến lòng tin quan hệ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_relationship_trust<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_trust', data, context);
  }

  /**
   * @id AI-18-015
   * Thu thập lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến lịch sử bất mãn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_grievance_history<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'grievance_history', data, context);
  }

  /**
   * @id AI-18-016
   * Thu thập độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến độ thân thiết từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_friendship_strength<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'friendship_strength', data, context);
  }

  /**
   * @id AI-18-017
   * Thu thập vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến vị thế phe phái từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_faction_standing<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'faction_standing', data, context);
  }

  /**
   * @id AI-18-018
   * Thu thập lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến lời hứa bị phá vỡ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_broken_promise<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'broken_promise', data, context);
  }

  /**
   * @id AI-18-019
   * Thu thập xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến xung đột quan hệ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_relationship_conflict<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'relationship_conflict', data, context);
  }

  /**
   * @id AI-18-020
   * Thu thập ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức xã hội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_capture_social_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_memory', data, context);
  }

  /**
   * @id AI-18-021
   * Kiểm tra tính hợp lệ của bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_relationship_record<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-022
   * Kiểm tra tính hợp lệ của tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tương tác xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_social_interaction<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-023
   * Kiểm tra tính hợp lệ của điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm danh tiếng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_reputation_score<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-024
   * Kiểm tra tính hợp lệ của lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lòng tin quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_relationship_trust<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-025
   * Kiểm tra tính hợp lệ của lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lịch sử bất mãn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_grievance_history<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-026
   * Kiểm tra tính hợp lệ của độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ thân thiết.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_friendship_strength<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-027
   * Kiểm tra tính hợp lệ của vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vị thế phe phái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_faction_standing<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-028
   * Kiểm tra tính hợp lệ của lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lời hứa bị phá vỡ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_broken_promise<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-029
   * Kiểm tra tính hợp lệ của xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xung đột quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_relationship_conflict<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-030
   * Kiểm tra tính hợp lệ của ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_validate_social_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-18-031
   * Chuẩn hóa bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn bản ghi quan hệ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_relationship_record<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-032
   * Chuẩn hóa tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn tương tác xã hội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_social_interaction<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-033
   * Chuẩn hóa điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn điểm danh tiếng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_reputation_score<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-034
   * Chuẩn hóa lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn lòng tin quan hệ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_relationship_trust<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-035
   * Chuẩn hóa lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn lịch sử bất mãn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_grievance_history<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-036
   * Chuẩn hóa độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn độ thân thiết để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_friendship_strength<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-037
   * Chuẩn hóa vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn vị thế phe phái để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_faction_standing<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-038
   * Chuẩn hóa lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn lời hứa bị phá vỡ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_broken_promise<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-039
   * Chuẩn hóa xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn xung đột quan hệ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_relationship_conflict<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-040
   * Chuẩn hóa ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Chuẩn hóa biểu diễn ký ức xã hội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_normalize_social_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-18-041
   * Cập nhật bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật bản ghi quan hệ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_relationship_record<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'relationship_record', updateData, context);
  }

  /**
   * @id AI-18-042
   * Cập nhật tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật tương tác xã hội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_social_interaction<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'social_interaction', updateData, context);
  }

  /**
   * @id AI-18-043
   * Cập nhật điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật điểm danh tiếng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_reputation_score<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'reputation_score', updateData, context);
  }

  /**
   * @id AI-18-044
   * Cập nhật lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật lòng tin quan hệ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_relationship_trust<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'relationship_trust', updateData, context);
  }

  /**
   * @id AI-18-045
   * Cập nhật lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật lịch sử bất mãn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_grievance_history<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'grievance_history', updateData, context);
  }

  /**
   * @id AI-18-046
   * Cập nhật độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật độ thân thiết dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_friendship_strength<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'friendship_strength', updateData, context);
  }

  /**
   * @id AI-18-047
   * Cập nhật vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật vị thế phe phái dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_faction_standing<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'faction_standing', updateData, context);
  }

  /**
   * @id AI-18-048
   * Cập nhật lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật lời hứa bị phá vỡ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_broken_promise<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'broken_promise', updateData, context);
  }

  /**
   * @id AI-18-049
   * Cập nhật xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật xung đột quan hệ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_relationship_conflict<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'relationship_conflict', updateData, context);
  }

  /**
   * @id AI-18-050
   * Cập nhật ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Cập nhật ký ức xã hội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_update_social_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'social_memory', updateData, context);
  }

  /**
   * @id AI-18-051
   * Đánh giá bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_relationship_record<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-052
   * Đánh giá tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tương tác xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_social_interaction<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-053
   * Đánh giá điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm danh tiếng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_reputation_score<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-054
   * Đánh giá lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lòng tin quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_relationship_trust<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-055
   * Đánh giá lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lịch sử bất mãn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_grievance_history<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-056
   * Đánh giá độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ thân thiết.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_friendship_strength<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-057
   * Đánh giá vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vị thế phe phái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_faction_standing<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-058
   * Đánh giá lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lời hứa bị phá vỡ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_broken_promise<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-059
   * Đánh giá xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xung đột quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_relationship_conflict<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-060
   * Đánh giá ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_evaluate_social_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-18-061
   * Truy xuất bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về bản ghi quan hệ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_relationship_record<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'relationship_record', query);
  }

  /**
   * @id AI-18-062
   * Truy xuất tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về tương tác xã hội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_social_interaction<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'social_interaction', query);
  }

  /**
   * @id AI-18-063
   * Truy xuất điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về điểm danh tiếng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_reputation_score<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'reputation_score', query);
  }

  /**
   * @id AI-18-064
   * Truy xuất lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về lòng tin quan hệ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_relationship_trust<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'relationship_trust', query);
  }

  /**
   * @id AI-18-065
   * Truy xuất lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về lịch sử bất mãn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_grievance_history<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'grievance_history', query);
  }

  /**
   * @id AI-18-066
   * Truy xuất độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về độ thân thiết phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_friendship_strength<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'friendship_strength', query);
  }

  /**
   * @id AI-18-067
   * Truy xuất vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về vị thế phe phái phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_faction_standing<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'faction_standing', query);
  }

  /**
   * @id AI-18-068
   * Truy xuất lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về lời hứa bị phá vỡ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_broken_promise<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'broken_promise', query);
  }

  /**
   * @id AI-18-069
   * Truy xuất xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về xung đột quan hệ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_relationship_conflict<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'relationship_conflict', query);
  }

  /**
   * @id AI-18-070
   * Truy xuất ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Tìm và trả về ký ức xã hội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_retrieve_social_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'social_memory', query);
  }

  /**
   * @id AI-18-071
   * Tuần tự hóa bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển bản ghi quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_relationship_record<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-072
   * Tuần tự hóa tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển tương tác xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_social_interaction<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-073
   * Tuần tự hóa điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển điểm danh tiếng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_reputation_score<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-074
   * Tuần tự hóa lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển lòng tin quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_relationship_trust<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-075
   * Tuần tự hóa lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển lịch sử bất mãn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_grievance_history<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-076
   * Tuần tự hóa độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển độ thân thiết sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_friendship_strength<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-077
   * Tuần tự hóa vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển vị thế phe phái sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_faction_standing<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-078
   * Tuần tự hóa lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển lời hứa bị phá vỡ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_broken_promise<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-079
   * Tuần tự hóa xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển xung đột quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_relationship_conflict<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-080
   * Tuần tự hóa ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Chuyển ký ức xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_serialize_social_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-18-081
   * So sánh bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_relationship_record<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-082
   * So sánh tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tương tác xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_social_interaction<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-083
   * So sánh điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm danh tiếng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_reputation_score<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-084
   * So sánh lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lòng tin quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_relationship_trust<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-085
   * So sánh lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lịch sử bất mãn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_grievance_history<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-086
   * So sánh độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ thân thiết.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_friendship_strength<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-087
   * So sánh vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của vị thế phe phái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_faction_standing<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-088
   * So sánh lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lời hứa bị phá vỡ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_broken_promise<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-089
   * So sánh xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của xung đột quan hệ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_relationship_conflict<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-090
   * So sánh ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rel_compare_social_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-18-091
   * Tinh gọn bản ghi quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần bản ghi quan hệ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_relationship_record(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'relationship_record', options);
  }

  /**
   * @id AI-18-092
   * Tinh gọn tương tác xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần tương tác xã hội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_social_interaction(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'social_interaction', options);
  }

  /**
   * @id AI-18-093
   * Tinh gọn điểm danh tiếng trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần điểm danh tiếng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_reputation_score(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'reputation_score', options);
  }

  /**
   * @id AI-18-094
   * Tinh gọn lòng tin quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần lòng tin quan hệ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_relationship_trust(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'relationship_trust', options);
  }

  /**
   * @id AI-18-095
   * Tinh gọn lịch sử bất mãn trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần lịch sử bất mãn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_grievance_history(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'grievance_history', options);
  }

  /**
   * @id AI-18-096
   * Tinh gọn độ thân thiết trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần độ thân thiết lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_friendship_strength(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'friendship_strength', options);
  }

  /**
   * @id AI-18-097
   * Tinh gọn vị thế phe phái trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần vị thế phe phái lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_faction_standing(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'faction_standing', options);
  }

  /**
   * @id AI-18-098
   * Tinh gọn lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần lời hứa bị phá vỡ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_broken_promise(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'broken_promise', options);
  }

  /**
   * @id AI-18-099
   * Tinh gọn xung đột quan hệ trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần xung đột quan hệ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_relationship_conflict(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'relationship_conflict', options);
  }

  /**
   * @id AI-18-100
   * Tinh gọn ký ức xã hội trong module quan hệ và danh tiếng.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức xã hội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rel_prune_social_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'social_memory', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for REL)
// ============================================================================

let defaultSubsystem: NPCRelationshipSubsystem | null = null;
function getSubsystem(): NPCRelationshipSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCRelationshipSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-18-001
 * Khởi tạo bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi quan hệ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_relationship_record<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_relationship_record<T>(agentId, initialData, context);
}

/**
 * @id AI-18-002
 * Khởi tạo tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tương tác xã hội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_social_interaction<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_social_interaction<T>(agentId, initialData, context);
}

/**
 * @id AI-18-003
 * Khởi tạo điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm danh tiếng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_reputation_score<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_reputation_score<T>(agentId, initialData, context);
}

/**
 * @id AI-18-004
 * Khởi tạo lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lòng tin quan hệ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_relationship_trust<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_relationship_trust<T>(agentId, initialData, context);
}

/**
 * @id AI-18-005
 * Khởi tạo lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lịch sử bất mãn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_grievance_history<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_grievance_history<T>(agentId, initialData, context);
}

/**
 * @id AI-18-006
 * Khởi tạo độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ thân thiết.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_friendship_strength<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_friendship_strength<T>(agentId, initialData, context);
}

/**
 * @id AI-18-007
 * Khởi tạo vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vị thế phe phái.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_faction_standing<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_faction_standing<T>(agentId, initialData, context);
}

/**
 * @id AI-18-008
 * Khởi tạo lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lời hứa bị phá vỡ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_broken_promise<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_broken_promise<T>(agentId, initialData, context);
}

/**
 * @id AI-18-009
 * Khởi tạo xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xung đột quan hệ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_relationship_conflict<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_relationship_conflict<T>(agentId, initialData, context);
}

/**
 * @id AI-18-010
 * Khởi tạo ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức xã hội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_initialize_social_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_initialize_social_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-18-011
 * Thu thập bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến bản ghi quan hệ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_relationship_record<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_relationship_record<T>(agentId, data, context);
}

/**
 * @id AI-18-012
 * Thu thập tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến tương tác xã hội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_social_interaction<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_social_interaction<T>(agentId, data, context);
}

/**
 * @id AI-18-013
 * Thu thập điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến điểm danh tiếng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_reputation_score<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_reputation_score<T>(agentId, data, context);
}

/**
 * @id AI-18-014
 * Thu thập lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến lòng tin quan hệ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_relationship_trust<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_relationship_trust<T>(agentId, data, context);
}

/**
 * @id AI-18-015
 * Thu thập lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến lịch sử bất mãn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_grievance_history<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_grievance_history<T>(agentId, data, context);
}

/**
 * @id AI-18-016
 * Thu thập độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến độ thân thiết từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_friendship_strength<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_friendship_strength<T>(agentId, data, context);
}

/**
 * @id AI-18-017
 * Thu thập vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến vị thế phe phái từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_faction_standing<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_faction_standing<T>(agentId, data, context);
}

/**
 * @id AI-18-018
 * Thu thập lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến lời hứa bị phá vỡ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_broken_promise<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_broken_promise<T>(agentId, data, context);
}

/**
 * @id AI-18-019
 * Thu thập xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến xung đột quan hệ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_relationship_conflict<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_relationship_conflict<T>(agentId, data, context);
}

/**
 * @id AI-18-020
 * Thu thập ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức xã hội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_capture_social_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_capture_social_memory<T>(agentId, data, context);
}

/**
 * @id AI-18-021
 * Kiểm tra tính hợp lệ của bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_relationship_record<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-022
 * Kiểm tra tính hợp lệ của tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tương tác xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_social_interaction<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-023
 * Kiểm tra tính hợp lệ của điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm danh tiếng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_reputation_score<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-024
 * Kiểm tra tính hợp lệ của lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lòng tin quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_relationship_trust<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-025
 * Kiểm tra tính hợp lệ của lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lịch sử bất mãn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_grievance_history<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-026
 * Kiểm tra tính hợp lệ của độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ thân thiết.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_friendship_strength<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-027
 * Kiểm tra tính hợp lệ của vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vị thế phe phái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_faction_standing<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-028
 * Kiểm tra tính hợp lệ của lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lời hứa bị phá vỡ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_broken_promise<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-029
 * Kiểm tra tính hợp lệ của xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xung đột quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_relationship_conflict<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-030
 * Kiểm tra tính hợp lệ của ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_validate_social_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-18-031
 * Chuẩn hóa bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn bản ghi quan hệ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_relationship_record<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-032
 * Chuẩn hóa tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn tương tác xã hội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_social_interaction<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-033
 * Chuẩn hóa điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn điểm danh tiếng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_reputation_score<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-034
 * Chuẩn hóa lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn lòng tin quan hệ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_relationship_trust<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-035
 * Chuẩn hóa lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn lịch sử bất mãn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_grievance_history<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-036
 * Chuẩn hóa độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn độ thân thiết để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_friendship_strength<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-037
 * Chuẩn hóa vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn vị thế phe phái để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_faction_standing<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-038
 * Chuẩn hóa lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn lời hứa bị phá vỡ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_broken_promise<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-039
 * Chuẩn hóa xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn xung đột quan hệ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_relationship_conflict<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-040
 * Chuẩn hóa ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Chuẩn hóa biểu diễn ký ức xã hội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_normalize_social_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-18-041
 * Cập nhật bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật bản ghi quan hệ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_relationship_record<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_relationship_record<T>(agentId, updateData, context);
}

/**
 * @id AI-18-042
 * Cập nhật tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật tương tác xã hội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_social_interaction<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_social_interaction<T>(agentId, updateData, context);
}

/**
 * @id AI-18-043
 * Cập nhật điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật điểm danh tiếng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_reputation_score<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_reputation_score<T>(agentId, updateData, context);
}

/**
 * @id AI-18-044
 * Cập nhật lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật lòng tin quan hệ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_relationship_trust<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_relationship_trust<T>(agentId, updateData, context);
}

/**
 * @id AI-18-045
 * Cập nhật lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật lịch sử bất mãn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_grievance_history<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_grievance_history<T>(agentId, updateData, context);
}

/**
 * @id AI-18-046
 * Cập nhật độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật độ thân thiết dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_friendship_strength<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_friendship_strength<T>(agentId, updateData, context);
}

/**
 * @id AI-18-047
 * Cập nhật vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật vị thế phe phái dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_faction_standing<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_faction_standing<T>(agentId, updateData, context);
}

/**
 * @id AI-18-048
 * Cập nhật lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật lời hứa bị phá vỡ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_broken_promise<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_broken_promise<T>(agentId, updateData, context);
}

/**
 * @id AI-18-049
 * Cập nhật xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật xung đột quan hệ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_relationship_conflict<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_relationship_conflict<T>(agentId, updateData, context);
}

/**
 * @id AI-18-050
 * Cập nhật ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Cập nhật ký ức xã hội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_update_social_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rel_update_social_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-18-051
 * Đánh giá bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_relationship_record<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-052
 * Đánh giá tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tương tác xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_social_interaction<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-053
 * Đánh giá điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm danh tiếng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_reputation_score<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-054
 * Đánh giá lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lòng tin quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_relationship_trust<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-055
 * Đánh giá lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lịch sử bất mãn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_grievance_history<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-056
 * Đánh giá độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ thân thiết.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_friendship_strength<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-057
 * Đánh giá vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vị thế phe phái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_faction_standing<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-058
 * Đánh giá lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lời hứa bị phá vỡ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_broken_promise<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-059
 * Đánh giá xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xung đột quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_relationship_conflict<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-060
 * Đánh giá ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_evaluate_social_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-18-061
 * Truy xuất bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về bản ghi quan hệ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_relationship_record<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_relationship_record<T>(agentId, query);
}

/**
 * @id AI-18-062
 * Truy xuất tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về tương tác xã hội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_social_interaction<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_social_interaction<T>(agentId, query);
}

/**
 * @id AI-18-063
 * Truy xuất điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về điểm danh tiếng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_reputation_score<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_reputation_score<T>(agentId, query);
}

/**
 * @id AI-18-064
 * Truy xuất lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về lòng tin quan hệ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_relationship_trust<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_relationship_trust<T>(agentId, query);
}

/**
 * @id AI-18-065
 * Truy xuất lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về lịch sử bất mãn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_grievance_history<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_grievance_history<T>(agentId, query);
}

/**
 * @id AI-18-066
 * Truy xuất độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về độ thân thiết phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_friendship_strength<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_friendship_strength<T>(agentId, query);
}

/**
 * @id AI-18-067
 * Truy xuất vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về vị thế phe phái phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_faction_standing<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_faction_standing<T>(agentId, query);
}

/**
 * @id AI-18-068
 * Truy xuất lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về lời hứa bị phá vỡ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_broken_promise<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_broken_promise<T>(agentId, query);
}

/**
 * @id AI-18-069
 * Truy xuất xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về xung đột quan hệ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_relationship_conflict<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_relationship_conflict<T>(agentId, query);
}

/**
 * @id AI-18-070
 * Truy xuất ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Tìm và trả về ký ức xã hội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_retrieve_social_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCRelationshipSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rel_retrieve_social_memory<T>(agentId, query);
}

/**
 * @id AI-18-071
 * Tuần tự hóa bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển bản ghi quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_relationship_record<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-072
 * Tuần tự hóa tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển tương tác xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_social_interaction<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-073
 * Tuần tự hóa điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển điểm danh tiếng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_reputation_score<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-074
 * Tuần tự hóa lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển lòng tin quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_relationship_trust<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-075
 * Tuần tự hóa lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển lịch sử bất mãn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_grievance_history<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-076
 * Tuần tự hóa độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển độ thân thiết sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_friendship_strength<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-077
 * Tuần tự hóa vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển vị thế phe phái sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_faction_standing<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-078
 * Tuần tự hóa lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển lời hứa bị phá vỡ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_broken_promise<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-079
 * Tuần tự hóa xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển xung đột quan hệ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_relationship_conflict<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-080
 * Tuần tự hóa ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Chuyển ký ức xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_serialize_social_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-18-081
 * So sánh bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_relationship_record<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-082
 * So sánh tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tương tác xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_social_interaction<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-083
 * So sánh điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm danh tiếng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_reputation_score<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-084
 * So sánh lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lòng tin quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_relationship_trust<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-085
 * So sánh lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lịch sử bất mãn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_grievance_history<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-086
 * So sánh độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ thân thiết.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_friendship_strength<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-087
 * So sánh vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của vị thế phe phái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_faction_standing<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-088
 * So sánh lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lời hứa bị phá vỡ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_broken_promise<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-089
 * So sánh xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của xung đột quan hệ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_relationship_conflict<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-090
 * So sánh ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rel_compare_social_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-18-091
 * Tinh gọn bản ghi quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần bản ghi quan hệ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_relationship_record(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_relationship_record(agentId, options);
}

/**
 * @id AI-18-092
 * Tinh gọn tương tác xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần tương tác xã hội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_social_interaction(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_social_interaction(agentId, options);
}

/**
 * @id AI-18-093
 * Tinh gọn điểm danh tiếng trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần điểm danh tiếng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_reputation_score(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_reputation_score(agentId, options);
}

/**
 * @id AI-18-094
 * Tinh gọn lòng tin quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần lòng tin quan hệ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_relationship_trust(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_relationship_trust(agentId, options);
}

/**
 * @id AI-18-095
 * Tinh gọn lịch sử bất mãn trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần lịch sử bất mãn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_grievance_history(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_grievance_history(agentId, options);
}

/**
 * @id AI-18-096
 * Tinh gọn độ thân thiết trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần độ thân thiết lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_friendship_strength(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_friendship_strength(agentId, options);
}

/**
 * @id AI-18-097
 * Tinh gọn vị thế phe phái trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần vị thế phe phái lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_faction_standing(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_faction_standing(agentId, options);
}

/**
 * @id AI-18-098
 * Tinh gọn lời hứa bị phá vỡ trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần lời hứa bị phá vỡ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_broken_promise(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_broken_promise(agentId, options);
}

/**
 * @id AI-18-099
 * Tinh gọn xung đột quan hệ trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần xung đột quan hệ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_relationship_conflict(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_relationship_conflict(agentId, options);
}

/**
 * @id AI-18-100
 * Tinh gọn ký ức xã hội trong module quan hệ và danh tiếng.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức xã hội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rel_prune_social_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCRelationshipSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rel_prune_social_memory(agentId, options);
}

