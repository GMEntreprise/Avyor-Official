import test from 'node:test';
import assert from 'node:assert/strict';
import { storeUrl } from '../../src/lib/store-url.ts';
test('aucun lien store factice ou non officiel ne devient actif', () => {
  for (const input of [
    undefined,
    '',
    '#',
    'javascript:alert(1)',
    'http://apps.apple.com/fr/app/id123',
    'https://apps.apple.com.evil.test/id123',
    'https://apps.apple.com/',
    'https://a:b@apps.apple.com/fr/app/id123',
  ])
    assert.equal(storeUrl(input, 'apple'), undefined);
  for (const input of [
    'https://play.google.com/store/apps/details',
    'https://play.google.com/store/apps/details?id=',
    'https://example.com/store/apps/details?id=app',
  ])
    assert.equal(storeUrl(input, 'google'), undefined);
});
test('les liens officiels conservent leurs paramètres', () => {
  assert.equal(
    storeUrl('https://apps.apple.com/fr/app/avyor/id123?utm_source=website', 'apple'),
    'https://apps.apple.com/fr/app/avyor/id123?utm_source=website',
  );
  assert.equal(
    storeUrl('https://play.google.com/store/apps/details?id=com.example.app', 'google'),
    'https://play.google.com/store/apps/details?id=com.example.app',
  );
});
