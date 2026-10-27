// engine/src/combiner/combine.ts — Hệ thống 445+ hàm ghép hoạt ảnh, vũ khí, hiệu ứng, vật lý & môi trường
import * as THREE from 'three';
import type { BlendMode, Transform } from '../types/transform.types';
import type { CollisionShape } from '../types/physics.types';
import { StateBlender, BlenderLayer } from './state-blender';
import { SocketBinder, SocketHandle } from './socket-binder';
import { SpatialGrid } from '../renderer/culling-optimizer';
import { createShaderMaterial } from '../effects/shader-compiler';
import { zoomAsset } from '../transformer/scaler';
import { mergeStatic } from '../transformer/geometry-optimizer';
import { extractGeometry } from '../asset-parser/geometry-extractor';
import { parseTextures } from '../asset-parser/texture-parser';
import { bakeClips } from '../asset-parser/animation-baker';
import {
  buildCombinerPhysicsProxy,
  collectCombinerVertices,
  combinerQueryAABB,
  combinerQuerySphere,
  combinerRaycast,
  computeCombinerBounds,
  collisionShapeFromBounds,
  makeCombineDiagnostics,
  snapshotToAABB,
  sweepColliderAgainstAABB,
  validateCombinerCollisionShape,
} from './spatial-mapper';
import type {
  CombineOptions,
  CombineResult,
  CombinatorSpec,
  CombinerGroup,
  CombinerMetadata,
  CombinerRayInput,
  SpatialBoundsKind,
  SpatialBoundsSnapshot,
  UtilArg,
} from '../types/combiner.types';

export type { CombineOptions, CombineResult, CombinatorSpec, CombinerGroup, UtilArg };

export type MoveFn = (opts?: CombineOptions) => CombineResult;
export type AttachFn = (rig: THREE.Object3D, asset?: THREE.Object3D, opts?: CombineOptions) => CombineResult;
export type UtilFn = (root?: THREE.Object3D, arg?: UtilArg, opts?: CombineOptions) => CombineResult;
export type EnvFn = (root?: THREE.Object3D, opts?: CombineOptions) => CombineResult;

// ---------------------------------------------------------------------------
// Bảng tên theo nhóm (445+ hàm)
// ---------------------------------------------------------------------------

export const GROUP_I_MOVE = [
  'combineIdleAndWalk', 'combineIdleAndRun', 'combineIdleAndSprint', 'combineIdleAndCrouch', 'combineIdleAndCrawl',
  'combineIdleAndSneak', 'combineIdleAndJump', 'combineIdleAndFall', 'combineIdleAndLand', 'combineIdleAndRoll',
  'combineSitAndIdle', 'combineSitAndRotate', 'combineSitAndStandUp', 'combineSitAndReach', 'combineSitAndLookAround',
  'combineCrouchAndWalk', 'combineCrouchAndRun', 'combineCrouchAndTurn', 'combineCrouchAndStop', 'combineCrouchAndLean',
  'combineRunAndJump', 'combineRunAndSlide', 'combineRunAndTurn', 'combineRunAndStumble', 'combineRunAndClimb',
  'combineWalkAndTurn', 'combineWalkAndStop', 'combineWalkAndLook', 'combineWalkAndStepBack', 'combineWalkAndSidestep',
  'combineSwimAndIdle', 'combineSwimAndMove', 'combineSwimAndDive', 'combineSwimAndSurface', 'combineSwimAndTread',
  'combineClimbAndIdle', 'combineClimbAndMoveUp', 'combineClimbAndMoveDown', 'combineClimbAndLeap', 'combineClimbAndRest',
] as const;

export const GROUP_II_ATTACH = [
  'attachWeaponToHand', 'attachShieldToArm', 'attachToolToBelt', 'attachBackpackToSpine', 'attachHelmetToHead',
  'combineIdleAndHoldWeapon', 'combineIdleAndHoldTool', 'combineIdleAndHoldTorch', 'combineIdleAndHoldBox', 'combineIdleAndHoldChild',
  'combineWalkAndHoldWeapon', 'combineWalkAndHoldTorch', 'combineWalkAndDragCorpse', 'combineWalkAndCarryBox', 'combineWalkAndPushCart',
  'combineRunAndHoldWeapon', 'combineRunAndHolster',
  'combineCrouchAndHoldWeapon', 'combineCrouchAndAim', 'combineCrouchAndReload',
  'combineAttackAndMove', 'combineAttackAndJump', 'combineAttackAndCrouch',
  'combineBlockAndWalk', 'combineBlockAndBackstep',
  'combineCastSkillAndStand', 'combineCastSkillAndWalk',
  'combineHitReactionAndMove', 'combineHitReactionAndFall',
  'combineDeathAndRagdoll', 'combineDrinkAndWalk', 'combineEatAndStand', 'combineBandageAndCrouch', 'combineCraftAndSit',
  'combineHarvestAndKneel', 'combineLootAndBend', 'combineOpenChestAndReach', 'combinePlantAndKneel', 'combineSkinAnimalAndCrouch',
  'combineIgniteAndKneel', 'combineMountAndRide', 'combineRideAndSteer', 'combineRideAndAttack', 'combineRideAndJump',
  'combineDismountAndLand', 'combineLeadAnimalAndWalk', 'combinePetAnimalAndKneel', 'combineFeedAnimalAndReach',
  'combineThrowItemAndRun', 'combineTrapAndKneel',
] as const;

export const GROUP_III_CREATURE = [
  'combineFreezeAndShiver', 'combineOverheatAndWipe', 'combineStarveAndHunch', 'combineDehydrateAndStagger', 'combinePoisonAndCrawl',
  'combineSleepAndLayDown', 'combineWakeUpAndStretch', 'combineSneezeAndJerk', 'combineCoughAndBend', 'combineDrownAndFlail',
  'combineAnimalIdleAndTailFlick', 'combineAnimalIdleAndEarTwitch', 'combineAnimalWalkAndSniff', 'combineAnimalRunAndPounce',
  'combineAnimalHowlAndStand', 'combineAnimalSleepAndCurl', 'combineAnimalEatAndBow', 'combineAnimalDrinkAndKneel',
  'combineAnimalScratchesAndGround', 'combineAnimalShakeWaterAndStand',
  'combineBirdFlyAndGlide', 'combineBirdPerchAndFold', 'combineFishSwimAndTail', 'combineInsectCrawlingAndWall', 'combineReptileSlitherAndGround',
  'combinePackLeaderAndHowl', 'combineMonsterRageAndRoar', 'combineMonsterBurrowAndDig', 'combineMonsterEmergeAndLeap', 'combineMonsterTransformAndGlow',
  'combineMultiArmAttackAndSwing', 'combineWingFlapAndGust', 'combineTentacleWhipAndSway', 'combineSporeReleaseAndEmit',
  'combineStealthAndFade', 'combineShieldBreakAndStagger', 'combineParryAndCounter', 'combineGrappleAndPull', 'combineGrappleAndLaunch',
  'combineZipLineAndGlide', 'combineNetCaptureAndTrap', 'combineTameAnimalAndFeed', 'combineShearWoolAndKneel', 'combineMilkAnimalAndSquat',
  'combineHatchEggAndWarm', 'combineNestBuildAndGather', 'combineHidingAndBush', 'combineCamouflageAndMud', 'combineTorchWaveAndSare',
  'combineWhistleAndCall',
] as const;

