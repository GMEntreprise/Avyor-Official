import { storeUrl } from './lib/store-url';
import { buildStores } from './lib/app-download';
export const config = {
  name: 'AVYOR',
  origin: (import.meta.env.VITE_SITE_URL || 'https://avyor.app').replace(/\/$/, ''),
  indexable: import.meta.env.VITE_SITE_INDEXABLE === 'true',
  email: 'shavod.web@gmail.com',
  apple: storeUrl(import.meta.env.VITE_APPLE_APP_URL, 'apple'),
  google: storeUrl(import.meta.env.VITE_GOOGLE_PLAY_URL, 'google'),
  description:
    'AVYOR est une plateforme mobile de collaboration entre Creators et marques. Découvrez des profils, lancez des campagnes et suivez vos projets au même endroit.',
};
export const motionTokens = {
  fast: 0.18,
  normal: 0.28,
  slow: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};
/** Single source of truth for app availability across the whole site. */
export const stores = buildStores(config.apple, config.google);
export const storeFor = (platform: 'ios' | 'android') =>
  stores.find((s) => s.platform === platform)!;
export const anyStoreAvailable = stores.some((s) => s.status === 'available');
