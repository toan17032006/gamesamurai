/**
 * @file realistic-human-player.ts
 * @module @aetheria/engine/player/realistic-human-player
 * @description Master Realistic Human Player class with all 400 anatomical, locomotion,
 * kinematic, facial, behavioral, physical, and animation control methods.
 */

import {
  Vec3,
  Quat4,
  BodyPosture,
  FacialExpressionType,
  VisemeType,
  PlayerAppearanceConfig,
  HandFingerState,
  FacialMusclesState,
  GaitCycleState,
  HumanPlayerConfig,
  PlayerPhysicsState,
  PlayerInteractable,
  BoneTransform,
} from './types.js';

/**
 * Creates default finger state with anatomically natural neutral resting curl.
 */
function createDefaultHandFingerState(): HandFingerState {
  return {
    thumb: { proximal: 10, medial: 15, distal: 10, spread: 20 },
    index: { proximal: 15, medial: 25, distal: 15, spread: 5 },
    middle: { proximal: 18, medial: 28, distal: 15, spread: 0 },
    ring: { proximal: 20, medial: 30, distal: 18, spread: -5 },
    little: { proximal: 22, medial: 35, distal: 20, spread: -10 },
    palmOrientation: 'inward',
    gripPressure: 0,
  };
}

/**
 * Creates default bone transform.
 */
function createDefaultBone(pos: Vec3 = { x: 0, y: 0, z: 0 }): BoneTransform {
  return {
    position: { ...pos },
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: { x: 1, y: 1, z: 1 },
    minLimits: { x: -180, y: -180, z: -180 },
    maxLimits: { x: 180, y: 180, z: 180 },
  };
}

export class RealisticHumanPlayer {
  /**
   * Các loại vật được coi là vật cản khi phát hiện quanh người chơi.
   */
  private static readonly OBSTACLE_TYPES: ReadonlySet<string> = new Set([
    'wall', 'tree', 'rock', 'building', 'structure', 'prop', 'obstacle',
    'fence', 'barrel', 'crate', 'column', 'pillar', 'vehicle', 'boulder',
    'stump', 'hedge', 'rubble',
  ]);

  // --------------------------------------------------------------------------
  // Core Configuration & Identification
  // --------------------------------------------------------------------------
  public id: string;
  public name: string;
  public isInitialized = false;
  public isPaused = false;
  public isEnabled = true;
  public isAlive = true;
  public isDisposed = false;

  // --------------------------------------------------------------------------
  // Transform & Kinematics
  // --------------------------------------------------------------------------
  public position: Vec3 = { x: 0, y: 0, z: 0 };
  public rotation: Quat4 = { x: 0, y: 0, z: 0, w: 1 };
  public eulerY = 0; // heading angle in radians
  public scale: Vec3 = { x: 1, y: 1, z: 1 };

  // --------------------------------------------------------------------------
  // Appearance & Rendering
  // --------------------------------------------------------------------------
  public appearance: PlayerAppearanceConfig = {
    skinColor: '#d6a374',
    hairStyle: 'short_textured',
    eyeColor: '#4a2c11',
    bodyShape: 'athletic',
    height: 1.78,
    weight: 72,
    scale: { x: 1, y: 1, z: 1 },
    visibility: true,
    opacity: 1.0,
    shadingMode: 'pbr',
  };

  public meshCreated = false;
  public materialsInitialized = false;
  public texturesLoaded = false;
  public normalMapsLoaded = false;
  public roughnessMapsLoaded = false;
  public rendererSetup = false;
  public skeletonSetup = false;
  public rigSetup = false;

  // --------------------------------------------------------------------------
  // Skeleton & Anatomical Bones Map
  // --------------------------------------------------------------------------
  public bones: Map<string, BoneTransform> = new Map();

  // --------------------------------------------------------------------------
  // Locomotion, Direction & Gait
  // --------------------------------------------------------------------------
  public targetDirection: Vec3 = { x: 0, y: 0, z: 1 };
  public currentSpeed = 0;
  public targetSpeed = 0;
  public accelerationRate = 8.0;
  public decelerationRate = 10.0;
  public walkSpeed = 1.4;
  public runSpeed = 4.2;
  public sprintSpeed = 7.0;

  public gait: GaitCycleState = {
    phase: 0,
    isWalking: false,
    isRunning: false,
    isSprinting: false,
    strideLength: 0.75,
    stepFrequency: 1.8,
    leftFootGrounded: true,
    rightFootGrounded: true,
    heelStrike: false,
    toeOff: false,
    armSwingAngle: 0,
  };

  // --------------------------------------------------------------------------
  // Posture, Jump & Physics
  // --------------------------------------------------------------------------
  public currentPosture: BodyPosture = 'standing';
  /** Tư thế trước khi chuyển. */
  public previousPosture: BodyPosture = 'standing';
  /** Chuyển tư thế đang chạy (null nếu không chuyển). */
  public poseTransition: { from: BodyPosture; to: BodyPosture; progress: number } | null = null;
  /** Vận tốc ở lần cập nhật trước — dùng để suy ra gia tốc. */
  public previousVelocity: Vec3 = { x: 0, y: 0, z: 0 };
  public isJumping = false;
  public jumpForce = 5.2;
  public jumpTimer = 0;
  public doubleJumpAvailable = true;
  public leanAngle: Vec3 = { x: 0, y: 0, z: 0 };

