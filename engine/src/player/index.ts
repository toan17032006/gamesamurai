/**
 * @file index.ts
 * @module @aetheria/engine/player
 * @description Master entry point exporting RealisticHumanPlayer and all 400 standalone functions.
 */

import { RealisticHumanPlayer } from './realistic-human-player.js';
import { HumanPlayerConfig, Vec3, Quat4, BodyPosture, FacialExpressionType, VisemeType, HandFingerState } from './types.js';

export * from './types.js';
export * from './realistic-human-player.js';

let defaultPlayer: RealisticHumanPlayer | null = null;

export function getActivePlayer(): RealisticHumanPlayer {
  if (!defaultPlayer) {
    defaultPlayer = new RealisticHumanPlayer();
    defaultPlayer.initializePlayer();
  }
  return defaultPlayer;
}

export function setActivePlayer(player: RealisticHumanPlayer): void {
  defaultPlayer = player;
}

function resolvePlayer(p?: RealisticHumanPlayer): RealisticHumanPlayer {
  return p ?? getActivePlayer();
}

// ============================================================================
// 001–020. Khởi tạo, vòng đời và trạng thái Player
// ============================================================================

export function createPlayer(config?: Partial<HumanPlayerConfig>): RealisticHumanPlayer {
  const p = new RealisticHumanPlayer(config);
  p.createPlayer();
  setActivePlayer(p);
  return p;
}

export function initializePlayer(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).initializePlayer(); }
export function destroyPlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).destroyPlayer(); }
export function resetPlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).resetPlayer(); }
export function respawnPlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).respawnPlayer(); }
export function updatePlayer(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePlayer(deltaTime); }
export function lateUpdatePlayer(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).lateUpdatePlayer(deltaTime); }
export function fixedUpdatePlayer(fixedDeltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).fixedUpdatePlayer(fixedDeltaTime); }
export function setPlayerConfig(config: Partial<HumanPlayerConfig>, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerConfig(config); }
export function getPlayerConfig(p?: RealisticHumanPlayer): HumanPlayerConfig { return resolvePlayer(p).getPlayerConfig(); }
export function getPlayerState(p?: RealisticHumanPlayer): Record<string, any> { return resolvePlayer(p).getPlayerState(); }
export function setPlayerState(state: Record<string, any>, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerState(state); }
export function savePlayerState(p?: RealisticHumanPlayer): string { return resolvePlayer(p).savePlayerState(); }
export function restorePlayerState(state: string | Record<string, any>, p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).restorePlayerState(state); }
export function pausePlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).pausePlayer(); }
export function resumePlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).resumePlayer(); }
export function enablePlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).enablePlayer(); }
export function disablePlayer(p?: RealisticHumanPlayer): void { resolvePlayer(p).disablePlayer(); }
export function validatePlayerState(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).validatePlayerState(); }
export function disposePlayerResources(p?: RealisticHumanPlayer): void { resolvePlayer(p).disposePlayerResources(); }

// ============================================================================
// 021–040. Mô hình 3D, da, vật liệu và ngoại hình
// ============================================================================

export function loadPlayerModel(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).loadPlayerModel(); }
export function createPlayerMesh(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).createPlayerMesh(); }
export function initializePlayerMaterials(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).initializePlayerMaterials(); }
export function loadPlayerTextures(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).loadPlayerTextures(); }
export function loadPlayerNormalMaps(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).loadPlayerNormalMaps(); }
export function loadPlayerRoughnessMaps(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).loadPlayerRoughnessMaps(); }
export function setupPlayerRenderer(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).setupPlayerRenderer(); }
export function setupPlayerSkeleton(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).setupPlayerSkeleton(); }
export function setupPlayerRig(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).setupPlayerRig(); }
export function updatePlayerAppearance(p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePlayerAppearance(); }
export function setPlayerSkinColor(color: string, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerSkinColor(color); }
export function setPlayerHairStyle(style: string, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerHairStyle(style); }
export function setPlayerEyeColor(color: string, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerEyeColor(color); }
export function setPlayerBodyShape(shape: 'lean' | 'athletic' | 'muscular' | 'heavy' | 'slim', p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerBodyShape(shape); }
export function setPlayerHeight(height: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerHeight(height); }
export function setPlayerWeight(weight: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerWeight(weight); }
export function setPlayerScale(scale: Vec3 | number, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerScale(scale); }
export function setPlayerVisibility(visible: boolean, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerVisibility(visible); }
export function setPlayerOpacity(opacity: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).setPlayerOpacity(opacity); }
export function updatePlayerShading(p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePlayerShading(); }

// ============================================================================
// 041–060. Hệ xương, khớp và giải phẫu chuyển động
// ============================================================================

