import { hydrateRoot, createRoot } from 'react-dom/client';
import { App, type DeepContent } from './App';
import { startReveal } from './lib/reveal';
import './styles.css';
const root = document.getElementById('root')!;
const path = window.location.pathname;
const slug = path.replace(/^\/|\/$/g, '');
/**
 * Inner pages carry several thousand words that the home page never shows.
 * Loading them per route keeps that weight out of the bundle every visitor
 * downloads; the text is already in the prerendered HTML, so nothing waits on
 * this request to be readable.
 */
const deep: DeepContent | undefined = slug ? (await import('./content/deep')).deep : undefined;
const app = <App path={path} deep={deep} />;
if (root.querySelector('main')) hydrateRoot(root, app);
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
