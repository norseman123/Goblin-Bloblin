// ============================================================
// CONSTANTS — Forge & Fate
// ============================================================

export const TILE_SIZE = 48;
export const GRID_W = 20;
export const GRID_H = 14;
export const GAME_W = 1280;
export const GAME_H = 720;

export const COLORS = {
  // UI
  BG:          0x0a0a0f,
  PANEL:       0x12121e,
  BORDER:      0x2a2a4a,
  ACCENT:      0xf0a030,
  ACCENT2:     0x30c0f0,
  DANGER:      0xe03040,
  SUCCESS:     0x30e080,
  TEXT:        0xffffff,
  MUTED:       0x888899,

  // Tile
  TILE_EMPTY:  0x111120,
  TILE_HOVER:  0x1a1a30,
  TILE_PLACED: 0x0d1a0d,
  TILE_ROAD:   0x1a1510,

  // Resources
  ORE:         0x7070c0,
  METAL:       0xc0c0d0,
  ENERGY:      0xffe060,
  CRYSTAL:     0x60eeff,
  ESSENCE:     0xff60d0,

  // Classes
  ENGINEER:    0x3090ff,
  ALCHEMIST:   0xa040ff,
  WARLORD:     0xff4040,
  NATURALIST:  0x40c060,
  CHRONOMANCER:0x40e0e0,
};

export const RESOURCE_ICONS = {
  ore:     '⛏',
  metal:   '⚙',
  energy:  '⚡',
  crystal: '💎',
  essence: '✨',
  gold:    '🪙',
};

export const WAVE_CONFIG = [
  { enemies: 3,  hp: 80,  speed: 60, reward: 150, boss: false },
  { enemies: 5,  hp: 100, speed: 65, reward: 200, boss: false },
  { enemies: 7,  hp: 120, speed: 70, reward: 250, boss: false },
  { enemies: 4,  hp: 300, speed: 50, reward: 400, boss: true  },
  { enemies: 10, hp: 140, speed: 75, reward: 300, boss: false },
  { enemies: 8,  hp: 200, speed: 80, reward: 350, boss: false },
  { enemies: 12, hp: 160, speed: 85, reward: 400, boss: false },
  { enemies: 6,  hp: 600, speed: 45, reward: 700, boss: true  },
  { enemies: 15, hp: 180, speed: 90, reward: 450, boss: false },
  { enemies: 8,  hp: 900, speed: 40, reward: 1000,boss: true  },
];
