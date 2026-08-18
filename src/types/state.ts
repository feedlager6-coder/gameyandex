import type { BoardCell, GardenPlot, Order } from './game';

export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  lang: 'ru' | 'en';
}

export interface PlayerStats {
  totalMerges: number;
  totalOrdersCompleted: number;
  sessionsCount: number;
  lastPlayedTimestamp: number;
}

export interface SaveData {
  schemaVersion: number;
  balanceVersion: number;
  coins: number;
  unlockedMaxLevel: number;
  freeSeedTapsRemaining: number;
  board: BoardCell[][]; // 6x6 grid
  activeOrders: Order[];
  gardenPlots: GardenPlot[];
  settings: GameSettings;
  tutorialCompleted: boolean;
  stats: PlayerStats;
  lastSavedTimestamp: number;
}
