import test from 'node:test';
import assert from 'node:assert/strict';
import {
  publicCorpus,
  forLocale,
  indexPage,
  relatedFor,
  alternatesFor,
  searchIndex,
  rssFeed,
  toPublic,
  CorpusError,
} from '../../src/news/build.ts';

let n = 0;
/** A publishable article; every call gets its own id, slug and date. */
function article(overrides = {}) {
  n += 1;
  const id = `art${String(n).padStart(5, '0')}`;
  return {
    id,
    locale: 'fr',
    title: `Article ${n}`,
    slug: `article-${n}`,
    slugHistory: [],
    excerpt: 'Un extrait qui dit ce que le lecteur va apprendre, sans détour.',
    type: 'guide',
    audience: 'brands',
    theme: 'prepare',
    author: { kind: 'organization', name: 'Équipe éditoriale AVYOR' },
    featured: false,
    cover: {
      src: '/news/media/cover-0123abcd.webp',
      width: 1600,
      height: 900,
      alt: 'Illustration',
    },
    body: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Partie' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Texte publié.' }] },
      ],
    },
    sources: [],
    cta: { label: 'Découvrir', slug: 'brands' },
    related: [],
    translations: {},
    seo: { title: `SEO ${n}`, description: 'Une description utile.', noindex: false },
    revision: 3,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: `2026-09-${String(10 + (n % 15)).padStart(2, '0')}T08:00:00.000Z`,
    publishedAt: `2026-09-${String(10 + (n % 15)).padStart(2, '0')}T08:00:00.000Z`,
    status: 'published',
    ...overrides,
  };
}

const NOW = new Date('2026-09-30T00:00:00Z');

test('le corpus public est trié du plus récent au plus ancien', () => {
  const a = article({ publishedAt: '2026-09-10T08:00:00.000Z' });
  const b = article({ publishedAt: '2026-09-20T08:00:00.000Z' });
  assert.deepEqual(
    publicCorpus([a, b], NOW).map((x) => x.id),
    [b.id, a.id],
  );
});

test('un article invalide arrête le build au lieu d’être publié cassé', () => {
  const broken = article({ excerpt: '' });
  assert.throws(() => publicCorpus([broken], NOW), CorpusError);
});

test('deux articles d’une même langue ne peuvent pas partager une adresse', () => {
  assert.throws(
    () => publicCorpus([article({ slug: 'meme' }), article({ slug: 'meme' })], NOW),
    /meme/,
  );
  // Ni une adresse encore redirigée vers un autre article.
  assert.throws(
    () =>
      publicCorpus(
        [article({ slug: 'nouveau', slugHistory: ['ancien'] }), article({ slug: 'ancien' })],
        NOW,
      ),
    /ancien/,
  );
});

test('les données publiques ne portent aucun champ interne', () => {
  const pub = toPublic(article({ basedOnRevision: 2 }));
  for (const internal of [
    'revision',
    'basedOnRevision',
    'status',
    'createdAt',
    'slugHistory',
    'related',
    'translations',
  ])
    assert.equal(pub[internal], undefined, internal);
  assert.equal(typeof pub.readingMinutes, 'number');
});

test('l’article mis en avant n’est pas répété dans la grille', () => {
  const list = [article({ featured: true }), article(), article()];
  const page = indexPage(list, 1);
  assert.equal(page.featured.id, list[0].id);
  assert.ok(!page.items.some((x) => x.id === list[0].id));
  assert.equal(page.total, 3);
});

test('seules les thématiques et publics alimentés deviennent des filtres', () => {
  const page = indexPage(
    [
      article({ theme: 'prepare', audience: 'brands' }),
      article({ theme: 'create', audience: 'both' }),
    ],
    1,
  );
  assert.deepEqual(page.themes, ['prepare', 'create']);
  // « les deux » alimente chacun des deux publics ; il n'est pas un filtre à part.
  assert.deepEqual(page.audiences, ['brands', 'creators']);
});

test('sans choix éditorial, aucun article n’est mis en avant par défaut', () => {
  const page = indexPage([article(), article()], 1);
  assert.equal(page.featured, null);
  assert.equal(page.items.length, 2);
});

test('la mise en avant n’appartient qu’à la première page', () => {
  const list = [article({ featured: true }), ...Array.from({ length: 12 }, () => article())];
  assert.equal(indexPage(list, 2).featured, null);
  assert.equal(indexPage(list, 1).pages, 2);
  // Toutes les autres publications restent atteignables par la pagination.
  const seen = [...indexPage(list, 1).items, ...indexPage(list, 2).items].map((x) => x.id);
  assert.equal(new Set(seen).size, 12);
});

test('les suggestions de lecture sont publiées, dans la langue, et pertinentes', () => {
  const current = article({ theme: 'prepare' });
  const chosen = article({ theme: 'measure' });
  current.related = [chosen.id, 'brouillon0'];
  const sameTheme = article({ theme: 'prepare' });
  const other = article({ theme: 'create', audience: 'creators' });
  const english = article({ theme: 'prepare', locale: 'en' });
  const list = forLocale([current, chosen, sameTheme, other, english], 'fr');
  const related = relatedFor(current, list).map((x) => x.id);
  // Le choix de l'éditeur d'abord, puis la même thématique ; jamais l'article
  // lui-même, un brouillon, une autre langue, ni un remplissage hors sujet.
  assert.deepEqual(related, [chosen.id, sameTheme.id]);
});

test('aucune suggestion plutôt qu’une suggestion hors sujet', () => {
  const current = article({ theme: 'prepare' });
  const other = article({ theme: 'measure', audience: 'creators' });
  assert.deepEqual(relatedFor(current, [current, other]), []);
});

test('une traduction n’est liée que si elle existe et répond en retour', () => {
  const fr = article({ locale: 'fr' });
  const en = article({ locale: 'en', translations: { fr: fr.id } });
  const es = article({ locale: 'es' });
  fr.translations = { en: en.id, es: es.id, ar: 'inexistant0' };
  const alternates = alternatesFor(fr, [fr, en, es]);
  assert.deepEqual(alternates, [{ locale: 'en', slug: en.slug }]);
});

test('l’index de recherche couvre le texte publié, sans le document brut', () => {
  const a = article();
  a.body.content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: 'Mot rare zygomatique.' }],
  });
  const [entry] = searchIndex([a]);
  assert.match(entry.text, /zygomatique/);
  assert.equal(entry.body, undefined);
});

test('le flux RSS est du XML valide, échappé, avec des identifiants stables', () => {
  const a = article({ title: 'Brief & <script>alert(1)</script> « UGC »' });
  const xml = rssFeed([a], {
    origin: 'https://avyor.app',
    locale: 'fr',
    title: 'News AVYOR',
    description: 'Conseils',
    link: 'https://avyor.app/news/',
    self: 'https://avyor.app/news/feed.xml',
  });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.doesNotMatch(xml, /<script>/);
  assert.match(xml, /Brief &amp; &lt;script&gt;/);
  assert.match(xml, new RegExp(`<guid isPermaLink="false">${a.id}</guid>`));
  assert.match(xml, /<link>https:\/\/avyor.app\/news\/article-\d+\/<\/link>/);
  assert.match(xml, /<atom:link href="https:\/\/avyor.app\/news\/feed.xml" rel="self"/);
  // Les dates RSS sont au format RFC 822.
  assert.match(xml, /<pubDate>\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} GMT<\/pubDate>/);
});
