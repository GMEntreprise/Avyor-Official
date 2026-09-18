import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
const routes = [
  '',
  'creators',
  'brands',
  'features',
  'how-it-works',
  'security',
  'faq',
  'download',
  'privacy',
  'terms',
  'contact',
  'legal',
];
const pathFor = (route) => `dist/${route ? route + '/' : ''}index.html`;
const pages = routes.filter((route) => existsSync(pathFor(route)));
test('le build contient toutes les pages attendues, jamais une suite vide', () =>
  assert.equal(pages.length, routes.length));
const titles = new Set(),
  descriptions = new Set();
for (const route of routes)
  test(`HTML livré : /${route}`, () => {
    assert.ok(existsSync(pathFor(route)), `Page absente : ${route}`);
    const $ = load(readFileSync(pathFor(route), 'utf8'));
    assert.equal($('html').attr('lang'), 'fr');
    const title = $('title').text();
    assert.ok(title.length > 15);
    assert.ok(!titles.has(title));
    titles.add(title);
    const desc = $('meta[name="description"]').attr('content');
    assert.ok(desc?.length > 65);
    assert.ok(!descriptions.has(desc));
    descriptions.add(desc);
    assert.equal($('h1').length, 1);
    assert.ok($('h1').text().length > 10);
    const canonical = $('link[rel="canonical"]').attr('href');
    assert.ok(canonical);
    assert.equal(new URL(canonical).pathname, `/${route ? route + '/' : ''}`);
    assert.equal($('link[hreflang]').length, 0, 'Site FR uniquement');
    assert.equal($('meta[property="og:image"]').length, 1);
    assert.equal($('meta[name="twitter:card"]').attr('content'), 'summary_large_image');
    const graph = JSON.parse($('script[type="application/ld+json"]').text());
    assert.ok(graph['@graph'].length >= 2);
    const all = JSON.stringify(graph);
    assert.doesNotMatch(all, /AggregateRating|reviewCount|priceSpecification/);
    $('script,style').remove();
    const visible = $('main').text().replace(/\s+/g, ' ');
    assert.ok(visible.length > 160, 'Contenu principal absent du HTML initial');
    assert.doesNotMatch(
      visible,
      /lorem ipsum|révolutionnaire|100%|10[,. ]?000 créateurs|recommandé par ChatGPT|résultats garantis/i,
    );
    assert.doesNotMatch(visible, /\b(?:home|hero|common|features)\.[a-z]+\.[a-z]+/);
    assert.doesNotMatch($('h1,h2,h3,title').text(), /\b(\p{L}{5,})\1\b/iu);
    $('a').each((_, node) => {
      const href = $(node).attr('href');
      assert.ok(href && href !== '#', 'Lien vide');
      if (href.startsWith('/') && !href.startsWith('//')) {
        const target = new URL(href, 'https://avyor.app');
        if (target.pathname.includes('.')) assert.ok(existsSync('dist' + target.pathname), href);
        else {
          assert.ok(existsSync('dist' + target.pathname + 'index.html'), href);
          if (target.hash) {
            const dest = load(readFileSync('dist' + target.pathname + 'index.html', 'utf8'));
            assert.ok(dest(`[id="${target.hash.slice(1)}"]`).length, href);
          }
        }
      }
    });
    $('img').each((_, n) => {
      assert.ok($(n).attr('alt') !== undefined);
      assert.ok(Number($(n).attr('width')) > 0);
      assert.ok(Number($(n).attr('height')) > 0);
      assert.ok(existsSync('dist' + $(n).attr('src')));
    });
    const faq = graph['@graph'].find((n) => n['@type'] === 'FAQPage');
    if (faq)
      for (const q of faq.mainEntity) {
        assert.ok(visible.includes(q.name));
        assert.ok(visible.includes(q.acceptedAnswer.text));
      }
  });
const read = (route) => readFileSync(pathFor(route), 'utf8');

test('aucune adresse de développement ne fuit dans le build de production', () => {
  const files = [
    ...routes.map(pathFor),
    'dist/404.html',
    'dist/sitemap.xml',
    'dist/robots.txt',
    'dist/llms.txt',
    'dist/build-meta.json',
  ];
  for (const file of files) {
    if (!existsSync(file)) continue;
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /localhost|127\.0\.0\.1|0\.0\.0\.0|:4173|:5173/,
      `Adresse locale dans ${file}`,
    );
  }
});

test('aucun lien de store inventé : seuls les domaines officiels sont possibles', () => {
  for (const route of routes) {
    const $ = load(read(route));
    $('a[href^="http"]').each((_, node) => {
      const host = new URL($(node).attr('href')).hostname;
      if (/apple|google|appstore|play\./i.test(host))
        assert.ok(
          host === 'apps.apple.com' || host === 'play.google.com',
          `Domaine de store non officiel : ${host}`,
        );
    });
  }
});

