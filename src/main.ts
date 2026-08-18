import * as Phaser from 'phaser';
import { gameConfig } from './game/config';
import { getPlatformAdapter } from './integrations/PlatformAdapter';
import './index.css';

window.addEventListener('DOMContentLoaded', async () => {
  const platform = getPlatformAdapter();
  await platform.init();

  // Create Phaser Game Instance
  new Phaser.Game(gameConfig);
});
