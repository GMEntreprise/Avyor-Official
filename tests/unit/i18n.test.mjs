import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LOCALES,
  DEFAULT_LOCALE,
  localeMeta,
  isLocale,
  localePrefix,
  routeFor,
  splitPath,
  swapLocale,
} from '../../src/i18n/locales.ts';

test('la langue de référence vit à la racine, les autres sous un préfixe', () => {
  assert.equal(localePrefix(DEFAULT_LOCALE), '');
  assert.equal(routeFor(DEFAULT_LOCALE, ''), '/');
  assert.equal(routeFor(DEFAULT_LOCALE, 'creators'), '/creators/');
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    assert.equal(routeFor(locale, ''), `/${locale}/`);
    assert.equal(routeFor(locale, 'creators'), `/${locale}/creators/`);
  }
});

test('chaque langue est décrite une fois, avec son sens de lecture', () => {
  assert.equal(new Set(LOCALES).size, LOCALES.length);
  for (const locale of LOCALES) {
    const meta = localeMeta[locale];
    assert.ok(meta, `${locale} n’a pas de description`);
    assert.match(meta.tag, /^[a-z]{2}$/);
    assert.ok(meta.dir === 'ltr' || meta.dir === 'rtl');
    assert.match(meta.ogLocale, /^[a-z]{2}_[A-Z]{2}$/);
    // Une langue se nomme dans sa propre écriture : c'est ce qu'un visiteur
    // qui ne lit pas la langue courante est capable de reconnaître.
    assert.ok(meta.label.length > 1);
    assert.ok(meta.code.length >= 1);
  }
  assert.equal(new Set(LOCALES.map((l) => localeMeta[l].label)).size, LOCALES.length);
});

test('une adresse se relit dans sa langue et sa page', () => {
  assert.deepEqual(splitPath('/'), { locale: DEFAULT_LOCALE, slug: '' });
  assert.deepEqual(splitPath('/creators/'), { locale: DEFAULT_LOCALE, slug: 'creators' });
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    assert.deepEqual(splitPath(`/${locale}/`), { locale, slug: '' });
    assert.deepEqual(splitPath(`/${locale}`), { locale, slug: '' });
    assert.deepEqual(splitPath(`/${locale}/creators/`), { locale, slug: 'creators' });
  }
  // Un préfixe qui ressemble à une langue sans en être une reste une page.
  assert.deepEqual(splitPath('/entreprise/'), { locale: DEFAULT_LOCALE, slug: 'entreprise' });
  assert.deepEqual(splitPath('/english/'), { locale: DEFAULT_LOCALE, slug: 'english' });
});

test('toute adresse se relit après avoir été écrite, dans toutes les langues', () => {
  for (const locale of LOCALES)
    for (const slug of ['', 'creators', 'how-it-works', 'faq'])
      assert.deepEqual(splitPath(routeFor(locale, slug)), { locale, slug });
});

test('changer de langue garde la page, même quand elle n’existe pas', () => {
  for (const from of LOCALES)
    for (const to of LOCALES) {
      assert.equal(swapLocale(routeFor(from, 'creators'), to), routeFor(to, 'creators'));
      assert.equal(swapLocale(routeFor(from, ''), to), routeFor(to, ''));
      // Une adresse inconnue conserve sa forme : on arrive sur la page
      // introuvable de la langue demandée, pas sur son accueil.
      const unknown = swapLocale(`${routeFor(from, '')}rien-du-tout/`, to);
      assert.equal(unknown, `${routeFor(to, '')}rien-du-tout/`);
      assert.deepEqual(splitPath(unknown), { locale: to, slug: 'rien-du-tout' });
    }
});

test('isLocale n’accepte que les langues publiées', () => {
  for (const locale of LOCALES) assert.ok(isLocale(locale));
  for (const value of ['de', 'FR', '', 'fr-CA', 'x-default']) assert.ok(!isLocale(value));
});

test('le sélecteur de langue navigue vraiment, sans routeur client', () => {
  const source = readFileSync('src/components/LanguageSelector.tsx', 'utf8');
  // Le site est un ensemble de documents prérendus : changer de langue est une
  // navigation, pas un changement d'état.
  assert.match(source, /swapLocale/);
  assert.match(source, /window\.location\.assign/);
  // Le fondu ne doit jamais pouvoir retenir le visiteur.
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /setTimeout\(go, \d+\)/, 'un délai de sécurité doit garantir le départ');
  // L'état du menu est exposé comme celui d'un menu natif, pour que
  // l'animation reste écrite en CSS et survive à la réécriture du composant.
  assert.match(source, /data-state=\{open \? 'open' : 'closed'\}/);
  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /role="menuitemradio"/);
  assert.match(source, /aria-checked/);
  // Escape et les flèches : un menu se pilote au clavier.
  assert.match(source, /'Escape'/);
  assert.match(source, /'ArrowDown'/);
});

test('l’animation du sélecteur et le sens de lecture sont tenus par la feuille de style', () => {
  const css = readFileSync('src/styles.css', 'utf8');
  assert.match(css, /@keyframes language-menu-in/);
  assert.match(css, /@keyframes language-menu-out/);
  assert.match(css, /\.language-trigger\[data-state='open'\] \.language-chevron/);
  assert.match(css, /transform: rotate\(180deg\)/);
  // Le passage d'une langue à l'autre s'efface avant de recharger.
  assert.match(css, /html\.language-switching/);
  assert.match(css, /transition: opacity/);
  // Plus aucune propriété physique : les marges suivent le sens de lecture.
  assert.doesNotMatch(
    css,
    /(?<![-\w])(margin|padding|border)-(left|right)\s*:/,
    'une propriété physique casserait la mise en page en écriture arabe ou hébraïque',
  );
  // Et l'animation se tait quand le visiteur demande moins de mouvement.
  assert.match(css, /prefers-reduced-motion[^@]*language-menu/s);
});

test('une écriture de droite à gauche a ses ajustements', () => {
  const css = readFileSync('src/styles.css', 'utf8');
  const rtl = LOCALES.some((l) => localeMeta[l].dir === 'rtl');
  if (!rtl) return;
  assert.match(css, /\[dir='rtl'\]/, 'aucun ajustement pour l’écriture de droite à gauche');
  // Les dégradés de lisibilité sont orientés à la main : ils doivent être inversés.
  assert.match(css, /\[dir='rtl'\] \.hero:after/);
  assert.match(css, /linear-gradient\(\s*270deg/);
});