export function initializeSkeleton(p?: RealisticHumanPlayer): void { resolvePlayer(p).initializeSkeleton(); }
export function updateSkeleton(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateSkeleton(); }
export function updateBoneTransforms(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateBoneTransforms(); }
export function updateRootBone(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateRootBone(); }
export function updateSpine(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateSpine(); }
export function updateChest(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateChest(); }
export function updateNeck(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateNeck(); }
export function updateHeadBone(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateHeadBone(); }
export function updateShoulderBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateShoulderBones(); }
export function updateUpperArmBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateUpperArmBones(); }
export function updateElbowBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateElbowBones(); }
export function updateForearmBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateForearmBones(); }
export function updateWristBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateWristBones(); }
export function updateHipBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateHipBones(); }
export function updateThighBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateThighBones(); }
export function updateKneeBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateKneeBones(); }
export function updateShinBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateShinBones(); }
export function updateAnkleBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateAnkleBones(); }
export function updateToeBones(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateToeBones(); }
export function constrainJointRotations(p?: RealisticHumanPlayer): void { resolvePlayer(p).constrainJointRotations(); }

// ============================================================================
// 061–080. Di chuyển, xoay người và điều khiển hướng
// ============================================================================

export function movePlayer(direction: Vec3, speed?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).movePlayer(direction, speed); }
export function movePlayerForward(speed?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).movePlayerForward(speed); }
export function movePlayerBackward(speed?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).movePlayerBackward(speed); }
export function movePlayerLeft(speed?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).movePlayerLeft(speed); }
export function movePlayerRight(speed?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).movePlayerRight(speed); }
export function stopPlayerMovement(p?: RealisticHumanPlayer): void { resolvePlayer(p).stopPlayerMovement(); }
export function setMovementDirection(direction: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).setMovementDirection(direction); }
export function rotatePlayer(angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePlayer(angle); }
export function rotatePlayerSmoothly(targetAngle: number, deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePlayerSmoothly(targetAngle, deltaTime); }
export function turnPlayerLeft(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).turnPlayerLeft(angle); }
export function turnPlayerRight(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).turnPlayerRight(angle); }
export function turnPlayerAround(p?: RealisticHumanPlayer): void { resolvePlayer(p).turnPlayerAround(); }
export function acceleratePlayer(amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).acceleratePlayer(amount); }
export function deceleratePlayer(amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).deceleratePlayer(amount); }
export function calculateMovementSpeed(p?: RealisticHumanPlayer): number { return resolvePlayer(p).calculateMovementSpeed(); }
export function calculateMovementDirection(p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).calculateMovementDirection(); }
export function updateMovement(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateMovement(deltaTime); }
export function smoothMovementTransition(p?: RealisticHumanPlayer): void { resolvePlayer(p).smoothMovementTransition(); }
export function predictNextPosition(timeAhead?: number, p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).predictNextPosition(timeAhead); }
export function applyMovementInput(input: { x: number; y: number }, p?: RealisticHumanPlayer): void { resolvePlayer(p).applyMovementInput(input); }

// ============================================================================
// 081–100. Đi bộ, chạy, bước chân và dáng đi
// ============================================================================

export function startWalking(p?: RealisticHumanPlayer): void { resolvePlayer(p).startWalking(); }
export function stopWalking(p?: RealisticHumanPlayer): void { resolvePlayer(p).stopWalking(); }
export function walkForward(p?: RealisticHumanPlayer): void { resolvePlayer(p).walkForward(); }
export function walkBackward(p?: RealisticHumanPlayer): void { resolvePlayer(p).walkBackward(); }
export function walkSidewaysLeft(p?: RealisticHumanPlayer): void { resolvePlayer(p).walkSidewaysLeft(); }
export function walkSidewaysRight(p?: RealisticHumanPlayer): void { resolvePlayer(p).walkSidewaysRight(); }
export function startRunning(p?: RealisticHumanPlayer): void { resolvePlayer(p).startRunning(); }
export function stopRunning(p?: RealisticHumanPlayer): void { resolvePlayer(p).stopRunning(); }
export function startSprinting(p?: RealisticHumanPlayer): void { resolvePlayer(p).startSprinting(); }
export function stopSprinting(p?: RealisticHumanPlayer): void { resolvePlayer(p).stopSprinting(); }
export function updateGait(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateGait(); }
export function updateWalkCycle(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateWalkCycle(); }
export function updateRunCycle(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateRunCycle(); }
export function updateStrideLength(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateStrideLength(); }
export function updateStepFrequency(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateStepFrequency(); }
export function updateFootPlacement(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateFootPlacement(); }
export function updateHeelStrike(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateHeelStrike(); }
export function updateToeOff(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateToeOff(); }
export function updateArmSwing(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateArmSwing(); }
export function preventFootSliding(p?: RealisticHumanPlayer): void { resolvePlayer(p).preventFootSliding(); }

// ============================================================================
// 101–120. Nhảy, tiếp đất, cúi người và giữ thăng bằng
// ============================================================================

