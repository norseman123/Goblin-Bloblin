import { GAME_W, GAME_H, COLORS } from '../data/constants.js';
import { gameState } from '../systems/GameState.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const cx = GAME_W / 2, cy = GAME_H / 2;

    // Background grid
    const g = this.add.graphics();
    g.lineStyle(1, 0x1a1a2e, 1);
    for (let x = 0; x < GAME_W; x += 48) g.lineBetween(x, 0, x, GAME_H);
    for (let y = 0; y < GAME_H; y += 48) g.lineBetween(0, y, GAME_W, y);

    // Glow circle
    const glow = this.add.graphics();
    glow.fillStyle(0x3030a0, 0.08);
    glow.fillCircle(cx, cy, 400);
    glow.fillStyle(0x3030a0, 0.05);
    glow.fillCircle(cx, cy, 600);

    // Title
    this.add.text(cx, cy - 200, 'FORGE', {
      fontSize: '96px', fontFamily: 'Georgia, serif',
      color: '#f0a030', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(cx, cy - 110, '& FATE', {
      fontSize: '48px', fontFamily: 'Georgia, serif',
      color: '#ffffff', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(cx, cy - 55, 'Roguelite Factory Builder', {
      fontSize: '18px', fontFamily: 'monospace',
      color: '#8888aa',
    }).setOrigin(0.5);

    // Stats
    if (gameState.totalRuns > 0) {
      this.add.text(cx, cy - 10, `Runs: ${gameState.totalRuns}  •  Best Wave: ${gameState.highestWave}  •  Essence: ${gameState.metaEssence}✨`, {
        fontSize: '15px', fontFamily: 'monospace', color: '#666688',
      }).setOrigin(0.5);
    }

    // Buttons
    this.makeButton(cx, cy + 60, 'NEW RUN', () => this.scene.start('ClassSelect'));
    this.makeButton(cx, cy + 130, 'LEGACY UPGRADES', () => this.scene.start('Meta'));

    // Version
    this.add.text(GAME_W - 10, GAME_H - 10, 'v0.1.0', {
      fontSize: '12px', fontFamily: 'monospace', color: '#333355',
    }).setOrigin(1, 1);

    // Animate title
    this.tweens.add({
      targets: this.children.getByName?.('title') || [],
      y: '+=4',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  makeButton(x, y, label, callback) {
    const btn = this.add.image(x, y, 'btn').setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'monospace',
      color: '#f0a030', fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setTexture('btn_hover');
      txt.setColor('#ffffff');
    });
    btn.on('pointerout', () => {
      btn.setTexture('btn');
      txt.setColor('#f0a030');
    });
    btn.on('pointerdown', callback);
    return btn;
  }
}
