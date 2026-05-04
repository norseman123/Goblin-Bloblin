import { COLORS, TILE_SIZE } from '../data/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this.generateTextures();
    this.scene.start('Menu');
  }

  generateTextures() {
    const g = this.make.graphics({ add: false });

    // Tile textures
    this.makeTile(g, 'tile_empty', COLORS.TILE_EMPTY, 0x1a1a2e);
    this.makeTile(g, 'tile_hover', 0x1a1a40, 0x3030aa);
    this.makeTile(g, 'tile_placed', 0x0d1a0d, 0x205020);
    this.makeTile(g, 'tile_road', 0x1a1510, 0x3a3020);
    this.makeTile(g, 'tile_blocked', 0x2a0a0a, 0x601010);

    // Enemy textures
    this.makeEnemy(g, 'enemy_basic', 0xe04040, 20);
    this.makeEnemy(g, 'enemy_fast', 0xe0a040, 14);
    this.makeEnemy(g, 'enemy_boss', 0xff2060, 36);

    // Bullet
    g.clear();
    g.fillStyle(0xffff80);
    g.fillCircle(4, 4, 4);
    g.generateTexture('bullet', 8, 8);

    // Laser beam
    g.clear();
    g.fillStyle(0xff3060, 0.9);
    g.fillRect(0, 0, 40, 3);
    g.generateTexture('laser', 40, 3);

    // Projectile AoE
    g.clear();
    g.fillStyle(0xff6020, 0.7);
    g.fillCircle(12, 12, 12);
    g.generateTexture('cannonball', 24, 24);

    // Particle
    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(3, 3, 3);
    g.generateTexture('particle', 6, 6);

    // Panel bg
    g.clear();
    g.fillStyle(0x12121e);
    g.fillRoundedRect(0, 0, 300, 500, 8);
    g.lineStyle(2, COLORS.BORDER);
    g.strokeRoundedRect(0, 0, 300, 500, 8);
    g.generateTexture('panel', 300, 500);

    // Button
    g.clear();
    g.fillStyle(0x1e1e3a);
    g.fillRoundedRect(0, 0, 200, 48, 6);
    g.lineStyle(2, COLORS.ACCENT);
    g.strokeRoundedRect(0, 0, 200, 48, 6);
    g.generateTexture('btn', 200, 48);

    // Button hover
    g.clear();
    g.fillStyle(0x2a2a50);
    g.fillRoundedRect(0, 0, 200, 48, 6);
    g.lineStyle(2, COLORS.ACCENT);
    g.strokeRoundedRect(0, 0, 200, 48, 6);
    g.generateTexture('btn_hover', 200, 48);

    // Relic frame
    g.clear();
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(0, 0, 160, 200, 8);
    g.lineStyle(2, COLORS.BORDER);
    g.strokeRoundedRect(0, 0, 160, 200, 8);
    g.generateTexture('relic_card', 160, 200);

    // HP bar backgrounds
    g.clear();
    g.fillStyle(0x300000);
    g.fillRect(0, 0, 100, 10);
    g.generateTexture('bar_bg', 100, 10);

    g.clear();
    g.fillStyle(0x40c040);
    g.fillRect(0, 0, 100, 10);
    g.generateTexture('bar_hp', 100, 10);

    g.clear();
    g.fillStyle(0xc04040);
    g.fillRect(0, 0, 100, 10);
    g.generateTexture('bar_dmg', 100, 10);

    g.destroy();
  }

  makeTile(g, key, fill, border) {
    g.clear();
    g.fillStyle(fill);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.lineStyle(1, border, 0.5);
    g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
  }

  makeEnemy(g, key, color, r) {
    const size = r * 2 + 4;
    g.clear();
    g.fillStyle(color);
    g.fillCircle(r + 2, r + 2, r);
    g.lineStyle(2, 0xffffff, 0.4);
    g.strokeCircle(r + 2, r + 2, r);
    // eye
    g.fillStyle(0xffffff);
    g.fillCircle(r + 6, r - 2, 4);
    g.fillStyle(0x000000);
    g.fillCircle(r + 7, r - 2, 2);
    g.generateTexture(key, size, size);
  }
}
