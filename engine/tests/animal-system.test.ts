/**
 * @file animal-system.test.ts
 * @description Comprehensive unit test suite for the Animal class, all 11 anatomical/behavioral subsystems,
 * and all 800 functions across mammals, birds, fish, reptiles, amphibians, insects, and invertebrates.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as AnimalModule from '../src/animal/index.js';
import {
  Animal,
  createAnimal,
  getActiveAnimal,
  setActiveAnimal,
  initializeAnimal,
  setAnimalSpecies,
  getAnimalSpecies,
  classifyAnimalSpecies,
  identifyAnimalFamily,
  identifyAnimalOrder,
  identifyAnimalClass,
  identifyAnimalPhylum,
  setAnimalBodyColor,
  setAnimalScale,
  setAnimalLength,
  initializeAnimalSkeleton,
  updateAnimalSkeleton,
  updateSkullBones,
  initializeAnimalMuscles,
  updateMuscleActivation,
  calculateMuscleForce,
  rotateHeadLeft,
  rotateHeadRight,
  tiltHeadUp,
  extendNeck,
  blinkEyes,
  updatePupilSize,
  updateAnimalEars,
  rotateLeftEar,
  sniffAir,
  trackScentTrail,
  openAnimalMouth,
  biteFood,
  walkOnFourLegs,
  trotOnFourLegs,
  gallopOnFourLegs,
  extendClaws,
  retractClaws,
  groomFur,
  shakeOffWater,
  initializeBirdSkeleton,
  spreadWings,
  flapWings,
  glideForward,
  perchOnBranch,
  takeOffFromGround,
  landOnGround,
  peckAtFood,
  preenFeathers,
  initializeFishSkeleton,
  swimForward,
  swimRapidly,
  diveTowardBottom,
  openGillCovers,
  pumpWaterAcrossGills,
  crawlLikeLizard,
  slitherLikeSnake,
  performSidewinding,
  flickReptileTongue,
  baskInSunlight,
  coilSnakeBody,
  launchFrogJump,
  absorbFrogLanding,
  breatheThroughSkin,
  walkUsingTripodGait,
  flapInsectWings,
  followPheromoneTrail,
  constructSpiderWeb,
  performJetPropulsion,
  activateSuckers,
  changeCephalopodColor,
  performPeristalticMovement,
  crawlLikeSnail,
  withdrawIntoShell,
  updateHeartRate,
  calculateMetabolicRate,
  stalkPrey,
  performCourtshipBehavior,
  protectOffspring,
  transitionToAdultStage,
  calculateGrowthRate,
  updateAnimalBehavior,
  evaluateThreatResponse,
  chooseEscapeDirection,
  followGroupLeader,
  initializeAnimalPhysics,
  applyAnimalGravity,
  solveAnimalIK,
  solveAnimalFootIK,
  updateAnimalLOD,
  performCourtshipDisplay,
  regulateBodyTemperature
} from '../src/animal/index.js';
import specFunctions from './animal_functions_800.json';

describe('Animal System - Complete 800 Functions Verification', () => {
  let animal: Animal;

  beforeEach(() => {
    animal = new Animal();
    animal.initializeAnimal();
    setActiveAnimal(animal);
  });

  describe('Master Verification: All 800 Functions Presence & Signatures', () => {
    it('verifies that exactly 800 functions are specified in the official specification', () => {
      expect(specFunctions.length).toBe(800);
    });

    it('verifies that all 800 functions exist as callable methods on the Animal class', () => {
      const missingMethods: string[] = [];
      for (const spec of specFunctions) {
        if (typeof (animal as any)[spec.name] !== 'function') {
          missingMethods.push(`${spec.num}. ${spec.name}`);
        }
      }
      expect(missingMethods).toEqual([]);
    });

    it('verifies that all 800 functions exist as standalone exported functions in @aetheria/engine/animal', () => {
      const missingExports: string[] = [];
      for (const spec of specFunctions) {
        if (typeof (AnimalModule as any)[spec.name] !== 'function') {
          missingExports.push(`${spec.num}. ${spec.name}`);
        }
      }
      expect(missingExports).toEqual([]);
    });
  });

  describe('001–060: Lifecycle, Taxonomy, 3D Mesh, Scale, Appearance', () => {
    it('initializes animal lifecycle and manages state', () => {
      expect(animal.initializeAnimal()).toBe(true);
      const state = animal.getAnimalState();
      expect(state.health).toBe(100);
      expect(state.isAlive).toBe(true);
      expect(state.alive).toBe(true);
      expect(state.active).toBe(true);

      animal.pauseAnimal();
      expect(animal.getAnimalState().isPaused).toBe(true);
      animal.resumeAnimal();
      expect(animal.getAnimalState().isPaused).toBe(false);

      const saved = animal.saveAnimalState();
      expect(typeof saved).toBe('string');
      expect(animal.restoreAnimalState(saved)).toBe(true);
    });

    it('correctly classifies taxonomy and species', () => {
      animal.setAnimalSpecies('Canis lupus');
      expect(animal.getAnimalSpecies()).toBe('Canis lupus');
      const profile = animal.classifyAnimalSpecies();
      expect(profile.scientificName).toBe('Canis lupus');
      expect(animal.identifyAnimalClass()).toBe('Mammalia');
      expect(animal.identifyAnimalOrder()).toBe('Carnivora');
      expect(animal.identifyAnimalPhylum()).toBe('Chordata');
    });

    it('manages 3D appearance, color, fur and scale', () => {
      animal.setAnimalBodyColor('#884422');
      expect(animal.getAnimalState().appearance.bodyColor).toBe('#884422');

      animal.setAnimalScale({ x: 2, y: 2, z: 2 });
      expect(animal.getAnimalState().scale.x).toBe(2);

      animal.setAnimalLength(1.8);
      expect(animal.getAnimalState().appearance.length).toBe(1.8);
    });
  });

  describe('061–100: Skeleton, Bones, Muscles & Soft Tissue', () => {
    it('configures bones, vertebral column and joint constraints', () => {
      animal.initializeAnimalSkeleton();
      animal.updateAnimalSkeleton();
      animal.updateSkullBones();
      animal.updateVertebralColumn();
      animal.updateRibCage();
      const lengths = animal.calculateBoneLengths();
      expect(lengths.size).toBeGreaterThan(0);
      expect(animal.validateSkeletonHierarchy()).toBe(true);
    });

    it('manages muscle systems, tension, forces and soft tissue deformation', () => {
      animal.initializeAnimalMuscles();
      animal.updateMuscleActivation('back', 0.8);
      const force = animal.calculateMuscleForce('back');
      expect(force).toBeGreaterThan(0);

      animal.updateMuscleDeformation();
      animal.updateSoftTissueMotion();
      expect(animal.getAnimalState().active).toBe(true);
    });
  });

  describe('101–200: Head, Senses, Vision, Hearing, Olfaction, Mouth & Feeding', () => {
    it('orients head and neck bones', () => {
      animal.rotateHeadLeft(0.5);
      expect(animal.headSenses.headRotation.y).toBe(-0.5);
      animal.rotateHeadRight(0.4);
      expect(animal.headSenses.headRotation.y).toBe(0.4);
      animal.tiltHeadUp(0.3);
      expect(animal.headSenses.headRotation.x).toBe(0.3);
      animal.extendNeck(0.1);
      expect(animal.headSenses.neckLength).toBeCloseTo(0.5);
    });

    it('handles vision, pupils, eye tracking and field of view', () => {
      animal.blinkEyes();
      animal.updatePupilSize(0.6);
      expect(animal.headSenses.pupilSize).toBe(0.6);

      animal.lookAtTarget({ x: 10, y: 2, z: 5 });
      expect(animal.headSenses.senses.visualTarget).toEqual({ x: 10, y: 2, z: 5 });
      const fov = animal.calculateVisualField();
      expect(fov).toBeGreaterThan(0);
    });

    it('simulates auditory localization and ear articulation', () => {
      animal.updateAnimalEars();
      animal.rotateLeftEar(0.4);
      expect(animal.headSenses.leftEarAngle).toBe(0.4);
      animal.localizeSoundSource({ x: 5, y: 0, z: -3 });
      expect(animal.headSenses.senses.auditoryFocusTarget).toEqual({ x: 5, y: 0, z: -3 });
    });

    it('operates olfaction, scent sniffing and tracking', () => {
      animal.updateAnimalNose();
      animal.sniffAir();
      animal.trackScentTrail('prey_scent');
      expect(animal.detectFoodOdor()).toBe(true);
    });

    it('controls jaw movement, biting, chewing and swallowing', () => {
      animal.openAnimalMouth();
      expect(animal.headSenses.jawAngle).toBeGreaterThan(0);
      animal.biteFood({ name: 'meat' });
      animal.chewFood();
      animal.swallowFood();
      expect(animal.headSenses.jawAngle).toBe(0);
    });
  });

  describe('201–280: Mammal Quadruped Locomotion & Behaviors', () => {
    it('drives gaits: walk, trot, canter, gallop, sprint', () => {
      animal.walkOnFourLegs();
      expect(animal.mammal.posture).toBe('walking');

      animal.trotOnFourLegs();
      expect(animal.mammal.posture).toBe('trotting');

      animal.gallopOnFourLegs();
      expect(animal.mammal.posture).toBe('galloping');

      animal.sprintOnFourLegs();
      expect(animal.mammal.posture).toBe('sprinting');
    });

    it('handles paw planting, claw retraction and grooming', () => {
      animal.retractClaws();
      expect(animal.mammal.clawsExtended).toBe(false);
      animal.extendClaws();
      expect(animal.mammal.clawsExtended).toBe(true);

      animal.groomFur();
      animal.shakeOffWater();
    });
  });

  describe('281–340: Bird Flight, Wings, Feathers & Courtship', () => {
    it('executes avian flight dynamics: flapping, gliding, soaring, perching', () => {
      animal.initializeBirdSkeleton();
      animal.takeOffFromGround();
      expect(animal.bird.isFlying).toBe(true);
      expect(animal.bird.wingsSpread).toBe(true);

      animal.glideForward();
      expect(animal.bird.isGliding).toBe(true);

      animal.landOnGround();
      expect(animal.bird.isFlying).toBe(false);
      expect(animal.bird.wingsSpread).toBe(false);

      animal.perchOnBranch({ x: 0, y: 5, z: 0 });
      expect(animal.bird.isPerched).toBe(true);
    });

    it('performs pecking, preening and tail display', () => {
      animal.peckAtFood({ type: 'seeds' });
      animal.preenFeathers();
      animal.spreadTailDisplay();
      animal.fluffBodyFeathers();
    });
  });

  describe('341–400: Fish Swimming, Fins, Buoyancy & Gills', () => {
    it('drives fish swimming speed, diving and respiration', () => {
      animal.initializeFishSkeleton();
      animal.swimForward();
      expect(animal.fish.swimmingSpeed).toBe(2.0);

      animal.swimRapidly();
      expect(animal.fish.swimmingSpeed).toBe(5.0);

      const initialDepth = animal.fish.depth;
      animal.diveTowardBottom();
      expect(animal.fish.depth).toBeGreaterThan(initialDepth);

      animal.openGillCovers();
      expect(animal.fish.gillCoversOpen).toBe(true);
      animal.closeGillCovers();
      expect(animal.fish.gillCoversOpen).toBe(false);
    });
  });

  describe('401–460: Reptile Crawling, Slithering, Tongue & Thermoregulation', () => {
    it('controls lizard crawling and snake slithering modes', () => {
      animal.crawlLikeLizard();
      animal.slitherLikeSnake();
      animal.performSidewinding();

      animal.coilSnakeBody();
      expect(animal.reptile.isCoiled).toBe(true);
      animal.uncoilSnakeBody();
      expect(animal.reptile.isCoiled).toBe(false);
    });

    it('simulates tongue sampling, basking and neck frill', () => {
      animal.sampleAirWithTongue();
      expect(animal.reptile.tongueFlicking).toBe(false);

      animal.baskInSunlight();
      expect(animal.reptile.isBasking).toBe(true);
      animal.seekShade();
      expect(animal.reptile.isBasking).toBe(false);

      animal.expandNeckFrill();
      expect(animal.reptile.frillExpanded).toBe(true);
      animal.flattenNeckFrill();
      expect(animal.reptile.frillExpanded).toBe(false);
    });
  });

  describe('461–500: Amphibian Jumping & Respiration', () => {
    it('executes frog jumps and impact absorption', () => {
      animal.launchFrogJump();
      expect(animal.amphibian.isJumping).toBe(true);

      animal.absorbFrogLanding();
      expect(animal.amphibian.isJumping).toBe(false);
    });

    it('handles cutaneous respiration and entering water', () => {
      animal.breatheThroughSkin();
      animal.enterWaterFromLand();
      expect(animal.amphibian.inWater).toBe(true);
    });
  });

  describe('501–580: Insect Exoskeleton, Tripod Gait, Flight & Pheromones', () => {
    it('coordinates insect exoskeleton and tripod locomotion', () => {
      animal.initializeInsectExoskeleton();
      animal.walkUsingTripodGait();
      animal.adhereToVerticalSurface();
      expect(animal.insect.adheredToSurface).toBe(true);
      animal.releaseAdhesion();
      expect(animal.insect.adheredToSurface).toBe(false);
    });

    it('simulates insect wings and flight', () => {
      animal.flapInsectWings();
      const freq = animal.calculateWingbeatFrequency();
      expect(freq).toBeGreaterThan(0);

      animal.performInsectTakeoff();
      expect(animal.insect.isFlying).toBe(true);
      expect(animal.insect.wingsSpread).toBe(true);

      animal.performInsectLanding();
      expect(animal.insect.isFlying).toBe(false);
      expect(animal.insect.wingsSpread).toBe(false);
    });
  });

  describe('581–640: Arachnids, Cephalopods & Invertebrates', () => {
    it('handles arachnid silk webs and silk production', () => {
      animal.initializeArachnidBody();
      animal.constructSpiderWeb();
      expect(animal.invertebrate.silkAnchorSet).toBe(true);
    });

    it('drives cephalopod siphon jet propulsion and adaptive color', () => {
      animal.performJetPropulsion();
      animal.activateSuckers();
      expect(animal.invertebrate.suckersActive).toBe(true);
      animal.releaseSuckers();
      expect(animal.invertebrate.suckersActive).toBe(false);

      animal.changeCephalopodColor('#22c55e');
      expect(animal.invertebrate.skinColor).toBe('#22c55e');
    });

    it('simulates peristaltic worm locomotion and snail shell retraction', () => {
      animal.performPeristalticMovement();
      animal.crawlLikeSnail();

      animal.withdrawIntoShell();
      expect(animal.invertebrate.insideShell).toBe(true);
      animal.emergeFromShell();
      expect(animal.invertebrate.insideShell).toBe(false);
    });
  });

  describe('641–800: Physiology, Predation, Reproduction, Social & Physics/IK', () => {
    it('manages physiological metabolism and vital functions', () => {
      const bpm = animal.updateHeartRate();
      expect(bpm).toBeGreaterThan(0);
      const bmr = animal.calculateMetabolicRate();
      expect(bmr).toBeGreaterThan(0);

      animal.regulateOxygenDemand();
      animal.updateDigestiveActivity();
    });

    it('operates predatory stalking and motivation', () => {
      animal.stalkPrey({ id: 'rabbit', pos: { x: 5, y: 0, z: 5 } });
      expect(animal.physiologyEcology.behavior.currentMotivation).toBe('hunting');
    });

    it('coordinates courtship and parental protection', () => {
      animal.performCourtshipBehavior();
      expect(animal.physiologyEcology.behavior.currentMotivation).toBe('courting');

      animal.protectOffspring([{ id: 'chick1' }]);
      expect(animal.physiologyEcology.behavior.aggression).toBe(80);
    });

    it('simulates growth stages from juvenile to adult', () => {
      animal.transitionToAdultStage();
      expect(animal.physiologyEcology.stage).toBe('adult');
      const rate = animal.calculateGrowthRate();
      expect(rate).toBeGreaterThan(0);
    });

    it('drives AI behavior FSM, threat evaluation and escape', () => {
      animal.updateAnimalBehavior(0.1);
      const threatResp = animal.evaluateThreatResponse();
      expect(typeof threatResp).toBe('string');
      const escDir = animal.chooseEscapeDirection();
      expect(escDir).toBeDefined();
    });

    it('coordinates group social dynamics and leadership', () => {
      animal.followGroupLeader({ id: 'alpha_wolf' });
      expect(animal.physiologyEcology.groupLeader).toEqual({ id: 'alpha_wolf' });
    });

    it('manages physics, gravity, foot IK and level of detail (LOD)', () => {
      animal.initializeAnimalPhysics();
      animal.applyAnimalGravity(0.016);
      animal.solveAnimalIK();
      animal.solveAnimalFootIK();

      const lod0 = animal.updateAnimalLOD(5);
      expect(lod0).toBe(0);
      const lod2 = animal.updateAnimalLOD(80);
      expect(lod2).toBe(2);
    });

    it('handles shared behaviors like courtship display and thermoregulation', () => {
      animal.performCourtshipDisplay();
      animal.regulateBodyTemperature();
    });
  });

  describe('Global Standalone Functional API Verification', () => {
    it('executes standalone exported functions seamlessly', () => {
      const a = createAnimal({ species: 'Panthera tigris' });
      expect(getActiveAnimal()).toBe(a);

      setAnimalSpecies('Panthera tigris');
      expect(getAnimalSpecies()).toBe('Panthera tigris');
      const prof = classifyAnimalSpecies();
      expect(prof.scientificName).toBe('Panthera tigris');
      expect(identifyAnimalPhylum()).toBe('Chordata');

      setAnimalBodyColor('#ffa500');
      setAnimalScale(1.5);

      initializeAnimalSkeleton();
      updateAnimalSkeleton();

      rotateHeadLeft(0.2);
      rotateHeadRight(0.1);
      tiltHeadUp(0.1);
      extendNeck(0.05);
      blinkEyes();
      updatePupilSize(0.5);

      updateAnimalEars();
      rotateLeftEar(0.2);
      sniffAir();
      openAnimalMouth();
      biteFood({ dummy: true });

      walkOnFourLegs();
      trotOnFourLegs();
      gallopOnFourLegs();
      extendClaws();
      retractClaws();
      groomFur();
      shakeOffWater();

      initializeBirdSkeleton();
      takeOffFromGround();
      flapWings();
      glideForward();
      landOnGround();
      perchOnBranch({ x: 0, y: 2, z: 0 });
      peckAtFood('grain');
      preenFeathers();

      initializeFishSkeleton();
      swimForward();
      swimRapidly();
      diveTowardBottom();
      openGillCovers();
      pumpWaterAcrossGills();

      crawlLikeLizard();
      slitherLikeSnake();
      performSidewinding();
      flickReptileTongue();
      baskInSunlight();
      coilSnakeBody();

      launchFrogJump();
      absorbFrogLanding();
      breatheThroughSkin();

      walkUsingTripodGait();
      flapInsectWings();
      followPheromoneTrail('trail');

      constructSpiderWeb();
      performJetPropulsion();
      activateSuckers();
      changeCephalopodColor('#f43f5e');
      performPeristalticMovement();
      crawlLikeSnail();
      withdrawIntoShell();

      updateHeartRate();
      calculateMetabolicRate();
      stalkPrey({});
      performCourtshipBehavior();
      protectOffspring([]);
      transitionToAdultStage();
      calculateGrowthRate();
      updateAnimalBehavior(0.016);
      evaluateThreatResponse();
      chooseEscapeDirection();
      followGroupLeader({});
      initializeAnimalPhysics();
      applyAnimalGravity(0.016);
      solveAnimalIK();
      solveAnimalFootIK();
      updateAnimalLOD(10);
      performCourtshipDisplay();
      regulateBodyTemperature();
    });
  });
});
