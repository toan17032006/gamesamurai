/**
 * @file soc-subsystem.ts
 * @module @aetheria/engine/npc
 * @description SOC — Học tập xã hội và phối hợp nhóm (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module SOC.
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

export interface INPCSocialSubsystem {
  soc_initialize_peer_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_peer_strategy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_team_knowledge<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_demonstration_example<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_peer_reliability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_coordination_model<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_social_convention<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_imitated_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_social_information<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_initialize_shared_belief<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_peer_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_peer_strategy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_team_knowledge<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_demonstration_example<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_peer_reliability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_coordination_model<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_social_convention<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_imitated_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_social_information<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_capture_shared_belief<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  soc_validate_peer_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_peer_strategy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_team_knowledge<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_demonstration_example<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_peer_reliability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_coordination_model<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_social_convention<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_imitated_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_social_information<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_validate_shared_belief<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  soc_normalize_peer_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_peer_strategy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_team_knowledge<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_demonstration_example<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_peer_reliability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_coordination_model<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_social_convention<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_imitated_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_social_information<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_normalize_shared_belief<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  soc_update_peer_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_peer_strategy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_team_knowledge<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_demonstration_example<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_peer_reliability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_coordination_model<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_social_convention<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_imitated_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_social_information<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_update_shared_belief<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  soc_evaluate_peer_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_peer_strategy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_team_knowledge<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_demonstration_example<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_peer_reliability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_coordination_model<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_social_convention<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_imitated_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_social_information<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_evaluate_shared_belief<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  soc_retrieve_peer_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_peer_strategy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_team_knowledge<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_demonstration_example<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_peer_reliability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_coordination_model<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_social_convention<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_imitated_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_social_information<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_retrieve_shared_belief<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  soc_serialize_peer_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_peer_strategy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_team_knowledge<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_demonstration_example<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_peer_reliability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_coordination_model<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_social_convention<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_imitated_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_social_information<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_serialize_shared_belief<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  soc_compare_peer_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_peer_strategy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_team_knowledge<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_demonstration_example<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_peer_reliability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_coordination_model<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_social_convention<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_imitated_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_social_information<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_compare_shared_belief<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  soc_prune_peer_behavior(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_peer_strategy(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_team_knowledge(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_demonstration_example(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_peer_reliability(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_coordination_model(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_social_convention(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_imitated_behavior(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_social_information(agentId: string, options?: PruningOptions): PruningResult;
  soc_prune_shared_belief(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCSocialSubsystem extends NPCBaseSubsystem implements INPCSocialSubsystem {
  public readonly moduleCode = 'SOC';
  public readonly moduleTitle = 'SOC — Học tập xã hội và phối hợp nhóm (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-19-001
   * Khởi tạo hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi đồng đội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_peer_behavior<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_behavior', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-002
   * Khởi tạo chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chiến thuật đồng đội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_peer_strategy<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_strategy', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-003
   * Khởi tạo kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kiến thức nhóm.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_team_knowledge<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'team_knowledge', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-004
   * Khởi tạo ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ví dụ làm mẫu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_demonstration_example<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'demonstration_example', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-005
   * Khởi tạo độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy đồng đội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_peer_reliability<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_reliability', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-006
   * Khởi tạo mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mô hình phối hợp.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_coordination_model<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'coordination_model', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-007
   * Khởi tạo quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quy ước xã hội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_social_convention<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_convention', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-008
   * Khởi tạo hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi bắt chước.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_imitated_behavior<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'imitated_behavior', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-009
   * Khởi tạo thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thông tin xã hội.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_social_information<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_information', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-010
   * Khởi tạo niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho niềm tin chung.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_initialize_shared_belief<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'shared_belief', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-19-011
   * Thu thập hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến hành vi đồng đội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_peer_behavior<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_behavior', data, context);
  }

  /**
   * @id AI-19-012
   * Thu thập chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến chiến thuật đồng đội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_peer_strategy<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_strategy', data, context);
  }

  /**
   * @id AI-19-013
   * Thu thập kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến kiến thức nhóm từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_team_knowledge<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'team_knowledge', data, context);
  }

  /**
   * @id AI-19-014
   * Thu thập ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến ví dụ làm mẫu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_demonstration_example<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'demonstration_example', data, context);
  }

  /**
   * @id AI-19-015
   * Thu thập độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy đồng đội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_peer_reliability<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'peer_reliability', data, context);
  }

  /**
   * @id AI-19-016
   * Thu thập mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến mô hình phối hợp từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_coordination_model<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'coordination_model', data, context);
  }

  /**
   * @id AI-19-017
   * Thu thập quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến quy ước xã hội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_social_convention<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_convention', data, context);
  }

  /**
   * @id AI-19-018
   * Thu thập hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến hành vi bắt chước từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_imitated_behavior<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'imitated_behavior', data, context);
  }

  /**
   * @id AI-19-019
   * Thu thập thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến thông tin xã hội từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_social_information<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'social_information', data, context);
  }

  /**
   * @id AI-19-020
   * Thu thập niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Thu thập dữ liệu liên quan đến niềm tin chung từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_capture_shared_belief<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'shared_belief', data, context);
  }

  /**
   * @id AI-19-021
   * Kiểm tra tính hợp lệ của hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_peer_behavior<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-022
   * Kiểm tra tính hợp lệ của chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chiến thuật đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_peer_strategy<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-023
   * Kiểm tra tính hợp lệ của kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kiến thức nhóm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_team_knowledge<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-024
   * Kiểm tra tính hợp lệ của ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ví dụ làm mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_demonstration_example<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-025
   * Kiểm tra tính hợp lệ của độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_peer_reliability<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-026
   * Kiểm tra tính hợp lệ của mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mô hình phối hợp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_coordination_model<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-027
   * Kiểm tra tính hợp lệ của quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quy ước xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_social_convention<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-028
   * Kiểm tra tính hợp lệ của hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi bắt chước.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_imitated_behavior<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-029
   * Kiểm tra tính hợp lệ của thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thông tin xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_social_information<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-030
   * Kiểm tra tính hợp lệ của niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của niềm tin chung.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_validate_shared_belief<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-19-031
   * Chuẩn hóa hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn hành vi đồng đội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_peer_behavior<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-032
   * Chuẩn hóa chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn chiến thuật đồng đội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_peer_strategy<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-033
   * Chuẩn hóa kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn kiến thức nhóm để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_team_knowledge<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-034
   * Chuẩn hóa ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn ví dụ làm mẫu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_demonstration_example<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-035
   * Chuẩn hóa độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn độ tin cậy đồng đội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_peer_reliability<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-036
   * Chuẩn hóa mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn mô hình phối hợp để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_coordination_model<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-037
   * Chuẩn hóa quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn quy ước xã hội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_social_convention<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-038
   * Chuẩn hóa hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn hành vi bắt chước để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_imitated_behavior<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-039
   * Chuẩn hóa thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn thông tin xã hội để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_social_information<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-040
   * Chuẩn hóa niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuẩn hóa biểu diễn niềm tin chung để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_normalize_shared_belief<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-19-041
   * Cập nhật hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật hành vi đồng đội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_peer_behavior<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'peer_behavior', updateData, context);
  }

  /**
   * @id AI-19-042
   * Cập nhật chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật chiến thuật đồng đội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_peer_strategy<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'peer_strategy', updateData, context);
  }

  /**
   * @id AI-19-043
   * Cập nhật kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật kiến thức nhóm dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_team_knowledge<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'team_knowledge', updateData, context);
  }

  /**
   * @id AI-19-044
   * Cập nhật ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật ví dụ làm mẫu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_demonstration_example<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'demonstration_example', updateData, context);
  }

  /**
   * @id AI-19-045
   * Cập nhật độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật độ tin cậy đồng đội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_peer_reliability<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'peer_reliability', updateData, context);
  }

  /**
   * @id AI-19-046
   * Cập nhật mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật mô hình phối hợp dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_coordination_model<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'coordination_model', updateData, context);
  }

  /**
   * @id AI-19-047
   * Cập nhật quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật quy ước xã hội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_social_convention<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'social_convention', updateData, context);
  }

  /**
   * @id AI-19-048
   * Cập nhật hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật hành vi bắt chước dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_imitated_behavior<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'imitated_behavior', updateData, context);
  }

  /**
   * @id AI-19-049
   * Cập nhật thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật thông tin xã hội dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_social_information<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'social_information', updateData, context);
  }

  /**
   * @id AI-19-050
   * Cập nhật niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Cập nhật niềm tin chung dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_update_shared_belief<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'shared_belief', updateData, context);
  }

  /**
   * @id AI-19-051
   * Đánh giá hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_peer_behavior<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-052
   * Đánh giá chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chiến thuật đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_peer_strategy<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-053
   * Đánh giá kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kiến thức nhóm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_team_knowledge<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-054
   * Đánh giá ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ví dụ làm mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_demonstration_example<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-055
   * Đánh giá độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_peer_reliability<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-056
   * Đánh giá mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mô hình phối hợp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_coordination_model<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-057
   * Đánh giá quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quy ước xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_social_convention<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-058
   * Đánh giá hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi bắt chước.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_imitated_behavior<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-059
   * Đánh giá thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thông tin xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_social_information<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-060
   * Đánh giá niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của niềm tin chung.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_evaluate_shared_belief<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-19-061
   * Truy xuất hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về hành vi đồng đội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_peer_behavior<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'peer_behavior', query);
  }

  /**
   * @id AI-19-062
   * Truy xuất chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về chiến thuật đồng đội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_peer_strategy<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'peer_strategy', query);
  }

  /**
   * @id AI-19-063
   * Truy xuất kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về kiến thức nhóm phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_team_knowledge<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'team_knowledge', query);
  }

  /**
   * @id AI-19-064
   * Truy xuất ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về ví dụ làm mẫu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_demonstration_example<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'demonstration_example', query);
  }

  /**
   * @id AI-19-065
   * Truy xuất độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về độ tin cậy đồng đội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_peer_reliability<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'peer_reliability', query);
  }

  /**
   * @id AI-19-066
   * Truy xuất mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về mô hình phối hợp phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_coordination_model<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'coordination_model', query);
  }

  /**
   * @id AI-19-067
   * Truy xuất quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về quy ước xã hội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_social_convention<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'social_convention', query);
  }

  /**
   * @id AI-19-068
   * Truy xuất hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về hành vi bắt chước phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_imitated_behavior<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'imitated_behavior', query);
  }

  /**
   * @id AI-19-069
   * Truy xuất thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về thông tin xã hội phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_social_information<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'social_information', query);
  }

  /**
   * @id AI-19-070
   * Truy xuất niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Tìm và trả về niềm tin chung phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_retrieve_shared_belief<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'shared_belief', query);
  }

  /**
   * @id AI-19-071
   * Tuần tự hóa hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển hành vi đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_peer_behavior<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-072
   * Tuần tự hóa chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển chiến thuật đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_peer_strategy<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-073
   * Tuần tự hóa kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển kiến thức nhóm sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_team_knowledge<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-074
   * Tuần tự hóa ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển ví dụ làm mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_demonstration_example<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-075
   * Tuần tự hóa độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển độ tin cậy đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_peer_reliability<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-076
   * Tuần tự hóa mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển mô hình phối hợp sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_coordination_model<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-077
   * Tuần tự hóa quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển quy ước xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_social_convention<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-078
   * Tuần tự hóa hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển hành vi bắt chước sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_imitated_behavior<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-079
   * Tuần tự hóa thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển thông tin xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_social_information<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-080
   * Tuần tự hóa niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Chuyển niềm tin chung sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_serialize_shared_belief<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-19-081
   * So sánh hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_peer_behavior<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-082
   * So sánh chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chiến thuật đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_peer_strategy<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-083
   * So sánh kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kiến thức nhóm.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_team_knowledge<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-084
   * So sánh ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của ví dụ làm mẫu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_demonstration_example<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-085
   * So sánh độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy đồng đội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_peer_reliability<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-086
   * So sánh mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mô hình phối hợp.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_coordination_model<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-087
   * So sánh quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của quy ước xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_social_convention<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-088
   * So sánh hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi bắt chước.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_imitated_behavior<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-089
   * So sánh thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của thông tin xã hội.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_social_information<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-090
   * So sánh niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của niềm tin chung.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public soc_compare_shared_belief<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-19-091
   * Tinh gọn hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần hành vi đồng đội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_peer_behavior(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'peer_behavior', options);
  }

  /**
   * @id AI-19-092
   * Tinh gọn chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần chiến thuật đồng đội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_peer_strategy(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'peer_strategy', options);
  }

  /**
   * @id AI-19-093
   * Tinh gọn kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần kiến thức nhóm lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_team_knowledge(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'team_knowledge', options);
  }

  /**
   * @id AI-19-094
   * Tinh gọn ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần ví dụ làm mẫu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_demonstration_example(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'demonstration_example', options);
  }

  /**
   * @id AI-19-095
   * Tinh gọn độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy đồng đội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_peer_reliability(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'peer_reliability', options);
  }

  /**
   * @id AI-19-096
   * Tinh gọn mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần mô hình phối hợp lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_coordination_model(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'coordination_model', options);
  }

  /**
   * @id AI-19-097
   * Tinh gọn quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần quy ước xã hội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_social_convention(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'social_convention', options);
  }

  /**
   * @id AI-19-098
   * Tinh gọn hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần hành vi bắt chước lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_imitated_behavior(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'imitated_behavior', options);
  }

  /**
   * @id AI-19-099
   * Tinh gọn thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần thông tin xã hội lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_social_information(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'social_information', options);
  }

  /**
   * @id AI-19-100
   * Tinh gọn niềm tin chung trong module học tập xã hội và phối hợp nhóm.
   * Mục đích: Loại bỏ hoặc gộp phần niềm tin chung lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public soc_prune_shared_belief(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'shared_belief', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for SOC)
// ============================================================================

let defaultSubsystem: NPCSocialSubsystem | null = null;
function getSubsystem(): NPCSocialSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCSocialSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-19-001
 * Khởi tạo hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi đồng đội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_peer_behavior<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_peer_behavior<T>(agentId, initialData, context);
}

/**
 * @id AI-19-002
 * Khởi tạo chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chiến thuật đồng đội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_peer_strategy<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_peer_strategy<T>(agentId, initialData, context);
}

/**
 * @id AI-19-003
 * Khởi tạo kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kiến thức nhóm.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_team_knowledge<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_team_knowledge<T>(agentId, initialData, context);
}

/**
 * @id AI-19-004
 * Khởi tạo ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho ví dụ làm mẫu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_demonstration_example<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_demonstration_example<T>(agentId, initialData, context);
}

/**
 * @id AI-19-005
 * Khởi tạo độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho độ tin cậy đồng đội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_peer_reliability<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_peer_reliability<T>(agentId, initialData, context);
}

/**
 * @id AI-19-006
 * Khởi tạo mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mô hình phối hợp.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_coordination_model<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_coordination_model<T>(agentId, initialData, context);
}

/**
 * @id AI-19-007
 * Khởi tạo quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho quy ước xã hội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_social_convention<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_social_convention<T>(agentId, initialData, context);
}

/**
 * @id AI-19-008
 * Khởi tạo hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi bắt chước.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_imitated_behavior<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_imitated_behavior<T>(agentId, initialData, context);
}

/**
 * @id AI-19-009
 * Khởi tạo thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thông tin xã hội.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_social_information<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_social_information<T>(agentId, initialData, context);
}

/**
 * @id AI-19-010
 * Khởi tạo niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho niềm tin chung.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_initialize_shared_belief<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_initialize_shared_belief<T>(agentId, initialData, context);
}

/**
 * @id AI-19-011
 * Thu thập hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến hành vi đồng đội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_peer_behavior<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_peer_behavior<T>(agentId, data, context);
}

/**
 * @id AI-19-012
 * Thu thập chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến chiến thuật đồng đội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_peer_strategy<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_peer_strategy<T>(agentId, data, context);
}

/**
 * @id AI-19-013
 * Thu thập kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến kiến thức nhóm từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_team_knowledge<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_team_knowledge<T>(agentId, data, context);
}

/**
 * @id AI-19-014
 * Thu thập ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến ví dụ làm mẫu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_demonstration_example<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_demonstration_example<T>(agentId, data, context);
}

/**
 * @id AI-19-015
 * Thu thập độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến độ tin cậy đồng đội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_peer_reliability<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_peer_reliability<T>(agentId, data, context);
}

/**
 * @id AI-19-016
 * Thu thập mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến mô hình phối hợp từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_coordination_model<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_coordination_model<T>(agentId, data, context);
}

/**
 * @id AI-19-017
 * Thu thập quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến quy ước xã hội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_social_convention<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_social_convention<T>(agentId, data, context);
}

/**
 * @id AI-19-018
 * Thu thập hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến hành vi bắt chước từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_imitated_behavior<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_imitated_behavior<T>(agentId, data, context);
}

/**
 * @id AI-19-019
 * Thu thập thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến thông tin xã hội từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_social_information<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_social_information<T>(agentId, data, context);
}

/**
 * @id AI-19-020
 * Thu thập niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Thu thập dữ liệu liên quan đến niềm tin chung từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_capture_shared_belief<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_capture_shared_belief<T>(agentId, data, context);
}

/**
 * @id AI-19-021
 * Kiểm tra tính hợp lệ của hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_peer_behavior<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-022
 * Kiểm tra tính hợp lệ của chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chiến thuật đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_peer_strategy<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-023
 * Kiểm tra tính hợp lệ của kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kiến thức nhóm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_team_knowledge<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-024
 * Kiểm tra tính hợp lệ của ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của ví dụ làm mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_demonstration_example<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-025
 * Kiểm tra tính hợp lệ của độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của độ tin cậy đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_peer_reliability<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-026
 * Kiểm tra tính hợp lệ của mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mô hình phối hợp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_coordination_model<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-027
 * Kiểm tra tính hợp lệ của quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của quy ước xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_social_convention<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-028
 * Kiểm tra tính hợp lệ của hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi bắt chước.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_imitated_behavior<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-029
 * Kiểm tra tính hợp lệ của thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thông tin xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_social_information<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-030
 * Kiểm tra tính hợp lệ của niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của niềm tin chung.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_validate_shared_belief<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-19-031
 * Chuẩn hóa hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn hành vi đồng đội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_peer_behavior<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-032
 * Chuẩn hóa chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn chiến thuật đồng đội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_peer_strategy<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-033
 * Chuẩn hóa kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn kiến thức nhóm để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_team_knowledge<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-034
 * Chuẩn hóa ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn ví dụ làm mẫu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_demonstration_example<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-035
 * Chuẩn hóa độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn độ tin cậy đồng đội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_peer_reliability<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-036
 * Chuẩn hóa mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn mô hình phối hợp để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_coordination_model<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-037
 * Chuẩn hóa quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn quy ước xã hội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_social_convention<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-038
 * Chuẩn hóa hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn hành vi bắt chước để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_imitated_behavior<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-039
 * Chuẩn hóa thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn thông tin xã hội để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_social_information<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-040
 * Chuẩn hóa niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuẩn hóa biểu diễn niềm tin chung để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_normalize_shared_belief<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-19-041
 * Cập nhật hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật hành vi đồng đội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_peer_behavior<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_peer_behavior<T>(agentId, updateData, context);
}

/**
 * @id AI-19-042
 * Cập nhật chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật chiến thuật đồng đội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_peer_strategy<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_peer_strategy<T>(agentId, updateData, context);
}

/**
 * @id AI-19-043
 * Cập nhật kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật kiến thức nhóm dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_team_knowledge<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_team_knowledge<T>(agentId, updateData, context);
}

/**
 * @id AI-19-044
 * Cập nhật ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật ví dụ làm mẫu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_demonstration_example<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_demonstration_example<T>(agentId, updateData, context);
}

/**
 * @id AI-19-045
 * Cập nhật độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật độ tin cậy đồng đội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_peer_reliability<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_peer_reliability<T>(agentId, updateData, context);
}

/**
 * @id AI-19-046
 * Cập nhật mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật mô hình phối hợp dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_coordination_model<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_coordination_model<T>(agentId, updateData, context);
}

/**
 * @id AI-19-047
 * Cập nhật quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật quy ước xã hội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_social_convention<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_social_convention<T>(agentId, updateData, context);
}

/**
 * @id AI-19-048
 * Cập nhật hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật hành vi bắt chước dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_imitated_behavior<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_imitated_behavior<T>(agentId, updateData, context);
}

/**
 * @id AI-19-049
 * Cập nhật thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật thông tin xã hội dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_social_information<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_social_information<T>(agentId, updateData, context);
}

/**
 * @id AI-19-050
 * Cập nhật niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Cập nhật niềm tin chung dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_update_shared_belief<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).soc_update_shared_belief<T>(agentId, updateData, context);
}

/**
 * @id AI-19-051
 * Đánh giá hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_peer_behavior<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-052
 * Đánh giá chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chiến thuật đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_peer_strategy<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-053
 * Đánh giá kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kiến thức nhóm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_team_knowledge<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-054
 * Đánh giá ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của ví dụ làm mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_demonstration_example<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-055
 * Đánh giá độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của độ tin cậy đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_peer_reliability<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-056
 * Đánh giá mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mô hình phối hợp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_coordination_model<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-057
 * Đánh giá quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của quy ước xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_social_convention<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-058
 * Đánh giá hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi bắt chước.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_imitated_behavior<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-059
 * Đánh giá thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thông tin xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_social_information<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-060
 * Đánh giá niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của niềm tin chung.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_evaluate_shared_belief<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-19-061
 * Truy xuất hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về hành vi đồng đội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_peer_behavior<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_peer_behavior<T>(agentId, query);
}

/**
 * @id AI-19-062
 * Truy xuất chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về chiến thuật đồng đội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_peer_strategy<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_peer_strategy<T>(agentId, query);
}

/**
 * @id AI-19-063
 * Truy xuất kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về kiến thức nhóm phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_team_knowledge<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_team_knowledge<T>(agentId, query);
}

/**
 * @id AI-19-064
 * Truy xuất ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về ví dụ làm mẫu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_demonstration_example<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_demonstration_example<T>(agentId, query);
}

/**
 * @id AI-19-065
 * Truy xuất độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về độ tin cậy đồng đội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_peer_reliability<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_peer_reliability<T>(agentId, query);
}

/**
 * @id AI-19-066
 * Truy xuất mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về mô hình phối hợp phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_coordination_model<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_coordination_model<T>(agentId, query);
}

/**
 * @id AI-19-067
 * Truy xuất quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về quy ước xã hội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_social_convention<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_social_convention<T>(agentId, query);
}

/**
 * @id AI-19-068
 * Truy xuất hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về hành vi bắt chước phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_imitated_behavior<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_imitated_behavior<T>(agentId, query);
}

/**
 * @id AI-19-069
 * Truy xuất thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về thông tin xã hội phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_social_information<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_social_information<T>(agentId, query);
}

/**
 * @id AI-19-070
 * Truy xuất niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Tìm và trả về niềm tin chung phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_retrieve_shared_belief<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCSocialSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).soc_retrieve_shared_belief<T>(agentId, query);
}

/**
 * @id AI-19-071
 * Tuần tự hóa hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển hành vi đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_peer_behavior<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-072
 * Tuần tự hóa chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển chiến thuật đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_peer_strategy<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-073
 * Tuần tự hóa kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển kiến thức nhóm sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_team_knowledge<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-074
 * Tuần tự hóa ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển ví dụ làm mẫu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_demonstration_example<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-075
 * Tuần tự hóa độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển độ tin cậy đồng đội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_peer_reliability<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-076
 * Tuần tự hóa mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển mô hình phối hợp sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_coordination_model<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-077
 * Tuần tự hóa quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển quy ước xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_social_convention<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-078
 * Tuần tự hóa hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển hành vi bắt chước sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_imitated_behavior<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-079
 * Tuần tự hóa thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển thông tin xã hội sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_social_information<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-080
 * Tuần tự hóa niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Chuyển niềm tin chung sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_serialize_shared_belief<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-19-081
 * So sánh hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_peer_behavior<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-082
 * So sánh chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chiến thuật đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_peer_strategy<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-083
 * So sánh kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kiến thức nhóm.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_team_knowledge<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-084
 * So sánh ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của ví dụ làm mẫu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_demonstration_example<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-085
 * So sánh độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của độ tin cậy đồng đội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_peer_reliability<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-086
 * So sánh mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mô hình phối hợp.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_coordination_model<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-087
 * So sánh quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của quy ước xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_social_convention<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-088
 * So sánh hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi bắt chước.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_imitated_behavior<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-089
 * So sánh thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của thông tin xã hội.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_social_information<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-090
 * So sánh niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của niềm tin chung.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function soc_compare_shared_belief<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-19-091
 * Tinh gọn hành vi đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần hành vi đồng đội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_peer_behavior(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_peer_behavior(agentId, options);
}

/**
 * @id AI-19-092
 * Tinh gọn chiến thuật đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần chiến thuật đồng đội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_peer_strategy(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_peer_strategy(agentId, options);
}

/**
 * @id AI-19-093
 * Tinh gọn kiến thức nhóm trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần kiến thức nhóm lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_team_knowledge(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_team_knowledge(agentId, options);
}

/**
 * @id AI-19-094
 * Tinh gọn ví dụ làm mẫu trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần ví dụ làm mẫu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_demonstration_example(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_demonstration_example(agentId, options);
}

/**
 * @id AI-19-095
 * Tinh gọn độ tin cậy đồng đội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần độ tin cậy đồng đội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_peer_reliability(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_peer_reliability(agentId, options);
}

/**
 * @id AI-19-096
 * Tinh gọn mô hình phối hợp trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần mô hình phối hợp lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_coordination_model(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_coordination_model(agentId, options);
}

/**
 * @id AI-19-097
 * Tinh gọn quy ước xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần quy ước xã hội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_social_convention(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_social_convention(agentId, options);
}

/**
 * @id AI-19-098
 * Tinh gọn hành vi bắt chước trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần hành vi bắt chước lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_imitated_behavior(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_imitated_behavior(agentId, options);
}

/**
 * @id AI-19-099
 * Tinh gọn thông tin xã hội trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần thông tin xã hội lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_social_information(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_social_information(agentId, options);
}

/**
 * @id AI-19-100
 * Tinh gọn niềm tin chung trong module học tập xã hội và phối hợp nhóm.
 * Mục đích: Loại bỏ hoặc gộp phần niềm tin chung lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function soc_prune_shared_belief(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCSocialSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).soc_prune_shared_belief(agentId, options);
}

