/**
 * A test copy of the site, with published News.
 *
 * The real site has no published article yet, and must not get one for the
 * sake of a test. This builds `.news-fixture/site/` from the real `dist/` and
 * a set of test articles: the four P1 articles as if published, a batch of
 * short ones to fill three pages, an English translation, a renamed article
 * and a draft that must never surface anywhere. Nothing here is deployed.
 */
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { articles } from './news-seed-articles.mjs';
import { newsRedirects } from '../src/news/store.server.ts';
import { assignHeadingIds } from '../src/news/model.ts';

const root = '.news-fixture';
const site = join(root, 'site');
if (!existsSync('dist/index.html') || !existsSync('.ssr/entry-server.js'))
  throw new Error('Lancez « bun run build » avant de construire le site de test.');

rmSync(root, { recursive: true, force: true });
mkdirSync(join(root, 'news'), { recursive: true });
mkdirSync(join(root, 'drafts'), { recursive: true });
cpSync('dist', site, { recursive: true });

// The covers of the four P1 articles, as the seed script wrote them.
const mediaFiles = readdirSync('public/news/media');
const covers = articles.map((spec) => {
  const file = mediaFiles.find((f) => f.startsWith(`${spec.slug}-couverture`));
  if (!file)
    throw new Error(`Couverture absente pour ${spec.slug} : lancez node scripts/news-seed.mjs.`);
  return { src: `/news/media/${file}`, width: 1600, height: 900, alt: spec.coverAlt };
});

const day = (n) => new Date(Date.UTC(2026, 8, 1 + n, 8)).toISOString();
const base = (id, overrides) => ({
  id,
  locale: 'fr',
  slugHistory: [],
  type: 'guide',
  audience: 'both',
  theme: 'create',
  author: { kind: 'organization', name: 'Équipe éditoriale AVYOR' },
  featured: false,
  sources: [],
  cta: { label: 'Découvrir le parcours Creator', slug: 'creators' },
  related: [],
  translations: {},
  revision: 2,
  createdAt: day(0),
  status: 'published',
  ...overrides,
});

const t = (text, ...marks) => ({ type: 'text', text, ...(marks.length ? { marks } : {}) });
const p = (...content) => ({
  type: 'paragraph',
  content: content.map((c) => (typeof c === 'string' ? t(c) : c)),
});
const h = (level, ...content) => ({
  type: 'heading',
  attrs: { level },
  content: content.map((c) => (typeof c === 'string' ? t(c) : c)),
});

const published = [];

// Les quatre articles P1, tels qu'ils seraient une fois publiés.
articles.forEach((spec, i) => {
  published.push(
    base(spec.id, {
      ...spec.article,
      slug: spec.slug,
      body: assignHeadingIds(spec.article.body, { keep: false }),
      cover: covers[i],
      seo: { ...spec.article.seo, noindex: false },
      publishedAt: day(10 + i),
      updatedAt: day(10 + i),
    }),
  );
});

// Un article qui éprouve le sommaire : accents, titres identiques, titre en
// plusieurs segments mis en forme, H3 imbriqués, tableau large, lien interne.
published.push(
  base('ancres000001', {
    title: 'Été, œuvre et « titres » : un article pour éprouver le sommaire',
    slug: 'article-test-sommaire',
    excerpt: 'Article de test : il réunit tout ce qui peut casser un sommaire ou une ancre.',
    audience: 'creators',
    theme: 'measure',
    cover: covers[2],
    seo: {
      title: 'Article de test du sommaire | AVYOR',
      description: 'Un article de test pour le sommaire et les ancres.',
      noindex: false,
    },
    body: {
      type: 'doc',
      content: [
        p(
          'Introduction de test, avec un ',
          t('lien interne', { type: 'link', attrs: { href: '/creators/' } }),
          '.',
        ),
        h(2, 'Été : première partie'),
        p('Texte. '.repeat(120)),
        h(3, 'Détail'),
        p('Texte. '.repeat(80)),
        h(2, 'Exemple'),
        p('Texte. '.repeat(120)),
        h(3, 'Détail'),
        p('Texte. '.repeat(80)),
        h(2, 'Exemple'),
        p('Texte. '.repeat(120)),
        h(2, 'Le ', t('brief', { type: 'bold' }), ' en ', t('trois', { type: 'italic' }), ' temps'),
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: ['Colonne un', 'Colonne deux', 'Colonne trois', 'Colonne quatre'].map(
                (c) => ({ type: 'tableHeader', content: [p(c)] }),
              ),
            },
            {
              type: 'tableRow',
              content: ['une cellule assez longue pour déborder', 'deux', 'trois', 'quatre'].map(
                (c) => ({ type: 'tableCell', content: [p(c)] }),
              ),
            },
          ],
        },
        p('Texte. '.repeat(160)),
        h(2, 'Fin'),
        p('Dernière section, courte.'),
      ],
    },
    publishedAt: day(9),
    updatedAt: day(15),
  }),
);

