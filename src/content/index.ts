import type { Locale } from '../i18n/locales';
import type { DeepContent, SiteContent } from './types';

/**
 * How a page reaches its own language and nothing else.
 *
 * Each entry is a dynamic import, so the bundler gives every language its own
 * chunk: a visitor reading the Spanish site downloads Spanish, never the five
 * languages at once. The same map serves the build, which simply awaits all of
 * them.
 */
export const loadContent: Record<Locale, () => Promise<SiteContent>> = {
  fr: () => import('./locales/fr').then((m) => m.fr),
  en: () => import('./locales/en').then((m) => m.en),
  es: () => import('./locales/es').then((m) => m.es),
  he: () => import('./locales/he').then((m) => m.he),
  ar: () => import('./locales/ar').then((m) => m.ar),
};

export const loadDeep: Record<Locale, () => Promise<DeepContent>> = {
  fr: () => import('./deep/fr').then((m) => m.deep),
  en: () => import('./deep/en').then((m) => m.deep),
  es: () => import('./deep/es').then((m) => m.deep),
  he: () => import('./deep/he').then((m) => m.deep),
  ar: () => import('./deep/ar').then((m) => m.deep),
};
