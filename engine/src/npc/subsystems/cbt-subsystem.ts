/**
 * @file cbt-subsystem.ts
 * @module @aetheria/engine/npc
 * @description CBT — NPC và AI chiến đấu (100 hàm)
 * Triển khai đầy đủ 100 hàm chuẩn hóa cho module CBT.
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

export interface INPCCombatSubsystem {
  cbt_initialize_player_attack_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_dodge_direction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_counter_strategy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_attack_timing<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_defensive_stance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_combat_exchange<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_opponent_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_flanking_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_trap_location<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_initialize_combat_adaptation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_player_attack_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_dodge_direction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_counter_strategy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_attack_timing<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_defensive_stance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_combat_exchange<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_opponent_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_flanking_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_trap_location<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_capture_combat_adaptation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_validate_player_attack_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_dodge_direction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_counter_strategy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_attack_timing<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_defensive_stance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_combat_exchange<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_opponent_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_flanking_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_trap_location<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_validate_combat_adaptation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult;
  cbt_normalize_player_attack_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_dodge_direction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_counter_strategy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_attack_timing<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_defensive_stance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_combat_exchange<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_opponent_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_flanking_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_trap_location<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_normalize_combat_adaptation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T;
  cbt_update_player_attack_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_dodge_direction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_counter_strategy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_attack_timing<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_defensive_stance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_combat_exchange<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_opponent_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_flanking_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_trap_location<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_update_combat_adaptation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T>;
  cbt_evaluate_player_attack_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_dodge_direction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_counter_strategy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_attack_timing<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_defensive_stance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_combat_exchange<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_opponent_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_flanking_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_trap_location<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_evaluate_combat_adaptation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult;
  cbt_retrieve_player_attack_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_dodge_direction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_counter_strategy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_attack_timing<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_defensive_stance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_combat_exchange<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_opponent_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_flanking_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_trap_location<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_retrieve_combat_adaptation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[];
  cbt_serialize_player_attack_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_dodge_direction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_counter_strategy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_attack_timing<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_defensive_stance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_combat_exchange<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_opponent_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_flanking_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_trap_location<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_serialize_combat_adaptation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T>;
  cbt_compare_player_attack_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_dodge_direction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_counter_strategy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_attack_timing<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_defensive_stance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_combat_exchange<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_opponent_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_flanking_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_trap_location<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_compare_combat_adaptation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T>;
  cbt_prune_player_attack_pattern(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_dodge_direction(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_counter_strategy(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_attack_timing(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_defensive_stance(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_combat_exchange(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_opponent_skill(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_flanking_behavior(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_trap_location(agentId: string, options?: PruningOptions): PruningResult;
  cbt_prune_combat_adaptation(agentId: string, options?: PruningOptions): PruningResult;
}

// ============================================================================
// Subsystem Implementation Class
// ============================================================================

export class NPCCombatSubsystem extends NPCBaseSubsystem implements INPCCombatSubsystem {
  public readonly moduleCode = 'CBT';
  public readonly moduleTitle = 'CBT — NPC và AI chiến đấu (100 hàm)';

  constructor(repository?: NPCMemoryRepository) {
    super(repository);
  }

  /**
   * @id AI-20-001
   * Khởi tạo mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu tấn công người chơi.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_player_attack_pattern<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'player_attack_pattern', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-002
   * Khởi tạo hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hướng né đòn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_dodge_direction<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'dodge_direction', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-003
   * Khởi tạo chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chiến thuật khắc chế.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_counter_strategy<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'counter_strategy', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-004
   * Khởi tạo thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thời điểm tấn công.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_attack_timing<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'attack_timing', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-005
   * Khởi tạo tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tư thế phòng thủ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_defensive_stance<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'defensive_stance', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-006
   * Khởi tạo lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lượt giao chiến.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_combat_exchange<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'combat_exchange', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-007
   * Khởi tạo kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng đối thủ.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_opponent_skill<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'opponent_skill', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-008
   * Khởi tạo hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi đánh vòng sườn.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_flanking_behavior<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'flanking_behavior', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-009
   * Khởi tạo vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vị trí bẫy.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_trap_location<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trap_location', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-010
   * Khởi tạo thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thích nghi chiến đấu.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_initialize_combat_adaptation<T = Record<string, unknown>>(
    agentId: string,
    initialData?: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'combat_adaptation', (initialData ?? {}) as T, context);
  }

  /**
   * @id AI-20-011
   * Thu thập mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến mẫu tấn công người chơi từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_player_attack_pattern<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'player_attack_pattern', data, context);
  }

  /**
   * @id AI-20-012
   * Thu thập hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến hướng né đòn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_dodge_direction<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'dodge_direction', data, context);
  }

  /**
   * @id AI-20-013
   * Thu thập chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến chiến thuật khắc chế từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_counter_strategy<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'counter_strategy', data, context);
  }

  /**
   * @id AI-20-014
   * Thu thập thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến thời điểm tấn công từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_attack_timing<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'attack_timing', data, context);
  }

  /**
   * @id AI-20-015
   * Thu thập tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến tư thế phòng thủ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_defensive_stance<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'defensive_stance', data, context);
  }

  /**
   * @id AI-20-016
   * Thu thập lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến lượt giao chiến từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_combat_exchange<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'combat_exchange', data, context);
  }

  /**
   * @id AI-20-017
   * Thu thập kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng đối thủ từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_opponent_skill<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'opponent_skill', data, context);
  }

  /**
   * @id AI-20-018
   * Thu thập hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến hành vi đánh vòng sườn từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_flanking_behavior<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'flanking_behavior', data, context);
  }

  /**
   * @id AI-20-019
   * Thu thập vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến vị trí bẫy từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_trap_location<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'trap_location', data, context);
  }

  /**
   * @id AI-20-020
   * Thu thập thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Thu thập dữ liệu liên quan đến thích nghi chiến đấu từ runtime hoặc sự kiện.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_capture_combat_adaptation<T = Record<string, unknown>>(
    agentId: string,
    data: T,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.createRecord<T>(agentId, 'combat_adaptation', data, context);
  }

  /**
   * @id AI-20-021
   * Kiểm tra tính hợp lệ của mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu tấn công người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_player_attack_pattern<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-022
   * Kiểm tra tính hợp lệ của hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hướng né đòn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_dodge_direction<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-023
   * Kiểm tra tính hợp lệ của chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chiến thuật khắc chế.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_counter_strategy<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-024
   * Kiểm tra tính hợp lệ của thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thời điểm tấn công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_attack_timing<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-025
   * Kiểm tra tính hợp lệ của tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tư thế phòng thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_defensive_stance<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-026
   * Kiểm tra tính hợp lệ của lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lượt giao chiến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_combat_exchange<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-027
   * Kiểm tra tính hợp lệ của kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng đối thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_opponent_skill<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-028
   * Kiểm tra tính hợp lệ của hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi đánh vòng sườn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_flanking_behavior<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-029
   * Kiểm tra tính hợp lệ của vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vị trí bẫy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_trap_location<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-030
   * Kiểm tra tính hợp lệ của thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thích nghi chiến đấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_validate_combat_adaptation<T = unknown>(
    value: T,
    schema?: ValidationSchema<T>
  ): ValidationResult {
    return validateData<T>(value, schema);
  }

  /**
   * @id AI-20-031
   * Chuẩn hóa mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn mẫu tấn công người chơi để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_player_attack_pattern<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-032
   * Chuẩn hóa hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn hướng né đòn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_dodge_direction<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-033
   * Chuẩn hóa chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn chiến thuật khắc chế để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_counter_strategy<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-034
   * Chuẩn hóa thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn thời điểm tấn công để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_attack_timing<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-035
   * Chuẩn hóa tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn tư thế phòng thủ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_defensive_stance<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-036
   * Chuẩn hóa lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn lượt giao chiến để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_combat_exchange<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-037
   * Chuẩn hóa kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn kỹ năng đối thủ để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_opponent_skill<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-038
   * Chuẩn hóa hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn hành vi đánh vòng sườn để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_flanking_behavior<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-039
   * Chuẩn hóa vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn vị trí bẫy để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_trap_location<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-040
   * Chuẩn hóa thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Chuẩn hóa biểu diễn thích nghi chiến đấu để các module dùng thống nhất.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_normalize_combat_adaptation<T = Record<string, unknown>>(
    data: T,
    schema?: ValidationSchema<T>
  ): T {
    return normalizeData<T>(data, schema);
  }

  /**
   * @id AI-20-041
   * Cập nhật mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật mẫu tấn công người chơi dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_player_attack_pattern<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'player_attack_pattern', updateData, context);
  }

  /**
   * @id AI-20-042
   * Cập nhật hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật hướng né đòn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_dodge_direction<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'dodge_direction', updateData, context);
  }

  /**
   * @id AI-20-043
   * Cập nhật chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật chiến thuật khắc chế dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_counter_strategy<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'counter_strategy', updateData, context);
  }

  /**
   * @id AI-20-044
   * Cập nhật thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật thời điểm tấn công dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_attack_timing<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'attack_timing', updateData, context);
  }

  /**
   * @id AI-20-045
   * Cập nhật tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật tư thế phòng thủ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_defensive_stance<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'defensive_stance', updateData, context);
  }

  /**
   * @id AI-20-046
   * Cập nhật lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật lượt giao chiến dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_combat_exchange<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'combat_exchange', updateData, context);
  }

  /**
   * @id AI-20-047
   * Cập nhật kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật kỹ năng đối thủ dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_opponent_skill<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'opponent_skill', updateData, context);
  }

  /**
   * @id AI-20-048
   * Cập nhật hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật hành vi đánh vòng sườn dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_flanking_behavior<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'flanking_behavior', updateData, context);
  }

  /**
   * @id AI-20-049
   * Cập nhật vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật vị trí bẫy dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_trap_location<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'trap_location', updateData, context);
  }

  /**
   * @id AI-20-050
   * Cập nhật thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Cập nhật thích nghi chiến đấu dựa trên dữ liệu hoặc kết quả mới.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_update_combat_adaptation<T = Record<string, unknown>>(
    agentId: string,
    updateData: Partial<T>,
    context?: Record<string, unknown>
  ): NPCRecord<T> {
    return this.updateRecord<T>(agentId, 'combat_adaptation', updateData, context);
  }

  /**
   * @id AI-20-051
   * Đánh giá mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu tấn công người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_player_attack_pattern<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-052
   * Đánh giá hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hướng né đòn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_dodge_direction<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-053
   * Đánh giá chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chiến thuật khắc chế.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_counter_strategy<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-054
   * Đánh giá thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thời điểm tấn công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_attack_timing<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-055
   * Đánh giá tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tư thế phòng thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_defensive_stance<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-056
   * Đánh giá lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lượt giao chiến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_combat_exchange<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-057
   * Đánh giá kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng đối thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_opponent_skill<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-058
   * Đánh giá hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi đánh vòng sườn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_flanking_behavior<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-059
   * Đánh giá vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vị trí bẫy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_trap_location<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-060
   * Đánh giá thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thích nghi chiến đấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_evaluate_combat_adaptation<T = unknown>(
    value: T,
    criteria?: EvaluationCriteria
  ): EvaluationResult {
    return evaluateData<T>(value, criteria);
  }

  /**
   * @id AI-20-061
   * Truy xuất mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về mẫu tấn công người chơi phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_player_attack_pattern<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'player_attack_pattern', query);
  }

  /**
   * @id AI-20-062
   * Truy xuất hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về hướng né đòn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_dodge_direction<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'dodge_direction', query);
  }

  /**
   * @id AI-20-063
   * Truy xuất chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về chiến thuật khắc chế phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_counter_strategy<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'counter_strategy', query);
  }

  /**
   * @id AI-20-064
   * Truy xuất thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về thời điểm tấn công phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_attack_timing<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'attack_timing', query);
  }

  /**
   * @id AI-20-065
   * Truy xuất tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về tư thế phòng thủ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_defensive_stance<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'defensive_stance', query);
  }

  /**
   * @id AI-20-066
   * Truy xuất lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về lượt giao chiến phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_combat_exchange<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'combat_exchange', query);
  }

  /**
   * @id AI-20-067
   * Truy xuất kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về kỹ năng đối thủ phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_opponent_skill<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'opponent_skill', query);
  }

  /**
   * @id AI-20-068
   * Truy xuất hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về hành vi đánh vòng sườn phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_flanking_behavior<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'flanking_behavior', query);
  }

  /**
   * @id AI-20-069
   * Truy xuất vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về vị trí bẫy phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_trap_location<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'trap_location', query);
  }

  /**
   * @id AI-20-070
   * Truy xuất thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Tìm và trả về thích nghi chiến đấu phù hợp với truy vấn hoặc bối cảnh.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_retrieve_combat_adaptation<T = Record<string, unknown>>(
    agentId: string,
    query?: MemoryQuery
  ): NPCRecord<T>[] {
    return this.queryRecords<T>(agentId, 'combat_adaptation', query);
  }

  /**
   * @id AI-20-071
   * Tuần tự hóa mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Chuyển mẫu tấn công người chơi sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_player_attack_pattern<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-072
   * Tuần tự hóa hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Chuyển hướng né đòn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_dodge_direction<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-073
   * Tuần tự hóa chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Chuyển chiến thuật khắc chế sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_counter_strategy<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-074
   * Tuần tự hóa thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Chuyển thời điểm tấn công sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_attack_timing<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-075
   * Tuần tự hóa tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Chuyển tư thế phòng thủ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_defensive_stance<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-076
   * Tuần tự hóa lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Chuyển lượt giao chiến sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_combat_exchange<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-077
   * Tuần tự hóa kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Chuyển kỹ năng đối thủ sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_opponent_skill<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-078
   * Tuần tự hóa hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Chuyển hành vi đánh vòng sườn sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_flanking_behavior<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-079
   * Tuần tự hóa vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Chuyển vị trí bẫy sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_trap_location<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-080
   * Tuần tự hóa thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Chuyển thích nghi chiến đấu sang dạng có thể lưu hoặc truyền giữa hệ thống.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_serialize_combat_adaptation<T = Record<string, unknown>>(
    data: T,
    format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
  ): SerializedRecord<T> {
    return serializeData<T>(data, format);
  }

  /**
   * @id AI-20-081
   * So sánh mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu tấn công người chơi.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_player_attack_pattern<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-082
   * So sánh hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hướng né đòn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_dodge_direction<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-083
   * So sánh chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của chiến thuật khắc chế.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_counter_strategy<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-084
   * So sánh thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của thời điểm tấn công.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_attack_timing<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-085
   * So sánh tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của tư thế phòng thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_defensive_stance<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-086
   * So sánh lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của lượt giao chiến.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_combat_exchange<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-087
   * So sánh kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng đối thủ.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_opponent_skill<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-088
   * So sánh hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi đánh vòng sườn.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_flanking_behavior<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-089
   * So sánh vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của vị trí bẫy.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_trap_location<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-090
   * So sánh thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: So sánh hai giá trị hoặc phiên bản của thích nghi chiến đấu.
   * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
   */
  public cbt_compare_combat_adaptation<T = unknown>(
    a: T,
    b: T,
    options?: ComparisonOptions
  ): ComparisonResult<T> {
    return compareData<T>(a, b, options);
  }

  /**
   * @id AI-20-091
   * Tinh gọn mẫu tấn công người chơi trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần mẫu tấn công người chơi lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_player_attack_pattern(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'player_attack_pattern', options);
  }

  /**
   * @id AI-20-092
   * Tinh gọn hướng né đòn trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần hướng né đòn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_dodge_direction(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'dodge_direction', options);
  }

  /**
   * @id AI-20-093
   * Tinh gọn chiến thuật khắc chế trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần chiến thuật khắc chế lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_counter_strategy(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'counter_strategy', options);
  }

  /**
   * @id AI-20-094
   * Tinh gọn thời điểm tấn công trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần thời điểm tấn công lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_attack_timing(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'attack_timing', options);
  }

  /**
   * @id AI-20-095
   * Tinh gọn tư thế phòng thủ trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần tư thế phòng thủ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_defensive_stance(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'defensive_stance', options);
  }

  /**
   * @id AI-20-096
   * Tinh gọn lượt giao chiến trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần lượt giao chiến lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_combat_exchange(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'combat_exchange', options);
  }

  /**
   * @id AI-20-097
   * Tinh gọn kỹ năng đối thủ trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần kỹ năng đối thủ lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_opponent_skill(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'opponent_skill', options);
  }

  /**
   * @id AI-20-098
   * Tinh gọn hành vi đánh vòng sườn trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần hành vi đánh vòng sườn lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_flanking_behavior(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'flanking_behavior', options);
  }

  /**
   * @id AI-20-099
   * Tinh gọn vị trí bẫy trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần vị trí bẫy lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_trap_location(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'trap_location', options);
  }

  /**
   * @id AI-20-100
   * Tinh gọn thích nghi chiến đấu trong module npc và ai chiến đấu.
   * Mục đích: Loại bỏ hoặc gộp phần thích nghi chiến đấu lỗi thời, dư thừa hoặc ít giá trị.
   * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
   */
  public cbt_prune_combat_adaptation(
    agentId: string,
    options?: PruningOptions
  ): PruningResult {
    return this.pruneRecords(agentId, 'combat_adaptation', options);
  }

}