// Assez d'articles pour trois pages de liste.
for (let n = 1; n <= 16; n++)
  published.push(
    base(`remplissage${String(n).padStart(2, '0')}`, {
      title: `Article de test numéro ${n}`,
      slug: `article-de-test-${n}`,
      excerpt: `Article de test ${n}, pour la pagination et la recherche.${n === 7 ? ' Il contient le mot zygomatique.' : ''}`,
      audience: n % 2 ? 'brands' : 'creators',
      theme: ['prepare', 'create', 'choose', 'measure'][n % 4],
      cover: covers[n % 4],
      seo: {
        title: `Article de test ${n} | AVYOR`,
        description: `Description de l’article de test ${n}.`,
        noindex: false,
      },
      body: {
        type: 'doc',
        content: [
          h(2, 'Première partie'),
          p(`Corps de test ${n}.`),
          h(2, 'Seconde partie'),
          p('Corps de test.'),
        ],
      },
      publishedAt: day(n % 9),
      updatedAt: day(n % 9),
    }),
  );

// Un article renommé : son ancienne adresse doit rediriger vers la nouvelle.
published.push(
  base('renomme0001', {
    title: 'Article dont l’adresse a changé',
    slug: 'nouvelle-adresse',
    slugHistory: ['ancienne-adresse'],
    excerpt: 'Article de test pour la redirection d’une adresse modifiée.',
    cover: covers[0],
    seo: { title: 'Article renommé | AVYOR', description: 'Test de redirection.', noindex: false },
    body: { type: 'doc', content: [h(2, 'Un'), p('Un.'), h(2, 'Deux'), p('Deux.')] },
    publishedAt: day(3),
    updatedAt: day(3),
  }),
);

// Une vraie traduction, réciproque, du premier article.
published[0].translations = { en: 'briefugcen01' };
published.push(
  base('briefugcen01', {
    locale: 'en',
    title: 'UGC brief: what to specify to avoid back-and-forth',
    slug: 'ugc-brief-what-to-specify',
    excerpt: 'Test translation of the brief article.',
    audience: 'brands',
    theme: 'prepare',
    cover: covers[0],
    cta: { label: 'Discover the brand journey', slug: 'brands' },
    translations: { fr: 'briefugc0001' },
    seo: {
      title: 'UGC brief: what to specify | AVYOR',
      description: 'Test translation.',
      noindex: false,
    },
    body: { type: 'doc', content: [h(2, 'One'), p('One.'), h(2, 'Two'), p('Two.')] },
    publishedAt: day(12),
    updatedAt: day(12),
  }),
);

for (const article of published)
  writeFileSync(join(root, 'news', `${article.id}.json`), JSON.stringify(article, null, 2));

// Un brouillon piège : son marqueur ne doit apparaître dans aucun fichier servi.
writeFileSync(
  join(root, 'drafts', 'brouillon001.json'),
  JSON.stringify(
    base('brouillon001', {
      status: 'draft',
      title: 'BROUILLON-SECRET-7F3A',
      slug: 'brouillon-secret',
      excerpt: 'BROUILLON-SECRET-7F3A',
      cover: covers[0],
      seo: { title: 'BROUILLON-SECRET-7F3A', description: 'BROUILLON-SECRET-7F3A', noindex: false },
      body: { type: 'doc', content: [p('BROUILLON-SECRET-7F3A')] },
      publishedAt: null,
      updatedAt: day(20),
    }),
  ),
);

// Les redirections, comme l'admin les écrirait dans vercel.json.
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
config.redirects = [...(config.redirects ?? []), ...newsRedirects(published)];
writeFileSync(join(root, 'vercel.json'), JSON.stringify(config, null, 2));

execFileSync('node', ['scripts/prerender.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DIST_DIR: site,
    NEWS_DIR: join(root, 'news'),
    // Le site de test est indexable : c'est ce qui permet d'en vérifier le sitemap.
    FIXTURE_INDEXABLE: 'true',
  },
});
console.log(`Site de test : ${site} (${published.length} articles publiés, 1 brouillon piège).`);
