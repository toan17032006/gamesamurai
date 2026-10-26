/**
 * @file npc-system.ts
 * @module @aetheria/engine/npc
 * @description Master NPC Memory & Learning System orchestrator implementing all 2,400 methods.
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
  SerializedRecord,
  NPCSystemConfig
} from './types.js';

import { NPCMemoryRepository } from './primitives.js';

import { NPCExperienceSubsystem } from './subsystems/exp-subsystem.js';
import { NPCShortTermMemorySubsystem } from './subsystems/stm-subsystem.js';
import { NPCLongTermMemorySubsystem } from './subsystems/ltm-subsystem.js';
import { NPCMemoryRetrievalSubsystem } from './subsystems/ret-subsystem.js';
import { NPCMetricsStatsSubsystem } from './subsystems/met-subsystem.js';
import { NPCOutcomeLearningSubsystem } from './subsystems/out-subsystem.js';
import { NPCReinforcementLearningSubsystem } from './subsystems/rl-subsystem.js';
import { NPCSupervisedLearningSubsystem } from './subsystems/sup-subsystem.js';
import { NPCUnsupervisedLearningSubsystem } from './subsystems/uns-subsystem.js';
import { NPCOnlineLearningSubsystem } from './subsystems/onl-subsystem.js';
import { NPCEmotionSubsystem } from './subsystems/emo-subsystem.js';
import { NPCPersonalitySubsystem } from './subsystems/per-subsystem.js';
import { NPCMotivationSubsystem } from './subsystems/mot-subsystem.js';
import { NPCPerceptionSubsystem } from './subsystems/prc-subsystem.js';
import { NPCReasoningSubsystem } from './subsystems/rsn-subsystem.js';
import { NPCPlanningSubsystem } from './subsystems/pln-subsystem.js';
import { NPCSkillsSubsystem } from './subsystems/skl-subsystem.js';
import { NPCRelationshipSubsystem } from './subsystems/rel-subsystem.js';
import { NPCSocialSubsystem } from './subsystems/soc-subsystem.js';
import { NPCCombatSubsystem } from './subsystems/cbt-subsystem.js';
import { NPCWorldSubsystem } from './subsystems/wrl-subsystem.js';
import { NPCEvaluationSubsystem } from './subsystems/eva-subsystem.js';
import { NPCPersistenceSubsystem } from './subsystems/pst-subsystem.js';
import { NPCGovernanceSubsystem } from './subsystems/gov-subsystem.js';

/** Defaults used when a caller does not provide NPC system configuration. */
const DEFAULT_NPC_SYSTEM_CONFIG: Required<NPCSystemConfig> = {
  maxMemoryPerAgent: 500,
  defaultConfidence: 1.0,
  autoPruneThreshold: 0.9,
  persistenceEnabled: false,
  debugLogging: false
};

export class NPCMemoryLearningSystem {
  public readonly repository: NPCMemoryRepository;
  public config: Readonly<Required<NPCSystemConfig>>;

  public readonly exp: NPCExperienceSubsystem;
  public readonly stm: NPCShortTermMemorySubsystem;
  public readonly ltm: NPCLongTermMemorySubsystem;
  public readonly ret: NPCMemoryRetrievalSubsystem;
  public readonly met: NPCMetricsStatsSubsystem;
  public readonly out: NPCOutcomeLearningSubsystem;
  public readonly rl: NPCReinforcementLearningSubsystem;
  public readonly sup: NPCSupervisedLearningSubsystem;
  public readonly uns: NPCUnsupervisedLearningSubsystem;
  public readonly onl: NPCOnlineLearningSubsystem;
  public readonly emo: NPCEmotionSubsystem;
  public readonly per: NPCPersonalitySubsystem;
  public readonly mot: NPCMotivationSubsystem;
  public readonly prc: NPCPerceptionSubsystem;
  public readonly rsn: NPCReasoningSubsystem;
  public readonly pln: NPCPlanningSubsystem;
  public readonly skl: NPCSkillsSubsystem;
  public readonly rel: NPCRelationshipSubsystem;
  public readonly soc: NPCSocialSubsystem;
  public readonly cbt: NPCCombatSubsystem;
  public readonly wrl: NPCWorldSubsystem;
  public readonly eva: NPCEvaluationSubsystem;
  public readonly pst: NPCPersistenceSubsystem;
  public readonly gov: NPCGovernanceSubsystem;

  constructor(config?: NPCSystemConfig, repository?: NPCMemoryRepository) {
    this.repository = repository || new NPCMemoryRepository();
    this.config = {
      ...DEFAULT_NPC_SYSTEM_CONFIG,
      ...(repository ? repository.getConfig() : {}),
      ...config
    };
    this.repository.setConfig(this.config);
    this.exp = new NPCExperienceSubsystem(this.repository);
    this.stm = new NPCShortTermMemorySubsystem(this.repository);
    this.ltm = new NPCLongTermMemorySubsystem(this.repository);
    this.ret = new NPCMemoryRetrievalSubsystem(this.repository);
    this.met = new NPCMetricsStatsSubsystem(this.repository);
    this.out = new NPCOutcomeLearningSubsystem(this.repository);
    this.rl = new NPCReinforcementLearningSubsystem(this.repository);
    this.sup = new NPCSupervisedLearningSubsystem(this.repository);
    this.uns = new NPCUnsupervisedLearningSubsystem(this.repository);
    this.onl = new NPCOnlineLearningSubsystem(this.repository);
    this.emo = new NPCEmotionSubsystem(this.repository);
    this.per = new NPCPersonalitySubsystem(this.repository);
    this.mot = new NPCMotivationSubsystem(this.repository);
    this.prc = new NPCPerceptionSubsystem(this.repository);
    this.rsn = new NPCReasoningSubsystem(this.repository);
    this.pln = new NPCPlanningSubsystem(this.repository);
    this.skl = new NPCSkillsSubsystem(this.repository);
    this.rel = new NPCRelationshipSubsystem(this.repository);
    this.soc = new NPCSocialSubsystem(this.repository);
    this.cbt = new NPCCombatSubsystem(this.repository);
    this.wrl = new NPCWorldSubsystem(this.repository);
    this.eva = new NPCEvaluationSubsystem(this.repository);
    this.pst = new NPCPersistenceSubsystem(this.repository);
    this.gov = new NPCGovernanceSubsystem(this.repository);
  }

  /** Returns a copy of the active system configuration. */
  public getConfig(): Readonly<Required<NPCSystemConfig>> {
    return { ...this.config };
  }

  /** Merges configuration changes into the system and its repository. */
  public updateConfig(config: NPCSystemConfig): Readonly<Required<NPCSystemConfig>> {
    this.config = { ...this.config, ...config };
    this.repository.setConfig(this.config);
    return this.getConfig();
  }

  /** Checks whether one agent is within its configured memory budget. */
  public checkMemoryBudget(agentId: string): {
    agentId: string;
    records: number;
    limit: number;
    withinBudget: boolean;
  } {
    const records = this.repository.count(agentId);
    const limit = Math.max(1, Math.floor(this.config.maxMemoryPerAgent));
    return { agentId, records, limit, withinBudget: records <= limit };
  }

  /** Prunes one agent's repository to the configured/default record limit. */
  public pruneAgentMemory(
    agentId: string,
    options?: { maxRecords?: number; maxAgeMs?: number; minConfidence?: number; preserveHighWeight?: boolean }
  ): PruningResult {
    return this.repository.pruneAgent(agentId, {
      maxRecords: options?.maxRecords ?? this.config.maxMemoryPerAgent,
      maxAgeMs: options?.maxAgeMs,
      minConfidence: options?.minConfidence,
      preserveHighWeight: options?.preserveHighWeight
    });
  }

  /** Applies the configured retention limit to every known agent. */
  public applyMemoryPolicy(): { agents: number; pruned: number; retained: number } {
    let pruned = 0;
    let retained = 0;
    const agentIds = this.repository.getAgentIds();
    for (const agentId of agentIds) {
      const result = this.pruneAgentMemory(agentId);
      pruned += result.prunedCount;
      retained += result.retainedCount;
    }
    return { agents: agentIds.length, pruned, retained };
  }

  public reset(): void {
    this.repository.clear();
  }

  public totalRecordCount(): number {
    return this.repository.count();
  }

  // ==========================================================================
  // Module EXP: EXP — Thu thập dữ liệu và trải nghiệm (100 hàm)
  // ==========================================================================

