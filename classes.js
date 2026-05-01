// ============================================================
// CLASS DEFINITIONS — Forge & Fate
// ============================================================
import { COLORS } from './constants.js';

export const CLASSES = {
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    icon: '⚙',
    color: COLORS.ENGINEER,
    tagline: 'Master of Machines',
    description: 'Optimizes production chains. Buildings work faster and chain together more efficiently.',
    startingResources: { gold: 300, ore: 10, metal: 5 },
    passives: [
      'All production buildings +20% speed',
      'Buildings cost 10% less Metal',
      'Start with Overdrive Pylon blueprint',
    ],
    ability: {
      name: 'Overclock',
      icon: '⚡',
      description: 'All buildings produce 3× output for 8 seconds.',
      cooldown: 30000,
      duration: 8000,
      effect: 'overclock',
    },
    uniqueRelics: ['engineers_blueprint', 'nano_lubricant', 'perpetual_engine', 'assembly_algorithm', 'mech_heart'],
    startBuildings: ['mine', 'generator', 'overdrivePylon'],
  },

  alchemist: {
    id: 'alchemist',
    name: 'Alchemist',
    icon: '🔮',
    color: COLORS.ALCHEMIST,
    tagline: 'Transmuter of Realities',
    description: 'Bends resource rules. Converts freely between materials and creates potent elixirs.',
    startingResources: { gold: 250, crystal: 5, essence: 3 },
    passives: [
      'Resources convert at 90% efficiency (normally 50%)',
      'Essence produces 25% more per tick',
      'Start with Transmutation Circle blueprint',
    ],
    ability: {
      name: 'Grand Transmutation',
      icon: '🧪',
      description: 'Converts ALL current resources into Gold at 150% value.',
      cooldown: 45000,
      duration: 0,
      effect: 'grand_transmutation',
    },
    uniqueRelics: ['philosophers_stone', 'elixir_of_greed', 'chaos_catalyst', 'void_lens', 'mercury_heart'],
    startBuildings: ['crystalExtractor', 'transmutationCircle', 'mine'],
  },

  warlord: {
    id: 'warlord',
    name: 'Warlord',
    icon: '⚔',
    color: COLORS.WARLORD,
    tagline: 'Bringer of Ruin',
    description: 'Turns the battlefield into a war machine. Units and towers hit hard and fast.',
    startingResources: { gold: 350, ore: 15, metal: 10 },
    passives: [
      'Turrets deal +30% damage',
      'Soldiers start with 25% more HP',
      'Start with Barracks blueprint',
    ],
    ability: {
      name: 'War Cry',
      icon: '🔥',
      description: 'All combat buildings and units deal 2× damage for 10 seconds.',
      cooldown: 35000,
      duration: 10000,
      effect: 'war_cry',
    },
    uniqueRelics: ['blade_of_conquest', 'berserker_seal', 'iron_resolve', 'commanders_banner', 'siege_mastery'],
    startBuildings: ['turret', 'mine', 'barracks'],
  },

  naturalist: {
    id: 'naturalist',
    name: 'Naturalist',
    icon: '🌿',
    color: COLORS.NATURALIST,
    tagline: 'Voice of the Wild',
    description: 'Uses organic growth and essence to power a self-sustaining ecosystem of defenses.',
    startingResources: { gold: 200, essence: 8, ore: 5 },
    passives: [
      'Essence costs halved',
      'Growth Spire aura range +1',
      'Walls regenerate 2 HP/s',
    ],
    ability: {
      name: 'Overgrowth',
      icon: '🌳',
      description: 'Temporarily spawns 3 Thornwalls and doubles all Naturalist building output for 12s.',
      cooldown: 40000,
      duration: 12000,
      effect: 'overgrowth',
    },
    uniqueRelics: ['root_network', 'spore_bloom', 'earthen_heart', 'hivemind_link', 'verdant_engine'],
    startBuildings: ['essenceCollector', 'growthSpire', 'thornwall'],
  },

  chronomancer: {
    id: 'chronomancer',
    name: 'Chronomancer',
    icon: '⏳',
    color: COLORS.CHRONOMANCER,
    tagline: 'Weaver of Time',
    description: 'Manipulates time itself. Slows enemies to a crawl and doubles production by looping ticks.',
    startingResources: { gold: 220, crystal: 8, energy: 5 },
    passives: [
      'All slows are 25% stronger',
      'Loop Chamber effect radius +1',
      'Start with Time Anchor blueprint',
    ],
    ability: {
      name: 'Time Stop',
      icon: '⏸',
      description: 'Freezes ALL enemies for 5 seconds. Production continues.',
      cooldown: 50000,
      duration: 5000,
      effect: 'time_stop',
    },
    uniqueRelics: ['paradox_core', 'temporal_echo', 'frozen_moment', 'clockwork_soul', 'infinite_loop'],
    startBuildings: ['generator', 'timeAnchor', 'crystalExtractor'],
  },
};

