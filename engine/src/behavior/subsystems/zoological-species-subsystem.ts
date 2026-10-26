/**
 * @file zoological-species-subsystem.ts
 * @module @aetheria/engine/behavior/subsystems/zoological-species-subsystem
 * @description General Animal, Canines, Felines, Birds & Hunting Subsystem (701–900).
 */

import type {
  EmotionalState,
  PersonalityProfile,
  GoalEntity,
  CognitiveMemory,
  BiologicalNeeds,
  SocialRelationship,
  AnimalBehaviorState,
  BehaviorPolicyState
} from '../types.js';
import {
  BehaviorSubsystemBase,
  deriveActionProfile,
  findSignal,
  normalizeSignal,
  roundSignal,
} from '../behavior-primitives.js';

export class ZoologicalSpeciesSubsystem extends BehaviorSubsystemBase {
  public isInitialized = false;
  public simulationTicks = 0;
  public lastUpdateTime = 0;
  public resetCounter = 0;
  public state: Record<string, any> = {};
  public context: Record<string, any> = {};
  public emotionLevels: Map<string, number> = new Map();
  public actionHistory: Array<{ action: string; payload?: any; urgency: number; timestamp: number }> = [];
  public knowledgeStore: Map<string, { key: string; data: any; retention: number }> = new Map();
  public eventLog: Array<{ event: string; intensity: number; cause?: string; timestamp: number }> = [];

  public recordEvent(event: string, intensity: number, cause?: string) {
    this.eventLog.push({ event, intensity, cause, timestamp: Date.now() });
    if (this.eventLog.length > 200) this.eventLog.shift();
  }

  // ==========================================================================
  // 36. Cảm xúc và nhận thức ở động vật nói chung (701–720)
  // ==========================================================================

