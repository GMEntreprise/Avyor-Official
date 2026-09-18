import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LOCALES, DEFAULT_LOCALE, localeMeta, routeFor } from '../../src/i18n/locales';

/** Le sélecteur du header sur grand écran, celui du menu sur petit écran. */
async function openSelector(page: Page) {
  const inHeader = page.locator('.navbar .language-trigger');
  const scope = (await inHeader.isVisible())
    ? page.locator('.navbar .language-selector')
    : (await page.locator('.menu-button').click(), page.locator('.menu-language'));
  const trigger = scope.locator('.language-trigger');
  await trigger.click();
  return { menu: scope.locator('.language-menu'), trigger };
}

test('le menu de langue s’ouvre, s’annonce et se ferme au clavier', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (e) => {
    if (e.type() === 'error') errors.push(e.text());
  });
  await page.goto('/');
  const { menu, trigger } = await openSelector(page);
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute('data-state', 'open');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  // La flèche pivote : c'est l'indice visuel que le menu est ouvert.
  await expect(trigger.locator('.language-chevron')).toHaveCSS(
    'transform',
    'matrix(-1, 0, 0, -1, 0, 0)',
  );
  // Une langue par entrée, nommée dans sa propre écriture, une seule cochée.
  const options = menu.getByRole('menuitemradio');
  await expect(options).toHaveCount(LOCALES.length);
  for (const locale of LOCALES)
    await expect(menu.getByRole('menuitemradio', { name: localeMeta[locale].label })).toBeVisible();
  await expect(menu.locator('[aria-checked="true"]')).toHaveCount(1);
  await expect(menu.locator('[aria-checked="true"]')).toContainText(
    localeMeta[DEFAULT_LOCALE].label,
  );
  // Le clavier suffit : la langue courante a le focus, les flèches circulent.
  await expect(options.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test('choisir une langue mène à la même page, écrite dans cette langue', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (e) => {
    if (e.type() === 'error') errors.push(e.text());
  });
  const target = LOCALES.find((l) => l !== DEFAULT_LOCALE)!;
  await page.goto(routeFor(DEFAULT_LOCALE, 'creators'));
  const { menu } = await openSelector(page);
  await menu.getByRole('menuitemradio', { name: localeMeta[target].label }).click();
  await page.waitForURL(new RegExp(`${routeFor(target, 'creators')}$`));
  // La page d'arrivée est la même, dans la bonne langue et le bon sens de lecture.
  await expect(page.locator('html')).toHaveAttribute('lang', localeMeta[target].tag);
  await expect(page.locator('html')).toHaveAttribute('dir', localeMeta[target].dir);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`${routeFor(target, 'creators')}$`),
  );
  // Et le sélecteur y annonce la langue en cours.
  const { menu: arrived } = await openSelector(page);
  await expect(arrived.locator('[aria-checked="true"]')).toContainText(localeMeta[target].label);
  expect(errors).toEqual([]);
});

