import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { GardenScene } from './scenes/GardenScene';
import { MainMenuScene } from './scenes/MainMenuScene';

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#f1f8e9',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MainMenuScene, GameScene, GardenScene],
  input: {
    touch: {
      capture: true,
    },
  },
  dom: {
    createContainer: false,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};
