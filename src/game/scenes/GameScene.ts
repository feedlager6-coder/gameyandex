import * as Phaser from 'phaser';
import { getPlatformAdapter } from '../../integrations/PlatformAdapter';
import { ITEMS, ITEMS_BY_ID } from '../data/items';
import { t } from '../data/localization';
import { SaveManager } from '../systems/SaveManager';
import { SoundSystem } from '../systems/SoundSystem';
import { ModalManager } from '../ui/ModalManager';
import type { BoardCell, ItemId, Order } from '../../types/game';

interface CellView {
  bg: Phaser.GameObjects.Image;
  x: number;
  y: number;
  row: number;
  col: number;
  itemSprite: Phaser.GameObjects.Image | null;
}

export class GameScene extends Phaser.Scene {
  private cellViews: CellView[][] = [];
  private draggedSprite: Phaser.GameObjects.Image | null = null;
  private dragSourceCell: { row: number; col: number } | null = null;
  private dragGhost: Phaser.GameObjects.Image | null = null;

  private coinText!: Phaser.GameObjects.Text;
  private basketBadgeText!: Phaser.GameObjects.Text;
  private orderContainers: Phaser.GameObjects.Container[] = [];
  private orderCompletedCount = 0;

  private cellSize = 52;
  private boardStartX = 20;
  private boardStartY = 240;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const platform = getPlatformAdapter();
    platform.gameplayStart();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xf1f8e9, 0xf1f8e9, 0xdcedc8, 0xc5e1a5, 1);
    bg.fillRect(0, 0, width, height);

    // Top Header & HUD
    this.createHeader(width);

    // Active Orders Panel (3 orders)
    this.createOrdersPanel(width);

    // 6x6 Merge Grid
    this.createBoard(width);

    // Bottom Action Area: Seed Basket & Tab Bar
    this.createBottomArea(width, height);

    // Check if tutorial needs to be shown
    const data = SaveManager.getInstance().getData();
    if (!data.tutorialCompleted) {
      this.time.delayedCall(300, () => {
        ModalManager.showTutorial(this, () => {
          this.refreshBoardDisplay();
        });
      });
    }
  }

  private createHeader(width: number): void {
    const data = SaveManager.getInstance().getData();

    // Header bar container
    const header = this.add.container(0, 0);

    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.9);
    bar.fillRect(0, 0, width, 56);
    bar.lineStyle(1.5, 0xc8e6c9, 1);
    bar.lineBetween(0, 56, width, 56);
    header.add(bar);

    // Pause / Settings Button
    const pauseBtn = this.add.container(32, 28);
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(0xe8f5e9, 1);
    pauseBg.lineStyle(1.5, 0x81c784, 1);
    pauseBg.fillRoundedRect(-18, -18, 36, 36, 10);
    pauseBg.strokeRoundedRect(-18, -18, 36, 36, 10);

    const pauseIcon = this.add.text(0, 0, '❚❚', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#2e7d32',
    });
    pauseIcon.setOrigin(0.5);

    pauseBtn.add([pauseBg, pauseIcon]);
    pauseBtn.setSize(36, 36);
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerup', () => {
      SoundSystem.getInstance().playClick();
      ModalManager.showPauseModal(
        this,
        () => {},
        () => {
          this.scene.start('MainMenuScene');
        }
      );
    });
    header.add(pauseBtn);

    // Coin Display in Center
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0xfff8e1, 1);
    coinBg.lineStyle(1.5, 0xffca28, 1);
    coinBg.fillRoundedRect(width / 2 - 60, 10, 120, 36, 18);
    coinBg.strokeRoundedRect(width / 2 - 60, 10, 120, 36, 18);
    header.add(coinBg);

    const coinImg = this.add.image(width / 2 - 40, 28, 'coin_icon');
    coinImg.setScale(0.7);
    header.add(coinImg);

    this.coinText = this.add.text(width / 2 - 18, 28, `${data.coins}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e65100',
    });
    this.coinText.setOrigin(0, 0.5);
    header.add(this.coinText);

    // Garden Tab Switcher Button (Top-Right)
    const gardenTabBtn = this.add.container(width - 44, 28);
    const tabBg = this.add.graphics();
    tabBg.fillStyle(0x4caf50, 1);
    tabBg.lineStyle(1.5, 0x2e7d32, 1);
    tabBg.fillRoundedRect(-34, -18, 68, 36, 12);
    tabBg.strokeRoundedRect(-34, -18, 68, 36, 12);

    const tabLabel = this.add.text(0, 0, '🏡 ' + t('garden'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
    });
    tabLabel.setOrigin(0.5);

    gardenTabBtn.add([tabBg, tabLabel]);
    gardenTabBtn.setSize(68, 36);
    gardenTabBtn.setInteractive({ useHandCursor: true });
    gardenTabBtn.on('pointerup', () => {
      SoundSystem.getInstance().playClick();
      this.scene.start('GardenScene');
    });
    header.add(gardenTabBtn);
  }

  private createOrdersPanel(width: number): void {
    const ordersY = 66;

    // Panel Background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 0.7);
    panelBg.fillRoundedRect(12, ordersY, width - 24, 114, 16);
    panelBg.lineStyle(1.5, 0xdcedc8, 1);
    panelBg.strokeRoundedRect(12, ordersY, width - 24, 114, 16);

    const title = this.add.text(24, ordersY + 12, `📋 ${t('orders_title')}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#2e7d32',
    });

    this.renderOrders();
  }

  private renderOrders(): void {
    const width = this.cameras.main.width;
    const ordersY = 66;

    // Clear previous order cards
    this.orderContainers.forEach((c) => c.destroy());
    this.orderContainers = [];

    const data = SaveManager.getInstance().getData();
    const boardItems = this.getBoardItemIds();
    const cardWidth = (width - 40) / 3;

    data.activeOrders.forEach((order, idx) => {
      const cardX = 20 + idx * cardWidth + cardWidth / 2;
      const cardY = ordersY + 68;

      const container = this.add.container(cardX, cardY);
      const isReady = boardItems.includes(order.requiredItemId);

      // Card Background
      const bg = this.add.graphics();
      bg.fillStyle(isReady ? 0xe8f5e9 : 0xfafafa, 1);
      bg.lineStyle(2, isReady ? 0x4caf50 : 0xe0e0e0, 1);
      bg.fillRoundedRect(-cardWidth / 2 + 4, -36, cardWidth - 8, 72, 12);
      bg.strokeRoundedRect(-cardWidth / 2 + 4, -36, cardWidth - 8, 72, 12);
      container.add(bg);

      // Requested Item Icon
      const itemConfig = ITEMS_BY_ID[order.requiredItemId];
      if (itemConfig) {
        const itemImg = this.add.image(-cardWidth / 4 + 2, -4, `item_${itemConfig.id}`);
        itemImg.setScale(0.5);
        container.add(itemImg);
      }

      // Coin reward badge
      const coinImg = this.add.image(cardWidth / 4 - 8, -16, 'coin_icon');
      coinImg.setScale(0.5);
      const rewardText = this.add.text(cardWidth / 4 + 2, -16, `+${order.rewardCoins}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e65100',
      });
      rewardText.setOrigin(0, 0.5);
      container.add([coinImg, rewardText]);

      // Complete button or status
      if (isReady) {
        const completeBtn = this.add.container(cardWidth / 4 - 2, 14);
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x4caf50, 1);
        btnBg.fillRoundedRect(-24, -10, 48, 20, 8);

        const btnText = this.add.text(0, 0, t('complete_order'), {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#ffffff',
        });
        btnText.setOrigin(0.5);

        completeBtn.add([btnBg, btnText]);
        completeBtn.setSize(48, 20);
        completeBtn.setInteractive({ useHandCursor: true });
        completeBtn.on('pointerup', () => {
          this.completeOrder(order);
        });

        // Pulsing ready effect
        this.tweens.add({
          targets: completeBtn,
          scale: 1.08,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });

        container.add(completeBtn);
      } else {
        const pendingText = this.add.text(cardWidth / 4 - 2, 14, 'В процессе', {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '10px',
          color: '#9e9e9e',
        });
        pendingText.setOrigin(0.5);
        container.add(pendingText);
      }

      this.orderContainers.push(container);
    });
  }

  private completeOrder(order: Order): void {
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    // 1. Remove required item from board
    let removed = false;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (data.board[r][c].itemId === order.requiredItemId) {
          data.board[r][c].itemId = null;
          removed = true;
          break;
        }
      }
      if (removed) break;
    }

    if (!removed) return;

    // 2. Add reward coins
    data.coins += order.rewardCoins;
    data.stats.totalOrdersCompleted += 1;
    data.freeSeedTapsRemaining = Math.min(data.freeSeedTapsRemaining + 3, 20);

    // 3. Generate new order scaled to player progress
    const maxLvl = Math.max(2, Math.min(data.unlockedMaxLevel, 7));
    const randomLevel = Phaser.Math.Between(2, maxLvl);
    const targetItem = ITEMS.find((i) => i.level === randomLevel) || ITEMS[1];

    const orderIdx = data.activeOrders.findIndex((o) => o.id === order.id);
    if (orderIdx !== -1) {
      data.activeOrders[orderIdx] = {
        id: `order_${Date.now()}_${Phaser.Math.Between(10, 99)}`,
        requiredItemId: targetItem.id,
        rewardCoins: targetItem.sellValue * 4 + 10,
        rewardExp: targetItem.level * 15,
      };
    }

    saveManager.saveImmediate(data);

    // Play sounds & animations
    SoundSystem.getInstance().playOrderComplete();
    ModalManager.showToast(this, `Заказ выполнен! +${order.rewardCoins} монет ✦`, 0x2e7d32);

    const platform = getPlatformAdapter();
    platform.sendAnalytics('order_complete', {
      orderId: order.id,
      reward: order.rewardCoins,
    });

    this.orderCompletedCount++;
    if (this.orderCompletedCount % 3 === 0) {
      // Frequency capping: show interstitial every 3 completed orders
      this.time.delayedCall(600, () => {
        platform.showInterstitial();
      });
    }

    this.updateHUD();
    this.refreshBoardDisplay();
    this.renderOrders();
  }

  private createBoard(width: number): void {
    const gridCols = 6;
    const gridRows = 6;
    const totalBoardWidth = width - 24;
    this.cellSize = Math.floor(totalBoardWidth / gridCols);
    this.boardStartX = 12 + this.cellSize / 2;
    this.boardStartY = 200 + this.cellSize / 2;

    const boardBg = this.add.graphics();
    boardBg.fillStyle(0xffffff, 0.8);
    boardBg.fillRoundedRect(8, 194, totalBoardWidth + 8, this.cellSize * gridRows + 12, 18);
    boardBg.lineStyle(2, 0xa5d6a7, 1);
    boardBg.strokeRoundedRect(8, 194, totalBoardWidth + 8, this.cellSize * gridRows + 12, 18);

    this.cellViews = [];

    for (let r = 0; r < gridRows; r++) {
      const rowViews: CellView[] = [];
      for (let c = 0; c < gridCols; c++) {
        const cx = this.boardStartX + c * this.cellSize;
        const cy = this.boardStartY + r * this.cellSize;

        const tileBg = this.add.image(cx, cy, 'tile_bg');
        tileBg.setDisplaySize(this.cellSize - 4, this.cellSize - 4);

        rowViews.push({
          bg: tileBg,
          x: cx,
          y: cy,
          row: r,
          col: c,
          itemSprite: null,
        });
      }
      this.cellViews.push(rowViews);
    }

    this.refreshBoardDisplay();
  }

  private refreshBoardDisplay(): void {
    const data = SaveManager.getInstance().getData();

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const cell = data.board[r][c];
        const view = this.cellViews[r][c];

        if (cell.itemId) {
          const itemConfig = ITEMS_BY_ID[cell.itemId];
          if (!view.itemSprite) {
            const sprite = this.add.image(view.x, view.y, `item_${itemConfig.id}`);
            sprite.setDisplaySize(this.cellSize - 8, this.cellSize - 8);
            sprite.setInteractive({ draggable: true, useHandCursor: true });
            this.setupItemDragging(sprite, r, c);
            view.itemSprite = sprite;
          } else {
            view.itemSprite.setTexture(`item_${itemConfig.id}`);
            view.itemSprite.setPosition(view.x, view.y);
            view.itemSprite.setDisplaySize(this.cellSize - 8, this.cellSize - 8);
          }
        } else {
          if (view.itemSprite) {
            view.itemSprite.destroy();
            view.itemSprite = null;
          }
        }
      }
    }
  }

  private setupItemDragging(sprite: Phaser.GameObjects.Image, row: number, col: number): void {
    sprite.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      this.draggedSprite = sprite;
      this.dragSourceCell = { row, col };
      sprite.setDepth(50);
      sprite.setScale(1.15);
      SoundSystem.getInstance().playClick();
    });

    sprite.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      sprite.x = dragX;
      sprite.y = dragY;
    });

    sprite.on('dragend', (pointer: Phaser.Input.Pointer) => {
      sprite.setDepth(1);
      sprite.setScale(1);

      if (!this.dragSourceCell) return;

      const target = this.getGridCellFromPointer(pointer.x, pointer.y);
      if (
        target &&
        (target.row !== this.dragSourceCell.row || target.col !== this.dragSourceCell.col)
      ) {
        this.handleCellDrop(this.dragSourceCell, target);
      } else {
        // Snap back to source cell
        const sourceView = this.cellViews[this.dragSourceCell.row][this.dragSourceCell.col];
        this.tweens.add({
          targets: sprite,
          x: sourceView.x,
          y: sourceView.y,
          duration: 150,
          ease: 'Back.easeOut',
        });
      }

      this.draggedSprite = null;
      this.dragSourceCell = null;
    });
  }

  private getGridCellFromPointer(x: number, y: number): { row: number; col: number } | null {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const view = this.cellViews[r][c];
        const halfSize = this.cellSize / 2;
        if (
          x >= view.x - halfSize &&
          x <= view.x + halfSize &&
          y >= view.y - halfSize &&
          y <= view.y + halfSize
        ) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  private handleCellDrop(
    source: { row: number; col: number },
    target: { row: number; col: number }
  ): void {
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    const sourceCell = data.board[source.row][source.col];
    const targetCell = data.board[target.row][target.col];

    if (!sourceCell.itemId) return;

    // Case 1: Target cell is empty -> Move item
    if (!targetCell.itemId) {
      targetCell.itemId = sourceCell.itemId;
      sourceCell.itemId = null;
      saveManager.saveImmediate(data);
      this.refreshBoardDisplay();
      this.renderOrders();
      return;
    }

    // Case 2: Target cell has same item -> Merge!
    if (sourceCell.itemId === targetCell.itemId) {
      const currentConfig = ITEMS_BY_ID[sourceCell.itemId];
      if (currentConfig.nextItemId) {
        const nextConfig = ITEMS_BY_ID[currentConfig.nextItemId];
        targetCell.itemId = nextConfig.id;
        sourceCell.itemId = null;

        data.stats.totalMerges += 1;
        if (nextConfig.level > data.unlockedMaxLevel) {
          data.unlockedMaxLevel = nextConfig.level;
          ModalManager.showToast(this, `Открыт: ${t(nextConfig.nameKey)}! 🌸`, 0x2e7d32);
        }

        saveManager.saveImmediate(data);

        // Sound & FX
        SoundSystem.getInstance().playMerge(nextConfig.level);
        this.createMergeFX(this.cellViews[target.row][target.col].x, this.cellViews[target.row][target.col].y);

        const platform = getPlatformAdapter();
        platform.sendAnalytics('merge', {
          newItem: nextConfig.id,
          level: nextConfig.level,
        });

        this.refreshBoardDisplay();
        this.renderOrders();
        return;
      }
    }

    // Case 3: Different items or max level -> Swap places
    const temp = targetCell.itemId;
    targetCell.itemId = sourceCell.itemId;
    sourceCell.itemId = temp;

    saveManager.saveImmediate(data);
    this.refreshBoardDisplay();
    this.renderOrders();
  }

  private createMergeFX(x: number, y: number): void {
    const emitter = this.add.particles(x, y, 'particle_star', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.9, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12,
    });
    this.time.delayedCall(600, () => emitter.destroy());
  }

  private createBottomArea(width: number, height: number): void {
    const basketY = height - 150;

    // Seed Basket Container
    const basketContainer = this.add.container(width / 2, basketY);

    const basketImg = this.add.image(0, 0, 'seed_basket');
    basketImg.setScale(0.9);

    const basketTitle = this.add.text(0, 48, t('seed_basket'), {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#1b5e20',
    });
    basketTitle.setOrigin(0.5);

    this.basketBadgeText = this.add.text(0, -42, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#2e7d32',
      padding: { x: 8, y: 3 },
    });
    this.basketBadgeText.setOrigin(0.5);

    basketContainer.add([basketImg, basketTitle, this.basketBadgeText]);
    basketContainer.setSize(100, 100);
    basketContainer.setInteractive({ useHandCursor: true });

    basketContainer.on('pointerdown', () => {
      basketContainer.setScale(0.92);
    });

    basketContainer.on('pointerup', () => {
      basketContainer.setScale(1);
      this.handleSeedBasketTap();
    });

    basketContainer.on('pointerout', () => {
      basketContainer.setScale(1);
    });

    this.updateHUD();
  }

  private handleSeedBasketTap(): void {
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    // Check if board has empty cells
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (!data.board[r][c].itemId) {
          emptyCells.push({ r, c });
        }
      }
    }

    if (emptyCells.length === 0) {
      SoundSystem.getInstance().playError();
      ModalManager.showOverflowModal(
        this,
        () => {
          this.removeLowestLevelItem();
        },
        () => {
          data.freeSeedTapsRemaining += 5;
          saveManager.saveImmediate(data);
          this.updateHUD();
          ModalManager.showToast(this, '+5 бесплатных семян получено! 🌱', 0x2e7d32);
        },
        () => {}
      );
      return;
    }

    // Free tap or purchase with coins
    if (data.freeSeedTapsRemaining > 0) {
      data.freeSeedTapsRemaining--;
    } else {
      const seedCost = 3;
      if (data.coins < seedCost) {
        SoundSystem.getInstance().playError();
        ModalManager.showToast(this, 'Недостаточно монет для семечка!', 0xd84315);
        return;
      }
      data.coins -= seedCost;
    }

    // Spawn random seed (Level 1, or rare chance of Level 2 if progressed)
    const randomCell = Phaser.Utils.Array.GetRandom(emptyCells);
    const spawnLevel2 = data.unlockedMaxLevel >= 3 && Math.random() < 0.25;
    data.board[randomCell.r][randomCell.c].itemId = spawnLevel2 ? 'sprout_2' : 'seed_1';

    saveManager.saveImmediate(data);
    SoundSystem.getInstance().playSpawn();

    this.updateHUD();
    this.refreshBoardDisplay();
    this.renderOrders();
  }

  private removeLowestLevelItem(): void {
    const saveManager = SaveManager.getInstance();
    const data = saveManager.getData();

    let lowestLevel = 999;
    let targetCoords: { r: number; c: number } | null = null;

    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const id = data.board[r][c].itemId;
        if (id) {
          const cfg = ITEMS_BY_ID[id];
          if (cfg.level < lowestLevel) {
            lowestLevel = cfg.level;
            targetCoords = { r, c };
          }
        }
      }
    }

    if (targetCoords) {
      data.board[targetCoords.r][targetCoords.c].itemId = null;
      saveManager.saveImmediate(data);
      this.refreshBoardDisplay();
      this.renderOrders();
      ModalManager.showToast(this, 'Клетка освобождена! ✨', 0x2e7d32);
    }
  }

  private getBoardItemIds(): ItemId[] {
    const data = SaveManager.getInstance().getData();
    const list: ItemId[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const id = data.board[r][c].itemId;
        if (id) list.push(id);
      }
    }
    return list;
  }

  private updateHUD(): void {
    const data = SaveManager.getInstance().getData();
    if (this.coinText) {
      this.coinText.setText(`${data.coins}`);
    }
    if (this.basketBadgeText) {
      if (data.freeSeedTapsRemaining > 0) {
        this.basketBadgeText.setText(`Бесплатно: ${data.freeSeedTapsRemaining}`);
        this.basketBadgeText.setBackgroundColor('#2e7d32');
      } else {
        this.basketBadgeText.setText(`Семечко: 3 ✦`);
        this.basketBadgeText.setBackgroundColor('#f57c00');
      }
    }
  }
}
