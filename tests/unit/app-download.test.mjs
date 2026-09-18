import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStores, DOWNLOAD_SLUG } from '../../src/lib/app-download.ts';
import { LOCALES, routeFor } from '../../src/i18n/locales.ts';

const APPLE = 'https://apps.apple.com/fr/app/avyor/id123';
const PLAY = 'https://play.google.com/store/apps/details?id=app.avyor';

test('les deux plateformes sont décrites une seule fois, dans cet ordre', () => {
  assert.deepEqual(
    buildStores().map((s) => s.platform),
    ['ios', 'android'],
  );
});

test('sans URL vérifiée un store reste « bientôt disponible » et n’expose aucun lien', () => {
  for (const store of buildStores(undefined, undefined)) {
    assert.equal(store.status, 'coming-soon');
    assert.equal(store.url, undefined);
  }
});

test('une URL vérifiée bascule la seule plateforme concernée', () => {
  const [ios, android] = buildStores(APPLE, undefined);
  assert.equal(ios.status, 'available');
  assert.equal(ios.url, APPLE);
  assert.equal(android.status, 'coming-soon');
  assert.equal(android.url, undefined);
  const both = buildStores(APPLE, PLAY);
  assert.deepEqual(
    both.map((s) => s.status),
    ['available', 'available'],
  );
  assert.equal(both[1].url, PLAY);
});

test('chaque plateforme est nommée comme son magasin la nomme', () => {
  const [ios, android] = buildStores();
  assert.equal(ios.store, 'App Store');
  assert.equal(android.store, 'Google Play');
  assert.equal(ios.os, 'iOS');
  assert.equal(android.os, 'Android');
});

test('le CTA de repli pointe vers une vraie route, dans chaque langue', () => {
  assert.equal(routeFor('fr', DOWNLOAD_SLUG), '/download/');
  for (const locale of LOCALES) {
    const href = routeFor(locale, DOWNLOAD_SLUG);
    assert.match(href, /^\/[a-z/-]+\/$/, `${locale} : ${href}`);
    assert.notEqual(href, '#');
  }
});

test('chaque bouton de magasin est écrit dans la langue de la page', async () => {
  for (const locale of LOCALES) {
    const { [locale]: content } = await import(`../../src/content/locales/${locale}.ts`);
    const { apple, google } = content.ui.store;
    // Le nom du magasin ne se traduit pas ; ce qu'on y fait, si.
    assert.equal(apple.name, 'App Store', locale);
    assert.equal(google.name, 'Google Play', locale);
    for (const lead of [apple.lead, google.lead])
      assert.ok(lead.trim().length > 4, `${locale} : « ${lead} »`);
  }
});

test('aucun composant store ne retombe sur une icône de téléphone générique', () => {
  for (const file of ['src/components/StoreCard.tsx', 'src/components/StoreButtons.tsx'])
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /\b(Smartphone|TabletSmartphone|PhoneCall|Phone)\b/,
      `${file} doit utiliser les assets officiels des stores`,
    );
});