  /**
   * [0701] initAnimalAgent
   * Khởi tạo cá thể động vật.
   */
  public initAnimalAgent(config?: Record<string, any>): any {
    return this.applyInitialization('initAnimalAgent', config);
  }
  /**
   * [0702] updateAnimalState
   * Cập nhật trạng thái động vật.
   */
  public updateAnimalState(deltaTime = 0.016, context?: Record<string, any>): any {
    return this.applyUpdate('updateAnimalState', deltaTime, context);
  }
  /**
   * [0703] updateAnimalBehavior
   * Cập nhật hành vi động vật.
   */
  public updateAnimalBehavior(deltaTime = 0.016, context?: Record<string, any>): any {
    return this.applyUpdate('updateAnimalBehavior', deltaTime, context);
  }
  /**
   * [0704] estimateAnimalArousal
   * Ước lượng mức kích hoạt.
   */
  public estimateAnimalArousal(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimateAnimalArousal', target, options);
    return {
      query: 'estimateAnimalArousal',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0705] estimateAnimalValence
   * Ước lượng sắc thái cảm xúc tích cực hoặc tiêu cực.
   */
  public estimateAnimalValence(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimateAnimalValence', target, options);
    return {
      query: 'estimateAnimalValence',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0706] detectAnimalStress
   * Phát hiện căng thẳng.
   */
  public detectAnimalStress(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalStress', threshold, environment);
  }
  /**
   * [0707] detectAnimalFear
   * Phát hiện sợ hãi.
   */
  public detectAnimalFear(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalFear', threshold, environment);
  }
  /**
   * [0708] detectAnimalCuriosity
   * Phát hiện tò mò.
   */
  public detectAnimalCuriosity(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalCuriosity', threshold, environment);
  }
  /**
   * [0709] detectAnimalPlayfulness
   * Phát hiện xu hướng vui chơi.
   */
  public detectAnimalPlayfulness(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalPlayfulness', threshold, environment);
  }
  /**
   * [0710] detectAnimalFrustration
   * Phát hiện bực bội.
   */
  public detectAnimalFrustration(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalFrustration', threshold, environment);
  }
  /**
   * [0711] detectAnimalComfort
   * Phát hiện trạng thái thoải mái.
   */
  public detectAnimalComfort(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalComfort', threshold, environment);
  }
  /**
   * [0712] detectAnimalDiscomfort
   * Phát hiện trạng thái khó chịu.
   */
  public detectAnimalDiscomfort(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalDiscomfort', threshold, environment);
  }
  /**
   * [0713] regulateAnimalArousal
   * Điều chỉnh mức kích hoạt.
   */
  public regulateAnimalArousal(context?: any, intensity = 0.5): any {
    return this.applyOperation('regulateAnimalArousal', intensity, context);
  }
  /**
   * [0714] recoverAnimalStress
   * Phục hồi sau căng thẳng.
   */
  public recoverAnimalStress(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('recoverAnimalStress', factor, stimulus);
  }
  /**
   * [0715] learnAnimalPreference
   * Học sở thích của động vật.
   */
  public learnAnimalPreference(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnAnimalPreference', experienceData, retention);
  }
  /**
   * [0716] rememberAnimalExperience
   * Ghi nhớ trải nghiệm.
   */
  public rememberAnimalExperience(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('rememberAnimalExperience', experienceData, retention);
  }
  /**
   * [0717] predictAnimalReaction
   * Dự đoán phản ứng động vật.
   */
  public predictAnimalReaction(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('predictAnimalReaction', target, options);
    return {
      query: 'predictAnimalReaction',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0718] adaptAnimalBehavior
   * Điều chỉnh hành vi.
   */
  public adaptAnimalBehavior(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adaptAnimalBehavior', factor, stimulus);
  }
  /**
   * [0719] selectAnimalAction
   * Chọn hành động.
   */
  public selectAnimalAction(candidates?: any[], criteria?: Record<string, any>): any {
    return this.applySelection('selectAnimalAction', candidates, criteria);
  }
  /**
   * [0720] evaluateAnimalOutcome
   * Đánh giá kết quả hành động.
   */
  public evaluateAnimalOutcome(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('evaluateAnimalOutcome', target, options);
    return {
      query: 'evaluateAnimalOutcome',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  // ==========================================================================
  // 37. Bản năng, nhu cầu và hành vi sinh tồn động vật (721–740)
  // ==========================================================================

  /**
   * [0721] detectAnimalHunger
   * Phát hiện đói.
   */
  public detectAnimalHunger(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalHunger', threshold, environment);
  }
  /**
   * [0722] detectAnimalThirst
   * Phát hiện khát.
   */
  public detectAnimalThirst(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalThirst', threshold, environment);
  }
  /**
   * [0723] detectAnimalFatigue
   * Phát hiện mệt mỏi.
   */
  public detectAnimalFatigue(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalFatigue', threshold, environment);
  }
  /**
   * [0724] detectAnimalPain
   * Phát hiện đau đớn.
   */
  public detectAnimalPain(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalPain', threshold, environment);
  }
  /**
   * [0725] detectAnimalIllness
   * Phát hiện dấu hiệu bệnh.
   */
  public detectAnimalIllness(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectAnimalIllness', threshold, environment);
  }
  /**
   * [0726] searchAnimalFood
   * Tìm thức ăn.
   */
  public searchAnimalFood(context?: any, intensity = 0.5): any {
    return this.applyOperation('searchAnimalFood', intensity, context);
  }
  /**
   * [0727] searchAnimalWater
   * Tìm nước.
   */
  public searchAnimalWater(context?: any, intensity = 0.5): any {
    return this.applyOperation('searchAnimalWater', intensity, context);
  }
  /**
   * [0728] seekAnimalShelter
   * Tìm nơi trú ẩn.
   */
  public seekAnimalShelter(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('seekAnimalShelter', targetEntity, urgency);
  }
  /**
   * [0729] seekAnimalRestingPlace
   * Tìm nơi nghỉ ngơi.
   */
  public seekAnimalRestingPlace(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('seekAnimalRestingPlace', targetEntity, urgency);
  }
  /**
   * [0730] regulateAnimalBodyTemperature
   * Điều hòa thân nhiệt.
   */
  public regulateAnimalBodyTemperature(context?: any, intensity = 0.5): any {
    return this.applyOperation('regulateAnimalBodyTemperature', intensity, context);
  }
  /**
   * [0731] conserveAnimalEnergy
   * Tiết kiệm năng lượng.
   */
  public conserveAnimalEnergy(context?: any, intensity = 0.5): any {
    return this.applyOperation('conserveAnimalEnergy', intensity, context);
  }
  /**
   * [0732] avoidAnimalPredator
   * Tránh kẻ săn mồi.
   */
  public avoidAnimalPredator(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('avoidAnimalPredator', targetEntity, urgency);
  }
  /**
   * [0733] escapeAnimalThreat
   * Thoát khỏi mối đe dọa.
   */
  public escapeAnimalThreat(context?: any, intensity = 0.5): any {
    return this.applyOperation('escapeAnimalThreat', intensity, context);
  }
  /**
   * [0734] freezeAnimalResponse
   * Mô phỏng phản ứng bất động.
   */
  public freezeAnimalResponse(context?: any, intensity = 0.5): any {
    return this.applyOperation('freezeAnimalResponse', intensity, context);
  }
  /**
   * [0735] defendAnimalTerritory
   * Bảo vệ lãnh thổ.
   */
  public defendAnimalTerritory(context?: any, intensity = 0.5): any {
    return this.applyOperation('defendAnimalTerritory', intensity, context);
  }
  /**
   * [0736] protectAnimalResource
   * Bảo vệ tài nguyên.
   */
  public protectAnimalResource(context?: any, intensity = 0.5): any {
    return this.applyOperation('protectAnimalResource', intensity, context);
  }
  /**
   * [0737] exploreAnimalEnvironment
   * Khám phá môi trường.
   */
  public exploreAnimalEnvironment(context?: any, intensity = 0.5): any {
    return this.applyOperation('exploreAnimalEnvironment', intensity, context);
  }
  /**
   * [0738] returnToAnimalShelter
   * Trở về nơi trú ẩn.
   */
  public returnToAnimalShelter(context?: any, intensity = 0.5): any {
    return this.applyOperation('returnToAnimalShelter', intensity, context);
  }
  /**
   * [0739] adaptAnimalActivityCycle
   * Điều chỉnh chu kỳ hoạt động.
   */
  public adaptAnimalActivityCycle(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adaptAnimalActivityCycle', factor, stimulus);
  }
  /**
   * [0740] maintainAnimalHomeostasis
   * Duy trì cân bằng nội môi.
   */
  public maintainAnimalHomeostasis(context?: any, intensity = 0.5): any {
    return this.applyOperation('maintainAnimalHomeostasis', intensity, context);
  }
  // ==========================================================================
  // 38. Chó: cảm xúc, học tập và giao tiếp (741–760)
  // ==========================================================================

  /**
   * [0741] initDogBehavior
   * Khởi tạo hành vi chó.
   */
  public initDogBehavior(config?: Record<string, any>): any {
    const result = this.applyInitialization('initDogBehavior', config);
    // Hồ sơ chó dựng từ cấu hình + trạng thái thật (năng lượng / tốc độ / mức hoạt động).
    const sources = [config, this.state];
    const energy = findSignal(sources, ['energy', 'stamina']);
    const speed = findSignal(sources, ['speed', 'agility']);
    const activity = findSignal(sources, ['activity', 'activityLevel', 'intensity']);
    const baseIntensity = typeof result.intensity === 'number' ? result.intensity : 0;
    return {
      ...result,
      canineProfile: {
        energy: energy ? roundSignal(energy.value) : null,
        speed: speed ? roundSignal(speed.value) : null,
        activityLevel: activity
          ? roundSignal(normalizeSignal(activity.value, activity.key))
          : roundSignal(baseIntensity),
      },
    };
  }
  /**
   * [0742] detectDogExcitement
   * Phát hiện chó phấn khích.
   */
  public detectDogExcitement(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectDogExcitement', threshold, environment);
  }
  /**
   * [0743] detectDogFear
   * Phát hiện chó sợ hãi.
   */
  public detectDogFear(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectDogFear', threshold, environment);
  }
  /**
   * [0744] detectDogRelaxation
   * Phát hiện chó thư giãn.
   */
  public detectDogRelaxation(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectDogRelaxation', threshold, environment);
  }
  /**
   * [0745] detectDogFrustration
   * Phát hiện chó bực bội.
   */
  public detectDogFrustration(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectDogFrustration', threshold, environment);
  }
  /**
   * [0746] recognizeDogOwner
   * Nhận diện người chăm sóc.
   */
  public recognizeDogOwner(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeDogOwner', threshold, environment);
  }
  /**
   * [0747] approachFamiliarHuman
   * Tiến đến người quen.
   */
  public approachFamiliarHuman(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('approachFamiliarHuman', targetEntity, urgency);
  }
  /**
   * [0748] greetFamiliarHuman
   * Chào người quen.
   */
  public greetFamiliarHuman(context?: any, intensity = 0.5): any {
    return this.applyOperation('greetFamiliarHuman', intensity, context);
  }
  /**
   * [0749] followHumanMovement
   * Đi theo chuyển động của người.
   */
  public followHumanMovement(context?: any, intensity = 0.5): any {
    return this.applyOperation('followHumanMovement', intensity, context);
  }
  /**
   * [0750] respondToDogName
   * Phản ứng khi nghe tên.
   */
  public respondToDogName(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToDogName', factor, stimulus);
  }
  /**
   * [0751] respondToTrainingCue
   * Phản ứng với tín hiệu huấn luyện.
   */
  public respondToTrainingCue(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToTrainingCue', factor, stimulus);
  }
  /**
   * [0752] learnDogCommand
   * Học mệnh lệnh.
   */
  public learnDogCommand(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnDogCommand', experienceData, retention);
  }
  /**
   * [0753] reinforceDogBehavior
   * Củng cố hành vi chó.
   */
  public reinforceDogBehavior(context?: any, intensity = 0.5): any {
    return this.applyOperation('reinforceDogBehavior', intensity, context);
  }
  /**
   * [0754] initiateDogPlay
   * Khởi xướng trò chơi.
   */
  public initiateDogPlay(config?: Record<string, any>): any {
    const result = this.applyInitialization('initiateDogPlay', config);
    // Thời lượng chơi / mức độ hào hứng / hao năng lượng suy ra từ dữ liệu thật.
    return { ...result, ...deriveActionProfile([config, this.state], result) };
  }
  /**
   * [0755] inviteDogPlay
   * Mời chơi bằng ngôn ngữ cơ thể.
   */
  public inviteDogPlay(context?: any, intensity = 0.5): any {
    return this.applyOperation('inviteDogPlay', intensity, context);
  }
  /**
   * [0756] performDogTailMovement
   * Mô phỏng chuyển động đuôi.
   */
  public performDogTailMovement(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performDogTailMovement', actionPayload, urgency);
  }
  /**
   * [0757] performDogEarMovement
   * Mô phỏng chuyển động tai.
   */
  public performDogEarMovement(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performDogEarMovement', actionPayload, urgency);
  }
  /**
   * [0758] vocalizeDogBark
   * Mô phỏng tiếng sủa.
   */
  public vocalizeDogBark(message?: any, intensity = 0.7): any {
    return this.applyExpression('vocalizeDogBark', message, intensity);
  }
  /**
   * [0759] sniffEnvironmentalObject
   * Ngửi vật thể trong môi trường.
   */
  public sniffEnvironmentalObject(context?: any, intensity = 0.5): any {
    return this.applyOperation('sniffEnvironmentalObject', intensity, context);
  }
  /**
   * [0760] seekHumanReassurance
   * Tìm kiếm sự trấn an từ người.
   */
  public seekHumanReassurance(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('seekHumanReassurance', targetEntity, urgency);
  }
  // ==========================================================================
  // 39. Mèo: cảm xúc, lãnh thổ và giao tiếp (761–780)
  // ==========================================================================

  /**
   * [0761] initCatBehavior
   * Khởi tạo hành vi mèo.
   */
  public initCatBehavior(config?: Record<string, any>): any {
    return this.applyInitialization('initCatBehavior', config);
  }
  /**
   * [0762] detectCatCuriosity
   * Phát hiện mèo tò mò.
   */
  public detectCatCuriosity(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectCatCuriosity', threshold, environment);
  }
  /**
   * [0763] detectCatFear
   * Phát hiện mèo sợ hãi.
   */
  public detectCatFear(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectCatFear', threshold, environment);
  }
  /**
   * [0764] detectCatIrritation
   * Phát hiện mèo khó chịu.
   */
  public detectCatIrritation(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectCatIrritation', threshold, environment);
  }
  /**
   * [0765] detectCatRelaxation
   * Phát hiện mèo thư giãn.
   */
  public detectCatRelaxation(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectCatRelaxation', threshold, environment);
  }
  /**
   * [0766] recognizeFamiliarCatHuman
   * Nhận diện người quen.
   */
  public recognizeFamiliarCatHuman(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeFamiliarCatHuman', threshold, environment);
  }
  /**
   * [0767] approachCatFamiliarHuman
   * Tiến đến người quen.
   */
  public approachCatFamiliarHuman(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('approachCatFamiliarHuman', targetEntity, urgency);
  }
  /**
   * [0768] avoidCatUnfamiliarHuman
   * Tránh người lạ.
   */
  public avoidCatUnfamiliarHuman(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('avoidCatUnfamiliarHuman', targetEntity, urgency);
  }
  /**
   * [0769] performCatTailSignal
   * Mô phỏng tín hiệu bằng đuôi.
   */
  public performCatTailSignal(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performCatTailSignal', actionPayload, urgency);
  }
  /**
   * [0770] performCatEarSignal
   * Mô phỏng tín hiệu bằng tai.
   */
  public performCatEarSignal(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performCatEarSignal', actionPayload, urgency);
  }
  /**
   * [0771] performCatPurring
   * Mô phỏng tiếng gừ gừ.
   */
  public performCatPurring(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performCatPurring', actionPayload, urgency);
  }
  /**
   * [0772] performCatMeowing
   * Mô phỏng tiếng kêu.
   */
  public performCatMeowing(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performCatMeowing', actionPayload, urgency);
  }
  /**
   * [0773] rubAgainstFamiliarObject
   * Cọ vào vật quen thuộc.
   */
  public rubAgainstFamiliarObject(context?: any, intensity = 0.5): any {
    return this.applyOperation('rubAgainstFamiliarObject', intensity, context);
  }
  /**
   * [0774] markCatTerritory
   * Đánh dấu lãnh thổ.
   */
  public markCatTerritory(context?: any, intensity = 0.5): any {
    return this.applyOperation('markCatTerritory', intensity, context);
  }
  /**
   * [0775] scratchCatSurface
   * Cào bề mặt.
   */
  public scratchCatSurface(context?: any, intensity = 0.5): any {
    return this.applyOperation('scratchCatSurface', intensity, context);
  }
  /**
   * [0776] stalkCatPrey
   * Rình rập con mồi.
   */
  public stalkCatPrey(context?: any, intensity = 0.5): any {
    return this.applyOperation('stalkCatPrey', intensity, context);
  }
  /**
   * [0777] pounceOnCatTarget
   * Vồ mục tiêu.
   */
  public pounceOnCatTarget(context?: any, intensity = 0.5): any {
    return this.applyOperation('pounceOnCatTarget', intensity, context);
  }
  /**
   * [0778] hideCatInShelter
   * Ẩn nấp trong chỗ trú.
   */
  public hideCatInShelter(context?: any, intensity = 0.5): any {
    return this.applyOperation('hideCatInShelter', intensity, context);
  }
  /**
   * [0779] groomCatFur
   * Chải chuốt bộ lông.
   */
  public groomCatFur(context?: any, intensity = 0.5): any {
    return this.applyOperation('groomCatFur', intensity, context);
  }
  /**
   * [0780] selectCatRestingSpot
   * Chọn chỗ nghỉ.
   */
  public selectCatRestingSpot(candidates?: any[], criteria?: Record<string, any>): any {
    return this.applySelection('selectCatRestingSpot', candidates, criteria);
  }
  // ==========================================================================
  // 40. Chim: giao tiếp, kiếm ăn và di chuyển (781–800)
  // ==========================================================================

  /**
   * [0781] initBirdBehavior
   * Khởi tạo hành vi chim.
   */
  public initBirdBehavior(config?: Record<string, any>): any {
    return this.applyInitialization('initBirdBehavior', config);
  }
  /**
   * [0782] detectBirdThreat
   * Phát hiện nguy hiểm.
   */
  public detectBirdThreat(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectBirdThreat', threshold, environment);
  }
  /**
   * [0783] detectBirdFoodSource
   * Phát hiện nguồn thức ăn.
   */
  public detectBirdFoodSource(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectBirdFoodSource', threshold, environment);
  }
  /**
   * [0784] searchBirdFood
   * Tìm thức ăn.
   */
  public searchBirdFood(context?: any, intensity = 0.5): any {
    return this.applyOperation('searchBirdFood', intensity, context);
  }
  /**
   * [0785] forageBirdGround
   * Kiếm ăn trên mặt đất.
   */
  public forageBirdGround(context?: any, intensity = 0.5): any {
    return this.applyOperation('forageBirdGround', intensity, context);
  }
  /**
   * [0786] perchOnBranch
   * Đậu trên cành.
   */
  public perchOnBranch(context?: any, intensity = 0.5): any {
    return this.applyOperation('perchOnBranch', intensity, context);
  }
  /**
   * [0787] takeOffFromPerch
   * Cất cánh từ chỗ đậu.
   */
  public takeOffFromPerch(context?: any, intensity = 0.5): any {
    return this.applyOperation('takeOffFromPerch', intensity, context);
  }
  /**
   * [0788] landOnPerch
   * Hạ cánh xuống chỗ đậu.
   */
  public landOnPerch(context?: any, intensity = 0.5): any {
    return this.applyOperation('landOnPerch', intensity, context);
  }
  /**
   * [0789] adjustBirdFlightPath
   * Điều chỉnh đường bay.
   */
  public adjustBirdFlightPath(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adjustBirdFlightPath', factor, stimulus);
  }
  /**
   * [0790] coordinateBirdFlock
   * Phối hợp đàn chim.
   */
  public coordinateBirdFlock(peerOrTarget?: any, blendWeight = 0.5): any {
    return this.applyCoordination('coordinateBirdFlock', peerOrTarget, blendWeight);
  }
  /**
   * [0791] maintainBirdFlockDistance
   * Duy trì khoảng cách trong đàn.
   */
  public maintainBirdFlockDistance(context?: any, intensity = 0.5): any {
    return this.applyOperation('maintainBirdFlockDistance', intensity, context);
  }
  /**
   * [0792] respondToBirdCall
   * Phản ứng với tiếng gọi.
   */
  public respondToBirdCall(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToBirdCall', factor, stimulus);
  }
  /**
   * [0793] produceBirdSong
   * Tạo tiếng hót.
   */
  public produceBirdSong(context?: any, intensity = 0.5): any {
    return this.applyOperation('produceBirdSong', intensity, context);
  }
  /**
   * [0794] performBirdCourtship
   * Thực hiện hành vi ve vãn.
   */
  public performBirdCourtship(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performBirdCourtship', actionPayload, urgency);
  }
  /**
   * [0795] defendBirdNest
   * Bảo vệ tổ.
   */
  public defendBirdNest(context?: any, intensity = 0.5): any {
    return this.applyOperation('defendBirdNest', intensity, context);
  }
  /**
   * [0796] collectNestingMaterial
   * Thu thập vật liệu làm tổ.
   */
  public collectNestingMaterial(context?: any, intensity = 0.5): any {
    return this.applyOperation('collectNestingMaterial', intensity, context);
  }
  /**
   * [0797] incubateBirdEggs
   * Ấp trứng.
   */
  public incubateBirdEggs(context?: any, intensity = 0.5): any {
    return this.applyOperation('incubateBirdEggs', intensity, context);
  }
  /**
   * [0798] feedBirdChick
   * Cho chim non ăn.
   */
  public feedBirdChick(context?: any, intensity = 0.5): any {
    return this.applyOperation('feedBirdChick', intensity, context);
  }
  /**
   * [0799] migrateWithBirdFlock
   * Di cư cùng đàn.
   */
  public migrateWithBirdFlock(context?: any, intensity = 0.5): any {
    return this.applyOperation('migrateWithBirdFlock', intensity, context);
  }
  /**
   * [0800] returnToBirdRoost
   * Trở về nơi ngủ.
   */
  public returnToBirdRoost(context?: any, intensity = 0.5): any {
    return this.applyOperation('returnToBirdRoost', intensity, context);
  }
  // ==========================================================================
  // 41. Động vật ăn thịt và hành vi săn mồi (801–820)
  // ==========================================================================

  /**
   * [0801] detectPrey
   * Phát hiện con mồi.
   */
  public detectPrey(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectPrey', threshold, environment);
  }
  /**
   * [0802] identifyPreySpecies
   * Nhận dạng loài con mồi.
   */
  public identifyPreySpecies(environment?: any, threshold = 0.4): any {
    return this.applyDetection('identifyPreySpecies', threshold, environment);
  }
  /**
   * [0803] estimatePreyDistance
   * Ước lượng khoảng cách con mồi.
   */
  public estimatePreyDistance(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimatePreyDistance', target, options);
    return {
      query: 'estimatePreyDistance',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0804] estimatePreySpeed
   * Ước lượng tốc độ con mồi.
   */
  public estimatePreySpeed(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimatePreySpeed', target, options);
    return {
      query: 'estimatePreySpeed',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0805] predictPreyTrajectory
   * Dự đoán đường di chuyển con mồi.
   */
  public predictPreyTrajectory(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('predictPreyTrajectory', target, options);
    return {
      query: 'predictPreyTrajectory',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0806] selectHuntingStrategy
   * Chọn chiến lược săn.
   */
  public selectHuntingStrategy(candidates?: any[], criteria?: Record<string, any>): any {
    return this.applySelection('selectHuntingStrategy', candidates, criteria);
  }
  /**
   * [0807] stalkPreyQuietly
   * Rình rập con mồi.
   */
  public stalkPreyQuietly(context?: any, intensity = 0.5): any {
    return this.applyOperation('stalkPreyQuietly', intensity, context);
  }
  /**
   * [0808] approachPreyUnderCover
   * Tiếp cận con mồi khi ẩn mình.
   */
  public approachPreyUnderCover(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('approachPreyUnderCover', targetEntity, urgency);
  }
  /**
   * [0809] waitForHuntingOpportunity
   * Chờ cơ hội săn.
   */
  public waitForHuntingOpportunity(context?: any, intensity = 0.5): any {
    return this.applyOperation('waitForHuntingOpportunity', intensity, context);
  }
  /**
   * [0810] initiatePredatoryChase
   * Bắt đầu truy đuổi.
   */
  public initiatePredatoryChase(config?: Record<string, any>): any {
    const result = this.applyInitialization('initiatePredatoryChase', config);
    // Thời lượng rượt đuổi / mức độ săn mồi / hao năng lượng suy ra từ dữ liệu thật.
    return { ...result, ...deriveActionProfile([config, this.state], result) };
  }
  /**
   * [0811] adjustChaseSpeed
   * Điều chỉnh tốc độ truy đuổi.
   */
  public adjustChaseSpeed(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adjustChaseSpeed', factor, stimulus);
  }
  /**
   * [0812] interceptMovingPrey
   * Chặn đường con mồi.
   */
  public interceptMovingPrey(context?: any, intensity = 0.5): any {
    return this.applyOperation('interceptMovingPrey', intensity, context);
  }
  /**
   * [0813] abortUnsuccessfulHunt
   * Hủy cuộc săn không hiệu quả.
   */
  public abortUnsuccessfulHunt(context?: any, intensity = 0.5): any {
    return this.applyOperation('abortUnsuccessfulHunt', intensity, context);
  }
  /**
   * [0814] capturePrey
   * Bắt con mồi.
   */
  public capturePrey(context?: any, intensity = 0.5): any {
    return this.applyOperation('capturePrey', intensity, context);
  }
  /**
   * [0815] secureCapturedPrey
   * Giữ con mồi đã bắt.
   */
  public secureCapturedPrey(context?: any, intensity = 0.5): any {
    return this.applyOperation('secureCapturedPrey', intensity, context);
  }
  /**
   * [0816] consumeCapturedPrey
   * Ăn con mồi.
   */
  public consumeCapturedPrey(context?: any, intensity = 0.5): any {
    return this.applyOperation('consumeCapturedPrey', intensity, context);
  }
  /**
   * [0817] sharePreyWithGroup
   * Chia sẻ con mồi trong nhóm.
   */
  public sharePreyWithGroup(context?: any, intensity = 0.5): any {
    return this.applyOperation('sharePreyWithGroup', intensity, context);
  }
  /**
   * [0818] defendFoodFromScavenger
   * Bảo vệ thức ăn khỏi loài ăn xác.
   */
  public defendFoodFromScavenger(context?: any, intensity = 0.5): any {
    return this.applyOperation('defendFoodFromScavenger', intensity, context);
  }
  /**
   * [0819] learnHuntingLocation
   * Ghi nhớ địa điểm săn.
   */
  public learnHuntingLocation(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnHuntingLocation', experienceData, retention);
  }
  /**
   * [0820] improveHuntingTechnique
   * Cải thiện kỹ thuật săn.
   */
  public improveHuntingTechnique(context?: any, intensity = 0.5): any {
    return this.applyOperation('improveHuntingTechnique', intensity, context);
  }
  // ==========================================================================
  // 42. Động vật ăn cỏ và hành vi kiếm ăn (821–840)
  // ==========================================================================

  /**
   * [0821] initHerbivoreBehavior
   * Khởi tạo hành vi động vật ăn cỏ.
   */
  public initHerbivoreBehavior(config?: Record<string, any>): any {
    return this.applyInitialization('initHerbivoreBehavior', config);
  }
  /**
   * [0822] detectEdibleVegetation
   * Phát hiện thực vật có thể ăn.
   */
  public detectEdibleVegetation(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectEdibleVegetation', threshold, environment);
  }
  /**
   * [0823] identifyPlantSpecies
   * Nhận diện loài thực vật.
   */
  public identifyPlantSpecies(environment?: any, threshold = 0.4): any {
    return this.applyDetection('identifyPlantSpecies', threshold, environment);
  }
  /**
   * [0824] evaluatePlantPalatability
   * Đánh giá độ ngon của thực vật.
   */
  public evaluatePlantPalatability(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('evaluatePlantPalatability', target, options);
    return {
      query: 'evaluatePlantPalatability',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0825] avoidToxicPlant
   * Tránh thực vật độc.
   */
  public avoidToxicPlant(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('avoidToxicPlant', targetEntity, urgency);
  }
  /**
   * [0826] selectGrazingArea
   * Chọn khu vực gặm cỏ.
   */
  public selectGrazingArea(candidates?: any[], criteria?: Record<string, any>): any {
    return this.applySelection('selectGrazingArea', candidates, criteria);
  }
  /**
   * [0827] beginGrazing
   * Bắt đầu gặm cỏ.
   */
  public beginGrazing(context?: any, intensity = 0.5): any {
    return this.applyOperation('beginGrazing', intensity, context);
  }
  /**
   * [0828] adjustGrazingRate
   * Điều chỉnh tốc độ ăn.
   */
  public adjustGrazingRate(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adjustGrazingRate', factor, stimulus);
  }
  /**
   * [0829] browseShrubLeaves
   * Ăn lá cây bụi.
   */
  public browseShrubLeaves(context?: any, intensity = 0.5): any {
    return this.applyOperation('browseShrubLeaves', intensity, context);
  }
  /**
   * [0830] searchSeasonalForage
   * Tìm thức ăn theo mùa.
   */
  public searchSeasonalForage(context?: any, intensity = 0.5): any {
    return this.applyOperation('searchSeasonalForage', intensity, context);
  }
  /**
   * [0831] moveBetweenFeedingPatches
   * Di chuyển giữa các bãi ăn.
   */
  public moveBetweenFeedingPatches(context?: any, intensity = 0.5): any {
    return this.applyOperation('moveBetweenFeedingPatches', intensity, context);
  }
  /**
   * [0832] monitorPredatorWhileFeeding
   * Theo dõi kẻ săn mồi khi ăn.
   */
  public monitorPredatorWhileFeeding(context?: any, intensity = 0.5): any {
    return this.applyOperation('monitorPredatorWhileFeeding', intensity, context);
  }
  /**
   * [0833] interruptGrazingForSafety
   * Ngừng ăn để đảm bảo an toàn.
   */
  public interruptGrazingForSafety(context?: any, intensity = 0.5): any {
    return this.applyOperation('interruptGrazingForSafety', intensity, context);
  }
  /**
   * [0834] returnToGrazingArea
   * Trở lại khu vực gặm cỏ.
   */
  public returnToGrazingArea(context?: any, intensity = 0.5): any {
    return this.applyOperation('returnToGrazingArea', intensity, context);
  }
  /**
   * [0835] competeForGrazingSpace
   * Cạnh tranh nơi kiếm ăn.
   */
  public competeForGrazingSpace(context?: any, intensity = 0.5): any {
    return this.applyOperation('competeForGrazingSpace', intensity, context);
  }
  /**
   * [0836] shareForagingArea
   * Chia sẻ khu vực kiếm ăn.
   */
  public shareForagingArea(context?: any, intensity = 0.5): any {
    return this.applyOperation('shareForagingArea', intensity, context);
  }
  /**
   * [0837] learnSeasonalFoodLocation
   * Ghi nhớ nơi có thức ăn theo mùa.
   */
  public learnSeasonalFoodLocation(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnSeasonalFoodLocation', experienceData, retention);
  }
  /**
   * [0838] adaptDietToSeason
   * Điều chỉnh chế độ ăn theo mùa.
   */
  public adaptDietToSeason(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adaptDietToSeason', factor, stimulus);
  }
  /**
   * [0839] regurgitateForRuminantDigestion
   * Mô phỏng nhai lại.
   */
  public regurgitateForRuminantDigestion(context?: any, intensity = 0.5): any {
    return this.applyOperation('regurgitateForRuminantDigestion', intensity, context);
  }
  /**
   * [0840] selectMineralLick
   * Tìm nơi liếm khoáng.
   */
  public selectMineralLick(candidates?: any[], criteria?: Record<string, any>): any {
    return this.applySelection('selectMineralLick', candidates, criteria);
  }
  // ==========================================================================
  // 43. Động vật sống theo đàn và hệ thống thứ bậc (841–860)
  // ==========================================================================

  /**
   * [0841] initAnimalGroup
   * Khởi tạo nhóm động vật.
   */
  public initAnimalGroup(config?: Record<string, any>): any {
    return this.applyInitialization('initAnimalGroup', config);
  }
  /**
   * [0842] recognizeGroupMember
   * Nhận diện thành viên đàn.
   */
  public recognizeGroupMember(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeGroupMember', threshold, environment);
  }
  /**
   * [0843] maintainGroupCohesion
   * Duy trì sự gắn kết đàn.
   */
  public maintainGroupCohesion(context?: any, intensity = 0.5): any {
    return this.applyOperation('maintainGroupCohesion', intensity, context);
  }
  /**
   * [0844] followGroupLeader
   * Đi theo cá thể dẫn đầu.
   */
  public followGroupLeader(context?: any, intensity = 0.5): any {
    return this.applyOperation('followGroupLeader', intensity, context);
  }
  /**
   * [0845] establishDominanceRelationship
   * Thiết lập quan hệ ưu thế.
   */
  public establishDominanceRelationship(context?: any, intensity = 0.5): any {
    return this.applyOperation('establishDominanceRelationship', intensity, context);
  }
  /**
   * [0846] displayDominanceSignal
   * Phát tín hiệu ưu thế.
   */
  public displayDominanceSignal(context?: any, intensity = 0.5): any {
    return this.applyOperation('displayDominanceSignal', intensity, context);
  }
  /**
   * [0847] displaySubmissionSignal
   * Phát tín hiệu nhường nhịn.
   */
  public displaySubmissionSignal(context?: any, intensity = 0.5): any {
    return this.applyOperation('displaySubmissionSignal', intensity, context);
  }
  /**
   * [0848] challengeGroupRank
   * Thách thức thứ hạng.
   */
  public challengeGroupRank(context?: any, intensity = 0.5): any {
    return this.applyOperation('challengeGroupRank', intensity, context);
  }
  /**
   * [0849] resolveDominanceConflict
   * Giải quyết xung đột thứ bậc.
   */
  public resolveDominanceConflict(context?: any, intensity = 0.5): any {
    return this.applyOperation('resolveDominanceConflict', intensity, context);
  }
  /**
   * [0850] protectGroupMember
   * Bảo vệ thành viên đàn.
   */
  public protectGroupMember(context?: any, intensity = 0.5): any {
    return this.applyOperation('protectGroupMember', intensity, context);
  }
  /**
   * [0851] warnGroupOfPredator
   * Cảnh báo đàn về kẻ săn mồi.
   */
  public warnGroupOfPredator(context?: any, intensity = 0.5): any {
    return this.applyOperation('warnGroupOfPredator', intensity, context);
  }
  /**
   * [0852] followGroupAlarmSignal
   * Làm theo tín hiệu báo động.
   */
  public followGroupAlarmSignal(context?: any, intensity = 0.5): any {
    return this.applyOperation('followGroupAlarmSignal', intensity, context);
  }
  /**
   * [0853] coordinateGroupForaging
   * Phối hợp kiếm ăn theo nhóm.
   */
  public coordinateGroupForaging(peerOrTarget?: any, blendWeight = 0.5): any {
    return this.applyCoordination('coordinateGroupForaging', peerOrTarget, blendWeight);
  }
  /**
   * [0854] coordinateGroupMigration
   * Phối hợp di cư.
   */
  public coordinateGroupMigration(peerOrTarget?: any, blendWeight = 0.5): any {
    return this.applyCoordination('coordinateGroupMigration', peerOrTarget, blendWeight);
  }
  /**
   * [0855] maintainGroupSpacing
   * Duy trì khoảng cách trong đàn.
   */
  public maintainGroupSpacing(context?: any, intensity = 0.5): any {
    return this.applyOperation('maintainGroupSpacing', intensity, context);
  }
  /**
   * [0856] rejoinSeparatedGroup
   * Nhập lại đàn sau khi tách.
   */
  public rejoinSeparatedGroup(context?: any, intensity = 0.5): any {
    return this.applyOperation('rejoinSeparatedGroup', intensity, context);
  }
  /**
   * [0857] recognizeGroupFamiliarity
   * Nhận biết mức độ quen thuộc giữa các cá thể.
   */
  public recognizeGroupFamiliarity(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeGroupFamiliarity', threshold, environment);
  }
  /**
   * [0858] mediateGroupAggression
   * Giảm hành vi gây hấn trong đàn.
   */
  public mediateGroupAggression(context?: any, intensity = 0.5): any {
    return this.applyOperation('mediateGroupAggression', intensity, context);
  }
  /**
   * [0859] careForGroupOffspring
   * Chăm sóc con non trong đàn.
   */
  public careForGroupOffspring(context?: any, intensity = 0.5): any {
    return this.applyOperation('careForGroupOffspring', intensity, context);
  }
  /**
   * [0860] adaptGroupMembership
   * Thích nghi với thay đổi thành viên.
   */
  public adaptGroupMembership(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adaptGroupMembership', factor, stimulus);
  }
  // ==========================================================================
  // 44. Giao tiếp âm thanh ở động vật (861–880)
  // ==========================================================================

  /**
   * [0861] initAnimalVocalization
   * Khởi tạo hành vi phát âm.
   */
  public initAnimalVocalization(config?: Record<string, any>): any {
    return this.applyInitialization('initAnimalVocalization', config);
  }
  /**
   * [0862] generateAlarmCall
   * Tạo tiếng kêu báo động.
   */
  public generateAlarmCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateAlarmCall', intensity, context);
  }
  /**
   * [0863] generateContactCall
   * Tạo tiếng kêu liên lạc.
   */
  public generateContactCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateContactCall', intensity, context);
  }
  /**
   * [0864] generateCourtshipCall
   * Tạo tiếng gọi ve vãn.
   */
  public generateCourtshipCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateCourtshipCall', intensity, context);
  }
  /**
   * [0865] generateTerritorialCall
   * Tạo tiếng gọi lãnh thổ.
   */
  public generateTerritorialCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateTerritorialCall', intensity, context);
  }
  /**
   * [0866] generateDistressCall
   * Tạo tiếng kêu đau khổ.
   */
  public generateDistressCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateDistressCall', intensity, context);
  }
  /**
   * [0867] generateFoodSolicitationCall
   * Tạo tiếng gọi xin ăn.
   */
  public generateFoodSolicitationCall(context?: any, intensity = 0.5): any {
    return this.applyOperation('generateFoodSolicitationCall', intensity, context);
  }
  /**
   * [0868] recognizeConspecificCall
   * Nhận biết tiếng gọi cùng loài.
   */
  public recognizeConspecificCall(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeConspecificCall', threshold, environment);
  }
  /**
   * [0869] localizeSoundSource
   * Xác định vị trí nguồn âm thanh.
   */
  public localizeSoundSource(context?: any, intensity = 0.5): any {
    return this.applyOperation('localizeSoundSource', intensity, context);
  }
  /**
   * [0870] estimateCallerDistance
   * Ước lượng khoảng cách cá thể phát tiếng.
   */
  public estimateCallerDistance(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimateCallerDistance', target, options);
    return {
      query: 'estimateCallerDistance',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0871] identifyCallerIndividual
   * Nhận diện cá thể phát tiếng.
   */
  public identifyCallerIndividual(environment?: any, threshold = 0.4): any {
    return this.applyDetection('identifyCallerIndividual', threshold, environment);
  }
  /**
   * [0872] respondToAlarmCall
   * Phản ứng với tiếng báo động.
   */
  public respondToAlarmCall(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToAlarmCall', factor, stimulus);
  }
  /**
   * [0873] respondToCourtshipCall
   * Phản ứng với tiếng ve vãn.
   */
  public respondToCourtshipCall(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToCourtshipCall', factor, stimulus);
  }
  /**
   * [0874] imitateAnimalVocalization
   * Bắt chước âm thanh động vật.
   */
  public imitateAnimalVocalization(context?: any, intensity = 0.5): any {
    return this.applyOperation('imitateAnimalVocalization', intensity, context);
  }
  /**
   * [0875] learnVocalizationPattern
   * Học mẫu phát âm.
   */
  public learnVocalizationPattern(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnVocalizationPattern', experienceData, retention);
  }
  /**
   * [0876] adjustVocalizationVolume
   * Điều chỉnh âm lượng phát tiếng.
   */
  public adjustVocalizationVolume(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adjustVocalizationVolume', factor, stimulus);
  }
  /**
   * [0877] adjustVocalizationRate
   * Điều chỉnh tần suất phát tiếng.
   */
  public adjustVocalizationRate(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adjustVocalizationRate', factor, stimulus);
  }
  /**
   * [0878] synchronizeGroupCalling
   * Đồng bộ tiếng gọi trong đàn.
   */
  public synchronizeGroupCalling(peerOrTarget?: any, blendWeight = 0.5): any {
    return this.applyCoordination('synchronizeGroupCalling', peerOrTarget, blendWeight);
  }
  /**
   * [0879] suppressVocalizationWhenHiding
   * Hạn chế phát tiếng khi ẩn nấp.
   */
  public suppressVocalizationWhenHiding(intensity = 0.5, cause?: string): any {
    return this.applyEmotion('suppressVocalizationWhenHiding', intensity, cause);
  }
  /**
   * [0880] adaptCallToEnvironment
   * Điều chỉnh tiếng gọi theo môi trường.
   */
  public adaptCallToEnvironment(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('adaptCallToEnvironment', factor, stimulus);
  }
  // ==========================================================================
  // 45. Khứu giác, đánh dấu và nhận diện hóa học (881–900)
  // ==========================================================================

  /**
   * [0881] detectEnvironmentalOdor
   * Phát hiện mùi môi trường.
   */
  public detectEnvironmentalOdor(environment?: any, threshold = 0.4): any {
    return this.applyDetection('detectEnvironmentalOdor', threshold, environment);
  }
  /**
   * [0882] classifyOdorSource
   * Phân loại nguồn mùi.
   */
  public classifyOdorSource(context?: any, intensity = 0.5): any {
    return this.applyOperation('classifyOdorSource', intensity, context);
  }
  /**
   * [0883] trackScentTrail
   * Lần theo dấu mùi.
   */
  public trackScentTrail(context?: any, intensity = 0.5): any {
    return this.applyOperation('trackScentTrail', intensity, context);
  }
  /**
   * [0884] estimateScentDirection
   * Ước lượng hướng mùi.
   */
  public estimateScentDirection(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimateScentDirection', target, options);
    return {
      query: 'estimateScentDirection',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0885] estimateScentFreshness
   * Ước lượng độ mới của dấu mùi.
   */
  public estimateScentFreshness(target?: any, options?: Record<string, any>): any {
    const evaluation = this.evaluateEstimate('estimateScentFreshness', target, options);
    return {
      query: 'estimateScentFreshness',
      score: evaluation.score,
      confidence: evaluation.confidence,
      value: evaluation.value,
      factors: evaluation.factors,
      basis: evaluation.basis,
      valueSource: evaluation.valueSource,
      evidenceCount: evaluation.evidenceCount,
      target: target ?? 'self',
      valid: true,
      tick: this.simulationTicks,
    };
  }
  /**
   * [0886] recognizeIndividualScent
   * Nhận diện mùi cá thể.
   */
  public recognizeIndividualScent(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeIndividualScent', threshold, environment);
  }
  /**
   * [0887] recognizeKinScent
   * Nhận biết mùi cá thể cùng huyết thống.
   */
  public recognizeKinScent(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeKinScent', threshold, environment);
  }
  /**
   * [0888] recognizePredatorScent
   * Nhận biết mùi kẻ săn mồi.
   */
  public recognizePredatorScent(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizePredatorScent', threshold, environment);
  }
  /**
   * [0889] recognizeFoodScent
   * Nhận biết mùi thức ăn.
   */
  public recognizeFoodScent(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeFoodScent', threshold, environment);
  }
  /**
   * [0890] recognizeMatingSignal
   * Nhận biết tín hiệu hóa học liên quan sinh sản.
   */
  public recognizeMatingSignal(environment?: any, threshold = 0.4): any {
    return this.applyDetection('recognizeMatingSignal', threshold, environment);
  }
  /**
   * [0891] performScentMarking
   * Đánh dấu bằng mùi.
   */
  public performScentMarking(actionPayload?: any, urgency = 1.0): any {
    return this.applyExecution('performScentMarking', actionPayload, urgency);
  }
  /**
   * [0892] refreshTerritorialScent
   * Làm mới dấu mùi lãnh thổ.
   */
  public refreshTerritorialScent(context?: any, intensity = 0.5): any {
    return this.applyOperation('refreshTerritorialScent', intensity, context);
  }
  /**
   * [0893] investigateScentMark
   * Kiểm tra dấu mùi.
   */
  public investigateScentMark(context?: any, intensity = 0.5): any {
    return this.applyOperation('investigateScentMark', intensity, context);
  }
  /**
   * [0894] avoidUnknownScent
   * Tránh mùi lạ.
   */
  public avoidUnknownScent(targetEntity?: any, urgency = 0.6): any {
    return this.applyMovement('avoidUnknownScent', targetEntity, urgency);
  }
  /**
   * [0895] followChemicalTrail
   * Đi theo dấu vết hóa học.
   */
  public followChemicalTrail(context?: any, intensity = 0.5): any {
    return this.applyOperation('followChemicalTrail', intensity, context);
  }
  /**
   * [0896] compareMultipleOdors
   * So sánh nhiều mùi.
   */
  public compareMultipleOdors(context?: any, intensity = 0.5): any {
    return this.applyOperation('compareMultipleOdors', intensity, context);
  }
  /**
   * [0897] learnFamiliarOdor
   * Ghi nhớ mùi quen thuộc.
   */
  public learnFamiliarOdor(experienceData?: any, retention = 0.9): any {
    return this.applyMemory('learnFamiliarOdor', experienceData, retention);
  }
  /**
   * [0898] respondToAlarmPheromone
   * Phản ứng với pheromone báo động.
   */
  public respondToAlarmPheromone(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToAlarmPheromone', factor, stimulus);
  }
  /**
   * [0899] respondToSocialPheromone
   * Phản ứng với pheromone xã hội.
   */
  public respondToSocialPheromone(stimulus?: any, factor = 1.0): any {
    return this.applyAdaptation('respondToSocialPheromone', factor, stimulus);
  }
  /**
   * [0900] updateOlfactoryMemory
   * Cập nhật trí nhớ khứu giác.
   */
  public updateOlfactoryMemory(deltaTime = 0.016, context?: Record<string, any>): any {
    return this.applyUpdate('updateOlfactoryMemory', deltaTime, context);
  }
}