export function jump(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).jump(); }
export function performDoubleJump(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).performDoubleJump(); }
export function prepareForJump(p?: RealisticHumanPlayer): void { resolvePlayer(p).prepareForJump(); }
export function calculateJumpTrajectory(timeAhead?: number, p?: RealisticHumanPlayer): Vec3[] { return resolvePlayer(p).calculateJumpTrajectory(timeAhead); }
export function updateJumpMotion(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateJumpMotion(); }
export function detectLanding(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).detectLanding(); }
export function land(p?: RealisticHumanPlayer): void { resolvePlayer(p).land(); }
export function absorbLandingImpact(p?: RealisticHumanPlayer): void { resolvePlayer(p).absorbLandingImpact(); }
export function recoverFromLanding(p?: RealisticHumanPlayer): void { resolvePlayer(p).recoverFromLanding(); }
export function startCrouching(p?: RealisticHumanPlayer): void { resolvePlayer(p).startCrouching(); }
export function stopCrouching(p?: RealisticHumanPlayer): void { resolvePlayer(p).stopCrouching(); }
export function crouchWalk(p?: RealisticHumanPlayer): void { resolvePlayer(p).crouchWalk(); }
export function bendForward(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendForward(amount); }
export function leanBackward(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).leanBackward(amount); }
export function leanLeft(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).leanLeft(amount); }
export function leanRight(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).leanRight(amount); }
export function calculateCenterOfMass(p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).calculateCenterOfMass(); }
export function maintainBalance(p?: RealisticHumanPlayer): void { resolvePlayer(p).maintainBalance(); }
export function recoverBalance(p?: RealisticHumanPlayer): void { resolvePlayer(p).recoverBalance(); }
export function updateBodyInertia(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateBodyInertia(); }

// ============================================================================
// 121–140. Cánh tay, vai, khuỷu tay và cổ tay
// ============================================================================

export function raiseLeftArm(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).raiseLeftArm(angle); }
export function raiseRightArm(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).raiseRightArm(angle); }
export function lowerLeftArm(p?: RealisticHumanPlayer): void { resolvePlayer(p).lowerLeftArm(); }
export function lowerRightArm(p?: RealisticHumanPlayer): void { resolvePlayer(p).lowerRightArm(); }
export function extendLeftArm(p?: RealisticHumanPlayer): void { resolvePlayer(p).extendLeftArm(); }
export function extendRightArm(p?: RealisticHumanPlayer): void { resolvePlayer(p).extendRightArm(); }
export function bendLeftElbow(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendLeftElbow(angle); }
export function bendRightElbow(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendRightElbow(angle); }
export function straightenLeftElbow(p?: RealisticHumanPlayer): void { resolvePlayer(p).straightenLeftElbow(); }
export function straightenRightElbow(p?: RealisticHumanPlayer): void { resolvePlayer(p).straightenRightElbow(); }
export function rotateLeftShoulder(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateLeftShoulder(angle); }
export function rotateRightShoulder(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateRightShoulder(angle); }
export function shrugShoulders(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).shrugShoulders(amount); }
export function relaxShoulders(p?: RealisticHumanPlayer): void { resolvePlayer(p).relaxShoulders(); }
export function rotateLeftForearm(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateLeftForearm(angle); }
export function rotateRightForearm(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateRightForearm(angle); }
export function rotateLeftWrist(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateLeftWrist(angle); }
export function rotateRightWrist(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateRightWrist(angle); }
export function reachWithLeftHand(target: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).reachWithLeftHand(target); }
export function reachWithRightHand(target: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).reachWithRightHand(target); }

// ============================================================================
// 141–160. Bàn tay, lòng bàn tay và cử chỉ thông thường
// ============================================================================

export function openLeftHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).openLeftHand(); }
export function openRightHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).openRightHand(); }
export function closeLeftHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).closeLeftHand(); }
export function closeRightHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).closeRightHand(); }
export function makeLeftFist(p?: RealisticHumanPlayer): void { resolvePlayer(p).makeLeftFist(); }
export function makeRightFist(p?: RealisticHumanPlayer): void { resolvePlayer(p).makeRightFist(); }
export function relaxLeftHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).relaxLeftHand(); }
export function relaxRightHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).relaxRightHand(); }
export function rotatePalmUp(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePalmUp(hand); }
export function rotatePalmDown(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePalmDown(hand); }
export function rotatePalmInward(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePalmInward(hand); }
export function rotatePalmOutward(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).rotatePalmOutward(hand); }
export function waveLeftHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).waveLeftHand(); }
export function waveRightHand(p?: RealisticHumanPlayer): void { resolvePlayer(p).waveRightHand(); }
export function raiseHandToGreet(p?: RealisticHumanPlayer): void { resolvePlayer(p).raiseHandToGreet(); }
export function performStopGesture(p?: RealisticHumanPlayer): void { resolvePlayer(p).performStopGesture(); }
export function performComeHereGesture(p?: RealisticHumanPlayer): void { resolvePlayer(p).performComeHereGesture(); }
export function performGoodbyeGesture(p?: RealisticHumanPlayer): void { resolvePlayer(p).performGoodbyeGesture(); }
export function performThumbsUp(p?: RealisticHumanPlayer): void { resolvePlayer(p).performThumbsUp(); }
export function performShrugGesture(p?: RealisticHumanPlayer): void { resolvePlayer(p).performShrugGesture(); }

