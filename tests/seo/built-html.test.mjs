import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
import { LOCALES, DEFAULT_LOCALE, localeMeta, routeFor } from '../../src/i18n/locales.ts';

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
/** Les pages que les moteurs ont le droit d'indexer, dans chaque langue. */
const indexableRoutes = routes.filter((r) => !['privacy', 'terms', 'legal'].includes(r));

const content = {};
for (const locale of LOCALES)
  content[locale] = (await import(`../../src/content/locales/${locale}.ts`))[locale];

const pathFor = (locale, route) => `dist${routeFor(locale, route)}index.html`;
const read = (locale, route) => readFileSync(pathFor(locale, route), 'utf8');
const every = LOCALES.flatMap((locale) => routes.map((route) => [locale, route]));

test('le build contient toutes les pages attendues, dans toutes les langues', () => {
  assert.equal(every.filter(([l, r]) => existsSync(pathFor(l, r))).length, every.length);
  assert.ok(LOCALES.length >= 2, 'le site est multilingue');
});

for (const locale of LOCALES) {
  const titles = new Set(),
    descriptions = new Set();
  for (const route of routes)
    test(`HTML livré : ${routeFor(locale, route)}`, () => {
      assert.ok(existsSync(pathFor(locale, route)), `Page absente : ${route}`);
      const $ = load(read(locale, route));
      assert.equal($('html').attr('lang'), localeMeta[locale].tag);
      assert.equal($('html').attr('dir'), localeMeta[locale].dir);
      const title = $('title').text();
      assert.ok(title.length > 15);
      assert.ok(!titles.has(title), `titre dupliqué en ${locale} : ${title}`);
      titles.add(title);
      const desc = $('meta[name="description"]').attr('content');
      assert.ok(desc?.length > 65);
      assert.ok(!descriptions.has(desc), `description dupliquée en ${locale}`);
      descriptions.add(desc);
      assert.equal($('h1').length, 1);
      assert.ok($('h1').text().length > 10);
      const canonical = $('link[rel="canonical"]').attr('href');
      assert.ok(canonical);
      assert.equal(new URL(canonical).pathname, routeFor(locale, route));
      assert.equal(
        $('meta[property="og:locale"]').attr('content'),
        localeMeta[locale].ogLocale,
        'la langue doit être annoncée au partage',
      );
      assert.equal($('meta[property="og:image"]').length, 1);
      assert.equal($('meta[name="twitter:card"]').attr('content'), 'summary_large_image');
      const graph = JSON.parse($('script[type="application/ld+json"]').text());
      assert.ok(graph['@graph'].length >= 2);
      const page = graph['@graph'].find((n) => n['@type'] === 'WebPage');
      assert.equal(page.inLanguage, localeMeta[locale].tag);
      const all = JSON.stringify(graph);
      assert.doesNotMatch(all, /AggregateRating|reviewCount|priceSpecification/);
      $('script,style').remove();
      const visible = $('main').text().replace(/\s+/g, ' ');
      assert.ok(visible.length > 160, 'Contenu principal absent du HTML initial');
      assert.doesNotMatch(
        visible,
        /lorem ipsum|révolutionnaire|revolutionary|100%|10[,. ]?000 créateurs|recommandé par ChatGPT|résultats garantis/i,
      );
      // Une clé de traduction affichée telle quelle serait le signe d'un texte manquant.
      assert.doesNotMatch(visible, /\b(?:home|hero|common|features|ui)\.[a-z]+\.[a-z]+/);
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
}

/**
 * Le référencement international tient à une seule chose : chaque page doit
 * déclarer toutes ses traductions, et chacune de ces traductions doit renvoyer
 * la déclaration inverse. Une chaîne non réciproque est ignorée par Google.
 */
test('chaque page indexable déclare toutes ses langues, et réciproquement', () => {
  for (const route of indexableRoutes) {
    for (const locale of LOCALES) {
      const $ = load(read(locale, route));
      const links = $('link[rel="alternate"][hreflang]')
        .map((_, n) => [[$(n).attr('hreflang'), $(n).attr('href')]])
        .get();
      const byLang = Object.fromEntries(links);
      assert.equal(
        links.length,
        LOCALES.length + 1,
        `${routeFor(locale, route)} : ${links.length} alternates pour ${LOCALES.length} langues + x-default`,
      );
      for (const other of LOCALES) {
        const expected = new URL(routeFor(other, route), 'https://avyor.app').pathname;
        assert.ok(byLang[localeMeta[other].tag], `${routeFor(locale, route)} oublie ${other}`);
        assert.equal(new URL(byLang[localeMeta[other].tag]).pathname, expected);
      }
      // x-default renvoie vers la langue de référence, celle qui vit à la racine.
      assert.equal(
        new URL(byLang['x-default']).pathname,
        routeFor(DEFAULT_LOCALE, route),
        `${routeFor(locale, route)} : x-default mal orienté`,
      );
      // La page se déclare elle-même : c'est ce qui rend la chaîne réciproque.
      assert.equal(
        new URL(byLang[localeMeta[locale].tag]).pathname,
        new URL($('link[rel="canonical"]').attr('href')).pathname,
      );
    }
  }
});

test('une page non indexable ne réclame pas de traduction aux moteurs', () => {
  for (const route of ['privacy', 'terms', 'legal'])
    for (const locale of LOCALES) {
      const $ = load(read(locale, route));
      assert.equal($('link[hreflang]').length, 0, `${routeFor(locale, route)}`);
      assert.match($('meta[name="robots"]').attr('content'), /noindex/);
    }
});

test('chaque page peut être quittée pour une autre langue', () => {
  for (const [locale, route] of every) {
    const $ = load(read(locale, route));
    const options = $('.language-menu-option, .language-trigger');
    // Le menu est monté par le navigateur ; le déclencheur, lui, est servi.
    assert.ok($('.language-trigger').length >= 1, `${routeFor(locale, route)} : pas de sélecteur`);
    assert.ok(options.length >= 1);
  }
});

test('aucune adresse de développement ne fuit dans le build de production', () => {
  const files = [
    ...every.map(([l, r]) => pathFor(l, r)),
    'dist/404.html',
    'dist/sitemap.xml',
    'dist/robots.txt',
    ...LOCALES.map((l) => `dist${routeFor(l, '')}llms.txt`),
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
  for (const [locale, route] of every) {
    const $ = load(read(locale, route));
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

test('la page de téléchargement montre les deux plateformes, nommées et distinctes', () => {
  for (const locale of LOCALES) {
    const $ = load(read(locale, 'download'));
    const cards = $('main .store-card');
    assert.equal(cards.length, 2, locale);
    assert.equal($('main .store-card-ios').length, 1, locale);
    assert.equal($('main .store-card-android').length, 1, locale);
    // Chaque bouton porte sa marque dessinée et son nom de magasin.
    cards.each((_, node) => {
      assert.equal($(node).find('svg.store-mark').length, 1);
      assert.ok($(node).find('.store-label strong').text().length > 4);
    });
    assert.equal($('main .store-card-ios .store-label strong').text(), 'App Store');
    assert.equal($('main .store-card-android .store-label strong').text(), 'Google Play');
    // Une plateforme non publiée n'est pas un lien, et le dit.
    assert.equal($('main .store-card.is-pending a, main a .store-card.is-pending').length, 0);
    for (const node of $('main .store-card.is-pending').toArray()) {
      assert.equal(
        node.tagName,
        'div',
        `${locale} : un état « bientôt » ne doit pas être cliquable`,
      );
      assert.ok(
        $(node).text().includes(content[locale].ui.store.comingSoon),
        `${locale} : l’état « bientôt disponible » doit être traduit`,
      );
    }
  }
  // The old generic device icon must not come back anywhere on the site.
  for (const [locale, route] of every)
    assert.equal(load(read(locale, route))('.store-card svg.lucide-smartphone').length, 0);
});

for (const route of ['privacy', 'terms', 'legal'])
  test(`document juridique navigable : /${route}`, () => {
    for (const locale of LOCALES) {
      const $ = load(read(locale, route));
      const links = $('.legal-toc-desktop a')
        .map((_, n) => $(n).attr('href'))
        .get();
      assert.ok(links.length >= 9, `sommaire trop court sur ${routeFor(locale, route)}`);
      // Every entry must resolve to a real anchor served in the same document.
      for (const href of links) {
        assert.match(href, /^#[a-z][a-z0-9-]*$/);
        assert.equal($(`section[id="${href.slice(1)}"]`).length, 1, `ancre morte : ${href}`);
      }
      assert.equal(new Set(links).size, links.length);
      // Headings, not an undifferentiated wall of text.
      assert.equal($('.legal-document h2').length, links.length + 1);
      assert.ok($('main').text().includes(content[locale].ui.legal.updated));
      // Missing legal data is declared, never filled in with something plausible.
      const pending = $('.legal-todo').length;
      if (pending) assert.ok($('.legal-notice').text().length > 20);
      // The three documents point at each other, inside the same language.
      for (const target of ['privacy', 'terms', 'legal'])
        assert.ok(
          $(`a[href="${routeFor(locale, target)}"]`).length,
          `${routeFor(locale, route)} ne renvoie pas vers ${routeFor(locale, target)}`,
        );
      // Une traduction est une aide à la lecture : elle le dit.
      if (locale !== DEFAULT_LOCALE)
        assert.equal(
          $('.legal-translation').length,
          1,
          `${locale} : mention de traduction absente`,
        );
      else assert.equal($('.legal-translation').length, 0);
    }
  });

test('l’intro est servie dans le HTML de l’accueil, pas montée par le JavaScript', () => {
  for (const locale of LOCALES) {
    const home = read(locale, '');
    const $ = load(home);
    // Elle doit être là avant toute exécution de script : c'est ce qui la rend
    // indépendante de la vitesse d'hydratation, donc fiable à la première visite.
    assert.equal($('.intro').length, 1, `${locale} : l’accueil doit servir l’intro`);
    assert.equal($('.intro').attr('aria-hidden'), 'true');
    assert.equal($('.intro a, .intro button').length, 0, 'rien de focalisable dans l’intro');
    // Le garde de session s'exécute avant peinture, donc dans <head>.
    const head = home.slice(0, home.indexOf('</head>'));
    assert.match(head, /sessionStorage/, 'le garde de session doit précéder la peinture');
    assert.match(head, /intro-seen/);
    // L'intro appartient à l'entrée du site, pas à chaque route.
    for (const route of routes.filter(Boolean))
      assert.equal(load(read(locale, route))('.intro').length, 0, `${route} ne rejoue pas l’intro`);
  }
  assert.equal(load(readFileSync('dist/404.html', 'utf8'))('.intro').length, 0);
  // Aucun emplacement de gabarit oublié dans les pages livrées.
  for (const [locale, route] of every)
    assert.doesNotMatch(
      read(locale, route),
      /<!--\s*(intro|app|head)\s*-->/,
      `gabarit non rempli : ${routeFor(locale, route)}`,
    );
});

test('l’animation d’apparition ne cache jamais le contenu servi', () => {
  for (const [locale, route] of every) {
    const $ = load(read(locale, route));
    // The hidden state is scoped to a class the client adds after taking over.
    assert.equal($('html.motion-ready').length, 0, `${routeFor(locale, route)} servie masquée`);
    // And the revealed blocks carry their text in the delivered HTML.
    $('.reveal').each((_, node) => {
      assert.ok(
        $(node).text().trim().length > 0,
        `bloc révélé vide sur ${routeFor(locale, route)}`,
      );
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

test('chaque page de contenu propose une suite contextuelle, dans sa langue', () => {
  for (const locale of LOCALES)
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
      const $ = load(read(locale, route));
      const block = $('.related-links');
      assert.equal(block.length, 1, `${routeFor(locale, route)} n’a pas de suite logique`);
      const targets = block
        .find('a')
        .map((_, n) => $(n).attr('href'))
        .get();
      assert.ok(targets.length >= 3, `${routeFor(locale, route)} : ${targets.length} liens`);
      assert.equal(new Set(targets).size, targets.length, 'liens dupliqués');
      for (const href of targets) {
        assert.notEqual(href, routeFor(locale, route), 'la page se lie à elle-même');
        // Une suite de lecture ne doit jamais faire changer de langue.
        assert.ok(href.startsWith(routeFor(locale, '')), `${href} quitte la langue ${locale}`);
        assert.ok(existsSync('dist' + href + 'index.html'), `lien mort : ${href}`);
      }
    }
});

test('aucun lien interne ne change de langue par accident', () => {
  for (const [locale, route] of every) {
    const $ = load(read(locale, route));
    const prefix = routeFor(locale, '');
    $('main a[href^="/"], footer a[href^="/"], header a[href^="/"]').each((_, node) => {
      const href = $(node).attr('href');
      if (href.startsWith('//') || href.includes('.')) return;
      assert.ok(
        href.startsWith(prefix),
        `${routeFor(locale, route)} : ${href} sort de la langue ${locale}`,
      );
    });
  }
});

test('les pages profondes portent un fil d’Ariane', () => {
  for (const locale of LOCALES) {
    const label = content[locale].ui.page.breadcrumb;
    for (const route of routes.filter(Boolean)) {
      const $ = load(read(locale, route));
      assert.equal($(`nav[aria-label="${label}"]`).length, 1, `${routeFor(locale, route)}`);
      assert.equal($(`nav[aria-label="${label}"] [aria-current="page"]`).length, 1);
    }
  }
});

test('la numérotation des sections reste lisible au-delà de neuf', () => {
  for (const [locale, route] of every) {
    const $ = load(read(locale, route));
    $('.step-number, .faq-index, .step-label').each((_, node) => {
      const label = $(node).text().trim();
      assert.doesNotMatch(label, /^0\d\d/, `numéro mal formé : « ${label} »`);
    });
  }
});

test('sitemap et robots cohérents avec les routes de toutes les langues', () => {
  const xml = load(readFileSync('dist/sitemap.xml', 'utf8'), { xml: true });
  const locs = xml('loc')
    .map((_, n) => xml(n).text())
    .get();
  const meta = JSON.parse(readFileSync('dist/build-meta.json', 'utf8'));
  assert.deepEqual(meta.locales, [...LOCALES]);
  assert.equal(meta.defaultLocale, DEFAULT_LOCALE);
  assert.equal(locs.length, meta.indexable ? indexableRoutes.length * LOCALES.length : 0);
  if (!meta.indexable)
    for (const [locale, route] of every)
      assert.match(load(read(locale, route))('meta[name="robots"]').attr('content'), /noindex/);
  assert.equal(new Set(locs).size, locs.length);
  for (const loc of locs) {
    const p = new URL(loc).pathname;
    assert.ok(existsSync('dist' + p + 'index.html'));
    const $ = load(readFileSync('dist' + p + 'index.html', 'utf8'));
    assert.equal($('link[rel="canonical"]').attr('href'), loc);
    assert.doesNotMatch($('meta[name="robots"]').attr('content') || '', /noindex/);
  }
  // Chaque entrée du sitemap porte ses traductions : c'est le second signal
  // que Google croise avec les balises de la page.
  xml('url').each((_, node) => {
    const alternates = xml(node).find('xhtml\\:link, link');
    if (locs.length) assert.equal(alternates.length, LOCALES.length + 1);
  });
  assert.match(readFileSync('dist/robots.txt', 'utf8'), /Sitemap: https:\/\//);
  assert.ok(existsSync('dist/404.html'));
  assert.match(readFileSync('dist/404.html', 'utf8'), /noindex/);
  // La page introuvable est servie pour toutes les langues : elle se signale
  // comme telle, pour que le navigateur la reprenne dans la bonne langue.
  assert.match(readFileSync('dist/404.html', 'utf8'), /data-fallback="404"/);
});

test('chaque langue publie son résumé pour les lecteurs automatiques', () => {
  for (const locale of LOCALES) {
    const file = `dist${routeFor(locale, '')}llms.txt`;
    assert.ok(existsSync(file), `${locale} : llms.txt absent`);
    const text = readFileSync(file, 'utf8');
    assert.match(text, /^# AVYOR/);
    assert.ok(text.includes(content[locale].facts), `${locale} : description absente`);
    for (const page of content[locale].pages.filter((p) => !p.noindex))
      assert.ok(text.includes(routeFor(locale, page.slug)), `${locale} : /${page.slug}/ absente`);
    // Il renvoie vers les autres langues : un lecteur automatique les découvre.
    for (const other of LOCALES)
      if (other !== locale)
        assert.ok(text.includes(routeFor(other, '')), `${locale} : ${other} non annoncée`);
  }
});

test('les icônes en volume sont des images décoratives, chargées à la demande', () => {
  for (const locale of LOCALES) {
    const $ = load(read(locale, ''));
    const icons = $('.manifesto-pillars img, .trust-grid img');
    assert.equal(icons.length, 6, 'trois icônes au manifeste, trois à la section 06');
    icons.each((_, img) => {
      const src = $(img).attr('src');
      // Le texte porte le sens : alt vide, l'image n'est pas annoncée.
      assert.equal($(img).attr('alt'), '', `${src} doit rester décorative`);
      assert.equal($(img).attr('loading'), 'lazy', `${src} doit attendre sa section`);
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
  }
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
  for (const [locale, route] of every)
    assert.doesNotMatch(read(locale, route), /src="data:image\//, `${route} : image encodée`);
});

test('l’accueil n’a ni identifiant dupliqué ni référence url(#…) cassée', () => {
  for (const locale of LOCALES) {
    const html = read(locale, '');
    const $ = load(html);
    const ids = $('[id]')
      .map((_, n) => $(n).attr('id'))
      .get();
    assert.deepEqual(
      ids.filter((id, i) => ids.indexOf(id) !== i),
      [],
      `${locale} : identifiants dupliqués`,
    );
    const known = new Set(ids);
    for (const [, ref] of html.matchAll(/url\(#([^)]+)\)/g))
      assert.ok(known.has(ref), `${locale} : url(#${ref}) ne mène à rien`);
  }
});
