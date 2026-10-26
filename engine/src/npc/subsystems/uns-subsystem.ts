/**
 * @file uns-subsystem.ts
 * @module @aetheria/engine/npc
 * @description UNS — Học không giám sát và khám phá (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module UNS.
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

export interface INPCUnsupervisedLearningSubsystem {
  uns_initialize_observation_cluster<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_behavior_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_feature_distribution<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_anomaly_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_latent_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_cluster_centroid<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_experience_embedding<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_pattern_coherence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_similarity_graph<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_initialize_discovered_rule<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_observation_cluster<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_behavior_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_feature_distribution<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_anomaly_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_latent_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_cluster_centroid<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_experience_embedding<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_pattern_coherence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_similarity_graph<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_capture_discovered_rule<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  uns_validate_observation_cluster<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_behavior_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_feature_distribution<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_anomaly_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_latent_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_cluster_centroid<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_experience_embedding<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_pattern_coherence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_similarity_graph<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_validate_discovered_rule<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  uns_normalize_observation_cluster<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_behavior_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_feature_distribution<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_anomaly_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_latent_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_cluster_centroid<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_experience_embedding<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_pattern_coherence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_similarity_graph<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_normalize_discovered_rule<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  uns_update_observation_cluster<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_behavior_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_feature_distribution<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_anomaly_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_latent_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_cluster_centroid<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_experience_embedding<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_pattern_coherence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_similarity_graph<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_update_discovered_rule<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  uns_evaluate_observation_cluster<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_behavior_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_feature_distribution<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_anomaly_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_latent_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_cluster_centroid<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_experience_embedding<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_pattern_coherence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_similarity_graph<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_evaluate_discovered_rule<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  uns_retrieve_observation_cluster<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_behavior_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_feature_distribution<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_anomaly_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_latent_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_cluster_centroid<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_experience_embedding<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_pattern_coherence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_similarity_graph<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_retrieve_discovered_rule<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  uns_serialize_observation_cluster<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_behavior_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_feature_distribution<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_anomaly_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_latent_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_cluster_centroid<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_experience_embedding<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_pattern_coherence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_similarity_graph<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_serialize_discovered_rule<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  uns_compare_observation_cluster<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_behavior_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_feature_distribution<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_anomaly_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_latent_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_cluster_centroid<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_experience_embedding<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_pattern_coherence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_similarity_graph<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_compare_discovered_rule<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  uns_prune_observation_cluster(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_behavior_pattern(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_feature_distribution(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_anomaly_score(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_latent_state(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_cluster_centroid(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_experience_embedding(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_pattern_coherence(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_similarity_graph(agentId: string, options?: PruningOptions): PruningResult;
  uns_prune_discovered_rule(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCUnsupervisedLearningSubsystem extends NPCBaseSubsystem implements INPCUnsupervisedLearningSubsystem {
  public readonly moduleCode = 'UNS';
  public readonly moduleTitle = 'UNS — Học không giám sát và khám phá (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-09-001
   * Khởi tạo cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cụm quan sát.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_observation_cluster<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'observation_cluster', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-002
   * Khởi tạo mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu hành vi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_behavior_pattern<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_pattern', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-003
   * Khởi tạo phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phân phối đặc trưng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_feature_distribution<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature_distribution', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-004
   * Khởi tạo điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm bất thường.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_anomaly_score<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'anomaly_score', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-005
   * Khởi tạo trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái tiềm ẩn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_latent_state<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'latent_state', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-006
   * Khởi tạo tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tâm cụm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_cluster_centroid<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'cluster_centroid', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-007
   * Khởi tạo biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho biểu diễn trải nghiệm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_experience_embedding<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'experience_embedding', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-008
   * Khởi tạo độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ nhất quán mẫu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_pattern_coherence<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'pattern_coherence', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-009
   * Khởi tạo đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đồ thị tương đồng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_similarity_graph<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'similarity_graph', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-010
   * Khởi tạo quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quy luật phát hiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_initialize_discovered_rule<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'discovered_rule', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-09-011
   * Thu thập cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến cụm quan sát từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_observation_cluster<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'observation_cluster', data, context);
  }

  /**
   * @id AI-09-012
   * Thu thập mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu hành vi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_behavior_pattern<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'behavior_pattern', data, context);
  }

  /**
   * @id AI-09-013
   * Thu thập phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến phân phối đặc trưng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_feature_distribution<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'feature_distribution', data, context);
  }

  /**
   * @id AI-09-014
   * Thu thập điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến điểm bất thường từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_anomaly_score<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'anomaly_score', data, context);
  }

  /**
   * @id AI-09-015
   * Thu thập trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến trạng thái tiềm ẩn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_latent_state<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'latent_state', data, context);
  }

  /**
   * @id AI-09-016
   * Thu thập tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến tâm cụm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_cluster_centroid<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'cluster_centroid', data, context);
  }

  /**
   * @id AI-09-017
   * Thu thập biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến biểu diễn trải nghiệm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_experience_embedding<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'experience_embedding', data, context);
  }

  /**
   * @id AI-09-018
   * Thu thập độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến độ nhất quán mẫu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_pattern_coherence<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'pattern_coherence', data, context);
  }

  /**
   * @id AI-09-019
   * Thu thập đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến đồ thị tương đồng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_similarity_graph<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'similarity_graph', data, context);
  }

  /**
   * @id AI-09-020
   * Thu thập quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Thu thập dữ liệu liên quan đến quy luật phát hiện từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_capture_discovered_rule<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'discovered_rule', data, context);
  }

  /**
   * @id AI-09-021
   * Kiểm tra tính hợp lệ của cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cụm quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_observation_cluster<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-022
   * Kiểm tra tính hợp lệ của mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_behavior_pattern<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-023
   * Kiểm tra tính hợp lệ của phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phân phối đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_feature_distribution<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-024
   * Kiểm tra tính hợp lệ của điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm bất thường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_anomaly_score<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-025
   * Kiểm tra tính hợp lệ của trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_latent_state<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-026
   * Kiểm tra tính hợp lệ của tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tâm cụm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_cluster_centroid<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-027
   * Kiểm tra tính hợp lệ của biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của biểu diễn trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_experience_embedding<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-028
   * Kiểm tra tính hợp lệ của độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ nhất quán mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_pattern_coherence<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-029
   * Kiểm tra tính hợp lệ của đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đồ thị tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_similarity_graph<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-030
   * Kiểm tra tính hợp lệ của quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quy luật phát hiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_validate_discovered_rule<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-09-031
   * Chuẩn hóa cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn cụm quan sát để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_observation_cluster<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-032
   * Chuẩn hóa mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn mẫu hành vi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_behavior_pattern<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-033
   * Chuẩn hóa phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn phân phối đặc trưng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_feature_distribution<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-034
   * Chuẩn hóa điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn điểm bất thường để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_anomaly_score<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-035
   * Chuẩn hóa trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn trạng thái tiềm ẩn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_latent_state<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-036
   * Chuẩn hóa tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn tâm cụm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_cluster_centroid<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-037
   * Chuẩn hóa biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn biểu diễn trải nghiệm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_experience_embedding<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-038
   * Chuẩn hóa độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn độ nhất quán mẫu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_pattern_coherence<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-039
   * Chuẩn hóa đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn đồ thị tương đồng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_similarity_graph<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-040
   * Chuẩn hóa quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Chuẩn hóa biểu diễn quy luật phát hiện để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_normalize_discovered_rule<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-09-041
   * Cập nhật cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật cụm quan sát dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_observation_cluster<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'observation_cluster', updateData, context);
  }

  /**
   * @id AI-09-042
   * Cập nhật mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật mẫu hành vi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_behavior_pattern<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'behavior_pattern', updateData, context);
  }

  /**
   * @id AI-09-043
   * Cập nhật phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật phân phối đặc trưng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_feature_distribution<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'feature_distribution', updateData, context);
  }

  /**
   * @id AI-09-044
   * Cập nhật điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật điểm bất thường dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_anomaly_score<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'anomaly_score', updateData, context);
  }

  /**
   * @id AI-09-045
   * Cập nhật trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật trạng thái tiềm ẩn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_latent_state<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'latent_state', updateData, context);
  }

  /**
   * @id AI-09-046
   * Cập nhật tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật tâm cụm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_cluster_centroid<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'cluster_centroid', updateData, context);
  }

  /**
   * @id AI-09-047
   * Cập nhật biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật biểu diễn trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_experience_embedding<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'experience_embedding', updateData, context);
  }

  /**
   * @id AI-09-048
   * Cập nhật độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật độ nhất quán mẫu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_pattern_coherence<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'pattern_coherence', updateData, context);
  }

  /**
   * @id AI-09-049
   * Cập nhật đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật đồ thị tương đồng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_similarity_graph<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'similarity_graph', updateData, context);
  }

  /**
   * @id AI-09-050
   * Cập nhật quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Cập nhật quy luật phát hiện dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_update_discovered_rule<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'discovered_rule', updateData, context);
  }

  /**
   * @id AI-09-051
   * Đánh giá cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cụm quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_observation_cluster<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-052
   * Đánh giá mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_behavior_pattern<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-053
   * Đánh giá phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phân phối đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_feature_distribution<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-054
   * Đánh giá điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm bất thường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_anomaly_score<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-055
   * Đánh giá trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_latent_state<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-056
   * Đánh giá tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tâm cụm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_cluster_centroid<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-057
   * Đánh giá biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của biểu diễn trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_experience_embedding<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-058
   * Đánh giá độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ nhất quán mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_pattern_coherence<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-059
   * Đánh giá đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đồ thị tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_similarity_graph<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-060
   * Đánh giá quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quy luật phát hiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_evaluate_discovered_rule<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-09-061
   * Truy xuất cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về cụm quan sát phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_observation_cluster<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'observation_cluster', query);
  }

  /**
   * @id AI-09-062
   * Truy xuất mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về mẫu hành vi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_behavior_pattern<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'behavior_pattern', query);
  }

  /**
   * @id AI-09-063
   * Truy xuất phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về phân phối đặc trưng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_feature_distribution<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'feature_distribution', query);
  }

  /**
   * @id AI-09-064
   * Truy xuất điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về điểm bất thường phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_anomaly_score<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'anomaly_score', query);
  }

  /**
   * @id AI-09-065
   * Truy xuất trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về trạng thái tiềm ẩn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_latent_state<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'latent_state', query);
  }

  /**
   * @id AI-09-066
   * Truy xuất tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về tâm cụm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_cluster_centroid<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'cluster_centroid', query);
  }

  /**
   * @id AI-09-067
   * Truy xuất biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về biểu diễn trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_experience_embedding<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'experience_embedding', query);
  }

  /**
   * @id AI-09-068
   * Truy xuất độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về độ nhất quán mẫu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_pattern_coherence<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'pattern_coherence', query);
  }

  /**
   * @id AI-09-069
   * Truy xuất đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về đồ thị tương đồng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_similarity_graph<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'similarity_graph', query);
  }

  /**
   * @id AI-09-070
   * Truy xuất quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Tìm và trả về quy luật phát hiện phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_retrieve_discovered_rule<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'discovered_rule', query);
  }

  /**
   * @id AI-09-071
   * Tuần tự hóa cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Chuyển cụm quan sát sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_observation_cluster<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-072
   * Tuần tự hóa mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Chuyển mẫu hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_behavior_pattern<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-073
   * Tuần tự hóa phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Chuyển phân phối đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_feature_distribution<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-074
   * Tuần tự hóa điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Chuyển điểm bất thường sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_anomaly_score<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-075
   * Tuần tự hóa trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Chuyển trạng thái tiềm ẩn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_latent_state<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-076
   * Tuần tự hóa tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Chuyển tâm cụm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_cluster_centroid<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-077
   * Tuần tự hóa biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Chuyển biểu diễn trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_experience_embedding<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-078
   * Tuần tự hóa độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Chuyển độ nhất quán mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_pattern_coherence<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-079
   * Tuần tự hóa đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Chuyển đồ thị tương đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_similarity_graph<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-080
   * Tuần tự hóa quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Chuyển quy luật phát hiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_serialize_discovered_rule<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-09-081
   * So sánh cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của cụm quan sát.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_observation_cluster<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-082
   * So sánh mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu hành vi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_behavior_pattern<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-083
   * So sánh phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phân phối đặc trưng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_feature_distribution<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-084
   * So sánh điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm bất thường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_anomaly_score<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-085
   * So sánh trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_latent_state<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-086
   * So sánh tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tâm cụm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_cluster_centroid<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-087
   * So sánh biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của biểu diễn trải nghiệm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_experience_embedding<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-088
   * So sánh độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ nhất quán mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_pattern_coherence<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-089
   * So sánh đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đồ thị tương đồng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_similarity_graph<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-090
   * So sánh quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của quy luật phát hiện.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public uns_compare_discovered_rule<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-09-091
   * Tinh gọn cụm quan sát trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần cụm quan sát lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_observation_cluster(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'observation_cluster', options);
  }

  /**
   * @id AI-09-092
   * Tinh gọn mẫu hành vi trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu hành vi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_behavior_pattern(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'behavior_pattern', options);
  }

  /**
   * @id AI-09-093
   * Tinh gọn phân phối đặc trưng trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần phân phối đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_feature_distribution(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'feature_distribution', options);
  }

  /**
   * @id AI-09-094
   * Tinh gọn điểm bất thường trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần điểm bất thường lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_anomaly_score(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'anomaly_score', options);
  }

  /**
   * @id AI-09-095
   * Tinh gọn trạng thái tiềm ẩn trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần trạng thái tiềm ẩn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_latent_state(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'latent_state', options);
  }

  /**
   * @id AI-09-096
   * Tinh gọn tâm cụm trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần tâm cụm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_cluster_centroid(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'cluster_centroid', options);
  }

  /**
   * @id AI-09-097
   * Tinh gọn biểu diễn trải nghiệm trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần biểu diễn trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_experience_embedding(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'experience_embedding', options);
  }

  /**
   * @id AI-09-098
   * Tinh gọn độ nhất quán mẫu trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần độ nhất quán mẫu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_pattern_coherence(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'pattern_coherence', options);
  }

  /**
   * @id AI-09-099
   * Tinh gọn đồ thị tương đồng trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần đồ thị tương đồng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_similarity_graph(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'similarity_graph', options);
  }

  /**
   * @id AI-09-100
   * Tinh gọn quy luật phát hiện trong module học không giám sát và khám phá.
   * Mục đích: Loại bỏ hoặc gộp phần quy luật phát hiện lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public uns_prune_discovered_rule(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'discovered_rule', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for UNS)
// ============================================================================

let defaultSubsystem: NPCUnsupervisedLearningSubsystem | null = null;
function getSubsystem(): NPCUnsupervisedLearningSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCUnsupervisedLearningSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-09-001
 * Khởi tạo cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cụm quan sát.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_observation_cluster<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_observation_cluster<T>(agentId, initialData, context);
}

/**
 * @id AI-09-002
 * Khởi tạo mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu hành vi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_behavior_pattern<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_behavior_pattern<T>(agentId, initialData, context);
}

/**
 * @id AI-09-003
 * Khởi tạo phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phân phối đặc trưng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_feature_distribution<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_feature_distribution<T>(agentId, initialData, context);
}

/**
 * @id AI-09-004
 * Khởi tạo điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho điểm bất thường.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_anomaly_score<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_anomaly_score<T>(agentId, initialData, context);
}

/**
 * @id AI-09-005
 * Khởi tạo trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái tiềm ẩn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_latent_state<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_latent_state<T>(agentId, initialData, context);
}

/**
 * @id AI-09-006
 * Khởi tạo tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tâm cụm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_cluster_centroid<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_cluster_centroid<T>(agentId, initialData, context);
}

/**
 * @id AI-09-007
 * Khởi tạo biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho biểu diễn trải nghiệm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_experience_embedding<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_experience_embedding<T>(agentId, initialData, context);
}

/**
 * @id AI-09-008
 * Khởi tạo độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ nhất quán mẫu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_pattern_coherence<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_pattern_coherence<T>(agentId, initialData, context);
}

/**
 * @id AI-09-009
 * Khởi tạo đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đồ thị tương đồng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_similarity_graph<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_similarity_graph<T>(agentId, initialData, context);
}

/**
 * @id AI-09-010
 * Khởi tạo quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quy luật phát hiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_initialize_discovered_rule<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_initialize_discovered_rule<T>(agentId, initialData, context);
}

/**
 * @id AI-09-011
 * Thu thập cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến cụm quan sát từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_observation_cluster<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_observation_cluster<T>(agentId, data, context);
}

/**
 * @id AI-09-012
 * Thu thập mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu hành vi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_behavior_pattern<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_behavior_pattern<T>(agentId, data, context);
}

/**
 * @id AI-09-013
 * Thu thập phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến phân phối đặc trưng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_feature_distribution<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_feature_distribution<T>(agentId, data, context);
}

/**
 * @id AI-09-014
 * Thu thập điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến điểm bất thường từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_anomaly_score<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_anomaly_score<T>(agentId, data, context);
}

/**
 * @id AI-09-015
 * Thu thập trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến trạng thái tiềm ẩn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_latent_state<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_latent_state<T>(agentId, data, context);
}

/**
 * @id AI-09-016
 * Thu thập tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến tâm cụm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_cluster_centroid<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_cluster_centroid<T>(agentId, data, context);
}

/**
 * @id AI-09-017
 * Thu thập biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến biểu diễn trải nghiệm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_experience_embedding<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_experience_embedding<T>(agentId, data, context);
}

/**
 * @id AI-09-018
 * Thu thập độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến độ nhất quán mẫu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_pattern_coherence<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_pattern_coherence<T>(agentId, data, context);
}

/**
 * @id AI-09-019
 * Thu thập đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến đồ thị tương đồng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_similarity_graph<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_similarity_graph<T>(agentId, data, context);
}

/**
 * @id AI-09-020
 * Thu thập quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Thu thập dữ liệu liên quan đến quy luật phát hiện từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_capture_discovered_rule<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_capture_discovered_rule<T>(agentId, data, context);
}

/**
 * @id AI-09-021
 * Kiểm tra tính hợp lệ của cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cụm quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_observation_cluster<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-022
 * Kiểm tra tính hợp lệ của mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_behavior_pattern<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-023
 * Kiểm tra tính hợp lệ của phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phân phối đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_feature_distribution<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-024
 * Kiểm tra tính hợp lệ của điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của điểm bất thường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_anomaly_score<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-025
 * Kiểm tra tính hợp lệ của trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_latent_state<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-026
 * Kiểm tra tính hợp lệ của tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tâm cụm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_cluster_centroid<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-027
 * Kiểm tra tính hợp lệ của biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của biểu diễn trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_experience_embedding<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-028
 * Kiểm tra tính hợp lệ của độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ nhất quán mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_pattern_coherence<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-029
 * Kiểm tra tính hợp lệ của đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đồ thị tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_similarity_graph<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-030
 * Kiểm tra tính hợp lệ của quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quy luật phát hiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_validate_discovered_rule<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-09-031
 * Chuẩn hóa cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn cụm quan sát để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_observation_cluster<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-032
 * Chuẩn hóa mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn mẫu hành vi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_behavior_pattern<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-033
 * Chuẩn hóa phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn phân phối đặc trưng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_feature_distribution<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-034
 * Chuẩn hóa điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn điểm bất thường để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_anomaly_score<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-035
 * Chuẩn hóa trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn trạng thái tiềm ẩn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_latent_state<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-036
 * Chuẩn hóa tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn tâm cụm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_cluster_centroid<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-037
 * Chuẩn hóa biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn biểu diễn trải nghiệm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_experience_embedding<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-038
 * Chuẩn hóa độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn độ nhất quán mẫu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_pattern_coherence<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-039
 * Chuẩn hóa đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn đồ thị tương đồng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_similarity_graph<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-040
 * Chuẩn hóa quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Chuẩn hóa biểu diễn quy luật phát hiện để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_normalize_discovered_rule<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-09-041
 * Cập nhật cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật cụm quan sát dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_observation_cluster<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_observation_cluster<T>(agentId, updateData, context);
}

/**
 * @id AI-09-042
 * Cập nhật mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật mẫu hành vi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_behavior_pattern<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_behavior_pattern<T>(agentId, updateData, context);
}

/**
 * @id AI-09-043
 * Cập nhật phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật phân phối đặc trưng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_feature_distribution<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_feature_distribution<T>(agentId, updateData, context);
}

/**
 * @id AI-09-044
 * Cập nhật điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật điểm bất thường dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_anomaly_score<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_anomaly_score<T>(agentId, updateData, context);
}

/**
 * @id AI-09-045
 * Cập nhật trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật trạng thái tiềm ẩn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_latent_state<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_latent_state<T>(agentId, updateData, context);
}

/**
 * @id AI-09-046
 * Cập nhật tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật tâm cụm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_cluster_centroid<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_cluster_centroid<T>(agentId, updateData, context);
}

/**
 * @id AI-09-047
 * Cập nhật biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật biểu diễn trải nghiệm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_experience_embedding<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_experience_embedding<T>(agentId, updateData, context);
}

/**
 * @id AI-09-048
 * Cập nhật độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật độ nhất quán mẫu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_pattern_coherence<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_pattern_coherence<T>(agentId, updateData, context);
}

/**
 * @id AI-09-049
 * Cập nhật đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật đồ thị tương đồng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_similarity_graph<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_similarity_graph<T>(agentId, updateData, context);
}

/**
 * @id AI-09-050
 * Cập nhật quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Cập nhật quy luật phát hiện dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_update_discovered_rule<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).uns_update_discovered_rule<T>(agentId, updateData, context);
}

/**
 * @id AI-09-051
 * Đánh giá cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cụm quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_observation_cluster<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-052
 * Đánh giá mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_behavior_pattern<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-053
 * Đánh giá phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phân phối đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_feature_distribution<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-054
 * Đánh giá điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của điểm bất thường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_anomaly_score<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-055
 * Đánh giá trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_latent_state<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-056
 * Đánh giá tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tâm cụm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_cluster_centroid<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-057
 * Đánh giá biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của biểu diễn trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_experience_embedding<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-058
 * Đánh giá độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ nhất quán mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_pattern_coherence<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-059
 * Đánh giá đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đồ thị tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_similarity_graph<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-060
 * Đánh giá quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quy luật phát hiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_evaluate_discovered_rule<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-09-061
 * Truy xuất cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về cụm quan sát phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_observation_cluster<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_observation_cluster<T>(agentId, query);
}

/**
 * @id AI-09-062
 * Truy xuất mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về mẫu hành vi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_behavior_pattern<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_behavior_pattern<T>(agentId, query);
}

/**
 * @id AI-09-063
 * Truy xuất phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về phân phối đặc trưng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_feature_distribution<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_feature_distribution<T>(agentId, query);
}

/**
 * @id AI-09-064
 * Truy xuất điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về điểm bất thường phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_anomaly_score<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_anomaly_score<T>(agentId, query);
}

/**
 * @id AI-09-065
 * Truy xuất trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về trạng thái tiềm ẩn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_latent_state<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_latent_state<T>(agentId, query);
}

/**
 * @id AI-09-066
 * Truy xuất tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về tâm cụm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_cluster_centroid<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_cluster_centroid<T>(agentId, query);
}

/**
 * @id AI-09-067
 * Truy xuất biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về biểu diễn trải nghiệm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_experience_embedding<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_experience_embedding<T>(agentId, query);
}

/**
 * @id AI-09-068
 * Truy xuất độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về độ nhất quán mẫu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_pattern_coherence<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_pattern_coherence<T>(agentId, query);
}

/**
 * @id AI-09-069
 * Truy xuất đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về đồ thị tương đồng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_similarity_graph<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_similarity_graph<T>(agentId, query);
}

/**
 * @id AI-09-070
 * Truy xuất quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Tìm và trả về quy luật phát hiện phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_retrieve_discovered_rule<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCUnsupervisedLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).uns_retrieve_discovered_rule<T>(agentId, query);
}

/**
 * @id AI-09-071
 * Tuần tự hóa cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Chuyển cụm quan sát sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_observation_cluster<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-072
 * Tuần tự hóa mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Chuyển mẫu hành vi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_behavior_pattern<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-073
 * Tuần tự hóa phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Chuyển phân phối đặc trưng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_feature_distribution<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-074
 * Tuần tự hóa điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Chuyển điểm bất thường sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_anomaly_score<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-075
 * Tuần tự hóa trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Chuyển trạng thái tiềm ẩn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_latent_state<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-076
 * Tuần tự hóa tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Chuyển tâm cụm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_cluster_centroid<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-077
 * Tuần tự hóa biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Chuyển biểu diễn trải nghiệm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_experience_embedding<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-078
 * Tuần tự hóa độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Chuyển độ nhất quán mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_pattern_coherence<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-079
 * Tuần tự hóa đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Chuyển đồ thị tương đồng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_similarity_graph<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-080
 * Tuần tự hóa quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Chuyển quy luật phát hiện sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_serialize_discovered_rule<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-09-081
 * So sánh cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của cụm quan sát.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_observation_cluster<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-082
 * So sánh mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu hành vi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_behavior_pattern<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-083
 * So sánh phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phân phối đặc trưng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_feature_distribution<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-084
 * So sánh điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của điểm bất thường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_anomaly_score<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-085
 * So sánh trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_latent_state<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-086
 * So sánh tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tâm cụm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_cluster_centroid<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-087
 * So sánh biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của biểu diễn trải nghiệm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_experience_embedding<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-088
 * So sánh độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ nhất quán mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_pattern_coherence<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-089
 * So sánh đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đồ thị tương đồng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_similarity_graph<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-090
 * So sánh quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của quy luật phát hiện.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function uns_compare_discovered_rule<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-09-091
 * Tinh gọn cụm quan sát trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần cụm quan sát lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_observation_cluster(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_observation_cluster(agentId, options);
}

/**
 * @id AI-09-092
 * Tinh gọn mẫu hành vi trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu hành vi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_behavior_pattern(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_behavior_pattern(agentId, options);
}

/**
 * @id AI-09-093
 * Tinh gọn phân phối đặc trưng trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần phân phối đặc trưng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_feature_distribution(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_feature_distribution(agentId, options);
}

/**
 * @id AI-09-094
 * Tinh gọn điểm bất thường trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần điểm bất thường lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_anomaly_score(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_anomaly_score(agentId, options);
}

/**
 * @id AI-09-095
 * Tinh gọn trạng thái tiềm ẩn trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần trạng thái tiềm ẩn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_latent_state(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_latent_state(agentId, options);
}

/**
 * @id AI-09-096
 * Tinh gọn tâm cụm trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần tâm cụm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_cluster_centroid(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_cluster_centroid(agentId, options);
}

/**
 * @id AI-09-097
 * Tinh gọn biểu diễn trải nghiệm trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần biểu diễn trải nghiệm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_experience_embedding(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_experience_embedding(agentId, options);
}

/**
 * @id AI-09-098
 * Tinh gọn độ nhất quán mẫu trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần độ nhất quán mẫu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_pattern_coherence(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_pattern_coherence(agentId, options);
}

/**
 * @id AI-09-099
 * Tinh gọn đồ thị tương đồng trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần đồ thị tương đồng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_similarity_graph(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_similarity_graph(agentId, options);
}

/**
 * @id AI-09-100
 * Tinh gọn quy luật phát hiện trong module học không giám sát và khám phá.
 * Mục đích: Loại bỏ hoặc gộp phần quy luật phát hiện lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function uns_prune_discovered_rule(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCUnsupervisedLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).uns_prune_discovered_rule(agentId, options);
}