// ============================================================
// RELIC DEFINITIONS — Universal + Class-Specific
// ============================================================

export const RELICS = {
  // ── UNIVERSAL ─────────────────────────────────────────────
  golden_gear: {
    id: 'golden_gear', name: 'Golden Gear', icon: '⚙', rarity: 'common',
    description: '+15 Gold per wave cleared.',
    effect: { type: 'wave_gold_bonus', value: 15 },
    classes: null,
  },
  iron_heart: {
    id: 'iron_heart', name: 'Iron Heart', icon: '❤', rarity: 'common',
    description: 'Base HP +25.',
    effect: { type: 'base_hp', value: 25 },
    classes: null,
  },
  efficiency_module: {
    id: 'efficiency_module', name: 'Efficiency Module', icon: '📊', rarity: 'uncommon',
    description: 'All buildings cost 15% less Gold.',
    effect: { type: 'cost_reduction', value: 0.15 },
    classes: null,
  },
  crystal_lens: {
    id: 'crystal_lens', name: 'Crystal Lens', icon: '🔭', rarity: 'uncommon',
    description: 'All tower ranges +1.',
    effect: { type: 'range_bonus', value: 1 },
    classes: null,
  },
  dual_core: {
    id: 'dual_core', name: 'Dual Core', icon: '💽', rarity: 'rare',
    description: 'Every 5th production tick generates double output.',
    effect: { type: 'double_tick', every: 5 },
    classes: null,
  },
  architects_compass: {
    id: 'architects_compass', name: "Architect's Compass", icon: '📐', rarity: 'rare',
    description: 'Gain 1 free building placement per wave.',
    effect: { type: 'free_build_per_wave', value: 1 },
    classes: null,
  },
  void_shard: {
    id: 'void_shard', name: 'Void Shard', icon: '🌑', rarity: 'epic',
    description: 'On kill, 10% chance to spawn a Void Ore node.',
    effect: { type: 'on_kill_spawn', chance: 0.1, spawn: 'void_ore' },
    classes: null,
  },
  convergence_node: {
    id: 'convergence_node', name: 'Convergence Node', icon: '🌐', rarity: 'legendary',
    description: 'All resources convert to each other freely at 1:1.',
    effect: { type: 'free_conversion' },
    classes: null,
  },

  // ── ENGINEER RELICS ───────────────────────────────────────
  engineers_blueprint: {
    id: 'engineers_blueprint', name: "Engineer's Blueprint", icon: '📋', rarity: 'common',
    description: '[Engineer] Assembler builds 50% faster.',
    effect: { type: 'assembler_speed', value: 1.5 },
    classes: ['engineer'],
  },
  nano_lubricant: {
    id: 'nano_lubricant', name: 'Nano Lubricant', icon: '🛢', rarity: 'uncommon',
    description: '[Engineer] All conveyors provide +50% throughput bonus.',
    effect: { type: 'conveyor_bonus', value: 0.5 },
    classes: ['engineer'],
  },
  perpetual_engine: {
    id: 'perpetual_engine', name: 'Perpetual Engine', icon: '♾', rarity: 'rare',
    description: '[Engineer] Overclock ability cooldown -50%.',
    effect: { type: 'ability_cooldown_reduction', value: 0.5 },
    classes: ['engineer'],
  },
  assembly_algorithm: {
    id: 'assembly_algorithm', name: 'Assembly Algorithm', icon: '🤖', rarity: 'epic',
    description: '[Engineer] Each Assembler also produces 1 Ore/s passively.',
    effect: { type: 'assembler_produces', resource: 'ore', rate: 1000 },
    classes: ['engineer'],
  },
  mech_heart: {
    id: 'mech_heart', name: 'Mech Heart', icon: '💙', rarity: 'legendary',
    description: '[Engineer] When a building is destroyed, rebuild it for free after 10s.',
    effect: { type: 'auto_rebuild', delay: 10000 },
    classes: ['engineer'],
  },

  // ── ALCHEMIST RELICS ──────────────────────────────────────
  philosophers_stone: {
    id: 'philosophers_stone', name: "Philosopher's Stone", icon: '🪨', rarity: 'common',
    description: '[Alchemist] Metal converts to Gold at 2:1 ratio.',
    effect: { type: 'conversion_ratio', from: 'metal', to: 'gold', ratio: 2 },
    classes: ['alchemist'],
  },
  elixir_of_greed: {
    id: 'elixir_of_greed', name: 'Elixir of Greed', icon: '💰', rarity: 'uncommon',
    description: '[Alchemist] Gold income from Potions +75%.',
    effect: { type: 'potion_gold_bonus', value: 0.75 },
    classes: ['alchemist'],
  },
  chaos_catalyst: {
    id: 'chaos_catalyst', name: 'Chaos Catalyst', icon: '🌀', rarity: 'rare',
    description: '[Alchemist] Poison Vat now also slows enemies by 30%.',
    effect: { type: 'poison_slow', value: 0.3 },
    classes: ['alchemist'],
  },
  void_lens: {
    id: 'void_lens', name: 'Void Lens', icon: '🌓', rarity: 'epic',
    description: '[Alchemist] Grand Transmutation also deals damage equal to 10× Gold gained.',
    effect: { type: 'transmute_damage', multiplier: 10 },
    classes: ['alchemist'],
  },
  mercury_heart: {
    id: 'mercury_heart', name: 'Mercury Heart', icon: '🩶', rarity: 'legendary',
    description: '[Alchemist] Essence now also acts as Ore, Metal, Energy, and Crystal.',
    effect: { type: 'essence_universal' },
    classes: ['alchemist'],
  },

  // ── WARLORD RELICS ────────────────────────────────────────
  blade_of_conquest: {
    id: 'blade_of_conquest', name: 'Blade of Conquest', icon: '🗡', rarity: 'common',
    description: '[Warlord] Turret damage +25%.',
    effect: { type: 'turret_damage', value: 0.25 },
    classes: ['warlord'],
  },
  berserker_seal: {
    id: 'berserker_seal', name: 'Berserker Seal', icon: '🔴', rarity: 'uncommon',
    description: '[Warlord] Soldiers deal +10% damage per soldier alive (max +100%).',
    effect: { type: 'soldier_rampage', perSoldier: 0.1, max: 1.0 },
    classes: ['warlord'],
  },
  iron_resolve: {
    id: 'iron_resolve', name: 'Iron Resolve', icon: '🛡', rarity: 'rare',
    description: '[Warlord] Walls have +100 HP and don\'t count as "destroyed" until 0 HP.',
    effect: { type: 'wall_fortify', bonus: 100 },
    classes: ['warlord'],
  },
  commanders_banner: {
    id: 'commanders_banner', name: "Commander's Banner", icon: '🏴', rarity: 'epic',
    description: '[Warlord] War Cry also spawns 3 extra soldiers for its duration.',
    effect: { type: 'war_cry_spawn', count: 3 },
    classes: ['warlord'],
  },
  siege_mastery: {
    id: 'siege_mastery', name: 'Siege Mastery', icon: '🏹', rarity: 'legendary',
    description: '[Warlord] Cannon and Catapult AoE radius +50%. Enemies inside are stunned.',
    effect: { type: 'aoe_stun', radiusBonus: 0.5, stunDuration: 1500 },
    classes: ['warlord'],
  },

  // ── NATURALIST RELICS ─────────────────────────────────────
  root_network: {
    id: 'root_network', name: 'Root Network', icon: '🌱', rarity: 'common',
    description: '[Naturalist] Essence regenerates 1/s passively.',
    effect: { type: 'passive_resource', resource: 'essence', rate: 1000 },
    classes: ['naturalist'],
  },
  spore_bloom: {
    id: 'spore_bloom', name: 'Spore Bloom', icon: '🍄', rarity: 'uncommon',
    description: '[Naturalist] On enemy death, 15% chance to spawn a Growth Spire.',
    effect: { type: 'on_kill_spawn_building', chance: 0.15, building: 'growthSpire' },
    classes: ['naturalist'],
  },
  earthen_heart: {
    id: 'earthen_heart', name: 'Earthen Heart', icon: '🪨', rarity: 'rare',
    description: '[Naturalist] All buildings heal 1 HP/s.',
    effect: { type: 'passive_heal_buildings', rate: 1 },
    classes: ['naturalist'],
  },
  hivemind_link: {
    id: 'hivemind_link', name: 'Hivemind Link', icon: '🧠', rarity: 'epic',
    description: '[Naturalist] Symbiotes can now damage bosses for full damage.',
    effect: { type: 'symbiote_boss_damage' },
    classes: ['naturalist'],
  },
  verdant_engine: {
    id: 'verdant_engine', name: 'Verdant Engine', icon: '🌳', rarity: 'legendary',
    description: '[Naturalist] Each Essence you own grants +1% to all production rates.',
    effect: { type: 'essence_scales_production', perUnit: 0.01 },
    classes: ['naturalist'],
  },

  // ── CHRONOMANCER RELICS ───────────────────────────────────
  paradox_core: {
    id: 'paradox_core', name: 'Paradox Core', icon: '🔵', rarity: 'common',
    description: '[Chronomancer] Time Anchor range +2.',
    effect: { type: 'time_anchor_range', value: 2 },
    classes: ['chronomancer'],
  },
  temporal_echo: {
    id: 'temporal_echo', name: 'Temporal Echo', icon: '👥', rarity: 'uncommon',
    description: '[Chronomancer] Every 10 kills, rewind a random building to full HP.',
    effect: { type: 'rewind_on_kills', every: 10 },
    classes: ['chronomancer'],
  },
  frozen_moment: {
    id: 'frozen_moment', name: 'Frozen Moment', icon: '❄', rarity: 'rare',
    description: '[Chronomancer] Slowed enemies take 20% bonus damage.',
    effect: { type: 'slow_damage_bonus', value: 0.2 },
    classes: ['chronomancer'],
  },
  clockwork_soul: {
    id: 'clockwork_soul', name: 'Clockwork Soul', icon: '🕰', rarity: 'epic',
    description: '[Chronomancer] Loop Chamber now affects ALL buildings, not just range 2.',
    effect: { type: 'loop_global' },
    classes: ['chronomancer'],
  },
  infinite_loop: {
    id: 'infinite_loop', name: 'Infinite Loop', icon: '∞', rarity: 'legendary',
    description: '[Chronomancer] Time Stop ability cooldown resets on boss kill.',
    effect: { type: 'boss_reset_cooldown' },
    classes: ['chronomancer'],
  },
};

export const RARITY_COLORS = {
  common:    0xaaaaaa,
  uncommon:  0x40c040,
  rare:      0x4080ff,
  epic:      0xa040e0,
  legendary: 0xff8020,
};
