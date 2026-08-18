import type { AnalyticsEvent, IPlatformAdapter } from '../types/platform';
import type { SaveData } from '../types/state';

const STORAGE_KEY = 'garden_workshop_savedata_v1';

export class MockPlatformAdapter implements IPlatformAdapter {
  readonly platformName = 'MockLocal';
  private isAdShowing = false;
  private isGameReadyReported = false;

  async init(): Promise<void> {
    console.log('[MockPlatformAdapter] Initialized in local standalone mode.');
  }

  getLanguage(): string {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const qLang = urlParams.get('lang');
        if (qLang) {
          return qLang.toLowerCase().startsWith('en') ? 'en' : 'ru';
        }
        if (navigator.language && navigator.language.toLowerCase().startsWith('en')) {
          return 'en';
        }
      } catch (e) {
        console.warn('[MockPlatformAdapter] getLanguage fallback error:', e);
      }
    }
    return 'ru';
  }

  loadingReady(): void {
    if (!this.isGameReadyReported) {
      this.isGameReadyReported = true;
      console.log('[MockPlatformAdapter] loadingReady() invoked — game is fully interactive.');
    }
  }

  gameplayStart(): void {
    console.log('[MockPlatformAdapter] gameplayStart()');
  }

  gameplayStop(): void {
    console.log('[MockPlatformAdapter] gameplayStop()');
  }

  async loadData(): Promise<SaveData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch (e) {
      console.warn('[MockPlatformAdapter] Failed to load data from localStorage:', e);
      return null;
    }
  }

  async saveData(data: SaveData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[MockPlatformAdapter] Saved state locally at', new Date(data.lastSavedTimestamp).toISOString());
    } catch (e) {
      console.warn('[MockPlatformAdapter] Failed to save data to localStorage:', e);
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (this.isAdShowing) return false;
    this.isAdShowing = true;
    this.gameplayStop();
    console.log('[MockPlatformAdapter] Showing interstitial ad (simulated 1.5s)...');

    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAdShowing = false;
        this.gameplayStart();
        console.log('[MockPlatformAdapter] Interstitial ad finished.');
        resolve(true);
      }, 1200);
    });
  }

  async showRewarded(rewardType: string): Promise<boolean> {
    if (this.isAdShowing) return false;
    this.isAdShowing = true;
    this.gameplayStop();
    this.sendAnalytics('rewarded_offer', { rewardType });

    console.log(`[MockPlatformAdapter] Showing rewarded ad for '${rewardType}' (simulated 2s)...`);

    return new Promise((resolve) => {
      // In mock mode, we simulate viewing the rewarded video to completion
      setTimeout(() => {
        this.isAdShowing = false;
        this.gameplayStart();
        this.sendAnalytics('rewarded_success', { rewardType });
        console.log(`[MockPlatformAdapter] Rewarded ad watched successfully for '${rewardType}'.`);
        resolve(true);
      }, 1500);
    });
  }

  sendAnalytics(event: AnalyticsEvent, params?: Record<string, unknown>): void {
    console.log(`[MockPlatformAdapter][Analytics] ${event}`, params || {});
  }
}