// ============================================================================
// Standalone Functions (100 Functional Endpoints for CBT)
// ============================================================================

let defaultSubsystem: NPCCombatSubsystem | null = null;
function getSubsystem(): NPCCombatSubsystem {
  if (!defaultSubsystem) {
    defaultSubsystem = new NPCCombatSubsystem();
  }
  return defaultSubsystem;
}

/**
 * @id AI-20-001
 * Khởi tạo mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho mẫu tấn công người chơi.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_player_attack_pattern<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_player_attack_pattern<T>(agentId, initialData, context);
}

/**
 * @id AI-20-002
 * Khởi tạo hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hướng né đòn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_dodge_direction<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_dodge_direction<T>(agentId, initialData, context);
}

/**
 * @id AI-20-003
 * Khởi tạo chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho chiến thuật khắc chế.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_counter_strategy<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_counter_strategy<T>(agentId, initialData, context);
}

/**
 * @id AI-20-004
 * Khởi tạo thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thời điểm tấn công.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_attack_timing<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_attack_timing<T>(agentId, initialData, context);
}

/**
 * @id AI-20-005
 * Khởi tạo tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho tư thế phòng thủ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_defensive_stance<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_defensive_stance<T>(agentId, initialData, context);
}

/**
 * @id AI-20-006
 * Khởi tạo lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho lượt giao chiến.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_combat_exchange<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_combat_exchange<T>(agentId, initialData, context);
}

/**
 * @id AI-20-007
 * Khởi tạo kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho kỹ năng đối thủ.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_opponent_skill<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_opponent_skill<T>(agentId, initialData, context);
}

/**
 * @id AI-20-008
 * Khởi tạo hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho hành vi đánh vòng sườn.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_flanking_behavior<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_flanking_behavior<T>(agentId, initialData, context);
}

/**
 * @id AI-20-009
 * Khởi tạo vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho vị trí bẫy.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_trap_location<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_trap_location<T>(agentId, initialData, context);
}

/**
 * @id AI-20-010
 * Khởi tạo thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Tạo giá trị hoặc cấu trúc ban đầu cho thích nghi chiến đấu.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_initialize_combat_adaptation<T = Record<string, unknown>>(
  agentId: string,
  initialData?: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_initialize_combat_adaptation<T>(agentId, initialData, context);
}

/**
 * @id AI-20-011
 * Thu thập mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến mẫu tấn công người chơi từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_player_attack_pattern<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_player_attack_pattern<T>(agentId, data, context);
}

/**
 * @id AI-20-012
 * Thu thập hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến hướng né đòn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_dodge_direction<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_dodge_direction<T>(agentId, data, context);
}

/**
 * @id AI-20-013
 * Thu thập chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến chiến thuật khắc chế từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_counter_strategy<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_counter_strategy<T>(agentId, data, context);
}

/**
 * @id AI-20-014
 * Thu thập thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến thời điểm tấn công từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_attack_timing<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_attack_timing<T>(agentId, data, context);
}

/**
 * @id AI-20-015
 * Thu thập tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến tư thế phòng thủ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_defensive_stance<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_defensive_stance<T>(agentId, data, context);
}

/**
 * @id AI-20-016
 * Thu thập lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến lượt giao chiến từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_combat_exchange<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_combat_exchange<T>(agentId, data, context);
}

/**
 * @id AI-20-017
 * Thu thập kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến kỹ năng đối thủ từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_opponent_skill<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_opponent_skill<T>(agentId, data, context);
}

/**
 * @id AI-20-018
 * Thu thập hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến hành vi đánh vòng sườn từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_flanking_behavior<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_flanking_behavior<T>(agentId, data, context);
}

/**
 * @id AI-20-019
 * Thu thập vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến vị trí bẫy từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_trap_location<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_trap_location<T>(agentId, data, context);
}

/**
 * @id AI-20-020
 * Thu thập thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Thu thập dữ liệu liên quan đến thích nghi chiến đấu từ runtime hoặc sự kiện.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_capture_combat_adaptation<T = Record<string, unknown>>(
  agentId: string,
  data: T,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_capture_combat_adaptation<T>(agentId, data, context);
}

/**
 * @id AI-20-021
 * Kiểm tra tính hợp lệ của mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của mẫu tấn công người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_player_attack_pattern<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-022
 * Kiểm tra tính hợp lệ của hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hướng né đòn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_dodge_direction<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-023
 * Kiểm tra tính hợp lệ của chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của chiến thuật khắc chế.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_counter_strategy<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-024
 * Kiểm tra tính hợp lệ của thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thời điểm tấn công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_attack_timing<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-025
 * Kiểm tra tính hợp lệ của tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của tư thế phòng thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_defensive_stance<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-026
 * Kiểm tra tính hợp lệ của lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của lượt giao chiến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_combat_exchange<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-027
 * Kiểm tra tính hợp lệ của kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của kỹ năng đối thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_opponent_skill<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-028
 * Kiểm tra tính hợp lệ của hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của hành vi đánh vòng sườn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_flanking_behavior<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-029
 * Kiểm tra tính hợp lệ của vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của vị trí bẫy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_trap_location<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-030
 * Kiểm tra tính hợp lệ của thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Kiểm tra kiểu dữ liệu, miền giá trị và tính nhất quán của thích nghi chiến đấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_validate_combat_adaptation<T = unknown>(
  value: T,
  schema?: ValidationSchema<T>
): ValidationResult {
  return validateData<T>(value, schema);
}

/**
 * @id AI-20-031
 * Chuẩn hóa mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn mẫu tấn công người chơi để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_player_attack_pattern<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-032
 * Chuẩn hóa hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn hướng né đòn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_dodge_direction<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-033
 * Chuẩn hóa chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn chiến thuật khắc chế để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_counter_strategy<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-034
 * Chuẩn hóa thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn thời điểm tấn công để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_attack_timing<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-035
 * Chuẩn hóa tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn tư thế phòng thủ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_defensive_stance<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-036
 * Chuẩn hóa lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn lượt giao chiến để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_combat_exchange<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-037
 * Chuẩn hóa kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn kỹ năng đối thủ để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_opponent_skill<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-038
 * Chuẩn hóa hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn hành vi đánh vòng sườn để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_flanking_behavior<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-039
 * Chuẩn hóa vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn vị trí bẫy để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_trap_location<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-040
 * Chuẩn hóa thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Chuẩn hóa biểu diễn thích nghi chiến đấu để các module dùng thống nhất.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_normalize_combat_adaptation<T = Record<string, unknown>>(
  data: T,
  schema?: ValidationSchema<T>
): T {
  return normalizeData<T>(data, schema);
}

/**
 * @id AI-20-041
 * Cập nhật mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật mẫu tấn công người chơi dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_player_attack_pattern<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_player_attack_pattern<T>(agentId, updateData, context);
}

/**
 * @id AI-20-042
 * Cập nhật hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật hướng né đòn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_dodge_direction<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_dodge_direction<T>(agentId, updateData, context);
}

/**
 * @id AI-20-043
 * Cập nhật chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật chiến thuật khắc chế dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_counter_strategy<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_counter_strategy<T>(agentId, updateData, context);
}

/**
 * @id AI-20-044
 * Cập nhật thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật thời điểm tấn công dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_attack_timing<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_attack_timing<T>(agentId, updateData, context);
}

/**
 * @id AI-20-045
 * Cập nhật tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật tư thế phòng thủ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_defensive_stance<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_defensive_stance<T>(agentId, updateData, context);
}

/**
 * @id AI-20-046
 * Cập nhật lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật lượt giao chiến dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_combat_exchange<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_combat_exchange<T>(agentId, updateData, context);
}

/**
 * @id AI-20-047
 * Cập nhật kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật kỹ năng đối thủ dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_opponent_skill<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_opponent_skill<T>(agentId, updateData, context);
}

/**
 * @id AI-20-048
 * Cập nhật hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật hành vi đánh vòng sườn dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_flanking_behavior<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_flanking_behavior<T>(agentId, updateData, context);
}

/**
 * @id AI-20-049
 * Cập nhật vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật vị trí bẫy dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_trap_location<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_trap_location<T>(agentId, updateData, context);
}

/**
 * @id AI-20-050
 * Cập nhật thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Cập nhật thích nghi chiến đấu dựa trên dữ liệu hoặc kết quả mới.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_update_combat_adaptation<T = Record<string, unknown>>(
  agentId: string,
  updateData: Partial<T>,
  context?: Record<string, unknown>,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T> {
  return (subsystem || getSubsystem()).cbt_update_combat_adaptation<T>(agentId, updateData, context);
}

/**
 * @id AI-20-051
 * Đánh giá mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của mẫu tấn công người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_player_attack_pattern<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-052
 * Đánh giá hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hướng né đòn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_dodge_direction<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-053
 * Đánh giá chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của chiến thuật khắc chế.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_counter_strategy<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-054
 * Đánh giá thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thời điểm tấn công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_attack_timing<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-055
 * Đánh giá tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của tư thế phòng thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_defensive_stance<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-056
 * Đánh giá lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của lượt giao chiến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_combat_exchange<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-057
 * Đánh giá kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của kỹ năng đối thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_opponent_skill<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-058
 * Đánh giá hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của hành vi đánh vòng sườn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_flanking_behavior<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-059
 * Đánh giá vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của vị trí bẫy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_trap_location<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-060
 * Đánh giá thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Đánh giá chất lượng, mức độ hoặc hiệu quả của thích nghi chiến đấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_evaluate_combat_adaptation<T = unknown>(
  value: T,
  criteria?: EvaluationCriteria
): EvaluationResult {
  return evaluateData<T>(value, criteria);
}

/**
 * @id AI-20-061
 * Truy xuất mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về mẫu tấn công người chơi phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_player_attack_pattern<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_player_attack_pattern<T>(agentId, query);
}

/**
 * @id AI-20-062
 * Truy xuất hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về hướng né đòn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_dodge_direction<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_dodge_direction<T>(agentId, query);
}

/**
 * @id AI-20-063
 * Truy xuất chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về chiến thuật khắc chế phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_counter_strategy<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_counter_strategy<T>(agentId, query);
}

/**
 * @id AI-20-064
 * Truy xuất thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về thời điểm tấn công phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_attack_timing<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_attack_timing<T>(agentId, query);
}

/**
 * @id AI-20-065
 * Truy xuất tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về tư thế phòng thủ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_defensive_stance<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_defensive_stance<T>(agentId, query);
}

/**
 * @id AI-20-066
 * Truy xuất lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về lượt giao chiến phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_combat_exchange<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_combat_exchange<T>(agentId, query);
}

/**
 * @id AI-20-067
 * Truy xuất kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về kỹ năng đối thủ phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_opponent_skill<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_opponent_skill<T>(agentId, query);
}

/**
 * @id AI-20-068
 * Truy xuất hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về hành vi đánh vòng sườn phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_flanking_behavior<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_flanking_behavior<T>(agentId, query);
}

/**
 * @id AI-20-069
 * Truy xuất vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về vị trí bẫy phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_trap_location<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_trap_location<T>(agentId, query);
}

/**
 * @id AI-20-070
 * Truy xuất thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Tìm và trả về thích nghi chiến đấu phù hợp với truy vấn hoặc bối cảnh.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_retrieve_combat_adaptation<T = Record<string, unknown>>(
  agentId: string,
  query?: MemoryQuery,
  subsystem?: NPCCombatSubsystem
): NPCRecord<T>[] {
  return (subsystem || getSubsystem()).cbt_retrieve_combat_adaptation<T>(agentId, query);
}

/**
 * @id AI-20-071
 * Tuần tự hóa mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Chuyển mẫu tấn công người chơi sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_player_attack_pattern<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-072
 * Tuần tự hóa hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Chuyển hướng né đòn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_dodge_direction<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-073
 * Tuần tự hóa chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Chuyển chiến thuật khắc chế sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_counter_strategy<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-074
 * Tuần tự hóa thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Chuyển thời điểm tấn công sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_attack_timing<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-075
 * Tuần tự hóa tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Chuyển tư thế phòng thủ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_defensive_stance<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-076
 * Tuần tự hóa lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Chuyển lượt giao chiến sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_combat_exchange<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-077
 * Tuần tự hóa kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Chuyển kỹ năng đối thủ sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_opponent_skill<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-078
 * Tuần tự hóa hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Chuyển hành vi đánh vòng sườn sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_flanking_behavior<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-079
 * Tuần tự hóa vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Chuyển vị trí bẫy sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_trap_location<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-080
 * Tuần tự hóa thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Chuyển thích nghi chiến đấu sang dạng có thể lưu hoặc truyền giữa hệ thống.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_serialize_combat_adaptation<T = Record<string, unknown>>(
  data: T,
  format: 'json' | 'binary' | 'blob' | 'custom' = 'json'
): SerializedRecord<T> {
  return serializeData<T>(data, format);
}

/**
 * @id AI-20-081
 * So sánh mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của mẫu tấn công người chơi.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_player_attack_pattern<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-082
 * So sánh hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hướng né đòn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_dodge_direction<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-083
 * So sánh chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của chiến thuật khắc chế.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_counter_strategy<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-084
 * So sánh thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của thời điểm tấn công.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_attack_timing<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-085
 * So sánh tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của tư thế phòng thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_defensive_stance<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-086
 * So sánh lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của lượt giao chiến.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_combat_exchange<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-087
 * So sánh kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của kỹ năng đối thủ.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_opponent_skill<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-088
 * So sánh hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của hành vi đánh vòng sườn.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_flanking_behavior<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-089
 * So sánh vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của vị trí bẫy.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_trap_location<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-090
 * So sánh thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: So sánh hai giá trị hoặc phiên bản của thích nghi chiến đấu.
 * Input: giá trị, schema, truy vấn hoặc hai bản ghi; Output: kết quả kiểm tra, điểm đánh giá hoặc bản ghi phù hợp.
 */
