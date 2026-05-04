import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ClassSelectScene } from './scenes/ClassSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { DraftScene } from './scenes/DraftScene.js';
import { MetaScene } from './scenes/MetaScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GAME_W, GAME_H } from './data/constants.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: 'game-container',
  backgroundColor: '#0a0a0f',
  scene: [BootScene, MenuScene, ClassSelectScene, GameScene, DraftScene, MetaScene, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  render: {
    pixelArt: false,
    antialias: true,
  }
};

new Phaser.Game(config);
