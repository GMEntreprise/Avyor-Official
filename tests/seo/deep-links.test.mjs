import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { LOCALES, routeFor } from '../../src/i18n/locales.ts';
import {
  AUTH_ROUTES,
  DEEP_LINK_ROUTES,
  DEEP_LINK_SLUGS,
  appleAppSiteAssociation,
} from '../../src/config/deep-links.ts';

/*
 * Ces tests lisent le build réel : ce qu'un téléphone et un robot d'aperçu
 * reçoivent, pas ce que le code source promet.
 */
const read = (path) => readFileSync(join('dist', path), 'utf8');
const html = (route) => load(read(`${route}index.html`));
const every = LOCALES.flatMap((locale) => DEEP_LINK_SLUGS.map((slug) => [locale, slug]));

test('le fichier Apple est construit, et dit exactement ce que dit le contrat', () => {
  const path = 'dist/.well-known/apple-app-site-association.json';
  assert.ok(existsSync(path), 'fichier absent : iOS ouvrira le navigateur, sans rien signaler');
  // Il porte une extension pour être servi en application/json, et une
  // réécriture le sert à l'adresse sans extension qu'iOS demande. Le fichier
  // sans extension ne doit pas exister : le système de fichiers passant avant
  // les réécritures, il reprendrait la main avec le mauvais type.
  assert.ok(
    !existsSync('dist/.well-known/apple-app-site-association'),
    'le fichier sans extension masquerait la réécriture',
  );
  const written = readFileSync(path, 'utf8');
  assert.deepEqual(JSON.parse(written), appleAppSiteAssociation());
  assert.doesNotMatch(written, /[^\x20-\x7E\s]/, 'ASCII uniquement');
});

test('le fichier Android n’est écrit que s’il peut être juste', () => {
  const path = 'dist/.well-known/assetlinks.json';
  if (!existsSync(path)) return; // Aucune empreinte fournie : c'est le bon comportement.
  const declared = JSON.parse(readFileSync(path, 'utf8'));
  for (const entry of declared)
    for (const fingerprint of entry.target.sha256_cert_fingerprints)
      assert.match(fingerprint, /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/, fingerprint);
});

test('chaque page de repli est servie, dans chaque langue, avec son contenu', () => {
  for (const [locale, slug] of every) {
    const route = routeFor(locale, slug);
    const $ = html(route);
    assert.equal($('h1').length, 1, `${locale} ${slug} : un seul h1`);
    assert.ok($('h1').text().length > 10, `${locale} ${slug}`);
    // Le texte est dans le HTML servi : un visiteur sans JavaScript lit la page.
    $('script,style').remove();
    assert.ok($('main').text().replace(/\s+/g, ' ').length > 160, `${locale} ${slug} : page vide`);
  }
});

test('aucune page de repli n’est indexable, et aucune ne demande de traduction', () => {
  for (const [locale, slug] of every) {
    const $ = html(routeFor(locale, slug));
    assert.equal(
      $('meta[name="robots"]').attr('content'),
      'noindex,follow',
      `${locale} ${slug} : une même page sous une infinité d’adresses ne s’indexe pas`,
    );
    assert.equal($('link[rel="alternate"][hreflang]').length, 0, `${locale} ${slug}`);
    assert.equal($('link[rel="canonical"]').length, 1, `${locale} ${slug}`);
  }
});

test('ni collaboration, ni conversation, ni authentification ne se déplient dans un aperçu', () => {
  const privees = [
    ...DEEP_LINK_ROUTES.filter((r) => r.visibility === 'private').map((r) => r.slug),
    ...AUTH_ROUTES,
  ];
  for (const locale of LOCALES)
    for (const slug of privees) {
      const page = read(`${routeFor(locale, slug)}index.html`);
      // Un aperçu s'ouvre dans une conversation de groupe, devant des gens qui
      // n'ont rien à voir avec elle.
      assert.doesNotMatch(page, /property="og:/, `${locale} ${slug} : Open Graph`);
      assert.doesNotMatch(page, /name="twitter:/, `${locale} ${slug} : carte Twitter`);
    }
  // Les ressources publiques gardent un aperçu générique, sans rien inventer.
  const $ = html(routeFor('fr', 'video'));
  assert.equal($('meta[property="og:title"]').length, 1);
});

test('une page d’authentification ne change rien quand on la regarde', () => {
  // Un robot d'aperçu ouvre le lien avant son destinataire : une page qui
  // consomme un jeton sur un simple GET le consommerait à sa place.
  for (const locale of LOCALES)
    for (const slug of AUTH_ROUTES) {
      const page = read(`${routeFor(locale, slug)}index.html`);
      const $ = load(page);
      assert.equal($('form').length, 0, `${locale} ${slug} : formulaire`);
      assert.equal($('input').length, 0, `${locale} ${slug} : champ de saisie`);
      assert.doesNotMatch(page, /\son[a-z]+=["']/, `${locale} ${slug} : attribut événementiel`);
      assert.doesNotMatch(page, /avyor:\/\//, `${locale} ${slug} : ouverture forcée du schéma`);
    }
});

test('aucune adresse de lien profond n’entre dans le sitemap ni dans llms.txt', () => {
  const sitemap = existsSync('dist/sitemap.xml') ? read('sitemap.xml') : '';
  const llms = LOCALES.map((locale) => read(`${routeFor(locale, '')}llms.txt`)).join('\n');
  for (const slug of DEEP_LINK_SLUGS)
    for (const locale of LOCALES) {
      const route = routeFor(locale, slug);
      assert.ok(!sitemap.includes(`${route}<`), `${route} dans le sitemap`);
      assert.ok(!llms.includes(route), `${route} dans llms.txt`);
    }
});

test('robots.txt ne bloque ni la vérification ni les pages de repli', () => {
  const robots = read('robots.txt');
  assert.doesNotMatch(robots, /Disallow:\s*\/\.well-known/i);
  assert.doesNotMatch(robots, /Disallow:\s*\/(video|creator|campaign|auth)/i);
});

test('la propriété Search Console est prouvée des deux façons', () => {
  // Google revérifie périodiquement : si la balise ou le fichier disparaît, la
  // propriété tombe, et avec elle le sitemap déclaré et l'inspection d'URL.
  const home = read('index.html');
  assert.match(home, /name="google-site-verification" content="[\w-]{20,}"/);
  const file = readdirSync('dist').find((name) => /^google[0-9a-f]{16}\.html$/.test(name));
  assert.ok(file, 'fichier de validation Google absent du build');
  assert.match(read(file), /^google-site-verification: /);
});
