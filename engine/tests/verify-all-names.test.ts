import { describe, it, expect } from 'vitest';
import { COMBINERS } from '../src/combiner/combine.js';

describe('Exact Verification of All User Prompt Combiners (450 Functions)', () => {
  const allNames = new Set(COMBINERS.map((c) => c.name));

  const promptNames = [
    // Group I: Movement (40)
    'combineIdleAndWalk', 'combineIdleAndRun', 'combineIdleAndSprint', 'combineIdleAndCrouch', 'combineIdleAndCrawl',
    'combineIdleAndSneak', 'combineIdleAndJump', 'combineIdleAndFall', 'combineIdleAndLand', 'combineIdleAndRoll',
    'combineSitAndIdle', 'combineSitAndRotate', 'combineSitAndStandUp', 'combineSitAndReach', 'combineSitAndLookAround',
    'combineCrouchAndWalk', 'combineCrouchAndRun', 'combineCrouchAndTurn', 'combineCrouchAndStop', 'combineCrouchAndLean',
    'combineRunAndJump', 'combineRunAndSlide', 'combineRunAndTurn', 'combineRunAndStumble', 'combineRunAndClimb',
    'combineWalkAndTurn', 'combineWalkAndStop', 'combineWalkAndLook', 'combineWalkAndStepBack', 'combineWalkAndSidestep',
    'combineSwimAndIdle', 'combineSwimAndMove', 'combineSwimAndDive', 'combineSwimAndSurface', 'combineSwimAndTread',
    'combineClimbAndIdle', 'combineClimbAndMoveUp', 'combineClimbAndMoveDown', 'combineClimbAndLeap', 'combineClimbAndRest',

    // Group II: Equipment & Combat (50)
    'attachWeaponToHand', 'attachShieldToArm', 'attachToolToBelt', 'attachBackpackToSpine', 'attachHelmetToHead',
    'combineIdleAndHoldWeapon', 'combineIdleAndHoldTool', 'combineIdleAndHoldTorch', 'combineIdleAndHoldBox', 'combineIdleAndHoldChild',
    'combineWalkAndHoldWeapon', 'combineWalkAndHoldTorch', 'combineWalkAndDragCorpse', 'combineWalkAndCarryBox', 'combineWalkAndPushCart',
    'combineRunAndHoldWeapon', 'combineRunAndHolster', 'combineCrouchAndHoldWeapon', 'combineCrouchAndAim', 'combineCrouchAndReload',
    'combineAttackAndMove', 'combineAttackAndJump', 'combineAttackAndCrouch', 'combineBlockAndWalk', 'combineBlockAndBackstep',
    'combineCastSkillAndStand', 'combineCastSkillAndWalk', 'combineHitReactionAndMove', 'combineHitReactionAndFall', 'combineDeathAndRagdoll',
    'combineDrinkAndWalk', 'combineEatAndStand', 'combineBandageAndCrouch', 'combineCraftAndSit', 'combineHarvestAndKneel',
    'combineLootAndBend', 'combineOpenChestAndReach', 'combinePlantAndKneel', 'combineSkinAnimalAndCrouch', 'combineIgniteAndKneel',
    'combineMountAndRide', 'combineRideAndSteer', 'combineRideAndAttack', 'combineRideAndJump', 'combineDismountAndLand',
    'combineLeadAnimalAndWalk', 'combinePetAnimalAndKneel', 'combineFeedAnimalAndReach', 'combineThrowItemAndRun', 'combineTrapAndKneel',

    // Group III: Environment, Survival & Animals (50)
    'combineFreezeAndShiver', 'combineOverheatAndWipe', 'combineStarveAndHunch', 'combineDehydrateAndStagger', 'combinePoisonAndCrawl',
    'combineSleepAndLayDown', 'combineWakeUpAndStretch', 'combineSneezeAndJerk', 'combineCoughAndBend', 'combineDrownAndFlail',
    'combineAnimalIdleAndTailFlick', 'combineAnimalIdleAndEarTwitch', 'combineAnimalWalkAndSniff', 'combineAnimalRunAndPounce',
    'combineAnimalHowlAndStand', 'combineAnimalSleepAndCurl', 'combineAnimalEatAndBow', 'combineAnimalDrinkAndKneel',
    'combineAnimalScratchesAndGround', 'combineAnimalShakeWaterAndStand', 'combineBirdFlyAndGlide', 'combineBirdPerchAndFold',
    'combineFishSwimAndTail', 'combineInsectCrawlingAndWall', 'combineReptileSlitherAndGround', 'combinePackLeaderAndHowl',
    'combineMonsterRageAndRoar', 'combineMonsterBurrowAndDig', 'combineMonsterEmergeAndLeap', 'combineMonsterTransformAndGlow',
    'combineMultiArmAttackAndSwing', 'combineWingFlapAndGust', 'combineTentacleWhipAndSway', 'combineSporeReleaseAndEmit',
    'combineStealthAndFade', 'combineShieldBreakAndStagger', 'combineParryAndCounter', 'combineGrappleAndPull', 'combineGrappleAndLaunch',
    'combineZipLineAndGlide', 'combineNetCaptureAndTrap', 'combineTameAnimalAndFeed', 'combineShearWoolAndKneel', 'combineMilkAnimalAndSquat',
    'combineHatchEggAndWarm', 'combineNestBuildAndGather', 'combineHidingAndBush', 'combineCamouflageAndMud', 'combineTorchWaveAndSare',
    'combineWhistleAndCall',

    // Group IV: Blend & Util (40 + 20)
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
    'combineZoomAssetScale', 'combineExtractMeshBuffers', 'combineExtractTextureMaps', 'combineGenerateBoundingBox',
    'combineGenerateBoundingSphere', 'combineOptimizeDrawCalls', 'combineSetupLevelOfDetail', 'combineAttachLightToSocket',
    'combineAttachAudioEmitter', 'combineBakeAnimationClips', 'combineMapCustomShaderToMaterial', 'combineBuildSpatialGridNode',
    'combineSerializeEntityState', 'combineDeserializeEntityState', 'combineValidateCollisionShape', 'combineCacheParsedAssetData',
    'combineDisposeUnusedAssets', 'combinePoolEntityInstance', 'combineTriggerParticleEmitter', 'combineExecuteMasterPipeline',

    // Part II: Group I (Creature - 25)
    'combineAnimalIdleAndTailWhip', 'combineAnimalWalkAndStalk', 'combineAnimalRunAndCharge', 'combineAnimalJumpAndPounce',
    'combineAnimalSleepAndSnore', 'combineAnimalEatAndChew', 'combineAnimalDrinkAndSplash', 'combineAnimalAttackAndClaw',
    'combineAnimalAttackAndBite', 'combineAnimalAttackAndTailSwipe', 'combineAnimalDefenseAndGrowl', 'combineAnimalDefenseAndCrouch',
    'combineAnimalHurtAndWhimper', 'combineAnimalDeathAndCollapse', 'combineMonsterIdleAndTentacleSway', 'combineMonsterWalkAndShakeGround',
    'combineMonsterRunAndStampede', 'combineMonsterAttackAndSlam', 'combineMonsterAttackAndSpitVenom', 'combineMonsterAttackAndBreathFire',
    'combineMonsterDefenseAndHardShell', 'combineMonsterHurtAndRetreat', 'combineMonsterDeathAndDissolve', 'combineMonsterSummonAndHowl',
    'combineMonsterRageAndBuff',

    // Part II: Group II (Ballistic - 25)
    'combineThrowAndAim', 'combineThrowAndRun', 'combineThrowAndJump', 'combineThrowAndSpin', 'combineThrowAndKneel',
    'combineShootAndAim', 'combineShootAndWalk', 'combineShootAndCrouch', 'combineShootAndRun', 'combineShootAndReload',
    'combineFlyAndGlide', 'combineFlyAndDive', 'combineFlyAndHover', 'combineFlyAndAccelerate', 'combineFlyAndBankTurn',
    'combineDiveAndSwim', 'combineDiveAndSurface', 'combineDiveAndAttack', 'combineDiveAndSearch', 'combineDiveAndEvade',
    'combineLaunchAndProjectile', 'combineRicochetAndBounce', 'combineExplodeAndDebris', 'combineRecoilAndStabilize',
    'combineTrackingAndTarget',

    // Part II: Group III (Acrobatic - 25)
    'combineSpinAndAttack', 'combineSpinAndDash', 'combineSpinAndJump', 'combineSpinAndFall', 'combineSpinAndLand',
    'combineRollAndEvade', 'combineRollAndSprint', 'combineRollAndJump', 'combineRollAndStop', 'combineRollAndShoot',
    'combineFlipAndJump', 'combineFlipAndAttack', 'combineFlipAndLand', 'combineFlipAndWallRun', 'combineFlipAndVault',
    'combineFallAndGrab', 'combineFallAndParachute', 'combineFallAndRoll', 'combineFallAndStagger', 'combineFallAndImpact',
    'combineRotateAndAim', 'combineRotateAndWalk', 'combineRotateAndRun', 'combineRotateAndCrouch', 'combineRotateAndShoot',

    // Part II: Group IV (Physics, Environment Transitions - 25)
    'combineWindPushAndLean', 'combineWaterCurrentAndDrift', 'combineMudSogAndSlow', 'combineIceSlipAndSlide', 'combineFireBurnAndPanic',
    'combinePoisonStaggerAndCrawl', 'combineLightningShockAndTremble', 'combineFreezeShiverAndKneel', 'combineSandstormShieldAndWalk',
    'combineEarthquakeStumbleAndFall', 'combineShadowMergeAndStealth', 'combineLightExposureAndBlind', 'combineEchoLocationAndSense',
    'combineAdrenalineRushAndSpeed', 'combineFatigueCollapseAndRest', 'combineArmorHeavyAndSlowWalk', 'combineWeaponWeightAndBalance',
    'combineShieldBlockAndKnockback', 'combineParrySuccessAndCounter', 'combineGrapplePullAndSwing', 'combineZiplineSlideAndBrake',
    'combineLadderClimbAndStep', 'combineLedgeHangAndShimmy', 'combineWallRunAndJumpOff', 'combineMasterPipelineExecution',

    // Humanoid 50 Functions (50)
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

    // Groups X to XVII: Environmental, Destruction, Foliage, Structure, Water, Wind, Props (100)
    'combineFractureAndShatter', 'combineCrumbleAndDebris', 'combineImpactAndCrater', 'combineCollapseAndDust',
    'combineExplosionAndFragments', 'combineStressAndFracture', 'combineBrittleSnapAndBreak', 'combineFallAndSmash',
    'combineStructuralFailure', 'combineDebrisBounceAndSettle',
    'combineTreeWindSway', 'combineTreeChopAndFall', 'combineBranchBendAndSnap', 'combineLeafRustleAndShed',
    'combineTrunkFractureAndTopple', 'combineFruitDropAndBounce', 'combineVineSwingAndClimb', 'combineBushRustleAndPart',
    'combineVegetationBurnAndAsh', 'combineFoliageTrampleAndRegrow',
    'combineWallBreachAndRubble', 'combineDoorSwingAndLatch', 'combineDoorKickAndSplinter', 'combineRoofCollapseAndFall',
    'combinePillarToppleAndCrush', 'combineWindowShatterAndShards', 'combineGateLowerAndLock', 'combineBridgeCollapseAndSnap',
    'combineFloorBreakAndPlunge', 'combineStairsCrumbleAndSlide',
    'combineWaterSplashAndRipples', 'combineWaterCurrentAndBuoyancy', 'combineWaterSubmergeAndDrag', 'combineWaterSurfaceTensionAndFloat',
    'combineWaterfallSprayAndMist', 'combineWaveCrashAndFoam', 'combineWaterVortexAndWhirlpool', 'combineUnderseaPressureAndCurrent',
    'combinePuddleSplashAndStain', 'combineFreezingWaterAndIceFormation',
    'combineAirGustAndBuffet', 'combineVortexSpinAndLift', 'combineUpdraftAndFloat', 'combineDraftAndFlicker',
    'combineShockwaveAndConcussion', 'combineVacuumPullAndImplode', 'combineThermalDraftAndRise', 'combineGaleForceAndDeflect',
    'combineTurbulenceAndStagger', 'combineBreezeAndFloat',
    'combineRockSlideAndTumble', 'combineEarthTremorAndFissure', 'combineMudSuctionAndStick', 'combineQuicksandSinkAndStruggle',
    'combineBoulderRollAndCrush', 'combineSoilExcavateAndMound', 'combineLavaFlowAndSolidify', 'combineSandDuneDriftAndSlide',
    'combineCrystalSpikeErupt', 'combineBedrockCrackAndShake',
    'combineButtonPressAndTrigger', 'combineLeverPullAndActivate', 'combineSwitchFlipAndPower', 'combinePressurePlateStepAndDepress',
    'combineChestOpenAndCreak', 'combineChestLockAndUnlock', 'combineCrateSmashAndLoot', 'combineBarrelRollAndExplode',
    'combineTrapTriggerAndSpring', 'combinePulleyHoistAndLift', 'combineGearRotateAndMesh', 'combineChainPullAndRattle',
    'combinePedestalActivateAndGlow', 'combineTorchMountAndBurn', 'combineRelicSlotAndAnchor',
    'combineAnimalHerdMoveAndGraze', 'combineAnimalPredatorStalkAndSpring', 'combineAnimalPreyFleeAndScatter', 'combineAnimalMotherProtectAndNurture',
    'combineAnimalAlertAndScan', 'combineAnimalPlayAndTumble', 'combineAnimalMarkTerritory', 'combineAnimalDigBurrow',
    'combineAnimalBaskAndWarm', 'combineAnimalHibernateAndBreathe',
  ];

  it('contains every single function name explicitly mentioned in user prompt', () => {
    const missing: string[] = [];
    for (const name of promptNames) {
      if (!allNames.has(name)) {
        missing.push(name);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has at least 450 total combiners', () => {
    expect(COMBINERS.length).toBeGreaterThanOrEqual(450);
  });
});
