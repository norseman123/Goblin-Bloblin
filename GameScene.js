import { TILE_SIZE, GRID_W, GRID_H, GAME_W, GAME_H, COLORS, WAVE_CONFIG } from '../data/constants.js';
import { BUILDINGS } from '../data/buildings.js';
import { gameState } from '../systems/GameState.js';

const UI_W = 280;
const GRID_OFFSET_X = UI_W;
const GRID_OFFSET_Y = 0;
const RIGHT_UI_W = 220;

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.cls = gameState.selectedClass;
    if (!this.cls) { this.scene.start('Menu'); return; }

    // Grid state: null = empty, object = building data
    this.grid = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(null));
    this.tileImages = [];
    this.buildingSprites = [];
    this.enemies = [];
    this.bullets = [];
    this.soldiers = [];
    this.particles = [];
    this.selectedBuilding = null;
    this.hoveredTile = null;
    this.waveActive = false;
    this.waveNum = 0;
    this.enemiesThisWave = 0;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1800;
    this.prepTime = 30000;
    this.prepRemaining = this.prepTime;
    this.lastTick = this.time.now;
    this.abilityActive = false;
    this.abilityTimer = 0;
    this.killCount = 0;

    // Path: enemies walk from right edge to left
    this.pathY = Math.floor(GRID_H / 2);

    this.createGrid();
    this.createUI();
    this.createRightUI();
    this.startPrepPhase();

    // Production ticker
    this.productionTimer = this.time.addEvent({
      delay: 1000,
      callback: this.tickProduction,
      callbackScope: this,
      loop: true,
    });

    // Turret ticker
    this.turretTimer = this.time.addEvent({
      delay: 200,
      callback: this.tickTurrets,
      callbackScope: this,
      loop: true,
    });

    // Main update
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.keyboard.on('keydown-ESC', () => this.selectedBuilding = null);
    this.input.keyboard.on('keydown-Q', () => this.useAbility());

    // Hotkey hints
    this.buildHotkeys = {};
    this.refreshBuildPanel();
    this.refreshResourceBar();
  }

  // ── GRID ────────────────────────────────────────────────────
  createGrid() {
    const g = this.add.graphics();
    // Dark bg for grid area
    g.fillStyle(0x0a0a12);
    g.fillRect(GRID_OFFSET_X, GRID_OFFSET_Y, GRID_W * TILE_SIZE, GRID_H * TILE_SIZE);

    this.tileImages = [];
    for (let row = 0; row < GRID_H; row++) {
      this.tileImages[row] = [];
      for (let col = 0; col < GRID_W; col++) {
        const x = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
        const y = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
        const key = row === this.pathY ? 'tile_road' : 'tile_empty';
        const tile = this.add.image(x, y, key);
        tile.setData('row', row);
        tile.setData('col', col);
        this.tileImages[row][col] = tile;
      }
    }

    // Path arrows
    for (let col = 0; col < GRID_W; col++) {
      const x = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
      const y = GRID_OFFSET_Y + this.pathY * TILE_SIZE + TILE_SIZE / 2;
      this.add.text(x, y, '→', {
        fontSize: '16px', color: '#3a3020', alpha: 0.5,
      }).setOrigin(0.5).setAlpha(0.4);
    }

    // Border
    const border = this.add.graphics();
    border.lineStyle(2, COLORS.BORDER);
    border.strokeRect(GRID_OFFSET_X, GRID_OFFSET_Y, GRID_W * TILE_SIZE, GRID_H * TILE_SIZE);
  }

  // ── LEFT UI PANEL ────────────────────────────────────────────
  createUI() {
    const g = this.add.graphics();
    g.fillStyle(0x0e0e1c);
    g.fillRect(0, 0, UI_W, GAME_H);
    g.lineStyle(1, COLORS.BORDER);
    g.lineBetween(UI_W, 0, UI_W, GAME_H);

    // Class info
    const cls = this.cls;
    const clsColor = '#' + cls.color.toString(16).padStart(6, '0');
    this.add.text(14, 14, cls.icon + ' ' + cls.name, {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: clsColor, fontStyle: 'bold',
    });
    this.add.text(14, 40, cls.tagline, {
      fontSize: '11px', fontFamily: 'monospace', color: '#666688', fontStyle: 'italic',
    });

    // Divider
    g.lineStyle(1, COLORS.BORDER, 0.5);
    g.lineBetween(10, 60, UI_W - 10, 60);

    // Resource bar area
    this.resourceText = this.add.text(14, 68, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaacc',
      lineSpacing: 4,
    });

    // Divider
    g.lineBetween(10, 170, UI_W - 10, 170);

    // Build panel label
    this.add.text(14, 178, 'BUILDINGS', {
      fontSize: '13px', fontFamily: 'monospace', color: COLORS.ACCENT,
      fontStyle: 'bold',
    });
    this.add.text(UI_W - 14, 178, '[ESC] deselect', {
      fontSize: '10px', fontFamily: 'monospace', color: '#444466',
    }).setOrigin(1, 0);

    // Build panel container
    this.buildPanel = this.add.container(0, 192);

    // Divider
    g.lineBetween(10, GAME_H - 130, UI_W - 10, GAME_H - 130);

    // Ability button
    this.createAbilityButton();
  }

  createAbilityButton() {
    const y = GAME_H - 120;
    const ability = this.cls.ability;
    const clsColor = this.cls.color;
    const clsHex = '#' + clsColor.toString(16).padStart(6, '0');

    this.abilityBg = this.add.graphics();
    this.drawAbilityBtn(false);

    this.add.text(14, y + 8, `[Q] ${ability.icon} ${ability.name}`, {
      fontSize: '13px', fontFamily: 'monospace', color: clsHex, fontStyle: 'bold',
    });
    this.abilityDesc = this.add.text(14, y + 28, ability.description, {
      fontSize: '10px', fontFamily: 'monospace', color: '#8888aa',
      wordWrap: { width: UI_W - 28 },
    });
    this.abilityCooldownText = this.add.text(UI_W / 2, y + 60, 'READY', {
      fontSize: '14px', fontFamily: 'monospace', color: '#30e080', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Cooldown bar
    this.cooldownBarBg = this.add.graphics();
    this.cooldownBarBg.fillStyle(0x1a1a2e);
    this.cooldownBarBg.fillRect(14, y + 78, UI_W - 28, 8);
    this.cooldownBar = this.add.graphics();

    // Click area
    const zone = this.add.zone(UI_W / 2, y + 50, UI_W - 20, 80)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => this.useAbility());
  }

  drawAbilityBtn(ready) {
    const y = GAME_H - 120;
    this.abilityBg.clear();
    this.abilityBg.fillStyle(ready ? 0x1a2a1a : 0x1a1a2a);
    this.abilityBg.fillRoundedRect(10, y, UI_W - 20, 90, 6);
    this.abilityBg.lineStyle(2, ready ? this.cls.color : 0x333355);
    this.abilityBg.strokeRoundedRect(10, y, UI_W - 20, 90, 6);
  }

  // ── RIGHT UI ────────────────────────────────────────────────
  createRightUI() {
    const rx = GRID_OFFSET_X + GRID_W * TILE_SIZE;
    const g = this.add.graphics();
    g.fillStyle(0x0e0e1c);
    g.fillRect(rx, 0, RIGHT_UI_W, GAME_H);
    g.lineStyle(1, COLORS.BORDER);
    g.lineBetween(rx, 0, rx, GAME_H);

    const cx = rx + RIGHT_UI_W / 2;

    // Wave info
    this.waveLabel = this.add.text(cx, 16, 'WAVE 0', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#f0a030', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.phaseLabel = this.add.text(cx, 46, 'PREPARE', {
      fontSize: '14px', fontFamily: 'monospace', color: '#30e080',
    }).setOrigin(0.5);

    this.timerLabel = this.add.text(cx, 68, '30s', {
      fontSize: '28px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Base HP
    g.fillStyle(0x200000);
    g.fillRoundedRect(rx + 10, 105, RIGHT_UI_W - 20, 44, 6);
    g.lineStyle(1, 0x400000);
    g.strokeRoundedRect(rx + 10, 105, RIGHT_UI_W - 20, 44, 6);

    this.add.text(cx, 112, '🏰 BASE HP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aa4444',
    }).setOrigin(0.5);
    this.hpText = this.add.text(cx, 128, '100 / 100', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff6060', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Relics section
    this.add.text(cx, 162, 'RELICS', {
      fontSize: '12px', fontFamily: 'monospace', color: COLORS.ACCENT, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.relicsContainer = this.add.container(rx, 178);

    // Enemy wave info
    this.waveInfoLabel = this.add.text(cx, GAME_H - 120, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaacc',
      align: 'center', wordWrap: { width: RIGHT_UI_W - 20 },
    }).setOrigin(0.5);

    // Start Wave button
    this.startWaveBtn = this.add.rectangle(cx, GAME_H - 50, RIGHT_UI_W - 20, 44, 0x103010)
      .setInteractive({ useHandCursor: true });
    this.add.graphics()
      .lineStyle(2, 0x30a040)
      .strokeRect(rx + 10, GAME_H - 72, RIGHT_UI_W - 20, 44);
    this.startWaveTxt = this.add.text(cx, GAME_H - 50, '▶ START WAVE', {
      fontSize: '14px', fontFamily: 'monospace', color: '#30e080', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.startWaveBtn.on('pointerdown', () => this.startWave());
    this.startWaveBtn.on('pointerover', () => this.startWaveBtn.setFillStyle(0x205030));
    this.startWaveBtn.on('pointerout', () => this.startWaveBtn.setFillStyle(0x103010));
  }

  // ── BUILD PANEL ──────────────────────────────────────────────
  refreshBuildPanel() {
    this.buildPanel.removeAll(true);
    const cls = this.cls;

    // Filter buildings available for this class
    const available = Object.values(BUILDINGS).filter(b =>
      b.classes === null || b.classes.includes(cls.id)
    );

    // Group: general first, then class-specific
    const general = available.filter(b => b.classes === null);
    const special = available.filter(b => b.classes !== null);
    const all = [...general.slice(0, 6), ...special];

    all.forEach((bld, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const bx = col * 136 + 14;
      const by = row * 74;
      this.makeBuildBtn(bx, by, bld);
    });
  }

  makeBuildBtn(x, y, bld) {
    const isSelected = this.selectedBuilding?.id === bld.id;
    const canAfford = gameState.canAfford(bld.cost);

    const g = new Phaser.GameObjects.Graphics(this);
    g.fillStyle(isSelected ? 0x1e2e1e : 0x12121e);
    g.fillRoundedRect(x, y, 128, 66, 6);
    g.lineStyle(2, isSelected ? bld.color : (canAfford ? 0x2a2a4a : 0x1a1a2a));
    g.strokeRoundedRect(x, y, 128, 66, 6);
    this.buildPanel.add(g);

    const icon = this.add.text(x + 8, y + 8, bld.icon, { fontSize: '24px' });
    this.buildPanel.add(icon);

    const name = this.add.text(x + 38, y + 8, bld.name, {
      fontSize: '11px', fontFamily: 'monospace',
      color: canAfford ? '#' + bld.color.toString(16).padStart(6, '0') : '#444455',
      fontStyle: 'bold',
    });
    this.buildPanel.add(name);

    // Cost
    const costStr = Object.entries(bld.cost).map(([r, v]) => `${v}${this.resIcon(r)}`).join(' ');
    const costTxt = this.add.text(x + 38, y + 26, costStr, {
      fontSize: '10px', fontFamily: 'monospace',
      color: canAfford ? '#aaaacc' : '#444455',
    });
    this.buildPanel.add(costTxt);

    const desc = this.add.text(x + 8, y + 46, bld.tooltip.slice(0, 34), {
      fontSize: '9px', fontFamily: 'monospace', color: '#666688',
    });
    this.buildPanel.add(desc);

    // Hit area
    const zone = this.add.zone(x + 64, y + 33, 128, 66).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      if (canAfford) {
        this.selectedBuilding = bld;
        this.refreshBuildPanel();
      }
    });
    zone.on('pointerover', () => {
      if (canAfford) g.lineStyle(2, bld.color).strokeRoundedRect(x, y, 128, 66, 6);
      this.showTooltip(bld);
    });
    zone.on('pointerout', () => this.hideTooltip());
    this.buildPanel.add(zone);
  }

  resIcon(r) {
    const m = { gold: '🪙', ore: '⛏', metal: '⚙', energy: '⚡', crystal: '💎', essence: '✨' };
    return m[r] || r;
  }

  // ── TOOLTIP ──────────────────────────────────────────────────
  showTooltip(bld) {
    this.hideTooltip();
    const x = UI_W + 10, y = GAME_H - 160;
    const w = 200, h = 80;
    this.tooltipGraphics = this.add.graphics();
    this.tooltipGraphics.fillStyle(0x0a0a1e, 0.95);
    this.tooltipGraphics.fillRoundedRect(x, y, w, h, 6);
    this.tooltipGraphics.lineStyle(1, bld.color);
    this.tooltipGraphics.strokeRoundedRect(x, y, w, h, 6);
    this.tooltipTexts = [];
    this.tooltipTexts.push(this.add.text(x + 8, y + 8, `${bld.icon} ${bld.name}`, {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#' + bld.color.toString(16).padStart(6, '0'), fontStyle: 'bold',
    }));
    this.tooltipTexts.push(this.add.text(x + 8, y + 28, bld.tooltip, {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaacc',
      wordWrap: { width: w - 16 },
    }));
  }

  hideTooltip() {
    if (this.tooltipGraphics) { this.tooltipGraphics.destroy(); this.tooltipGraphics = null; }
    if (this.tooltipTexts) { this.tooltipTexts.forEach(t => t.destroy()); this.tooltipTexts = null; }
  }

  // ── RESOURCE BAR ─────────────────────────────────────────────
  refreshResourceBar() {
    const gs = gameState;
    const r = gs.resources;
    const lines = [
      `🪙 Gold:    ${gs.gold}`,
      `⛏ Ore:     ${r.ore}/${gs.maxResources.ore}`,
      `⚙ Metal:   ${r.metal}/${gs.maxResources.metal}`,
      `⚡ Energy:  ${r.energy}/${gs.maxResources.energy}`,
      `💎 Crystal: ${r.crystal}/${gs.maxResources.crystal}`,
      `✨ Essence: ${r.essence}/${gs.maxResources.essence}`,
    ];
    this.resourceText.setText(lines.join('\n'));
  }

  // ── TILE INTERACTION ─────────────────────────────────────────
  onPointerMove(pointer) {
    const col = Math.floor((pointer.x - GRID_OFFSET_X) / TILE_SIZE);
    const row = Math.floor((pointer.y - GRID_OFFSET_Y) / TILE_SIZE);

    if (this.hoveredTile) {
      const { r, c } = this.hoveredTile;
      if (this.grid[r]?.[c] === null) {
        this.tileImages[r]?.[c]?.setTexture(r === this.pathY ? 'tile_road' : 'tile_empty');
      }
    }

    if (col >= 0 && col < GRID_W && row >= 0 && row < GRID_H) {
      this.hoveredTile = { r: row, c: col };
      if (this.grid[row][col] === null) {
        this.tileImages[row]?.[col]?.setTexture(this.selectedBuilding ? 'tile_hover' : 'tile_hover');
      }
    } else {
      this.hoveredTile = null;
    }
  }

  onPointerDown(pointer) {
    // Don't place on UI areas
    if (pointer.x < GRID_OFFSET_X) return;
    if (pointer.x > GRID_OFFSET_X + GRID_W * TILE_SIZE) return;
    if (!this.selectedBuilding || !this.hoveredTile) return;

    const { r, c } = this.hoveredTile;
    if (r === this.pathY) return; // can't block path
    if (this.grid[r][c] !== null) return; // already occupied

    const bld = this.selectedBuilding;

    // Check cost (or free build)
    if (gameState.freeBuildsThisWave > 0) {
      gameState.freeBuildsThisWave--;
    } else if (!gameState.payCost(bld.cost)) {
      this.flashText('Cannot afford!', 0xff4040);
      return;
    }

    this.placeBuilding(r, c, bld);
    this.refreshResourceBar();
    this.refreshBuildPanel();
  }

  placeBuilding(row, col, bld) {
    this.grid[row][col] = { ...bld, row, col, hp: bld.hp || 999, maxHp: bld.hp || 999, tickCounter: 0 };
    this.tileImages[row][col].setTexture('tile_placed');

    const x = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
    const y = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;

    // Building sprite (colored rectangle + icon)
    const bg = this.add.graphics();
    bg.fillStyle(bld.color, 0.25);
    bg.fillRect(x - TILE_SIZE / 2 + 2, y - TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    bg.lineStyle(2, bld.color, 0.8);
    bg.strokeRect(x - TILE_SIZE / 2 + 2, y - TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    bg.setData('row', row).setData('col', col);

    const icon = this.add.text(x, y - 4, bld.icon, { fontSize: '22px' }).setOrigin(0.5);
    const label = this.add.text(x, y + 16, bld.name.split(' ')[0], {
      fontSize: '8px', fontFamily: 'monospace', color: '#aaaacc',
    }).setOrigin(0.5);

    this.buildingSprites.push({ bg, icon, label, row, col });
    this.grid[row][col]._bg = bg;
    this.grid[row][col]._icon = icon;
    this.grid[row][col]._label = label;

    // Special init
    if (bld.special === 'barracks') {
      this.grid[row][col]._soldierTimer = 0;
    }
  }

  // ── PRODUCTION TICK ──────────────────────────────────────────
  tickProduction() {
    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        const b = this.grid[row][col];
        if (!b) continue;

        b.tickCounter = (b.tickCounter || 0) + 1;

        // Production buildings
        if (b.production) {
          // Check production rate (in ticks of 1000ms)
          const ticksNeeded = Math.round((b.productionRate || 3000) / 1000);
          const speedMult = this.getProductionSpeedMult(row, col, b);
          const effectiveTicks = Math.max(1, Math.round(ticksNeeded / speedMult));
          if (b.tickCounter % effectiveTicks === 0) {
            for (const [res, amt] of Object.entries(b.production)) {
              let finalAmt = amt;
              // Aura bonus from adjacent Growth Spires
              finalAmt += this.getAuraProductionBonus(row, col);
              // Dual core relic
              if (gameState.hasRelic('dual_core') && b.tickCounter % (effectiveTicks * 5) === 0) {
                finalAmt *= 2;
              }
              // Verdant engine
              if (gameState.hasRelic('verdant_engine') && this.cls.id === 'naturalist') {
                finalAmt *= (1 + gameState.resources.essence * 0.01);
              }
              gameState.addResource(res, Math.floor(finalAmt));
            }
          }
        }

        // Conversion buildings
        if (b.converts) {
          const ticksNeeded = Math.round((b.conversionRate || 4000) / 1000);
          if (b.tickCounter % ticksNeeded === 0) {
            const canConvert = Object.entries(b.converts.input).every(
              ([res, amt]) => (res === 'gold' ? gameState.gold : gameState.resources[res]) >= amt
            );
            if (canConvert) {
              for (const [res, amt] of Object.entries(b.converts.input)) gameState.spendResource(res, amt);
              for (const [res, amt] of Object.entries(b.converts.output)) gameState.addResource(res, amt);
            }
          }
        }

        // Barracks spawn
        if (b.special === 'barracks') {
          b._soldierTimer = (b._soldierTimer || 0) + 1000;
          if (b._soldierTimer >= b.spawnRate) {
            b._soldierTimer = 0;
            this.spawnSoldier(row, col);
          }
        }

        // Poison Vat
        if (b.dot && b.damage) {
          const px = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
          const py = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
          this.enemies.forEach(e => {
            const dist = Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, px, py);
            if (dist <= b.range * TILE_SIZE) {
              e.hp -= b.damage;
            }
          });
        }

        // Time Anchor slow
        if (b.slow) {
          const px = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
          const py = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
          this.enemies.forEach(e => {
            const dist = Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, px, py);
            const inRange = dist <= b.range * TILE_SIZE;
            e.slowed = inRange ? b.slow : 1.0;
          });
        }
      }
    }

    // Root Network relic
    if (gameState.hasRelic('root_network') && this.cls.id === 'naturalist') {
      gameState.addResource('essence', 1);
    }

    this.refreshResourceBar();
    this.refreshBuildPanel();
    this.updateRelicDisplay();
  }

  getProductionSpeedMult(row, col, b) {
    let mult = 1;
    // Overdrive Pylon aura
    for (let r = 0; r < GRID_H; r++) {
      for (let c = 0; c < GRID_W; c++) {
        const adj = this.grid[r][c];
        if (!adj || !adj.aura) continue;
        const dist = Math.max(Math.abs(r - row), Math.abs(c - col));
        if (dist <= (adj.aura.range || 1) && adj.aura.productionSpeed) {
          mult *= adj.aura.productionSpeed;
        }
        if (dist <= (adj.aura.range || 1) && adj.aura.doubleProduction) {
          mult *= 2;
        }
      }
    }
    // Engineer overclock ability
    if (this.abilityActive && this.cls.id === 'engineer') mult *= 3;
    // Overclock relic
    const metaBonus = (gameState.getMetaUpgradeRank('production_speed') || 0) * 0.1;
    mult += metaBonus;
    return mult;
  }

  getAuraProductionBonus(row, col) {
    let bonus = 0;
    for (let r = 0; r < GRID_H; r++) {
      for (let c = 0; c < GRID_W; c++) {
        const adj = this.grid[r][c];
        if (!adj || !adj.aura) continue;
        const dist = Math.max(Math.abs(r - row), Math.abs(c - col));
        if (dist <= (adj.aura.range || 1) && adj.aura.productionBonus) {
          bonus += adj.aura.productionBonus;
        }
      }
    }
    return bonus;
  }

  // ── TURRETS ───────────────────────────────────────────────────
  tickTurrets() {
    if (!this.waveActive || this.enemies.length === 0) return;

    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        const b = this.grid[row][col];
        if (!b || !b.damage || b.isWall) continue;

        b._fireTimer = (b._fireTimer || 0) + 200;
        let fireRate = b.fireRate || 1200;

        // Overclocker building effect
        if (b.special === 'overclocker') continue;

        // Check if adjacent to overclocker
        if (this.hasAdjacentOverclocker(row, col)) fireRate *= 0.5;

        // Warlord War Cry
        if (this.abilityActive && this.cls.id === 'warlord') fireRate *= 0.5;

        if (b._fireTimer < fireRate) continue;
        b._fireTimer = 0;

        const bx = GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2;
        const by = GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2;
        const range = (b.range || 3) * TILE_SIZE;

        // Find nearest enemy in range
        let target = null, minDist = Infinity;
        for (const e of this.enemies) {
          if (e.dead) continue;
          const dist = Phaser.Math.Distance.Between(bx, by, e.sprite.x, e.sprite.y);
          if (dist <= range && dist < minDist) { target = e; minDist = dist; }
        }

        if (!target) continue;

        let dmg = b.damage;
        // Class bonuses
        if (this.cls.id === 'warlord') dmg *= 1.3;
        // Warlord relic
        if (gameState.hasRelic('blade_of_conquest')) dmg *= 1.25;
        // War cry ability
        if (this.abilityActive && this.cls.id === 'warlord') dmg *= 2;
        // Frozen moment relic
        if (gameState.hasRelic('frozen_moment') && target.slowed < 1) dmg *= 1.2;
        // Meta upgrade
        dmg *= (1 + (gameState.getMetaUpgradeRank('turret_damage') || 0) * 0.1);

        if (b.aoe) {
          this.fireAoE(bx, by, target, dmg, b.aoe * TILE_SIZE, b.piercing);
        } else {
          this.fireBullet(bx, by, target, dmg, b.piercing);
        }
      }
    }
  }

  hasAdjacentOverclocker(row, col) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of dirs) {
      const adj = this.grid[row + dr]?.[col + dc];
      if (adj?.special === 'overclocker') return true;
    }
    return false;
  }

  fireBullet(fromX, fromY, target, damage, piercing) {
    const bullet = this.add.image(fromX, fromY, 'bullet');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, target.sprite.x, target.sprite.y);
    const speed = 300;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.bullets.push({ sprite: bullet, vx, vy, damage, piercing, target, alive: true });
  }

  fireAoE(fromX, fromY, target, damage, radius, piercing) {
    const proj = this.add.image(fromX, fromY, 'cannonball');
    const angle = Phaser.Math.Angle.Between(fromX, fromY, target.sprite.x, target.sprite.y);
    const speed = 180;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.bullets.push({ sprite: proj, vx, vy, damage, radius, target, alive: true, isAoE: true });
  }

  // ── WAVE SYSTEM ──────────────────────────────────────────────
  startPrepPhase() {
    this.waveActive = false;
    this.prepRemaining = this.prepTime + (gameState.getMetaUpgradeRank('wave_delay') || 0) * 5000;
    this.phaseLabel.setText('PREPARE').setColor('#30e080');
    this.startWaveBtn.setVisible(true);
    this.startWaveTxt.setVisible(true);
    const nextWave = WAVE_CONFIG[this.waveNum] || WAVE_CONFIG[WAVE_CONFIG.length - 1];
    this.waveInfoLabel.setText(`Next: ${nextWave.enemies} enemies\n${nextWave.boss ? '⚠ BOSS WAVE!' : ''}\nReward: ${nextWave.reward}🪙`);
  }

  startWave() {
    if (this.waveActive) return;
    this.waveActive = true;
    this.startWaveBtn.setVisible(false);
    this.startWaveTxt.setVisible(false);

    const config = WAVE_CONFIG[this.waveNum] || {
      enemies: 8 + this.waveNum * 2, hp: 150 + this.waveNum * 30,
      speed: 70 + this.waveNum * 5, reward: 300 + this.waveNum * 50, boss: false,
    };

    this.currentWaveConfig = config;
    this.enemiesThisWave = config.enemies;
    this.enemiesSpawned = 0;
    this.enemiesDeadOrPast = 0;
    this.spawnTimer = 0;

    this.phaseLabel.setText('⚔ WAVE ' + (this.waveNum + 1)).setColor('#ff6060');
    this.waveLabel.setText('WAVE ' + (this.waveNum + 1));
    this.waveInfoLabel.setText('');
  }

  spawnEnemy() {
    const cfg = this.currentWaveConfig;
    const isBoss = cfg.boss && this.enemiesSpawned === 0;
    const x = GRID_OFFSET_X + GRID_W * TILE_SIZE - TILE_SIZE / 2;
    const y = GRID_OFFSET_Y + this.pathY * TILE_SIZE + TILE_SIZE / 2;

    const hp = isBoss ? cfg.hp * 3 : cfg.hp;
    const speed = isBoss ? cfg.speed * 0.7 : cfg.speed;
    const size = isBoss ? 1.6 : 0.9;
    const key = isBoss ? 'enemy_boss' : (cfg.speed > 70 ? 'enemy_fast' : 'enemy_basic');

    const sprite = this.add.image(x, y, key).setScale(size);
    const barBg = this.add.rectangle(x, y - 28, 40, 6, 0x300000);
    const bar = this.add.rectangle(x - 20, y - 28, 40, 6, isBoss ? 0xff4040 : 0x40c040).setOrigin(0, 0.5);

    const enemy = {
      sprite, barBg, bar,
      hp, maxHp: hp, speed,
      isBoss, dead: false,
      slowed: 1.0,
      _dmgFlash: 0,
    };
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  // ── SOLDIERS ─────────────────────────────────────────────────
  spawnSoldier(bRow, bCol) {
    const bx = GRID_OFFSET_X + bCol * TILE_SIZE + TILE_SIZE / 2;
    const by = GRID_OFFSET_Y + bRow * TILE_SIZE + TILE_SIZE / 2;
    const g = this.add.graphics();
    g.fillStyle(COLORS.WARLORD);
    g.fillTriangle(-10, 10, 10, 10, 0, -14);
    g.x = bx; g.y = by;

    const b = this.grid[bRow][bCol];
    let hp = b.soldierHP || 60;
    let dmg = b.soldierDmg || 10;

    // War Forge bonus
    if (this.hasBuildingOfType('warForge')) { hp *= 1.5; dmg *= 1.5; }
    // Berserker seal
    if (gameState.hasRelic('berserker_seal')) {
      const aliveCount = this.soldiers.length;
      dmg *= (1 + Math.min(aliveCount * 0.1, 1.0));
    }
    // War Cry
    if (this.abilityActive && this.cls.id === 'warlord') { hp *= 1.5; dmg *= 2; }

    this.soldiers.push({ sprite: g, hp, maxHp: hp, dmg, target: null, dead: false });
  }

  hasBuildingOfType(id) {
    for (let r = 0; r < GRID_H; r++)
      for (let c = 0; c < GRID_W; c++)
        if (this.grid[r][c]?.id === id) return true;
    return false;
  }

  // ── ABILITY ────────────────────────────────────────────────────
  useAbility() {
    if (!gameState.isAbilityReady()) return;
    gameState.useAbility();
    this.abilityActive = true;

    const duration = this.cls.ability.duration;
    const effect = this.cls.ability.effect;

    this.flashText(`${this.cls.ability.icon} ${this.cls.ability.name}!`, this.cls.color);

    if (effect === 'time_stop') {
      this.enemies.forEach(e => e._frozen = true);
      this.time.delayedCall(duration, () => {
        this.enemies.forEach(e => e._frozen = false);
        this.abilityActive = false;
      });
    } else if (effect === 'grand_transmutation') {
      let goldGained = 0;
      for (const [res, amt] of Object.entries(gameState.resources)) {
        goldGained += amt * 1.5;
        gameState.resources[res] = 0;
      }
      gameState.gold += Math.floor(goldGained);
      // Void lens relic
      if (gameState.hasRelic('void_lens') && this.cls.id === 'alchemist') {
        const dmg = goldGained * 10;
        this.enemies.forEach(e => e.hp -= dmg);
      }
      this.abilityActive = false;
      this.refreshResourceBar();
    } else if (effect === 'overgrowth') {
      // Spawn 3 temp thornwalls
      const empties = [];
      for (let r = 0; r < GRID_H; r++)
        for (let c = 0; c < GRID_W; c++)
          if (!this.grid[r][c] && r !== this.pathY) empties.push({ r, c });
      const picks = Phaser.Utils.Array.Shuffle(empties).slice(0, 3);
      const placed = [];
      const { BUILDINGS: B } = await import('../data/buildings.js').catch(() => ({ BUILDINGS: {} }));
      picks.forEach(({ r, c }) => {
        this.placeBuilding(r, c, { id: 'thornwall', name: 'Thornwall', icon: '🌵', color: COLORS.NATURALIST, cost: {}, hp: 150, isWall: true, reflect: 20, tooltip: '' });
        placed.push({ r, c });
      });
      this.time.delayedCall(duration, () => {
        placed.forEach(({ r, c }) => this.demolishBuilding(r, c));
        this.abilityActive = false;
      });
    } else if (duration > 0) {
      this.time.delayedCall(duration, () => { this.abilityActive = false; });
    } else {
      this.abilityActive = false;
    }
  }

  demolishBuilding(row, col) {
    const b = this.grid[row][col];
    if (!b) return;
    b._bg?.destroy(); b._icon?.destroy(); b._label?.destroy();
    this.grid[row][col] = null;
    this.tileImages[row][col].setTexture(row === this.pathY ? 'tile_road' : 'tile_empty');
  }

  flashText(msg, color = 0xffffff) {
    const txt = this.add.text(GAME_W / 2, GAME_H / 2 - 60, msg, {
      fontSize: '28px', fontFamily: 'Georgia, serif',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: txt, y: txt.y - 60, alpha: 0, duration: 1500,
      onComplete: () => txt.destroy(),
    });
  }

  // ── RELIC DISPLAY ────────────────────────────────────────────
  updateRelicDisplay() {
    this.relicsContainer.removeAll(true);
    const rx = GRID_OFFSET_X + GRID_W * TILE_SIZE;
    const startY = 0;
    gameState.relics.forEach((relic, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = col * 66 + 10;
      const y = startY + row * 30;

      const bg = this.add.graphics();
      const rarityColors = { common: 0x888888, uncommon: 0x40c040, rare: 0x4080ff, epic: 0xa040e0, legendary: 0xff8020 };
      bg.fillStyle(0x1a1a2e);
      bg.fillRoundedRect(x, y, 60, 24, 4);
      bg.lineStyle(1, rarityColors[relic.rarity] || 0x888888);
      bg.strokeRoundedRect(x, y, 60, 24, 4);
      this.relicsContainer.add(bg);

      const txt = this.add.text(x + 4, y + 4, `${relic.icon} ${relic.name.slice(0, 8)}`, {
        fontSize: '9px', fontFamily: 'monospace', color: '#ccccee',
      });
      this.relicsContainer.add(txt);
    });
  }

  // ── UPDATE ───────────────────────────────────────────────────
  update(time, delta) {
    const dt = delta / 1000;

    // Prep phase countdown
    if (!this.waveActive) {
      this.prepRemaining -= delta;
      const secs = Math.max(0, Math.ceil(this.prepRemaining / 1000));
      this.timerLabel.setText(secs + 's');
      if (this.prepRemaining <= 0) this.startWave();
      return;
    }

    // Wave timer
    this.timerLabel.setText('');

    // Spawn enemies
    if (this.enemiesSpawned < this.enemiesThisWave) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
    }

    // Move enemies
    this.enemies.forEach((e, idx) => {
      if (e.dead) return;
      if (e._frozen) return; // Time stop

      const speed = (e.speed * (e.slowed || 1)) * dt;
      e.sprite.x -= speed;

      // Sync health bar
      const pct = Math.max(0, e.hp / e.maxHp);
      e.bar.width = 40 * pct;
      e.barBg.x = e.sprite.x;
      e.barBg.y = e.sprite.y - 28;
      e.bar.x = e.sprite.x - 20;
      e.bar.y = e.sprite.y - 28;

      // Reset slow each tick
      e.slowed = 1.0;

      // Dead?
      if (e.hp <= 0) {
        e.dead = true;
        e.sprite.destroy(); e.barBg.destroy(); e.bar.destroy();
        this.killCount++;
        gameState.kills++;
        this.enemiesDeadOrPast++;
        this.spawnDeathParticle(e.sprite.x, e.sprite.y);

        // Temporal echo relic
        if (gameState.hasRelic('temporal_echo') && this.cls.id === 'chronomancer' && this.killCount % 10 === 0) {
          this.rewindRandomBuilding();
        }
        return;
      }

      // Reached left edge (damage base)
      if (e.sprite.x < GRID_OFFSET_X - TILE_SIZE) {
        e.dead = true;
        e.sprite.destroy(); e.barBg.destroy(); e.bar.destroy();
        this.enemiesDeadOrPast++;
        const dmg = e.isBoss ? 20 : 5;
        const dead = gameState.takeDamage(dmg);
        this.hpText.setText(`${gameState.baseHP} / ${gameState.maxBaseHP}`);
        this.flashText(`-${dmg} HP!`, 0xff4040);
        if (dead) this.endRun(false);
      }
    });

    // Move bullets
    this.bullets.forEach((b, i) => {
      if (!b.alive) return;
      b.sprite.x += b.vx * dt;
      b.sprite.y += b.vy * dt;

      if (b.isAoE) {
        const dist = Phaser.Math.Distance.Between(b.sprite.x, b.sprite.y, b.target.sprite.x, b.target.sprite.y);
        if (dist < 20 || b.target.dead) {
          // AoE explosion
          this.enemies.forEach(e => {
            if (e.dead) return;
            const ed = Phaser.Math.Distance.Between(b.sprite.x, b.sprite.y, e.sprite.x, e.sprite.y);
            if (ed <= b.radius) {
              e.hp -= b.damage;
              // Siege mastery relic
              if (gameState.hasRelic('siege_mastery') && this.cls.id === 'warlord') {
                e._frozen = true;
                this.time.delayedCall(1500, () => e._frozen = false);
              }
            }
          });
          b.sprite.destroy();
          b.alive = false;
          this.spawnDeathParticle(b.sprite.x, b.sprite.y, 0xff6020);
        }
      } else {
        // Check hit
        if (!b.target.dead) {
          const dist = Phaser.Math.Distance.Between(b.sprite.x, b.sprite.y, b.target.sprite.x, b.target.sprite.y);
          if (dist < 20) {
            b.target.hp -= b.damage;
            if (!b.piercing) {
              b.sprite.destroy();
              b.alive = false;
            }
          }
        } else {
          b.sprite.destroy();
          b.alive = false;
        }
      }

      // Out of bounds
      if (b.sprite.x < 0 || b.sprite.x > GAME_W || b.sprite.y < 0 || b.sprite.y > GAME_H) {
        if (b.alive) { b.sprite.destroy(); b.alive = false; }
      }
    });

    // Move soldiers
    this.soldiers.forEach(s => {
      if (s.dead) return;
      // Find nearest living enemy
      let nearest = null, minD = Infinity;
      this.enemies.forEach(e => {
        if (e.dead) return;
        const d = Phaser.Math.Distance.Between(s.sprite.x, s.sprite.y, e.sprite.x, e.sprite.y);
        if (d < minD) { nearest = e; minD = d; }
      });
      if (nearest) {
        if (minD > 20) {
          const angle = Phaser.Math.Angle.Between(s.sprite.x, s.sprite.y, nearest.sprite.x, nearest.sprite.y);
          s.sprite.x += Math.cos(angle) * 80 * dt;
          s.sprite.y += Math.sin(angle) * 80 * dt;
        } else {
          nearest.hp -= s.dmg * dt;
        }
      }
    });

    // Clean up dead
    this.enemies = this.enemies.filter(e => !e.dead);
    this.bullets = this.bullets.filter(b => b.alive);
    this.soldiers = this.soldiers.filter(s => !s.dead);

    // Update HP display
    this.hpText.setText(`${gameState.baseHP} / ${gameState.maxBaseHP}`);

    // Ability cooldown display
    const cdRemaining = gameState.getAbilityCooldownRemaining();
    const isReady = cdRemaining === 0;
    this.drawAbilityBtn(isReady);
    this.abilityCooldownText.setText(isReady ? 'READY' : `${Math.ceil(cdRemaining / 1000)}s`);
    this.abilityCooldownText.setColor(isReady ? '#30e080' : '#888899');

    if (!isReady && this.cls.ability.cooldown > 0) {
      const pct = 1 - cdRemaining / this.cls.ability.cooldown;
      this.cooldownBar.clear();
      this.cooldownBar.fillStyle(this.cls.color);
      this.cooldownBar.fillRect(14, GAME_H - 42, Math.floor((UI_W - 28) * pct), 8);
    } else {
      this.cooldownBar.clear();
      this.cooldownBar.fillStyle(this.cls.color);
      this.cooldownBar.fillRect(14, GAME_H - 42, UI_W - 28, 8);
    }

    // Wave complete check
    if (this.waveActive && this.enemiesSpawned >= this.enemiesThisWave && this.enemies.length === 0) {
      this.onWaveComplete();
    }
  }

  onWaveComplete() {
    this.waveActive = false;
    const cfg = this.currentWaveConfig;
    gameState.onWaveComplete(this.waveNum + 1, cfg.reward);
    this.waveNum++;

    this.refreshResourceBar();
    this.flashText(`Wave ${this.waveNum} Complete! +${cfg.reward}🪙`, 0x30e080);

    // Go to draft
    this.time.delayedCall(1200, () => {
      this.scene.pause();
      this.scene.launch('Draft', { wave: this.waveNum });
    });
  }

  spawnDeathParticle(x, y, color = 0xff6060) {
    for (let i = 0; i < 4; i++) {
      const p = this.add.image(x, y, 'particle');
      p.setTint(color);
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 80;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0, scale: 0,
        duration: 400 + Math.random() * 200,
        onComplete: () => p.destroy(),
      });
    }
  }

  rewindRandomBuilding() {
    const buildings = [];
    for (let r = 0; r < GRID_H; r++)
      for (let c = 0; c < GRID_W; c++)
        if (this.grid[r][c]) buildings.push(this.grid[r][c]);
    if (buildings.length === 0) return;
    const target = Phaser.Utils.Array.GetRandom(buildings);
    target.hp = target.maxHp;
    this.flashText('⏳ Time Rewind!', COLORS.CHRONOMANCER);
  }

  endRun(won) {
    const essenceEarned = gameState.endRun(won);
    this.scene.start('GameOver', { won, wave: this.waveNum, essence: essenceEarned });
  }
}