  public exp_initialize_experience<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_experience<T>(agentId, initialData, context);
  }
  public exp_initialize_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_observation<T>(agentId, initialData, context);
  }
  public exp_initialize_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_action<T>(agentId, initialData, context);
  }
  public exp_initialize_outcome<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_outcome<T>(agentId, initialData, context);
  }
  public exp_initialize_event<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_event<T>(agentId, initialData, context);
  }
  public exp_initialize_context<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_context<T>(agentId, initialData, context);
  }
  public exp_initialize_feature<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_feature<T>(agentId, initialData, context);
  }
  public exp_initialize_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_pattern<T>(agentId, initialData, context);
  }
  public exp_initialize_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_episode<T>(agentId, initialData, context);
  }
  public exp_initialize_feedback<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_initialize_feedback<T>(agentId, initialData, context);
  }
  public exp_capture_experience<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_experience<T>(agentId, data, context);
  }
  public exp_capture_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_observation<T>(agentId, data, context);
  }
  public exp_capture_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_action<T>(agentId, data, context);
  }
  public exp_capture_outcome<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_outcome<T>(agentId, data, context);
  }
  public exp_capture_event<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_event<T>(agentId, data, context);
  }
  public exp_capture_context<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_context<T>(agentId, data, context);
  }
  public exp_capture_feature<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_feature<T>(agentId, data, context);
  }
  public exp_capture_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_pattern<T>(agentId, data, context);
  }
  public exp_capture_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_episode<T>(agentId, data, context);
  }
  public exp_capture_feedback<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_capture_feedback<T>(agentId, data, context);
  }
  public exp_validate_experience<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_experience<T>(value, schema);
  }
  public exp_validate_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_observation<T>(value, schema);
  }
  public exp_validate_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_action<T>(value, schema);
  }
  public exp_validate_outcome<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_outcome<T>(value, schema);
  }
  public exp_validate_event<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_event<T>(value, schema);
  }
  public exp_validate_context<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_context<T>(value, schema);
  }
  public exp_validate_feature<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_feature<T>(value, schema);
  }
  public exp_validate_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_pattern<T>(value, schema);
  }
  public exp_validate_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_episode<T>(value, schema);
  }
  public exp_validate_feedback<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.exp.exp_validate_feedback<T>(value, schema);
  }
  public exp_normalize_experience<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_experience<T>(data, schema);
  }
  public exp_normalize_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_observation<T>(data, schema);
  }
  public exp_normalize_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_action<T>(data, schema);
  }
  public exp_normalize_outcome<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_outcome<T>(data, schema);
  }
  public exp_normalize_event<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_event<T>(data, schema);
  }
  public exp_normalize_context<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_context<T>(data, schema);
  }
  public exp_normalize_feature<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_feature<T>(data, schema);
  }
  public exp_normalize_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_pattern<T>(data, schema);
  }
  public exp_normalize_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_episode<T>(data, schema);
  }
  public exp_normalize_feedback<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.exp.exp_normalize_feedback<T>(data, schema);
  }
  public exp_update_experience<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_experience<T>(agentId, updateData, context);
  }
  public exp_update_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_observation<T>(agentId, updateData, context);
  }
  public exp_update_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_action<T>(agentId, updateData, context);
  }
  public exp_update_outcome<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_outcome<T>(agentId, updateData, context);
  }
  public exp_update_event<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_event<T>(agentId, updateData, context);
  }
  public exp_update_context<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_context<T>(agentId, updateData, context);
  }
  public exp_update_feature<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_feature<T>(agentId, updateData, context);
  }
  public exp_update_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_pattern<T>(agentId, updateData, context);
  }
  public exp_update_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_episode<T>(agentId, updateData, context);
  }
  public exp_update_feedback<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.exp.exp_update_feedback<T>(agentId, updateData, context);
  }
  public exp_evaluate_experience<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_experience<T>(value, criteria);
  }
  public exp_evaluate_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_observation<T>(value, criteria);
  }
  public exp_evaluate_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_action<T>(value, criteria);
  }
  public exp_evaluate_outcome<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_outcome<T>(value, criteria);
  }
  public exp_evaluate_event<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_event<T>(value, criteria);
  }
  public exp_evaluate_context<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_context<T>(value, criteria);
  }
  public exp_evaluate_feature<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_feature<T>(value, criteria);
  }
  public exp_evaluate_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_pattern<T>(value, criteria);
  }
  public exp_evaluate_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_episode<T>(value, criteria);
  }
  public exp_evaluate_feedback<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.exp.exp_evaluate_feedback<T>(value, criteria);
  }
  public exp_retrieve_experience<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_experience<T>(agentId, query);
  }
  public exp_retrieve_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_observation<T>(agentId, query);
  }
  public exp_retrieve_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_action<T>(agentId, query);
  }
  public exp_retrieve_outcome<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_outcome<T>(agentId, query);
  }
  public exp_retrieve_event<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_event<T>(agentId, query);
  }
  public exp_retrieve_context<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_context<T>(agentId, query);
  }
  public exp_retrieve_feature<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_feature<T>(agentId, query);
  }
  public exp_retrieve_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_pattern<T>(agentId, query);
  }
  public exp_retrieve_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_episode<T>(agentId, query);
  }
  public exp_retrieve_feedback<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.exp.exp_retrieve_feedback<T>(agentId, query);
  }
  public exp_serialize_experience<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_experience<T>(data, format);
  }
  public exp_serialize_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_observation<T>(data, format);
  }
  public exp_serialize_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_action<T>(data, format);
  }
  public exp_serialize_outcome<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_outcome<T>(data, format);
  }
  public exp_serialize_event<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_event<T>(data, format);
  }
  public exp_serialize_context<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_context<T>(data, format);
  }
  public exp_serialize_feature<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_feature<T>(data, format);
  }
  public exp_serialize_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_pattern<T>(data, format);
  }
  public exp_serialize_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_episode<T>(data, format);
  }
  public exp_serialize_feedback<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.exp.exp_serialize_feedback<T>(data, format);
  }
  public exp_compare_experience<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_experience<T>(a, b, options);
  }
  public exp_compare_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_observation<T>(a, b, options);
  }
  public exp_compare_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_action<T>(a, b, options);
  }
  public exp_compare_outcome<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_outcome<T>(a, b, options);
  }
  public exp_compare_event<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_event<T>(a, b, options);
  }
  public exp_compare_context<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_context<T>(a, b, options);
  }
  public exp_compare_feature<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_feature<T>(a, b, options);
  }
  public exp_compare_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_pattern<T>(a, b, options);
  }
  public exp_compare_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_episode<T>(a, b, options);
  }
  public exp_compare_feedback<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.exp.exp_compare_feedback<T>(a, b, options);
  }
  public exp_prune_experience(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_experience(agentId, options);
  }
  public exp_prune_observation(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_observation(agentId, options);
  }
  public exp_prune_action(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_action(agentId, options);
  }
  public exp_prune_outcome(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_outcome(agentId, options);
  }
  public exp_prune_event(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_event(agentId, options);
  }
  public exp_prune_context(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_context(agentId, options);
  }
  public exp_prune_feature(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_feature(agentId, options);
  }
  public exp_prune_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_pattern(agentId, options);
  }
  public exp_prune_episode(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_episode(agentId, options);
  }
  public exp_prune_feedback(agentId: string, options?: PruningOptions): PruningResult {
    return this.exp.exp_prune_feedback(agentId, options);
  }

  // ==========================================================================
  // Module STM: STM — Ghi nhớ ngắn hạn (100 hàm)
  // ==========================================================================

  public stm_initialize_working_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_working_memory<T>(agentId, initialData, context);
  }
  public stm_initialize_recent_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_recent_observation<T>(agentId, initialData, context);
  }
  public stm_initialize_recent_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_recent_action<T>(agentId, initialData, context);
  }
  public stm_initialize_temporary_fact<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_temporary_fact<T>(agentId, initialData, context);
  }
  public stm_initialize_active_context<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_active_context<T>(agentId, initialData, context);
  }
  public stm_initialize_attention_item<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_attention_item<T>(agentId, initialData, context);
  }
  public stm_initialize_short_event<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_short_event<T>(agentId, initialData, context);
  }
  public stm_initialize_memory_trace<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_memory_trace<T>(agentId, initialData, context);
  }
  public stm_initialize_temporary_goal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_temporary_goal<T>(agentId, initialData, context);
  }
  public stm_initialize_recall_queue<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_initialize_recall_queue<T>(agentId, initialData, context);
  }
  public stm_capture_working_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_working_memory<T>(agentId, data, context);
  }
  public stm_capture_recent_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_recent_observation<T>(agentId, data, context);
  }
  public stm_capture_recent_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_recent_action<T>(agentId, data, context);
  }
  public stm_capture_temporary_fact<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_temporary_fact<T>(agentId, data, context);
  }
  public stm_capture_active_context<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_active_context<T>(agentId, data, context);
  }
  public stm_capture_attention_item<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_attention_item<T>(agentId, data, context);
  }
  public stm_capture_short_event<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_short_event<T>(agentId, data, context);
  }
  public stm_capture_memory_trace<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_memory_trace<T>(agentId, data, context);
  }
  public stm_capture_temporary_goal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_temporary_goal<T>(agentId, data, context);
  }
  public stm_capture_recall_queue<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_capture_recall_queue<T>(agentId, data, context);
  }
  public stm_validate_working_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_working_memory<T>(value, schema);
  }
  public stm_validate_recent_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_recent_observation<T>(value, schema);
  }
  public stm_validate_recent_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_recent_action<T>(value, schema);
  }
  public stm_validate_temporary_fact<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_temporary_fact<T>(value, schema);
  }
  public stm_validate_active_context<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_active_context<T>(value, schema);
  }
  public stm_validate_attention_item<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_attention_item<T>(value, schema);
  }
  public stm_validate_short_event<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_short_event<T>(value, schema);
  }
  public stm_validate_memory_trace<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_memory_trace<T>(value, schema);
  }
  public stm_validate_temporary_goal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_temporary_goal<T>(value, schema);
  }
  public stm_validate_recall_queue<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.stm.stm_validate_recall_queue<T>(value, schema);
  }
  public stm_normalize_working_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_working_memory<T>(data, schema);
  }
  public stm_normalize_recent_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_recent_observation<T>(data, schema);
  }
  public stm_normalize_recent_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_recent_action<T>(data, schema);
  }
  public stm_normalize_temporary_fact<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_temporary_fact<T>(data, schema);
  }
  public stm_normalize_active_context<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_active_context<T>(data, schema);
  }
  public stm_normalize_attention_item<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_attention_item<T>(data, schema);
  }
  public stm_normalize_short_event<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_short_event<T>(data, schema);
  }
  public stm_normalize_memory_trace<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_memory_trace<T>(data, schema);
  }
  public stm_normalize_temporary_goal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_temporary_goal<T>(data, schema);
  }
  public stm_normalize_recall_queue<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.stm.stm_normalize_recall_queue<T>(data, schema);
  }
  public stm_update_working_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_working_memory<T>(agentId, updateData, context);
  }
  public stm_update_recent_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_recent_observation<T>(agentId, updateData, context);
  }
  public stm_update_recent_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_recent_action<T>(agentId, updateData, context);
  }
  public stm_update_temporary_fact<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_temporary_fact<T>(agentId, updateData, context);
  }
  public stm_update_active_context<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_active_context<T>(agentId, updateData, context);
  }
  public stm_update_attention_item<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_attention_item<T>(agentId, updateData, context);
  }
  public stm_update_short_event<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_short_event<T>(agentId, updateData, context);
  }
  public stm_update_memory_trace<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_memory_trace<T>(agentId, updateData, context);
  }
  public stm_update_temporary_goal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_temporary_goal<T>(agentId, updateData, context);
  }
  public stm_update_recall_queue<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.stm.stm_update_recall_queue<T>(agentId, updateData, context);
  }
  public stm_evaluate_working_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_working_memory<T>(value, criteria);
  }
  public stm_evaluate_recent_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_recent_observation<T>(value, criteria);
  }
  public stm_evaluate_recent_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_recent_action<T>(value, criteria);
  }
  public stm_evaluate_temporary_fact<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_temporary_fact<T>(value, criteria);
  }
  public stm_evaluate_active_context<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_active_context<T>(value, criteria);
  }
  public stm_evaluate_attention_item<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_attention_item<T>(value, criteria);
  }
  public stm_evaluate_short_event<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_short_event<T>(value, criteria);
  }
  public stm_evaluate_memory_trace<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_memory_trace<T>(value, criteria);
  }
  public stm_evaluate_temporary_goal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_temporary_goal<T>(value, criteria);
  }
  public stm_evaluate_recall_queue<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.stm.stm_evaluate_recall_queue<T>(value, criteria);
  }
  public stm_retrieve_working_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_working_memory<T>(agentId, query);
  }
  public stm_retrieve_recent_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_recent_observation<T>(agentId, query);
  }
  public stm_retrieve_recent_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_recent_action<T>(agentId, query);
  }
  public stm_retrieve_temporary_fact<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_temporary_fact<T>(agentId, query);
  }
  public stm_retrieve_active_context<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_active_context<T>(agentId, query);
  }
  public stm_retrieve_attention_item<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_attention_item<T>(agentId, query);
  }
  public stm_retrieve_short_event<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_short_event<T>(agentId, query);
  }
  public stm_retrieve_memory_trace<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_memory_trace<T>(agentId, query);
  }
  public stm_retrieve_temporary_goal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_temporary_goal<T>(agentId, query);
  }
  public stm_retrieve_recall_queue<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.stm.stm_retrieve_recall_queue<T>(agentId, query);
  }
  public stm_serialize_working_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_working_memory<T>(data, format);
  }
  public stm_serialize_recent_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_recent_observation<T>(data, format);
  }
  public stm_serialize_recent_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_recent_action<T>(data, format);
  }
  public stm_serialize_temporary_fact<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_temporary_fact<T>(data, format);
  }
  public stm_serialize_active_context<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_active_context<T>(data, format);
  }
  public stm_serialize_attention_item<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_attention_item<T>(data, format);
  }
  public stm_serialize_short_event<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_short_event<T>(data, format);
  }
  public stm_serialize_memory_trace<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_memory_trace<T>(data, format);
  }
  public stm_serialize_temporary_goal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_temporary_goal<T>(data, format);
  }
  public stm_serialize_recall_queue<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.stm.stm_serialize_recall_queue<T>(data, format);
  }
  public stm_compare_working_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_working_memory<T>(a, b, options);
  }
  public stm_compare_recent_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_recent_observation<T>(a, b, options);
  }
  public stm_compare_recent_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_recent_action<T>(a, b, options);
  }
  public stm_compare_temporary_fact<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_temporary_fact<T>(a, b, options);
  }
  public stm_compare_active_context<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_active_context<T>(a, b, options);
  }
  public stm_compare_attention_item<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_attention_item<T>(a, b, options);
  }
  public stm_compare_short_event<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_short_event<T>(a, b, options);
  }
  public stm_compare_memory_trace<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_memory_trace<T>(a, b, options);
  }
  public stm_compare_temporary_goal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_temporary_goal<T>(a, b, options);
  }
  public stm_compare_recall_queue<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.stm.stm_compare_recall_queue<T>(a, b, options);
  }
  public stm_prune_working_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_working_memory(agentId, options);
  }
  public stm_prune_recent_observation(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_recent_observation(agentId, options);
  }
  public stm_prune_recent_action(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_recent_action(agentId, options);
  }
  public stm_prune_temporary_fact(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_temporary_fact(agentId, options);
  }
  public stm_prune_active_context(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_active_context(agentId, options);
  }
  public stm_prune_attention_item(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_attention_item(agentId, options);
  }
  public stm_prune_short_event(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_short_event(agentId, options);
  }
  public stm_prune_memory_trace(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_memory_trace(agentId, options);
  }
  public stm_prune_temporary_goal(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_temporary_goal(agentId, options);
  }
  public stm_prune_recall_queue(agentId: string, options?: PruningOptions): PruningResult {
    return this.stm.stm_prune_recall_queue(agentId, options);
  }

  // ==========================================================================
  // Module LTM: LTM — Ghi nhớ dài hạn (100 hàm)
  // ==========================================================================

  public ltm_initialize_long_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_long_memory<T>(agentId, initialData, context);
  }
  public ltm_initialize_episodic_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_episodic_memory<T>(agentId, initialData, context);
  }
  public ltm_initialize_semantic_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_semantic_memory<T>(agentId, initialData, context);
  }
  public ltm_initialize_procedural_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_procedural_memory<T>(agentId, initialData, context);
  }
  public ltm_initialize_autobiographical_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_autobiographical_memory<T>(agentId, initialData, context);
  }
  public ltm_initialize_memory_strength<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_memory_strength<T>(agentId, initialData, context);
  }
  public ltm_initialize_memory_consolidation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_memory_consolidation<T>(agentId, initialData, context);
  }
  public ltm_initialize_memory_archive<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_memory_archive<T>(agentId, initialData, context);
  }
  public ltm_initialize_persistent_fact<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_persistent_fact<T>(agentId, initialData, context);
  }
  public ltm_initialize_memory_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_initialize_memory_checkpoint<T>(agentId, initialData, context);
  }
  public ltm_capture_long_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_long_memory<T>(agentId, data, context);
  }
  public ltm_capture_episodic_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_episodic_memory<T>(agentId, data, context);
  }
  public ltm_capture_semantic_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_semantic_memory<T>(agentId, data, context);
  }
  public ltm_capture_procedural_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_procedural_memory<T>(agentId, data, context);
  }
  public ltm_capture_autobiographical_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_autobiographical_memory<T>(agentId, data, context);
  }
  public ltm_capture_memory_strength<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_memory_strength<T>(agentId, data, context);
  }
  public ltm_capture_memory_consolidation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_memory_consolidation<T>(agentId, data, context);
  }
  public ltm_capture_memory_archive<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_memory_archive<T>(agentId, data, context);
  }
  public ltm_capture_persistent_fact<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_persistent_fact<T>(agentId, data, context);
  }
  public ltm_capture_memory_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_capture_memory_checkpoint<T>(agentId, data, context);
  }
  public ltm_validate_long_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_long_memory<T>(value, schema);
  }
  public ltm_validate_episodic_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_episodic_memory<T>(value, schema);
  }
  public ltm_validate_semantic_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_semantic_memory<T>(value, schema);
  }
  public ltm_validate_procedural_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_procedural_memory<T>(value, schema);
  }
  public ltm_validate_autobiographical_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_autobiographical_memory<T>(value, schema);
  }
  public ltm_validate_memory_strength<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_memory_strength<T>(value, schema);
  }
  public ltm_validate_memory_consolidation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_memory_consolidation<T>(value, schema);
  }
  public ltm_validate_memory_archive<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_memory_archive<T>(value, schema);
  }
  public ltm_validate_persistent_fact<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_persistent_fact<T>(value, schema);
  }
  public ltm_validate_memory_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ltm.ltm_validate_memory_checkpoint<T>(value, schema);
  }
  public ltm_normalize_long_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_long_memory<T>(data, schema);
  }
  public ltm_normalize_episodic_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_episodic_memory<T>(data, schema);
  }
  public ltm_normalize_semantic_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_semantic_memory<T>(data, schema);
  }
  public ltm_normalize_procedural_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_procedural_memory<T>(data, schema);
  }
  public ltm_normalize_autobiographical_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_autobiographical_memory<T>(data, schema);
  }
  public ltm_normalize_memory_strength<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_memory_strength<T>(data, schema);
  }
  public ltm_normalize_memory_consolidation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_memory_consolidation<T>(data, schema);
  }
  public ltm_normalize_memory_archive<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_memory_archive<T>(data, schema);
  }
  public ltm_normalize_persistent_fact<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_persistent_fact<T>(data, schema);
  }
  public ltm_normalize_memory_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ltm.ltm_normalize_memory_checkpoint<T>(data, schema);
  }
  public ltm_update_long_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_long_memory<T>(agentId, updateData, context);
  }
  public ltm_update_episodic_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_episodic_memory<T>(agentId, updateData, context);
  }
  public ltm_update_semantic_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_semantic_memory<T>(agentId, updateData, context);
  }
  public ltm_update_procedural_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_procedural_memory<T>(agentId, updateData, context);
  }
  public ltm_update_autobiographical_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_autobiographical_memory<T>(agentId, updateData, context);
  }
  public ltm_update_memory_strength<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_memory_strength<T>(agentId, updateData, context);
  }
  public ltm_update_memory_consolidation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_memory_consolidation<T>(agentId, updateData, context);
  }
  public ltm_update_memory_archive<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_memory_archive<T>(agentId, updateData, context);
  }
  public ltm_update_persistent_fact<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_persistent_fact<T>(agentId, updateData, context);
  }
  public ltm_update_memory_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ltm.ltm_update_memory_checkpoint<T>(agentId, updateData, context);
  }
  public ltm_evaluate_long_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_long_memory<T>(value, criteria);
  }
  public ltm_evaluate_episodic_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_episodic_memory<T>(value, criteria);
  }
  public ltm_evaluate_semantic_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_semantic_memory<T>(value, criteria);
  }
  public ltm_evaluate_procedural_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_procedural_memory<T>(value, criteria);
  }
  public ltm_evaluate_autobiographical_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_autobiographical_memory<T>(value, criteria);
  }
  public ltm_evaluate_memory_strength<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_memory_strength<T>(value, criteria);
  }
  public ltm_evaluate_memory_consolidation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_memory_consolidation<T>(value, criteria);
  }
  public ltm_evaluate_memory_archive<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_memory_archive<T>(value, criteria);
  }
  public ltm_evaluate_persistent_fact<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_persistent_fact<T>(value, criteria);
  }
  public ltm_evaluate_memory_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ltm.ltm_evaluate_memory_checkpoint<T>(value, criteria);
  }
  public ltm_retrieve_long_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_long_memory<T>(agentId, query);
  }
  public ltm_retrieve_episodic_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_episodic_memory<T>(agentId, query);
  }
  public ltm_retrieve_semantic_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_semantic_memory<T>(agentId, query);
  }
  public ltm_retrieve_procedural_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_procedural_memory<T>(agentId, query);
  }
  public ltm_retrieve_autobiographical_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_autobiographical_memory<T>(agentId, query);
  }
  public ltm_retrieve_memory_strength<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_memory_strength<T>(agentId, query);
  }
  public ltm_retrieve_memory_consolidation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_memory_consolidation<T>(agentId, query);
  }
  public ltm_retrieve_memory_archive<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_memory_archive<T>(agentId, query);
  }
  public ltm_retrieve_persistent_fact<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_persistent_fact<T>(agentId, query);
  }
  public ltm_retrieve_memory_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ltm.ltm_retrieve_memory_checkpoint<T>(agentId, query);
  }
  public ltm_serialize_long_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_long_memory<T>(data, format);
  }
  public ltm_serialize_episodic_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_episodic_memory<T>(data, format);
  }
  public ltm_serialize_semantic_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_semantic_memory<T>(data, format);
  }
  public ltm_serialize_procedural_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_procedural_memory<T>(data, format);
  }
  public ltm_serialize_autobiographical_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_autobiographical_memory<T>(data, format);
  }
  public ltm_serialize_memory_strength<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_memory_strength<T>(data, format);
  }
  public ltm_serialize_memory_consolidation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_memory_consolidation<T>(data, format);
  }
  public ltm_serialize_memory_archive<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_memory_archive<T>(data, format);
  }
  public ltm_serialize_persistent_fact<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_persistent_fact<T>(data, format);
  }
  public ltm_serialize_memory_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ltm.ltm_serialize_memory_checkpoint<T>(data, format);
  }
  public ltm_compare_long_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_long_memory<T>(a, b, options);
  }
  public ltm_compare_episodic_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_episodic_memory<T>(a, b, options);
  }
  public ltm_compare_semantic_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_semantic_memory<T>(a, b, options);
  }
  public ltm_compare_procedural_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_procedural_memory<T>(a, b, options);
  }
  public ltm_compare_autobiographical_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_autobiographical_memory<T>(a, b, options);
  }
  public ltm_compare_memory_strength<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_memory_strength<T>(a, b, options);
  }
  public ltm_compare_memory_consolidation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_memory_consolidation<T>(a, b, options);
  }
  public ltm_compare_memory_archive<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_memory_archive<T>(a, b, options);
  }
  public ltm_compare_persistent_fact<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_persistent_fact<T>(a, b, options);
  }
  public ltm_compare_memory_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ltm.ltm_compare_memory_checkpoint<T>(a, b, options);
  }
  public ltm_prune_long_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_long_memory(agentId, options);
  }
  public ltm_prune_episodic_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_episodic_memory(agentId, options);
  }
  public ltm_prune_semantic_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_semantic_memory(agentId, options);
  }
  public ltm_prune_procedural_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_procedural_memory(agentId, options);
  }
  public ltm_prune_autobiographical_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_autobiographical_memory(agentId, options);
  }
  public ltm_prune_memory_strength(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_memory_strength(agentId, options);
  }
  public ltm_prune_memory_consolidation(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_memory_consolidation(agentId, options);
  }
  public ltm_prune_memory_archive(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_memory_archive(agentId, options);
  }
  public ltm_prune_persistent_fact(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_persistent_fact(agentId, options);
  }
  public ltm_prune_memory_checkpoint(agentId: string, options?: PruningOptions): PruningResult {
    return this.ltm.ltm_prune_memory_checkpoint(agentId, options);
  }

  // ==========================================================================
  // Module RET: RET — Truy xuất và liên kết ký ức (100 hàm)
  // ==========================================================================

  public ret_initialize_event_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_event_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_entity_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_entity_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_emotion_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_emotion_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_similarity_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_similarity_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_causal_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_causal_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_temporal_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_temporal_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_spatial_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_spatial_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_social_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_social_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_strategy_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_strategy_memory<T>(agentId, initialData, context);
  }
  public ret_initialize_conflicting_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_initialize_conflicting_memory<T>(agentId, initialData, context);
  }
  public ret_capture_event_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_event_memory<T>(agentId, data, context);
  }
  public ret_capture_entity_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_entity_memory<T>(agentId, data, context);
  }
  public ret_capture_emotion_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_emotion_memory<T>(agentId, data, context);
  }
  public ret_capture_similarity_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_similarity_memory<T>(agentId, data, context);
  }
  public ret_capture_causal_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_causal_memory<T>(agentId, data, context);
  }
  public ret_capture_temporal_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_temporal_memory<T>(agentId, data, context);
  }
  public ret_capture_spatial_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_spatial_memory<T>(agentId, data, context);
  }
  public ret_capture_social_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_social_memory<T>(agentId, data, context);
  }
  public ret_capture_strategy_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_strategy_memory<T>(agentId, data, context);
  }
  public ret_capture_conflicting_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_capture_conflicting_memory<T>(agentId, data, context);
  }
  public ret_validate_event_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_event_memory<T>(value, schema);
  }
  public ret_validate_entity_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_entity_memory<T>(value, schema);
  }
  public ret_validate_emotion_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_emotion_memory<T>(value, schema);
  }
  public ret_validate_similarity_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_similarity_memory<T>(value, schema);
  }
  public ret_validate_causal_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_causal_memory<T>(value, schema);
  }
  public ret_validate_temporal_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_temporal_memory<T>(value, schema);
  }
  public ret_validate_spatial_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_spatial_memory<T>(value, schema);
  }
  public ret_validate_social_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_social_memory<T>(value, schema);
  }
  public ret_validate_strategy_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_strategy_memory<T>(value, schema);
  }
  public ret_validate_conflicting_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.ret.ret_validate_conflicting_memory<T>(value, schema);
  }
  public ret_normalize_event_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_event_memory<T>(data, schema);
  }
  public ret_normalize_entity_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_entity_memory<T>(data, schema);
  }
  public ret_normalize_emotion_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_emotion_memory<T>(data, schema);
  }
  public ret_normalize_similarity_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_similarity_memory<T>(data, schema);
  }
  public ret_normalize_causal_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_causal_memory<T>(data, schema);
  }
  public ret_normalize_temporal_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_temporal_memory<T>(data, schema);
  }
  public ret_normalize_spatial_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_spatial_memory<T>(data, schema);
  }
  public ret_normalize_social_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_social_memory<T>(data, schema);
  }
  public ret_normalize_strategy_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_strategy_memory<T>(data, schema);
  }
  public ret_normalize_conflicting_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.ret.ret_normalize_conflicting_memory<T>(data, schema);
  }
  public ret_update_event_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_event_memory<T>(agentId, updateData, context);
  }
  public ret_update_entity_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_entity_memory<T>(agentId, updateData, context);
  }
  public ret_update_emotion_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_emotion_memory<T>(agentId, updateData, context);
  }
  public ret_update_similarity_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_similarity_memory<T>(agentId, updateData, context);
  }
  public ret_update_causal_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_causal_memory<T>(agentId, updateData, context);
  }
  public ret_update_temporal_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_temporal_memory<T>(agentId, updateData, context);
  }
  public ret_update_spatial_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_spatial_memory<T>(agentId, updateData, context);
  }
  public ret_update_social_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_social_memory<T>(agentId, updateData, context);
  }
  public ret_update_strategy_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_strategy_memory<T>(agentId, updateData, context);
  }
  public ret_update_conflicting_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.ret.ret_update_conflicting_memory<T>(agentId, updateData, context);
  }
  public ret_evaluate_event_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_event_memory<T>(value, criteria);
  }
  public ret_evaluate_entity_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_entity_memory<T>(value, criteria);
  }
  public ret_evaluate_emotion_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_emotion_memory<T>(value, criteria);
  }
  public ret_evaluate_similarity_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_similarity_memory<T>(value, criteria);
  }
  public ret_evaluate_causal_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_causal_memory<T>(value, criteria);
  }
  public ret_evaluate_temporal_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_temporal_memory<T>(value, criteria);
  }
  public ret_evaluate_spatial_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_spatial_memory<T>(value, criteria);
  }
  public ret_evaluate_social_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_social_memory<T>(value, criteria);
  }
  public ret_evaluate_strategy_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_strategy_memory<T>(value, criteria);
  }
  public ret_evaluate_conflicting_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.ret.ret_evaluate_conflicting_memory<T>(value, criteria);
  }
  public ret_retrieve_event_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_event_memory<T>(agentId, query);
  }
  public ret_retrieve_entity_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_entity_memory<T>(agentId, query);
  }
  public ret_retrieve_emotion_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_emotion_memory<T>(agentId, query);
  }
  public ret_retrieve_similarity_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_similarity_memory<T>(agentId, query);
  }
  public ret_retrieve_causal_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_causal_memory<T>(agentId, query);
  }
  public ret_retrieve_temporal_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_temporal_memory<T>(agentId, query);
  }
  public ret_retrieve_spatial_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_spatial_memory<T>(agentId, query);
  }
  public ret_retrieve_social_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_social_memory<T>(agentId, query);
  }
  public ret_retrieve_strategy_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_strategy_memory<T>(agentId, query);
  }
  public ret_retrieve_conflicting_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.ret.ret_retrieve_conflicting_memory<T>(agentId, query);
  }
  public ret_serialize_event_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_event_memory<T>(data, format);
  }
  public ret_serialize_entity_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_entity_memory<T>(data, format);
  }
  public ret_serialize_emotion_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_emotion_memory<T>(data, format);
  }
  public ret_serialize_similarity_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_similarity_memory<T>(data, format);
  }
  public ret_serialize_causal_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_causal_memory<T>(data, format);
  }
  public ret_serialize_temporal_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_temporal_memory<T>(data, format);
  }
  public ret_serialize_spatial_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_spatial_memory<T>(data, format);
  }
  public ret_serialize_social_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_social_memory<T>(data, format);
  }
  public ret_serialize_strategy_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_strategy_memory<T>(data, format);
  }
  public ret_serialize_conflicting_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.ret.ret_serialize_conflicting_memory<T>(data, format);
  }
  public ret_compare_event_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_event_memory<T>(a, b, options);
  }
  public ret_compare_entity_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_entity_memory<T>(a, b, options);
  }
  public ret_compare_emotion_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_emotion_memory<T>(a, b, options);
  }
  public ret_compare_similarity_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_similarity_memory<T>(a, b, options);
  }
  public ret_compare_causal_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_causal_memory<T>(a, b, options);
  }
  public ret_compare_temporal_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_temporal_memory<T>(a, b, options);
  }
  public ret_compare_spatial_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_spatial_memory<T>(a, b, options);
  }
  public ret_compare_social_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_social_memory<T>(a, b, options);
  }
  public ret_compare_strategy_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_strategy_memory<T>(a, b, options);
  }
  public ret_compare_conflicting_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.ret.ret_compare_conflicting_memory<T>(a, b, options);
  }
  public ret_prune_event_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_event_memory(agentId, options);
  }
  public ret_prune_entity_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_entity_memory(agentId, options);
  }
  public ret_prune_emotion_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_emotion_memory(agentId, options);
  }
  public ret_prune_similarity_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_similarity_memory(agentId, options);
  }
  public ret_prune_causal_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_causal_memory(agentId, options);
  }
  public ret_prune_temporal_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_temporal_memory(agentId, options);
  }
  public ret_prune_spatial_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_spatial_memory(agentId, options);
  }
  public ret_prune_social_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_social_memory(agentId, options);
  }
  public ret_prune_strategy_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_strategy_memory(agentId, options);
  }
  public ret_prune_conflicting_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.ret.ret_prune_conflicting_memory(agentId, options);
  }

  // ==========================================================================
  // Module MET: MET — Lưu trữ và cập nhật chỉ số (100 hàm)
  // ==========================================================================

  public met_initialize_health_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_health_stat<T>(agentId, initialData, context);
  }
  public met_initialize_skill_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_skill_stat<T>(agentId, initialData, context);
  }
  public met_initialize_trust_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_trust_stat<T>(agentId, initialData, context);
  }
  public met_initialize_emotion_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_emotion_stat<T>(agentId, initialData, context);
  }
  public met_initialize_learning_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_learning_stat<T>(agentId, initialData, context);
  }
  public met_initialize_performance_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_performance_stat<T>(agentId, initialData, context);
  }
  public met_initialize_relationship_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_relationship_stat<T>(agentId, initialData, context);
  }
  public met_initialize_resource_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_resource_stat<T>(agentId, initialData, context);
  }
  public met_initialize_behavior_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_behavior_stat<T>(agentId, initialData, context);
  }
  public met_initialize_system_stat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_initialize_system_stat<T>(agentId, initialData, context);
  }
  public met_capture_health_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_health_stat<T>(agentId, data, context);
  }
  public met_capture_skill_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_skill_stat<T>(agentId, data, context);
  }
  public met_capture_trust_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_trust_stat<T>(agentId, data, context);
  }
  public met_capture_emotion_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_emotion_stat<T>(agentId, data, context);
  }
  public met_capture_learning_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_learning_stat<T>(agentId, data, context);
  }
  public met_capture_performance_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_performance_stat<T>(agentId, data, context);
  }
  public met_capture_relationship_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_relationship_stat<T>(agentId, data, context);
  }
  public met_capture_resource_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_resource_stat<T>(agentId, data, context);
  }
  public met_capture_behavior_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_behavior_stat<T>(agentId, data, context);
  }
  public met_capture_system_stat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_capture_system_stat<T>(agentId, data, context);
  }
  public met_validate_health_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_health_stat<T>(value, schema);
  }
  public met_validate_skill_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_skill_stat<T>(value, schema);
  }
  public met_validate_trust_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_trust_stat<T>(value, schema);
  }
  public met_validate_emotion_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_emotion_stat<T>(value, schema);
  }
  public met_validate_learning_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_learning_stat<T>(value, schema);
  }
  public met_validate_performance_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_performance_stat<T>(value, schema);
  }
  public met_validate_relationship_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_relationship_stat<T>(value, schema);
  }
  public met_validate_resource_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_resource_stat<T>(value, schema);
  }
  public met_validate_behavior_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_behavior_stat<T>(value, schema);
  }
  public met_validate_system_stat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.met.met_validate_system_stat<T>(value, schema);
  }
  public met_normalize_health_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_health_stat<T>(data, schema);
  }
  public met_normalize_skill_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_skill_stat<T>(data, schema);
  }
  public met_normalize_trust_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_trust_stat<T>(data, schema);
  }
  public met_normalize_emotion_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_emotion_stat<T>(data, schema);
  }
  public met_normalize_learning_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_learning_stat<T>(data, schema);
  }
  public met_normalize_performance_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_performance_stat<T>(data, schema);
  }
  public met_normalize_relationship_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_relationship_stat<T>(data, schema);
  }
  public met_normalize_resource_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_resource_stat<T>(data, schema);
  }
  public met_normalize_behavior_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_behavior_stat<T>(data, schema);
  }
  public met_normalize_system_stat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.met.met_normalize_system_stat<T>(data, schema);
  }
  public met_update_health_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_health_stat<T>(agentId, updateData, context);
  }
  public met_update_skill_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_skill_stat<T>(agentId, updateData, context);
  }
  public met_update_trust_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_trust_stat<T>(agentId, updateData, context);
  }
  public met_update_emotion_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_emotion_stat<T>(agentId, updateData, context);
  }
  public met_update_learning_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_learning_stat<T>(agentId, updateData, context);
  }
  public met_update_performance_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_performance_stat<T>(agentId, updateData, context);
  }
  public met_update_relationship_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_relationship_stat<T>(agentId, updateData, context);
  }
  public met_update_resource_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_resource_stat<T>(agentId, updateData, context);
  }
  public met_update_behavior_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_behavior_stat<T>(agentId, updateData, context);
  }
  public met_update_system_stat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.met.met_update_system_stat<T>(agentId, updateData, context);
  }
  public met_evaluate_health_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_health_stat<T>(value, criteria);
  }
  public met_evaluate_skill_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_skill_stat<T>(value, criteria);
  }
  public met_evaluate_trust_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_trust_stat<T>(value, criteria);
  }
  public met_evaluate_emotion_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_emotion_stat<T>(value, criteria);
  }
  public met_evaluate_learning_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_learning_stat<T>(value, criteria);
  }
  public met_evaluate_performance_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_performance_stat<T>(value, criteria);
  }
  public met_evaluate_relationship_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_relationship_stat<T>(value, criteria);
  }
  public met_evaluate_resource_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_resource_stat<T>(value, criteria);
  }
  public met_evaluate_behavior_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_behavior_stat<T>(value, criteria);
  }
  public met_evaluate_system_stat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.met.met_evaluate_system_stat<T>(value, criteria);
  }
  public met_retrieve_health_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_health_stat<T>(agentId, query);
  }
  public met_retrieve_skill_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_skill_stat<T>(agentId, query);
  }
  public met_retrieve_trust_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_trust_stat<T>(agentId, query);
  }
  public met_retrieve_emotion_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_emotion_stat<T>(agentId, query);
  }
  public met_retrieve_learning_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_learning_stat<T>(agentId, query);
  }
  public met_retrieve_performance_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_performance_stat<T>(agentId, query);
  }
  public met_retrieve_relationship_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_relationship_stat<T>(agentId, query);
  }
  public met_retrieve_resource_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_resource_stat<T>(agentId, query);
  }
  public met_retrieve_behavior_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_behavior_stat<T>(agentId, query);
  }
  public met_retrieve_system_stat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.met.met_retrieve_system_stat<T>(agentId, query);
  }
  public met_serialize_health_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_health_stat<T>(data, format);
  }
  public met_serialize_skill_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_skill_stat<T>(data, format);
  }
  public met_serialize_trust_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_trust_stat<T>(data, format);
  }
  public met_serialize_emotion_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_emotion_stat<T>(data, format);
  }
  public met_serialize_learning_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_learning_stat<T>(data, format);
  }
  public met_serialize_performance_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_performance_stat<T>(data, format);
  }
  public met_serialize_relationship_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_relationship_stat<T>(data, format);
  }
  public met_serialize_resource_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_resource_stat<T>(data, format);
  }
  public met_serialize_behavior_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_behavior_stat<T>(data, format);
  }
  public met_serialize_system_stat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.met.met_serialize_system_stat<T>(data, format);
  }
  public met_compare_health_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_health_stat<T>(a, b, options);
  }
  public met_compare_skill_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_skill_stat<T>(a, b, options);
  }
  public met_compare_trust_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_trust_stat<T>(a, b, options);
  }
  public met_compare_emotion_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_emotion_stat<T>(a, b, options);
  }
  public met_compare_learning_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_learning_stat<T>(a, b, options);
  }
  public met_compare_performance_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_performance_stat<T>(a, b, options);
  }
  public met_compare_relationship_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_relationship_stat<T>(a, b, options);
  }
  public met_compare_resource_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_resource_stat<T>(a, b, options);
  }
  public met_compare_behavior_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_behavior_stat<T>(a, b, options);
  }
  public met_compare_system_stat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.met.met_compare_system_stat<T>(a, b, options);
  }
  public met_prune_health_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_health_stat(agentId, options);
  }
  public met_prune_skill_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_skill_stat(agentId, options);
  }
  public met_prune_trust_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_trust_stat(agentId, options);
  }
  public met_prune_emotion_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_emotion_stat(agentId, options);
  }
  public met_prune_learning_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_learning_stat(agentId, options);
  }
  public met_prune_performance_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_performance_stat(agentId, options);
  }
  public met_prune_relationship_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_relationship_stat(agentId, options);
  }
  public met_prune_resource_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_resource_stat(agentId, options);
  }
  public met_prune_behavior_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_behavior_stat(agentId, options);
  }
  public met_prune_system_stat(agentId: string, options?: PruningOptions): PruningResult {
    return this.met.met_prune_system_stat(agentId, options);
  }

  // ==========================================================================
  // Module OUT: OUT — Học từ thành công và thất bại (100 hàm)
  // ==========================================================================

  public out_initialize_success_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_success_episode<T>(agentId, initialData, context);
  }
  public out_initialize_failure_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_failure_episode<T>(agentId, initialData, context);
  }
  public out_initialize_prediction_error<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_prediction_error<T>(agentId, initialData, context);
  }
  public out_initialize_action_result<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_action_result<T>(agentId, initialData, context);
  }
  public out_initialize_mistake_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_mistake_pattern<T>(agentId, initialData, context);
  }
  public out_initialize_success_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_success_pattern<T>(agentId, initialData, context);
  }
  public out_initialize_lesson_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_lesson_record<T>(agentId, initialData, context);
  }
  public out_initialize_causal_hypothesis<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_causal_hypothesis<T>(agentId, initialData, context);
  }
  public out_initialize_recovery_attempt<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_recovery_attempt<T>(agentId, initialData, context);
  }
  public out_initialize_outcome_summary<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_initialize_outcome_summary<T>(agentId, initialData, context);
  }
  public out_capture_success_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_success_episode<T>(agentId, data, context);
  }
  public out_capture_failure_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_failure_episode<T>(agentId, data, context);
  }
  public out_capture_prediction_error<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_prediction_error<T>(agentId, data, context);
  }
  public out_capture_action_result<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_action_result<T>(agentId, data, context);
  }
  public out_capture_mistake_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_mistake_pattern<T>(agentId, data, context);
  }
  public out_capture_success_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_success_pattern<T>(agentId, data, context);
  }
  public out_capture_lesson_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_lesson_record<T>(agentId, data, context);
  }
  public out_capture_causal_hypothesis<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_causal_hypothesis<T>(agentId, data, context);
  }
  public out_capture_recovery_attempt<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_recovery_attempt<T>(agentId, data, context);
  }
  public out_capture_outcome_summary<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_capture_outcome_summary<T>(agentId, data, context);
  }
  public out_validate_success_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_success_episode<T>(value, schema);
  }
  public out_validate_failure_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_failure_episode<T>(value, schema);
  }
  public out_validate_prediction_error<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_prediction_error<T>(value, schema);
  }
  public out_validate_action_result<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_action_result<T>(value, schema);
  }
  public out_validate_mistake_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_mistake_pattern<T>(value, schema);
  }
  public out_validate_success_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_success_pattern<T>(value, schema);
  }
  public out_validate_lesson_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_lesson_record<T>(value, schema);
  }
  public out_validate_causal_hypothesis<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_causal_hypothesis<T>(value, schema);
  }
  public out_validate_recovery_attempt<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_recovery_attempt<T>(value, schema);
  }
  public out_validate_outcome_summary<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.out.out_validate_outcome_summary<T>(value, schema);
  }
  public out_normalize_success_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_success_episode<T>(data, schema);
  }
  public out_normalize_failure_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_failure_episode<T>(data, schema);
  }
  public out_normalize_prediction_error<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_prediction_error<T>(data, schema);
  }
  public out_normalize_action_result<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_action_result<T>(data, schema);
  }
  public out_normalize_mistake_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_mistake_pattern<T>(data, schema);
  }
  public out_normalize_success_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_success_pattern<T>(data, schema);
  }
  public out_normalize_lesson_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_lesson_record<T>(data, schema);
  }
  public out_normalize_causal_hypothesis<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_causal_hypothesis<T>(data, schema);
  }
  public out_normalize_recovery_attempt<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_recovery_attempt<T>(data, schema);
  }
  public out_normalize_outcome_summary<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.out.out_normalize_outcome_summary<T>(data, schema);
  }
  public out_update_success_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_success_episode<T>(agentId, updateData, context);
  }
  public out_update_failure_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_failure_episode<T>(agentId, updateData, context);
  }
  public out_update_prediction_error<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_prediction_error<T>(agentId, updateData, context);
  }
  public out_update_action_result<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_action_result<T>(agentId, updateData, context);
  }
  public out_update_mistake_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_mistake_pattern<T>(agentId, updateData, context);
  }
  public out_update_success_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_success_pattern<T>(agentId, updateData, context);
  }
  public out_update_lesson_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_lesson_record<T>(agentId, updateData, context);
  }
  public out_update_causal_hypothesis<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_causal_hypothesis<T>(agentId, updateData, context);
  }
  public out_update_recovery_attempt<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_recovery_attempt<T>(agentId, updateData, context);
  }
  public out_update_outcome_summary<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.out.out_update_outcome_summary<T>(agentId, updateData, context);
  }
  public out_evaluate_success_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_success_episode<T>(value, criteria);
  }
  public out_evaluate_failure_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_failure_episode<T>(value, criteria);
  }
  public out_evaluate_prediction_error<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_prediction_error<T>(value, criteria);
  }
  public out_evaluate_action_result<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_action_result<T>(value, criteria);
  }
  public out_evaluate_mistake_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_mistake_pattern<T>(value, criteria);
  }
  public out_evaluate_success_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_success_pattern<T>(value, criteria);
  }
  public out_evaluate_lesson_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_lesson_record<T>(value, criteria);
  }
  public out_evaluate_causal_hypothesis<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_causal_hypothesis<T>(value, criteria);
  }
  public out_evaluate_recovery_attempt<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_recovery_attempt<T>(value, criteria);
  }
  public out_evaluate_outcome_summary<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.out.out_evaluate_outcome_summary<T>(value, criteria);
  }
  public out_retrieve_success_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_success_episode<T>(agentId, query);
  }
  public out_retrieve_failure_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_failure_episode<T>(agentId, query);
  }
  public out_retrieve_prediction_error<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_prediction_error<T>(agentId, query);
  }
  public out_retrieve_action_result<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_action_result<T>(agentId, query);
  }
  public out_retrieve_mistake_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_mistake_pattern<T>(agentId, query);
  }
  public out_retrieve_success_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_success_pattern<T>(agentId, query);
  }
  public out_retrieve_lesson_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_lesson_record<T>(agentId, query);
  }
  public out_retrieve_causal_hypothesis<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_causal_hypothesis<T>(agentId, query);
  }
  public out_retrieve_recovery_attempt<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_recovery_attempt<T>(agentId, query);
  }
  public out_retrieve_outcome_summary<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.out.out_retrieve_outcome_summary<T>(agentId, query);
  }
  public out_serialize_success_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_success_episode<T>(data, format);
  }
  public out_serialize_failure_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_failure_episode<T>(data, format);
  }
  public out_serialize_prediction_error<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_prediction_error<T>(data, format);
  }
  public out_serialize_action_result<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_action_result<T>(data, format);
  }
  public out_serialize_mistake_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_mistake_pattern<T>(data, format);
  }
  public out_serialize_success_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_success_pattern<T>(data, format);
  }
  public out_serialize_lesson_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_lesson_record<T>(data, format);
  }
  public out_serialize_causal_hypothesis<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_causal_hypothesis<T>(data, format);
  }
  public out_serialize_recovery_attempt<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_recovery_attempt<T>(data, format);
  }
  public out_serialize_outcome_summary<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.out.out_serialize_outcome_summary<T>(data, format);
  }
  public out_compare_success_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_success_episode<T>(a, b, options);
  }
  public out_compare_failure_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_failure_episode<T>(a, b, options);
  }
  public out_compare_prediction_error<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_prediction_error<T>(a, b, options);
  }
  public out_compare_action_result<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_action_result<T>(a, b, options);
  }
  public out_compare_mistake_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_mistake_pattern<T>(a, b, options);
  }
  public out_compare_success_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_success_pattern<T>(a, b, options);
  }
  public out_compare_lesson_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_lesson_record<T>(a, b, options);
  }
  public out_compare_causal_hypothesis<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_causal_hypothesis<T>(a, b, options);
  }
  public out_compare_recovery_attempt<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_recovery_attempt<T>(a, b, options);
  }
  public out_compare_outcome_summary<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.out.out_compare_outcome_summary<T>(a, b, options);
  }
  public out_prune_success_episode(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_success_episode(agentId, options);
  }
  public out_prune_failure_episode(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_failure_episode(agentId, options);
  }
  public out_prune_prediction_error(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_prediction_error(agentId, options);
  }
  public out_prune_action_result(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_action_result(agentId, options);
  }
  public out_prune_mistake_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_mistake_pattern(agentId, options);
  }
  public out_prune_success_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_success_pattern(agentId, options);
  }
  public out_prune_lesson_record(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_lesson_record(agentId, options);
  }
  public out_prune_causal_hypothesis(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_causal_hypothesis(agentId, options);
  }
  public out_prune_recovery_attempt(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_recovery_attempt(agentId, options);
  }
  public out_prune_outcome_summary(agentId: string, options?: PruningOptions): PruningResult {
    return this.out.out_prune_outcome_summary(agentId, options);
  }

  // ==========================================================================
  // Module RL: RL — Học tăng cường (100 hàm)
  // ==========================================================================

  public rl_initialize_reward_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_reward_signal<T>(agentId, initialData, context);
  }
  public rl_initialize_penalty_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_penalty_signal<T>(agentId, initialData, context);
  }
  public rl_initialize_state_value<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_state_value<T>(agentId, initialData, context);
  }
  public rl_initialize_action_value<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_action_value<T>(agentId, initialData, context);
  }
  public rl_initialize_policy_parameter<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_policy_parameter<T>(agentId, initialData, context);
  }
  public rl_initialize_exploration_choice<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_exploration_choice<T>(agentId, initialData, context);
  }
  public rl_initialize_discounted_return<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_discounted_return<T>(agentId, initialData, context);
  }
  public rl_initialize_learning_episode<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_learning_episode<T>(agentId, initialData, context);
  }
  public rl_initialize_policy_evaluation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_policy_evaluation<T>(agentId, initialData, context);
  }
  public rl_initialize_reward_model<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_initialize_reward_model<T>(agentId, initialData, context);
  }
  public rl_capture_reward_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_reward_signal<T>(agentId, data, context);
  }
  public rl_capture_penalty_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_penalty_signal<T>(agentId, data, context);
  }
  public rl_capture_state_value<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_state_value<T>(agentId, data, context);
  }
  public rl_capture_action_value<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_action_value<T>(agentId, data, context);
  }
  public rl_capture_policy_parameter<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_policy_parameter<T>(agentId, data, context);
  }
  public rl_capture_exploration_choice<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_exploration_choice<T>(agentId, data, context);
  }
  public rl_capture_discounted_return<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_discounted_return<T>(agentId, data, context);
  }
  public rl_capture_learning_episode<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_learning_episode<T>(agentId, data, context);
  }
  public rl_capture_policy_evaluation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_policy_evaluation<T>(agentId, data, context);
  }
  public rl_capture_reward_model<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_capture_reward_model<T>(agentId, data, context);
  }
  public rl_validate_reward_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_reward_signal<T>(value, schema);
  }
  public rl_validate_penalty_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_penalty_signal<T>(value, schema);
  }
  public rl_validate_state_value<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_state_value<T>(value, schema);
  }
  public rl_validate_action_value<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_action_value<T>(value, schema);
  }
  public rl_validate_policy_parameter<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_policy_parameter<T>(value, schema);
  }
  public rl_validate_exploration_choice<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_exploration_choice<T>(value, schema);
  }
  public rl_validate_discounted_return<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_discounted_return<T>(value, schema);
  }
  public rl_validate_learning_episode<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_learning_episode<T>(value, schema);
  }
  public rl_validate_policy_evaluation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_policy_evaluation<T>(value, schema);
  }
  public rl_validate_reward_model<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rl.rl_validate_reward_model<T>(value, schema);
  }
  public rl_normalize_reward_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_reward_signal<T>(data, schema);
  }
  public rl_normalize_penalty_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_penalty_signal<T>(data, schema);
  }
  public rl_normalize_state_value<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_state_value<T>(data, schema);
  }
  public rl_normalize_action_value<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_action_value<T>(data, schema);
  }
  public rl_normalize_policy_parameter<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_policy_parameter<T>(data, schema);
  }
  public rl_normalize_exploration_choice<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_exploration_choice<T>(data, schema);
  }
  public rl_normalize_discounted_return<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_discounted_return<T>(data, schema);
  }
  public rl_normalize_learning_episode<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_learning_episode<T>(data, schema);
  }
  public rl_normalize_policy_evaluation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_policy_evaluation<T>(data, schema);
  }
  public rl_normalize_reward_model<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rl.rl_normalize_reward_model<T>(data, schema);
  }
  public rl_update_reward_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_reward_signal<T>(agentId, updateData, context);
  }
  public rl_update_penalty_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_penalty_signal<T>(agentId, updateData, context);
  }
  public rl_update_state_value<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_state_value<T>(agentId, updateData, context);
  }
  public rl_update_action_value<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_action_value<T>(agentId, updateData, context);
  }
  public rl_update_policy_parameter<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_policy_parameter<T>(agentId, updateData, context);
  }
  public rl_update_exploration_choice<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_exploration_choice<T>(agentId, updateData, context);
  }
  public rl_update_discounted_return<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_discounted_return<T>(agentId, updateData, context);
  }
  public rl_update_learning_episode<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_learning_episode<T>(agentId, updateData, context);
  }
  public rl_update_policy_evaluation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_policy_evaluation<T>(agentId, updateData, context);
  }
  public rl_update_reward_model<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rl.rl_update_reward_model<T>(agentId, updateData, context);
  }
  public rl_evaluate_reward_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_reward_signal<T>(value, criteria);
  }
  public rl_evaluate_penalty_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_penalty_signal<T>(value, criteria);
  }
  public rl_evaluate_state_value<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_state_value<T>(value, criteria);
  }
  public rl_evaluate_action_value<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_action_value<T>(value, criteria);
  }
  public rl_evaluate_policy_parameter<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_policy_parameter<T>(value, criteria);
  }
  public rl_evaluate_exploration_choice<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_exploration_choice<T>(value, criteria);
  }
  public rl_evaluate_discounted_return<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_discounted_return<T>(value, criteria);
  }
  public rl_evaluate_learning_episode<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_learning_episode<T>(value, criteria);
  }
  public rl_evaluate_policy_evaluation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_policy_evaluation<T>(value, criteria);
  }
  public rl_evaluate_reward_model<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rl.rl_evaluate_reward_model<T>(value, criteria);
  }
  public rl_retrieve_reward_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_reward_signal<T>(agentId, query);
  }
  public rl_retrieve_penalty_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_penalty_signal<T>(agentId, query);
  }
  public rl_retrieve_state_value<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_state_value<T>(agentId, query);
  }
  public rl_retrieve_action_value<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_action_value<T>(agentId, query);
  }
  public rl_retrieve_policy_parameter<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_policy_parameter<T>(agentId, query);
  }
  public rl_retrieve_exploration_choice<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_exploration_choice<T>(agentId, query);
  }
  public rl_retrieve_discounted_return<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_discounted_return<T>(agentId, query);
  }
  public rl_retrieve_learning_episode<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_learning_episode<T>(agentId, query);
  }
  public rl_retrieve_policy_evaluation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_policy_evaluation<T>(agentId, query);
  }
  public rl_retrieve_reward_model<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rl.rl_retrieve_reward_model<T>(agentId, query);
  }
  public rl_serialize_reward_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_reward_signal<T>(data, format);
  }
  public rl_serialize_penalty_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_penalty_signal<T>(data, format);
  }
  public rl_serialize_state_value<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_state_value<T>(data, format);
  }
  public rl_serialize_action_value<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_action_value<T>(data, format);
  }
  public rl_serialize_policy_parameter<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_policy_parameter<T>(data, format);
  }
  public rl_serialize_exploration_choice<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_exploration_choice<T>(data, format);
  }
  public rl_serialize_discounted_return<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_discounted_return<T>(data, format);
  }
  public rl_serialize_learning_episode<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_learning_episode<T>(data, format);
  }
  public rl_serialize_policy_evaluation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_policy_evaluation<T>(data, format);
  }
  public rl_serialize_reward_model<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rl.rl_serialize_reward_model<T>(data, format);
  }
  public rl_compare_reward_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_reward_signal<T>(a, b, options);
  }
  public rl_compare_penalty_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_penalty_signal<T>(a, b, options);
  }
  public rl_compare_state_value<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_state_value<T>(a, b, options);
  }
  public rl_compare_action_value<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_action_value<T>(a, b, options);
  }
  public rl_compare_policy_parameter<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_policy_parameter<T>(a, b, options);
  }
  public rl_compare_exploration_choice<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_exploration_choice<T>(a, b, options);
  }
  public rl_compare_discounted_return<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_discounted_return<T>(a, b, options);
  }
  public rl_compare_learning_episode<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_learning_episode<T>(a, b, options);
  }
  public rl_compare_policy_evaluation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_policy_evaluation<T>(a, b, options);
  }
  public rl_compare_reward_model<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rl.rl_compare_reward_model<T>(a, b, options);
  }
  public rl_prune_reward_signal(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_reward_signal(agentId, options);
  }
  public rl_prune_penalty_signal(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_penalty_signal(agentId, options);
  }
  public rl_prune_state_value(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_state_value(agentId, options);
  }
  public rl_prune_action_value(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_action_value(agentId, options);
  }
  public rl_prune_policy_parameter(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_policy_parameter(agentId, options);
  }
  public rl_prune_exploration_choice(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_exploration_choice(agentId, options);
  }
  public rl_prune_discounted_return(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_discounted_return(agentId, options);
  }
  public rl_prune_learning_episode(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_learning_episode(agentId, options);
  }
  public rl_prune_policy_evaluation(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_policy_evaluation(agentId, options);
  }
  public rl_prune_reward_model(agentId: string, options?: PruningOptions): PruningResult {
    return this.rl.rl_prune_reward_model(agentId, options);
  }

  // ==========================================================================
  // Module SUP: SUP — Học có giám sát (100 hàm)
  // ==========================================================================

  public sup_initialize_training_example<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_training_example<T>(agentId, initialData, context);
  }
  public sup_initialize_training_label<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_training_label<T>(agentId, initialData, context);
  }
  public sup_initialize_feature_vector<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_feature_vector<T>(agentId, initialData, context);
  }
  public sup_initialize_prediction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_prediction<T>(agentId, initialData, context);
  }
  public sup_initialize_prediction_error<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_prediction_error<T>(agentId, initialData, context);
  }
  public sup_initialize_validation_sample<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_validation_sample<T>(agentId, initialData, context);
  }
  public sup_initialize_training_batch<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_training_batch<T>(agentId, initialData, context);
  }
  public sup_initialize_class_probability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_class_probability<T>(agentId, initialData, context);
  }
  public sup_initialize_model_parameter<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_model_parameter<T>(agentId, initialData, context);
  }
  public sup_initialize_training_metric<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_initialize_training_metric<T>(agentId, initialData, context);
  }
  public sup_capture_training_example<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_training_example<T>(agentId, data, context);
  }
  public sup_capture_training_label<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_training_label<T>(agentId, data, context);
  }
  public sup_capture_feature_vector<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_feature_vector<T>(agentId, data, context);
  }
  public sup_capture_prediction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_prediction<T>(agentId, data, context);
  }
  public sup_capture_prediction_error<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_prediction_error<T>(agentId, data, context);
  }
  public sup_capture_validation_sample<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_validation_sample<T>(agentId, data, context);
  }
  public sup_capture_training_batch<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_training_batch<T>(agentId, data, context);
  }
  public sup_capture_class_probability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_class_probability<T>(agentId, data, context);
  }
  public sup_capture_model_parameter<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_model_parameter<T>(agentId, data, context);
  }
  public sup_capture_training_metric<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_capture_training_metric<T>(agentId, data, context);
  }
  public sup_validate_training_example<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_training_example<T>(value, schema);
  }
  public sup_validate_training_label<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_training_label<T>(value, schema);
  }
  public sup_validate_feature_vector<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_feature_vector<T>(value, schema);
  }
  public sup_validate_prediction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_prediction<T>(value, schema);
  }
  public sup_validate_prediction_error<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_prediction_error<T>(value, schema);
  }
  public sup_validate_validation_sample<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_validation_sample<T>(value, schema);
  }
  public sup_validate_training_batch<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_training_batch<T>(value, schema);
  }
  public sup_validate_class_probability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_class_probability<T>(value, schema);
  }
  public sup_validate_model_parameter<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_model_parameter<T>(value, schema);
  }
  public sup_validate_training_metric<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.sup.sup_validate_training_metric<T>(value, schema);
  }
  public sup_normalize_training_example<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_training_example<T>(data, schema);
  }
  public sup_normalize_training_label<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_training_label<T>(data, schema);
  }
  public sup_normalize_feature_vector<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_feature_vector<T>(data, schema);
  }
  public sup_normalize_prediction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_prediction<T>(data, schema);
  }
  public sup_normalize_prediction_error<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_prediction_error<T>(data, schema);
  }
  public sup_normalize_validation_sample<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_validation_sample<T>(data, schema);
  }
  public sup_normalize_training_batch<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_training_batch<T>(data, schema);
  }
  public sup_normalize_class_probability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_class_probability<T>(data, schema);
  }
  public sup_normalize_model_parameter<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_model_parameter<T>(data, schema);
  }
  public sup_normalize_training_metric<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.sup.sup_normalize_training_metric<T>(data, schema);
  }
  public sup_update_training_example<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_training_example<T>(agentId, updateData, context);
  }
  public sup_update_training_label<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_training_label<T>(agentId, updateData, context);
  }
  public sup_update_feature_vector<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_feature_vector<T>(agentId, updateData, context);
  }
  public sup_update_prediction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_prediction<T>(agentId, updateData, context);
  }
  public sup_update_prediction_error<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_prediction_error<T>(agentId, updateData, context);
  }
  public sup_update_validation_sample<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_validation_sample<T>(agentId, updateData, context);
  }
  public sup_update_training_batch<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_training_batch<T>(agentId, updateData, context);
  }
  public sup_update_class_probability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_class_probability<T>(agentId, updateData, context);
  }
  public sup_update_model_parameter<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_model_parameter<T>(agentId, updateData, context);
  }
  public sup_update_training_metric<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.sup.sup_update_training_metric<T>(agentId, updateData, context);
  }
  public sup_evaluate_training_example<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_training_example<T>(value, criteria);
  }
  public sup_evaluate_training_label<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_training_label<T>(value, criteria);
  }
  public sup_evaluate_feature_vector<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_feature_vector<T>(value, criteria);
  }
  public sup_evaluate_prediction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_prediction<T>(value, criteria);
  }
  public sup_evaluate_prediction_error<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_prediction_error<T>(value, criteria);
  }
  public sup_evaluate_validation_sample<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_validation_sample<T>(value, criteria);
  }
  public sup_evaluate_training_batch<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_training_batch<T>(value, criteria);
  }
  public sup_evaluate_class_probability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_class_probability<T>(value, criteria);
  }
  public sup_evaluate_model_parameter<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_model_parameter<T>(value, criteria);
  }
  public sup_evaluate_training_metric<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.sup.sup_evaluate_training_metric<T>(value, criteria);
  }
  public sup_retrieve_training_example<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_training_example<T>(agentId, query);
  }
  public sup_retrieve_training_label<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_training_label<T>(agentId, query);
  }
  public sup_retrieve_feature_vector<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_feature_vector<T>(agentId, query);
  }
  public sup_retrieve_prediction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_prediction<T>(agentId, query);
  }
  public sup_retrieve_prediction_error<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_prediction_error<T>(agentId, query);
  }
  public sup_retrieve_validation_sample<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_validation_sample<T>(agentId, query);
  }
  public sup_retrieve_training_batch<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_training_batch<T>(agentId, query);
  }
  public sup_retrieve_class_probability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_class_probability<T>(agentId, query);
  }
  public sup_retrieve_model_parameter<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_model_parameter<T>(agentId, query);
  }
  public sup_retrieve_training_metric<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.sup.sup_retrieve_training_metric<T>(agentId, query);
  }
  public sup_serialize_training_example<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_training_example<T>(data, format);
  }
  public sup_serialize_training_label<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_training_label<T>(data, format);
  }
  public sup_serialize_feature_vector<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_feature_vector<T>(data, format);
  }
  public sup_serialize_prediction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_prediction<T>(data, format);
  }
  public sup_serialize_prediction_error<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_prediction_error<T>(data, format);
  }
  public sup_serialize_validation_sample<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_validation_sample<T>(data, format);
  }
  public sup_serialize_training_batch<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_training_batch<T>(data, format);
  }
  public sup_serialize_class_probability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_class_probability<T>(data, format);
  }
  public sup_serialize_model_parameter<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_model_parameter<T>(data, format);
  }
  public sup_serialize_training_metric<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.sup.sup_serialize_training_metric<T>(data, format);
  }
  public sup_compare_training_example<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_training_example<T>(a, b, options);
  }
  public sup_compare_training_label<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_training_label<T>(a, b, options);
  }
  public sup_compare_feature_vector<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_feature_vector<T>(a, b, options);
  }
  public sup_compare_prediction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_prediction<T>(a, b, options);
  }
  public sup_compare_prediction_error<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_prediction_error<T>(a, b, options);
  }
  public sup_compare_validation_sample<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_validation_sample<T>(a, b, options);
  }
  public sup_compare_training_batch<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_training_batch<T>(a, b, options);
  }
  public sup_compare_class_probability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_class_probability<T>(a, b, options);
  }
  public sup_compare_model_parameter<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_model_parameter<T>(a, b, options);
  }
  public sup_compare_training_metric<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.sup.sup_compare_training_metric<T>(a, b, options);
  }
  public sup_prune_training_example(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_training_example(agentId, options);
  }
  public sup_prune_training_label(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_training_label(agentId, options);
  }
  public sup_prune_feature_vector(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_feature_vector(agentId, options);
  }
  public sup_prune_prediction(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_prediction(agentId, options);
  }
  public sup_prune_prediction_error(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_prediction_error(agentId, options);
  }
  public sup_prune_validation_sample(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_validation_sample(agentId, options);
  }
  public sup_prune_training_batch(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_training_batch(agentId, options);
  }
  public sup_prune_class_probability(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_class_probability(agentId, options);
  }
  public sup_prune_model_parameter(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_model_parameter(agentId, options);
  }
  public sup_prune_training_metric(agentId: string, options?: PruningOptions): PruningResult {
    return this.sup.sup_prune_training_metric(agentId, options);
  }

  // ==========================================================================
  // Module UNS: UNS — Học không giám sát và khám phá (100 hàm)
  // ==========================================================================

  public uns_initialize_observation_cluster<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_observation_cluster<T>(agentId, initialData, context);
  }
  public uns_initialize_behavior_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_behavior_pattern<T>(agentId, initialData, context);
  }
  public uns_initialize_feature_distribution<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_feature_distribution<T>(agentId, initialData, context);
  }
  public uns_initialize_anomaly_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_anomaly_score<T>(agentId, initialData, context);
  }
  public uns_initialize_latent_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_latent_state<T>(agentId, initialData, context);
  }
  public uns_initialize_cluster_centroid<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_cluster_centroid<T>(agentId, initialData, context);
  }
  public uns_initialize_experience_embedding<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_experience_embedding<T>(agentId, initialData, context);
  }
  public uns_initialize_pattern_coherence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_pattern_coherence<T>(agentId, initialData, context);
  }
  public uns_initialize_similarity_graph<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_similarity_graph<T>(agentId, initialData, context);
  }
  public uns_initialize_discovered_rule<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_initialize_discovered_rule<T>(agentId, initialData, context);
  }
  public uns_capture_observation_cluster<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_observation_cluster<T>(agentId, data, context);
  }
  public uns_capture_behavior_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_behavior_pattern<T>(agentId, data, context);
  }
  public uns_capture_feature_distribution<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_feature_distribution<T>(agentId, data, context);
  }
  public uns_capture_anomaly_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_anomaly_score<T>(agentId, data, context);
  }
  public uns_capture_latent_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_latent_state<T>(agentId, data, context);
  }
  public uns_capture_cluster_centroid<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_cluster_centroid<T>(agentId, data, context);
  }
  public uns_capture_experience_embedding<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_experience_embedding<T>(agentId, data, context);
  }
  public uns_capture_pattern_coherence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_pattern_coherence<T>(agentId, data, context);
  }
  public uns_capture_similarity_graph<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_similarity_graph<T>(agentId, data, context);
  }
  public uns_capture_discovered_rule<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_capture_discovered_rule<T>(agentId, data, context);
  }
  public uns_validate_observation_cluster<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_observation_cluster<T>(value, schema);
  }
  public uns_validate_behavior_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_behavior_pattern<T>(value, schema);
  }
  public uns_validate_feature_distribution<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_feature_distribution<T>(value, schema);
  }
  public uns_validate_anomaly_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_anomaly_score<T>(value, schema);
  }
  public uns_validate_latent_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_latent_state<T>(value, schema);
  }
  public uns_validate_cluster_centroid<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_cluster_centroid<T>(value, schema);
  }
  public uns_validate_experience_embedding<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_experience_embedding<T>(value, schema);
  }
  public uns_validate_pattern_coherence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_pattern_coherence<T>(value, schema);
  }
  public uns_validate_similarity_graph<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_similarity_graph<T>(value, schema);
  }
  public uns_validate_discovered_rule<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.uns.uns_validate_discovered_rule<T>(value, schema);
  }
  public uns_normalize_observation_cluster<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_observation_cluster<T>(data, schema);
  }
  public uns_normalize_behavior_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_behavior_pattern<T>(data, schema);
  }
  public uns_normalize_feature_distribution<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_feature_distribution<T>(data, schema);
  }
  public uns_normalize_anomaly_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_anomaly_score<T>(data, schema);
  }
  public uns_normalize_latent_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_latent_state<T>(data, schema);
  }
  public uns_normalize_cluster_centroid<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_cluster_centroid<T>(data, schema);
  }
  public uns_normalize_experience_embedding<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_experience_embedding<T>(data, schema);
  }
  public uns_normalize_pattern_coherence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_pattern_coherence<T>(data, schema);
  }
  public uns_normalize_similarity_graph<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_similarity_graph<T>(data, schema);
  }
  public uns_normalize_discovered_rule<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.uns.uns_normalize_discovered_rule<T>(data, schema);
  }
  public uns_update_observation_cluster<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_observation_cluster<T>(agentId, updateData, context);
  }
  public uns_update_behavior_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_behavior_pattern<T>(agentId, updateData, context);
  }
  public uns_update_feature_distribution<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_feature_distribution<T>(agentId, updateData, context);
  }
  public uns_update_anomaly_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_anomaly_score<T>(agentId, updateData, context);
  }
  public uns_update_latent_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_latent_state<T>(agentId, updateData, context);
  }
  public uns_update_cluster_centroid<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_cluster_centroid<T>(agentId, updateData, context);
  }
  public uns_update_experience_embedding<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_experience_embedding<T>(agentId, updateData, context);
  }
  public uns_update_pattern_coherence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_pattern_coherence<T>(agentId, updateData, context);
  }
  public uns_update_similarity_graph<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_similarity_graph<T>(agentId, updateData, context);
  }
  public uns_update_discovered_rule<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.uns.uns_update_discovered_rule<T>(agentId, updateData, context);
  }
  public uns_evaluate_observation_cluster<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_observation_cluster<T>(value, criteria);
  }
  public uns_evaluate_behavior_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_behavior_pattern<T>(value, criteria);
  }
  public uns_evaluate_feature_distribution<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_feature_distribution<T>(value, criteria);
  }
  public uns_evaluate_anomaly_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_anomaly_score<T>(value, criteria);
  }
  public uns_evaluate_latent_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_latent_state<T>(value, criteria);
  }
  public uns_evaluate_cluster_centroid<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_cluster_centroid<T>(value, criteria);
  }
  public uns_evaluate_experience_embedding<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_experience_embedding<T>(value, criteria);
  }
  public uns_evaluate_pattern_coherence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_pattern_coherence<T>(value, criteria);
  }
  public uns_evaluate_similarity_graph<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_similarity_graph<T>(value, criteria);
  }
  public uns_evaluate_discovered_rule<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.uns.uns_evaluate_discovered_rule<T>(value, criteria);
  }
  public uns_retrieve_observation_cluster<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_observation_cluster<T>(agentId, query);
  }
  public uns_retrieve_behavior_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_behavior_pattern<T>(agentId, query);
  }
  public uns_retrieve_feature_distribution<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_feature_distribution<T>(agentId, query);
  }
  public uns_retrieve_anomaly_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_anomaly_score<T>(agentId, query);
  }
  public uns_retrieve_latent_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_latent_state<T>(agentId, query);
  }
  public uns_retrieve_cluster_centroid<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_cluster_centroid<T>(agentId, query);
  }
  public uns_retrieve_experience_embedding<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_experience_embedding<T>(agentId, query);
  }
  public uns_retrieve_pattern_coherence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_pattern_coherence<T>(agentId, query);
  }
  public uns_retrieve_similarity_graph<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_similarity_graph<T>(agentId, query);
  }
  public uns_retrieve_discovered_rule<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.uns.uns_retrieve_discovered_rule<T>(agentId, query);
  }
  public uns_serialize_observation_cluster<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_observation_cluster<T>(data, format);
  }
  public uns_serialize_behavior_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_behavior_pattern<T>(data, format);
  }
  public uns_serialize_feature_distribution<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_feature_distribution<T>(data, format);
  }
  public uns_serialize_anomaly_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_anomaly_score<T>(data, format);
  }
  public uns_serialize_latent_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_latent_state<T>(data, format);
  }
  public uns_serialize_cluster_centroid<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_cluster_centroid<T>(data, format);
  }
  public uns_serialize_experience_embedding<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_experience_embedding<T>(data, format);
  }
  public uns_serialize_pattern_coherence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_pattern_coherence<T>(data, format);
  }
  public uns_serialize_similarity_graph<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_similarity_graph<T>(data, format);
  }
  public uns_serialize_discovered_rule<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.uns.uns_serialize_discovered_rule<T>(data, format);
  }
  public uns_compare_observation_cluster<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_observation_cluster<T>(a, b, options);
  }
  public uns_compare_behavior_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_behavior_pattern<T>(a, b, options);
  }
  public uns_compare_feature_distribution<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_feature_distribution<T>(a, b, options);
  }
  public uns_compare_anomaly_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_anomaly_score<T>(a, b, options);
  }
  public uns_compare_latent_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_latent_state<T>(a, b, options);
  }
  public uns_compare_cluster_centroid<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_cluster_centroid<T>(a, b, options);
  }
  public uns_compare_experience_embedding<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_experience_embedding<T>(a, b, options);
  }
  public uns_compare_pattern_coherence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_pattern_coherence<T>(a, b, options);
  }
  public uns_compare_similarity_graph<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_similarity_graph<T>(a, b, options);
  }
  public uns_compare_discovered_rule<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.uns.uns_compare_discovered_rule<T>(a, b, options);
  }
  public uns_prune_observation_cluster(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_observation_cluster(agentId, options);
  }
  public uns_prune_behavior_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_behavior_pattern(agentId, options);
  }
  public uns_prune_feature_distribution(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_feature_distribution(agentId, options);
  }
  public uns_prune_anomaly_score(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_anomaly_score(agentId, options);
  }
  public uns_prune_latent_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_latent_state(agentId, options);
  }
  public uns_prune_cluster_centroid(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_cluster_centroid(agentId, options);
  }
  public uns_prune_experience_embedding(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_experience_embedding(agentId, options);
  }
  public uns_prune_pattern_coherence(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_pattern_coherence(agentId, options);
  }
  public uns_prune_similarity_graph(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_similarity_graph(agentId, options);
  }
  public uns_prune_discovered_rule(agentId: string, options?: PruningOptions): PruningResult {
    return this.uns.uns_prune_discovered_rule(agentId, options);
  }

  // ==========================================================================
  // Module ONL: ONL — Học trực tuyến và thích nghi (100 hàm)
  // ==========================================================================

  public onl_initialize_online_update<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_online_update<T>(agentId, initialData, context);
  }
  public onl_initialize_learning_rate<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_learning_rate<T>(agentId, initialData, context);
  }
  public onl_initialize_concept_drift<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_concept_drift<T>(agentId, initialData, context);
  }
  public onl_initialize_recent_sample<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_recent_sample<T>(agentId, initialData, context);
  }
  public onl_initialize_incremental_gradient<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_incremental_gradient<T>(agentId, initialData, context);
  }
  public onl_initialize_model_version<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_model_version<T>(agentId, initialData, context);
  }
  public onl_initialize_online_metric<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_online_metric<T>(agentId, initialData, context);
  }
  public onl_initialize_adaptation_window<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_adaptation_window<T>(agentId, initialData, context);
  }
  public onl_initialize_parameter_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_parameter_checkpoint<T>(agentId, initialData, context);
  }
  public onl_initialize_refresh_schedule<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_initialize_refresh_schedule<T>(agentId, initialData, context);
  }
  public onl_capture_online_update<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_online_update<T>(agentId, data, context);
  }
  public onl_capture_learning_rate<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_learning_rate<T>(agentId, data, context);
  }
  public onl_capture_concept_drift<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_concept_drift<T>(agentId, data, context);
  }
  public onl_capture_recent_sample<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_recent_sample<T>(agentId, data, context);
  }
  public onl_capture_incremental_gradient<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_incremental_gradient<T>(agentId, data, context);
  }
  public onl_capture_model_version<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_model_version<T>(agentId, data, context);
  }
  public onl_capture_online_metric<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_online_metric<T>(agentId, data, context);
  }
  public onl_capture_adaptation_window<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_adaptation_window<T>(agentId, data, context);
  }
  public onl_capture_parameter_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_parameter_checkpoint<T>(agentId, data, context);
  }
  public onl_capture_refresh_schedule<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_capture_refresh_schedule<T>(agentId, data, context);
  }
  public onl_validate_online_update<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_online_update<T>(value, schema);
  }
  public onl_validate_learning_rate<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_learning_rate<T>(value, schema);
  }
  public onl_validate_concept_drift<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_concept_drift<T>(value, schema);
  }
  public onl_validate_recent_sample<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_recent_sample<T>(value, schema);
  }
  public onl_validate_incremental_gradient<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_incremental_gradient<T>(value, schema);
  }
  public onl_validate_model_version<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_model_version<T>(value, schema);
  }
  public onl_validate_online_metric<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_online_metric<T>(value, schema);
  }
  public onl_validate_adaptation_window<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_adaptation_window<T>(value, schema);
  }
  public onl_validate_parameter_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_parameter_checkpoint<T>(value, schema);
  }
  public onl_validate_refresh_schedule<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.onl.onl_validate_refresh_schedule<T>(value, schema);
  }
  public onl_normalize_online_update<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_online_update<T>(data, schema);
  }
  public onl_normalize_learning_rate<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_learning_rate<T>(data, schema);
  }
  public onl_normalize_concept_drift<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_concept_drift<T>(data, schema);
  }
  public onl_normalize_recent_sample<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_recent_sample<T>(data, schema);
  }
  public onl_normalize_incremental_gradient<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_incremental_gradient<T>(data, schema);
  }
  public onl_normalize_model_version<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_model_version<T>(data, schema);
  }
  public onl_normalize_online_metric<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_online_metric<T>(data, schema);
  }
  public onl_normalize_adaptation_window<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_adaptation_window<T>(data, schema);
  }
  public onl_normalize_parameter_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_parameter_checkpoint<T>(data, schema);
  }
  public onl_normalize_refresh_schedule<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.onl.onl_normalize_refresh_schedule<T>(data, schema);
  }
  public onl_update_online_update<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_online_update<T>(agentId, updateData, context);
  }
  public onl_update_learning_rate<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_learning_rate<T>(agentId, updateData, context);
  }
  public onl_update_concept_drift<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_concept_drift<T>(agentId, updateData, context);
  }
  public onl_update_recent_sample<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_recent_sample<T>(agentId, updateData, context);
  }
  public onl_update_incremental_gradient<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_incremental_gradient<T>(agentId, updateData, context);
  }
  public onl_update_model_version<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_model_version<T>(agentId, updateData, context);
  }
  public onl_update_online_metric<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_online_metric<T>(agentId, updateData, context);
  }
  public onl_update_adaptation_window<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_adaptation_window<T>(agentId, updateData, context);
  }
  public onl_update_parameter_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_parameter_checkpoint<T>(agentId, updateData, context);
  }
  public onl_update_refresh_schedule<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.onl.onl_update_refresh_schedule<T>(agentId, updateData, context);
  }
  public onl_evaluate_online_update<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_online_update<T>(value, criteria);
  }
  public onl_evaluate_learning_rate<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_learning_rate<T>(value, criteria);
  }
  public onl_evaluate_concept_drift<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_concept_drift<T>(value, criteria);
  }
  public onl_evaluate_recent_sample<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_recent_sample<T>(value, criteria);
  }
  public onl_evaluate_incremental_gradient<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_incremental_gradient<T>(value, criteria);
  }
  public onl_evaluate_model_version<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_model_version<T>(value, criteria);
  }
  public onl_evaluate_online_metric<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_online_metric<T>(value, criteria);
  }
  public onl_evaluate_adaptation_window<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_adaptation_window<T>(value, criteria);
  }
  public onl_evaluate_parameter_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_parameter_checkpoint<T>(value, criteria);
  }
  public onl_evaluate_refresh_schedule<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.onl.onl_evaluate_refresh_schedule<T>(value, criteria);
  }
  public onl_retrieve_online_update<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_online_update<T>(agentId, query);
  }
  public onl_retrieve_learning_rate<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_learning_rate<T>(agentId, query);
  }
  public onl_retrieve_concept_drift<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_concept_drift<T>(agentId, query);
  }
  public onl_retrieve_recent_sample<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_recent_sample<T>(agentId, query);
  }
  public onl_retrieve_incremental_gradient<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_incremental_gradient<T>(agentId, query);
  }
  public onl_retrieve_model_version<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_model_version<T>(agentId, query);
  }
  public onl_retrieve_online_metric<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_online_metric<T>(agentId, query);
  }
  public onl_retrieve_adaptation_window<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_adaptation_window<T>(agentId, query);
  }
  public onl_retrieve_parameter_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_parameter_checkpoint<T>(agentId, query);
  }
  public onl_retrieve_refresh_schedule<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.onl.onl_retrieve_refresh_schedule<T>(agentId, query);
  }
  public onl_serialize_online_update<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_online_update<T>(data, format);
  }
  public onl_serialize_learning_rate<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_learning_rate<T>(data, format);
  }
  public onl_serialize_concept_drift<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_concept_drift<T>(data, format);
  }
  public onl_serialize_recent_sample<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_recent_sample<T>(data, format);
  }
  public onl_serialize_incremental_gradient<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_incremental_gradient<T>(data, format);
  }
  public onl_serialize_model_version<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_model_version<T>(data, format);
  }
  public onl_serialize_online_metric<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_online_metric<T>(data, format);
  }
  public onl_serialize_adaptation_window<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_adaptation_window<T>(data, format);
  }
  public onl_serialize_parameter_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_parameter_checkpoint<T>(data, format);
  }
  public onl_serialize_refresh_schedule<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.onl.onl_serialize_refresh_schedule<T>(data, format);
  }
  public onl_compare_online_update<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_online_update<T>(a, b, options);
  }
  public onl_compare_learning_rate<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_learning_rate<T>(a, b, options);
  }
  public onl_compare_concept_drift<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_concept_drift<T>(a, b, options);
  }
  public onl_compare_recent_sample<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_recent_sample<T>(a, b, options);
  }
  public onl_compare_incremental_gradient<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_incremental_gradient<T>(a, b, options);
  }
  public onl_compare_model_version<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_model_version<T>(a, b, options);
  }
  public onl_compare_online_metric<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_online_metric<T>(a, b, options);
  }
  public onl_compare_adaptation_window<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_adaptation_window<T>(a, b, options);
  }
  public onl_compare_parameter_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_parameter_checkpoint<T>(a, b, options);
  }
  public onl_compare_refresh_schedule<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.onl.onl_compare_refresh_schedule<T>(a, b, options);
  }
  public onl_prune_online_update(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_online_update(agentId, options);
  }
  public onl_prune_learning_rate(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_learning_rate(agentId, options);
  }
  public onl_prune_concept_drift(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_concept_drift(agentId, options);
  }
  public onl_prune_recent_sample(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_recent_sample(agentId, options);
  }
  public onl_prune_incremental_gradient(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_incremental_gradient(agentId, options);
  }
  public onl_prune_model_version(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_model_version(agentId, options);
  }
  public onl_prune_online_metric(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_online_metric(agentId, options);
  }
  public onl_prune_adaptation_window(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_adaptation_window(agentId, options);
  }
  public onl_prune_parameter_checkpoint(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_parameter_checkpoint(agentId, options);
  }
  public onl_prune_refresh_schedule(agentId: string, options?: PruningOptions): PruningResult {
    return this.onl.onl_prune_refresh_schedule(agentId, options);
  }

  // ==========================================================================
  // Module EMO: EMO — Cảm xúc và trạng thái tâm lý (100 hàm)
  // ==========================================================================

  public emo_initialize_fear_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_fear_state<T>(agentId, initialData, context);
  }
  public emo_initialize_anger_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_anger_state<T>(agentId, initialData, context);
  }
  public emo_initialize_joy_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_joy_state<T>(agentId, initialData, context);
  }
  public emo_initialize_curiosity_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_curiosity_state<T>(agentId, initialData, context);
  }
  public emo_initialize_trust_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_trust_state<T>(agentId, initialData, context);
  }
  public emo_initialize_stress_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_stress_state<T>(agentId, initialData, context);
  }
  public emo_initialize_confidence_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_confidence_state<T>(agentId, initialData, context);
  }
  public emo_initialize_sadness_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_sadness_state<T>(agentId, initialData, context);
  }
  public emo_initialize_emotion_trigger<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_emotion_trigger<T>(agentId, initialData, context);
  }
  public emo_initialize_emotion_vector<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_initialize_emotion_vector<T>(agentId, initialData, context);
  }
  public emo_capture_fear_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_fear_state<T>(agentId, data, context);
  }
  public emo_capture_anger_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_anger_state<T>(agentId, data, context);
  }
  public emo_capture_joy_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_joy_state<T>(agentId, data, context);
  }
  public emo_capture_curiosity_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_curiosity_state<T>(agentId, data, context);
  }
  public emo_capture_trust_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_trust_state<T>(agentId, data, context);
  }
  public emo_capture_stress_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_stress_state<T>(agentId, data, context);
  }
  public emo_capture_confidence_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_confidence_state<T>(agentId, data, context);
  }
  public emo_capture_sadness_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_sadness_state<T>(agentId, data, context);
  }
  public emo_capture_emotion_trigger<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_emotion_trigger<T>(agentId, data, context);
  }
  public emo_capture_emotion_vector<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_capture_emotion_vector<T>(agentId, data, context);
  }
  public emo_validate_fear_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_fear_state<T>(value, schema);
  }
  public emo_validate_anger_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_anger_state<T>(value, schema);
  }
  public emo_validate_joy_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_joy_state<T>(value, schema);
  }
  public emo_validate_curiosity_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_curiosity_state<T>(value, schema);
  }
  public emo_validate_trust_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_trust_state<T>(value, schema);
  }
  public emo_validate_stress_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_stress_state<T>(value, schema);
  }
  public emo_validate_confidence_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_confidence_state<T>(value, schema);
  }
  public emo_validate_sadness_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_sadness_state<T>(value, schema);
  }
  public emo_validate_emotion_trigger<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_emotion_trigger<T>(value, schema);
  }
  public emo_validate_emotion_vector<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.emo.emo_validate_emotion_vector<T>(value, schema);
  }
  public emo_normalize_fear_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_fear_state<T>(data, schema);
  }
  public emo_normalize_anger_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_anger_state<T>(data, schema);
  }
  public emo_normalize_joy_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_joy_state<T>(data, schema);
  }
  public emo_normalize_curiosity_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_curiosity_state<T>(data, schema);
  }
  public emo_normalize_trust_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_trust_state<T>(data, schema);
  }
  public emo_normalize_stress_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_stress_state<T>(data, schema);
  }
  public emo_normalize_confidence_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_confidence_state<T>(data, schema);
  }
  public emo_normalize_sadness_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_sadness_state<T>(data, schema);
  }
  public emo_normalize_emotion_trigger<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_emotion_trigger<T>(data, schema);
  }
  public emo_normalize_emotion_vector<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.emo.emo_normalize_emotion_vector<T>(data, schema);
  }
  public emo_update_fear_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_fear_state<T>(agentId, updateData, context);
  }
  public emo_update_anger_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_anger_state<T>(agentId, updateData, context);
  }
  public emo_update_joy_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_joy_state<T>(agentId, updateData, context);
  }
  public emo_update_curiosity_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_curiosity_state<T>(agentId, updateData, context);
  }
  public emo_update_trust_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_trust_state<T>(agentId, updateData, context);
  }
  public emo_update_stress_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_stress_state<T>(agentId, updateData, context);
  }
  public emo_update_confidence_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_confidence_state<T>(agentId, updateData, context);
  }
  public emo_update_sadness_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_sadness_state<T>(agentId, updateData, context);
  }
  public emo_update_emotion_trigger<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_emotion_trigger<T>(agentId, updateData, context);
  }
  public emo_update_emotion_vector<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.emo.emo_update_emotion_vector<T>(agentId, updateData, context);
  }
  public emo_evaluate_fear_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_fear_state<T>(value, criteria);
  }
  public emo_evaluate_anger_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_anger_state<T>(value, criteria);
  }
  public emo_evaluate_joy_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_joy_state<T>(value, criteria);
  }
  public emo_evaluate_curiosity_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_curiosity_state<T>(value, criteria);
  }
  public emo_evaluate_trust_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_trust_state<T>(value, criteria);
  }
  public emo_evaluate_stress_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_stress_state<T>(value, criteria);
  }
  public emo_evaluate_confidence_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_confidence_state<T>(value, criteria);
  }
  public emo_evaluate_sadness_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_sadness_state<T>(value, criteria);
  }
  public emo_evaluate_emotion_trigger<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_emotion_trigger<T>(value, criteria);
  }
  public emo_evaluate_emotion_vector<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.emo.emo_evaluate_emotion_vector<T>(value, criteria);
  }
  public emo_retrieve_fear_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_fear_state<T>(agentId, query);
  }
  public emo_retrieve_anger_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_anger_state<T>(agentId, query);
  }
  public emo_retrieve_joy_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_joy_state<T>(agentId, query);
  }
  public emo_retrieve_curiosity_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_curiosity_state<T>(agentId, query);
  }
  public emo_retrieve_trust_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_trust_state<T>(agentId, query);
  }
  public emo_retrieve_stress_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_stress_state<T>(agentId, query);
  }
  public emo_retrieve_confidence_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_confidence_state<T>(agentId, query);
  }
  public emo_retrieve_sadness_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_sadness_state<T>(agentId, query);
  }
  public emo_retrieve_emotion_trigger<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_emotion_trigger<T>(agentId, query);
  }
  public emo_retrieve_emotion_vector<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.emo.emo_retrieve_emotion_vector<T>(agentId, query);
  }
  public emo_serialize_fear_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_fear_state<T>(data, format);
  }
  public emo_serialize_anger_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_anger_state<T>(data, format);
  }
  public emo_serialize_joy_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_joy_state<T>(data, format);
  }
  public emo_serialize_curiosity_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_curiosity_state<T>(data, format);
  }
  public emo_serialize_trust_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_trust_state<T>(data, format);
  }
  public emo_serialize_stress_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_stress_state<T>(data, format);
  }
  public emo_serialize_confidence_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_confidence_state<T>(data, format);
  }
  public emo_serialize_sadness_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_sadness_state<T>(data, format);
  }
  public emo_serialize_emotion_trigger<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_emotion_trigger<T>(data, format);
  }
  public emo_serialize_emotion_vector<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.emo.emo_serialize_emotion_vector<T>(data, format);
  }
  public emo_compare_fear_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_fear_state<T>(a, b, options);
  }
  public emo_compare_anger_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_anger_state<T>(a, b, options);
  }
  public emo_compare_joy_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_joy_state<T>(a, b, options);
  }
  public emo_compare_curiosity_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_curiosity_state<T>(a, b, options);
  }
  public emo_compare_trust_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_trust_state<T>(a, b, options);
  }
  public emo_compare_stress_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_stress_state<T>(a, b, options);
  }
  public emo_compare_confidence_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_confidence_state<T>(a, b, options);
  }
  public emo_compare_sadness_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_sadness_state<T>(a, b, options);
  }
  public emo_compare_emotion_trigger<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_emotion_trigger<T>(a, b, options);
  }
  public emo_compare_emotion_vector<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.emo.emo_compare_emotion_vector<T>(a, b, options);
  }
  public emo_prune_fear_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_fear_state(agentId, options);
  }
  public emo_prune_anger_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_anger_state(agentId, options);
  }
  public emo_prune_joy_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_joy_state(agentId, options);
  }
  public emo_prune_curiosity_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_curiosity_state(agentId, options);
  }
  public emo_prune_trust_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_trust_state(agentId, options);
  }
  public emo_prune_stress_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_stress_state(agentId, options);
  }
  public emo_prune_confidence_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_confidence_state(agentId, options);
  }
  public emo_prune_sadness_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_sadness_state(agentId, options);
  }
  public emo_prune_emotion_trigger(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_emotion_trigger(agentId, options);
  }
  public emo_prune_emotion_vector(agentId: string, options?: PruningOptions): PruningResult {
    return this.emo.emo_prune_emotion_vector(agentId, options);
  }

  // ==========================================================================
  // Module PER: PER — Tính cách và xu hướng cá nhân (100 hàm)
  // ==========================================================================

  public per_initialize_personality_profile<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_personality_profile<T>(agentId, initialData, context);
  }
  public per_initialize_risk_tolerance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_risk_tolerance<T>(agentId, initialData, context);
  }
  public per_initialize_aggression_tendency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_aggression_tendency<T>(agentId, initialData, context);
  }
  public per_initialize_curiosity_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_curiosity_trait<T>(agentId, initialData, context);
  }
  public per_initialize_patience_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_patience_trait<T>(agentId, initialData, context);
  }
  public per_initialize_loyalty_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_loyalty_trait<T>(agentId, initialData, context);
  }
  public per_initialize_sociability_trait<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_sociability_trait<T>(agentId, initialData, context);
  }
  public per_initialize_trait_stability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_trait_stability<T>(agentId, initialData, context);
  }
  public per_initialize_personality_evidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_personality_evidence<T>(agentId, initialData, context);
  }
  public per_initialize_trait_expression<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_initialize_trait_expression<T>(agentId, initialData, context);
  }
  public per_capture_personality_profile<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_personality_profile<T>(agentId, data, context);
  }
  public per_capture_risk_tolerance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_risk_tolerance<T>(agentId, data, context);
  }
  public per_capture_aggression_tendency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_aggression_tendency<T>(agentId, data, context);
  }
  public per_capture_curiosity_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_curiosity_trait<T>(agentId, data, context);
  }
  public per_capture_patience_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_patience_trait<T>(agentId, data, context);
  }
  public per_capture_loyalty_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_loyalty_trait<T>(agentId, data, context);
  }
  public per_capture_sociability_trait<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_sociability_trait<T>(agentId, data, context);
  }
  public per_capture_trait_stability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_trait_stability<T>(agentId, data, context);
  }
  public per_capture_personality_evidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_personality_evidence<T>(agentId, data, context);
  }
  public per_capture_trait_expression<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_capture_trait_expression<T>(agentId, data, context);
  }
  public per_validate_personality_profile<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_personality_profile<T>(value, schema);
  }
  public per_validate_risk_tolerance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_risk_tolerance<T>(value, schema);
  }
  public per_validate_aggression_tendency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_aggression_tendency<T>(value, schema);
  }
  public per_validate_curiosity_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_curiosity_trait<T>(value, schema);
  }
  public per_validate_patience_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_patience_trait<T>(value, schema);
  }
  public per_validate_loyalty_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_loyalty_trait<T>(value, schema);
  }
  public per_validate_sociability_trait<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_sociability_trait<T>(value, schema);
  }
  public per_validate_trait_stability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_trait_stability<T>(value, schema);
  }
  public per_validate_personality_evidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_personality_evidence<T>(value, schema);
  }
  public per_validate_trait_expression<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.per.per_validate_trait_expression<T>(value, schema);
  }
  public per_normalize_personality_profile<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_personality_profile<T>(data, schema);
  }
  public per_normalize_risk_tolerance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_risk_tolerance<T>(data, schema);
  }
  public per_normalize_aggression_tendency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_aggression_tendency<T>(data, schema);
  }
  public per_normalize_curiosity_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_curiosity_trait<T>(data, schema);
  }
  public per_normalize_patience_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_patience_trait<T>(data, schema);
  }
  public per_normalize_loyalty_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_loyalty_trait<T>(data, schema);
  }
  public per_normalize_sociability_trait<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_sociability_trait<T>(data, schema);
  }
  public per_normalize_trait_stability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_trait_stability<T>(data, schema);
  }
  public per_normalize_personality_evidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_personality_evidence<T>(data, schema);
  }
  public per_normalize_trait_expression<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.per.per_normalize_trait_expression<T>(data, schema);
  }
  public per_update_personality_profile<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_personality_profile<T>(agentId, updateData, context);
  }
  public per_update_risk_tolerance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_risk_tolerance<T>(agentId, updateData, context);
  }
  public per_update_aggression_tendency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_aggression_tendency<T>(agentId, updateData, context);
  }
  public per_update_curiosity_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_curiosity_trait<T>(agentId, updateData, context);
  }
  public per_update_patience_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_patience_trait<T>(agentId, updateData, context);
  }
  public per_update_loyalty_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_loyalty_trait<T>(agentId, updateData, context);
  }
  public per_update_sociability_trait<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_sociability_trait<T>(agentId, updateData, context);
  }
  public per_update_trait_stability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_trait_stability<T>(agentId, updateData, context);
  }
  public per_update_personality_evidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_personality_evidence<T>(agentId, updateData, context);
  }
  public per_update_trait_expression<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.per.per_update_trait_expression<T>(agentId, updateData, context);
  }
  public per_evaluate_personality_profile<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_personality_profile<T>(value, criteria);
  }
  public per_evaluate_risk_tolerance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_risk_tolerance<T>(value, criteria);
  }
  public per_evaluate_aggression_tendency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_aggression_tendency<T>(value, criteria);
  }
  public per_evaluate_curiosity_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_curiosity_trait<T>(value, criteria);
  }
  public per_evaluate_patience_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_patience_trait<T>(value, criteria);
  }
  public per_evaluate_loyalty_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_loyalty_trait<T>(value, criteria);
  }
  public per_evaluate_sociability_trait<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_sociability_trait<T>(value, criteria);
  }
  public per_evaluate_trait_stability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_trait_stability<T>(value, criteria);
  }
  public per_evaluate_personality_evidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_personality_evidence<T>(value, criteria);
  }
  public per_evaluate_trait_expression<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.per.per_evaluate_trait_expression<T>(value, criteria);
  }
  public per_retrieve_personality_profile<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_personality_profile<T>(agentId, query);
  }
  public per_retrieve_risk_tolerance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_risk_tolerance<T>(agentId, query);
  }
  public per_retrieve_aggression_tendency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_aggression_tendency<T>(agentId, query);
  }
  public per_retrieve_curiosity_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_curiosity_trait<T>(agentId, query);
  }
  public per_retrieve_patience_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_patience_trait<T>(agentId, query);
  }
  public per_retrieve_loyalty_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_loyalty_trait<T>(agentId, query);
  }
  public per_retrieve_sociability_trait<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_sociability_trait<T>(agentId, query);
  }
  public per_retrieve_trait_stability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_trait_stability<T>(agentId, query);
  }
  public per_retrieve_personality_evidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_personality_evidence<T>(agentId, query);
  }
  public per_retrieve_trait_expression<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.per.per_retrieve_trait_expression<T>(agentId, query);
  }
  public per_serialize_personality_profile<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_personality_profile<T>(data, format);
  }
  public per_serialize_risk_tolerance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_risk_tolerance<T>(data, format);
  }
  public per_serialize_aggression_tendency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_aggression_tendency<T>(data, format);
  }
  public per_serialize_curiosity_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_curiosity_trait<T>(data, format);
  }
  public per_serialize_patience_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_patience_trait<T>(data, format);
  }
  public per_serialize_loyalty_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_loyalty_trait<T>(data, format);
  }
  public per_serialize_sociability_trait<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_sociability_trait<T>(data, format);
  }
  public per_serialize_trait_stability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_trait_stability<T>(data, format);
  }
  public per_serialize_personality_evidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_personality_evidence<T>(data, format);
  }
  public per_serialize_trait_expression<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.per.per_serialize_trait_expression<T>(data, format);
  }
  public per_compare_personality_profile<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_personality_profile<T>(a, b, options);
  }
  public per_compare_risk_tolerance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_risk_tolerance<T>(a, b, options);
  }
  public per_compare_aggression_tendency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_aggression_tendency<T>(a, b, options);
  }
  public per_compare_curiosity_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_curiosity_trait<T>(a, b, options);
  }
  public per_compare_patience_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_patience_trait<T>(a, b, options);
  }
  public per_compare_loyalty_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_loyalty_trait<T>(a, b, options);
  }
  public per_compare_sociability_trait<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_sociability_trait<T>(a, b, options);
  }
  public per_compare_trait_stability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_trait_stability<T>(a, b, options);
  }
  public per_compare_personality_evidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_personality_evidence<T>(a, b, options);
  }
  public per_compare_trait_expression<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.per.per_compare_trait_expression<T>(a, b, options);
  }
  public per_prune_personality_profile(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_personality_profile(agentId, options);
  }
  public per_prune_risk_tolerance(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_risk_tolerance(agentId, options);
  }
  public per_prune_aggression_tendency(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_aggression_tendency(agentId, options);
  }
  public per_prune_curiosity_trait(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_curiosity_trait(agentId, options);
  }
  public per_prune_patience_trait(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_patience_trait(agentId, options);
  }
  public per_prune_loyalty_trait(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_loyalty_trait(agentId, options);
  }
  public per_prune_sociability_trait(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_sociability_trait(agentId, options);
  }
  public per_prune_trait_stability(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_trait_stability(agentId, options);
  }
  public per_prune_personality_evidence(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_personality_evidence(agentId, options);
  }
  public per_prune_trait_expression(agentId: string, options?: PruningOptions): PruningResult {
    return this.per.per_prune_trait_expression(agentId, options);
  }

  // ==========================================================================
  // Module MOT: MOT — Nhu cầu và động lực (100 hàm)
  // ==========================================================================

  public mot_initialize_hunger_need<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_hunger_need<T>(agentId, initialData, context);
  }
  public mot_initialize_safety_need<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_safety_need<T>(agentId, initialData, context);
  }
  public mot_initialize_social_need<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_social_need<T>(agentId, initialData, context);
  }
  public mot_initialize_rest_need<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_rest_need<T>(agentId, initialData, context);
  }
  public mot_initialize_curiosity_drive<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_curiosity_drive<T>(agentId, initialData, context);
  }
  public mot_initialize_goal_urgency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_goal_urgency<T>(agentId, initialData, context);
  }
  public mot_initialize_motivation_weight<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_motivation_weight<T>(agentId, initialData, context);
  }
  public mot_initialize_need_satisfaction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_need_satisfaction<T>(agentId, initialData, context);
  }
  public mot_initialize_motivation_conflict<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_motivation_conflict<T>(agentId, initialData, context);
  }
  public mot_initialize_drive_prediction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_initialize_drive_prediction<T>(agentId, initialData, context);
  }
  public mot_capture_hunger_need<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_hunger_need<T>(agentId, data, context);
  }
  public mot_capture_safety_need<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_safety_need<T>(agentId, data, context);
  }
  public mot_capture_social_need<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_social_need<T>(agentId, data, context);
  }
  public mot_capture_rest_need<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_rest_need<T>(agentId, data, context);
  }
  public mot_capture_curiosity_drive<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_curiosity_drive<T>(agentId, data, context);
  }
  public mot_capture_goal_urgency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_goal_urgency<T>(agentId, data, context);
  }
  public mot_capture_motivation_weight<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_motivation_weight<T>(agentId, data, context);
  }
  public mot_capture_need_satisfaction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_need_satisfaction<T>(agentId, data, context);
  }
  public mot_capture_motivation_conflict<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_motivation_conflict<T>(agentId, data, context);
  }
  public mot_capture_drive_prediction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_capture_drive_prediction<T>(agentId, data, context);
  }
  public mot_validate_hunger_need<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_hunger_need<T>(value, schema);
  }
  public mot_validate_safety_need<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_safety_need<T>(value, schema);
  }
  public mot_validate_social_need<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_social_need<T>(value, schema);
  }
  public mot_validate_rest_need<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_rest_need<T>(value, schema);
  }
  public mot_validate_curiosity_drive<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_curiosity_drive<T>(value, schema);
  }
  public mot_validate_goal_urgency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_goal_urgency<T>(value, schema);
  }
  public mot_validate_motivation_weight<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_motivation_weight<T>(value, schema);
  }
  public mot_validate_need_satisfaction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_need_satisfaction<T>(value, schema);
  }
  public mot_validate_motivation_conflict<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_motivation_conflict<T>(value, schema);
  }
  public mot_validate_drive_prediction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.mot.mot_validate_drive_prediction<T>(value, schema);
  }
  public mot_normalize_hunger_need<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_hunger_need<T>(data, schema);
  }
  public mot_normalize_safety_need<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_safety_need<T>(data, schema);
  }
  public mot_normalize_social_need<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_social_need<T>(data, schema);
  }
  public mot_normalize_rest_need<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_rest_need<T>(data, schema);
  }
  public mot_normalize_curiosity_drive<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_curiosity_drive<T>(data, schema);
  }
  public mot_normalize_goal_urgency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_goal_urgency<T>(data, schema);
  }
  public mot_normalize_motivation_weight<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_motivation_weight<T>(data, schema);
  }
  public mot_normalize_need_satisfaction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_need_satisfaction<T>(data, schema);
  }
  public mot_normalize_motivation_conflict<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_motivation_conflict<T>(data, schema);
  }
  public mot_normalize_drive_prediction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.mot.mot_normalize_drive_prediction<T>(data, schema);
  }
  public mot_update_hunger_need<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_hunger_need<T>(agentId, updateData, context);
  }
  public mot_update_safety_need<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_safety_need<T>(agentId, updateData, context);
  }
  public mot_update_social_need<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_social_need<T>(agentId, updateData, context);
  }
  public mot_update_rest_need<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_rest_need<T>(agentId, updateData, context);
  }
  public mot_update_curiosity_drive<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_curiosity_drive<T>(agentId, updateData, context);
  }
  public mot_update_goal_urgency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_goal_urgency<T>(agentId, updateData, context);
  }
  public mot_update_motivation_weight<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_motivation_weight<T>(agentId, updateData, context);
  }
  public mot_update_need_satisfaction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_need_satisfaction<T>(agentId, updateData, context);
  }
  public mot_update_motivation_conflict<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_motivation_conflict<T>(agentId, updateData, context);
  }
  public mot_update_drive_prediction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.mot.mot_update_drive_prediction<T>(agentId, updateData, context);
  }
  public mot_evaluate_hunger_need<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_hunger_need<T>(value, criteria);
  }
  public mot_evaluate_safety_need<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_safety_need<T>(value, criteria);
  }
  public mot_evaluate_social_need<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_social_need<T>(value, criteria);
  }
  public mot_evaluate_rest_need<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_rest_need<T>(value, criteria);
  }
  public mot_evaluate_curiosity_drive<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_curiosity_drive<T>(value, criteria);
  }
  public mot_evaluate_goal_urgency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_goal_urgency<T>(value, criteria);
  }
  public mot_evaluate_motivation_weight<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_motivation_weight<T>(value, criteria);
  }
  public mot_evaluate_need_satisfaction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_need_satisfaction<T>(value, criteria);
  }
  public mot_evaluate_motivation_conflict<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_motivation_conflict<T>(value, criteria);
  }
  public mot_evaluate_drive_prediction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.mot.mot_evaluate_drive_prediction<T>(value, criteria);
  }
  public mot_retrieve_hunger_need<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_hunger_need<T>(agentId, query);
  }
  public mot_retrieve_safety_need<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_safety_need<T>(agentId, query);
  }
  public mot_retrieve_social_need<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_social_need<T>(agentId, query);
  }
  public mot_retrieve_rest_need<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_rest_need<T>(agentId, query);
  }
  public mot_retrieve_curiosity_drive<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_curiosity_drive<T>(agentId, query);
  }
  public mot_retrieve_goal_urgency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_goal_urgency<T>(agentId, query);
  }
  public mot_retrieve_motivation_weight<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_motivation_weight<T>(agentId, query);
  }
  public mot_retrieve_need_satisfaction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_need_satisfaction<T>(agentId, query);
  }
  public mot_retrieve_motivation_conflict<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_motivation_conflict<T>(agentId, query);
  }
  public mot_retrieve_drive_prediction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.mot.mot_retrieve_drive_prediction<T>(agentId, query);
  }
  public mot_serialize_hunger_need<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_hunger_need<T>(data, format);
  }
  public mot_serialize_safety_need<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_safety_need<T>(data, format);
  }
  public mot_serialize_social_need<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_social_need<T>(data, format);
  }
  public mot_serialize_rest_need<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_rest_need<T>(data, format);
  }
  public mot_serialize_curiosity_drive<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_curiosity_drive<T>(data, format);
  }
  public mot_serialize_goal_urgency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_goal_urgency<T>(data, format);
  }
  public mot_serialize_motivation_weight<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_motivation_weight<T>(data, format);
  }
  public mot_serialize_need_satisfaction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_need_satisfaction<T>(data, format);
  }
  public mot_serialize_motivation_conflict<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_motivation_conflict<T>(data, format);
  }
  public mot_serialize_drive_prediction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.mot.mot_serialize_drive_prediction<T>(data, format);
  }
  public mot_compare_hunger_need<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_hunger_need<T>(a, b, options);
  }
  public mot_compare_safety_need<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_safety_need<T>(a, b, options);
  }
  public mot_compare_social_need<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_social_need<T>(a, b, options);
  }
  public mot_compare_rest_need<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_rest_need<T>(a, b, options);
  }
  public mot_compare_curiosity_drive<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_curiosity_drive<T>(a, b, options);
  }
  public mot_compare_goal_urgency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_goal_urgency<T>(a, b, options);
  }
  public mot_compare_motivation_weight<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_motivation_weight<T>(a, b, options);
  }
  public mot_compare_need_satisfaction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_need_satisfaction<T>(a, b, options);
  }
  public mot_compare_motivation_conflict<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_motivation_conflict<T>(a, b, options);
  }
  public mot_compare_drive_prediction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.mot.mot_compare_drive_prediction<T>(a, b, options);
  }
  public mot_prune_hunger_need(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_hunger_need(agentId, options);
  }
  public mot_prune_safety_need(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_safety_need(agentId, options);
  }
  public mot_prune_social_need(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_social_need(agentId, options);
  }
  public mot_prune_rest_need(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_rest_need(agentId, options);
  }
  public mot_prune_curiosity_drive(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_curiosity_drive(agentId, options);
  }
  public mot_prune_goal_urgency(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_goal_urgency(agentId, options);
  }
  public mot_prune_motivation_weight(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_motivation_weight(agentId, options);
  }
  public mot_prune_need_satisfaction(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_need_satisfaction(agentId, options);
  }
  public mot_prune_motivation_conflict(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_motivation_conflict(agentId, options);
  }
  public mot_prune_drive_prediction(agentId: string, options?: PruningOptions): PruningResult {
    return this.mot.mot_prune_drive_prediction(agentId, options);
  }

  // ==========================================================================
  // Module PRC: PRC — Nhận thức môi trường (100 hàm)
  // ==========================================================================

  public prc_initialize_environment_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_environment_state<T>(agentId, initialData, context);
  }
  public prc_initialize_nearby_threat<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_nearby_threat<T>(agentId, initialData, context);
  }
  public prc_initialize_target_distance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_target_distance<T>(agentId, initialData, context);
  }
  public prc_initialize_player_intent<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_player_intent<T>(agentId, initialData, context);
  }
  public prc_initialize_world_belief<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_world_belief<T>(agentId, initialData, context);
  }
  public prc_initialize_sensor_observation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_sensor_observation<T>(agentId, initialData, context);
  }
  public prc_initialize_hidden_opportunity<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_hidden_opportunity<T>(agentId, initialData, context);
  }
  public prc_initialize_perception_confidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_perception_confidence<T>(agentId, initialData, context);
  }
  public prc_initialize_ambiguous_signal<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_ambiguous_signal<T>(agentId, initialData, context);
  }
  public prc_initialize_environment_forecast<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_initialize_environment_forecast<T>(agentId, initialData, context);
  }
  public prc_capture_environment_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_environment_state<T>(agentId, data, context);
  }
  public prc_capture_nearby_threat<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_nearby_threat<T>(agentId, data, context);
  }
  public prc_capture_target_distance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_target_distance<T>(agentId, data, context);
  }
  public prc_capture_player_intent<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_player_intent<T>(agentId, data, context);
  }
  public prc_capture_world_belief<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_world_belief<T>(agentId, data, context);
  }
  public prc_capture_sensor_observation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_sensor_observation<T>(agentId, data, context);
  }
  public prc_capture_hidden_opportunity<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_hidden_opportunity<T>(agentId, data, context);
  }
  public prc_capture_perception_confidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_perception_confidence<T>(agentId, data, context);
  }
  public prc_capture_ambiguous_signal<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_ambiguous_signal<T>(agentId, data, context);
  }
  public prc_capture_environment_forecast<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_capture_environment_forecast<T>(agentId, data, context);
  }
  public prc_validate_environment_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_environment_state<T>(value, schema);
  }
  public prc_validate_nearby_threat<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_nearby_threat<T>(value, schema);
  }
  public prc_validate_target_distance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_target_distance<T>(value, schema);
  }
  public prc_validate_player_intent<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_player_intent<T>(value, schema);
  }
  public prc_validate_world_belief<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_world_belief<T>(value, schema);
  }
  public prc_validate_sensor_observation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_sensor_observation<T>(value, schema);
  }
  public prc_validate_hidden_opportunity<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_hidden_opportunity<T>(value, schema);
  }
  public prc_validate_perception_confidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_perception_confidence<T>(value, schema);
  }
  public prc_validate_ambiguous_signal<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_ambiguous_signal<T>(value, schema);
  }
  public prc_validate_environment_forecast<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.prc.prc_validate_environment_forecast<T>(value, schema);
  }
  public prc_normalize_environment_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_environment_state<T>(data, schema);
  }
  public prc_normalize_nearby_threat<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_nearby_threat<T>(data, schema);
  }
  public prc_normalize_target_distance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_target_distance<T>(data, schema);
  }
  public prc_normalize_player_intent<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_player_intent<T>(data, schema);
  }
  public prc_normalize_world_belief<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_world_belief<T>(data, schema);
  }
  public prc_normalize_sensor_observation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_sensor_observation<T>(data, schema);
  }
  public prc_normalize_hidden_opportunity<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_hidden_opportunity<T>(data, schema);
  }
  public prc_normalize_perception_confidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_perception_confidence<T>(data, schema);
  }
  public prc_normalize_ambiguous_signal<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_ambiguous_signal<T>(data, schema);
  }
  public prc_normalize_environment_forecast<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.prc.prc_normalize_environment_forecast<T>(data, schema);
  }
  public prc_update_environment_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_environment_state<T>(agentId, updateData, context);
  }
  public prc_update_nearby_threat<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_nearby_threat<T>(agentId, updateData, context);
  }
  public prc_update_target_distance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_target_distance<T>(agentId, updateData, context);
  }
  public prc_update_player_intent<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_player_intent<T>(agentId, updateData, context);
  }
  public prc_update_world_belief<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_world_belief<T>(agentId, updateData, context);
  }
  public prc_update_sensor_observation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_sensor_observation<T>(agentId, updateData, context);
  }
  public prc_update_hidden_opportunity<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_hidden_opportunity<T>(agentId, updateData, context);
  }
  public prc_update_perception_confidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_perception_confidence<T>(agentId, updateData, context);
  }
  public prc_update_ambiguous_signal<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_ambiguous_signal<T>(agentId, updateData, context);
  }
  public prc_update_environment_forecast<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.prc.prc_update_environment_forecast<T>(agentId, updateData, context);
  }
  public prc_evaluate_environment_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_environment_state<T>(value, criteria);
  }
  public prc_evaluate_nearby_threat<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_nearby_threat<T>(value, criteria);
  }
  public prc_evaluate_target_distance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_target_distance<T>(value, criteria);
  }
  public prc_evaluate_player_intent<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_player_intent<T>(value, criteria);
  }
  public prc_evaluate_world_belief<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_world_belief<T>(value, criteria);
  }
  public prc_evaluate_sensor_observation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_sensor_observation<T>(value, criteria);
  }
  public prc_evaluate_hidden_opportunity<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_hidden_opportunity<T>(value, criteria);
  }
  public prc_evaluate_perception_confidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_perception_confidence<T>(value, criteria);
  }
  public prc_evaluate_ambiguous_signal<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_ambiguous_signal<T>(value, criteria);
  }
  public prc_evaluate_environment_forecast<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.prc.prc_evaluate_environment_forecast<T>(value, criteria);
  }
  public prc_retrieve_environment_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_environment_state<T>(agentId, query);
  }
  public prc_retrieve_nearby_threat<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_nearby_threat<T>(agentId, query);
  }
  public prc_retrieve_target_distance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_target_distance<T>(agentId, query);
  }
  public prc_retrieve_player_intent<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_player_intent<T>(agentId, query);
  }
  public prc_retrieve_world_belief<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_world_belief<T>(agentId, query);
  }
  public prc_retrieve_sensor_observation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_sensor_observation<T>(agentId, query);
  }
  public prc_retrieve_hidden_opportunity<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_hidden_opportunity<T>(agentId, query);
  }
  public prc_retrieve_perception_confidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_perception_confidence<T>(agentId, query);
  }
  public prc_retrieve_ambiguous_signal<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_ambiguous_signal<T>(agentId, query);
  }
  public prc_retrieve_environment_forecast<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.prc.prc_retrieve_environment_forecast<T>(agentId, query);
  }
  public prc_serialize_environment_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_environment_state<T>(data, format);
  }
  public prc_serialize_nearby_threat<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_nearby_threat<T>(data, format);
  }
  public prc_serialize_target_distance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_target_distance<T>(data, format);
  }
  public prc_serialize_player_intent<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_player_intent<T>(data, format);
  }
  public prc_serialize_world_belief<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_world_belief<T>(data, format);
  }
  public prc_serialize_sensor_observation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_sensor_observation<T>(data, format);
  }
  public prc_serialize_hidden_opportunity<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_hidden_opportunity<T>(data, format);
  }
  public prc_serialize_perception_confidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_perception_confidence<T>(data, format);
  }
  public prc_serialize_ambiguous_signal<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_ambiguous_signal<T>(data, format);
  }
  public prc_serialize_environment_forecast<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.prc.prc_serialize_environment_forecast<T>(data, format);
  }
  public prc_compare_environment_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_environment_state<T>(a, b, options);
  }
  public prc_compare_nearby_threat<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_nearby_threat<T>(a, b, options);
  }
  public prc_compare_target_distance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_target_distance<T>(a, b, options);
  }
  public prc_compare_player_intent<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_player_intent<T>(a, b, options);
  }
  public prc_compare_world_belief<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_world_belief<T>(a, b, options);
  }
  public prc_compare_sensor_observation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_sensor_observation<T>(a, b, options);
  }
  public prc_compare_hidden_opportunity<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_hidden_opportunity<T>(a, b, options);
  }
  public prc_compare_perception_confidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_perception_confidence<T>(a, b, options);
  }
  public prc_compare_ambiguous_signal<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_ambiguous_signal<T>(a, b, options);
  }
  public prc_compare_environment_forecast<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.prc.prc_compare_environment_forecast<T>(a, b, options);
  }
  public prc_prune_environment_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_environment_state(agentId, options);
  }
  public prc_prune_nearby_threat(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_nearby_threat(agentId, options);
  }
  public prc_prune_target_distance(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_target_distance(agentId, options);
  }
  public prc_prune_player_intent(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_player_intent(agentId, options);
  }
  public prc_prune_world_belief(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_world_belief(agentId, options);
  }
  public prc_prune_sensor_observation(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_sensor_observation(agentId, options);
  }
  public prc_prune_hidden_opportunity(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_hidden_opportunity(agentId, options);
  }
  public prc_prune_perception_confidence(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_perception_confidence(agentId, options);
  }
  public prc_prune_ambiguous_signal(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_ambiguous_signal(agentId, options);
  }
  public prc_prune_environment_forecast(agentId: string, options?: PruningOptions): PruningResult {
    return this.prc.prc_prune_environment_forecast(agentId, options);
  }

  // ==========================================================================
  // Module RSN: RSN — Suy luận và ra quyết định (100 hàm)
  // ==========================================================================

  public rsn_initialize_candidate_action<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_candidate_action<T>(agentId, initialData, context);
  }
  public rsn_initialize_action_utility<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_action_utility<T>(agentId, initialData, context);
  }
  public rsn_initialize_decision_alternative<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_decision_alternative<T>(agentId, initialData, context);
  }
  public rsn_initialize_decision_confidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_decision_confidence<T>(agentId, initialData, context);
  }
  public rsn_initialize_rule_conflict<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_rule_conflict<T>(agentId, initialData, context);
  }
  public rsn_initialize_decision_constraint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_decision_constraint<T>(agentId, initialData, context);
  }
  public rsn_initialize_action_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_action_score<T>(agentId, initialData, context);
  }
  public rsn_initialize_decision_rationale<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_decision_rationale<T>(agentId, initialData, context);
  }
  public rsn_initialize_new_evidence<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_new_evidence<T>(agentId, initialData, context);
  }
  public rsn_initialize_decision_trace<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_initialize_decision_trace<T>(agentId, initialData, context);
  }
  public rsn_capture_candidate_action<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_candidate_action<T>(agentId, data, context);
  }
  public rsn_capture_action_utility<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_action_utility<T>(agentId, data, context);
  }
  public rsn_capture_decision_alternative<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_decision_alternative<T>(agentId, data, context);
  }
  public rsn_capture_decision_confidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_decision_confidence<T>(agentId, data, context);
  }
  public rsn_capture_rule_conflict<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_rule_conflict<T>(agentId, data, context);
  }
  public rsn_capture_decision_constraint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_decision_constraint<T>(agentId, data, context);
  }
  public rsn_capture_action_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_action_score<T>(agentId, data, context);
  }
  public rsn_capture_decision_rationale<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_decision_rationale<T>(agentId, data, context);
  }
  public rsn_capture_new_evidence<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_new_evidence<T>(agentId, data, context);
  }
  public rsn_capture_decision_trace<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_capture_decision_trace<T>(agentId, data, context);
  }
  public rsn_validate_candidate_action<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_candidate_action<T>(value, schema);
  }
  public rsn_validate_action_utility<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_action_utility<T>(value, schema);
  }
  public rsn_validate_decision_alternative<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_decision_alternative<T>(value, schema);
  }
  public rsn_validate_decision_confidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_decision_confidence<T>(value, schema);
  }
  public rsn_validate_rule_conflict<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_rule_conflict<T>(value, schema);
  }
  public rsn_validate_decision_constraint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_decision_constraint<T>(value, schema);
  }
  public rsn_validate_action_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_action_score<T>(value, schema);
  }
  public rsn_validate_decision_rationale<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_decision_rationale<T>(value, schema);
  }
  public rsn_validate_new_evidence<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_new_evidence<T>(value, schema);
  }
  public rsn_validate_decision_trace<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rsn.rsn_validate_decision_trace<T>(value, schema);
  }
  public rsn_normalize_candidate_action<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_candidate_action<T>(data, schema);
  }
  public rsn_normalize_action_utility<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_action_utility<T>(data, schema);
  }
  public rsn_normalize_decision_alternative<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_decision_alternative<T>(data, schema);
  }
  public rsn_normalize_decision_confidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_decision_confidence<T>(data, schema);
  }
  public rsn_normalize_rule_conflict<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_rule_conflict<T>(data, schema);
  }
  public rsn_normalize_decision_constraint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_decision_constraint<T>(data, schema);
  }
  public rsn_normalize_action_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_action_score<T>(data, schema);
  }
  public rsn_normalize_decision_rationale<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_decision_rationale<T>(data, schema);
  }
  public rsn_normalize_new_evidence<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_new_evidence<T>(data, schema);
  }
  public rsn_normalize_decision_trace<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rsn.rsn_normalize_decision_trace<T>(data, schema);
  }
  public rsn_update_candidate_action<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_candidate_action<T>(agentId, updateData, context);
  }
  public rsn_update_action_utility<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_action_utility<T>(agentId, updateData, context);
  }
  public rsn_update_decision_alternative<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_decision_alternative<T>(agentId, updateData, context);
  }
  public rsn_update_decision_confidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_decision_confidence<T>(agentId, updateData, context);
  }
  public rsn_update_rule_conflict<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_rule_conflict<T>(agentId, updateData, context);
  }
  public rsn_update_decision_constraint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_decision_constraint<T>(agentId, updateData, context);
  }
  public rsn_update_action_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_action_score<T>(agentId, updateData, context);
  }
  public rsn_update_decision_rationale<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_decision_rationale<T>(agentId, updateData, context);
  }
  public rsn_update_new_evidence<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_new_evidence<T>(agentId, updateData, context);
  }
  public rsn_update_decision_trace<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rsn.rsn_update_decision_trace<T>(agentId, updateData, context);
  }
  public rsn_evaluate_candidate_action<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_candidate_action<T>(value, criteria);
  }
  public rsn_evaluate_action_utility<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_action_utility<T>(value, criteria);
  }
  public rsn_evaluate_decision_alternative<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_decision_alternative<T>(value, criteria);
  }
  public rsn_evaluate_decision_confidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_decision_confidence<T>(value, criteria);
  }
  public rsn_evaluate_rule_conflict<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_rule_conflict<T>(value, criteria);
  }
  public rsn_evaluate_decision_constraint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_decision_constraint<T>(value, criteria);
  }
  public rsn_evaluate_action_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_action_score<T>(value, criteria);
  }
  public rsn_evaluate_decision_rationale<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_decision_rationale<T>(value, criteria);
  }
  public rsn_evaluate_new_evidence<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_new_evidence<T>(value, criteria);
  }
  public rsn_evaluate_decision_trace<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rsn.rsn_evaluate_decision_trace<T>(value, criteria);
  }
  public rsn_retrieve_candidate_action<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_candidate_action<T>(agentId, query);
  }
  public rsn_retrieve_action_utility<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_action_utility<T>(agentId, query);
  }
  public rsn_retrieve_decision_alternative<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_decision_alternative<T>(agentId, query);
  }
  public rsn_retrieve_decision_confidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_decision_confidence<T>(agentId, query);
  }
  public rsn_retrieve_rule_conflict<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_rule_conflict<T>(agentId, query);
  }
  public rsn_retrieve_decision_constraint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_decision_constraint<T>(agentId, query);
  }
  public rsn_retrieve_action_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_action_score<T>(agentId, query);
  }
  public rsn_retrieve_decision_rationale<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_decision_rationale<T>(agentId, query);
  }
  public rsn_retrieve_new_evidence<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_new_evidence<T>(agentId, query);
  }
  public rsn_retrieve_decision_trace<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rsn.rsn_retrieve_decision_trace<T>(agentId, query);
  }
  public rsn_serialize_candidate_action<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_candidate_action<T>(data, format);
  }
  public rsn_serialize_action_utility<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_action_utility<T>(data, format);
  }
  public rsn_serialize_decision_alternative<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_decision_alternative<T>(data, format);
  }
  public rsn_serialize_decision_confidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_decision_confidence<T>(data, format);
  }
  public rsn_serialize_rule_conflict<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_rule_conflict<T>(data, format);
  }
  public rsn_serialize_decision_constraint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_decision_constraint<T>(data, format);
  }
  public rsn_serialize_action_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_action_score<T>(data, format);
  }
  public rsn_serialize_decision_rationale<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_decision_rationale<T>(data, format);
  }
  public rsn_serialize_new_evidence<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_new_evidence<T>(data, format);
  }
  public rsn_serialize_decision_trace<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rsn.rsn_serialize_decision_trace<T>(data, format);
  }
  public rsn_compare_candidate_action<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_candidate_action<T>(a, b, options);
  }
  public rsn_compare_action_utility<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_action_utility<T>(a, b, options);
  }
  public rsn_compare_decision_alternative<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_decision_alternative<T>(a, b, options);
  }
  public rsn_compare_decision_confidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_decision_confidence<T>(a, b, options);
  }
  public rsn_compare_rule_conflict<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_rule_conflict<T>(a, b, options);
  }
  public rsn_compare_decision_constraint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_decision_constraint<T>(a, b, options);
  }
  public rsn_compare_action_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_action_score<T>(a, b, options);
  }
  public rsn_compare_decision_rationale<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_decision_rationale<T>(a, b, options);
  }
  public rsn_compare_new_evidence<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_new_evidence<T>(a, b, options);
  }
  public rsn_compare_decision_trace<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rsn.rsn_compare_decision_trace<T>(a, b, options);
  }
  public rsn_prune_candidate_action(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_candidate_action(agentId, options);
  }
  public rsn_prune_action_utility(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_action_utility(agentId, options);
  }
  public rsn_prune_decision_alternative(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_decision_alternative(agentId, options);
  }
  public rsn_prune_decision_confidence(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_decision_confidence(agentId, options);
  }
  public rsn_prune_rule_conflict(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_rule_conflict(agentId, options);
  }
  public rsn_prune_decision_constraint(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_decision_constraint(agentId, options);
  }
  public rsn_prune_action_score(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_action_score(agentId, options);
  }
  public rsn_prune_decision_rationale(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_decision_rationale(agentId, options);
  }
  public rsn_prune_new_evidence(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_new_evidence(agentId, options);
  }
  public rsn_prune_decision_trace(agentId: string, options?: PruningOptions): PruningResult {
    return this.rsn.rsn_prune_decision_trace(agentId, options);
  }

  // ==========================================================================
  // Module PLN: PLN — Lập kế hoạch và chiến thuật (100 hàm)
  // ==========================================================================

  public pln_initialize_goal_plan<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_goal_plan<T>(agentId, initialData, context);
  }
  public pln_initialize_plan_step<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_plan_step<T>(agentId, initialData, context);
  }
  public pln_initialize_plan_cost<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_plan_cost<T>(agentId, initialData, context);
  }
  public pln_initialize_plan_success<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_plan_success<T>(agentId, initialData, context);
  }
  public pln_initialize_fallback_plan<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_fallback_plan<T>(agentId, initialData, context);
  }
  public pln_initialize_combat_strategy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_combat_strategy<T>(agentId, initialData, context);
  }
  public pln_initialize_opponent_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_opponent_pattern<T>(agentId, initialData, context);
  }
  public pln_initialize_plan_progress<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_plan_progress<T>(agentId, initialData, context);
  }
  public pln_initialize_route_plan<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_route_plan<T>(agentId, initialData, context);
  }
  public pln_initialize_tactical_option<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_initialize_tactical_option<T>(agentId, initialData, context);
  }
  public pln_capture_goal_plan<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_goal_plan<T>(agentId, data, context);
  }
  public pln_capture_plan_step<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_plan_step<T>(agentId, data, context);
  }
  public pln_capture_plan_cost<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_plan_cost<T>(agentId, data, context);
  }
  public pln_capture_plan_success<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_plan_success<T>(agentId, data, context);
  }
  public pln_capture_fallback_plan<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_fallback_plan<T>(agentId, data, context);
  }
  public pln_capture_combat_strategy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_combat_strategy<T>(agentId, data, context);
  }
  public pln_capture_opponent_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_opponent_pattern<T>(agentId, data, context);
  }
  public pln_capture_plan_progress<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_plan_progress<T>(agentId, data, context);
  }
  public pln_capture_route_plan<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_route_plan<T>(agentId, data, context);
  }
  public pln_capture_tactical_option<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_capture_tactical_option<T>(agentId, data, context);
  }
  public pln_validate_goal_plan<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_goal_plan<T>(value, schema);
  }
  public pln_validate_plan_step<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_plan_step<T>(value, schema);
  }
  public pln_validate_plan_cost<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_plan_cost<T>(value, schema);
  }
  public pln_validate_plan_success<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_plan_success<T>(value, schema);
  }
  public pln_validate_fallback_plan<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_fallback_plan<T>(value, schema);
  }
  public pln_validate_combat_strategy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_combat_strategy<T>(value, schema);
  }
  public pln_validate_opponent_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_opponent_pattern<T>(value, schema);
  }
  public pln_validate_plan_progress<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_plan_progress<T>(value, schema);
  }
  public pln_validate_route_plan<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_route_plan<T>(value, schema);
  }
  public pln_validate_tactical_option<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pln.pln_validate_tactical_option<T>(value, schema);
  }
  public pln_normalize_goal_plan<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_goal_plan<T>(data, schema);
  }
  public pln_normalize_plan_step<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_plan_step<T>(data, schema);
  }
  public pln_normalize_plan_cost<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_plan_cost<T>(data, schema);
  }
  public pln_normalize_plan_success<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_plan_success<T>(data, schema);
  }
  public pln_normalize_fallback_plan<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_fallback_plan<T>(data, schema);
  }
  public pln_normalize_combat_strategy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_combat_strategy<T>(data, schema);
  }
  public pln_normalize_opponent_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_opponent_pattern<T>(data, schema);
  }
  public pln_normalize_plan_progress<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_plan_progress<T>(data, schema);
  }
  public pln_normalize_route_plan<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_route_plan<T>(data, schema);
  }
  public pln_normalize_tactical_option<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pln.pln_normalize_tactical_option<T>(data, schema);
  }
  public pln_update_goal_plan<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_goal_plan<T>(agentId, updateData, context);
  }
  public pln_update_plan_step<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_plan_step<T>(agentId, updateData, context);
  }
  public pln_update_plan_cost<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_plan_cost<T>(agentId, updateData, context);
  }
  public pln_update_plan_success<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_plan_success<T>(agentId, updateData, context);
  }
  public pln_update_fallback_plan<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_fallback_plan<T>(agentId, updateData, context);
  }
  public pln_update_combat_strategy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_combat_strategy<T>(agentId, updateData, context);
  }
  public pln_update_opponent_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_opponent_pattern<T>(agentId, updateData, context);
  }
  public pln_update_plan_progress<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_plan_progress<T>(agentId, updateData, context);
  }
  public pln_update_route_plan<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_route_plan<T>(agentId, updateData, context);
  }
  public pln_update_tactical_option<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pln.pln_update_tactical_option<T>(agentId, updateData, context);
  }
  public pln_evaluate_goal_plan<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_goal_plan<T>(value, criteria);
  }
  public pln_evaluate_plan_step<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_plan_step<T>(value, criteria);
  }
  public pln_evaluate_plan_cost<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_plan_cost<T>(value, criteria);
  }
  public pln_evaluate_plan_success<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_plan_success<T>(value, criteria);
  }
  public pln_evaluate_fallback_plan<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_fallback_plan<T>(value, criteria);
  }
  public pln_evaluate_combat_strategy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_combat_strategy<T>(value, criteria);
  }
  public pln_evaluate_opponent_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_opponent_pattern<T>(value, criteria);
  }
  public pln_evaluate_plan_progress<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_plan_progress<T>(value, criteria);
  }
  public pln_evaluate_route_plan<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_route_plan<T>(value, criteria);
  }
  public pln_evaluate_tactical_option<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pln.pln_evaluate_tactical_option<T>(value, criteria);
  }
  public pln_retrieve_goal_plan<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_goal_plan<T>(agentId, query);
  }
  public pln_retrieve_plan_step<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_plan_step<T>(agentId, query);
  }
  public pln_retrieve_plan_cost<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_plan_cost<T>(agentId, query);
  }
  public pln_retrieve_plan_success<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_plan_success<T>(agentId, query);
  }
  public pln_retrieve_fallback_plan<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_fallback_plan<T>(agentId, query);
  }
  public pln_retrieve_combat_strategy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_combat_strategy<T>(agentId, query);
  }
  public pln_retrieve_opponent_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_opponent_pattern<T>(agentId, query);
  }
  public pln_retrieve_plan_progress<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_plan_progress<T>(agentId, query);
  }
  public pln_retrieve_route_plan<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_route_plan<T>(agentId, query);
  }
  public pln_retrieve_tactical_option<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pln.pln_retrieve_tactical_option<T>(agentId, query);
  }
  public pln_serialize_goal_plan<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_goal_plan<T>(data, format);
  }
  public pln_serialize_plan_step<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_plan_step<T>(data, format);
  }
  public pln_serialize_plan_cost<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_plan_cost<T>(data, format);
  }
  public pln_serialize_plan_success<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_plan_success<T>(data, format);
  }
  public pln_serialize_fallback_plan<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_fallback_plan<T>(data, format);
  }
  public pln_serialize_combat_strategy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_combat_strategy<T>(data, format);
  }
  public pln_serialize_opponent_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_opponent_pattern<T>(data, format);
  }
  public pln_serialize_plan_progress<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_plan_progress<T>(data, format);
  }
  public pln_serialize_route_plan<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_route_plan<T>(data, format);
  }
  public pln_serialize_tactical_option<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pln.pln_serialize_tactical_option<T>(data, format);
  }
  public pln_compare_goal_plan<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_goal_plan<T>(a, b, options);
  }
  public pln_compare_plan_step<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_plan_step<T>(a, b, options);
  }
  public pln_compare_plan_cost<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_plan_cost<T>(a, b, options);
  }
  public pln_compare_plan_success<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_plan_success<T>(a, b, options);
  }
  public pln_compare_fallback_plan<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_fallback_plan<T>(a, b, options);
  }
  public pln_compare_combat_strategy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_combat_strategy<T>(a, b, options);
  }
  public pln_compare_opponent_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_opponent_pattern<T>(a, b, options);
  }
  public pln_compare_plan_progress<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_plan_progress<T>(a, b, options);
  }
  public pln_compare_route_plan<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_route_plan<T>(a, b, options);
  }
  public pln_compare_tactical_option<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pln.pln_compare_tactical_option<T>(a, b, options);
  }
  public pln_prune_goal_plan(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_goal_plan(agentId, options);
  }
  public pln_prune_plan_step(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_plan_step(agentId, options);
  }
  public pln_prune_plan_cost(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_plan_cost(agentId, options);
  }
  public pln_prune_plan_success(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_plan_success(agentId, options);
  }
  public pln_prune_fallback_plan(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_fallback_plan(agentId, options);
  }
  public pln_prune_combat_strategy(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_combat_strategy(agentId, options);
  }
  public pln_prune_opponent_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_opponent_pattern(agentId, options);
  }
  public pln_prune_plan_progress(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_plan_progress(agentId, options);
  }
  public pln_prune_route_plan(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_route_plan(agentId, options);
  }
  public pln_prune_tactical_option(agentId: string, options?: PruningOptions): PruningResult {
    return this.pln.pln_prune_tactical_option(agentId, options);
  }

  // ==========================================================================
  // Module SKL: SKL — Kỹ năng và tiến bộ cá nhân (100 hàm)
  // ==========================================================================

  public skl_initialize_skill_profile<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_skill_profile<T>(agentId, initialData, context);
  }
  public skl_initialize_practice_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_practice_record<T>(agentId, initialData, context);
  }
  public skl_initialize_skill_proficiency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_skill_proficiency<T>(agentId, initialData, context);
  }
  public skl_initialize_learning_rate<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_learning_rate<T>(agentId, initialData, context);
  }
  public skl_initialize_skill_plateau<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_skill_plateau<T>(agentId, initialData, context);
  }
  public skl_initialize_practice_schedule<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_practice_schedule<T>(agentId, initialData, context);
  }
  public skl_initialize_skill_transfer<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_skill_transfer<T>(agentId, initialData, context);
  }
  public skl_initialize_skill_retention<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_skill_retention<T>(agentId, initialData, context);
  }
  public skl_initialize_unused_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_unused_skill<T>(agentId, initialData, context);
  }
  public skl_initialize_advanced_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_initialize_advanced_skill<T>(agentId, initialData, context);
  }
  public skl_capture_skill_profile<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_skill_profile<T>(agentId, data, context);
  }
  public skl_capture_practice_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_practice_record<T>(agentId, data, context);
  }
  public skl_capture_skill_proficiency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_skill_proficiency<T>(agentId, data, context);
  }
  public skl_capture_learning_rate<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_learning_rate<T>(agentId, data, context);
  }
  public skl_capture_skill_plateau<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_skill_plateau<T>(agentId, data, context);
  }
  public skl_capture_practice_schedule<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_practice_schedule<T>(agentId, data, context);
  }
  public skl_capture_skill_transfer<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_skill_transfer<T>(agentId, data, context);
  }
  public skl_capture_skill_retention<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_skill_retention<T>(agentId, data, context);
  }
  public skl_capture_unused_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_unused_skill<T>(agentId, data, context);
  }
  public skl_capture_advanced_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_capture_advanced_skill<T>(agentId, data, context);
  }
  public skl_validate_skill_profile<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_skill_profile<T>(value, schema);
  }
  public skl_validate_practice_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_practice_record<T>(value, schema);
  }
  public skl_validate_skill_proficiency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_skill_proficiency<T>(value, schema);
  }
  public skl_validate_learning_rate<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_learning_rate<T>(value, schema);
  }
  public skl_validate_skill_plateau<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_skill_plateau<T>(value, schema);
  }
  public skl_validate_practice_schedule<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_practice_schedule<T>(value, schema);
  }
  public skl_validate_skill_transfer<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_skill_transfer<T>(value, schema);
  }
  public skl_validate_skill_retention<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_skill_retention<T>(value, schema);
  }
  public skl_validate_unused_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_unused_skill<T>(value, schema);
  }
  public skl_validate_advanced_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.skl.skl_validate_advanced_skill<T>(value, schema);
  }
  public skl_normalize_skill_profile<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_skill_profile<T>(data, schema);
  }
  public skl_normalize_practice_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_practice_record<T>(data, schema);
  }
  public skl_normalize_skill_proficiency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_skill_proficiency<T>(data, schema);
  }
  public skl_normalize_learning_rate<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_learning_rate<T>(data, schema);
  }
  public skl_normalize_skill_plateau<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_skill_plateau<T>(data, schema);
  }
  public skl_normalize_practice_schedule<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_practice_schedule<T>(data, schema);
  }
  public skl_normalize_skill_transfer<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_skill_transfer<T>(data, schema);
  }
  public skl_normalize_skill_retention<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_skill_retention<T>(data, schema);
  }
  public skl_normalize_unused_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_unused_skill<T>(data, schema);
  }
  public skl_normalize_advanced_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.skl.skl_normalize_advanced_skill<T>(data, schema);
  }
  public skl_update_skill_profile<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_skill_profile<T>(agentId, updateData, context);
  }
  public skl_update_practice_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_practice_record<T>(agentId, updateData, context);
  }
  public skl_update_skill_proficiency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_skill_proficiency<T>(agentId, updateData, context);
  }
  public skl_update_learning_rate<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_learning_rate<T>(agentId, updateData, context);
  }
  public skl_update_skill_plateau<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_skill_plateau<T>(agentId, updateData, context);
  }
  public skl_update_practice_schedule<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_practice_schedule<T>(agentId, updateData, context);
  }
  public skl_update_skill_transfer<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_skill_transfer<T>(agentId, updateData, context);
  }
  public skl_update_skill_retention<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_skill_retention<T>(agentId, updateData, context);
  }
  public skl_update_unused_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_unused_skill<T>(agentId, updateData, context);
  }
  public skl_update_advanced_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.skl.skl_update_advanced_skill<T>(agentId, updateData, context);
  }
  public skl_evaluate_skill_profile<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_skill_profile<T>(value, criteria);
  }
  public skl_evaluate_practice_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_practice_record<T>(value, criteria);
  }
  public skl_evaluate_skill_proficiency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_skill_proficiency<T>(value, criteria);
  }
  public skl_evaluate_learning_rate<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_learning_rate<T>(value, criteria);
  }
  public skl_evaluate_skill_plateau<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_skill_plateau<T>(value, criteria);
  }
  public skl_evaluate_practice_schedule<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_practice_schedule<T>(value, criteria);
  }
  public skl_evaluate_skill_transfer<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_skill_transfer<T>(value, criteria);
  }
  public skl_evaluate_skill_retention<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_skill_retention<T>(value, criteria);
  }
  public skl_evaluate_unused_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_unused_skill<T>(value, criteria);
  }
  public skl_evaluate_advanced_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.skl.skl_evaluate_advanced_skill<T>(value, criteria);
  }
  public skl_retrieve_skill_profile<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_skill_profile<T>(agentId, query);
  }
  public skl_retrieve_practice_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_practice_record<T>(agentId, query);
  }
  public skl_retrieve_skill_proficiency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_skill_proficiency<T>(agentId, query);
  }
  public skl_retrieve_learning_rate<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_learning_rate<T>(agentId, query);
  }
  public skl_retrieve_skill_plateau<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_skill_plateau<T>(agentId, query);
  }
  public skl_retrieve_practice_schedule<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_practice_schedule<T>(agentId, query);
  }
  public skl_retrieve_skill_transfer<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_skill_transfer<T>(agentId, query);
  }
  public skl_retrieve_skill_retention<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_skill_retention<T>(agentId, query);
  }
  public skl_retrieve_unused_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_unused_skill<T>(agentId, query);
  }
  public skl_retrieve_advanced_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.skl.skl_retrieve_advanced_skill<T>(agentId, query);
  }
  public skl_serialize_skill_profile<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_skill_profile<T>(data, format);
  }
  public skl_serialize_practice_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_practice_record<T>(data, format);
  }
  public skl_serialize_skill_proficiency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_skill_proficiency<T>(data, format);
  }
  public skl_serialize_learning_rate<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_learning_rate<T>(data, format);
  }
  public skl_serialize_skill_plateau<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_skill_plateau<T>(data, format);
  }
  public skl_serialize_practice_schedule<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_practice_schedule<T>(data, format);
  }
  public skl_serialize_skill_transfer<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_skill_transfer<T>(data, format);
  }
  public skl_serialize_skill_retention<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_skill_retention<T>(data, format);
  }
  public skl_serialize_unused_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_unused_skill<T>(data, format);
  }
  public skl_serialize_advanced_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.skl.skl_serialize_advanced_skill<T>(data, format);
  }
  public skl_compare_skill_profile<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_skill_profile<T>(a, b, options);
  }
  public skl_compare_practice_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_practice_record<T>(a, b, options);
  }
  public skl_compare_skill_proficiency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_skill_proficiency<T>(a, b, options);
  }
  public skl_compare_learning_rate<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_learning_rate<T>(a, b, options);
  }
  public skl_compare_skill_plateau<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_skill_plateau<T>(a, b, options);
  }
  public skl_compare_practice_schedule<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_practice_schedule<T>(a, b, options);
  }
  public skl_compare_skill_transfer<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_skill_transfer<T>(a, b, options);
  }
  public skl_compare_skill_retention<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_skill_retention<T>(a, b, options);
  }
  public skl_compare_unused_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_unused_skill<T>(a, b, options);
  }
  public skl_compare_advanced_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.skl.skl_compare_advanced_skill<T>(a, b, options);
  }
  public skl_prune_skill_profile(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_skill_profile(agentId, options);
  }
  public skl_prune_practice_record(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_practice_record(agentId, options);
  }
  public skl_prune_skill_proficiency(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_skill_proficiency(agentId, options);
  }
  public skl_prune_learning_rate(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_learning_rate(agentId, options);
  }
  public skl_prune_skill_plateau(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_skill_plateau(agentId, options);
  }
  public skl_prune_practice_schedule(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_practice_schedule(agentId, options);
  }
  public skl_prune_skill_transfer(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_skill_transfer(agentId, options);
  }
  public skl_prune_skill_retention(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_skill_retention(agentId, options);
  }
  public skl_prune_unused_skill(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_unused_skill(agentId, options);
  }
  public skl_prune_advanced_skill(agentId: string, options?: PruningOptions): PruningResult {
    return this.skl.skl_prune_advanced_skill(agentId, options);
  }

  // ==========================================================================
  // Module REL: REL — Quan hệ và danh tiếng (100 hàm)
  // ==========================================================================

  public rel_initialize_relationship_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_relationship_record<T>(agentId, initialData, context);
  }
  public rel_initialize_social_interaction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_social_interaction<T>(agentId, initialData, context);
  }
  public rel_initialize_reputation_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_reputation_score<T>(agentId, initialData, context);
  }
  public rel_initialize_relationship_trust<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_relationship_trust<T>(agentId, initialData, context);
  }
  public rel_initialize_grievance_history<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_grievance_history<T>(agentId, initialData, context);
  }
  public rel_initialize_friendship_strength<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_friendship_strength<T>(agentId, initialData, context);
  }
  public rel_initialize_faction_standing<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_faction_standing<T>(agentId, initialData, context);
  }
  public rel_initialize_broken_promise<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_broken_promise<T>(agentId, initialData, context);
  }
  public rel_initialize_relationship_conflict<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_relationship_conflict<T>(agentId, initialData, context);
  }
  public rel_initialize_social_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_initialize_social_memory<T>(agentId, initialData, context);
  }
  public rel_capture_relationship_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_relationship_record<T>(agentId, data, context);
  }
  public rel_capture_social_interaction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_social_interaction<T>(agentId, data, context);
  }
  public rel_capture_reputation_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_reputation_score<T>(agentId, data, context);
  }
  public rel_capture_relationship_trust<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_relationship_trust<T>(agentId, data, context);
  }
  public rel_capture_grievance_history<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_grievance_history<T>(agentId, data, context);
  }
  public rel_capture_friendship_strength<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_friendship_strength<T>(agentId, data, context);
  }
  public rel_capture_faction_standing<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_faction_standing<T>(agentId, data, context);
  }
  public rel_capture_broken_promise<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_broken_promise<T>(agentId, data, context);
  }
  public rel_capture_relationship_conflict<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_relationship_conflict<T>(agentId, data, context);
  }
  public rel_capture_social_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_capture_social_memory<T>(agentId, data, context);
  }
  public rel_validate_relationship_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_relationship_record<T>(value, schema);
  }
  public rel_validate_social_interaction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_social_interaction<T>(value, schema);
  }
  public rel_validate_reputation_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_reputation_score<T>(value, schema);
  }
  public rel_validate_relationship_trust<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_relationship_trust<T>(value, schema);
  }
  public rel_validate_grievance_history<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_grievance_history<T>(value, schema);
  }
  public rel_validate_friendship_strength<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_friendship_strength<T>(value, schema);
  }
  public rel_validate_faction_standing<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_faction_standing<T>(value, schema);
  }
  public rel_validate_broken_promise<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_broken_promise<T>(value, schema);
  }
  public rel_validate_relationship_conflict<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_relationship_conflict<T>(value, schema);
  }
  public rel_validate_social_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.rel.rel_validate_social_memory<T>(value, schema);
  }
  public rel_normalize_relationship_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_relationship_record<T>(data, schema);
  }
  public rel_normalize_social_interaction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_social_interaction<T>(data, schema);
  }
  public rel_normalize_reputation_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_reputation_score<T>(data, schema);
  }
  public rel_normalize_relationship_trust<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_relationship_trust<T>(data, schema);
  }
  public rel_normalize_grievance_history<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_grievance_history<T>(data, schema);
  }
  public rel_normalize_friendship_strength<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_friendship_strength<T>(data, schema);
  }
  public rel_normalize_faction_standing<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_faction_standing<T>(data, schema);
  }
  public rel_normalize_broken_promise<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_broken_promise<T>(data, schema);
  }
  public rel_normalize_relationship_conflict<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_relationship_conflict<T>(data, schema);
  }
  public rel_normalize_social_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.rel.rel_normalize_social_memory<T>(data, schema);
  }
  public rel_update_relationship_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_relationship_record<T>(agentId, updateData, context);
  }
  public rel_update_social_interaction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_social_interaction<T>(agentId, updateData, context);
  }
  public rel_update_reputation_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_reputation_score<T>(agentId, updateData, context);
  }
  public rel_update_relationship_trust<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_relationship_trust<T>(agentId, updateData, context);
  }
  public rel_update_grievance_history<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_grievance_history<T>(agentId, updateData, context);
  }
  public rel_update_friendship_strength<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_friendship_strength<T>(agentId, updateData, context);
  }
  public rel_update_faction_standing<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_faction_standing<T>(agentId, updateData, context);
  }
  public rel_update_broken_promise<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_broken_promise<T>(agentId, updateData, context);
  }
  public rel_update_relationship_conflict<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_relationship_conflict<T>(agentId, updateData, context);
  }
  public rel_update_social_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.rel.rel_update_social_memory<T>(agentId, updateData, context);
  }
  public rel_evaluate_relationship_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_relationship_record<T>(value, criteria);
  }
  public rel_evaluate_social_interaction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_social_interaction<T>(value, criteria);
  }
  public rel_evaluate_reputation_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_reputation_score<T>(value, criteria);
  }
  public rel_evaluate_relationship_trust<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_relationship_trust<T>(value, criteria);
  }
  public rel_evaluate_grievance_history<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_grievance_history<T>(value, criteria);
  }
  public rel_evaluate_friendship_strength<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_friendship_strength<T>(value, criteria);
  }
  public rel_evaluate_faction_standing<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_faction_standing<T>(value, criteria);
  }
  public rel_evaluate_broken_promise<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_broken_promise<T>(value, criteria);
  }
  public rel_evaluate_relationship_conflict<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_relationship_conflict<T>(value, criteria);
  }
  public rel_evaluate_social_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.rel.rel_evaluate_social_memory<T>(value, criteria);
  }
  public rel_retrieve_relationship_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_relationship_record<T>(agentId, query);
  }
  public rel_retrieve_social_interaction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_social_interaction<T>(agentId, query);
  }
  public rel_retrieve_reputation_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_reputation_score<T>(agentId, query);
  }
  public rel_retrieve_relationship_trust<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_relationship_trust<T>(agentId, query);
  }
  public rel_retrieve_grievance_history<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_grievance_history<T>(agentId, query);
  }
  public rel_retrieve_friendship_strength<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_friendship_strength<T>(agentId, query);
  }
  public rel_retrieve_faction_standing<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_faction_standing<T>(agentId, query);
  }
  public rel_retrieve_broken_promise<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_broken_promise<T>(agentId, query);
  }
  public rel_retrieve_relationship_conflict<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_relationship_conflict<T>(agentId, query);
  }
  public rel_retrieve_social_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.rel.rel_retrieve_social_memory<T>(agentId, query);
  }
  public rel_serialize_relationship_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_relationship_record<T>(data, format);
  }
  public rel_serialize_social_interaction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_social_interaction<T>(data, format);
  }
  public rel_serialize_reputation_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_reputation_score<T>(data, format);
  }
  public rel_serialize_relationship_trust<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_relationship_trust<T>(data, format);
  }
  public rel_serialize_grievance_history<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_grievance_history<T>(data, format);
  }
  public rel_serialize_friendship_strength<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_friendship_strength<T>(data, format);
  }
  public rel_serialize_faction_standing<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_faction_standing<T>(data, format);
  }
  public rel_serialize_broken_promise<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_broken_promise<T>(data, format);
  }
  public rel_serialize_relationship_conflict<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_relationship_conflict<T>(data, format);
  }
  public rel_serialize_social_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.rel.rel_serialize_social_memory<T>(data, format);
  }
  public rel_compare_relationship_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_relationship_record<T>(a, b, options);
  }
  public rel_compare_social_interaction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_social_interaction<T>(a, b, options);
  }
  public rel_compare_reputation_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_reputation_score<T>(a, b, options);
  }
  public rel_compare_relationship_trust<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_relationship_trust<T>(a, b, options);
  }
  public rel_compare_grievance_history<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_grievance_history<T>(a, b, options);
  }
  public rel_compare_friendship_strength<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_friendship_strength<T>(a, b, options);
  }
  public rel_compare_faction_standing<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_faction_standing<T>(a, b, options);
  }
  public rel_compare_broken_promise<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_broken_promise<T>(a, b, options);
  }
  public rel_compare_relationship_conflict<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_relationship_conflict<T>(a, b, options);
  }
  public rel_compare_social_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.rel.rel_compare_social_memory<T>(a, b, options);
  }
  public rel_prune_relationship_record(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_relationship_record(agentId, options);
  }
  public rel_prune_social_interaction(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_social_interaction(agentId, options);
  }
  public rel_prune_reputation_score(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_reputation_score(agentId, options);
  }
  public rel_prune_relationship_trust(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_relationship_trust(agentId, options);
  }
  public rel_prune_grievance_history(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_grievance_history(agentId, options);
  }
  public rel_prune_friendship_strength(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_friendship_strength(agentId, options);
  }
  public rel_prune_faction_standing(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_faction_standing(agentId, options);
  }
  public rel_prune_broken_promise(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_broken_promise(agentId, options);
  }
  public rel_prune_relationship_conflict(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_relationship_conflict(agentId, options);
  }
  public rel_prune_social_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.rel.rel_prune_social_memory(agentId, options);
  }

  // ==========================================================================
  // Module SOC: SOC — Học tập xã hội và phối hợp nhóm (100 hàm)
  // ==========================================================================

  public soc_initialize_peer_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_peer_behavior<T>(agentId, initialData, context);
  }
  public soc_initialize_peer_strategy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_peer_strategy<T>(agentId, initialData, context);
  }
  public soc_initialize_team_knowledge<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_team_knowledge<T>(agentId, initialData, context);
  }
  public soc_initialize_demonstration_example<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_demonstration_example<T>(agentId, initialData, context);
  }
  public soc_initialize_peer_reliability<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_peer_reliability<T>(agentId, initialData, context);
  }
  public soc_initialize_coordination_model<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_coordination_model<T>(agentId, initialData, context);
  }
  public soc_initialize_social_convention<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_social_convention<T>(agentId, initialData, context);
  }
  public soc_initialize_imitated_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_imitated_behavior<T>(agentId, initialData, context);
  }
  public soc_initialize_social_information<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_social_information<T>(agentId, initialData, context);
  }
  public soc_initialize_shared_belief<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_initialize_shared_belief<T>(agentId, initialData, context);
  }
  public soc_capture_peer_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_peer_behavior<T>(agentId, data, context);
  }
  public soc_capture_peer_strategy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_peer_strategy<T>(agentId, data, context);
  }
  public soc_capture_team_knowledge<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_team_knowledge<T>(agentId, data, context);
  }
  public soc_capture_demonstration_example<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_demonstration_example<T>(agentId, data, context);
  }
  public soc_capture_peer_reliability<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_peer_reliability<T>(agentId, data, context);
  }
  public soc_capture_coordination_model<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_coordination_model<T>(agentId, data, context);
  }
  public soc_capture_social_convention<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_social_convention<T>(agentId, data, context);
  }
  public soc_capture_imitated_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_imitated_behavior<T>(agentId, data, context);
  }
  public soc_capture_social_information<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_social_information<T>(agentId, data, context);
  }
  public soc_capture_shared_belief<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_capture_shared_belief<T>(agentId, data, context);
  }
  public soc_validate_peer_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_peer_behavior<T>(value, schema);
  }
  public soc_validate_peer_strategy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_peer_strategy<T>(value, schema);
  }
  public soc_validate_team_knowledge<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_team_knowledge<T>(value, schema);
  }
  public soc_validate_demonstration_example<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_demonstration_example<T>(value, schema);
  }
  public soc_validate_peer_reliability<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_peer_reliability<T>(value, schema);
  }
  public soc_validate_coordination_model<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_coordination_model<T>(value, schema);
  }
  public soc_validate_social_convention<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_social_convention<T>(value, schema);
  }
  public soc_validate_imitated_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_imitated_behavior<T>(value, schema);
  }
  public soc_validate_social_information<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_social_information<T>(value, schema);
  }
  public soc_validate_shared_belief<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.soc.soc_validate_shared_belief<T>(value, schema);
  }
  public soc_normalize_peer_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_peer_behavior<T>(data, schema);
  }
  public soc_normalize_peer_strategy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_peer_strategy<T>(data, schema);
  }
  public soc_normalize_team_knowledge<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_team_knowledge<T>(data, schema);
  }
  public soc_normalize_demonstration_example<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_demonstration_example<T>(data, schema);
  }
  public soc_normalize_peer_reliability<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_peer_reliability<T>(data, schema);
  }
  public soc_normalize_coordination_model<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_coordination_model<T>(data, schema);
  }
  public soc_normalize_social_convention<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_social_convention<T>(data, schema);
  }
  public soc_normalize_imitated_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_imitated_behavior<T>(data, schema);
  }
  public soc_normalize_social_information<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_social_information<T>(data, schema);
  }
  public soc_normalize_shared_belief<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.soc.soc_normalize_shared_belief<T>(data, schema);
  }
  public soc_update_peer_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_peer_behavior<T>(agentId, updateData, context);
  }
  public soc_update_peer_strategy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_peer_strategy<T>(agentId, updateData, context);
  }
  public soc_update_team_knowledge<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_team_knowledge<T>(agentId, updateData, context);
  }
  public soc_update_demonstration_example<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_demonstration_example<T>(agentId, updateData, context);
  }
  public soc_update_peer_reliability<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_peer_reliability<T>(agentId, updateData, context);
  }
  public soc_update_coordination_model<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_coordination_model<T>(agentId, updateData, context);
  }
  public soc_update_social_convention<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_social_convention<T>(agentId, updateData, context);
  }
  public soc_update_imitated_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_imitated_behavior<T>(agentId, updateData, context);
  }
  public soc_update_social_information<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_social_information<T>(agentId, updateData, context);
  }
  public soc_update_shared_belief<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.soc.soc_update_shared_belief<T>(agentId, updateData, context);
  }
  public soc_evaluate_peer_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_peer_behavior<T>(value, criteria);
  }
  public soc_evaluate_peer_strategy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_peer_strategy<T>(value, criteria);
  }
  public soc_evaluate_team_knowledge<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_team_knowledge<T>(value, criteria);
  }
  public soc_evaluate_demonstration_example<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_demonstration_example<T>(value, criteria);
  }
  public soc_evaluate_peer_reliability<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_peer_reliability<T>(value, criteria);
  }
  public soc_evaluate_coordination_model<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_coordination_model<T>(value, criteria);
  }
  public soc_evaluate_social_convention<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_social_convention<T>(value, criteria);
  }
  public soc_evaluate_imitated_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_imitated_behavior<T>(value, criteria);
  }
  public soc_evaluate_social_information<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_social_information<T>(value, criteria);
  }
  public soc_evaluate_shared_belief<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.soc.soc_evaluate_shared_belief<T>(value, criteria);
  }
  public soc_retrieve_peer_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_peer_behavior<T>(agentId, query);
  }
  public soc_retrieve_peer_strategy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_peer_strategy<T>(agentId, query);
  }
  public soc_retrieve_team_knowledge<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_team_knowledge<T>(agentId, query);
  }
  public soc_retrieve_demonstration_example<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_demonstration_example<T>(agentId, query);
  }
  public soc_retrieve_peer_reliability<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_peer_reliability<T>(agentId, query);
  }
  public soc_retrieve_coordination_model<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_coordination_model<T>(agentId, query);
  }
  public soc_retrieve_social_convention<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_social_convention<T>(agentId, query);
  }
  public soc_retrieve_imitated_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_imitated_behavior<T>(agentId, query);
  }
  public soc_retrieve_social_information<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_social_information<T>(agentId, query);
  }
  public soc_retrieve_shared_belief<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.soc.soc_retrieve_shared_belief<T>(agentId, query);
  }
  public soc_serialize_peer_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_peer_behavior<T>(data, format);
  }
  public soc_serialize_peer_strategy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_peer_strategy<T>(data, format);
  }
  public soc_serialize_team_knowledge<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_team_knowledge<T>(data, format);
  }
  public soc_serialize_demonstration_example<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_demonstration_example<T>(data, format);
  }
  public soc_serialize_peer_reliability<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_peer_reliability<T>(data, format);
  }
  public soc_serialize_coordination_model<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_coordination_model<T>(data, format);
  }
  public soc_serialize_social_convention<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_social_convention<T>(data, format);
  }
  public soc_serialize_imitated_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_imitated_behavior<T>(data, format);
  }
  public soc_serialize_social_information<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_social_information<T>(data, format);
  }
  public soc_serialize_shared_belief<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.soc.soc_serialize_shared_belief<T>(data, format);
  }
  public soc_compare_peer_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_peer_behavior<T>(a, b, options);
  }
  public soc_compare_peer_strategy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_peer_strategy<T>(a, b, options);
  }
  public soc_compare_team_knowledge<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_team_knowledge<T>(a, b, options);
  }
  public soc_compare_demonstration_example<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_demonstration_example<T>(a, b, options);
  }
  public soc_compare_peer_reliability<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_peer_reliability<T>(a, b, options);
  }
  public soc_compare_coordination_model<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_coordination_model<T>(a, b, options);
  }
  public soc_compare_social_convention<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_social_convention<T>(a, b, options);
  }
  public soc_compare_imitated_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_imitated_behavior<T>(a, b, options);
  }
  public soc_compare_social_information<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_social_information<T>(a, b, options);
  }
  public soc_compare_shared_belief<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.soc.soc_compare_shared_belief<T>(a, b, options);
  }
  public soc_prune_peer_behavior(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_peer_behavior(agentId, options);
  }
  public soc_prune_peer_strategy(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_peer_strategy(agentId, options);
  }
  public soc_prune_team_knowledge(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_team_knowledge(agentId, options);
  }
  public soc_prune_demonstration_example(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_demonstration_example(agentId, options);
  }
  public soc_prune_peer_reliability(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_peer_reliability(agentId, options);
  }
  public soc_prune_coordination_model(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_coordination_model(agentId, options);
  }
  public soc_prune_social_convention(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_social_convention(agentId, options);
  }
  public soc_prune_imitated_behavior(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_imitated_behavior(agentId, options);
  }
  public soc_prune_social_information(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_social_information(agentId, options);
  }
  public soc_prune_shared_belief(agentId: string, options?: PruningOptions): PruningResult {
    return this.soc.soc_prune_shared_belief(agentId, options);
  }

  // ==========================================================================
  // Module CBT: CBT — NPC và AI chiến đấu (100 hàm)
  // ==========================================================================

  public cbt_initialize_player_attack_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_player_attack_pattern<T>(agentId, initialData, context);
  }
  public cbt_initialize_dodge_direction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_dodge_direction<T>(agentId, initialData, context);
  }
  public cbt_initialize_counter_strategy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_counter_strategy<T>(agentId, initialData, context);
  }
  public cbt_initialize_attack_timing<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_attack_timing<T>(agentId, initialData, context);
  }
  public cbt_initialize_defensive_stance<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_defensive_stance<T>(agentId, initialData, context);
  }
  public cbt_initialize_combat_exchange<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_combat_exchange<T>(agentId, initialData, context);
  }
  public cbt_initialize_opponent_skill<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_opponent_skill<T>(agentId, initialData, context);
  }
  public cbt_initialize_flanking_behavior<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_flanking_behavior<T>(agentId, initialData, context);
  }
  public cbt_initialize_trap_location<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_trap_location<T>(agentId, initialData, context);
  }
  public cbt_initialize_combat_adaptation<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_initialize_combat_adaptation<T>(agentId, initialData, context);
  }
  public cbt_capture_player_attack_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_player_attack_pattern<T>(agentId, data, context);
  }
  public cbt_capture_dodge_direction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_dodge_direction<T>(agentId, data, context);
  }
  public cbt_capture_counter_strategy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_counter_strategy<T>(agentId, data, context);
  }
  public cbt_capture_attack_timing<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_attack_timing<T>(agentId, data, context);
  }
  public cbt_capture_defensive_stance<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_defensive_stance<T>(agentId, data, context);
  }
  public cbt_capture_combat_exchange<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_combat_exchange<T>(agentId, data, context);
  }
  public cbt_capture_opponent_skill<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_opponent_skill<T>(agentId, data, context);
  }
  public cbt_capture_flanking_behavior<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_flanking_behavior<T>(agentId, data, context);
  }
  public cbt_capture_trap_location<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_trap_location<T>(agentId, data, context);
  }
  public cbt_capture_combat_adaptation<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_capture_combat_adaptation<T>(agentId, data, context);
  }
  public cbt_validate_player_attack_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_player_attack_pattern<T>(value, schema);
  }
  public cbt_validate_dodge_direction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_dodge_direction<T>(value, schema);
  }
  public cbt_validate_counter_strategy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_counter_strategy<T>(value, schema);
  }
  public cbt_validate_attack_timing<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_attack_timing<T>(value, schema);
  }
  public cbt_validate_defensive_stance<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_defensive_stance<T>(value, schema);
  }
  public cbt_validate_combat_exchange<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_combat_exchange<T>(value, schema);
  }
  public cbt_validate_opponent_skill<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_opponent_skill<T>(value, schema);
  }
  public cbt_validate_flanking_behavior<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_flanking_behavior<T>(value, schema);
  }
  public cbt_validate_trap_location<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_trap_location<T>(value, schema);
  }
  public cbt_validate_combat_adaptation<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.cbt.cbt_validate_combat_adaptation<T>(value, schema);
  }
  public cbt_normalize_player_attack_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_player_attack_pattern<T>(data, schema);
  }
  public cbt_normalize_dodge_direction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_dodge_direction<T>(data, schema);
  }
  public cbt_normalize_counter_strategy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_counter_strategy<T>(data, schema);
  }
  public cbt_normalize_attack_timing<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_attack_timing<T>(data, schema);
  }
  public cbt_normalize_defensive_stance<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_defensive_stance<T>(data, schema);
  }
  public cbt_normalize_combat_exchange<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_combat_exchange<T>(data, schema);
  }
  public cbt_normalize_opponent_skill<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_opponent_skill<T>(data, schema);
  }
  public cbt_normalize_flanking_behavior<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_flanking_behavior<T>(data, schema);
  }
  public cbt_normalize_trap_location<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_trap_location<T>(data, schema);
  }
  public cbt_normalize_combat_adaptation<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.cbt.cbt_normalize_combat_adaptation<T>(data, schema);
  }
  public cbt_update_player_attack_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_player_attack_pattern<T>(agentId, updateData, context);
  }
  public cbt_update_dodge_direction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_dodge_direction<T>(agentId, updateData, context);
  }
  public cbt_update_counter_strategy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_counter_strategy<T>(agentId, updateData, context);
  }
  public cbt_update_attack_timing<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_attack_timing<T>(agentId, updateData, context);
  }
  public cbt_update_defensive_stance<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_defensive_stance<T>(agentId, updateData, context);
  }
  public cbt_update_combat_exchange<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_combat_exchange<T>(agentId, updateData, context);
  }
  public cbt_update_opponent_skill<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_opponent_skill<T>(agentId, updateData, context);
  }
  public cbt_update_flanking_behavior<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_flanking_behavior<T>(agentId, updateData, context);
  }
  public cbt_update_trap_location<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_trap_location<T>(agentId, updateData, context);
  }
  public cbt_update_combat_adaptation<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.cbt.cbt_update_combat_adaptation<T>(agentId, updateData, context);
  }
  public cbt_evaluate_player_attack_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_player_attack_pattern<T>(value, criteria);
  }
  public cbt_evaluate_dodge_direction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_dodge_direction<T>(value, criteria);
  }
  public cbt_evaluate_counter_strategy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_counter_strategy<T>(value, criteria);
  }
  public cbt_evaluate_attack_timing<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_attack_timing<T>(value, criteria);
  }
  public cbt_evaluate_defensive_stance<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_defensive_stance<T>(value, criteria);
  }
  public cbt_evaluate_combat_exchange<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_combat_exchange<T>(value, criteria);
  }
  public cbt_evaluate_opponent_skill<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_opponent_skill<T>(value, criteria);
  }
  public cbt_evaluate_flanking_behavior<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_flanking_behavior<T>(value, criteria);
  }
  public cbt_evaluate_trap_location<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_trap_location<T>(value, criteria);
  }
  public cbt_evaluate_combat_adaptation<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.cbt.cbt_evaluate_combat_adaptation<T>(value, criteria);
  }
  public cbt_retrieve_player_attack_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_player_attack_pattern<T>(agentId, query);
  }
  public cbt_retrieve_dodge_direction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_dodge_direction<T>(agentId, query);
  }
  public cbt_retrieve_counter_strategy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_counter_strategy<T>(agentId, query);
  }
  public cbt_retrieve_attack_timing<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_attack_timing<T>(agentId, query);
  }
  public cbt_retrieve_defensive_stance<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_defensive_stance<T>(agentId, query);
  }
  public cbt_retrieve_combat_exchange<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_combat_exchange<T>(agentId, query);
  }
  public cbt_retrieve_opponent_skill<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_opponent_skill<T>(agentId, query);
  }
  public cbt_retrieve_flanking_behavior<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_flanking_behavior<T>(agentId, query);
  }
  public cbt_retrieve_trap_location<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_trap_location<T>(agentId, query);
  }
  public cbt_retrieve_combat_adaptation<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.cbt.cbt_retrieve_combat_adaptation<T>(agentId, query);
  }
  public cbt_serialize_player_attack_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_player_attack_pattern<T>(data, format);
  }
  public cbt_serialize_dodge_direction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_dodge_direction<T>(data, format);
  }
  public cbt_serialize_counter_strategy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_counter_strategy<T>(data, format);
  }
  public cbt_serialize_attack_timing<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_attack_timing<T>(data, format);
  }
  public cbt_serialize_defensive_stance<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_defensive_stance<T>(data, format);
  }
  public cbt_serialize_combat_exchange<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_combat_exchange<T>(data, format);
  }
  public cbt_serialize_opponent_skill<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_opponent_skill<T>(data, format);
  }
  public cbt_serialize_flanking_behavior<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_flanking_behavior<T>(data, format);
  }
  public cbt_serialize_trap_location<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_trap_location<T>(data, format);
  }
  public cbt_serialize_combat_adaptation<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.cbt.cbt_serialize_combat_adaptation<T>(data, format);
  }
  public cbt_compare_player_attack_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_player_attack_pattern<T>(a, b, options);
  }
  public cbt_compare_dodge_direction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_dodge_direction<T>(a, b, options);
  }
  public cbt_compare_counter_strategy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_counter_strategy<T>(a, b, options);
  }
  public cbt_compare_attack_timing<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_attack_timing<T>(a, b, options);
  }
  public cbt_compare_defensive_stance<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_defensive_stance<T>(a, b, options);
  }
  public cbt_compare_combat_exchange<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_combat_exchange<T>(a, b, options);
  }
  public cbt_compare_opponent_skill<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_opponent_skill<T>(a, b, options);
  }
  public cbt_compare_flanking_behavior<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_flanking_behavior<T>(a, b, options);
  }
  public cbt_compare_trap_location<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_trap_location<T>(a, b, options);
  }
  public cbt_compare_combat_adaptation<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.cbt.cbt_compare_combat_adaptation<T>(a, b, options);
  }
  public cbt_prune_player_attack_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_player_attack_pattern(agentId, options);
  }
  public cbt_prune_dodge_direction(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_dodge_direction(agentId, options);
  }
  public cbt_prune_counter_strategy(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_counter_strategy(agentId, options);
  }
  public cbt_prune_attack_timing(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_attack_timing(agentId, options);
  }
  public cbt_prune_defensive_stance(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_defensive_stance(agentId, options);
  }
  public cbt_prune_combat_exchange(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_combat_exchange(agentId, options);
  }
  public cbt_prune_opponent_skill(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_opponent_skill(agentId, options);
  }
  public cbt_prune_flanking_behavior(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_flanking_behavior(agentId, options);
  }
  public cbt_prune_trap_location(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_trap_location(agentId, options);
  }
  public cbt_prune_combat_adaptation(agentId: string, options?: PruningOptions): PruningResult {
    return this.cbt.cbt_prune_combat_adaptation(agentId, options);
  }

  // ==========================================================================
  // Module WRL: WRL — Thế giới, kinh tế và hệ sinh thái (100 hàm)
  // ==========================================================================

  public wrl_initialize_world_change<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_world_change<T>(agentId, initialData, context);
  }
  public wrl_initialize_resource_regeneration<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_resource_regeneration<T>(agentId, initialData, context);
  }
  public wrl_initialize_supply_trend<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_supply_trend<T>(agentId, initialData, context);
  }
  public wrl_initialize_territory_history<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_territory_history<T>(agentId, initialData, context);
  }
  public wrl_initialize_day_night_pattern<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_day_night_pattern<T>(agentId, initialData, context);
  }
  public wrl_initialize_safe_route<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_safe_route<T>(agentId, initialData, context);
  }
  public wrl_initialize_ecosystem_pressure<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_ecosystem_pressure<T>(agentId, initialData, context);
  }
  public wrl_initialize_resource_shortage<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_resource_shortage<T>(agentId, initialData, context);
  }
  public wrl_initialize_world_event<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_world_event<T>(agentId, initialData, context);
  }
  public wrl_initialize_faction_response<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_initialize_faction_response<T>(agentId, initialData, context);
  }
  public wrl_capture_world_change<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_world_change<T>(agentId, data, context);
  }
  public wrl_capture_resource_regeneration<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_resource_regeneration<T>(agentId, data, context);
  }
  public wrl_capture_supply_trend<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_supply_trend<T>(agentId, data, context);
  }
  public wrl_capture_territory_history<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_territory_history<T>(agentId, data, context);
  }
  public wrl_capture_day_night_pattern<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_day_night_pattern<T>(agentId, data, context);
  }
  public wrl_capture_safe_route<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_safe_route<T>(agentId, data, context);
  }
  public wrl_capture_ecosystem_pressure<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_ecosystem_pressure<T>(agentId, data, context);
  }
  public wrl_capture_resource_shortage<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_resource_shortage<T>(agentId, data, context);
  }
  public wrl_capture_world_event<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_world_event<T>(agentId, data, context);
  }
  public wrl_capture_faction_response<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_capture_faction_response<T>(agentId, data, context);
  }
  public wrl_validate_world_change<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_world_change<T>(value, schema);
  }
  public wrl_validate_resource_regeneration<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_resource_regeneration<T>(value, schema);
  }
  public wrl_validate_supply_trend<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_supply_trend<T>(value, schema);
  }
  public wrl_validate_territory_history<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_territory_history<T>(value, schema);
  }
  public wrl_validate_day_night_pattern<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_day_night_pattern<T>(value, schema);
  }
  public wrl_validate_safe_route<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_safe_route<T>(value, schema);
  }
  public wrl_validate_ecosystem_pressure<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_ecosystem_pressure<T>(value, schema);
  }
  public wrl_validate_resource_shortage<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_resource_shortage<T>(value, schema);
  }
  public wrl_validate_world_event<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_world_event<T>(value, schema);
  }
  public wrl_validate_faction_response<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.wrl.wrl_validate_faction_response<T>(value, schema);
  }
  public wrl_normalize_world_change<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_world_change<T>(data, schema);
  }
  public wrl_normalize_resource_regeneration<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_resource_regeneration<T>(data, schema);
  }
  public wrl_normalize_supply_trend<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_supply_trend<T>(data, schema);
  }
  public wrl_normalize_territory_history<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_territory_history<T>(data, schema);
  }
  public wrl_normalize_day_night_pattern<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_day_night_pattern<T>(data, schema);
  }
  public wrl_normalize_safe_route<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_safe_route<T>(data, schema);
  }
  public wrl_normalize_ecosystem_pressure<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_ecosystem_pressure<T>(data, schema);
  }
  public wrl_normalize_resource_shortage<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_resource_shortage<T>(data, schema);
  }
  public wrl_normalize_world_event<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_world_event<T>(data, schema);
  }
  public wrl_normalize_faction_response<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.wrl.wrl_normalize_faction_response<T>(data, schema);
  }
  public wrl_update_world_change<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_world_change<T>(agentId, updateData, context);
  }
  public wrl_update_resource_regeneration<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_resource_regeneration<T>(agentId, updateData, context);
  }
  public wrl_update_supply_trend<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_supply_trend<T>(agentId, updateData, context);
  }
  public wrl_update_territory_history<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_territory_history<T>(agentId, updateData, context);
  }
  public wrl_update_day_night_pattern<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_day_night_pattern<T>(agentId, updateData, context);
  }
  public wrl_update_safe_route<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_safe_route<T>(agentId, updateData, context);
  }
  public wrl_update_ecosystem_pressure<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_ecosystem_pressure<T>(agentId, updateData, context);
  }
  public wrl_update_resource_shortage<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_resource_shortage<T>(agentId, updateData, context);
  }
  public wrl_update_world_event<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_world_event<T>(agentId, updateData, context);
  }
  public wrl_update_faction_response<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.wrl.wrl_update_faction_response<T>(agentId, updateData, context);
  }
  public wrl_evaluate_world_change<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_world_change<T>(value, criteria);
  }
  public wrl_evaluate_resource_regeneration<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_resource_regeneration<T>(value, criteria);
  }
  public wrl_evaluate_supply_trend<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_supply_trend<T>(value, criteria);
  }
  public wrl_evaluate_territory_history<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_territory_history<T>(value, criteria);
  }
  public wrl_evaluate_day_night_pattern<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_day_night_pattern<T>(value, criteria);
  }
  public wrl_evaluate_safe_route<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_safe_route<T>(value, criteria);
  }
  public wrl_evaluate_ecosystem_pressure<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_ecosystem_pressure<T>(value, criteria);
  }
  public wrl_evaluate_resource_shortage<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_resource_shortage<T>(value, criteria);
  }
  public wrl_evaluate_world_event<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_world_event<T>(value, criteria);
  }
  public wrl_evaluate_faction_response<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.wrl.wrl_evaluate_faction_response<T>(value, criteria);
  }
  public wrl_retrieve_world_change<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_world_change<T>(agentId, query);
  }
  public wrl_retrieve_resource_regeneration<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_resource_regeneration<T>(agentId, query);
  }
  public wrl_retrieve_supply_trend<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_supply_trend<T>(agentId, query);
  }
  public wrl_retrieve_territory_history<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_territory_history<T>(agentId, query);
  }
  public wrl_retrieve_day_night_pattern<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_day_night_pattern<T>(agentId, query);
  }
  public wrl_retrieve_safe_route<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_safe_route<T>(agentId, query);
  }
  public wrl_retrieve_ecosystem_pressure<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_ecosystem_pressure<T>(agentId, query);
  }
  public wrl_retrieve_resource_shortage<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_resource_shortage<T>(agentId, query);
  }
  public wrl_retrieve_world_event<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_world_event<T>(agentId, query);
  }
  public wrl_retrieve_faction_response<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.wrl.wrl_retrieve_faction_response<T>(agentId, query);
  }
  public wrl_serialize_world_change<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_world_change<T>(data, format);
  }
  public wrl_serialize_resource_regeneration<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_resource_regeneration<T>(data, format);
  }
  public wrl_serialize_supply_trend<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_supply_trend<T>(data, format);
  }
  public wrl_serialize_territory_history<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_territory_history<T>(data, format);
  }
  public wrl_serialize_day_night_pattern<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_day_night_pattern<T>(data, format);
  }
  public wrl_serialize_safe_route<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_safe_route<T>(data, format);
  }
  public wrl_serialize_ecosystem_pressure<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_ecosystem_pressure<T>(data, format);
  }
  public wrl_serialize_resource_shortage<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_resource_shortage<T>(data, format);
  }
  public wrl_serialize_world_event<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_world_event<T>(data, format);
  }
  public wrl_serialize_faction_response<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.wrl.wrl_serialize_faction_response<T>(data, format);
  }
  public wrl_compare_world_change<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_world_change<T>(a, b, options);
  }
  public wrl_compare_resource_regeneration<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_resource_regeneration<T>(a, b, options);
  }
  public wrl_compare_supply_trend<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_supply_trend<T>(a, b, options);
  }
  public wrl_compare_territory_history<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_territory_history<T>(a, b, options);
  }
  public wrl_compare_day_night_pattern<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_day_night_pattern<T>(a, b, options);
  }
  public wrl_compare_safe_route<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_safe_route<T>(a, b, options);
  }
  public wrl_compare_ecosystem_pressure<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_ecosystem_pressure<T>(a, b, options);
  }
  public wrl_compare_resource_shortage<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_resource_shortage<T>(a, b, options);
  }
  public wrl_compare_world_event<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_world_event<T>(a, b, options);
  }
  public wrl_compare_faction_response<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.wrl.wrl_compare_faction_response<T>(a, b, options);
  }
  public wrl_prune_world_change(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_world_change(agentId, options);
  }
  public wrl_prune_resource_regeneration(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_resource_regeneration(agentId, options);
  }
  public wrl_prune_supply_trend(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_supply_trend(agentId, options);
  }
  public wrl_prune_territory_history(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_territory_history(agentId, options);
  }
  public wrl_prune_day_night_pattern(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_day_night_pattern(agentId, options);
  }
  public wrl_prune_safe_route(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_safe_route(agentId, options);
  }
  public wrl_prune_ecosystem_pressure(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_ecosystem_pressure(agentId, options);
  }
  public wrl_prune_resource_shortage(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_resource_shortage(agentId, options);
  }
  public wrl_prune_world_event(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_world_event(agentId, options);
  }
  public wrl_prune_faction_response(agentId: string, options?: PruningOptions): PruningResult {
    return this.wrl.wrl_prune_faction_response(agentId, options);
  }

  // ==========================================================================
  // Module EVA: EVA — Đánh giá và tự hiệu chỉnh (100 hàm)
  // ==========================================================================

  public eva_initialize_behavior_outcome<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_behavior_outcome<T>(agentId, initialData, context);
  }
  public eva_initialize_prediction_residual<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_prediction_residual<T>(agentId, initialData, context);
  }
  public eva_initialize_repeated_mistake<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_repeated_mistake<T>(agentId, initialData, context);
  }
  public eva_initialize_learning_regression<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_learning_regression<T>(agentId, initialData, context);
  }
  public eva_initialize_policy_version<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_policy_version<T>(agentId, initialData, context);
  }
  public eva_initialize_confidence_score<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_confidence_score<T>(agentId, initialData, context);
  }
  public eva_initialize_learning_feedback<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_learning_feedback<T>(agentId, initialData, context);
  }
  public eva_initialize_reward_hacking<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_reward_hacking<T>(agentId, initialData, context);
  }
  public eva_initialize_behavior_diversity<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_behavior_diversity<T>(agentId, initialData, context);
  }
  public eva_initialize_model_update<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_initialize_model_update<T>(agentId, initialData, context);
  }
  public eva_capture_behavior_outcome<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_behavior_outcome<T>(agentId, data, context);
  }
  public eva_capture_prediction_residual<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_prediction_residual<T>(agentId, data, context);
  }
  public eva_capture_repeated_mistake<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_repeated_mistake<T>(agentId, data, context);
  }
  public eva_capture_learning_regression<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_learning_regression<T>(agentId, data, context);
  }
  public eva_capture_policy_version<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_policy_version<T>(agentId, data, context);
  }
  public eva_capture_confidence_score<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_confidence_score<T>(agentId, data, context);
  }
  public eva_capture_learning_feedback<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_learning_feedback<T>(agentId, data, context);
  }
  public eva_capture_reward_hacking<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_reward_hacking<T>(agentId, data, context);
  }
  public eva_capture_behavior_diversity<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_behavior_diversity<T>(agentId, data, context);
  }
  public eva_capture_model_update<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_capture_model_update<T>(agentId, data, context);
  }
  public eva_validate_behavior_outcome<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_behavior_outcome<T>(value, schema);
  }
  public eva_validate_prediction_residual<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_prediction_residual<T>(value, schema);
  }
  public eva_validate_repeated_mistake<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_repeated_mistake<T>(value, schema);
  }
  public eva_validate_learning_regression<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_learning_regression<T>(value, schema);
  }
  public eva_validate_policy_version<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_policy_version<T>(value, schema);
  }
  public eva_validate_confidence_score<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_confidence_score<T>(value, schema);
  }
  public eva_validate_learning_feedback<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_learning_feedback<T>(value, schema);
  }
  public eva_validate_reward_hacking<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_reward_hacking<T>(value, schema);
  }
  public eva_validate_behavior_diversity<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_behavior_diversity<T>(value, schema);
  }
  public eva_validate_model_update<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.eva.eva_validate_model_update<T>(value, schema);
  }
  public eva_normalize_behavior_outcome<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_behavior_outcome<T>(data, schema);
  }
  public eva_normalize_prediction_residual<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_prediction_residual<T>(data, schema);
  }
  public eva_normalize_repeated_mistake<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_repeated_mistake<T>(data, schema);
  }
  public eva_normalize_learning_regression<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_learning_regression<T>(data, schema);
  }
  public eva_normalize_policy_version<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_policy_version<T>(data, schema);
  }
  public eva_normalize_confidence_score<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_confidence_score<T>(data, schema);
  }
  public eva_normalize_learning_feedback<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_learning_feedback<T>(data, schema);
  }
  public eva_normalize_reward_hacking<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_reward_hacking<T>(data, schema);
  }
  public eva_normalize_behavior_diversity<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_behavior_diversity<T>(data, schema);
  }
  public eva_normalize_model_update<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.eva.eva_normalize_model_update<T>(data, schema);
  }
  public eva_update_behavior_outcome<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_behavior_outcome<T>(agentId, updateData, context);
  }
  public eva_update_prediction_residual<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_prediction_residual<T>(agentId, updateData, context);
  }
  public eva_update_repeated_mistake<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_repeated_mistake<T>(agentId, updateData, context);
  }
  public eva_update_learning_regression<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_learning_regression<T>(agentId, updateData, context);
  }
  public eva_update_policy_version<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_policy_version<T>(agentId, updateData, context);
  }
  public eva_update_confidence_score<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_confidence_score<T>(agentId, updateData, context);
  }
  public eva_update_learning_feedback<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_learning_feedback<T>(agentId, updateData, context);
  }
  public eva_update_reward_hacking<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_reward_hacking<T>(agentId, updateData, context);
  }
  public eva_update_behavior_diversity<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_behavior_diversity<T>(agentId, updateData, context);
  }
  public eva_update_model_update<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.eva.eva_update_model_update<T>(agentId, updateData, context);
  }
  public eva_evaluate_behavior_outcome<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_behavior_outcome<T>(value, criteria);
  }
  public eva_evaluate_prediction_residual<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_prediction_residual<T>(value, criteria);
  }
  public eva_evaluate_repeated_mistake<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_repeated_mistake<T>(value, criteria);
  }
  public eva_evaluate_learning_regression<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_learning_regression<T>(value, criteria);
  }
  public eva_evaluate_policy_version<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_policy_version<T>(value, criteria);
  }
  public eva_evaluate_confidence_score<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_confidence_score<T>(value, criteria);
  }
  public eva_evaluate_learning_feedback<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_learning_feedback<T>(value, criteria);
  }
  public eva_evaluate_reward_hacking<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_reward_hacking<T>(value, criteria);
  }
  public eva_evaluate_behavior_diversity<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_behavior_diversity<T>(value, criteria);
  }
  public eva_evaluate_model_update<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.eva.eva_evaluate_model_update<T>(value, criteria);
  }
  public eva_retrieve_behavior_outcome<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_behavior_outcome<T>(agentId, query);
  }
  public eva_retrieve_prediction_residual<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_prediction_residual<T>(agentId, query);
  }
  public eva_retrieve_repeated_mistake<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_repeated_mistake<T>(agentId, query);
  }
  public eva_retrieve_learning_regression<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_learning_regression<T>(agentId, query);
  }
  public eva_retrieve_policy_version<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_policy_version<T>(agentId, query);
  }
  public eva_retrieve_confidence_score<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_confidence_score<T>(agentId, query);
  }
  public eva_retrieve_learning_feedback<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_learning_feedback<T>(agentId, query);
  }
  public eva_retrieve_reward_hacking<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_reward_hacking<T>(agentId, query);
  }
  public eva_retrieve_behavior_diversity<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_behavior_diversity<T>(agentId, query);
  }
  public eva_retrieve_model_update<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.eva.eva_retrieve_model_update<T>(agentId, query);
  }
  public eva_serialize_behavior_outcome<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_behavior_outcome<T>(data, format);
  }
  public eva_serialize_prediction_residual<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_prediction_residual<T>(data, format);
  }
  public eva_serialize_repeated_mistake<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_repeated_mistake<T>(data, format);
  }
  public eva_serialize_learning_regression<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_learning_regression<T>(data, format);
  }
  public eva_serialize_policy_version<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_policy_version<T>(data, format);
  }
  public eva_serialize_confidence_score<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_confidence_score<T>(data, format);
  }
  public eva_serialize_learning_feedback<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_learning_feedback<T>(data, format);
  }
  public eva_serialize_reward_hacking<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_reward_hacking<T>(data, format);
  }
  public eva_serialize_behavior_diversity<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_behavior_diversity<T>(data, format);
  }
  public eva_serialize_model_update<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.eva.eva_serialize_model_update<T>(data, format);
  }
  public eva_compare_behavior_outcome<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_behavior_outcome<T>(a, b, options);
  }
  public eva_compare_prediction_residual<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_prediction_residual<T>(a, b, options);
  }
  public eva_compare_repeated_mistake<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_repeated_mistake<T>(a, b, options);
  }
  public eva_compare_learning_regression<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_learning_regression<T>(a, b, options);
  }
  public eva_compare_policy_version<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_policy_version<T>(a, b, options);
  }
  public eva_compare_confidence_score<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_confidence_score<T>(a, b, options);
  }
  public eva_compare_learning_feedback<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_learning_feedback<T>(a, b, options);
  }
  public eva_compare_reward_hacking<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_reward_hacking<T>(a, b, options);
  }
  public eva_compare_behavior_diversity<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_behavior_diversity<T>(a, b, options);
  }
  public eva_compare_model_update<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.eva.eva_compare_model_update<T>(a, b, options);
  }
  public eva_prune_behavior_outcome(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_behavior_outcome(agentId, options);
  }
  public eva_prune_prediction_residual(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_prediction_residual(agentId, options);
  }
  public eva_prune_repeated_mistake(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_repeated_mistake(agentId, options);
  }
  public eva_prune_learning_regression(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_learning_regression(agentId, options);
  }
  public eva_prune_policy_version(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_policy_version(agentId, options);
  }
  public eva_prune_confidence_score(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_confidence_score(agentId, options);
  }
  public eva_prune_learning_feedback(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_learning_feedback(agentId, options);
  }
  public eva_prune_reward_hacking(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_reward_hacking(agentId, options);
  }
  public eva_prune_behavior_diversity(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_behavior_diversity(agentId, options);
  }
  public eva_prune_model_update(agentId: string, options?: PruningOptions): PruningResult {
    return this.eva.eva_prune_model_update(agentId, options);
  }

  // ==========================================================================
  // Module PST: PST — Đồng bộ và lưu dữ liệu (100 hàm)
  // ==========================================================================

  public pst_initialize_agent_memory_blob<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_agent_memory_blob<T>(agentId, initialData, context);
  }
  public pst_initialize_agent_snapshot<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_agent_snapshot<T>(agentId, initialData, context);
  }
  public pst_initialize_memory_schema<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_memory_schema<T>(agentId, initialData, context);
  }
  public pst_initialize_migration_record<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_migration_record<T>(agentId, initialData, context);
  }
  public pst_initialize_saved_agent_data<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_saved_agent_data<T>(agentId, initialData, context);
  }
  public pst_initialize_corrupted_memory<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_corrupted_memory<T>(agentId, initialData, context);
  }
  public pst_initialize_memory_storage<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_memory_storage<T>(agentId, initialData, context);
  }
  public pst_initialize_persistence_state<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_persistence_state<T>(agentId, initialData, context);
  }
  public pst_initialize_sync_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_sync_checkpoint<T>(agentId, initialData, context);
  }
  public pst_initialize_save_transaction<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_initialize_save_transaction<T>(agentId, initialData, context);
  }
  public pst_capture_agent_memory_blob<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_agent_memory_blob<T>(agentId, data, context);
  }
  public pst_capture_agent_snapshot<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_agent_snapshot<T>(agentId, data, context);
  }
  public pst_capture_memory_schema<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_memory_schema<T>(agentId, data, context);
  }
  public pst_capture_migration_record<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_migration_record<T>(agentId, data, context);
  }
  public pst_capture_saved_agent_data<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_saved_agent_data<T>(agentId, data, context);
  }
  public pst_capture_corrupted_memory<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_corrupted_memory<T>(agentId, data, context);
  }
  public pst_capture_memory_storage<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_memory_storage<T>(agentId, data, context);
  }
  public pst_capture_persistence_state<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_persistence_state<T>(agentId, data, context);
  }
  public pst_capture_sync_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_sync_checkpoint<T>(agentId, data, context);
  }
  public pst_capture_save_transaction<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_capture_save_transaction<T>(agentId, data, context);
  }
  public pst_validate_agent_memory_blob<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_agent_memory_blob<T>(value, schema);
  }
  public pst_validate_agent_snapshot<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_agent_snapshot<T>(value, schema);
  }
  public pst_validate_memory_schema<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_memory_schema<T>(value, schema);
  }
  public pst_validate_migration_record<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_migration_record<T>(value, schema);
  }
  public pst_validate_saved_agent_data<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_saved_agent_data<T>(value, schema);
  }
  public pst_validate_corrupted_memory<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_corrupted_memory<T>(value, schema);
  }
  public pst_validate_memory_storage<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_memory_storage<T>(value, schema);
  }
  public pst_validate_persistence_state<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_persistence_state<T>(value, schema);
  }
  public pst_validate_sync_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_sync_checkpoint<T>(value, schema);
  }
  public pst_validate_save_transaction<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.pst.pst_validate_save_transaction<T>(value, schema);
  }
  public pst_normalize_agent_memory_blob<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_agent_memory_blob<T>(data, schema);
  }
  public pst_normalize_agent_snapshot<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_agent_snapshot<T>(data, schema);
  }
  public pst_normalize_memory_schema<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_memory_schema<T>(data, schema);
  }
  public pst_normalize_migration_record<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_migration_record<T>(data, schema);
  }
  public pst_normalize_saved_agent_data<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_saved_agent_data<T>(data, schema);
  }
  public pst_normalize_corrupted_memory<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_corrupted_memory<T>(data, schema);
  }
  public pst_normalize_memory_storage<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_memory_storage<T>(data, schema);
  }
  public pst_normalize_persistence_state<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_persistence_state<T>(data, schema);
  }
  public pst_normalize_sync_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_sync_checkpoint<T>(data, schema);
  }
  public pst_normalize_save_transaction<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.pst.pst_normalize_save_transaction<T>(data, schema);
  }
  public pst_update_agent_memory_blob<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_agent_memory_blob<T>(agentId, updateData, context);
  }
  public pst_update_agent_snapshot<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_agent_snapshot<T>(agentId, updateData, context);
  }
  public pst_update_memory_schema<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_memory_schema<T>(agentId, updateData, context);
  }
  public pst_update_migration_record<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_migration_record<T>(agentId, updateData, context);
  }
  public pst_update_saved_agent_data<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_saved_agent_data<T>(agentId, updateData, context);
  }
  public pst_update_corrupted_memory<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_corrupted_memory<T>(agentId, updateData, context);
  }
  public pst_update_memory_storage<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_memory_storage<T>(agentId, updateData, context);
  }
  public pst_update_persistence_state<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_persistence_state<T>(agentId, updateData, context);
  }
  public pst_update_sync_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_sync_checkpoint<T>(agentId, updateData, context);
  }
  public pst_update_save_transaction<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.pst.pst_update_save_transaction<T>(agentId, updateData, context);
  }
  public pst_evaluate_agent_memory_blob<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_agent_memory_blob<T>(value, criteria);
  }
  public pst_evaluate_agent_snapshot<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_agent_snapshot<T>(value, criteria);
  }
  public pst_evaluate_memory_schema<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_memory_schema<T>(value, criteria);
  }
  public pst_evaluate_migration_record<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_migration_record<T>(value, criteria);
  }
  public pst_evaluate_saved_agent_data<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_saved_agent_data<T>(value, criteria);
  }
  public pst_evaluate_corrupted_memory<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_corrupted_memory<T>(value, criteria);
  }
  public pst_evaluate_memory_storage<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_memory_storage<T>(value, criteria);
  }
  public pst_evaluate_persistence_state<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_persistence_state<T>(value, criteria);
  }
  public pst_evaluate_sync_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_sync_checkpoint<T>(value, criteria);
  }
  public pst_evaluate_save_transaction<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.pst.pst_evaluate_save_transaction<T>(value, criteria);
  }
  public pst_retrieve_agent_memory_blob<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_agent_memory_blob<T>(agentId, query);
  }
  public pst_retrieve_agent_snapshot<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_agent_snapshot<T>(agentId, query);
  }
  public pst_retrieve_memory_schema<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_memory_schema<T>(agentId, query);
  }
  public pst_retrieve_migration_record<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_migration_record<T>(agentId, query);
  }
  public pst_retrieve_saved_agent_data<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_saved_agent_data<T>(agentId, query);
  }
  public pst_retrieve_corrupted_memory<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_corrupted_memory<T>(agentId, query);
  }
  public pst_retrieve_memory_storage<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_memory_storage<T>(agentId, query);
  }
  public pst_retrieve_persistence_state<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_persistence_state<T>(agentId, query);
  }
  public pst_retrieve_sync_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_sync_checkpoint<T>(agentId, query);
  }
  public pst_retrieve_save_transaction<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.pst.pst_retrieve_save_transaction<T>(agentId, query);
  }
  public pst_serialize_agent_memory_blob<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_agent_memory_blob<T>(data, format);
  }
  public pst_serialize_agent_snapshot<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_agent_snapshot<T>(data, format);
  }
  public pst_serialize_memory_schema<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_memory_schema<T>(data, format);
  }
  public pst_serialize_migration_record<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_migration_record<T>(data, format);
  }
  public pst_serialize_saved_agent_data<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_saved_agent_data<T>(data, format);
  }
  public pst_serialize_corrupted_memory<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_corrupted_memory<T>(data, format);
  }
  public pst_serialize_memory_storage<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_memory_storage<T>(data, format);
  }
  public pst_serialize_persistence_state<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_persistence_state<T>(data, format);
  }
  public pst_serialize_sync_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_sync_checkpoint<T>(data, format);
  }
  public pst_serialize_save_transaction<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.pst.pst_serialize_save_transaction<T>(data, format);
  }
  public pst_compare_agent_memory_blob<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_agent_memory_blob<T>(a, b, options);
  }
  public pst_compare_agent_snapshot<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_agent_snapshot<T>(a, b, options);
  }
  public pst_compare_memory_schema<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_memory_schema<T>(a, b, options);
  }
  public pst_compare_migration_record<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_migration_record<T>(a, b, options);
  }
  public pst_compare_saved_agent_data<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_saved_agent_data<T>(a, b, options);
  }
  public pst_compare_corrupted_memory<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_corrupted_memory<T>(a, b, options);
  }
  public pst_compare_memory_storage<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_memory_storage<T>(a, b, options);
  }
  public pst_compare_persistence_state<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_persistence_state<T>(a, b, options);
  }
  public pst_compare_sync_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_sync_checkpoint<T>(a, b, options);
  }
  public pst_compare_save_transaction<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.pst.pst_compare_save_transaction<T>(a, b, options);
  }
  public pst_prune_agent_memory_blob(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_agent_memory_blob(agentId, options);
  }
  public pst_prune_agent_snapshot(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_agent_snapshot(agentId, options);
  }
  public pst_prune_memory_schema(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_memory_schema(agentId, options);
  }
  public pst_prune_migration_record(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_migration_record(agentId, options);
  }
  public pst_prune_saved_agent_data(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_saved_agent_data(agentId, options);
  }
  public pst_prune_corrupted_memory(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_corrupted_memory(agentId, options);
  }
  public pst_prune_memory_storage(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_memory_storage(agentId, options);
  }
  public pst_prune_persistence_state(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_persistence_state(agentId, options);
  }
  public pst_prune_sync_checkpoint(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_sync_checkpoint(agentId, options);
  }
  public pst_prune_save_transaction(agentId: string, options?: PruningOptions): PruningResult {
    return this.pst.pst_prune_save_transaction(agentId, options);
  }

  // ==========================================================================
  // Module GOV: GOV — Kiểm soát và tối ưu hệ thống (100 hàm)
  // ==========================================================================

  public gov_initialize_learning_input<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_learning_input<T>(agentId, initialData, context);
  }
  public gov_initialize_memory_budget<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_memory_budget<T>(agentId, initialData, context);
  }
  public gov_initialize_update_rate<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_update_rate<T>(agentId, initialData, context);
  }
  public gov_initialize_model_parameter_health<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_model_parameter_health<T>(agentId, initialData, context);
  }
  public gov_initialize_compute_budget<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_compute_budget<T>(agentId, initialData, context);
  }
  public gov_initialize_learning_latency<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_learning_latency<T>(agentId, initialData, context);
  }
  public gov_initialize_recall_accuracy<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_recall_accuracy<T>(agentId, initialData, context);
  }
  public gov_initialize_regression_test<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_regression_test<T>(agentId, initialData, context);
  }
  public gov_initialize_training_data_trust<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_training_data_trust<T>(agentId, initialData, context);
  }
  public gov_initialize_safe_checkpoint<T = Record<string, unknown>>(agentId: string, initialData?: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_initialize_safe_checkpoint<T>(agentId, initialData, context);
  }
  public gov_capture_learning_input<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_learning_input<T>(agentId, data, context);
  }
  public gov_capture_memory_budget<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_memory_budget<T>(agentId, data, context);
  }
  public gov_capture_update_rate<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_update_rate<T>(agentId, data, context);
  }
  public gov_capture_model_parameter_health<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_model_parameter_health<T>(agentId, data, context);
  }
  public gov_capture_compute_budget<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_compute_budget<T>(agentId, data, context);
  }
  public gov_capture_learning_latency<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_learning_latency<T>(agentId, data, context);
  }
  public gov_capture_recall_accuracy<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_recall_accuracy<T>(agentId, data, context);
  }
  public gov_capture_regression_test<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_regression_test<T>(agentId, data, context);
  }
  public gov_capture_training_data_trust<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_training_data_trust<T>(agentId, data, context);
  }
  public gov_capture_safe_checkpoint<T = Record<string, unknown>>(agentId: string, data: T, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_capture_safe_checkpoint<T>(agentId, data, context);
  }
  public gov_validate_learning_input<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_learning_input<T>(value, schema);
  }
  public gov_validate_memory_budget<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_memory_budget<T>(value, schema);
  }
  public gov_validate_update_rate<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_update_rate<T>(value, schema);
  }
  public gov_validate_model_parameter_health<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_model_parameter_health<T>(value, schema);
  }
  public gov_validate_compute_budget<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_compute_budget<T>(value, schema);
  }
  public gov_validate_learning_latency<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_learning_latency<T>(value, schema);
  }
  public gov_validate_recall_accuracy<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_recall_accuracy<T>(value, schema);
  }
  public gov_validate_regression_test<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_regression_test<T>(value, schema);
  }
  public gov_validate_training_data_trust<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_training_data_trust<T>(value, schema);
  }
  public gov_validate_safe_checkpoint<T = unknown>(value: T, schema?: ValidationSchema<T>): ValidationResult {
    return this.gov.gov_validate_safe_checkpoint<T>(value, schema);
  }
  public gov_normalize_learning_input<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_learning_input<T>(data, schema);
  }
  public gov_normalize_memory_budget<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_memory_budget<T>(data, schema);
  }
  public gov_normalize_update_rate<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_update_rate<T>(data, schema);
  }
  public gov_normalize_model_parameter_health<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_model_parameter_health<T>(data, schema);
  }
  public gov_normalize_compute_budget<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_compute_budget<T>(data, schema);
  }
  public gov_normalize_learning_latency<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_learning_latency<T>(data, schema);
  }
  public gov_normalize_recall_accuracy<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_recall_accuracy<T>(data, schema);
  }
  public gov_normalize_regression_test<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_regression_test<T>(data, schema);
  }
  public gov_normalize_training_data_trust<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_training_data_trust<T>(data, schema);
  }
  public gov_normalize_safe_checkpoint<T = Record<string, unknown>>(data: T, schema?: ValidationSchema<T>): T {
    return this.gov.gov_normalize_safe_checkpoint<T>(data, schema);
  }
  public gov_update_learning_input<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_learning_input<T>(agentId, updateData, context);
  }
  public gov_update_memory_budget<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_memory_budget<T>(agentId, updateData, context);
  }
  public gov_update_update_rate<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_update_rate<T>(agentId, updateData, context);
  }
  public gov_update_model_parameter_health<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_model_parameter_health<T>(agentId, updateData, context);
  }
  public gov_update_compute_budget<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_compute_budget<T>(agentId, updateData, context);
  }
  public gov_update_learning_latency<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_learning_latency<T>(agentId, updateData, context);
  }
  public gov_update_recall_accuracy<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_recall_accuracy<T>(agentId, updateData, context);
  }
  public gov_update_regression_test<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_regression_test<T>(agentId, updateData, context);
  }
  public gov_update_training_data_trust<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_training_data_trust<T>(agentId, updateData, context);
  }
  public gov_update_safe_checkpoint<T = Record<string, unknown>>(agentId: string, updateData: Partial<T>, context?: Record<string, unknown>): NPCRecord<T> {
    return this.gov.gov_update_safe_checkpoint<T>(agentId, updateData, context);
  }
  public gov_evaluate_learning_input<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_learning_input<T>(value, criteria);
  }
  public gov_evaluate_memory_budget<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_memory_budget<T>(value, criteria);
  }
  public gov_evaluate_update_rate<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_update_rate<T>(value, criteria);
  }
  public gov_evaluate_model_parameter_health<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_model_parameter_health<T>(value, criteria);
  }
  public gov_evaluate_compute_budget<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_compute_budget<T>(value, criteria);
  }
  public gov_evaluate_learning_latency<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_learning_latency<T>(value, criteria);
  }
  public gov_evaluate_recall_accuracy<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_recall_accuracy<T>(value, criteria);
  }
  public gov_evaluate_regression_test<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_regression_test<T>(value, criteria);
  }
  public gov_evaluate_training_data_trust<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_training_data_trust<T>(value, criteria);
  }
  public gov_evaluate_safe_checkpoint<T = unknown>(value: T, criteria?: EvaluationCriteria): EvaluationResult {
    return this.gov.gov_evaluate_safe_checkpoint<T>(value, criteria);
  }
  public gov_retrieve_learning_input<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_learning_input<T>(agentId, query);
  }
  public gov_retrieve_memory_budget<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_memory_budget<T>(agentId, query);
  }
  public gov_retrieve_update_rate<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_update_rate<T>(agentId, query);
  }
  public gov_retrieve_model_parameter_health<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_model_parameter_health<T>(agentId, query);
  }
  public gov_retrieve_compute_budget<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_compute_budget<T>(agentId, query);
  }
  public gov_retrieve_learning_latency<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_learning_latency<T>(agentId, query);
  }
  public gov_retrieve_recall_accuracy<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_recall_accuracy<T>(agentId, query);
  }
  public gov_retrieve_regression_test<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_regression_test<T>(agentId, query);
  }
  public gov_retrieve_training_data_trust<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_training_data_trust<T>(agentId, query);
  }
  public gov_retrieve_safe_checkpoint<T = Record<string, unknown>>(agentId: string, query?: MemoryQuery): NPCRecord<T>[] {
    return this.gov.gov_retrieve_safe_checkpoint<T>(agentId, query);
  }
  public gov_serialize_learning_input<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_learning_input<T>(data, format);
  }
  public gov_serialize_memory_budget<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_memory_budget<T>(data, format);
  }
  public gov_serialize_update_rate<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_update_rate<T>(data, format);
  }
  public gov_serialize_model_parameter_health<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_model_parameter_health<T>(data, format);
  }
  public gov_serialize_compute_budget<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_compute_budget<T>(data, format);
  }
  public gov_serialize_learning_latency<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_learning_latency<T>(data, format);
  }
  public gov_serialize_recall_accuracy<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_recall_accuracy<T>(data, format);
  }
  public gov_serialize_regression_test<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_regression_test<T>(data, format);
  }
  public gov_serialize_training_data_trust<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_training_data_trust<T>(data, format);
  }
  public gov_serialize_safe_checkpoint<T = Record<string, unknown>>(data: T, format?: 'json' | 'binary' | 'blob' | 'custom'): SerializedRecord<T> {
    return this.gov.gov_serialize_safe_checkpoint<T>(data, format);
  }
  public gov_compare_learning_input<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_learning_input<T>(a, b, options);
  }
  public gov_compare_memory_budget<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_memory_budget<T>(a, b, options);
  }
  public gov_compare_update_rate<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_update_rate<T>(a, b, options);
  }
  public gov_compare_model_parameter_health<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_model_parameter_health<T>(a, b, options);
  }
  public gov_compare_compute_budget<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_compute_budget<T>(a, b, options);
  }
  public gov_compare_learning_latency<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_learning_latency<T>(a, b, options);
  }
  public gov_compare_recall_accuracy<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_recall_accuracy<T>(a, b, options);
  }
  public gov_compare_regression_test<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_regression_test<T>(a, b, options);
  }
  public gov_compare_training_data_trust<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_training_data_trust<T>(a, b, options);
  }
  public gov_compare_safe_checkpoint<T = unknown>(a: T, b: T, options?: ComparisonOptions): ComparisonResult<T> {
    return this.gov.gov_compare_safe_checkpoint<T>(a, b, options);
  }
  public gov_prune_learning_input(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_learning_input(agentId, options);
  }
  public gov_prune_memory_budget(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_memory_budget(agentId, options);
  }
  public gov_prune_update_rate(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_update_rate(agentId, options);
  }
  public gov_prune_model_parameter_health(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_model_parameter_health(agentId, options);
  }
  public gov_prune_compute_budget(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_compute_budget(agentId, options);
  }
  public gov_prune_learning_latency(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_learning_latency(agentId, options);
  }
  public gov_prune_recall_accuracy(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_recall_accuracy(agentId, options);
  }
  public gov_prune_regression_test(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_regression_test(agentId, options);
  }
  public gov_prune_training_data_trust(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_training_data_trust(agentId, options);
  }
  public gov_prune_safe_checkpoint(agentId: string, options?: PruningOptions): PruningResult {
    return this.gov.gov_prune_safe_checkpoint(agentId, options);
  }

}
