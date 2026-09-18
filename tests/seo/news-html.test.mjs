import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';

/*
 * Ces tests lisent le site de test construit par scripts/news-fixture-site.mjs :
 * le vrai build, avec des articles de test publiés. Ils vérifient ce qu'un
 * robot ou un navigateur reçoit réellement, pas le code source.
 */
const site = '.news-fixture/site';
const news = '.news-fixture/news';
const DRAFT = 'BROUILLON-SECRET-7F3A';

if (!existsSync(site))
  throw new Error('Site de test absent : lancez node scripts/news-fixture-site.mjs');

const articles = readdirSync(news).map((f) => JSON.parse(readFileSync(join(news, f), 'utf8')));
const fr = articles.filter((a) => a.locale === 'fr');
const pathOf = (a) => `${a.locale === 'fr' ? '' : `/${a.locale}`}/news/${a.slug}/`;
const read = (path) =>
  readFileSync(
    join(
      site,
      path,
      path.endsWith('.xml') || path.endsWith('.json') || path.endsWith('.txt') ? '' : 'index.html',
    ),
    'utf8',
  );
const html = (path) => load(read(path));
const graphOf = ($) => JSON.parse($('script[type="application/ld+json"]').text())['@graph'];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) yield* walk(file);
    else yield file;
  }
}

test('un brouillon n’apparaît dans aucun fichier servi : page, liste, recherche, flux, sitemap', () => {
  for (const file of walk(site)) {
    if (!/\.(html|json|xml|txt)$/.test(file)) continue;
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      new RegExp(DRAFT),
      `${file} contient le brouillon`,
    );
  }
  assert.equal(existsSync(join(site, 'news', 'brouillon-secret')), false);
});

test('chaque article publié a sa page, dans sa langue', () => {
  for (const article of articles) {
    assert.ok(existsSync(join(site, pathOf(article), 'index.html')), pathOf(article));
    const $ = html(pathOf(article));
    assert.equal($('html').attr('lang'), article.locale);
    assert.equal($('h1').length, 1, `${pathOf(article)} : un seul h1`);
    assert.equal($('h1').text(), article.title);
  }
});

