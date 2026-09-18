import { copyFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Publishes the finished film into the site's public assets.
 *
 * Kept as an explicit step rather than a side effect of rendering: putting a
 * new file in front of every visitor should be something someone runs on
 * purpose. It refuses rather than publishing a film that is not there.
 */
const site = resolve(import.meta.dir, '../../..');
const web = resolve(site, 'video/exports/web');
const posters = resolve(site, 'video/exports/posters');
const target = resolve(site, 'public/assets');

const files: [string, string][] = [
  [resolve(web, 'hero-avyor-desktop.mp4'), resolve(target, 'avyor-film.mp4')],
  [resolve(web, 'hero-avyor-desktop.webm'), resolve(target, 'avyor-film.webm')],
  [resolve(posters, 'hero-avyor-desktop-poster.webp'), resolve(target, 'avyor-film-poster.webp')],
];

const missing = files.filter(([from]) => !existsSync(from)).map(([from]) => from);
if (missing.length) {
  console.error('Render and export first; missing:\n' + missing.join('\n'));
  process.exit(1);
}
for (const [from, to] of files) {
  copyFileSync(from, to);
  console.log(to.replace(site + '/', '').padEnd(34) + (statSync(to).size / 1024).toFixed(0).padStart(6) + ' Ko');
}