export const GROUP_IV_BLEND = [
  'blendUpperAndLowerBody', 'blendSpineTwistAndAim', 'blendHeadLookAtTarget', 'blendFacialExpression', 'blendJawMoveAndSpeak',
  'blendBlinkEyesAndIdle', 'blendHairPhysicsAndWind', 'blendClothSimulationAndVelocity', 'blendTailPhysicsAndInertia',
  'blendFootIKAndTerrain', 'blendHandIKAndObject', 'blendSpineBendAndSlope', 'blendWeightShiftAndTurn', 'blendRecoilAndShoulder',
  'blendBreathingAndChest', 'blendHitImpulseAndSpine', 'blendRagdollBlendingToAnim', 'blendMountAnimationSync',
  'blendDualWieldingWeapons', 'blendTwoHandedGrip', 'blendRopePullingAndBody', 'blendPushingHeavyObject', 'blendPullingLeverAndArm',
  'blendClimbingLadderAndRungs', 'blendSwimmingStrokeAndLegs', 'blendCrawlingVentAndBody', 'blendHangingCliffAndFingers',
  'blendSlidingSlopeAndPose', 'blendParachuteGlideAndStrings', 'blendGrapplingHookPullAndFly', 'blendShieldWallFormation',
  'blendFormationMarchAndSync', 'blendStealthTakedownAndVictim', 'blendRescueCarryAndShoulder', 'blendHandshakeAndNPC',
  'blendTradeExchangeAndHands', 'blendSitAroundCampfireAndTalk', 'blendDanceEmoteAndMusic', 'blendVictoryCheerAndJump',
  'blendDefeatDespairAndKneel',
] as const;

export const GROUP_IV_UTIL = [
  'combineZoomAssetScale', 'combineExtractMeshBuffers', 'combineExtractTextureMaps', 'combineGenerateBoundingBox',
  'combineGenerateBoundingSphere', 'combineOptimizeDrawCalls', 'combineSetupLevelOfDetail', 'combineAttachLightToSocket',
  'combineAttachAudioEmitter', 'combineBakeAnimationClips', 'combineMapCustomShaderToMaterial', 'combineBuildSpatialGridNode',
  'combineSerializeEntityState', 'combineDeserializeEntityState', 'combineValidateCollisionShape', 'combineCacheParsedAssetData',
  'combineDisposeUnusedAssets', 'combinePoolEntityInstance', 'combineTriggerParticleEmitter', 'combineExecuteMasterPipeline',
  'combineGenerateBoundingCapsule', 'combineComputeCenterOfMass', 'combineRaycastAssetBounds', 'combineQueryAssetBounds',
  'combineSweepAssetCollider', 'combineBuildPhysicsProxy', 'combineValidateSpatialBounds',
] as const;

export const GROUP_V_CREATURE = [
  'combineAnimalIdleAndTailWhip', 'combineAnimalWalkAndStalk', 'combineAnimalRunAndCharge', 'combineAnimalJumpAndPounce',
  'combineAnimalSleepAndSnore', 'combineAnimalEatAndChew', 'combineAnimalDrinkAndSplash', 'combineAnimalAttackAndClaw',
  'combineAnimalAttackAndBite', 'combineAnimalAttackAndTailSwipe', 'combineAnimalDefenseAndGrowl', 'combineAnimalDefenseAndCrouch',
  'combineAnimalHurtAndWhimper', 'combineAnimalDeathAndCollapse', 'combineMonsterIdleAndTentacleSway', 'combineMonsterWalkAndShakeGround',
  'combineMonsterRunAndStampede', 'combineMonsterAttackAndSlam', 'combineMonsterAttackAndSpitVenom', 'combineMonsterAttackAndBreathFire',
  'combineMonsterDefenseAndHardShell', 'combineMonsterHurtAndRetreat', 'combineMonsterDeathAndDissolve', 'combineMonsterSummonAndHowl',
  'combineMonsterRageAndBuff',
] as const;

export const GROUP_VI_ACTION = [
  'combineThrowAndAim', 'combineThrowAndRun', 'combineThrowAndJump', 'combineThrowAndSpin', 'combineThrowAndKneel',
  'combineShootAndAim', 'combineShootAndWalk', 'combineShootAndCrouch', 'combineShootAndRun', 'combineShootAndReload',
  'combineFlyAndGlide', 'combineFlyAndDive', 'combineFlyAndHover', 'combineFlyAndAccelerate', 'combineFlyAndBankTurn',
  'combineDiveAndSwim', 'combineDiveAndSurface', 'combineDiveAndAttack', 'combineDiveAndSearch', 'combineDiveAndEvade',
  'combineLaunchAndProjectile', 'combineRicochetAndBounce', 'combineExplodeAndDebris', 'combineRecoilAndStabilize',
  'combineTrackingAndTarget',
] as const;

export const GROUP_VII_ACRO = [
  'combineSpinAndAttack', 'combineSpinAndDash', 'combineSpinAndJump', 'combineSpinAndFall', 'combineSpinAndLand',
  'combineRollAndEvade', 'combineRollAndSprint', 'combineRollAndJump', 'combineRollAndStop', 'combineRollAndShoot',
  'combineFlipAndJump', 'combineFlipAndAttack', 'combineFlipAndLand', 'combineFlipAndWallRun', 'combineFlipAndVault',
  'combineFallAndGrab', 'combineFallAndParachute', 'combineFallAndRoll', 'combineFallAndStagger', 'combineFallAndImpact',
  'combineRotateAndAim', 'combineRotateAndWalk', 'combineRotateAndRun', 'combineRotateAndCrouch', 'combineRotateAndShoot',
] as const;

export const GROUP_VIII_ENV = [
  'combineWindPushAndLean', 'combineWaterCurrentAndDrift', 'combineMudSogAndSlow', 'combineIceSlipAndSlide', 'combineFireBurnAndPanic',
  'combinePoisonStaggerAndCrawl', 'combineLightningShockAndTremble', 'combineFreezeShiverAndKneel', 'combineSandstormShieldAndWalk',
  'combineEarthquakeStumbleAndFall', 'combineShadowMergeAndStealth', 'combineLightExposureAndBlind', 'combineEchoLocationAndSense',
  'combineAdrenalineRushAndSpeed', 'combineFatigueCollapseAndRest', 'combineArmorHeavyAndSlowWalk', 'combineWeaponWeightAndBalance',
  'combineShieldBlockAndKnockback', 'combineParrySuccessAndCounter', 'combineGrapplePullAndSwing', 'combineZiplineSlideAndBrake',
  'combineLadderClimbAndStep', 'combineLedgeHangAndShimmy', 'combineWallRunAndJumpOff', 'combineMasterPipelineExecution',
] as const;

