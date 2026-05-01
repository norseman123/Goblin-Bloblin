// ============================================================
// META PROGRESSION — Forge & Fate
// (Persistent upgrades purchased with Essence between runs)
// ============================================================

export const META_UPGRADES = {
  // ── ECONOMY ───────────────────────────────────────────────
  starting_gold: {
    id: 'starting_gold', name: 'Reserve Fund', icon: '🪙',
    description: '+50 starting Gold per rank.',
    maxRank: 5,
    costPerRank: [3, 5, 8, 12, 20], // essence cost
    effect: { type: 'starting_resource', resource: 'gold', valuePerRank: 50 },
  },
  resource_capacity: {
    id: 'resource_capacity', name: 'Expanded Vault', icon: '🏦',
    description: '+25% max resource storage per rank.',
    maxRank: 4,
    costPerRank: [4, 7, 12, 20],
    effect: { type: 'storage_multiplier', valuePerRank: 0.25 },
  },
  essence_mastery: {
    id: 'essence_mastery', name: 'Essence Mastery', icon: '✨',
    description: 'Essence collectors produce 25% faster per rank.',
    maxRank: 3,
    costPerRank: [5, 10, 18],
    effect: { type: 'building_speed', building: 'essenceCollector', valuePerRank: 0.25 },
  },

  // ── COMBAT ────────────────────────────────────────────────
  base_hp: {
    id: 'base_hp', name: 'Fortified Core', icon: '💖',
    description: 'Base HP +20 per rank.',
    maxRank: 5,
    costPerRank: [3, 5, 8, 13, 20],
    effect: { type: 'base_hp', valuePerRank: 20 },
  },
  turret_damage: {
    id: 'turret_damage', name: 'Sharpened Steel', icon: '🗼',
    description: 'All turrets deal +10% damage per rank.',
    maxRank: 4,
    costPerRank: [4, 8, 14, 22],
    effect: { type: 'turret_damage_pct', valuePerRank: 0.10 },
  },
  wave_delay: {
    id: 'wave_delay', name: 'Advanced Warning', icon: '⏰',
    description: '+5s between waves per rank.',
    maxRank: 3,
    costPerRank: [6, 12, 20],
    effect: { type: 'wave_prep_time', valuePerRank: 5000 },
  },

  // ── BUILDINGS ─────────────────────────────────────────────
  production_speed: {
    id: 'production_speed', name: 'Optimized Lines', icon: '⚡',
    description: 'All production buildings +10% speed per rank.',
    maxRank: 5,
    costPerRank: [3, 6, 10, 16, 25],
    effect: { type: 'global_production_speed', valuePerRank: 0.10 },
  },
  building_cost: {
    id: 'building_cost', name: 'Bulk Discount', icon: '💸',
    description: 'All buildings cost 5% less Gold per rank.',
    maxRank: 4,
    costPerRank: [5, 9, 15, 24],
    effect: { type: 'global_cost_reduction', valuePerRank: 0.05 },
  },
  starting_buildings: {
    id: 'starting_buildings', name: 'Head Start', icon: '🏗',
    description: 'Start each run with 1 free Mine per rank.',
    maxRank: 3,
    costPerRank: [8, 15, 25],
    effect: { type: 'free_start_buildings', building: 'mine', valuePerRank: 1 },
  },

  // ── DRAFTING ──────────────────────────────────────────────
  draft_options: {
    id: 'draft_options', name: 'Wider Selection', icon: '🃏',
    description: 'Draft offers 1 additional choice per rank.',
    maxRank: 3,
    costPerRank: [8, 16, 28],
    effect: { type: 'draft_options', valuePerRank: 1 },
  },
  relic_rerolls: {
    id: 'relic_rerolls', name: 'Second Opinion', icon: '🔄',
    description: '+1 relic reroll per draft per rank.',
    maxRank: 3,
    costPerRank: [6, 12, 22],
    effect: { type: 'relic_rerolls', valuePerRank: 1 },
  },
  legendary_chance: {
    id: 'legendary_chance', name: 'Fortune Favors', icon: '⭐',
    description: '+3% chance for legendary relics per rank.',
    maxRank: 4,
    costPerRank: [7, 14, 22, 35],
    effect: { type: 'legendary_relic_chance', valuePerRank: 0.03 },
  },
};
