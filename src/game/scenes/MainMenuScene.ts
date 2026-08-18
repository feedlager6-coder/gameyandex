import * as Phaser from 'phaser';
import { getPlatformAdapter } from '../../integrations/PlatformAdapter';
import { setLanguage, t } from '../data/localization';
import { SaveManager } from '../systems/SaveManager';
import { SoundSystem } from '../systems/SoundSystem';

export class MainMenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private modalContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Rich garden background gradient
    this.createBackground(width, height);

    // Floating ambient floral particles
    this.createAmbientParticles(width, height);

    // Title Card
    this.createTitle(width, height);

    // Menu Buttons: Play, Settings, How to Play
    this.createMenuButtons(width, height);

    // Footer stats (Coins, Max Level unlocked)
    this.createStatsFooter(width, height);

    // Notify Yandex SDK that interactive main menu is ready
    const platform = getPlatformAdapter();
    platform.loadingReady();
    platform.sendAnalytics('game_start');
  }

  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xe8f5e9, 0xe8f5e9, 0xc8e6c9, 0xa5d6a7, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative decorative vines top border
    const topBar = this.add.graphics();
    topBar.fillStyle(0x2e7d32, 0.15);
    topBar.fillRoundedRect(width * 0.05, 16, width * 0.9, 4, 2);
  }

  private createAmbientParticles(width: number, height: number): void {
    if (this.textures.exists('particle_star')) {
      this.particles = this.add.particles(width / 2, height, 'particle_star', {
        speedY: { min: -40, max: -90 },
        speedX: { min: -25, max: 25 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 3500,
        frequency: 450,
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(0, 0, width, 50),
        },
      });
    }
  }

  private createTitle(width: number, height: number): void {
    const titleY = height * 0.22;

    // Icon banner
    const icon = this.add.image(width / 2, titleY - 56, 'item_orchid_6');
    icon.setScale(0.9);

    this.tweens.add({
      targets: icon,
      y: titleY - 62,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Main App Title
    const titleText = this.add.text(width / 2, titleY + 16, t('app_title'), {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#1b5e20',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#c8e6c9',
        blur: 4,
        stroke: false,
        fill: true,
      },
    });
    titleText.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, titleY + 48, 'Merge Puzzle & Garden Restoration', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#4caf50',
      align: 'center',
    });
    subtitle.setOrigin(0.5);
  }

  private createMenuButtons(width: number, height: number): void {
    const startY = height * 0.48;
    const spacing = 72;

    // 1. PLAY BUTTON (Primary Large Button)
    this.createCustomButton(
      width / 2,
      startY,
      230,
      60,
      t('play'),
      0x4caf50,
      0x2e7d32,
      0xffffff,
      () => {
        SoundSystem.getInstance().playClick();
        this.scene.start('GameScene');
      },
      true
    );

    // 2. HOW TO PLAY BUTTON
    this.createCustomButton(
      width / 2,
      startY + spacing,
      210,
      50,
      t('how_to_play'),
      0xffffff,
      0x81c784,
      0x2e7d32,
      () => {
        SoundSystem.getInstance().playClick();
        this.showHowToPlayModal(width, height);
      }
    );

    // 3. SETTINGS BUTTON
    this.createCustomButton(
      width / 2,
      startY + spacing * 2,
      210,
      50,
      t('settings'),
      0xffffff,
      0x81c784,
      0x2e7d32,
      () => {
        SoundSystem.getInstance().playClick();
        this.showSettingsModal(width, height);
      }
    );
  }

  private createCustomButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    bgColor: number,
    borderColor: number,
    textColor: number,
    onClick: () => void,
    pulsing = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.lineStyle(2.5, borderColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: pulsing ? '20px' : '17px',
      fontStyle: 'bold',
      color: `#${textColor.toString(16).padStart(6, '0')}`,
    });
    text.setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      container.setScale(0.95);
    });

    container.on('pointerup', () => {
      container.setScale(1);
      onClick();
    });

    container.on('pointerout', () => {
      container.setScale(1);
    });

    if (pulsing) {
      this.tweens.add({
        targets: container,
        scale: 1.04,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    return container;
  }

  private createStatsFooter(width: number, height: number): void {
    const saveData = SaveManager.getInstance().getData();
    const footerY = height - 42;

    const coinImg = this.add.image(width / 2 - 45, footerY, 'coin_icon');
    coinImg.setScale(0.8);

    const coinText = this.add.text(width / 2 - 25, footerY, `${saveData.coins}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e65100',
    });
    coinText.setOrigin(0, 0.5);

    const maxLvlText = this.add.text(
      width / 2 + 35,
      footerY,
      `★ ${t('level_abbr')} ${saveData.unlockedMaxLevel}/8`,
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#2e7d32',
      }
    );
    maxLvlText.setOrigin(0, 0.5);
  }

  private showHowToPlayModal(width: number, height: number): void {
    if (this.modalContainer) this.modalContainer.destroy();

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(100);

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    // Modal Card
    const cardW = Math.min(width * 0.88, 360);
    const cardH = 390;
    const cx = width / 2;
    const cy = height / 2;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 1);
    cardBg.lineStyle(3, 0x4caf50, 1);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);

    const header = this.add.text(cx, cy - cardH / 2 + 36, t('how_to_play'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#1b5e20',
    });
    header.setOrigin(0.5);

    const steps = [
      `1. ${t('tut_step1_desc')}`,
      `2. ${t('tut_step2_desc')}`,
      `3. ${t('tut_step3_desc')}`,
      `4. ${t('tut_step4_desc')}`,
    ];

    steps.forEach((step, idx) => {
      const stepText = this.add.text(cx - cardW / 2 + 20, cy - cardH / 2 + 85 + idx * 56, step, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#37474f',
        wordWrap: { width: cardW - 40 },
        lineSpacing: 3,
      });
    });

    const closeBtn = this.createCustomButton(
      cx,
      cy + cardH / 2 - 40,
      140,
      44,
      t('close'),
      0x4caf50,
      0x2e7d32,
      0xffffff,
      () => {
        SoundSystem.getInstance().playClick();
        if (this.modalContainer) {
          this.modalContainer.destroy();
          this.modalContainer = null;
        }
      }
    );

    this.modalContainer.add([overlay, cardBg, header, closeBtn]);
  }

  private showSettingsModal(width: number, height: number): void {
    if (this.modalContainer) this.modalContainer.destroy();

    this.modalContainer = this.add.container(0, 0);
    this.modalContainer.setDepth(100);

    // Dim overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const cardW = Math.min(width * 0.88, 360);
    const cardH = 380;
    const cx = width / 2;
    const cy = height / 2;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xffffff, 1);
    cardBg.lineStyle(3, 0x4caf50, 1);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);

    const header = this.add.text(cx, cy - cardH / 2 + 32, t('settings'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#1b5e20',
    });
    header.setOrigin(0.5);

    const soundSys = SoundSystem.getInstance();
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    // Sound toggle
    const soundToggle = this.createCustomButton(
      cx,
      cy - 80,
      210,
      42,
      `${t('sound')}: ${soundSys.getEnabled() ? t('on') : t('off')}`,
      soundSys.getEnabled() ? 0xc8e6c9 : 0xffcdd2,
      0x4caf50,
      0x1b5e20,
      () => {
        const next = !soundSys.getEnabled();
        soundSys.setEnabled(next);
        data.settings.soundEnabled = next;
        saveManager.saveImmediate(data);
        SoundSystem.getInstance().playClick();
        this.showSettingsModal(width, height);
      }
    );

    // Vibration toggle
    const vibToggle = this.createCustomButton(
      cx,
      cy - 26,
      210,
      42,
      `${t('vibration')}: ${soundSys.getVibrationEnabled() ? t('on') : t('off')}`,
      soundSys.getVibrationEnabled() ? 0xc8e6c9 : 0xffcdd2,
      0x4caf50,
      0x1b5e20,
      () => {
        const next = !soundSys.getVibrationEnabled();
        soundSys.setVibrationEnabled(next);
        data.settings.vibrationEnabled = next;
        saveManager.saveImmediate(data);
        SoundSystem.getInstance().playClick();
        this.showSettingsModal(width, height);
      }
    );

    // Language toggle
    const currentLang = data.settings.lang || 'ru';
    const langToggle = this.createCustomButton(
      cx,
      cy + 28,
      210,
      42,
      `${t('language')}: ${currentLang.toUpperCase()}`,
      0xe8f5e9,
      0x81c784,
      0x1b5e20,
      () => {
        const nextLang = currentLang === 'ru' ? 'en' : 'ru';
        data.settings.lang = nextLang;
        setLanguage(nextLang);
        saveManager.saveImmediate(data);
        SoundSystem.getInstance().playClick();
        this.showSettingsModal(width, height);
      }
    );

    // Reset Progress Button
    const resetBtn = this.createCustomButton(
      cx,
      cy + 82,
      210,
      38,
      t('restart'),
      0xffebee,
      0xe57373,
      0xc62828,
      () => {
        saveManager.resetProgress();
        SoundSystem.getInstance().playClick();
        if (this.modalContainer) {
          this.modalContainer.destroy();
          this.modalContainer = null;
        }
        this.scene.restart();
      }
    );

    const closeBtn = this.createCustomButton(
      cx,
      cy + cardH / 2 - 28,
      130,
      36,
      t('close'),
      0x4caf50,
      0x2e7d32,
      0xffffff,
      () => {
        SoundSystem.getInstance().playClick();
        if (this.modalContainer) {
          this.modalContainer.destroy();
          this.modalContainer = null;
        }
        this.scene.restart();
      }
    );

    this.modalContainer.add([overlay, cardBg, header, soundToggle, vibToggle, langToggle, resetBtn, closeBtn]);
  }
}
