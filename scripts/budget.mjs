import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
const files = readdirSync('dist/assets');
const gzip = (f) => gzipSync(readFileSync('dist/assets/' + f)).length;
const sum = (ext) => files.filter((f) => f.endsWith(ext)).reduce((s, f) => s + gzip(f), 0);
/**
 * What a visitor downloads to open a page: the entry chunk plus everything it
 * statically imports. Chunks fetched on demand — the legal documents — are not
 * part of that, so they are held to a separate total instead of inflating the
 * number that matters for loading the site.
 */
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const entry = Object.values(manifest).find((c) => c.isEntry);
const initial = [entry.file, ...(entry.imports ?? []).map((k) => manifest[k].file)];
const metrics = {
  jsGzip: initial.reduce((s, f) => s + gzip(f.replace('assets/', '')), 0),
  jsGzipTotal: sum('.js'),
  cssGzip: sum('.css'),
  poster: statSync('dist/assets/hero-poster.webp').size,
  // The film is held to its own ceiling: shown at full size, it must never be
  // able to grow into the cost of opening the site. Its section is asleep for
  // now, so the measure steps aside when the assets are not shipped.
  ...(existsSync('dist/assets/avyor-film.mp4')
    ? {
        film: Math.min(
          statSync('dist/assets/avyor-film.mp4').size,
          statSync('dist/assets/avyor-film.webm').size,
        ),
        filmPoster: statSync('dist/assets/avyor-film-poster.webp').size,
      }
    : {}),
  desktopVideo: statSync('dist/assets/hero-desktop.mp4').size,
  mobileVideo: statSync('dist/assets/hero-mobile.mp4').size,
};
const budgets = {
  jsGzip: 140 * 1024,
  jsGzipTotal: 165 * 1024,
  cssGzip: 25 * 1024,
  poster: 220 * 1024,
  film: 1.5 * 1024 * 1024,
  filmPoster: 120 * 1024,
  desktopVideo: 3 * 1024 * 1024,
  mobileVideo: 1.5 * 1024 * 1024,
};
for (const key in budgets)
  if (key in metrics)
    assert.ok(metrics[key] <= budgets[key], `${key}: ${metrics[key]} > ${budgets[key]}`);
writeFileSync(
  'docs/site/performance-budget.json',
  JSON.stringify({ measuredAt: new Date().toISOString(), initial, metrics, budgets }, null, 2),
);
console.log(metrics);
