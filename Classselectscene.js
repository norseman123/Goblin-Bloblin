import { GAME_W, GAME_H, COLORS } from '../data/constants.js';
import { CLASSES } from '../data/classes.js';
import { gameState } from '../systems/GameState.js';

export class ClassSelectScene extends Phaser.Scene {
  constructor() { super('ClassSelect'); }

  create() {
    const cx = GAME_W / 2, cy = GAME_H / 2;
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG);
    bg.fillRect(0, 0, GAME_W, GAME_H);

    // Grid bg
    bg.lineStyle(1, 0x1a1a2e);
    for (let x = 0; x < GAME_W; x += 48) bg.lineBetween(x, 0, x, GAME_H);
    for (let y = 0; y < GAME_H; y += 48) bg.lineBetween(0, y, GAME_W, y);

    this.add.text(cx, 50, 'CHOOSE YOUR CLASS', {
      fontSize: '36px', fontFamily: 'Georgia, serif',
      color: '#f0a030', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(cx, 90, 'Each class has unique buildings, relics, and an activated ability', {
      fontSize: '15px', fontFamily: 'monospace', color: '#8888aa',
    }).setOrigin(0.5);

    const classKeys = Object.keys(CLASSES);
    const cardW = 210, cardH = 380, gap = 20;
    const totalW = classKeys.length * cardW + (classKeys.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    classKeys.forEach((key, i) => {
      const cls = CLASSES[key];
      const x = startX + i * (cardW + gap);
      const y = cy + 20;
      const locked = !gameState.unlockedClasses.includes(key);
      this.makeClassCard(x, y, cls, locked, cardW, cardH);
    });

    // Back
    const back = this.add.text(30, 30, '← Back', {
      fontSize: '16px', fontFamily: 'monospace', color: '#8888aa',
    }).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#ffffff'));
    back.on('pointerout', () => back.setColor('#8888aa'));
    back.on('pointerdown', () => this.scene.start('Menu'));
  }

  makeClassCard(x, y, cls, locked, w, h) {
    const alpha = locked ? 0.4 : 1;
    const g = this.add.graphics();

    // Card bg
    g.fillStyle(0x12121e, alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    g.lineStyle(2, locked ? 0x333355 : cls.color, locked ? 0.3 : 1);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

    // Icon bg circle
    const circleG = this.add.graphics();
    circleG.fillStyle(cls.color, locked ? 0.1 : 0.15);
    circleG.fillCircle(x, y - h / 2 + 70, 50);
    circleG.setAlpha(alpha);

    // Icon
    this.add.text(x, y - h / 2 + 70, cls.icon, {
      fontSize: '48px',
    }).setOrigin(0.5).setAlpha(alpha);

    // Name
    this.add.text(x, y - h / 2 + 128, cls.name, {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: locked ? '#444466' : '#' + cls.color.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(alpha);

    // Tagline
    this.add.text(x, y - h / 2 + 155, cls.tagline, {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#888899', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(alpha);

    // Description
    this.add.text(x, y - h / 2 + 185, cls.description, {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#aaaacc', wordWrap: { width: w - 24 },
      align: 'center',
    }).setOrigin(0.5, 0).setAlpha(alpha);

    // Ability
    const abilityY = y + h / 2 - 100;
    const abilityG = this.add.graphics();
    abilityG.fillStyle(0x1e1e3a, locked ? 0.3 : 1);
    abilityG.fillRoundedRect(x - w / 2 + 10, abilityY, w - 20, 58, 6);
    abilityG.lineStyle(1, locked ? 0x222244 : 0x3040a0);
    abilityG.strokeRoundedRect(x - w / 2 + 10, abilityY, w - 20, 58, 6);
    abilityG.setAlpha(alpha);

    this.add.text(x, abilityY + 10, `${cls.ability.icon} ${cls.ability.name}`, {
      fontSize: '13px', fontFamily: 'monospace',
      color: locked ? '#444466' : '#30c0f0', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(alpha);
    this.add.text(x, abilityY + 30, cls.ability.description, {
      fontSize: '10px', fontFamily: 'monospace',
      color: '#8888aa', wordWrap: { width: w - 30 }, align: 'center',
    }).setOrigin(0.5, 0).setAlpha(alpha);

    // Locked overlay
    if (locked) {
      this.add.text(x, y, '🔒 LOCKED', {
        fontSize: '18px', fontFamily: 'monospace',
        color: '#ff4040', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(x, y + 30, 'Progress further to unlock', {
        fontSize: '11px', fontFamily: 'monospace', color: '#666688',
      }).setOrigin(0.5);
      return;
    }

    // SELECT button
    const btnY = y + h / 2 - 30;
    const btn = this.add.rectangle(x, btnY, w - 20, 34, cls.color, 0.2)
      .setInteractive({ useHandCursor: true });
    this.add.graphics()
      .lineStyle(2, cls.color)
      .strokeRect(x - (w - 20) / 2, btnY - 17, w - 20, 34);
    const btnTxt = this.add.text(x, btnY, 'SELECT', {
      fontSize: '15px', fontFamily: 'monospace',
      color: '#' + cls.color.toString(16).padStart(6, '0'), fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(cls.color, 0.4);
      btnTxt.setColor('#ffffff');
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(cls.color, 0.2);
      btnTxt.setColor('#' + cls.color.toString(16).padStart(6, '0'));
    });
    btn.on('pointerdown', () => this.selectClass(cls));
  }

  selectClass(cls) {
    gameState.reset();
    gameState.selectedClass = cls;
    gameState.gold = cls.startingResources.gold || 200;
    for (const [res, amt] of Object.entries(cls.startingResources)) {
      if (res !== 'gold') gameState.resources[res] = amt;
    }
    gameState.applyMeta();
    this.scene.start('Game');
  }
}
