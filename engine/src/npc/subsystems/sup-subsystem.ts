/**
 * @file sup-subsystem.ts
 * @module @aetheria/engine/npc
 * @description SUP — Học có giám sát (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module SUP.
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

export interface INPCSupervisedLearningSubsystem {
  sup_initialize_training_example<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_training_label<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_feature_vector<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_prediction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_prediction_error<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_validation_sample<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_training_batch<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_class_probability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_model_parameter<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_initialize_training_metric<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_training_example<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_training_label<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_feature_vector<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_prediction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_prediction_error<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_validation_sample<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_training_batch<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_class_probability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_model_parameter<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_capture_training_metric<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  sup_validate_training_example<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_training_label<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_feature_vector<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_prediction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_prediction_error<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_validation_sample<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_training_batch<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_class_probability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_model_parameter<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_validate_training_metric<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  sup_normalize_training_example<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_training_label<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_feature_vector<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_prediction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_prediction_error<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_validation_sample<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_training_batch<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_class_probability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_model_parameter<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_normalize_training_metric<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  sup_update_training_example<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_training_label<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_feature_vector<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_prediction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_prediction_error<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_validation_sample<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_training_batch<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_class_probability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_model_parameter<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_update_training_metric<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  sup_evaluate_training_example<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_training_label<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_feature_vector<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_prediction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_prediction_error<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_validation_sample<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_training_batch<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_class_probability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_model_parameter<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_evaluate_training_metric<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  sup_retrieve_training_example<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_training_label<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_feature_vector<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_prediction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_prediction_error<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_validation_sample<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_training_batch<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_class_probability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_model_parameter<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_retrieve_training_metric<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  sup_serialize_training_example<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_training_label<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_feature_vector<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_prediction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_prediction_error<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_validation_sample<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_training_batch<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_class_probability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_model_parameter<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_serialize_training_metric<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  sup_compare_training_example<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_training_label<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_feature_vector<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_prediction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_prediction_error<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_validation_sample<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_training_batch<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_class_probability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_model_parameter<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_compare_training_metric<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  sup_prune_training_example(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_training_label(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_feature_vector(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_prediction(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_prediction_error(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_validation_sample(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_training_batch(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_class_probability(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_model_parameter(agentId: string, options?: PruningOptions): PruningResult;
  sup_prune_training_metric(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCSupervisedLearningSubsystem extends NPCBaseSubsystem implements INPCSupervisedLearningSubsystem {
  public readonly moduleCode = 'SUP';
  public readonly moduleTitle = 'SUP — Học có giám sát (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-08-001
   * Khởi tạo mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu huấn luyện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_training_example<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_example', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-002
   * Khởi tạo nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho nhãn huấn luyện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_training_label<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_label', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-003
   * Khởi tạo vector đặc trưng trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vector đặc trưng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_feature_vector<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature_vector', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-004
   * Khởi tạo dự đoán trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dự đoán.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_prediction<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-005
   * Khởi tạo sai số dự đoán trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_error', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-006
   * Khởi tạo mẫu xác thực trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu xác thực.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_validation_sample<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'validation_sample', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-007
   * Khởi tạo lô huấn luyện trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lô huấn luyện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_training_batch<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_batch', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-008
   * Khởi tạo xác suất lớp trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xác suất lớp.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_class_probability<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'class_probability', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-009
   * Khởi tạo tham số mô hình trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tham số mô hình.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_model_parameter<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'model_parameter', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-010
   * Khởi tạo chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số huấn luyện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_initialize_training_metric<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_metric', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-08-011
   * Thu thập mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu huấn luyện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_training_example<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_example', data, context);
  }

  /**
   * @id AI-08-012
   * Thu thập nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến nhãn huấn luyện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_training_label<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_label', data, context);
  }

  /**
   * @id AI-08-013
   * Thu thập vector đặc trưng trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến vector đặc trưng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_feature_vector<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature_vector', data, context);
  }

  /**
   * @id AI-08-014
   * Thu thập dự đoán trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến dự đoán từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_prediction<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction', data, context);
  }

  /**
   * @id AI-08-015
   * Thu thập sai số dự đoán trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'prediction_error', data, context);
  }

  /**
   * @id AI-08-016
   * Thu thập mẫu xác thực trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu xác thực từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_validation_sample<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'validation_sample', data, context);
  }

  /**
   * @id AI-08-017
   * Thu thập lô huấn luyện trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến lô huấn luyện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_training_batch<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_batch', data, context);
  }

  /**
   * @id AI-08-018
   * Thu thập xác suất lớp trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến xác suất lớp từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_class_probability<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'class_probability', data, context);
  }

  /**
   * @id AI-08-019
   * Thu thập tham số mô hình trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến tham số mô hình từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_model_parameter<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'model_parameter', data, context);
  }

  /**
   * @id AI-08-020
   * Thu thập chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Thu thập dữ liệu liên quan đến chỉ số huấn luyện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_capture_training_metric<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'training_metric', data, context);
  }

  /**
   * @id AI-08-021
   * Kiểm tra tính hợp lệ của mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_training_example<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-022
   * Kiểm tra tính hợp lệ của nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của nhãn huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_training_label<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-023
   * Kiểm tra tính hợp lệ của vector đặc trưng trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vector đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_feature_vector<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-024
   * Kiểm tra tính hợp lệ của dự đoán trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_prediction<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-025
   * Kiểm tra tính hợp lệ của sai số dự đoán trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_prediction_error<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-026
   * Kiểm tra tính hợp lệ của mẫu xác thực trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu xác thực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_validation_sample<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-027
   * Kiểm tra tính hợp lệ của lô huấn luyện trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lô huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_training_batch<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-028
   * Kiểm tra tính hợp lệ của xác suất lớp trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xác suất lớp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_class_probability<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-029
   * Kiểm tra tính hợp lệ của tham số mô hình trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tham số mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_model_parameter<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-030
   * Kiểm tra tính hợp lệ của chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_validate_training_metric<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-08-031
   * Chuẩn hóa mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn mẫu huấn luyện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_training_example<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-032
   * Chuẩn hóa nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn nhãn huấn luyện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_training_label<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-033
   * Chuẩn hóa vector đặc trưng trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn vector đặc trưng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_feature_vector<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-034
   * Chuẩn hóa dự đoán trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn dự đoán để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_prediction<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-035
   * Chuẩn hóa sai số dự đoán trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_prediction_error<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-036
   * Chuẩn hóa mẫu xác thực trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn mẫu xác thực để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_validation_sample<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-037
   * Chuẩn hóa lô huấn luyện trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn lô huấn luyện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_training_batch<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-038
   * Chuẩn hóa xác suất lớp trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn xác suất lớp để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_class_probability<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-039
   * Chuẩn hóa tham số mô hình trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn tham số mô hình để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_model_parameter<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-040
   * Chuẩn hóa chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Chuẩn hóa biểu diễn chỉ số huấn luyện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_normalize_training_metric<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-08-041
   * Cập nhật mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Cập nhật mẫu huấn luyện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_training_example<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'training_example', updateData, context);
  }

  /**
   * @id AI-08-042
   * Cập nhật nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Cập nhật nhãn huấn luyện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_training_label<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'training_label', updateData, context);
  }

  /**
   * @id AI-08-043
   * Cập nhật vector đặc trưng trong module học có giám sát.
   * Mục đích: Cập nhật vector đặc trưng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_feature_vector<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'feature_vector', updateData, context);
  }

  /**
   * @id AI-08-044
   * Cập nhật dự đoán trong module học có giám sát.
   * Mục đích: Cập nhật dự đoán dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_prediction<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'prediction', updateData, context);
  }

  /**
   * @id AI-08-045
   * Cập nhật sai số dự đoán trong module học có giám sát.
   * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'prediction_error', updateData, context);
  }

  /**
   * @id AI-08-046
   * Cập nhật mẫu xác thực trong module học có giám sát.
   * Mục đích: Cập nhật mẫu xác thực dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_validation_sample<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'validation_sample', updateData, context);
  }

  /**
   * @id AI-08-047
   * Cập nhật lô huấn luyện trong module học có giám sát.
   * Mục đích: Cập nhật lô huấn luyện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_training_batch<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'training_batch', updateData, context);
  }

  /**
   * @id AI-08-048
   * Cập nhật xác suất lớp trong module học có giám sát.
   * Mục đích: Cập nhật xác suất lớp dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_class_probability<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'class_probability', updateData, context);
  }

  /**
   * @id AI-08-049
   * Cập nhật tham số mô hình trong module học có giám sát.
   * Mục đích: Cập nhật tham số mô hình dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_model_parameter<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'model_parameter', updateData, context);
  }

  /**
   * @id AI-08-050
   * Cập nhật chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Cập nhật chỉ số huấn luyện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_update_training_metric<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'training_metric', updateData, context);
  }

  /**
   * @id AI-08-051
   * Đánh giá mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_training_example<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-052
   * Đánh giá nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của nhãn huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_training_label<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-053
   * Đánh giá vector đặc trưng trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vector đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_feature_vector<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-054
   * Đánh giá dự đoán trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_prediction<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-055
   * Đánh giá sai số dự đoán trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_prediction_error<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-056
   * Đánh giá mẫu xác thực trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu xác thực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_validation_sample<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-057
   * Đánh giá lô huấn luyện trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lô huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_training_batch<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-058
   * Đánh giá xác suất lớp trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xác suất lớp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_class_probability<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-059
   * Đánh giá tham số mô hình trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tham số mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_model_parameter<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-060
   * Đánh giá chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_evaluate_training_metric<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-08-061
   * Truy xuất mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Tìm và trả về mẫu huấn luyện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_training_example<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'training_example', query);
  }

  /**
   * @id AI-08-062
   * Truy xuất nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Tìm và trả về nhãn huấn luyện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_training_label<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'training_label', query);
  }

  /**
   * @id AI-08-063
   * Truy xuất vector đặc trưng trong module học có giám sát.
   * Mục đích: Tìm và trả về vector đặc trưng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_feature_vector<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'feature_vector', query);
  }

  /**
   * @id AI-08-064
   * Truy xuất dự đoán trong module học có giám sát.
   * Mục đích: Tìm và trả về dự đoán phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_prediction<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'prediction', query);
  }

  /**
   * @id AI-08-065
   * Truy xuất sai số dự đoán trong module học có giám sát.
   * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_prediction_error<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'prediction_error', query);
  }

  /**
   * @id AI-08-066
   * Truy xuất mẫu xác thực trong module học có giám sát.
   * Mục đích: Tìm và trả về mẫu xác thực phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_validation_sample<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'validation_sample', query);
  }

  /**
   * @id AI-08-067
   * Truy xuất lô huấn luyện trong module học có giám sát.
   * Mục đích: Tìm và trả về lô huấn luyện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_training_batch<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'training_batch', query);
  }

  /**
   * @id AI-08-068
   * Truy xuất xác suất lớp trong module học có giám sát.
   * Mục đích: Tìm và trả về xác suất lớp phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_class_probability<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'class_probability', query);
  }

  /**
   * @id AI-08-069
   * Truy xuất tham số mô hình trong module học có giám sát.
   * Mục đích: Tìm và trả về tham số mô hình phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_model_parameter<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'model_parameter', query);
  }

  /**
   * @id AI-08-070
   * Truy xuất chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Tìm và trả về chỉ số huấn luyện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_retrieve_training_metric<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'training_metric', query);
  }

  /**
   * @id AI-08-071
   * Tuần tự hóa mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Chuyển mẫu huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_training_example<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-072
   * Tuần tự hóa nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Chuyển nhãn huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_training_label<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-073
   * Tuần tự hóa vector đặc trưng trong module học có giám sát.
   * Mục đích: Chuyển vector đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_feature_vector<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-074
   * Tuần tự hóa dự đoán trong module học có giám sát.
   * Mục đích: Chuyển dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_prediction<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-075
   * Tuần tự hóa sai số dự đoán trong module học có giám sát.
   * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_prediction_error<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-076
   * Tuần tự hóa mẫu xác thực trong module học có giám sát.
   * Mục đích: Chuyển mẫu xác thực sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_validation_sample<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-077
   * Tuần tự hóa lô huấn luyện trong module học có giám sát.
   * Mục đích: Chuyển lô huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_training_batch<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-078
   * Tuần tự hóa xác suất lớp trong module học có giám sát.
   * Mục đích: Chuyển xác suất lớp sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_class_probability<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-079
   * Tuần tự hóa tham số mô hình trong module học có giám sát.
   * Mục đích: Chuyển tham số mô hình sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_model_parameter<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-080
   * Tuần tự hóa chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Chuyển chỉ số huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_serialize_training_metric<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-08-081
   * So sánh mẫu huấn luyện trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_training_example<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-082
   * So sánh nhãn huấn luyện trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của nhãn huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_training_label<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-083
   * So sánh vector đặc trưng trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của vector đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_feature_vector<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-084
   * So sánh dự đoán trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_prediction<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-085
   * So sánh sai số dự đoán trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_prediction_error<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-086
   * So sánh mẫu xác thực trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu xác thực.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_validation_sample<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-087
   * So sánh lô huấn luyện trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lô huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_training_batch<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-088
   * So sánh xác suất lớp trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của xác suất lớp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_class_probability<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-089
   * So sánh tham số mô hình trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tham số mô hình.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_model_parameter<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-090
   * So sánh chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số huấn luyện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public sup_compare_training_metric<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-08-091
   * Tinh gọn mẫu huấn luyện trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_training_example(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'training_example', options);
  }

  /**
   * @id AI-08-092
   * Tinh gọn nhãn huấn luyện trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần nhãn huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_training_label(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'training_label', options);
  }

  /**
   * @id AI-08-093
   * Tinh gọn vector đặc trưng trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần vector đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_feature_vector(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'feature_vector', options);
  }

  /**
   * @id AI-08-094
   * Tinh gọn dự đoán trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần dự đoán lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_prediction(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'prediction', options);
  }

  /**
   * @id AI-08-095
   * Tinh gọn sai số dự đoán trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_prediction_error(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'prediction_error', options);
  }

  /**
   * @id AI-08-096
   * Tinh gọn mẫu xác thực trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu xác thực lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_validation_sample(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'validation_sample', options);
  }

  /**
   * @id AI-08-097
   * Tinh gọn lô huấn luyện trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần lô huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_training_batch(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'training_batch', options);
  }

  /**
   * @id AI-08-098
   * Tinh gọn xác suất lớp trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần xác suất lớp lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_class_probability(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'class_probability', options);
  }

  /**
   * @id AI-08-099
   * Tinh gọn tham số mô hình trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần tham số mô hình lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_model_parameter(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'model_parameter', options);
  }

  /**
   * @id AI-08-100
   * Tinh gọn chỉ số huấn luyện trong module học có giám sát.
   * Mục đích: Loại bỏ hoặc gộp phần chỉ số huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public sup_prune_training_metric(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'training_metric', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for SUP)
// ============================================================================

let defaultSubsystem: NPCSupervisedLearningSubsystem | null = null;
function getSubsystem(): NPCSupervisedLearningSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCSupervisedLearningSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-08-001
 * Khởi tạo mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu huấn luyện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_training_example<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_training_example<T>(agentId, initialData, context);
}

/**
 * @id AI-08-002
 * Khởi tạo nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho nhãn huấn luyện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_training_label<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_training_label<T>(agentId, initialData, context);
}

/**
 * @id AI-08-003
 * Khởi tạo vector đặc trưng trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vector đặc trưng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_feature_vector<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_feature_vector<T>(agentId, initialData, context);
}

/**
 * @id AI-08-004
 * Khởi tạo dự đoán trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dự đoán.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_prediction<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_prediction<T>(agentId, initialData, context);
}

/**
 * @id AI-08-005
 * Khởi tạo sai số dự đoán trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho sai số dự đoán.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_prediction_error<T>(agentId, initialData, context);
}

/**
 * @id AI-08-006
 * Khởi tạo mẫu xác thực trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu xác thực.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_validation_sample<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_validation_sample<T>(agentId, initialData, context);
}

/**
 * @id AI-08-007
 * Khởi tạo lô huấn luyện trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lô huấn luyện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_training_batch<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_training_batch<T>(agentId, initialData, context);
}

/**
 * @id AI-08-008
 * Khởi tạo xác suất lớp trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho xác suất lớp.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_class_probability<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_class_probability<T>(agentId, initialData, context);
}

/**
 * @id AI-08-009
 * Khởi tạo tham số mô hình trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tham số mô hình.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_model_parameter<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_model_parameter<T>(agentId, initialData, context);
}

/**
 * @id AI-08-010
 * Khởi tạo chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chỉ số huấn luyện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_initialize_training_metric<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_initialize_training_metric<T>(agentId, initialData, context);
}

/**
 * @id AI-08-011
 * Thu thập mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu huấn luyện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_training_example<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_training_example<T>(agentId, data, context);
}

/**
 * @id AI-08-012
 * Thu thập nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến nhãn huấn luyện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_training_label<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_training_label<T>(agentId, data, context);
}

/**
 * @id AI-08-013
 * Thu thập vector đặc trưng trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến vector đặc trưng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_feature_vector<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_feature_vector<T>(agentId, data, context);
}

/**
 * @id AI-08-014
 * Thu thập dự đoán trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến dự đoán từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_prediction<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_prediction<T>(agentId, data, context);
}

/**
 * @id AI-08-015
 * Thu thập sai số dự đoán trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến sai số dự đoán từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_prediction_error<T>(agentId, data, context);
}

/**
 * @id AI-08-016
 * Thu thập mẫu xác thực trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu xác thực từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_validation_sample<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_validation_sample<T>(agentId, data, context);
}

/**
 * @id AI-08-017
 * Thu thập lô huấn luyện trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến lô huấn luyện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_training_batch<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_training_batch<T>(agentId, data, context);
}

/**
 * @id AI-08-018
 * Thu thập xác suất lớp trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến xác suất lớp từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_class_probability<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_class_probability<T>(agentId, data, context);
}

/**
 * @id AI-08-019
 * Thu thập tham số mô hình trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến tham số mô hình từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_model_parameter<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_model_parameter<T>(agentId, data, context);
}

/**
 * @id AI-08-020
 * Thu thập chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Thu thập dữ liệu liên quan đến chỉ số huấn luyện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_capture_training_metric<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_capture_training_metric<T>(agentId, data, context);
}

/**
 * @id AI-08-021
 * Kiểm tra tính hợp lệ của mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_training_example<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-022
 * Kiểm tra tính hợp lệ của nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của nhãn huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_training_label<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-023
 * Kiểm tra tính hợp lệ của vector đặc trưng trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vector đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_feature_vector<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-024
 * Kiểm tra tính hợp lệ của dự đoán trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_prediction<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-025
 * Kiểm tra tính hợp lệ của sai số dự đoán trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_prediction_error<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-026
 * Kiểm tra tính hợp lệ của mẫu xác thực trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu xác thực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_validation_sample<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-027
 * Kiểm tra tính hợp lệ của lô huấn luyện trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lô huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_training_batch<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-028
 * Kiểm tra tính hợp lệ của xác suất lớp trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của xác suất lớp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_class_probability<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-029
 * Kiểm tra tính hợp lệ của tham số mô hình trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tham số mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_model_parameter<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-030
 * Kiểm tra tính hợp lệ của chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chỉ số huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_validate_training_metric<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-08-031
 * Chuẩn hóa mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn mẫu huấn luyện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_training_example<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-032
 * Chuẩn hóa nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn nhãn huấn luyện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_training_label<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-033
 * Chuẩn hóa vector đặc trưng trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn vector đặc trưng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_feature_vector<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-034
 * Chuẩn hóa dự đoán trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn dự đoán để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_prediction<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-035
 * Chuẩn hóa sai số dự đoán trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn sai số dự đoán để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_prediction_error<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-036
 * Chuẩn hóa mẫu xác thực trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn mẫu xác thực để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_validation_sample<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-037
 * Chuẩn hóa lô huấn luyện trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn lô huấn luyện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_training_batch<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-038
 * Chuẩn hóa xác suất lớp trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn xác suất lớp để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_class_probability<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-039
 * Chuẩn hóa tham số mô hình trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn tham số mô hình để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_model_parameter<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-040
 * Chuẩn hóa chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Chuẩn hóa biểu diễn chỉ số huấn luyện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_normalize_training_metric<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-08-041
 * Cập nhật mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Cập nhật mẫu huấn luyện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_training_example<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_training_example<T>(agentId, updateData, context);
}

/**
 * @id AI-08-042
 * Cập nhật nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Cập nhật nhãn huấn luyện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_training_label<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_training_label<T>(agentId, updateData, context);
}

/**
 * @id AI-08-043
 * Cập nhật vector đặc trưng trong module học có giám sát.
 * Mục đích: Cập nhật vector đặc trưng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_feature_vector<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_feature_vector<T>(agentId, updateData, context);
}

/**
 * @id AI-08-044
 * Cập nhật dự đoán trong module học có giám sát.
 * Mục đích: Cập nhật dự đoán dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_prediction<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_prediction<T>(agentId, updateData, context);
}

/**
 * @id AI-08-045
 * Cập nhật sai số dự đoán trong module học có giám sát.
 * Mục đích: Cập nhật sai số dự đoán dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_prediction_error<T>(agentId, updateData, context);
}

/**
 * @id AI-08-046
 * Cập nhật mẫu xác thực trong module học có giám sát.
 * Mục đích: Cập nhật mẫu xác thực dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_validation_sample<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_validation_sample<T>(agentId, updateData, context);
}

/**
 * @id AI-08-047
 * Cập nhật lô huấn luyện trong module học có giám sát.
 * Mục đích: Cập nhật lô huấn luyện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_training_batch<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_training_batch<T>(agentId, updateData, context);
}

/**
 * @id AI-08-048
 * Cập nhật xác suất lớp trong module học có giám sát.
 * Mục đích: Cập nhật xác suất lớp dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_class_probability<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_class_probability<T>(agentId, updateData, context);
}

/**
 * @id AI-08-049
 * Cập nhật tham số mô hình trong module học có giám sát.
 * Mục đích: Cập nhật tham số mô hình dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_model_parameter<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_model_parameter<T>(agentId, updateData, context);
}

/**
 * @id AI-08-050
 * Cập nhật chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Cập nhật chỉ số huấn luyện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_update_training_metric<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).sup_update_training_metric<T>(agentId, updateData, context);
}

/**
 * @id AI-08-051
 * Đánh giá mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_training_example<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-052
 * Đánh giá nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của nhãn huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_training_label<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-053
 * Đánh giá vector đặc trưng trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vector đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_feature_vector<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-054
 * Đánh giá dự đoán trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_prediction<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-055
 * Đánh giá sai số dự đoán trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_prediction_error<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-056
 * Đánh giá mẫu xác thực trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu xác thực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_validation_sample<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-057
 * Đánh giá lô huấn luyện trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lô huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_training_batch<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-058
 * Đánh giá xác suất lớp trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của xác suất lớp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_class_probability<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-059
 * Đánh giá tham số mô hình trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tham số mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_model_parameter<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-060
 * Đánh giá chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chỉ số huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_evaluate_training_metric<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-08-061
 * Truy xuất mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Tìm và trả về mẫu huấn luyện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_training_example<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_training_example<T>(agentId, query);
}

/**
 * @id AI-08-062
 * Truy xuất nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Tìm và trả về nhãn huấn luyện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_training_label<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_training_label<T>(agentId, query);
}

/**
 * @id AI-08-063
 * Truy xuất vector đặc trưng trong module học có giám sát.
 * Mục đích: Tìm và trả về vector đặc trưng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_feature_vector<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_feature_vector<T>(agentId, query);
}

/**
 * @id AI-08-064
 * Truy xuất dự đoán trong module học có giám sát.
 * Mục đích: Tìm và trả về dự đoán phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_prediction<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_prediction<T>(agentId, query);
}

/**
 * @id AI-08-065
 * Truy xuất sai số dự đoán trong module học có giám sát.
 * Mục đích: Tìm và trả về sai số dự đoán phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_prediction_error<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_prediction_error<T>(agentId, query);
}

/**
 * @id AI-08-066
 * Truy xuất mẫu xác thực trong module học có giám sát.
 * Mục đích: Tìm và trả về mẫu xác thực phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_validation_sample<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_validation_sample<T>(agentId, query);
}

/**
 * @id AI-08-067
 * Truy xuất lô huấn luyện trong module học có giám sát.
 * Mục đích: Tìm và trả về lô huấn luyện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_training_batch<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_training_batch<T>(agentId, query);
}

/**
 * @id AI-08-068
 * Truy xuất xác suất lớp trong module học có giám sát.
 * Mục đích: Tìm và trả về xác suất lớp phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_class_probability<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_class_probability<T>(agentId, query);
}

/**
 * @id AI-08-069
 * Truy xuất tham số mô hình trong module học có giám sát.
 * Mục đích: Tìm và trả về tham số mô hình phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_model_parameter<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_model_parameter<T>(agentId, query);
}

/**
 * @id AI-08-070
 * Truy xuất chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Tìm và trả về chỉ số huấn luyện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_retrieve_training_metric<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).sup_retrieve_training_metric<T>(agentId, query);
}

/**
 * @id AI-08-071
 * Tuần tự hóa mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Chuyển mẫu huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_training_example<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-072
 * Tuần tự hóa nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Chuyển nhãn huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_training_label<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-073
 * Tuần tự hóa vector đặc trưng trong module học có giám sát.
 * Mục đích: Chuyển vector đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_feature_vector<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-074
 * Tuần tự hóa dự đoán trong module học có giám sát.
 * Mục đích: Chuyển dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_prediction<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-075
 * Tuần tự hóa sai số dự đoán trong module học có giám sát.
 * Mục đích: Chuyển sai số dự đoán sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_prediction_error<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-076
 * Tuần tự hóa mẫu xác thực trong module học có giám sát.
 * Mục đích: Chuyển mẫu xác thực sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_validation_sample<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-077
 * Tuần tự hóa lô huấn luyện trong module học có giám sát.
 * Mục đích: Chuyển lô huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_training_batch<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-078
 * Tuần tự hóa xác suất lớp trong module học có giám sát.
 * Mục đích: Chuyển xác suất lớp sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_class_probability<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-079
 * Tuần tự hóa tham số mô hình trong module học có giám sát.
 * Mục đích: Chuyển tham số mô hình sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_model_parameter<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-080
 * Tuần tự hóa chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Chuyển chỉ số huấn luyện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_serialize_training_metric<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-08-081
 * So sánh mẫu huấn luyện trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_training_example<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-082
 * So sánh nhãn huấn luyện trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của nhãn huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_training_label<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-083
 * So sánh vector đặc trưng trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của vector đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_feature_vector<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-084
 * So sánh dự đoán trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_prediction<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-085
 * So sánh sai số dự đoán trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của sai số dự đoán.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_prediction_error<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-086
 * So sánh mẫu xác thực trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu xác thực.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_validation_sample<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-087
 * So sánh lô huấn luyện trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lô huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_training_batch<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-088
 * So sánh xác suất lớp trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của xác suất lớp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_class_probability<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-089
 * So sánh tham số mô hình trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tham số mô hình.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_model_parameter<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-090
 * So sánh chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chỉ số huấn luyện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function sup_compare_training_metric<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-08-091
 * Tinh gọn mẫu huấn luyện trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_training_example(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_training_example(agentId, options);
}

/**
 * @id AI-08-092
 * Tinh gọn nhãn huấn luyện trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần nhãn huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_training_label(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_training_label(agentId, options);
}

/**
 * @id AI-08-093
 * Tinh gọn vector đặc trưng trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần vector đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_feature_vector(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_feature_vector(agentId, options);
}

/**
 * @id AI-08-094
 * Tinh gọn dự đoán trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần dự đoán lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_prediction(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_prediction(agentId, options);
}

/**
 * @id AI-08-095
 * Tinh gọn sai số dự đoán trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần sai số dự đoán lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_prediction_error(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_prediction_error(agentId, options);
}

/**
 * @id AI-08-096
 * Tinh gọn mẫu xác thực trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu xác thực lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_validation_sample(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_validation_sample(agentId, options);
}

/**
 * @id AI-08-097
 * Tinh gọn lô huấn luyện trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần lô huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_training_batch(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_training_batch(agentId, options);
}

/**
 * @id AI-08-098
 * Tinh gọn xác suất lớp trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần xác suất lớp lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_class_probability(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_class_probability(agentId, options);
}

/**
 * @id AI-08-099
 * Tinh gọn tham số mô hình trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần tham số mô hình lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_model_parameter(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_model_parameter(agentId, options);
}

/**
 * @id AI-08-100
 * Tinh gọn chỉ số huấn luyện trong module học có giám sát.
 * Mục đích: Loại bỏ hoặc gộp phần chỉ số huấn luyện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function sup_prune_training_metric(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).sup_prune_training_metric(agentId, options);
}

