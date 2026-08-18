import * as Phaser from 'phaser';
import { ITEMS } from '../data/items';

export class AssetGenerator {
  static generateAll(scene: Phaser.Scene): void {
    AssetGenerator.generateBoardTile(scene);
    AssetGenerator.generateSeedBasket(scene);
    AssetGenerator.generateCoinIcon(scene);
    AssetGenerator.generateButtons(scene);
    AssetGenerator.generateParticle(scene);
    AssetGenerator.generateItemTextures(scene);
  }

  private static generateBoardTile(scene: Phaser.Scene): void {
    if (scene.textures.exists('tile_bg')) return;
    const canvas = scene.textures.createCanvas('tile_bg', 80, 80);
    if (!canvas) return;
    const ctx = canvas.context;

    // Rounded rectangle with soft inner shading and garden soil tint
    ctx.fillStyle = '#e8f0e6';
    ctx.strokeStyle = '#c5d8c1';
    ctx.lineWidth = 3;
    AssetGenerator.roundRect(ctx, 3, 3, 74, 74, 14);
    ctx.fill();
    ctx.stroke();

    // Subtle inner depth dot grid
    ctx.fillStyle = '#d4e4cf';
    ctx.beginPath();
    ctx.arc(40, 40, 2, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static generateSeedBasket(scene: Phaser.Scene): void {
    if (scene.textures.exists('seed_basket')) return;
    const canvas = scene.textures.createCanvas('seed_basket', 110, 110);
    if (!canvas) return;
    const ctx = canvas.context;

    // Soft outer glow / badge shadow
    ctx.shadowColor = 'rgba(76, 175, 80, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#66bb6a';
    AssetGenerator.roundRect(ctx, 8, 8, 94, 94, 22);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Basket wicker drawing
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(55, 62, 34, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Basket rim
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(55, 52, 36, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sprouting seeds inside basket
    ctx.fillStyle = '#c8e6c9';
    ctx.beginPath();
    ctx.arc(46, 44, 7, 0, Math.PI * 2);
    ctx.arc(64, 44, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(46, 38, 4, 0, Math.PI * 2);
    ctx.arc(64, 38, 4, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static generateCoinIcon(scene: Phaser.Scene): void {
    if (scene.textures.exists('coin_icon')) return;
    const canvas = scene.textures.createCanvas('coin_icon', 36, 36);
    if (!canvas) return;
    const ctx = canvas.context;

    // Golden coin
    ctx.fillStyle = '#ffca28';
    ctx.strokeStyle = '#f57f17';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(18, 18, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner rim
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(18, 18, 11, 0, Math.PI * 2);
    ctx.stroke();

    // Leaf symbol on coin
    ctx.fillStyle = '#e65100';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', 18, 18);

    canvas.refresh();
  }

  private static generateButtons(scene: Phaser.Scene): void {
    // Primary Button Texture
    if (!scene.textures.exists('btn_primary')) {
      const canvas = scene.textures.createCanvas('btn_primary', 220, 64);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = '#4caf50';
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3;
        AssetGenerator.roundRect(ctx, 4, 4, 212, 56, 16);
        ctx.fill();
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        AssetGenerator.roundRect(ctx, 8, 8, 204, 24, 12);
        ctx.fill();
        canvas.refresh();
      }
    }

    // Secondary / Tab Button Texture
    if (!scene.textures.exists('btn_secondary')) {
      const canvas = scene.textures.createCanvas('btn_secondary', 160, 52);
      if (canvas) {
        const ctx = canvas.context;
        ctx.fillStyle = '#81c784';
        ctx.strokeStyle = '#388e3c';
        ctx.lineWidth = 2.5;
        AssetGenerator.roundRect(ctx, 3, 3, 154, 46, 14);
        ctx.fill();
        ctx.stroke();
        canvas.refresh();
      }
    }
  }

  private static generateParticle(scene: Phaser.Scene): void {
    if (scene.textures.exists('particle_star')) return;
    const canvas = scene.textures.createCanvas('particle_star', 24, 24);
    if (!canvas) return;
    const ctx = canvas.context;

    ctx.fillStyle = '#fff59d';
    ctx.beginPath();
    ctx.arc(12, 12, 6, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  private static generateItemTextures(scene: Phaser.Scene): void {
    ITEMS.forEach((item) => {
      const texKey = `item_${item.id}`;
      if (scene.textures.exists(texKey)) return;

      const canvas = scene.textures.createCanvas(texKey, 84, 84);
      if (!canvas) return;
      const ctx = canvas.context;

      // Base card bubble with smooth lighting
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = `#${item.badgeColor.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 3.5;
      AssetGenerator.roundRect(ctx, 4, 4, 76, 76, 16);
      ctx.fill();
      ctx.stroke();

      // Soft tinted gradient background
      ctx.fillStyle = `#${item.color.toString(16).padStart(6, '0')}33`;
      AssetGenerator.roundRect(ctx, 7, 7, 70, 70, 13);
      ctx.fill();

      // Draw distinctive procedural artwork for each of the 8 levels
      AssetGenerator.drawItemArt(ctx, item.id);

      // Level number badge in bottom-right corner
      ctx.fillStyle = `#${item.badgeColor.toString(16).padStart(6, '0')}`;
      ctx.beginPath();
      ctx.arc(66, 66, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.level}`, 66, 66);

      canvas.refresh();
    });
  }

  private static drawItemArt(ctx: CanvasRenderingContext2D, id: string): void {
    const cx = 40;
    const cy = 38;

    switch (id) {
      case 'seed_1':
        // Seed bean shape
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 18, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d7ccc8';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 6, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'sprout_2':
        // Sprout with 2 leaves
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 16);
        ctx.quadraticCurveTo(cx, cy, cx, cy - 2);
        ctx.stroke();

        ctx.fillStyle = '#66bb6a';
        // Left leaf
        ctx.beginPath();
        ctx.ellipse(cx - 10, cy - 6, 10, 6, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        // Right leaf
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 6, 10, 6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'flower_3':
        // 5-petal flower
        ctx.fillStyle = '#ffa726';
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const px = cx + Math.cos(angle) * 14;
          const py = cy + Math.sin(angle) * 14;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bush_4':
        // Lush green bush cluster
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(cx - 10, cy + 2, 14, 0, Math.PI * 2);
        ctx.arc(cx + 10, cy + 2, 14, 0, Math.PI * 2);
        ctx.arc(cx, cy - 8, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#81c784';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 4, 6, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy + 2, 5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tree_5':
        // Fruit tree with trunk & red apples
        ctx.fillStyle = '#795548';
        ctx.fillRect(cx - 4, cy + 6, 8, 16);

        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, 20, 0, Math.PI * 2);
        ctx.fill();

        // Red fruits
        ctx.fillStyle = '#e53935';
        [[-8, -10], [6, -12], [-2, 2], [10, -2]].forEach(([ox, oy]) => {
          ctx.beginPath();
          ctx.arc(cx + ox, cy + oy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'orchid_6':
        // Exotic purple orchid
        ctx.fillStyle = '#ab47bc';
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI * 2) / 4 + Math.PI / 4;
          const px = cx + Math.cos(angle) * 15;
          const py = cy + Math.sin(angle) * 15;
          ctx.beginPath();
          ctx.ellipse(px, py, 11, 7, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#f48fb1';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'rose_arch_7':
        // Arch with roses
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy + 10, 20, Math.PI, 0);
        ctx.stroke();

        ctx.fillStyle = '#e91e63';
        [[-16, 4], [-10, -8], [0, -12], [10, -8], [16, 4]].forEach(([ox, oy]) => {
          ctx.beginPath();
          ctx.arc(cx + ox, cy + oy, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;

      case 'pond_8':
        // Garden pond with water lilies
        ctx.fillStyle = '#0288d1';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pond stone border
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Water lily
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 3, 6, 0, Math.PI * 1.7);
        ctx.fill();

        ctx.fillStyle = '#f06292';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