test('la page de téléchargement montre les deux plateformes avec les vrais visuels', () => {
  const $ = load(read('download'));
  const cards = $('main .store-card');
  assert.equal(cards.length, 2);
  const sources = cards
    .find('img')
    .map((_, n) => $(n).attr('src'))
    .get();
  assert.deepEqual(sources, ['/assets/badges/app-store.svg', '/assets/badges/google-play.png']);
  for (const src of sources) assert.ok(existsSync('dist' + src));
  // A platform that is not published yet must not be a link.
  assert.equal($('main .store-card.is-pending a').length, 0);
  assert.match($('main').text(), /Bientôt disponible/);
  // The old generic device icon must not come back anywhere on the site.
  for (const route of routes)
    assert.equal(load(read(route))('.store-card svg.lucide-smartphone').length, 0);
});

for (const route of ['privacy', 'terms', 'legal'])
  test(`document juridique navigable : /${route}`, () => {
    const $ = load(read(route));
    const links = $('.legal-toc-desktop a')
      .map((_, n) => $(n).attr('href'))
      .get();
    assert.ok(links.length >= 9, `sommaire trop court sur /${route}`);
    // Every entry must resolve to a real anchor served in the same document.
    for (const href of links) {
      assert.match(href, /^#[a-z][a-z0-9-]*$/);
      assert.equal($(`section[id="${href.slice(1)}"]`).length, 1, `ancre morte : ${href}`);
    }
    assert.equal(new Set(links).size, links.length);
    // Headings, not an undifferentiated wall of text.
    assert.equal($('.legal-document h2').length, links.length + 1);
    assert.match($('main').text(), /Dernière mise à jour/);
    // Missing legal data is declared, never filled in with something plausible.
    const pending = $('.legal-todo').length;
    if (pending) assert.match($('.legal-notice').text(), /en préparation/i);
    // The three documents point at each other.
    for (const target of ['/privacy/', '/terms/', '/legal/'])
      assert.ok($(`a[href="${target}"]`).length, `${route} ne renvoie pas vers ${target}`);
  });

test('l’intro est servie dans le HTML de l’accueil, pas montée par le JavaScript', () => {
  const home = read('');
  const $ = load(home);
  // Elle doit être là avant toute exécution de script : c'est ce qui la rend
  // indépendante de la vitesse d'hydratation, donc fiable à la première visite.
  assert.equal($('.intro').length, 1, 'l’accueil doit servir l’intro');
  assert.equal($('.intro').attr('aria-hidden'), 'true');
  assert.equal($('.intro a, .intro button').length, 0, 'rien de focalisable dans l’intro');
  // Le garde de session s'exécute avant peinture, donc dans <head>.
  const head = home.slice(0, home.indexOf('</head>'));
  assert.match(head, /sessionStorage/, 'le garde de session doit précéder la peinture');
  assert.match(head, /intro-seen/);
  // L'intro appartient à l'entrée du site, pas à chaque route.
  for (const route of routes.filter(Boolean))
    assert.equal(load(read(route))('.intro').length, 0, `/${route}/ ne doit pas rejouer l’intro`);
  assert.equal(load(readFileSync('dist/404.html', 'utf8'))('.intro').length, 0);
  // Aucun emplacement de gabarit oublié dans les pages livrées.
  for (const route of routes)
    assert.doesNotMatch(
      read(route),
      /<!--\s*(intro|app|head)\s*-->/,
      `gabarit non rempli : /${route}/`,
    );
});

test('l’animation d’apparition ne cache jamais le contenu servi', () => {
  for (const route of routes) {
    const html = read(route);
    const $ = load(html);
    // The hidden state is scoped to a class the client adds after taking over.
    assert.equal($('html.motion-ready').length, 0, `/${route}/ est servie déjà masquée`);
    // And the revealed blocks carry their text in the delivered HTML.
    $('.reveal').each((_, node) => {
      assert.ok($(node).text().trim().length > 0, `bloc révélé vide sur /${route}/`);
    });
  }
  const css = readFileSync(
    'dist/assets/' + readdirSync('dist/assets').find((f) => f.endsWith('.css')),
    'utf8',
  );
  // The rule must stay gated, and must be neutralised under reduced motion.
  assert.match(css, /\.motion-ready\s+\.reveal\s*\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(css, /(?<!motion-ready\s)\.reveal\s*\{[^}]*opacity:\s*0/);
  assert.match(css, /prefers-reduced-motion[^@]*\.motion-ready\s+\.reveal/s);
});

test('chaque page de contenu propose une suite contextuelle', () => {
  for (const route of [
    'creators',
    'brands',
    'features',
    'how-it-works',
    'security',
    'faq',
    'download',
    'contact',
  ]) {
    const $ = load(read(route));
    const block = $('.related-links');
    assert.equal(block.length, 1, `/${route}/ n’a pas de suite logique`);
    const targets = block
      .find('a')
      .map((_, n) => $(n).attr('href'))
      .get();
    assert.ok(targets.length >= 3, `/${route}/ : ${targets.length} liens`);
    assert.equal(new Set(targets).size, targets.length, `/${route}/ : liens dupliqués`);
    for (const href of targets) {
      assert.notEqual(href, `/${route}/`, `/${route}/ se lie à elle-même`);
      assert.ok(existsSync('dist' + href + 'index.html'), `lien mort : ${href}`);
    }
  }
});

test('les pages profondes portent un fil d’Ariane', () => {
  for (const route of routes.filter(Boolean)) {
    const $ = load(read(route));
    assert.equal($('nav[aria-label="Fil d’Ariane"]').length, 1, `/${route}/`);
    assert.equal($('nav[aria-label="Fil d’Ariane"] [aria-current="page"]').length, 1);
  }
});

test('la numérotation des sections reste lisible au-delà de neuf', () => {
  for (const route of routes) {
    const $ = load(read(route));
    $('.step-number, .faq-index, .step-label').each((_, node) => {
      const label = $(node).text().trim();
      assert.doesNotMatch(label, /^0\d\d/, `numéro mal formé : « ${label} » sur /${route}`);
    });
  }
});

test('sitemap et robots cohérents avec les routes', () => {
  const xml = load(readFileSync('dist/sitemap.xml', 'utf8'), { xml: true });
  const locs = xml('loc')
    .map((_, n) => xml(n).text())
    .get();
  const meta = JSON.parse(readFileSync('dist/build-meta.json', 'utf8'));
  assert.equal(locs.length, meta.indexable ? 9 : 0);
  if (!meta.indexable)
    for (const route of routes) {
      const page = load(readFileSync(pathFor(route), 'utf8'));
      assert.match(page('meta[name="robots"]').attr('content'), /noindex/);
    }
  assert.equal(new Set(locs).size, locs.length);
  for (const loc of locs) {
    const p = new URL(loc).pathname;
    assert.ok(existsSync('dist' + p + 'index.html'));
    const $ = load(readFileSync('dist' + p + 'index.html', 'utf8'));
    assert.equal($('link[rel="canonical"]').attr('href'), loc);
    assert.doesNotMatch($('meta[name="robots"]').attr('content') || '', /noindex/);
  }
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https:\/\//);
  assert.ok(existsSync('dist/404.html'));
  assert.match(readFileSync('dist/404.html', 'utf8'), /noindex/);
});

test('les icônes en volume sont des images décoratives, chargées à la demande', () => {
  const $ = load(read(''));
  const icons = $('.manifesto-pillars img, .trust-grid img');
  assert.equal(icons.length, 6, 'trois icônes au manifeste, trois à la section 06');
  icons.each((_, img) => {
    const src = $(img).attr('src');
    // Le texte porte le sens : alt vide, l'image n'est pas annoncée.
    assert.equal($(img).attr('alt'), '', `${src} doit rester décorative`);
    assert.equal($(img).attr('loading'), 'lazy', `${src} doit attendre l’approche de sa section`);
    // Empreintée par Vite : servie à part, jamais repliée dans le JavaScript.
    assert.match(
      src,
      /^\/assets\/[a-z]+-[A-Za-z0-9_-]{8}\.svg$/,
      `${src} n’est pas un fichier empreinté`,
    );
    const svg = readFileSync('dist' + src, 'utf8');
    // Un SVG autonome a besoin de son espace de noms pour s’afficher en image.
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.doesNotMatch(
      svg,
      /<(image|foreignObject|filter|feGaussianBlur|text)\b/,
      `${src} : dessin pur attendu`,
    );
    assert.doesNotMatch(svg, /href="https?:/, `${src} charge une ressource externe`);
    // Chaque référence de dégradé doit exister dans le même fichier.
    const ids = new Set([...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
    const refs = [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
    assert.ok(refs.length > 3, `${src} doit s’appuyer sur ses dégradés`);
    for (const ref of refs) assert.ok(ids.has(ref), `${src} : url(#${ref}) ne mène à rien`);
  });
});

test('aucune image n’est repliée dans le JavaScript ni dans le HTML', () => {
  // Sous 4 ko, Vite inline les fichiers par défaut : les illustrations
  // reviendraient dans ce que tout visiteur télécharge. Les SVG le sont en
  // URL encodée (data:image/svg+xml,…), les autres en base64 : les deux formes.
  for (const file of readdirSync('dist/assets').filter((f) => f.endsWith('.js')))
    assert.doesNotMatch(
      readFileSync('dist/assets/' + file, 'utf8'),
      /data:image\/(svg\+xml|png|webp|jpe?g)[;,]/,
      `${file} contient une image encodée`,
    );
  for (const route of routes)
    assert.doesNotMatch(read(route), /src="data:image\//, `/${route}/ embarque une image encodée`);
});

test('l’accueil n’a ni identifiant dupliqué ni référence url(#…) cassée', () => {
  const $ = load(read(''));
  const ids = $('[id]')
    .map((_, n) => $(n).attr('id'))
    .get();
  assert.deepEqual(
    ids.filter((id, i) => ids.indexOf(id) !== i),
    [],
    'identifiants dupliqués',
  );
  const known = new Set(ids);
  for (const [, ref] of read('').matchAll(/url\(#([^)]+)\)/g))
    assert.ok(known.has(ref), `url(#${ref}) ne mène à rien`);
});
