/**
 * Builds the static site from a sandboxed News tree (NEWS_ROOT), the way the
 * deployment would build it from content/news/ — for the end-to-end test of
 * the admin, which publishes into a throwaway directory.
 *
 *   node scripts/news-build-sandbox.mjs .news-e2e
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) throw new Error('Usage : node scripts/news-build-sandbox.mjs <dossier>');
const site = join(root, 'site');
rmSync(site, { recursive: true, force: true });
cpSync('dist', site, { recursive: true });
const media = join(root, 'media');
if (existsSync(media)) {
  mkdirSync(join(site, 'news', 'media'), { recursive: true });
  for (const file of readdirSync(media))
    cpSync(join(media, file), join(site, 'news', 'media', file));
}
execFileSync('node', ['scripts/prerender.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, DIST_DIR: site, NEWS_DIR: join(root, 'news'), FIXTURE_INDEXABLE: 'true' },
});
