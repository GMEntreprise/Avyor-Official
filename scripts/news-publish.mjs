/**
 * Publishes reviewed drafts, from the terminal.
 *
 *   node scripts/news-publish.mjs                 lists what can be published
 *   node scripts/news-publish.mjs <id> [<id>…]    publishes those articles
 *   node scripts/news-publish.mjs --all           publishes every draft
 *
 * It calls the same `publish()` as the admin — same validation, same
 * redirects — so a draft that would be refused in the interface is refused
 * here too. Publishing writes a file; putting it online is the next deploy.
 */
import { readdirSync } from 'node:fs';
import { publish, readArticle, defaultPaths } from '../src/news/store.server.ts';

const paths = defaultPaths;
const drafts = readdirSync(paths.drafts)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.slice(0, -5));

const args = process.argv.slice(2);
const wanted = args.includes('--all') ? drafts : args.filter((a) => !a.startsWith('--'));

if (!wanted.length) {
  if (!drafts.length) console.log('Aucun brouillon.');
  for (const id of drafts) {
    const { draft } = readArticle(paths, id);
    console.log(`${id}  ${draft.locale}  ${draft.title}`);
  }
  console.log(`\n${drafts.length} brouillon(s). Passez un identifiant, ou --all.`);
  process.exit(0);
}

let failed = 0;
for (const id of wanted) {
  try {
    const article = await publish(paths, id);
    console.log(`publié   ${article.locale}  ${article.slug}  — ${article.title}`);
  } catch (error) {
    failed += 1;
    const details = error.errors?.map((e) => `${e.field} : ${e.message}`).join('\n           ');
    console.error(`refusé   ${id} — ${error.message}${details ? `\n           ${details}` : ''}`);
  }
}
process.exit(failed ? 1 : 0);
