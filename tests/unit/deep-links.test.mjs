import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCALES } from '../../src/i18n/locales.ts';
import {
  ANDROID_PACKAGE,
  APPLE_APP_IDS,
  AUTH_ROUTES,
  DEEP_LINK_ROUTES,
  DEEP_LINK_SLUGS,
  ID_PATTERN,
  appleAppSiteAssociation,
  assetLinks,
  isAuthSlug,
  isPrivateResource,
} from '../../src/config/deep-links.ts';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

test('le fichier Apple déclare l’application réelle, et seulement nos chemins', () => {
  const aasa = appleAppSiteAssociation();
  const [details] = aasa.applinks.details;
  assert.deepEqual(aasa.applinks.apps, []);
  for (const appID of details.appIDs)
    assert.match(
      appID,
      /^[A-Z0-9]{10}\.[a-z0-9.]+$/,
      'un appID est un Team ID de dix caractères suivi du bundle',
    );
  assert.deepEqual(details.appIDs, [...APPLE_APP_IDS]);

  const paths = details.components.map((c) => c['/']);
  // « * » ouvrirait l'application sur une page marketing ou un article.
  assert.ok(
    !paths.includes('*') && !paths.includes('/*'),
    'aucun motif attrape-tout : une page web doit rester une page web',
  );
  for (const route of DEEP_LINK_ROUTES) assert.ok(paths.includes(`/${route.slug}/*`), route.slug);
  assert.ok(paths.includes('/auth/*'));
  assert.equal(paths.length, DEEP_LINK_ROUTES.length + 1);

  // iOS lit ce fichier, pas un humain : rien hors ASCII, et du JSON strict.
  const written = JSON.stringify(aasa);
  assert.doesNotMatch(written, /[^\x20-\x7E]/, 'le fichier Apple reste en ASCII');
  assert.deepEqual(JSON.parse(written), aasa);
});

test('le fichier Android n’est écrit qu’avec une empreinte valide', () => {
  const real = 'A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90';
  const [entry] = assetLinks([real]);
  assert.deepEqual(entry.relation, ['delegate_permission/common.handle_all_urls']);
  assert.equal(entry.target.namespace, 'android_app');
  assert.equal(entry.target.package_name, ANDROID_PACKAGE);
  assert.deepEqual(entry.target.sha256_cert_fingerprints, [real]);
  // La minuscule est acceptée et remise en forme ; le reste est refusé.
  assert.deepEqual(assetLinks([real.toLowerCase()])[0].target.sha256_cert_fingerprints, [real]);

  // Pas d'empreinte : pas de fichier. Un fichier faux échoue en silence.
  assert.equal(assetLinks([]), null);
  assert.equal(assetLinks(['  ']), null);
  for (const wrong of [real.slice(0, -3), real.replace(/:/g, ''), 'ZZ:' + real.slice(3), 'todo'])
    assert.throws(() => assetLinks([wrong]), /Empreinte Android invalide/, wrong.slice(0, 12));
});

test('le site accepte exactement les identifiants que l’application accepte', () => {
  const id = new RegExp(`^${ID_PATTERN}$`);
  for (const valid of ['a', 'A1', '3f2b1c', 'a'.repeat(128), 'id.with-dots_and-dashes'])
    assert.ok(id.test(valid), valid.slice(0, 12));
  for (const invalid of ['', '.hidden', '-leading', 'a'.repeat(129), 'avec espace', 'a/b', 'é'])
    assert.ok(!id.test(invalid), JSON.stringify(invalid.slice(0, 12)));
});