// ============================================================================
// 161–180. Hoạt ảnh chi tiết từng ngón tay
// ============================================================================

export function curlThumb(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).curlThumb(hand, amount); }
export function extendThumb(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).extendThumb(hand); }
export function bendThumbTip(hand: 'left' | 'right', angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendThumbTip(hand, angle); }
export function spreadThumb(hand: 'left' | 'right', angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).spreadThumb(hand, angle); }
export function curlIndexFinger(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).curlIndexFinger(hand, amount); }
export function extendIndexFinger(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).extendIndexFinger(hand); }
export function bendIndexMiddleJoint(hand: 'left' | 'right', angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendIndexMiddleJoint(hand, angle); }
export function bendIndexTipJoint(hand: 'left' | 'right', angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendIndexTipJoint(hand, angle); }
export function curlMiddleFinger(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).curlMiddleFinger(hand, amount); }
export function extendMiddleFinger(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).extendMiddleFinger(hand); }
export function bendMiddleFingerJoints(hand: 'left' | 'right', angles: number[], p?: RealisticHumanPlayer): void { resolvePlayer(p).bendMiddleFingerJoints(hand, angles); }
export function curlRingFinger(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).curlRingFinger(hand, amount); }
export function extendRingFinger(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).extendRingFinger(hand); }
export function bendRingFingerJoints(hand: 'left' | 'right', angles: number[], p?: RealisticHumanPlayer): void { resolvePlayer(p).bendRingFingerJoints(hand, angles); }
export function curlLittleFinger(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).curlLittleFinger(hand, amount); }
export function extendLittleFinger(hand: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).extendLittleFinger(hand); }
export function bendLittleFingerJoints(hand: 'left' | 'right', angles: number[], p?: RealisticHumanPlayer): void { resolvePlayer(p).bendLittleFingerJoints(hand, angles); }
export function spreadFingers(hand: 'left' | 'right', amount: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).spreadFingers(hand, amount); }
export function formNaturalHandPose(hand: 'left' | 'right', pose?: string, p?: RealisticHumanPlayer): void { resolvePlayer(p).formNaturalHandPose(hand, pose); }
export function blendFingerAnimations(hand: 'left' | 'right', targetPose: HandFingerState, weight: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).blendFingerAnimations(hand, targetPose, weight); }

// ============================================================================
// 181–200. Cầm, nắm, chạm và thao tác bằng tay
// ============================================================================

export function gripObject(object: any, hand?: 'left' | 'right', p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).gripObject(object, hand); }
export function releaseObject(object?: any, hand?: 'left' | 'right', p?: RealisticHumanPlayer): any { return resolvePlayer(p).releaseObject(object, hand); }
export function pickUpObject(object: any, p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).pickUpObject(object); }
export function putDownObject(object?: any, p?: RealisticHumanPlayer): any { return resolvePlayer(p).putDownObject(object); }
export function holdObject(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).holdObject(object); }
export function transferObjectBetweenHands(object?: any, p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).transferObjectBetweenHands(object); }
export function rotateObjectInHand(object: any, rotation: Quat4, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateObjectInHand(object, rotation); }
export function inspectObject(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).inspectObject(object); }
export function pointAtObject(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pointAtObject(object); }
export function touchObject(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).touchObject(object); }
export function pressObject(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pressObject(object); }
export function pullObjectWithHand(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pullObjectWithHand(object); }
export function pushObjectWithHand(object: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pushObjectWithHand(object); }
export function turnDoorHandle(handle: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).turnDoorHandle(handle); }
export function openDoorWithHand(door: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).openDoorWithHand(door); }
export function closeDoorWithHand(door: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).closeDoorWithHand(door); }
export function pressKeyboardKey(key: string, p?: RealisticHumanPlayer): void { resolvePlayer(p).pressKeyboardKey(key); }
export function tapTouchscreen(position: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).tapTouchscreen(position); }
export function operateMouse(mouse: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).operateMouse(mouse); }
export function adjustGripPressure(object: any, pressure: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).adjustGripPressure(object, pressure); }

// ============================================================================
// 201–220. Chân, đầu gối, cổ chân và ngón chân
// ============================================================================

