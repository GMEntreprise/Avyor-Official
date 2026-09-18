import { renderToString } from 'react-dom/server';
import { App } from './App';
import { fr } from './content/locales/fr';
import { en } from './content/locales/en';
import { es } from './content/locales/es';
import { he } from './content/locales/he';
import { ar } from './content/locales/ar';
import { deep as deepFr } from './content/deep/fr';
import { deep as deepEn } from './content/deep/en';
import { deep as deepEs } from './content/deep/es';
import { deep as deepHe } from './content/deep/he';
import { deep as deepAr } from './content/deep/ar';
import type { DeepContent, SiteContent } from './content/types';
import type { Locale } from './i18n/locales';
import type { NewsData } from './news/build';
import * as newsViews from './news/views';

/**
 * The build sees every language at once — it writes one HTML file per page per
 * language — so here the imports are static. The browser bundle keeps them
 * dynamic, in src/content/index.ts, and downloads one language only.
 */
const content: Record<Locale, SiteContent> = { fr, en, es, he, ar };
const deep: Record<Locale, DeepContent> = {
  fr: deepFr,
  en: deepEn,
  es: deepEs,
  he: deepHe,
  ar: deepAr,
};

export { LOCALES, DEFAULT_LOCALE, localeMeta, routeFor, localePrefix } from './i18n/locales';
export { config } from './config';
export { introScript } from './components/intro-session';
export const contentFor = (locale: Locale) => content[locale];

export function render(locale: Locale, path: string, news?: NewsData) {
  return renderToString(
    <App
      locale={locale}
      content={content[locale]}
      path={path}
      deep={deep[locale]}
      news={news}
      newsViews={newsViews}
    />,
  );
}

/*
 * News, for the build. The store reads the published files; the build
 * functions turn them into pages. They are compiled here, with the rest of
 * the server bundle, so the build does not depend on the Node version running
 * TypeScript files directly.
 */
export { listPublished, defaultPaths, newsRedirects } from './news/store.server';
export {
  publicCorpus,
  forLocale,
  indexPage,
  pageCount,
  relatedFor,
  alternatesFor,
  searchIndex,
  rssFeed,
  toPublic,
  summarize,
} from './news/build';
export { tableOfContents, plainText } from './news/model';
