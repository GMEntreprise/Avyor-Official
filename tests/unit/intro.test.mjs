import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

const source = readFileSync('src/components/Intro.tsx', 'utf8');

test('l’intro ne met pas le master 450 Ko sur le chemin du premier rendu', () => {
  const assets = [...source.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((m) => m[1]);
  assert.ok(assets.length > 0, 'l’intro doit référencer le logo officiel');
  for (const asset of assets)
    assert.ok(
      statSync('public' + asset).size < 120_000,
      `${asset} est trop lourd pour précéder le Hero`,
    );
});

test('le masque garde assez de résolution pour être net au départ', async () => {
  const mask = source.match(/href="(\/assets\/[^"]+)"/)[1];
  const meta = await sharp('public' + mask).metadata();
  assert.ok(meta.hasAlpha, 'le masque a besoin du canal alpha du logo');
  assert.ok(meta.width >= 512, 'le logo est rendu jusqu’à ~860 px physiques');
});

test('l’intro reste une transition de marque, sans faux chargement', () => {
  assert.doesNotMatch(
    source,
    /\b(progress|loading|chargement|percent|pourcent)/i,
    'aucune fausse barre ni faux pourcentage de chargement',
  );
  assert.match(source, /sessionStorage/, 'elle ne se rejoue pas à chaque page');
  assert.match(source, /useReducedMotion/);
  assert.match(source, /clearTimeout/, 'aucun timer orphelin');
  assert.match(source, /aria-hidden/, 'elle ne capture jamais le focus');
});
