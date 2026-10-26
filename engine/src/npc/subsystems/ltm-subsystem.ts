/**
 * @file ltm-subsystem.ts
 * @module @aetheria/engine/npc
 * @description LTM — Ghi nhớ dài hạn (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module LTM.
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

export interface INPCLongTermMemorySubsystem {
  ltm_initialize_long_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_episodic_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_semantic_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_procedural_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_autobiographical_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_memory_strength<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_memory_consolidation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_memory_archive<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_persistent_fact<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_initialize_memory_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_long_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_episodic_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_semantic_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_procedural_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_autobiographical_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_memory_strength<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_memory_consolidation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_memory_archive<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_persistent_fact<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_capture_memory_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_validate_long_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_episodic_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_semantic_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_procedural_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_autobiographical_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_memory_strength<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_memory_consolidation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_memory_archive<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_persistent_fact<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_validate_memory_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  ltm_normalize_long_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_episodic_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_semantic_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_procedural_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_autobiographical_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_memory_strength<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_memory_consolidation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_memory_archive<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_persistent_fact<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_normalize_memory_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  ltm_update_long_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_episodic_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_semantic_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_procedural_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_autobiographical_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_memory_strength<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_memory_consolidation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_memory_archive<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_persistent_fact<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_update_memory_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  ltm_evaluate_long_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_episodic_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_semantic_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_procedural_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_autobiographical_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_memory_strength<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_memory_consolidation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_memory_archive<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_persistent_fact<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_evaluate_memory_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  ltm_retrieve_long_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_episodic_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_semantic_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_procedural_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_autobiographical_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_memory_strength<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_memory_consolidation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_memory_archive<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_persistent_fact<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_retrieve_memory_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  ltm_serialize_long_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_episodic_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_semantic_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_procedural_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_autobiographical_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_memory_strength<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_memory_consolidation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_memory_archive<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_persistent_fact<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_serialize_memory_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  ltm_compare_long_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_episodic_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_semantic_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_procedural_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_autobiographical_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_memory_strength<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_memory_consolidation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_memory_archive<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_persistent_fact<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_compare_memory_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  ltm_prune_long_memory(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_episodic_memory(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_semantic_memory(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_procedural_memory(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_autobiographical_memory(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_memory_strength(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_memory_consolidation(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_memory_archive(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_persistent_fact(agentId: string, options?: PruningOptions): PruningResult;
  ltm_prune_memory_checkpoint(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCLongTermMemorySubsystem extends NPCBaseSubsystem implements INPCLongTermMemorySubsystem {
  public readonly moduleCode = 'LTM';
  public readonly moduleTitle = 'LTM — Ghi nhớ dài hạn (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-03-001
   * Khởi tạo ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức dài hạn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_long_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'long_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-002
   * Khởi tạo ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_episodic_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'episodic_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-003
   * Khởi tạo ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức kiến thức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_semantic_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'semantic_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-004
   * Khởi tạo ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_procedural_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'procedural_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-005
   * Khởi tạo ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức cá nhân.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_autobiographical_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'autobiographical_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-006
   * Khởi tạo độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ mạnh ký ức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_memory_strength<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_strength', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-007
   * Khởi tạo củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho củng cố ký ức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_memory_consolidation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_consolidation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-008
   * Khởi tạo kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kho ký ức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_memory_archive<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_archive', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-009
   * Khởi tạo dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dữ kiện bền vững.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_persistent_fact<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'persistent_fact', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-010
   * Khởi tạo mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mốc lưu ký ức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_initialize_memory_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_checkpoint', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-03-011
   * Thu thập ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức dài hạn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_long_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'long_memory', data, context);
  }

  /**
   * @id AI-03-012
   * Thu thập ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức sự kiện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_episodic_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'episodic_memory', data, context);
  }

  /**
   * @id AI-03-013
   * Thu thập ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức kiến thức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_semantic_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'semantic_memory', data, context);
  }

  /**
   * @id AI-03-014
   * Thu thập ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_procedural_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'procedural_memory', data, context);
  }

  /**
   * @id AI-03-015
   * Thu thập ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến ký ức cá nhân từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_autobiographical_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'autobiographical_memory', data, context);
  }

  /**
   * @id AI-03-016
   * Thu thập độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến độ mạnh ký ức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_memory_strength<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_strength', data, context);
  }

  /**
   * @id AI-03-017
   * Thu thập củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến củng cố ký ức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_memory_consolidation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_consolidation', data, context);
  }

  /**
   * @id AI-03-018
   * Thu thập kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến kho ký ức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_memory_archive<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_archive', data, context);
  }

  /**
   * @id AI-03-019
   * Thu thập dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến dữ kiện bền vững từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_persistent_fact<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'persistent_fact', data, context);
  }

  /**
   * @id AI-03-020
   * Thu thập mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Thu thập dữ liệu liên quan đến mốc lưu ký ức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_capture_memory_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_checkpoint', data, context);
  }

  /**
   * @id AI-03-021
   * Kiểm tra tính hợp lệ của ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức dài hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_long_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-022
   * Kiểm tra tính hợp lệ của ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_episodic_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-023
   * Kiểm tra tính hợp lệ của ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức kiến thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_semantic_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-024
   * Kiểm tra tính hợp lệ của ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_procedural_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-025
   * Kiểm tra tính hợp lệ của ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức cá nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_autobiographical_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-026
   * Kiểm tra tính hợp lệ của độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ mạnh ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_memory_strength<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-027
   * Kiểm tra tính hợp lệ của củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của củng cố ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_memory_consolidation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-028
   * Kiểm tra tính hợp lệ của kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kho ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_memory_archive<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-029
   * Kiểm tra tính hợp lệ của dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dữ kiện bền vững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_persistent_fact<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-030
   * Kiểm tra tính hợp lệ của mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mốc lưu ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_validate_memory_checkpoint<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-03-031
   * Chuẩn hóa ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn ký ức dài hạn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_long_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-032
   * Chuẩn hóa ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn ký ức sự kiện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_episodic_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-033
   * Chuẩn hóa ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn ký ức kiến thức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_semantic_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-034
   * Chuẩn hóa ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn ký ức kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_procedural_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-035
   * Chuẩn hóa ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn ký ức cá nhân để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_autobiographical_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-036
   * Chuẩn hóa độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn độ mạnh ký ức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_memory_strength<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-037
   * Chuẩn hóa củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn củng cố ký ức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_memory_consolidation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-038
   * Chuẩn hóa kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn kho ký ức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_memory_archive<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-039
   * Chuẩn hóa dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn dữ kiện bền vững để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_persistent_fact<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-040
   * Chuẩn hóa mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuẩn hóa biểu diễn mốc lưu ký ức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_normalize_memory_checkpoint<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-03-041
   * Cập nhật ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật ký ức dài hạn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_long_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'long_memory', updateData, context);
  }

  /**
   * @id AI-03-042
   * Cập nhật ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật ký ức sự kiện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_episodic_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'episodic_memory', updateData, context);
  }

  /**
   * @id AI-03-043
   * Cập nhật ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật ký ức kiến thức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_semantic_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'semantic_memory', updateData, context);
  }

  /**
   * @id AI-03-044
   * Cập nhật ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật ký ức kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_procedural_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'procedural_memory', updateData, context);
  }

  /**
   * @id AI-03-045
   * Cập nhật ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật ký ức cá nhân dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_autobiographical_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'autobiographical_memory', updateData, context);
  }

  /**
   * @id AI-03-046
   * Cập nhật độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật độ mạnh ký ức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_memory_strength<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_strength', updateData, context);
  }

  /**
   * @id AI-03-047
   * Cập nhật củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật củng cố ký ức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_memory_consolidation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_consolidation', updateData, context);
  }

  /**
   * @id AI-03-048
   * Cập nhật kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật kho ký ức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_memory_archive<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_archive', updateData, context);
  }

  /**
   * @id AI-03-049
   * Cập nhật dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật dữ kiện bền vững dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_persistent_fact<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'persistent_fact', updateData, context);
  }

  /**
   * @id AI-03-050
   * Cập nhật mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Cập nhật mốc lưu ký ức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_update_memory_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_checkpoint', updateData, context);
  }

  /**
   * @id AI-03-051
   * Đánh giá ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức dài hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_long_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-052
   * Đánh giá ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_episodic_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-053
   * Đánh giá ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức kiến thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_semantic_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-054
   * Đánh giá ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_procedural_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-055
   * Đánh giá ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức cá nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_autobiographical_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-056
   * Đánh giá độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ mạnh ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_memory_strength<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-057
   * Đánh giá củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của củng cố ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_memory_consolidation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-058
   * Đánh giá kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kho ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_memory_archive<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-059
   * Đánh giá dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dữ kiện bền vững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_persistent_fact<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-060
   * Đánh giá mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mốc lưu ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_evaluate_memory_checkpoint<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-03-061
   * Truy xuất ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về ký ức dài hạn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_long_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'long_memory', query);
  }

  /**
   * @id AI-03-062
   * Truy xuất ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về ký ức sự kiện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_episodic_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'episodic_memory', query);
  }

  /**
   * @id AI-03-063
   * Truy xuất ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về ký ức kiến thức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_semantic_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'semantic_memory', query);
  }

  /**
   * @id AI-03-064
   * Truy xuất ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về ký ức kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_procedural_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'procedural_memory', query);
  }

  /**
   * @id AI-03-065
   * Truy xuất ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về ký ức cá nhân phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_autobiographical_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'autobiographical_memory', query);
  }

  /**
   * @id AI-03-066
   * Truy xuất độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về độ mạnh ký ức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_memory_strength<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_strength', query);
  }

  /**
   * @id AI-03-067
   * Truy xuất củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về củng cố ký ức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_memory_consolidation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_consolidation', query);
  }

  /**
   * @id AI-03-068
   * Truy xuất kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về kho ký ức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_memory_archive<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_archive', query);
  }

  /**
   * @id AI-03-069
   * Truy xuất dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về dữ kiện bền vững phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_persistent_fact<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'persistent_fact', query);
  }

  /**
   * @id AI-03-070
   * Truy xuất mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Tìm và trả về mốc lưu ký ức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_retrieve_memory_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_checkpoint', query);
  }

  /**
   * @id AI-03-071
   * Tuần tự hóa ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển ký ức dài hạn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_long_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-072
   * Tuần tự hóa ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển ký ức sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_episodic_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-073
   * Tuần tự hóa ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển ký ức kiến thức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_semantic_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-074
   * Tuần tự hóa ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển ký ức kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_procedural_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-075
   * Tuần tự hóa ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển ký ức cá nhân sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_autobiographical_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-076
   * Tuần tự hóa độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển độ mạnh ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_memory_strength<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-077
   * Tuần tự hóa củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển củng cố ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_memory_consolidation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-078
   * Tuần tự hóa kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển kho ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_memory_archive<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-079
   * Tuần tự hóa dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển dữ kiện bền vững sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_persistent_fact<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-080
   * Tuần tự hóa mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Chuyển mốc lưu ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_serialize_memory_checkpoint<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-03-081
   * So sánh ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức dài hạn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_long_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-082
   * So sánh ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức sự kiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_episodic_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-083
   * So sánh ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức kiến thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_semantic_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-084
   * So sánh ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_procedural_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-085
   * So sánh ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức cá nhân.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_autobiographical_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-086
   * So sánh độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ mạnh ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_memory_strength<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-087
   * So sánh củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của củng cố ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_memory_consolidation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-088
   * So sánh kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kho ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_memory_archive<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-089
   * So sánh dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dữ kiện bền vững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_persistent_fact<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-090
   * So sánh mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mốc lưu ký ức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public ltm_compare_memory_checkpoint<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-03-091
   * Tinh gọn ký ức dài hạn trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức dài hạn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_long_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'long_memory', options);
  }

  /**
   * @id AI-03-092
   * Tinh gọn ký ức sự kiện trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức sự kiện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_episodic_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'episodic_memory', options);
  }

  /**
   * @id AI-03-093
   * Tinh gọn ký ức kiến thức trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức kiến thức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_semantic_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'semantic_memory', options);
  }

  /**
   * @id AI-03-094
   * Tinh gọn ký ức kỹ năng trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_procedural_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'procedural_memory', options);
  }

  /**
   * @id AI-03-095
   * Tinh gọn ký ức cá nhân trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần ký ức cá nhân lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_autobiographical_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'autobiographical_memory', options);
  }

  /**
   * @id AI-03-096
   * Tinh gọn độ mạnh ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần độ mạnh ký ức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_memory_strength(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_strength', options);
  }

  /**
   * @id AI-03-097
   * Tinh gọn củng cố ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần củng cố ký ức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_memory_consolidation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_consolidation', options);
  }

  /**
   * @id AI-03-098
   * Tinh gọn kho ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần kho ký ức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_memory_archive(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_archive', options);
  }

  /**
   * @id AI-03-099
   * Tinh gọn dữ kiện bền vững trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần dữ kiện bền vững lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_persistent_fact(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'persistent_fact', options);
  }

  /**
   * @id AI-03-100
   * Tinh gọn mốc lưu ký ức trong module ghi nhớ dài hạn.
   * Mục đích: Loại bỏ hoặc gộp phần mốc lưu ký ức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public ltm_prune_memory_checkpoint(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_checkpoint', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for LTM)
// ============================================================================

let defaultSubsystem: NPCLongTermMemorySubsystem | null = null;
function getSubsystem(): NPCLongTermMemorySubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCLongTermMemorySubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-03-001
 * Khởi tạo ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức dài hạn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_long_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_long_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-03-002
 * Khởi tạo ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_episodic_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_episodic_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-03-003
 * Khởi tạo ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức kiến thức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_semantic_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_semantic_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-03-004
 * Khởi tạo ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_procedural_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_procedural_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-03-005
 * Khởi tạo ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ký ức cá nhân.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_autobiographical_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_autobiographical_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-03-006
 * Khởi tạo độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ mạnh ký ức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_memory_strength<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_memory_strength<T>(agentId, initialData, context);
}

/**
 * @id AI-03-007
 * Khởi tạo củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho củng cố ký ức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_memory_consolidation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_memory_consolidation<T>(agentId, initialData, context);
}

/**
 * @id AI-03-008
 * Khởi tạo kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kho ký ức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_memory_archive<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_memory_archive<T>(agentId, initialData, context);
}

/**
 * @id AI-03-009
 * Khởi tạo dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dữ kiện bền vững.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_persistent_fact<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_persistent_fact<T>(agentId, initialData, context);
}

/**
 * @id AI-03-010
 * Khởi tạo mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mốc lưu ký ức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_initialize_memory_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_initialize_memory_checkpoint<T>(agentId, initialData, context);
}

/**
 * @id AI-03-011
 * Thu thập ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức dài hạn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_long_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_long_memory<T>(agentId, data, context);
}

/**
 * @id AI-03-012
 * Thu thập ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức sự kiện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_episodic_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_episodic_memory<T>(agentId, data, context);
}

/**
 * @id AI-03-013
 * Thu thập ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức kiến thức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_semantic_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_semantic_memory<T>(agentId, data, context);
}

/**
 * @id AI-03-014
 * Thu thập ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_procedural_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_procedural_memory<T>(agentId, data, context);
}

/**
 * @id AI-03-015
 * Thu thập ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến ký ức cá nhân từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_autobiographical_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_autobiographical_memory<T>(agentId, data, context);
}

/**
 * @id AI-03-016
 * Thu thập độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến độ mạnh ký ức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_memory_strength<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_memory_strength<T>(agentId, data, context);
}

/**
 * @id AI-03-017
 * Thu thập củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến củng cố ký ức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_memory_consolidation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_memory_consolidation<T>(agentId, data, context);
}

/**
 * @id AI-03-018
 * Thu thập kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến kho ký ức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_memory_archive<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_memory_archive<T>(agentId, data, context);
}

/**
 * @id AI-03-019
 * Thu thập dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến dữ kiện bền vững từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_persistent_fact<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_persistent_fact<T>(agentId, data, context);
}

/**
 * @id AI-03-020
 * Thu thập mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Thu thập dữ liệu liên quan đến mốc lưu ký ức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_capture_memory_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_capture_memory_checkpoint<T>(agentId, data, context);
}

/**
 * @id AI-03-021
 * Kiểm tra tính hợp lệ của ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức dài hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_long_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-022
 * Kiểm tra tính hợp lệ của ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_episodic_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-023
 * Kiểm tra tính hợp lệ của ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức kiến thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_semantic_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-024
 * Kiểm tra tính hợp lệ của ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_procedural_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-025
 * Kiểm tra tính hợp lệ của ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ký ức cá nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_autobiographical_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-026
 * Kiểm tra tính hợp lệ của độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ mạnh ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_memory_strength<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-027
 * Kiểm tra tính hợp lệ của củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của củng cố ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_memory_consolidation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-028
 * Kiểm tra tính hợp lệ của kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kho ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_memory_archive<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-029
 * Kiểm tra tính hợp lệ của dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dữ kiện bền vững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_persistent_fact<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-030
 * Kiểm tra tính hợp lệ của mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mốc lưu ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_validate_memory_checkpoint<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-03-031
 * Chuẩn hóa ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn ký ức dài hạn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_long_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-032
 * Chuẩn hóa ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn ký ức sự kiện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_episodic_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-033
 * Chuẩn hóa ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn ký ức kiến thức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_semantic_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-034
 * Chuẩn hóa ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn ký ức kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_procedural_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-035
 * Chuẩn hóa ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn ký ức cá nhân để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_autobiographical_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-036
 * Chuẩn hóa độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn độ mạnh ký ức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_memory_strength<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-037
 * Chuẩn hóa củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn củng cố ký ức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_memory_consolidation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-038
 * Chuẩn hóa kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn kho ký ức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_memory_archive<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-039
 * Chuẩn hóa dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn dữ kiện bền vững để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_persistent_fact<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-040
 * Chuẩn hóa mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuẩn hóa biểu diễn mốc lưu ký ức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_normalize_memory_checkpoint<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-03-041
 * Cập nhật ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật ký ức dài hạn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_long_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_long_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-03-042
 * Cập nhật ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật ký ức sự kiện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_episodic_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_episodic_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-03-043
 * Cập nhật ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật ký ức kiến thức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_semantic_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_semantic_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-03-044
 * Cập nhật ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật ký ức kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_procedural_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_procedural_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-03-045
 * Cập nhật ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật ký ức cá nhân dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_autobiographical_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_autobiographical_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-03-046
 * Cập nhật độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật độ mạnh ký ức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_memory_strength<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_memory_strength<T>(agentId, updateData, context);
}

/**
 * @id AI-03-047
 * Cập nhật củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật củng cố ký ức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_memory_consolidation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_memory_consolidation<T>(agentId, updateData, context);
}

/**
 * @id AI-03-048
 * Cập nhật kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật kho ký ức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_memory_archive<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_memory_archive<T>(agentId, updateData, context);
}

/**
 * @id AI-03-049
 * Cập nhật dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật dữ kiện bền vững dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_persistent_fact<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_persistent_fact<T>(agentId, updateData, context);
}

/**
 * @id AI-03-050
 * Cập nhật mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Cập nhật mốc lưu ký ức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_update_memory_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).ltm_update_memory_checkpoint<T>(agentId, updateData, context);
}

/**
 * @id AI-03-051
 * Đánh giá ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức dài hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_long_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-052
 * Đánh giá ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_episodic_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-053
 * Đánh giá ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức kiến thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_semantic_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-054
 * Đánh giá ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_procedural_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-055
 * Đánh giá ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ký ức cá nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_autobiographical_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-056
 * Đánh giá độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ mạnh ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_memory_strength<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-057
 * Đánh giá củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của củng cố ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_memory_consolidation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-058
 * Đánh giá kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kho ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_memory_archive<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-059
 * Đánh giá dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dữ kiện bền vững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_persistent_fact<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-060
 * Đánh giá mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mốc lưu ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_evaluate_memory_checkpoint<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-03-061
 * Truy xuất ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về ký ức dài hạn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_long_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_long_memory<T>(agentId, query);
}

/**
 * @id AI-03-062
 * Truy xuất ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về ký ức sự kiện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_episodic_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_episodic_memory<T>(agentId, query);
}

/**
 * @id AI-03-063
 * Truy xuất ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về ký ức kiến thức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_semantic_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_semantic_memory<T>(agentId, query);
}

/**
 * @id AI-03-064
 * Truy xuất ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về ký ức kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_procedural_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_procedural_memory<T>(agentId, query);
}

/**
 * @id AI-03-065
 * Truy xuất ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về ký ức cá nhân phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_autobiographical_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_autobiographical_memory<T>(agentId, query);
}

/**
 * @id AI-03-066
 * Truy xuất độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về độ mạnh ký ức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_memory_strength<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_memory_strength<T>(agentId, query);
}

/**
 * @id AI-03-067
 * Truy xuất củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về củng cố ký ức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_memory_consolidation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_memory_consolidation<T>(agentId, query);
}

/**
 * @id AI-03-068
 * Truy xuất kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về kho ký ức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_memory_archive<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_memory_archive<T>(agentId, query);
}

/**
 * @id AI-03-069
 * Truy xuất dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về dữ kiện bền vững phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_persistent_fact<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_persistent_fact<T>(agentId, query);
}

/**
 * @id AI-03-070
 * Truy xuất mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Tìm và trả về mốc lưu ký ức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_retrieve_memory_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCLongTermMemorySubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).ltm_retrieve_memory_checkpoint<T>(agentId, query);
}

/**
 * @id AI-03-071
 * Tuần tự hóa ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển ký ức dài hạn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_long_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-072
 * Tuần tự hóa ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển ký ức sự kiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_episodic_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-073
 * Tuần tự hóa ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển ký ức kiến thức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_semantic_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-074
 * Tuần tự hóa ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển ký ức kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_procedural_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-075
 * Tuần tự hóa ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển ký ức cá nhân sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_autobiographical_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-076
 * Tuần tự hóa độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển độ mạnh ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_memory_strength<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-077
 * Tuần tự hóa củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển củng cố ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_memory_consolidation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-078
 * Tuần tự hóa kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển kho ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_memory_archive<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-079
 * Tuần tự hóa dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển dữ kiện bền vững sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_persistent_fact<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-080
 * Tuần tự hóa mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Chuyển mốc lưu ký ức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_serialize_memory_checkpoint<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-03-081
 * So sánh ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức dài hạn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_long_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-082
 * So sánh ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức sự kiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_episodic_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-083
 * So sánh ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức kiến thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_semantic_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-084
 * So sánh ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_procedural_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-085
 * So sánh ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ký ức cá nhân.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_autobiographical_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-086
 * So sánh độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ mạnh ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_memory_strength<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-087
 * So sánh củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của củng cố ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_memory_consolidation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-088
 * So sánh kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kho ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_memory_archive<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-089
 * So sánh dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dữ kiện bền vững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_persistent_fact<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-090
 * So sánh mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mốc lưu ký ức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function ltm_compare_memory_checkpoint<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-03-091
 * Tinh gọn ký ức dài hạn trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức dài hạn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_long_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_long_memory(agentId, options);
}

/**
 * @id AI-03-092
 * Tinh gọn ký ức sự kiện trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức sự kiện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_episodic_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_episodic_memory(agentId, options);
}

/**
 * @id AI-03-093
 * Tinh gọn ký ức kiến thức trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức kiến thức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_semantic_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_semantic_memory(agentId, options);
}

/**
 * @id AI-03-094
 * Tinh gọn ký ức kỹ năng trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_procedural_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_procedural_memory(agentId, options);
}

/**
 * @id AI-03-095
 * Tinh gọn ký ức cá nhân trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần ký ức cá nhân lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_autobiographical_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_autobiographical_memory(agentId, options);
}

/**
 * @id AI-03-096
 * Tinh gọn độ mạnh ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần độ mạnh ký ức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_memory_strength(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_memory_strength(agentId, options);
}

/**
 * @id AI-03-097
 * Tinh gọn củng cố ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần củng cố ký ức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_memory_consolidation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_memory_consolidation(agentId, options);
}

/**
 * @id AI-03-098
 * Tinh gọn kho ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần kho ký ức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_memory_archive(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_memory_archive(agentId, options);
}

/**
 * @id AI-03-099
 * Tinh gọn dữ kiện bền vững trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần dữ kiện bền vững lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_persistent_fact(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_persistent_fact(agentId, options);
}

/**
 * @id AI-03-100
 * Tinh gọn mốc lưu ký ức trong module ghi nhớ dài hạn.
 * Mục đích: Loại bỏ hoặc gộp phần mốc lưu ký ức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function ltm_prune_memory_checkpoint(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCLongTermMemorySubsystem
): PruningResult {
  return (subsystem || getSubsystem()).ltm_prune_memory_checkpoint(agentId, options);
}

