import * as Phaser from 'phaser';
import { getPlatformAdapter } from '../../integrations/PlatformAdapter';
import { t } from '../data/localization';
import { SaveManager } from '../systems/SaveManager';
import { SoundSystem } from '../systems/SoundSystem';

export class ModalManager {
  static showToast(scene: Phaser.Scene, message: string, color = 0x2e7d32): void {
    const width = scene.cameras.main.width;
    const toast = scene.add.container(width / 2, 70);
    toast.setDepth(200);

    const bg = scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.lineStyle(2, color, 1);
    bg.fillRoundedRect(-140, -18, 280, 36, 12);
    bg.strokeRoundedRect(-140, -18, 280, 36, 12);

    const text = scene.add.text(0, 0, message, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`,
      align: 'center',
    });
    text.setOrigin(0.5);

    toast.add([bg, text]);
    toast.setAlpha(0);
    toast.setScale(0.85);

    scene.tweens.add({
      targets: toast,
      alpha: 1,
      scale: 1,
      y: 90,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.time.delayedCall(1600, () => {
          scene.tweens.add({
            targets: toast,
            alpha: 0,
            y: 70,
            duration: 250,
            onComplete: () => toast.destroy(),
          });
        });
      },
    });
  }

  static showPauseModal(
    scene: Phaser.Scene,
    onResume: () => void,
    onMenu: () => void
  ): Phaser.GameObjects.Container {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const container = scene.add.container(0, 0);
    container.setDepth(150);

    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const cardW = 320;
    const cardH = 340;
    const cx = width / 2;
    const cy = height / 2;

    const cardBg = scene.add.graphics();
    cardBg.fillStyle(0xffffff, 1);
    cardBg.lineStyle(3, 0x4caf50, 1);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);

    const title = scene.add.text(cx, cy - cardH / 2 + 36, t('pause'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#1b5e20',
    });
    title.setOrigin(0.5);

    const soundSys = SoundSystem.getInstance();
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    // Resume button
    const resumeBtn = ModalManager.createButton(
      scene,
      cx,
      cy - 40,
      200,
      50,
      t('resume'),
      0x4caf50,
      0x2e7d32,
      0xffffff,
      () => {
        SoundSystem.getInstance().playClick();
        container.destroy();
        onResume();
      }
    );

    // Sound toggle
    const soundBtn = ModalManager.createButton(
      scene,
      cx,
      cy + 22,
      200,
      44,
      `${t('sound')}: ${soundSys.getEnabled() ? 'ВКЛ' : 'ВЫКЛ'}`,
      soundSys.getEnabled() ? 0xc8e6c9 : 0xffcdd2,
      0x4caf50,
      0x1b5e20,
      () => {
        const next = !soundSys.getEnabled();
        soundSys.setEnabled(next);
        data.settings.soundEnabled = next;
        saveManager.saveImmediate(data);
        SoundSystem.getInstance().playClick();
        container.destroy();
        ModalManager.showPauseModal(scene, onResume, onMenu);
      }
    );

    // Main Menu Button
    const menuBtn = ModalManager.createButton(
      scene,
      cx,
      cy + 82,
      200,
      44,
      'В главное меню',
      0xf1f8e9,
      0x81c784,
      0x2e7d32,
      () => {
        SoundSystem.getInstance().playClick();
        container.destroy();
        onMenu();
      }
    );

    container.add([overlay, cardBg, title, resumeBtn, soundBtn, menuBtn]);
    return container;
  }

  static showOverflowModal(
    scene: Phaser.Scene,
    onCleanLowest: () => void,
    onGetExtraSeed: () => void,
    onClose: () => void
  ): Phaser.GameObjects.Container {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const container = scene.add.container(0, 0);
    container.setDepth(160);

    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const cardW = 340;
    const cardH = 360;
    const cx = width / 2;
    const cy = height / 2;

    const cardBg = scene.add.graphics();
    cardBg.fillStyle(0xffffff, 1);
    cardBg.lineStyle(3, 0xff7043, 1);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);

    const title = scene.add.text(cx, cy - cardH / 2 + 35, t('overflow_title'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#d84315',
    });
    title.setOrigin(0.5);

    const desc = scene.add.text(cx, cy - cardH / 2 + 75, t('overflow_desc'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#455a64',
      align: 'center',
      wordWrap: { width: cardW - 40 },
    });
    desc.setOrigin(0.5);

    // Option 1: Clean lowest level item via rewarded video
    const cleanBtn = ModalManager.createButton(
      scene,
      cx,
      cy - 5,
      270,
      50,
      `🗑 ${t('rewarded_clean_lowest')}`,
      0xffecb3,
      0xffa000,
      0x5d4037,
      () => {
        const platform = getPlatformAdapter();
        platform.showRewarded('clean_lowest_item').then((success) => {
          if (success) {
            SoundSystem.getInstance().playOrderComplete();
            container.destroy();
            onCleanLowest();
          } else {
            SoundSystem.getInstance().playError();
          }
        });
      }
    );

    // Option 2: Get extra seed
    const extraSeedBtn = ModalManager.createButton(
      scene,
      cx,
      cy + 60,
      270,
      50,
      `🌱 ${t('rewarded_extra_seed')}`,
      0xc8e6c9,
      0x4caf50,
      0x1b5e20,
      () => {
        const platform = getPlatformAdapter();
        platform.showRewarded('extra_seed_basket').then((success) => {
          if (success) {
            SoundSystem.getInstance().playOrderComplete();
            container.destroy();
            onGetExtraSeed();
          } else {
            SoundSystem.getInstance().playError();
          }
        });
      }
    );

    const closeBtn = ModalManager.createButton(
      scene,
      cx,
      cy + cardH / 2 - 32,
      130,
      38,
      t('close'),
      0xeeeeee,
      0xbdbdbd,
      0x616161,
      () => {
        SoundSystem.getInstance().playClick();
        container.destroy();
        onClose();
      }
    );

    container.add([overlay, cardBg, title, desc, cleanBtn, extraSeedBtn, closeBtn]);
    return container;
  }

  static showTutorial(scene: Phaser.Scene, onComplete: () => void): void {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const container = scene.add.container(0, 0);
    container.setDepth(180);

    const steps = [
      { title: t('tut_step1_title'), desc: t('tut_step1_desc'), icon: 'seed_basket' },
      { title: t('tut_step2_title'), desc: t('tut_step2_desc'), icon: 'item_sprout_2' },
      { title: t('tut_step3_title'), desc: t('tut_step3_desc'), icon: 'coin_icon' },
      { title: t('tut_step4_title'), desc: t('tut_step4_desc'), icon: 'item_pond_8' },
    ];

    let currentStep = 0;

    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const cardW = Math.min(width * 0.88, 340);
    const cardH = 380;
    const cx = width / 2;
    const cy = height / 2;

    const cardBg = scene.add.graphics();
    cardBg.fillStyle(0xffffff, 1);
    cardBg.lineStyle(3, 0x4caf50, 1);
    cardBg.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);
    cardBg.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 20);

    const iconImg = scene.add.image(cx, cy - cardH / 2 + 75, steps[0].icon);
    iconImg.setScale(0.85);

    const titleText = scene.add.text(cx, cy - cardH / 2 + 150, steps[0].title, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#1b5e20',
      align: 'center',
      wordWrap: { width: cardW - 36 },
    });
    titleText.setOrigin(0.5);

    const descText = scene.add.text(cx, cy - cardH / 2 + 220, steps[0].desc, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#37474f',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: cardW - 40 },
    });
    descText.setOrigin(0.5);

    const dots = scene.add.text(cx, cy + cardH / 2 - 80, '● ○ ○ ○', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      color: '#4caf50',
      align: 'center',
    });
    dots.setOrigin(0.5);

    const nextBtn = ModalManager.createButton(
      scene,
      cx,
      cy + cardH / 2 - 38,
      180,
      46,
      'Далее →',
      0x4caf50,
      0x2e7d32,
      0xffffff,
      () => {
        SoundSystem.getInstance().playClick();
        currentStep++;
        if (currentStep >= steps.length) {
          container.destroy();
          const saveManager = SaveManager.getInstance();
          const data = saveManager.getData();
          data.tutorialCompleted = true;
          saveManager.saveImmediate(data);

          const platform = getPlatformAdapter();
          platform.sendAnalytics('tutorial_complete');
          onComplete();
        } else {
          iconImg.setTexture(steps[currentStep].icon);
          titleText.setText(steps[currentStep].title);
          descText.setText(steps[currentStep].desc);
          const dotStr = steps.map((_, i) => (i === currentStep ? '●' : '○')).join(' ');
          dots.setText(dotStr);

          if (currentStep === steps.length - 1) {
            // Last step button text
            const btnTextObj = nextBtn.getByName('btn_text') as Phaser.GameObjects.Text;
            if (btnTextObj) btnTextObj.setText(t('tut_got_it'));
          }
        }
      }
    );

    container.add([overlay, cardBg, iconImg, titleText, descText, dots, nextBtn]);
  }

  private static createButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    bgColor: number,
    borderColor: number,
    textColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    const bg = scene.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.lineStyle(2, borderColor, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const text = scene.add.text(0, 0, label, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: `#${textColor.toString(16).padStart(6, '0')}`,
    });
    text.setName('btn_text');
    text.setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => container.setScale(0.95));
    container.on('pointerup', () => {
      container.setScale(1);
      onClick();
    });
    container.on('pointerout', () => container.setScale(1));

    return container;
  }
}
