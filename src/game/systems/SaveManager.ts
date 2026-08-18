import type { BoardCell } from '../../types/game';
import type { IPlatformAdapter } from '../../types/platform';
import type { SaveData } from '../../types/state';
import { INITIAL_GARDEN_PLOTS } from '../data/gardenUpgrades';

export const SCHEMA_VERSION = 1;
export const BALANCE_VERSION = 1;

export class SaveManager {
  private static instance: SaveManager;
  private adapter: IPlatformAdapter | null = null;
  private currentData: SaveData | null = null;
  private debounceTimer: number | null = null;

  private constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.currentData && this.adapter) {
          this.flushCloudSave();
        }
      });
    }
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  init(adapter: IPlatformAdapter): void {
    this.adapter = adapter;
  }

  createDefaultState(): SaveData {
    const emptyBoard: BoardCell[][] = [];
    for (let r = 0; r < 6; r++) {
      const row: BoardCell[] = [];
      for (let c = 0; c < 6; c++) {
        row.push({
          row: r,
          col: c,
          itemId: null,
        });
      }
      emptyBoard.push(row);
    }

    // Seed the board with 2 starter seeds
    emptyBoard[2][2].itemId = 'seed_1';
    emptyBoard[2][3].itemId = 'seed_1';

    return {
      schemaVersion: SCHEMA_VERSION,
      balanceVersion: BALANCE_VERSION,
      coins: 50,
      unlockedMaxLevel: 1,
      freeSeedTapsRemaining: 15,
      board: emptyBoard,
      activeOrders: [
        { id: 'order_1', requiredItemId: 'sprout_2', rewardCoins: 15, rewardExp: 10 },
        { id: 'order_2', requiredItemId: 'flower_3', rewardCoins: 35, rewardExp: 25 },
        { id: 'order_3', requiredItemId: 'bush_4', rewardCoins: 80, rewardExp: 60 },
      ],
      gardenPlots: JSON.parse(JSON.stringify(INITIAL_GARDEN_PLOTS)),
      settings: {
        soundEnabled: true,
        vibrationEnabled: true,
        lang: 'ru',
      },
      tutorialCompleted: false,
      stats: {
        totalMerges: 0,
        totalOrdersCompleted: 0,
        sessionsCount: 1,
        lastPlayedTimestamp: Date.now(),
      },
      lastSavedTimestamp: Date.now(),
    };
  }

  async load(): Promise<SaveData> {
    if (!this.adapter) {
      this.currentData = this.createDefaultState();
      return this.currentData;
    }

    const loaded = await this.adapter.loadData();
    if (!loaded || loaded.schemaVersion !== SCHEMA_VERSION) {
      this.currentData = this.createDefaultState();
    } else {
      this.currentData = loaded;
      this.currentData.stats.sessionsCount += 1;
      this.currentData.stats.lastPlayedTimestamp = Date.now();
    }

    return this.currentData;
  }

  getData(): SaveData {
    if (!this.currentData) {
      this.currentData = this.createDefaultState();
    }
    return this.currentData;
  }

  saveImmediate(data?: SaveData): void {
    if (data) {
      this.currentData = data;
    }
    if (!this.currentData) return;

    this.currentData.lastSavedTimestamp = Date.now();

    // 1. Instant local write
    try {
      localStorage.setItem('garden_workshop_savedata_v1', JSON.stringify(this.currentData));
    } catch (e) {
      console.warn('[SaveManager] Immediate local save error:', e);
    }

    // 2. Debounced cloud save
    this.scheduleCloudSave();
  }

  private scheduleCloudSave(): void {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.flushCloudSave();
    }, 1500);
  }

  private flushCloudSave(): void {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.adapter && this.currentData) {
      this.adapter.saveData(this.currentData).catch((err) => {
        console.warn('[SaveManager] Cloud flush failed:', err);
      });
    }
  }

  resetProgress(): SaveData {
    this.currentData = this.createDefaultState();
    this.saveImmediate(this.currentData);
    return this.currentData;
  }
}