export const GROUP_IX_HUMANOID = [
  'combineHumanoidIdleAndBrandish', 'combineHumanoidWalkAndParry', 'combineHumanoidRunAndSlash', 'combineHumanoidCrouchAndAmbush',
  'combineHumanoidJumpAndPlunge', 'combineHumanoidRollAndCounter', 'combineHumanoidClimbAndCombat', 'combineHumanoidSwimAndStab',
  'combineHumanoidStealthAndExecution', 'combineHumanoidBerserkAndCharge', 'combineHumanoidSpellCastAndLevitate',
  'combineHumanoidChannelAndSummon', 'combineHumanoidStaggerAndRecovery', 'combineHumanoidParalyzedAndTremble',
  'combineHumanoidFrenzyAndScream', 'combineHumanoidDualBladeSpin', 'combineHumanoidSpearThrustAndStep', 'combineHumanoidGreatswordSlam',
  'combineHumanoidBowDrawAndAim', 'combineHumanoidCrossbowReloadAndFire', 'combineHumanoidShieldBashAndPush',
  'combineHumanoidDodgeRollAndShoot', 'combineHumanoidAcrobaticFlipAndStrike', 'combineHumanoidWallJumpAndSlash',
  'combineHumanoidGrapplePullAndExecute', 'combineHumanoidMutateAndTransform', 'combineHumanoidArmorShedAndRage',
  'combineHumanoidInvisibilityAndSneak', 'combineHumanoidShadowStepAndTeleport', 'combineHumanoidVampiricDrainAndHeal',
  'combineHumanoidGhoulCrawlAndLeap', 'combineHumanoidOrcBrutalSwing', 'combineHumanoidGoblinSneakAndStab',
  'combineHumanoidSkeletonBoneShield', 'combineHumanoidZombieDraggingAndBite', 'combineHumanoidMutantMultiArmSlam',
  'combineHumanoidCultistChantAndRitual', 'combineHumanoidBanditAmbushAndLaugh', 'combineHumanoidKnightVowAndKneel',
  'combineHumanoidAssassinateAndVanish', 'combineHumanoidDualWieldComboAndDash', 'combineHumanoidHeavyArmorDashAndCrash',
  'combineHumanoidStaffSpinAndBlast', 'combineHumanoidWhipLashAndGrab', 'combineHumanoidThrowingKnifeAndSprint',
  'combineHumanoidSmokeBombAndDisappear', 'combineHumanoidCounterAttackAndRiposte', 'combineHumanoidExecutionAndGore',
  'combineHumanoidBossPhaseTransition', 'combineHumanoidUltimateSkillExecution',
] as const;

// Nhóm đổ vỡ & rơi nát
export const GROUP_X_DESTRUCTIBLE = [
  'combineFractureAndShatter', 'combineCrumbleAndDebris', 'combineImpactAndCrater', 'combineCollapseAndDust',
  'combineExplosionAndFragments', 'combineStressAndFracture', 'combineBrittleSnapAndBreak', 'combineFallAndSmash',
  'combineStructuralFailure', 'combineDebrisBounceAndSettle',
  'combineDestructionGlassShatter', 'combineDestructionExplosionBlast',
] as const;

// Nhóm cây cối & thực vật
export const GROUP_XI_FOLIAGE = [
  'combineTreeWindSway', 'combineTreeChopAndFall', 'combineBranchBendAndSnap', 'combineLeafRustleAndShed',
  'combineTrunkFractureAndTopple', 'combineFruitDropAndBounce', 'combineVineSwingAndClimb', 'combineBushRustleAndPart',
  'combineVegetationBurnAndAsh', 'combineFoliageTrampleAndRegrow',
  'combineFoliageTreeChop', 'combineFoliageBranchSway', 'combineFoliageLeafFlutter',
] as const;

// Nhóm nhà cửa & kiến trúc
export const GROUP_XII_STRUCTURE = [
  'combineWallBreachAndRubble', 'combineDoorSwingAndLatch', 'combineDoorKickAndSplinter', 'combineRoofCollapseAndFall',
  'combinePillarToppleAndCrush', 'combineWindowShatterAndShards', 'combineGateLowerAndLock', 'combineBridgeCollapseAndSnap',
  'combineFloorBreakAndPlunge', 'combineStairsCrumbleAndSlide',
  'combineBreakWallBreach', 'combineArchitectureArchCollapse', 'combineStructureRubbleFall',
] as const;

// Nhóm nước & chất lỏng
export const GROUP_XIII_WATER = [
  'combineWaterSplashAndRipples', 'combineWaterCurrentAndBuoyancy', 'combineWaterSubmergeAndDrag', 'combineWaterSurfaceTensionAndFloat',
  'combineWaterfallSprayAndMist', 'combineWaveCrashAndFoam', 'combineWaterVortexAndWhirlpool', 'combineUnderseaPressureAndCurrent',
  'combinePuddleSplashAndStain', 'combineFreezingWaterAndIceFormation',
  'combineWaterBuoyancyFloat', 'combineWaterCurrentPush', 'combineWaterWaveCrest',
] as const;

// Nhóm không khí & khí động lực
export const GROUP_XIV_ATMOSPHERE = [
  'combineAirGustAndBuffet', 'combineVortexSpinAndLift', 'combineUpdraftAndFloat', 'combineDraftAndFlicker',
  'combineShockwaveAndConcussion', 'combineVacuumPullAndImplode', 'combineThermalDraftAndRise', 'combineGaleForceAndDeflect',
  'combineTurbulenceAndStagger', 'combineBreezeAndFloat',
  'combineAtmosphereWindGust', 'combineAtmosphereThermalsRise', 'combineAtmosphereStormSurge',
] as const;

// Nhóm đất đá & địa chất
export const GROUP_XV_EARTH = [
  'combineRockSlideAndTumble', 'combineEarthTremorAndFissure', 'combineMudSuctionAndStick', 'combineQuicksandSinkAndStruggle',
  'combineBoulderRollAndCrush', 'combineSoilExcavateAndMound', 'combineLavaFlowAndSolidify', 'combineSandDuneDriftAndSlide',
  'combineCrystalSpikeErupt', 'combineBedrockCrackAndShake',
] as const;

