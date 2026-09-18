import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/*
 * Le parcours public de News, sur le site de test (scripts/news-fixture-site.mjs) :
 * le vrai build, avec des articles de test publiés. Rien de réel n'est publié.
 */
const SITE = 'http://127.0.0.1:4175';
const ARTICLE = `${SITE}/news/brief-ugc-quoi-preciser/`;
const TOC_ARTICLE = `${SITE}/news/article-test-sommaire/`;

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

test('un article publié s’ouvre par URL directe, puis au rechargement', async ({ page }) => {
  const errors = watchErrors(page);
  const response = await page.goto(ARTICLE);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Brief UGC : quoi préciser pour éviter les allers-retours',
  );
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('le corps de l’article est lisible sans JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(ARTICLE);
  await expect(page.locator('.article-body strong').first()).toBeVisible();
  await expect(page.locator('.article-body table')).toBeVisible();
  await context.close();
});

test('une adresse inconnue répond une vraie 404, pas l’accueil', async ({ page }) => {
  const response = await page.goto(`${SITE}/news/article-qui-n-existe-pas/`);
  expect(response?.status()).toBe(404);
  await expect(page.locator('.not-found')).toBeVisible();
});

test('l’ancienne adresse d’un article renommé redirige vers la nouvelle', async ({ page }) => {
  const response = await page.request.get(`${SITE}/news/ancienne-adresse/`, { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe('/news/nouvelle-adresse/');
  await page.goto(`${SITE}/news/ancienne-adresse/`);
  await expect(page).toHaveURL(`${SITE}/news/nouvelle-adresse/`);
});

test('le sommaire mène à la section, déplace le focus et met l’adresse à jour', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'sommaire latéral : grand écran');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(TOC_ARTICLE);
  const toc = page.locator('.article-toc-desktop');
  await expect(toc).toBeVisible();
  await toc.getByRole('link', { name: 'Le brief en trois temps' }).click();
  await expect(page).toHaveURL(/#le-brief-en-trois-temps$/);
  const heading = page.locator('#le-brief-en-trois-temps');
  await expect(heading).toBeFocused();
  // Le titre n'est pas caché sous l'en-tête fixe.
  const top = await heading.evaluate((n) => n.getBoundingClientRect().top);
  const header = await page.locator('.navbar').evaluate((n) => n.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(header);
  // L'entrée correspondante devient l'entrée active.
  await expect(toc.locator('a[aria-current="true"]')).toHaveText('Le brief en trois temps');
});

test('le sommaire reste visible pendant la lecture', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'sommaire latéral : grand écran');
  await page.goto(TOC_ARTICLE);
  await page.mouse.wheel(0, 2400);
  await page.waitForTimeout(200);
  await expect(page.locator('.article-toc-desktop')).toBeInViewport();
});

