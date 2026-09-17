export type StorePlatform = 'ios' | 'android';
export type StoreStatus = 'available' | 'coming-soon';

export interface StoreTarget {
  platform: StorePlatform;
  /** Operating system, as a visitor names it. */
  os: string;
  /** Official store name, spelled the way the store spells it. */
  store: string;
  status: StoreStatus;
  /** Only ever set from a URL already validated by store-url.ts. */
  url?: string;
  /** Official badge artwork, rendered unmodified in both states. */
  badge: { src: string; width: number; height: number; alt: string };
  event: string;
}

const catalogue = [
  {
    platform: 'ios',
    os: 'iOS',
    store: 'App Store',
    event: 'download_app_store',
    badge: {
      src: '/assets/badges/app-store.svg',
      width: 150,
      height: 50,
      alt: 'Télécharger dans l’App Store',
    },
  },
  {
    platform: 'android',
    os: 'Android',
    store: 'Google Play',
    event: 'download_google_play',
    badge: {
      src: '/assets/badges/google-play.png',
      width: 169,
      height: 65,
      alt: 'Disponible sur Google Play',
    },
  },
] as const;

/**
 * Turns the two verified store URLs into the descriptors the whole site reads.
 * A platform is available only when it has a real URL, so publishing the app
 * means setting one environment variable: navbar, hero, download page and
 * footer all follow from here. Nothing else in the site decides availability.
 */
export function buildStores(apple?: string, google?: string): StoreTarget[] {
  const urls: Record<StorePlatform, string | undefined> = { ios: apple, android: google };
  return catalogue.map((entry) => {
    const url = urls[entry.platform];
    return {
      ...entry,
      badge: { ...entry.badge },
      status: url ? 'available' : 'coming-soon',
      url,
    };
  });
}

/** Where a download CTA can actually send someone, published or not. */
export const downloadHref = '/download/';