// Nhóm đồ vật & tương tác cơ khí (nút, cần gạt, rương, bẫy)
export const GROUP_XVI_PROPS = [
  'combineButtonPressAndTrigger', 'combineLeverPullAndActivate', 'combineSwitchFlipAndPower', 'combinePressurePlateStepAndDepress',
  'combineChestOpenAndCreak', 'combineChestLockAndUnlock', 'combineCrateSmashAndLoot', 'combineBarrelRollAndExplode',
  'combineTrapTriggerAndSpring', 'combinePulleyHoistAndLift', 'combineGearRotateAndMesh', 'combineChainPullAndRattle',
  'combinePedestalActivateAndGlow', 'combineTorchMountAndBurn', 'combineRelicSlotAndAnchor', 'combineInteractiveLeverPull',
] as const;

// Nhóm hành vi sinh thái động vật chuyên sâu
export const GROUP_XVII_ANIMAL_ADVANCED = [
  'combineAnimalHerdMoveAndGraze', 'combineAnimalPredatorStalkAndSpring', 'combineAnimalPreyFleeAndScatter', 'combineAnimalMotherProtectAndNurture',
  'combineAnimalAlertAndScan', 'combineAnimalPlayAndTumble', 'combineAnimalMarkTerritory', 'combineAnimalDigBurrow',
  'combineAnimalBaskAndWarm', 'combineAnimalHibernateAndBreathe',
] as const;

export const COMBINATOR_NAME_GROUPS = {
  move: GROUP_I_MOVE,
  attach: GROUP_II_ATTACH,
  creature: GROUP_III_CREATURE,
  blend: GROUP_IV_BLEND,
  util: GROUP_IV_UTIL,
  creatureCombat: GROUP_V_CREATURE,
  action: GROUP_VI_ACTION,
  acro: GROUP_VII_ACRO,
  env: GROUP_VIII_ENV,
  humanoid: GROUP_IX_HUMANOID,
  destructible: GROUP_X_DESTRUCTIBLE,
  foliage: GROUP_XI_FOLIAGE,
  structure: GROUP_XII_STRUCTURE,
  water: GROUP_XIII_WATER,
  atmosphere: GROUP_XIV_ATMOSPHERE,
  earth: GROUP_XV_EARTH,
  props: GROUP_XVI_PROPS,
  animalAdvanced: GROUP_XVII_ANIMAL_ADVANCED,
} as const;

export type CombinerName = (typeof COMBINATOR_NAME_GROUPS)[keyof typeof COMBINATOR_NAME_GROUPS][number];

const UTIL_NAMES: ReadonlySet<string> = new Set<string>([...GROUP_IV_UTIL, 'combineMasterPipelineExecution']);

function socketForName(name: string): string {
  if (/Hand|Weapon|Tool(?!ToBelt)/.test(name) && !/Head/.test(name)) return 'hand_r';
  if (/Arm|Shield/.test(name)) return 'arm_l';
  if (/Belt/.test(name)) return 'belt';
  if (/Head|Helmet/.test(name)) return 'head';
  if (/Spine|Backpack/.test(name)) return 'spine';
  return 'hand_r';
}

function isAttachName(name: string): boolean {
  return name.startsWith('attach') || name === 'combineAttachLightToSocket' || name === 'combineAttachAudioEmitter';
}

const ADDITIVE_KEYWORDS = ['HairPhysics', 'ClothSimulation', 'TailPhysics', 'Breathing', 'FacialExpression', 'JawMove', 'BlinkEyes'];

function modeForBlendName(name: string): BlendMode {
  if (/Upper/.test(name)) return 'upperBody';
  if (/Lower|Foot|Leg/.test(name)) return 'lowerBody';
  if (ADDITIVE_KEYWORDS.some((k) => name.includes(k))) return 'additive';
  return 'masked';
}

function clipsForName(name: string): { base?: string; overlay?: string } {
  const body = name.replace(/^(combine|blend|attach)/, '');
  const idx = body.indexOf('And');
  if (idx < 0) return { base: body };
  return { base: body.slice(0, idx), overlay: body.slice(idx + 3) };
}

const PHYSICS_KEYWORDS = /physics|collision|gravity|impact|force|buoyan|fracture|shatter|debris|fall|collapse|sweep|ragdoll|mass|weight|stagger|knockback|pounce|slam|stomp|crash|break|stress|brittle/i;
const SPATIAL_KEYWORDS = /bound|socket|attach|grip|aim|look|target|track|search|scan|sense|raycast|spatial|grid|distance|reach|range|volume|center|centre|pivot/i;

/**
 * Derive the spatial/physics/analytics metadata attached to every combiner.
 *
 * This is what reconnects the existing animation catalogue to the bounds,
 * transform and physics systems without changing public combiner names.
 */
function metadataFor(name: string, group: CombinerGroup, kind: CombinatorSpec['kind']): CombinerMetadata {
  const physicsByKeyword = PHYSICS_KEYWORDS.test(name);
  const spatialByKeyword = SPATIAL_KEYWORDS.test(name);
  const usesPhysics = physicsByKeyword || ['destructible', 'earth', 'water', 'structure', 'props'].includes(group);
  const isEnvironment = kind === 'environment';
  const usesSpatial = spatialByKeyword || usesPhysics || kind === 'util' || isEnvironment;

  let collider: CombinerMetadata['physics']['collider'] = 'box';
  if (kind === 'attach') collider = 'none';
  else if (kind === 'util') collider = 'mesh';
  else if (['move', 'creature', 'creatureCombat', 'action', 'acro', 'humanoid', 'animalAdvanced'].includes(group)) collider = 'capsule';
  else if (['foliage', 'atmosphere'].includes(group)) collider = 'sphere';

  const query: CombinerMetadata['bounds']['query'] = /raycast|ray/i.test(name)
    ? 'ray'
    : /query|bound|volume|spatial/i.test(name)
      ? 'aabb'
      : /look|aim|target|track|search|scan|sense|pounce/i.test(name)
        ? 'sphere'
        : /attach|socket|grip/i.test(name)
          ? 'segment'
          : 'none';

  const boundsRequired = usesSpatial || group === 'destructible';
  const loops = ['move', 'creature', 'creatureCombat', 'action', 'acro', 'humanoid', 'animalAdvanced', 'env'].includes(group);
  const cost: CombinerMetadata['analytics']['cost'] = group === 'destructible' || group === 'structure' || group === 'earth'
    ? 'high'
    : kind === 'util' || usesPhysics
      ? 'medium'
      : 'low';

  return {
    category: group,
    bounds: {
      required: boundsRequired,
      volumeKind: collider === 'capsule' ? 'capsule' : collider === 'sphere' ? 'sphere' : 'aabb',
      query,
    },
    physics: {
      collider,
      gravity: loops ? 1 : 0,
      mass: collider === 'capsule' ? 70 : collider === 'none' ? 0 : 20,
      friction: 0.7,
      restitution: group === 'water' ? 0.3 : 0.15,
      dynamic: usesPhysics && collider !== 'none',
    },
    transform: {
      space: kind === 'environment' || kind === 'util' ? 'world' : 'local',
      affectsRoot: kind === 'environment' || kind === 'util' || group === 'destructible',
      animated: kind === 'move' || kind === 'blend' || kind === 'environment',
    },
    analytics: {
      cost,
      mixes: kind === 'blend' ? 2 : clipsForName(name).overlay ? 2 : 1,
      usesPhysics,
      usesSpatial,
      deterministic: !/random|noise|wander|flicker/i.test(name),
    },
    tags: [
      group,
      kind,
      usesPhysics ? 'physics' : 'animation',
      ...(usesSpatial ? ['spatial'] : []),
      ...(query !== 'none' ? [`query:${query}`] : []),
    ],
    custom: { boundsKind: collider === 'capsule' ? 'capsule' : 'aabb' },
  };
}

