import { hydrateRoot, createRoot } from 'react-dom/client';
import { App } from './App';
import type { DeepContent } from './content/types';
import { loadContent, loadDeep } from './content/index';
import { DEFAULT_LOCALE, isLocale, localeMeta, splitPath } from './i18n/locales';
import { startReveal } from './lib/reveal';
import './styles.css';

const root = document.getElementById('root')!;
const path = window.location.pathname;

/**
 * Which language this page is written in.
 *
 * Normally the address says it, and the delivered HTML agrees. The one
 * exception is the not-found page: the host serves the same document for every
 * unknown address, so a visitor who mistypes a Spanish URL receives the
 * document prerendered in the reference language. There, the address is the
 * better answer — and since the markup cannot match, the page is rendered
 * fresh rather than hydrated.
 */
const served = document.documentElement.lang;
const fallback = document.documentElement.dataset.fallback === '404';
const locale = fallback ? splitPath(path).locale : isLocale(served) ? served : DEFAULT_LOCALE;
const { slug } = splitPath(path);

/**
 * Inner pages carry several thousand words that the home page never shows.
 * Loading them per route keeps that weight out of the bundle every visitor
 * downloads; the text is already in the prerendered HTML, so nothing waits on
 * this request to be readable.
 */
const [content, deep] = await Promise.all([
  loadContent[locale](),
  slug ? loadDeep[locale]() : (undefined as DeepContent | undefined),
]);

const app = <App locale={locale} content={content} path={path} deep={deep} />;
if (fallback && locale !== served) {
  document.documentElement.lang = localeMeta[locale].tag;
  document.documentElement.dir = localeMeta[locale].dir;
  createRoot(root).render(app);
} else if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);
startReveal();

/**
 * Vercel Web Analytics and Speed Insights.
 *
 * Only on the production deployment: both load their script from a
 * `/_vercel/…` path that Vercel alone serves, so anywhere else — local
 * preview, end to end tests — they would just be a 404 in the console.
 * `scripts/vercel-build.mjs` decides, and the flag is baked in at build time.
 *
 * Loaded on demand and once the browser is idle: measurement must never take
 * bandwidth or main thread from the page it measures. Web vitals are read from
 * buffered entries, so arriving late costs no measurement.
 */
if (import.meta.env.VITE_VERCEL_INSIGHTS === 'true') {
  const start = () => {
    void import('@vercel/analytics').then(({ inject }) => inject({ framework: 'vite' }));
    void import('@vercel/speed-insights').then(({ injectSpeedInsights }) =>
      injectSpeedInsights({ framework: 'vite' }),
    );
  };
  // Safari only gained requestIdleCallback recently: fall back to a wait.
  if (typeof requestIdleCallback === 'function') requestIdleCallback(start, { timeout: 4000 });
  else addEventListener('load', () => setTimeout(start, 1200), { once: true });
}
