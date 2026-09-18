import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const primitive = () => readFileSync('src/components/ui/hover-border-gradient.tsx', 'utf8');
const brand = () => readFileSync('src/components/DownloadAppButton.tsx', 'utf8');

test('la primitive existe et reste agnostique de la marque', () => {
  const source = primitive();
  assert.doesNotMatch(
    source,
    /AVYOR|Télécharger|\/download\//i,
    'la primitive UI ne connaît pas AVYOR',
  );
  assert.match(source, /containerClassName/, 'l’API reste celle du composant d’origine');
});

test('la primitive n’alourdit pas le bundle ni ne laisse tourner de timer', () => {
  const source = primitive();
  assert.doesNotMatch(source, /from ['"]@\//, 'alias @/ non configuré dans ce projet');
  assert.doesNotMatch(source, /\bsetInterval\b/, 'aucune animation permanente hors interaction');
  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*['"]motion\/react['"]/,
    'le site charge motion via LazyMotion + m',
  );
});

test('le bouton de marque pointe vers une vraie route et porte son identité', () => {
  const source = brand();
  assert.match(source, /HoverBorderGradient/);
  assert.match(source, /DOWNLOAD_SLUG/, 'la destination vient de la configuration centrale');
  assert.match(source, /useHref/, 'et suit la langue de la page');
  assert.doesNotMatch(source, /href=["']#["']/);
});

test('un seul composant porte le CTA de téléchargement, sans copie par emplacement', () => {
  for (const file of ['src/components/Navbar.tsx', 'src/components/Hero.tsx'])
    assert.match(
      readFileSync(file, 'utf8'),
      /DownloadAppButton/,
      `${file} doit réutiliser le composant, pas le recopier`,
    );
});