test('les métadonnées d’un article décrivent ce qui est affiché', () => {
  for (const article of fr) {
    const $ = html(pathOf(article));
    const url = $('link[rel="canonical"]').attr('href');
    assert.equal(new URL(url).pathname, pathOf(article));
    assert.equal($('title').text(), article.seo.title);
    assert.equal($('meta[name="description"]').attr('content'), article.seo.description);
    assert.equal($('meta[property="og:type"]').attr('content'), 'article');
    assert.equal($('meta[property="og:url"]').attr('content'), url);
    assert.equal($('meta[property="article:published_time"]').attr('content'), article.publishedAt);
    assert.match($('meta[name="robots"]').attr('content'), /^index/);
    // L'image de partage est une vraie URL absolue, servie par le site.
    const image = $('meta[property="og:image"]').attr('content');
    assert.match(image, /^https:\/\//);
    assert.ok(existsSync(join(site, new URL(image).pathname)), image);
    assert.ok($('meta[property="og:image:alt"]').attr('content'));
    // Le flux est déclaré.
    assert.equal($('link[type="application/rss+xml"]').length, 1);
    // Une seule balise de chaque : pas de doublon entre gabarit et article.
    for (const selector of [
      'title',
      'link[rel="canonical"]',
      'meta[name="description"]',
      'meta[property="og:title"]',
    ])
      assert.equal($(selector).length, 1, `${pathOf(article)} : ${selector} dupliqué`);
  }
});

test('les données structurées reprennent le titre, l’auteur, l’image et les dates visibles', () => {
  for (const article of fr) {
    const $ = html(pathOf(article));
    const graph = graphOf($);
    const post = graph.find((n) => n['@type'] === 'BlogPosting');
    assert.ok(post, `${pathOf(article)} : BlogPosting absent`);
    assert.equal(post.headline, $('h1').text());
    assert.equal(post.datePublished, $('.news-byline time').first().attr('datetime'));
    assert.equal(post.dateModified, article.updatedAt);
    assert.ok($('.news-byline').text().includes(post.author.name), 'auteur non affiché');
    // Une équipe éditoriale est une organisation, jamais une personne inventée.
    assert.equal(
      post.author['@type'],
      article.author.kind === 'person' ? 'Person' : 'Organization',
    );
    assert.ok(post.image[0].startsWith('https://'));
    const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList').itemListElement;
    assert.deepEqual(
      crumbs.map((c) => c.name),
      [$('.breadcrumb a').eq(0).text(), $('.breadcrumb a').eq(1).text(), article.title],
    );
    // Pas de FAQ ni de note inventée sur un article.
    assert.ok(!graph.some((n) => ['FAQPage', 'AggregateRating', 'Review'].includes(n['@type'])));
  }
});

test('une traduction réelle est déclarée dans les deux sens ; sinon aucune', () => {
  const $fr = html('/news/brief-ugc-quoi-preciser/');
  const $en = html('/en/news/ugc-brief-what-to-specify/');
  const langs = ($) =>
    Object.fromEntries(
      $('link[rel="alternate"][hreflang]')
        .map((_, n) => [[$(n).attr('hreflang'), new URL($(n).attr('href')).pathname]])
        .get(),
    );
  const expected = {
    fr: '/news/brief-ugc-quoi-preciser/',
    en: '/en/news/ugc-brief-what-to-specify/',
    'x-default': '/news/brief-ugc-quoi-preciser/',
  };
  assert.deepEqual(langs($fr), expected);
  assert.deepEqual(langs($en), expected);
  // Un article sans traduction ne prétend pas en avoir.
  assert.equal(
    html('/news/portfolio-ugc-quoi-montrer-quand-on-debute/')('link[hreflang]').length,
    0,
  );
});

test('le sommaire mène à de vraies sections, avec des ancres uniques et lisibles', () => {
  for (const article of fr) {
    const $ = html(pathOf(article));
    const ids = $('[id]')
      .map((_, n) => $(n).attr('id'))
      .get();
    assert.deepEqual(
      ids.filter((id, i) => ids.indexOf(id) !== i),
      [],
      `${pathOf(article)} : id dupliqué`,
    );
    for (const link of $('.article-toc-desktop a').toArray()) {
      const id = $(link).attr('href').slice(1);
      assert.match(id, /^[a-z][a-z0-9-]*$/);
      assert.equal($(`#${id}`).length, 1, `${pathOf(article)} : #${id} ne mène à rien`);
    }
  }
  const $ = html('/news/article-test-sommaire/');
  const anchors = $('.article-toc-desktop a')
    .map((_, n) => $(n).attr('href'))
    .get();
  // Accents, titres identiques et titre composé de plusieurs segments formatés.
  assert.ok(anchors.includes('#ete-premiere-partie'));
  assert.ok(anchors.includes('#exemple') && anchors.includes('#exemple-2'));
  assert.ok(anchors.includes('#detail') && anchors.includes('#detail-2'));
  assert.ok(anchors.includes('#le-brief-en-trois-temps'));
  // Le sommaire mobile et le sommaire desktop sont la même liste.
  assert.deepEqual(
    $('.article-toc-mobile a')
      .map((_, n) => $(n).attr('href'))
      .get(),
    anchors,
  );
});

test('la mise en forme est rendue en HTML sémantique, sans code exécutable', () => {
  const $ = html('/news/brief-ugc-quoi-preciser/');
  const body = $('.article-body');
  assert.ok(body.find('strong').length > 3);
  assert.ok(body.find('em').length > 0);
  assert.ok(body.find('ul > li').length > 3);
  assert.equal(body.find('table th[scope="col"]').length, 4);
  assert.ok(body.find('.article-table[role="region"][tabindex="0"]').length === 1);
  assert.ok(body.find('aside.callout-checklist').length === 1);
  for (const article of articles) {
    const raw = read(pathOf(article));
    assert.doesNotMatch(raw, /\son[a-z]+=["']/i, `${pathOf(article)} : attribut événementiel`);
    assert.doesNotMatch(raw, /javascript:/i);
    const $a = load(raw);
    // Seuls les scripts attendus : module, données, JSON-LD.
    $a('script').each((_, n) => {
      const type = $a(n).attr('type');
      assert.ok(
        ['module', 'application/json', 'application/ld+json'].includes(type),
        `${pathOf(article)} : script inattendu (${type})`,
      );
    });
  }
});

test('les données embarquées pour l’hydratation ne portent aucun champ interne', () => {
  for (const article of fr) {
    const payload = JSON.parse(html(pathOf(article))('#avyor-news').text());
    assert.equal(payload.article.article.id, article.id);
    const raw = JSON.stringify(payload);
    for (const field of ['revision', 'basedOnRevision', 'slugHistory', 'createdAt', '"status"'])
      assert.ok(!raw.includes(field), `${pathOf(article)} : ${field} exposé`);
  }
});

test('la liste est paginée en vraies pages, chacune avec sa canonical', () => {
  const pages = ['/news/', '/news/page/2/', '/news/page/3/'];
  const seen = new Set();
  pages.forEach((path, i) => {
    const $ = html(path);
    assert.equal(new URL($('link[rel="canonical"]').attr('href')).pathname, path);
    assert.equal($('h1').length, 1);
    assert.match($('meta[name="robots"]').attr('content'), /^index/);
    if (i > 0) assert.equal(new URL($('link[rel="prev"]').attr('href')).pathname, pages[i - 1]);
    if (i < pages.length - 1)
      assert.equal(new URL($('link[rel="next"]').attr('href')).pathname, pages[i + 1]);
    $('.news-card-link').each((_, n) => seen.add($(n).attr('href')));
    // Aucun lien imbriqué dans une carte.
    assert.equal($('.news-card a a').length, 0);
  });
  // Toutes les publications françaises sont atteignables par la liste.
  assert.equal(seen.size, fr.length);
  assert.equal(existsSync(join(site, 'news/page/4/index.html')), false);
  // L'article à la une ouvre la première page, sans être répété dans la grille.
  const $1 = html('/news/');
  assert.equal($1('.news-card-featured').length, 1);
  const featured = $1('.news-card-featured .news-card-link').attr('href');
  assert.equal($1(`.news-grid .news-card-link[href="${featured}"]`).length, 0);
  assert.equal(html('/news/page/2/')('.news-card-featured').length, 0);
});

test('les filtres ne proposent que ce qui est alimenté', () => {
  const $ = html('/news/');
  const themes = $('select[name="theme"] option')
    .map((_, n) => $(n).attr('value'))
    .get()
    .filter(Boolean);
  assert.deepEqual(themes.sort(), [...new Set(fr.map((a) => a.theme))].sort());
});

test('le sitemap liste les articles publiés avec leur date de modification', () => {
  const xml = load(read('/sitemap.xml'), { xml: true });
  const entries = Object.fromEntries(
    xml('url')
      .map((_, n) => [[new URL(xml(n).find('loc').text()).pathname, xml(n).find('lastmod').text()]])
      .get(),
  );
  for (const article of articles)
    assert.equal(entries[pathOf(article)], article.updatedAt, pathOf(article));
  for (const path of ['/news/', '/news/page/2/', '/news/page/3/', '/en/news/'])
    assert.ok(path in entries, path);
  // Ni recherche, ni filtre, ni brouillon, ni ancienne adresse.
  for (const path of Object.keys(entries)) {
    assert.doesNotMatch(path, /[?#]|brouillon|ancienne-adresse/);
  }
});

test('le flux RSS contient les publications de sa langue, et elles seules', () => {
  const feed = load(read('/news/feed.xml'), { xml: true });
  assert.equal(feed('item').length, fr.length);
  assert.equal(feed('channel > language').text(), 'fr');
  const guids = feed('guid')
    .map((_, n) => feed(n).text())
    .get();
  assert.deepEqual(guids.sort(), fr.map((a) => a.id).sort());
  assert.equal(load(read('/en/news/feed.xml'), { xml: true })('item').length, 1);
});

test('la recherche porte sur tout le corpus publié de la langue', () => {
  const index = JSON.parse(read('/news/search.json'));
  assert.equal(index.length, fr.length);
  assert.ok(index.some((entry) => /zygomatique/.test(entry.excerpt)));
  assert.ok(index.every((entry) => typeof entry.text === 'string' && !('body' in entry)));
});

test('une langue sans article n’a pas de section News, nulle part', () => {
  for (const locale of ['es', 'he', 'ar']) {
    assert.equal(existsSync(join(site, locale, 'news')), false, locale);
    const $ = html(`/${locale}/`);
    assert.equal($('a[href$="/news/"]').length, 0, `${locale} : lien News sans article`);
    assert.equal($('.latest-news').length, 0);
  }
  assert.ok(html('/')('header a[href="/news/"]').length >= 1);
  assert.ok(html('/en/')('header a[href="/en/news/"]').length >= 1);
});

test('l’accueil présente les trois dernières publications de sa langue', () => {
  const $ = html('/');
  const cards = $('.latest-news .news-card-link')
    .map((_, n) => $(n).attr('href'))
    .get();
  const newest = [...fr]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3)
    .map(pathOf);
  assert.deepEqual(cards, newest);
});

test('le résumé pour lecteurs automatiques liste les articles', () => {
  const llms = read('/llms.txt');
  for (const article of fr) assert.ok(llms.includes(pathOf(article)), pathOf(article));
});

test('l’ancienne adresse d’un article renommé est redirigée, sans chaîne', () => {
  const redirects = JSON.parse(readFileSync('.news-fixture/vercel.json', 'utf8')).redirects;
  const rule = redirects.find((r) => r.source === '/news/ancienne-adresse/');
  assert.deepEqual(rule, {
    source: '/news/ancienne-adresse/',
    destination: '/news/nouvelle-adresse/',
    permanent: true,
  });
  assert.ok(!redirects.some((r) => r.source === rule.destination), 'redirection en chaîne');
  assert.equal(existsSync(join(site, 'news/ancienne-adresse')), false);
});

test('le paquet de données du développement est celui que le build écrit', async () => {
  // Le serveur de développement ne lance pas le pré-rendu : il fabrique ce
  // paquet lui-même. S'ils divergent, News existe au build et pas en
  // développement — c'est ce qui a rendu la section invisible pendant
  // l'écriture du site. On compare donc page par page, sur le vrai build.
  const { newsPayloadFor, publicCorpus } = await import('../../src/news/build.ts');
  const corpus = publicCorpus(articles);
  const routes = ['/', '/news/', ...fr.map(pathOf), '/en/'];
  for (const route of routes) {
    const embedded = JSON.parse(html(route)('#avyor-news').text());
    const { locale, slug } = route === '/en/' ? { locale: 'en', slug: '' } : { locale: 'fr', slug: route.replace(/^\/|\/$/g, '') };
    assert.deepEqual(newsPayloadFor(corpus, locale, slug), embedded, route);
  }
});
