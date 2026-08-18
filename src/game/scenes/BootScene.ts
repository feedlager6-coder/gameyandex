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
    const platform = getPlatformAdapter();
    // Auto-detect and apply SDK language on boot (Requirement 2.14)
    const detectedLang = (platform.getLanguage() === 'en' ? 'en' : 'ru');
    setLanguage(detectedLang);

    // Generate procedural game textures
    AssetGenerator.generateAll(this);

    // Global pointer down handler for web audio unlocking on user gesture
    this.input.on('pointerdown', () => {
      SoundSystem.getInstance().unlock();
    });

    const saveManager = SaveManager.getInstance();
    saveManager.init(platform);

    saveManager.load().then((saveData) => {
      // If save data does not have a language explicitly or is default, use SDK detected language
      const activeLang = saveData.settings.lang || detectedLang;
      setLanguage(activeLang);

      // Sync sound settings
      SoundSystem.getInstance().setEnabled(saveData.settings.soundEnabled);
      SoundSystem.getInstance().setVibrationEnabled(saveData.settings.vibrationEnabled);

      // Transition to MainMenuScene
      this.scene.start('MainMenuScene');
    });
  }
}