export function liftLeftLeg(p?: RealisticHumanPlayer): void { resolvePlayer(p).liftLeftLeg(); }
export function liftRightLeg(p?: RealisticHumanPlayer): void { resolvePlayer(p).liftRightLeg(); }
export function extendLeftLeg(p?: RealisticHumanPlayer): void { resolvePlayer(p).extendLeftLeg(); }
export function extendRightLeg(p?: RealisticHumanPlayer): void { resolvePlayer(p).extendRightLeg(); }
export function bendLeftKnee(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendLeftKnee(angle); }
export function bendRightKnee(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).bendRightKnee(angle); }
export function straightenLeftKnee(p?: RealisticHumanPlayer): void { resolvePlayer(p).straightenLeftKnee(); }
export function straightenRightKnee(p?: RealisticHumanPlayer): void { resolvePlayer(p).straightenRightKnee(); }
export function rotateLeftHip(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateLeftHip(angle); }
export function rotateRightHip(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateRightHip(angle); }
export function abductLeftLeg(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).abductLeftLeg(angle); }
export function abductRightLeg(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).abductRightLeg(angle); }
export function rotateLeftAnkle(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateLeftAnkle(angle); }
export function rotateRightAnkle(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateRightAnkle(angle); }
export function flexLeftFoot(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).flexLeftFoot(angle); }
export function flexRightFoot(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).flexRightFoot(angle); }
export function pointLeftToes(p?: RealisticHumanPlayer): void { resolvePlayer(p).pointLeftToes(); }
export function pointRightToes(p?: RealisticHumanPlayer): void { resolvePlayer(p).pointRightToes(); }
export function curlToes(foot: 'left' | 'right', p?: RealisticHumanPlayer): void { resolvePlayer(p).curlToes(foot); }
export function updateLegWeightDistribution(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateLegWeightDistribution(); }

// ============================================================================
// 221–240. Ngồi, đứng, quỳ, nằm và thay đổi tư thế
// ============================================================================

export function standUp(p?: RealisticHumanPlayer): void { resolvePlayer(p).standUp(); }
export function sitDown(p?: RealisticHumanPlayer): void { resolvePlayer(p).sitDown(); }
export function sitOnChair(chair?: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).sitOnChair(chair); }
export function standFromChair(chair?: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).standFromChair(chair); }
export function sitOnGround(p?: RealisticHumanPlayer): void { resolvePlayer(p).sitOnGround(); }
export function standFromGround(p?: RealisticHumanPlayer): void { resolvePlayer(p).standFromGround(); }
export function kneelDown(p?: RealisticHumanPlayer): void { resolvePlayer(p).kneelDown(); }
export function standFromKneeling(p?: RealisticHumanPlayer): void { resolvePlayer(p).standFromKneeling(); }
export function lieDown(p?: RealisticHumanPlayer): void { resolvePlayer(p).lieDown(); }
export function lieOnBack(p?: RealisticHumanPlayer): void { resolvePlayer(p).lieOnBack(); }
export function lieOnStomach(p?: RealisticHumanPlayer): void { resolvePlayer(p).lieOnStomach(); }
export function lieOnLeftSide(p?: RealisticHumanPlayer): void { resolvePlayer(p).lieOnLeftSide(); }
export function lieOnRightSide(p?: RealisticHumanPlayer): void { resolvePlayer(p).lieOnRightSide(); }
export function rollOver(p?: RealisticHumanPlayer): void { resolvePlayer(p).rollOver(); }
export function getOutOfBed(p?: RealisticHumanPlayer): void { resolvePlayer(p).getOutOfBed(); }
export function getIntoBed(p?: RealisticHumanPlayer): void { resolvePlayer(p).getIntoBed(); }
export function crossLegs(p?: RealisticHumanPlayer): void { resolvePlayer(p).crossLegs(); }
export function uncrossLegs(p?: RealisticHumanPlayer): void { resolvePlayer(p).uncrossLegs(); }
export function shiftSittingPosition(p?: RealisticHumanPlayer): void { resolvePlayer(p).shiftSittingPosition(); }
export function transitionBetweenPoses(fromPose: BodyPosture, toPose: BodyPosture, p?: RealisticHumanPlayer): void { resolvePlayer(p).transitionBetweenPoses(fromPose, toPose); }

// ============================================================================
// 241–260. Đầu, cổ, mắt và hướng nhìn
// ============================================================================

export function rotateHeadLeft(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateHeadLeft(angle); }
export function rotateHeadRight(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).rotateHeadRight(angle); }
export function tiltHeadLeft(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).tiltHeadLeft(angle); }
export function tiltHeadRight(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).tiltHeadRight(angle); }
export function nodHead(p?: RealisticHumanPlayer): void { resolvePlayer(p).nodHead(); }
export function shakeHead(p?: RealisticHumanPlayer): void { resolvePlayer(p).shakeHead(); }
export function tiltHeadForward(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).tiltHeadForward(angle); }
export function tiltHeadBackward(angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).tiltHeadBackward(angle); }
export function lookAtTarget(target: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).lookAtTarget(target); }
export function lookForward(p?: RealisticHumanPlayer): void { resolvePlayer(p).lookForward(); }
export function lookLeft(p?: RealisticHumanPlayer): void { resolvePlayer(p).lookLeft(); }
export function lookRight(p?: RealisticHumanPlayer): void { resolvePlayer(p).lookRight(); }
export function lookUp(p?: RealisticHumanPlayer): void { resolvePlayer(p).lookUp(); }
export function lookDown(p?: RealisticHumanPlayer): void { resolvePlayer(p).lookDown(); }
export function moveEyesToTarget(target: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).moveEyesToTarget(target); }
export function moveLeftEye(direction: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).moveLeftEye(direction); }
export function moveRightEye(direction: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).moveRightEye(direction); }
export function synchronizeEyeDirection(p?: RealisticHumanPlayer): void { resolvePlayer(p).synchronizeEyeDirection(); }
export function trackMovingTarget(target: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).trackMovingTarget(target); }
export function updateGazeBehavior(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateGazeBehavior(deltaTime); }

