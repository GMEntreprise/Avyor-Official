/**
 * The five languages AVYOR is published in.
 *
 * No i18n runtime is involved: the site is prerendered once per language, so
 * each visitor receives finished HTML in their language and the browser never
 * loads a translation engine. This module holds only what both the build and
 * the page need to agree on — the list, the writing direction, and how a
 * language maps onto a URL.
 */
export const LOCALES = ['fr', 'en', 'es', 'he', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** French is the reference language: it is the one that lives at the root. */
export const DEFAULT_LOCALE: Locale = 'fr';

export interface LocaleMeta {
  /** BCP 47 tag for `<html lang>`, `hreflang` and `inLanguage`. */
  tag: string;
  dir: 'ltr' | 'rtl';
  /** The language named in itself, which is how a switcher must name it. */
  label: string;
  /** Short code shown in the switcher, already in the right script. */
  code: string;
  /** Open Graph locale, which uses an underscore and a region. */
  ogLocale: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  fr: { tag: 'fr', dir: 'ltr', label: 'Français', code: 'FR', ogLocale: 'fr_FR' },
  en: { tag: 'en', dir: 'ltr', label: 'English', code: 'EN', ogLocale: 'en_US' },
  es: { tag: 'es', dir: 'ltr', label: 'Español', code: 'ES', ogLocale: 'es_ES' },
  he: { tag: 'he', dir: 'rtl', label: 'עברית', code: 'HE', ogLocale: 'he_IL' },
  ar: { tag: 'ar', dir: 'rtl', label: 'العربية', code: 'AR', ogLocale: 'ar_AE' },
};

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** Everything but the reference language is served under a prefix. */
export const localePrefix = (locale: Locale) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

/** The canonical path of a page in a language, trailing slash included. */
export const routeFor = (locale: Locale, slug: string) =>
  `${localePrefix(locale)}/${slug ? `${slug}/` : ''}`;

const PREFIX = new RegExp(
  `^/(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})(?=/|$)`,
  'i',
);

/** Reads a path back into the language it is written in and the page it names. */
export function splitPath(path: string): { locale: Locale; slug: string } {
  const match = PREFIX.exec(path);
  const locale = match ? (match[1].toLowerCase() as Locale) : DEFAULT_LOCALE;
  const rest = match ? path.slice(match[0].length) : path;
  return { locale, slug: rest.replace(/^\/|\/$/g, '') };
}

/**
 * The same address in another language.
 *
 * It works on the raw path rather than on a known page, so an unknown address
 * keeps its shape: a visitor who switches language on a 404 lands on the 404
 * of that language, not on its home page.
 */
export function swapLocale(path: string, target: Locale): string {
  const rest = path.replace(PREFIX, '') || '/';
  if (target === DEFAULT_LOCALE) return rest;
  return `/${target}${rest === '/' ? '/' : rest}`;
}

/**
 * Every language has its own entry page: `/`, `/en/`, `/es/`… Only those carry
 * the intro, and its session guard.
 *
 * The build knows a page by its slug, but the dev server only sees a URL — and
 * for a while it compared that URL to `/` alone, so every non-French home
 * replayed the intro at each language change. One rule now serves both.
 */
export function isHomeRoute(route: string): boolean {
  return splitPath(route.split('?')[0].replace(/index\.html$/, '')).slug === '';
}