test('le retour en arrière ramène à la langue précédente', async ({ page }) => {
  const target = LOCALES.find((l) => l !== DEFAULT_LOCALE)!;
  await page.goto(routeFor(DEFAULT_LOCALE, 'faq'));
  const { menu } = await openSelector(page);
  await menu.getByRole('menuitemradio', { name: localeMeta[target].label }).click();
  await page.waitForURL(new RegExp(`${routeFor(target, 'faq')}$`));
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${routeFor(DEFAULT_LOCALE, 'faq')}$`));
  await expect(page.locator('html')).toHaveAttribute('lang', localeMeta[DEFAULT_LOCALE].tag);
});

test('une adresse inconnue reste dans la langue demandée', async ({ page }) => {
  const target = LOCALES.find((l) => l !== DEFAULT_LOCALE)!;
  await page.goto(`${routeFor(target, '')}page-qui-nexiste-pas/`);
  await expect(page.locator('html')).toHaveAttribute('lang', localeMeta[target].tag);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Le lien de retour mène à l'accueil de cette langue, pas à celui du site.
  await expect(page.locator('.not-found-actions a').first()).toHaveAttribute(
    'href',
    routeFor(target, ''),
  );
});

test('le sélecteur de langue est accessible, ouvert comme fermé', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of LOCALES) {
    await page.goto(routeFor(locale, ''));
    await openSelector(page);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations.map((v) => `${locale} ${v.id}`)).toEqual([]);
  }
});

test('chaque langue sert sa propre page, sans texte resté en français', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'un seul passage suffit');
  const reference = await (await page.request.get(routeFor(DEFAULT_LOCALE, 'creators'))).text();
  const referenceH1 = /<h1>([^<]*)<\/h1>/.exec(reference)?.[1];
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    await page.goto(routeFor(locale, 'creators'));
    const h1 = await page.getByRole('heading', { level: 1 }).textContent();
    expect(h1).not.toEqual(referenceH1);
    expect((h1 ?? '').length).toBeGreaterThan(10);
  }
});

const rtl = LOCALES.filter((locale) => localeMeta[locale].dir === 'rtl');

test('une langue qui se lit de droite à gauche tient sa mise en page', async ({ page }) => {
  test.skip(rtl.length === 0, 'aucune langue de droite à gauche publiée');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of rtl)
    for (const route of ['', 'creators', 'faq', 'privacy']) {
      await page.goto(routeFor(locale, route));
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      // Rien ne dépasse : les marges suivent le sens de lecture.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${routeFor(locale, route)} déborde`).toBeLessThanOrEqual(1);
      // Le texte s'aligne du bon côté.
      const start = await page
        .getByRole('heading', { level: 1 })
        .evaluate((n) => getComputedStyle(n).direction);
      expect(start).toBe('rtl');
    }
});

test('le voile de lisibilité du hero suit le sens de lecture', async ({ page }) => {
  test.skip(rtl.length === 0, 'aucune langue de droite à gauche publiée');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Le dégradé est orienté à la main : en écriture inverse il doit l'être aussi,
  // sinon le titre se retrouve sur la partie claire de l'image.
  await page.goto(routeFor(DEFAULT_LOCALE, ''));
  const ltr = await page
    .locator('.hero')
    .evaluate((n) => getComputedStyle(n, ':after').backgroundImage);
  await page.goto(routeFor(rtl[0], ''));
  const flipped = await page
    .locator('.hero')
    .evaluate((n) => getComputedStyle(n, ':after').backgroundImage);
  expect(ltr).not.toBe(flipped);
  expect(flipped).toContain('270deg');
});

test('le nom de la marque garde son sens de lecture dans toutes les langues', async ({ page }) => {
  for (const locale of LOCALES) {
    await page.goto(routeFor(locale, ''));
    // « avyor. » est un nom latin : le point reste derrière le mot, même en RTL.
    const text = await page
      .locator('.navbar .brand > span')
      .first()
      .evaluate((n) => ({
        dir: getComputedStyle(n).direction,
        content: n.textContent,
      }));
    expect(text.dir, locale).toBe('ltr');
    expect(text.content).toBe('avyor.');
  }
});

test('chaque langue est annoncée par son drapeau', async ({ page }) => {
  await page.goto(routeFor(DEFAULT_LOCALE, ''));
  const { menu, trigger } = await openSelector(page);
  // Le drapeau dit la langue, dans la barre comme dans le menu. Il est servi
  // en fichier : le dessin ne voyage pas dans le JavaScript.
  await expect(trigger.locator('img.language-flag')).toHaveAttribute(
    'src',
    /\/assets\/flag-fr-[A-Za-z0-9_-]+\.svg$/,
  );
  const flags = menu.locator('img.language-flag');
  await expect(flags).toHaveCount(LOCALES.length);
  const sources = await flags.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('src')));
  expect(new Set(sources).size).toBe(LOCALES.length);
  for (const src of sources) expect(src).toMatch(/\/assets\/flag-[a-z]{2}-[A-Za-z0-9_-]+\.svg$/);
});