// ============================================================================
// 261–280. Chớp mắt, mí mắt, đồng tử và biểu cảm khuôn mặt
// ============================================================================

export function blinkEyes(p?: RealisticHumanPlayer): void { resolvePlayer(p).blinkEyes(); }
export function blinkLeftEye(p?: RealisticHumanPlayer): void { resolvePlayer(p).blinkLeftEye(); }
export function blinkRightEye(p?: RealisticHumanPlayer): void { resolvePlayer(p).blinkRightEye(); }
export function closeEyes(p?: RealisticHumanPlayer): void { resolvePlayer(p).closeEyes(); }
export function openEyes(p?: RealisticHumanPlayer): void { resolvePlayer(p).openEyes(); }
export function squintEyes(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).squintEyes(amount); }
export function widenEyes(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).widenEyes(amount); }
export function raiseUpperEyelids(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).raiseUpperEyelids(amount); }
export function lowerUpperEyelids(amount?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).lowerUpperEyelids(amount); }
export function updatePupilSize(size: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePupilSize(size); }
export function updatePupilDirection(direction: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePupilDirection(direction); }
export function simulateEyeSaccade(p?: RealisticHumanPlayer): void { resolvePlayer(p).simulateEyeSaccade(); }
export function simulateEyeMicroMovement(p?: RealisticHumanPlayer): void { resolvePlayer(p).simulateEyeMicroMovement(); }
export function raiseEyebrows(p?: RealisticHumanPlayer): void { resolvePlayer(p).raiseEyebrows(); }
export function lowerEyebrows(p?: RealisticHumanPlayer): void { resolvePlayer(p).lowerEyebrows(); }
export function furrowBrows(p?: RealisticHumanPlayer): void { resolvePlayer(p).furrowBrows(); }
export function relaxBrows(p?: RealisticHumanPlayer): void { resolvePlayer(p).relaxBrows(); }
export function setFacialExpression(expression: FacialExpressionType, p?: RealisticHumanPlayer): void { resolvePlayer(p).setFacialExpression(expression); }
export function blendFacialExpressions(from: FacialExpressionType, to: FacialExpressionType, weight: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).blendFacialExpressions(from, to, weight); }
export function updateFacialMuscles(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateFacialMuscles(); }

// ============================================================================
// 281–300. Miệng, môi, hàm, nói chuyện và cảm xúc
// ============================================================================

export function openMouth(p?: RealisticHumanPlayer): void { resolvePlayer(p).openMouth(); }
export function closeMouth(p?: RealisticHumanPlayer): void { resolvePlayer(p).closeMouth(); }
export function smile(p?: RealisticHumanPlayer): void { resolvePlayer(p).smile(); }
export function smileNaturally(p?: RealisticHumanPlayer): void { resolvePlayer(p).smileNaturally(); }
export function laugh(p?: RealisticHumanPlayer): void { resolvePlayer(p).laugh(); }
export function frown(p?: RealisticHumanPlayer): void { resolvePlayer(p).frown(); }
export function poutLips(p?: RealisticHumanPlayer): void { resolvePlayer(p).poutLips(); }
export function purseLips(p?: RealisticHumanPlayer): void { resolvePlayer(p).purseLips(); }
export function stretchLips(p?: RealisticHumanPlayer): void { resolvePlayer(p).stretchLips(); }
export function moveJaw(angle: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).moveJaw(angle); }
export function chew(p?: RealisticHumanPlayer): void { resolvePlayer(p).chew(); }
export function swallow(p?: RealisticHumanPlayer): void { resolvePlayer(p).swallow(); }
export function yawn(p?: RealisticHumanPlayer): void { resolvePlayer(p).yawn(); }
export function gasp(p?: RealisticHumanPlayer): void { resolvePlayer(p).gasp(); }
export function sigh(p?: RealisticHumanPlayer): void { resolvePlayer(p).sigh(); }
export function speak(p?: RealisticHumanPlayer): void { resolvePlayer(p).speak(); }
export function updateLipSync(audioData?: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateLipSync(audioData); }
export function pronounceViseme(viseme: VisemeType, p?: RealisticHumanPlayer): void { resolvePlayer(p).pronounceViseme(viseme); }
export function expressEmotion(emotion: string, intensity?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).expressEmotion(emotion, intensity); }
export function transitionEmotion(fromEmotion: string, toEmotion: string, duration?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).transitionEmotion(fromEmotion, toEmotion, duration); }

// ============================================================================
// 301–320. Hành động đời thường
// ============================================================================