export function cbt_compare_combat_adaptation<T = unknown>(
  a: T,
  b: T,
  options?: ComparisonOptions
): ComparisonResult<T> {
  return compareData<T>(a, b, options);
}

/**
 * @id AI-20-091
 * Tinh gọn mẫu tấn công người chơi trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần mẫu tấn công người chơi lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_player_attack_pattern(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_player_attack_pattern(agentId, options);
}

/**
 * @id AI-20-092
 * Tinh gọn hướng né đòn trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần hướng né đòn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_dodge_direction(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_dodge_direction(agentId, options);
}

/**
 * @id AI-20-093
 * Tinh gọn chiến thuật khắc chế trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần chiến thuật khắc chế lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_counter_strategy(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_counter_strategy(agentId, options);
}

/**
 * @id AI-20-094
 * Tinh gọn thời điểm tấn công trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần thời điểm tấn công lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_attack_timing(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_attack_timing(agentId, options);
}

/**
 * @id AI-20-095
 * Tinh gọn tư thế phòng thủ trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần tư thế phòng thủ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_defensive_stance(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_defensive_stance(agentId, options);
}

/**
 * @id AI-20-096
 * Tinh gọn lượt giao chiến trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần lượt giao chiến lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_combat_exchange(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_combat_exchange(agentId, options);
}

/**
 * @id AI-20-097
 * Tinh gọn kỹ năng đối thủ trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần kỹ năng đối thủ lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_opponent_skill(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_opponent_skill(agentId, options);
}

/**
 * @id AI-20-098
 * Tinh gọn hành vi đánh vòng sườn trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần hành vi đánh vòng sườn lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_flanking_behavior(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_flanking_behavior(agentId, options);
}

/**
 * @id AI-20-099
 * Tinh gọn vị trí bẫy trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần vị trí bẫy lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_trap_location(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_trap_location(agentId, options);
}

/**
 * @id AI-20-100
 * Tinh gọn thích nghi chiến đấu trong module npc và ai chiến đấu.
 * Mục đích: Loại bỏ hoặc gộp phần thích nghi chiến đấu lỗi thời, dư thừa hoặc ít giá trị.
 * Input: agent_id, dữ liệu/bối cảnh; Output: trạng thái mới hoặc kết quả thao tác.
 */
export function cbt_prune_combat_adaptation(
  agentId: string,
  options?: PruningOptions,
  subsystem?: NPCCombatSubsystem
): PruningResult {
  return (subsystem || getSubsystem()).cbt_prune_combat_adaptation(agentId, options);
}