function describeCombiner(name: string): string {
  return name
    .replace(/^(combine|blend|attach)/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}

function withMetadata(
  spec: Omit<CombinatorSpec, 'metadata' | 'requiresRoot' | 'priority' | 'tags' | 'description'>,
): CombinatorSpec {
  const metadata = metadataFor(spec.name, spec.group, spec.kind);
  return {
    ...spec,
    description: describeCombiner(spec.name),
    metadata,
    requiresRoot: spec.kind === 'util' || spec.kind === 'environment',
    priority: spec.kind === 'attach' ? 10 : spec.kind === 'util' ? 5 : 0,
    tags: metadata.tags,
  };
}

function deriveSpec(name: string, group: CombinerGroup): CombinatorSpec {
  if (isAttachName(name)) {
    return withMetadata({
      name,
      group: 'attach',
      kind: 'attach',
      socket: socketForName(name),
      mode: 'override',
      timeScaleKey: 'none',
    });
  }
  if (UTIL_NAMES.has(name)) {
    return withMetadata({
      name,
      group: 'util',
      kind: 'util',
      mode: 'override',
      timeScaleKey: 'none',
    });
  }
  const { base, overlay } = clipsForName(name);
  if (name.startsWith('blend')) {
    return withMetadata({
      name,
      group: 'blend',
      kind: 'blend',
      baseClip: base,
      overlayClip: overlay,
      mode: modeForBlendName(name),
      timeScaleKey: 'none',
    });
  }
  if (['destructible', 'foliage', 'structure', 'water', 'atmosphere', 'earth', 'props'].includes(group)) {
    return withMetadata({
      name,
      group,
      kind: 'environment',
      baseClip: base,
      overlayClip: overlay,
      mode: 'override',
      timeScaleKey: 'speed',
    });
  }
  return withMetadata({
    name,
    group,
    kind: 'move',
    baseClip: base,
    overlayClip: overlay,
    mode: 'override',
    timeScaleKey: 'speed',
  });
}

export function buildSpecs(): CombinatorSpec[] {
  const list: CombinatorSpec[] = [];
  for (const [groupKey, names] of Object.entries(COMBINATOR_NAME_GROUPS)) {
    const group = groupKey as CombinerGroup;
    for (const name of names) {
      list.push(deriveSpec(name, group));
    }
  }
  return list;
}

export const COMBINATOR_SPECS: readonly CombinatorSpec[] = buildSpecs();

const COMBINATOR_INDEX: ReadonlyMap<string, CombinatorSpec> = new Map(COMBINATOR_SPECS.map((s) => [s.name, s]));

export function getCombinatorSpec(name: string): CombinatorSpec | undefined {
  return COMBINATOR_INDEX.get(name);
}

// ---------------------------------------------------------------------------
// Generator Behavior
// ---------------------------------------------------------------------------

const warnCacheCombine = new Set<string>();
function warnOnceCombine(key: string, msg: string): void {
  if (warnCacheCombine.has(key)) return;
  warnCacheCombine.add(key);
  console.warn('[combine]', msg);
}

function makeMoveCombiner(spec: CombinatorSpec, blender: StateBlender): MoveFn {
  return (opts: CombineOptions = {}): CombineResult => {
    const speed = opts.speed ?? 1;
    const fade = opts.fade ?? 0.2;
    const baseName = spec.baseClip ?? 'Idle';
    const overlayName = spec.overlayClip;

    const baseLayer = blender.layer(`${spec.name}:base`, { mode: 'override', timeScale: speed });
    const baseClip = blender.findClip(baseName);
    const missing: string[] = [];

    if (!baseClip) {
      baseLayer.enabled = false;
      missing.push(baseName);
    } else {
      blender.play(baseLayer, baseClip);
    }

    const layers: BlenderLayer[] = [baseLayer];
    if (overlayName) {
      const overLayer = blender.layer(`${spec.name}:overlay`, { mode: 'override', timeScale: speed });
      const overClip = blender.findClip(overlayName);
      if (!overClip) {
        overLayer.enabled = false;
        missing.push(overlayName);
      } else {
        blender.play(overLayer, overClip);
        blender.crossFade(baseLayer, overLayer, fade);
      }
      layers.push(overLayer);
    }

    if (missing.length > 0) {
      warnOnceCombine(`missing:${spec.name}`, `${spec.name}: thiếu clip ${JSON.stringify(missing)} → layer disabled`);
      return { ok: false, fn: spec.name, group: spec.group, layers, info: { missing } };
    }
    return { ok: true, fn: spec.name, group: spec.group, layers };
  };
}

function makeAttachCombiner(spec: CombinatorSpec, binder: SocketBinder): AttachFn {
  return (rig: THREE.Object3D, asset?: THREE.Object3D, opts: CombineOptions = {}): CombineResult => {
    const socket = spec.socket ?? 'hand_r';
    const assetId = opts.assetId ?? (asset?.name && asset.name.length > 0 ? asset.name : `${spec.name}_asset`);
    const handle = binder.bind(rig, {
      socket,
      assetId,
      offset: opts.offset,
      followBone: opts.followBone ?? true,
      scaleMultiplier: opts.scaleMultiplier,
      slotTag: opts.slotTag,
    });
    if (!handle) {
      return { ok: false, fn: spec.name, group: spec.group, socket: null, info: { socket, reason: 'bone_not_found' } };
    }
    if (asset) binder.attachAsset(handle, asset);
    return { ok: true, fn: spec.name, group: spec.group, socket: handle };
  };
}

function makeBlendCombiner(spec: CombinatorSpec, blender: StateBlender): MoveFn {
  return (opts: CombineOptions = {}): CombineResult => {
    const weight = opts.weight ?? 1;
    const layer = blender.layer(`${spec.name}:blend`, { mode: spec.mode, weight });
    const clipName = spec.overlayClip ?? spec.baseClip;
    let clip = clipName ? blender.findClip(clipName) : undefined;
    let usedName = clipName;
    if (!clip && spec.baseClip && spec.baseClip !== clipName) {
      clip = blender.findClip(spec.baseClip);
      usedName = spec.baseClip;
    }
    if (!clip) {
      layer.enabled = false;
      warnOnceCombine(`missing:${spec.name}`, `${spec.name}: thiếu clip "${usedName ?? '?'}" → layer disabled`);
      return { ok: false, fn: spec.name, group: spec.group, layers: [layer], info: { missing: usedName ? [usedName] : [] } };
    }
    blender.play(layer, clip);
    return { ok: true, fn: spec.name, group: spec.group, layers: [layer], info: { mode: spec.mode } };
  };
}

function makeEnvCombiner(spec: CombinatorSpec, blender: StateBlender): EnvFn {
  return (root?: THREE.Object3D, opts: CombineOptions = {}): CombineResult => {
    const speed = opts.speed ?? 1;
    const baseName = spec.baseClip ?? spec.name;
    const baseLayer = blender.layer(`${spec.name}:env`, { mode: 'override', timeScale: speed });
    const baseClip = blender.findClip(baseName);
    let bounds: SpatialBoundsSnapshot | undefined;

    if (root) {
      if (spec.group === 'foliage' && opts.intensity) {
        root.rotation.z = Math.sin(Date.now() * 0.003) * opts.intensity * 0.1;
      }
      if (spec.group === 'destructible' || spec.group === 'foliage' || spec.group === 'structure' || spec.group === 'earth') {
        bounds = computeCombinerBounds(root);
        root.userData.combinerBounds = boundsSummary(bounds);
      }
    }

    if (!baseClip) {
      baseLayer.enabled = false;
      return {
        ok: true,
        fn: spec.name,
        group: spec.group,
        layers: [baseLayer],
        bounds,
        info: { envFallback: true, group: spec.group, hasBounds: bounds !== undefined },
      };
    }

    blender.play(baseLayer, baseClip);
    return { ok: true, fn: spec.name, group: spec.group, layers: [baseLayer], bounds, info: { group: spec.group } };
  };
}

interface SceneStats {
  meshes: number;
  triangles: number;
  materials: number;
}

function sceneStats(root: THREE.Object3D): SceneStats {
  let meshes = 0;
  let triangles = 0;
  const materials = new Set<THREE.Material>();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position');
    if (position) {
      triangles += geometry.getIndex()
        ? Math.floor(geometry.getIndex()!.count / 3)
        : Math.floor(position.count / 3);
    }
    if (Array.isArray(mesh.material)) {
      for (const material of mesh.material) materials.add(material);
    } else if (mesh.material) {
      materials.add(mesh.material);
    }
  });
  return { meshes, triangles, materials: materials.size };
}

