import * as Phaser from 'phaser';
import { getPlatformAdapter } from '../../integrations/PlatformAdapter';
import { setLanguage } from '../data/localization';
import { AssetGenerator } from '../systems/AssetGenerator';
import { SaveManager } from '../systems/SaveManager';
import { SoundSystem } from '../systems/SoundSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Generate procedural game textures
    AssetGenerator.generateAll(this);

    // Global pointer down handler for web audio unlocking on user gesture
    this.input.on('pointerdown', () => {
      SoundSystem.getInstance().unlock();
    });

    const platform = getPlatformAdapter();
    const saveManager = SaveManager.getInstance();
    saveManager.init(platform);

    saveManager.load().then((saveData) => {
      // Sync sound settings
      SoundSystem.getInstance().setEnabled(saveData.settings.soundEnabled);
      SoundSystem.getInstance().setVibrationEnabled(saveData.settings.vibrationEnabled);
      setLanguage(saveData.settings.lang);

      // Transition to MainMenuScene
      this.scene.start('MainMenuScene');
    });
  }
}
