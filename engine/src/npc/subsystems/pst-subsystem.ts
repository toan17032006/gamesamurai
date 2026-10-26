/**
 * @file pst-subsystem.ts
 * @module @aetheria/engine/npc
 * @description PST — Đồng bộ và lưu dữ liệu (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module PST.
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

export interface INPCPersistenceSubsystem {
  pst_initialize_agent_memory_blob<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_agent_snapshot<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_memory_schema<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_migration_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_saved_agent_data<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_corrupted_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_memory_storage<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_persistence_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_sync_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_initialize_save_transaction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_agent_memory_blob<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_agent_snapshot<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_memory_schema<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_migration_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_saved_agent_data<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_corrupted_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_memory_storage<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_persistence_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_sync_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_capture_save_transaction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  pst_validate_agent_memory_blob<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_agent_snapshot<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_memory_schema<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_migration_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_saved_agent_data<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_corrupted_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_memory_storage<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_persistence_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_sync_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_validate_save_transaction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  pst_normalize_agent_memory_blob<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_agent_snapshot<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_memory_schema<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_migration_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_saved_agent_data<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_corrupted_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_memory_storage<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_persistence_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_sync_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_normalize_save_transaction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  pst_update_agent_memory_blob<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_agent_snapshot<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_memory_schema<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_migration_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_saved_agent_data<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_corrupted_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_memory_storage<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_persistence_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_sync_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_update_save_transaction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  pst_evaluate_agent_memory_blob<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_agent_snapshot<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_memory_schema<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_migration_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_saved_agent_data<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_corrupted_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_memory_storage<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_persistence_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_sync_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_evaluate_save_transaction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  pst_retrieve_agent_memory_blob<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_agent_snapshot<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_memory_schema<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_migration_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_saved_agent_data<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_corrupted_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_memory_storage<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_persistence_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_sync_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_retrieve_save_transaction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  pst_serialize_agent_memory_blob<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_agent_snapshot<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_memory_schema<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_migration_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_saved_agent_data<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_corrupted_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_memory_storage<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_persistence_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_sync_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_serialize_save_transaction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  pst_compare_agent_memory_blob<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_agent_snapshot<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_memory_schema<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_migration_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_saved_agent_data<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_corrupted_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_memory_storage<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_persistence_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_sync_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_compare_save_transaction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  pst_prune_agent_memory_blob(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_agent_snapshot(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_memory_schema(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_migration_record(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_saved_agent_data(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_corrupted_memory(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_memory_storage(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_persistence_state(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_sync_checkpoint(agentId: string, options?: PruningOptions): PruningResult;
  pst_prune_save_transaction(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCPersistenceSubsystem extends NPCBaseSubsystem implements INPCPersistenceSubsystem {
  public readonly moduleCode = 'PST';
  public readonly moduleTitle = 'PST — Đồng bộ và lưu dữ liệu (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-23-001
   * Khởi tạo khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khối dữ liệu bộ nhớ NPC.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_agent_memory_blob<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'agent_memory_blob', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-002
   * Khởi tạo bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản chụp NPC.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_agent_snapshot<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'agent_snapshot', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-003
   * Khởi tạo lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lược đồ bộ nhớ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_memory_schema<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_schema', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-004
   * Khởi tạo bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi chuyển đổi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_migration_record<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'migration_record', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-005
   * Khởi tạo dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dữ liệu NPC đã lưu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_saved_agent_data<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'saved_agent_data', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-006
   * Khởi tạo bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bộ nhớ hỏng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_corrupted_memory<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'corrupted_memory', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-007
   * Khởi tạo kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kho bộ nhớ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_memory_storage<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_storage', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-008
   * Khởi tạo trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái lưu trữ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_persistence_state<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'persistence_state', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-009
   * Khởi tạo mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mốc đồng bộ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_sync_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sync_checkpoint', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-010
   * Khởi tạo giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giao dịch lưu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_initialize_save_transaction<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'save_transaction', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-23-011
   * Thu thập khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến khối dữ liệu bộ nhớ NPC từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_agent_memory_blob<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'agent_memory_blob', data, context);
  }

  /**
   * @id AI-23-012
   * Thu thập bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến bản chụp NPC từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_agent_snapshot<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'agent_snapshot', data, context);
  }

  /**
   * @id AI-23-013
   * Thu thập lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến lược đồ bộ nhớ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_memory_schema<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_schema', data, context);
  }

  /**
   * @id AI-23-014
   * Thu thập bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến bản ghi chuyển đổi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_migration_record<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'migration_record', data, context);
  }

  /**
   * @id AI-23-015
   * Thu thập dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến dữ liệu NPC đã lưu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_saved_agent_data<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'saved_agent_data', data, context);
  }

  /**
   * @id AI-23-016
   * Thu thập bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến bộ nhớ hỏng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_corrupted_memory<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'corrupted_memory', data, context);
  }

  /**
   * @id AI-23-017
   * Thu thập kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến kho bộ nhớ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_memory_storage<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'memory_storage', data, context);
  }

  /**
   * @id AI-23-018
   * Thu thập trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến trạng thái lưu trữ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_persistence_state<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'persistence_state', data, context);
  }

  /**
   * @id AI-23-019
   * Thu thập mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến mốc đồng bộ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_sync_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sync_checkpoint', data, context);
  }

  /**
   * @id AI-23-020
   * Thu thập giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Thu thập dữ liệu liên quan đến giao dịch lưu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_capture_save_transaction<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'save_transaction', data, context);
  }

  /**
   * @id AI-23-021
   * Kiểm tra tính hợp lệ của khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khối dữ liệu bộ nhớ NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_agent_memory_blob<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-022
   * Kiểm tra tính hợp lệ của bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản chụp NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_agent_snapshot<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-023
   * Kiểm tra tính hợp lệ của lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lược đồ bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_memory_schema<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-024
   * Kiểm tra tính hợp lệ của bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi chuyển đổi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_migration_record<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-025
   * Kiểm tra tính hợp lệ của dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dữ liệu NPC đã lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_saved_agent_data<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-026
   * Kiểm tra tính hợp lệ của bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bộ nhớ hỏng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_corrupted_memory<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-027
   * Kiểm tra tính hợp lệ của kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kho bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_memory_storage<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-028
   * Kiểm tra tính hợp lệ của trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái lưu trữ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_persistence_state<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-029
   * Kiểm tra tính hợp lệ của mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mốc đồng bộ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_sync_checkpoint<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-030
   * Kiểm tra tính hợp lệ của giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giao dịch lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_validate_save_transaction<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-23-031
   * Chuẩn hóa khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn khối dữ liệu bộ nhớ NPC để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_agent_memory_blob<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-032
   * Chuẩn hóa bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn bản chụp NPC để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_agent_snapshot<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-033
   * Chuẩn hóa lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn lược đồ bộ nhớ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_memory_schema<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-034
   * Chuẩn hóa bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn bản ghi chuyển đổi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_migration_record<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-035
   * Chuẩn hóa dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn dữ liệu NPC đã lưu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_saved_agent_data<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-036
   * Chuẩn hóa bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn bộ nhớ hỏng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_corrupted_memory<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-037
   * Chuẩn hóa kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn kho bộ nhớ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_memory_storage<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-038
   * Chuẩn hóa trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn trạng thái lưu trữ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_persistence_state<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-039
   * Chuẩn hóa mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn mốc đồng bộ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_sync_checkpoint<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-040
   * Chuẩn hóa giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuẩn hóa biểu diễn giao dịch lưu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_normalize_save_transaction<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-23-041
   * Cập nhật khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật khối dữ liệu bộ nhớ NPC dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_agent_memory_blob<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'agent_memory_blob', updateData, context);
  }

  /**
   * @id AI-23-042
   * Cập nhật bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật bản chụp NPC dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_agent_snapshot<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'agent_snapshot', updateData, context);
  }

  /**
   * @id AI-23-043
   * Cập nhật lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật lược đồ bộ nhớ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_memory_schema<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_schema', updateData, context);
  }

  /**
   * @id AI-23-044
   * Cập nhật bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật bản ghi chuyển đổi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_migration_record<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'migration_record', updateData, context);
  }

  /**
   * @id AI-23-045
   * Cập nhật dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật dữ liệu NPC đã lưu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_saved_agent_data<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'saved_agent_data', updateData, context);
  }

  /**
   * @id AI-23-046
   * Cập nhật bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật bộ nhớ hỏng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_corrupted_memory<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'corrupted_memory', updateData, context);
  }

  /**
   * @id AI-23-047
   * Cập nhật kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật kho bộ nhớ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_memory_storage<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'memory_storage', updateData, context);
  }

  /**
   * @id AI-23-048
   * Cập nhật trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật trạng thái lưu trữ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_persistence_state<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'persistence_state', updateData, context);
  }

  /**
   * @id AI-23-049
   * Cập nhật mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật mốc đồng bộ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_sync_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'sync_checkpoint', updateData, context);
  }

  /**
   * @id AI-23-050
   * Cập nhật giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Cập nhật giao dịch lưu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_update_save_transaction<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'save_transaction', updateData, context);
  }

  /**
   * @id AI-23-051
   * Đánh giá khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khối dữ liệu bộ nhớ NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_agent_memory_blob<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-052
   * Đánh giá bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản chụp NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_agent_snapshot<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-053
   * Đánh giá lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lược đồ bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_memory_schema<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-054
   * Đánh giá bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi chuyển đổi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_migration_record<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-055
   * Đánh giá dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dữ liệu NPC đã lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_saved_agent_data<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-056
   * Đánh giá bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bộ nhớ hỏng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_corrupted_memory<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-057
   * Đánh giá kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kho bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_memory_storage<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-058
   * Đánh giá trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái lưu trữ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_persistence_state<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-059
   * Đánh giá mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mốc đồng bộ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_sync_checkpoint<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-060
   * Đánh giá giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giao dịch lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_evaluate_save_transaction<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-23-061
   * Truy xuất khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về khối dữ liệu bộ nhớ NPC phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_agent_memory_blob<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'agent_memory_blob', query);
  }

  /**
   * @id AI-23-062
   * Truy xuất bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về bản chụp NPC phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_agent_snapshot<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'agent_snapshot', query);
  }

  /**
   * @id AI-23-063
   * Truy xuất lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về lược đồ bộ nhớ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_memory_schema<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_schema', query);
  }

  /**
   * @id AI-23-064
   * Truy xuất bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về bản ghi chuyển đổi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_migration_record<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'migration_record', query);
  }

  /**
   * @id AI-23-065
   * Truy xuất dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về dữ liệu NPC đã lưu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_saved_agent_data<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'saved_agent_data', query);
  }

  /**
   * @id AI-23-066
   * Truy xuất bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về bộ nhớ hỏng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_corrupted_memory<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'corrupted_memory', query);
  }

  /**
   * @id AI-23-067
   * Truy xuất kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về kho bộ nhớ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_memory_storage<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'memory_storage', query);
  }

  /**
   * @id AI-23-068
   * Truy xuất trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về trạng thái lưu trữ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_persistence_state<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'persistence_state', query);
  }

  /**
   * @id AI-23-069
   * Truy xuất mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về mốc đồng bộ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_sync_checkpoint<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'sync_checkpoint', query);
  }

  /**
   * @id AI-23-070
   * Truy xuất giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Tìm và trả về giao dịch lưu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_retrieve_save_transaction<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'save_transaction', query);
  }

  /**
   * @id AI-23-071
   * Tuần tự hóa khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển khối dữ liệu bộ nhớ NPC sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_agent_memory_blob<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-072
   * Tuần tự hóa bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển bản chụp NPC sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_agent_snapshot<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-073
   * Tuần tự hóa lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển lược đồ bộ nhớ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_memory_schema<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-074
   * Tuần tự hóa bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển bản ghi chuyển đổi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_migration_record<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-075
   * Tuần tự hóa dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển dữ liệu NPC đã lưu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_saved_agent_data<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-076
   * Tuần tự hóa bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển bộ nhớ hỏng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_corrupted_memory<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-077
   * Tuần tự hóa kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển kho bộ nhớ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_memory_storage<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-078
   * Tuần tự hóa trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển trạng thái lưu trữ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_persistence_state<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-079
   * Tuần tự hóa mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển mốc đồng bộ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_sync_checkpoint<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-080
   * Tuần tự hóa giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Chuyển giao dịch lưu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_serialize_save_transaction<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-23-081
   * So sánh khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của khối dữ liệu bộ nhớ NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_agent_memory_blob<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-082
   * So sánh bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bản chụp NPC.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_agent_snapshot<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-083
   * So sánh lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lược đồ bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_memory_schema<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-084
   * So sánh bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi chuyển đổi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_migration_record<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-085
   * So sánh dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dữ liệu NPC đã lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_saved_agent_data<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-086
   * So sánh bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bộ nhớ hỏng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_corrupted_memory<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-087
   * So sánh kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kho bộ nhớ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_memory_storage<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-088
   * So sánh trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái lưu trữ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_persistence_state<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-089
   * So sánh mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mốc đồng bộ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_sync_checkpoint<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-090
   * So sánh giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của giao dịch lưu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public pst_compare_save_transaction<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-23-091
   * Tinh gọn khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần khối dữ liệu bộ nhớ NPC lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_agent_memory_blob(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'agent_memory_blob', options);
  }

  /**
   * @id AI-23-092
   * Tinh gọn bản chụp NPC trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần bản chụp NPC lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_agent_snapshot(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'agent_snapshot', options);
  }

  /**
   * @id AI-23-093
   * Tinh gọn lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần lược đồ bộ nhớ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_memory_schema(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_schema', options);
  }

  /**
   * @id AI-23-094
   * Tinh gọn bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần bản ghi chuyển đổi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_migration_record(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'migration_record', options);
  }

  /**
   * @id AI-23-095
   * Tinh gọn dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần dữ liệu NPC đã lưu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_saved_agent_data(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'saved_agent_data', options);
  }

  /**
   * @id AI-23-096
   * Tinh gọn bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần bộ nhớ hỏng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_corrupted_memory(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'corrupted_memory', options);
  }

  /**
   * @id AI-23-097
   * Tinh gọn kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần kho bộ nhớ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_memory_storage(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'memory_storage', options);
  }

  /**
   * @id AI-23-098
   * Tinh gọn trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần trạng thái lưu trữ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_persistence_state(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'persistence_state', options);
  }

  /**
   * @id AI-23-099
   * Tinh gọn mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần mốc đồng bộ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_sync_checkpoint(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'sync_checkpoint', options);
  }

  /**
   * @id AI-23-100
   * Tinh gọn giao dịch lưu trong module đồng bộ và lưu dữ liệu.
   * Mục đích: Loại bỏ hoặc gộp phần giao dịch lưu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public pst_prune_save_transaction(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'save_transaction', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for PST)
// ============================================================================

let defaultSubsystem: NPCPersistenceSubsystem | null = null;
function getSubsystem(): NPCPersistenceSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCPersistenceSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-23-001
 * Khởi tạo khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khối dữ liệu bộ nhớ NPC.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_agent_memory_blob<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_agent_memory_blob<T>(agentId, initialData, context);
}

/**
 * @id AI-23-002
 * Khởi tạo bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản chụp NPC.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_agent_snapshot<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_agent_snapshot<T>(agentId, initialData, context);
}

/**
 * @id AI-23-003
 * Khởi tạo lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lược đồ bộ nhớ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_memory_schema<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_memory_schema<T>(agentId, initialData, context);
}

/**
 * @id AI-23-004
 * Khởi tạo bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi chuyển đổi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_migration_record<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_migration_record<T>(agentId, initialData, context);
}

/**
 * @id AI-23-005
 * Khởi tạo dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dữ liệu NPC đã lưu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_saved_agent_data<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_saved_agent_data<T>(agentId, initialData, context);
}

/**
 * @id AI-23-006
 * Khởi tạo bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bộ nhớ hỏng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_corrupted_memory<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_corrupted_memory<T>(agentId, initialData, context);
}

/**
 * @id AI-23-007
 * Khởi tạo kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kho bộ nhớ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_memory_storage<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_memory_storage<T>(agentId, initialData, context);
}

/**
 * @id AI-23-008
 * Khởi tạo trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái lưu trữ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_persistence_state<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_persistence_state<T>(agentId, initialData, context);
}

/**
 * @id AI-23-009
 * Khởi tạo mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mốc đồng bộ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_sync_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_sync_checkpoint<T>(agentId, initialData, context);
}

/**
 * @id AI-23-010
 * Khởi tạo giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giao dịch lưu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_initialize_save_transaction<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_initialize_save_transaction<T>(agentId, initialData, context);
}

/**
 * @id AI-23-011
 * Thu thập khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến khối dữ liệu bộ nhớ NPC từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_agent_memory_blob<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_agent_memory_blob<T>(agentId, data, context);
}

/**
 * @id AI-23-012
 * Thu thập bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến bản chụp NPC từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_agent_snapshot<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_agent_snapshot<T>(agentId, data, context);
}

/**
 * @id AI-23-013
 * Thu thập lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến lược đồ bộ nhớ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_memory_schema<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_memory_schema<T>(agentId, data, context);
}

/**
 * @id AI-23-014
 * Thu thập bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến bản ghi chuyển đổi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_migration_record<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_migration_record<T>(agentId, data, context);
}

/**
 * @id AI-23-015
 * Thu thập dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến dữ liệu NPC đã lưu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_saved_agent_data<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_saved_agent_data<T>(agentId, data, context);
}

/**
 * @id AI-23-016
 * Thu thập bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến bộ nhớ hỏng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_corrupted_memory<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_corrupted_memory<T>(agentId, data, context);
}

/**
 * @id AI-23-017
 * Thu thập kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến kho bộ nhớ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_memory_storage<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_memory_storage<T>(agentId, data, context);
}

/**
 * @id AI-23-018
 * Thu thập trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến trạng thái lưu trữ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_persistence_state<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_persistence_state<T>(agentId, data, context);
}

/**
 * @id AI-23-019
 * Thu thập mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến mốc đồng bộ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_sync_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_sync_checkpoint<T>(agentId, data, context);
}

/**
 * @id AI-23-020
 * Thu thập giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Thu thập dữ liệu liên quan đến giao dịch lưu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_capture_save_transaction<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_capture_save_transaction<T>(agentId, data, context);
}

/**
 * @id AI-23-021
 * Kiểm tra tính hợp lệ của khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khối dữ liệu bộ nhớ NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_agent_memory_blob<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-022
 * Kiểm tra tính hợp lệ của bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản chụp NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_agent_snapshot<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-023
 * Kiểm tra tính hợp lệ của lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lược đồ bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_memory_schema<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-024
 * Kiểm tra tính hợp lệ của bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi chuyển đổi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_migration_record<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-025
 * Kiểm tra tính hợp lệ của dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dữ liệu NPC đã lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_saved_agent_data<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-026
 * Kiểm tra tính hợp lệ của bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bộ nhớ hỏng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_corrupted_memory<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-027
 * Kiểm tra tính hợp lệ của kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kho bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_memory_storage<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-028
 * Kiểm tra tính hợp lệ của trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái lưu trữ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_persistence_state<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-029
 * Kiểm tra tính hợp lệ của mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mốc đồng bộ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_sync_checkpoint<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-030
 * Kiểm tra tính hợp lệ của giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giao dịch lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_validate_save_transaction<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-23-031
 * Chuẩn hóa khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn khối dữ liệu bộ nhớ NPC để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_agent_memory_blob<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-032
 * Chuẩn hóa bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn bản chụp NPC để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_agent_snapshot<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-033
 * Chuẩn hóa lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn lược đồ bộ nhớ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_memory_schema<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-034
 * Chuẩn hóa bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn bản ghi chuyển đổi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_migration_record<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-035
 * Chuẩn hóa dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn dữ liệu NPC đã lưu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_saved_agent_data<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-036
 * Chuẩn hóa bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn bộ nhớ hỏng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_corrupted_memory<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-037
 * Chuẩn hóa kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn kho bộ nhớ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_memory_storage<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-038
 * Chuẩn hóa trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn trạng thái lưu trữ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_persistence_state<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-039
 * Chuẩn hóa mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn mốc đồng bộ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_sync_checkpoint<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-040
 * Chuẩn hóa giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuẩn hóa biểu diễn giao dịch lưu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_normalize_save_transaction<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-23-041
 * Cập nhật khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật khối dữ liệu bộ nhớ NPC dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_agent_memory_blob<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_agent_memory_blob<T>(agentId, updateData, context);
}

/**
 * @id AI-23-042
 * Cập nhật bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật bản chụp NPC dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_agent_snapshot<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_agent_snapshot<T>(agentId, updateData, context);
}

/**
 * @id AI-23-043
 * Cập nhật lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật lược đồ bộ nhớ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_memory_schema<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_memory_schema<T>(agentId, updateData, context);
}

/**
 * @id AI-23-044
 * Cập nhật bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật bản ghi chuyển đổi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_migration_record<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_migration_record<T>(agentId, updateData, context);
}

/**
 * @id AI-23-045
 * Cập nhật dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật dữ liệu NPC đã lưu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_saved_agent_data<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_saved_agent_data<T>(agentId, updateData, context);
}

/**
 * @id AI-23-046
 * Cập nhật bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật bộ nhớ hỏng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_corrupted_memory<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_corrupted_memory<T>(agentId, updateData, context);
}

/**
 * @id AI-23-047
 * Cập nhật kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật kho bộ nhớ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_memory_storage<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_memory_storage<T>(agentId, updateData, context);
}

/**
 * @id AI-23-048
 * Cập nhật trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật trạng thái lưu trữ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_persistence_state<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_persistence_state<T>(agentId, updateData, context);
}

/**
 * @id AI-23-049
 * Cập nhật mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật mốc đồng bộ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_sync_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_sync_checkpoint<T>(agentId, updateData, context);
}

/**
 * @id AI-23-050
 * Cập nhật giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Cập nhật giao dịch lưu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_update_save_transaction<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).pst_update_save_transaction<T>(agentId, updateData, context);
}

/**
 * @id AI-23-051
 * Đánh giá khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khối dữ liệu bộ nhớ NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_agent_memory_blob<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-052
 * Đánh giá bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản chụp NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_agent_snapshot<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-053
 * Đánh giá lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lược đồ bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_memory_schema<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-054
 * Đánh giá bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi chuyển đổi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_migration_record<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-055
 * Đánh giá dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dữ liệu NPC đã lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_saved_agent_data<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-056
 * Đánh giá bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bộ nhớ hỏng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_corrupted_memory<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-057
 * Đánh giá kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kho bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_memory_storage<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-058
 * Đánh giá trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái lưu trữ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_persistence_state<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-059
 * Đánh giá mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mốc đồng bộ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_sync_checkpoint<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-060
 * Đánh giá giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giao dịch lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_evaluate_save_transaction<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-23-061
 * Truy xuất khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về khối dữ liệu bộ nhớ NPC phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_agent_memory_blob<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_agent_memory_blob<T>(agentId, query);
}

/**
 * @id AI-23-062
 * Truy xuất bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về bản chụp NPC phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_agent_snapshot<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_agent_snapshot<T>(agentId, query);
}

/**
 * @id AI-23-063
 * Truy xuất lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về lược đồ bộ nhớ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_memory_schema<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_memory_schema<T>(agentId, query);
}

/**
 * @id AI-23-064
 * Truy xuất bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về bản ghi chuyển đổi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_migration_record<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_migration_record<T>(agentId, query);
}

/**
 * @id AI-23-065
 * Truy xuất dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về dữ liệu NPC đã lưu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_saved_agent_data<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_saved_agent_data<T>(agentId, query);
}

/**
 * @id AI-23-066
 * Truy xuất bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về bộ nhớ hỏng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_corrupted_memory<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_corrupted_memory<T>(agentId, query);
}

/**
 * @id AI-23-067
 * Truy xuất kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về kho bộ nhớ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_memory_storage<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_memory_storage<T>(agentId, query);
}

/**
 * @id AI-23-068
 * Truy xuất trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về trạng thái lưu trữ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_persistence_state<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_persistence_state<T>(agentId, query);
}

/**
 * @id AI-23-069
 * Truy xuất mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về mốc đồng bộ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_sync_checkpoint<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_sync_checkpoint<T>(agentId, query);
}

/**
 * @id AI-23-070
 * Truy xuất giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Tìm và trả về giao dịch lưu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_retrieve_save_transaction<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPersistenceSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).pst_retrieve_save_transaction<T>(agentId, query);
}

/**
 * @id AI-23-071
 * Tuần tự hóa khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển khối dữ liệu bộ nhớ NPC sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_agent_memory_blob<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-072
 * Tuần tự hóa bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển bản chụp NPC sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_agent_snapshot<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-073
 * Tuần tự hóa lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển lược đồ bộ nhớ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_memory_schema<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-074
 * Tuần tự hóa bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển bản ghi chuyển đổi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_migration_record<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-075
 * Tuần tự hóa dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển dữ liệu NPC đã lưu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_saved_agent_data<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-076
 * Tuần tự hóa bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển bộ nhớ hỏng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_corrupted_memory<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-077
 * Tuần tự hóa kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển kho bộ nhớ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_memory_storage<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-078
 * Tuần tự hóa trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển trạng thái lưu trữ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_persistence_state<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-079
 * Tuần tự hóa mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển mốc đồng bộ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_sync_checkpoint<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-080
 * Tuần tự hóa giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Chuyển giao dịch lưu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_serialize_save_transaction<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-23-081
 * So sánh khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của khối dữ liệu bộ nhớ NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_agent_memory_blob<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-082
 * So sánh bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bản chụp NPC.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_agent_snapshot<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-083
 * So sánh lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lược đồ bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_memory_schema<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-084
 * So sánh bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi chuyển đổi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_migration_record<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-085
 * So sánh dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dữ liệu NPC đã lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_saved_agent_data<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-086
 * So sánh bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bộ nhớ hỏng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_corrupted_memory<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-087
 * So sánh kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kho bộ nhớ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_memory_storage<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-088
 * So sánh trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái lưu trữ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_persistence_state<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-089
 * So sánh mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mốc đồng bộ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_sync_checkpoint<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-090
 * So sánh giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của giao dịch lưu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function pst_compare_save_transaction<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-23-091
 * Tinh gọn khối dữ liệu bộ nhớ NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần khối dữ liệu bộ nhớ NPC lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_agent_memory_blob(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_agent_memory_blob(agentId, options);
}

/**
 * @id AI-23-092
 * Tinh gọn bản chụp NPC trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần bản chụp NPC lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_agent_snapshot(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_agent_snapshot(agentId, options);
}

/**
 * @id AI-23-093
 * Tinh gọn lược đồ bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần lược đồ bộ nhớ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_memory_schema(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_memory_schema(agentId, options);
}

/**
 * @id AI-23-094
 * Tinh gọn bản ghi chuyển đổi trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần bản ghi chuyển đổi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_migration_record(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_migration_record(agentId, options);
}

/**
 * @id AI-23-095
 * Tinh gọn dữ liệu NPC đã lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần dữ liệu NPC đã lưu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_saved_agent_data(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_saved_agent_data(agentId, options);
}

/**
 * @id AI-23-096
 * Tinh gọn bộ nhớ hỏng trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần bộ nhớ hỏng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_corrupted_memory(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_corrupted_memory(agentId, options);
}

/**
 * @id AI-23-097
 * Tinh gọn kho bộ nhớ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần kho bộ nhớ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_memory_storage(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_memory_storage(agentId, options);
}

/**
 * @id AI-23-098
 * Tinh gọn trạng thái lưu trữ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần trạng thái lưu trữ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_persistence_state(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_persistence_state(agentId, options);
}

/**
 * @id AI-23-099
 * Tinh gọn mốc đồng bộ trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần mốc đồng bộ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_sync_checkpoint(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_sync_checkpoint(agentId, options);
}

/**
 * @id AI-23-100
 * Tinh gọn giao dịch lưu trong module đồng bộ và lưu dữ liệu.
 * Mục đích: Loại bỏ hoặc gộp phần giao dịch lưu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function pst_prune_save_transaction(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPersistenceSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).pst_prune_save_transaction(agentId, options);
}

