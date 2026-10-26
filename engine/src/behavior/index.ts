/**
 * @file index.ts
 * @module @aetheria/engine/behavior
 * @description Public API and standalone functional wrappers for the Behavior Simulation System (1,200 functions).
 */

export * from './types.js';
export * from './behavior-system.js';
export * from './behavior-primitives.js';
export * from './behavior-random.js';
export * from './subsystems/human-emotion-subsystem.js';
export * from './subsystems/human-cognition-social-subsystem.js';
export * from './subsystems/somatic-lifestyle-subsystem.js';
export * from './subsystems/culture-labor-subsystem.js';
export * from './subsystems/zoological-species-subsystem.js';
export * from './subsystems/ecological-taxa-subsystem.js';
export * from './subsystems/simulation-ai-subsystem.js';

import { BehaviorSystem } from './behavior-system.js';

let activeBehaviorSystem: BehaviorSystem | null = null;

export function getActiveBehaviorSystem(): BehaviorSystem {
  if (!activeBehaviorSystem) {
    activeBehaviorSystem = new BehaviorSystem();
  }
  return activeBehaviorSystem;
}

export function setActiveBehaviorSystem(system: BehaviorSystem | null): void {
  activeBehaviorSystem = system;
}

export function initHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initHuman(...args);
}
export function updateHumanState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateHumanState(...args);
}
export function updateHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateHumanBehavior(...args);
}
export function evaluateHumanSituation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateHumanSituation(...args);
}
export function selectHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectHumanAction(...args);
}
export function executeHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).executeHumanAction(...args);
}
export function interruptHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interruptHumanAction(...args);
}
export function resumeHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resumeHumanAction(...args);
}
export function cancelHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).cancelHumanAction(...args);
}
export function queueHumanAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).queueHumanAction(...args);
}
export function prioritizeHumanActions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prioritizeHumanActions(...args);
}
export function blendHumanBehaviors(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).blendHumanBehaviors(...args);
}
export function switchHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).switchHumanBehavior(...args);
}
export function predictHumanReaction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).predictHumanReaction(...args);
}
export function adaptHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptHumanBehavior(...args);
}
export function stabilizeHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).stabilizeHumanBehavior(...args);
}
export function randomizeHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).randomizeHumanBehavior(...args);
}
export function evaluateBehaviorOutcome(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateBehaviorOutcome(...args);
}
export function learnBehaviorPattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnBehaviorPattern(...args);
}
export function resetHumanBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resetHumanBehavior(...args);
}
export function initEmotionSystem(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initEmotionSystem(...args);
}
export function updateEmotionState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateEmotionState(...args);
}
export function calculateEmotionalIntensity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).calculateEmotionalIntensity(...args);
}
export function decayEmotionOverTime(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).decayEmotionOverTime(...args);
}
export function triggerEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerEmotion(...args);
}
export function suppressEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).suppressEmotion(...args);
}
export function amplifyEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).amplifyEmotion(...args);
}
export function blendEmotions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).blendEmotions(...args);
}
export function resolveEmotionConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveEmotionConflict(...args);
}
export function classifyEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).classifyEmotion(...args);
}
export function evaluateEmotionalTrigger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateEmotionalTrigger(...args);
}
export function associateEmotionWithMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).associateEmotionWithMemory(...args);
}
export function associateEmotionWithPerson(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).associateEmotionWithPerson(...args);
}
export function associateEmotionWithPlace(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).associateEmotionWithPlace(...args);
}
export function transferEmotionalState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transferEmotionalState(...args);
}
export function stabilizeEmotionalState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).stabilizeEmotionalState(...args);
}
export function recoverFromEmotionalStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromEmotionalStress(...args);
}
export function evaluateEmotionalBalance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateEmotionalBalance(...args);
}
export function generateEmotionalVariation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateEmotionalVariation(...args);
}
export function resetEmotionalState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resetEmotionalState(...args);
}
export function feelJoy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelJoy(...args);
}
export function feelHappiness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelHappiness(...args);
}
export function feelExcitement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelExcitement(...args);
}
export function feelDelight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelDelight(...args);
}
export function feelAmusement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAmusement(...args);
}
export function feelPride(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelPride(...args);
}
export function feelGratitude(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelGratitude(...args);
}
export function feelRelief(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelRelief(...args);
}
export function feelHope(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelHope(...args);
}
export function feelContentment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelContentment(...args);
}
export function feelCuriosity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelCuriosity(...args);
}
export function feelWonder(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelWonder(...args);
}
export function feelAffection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAffection(...args);
}
export function feelAdmiration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAdmiration(...args);
}
export function feelInspiration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelInspiration(...args);
}
export function feelPlayfulness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelPlayfulness(...args);
}
export function feelAnticipation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAnticipation(...args);
}
export function increasePositiveAffect(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).increasePositiveAffect(...args);
}
export function shareHappiness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareHappiness(...args);
}
export function recoverPositiveMood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverPositiveMood(...args);
}
export function feelSadness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelSadness(...args);
}
export function feelGrief(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelGrief(...args);
}
export function feelDisappointment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelDisappointment(...args);
}
export function feelLoneliness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelLoneliness(...args);
}
export function feelEmptiness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelEmptiness(...args);
}
export function feelNostalgia(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelNostalgia(...args);
}
export function feelRegret(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelRegret(...args);
}
export function feelHopelessness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelHopelessness(...args);
}
export function feelHomesickness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelHomesickness(...args);
}
export function feelRejectionPain(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelRejectionPain(...args);
}
export function processPersonalLoss(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).processPersonalLoss(...args);
}
export function processFailedExpectation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).processFailedExpectation(...args);
}
export function withdrawSocially(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).withdrawSocially(...args);
}
export function seekEmotionalComfort(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekEmotionalComfort(...args);
}
export function expressSadness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressSadness(...args);
}
export function concealSadness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).concealSadness(...args);
}
export function ruminateOnNegativeEvent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).ruminateOnNegativeEvent(...args);
}
export function acceptPersonalLoss(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).acceptPersonalLoss(...args);
}
export function recoverFromDisappointment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromDisappointment(...args);
}
export function restoreEmotionalResilience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).restoreEmotionalResilience(...args);
}
export function feelFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelFear(...args);
}
export function feelAnxiety(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAnxiety(...args);
}
export function feelPanic(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelPanic(...args);
}
export function feelDread(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelDread(...args);
}
export function feelSuspicion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelSuspicion(...args);
}
export function detectPotentialThreat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectPotentialThreat(...args);
}
export function estimateThreatSeverity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateThreatSeverity(...args);
}
export function estimateThreatDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateThreatDistance(...args);
}
export function triggerFightResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerFightResponse(...args);
}
export function triggerFlightResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerFlightResponse(...args);
}
export function triggerFreezeResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerFreezeResponse(...args);
}
export function triggerFawnResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerFawnResponse(...args);
}
export function scanEnvironmentForThreats(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).scanEnvironmentForThreats(...args);
}
export function avoidThreateningEntity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidThreateningEntity(...args);
}
export function seekSafety(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekSafety(...args);
}
export function seekProtection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekProtection(...args);
}
export function communicateFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).communicateFear(...args);
}
export function suppressFearResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).suppressFearResponse(...args);
}
export function reassessThreatLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reassessThreatLevel(...args);
}
export function recoverFromFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromFear(...args);
}
export function feelAnger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelAnger(...args);
}
export function feelIrritation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelIrritation(...args);
}
export function feelFrustration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelFrustration(...args);
}
export function feelResentment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelResentment(...args);
}
export function feelJealousy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelJealousy(...args);
}
export function feelEnvy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelEnvy(...args);
}
export function feelContempt(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelContempt(...args);
}
export function feelIndignation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelIndignation(...args);
}
export function identifyAngerTrigger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyAngerTrigger(...args);
}
export function estimateAngerIntensity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateAngerIntensity(...args);
}
export function expressAngerVerbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressAngerVerbally(...args);
}
export function expressAngerPhysically(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressAngerPhysically(...args);
}
export function suppressAnger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).suppressAnger(...args);
}
export function deescalateAnger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).deescalateAnger(...args);
}
export function redirectAnger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).redirectAnger(...args);
}
export function initiateConfrontation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateConfrontation(...args);
}
export function withdrawFromConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).withdrawFromConflict(...args);
}
export function evaluateConflictConsequences(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateConflictConsequences(...args);
}
export function resolveInterpersonalConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveInterpersonalConflict(...args);
}
export function recoverAfterAnger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverAfterAnger(...args);
}
export function developAffection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developAffection(...args);
}
export function developRomanticAttraction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developRomanticAttraction(...args);
}
export function developEmotionalAttachment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developEmotionalAttachment(...args);
}
export function strengthenRelationshipBond(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).strengthenRelationshipBond(...args);
}
export function weakenRelationshipBond(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).weakenRelationshipBond(...args);
}
export function seekIntimacy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekIntimacy(...args);
}
export function seekCompanionship(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekCompanionship(...args);
}
export function expressLove(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressLove(...args);
}
export function expressAffectionPhysically(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressAffectionPhysically(...args);
}
export function expressAffectionVerbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressAffectionVerbally(...args);
}
export function respondToAffection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToAffection(...args);
}
export function recognizeRomanticInterest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeRomanticInterest(...args);
}
export function evaluateRelationshipCompatibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateRelationshipCompatibility(...args);
}
export function maintainRelationshipTrust(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainRelationshipTrust(...args);
}
export function experienceSeparationDistress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceSeparationDistress(...args);
}
export function seekReconciliation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekReconciliation(...args);
}
export function establishPersonalBoundaries(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).establishPersonalBoundaries(...args);
}
export function respectRelationshipBoundaries(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respectRelationshipBoundaries(...args);
}
export function adaptToRelationshipChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToRelationshipChange(...args);
}
export function endRelationship(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).endRelationship(...args);
}
export function recognizeOthersDistress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeOthersDistress(...args);
}
export function inferOthersEmotions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferOthersEmotions(...args);
}
export function simulateCognitiveEmpathy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateCognitiveEmpathy(...args);
}
export function simulateEmotionalEmpathy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateEmotionalEmpathy(...args);
}
export function feelCompassion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelCompassion(...args);
}
export function feelSympathy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feelSympathy(...args);
}
export function offerEmotionalSupport(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).offerEmotionalSupport(...args);
}
export function offerPracticalHelp(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).offerPracticalHelp(...args);
}
export function comfortDistressedPerson(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).comfortDistressedPerson(...args);
}
export function listenActively(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).listenActively(...args);
}
export function validateOthersFeelings(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).validateOthersFeelings(...args);
}
export function inferUnspokenNeeds(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferUnspokenNeeds(...args);
}
export function prioritizeOthersWelfare(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prioritizeOthersWelfare(...args);
}
export function performAltruisticAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performAltruisticAction(...args);
}
export function shareResources(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareResources(...args);
}
export function cooperateForMutualBenefit(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).cooperateForMutualBenefit(...args);
}
export function respondToInjustice(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToInjustice(...args);
}
export function forgiveOthers(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).forgiveOthers(...args);
}
export function expressGratitudeToOthers(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressGratitudeToOthers(...args);
}
export function maintainEmpathicEngagement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainEmpathicEngagement(...args);
}
export function evaluateSelfWorth(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateSelfWorth(...args);
}
export function estimateSelfConfidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSelfConfidence(...args);
}
export function updateSelfImage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateSelfImage(...args);
}
export function compareSelfWithOthers(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).compareSelfWithOthers(...args);
}
export function evaluatePersonalStrengths(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluatePersonalStrengths(...args);
}
export function evaluatePersonalWeaknesses(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluatePersonalWeaknesses(...args);
}
export function recognizePersonalNeeds(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePersonalNeeds(...args);
}
export function recognizePersonalLimits(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePersonalLimits(...args);
}
export function expressSelfIdentity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressSelfIdentity(...args);
}
export function protectSelfEsteem(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).protectSelfEsteem(...args);
}
export function recoverSelfConfidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverSelfConfidence(...args);
}
export function experienceEmbarrassment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceEmbarrassment(...args);
}
export function experienceShame(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceShame(...args);
}
export function experienceGuilt(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceGuilt(...args);
}
export function experienceHumiliation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceHumiliation(...args);
}
export function acceptPersonalFlaws(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).acceptPersonalFlaws(...args);
}
export function acknowledgePersonalAchievement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).acknowledgePersonalAchievement(...args);
}
export function defendPersonalIdentity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendPersonalIdentity(...args);
}
export function reflectOnPersonalValues(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reflectOnPersonalValues(...args);
}
export function updateSelfConcept(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateSelfConcept(...args);
}
export function generateMotivation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateMotivation(...args);
}
export function estimateMotivationLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateMotivationLevel(...args);
}
export function setPersonalGoal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).setPersonalGoal(...args);
}
export function decomposeGoalIntoTasks(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).decomposeGoalIntoTasks(...args);
}
export function prioritizePersonalGoals(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prioritizePersonalGoals(...args);
}
export function estimateGoalDifficulty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateGoalDifficulty(...args);
}
export function estimateGoalValue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateGoalValue(...args);
}
export function estimateGoalSuccessProbability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateGoalSuccessProbability(...args);
}
export function commitToGoal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).commitToGoal(...args);
}
export function maintainTaskPersistence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainTaskPersistence(...args);
}
export function resistImmediateReward(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resistImmediateReward(...args);
}
export function delayGratification(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).delayGratification(...args);
}
export function overcomeProcrastination(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).overcomeProcrastination(...args);
}
export function recoverMotivationAfterFailure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverMotivationAfterFailure(...args);
}
export function reviseUnrealisticGoal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reviseUnrealisticGoal(...args);
}
export function trackGoalProgress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).trackGoalProgress(...args);
}
export function evaluateGoalCompletion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateGoalCompletion(...args);
}
export function rewardGoalAchievement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rewardGoalAchievement(...args);
}
export function abandonUnreachableGoal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).abandonUnreachableGoal(...args);
}
export function formLongTermIntention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).formLongTermIntention(...args);
}
export function focusAttention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).focusAttention(...args);
}
export function shiftAttention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shiftAttention(...args);
}
export function divideAttention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).divideAttention(...args);
}
export function sustainAttention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).sustainAttention(...args);
}
export function filterSensoryInput(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).filterSensoryInput(...args);
}
export function detectVisualStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectVisualStimulus(...args);
}
export function detectAuditoryStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAuditoryStimulus(...args);
}
export function detectOlfactoryStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectOlfactoryStimulus(...args);
}
export function detectTactileStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectTactileStimulus(...args);
}
export function estimateObjectDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateObjectDistance(...args);
}
export function estimateObjectMotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateObjectMotion(...args);
}
export function recognizeFamiliarObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFamiliarObject(...args);
}
export function recognizeFamiliarFace(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFamiliarFace(...args);
}
export function detectEnvironmentalChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectEnvironmentalChange(...args);
}
export function identifyRelevantStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyRelevantStimulus(...args);
}
export function interpretAmbiguousStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretAmbiguousStimulus(...args);
}
export function updatePerceptualExpectation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updatePerceptualExpectation(...args);
}
export function resolveSensoryConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveSensoryConflict(...args);
}
export function estimatePerceptualConfidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimatePerceptualConfidence(...args);
}
export function orientTowardStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientTowardStimulus(...args);
}
export function encodeShortTermMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).encodeShortTermMemory(...args);
}
export function encodeLongTermMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).encodeLongTermMemory(...args);
}
export function retrieveEpisodicMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveEpisodicMemory(...args);
}
export function retrieveSemanticMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveSemanticMemory(...args);
}
export function retrieveProceduralMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveProceduralMemory(...args);
}
export function associateMemoryWithEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).associateMemoryWithEmotion(...args);
}
export function associateMemoryWithContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).associateMemoryWithContext(...args);
}
export function consolidateMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).consolidateMemory(...args);
}
export function forgetIrrelevantMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).forgetIrrelevantMemory(...args);
}
export function recognizePastExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePastExperience(...args);
}
export function learnFromReward(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFromReward(...args);
}
export function learnFromPunishment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFromPunishment(...args);
}
export function learnByObservation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnByObservation(...args);
}
export function learnByImitation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnByImitation(...args);
}
export function learnByTrialAndError(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnByTrialAndError(...args);
}
export function generalizeLearnedPattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generalizeLearnedPattern(...args);
}
export function correctFaultyMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).correctFaultyMemory(...args);
}
export function updateBeliefFromEvidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBeliefFromEvidence(...args);
}
export function predictUsingPastExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).predictUsingPastExperience(...args);
}
export function replayLearnedSkill(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).replayLearnedSkill(...args);
}
export function generateDecisionOptions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateDecisionOptions(...args);
}
export function evaluateDecisionOptions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateDecisionOptions(...args);
}
export function estimateDecisionRisk(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateDecisionRisk(...args);
}
export function estimateDecisionReward(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateDecisionReward(...args);
}
export function compareExpectedOutcomes(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).compareExpectedOutcomes(...args);
}
export function applyLogicalReasoning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).applyLogicalReasoning(...args);
}
export function applyCausalReasoning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).applyCausalReasoning(...args);
}
export function applyAnalogicalReasoning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).applyAnalogicalReasoning(...args);
}
export function inferHiddenCause(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferHiddenCause(...args);
}
export function resolveCognitiveConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveCognitiveConflict(...args);
}
export function detectCognitiveBias(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCognitiveBias(...args);
}
export function reviseInitialJudgment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reviseInitialJudgment(...args);
}
export function estimateDecisionConfidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateDecisionConfidence(...args);
}
export function makeRiskSensitiveDecision(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).makeRiskSensitiveDecision(...args);
}
export function makeSocialDecision(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).makeSocialDecision(...args);
}
export function makeMoralJudgment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).makeMoralJudgment(...args);
}
export function chooseUnderUncertainty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).chooseUnderUncertainty(...args);
}
export function planAlternativeAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).planAlternativeAction(...args);
}
export function evaluateDecisionOutcome(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateDecisionOutcome(...args);
}
export function learnFromDecisionError(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFromDecisionError(...args);
}
export function generateSpeechIntent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateSpeechIntent(...args);
}
export function selectWordsForSpeech(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectWordsForSpeech(...args);
}
export function constructSentence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).constructSentence(...args);
}
export function adjustSpeechTone(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSpeechTone(...args);
}
export function adjustSpeechVolume(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSpeechVolume(...args);
}
export function adjustSpeechRate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSpeechRate(...args);
}
export function generateConversationalPause(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateConversationalPause(...args);
}
export function initiateConversation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateConversation(...args);
}
export function maintainConversation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainConversation(...args);
}
export function changeConversationTopic(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).changeConversationTopic(...args);
}
export function askClarifyingQuestion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).askClarifyingQuestion(...args);
}
export function answerDirectQuestion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).answerDirectQuestion(...args);
}
export function interruptConversationPolitely(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interruptConversationPolitely(...args);
}
export function detectConversationTurn(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectConversationTurn(...args);
}
export function interpretFigurativeLanguage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretFigurativeLanguage(...args);
}
export function interpretSarcasm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretSarcasm(...args);
}
export function interpretHumor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretHumor(...args);
}
export function expressUncertaintyVerbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressUncertaintyVerbally(...args);
}
export function repairMiscommunication(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).repairMiscommunication(...args);
}
export function adaptSpeechToListener(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptSpeechToListener(...args);
}
export function updateFacialExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateFacialExpression(...args);
}
export function generateSmile(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateSmile(...args);
}
export function generateFrown(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateFrown(...args);
}
export function generateSurprisedExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateSurprisedExpression(...args);
}
export function generateFearExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateFearExpression(...args);
}
export function generateAngerExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateAngerExpression(...args);
}
export function generateSadnessExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateSadnessExpression(...args);
}
export function generateDisgustExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateDisgustExpression(...args);
}
export function generateConfusionExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateConfusionExpression(...args);
}
export function generateContemptExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateContemptExpression(...args);
}
export function controlEyebrowMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).controlEyebrowMovement(...args);
}
export function controlEyelidMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).controlEyelidMovement(...args);
}
export function controlPupilDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).controlPupilDirection(...args);
}
export function generateEyeContact(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateEyeContact(...args);
}
export function avoidEyeContact(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidEyeContact(...args);
}
export function generateNaturalBlink(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateNaturalBlink(...args);
}
export function synchronizeLipMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeLipMovement(...args);
}
export function blendFacialExpressions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).blendFacialExpressions(...args);
}
export function maskFacialEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maskFacialEmotion(...args);
}
export function synchronizeFaceWithEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeFaceWithEmotion(...args);
}
export function updateBodyPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBodyPosture(...args);
}
export function generateConfidentPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateConfidentPosture(...args);
}
export function generateDefensivePosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateDefensivePosture(...args);
}
export function generateRelaxedPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateRelaxedPosture(...args);
}
export function generateTensePosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateTensePosture(...args);
}
export function generateSubmissivePosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateSubmissivePosture(...args);
}
export function generateDominantPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateDominantPosture(...args);
}
export function crossArms(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).crossArms(...args);
}
export function shiftBodyWeight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shiftBodyWeight(...args);
}
export function adjustSittingPosition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSittingPosition(...args);
}
export function adjustStandingPosition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustStandingPosition(...args);
}
export function generateNervousFidgeting(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateNervousFidgeting(...args);
}
export function generateHandGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateHandGesture(...args);
}
export function generateHeadGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateHeadGesture(...args);
}
export function nodInAgreement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).nodInAgreement(...args);
}
export function shakeHeadInDisagreement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shakeHeadInDisagreement(...args);
}
export function regulateInterpersonalDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateInterpersonalDistance(...args);
}
export function mirrorBodyLanguage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).mirrorBodyLanguage(...args);
}
export function synchronizeBodyMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeBodyMovement(...args);
}
export function expressEmotionThroughPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressEmotionThroughPosture(...args);
}
export function identifySocialGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifySocialGroup(...args);
}
export function joinSocialGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).joinSocialGroup(...args);
}
export function leaveSocialGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).leaveSocialGroup(...args);
}
export function establishSocialRole(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).establishSocialRole(...args);
}
export function recognizeSocialHierarchy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeSocialHierarchy(...args);
}
export function negotiateSocialStatus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).negotiateSocialStatus(...args);
}
export function seekSocialApproval(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekSocialApproval(...args);
}
export function avoidSocialRejection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidSocialRejection(...args);
}
export function followGroupNorms(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followGroupNorms(...args);
}
export function challengeGroupNorms(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).challengeGroupNorms(...args);
}
export function conformToPeerPressure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).conformToPeerPressure(...args);
}
export function resistPeerPressure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resistPeerPressure(...args);
}
export function buildSocialAlliance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).buildSocialAlliance(...args);
}
export function maintainSocialReputation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainSocialReputation(...args);
}
export function exchangeSocialInformation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exchangeSocialInformation(...args);
}
export function coordinateGroupAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateGroupAction(...args);
}
export function resolveGroupDisagreement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveGroupDisagreement(...args);
}
export function respondToSocialExclusion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSocialExclusion(...args);
}
export function recognizeGroupMembership(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeGroupMembership(...args);
}
export function adaptToSocialContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToSocialContext(...args);
}
export function initiateCooperation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateCooperation(...args);
}
export function maintainCooperation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainCooperation(...args);
}
export function evaluatePartnerReliability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluatePartnerReliability(...args);
}
export function shareTaskResponsibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareTaskResponsibility(...args);
}
export function coordinateJointTask(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateJointTask(...args);
}
export function negotiateResourceExchange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).negotiateResourceExchange(...args);
}
export function offerTradeProposal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).offerTradeProposal(...args);
}
export function evaluateTradeFairness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateTradeFairness(...args);
}
export function detectFreeRiding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectFreeRiding(...args);
}
export function respondToUnfairTreatment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToUnfairTreatment(...args);
}
export function initiateCompetition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateCompetition(...args);
}
export function estimateCompetitorAbility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateCompetitorAbility(...args);
}
export function adjustCompetitiveStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustCompetitiveStrategy(...args);
}
export function concedeCompetitiveAdvantage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).concedeCompetitiveAdvantage(...args);
}
export function celebrateSharedSuccess(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).celebrateSharedSuccess(...args);
}
export function shareCreditForAchievement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareCreditForAchievement(...args);
}
export function resolveResourceConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveResourceConflict(...args);
}
export function buildReciprocalTrust(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).buildReciprocalTrust(...args);
}
export function rememberSocialExchange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberSocialExchange(...args);
}
export function updateCooperationPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateCooperationPreference(...args);
}
export function evaluateMoralRule(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateMoralRule(...args);
}
export function recognizeMoralViolation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeMoralViolation(...args);
}
export function evaluateFairness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateFairness(...args);
}
export function evaluateHonesty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateHonesty(...args);
}
export function evaluateIntentions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateIntentions(...args);
}
export function evaluateConsequencesMorally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateConsequencesMorally(...args);
}
export function experienceMoralConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).experienceMoralConflict(...args);
}
export function followInternalizedNorm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followInternalizedNorm(...args);
}
export function questionAuthority(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).questionAuthority(...args);
}
export function obeyLegitimateAuthority(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).obeyLegitimateAuthority(...args);
}
export function refuseUnethicalRequest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).refuseUnethicalRequest(...args);
}
export function admitWrongdoing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).admitWrongdoing(...args);
}
export function apologizeSincerely(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).apologizeSincerely(...args);
}
export function makeAmends(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).makeAmends(...args);
}
export function assignMoralResponsibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).assignMoralResponsibility(...args);
}
export function judgeIntentVersusOutcome(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).judgeIntentVersusOutcome(...args);
}
export function applyCulturalNorm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).applyCulturalNorm(...args);
}
export function adaptMoralJudgmentToContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptMoralJudgmentToContext(...args);
}
export function resolveEthicalDilemma(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveEthicalDilemma(...args);
}
export function learnSocialNorms(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnSocialNorms(...args);
}
export function initializePersonalityProfile(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initializePersonalityProfile(...args);
}
export function updatePersonalityTrait(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updatePersonalityTrait(...args);
}
export function estimateIntroversionLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateIntroversionLevel(...args);
}
export function estimateExtraversionLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateExtraversionLevel(...args);
}
export function estimateOpennessLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateOpennessLevel(...args);
}
export function estimateConscientiousnessLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateConscientiousnessLevel(...args);
}
export function estimateAgreeablenessLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateAgreeablenessLevel(...args);
}
export function estimateEmotionalStability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateEmotionalStability(...args);
}
export function formBehavioralHabit(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).formBehavioralHabit(...args);
}
export function reinforceBehavioralHabit(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reinforceBehavioralHabit(...args);
}
export function breakBehavioralHabit(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).breakBehavioralHabit(...args);
}
export function triggerHabitRoutine(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerHabitRoutine(...args);
}
export function adaptHabitToContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptHabitToContext(...args);
}
export function estimateRiskTolerance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateRiskTolerance(...args);
}
export function estimateNoveltyPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateNoveltyPreference(...args);
}
export function estimateSocialPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSocialPreference(...args);
}
export function estimateConflictTolerance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateConflictTolerance(...args);
}
export function estimateImpulseControl(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateImpulseControl(...args);
}
export function maintainPersonalityConsistency(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainPersonalityConsistency(...args);
}
export function adaptPersonalityExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptPersonalityExpression(...args);
}
export function detectStressTrigger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectStressTrigger(...args);
}
export function estimateStressLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateStressLevel(...args);
}
export function activateStressResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).activateStressResponse(...args);
}
export function updatePhysiologicalArousal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updatePhysiologicalArousal(...args);
}
export function increaseHeartRateUnderStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).increaseHeartRateUnderStress(...args);
}
export function regulateBreathingUnderStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateBreathingUnderStress(...args);
}
export function generateStressSweating(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateStressSweating(...args);
}
export function detectStressOverload(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectStressOverload(...args);
}
export function applyCopingStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).applyCopingStrategy(...args);
}
export function useProblemFocusedCoping(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).useProblemFocusedCoping(...args);
}
export function useEmotionFocusedCoping(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).useEmotionFocusedCoping(...args);
}
export function seekStressSupport(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekStressSupport(...args);
}
export function takeRecoveryBreak(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).takeRecoveryBreak(...args);
}
export function reframeStressfulSituation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reframeStressfulSituation(...args);
}
export function reducePhysiologicalArousal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reducePhysiologicalArousal(...args);
}
export function restoreCognitivePerformance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).restoreCognitivePerformance(...args);
}
export function buildStressResilience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).buildStressResilience(...args);
}
export function adaptToRepeatedStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToRepeatedStress(...args);
}
export function detectBurnoutRisk(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectBurnoutRisk(...args);
}
export function recoverFromProlongedStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromProlongedStress(...args);
}
export function updateBiologicalNeeds(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBiologicalNeeds(...args);
}
export function estimateHungerLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateHungerLevel(...args);
}
export function estimateThirstLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateThirstLevel(...args);
}
export function estimateFatigueLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateFatigueLevel(...args);
}
export function estimateSleepPressure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSleepPressure(...args);
}
export function estimateBodyTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateBodyTemperature(...args);
}
export function regulateBodyTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateBodyTemperature(...args);
}
export function regulateFluidBalance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateFluidBalance(...args);
}
export function regulateEnergyBalance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateEnergyBalance(...args);
}
export function triggerHungerBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerHungerBehavior(...args);
}
export function triggerThirstBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerThirstBehavior(...args);
}
export function triggerRestBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerRestBehavior(...args);
}
export function triggerSleepBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerSleepBehavior(...args);
}
export function triggerThermoregulationBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerThermoregulationBehavior(...args);
}
export function seekNutritionallyUsefulFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekNutritionallyUsefulFood(...args);
}
export function avoidSpoiledFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidSpoiledFood(...args);
}
export function respondToPainSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToPainSignal(...args);
}
export function respondToNausea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToNausea(...args);
}
export function recoverEnergyAfterRest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverEnergyAfterRest(...args);
}
export function maintainHomeostasis(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainHomeostasis(...args);
}
export function searchForFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchForFood(...args);
}
export function recognizeEdibleFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeEdibleFood(...args);
}
export function recognizeInedibleSubstance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeInedibleSubstance(...args);
}
export function evaluateFoodSafety(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateFoodSafety(...args);
}
export function evaluateFoodPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateFoodPreference(...args);
}
export function selectFoodItem(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectFoodItem(...args);
}
export function approachFoodSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachFoodSource(...args);
}
export function inspectFoodBySmell(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inspectFoodBySmell(...args);
}
export function inspectFoodByAppearance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inspectFoodByAppearance(...args);
}
export function prepareFoodForConsumption(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prepareFoodForConsumption(...args);
}
export function initiateEating(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateEating(...args);
}
export function controlBiteSize(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).controlBiteSize(...args);
}
export function simulateChewing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateChewing(...args);
}
export function simulateSwallowing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateSwallowing(...args);
}
export function estimateSatietyLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSatietyLevel(...args);
}
export function stopEatingWhenSatisfied(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).stopEatingWhenSatisfied(...args);
}
export function shareFoodWithOthers(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareFoodWithOthers(...args);
}
export function protectFoodResource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).protectFoodResource(...args);
}
export function rememberFoodPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberFoodPreference(...args);
}
export function adaptDietToAvailability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptDietToAvailability(...args);
}
export function updateCircadianRhythm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateCircadianRhythm(...args);
}
export function estimateSleepiness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSleepiness(...args);
}
export function selectSleepLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectSleepLocation(...args);
}
export function prepareForSleep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prepareForSleep(...args);
}
export function initiateSleep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateSleep(...args);
}
export function transitionSleepStage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transitionSleepStage(...args);
}
export function simulateDeepSleep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateDeepSleep(...args);
}
export function simulateRapidEyeMovementSleep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateRapidEyeMovementSleep(...args);
}
export function simulateDreamActivity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateDreamActivity(...args);
}
export function respondToSleepDisturbance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSleepDisturbance(...args);
}
export function wakeFromSleep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).wakeFromSleep(...args);
}
export function estimateSleepQuality(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateSleepQuality(...args);
}
export function recoverFromSleepDebt(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromSleepDebt(...args);
}
export function takeShortNap(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).takeShortNap(...args);
}
export function adaptSleepSchedule(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptSleepSchedule(...args);
}
export function seekQuietRestingPlace(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekQuietRestingPlace(...args);
}
export function chooseComfortableSleepingPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).chooseComfortableSleepingPosture(...args);
}
export function respondToNighttimeNoise(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToNighttimeNoise(...args);
}
export function adjustActivityToDaylight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustActivityToDaylight(...args);
}
export function synchronizeSleepWithEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeSleepWithEnvironment(...args);
}
export function initiateLocomotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateLocomotion(...args);
}
export function selectWalkingDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectWalkingDirection(...args);
}
export function adjustWalkingSpeed(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustWalkingSpeed(...args);
}
export function simulateNaturalWalking(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateNaturalWalking(...args);
}
export function simulateRunning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateRunning(...args);
}
export function simulateJumping(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateJumping(...args);
}
export function simulateCrouching(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateCrouching(...args);
}
export function simulateKneeling(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateKneeling(...args);
}
export function simulateCrawling(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateCrawling(...args);
}
export function maintainPosturalBalance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainPosturalBalance(...args);
}
export function recoverFromLossOfBalance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromLossOfBalance(...args);
}
export function avoidWalkingObstacle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidWalkingObstacle(...args);
}
export function navigateAroundPerson(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).navigateAroundPerson(...args);
}
export function coordinateHandEyeMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateHandEyeMovement(...args);
}
export function reachForObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reachForObject(...args);
}
export function graspObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).graspObject(...args);
}
export function releaseObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).releaseObject(...args);
}
export function adjustGripStrength(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustGripStrength(...args);
}
export function coordinateWholeBodyMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateWholeBodyMovement(...args);
}
export function adaptMovementToTerrain(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptMovementToTerrain(...args);
}
export function inspectNearbyObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inspectNearbyObject(...args);
}
export function approachInteractiveObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachInteractiveObject(...args);
}
export function touchObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).touchObject(...args);
}
export function pickUpObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pickUpObject(...args);
}
export function putDownObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).putDownObject(...args);
}
export function carryObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).carryObject(...args);
}
export function pushObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pushObject(...args);
}
export function pullObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pullObject(...args);
}
export function openContainer(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).openContainer(...args);
}
export function closeContainer(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).closeContainer(...args);
}
export function operateSimpleTool(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).operateSimpleTool(...args);
}
export function inspectObjectDamage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inspectObjectDamage(...args);
}
export function repairSimpleObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).repairSimpleObject(...args);
}
export function searchForLostObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchForLostObject(...args);
}
export function storeObjectInLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).storeObjectInLocation(...args);
}
export function retrieveStoredObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveStoredObject(...args);
}
export function organizePersonalBelongings(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).organizePersonalBelongings(...args);
}
export function cleanNearbyArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).cleanNearbyArea(...args);
}
export function adaptObjectUseToContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptObjectUseToContext(...args);
}
export function learnObjectAffordances(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnObjectAffordances(...args);
}
export function initializeDevelopmentStage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initializeDevelopmentStage(...args);
}
export function updatePhysicalGrowth(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updatePhysicalGrowth(...args);
}
export function updateCognitiveDevelopment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateCognitiveDevelopment(...args);
}
export function updateEmotionalMaturity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateEmotionalMaturity(...args);
}
export function learnDevelopmentalSkill(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnDevelopmentalSkill(...args);
}
export function developMotorCoordination(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developMotorCoordination(...args);
}
export function developLanguageAbility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developLanguageAbility(...args);
}
export function developSocialUnderstanding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developSocialUnderstanding(...args);
}
export function developSelfRegulation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).developSelfRegulation(...args);
}
export function adaptToPubertyChanges(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToPubertyChanges(...args);
}
export function updateAdultBehaviorPatterns(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAdultBehaviorPatterns(...args);
}
export function adaptToAging(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToAging(...args);
}
export function updateSensorySensitivity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateSensorySensitivity(...args);
}
export function updateMobilityCapacity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateMobilityCapacity(...args);
}
export function preserveLearnedSkills(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).preserveLearnedSkills(...args);
}
export function adaptToCognitiveDecline(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToCognitiveDecline(...args);
}
export function seekIntergenerationalSupport(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekIntergenerationalSupport(...args);
}
export function mentorYoungerIndividual(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).mentorYoungerIndividual(...args);
}
export function transferCulturalKnowledge(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transferCulturalKnowledge(...args);
}
export function updateLifespanState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateLifespanState(...args);
}
export function recognizeFamilyMember(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFamilyMember(...args);
}
export function maintainFamilyBond(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainFamilyBond(...args);
}
export function seekCaregiver(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekCaregiver(...args);
}
export function respondToCaregiverPresence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToCaregiverPresence(...args);
}
export function provideCareToDependent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).provideCareToDependent(...args);
}
export function monitorDependentSafety(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).monitorDependentSafety(...args);
}
export function comfortDistressedChild(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).comfortDistressedChild(...args);
}
export function teachBasicSkill(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).teachBasicSkill(...args);
}
export function demonstrateExpectedBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).demonstrateExpectedBehavior(...args);
}
export function reinforceHelpfulBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reinforceHelpfulBehavior(...args);
}
export function setFamilyBoundary(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).setFamilyBoundary(...args);
}
export function respondToFamilyDisagreement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToFamilyDisagreement(...args);
}
export function mediateFamilyConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).mediateFamilyConflict(...args);
}
export function coordinateHouseholdTask(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateHouseholdTask(...args);
}
export function shareCaregivingDuty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareCaregivingDuty(...args);
}
export function expressFamilyAffection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressFamilyAffection(...args);
}
export function respondToFamilySeparation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToFamilySeparation(...args);
}
export function reuniteWithFamilyMember(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reuniteWithFamilyMember(...args);
}
export function preserveFamilyTradition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).preserveFamilyTradition(...args);
}
export function adaptToFamilyStructureChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToFamilyStructureChange(...args);
}
export function detectCrowdDensity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCrowdDensity(...args);
}
export function estimateCrowdMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateCrowdMovement(...args);
}
export function navigateThroughCrowd(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).navigateThroughCrowd(...args);
}
export function maintainPersonalSpaceInCrowd(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainPersonalSpaceInCrowd(...args);
}
export function followPedestrianFlow(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followPedestrianFlow(...args);
}
export function avoidCrowdCollision(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidCrowdCollision(...args);
}
export function respondToCrowdExcitement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToCrowdExcitement(...args);
}
export function respondToCrowdFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToCrowdFear(...args);
}
export function detectCrowdPanic(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCrowdPanic(...args);
}
export function seekCrowdExit(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekCrowdExit(...args);
}
export function followPublicQueue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followPublicQueue(...args);
}
export function maintainQueuePosition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainQueuePosition(...args);
}
export function yieldToOtherPedestrian(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).yieldToOtherPedestrian(...args);
}
export function requestPublicAssistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).requestPublicAssistance(...args);
}
export function respondToPublicAnnouncement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToPublicAnnouncement(...args);
}
export function recognizePublicSignage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePublicSignage(...args);
}
export function adaptBehaviorToPublicSetting(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptBehaviorToPublicSetting(...args);
}
export function detectSuspiciousSituation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectSuspiciousSituation(...args);
}
export function offerHelpToStranger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).offerHelpToStranger(...args);
}
export function recoverAfterCrowdDisturbance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverAfterCrowdDisturbance(...args);
}
export function detectUnexpectedEvent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectUnexpectedEvent(...args);
}
export function triggerStartleResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerStartleResponse(...args);
}
export function orientTowardUnexpectedSound(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientTowardUnexpectedSound(...args);
}
export function orientTowardSuddenMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientTowardSuddenMovement(...args);
}
export function pauseCurrentAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pauseCurrentAction(...args);
}
export function reassessCurrentSituation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reassessCurrentSituation(...args);
}
export function identifyEventSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyEventSource(...args);
}
export function classifyEventUrgency(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).classifyEventUrgency(...args);
}
export function selectImmediateResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectImmediateResponse(...args);
}
export function avoidSuddenHazard(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidSuddenHazard(...args);
}
export function seekInformationAfterSurprise(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekInformationAfterSurprise(...args);
}
export function expressSurprise(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).expressSurprise(...args);
}
export function recoverFromStartle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverFromStartle(...args);
}
export function adaptPlanAfterInterruption(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptPlanAfterInterruption(...args);
}
export function respondToUnexpectedTouch(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToUnexpectedTouch(...args);
}
export function respondToSuddenLightChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSuddenLightChange(...args);
}
export function respondToSuddenTemperatureChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSuddenTemperatureChange(...args);
}
export function evaluateFalseAlarm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateFalseAlarm(...args);
}
export function updateExpectationAfterSurprise(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateExpectationAfterSurprise(...args);
}
export function resumeNormalActivity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resumeNormalActivity(...args);
}
export function selectWorkTask(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectWorkTask(...args);
}
export function prepareWorkEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prepareWorkEnvironment(...args);
}
export function estimateTaskDuration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateTaskDuration(...args);
}
export function allocateTaskResources(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).allocateTaskResources(...args);
}
export function startWorkSession(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).startWorkSession(...args);
}
export function maintainWorkFocus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainWorkFocus(...args);
}
export function switchBetweenTasks(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).switchBetweenTasks(...args);
}
export function detectWorkError(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectWorkError(...args);
}
export function correctWorkError(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).correctWorkError(...args);
}
export function requestWorkClarification(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).requestWorkClarification(...args);
}
export function askForWorkAssistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).askForWorkAssistance(...args);
}
export function provideWorkFeedback(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).provideWorkFeedback(...args);
}
export function receiveWorkFeedback(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).receiveWorkFeedback(...args);
}
export function adaptToWorkPressure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToWorkPressure(...args);
}
export function coordinateWithCoworker(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateWithCoworker(...args);
}
export function negotiateWorkResponsibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).negotiateWorkResponsibility(...args);
}
export function maintainWorkMotivation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainWorkMotivation(...args);
}
export function evaluateWorkPerformance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateWorkPerformance(...args);
}
export function completeWorkTask(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).completeWorkTask(...args);
}
export function transitionOutOfWorkMode(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transitionOutOfWorkMode(...args);
}
export function selectLeisureActivity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectLeisureActivity(...args);
}
export function initiatePlayBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiatePlayBehavior(...args);
}
export function explorePlayEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).explorePlayEnvironment(...args);
}
export function followGameRules(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followGameRules(...args);
}
export function learnGameRules(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnGameRules(...args);
}
export function selectGameStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectGameStrategy(...args);
}
export function anticipateOpponentMove(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).anticipateOpponentMove(...args);
}
export function respondToGameChallenge(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToGameChallenge(...args);
}
export function celebrateGameVictory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).celebrateGameVictory(...args);
}
export function copeWithGameDefeat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).copeWithGameDefeat(...args);
}
export function displayCompetitiveExcitement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).displayCompetitiveExcitement(...args);
}
export function practiceRepeatedSkill(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).practiceRepeatedSkill(...args);
}
export function learnFromGameFeedback(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFromGameFeedback(...args);
}
export function cooperateDuringTeamGame(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).cooperateDuringTeamGame(...args);
}
export function resolveGameRuleDispute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveGameRuleDispute(...args);
}
export function adjustPlayDifficulty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustPlayDifficulty(...args);
}
export function detectPlayFatigue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectPlayFatigue(...args);
}
export function endPlaySession(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).endPlaySession(...args);
}
export function sharePlayExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).sharePlayExperience(...args);
}
export function chooseNextLeisureActivity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).chooseNextLeisureActivity(...args);
}
export function detectEnvironmentalHazard(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectEnvironmentalHazard(...args);
}
export function classifyEnvironmentalHazard(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).classifyEnvironmentalHazard(...args);
}
export function estimateEscapeRoute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateEscapeRoute(...args);
}
export function selectSafeDestination(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectSafeDestination(...args);
}
export function avoidFireAndSmoke(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidFireAndSmoke(...args);
}
export function avoidFallingObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidFallingObject(...args);
}
export function avoidUnstableStructure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidUnstableStructure(...args);
}
export function seekEmergencyShelter(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekEmergencyShelter(...args);
}
export function signalForHelp(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalForHelp(...args);
}
export function assistInEmergency(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).assistInEmergency(...args);
}
export function followEvacuationInstruction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followEvacuationInstruction(...args);
}
export function navigateLowVisibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).navigateLowVisibility(...args);
}
export function conservePhysicalEnergy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).conservePhysicalEnergy(...args);
}
export function prioritizeImmediateSurvivalNeed(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prioritizeImmediateSurvivalNeed(...args);
}
export function shareEmergencyResource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareEmergencyResource(...args);
}
export function coordinateEmergencyResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateEmergencyResponse(...args);
}
export function monitorEnvironmentalChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).monitorEnvironmentalChange(...args);
}
export function adaptSurvivalStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptSurvivalStrategy(...args);
}
export function recoverAfterDanger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverAfterDanger(...args);
}
export function reassessSafetyCondition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reassessSafetyCondition(...args);
}
export function inferIntentFromGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferIntentFromGesture(...args);
}
export function inferEmotionFromVoice(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferEmotionFromVoice(...args);
}
export function inferConfidenceFromPosture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inferConfidenceFromPosture(...args);
}
export function detectConversationalDiscomfort(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectConversationalDiscomfort(...args);
}
export function detectConversationalInterest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectConversationalInterest(...args);
}
export function detectConversationalBoredom(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectConversationalBoredom(...args);
}
export function synchronizeConversationRhythm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeConversationRhythm(...args);
}
export function adjustInterpersonalDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustInterpersonalDistance(...args);
}
export function useAffiliativeGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).useAffiliativeGesture(...args);
}
export function useDeescalationGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).useDeescalationGesture(...args);
}
export function signalDisagreementNonverbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalDisagreementNonverbally(...args);
}
export function signalAgreementNonverbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalAgreementNonverbally(...args);
}
export function signalConfusionNonverbally(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalConfusionNonverbally(...args);
}
export function signalRequestToSpeak(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalRequestToSpeak(...args);
}
export function signalConversationClosure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).signalConversationClosure(...args);
}
export function interpretPersonalSpaceViolation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretPersonalSpaceViolation(...args);
}
export function respondToUnwantedAttention(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToUnwantedAttention(...args);
}
export function matchCommunicationStyle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).matchCommunicationStyle(...args);
}
export function detectMixedSocialSignals(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectMixedSocialSignals(...args);
}
export function resolveNonverbalMisinterpretation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveNonverbalMisinterpretation(...args);
}
export function identifyCulturalContext(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyCulturalContext(...args);
}
export function learnCulturalGreeting(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnCulturalGreeting(...args);
}
export function performSocialGreeting(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performSocialGreeting(...args);
}
export function performFarewellRitual(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performFarewellRitual(...args);
}
export function adaptPolitenessLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptPolitenessLevel(...args);
}
export function adaptHonorificUsage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptHonorificUsage(...args);
}
export function recognizeCulturalTaboo(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeCulturalTaboo(...args);
}
export function avoidCulturalOffense(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidCulturalOffense(...args);
}
export function learnLocalCustom(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnLocalCustom(...args);
}
export function participateInCulturalRitual(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).participateInCulturalRitual(...args);
}
export function adaptGestureToCulture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptGestureToCulture(...args);
}
export function interpretCultureSpecificHumor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretCultureSpecificHumor(...args);
}
export function resolveCrossCulturalMisunderstanding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveCrossCulturalMisunderstanding(...args);
}
export function learnSecondLanguagePattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnSecondLanguagePattern(...args);
}
export function switchLanguageContextually(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).switchLanguageContextually(...args);
}
export function adaptAccentAndPronunciation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptAccentAndPronunciation(...args);
}
export function interpretIdiomaticExpression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpretIdiomaticExpression(...args);
}
export function adaptConversationToCulture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptConversationToCulture(...args);
}
export function preserveCulturalIdentity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).preserveCulturalIdentity(...args);
}
export function updateCulturalKnowledge(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateCulturalKnowledge(...args);
}
export function initAnimalAgent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initAnimalAgent(...args);
}
export function updateAnimalState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAnimalState(...args);
}
export function updateAnimalBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAnimalBehavior(...args);
}
export function estimateAnimalArousal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateAnimalArousal(...args);
}
export function estimateAnimalValence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateAnimalValence(...args);
}
export function detectAnimalStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalStress(...args);
}
export function detectAnimalFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalFear(...args);
}
export function detectAnimalCuriosity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalCuriosity(...args);
}
export function detectAnimalPlayfulness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalPlayfulness(...args);
}
export function detectAnimalFrustration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalFrustration(...args);
}
export function detectAnimalComfort(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalComfort(...args);
}
export function detectAnimalDiscomfort(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalDiscomfort(...args);
}
export function regulateAnimalArousal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateAnimalArousal(...args);
}
export function recoverAnimalStress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverAnimalStress(...args);
}
export function learnAnimalPreference(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnAnimalPreference(...args);
}
export function rememberAnimalExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberAnimalExperience(...args);
}
export function predictAnimalReaction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).predictAnimalReaction(...args);
}
export function adaptAnimalBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptAnimalBehavior(...args);
}
export function selectAnimalAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectAnimalAction(...args);
}
export function evaluateAnimalOutcome(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateAnimalOutcome(...args);
}
export function detectAnimalHunger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalHunger(...args);
}
export function detectAnimalThirst(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalThirst(...args);
}
export function detectAnimalFatigue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalFatigue(...args);
}
export function detectAnimalPain(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalPain(...args);
}
export function detectAnimalIllness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAnimalIllness(...args);
}
export function searchAnimalFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchAnimalFood(...args);
}
export function searchAnimalWater(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchAnimalWater(...args);
}
export function seekAnimalShelter(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekAnimalShelter(...args);
}
export function seekAnimalRestingPlace(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekAnimalRestingPlace(...args);
}
export function regulateAnimalBodyTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateAnimalBodyTemperature(...args);
}
export function conserveAnimalEnergy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).conserveAnimalEnergy(...args);
}
export function avoidAnimalPredator(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidAnimalPredator(...args);
}
export function escapeAnimalThreat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).escapeAnimalThreat(...args);
}
export function freezeAnimalResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).freezeAnimalResponse(...args);
}
export function defendAnimalTerritory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendAnimalTerritory(...args);
}
export function protectAnimalResource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).protectAnimalResource(...args);
}
export function exploreAnimalEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exploreAnimalEnvironment(...args);
}
export function returnToAnimalShelter(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToAnimalShelter(...args);
}
export function adaptAnimalActivityCycle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptAnimalActivityCycle(...args);
}
export function maintainAnimalHomeostasis(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainAnimalHomeostasis(...args);
}
export function initDogBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initDogBehavior(...args);
}
export function detectDogExcitement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectDogExcitement(...args);
}
export function detectDogFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectDogFear(...args);
}
export function detectDogRelaxation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectDogRelaxation(...args);
}
export function detectDogFrustration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectDogFrustration(...args);
}
export function recognizeDogOwner(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeDogOwner(...args);
}
export function approachFamiliarHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachFamiliarHuman(...args);
}
export function greetFamiliarHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).greetFamiliarHuman(...args);
}
export function followHumanMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followHumanMovement(...args);
}
export function respondToDogName(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToDogName(...args);
}
export function respondToTrainingCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToTrainingCue(...args);
}
export function learnDogCommand(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnDogCommand(...args);
}
export function reinforceDogBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reinforceDogBehavior(...args);
}
export function initiateDogPlay(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateDogPlay(...args);
}
export function inviteDogPlay(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inviteDogPlay(...args);
}
export function performDogTailMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performDogTailMovement(...args);
}
export function performDogEarMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performDogEarMovement(...args);
}
export function vocalizeDogBark(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).vocalizeDogBark(...args);
}
export function sniffEnvironmentalObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).sniffEnvironmentalObject(...args);
}
export function seekHumanReassurance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekHumanReassurance(...args);
}
export function initCatBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initCatBehavior(...args);
}
export function detectCatCuriosity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCatCuriosity(...args);
}
export function detectCatFear(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCatFear(...args);
}
export function detectCatIrritation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCatIrritation(...args);
}
export function detectCatRelaxation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCatRelaxation(...args);
}
export function recognizeFamiliarCatHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFamiliarCatHuman(...args);
}
export function approachCatFamiliarHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachCatFamiliarHuman(...args);
}
export function avoidCatUnfamiliarHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidCatUnfamiliarHuman(...args);
}
export function performCatTailSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performCatTailSignal(...args);
}
export function performCatEarSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performCatEarSignal(...args);
}
export function performCatPurring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performCatPurring(...args);
}
export function performCatMeowing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performCatMeowing(...args);
}
export function rubAgainstFamiliarObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rubAgainstFamiliarObject(...args);
}
export function markCatTerritory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).markCatTerritory(...args);
}
export function scratchCatSurface(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).scratchCatSurface(...args);
}
export function stalkCatPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).stalkCatPrey(...args);
}
export function pounceOnCatTarget(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pounceOnCatTarget(...args);
}
export function hideCatInShelter(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).hideCatInShelter(...args);
}
export function groomCatFur(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).groomCatFur(...args);
}
export function selectCatRestingSpot(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectCatRestingSpot(...args);
}
export function initBirdBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initBirdBehavior(...args);
}
export function detectBirdThreat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectBirdThreat(...args);
}
export function detectBirdFoodSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectBirdFoodSource(...args);
}
export function searchBirdFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchBirdFood(...args);
}
export function forageBirdGround(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).forageBirdGround(...args);
}
export function perchOnBranch(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).perchOnBranch(...args);
}
export function takeOffFromPerch(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).takeOffFromPerch(...args);
}
export function landOnPerch(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).landOnPerch(...args);
}
export function adjustBirdFlightPath(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustBirdFlightPath(...args);
}
export function coordinateBirdFlock(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateBirdFlock(...args);
}
export function maintainBirdFlockDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainBirdFlockDistance(...args);
}
export function respondToBirdCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToBirdCall(...args);
}
export function produceBirdSong(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).produceBirdSong(...args);
}
export function performBirdCourtship(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performBirdCourtship(...args);
}
export function defendBirdNest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendBirdNest(...args);
}
export function collectNestingMaterial(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).collectNestingMaterial(...args);
}
export function incubateBirdEggs(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).incubateBirdEggs(...args);
}
export function feedBirdChick(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feedBirdChick(...args);
}
export function migrateWithBirdFlock(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).migrateWithBirdFlock(...args);
}
export function returnToBirdRoost(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToBirdRoost(...args);
}
export function detectPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectPrey(...args);
}
export function identifyPreySpecies(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyPreySpecies(...args);
}
export function estimatePreyDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimatePreyDistance(...args);
}
export function estimatePreySpeed(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimatePreySpeed(...args);
}
export function predictPreyTrajectory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).predictPreyTrajectory(...args);
}
export function selectHuntingStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectHuntingStrategy(...args);
}
export function stalkPreyQuietly(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).stalkPreyQuietly(...args);
}
export function approachPreyUnderCover(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachPreyUnderCover(...args);
}
export function waitForHuntingOpportunity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).waitForHuntingOpportunity(...args);
}
export function initiatePredatoryChase(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiatePredatoryChase(...args);
}
export function adjustChaseSpeed(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustChaseSpeed(...args);
}
export function interceptMovingPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interceptMovingPrey(...args);
}
export function abortUnsuccessfulHunt(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).abortUnsuccessfulHunt(...args);
}
export function capturePrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).capturePrey(...args);
}
export function secureCapturedPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).secureCapturedPrey(...args);
}
export function consumeCapturedPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).consumeCapturedPrey(...args);
}
export function sharePreyWithGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).sharePreyWithGroup(...args);
}
export function defendFoodFromScavenger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendFoodFromScavenger(...args);
}
export function learnHuntingLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnHuntingLocation(...args);
}
export function improveHuntingTechnique(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).improveHuntingTechnique(...args);
}
export function initHerbivoreBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initHerbivoreBehavior(...args);
}
export function detectEdibleVegetation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectEdibleVegetation(...args);
}
export function identifyPlantSpecies(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyPlantSpecies(...args);
}
export function evaluatePlantPalatability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluatePlantPalatability(...args);
}
export function avoidToxicPlant(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidToxicPlant(...args);
}
export function selectGrazingArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectGrazingArea(...args);
}
export function beginGrazing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).beginGrazing(...args);
}
export function adjustGrazingRate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustGrazingRate(...args);
}
export function browseShrubLeaves(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).browseShrubLeaves(...args);
}
export function searchSeasonalForage(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).searchSeasonalForage(...args);
}
export function moveBetweenFeedingPatches(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).moveBetweenFeedingPatches(...args);
}
export function monitorPredatorWhileFeeding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).monitorPredatorWhileFeeding(...args);
}
export function interruptGrazingForSafety(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interruptGrazingForSafety(...args);
}
export function returnToGrazingArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToGrazingArea(...args);
}
export function competeForGrazingSpace(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).competeForGrazingSpace(...args);
}
export function shareForagingArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareForagingArea(...args);
}
export function learnSeasonalFoodLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnSeasonalFoodLocation(...args);
}
export function adaptDietToSeason(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptDietToSeason(...args);
}
export function regurgitateForRuminantDigestion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regurgitateForRuminantDigestion(...args);
}
export function selectMineralLick(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectMineralLick(...args);
}
export function initAnimalGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initAnimalGroup(...args);
}
export function recognizeGroupMember(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeGroupMember(...args);
}
export function maintainGroupCohesion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainGroupCohesion(...args);
}
export function followGroupLeader(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followGroupLeader(...args);
}
export function establishDominanceRelationship(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).establishDominanceRelationship(...args);
}
export function displayDominanceSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).displayDominanceSignal(...args);
}
export function displaySubmissionSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).displaySubmissionSignal(...args);
}
export function challengeGroupRank(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).challengeGroupRank(...args);
}
export function resolveDominanceConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveDominanceConflict(...args);
}
export function protectGroupMember(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).protectGroupMember(...args);
}
export function warnGroupOfPredator(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).warnGroupOfPredator(...args);
}
export function followGroupAlarmSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followGroupAlarmSignal(...args);
}
export function coordinateGroupForaging(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateGroupForaging(...args);
}
export function coordinateGroupMigration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateGroupMigration(...args);
}
export function maintainGroupSpacing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainGroupSpacing(...args);
}
export function rejoinSeparatedGroup(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rejoinSeparatedGroup(...args);
}
export function recognizeGroupFamiliarity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeGroupFamiliarity(...args);
}
export function mediateGroupAggression(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).mediateGroupAggression(...args);
}
export function careForGroupOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).careForGroupOffspring(...args);
}
export function adaptGroupMembership(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptGroupMembership(...args);
}
export function initAnimalVocalization(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initAnimalVocalization(...args);
}
export function generateAlarmCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateAlarmCall(...args);
}
export function generateContactCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateContactCall(...args);
}
export function generateCourtshipCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateCourtshipCall(...args);
}
export function generateTerritorialCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateTerritorialCall(...args);
}
export function generateDistressCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateDistressCall(...args);
}
export function generateFoodSolicitationCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateFoodSolicitationCall(...args);
}
export function recognizeConspecificCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeConspecificCall(...args);
}
export function localizeSoundSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).localizeSoundSource(...args);
}
export function estimateCallerDistance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateCallerDistance(...args);
}
export function identifyCallerIndividual(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyCallerIndividual(...args);
}
export function respondToAlarmCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToAlarmCall(...args);
}
export function respondToCourtshipCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToCourtshipCall(...args);
}
export function imitateAnimalVocalization(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).imitateAnimalVocalization(...args);
}
export function learnVocalizationPattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnVocalizationPattern(...args);
}
export function adjustVocalizationVolume(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustVocalizationVolume(...args);
}
export function adjustVocalizationRate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustVocalizationRate(...args);
}
export function synchronizeGroupCalling(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeGroupCalling(...args);
}
export function suppressVocalizationWhenHiding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).suppressVocalizationWhenHiding(...args);
}
export function adaptCallToEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptCallToEnvironment(...args);
}
export function detectEnvironmentalOdor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectEnvironmentalOdor(...args);
}
export function classifyOdorSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).classifyOdorSource(...args);
}
export function trackScentTrail(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).trackScentTrail(...args);
}
export function estimateScentDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateScentDirection(...args);
}
export function estimateScentFreshness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateScentFreshness(...args);
}
export function recognizeIndividualScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeIndividualScent(...args);
}
export function recognizeKinScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeKinScent(...args);
}
export function recognizePredatorScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePredatorScent(...args);
}
export function recognizeFoodScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFoodScent(...args);
}
export function recognizeMatingSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeMatingSignal(...args);
}
export function performScentMarking(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performScentMarking(...args);
}
export function refreshTerritorialScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).refreshTerritorialScent(...args);
}
export function investigateScentMark(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).investigateScentMark(...args);
}
export function avoidUnknownScent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidUnknownScent(...args);
}
export function followChemicalTrail(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followChemicalTrail(...args);
}
export function compareMultipleOdors(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).compareMultipleOdors(...args);
}
export function learnFamiliarOdor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFamiliarOdor(...args);
}
export function respondToAlarmPheromone(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToAlarmPheromone(...args);
}
export function respondToSocialPheromone(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSocialPheromone(...args);
}
export function updateOlfactoryMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateOlfactoryMemory(...args);
}
export function updateAnimalVisualField(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAnimalVisualField(...args);
}
export function detectMovingObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectMovingObject(...args);
}
export function trackMovingTarget(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).trackMovingTarget(...args);
}
export function detectCamouflagedObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectCamouflagedObject(...args);
}
export function estimateVisualDepth(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateVisualDepth(...args);
}
export function adaptVisionToLowLight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptVisionToLowLight(...args);
}
export function detectUltrasonicSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectUltrasonicSignal(...args);
}
export function detectLowFrequencySound(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectLowFrequencySound(...args);
}
export function orientUsingSound(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientUsingSound(...args);
}
export function orientUsingSunPosition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientUsingSunPosition(...args);
}
export function orientUsingStarPattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientUsingStarPattern(...args);
}
export function orientUsingMagneticField(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientUsingMagneticField(...args);
}
export function orientUsingLandmark(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).orientUsingLandmark(...args);
}
export function estimateTravelDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateTravelDirection(...args);
}
export function rememberMigrationRoute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberMigrationRoute(...args);
}
export function avoidVisualObstacle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidVisualObstacle(...args);
}
export function detectWaterSurface(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectWaterSurface(...args);
}
export function detectShelterOpening(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectShelterOpening(...args);
}
export function updateSpatialMemory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateSpatialMemory(...args);
}
export function reorientAfterDisplacement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reorientAfterDisplacement(...args);
}
export function detectReproductiveReadiness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectReproductiveReadiness(...args);
}
export function detectPotentialMate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectPotentialMate(...args);
}
export function evaluateMateCompatibility(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateMateCompatibility(...args);
}
export function performCourtshipDisplay(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performCourtshipDisplay(...args);
}
export function respondToCourtshipDisplay(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToCourtshipDisplay(...args);
}
export function competeForMate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).competeForMate(...args);
}
export function selectMate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectMate(...args);
}
export function formBreedingPair(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).formBreedingPair(...args);
}
export function defendBreedingTerritory(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendBreedingTerritory(...args);
}
export function selectNestingSite(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectNestingSite(...args);
}
export function constructNest(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).constructNest(...args);
}
export function prepareBirthSite(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prepareBirthSite(...args);
}
export function recognizeOwnOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeOwnOffspring(...args);
}
export function bondWithOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).bondWithOffspring(...args);
}
export function feedOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).feedOffspring(...args);
}
export function groomOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).groomOffspring(...args);
}
export function protectOffspringFromThreat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).protectOffspringFromThreat(...args);
}
export function retrieveSeparatedOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveSeparatedOffspring(...args);
}
export function teachOffspringSurvivalSkill(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).teachOffspringSurvivalSkill(...args);
}
export function weanOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).weanOffspring(...args);
}
export function initInsectAgent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initInsectAgent(...args);
}
export function detectInsectFoodSource(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectInsectFoodSource(...args);
}
export function followPheromoneTrail(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followPheromoneTrail(...args);
}
export function depositPheromoneTrail(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).depositPheromoneTrail(...args);
}
export function reinforcePheromonePath(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reinforcePheromonePath(...args);
}
export function selectAntForagingRoute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectAntForagingRoute(...args);
}
export function returnToColony(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToColony(...args);
}
export function exchangeFoodWithColony(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exchangeFoodWithColony(...args);
}
export function performNestMaintenance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performNestMaintenance(...args);
}
export function defendInsectColony(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendInsectColony(...args);
}
export function coordinateWorkerTask(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateWorkerTask(...args);
}
export function respondToColonyAlarm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToColonyAlarm(...args);
}
export function identifyColonyMember(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).identifyColonyMember(...args);
}
export function removeNestWaste(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).removeNestWaste(...args);
}
export function regulateNestTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateNestTemperature(...args);
}
export function selectNewNestSite(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectNewNestSite(...args);
}
export function initiateSwarmMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateSwarmMovement(...args);
}
export function followSwarmDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followSwarmDirection(...args);
}
export function maintainSwarmDensity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainSwarmDensity(...args);
}
export function adaptCollectiveForaging(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptCollectiveForaging(...args);
}
export function initAquaticAnimalBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initAquaticAnimalBehavior(...args);
}
export function detectWaterCurrent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectWaterCurrent(...args);
}
export function adjustSwimmingDirection(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSwimmingDirection(...args);
}
export function adjustSwimmingSpeed(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adjustSwimmingSpeed(...args);
}
export function maintainBuoyancy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainBuoyancy(...args);
}
export function controlDivingDepth(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).controlDivingDepth(...args);
}
export function surfaceForAir(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).surfaceForAir(...args);
}
export function avoidAquaticPredator(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidAquaticPredator(...args);
}
export function detectAquaticPrey(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectAquaticPrey(...args);
}
export function schoolWithOtherFish(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).schoolWithOtherFish(...args);
}
export function maintainSchoolSpacing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainSchoolSpacing(...args);
}
export function respondToWaterPressure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToWaterPressure(...args);
}
export function respondToWaterTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToWaterTemperature(...args);
}
export function detectWaterPollutionCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectWaterPollutionCue(...args);
}
export function seekAquaticShelter(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekAquaticShelter(...args);
}
export function selectAquaticFeedingGround(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectAquaticFeedingGround(...args);
}
export function navigateCoralReef(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).navigateCoralReef(...args);
}
export function migrateAlongWaterway(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).migrateAlongWaterway(...args);
}
export function returnToSpawningGround(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToSpawningGround(...args);
}
export function adaptToAquaticOxygenLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToAquaticOxygenLevel(...args);
}
export function initReptileBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initReptileBehavior(...args);
}
export function initAmphibianBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initAmphibianBehavior(...args);
}
export function baskInSunlight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).baskInSunlight(...args);
}
export function seekThermalGradient(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekThermalGradient(...args);
}
export function moveBetweenWarmAndCoolArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).moveBetweenWarmAndCoolArea(...args);
}
export function detectGroundVibration(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectGroundVibration(...args);
}
export function detectNearbyMovement(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectNearbyMovement(...args);
}
export function performReptileAmbush(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performReptileAmbush(...args);
}
export function performTongueFlicking(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performTongueFlicking(...args);
}
export function hideUnderCover(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).hideUnderCover(...args);
}
export function burrowIntoSubstrate(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).burrowIntoSubstrate(...args);
}
export function avoidDryingEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidDryingEnvironment(...args);
}
export function seekMoistMicrohabitat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekMoistMicrohabitat(...args);
}
export function respondToSeasonalDormancy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSeasonalDormancy(...args);
}
export function selectEggLayingSite(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectEggLayingSite(...args);
}
export function buryReptileEggs(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).buryReptileEggs(...args);
}
export function migrateToBreedingPond(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).migrateToBreedingPond(...args);
}
export function respondToAmphibianCall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToAmphibianCall(...args);
}
export function avoidExtremeTemperature(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidExtremeTemperature(...args);
}
export function adaptToHabitatMoisture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToHabitatMoisture(...args);
}
export function initRodentBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initRodentBehavior(...args);
}
export function exploreNovelObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exploreNovelObject(...args);
}
export function performRiskAssessmentPause(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performRiskAssessmentPause(...args);
}
export function sniffNovelObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).sniffNovelObject(...args);
}
export function approachNovelObjectCautiously(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachNovelObjectCautiously(...args);
}
export function retreatFromNovelObject(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retreatFromNovelObject(...args);
}
export function gnawHardMaterial(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).gnawHardMaterial(...args);
}
export function constructBurrow(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).constructBurrow(...args);
}
export function navigateBurrowNetwork(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).navigateBurrowNetwork(...args);
}
export function storeFoodInCache(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).storeFoodInCache(...args);
}
export function retrieveCachedFood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retrieveCachedFood(...args);
}
export function detectRodentAlarmSignal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectRodentAlarmSignal(...args);
}
export function hideInBurrow(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).hideInBurrow(...args);
}
export function learnMazeRoute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnMazeRoute(...args);
}
export function rememberSafeLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberSafeLocation(...args);
}
export function avoidPreviouslyDangerousArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidPreviouslyDangerousArea(...args);
}
export function socialGroomingRodent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).socialGroomingRodent(...args);
}
export function playWithConspecific(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).playWithConspecific(...args);
}
export function adaptExplorationToHunger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptExplorationToHunger(...args);
}
export function initUngulateBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initUngulateBehavior(...args);
}
export function detectHerdLeader(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectHerdLeader(...args);
}
export function followHerdLeader(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).followHerdLeader(...args);
}
export function scanHorizonForPredator(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).scanHorizonForPredator(...args);
}
export function raiseHeadDuringGrazing(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).raiseHeadDuringGrazing(...args);
}
export function triggerHerdAlarm(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).triggerHerdAlarm(...args);
}
export function initiateHerdFlight(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initiateHerdFlight(...args);
}
export function synchronizeHerdRunning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeHerdRunning(...args);
}
export function avoidHerdCollision(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidHerdCollision(...args);
}
export function maintainHerdFormation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainHerdFormation(...args);
}
export function selectWateringLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectWateringLocation(...args);
}
export function approachWateringLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachWateringLocation(...args);
}
export function waitForHerdAccess(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).waitForHerdAccess(...args);
}
export function defendCalf(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).defendCalf(...args);
}
export function recognizeHerdOffspring(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeHerdOffspring(...args);
}
export function reuniteWithHerd(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reuniteWithHerd(...args);
}
export function respondToSeasonalMigrationCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSeasonalMigrationCue(...args);
}
export function crossOpenTerrainCautiously(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).crossOpenTerrainCautiously(...args);
}
export function selectRestingHerdLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectRestingHerdLocation(...args);
}
export function adaptHerdRouteToPredationRisk(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptHerdRouteToPredationRisk(...args);
}
export function initPrimateBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initPrimateBehavior(...args);
}
export function recognizePrimateIndividual(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizePrimateIndividual(...args);
}
export function rememberSocialRelationship(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberSocialRelationship(...args);
}
export function performSocialGrooming(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performSocialGrooming(...args);
}
export function solicitSocialGrooming(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).solicitSocialGrooming(...args);
}
export function formPrimateAlliance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).formPrimateAlliance(...args);
}
export function maintainPrimateAlliance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainPrimateAlliance(...args);
}
export function detectSocialRankChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectSocialRankChange(...args);
}
export function respondToDominanceDisplay(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToDominanceDisplay(...args);
}
export function shareForagingKnowledge(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shareForagingKnowledge(...args);
}
export function learnToolUseByObservation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnToolUseByObservation(...args);
}
export function manipulateSimpleTool(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).manipulateSimpleTool(...args);
}
export function solvePrimateForagingPuzzle(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).solvePrimateForagingPuzzle(...args);
}
export function imitateConspecificAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).imitateConspecificAction(...args);
}
export function recognizeSocialDeceptionCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeSocialDeceptionCue(...args);
}
export function respondToInfantDistress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToInfantDistress(...args);
}
export function mediatePrimateConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).mediatePrimateConflict(...args);
}
export function reconcileAfterConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reconcileAfterConflict(...args);
}
export function learnGroupTradition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnGroupTradition(...args);
}
export function adaptSocialStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptSocialStrategy(...args);
}
export function initPollinatorBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initPollinatorBehavior(...args);
}
export function detectFlowerColor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectFlowerColor(...args);
}
export function detectFloralOdor(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectFloralOdor(...args);
}
export function estimateNectarAvailability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateNectarAvailability(...args);
}
export function estimatePollenAvailability(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimatePollenAvailability(...args);
}
export function selectFlowerTarget(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectFlowerTarget(...args);
}
export function approachFlower(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachFlower(...args);
}
export function landOnFlower(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).landOnFlower(...args);
}
export function collectNectar(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).collectNectar(...args);
}
export function collectPollen(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).collectPollen(...args);
}
export function transferPollenBetweenFlowers(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transferPollenBetweenFlowers(...args);
}
export function avoidPreviouslyDepletedFlower(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidPreviouslyDepletedFlower(...args);
}
export function learnFlowerRewardPattern(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnFlowerRewardPattern(...args);
}
export function rememberFlowerLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).rememberFlowerLocation(...args);
}
export function communicateFlowerLocation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).communicateFlowerLocation(...args);
}
export function returnToHiveWithNectar(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).returnToHiveWithNectar(...args);
}
export function performWaggleDance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).performWaggleDance(...args);
}
export function adaptForagingToWeather(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptForagingToWeather(...args);
}
export function avoidPollinatorCompetition(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidPollinatorCompetition(...args);
}
export function optimizePollinationRoute(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).optimizePollinationRoute(...args);
}
export function modelMixedEmotionalState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).modelMixedEmotionalState(...args);
}
export function modelAmbivalentEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).modelAmbivalentEmotion(...args);
}
export function modelEmotionalCarryover(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).modelEmotionalCarryover(...args);
}
export function modelMoodBaseline(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).modelMoodBaseline(...args);
}
export function updateMoodFromExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateMoodFromExperience(...args);
}
export function updateMoodFromSleepQuality(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateMoodFromSleepQuality(...args);
}
export function updateMoodFromSocialInteraction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateMoodFromSocialInteraction(...args);
}
export function updateMoodFromEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateMoodFromEnvironment(...args);
}
export function detectEmotionalOverload(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectEmotionalOverload(...args);
}
export function regulateEmotionalImpulse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).regulateEmotionalImpulse(...args);
}
export function delayEmotionalReaction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).delayEmotionalReaction(...args);
}
export function reappraiseEmotionalMeaning(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reappraiseEmotionalMeaning(...args);
}
export function acceptUnpleasantEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).acceptUnpleasantEmotion(...args);
}
export function shiftAttentionFromDistress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).shiftAttentionFromDistress(...args);
}
export function recoverEmotionalEquilibrium(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverEmotionalEquilibrium(...args);
}
export function simulateEmotionalContagion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateEmotionalContagion(...args);
}
export function simulateCollectiveMood(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateCollectiveMood(...args);
}
export function distinguishMoodFromEmotion(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).distinguishMoodFromEmotion(...args);
}
export function estimateEmotionConfidence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateEmotionConfidence(...args);
}
export function updateEmotionalModelFromFeedback(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateEmotionalModelFromFeedback(...args);
}
export function detectImpulsiveUrge(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectImpulsiveUrge(...args);
}
export function estimateImpulseStrength(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateImpulseStrength(...args);
}
export function pauseBeforeAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).pauseBeforeAction(...args);
}
export function evaluateImmediateConsequence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateImmediateConsequence(...args);
}
export function evaluateLongTermConsequence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateLongTermConsequence(...args);
}
export function inhibitDominantResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).inhibitDominantResponse(...args);
}
export function selectAlternativeResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectAlternativeResponse(...args);
}
export function maintainBehavioralGoal(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainBehavioralGoal(...args);
}
export function resistDistractingStimulus(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resistDistractingStimulus(...args);
}
export function switchCognitiveStrategy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).switchCognitiveStrategy(...args);
}
export function monitorActionProgress(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).monitorActionProgress(...args);
}
export function detectSelfControlFailure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectSelfControlFailure(...args);
}
export function recoverSelfControl(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverSelfControl(...args);
}
export function learnImpulseTrigger(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnImpulseTrigger(...args);
}
export function modifyImpulseTriggerResponse(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).modifyImpulseTriggerResponse(...args);
}
export function prioritizeLongTermReward(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).prioritizeLongTermReward(...args);
}
export function adaptSelfControlToFatigue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptSelfControlToFatigue(...args);
}
export function maintainActionConsistency(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainActionConsistency(...args);
}
export function evaluateSelfRegulationOutcome(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluateSelfRegulationOutcome(...args);
}
export function updateSelfRegulationPolicy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateSelfRegulationPolicy(...args);
}
export function updateBehaviorFromWeather(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBehaviorFromWeather(...args);
}
export function respondToRainfall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToRainfall(...args);
}
export function respondToSnowfall(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSnowfall(...args);
}
export function respondToStrongWind(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToStrongWind(...args);
}
export function respondToExtremeHeat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToExtremeHeat(...args);
}
export function respondToColdExposure(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToColdExposure(...args);
}
export function seekShadeDuringHeat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekShadeDuringHeat(...args);
}
export function seekWarmthDuringCold(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekWarmthDuringCold(...args);
}
export function respondToSeasonalChange(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToSeasonalChange(...args);
}
export function adaptBehaviorToNoiseLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptBehaviorToNoiseLevel(...args);
}
export function adaptBehaviorToCrowding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptBehaviorToCrowding(...args);
}
export function respondToUnfamiliarEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToUnfamiliarEnvironment(...args);
}
export function learnEnvironmentalSafetyCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnEnvironmentalSafetyCue(...args);
}
export function learnEnvironmentalDangerCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnEnvironmentalDangerCue(...args);
}
export function selectMicrohabitat(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectMicrohabitat(...args);
}
export function avoidPollutedArea(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidPollutedArea(...args);
}
export function adaptToResourceScarcity(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToResourceScarcity(...args);
}
export function adaptToHabitatDisturbance(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToHabitatDisturbance(...args);
}
export function updateBehavioralEcologyState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBehavioralEcologyState(...args);
}
export function detectHumanPresence(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectHumanPresence(...args);
}
export function recognizeFamiliarCaregiver(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recognizeFamiliarCaregiver(...args);
}
export function estimateHumanApproachIntent(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateHumanApproachIntent(...args);
}
export function estimateHumanThreatLevel(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).estimateHumanThreatLevel(...args);
}
export function approachHumanCautiously(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).approachHumanCautiously(...args);
}
export function retreatFromHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).retreatFromHuman(...args);
}
export function respondToHumanVoice(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToHumanVoice(...args);
}
export function respondToHumanGesture(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToHumanGesture(...args);
}
export function learnHumanRoutine(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnHumanRoutine(...args);
}
export function anticipateHumanFeeding(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).anticipateHumanFeeding(...args);
}
export function requestFoodFromHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).requestFoodFromHuman(...args);
}
export function seekContactWithHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).seekContactWithHuman(...args);
}
export function avoidUnwantedHumanContact(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).avoidUnwantedHumanContact(...args);
}
export function acceptFamiliarHandling(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).acceptFamiliarHandling(...args);
}
export function respondToHumanTrainingCue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).respondToHumanTrainingCue(...args);
}
export function learnHumanRewardAssociation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).learnHumanRewardAssociation(...args);
}
export function communicateNeedToHuman(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).communicateNeedToHuman(...args);
}
export function recoverTrustAfterNegativeInteraction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).recoverTrustAfterNegativeInteraction(...args);
}
export function adaptToHumanLivingEnvironment(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).adaptToHumanLivingEnvironment(...args);
}
export function maintainHumanAnimalBond(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).maintainHumanAnimalBond(...args);
}
export function initializeBehaviorPolicy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initializeBehaviorPolicy(...args);
}
export function observeEnvironmentState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).observeEnvironmentState(...args);
}
export function encodeBehaviorObservation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).encodeBehaviorObservation(...args);
}
export function generateCandidateActions(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generateCandidateActions(...args);
}
export function scoreCandidateAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).scoreCandidateAction(...args);
}
export function selectPolicyAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).selectPolicyAction(...args);
}
export function calculateBehaviorReward(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).calculateBehaviorReward(...args);
}
export function calculateBehaviorPenalty(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).calculateBehaviorPenalty(...args);
}
export function updateActionValue(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateActionValue(...args);
}
export function updateBehaviorPolicy(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBehaviorPolicy(...args);
}
export function exploreAlternativeBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exploreAlternativeBehavior(...args);
}
export function exploitLearnedBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).exploitLearnedBehavior(...args);
}
export function storeBehaviorEpisode(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).storeBehaviorEpisode(...args);
}
export function replayBehaviorExperience(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).replayBehaviorExperience(...args);
}
export function generalizeBehaviorAcrossContexts(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).generalizeBehaviorAcrossContexts(...args);
}
export function transferBehaviorBetweenTasks(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).transferBehaviorBetweenTasks(...args);
}
export function evaluatePolicyRobustness(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).evaluatePolicyRobustness(...args);
}
export function detectBehavioralAnomaly(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).detectBehavioralAnomaly(...args);
}
export function explainSelectedAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).explainSelectedAction(...args);
}
export function resetBehaviorLearningState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resetBehaviorLearningState(...args);
}
export function initBehaviorSimulation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).initBehaviorSimulation(...args);
}
export function updateBehaviorSimulation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateBehaviorSimulation(...args);
}
export function updateAgentDecisionLoop(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAgentDecisionLoop(...args);
}
export function synchronizeEmotionAndAction(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeEmotionAndAction(...args);
}
export function synchronizeThoughtAndSpeech(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeThoughtAndSpeech(...args);
}
export function synchronizeSpeechAndLipAnimation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeSpeechAndLipAnimation(...args);
}
export function synchronizeEmotionAndFacialAnimation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeEmotionAndFacialAnimation(...args);
}
export function synchronizeMovementAndNavigation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).synchronizeMovementAndNavigation(...args);
}
export function blendLocomotionAnimation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).blendLocomotionAnimation(...args);
}
export function blendSocialInteractionAnimation(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).blendSocialInteractionAnimation(...args);
}
export function coordinateMultiAgentBehavior(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).coordinateMultiAgentBehavior(...args);
}
export function resolveAgentActionConflict(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).resolveAgentActionConflict(...args);
}
export function updateAgentInteractionGraph(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).updateAgentInteractionGraph(...args);
}
export function simulateBehaviorAtFixedTimestep(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).simulateBehaviorAtFixedTimestep(...args);
}
export function interpolateBehaviorState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).interpolateBehaviorState(...args);
}
export function serializeAgentBehaviorState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).serializeAgentBehaviorState(...args);
}
export function restoreAgentBehaviorState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).restoreAgentBehaviorState(...args);
}
export function optimizeAgentUpdateSchedule(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).optimizeAgentUpdateSchedule(...args);
}
export function reduceDistantAgentSimulationDetail(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).reduceDistantAgentSimulationDetail(...args);
}
export function validateBehaviorSimulationState(...args: any[]): any {
  return (getActiveBehaviorSystem() as any).validateBehaviorSimulationState(...args);
}
