import type { AnalyticsEvent, IPlatformAdapter } from '../types/platform';
import type { SaveData } from '../types/state';

// Declarations for Yandex SDK interfaces without using `any`
interface YandexPlayer {
  getData(keys?: string[]): Promise<Record<string, unknown>>;
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
  getName(): string;
  getUniqueID(): string;
}

interface YandexAdv {
  showFullscreenAdv(options: {
    callbacks: {
      onOpen?: () => void;
      onClose?: (wasShown: boolean) => void;
      onError?: (error: Error) => void;
    };
  }): void;
  showRewardedVideo(options: {
    callbacks: {
      onOpen?: () => void;
      onRewarded?: () => void;
      onClose?: () => void;
      onError?: (error: Error) => void;
    };
  }): void;
}

interface YandexFeatures {
  LoadingAPI?: {
    ready(): void;
  };
  GameplayAPI?: {
    start(): void;
    stop(): void;
  };
}

interface YandexEnvironment {
  i18n?: {
    lang: string;
    tld?: string;
  };
  app?: {
    id: string;
  };
  browser?: {
    lang: string;
  };
}

interface YandexSDK {
  environment?: YandexEnvironment;
  features?: YandexFeatures;
  adv?: YandexAdv;
  getPlayer(options?: { scopes?: boolean }): Promise<YandexPlayer>;
}

declare global {
  interface Window {
    YaGames?: {
      init(): Promise<YandexSDK>;
    };
  }
}

const LOCAL_STORAGE_FALLBACK_KEY = 'garden_workshop_savedata_v1';

export class YandexPlatformAdapter implements IPlatformAdapter {
  readonly platformName = 'YandexGames';
  private ysdk: YandexSDK | null = null;
  private player: YandexPlayer | null = null;
  private isAdShowing = false;
  private isGameReadyReported = false;

  async init(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.YaGames) {
        this.ysdk = await window.YaGames.init();
        console.log('[YandexPlatformAdapter] YaGames SDK initialized successfully.');

        // Access environment.i18n.lang early on init to fulfill Yandex requirement 2.14
        const detectedLang = this.getLanguage();
        console.log('[YandexPlatformAdapter] Detected SDK language at startup:', detectedLang);

        try {
          // Guest player initialization without forced auth
          this.player = await this.ysdk.getPlayer({ scopes: false });
          console.log('[YandexPlatformAdapter] Player initialized.');
        } catch (playerErr) {
          console.warn('[YandexPlatformAdapter] Player init fallback:', playerErr);
        }
      } else {
        console.warn('[YandexPlatformAdapter] window.YaGames not found, fallback to local storage.');
      }
    } catch (e) {
      console.error('[YandexPlatformAdapter] SDK init failed:', e);
    }
  }

  getLanguage(): string {
    if (this.ysdk?.environment?.i18n?.lang) {
      const sdkLang = this.ysdk.environment.i18n.lang.toLowerCase();
      if (sdkLang.startsWith('en')) {
        return 'en';
      }
      return 'ru';
    }
    return 'ru';
  }

  loadingReady(): void {
    if (this.isGameReadyReported) return;
    this.isGameReadyReported = true;
    try {
      if (this.ysdk?.features?.LoadingAPI) {
        this.ysdk.features.LoadingAPI.ready();
        console.log('[YandexPlatformAdapter] LoadingAPI.ready() sent to Yandex.');
      } else {
        console.log('[YandexPlatformAdapter] LoadingAPI not available, skipped.');
      }
    } catch (e) {
      console.warn('[YandexPlatformAdapter] Failed to call loadingReady():', e);
    }
  }

  gameplayStart(): void {
    try {
      this.ysdk?.features?.GameplayAPI?.start();
    } catch (e) {
      console.warn('[YandexPlatformAdapter] GameplayAPI.start error:', e);
    }
  }

  gameplayStop(): void {
    try {
      this.ysdk?.features?.GameplayAPI?.stop();
    } catch (e) {
      console.warn('[YandexPlatformAdapter] GameplayAPI.stop error:', e);
    }
  }

  async loadData(): Promise<SaveData | null> {
    // 1. Try Yandex Player cloud storage
    if (this.player) {
      try {
        const result = await this.player.getData(['savedata']);
        if (result && result.savedata) {
          return result.savedata as SaveData;
        }
      } catch (e) {
        console.warn('[YandexPlatformAdapter] Cloud loadData failed, trying localStorage:', e);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      if (raw) {
        return JSON.parse(raw) as SaveData;
      }
    } catch (e) {
      console.warn('[YandexPlatformAdapter] LocalStorage load failed:', e);
    }

    return null;
  }

  async saveData(data: SaveData): Promise<void> {
    // Always mirror to localStorage immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[YandexPlatformAdapter] localStorage mirror save failed:', e);
    }

    // Save to Yandex Player cloud
    if (this.player) {
      try {
        await this.player.setData({ savedata: data }, true);
      } catch (e) {
        console.warn('[YandexPlatformAdapter] Cloud saveData failed:', e);
      }
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (this.isAdShowing) return false;
    if (!this.ysdk?.adv) {
      console.log('[YandexPlatformAdapter] Interstitial skipped: adv API unavailable.');
      return false;
    }

    this.isAdShowing = true;
    this.gameplayStop();

    return new Promise((resolve) => {
      this.ysdk!.adv!.showFullscreenAdv({
        callbacks: {
          onOpen: () => {
            console.log('[YandexPlatformAdapter] Fullscreen ad open.');
          },
          onClose: (wasShown: boolean) => {
            this.isAdShowing = false;
            this.gameplayStart();
            console.log('[YandexPlatformAdapter] Fullscreen ad closed, shown:', wasShown);
            resolve(wasShown);
          },
          onError: (err: Error) => {
            this.isAdShowing = false;
            this.gameplayStart();
            console.warn('[YandexPlatformAdapter] Fullscreen ad error:', err);
            resolve(false);
          },
        },
      });
    });
  }

  async showRewarded(rewardType: string): Promise<boolean> {
    if (this.isAdShowing) return false;
    if (!this.ysdk?.adv) {
      console.warn('[YandexPlatformAdapter] Rewarded skipped: adv API unavailable.');
      return false;
    }

    this.isAdShowing = true;
    this.gameplayStop();
    this.sendAnalytics('rewarded_offer', { rewardType });

    return new Promise((resolve) => {
      let isRewarded = false;

      this.ysdk!.adv!.showRewardedVideo({
        callbacks: {
          onOpen: () => {
            console.log('[YandexPlatformAdapter] Rewarded ad opened.');
          },
          onRewarded: () => {
            isRewarded = true;
            console.log('[YandexPlatformAdapter] Rewarded callback fired.');
          },
          onClose: () => {
            this.isAdShowing = false;
            this.gameplayStart();
            if (isRewarded) {
              this.sendAnalytics('rewarded_success', { rewardType });
              resolve(true);
            } else {
              resolve(false);
            }
          },
          onError: (err: Error) => {
            this.isAdShowing = false;
            this.gameplayStart();
            console.warn('[YandexPlatformAdapter] Rewarded ad error:', err);
            resolve(false);
          },
        },
      });
    });
  }

  sendAnalytics(event: AnalyticsEvent, params?: Record<string, unknown>): void {
    console.log(`[YandexPlatformAdapter][Analytics] ${event}`, params || {});
  }
}
