import type { IPlatformAdapter } from '../types/platform';
import { MockPlatformAdapter } from './MockPlatformAdapter';
import { YandexPlatformAdapter } from './YandexPlatformAdapter';

let adapterInstance: IPlatformAdapter | null = null;

export function getPlatformAdapter(): IPlatformAdapter {
  if (adapterInstance) return adapterInstance;

  // Check if running inside Yandex Games environment
  const isYandex = typeof window !== 'undefined' && (Boolean(window.YaGames) || window.location.search.includes('yandex'));

  if (isYandex) {
    console.log('[PlatformFactory] Using YandexPlatformAdapter');
    adapterInstance = new YandexPlatformAdapter();
  } else {
    console.log('[PlatformFactory] Using MockPlatformAdapter (local environment)');
    adapterInstance = new MockPlatformAdapter();
  }

  return adapterInstance;
}