export function breathe(p?: RealisticHumanPlayer): void { resolvePlayer(p).breathe(); }
export function updateBreathingCycle(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateBreathingCycle(deltaTime); }
export function takeDeepBreath(p?: RealisticHumanPlayer): void { resolvePlayer(p).takeDeepBreath(); }
export function cough(p?: RealisticHumanPlayer): void { resolvePlayer(p).cough(); }
export function sneeze(p?: RealisticHumanPlayer): void { resolvePlayer(p).sneeze(); }
export function sniff(p?: RealisticHumanPlayer): void { resolvePlayer(p).sniff(); }
export function scratchHead(p?: RealisticHumanPlayer): void { resolvePlayer(p).scratchHead(); }
export function scratchFace(p?: RealisticHumanPlayer): void { resolvePlayer(p).scratchFace(); }
export function rubEyes(p?: RealisticHumanPlayer): void { resolvePlayer(p).rubEyes(); }
export function wipeForehead(p?: RealisticHumanPlayer): void { resolvePlayer(p).wipeForehead(); }
export function touchChin(p?: RealisticHumanPlayer): void { resolvePlayer(p).touchChin(); }
export function strokeBeard(p?: RealisticHumanPlayer): void { resolvePlayer(p).strokeBeard(); }
export function brushHair(p?: RealisticHumanPlayer): void { resolvePlayer(p).brushHair(); }
export function adjustGlasses(p?: RealisticHumanPlayer): void { resolvePlayer(p).adjustGlasses(); }
export function adjustClothing(p?: RealisticHumanPlayer): void { resolvePlayer(p).adjustClothing(); }
export function stretchArms(p?: RealisticHumanPlayer): void { resolvePlayer(p).stretchArms(); }
export function stretchLegs(p?: RealisticHumanPlayer): void { resolvePlayer(p).stretchLegs(); }
export function crackKnuckles(p?: RealisticHumanPlayer): void { resolvePlayer(p).crackKnuckles(); }
export function rubHandsTogether(p?: RealisticHumanPlayer): void { resolvePlayer(p).rubHandsTogether(); }
export function performIdleFidget(p?: RealisticHumanPlayer): void { resolvePlayer(p).performIdleFidget(); }

// ============================================================================
// 321–340. Ăn uống, uống nước và thao tác với đồ vật
// ============================================================================

export function pickUpFood(food: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pickUpFood(food); }
export function bringFoodToMouth(food: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).bringFoodToMouth(food); }
export function takeBite(food: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).takeBite(food); }
export function chewFood(p?: RealisticHumanPlayer): void { resolvePlayer(p).chewFood(); }
export function swallowFood(p?: RealisticHumanPlayer): void { resolvePlayer(p).swallowFood(); }
export function putDownFood(food?: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).putDownFood(food); }
export function pickUpCup(cup: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pickUpCup(cup); }
export function liftCupToMouth(cup: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).liftCupToMouth(cup); }
export function drinkFromCup(cup: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).drinkFromCup(cup); }
export function tiltCupWhileDrinking(cup: any, angle?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).tiltCupWhileDrinking(cup, angle); }
export function lowerCup(cup: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).lowerCup(cup); }
export function wipeMouth(p?: RealisticHumanPlayer): void { resolvePlayer(p).wipeMouth(); }
export function holdSpoon(spoon: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).holdSpoon(spoon); }
export function scoopFood(spoon: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).scoopFood(spoon); }
export function useFork(fork: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).useFork(fork); }
export function cutFoodWithKnife(food: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).cutFoodWithKnife(food); }
export function pourLiquid(container: any, target: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pourLiquid(container, target); }
export function openBottle(bottle: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).openBottle(bottle); }
export function closeBottle(bottle: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).closeBottle(bottle); }
export function washHands(p?: RealisticHumanPlayer): void { resolvePlayer(p).washHands(); }

// ============================================================================
// 341–360. Tương tác môi trường và hành động phức hợp
// ============================================================================

export function detectNearbyObjects(radius?: number, p?: RealisticHumanPlayer): any[] { return resolvePlayer(p).detectNearbyObjects(radius); }
export function detectObstacles(p?: RealisticHumanPlayer): any[] { return resolvePlayer(p).detectObstacles(); }
export function detectGroundSurface(p?: RealisticHumanPlayer): string { return resolvePlayer(p).detectGroundSurface(); }
export function detectInteractableObjects(p?: RealisticHumanPlayer): any[] { return resolvePlayer(p).detectInteractableObjects(); }
export function calculateDistanceToTarget(target: Vec3, p?: RealisticHumanPlayer): number { return resolvePlayer(p).calculateDistanceToTarget(target); }
export function avoidObstacle(obstacle: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).avoidObstacle(obstacle); }
export function findPathToTarget(target: Vec3, p?: RealisticHumanPlayer): Vec3[] { return resolvePlayer(p).findPathToTarget(target); }
export function openWindow(window: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).openWindow(window); }
export function closeWindow(window: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).closeWindow(window); }
export function turnLightOn(light: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).turnLightOn(light); }
export function turnLightOff(light: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).turnLightOff(light); }
export function pullDrawer(drawer: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pullDrawer(drawer); }
export function pushDrawer(drawer: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pushDrawer(drawer); }
export function pickUpBag(bag: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).pickUpBag(bag); }
export function putOnBackpack(backpack: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).putOnBackpack(backpack); }
export function removeBackpack(backpack: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).removeBackpack(backpack); }
export function unlockDoor(door: any, key: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).unlockDoor(door, key); }
export function lockDoor(door: any, key: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).lockDoor(door, key); }
export function climbStairs(p?: RealisticHumanPlayer): void { resolvePlayer(p).climbStairs(); }
export function descendStairs(p?: RealisticHumanPlayer): void { resolvePlayer(p).descendStairs(); }

