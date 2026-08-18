import * as Phaser from 'phaser';
import { getPlatformAdapter } from '../../integrations/PlatformAdapter';
import { t } from '../data/localization';
import { SaveManager } from '../systems/SaveManager';
import { SoundSystem } from '../systems/SoundSystem';
import { ModalManager } from '../ui/ModalManager';
import type { GardenPlot } from '../../types/game';

export class GardenScene extends Phaser.Scene {
  private coinText!: Phaser.GameObjects.Text;
  private plotContainers: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'GardenScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Scenic garden lawn background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xc8e6c9, 0xc8e6c9, 0xa5d6a7, 0x81c784, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative sun rays & clouds
    this.createGardenAtmosphere(width, height);

    // Header with Workshop button & Coin display
    this.createHeader(width);

    // 4 Garden Restoration Cards
    this.renderGardenPlots(width);
  }

  private createGardenAtmosphere(width: number, height: number): void {
    // Ambient garden particle petals
    if (this.textures.exists('particle_star')) {
      this.add.particles(width / 2, 0, 'particle_star', {
        speedY: { min: 30, max: 80 },
        speedX: { min: -20, max: 20 },
        scale: { start: 0.7, end: 0.2 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 4000,
        frequency: 600,
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(0, 0, width, 20),
        },
      });
    }
  }

  private createHeader(width: number): void {
    const data = SaveManager.getInstance().getData();

    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.9);
    bar.fillRect(0, 0, width, 56);
    bar.lineStyle(1.5, 0xc8e6c9, 1);
    bar.lineBetween(0, 56, width, 56);

    // Back to Workshop Button
    const backBtn = this.add.container(60, 28);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x4caf50, 1);
    backBg.lineStyle(1.5, 0x2e7d32, 1);
    backBg.fillRoundedRect(-48, -18, 96, 36, 12);
    backBg.strokeRoundedRect(-48, -18, 96, 36, 12);

    const backLabel = this.add.text(0, 0, '🌿 ' + t('workshop'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    backLabel.setOrigin(0.5);

    backBtn.add([backBg, backLabel]);
    backBtn.setSize(96, 36);
    backBtn.setInteractive({ useHandCursor: true });
    backBtn.on('pointerup', () => {
      SoundSystem.getInstance().playClick();
      this.scene.start('GameScene');
    });

    // Coins Display
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0xfff8e1, 1);
    coinBg.lineStyle(1.5, 0xffca28, 1);
    coinBg.fillRoundedRect(width - 130, 10, 110, 36, 18);
    coinBg.strokeRoundedRect(width - 130, 10, 110, 36, 18);

    const coinImg = this.add.image(width - 110, 28, 'coin_icon');
    coinImg.setScale(0.7);

    this.coinText = this.add.text(width - 90, 28, `${data.coins}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e65100',
    });
    this.coinText.setOrigin(0, 0.5);

    // Title label
    const title = this.add.text(width / 2, 85, `🏡 ${t('garden_title')}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#1b5e20',
      align: 'center',
    });
    title.setOrigin(0.5);
  }

  private renderGardenPlots(width: number): void {
    this.plotContainers.forEach((c) => c.destroy());
    this.plotContainers = [];

    const data = SaveManager.getInstance().getData();
    const startY = 120;
    const cardH = 150;
    const spacing = 160;

    data.gardenPlots.forEach((plot, idx) => {
      const cy = startY + idx * spacing + cardH / 2;
      const container = this.add.container(width / 2, cy);

      const cardW = width - 32;

      // Card Background
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.92);
      bg.lineStyle(2, plot.level > 0 ? 0x4caf50 : 0xdcedc8, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);
      container.add(bg);

      // Plot Illustration Visualizer
      const plotArt = this.createPlotVisual(plot);
      plotArt.setPosition(-cardW / 2 + 70, 0);
      container.add(plotArt);

      // Title & Level badge
      const plotTitle = this.add.text(-cardW / 2 + 135, -cardH / 2 + 22, t(plot.nameKey), {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#1b5e20',
      });

      const lvlBadge = this.add.text(
        -cardW / 2 + 135,
        -cardH / 2 + 48,
        `Уровень: ${plot.level}/${plot.maxLevel} ${'★'.repeat(plot.level)}`,
        {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: plot.level === plot.maxLevel ? '#f57f17' : '#388e3c',
        }
      );
      container.add([plotTitle, lvlBadge]);

      // Upgrade Button / Max Level Badge
      if (plot.level < plot.maxLevel) {
        const cost = plot.upgradeCosts[plot.level];
        const canAfford = data.coins >= cost;

        const btn = this.add.container(cardW / 2 - 80, 24);
        const btnBg = this.add.graphics();
        btnBg.fillStyle(canAfford ? 0x4caf50 : 0xb0bec5, 1);
        btnBg.fillRoundedRect(-60, -18, 120, 36, 12);

        const btnText = this.add.text(0, 0, `${t('upgrade', { cost })} ✦`, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffffff',
        });
        btnText.setOrigin(0.5);

        btn.add([btnBg, btnText]);
        btn.setSize(120, 36);

        if (canAfford) {
          btn.setInteractive({ useHandCursor: true });
          btn.on('pointerdown', () => btn.setScale(0.95));
          btn.on('pointerup', () => {
            btn.setScale(1);
            this.upgradePlot(plot);
          });
          btn.on('pointerout', () => btn.setScale(1));
        }

        container.add(btn);
      } else {
        const maxText = this.add.text(cardW / 2 - 80, 24, `✓ ${t('max_level')}`, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#2e7d32',
        });
        maxText.setOrigin(0.5);
        container.add(maxText);
      }

      this.plotContainers.push(container);
    });
  }

  private createPlotVisual(plot: GardenPlot): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0);

    const bgCircle = this.add.graphics();
    bgCircle.fillStyle(plot.level > 0 ? 0xe8f5e9 : 0xf5f5f5, 1);
    bgCircle.lineStyle(2, plot.level > 0 ? 0x81c784 : 0xe0e0e0, 1);
    bgCircle.fillCircle(0, 0, 45);
    bgCircle.strokeCircle(0, 0, 45);
    container.add(bgCircle);

    let emoji = '🌱';
    if (plot.id === 'flower_bed') emoji = plot.level === 0 ? '🍂' : plot.level === 1 ? '🌸' : plot.level === 2 ? '🌺' : '💐';
    if (plot.id === 'stone_path') emoji = plot.level === 0 ? '🪨' : plot.level === 1 ? '🧱' : plot.level === 2 ? '🛤️' : '✨';
    if (plot.id === 'water_fountain') emoji = plot.level === 0 ? '💧' : plot.level === 1 ? '⛲' : plot.level === 2 ? '⛲✨' : '🏰';
    if (plot.id === 'gazebo') emoji = plot.level === 0 ? '🪵' : plot.level === 1 ? '🛖' : plot.level === 2 ? '🏡' : '🏛️';

    const icon = this.add.text(0, 0, emoji, {
      fontSize: '32px',
      align: 'center',
    });
    icon.setOrigin(0.5);
    container.add(icon);

    return container;
  }

  private upgradePlot(plot: GardenPlot): void {
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    const cost = plot.upgradeCosts[plot.level];
    if (data.coins < cost) {
      SoundSystem.getInstance().playError();
      ModalManager.showToast(this, 'Недостаточно монет!', 0xd84315);
      return;
    }

    data.coins -= cost;
    plot.level += 1;

    // Update state
    const plotIdx = data.gardenPlots.findIndex((p) => p.id === plot.id);
    if (plotIdx !== -1) {
      data.gardenPlots[plotIdx].level = plot.level;
    }

    saveManager.saveImmediate(data);

    SoundSystem.getInstance().playOrderComplete();
    ModalManager.showToast(this, `${t(plot.nameKey)} улучшен до ур. ${plot.level}! 🎉`, 0x2e7d32);

    if (this.coinText) {
      this.coinText.setText(`${data.coins}`);
    }

    const platform = getPlatformAdapter();
    platform.sendAnalytics('order_complete', {
      plotUpgraded: plot.id,
      newLevel: plot.level,
    });

    this.renderGardenPlots(this.cameras.main.width);
  }
}
