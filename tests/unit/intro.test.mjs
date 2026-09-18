import test from 'node:test';
import { LOCALES, isHomeRoute, routeFor } from '../../src/i18n/locales.ts';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { introScript, INTRO_SESSION_KEY } from '../../src/components/intro-session.ts';

const source = readFileSync('src/components/Intro.tsx', 'utf8');
const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('l’intro est rendue par le serveur, donc elle ne dépend pas de l’hydratation', () => {
  // La régression corrigée : l'intro attendait React, c'est-à-dire le moment
  // le plus lent de la toute première visite. Elle ne jouait donc qu'au
  // rechargement, une fois les assets en cache.
  assert.match(source, /export function Intro/, 'le composant doit rester un composant React');
  assert.doesNotMatch(code, /performance\.now/, 'aucun seuil de temps ne conditionne l’intro');
  // Sans état ni effet, le rendu serveur et le rendu client sont identiques :
  // c'est ce qui permet de la livrer dans le HTML sans casser l'hydratation.
  for (const forbidden of ['useState', 'useEffect', 'setTimeout', 'useReducedMotion'])
    assert.doesNotMatch(
      code,
      new RegExp(`\\b${forbidden}\\b`),
      `${forbidden} ferait diverger le rendu serveur et le rendu client`,
    );
});

/** Images the intro imports: Vite fingerprints them, so they cannot go missing. */
const imports = Object.fromEntries(
  [...source.matchAll(/^import (\w+) from '(\.\.\/assets\/[^']+)';$/gm)].map((m) => [
    m[1],
    'src/components/' + m[2],
  ]),
);

test('l’intro importe ses images au lieu de les désigner par une adresse', () => {
  // Une adresse /assets/… vers public/ ne casse pas le build si le fichier
  // manque : elle part en 404 en production. C'est arrivé au logo.
  assert.doesNotMatch(code, /["']\/assets\//, 'image référencée par une adresse brute');
  assert.ok(imports.logo && imports.logoMask, 'le logo et son masque doivent être importés');
  assert.match(source, /href=\{logoMask\}/);
  assert.match(source, /src=\{logo\}/);
});

test('l’intro ne met pas le master 450 Ko sur le chemin du premier rendu', () => {
  for (const file of Object.values(imports))
    assert.ok(statSync(file).size < 120_000, `${file} est trop lourd`);
});

test('le masque garde assez de résolution pour être net au départ', async () => {
  const meta = await sharp(imports.logoMask).metadata();
  assert.ok(meta.hasAlpha, 'le masque a besoin du canal alpha du logo');
  assert.ok(meta.width >= 512, 'le logo est rendu jusqu’à ~860 px physiques');
});

test('l’animation garde les valeurs d’origine', () => {
  const css = readFileSync('src/styles.css', 'utf8');
  assert.match(source, /viewBox="0 0 1000 1000"/);
  assert.match(source, /preserveAspectRatio="xMidYMid slice"/);
  assert.match(source, /x="350"/);
  assert.match(source, /width="300"/);
  assert.match(source, /#070b15/);
  assert.match(css, /transform-origin:\s*500px 500px/);
  assert.match(css, /scale\(16\)/, 'le masque s’ouvre jusqu’à 16×');
  assert.match(css, /cubic-bezier\(0\.76, 0, 0\.24, 1\)/);
  assert.match(css, /intro-aperture 1\.45s/);
  // La dernière image masque l'élément : c'est aussi le filet de sécurité.
  assert.match(css, /@keyframes intro-exit\s*\{[\s\S]*?visibility:\s*hidden/);
  // Et rien ne reste cliquable ni focalisable par-dessus la page.
  assert.match(css, /\.intro\s*\{[^}]*pointer-events:\s*none/);
  assert.match(source, /aria-hidden="true"/);
  assert.doesNotMatch(source, /<(button|a|input)\b/);
});

test('elle ne se rejoue pas à chaque page de la session', () => {
  assert.match(introScript, new RegExp(INTRO_SESSION_KEY));
  assert.match(introScript, /sessionStorage/);
  assert.match(introScript, /intro-seen/);
  // Le stockage peut être indisponible : l'échec ne doit jamais casser la page.
  assert.match(introScript, /try\s*\{[\s\S]*\}\s*catch/);
  // Un script avant peinture doit rester minuscule et sur une seule ligne.
  assert.doesNotMatch(introScript, /\n/);
  assert.ok(introScript.length < 400);
});

test('l’accueil de chaque langue est reconnu comme l’entrée du site', () => {
  // La garde de session n'est posée que sur l'accueil. Si une langue n'est pas
  // reconnue, son intro se rejoue à chaque passage — c'est arrivé en
  // développement, où le serveur ne connaissait que « / ».
  for (const locale of LOCALES) {
    assert.ok(isHomeRoute(routeFor(locale, '')), routeFor(locale, ''));
    assert.ok(isHomeRoute(`${routeFor(locale, '')}index.html`), locale);
    assert.ok(isHomeRoute(routeFor(locale, '').replace(/\/$/, '') || '/'), locale);
    for (const slug of ['creators', 'faq', 'news'])
      assert.ok(!isHomeRoute(routeFor(locale, slug)), routeFor(locale, slug));
  }
});

test('le pré-rendu et le serveur de développement posent la garde depuis cette règle', () => {
  // Deux chemins d'injection, une seule définition de « l'accueil » : c'est
  // leur divergence qui avait rendu l'intro bavarde en développement.
  for (const file of ['vite.config.ts', 'scripts/prerender.mjs'])
    assert.match(readFileSync(file, 'utf8'), /isHomeRoute\(/, file);
});