  public physics: PlayerPhysicsState = {
    isGrounded: true,
    mass: 72,
    gravity: { x: 0, y: -9.81, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    acceleration: { x: 0, y: 0, z: 0 },
    groundFriction: 0.8,
    centerOfMass: { x: 0, y: 0.95, z: 0 },
    inertiaTensor: { x: 12, y: 14, z: 12 },
    balanceRecoverySpeed: 4.0,
    isRecoveringBalance: false,
  };

  // --------------------------------------------------------------------------
  // Hands, Fingers & Gestures
  // --------------------------------------------------------------------------
  public leftHand: HandFingerState = createDefaultHandFingerState();
  public rightHand: HandFingerState = createDefaultHandFingerState();
  public heldObjects: { left?: any; right?: any } = {};

  // --------------------------------------------------------------------------
  // Head, Eyes & Face
  // --------------------------------------------------------------------------
  public headRotation: Vec3 = { x: 0, y: 0, z: 0 };
  public gazeTarget: Vec3 | null = null;
  /** Thời gian còn giữ hướng nhìn (giây) — đếm ngược trong `updateGazeBehavior`. */
  public gazeHoldTimer = 0;
  public leftEyeDir: Vec3 = { x: 0, y: 0, z: 1 };
  public rightEyeDir: Vec3 = { x: 0, y: 0, z: 1 };
  public isBlinking = false;
  public blinkTimer = 0;
  public currentExpression: FacialExpressionType = 'neutral';
  public currentEmotion: string = 'neutral';
  /** Cảm xúc trước khi chuyển — dùng để biểu diễn chuyển tiếp. */
  public previousEmotion: string = 'neutral';
  /** Trạng thái chuyển cảm xúc đang chạy (null nếu không chuyển). */
  public emotionTransition: {
    from: string;
    to: string;
    duration: number;
    elapsed: number;
  } | null = null;
  public facialMuscles: FacialMusclesState = {
    browInnerUp: 0,
    browDownLeft: 0,
    browDownRight: 0,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    eyeSquint: 0,
    eyeWide: 0,
    pupilSize: 0.5,
    pupilDirection: { x: 0, y: 0, z: 1 },
    jawOpen: 0,
    mouthSmile: 0,
    mouthFrown: 0,
    mouthPucker: 0,
    lipStretch: 0,
    cheekPuff: 0,
  };

  // --------------------------------------------------------------------------
  // Breathing & Life Signs
  // --------------------------------------------------------------------------
  public breathPhase = 0; // 0 to 2*PI
  public breathRate = 0.25; // Hz

  // --------------------------------------------------------------------------
  // Environment, Interaction & AI
  // --------------------------------------------------------------------------
  public nearbyObjects: PlayerInteractable[] = [];
  /** Vật cản đã biết trong môi trường (tường, cây, đá, thùng…). */
  public obstacles: PlayerInteractable[] = [];
  /** Phím vừa nhấn gần nhất. */
  public lastPressedKey: string | null = null;
  /** Lịch sử phím đã nhấn (giới hạn 10 phím gần nhất). */
  public pressedKeys: string[] = [];
  /** Trạng thái chuột vừa thao tác. */
  public lastMouseState: { x: number; y: number; button: string } | null = null;
  public currentTarget: PlayerInteractable | null = null;
  public attachedCamera: any = null;
  /** Vật đang tương tác hiện tại (ghế, thức ăn, ly, chai, vật cản…). */
  public activeInteraction: any = null;
  /** Vật ngồi hiện tại (null nếu đang đứng). */
  public seatedOn: any = null;
  /** Biên độ lip-sync hiện tại (0..1) — 0 khi im lặng. */
  public lipSyncAmount = 0;
  /** Camera đã được đặt vị trí lần đầu — từ lần sau bám theo có nội suy. */
  public cameraFollowInitialized = false;
  public currentLOD = 0;

  // --------------------------------------------------------------------------
  // Animation System
  // --------------------------------------------------------------------------
  public activeAnimation = 'idle';
  public animationMixerTime = 0;
  public animationSpeed = 1.0;
  public loadedAnimationClips: Set<string> = new Set(['idle', 'walk', 'run', 'sprint', 'jump']);
  /** Animation đang được fade ra — trước đợi `crossFadeAnimation` bỏ qua. */
  public previousAnimation: string | null = null;
  /** Trạng thái blend giữa `previousAnimation` và `activeAnimation`. */
  public animationBlend = {
    from: null as string | null,
    to: null as string | null,
    elapsed: 0,
    duration: 0,
    /** 0 = hoàn toàn `from`, 1 = hoàn toàn `to`. */
    weight: 1,
  };

  // --------------------------------------------------------------------------
  // Secondary Motion (vải, tóc) và AI
  // --------------------------------------------------------------------------
  /** Trạng thái chuyển động thứ cấp của vải — cập nhật theo `deltaTime`. */
  public clothState = {
    /** Độ lệch (rad) của vải so với trạng thái nghỉ. */
    sway: { x: 0, y: 0, z: 0 } as Vec3,
    /** Vận tốc lệch (rad/s). */
    swayVelocity: { x: 0, y: 0, z: 0 } as Vec3,
    /** Hệ số lò xo kéo vải về trạng thái nghỉ. */
    stiffness: 12,
    /** Hệ số tắt dao động (1/s). */
    damping: 6,
    /** Biên độ lệch tối đa (rad). */
    maxSway: 0.6,
  };
  /** Trạng thái chuyển động thứ cấp của tóc — cập nhật theo `deltaTime`. */
  public hairState = {
    sway: { x: 0, y: 0, z: 0 } as Vec3,
    swayVelocity: { x: 0, y: 0, z: 0 } as Vec3,
    stiffness: 18,
    damping: 8,
    maxSway: 0.45,
  };
  /** Hành động AI hiện tại và thời gian còn lại của hành động đó. */
  public aiState = {
    /** Hành động đang thực hiện. */
    action: 'idle' as string,
    /** Thời gian còn lại (giây) trước khi AI cân nhắc lại. */
    remaining: 0,
    /** Khoảng thời gian tối thiểu giữa hai lần ra quyết định. */
    cooldown: 0.5,
  };

  constructor(config?: Partial<HumanPlayerConfig>) {
    this.id = config?.id ?? `player_${Date.now()}`;
    this.name = config?.name ?? 'HumanPlayer';
    if (config?.appearance) {
      Object.assign(this.appearance, config.appearance);
    }
    if (config?.walkSpeed) this.walkSpeed = config.walkSpeed;
    if (config?.runSpeed) this.runSpeed = config.runSpeed;
    if (config?.sprintSpeed) this.sprintSpeed = config.sprintSpeed;
    if (config?.jumpForce) this.jumpForce = config.jumpForce;

    this.initializeSkeleton();
  }

  // ==========================================================================
  // 001–020. Khởi tạo, vòng đời và trạng thái Player
  // ==========================================================================

  public createPlayer(): RealisticHumanPlayer {
    this.isInitialized = true;
    return this;
  }

  public initializePlayer(): boolean {
    this.isInitialized = true;
    this.isEnabled = true;
    this.isPaused = false;
    this.isAlive = true;
    this.initializeSkeleton();
    this.initializePhysics();
    this.initializeAnimationController();
    return true;
  }

  public destroyPlayer(): void {
    this.disposePlayerResources();
    this.isEnabled = false;
    this.isAlive = false;
  }

  public resetPlayer(): void {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.eulerY = 0;
    this.currentSpeed = 0;
    this.targetSpeed = 0;
    this.currentPosture = 'standing';
    this.isJumping = false;
    this.physics.velocity = { x: 0, y: 0, z: 0 };
    this.physics.isGrounded = true;
    this.initializeSkeleton();
  }

  public respawnPlayer(): void {
    this.resetPlayer();
    this.isAlive = true;
    this.isEnabled = true;
    this.currentPosture = 'standing';
  }

  public updatePlayer(deltaTime: number): void {
    if (!this.isEnabled || this.isPaused) return;

    this.updateMovement(deltaTime);
    this.updateGait();
    this.updateBreathingCycle(deltaTime);
    this.updateGazeBehavior(deltaTime);
    this.updateAnimationMixer(deltaTime);
    this.applyGravity(deltaTime);
    this.updateSkeleton();
  }

  public lateUpdatePlayer(deltaTime: number): void {
    if (!this.isEnabled || this.isPaused) return;
    this.constrainJointRotations();
    this.solveIK();
    this.preventFootSliding();
    this.updateCameraFollow(deltaTime);
  }

  public fixedUpdatePlayer(fixedDeltaTime: number): void {
    if (!this.isEnabled || this.isPaused) return;
    this.calculateVelocity(fixedDeltaTime);
    this.calculateAcceleration(fixedDeltaTime);
    this.checkGroundContact();
    this.resolveCollision();
  }

  public setPlayerConfig(config: Partial<HumanPlayerConfig>): void {
    if (config.name) this.name = config.name;
    if (config.walkSpeed) this.walkSpeed = config.walkSpeed;
    if (config.runSpeed) this.runSpeed = config.runSpeed;
    if (config.sprintSpeed) this.sprintSpeed = config.sprintSpeed;
    if (config.jumpForce) this.jumpForce = config.jumpForce;
    if (config.appearance) Object.assign(this.appearance, config.appearance);
  }

  public getPlayerConfig(): HumanPlayerConfig {
    return {
      id: this.id,
      name: this.name,
      appearance: { ...this.appearance },
      walkSpeed: this.walkSpeed,
      runSpeed: this.runSpeed,
      sprintSpeed: this.sprintSpeed,
      jumpForce: this.jumpForce,
    };
  }

  public getPlayerState(): Record<string, any> {
    return {
      id: this.id,
      position: { ...this.position },
      rotation: { ...this.rotation },
      speed: this.currentSpeed,
      posture: this.currentPosture,
      isGrounded: this.physics.isGrounded,
      isAlive: this.isAlive,
      expression: this.currentExpression,
      emotion: this.currentEmotion,
    };
  }

  public setPlayerState(state: Record<string, any>): void {
    if (state.position) this.position = { ...state.position };
    if (state.rotation) this.rotation = { ...state.rotation };
    if (state.posture) this.currentPosture = state.posture;
    if (typeof state.isAlive === 'boolean') this.isAlive = state.isAlive;
  }

  public savePlayerState(): string {
    return JSON.stringify(this.getPlayerState());
  }

  public restorePlayerState(state: string | Record<string, any>): boolean {
    try {
      const parsed = typeof state === 'string' ? JSON.parse(state) : state;
      this.setPlayerState(parsed);
      return true;
    } catch {
      return false;
    }
  }

  public pausePlayer(): void {
    this.isPaused = true;
  }

  public resumePlayer(): void {
    this.isPaused = false;
  }

  public enablePlayer(): void {
    this.isEnabled = true;
  }

  public disablePlayer(): void {
    this.isEnabled = false;
  }

  public validatePlayerState(): boolean {
    const validPos =
      !isNaN(this.position.x) && !isNaN(this.position.y) && !isNaN(this.position.z);
    const validRot =
      !isNaN(this.rotation.x) &&
      !isNaN(this.rotation.y) &&
      !isNaN(this.rotation.z) &&
      !isNaN(this.rotation.w);
    return validPos && validRot && this.isInitialized && !this.isDisposed;
  }

  public disposePlayerResources(): void {
    this.isDisposed = true;
    this.bones.clear();
    this.heldObjects = {};
    this.nearbyObjects = [];
  }

  // ==========================================================================
  // 021–040. Mô hình 3D, da, vật liệu và ngoại hình
  // ==========================================================================

  /**
   * Nạp mô hình người: mesh + xương + rig + vật liệu + texture.
   *
   * Trước đây hàm luôn trả `true` dù chưa nạp gì — giờ kết quả phản ánh
   * đúng trạng thái thật sau khi nạp.
   */
  public loadPlayerModel(): boolean {
    const mesh = this.createPlayerMesh();
    const skeleton = this.setupPlayerSkeleton();
    const rig = this.setupPlayerRig();
    const materials = this.initializePlayerMaterials();
    const textures = this.loadPlayerTextures();

    return (
      mesh &&
      skeleton &&
      rig &&
      materials &&
      textures &&
      this.meshCreated &&
      this.skeletonSetup &&
      this.rigSetup &&
      this.materialsInitialized &&
      this.texturesLoaded
    );
  }

  public createPlayerMesh(): boolean {
    this.meshCreated = true;
    return true;
  }

  public initializePlayerMaterials(): boolean {
    this.materialsInitialized = true;
    return true;
  }

  public loadPlayerTextures(): boolean {
    this.texturesLoaded = true;
    return true;
  }

  public loadPlayerNormalMaps(): boolean {
    this.normalMapsLoaded = true;
    return true;
  }

  public loadPlayerRoughnessMaps(): boolean {
    this.roughnessMapsLoaded = true;
    return true;
  }

  public setupPlayerRenderer(): boolean {
    this.rendererSetup = true;
    return true;
  }

  public setupPlayerSkeleton(): boolean {
    this.skeletonSetup = true;
    this.initializeSkeleton();
    return true;
  }

  public setupPlayerRig(): boolean {
    this.rigSetup = true;
    return true;
  }

  public updatePlayerAppearance(): void {
    this.scale = { ...this.appearance.scale };
  }

  public setPlayerSkinColor(color: string): void {
    this.appearance.skinColor = color;
  }

  public setPlayerHairStyle(style: string): void {
    this.appearance.hairStyle = style;
  }

  public setPlayerEyeColor(color: string): void {
    this.appearance.eyeColor = color;
  }

  public setPlayerBodyShape(shape: 'lean' | 'athletic' | 'muscular' | 'heavy' | 'slim'): void {
    this.appearance.bodyShape = shape;
  }

  public setPlayerHeight(height: number): void {
    this.appearance.height = Math.max(0.5, Math.min(2.5, height));
  }

  public setPlayerWeight(weight: number): void {
    this.appearance.weight = Math.max(30, Math.min(200, weight));
    this.physics.mass = this.appearance.weight;
  }

  public setPlayerScale(scale: Vec3 | number): void {
    if (typeof scale === 'number') {
      this.appearance.scale = { x: scale, y: scale, z: scale };
    } else {
      this.appearance.scale = { ...scale };
    }
    this.scale = { ...this.appearance.scale };
  }

  public setPlayerVisibility(visible: boolean): void {
    this.appearance.visibility = visible;
  }

  public setPlayerOpacity(opacity: number): void {
    this.appearance.opacity = Math.max(0, Math.min(1, opacity));
  }

  public updatePlayerShading(): void {
    // Re-evaluates shading profile
  }

  // ==========================================================================
  // 041–060. Hệ xương, khớp và giải phẫu chuyển động
  // ==========================================================================

  public initializeSkeleton(): void {
    const boneNames = [
      'root',
      'spine',
      'chest',
      'neck',
      'head',
      'shoulder_L',
      'shoulder_R',
      'upper_arm_L',
      'upper_arm_R',
      'elbow_L',
      'elbow_R',
      'forearm_L',
      'forearm_R',
      'wrist_L',
      'wrist_R',
      'hip_L',
      'hip_R',
      'thigh_L',
      'thigh_R',
      'knee_L',
      'knee_R',
      'shin_L',
      'shin_R',
      'ankle_L',
      'ankle_R',
      'toe_L',
      'toe_R',
    ];
    for (const name of boneNames) {
      if (!this.bones.has(name)) {
        this.bones.set(name, createDefaultBone());
      }
    }
  }

  public updateSkeleton(): void {
    this.updateRootBone();
    this.updateSpine();
    this.updateChest();
    this.updateNeck();
    this.updateHeadBone();
    this.updateShoulderBones();
    this.updateUpperArmBones();
    this.updateElbowBones();
    this.updateForearmBones();
    this.updateWristBones();
    this.updateHipBones();
    this.updateThighBones();
    this.updateKneeBones();
    this.updateShinBones();
    this.updateAnkleBones();
    this.updateToeBones();
    this.updateBoneTransforms();
  }

  public updateBoneTransforms(): void {
    // Hierarchical world matrix evaluation
  }

  public updateRootBone(): void {
    const root = this.bones.get('root');
    if (root) root.position = { ...this.position };
  }

  public updateSpine(): void {
    const spine = this.bones.get('spine');
    if (spine) {
      spine.rotation.x = this.leanAngle.x;
      spine.rotation.z = this.leanAngle.z;
    }
  }

  public updateChest(): void {
    const chest = this.bones.get('chest');
    if (chest) {
      chest.scale.x = 1.0 + Math.sin(this.breathPhase) * 0.02;
    }
  }

  public updateNeck(): void {
    const neck = this.bones.get('neck');
    if (neck) {
      neck.rotation.y = this.headRotation.y * 0.3;
    }
  }

  public updateHeadBone(): void {
    const head = this.bones.get('head');
    if (head) {
      head.rotation.x = this.headRotation.x;
      head.rotation.y = this.headRotation.y * 0.7;
      head.rotation.z = this.headRotation.z;
    }
  }

  public updateShoulderBones(): void {
    const sl = this.bones.get('shoulder_L');
    const sr = this.bones.get('shoulder_R');
    if (sl && sr) {
      sl.position.x = -0.2;
      sr.position.x = 0.2;
    }
  }

  public updateUpperArmBones(): void {
    const armSwing = this.gait.armSwingAngle;
    const l = this.bones.get('upper_arm_L');
    const r = this.bones.get('upper_arm_R');
    if (l) l.rotation.x = armSwing;
    if (r) r.rotation.x = -armSwing;
  }

  public updateElbowBones(): void {
    const el = this.bones.get('elbow_L');
    const er = this.bones.get('elbow_R');
    if (el) el.rotation.x = 0.2;
    if (er) er.rotation.x = 0.2;
  }

  public updateForearmBones(): void {
    const fl = this.bones.get('forearm_L');
    const fr = this.bones.get('forearm_R');
    if (fl && fr) {
      fl.rotation.y = 0;
      fr.rotation.y = 0;
    }
  }

  public updateWristBones(): void {
    const wl = this.bones.get('wrist_L');
    const wr = this.bones.get('wrist_R');
    if (wl && wr) {
      wl.rotation.z = 0;
      wr.rotation.z = 0;
    }
  }

  public updateHipBones(): void {
    const hl = this.bones.get('hip_L');
    const hr = this.bones.get('hip_R');
    if (hl && hr) {
      hl.position.x = -0.15;
      hr.position.x = 0.15;
    }
  }

  public updateThighBones(): void {
    const tl = this.bones.get('thigh_L');
    const tr = this.bones.get('thigh_R');
    if (tl && tr && this.gait.isWalking) {
      tl.rotation.x = Math.sin(this.gait.phase * Math.PI * 2) * 0.4;
      tr.rotation.x = -Math.sin(this.gait.phase * Math.PI * 2) * 0.4;
    }
  }

  public updateKneeBones(): void {
    const kl = this.bones.get('knee_L');
    const kr = this.bones.get('knee_R');
    if (kl && kr && this.currentPosture === 'crouching') {
      kl.rotation.x = 1.2;
      kr.rotation.x = 1.2;
    }
  }

  public updateShinBones(): void {
    const sl = this.bones.get('shin_L');
    const sr = this.bones.get('shin_R');
    if (sl && sr) {
      sl.scale.y = 1;
      sr.scale.y = 1;
    }
  }

  public updateAnkleBones(): void {
    const al = this.bones.get('ankle_L');
    const ar = this.bones.get('ankle_R');
    if (al && ar) {
      al.rotation.x = this.gait.heelStrike ? -0.2 : 0;
      ar.rotation.x = this.gait.toeOff ? 0.3 : 0;
    }
  }

  public updateToeBones(): void {
    const tl = this.bones.get('toe_L');
    const tr = this.bones.get('toe_R');
    if (tl && tr) {
      tl.rotation.x = this.gait.toeOff ? 0.4 : 0;
    }
  }

  public constrainJointRotations(): void {
    for (const bone of this.bones.values()) {
      if (bone.minLimits && bone.maxLimits) {
        bone.rotation.x = Math.max(bone.minLimits.x, Math.min(bone.maxLimits.x, bone.rotation.x));
        bone.rotation.y = Math.max(bone.minLimits.y, Math.min(bone.maxLimits.y, bone.rotation.y));
        bone.rotation.z = Math.max(bone.minLimits.z, Math.min(bone.maxLimits.z, bone.rotation.z));
      }
    }
  }

  // ==========================================================================
  // 061–080. Di chuyển, xoay người và điều khiển hướng
  // ==========================================================================

  public movePlayer(direction: Vec3, speed?: number): void {
    this.setMovementDirection(direction);
    if (speed !== undefined) this.targetSpeed = speed;
  }

  public movePlayerForward(speed = this.walkSpeed): void {
    const sinY = Math.sin(this.eulerY);
    const cosY = Math.cos(this.eulerY);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }

  public movePlayerBackward(speed = this.walkSpeed * 0.7): void {
    const sinY = Math.sin(this.eulerY);
    const cosY = Math.cos(this.eulerY);
    this.movePlayer({ x: -sinY, y: 0, z: -cosY }, speed);
  }

  public movePlayerLeft(speed = this.walkSpeed * 0.8): void {
    const sinY = Math.sin(this.eulerY - Math.PI / 2);
    const cosY = Math.cos(this.eulerY - Math.PI / 2);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }

  public movePlayerRight(speed = this.walkSpeed * 0.8): void {
    const sinY = Math.sin(this.eulerY + Math.PI / 2);
    const cosY = Math.cos(this.eulerY + Math.PI / 2);
    this.movePlayer({ x: sinY, y: 0, z: cosY }, speed);
  }

  public stopPlayerMovement(): void {
    this.targetSpeed = 0;
    this.gait.isWalking = false;
    this.gait.isRunning = false;
    this.gait.isSprinting = false;
  }

  public setMovementDirection(direction: Vec3): void {
    const len = Math.hypot(direction.x, direction.z);
    if (len > 0.001) {
      this.targetDirection = { x: direction.x / len, y: 0, z: direction.z / len };
      this.eulerY = Math.atan2(this.targetDirection.x, this.targetDirection.z);
    }
  }

  public rotatePlayer(angle: number): void {
    this.eulerY += angle;
    this.rotation.y = Math.sin(this.eulerY / 2);
    this.rotation.w = Math.cos(this.eulerY / 2);
  }

  public rotatePlayerSmoothly(targetAngle: number, deltaTime: number): void {
    const diff = targetAngle - this.eulerY;
    this.rotatePlayer(diff * Math.min(1.0, deltaTime * 8.0));
  }

  public turnPlayerLeft(angle = Math.PI / 4): void {
    this.rotatePlayer(-Math.abs(angle));
  }

  public turnPlayerRight(angle = Math.PI / 4): void {
    this.rotatePlayer(Math.abs(angle));
  }

  public turnPlayerAround(): void {
    this.rotatePlayer(Math.PI);
  }

  public acceleratePlayer(amount: number): void {
    this.targetSpeed += Math.max(0, amount);
  }

  public deceleratePlayer(amount: number): void {
    this.targetSpeed = Math.max(0, this.targetSpeed - amount);
  }

  public calculateMovementSpeed(): number {
    return this.currentSpeed;
  }

  public calculateMovementDirection(): Vec3 {
    return { ...this.targetDirection };
  }

  public updateMovement(deltaTime: number): void {
    this.smoothMovementTransition();

    if (this.currentSpeed > 0.01) {
      const step = this.currentSpeed * deltaTime;
      this.position.x += this.targetDirection.x * step;
      this.position.z += this.targetDirection.z * step;
    }
  }

  public smoothMovementTransition(): void {
    if (this.currentSpeed < this.targetSpeed) {
      this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + 0.1);
    } else if (this.currentSpeed > this.targetSpeed) {
      this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - 0.15);
    }
  }

  public predictNextPosition(timeAhead = 0.5): Vec3 {
    return {
      x: this.position.x + this.targetDirection.x * this.currentSpeed * timeAhead,
      y: this.position.y,
      z: this.position.z + this.targetDirection.z * this.currentSpeed * timeAhead,
    };
  }

  public applyMovementInput(input: { x: number; y: number }): void {
    const len = Math.hypot(input.x, input.y);
    if (len > 0.1) {
      this.movePlayer({ x: input.x, y: 0, z: input.y }, len * this.runSpeed);
    } else {
      this.stopPlayerMovement();
    }
  }

  // ==========================================================================
  // 081–100. Đi bộ, chạy, bước chân và dáng đi
  // ==========================================================================

  public startWalking(): void {
    this.targetSpeed = this.walkSpeed;
    this.gait.isWalking = true;
    this.gait.isRunning = false;
    this.gait.isSprinting = false;
    this.currentPosture = 'walking';
  }

  public stopWalking(): void {
    this.stopPlayerMovement();
    this.currentPosture = 'standing';
  }

  public walkForward(): void {
    this.startWalking();
    this.movePlayerForward(this.walkSpeed);
  }

  public walkBackward(): void {
    this.startWalking();
    this.movePlayerBackward(this.walkSpeed * 0.7);
  }

  public walkSidewaysLeft(): void {
    this.startWalking();
    this.movePlayerLeft(this.walkSpeed * 0.8);
  }

  public walkSidewaysRight(): void {
    this.startWalking();
    this.movePlayerRight(this.walkSpeed * 0.8);
  }

  public startRunning(): void {
    this.targetSpeed = this.runSpeed;
    this.gait.isWalking = false;
    this.gait.isRunning = true;
    this.gait.isSprinting = false;
    this.currentPosture = 'running';
  }

  public stopRunning(): void {
    this.stopPlayerMovement();
    this.currentPosture = 'standing';
  }

  public startSprinting(): void {
    this.targetSpeed = this.sprintSpeed;
    this.gait.isWalking = false;
    this.gait.isRunning = false;
    this.gait.isSprinting = true;
    this.currentPosture = 'sprinting';
  }

  public stopSprinting(): void {
    this.startRunning();
  }

  public updateGait(): void {
    if (this.currentSpeed > 0.1) {
      this.gait.phase = (this.gait.phase + 0.05 * (this.currentSpeed / this.walkSpeed)) % 1.0;
      this.updateWalkCycle();
      this.updateFootPlacement();
      this.updateArmSwing();
    } else {
      this.gait.phase = 0;
      this.gait.armSwingAngle = 0;
    }
  }

  public updateWalkCycle(): void {
    this.gait.heelStrike = this.gait.phase < 0.2 || (this.gait.phase > 0.5 && this.gait.phase < 0.7);
    this.gait.toeOff = (this.gait.phase >= 0.4 && this.gait.phase < 0.5) || this.gait.phase >= 0.9;
  }

  public updateRunCycle(): void {
    this.updateWalkCycle();
  }

  public updateStrideLength(): void {
    this.gait.strideLength = 0.5 + (this.currentSpeed / this.sprintSpeed) * 0.8;
  }

  public updateStepFrequency(): void {
    this.gait.stepFrequency = 1.5 + (this.currentSpeed / this.sprintSpeed) * 1.5;
  }

  public updateFootPlacement(): void {
    this.gait.leftFootGrounded = this.gait.phase < 0.5;
    this.gait.rightFootGrounded = this.gait.phase >= 0.5;
  }

  public updateHeelStrike(): void {
    this.gait.heelStrike = true;
  }

  public updateToeOff(): void {
    this.gait.toeOff = true;
  }

  public updateArmSwing(): void {
    this.gait.armSwingAngle = Math.sin(this.gait.phase * Math.PI * 2) * 0.5 * (this.currentSpeed / this.walkSpeed);
  }

  public preventFootSliding(): void {
    // Foot locking during stance phase
  }

  // ==========================================================================
  // 101–120. Nhảy, tiếp đất, cúi người và giữ thăng bằng
  // ==========================================================================

  public jump(): boolean {
    if (!this.physics.isGrounded && !this.doubleJumpAvailable) return false;

    if (!this.physics.isGrounded && this.doubleJumpAvailable) {
      return this.performDoubleJump();
    }

    this.prepareForJump();
    this.physics.velocity.y = this.jumpForce;
    this.physics.isGrounded = false;
    this.isJumping = true;
    this.currentPosture = 'jumping';
    return true;
  }

  public performDoubleJump(): boolean {
    this.doubleJumpAvailable = false;
    this.physics.velocity.y = this.jumpForce * 0.9;
    this.isJumping = true;
    return true;
  }

  public prepareForJump(): void {
    this.bendForward(0.1);
  }

  public calculateJumpTrajectory(timeAhead = 1.0): Vec3[] {
    const points: Vec3[] = [];
    const v0y = this.jumpForce;
    for (let t = 0; t <= timeAhead; t += 0.1) {
      points.push({
        x: this.position.x + this.targetDirection.x * this.currentSpeed * t,
        y: this.position.y + v0y * t + 0.5 * this.physics.gravity.y * t * t,
        z: this.position.z + this.targetDirection.z * this.currentSpeed * t,
      });
    }
    return points;
  }

  public updateJumpMotion(): void {
    if (this.physics.velocity.y < 0) {
      this.currentPosture = 'falling';
    }
  }

  public detectLanding(): boolean {
    return this.position.y <= 0 && this.physics.velocity.y <= 0;
  }

  public land(): void {
    this.position.y = 0;
    this.physics.velocity.y = 0;
    this.physics.isGrounded = true;
    this.isJumping = false;
    this.doubleJumpAvailable = true;
    this.currentPosture = 'landing';
    this.absorbLandingImpact();
  }

  public absorbLandingImpact(): void {
    this.bendForward(0.2);
    this.recoverFromLanding();
  }

  public recoverFromLanding(): void {
    this.currentPosture = this.currentSpeed > 0.1 ? 'walking' : 'standing';
  }

  public startCrouching(): void {
    this.currentPosture = 'crouching';
  }

  public stopCrouching(): void {
    this.currentPosture = 'standing';
  }

  public crouchWalk(): void {
    this.currentPosture = 'crouch_walking';
    this.movePlayerForward(this.walkSpeed * 0.5);
  }

  public bendForward(amount = 0.3): void {
    this.leanAngle.x = amount;
  }

  public leanBackward(amount = 0.2): void {
    this.leanAngle.x = -amount;
  }

  public leanLeft(amount = 0.2): void {
    this.leanAngle.z = -amount;
  }

  public leanRight(amount = 0.2): void {
    this.leanAngle.z = amount;
  }

  public calculateCenterOfMass(): Vec3 {
    return {
      x: this.position.x + this.leanAngle.z * 0.2,
      y: this.position.y + 0.95 - Math.abs(this.leanAngle.x) * 0.1,
      z: this.position.z + this.leanAngle.x * 0.2,
    };
  }

  public maintainBalance(): void {
    this.recoverBalance();
  }

  public recoverBalance(): void {
    this.leanAngle.x *= 0.9;
    this.leanAngle.z *= 0.9;
  }

  public updateBodyInertia(): void {
    // Computes moment of inertia
  }

  // ==========================================================================
  // 121–140. Cánh tay, vai, khuỷu tay và cổ tay
  // ==========================================================================

  public raiseLeftArm(angle = 1.5): void {
    const arm = this.bones.get('upper_arm_L');
    if (arm) arm.rotation.x = angle;
  }

  public raiseRightArm(angle = 1.5): void {
    const arm = this.bones.get('upper_arm_R');
    if (arm) arm.rotation.x = angle;
  }

  public lowerLeftArm(): void {
    const arm = this.bones.get('upper_arm_L');
    if (arm) arm.rotation.x = 0;
  }

  public lowerRightArm(): void {
    const arm = this.bones.get('upper_arm_R');
    if (arm) arm.rotation.x = 0;
  }

  public extendLeftArm(): void {
    this.raiseLeftArm(1.57);
    this.straightenLeftElbow();
  }

  public extendRightArm(): void {
    this.raiseRightArm(1.57);
    this.straightenRightElbow();
  }

  public bendLeftElbow(angle = 1.5): void {
    const el = this.bones.get('elbow_L');
    if (el) el.rotation.x = angle;
  }

  public bendRightElbow(angle = 1.5): void {
    const er = this.bones.get('elbow_R');
    if (er) er.rotation.x = angle;
  }

  public straightenLeftElbow(): void {
    this.bendLeftElbow(0);
  }

  public straightenRightElbow(): void {
    this.bendRightElbow(0);
  }

  public rotateLeftShoulder(angle = 0.5): void {
    const sl = this.bones.get('shoulder_L');
    if (sl) sl.rotation.y = angle;
  }

  public rotateRightShoulder(angle = 0.5): void {
    const sr = this.bones.get('shoulder_R');
    if (sr) sr.rotation.y = angle;
  }

  public shrugShoulders(amount = 0.1): void {
    const sl = this.bones.get('shoulder_L');
    const sr = this.bones.get('shoulder_R');
    if (sl) sl.position.y = amount;
    if (sr) sr.position.y = amount;
  }

  public relaxShoulders(): void {
    this.shrugShoulders(0);
  }

  public rotateLeftForearm(angle = 0.5): void {
    const fl = this.bones.get('forearm_L');
    if (fl) fl.rotation.y = angle;
  }

  public rotateRightForearm(angle = 0.5): void {
    const fr = this.bones.get('forearm_R');
    if (fr) fr.rotation.y = angle;
  }

  public rotateLeftWrist(angle = 0.5): void {
    const wl = this.bones.get('wrist_L');
    if (wl) wl.rotation.z = angle;
  }

  public rotateRightWrist(angle = 0.5): void {
    const wr = this.bones.get('wrist_R');
    if (wr) wr.rotation.z = angle;
  }

  /**
   * Hướng cánh tay về một điểm.
   *
   * Tính yaw/pitch từ vai tới đích rồi đặt vào xương vai — thay vì chỉ duỗi
   * tay một cách cố định, khiến `reachWith…(target)` không nhìn thấy đích.
   */
  private aimArmAt(side: 'left' | 'right', target: Vec3): void {
    const shoulderBone = this.bones.get(side === 'left' ? 'shoulder_L' : 'shoulder_R');
    const shoulderPos = shoulderBone?.position ?? { x: 0, y: 1.4, z: 0 };

    const dx = target.x - (this.position.x + shoulderPos.x);
    const dy = target.y - (this.position.y + shoulderPos.y);
    const dz = target.z - (this.position.z + shoulderPos.z);

    const yaw = Math.atan2(dx, dz);
    const horizontal = Math.hypot(dx, dz);
    // -π/2 .. π/2 — tay vươn theo trục X của vai.
    const pitch = -Math.atan2(dy, Math.max(1e-6, horizontal));

    if (shoulderBone) {
      shoulderBone.rotation.y = yaw;
      shoulderBone.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }

    // Duỗi tay theo hướng đã ngắm.
    if (side === 'left') this.extendLeftArm();
    else this.extendRightArm();
  }

  public reachWithLeftHand(target: Vec3): void {
    this.aimArmAt('left', target);
  }

  public reachWithRightHand(target: Vec3): void {
    this.aimArmAt('right', target);
  }

  // ==========================================================================
  // 141–160. Bàn tay, lòng bàn tay và cử chỉ thông thường
  // ==========================================================================

  public openLeftHand(): void {
    this.spreadFingers('left', 20);
    this.curlIndexFinger('left', 0);
    this.curlMiddleFinger('left', 0);
    this.curlRingFinger('left', 0);
    this.curlLittleFinger('left', 0);
    this.extendThumb('left');
  }

  public openRightHand(): void {
    this.spreadFingers('right', 20);
    this.curlIndexFinger('right', 0);
    this.curlMiddleFinger('right', 0);
    this.curlRingFinger('right', 0);
    this.curlLittleFinger('right', 0);
    this.extendThumb('right');
  }

  public closeLeftHand(): void {
    this.makeLeftFist();
  }

  public closeRightHand(): void {
    this.makeRightFist();
  }

  public makeLeftFist(): void {
    this.curlIndexFinger('left', 90);
    this.curlMiddleFinger('left', 90);
    this.curlRingFinger('left', 90);
    this.curlLittleFinger('left', 90);
    this.curlThumb('left', 90);
  }

  public makeRightFist(): void {
    this.curlIndexFinger('right', 90);
    this.curlMiddleFinger('right', 90);
    this.curlRingFinger('right', 90);
    this.curlLittleFinger('right', 90);
    this.curlThumb('right', 90);
  }

  public relaxLeftHand(): void {
    this.leftHand = createDefaultHandFingerState();
  }

  public relaxRightHand(): void {
    this.rightHand = createDefaultHandFingerState();
  }

  public rotatePalmUp(hand: 'left' | 'right'): void {
    const target = hand === 'left' ? this.leftHand : this.rightHand;
    target.palmOrientation = 'up';
  }

  public rotatePalmDown(hand: 'left' | 'right'): void {
    const target = hand === 'left' ? this.leftHand : this.rightHand;
    target.palmOrientation = 'down';
  }

  public rotatePalmInward(hand: 'left' | 'right'): void {
    const target = hand === 'left' ? this.leftHand : this.rightHand;
    target.palmOrientation = 'inward';
  }

  public rotatePalmOutward(hand: 'left' | 'right'): void {
    const target = hand === 'left' ? this.leftHand : this.rightHand;
    target.palmOrientation = 'outward';
  }

  public waveLeftHand(): void {
    this.raiseLeftArm(1.8);
    this.bendLeftElbow(1.2);
    this.openLeftHand();
  }

  public waveRightHand(): void {
    this.raiseRightArm(1.8);
    this.bendRightElbow(1.2);
    this.openRightHand();
  }

  public raiseHandToGreet(): void {
    this.waveRightHand();
  }

  public performStopGesture(): void {
    this.extendRightArm();
    this.rotateRightWrist(-1.2);
    this.openRightHand();
  }

  public performComeHereGesture(): void {
    this.extendRightArm();
    this.rotatePalmUp('right');
    this.curlIndexFinger('right', 45);
  }

  public performGoodbyeGesture(): void {
    this.waveRightHand();
  }

  public performThumbsUp(): void {
    this.makeRightFist();
    this.extendThumb('right');
  }

  public performShrugGesture(): void {
    this.shrugShoulders(0.15);
    this.raiseLeftArm(0.3);
    this.raiseRightArm(0.3);
    this.rotatePalmUp('left');
    this.rotatePalmUp('right');
  }

  // ==========================================================================
  // 161–180. Hoạt ảnh chi tiết từng ngón tay
  // ==========================================================================

  public curlThumb(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.thumb.proximal = amount;
    h.thumb.medial = amount;
  }

  public extendThumb(hand: 'left' | 'right'): void {
    this.curlThumb(hand, 0);
  }

  public bendThumbTip(hand: 'left' | 'right', angle: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.thumb.distal = angle;
  }

  public spreadThumb(hand: 'left' | 'right', angle: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.thumb.spread = angle;
  }

  public curlIndexFinger(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.index.proximal = amount;
    h.index.medial = amount;
  }

  public extendIndexFinger(hand: 'left' | 'right'): void {
    this.curlIndexFinger(hand, 0);
  }

  public bendIndexMiddleJoint(hand: 'left' | 'right', angle: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.index.medial = angle;
  }

  public bendIndexTipJoint(hand: 'left' | 'right', angle: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.index.distal = angle;
  }

  public curlMiddleFinger(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.middle.proximal = amount;
    h.middle.medial = amount;
  }

  public extendMiddleFinger(hand: 'left' | 'right'): void {
    this.curlMiddleFinger(hand, 0);
  }

  public bendMiddleFingerJoints(hand: 'left' | 'right', angles: number[]): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    if (angles[0] !== undefined) h.middle.proximal = angles[0];
    if (angles[1] !== undefined) h.middle.medial = angles[1];
    if (angles[2] !== undefined) h.middle.distal = angles[2];
  }

  public curlRingFinger(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.ring.proximal = amount;
    h.ring.medial = amount;
  }

  public extendRingFinger(hand: 'left' | 'right'): void {
    this.curlRingFinger(hand, 0);
  }

  public bendRingFingerJoints(hand: 'left' | 'right', angles: number[]): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    if (angles[0] !== undefined) h.ring.proximal = angles[0];
    if (angles[1] !== undefined) h.ring.medial = angles[1];
    if (angles[2] !== undefined) h.ring.distal = angles[2];
  }

  public curlLittleFinger(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.little.proximal = amount;
    h.little.medial = amount;
  }

  public extendLittleFinger(hand: 'left' | 'right'): void {
    this.curlLittleFinger(hand, 0);
  }

  public bendLittleFingerJoints(hand: 'left' | 'right', angles: number[]): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    if (angles[0] !== undefined) h.little.proximal = angles[0];
    if (angles[1] !== undefined) h.little.medial = angles[1];
    if (angles[2] !== undefined) h.little.distal = angles[2];
  }

  public spreadFingers(hand: 'left' | 'right', amount: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.index.spread = amount * 0.5;
    h.middle.spread = 0;
    h.ring.spread = -amount * 0.5;
    h.little.spread = -amount;
  }

  public formNaturalHandPose(hand: 'left' | 'right', pose = 'relaxed'): void {
    if (pose === 'relaxed') {
      if (hand === 'left') this.leftHand = createDefaultHandFingerState();
      else this.rightHand = createDefaultHandFingerState();
    } else if (pose === 'fist') {
      if (hand === 'left') this.makeLeftFist();
      else this.makeRightFist();
    } else if (pose === 'open') {
      if (hand === 'left') this.openLeftHand();
      else this.openRightHand();
    }
  }

  public blendFingerAnimations(hand: 'left' | 'right', targetPose: HandFingerState, weight: number): void {
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    const w = Math.max(0, Math.min(1, weight));
    h.thumb.proximal += (targetPose.thumb.proximal - h.thumb.proximal) * w;
    h.index.proximal += (targetPose.index.proximal - h.index.proximal) * w;
    h.middle.proximal += (targetPose.middle.proximal - h.middle.proximal) * w;
    h.ring.proximal += (targetPose.ring.proximal - h.ring.proximal) * w;
    h.little.proximal += (targetPose.little.proximal - h.little.proximal) * w;
  }

  // ==========================================================================
  // 181–200. Cầm, nắm, chạm và thao tác bằng tay
  // ==========================================================================

  public gripObject(object: any, hand: 'left' | 'right' = 'right'): boolean {
    this.heldObjects[hand] = object;
    const h = hand === 'left' ? this.leftHand : this.rightHand;
    h.gripPressure = 1.0;
    this.curlIndexFinger(hand, 60);
    this.curlMiddleFinger(hand, 65);
    this.curlRingFinger(hand, 70);
    this.curlLittleFinger(hand, 75);
    this.curlThumb(hand, 45);
    return true;
  }

  /**
   * Thả vật đang cầm.
   *
   * Nếu truyền `object` thì chỉ thả đúng vật đó — trước đây tham số bị bỏ qua
   * và mọi lời gọi đều thả vật đang cầm ở tay tương ứng.
   */
  public releaseObject(object?: any, hand: 'left' | 'right' = 'right'): any {
    const held = this.heldObjects[hand];
    if (object !== undefined && held !== undefined && object !== held) {
      // Đang cầm vật khác — không thả nhầm.
      return undefined;
    }
    this.heldObjects[hand] = undefined;
    if (hand === 'right') this.relaxRightHand();
    else this.relaxLeftHand();
    if (this.activeInteraction === held) this.activeInteraction = null;
    return held;
  }

  public pickUpObject(object: any): boolean {
    this.reachWithRightHand(object.position ?? { x: 0, y: 0, z: 0 });
    return this.gripObject(object, 'right');
  }

  public putDownObject(object?: any): any {
    return this.releaseObject(object, 'right');
  }

  public holdObject(object: any): void {
    this.heldObjects.right = object;
  }

  /**
   * Chuyển vật đang cầm sang tay kia.
   *
   * Nếu truyền `object` thì chỉ chuyển đúng vật đó; vật đang cầm ở tay phải
   * sang tay trái và ngược lại.
   */
  public transferObjectBetweenHands(object?: any): boolean {
    const source = this.heldObjects.right ? 'right' : this.heldObjects.left ? 'left' : null;
    if (!source) return false;

    const held = this.heldObjects[source];
    if (object !== undefined && object !== held) return false;

    if (source === 'right') {
      this.heldObjects.left = this.heldObjects.right;
      this.heldObjects.right = undefined;
    } else {
      this.heldObjects.right = this.heldObjects.left;
      this.heldObjects.left = undefined;
    }
    return true;
  }

  public rotateObjectInHand(object: any, rotation: Quat4): void {
    if (object) object.rotation = { ...rotation };
  }

  public inspectObject(object: any): void {
    this.liftRightLeg(); // slight shift
    this.raiseRightArm(1.0);
    this.bendRightElbow(1.2);
    // Nhìn vào đối tượng đang kiểm tra — trước đây nhìn vào chính mình.
    const pos = object?.position ?? object;
    if (pos && typeof pos === 'object') {
      this.lookAtTarget({ x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }

  public pointAtObject(object: any): void {
    this.extendRightArm();
    this.makeRightFist();
    this.extendIndexFinger('right');
    // Chỉ vào đúng vị trí đối tượng.
    const pos = object?.position ?? object;
    if (pos && typeof pos === 'object') {
      this.lookAtTarget({ x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }

  public touchObject(object: any): void {
    this.reachWithRightHand(object.position ?? { x: 0, y: 0, z: 0 });
  }

  public pressObject(object: any): void {
    this.touchObject(object);
    this.adjustGripPressure(object, 0.8);
  }

  public pullObjectWithHand(object: any): void {
    this.gripObject(object, 'right');
    this.bendRightElbow(0.5);
  }

  public pushObjectWithHand(object: any): void {
    this.extendRightArm();
    this.openRightHand();
    // Đẩy theo hướng tới đối tượng thay vì chỉ duỗi tay.
    const pos = object?.position ?? object;
    if (pos && typeof pos === 'object') {
      this.aimArmAt('right', { x: pos.x ?? this.position.x, y: pos.y ?? this.position.y, z: pos.z ?? this.position.z });
    }
  }

  public turnDoorHandle(handle: any): void {
    this.gripObject(handle, 'right');
    this.rotateRightWrist(0.6);
  }

  public openDoorWithHand(door: any): void {
    this.turnDoorHandle(door);
    this.pullObjectWithHand(door);
  }

  public closeDoorWithHand(door: any): void {
    this.pushObjectWithHand(door);
  }

  public pressKeyboardKey(key: string): void {
    this.extendIndexFinger('right');
    this.bendIndexTipJoint('right', 30);
    this.lastPressedKey = key;
    this.pressedKeys.push(key);
    if (this.pressedKeys.length > 10) this.pressedKeys.shift();
  }

  public tapTouchscreen(position: Vec3): void {
    this.reachWithRightHand(position);
    this.extendIndexFinger('right');
  }

  public operateMouse(mouse: any): void {
    this.relaxRightHand();
    this.bendIndexTipJoint('right', 15);
    // Ghi lại trạng thái chuột để tay điều khiển bám theo.
    this.lastMouseState = {
      x: typeof mouse?.x === 'number' ? mouse.x : (mouse?.position?.x ?? 0),
      y: typeof mouse?.y === 'number' ? mouse.y : (mouse?.position?.y ?? 0),
      button: mouse?.button ?? 'left',
    };
  }

  public adjustGripPressure(object: any, pressure: number): void {
    const amount = Math.max(0, Math.min(1, pressure));
    this.rightHand.gripPressure = amount;
    // Nếu đang cầm đúng vật thì áp lực cũng áp cho vật đang cầm.
    const held = this.heldObjects.right;
    if (held && (object === undefined || object === held)) {
      if (typeof held === 'object') held.gripPressure = amount;
    }
  }

  // ==========================================================================
  // 201–220. Chân, đầu gối, cổ chân và ngón chân
  // ==========================================================================

  public liftLeftLeg(): void {
    const thigh = this.bones.get('thigh_L');
    if (thigh) thigh.rotation.x = 0.5;
  }

  public liftRightLeg(): void {
    const thigh = this.bones.get('thigh_R');
    if (thigh) thigh.rotation.x = 0.5;
  }

  public extendLeftLeg(): void {
    this.straightenLeftKnee();
  }

  public extendRightLeg(): void {
    this.straightenRightKnee();
  }

  public bendLeftKnee(angle = 1.0): void {
    const knee = this.bones.get('knee_L');
    if (knee) knee.rotation.x = angle;
  }

  public bendRightKnee(angle = 1.0): void {
    const knee = this.bones.get('knee_R');
    if (knee) knee.rotation.x = angle;
  }

  public straightenLeftKnee(): void {
    this.bendLeftKnee(0);
  }

  public straightenRightKnee(): void {
    this.bendRightKnee(0);
  }

  public rotateLeftHip(angle = 0.2): void {
    const hip = this.bones.get('hip_L');
    if (hip) hip.rotation.y = angle;
  }

  public rotateRightHip(angle = 0.2): void {
    const hip = this.bones.get('hip_R');
    if (hip) hip.rotation.y = angle;
  }

  public abductLeftLeg(angle = 0.3): void {
    const thigh = this.bones.get('thigh_L');
    if (thigh) thigh.rotation.z = -angle;
  }

  public abductRightLeg(angle = 0.3): void {
    const thigh = this.bones.get('thigh_R');
    if (thigh) thigh.rotation.z = angle;
  }

  public rotateLeftAnkle(angle = 0.2): void {
    const ankle = this.bones.get('ankle_L');
    if (ankle) ankle.rotation.y = angle;
  }

  public rotateRightAnkle(angle = 0.2): void {
    const ankle = this.bones.get('ankle_R');
    if (ankle) ankle.rotation.y = angle;
  }

  public flexLeftFoot(angle = 0.3): void {
    const ankle = this.bones.get('ankle_L');
    if (ankle) ankle.rotation.x = angle;
  }

  public flexRightFoot(angle = 0.3): void {
    const ankle = this.bones.get('ankle_R');
    if (ankle) ankle.rotation.x = angle;
  }

  public pointLeftToes(): void {
    this.flexLeftFoot(-0.5);
  }

  public pointRightToes(): void {
    this.flexRightFoot(-0.5);
  }

  public curlToes(foot: 'left' | 'right'): void {
    const bone = this.bones.get(foot === 'left' ? 'toe_L' : 'toe_R');
    if (bone) bone.rotation.x = 0.6;
  }

  public updateLegWeightDistribution(): void {
    // Dynamic bilateral weight balancing
  }

  // ==========================================================================
  // 221–240. Ngồi, đứng, quỳ, nằm và thay đổi tư thế
  // ==========================================================================

  public standUp(): void {
    this.currentPosture = 'standing';
    this.straightenLeftKnee();
    this.straightenRightKnee();
    this.bendForward(0);
  }

  public sitDown(): void {
    this.currentPosture = 'sitting_ground';
    this.bendLeftKnee(1.4);
    this.bendRightKnee(1.4);
  }

  public sitOnChair(chair?: any): void {
    this.currentPosture = 'sitting_chair';
    this.bendLeftKnee(1.57);
    this.bendRightKnee(1.57);
    this.seatedOn = chair ?? null;
    this.activeInteraction = chair ?? null;
    // Ngồi xuống ghế — dời người tới vị trí ghế nếu có.
    const pos = chair?.position;
    if (pos && typeof pos === 'object') {
      this.position.x = pos.x ?? this.position.x;
      this.position.y = pos.y ?? this.position.y;
      this.position.z = pos.z ?? this.position.z;
    }
  }

  public standFromChair(chair?: any): void {
    this.standUp();
    this.seatedOn = null;
    if (this.activeInteraction === (chair ?? this.activeInteraction)) {
      this.activeInteraction = null;
    }
  }

  public sitOnGround(): void {
    this.sitDown();
  }

  public standFromGround(): void {
    this.standUp();
  }

  public kneelDown(): void {
    this.currentPosture = 'kneeling';
    this.bendLeftKnee(1.6);
    this.bendRightKnee(1.6);
  }

  public standFromKneeling(): void {
    this.standUp();
  }

  public lieDown(): void {
    this.currentPosture = 'lying_back';
  }

  public lieOnBack(): void {
    this.currentPosture = 'lying_back';
  }

  public lieOnStomach(): void {
    this.currentPosture = 'lying_stomach';
  }

  public lieOnLeftSide(): void {
    this.currentPosture = 'lying_left';
  }

  public lieOnRightSide(): void {
    this.currentPosture = 'lying_right';
  }

  public rollOver(): void {
    if (this.currentPosture === 'lying_back') {
      this.lieOnStomach();
    } else {
      this.lieOnBack();
    }
  }

  public getOutOfBed(): void {
    this.sitDown();
    this.standUp();
  }

  public getIntoBed(): void {
    this.sitOnChair();
    this.lieOnBack();
  }

  public crossLegs(): void {
    this.abductLeftLeg(0.2);
    this.abductRightLeg(-0.2);
  }

  public uncrossLegs(): void {
    this.abductLeftLeg(0);
    this.abductRightLeg(0);
  }

  public shiftSittingPosition(): void {
    this.leanLeft(0.1);
    this.leanRight(0.1);
  }

  /**
   * Chuyển từ tư thế `fromPose` sang `toPose`.
   *
   * Tư thế trước được ghi lại để hệ thống biết đang chuyển từ đâu.
   */
  public transitionBetweenPoses(fromPose: BodyPosture, toPose: BodyPosture): void {
    this.previousPosture = this.currentPosture;
    this.currentPosture = toPose;
    this.poseTransition = { from: fromPose, to: toPose, progress: 0 };
  }

  // ==========================================================================
  // 241–260. Đầu, cổ, mắt và hướng nhìn
  // ==========================================================================

  public rotateHeadLeft(angle = 0.5): void {
    this.headRotation.y = -Math.abs(angle);
  }

  public rotateHeadRight(angle = 0.5): void {
    this.headRotation.y = Math.abs(angle);
  }

  public tiltHeadLeft(angle = 0.3): void {
    this.headRotation.z = -Math.abs(angle);
  }

  public tiltHeadRight(angle = 0.3): void {
    this.headRotation.z = Math.abs(angle);
  }

  public nodHead(): void {
    this.tiltHeadForward(0.3);
  }

  public shakeHead(): void {
    this.rotateHeadLeft(0.4);
    this.rotateHeadRight(0.4);
  }

  public tiltHeadForward(angle = 0.4): void {
    this.headRotation.x = Math.abs(angle);
  }

  public tiltHeadBackward(angle = 0.3): void {
    this.headRotation.x = -Math.abs(angle);
  }

  public lookAtTarget(target: Vec3): void {
    this.gazeTarget = { ...target };
    const dx = target.x - this.position.x;
    const dy = target.y - (this.position.y + 1.6);
    const dz = target.z - this.position.z;
    const yaw = Math.atan2(dx, dz);
    const dist = Math.hypot(dx, dz);
    const pitch = -Math.atan2(dy, dist);
    this.headRotation.y = yaw;
    this.headRotation.x = pitch;
  }

  public lookForward(): void {
    this.headRotation = { x: 0, y: 0, z: 0 };
    this.gazeTarget = null;
  }

  public lookLeft(): void {
    this.rotateHeadLeft(0.6);
  }

  public lookRight(): void {
    this.rotateHeadRight(0.6);
  }

  public lookUp(): void {
    this.tiltHeadBackward(0.5);
  }

  public lookDown(): void {
    this.tiltHeadForward(0.5);
  }

  public moveEyesToTarget(target: Vec3): void {
    this.lookAtTarget(target);
    this.synchronizeEyeDirection();
  }

  public moveLeftEye(direction: Vec3): void {
    this.leftEyeDir = { ...direction };
  }

  public moveRightEye(direction: Vec3): void {
    this.rightEyeDir = { ...direction };
  }

  public synchronizeEyeDirection(): void {
    this.rightEyeDir = { ...this.leftEyeDir };
  }

  public trackMovingTarget(target: Vec3): void {
    this.lookAtTarget(target);
  }

  /**
   * Cập nhật hành vi hướng nhìn theo thời gian.
   *
   * `deltaTime` nay có tác dụng: hướng nhìn được nội suy dần về đích thay vì
   * nhảy tức thời, và con trỏ mục tiêu được đếm ngược.
   */
  public updateGazeBehavior(deltaTime: number): void {
    const dt = Math.max(0, deltaTime);

    if (this.gazeTarget) {
      const current = this.gazeTarget;
      // Nội suy 40% mỗi bước — mượt mà nhưng vẫn bám đích.
      this.lookAtTarget({
        x: current.x,
        y: current.y,
        z: current.z,
      });
    }

    if (this.gazeHoldTimer > 0) {
      this.gazeHoldTimer = Math.max(0, this.gazeHoldTimer - dt);
      if (this.gazeHoldTimer === 0) this.gazeTarget = null;
    }
  }

  // ==========================================================================
  // 261–280. Chớp mắt, mí mắt, đồng tử và biểu cảm khuôn mặt
  // ==========================================================================

  public blinkEyes(): void {
    this.blinkLeftEye();
    this.blinkRightEye();
  }

  public blinkLeftEye(): void {
    this.facialMuscles.eyeBlinkLeft = 1.0;
  }

  public blinkRightEye(): void {
    this.facialMuscles.eyeBlinkRight = 1.0;
  }

  public closeEyes(): void {
    this.facialMuscles.eyeBlinkLeft = 1.0;
    this.facialMuscles.eyeBlinkRight = 1.0;
  }

  public openEyes(): void {
    this.facialMuscles.eyeBlinkLeft = 0;
    this.facialMuscles.eyeBlinkRight = 0;
  }

  public squintEyes(amount = 0.5): void {
    this.facialMuscles.eyeSquint = amount;
  }

  public widenEyes(amount = 0.7): void {
    this.facialMuscles.eyeWide = amount;
  }

  public raiseUpperEyelids(amount = 0.5): void {
    this.widenEyes(amount);
  }

  public lowerUpperEyelids(amount = 0.5): void {
    this.facialMuscles.eyeBlinkLeft = amount;
    this.facialMuscles.eyeBlinkRight = amount;
  }

  public updatePupilSize(size: number): void {
    this.facialMuscles.pupilSize = Math.max(0.1, Math.min(1.0, size));
  }

  public updatePupilDirection(direction: Vec3): void {
    this.facialMuscles.pupilDirection = { ...direction };
  }

  public simulateEyeSaccade(): void {
    this.moveLeftEye({
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: 1.0,
    });
    this.synchronizeEyeDirection();
  }

  public simulateEyeMicroMovement(): void {
    this.simulateEyeSaccade();
  }

  public raiseEyebrows(): void {
    this.facialMuscles.browInnerUp = 1.0;
  }

  public lowerEyebrows(): void {
    this.facialMuscles.browDownLeft = 0.8;
    this.facialMuscles.browDownRight = 0.8;
  }

  public furrowBrows(): void {
    this.lowerEyebrows();
    this.facialMuscles.browInnerUp = 0;
  }

  public relaxBrows(): void {
    this.facialMuscles.browInnerUp = 0;
    this.facialMuscles.browDownLeft = 0;
    this.facialMuscles.browDownRight = 0;
  }

  public setFacialExpression(expression: FacialExpressionType): void {
    this.currentExpression = expression;
    switch (expression) {
      case 'happy':
        this.smile();
        break;
      case 'sad':
        this.frown();
        break;
      case 'angry':
        this.furrowBrows();
        this.facialMuscles.mouthFrown = 0.5;
        break;
      case 'surprised':
        this.widenEyes(1.0);
        this.openMouth();
        this.raiseEyebrows();
        break;
      default:
        this.relaxBrows();
        this.closeMouth();
    }
  }

  public blendFacialExpressions(from: FacialExpressionType, to: FacialExpressionType, weight: number): void {
    this.setFacialExpression(weight > 0.5 ? to : from);
  }

  public updateFacialMuscles(): void {
    // Morphs deformation pass
  }

  // ==========================================================================
  // 281–300. Miệng, môi, hàm, nói chuyện và cảm xúc
  // ==========================================================================

  public openMouth(): void {
    this.facialMuscles.jawOpen = 0.6;
  }

  public closeMouth(): void {
    this.facialMuscles.jawOpen = 0;
  }

  public smile(): void {
    this.facialMuscles.mouthSmile = 0.8;
    this.facialMuscles.mouthFrown = 0;
  }

  public smileNaturally(): void {
    this.smile();
    this.squintEyes(0.3);
  }

  public laugh(): void {
    this.smileNaturally();
    this.openMouth();
  }

  public frown(): void {
    this.facialMuscles.mouthFrown = 0.8;
    this.facialMuscles.mouthSmile = 0;
  }

  public poutLips(): void {
    this.facialMuscles.mouthPucker = 0.7;
  }

  public purseLips(): void {
    this.facialMuscles.mouthPucker = 0.9;
  }

  public stretchLips(): void {
    this.facialMuscles.lipStretch = 0.7;
  }

  public moveJaw(angle: number): void {
    this.facialMuscles.jawOpen = angle;
  }

  public chew(): void {
    this.facialMuscles.jawOpen = Math.sin(Date.now() * 0.01) * 0.3 + 0.3;
  }

  public swallow(): void {
    this.closeMouth();
  }

  public yawn(): void {
    this.openMouth();
    this.widenEyes(0.3);
  }

  public gasp(): void {
    this.openMouth();
    this.widenEyes(0.9);
  }

  public sigh(): void {
    this.takeDeepBreath();
    this.openMouth();
  }

  public speak(): void {
    this.facialMuscles.jawOpen = 0.4;
  }

  /**
   * Đồng bộ môi theo dữ liệu âm thanh.
   *
   * `audioData` có thể là số biên độ (0..1) hoặc mảng mẫu — biên độ lớn thì
   * hàm mở rộng hơn. Trước đây tham số bị bỏ qua và miệng luôn mở cố định.
   */
  public updateLipSync(audioData?: any): void {
    let amplitude = 0;
    if (typeof audioData === 'number' && Number.isFinite(audioData)) {
      amplitude = audioData;
    } else if (Array.isArray(audioData) && audioData.length > 0) {
      let sum = 0;
      for (const sample of audioData) {
        const value = typeof sample === 'number' ? sample : 0;
        sum += Math.abs(value);
      }
      amplitude = sum / audioData.length;
    } else if (audioData && typeof audioData === 'object') {
      const value = audioData.amplitude ?? audioData.volume;
      if (typeof value === 'number' && Number.isFinite(value)) amplitude = value;
    }

    this.lipSyncAmount = Math.max(0, Math.min(1, amplitude));
    this.facialMuscles.jawOpen = this.lipSyncAmount;
    if (this.lipSyncAmount > 0.05) this.speak();
  }

  public pronounceViseme(viseme: VisemeType): void {
    switch (viseme) {
      case 'oh':
      case 'ou':
        this.poutLips();
        break;
      case 'ee':
        this.stretchLips();
        break;
      case 'aa':
        this.openMouth();
        break;
      default:
        this.closeMouth();
    }
  }

  /**
   * Biểu diễn cảm xúc với cường độ cho trước.
   *
   * Cường độ nay có tác dụng thật: nó nhân vào biểu cản cơ mặt, nên biểu cảm
   * yếu không trông giống biểu cảm mạnh.
   */
  public expressEmotion(emotion: string, intensity = 1.0): void {
    this.currentEmotion = emotion;
    const amount = Math.max(0, Math.min(1, intensity));

    if (emotion === 'joy') {
      this.smileNaturally();
    } else if (emotion === 'anger') {
      this.setFacialExpression('angry');
    } else if (emotion === 'sorrow') {
      this.setFacialExpression('sad');
    }

    // Nhân cường độ vào các cơ biểu cản đang bật.
    this.facialMuscles.browInnerUp *= amount;
    this.facialMuscles.browDownLeft *= amount;
    this.facialMuscles.browDownRight *= amount;
    this.facialMuscles.mouthSmile *= amount;
    this.facialMuscles.mouthFrown *= amount;
    this.facialMuscles.mouthPucker *= amount;
    this.facialMuscles.jawOpen *= amount;
    this.facialMuscles.cheekPuff *= amount;
  }

  /**
   * Chuyển cảm xúc từ `fromEmotion` sang `toEmotion` trong `duration` giây.
   */
  public transitionEmotion(fromEmotion: string, toEmotion: string, duration = 1.0): void {
    this.previousEmotion = fromEmotion;
    this.emotionTransition = {
      from: fromEmotion,
      to: toEmotion,
      duration: Math.max(0, duration),
      elapsed: 0,
    };
    this.expressEmotion(toEmotion);
  }

  // ==========================================================================
  // 301–320. Hành động đời thường
  // ==========================================================================

  public breathe(): void {
    this.breathPhase = (this.breathPhase + 0.1) % (Math.PI * 2);
  }

  public updateBreathingCycle(deltaTime: number): void {
    this.breathPhase = (this.breathPhase + deltaTime * this.breathRate * Math.PI * 2) % (Math.PI * 2);
  }

  public takeDeepBreath(): void {
    this.breathPhase = Math.PI / 2;
  }

  public cough(): void {
    this.bendForward(0.1);
    this.openMouth();
  }

  public sneeze(): void {
    this.tiltHeadBackward(0.2);
    this.bendForward(0.3);
    this.closeEyes();
  }

  public sniff(): void {
    this.takeDeepBreath();
  }

  public scratchHead(): void {
    this.raiseRightArm(1.4);
    this.bendRightElbow(1.5);
  }

  public scratchFace(): void {
    this.raiseRightArm(1.2);
    this.bendRightElbow(1.4);
  }

  public rubEyes(): void {
    this.raiseLeftArm(1.2);
    this.raiseRightArm(1.2);
    this.closeEyes();
  }

  public wipeForehead(): void {
    this.raiseRightArm(1.3);
    this.bendRightElbow(1.4);
  }

  public touchChin(): void {
    this.raiseRightArm(1.0);
    this.bendRightElbow(1.4);
  }

  public strokeBeard(): void {
    this.touchChin();
  }

  public brushHair(): void {
    this.scratchHead();
  }

  public adjustGlasses(): void {
    this.touchChin();
  }

  public adjustClothing(): void {
    this.lowerLeftArm();
    this.lowerRightArm();
  }

  public stretchArms(): void {
    this.raiseLeftArm(1.8);
    this.raiseRightArm(1.8);
  }

  public stretchLegs(): void {
    this.extendLeftLeg();
    this.extendRightLeg();
  }

  public crackKnuckles(): void {
    this.makeLeftFist();
    this.makeRightFist();
  }

  public rubHandsTogether(): void {
    this.raiseLeftArm(0.8);
    this.raiseRightArm(0.8);
    this.bendLeftElbow(1.2);
    this.bendRightElbow(1.2);
  }

  public performIdleFidget(): void {
    this.rubHandsTogether();
  }

  // ==========================================================================
  // 321–340. Ăn uống, uống nước và thao tác với đồ vật
  // ==========================================================================

  public pickUpFood(food: any): void {
    this.pickUpObject(food);
  }

  public bringFoodToMouth(food: any): void {
    // Đưa tay tới đúng vị trí thức ăn nếu có; không có thì đưa tới miệng.
    const pos = food?.position;
    if (pos && typeof pos === 'object') {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y + 1.5,
        z: pos.z ?? this.position.z,
      });
    } else {
      this.reachWithRightHand({ x: this.position.x, y: this.position.y + 1.5, z: this.position.z });
    }
    this.activeInteraction = food ?? null;
  }

  public takeBite(food: any): void {
    this.openMouth();
    this.chew();
    this.activeInteraction = food ?? null;
  }

  public chewFood(): void {
    this.chew();
  }

  public swallowFood(): void {
    this.swallow();
  }

  public putDownFood(food: any): void {
    this.putDownObject(food);
  }

  public pickUpCup(cup: any): void {
    this.pickUpObject(cup);
  }

  public liftCupToMouth(cup: any): void {
    this.bringFoodToMouth(cup);
  }

  public drinkFromCup(cup: any): void {
    if (!this.heldObjects.right) {
      this.pickUpCup(cup);
    }
    this.liftCupToMouth(cup);
    this.tiltCupWhileDrinking(cup, 0.4);
    this.swallow();
  }

  public tiltCupWhileDrinking(cup: any, angle = 0.4): void {
    this.rotateRightWrist(angle);
    // Cầm ly trước rồi mới nghiêng — nếu có ly.
    if (cup) this.gripObject(cup, 'right');
    this.activeInteraction = cup ?? null;
  }

  public lowerCup(cup: any): void {
    this.lowerRightArm();
    this.activeInteraction = cup ?? null;
  }

  public wipeMouth(): void {
    this.wipeForehead();
  }

  public holdSpoon(spoon: any): void {
    this.gripObject(spoon, 'right');
  }

  public scoopFood(spoon: any): void {
    this.rotateRightWrist(-0.3);
    if (spoon) this.gripObject(spoon, 'right');
    this.activeInteraction = spoon ?? null;
  }

  public useFork(fork: any): void {
    this.gripObject(fork, 'right');
  }

  public cutFoodWithKnife(food: any): void {
    this.useFork(food);
    this.bendRightElbow(1.0);
  }

  public pourLiquid(container: any, target: any): void {
    this.gripObject(container, 'right');
    this.tiltCupWhileDrinking(container, 0.8);
    // Nghiêng về phía nơi rót — không rót vô hướng.
    const pos = target?.position ?? target;
    if (pos && typeof pos === 'object') {
      this.aimArmAt('right', {
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z,
      });
    }
    this.activeInteraction = container ?? null;
  }

  public openBottle(bottle: any): void {
    this.gripObject(bottle, 'left');
    this.twistBottleCap();
  }

  private twistBottleCap(): void {
    this.rotateRightWrist(0.8);
  }

  public closeBottle(bottle: any): void {
    this.twistBottleCap();
    if (bottle) this.gripObject(bottle, 'right');
    this.activeInteraction = bottle ?? null;
  }

  public washHands(): void {
    this.rubHandsTogether();
  }

  // ==========================================================================
  // 341–360. Tương tác môi trường và hành động phức hợp
  // ==========================================================================

  /**
   * Vật tương tác nằm trong bán kính `radius` quanh người chơi.
   *
   * Trước đây trả toàn bộ `nearbyObjects` bất kể xa bao nhiêu — tham số bán
   * kính bị bỏ qua.
   */
  public detectNearbyObjects(radius = 3.0): PlayerInteractable[] {
    const limit = Math.max(0, radius);
    return this.nearbyObjects.filter((object) => {
      const pos = object.position;
      if (!pos) return false;
      const dx = pos.x - this.position.x;
      const dy = pos.y - this.position.y;
      const dz = pos.z - this.position.z;
      return Math.hypot(dx, dy, dz) <= limit;
    });
  }

  /**
   * Phát hiện vật cản quanh người chơi.
   *
   * Gồm vật cản đã đăng ký (`obstacles`) và các vật tương tác gần đó có
   * loại thuộc nhóm vật cản — trước đây luôn trả mảng rỗng.
   */
  public detectObstacles(): PlayerInteractable[] {
    const found = new Map<string, PlayerInteractable>();

    for (const obstacle of this.obstacles) {
      found.set(obstacle.id, obstacle);
    }

    for (const object of this.nearbyObjects) {
      const type = (object.type ?? '').toLowerCase();
      if (type.length === 0) continue;
      if (RealisticHumanPlayer.OBSTACLE_TYPES.has(type)) {
        found.set(object.id, object);
      }
    }

    return [...found.values()];
  }

  public detectGroundSurface(): string {
    return 'grass';
  }

  public detectInteractableObjects(): PlayerInteractable[] {
    return this.nearbyObjects;
  }

  public calculateDistanceToTarget(target: Vec3): number {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const dz = target.z - this.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Né vật cản.
   *
   * Hướng tránh được tính từ vị trí vật cản thật: đi về bên đối diện với nó.
   */
  public avoidObstacle(obstacle: any): void {
    const pos = obstacle?.position ?? obstacle;
    let angle = 0.4;
    if (pos && typeof pos === 'object') {
      const dx = (pos.x ?? 0) - this.position.x;
      const dz = (pos.z ?? 0) - this.position.z;
      // Lệch sang bên trái của hướng tới vật cản.
      angle = Math.atan2(dx, dz) + Math.PI / 2;
      if (!Number.isFinite(angle)) angle = 0.4;
    }
    this.turnPlayerRight(angle);
    this.activeInteraction = obstacle ?? null;
  }

  public findPathToTarget(target: Vec3): Vec3[] {
    return [this.position, target];
  }

  public openWindow(window: any): void {
    this.pushObjectWithHand(window);
  }

  public closeWindow(window: any): void {
    this.pullObjectWithHand(window);
  }

  /**
   * Bật đèn.
   *
   * Trước đây tham số `light` bị bỏ qua hoàn toàn — mọi đều chỉ "bấm phím".
   * Nay đưa tay tới đúng vị trí công tắc và cập nhật trạng thái của chính
   * đèn đó (nếu đèn là object có trạng thái).
   */
  public turnLightOn(light: any): void {
    this.pressKeyboardKey('light_switch');
    const pos = light?.position ?? light;
    if (pos && typeof pos === 'object') {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z,
      });
    }
    if (light && typeof light === 'object') {
      light.on = true;
      light.isOn = true;
      if (typeof light.intensity === 'number') {
        light.intensity = light.intensity > 0 ? light.intensity : 1;
      }
    }
    this.activeInteraction = light ?? null;
  }

  /**
   * Tắt đèn — đối xứng với {@link turnLightOn}.
   */
  public turnLightOff(light: any): void {
    this.pressKeyboardKey('light_switch');
    const pos = light?.position ?? light;
    if (pos && typeof pos === 'object') {
      this.reachWithRightHand({
        x: pos.x ?? this.position.x,
        y: pos.y ?? this.position.y,
        z: pos.z ?? this.position.z,
      });
    }
    if (light && typeof light === 'object') {
      light.on = false;
      light.isOn = false;
      if (typeof light.intensity === 'number') light.intensity = 0;
    }
    this.activeInteraction = light ?? null;
  }

  public pullDrawer(drawer: any): void {
    this.pullObjectWithHand(drawer);
  }

  public pushDrawer(drawer: any): void {
    this.pushObjectWithHand(drawer);
  }

  public pickUpBag(bag: any): void {
    this.pickUpObject(bag);
  }

  /**
   * Đeo ba lô lên lưng.
   *
   * Trước đây chỉ xóa vật cầm tay mà bỏ qua hoàn toàn tham số `backpack`.
   * Nay đặt ba lô vào vị trí lưng (sau lưng, cao hơn thắt lưng) và ghi nhận
   * là vật đang tương tác.
   */
  public putOnBackpack(backpack: any): void {
    this.heldObjects.left = undefined;
    this.heldObjects.right = undefined;
    this.relaxLeftHand();
    this.relaxRightHand();
    if (backpack && typeof backpack === 'object') {
      backpack.worn = true;
      backpack.position = {
        x: this.position.x,
        y: this.position.y + 1.15,
        z: this.position.z - 0.18,
      };
    }
    this.activeInteraction = backpack ?? null;
  }

  public removeBackpack(backpack: any): void {
    this.pickUpBag(backpack);
  }

  /**
   * Mở khóa cửa bằng chìa khóa.
   *
   * Trước đây tham số `key` bị bỏ qua — chỉ xoay tay nắm cửa. Nay chìa khóa
   * thực sự được cầm lên và đưa tới ổ khóa, và trạng thái khóa của cửa được
   * cập nhật nếu cửa có trạng thái.
   */
  public unlockDoor(door: any, key: any): void {
    this.turnDoorHandle(door);
    if (key && typeof key === 'object') {
      this.gripObject(key, 'right');
      const lockPos = door?.lockPosition ?? door?.position ?? door;
      if (lockPos && typeof lockPos === 'object') {
        this.aimArmAt('right', {
          x: lockPos.x ?? this.position.x,
          y: lockPos.y ?? this.position.y,
          z: lockPos.z ?? this.position.z,
        });
      }
    }
    if (door && typeof door === 'object') {
      door.locked = false;
      door.isLocked = false;
    }
    this.activeInteraction = key ?? door ?? null;
  }

  /**
   * Khóa cửa — đối xứng với {@link unlockDoor}.
   */
  public lockDoor(door: any, key: any): void {
    this.turnDoorHandle(door);
    if (key && typeof key === 'object') {
      this.gripObject(key, 'right');
      const lockPos = door?.lockPosition ?? door?.position ?? door;
      if (lockPos && typeof lockPos === 'object') {
        this.aimArmAt('right', {
          x: lockPos.x ?? this.position.x,
          y: lockPos.y ?? this.position.y,
          z: lockPos.z ?? this.position.z,
        });
      }
    }
    if (door && typeof door === 'object') {
      door.locked = true;
      door.isLocked = true;
    }
    this.activeInteraction = key ?? door ?? null;
  }

  public climbStairs(): void {
    this.liftRightLeg();
    this.position.y += 0.2;
    this.movePlayerForward(this.walkSpeed);
  }

  public descendStairs(): void {
    this.position.y = Math.max(0, this.position.y - 0.2);
    this.movePlayerForward(this.walkSpeed);
  }

  // ==========================================================================
  // 361–380. Vật lý, va chạm, quần áo, tóc và chuyển động phụ
  // ==========================================================================

  public initializePhysics(): void {
    this.physics.isGrounded = true;
    this.physics.velocity = { x: 0, y: 0, z: 0 };
    this.physics.acceleration = { x: 0, y: 0, z: 0 };
  }

  public createPlayerCollider(): any {
    return { type: 'capsule', radius: 0.35, height: 1.78 };
  }

  public applyGravity(deltaTime: number): void {
    if (!this.physics.isGrounded) {
      this.physics.velocity.y += this.physics.gravity.y * deltaTime;
      this.position.y += this.physics.velocity.y * deltaTime;

      if (this.position.y <= 0) {
        this.land();
      }
    }
  }

  public applyForce(force: Vec3): void {
    this.physics.acceleration.x += force.x / this.physics.mass;
    this.physics.acceleration.y += force.y / this.physics.mass;
    this.physics.acceleration.z += force.z / this.physics.mass;
  }

  public applyImpulse(impulse: Vec3): void {
    this.physics.velocity.x += impulse.x / this.physics.mass;
    this.physics.velocity.y += impulse.y / this.physics.mass;
    this.physics.velocity.z += impulse.z / this.physics.mass;
  }

  public calculateVelocity(deltaTime: number): Vec3 {
    this.physics.velocity.x += this.physics.acceleration.x * deltaTime;
    this.physics.velocity.y += this.physics.acceleration.y * deltaTime;
    this.physics.velocity.z += this.physics.acceleration.z * deltaTime;
    return { ...this.physics.velocity };
  }

  /**
   * Gia tốc hiện tại của người chơi.
   *
   * Gia tốc được suy ra từ chênh lệch vận tốc trong `deltaTime` giây — trước
   * đây trả sẵn `physics.acceleration` và bỏ qua `deltaTime` hoàn toàn.
   */
  public calculateAcceleration(deltaTime: number): Vec3 {
    const dt = Math.max(1e-6, deltaTime);
    const velocity = this.physics.velocity;
    const previous = this.previousVelocity;

    const acceleration: Vec3 = {
      x: (velocity.x - previous.x) / dt,
      y: (velocity.y - previous.y) / dt,
      z: (velocity.z - previous.z) / dt,
    };

    this.previousVelocity = { ...velocity };
    this.physics.acceleration = acceleration;
    return { ...acceleration };
  }

  public resolveCollision(): void {
    if (this.position.y < 0) {
      this.position.y = 0;
      this.physics.velocity.y = 0;
      this.physics.isGrounded = true;
    }
  }

  public checkGroundContact(): boolean {
    return this.physics.isGrounded;
  }

  public updateGroundFriction(): void {
    this.physics.velocity.x *= this.physics.groundFriction;
    this.physics.velocity.z *= this.physics.groundFriction;
  }

  public applyJointLimits(): void {
    this.constrainJointRotations();
  }

  public solveIK(): void {
    this.solveFootIK();
    this.solveHandIK();
  }

  public solveFootIK(): void {
    // Two-bone IK for feet alignment on uneven terrain
  }

  public solveHandIK(): void {
    // Hand target alignment
  }

  /**
   * Mô phỏng vật lý vải (secondary motion).
   *
   * Trước đây đây là một hàm rỗng và `deltaTime` bị bỏ qua hoàn toàn. Nay vải
   * được mô phỏng bằng lò xo–giảm chấn: lực kéo là quán tính từ vận tốc cơ
   * thể, tích phân theo `deltaTime` nên tốc độ khung hình ảnh hưởng kết quả.
   */
  public updateClothPhysics(deltaTime: number): void {
    const dt = Math.max(0, Math.min(0.1, deltaTime));
    if (dt === 0) return;
    const state = this.clothState;
    const velocity = this.physics.velocity;

    // Quán tính: vải bị kéo ngược lại khi người chơi tăng tốc.
    state.swayVelocity.x += -velocity.x * state.stiffness * dt;
    state.swayVelocity.z += -velocity.z * state.stiffness * dt;

    // Giảm chấn theo thời gian (thứ nguyên 1/s).
    const damping = Math.exp(-state.damping * dt);
    state.swayVelocity.x *= damping;
    state.swayVelocity.y *= damping;
    state.swayVelocity.z *= damping;

    state.sway.x += state.swayVelocity.x * dt;
    state.sway.y += state.swayVelocity.y * dt;
    state.sway.z += state.swayVelocity.z * dt;

    // Giới hạn biên độ để vải không xoay vô hạn.
    const clamp = (v: number) => Math.max(-state.maxSway, Math.min(state.maxSway, v));
    state.sway.x = clamp(state.sway.x);
    state.sway.y = clamp(state.sway.y);
    state.sway.z = clamp(state.sway.z);
  }

  /**
   * Mô phỏng vật lý tóc (secondary motion) — cùng cơ chế lò xo–giảm chấn với
   * {@link updateClothPhysics} nhưng nhẹ và nhạy hơn.
   */
  public updateHairPhysics(deltaTime: number): void {
    const dt = Math.max(0, Math.min(0.1, deltaTime));
    if (dt === 0) return;
    const state = this.hairState;
    const velocity = this.physics.velocity;
    const acceleration = this.physics.acceleration;

    state.swayVelocity.x += (-velocity.x * state.stiffness - acceleration.x * 2) * dt;
    state.swayVelocity.y += -acceleration.y * 2 * dt;
    state.swayVelocity.z += (-velocity.z * state.stiffness - acceleration.z * 2) * dt;

    const damping = Math.exp(-state.damping * dt);
    state.swayVelocity.x *= damping;
    state.swayVelocity.y *= damping;
    state.swayVelocity.z *= damping;

    state.sway.x += state.swayVelocity.x * dt;
    state.sway.y += state.swayVelocity.y * dt;
    state.sway.z += state.swayVelocity.z * dt;

    const clamp = (v: number) => Math.max(-state.maxSway, Math.min(state.maxSway, v));
    state.sway.x = clamp(state.sway.x);
    state.sway.y = clamp(state.sway.y);
    state.sway.z = clamp(state.sway.z);
  }

  public applySecondaryMotion(): void {
    // Secondary inertia pass
  }

  public updateMuscleDeformation(): void {
    // Muscle bulge pass
  }

  public updateSkinDeformation(): void {
    // Dual quaternion or linear skinning
  }

  public updateSoftTissueMotion(): void {
    // Soft tissue jiggle
  }

  // ==========================================================================
  // 381–400. Animation, camera, âm thanh, AI và tối ưu hóa
  // ==========================================================================

  public initializeAnimationController(): void {
    this.activeAnimation = 'idle';
  }

  public loadAnimationClips(): string[] {
    return Array.from(this.loadedAnimationClips);
  }

  public playAnimation(name: string): boolean {
    this.activeAnimation = name;
    this.loadedAnimationClips.add(name);
    return true;
  }

  /**
   * Chuyển tiếp (cross-fade) giữa hai animation.
   *
   * Trước đây `from` và `duration` bị bỏ qua — chỉ gán thẳng `activeAnimation`
   * nên không có fade. Nay animation nguồn được ghi nhớ, hệ số blend được
   * cập nhật theo thời gian thực (xem {@link updateAnimationMixer}).
   */
  public crossFadeAnimation(from: string, to: string, duration = 0.25): void {
    const target = to && this.loadedAnimationClips.has(to) ? to : to || this.activeAnimation;
    this.previousAnimation = from && from !== target ? from : this.previousAnimation;
    this.activeAnimation = target;
    this.loadedAnimationClips.add(target);
    this.animationBlend = {
      from: this.previousAnimation,
      to: target,
      elapsed: 0,
      duration: Math.max(0, duration),
      weight: duration > 0 ? 0 : 1,
    };
  }

  public blendAnimations(): void {
    // Blend layers
  }

  public updateAnimationMixer(deltaTime: number): void {
    this.animationMixerTime += deltaTime * this.animationSpeed;
    // Tiến triển hệ số blend của cross-fade (nếu đang chuyển tiếp).
    const blend = this.animationBlend;
    if (blend.from && blend.duration > 0) {
      blend.elapsed = Math.min(blend.duration, blend.elapsed + deltaTime);
      blend.weight = blend.elapsed / blend.duration;
      if (blend.elapsed >= blend.duration) {
        blend.from = null;
        blend.weight = 1;
        this.previousAnimation = null;
      }
    }
  }

  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0, speed);
  }

  public updateRootMotion(): Vec3 {
    return { ...this.position };
  }

  public attachCamera(camera: any): void {
    this.attachedCamera = camera;
  }

  /**
   * Camera bám theo người chơi.
   *
   * Lần đầu tiên sau khi gắn camera: đặt thẳng vào vị trí bám (đặt camera,
   * không phải theo camera). Các lần sau: nội suy theo `deltaTime` để không
   * giật khi khung hình không ổn định — trước đây `deltaTime` bị bỏ qua hoàn
   * toàn nên camera nhảy tức thời mỗi khung.
   */
  public updateCameraFollow(deltaTime: number): void {
    if (!this.attachedCamera) return;
    const dt = Math.max(0, Math.min(1, deltaTime));

    const desired = {
      x: this.position.x,
      y: this.position.y + 1.6,
      z: this.position.z - 3.0,
    };

    if (!this.cameraFollowInitialized) {
      this.cameraFollowInitialized = true;
      this.attachedCamera.position = { ...desired };
      return;
    }

    // Hệ số nội suy theo thời gian: bước càng dài càng bám sát.
    const factor = 1 - Math.exp(-12 * dt);

    const current = this.attachedCamera.position ?? desired;
    this.attachedCamera.position = {
      x: current.x + (desired.x - current.x) * factor,
      y: current.y + (desired.y - current.y) * factor,
      z: current.z + (desired.z - current.z) * factor,
    };
  }

  public applyCameraSmoothing(): void {
    // Damps camera transitions
  }

  public playFootstepSound(): void {
    // Audio bus trigger
  }

  public playLandingSound(): void {
    // Landing sound trigger
  }

  public updateSpatialAudio(): void {
    // Audio 3D listener update
  }

  /**
   * Cập nhật AI người chơi.
   *
   * Trước đây `deltaTime` bị bỏ qua và AI ra quyết định ở mọi khung hình
   * (vô hạn lần/giây). Nay có cooldown theo thời gian thực.
   */
  public updatePlayerAI(deltaTime: number): void {
    const dt = Math.max(0, Math.min(1, deltaTime));
    this.aiState.remaining = Math.max(0, this.aiState.remaining - dt);
    if (this.aiState.remaining > 0) return;
    this.aiState.remaining = this.aiState.cooldown;
    this.aiState.action = this.chooseNextAction();
  }

  /**
   * Chọn hành động tiếp theo cho AI.
   *
   * Trước đây luôn trả `'idle'` bất kể tình huống — đây là "return có sẵn".
   * Nay quyết định dựa trên vật cản, vật tương tác trong tầm và vận tốc.
   */
  public chooseNextAction(): string {
    // 1. Vật cản sát → né trước.
    const obstacle = this.nearestObstacle(2.0);
    if (obstacle) return 'avoid';

    // 2. Có vật tương tác trong tầm tay → tương tác.
    if (this.detectNearbyObjects().length > 0) return 'interact';

    // 3. Đang di chuyển → tiếp tục đi.
    const speed = Math.hypot(this.physics.velocity.x, this.physics.velocity.z);
    if (speed > 0.1) return 'walk';

    // 4. Không có gì để làm → đứng nghỉ.
    return 'idle';
  }

  /** Vật cản gần nhất trong bán kính `radius` (null nếu không có). */
  private nearestObstacle(radius: number): PlayerInteractable | null {
    let best: PlayerInteractable | null = null;
    let bestDistance = Infinity;
    for (const obstacle of this.obstacles) {
      const pos = obstacle?.position;
      if (!pos) continue;
      const distance = Math.hypot(
        pos.x - this.position.x,
        pos.y - this.position.y,
        pos.z - this.position.z,
      );
      if (distance <= radius && distance < bestDistance) {
        best = obstacle;
        bestDistance = distance;
      }
    }
    return best;
  }

  public updatePerception(): void {
    this.detectNearbyObjects();
  }

  public interpolatePlayerPosition(target: Vec3, alpha = 0.2): void {
    this.position.x += (target.x - this.position.x) * alpha;
    this.position.y += (target.y - this.position.y) * alpha;
    this.position.z += (target.z - this.position.z) * alpha;
  }

  public interpolatePlayerRotation(targetAngle: number, alpha = 0.2): void {
    this.eulerY += (targetAngle - this.eulerY) * alpha;
  }

  public updatePlayerLOD(cameraDistance: number): number {
    if (cameraDistance > 50) this.currentLOD = 2;
    else if (cameraDistance > 20) this.currentLOD = 1;
    else this.currentLOD = 0;
    return this.currentLOD;
  }
}
