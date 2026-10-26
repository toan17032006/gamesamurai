/**
 * @file skl-subsystem.ts
 * @module @aetheria/engine/npc
 * @description SKL — Kỹ năng và tiến bộ cá nhân (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module SKL.
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

export interface INPCSkillsSubsystem {
  skl_initialize_skill_profile<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_practice_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_skill_proficiency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_learning_rate<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_skill_plateau<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_practice_schedule<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_skill_transfer<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_skill_retention<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_unused_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_initialize_advanced_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_skill_profile<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_practice_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_skill_proficiency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_learning_rate<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_skill_plateau<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_practice_schedule<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_skill_transfer<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_skill_retention<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_unused_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_capture_advanced_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  skl_validate_skill_profile<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_practice_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_skill_proficiency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_learning_rate<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_skill_plateau<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_practice_schedule<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_skill_transfer<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_skill_retention<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_unused_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_validate_advanced_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  skl_normalize_skill_profile<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_practice_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_skill_proficiency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_learning_rate<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_skill_plateau<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_practice_schedule<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_skill_transfer<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_skill_retention<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_unused_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_normalize_advanced_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  skl_update_skill_profile<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_practice_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_skill_proficiency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_learning_rate<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_skill_plateau<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_practice_schedule<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_skill_transfer<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_skill_retention<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_unused_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_update_advanced_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  skl_evaluate_skill_profile<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_practice_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_skill_proficiency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_learning_rate<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_skill_plateau<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_practice_schedule<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_skill_transfer<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_skill_retention<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_unused_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_evaluate_advanced_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  skl_retrieve_skill_profile<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_practice_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_skill_proficiency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_learning_rate<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_skill_plateau<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_practice_schedule<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_skill_transfer<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_skill_retention<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_unused_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_retrieve_advanced_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  skl_serialize_skill_profile<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_practice_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_skill_proficiency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_learning_rate<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_skill_plateau<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_practice_schedule<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_skill_transfer<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_skill_retention<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_unused_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_serialize_advanced_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  skl_compare_skill_profile<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_practice_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_skill_proficiency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_learning_rate<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_skill_plateau<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_practice_schedule<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_skill_transfer<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_skill_retention<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_unused_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_compare_advanced_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  skl_prune_skill_profile(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_practice_record(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_skill_proficiency(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_learning_rate(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_skill_plateau(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_practice_schedule(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_skill_transfer(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_skill_retention(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_unused_skill(agentId: string, options?: PruningOptions): PruningResult;
  skl_prune_advanced_skill(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCSkillsSubsystem extends NPCBaseSubsystem implements INPCSkillsSubsystem {
  public readonly moduleCode = 'SKL';
  public readonly moduleTitle = 'SKL — Kỹ năng và tiến bộ cá nhân (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-17-001
   * Khởi tạo hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hồ sơ kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_skill_profile<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_profile', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-002
   * Khởi tạo bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi luyện tập.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_practice_record<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'practice_record', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-003
   * Khởi tạo độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ thành thạo.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_skill_proficiency<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_proficiency', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-004
   * Khởi tạo tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tốc độ học kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_learning_rate<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_rate', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-005
   * Khởi tạo giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giai đoạn chững.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_skill_plateau<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_plateau', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-006
   * Khởi tạo lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lịch luyện tập.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_practice_schedule<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'practice_schedule', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-007
   * Khởi tạo chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chuyển giao kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_skill_transfer<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_transfer', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-008
   * Khởi tạo khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khả năng duy trì kỹ năng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_skill_retention<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_retention', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-009
   * Khởi tạo kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng ít dùng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_unused_skill<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'unused_skill', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-010
   * Khởi tạo kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng nâng cao.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_initialize_advanced_skill<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'advanced_skill', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-17-011
   * Thu thập hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến hồ sơ kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_skill_profile<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_profile', data, context);
  }

  /**
   * @id AI-17-012
   * Thu thập bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến bản ghi luyện tập từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_practice_record<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'practice_record', data, context);
  }

  /**
   * @id AI-17-013
   * Thu thập độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến độ thành thạo từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_skill_proficiency<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_proficiency', data, context);
  }

  /**
   * @id AI-17-014
   * Thu thập tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến tốc độ học kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_learning_rate<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_rate', data, context);
  }

  /**
   * @id AI-17-015
   * Thu thập giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến giai đoạn chững từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_skill_plateau<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_plateau', data, context);
  }

  /**
   * @id AI-17-016
   * Thu thập lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến lịch luyện tập từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_practice_schedule<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'practice_schedule', data, context);
  }

  /**
   * @id AI-17-017
   * Thu thập chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến chuyển giao kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_skill_transfer<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_transfer', data, context);
  }

  /**
   * @id AI-17-018
   * Thu thập khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến khả năng duy trì kỹ năng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_skill_retention<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'skill_retention', data, context);
  }

  /**
   * @id AI-17-019
   * Thu thập kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng ít dùng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_unused_skill<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'unused_skill', data, context);
  }

  /**
   * @id AI-17-020
   * Thu thập kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng nâng cao từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_capture_advanced_skill<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'advanced_skill', data, context);
  }

  /**
   * @id AI-17-021
   * Kiểm tra tính hợp lệ của hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hồ sơ kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_skill_profile<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-022
   * Kiểm tra tính hợp lệ của bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_practice_record<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-023
   * Kiểm tra tính hợp lệ của độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ thành thạo.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_skill_proficiency<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-024
   * Kiểm tra tính hợp lệ của tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tốc độ học kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_learning_rate<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-025
   * Kiểm tra tính hợp lệ của giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giai đoạn chững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_skill_plateau<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-026
   * Kiểm tra tính hợp lệ của lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lịch luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_practice_schedule<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-027
   * Kiểm tra tính hợp lệ của chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chuyển giao kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_skill_transfer<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-028
   * Kiểm tra tính hợp lệ của khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khả năng duy trì kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_skill_retention<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-029
   * Kiểm tra tính hợp lệ của kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng ít dùng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_unused_skill<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-030
   * Kiểm tra tính hợp lệ của kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng nâng cao.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_validate_advanced_skill<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-17-031
   * Chuẩn hóa hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn hồ sơ kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_skill_profile<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-032
   * Chuẩn hóa bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn bản ghi luyện tập để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_practice_record<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-033
   * Chuẩn hóa độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn độ thành thạo để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_skill_proficiency<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-034
   * Chuẩn hóa tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn tốc độ học kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_learning_rate<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-035
   * Chuẩn hóa giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn giai đoạn chững để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_skill_plateau<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-036
   * Chuẩn hóa lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn lịch luyện tập để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_practice_schedule<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-037
   * Chuẩn hóa chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn chuyển giao kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_skill_transfer<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-038
   * Chuẩn hóa khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn khả năng duy trì kỹ năng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_skill_retention<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-039
   * Chuẩn hóa kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn kỹ năng ít dùng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_unused_skill<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-040
   * Chuẩn hóa kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuẩn hóa biểu diễn kỹ năng nâng cao để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_normalize_advanced_skill<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-17-041
   * Cập nhật hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật hồ sơ kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_skill_profile<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_profile', updateData, context);
  }

  /**
   * @id AI-17-042
   * Cập nhật bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật bản ghi luyện tập dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_practice_record<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'practice_record', updateData, context);
  }

  /**
   * @id AI-17-043
   * Cập nhật độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật độ thành thạo dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_skill_proficiency<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_proficiency', updateData, context);
  }

  /**
   * @id AI-17-044
   * Cập nhật tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật tốc độ học kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_learning_rate<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'learning_rate', updateData, context);
  }

  /**
   * @id AI-17-045
   * Cập nhật giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật giai đoạn chững dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_skill_plateau<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_plateau', updateData, context);
  }

  /**
   * @id AI-17-046
   * Cập nhật lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật lịch luyện tập dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_practice_schedule<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'practice_schedule', updateData, context);
  }

  /**
   * @id AI-17-047
   * Cập nhật chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật chuyển giao kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_skill_transfer<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_transfer', updateData, context);
  }

  /**
   * @id AI-17-048
   * Cập nhật khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật khả năng duy trì kỹ năng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_skill_retention<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'skill_retention', updateData, context);
  }

  /**
   * @id AI-17-049
   * Cập nhật kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật kỹ năng ít dùng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_unused_skill<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'unused_skill', updateData, context);
  }

  /**
   * @id AI-17-050
   * Cập nhật kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Cập nhật kỹ năng nâng cao dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_update_advanced_skill<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'advanced_skill', updateData, context);
  }

  /**
   * @id AI-17-051
   * Đánh giá hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hồ sơ kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_skill_profile<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-052
   * Đánh giá bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_practice_record<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-053
   * Đánh giá độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ thành thạo.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_skill_proficiency<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-054
   * Đánh giá tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tốc độ học kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_learning_rate<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-055
   * Đánh giá giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giai đoạn chững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_skill_plateau<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-056
   * Đánh giá lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lịch luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_practice_schedule<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-057
   * Đánh giá chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chuyển giao kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_skill_transfer<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-058
   * Đánh giá khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khả năng duy trì kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_skill_retention<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-059
   * Đánh giá kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng ít dùng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_unused_skill<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-060
   * Đánh giá kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng nâng cao.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_evaluate_advanced_skill<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-17-061
   * Truy xuất hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về hồ sơ kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_skill_profile<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_profile', query);
  }

  /**
   * @id AI-17-062
   * Truy xuất bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về bản ghi luyện tập phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_practice_record<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'practice_record', query);
  }

  /**
   * @id AI-17-063
   * Truy xuất độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về độ thành thạo phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_skill_proficiency<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_proficiency', query);
  }

  /**
   * @id AI-17-064
   * Truy xuất tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về tốc độ học kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_learning_rate<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'learning_rate', query);
  }

  /**
   * @id AI-17-065
   * Truy xuất giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về giai đoạn chững phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_skill_plateau<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_plateau', query);
  }

  /**
   * @id AI-17-066
   * Truy xuất lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về lịch luyện tập phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_practice_schedule<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'practice_schedule', query);
  }

  /**
   * @id AI-17-067
   * Truy xuất chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về chuyển giao kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_skill_transfer<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_transfer', query);
  }

  /**
   * @id AI-17-068
   * Truy xuất khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về khả năng duy trì kỹ năng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_skill_retention<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'skill_retention', query);
  }

  /**
   * @id AI-17-069
   * Truy xuất kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về kỹ năng ít dùng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_unused_skill<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'unused_skill', query);
  }

  /**
   * @id AI-17-070
   * Truy xuất kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Tìm và trả về kỹ năng nâng cao phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_retrieve_advanced_skill<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'advanced_skill', query);
  }

  /**
   * @id AI-17-071
   * Tuần tự hóa hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển hồ sơ kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_skill_profile<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-072
   * Tuần tự hóa bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển bản ghi luyện tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_practice_record<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-073
   * Tuần tự hóa độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển độ thành thạo sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_skill_proficiency<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-074
   * Tuần tự hóa tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển tốc độ học kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_learning_rate<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-075
   * Tuần tự hóa giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển giai đoạn chững sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_skill_plateau<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-076
   * Tuần tự hóa lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển lịch luyện tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_practice_schedule<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-077
   * Tuần tự hóa chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển chuyển giao kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_skill_transfer<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-078
   * Tuần tự hóa khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển khả năng duy trì kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_skill_retention<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-079
   * Tuần tự hóa kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển kỹ năng ít dùng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_unused_skill<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-080
   * Tuần tự hóa kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Chuyển kỹ năng nâng cao sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_serialize_advanced_skill<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-17-081
   * So sánh hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hồ sơ kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_skill_profile<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-082
   * So sánh bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_practice_record<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-083
   * So sánh độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ thành thạo.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_skill_proficiency<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-084
   * So sánh tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tốc độ học kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_learning_rate<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-085
   * So sánh giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của giai đoạn chững.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_skill_plateau<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-086
   * So sánh lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lịch luyện tập.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_practice_schedule<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-087
   * So sánh chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chuyển giao kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_skill_transfer<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-088
   * So sánh khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của khả năng duy trì kỹ năng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_skill_retention<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-089
   * So sánh kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng ít dùng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_unused_skill<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-090
   * So sánh kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng nâng cao.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public skl_compare_advanced_skill<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-17-091
   * Tinh gọn hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần hồ sơ kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_skill_profile(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_profile', options);
  }

  /**
   * @id AI-17-092
   * Tinh gọn bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần bản ghi luyện tập lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_practice_record(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'practice_record', options);
  }

  /**
   * @id AI-17-093
   * Tinh gọn độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần độ thành thạo lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_skill_proficiency(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_proficiency', options);
  }

  /**
   * @id AI-17-094
   * Tinh gọn tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần tốc độ học kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_learning_rate(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'learning_rate', options);
  }

  /**
   * @id AI-17-095
   * Tinh gọn giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần giai đoạn chững lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_skill_plateau(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_plateau', options);
  }

  /**
   * @id AI-17-096
   * Tinh gọn lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần lịch luyện tập lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_practice_schedule(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'practice_schedule', options);
  }

  /**
   * @id AI-17-097
   * Tinh gọn chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần chuyển giao kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_skill_transfer(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_transfer', options);
  }

  /**
   * @id AI-17-098
   * Tinh gọn khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần khả năng duy trì kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_skill_retention(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'skill_retention', options);
  }

  /**
   * @id AI-17-099
   * Tinh gọn kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần kỹ năng ít dùng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_unused_skill(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'unused_skill', options);
  }

  /**
   * @id AI-17-100
   * Tinh gọn kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
   * Mục đích: Loại bỏ hoặc gộp phần kỹ năng nâng cao lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public skl_prune_advanced_skill(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'advanced_skill', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for SKL)
// ============================================================================

let defaultSubsystem: NPCSkillsSubsystem | null = null;
function getSubsystem(): NPCSkillsSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCSkillsSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-17-001
 * Khởi tạo hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hồ sơ kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_skill_profile<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_skill_profile<T>(agentId, initialData, context);
}

/**
 * @id AI-17-002
 * Khởi tạo bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho bản ghi luyện tập.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_practice_record<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_practice_record<T>(agentId, initialData, context);
}

/**
 * @id AI-17-003
 * Khởi tạo độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ thành thạo.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_skill_proficiency<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_skill_proficiency<T>(agentId, initialData, context);
}

/**
 * @id AI-17-004
 * Khởi tạo tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tốc độ học kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_learning_rate<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_learning_rate<T>(agentId, initialData, context);
}

/**
 * @id AI-17-005
 * Khởi tạo giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giai đoạn chững.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_skill_plateau<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_skill_plateau<T>(agentId, initialData, context);
}

/**
 * @id AI-17-006
 * Khởi tạo lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lịch luyện tập.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_practice_schedule<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_practice_schedule<T>(agentId, initialData, context);
}

/**
 * @id AI-17-007
 * Khởi tạo chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chuyển giao kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_skill_transfer<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_skill_transfer<T>(agentId, initialData, context);
}

/**
 * @id AI-17-008
 * Khởi tạo khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khả năng duy trì kỹ năng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_skill_retention<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_skill_retention<T>(agentId, initialData, context);
}

/**
 * @id AI-17-009
 * Khởi tạo kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng ít dùng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_unused_skill<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_unused_skill<T>(agentId, initialData, context);
}

/**
 * @id AI-17-010
 * Khởi tạo kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng nâng cao.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_initialize_advanced_skill<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_initialize_advanced_skill<T>(agentId, initialData, context);
}

/**
 * @id AI-17-011
 * Thu thập hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến hồ sơ kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_skill_profile<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_skill_profile<T>(agentId, data, context);
}

/**
 * @id AI-17-012
 * Thu thập bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến bản ghi luyện tập từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_practice_record<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_practice_record<T>(agentId, data, context);
}

/**
 * @id AI-17-013
 * Thu thập độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến độ thành thạo từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_skill_proficiency<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_skill_proficiency<T>(agentId, data, context);
}

/**
 * @id AI-17-014
 * Thu thập tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến tốc độ học kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_learning_rate<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_learning_rate<T>(agentId, data, context);
}

/**
 * @id AI-17-015
 * Thu thập giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến giai đoạn chững từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_skill_plateau<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_skill_plateau<T>(agentId, data, context);
}

/**
 * @id AI-17-016
 * Thu thập lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến lịch luyện tập từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_practice_schedule<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_practice_schedule<T>(agentId, data, context);
}

/**
 * @id AI-17-017
 * Thu thập chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến chuyển giao kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_skill_transfer<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_skill_transfer<T>(agentId, data, context);
}

/**
 * @id AI-17-018
 * Thu thập khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến khả năng duy trì kỹ năng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_skill_retention<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_skill_retention<T>(agentId, data, context);
}

/**
 * @id AI-17-019
 * Thu thập kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng ít dùng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_unused_skill<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_unused_skill<T>(agentId, data, context);
}

/**
 * @id AI-17-020
 * Thu thập kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng nâng cao từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_capture_advanced_skill<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_capture_advanced_skill<T>(agentId, data, context);
}

/**
 * @id AI-17-021
 * Kiểm tra tính hợp lệ của hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hồ sơ kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_skill_profile<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-022
 * Kiểm tra tính hợp lệ của bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của bản ghi luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_practice_record<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-023
 * Kiểm tra tính hợp lệ của độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ thành thạo.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_skill_proficiency<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-024
 * Kiểm tra tính hợp lệ của tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tốc độ học kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_learning_rate<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-025
 * Kiểm tra tính hợp lệ của giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giai đoạn chững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_skill_plateau<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-026
 * Kiểm tra tính hợp lệ của lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lịch luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_practice_schedule<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-027
 * Kiểm tra tính hợp lệ của chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chuyển giao kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_skill_transfer<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-028
 * Kiểm tra tính hợp lệ của khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khả năng duy trì kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_skill_retention<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-029
 * Kiểm tra tính hợp lệ của kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng ít dùng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_unused_skill<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-030
 * Kiểm tra tính hợp lệ của kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng nâng cao.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_validate_advanced_skill<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-17-031
 * Chuẩn hóa hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn hồ sơ kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_skill_profile<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-032
 * Chuẩn hóa bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn bản ghi luyện tập để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_practice_record<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-033
 * Chuẩn hóa độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn độ thành thạo để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_skill_proficiency<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-034
 * Chuẩn hóa tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn tốc độ học kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_learning_rate<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-035
 * Chuẩn hóa giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn giai đoạn chững để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_skill_plateau<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-036
 * Chuẩn hóa lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn lịch luyện tập để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_practice_schedule<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-037
 * Chuẩn hóa chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn chuyển giao kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_skill_transfer<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-038
 * Chuẩn hóa khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn khả năng duy trì kỹ năng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_skill_retention<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-039
 * Chuẩn hóa kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn kỹ năng ít dùng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_unused_skill<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-040
 * Chuẩn hóa kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuẩn hóa biểu diễn kỹ năng nâng cao để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_normalize_advanced_skill<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-17-041
 * Cập nhật hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật hồ sơ kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_skill_profile<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_skill_profile<T>(agentId, updateData, context);
}

/**
 * @id AI-17-042
 * Cập nhật bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật bản ghi luyện tập dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_practice_record<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_practice_record<T>(agentId, updateData, context);
}

/**
 * @id AI-17-043
 * Cập nhật độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật độ thành thạo dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_skill_proficiency<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_skill_proficiency<T>(agentId, updateData, context);
}

/**
 * @id AI-17-044
 * Cập nhật tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật tốc độ học kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_learning_rate<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_learning_rate<T>(agentId, updateData, context);
}

/**
 * @id AI-17-045
 * Cập nhật giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật giai đoạn chững dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_skill_plateau<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_skill_plateau<T>(agentId, updateData, context);
}

/**
 * @id AI-17-046
 * Cập nhật lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật lịch luyện tập dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_practice_schedule<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_practice_schedule<T>(agentId, updateData, context);
}

/**
 * @id AI-17-047
 * Cập nhật chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật chuyển giao kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_skill_transfer<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_skill_transfer<T>(agentId, updateData, context);
}

/**
 * @id AI-17-048
 * Cập nhật khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật khả năng duy trì kỹ năng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_skill_retention<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_skill_retention<T>(agentId, updateData, context);
}

/**
 * @id AI-17-049
 * Cập nhật kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật kỹ năng ít dùng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_unused_skill<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_unused_skill<T>(agentId, updateData, context);
}

/**
 * @id AI-17-050
 * Cập nhật kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Cập nhật kỹ năng nâng cao dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_update_advanced_skill<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).skl_update_advanced_skill<T>(agentId, updateData, context);
}

/**
 * @id AI-17-051
 * Đánh giá hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hồ sơ kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_skill_profile<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-052
 * Đánh giá bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của bản ghi luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_practice_record<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-053
 * Đánh giá độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ thành thạo.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_skill_proficiency<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-054
 * Đánh giá tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tốc độ học kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_learning_rate<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-055
 * Đánh giá giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giai đoạn chững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_skill_plateau<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-056
 * Đánh giá lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lịch luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_practice_schedule<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-057
 * Đánh giá chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chuyển giao kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_skill_transfer<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-058
 * Đánh giá khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khả năng duy trì kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_skill_retention<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-059
 * Đánh giá kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng ít dùng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_unused_skill<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-060
 * Đánh giá kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng nâng cao.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_evaluate_advanced_skill<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-17-061
 * Truy xuất hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về hồ sơ kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_skill_profile<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_skill_profile<T>(agentId, query);
}

/**
 * @id AI-17-062
 * Truy xuất bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về bản ghi luyện tập phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_practice_record<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_practice_record<T>(agentId, query);
}

/**
 * @id AI-17-063
 * Truy xuất độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về độ thành thạo phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_skill_proficiency<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_skill_proficiency<T>(agentId, query);
}

/**
 * @id AI-17-064
 * Truy xuất tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về tốc độ học kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_learning_rate<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_learning_rate<T>(agentId, query);
}

/**
 * @id AI-17-065
 * Truy xuất giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về giai đoạn chững phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_skill_plateau<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_skill_plateau<T>(agentId, query);
}

/**
 * @id AI-17-066
 * Truy xuất lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về lịch luyện tập phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_practice_schedule<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_practice_schedule<T>(agentId, query);
}

/**
 * @id AI-17-067
 * Truy xuất chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về chuyển giao kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_skill_transfer<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_skill_transfer<T>(agentId, query);
}

/**
 * @id AI-17-068
 * Truy xuất khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về khả năng duy trì kỹ năng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_skill_retention<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_skill_retention<T>(agentId, query);
}

/**
 * @id AI-17-069
 * Truy xuất kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về kỹ năng ít dùng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_unused_skill<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_unused_skill<T>(agentId, query);
}

/**
 * @id AI-17-070
 * Truy xuất kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Tìm và trả về kỹ năng nâng cao phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_retrieve_advanced_skill<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSkillsSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).skl_retrieve_advanced_skill<T>(agentId, query);
}

/**
 * @id AI-17-071
 * Tuần tự hóa hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển hồ sơ kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_skill_profile<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-072
 * Tuần tự hóa bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển bản ghi luyện tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_practice_record<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-073
 * Tuần tự hóa độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển độ thành thạo sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_skill_proficiency<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-074
 * Tuần tự hóa tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển tốc độ học kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_learning_rate<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-075
 * Tuần tự hóa giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển giai đoạn chững sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_skill_plateau<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-076
 * Tuần tự hóa lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển lịch luyện tập sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_practice_schedule<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-077
 * Tuần tự hóa chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển chuyển giao kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_skill_transfer<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-078
 * Tuần tự hóa khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển khả năng duy trì kỹ năng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_skill_retention<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-079
 * Tuần tự hóa kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển kỹ năng ít dùng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_unused_skill<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-080
 * Tuần tự hóa kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Chuyển kỹ năng nâng cao sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_serialize_advanced_skill<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-17-081
 * So sánh hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hồ sơ kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_skill_profile<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-082
 * So sánh bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của bản ghi luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_practice_record<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-083
 * So sánh độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ thành thạo.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_skill_proficiency<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-084
 * So sánh tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tốc độ học kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_learning_rate<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-085
 * So sánh giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của giai đoạn chững.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_skill_plateau<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-086
 * So sánh lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lịch luyện tập.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_practice_schedule<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-087
 * So sánh chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chuyển giao kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_skill_transfer<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-088
 * So sánh khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của khả năng duy trì kỹ năng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_skill_retention<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-089
 * So sánh kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng ít dùng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_unused_skill<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-090
 * So sánh kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng nâng cao.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function skl_compare_advanced_skill<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-17-091
 * Tinh gọn hồ sơ kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần hồ sơ kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_skill_profile(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_skill_profile(agentId, options);
}

/**
 * @id AI-17-092
 * Tinh gọn bản ghi luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần bản ghi luyện tập lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_practice_record(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_practice_record(agentId, options);
}

/**
 * @id AI-17-093
 * Tinh gọn độ thành thạo trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần độ thành thạo lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_skill_proficiency(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_skill_proficiency(agentId, options);
}

/**
 * @id AI-17-094
 * Tinh gọn tốc độ học kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần tốc độ học kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_learning_rate(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_learning_rate(agentId, options);
}

/**
 * @id AI-17-095
 * Tinh gọn giai đoạn chững trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần giai đoạn chững lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_skill_plateau(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_skill_plateau(agentId, options);
}

/**
 * @id AI-17-096
 * Tinh gọn lịch luyện tập trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần lịch luyện tập lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_practice_schedule(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_practice_schedule(agentId, options);
}

/**
 * @id AI-17-097
 * Tinh gọn chuyển giao kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần chuyển giao kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_skill_transfer(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_skill_transfer(agentId, options);
}

/**
 * @id AI-17-098
 * Tinh gọn khả năng duy trì kỹ năng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần khả năng duy trì kỹ năng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_skill_retention(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_skill_retention(agentId, options);
}

/**
 * @id AI-17-099
 * Tinh gọn kỹ năng ít dùng trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần kỹ năng ít dùng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_unused_skill(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_unused_skill(agentId, options);
}

/**
 * @id AI-17-100
 * Tinh gọn kỹ năng nâng cao trong module kỹ năng và tiến bộ cá nhân.
 * Mục đích: Loại bỏ hoặc gộp phần kỹ năng nâng cao lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function skl_prune_advanced_skill(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSkillsSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).skl_prune_advanced_skill(agentId, options);
}

