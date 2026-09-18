import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync('index.html', 'utf8');
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const viteConfig = readFileSync('vite.config.ts', 'utf8');
const app = readFileSync('src/App.tsx', 'utf8');

/** Every `<!--name-->` hole the template declares. */
const placeholders = [...template.matchAll(/<!--([a-z-]+)-->/g)].map((m) => m[1]).sort();

test('le gabarit déclare exactement les emplacements attendus', () => {
  assert.deepEqual(placeholders, ['app', 'head']);
});

test('le build remplit chaque emplacement du gabarit', () => {
  for (const name of placeholders)
    assert.match(
      prerender,
      new RegExp(`<!--${name}-->`),
      `scripts/prerender.mjs laisse « ${name} » dans le HTML livré`,
    );
});

test('l’intro passe par le rendu de l’app, pas par une injection de gabarit', () => {
  // C'est ce qui la met dans le HTML servi tout en gardant un seul rendu,
  // identique côté serveur et côté client.
  assert.match(app, /<Intro \/>/, 'App doit rendre l’intro');
  assert.match(app, /!slug && page && <Intro \/>/, 'et seulement à l’entrée du site');
  assert.doesNotMatch(prerender, /class="intro"/, 'aucune copie du balisage dans le build');
  assert.doesNotMatch(viteConfig, /class="intro"/, 'aucune copie du balisage en dev');
});

test('le garde de session est injecté en dev comme au build, depuis une seule source', () => {
  // `scripts/prerender.mjs` ne tourne pas sous `vite dev` : sans injection
  // équivalente, l'intro se rejouerait à chaque page en développement.
  for (const [file, source] of [
    ['scripts/prerender.mjs', prerender],
    ['vite.config.ts', viteConfig],
  ]) {
    assert.match(source, /\bintroScript\b/, `${file} doit réutiliser le garde commun`);
    assert.match(source, /<!--head-->/, `${file} doit l’injecter dans <head>`);
    // Importé, jamais recopié : une seule définition du garde dans le dépôt.
    assert.doesNotMatch(source, /sessionStorage/, `${file} recopie le garde au lieu de l’importer`);
  }
  // Le build passe par le bundle SSR, qui réexporte la définition unique.
  assert.match(prerender, /from '\.\.\/\.ssr\/entry-server\.js'/);
  assert.match(
    readFileSync('src/entry-server.tsx', 'utf8'),
    /introScript.*intro-session/,
    'entry-server doit réexporter le garde depuis son module',
  );
  assert.match(viteConfig, /intro-session/, 'vite.config doit l’importer directement');
});

test('l’intro reste réservée à l’entrée du site, des deux côtés', () => {
  assert.match(prerender, /page\.slug === ''/, 'le build limite le garde à l’accueil');
  assert.match(viteConfig, /isHome/, 'le dev limite le garde à l’accueil');
});