test('une URL avec ancre ouvre directement la section, sous l’en-tête', async ({ page }) => {
  await page.goto(`${TOC_ARTICLE}#exemple-2`);
  const heading = page.locator('#exemple-2');
  await expect(heading).toBeInViewport();
  const top = await heading.evaluate((n) => n.getBoundingClientRect().top);
  const header = await page.locator('.navbar').evaluate((n) => n.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(header - 1);
});

test('sur mobile, « Dans cet article » se replie et s’ouvre au clavier', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto(TOC_ARTICLE);
  const summary = page.locator('.article-toc-mobile summary');
  await expect(summary).toHaveText('Dans cet article');
  await expect(page.locator('.article-toc-desktop')).toBeHidden();
  // Placé avant le corps : on choisit sa section avant de lire.
  const before = await page.evaluate(
    () =>
      document.querySelector('.article-toc-mobile')!.getBoundingClientRect().top <
      document.querySelector('.article-body')!.getBoundingClientRect().top,
  );
  expect(before).toBe(true);
  await summary.focus();
  await page.keyboard.press('Enter');
  await page.locator('.article-toc-mobile').getByRole('link', { name: 'Fin' }).click();
  await expect(page).toHaveURL(/#fin$/);
  await expect(page.locator('.article-toc-mobile')).not.toHaveAttribute('open', '');
});

test('la recherche couvre tout le corpus publié, sans accents ni casse', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(`${SITE}/news/`);
  await page.getByLabel('Rechercher un article').fill('ZYGOMATIQUE');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  // Le mot n'est sur aucune carte de la première page : il vient du corpus entier.
  await expect(page.getByRole('status')).toHaveText('1 article');
  await expect(page.locator('.news-card-link')).toHaveText('Article de test numéro 7');
  await expect(page).toHaveURL(/\?q=ZYGOMATIQUE$/);
  // Sans accents, « ete premiere » trouve « Été : première partie ».
  await page.getByLabel('Rechercher un article').fill('ete premiere');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(
    page.locator('.news-card-link', { hasText: 'Été, œuvre et « titres »' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('un filtre revient en première page et survit au rechargement et au retour', async ({
  page,
}) => {
  await page.goto(`${SITE}/news/?q=article&page=2`);
  await expect(page.locator('.news-pagination [aria-current]')).toContainText('2');
  await page.getByLabel('Thématique').selectOption('measure');
  await expect(page).toHaveURL(/theme=measure/);
  await expect(page).not.toHaveURL(/page=/);
  const count = await page.locator('.news-card').count();
  await page.reload();
  await expect(page.locator('.news-card')).toHaveCount(count);
  await expect(page.getByLabel('Thématique')).toHaveValue('measure');
  await page.goBack();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByLabel('Thématique')).toHaveValue('');
});

test('aucun résultat : un message clair et un moyen d’en sortir', async ({ page }) => {
  await page.goto(`${SITE}/news/?q=motintrouvablexyz`);
  await expect(page.getByText('Aucun article ne correspond')).toBeVisible();
  await page.getByRole('button', { name: 'Effacer la recherche et les filtres' }).click();
  await expect(page).toHaveURL(`${SITE}/news/`);
  await expect(page.locator('.news-card').first()).toBeVisible();
});

test('une erreur de chargement se dit, et se rattrape', async ({ page }) => {
  let fail = true;
  await page.route('**/news/search.json', (route) =>
    fail ? route.fulfill({ status: 503, body: '' }) : route.continue(),
  );
  await page.goto(`${SITE}/news/?q=brief`);
  await expect(page.getByRole('alert')).toContainText('n’ont pas pu être chargés');
  fail = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.getByRole('status')).toContainText('article');
});

test('la dernière recherche l’emporte, même tapée pendant le chargement', async ({ page }) => {
  // Le corpus arrive lentement ; la personne change d'avis entre-temps.
  await page.route('**/news/search.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    await route.continue();
  });
  await page.goto(`${SITE}/news/`);
  const field = page.getByLabel('Rechercher un article');
  await field.fill('zygomatique');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await field.fill('numéro 12');
  await page.getByRole('button', { name: 'Rechercher' }).click();
  await expect(page.getByRole('status')).toHaveText('1 article');
  await expect(page.locator('.news-card-link')).toHaveText('Article de test numéro 12');
  await expect(page).toHaveURL(/q=num%C3%A9ro\+12/);
});

test('la pagination suit de vraies adresses et garde la thématique hors du lien de carte', async ({
  page,
}) => {
  await page.goto(`${SITE}/news/`);
  await page.getByRole('link', { name: /Page suivante/ }).click();
  await expect(page).toHaveURL(`${SITE}/news/page/2/`);
  // Cliquer la thématique d'une carte filtre la liste, sans ouvrir l'article.
  const card = page.locator('.news-card').first();
  const theme = await card.locator('.news-card-theme').getAttribute('href');
  await card.locator('.news-card-theme').click();
  await expect(page).toHaveURL(`${SITE}${theme}`);
});

test('le clavier suffit pour parcourir la liste', async ({ page }) => {
  await page.goto(`${SITE}/news/`);
  await page.locator('.news-card-link').first().focus();
  await expect(page.locator('.news-card').first()).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/news\/[a-z0-9-]+\/$/);
});

for (const url of ['/news/', '/news/brief-ugc-quoi-preciser/', '/news/article-test-sommaire/'])
  test(`accessibilité et absence de débordement ${url}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${SITE}${url}`);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations.map((v) => `${v.id} : ${v.nodes.length}`)).toEqual([]);
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${url} à ${width}px`).toBeLessThanOrEqual(1);
    }
  });

test('un tableau large défile dans son cadre, pas la page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(TOC_ARTICLE);
  const frame = page.locator('.article-table');
  const scrolls = await frame.evaluate((n) => n.scrollWidth > n.clientWidth);
  expect(scrolls).toBe(true);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
