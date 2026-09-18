/**
 * Writes the four first News articles as drafts, with their covers.
 *
 *   node scripts/news-seed.mjs          creates the drafts that do not exist
 *   node scripts/news-seed.mjs --force  rewrites them (their edits are lost)
 *
 * Drafts only: nothing here is published. Each article is reviewed, then
 * published from the admin. The covers are compositions of the brand's own 3D
 * icons on its colours — no generated text, no stock photo, nothing that could
 * pass for a real client.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import sharp from 'sharp';
import { createDraft, saveDraft, readArticle, defaultPaths } from '../src/news/store.server.ts';
import { assignHeadingIds } from '../src/news/model.ts';
import { articles } from './news-seed-articles.mjs';

const force = process.argv.includes('--force');
const paths = defaultPaths;

/* ------------------------------------------------------------- couvertures */

const svgData = (file) => `data:image/svg+xml;base64,${readFileSync(file).toString('base64')}`;

/**
 * One cover: the icon of the article's theme, large, lit from the top left
 * like the rest of the family, on the navy and violet of the site.
 */
function composition(icon, width, height) {
  const size = Math.round(height * 0.78);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="glow" cx="68%" cy="42%" r="62%">
      <stop offset="0" stop-color="#3a2a9e" stop-opacity="0.95"/>
      <stop offset="0.45" stop-color="#1a1f4a" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#0b1020"/>
    </radialGradient>
    <radialGradient id="second" cx="18%" cy="88%" r="45%">
      <stop offset="0" stop-color="#5a7cf5" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#5a7cf5" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="#0b1020"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" fill="url(#second)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <image href="${svgData(icon)}" x="${Math.round(width * 0.62 - size / 2)}" y="${Math.round((height - size) / 2)}" width="${size}" height="${size}"/>
</svg>`;
}

async function cover(slug, icon) {
  mkdirSync(paths.media, { recursive: true });
  const art = await sharp(Buffer.from(composition(icon, 1600, 900)))
    .webp({ quality: 84 })
    .toBuffer();
  const share = await sharp(Buffer.from(composition(icon, 1200, 630)))
    .jpeg({ quality: 86 })
    .toBuffer();
  const write = (buffer, name, ext) => {
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 8);
    const file = `${name}-${hash}.${ext}`;
    // Content-addressed: an identical render keeps its file and its address.
    if (!readdirSync(paths.media).includes(file)) writeFileSync(join(paths.media, file), buffer);
    return `/news/media/${file}`;
  };
  return {
    cover: { src: write(art, `${slug}-couverture`, 'webp'), width: 1600, height: 900 },
    share: { src: write(share, `${slug}-partage`, 'jpg'), width: 1200, height: 630 },
  };
}

/* ------------------------------------------------------------------ écriture */

let written = 0;
for (const spec of articles) {
  const existing = readArticle(paths, spec.id);
  if ((existing.draft || existing.published) && !force) {
    console.log(`· ${spec.id} existe déjà, conservé (--force pour le réécrire).`);
    continue;
  }
  if (existing.published) {
    console.log(`· ${spec.id} est publié : jamais réécrit par ce script.`);
    continue;
  }
  const icon = `src/assets/icons/${spec.icon}.svg`;
  if (!existsSync(icon)) throw new Error(`Icône absente : ${icon}. Lancez bun run icons:build.`);
  const media = await cover(spec.slug, icon);
  const draft = existing.draft ?? (await createDraft(paths, { id: spec.id, locale: 'fr' }));
  const now = new Date().toISOString();
  await saveDraft(
    paths,
    {
      ...draft,
      ...spec.article,
      id: spec.id,
      locale: 'fr',
      slug: spec.slug,
      body: assignHeadingIds(spec.article.body, { keep: false }),
      cover: { ...media.cover, alt: spec.coverAlt },
      seo: { ...spec.article.seo, image: { ...media.share, alt: spec.coverAlt }, noindex: false },
      updatedAt: now,
    },
    draft.revision,
  );
  written++;
  console.log(`✓ ${spec.id} — ${spec.article.title}`);
}
console.log(`${written} brouillon(s) écrit(s) dans ${paths.drafts}/. Rien n’est publié.`);
