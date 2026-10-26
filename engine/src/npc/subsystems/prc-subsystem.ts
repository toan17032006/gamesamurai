/**
 * @file prc-subsystem.ts
 * @module @aetheria/engine/npc
 * @description PRC — Nhận thức môi trường (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module PRC.
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

export interface INPCPerceptionSubsystem {
  prc_initialize_environment_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_nearby_threat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_target_distance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_player_intent<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_world_belief<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_sensor_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_hidden_opportunity<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_perception_confidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_ambiguous_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_initialize_environment_forecast<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_environment_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_nearby_threat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_target_distance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_player_intent<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_world_belief<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_sensor_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_hidden_opportunity<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_perception_confidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_ambiguous_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_capture_environment_forecast<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  prc_validate_environment_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_nearby_threat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_target_distance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_player_intent<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_world_belief<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_sensor_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_hidden_opportunity<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_perception_confidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_ambiguous_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_validate_environment_forecast<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  prc_normalize_environment_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_nearby_threat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_target_distance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_player_intent<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_world_belief<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_sensor_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_hidden_opportunity<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_perception_confidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_ambiguous_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_normalize_environment_forecast<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  prc_update_environment_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_nearby_threat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_target_distance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_player_intent<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_world_belief<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_sensor_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_hidden_opportunity<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_perception_confidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_ambiguous_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_update_environment_forecast<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  prc_evaluate_environment_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_nearby_threat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_target_distance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_player_intent<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_world_belief<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_sensor_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_hidden_opportunity<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_perception_confidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_ambiguous_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_evaluate_environment_forecast<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  prc_retrieve_environment_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_nearby_threat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_target_distance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_player_intent<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_world_belief<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_sensor_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_hidden_opportunity<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_perception_confidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_ambiguous_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_retrieve_environment_forecast<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  prc_serialize_environment_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_nearby_threat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_target_distance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_player_intent<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_world_belief<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_sensor_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_hidden_opportunity<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_perception_confidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_ambiguous_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_serialize_environment_forecast<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  prc_compare_environment_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_nearby_threat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_target_distance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_player_intent<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_world_belief<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_sensor_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_hidden_opportunity<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_perception_confidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_ambiguous_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_compare_environment_forecast<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  prc_prune_environment_state(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_nearby_threat(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_target_distance(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_player_intent(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_world_belief(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_sensor_observation(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_hidden_opportunity(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_perception_confidence(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_ambiguous_signal(agentId: string, options?: PruningOptions): PruningResult;
  prc_prune_environment_forecast(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCPerceptionSubsystem extends NPCBaseSubsystem implements INPCPerceptionSubsystem {
  public readonly moduleCode = 'PRC';
  public readonly moduleTitle = 'PRC — Nhận thức môi trường (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-14-001
   * Khởi tạo trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái môi trường.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_environment_state<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'environment_state', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-002
   * Khởi tạo mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mối đe dọa gần.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_nearby_threat<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'nearby_threat', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-003
   * Khởi tạo khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khoảng cách mục tiêu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_target_distance<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'target_distance', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-004
   * Khởi tạo ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ý định người chơi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_player_intent<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'player_intent', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-005
   * Khởi tạo nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho nhận định về thế giới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_world_belief<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'world_belief', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-006
   * Khởi tạo quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát cảm biến.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_sensor_observation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sensor_observation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-007
   * Khởi tạo cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cơ hội tiềm ẩn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_hidden_opportunity<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'hidden_opportunity', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-008
   * Khởi tạo độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy nhận thức.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_perception_confidence<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'perception_confidence', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-009
   * Khởi tạo tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu mơ hồ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_ambiguous_signal<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'ambiguous_signal', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-010
   * Khởi tạo dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dự báo môi trường.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_initialize_environment_forecast<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'environment_forecast', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-14-011
   * Thu thập trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến trạng thái môi trường từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_environment_state<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'environment_state', data, context);
  }

  /**
   * @id AI-14-012
   * Thu thập mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến mối đe dọa gần từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_nearby_threat<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'nearby_threat', data, context);
  }

  /**
   * @id AI-14-013
   * Thu thập khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến khoảng cách mục tiêu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_target_distance<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'target_distance', data, context);
  }

  /**
   * @id AI-14-014
   * Thu thập ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến ý định người chơi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_player_intent<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'player_intent', data, context);
  }

  /**
   * @id AI-14-015
   * Thu thập nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến nhận định về thế giới từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_world_belief<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'world_belief', data, context);
  }

  /**
   * @id AI-14-016
   * Thu thập quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến quan sát cảm biến từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_sensor_observation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'sensor_observation', data, context);
  }

  /**
   * @id AI-14-017
   * Thu thập cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến cơ hội tiềm ẩn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_hidden_opportunity<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'hidden_opportunity', data, context);
  }

  /**
   * @id AI-14-018
   * Thu thập độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy nhận thức từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_perception_confidence<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'perception_confidence', data, context);
  }

  /**
   * @id AI-14-019
   * Thu thập tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu mơ hồ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_ambiguous_signal<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'ambiguous_signal', data, context);
  }

  /**
   * @id AI-14-020
   * Thu thập dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Thu thập dữ liệu liên quan đến dự báo môi trường từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_capture_environment_forecast<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'environment_forecast', data, context);
  }

  /**
   * @id AI-14-021
   * Kiểm tra tính hợp lệ của trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_environment_state<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-022
   * Kiểm tra tính hợp lệ của mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mối đe dọa gần.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_nearby_threat<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-023
   * Kiểm tra tính hợp lệ của khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khoảng cách mục tiêu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_target_distance<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-024
   * Kiểm tra tính hợp lệ của ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ý định người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_player_intent<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-025
   * Kiểm tra tính hợp lệ của nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của nhận định về thế giới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_world_belief<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-026
   * Kiểm tra tính hợp lệ của quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát cảm biến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_sensor_observation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-027
   * Kiểm tra tính hợp lệ của cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cơ hội tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_hidden_opportunity<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-028
   * Kiểm tra tính hợp lệ của độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy nhận thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_perception_confidence<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-029
   * Kiểm tra tính hợp lệ của tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu mơ hồ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_ambiguous_signal<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-030
   * Kiểm tra tính hợp lệ của dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dự báo môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_validate_environment_forecast<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-14-031
   * Chuẩn hóa trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn trạng thái môi trường để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_environment_state<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-032
   * Chuẩn hóa mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn mối đe dọa gần để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_nearby_threat<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-033
   * Chuẩn hóa khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn khoảng cách mục tiêu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_target_distance<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-034
   * Chuẩn hóa ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn ý định người chơi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_player_intent<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-035
   * Chuẩn hóa nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn nhận định về thế giới để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_world_belief<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-036
   * Chuẩn hóa quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn quan sát cảm biến để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_sensor_observation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-037
   * Chuẩn hóa cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn cơ hội tiềm ẩn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_hidden_opportunity<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-038
   * Chuẩn hóa độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn độ tin cậy nhận thức để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_perception_confidence<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-039
   * Chuẩn hóa tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn tín hiệu mơ hồ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_ambiguous_signal<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-040
   * Chuẩn hóa dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Chuẩn hóa biểu diễn dự báo môi trường để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_normalize_environment_forecast<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-14-041
   * Cập nhật trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Cập nhật trạng thái môi trường dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_environment_state<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'environment_state', updateData, context);
  }

  /**
   * @id AI-14-042
   * Cập nhật mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Cập nhật mối đe dọa gần dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_nearby_threat<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'nearby_threat', updateData, context);
  }

  /**
   * @id AI-14-043
   * Cập nhật khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Cập nhật khoảng cách mục tiêu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_target_distance<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'target_distance', updateData, context);
  }

  /**
   * @id AI-14-044
   * Cập nhật ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Cập nhật ý định người chơi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_player_intent<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'player_intent', updateData, context);
  }

  /**
   * @id AI-14-045
   * Cập nhật nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Cập nhật nhận định về thế giới dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_world_belief<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'world_belief', updateData, context);
  }

  /**
   * @id AI-14-046
   * Cập nhật quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Cập nhật quan sát cảm biến dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_sensor_observation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'sensor_observation', updateData, context);
  }

  /**
   * @id AI-14-047
   * Cập nhật cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Cập nhật cơ hội tiềm ẩn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_hidden_opportunity<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'hidden_opportunity', updateData, context);
  }

  /**
   * @id AI-14-048
   * Cập nhật độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Cập nhật độ tin cậy nhận thức dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_perception_confidence<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'perception_confidence', updateData, context);
  }

  /**
   * @id AI-14-049
   * Cập nhật tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Cập nhật tín hiệu mơ hồ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_ambiguous_signal<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'ambiguous_signal', updateData, context);
  }

  /**
   * @id AI-14-050
   * Cập nhật dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Cập nhật dự báo môi trường dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_update_environment_forecast<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'environment_forecast', updateData, context);
  }

  /**
   * @id AI-14-051
   * Đánh giá trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_environment_state<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-052
   * Đánh giá mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mối đe dọa gần.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_nearby_threat<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-053
   * Đánh giá khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khoảng cách mục tiêu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_target_distance<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-054
   * Đánh giá ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ý định người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_player_intent<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-055
   * Đánh giá nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của nhận định về thế giới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_world_belief<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-056
   * Đánh giá quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát cảm biến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_sensor_observation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-057
   * Đánh giá cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cơ hội tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_hidden_opportunity<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-058
   * Đánh giá độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy nhận thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_perception_confidence<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-059
   * Đánh giá tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu mơ hồ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_ambiguous_signal<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-060
   * Đánh giá dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dự báo môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_evaluate_environment_forecast<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-14-061
   * Truy xuất trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về trạng thái môi trường phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_environment_state<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'environment_state', query);
  }

  /**
   * @id AI-14-062
   * Truy xuất mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về mối đe dọa gần phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_nearby_threat<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'nearby_threat', query);
  }

  /**
   * @id AI-14-063
   * Truy xuất khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về khoảng cách mục tiêu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_target_distance<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'target_distance', query);
  }

  /**
   * @id AI-14-064
   * Truy xuất ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về ý định người chơi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_player_intent<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'player_intent', query);
  }

  /**
   * @id AI-14-065
   * Truy xuất nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về nhận định về thế giới phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_world_belief<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'world_belief', query);
  }

  /**
   * @id AI-14-066
   * Truy xuất quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về quan sát cảm biến phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_sensor_observation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'sensor_observation', query);
  }

  /**
   * @id AI-14-067
   * Truy xuất cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về cơ hội tiềm ẩn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_hidden_opportunity<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'hidden_opportunity', query);
  }

  /**
   * @id AI-14-068
   * Truy xuất độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về độ tin cậy nhận thức phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_perception_confidence<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'perception_confidence', query);
  }

  /**
   * @id AI-14-069
   * Truy xuất tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về tín hiệu mơ hồ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_ambiguous_signal<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'ambiguous_signal', query);
  }

  /**
   * @id AI-14-070
   * Truy xuất dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Tìm và trả về dự báo môi trường phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_retrieve_environment_forecast<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'environment_forecast', query);
  }

  /**
   * @id AI-14-071
   * Tuần tự hóa trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Chuyển trạng thái môi trường sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_environment_state<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-072
   * Tuần tự hóa mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Chuyển mối đe dọa gần sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_nearby_threat<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-073
   * Tuần tự hóa khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Chuyển khoảng cách mục tiêu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_target_distance<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-074
   * Tuần tự hóa ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Chuyển ý định người chơi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_player_intent<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-075
   * Tuần tự hóa nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Chuyển nhận định về thế giới sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_world_belief<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-076
   * Tuần tự hóa quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Chuyển quan sát cảm biến sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_sensor_observation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-077
   * Tuần tự hóa cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Chuyển cơ hội tiềm ẩn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_hidden_opportunity<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-078
   * Tuần tự hóa độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Chuyển độ tin cậy nhận thức sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_perception_confidence<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-079
   * Tuần tự hóa tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Chuyển tín hiệu mơ hồ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_ambiguous_signal<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-080
   * Tuần tự hóa dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Chuyển dự báo môi trường sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_serialize_environment_forecast<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-14-081
   * So sánh trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_environment_state<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-082
   * So sánh mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mối đe dọa gần.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_nearby_threat<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-083
   * So sánh khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của khoảng cách mục tiêu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_target_distance<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-084
   * So sánh ý định người chơi trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ý định người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_player_intent<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-085
   * So sánh nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của nhận định về thế giới.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_world_belief<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-086
   * So sánh quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát cảm biến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_sensor_observation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-087
   * So sánh cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của cơ hội tiềm ẩn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_hidden_opportunity<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-088
   * So sánh độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy nhận thức.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_perception_confidence<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-089
   * So sánh tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu mơ hồ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_ambiguous_signal<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-090
   * So sánh dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của dự báo môi trường.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public prc_compare_environment_forecast<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-14-091
   * Tinh gọn trạng thái môi trường trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần trạng thái môi trường lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_environment_state(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'environment_state', options);
  }

  /**
   * @id AI-14-092
   * Tinh gọn mối đe dọa gần trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần mối đe dọa gần lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_nearby_threat(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'nearby_threat', options);
  }

  /**
   * @id AI-14-093
   * Tinh gọn khoảng cách mục tiêu trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần khoảng cách mục tiêu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_target_distance(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'target_distance', options);
  }

  /**
   * @id AI-14-094
   * Tinh gọn ý định người chơi trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần ý định người chơi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_player_intent(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'player_intent', options);
  }

  /**
   * @id AI-14-095
   * Tinh gọn nhận định về thế giới trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần nhận định về thế giới lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_world_belief(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'world_belief', options);
  }

  /**
   * @id AI-14-096
   * Tinh gọn quan sát cảm biến trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần quan sát cảm biến lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_sensor_observation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'sensor_observation', options);
  }

  /**
   * @id AI-14-097
   * Tinh gọn cơ hội tiềm ẩn trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần cơ hội tiềm ẩn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_hidden_opportunity(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'hidden_opportunity', options);
  }

  /**
   * @id AI-14-098
   * Tinh gọn độ tin cậy nhận thức trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy nhận thức lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_perception_confidence(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'perception_confidence', options);
  }

  /**
   * @id AI-14-099
   * Tinh gọn tín hiệu mơ hồ trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần tín hiệu mơ hồ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_ambiguous_signal(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'ambiguous_signal', options);
  }

  /**
   * @id AI-14-100
   * Tinh gọn dự báo môi trường trong module nhận thức môi trường.
   * Mục đích: Loại bỏ hoặc gộp phần dự báo môi trường lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public prc_prune_environment_forecast(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'environment_forecast', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for PRC)
// ============================================================================

let defaultSubsystem: NPCPerceptionSubsystem | null = null;
function getSubsystem(): NPCPerceptionSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCPerceptionSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-14-001
 * Khởi tạo trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho trạng thái môi trường.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_environment_state<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_environment_state<T>(agentId, initialData, context);
}

/**
 * @id AI-14-002
 * Khởi tạo mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mối đe dọa gần.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_nearby_threat<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_nearby_threat<T>(agentId, initialData, context);
}

/**
 * @id AI-14-003
 * Khởi tạo khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho khoảng cách mục tiêu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_target_distance<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_target_distance<T>(agentId, initialData, context);
}

/**
 * @id AI-14-004
 * Khởi tạo ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ý định người chơi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_player_intent<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_player_intent<T>(agentId, initialData, context);
}

/**
 * @id AI-14-005
 * Khởi tạo nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho nhận định về thế giới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_world_belief<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_world_belief<T>(agentId, initialData, context);
}

/**
 * @id AI-14-006
 * Khởi tạo quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quan sát cảm biến.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_sensor_observation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_sensor_observation<T>(agentId, initialData, context);
}

/**
 * @id AI-14-007
 * Khởi tạo cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho cơ hội tiềm ẩn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_hidden_opportunity<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_hidden_opportunity<T>(agentId, initialData, context);
}

/**
 * @id AI-14-008
 * Khởi tạo độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy nhận thức.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_perception_confidence<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_perception_confidence<T>(agentId, initialData, context);
}

/**
 * @id AI-14-009
 * Khởi tạo tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu mơ hồ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_ambiguous_signal<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_ambiguous_signal<T>(agentId, initialData, context);
}

/**
 * @id AI-14-010
 * Khởi tạo dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho dự báo môi trường.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_initialize_environment_forecast<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_initialize_environment_forecast<T>(agentId, initialData, context);
}

/**
 * @id AI-14-011
 * Thu thập trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến trạng thái môi trường từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_environment_state<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_environment_state<T>(agentId, data, context);
}

/**
 * @id AI-14-012
 * Thu thập mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến mối đe dọa gần từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_nearby_threat<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_nearby_threat<T>(agentId, data, context);
}

/**
 * @id AI-14-013
 * Thu thập khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến khoảng cách mục tiêu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_target_distance<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_target_distance<T>(agentId, data, context);
}

/**
 * @id AI-14-014
 * Thu thập ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến ý định người chơi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_player_intent<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_player_intent<T>(agentId, data, context);
}

/**
 * @id AI-14-015
 * Thu thập nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến nhận định về thế giới từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_world_belief<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_world_belief<T>(agentId, data, context);
}

/**
 * @id AI-14-016
 * Thu thập quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến quan sát cảm biến từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_sensor_observation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_sensor_observation<T>(agentId, data, context);
}

/**
 * @id AI-14-017
 * Thu thập cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến cơ hội tiềm ẩn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_hidden_opportunity<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_hidden_opportunity<T>(agentId, data, context);
}

/**
 * @id AI-14-018
 * Thu thập độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy nhận thức từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_perception_confidence<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_perception_confidence<T>(agentId, data, context);
}

/**
 * @id AI-14-019
 * Thu thập tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu mơ hồ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_ambiguous_signal<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_ambiguous_signal<T>(agentId, data, context);
}

/**
 * @id AI-14-020
 * Thu thập dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Thu thập dữ liệu liên quan đến dự báo môi trường từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_capture_environment_forecast<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_capture_environment_forecast<T>(agentId, data, context);
}

/**
 * @id AI-14-021
 * Kiểm tra tính hợp lệ của trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của trạng thái môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_environment_state<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-022
 * Kiểm tra tính hợp lệ của mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mối đe dọa gần.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_nearby_threat<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-023
 * Kiểm tra tính hợp lệ của khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của khoảng cách mục tiêu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_target_distance<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-024
 * Kiểm tra tính hợp lệ của ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ý định người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_player_intent<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-025
 * Kiểm tra tính hợp lệ của nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của nhận định về thế giới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_world_belief<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-026
 * Kiểm tra tính hợp lệ của quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quan sát cảm biến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_sensor_observation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-027
 * Kiểm tra tính hợp lệ của cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của cơ hội tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_hidden_opportunity<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-028
 * Kiểm tra tính hợp lệ của độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy nhận thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_perception_confidence<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-029
 * Kiểm tra tính hợp lệ của tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu mơ hồ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_ambiguous_signal<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-030
 * Kiểm tra tính hợp lệ của dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của dự báo môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_validate_environment_forecast<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-14-031
 * Chuẩn hóa trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn trạng thái môi trường để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_environment_state<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-032
 * Chuẩn hóa mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn mối đe dọa gần để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_nearby_threat<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-033
 * Chuẩn hóa khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn khoảng cách mục tiêu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_target_distance<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-034
 * Chuẩn hóa ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn ý định người chơi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_player_intent<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-035
 * Chuẩn hóa nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn nhận định về thế giới để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_world_belief<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-036
 * Chuẩn hóa quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn quan sát cảm biến để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_sensor_observation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-037
 * Chuẩn hóa cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn cơ hội tiềm ẩn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_hidden_opportunity<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-038
 * Chuẩn hóa độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn độ tin cậy nhận thức để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_perception_confidence<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-039
 * Chuẩn hóa tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn tín hiệu mơ hồ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_ambiguous_signal<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-040
 * Chuẩn hóa dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Chuẩn hóa biểu diễn dự báo môi trường để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_normalize_environment_forecast<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-14-041
 * Cập nhật trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Cập nhật trạng thái môi trường dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_environment_state<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_environment_state<T>(agentId, updateData, context);
}

/**
 * @id AI-14-042
 * Cập nhật mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Cập nhật mối đe dọa gần dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_nearby_threat<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_nearby_threat<T>(agentId, updateData, context);
}

/**
 * @id AI-14-043
 * Cập nhật khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Cập nhật khoảng cách mục tiêu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_target_distance<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_target_distance<T>(agentId, updateData, context);
}

/**
 * @id AI-14-044
 * Cập nhật ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Cập nhật ý định người chơi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_player_intent<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_player_intent<T>(agentId, updateData, context);
}

/**
 * @id AI-14-045
 * Cập nhật nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Cập nhật nhận định về thế giới dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_world_belief<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_world_belief<T>(agentId, updateData, context);
}

/**
 * @id AI-14-046
 * Cập nhật quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Cập nhật quan sát cảm biến dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_sensor_observation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_sensor_observation<T>(agentId, updateData, context);
}

/**
 * @id AI-14-047
 * Cập nhật cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Cập nhật cơ hội tiềm ẩn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_hidden_opportunity<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_hidden_opportunity<T>(agentId, updateData, context);
}

/**
 * @id AI-14-048
 * Cập nhật độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Cập nhật độ tin cậy nhận thức dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_perception_confidence<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_perception_confidence<T>(agentId, updateData, context);
}

/**
 * @id AI-14-049
 * Cập nhật tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Cập nhật tín hiệu mơ hồ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_ambiguous_signal<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_ambiguous_signal<T>(agentId, updateData, context);
}

/**
 * @id AI-14-050
 * Cập nhật dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Cập nhật dự báo môi trường dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_update_environment_forecast<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).prc_update_environment_forecast<T>(agentId, updateData, context);
}

/**
 * @id AI-14-051
 * Đánh giá trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của trạng thái môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_environment_state<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-052
 * Đánh giá mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mối đe dọa gần.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_nearby_threat<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-053
 * Đánh giá khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của khoảng cách mục tiêu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_target_distance<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-054
 * Đánh giá ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ý định người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_player_intent<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-055
 * Đánh giá nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của nhận định về thế giới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_world_belief<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-056
 * Đánh giá quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quan sát cảm biến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_sensor_observation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-057
 * Đánh giá cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của cơ hội tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_hidden_opportunity<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-058
 * Đánh giá độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy nhận thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_perception_confidence<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-059
 * Đánh giá tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu mơ hồ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_ambiguous_signal<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-060
 * Đánh giá dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của dự báo môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_evaluate_environment_forecast<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-14-061
 * Truy xuất trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về trạng thái môi trường phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_environment_state<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_environment_state<T>(agentId, query);
}

/**
 * @id AI-14-062
 * Truy xuất mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về mối đe dọa gần phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_nearby_threat<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_nearby_threat<T>(agentId, query);
}

/**
 * @id AI-14-063
 * Truy xuất khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về khoảng cách mục tiêu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_target_distance<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_target_distance<T>(agentId, query);
}

/**
 * @id AI-14-064
 * Truy xuất ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về ý định người chơi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_player_intent<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_player_intent<T>(agentId, query);
}

/**
 * @id AI-14-065
 * Truy xuất nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về nhận định về thế giới phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_world_belief<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_world_belief<T>(agentId, query);
}

/**
 * @id AI-14-066
 * Truy xuất quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về quan sát cảm biến phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_sensor_observation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_sensor_observation<T>(agentId, query);
}

/**
 * @id AI-14-067
 * Truy xuất cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về cơ hội tiềm ẩn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_hidden_opportunity<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_hidden_opportunity<T>(agentId, query);
}

/**
 * @id AI-14-068
 * Truy xuất độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về độ tin cậy nhận thức phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_perception_confidence<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_perception_confidence<T>(agentId, query);
}

/**
 * @id AI-14-069
 * Truy xuất tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về tín hiệu mơ hồ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_ambiguous_signal<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_ambiguous_signal<T>(agentId, query);
}

/**
 * @id AI-14-070
 * Truy xuất dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Tìm và trả về dự báo môi trường phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_retrieve_environment_forecast<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCPerceptionSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).prc_retrieve_environment_forecast<T>(agentId, query);
}

/**
 * @id AI-14-071
 * Tuần tự hóa trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Chuyển trạng thái môi trường sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_environment_state<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-072
 * Tuần tự hóa mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Chuyển mối đe dọa gần sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_nearby_threat<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-073
 * Tuần tự hóa khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Chuyển khoảng cách mục tiêu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_target_distance<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-074
 * Tuần tự hóa ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Chuyển ý định người chơi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_player_intent<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-075
 * Tuần tự hóa nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Chuyển nhận định về thế giới sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_world_belief<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-076
 * Tuần tự hóa quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Chuyển quan sát cảm biến sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_sensor_observation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-077
 * Tuần tự hóa cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Chuyển cơ hội tiềm ẩn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_hidden_opportunity<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-078
 * Tuần tự hóa độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Chuyển độ tin cậy nhận thức sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_perception_confidence<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-079
 * Tuần tự hóa tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Chuyển tín hiệu mơ hồ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_ambiguous_signal<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-080
 * Tuần tự hóa dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Chuyển dự báo môi trường sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_serialize_environment_forecast<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-14-081
 * So sánh trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của trạng thái môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_environment_state<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-082
 * So sánh mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mối đe dọa gần.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_nearby_threat<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-083
 * So sánh khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của khoảng cách mục tiêu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_target_distance<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-084
 * So sánh ý định người chơi trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ý định người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_player_intent<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-085
 * So sánh nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của nhận định về thế giới.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_world_belief<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-086
 * So sánh quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của quan sát cảm biến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_sensor_observation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-087
 * So sánh cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của cơ hội tiềm ẩn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_hidden_opportunity<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-088
 * So sánh độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy nhận thức.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_perception_confidence<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-089
 * So sánh tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu mơ hồ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_ambiguous_signal<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-090
 * So sánh dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của dự báo môi trường.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function prc_compare_environment_forecast<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-14-091
 * Tinh gọn trạng thái môi trường trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần trạng thái môi trường lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_environment_state(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_environment_state(agentId, options);
}

/**
 * @id AI-14-092
 * Tinh gọn mối đe dọa gần trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần mối đe dọa gần lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_nearby_threat(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_nearby_threat(agentId, options);
}

/**
 * @id AI-14-093
 * Tinh gọn khoảng cách mục tiêu trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần khoảng cách mục tiêu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_target_distance(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_target_distance(agentId, options);
}

/**
 * @id AI-14-094
 * Tinh gọn ý định người chơi trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần ý định người chơi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_player_intent(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_player_intent(agentId, options);
}

/**
 * @id AI-14-095
 * Tinh gọn nhận định về thế giới trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần nhận định về thế giới lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_world_belief(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_world_belief(agentId, options);
}

/**
 * @id AI-14-096
 * Tinh gọn quan sát cảm biến trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần quan sát cảm biến lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_sensor_observation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_sensor_observation(agentId, options);
}

/**
 * @id AI-14-097
 * Tinh gọn cơ hội tiềm ẩn trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần cơ hội tiềm ẩn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_hidden_opportunity(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_hidden_opportunity(agentId, options);
}

/**
 * @id AI-14-098
 * Tinh gọn độ tin cậy nhận thức trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy nhận thức lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_perception_confidence(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_perception_confidence(agentId, options);
}

/**
 * @id AI-14-099
 * Tinh gọn tín hiệu mơ hồ trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần tín hiệu mơ hồ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_ambiguous_signal(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_ambiguous_signal(agentId, options);
}

/**
 * @id AI-14-100
 * Tinh gọn dự báo môi trường trong module nhận thức môi trường.
 * Mục đích: Loại bỏ hoặc gộp phần dự báo môi trường lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function prc_prune_environment_forecast(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCPerceptionSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).prc_prune_environment_forecast(agentId, options);
}

