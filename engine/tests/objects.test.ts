/**
 * @file objects.test.ts
 * @description Comprehensive unit tests for @aetheria/engine domain game objects,
 * generic classes, interfaces, and methods across RPG, Fantasy, and Action genres.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  // Attributes & Resources
  HealthPool,
  ManaPool,
  EnergyPool,
  RagePool,
  FuryMeter,
  SanityPool,
  ShieldGauge,
  ArmorPlating,
  AttributeSystem,
  // Inventory & Items
  Inventory,
  InventoryGrid,
  EquipmentSlots,
  LootTable,
  StorageContainer,
  Item,
  EquipmentItem,
  // Skills & Combat
  Skill,
  SkillBar,
  SkillTree,
  ComboChain,
  Spell,
  PassiveAbility,
  DamageInstance,
  DamageCalculator,
  Hitbox,
  ThreatTable,
  CombatLog,
  // Entities
  Entity,
  Player,
  NPC,
  Bot,
  Pet,
  Mount,
  // World Objects
  WorldObject,
  TreeObject,
  HouseObject,
  HarvestableResource,
  BreakableObject,
  InteractiveSwitch,
  CampfireObject,
  PortalGate,
  // Status & Effects
  StatusEffect,
  Buff,
  Debuff,
  CrowdControl,
  StatusContainer,
  AnimationStateController,
  // Skins & Cosmetics
  Skin,
  CosmeticLoadout,
  OutfitCustomizer,
  AuraEffect,
  // Time & Events
  GameClock,
  SeasonManager,
  CooldownTimer,
  GameEvent,
  EventDispatcher,
  ScheduledTaskManager,
  // Progression
  ExperienceCurve,
  LevelSystem,
  ClassProgression,
  AchievementSystem,
  TitleSystem,
  // Crafting & Economy
  Recipe,
  CraftingStation,
  CurrencyWallet,
  TradeSession,
  Marketplace,
  // Quests & Dialogue
  Quest,
  QuestLog,
  DialogueTree,
  FactionReputation,
  // Physics & Gravity
  PhysicsObject,
  GravityModifier,
  BuoyancyVolume,
  DestructibleRigidBody,
  // Weather & Ecosystem
  WeatherZone,
  BiomeDescriptor,
  EcosystemController,
  // Network
  NetworkEntity,
  SnapshotBuffer,
} from '../src/index.js';

describe('Aetheria Engine - Generic Game Objects & Systems', () => {
  // ==========================================================================
  // 1. Attributes & Pools
  // ==========================================================================
  describe('Attributes & Resource Pools', () => {
    it('manages HealthPool with damage, heal, shields, and death events', () => {
      const hp = new HealthPool(100, { ratePerSecond: 10, enabled: true });
      const deathFn = vi.fn();
      hp.onDeathCallbacks.push(deathFn);

      expect(hp.current).toBe(100);
      expect(hp.percent).toBe(1.0);
      expect(hp.isDead).toBe(false);

      // Add a shield
      const shield = new ShieldGauge('shield_1', 30, 5);
      hp.addShield(shield);
      expect(hp.getTotalShield()).toBe(30);

      // Damage absorbed by shield first
      hp.damage(20);
      expect(shield.strength).toBe(10);
      expect(hp.current).toBe(100); // HP unhurt

      // Damage breaks shield and affects HP
      hp.damage(25);
      expect(shield.isDepleted).toBe(true);
      expect(hp.current).toBe(85);

      // Heal
      hp.heal(10);
      expect(hp.current).toBe(95);

      // Lethal damage
      hp.damage(200);
      expect(hp.current).toBe(0);
      expect(hp.isDead).toBe(true);
      expect(deathFn).toHaveBeenCalledOnce();

      // Revive
      hp.revive(0.5);
      expect(hp.current).toBe(50);
      expect(hp.isDead).toBe(false);
    });

    it('manages ManaPool and EnergyPool constraints and regeneration', () => {
      const mana = new ManaPool(100, 10);
      expect(mana.consume(40)).toBe(true);
      expect(mana.current).toBe(60);
      expect(mana.canCast(80)).toBe(false);

      mana.setReserve(30);
      expect(mana.available).toBe(30);

      mana.tick(1.0);
      expect(mana.current).toBe(70);

      const energy = new EnergyPool(100, 20, 15);
      expect(energy.expend(90)).toBe(true);
      expect(energy.current).toBe(10);
      expect(energy.isExhausted).toBe(true);

      energy.recover(50);
      expect(energy.isExhausted).toBe(false);
    });

    it('manages RagePool, FuryMeter, SanityPool, and ArmorPlating', () => {
      const rage = new RagePool(100, 10, 1);
      rage.generate(50);
      expect(rage.current).toBe(50);
      expect(rage.spend(30)).toBe(true);
      expect(rage.current).toBe(20);

      const fury = new FuryMeter(5);
      fury.addPoints(3);
      expect(fury.points).toBe(3);
      expect(fury.consumeAll()).toBe(3);
      expect(fury.points).toBe(0);

      const sanity = new SanityPool(100);
      sanity.drain(100);
      expect(sanity.isInsane).toBe(true);

      const armor = new ArmorPlating(100, 0.3);
      expect(armor.mitigation).toBe(0.3);
      armor.degrade(100);
      expect(armor.isBroken).toBe(true);
      expect(armor.mitigation).toBe(0);
    });

    it('calculates dynamic attributes with flat and percentage modifiers', () => {
      interface CustomStats {
        strength: number;
        agility: number;
      }
      const attrs = new AttributeSystem<CustomStats>({ strength: 100, agility: 50 });

      expect(attrs.getBase('strength')).toBe(100);
      expect(attrs.getModified('strength')).toBe(100);

      attrs.addModifier('strength', { id: 'mod_1', type: 'flat', value: 20 });
      expect(attrs.getModified('strength')).toBe(120);

      attrs.addModifier('strength', { id: 'mod_2', type: 'percent_add', value: 0.1 });
      // (100 + 20) * (1 + 0.1) = 132
      expect(attrs.getModified('strength')).toBe(132);

      attrs.removeModifier('strength', 'mod_1');
      // 100 * 1.1 = 110
      expect(attrs.getModified('strength')).toBeCloseTo(110);
    });
  });

  // ==========================================================================
  // 2. Inventory, Items & Equipment
  // ==========================================================================
  describe('Inventory & Equipment Systems', () => {
    interface TestItemMeta {
      glow?: boolean;
    }

    it('manages item stacking, weight limits, and sorting', () => {
      const inv = new Inventory<Item<TestItemMeta>>(10, 50);
      const potion: Item<TestItemMeta> = {
        id: 'health_pot',
        name: 'Health Potion',
        category: 'consumable',
        rarity: 'common',
        maxStack: 5,
        weight: 0.5,
      };

      expect(inv.addItem(potion, 3)).toBe(true);
      expect(inv.getItemCount('health_pot')).toBe(3);
      expect(inv.totalWeight).toBe(1.5);

      // Stack more into same slot
      expect(inv.addItem(potion, 4)).toBe(true);
      expect(inv.getItemCount('health_pot')).toBe(7);

      expect(inv.removeItem('health_pot', 2)).toBe(true);
      expect(inv.getItemCount('health_pot')).toBe(5);
    });

    it('handles 2D grid inventory slot placement and collision', () => {
      const grid = new InventoryGrid(6, 4);
      const sword: Item = { id: 'iron_sword', name: 'Iron Sword', category: 'weapon', rarity: 'common' };
      const shield: Item = { id: 'wood_shield', name: 'Wooden Shield', category: 'armor', rarity: 'common' };

      // Place 2x1 sword at (0,0)
      expect(grid.canPlace(0, 0, 2, 1)).toBe(true);
      expect(grid.placeItem(sword, 0, 0, 2, 1)).toBe(true);

      // Overlapping placement should fail
      expect(grid.canPlace(1, 0, 2, 2)).toBe(false);

      // Free space placement succeeds
      expect(grid.placeItem(shield, 2, 0, 2, 2)).toBe(true);
      expect(grid.getItemAt(0, 0)?.id).toBe('iron_sword');
      expect(grid.getItemAt(2, 0)?.id).toBe('wood_shield');

      // Remove sword
      expect(grid.removeItem('iron_sword')).toBe(true);
      expect(grid.getItemAt(0, 0)).toBeNull();
    });

    it('equips gear and computes combined stats', () => {
      type Slot = 'head' | 'chest' | 'main_hand';
      interface GearStats {
        attack: number;
        defense: number;
      }
      const equip = new EquipmentSlots<Slot, EquipmentItem<Slot, GearStats>>(['head', 'chest', 'main_hand']);

      const sword: EquipmentItem<Slot, GearStats> = {
        id: 'blade',
        name: 'Blade',
        category: 'weapon',
        rarity: 'rare',
        slot: 'main_hand',
        stats: { attack: 25, defense: 0 },
      };

      const helm: EquipmentItem<Slot, GearStats> = {
        id: 'iron_helm',
        name: 'Iron Helm',
        category: 'armor',
        rarity: 'uncommon',
        slot: 'head',
        stats: { attack: 2, defense: 15 },
      };

      equip.equip('main_hand', sword);
      equip.equip('head', helm);

      expect(equip.isSlotEquipped('main_hand')).toBe(true);
      expect(equip.getEquipped('head')?.name).toBe('Iron Helm');

      const totalStats = equip.computeCombinedStats();
      expect(totalStats.attack).toBe(27);
      expect(totalStats.defense).toBe(15);
    });

    it('rolls loot from LootTable and stores in StorageContainer', () => {
      const table = new LootTable();
      const goldCoin: Item = { id: 'gold', name: 'Gold Coin', category: 'currency', rarity: 'common' };
      const rareGem: Item = { id: 'ruby', name: 'Ruby', category: 'material', rarity: 'rare' };

      table.addDrop({ item: goldCoin, weight: 10, minQuantity: 5, maxQuantity: 10, isGuaranteed: true });
      table.addDrop({ item: rareGem, weight: 1, minQuantity: 1, maxQuantity: 1 });

      const drops = table.rollDrops();
      expect(drops.length).toBeGreaterThanOrEqual(1);
      expect(drops[0].item.id).toBe('gold');

      // Storage chest
      const chest = new StorageContainer('chest_01', 'Treasure Chest', 10, true, 'iron_key');
      expect(chest.isLocked).toBe(true);
      expect(chest.deposit(goldCoin, 5)).toBe(false); // Locked

      expect(chest.unlock('wrong_key')).toBe(false);
      expect(chest.unlock('iron_key')).toBe(true);
      expect(chest.isLocked).toBe(false);

      expect(chest.deposit(goldCoin, 5)).toBe(true);
      expect(chest.inventory.getItemCount('gold')).toBe(5);
    });
  });

  // ==========================================================================
  // 3. Skills, Spells & Combos
  // ==========================================================================
  describe('Skills & Action Combos', () => {
    it('manages skill cooldowns, resource costs, and skill bar execution', () => {
      const fireball = new Skill({
        id: 'fireball',
        name: 'Fireball',
        cooldown: 2.0,
        cost: { type: 'mana', amount: 30 },
      });

      const fakeCaster = {
        mana: new ManaPool(100),
      };

      expect(fireball.isReady).toBe(true);
      expect(fireball.canActivate(fakeCaster)).toBe(true);

      expect(fireball.execute(fakeCaster)).toBe(true);
      expect(fakeCaster.mana.current).toBe(70);
      expect(fireball.isReady).toBe(false);
      expect(fireball.remainingCooldown).toBe(2.0);

      // Cooldown tick
      fireball.tick(1.0);
      expect(fireball.remainingCooldown).toBe(1.0);
      fireball.tick(1.0);
      expect(fireball.isReady).toBe(true);

      // Skill bar
      const bar = new SkillBar(4);
      bar.setSlot(0, fireball);
      expect(bar.getSlot(0)?.name).toBe('Fireball');
      expect(bar.triggerSlot(0, fakeCaster)).toBe(true);
    });

    it('navigates skill tree prerequisites and node ranking', () => {
      const tree = new SkillTree();
      const strike = new Skill({ id: 'strike', name: 'Strike' });
      const heavySlash = new Skill({ id: 'heavy_slash', name: 'Heavy Slash' });

      tree.addNode({ id: 'node_strike', skill: strike, tier: 1, costPoints: 1 });
      tree.addNode({
        id: 'node_heavy',
        skill: heavySlash,
        tier: 2,
        costPoints: 2,
        requiredNodeIds: ['node_strike'],
      });

      expect(tree.canUnlockNode('node_strike')).toBe(true);
      expect(tree.canUnlockNode('node_heavy')).toBe(false); // Locked by prerequisite

      tree.unlockNode('node_strike', 1);
      expect(tree.isNodeUnlocked('node_strike')).toBe(true);

      expect(tree.canUnlockNode('node_heavy')).toBe(true);
      tree.unlockNode('node_heavy', 2);
      expect(tree.isNodeUnlocked('node_heavy')).toBe(true);
      expect(tree.getUnlockedSkills().length).toBe(2);
    });

    it('executes timing-based action combo chains', () => {
      const combo = new ComboChain();
      combo.registerStep({
        stepIndex: 0,
        requiredInput: 'attack_light',
        windowDuration: 0.5,
        moveData: 'Punch',
        damageMultiplier: 1.0,
      });
      combo.registerStep({
        stepIndex: 1,
        requiredInput: 'attack_light',
        windowDuration: 0.5,
        moveData: 'Kick',
        damageMultiplier: 1.5,
      });
      combo.registerStep({
        stepIndex: 2,
        requiredInput: 'attack_heavy',
        windowDuration: 0.5,
        moveData: 'Uppercut',
        damageMultiplier: 2.5,
      });

      const s0 = combo.inputAction('attack_light');
      expect(s0?.moveData).toBe('Punch');
      expect(combo.getComboMultiplier()).toBe(1.0);

      const s1 = combo.inputAction('attack_light');
      expect(s1?.moveData).toBe('Kick');
      expect(combo.getComboMultiplier()).toBe(1.5);

      const s2 = combo.inputAction('attack_heavy');
      expect(s2?.moveData).toBe('Uppercut');
      expect(combo.isCompleted()).toBe(true);
      expect(combo.getComboMultiplier()).toBe(2.5);
    });
  });

  // ==========================================================================
  // 4. Entities: Player, NPC, Bot, Pet, Mount
  // ==========================================================================
  describe('Generic Game Entities', () => {
    it('initializes Player entity with full stats, inventory, and skills', () => {
      interface CustomHeroStats {
        str: number;
        int: number;
      }
      const player = new Player<CustomHeroStats>('p1', 'DragonKnight', {
        maxHealth: 200,
        maxMana: 150,
      });

      expect(player.health.max).toBe(200);
      expect(player.mana.max).toBe(150);
      expect(player.hasTag('player')).toBe(true);

      player.levelSystem.addExp(300);
      expect(player.levelSystem.currentLevel).toBeGreaterThan(1);
      expect(player.levelSystem.unspentStatPoints).toBeGreaterThan(0);

      player.levelSystem.allocateStatPoint('str', 2);
      expect(player.levelSystem.getAllocatedStat('str')).toBe(2);
    });

    it('interacts with NPC dialogue', () => {
      const dialogue = { welcomeText: 'Greetings traveler!' };
      const npc = new NPC('npc_blacksmith', 'Thorin', 'Blacksmith', dialogue);
      const player = new Player('p1', 'Hero');

      expect(npc.role).toBe('Blacksmith');
      const prompt = npc.interact(player);
      expect(prompt.action).toBe('open_dialogue');
      expect(npc.state.isTalking).toBe(true);
    });

    it('drives Bot AI state machine based on target perception distance', () => {
      const bot = new Bot('orc_01', 'Orc Grunt', 120);
      const player = new Player('p1', 'Hero');
      player.setPosition(10, 0, 0);
      bot.setPosition(0, 0, 0);

      bot.setTarget(player);
      bot.perceptionRadius = 15;
      bot.attackRadius = 2;

      bot.update(0.1);
      expect(bot.state.aiState).toBe('chase');

      // Move player into attack range
      player.setPosition(1, 0, 0);
      bot.update(0.1);
      expect(bot.state.aiState).toBe('attack');

      // Move player far away
      player.setPosition(50, 0, 0);
      bot.update(0.1);
      expect(bot.targetEntity).toBeNull();
      expect(bot.state.aiState).toBe('idle');
    });

    it('follows owner with Pet and coordinates Mount travel', () => {
      const player = new Player('p1', 'Hero');
      player.setPosition(10, 0, 0);

      const wolf = new Pet('pet_wolf', 'Fenrir', player);
      wolf.setPosition(0, 0, 0);
      wolf.update(0.5);
      // Pet moves closer to owner
      expect(wolf.transform.position[0]).toBeGreaterThan(0);

      const horse = new Mount('mount_horse', 'Roach', 1.8);
      expect(horse.mount(player)).toBe(true);
      expect(horse.state.isMounted).toBe(true);

      horse.setPosition(20, 0, 0);
      horse.update(0.1);
      // Rider transform syncs to mount
      expect(player.transform.position[0]).toBe(20);

      expect(horse.dismount()?.id).toBe('p1');
      expect(horse.state.isMounted).toBe(false);
    });
  });

  // ==========================================================================
  // 5. World Objects: Trees, Houses, Breakables, Switches
  // ==========================================================================
  describe('World Objects & Environmental Props', () => {
    it('chops TreeObject until felled and regrows over time', () => {
      const tree = new TreeObject('oak_1', 'oak', 'canopy', 30, 4);
      expect(tree.isFelled).toBe(false);

      const r1 = tree.chop(10);
      expect(r1.felled).toBe(false);
      expect(tree.health).toBe(20);

      const r2 = tree.chop(20);
      expect(r2.felled).toBe(true);
      expect(r2.logsProduced).toBe(4);
      expect(tree.isFelled).toBe(true);

      // Regrowth tick
      tree.update(121);
      expect(tree.isFelled).toBe(false);
      expect(tree.health).toBe(30);
    });

    it('manages HouseObject occupants and roof visibility', () => {
      const house = new HouseObject('house_01', 'manor', 4);
      expect(house.isRoofVisible).toBe(true);

      house.enter('player_1');
      expect(house.isOccupied()).toBe(true);
      expect(house.isRoofVisible).toBe(false); // Roof hidden for interior view

      house.exit('player_1');
      expect(house.isOccupied()).toBe(false);
      expect(house.isRoofVisible).toBe(true);
    });

    it('mines HarvestableResource and shatters BreakableObject into shards', () => {
      const ironVein = new HarvestableResource('ore_01', 'iron_ore', 1, 3, 30);
      const yields = ironVein.harvest(2);
      expect(yields[0].quantity).toBe(2);
      expect(ironVein.remainingUnits).toBe(1);

      const pot = new BreakableObject('pot_01', 'clay_urn', 15, 4);
      const shards = pot.shatter(20);
      expect(pot.isBroken).toBe(true);
      expect(shards.length).toBe(4);
      expect(shards[0].linearVelocity).toBeDefined();
    });

    it('locks and toggles InteractiveSwitch', () => {
      const lever = new InteractiveSwitch('lever_1', 'Gate Lever', 'closed');
      expect(lever.toggle()).toBe(true);
      expect(lever.state).toBe('open');

      lever.lock('master_key');
      expect(lever.toggle()).toBe(false); // Locked

      expect(lever.unlock('wrong')).toBe(false);
      expect(lever.unlock('master_key')).toBe(true);
      expect(lever.toggle()).toBe(true);
    });

    it('burns CampfireObject fuel and validates PortalGate teleportation', () => {
      const fire = new CampfireObject('camp_1', 5, 10);
      expect(fire.isLit).toBe(true);
      fire.update(11);
      expect(fire.isLit).toBe(false);

      const portal = new PortalGate('portal_abyss', 'Abyss Gate', {
        position: [100, 0, 100],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      }, 'abyss_rune');

      expect(portal.canTeleport()).toBe(false);
      expect(portal.canTeleport('abyss_rune')).toBe(true);
      expect(portal.getDestination().position).toEqual([100, 0, 100]);
    });
  });

  // ==========================================================================
  // 6. Status Effects & Animation State
  // ==========================================================================
  describe('Status Effects & Animations', () => {
    it('applies Buffs, DoT Debuffs, and manages CrowdControl', () => {
      const container = new StatusContainer();
      const strBuff = new Buff('buff_str', 'Giant Strength', 'strength', 25, 10);
      container.applyStatus(strBuff);

      expect(container.hasStatus('buff_str')).toBe(true);

      // Apply Stun
      const stun = new CrowdControl('cc_stun', 'Stunned', 'stun', 2);
      container.applyStatus(stun);

      expect(container.isUnderCC('stun')).toBe(true);
      expect(container.canMove()).toBe(false);
      expect(container.canAttack()).toBe(false);

      // Tick 2.5s -> stun expires
      container.tick(2.5);
      expect(container.isUnderCC('stun')).toBe(false);
      expect(container.canMove()).toBe(true);
    });

    it('switches animation states via AnimationStateController', () => {
      const anim = new AnimationStateController();
      expect(anim.currentState).toBe('idle');

      anim.addTransition('idle', 'running', (p) => (p.get('speed') ?? 0) > 0.1);
      anim.addTransition('running', 'idle', (p) => (p.get('speed') ?? 0) <= 0.1);

      anim.setFloat('speed', 4.5);
      expect(anim.currentState).toBe('running');

      anim.setFloat('speed', 0);
      expect(anim.currentState).toBe('idle');
    });
  });

  // ==========================================================================
  // 7. Skins & Cosmetics
  // ==========================================================================
  describe('Skins & Visual Customizations', () => {
    it('equips cosmetic skins and applies dyes', () => {
      const loadout = new CosmeticLoadout();
      const helmetSkin = new Skin('skin_dragon_helm', 'Dragon Helmet Skin', 'head');
      helmetSkin.applyDye('primary', '#ff0000');

      loadout.equipSkin(helmetSkin);
      expect(loadout.isSlotEquipped('head')).toBe(true);
      expect(loadout.getSkin('head')?.getDye('primary')).toBe('#ff0000');

      const aura = new AuraEffect('aura_divine', 'Divine Aura', '#e0e7ff');
      aura.attach('player_01');
      expect(aura.isAttached).toBe(true);
      expect(aura.getTargetId()).toBe('player_01');
    });
  });

  // ==========================================================================
  // 8. Time, Seasons & Cooldowns
  // ==========================================================================
  describe('Time Clocks & Seasons', () => {
    it('tracks GameClock day/night cycles and advances hours', () => {
      const clock = new GameClock(12, 60);
      expect(clock.getPhase()).toBe('noon');
      expect(clock.isNight).toBe(false);

      clock.setTime(22, 0);
      expect(clock.getPhase()).toBe('midnight');
      expect(clock.isNight).toBe(true);

      const hourFn = vi.fn();
      clock.onHourPassed = hourFn;
      clock.advance(60); // 60s real = 1 game hr
      expect(hourFn).toHaveBeenCalled();
    });

    it('transitions seasons and adjusts seasonal temperature', () => {
      const seasons = new SeasonManager('spring', 5);
      expect(seasons.currentSeason).toBe('spring');

      for (let i = 0; i < 5; i++) seasons.advanceDay();
      expect(seasons.currentSeason).toBe('summer');
      expect(seasons.getTemperatureModifier()).toBe(10.0);
    });

    it('tracks skill CooldownTimers', () => {
      const cd = new CooldownTimer();
      cd.setCooldown('dash', 3.0);
      expect(cd.isReady('dash')).toBe(false);
      expect(cd.getRemaining('dash')).toBe(3.0);

      cd.tick(1.5);
      expect(cd.getRemaining('dash')).toBe(1.5);
      expect(cd.getPercent('dash')).toBe(0.5);

      cd.tick(1.5);
      expect(cd.isReady('dash')).toBe(true);
    });
  });

  // ==========================================================================
  // 9. Combat, Damage & Aggro
  // ==========================================================================
  describe('Combat & Damage Formulas', () => {
    it('calculates damage with mitigation and crit checks', () => {
      const calc = new DamageCalculator(100, 2.0);
      const attacker = { stats: { strength: 40, critChance: 0 } };
      const target = { stats: { defense: 100 } }; // 100 / (100 + 100) = 50% reduction

      const dmg = calc.calculate(attacker, target, 50, 'physical');
      // base 50 + (40 * 0.5) = 70. Mitigated by 50% = 35.
      expect(dmg.effectiveAmount).toBe(35);
    });

    it('tracks boss ThreatTable priorities', () => {
      const threat = new ThreatTable<string>();
      threat.addThreat('tank', 500);
      threat.addThreat('dps', 800);
      threat.addThreat('healer', 300);

      expect(threat.getTopThreat()).toBe('dps');

      threat.reduceThreat('dps', 400);
      expect(threat.getTopThreat()).toBe('tank');
    });
  });

  // ==========================================================================
  // 10. Quests & Dialogue
  // ==========================================================================
  describe('Quests & Dialogue Trees', () => {
    it('progresses quest objectives and awards completed rewards', () => {
      const quest = new Quest(
        'q_wolves',
        'Cull the Wolves',
        'Defeat 3 dire wolves near the town.',
        [{ id: 'kill_wolves', description: 'Kill wolves', type: 'kill', target: 'dire_wolf', currentAmount: 0, requiredAmount: 3 }],
        [{ exp: 500, gold: 50 }]
      );

      expect(quest.start()).toBe(true);
      expect(quest.status).toBe('active');

      quest.progressObjective('kill_wolves', 2);
      expect(quest.isComplete()).toBe(false);

      quest.progressObjective('kill_wolves', 1);
      expect(quest.isComplete()).toBe(true);

      const rewards = quest.complete();
      expect(rewards[0].gold).toBe(50);
    });

    it('navigates branching dialogue options', () => {
      const tree = new DialogueTree();
      tree.addNode({
        id: 'start',
        speaker: 'Elder',
        text: 'Hello traveller.',
        choices: [
          { text: 'Ask about ruins', nextNodeId: 'ruins' },
          { text: 'Leave', nextNodeId: undefined },
        ],
      });
      tree.addNode({
        id: 'ruins',
        speaker: 'Elder',
        text: 'The ruins are dangerous!',
        choices: [{ text: 'Thank you.', nextNodeId: undefined }],
      });

      expect(tree.startDialogue('start')?.id).toBe('start');
      const next = tree.chooseOption(0);
      expect(next?.id).toBe('ruins');
      expect(tree.chooseOption(0)).toBeNull(); // Ended
    });
  });

  // ==========================================================================
  // 11. Crafting & Economy
  // ==========================================================================
  describe('Crafting & Economy', () => {
    it('crafts items and manages CurrencyWallet balances', () => {
      const wallet = new CurrencyWallet({ gold: 100, gems: 5 });
      expect(wallet.has('gold', 50)).toBe(true);
      expect(wallet.withdraw('gold', 40)).toBe(true);
      expect(wallet.getBalance('gold')).toBe(60);

      const recipe = new Recipe({
        id: 'craft_potion',
        name: 'Health Potion',
        station: 'alchemy',
        requiredLevel: 1,
        craftingTimeSeconds: 2,
        inputs: [{ itemId: 'herb_red', count: 2 }],
        output: { itemId: 'pot_health', count: 1 },
      });

      const inv = new Inventory(10);
      inv.addItem({ id: 'herb_red', name: 'Red Herb', category: 'material', rarity: 'common' }, 5);

      expect(recipe.canCraft(inv, 1)).toBe(true);
      const out = recipe.craft(inv, 1);
      expect(out?.itemId).toBe('pot_health');
      expect(inv.getItemCount('herb_red')).toBe(3);
    });
  });

  // ==========================================================================
  // 12. Physics, Gravity & Buoyancy
  // ==========================================================================
  describe('Physics & Gravity Modifiers', () => {
    it('simulates forces, velocity damping, and buoyancy lift', () => {
      const obj = new PhysicsObject('dynamic', 2.0, 0.1);
      obj.applyForce(0, 50, 0);
      obj.updatePhysics(0.1, [0, -9.81, 0]);

      expect(obj.velocity[1]).toBeGreaterThan(0);

      // Water volume
      const water = new BuoyancyVolume(0, 1000);
      obj.position = [0, -1, 0]; // Submerged
      water.applyBuoyancy(obj, 0.5);
      expect(obj.forces[1]).toBeGreaterThan(0); // Upward buoyant force
    });

    it('calculates radial gravity from GravityModifier', () => {
      const gravZone = new GravityModifier('black_hole', [0, 0, 0], 20, [10, 0, 0], true);
      const g = gravZone.calculateGravityAt([10, 0, 0]);
      expect(g).not.toBeNull();
      // Should pull along negative X axis towards center
      expect(g![0]).toBeLessThan(0);
    });
  });

  // ==========================================================================
  // 13. Network Entities & Snapshot Buffers
  // ==========================================================================
  describe('Network Synchronization & Prediction', () => {
    it('packs state, unpacks replication payloads, and interpolates snapshots', () => {
      const netEntity = new NetworkEntity('entity_777', { health: 100, team: 'red' });
      const packet = netEntity.packState();
      expect(packet.entityId).toBe('entity_777');
      expect(packet.payload.health).toBe(100);

      const buffer = new SnapshotBuffer();
      buffer.pushSnapshot({ timestamp: 1000, state: {}, position: [0, 0, 0] });
      buffer.pushSnapshot({ timestamp: 2000, state: {}, position: [10, 0, 0] });

      const midPos = buffer.getInterpolatedPosition(1500);
      expect(midPos).not.toBeNull();
      expect(midPos![0]).toBe(5); // Midpoint interpolation
    });
  });
});
