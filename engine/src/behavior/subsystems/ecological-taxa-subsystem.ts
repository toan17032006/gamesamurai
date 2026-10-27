/**
 * @file ecological-taxa-subsystem.ts
 * @module @aetheria/engine/behavior/subsystems/ecological-taxa-subsystem
 * @description Insects, Marine, Reptiles, Rodents & Primates Subsystem (901–1080).
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
import { BehaviorSubsystemBase, deriveActionProfile } from '../behavior-primitives.js';

export class EcologicalTaxaSubsystem extends BehaviorSubsystemBase {
  public isInitialized = false;
  public simulationTicks = 0;
  public lastUpdateTime = 0;
  public resetCounter = 0;
  public state: Record<string, unknown> = {};
  public context: Record<string, unknown> = {};
  public emotionLevels: Map<string, number> = new Map();
  public actionHistory: Array<{ action: string; payload?: unknown; urgency: number; timestamp: number }> = [];
  public knowledgeStore: Map<string, { key: string; data: unknown; retention: number }> = new Map();
  public eventLog: Array<{ event: string; intensity: number; cause?: string; timestamp: number }> = [];

  public recordEvent(event: string, intensity: number, cause?: string) {
    this.eventLog.push({ event, intensity, cause, timestamp: Date.now() });
    if (this.eventLog.length > 200) this.eventLog.shift();
  }

  // ==========================================================================
  // 46. Thị giác, thính giác và định hướng động vật (901–920)
  // ==========================================================================

  /**
   * [0901] updateAnimalVisualField
   * Cập nhật trường nhìn.
   */
  public updateAnimalVisualField(deltaTime = 0.016, context?: Record<string, unknown>) {
    return this.applyUpdate('updateAnimalVisualField', deltaTime, context);
  }
  /**
   * [0902] detectMovingObject
   * Phát hiện vật thể chuyển động.
   */
  public detectMovingObject(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectMovingObject', threshold, environment);
  }
  /**
   * [0903] trackMovingTarget
   * Theo dõi mục tiêu chuyển động.
   */
  public trackMovingTarget(context?: unknown, intensity = 0.5) {
    return this.applyOperation('trackMovingTarget', intensity, context);
  }
  /**
   * [0904] detectCamouflagedObject
   * Phát hiện vật ngụy trang.
   */
  public detectCamouflagedObject(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectCamouflagedObject', threshold, environment);
  }
  /**
   * [0905] estimateVisualDepth
   * Ước lượng chiều sâu bằng thị giác.
   */
  public estimateVisualDepth(target?: unknown, options?: Record<string, unknown>) {
    const evaluation = this.evaluateEstimate('estimateVisualDepth', target, options);
    return {
      query: 'estimateVisualDepth',
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
   * [0906] adaptVisionToLowLight
   * Thích nghi thị giác trong ánh sáng yếu.
   */
  public adaptVisionToLowLight(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptVisionToLowLight', factor, stimulus);
  }
  /**
   * [0907] detectUltrasonicSignal
   * Phát hiện tín hiệu siêu âm.
   */
  public detectUltrasonicSignal(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectUltrasonicSignal', threshold, environment);
  }
  /**
   * [0908] detectLowFrequencySound
   * Phát hiện âm thanh tần số thấp.
   */
  public detectLowFrequencySound(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectLowFrequencySound', threshold, environment);
  }
  /**
   * [0909] orientUsingSound
   * Định hướng bằng âm thanh.
   */
  public orientUsingSound(context?: unknown, intensity = 0.5) {
    return this.applyOperation('orientUsingSound', intensity, context);
  }
  /**
   * [0910] orientUsingSunPosition
   * Định hướng theo vị trí mặt trời.
   */
  public orientUsingSunPosition(context?: unknown, intensity = 0.5) {
    return this.applyOperation('orientUsingSunPosition', intensity, context);
  }
  /**
   * [0911] orientUsingStarPattern
   * Định hướng theo mẫu sao.
   */
  public orientUsingStarPattern(context?: unknown, intensity = 0.5) {
    return this.applyOperation('orientUsingStarPattern', intensity, context);
  }
  /**
   * [0912] orientUsingMagneticField
   * Định hướng theo từ trường.
   */
  public orientUsingMagneticField(context?: unknown, intensity = 0.5) {
    return this.applyOperation('orientUsingMagneticField', intensity, context);
  }
  /**
   * [0913] orientUsingLandmark
   * Định hướng theo mốc địa hình.
   */
  public orientUsingLandmark(context?: unknown, intensity = 0.5) {
    return this.applyOperation('orientUsingLandmark', intensity, context);
  }
  /**
   * [0914] estimateTravelDirection
   * Ước lượng hướng di chuyển.
   */
  public estimateTravelDirection(target?: unknown, options?: Record<string, unknown>) {
    const evaluation = this.evaluateEstimate('estimateTravelDirection', target, options);
    return {
      query: 'estimateTravelDirection',
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
   * [0915] rememberMigrationRoute
   * Ghi nhớ tuyến di cư.
   */
  public rememberMigrationRoute(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('rememberMigrationRoute', experienceData, retention);
  }
  /**
   * [0916] avoidVisualObstacle
   * Tránh chướng ngại thị giác.
   */
  public avoidVisualObstacle(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidVisualObstacle', targetEntity, urgency);
  }
  /**
   * [0917] detectWaterSurface
   * Phát hiện bề mặt nước.
   */
  public detectWaterSurface(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectWaterSurface', threshold, environment);
  }
  /**
   * [0918] detectShelterOpening
   * Phát hiện lối vào nơi trú.
   */
  public detectShelterOpening(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectShelterOpening', threshold, environment);
  }
  /**
   * [0919] updateSpatialMemory
   * Cập nhật trí nhớ không gian.
   */
  public updateSpatialMemory(deltaTime = 0.016, context?: Record<string, unknown>) {
    return this.applyUpdate('updateSpatialMemory', deltaTime, context);
  }
  /**
   * [0920] reorientAfterDisplacement
   * Định hướng lại sau khi bị dịch chuyển.
   */
  public reorientAfterDisplacement(context?: unknown, intensity = 0.5) {
    return this.applyOperation('reorientAfterDisplacement', intensity, context);
  }
  // ==========================================================================
  // 47. Sinh sản, ve vãn và chăm sóc con non ở động vật (921–940)
  // ==========================================================================

  /**
   * [0921] detectReproductiveReadiness
   * Phát hiện trạng thái sẵn sàng sinh sản.
   */
  public detectReproductiveReadiness(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectReproductiveReadiness', threshold, environment);
  }
  /**
   * [0922] detectPotentialMate
   * Phát hiện bạn tình tiềm năng.
   */
  public detectPotentialMate(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectPotentialMate', threshold, environment);
  }
  /**
   * [0923] evaluateMateCompatibility
   * Đánh giá độ phù hợp bạn tình.
   */
  public evaluateMateCompatibility(target?: unknown, options?: Record<string, unknown>) {
    const evaluation = this.evaluateEstimate('evaluateMateCompatibility', target, options);
    return {
      query: 'evaluateMateCompatibility',
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
   * [0924] performCourtshipDisplay
   * Thực hiện màn ve vãn.
   */
  public performCourtshipDisplay(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performCourtshipDisplay', actionPayload, urgency);
  }
  /**
   * [0925] respondToCourtshipDisplay
   * Phản ứng với màn ve vãn.
   */
  public respondToCourtshipDisplay(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToCourtshipDisplay', factor, stimulus);
  }
  /**
   * [0926] competeForMate
   * Cạnh tranh bạn tình.
   */
  public competeForMate(context?: unknown, intensity = 0.5) {
    return this.applyOperation('competeForMate', intensity, context);
  }
  /**
   * [0927] selectMate
   * Chọn bạn tình.
   */
  public selectMate(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectMate', candidates, criteria);
  }
  /**
   * [0928] formBreedingPair
   * Hình thành cặp sinh sản.
   */
  public formBreedingPair(context?: unknown, intensity = 0.5) {
    return this.applyOperation('formBreedingPair', intensity, context);
  }
  /**
   * [0929] defendBreedingTerritory
   * Bảo vệ lãnh thổ sinh sản.
   */
  public defendBreedingTerritory(context?: unknown, intensity = 0.5) {
    return this.applyOperation('defendBreedingTerritory', intensity, context);
  }
  /**
   * [0930] selectNestingSite
   * Chọn nơi làm tổ.
   */
  public selectNestingSite(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectNestingSite', candidates, criteria);
  }
  /**
   * [0931] constructNest
   * Xây tổ.
   */
  public constructNest(context?: unknown, intensity = 0.5) {
    return this.applyOperation('constructNest', intensity, context);
  }
  /**
   * [0932] prepareBirthSite
   * Chuẩn bị nơi sinh con.
   */
  public prepareBirthSite(context?: unknown, intensity = 0.5) {
    return this.applyOperation('prepareBirthSite', intensity, context);
  }
  /**
   * [0933] recognizeOwnOffspring
   * Nhận diện con non của mình.
   */
  public recognizeOwnOffspring(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('recognizeOwnOffspring', threshold, environment);
  }
  /**
   * [0934] bondWithOffspring
   * Hình thành gắn bó với con non.
   */
  public bondWithOffspring(context?: unknown, intensity = 0.5) {
    return this.applyOperation('bondWithOffspring', intensity, context);
  }
  /**
   * [0935] feedOffspring
   * Cho con non ăn.
   */
  public feedOffspring(context?: unknown, intensity = 0.5) {
    return this.applyOperation('feedOffspring', intensity, context);
  }
  /**
   * [0936] groomOffspring
   * Làm sạch và chăm sóc con non.
   */
  public groomOffspring(context?: unknown, intensity = 0.5) {
    return this.applyOperation('groomOffspring', intensity, context);
  }
  /**
   * [0937] protectOffspringFromThreat
   * Bảo vệ con non khỏi nguy hiểm.
   */
  public protectOffspringFromThreat(context?: unknown, intensity = 0.5) {
    return this.applyOperation('protectOffspringFromThreat', intensity, context);
  }
  /**
   * [0938] retrieveSeparatedOffspring
   * Tìm và đưa con non bị tách về.
   */
  public retrieveSeparatedOffspring(context?: unknown, intensity = 0.5) {
    return this.applyOperation('retrieveSeparatedOffspring', intensity, context);
  }
  /**
   * [0939] teachOffspringSurvivalSkill
   * Dạy con non kỹ năng sinh tồn.
   */
  public teachOffspringSurvivalSkill(context?: unknown, intensity = 0.5) {
    return this.applyOperation('teachOffspringSurvivalSkill', intensity, context);
  }
  /**
   * [0940] weanOffspring
   * Cai sữa hoặc chấm dứt phụ thuộc dinh dưỡng.
   */
  public weanOffspring(context?: unknown, intensity = 0.5) {
    return this.applyOperation('weanOffspring', intensity, context);
  }
  // ==========================================================================
  // 48. Côn trùng và hành vi tập thể (941–960)
  // ==========================================================================

  /**
   * [0941] initInsectAgent
   * Khởi tạo cá thể côn trùng.
   */
  public initInsectAgent(config?: Record<string, unknown>) {
    return this.applyInitialization('initInsectAgent', config);
  }
  /**
   * [0942] detectInsectFoodSource
   * Phát hiện nguồn thức ăn.
   */
  public detectInsectFoodSource(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectInsectFoodSource', threshold, environment);
  }
  /**
   * [0943] followPheromoneTrail
   * Đi theo đường pheromone.
   */
  public followPheromoneTrail(context?: unknown, intensity = 0.5) {
    return this.applyOperation('followPheromoneTrail', intensity, context);
  }
  /**
   * [0944] depositPheromoneTrail
   * Để lại dấu pheromone.
   */
  public depositPheromoneTrail(context?: unknown, intensity = 0.5) {
    return this.applyOperation('depositPheromoneTrail', intensity, context);
  }
  /**
   * [0945] reinforcePheromonePath
   * Củng cố đường pheromone.
   */
  public reinforcePheromonePath(context?: unknown, intensity = 0.5) {
    return this.applyOperation('reinforcePheromonePath', intensity, context);
  }
  /**
   * [0946] selectAntForagingRoute
   * Chọn đường kiếm ăn của kiến.
   */
  public selectAntForagingRoute(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectAntForagingRoute', candidates, criteria);
  }
  /**
   * [0947] returnToColony
   * Trở về đàn.
   */
  public returnToColony(context?: unknown, intensity = 0.5) {
    return this.applyOperation('returnToColony', intensity, context);
  }
  /**
   * [0948] exchangeFoodWithColony
   * Trao đổi thức ăn trong đàn.
   */
  public exchangeFoodWithColony(context?: unknown, intensity = 0.5) {
    return this.applyOperation('exchangeFoodWithColony', intensity, context);
  }
  /**
   * [0949] performNestMaintenance
   * Bảo trì tổ.
   */
  public performNestMaintenance(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performNestMaintenance', actionPayload, urgency);
  }
  /**
   * [0950] defendInsectColony
   * Bảo vệ đàn côn trùng.
   */
  public defendInsectColony(context?: unknown, intensity = 0.5) {
    return this.applyOperation('defendInsectColony', intensity, context);
  }
  /**
   * [0951] coordinateWorkerTask
   * Phối hợp nhiệm vụ cá thể thợ.
   */
  public coordinateWorkerTask(peerOrTarget?: unknown, blendWeight = 0.5) {
    return this.applyCoordination('coordinateWorkerTask', peerOrTarget, blendWeight);
  }
  /**
   * [0952] respondToColonyAlarm
   * Phản ứng với báo động của đàn.
   */
  public respondToColonyAlarm(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToColonyAlarm', factor, stimulus);
  }
  /**
   * [0953] identifyColonyMember
   * Nhận diện thành viên đàn.
   */
  public identifyColonyMember(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('identifyColonyMember', threshold, environment);
  }
  /**
   * [0954] removeNestWaste
   * Loại bỏ chất thải khỏi tổ.
   */
  public removeNestWaste(context?: unknown, intensity = 0.5) {
    return this.applyOperation('removeNestWaste', intensity, context);
  }
  /**
   * [0955] regulateNestTemperature
   * Điều hòa nhiệt độ tổ.
   */
  public regulateNestTemperature(context?: unknown, intensity = 0.5) {
    return this.applyOperation('regulateNestTemperature', intensity, context);
  }
  /**
   * [0956] selectNewNestSite
   * Chọn địa điểm làm tổ mới.
   */
  public selectNewNestSite(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectNewNestSite', candidates, criteria);
  }
  /**
   * [0957] initiateSwarmMovement
   * Khởi tạo di chuyển theo bầy.
   */
  public initiateSwarmMovement(config?: Record<string, unknown>) {
    const result = this.applyInitialization('initiateSwarmMovement', config);
    // Thời lượng di chuyển / động lực / hao năng lượng suy ra từ cấu hình + trạng thái thật.
    return { ...result, ...deriveActionProfile([config, this.state], result) };
  }
  /**
   * [0958] followSwarmDirection
   * Đi theo hướng bầy.
   */
  public followSwarmDirection(context?: unknown, intensity = 0.5) {
    return this.applyOperation('followSwarmDirection', intensity, context);
  }
  /**
   * [0959] maintainSwarmDensity
   * Duy trì mật độ bầy.
   */
  public maintainSwarmDensity(context?: unknown, intensity = 0.5) {
    return this.applyOperation('maintainSwarmDensity', intensity, context);
  }
  /**
   * [0960] adaptCollectiveForaging
   * Điều chỉnh hành vi kiếm ăn tập thể.
   */
  public adaptCollectiveForaging(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptCollectiveForaging', factor, stimulus);
  }
  // ==========================================================================
  // 49. Động vật sống dưới nước (961–980)
  // ==========================================================================

  /**
   * [0961] initAquaticAnimalBehavior
   * Khởi tạo hành vi động vật thủy sinh.
   */
  public initAquaticAnimalBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initAquaticAnimalBehavior', config);
  }
  /**
   * [0962] detectWaterCurrent
   * Phát hiện dòng chảy.
   */
  public detectWaterCurrent(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectWaterCurrent', threshold, environment);
  }
  /**
   * [0963] adjustSwimmingDirection
   * Điều chỉnh hướng bơi.
   */
  public adjustSwimmingDirection(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adjustSwimmingDirection', factor, stimulus);
  }
  /**
   * [0964] adjustSwimmingSpeed
   * Điều chỉnh tốc độ bơi.
   */
  public adjustSwimmingSpeed(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adjustSwimmingSpeed', factor, stimulus);
  }
  /**
   * [0965] maintainBuoyancy
   * Duy trì lực nổi.
   */
  public maintainBuoyancy(context?: unknown, intensity = 0.5) {
    return this.applyOperation('maintainBuoyancy', intensity, context);
  }
  /**
   * [0966] controlDivingDepth
   * Điều khiển độ sâu lặn.
   */
  public controlDivingDepth(context?: unknown, intensity = 0.5) {
    return this.applyOperation('controlDivingDepth', intensity, context);
  }
  /**
   * [0967] surfaceForAir
   * Nổi lên để lấy không khí.
   */
  public surfaceForAir(context?: unknown, intensity = 0.5) {
    return this.applyOperation('surfaceForAir', intensity, context);
  }
  /**
   * [0968] avoidAquaticPredator
   * Tránh kẻ săn mồi dưới nước.
   */
  public avoidAquaticPredator(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidAquaticPredator', targetEntity, urgency);
  }
  /**
   * [0969] detectAquaticPrey
   * Phát hiện con mồi dưới nước.
   */
  public detectAquaticPrey(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectAquaticPrey', threshold, environment);
  }
  /**
   * [0970] schoolWithOtherFish
   * Bơi theo đàn cá.
   */
  public schoolWithOtherFish(context?: unknown, intensity = 0.5) {
    return this.applyOperation('schoolWithOtherFish', intensity, context);
  }
  /**
   * [0971] maintainSchoolSpacing
   * Duy trì khoảng cách trong đàn cá.
   */
  public maintainSchoolSpacing(context?: unknown, intensity = 0.5) {
    return this.applyOperation('maintainSchoolSpacing', intensity, context);
  }
  /**
   * [0972] respondToWaterPressure
   * Phản ứng với áp suất nước.
   */
  public respondToWaterPressure(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToWaterPressure', factor, stimulus);
  }
  /**
   * [0973] respondToWaterTemperature
   * Phản ứng với nhiệt độ nước.
   */
  public respondToWaterTemperature(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToWaterTemperature', factor, stimulus);
  }
  /**
   * [0974] detectWaterPollutionCue
   * Phát hiện dấu hiệu ô nhiễm nước.
   */
  public detectWaterPollutionCue(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectWaterPollutionCue', threshold, environment);
  }
  /**
   * [0975] seekAquaticShelter
   * Tìm nơi trú dưới nước.
   */
  public seekAquaticShelter(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('seekAquaticShelter', targetEntity, urgency);
  }
  /**
   * [0976] selectAquaticFeedingGround
   * Chọn nơi kiếm ăn dưới nước.
   */
  public selectAquaticFeedingGround(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectAquaticFeedingGround', candidates, criteria);
  }
  /**
   * [0977] navigateCoralReef
   * Di chuyển trong rạn san hô.
   */
  public navigateCoralReef(context?: unknown, intensity = 0.5) {
    return this.applyOperation('navigateCoralReef', intensity, context);
  }
  /**
   * [0978] migrateAlongWaterway
   * Di cư theo tuyến thủy vực.
   */
  public migrateAlongWaterway(context?: unknown, intensity = 0.5) {
    return this.applyOperation('migrateAlongWaterway', intensity, context);
  }
  /**
   * [0979] returnToSpawningGround
   * Trở lại nơi sinh sản.
   */
  public returnToSpawningGround(context?: unknown, intensity = 0.5) {
    return this.applyOperation('returnToSpawningGround', intensity, context);
  }
  /**
   * [0980] adaptToAquaticOxygenLevel
   * Thích nghi với mức oxy trong nước.
   */
  public adaptToAquaticOxygenLevel(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptToAquaticOxygenLevel', factor, stimulus);
  }
  // ==========================================================================
  // 50. Động vật bò sát và lưỡng cư (981–1000)
  // ==========================================================================

  /**
   * [0981] initReptileBehavior
   * Khởi tạo hành vi bò sát.
   */
  public initReptileBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initReptileBehavior', config);
  }
  /**
   * [0982] initAmphibianBehavior
   * Khởi tạo hành vi lưỡng cư.
   */
  public initAmphibianBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initAmphibianBehavior', config);
  }
  /**
   * [0983] baskInSunlight
   * Phơi nắng.
   */
  public baskInSunlight(context?: unknown, intensity = 0.5) {
    return this.applyOperation('baskInSunlight', intensity, context);
  }
  /**
   * [0984] seekThermalGradient
   * Tìm vùng có nhiệt độ phù hợp.
   */
  public seekThermalGradient(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('seekThermalGradient', targetEntity, urgency);
  }
  /**
   * [0985] moveBetweenWarmAndCoolArea
   * Di chuyển giữa vùng ấm và mát.
   */
  public moveBetweenWarmAndCoolArea(context?: unknown, intensity = 0.5) {
    return this.applyOperation('moveBetweenWarmAndCoolArea', intensity, context);
  }
  /**
   * [0986] detectGroundVibration
   * Phát hiện rung động mặt đất.
   */
  public detectGroundVibration(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectGroundVibration', threshold, environment);
  }
  /**
   * [0987] detectNearbyMovement
   * Phát hiện chuyển động gần đó.
   */
  public detectNearbyMovement(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectNearbyMovement', threshold, environment);
  }
  /**
   * [0988] performReptileAmbush
   * Mô phỏng phục kích của bò sát.
   */
  public performReptileAmbush(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performReptileAmbush', actionPayload, urgency);
  }
  /**
   * [0989] performTongueFlicking
   * Mô phỏng thè lưỡi thu nhận tín hiệu hóa học.
   */
  public performTongueFlicking(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performTongueFlicking', actionPayload, urgency);
  }
  /**
   * [0990] hideUnderCover
   * Ẩn dưới vật che phủ.
   */
  public hideUnderCover(context?: unknown, intensity = 0.5) {
    return this.applyOperation('hideUnderCover', intensity, context);
  }
  /**
   * [0991] burrowIntoSubstrate
   * Đào hoặc chui vào nền đất.
   */
  public burrowIntoSubstrate(context?: unknown, intensity = 0.5) {
    return this.applyOperation('burrowIntoSubstrate', intensity, context);
  }
  /**
   * [0992] avoidDryingEnvironment
   * Tránh môi trường gây mất nước.
   */
  public avoidDryingEnvironment(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidDryingEnvironment', targetEntity, urgency);
  }
  /**
   * [0993] seekMoistMicrohabitat
   * Tìm vi môi trường ẩm.
   */
  public seekMoistMicrohabitat(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('seekMoistMicrohabitat', targetEntity, urgency);
  }
  /**
   * [0994] respondToSeasonalDormancy
   * Phản ứng với giai đoạn ngủ nghỉ theo mùa.
   */
  public respondToSeasonalDormancy(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToSeasonalDormancy', factor, stimulus);
  }
  /**
   * [0995] selectEggLayingSite
   * Chọn nơi đẻ trứng.
   */
  public selectEggLayingSite(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectEggLayingSite', candidates, criteria);
  }
  /**
   * [0996] buryReptileEggs
   * Vùi trứng.
   */
  public buryReptileEggs(context?: unknown, intensity = 0.5) {
    return this.applyOperation('buryReptileEggs', intensity, context);
  }
  /**
   * [0997] migrateToBreedingPond
   * Di chuyển đến ao sinh sản.
   */
  public migrateToBreedingPond(context?: unknown, intensity = 0.5) {
    return this.applyOperation('migrateToBreedingPond', intensity, context);
  }
  /**
   * [0998] respondToAmphibianCall
   * Phản ứng với tiếng gọi của lưỡng cư.
   */
  public respondToAmphibianCall(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToAmphibianCall', factor, stimulus);
  }
  /**
   * [0999] avoidExtremeTemperature
   * Tránh nhiệt độ cực đoan.
   */
  public avoidExtremeTemperature(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidExtremeTemperature', targetEntity, urgency);
  }
  /**
   * [1000] adaptToHabitatMoisture
   * Thích nghi với độ ẩm môi trường.
   */
  public adaptToHabitatMoisture(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptToHabitatMoisture', factor, stimulus);
  }
  // ==========================================================================
  // 51. Động vật gặm nhấm và hành vi khám phá (1001–1020)
  // ==========================================================================

  /**
   * [1001] initRodentBehavior
   * Khởi tạo hành vi loài gặm nhấm.
   */
  public initRodentBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initRodentBehavior', config);
  }
  /**
   * [1002] exploreNovelObject
   * Khám phá vật thể mới.
   */
  public exploreNovelObject(context?: unknown, intensity = 0.5) {
    return this.applyOperation('exploreNovelObject', intensity, context);
  }
  /**
   * [1003] performRiskAssessmentPause
   * Tạm dừng để đánh giá rủi ro.
   */
  public performRiskAssessmentPause(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performRiskAssessmentPause', actionPayload, urgency);
  }
  /**
   * [1004] sniffNovelObject
   * Ngửi vật thể mới.
   */
  public sniffNovelObject(context?: unknown, intensity = 0.5) {
    return this.applyOperation('sniffNovelObject', intensity, context);
  }
  /**
   * [1005] approachNovelObjectCautiously
   * Thận trọng tiến đến vật thể mới.
   */
  public approachNovelObjectCautiously(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('approachNovelObjectCautiously', targetEntity, urgency);
  }
  /**
   * [1006] retreatFromNovelObject
   * Rút lui khỏi vật thể mới.
   */
  public retreatFromNovelObject(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('retreatFromNovelObject', targetEntity, urgency);
  }
  /**
   * [1007] gnawHardMaterial
   * Gặm vật liệu cứng.
   */
  public gnawHardMaterial(context?: unknown, intensity = 0.5) {
    return this.applyOperation('gnawHardMaterial', intensity, context);
  }
  /**
   * [1008] collectNestingMaterial
   * Thu thập vật liệu làm tổ.
   */
  public collectNestingMaterial(context?: unknown, intensity = 0.5) {
    return this.applyOperation('collectNestingMaterial', intensity, context);
  }
  /**
   * [1009] constructBurrow
   * Đào hang.
   */
  public constructBurrow(context?: unknown, intensity = 0.5) {
    return this.applyOperation('constructBurrow', intensity, context);
  }
  /**
   * [1010] navigateBurrowNetwork
   * Di chuyển trong hệ thống hang.
   */
  public navigateBurrowNetwork(context?: unknown, intensity = 0.5) {
    return this.applyOperation('navigateBurrowNetwork', intensity, context);
  }
  /**
   * [1011] storeFoodInCache
   * Tích trữ thức ăn.
   */
  public storeFoodInCache(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('storeFoodInCache', experienceData, retention);
  }
  /**
   * [1012] retrieveCachedFood
   * Lấy thức ăn đã cất.
   */
  public retrieveCachedFood(context?: unknown, intensity = 0.5) {
    return this.applyOperation('retrieveCachedFood', intensity, context);
  }
  /**
   * [1013] detectRodentAlarmSignal
   * Nhận biết tín hiệu báo động.
   */
  public detectRodentAlarmSignal(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectRodentAlarmSignal', threshold, environment);
  }
  /**
   * [1014] hideInBurrow
   * Ẩn trong hang.
   */
  public hideInBurrow(context?: unknown, intensity = 0.5) {
    return this.applyOperation('hideInBurrow', intensity, context);
  }
  /**
   * [1015] learnMazeRoute
   * Học đường đi trong mê cung.
   */
  public learnMazeRoute(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('learnMazeRoute', experienceData, retention);
  }
  /**
   * [1016] rememberSafeLocation
   * Ghi nhớ nơi an toàn.
   */
  public rememberSafeLocation(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('rememberSafeLocation', experienceData, retention);
  }
  /**
   * [1017] avoidPreviouslyDangerousArea
   * Tránh khu vực từng nguy hiểm.
   */
  public avoidPreviouslyDangerousArea(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidPreviouslyDangerousArea', targetEntity, urgency);
  }
  /**
   * [1018] socialGroomingRodent
   * Chải chuốt xã hội giữa các cá thể.
   */
  public socialGroomingRodent(context?: unknown, intensity = 0.5) {
    return this.applyOperation('socialGroomingRodent', intensity, context);
  }
  /**
   * [1019] playWithConspecific
   * Chơi với cá thể cùng loài.
   */
  public playWithConspecific(context?: unknown, intensity = 0.5) {
    return this.applyOperation('playWithConspecific', intensity, context);
  }
  /**
   * [1020] adaptExplorationToHunger
   * Điều chỉnh khám phá theo mức đói.
   */
  public adaptExplorationToHunger(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptExplorationToHunger', factor, stimulus);
  }
  // ==========================================================================
  // 52. Động vật móng guốc và phản ứng bầy đàn (1021–1040)
  // ==========================================================================

  /**
   * [1021] initUngulateBehavior
   * Khởi tạo hành vi động vật móng guốc.
   */
  public initUngulateBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initUngulateBehavior', config);
  }
  /**
   * [1022] detectHerdLeader
   * Nhận biết cá thể dẫn đầu đàn.
   */
  public detectHerdLeader(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectHerdLeader', threshold, environment);
  }
  /**
   * [1023] followHerdLeader
   * Đi theo cá thể dẫn đầu.
   */
  public followHerdLeader(context?: unknown, intensity = 0.5) {
    return this.applyOperation('followHerdLeader', intensity, context);
  }
  /**
   * [1024] scanHorizonForPredator
   * Quan sát đường chân trời để tìm kẻ săn mồi.
   */
  public scanHorizonForPredator(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('scanHorizonForPredator', threshold, environment);
  }
  /**
   * [1025] raiseHeadDuringGrazing
   * Ngẩng đầu khi đang gặm cỏ.
   */
  public raiseHeadDuringGrazing(context?: unknown, intensity = 0.5) {
    return this.applyOperation('raiseHeadDuringGrazing', intensity, context);
  }
  /**
   * [1026] triggerHerdAlarm
   * Kích hoạt cảnh báo trong đàn.
   */
  public triggerHerdAlarm(intensity = 0.5, cause?: string) {
    return this.applyEmotion('triggerHerdAlarm', intensity, cause);
  }
  /**
   * [1027] initiateHerdFlight
   * Khởi động phản ứng bỏ chạy của đàn.
   */
  public initiateHerdFlight(config?: Record<string, unknown>) {
    const result = this.applyInitialization('initiateHerdFlight', config);
    // Thời lượng bỏ chạy / mức độ hoảng loạn / hao năng lượng suy ra từ dữ liệu thật.
    return { ...result, ...deriveActionProfile([config, this.state], result) };
  }
  /**
   * [1028] synchronizeHerdRunning
   * Đồng bộ tốc độ chạy của đàn.
   */
  public synchronizeHerdRunning(peerOrTarget?: unknown, blendWeight = 0.5) {
    return this.applyCoordination('synchronizeHerdRunning', peerOrTarget, blendWeight);
  }
  /**
   * [1029] avoidHerdCollision
   * Tránh va chạm trong đàn.
   */
  public avoidHerdCollision(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidHerdCollision', targetEntity, urgency);
  }
  /**
   * [1030] maintainHerdFormation
   * Duy trì đội hình đàn.
   */
  public maintainHerdFormation(context?: unknown, intensity = 0.5) {
    return this.applyOperation('maintainHerdFormation', intensity, context);
  }
  /**
   * [1031] selectWateringLocation
   * Chọn nơi uống nước.
   */
  public selectWateringLocation(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectWateringLocation', candidates, criteria);
  }
  /**
   * [1032] approachWateringLocation
   * Tiến đến nơi uống nước.
   */
  public approachWateringLocation(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('approachWateringLocation', targetEntity, urgency);
  }
  /**
   * [1033] waitForHerdAccess
   * Chờ đến lượt tiếp cận nguồn nước.
   */
  public waitForHerdAccess(context?: unknown, intensity = 0.5) {
    return this.applyOperation('waitForHerdAccess', intensity, context);
  }
  /**
   * [1034] defendCalf
   * Bảo vệ con non.
   */
  public defendCalf(context?: unknown, intensity = 0.5) {
    return this.applyOperation('defendCalf', intensity, context);
  }
  /**
   * [1035] recognizeHerdOffspring
   * Nhận diện con non trong đàn.
   */
  public recognizeHerdOffspring(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('recognizeHerdOffspring', threshold, environment);
  }
  /**
   * [1036] reuniteWithHerd
   * Đoàn tụ với đàn.
   */
  public reuniteWithHerd(context?: unknown, intensity = 0.5) {
    return this.applyOperation('reuniteWithHerd', intensity, context);
  }
  /**
   * [1037] respondToSeasonalMigrationCue
   * Phản ứng với tín hiệu di cư theo mùa.
   */
  public respondToSeasonalMigrationCue(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToSeasonalMigrationCue', factor, stimulus);
  }
  /**
   * [1038] crossOpenTerrainCautiously
   * Thận trọng vượt địa hình trống trải.
   */
  public crossOpenTerrainCautiously(context?: unknown, intensity = 0.5) {
    return this.applyOperation('crossOpenTerrainCautiously', intensity, context);
  }
  /**
   * [1039] selectRestingHerdLocation
   * Chọn nơi nghỉ cho đàn.
   */
  public selectRestingHerdLocation(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectRestingHerdLocation', candidates, criteria);
  }
  /**
   * [1040] adaptHerdRouteToPredationRisk
   * Điều chỉnh tuyến di chuyển theo rủi ro săn mồi.
   */
  public adaptHerdRouteToPredationRisk(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptHerdRouteToPredationRisk', factor, stimulus);
  }
  // ==========================================================================
  // 53. Linh trưởng và hành vi nhận thức xã hội (1041–1060)
  // ==========================================================================

  /**
   * [1041] initPrimateBehavior
   * Khởi tạo hành vi linh trưởng.
   */
  public initPrimateBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initPrimateBehavior', config);
  }
  /**
   * [1042] recognizePrimateIndividual
   * Nhận diện cá thể linh trưởng.
   */
  public recognizePrimateIndividual(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('recognizePrimateIndividual', threshold, environment);
  }
  /**
   * [1043] rememberSocialRelationship
   * Ghi nhớ quan hệ xã hội.
   */
  public rememberSocialRelationship(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('rememberSocialRelationship', experienceData, retention);
  }
  /**
   * [1044] performSocialGrooming
   * Chải chuốt xã hội.
   */
  public performSocialGrooming(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performSocialGrooming', actionPayload, urgency);
  }
  /**
   * [1045] solicitSocialGrooming
   * Chủ động đề nghị được chải chuốt.
   */
  public solicitSocialGrooming(context?: unknown, intensity = 0.5) {
    return this.applyOperation('solicitSocialGrooming', intensity, context);
  }
  /**
   * [1046] formPrimateAlliance
   * Hình thành liên minh.
   */
  public formPrimateAlliance(context?: unknown, intensity = 0.5) {
    return this.applyOperation('formPrimateAlliance', intensity, context);
  }
  /**
   * [1047] maintainPrimateAlliance
   * Duy trì liên minh.
   */
  public maintainPrimateAlliance(context?: unknown, intensity = 0.5) {
    return this.applyOperation('maintainPrimateAlliance', intensity, context);
  }
  /**
   * [1048] detectSocialRankChange
   * Phát hiện thay đổi thứ hạng.
   */
  public detectSocialRankChange(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectSocialRankChange', threshold, environment);
  }
  /**
   * [1049] respondToDominanceDisplay
   * Phản ứng với biểu hiện ưu thế.
   */
  public respondToDominanceDisplay(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToDominanceDisplay', factor, stimulus);
  }
  /**
   * [1050] shareForagingKnowledge
   * Chia sẻ kiến thức kiếm ăn.
   */
  public shareForagingKnowledge(context?: unknown, intensity = 0.5) {
    return this.applyOperation('shareForagingKnowledge', intensity, context);
  }
  /**
   * [1051] learnToolUseByObservation
   * Học sử dụng công cụ qua quan sát.
   */
  public learnToolUseByObservation(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('learnToolUseByObservation', experienceData, retention);
  }
  /**
   * [1052] manipulateSimpleTool
   * Thao tác công cụ đơn giản.
   */
  public manipulateSimpleTool(context?: unknown, intensity = 0.5) {
    return this.applyOperation('manipulateSimpleTool', intensity, context);
  }
  /**
   * [1053] solvePrimateForagingPuzzle
   * Giải quyết bài toán kiếm ăn.
   */
  public solvePrimateForagingPuzzle(context?: unknown, intensity = 0.5) {
    return this.applyOperation('solvePrimateForagingPuzzle', intensity, context);
  }
  /**
   * [1054] imitateConspecificAction
   * Bắt chước hành động cá thể cùng loài.
   */
  public imitateConspecificAction(context?: unknown, intensity = 0.5) {
    return this.applyOperation('imitateConspecificAction', intensity, context);
  }
  /**
   * [1055] recognizeSocialDeceptionCue
   * Nhận biết dấu hiệu đánh lừa xã hội.
   */
  public recognizeSocialDeceptionCue(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('recognizeSocialDeceptionCue', threshold, environment);
  }
  /**
   * [1056] respondToInfantDistress
   * Phản ứng với tiếng kêu đau khổ của con non.
   */
  public respondToInfantDistress(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('respondToInfantDistress', factor, stimulus);
  }
  /**
   * [1057] mediatePrimateConflict
   * Hòa giải xung đột linh trưởng.
   */
  public mediatePrimateConflict(context?: unknown, intensity = 0.5) {
    return this.applyOperation('mediatePrimateConflict', intensity, context);
  }
  /**
   * [1058] reconcileAfterConflict
   * Hòa giải sau xung đột.
   */
  public reconcileAfterConflict(context?: unknown, intensity = 0.5) {
    return this.applyOperation('reconcileAfterConflict', intensity, context);
  }
  /**
   * [1059] learnGroupTradition
   * Học tập quán của nhóm.
   */
  public learnGroupTradition(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('learnGroupTradition', experienceData, retention);
  }
  /**
   * [1060] adaptSocialStrategy
   * Điều chỉnh chiến lược xã hội.
   */
  public adaptSocialStrategy(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptSocialStrategy', factor, stimulus);
  }
  // ==========================================================================
  // 54. Côn trùng thụ phấn và hành vi tìm hoa (1061–1080)
  // ==========================================================================

  /**
   * [1061] initPollinatorBehavior
   * Khởi tạo hành vi côn trùng thụ phấn.
   */
  public initPollinatorBehavior(config?: Record<string, unknown>) {
    return this.applyInitialization('initPollinatorBehavior', config);
  }
  /**
   * [1062] detectFlowerColor
   * Phát hiện màu sắc hoa.
   */
  public detectFlowerColor(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectFlowerColor', threshold, environment);
  }
  /**
   * [1063] detectFloralOdor
   * Phát hiện mùi hoa.
   */
  public detectFloralOdor(environment?: unknown, threshold = 0.4) {
    return this.applyDetection('detectFloralOdor', threshold, environment);
  }
  /**
   * [1064] estimateNectarAvailability
   * Ước lượng lượng mật hoa.
   */
  public estimateNectarAvailability(target?: unknown, options?: Record<string, unknown>) {
    const evaluation = this.evaluateEstimate('estimateNectarAvailability', target, options);
    return {
      query: 'estimateNectarAvailability',
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
   * [1065] estimatePollenAvailability
   * Ước lượng lượng phấn hoa.
   */
  public estimatePollenAvailability(target?: unknown, options?: Record<string, unknown>) {
    const evaluation = this.evaluateEstimate('estimatePollenAvailability', target, options);
    return {
      query: 'estimatePollenAvailability',
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
   * [1066] selectFlowerTarget
   * Chọn hoa mục tiêu.
   */
  public selectFlowerTarget(candidates?: unknown[], criteria?: Record<string, unknown>) {
    return this.applySelection('selectFlowerTarget', candidates, criteria);
  }
  /**
   * [1067] approachFlower
   * Tiếp cận hoa.
   */
  public approachFlower(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('approachFlower', targetEntity, urgency);
  }
  /**
   * [1068] landOnFlower
   * Đậu lên hoa.
   */
  public landOnFlower(context?: unknown, intensity = 0.5) {
    return this.applyOperation('landOnFlower', intensity, context);
  }
  /**
   * [1069] collectNectar
   * Thu thập mật hoa.
   */
  public collectNectar(context?: unknown, intensity = 0.5) {
    return this.applyOperation('collectNectar', intensity, context);
  }
  /**
   * [1070] collectPollen
   * Thu thập phấn hoa.
   */
  public collectPollen(context?: unknown, intensity = 0.5) {
    return this.applyOperation('collectPollen', intensity, context);
  }
  /**
   * [1071] transferPollenBetweenFlowers
   * Chuyển phấn giữa các hoa.
   */
  public transferPollenBetweenFlowers(context?: unknown, intensity = 0.5) {
    return this.applyOperation('transferPollenBetweenFlowers', intensity, context);
  }
  /**
   * [1072] avoidPreviouslyDepletedFlower
   * Tránh hoa đã cạn tài nguyên.
   */
  public avoidPreviouslyDepletedFlower(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidPreviouslyDepletedFlower', targetEntity, urgency);
  }
  /**
   * [1073] learnFlowerRewardPattern
   * Học mẫu phần thưởng từ hoa.
   */
  public learnFlowerRewardPattern(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('learnFlowerRewardPattern', experienceData, retention);
  }
  /**
   * [1074] rememberFlowerLocation
   * Ghi nhớ vị trí hoa.
   */
  public rememberFlowerLocation(experienceData?: unknown, retention = 0.9) {
    return this.applyMemory('rememberFlowerLocation', experienceData, retention);
  }
  /**
   * [1075] communicateFlowerLocation
   * Truyền thông tin vị trí hoa.
   */
  public communicateFlowerLocation(message?: unknown, intensity = 0.7) {
    return this.applyExpression('communicateFlowerLocation', message, intensity);
  }
  /**
   * [1076] returnToHiveWithNectar
   * Trở về tổ cùng mật hoa.
   */
  public returnToHiveWithNectar(context?: unknown, intensity = 0.5) {
    return this.applyOperation('returnToHiveWithNectar', intensity, context);
  }
  /**
   * [1077] performWaggleDance
   * Mô phỏng điệu nhảy chỉ hướng của ong.
   */
  public performWaggleDance(actionPayload?: unknown, urgency = 1.0) {
    return this.applyExecution('performWaggleDance', actionPayload, urgency);
  }
  /**
   * [1078] adaptForagingToWeather
   * Điều chỉnh kiếm ăn theo thời tiết.
   */
  public adaptForagingToWeather(stimulus?: unknown, factor = 1.0) {
    return this.applyAdaptation('adaptForagingToWeather', factor, stimulus);
  }
  /**
   * [1079] avoidPollinatorCompetition
   * Tránh cạnh tranh với loài thụ phấn khác.
   */
  public avoidPollinatorCompetition(targetEntity?: unknown, urgency = 0.6) {
    return this.applyMovement('avoidPollinatorCompetition', targetEntity, urgency);
  }
  /**
   * [1080] optimizePollinationRoute
   * Tối ưu tuyến thụ phấn.
   */
  public optimizePollinationRoute(context?: unknown, intensity = 0.5) {
    return this.applyOperation('optimizePollinationRoute', intensity, context);
  }
}
