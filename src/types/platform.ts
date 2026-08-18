import type { SaveData } from './state';

export type AnalyticsEvent =
  | 'game_start'
  | 'tutorial_complete'
  | 'merge'
  | 'order_complete'
  | 'session_end'
  | 'rewarded_offer'
  | 'rewarded_success';

export interface IPlatformAdapter {
  readonly platformName: string;
  init(): Promise<void>;
  loadingReady(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  loadData(): Promise<SaveData | null>;
  saveData(data: SaveData): Promise<void>;
  showInterstitial(): Promise<boolean>;
  showRewarded(rewardType: string): Promise<boolean>;
  sendAnalytics(event: AnalyticsEvent, params?: Record<string, unknown>): void;
}
