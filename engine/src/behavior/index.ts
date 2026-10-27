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

export function initHuman(
  ...args: Parameters<BehaviorSystem['initHuman']>
): ReturnType<BehaviorSystem['initHuman']> {
  return getActiveBehaviorSystem().initHuman(...args);
}
export function updateHumanState(
  ...args: Parameters<BehaviorSystem['updateHumanState']>
): ReturnType<BehaviorSystem['updateHumanState']> {
  return getActiveBehaviorSystem().updateHumanState(...args);
}
export function updateHumanBehavior(
  ...args: Parameters<BehaviorSystem['updateHumanBehavior']>
): ReturnType<BehaviorSystem['updateHumanBehavior']> {
  return getActiveBehaviorSystem().updateHumanBehavior(...args);
}
export function evaluateHumanSituation(
  ...args: Parameters<BehaviorSystem['evaluateHumanSituation']>
): ReturnType<BehaviorSystem['evaluateHumanSituation']> {
  return getActiveBehaviorSystem().evaluateHumanSituation(...args);
}
export function selectHumanAction(
  ...args: Parameters<BehaviorSystem['selectHumanAction']>
): ReturnType<BehaviorSystem['selectHumanAction']> {
  return getActiveBehaviorSystem().selectHumanAction(...args);
}
export function executeHumanAction(
  ...args: Parameters<BehaviorSystem['executeHumanAction']>
): ReturnType<BehaviorSystem['executeHumanAction']> {
  return getActiveBehaviorSystem().executeHumanAction(...args);
}
export function interruptHumanAction(
  ...args: Parameters<BehaviorSystem['interruptHumanAction']>
): ReturnType<BehaviorSystem['interruptHumanAction']> {
  return getActiveBehaviorSystem().interruptHumanAction(...args);
}
export function resumeHumanAction(
  ...args: Parameters<BehaviorSystem['resumeHumanAction']>
): ReturnType<BehaviorSystem['resumeHumanAction']> {
  return getActiveBehaviorSystem().resumeHumanAction(...args);
}
export function cancelHumanAction(
  ...args: Parameters<BehaviorSystem['cancelHumanAction']>
): ReturnType<BehaviorSystem['cancelHumanAction']> {
  return getActiveBehaviorSystem().cancelHumanAction(...args);
}
export function queueHumanAction(
  ...args: Parameters<BehaviorSystem['queueHumanAction']>
): ReturnType<BehaviorSystem['queueHumanAction']> {
  return getActiveBehaviorSystem().queueHumanAction(...args);
}
export function prioritizeHumanActions(
  ...args: Parameters<BehaviorSystem['prioritizeHumanActions']>
): ReturnType<BehaviorSystem['prioritizeHumanActions']> {
  return getActiveBehaviorSystem().prioritizeHumanActions(...args);
}
export function blendHumanBehaviors(
  ...args: Parameters<BehaviorSystem['blendHumanBehaviors']>
): ReturnType<BehaviorSystem['blendHumanBehaviors']> {
  return getActiveBehaviorSystem().blendHumanBehaviors(...args);
}
export function switchHumanBehavior(
  ...args: Parameters<BehaviorSystem['switchHumanBehavior']>
): ReturnType<BehaviorSystem['switchHumanBehavior']> {
  return getActiveBehaviorSystem().switchHumanBehavior(...args);
}
export function predictHumanReaction(
  ...args: Parameters<BehaviorSystem['predictHumanReaction']>
): ReturnType<BehaviorSystem['predictHumanReaction']> {
  return getActiveBehaviorSystem().predictHumanReaction(...args);
}
export function adaptHumanBehavior(
  ...args: Parameters<BehaviorSystem['adaptHumanBehavior']>
): ReturnType<BehaviorSystem['adaptHumanBehavior']> {
  return getActiveBehaviorSystem().adaptHumanBehavior(...args);
}
export function stabilizeHumanBehavior(
  ...args: Parameters<BehaviorSystem['stabilizeHumanBehavior']>
): ReturnType<BehaviorSystem['stabilizeHumanBehavior']> {
  return getActiveBehaviorSystem().stabilizeHumanBehavior(...args);
}
export function randomizeHumanBehavior(
  ...args: Parameters<BehaviorSystem['randomizeHumanBehavior']>
): ReturnType<BehaviorSystem['randomizeHumanBehavior']> {
  return getActiveBehaviorSystem().randomizeHumanBehavior(...args);
}
export function evaluateBehaviorOutcome(
  ...args: Parameters<BehaviorSystem['evaluateBehaviorOutcome']>
): ReturnType<BehaviorSystem['evaluateBehaviorOutcome']> {
  return getActiveBehaviorSystem().evaluateBehaviorOutcome(...args);
}
export function learnBehaviorPattern(
  ...args: Parameters<BehaviorSystem['learnBehaviorPattern']>
): ReturnType<BehaviorSystem['learnBehaviorPattern']> {
  return getActiveBehaviorSystem().learnBehaviorPattern(...args);
}
export function resetHumanBehavior(
  ...args: Parameters<BehaviorSystem['resetHumanBehavior']>
): ReturnType<BehaviorSystem['resetHumanBehavior']> {
  return getActiveBehaviorSystem().resetHumanBehavior(...args);
}
export function initEmotionSystem(
  ...args: Parameters<BehaviorSystem['initEmotionSystem']>
): ReturnType<BehaviorSystem['initEmotionSystem']> {
  return getActiveBehaviorSystem().initEmotionSystem(...args);
}
export function updateEmotionState(
  ...args: Parameters<BehaviorSystem['updateEmotionState']>
): ReturnType<BehaviorSystem['updateEmotionState']> {
  return getActiveBehaviorSystem().updateEmotionState(...args);
}
export function calculateEmotionalIntensity(
  ...args: Parameters<BehaviorSystem['calculateEmotionalIntensity']>
): ReturnType<BehaviorSystem['calculateEmotionalIntensity']> {
  return getActiveBehaviorSystem().calculateEmotionalIntensity(...args);
}
export function decayEmotionOverTime(
  ...args: Parameters<BehaviorSystem['decayEmotionOverTime']>
): ReturnType<BehaviorSystem['decayEmotionOverTime']> {
  return getActiveBehaviorSystem().decayEmotionOverTime(...args);
}
export function triggerEmotion(
  ...args: Parameters<BehaviorSystem['triggerEmotion']>
): ReturnType<BehaviorSystem['triggerEmotion']> {
  return getActiveBehaviorSystem().triggerEmotion(...args);
}
export function suppressEmotion(
  ...args: Parameters<BehaviorSystem['suppressEmotion']>
): ReturnType<BehaviorSystem['suppressEmotion']> {
  return getActiveBehaviorSystem().suppressEmotion(...args);
}
export function amplifyEmotion(
  ...args: Parameters<BehaviorSystem['amplifyEmotion']>
): ReturnType<BehaviorSystem['amplifyEmotion']> {
  return getActiveBehaviorSystem().amplifyEmotion(...args);
}
export function blendEmotions(
  ...args: Parameters<BehaviorSystem['blendEmotions']>
): ReturnType<BehaviorSystem['blendEmotions']> {
  return getActiveBehaviorSystem().blendEmotions(...args);
}
export function resolveEmotionConflict(
  ...args: Parameters<BehaviorSystem['resolveEmotionConflict']>
): ReturnType<BehaviorSystem['resolveEmotionConflict']> {
  return getActiveBehaviorSystem().resolveEmotionConflict(...args);
}
export function classifyEmotion(
  ...args: Parameters<BehaviorSystem['classifyEmotion']>
): ReturnType<BehaviorSystem['classifyEmotion']> {
  return getActiveBehaviorSystem().classifyEmotion(...args);
}
export function evaluateEmotionalTrigger(
  ...args: Parameters<BehaviorSystem['evaluateEmotionalTrigger']>
): ReturnType<BehaviorSystem['evaluateEmotionalTrigger']> {
  return getActiveBehaviorSystem().evaluateEmotionalTrigger(...args);
}
export function associateEmotionWithMemory(
  ...args: Parameters<BehaviorSystem['associateEmotionWithMemory']>
): ReturnType<BehaviorSystem['associateEmotionWithMemory']> {
  return getActiveBehaviorSystem().associateEmotionWithMemory(...args);
}
export function associateEmotionWithPerson(
  ...args: Parameters<BehaviorSystem['associateEmotionWithPerson']>
): ReturnType<BehaviorSystem['associateEmotionWithPerson']> {
  return getActiveBehaviorSystem().associateEmotionWithPerson(...args);
}
export function associateEmotionWithPlace(
  ...args: Parameters<BehaviorSystem['associateEmotionWithPlace']>
): ReturnType<BehaviorSystem['associateEmotionWithPlace']> {
  return getActiveBehaviorSystem().associateEmotionWithPlace(...args);
}
export function transferEmotionalState(
  ...args: Parameters<BehaviorSystem['transferEmotionalState']>
): ReturnType<BehaviorSystem['transferEmotionalState']> {
  return getActiveBehaviorSystem().transferEmotionalState(...args);
}
export function stabilizeEmotionalState(
  ...args: Parameters<BehaviorSystem['stabilizeEmotionalState']>
): ReturnType<BehaviorSystem['stabilizeEmotionalState']> {
  return getActiveBehaviorSystem().stabilizeEmotionalState(...args);
}
export function recoverFromEmotionalStress(
  ...args: Parameters<BehaviorSystem['recoverFromEmotionalStress']>
): ReturnType<BehaviorSystem['recoverFromEmotionalStress']> {
  return getActiveBehaviorSystem().recoverFromEmotionalStress(...args);
}
export function evaluateEmotionalBalance(
  ...args: Parameters<BehaviorSystem['evaluateEmotionalBalance']>
): ReturnType<BehaviorSystem['evaluateEmotionalBalance']> {
  return getActiveBehaviorSystem().evaluateEmotionalBalance(...args);
}
export function generateEmotionalVariation(
  ...args: Parameters<BehaviorSystem['generateEmotionalVariation']>
): ReturnType<BehaviorSystem['generateEmotionalVariation']> {
  return getActiveBehaviorSystem().generateEmotionalVariation(...args);
}
export function resetEmotionalState(
  ...args: Parameters<BehaviorSystem['resetEmotionalState']>
): ReturnType<BehaviorSystem['resetEmotionalState']> {
  return getActiveBehaviorSystem().resetEmotionalState(...args);
}
export function feelJoy(
  ...args: Parameters<BehaviorSystem['feelJoy']>
): ReturnType<BehaviorSystem['feelJoy']> {
  return getActiveBehaviorSystem().feelJoy(...args);
}
export function feelHappiness(
  ...args: Parameters<BehaviorSystem['feelHappiness']>
): ReturnType<BehaviorSystem['feelHappiness']> {
  return getActiveBehaviorSystem().feelHappiness(...args);
}
export function feelExcitement(
  ...args: Parameters<BehaviorSystem['feelExcitement']>
): ReturnType<BehaviorSystem['feelExcitement']> {
  return getActiveBehaviorSystem().feelExcitement(...args);
}
export function feelDelight(
  ...args: Parameters<BehaviorSystem['feelDelight']>
): ReturnType<BehaviorSystem['feelDelight']> {
  return getActiveBehaviorSystem().feelDelight(...args);
}
export function feelAmusement(
  ...args: Parameters<BehaviorSystem['feelAmusement']>
): ReturnType<BehaviorSystem['feelAmusement']> {
  return getActiveBehaviorSystem().feelAmusement(...args);
}
export function feelPride(
  ...args: Parameters<BehaviorSystem['feelPride']>
): ReturnType<BehaviorSystem['feelPride']> {
  return getActiveBehaviorSystem().feelPride(...args);
}
export function feelGratitude(
  ...args: Parameters<BehaviorSystem['feelGratitude']>
): ReturnType<BehaviorSystem['feelGratitude']> {
  return getActiveBehaviorSystem().feelGratitude(...args);
}
export function feelRelief(
  ...args: Parameters<BehaviorSystem['feelRelief']>
): ReturnType<BehaviorSystem['feelRelief']> {
  return getActiveBehaviorSystem().feelRelief(...args);
}
export function feelHope(
  ...args: Parameters<BehaviorSystem['feelHope']>
): ReturnType<BehaviorSystem['feelHope']> {
  return getActiveBehaviorSystem().feelHope(...args);
}
export function feelContentment(
  ...args: Parameters<BehaviorSystem['feelContentment']>
): ReturnType<BehaviorSystem['feelContentment']> {
  return getActiveBehaviorSystem().feelContentment(...args);
}
export function feelCuriosity(
  ...args: Parameters<BehaviorSystem['feelCuriosity']>
): ReturnType<BehaviorSystem['feelCuriosity']> {
  return getActiveBehaviorSystem().feelCuriosity(...args);
}
export function feelWonder(
  ...args: Parameters<BehaviorSystem['feelWonder']>
): ReturnType<BehaviorSystem['feelWonder']> {
  return getActiveBehaviorSystem().feelWonder(...args);
}
export function feelAffection(
  ...args: Parameters<BehaviorSystem['feelAffection']>
): ReturnType<BehaviorSystem['feelAffection']> {
  return getActiveBehaviorSystem().feelAffection(...args);
}
export function feelAdmiration(
  ...args: Parameters<BehaviorSystem['feelAdmiration']>
): ReturnType<BehaviorSystem['feelAdmiration']> {
  return getActiveBehaviorSystem().feelAdmiration(...args);
}
export function feelInspiration(
  ...args: Parameters<BehaviorSystem['feelInspiration']>
): ReturnType<BehaviorSystem['feelInspiration']> {
  return getActiveBehaviorSystem().feelInspiration(...args);
}
export function feelPlayfulness(
  ...args: Parameters<BehaviorSystem['feelPlayfulness']>
): ReturnType<BehaviorSystem['feelPlayfulness']> {
  return getActiveBehaviorSystem().feelPlayfulness(...args);
}
export function feelAnticipation(
  ...args: Parameters<BehaviorSystem['feelAnticipation']>
): ReturnType<BehaviorSystem['feelAnticipation']> {
  return getActiveBehaviorSystem().feelAnticipation(...args);
}
export function increasePositiveAffect(
  ...args: Parameters<BehaviorSystem['increasePositiveAffect']>
): ReturnType<BehaviorSystem['increasePositiveAffect']> {
  return getActiveBehaviorSystem().increasePositiveAffect(...args);
}
export function shareHappiness(
  ...args: Parameters<BehaviorSystem['shareHappiness']>
): ReturnType<BehaviorSystem['shareHappiness']> {
  return getActiveBehaviorSystem().shareHappiness(...args);
}
export function recoverPositiveMood(
  ...args: Parameters<BehaviorSystem['recoverPositiveMood']>
): ReturnType<BehaviorSystem['recoverPositiveMood']> {
  return getActiveBehaviorSystem().recoverPositiveMood(...args);
}
export function feelSadness(
  ...args: Parameters<BehaviorSystem['feelSadness']>
): ReturnType<BehaviorSystem['feelSadness']> {
  return getActiveBehaviorSystem().feelSadness(...args);
}
export function feelGrief(
  ...args: Parameters<BehaviorSystem['feelGrief']>
): ReturnType<BehaviorSystem['feelGrief']> {
  return getActiveBehaviorSystem().feelGrief(...args);
}
export function feelDisappointment(
  ...args: Parameters<BehaviorSystem['feelDisappointment']>
): ReturnType<BehaviorSystem['feelDisappointment']> {
  return getActiveBehaviorSystem().feelDisappointment(...args);
}
export function feelLoneliness(
  ...args: Parameters<BehaviorSystem['feelLoneliness']>
): ReturnType<BehaviorSystem['feelLoneliness']> {
  return getActiveBehaviorSystem().feelLoneliness(...args);
}
export function feelEmptiness(
  ...args: Parameters<BehaviorSystem['feelEmptiness']>
): ReturnType<BehaviorSystem['feelEmptiness']> {
  return getActiveBehaviorSystem().feelEmptiness(...args);
}
export function feelNostalgia(
  ...args: Parameters<BehaviorSystem['feelNostalgia']>
): ReturnType<BehaviorSystem['feelNostalgia']> {
  return getActiveBehaviorSystem().feelNostalgia(...args);
}
export function feelRegret(
  ...args: Parameters<BehaviorSystem['feelRegret']>
): ReturnType<BehaviorSystem['feelRegret']> {
  return getActiveBehaviorSystem().feelRegret(...args);
}
export function feelHopelessness(
  ...args: Parameters<BehaviorSystem['feelHopelessness']>
): ReturnType<BehaviorSystem['feelHopelessness']> {
  return getActiveBehaviorSystem().feelHopelessness(...args);
}
export function feelHomesickness(
  ...args: Parameters<BehaviorSystem['feelHomesickness']>
): ReturnType<BehaviorSystem['feelHomesickness']> {
  return getActiveBehaviorSystem().feelHomesickness(...args);
}
export function feelRejectionPain(
  ...args: Parameters<BehaviorSystem['feelRejectionPain']>
): ReturnType<BehaviorSystem['feelRejectionPain']> {
  return getActiveBehaviorSystem().feelRejectionPain(...args);
}
export function processPersonalLoss(
  ...args: Parameters<BehaviorSystem['processPersonalLoss']>
): ReturnType<BehaviorSystem['processPersonalLoss']> {
  return getActiveBehaviorSystem().processPersonalLoss(...args);
}
export function processFailedExpectation(
  ...args: Parameters<BehaviorSystem['processFailedExpectation']>
): ReturnType<BehaviorSystem['processFailedExpectation']> {
  return getActiveBehaviorSystem().processFailedExpectation(...args);
}
export function withdrawSocially(
  ...args: Parameters<BehaviorSystem['withdrawSocially']>
): ReturnType<BehaviorSystem['withdrawSocially']> {
  return getActiveBehaviorSystem().withdrawSocially(...args);
}
export function seekEmotionalComfort(
  ...args: Parameters<BehaviorSystem['seekEmotionalComfort']>
): ReturnType<BehaviorSystem['seekEmotionalComfort']> {
  return getActiveBehaviorSystem().seekEmotionalComfort(...args);
}
export function expressSadness(
  ...args: Parameters<BehaviorSystem['expressSadness']>
): ReturnType<BehaviorSystem['expressSadness']> {
  return getActiveBehaviorSystem().expressSadness(...args);
}
export function concealSadness(
  ...args: Parameters<BehaviorSystem['concealSadness']>
): ReturnType<BehaviorSystem['concealSadness']> {
  return getActiveBehaviorSystem().concealSadness(...args);
}
export function ruminateOnNegativeEvent(
  ...args: Parameters<BehaviorSystem['ruminateOnNegativeEvent']>
): ReturnType<BehaviorSystem['ruminateOnNegativeEvent']> {
  return getActiveBehaviorSystem().ruminateOnNegativeEvent(...args);
}
export function acceptPersonalLoss(
  ...args: Parameters<BehaviorSystem['acceptPersonalLoss']>
): ReturnType<BehaviorSystem['acceptPersonalLoss']> {
  return getActiveBehaviorSystem().acceptPersonalLoss(...args);
}
export function recoverFromDisappointment(
  ...args: Parameters<BehaviorSystem['recoverFromDisappointment']>
): ReturnType<BehaviorSystem['recoverFromDisappointment']> {
  return getActiveBehaviorSystem().recoverFromDisappointment(...args);
}
export function restoreEmotionalResilience(
  ...args: Parameters<BehaviorSystem['restoreEmotionalResilience']>
): ReturnType<BehaviorSystem['restoreEmotionalResilience']> {
  return getActiveBehaviorSystem().restoreEmotionalResilience(...args);
}
export function feelFear(
  ...args: Parameters<BehaviorSystem['feelFear']>
): ReturnType<BehaviorSystem['feelFear']> {
  return getActiveBehaviorSystem().feelFear(...args);
}
export function feelAnxiety(
  ...args: Parameters<BehaviorSystem['feelAnxiety']>
): ReturnType<BehaviorSystem['feelAnxiety']> {
  return getActiveBehaviorSystem().feelAnxiety(...args);
}
export function feelPanic(
  ...args: Parameters<BehaviorSystem['feelPanic']>
): ReturnType<BehaviorSystem['feelPanic']> {
  return getActiveBehaviorSystem().feelPanic(...args);
}
export function feelDread(
  ...args: Parameters<BehaviorSystem['feelDread']>
): ReturnType<BehaviorSystem['feelDread']> {
  return getActiveBehaviorSystem().feelDread(...args);
}
export function feelSuspicion(
  ...args: Parameters<BehaviorSystem['feelSuspicion']>
): ReturnType<BehaviorSystem['feelSuspicion']> {
  return getActiveBehaviorSystem().feelSuspicion(...args);
}
export function detectPotentialThreat(
  ...args: Parameters<BehaviorSystem['detectPotentialThreat']>
): ReturnType<BehaviorSystem['detectPotentialThreat']> {
  return getActiveBehaviorSystem().detectPotentialThreat(...args);
}
export function estimateThreatSeverity(
  ...args: Parameters<BehaviorSystem['estimateThreatSeverity']>
): ReturnType<BehaviorSystem['estimateThreatSeverity']> {
  return getActiveBehaviorSystem().estimateThreatSeverity(...args);
}
export function estimateThreatDistance(
  ...args: Parameters<BehaviorSystem['estimateThreatDistance']>
): ReturnType<BehaviorSystem['estimateThreatDistance']> {
  return getActiveBehaviorSystem().estimateThreatDistance(...args);
}
export function triggerFightResponse(
  ...args: Parameters<BehaviorSystem['triggerFightResponse']>
): ReturnType<BehaviorSystem['triggerFightResponse']> {
  return getActiveBehaviorSystem().triggerFightResponse(...args);
}
export function triggerFlightResponse(
  ...args: Parameters<BehaviorSystem['triggerFlightResponse']>
): ReturnType<BehaviorSystem['triggerFlightResponse']> {
  return getActiveBehaviorSystem().triggerFlightResponse(...args);
}
export function triggerFreezeResponse(
  ...args: Parameters<BehaviorSystem['triggerFreezeResponse']>
): ReturnType<BehaviorSystem['triggerFreezeResponse']> {
  return getActiveBehaviorSystem().triggerFreezeResponse(...args);
}
export function triggerFawnResponse(
  ...args: Parameters<BehaviorSystem['triggerFawnResponse']>
): ReturnType<BehaviorSystem['triggerFawnResponse']> {
  return getActiveBehaviorSystem().triggerFawnResponse(...args);
}
export function scanEnvironmentForThreats(
  ...args: Parameters<BehaviorSystem['scanEnvironmentForThreats']>
): ReturnType<BehaviorSystem['scanEnvironmentForThreats']> {
  return getActiveBehaviorSystem().scanEnvironmentForThreats(...args);
}
export function avoidThreateningEntity(
  ...args: Parameters<BehaviorSystem['avoidThreateningEntity']>
): ReturnType<BehaviorSystem['avoidThreateningEntity']> {
  return getActiveBehaviorSystem().avoidThreateningEntity(...args);
}
export function seekSafety(
  ...args: Parameters<BehaviorSystem['seekSafety']>
): ReturnType<BehaviorSystem['seekSafety']> {
  return getActiveBehaviorSystem().seekSafety(...args);
}
export function seekProtection(
  ...args: Parameters<BehaviorSystem['seekProtection']>
): ReturnType<BehaviorSystem['seekProtection']> {
  return getActiveBehaviorSystem().seekProtection(...args);
}
export function communicateFear(
  ...args: Parameters<BehaviorSystem['communicateFear']>
): ReturnType<BehaviorSystem['communicateFear']> {
  return getActiveBehaviorSystem().communicateFear(...args);
}
export function suppressFearResponse(
  ...args: Parameters<BehaviorSystem['suppressFearResponse']>
): ReturnType<BehaviorSystem['suppressFearResponse']> {
  return getActiveBehaviorSystem().suppressFearResponse(...args);
}
export function reassessThreatLevel(
  ...args: Parameters<BehaviorSystem['reassessThreatLevel']>
): ReturnType<BehaviorSystem['reassessThreatLevel']> {
  return getActiveBehaviorSystem().reassessThreatLevel(...args);
}
export function recoverFromFear(
  ...args: Parameters<BehaviorSystem['recoverFromFear']>
): ReturnType<BehaviorSystem['recoverFromFear']> {
  return getActiveBehaviorSystem().recoverFromFear(...args);
}
export function feelAnger(
  ...args: Parameters<BehaviorSystem['feelAnger']>
): ReturnType<BehaviorSystem['feelAnger']> {
  return getActiveBehaviorSystem().feelAnger(...args);
}
export function feelIrritation(
  ...args: Parameters<BehaviorSystem['feelIrritation']>
): ReturnType<BehaviorSystem['feelIrritation']> {
  return getActiveBehaviorSystem().feelIrritation(...args);
}
export function feelFrustration(
  ...args: Parameters<BehaviorSystem['feelFrustration']>
): ReturnType<BehaviorSystem['feelFrustration']> {
  return getActiveBehaviorSystem().feelFrustration(...args);
}
export function feelResentment(
  ...args: Parameters<BehaviorSystem['feelResentment']>
): ReturnType<BehaviorSystem['feelResentment']> {
  return getActiveBehaviorSystem().feelResentment(...args);
}
export function feelJealousy(
  ...args: Parameters<BehaviorSystem['feelJealousy']>
): ReturnType<BehaviorSystem['feelJealousy']> {
  return getActiveBehaviorSystem().feelJealousy(...args);
}
export function feelEnvy(
  ...args: Parameters<BehaviorSystem['feelEnvy']>
): ReturnType<BehaviorSystem['feelEnvy']> {
  return getActiveBehaviorSystem().feelEnvy(...args);
}
export function feelContempt(
  ...args: Parameters<BehaviorSystem['feelContempt']>
): ReturnType<BehaviorSystem['feelContempt']> {
  return getActiveBehaviorSystem().feelContempt(...args);
}
export function feelIndignation(
  ...args: Parameters<BehaviorSystem['feelIndignation']>
): ReturnType<BehaviorSystem['feelIndignation']> {
  return getActiveBehaviorSystem().feelIndignation(...args);
}
export function identifyAngerTrigger(
  ...args: Parameters<BehaviorSystem['identifyAngerTrigger']>
): ReturnType<BehaviorSystem['identifyAngerTrigger']> {
  return getActiveBehaviorSystem().identifyAngerTrigger(...args);
}
export function estimateAngerIntensity(
  ...args: Parameters<BehaviorSystem['estimateAngerIntensity']>
): ReturnType<BehaviorSystem['estimateAngerIntensity']> {
  return getActiveBehaviorSystem().estimateAngerIntensity(...args);
}
export function expressAngerVerbally(
  ...args: Parameters<BehaviorSystem['expressAngerVerbally']>
): ReturnType<BehaviorSystem['expressAngerVerbally']> {
  return getActiveBehaviorSystem().expressAngerVerbally(...args);
}
export function expressAngerPhysically(
  ...args: Parameters<BehaviorSystem['expressAngerPhysically']>
): ReturnType<BehaviorSystem['expressAngerPhysically']> {
  return getActiveBehaviorSystem().expressAngerPhysically(...args);
}
export function suppressAnger(
  ...args: Parameters<BehaviorSystem['suppressAnger']>
): ReturnType<BehaviorSystem['suppressAnger']> {
  return getActiveBehaviorSystem().suppressAnger(...args);
}
export function deescalateAnger(
  ...args: Parameters<BehaviorSystem['deescalateAnger']>
): ReturnType<BehaviorSystem['deescalateAnger']> {
  return getActiveBehaviorSystem().deescalateAnger(...args);
}
export function redirectAnger(
  ...args: Parameters<BehaviorSystem['redirectAnger']>
): ReturnType<BehaviorSystem['redirectAnger']> {
  return getActiveBehaviorSystem().redirectAnger(...args);
}
export function initiateConfrontation(
  ...args: Parameters<BehaviorSystem['initiateConfrontation']>
): ReturnType<BehaviorSystem['initiateConfrontation']> {
  return getActiveBehaviorSystem().initiateConfrontation(...args);
}
export function withdrawFromConflict(
  ...args: Parameters<BehaviorSystem['withdrawFromConflict']>
): ReturnType<BehaviorSystem['withdrawFromConflict']> {
  return getActiveBehaviorSystem().withdrawFromConflict(...args);
}
export function evaluateConflictConsequences(
  ...args: Parameters<BehaviorSystem['evaluateConflictConsequences']>
): ReturnType<BehaviorSystem['evaluateConflictConsequences']> {
  return getActiveBehaviorSystem().evaluateConflictConsequences(...args);
}
export function resolveInterpersonalConflict(
  ...args: Parameters<BehaviorSystem['resolveInterpersonalConflict']>
): ReturnType<BehaviorSystem['resolveInterpersonalConflict']> {
  return getActiveBehaviorSystem().resolveInterpersonalConflict(...args);
}
export function recoverAfterAnger(
  ...args: Parameters<BehaviorSystem['recoverAfterAnger']>
): ReturnType<BehaviorSystem['recoverAfterAnger']> {
  return getActiveBehaviorSystem().recoverAfterAnger(...args);
}
export function developAffection(
  ...args: Parameters<BehaviorSystem['developAffection']>
): ReturnType<BehaviorSystem['developAffection']> {
  return getActiveBehaviorSystem().developAffection(...args);
}
export function developRomanticAttraction(
  ...args: Parameters<BehaviorSystem['developRomanticAttraction']>
): ReturnType<BehaviorSystem['developRomanticAttraction']> {
  return getActiveBehaviorSystem().developRomanticAttraction(...args);
}
export function developEmotionalAttachment(
  ...args: Parameters<BehaviorSystem['developEmotionalAttachment']>
): ReturnType<BehaviorSystem['developEmotionalAttachment']> {
  return getActiveBehaviorSystem().developEmotionalAttachment(...args);
}
export function strengthenRelationshipBond(
  ...args: Parameters<BehaviorSystem['strengthenRelationshipBond']>
): ReturnType<BehaviorSystem['strengthenRelationshipBond']> {
  return getActiveBehaviorSystem().strengthenRelationshipBond(...args);
}
export function weakenRelationshipBond(
  ...args: Parameters<BehaviorSystem['weakenRelationshipBond']>
): ReturnType<BehaviorSystem['weakenRelationshipBond']> {
  return getActiveBehaviorSystem().weakenRelationshipBond(...args);
}
export function seekIntimacy(
  ...args: Parameters<BehaviorSystem['seekIntimacy']>
): ReturnType<BehaviorSystem['seekIntimacy']> {
  return getActiveBehaviorSystem().seekIntimacy(...args);
}
export function seekCompanionship(
  ...args: Parameters<BehaviorSystem['seekCompanionship']>
): ReturnType<BehaviorSystem['seekCompanionship']> {
  return getActiveBehaviorSystem().seekCompanionship(...args);
}
export function expressLove(
  ...args: Parameters<BehaviorSystem['expressLove']>
): ReturnType<BehaviorSystem['expressLove']> {
  return getActiveBehaviorSystem().expressLove(...args);
}
export function expressAffectionPhysically(
  ...args: Parameters<BehaviorSystem['expressAffectionPhysically']>
): ReturnType<BehaviorSystem['expressAffectionPhysically']> {
  return getActiveBehaviorSystem().expressAffectionPhysically(...args);
}
export function expressAffectionVerbally(
  ...args: Parameters<BehaviorSystem['expressAffectionVerbally']>
): ReturnType<BehaviorSystem['expressAffectionVerbally']> {
  return getActiveBehaviorSystem().expressAffectionVerbally(...args);
}
export function respondToAffection(
  ...args: Parameters<BehaviorSystem['respondToAffection']>
): ReturnType<BehaviorSystem['respondToAffection']> {
  return getActiveBehaviorSystem().respondToAffection(...args);
}
export function recognizeRomanticInterest(
  ...args: Parameters<BehaviorSystem['recognizeRomanticInterest']>
): ReturnType<BehaviorSystem['recognizeRomanticInterest']> {
  return getActiveBehaviorSystem().recognizeRomanticInterest(...args);
}
export function evaluateRelationshipCompatibility(
  ...args: Parameters<BehaviorSystem['evaluateRelationshipCompatibility']>
): ReturnType<BehaviorSystem['evaluateRelationshipCompatibility']> {
  return getActiveBehaviorSystem().evaluateRelationshipCompatibility(...args);
}
export function maintainRelationshipTrust(
  ...args: Parameters<BehaviorSystem['maintainRelationshipTrust']>
): ReturnType<BehaviorSystem['maintainRelationshipTrust']> {
  return getActiveBehaviorSystem().maintainRelationshipTrust(...args);
}
export function experienceSeparationDistress(
  ...args: Parameters<BehaviorSystem['experienceSeparationDistress']>
): ReturnType<BehaviorSystem['experienceSeparationDistress']> {
  return getActiveBehaviorSystem().experienceSeparationDistress(...args);
}
export function seekReconciliation(
  ...args: Parameters<BehaviorSystem['seekReconciliation']>
): ReturnType<BehaviorSystem['seekReconciliation']> {
  return getActiveBehaviorSystem().seekReconciliation(...args);
}
export function establishPersonalBoundaries(
  ...args: Parameters<BehaviorSystem['establishPersonalBoundaries']>
): ReturnType<BehaviorSystem['establishPersonalBoundaries']> {
  return getActiveBehaviorSystem().establishPersonalBoundaries(...args);
}
export function respectRelationshipBoundaries(
  ...args: Parameters<BehaviorSystem['respectRelationshipBoundaries']>
): ReturnType<BehaviorSystem['respectRelationshipBoundaries']> {
  return getActiveBehaviorSystem().respectRelationshipBoundaries(...args);
}
export function adaptToRelationshipChange(
  ...args: Parameters<BehaviorSystem['adaptToRelationshipChange']>
): ReturnType<BehaviorSystem['adaptToRelationshipChange']> {
  return getActiveBehaviorSystem().adaptToRelationshipChange(...args);
}
export function endRelationship(
  ...args: Parameters<BehaviorSystem['endRelationship']>
): ReturnType<BehaviorSystem['endRelationship']> {
  return getActiveBehaviorSystem().endRelationship(...args);
}
export function recognizeOthersDistress(
  ...args: Parameters<BehaviorSystem['recognizeOthersDistress']>
): ReturnType<BehaviorSystem['recognizeOthersDistress']> {
  return getActiveBehaviorSystem().recognizeOthersDistress(...args);
}
export function inferOthersEmotions(
  ...args: Parameters<BehaviorSystem['inferOthersEmotions']>
): ReturnType<BehaviorSystem['inferOthersEmotions']> {
  return getActiveBehaviorSystem().inferOthersEmotions(...args);
}
export function simulateCognitiveEmpathy(
  ...args: Parameters<BehaviorSystem['simulateCognitiveEmpathy']>
): ReturnType<BehaviorSystem['simulateCognitiveEmpathy']> {
  return getActiveBehaviorSystem().simulateCognitiveEmpathy(...args);
}
export function simulateEmotionalEmpathy(
  ...args: Parameters<BehaviorSystem['simulateEmotionalEmpathy']>
): ReturnType<BehaviorSystem['simulateEmotionalEmpathy']> {
  return getActiveBehaviorSystem().simulateEmotionalEmpathy(...args);
}
export function feelCompassion(
  ...args: Parameters<BehaviorSystem['feelCompassion']>
): ReturnType<BehaviorSystem['feelCompassion']> {
  return getActiveBehaviorSystem().feelCompassion(...args);
}
export function feelSympathy(
  ...args: Parameters<BehaviorSystem['feelSympathy']>
): ReturnType<BehaviorSystem['feelSympathy']> {
  return getActiveBehaviorSystem().feelSympathy(...args);
}
export function offerEmotionalSupport(
  ...args: Parameters<BehaviorSystem['offerEmotionalSupport']>
): ReturnType<BehaviorSystem['offerEmotionalSupport']> {
  return getActiveBehaviorSystem().offerEmotionalSupport(...args);
}
export function offerPracticalHelp(
  ...args: Parameters<BehaviorSystem['offerPracticalHelp']>
): ReturnType<BehaviorSystem['offerPracticalHelp']> {
  return getActiveBehaviorSystem().offerPracticalHelp(...args);
}
export function comfortDistressedPerson(
  ...args: Parameters<BehaviorSystem['comfortDistressedPerson']>
): ReturnType<BehaviorSystem['comfortDistressedPerson']> {
  return getActiveBehaviorSystem().comfortDistressedPerson(...args);
}
export function listenActively(
  ...args: Parameters<BehaviorSystem['listenActively']>
): ReturnType<BehaviorSystem['listenActively']> {
  return getActiveBehaviorSystem().listenActively(...args);
}
export function validateOthersFeelings(
  ...args: Parameters<BehaviorSystem['validateOthersFeelings']>
): ReturnType<BehaviorSystem['validateOthersFeelings']> {
  return getActiveBehaviorSystem().validateOthersFeelings(...args);
}
export function inferUnspokenNeeds(
  ...args: Parameters<BehaviorSystem['inferUnspokenNeeds']>
): ReturnType<BehaviorSystem['inferUnspokenNeeds']> {
  return getActiveBehaviorSystem().inferUnspokenNeeds(...args);
}
export function prioritizeOthersWelfare(
  ...args: Parameters<BehaviorSystem['prioritizeOthersWelfare']>
): ReturnType<BehaviorSystem['prioritizeOthersWelfare']> {
  return getActiveBehaviorSystem().prioritizeOthersWelfare(...args);
}
export function performAltruisticAction(
  ...args: Parameters<BehaviorSystem['performAltruisticAction']>
): ReturnType<BehaviorSystem['performAltruisticAction']> {
  return getActiveBehaviorSystem().performAltruisticAction(...args);
}
export function shareResources(
  ...args: Parameters<BehaviorSystem['shareResources']>
): ReturnType<BehaviorSystem['shareResources']> {
  return getActiveBehaviorSystem().shareResources(...args);
}
export function cooperateForMutualBenefit(
  ...args: Parameters<BehaviorSystem['cooperateForMutualBenefit']>
): ReturnType<BehaviorSystem['cooperateForMutualBenefit']> {
  return getActiveBehaviorSystem().cooperateForMutualBenefit(...args);
}
export function respondToInjustice(
  ...args: Parameters<BehaviorSystem['respondToInjustice']>
): ReturnType<BehaviorSystem['respondToInjustice']> {
  return getActiveBehaviorSystem().respondToInjustice(...args);
}
export function forgiveOthers(
  ...args: Parameters<BehaviorSystem['forgiveOthers']>
): ReturnType<BehaviorSystem['forgiveOthers']> {
  return getActiveBehaviorSystem().forgiveOthers(...args);
}
export function expressGratitudeToOthers(
  ...args: Parameters<BehaviorSystem['expressGratitudeToOthers']>
): ReturnType<BehaviorSystem['expressGratitudeToOthers']> {
  return getActiveBehaviorSystem().expressGratitudeToOthers(...args);
}
export function maintainEmpathicEngagement(
  ...args: Parameters<BehaviorSystem['maintainEmpathicEngagement']>
): ReturnType<BehaviorSystem['maintainEmpathicEngagement']> {
  return getActiveBehaviorSystem().maintainEmpathicEngagement(...args);
}
export function evaluateSelfWorth(
  ...args: Parameters<BehaviorSystem['evaluateSelfWorth']>
): ReturnType<BehaviorSystem['evaluateSelfWorth']> {
  return getActiveBehaviorSystem().evaluateSelfWorth(...args);
}
export function estimateSelfConfidence(
  ...args: Parameters<BehaviorSystem['estimateSelfConfidence']>
): ReturnType<BehaviorSystem['estimateSelfConfidence']> {
  return getActiveBehaviorSystem().estimateSelfConfidence(...args);
}
export function updateSelfImage(
  ...args: Parameters<BehaviorSystem['updateSelfImage']>
): ReturnType<BehaviorSystem['updateSelfImage']> {
  return getActiveBehaviorSystem().updateSelfImage(...args);
}
export function compareSelfWithOthers(
  ...args: Parameters<BehaviorSystem['compareSelfWithOthers']>
): ReturnType<BehaviorSystem['compareSelfWithOthers']> {
  return getActiveBehaviorSystem().compareSelfWithOthers(...args);
}
export function evaluatePersonalStrengths(
  ...args: Parameters<BehaviorSystem['evaluatePersonalStrengths']>
): ReturnType<BehaviorSystem['evaluatePersonalStrengths']> {
  return getActiveBehaviorSystem().evaluatePersonalStrengths(...args);
}
export function evaluatePersonalWeaknesses(
  ...args: Parameters<BehaviorSystem['evaluatePersonalWeaknesses']>
): ReturnType<BehaviorSystem['evaluatePersonalWeaknesses']> {
  return getActiveBehaviorSystem().evaluatePersonalWeaknesses(...args);
}
export function recognizePersonalNeeds(
  ...args: Parameters<BehaviorSystem['recognizePersonalNeeds']>
): ReturnType<BehaviorSystem['recognizePersonalNeeds']> {
  return getActiveBehaviorSystem().recognizePersonalNeeds(...args);
}
export function recognizePersonalLimits(
  ...args: Parameters<BehaviorSystem['recognizePersonalLimits']>
): ReturnType<BehaviorSystem['recognizePersonalLimits']> {
  return getActiveBehaviorSystem().recognizePersonalLimits(...args);
}
export function expressSelfIdentity(
  ...args: Parameters<BehaviorSystem['expressSelfIdentity']>
): ReturnType<BehaviorSystem['expressSelfIdentity']> {
  return getActiveBehaviorSystem().expressSelfIdentity(...args);
}
export function protectSelfEsteem(
  ...args: Parameters<BehaviorSystem['protectSelfEsteem']>
): ReturnType<BehaviorSystem['protectSelfEsteem']> {
  return getActiveBehaviorSystem().protectSelfEsteem(...args);
}
export function recoverSelfConfidence(
  ...args: Parameters<BehaviorSystem['recoverSelfConfidence']>
): ReturnType<BehaviorSystem['recoverSelfConfidence']> {
  return getActiveBehaviorSystem().recoverSelfConfidence(...args);
}
export function experienceEmbarrassment(
  ...args: Parameters<BehaviorSystem['experienceEmbarrassment']>
): ReturnType<BehaviorSystem['experienceEmbarrassment']> {
  return getActiveBehaviorSystem().experienceEmbarrassment(...args);
}
export function experienceShame(
  ...args: Parameters<BehaviorSystem['experienceShame']>
): ReturnType<BehaviorSystem['experienceShame']> {
  return getActiveBehaviorSystem().experienceShame(...args);
}
export function experienceGuilt(
  ...args: Parameters<BehaviorSystem['experienceGuilt']>
): ReturnType<BehaviorSystem['experienceGuilt']> {
  return getActiveBehaviorSystem().experienceGuilt(...args);
}
export function experienceHumiliation(
  ...args: Parameters<BehaviorSystem['experienceHumiliation']>
): ReturnType<BehaviorSystem['experienceHumiliation']> {
  return getActiveBehaviorSystem().experienceHumiliation(...args);
}
export function acceptPersonalFlaws(
  ...args: Parameters<BehaviorSystem['acceptPersonalFlaws']>
): ReturnType<BehaviorSystem['acceptPersonalFlaws']> {
  return getActiveBehaviorSystem().acceptPersonalFlaws(...args);
}
export function acknowledgePersonalAchievement(
  ...args: Parameters<BehaviorSystem['acknowledgePersonalAchievement']>
): ReturnType<BehaviorSystem['acknowledgePersonalAchievement']> {
  return getActiveBehaviorSystem().acknowledgePersonalAchievement(...args);
}
export function defendPersonalIdentity(
  ...args: Parameters<BehaviorSystem['defendPersonalIdentity']>
): ReturnType<BehaviorSystem['defendPersonalIdentity']> {
  return getActiveBehaviorSystem().defendPersonalIdentity(...args);
}
export function reflectOnPersonalValues(
  ...args: Parameters<BehaviorSystem['reflectOnPersonalValues']>
): ReturnType<BehaviorSystem['reflectOnPersonalValues']> {
  return getActiveBehaviorSystem().reflectOnPersonalValues(...args);
}
export function updateSelfConcept(
  ...args: Parameters<BehaviorSystem['updateSelfConcept']>
): ReturnType<BehaviorSystem['updateSelfConcept']> {
  return getActiveBehaviorSystem().updateSelfConcept(...args);
}
export function generateMotivation(
  ...args: Parameters<BehaviorSystem['generateMotivation']>
): ReturnType<BehaviorSystem['generateMotivation']> {
  return getActiveBehaviorSystem().generateMotivation(...args);
}
export function estimateMotivationLevel(
  ...args: Parameters<BehaviorSystem['estimateMotivationLevel']>
): ReturnType<BehaviorSystem['estimateMotivationLevel']> {
  return getActiveBehaviorSystem().estimateMotivationLevel(...args);
}
export function setPersonalGoal(
  ...args: Parameters<BehaviorSystem['setPersonalGoal']>
): ReturnType<BehaviorSystem['setPersonalGoal']> {
  return getActiveBehaviorSystem().setPersonalGoal(...args);
}
export function decomposeGoalIntoTasks(
  ...args: Parameters<BehaviorSystem['decomposeGoalIntoTasks']>
): ReturnType<BehaviorSystem['decomposeGoalIntoTasks']> {
  return getActiveBehaviorSystem().decomposeGoalIntoTasks(...args);
}
export function prioritizePersonalGoals(
  ...args: Parameters<BehaviorSystem['prioritizePersonalGoals']>
): ReturnType<BehaviorSystem['prioritizePersonalGoals']> {
  return getActiveBehaviorSystem().prioritizePersonalGoals(...args);
}
export function estimateGoalDifficulty(
  ...args: Parameters<BehaviorSystem['estimateGoalDifficulty']>
): ReturnType<BehaviorSystem['estimateGoalDifficulty']> {
  return getActiveBehaviorSystem().estimateGoalDifficulty(...args);
}
export function estimateGoalValue(
  ...args: Parameters<BehaviorSystem['estimateGoalValue']>
): ReturnType<BehaviorSystem['estimateGoalValue']> {
  return getActiveBehaviorSystem().estimateGoalValue(...args);
}
export function estimateGoalSuccessProbability(
  ...args: Parameters<BehaviorSystem['estimateGoalSuccessProbability']>
): ReturnType<BehaviorSystem['estimateGoalSuccessProbability']> {
  return getActiveBehaviorSystem().estimateGoalSuccessProbability(...args);
}
export function commitToGoal(
  ...args: Parameters<BehaviorSystem['commitToGoal']>
): ReturnType<BehaviorSystem['commitToGoal']> {
  return getActiveBehaviorSystem().commitToGoal(...args);
}
export function maintainTaskPersistence(
  ...args: Parameters<BehaviorSystem['maintainTaskPersistence']>
): ReturnType<BehaviorSystem['maintainTaskPersistence']> {
  return getActiveBehaviorSystem().maintainTaskPersistence(...args);
}
export function resistImmediateReward(
  ...args: Parameters<BehaviorSystem['resistImmediateReward']>
): ReturnType<BehaviorSystem['resistImmediateReward']> {
  return getActiveBehaviorSystem().resistImmediateReward(...args);
}
export function delayGratification(
  ...args: Parameters<BehaviorSystem['delayGratification']>
): ReturnType<BehaviorSystem['delayGratification']> {
  return getActiveBehaviorSystem().delayGratification(...args);
}
export function overcomeProcrastination(
  ...args: Parameters<BehaviorSystem['overcomeProcrastination']>
): ReturnType<BehaviorSystem['overcomeProcrastination']> {
  return getActiveBehaviorSystem().overcomeProcrastination(...args);
}
export function recoverMotivationAfterFailure(
  ...args: Parameters<BehaviorSystem['recoverMotivationAfterFailure']>
): ReturnType<BehaviorSystem['recoverMotivationAfterFailure']> {
  return getActiveBehaviorSystem().recoverMotivationAfterFailure(...args);
}
export function reviseUnrealisticGoal(
  ...args: Parameters<BehaviorSystem['reviseUnrealisticGoal']>
): ReturnType<BehaviorSystem['reviseUnrealisticGoal']> {
  return getActiveBehaviorSystem().reviseUnrealisticGoal(...args);
}
export function trackGoalProgress(
  ...args: Parameters<BehaviorSystem['trackGoalProgress']>
): ReturnType<BehaviorSystem['trackGoalProgress']> {
  return getActiveBehaviorSystem().trackGoalProgress(...args);
}
export function evaluateGoalCompletion(
  ...args: Parameters<BehaviorSystem['evaluateGoalCompletion']>
): ReturnType<BehaviorSystem['evaluateGoalCompletion']> {
  return getActiveBehaviorSystem().evaluateGoalCompletion(...args);
}
export function rewardGoalAchievement(
  ...args: Parameters<BehaviorSystem['rewardGoalAchievement']>
): ReturnType<BehaviorSystem['rewardGoalAchievement']> {
  return getActiveBehaviorSystem().rewardGoalAchievement(...args);
}
export function abandonUnreachableGoal(
  ...args: Parameters<BehaviorSystem['abandonUnreachableGoal']>
): ReturnType<BehaviorSystem['abandonUnreachableGoal']> {
  return getActiveBehaviorSystem().abandonUnreachableGoal(...args);
}
export function formLongTermIntention(
  ...args: Parameters<BehaviorSystem['formLongTermIntention']>
): ReturnType<BehaviorSystem['formLongTermIntention']> {
  return getActiveBehaviorSystem().formLongTermIntention(...args);
}
export function focusAttention(
  ...args: Parameters<BehaviorSystem['focusAttention']>
): ReturnType<BehaviorSystem['focusAttention']> {
  return getActiveBehaviorSystem().focusAttention(...args);
}
export function shiftAttention(
  ...args: Parameters<BehaviorSystem['shiftAttention']>
): ReturnType<BehaviorSystem['shiftAttention']> {
  return getActiveBehaviorSystem().shiftAttention(...args);
}
export function divideAttention(
  ...args: Parameters<BehaviorSystem['divideAttention']>
): ReturnType<BehaviorSystem['divideAttention']> {
  return getActiveBehaviorSystem().divideAttention(...args);
}
export function sustainAttention(
  ...args: Parameters<BehaviorSystem['sustainAttention']>
): ReturnType<BehaviorSystem['sustainAttention']> {
  return getActiveBehaviorSystem().sustainAttention(...args);
}
export function filterSensoryInput(
  ...args: Parameters<BehaviorSystem['filterSensoryInput']>
): ReturnType<BehaviorSystem['filterSensoryInput']> {
  return getActiveBehaviorSystem().filterSensoryInput(...args);
}
export function detectVisualStimulus(
  ...args: Parameters<BehaviorSystem['detectVisualStimulus']>
): ReturnType<BehaviorSystem['detectVisualStimulus']> {
  return getActiveBehaviorSystem().detectVisualStimulus(...args);
}
export function detectAuditoryStimulus(
  ...args: Parameters<BehaviorSystem['detectAuditoryStimulus']>
): ReturnType<BehaviorSystem['detectAuditoryStimulus']> {
  return getActiveBehaviorSystem().detectAuditoryStimulus(...args);
}
export function detectOlfactoryStimulus(
  ...args: Parameters<BehaviorSystem['detectOlfactoryStimulus']>
): ReturnType<BehaviorSystem['detectOlfactoryStimulus']> {
  return getActiveBehaviorSystem().detectOlfactoryStimulus(...args);
}
export function detectTactileStimulus(
  ...args: Parameters<BehaviorSystem['detectTactileStimulus']>
): ReturnType<BehaviorSystem['detectTactileStimulus']> {
  return getActiveBehaviorSystem().detectTactileStimulus(...args);
}
export function estimateObjectDistance(
  ...args: Parameters<BehaviorSystem['estimateObjectDistance']>
): ReturnType<BehaviorSystem['estimateObjectDistance']> {
  return getActiveBehaviorSystem().estimateObjectDistance(...args);
}
export function estimateObjectMotion(
  ...args: Parameters<BehaviorSystem['estimateObjectMotion']>
): ReturnType<BehaviorSystem['estimateObjectMotion']> {
  return getActiveBehaviorSystem().estimateObjectMotion(...args);
}
export function recognizeFamiliarObject(
  ...args: Parameters<BehaviorSystem['recognizeFamiliarObject']>
): ReturnType<BehaviorSystem['recognizeFamiliarObject']> {
  return getActiveBehaviorSystem().recognizeFamiliarObject(...args);
}
export function recognizeFamiliarFace(
  ...args: Parameters<BehaviorSystem['recognizeFamiliarFace']>
): ReturnType<BehaviorSystem['recognizeFamiliarFace']> {
  return getActiveBehaviorSystem().recognizeFamiliarFace(...args);
}
export function detectEnvironmentalChange(
  ...args: Parameters<BehaviorSystem['detectEnvironmentalChange']>
): ReturnType<BehaviorSystem['detectEnvironmentalChange']> {
  return getActiveBehaviorSystem().detectEnvironmentalChange(...args);
}
export function identifyRelevantStimulus(
  ...args: Parameters<BehaviorSystem['identifyRelevantStimulus']>
): ReturnType<BehaviorSystem['identifyRelevantStimulus']> {
  return getActiveBehaviorSystem().identifyRelevantStimulus(...args);
}
export function interpretAmbiguousStimulus(
  ...args: Parameters<BehaviorSystem['interpretAmbiguousStimulus']>
): ReturnType<BehaviorSystem['interpretAmbiguousStimulus']> {
  return getActiveBehaviorSystem().interpretAmbiguousStimulus(...args);
}
export function updatePerceptualExpectation(
  ...args: Parameters<BehaviorSystem['updatePerceptualExpectation']>
): ReturnType<BehaviorSystem['updatePerceptualExpectation']> {
  return getActiveBehaviorSystem().updatePerceptualExpectation(...args);
}
export function resolveSensoryConflict(
  ...args: Parameters<BehaviorSystem['resolveSensoryConflict']>
): ReturnType<BehaviorSystem['resolveSensoryConflict']> {
  return getActiveBehaviorSystem().resolveSensoryConflict(...args);
}
export function estimatePerceptualConfidence(
  ...args: Parameters<BehaviorSystem['estimatePerceptualConfidence']>
): ReturnType<BehaviorSystem['estimatePerceptualConfidence']> {
  return getActiveBehaviorSystem().estimatePerceptualConfidence(...args);
}
export function orientTowardStimulus(
  ...args: Parameters<BehaviorSystem['orientTowardStimulus']>
): ReturnType<BehaviorSystem['orientTowardStimulus']> {
  return getActiveBehaviorSystem().orientTowardStimulus(...args);
}
export function encodeShortTermMemory(
  ...args: Parameters<BehaviorSystem['encodeShortTermMemory']>
): ReturnType<BehaviorSystem['encodeShortTermMemory']> {
  return getActiveBehaviorSystem().encodeShortTermMemory(...args);
}
export function encodeLongTermMemory(
  ...args: Parameters<BehaviorSystem['encodeLongTermMemory']>
): ReturnType<BehaviorSystem['encodeLongTermMemory']> {
  return getActiveBehaviorSystem().encodeLongTermMemory(...args);
}
export function retrieveEpisodicMemory(
  ...args: Parameters<BehaviorSystem['retrieveEpisodicMemory']>
): ReturnType<BehaviorSystem['retrieveEpisodicMemory']> {
  return getActiveBehaviorSystem().retrieveEpisodicMemory(...args);
}
export function retrieveSemanticMemory(
  ...args: Parameters<BehaviorSystem['retrieveSemanticMemory']>
): ReturnType<BehaviorSystem['retrieveSemanticMemory']> {
  return getActiveBehaviorSystem().retrieveSemanticMemory(...args);
}
export function retrieveProceduralMemory(
  ...args: Parameters<BehaviorSystem['retrieveProceduralMemory']>
): ReturnType<BehaviorSystem['retrieveProceduralMemory']> {
  return getActiveBehaviorSystem().retrieveProceduralMemory(...args);
}
export function associateMemoryWithEmotion(
  ...args: Parameters<BehaviorSystem['associateMemoryWithEmotion']>
): ReturnType<BehaviorSystem['associateMemoryWithEmotion']> {
  return getActiveBehaviorSystem().associateMemoryWithEmotion(...args);
}
export function associateMemoryWithContext(
  ...args: Parameters<BehaviorSystem['associateMemoryWithContext']>
): ReturnType<BehaviorSystem['associateMemoryWithContext']> {
  return getActiveBehaviorSystem().associateMemoryWithContext(...args);
}
export function consolidateMemory(
  ...args: Parameters<BehaviorSystem['consolidateMemory']>
): ReturnType<BehaviorSystem['consolidateMemory']> {
  return getActiveBehaviorSystem().consolidateMemory(...args);
}
export function forgetIrrelevantMemory(
  ...args: Parameters<BehaviorSystem['forgetIrrelevantMemory']>
): ReturnType<BehaviorSystem['forgetIrrelevantMemory']> {
  return getActiveBehaviorSystem().forgetIrrelevantMemory(...args);
}
export function recognizePastExperience(
  ...args: Parameters<BehaviorSystem['recognizePastExperience']>
): ReturnType<BehaviorSystem['recognizePastExperience']> {
  return getActiveBehaviorSystem().recognizePastExperience(...args);
}
export function learnFromReward(
  ...args: Parameters<BehaviorSystem['learnFromReward']>
): ReturnType<BehaviorSystem['learnFromReward']> {
  return getActiveBehaviorSystem().learnFromReward(...args);
}
export function learnFromPunishment(
  ...args: Parameters<BehaviorSystem['learnFromPunishment']>
): ReturnType<BehaviorSystem['learnFromPunishment']> {
  return getActiveBehaviorSystem().learnFromPunishment(...args);
}
export function learnByObservation(
  ...args: Parameters<BehaviorSystem['learnByObservation']>
): ReturnType<BehaviorSystem['learnByObservation']> {
  return getActiveBehaviorSystem().learnByObservation(...args);
}
export function learnByImitation(
  ...args: Parameters<BehaviorSystem['learnByImitation']>
): ReturnType<BehaviorSystem['learnByImitation']> {
  return getActiveBehaviorSystem().learnByImitation(...args);
}
export function learnByTrialAndError(
  ...args: Parameters<BehaviorSystem['learnByTrialAndError']>
): ReturnType<BehaviorSystem['learnByTrialAndError']> {
  return getActiveBehaviorSystem().learnByTrialAndError(...args);
}
export function generalizeLearnedPattern(
  ...args: Parameters<BehaviorSystem['generalizeLearnedPattern']>
): ReturnType<BehaviorSystem['generalizeLearnedPattern']> {
  return getActiveBehaviorSystem().generalizeLearnedPattern(...args);
}
export function correctFaultyMemory(
  ...args: Parameters<BehaviorSystem['correctFaultyMemory']>
): ReturnType<BehaviorSystem['correctFaultyMemory']> {
  return getActiveBehaviorSystem().correctFaultyMemory(...args);
}
export function updateBeliefFromEvidence(
  ...args: Parameters<BehaviorSystem['updateBeliefFromEvidence']>
): ReturnType<BehaviorSystem['updateBeliefFromEvidence']> {
  return getActiveBehaviorSystem().updateBeliefFromEvidence(...args);
}
export function predictUsingPastExperience(
  ...args: Parameters<BehaviorSystem['predictUsingPastExperience']>
): ReturnType<BehaviorSystem['predictUsingPastExperience']> {
  return getActiveBehaviorSystem().predictUsingPastExperience(...args);
}
export function replayLearnedSkill(
  ...args: Parameters<BehaviorSystem['replayLearnedSkill']>
): ReturnType<BehaviorSystem['replayLearnedSkill']> {
  return getActiveBehaviorSystem().replayLearnedSkill(...args);
}
export function generateDecisionOptions(
  ...args: Parameters<BehaviorSystem['generateDecisionOptions']>
): ReturnType<BehaviorSystem['generateDecisionOptions']> {
  return getActiveBehaviorSystem().generateDecisionOptions(...args);
}
export function evaluateDecisionOptions(
  ...args: Parameters<BehaviorSystem['evaluateDecisionOptions']>
): ReturnType<BehaviorSystem['evaluateDecisionOptions']> {
  return getActiveBehaviorSystem().evaluateDecisionOptions(...args);
}
export function estimateDecisionRisk(
  ...args: Parameters<BehaviorSystem['estimateDecisionRisk']>
): ReturnType<BehaviorSystem['estimateDecisionRisk']> {
  return getActiveBehaviorSystem().estimateDecisionRisk(...args);
}
export function estimateDecisionReward(
  ...args: Parameters<BehaviorSystem['estimateDecisionReward']>
): ReturnType<BehaviorSystem['estimateDecisionReward']> {
  return getActiveBehaviorSystem().estimateDecisionReward(...args);
}
export function compareExpectedOutcomes(
  ...args: Parameters<BehaviorSystem['compareExpectedOutcomes']>
): ReturnType<BehaviorSystem['compareExpectedOutcomes']> {
  return getActiveBehaviorSystem().compareExpectedOutcomes(...args);
}
export function applyLogicalReasoning(
  ...args: Parameters<BehaviorSystem['applyLogicalReasoning']>
): ReturnType<BehaviorSystem['applyLogicalReasoning']> {
  return getActiveBehaviorSystem().applyLogicalReasoning(...args);
}
export function applyCausalReasoning(
  ...args: Parameters<BehaviorSystem['applyCausalReasoning']>
): ReturnType<BehaviorSystem['applyCausalReasoning']> {
  return getActiveBehaviorSystem().applyCausalReasoning(...args);
}
export function applyAnalogicalReasoning(
  ...args: Parameters<BehaviorSystem['applyAnalogicalReasoning']>
): ReturnType<BehaviorSystem['applyAnalogicalReasoning']> {
  return getActiveBehaviorSystem().applyAnalogicalReasoning(...args);
}
export function inferHiddenCause(
  ...args: Parameters<BehaviorSystem['inferHiddenCause']>
): ReturnType<BehaviorSystem['inferHiddenCause']> {
  return getActiveBehaviorSystem().inferHiddenCause(...args);
}
export function resolveCognitiveConflict(
  ...args: Parameters<BehaviorSystem['resolveCognitiveConflict']>
): ReturnType<BehaviorSystem['resolveCognitiveConflict']> {
  return getActiveBehaviorSystem().resolveCognitiveConflict(...args);
}
export function detectCognitiveBias(
  ...args: Parameters<BehaviorSystem['detectCognitiveBias']>
): ReturnType<BehaviorSystem['detectCognitiveBias']> {
  return getActiveBehaviorSystem().detectCognitiveBias(...args);
}
export function reviseInitialJudgment(
  ...args: Parameters<BehaviorSystem['reviseInitialJudgment']>
): ReturnType<BehaviorSystem['reviseInitialJudgment']> {
  return getActiveBehaviorSystem().reviseInitialJudgment(...args);
}
export function estimateDecisionConfidence(
  ...args: Parameters<BehaviorSystem['estimateDecisionConfidence']>
): ReturnType<BehaviorSystem['estimateDecisionConfidence']> {
  return getActiveBehaviorSystem().estimateDecisionConfidence(...args);
}
export function makeRiskSensitiveDecision(
  ...args: Parameters<BehaviorSystem['makeRiskSensitiveDecision']>
): ReturnType<BehaviorSystem['makeRiskSensitiveDecision']> {
  return getActiveBehaviorSystem().makeRiskSensitiveDecision(...args);
}
export function makeSocialDecision(
  ...args: Parameters<BehaviorSystem['makeSocialDecision']>
): ReturnType<BehaviorSystem['makeSocialDecision']> {
  return getActiveBehaviorSystem().makeSocialDecision(...args);
}
export function makeMoralJudgment(
  ...args: Parameters<BehaviorSystem['makeMoralJudgment']>
): ReturnType<BehaviorSystem['makeMoralJudgment']> {
  return getActiveBehaviorSystem().makeMoralJudgment(...args);
}
export function chooseUnderUncertainty(
  ...args: Parameters<BehaviorSystem['chooseUnderUncertainty']>
): ReturnType<BehaviorSystem['chooseUnderUncertainty']> {
  return getActiveBehaviorSystem().chooseUnderUncertainty(...args);
}
export function planAlternativeAction(
  ...args: Parameters<BehaviorSystem['planAlternativeAction']>
): ReturnType<BehaviorSystem['planAlternativeAction']> {
  return getActiveBehaviorSystem().planAlternativeAction(...args);
}
export function evaluateDecisionOutcome(
  ...args: Parameters<BehaviorSystem['evaluateDecisionOutcome']>
): ReturnType<BehaviorSystem['evaluateDecisionOutcome']> {
  return getActiveBehaviorSystem().evaluateDecisionOutcome(...args);
}
export function learnFromDecisionError(
  ...args: Parameters<BehaviorSystem['learnFromDecisionError']>
): ReturnType<BehaviorSystem['learnFromDecisionError']> {
  return getActiveBehaviorSystem().learnFromDecisionError(...args);
}
export function generateSpeechIntent(
  ...args: Parameters<BehaviorSystem['generateSpeechIntent']>
): ReturnType<BehaviorSystem['generateSpeechIntent']> {
  return getActiveBehaviorSystem().generateSpeechIntent(...args);
}
export function selectWordsForSpeech(
  ...args: Parameters<BehaviorSystem['selectWordsForSpeech']>
): ReturnType<BehaviorSystem['selectWordsForSpeech']> {
  return getActiveBehaviorSystem().selectWordsForSpeech(...args);
}
export function constructSentence(
  ...args: Parameters<BehaviorSystem['constructSentence']>
): ReturnType<BehaviorSystem['constructSentence']> {
  return getActiveBehaviorSystem().constructSentence(...args);
}
export function adjustSpeechTone(
  ...args: Parameters<BehaviorSystem['adjustSpeechTone']>
): ReturnType<BehaviorSystem['adjustSpeechTone']> {
  return getActiveBehaviorSystem().adjustSpeechTone(...args);
}
export function adjustSpeechVolume(
  ...args: Parameters<BehaviorSystem['adjustSpeechVolume']>
): ReturnType<BehaviorSystem['adjustSpeechVolume']> {
  return getActiveBehaviorSystem().adjustSpeechVolume(...args);
}
export function adjustSpeechRate(
  ...args: Parameters<BehaviorSystem['adjustSpeechRate']>
): ReturnType<BehaviorSystem['adjustSpeechRate']> {
  return getActiveBehaviorSystem().adjustSpeechRate(...args);
}
export function generateConversationalPause(
  ...args: Parameters<BehaviorSystem['generateConversationalPause']>
): ReturnType<BehaviorSystem['generateConversationalPause']> {
  return getActiveBehaviorSystem().generateConversationalPause(...args);
}
export function initiateConversation(
  ...args: Parameters<BehaviorSystem['initiateConversation']>
): ReturnType<BehaviorSystem['initiateConversation']> {
  return getActiveBehaviorSystem().initiateConversation(...args);
}
export function maintainConversation(
  ...args: Parameters<BehaviorSystem['maintainConversation']>
): ReturnType<BehaviorSystem['maintainConversation']> {
  return getActiveBehaviorSystem().maintainConversation(...args);
}
export function changeConversationTopic(
  ...args: Parameters<BehaviorSystem['changeConversationTopic']>
): ReturnType<BehaviorSystem['changeConversationTopic']> {
  return getActiveBehaviorSystem().changeConversationTopic(...args);
}
export function askClarifyingQuestion(
  ...args: Parameters<BehaviorSystem['askClarifyingQuestion']>
): ReturnType<BehaviorSystem['askClarifyingQuestion']> {
  return getActiveBehaviorSystem().askClarifyingQuestion(...args);
}
export function answerDirectQuestion(
  ...args: Parameters<BehaviorSystem['answerDirectQuestion']>
): ReturnType<BehaviorSystem['answerDirectQuestion']> {
  return getActiveBehaviorSystem().answerDirectQuestion(...args);
}
export function interruptConversationPolitely(
  ...args: Parameters<BehaviorSystem['interruptConversationPolitely']>
): ReturnType<BehaviorSystem['interruptConversationPolitely']> {
  return getActiveBehaviorSystem().interruptConversationPolitely(...args);
}
export function detectConversationTurn(
  ...args: Parameters<BehaviorSystem['detectConversationTurn']>
): ReturnType<BehaviorSystem['detectConversationTurn']> {
  return getActiveBehaviorSystem().detectConversationTurn(...args);
}
export function interpretFigurativeLanguage(
  ...args: Parameters<BehaviorSystem['interpretFigurativeLanguage']>
): ReturnType<BehaviorSystem['interpretFigurativeLanguage']> {
  return getActiveBehaviorSystem().interpretFigurativeLanguage(...args);
}
export function interpretSarcasm(
  ...args: Parameters<BehaviorSystem['interpretSarcasm']>
): ReturnType<BehaviorSystem['interpretSarcasm']> {
  return getActiveBehaviorSystem().interpretSarcasm(...args);
}
export function interpretHumor(
  ...args: Parameters<BehaviorSystem['interpretHumor']>
): ReturnType<BehaviorSystem['interpretHumor']> {
  return getActiveBehaviorSystem().interpretHumor(...args);
}
export function expressUncertaintyVerbally(
  ...args: Parameters<BehaviorSystem['expressUncertaintyVerbally']>
): ReturnType<BehaviorSystem['expressUncertaintyVerbally']> {
  return getActiveBehaviorSystem().expressUncertaintyVerbally(...args);
}
export function repairMiscommunication(
  ...args: Parameters<BehaviorSystem['repairMiscommunication']>
): ReturnType<BehaviorSystem['repairMiscommunication']> {
  return getActiveBehaviorSystem().repairMiscommunication(...args);
}
export function adaptSpeechToListener(
  ...args: Parameters<BehaviorSystem['adaptSpeechToListener']>
): ReturnType<BehaviorSystem['adaptSpeechToListener']> {
  return getActiveBehaviorSystem().adaptSpeechToListener(...args);
}
export function updateFacialExpression(
  ...args: Parameters<BehaviorSystem['updateFacialExpression']>
): ReturnType<BehaviorSystem['updateFacialExpression']> {
  return getActiveBehaviorSystem().updateFacialExpression(...args);
}
export function generateSmile(
  ...args: Parameters<BehaviorSystem['generateSmile']>
): ReturnType<BehaviorSystem['generateSmile']> {
  return getActiveBehaviorSystem().generateSmile(...args);
}
export function generateFrown(
  ...args: Parameters<BehaviorSystem['generateFrown']>
): ReturnType<BehaviorSystem['generateFrown']> {
  return getActiveBehaviorSystem().generateFrown(...args);
}
export function generateSurprisedExpression(
  ...args: Parameters<BehaviorSystem['generateSurprisedExpression']>
): ReturnType<BehaviorSystem['generateSurprisedExpression']> {
  return getActiveBehaviorSystem().generateSurprisedExpression(...args);
}
export function generateFearExpression(
  ...args: Parameters<BehaviorSystem['generateFearExpression']>
): ReturnType<BehaviorSystem['generateFearExpression']> {
  return getActiveBehaviorSystem().generateFearExpression(...args);
}
export function generateAngerExpression(
  ...args: Parameters<BehaviorSystem['generateAngerExpression']>
): ReturnType<BehaviorSystem['generateAngerExpression']> {
  return getActiveBehaviorSystem().generateAngerExpression(...args);
}
export function generateSadnessExpression(
  ...args: Parameters<BehaviorSystem['generateSadnessExpression']>
): ReturnType<BehaviorSystem['generateSadnessExpression']> {
  return getActiveBehaviorSystem().generateSadnessExpression(...args);
}
export function generateDisgustExpression(
  ...args: Parameters<BehaviorSystem['generateDisgustExpression']>
): ReturnType<BehaviorSystem['generateDisgustExpression']> {
  return getActiveBehaviorSystem().generateDisgustExpression(...args);
}
export function generateConfusionExpression(
  ...args: Parameters<BehaviorSystem['generateConfusionExpression']>
): ReturnType<BehaviorSystem['generateConfusionExpression']> {
  return getActiveBehaviorSystem().generateConfusionExpression(...args);
}
export function generateContemptExpression(
  ...args: Parameters<BehaviorSystem['generateContemptExpression']>
): ReturnType<BehaviorSystem['generateContemptExpression']> {
  return getActiveBehaviorSystem().generateContemptExpression(...args);
}
export function controlEyebrowMovement(
  ...args: Parameters<BehaviorSystem['controlEyebrowMovement']>
): ReturnType<BehaviorSystem['controlEyebrowMovement']> {
  return getActiveBehaviorSystem().controlEyebrowMovement(...args);
}
export function controlEyelidMovement(
  ...args: Parameters<BehaviorSystem['controlEyelidMovement']>
): ReturnType<BehaviorSystem['controlEyelidMovement']> {
  return getActiveBehaviorSystem().controlEyelidMovement(...args);
}
export function controlPupilDirection(
  ...args: Parameters<BehaviorSystem['controlPupilDirection']>
): ReturnType<BehaviorSystem['controlPupilDirection']> {
  return getActiveBehaviorSystem().controlPupilDirection(...args);
}
export function generateEyeContact(
  ...args: Parameters<BehaviorSystem['generateEyeContact']>
): ReturnType<BehaviorSystem['generateEyeContact']> {
  return getActiveBehaviorSystem().generateEyeContact(...args);
}
export function avoidEyeContact(
  ...args: Parameters<BehaviorSystem['avoidEyeContact']>
): ReturnType<BehaviorSystem['avoidEyeContact']> {
  return getActiveBehaviorSystem().avoidEyeContact(...args);
}
export function generateNaturalBlink(
  ...args: Parameters<BehaviorSystem['generateNaturalBlink']>
): ReturnType<BehaviorSystem['generateNaturalBlink']> {
  return getActiveBehaviorSystem().generateNaturalBlink(...args);
}
export function synchronizeLipMovement(
  ...args: Parameters<BehaviorSystem['synchronizeLipMovement']>
): ReturnType<BehaviorSystem['synchronizeLipMovement']> {
  return getActiveBehaviorSystem().synchronizeLipMovement(...args);
}
export function blendFacialExpressions(
  ...args: Parameters<BehaviorSystem['blendFacialExpressions']>
): ReturnType<BehaviorSystem['blendFacialExpressions']> {
  return getActiveBehaviorSystem().blendFacialExpressions(...args);
}
export function maskFacialEmotion(
  ...args: Parameters<BehaviorSystem['maskFacialEmotion']>
): ReturnType<BehaviorSystem['maskFacialEmotion']> {
  return getActiveBehaviorSystem().maskFacialEmotion(...args);
}
export function synchronizeFaceWithEmotion(
  ...args: Parameters<BehaviorSystem['synchronizeFaceWithEmotion']>
): ReturnType<BehaviorSystem['synchronizeFaceWithEmotion']> {
  return getActiveBehaviorSystem().synchronizeFaceWithEmotion(...args);
}
export function updateBodyPosture(
  ...args: Parameters<BehaviorSystem['updateBodyPosture']>
): ReturnType<BehaviorSystem['updateBodyPosture']> {
  return getActiveBehaviorSystem().updateBodyPosture(...args);
}
export function generateConfidentPosture(
  ...args: Parameters<BehaviorSystem['generateConfidentPosture']>
): ReturnType<BehaviorSystem['generateConfidentPosture']> {
  return getActiveBehaviorSystem().generateConfidentPosture(...args);
}
export function generateDefensivePosture(
  ...args: Parameters<BehaviorSystem['generateDefensivePosture']>
): ReturnType<BehaviorSystem['generateDefensivePosture']> {
  return getActiveBehaviorSystem().generateDefensivePosture(...args);
}
export function generateRelaxedPosture(
  ...args: Parameters<BehaviorSystem['generateRelaxedPosture']>
): ReturnType<BehaviorSystem['generateRelaxedPosture']> {
  return getActiveBehaviorSystem().generateRelaxedPosture(...args);
}
export function generateTensePosture(
  ...args: Parameters<BehaviorSystem['generateTensePosture']>
): ReturnType<BehaviorSystem['generateTensePosture']> {
  return getActiveBehaviorSystem().generateTensePosture(...args);
}
export function generateSubmissivePosture(
  ...args: Parameters<BehaviorSystem['generateSubmissivePosture']>
): ReturnType<BehaviorSystem['generateSubmissivePosture']> {
  return getActiveBehaviorSystem().generateSubmissivePosture(...args);
}
export function generateDominantPosture(
  ...args: Parameters<BehaviorSystem['generateDominantPosture']>
): ReturnType<BehaviorSystem['generateDominantPosture']> {
  return getActiveBehaviorSystem().generateDominantPosture(...args);
}
export function crossArms(
  ...args: Parameters<BehaviorSystem['crossArms']>
): ReturnType<BehaviorSystem['crossArms']> {
  return getActiveBehaviorSystem().crossArms(...args);
}
export function shiftBodyWeight(
  ...args: Parameters<BehaviorSystem['shiftBodyWeight']>
): ReturnType<BehaviorSystem['shiftBodyWeight']> {
  return getActiveBehaviorSystem().shiftBodyWeight(...args);
}
export function adjustSittingPosition(
  ...args: Parameters<BehaviorSystem['adjustSittingPosition']>
): ReturnType<BehaviorSystem['adjustSittingPosition']> {
  return getActiveBehaviorSystem().adjustSittingPosition(...args);
}
export function adjustStandingPosition(
  ...args: Parameters<BehaviorSystem['adjustStandingPosition']>
): ReturnType<BehaviorSystem['adjustStandingPosition']> {
  return getActiveBehaviorSystem().adjustStandingPosition(...args);
}
export function generateNervousFidgeting(
  ...args: Parameters<BehaviorSystem['generateNervousFidgeting']>
): ReturnType<BehaviorSystem['generateNervousFidgeting']> {
  return getActiveBehaviorSystem().generateNervousFidgeting(...args);
}
export function generateHandGesture(
  ...args: Parameters<BehaviorSystem['generateHandGesture']>
): ReturnType<BehaviorSystem['generateHandGesture']> {
  return getActiveBehaviorSystem().generateHandGesture(...args);
}
export function generateHeadGesture(
  ...args: Parameters<BehaviorSystem['generateHeadGesture']>
): ReturnType<BehaviorSystem['generateHeadGesture']> {
  return getActiveBehaviorSystem().generateHeadGesture(...args);
}
export function nodInAgreement(
  ...args: Parameters<BehaviorSystem['nodInAgreement']>
): ReturnType<BehaviorSystem['nodInAgreement']> {
  return getActiveBehaviorSystem().nodInAgreement(...args);
}
export function shakeHeadInDisagreement(
  ...args: Parameters<BehaviorSystem['shakeHeadInDisagreement']>
): ReturnType<BehaviorSystem['shakeHeadInDisagreement']> {
  return getActiveBehaviorSystem().shakeHeadInDisagreement(...args);
}
export function regulateInterpersonalDistance(
  ...args: Parameters<BehaviorSystem['regulateInterpersonalDistance']>
): ReturnType<BehaviorSystem['regulateInterpersonalDistance']> {
  return getActiveBehaviorSystem().regulateInterpersonalDistance(...args);
}
export function mirrorBodyLanguage(
  ...args: Parameters<BehaviorSystem['mirrorBodyLanguage']>
): ReturnType<BehaviorSystem['mirrorBodyLanguage']> {
  return getActiveBehaviorSystem().mirrorBodyLanguage(...args);
}
export function synchronizeBodyMovement(
  ...args: Parameters<BehaviorSystem['synchronizeBodyMovement']>
): ReturnType<BehaviorSystem['synchronizeBodyMovement']> {
  return getActiveBehaviorSystem().synchronizeBodyMovement(...args);
}
export function expressEmotionThroughPosture(
  ...args: Parameters<BehaviorSystem['expressEmotionThroughPosture']>
): ReturnType<BehaviorSystem['expressEmotionThroughPosture']> {
  return getActiveBehaviorSystem().expressEmotionThroughPosture(...args);
}
export function identifySocialGroup(
  ...args: Parameters<BehaviorSystem['identifySocialGroup']>
): ReturnType<BehaviorSystem['identifySocialGroup']> {
  return getActiveBehaviorSystem().identifySocialGroup(...args);
}
export function joinSocialGroup(
  ...args: Parameters<BehaviorSystem['joinSocialGroup']>
): ReturnType<BehaviorSystem['joinSocialGroup']> {
  return getActiveBehaviorSystem().joinSocialGroup(...args);
}
export function leaveSocialGroup(
  ...args: Parameters<BehaviorSystem['leaveSocialGroup']>
): ReturnType<BehaviorSystem['leaveSocialGroup']> {
  return getActiveBehaviorSystem().leaveSocialGroup(...args);
}
export function establishSocialRole(
  ...args: Parameters<BehaviorSystem['establishSocialRole']>
): ReturnType<BehaviorSystem['establishSocialRole']> {
  return getActiveBehaviorSystem().establishSocialRole(...args);
}
export function recognizeSocialHierarchy(
  ...args: Parameters<BehaviorSystem['recognizeSocialHierarchy']>
): ReturnType<BehaviorSystem['recognizeSocialHierarchy']> {
  return getActiveBehaviorSystem().recognizeSocialHierarchy(...args);
}
export function negotiateSocialStatus(
  ...args: Parameters<BehaviorSystem['negotiateSocialStatus']>
): ReturnType<BehaviorSystem['negotiateSocialStatus']> {
  return getActiveBehaviorSystem().negotiateSocialStatus(...args);
}
export function seekSocialApproval(
  ...args: Parameters<BehaviorSystem['seekSocialApproval']>
): ReturnType<BehaviorSystem['seekSocialApproval']> {
  return getActiveBehaviorSystem().seekSocialApproval(...args);
}
export function avoidSocialRejection(
  ...args: Parameters<BehaviorSystem['avoidSocialRejection']>
): ReturnType<BehaviorSystem['avoidSocialRejection']> {
  return getActiveBehaviorSystem().avoidSocialRejection(...args);
}
export function followGroupNorms(
  ...args: Parameters<BehaviorSystem['followGroupNorms']>
): ReturnType<BehaviorSystem['followGroupNorms']> {
  return getActiveBehaviorSystem().followGroupNorms(...args);
}
export function challengeGroupNorms(
  ...args: Parameters<BehaviorSystem['challengeGroupNorms']>
): ReturnType<BehaviorSystem['challengeGroupNorms']> {
  return getActiveBehaviorSystem().challengeGroupNorms(...args);
}
export function conformToPeerPressure(
  ...args: Parameters<BehaviorSystem['conformToPeerPressure']>
): ReturnType<BehaviorSystem['conformToPeerPressure']> {
  return getActiveBehaviorSystem().conformToPeerPressure(...args);
}
export function resistPeerPressure(
  ...args: Parameters<BehaviorSystem['resistPeerPressure']>
): ReturnType<BehaviorSystem['resistPeerPressure']> {
  return getActiveBehaviorSystem().resistPeerPressure(...args);
}
export function buildSocialAlliance(
  ...args: Parameters<BehaviorSystem['buildSocialAlliance']>
): ReturnType<BehaviorSystem['buildSocialAlliance']> {
  return getActiveBehaviorSystem().buildSocialAlliance(...args);
}
export function maintainSocialReputation(
  ...args: Parameters<BehaviorSystem['maintainSocialReputation']>
): ReturnType<BehaviorSystem['maintainSocialReputation']> {
  return getActiveBehaviorSystem().maintainSocialReputation(...args);
}
export function exchangeSocialInformation(
  ...args: Parameters<BehaviorSystem['exchangeSocialInformation']>
): ReturnType<BehaviorSystem['exchangeSocialInformation']> {
  return getActiveBehaviorSystem().exchangeSocialInformation(...args);
}
export function coordinateGroupAction(
  ...args: Parameters<BehaviorSystem['coordinateGroupAction']>
): ReturnType<BehaviorSystem['coordinateGroupAction']> {
  return getActiveBehaviorSystem().coordinateGroupAction(...args);
}
export function resolveGroupDisagreement(
  ...args: Parameters<BehaviorSystem['resolveGroupDisagreement']>
): ReturnType<BehaviorSystem['resolveGroupDisagreement']> {
  return getActiveBehaviorSystem().resolveGroupDisagreement(...args);
}
export function respondToSocialExclusion(
  ...args: Parameters<BehaviorSystem['respondToSocialExclusion']>
): ReturnType<BehaviorSystem['respondToSocialExclusion']> {
  return getActiveBehaviorSystem().respondToSocialExclusion(...args);
}
export function recognizeGroupMembership(
  ...args: Parameters<BehaviorSystem['recognizeGroupMembership']>
): ReturnType<BehaviorSystem['recognizeGroupMembership']> {
  return getActiveBehaviorSystem().recognizeGroupMembership(...args);
}
export function adaptToSocialContext(
  ...args: Parameters<BehaviorSystem['adaptToSocialContext']>
): ReturnType<BehaviorSystem['adaptToSocialContext']> {
  return getActiveBehaviorSystem().adaptToSocialContext(...args);
}
export function initiateCooperation(
  ...args: Parameters<BehaviorSystem['initiateCooperation']>
): ReturnType<BehaviorSystem['initiateCooperation']> {
  return getActiveBehaviorSystem().initiateCooperation(...args);
}
export function maintainCooperation(
  ...args: Parameters<BehaviorSystem['maintainCooperation']>
): ReturnType<BehaviorSystem['maintainCooperation']> {
  return getActiveBehaviorSystem().maintainCooperation(...args);
}
export function evaluatePartnerReliability(
  ...args: Parameters<BehaviorSystem['evaluatePartnerReliability']>
): ReturnType<BehaviorSystem['evaluatePartnerReliability']> {
  return getActiveBehaviorSystem().evaluatePartnerReliability(...args);
}
export function shareTaskResponsibility(
  ...args: Parameters<BehaviorSystem['shareTaskResponsibility']>
): ReturnType<BehaviorSystem['shareTaskResponsibility']> {
  return getActiveBehaviorSystem().shareTaskResponsibility(...args);
}
export function coordinateJointTask(
  ...args: Parameters<BehaviorSystem['coordinateJointTask']>
): ReturnType<BehaviorSystem['coordinateJointTask']> {
  return getActiveBehaviorSystem().coordinateJointTask(...args);
}
export function negotiateResourceExchange(
  ...args: Parameters<BehaviorSystem['negotiateResourceExchange']>
): ReturnType<BehaviorSystem['negotiateResourceExchange']> {
  return getActiveBehaviorSystem().negotiateResourceExchange(...args);
}
export function offerTradeProposal(
  ...args: Parameters<BehaviorSystem['offerTradeProposal']>
): ReturnType<BehaviorSystem['offerTradeProposal']> {
  return getActiveBehaviorSystem().offerTradeProposal(...args);
}
export function evaluateTradeFairness(
  ...args: Parameters<BehaviorSystem['evaluateTradeFairness']>
): ReturnType<BehaviorSystem['evaluateTradeFairness']> {
  return getActiveBehaviorSystem().evaluateTradeFairness(...args);
}
export function detectFreeRiding(
  ...args: Parameters<BehaviorSystem['detectFreeRiding']>
): ReturnType<BehaviorSystem['detectFreeRiding']> {
  return getActiveBehaviorSystem().detectFreeRiding(...args);
}
export function respondToUnfairTreatment(
  ...args: Parameters<BehaviorSystem['respondToUnfairTreatment']>
): ReturnType<BehaviorSystem['respondToUnfairTreatment']> {
  return getActiveBehaviorSystem().respondToUnfairTreatment(...args);
}
export function initiateCompetition(
  ...args: Parameters<BehaviorSystem['initiateCompetition']>
): ReturnType<BehaviorSystem['initiateCompetition']> {
  return getActiveBehaviorSystem().initiateCompetition(...args);
}
export function estimateCompetitorAbility(
  ...args: Parameters<BehaviorSystem['estimateCompetitorAbility']>
): ReturnType<BehaviorSystem['estimateCompetitorAbility']> {
  return getActiveBehaviorSystem().estimateCompetitorAbility(...args);
}
export function adjustCompetitiveStrategy(
  ...args: Parameters<BehaviorSystem['adjustCompetitiveStrategy']>
): ReturnType<BehaviorSystem['adjustCompetitiveStrategy']> {
  return getActiveBehaviorSystem().adjustCompetitiveStrategy(...args);
}
export function concedeCompetitiveAdvantage(
  ...args: Parameters<BehaviorSystem['concedeCompetitiveAdvantage']>
): ReturnType<BehaviorSystem['concedeCompetitiveAdvantage']> {
  return getActiveBehaviorSystem().concedeCompetitiveAdvantage(...args);
}
export function celebrateSharedSuccess(
  ...args: Parameters<BehaviorSystem['celebrateSharedSuccess']>
): ReturnType<BehaviorSystem['celebrateSharedSuccess']> {
  return getActiveBehaviorSystem().celebrateSharedSuccess(...args);
}
export function shareCreditForAchievement(
  ...args: Parameters<BehaviorSystem['shareCreditForAchievement']>
): ReturnType<BehaviorSystem['shareCreditForAchievement']> {
  return getActiveBehaviorSystem().shareCreditForAchievement(...args);
}
export function resolveResourceConflict(
  ...args: Parameters<BehaviorSystem['resolveResourceConflict']>
): ReturnType<BehaviorSystem['resolveResourceConflict']> {
  return getActiveBehaviorSystem().resolveResourceConflict(...args);
}
export function buildReciprocalTrust(
  ...args: Parameters<BehaviorSystem['buildReciprocalTrust']>
): ReturnType<BehaviorSystem['buildReciprocalTrust']> {
  return getActiveBehaviorSystem().buildReciprocalTrust(...args);
}
export function rememberSocialExchange(
  ...args: Parameters<BehaviorSystem['rememberSocialExchange']>
): ReturnType<BehaviorSystem['rememberSocialExchange']> {
  return getActiveBehaviorSystem().rememberSocialExchange(...args);
}
export function updateCooperationPreference(
  ...args: Parameters<BehaviorSystem['updateCooperationPreference']>
): ReturnType<BehaviorSystem['updateCooperationPreference']> {
  return getActiveBehaviorSystem().updateCooperationPreference(...args);
}
export function evaluateMoralRule(
  ...args: Parameters<BehaviorSystem['evaluateMoralRule']>
): ReturnType<BehaviorSystem['evaluateMoralRule']> {
  return getActiveBehaviorSystem().evaluateMoralRule(...args);
}
export function recognizeMoralViolation(
  ...args: Parameters<BehaviorSystem['recognizeMoralViolation']>
): ReturnType<BehaviorSystem['recognizeMoralViolation']> {
  return getActiveBehaviorSystem().recognizeMoralViolation(...args);
}
export function evaluateFairness(
  ...args: Parameters<BehaviorSystem['evaluateFairness']>
): ReturnType<BehaviorSystem['evaluateFairness']> {
  return getActiveBehaviorSystem().evaluateFairness(...args);
}
export function evaluateHonesty(
  ...args: Parameters<BehaviorSystem['evaluateHonesty']>
): ReturnType<BehaviorSystem['evaluateHonesty']> {
  return getActiveBehaviorSystem().evaluateHonesty(...args);
}
export function evaluateIntentions(
  ...args: Parameters<BehaviorSystem['evaluateIntentions']>
): ReturnType<BehaviorSystem['evaluateIntentions']> {
  return getActiveBehaviorSystem().evaluateIntentions(...args);
}
export function evaluateConsequencesMorally(
  ...args: Parameters<BehaviorSystem['evaluateConsequencesMorally']>
): ReturnType<BehaviorSystem['evaluateConsequencesMorally']> {
  return getActiveBehaviorSystem().evaluateConsequencesMorally(...args);
}
export function experienceMoralConflict(
  ...args: Parameters<BehaviorSystem['experienceMoralConflict']>
): ReturnType<BehaviorSystem['experienceMoralConflict']> {
  return getActiveBehaviorSystem().experienceMoralConflict(...args);
}
export function followInternalizedNorm(
  ...args: Parameters<BehaviorSystem['followInternalizedNorm']>
): ReturnType<BehaviorSystem['followInternalizedNorm']> {
  return getActiveBehaviorSystem().followInternalizedNorm(...args);
}
export function questionAuthority(
  ...args: Parameters<BehaviorSystem['questionAuthority']>
): ReturnType<BehaviorSystem['questionAuthority']> {
  return getActiveBehaviorSystem().questionAuthority(...args);
}
export function obeyLegitimateAuthority(
  ...args: Parameters<BehaviorSystem['obeyLegitimateAuthority']>
): ReturnType<BehaviorSystem['obeyLegitimateAuthority']> {
  return getActiveBehaviorSystem().obeyLegitimateAuthority(...args);
}
export function refuseUnethicalRequest(
  ...args: Parameters<BehaviorSystem['refuseUnethicalRequest']>
): ReturnType<BehaviorSystem['refuseUnethicalRequest']> {
  return getActiveBehaviorSystem().refuseUnethicalRequest(...args);
}
export function admitWrongdoing(
  ...args: Parameters<BehaviorSystem['admitWrongdoing']>
): ReturnType<BehaviorSystem['admitWrongdoing']> {
  return getActiveBehaviorSystem().admitWrongdoing(...args);
}
export function apologizeSincerely(
  ...args: Parameters<BehaviorSystem['apologizeSincerely']>
): ReturnType<BehaviorSystem['apologizeSincerely']> {
  return getActiveBehaviorSystem().apologizeSincerely(...args);
}
export function makeAmends(
  ...args: Parameters<BehaviorSystem['makeAmends']>
): ReturnType<BehaviorSystem['makeAmends']> {
  return getActiveBehaviorSystem().makeAmends(...args);
}
export function assignMoralResponsibility(
  ...args: Parameters<BehaviorSystem['assignMoralResponsibility']>
): ReturnType<BehaviorSystem['assignMoralResponsibility']> {
  return getActiveBehaviorSystem().assignMoralResponsibility(...args);
}
export function judgeIntentVersusOutcome(
  ...args: Parameters<BehaviorSystem['judgeIntentVersusOutcome']>
): ReturnType<BehaviorSystem['judgeIntentVersusOutcome']> {
  return getActiveBehaviorSystem().judgeIntentVersusOutcome(...args);
}
export function applyCulturalNorm(
  ...args: Parameters<BehaviorSystem['applyCulturalNorm']>
): ReturnType<BehaviorSystem['applyCulturalNorm']> {
  return getActiveBehaviorSystem().applyCulturalNorm(...args);
}
export function adaptMoralJudgmentToContext(
  ...args: Parameters<BehaviorSystem['adaptMoralJudgmentToContext']>
): ReturnType<BehaviorSystem['adaptMoralJudgmentToContext']> {
  return getActiveBehaviorSystem().adaptMoralJudgmentToContext(...args);
}
export function resolveEthicalDilemma(
  ...args: Parameters<BehaviorSystem['resolveEthicalDilemma']>
): ReturnType<BehaviorSystem['resolveEthicalDilemma']> {
  return getActiveBehaviorSystem().resolveEthicalDilemma(...args);
}
export function learnSocialNorms(
  ...args: Parameters<BehaviorSystem['learnSocialNorms']>
): ReturnType<BehaviorSystem['learnSocialNorms']> {
  return getActiveBehaviorSystem().learnSocialNorms(...args);
}
export function initializePersonalityProfile(
  ...args: Parameters<BehaviorSystem['initializePersonalityProfile']>
): ReturnType<BehaviorSystem['initializePersonalityProfile']> {
  return getActiveBehaviorSystem().initializePersonalityProfile(...args);
}
export function updatePersonalityTrait(
  ...args: Parameters<BehaviorSystem['updatePersonalityTrait']>
): ReturnType<BehaviorSystem['updatePersonalityTrait']> {
  return getActiveBehaviorSystem().updatePersonalityTrait(...args);
}
export function estimateIntroversionLevel(
  ...args: Parameters<BehaviorSystem['estimateIntroversionLevel']>
): ReturnType<BehaviorSystem['estimateIntroversionLevel']> {
  return getActiveBehaviorSystem().estimateIntroversionLevel(...args);
}
export function estimateExtraversionLevel(
  ...args: Parameters<BehaviorSystem['estimateExtraversionLevel']>
): ReturnType<BehaviorSystem['estimateExtraversionLevel']> {
  return getActiveBehaviorSystem().estimateExtraversionLevel(...args);
}
export function estimateOpennessLevel(
  ...args: Parameters<BehaviorSystem['estimateOpennessLevel']>
): ReturnType<BehaviorSystem['estimateOpennessLevel']> {
  return getActiveBehaviorSystem().estimateOpennessLevel(...args);
}
export function estimateConscientiousnessLevel(
  ...args: Parameters<BehaviorSystem['estimateConscientiousnessLevel']>
): ReturnType<BehaviorSystem['estimateConscientiousnessLevel']> {
  return getActiveBehaviorSystem().estimateConscientiousnessLevel(...args);
}
export function estimateAgreeablenessLevel(
  ...args: Parameters<BehaviorSystem['estimateAgreeablenessLevel']>
): ReturnType<BehaviorSystem['estimateAgreeablenessLevel']> {
  return getActiveBehaviorSystem().estimateAgreeablenessLevel(...args);
}
export function estimateEmotionalStability(
  ...args: Parameters<BehaviorSystem['estimateEmotionalStability']>
): ReturnType<BehaviorSystem['estimateEmotionalStability']> {
  return getActiveBehaviorSystem().estimateEmotionalStability(...args);
}
export function formBehavioralHabit(
  ...args: Parameters<BehaviorSystem['formBehavioralHabit']>
): ReturnType<BehaviorSystem['formBehavioralHabit']> {
  return getActiveBehaviorSystem().formBehavioralHabit(...args);
}
export function reinforceBehavioralHabit(
  ...args: Parameters<BehaviorSystem['reinforceBehavioralHabit']>
): ReturnType<BehaviorSystem['reinforceBehavioralHabit']> {
  return getActiveBehaviorSystem().reinforceBehavioralHabit(...args);
}
export function breakBehavioralHabit(
  ...args: Parameters<BehaviorSystem['breakBehavioralHabit']>
): ReturnType<BehaviorSystem['breakBehavioralHabit']> {
  return getActiveBehaviorSystem().breakBehavioralHabit(...args);
}
export function triggerHabitRoutine(
  ...args: Parameters<BehaviorSystem['triggerHabitRoutine']>
): ReturnType<BehaviorSystem['triggerHabitRoutine']> {
  return getActiveBehaviorSystem().triggerHabitRoutine(...args);
}
export function adaptHabitToContext(
  ...args: Parameters<BehaviorSystem['adaptHabitToContext']>
): ReturnType<BehaviorSystem['adaptHabitToContext']> {
  return getActiveBehaviorSystem().adaptHabitToContext(...args);
}
export function estimateRiskTolerance(
  ...args: Parameters<BehaviorSystem['estimateRiskTolerance']>
): ReturnType<BehaviorSystem['estimateRiskTolerance']> {
  return getActiveBehaviorSystem().estimateRiskTolerance(...args);
}
export function estimateNoveltyPreference(
  ...args: Parameters<BehaviorSystem['estimateNoveltyPreference']>
): ReturnType<BehaviorSystem['estimateNoveltyPreference']> {
  return getActiveBehaviorSystem().estimateNoveltyPreference(...args);
}
export function estimateSocialPreference(
  ...args: Parameters<BehaviorSystem['estimateSocialPreference']>
): ReturnType<BehaviorSystem['estimateSocialPreference']> {
  return getActiveBehaviorSystem().estimateSocialPreference(...args);
}
export function estimateConflictTolerance(
  ...args: Parameters<BehaviorSystem['estimateConflictTolerance']>
): ReturnType<BehaviorSystem['estimateConflictTolerance']> {
  return getActiveBehaviorSystem().estimateConflictTolerance(...args);
}
export function estimateImpulseControl(
  ...args: Parameters<BehaviorSystem['estimateImpulseControl']>
): ReturnType<BehaviorSystem['estimateImpulseControl']> {
  return getActiveBehaviorSystem().estimateImpulseControl(...args);
}
export function maintainPersonalityConsistency(
  ...args: Parameters<BehaviorSystem['maintainPersonalityConsistency']>
): ReturnType<BehaviorSystem['maintainPersonalityConsistency']> {
  return getActiveBehaviorSystem().maintainPersonalityConsistency(...args);
}
export function adaptPersonalityExpression(
  ...args: Parameters<BehaviorSystem['adaptPersonalityExpression']>
): ReturnType<BehaviorSystem['adaptPersonalityExpression']> {
  return getActiveBehaviorSystem().adaptPersonalityExpression(...args);
}
export function detectStressTrigger(
  ...args: Parameters<BehaviorSystem['detectStressTrigger']>
): ReturnType<BehaviorSystem['detectStressTrigger']> {
  return getActiveBehaviorSystem().detectStressTrigger(...args);
}
export function estimateStressLevel(
  ...args: Parameters<BehaviorSystem['estimateStressLevel']>
): ReturnType<BehaviorSystem['estimateStressLevel']> {
  return getActiveBehaviorSystem().estimateStressLevel(...args);
}
export function activateStressResponse(
  ...args: Parameters<BehaviorSystem['activateStressResponse']>
): ReturnType<BehaviorSystem['activateStressResponse']> {
  return getActiveBehaviorSystem().activateStressResponse(...args);
}
export function updatePhysiologicalArousal(
  ...args: Parameters<BehaviorSystem['updatePhysiologicalArousal']>
): ReturnType<BehaviorSystem['updatePhysiologicalArousal']> {
  return getActiveBehaviorSystem().updatePhysiologicalArousal(...args);
}
export function increaseHeartRateUnderStress(
  ...args: Parameters<BehaviorSystem['increaseHeartRateUnderStress']>
): ReturnType<BehaviorSystem['increaseHeartRateUnderStress']> {
  return getActiveBehaviorSystem().increaseHeartRateUnderStress(...args);
}
export function regulateBreathingUnderStress(
  ...args: Parameters<BehaviorSystem['regulateBreathingUnderStress']>
): ReturnType<BehaviorSystem['regulateBreathingUnderStress']> {
  return getActiveBehaviorSystem().regulateBreathingUnderStress(...args);
}
export function generateStressSweating(
  ...args: Parameters<BehaviorSystem['generateStressSweating']>
): ReturnType<BehaviorSystem['generateStressSweating']> {
  return getActiveBehaviorSystem().generateStressSweating(...args);
}
export function detectStressOverload(
  ...args: Parameters<BehaviorSystem['detectStressOverload']>
): ReturnType<BehaviorSystem['detectStressOverload']> {
  return getActiveBehaviorSystem().detectStressOverload(...args);
}
export function applyCopingStrategy(
  ...args: Parameters<BehaviorSystem['applyCopingStrategy']>
): ReturnType<BehaviorSystem['applyCopingStrategy']> {
  return getActiveBehaviorSystem().applyCopingStrategy(...args);
}
export function useProblemFocusedCoping(
  ...args: Parameters<BehaviorSystem['useProblemFocusedCoping']>
): ReturnType<BehaviorSystem['useProblemFocusedCoping']> {
  return getActiveBehaviorSystem().useProblemFocusedCoping(...args);
}
export function useEmotionFocusedCoping(
  ...args: Parameters<BehaviorSystem['useEmotionFocusedCoping']>
): ReturnType<BehaviorSystem['useEmotionFocusedCoping']> {
  return getActiveBehaviorSystem().useEmotionFocusedCoping(...args);
}
export function seekStressSupport(
  ...args: Parameters<BehaviorSystem['seekStressSupport']>
): ReturnType<BehaviorSystem['seekStressSupport']> {
  return getActiveBehaviorSystem().seekStressSupport(...args);
}
export function takeRecoveryBreak(
  ...args: Parameters<BehaviorSystem['takeRecoveryBreak']>
): ReturnType<BehaviorSystem['takeRecoveryBreak']> {
  return getActiveBehaviorSystem().takeRecoveryBreak(...args);
}
export function reframeStressfulSituation(
  ...args: Parameters<BehaviorSystem['reframeStressfulSituation']>
): ReturnType<BehaviorSystem['reframeStressfulSituation']> {
  return getActiveBehaviorSystem().reframeStressfulSituation(...args);
}
export function reducePhysiologicalArousal(
  ...args: Parameters<BehaviorSystem['reducePhysiologicalArousal']>
): ReturnType<BehaviorSystem['reducePhysiologicalArousal']> {
  return getActiveBehaviorSystem().reducePhysiologicalArousal(...args);
}
export function restoreCognitivePerformance(
  ...args: Parameters<BehaviorSystem['restoreCognitivePerformance']>
): ReturnType<BehaviorSystem['restoreCognitivePerformance']> {
  return getActiveBehaviorSystem().restoreCognitivePerformance(...args);
}
export function buildStressResilience(
  ...args: Parameters<BehaviorSystem['buildStressResilience']>
): ReturnType<BehaviorSystem['buildStressResilience']> {
  return getActiveBehaviorSystem().buildStressResilience(...args);
}
export function adaptToRepeatedStress(
  ...args: Parameters<BehaviorSystem['adaptToRepeatedStress']>
): ReturnType<BehaviorSystem['adaptToRepeatedStress']> {
  return getActiveBehaviorSystem().adaptToRepeatedStress(...args);
}
export function detectBurnoutRisk(
  ...args: Parameters<BehaviorSystem['detectBurnoutRisk']>
): ReturnType<BehaviorSystem['detectBurnoutRisk']> {
  return getActiveBehaviorSystem().detectBurnoutRisk(...args);
}
export function recoverFromProlongedStress(
  ...args: Parameters<BehaviorSystem['recoverFromProlongedStress']>
): ReturnType<BehaviorSystem['recoverFromProlongedStress']> {
  return getActiveBehaviorSystem().recoverFromProlongedStress(...args);
}
export function updateBiologicalNeeds(
  ...args: Parameters<BehaviorSystem['updateBiologicalNeeds']>
): ReturnType<BehaviorSystem['updateBiologicalNeeds']> {
  return getActiveBehaviorSystem().updateBiologicalNeeds(...args);
}
export function estimateHungerLevel(
  ...args: Parameters<BehaviorSystem['estimateHungerLevel']>
): ReturnType<BehaviorSystem['estimateHungerLevel']> {
  return getActiveBehaviorSystem().estimateHungerLevel(...args);
}
export function estimateThirstLevel(
  ...args: Parameters<BehaviorSystem['estimateThirstLevel']>
): ReturnType<BehaviorSystem['estimateThirstLevel']> {
  return getActiveBehaviorSystem().estimateThirstLevel(...args);
}
export function estimateFatigueLevel(
  ...args: Parameters<BehaviorSystem['estimateFatigueLevel']>
): ReturnType<BehaviorSystem['estimateFatigueLevel']> {
  return getActiveBehaviorSystem().estimateFatigueLevel(...args);
}
export function estimateSleepPressure(
  ...args: Parameters<BehaviorSystem['estimateSleepPressure']>
): ReturnType<BehaviorSystem['estimateSleepPressure']> {
  return getActiveBehaviorSystem().estimateSleepPressure(...args);
}
export function estimateBodyTemperature(
  ...args: Parameters<BehaviorSystem['estimateBodyTemperature']>
): ReturnType<BehaviorSystem['estimateBodyTemperature']> {
  return getActiveBehaviorSystem().estimateBodyTemperature(...args);
}
export function regulateBodyTemperature(
  ...args: Parameters<BehaviorSystem['regulateBodyTemperature']>
): ReturnType<BehaviorSystem['regulateBodyTemperature']> {
  return getActiveBehaviorSystem().regulateBodyTemperature(...args);
}
export function regulateFluidBalance(
  ...args: Parameters<BehaviorSystem['regulateFluidBalance']>
): ReturnType<BehaviorSystem['regulateFluidBalance']> {
  return getActiveBehaviorSystem().regulateFluidBalance(...args);
}
export function regulateEnergyBalance(
  ...args: Parameters<BehaviorSystem['regulateEnergyBalance']>
): ReturnType<BehaviorSystem['regulateEnergyBalance']> {
  return getActiveBehaviorSystem().regulateEnergyBalance(...args);
}
export function triggerHungerBehavior(
  ...args: Parameters<BehaviorSystem['triggerHungerBehavior']>
): ReturnType<BehaviorSystem['triggerHungerBehavior']> {
  return getActiveBehaviorSystem().triggerHungerBehavior(...args);
}
export function triggerThirstBehavior(
  ...args: Parameters<BehaviorSystem['triggerThirstBehavior']>
): ReturnType<BehaviorSystem['triggerThirstBehavior']> {
  return getActiveBehaviorSystem().triggerThirstBehavior(...args);
}
export function triggerRestBehavior(
  ...args: Parameters<BehaviorSystem['triggerRestBehavior']>
): ReturnType<BehaviorSystem['triggerRestBehavior']> {
  return getActiveBehaviorSystem().triggerRestBehavior(...args);
}
export function triggerSleepBehavior(
  ...args: Parameters<BehaviorSystem['triggerSleepBehavior']>
): ReturnType<BehaviorSystem['triggerSleepBehavior']> {
  return getActiveBehaviorSystem().triggerSleepBehavior(...args);
}
export function triggerThermoregulationBehavior(
  ...args: Parameters<BehaviorSystem['triggerThermoregulationBehavior']>
): ReturnType<BehaviorSystem['triggerThermoregulationBehavior']> {
  return getActiveBehaviorSystem().triggerThermoregulationBehavior(...args);
}
export function seekNutritionallyUsefulFood(
  ...args: Parameters<BehaviorSystem['seekNutritionallyUsefulFood']>
): ReturnType<BehaviorSystem['seekNutritionallyUsefulFood']> {
  return getActiveBehaviorSystem().seekNutritionallyUsefulFood(...args);
}
export function avoidSpoiledFood(
  ...args: Parameters<BehaviorSystem['avoidSpoiledFood']>
): ReturnType<BehaviorSystem['avoidSpoiledFood']> {
  return getActiveBehaviorSystem().avoidSpoiledFood(...args);
}
export function respondToPainSignal(
  ...args: Parameters<BehaviorSystem['respondToPainSignal']>
): ReturnType<BehaviorSystem['respondToPainSignal']> {
  return getActiveBehaviorSystem().respondToPainSignal(...args);
}
export function respondToNausea(
  ...args: Parameters<BehaviorSystem['respondToNausea']>
): ReturnType<BehaviorSystem['respondToNausea']> {
  return getActiveBehaviorSystem().respondToNausea(...args);
}
export function recoverEnergyAfterRest(
  ...args: Parameters<BehaviorSystem['recoverEnergyAfterRest']>
): ReturnType<BehaviorSystem['recoverEnergyAfterRest']> {
  return getActiveBehaviorSystem().recoverEnergyAfterRest(...args);
}
export function maintainHomeostasis(
  ...args: Parameters<BehaviorSystem['maintainHomeostasis']>
): ReturnType<BehaviorSystem['maintainHomeostasis']> {
  return getActiveBehaviorSystem().maintainHomeostasis(...args);
}
export function searchForFood(
  ...args: Parameters<BehaviorSystem['searchForFood']>
): ReturnType<BehaviorSystem['searchForFood']> {
  return getActiveBehaviorSystem().searchForFood(...args);
}
export function recognizeEdibleFood(
  ...args: Parameters<BehaviorSystem['recognizeEdibleFood']>
): ReturnType<BehaviorSystem['recognizeEdibleFood']> {
  return getActiveBehaviorSystem().recognizeEdibleFood(...args);
}
export function recognizeInedibleSubstance(
  ...args: Parameters<BehaviorSystem['recognizeInedibleSubstance']>
): ReturnType<BehaviorSystem['recognizeInedibleSubstance']> {
  return getActiveBehaviorSystem().recognizeInedibleSubstance(...args);
}
export function evaluateFoodSafety(
  ...args: Parameters<BehaviorSystem['evaluateFoodSafety']>
): ReturnType<BehaviorSystem['evaluateFoodSafety']> {
  return getActiveBehaviorSystem().evaluateFoodSafety(...args);
}
export function evaluateFoodPreference(
  ...args: Parameters<BehaviorSystem['evaluateFoodPreference']>
): ReturnType<BehaviorSystem['evaluateFoodPreference']> {
  return getActiveBehaviorSystem().evaluateFoodPreference(...args);
}
export function selectFoodItem(
  ...args: Parameters<BehaviorSystem['selectFoodItem']>
): ReturnType<BehaviorSystem['selectFoodItem']> {
  return getActiveBehaviorSystem().selectFoodItem(...args);
}
export function approachFoodSource(
  ...args: Parameters<BehaviorSystem['approachFoodSource']>
): ReturnType<BehaviorSystem['approachFoodSource']> {
  return getActiveBehaviorSystem().approachFoodSource(...args);
}
export function inspectFoodBySmell(
  ...args: Parameters<BehaviorSystem['inspectFoodBySmell']>
): ReturnType<BehaviorSystem['inspectFoodBySmell']> {
  return getActiveBehaviorSystem().inspectFoodBySmell(...args);
}
export function inspectFoodByAppearance(
  ...args: Parameters<BehaviorSystem['inspectFoodByAppearance']>
): ReturnType<BehaviorSystem['inspectFoodByAppearance']> {
  return getActiveBehaviorSystem().inspectFoodByAppearance(...args);
}
export function prepareFoodForConsumption(
  ...args: Parameters<BehaviorSystem['prepareFoodForConsumption']>
): ReturnType<BehaviorSystem['prepareFoodForConsumption']> {
  return getActiveBehaviorSystem().prepareFoodForConsumption(...args);
}
export function initiateEating(
  ...args: Parameters<BehaviorSystem['initiateEating']>
): ReturnType<BehaviorSystem['initiateEating']> {
  return getActiveBehaviorSystem().initiateEating(...args);
}
export function controlBiteSize(
  ...args: Parameters<BehaviorSystem['controlBiteSize']>
): ReturnType<BehaviorSystem['controlBiteSize']> {
  return getActiveBehaviorSystem().controlBiteSize(...args);
}
export function simulateChewing(
  ...args: Parameters<BehaviorSystem['simulateChewing']>
): ReturnType<BehaviorSystem['simulateChewing']> {
  return getActiveBehaviorSystem().simulateChewing(...args);
}
export function simulateSwallowing(
  ...args: Parameters<BehaviorSystem['simulateSwallowing']>
): ReturnType<BehaviorSystem['simulateSwallowing']> {
  return getActiveBehaviorSystem().simulateSwallowing(...args);
}
export function estimateSatietyLevel(
  ...args: Parameters<BehaviorSystem['estimateSatietyLevel']>
): ReturnType<BehaviorSystem['estimateSatietyLevel']> {
  return getActiveBehaviorSystem().estimateSatietyLevel(...args);
}
export function stopEatingWhenSatisfied(
  ...args: Parameters<BehaviorSystem['stopEatingWhenSatisfied']>
): ReturnType<BehaviorSystem['stopEatingWhenSatisfied']> {
  return getActiveBehaviorSystem().stopEatingWhenSatisfied(...args);
}
export function shareFoodWithOthers(
  ...args: Parameters<BehaviorSystem['shareFoodWithOthers']>
): ReturnType<BehaviorSystem['shareFoodWithOthers']> {
  return getActiveBehaviorSystem().shareFoodWithOthers(...args);
}
export function protectFoodResource(
  ...args: Parameters<BehaviorSystem['protectFoodResource']>
): ReturnType<BehaviorSystem['protectFoodResource']> {
  return getActiveBehaviorSystem().protectFoodResource(...args);
}
export function rememberFoodPreference(
  ...args: Parameters<BehaviorSystem['rememberFoodPreference']>
): ReturnType<BehaviorSystem['rememberFoodPreference']> {
  return getActiveBehaviorSystem().rememberFoodPreference(...args);
}
export function adaptDietToAvailability(
  ...args: Parameters<BehaviorSystem['adaptDietToAvailability']>
): ReturnType<BehaviorSystem['adaptDietToAvailability']> {
  return getActiveBehaviorSystem().adaptDietToAvailability(...args);
}
export function updateCircadianRhythm(
  ...args: Parameters<BehaviorSystem['updateCircadianRhythm']>
): ReturnType<BehaviorSystem['updateCircadianRhythm']> {
  return getActiveBehaviorSystem().updateCircadianRhythm(...args);
}
export function estimateSleepiness(
  ...args: Parameters<BehaviorSystem['estimateSleepiness']>
): ReturnType<BehaviorSystem['estimateSleepiness']> {
  return getActiveBehaviorSystem().estimateSleepiness(...args);
}
export function selectSleepLocation(
  ...args: Parameters<BehaviorSystem['selectSleepLocation']>
): ReturnType<BehaviorSystem['selectSleepLocation']> {
  return getActiveBehaviorSystem().selectSleepLocation(...args);
}
export function prepareForSleep(
  ...args: Parameters<BehaviorSystem['prepareForSleep']>
): ReturnType<BehaviorSystem['prepareForSleep']> {
  return getActiveBehaviorSystem().prepareForSleep(...args);
}
export function initiateSleep(
  ...args: Parameters<BehaviorSystem['initiateSleep']>
): ReturnType<BehaviorSystem['initiateSleep']> {
  return getActiveBehaviorSystem().initiateSleep(...args);
}
export function transitionSleepStage(
  ...args: Parameters<BehaviorSystem['transitionSleepStage']>
): ReturnType<BehaviorSystem['transitionSleepStage']> {
  return getActiveBehaviorSystem().transitionSleepStage(...args);
}
export function simulateDeepSleep(
  ...args: Parameters<BehaviorSystem['simulateDeepSleep']>
): ReturnType<BehaviorSystem['simulateDeepSleep']> {
  return getActiveBehaviorSystem().simulateDeepSleep(...args);
}
export function simulateRapidEyeMovementSleep(
  ...args: Parameters<BehaviorSystem['simulateRapidEyeMovementSleep']>
): ReturnType<BehaviorSystem['simulateRapidEyeMovementSleep']> {
  return getActiveBehaviorSystem().simulateRapidEyeMovementSleep(...args);
}
export function simulateDreamActivity(
  ...args: Parameters<BehaviorSystem['simulateDreamActivity']>
): ReturnType<BehaviorSystem['simulateDreamActivity']> {
  return getActiveBehaviorSystem().simulateDreamActivity(...args);
}
export function respondToSleepDisturbance(
  ...args: Parameters<BehaviorSystem['respondToSleepDisturbance']>
): ReturnType<BehaviorSystem['respondToSleepDisturbance']> {
  return getActiveBehaviorSystem().respondToSleepDisturbance(...args);
}
export function wakeFromSleep(
  ...args: Parameters<BehaviorSystem['wakeFromSleep']>
): ReturnType<BehaviorSystem['wakeFromSleep']> {
  return getActiveBehaviorSystem().wakeFromSleep(...args);
}
export function estimateSleepQuality(
  ...args: Parameters<BehaviorSystem['estimateSleepQuality']>
): ReturnType<BehaviorSystem['estimateSleepQuality']> {
  return getActiveBehaviorSystem().estimateSleepQuality(...args);
}
export function recoverFromSleepDebt(
  ...args: Parameters<BehaviorSystem['recoverFromSleepDebt']>
): ReturnType<BehaviorSystem['recoverFromSleepDebt']> {
  return getActiveBehaviorSystem().recoverFromSleepDebt(...args);
}
export function takeShortNap(
  ...args: Parameters<BehaviorSystem['takeShortNap']>
): ReturnType<BehaviorSystem['takeShortNap']> {
  return getActiveBehaviorSystem().takeShortNap(...args);
}
export function adaptSleepSchedule(
  ...args: Parameters<BehaviorSystem['adaptSleepSchedule']>
): ReturnType<BehaviorSystem['adaptSleepSchedule']> {
  return getActiveBehaviorSystem().adaptSleepSchedule(...args);
}
export function seekQuietRestingPlace(
  ...args: Parameters<BehaviorSystem['seekQuietRestingPlace']>
): ReturnType<BehaviorSystem['seekQuietRestingPlace']> {
  return getActiveBehaviorSystem().seekQuietRestingPlace(...args);
}
export function chooseComfortableSleepingPosture(
  ...args: Parameters<BehaviorSystem['chooseComfortableSleepingPosture']>
): ReturnType<BehaviorSystem['chooseComfortableSleepingPosture']> {
  return getActiveBehaviorSystem().chooseComfortableSleepingPosture(...args);
}
export function respondToNighttimeNoise(
  ...args: Parameters<BehaviorSystem['respondToNighttimeNoise']>
): ReturnType<BehaviorSystem['respondToNighttimeNoise']> {
  return getActiveBehaviorSystem().respondToNighttimeNoise(...args);
}
export function adjustActivityToDaylight(
  ...args: Parameters<BehaviorSystem['adjustActivityToDaylight']>
): ReturnType<BehaviorSystem['adjustActivityToDaylight']> {
  return getActiveBehaviorSystem().adjustActivityToDaylight(...args);
}
export function synchronizeSleepWithEnvironment(
  ...args: Parameters<BehaviorSystem['synchronizeSleepWithEnvironment']>
): ReturnType<BehaviorSystem['synchronizeSleepWithEnvironment']> {
  return getActiveBehaviorSystem().synchronizeSleepWithEnvironment(...args);
}
export function initiateLocomotion(
  ...args: Parameters<BehaviorSystem['initiateLocomotion']>
): ReturnType<BehaviorSystem['initiateLocomotion']> {
  return getActiveBehaviorSystem().initiateLocomotion(...args);
}
export function selectWalkingDirection(
  ...args: Parameters<BehaviorSystem['selectWalkingDirection']>
): ReturnType<BehaviorSystem['selectWalkingDirection']> {
  return getActiveBehaviorSystem().selectWalkingDirection(...args);
}
export function adjustWalkingSpeed(
  ...args: Parameters<BehaviorSystem['adjustWalkingSpeed']>
): ReturnType<BehaviorSystem['adjustWalkingSpeed']> {
  return getActiveBehaviorSystem().adjustWalkingSpeed(...args);
}
export function simulateNaturalWalking(
  ...args: Parameters<BehaviorSystem['simulateNaturalWalking']>
): ReturnType<BehaviorSystem['simulateNaturalWalking']> {
  return getActiveBehaviorSystem().simulateNaturalWalking(...args);
}
export function simulateRunning(
  ...args: Parameters<BehaviorSystem['simulateRunning']>
): ReturnType<BehaviorSystem['simulateRunning']> {
  return getActiveBehaviorSystem().simulateRunning(...args);
}
export function simulateJumping(
  ...args: Parameters<BehaviorSystem['simulateJumping']>
): ReturnType<BehaviorSystem['simulateJumping']> {
  return getActiveBehaviorSystem().simulateJumping(...args);
}
export function simulateCrouching(
  ...args: Parameters<BehaviorSystem['simulateCrouching']>
): ReturnType<BehaviorSystem['simulateCrouching']> {
  return getActiveBehaviorSystem().simulateCrouching(...args);
}
export function simulateKneeling(
  ...args: Parameters<BehaviorSystem['simulateKneeling']>
): ReturnType<BehaviorSystem['simulateKneeling']> {
  return getActiveBehaviorSystem().simulateKneeling(...args);
}
export function simulateCrawling(
  ...args: Parameters<BehaviorSystem['simulateCrawling']>
): ReturnType<BehaviorSystem['simulateCrawling']> {
  return getActiveBehaviorSystem().simulateCrawling(...args);
}
export function maintainPosturalBalance(
  ...args: Parameters<BehaviorSystem['maintainPosturalBalance']>
): ReturnType<BehaviorSystem['maintainPosturalBalance']> {
  return getActiveBehaviorSystem().maintainPosturalBalance(...args);
}
export function recoverFromLossOfBalance(
  ...args: Parameters<BehaviorSystem['recoverFromLossOfBalance']>
): ReturnType<BehaviorSystem['recoverFromLossOfBalance']> {
  return getActiveBehaviorSystem().recoverFromLossOfBalance(...args);
}
export function avoidWalkingObstacle(
  ...args: Parameters<BehaviorSystem['avoidWalkingObstacle']>
): ReturnType<BehaviorSystem['avoidWalkingObstacle']> {
  return getActiveBehaviorSystem().avoidWalkingObstacle(...args);
}
export function navigateAroundPerson(
  ...args: Parameters<BehaviorSystem['navigateAroundPerson']>
): ReturnType<BehaviorSystem['navigateAroundPerson']> {
  return getActiveBehaviorSystem().navigateAroundPerson(...args);
}
export function coordinateHandEyeMovement(
  ...args: Parameters<BehaviorSystem['coordinateHandEyeMovement']>
): ReturnType<BehaviorSystem['coordinateHandEyeMovement']> {
  return getActiveBehaviorSystem().coordinateHandEyeMovement(...args);
}
export function reachForObject(
  ...args: Parameters<BehaviorSystem['reachForObject']>
): ReturnType<BehaviorSystem['reachForObject']> {
  return getActiveBehaviorSystem().reachForObject(...args);
}
export function graspObject(
  ...args: Parameters<BehaviorSystem['graspObject']>
): ReturnType<BehaviorSystem['graspObject']> {
  return getActiveBehaviorSystem().graspObject(...args);
}
export function releaseObject(
  ...args: Parameters<BehaviorSystem['releaseObject']>
): ReturnType<BehaviorSystem['releaseObject']> {
  return getActiveBehaviorSystem().releaseObject(...args);
}
export function adjustGripStrength(
  ...args: Parameters<BehaviorSystem['adjustGripStrength']>
): ReturnType<BehaviorSystem['adjustGripStrength']> {
  return getActiveBehaviorSystem().adjustGripStrength(...args);
}
export function coordinateWholeBodyMovement(
  ...args: Parameters<BehaviorSystem['coordinateWholeBodyMovement']>
): ReturnType<BehaviorSystem['coordinateWholeBodyMovement']> {
  return getActiveBehaviorSystem().coordinateWholeBodyMovement(...args);
}
export function adaptMovementToTerrain(
  ...args: Parameters<BehaviorSystem['adaptMovementToTerrain']>
): ReturnType<BehaviorSystem['adaptMovementToTerrain']> {
  return getActiveBehaviorSystem().adaptMovementToTerrain(...args);
}
export function inspectNearbyObject(
  ...args: Parameters<BehaviorSystem['inspectNearbyObject']>
): ReturnType<BehaviorSystem['inspectNearbyObject']> {
  return getActiveBehaviorSystem().inspectNearbyObject(...args);
}
export function approachInteractiveObject(
  ...args: Parameters<BehaviorSystem['approachInteractiveObject']>
): ReturnType<BehaviorSystem['approachInteractiveObject']> {
  return getActiveBehaviorSystem().approachInteractiveObject(...args);
}
export function touchObject(
  ...args: Parameters<BehaviorSystem['touchObject']>
): ReturnType<BehaviorSystem['touchObject']> {
  return getActiveBehaviorSystem().touchObject(...args);
}
export function pickUpObject(
  ...args: Parameters<BehaviorSystem['pickUpObject']>
): ReturnType<BehaviorSystem['pickUpObject']> {
  return getActiveBehaviorSystem().pickUpObject(...args);
}
export function putDownObject(
  ...args: Parameters<BehaviorSystem['putDownObject']>
): ReturnType<BehaviorSystem['putDownObject']> {
  return getActiveBehaviorSystem().putDownObject(...args);
}
export function carryObject(
  ...args: Parameters<BehaviorSystem['carryObject']>
): ReturnType<BehaviorSystem['carryObject']> {
  return getActiveBehaviorSystem().carryObject(...args);
}
export function pushObject(
  ...args: Parameters<BehaviorSystem['pushObject']>
): ReturnType<BehaviorSystem['pushObject']> {
  return getActiveBehaviorSystem().pushObject(...args);
}
export function pullObject(
  ...args: Parameters<BehaviorSystem['pullObject']>
): ReturnType<BehaviorSystem['pullObject']> {
  return getActiveBehaviorSystem().pullObject(...args);
}
export function openContainer(
  ...args: Parameters<BehaviorSystem['openContainer']>
): ReturnType<BehaviorSystem['openContainer']> {
  return getActiveBehaviorSystem().openContainer(...args);
}
export function closeContainer(
  ...args: Parameters<BehaviorSystem['closeContainer']>
): ReturnType<BehaviorSystem['closeContainer']> {
  return getActiveBehaviorSystem().closeContainer(...args);
}
export function operateSimpleTool(
  ...args: Parameters<BehaviorSystem['operateSimpleTool']>
): ReturnType<BehaviorSystem['operateSimpleTool']> {
  return getActiveBehaviorSystem().operateSimpleTool(...args);
}
export function inspectObjectDamage(
  ...args: Parameters<BehaviorSystem['inspectObjectDamage']>
): ReturnType<BehaviorSystem['inspectObjectDamage']> {
  return getActiveBehaviorSystem().inspectObjectDamage(...args);
}
export function repairSimpleObject(
  ...args: Parameters<BehaviorSystem['repairSimpleObject']>
): ReturnType<BehaviorSystem['repairSimpleObject']> {
  return getActiveBehaviorSystem().repairSimpleObject(...args);
}
export function searchForLostObject(
  ...args: Parameters<BehaviorSystem['searchForLostObject']>
): ReturnType<BehaviorSystem['searchForLostObject']> {
  return getActiveBehaviorSystem().searchForLostObject(...args);
}
export function storeObjectInLocation(
  ...args: Parameters<BehaviorSystem['storeObjectInLocation']>
): ReturnType<BehaviorSystem['storeObjectInLocation']> {
  return getActiveBehaviorSystem().storeObjectInLocation(...args);
}
export function retrieveStoredObject(
  ...args: Parameters<BehaviorSystem['retrieveStoredObject']>
): ReturnType<BehaviorSystem['retrieveStoredObject']> {
  return getActiveBehaviorSystem().retrieveStoredObject(...args);
}
export function organizePersonalBelongings(
  ...args: Parameters<BehaviorSystem['organizePersonalBelongings']>
): ReturnType<BehaviorSystem['organizePersonalBelongings']> {
  return getActiveBehaviorSystem().organizePersonalBelongings(...args);
}
export function cleanNearbyArea(
  ...args: Parameters<BehaviorSystem['cleanNearbyArea']>
): ReturnType<BehaviorSystem['cleanNearbyArea']> {
  return getActiveBehaviorSystem().cleanNearbyArea(...args);
}
export function adaptObjectUseToContext(
  ...args: Parameters<BehaviorSystem['adaptObjectUseToContext']>
): ReturnType<BehaviorSystem['adaptObjectUseToContext']> {
  return getActiveBehaviorSystem().adaptObjectUseToContext(...args);
}
export function learnObjectAffordances(
  ...args: Parameters<BehaviorSystem['learnObjectAffordances']>
): ReturnType<BehaviorSystem['learnObjectAffordances']> {
  return getActiveBehaviorSystem().learnObjectAffordances(...args);
}
export function initializeDevelopmentStage(
  ...args: Parameters<BehaviorSystem['initializeDevelopmentStage']>
): ReturnType<BehaviorSystem['initializeDevelopmentStage']> {
  return getActiveBehaviorSystem().initializeDevelopmentStage(...args);
}
export function updatePhysicalGrowth(
  ...args: Parameters<BehaviorSystem['updatePhysicalGrowth']>
): ReturnType<BehaviorSystem['updatePhysicalGrowth']> {
  return getActiveBehaviorSystem().updatePhysicalGrowth(...args);
}
export function updateCognitiveDevelopment(
  ...args: Parameters<BehaviorSystem['updateCognitiveDevelopment']>
): ReturnType<BehaviorSystem['updateCognitiveDevelopment']> {
  return getActiveBehaviorSystem().updateCognitiveDevelopment(...args);
}
export function updateEmotionalMaturity(
  ...args: Parameters<BehaviorSystem['updateEmotionalMaturity']>
): ReturnType<BehaviorSystem['updateEmotionalMaturity']> {
  return getActiveBehaviorSystem().updateEmotionalMaturity(...args);
}
export function learnDevelopmentalSkill(
  ...args: Parameters<BehaviorSystem['learnDevelopmentalSkill']>
): ReturnType<BehaviorSystem['learnDevelopmentalSkill']> {
  return getActiveBehaviorSystem().learnDevelopmentalSkill(...args);
}
export function developMotorCoordination(
  ...args: Parameters<BehaviorSystem['developMotorCoordination']>
): ReturnType<BehaviorSystem['developMotorCoordination']> {
  return getActiveBehaviorSystem().developMotorCoordination(...args);
}
export function developLanguageAbility(
  ...args: Parameters<BehaviorSystem['developLanguageAbility']>
): ReturnType<BehaviorSystem['developLanguageAbility']> {
  return getActiveBehaviorSystem().developLanguageAbility(...args);
}
export function developSocialUnderstanding(
  ...args: Parameters<BehaviorSystem['developSocialUnderstanding']>
): ReturnType<BehaviorSystem['developSocialUnderstanding']> {
  return getActiveBehaviorSystem().developSocialUnderstanding(...args);
}
export function developSelfRegulation(
  ...args: Parameters<BehaviorSystem['developSelfRegulation']>
): ReturnType<BehaviorSystem['developSelfRegulation']> {
  return getActiveBehaviorSystem().developSelfRegulation(...args);
}
export function adaptToPubertyChanges(
  ...args: Parameters<BehaviorSystem['adaptToPubertyChanges']>
): ReturnType<BehaviorSystem['adaptToPubertyChanges']> {
  return getActiveBehaviorSystem().adaptToPubertyChanges(...args);
}
export function updateAdultBehaviorPatterns(
  ...args: Parameters<BehaviorSystem['updateAdultBehaviorPatterns']>
): ReturnType<BehaviorSystem['updateAdultBehaviorPatterns']> {
  return getActiveBehaviorSystem().updateAdultBehaviorPatterns(...args);
}
export function adaptToAging(
  ...args: Parameters<BehaviorSystem['adaptToAging']>
): ReturnType<BehaviorSystem['adaptToAging']> {
  return getActiveBehaviorSystem().adaptToAging(...args);
}
export function updateSensorySensitivity(
  ...args: Parameters<BehaviorSystem['updateSensorySensitivity']>
): ReturnType<BehaviorSystem['updateSensorySensitivity']> {
  return getActiveBehaviorSystem().updateSensorySensitivity(...args);
}
export function updateMobilityCapacity(
  ...args: Parameters<BehaviorSystem['updateMobilityCapacity']>
): ReturnType<BehaviorSystem['updateMobilityCapacity']> {
  return getActiveBehaviorSystem().updateMobilityCapacity(...args);
}
export function preserveLearnedSkills(
  ...args: Parameters<BehaviorSystem['preserveLearnedSkills']>
): ReturnType<BehaviorSystem['preserveLearnedSkills']> {
  return getActiveBehaviorSystem().preserveLearnedSkills(...args);
}
export function adaptToCognitiveDecline(
  ...args: Parameters<BehaviorSystem['adaptToCognitiveDecline']>
): ReturnType<BehaviorSystem['adaptToCognitiveDecline']> {
  return getActiveBehaviorSystem().adaptToCognitiveDecline(...args);
}
export function seekIntergenerationalSupport(
  ...args: Parameters<BehaviorSystem['seekIntergenerationalSupport']>
): ReturnType<BehaviorSystem['seekIntergenerationalSupport']> {
  return getActiveBehaviorSystem().seekIntergenerationalSupport(...args);
}
export function mentorYoungerIndividual(
  ...args: Parameters<BehaviorSystem['mentorYoungerIndividual']>
): ReturnType<BehaviorSystem['mentorYoungerIndividual']> {
  return getActiveBehaviorSystem().mentorYoungerIndividual(...args);
}
export function transferCulturalKnowledge(
  ...args: Parameters<BehaviorSystem['transferCulturalKnowledge']>
): ReturnType<BehaviorSystem['transferCulturalKnowledge']> {
  return getActiveBehaviorSystem().transferCulturalKnowledge(...args);
}
export function updateLifespanState(
  ...args: Parameters<BehaviorSystem['updateLifespanState']>
): ReturnType<BehaviorSystem['updateLifespanState']> {
  return getActiveBehaviorSystem().updateLifespanState(...args);
}
export function recognizeFamilyMember(
  ...args: Parameters<BehaviorSystem['recognizeFamilyMember']>
): ReturnType<BehaviorSystem['recognizeFamilyMember']> {
  return getActiveBehaviorSystem().recognizeFamilyMember(...args);
}
export function maintainFamilyBond(
  ...args: Parameters<BehaviorSystem['maintainFamilyBond']>
): ReturnType<BehaviorSystem['maintainFamilyBond']> {
  return getActiveBehaviorSystem().maintainFamilyBond(...args);
}
export function seekCaregiver(
  ...args: Parameters<BehaviorSystem['seekCaregiver']>
): ReturnType<BehaviorSystem['seekCaregiver']> {
  return getActiveBehaviorSystem().seekCaregiver(...args);
}
export function respondToCaregiverPresence(
  ...args: Parameters<BehaviorSystem['respondToCaregiverPresence']>
): ReturnType<BehaviorSystem['respondToCaregiverPresence']> {
  return getActiveBehaviorSystem().respondToCaregiverPresence(...args);
}
export function provideCareToDependent(
  ...args: Parameters<BehaviorSystem['provideCareToDependent']>
): ReturnType<BehaviorSystem['provideCareToDependent']> {
  return getActiveBehaviorSystem().provideCareToDependent(...args);
}
export function monitorDependentSafety(
  ...args: Parameters<BehaviorSystem['monitorDependentSafety']>
): ReturnType<BehaviorSystem['monitorDependentSafety']> {
  return getActiveBehaviorSystem().monitorDependentSafety(...args);
}
export function comfortDistressedChild(
  ...args: Parameters<BehaviorSystem['comfortDistressedChild']>
): ReturnType<BehaviorSystem['comfortDistressedChild']> {
  return getActiveBehaviorSystem().comfortDistressedChild(...args);
}
export function teachBasicSkill(
  ...args: Parameters<BehaviorSystem['teachBasicSkill']>
): ReturnType<BehaviorSystem['teachBasicSkill']> {
  return getActiveBehaviorSystem().teachBasicSkill(...args);
}
export function demonstrateExpectedBehavior(
  ...args: Parameters<BehaviorSystem['demonstrateExpectedBehavior']>
): ReturnType<BehaviorSystem['demonstrateExpectedBehavior']> {
  return getActiveBehaviorSystem().demonstrateExpectedBehavior(...args);
}
export function reinforceHelpfulBehavior(
  ...args: Parameters<BehaviorSystem['reinforceHelpfulBehavior']>
): ReturnType<BehaviorSystem['reinforceHelpfulBehavior']> {
  return getActiveBehaviorSystem().reinforceHelpfulBehavior(...args);
}
export function setFamilyBoundary(
  ...args: Parameters<BehaviorSystem['setFamilyBoundary']>
): ReturnType<BehaviorSystem['setFamilyBoundary']> {
  return getActiveBehaviorSystem().setFamilyBoundary(...args);
}
export function respondToFamilyDisagreement(
  ...args: Parameters<BehaviorSystem['respondToFamilyDisagreement']>
): ReturnType<BehaviorSystem['respondToFamilyDisagreement']> {
  return getActiveBehaviorSystem().respondToFamilyDisagreement(...args);
}
export function mediateFamilyConflict(
  ...args: Parameters<BehaviorSystem['mediateFamilyConflict']>
): ReturnType<BehaviorSystem['mediateFamilyConflict']> {
  return getActiveBehaviorSystem().mediateFamilyConflict(...args);
}
export function coordinateHouseholdTask(
  ...args: Parameters<BehaviorSystem['coordinateHouseholdTask']>
): ReturnType<BehaviorSystem['coordinateHouseholdTask']> {
  return getActiveBehaviorSystem().coordinateHouseholdTask(...args);
}
export function shareCaregivingDuty(
  ...args: Parameters<BehaviorSystem['shareCaregivingDuty']>
): ReturnType<BehaviorSystem['shareCaregivingDuty']> {
  return getActiveBehaviorSystem().shareCaregivingDuty(...args);
}
export function expressFamilyAffection(
  ...args: Parameters<BehaviorSystem['expressFamilyAffection']>
): ReturnType<BehaviorSystem['expressFamilyAffection']> {
  return getActiveBehaviorSystem().expressFamilyAffection(...args);
}
export function respondToFamilySeparation(
  ...args: Parameters<BehaviorSystem['respondToFamilySeparation']>
): ReturnType<BehaviorSystem['respondToFamilySeparation']> {
  return getActiveBehaviorSystem().respondToFamilySeparation(...args);
}
export function reuniteWithFamilyMember(
  ...args: Parameters<BehaviorSystem['reuniteWithFamilyMember']>
): ReturnType<BehaviorSystem['reuniteWithFamilyMember']> {
  return getActiveBehaviorSystem().reuniteWithFamilyMember(...args);
}
export function preserveFamilyTradition(
  ...args: Parameters<BehaviorSystem['preserveFamilyTradition']>
): ReturnType<BehaviorSystem['preserveFamilyTradition']> {
  return getActiveBehaviorSystem().preserveFamilyTradition(...args);
}
export function adaptToFamilyStructureChange(
  ...args: Parameters<BehaviorSystem['adaptToFamilyStructureChange']>
): ReturnType<BehaviorSystem['adaptToFamilyStructureChange']> {
  return getActiveBehaviorSystem().adaptToFamilyStructureChange(...args);
}
export function detectCrowdDensity(
  ...args: Parameters<BehaviorSystem['detectCrowdDensity']>
): ReturnType<BehaviorSystem['detectCrowdDensity']> {
  return getActiveBehaviorSystem().detectCrowdDensity(...args);
}
export function estimateCrowdMovement(
  ...args: Parameters<BehaviorSystem['estimateCrowdMovement']>
): ReturnType<BehaviorSystem['estimateCrowdMovement']> {
  return getActiveBehaviorSystem().estimateCrowdMovement(...args);
}
export function navigateThroughCrowd(
  ...args: Parameters<BehaviorSystem['navigateThroughCrowd']>
): ReturnType<BehaviorSystem['navigateThroughCrowd']> {
  return getActiveBehaviorSystem().navigateThroughCrowd(...args);
}
export function maintainPersonalSpaceInCrowd(
  ...args: Parameters<BehaviorSystem['maintainPersonalSpaceInCrowd']>
): ReturnType<BehaviorSystem['maintainPersonalSpaceInCrowd']> {
  return getActiveBehaviorSystem().maintainPersonalSpaceInCrowd(...args);
}
export function followPedestrianFlow(
  ...args: Parameters<BehaviorSystem['followPedestrianFlow']>
): ReturnType<BehaviorSystem['followPedestrianFlow']> {
  return getActiveBehaviorSystem().followPedestrianFlow(...args);
}
export function avoidCrowdCollision(
  ...args: Parameters<BehaviorSystem['avoidCrowdCollision']>
): ReturnType<BehaviorSystem['avoidCrowdCollision']> {
  return getActiveBehaviorSystem().avoidCrowdCollision(...args);
}
export function respondToCrowdExcitement(
  ...args: Parameters<BehaviorSystem['respondToCrowdExcitement']>
): ReturnType<BehaviorSystem['respondToCrowdExcitement']> {
  return getActiveBehaviorSystem().respondToCrowdExcitement(...args);
}
export function respondToCrowdFear(
  ...args: Parameters<BehaviorSystem['respondToCrowdFear']>
): ReturnType<BehaviorSystem['respondToCrowdFear']> {
  return getActiveBehaviorSystem().respondToCrowdFear(...args);
}
export function detectCrowdPanic(
  ...args: Parameters<BehaviorSystem['detectCrowdPanic']>
): ReturnType<BehaviorSystem['detectCrowdPanic']> {
  return getActiveBehaviorSystem().detectCrowdPanic(...args);
}
export function seekCrowdExit(
  ...args: Parameters<BehaviorSystem['seekCrowdExit']>
): ReturnType<BehaviorSystem['seekCrowdExit']> {
  return getActiveBehaviorSystem().seekCrowdExit(...args);
}
export function followPublicQueue(
  ...args: Parameters<BehaviorSystem['followPublicQueue']>
): ReturnType<BehaviorSystem['followPublicQueue']> {
  return getActiveBehaviorSystem().followPublicQueue(...args);
}
export function maintainQueuePosition(
  ...args: Parameters<BehaviorSystem['maintainQueuePosition']>
): ReturnType<BehaviorSystem['maintainQueuePosition']> {
  return getActiveBehaviorSystem().maintainQueuePosition(...args);
}
export function yieldToOtherPedestrian(
  ...args: Parameters<BehaviorSystem['yieldToOtherPedestrian']>
): ReturnType<BehaviorSystem['yieldToOtherPedestrian']> {
  return getActiveBehaviorSystem().yieldToOtherPedestrian(...args);
}
export function requestPublicAssistance(
  ...args: Parameters<BehaviorSystem['requestPublicAssistance']>
): ReturnType<BehaviorSystem['requestPublicAssistance']> {
  return getActiveBehaviorSystem().requestPublicAssistance(...args);
}
export function respondToPublicAnnouncement(
  ...args: Parameters<BehaviorSystem['respondToPublicAnnouncement']>
): ReturnType<BehaviorSystem['respondToPublicAnnouncement']> {
  return getActiveBehaviorSystem().respondToPublicAnnouncement(...args);
}
export function recognizePublicSignage(
  ...args: Parameters<BehaviorSystem['recognizePublicSignage']>
): ReturnType<BehaviorSystem['recognizePublicSignage']> {
  return getActiveBehaviorSystem().recognizePublicSignage(...args);
}
export function adaptBehaviorToPublicSetting(
  ...args: Parameters<BehaviorSystem['adaptBehaviorToPublicSetting']>
): ReturnType<BehaviorSystem['adaptBehaviorToPublicSetting']> {
  return getActiveBehaviorSystem().adaptBehaviorToPublicSetting(...args);
}
export function detectSuspiciousSituation(
  ...args: Parameters<BehaviorSystem['detectSuspiciousSituation']>
): ReturnType<BehaviorSystem['detectSuspiciousSituation']> {
  return getActiveBehaviorSystem().detectSuspiciousSituation(...args);
}
export function offerHelpToStranger(
  ...args: Parameters<BehaviorSystem['offerHelpToStranger']>
): ReturnType<BehaviorSystem['offerHelpToStranger']> {
  return getActiveBehaviorSystem().offerHelpToStranger(...args);
}
export function recoverAfterCrowdDisturbance(
  ...args: Parameters<BehaviorSystem['recoverAfterCrowdDisturbance']>
): ReturnType<BehaviorSystem['recoverAfterCrowdDisturbance']> {
  return getActiveBehaviorSystem().recoverAfterCrowdDisturbance(...args);
}
export function detectUnexpectedEvent(
  ...args: Parameters<BehaviorSystem['detectUnexpectedEvent']>
): ReturnType<BehaviorSystem['detectUnexpectedEvent']> {
  return getActiveBehaviorSystem().detectUnexpectedEvent(...args);
}
export function triggerStartleResponse(
  ...args: Parameters<BehaviorSystem['triggerStartleResponse']>
): ReturnType<BehaviorSystem['triggerStartleResponse']> {
  return getActiveBehaviorSystem().triggerStartleResponse(...args);
}
export function orientTowardUnexpectedSound(
  ...args: Parameters<BehaviorSystem['orientTowardUnexpectedSound']>
): ReturnType<BehaviorSystem['orientTowardUnexpectedSound']> {
  return getActiveBehaviorSystem().orientTowardUnexpectedSound(...args);
}
export function orientTowardSuddenMovement(
  ...args: Parameters<BehaviorSystem['orientTowardSuddenMovement']>
): ReturnType<BehaviorSystem['orientTowardSuddenMovement']> {
  return getActiveBehaviorSystem().orientTowardSuddenMovement(...args);
}
export function pauseCurrentAction(
  ...args: Parameters<BehaviorSystem['pauseCurrentAction']>
): ReturnType<BehaviorSystem['pauseCurrentAction']> {
  return getActiveBehaviorSystem().pauseCurrentAction(...args);
}
export function reassessCurrentSituation(
  ...args: Parameters<BehaviorSystem['reassessCurrentSituation']>
): ReturnType<BehaviorSystem['reassessCurrentSituation']> {
  return getActiveBehaviorSystem().reassessCurrentSituation(...args);
}
export function identifyEventSource(
  ...args: Parameters<BehaviorSystem['identifyEventSource']>
): ReturnType<BehaviorSystem['identifyEventSource']> {
  return getActiveBehaviorSystem().identifyEventSource(...args);
}
export function classifyEventUrgency(
  ...args: Parameters<BehaviorSystem['classifyEventUrgency']>
): ReturnType<BehaviorSystem['classifyEventUrgency']> {
  return getActiveBehaviorSystem().classifyEventUrgency(...args);
}
export function selectImmediateResponse(
  ...args: Parameters<BehaviorSystem['selectImmediateResponse']>
): ReturnType<BehaviorSystem['selectImmediateResponse']> {
  return getActiveBehaviorSystem().selectImmediateResponse(...args);
}
export function avoidSuddenHazard(
  ...args: Parameters<BehaviorSystem['avoidSuddenHazard']>
): ReturnType<BehaviorSystem['avoidSuddenHazard']> {
  return getActiveBehaviorSystem().avoidSuddenHazard(...args);
}
export function seekInformationAfterSurprise(
  ...args: Parameters<BehaviorSystem['seekInformationAfterSurprise']>
): ReturnType<BehaviorSystem['seekInformationAfterSurprise']> {
  return getActiveBehaviorSystem().seekInformationAfterSurprise(...args);
}
export function expressSurprise(
  ...args: Parameters<BehaviorSystem['expressSurprise']>
): ReturnType<BehaviorSystem['expressSurprise']> {
  return getActiveBehaviorSystem().expressSurprise(...args);
}
export function recoverFromStartle(
  ...args: Parameters<BehaviorSystem['recoverFromStartle']>
): ReturnType<BehaviorSystem['recoverFromStartle']> {
  return getActiveBehaviorSystem().recoverFromStartle(...args);
}
export function adaptPlanAfterInterruption(
  ...args: Parameters<BehaviorSystem['adaptPlanAfterInterruption']>
): ReturnType<BehaviorSystem['adaptPlanAfterInterruption']> {
  return getActiveBehaviorSystem().adaptPlanAfterInterruption(...args);
}
export function respondToUnexpectedTouch(
  ...args: Parameters<BehaviorSystem['respondToUnexpectedTouch']>
): ReturnType<BehaviorSystem['respondToUnexpectedTouch']> {
  return getActiveBehaviorSystem().respondToUnexpectedTouch(...args);
}
export function respondToSuddenLightChange(
  ...args: Parameters<BehaviorSystem['respondToSuddenLightChange']>
): ReturnType<BehaviorSystem['respondToSuddenLightChange']> {
  return getActiveBehaviorSystem().respondToSuddenLightChange(...args);
}
export function respondToSuddenTemperatureChange(
  ...args: Parameters<BehaviorSystem['respondToSuddenTemperatureChange']>
): ReturnType<BehaviorSystem['respondToSuddenTemperatureChange']> {
  return getActiveBehaviorSystem().respondToSuddenTemperatureChange(...args);
}
export function evaluateFalseAlarm(
  ...args: Parameters<BehaviorSystem['evaluateFalseAlarm']>
): ReturnType<BehaviorSystem['evaluateFalseAlarm']> {
  return getActiveBehaviorSystem().evaluateFalseAlarm(...args);
}
export function updateExpectationAfterSurprise(
  ...args: Parameters<BehaviorSystem['updateExpectationAfterSurprise']>
): ReturnType<BehaviorSystem['updateExpectationAfterSurprise']> {
  return getActiveBehaviorSystem().updateExpectationAfterSurprise(...args);
}
export function resumeNormalActivity(
  ...args: Parameters<BehaviorSystem['resumeNormalActivity']>
): ReturnType<BehaviorSystem['resumeNormalActivity']> {
  return getActiveBehaviorSystem().resumeNormalActivity(...args);
}
export function selectWorkTask(
  ...args: Parameters<BehaviorSystem['selectWorkTask']>
): ReturnType<BehaviorSystem['selectWorkTask']> {
  return getActiveBehaviorSystem().selectWorkTask(...args);
}
export function prepareWorkEnvironment(
  ...args: Parameters<BehaviorSystem['prepareWorkEnvironment']>
): ReturnType<BehaviorSystem['prepareWorkEnvironment']> {
  return getActiveBehaviorSystem().prepareWorkEnvironment(...args);
}
export function estimateTaskDuration(
  ...args: Parameters<BehaviorSystem['estimateTaskDuration']>
): ReturnType<BehaviorSystem['estimateTaskDuration']> {
  return getActiveBehaviorSystem().estimateTaskDuration(...args);
}
export function allocateTaskResources(
  ...args: Parameters<BehaviorSystem['allocateTaskResources']>
): ReturnType<BehaviorSystem['allocateTaskResources']> {
  return getActiveBehaviorSystem().allocateTaskResources(...args);
}
export function startWorkSession(
  ...args: Parameters<BehaviorSystem['startWorkSession']>
): ReturnType<BehaviorSystem['startWorkSession']> {
  return getActiveBehaviorSystem().startWorkSession(...args);
}
export function maintainWorkFocus(
  ...args: Parameters<BehaviorSystem['maintainWorkFocus']>
): ReturnType<BehaviorSystem['maintainWorkFocus']> {
  return getActiveBehaviorSystem().maintainWorkFocus(...args);
}
export function switchBetweenTasks(
  ...args: Parameters<BehaviorSystem['switchBetweenTasks']>
): ReturnType<BehaviorSystem['switchBetweenTasks']> {
  return getActiveBehaviorSystem().switchBetweenTasks(...args);
}
export function detectWorkError(
  ...args: Parameters<BehaviorSystem['detectWorkError']>
): ReturnType<BehaviorSystem['detectWorkError']> {
  return getActiveBehaviorSystem().detectWorkError(...args);
}
export function correctWorkError(
  ...args: Parameters<BehaviorSystem['correctWorkError']>
): ReturnType<BehaviorSystem['correctWorkError']> {
  return getActiveBehaviorSystem().correctWorkError(...args);
}
export function requestWorkClarification(
  ...args: Parameters<BehaviorSystem['requestWorkClarification']>
): ReturnType<BehaviorSystem['requestWorkClarification']> {
  return getActiveBehaviorSystem().requestWorkClarification(...args);
}
export function askForWorkAssistance(
  ...args: Parameters<BehaviorSystem['askForWorkAssistance']>
): ReturnType<BehaviorSystem['askForWorkAssistance']> {
  return getActiveBehaviorSystem().askForWorkAssistance(...args);
}
export function provideWorkFeedback(
  ...args: Parameters<BehaviorSystem['provideWorkFeedback']>
): ReturnType<BehaviorSystem['provideWorkFeedback']> {
  return getActiveBehaviorSystem().provideWorkFeedback(...args);
}
export function receiveWorkFeedback(
  ...args: Parameters<BehaviorSystem['receiveWorkFeedback']>
): ReturnType<BehaviorSystem['receiveWorkFeedback']> {
  return getActiveBehaviorSystem().receiveWorkFeedback(...args);
}
export function adaptToWorkPressure(
  ...args: Parameters<BehaviorSystem['adaptToWorkPressure']>
): ReturnType<BehaviorSystem['adaptToWorkPressure']> {
  return getActiveBehaviorSystem().adaptToWorkPressure(...args);
}
export function coordinateWithCoworker(
  ...args: Parameters<BehaviorSystem['coordinateWithCoworker']>
): ReturnType<BehaviorSystem['coordinateWithCoworker']> {
  return getActiveBehaviorSystem().coordinateWithCoworker(...args);
}
export function negotiateWorkResponsibility(
  ...args: Parameters<BehaviorSystem['negotiateWorkResponsibility']>
): ReturnType<BehaviorSystem['negotiateWorkResponsibility']> {
  return getActiveBehaviorSystem().negotiateWorkResponsibility(...args);
}
export function maintainWorkMotivation(
  ...args: Parameters<BehaviorSystem['maintainWorkMotivation']>
): ReturnType<BehaviorSystem['maintainWorkMotivation']> {
  return getActiveBehaviorSystem().maintainWorkMotivation(...args);
}
export function evaluateWorkPerformance(
  ...args: Parameters<BehaviorSystem['evaluateWorkPerformance']>
): ReturnType<BehaviorSystem['evaluateWorkPerformance']> {
  return getActiveBehaviorSystem().evaluateWorkPerformance(...args);
}
export function completeWorkTask(
  ...args: Parameters<BehaviorSystem['completeWorkTask']>
): ReturnType<BehaviorSystem['completeWorkTask']> {
  return getActiveBehaviorSystem().completeWorkTask(...args);
}
export function transitionOutOfWorkMode(
  ...args: Parameters<BehaviorSystem['transitionOutOfWorkMode']>
): ReturnType<BehaviorSystem['transitionOutOfWorkMode']> {
  return getActiveBehaviorSystem().transitionOutOfWorkMode(...args);
}
export function selectLeisureActivity(
  ...args: Parameters<BehaviorSystem['selectLeisureActivity']>
): ReturnType<BehaviorSystem['selectLeisureActivity']> {
  return getActiveBehaviorSystem().selectLeisureActivity(...args);
}
export function initiatePlayBehavior(
  ...args: Parameters<BehaviorSystem['initiatePlayBehavior']>
): ReturnType<BehaviorSystem['initiatePlayBehavior']> {
  return getActiveBehaviorSystem().initiatePlayBehavior(...args);
}
export function explorePlayEnvironment(
  ...args: Parameters<BehaviorSystem['explorePlayEnvironment']>
): ReturnType<BehaviorSystem['explorePlayEnvironment']> {
  return getActiveBehaviorSystem().explorePlayEnvironment(...args);
}
export function followGameRules(
  ...args: Parameters<BehaviorSystem['followGameRules']>
): ReturnType<BehaviorSystem['followGameRules']> {
  return getActiveBehaviorSystem().followGameRules(...args);
}
export function learnGameRules(
  ...args: Parameters<BehaviorSystem['learnGameRules']>
): ReturnType<BehaviorSystem['learnGameRules']> {
  return getActiveBehaviorSystem().learnGameRules(...args);
}
export function selectGameStrategy(
  ...args: Parameters<BehaviorSystem['selectGameStrategy']>
): ReturnType<BehaviorSystem['selectGameStrategy']> {
  return getActiveBehaviorSystem().selectGameStrategy(...args);
}
export function anticipateOpponentMove(
  ...args: Parameters<BehaviorSystem['anticipateOpponentMove']>
): ReturnType<BehaviorSystem['anticipateOpponentMove']> {
  return getActiveBehaviorSystem().anticipateOpponentMove(...args);
}
export function respondToGameChallenge(
  ...args: Parameters<BehaviorSystem['respondToGameChallenge']>
): ReturnType<BehaviorSystem['respondToGameChallenge']> {
  return getActiveBehaviorSystem().respondToGameChallenge(...args);
}
export function celebrateGameVictory(
  ...args: Parameters<BehaviorSystem['celebrateGameVictory']>
): ReturnType<BehaviorSystem['celebrateGameVictory']> {
  return getActiveBehaviorSystem().celebrateGameVictory(...args);
}
export function copeWithGameDefeat(
  ...args: Parameters<BehaviorSystem['copeWithGameDefeat']>
): ReturnType<BehaviorSystem['copeWithGameDefeat']> {
  return getActiveBehaviorSystem().copeWithGameDefeat(...args);
}
export function displayCompetitiveExcitement(
  ...args: Parameters<BehaviorSystem['displayCompetitiveExcitement']>
): ReturnType<BehaviorSystem['displayCompetitiveExcitement']> {
  return getActiveBehaviorSystem().displayCompetitiveExcitement(...args);
}
export function practiceRepeatedSkill(
  ...args: Parameters<BehaviorSystem['practiceRepeatedSkill']>
): ReturnType<BehaviorSystem['practiceRepeatedSkill']> {
  return getActiveBehaviorSystem().practiceRepeatedSkill(...args);
}
export function learnFromGameFeedback(
  ...args: Parameters<BehaviorSystem['learnFromGameFeedback']>
): ReturnType<BehaviorSystem['learnFromGameFeedback']> {
  return getActiveBehaviorSystem().learnFromGameFeedback(...args);
}
export function cooperateDuringTeamGame(
  ...args: Parameters<BehaviorSystem['cooperateDuringTeamGame']>
): ReturnType<BehaviorSystem['cooperateDuringTeamGame']> {
  return getActiveBehaviorSystem().cooperateDuringTeamGame(...args);
}
export function resolveGameRuleDispute(
  ...args: Parameters<BehaviorSystem['resolveGameRuleDispute']>
): ReturnType<BehaviorSystem['resolveGameRuleDispute']> {
  return getActiveBehaviorSystem().resolveGameRuleDispute(...args);
}
export function adjustPlayDifficulty(
  ...args: Parameters<BehaviorSystem['adjustPlayDifficulty']>
): ReturnType<BehaviorSystem['adjustPlayDifficulty']> {
  return getActiveBehaviorSystem().adjustPlayDifficulty(...args);
}
export function detectPlayFatigue(
  ...args: Parameters<BehaviorSystem['detectPlayFatigue']>
): ReturnType<BehaviorSystem['detectPlayFatigue']> {
  return getActiveBehaviorSystem().detectPlayFatigue(...args);
}
export function endPlaySession(
  ...args: Parameters<BehaviorSystem['endPlaySession']>
): ReturnType<BehaviorSystem['endPlaySession']> {
  return getActiveBehaviorSystem().endPlaySession(...args);
}
export function sharePlayExperience(
  ...args: Parameters<BehaviorSystem['sharePlayExperience']>
): ReturnType<BehaviorSystem['sharePlayExperience']> {
  return getActiveBehaviorSystem().sharePlayExperience(...args);
}
export function chooseNextLeisureActivity(
  ...args: Parameters<BehaviorSystem['chooseNextLeisureActivity']>
): ReturnType<BehaviorSystem['chooseNextLeisureActivity']> {
  return getActiveBehaviorSystem().chooseNextLeisureActivity(...args);
}
export function detectEnvironmentalHazard(
  ...args: Parameters<BehaviorSystem['detectEnvironmentalHazard']>
): ReturnType<BehaviorSystem['detectEnvironmentalHazard']> {
  return getActiveBehaviorSystem().detectEnvironmentalHazard(...args);
}
export function classifyEnvironmentalHazard(
  ...args: Parameters<BehaviorSystem['classifyEnvironmentalHazard']>
): ReturnType<BehaviorSystem['classifyEnvironmentalHazard']> {
  return getActiveBehaviorSystem().classifyEnvironmentalHazard(...args);
}
export function estimateEscapeRoute(
  ...args: Parameters<BehaviorSystem['estimateEscapeRoute']>
): ReturnType<BehaviorSystem['estimateEscapeRoute']> {
  return getActiveBehaviorSystem().estimateEscapeRoute(...args);
}
export function selectSafeDestination(
  ...args: Parameters<BehaviorSystem['selectSafeDestination']>
): ReturnType<BehaviorSystem['selectSafeDestination']> {
  return getActiveBehaviorSystem().selectSafeDestination(...args);
}
export function avoidFireAndSmoke(
  ...args: Parameters<BehaviorSystem['avoidFireAndSmoke']>
): ReturnType<BehaviorSystem['avoidFireAndSmoke']> {
  return getActiveBehaviorSystem().avoidFireAndSmoke(...args);
}
export function avoidFallingObject(
  ...args: Parameters<BehaviorSystem['avoidFallingObject']>
): ReturnType<BehaviorSystem['avoidFallingObject']> {
  return getActiveBehaviorSystem().avoidFallingObject(...args);
}
export function avoidUnstableStructure(
  ...args: Parameters<BehaviorSystem['avoidUnstableStructure']>
): ReturnType<BehaviorSystem['avoidUnstableStructure']> {
  return getActiveBehaviorSystem().avoidUnstableStructure(...args);
}
export function seekEmergencyShelter(
  ...args: Parameters<BehaviorSystem['seekEmergencyShelter']>
): ReturnType<BehaviorSystem['seekEmergencyShelter']> {
  return getActiveBehaviorSystem().seekEmergencyShelter(...args);
}
export function signalForHelp(
  ...args: Parameters<BehaviorSystem['signalForHelp']>
): ReturnType<BehaviorSystem['signalForHelp']> {
  return getActiveBehaviorSystem().signalForHelp(...args);
}
export function assistInEmergency(
  ...args: Parameters<BehaviorSystem['assistInEmergency']>
): ReturnType<BehaviorSystem['assistInEmergency']> {
  return getActiveBehaviorSystem().assistInEmergency(...args);
}
export function followEvacuationInstruction(
  ...args: Parameters<BehaviorSystem['followEvacuationInstruction']>
): ReturnType<BehaviorSystem['followEvacuationInstruction']> {
  return getActiveBehaviorSystem().followEvacuationInstruction(...args);
}
export function navigateLowVisibility(
  ...args: Parameters<BehaviorSystem['navigateLowVisibility']>
): ReturnType<BehaviorSystem['navigateLowVisibility']> {
  return getActiveBehaviorSystem().navigateLowVisibility(...args);
}
export function conservePhysicalEnergy(
  ...args: Parameters<BehaviorSystem['conservePhysicalEnergy']>
): ReturnType<BehaviorSystem['conservePhysicalEnergy']> {
  return getActiveBehaviorSystem().conservePhysicalEnergy(...args);
}
export function prioritizeImmediateSurvivalNeed(
  ...args: Parameters<BehaviorSystem['prioritizeImmediateSurvivalNeed']>
): ReturnType<BehaviorSystem['prioritizeImmediateSurvivalNeed']> {
  return getActiveBehaviorSystem().prioritizeImmediateSurvivalNeed(...args);
}
export function shareEmergencyResource(
  ...args: Parameters<BehaviorSystem['shareEmergencyResource']>
): ReturnType<BehaviorSystem['shareEmergencyResource']> {
  return getActiveBehaviorSystem().shareEmergencyResource(...args);
}
export function coordinateEmergencyResponse(
  ...args: Parameters<BehaviorSystem['coordinateEmergencyResponse']>
): ReturnType<BehaviorSystem['coordinateEmergencyResponse']> {
  return getActiveBehaviorSystem().coordinateEmergencyResponse(...args);
}
export function monitorEnvironmentalChange(
  ...args: Parameters<BehaviorSystem['monitorEnvironmentalChange']>
): ReturnType<BehaviorSystem['monitorEnvironmentalChange']> {
  return getActiveBehaviorSystem().monitorEnvironmentalChange(...args);
}
export function adaptSurvivalStrategy(
  ...args: Parameters<BehaviorSystem['adaptSurvivalStrategy']>
): ReturnType<BehaviorSystem['adaptSurvivalStrategy']> {
  return getActiveBehaviorSystem().adaptSurvivalStrategy(...args);
}
export function recoverAfterDanger(
  ...args: Parameters<BehaviorSystem['recoverAfterDanger']>
): ReturnType<BehaviorSystem['recoverAfterDanger']> {
  return getActiveBehaviorSystem().recoverAfterDanger(...args);
}
export function reassessSafetyCondition(
  ...args: Parameters<BehaviorSystem['reassessSafetyCondition']>
): ReturnType<BehaviorSystem['reassessSafetyCondition']> {
  return getActiveBehaviorSystem().reassessSafetyCondition(...args);
}
export function inferIntentFromGesture(
  ...args: Parameters<BehaviorSystem['inferIntentFromGesture']>
): ReturnType<BehaviorSystem['inferIntentFromGesture']> {
  return getActiveBehaviorSystem().inferIntentFromGesture(...args);
}
export function inferEmotionFromVoice(
  ...args: Parameters<BehaviorSystem['inferEmotionFromVoice']>
): ReturnType<BehaviorSystem['inferEmotionFromVoice']> {
  return getActiveBehaviorSystem().inferEmotionFromVoice(...args);
}
export function inferConfidenceFromPosture(
  ...args: Parameters<BehaviorSystem['inferConfidenceFromPosture']>
): ReturnType<BehaviorSystem['inferConfidenceFromPosture']> {
  return getActiveBehaviorSystem().inferConfidenceFromPosture(...args);
}
export function detectConversationalDiscomfort(
  ...args: Parameters<BehaviorSystem['detectConversationalDiscomfort']>
): ReturnType<BehaviorSystem['detectConversationalDiscomfort']> {
  return getActiveBehaviorSystem().detectConversationalDiscomfort(...args);
}
export function detectConversationalInterest(
  ...args: Parameters<BehaviorSystem['detectConversationalInterest']>
): ReturnType<BehaviorSystem['detectConversationalInterest']> {
  return getActiveBehaviorSystem().detectConversationalInterest(...args);
}
export function detectConversationalBoredom(
  ...args: Parameters<BehaviorSystem['detectConversationalBoredom']>
): ReturnType<BehaviorSystem['detectConversationalBoredom']> {
  return getActiveBehaviorSystem().detectConversationalBoredom(...args);
}
export function synchronizeConversationRhythm(
  ...args: Parameters<BehaviorSystem['synchronizeConversationRhythm']>
): ReturnType<BehaviorSystem['synchronizeConversationRhythm']> {
  return getActiveBehaviorSystem().synchronizeConversationRhythm(...args);
}
export function adjustInterpersonalDistance(
  ...args: Parameters<BehaviorSystem['adjustInterpersonalDistance']>
): ReturnType<BehaviorSystem['adjustInterpersonalDistance']> {
  return getActiveBehaviorSystem().adjustInterpersonalDistance(...args);
}
export function useAffiliativeGesture(
  ...args: Parameters<BehaviorSystem['useAffiliativeGesture']>
): ReturnType<BehaviorSystem['useAffiliativeGesture']> {
  return getActiveBehaviorSystem().useAffiliativeGesture(...args);
}
export function useDeescalationGesture(
  ...args: Parameters<BehaviorSystem['useDeescalationGesture']>
): ReturnType<BehaviorSystem['useDeescalationGesture']> {
  return getActiveBehaviorSystem().useDeescalationGesture(...args);
}
export function signalDisagreementNonverbally(
  ...args: Parameters<BehaviorSystem['signalDisagreementNonverbally']>
): ReturnType<BehaviorSystem['signalDisagreementNonverbally']> {
  return getActiveBehaviorSystem().signalDisagreementNonverbally(...args);
}
export function signalAgreementNonverbally(
  ...args: Parameters<BehaviorSystem['signalAgreementNonverbally']>
): ReturnType<BehaviorSystem['signalAgreementNonverbally']> {
  return getActiveBehaviorSystem().signalAgreementNonverbally(...args);
}
export function signalConfusionNonverbally(
  ...args: Parameters<BehaviorSystem['signalConfusionNonverbally']>
): ReturnType<BehaviorSystem['signalConfusionNonverbally']> {
  return getActiveBehaviorSystem().signalConfusionNonverbally(...args);
}
export function signalRequestToSpeak(
  ...args: Parameters<BehaviorSystem['signalRequestToSpeak']>
): ReturnType<BehaviorSystem['signalRequestToSpeak']> {
  return getActiveBehaviorSystem().signalRequestToSpeak(...args);
}
export function signalConversationClosure(
  ...args: Parameters<BehaviorSystem['signalConversationClosure']>
): ReturnType<BehaviorSystem['signalConversationClosure']> {
  return getActiveBehaviorSystem().signalConversationClosure(...args);
}
export function interpretPersonalSpaceViolation(
  ...args: Parameters<BehaviorSystem['interpretPersonalSpaceViolation']>
): ReturnType<BehaviorSystem['interpretPersonalSpaceViolation']> {
  return getActiveBehaviorSystem().interpretPersonalSpaceViolation(...args);
}
export function respondToUnwantedAttention(
  ...args: Parameters<BehaviorSystem['respondToUnwantedAttention']>
): ReturnType<BehaviorSystem['respondToUnwantedAttention']> {
  return getActiveBehaviorSystem().respondToUnwantedAttention(...args);
}
export function matchCommunicationStyle(
  ...args: Parameters<BehaviorSystem['matchCommunicationStyle']>
): ReturnType<BehaviorSystem['matchCommunicationStyle']> {
  return getActiveBehaviorSystem().matchCommunicationStyle(...args);
}
export function detectMixedSocialSignals(
  ...args: Parameters<BehaviorSystem['detectMixedSocialSignals']>
): ReturnType<BehaviorSystem['detectMixedSocialSignals']> {
  return getActiveBehaviorSystem().detectMixedSocialSignals(...args);
}
export function resolveNonverbalMisinterpretation(
  ...args: Parameters<BehaviorSystem['resolveNonverbalMisinterpretation']>
): ReturnType<BehaviorSystem['resolveNonverbalMisinterpretation']> {
  return getActiveBehaviorSystem().resolveNonverbalMisinterpretation(...args);
}
export function identifyCulturalContext(
  ...args: Parameters<BehaviorSystem['identifyCulturalContext']>
): ReturnType<BehaviorSystem['identifyCulturalContext']> {
  return getActiveBehaviorSystem().identifyCulturalContext(...args);
}
export function learnCulturalGreeting(
  ...args: Parameters<BehaviorSystem['learnCulturalGreeting']>
): ReturnType<BehaviorSystem['learnCulturalGreeting']> {
  return getActiveBehaviorSystem().learnCulturalGreeting(...args);
}
export function performSocialGreeting(
  ...args: Parameters<BehaviorSystem['performSocialGreeting']>
): ReturnType<BehaviorSystem['performSocialGreeting']> {
  return getActiveBehaviorSystem().performSocialGreeting(...args);
}
export function performFarewellRitual(
  ...args: Parameters<BehaviorSystem['performFarewellRitual']>
): ReturnType<BehaviorSystem['performFarewellRitual']> {
  return getActiveBehaviorSystem().performFarewellRitual(...args);
}
export function adaptPolitenessLevel(
  ...args: Parameters<BehaviorSystem['adaptPolitenessLevel']>
): ReturnType<BehaviorSystem['adaptPolitenessLevel']> {
  return getActiveBehaviorSystem().adaptPolitenessLevel(...args);
}
export function adaptHonorificUsage(
  ...args: Parameters<BehaviorSystem['adaptHonorificUsage']>
): ReturnType<BehaviorSystem['adaptHonorificUsage']> {
  return getActiveBehaviorSystem().adaptHonorificUsage(...args);
}
export function recognizeCulturalTaboo(
  ...args: Parameters<BehaviorSystem['recognizeCulturalTaboo']>
): ReturnType<BehaviorSystem['recognizeCulturalTaboo']> {
  return getActiveBehaviorSystem().recognizeCulturalTaboo(...args);
}
export function avoidCulturalOffense(
  ...args: Parameters<BehaviorSystem['avoidCulturalOffense']>
): ReturnType<BehaviorSystem['avoidCulturalOffense']> {
  return getActiveBehaviorSystem().avoidCulturalOffense(...args);
}
export function learnLocalCustom(
  ...args: Parameters<BehaviorSystem['learnLocalCustom']>
): ReturnType<BehaviorSystem['learnLocalCustom']> {
  return getActiveBehaviorSystem().learnLocalCustom(...args);
}
export function participateInCulturalRitual(
  ...args: Parameters<BehaviorSystem['participateInCulturalRitual']>
): ReturnType<BehaviorSystem['participateInCulturalRitual']> {
  return getActiveBehaviorSystem().participateInCulturalRitual(...args);
}
export function adaptGestureToCulture(
  ...args: Parameters<BehaviorSystem['adaptGestureToCulture']>
): ReturnType<BehaviorSystem['adaptGestureToCulture']> {
  return getActiveBehaviorSystem().adaptGestureToCulture(...args);
}
export function interpretCultureSpecificHumor(
  ...args: Parameters<BehaviorSystem['interpretCultureSpecificHumor']>
): ReturnType<BehaviorSystem['interpretCultureSpecificHumor']> {
  return getActiveBehaviorSystem().interpretCultureSpecificHumor(...args);
}
export function resolveCrossCulturalMisunderstanding(
  ...args: Parameters<BehaviorSystem['resolveCrossCulturalMisunderstanding']>
): ReturnType<BehaviorSystem['resolveCrossCulturalMisunderstanding']> {
  return getActiveBehaviorSystem().resolveCrossCulturalMisunderstanding(...args);
}
export function learnSecondLanguagePattern(
  ...args: Parameters<BehaviorSystem['learnSecondLanguagePattern']>
): ReturnType<BehaviorSystem['learnSecondLanguagePattern']> {
  return getActiveBehaviorSystem().learnSecondLanguagePattern(...args);
}
export function switchLanguageContextually(
  ...args: Parameters<BehaviorSystem['switchLanguageContextually']>
): ReturnType<BehaviorSystem['switchLanguageContextually']> {
  return getActiveBehaviorSystem().switchLanguageContextually(...args);
}
export function adaptAccentAndPronunciation(
  ...args: Parameters<BehaviorSystem['adaptAccentAndPronunciation']>
): ReturnType<BehaviorSystem['adaptAccentAndPronunciation']> {
  return getActiveBehaviorSystem().adaptAccentAndPronunciation(...args);
}
export function interpretIdiomaticExpression(
  ...args: Parameters<BehaviorSystem['interpretIdiomaticExpression']>
): ReturnType<BehaviorSystem['interpretIdiomaticExpression']> {
  return getActiveBehaviorSystem().interpretIdiomaticExpression(...args);
}
export function adaptConversationToCulture(
  ...args: Parameters<BehaviorSystem['adaptConversationToCulture']>
): ReturnType<BehaviorSystem['adaptConversationToCulture']> {
  return getActiveBehaviorSystem().adaptConversationToCulture(...args);
}
export function preserveCulturalIdentity(
  ...args: Parameters<BehaviorSystem['preserveCulturalIdentity']>
): ReturnType<BehaviorSystem['preserveCulturalIdentity']> {
  return getActiveBehaviorSystem().preserveCulturalIdentity(...args);
}
export function updateCulturalKnowledge(
  ...args: Parameters<BehaviorSystem['updateCulturalKnowledge']>
): ReturnType<BehaviorSystem['updateCulturalKnowledge']> {
  return getActiveBehaviorSystem().updateCulturalKnowledge(...args);
}
export function initAnimalAgent(
  ...args: Parameters<BehaviorSystem['initAnimalAgent']>
): ReturnType<BehaviorSystem['initAnimalAgent']> {
  return getActiveBehaviorSystem().initAnimalAgent(...args);
}
export function updateAnimalState(
  ...args: Parameters<BehaviorSystem['updateAnimalState']>
): ReturnType<BehaviorSystem['updateAnimalState']> {
  return getActiveBehaviorSystem().updateAnimalState(...args);
}
export function updateAnimalBehavior(
  ...args: Parameters<BehaviorSystem['updateAnimalBehavior']>
): ReturnType<BehaviorSystem['updateAnimalBehavior']> {
  return getActiveBehaviorSystem().updateAnimalBehavior(...args);
}
export function estimateAnimalArousal(
  ...args: Parameters<BehaviorSystem['estimateAnimalArousal']>
): ReturnType<BehaviorSystem['estimateAnimalArousal']> {
  return getActiveBehaviorSystem().estimateAnimalArousal(...args);
}
export function estimateAnimalValence(
  ...args: Parameters<BehaviorSystem['estimateAnimalValence']>
): ReturnType<BehaviorSystem['estimateAnimalValence']> {
  return getActiveBehaviorSystem().estimateAnimalValence(...args);
}
export function detectAnimalStress(
  ...args: Parameters<BehaviorSystem['detectAnimalStress']>
): ReturnType<BehaviorSystem['detectAnimalStress']> {
  return getActiveBehaviorSystem().detectAnimalStress(...args);
}
export function detectAnimalFear(
  ...args: Parameters<BehaviorSystem['detectAnimalFear']>
): ReturnType<BehaviorSystem['detectAnimalFear']> {
  return getActiveBehaviorSystem().detectAnimalFear(...args);
}
export function detectAnimalCuriosity(
  ...args: Parameters<BehaviorSystem['detectAnimalCuriosity']>
): ReturnType<BehaviorSystem['detectAnimalCuriosity']> {
  return getActiveBehaviorSystem().detectAnimalCuriosity(...args);
}
export function detectAnimalPlayfulness(
  ...args: Parameters<BehaviorSystem['detectAnimalPlayfulness']>
): ReturnType<BehaviorSystem['detectAnimalPlayfulness']> {
  return getActiveBehaviorSystem().detectAnimalPlayfulness(...args);
}
export function detectAnimalFrustration(
  ...args: Parameters<BehaviorSystem['detectAnimalFrustration']>
): ReturnType<BehaviorSystem['detectAnimalFrustration']> {
  return getActiveBehaviorSystem().detectAnimalFrustration(...args);
}
export function detectAnimalComfort(
  ...args: Parameters<BehaviorSystem['detectAnimalComfort']>
): ReturnType<BehaviorSystem['detectAnimalComfort']> {
  return getActiveBehaviorSystem().detectAnimalComfort(...args);
}
export function detectAnimalDiscomfort(
  ...args: Parameters<BehaviorSystem['detectAnimalDiscomfort']>
): ReturnType<BehaviorSystem['detectAnimalDiscomfort']> {
  return getActiveBehaviorSystem().detectAnimalDiscomfort(...args);
}
export function regulateAnimalArousal(
  ...args: Parameters<BehaviorSystem['regulateAnimalArousal']>
): ReturnType<BehaviorSystem['regulateAnimalArousal']> {
  return getActiveBehaviorSystem().regulateAnimalArousal(...args);
}
export function recoverAnimalStress(
  ...args: Parameters<BehaviorSystem['recoverAnimalStress']>
): ReturnType<BehaviorSystem['recoverAnimalStress']> {
  return getActiveBehaviorSystem().recoverAnimalStress(...args);
}
export function learnAnimalPreference(
  ...args: Parameters<BehaviorSystem['learnAnimalPreference']>
): ReturnType<BehaviorSystem['learnAnimalPreference']> {
  return getActiveBehaviorSystem().learnAnimalPreference(...args);
}
export function rememberAnimalExperience(
  ...args: Parameters<BehaviorSystem['rememberAnimalExperience']>
): ReturnType<BehaviorSystem['rememberAnimalExperience']> {
  return getActiveBehaviorSystem().rememberAnimalExperience(...args);
}
export function predictAnimalReaction(
  ...args: Parameters<BehaviorSystem['predictAnimalReaction']>
): ReturnType<BehaviorSystem['predictAnimalReaction']> {
  return getActiveBehaviorSystem().predictAnimalReaction(...args);
}
export function adaptAnimalBehavior(
  ...args: Parameters<BehaviorSystem['adaptAnimalBehavior']>
): ReturnType<BehaviorSystem['adaptAnimalBehavior']> {
  return getActiveBehaviorSystem().adaptAnimalBehavior(...args);
}
export function selectAnimalAction(
  ...args: Parameters<BehaviorSystem['selectAnimalAction']>
): ReturnType<BehaviorSystem['selectAnimalAction']> {
  return getActiveBehaviorSystem().selectAnimalAction(...args);
}
export function evaluateAnimalOutcome(
  ...args: Parameters<BehaviorSystem['evaluateAnimalOutcome']>
): ReturnType<BehaviorSystem['evaluateAnimalOutcome']> {
  return getActiveBehaviorSystem().evaluateAnimalOutcome(...args);
}
export function detectAnimalHunger(
  ...args: Parameters<BehaviorSystem['detectAnimalHunger']>
): ReturnType<BehaviorSystem['detectAnimalHunger']> {
  return getActiveBehaviorSystem().detectAnimalHunger(...args);
}
export function detectAnimalThirst(
  ...args: Parameters<BehaviorSystem['detectAnimalThirst']>
): ReturnType<BehaviorSystem['detectAnimalThirst']> {
  return getActiveBehaviorSystem().detectAnimalThirst(...args);
}
export function detectAnimalFatigue(
  ...args: Parameters<BehaviorSystem['detectAnimalFatigue']>
): ReturnType<BehaviorSystem['detectAnimalFatigue']> {
  return getActiveBehaviorSystem().detectAnimalFatigue(...args);
}
export function detectAnimalPain(
  ...args: Parameters<BehaviorSystem['detectAnimalPain']>
): ReturnType<BehaviorSystem['detectAnimalPain']> {
  return getActiveBehaviorSystem().detectAnimalPain(...args);
}
export function detectAnimalIllness(
  ...args: Parameters<BehaviorSystem['detectAnimalIllness']>
): ReturnType<BehaviorSystem['detectAnimalIllness']> {
  return getActiveBehaviorSystem().detectAnimalIllness(...args);
}
export function searchAnimalFood(
  ...args: Parameters<BehaviorSystem['searchAnimalFood']>
): ReturnType<BehaviorSystem['searchAnimalFood']> {
  return getActiveBehaviorSystem().searchAnimalFood(...args);
}
export function searchAnimalWater(
  ...args: Parameters<BehaviorSystem['searchAnimalWater']>
): ReturnType<BehaviorSystem['searchAnimalWater']> {
  return getActiveBehaviorSystem().searchAnimalWater(...args);
}
export function seekAnimalShelter(
  ...args: Parameters<BehaviorSystem['seekAnimalShelter']>
): ReturnType<BehaviorSystem['seekAnimalShelter']> {
  return getActiveBehaviorSystem().seekAnimalShelter(...args);
}
export function seekAnimalRestingPlace(
  ...args: Parameters<BehaviorSystem['seekAnimalRestingPlace']>
): ReturnType<BehaviorSystem['seekAnimalRestingPlace']> {
  return getActiveBehaviorSystem().seekAnimalRestingPlace(...args);
}
export function regulateAnimalBodyTemperature(
  ...args: Parameters<BehaviorSystem['regulateAnimalBodyTemperature']>
): ReturnType<BehaviorSystem['regulateAnimalBodyTemperature']> {
  return getActiveBehaviorSystem().regulateAnimalBodyTemperature(...args);
}
export function conserveAnimalEnergy(
  ...args: Parameters<BehaviorSystem['conserveAnimalEnergy']>
): ReturnType<BehaviorSystem['conserveAnimalEnergy']> {
  return getActiveBehaviorSystem().conserveAnimalEnergy(...args);
}
export function avoidAnimalPredator(
  ...args: Parameters<BehaviorSystem['avoidAnimalPredator']>
): ReturnType<BehaviorSystem['avoidAnimalPredator']> {
  return getActiveBehaviorSystem().avoidAnimalPredator(...args);
}
export function escapeAnimalThreat(
  ...args: Parameters<BehaviorSystem['escapeAnimalThreat']>
): ReturnType<BehaviorSystem['escapeAnimalThreat']> {
  return getActiveBehaviorSystem().escapeAnimalThreat(...args);
}
export function freezeAnimalResponse(
  ...args: Parameters<BehaviorSystem['freezeAnimalResponse']>
): ReturnType<BehaviorSystem['freezeAnimalResponse']> {
  return getActiveBehaviorSystem().freezeAnimalResponse(...args);
}
export function defendAnimalTerritory(
  ...args: Parameters<BehaviorSystem['defendAnimalTerritory']>
): ReturnType<BehaviorSystem['defendAnimalTerritory']> {
  return getActiveBehaviorSystem().defendAnimalTerritory(...args);
}
export function protectAnimalResource(
  ...args: Parameters<BehaviorSystem['protectAnimalResource']>
): ReturnType<BehaviorSystem['protectAnimalResource']> {
  return getActiveBehaviorSystem().protectAnimalResource(...args);
}
export function exploreAnimalEnvironment(
  ...args: Parameters<BehaviorSystem['exploreAnimalEnvironment']>
): ReturnType<BehaviorSystem['exploreAnimalEnvironment']> {
  return getActiveBehaviorSystem().exploreAnimalEnvironment(...args);
}
export function returnToAnimalShelter(
  ...args: Parameters<BehaviorSystem['returnToAnimalShelter']>
): ReturnType<BehaviorSystem['returnToAnimalShelter']> {
  return getActiveBehaviorSystem().returnToAnimalShelter(...args);
}
export function adaptAnimalActivityCycle(
  ...args: Parameters<BehaviorSystem['adaptAnimalActivityCycle']>
): ReturnType<BehaviorSystem['adaptAnimalActivityCycle']> {
  return getActiveBehaviorSystem().adaptAnimalActivityCycle(...args);
}
export function maintainAnimalHomeostasis(
  ...args: Parameters<BehaviorSystem['maintainAnimalHomeostasis']>
): ReturnType<BehaviorSystem['maintainAnimalHomeostasis']> {
  return getActiveBehaviorSystem().maintainAnimalHomeostasis(...args);
}
export function initDogBehavior(
  ...args: Parameters<BehaviorSystem['initDogBehavior']>
): ReturnType<BehaviorSystem['initDogBehavior']> {
  return getActiveBehaviorSystem().initDogBehavior(...args);
}
export function detectDogExcitement(
  ...args: Parameters<BehaviorSystem['detectDogExcitement']>
): ReturnType<BehaviorSystem['detectDogExcitement']> {
  return getActiveBehaviorSystem().detectDogExcitement(...args);
}
export function detectDogFear(
  ...args: Parameters<BehaviorSystem['detectDogFear']>
): ReturnType<BehaviorSystem['detectDogFear']> {
  return getActiveBehaviorSystem().detectDogFear(...args);
}
export function detectDogRelaxation(
  ...args: Parameters<BehaviorSystem['detectDogRelaxation']>
): ReturnType<BehaviorSystem['detectDogRelaxation']> {
  return getActiveBehaviorSystem().detectDogRelaxation(...args);
}
export function detectDogFrustration(
  ...args: Parameters<BehaviorSystem['detectDogFrustration']>
): ReturnType<BehaviorSystem['detectDogFrustration']> {
  return getActiveBehaviorSystem().detectDogFrustration(...args);
}
export function recognizeDogOwner(
  ...args: Parameters<BehaviorSystem['recognizeDogOwner']>
): ReturnType<BehaviorSystem['recognizeDogOwner']> {
  return getActiveBehaviorSystem().recognizeDogOwner(...args);
}
export function approachFamiliarHuman(
  ...args: Parameters<BehaviorSystem['approachFamiliarHuman']>
): ReturnType<BehaviorSystem['approachFamiliarHuman']> {
  return getActiveBehaviorSystem().approachFamiliarHuman(...args);
}
export function greetFamiliarHuman(
  ...args: Parameters<BehaviorSystem['greetFamiliarHuman']>
): ReturnType<BehaviorSystem['greetFamiliarHuman']> {
  return getActiveBehaviorSystem().greetFamiliarHuman(...args);
}
export function followHumanMovement(
  ...args: Parameters<BehaviorSystem['followHumanMovement']>
): ReturnType<BehaviorSystem['followHumanMovement']> {
  return getActiveBehaviorSystem().followHumanMovement(...args);
}
export function respondToDogName(
  ...args: Parameters<BehaviorSystem['respondToDogName']>
): ReturnType<BehaviorSystem['respondToDogName']> {
  return getActiveBehaviorSystem().respondToDogName(...args);
}
export function respondToTrainingCue(
  ...args: Parameters<BehaviorSystem['respondToTrainingCue']>
): ReturnType<BehaviorSystem['respondToTrainingCue']> {
  return getActiveBehaviorSystem().respondToTrainingCue(...args);
}
export function learnDogCommand(
  ...args: Parameters<BehaviorSystem['learnDogCommand']>
): ReturnType<BehaviorSystem['learnDogCommand']> {
  return getActiveBehaviorSystem().learnDogCommand(...args);
}
export function reinforceDogBehavior(
  ...args: Parameters<BehaviorSystem['reinforceDogBehavior']>
): ReturnType<BehaviorSystem['reinforceDogBehavior']> {
  return getActiveBehaviorSystem().reinforceDogBehavior(...args);
}
export function initiateDogPlay(
  ...args: Parameters<BehaviorSystem['initiateDogPlay']>
): ReturnType<BehaviorSystem['initiateDogPlay']> {
  return getActiveBehaviorSystem().initiateDogPlay(...args);
}
export function inviteDogPlay(
  ...args: Parameters<BehaviorSystem['inviteDogPlay']>
): ReturnType<BehaviorSystem['inviteDogPlay']> {
  return getActiveBehaviorSystem().inviteDogPlay(...args);
}
export function performDogTailMovement(
  ...args: Parameters<BehaviorSystem['performDogTailMovement']>
): ReturnType<BehaviorSystem['performDogTailMovement']> {
  return getActiveBehaviorSystem().performDogTailMovement(...args);
}
export function performDogEarMovement(
  ...args: Parameters<BehaviorSystem['performDogEarMovement']>
): ReturnType<BehaviorSystem['performDogEarMovement']> {
  return getActiveBehaviorSystem().performDogEarMovement(...args);
}
export function vocalizeDogBark(
  ...args: Parameters<BehaviorSystem['vocalizeDogBark']>
): ReturnType<BehaviorSystem['vocalizeDogBark']> {
  return getActiveBehaviorSystem().vocalizeDogBark(...args);
}
export function sniffEnvironmentalObject(
  ...args: Parameters<BehaviorSystem['sniffEnvironmentalObject']>
): ReturnType<BehaviorSystem['sniffEnvironmentalObject']> {
  return getActiveBehaviorSystem().sniffEnvironmentalObject(...args);
}
export function seekHumanReassurance(
  ...args: Parameters<BehaviorSystem['seekHumanReassurance']>
): ReturnType<BehaviorSystem['seekHumanReassurance']> {
  return getActiveBehaviorSystem().seekHumanReassurance(...args);
}
export function initCatBehavior(
  ...args: Parameters<BehaviorSystem['initCatBehavior']>
): ReturnType<BehaviorSystem['initCatBehavior']> {
  return getActiveBehaviorSystem().initCatBehavior(...args);
}
export function detectCatCuriosity(
  ...args: Parameters<BehaviorSystem['detectCatCuriosity']>
): ReturnType<BehaviorSystem['detectCatCuriosity']> {
  return getActiveBehaviorSystem().detectCatCuriosity(...args);
}
export function detectCatFear(
  ...args: Parameters<BehaviorSystem['detectCatFear']>
): ReturnType<BehaviorSystem['detectCatFear']> {
  return getActiveBehaviorSystem().detectCatFear(...args);
}
export function detectCatIrritation(
  ...args: Parameters<BehaviorSystem['detectCatIrritation']>
): ReturnType<BehaviorSystem['detectCatIrritation']> {
  return getActiveBehaviorSystem().detectCatIrritation(...args);
}
export function detectCatRelaxation(
  ...args: Parameters<BehaviorSystem['detectCatRelaxation']>
): ReturnType<BehaviorSystem['detectCatRelaxation']> {
  return getActiveBehaviorSystem().detectCatRelaxation(...args);
}
export function recognizeFamiliarCatHuman(
  ...args: Parameters<BehaviorSystem['recognizeFamiliarCatHuman']>
): ReturnType<BehaviorSystem['recognizeFamiliarCatHuman']> {
  return getActiveBehaviorSystem().recognizeFamiliarCatHuman(...args);
}
export function approachCatFamiliarHuman(
  ...args: Parameters<BehaviorSystem['approachCatFamiliarHuman']>
): ReturnType<BehaviorSystem['approachCatFamiliarHuman']> {
  return getActiveBehaviorSystem().approachCatFamiliarHuman(...args);
}
export function avoidCatUnfamiliarHuman(
  ...args: Parameters<BehaviorSystem['avoidCatUnfamiliarHuman']>
): ReturnType<BehaviorSystem['avoidCatUnfamiliarHuman']> {
  return getActiveBehaviorSystem().avoidCatUnfamiliarHuman(...args);
}
export function performCatTailSignal(
  ...args: Parameters<BehaviorSystem['performCatTailSignal']>
): ReturnType<BehaviorSystem['performCatTailSignal']> {
  return getActiveBehaviorSystem().performCatTailSignal(...args);
}
export function performCatEarSignal(
  ...args: Parameters<BehaviorSystem['performCatEarSignal']>
): ReturnType<BehaviorSystem['performCatEarSignal']> {
  return getActiveBehaviorSystem().performCatEarSignal(...args);
}
export function performCatPurring(
  ...args: Parameters<BehaviorSystem['performCatPurring']>
): ReturnType<BehaviorSystem['performCatPurring']> {
  return getActiveBehaviorSystem().performCatPurring(...args);
}
export function performCatMeowing(
  ...args: Parameters<BehaviorSystem['performCatMeowing']>
): ReturnType<BehaviorSystem['performCatMeowing']> {
  return getActiveBehaviorSystem().performCatMeowing(...args);
}
export function rubAgainstFamiliarObject(
  ...args: Parameters<BehaviorSystem['rubAgainstFamiliarObject']>
): ReturnType<BehaviorSystem['rubAgainstFamiliarObject']> {
  return getActiveBehaviorSystem().rubAgainstFamiliarObject(...args);
}
export function markCatTerritory(
  ...args: Parameters<BehaviorSystem['markCatTerritory']>
): ReturnType<BehaviorSystem['markCatTerritory']> {
  return getActiveBehaviorSystem().markCatTerritory(...args);
}
export function scratchCatSurface(
  ...args: Parameters<BehaviorSystem['scratchCatSurface']>
): ReturnType<BehaviorSystem['scratchCatSurface']> {
  return getActiveBehaviorSystem().scratchCatSurface(...args);
}
export function stalkCatPrey(
  ...args: Parameters<BehaviorSystem['stalkCatPrey']>
): ReturnType<BehaviorSystem['stalkCatPrey']> {
  return getActiveBehaviorSystem().stalkCatPrey(...args);
}
export function pounceOnCatTarget(
  ...args: Parameters<BehaviorSystem['pounceOnCatTarget']>
): ReturnType<BehaviorSystem['pounceOnCatTarget']> {
  return getActiveBehaviorSystem().pounceOnCatTarget(...args);
}
export function hideCatInShelter(
  ...args: Parameters<BehaviorSystem['hideCatInShelter']>
): ReturnType<BehaviorSystem['hideCatInShelter']> {
  return getActiveBehaviorSystem().hideCatInShelter(...args);
}
export function groomCatFur(
  ...args: Parameters<BehaviorSystem['groomCatFur']>
): ReturnType<BehaviorSystem['groomCatFur']> {
  return getActiveBehaviorSystem().groomCatFur(...args);
}
export function selectCatRestingSpot(
  ...args: Parameters<BehaviorSystem['selectCatRestingSpot']>
): ReturnType<BehaviorSystem['selectCatRestingSpot']> {
  return getActiveBehaviorSystem().selectCatRestingSpot(...args);
}
export function initBirdBehavior(
  ...args: Parameters<BehaviorSystem['initBirdBehavior']>
): ReturnType<BehaviorSystem['initBirdBehavior']> {
  return getActiveBehaviorSystem().initBirdBehavior(...args);
}
export function detectBirdThreat(
  ...args: Parameters<BehaviorSystem['detectBirdThreat']>
): ReturnType<BehaviorSystem['detectBirdThreat']> {
  return getActiveBehaviorSystem().detectBirdThreat(...args);
}
export function detectBirdFoodSource(
  ...args: Parameters<BehaviorSystem['detectBirdFoodSource']>
): ReturnType<BehaviorSystem['detectBirdFoodSource']> {
  return getActiveBehaviorSystem().detectBirdFoodSource(...args);
}
export function searchBirdFood(
  ...args: Parameters<BehaviorSystem['searchBirdFood']>
): ReturnType<BehaviorSystem['searchBirdFood']> {
  return getActiveBehaviorSystem().searchBirdFood(...args);
}
export function forageBirdGround(
  ...args: Parameters<BehaviorSystem['forageBirdGround']>
): ReturnType<BehaviorSystem['forageBirdGround']> {
  return getActiveBehaviorSystem().forageBirdGround(...args);
}
export function perchOnBranch(
  ...args: Parameters<BehaviorSystem['perchOnBranch']>
): ReturnType<BehaviorSystem['perchOnBranch']> {
  return getActiveBehaviorSystem().perchOnBranch(...args);
}
export function takeOffFromPerch(
  ...args: Parameters<BehaviorSystem['takeOffFromPerch']>
): ReturnType<BehaviorSystem['takeOffFromPerch']> {
  return getActiveBehaviorSystem().takeOffFromPerch(...args);
}
export function landOnPerch(
  ...args: Parameters<BehaviorSystem['landOnPerch']>
): ReturnType<BehaviorSystem['landOnPerch']> {
  return getActiveBehaviorSystem().landOnPerch(...args);
}
export function adjustBirdFlightPath(
  ...args: Parameters<BehaviorSystem['adjustBirdFlightPath']>
): ReturnType<BehaviorSystem['adjustBirdFlightPath']> {
  return getActiveBehaviorSystem().adjustBirdFlightPath(...args);
}
export function coordinateBirdFlock(
  ...args: Parameters<BehaviorSystem['coordinateBirdFlock']>
): ReturnType<BehaviorSystem['coordinateBirdFlock']> {
  return getActiveBehaviorSystem().coordinateBirdFlock(...args);
}
export function maintainBirdFlockDistance(
  ...args: Parameters<BehaviorSystem['maintainBirdFlockDistance']>
): ReturnType<BehaviorSystem['maintainBirdFlockDistance']> {
  return getActiveBehaviorSystem().maintainBirdFlockDistance(...args);
}
export function respondToBirdCall(
  ...args: Parameters<BehaviorSystem['respondToBirdCall']>
): ReturnType<BehaviorSystem['respondToBirdCall']> {
  return getActiveBehaviorSystem().respondToBirdCall(...args);
}
export function produceBirdSong(
  ...args: Parameters<BehaviorSystem['produceBirdSong']>
): ReturnType<BehaviorSystem['produceBirdSong']> {
  return getActiveBehaviorSystem().produceBirdSong(...args);
}
export function performBirdCourtship(
  ...args: Parameters<BehaviorSystem['performBirdCourtship']>
): ReturnType<BehaviorSystem['performBirdCourtship']> {
  return getActiveBehaviorSystem().performBirdCourtship(...args);
}
export function defendBirdNest(
  ...args: Parameters<BehaviorSystem['defendBirdNest']>
): ReturnType<BehaviorSystem['defendBirdNest']> {
  return getActiveBehaviorSystem().defendBirdNest(...args);
}
export function collectNestingMaterial(
  ...args: Parameters<BehaviorSystem['collectNestingMaterial']>
): ReturnType<BehaviorSystem['collectNestingMaterial']> {
  return getActiveBehaviorSystem().collectNestingMaterial(...args);
}
export function incubateBirdEggs(
  ...args: Parameters<BehaviorSystem['incubateBirdEggs']>
): ReturnType<BehaviorSystem['incubateBirdEggs']> {
  return getActiveBehaviorSystem().incubateBirdEggs(...args);
}
export function feedBirdChick(
  ...args: Parameters<BehaviorSystem['feedBirdChick']>
): ReturnType<BehaviorSystem['feedBirdChick']> {
  return getActiveBehaviorSystem().feedBirdChick(...args);
}
export function migrateWithBirdFlock(
  ...args: Parameters<BehaviorSystem['migrateWithBirdFlock']>
): ReturnType<BehaviorSystem['migrateWithBirdFlock']> {
  return getActiveBehaviorSystem().migrateWithBirdFlock(...args);
}
export function returnToBirdRoost(
  ...args: Parameters<BehaviorSystem['returnToBirdRoost']>
): ReturnType<BehaviorSystem['returnToBirdRoost']> {
  return getActiveBehaviorSystem().returnToBirdRoost(...args);
}
export function detectPrey(
  ...args: Parameters<BehaviorSystem['detectPrey']>
): ReturnType<BehaviorSystem['detectPrey']> {
  return getActiveBehaviorSystem().detectPrey(...args);
}
export function identifyPreySpecies(
  ...args: Parameters<BehaviorSystem['identifyPreySpecies']>
): ReturnType<BehaviorSystem['identifyPreySpecies']> {
  return getActiveBehaviorSystem().identifyPreySpecies(...args);
}
export function estimatePreyDistance(
  ...args: Parameters<BehaviorSystem['estimatePreyDistance']>
): ReturnType<BehaviorSystem['estimatePreyDistance']> {
  return getActiveBehaviorSystem().estimatePreyDistance(...args);
}
export function estimatePreySpeed(
  ...args: Parameters<BehaviorSystem['estimatePreySpeed']>
): ReturnType<BehaviorSystem['estimatePreySpeed']> {
  return getActiveBehaviorSystem().estimatePreySpeed(...args);
}
export function predictPreyTrajectory(
  ...args: Parameters<BehaviorSystem['predictPreyTrajectory']>
): ReturnType<BehaviorSystem['predictPreyTrajectory']> {
  return getActiveBehaviorSystem().predictPreyTrajectory(...args);
}
export function selectHuntingStrategy(
  ...args: Parameters<BehaviorSystem['selectHuntingStrategy']>
): ReturnType<BehaviorSystem['selectHuntingStrategy']> {
  return getActiveBehaviorSystem().selectHuntingStrategy(...args);
}
export function stalkPreyQuietly(
  ...args: Parameters<BehaviorSystem['stalkPreyQuietly']>
): ReturnType<BehaviorSystem['stalkPreyQuietly']> {
  return getActiveBehaviorSystem().stalkPreyQuietly(...args);
}
export function approachPreyUnderCover(
  ...args: Parameters<BehaviorSystem['approachPreyUnderCover']>
): ReturnType<BehaviorSystem['approachPreyUnderCover']> {
  return getActiveBehaviorSystem().approachPreyUnderCover(...args);
}
export function waitForHuntingOpportunity(
  ...args: Parameters<BehaviorSystem['waitForHuntingOpportunity']>
): ReturnType<BehaviorSystem['waitForHuntingOpportunity']> {
  return getActiveBehaviorSystem().waitForHuntingOpportunity(...args);
}
export function initiatePredatoryChase(
  ...args: Parameters<BehaviorSystem['initiatePredatoryChase']>
): ReturnType<BehaviorSystem['initiatePredatoryChase']> {
  return getActiveBehaviorSystem().initiatePredatoryChase(...args);
}
export function adjustChaseSpeed(
  ...args: Parameters<BehaviorSystem['adjustChaseSpeed']>
): ReturnType<BehaviorSystem['adjustChaseSpeed']> {
  return getActiveBehaviorSystem().adjustChaseSpeed(...args);
}
export function interceptMovingPrey(
  ...args: Parameters<BehaviorSystem['interceptMovingPrey']>
): ReturnType<BehaviorSystem['interceptMovingPrey']> {
  return getActiveBehaviorSystem().interceptMovingPrey(...args);
}
export function abortUnsuccessfulHunt(
  ...args: Parameters<BehaviorSystem['abortUnsuccessfulHunt']>
): ReturnType<BehaviorSystem['abortUnsuccessfulHunt']> {
  return getActiveBehaviorSystem().abortUnsuccessfulHunt(...args);
}
export function capturePrey(
  ...args: Parameters<BehaviorSystem['capturePrey']>
): ReturnType<BehaviorSystem['capturePrey']> {
  return getActiveBehaviorSystem().capturePrey(...args);
}
export function secureCapturedPrey(
  ...args: Parameters<BehaviorSystem['secureCapturedPrey']>
): ReturnType<BehaviorSystem['secureCapturedPrey']> {
  return getActiveBehaviorSystem().secureCapturedPrey(...args);
}
export function consumeCapturedPrey(
  ...args: Parameters<BehaviorSystem['consumeCapturedPrey']>
): ReturnType<BehaviorSystem['consumeCapturedPrey']> {
  return getActiveBehaviorSystem().consumeCapturedPrey(...args);
}
export function sharePreyWithGroup(
  ...args: Parameters<BehaviorSystem['sharePreyWithGroup']>
): ReturnType<BehaviorSystem['sharePreyWithGroup']> {
  return getActiveBehaviorSystem().sharePreyWithGroup(...args);
}
export function defendFoodFromScavenger(
  ...args: Parameters<BehaviorSystem['defendFoodFromScavenger']>
): ReturnType<BehaviorSystem['defendFoodFromScavenger']> {
  return getActiveBehaviorSystem().defendFoodFromScavenger(...args);
}
export function learnHuntingLocation(
  ...args: Parameters<BehaviorSystem['learnHuntingLocation']>
): ReturnType<BehaviorSystem['learnHuntingLocation']> {
  return getActiveBehaviorSystem().learnHuntingLocation(...args);
}
export function improveHuntingTechnique(
  ...args: Parameters<BehaviorSystem['improveHuntingTechnique']>
): ReturnType<BehaviorSystem['improveHuntingTechnique']> {
  return getActiveBehaviorSystem().improveHuntingTechnique(...args);
}
export function initHerbivoreBehavior(
  ...args: Parameters<BehaviorSystem['initHerbivoreBehavior']>
): ReturnType<BehaviorSystem['initHerbivoreBehavior']> {
  return getActiveBehaviorSystem().initHerbivoreBehavior(...args);
}
export function detectEdibleVegetation(
  ...args: Parameters<BehaviorSystem['detectEdibleVegetation']>
): ReturnType<BehaviorSystem['detectEdibleVegetation']> {
  return getActiveBehaviorSystem().detectEdibleVegetation(...args);
}
export function identifyPlantSpecies(
  ...args: Parameters<BehaviorSystem['identifyPlantSpecies']>
): ReturnType<BehaviorSystem['identifyPlantSpecies']> {
  return getActiveBehaviorSystem().identifyPlantSpecies(...args);
}
export function evaluatePlantPalatability(
  ...args: Parameters<BehaviorSystem['evaluatePlantPalatability']>
): ReturnType<BehaviorSystem['evaluatePlantPalatability']> {
  return getActiveBehaviorSystem().evaluatePlantPalatability(...args);
}
export function avoidToxicPlant(
  ...args: Parameters<BehaviorSystem['avoidToxicPlant']>
): ReturnType<BehaviorSystem['avoidToxicPlant']> {
  return getActiveBehaviorSystem().avoidToxicPlant(...args);
}
export function selectGrazingArea(
  ...args: Parameters<BehaviorSystem['selectGrazingArea']>
): ReturnType<BehaviorSystem['selectGrazingArea']> {
  return getActiveBehaviorSystem().selectGrazingArea(...args);
}
export function beginGrazing(
  ...args: Parameters<BehaviorSystem['beginGrazing']>
): ReturnType<BehaviorSystem['beginGrazing']> {
  return getActiveBehaviorSystem().beginGrazing(...args);
}
export function adjustGrazingRate(
  ...args: Parameters<BehaviorSystem['adjustGrazingRate']>
): ReturnType<BehaviorSystem['adjustGrazingRate']> {
  return getActiveBehaviorSystem().adjustGrazingRate(...args);
}
export function browseShrubLeaves(
  ...args: Parameters<BehaviorSystem['browseShrubLeaves']>
): ReturnType<BehaviorSystem['browseShrubLeaves']> {
  return getActiveBehaviorSystem().browseShrubLeaves(...args);
}
export function searchSeasonalForage(
  ...args: Parameters<BehaviorSystem['searchSeasonalForage']>
): ReturnType<BehaviorSystem['searchSeasonalForage']> {
  return getActiveBehaviorSystem().searchSeasonalForage(...args);
}
export function moveBetweenFeedingPatches(
  ...args: Parameters<BehaviorSystem['moveBetweenFeedingPatches']>
): ReturnType<BehaviorSystem['moveBetweenFeedingPatches']> {
  return getActiveBehaviorSystem().moveBetweenFeedingPatches(...args);
}
export function monitorPredatorWhileFeeding(
  ...args: Parameters<BehaviorSystem['monitorPredatorWhileFeeding']>
): ReturnType<BehaviorSystem['monitorPredatorWhileFeeding']> {
  return getActiveBehaviorSystem().monitorPredatorWhileFeeding(...args);
}
export function interruptGrazingForSafety(
  ...args: Parameters<BehaviorSystem['interruptGrazingForSafety']>
): ReturnType<BehaviorSystem['interruptGrazingForSafety']> {
  return getActiveBehaviorSystem().interruptGrazingForSafety(...args);
}
export function returnToGrazingArea(
  ...args: Parameters<BehaviorSystem['returnToGrazingArea']>
): ReturnType<BehaviorSystem['returnToGrazingArea']> {
  return getActiveBehaviorSystem().returnToGrazingArea(...args);
}
export function competeForGrazingSpace(
  ...args: Parameters<BehaviorSystem['competeForGrazingSpace']>
): ReturnType<BehaviorSystem['competeForGrazingSpace']> {
  return getActiveBehaviorSystem().competeForGrazingSpace(...args);
}
export function shareForagingArea(
  ...args: Parameters<BehaviorSystem['shareForagingArea']>
): ReturnType<BehaviorSystem['shareForagingArea']> {
  return getActiveBehaviorSystem().shareForagingArea(...args);
}
export function learnSeasonalFoodLocation(
  ...args: Parameters<BehaviorSystem['learnSeasonalFoodLocation']>
): ReturnType<BehaviorSystem['learnSeasonalFoodLocation']> {
  return getActiveBehaviorSystem().learnSeasonalFoodLocation(...args);
}
export function adaptDietToSeason(
  ...args: Parameters<BehaviorSystem['adaptDietToSeason']>
): ReturnType<BehaviorSystem['adaptDietToSeason']> {
  return getActiveBehaviorSystem().adaptDietToSeason(...args);
}
export function regurgitateForRuminantDigestion(
  ...args: Parameters<BehaviorSystem['regurgitateForRuminantDigestion']>
): ReturnType<BehaviorSystem['regurgitateForRuminantDigestion']> {
  return getActiveBehaviorSystem().regurgitateForRuminantDigestion(...args);
}
export function selectMineralLick(
  ...args: Parameters<BehaviorSystem['selectMineralLick']>
): ReturnType<BehaviorSystem['selectMineralLick']> {
  return getActiveBehaviorSystem().selectMineralLick(...args);
}
export function initAnimalGroup(
  ...args: Parameters<BehaviorSystem['initAnimalGroup']>
): ReturnType<BehaviorSystem['initAnimalGroup']> {
  return getActiveBehaviorSystem().initAnimalGroup(...args);
}
export function recognizeGroupMember(
  ...args: Parameters<BehaviorSystem['recognizeGroupMember']>
): ReturnType<BehaviorSystem['recognizeGroupMember']> {
  return getActiveBehaviorSystem().recognizeGroupMember(...args);
}
export function maintainGroupCohesion(
  ...args: Parameters<BehaviorSystem['maintainGroupCohesion']>
): ReturnType<BehaviorSystem['maintainGroupCohesion']> {
  return getActiveBehaviorSystem().maintainGroupCohesion(...args);
}
export function followGroupLeader(
  ...args: Parameters<BehaviorSystem['followGroupLeader']>
): ReturnType<BehaviorSystem['followGroupLeader']> {
  return getActiveBehaviorSystem().followGroupLeader(...args);
}
export function establishDominanceRelationship(
  ...args: Parameters<BehaviorSystem['establishDominanceRelationship']>
): ReturnType<BehaviorSystem['establishDominanceRelationship']> {
  return getActiveBehaviorSystem().establishDominanceRelationship(...args);
}
export function displayDominanceSignal(
  ...args: Parameters<BehaviorSystem['displayDominanceSignal']>
): ReturnType<BehaviorSystem['displayDominanceSignal']> {
  return getActiveBehaviorSystem().displayDominanceSignal(...args);
}
export function displaySubmissionSignal(
  ...args: Parameters<BehaviorSystem['displaySubmissionSignal']>
): ReturnType<BehaviorSystem['displaySubmissionSignal']> {
  return getActiveBehaviorSystem().displaySubmissionSignal(...args);
}
export function challengeGroupRank(
  ...args: Parameters<BehaviorSystem['challengeGroupRank']>
): ReturnType<BehaviorSystem['challengeGroupRank']> {
  return getActiveBehaviorSystem().challengeGroupRank(...args);
}
export function resolveDominanceConflict(
  ...args: Parameters<BehaviorSystem['resolveDominanceConflict']>
): ReturnType<BehaviorSystem['resolveDominanceConflict']> {
  return getActiveBehaviorSystem().resolveDominanceConflict(...args);
}
export function protectGroupMember(
  ...args: Parameters<BehaviorSystem['protectGroupMember']>
): ReturnType<BehaviorSystem['protectGroupMember']> {
  return getActiveBehaviorSystem().protectGroupMember(...args);
}
export function warnGroupOfPredator(
  ...args: Parameters<BehaviorSystem['warnGroupOfPredator']>
): ReturnType<BehaviorSystem['warnGroupOfPredator']> {
  return getActiveBehaviorSystem().warnGroupOfPredator(...args);
}
export function followGroupAlarmSignal(
  ...args: Parameters<BehaviorSystem['followGroupAlarmSignal']>
): ReturnType<BehaviorSystem['followGroupAlarmSignal']> {
  return getActiveBehaviorSystem().followGroupAlarmSignal(...args);
}
export function coordinateGroupForaging(
  ...args: Parameters<BehaviorSystem['coordinateGroupForaging']>
): ReturnType<BehaviorSystem['coordinateGroupForaging']> {
  return getActiveBehaviorSystem().coordinateGroupForaging(...args);
}
export function coordinateGroupMigration(
  ...args: Parameters<BehaviorSystem['coordinateGroupMigration']>
): ReturnType<BehaviorSystem['coordinateGroupMigration']> {
  return getActiveBehaviorSystem().coordinateGroupMigration(...args);
}
export function maintainGroupSpacing(
  ...args: Parameters<BehaviorSystem['maintainGroupSpacing']>
): ReturnType<BehaviorSystem['maintainGroupSpacing']> {
  return getActiveBehaviorSystem().maintainGroupSpacing(...args);
}
export function rejoinSeparatedGroup(
  ...args: Parameters<BehaviorSystem['rejoinSeparatedGroup']>
): ReturnType<BehaviorSystem['rejoinSeparatedGroup']> {
  return getActiveBehaviorSystem().rejoinSeparatedGroup(...args);
}
export function recognizeGroupFamiliarity(
  ...args: Parameters<BehaviorSystem['recognizeGroupFamiliarity']>
): ReturnType<BehaviorSystem['recognizeGroupFamiliarity']> {
  return getActiveBehaviorSystem().recognizeGroupFamiliarity(...args);
}
export function mediateGroupAggression(
  ...args: Parameters<BehaviorSystem['mediateGroupAggression']>
): ReturnType<BehaviorSystem['mediateGroupAggression']> {
  return getActiveBehaviorSystem().mediateGroupAggression(...args);
}
export function careForGroupOffspring(
  ...args: Parameters<BehaviorSystem['careForGroupOffspring']>
): ReturnType<BehaviorSystem['careForGroupOffspring']> {
  return getActiveBehaviorSystem().careForGroupOffspring(...args);
}
export function adaptGroupMembership(
  ...args: Parameters<BehaviorSystem['adaptGroupMembership']>
): ReturnType<BehaviorSystem['adaptGroupMembership']> {
  return getActiveBehaviorSystem().adaptGroupMembership(...args);
}
export function initAnimalVocalization(
  ...args: Parameters<BehaviorSystem['initAnimalVocalization']>
): ReturnType<BehaviorSystem['initAnimalVocalization']> {
  return getActiveBehaviorSystem().initAnimalVocalization(...args);
}
export function generateAlarmCall(
  ...args: Parameters<BehaviorSystem['generateAlarmCall']>
): ReturnType<BehaviorSystem['generateAlarmCall']> {
  return getActiveBehaviorSystem().generateAlarmCall(...args);
}
export function generateContactCall(
  ...args: Parameters<BehaviorSystem['generateContactCall']>
): ReturnType<BehaviorSystem['generateContactCall']> {
  return getActiveBehaviorSystem().generateContactCall(...args);
}
export function generateCourtshipCall(
  ...args: Parameters<BehaviorSystem['generateCourtshipCall']>
): ReturnType<BehaviorSystem['generateCourtshipCall']> {
  return getActiveBehaviorSystem().generateCourtshipCall(...args);
}
export function generateTerritorialCall(
  ...args: Parameters<BehaviorSystem['generateTerritorialCall']>
): ReturnType<BehaviorSystem['generateTerritorialCall']> {
  return getActiveBehaviorSystem().generateTerritorialCall(...args);
}
export function generateDistressCall(
  ...args: Parameters<BehaviorSystem['generateDistressCall']>
): ReturnType<BehaviorSystem['generateDistressCall']> {
  return getActiveBehaviorSystem().generateDistressCall(...args);
}
export function generateFoodSolicitationCall(
  ...args: Parameters<BehaviorSystem['generateFoodSolicitationCall']>
): ReturnType<BehaviorSystem['generateFoodSolicitationCall']> {
  return getActiveBehaviorSystem().generateFoodSolicitationCall(...args);
}
export function recognizeConspecificCall(
  ...args: Parameters<BehaviorSystem['recognizeConspecificCall']>
): ReturnType<BehaviorSystem['recognizeConspecificCall']> {
  return getActiveBehaviorSystem().recognizeConspecificCall(...args);
}
export function localizeSoundSource(
  ...args: Parameters<BehaviorSystem['localizeSoundSource']>
): ReturnType<BehaviorSystem['localizeSoundSource']> {
  return getActiveBehaviorSystem().localizeSoundSource(...args);
}
export function estimateCallerDistance(
  ...args: Parameters<BehaviorSystem['estimateCallerDistance']>
): ReturnType<BehaviorSystem['estimateCallerDistance']> {
  return getActiveBehaviorSystem().estimateCallerDistance(...args);
}
export function identifyCallerIndividual(
  ...args: Parameters<BehaviorSystem['identifyCallerIndividual']>
): ReturnType<BehaviorSystem['identifyCallerIndividual']> {
  return getActiveBehaviorSystem().identifyCallerIndividual(...args);
}
export function respondToAlarmCall(
  ...args: Parameters<BehaviorSystem['respondToAlarmCall']>
): ReturnType<BehaviorSystem['respondToAlarmCall']> {
  return getActiveBehaviorSystem().respondToAlarmCall(...args);
}
export function respondToCourtshipCall(
  ...args: Parameters<BehaviorSystem['respondToCourtshipCall']>
): ReturnType<BehaviorSystem['respondToCourtshipCall']> {
  return getActiveBehaviorSystem().respondToCourtshipCall(...args);
}
export function imitateAnimalVocalization(
  ...args: Parameters<BehaviorSystem['imitateAnimalVocalization']>
): ReturnType<BehaviorSystem['imitateAnimalVocalization']> {
  return getActiveBehaviorSystem().imitateAnimalVocalization(...args);
}
export function learnVocalizationPattern(
  ...args: Parameters<BehaviorSystem['learnVocalizationPattern']>
): ReturnType<BehaviorSystem['learnVocalizationPattern']> {
  return getActiveBehaviorSystem().learnVocalizationPattern(...args);
}
export function adjustVocalizationVolume(
  ...args: Parameters<BehaviorSystem['adjustVocalizationVolume']>
): ReturnType<BehaviorSystem['adjustVocalizationVolume']> {
  return getActiveBehaviorSystem().adjustVocalizationVolume(...args);
}
export function adjustVocalizationRate(
  ...args: Parameters<BehaviorSystem['adjustVocalizationRate']>
): ReturnType<BehaviorSystem['adjustVocalizationRate']> {
  return getActiveBehaviorSystem().adjustVocalizationRate(...args);
}
export function synchronizeGroupCalling(
  ...args: Parameters<BehaviorSystem['synchronizeGroupCalling']>
): ReturnType<BehaviorSystem['synchronizeGroupCalling']> {
  return getActiveBehaviorSystem().synchronizeGroupCalling(...args);
}
export function suppressVocalizationWhenHiding(
  ...args: Parameters<BehaviorSystem['suppressVocalizationWhenHiding']>
): ReturnType<BehaviorSystem['suppressVocalizationWhenHiding']> {
  return getActiveBehaviorSystem().suppressVocalizationWhenHiding(...args);
}
export function adaptCallToEnvironment(
  ...args: Parameters<BehaviorSystem['adaptCallToEnvironment']>
): ReturnType<BehaviorSystem['adaptCallToEnvironment']> {
  return getActiveBehaviorSystem().adaptCallToEnvironment(...args);
}
export function detectEnvironmentalOdor(
  ...args: Parameters<BehaviorSystem['detectEnvironmentalOdor']>
): ReturnType<BehaviorSystem['detectEnvironmentalOdor']> {
  return getActiveBehaviorSystem().detectEnvironmentalOdor(...args);
}
export function classifyOdorSource(
  ...args: Parameters<BehaviorSystem['classifyOdorSource']>
): ReturnType<BehaviorSystem['classifyOdorSource']> {
  return getActiveBehaviorSystem().classifyOdorSource(...args);
}
export function trackScentTrail(
  ...args: Parameters<BehaviorSystem['trackScentTrail']>
): ReturnType<BehaviorSystem['trackScentTrail']> {
  return getActiveBehaviorSystem().trackScentTrail(...args);
}
export function estimateScentDirection(
  ...args: Parameters<BehaviorSystem['estimateScentDirection']>
): ReturnType<BehaviorSystem['estimateScentDirection']> {
  return getActiveBehaviorSystem().estimateScentDirection(...args);
}
export function estimateScentFreshness(
  ...args: Parameters<BehaviorSystem['estimateScentFreshness']>
): ReturnType<BehaviorSystem['estimateScentFreshness']> {
  return getActiveBehaviorSystem().estimateScentFreshness(...args);
}
export function recognizeIndividualScent(
  ...args: Parameters<BehaviorSystem['recognizeIndividualScent']>
): ReturnType<BehaviorSystem['recognizeIndividualScent']> {
  return getActiveBehaviorSystem().recognizeIndividualScent(...args);
}
export function recognizeKinScent(
  ...args: Parameters<BehaviorSystem['recognizeKinScent']>
): ReturnType<BehaviorSystem['recognizeKinScent']> {
  return getActiveBehaviorSystem().recognizeKinScent(...args);
}
export function recognizePredatorScent(
  ...args: Parameters<BehaviorSystem['recognizePredatorScent']>
): ReturnType<BehaviorSystem['recognizePredatorScent']> {
  return getActiveBehaviorSystem().recognizePredatorScent(...args);
}
export function recognizeFoodScent(
  ...args: Parameters<BehaviorSystem['recognizeFoodScent']>
): ReturnType<BehaviorSystem['recognizeFoodScent']> {
  return getActiveBehaviorSystem().recognizeFoodScent(...args);
}
export function recognizeMatingSignal(
  ...args: Parameters<BehaviorSystem['recognizeMatingSignal']>
): ReturnType<BehaviorSystem['recognizeMatingSignal']> {
  return getActiveBehaviorSystem().recognizeMatingSignal(...args);
}
export function performScentMarking(
  ...args: Parameters<BehaviorSystem['performScentMarking']>
): ReturnType<BehaviorSystem['performScentMarking']> {
  return getActiveBehaviorSystem().performScentMarking(...args);
}
export function refreshTerritorialScent(
  ...args: Parameters<BehaviorSystem['refreshTerritorialScent']>
): ReturnType<BehaviorSystem['refreshTerritorialScent']> {
  return getActiveBehaviorSystem().refreshTerritorialScent(...args);
}
export function investigateScentMark(
  ...args: Parameters<BehaviorSystem['investigateScentMark']>
): ReturnType<BehaviorSystem['investigateScentMark']> {
  return getActiveBehaviorSystem().investigateScentMark(...args);
}
export function avoidUnknownScent(
  ...args: Parameters<BehaviorSystem['avoidUnknownScent']>
): ReturnType<BehaviorSystem['avoidUnknownScent']> {
  return getActiveBehaviorSystem().avoidUnknownScent(...args);
}
export function followChemicalTrail(
  ...args: Parameters<BehaviorSystem['followChemicalTrail']>
): ReturnType<BehaviorSystem['followChemicalTrail']> {
  return getActiveBehaviorSystem().followChemicalTrail(...args);
}
export function compareMultipleOdors(
  ...args: Parameters<BehaviorSystem['compareMultipleOdors']>
): ReturnType<BehaviorSystem['compareMultipleOdors']> {
  return getActiveBehaviorSystem().compareMultipleOdors(...args);
}
export function learnFamiliarOdor(
  ...args: Parameters<BehaviorSystem['learnFamiliarOdor']>
): ReturnType<BehaviorSystem['learnFamiliarOdor']> {
  return getActiveBehaviorSystem().learnFamiliarOdor(...args);
}
export function respondToAlarmPheromone(
  ...args: Parameters<BehaviorSystem['respondToAlarmPheromone']>
): ReturnType<BehaviorSystem['respondToAlarmPheromone']> {
  return getActiveBehaviorSystem().respondToAlarmPheromone(...args);
}
export function respondToSocialPheromone(
  ...args: Parameters<BehaviorSystem['respondToSocialPheromone']>
): ReturnType<BehaviorSystem['respondToSocialPheromone']> {
  return getActiveBehaviorSystem().respondToSocialPheromone(...args);
}
export function updateOlfactoryMemory(
  ...args: Parameters<BehaviorSystem['updateOlfactoryMemory']>
): ReturnType<BehaviorSystem['updateOlfactoryMemory']> {
  return getActiveBehaviorSystem().updateOlfactoryMemory(...args);
}
export function updateAnimalVisualField(
  ...args: Parameters<BehaviorSystem['updateAnimalVisualField']>
): ReturnType<BehaviorSystem['updateAnimalVisualField']> {
  return getActiveBehaviorSystem().updateAnimalVisualField(...args);
}
export function detectMovingObject(
  ...args: Parameters<BehaviorSystem['detectMovingObject']>
): ReturnType<BehaviorSystem['detectMovingObject']> {
  return getActiveBehaviorSystem().detectMovingObject(...args);
}
export function trackMovingTarget(
  ...args: Parameters<BehaviorSystem['trackMovingTarget']>
): ReturnType<BehaviorSystem['trackMovingTarget']> {
  return getActiveBehaviorSystem().trackMovingTarget(...args);
}
export function detectCamouflagedObject(
  ...args: Parameters<BehaviorSystem['detectCamouflagedObject']>
): ReturnType<BehaviorSystem['detectCamouflagedObject']> {
  return getActiveBehaviorSystem().detectCamouflagedObject(...args);
}
export function estimateVisualDepth(
  ...args: Parameters<BehaviorSystem['estimateVisualDepth']>
): ReturnType<BehaviorSystem['estimateVisualDepth']> {
  return getActiveBehaviorSystem().estimateVisualDepth(...args);
}
export function adaptVisionToLowLight(
  ...args: Parameters<BehaviorSystem['adaptVisionToLowLight']>
): ReturnType<BehaviorSystem['adaptVisionToLowLight']> {
  return getActiveBehaviorSystem().adaptVisionToLowLight(...args);
}
export function detectUltrasonicSignal(
  ...args: Parameters<BehaviorSystem['detectUltrasonicSignal']>
): ReturnType<BehaviorSystem['detectUltrasonicSignal']> {
  return getActiveBehaviorSystem().detectUltrasonicSignal(...args);
}
export function detectLowFrequencySound(
  ...args: Parameters<BehaviorSystem['detectLowFrequencySound']>
): ReturnType<BehaviorSystem['detectLowFrequencySound']> {
  return getActiveBehaviorSystem().detectLowFrequencySound(...args);
}
export function orientUsingSound(
  ...args: Parameters<BehaviorSystem['orientUsingSound']>
): ReturnType<BehaviorSystem['orientUsingSound']> {
  return getActiveBehaviorSystem().orientUsingSound(...args);
}
export function orientUsingSunPosition(
  ...args: Parameters<BehaviorSystem['orientUsingSunPosition']>
): ReturnType<BehaviorSystem['orientUsingSunPosition']> {
  return getActiveBehaviorSystem().orientUsingSunPosition(...args);
}
export function orientUsingStarPattern(
  ...args: Parameters<BehaviorSystem['orientUsingStarPattern']>
): ReturnType<BehaviorSystem['orientUsingStarPattern']> {
  return getActiveBehaviorSystem().orientUsingStarPattern(...args);
}
export function orientUsingMagneticField(
  ...args: Parameters<BehaviorSystem['orientUsingMagneticField']>
): ReturnType<BehaviorSystem['orientUsingMagneticField']> {
  return getActiveBehaviorSystem().orientUsingMagneticField(...args);
}
export function orientUsingLandmark(
  ...args: Parameters<BehaviorSystem['orientUsingLandmark']>
): ReturnType<BehaviorSystem['orientUsingLandmark']> {
  return getActiveBehaviorSystem().orientUsingLandmark(...args);
}
export function estimateTravelDirection(
  ...args: Parameters<BehaviorSystem['estimateTravelDirection']>
): ReturnType<BehaviorSystem['estimateTravelDirection']> {
  return getActiveBehaviorSystem().estimateTravelDirection(...args);
}
export function rememberMigrationRoute(
  ...args: Parameters<BehaviorSystem['rememberMigrationRoute']>
): ReturnType<BehaviorSystem['rememberMigrationRoute']> {
  return getActiveBehaviorSystem().rememberMigrationRoute(...args);
}
export function avoidVisualObstacle(
  ...args: Parameters<BehaviorSystem['avoidVisualObstacle']>
): ReturnType<BehaviorSystem['avoidVisualObstacle']> {
  return getActiveBehaviorSystem().avoidVisualObstacle(...args);
}
export function detectWaterSurface(
  ...args: Parameters<BehaviorSystem['detectWaterSurface']>
): ReturnType<BehaviorSystem['detectWaterSurface']> {
  return getActiveBehaviorSystem().detectWaterSurface(...args);
}
export function detectShelterOpening(
  ...args: Parameters<BehaviorSystem['detectShelterOpening']>
): ReturnType<BehaviorSystem['detectShelterOpening']> {
  return getActiveBehaviorSystem().detectShelterOpening(...args);
}
export function updateSpatialMemory(
  ...args: Parameters<BehaviorSystem['updateSpatialMemory']>
): ReturnType<BehaviorSystem['updateSpatialMemory']> {
  return getActiveBehaviorSystem().updateSpatialMemory(...args);
}
export function reorientAfterDisplacement(
  ...args: Parameters<BehaviorSystem['reorientAfterDisplacement']>
): ReturnType<BehaviorSystem['reorientAfterDisplacement']> {
  return getActiveBehaviorSystem().reorientAfterDisplacement(...args);
}
export function detectReproductiveReadiness(
  ...args: Parameters<BehaviorSystem['detectReproductiveReadiness']>
): ReturnType<BehaviorSystem['detectReproductiveReadiness']> {
  return getActiveBehaviorSystem().detectReproductiveReadiness(...args);
}
export function detectPotentialMate(
  ...args: Parameters<BehaviorSystem['detectPotentialMate']>
): ReturnType<BehaviorSystem['detectPotentialMate']> {
  return getActiveBehaviorSystem().detectPotentialMate(...args);
}
export function evaluateMateCompatibility(
  ...args: Parameters<BehaviorSystem['evaluateMateCompatibility']>
): ReturnType<BehaviorSystem['evaluateMateCompatibility']> {
  return getActiveBehaviorSystem().evaluateMateCompatibility(...args);
}
export function performCourtshipDisplay(
  ...args: Parameters<BehaviorSystem['performCourtshipDisplay']>
): ReturnType<BehaviorSystem['performCourtshipDisplay']> {
  return getActiveBehaviorSystem().performCourtshipDisplay(...args);
}
export function respondToCourtshipDisplay(
  ...args: Parameters<BehaviorSystem['respondToCourtshipDisplay']>
): ReturnType<BehaviorSystem['respondToCourtshipDisplay']> {
  return getActiveBehaviorSystem().respondToCourtshipDisplay(...args);
}
export function competeForMate(
  ...args: Parameters<BehaviorSystem['competeForMate']>
): ReturnType<BehaviorSystem['competeForMate']> {
  return getActiveBehaviorSystem().competeForMate(...args);
}
export function selectMate(
  ...args: Parameters<BehaviorSystem['selectMate']>
): ReturnType<BehaviorSystem['selectMate']> {
  return getActiveBehaviorSystem().selectMate(...args);
}
export function formBreedingPair(
  ...args: Parameters<BehaviorSystem['formBreedingPair']>
): ReturnType<BehaviorSystem['formBreedingPair']> {
  return getActiveBehaviorSystem().formBreedingPair(...args);
}
export function defendBreedingTerritory(
  ...args: Parameters<BehaviorSystem['defendBreedingTerritory']>
): ReturnType<BehaviorSystem['defendBreedingTerritory']> {
  return getActiveBehaviorSystem().defendBreedingTerritory(...args);
}
export function selectNestingSite(
  ...args: Parameters<BehaviorSystem['selectNestingSite']>
): ReturnType<BehaviorSystem['selectNestingSite']> {
  return getActiveBehaviorSystem().selectNestingSite(...args);
}
export function constructNest(
  ...args: Parameters<BehaviorSystem['constructNest']>
): ReturnType<BehaviorSystem['constructNest']> {
  return getActiveBehaviorSystem().constructNest(...args);
}
export function prepareBirthSite(
  ...args: Parameters<BehaviorSystem['prepareBirthSite']>
): ReturnType<BehaviorSystem['prepareBirthSite']> {
  return getActiveBehaviorSystem().prepareBirthSite(...args);
}
export function recognizeOwnOffspring(
  ...args: Parameters<BehaviorSystem['recognizeOwnOffspring']>
): ReturnType<BehaviorSystem['recognizeOwnOffspring']> {
  return getActiveBehaviorSystem().recognizeOwnOffspring(...args);
}
export function bondWithOffspring(
  ...args: Parameters<BehaviorSystem['bondWithOffspring']>
): ReturnType<BehaviorSystem['bondWithOffspring']> {
  return getActiveBehaviorSystem().bondWithOffspring(...args);
}
export function feedOffspring(
  ...args: Parameters<BehaviorSystem['feedOffspring']>
): ReturnType<BehaviorSystem['feedOffspring']> {
  return getActiveBehaviorSystem().feedOffspring(...args);
}
export function groomOffspring(
  ...args: Parameters<BehaviorSystem['groomOffspring']>
): ReturnType<BehaviorSystem['groomOffspring']> {
  return getActiveBehaviorSystem().groomOffspring(...args);
}
export function protectOffspringFromThreat(
  ...args: Parameters<BehaviorSystem['protectOffspringFromThreat']>
): ReturnType<BehaviorSystem['protectOffspringFromThreat']> {
  return getActiveBehaviorSystem().protectOffspringFromThreat(...args);
}
export function retrieveSeparatedOffspring(
  ...args: Parameters<BehaviorSystem['retrieveSeparatedOffspring']>
): ReturnType<BehaviorSystem['retrieveSeparatedOffspring']> {
  return getActiveBehaviorSystem().retrieveSeparatedOffspring(...args);
}
export function teachOffspringSurvivalSkill(
  ...args: Parameters<BehaviorSystem['teachOffspringSurvivalSkill']>
): ReturnType<BehaviorSystem['teachOffspringSurvivalSkill']> {
  return getActiveBehaviorSystem().teachOffspringSurvivalSkill(...args);
}
export function weanOffspring(
  ...args: Parameters<BehaviorSystem['weanOffspring']>
): ReturnType<BehaviorSystem['weanOffspring']> {
  return getActiveBehaviorSystem().weanOffspring(...args);
}
export function initInsectAgent(
  ...args: Parameters<BehaviorSystem['initInsectAgent']>
): ReturnType<BehaviorSystem['initInsectAgent']> {
  return getActiveBehaviorSystem().initInsectAgent(...args);
}
export function detectInsectFoodSource(
  ...args: Parameters<BehaviorSystem['detectInsectFoodSource']>
): ReturnType<BehaviorSystem['detectInsectFoodSource']> {
  return getActiveBehaviorSystem().detectInsectFoodSource(...args);
}
export function followPheromoneTrail(
  ...args: Parameters<BehaviorSystem['followPheromoneTrail']>
): ReturnType<BehaviorSystem['followPheromoneTrail']> {
  return getActiveBehaviorSystem().followPheromoneTrail(...args);
}
export function depositPheromoneTrail(
  ...args: Parameters<BehaviorSystem['depositPheromoneTrail']>
): ReturnType<BehaviorSystem['depositPheromoneTrail']> {
  return getActiveBehaviorSystem().depositPheromoneTrail(...args);
}
export function reinforcePheromonePath(
  ...args: Parameters<BehaviorSystem['reinforcePheromonePath']>
): ReturnType<BehaviorSystem['reinforcePheromonePath']> {
  return getActiveBehaviorSystem().reinforcePheromonePath(...args);
}
export function selectAntForagingRoute(
  ...args: Parameters<BehaviorSystem['selectAntForagingRoute']>
): ReturnType<BehaviorSystem['selectAntForagingRoute']> {
  return getActiveBehaviorSystem().selectAntForagingRoute(...args);
}
export function returnToColony(
  ...args: Parameters<BehaviorSystem['returnToColony']>
): ReturnType<BehaviorSystem['returnToColony']> {
  return getActiveBehaviorSystem().returnToColony(...args);
}
export function exchangeFoodWithColony(
  ...args: Parameters<BehaviorSystem['exchangeFoodWithColony']>
): ReturnType<BehaviorSystem['exchangeFoodWithColony']> {
  return getActiveBehaviorSystem().exchangeFoodWithColony(...args);
}
export function performNestMaintenance(
  ...args: Parameters<BehaviorSystem['performNestMaintenance']>
): ReturnType<BehaviorSystem['performNestMaintenance']> {
  return getActiveBehaviorSystem().performNestMaintenance(...args);
}
export function defendInsectColony(
  ...args: Parameters<BehaviorSystem['defendInsectColony']>
): ReturnType<BehaviorSystem['defendInsectColony']> {
  return getActiveBehaviorSystem().defendInsectColony(...args);
}
export function coordinateWorkerTask(
  ...args: Parameters<BehaviorSystem['coordinateWorkerTask']>
): ReturnType<BehaviorSystem['coordinateWorkerTask']> {
  return getActiveBehaviorSystem().coordinateWorkerTask(...args);
}
export function respondToColonyAlarm(
  ...args: Parameters<BehaviorSystem['respondToColonyAlarm']>
): ReturnType<BehaviorSystem['respondToColonyAlarm']> {
  return getActiveBehaviorSystem().respondToColonyAlarm(...args);
}
export function identifyColonyMember(
  ...args: Parameters<BehaviorSystem['identifyColonyMember']>
): ReturnType<BehaviorSystem['identifyColonyMember']> {
  return getActiveBehaviorSystem().identifyColonyMember(...args);
}
export function removeNestWaste(
  ...args: Parameters<BehaviorSystem['removeNestWaste']>
): ReturnType<BehaviorSystem['removeNestWaste']> {
  return getActiveBehaviorSystem().removeNestWaste(...args);
}
export function regulateNestTemperature(
  ...args: Parameters<BehaviorSystem['regulateNestTemperature']>
): ReturnType<BehaviorSystem['regulateNestTemperature']> {
  return getActiveBehaviorSystem().regulateNestTemperature(...args);
}
export function selectNewNestSite(
  ...args: Parameters<BehaviorSystem['selectNewNestSite']>
): ReturnType<BehaviorSystem['selectNewNestSite']> {
  return getActiveBehaviorSystem().selectNewNestSite(...args);
}
export function initiateSwarmMovement(
  ...args: Parameters<BehaviorSystem['initiateSwarmMovement']>
): ReturnType<BehaviorSystem['initiateSwarmMovement']> {
  return getActiveBehaviorSystem().initiateSwarmMovement(...args);
}
export function followSwarmDirection(
  ...args: Parameters<BehaviorSystem['followSwarmDirection']>
): ReturnType<BehaviorSystem['followSwarmDirection']> {
  return getActiveBehaviorSystem().followSwarmDirection(...args);
}
export function maintainSwarmDensity(
  ...args: Parameters<BehaviorSystem['maintainSwarmDensity']>
): ReturnType<BehaviorSystem['maintainSwarmDensity']> {
  return getActiveBehaviorSystem().maintainSwarmDensity(...args);
}
export function adaptCollectiveForaging(
  ...args: Parameters<BehaviorSystem['adaptCollectiveForaging']>
): ReturnType<BehaviorSystem['adaptCollectiveForaging']> {
  return getActiveBehaviorSystem().adaptCollectiveForaging(...args);
}
export function initAquaticAnimalBehavior(
  ...args: Parameters<BehaviorSystem['initAquaticAnimalBehavior']>
): ReturnType<BehaviorSystem['initAquaticAnimalBehavior']> {
  return getActiveBehaviorSystem().initAquaticAnimalBehavior(...args);
}
export function detectWaterCurrent(
  ...args: Parameters<BehaviorSystem['detectWaterCurrent']>
): ReturnType<BehaviorSystem['detectWaterCurrent']> {
  return getActiveBehaviorSystem().detectWaterCurrent(...args);
}
export function adjustSwimmingDirection(
  ...args: Parameters<BehaviorSystem['adjustSwimmingDirection']>
): ReturnType<BehaviorSystem['adjustSwimmingDirection']> {
  return getActiveBehaviorSystem().adjustSwimmingDirection(...args);
}
export function adjustSwimmingSpeed(
  ...args: Parameters<BehaviorSystem['adjustSwimmingSpeed']>
): ReturnType<BehaviorSystem['adjustSwimmingSpeed']> {
  return getActiveBehaviorSystem().adjustSwimmingSpeed(...args);
}
export function maintainBuoyancy(
  ...args: Parameters<BehaviorSystem['maintainBuoyancy']>
): ReturnType<BehaviorSystem['maintainBuoyancy']> {
  return getActiveBehaviorSystem().maintainBuoyancy(...args);
}
export function controlDivingDepth(
  ...args: Parameters<BehaviorSystem['controlDivingDepth']>
): ReturnType<BehaviorSystem['controlDivingDepth']> {
  return getActiveBehaviorSystem().controlDivingDepth(...args);
}
export function surfaceForAir(
  ...args: Parameters<BehaviorSystem['surfaceForAir']>
): ReturnType<BehaviorSystem['surfaceForAir']> {
  return getActiveBehaviorSystem().surfaceForAir(...args);
}
export function avoidAquaticPredator(
  ...args: Parameters<BehaviorSystem['avoidAquaticPredator']>
): ReturnType<BehaviorSystem['avoidAquaticPredator']> {
  return getActiveBehaviorSystem().avoidAquaticPredator(...args);
}
export function detectAquaticPrey(
  ...args: Parameters<BehaviorSystem['detectAquaticPrey']>
): ReturnType<BehaviorSystem['detectAquaticPrey']> {
  return getActiveBehaviorSystem().detectAquaticPrey(...args);
}
export function schoolWithOtherFish(
  ...args: Parameters<BehaviorSystem['schoolWithOtherFish']>
): ReturnType<BehaviorSystem['schoolWithOtherFish']> {
  return getActiveBehaviorSystem().schoolWithOtherFish(...args);
}
export function maintainSchoolSpacing(
  ...args: Parameters<BehaviorSystem['maintainSchoolSpacing']>
): ReturnType<BehaviorSystem['maintainSchoolSpacing']> {
  return getActiveBehaviorSystem().maintainSchoolSpacing(...args);
}
export function respondToWaterPressure(
  ...args: Parameters<BehaviorSystem['respondToWaterPressure']>
): ReturnType<BehaviorSystem['respondToWaterPressure']> {
  return getActiveBehaviorSystem().respondToWaterPressure(...args);
}
export function respondToWaterTemperature(
  ...args: Parameters<BehaviorSystem['respondToWaterTemperature']>
): ReturnType<BehaviorSystem['respondToWaterTemperature']> {
  return getActiveBehaviorSystem().respondToWaterTemperature(...args);
}
export function detectWaterPollutionCue(
  ...args: Parameters<BehaviorSystem['detectWaterPollutionCue']>
): ReturnType<BehaviorSystem['detectWaterPollutionCue']> {
  return getActiveBehaviorSystem().detectWaterPollutionCue(...args);
}
export function seekAquaticShelter(
  ...args: Parameters<BehaviorSystem['seekAquaticShelter']>
): ReturnType<BehaviorSystem['seekAquaticShelter']> {
  return getActiveBehaviorSystem().seekAquaticShelter(...args);
}
export function selectAquaticFeedingGround(
  ...args: Parameters<BehaviorSystem['selectAquaticFeedingGround']>
): ReturnType<BehaviorSystem['selectAquaticFeedingGround']> {
  return getActiveBehaviorSystem().selectAquaticFeedingGround(...args);
}
export function navigateCoralReef(
  ...args: Parameters<BehaviorSystem['navigateCoralReef']>
): ReturnType<BehaviorSystem['navigateCoralReef']> {
  return getActiveBehaviorSystem().navigateCoralReef(...args);
}
export function migrateAlongWaterway(
  ...args: Parameters<BehaviorSystem['migrateAlongWaterway']>
): ReturnType<BehaviorSystem['migrateAlongWaterway']> {
  return getActiveBehaviorSystem().migrateAlongWaterway(...args);
}
export function returnToSpawningGround(
  ...args: Parameters<BehaviorSystem['returnToSpawningGround']>
): ReturnType<BehaviorSystem['returnToSpawningGround']> {
  return getActiveBehaviorSystem().returnToSpawningGround(...args);
}
export function adaptToAquaticOxygenLevel(
  ...args: Parameters<BehaviorSystem['adaptToAquaticOxygenLevel']>
): ReturnType<BehaviorSystem['adaptToAquaticOxygenLevel']> {
  return getActiveBehaviorSystem().adaptToAquaticOxygenLevel(...args);
}
export function initReptileBehavior(
  ...args: Parameters<BehaviorSystem['initReptileBehavior']>
): ReturnType<BehaviorSystem['initReptileBehavior']> {
  return getActiveBehaviorSystem().initReptileBehavior(...args);
}
export function initAmphibianBehavior(
  ...args: Parameters<BehaviorSystem['initAmphibianBehavior']>
): ReturnType<BehaviorSystem['initAmphibianBehavior']> {
  return getActiveBehaviorSystem().initAmphibianBehavior(...args);
}
export function baskInSunlight(
  ...args: Parameters<BehaviorSystem['baskInSunlight']>
): ReturnType<BehaviorSystem['baskInSunlight']> {
  return getActiveBehaviorSystem().baskInSunlight(...args);
}
export function seekThermalGradient(
  ...args: Parameters<BehaviorSystem['seekThermalGradient']>
): ReturnType<BehaviorSystem['seekThermalGradient']> {
  return getActiveBehaviorSystem().seekThermalGradient(...args);
}
export function moveBetweenWarmAndCoolArea(
  ...args: Parameters<BehaviorSystem['moveBetweenWarmAndCoolArea']>
): ReturnType<BehaviorSystem['moveBetweenWarmAndCoolArea']> {
  return getActiveBehaviorSystem().moveBetweenWarmAndCoolArea(...args);
}
export function detectGroundVibration(
  ...args: Parameters<BehaviorSystem['detectGroundVibration']>
): ReturnType<BehaviorSystem['detectGroundVibration']> {
  return getActiveBehaviorSystem().detectGroundVibration(...args);
}
export function detectNearbyMovement(
  ...args: Parameters<BehaviorSystem['detectNearbyMovement']>
): ReturnType<BehaviorSystem['detectNearbyMovement']> {
  return getActiveBehaviorSystem().detectNearbyMovement(...args);
}
export function performReptileAmbush(
  ...args: Parameters<BehaviorSystem['performReptileAmbush']>
): ReturnType<BehaviorSystem['performReptileAmbush']> {
  return getActiveBehaviorSystem().performReptileAmbush(...args);
}
export function performTongueFlicking(
  ...args: Parameters<BehaviorSystem['performTongueFlicking']>
): ReturnType<BehaviorSystem['performTongueFlicking']> {
  return getActiveBehaviorSystem().performTongueFlicking(...args);
}
export function hideUnderCover(
  ...args: Parameters<BehaviorSystem['hideUnderCover']>
): ReturnType<BehaviorSystem['hideUnderCover']> {
  return getActiveBehaviorSystem().hideUnderCover(...args);
}
export function burrowIntoSubstrate(
  ...args: Parameters<BehaviorSystem['burrowIntoSubstrate']>
): ReturnType<BehaviorSystem['burrowIntoSubstrate']> {
  return getActiveBehaviorSystem().burrowIntoSubstrate(...args);
}
export function avoidDryingEnvironment(
  ...args: Parameters<BehaviorSystem['avoidDryingEnvironment']>
): ReturnType<BehaviorSystem['avoidDryingEnvironment']> {
  return getActiveBehaviorSystem().avoidDryingEnvironment(...args);
}
export function seekMoistMicrohabitat(
  ...args: Parameters<BehaviorSystem['seekMoistMicrohabitat']>
): ReturnType<BehaviorSystem['seekMoistMicrohabitat']> {
  return getActiveBehaviorSystem().seekMoistMicrohabitat(...args);
}
export function respondToSeasonalDormancy(
  ...args: Parameters<BehaviorSystem['respondToSeasonalDormancy']>
): ReturnType<BehaviorSystem['respondToSeasonalDormancy']> {
  return getActiveBehaviorSystem().respondToSeasonalDormancy(...args);
}
export function selectEggLayingSite(
  ...args: Parameters<BehaviorSystem['selectEggLayingSite']>
): ReturnType<BehaviorSystem['selectEggLayingSite']> {
  return getActiveBehaviorSystem().selectEggLayingSite(...args);
}
export function buryReptileEggs(
  ...args: Parameters<BehaviorSystem['buryReptileEggs']>
): ReturnType<BehaviorSystem['buryReptileEggs']> {
  return getActiveBehaviorSystem().buryReptileEggs(...args);
}
export function migrateToBreedingPond(
  ...args: Parameters<BehaviorSystem['migrateToBreedingPond']>
): ReturnType<BehaviorSystem['migrateToBreedingPond']> {
  return getActiveBehaviorSystem().migrateToBreedingPond(...args);
}
export function respondToAmphibianCall(
  ...args: Parameters<BehaviorSystem['respondToAmphibianCall']>
): ReturnType<BehaviorSystem['respondToAmphibianCall']> {
  return getActiveBehaviorSystem().respondToAmphibianCall(...args);
}
export function avoidExtremeTemperature(
  ...args: Parameters<BehaviorSystem['avoidExtremeTemperature']>
): ReturnType<BehaviorSystem['avoidExtremeTemperature']> {
  return getActiveBehaviorSystem().avoidExtremeTemperature(...args);
}
export function adaptToHabitatMoisture(
  ...args: Parameters<BehaviorSystem['adaptToHabitatMoisture']>
): ReturnType<BehaviorSystem['adaptToHabitatMoisture']> {
  return getActiveBehaviorSystem().adaptToHabitatMoisture(...args);
}
export function initRodentBehavior(
  ...args: Parameters<BehaviorSystem['initRodentBehavior']>
): ReturnType<BehaviorSystem['initRodentBehavior']> {
  return getActiveBehaviorSystem().initRodentBehavior(...args);
}
export function exploreNovelObject(
  ...args: Parameters<BehaviorSystem['exploreNovelObject']>
): ReturnType<BehaviorSystem['exploreNovelObject']> {
  return getActiveBehaviorSystem().exploreNovelObject(...args);
}
export function performRiskAssessmentPause(
  ...args: Parameters<BehaviorSystem['performRiskAssessmentPause']>
): ReturnType<BehaviorSystem['performRiskAssessmentPause']> {
  return getActiveBehaviorSystem().performRiskAssessmentPause(...args);
}
export function sniffNovelObject(
  ...args: Parameters<BehaviorSystem['sniffNovelObject']>
): ReturnType<BehaviorSystem['sniffNovelObject']> {
  return getActiveBehaviorSystem().sniffNovelObject(...args);
}
export function approachNovelObjectCautiously(
  ...args: Parameters<BehaviorSystem['approachNovelObjectCautiously']>
): ReturnType<BehaviorSystem['approachNovelObjectCautiously']> {
  return getActiveBehaviorSystem().approachNovelObjectCautiously(...args);
}
export function retreatFromNovelObject(
  ...args: Parameters<BehaviorSystem['retreatFromNovelObject']>
): ReturnType<BehaviorSystem['retreatFromNovelObject']> {
  return getActiveBehaviorSystem().retreatFromNovelObject(...args);
}
export function gnawHardMaterial(
  ...args: Parameters<BehaviorSystem['gnawHardMaterial']>
): ReturnType<BehaviorSystem['gnawHardMaterial']> {
  return getActiveBehaviorSystem().gnawHardMaterial(...args);
}
export function constructBurrow(
  ...args: Parameters<BehaviorSystem['constructBurrow']>
): ReturnType<BehaviorSystem['constructBurrow']> {
  return getActiveBehaviorSystem().constructBurrow(...args);
}
export function navigateBurrowNetwork(
  ...args: Parameters<BehaviorSystem['navigateBurrowNetwork']>
): ReturnType<BehaviorSystem['navigateBurrowNetwork']> {
  return getActiveBehaviorSystem().navigateBurrowNetwork(...args);
}
export function storeFoodInCache(
  ...args: Parameters<BehaviorSystem['storeFoodInCache']>
): ReturnType<BehaviorSystem['storeFoodInCache']> {
  return getActiveBehaviorSystem().storeFoodInCache(...args);
}
export function retrieveCachedFood(
  ...args: Parameters<BehaviorSystem['retrieveCachedFood']>
): ReturnType<BehaviorSystem['retrieveCachedFood']> {
  return getActiveBehaviorSystem().retrieveCachedFood(...args);
}
export function detectRodentAlarmSignal(
  ...args: Parameters<BehaviorSystem['detectRodentAlarmSignal']>
): ReturnType<BehaviorSystem['detectRodentAlarmSignal']> {
  return getActiveBehaviorSystem().detectRodentAlarmSignal(...args);
}
export function hideInBurrow(
  ...args: Parameters<BehaviorSystem['hideInBurrow']>
): ReturnType<BehaviorSystem['hideInBurrow']> {
  return getActiveBehaviorSystem().hideInBurrow(...args);
}
export function learnMazeRoute(
  ...args: Parameters<BehaviorSystem['learnMazeRoute']>
): ReturnType<BehaviorSystem['learnMazeRoute']> {
  return getActiveBehaviorSystem().learnMazeRoute(...args);
}
export function rememberSafeLocation(
  ...args: Parameters<BehaviorSystem['rememberSafeLocation']>
): ReturnType<BehaviorSystem['rememberSafeLocation']> {
  return getActiveBehaviorSystem().rememberSafeLocation(...args);
}
export function avoidPreviouslyDangerousArea(
  ...args: Parameters<BehaviorSystem['avoidPreviouslyDangerousArea']>
): ReturnType<BehaviorSystem['avoidPreviouslyDangerousArea']> {
  return getActiveBehaviorSystem().avoidPreviouslyDangerousArea(...args);
}
export function socialGroomingRodent(
  ...args: Parameters<BehaviorSystem['socialGroomingRodent']>
): ReturnType<BehaviorSystem['socialGroomingRodent']> {
  return getActiveBehaviorSystem().socialGroomingRodent(...args);
}
export function playWithConspecific(
  ...args: Parameters<BehaviorSystem['playWithConspecific']>
): ReturnType<BehaviorSystem['playWithConspecific']> {
  return getActiveBehaviorSystem().playWithConspecific(...args);
}
export function adaptExplorationToHunger(
  ...args: Parameters<BehaviorSystem['adaptExplorationToHunger']>
): ReturnType<BehaviorSystem['adaptExplorationToHunger']> {
  return getActiveBehaviorSystem().adaptExplorationToHunger(...args);
}
export function initUngulateBehavior(
  ...args: Parameters<BehaviorSystem['initUngulateBehavior']>
): ReturnType<BehaviorSystem['initUngulateBehavior']> {
  return getActiveBehaviorSystem().initUngulateBehavior(...args);
}
export function detectHerdLeader(
  ...args: Parameters<BehaviorSystem['detectHerdLeader']>
): ReturnType<BehaviorSystem['detectHerdLeader']> {
  return getActiveBehaviorSystem().detectHerdLeader(...args);
}
export function followHerdLeader(
  ...args: Parameters<BehaviorSystem['followHerdLeader']>
): ReturnType<BehaviorSystem['followHerdLeader']> {
  return getActiveBehaviorSystem().followHerdLeader(...args);
}
export function scanHorizonForPredator(
  ...args: Parameters<BehaviorSystem['scanHorizonForPredator']>
): ReturnType<BehaviorSystem['scanHorizonForPredator']> {
  return getActiveBehaviorSystem().scanHorizonForPredator(...args);
}
export function raiseHeadDuringGrazing(
  ...args: Parameters<BehaviorSystem['raiseHeadDuringGrazing']>
): ReturnType<BehaviorSystem['raiseHeadDuringGrazing']> {
  return getActiveBehaviorSystem().raiseHeadDuringGrazing(...args);
}
export function triggerHerdAlarm(
  ...args: Parameters<BehaviorSystem['triggerHerdAlarm']>
): ReturnType<BehaviorSystem['triggerHerdAlarm']> {
  return getActiveBehaviorSystem().triggerHerdAlarm(...args);
}
export function initiateHerdFlight(
  ...args: Parameters<BehaviorSystem['initiateHerdFlight']>
): ReturnType<BehaviorSystem['initiateHerdFlight']> {
  return getActiveBehaviorSystem().initiateHerdFlight(...args);
}
export function synchronizeHerdRunning(
  ...args: Parameters<BehaviorSystem['synchronizeHerdRunning']>
): ReturnType<BehaviorSystem['synchronizeHerdRunning']> {
  return getActiveBehaviorSystem().synchronizeHerdRunning(...args);
}
export function avoidHerdCollision(
  ...args: Parameters<BehaviorSystem['avoidHerdCollision']>
): ReturnType<BehaviorSystem['avoidHerdCollision']> {
  return getActiveBehaviorSystem().avoidHerdCollision(...args);
}
export function maintainHerdFormation(
  ...args: Parameters<BehaviorSystem['maintainHerdFormation']>
): ReturnType<BehaviorSystem['maintainHerdFormation']> {
  return getActiveBehaviorSystem().maintainHerdFormation(...args);
}
export function selectWateringLocation(
  ...args: Parameters<BehaviorSystem['selectWateringLocation']>
): ReturnType<BehaviorSystem['selectWateringLocation']> {
  return getActiveBehaviorSystem().selectWateringLocation(...args);
}
export function approachWateringLocation(
  ...args: Parameters<BehaviorSystem['approachWateringLocation']>
): ReturnType<BehaviorSystem['approachWateringLocation']> {
  return getActiveBehaviorSystem().approachWateringLocation(...args);
}
export function waitForHerdAccess(
  ...args: Parameters<BehaviorSystem['waitForHerdAccess']>
): ReturnType<BehaviorSystem['waitForHerdAccess']> {
  return getActiveBehaviorSystem().waitForHerdAccess(...args);
}
export function defendCalf(
  ...args: Parameters<BehaviorSystem['defendCalf']>
): ReturnType<BehaviorSystem['defendCalf']> {
  return getActiveBehaviorSystem().defendCalf(...args);
}
export function recognizeHerdOffspring(
  ...args: Parameters<BehaviorSystem['recognizeHerdOffspring']>
): ReturnType<BehaviorSystem['recognizeHerdOffspring']> {
  return getActiveBehaviorSystem().recognizeHerdOffspring(...args);
}
export function reuniteWithHerd(
  ...args: Parameters<BehaviorSystem['reuniteWithHerd']>
): ReturnType<BehaviorSystem['reuniteWithHerd']> {
  return getActiveBehaviorSystem().reuniteWithHerd(...args);
}
export function respondToSeasonalMigrationCue(
  ...args: Parameters<BehaviorSystem['respondToSeasonalMigrationCue']>
): ReturnType<BehaviorSystem['respondToSeasonalMigrationCue']> {
  return getActiveBehaviorSystem().respondToSeasonalMigrationCue(...args);
}
export function crossOpenTerrainCautiously(
  ...args: Parameters<BehaviorSystem['crossOpenTerrainCautiously']>
): ReturnType<BehaviorSystem['crossOpenTerrainCautiously']> {
  return getActiveBehaviorSystem().crossOpenTerrainCautiously(...args);
}
export function selectRestingHerdLocation(
  ...args: Parameters<BehaviorSystem['selectRestingHerdLocation']>
): ReturnType<BehaviorSystem['selectRestingHerdLocation']> {
  return getActiveBehaviorSystem().selectRestingHerdLocation(...args);
}
export function adaptHerdRouteToPredationRisk(
  ...args: Parameters<BehaviorSystem['adaptHerdRouteToPredationRisk']>
): ReturnType<BehaviorSystem['adaptHerdRouteToPredationRisk']> {
  return getActiveBehaviorSystem().adaptHerdRouteToPredationRisk(...args);
}
export function initPrimateBehavior(
  ...args: Parameters<BehaviorSystem['initPrimateBehavior']>
): ReturnType<BehaviorSystem['initPrimateBehavior']> {
  return getActiveBehaviorSystem().initPrimateBehavior(...args);
}
export function recognizePrimateIndividual(
  ...args: Parameters<BehaviorSystem['recognizePrimateIndividual']>
): ReturnType<BehaviorSystem['recognizePrimateIndividual']> {
  return getActiveBehaviorSystem().recognizePrimateIndividual(...args);
}
export function rememberSocialRelationship(
  ...args: Parameters<BehaviorSystem['rememberSocialRelationship']>
): ReturnType<BehaviorSystem['rememberSocialRelationship']> {
  return getActiveBehaviorSystem().rememberSocialRelationship(...args);
}
export function performSocialGrooming(
  ...args: Parameters<BehaviorSystem['performSocialGrooming']>
): ReturnType<BehaviorSystem['performSocialGrooming']> {
  return getActiveBehaviorSystem().performSocialGrooming(...args);
}
export function solicitSocialGrooming(
  ...args: Parameters<BehaviorSystem['solicitSocialGrooming']>
): ReturnType<BehaviorSystem['solicitSocialGrooming']> {
  return getActiveBehaviorSystem().solicitSocialGrooming(...args);
}
export function formPrimateAlliance(
  ...args: Parameters<BehaviorSystem['formPrimateAlliance']>
): ReturnType<BehaviorSystem['formPrimateAlliance']> {
  return getActiveBehaviorSystem().formPrimateAlliance(...args);
}
export function maintainPrimateAlliance(
  ...args: Parameters<BehaviorSystem['maintainPrimateAlliance']>
): ReturnType<BehaviorSystem['maintainPrimateAlliance']> {
  return getActiveBehaviorSystem().maintainPrimateAlliance(...args);
}
export function detectSocialRankChange(
  ...args: Parameters<BehaviorSystem['detectSocialRankChange']>
): ReturnType<BehaviorSystem['detectSocialRankChange']> {
  return getActiveBehaviorSystem().detectSocialRankChange(...args);
}
export function respondToDominanceDisplay(
  ...args: Parameters<BehaviorSystem['respondToDominanceDisplay']>
): ReturnType<BehaviorSystem['respondToDominanceDisplay']> {
  return getActiveBehaviorSystem().respondToDominanceDisplay(...args);
}
export function shareForagingKnowledge(
  ...args: Parameters<BehaviorSystem['shareForagingKnowledge']>
): ReturnType<BehaviorSystem['shareForagingKnowledge']> {
  return getActiveBehaviorSystem().shareForagingKnowledge(...args);
}
export function learnToolUseByObservation(
  ...args: Parameters<BehaviorSystem['learnToolUseByObservation']>
): ReturnType<BehaviorSystem['learnToolUseByObservation']> {
  return getActiveBehaviorSystem().learnToolUseByObservation(...args);
}
export function manipulateSimpleTool(
  ...args: Parameters<BehaviorSystem['manipulateSimpleTool']>
): ReturnType<BehaviorSystem['manipulateSimpleTool']> {
  return getActiveBehaviorSystem().manipulateSimpleTool(...args);
}
export function solvePrimateForagingPuzzle(
  ...args: Parameters<BehaviorSystem['solvePrimateForagingPuzzle']>
): ReturnType<BehaviorSystem['solvePrimateForagingPuzzle']> {
  return getActiveBehaviorSystem().solvePrimateForagingPuzzle(...args);
}
export function imitateConspecificAction(
  ...args: Parameters<BehaviorSystem['imitateConspecificAction']>
): ReturnType<BehaviorSystem['imitateConspecificAction']> {
  return getActiveBehaviorSystem().imitateConspecificAction(...args);
}
export function recognizeSocialDeceptionCue(
  ...args: Parameters<BehaviorSystem['recognizeSocialDeceptionCue']>
): ReturnType<BehaviorSystem['recognizeSocialDeceptionCue']> {
  return getActiveBehaviorSystem().recognizeSocialDeceptionCue(...args);
}
export function respondToInfantDistress(
  ...args: Parameters<BehaviorSystem['respondToInfantDistress']>
): ReturnType<BehaviorSystem['respondToInfantDistress']> {
  return getActiveBehaviorSystem().respondToInfantDistress(...args);
}
export function mediatePrimateConflict(
  ...args: Parameters<BehaviorSystem['mediatePrimateConflict']>
): ReturnType<BehaviorSystem['mediatePrimateConflict']> {
  return getActiveBehaviorSystem().mediatePrimateConflict(...args);
}
export function reconcileAfterConflict(
  ...args: Parameters<BehaviorSystem['reconcileAfterConflict']>
): ReturnType<BehaviorSystem['reconcileAfterConflict']> {
  return getActiveBehaviorSystem().reconcileAfterConflict(...args);
}
export function learnGroupTradition(
  ...args: Parameters<BehaviorSystem['learnGroupTradition']>
): ReturnType<BehaviorSystem['learnGroupTradition']> {
  return getActiveBehaviorSystem().learnGroupTradition(...args);
}
export function adaptSocialStrategy(
  ...args: Parameters<BehaviorSystem['adaptSocialStrategy']>
): ReturnType<BehaviorSystem['adaptSocialStrategy']> {
  return getActiveBehaviorSystem().adaptSocialStrategy(...args);
}
export function initPollinatorBehavior(
  ...args: Parameters<BehaviorSystem['initPollinatorBehavior']>
): ReturnType<BehaviorSystem['initPollinatorBehavior']> {
  return getActiveBehaviorSystem().initPollinatorBehavior(...args);
}
export function detectFlowerColor(
  ...args: Parameters<BehaviorSystem['detectFlowerColor']>
): ReturnType<BehaviorSystem['detectFlowerColor']> {
  return getActiveBehaviorSystem().detectFlowerColor(...args);
}
export function detectFloralOdor(
  ...args: Parameters<BehaviorSystem['detectFloralOdor']>
): ReturnType<BehaviorSystem['detectFloralOdor']> {
  return getActiveBehaviorSystem().detectFloralOdor(...args);
}
export function estimateNectarAvailability(
  ...args: Parameters<BehaviorSystem['estimateNectarAvailability']>
): ReturnType<BehaviorSystem['estimateNectarAvailability']> {
  return getActiveBehaviorSystem().estimateNectarAvailability(...args);
}
export function estimatePollenAvailability(
  ...args: Parameters<BehaviorSystem['estimatePollenAvailability']>
): ReturnType<BehaviorSystem['estimatePollenAvailability']> {
  return getActiveBehaviorSystem().estimatePollenAvailability(...args);
}
export function selectFlowerTarget(
  ...args: Parameters<BehaviorSystem['selectFlowerTarget']>
): ReturnType<BehaviorSystem['selectFlowerTarget']> {
  return getActiveBehaviorSystem().selectFlowerTarget(...args);
}
export function approachFlower(
  ...args: Parameters<BehaviorSystem['approachFlower']>
): ReturnType<BehaviorSystem['approachFlower']> {
  return getActiveBehaviorSystem().approachFlower(...args);
}
export function landOnFlower(
  ...args: Parameters<BehaviorSystem['landOnFlower']>
): ReturnType<BehaviorSystem['landOnFlower']> {
  return getActiveBehaviorSystem().landOnFlower(...args);
}
export function collectNectar(
  ...args: Parameters<BehaviorSystem['collectNectar']>
): ReturnType<BehaviorSystem['collectNectar']> {
  return getActiveBehaviorSystem().collectNectar(...args);
}
export function collectPollen(
  ...args: Parameters<BehaviorSystem['collectPollen']>
): ReturnType<BehaviorSystem['collectPollen']> {
  return getActiveBehaviorSystem().collectPollen(...args);
}
export function transferPollenBetweenFlowers(
  ...args: Parameters<BehaviorSystem['transferPollenBetweenFlowers']>
): ReturnType<BehaviorSystem['transferPollenBetweenFlowers']> {
  return getActiveBehaviorSystem().transferPollenBetweenFlowers(...args);
}
export function avoidPreviouslyDepletedFlower(
  ...args: Parameters<BehaviorSystem['avoidPreviouslyDepletedFlower']>
): ReturnType<BehaviorSystem['avoidPreviouslyDepletedFlower']> {
  return getActiveBehaviorSystem().avoidPreviouslyDepletedFlower(...args);
}
export function learnFlowerRewardPattern(
  ...args: Parameters<BehaviorSystem['learnFlowerRewardPattern']>
): ReturnType<BehaviorSystem['learnFlowerRewardPattern']> {
  return getActiveBehaviorSystem().learnFlowerRewardPattern(...args);
}
export function rememberFlowerLocation(
  ...args: Parameters<BehaviorSystem['rememberFlowerLocation']>
): ReturnType<BehaviorSystem['rememberFlowerLocation']> {
  return getActiveBehaviorSystem().rememberFlowerLocation(...args);
}
export function communicateFlowerLocation(
  ...args: Parameters<BehaviorSystem['communicateFlowerLocation']>
): ReturnType<BehaviorSystem['communicateFlowerLocation']> {
  return getActiveBehaviorSystem().communicateFlowerLocation(...args);
}
export function returnToHiveWithNectar(
  ...args: Parameters<BehaviorSystem['returnToHiveWithNectar']>
): ReturnType<BehaviorSystem['returnToHiveWithNectar']> {
  return getActiveBehaviorSystem().returnToHiveWithNectar(...args);
}
export function performWaggleDance(
  ...args: Parameters<BehaviorSystem['performWaggleDance']>
): ReturnType<BehaviorSystem['performWaggleDance']> {
  return getActiveBehaviorSystem().performWaggleDance(...args);
}
export function adaptForagingToWeather(
  ...args: Parameters<BehaviorSystem['adaptForagingToWeather']>
): ReturnType<BehaviorSystem['adaptForagingToWeather']> {
  return getActiveBehaviorSystem().adaptForagingToWeather(...args);
}
export function avoidPollinatorCompetition(
  ...args: Parameters<BehaviorSystem['avoidPollinatorCompetition']>
): ReturnType<BehaviorSystem['avoidPollinatorCompetition']> {
  return getActiveBehaviorSystem().avoidPollinatorCompetition(...args);
}
export function optimizePollinationRoute(
  ...args: Parameters<BehaviorSystem['optimizePollinationRoute']>
): ReturnType<BehaviorSystem['optimizePollinationRoute']> {
  return getActiveBehaviorSystem().optimizePollinationRoute(...args);
}
export function modelMixedEmotionalState(
  ...args: Parameters<BehaviorSystem['modelMixedEmotionalState']>
): ReturnType<BehaviorSystem['modelMixedEmotionalState']> {
  return getActiveBehaviorSystem().modelMixedEmotionalState(...args);
}
export function modelAmbivalentEmotion(
  ...args: Parameters<BehaviorSystem['modelAmbivalentEmotion']>
): ReturnType<BehaviorSystem['modelAmbivalentEmotion']> {
  return getActiveBehaviorSystem().modelAmbivalentEmotion(...args);
}
export function modelEmotionalCarryover(
  ...args: Parameters<BehaviorSystem['modelEmotionalCarryover']>
): ReturnType<BehaviorSystem['modelEmotionalCarryover']> {
  return getActiveBehaviorSystem().modelEmotionalCarryover(...args);
}
export function modelMoodBaseline(
  ...args: Parameters<BehaviorSystem['modelMoodBaseline']>
): ReturnType<BehaviorSystem['modelMoodBaseline']> {
  return getActiveBehaviorSystem().modelMoodBaseline(...args);
}
export function updateMoodFromExperience(
  ...args: Parameters<BehaviorSystem['updateMoodFromExperience']>
): ReturnType<BehaviorSystem['updateMoodFromExperience']> {
  return getActiveBehaviorSystem().updateMoodFromExperience(...args);
}
export function updateMoodFromSleepQuality(
  ...args: Parameters<BehaviorSystem['updateMoodFromSleepQuality']>
): ReturnType<BehaviorSystem['updateMoodFromSleepQuality']> {
  return getActiveBehaviorSystem().updateMoodFromSleepQuality(...args);
}
export function updateMoodFromSocialInteraction(
  ...args: Parameters<BehaviorSystem['updateMoodFromSocialInteraction']>
): ReturnType<BehaviorSystem['updateMoodFromSocialInteraction']> {
  return getActiveBehaviorSystem().updateMoodFromSocialInteraction(...args);
}
export function updateMoodFromEnvironment(
  ...args: Parameters<BehaviorSystem['updateMoodFromEnvironment']>
): ReturnType<BehaviorSystem['updateMoodFromEnvironment']> {
  return getActiveBehaviorSystem().updateMoodFromEnvironment(...args);
}
export function detectEmotionalOverload(
  ...args: Parameters<BehaviorSystem['detectEmotionalOverload']>
): ReturnType<BehaviorSystem['detectEmotionalOverload']> {
  return getActiveBehaviorSystem().detectEmotionalOverload(...args);
}
export function regulateEmotionalImpulse(
  ...args: Parameters<BehaviorSystem['regulateEmotionalImpulse']>
): ReturnType<BehaviorSystem['regulateEmotionalImpulse']> {
  return getActiveBehaviorSystem().regulateEmotionalImpulse(...args);
}
export function delayEmotionalReaction(
  ...args: Parameters<BehaviorSystem['delayEmotionalReaction']>
): ReturnType<BehaviorSystem['delayEmotionalReaction']> {
  return getActiveBehaviorSystem().delayEmotionalReaction(...args);
}
export function reappraiseEmotionalMeaning(
  ...args: Parameters<BehaviorSystem['reappraiseEmotionalMeaning']>
): ReturnType<BehaviorSystem['reappraiseEmotionalMeaning']> {
  return getActiveBehaviorSystem().reappraiseEmotionalMeaning(...args);
}
export function acceptUnpleasantEmotion(
  ...args: Parameters<BehaviorSystem['acceptUnpleasantEmotion']>
): ReturnType<BehaviorSystem['acceptUnpleasantEmotion']> {
  return getActiveBehaviorSystem().acceptUnpleasantEmotion(...args);
}
export function shiftAttentionFromDistress(
  ...args: Parameters<BehaviorSystem['shiftAttentionFromDistress']>
): ReturnType<BehaviorSystem['shiftAttentionFromDistress']> {
  return getActiveBehaviorSystem().shiftAttentionFromDistress(...args);
}
export function recoverEmotionalEquilibrium(
  ...args: Parameters<BehaviorSystem['recoverEmotionalEquilibrium']>
): ReturnType<BehaviorSystem['recoverEmotionalEquilibrium']> {
  return getActiveBehaviorSystem().recoverEmotionalEquilibrium(...args);
}
export function simulateEmotionalContagion(
  ...args: Parameters<BehaviorSystem['simulateEmotionalContagion']>
): ReturnType<BehaviorSystem['simulateEmotionalContagion']> {
  return getActiveBehaviorSystem().simulateEmotionalContagion(...args);
}
export function simulateCollectiveMood(
  ...args: Parameters<BehaviorSystem['simulateCollectiveMood']>
): ReturnType<BehaviorSystem['simulateCollectiveMood']> {
  return getActiveBehaviorSystem().simulateCollectiveMood(...args);
}
export function distinguishMoodFromEmotion(
  ...args: Parameters<BehaviorSystem['distinguishMoodFromEmotion']>
): ReturnType<BehaviorSystem['distinguishMoodFromEmotion']> {
  return getActiveBehaviorSystem().distinguishMoodFromEmotion(...args);
}
export function estimateEmotionConfidence(
  ...args: Parameters<BehaviorSystem['estimateEmotionConfidence']>
): ReturnType<BehaviorSystem['estimateEmotionConfidence']> {
  return getActiveBehaviorSystem().estimateEmotionConfidence(...args);
}
export function updateEmotionalModelFromFeedback(
  ...args: Parameters<BehaviorSystem['updateEmotionalModelFromFeedback']>
): ReturnType<BehaviorSystem['updateEmotionalModelFromFeedback']> {
  return getActiveBehaviorSystem().updateEmotionalModelFromFeedback(...args);
}
export function detectImpulsiveUrge(
  ...args: Parameters<BehaviorSystem['detectImpulsiveUrge']>
): ReturnType<BehaviorSystem['detectImpulsiveUrge']> {
  return getActiveBehaviorSystem().detectImpulsiveUrge(...args);
}
export function estimateImpulseStrength(
  ...args: Parameters<BehaviorSystem['estimateImpulseStrength']>
): ReturnType<BehaviorSystem['estimateImpulseStrength']> {
  return getActiveBehaviorSystem().estimateImpulseStrength(...args);
}
export function pauseBeforeAction(
  ...args: Parameters<BehaviorSystem['pauseBeforeAction']>
): ReturnType<BehaviorSystem['pauseBeforeAction']> {
  return getActiveBehaviorSystem().pauseBeforeAction(...args);
}
export function evaluateImmediateConsequence(
  ...args: Parameters<BehaviorSystem['evaluateImmediateConsequence']>
): ReturnType<BehaviorSystem['evaluateImmediateConsequence']> {
  return getActiveBehaviorSystem().evaluateImmediateConsequence(...args);
}
export function evaluateLongTermConsequence(
  ...args: Parameters<BehaviorSystem['evaluateLongTermConsequence']>
): ReturnType<BehaviorSystem['evaluateLongTermConsequence']> {
  return getActiveBehaviorSystem().evaluateLongTermConsequence(...args);
}
export function inhibitDominantResponse(
  ...args: Parameters<BehaviorSystem['inhibitDominantResponse']>
): ReturnType<BehaviorSystem['inhibitDominantResponse']> {
  return getActiveBehaviorSystem().inhibitDominantResponse(...args);
}
export function selectAlternativeResponse(
  ...args: Parameters<BehaviorSystem['selectAlternativeResponse']>
): ReturnType<BehaviorSystem['selectAlternativeResponse']> {
  return getActiveBehaviorSystem().selectAlternativeResponse(...args);
}
export function maintainBehavioralGoal(
  ...args: Parameters<BehaviorSystem['maintainBehavioralGoal']>
): ReturnType<BehaviorSystem['maintainBehavioralGoal']> {
  return getActiveBehaviorSystem().maintainBehavioralGoal(...args);
}
export function resistDistractingStimulus(
  ...args: Parameters<BehaviorSystem['resistDistractingStimulus']>
): ReturnType<BehaviorSystem['resistDistractingStimulus']> {
  return getActiveBehaviorSystem().resistDistractingStimulus(...args);
}
export function switchCognitiveStrategy(
  ...args: Parameters<BehaviorSystem['switchCognitiveStrategy']>
): ReturnType<BehaviorSystem['switchCognitiveStrategy']> {
  return getActiveBehaviorSystem().switchCognitiveStrategy(...args);
}
export function monitorActionProgress(
  ...args: Parameters<BehaviorSystem['monitorActionProgress']>
): ReturnType<BehaviorSystem['monitorActionProgress']> {
  return getActiveBehaviorSystem().monitorActionProgress(...args);
}
export function detectSelfControlFailure(
  ...args: Parameters<BehaviorSystem['detectSelfControlFailure']>
): ReturnType<BehaviorSystem['detectSelfControlFailure']> {
  return getActiveBehaviorSystem().detectSelfControlFailure(...args);
}
export function recoverSelfControl(
  ...args: Parameters<BehaviorSystem['recoverSelfControl']>
): ReturnType<BehaviorSystem['recoverSelfControl']> {
  return getActiveBehaviorSystem().recoverSelfControl(...args);
}
export function learnImpulseTrigger(
  ...args: Parameters<BehaviorSystem['learnImpulseTrigger']>
): ReturnType<BehaviorSystem['learnImpulseTrigger']> {
  return getActiveBehaviorSystem().learnImpulseTrigger(...args);
}
export function modifyImpulseTriggerResponse(
  ...args: Parameters<BehaviorSystem['modifyImpulseTriggerResponse']>
): ReturnType<BehaviorSystem['modifyImpulseTriggerResponse']> {
  return getActiveBehaviorSystem().modifyImpulseTriggerResponse(...args);
}
export function prioritizeLongTermReward(
  ...args: Parameters<BehaviorSystem['prioritizeLongTermReward']>
): ReturnType<BehaviorSystem['prioritizeLongTermReward']> {
  return getActiveBehaviorSystem().prioritizeLongTermReward(...args);
}
export function adaptSelfControlToFatigue(
  ...args: Parameters<BehaviorSystem['adaptSelfControlToFatigue']>
): ReturnType<BehaviorSystem['adaptSelfControlToFatigue']> {
  return getActiveBehaviorSystem().adaptSelfControlToFatigue(...args);
}
export function maintainActionConsistency(
  ...args: Parameters<BehaviorSystem['maintainActionConsistency']>
): ReturnType<BehaviorSystem['maintainActionConsistency']> {
  return getActiveBehaviorSystem().maintainActionConsistency(...args);
}
export function evaluateSelfRegulationOutcome(
  ...args: Parameters<BehaviorSystem['evaluateSelfRegulationOutcome']>
): ReturnType<BehaviorSystem['evaluateSelfRegulationOutcome']> {
  return getActiveBehaviorSystem().evaluateSelfRegulationOutcome(...args);
}
export function updateSelfRegulationPolicy(
  ...args: Parameters<BehaviorSystem['updateSelfRegulationPolicy']>
): ReturnType<BehaviorSystem['updateSelfRegulationPolicy']> {
  return getActiveBehaviorSystem().updateSelfRegulationPolicy(...args);
}
export function updateBehaviorFromWeather(
  ...args: Parameters<BehaviorSystem['updateBehaviorFromWeather']>
): ReturnType<BehaviorSystem['updateBehaviorFromWeather']> {
  return getActiveBehaviorSystem().updateBehaviorFromWeather(...args);
}
export function respondToRainfall(
  ...args: Parameters<BehaviorSystem['respondToRainfall']>
): ReturnType<BehaviorSystem['respondToRainfall']> {
  return getActiveBehaviorSystem().respondToRainfall(...args);
}
export function respondToSnowfall(
  ...args: Parameters<BehaviorSystem['respondToSnowfall']>
): ReturnType<BehaviorSystem['respondToSnowfall']> {
  return getActiveBehaviorSystem().respondToSnowfall(...args);
}
export function respondToStrongWind(
  ...args: Parameters<BehaviorSystem['respondToStrongWind']>
): ReturnType<BehaviorSystem['respondToStrongWind']> {
  return getActiveBehaviorSystem().respondToStrongWind(...args);
}
export function respondToExtremeHeat(
  ...args: Parameters<BehaviorSystem['respondToExtremeHeat']>
): ReturnType<BehaviorSystem['respondToExtremeHeat']> {
  return getActiveBehaviorSystem().respondToExtremeHeat(...args);
}
export function respondToColdExposure(
  ...args: Parameters<BehaviorSystem['respondToColdExposure']>
): ReturnType<BehaviorSystem['respondToColdExposure']> {
  return getActiveBehaviorSystem().respondToColdExposure(...args);
}
export function seekShadeDuringHeat(
  ...args: Parameters<BehaviorSystem['seekShadeDuringHeat']>
): ReturnType<BehaviorSystem['seekShadeDuringHeat']> {
  return getActiveBehaviorSystem().seekShadeDuringHeat(...args);
}
export function seekWarmthDuringCold(
  ...args: Parameters<BehaviorSystem['seekWarmthDuringCold']>
): ReturnType<BehaviorSystem['seekWarmthDuringCold']> {
  return getActiveBehaviorSystem().seekWarmthDuringCold(...args);
}
export function respondToSeasonalChange(
  ...args: Parameters<BehaviorSystem['respondToSeasonalChange']>
): ReturnType<BehaviorSystem['respondToSeasonalChange']> {
  return getActiveBehaviorSystem().respondToSeasonalChange(...args);
}
export function adaptBehaviorToNoiseLevel(
  ...args: Parameters<BehaviorSystem['adaptBehaviorToNoiseLevel']>
): ReturnType<BehaviorSystem['adaptBehaviorToNoiseLevel']> {
  return getActiveBehaviorSystem().adaptBehaviorToNoiseLevel(...args);
}
export function adaptBehaviorToCrowding(
  ...args: Parameters<BehaviorSystem['adaptBehaviorToCrowding']>
): ReturnType<BehaviorSystem['adaptBehaviorToCrowding']> {
  return getActiveBehaviorSystem().adaptBehaviorToCrowding(...args);
}
export function respondToUnfamiliarEnvironment(
  ...args: Parameters<BehaviorSystem['respondToUnfamiliarEnvironment']>
): ReturnType<BehaviorSystem['respondToUnfamiliarEnvironment']> {
  return getActiveBehaviorSystem().respondToUnfamiliarEnvironment(...args);
}
export function learnEnvironmentalSafetyCue(
  ...args: Parameters<BehaviorSystem['learnEnvironmentalSafetyCue']>
): ReturnType<BehaviorSystem['learnEnvironmentalSafetyCue']> {
  return getActiveBehaviorSystem().learnEnvironmentalSafetyCue(...args);
}
export function learnEnvironmentalDangerCue(
  ...args: Parameters<BehaviorSystem['learnEnvironmentalDangerCue']>
): ReturnType<BehaviorSystem['learnEnvironmentalDangerCue']> {
  return getActiveBehaviorSystem().learnEnvironmentalDangerCue(...args);
}
export function selectMicrohabitat(
  ...args: Parameters<BehaviorSystem['selectMicrohabitat']>
): ReturnType<BehaviorSystem['selectMicrohabitat']> {
  return getActiveBehaviorSystem().selectMicrohabitat(...args);
}
export function avoidPollutedArea(
  ...args: Parameters<BehaviorSystem['avoidPollutedArea']>
): ReturnType<BehaviorSystem['avoidPollutedArea']> {
  return getActiveBehaviorSystem().avoidPollutedArea(...args);
}
export function adaptToResourceScarcity(
  ...args: Parameters<BehaviorSystem['adaptToResourceScarcity']>
): ReturnType<BehaviorSystem['adaptToResourceScarcity']> {
  return getActiveBehaviorSystem().adaptToResourceScarcity(...args);
}
export function adaptToHabitatDisturbance(
  ...args: Parameters<BehaviorSystem['adaptToHabitatDisturbance']>
): ReturnType<BehaviorSystem['adaptToHabitatDisturbance']> {
  return getActiveBehaviorSystem().adaptToHabitatDisturbance(...args);
}
export function updateBehavioralEcologyState(
  ...args: Parameters<BehaviorSystem['updateBehavioralEcologyState']>
): ReturnType<BehaviorSystem['updateBehavioralEcologyState']> {
  return getActiveBehaviorSystem().updateBehavioralEcologyState(...args);
}
export function detectHumanPresence(
  ...args: Parameters<BehaviorSystem['detectHumanPresence']>
): ReturnType<BehaviorSystem['detectHumanPresence']> {
  return getActiveBehaviorSystem().detectHumanPresence(...args);
}
export function recognizeFamiliarCaregiver(
  ...args: Parameters<BehaviorSystem['recognizeFamiliarCaregiver']>
): ReturnType<BehaviorSystem['recognizeFamiliarCaregiver']> {
  return getActiveBehaviorSystem().recognizeFamiliarCaregiver(...args);
}
export function estimateHumanApproachIntent(
  ...args: Parameters<BehaviorSystem['estimateHumanApproachIntent']>
): ReturnType<BehaviorSystem['estimateHumanApproachIntent']> {
  return getActiveBehaviorSystem().estimateHumanApproachIntent(...args);
}
export function estimateHumanThreatLevel(
  ...args: Parameters<BehaviorSystem['estimateHumanThreatLevel']>
): ReturnType<BehaviorSystem['estimateHumanThreatLevel']> {
  return getActiveBehaviorSystem().estimateHumanThreatLevel(...args);
}
export function approachHumanCautiously(
  ...args: Parameters<BehaviorSystem['approachHumanCautiously']>
): ReturnType<BehaviorSystem['approachHumanCautiously']> {
  return getActiveBehaviorSystem().approachHumanCautiously(...args);
}
export function retreatFromHuman(
  ...args: Parameters<BehaviorSystem['retreatFromHuman']>
): ReturnType<BehaviorSystem['retreatFromHuman']> {
  return getActiveBehaviorSystem().retreatFromHuman(...args);
}
export function respondToHumanVoice(
  ...args: Parameters<BehaviorSystem['respondToHumanVoice']>
): ReturnType<BehaviorSystem['respondToHumanVoice']> {
  return getActiveBehaviorSystem().respondToHumanVoice(...args);
}
export function respondToHumanGesture(
  ...args: Parameters<BehaviorSystem['respondToHumanGesture']>
): ReturnType<BehaviorSystem['respondToHumanGesture']> {
  return getActiveBehaviorSystem().respondToHumanGesture(...args);
}
export function learnHumanRoutine(
  ...args: Parameters<BehaviorSystem['learnHumanRoutine']>
): ReturnType<BehaviorSystem['learnHumanRoutine']> {
  return getActiveBehaviorSystem().learnHumanRoutine(...args);
}
export function anticipateHumanFeeding(
  ...args: Parameters<BehaviorSystem['anticipateHumanFeeding']>
): ReturnType<BehaviorSystem['anticipateHumanFeeding']> {
  return getActiveBehaviorSystem().anticipateHumanFeeding(...args);
}
export function requestFoodFromHuman(
  ...args: Parameters<BehaviorSystem['requestFoodFromHuman']>
): ReturnType<BehaviorSystem['requestFoodFromHuman']> {
  return getActiveBehaviorSystem().requestFoodFromHuman(...args);
}
export function seekContactWithHuman(
  ...args: Parameters<BehaviorSystem['seekContactWithHuman']>
): ReturnType<BehaviorSystem['seekContactWithHuman']> {
  return getActiveBehaviorSystem().seekContactWithHuman(...args);
}
export function avoidUnwantedHumanContact(
  ...args: Parameters<BehaviorSystem['avoidUnwantedHumanContact']>
): ReturnType<BehaviorSystem['avoidUnwantedHumanContact']> {
  return getActiveBehaviorSystem().avoidUnwantedHumanContact(...args);
}
export function acceptFamiliarHandling(
  ...args: Parameters<BehaviorSystem['acceptFamiliarHandling']>
): ReturnType<BehaviorSystem['acceptFamiliarHandling']> {
  return getActiveBehaviorSystem().acceptFamiliarHandling(...args);
}
export function respondToHumanTrainingCue(
  ...args: Parameters<BehaviorSystem['respondToHumanTrainingCue']>
): ReturnType<BehaviorSystem['respondToHumanTrainingCue']> {
  return getActiveBehaviorSystem().respondToHumanTrainingCue(...args);
}
export function learnHumanRewardAssociation(
  ...args: Parameters<BehaviorSystem['learnHumanRewardAssociation']>
): ReturnType<BehaviorSystem['learnHumanRewardAssociation']> {
  return getActiveBehaviorSystem().learnHumanRewardAssociation(...args);
}
export function communicateNeedToHuman(
  ...args: Parameters<BehaviorSystem['communicateNeedToHuman']>
): ReturnType<BehaviorSystem['communicateNeedToHuman']> {
  return getActiveBehaviorSystem().communicateNeedToHuman(...args);
}
export function recoverTrustAfterNegativeInteraction(
  ...args: Parameters<BehaviorSystem['recoverTrustAfterNegativeInteraction']>
): ReturnType<BehaviorSystem['recoverTrustAfterNegativeInteraction']> {
  return getActiveBehaviorSystem().recoverTrustAfterNegativeInteraction(...args);
}
export function adaptToHumanLivingEnvironment(
  ...args: Parameters<BehaviorSystem['adaptToHumanLivingEnvironment']>
): ReturnType<BehaviorSystem['adaptToHumanLivingEnvironment']> {
  return getActiveBehaviorSystem().adaptToHumanLivingEnvironment(...args);
}
export function maintainHumanAnimalBond(
  ...args: Parameters<BehaviorSystem['maintainHumanAnimalBond']>
): ReturnType<BehaviorSystem['maintainHumanAnimalBond']> {
  return getActiveBehaviorSystem().maintainHumanAnimalBond(...args);
}
export function initializeBehaviorPolicy(
  ...args: Parameters<BehaviorSystem['initializeBehaviorPolicy']>
): ReturnType<BehaviorSystem['initializeBehaviorPolicy']> {
  return getActiveBehaviorSystem().initializeBehaviorPolicy(...args);
}
export function observeEnvironmentState(
  ...args: Parameters<BehaviorSystem['observeEnvironmentState']>
): ReturnType<BehaviorSystem['observeEnvironmentState']> {
  return getActiveBehaviorSystem().observeEnvironmentState(...args);
}
export function encodeBehaviorObservation(
  ...args: Parameters<BehaviorSystem['encodeBehaviorObservation']>
): ReturnType<BehaviorSystem['encodeBehaviorObservation']> {
  return getActiveBehaviorSystem().encodeBehaviorObservation(...args);
}
export function generateCandidateActions(
  ...args: Parameters<BehaviorSystem['generateCandidateActions']>
): ReturnType<BehaviorSystem['generateCandidateActions']> {
  return getActiveBehaviorSystem().generateCandidateActions(...args);
}
export function scoreCandidateAction(
  ...args: Parameters<BehaviorSystem['scoreCandidateAction']>
): ReturnType<BehaviorSystem['scoreCandidateAction']> {
  return getActiveBehaviorSystem().scoreCandidateAction(...args);
}
export function selectPolicyAction(
  ...args: Parameters<BehaviorSystem['selectPolicyAction']>
): ReturnType<BehaviorSystem['selectPolicyAction']> {
  return getActiveBehaviorSystem().selectPolicyAction(...args);
}
export function calculateBehaviorReward(
  ...args: Parameters<BehaviorSystem['calculateBehaviorReward']>
): ReturnType<BehaviorSystem['calculateBehaviorReward']> {
  return getActiveBehaviorSystem().calculateBehaviorReward(...args);
}
export function calculateBehaviorPenalty(
  ...args: Parameters<BehaviorSystem['calculateBehaviorPenalty']>
): ReturnType<BehaviorSystem['calculateBehaviorPenalty']> {
  return getActiveBehaviorSystem().calculateBehaviorPenalty(...args);
}
export function updateActionValue(
  ...args: Parameters<BehaviorSystem['updateActionValue']>
): ReturnType<BehaviorSystem['updateActionValue']> {
  return getActiveBehaviorSystem().updateActionValue(...args);
}
export function updateBehaviorPolicy(
  ...args: Parameters<BehaviorSystem['updateBehaviorPolicy']>
): ReturnType<BehaviorSystem['updateBehaviorPolicy']> {
  return getActiveBehaviorSystem().updateBehaviorPolicy(...args);
}
export function exploreAlternativeBehavior(
  ...args: Parameters<BehaviorSystem['exploreAlternativeBehavior']>
): ReturnType<BehaviorSystem['exploreAlternativeBehavior']> {
  return getActiveBehaviorSystem().exploreAlternativeBehavior(...args);
}
export function exploitLearnedBehavior(
  ...args: Parameters<BehaviorSystem['exploitLearnedBehavior']>
): ReturnType<BehaviorSystem['exploitLearnedBehavior']> {
  return getActiveBehaviorSystem().exploitLearnedBehavior(...args);
}
export function storeBehaviorEpisode(
  ...args: Parameters<BehaviorSystem['storeBehaviorEpisode']>
): ReturnType<BehaviorSystem['storeBehaviorEpisode']> {
  return getActiveBehaviorSystem().storeBehaviorEpisode(...args);
}
export function replayBehaviorExperience(
  ...args: Parameters<BehaviorSystem['replayBehaviorExperience']>
): ReturnType<BehaviorSystem['replayBehaviorExperience']> {
  return getActiveBehaviorSystem().replayBehaviorExperience(...args);
}
export function generalizeBehaviorAcrossContexts(
  ...args: Parameters<BehaviorSystem['generalizeBehaviorAcrossContexts']>
): ReturnType<BehaviorSystem['generalizeBehaviorAcrossContexts']> {
  return getActiveBehaviorSystem().generalizeBehaviorAcrossContexts(...args);
}
export function transferBehaviorBetweenTasks(
  ...args: Parameters<BehaviorSystem['transferBehaviorBetweenTasks']>
): ReturnType<BehaviorSystem['transferBehaviorBetweenTasks']> {
  return getActiveBehaviorSystem().transferBehaviorBetweenTasks(...args);
}
export function evaluatePolicyRobustness(
  ...args: Parameters<BehaviorSystem['evaluatePolicyRobustness']>
): ReturnType<BehaviorSystem['evaluatePolicyRobustness']> {
  return getActiveBehaviorSystem().evaluatePolicyRobustness(...args);
}
export function detectBehavioralAnomaly(
  ...args: Parameters<BehaviorSystem['detectBehavioralAnomaly']>
): ReturnType<BehaviorSystem['detectBehavioralAnomaly']> {
  return getActiveBehaviorSystem().detectBehavioralAnomaly(...args);
}
export function explainSelectedAction(
  ...args: Parameters<BehaviorSystem['explainSelectedAction']>
): ReturnType<BehaviorSystem['explainSelectedAction']> {
  return getActiveBehaviorSystem().explainSelectedAction(...args);
}
export function resetBehaviorLearningState(
  ...args: Parameters<BehaviorSystem['resetBehaviorLearningState']>
): ReturnType<BehaviorSystem['resetBehaviorLearningState']> {
  return getActiveBehaviorSystem().resetBehaviorLearningState(...args);
}
export function initBehaviorSimulation(
  ...args: Parameters<BehaviorSystem['initBehaviorSimulation']>
): ReturnType<BehaviorSystem['initBehaviorSimulation']> {
  return getActiveBehaviorSystem().initBehaviorSimulation(...args);
}
export function updateBehaviorSimulation(
  ...args: Parameters<BehaviorSystem['updateBehaviorSimulation']>
): ReturnType<BehaviorSystem['updateBehaviorSimulation']> {
  return getActiveBehaviorSystem().updateBehaviorSimulation(...args);
}
export function updateAgentDecisionLoop(
  ...args: Parameters<BehaviorSystem['updateAgentDecisionLoop']>
): ReturnType<BehaviorSystem['updateAgentDecisionLoop']> {
  return getActiveBehaviorSystem().updateAgentDecisionLoop(...args);
}
export function synchronizeEmotionAndAction(
  ...args: Parameters<BehaviorSystem['synchronizeEmotionAndAction']>
): ReturnType<BehaviorSystem['synchronizeEmotionAndAction']> {
  return getActiveBehaviorSystem().synchronizeEmotionAndAction(...args);
}
export function synchronizeThoughtAndSpeech(
  ...args: Parameters<BehaviorSystem['synchronizeThoughtAndSpeech']>
): ReturnType<BehaviorSystem['synchronizeThoughtAndSpeech']> {
  return getActiveBehaviorSystem().synchronizeThoughtAndSpeech(...args);
}
export function synchronizeSpeechAndLipAnimation(
  ...args: Parameters<BehaviorSystem['synchronizeSpeechAndLipAnimation']>
): ReturnType<BehaviorSystem['synchronizeSpeechAndLipAnimation']> {
  return getActiveBehaviorSystem().synchronizeSpeechAndLipAnimation(...args);
}
export function synchronizeEmotionAndFacialAnimation(
  ...args: Parameters<BehaviorSystem['synchronizeEmotionAndFacialAnimation']>
): ReturnType<BehaviorSystem['synchronizeEmotionAndFacialAnimation']> {
  return getActiveBehaviorSystem().synchronizeEmotionAndFacialAnimation(...args);
}
export function synchronizeMovementAndNavigation(
  ...args: Parameters<BehaviorSystem['synchronizeMovementAndNavigation']>
): ReturnType<BehaviorSystem['synchronizeMovementAndNavigation']> {
  return getActiveBehaviorSystem().synchronizeMovementAndNavigation(...args);
}
export function blendLocomotionAnimation(
  ...args: Parameters<BehaviorSystem['blendLocomotionAnimation']>
): ReturnType<BehaviorSystem['blendLocomotionAnimation']> {
  return getActiveBehaviorSystem().blendLocomotionAnimation(...args);
}
export function blendSocialInteractionAnimation(
  ...args: Parameters<BehaviorSystem['blendSocialInteractionAnimation']>
): ReturnType<BehaviorSystem['blendSocialInteractionAnimation']> {
  return getActiveBehaviorSystem().blendSocialInteractionAnimation(...args);
}
export function coordinateMultiAgentBehavior(
  ...args: Parameters<BehaviorSystem['coordinateMultiAgentBehavior']>
): ReturnType<BehaviorSystem['coordinateMultiAgentBehavior']> {
  return getActiveBehaviorSystem().coordinateMultiAgentBehavior(...args);
}
export function resolveAgentActionConflict(
  ...args: Parameters<BehaviorSystem['resolveAgentActionConflict']>
): ReturnType<BehaviorSystem['resolveAgentActionConflict']> {
  return getActiveBehaviorSystem().resolveAgentActionConflict(...args);
}
export function updateAgentInteractionGraph(
  ...args: Parameters<BehaviorSystem['updateAgentInteractionGraph']>
): ReturnType<BehaviorSystem['updateAgentInteractionGraph']> {
  return getActiveBehaviorSystem().updateAgentInteractionGraph(...args);
}
export function simulateBehaviorAtFixedTimestep(
  ...args: Parameters<BehaviorSystem['simulateBehaviorAtFixedTimestep']>
): ReturnType<BehaviorSystem['simulateBehaviorAtFixedTimestep']> {
  return getActiveBehaviorSystem().simulateBehaviorAtFixedTimestep(...args);
}
export function interpolateBehaviorState(
  ...args: Parameters<BehaviorSystem['interpolateBehaviorState']>
): ReturnType<BehaviorSystem['interpolateBehaviorState']> {
  return getActiveBehaviorSystem().interpolateBehaviorState(...args);
}
export function serializeAgentBehaviorState(
  ...args: Parameters<BehaviorSystem['serializeAgentBehaviorState']>
): ReturnType<BehaviorSystem['serializeAgentBehaviorState']> {
  return getActiveBehaviorSystem().serializeAgentBehaviorState(...args);
}
export function restoreAgentBehaviorState(
  ...args: Parameters<BehaviorSystem['restoreAgentBehaviorState']>
): ReturnType<BehaviorSystem['restoreAgentBehaviorState']> {
  return getActiveBehaviorSystem().restoreAgentBehaviorState(...args);
}
export function optimizeAgentUpdateSchedule(
  ...args: Parameters<BehaviorSystem['optimizeAgentUpdateSchedule']>
): ReturnType<BehaviorSystem['optimizeAgentUpdateSchedule']> {
  return getActiveBehaviorSystem().optimizeAgentUpdateSchedule(...args);
}
export function reduceDistantAgentSimulationDetail(
  ...args: Parameters<BehaviorSystem['reduceDistantAgentSimulationDetail']>
): ReturnType<BehaviorSystem['reduceDistantAgentSimulationDetail']> {
  return getActiveBehaviorSystem().reduceDistantAgentSimulationDetail(...args);
}
export function validateBehaviorSimulationState(
  ...args: Parameters<BehaviorSystem['validateBehaviorSimulationState']>
): ReturnType<BehaviorSystem['validateBehaviorSimulationState']> {
  return getActiveBehaviorSystem().validateBehaviorSimulationState(...args);
}