// ============================================================================
// 361–380. Vật lý, va chạm, quần áo, tóc và chuyển động phụ
// ============================================================================

export function initializePhysics(p?: RealisticHumanPlayer): void { resolvePlayer(p).initializePhysics(); }
export function createPlayerCollider(p?: RealisticHumanPlayer): any { return resolvePlayer(p).createPlayerCollider(); }
export function applyGravity(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).applyGravity(deltaTime); }
export function applyForce(force: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).applyForce(force); }
export function applyImpulse(impulse: Vec3, p?: RealisticHumanPlayer): void { resolvePlayer(p).applyImpulse(impulse); }
export function calculateVelocity(deltaTime: number, p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).calculateVelocity(deltaTime); }
export function calculateAcceleration(deltaTime: number, p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).calculateAcceleration(deltaTime); }
export function resolveCollision(p?: RealisticHumanPlayer): void { resolvePlayer(p).resolveCollision(); }
export function checkGroundContact(p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).checkGroundContact(); }
export function updateGroundFriction(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateGroundFriction(); }
export function applyJointLimits(p?: RealisticHumanPlayer): void { resolvePlayer(p).applyJointLimits(); }
export function solveIK(p?: RealisticHumanPlayer): void { resolvePlayer(p).solveIK(); }
export function solveFootIK(p?: RealisticHumanPlayer): void { resolvePlayer(p).solveFootIK(); }
export function solveHandIK(p?: RealisticHumanPlayer): void { resolvePlayer(p).solveHandIK(); }
export function updateClothPhysics(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateClothPhysics(deltaTime); }
export function updateHairPhysics(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateHairPhysics(deltaTime); }
export function applySecondaryMotion(p?: RealisticHumanPlayer): void { resolvePlayer(p).applySecondaryMotion(); }
export function updateMuscleDeformation(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateMuscleDeformation(); }
export function updateSkinDeformation(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateSkinDeformation(); }
export function updateSoftTissueMotion(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateSoftTissueMotion(); }

// ============================================================================
// 381–400. Animation, camera, âm thanh, AI và tối ưu hóa
// ============================================================================

export function initializeAnimationController(p?: RealisticHumanPlayer): void { resolvePlayer(p).initializeAnimationController(); }
export function loadAnimationClips(p?: RealisticHumanPlayer): string[] { return resolvePlayer(p).loadAnimationClips(); }
export function playAnimation(name: string, p?: RealisticHumanPlayer): boolean { return resolvePlayer(p).playAnimation(name); }
export function crossFadeAnimation(from: string, to: string, duration?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).crossFadeAnimation(from, to, duration); }
export function blendAnimations(p?: RealisticHumanPlayer): void { resolvePlayer(p).blendAnimations(); }
export function updateAnimationMixer(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateAnimationMixer(deltaTime); }
export function setAnimationSpeed(speed: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).setAnimationSpeed(speed); }
export function updateRootMotion(p?: RealisticHumanPlayer): Vec3 { return resolvePlayer(p).updateRootMotion(); }
export function attachCamera(camera: any, p?: RealisticHumanPlayer): void { resolvePlayer(p).attachCamera(camera); }
export function updateCameraFollow(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updateCameraFollow(deltaTime); }
export function applyCameraSmoothing(p?: RealisticHumanPlayer): void { resolvePlayer(p).applyCameraSmoothing(); }
export function playFootstepSound(p?: RealisticHumanPlayer): void { resolvePlayer(p).playFootstepSound(); }
export function playLandingSound(p?: RealisticHumanPlayer): void { resolvePlayer(p).playLandingSound(); }
export function updateSpatialAudio(p?: RealisticHumanPlayer): void { resolvePlayer(p).updateSpatialAudio(); }
export function updatePlayerAI(deltaTime: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePlayerAI(deltaTime); }
export function chooseNextAction(p?: RealisticHumanPlayer): string { return resolvePlayer(p).chooseNextAction(); }
export function updatePerception(p?: RealisticHumanPlayer): void { resolvePlayer(p).updatePerception(); }
export function interpolatePlayerPosition(target: Vec3, alpha?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).interpolatePlayerPosition(target, alpha); }
export function interpolatePlayerRotation(targetAngle: number, alpha?: number, p?: RealisticHumanPlayer): void { resolvePlayer(p).interpolatePlayerRotation(targetAngle, alpha); }
export function updatePlayerLOD(cameraDistance: number, p?: RealisticHumanPlayer): number { return resolvePlayer(p).updatePlayerLOD(cameraDistance); }