function shapeFromArg(arg?: UtilArg): CollisionShape | undefined {
  if (!arg || typeof arg !== 'object' || arg instanceof THREE.Object3D) return undefined;
  const candidate = arg as Record<string, unknown>;
  if (typeof candidate.kind !== 'string') return undefined;
  return candidate as unknown as CollisionShape;
}

function rayFromOptions(root: THREE.Object3D, opts: CombineOptions): CombinerRayInput {
  if (opts.ray) return opts.ray;
  const bounds = computeCombinerBounds(root);
  const max = Math.max(1, bounds.aabb.max[2] - bounds.aabb.min[2]);
  return {
    origin: [bounds.sphere.center[0], bounds.sphere.center[1], bounds.aabb.max[2] + max],
    direction: [0, 0, -1],
    maxDistance: max * 2 + bounds.sphere.radius,
  };
}

interface EntitySnapshot {
  name: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
  visible: boolean;
  userData: Record<string, unknown>;
  children: EntitySnapshot[];
}

function snapshotEntity(root: THREE.Object3D): EntitySnapshot {
  return {
    name: root.name,
    type: root.type,
    position: [root.position.x, root.position.y, root.position.z],
    rotation: [root.quaternion.x, root.quaternion.y, root.quaternion.z, root.quaternion.w],
    scale: [root.scale.x, root.scale.y, root.scale.z],
    visible: root.visible,
    userData: { ...root.userData },
    children: root.children.map((child) => snapshotEntity(child)),
  };
}

function isEntitySnapshot(value: unknown): value is EntitySnapshot {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<EntitySnapshot>;
  return typeof candidate.name === 'string'
    && Array.isArray(candidate.position)
    && Array.isArray(candidate.rotation)
    && Array.isArray(candidate.scale);
}

function applyEntitySnapshot(root: THREE.Object3D, snapshot: EntitySnapshot): number {
  let applied = 0;
  root.name = snapshot.name;
  root.position.set(...snapshot.position);
  root.quaternion.set(...snapshot.rotation);
  root.scale.set(...snapshot.scale);
  root.visible = snapshot.visible;
  root.userData = { ...root.userData, ...snapshot.userData };
  applied += 1;

  snapshot.children.forEach((childSnapshot, index) => {
    const child = root.children[index];
    if (child) applied += applyEntitySnapshot(child, childSnapshot);
  });
  return applied;
}

const parsedAssetCache = new Map<string, { stats: SceneStats; storedAt: number }>();
const entityInstancePool = new Map<string, THREE.Object3D[]>();

function boundsSummary(bounds: SpatialBoundsSnapshot): Record<string, unknown> {
  return {
    aabb: bounds.aabb,
    obb: bounds.obb,
    sphere: bounds.sphere,
    capsule: bounds.capsule,
    volume: bounds.volume,
    surfaceArea: bounds.surfaceArea,
    centerOfMass: bounds.centerOfMass,
    vertexCount: bounds.vertexCount,
    triangleCount: bounds.triangleCount,
  };
}

function resolveBoundsMode(arg?: UtilArg, opts?: CombineOptions): SpatialBoundsKind | 'all' {
  if (opts?.boundsMode) return opts.boundsMode;
  if (typeof arg === 'string' && ['aabb', 'obb', 'sphere', 'capsule', 'all'].includes(arg)) {
    return arg as SpatialBoundsKind | 'all';
  }
  return 'all';
}

