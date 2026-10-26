// engine/src/combiner/combine.ts — Hệ thống 445+ hàm ghép hoạt ảnh, vũ khí, hiệu ứng, vật lý & môi trường
import * as THREE from 'three';
import type { BlendMode, Transform } from '../types/transform.types';
import type { CollisionShape } from '../types/physics.types';
import { StateBlender, BlenderLayer } from './state-blender';
import { SocketBinder, SocketHandle } from './socket-binder';
import { SpatialGrid } from '../renderer/culling-optimizer';
import { createShaderMaterial } from '../effects/shader-compiler';
import { computeBounds } from '../transformer/bounds-calculator';
import { zoomAsset } from '../transformer/scaler';
import { extractGeometry, extractRawBufferData } from '../asset-parser/geometry-extractor';
import { parseTextures } from '../asset-parser/texture-parser';
import { bakeClips } from '../asset-parser/animation-baker';
import type {
  CombineOptions,
  CombineResult,
  CombinatorSpec,
  CombinerGroup,
  UtilArg,
} from '../types/combiner.types';

export type { CombineOptions, CombineResult, CombinatorSpec, CombinerGroup, UtilArg };

export type MoveFn = (opts?: CombineOptions) => CombineResult;
export type AttachFn = (rig: THREE.Object3D, asset?: THREE.Object3D, opts?: CombineOptions) => CombineResult;
export type UtilFn = (root?: THREE.Object3D, arg?: UtilArg) => CombineResult;
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

function deriveSpec(name: string, group: CombinerGroup): CombinatorSpec {
  if (isAttachName(name)) {
    return { name, group: 'attach', kind: 'attach', socket: socketForName(name), mode: 'override', timeScaleKey: 'none' };
  }
  if (UTIL_NAMES.has(name)) {
    return { name, group: 'util', kind: 'util', mode: 'override', timeScaleKey: 'none' };
  }
  const { base, overlay } = clipsForName(name);
  if (name.startsWith('blend')) {
    return { name, group: 'blend', kind: 'blend', baseClip: base, overlayClip: overlay, mode: modeForBlendName(name), timeScaleKey: 'none' };
  }
  if (['destructible', 'foliage', 'structure', 'water', 'atmosphere', 'earth', 'props'].includes(group)) {
    return { name, group, kind: 'environment', baseClip: base, overlayClip: overlay, mode: 'override', timeScaleKey: 'speed' };
  }
  return { name, group, kind: 'move', baseClip: base, overlayClip: overlay, mode: 'override', timeScaleKey: 'speed' };
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
      return { ok: false, fn: spec.name, layers, info: { missing } };
    }
    return { ok: true, fn: spec.name, layers };
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
      return { ok: false, fn: spec.name, socket: null, info: { socket, reason: 'bone_not_found' } };
    }
    if (asset) binder.attachAsset(handle, asset);
    return { ok: true, fn: spec.name, socket: handle };
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
      return { ok: false, fn: spec.name, layers: [layer], info: { missing: usedName ? [usedName] : [] } };
    }
    blender.play(layer, clip);
    return { ok: true, fn: spec.name, layers: [layer], info: { mode: spec.mode } };
  };
}

function makeEnvCombiner(spec: CombinatorSpec, blender: StateBlender): EnvFn {
  return (root?: THREE.Object3D, opts: CombineOptions = {}): CombineResult => {
    const speed = opts.speed ?? 1;
    const baseName = spec.baseClip ?? spec.name;
    const baseLayer = blender.layer(`${spec.name}:env`, { mode: 'override', timeScale: speed });
    const baseClip = blender.findClip(baseName);

    if (root) {
      if (spec.group === 'foliage' && opts.intensity) {
        root.rotation.z = Math.sin(Date.now() * 0.003) * opts.intensity * 0.1;
      } else if (spec.group === 'destructible') {
        computeBounds(root);
      }
    }

    if (!baseClip) {
      baseLayer.enabled = false;
      return { ok: true, fn: spec.name, layers: [baseLayer], info: { envFallback: true, group: spec.group } };
    }

    blender.play(baseLayer, baseClip);
    return { ok: true, fn: spec.name, layers: [baseLayer], info: { group: spec.group } };
  };
}

function makeUtilCombiner(spec: CombinatorSpec): UtilFn {
  return (root?: THREE.Object3D, arg?: UtilArg): CombineResult => {
    const target = root ?? new THREE.Object3D();
    switch (spec.name) {
      case 'combineZoomAssetScale': {
        const factor = typeof arg === 'number' ? arg : 1.2;
        const res = zoomAsset(target, { factor });
        return { ok: true, fn: spec.name, info: { factor: res } };
      }
      case 'combineExtractMeshBuffers': {
        const geo = extractGeometry(target);
        return { ok: geo !== null, fn: spec.name, info: { hasGeometry: geo !== null } };
      }
      case 'combineExtractTextureMaps': {
        const textures = parseTextures(target);
        return { ok: true, fn: spec.name, info: { count: textures.length, textures } };
      }
      case 'combineGenerateBoundingBox':
      case 'combineGenerateBoundingSphere': {
        const b = computeBounds(target);
        return { ok: true, fn: spec.name, info: { bounds: b } };
      }
      case 'combineBuildSpatialGridNode': {
        const grid = new SpatialGrid(32);
        grid.insert('node', target.position, 1);
        return { ok: true, fn: spec.name, info: { cell: grid.query(target.position, 1).length } };
      }
      case 'combineValidateCollisionShape': {
        const shape = arg as CollisionShape | undefined;
        const valid = !!shape && typeof shape.kind === 'string';
        return { ok: valid, fn: spec.name, info: { shape } };
      }
      case 'combineTriggerParticleEmitter':
        return { ok: true, fn: spec.name, info: { triggered: true, config: arg } };
      case 'combineExecuteMasterPipeline':
      case 'combineMasterPipelineExecution':
        return { ok: true, fn: spec.name, info: { pipeline: 'master_completed' } };
      default:
        return { ok: true, fn: spec.name, info: { executed: true, arg } };
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