test('chaque ressource a sa réécriture, avec et sans barre oblique finale', () => {
  const ressources = vercel.rewrites.filter((rule) => rule.destination.endsWith(':kind/'));
  // `trailingSlash: true` redirige d'abord « /video/abc » vers « /video/abc/ ».
  // Une règle qui ne connaîtrait que la forme sans barre ne serait jamais
  // atteinte : c'est arrivé, et la page de repli répondait 404 en production.
  const racine = ressources.filter((rule) => rule.destination === '/:kind/');
  const prefixees = ressources.filter((rule) => rule.destination === '/:locale/:kind/');
  assert.equal(racine.length, 2, 'racine : une forme avec barre finale, une sans');
  assert.equal(prefixees.length, 2, 'langues préfixées : idem');
  assert.equal(racine.filter((rule) => rule.source.endsWith('/')).length, 1);
  assert.equal(prefixees.filter((rule) => rule.source.endsWith('/')).length, 1);

  for (const rule of ressources)
    for (const route of DEEP_LINK_ROUTES)
      assert.ok(rule.source.includes(route.slug), `${route.slug} absent de ${rule.source}`);
  for (const rule of prefixees)
    for (const locale of LOCALES.filter((l) => l !== 'fr'))
      assert.ok(rule.source.includes(locale), locale);
  // Une réécriture n'est pas une redirection : l'adresse partagée ne bouge pas.
  for (const rule of vercel.rewrites) assert.equal(rule.permanent, undefined);
  // Les retours d'authentification sont de vraies pages : rien à réécrire.
  for (const rule of ressources)
    for (const auth of AUTH_ROUTES) assert.ok(!rule.source.includes(auth));
});

test('le fichier Apple est servi en application/json, sans extension ni redirection', () => {
  /*
   * Vercel déduit le type d'un fichier statique de son extension et **ignore**
   * un « content-type » déclaré dans les en-têtes : servi tel quel, le fichier
   * partait en application/octet-stream et iOS l'ignorait sans un mot. Il est
   * donc stocké avec une extension, et servi sans elle par une réécriture.
   */
  const rewrite = vercel.rewrites.find(
    (rule) => rule.source === '/.well-known/apple-app-site-association',
  );
  assert.ok(rewrite, 'aucune réécriture vers le fichier typé');
  assert.equal(rewrite.destination, '/.well-known/apple-app-site-association.json');
  assert.equal(rewrite.permanent, undefined, 'une réécriture, pas une redirection');
  for (const rule of vercel.headers.filter((h) => h.source.startsWith('/.well-known'))) {
    const headers = Object.fromEntries(rule.headers.map((h) => [h.key, h.value]));
    // Un cache long figerait une erreur passagère dans les téléphones.
    assert.match(headers['cache-control'], /max-age=0/, rule.source);
    assert.equal(headers['content-type'], undefined, 'Vercel ignore cet en-tête : ne pas mentir');
  }
  // Aucune redirection ne doit croiser ces chemins : Apple n’en suit aucune.
  for (const rule of vercel.redirects ?? [])
    assert.ok(!rule.source.startsWith('/.well-known'), rule.source);
});

test('chaque page de repli existe dans les cinq langues, et n’est pas indexable', async () => {
  for (const locale of LOCALES) {
    const content = (await import(`../../src/content/locales/${locale}.ts`))[locale];
    const pages = new Map(content.pages.map((page) => [page.slug, page]));
    for (const slug of DEEP_LINK_SLUGS) {
      const page = pages.get(slug);
      assert.ok(page, `${locale} : page ${slug} absente`);
      // Une même page servie sous une infinité d'adresses ne s'indexe pas.
      assert.equal(page.noindex, true, `${locale} ${slug}`);
      assert.ok(page.title.length > 10 && page.description.length > 40, `${locale} ${slug}`);
    }
    // Elles ne doivent pas non plus apparaître dans la navigation.
    const navigation = content.navigation.map(([, slug]) => slug);
    for (const slug of DEEP_LINK_SLUGS) assert.ok(!navigation.includes(slug), `${locale} ${slug}`);
  }
});

test('le privé est reconnu comme privé', () => {
  assert.ok(isPrivateResource('collaboration') && isPrivateResource('messages'));
  assert.ok(!isPrivateResource('video') && !isPrivateResource('creator'));
  for (const slug of AUTH_ROUTES) assert.ok(isAuthSlug(slug), slug);
  assert.ok(!isAuthSlug('video'));
});

test('aucune mesure d’audience sur un retour d’authentification', () => {
  // Ces adresses portent des jetons, et une bibliothèque de mesure envoie
  // l'adresse entière. La garde est dans le code client, pas dans une note.
  const client = readFileSync('src/entry-client.tsx', 'utf8');
  assert.match(client, /VITE_VERCEL_INSIGHTS === 'true' && !isAuthSlug\(slug\)/);
});