function makeUtilCombiner(spec: CombinatorSpec): UtilFn {
  return (root?: THREE.Object3D, arg?: UtilArg, opts: CombineOptions = {}): CombineResult => {
    const target = root ?? new THREE.Object3D();

    switch (spec.name) {
      case 'combineZoomAssetScale': {
        const factor = typeof arg === 'number' ? arg : 1.2;
        const res = zoomAsset(target, { factor });
        return { ok: true, fn: spec.name, group: spec.group, info: { factor: res } };
      }
      case 'combineExtractMeshBuffers': {
        const geo = extractGeometry(target);
        return { ok: geo !== null, fn: spec.name, group: spec.group, info: { hasGeometry: geo !== null } };
      }
      case 'combineExtractTextureMaps': {
        const textures = parseTextures(target);
        return { ok: true, fn: spec.name, group: spec.group, info: { count: textures.length, textures } };
      }
      case 'combineGenerateBoundingBox': {
        const bounds = computeCombinerBounds(target);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: {
            mode: resolveBoundsMode(arg, opts),
            aabb: bounds.aabb,
            dimensions: [
              bounds.aabb.max[0] - bounds.aabb.min[0],
              bounds.aabb.max[1] - bounds.aabb.min[1],
              bounds.aabb.max[2] - bounds.aabb.min[2],
            ],
            source: 'SpatialMath/AABB',
          },
        };
      }
      case 'combineGenerateBoundingSphere': {
        const bounds = computeCombinerBounds(target);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: { sphere: bounds.sphere, mode: resolveBoundsMode(arg, opts), source: 'SpatialMath/Sphere' },
        };
      }
      case 'combineGenerateBoundingCapsule': {
        const bounds = computeCombinerBounds(target);
        return {
          ok: bounds.capsule !== null,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: { capsule: bounds.capsule, source: 'SpatialMath/Capsule' },
        };
      }
      case 'combineComputeCenterOfMass': {
        const bounds = computeCombinerBounds(target);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: { centerOfMass: bounds.centerOfMass, volume: bounds.volume },
        };
      }
      case 'combineOptimizeDrawCalls': {
        const before = sceneStats(target);
        const merged = mergeStatic(target, { computeNormals: true });
        merged.name = target.name ? `${target.name}_combined` : 'combined_asset';
        const after = sceneStats(merged);
        return {
          ok: after.meshes <= before.meshes,
          fn: spec.name,
          group: spec.group,
          info: {
            before,
            after,
            mergedRoot: merged,
            drawCallsSaved: Math.max(0, before.meshes - after.meshes),
          },
        };
      }
      case 'combineSetupLevelOfDetail': {
        const stats = sceneStats(target);
        const distances = [0, 15, 30, 60];
        const ratios = [1, 0.5, 0.25, 0.1];
        const levels = distances.map((distance, index) => ({
          level: index,
          distance,
          ratio: ratios[index],
          targetTriangles: Math.max(1, Math.round(stats.triangles * ratios[index])),
        }));
        return {
          ok: stats.triangles > 0,
          fn: spec.name,
          group: spec.group,
          info: { levels, originalTriangles: stats.triangles },
        };
      }
      case 'combineAttachLightToSocket': {
        const boneName = typeof arg === 'string' ? arg : 'head';
        const socket = target.getObjectByName(boneName) ?? target;
        const light = new THREE.PointLight(0xfff1d6, 1, 10, 2);
        light.name = `combiner_light_${boneName}`;
        light.userData.combiner = spec.name;
        socket.add(light);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { bone: socket.name || boneName, attached: true, lightName: light.name },
        };
      }
      case 'combineAttachAudioEmitter': {
        const emitter = new THREE.Object3D();
        emitter.name = typeof arg === 'string' ? `audio_${arg}` : 'combiner_audio_emitter';
        emitter.userData = { combiner: spec.name, config: opts.data ?? arg ?? null };
        target.add(emitter);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { emitter: emitter.name, attached: true },
        };
      }
      case 'combineBakeAnimationClips': {
        const clips = target.animations ?? [];
        const baked = bakeClips(clips);
        return {
          ok: clips.length > 0,
          fn: spec.name,
          group: spec.group,
          info: {
            sourceCount: clips.length,
            bakedCount: baked.length,
            clips: baked.map((clip) => ({ name: clip.name, duration: clip.duration, tracks: clip.tracks.length })),
          },
        };
      }
      case 'combineMapCustomShaderToMaterial': {
        const vertexShader = [
          'void main() {',
          '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
          '}',
        ].join('\n');
        const fragmentShader = [
          'uniform vec3 tint;',
          'void main() {',
          '  gl_FragColor = vec4(tint, 1.0);',
          '}',
        ].join('\n');
        const shader = createShaderMaterial(vertexShader, fragmentShader, {
          tint: { value: new THREE.Color(0.85, 0.88, 0.95) },
        }, { name: 'combiner_custom_shader' });
        let count = 0;
        target.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.material = shader;
          count += 1;
        });
        return {
          ok: count > 0,
          fn: spec.name,
          group: spec.group,
          info: { applied: count, material: shader.name },
        };
      }
      case 'combineBuildSpatialGridNode': {
        const grid = new SpatialGrid(32);
        grid.insert('node', target.position, 1);
        grid.insert('neighbor', new THREE.Vector3(target.position.x + 1, target.position.y, target.position.z), 1);
        const cell = grid.query(target.position, 1);
        return {
          ok: cell.length > 0,
          fn: spec.name,
          group: spec.group,
          info: { cell: cell.length, ids: cell, cellSize: 32 },
        };
      }
      case 'combineSerializeEntityState': {
        const state = snapshotEntity(target);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { state, nodes: state.children.length + 1, json: JSON.stringify(state) },
        };
      }
      case 'combineDeserializeEntityState': {
        let raw: unknown = arg;
        if (typeof arg === 'string') {
          try {
            raw = JSON.parse(arg) as unknown;
          } catch (error) {
            return {
              ok: false,
              fn: spec.name,
              group: spec.group,
              info: { error: error instanceof Error ? error.message : String(error) },
            };
          }
        }
        if (!isEntitySnapshot(raw)) {
          return { ok: false, fn: spec.name, group: spec.group, info: { error: 'invalid_entity_snapshot' } };
        }
        const applied = applyEntitySnapshot(target, raw);
        return { ok: true, fn: spec.name, group: spec.group, info: { applied } };
      }
      case 'combineValidateCollisionShape': {
        const shape = opts.collisionShape ?? shapeFromArg(arg);
        const validation = validateCombinerCollisionShape(shape);
        return {
          ok: validation.valid,
          fn: spec.name,
          group: spec.group,
          info: {
            kind: validation.kind,
            errors: validation.errors,
            warnings: validation.warnings,
            shape: shape ?? null,
          },
        };
      }
      case 'combineCacheParsedAssetData': {
        const key = typeof arg === 'string' ? arg : target.name || target.uuid;
        const entry = { stats: sceneStats(target), storedAt: Date.now() };
        parsedAssetCache.set(key, entry);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { key, cached: true, cacheSize: parsedAssetCache.size, stats: entry.stats },
        };
      }
      case 'combineDisposeUnusedAssets': {
        const geometries = new Set<THREE.BufferGeometry>();
        const materials = new Set<THREE.Material>();
        target.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          if (mesh.geometry) geometries.add(mesh.geometry);
          if (Array.isArray(mesh.material)) {
            for (const material of mesh.material) materials.add(material);
          } else if (mesh.material) {
            materials.add(mesh.material);
          }
        });
        for (const geometry of geometries) geometry.dispose();
        for (const material of materials) material.dispose();
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { geometries: geometries.size, materials: materials.size, disposed: true },
        };
      }
      case 'combinePoolEntityInstance': {
        const key = typeof arg === 'string' ? arg : target.name || 'default';
        const pool = entityInstancePool.get(key) ?? [];
        pool.push(target.clone(true));
        entityInstancePool.set(key, pool);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { key, pooled: pool.length, pools: entityInstancePool.size },
        };
      }
      case 'combineTriggerParticleEmitter': {
        const particleEvent = { type: 'combiner:particle' } as unknown as Parameters<THREE.Object3D['dispatchEvent']>[0];
        target.dispatchEvent(particleEvent);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          info: { triggered: true, config: opts.data ?? arg ?? null, event: 'combiner:particle' },
        };
      }
      case 'combineRaycastAssetBounds': {
        const ray = rayFromOptions(target, opts);
        const bounds = computeCombinerBounds(target);
        const hit = combinerRaycast(target, ray);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: {
            ray,
            hit,
            source: 'SpatialMath/TriangleBVH',
          },
        };
      }
      case 'combineQueryAssetBounds': {
        const bounds = computeCombinerBounds(target);
        const query = opts.queryBounds ?? {
          min: bounds.aabb.min,
          max: bounds.aabb.max,
        };
        const hits = combinerQueryAABB(target, query);
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: { query, hits, count: hits.length, source: 'SpatialMath/AABB-query' },
        };
      }
      case 'combineSweepAssetCollider': {
        const bounds = computeCombinerBounds(target);
        const vertices = collectCombinerVertices(target);
        const shape = opts.collisionShape
          ?? collisionShapeFromBounds(bounds, 'box', vertices)
          ?? { kind: 'sphere' as const, radius: Math.max(1e-4, bounds.sphere.radius) };
        const position = opts.shapePosition ?? bounds.centerOfMass;
        const displacement = opts.displacement ?? [0, -1, 0] as const;
        const targetBounds = opts.queryBounds
          ?? { min: bounds.aabb.min, max: bounds.aabb.max };
        const hit = sweepColliderAgainstAABB(
          shape,
          { x: position[0], y: position[1], z: position[2] },
          { x: displacement[0], y: displacement[1], z: displacement[2] },
          snapshotToAABB({ ...bounds, aabb: { min: targetBounds.min, max: targetBounds.max } }),
        );
        return {
          ok: true,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: {
            shape: shape.kind,
            hit: {
              hit: hit.hit,
              timeOfImpact: hit.timeOfImpact,
              distance: hit.distance,
              point: [hit.point.x, hit.point.y, hit.point.z],
              normal: [hit.normal.x, hit.normal.y, hit.normal.z],
            },
            source: 'SpatialMath/sweep',
          },
        };
      }
      case 'combineBuildPhysicsProxy': {
        const bounds = computeCombinerBounds(target);
        const vertices = collectCombinerVertices(target);
        const proxy = buildCombinerPhysicsProxy(bounds, {
          kind: opts.collisionShape?.kind === 'capsule'
            ? 'capsule'
            : opts.collisionShape?.kind === 'sphere'
              ? 'sphere'
              : 'box',
          mass: opts.mass,
          gravityScale: opts.gravity,
          friction: opts.data && typeof opts.data === 'object' && 'friction' in opts.data
            ? Number(opts.data.friction)
            : undefined,
          vertices,
        });
        return {
          ok: proxy !== null,
          fn: spec.name,
          group: spec.group,
          bounds,
          physics: proxy ?? undefined,
          info: { proxy, source: 'SpatialMath/physics-proxy' },
        };
      }
      case 'combineValidateSpatialBounds': {
        const bounds = computeCombinerBounds(target);
        const values = [
          ...bounds.aabb.min,
          ...bounds.aabb.max,
          ...bounds.obb.center,
          ...bounds.obb.halfExtents,
          ...bounds.obb.orientation,
          ...bounds.sphere.center,
          bounds.sphere.radius,
          ...bounds.centerOfMass,
        ];
        const finite = values.every((value) => Number.isFinite(value));
        const ordered = bounds.aabb.min[0] <= bounds.aabb.max[0]
          && bounds.aabb.min[1] <= bounds.aabb.max[1]
          && bounds.aabb.min[2] <= bounds.aabb.max[2];
        const positive = bounds.sphere.radius > 0 || bounds.vertexCount === 0;
        return {
          ok: finite && ordered && positive,
          fn: spec.name,
          group: spec.group,
          bounds,
          info: {
            finite,
            ordered,
            positive,
            vertexCount: bounds.vertexCount,
            volume: bounds.volume,
          },
        };
      }
      case 'combineExecuteMasterPipeline':
      case 'combineMasterPipelineExecution': {
        const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const bounds = computeCombinerBounds(target);
        const vertices = collectCombinerVertices(target);
        const proxy = buildCombinerPhysicsProxy(bounds, { kind: 'box', vertices });
        const validation = proxy ? validateCombinerCollisionShape(proxy.shape) : null;
        const stats = sceneStats(target);
        target.userData.combinerPipeline = {
          bounds: boundsSummary(bounds),
          stats,
          physics: proxy,
          valid: validation?.valid ?? false,
        };
        return {
          ok: validation?.valid ?? false,
          fn: spec.name,
          group: spec.group,
          bounds,
          physics: proxy ?? undefined,
          info: {
            pipeline: 'master_completed',
            stats,
            collision: validation,
            bounds: boundsSummary(bounds),
          },
          diagnostics: makeCombineDiagnostics(startedAt),
        };
      }
      default:
        return {
          ok: false,
          fn: spec.name,
          group: spec.group,
          info: { unsupported: true, name: spec.name, arg: arg ?? null },
        };
    }
  };
}

export type Combiners = Record<string, MoveFn | AttachFn | UtilFn | EnvFn>;

export function createCombiners(blender: StateBlender, socketBinder?: SocketBinder): Combiners {
  const binder = socketBinder ?? new SocketBinder();
  const map: Combiners = {};

  for (const spec of COMBINATOR_SPECS) {
    if (spec.kind === 'attach') {
      map[spec.name] = makeAttachCombiner(spec, binder);
    } else if (spec.kind === 'util') {
      map[spec.name] = makeUtilCombiner(spec);
    } else if (spec.kind === 'blend') {
      map[spec.name] = makeBlendCombiner(spec, blender);
    } else if (spec.kind === 'environment') {
      map[spec.name] = makeEnvCombiner(spec, blender);
    } else {
      map[spec.name] = makeMoveCombiner(spec, blender);
    }
  }

  return map;
}

export const COMBINERS = COMBINATOR_SPECS;
export const createEngineCombiner = createCombiners;

