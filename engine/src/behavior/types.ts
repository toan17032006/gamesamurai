/**
 * @file types.ts
 * @module @aetheria/engine/behavior/types
 * @description Comprehensive domain interfaces and types for the Behavior & Emotion Simulation System (1,200 functions).
 */

export type EmotionType =
  | 'joy'
  | 'happiness'
  | 'excitement'
  | 'sadness'
  | 'grief'
  | 'disappointment'
  | 'fear'
  | 'anxiety'
  | 'panic'
  | 'anger'
  | 'irritation'
  | 'frustration'
  | 'love'
  | 'affection'
  | 'compassion'
  | 'shame'
  | 'guilt'
  | 'pride'
  | 'gratitude'
  | 'curiosity'
  | 'surprise'
  | 'disgust'
  | 'contempt';

export interface EmotionalState {
  primaryEmotion: EmotionType;
  valence: number; // -1.0 to 1.0 (unpleasant to pleasant)
  arousal: number; // 0.0 to 1.0 (calm to highly stimulated)
  dominance: number; // 0.0 to 1.0 (submissive to dominant)
  intensity: number; // 0.0 to 1.0
  activeEmotions: Map<string, number>;
  moodBaseline: number; // general mood tendency (-1 to 1)
  stressLevel: number; // 0 to 100
}

export interface PersonalityProfile {
  openness: number; // 0 to 1
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  riskTolerance: number;
  noveltyPreference: number;
  impulseControl: number;
}

export interface GoalEntity {
  id: string;
  name: string;
  priority: number;
  difficulty: number;
  progress: number; // 0 to 1
  isCompleted: boolean;
  tasks: string[];
}

export interface CognitiveMemory {
  id: string;
  content: string;
  type: 'episodic' | 'semantic' | 'procedural';
  emotionalValence: number;
  timestamp: number;
  strength: number;
}

export interface BiologicalNeeds {
  hunger: number; // 0 to 100
  thirst: number;
  fatigue: number;
  sleepPressure: number;
  bodyTemperature: number; // Celsius
  painLevel: number;
  nauseaLevel: number;
}

export interface SocialRelationship {
  targetId: string;
  affinity: number; // -100 to 100
  trust: number; // 0 to 100
  familiarity: number; // 0 to 100
  dominanceDelta: number; // relative rank
  isKin: boolean;
}

export interface AnimalBehaviorState {
  species: string;
  arousal: number;
  valence: number;
  stress: number;
  fear: number;
  hunger: number;
  thirst: number;
  isHunting: boolean;
  isSleeping: boolean;
  isAlert: boolean;
  packLeaderId?: string;
  territoryId?: string;
}

export interface BehaviorPolicyState {
  actionValues: Map<string, number>;
  epsilon: number;
  totalReward: number;
  episodeCount: number;
}

export interface BehaviorSimulationConfig {
  tickRate?: number;
  fixedTimestep?: number;
  enableLOD?: boolean;
  lodDistanceThreshold?: number;
  maxSimulatedAgents?: number;
}
