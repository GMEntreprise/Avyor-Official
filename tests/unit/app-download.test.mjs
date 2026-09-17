import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildStores, downloadHref } from '../../src/lib/app-download.ts';

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

test('chaque plateforme porte le badge officiel livré, avec ses dimensions réelles', () => {
  const [ios, android] = buildStores();
  for (const store of [ios, android]) {
    assert.match(store.badge.src, /^\/assets\/badges\//);
    readFileSync('public' + store.badge.src); // lève si l’asset officiel manque
    assert.ok(store.badge.width > 0 && store.badge.height > 0);
    assert.ok(store.badge.alt.length > 10);
  }
  assert.match(ios.badge.src, /app-store/);
  assert.match(android.badge.src, /google-play/);
});

test('le CTA de repli pointe vers une vraie route, jamais vers « # »', () => {
  assert.equal(downloadHref, '/download/');
  assert.notEqual(downloadHref, '#');
});

test('aucun composant store ne retombe sur une icône de téléphone générique', () => {
  for (const file of ['src/components/StoreCard.tsx', 'src/components/StoreButtons.tsx'])
    assert.doesNotMatch(
      readFileSync(file, 'utf8'),
      /\b(Smartphone|TabletSmartphone|PhoneCall|Phone)\b/,
      `${file} doit utiliser les assets officiels des stores`,
    );
});
