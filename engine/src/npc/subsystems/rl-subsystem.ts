/**
 * @file rl-subsystem.ts
 * @module @aetheria/engine/npc
 * @description RL — Học tăng cường (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module RL.
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

export interface INPCReinforcementLearningSubsystem {
  rl_initialize_reward_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_penalty_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_state_value<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_action_value<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_policy_parameter<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_exploration_choice<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_discounted_return<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_learning_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_policy_evaluation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_initialize_reward_model<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_reward_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_penalty_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_state_value<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_action_value<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_policy_parameter<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_exploration_choice<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_discounted_return<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_learning_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_policy_evaluation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_capture_reward_model<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  rl_validate_reward_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_penalty_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_state_value<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_action_value<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_policy_parameter<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_exploration_choice<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_discounted_return<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_learning_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_policy_evaluation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_validate_reward_model<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  rl_normalize_reward_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_penalty_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_state_value<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_action_value<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_policy_parameter<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_exploration_choice<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_discounted_return<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_learning_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_policy_evaluation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_normalize_reward_model<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  rl_update_reward_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_penalty_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_state_value<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_action_value<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_policy_parameter<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_exploration_choice<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_discounted_return<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_learning_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_policy_evaluation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_update_reward_model<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  rl_evaluate_reward_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_penalty_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_state_value<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_action_value<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_policy_parameter<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_exploration_choice<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_discounted_return<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_learning_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_policy_evaluation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_evaluate_reward_model<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  rl_retrieve_reward_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_penalty_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_state_value<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_action_value<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_policy_parameter<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_exploration_choice<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_discounted_return<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_learning_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_policy_evaluation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_retrieve_reward_model<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  rl_serialize_reward_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_penalty_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_state_value<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_action_value<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_policy_parameter<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_exploration_choice<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_discounted_return<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_learning_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_policy_evaluation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_serialize_reward_model<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  rl_compare_reward_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_penalty_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_state_value<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_action_value<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_policy_parameter<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_exploration_choice<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_discounted_return<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_learning_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_policy_evaluation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_compare_reward_model<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  rl_prune_reward_signal(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_penalty_signal(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_state_value(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_action_value(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_policy_parameter(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_exploration_choice(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_discounted_return(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_learning_episode(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_policy_evaluation(agentId: string, options?: PruningOptions): PruningResult;
  rl_prune_reward_model(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCReinforcementLearningSubsystem extends NPCBaseSubsystem implements INPCReinforcementLearningSubsystem {
  public readonly moduleCode = 'RL';
  public readonly moduleTitle = 'RL — Học tăng cường (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-07-001
   * Khởi tạo tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu thưởng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_reward_signal<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_signal', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-002
   * Khởi tạo tín hiệu phạt trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu phạt.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_penalty_signal<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'penalty_signal', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-003
   * Khởi tạo giá trị trạng thái trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giá trị trạng thái.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_state_value<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'state_value', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-004
   * Khởi tạo giá trị hành động trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giá trị hành động.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_action_value<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_value', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-005
   * Khởi tạo tham số chính sách trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tham số chính sách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_policy_parameter<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_parameter', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-006
   * Khởi tạo lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lựa chọn khám phá.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_exploration_choice<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'exploration_choice', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-007
   * Khởi tạo tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tổng thưởng chiết khấu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_discounted_return<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'discounted_return', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-008
   * Khởi tạo phiên học trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên học.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_learning_episode<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_episode', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-009
   * Khởi tạo đánh giá chính sách trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đánh giá chính sách.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_policy_evaluation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_evaluation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-010
   * Khởi tạo mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mô hình phần thưởng.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_initialize_reward_model<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_model', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-07-011
   * Thu thập tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu thưởng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_reward_signal<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_signal', data, context);
  }

  /**
   * @id AI-07-012
   * Thu thập tín hiệu phạt trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu phạt từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_penalty_signal<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'penalty_signal', data, context);
  }

  /**
   * @id AI-07-013
   * Thu thập giá trị trạng thái trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến giá trị trạng thái từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_state_value<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'state_value', data, context);
  }

  /**
   * @id AI-07-014
   * Thu thập giá trị hành động trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến giá trị hành động từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_action_value<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'action_value', data, context);
  }

  /**
   * @id AI-07-015
   * Thu thập tham số chính sách trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến tham số chính sách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_policy_parameter<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_parameter', data, context);
  }

  /**
   * @id AI-07-016
   * Thu thập lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến lựa chọn khám phá từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_exploration_choice<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'exploration_choice', data, context);
  }

  /**
   * @id AI-07-017
   * Thu thập tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến tổng thưởng chiết khấu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_discounted_return<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'discounted_return', data, context);
  }

  /**
   * @id AI-07-018
   * Thu thập phiên học trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến phiên học từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_learning_episode<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'learning_episode', data, context);
  }

  /**
   * @id AI-07-019
   * Thu thập đánh giá chính sách trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến đánh giá chính sách từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_policy_evaluation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'policy_evaluation', data, context);
  }

  /**
   * @id AI-07-020
   * Thu thập mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Thu thập dữ liệu liên quan đến mô hình phần thưởng từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_capture_reward_model<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'reward_model', data, context);
  }

  /**
   * @id AI-07-021
   * Kiểm tra tính hợp lệ của tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_reward_signal<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-022
   * Kiểm tra tính hợp lệ của tín hiệu phạt trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu phạt.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_penalty_signal<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-023
   * Kiểm tra tính hợp lệ của giá trị trạng thái trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giá trị trạng thái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_state_value<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-024
   * Kiểm tra tính hợp lệ của giá trị hành động trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giá trị hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_action_value<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-025
   * Kiểm tra tính hợp lệ của tham số chính sách trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tham số chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_policy_parameter<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-026
   * Kiểm tra tính hợp lệ của lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lựa chọn khám phá.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_exploration_choice<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-027
   * Kiểm tra tính hợp lệ của tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tổng thưởng chiết khấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_discounted_return<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-028
   * Kiểm tra tính hợp lệ của phiên học trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_learning_episode<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-029
   * Kiểm tra tính hợp lệ của đánh giá chính sách trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đánh giá chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_policy_evaluation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-030
   * Kiểm tra tính hợp lệ của mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mô hình phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_validate_reward_model<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-07-031
   * Chuẩn hóa tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn tín hiệu thưởng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_reward_signal<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-032
   * Chuẩn hóa tín hiệu phạt trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn tín hiệu phạt để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_penalty_signal<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-033
   * Chuẩn hóa giá trị trạng thái trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn giá trị trạng thái để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_state_value<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-034
   * Chuẩn hóa giá trị hành động trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn giá trị hành động để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_action_value<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-035
   * Chuẩn hóa tham số chính sách trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn tham số chính sách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_policy_parameter<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-036
   * Chuẩn hóa lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn lựa chọn khám phá để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_exploration_choice<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-037
   * Chuẩn hóa tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn tổng thưởng chiết khấu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_discounted_return<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-038
   * Chuẩn hóa phiên học trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn phiên học để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_learning_episode<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-039
   * Chuẩn hóa đánh giá chính sách trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn đánh giá chính sách để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_policy_evaluation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-040
   * Chuẩn hóa mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Chuẩn hóa biểu diễn mô hình phần thưởng để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_normalize_reward_model<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-07-041
   * Cập nhật tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Cập nhật tín hiệu thưởng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_reward_signal<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'reward_signal', updateData, context);
  }

  /**
   * @id AI-07-042
   * Cập nhật tín hiệu phạt trong module học tăng cường.
   * Mục đích: Cập nhật tín hiệu phạt dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_penalty_signal<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'penalty_signal', updateData, context);
  }

  /**
   * @id AI-07-043
   * Cập nhật giá trị trạng thái trong module học tăng cường.
   * Mục đích: Cập nhật giá trị trạng thái dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_state_value<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'state_value', updateData, context);
  }

  /**
   * @id AI-07-044
   * Cập nhật giá trị hành động trong module học tăng cường.
   * Mục đích: Cập nhật giá trị hành động dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_action_value<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'action_value', updateData, context);
  }

  /**
   * @id AI-07-045
   * Cập nhật tham số chính sách trong module học tăng cường.
   * Mục đích: Cập nhật tham số chính sách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_policy_parameter<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'policy_parameter', updateData, context);
  }

  /**
   * @id AI-07-046
   * Cập nhật lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Cập nhật lựa chọn khám phá dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_exploration_choice<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'exploration_choice', updateData, context);
  }

  /**
   * @id AI-07-047
   * Cập nhật tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Cập nhật tổng thưởng chiết khấu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_discounted_return<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'discounted_return', updateData, context);
  }

  /**
   * @id AI-07-048
   * Cập nhật phiên học trong module học tăng cường.
   * Mục đích: Cập nhật phiên học dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_learning_episode<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'learning_episode', updateData, context);
  }

  /**
   * @id AI-07-049
   * Cập nhật đánh giá chính sách trong module học tăng cường.
   * Mục đích: Cập nhật đánh giá chính sách dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_policy_evaluation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'policy_evaluation', updateData, context);
  }

  /**
   * @id AI-07-050
   * Cập nhật mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Cập nhật mô hình phần thưởng dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_update_reward_model<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'reward_model', updateData, context);
  }

  /**
   * @id AI-07-051
   * Đánh giá tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_reward_signal<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-052
   * Đánh giá tín hiệu phạt trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu phạt.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_penalty_signal<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-053
   * Đánh giá giá trị trạng thái trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giá trị trạng thái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_state_value<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-054
   * Đánh giá giá trị hành động trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giá trị hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_action_value<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-055
   * Đánh giá tham số chính sách trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tham số chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_policy_parameter<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-056
   * Đánh giá lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lựa chọn khám phá.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_exploration_choice<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-057
   * Đánh giá tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tổng thưởng chiết khấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_discounted_return<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-058
   * Đánh giá phiên học trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_learning_episode<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-059
   * Đánh giá đánh giá chính sách trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đánh giá chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_policy_evaluation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-060
   * Đánh giá mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mô hình phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_evaluate_reward_model<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-07-061
   * Truy xuất tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Tìm và trả về tín hiệu thưởng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_reward_signal<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'reward_signal', query);
  }

  /**
   * @id AI-07-062
   * Truy xuất tín hiệu phạt trong module học tăng cường.
   * Mục đích: Tìm và trả về tín hiệu phạt phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_penalty_signal<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'penalty_signal', query);
  }

  /**
   * @id AI-07-063
   * Truy xuất giá trị trạng thái trong module học tăng cường.
   * Mục đích: Tìm và trả về giá trị trạng thái phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_state_value<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'state_value', query);
  }

  /**
   * @id AI-07-064
   * Truy xuất giá trị hành động trong module học tăng cường.
   * Mục đích: Tìm và trả về giá trị hành động phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_action_value<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'action_value', query);
  }

  /**
   * @id AI-07-065
   * Truy xuất tham số chính sách trong module học tăng cường.
   * Mục đích: Tìm và trả về tham số chính sách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_policy_parameter<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'policy_parameter', query);
  }

  /**
   * @id AI-07-066
   * Truy xuất lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Tìm và trả về lựa chọn khám phá phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_exploration_choice<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'exploration_choice', query);
  }

  /**
   * @id AI-07-067
   * Truy xuất tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Tìm và trả về tổng thưởng chiết khấu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_discounted_return<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'discounted_return', query);
  }

  /**
   * @id AI-07-068
   * Truy xuất phiên học trong module học tăng cường.
   * Mục đích: Tìm và trả về phiên học phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_learning_episode<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'learning_episode', query);
  }

  /**
   * @id AI-07-069
   * Truy xuất đánh giá chính sách trong module học tăng cường.
   * Mục đích: Tìm và trả về đánh giá chính sách phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_policy_evaluation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'policy_evaluation', query);
  }

  /**
   * @id AI-07-070
   * Truy xuất mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Tìm và trả về mô hình phần thưởng phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_retrieve_reward_model<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'reward_model', query);
  }

  /**
   * @id AI-07-071
   * Tuần tự hóa tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Chuyển tín hiệu thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_reward_signal<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-072
   * Tuần tự hóa tín hiệu phạt trong module học tăng cường.
   * Mục đích: Chuyển tín hiệu phạt sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_penalty_signal<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-073
   * Tuần tự hóa giá trị trạng thái trong module học tăng cường.
   * Mục đích: Chuyển giá trị trạng thái sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_state_value<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-074
   * Tuần tự hóa giá trị hành động trong module học tăng cường.
   * Mục đích: Chuyển giá trị hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_action_value<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-075
   * Tuần tự hóa tham số chính sách trong module học tăng cường.
   * Mục đích: Chuyển tham số chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_policy_parameter<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-076
   * Tuần tự hóa lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Chuyển lựa chọn khám phá sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_exploration_choice<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-077
   * Tuần tự hóa tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Chuyển tổng thưởng chiết khấu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_discounted_return<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-078
   * Tuần tự hóa phiên học trong module học tăng cường.
   * Mục đích: Chuyển phiên học sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_learning_episode<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-079
   * Tuần tự hóa đánh giá chính sách trong module học tăng cường.
   * Mục đích: Chuyển đánh giá chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_policy_evaluation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-080
   * Tuần tự hóa mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Chuyển mô hình phần thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_serialize_reward_model<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-07-081
   * So sánh tín hiệu thưởng trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_reward_signal<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-082
   * So sánh tín hiệu phạt trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu phạt.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_penalty_signal<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-083
   * So sánh giá trị trạng thái trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của giá trị trạng thái.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_state_value<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-084
   * So sánh giá trị hành động trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của giá trị hành động.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_action_value<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-085
   * So sánh tham số chính sách trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tham số chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_policy_parameter<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-086
   * So sánh lựa chọn khám phá trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lựa chọn khám phá.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_exploration_choice<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-087
   * So sánh tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tổng thưởng chiết khấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_discounted_return<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-088
   * So sánh phiên học trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên học.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_learning_episode<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-089
   * So sánh đánh giá chính sách trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của đánh giá chính sách.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_policy_evaluation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-090
   * So sánh mô hình phần thưởng trong module học tăng cường.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mô hình phần thưởng.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public rl_compare_reward_model<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-07-091
   * Tinh gọn tín hiệu thưởng trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần tín hiệu thưởng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_reward_signal(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'reward_signal', options);
  }

  /**
   * @id AI-07-092
   * Tinh gọn tín hiệu phạt trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần tín hiệu phạt lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_penalty_signal(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'penalty_signal', options);
  }

  /**
   * @id AI-07-093
   * Tinh gọn giá trị trạng thái trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần giá trị trạng thái lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_state_value(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'state_value', options);
  }

  /**
   * @id AI-07-094
   * Tinh gọn giá trị hành động trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần giá trị hành động lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_action_value(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'action_value', options);
  }

  /**
   * @id AI-07-095
   * Tinh gọn tham số chính sách trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần tham số chính sách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_policy_parameter(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'policy_parameter', options);
  }

  /**
   * @id AI-07-096
   * Tinh gọn lựa chọn khám phá trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần lựa chọn khám phá lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_exploration_choice(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'exploration_choice', options);
  }

  /**
   * @id AI-07-097
   * Tinh gọn tổng thưởng chiết khấu trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần tổng thưởng chiết khấu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_discounted_return(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'discounted_return', options);
  }

  /**
   * @id AI-07-098
   * Tinh gọn phiên học trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần phiên học lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_learning_episode(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'learning_episode', options);
  }

  /**
   * @id AI-07-099
   * Tinh gọn đánh giá chính sách trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần đánh giá chính sách lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_policy_evaluation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'policy_evaluation', options);
  }

  /**
   * @id AI-07-100
   * Tinh gọn mô hình phần thưởng trong module học tăng cường.
   * Mục đích: Loại bỏ hoặc gộp phần mô hình phần thưởng lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public rl_prune_reward_model(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'reward_model', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for RL)
// ============================================================================

let defaultSubsystem: NPCReinforcementLearningSubsystem | null = null;
function getSubsystem(): NPCReinforcementLearningSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCReinforcementLearningSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-07-001
 * Khởi tạo tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu thưởng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_reward_signal<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_reward_signal<T>(agentId, initialData, context);
}

/**
 * @id AI-07-002
 * Khởi tạo tín hiệu phạt trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tín hiệu phạt.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_penalty_signal<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_penalty_signal<T>(agentId, initialData, context);
}

/**
 * @id AI-07-003
 * Khởi tạo giá trị trạng thái trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giá trị trạng thái.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_state_value<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_state_value<T>(agentId, initialData, context);
}

/**
 * @id AI-07-004
 * Khởi tạo giá trị hành động trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho giá trị hành động.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_action_value<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_action_value<T>(agentId, initialData, context);
}

/**
 * @id AI-07-005
 * Khởi tạo tham số chính sách trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tham số chính sách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_policy_parameter<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_policy_parameter<T>(agentId, initialData, context);
}

/**
 * @id AI-07-006
 * Khởi tạo lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lựa chọn khám phá.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_exploration_choice<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_exploration_choice<T>(agentId, initialData, context);
}

/**
 * @id AI-07-007
 * Khởi tạo tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tổng thưởng chiết khấu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_discounted_return<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_discounted_return<T>(agentId, initialData, context);
}

/**
 * @id AI-07-008
 * Khởi tạo phiên học trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho phiên học.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_learning_episode<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_learning_episode<T>(agentId, initialData, context);
}

/**
 * @id AI-07-009
 * Khởi tạo đánh giá chính sách trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho đánh giá chính sách.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_policy_evaluation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_policy_evaluation<T>(agentId, initialData, context);
}

/**
 * @id AI-07-010
 * Khởi tạo mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mô hình phần thưởng.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_initialize_reward_model<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_initialize_reward_model<T>(agentId, initialData, context);
}

/**
 * @id AI-07-011
 * Thu thập tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu thưởng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_reward_signal<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_reward_signal<T>(agentId, data, context);
}

/**
 * @id AI-07-012
 * Thu thập tín hiệu phạt trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến tín hiệu phạt từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_penalty_signal<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_penalty_signal<T>(agentId, data, context);
}

/**
 * @id AI-07-013
 * Thu thập giá trị trạng thái trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến giá trị trạng thái từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_state_value<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_state_value<T>(agentId, data, context);
}

/**
 * @id AI-07-014
 * Thu thập giá trị hành động trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến giá trị hành động từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_action_value<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_action_value<T>(agentId, data, context);
}

/**
 * @id AI-07-015
 * Thu thập tham số chính sách trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến tham số chính sách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_policy_parameter<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_policy_parameter<T>(agentId, data, context);
}

/**
 * @id AI-07-016
 * Thu thập lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến lựa chọn khám phá từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_exploration_choice<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_exploration_choice<T>(agentId, data, context);
}

/**
 * @id AI-07-017
 * Thu thập tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến tổng thưởng chiết khấu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_discounted_return<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_discounted_return<T>(agentId, data, context);
}

/**
 * @id AI-07-018
 * Thu thập phiên học trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến phiên học từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_learning_episode<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_learning_episode<T>(agentId, data, context);
}

/**
 * @id AI-07-019
 * Thu thập đánh giá chính sách trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến đánh giá chính sách từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_policy_evaluation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_policy_evaluation<T>(agentId, data, context);
}

/**
 * @id AI-07-020
 * Thu thập mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Thu thập dữ liệu liên quan đến mô hình phần thưởng từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_capture_reward_model<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_capture_reward_model<T>(agentId, data, context);
}

/**
 * @id AI-07-021
 * Kiểm tra tính hợp lệ của tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_reward_signal<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-022
 * Kiểm tra tính hợp lệ của tín hiệu phạt trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tín hiệu phạt.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_penalty_signal<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-023
 * Kiểm tra tính hợp lệ của giá trị trạng thái trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giá trị trạng thái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_state_value<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-024
 * Kiểm tra tính hợp lệ của giá trị hành động trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của giá trị hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_action_value<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-025
 * Kiểm tra tính hợp lệ của tham số chính sách trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tham số chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_policy_parameter<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-026
 * Kiểm tra tính hợp lệ của lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lựa chọn khám phá.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_exploration_choice<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-027
 * Kiểm tra tính hợp lệ của tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tổng thưởng chiết khấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_discounted_return<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-028
 * Kiểm tra tính hợp lệ của phiên học trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của phiên học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_learning_episode<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-029
 * Kiểm tra tính hợp lệ của đánh giá chính sách trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của đánh giá chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_policy_evaluation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-030
 * Kiểm tra tính hợp lệ của mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mô hình phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_validate_reward_model<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-07-031
 * Chuẩn hóa tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn tín hiệu thưởng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_reward_signal<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-032
 * Chuẩn hóa tín hiệu phạt trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn tín hiệu phạt để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_penalty_signal<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-033
 * Chuẩn hóa giá trị trạng thái trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn giá trị trạng thái để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_state_value<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-034
 * Chuẩn hóa giá trị hành động trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn giá trị hành động để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_action_value<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-035
 * Chuẩn hóa tham số chính sách trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn tham số chính sách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_policy_parameter<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-036
 * Chuẩn hóa lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn lựa chọn khám phá để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_exploration_choice<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-037
 * Chuẩn hóa tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn tổng thưởng chiết khấu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_discounted_return<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-038
 * Chuẩn hóa phiên học trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn phiên học để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_learning_episode<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-039
 * Chuẩn hóa đánh giá chính sách trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn đánh giá chính sách để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_policy_evaluation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-040
 * Chuẩn hóa mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Chuẩn hóa biểu diễn mô hình phần thưởng để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_normalize_reward_model<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-07-041
 * Cập nhật tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Cập nhật tín hiệu thưởng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_reward_signal<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_reward_signal<T>(agentId, updateData, context);
}

/**
 * @id AI-07-042
 * Cập nhật tín hiệu phạt trong module học tăng cường.
 * Mục đích: Cập nhật tín hiệu phạt dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_penalty_signal<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_penalty_signal<T>(agentId, updateData, context);
}

/**
 * @id AI-07-043
 * Cập nhật giá trị trạng thái trong module học tăng cường.
 * Mục đích: Cập nhật giá trị trạng thái dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_state_value<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_state_value<T>(agentId, updateData, context);
}

/**
 * @id AI-07-044
 * Cập nhật giá trị hành động trong module học tăng cường.
 * Mục đích: Cập nhật giá trị hành động dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_action_value<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_action_value<T>(agentId, updateData, context);
}

/**
 * @id AI-07-045
 * Cập nhật tham số chính sách trong module học tăng cường.
 * Mục đích: Cập nhật tham số chính sách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_policy_parameter<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_policy_parameter<T>(agentId, updateData, context);
}

/**
 * @id AI-07-046
 * Cập nhật lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Cập nhật lựa chọn khám phá dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_exploration_choice<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_exploration_choice<T>(agentId, updateData, context);
}

/**
 * @id AI-07-047
 * Cập nhật tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Cập nhật tổng thưởng chiết khấu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_discounted_return<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_discounted_return<T>(agentId, updateData, context);
}

/**
 * @id AI-07-048
 * Cập nhật phiên học trong module học tăng cường.
 * Mục đích: Cập nhật phiên học dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_learning_episode<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_learning_episode<T>(agentId, updateData, context);
}

/**
 * @id AI-07-049
 * Cập nhật đánh giá chính sách trong module học tăng cường.
 * Mục đích: Cập nhật đánh giá chính sách dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_policy_evaluation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_policy_evaluation<T>(agentId, updateData, context);
}

/**
 * @id AI-07-050
 * Cập nhật mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Cập nhật mô hình phần thưởng dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_update_reward_model<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).rl_update_reward_model<T>(agentId, updateData, context);
}

/**
 * @id AI-07-051
 * Đánh giá tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_reward_signal<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-052
 * Đánh giá tín hiệu phạt trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tín hiệu phạt.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_penalty_signal<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-053
 * Đánh giá giá trị trạng thái trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giá trị trạng thái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_state_value<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-054
 * Đánh giá giá trị hành động trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của giá trị hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_action_value<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-055
 * Đánh giá tham số chính sách trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tham số chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_policy_parameter<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-056
 * Đánh giá lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lựa chọn khám phá.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_exploration_choice<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-057
 * Đánh giá tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tổng thưởng chiết khấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_discounted_return<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-058
 * Đánh giá phiên học trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của phiên học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_learning_episode<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-059
 * Đánh giá đánh giá chính sách trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của đánh giá chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_policy_evaluation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-060
 * Đánh giá mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mô hình phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_evaluate_reward_model<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-07-061
 * Truy xuất tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Tìm và trả về tín hiệu thưởng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_reward_signal<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_reward_signal<T>(agentId, query);
}

/**
 * @id AI-07-062
 * Truy xuất tín hiệu phạt trong module học tăng cường.
 * Mục đích: Tìm và trả về tín hiệu phạt phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_penalty_signal<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_penalty_signal<T>(agentId, query);
}

/**
 * @id AI-07-063
 * Truy xuất giá trị trạng thái trong module học tăng cường.
 * Mục đích: Tìm và trả về giá trị trạng thái phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_state_value<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_state_value<T>(agentId, query);
}

/**
 * @id AI-07-064
 * Truy xuất giá trị hành động trong module học tăng cường.
 * Mục đích: Tìm và trả về giá trị hành động phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_action_value<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_action_value<T>(agentId, query);
}

/**
 * @id AI-07-065
 * Truy xuất tham số chính sách trong module học tăng cường.
 * Mục đích: Tìm và trả về tham số chính sách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_policy_parameter<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_policy_parameter<T>(agentId, query);
}

/**
 * @id AI-07-066
 * Truy xuất lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Tìm và trả về lựa chọn khám phá phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_exploration_choice<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_exploration_choice<T>(agentId, query);
}

/**
 * @id AI-07-067
 * Truy xuất tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Tìm và trả về tổng thưởng chiết khấu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_discounted_return<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_discounted_return<T>(agentId, query);
}

/**
 * @id AI-07-068
 * Truy xuất phiên học trong module học tăng cường.
 * Mục đích: Tìm và trả về phiên học phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_learning_episode<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_learning_episode<T>(agentId, query);
}

/**
 * @id AI-07-069
 * Truy xuất đánh giá chính sách trong module học tăng cường.
 * Mục đích: Tìm và trả về đánh giá chính sách phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_policy_evaluation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_policy_evaluation<T>(agentId, query);
}

/**
 * @id AI-07-070
 * Truy xuất mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Tìm và trả về mô hình phần thưởng phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_retrieve_reward_model<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCReinforcementLearningSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).rl_retrieve_reward_model<T>(agentId, query);
}

/**
 * @id AI-07-071
 * Tuần tự hóa tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Chuyển tín hiệu thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_reward_signal<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-072
 * Tuần tự hóa tín hiệu phạt trong module học tăng cường.
 * Mục đích: Chuyển tín hiệu phạt sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_penalty_signal<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-073
 * Tuần tự hóa giá trị trạng thái trong module học tăng cường.
 * Mục đích: Chuyển giá trị trạng thái sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_state_value<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-074
 * Tuần tự hóa giá trị hành động trong module học tăng cường.
 * Mục đích: Chuyển giá trị hành động sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_action_value<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-075
 * Tuần tự hóa tham số chính sách trong module học tăng cường.
 * Mục đích: Chuyển tham số chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_policy_parameter<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-076
 * Tuần tự hóa lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Chuyển lựa chọn khám phá sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_exploration_choice<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-077
 * Tuần tự hóa tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Chuyển tổng thưởng chiết khấu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_discounted_return<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-078
 * Tuần tự hóa phiên học trong module học tăng cường.
 * Mục đích: Chuyển phiên học sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_learning_episode<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-079
 * Tuần tự hóa đánh giá chính sách trong module học tăng cường.
 * Mục đích: Chuyển đánh giá chính sách sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_policy_evaluation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-080
 * Tuần tự hóa mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Chuyển mô hình phần thưởng sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_serialize_reward_model<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-07-081
 * So sánh tín hiệu thưởng trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_reward_signal<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-082
 * So sánh tín hiệu phạt trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tín hiệu phạt.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_penalty_signal<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-083
 * So sánh giá trị trạng thái trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của giá trị trạng thái.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_state_value<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-084
 * So sánh giá trị hành động trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của giá trị hành động.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_action_value<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-085
 * So sánh tham số chính sách trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tham số chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_policy_parameter<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-086
 * So sánh lựa chọn khám phá trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lựa chọn khám phá.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_exploration_choice<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-087
 * So sánh tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tổng thưởng chiết khấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_discounted_return<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-088
 * So sánh phiên học trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của phiên học.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_learning_episode<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-089
 * So sánh đánh giá chính sách trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của đánh giá chính sách.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_policy_evaluation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-090
 * So sánh mô hình phần thưởng trong module học tăng cường.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mô hình phần thưởng.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function rl_compare_reward_model<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-07-091
 * Tinh gọn tín hiệu thưởng trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần tín hiệu thưởng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_reward_signal(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_reward_signal(agentId, options);
}

/**
 * @id AI-07-092
 * Tinh gọn tín hiệu phạt trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần tín hiệu phạt lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_penalty_signal(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_penalty_signal(agentId, options);
}

/**
 * @id AI-07-093
 * Tinh gọn giá trị trạng thái trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần giá trị trạng thái lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_state_value(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_state_value(agentId, options);
}

/**
 * @id AI-07-094
 * Tinh gọn giá trị hành động trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần giá trị hành động lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_action_value(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_action_value(agentId, options);
}

/**
 * @id AI-07-095
 * Tinh gọn tham số chính sách trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần tham số chính sách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_policy_parameter(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_policy_parameter(agentId, options);
}

/**
 * @id AI-07-096
 * Tinh gọn lựa chọn khám phá trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần lựa chọn khám phá lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_exploration_choice(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_exploration_choice(agentId, options);
}

/**
 * @id AI-07-097
 * Tinh gọn tổng thưởng chiết khấu trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần tổng thưởng chiết khấu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_discounted_return(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_discounted_return(agentId, options);
}

/**
 * @id AI-07-098
 * Tinh gọn phiên học trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần phiên học lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_learning_episode(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_learning_episode(agentId, options);
}

/**
 * @id AI-07-099
 * Tinh gọn đánh giá chính sách trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần đánh giá chính sách lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_policy_evaluation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_policy_evaluation(agentId, options);
}

/**
 * @id AI-07-100
 * Tinh gọn mô hình phần thưởng trong module học tăng cường.
 * Mục đích: Loại bỏ hoặc gộp phần mô hình phần thưởng lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function rl_prune_reward_model(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCReinforcementLearningSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).rl_prune_reward_model(agentId, options);
}

