import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('accueil, hydratation, FAQ, parcours et liens', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (e) => {
    if (e.type() === 'error') errors.push(e.text());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Le bon Creator. La bonne campagne.',
  );
  await page.getByRole('tab', { name: 'Je suis une marque' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Posez votre brief.');
  await page.getByRole('tab', { name: 'Je suis Creator' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Je suis une marque' })).toBeFocused();
  await page.getByText('Comment fonctionne le matching ?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('raisons de la compatibilité');
  const gallery = page.getByRole('region', { name: /Captures de l’application/ });
  await gallery.focus();
  const before = await gallery.evaluate((el) => el.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => gallery.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  await page.getByRole('link', { name: 'Découvrir le parcours Creator' }).click();
  await expect(page).toHaveURL(/\/creators\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Votre travail');
  await page.goto('/brands/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Le bon regard');
  await page.goto('/download/');
  await expect(page.locator('main')).toContainText('Bientôt disponible');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  // Store identity comes from the official badges, never a generic device icon.
  const cards = page.locator('main .store-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveClass(/store-card-ios/);
  await expect(cards.nth(1)).toHaveClass(/store-card-android/);
  await expect(cards.nth(0).locator('.store-label strong')).toHaveText('App Store');
  await expect(cards.nth(1).locator('.store-label strong')).toHaveText('Google Play');
  // An unpublished store is not a link: there is nothing to click.
  await expect(page.locator('main .store-card.is-pending a')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(info.project.name).toBeTruthy();
});
test('le CTA de téléchargement est distinct et mène à une vraie route', async ({ page }, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'sur petit écran la barre porte le sélecteur de langue, et le menu porte les deux plateformes',
  );
  await page.goto('/');
  const cta = page.locator('header .download-cta');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/download/');
  // It must already read as the primary action before any hover.
  const filled = await cta
    .locator('.hbg-content')
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(filled).toContain('gradient');
  await cta.focus();
  await expect(cta).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/download\/$/);
});

test('menu mobile accessible et restauration du focus', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Ouvrir le menu' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole('navigation', { name: 'Navigation mobile' })
    .getByRole('link', { name: /Marques/ })
    .click();
  await expect(page).toHaveURL(/\/brands\/$/);
});

test('la barre mobile porte la langue, le menu porte les deux plateformes', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  // À cette largeur, l'appel générique laisse la place à ce qui n'existe
  // nulle part ailleurs dans la barre : le choix de la langue.
  await expect(page.locator('header .download-cta')).toBeHidden();
  await expect(page.locator('header .nav-language .language-trigger')).toBeVisible();
  await page.locator('.menu-button').click();
  const dialog = page.getByRole('dialog');
  const cards = dialog.locator('.store-card');
  await expect(cards).toHaveCount(2);
  // Une plateforme non publiée reste inerte, jusque dans le menu.
  await expect(dialog.locator('.store-card.is-pending a')).toHaveCount(0);
  const panel = await dialog.boundingBox();
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box.width).toBeGreaterThan(panel.width * 0.6);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  // Et le panneau défile : il porte maintenant la navigation, la langue et les
  // deux plateformes.
  const scrolls = await dialog.evaluate((n) => ({
    overflow: getComputedStyle(n).overflowY,
    reachesBottom: n.scrollHeight <= n.clientHeight || n.scrollHeight > n.clientHeight,
  }));
  expect(scrolls.overflow).toBe('auto');
  await dialog.evaluate((n) => n.scrollTo(0, n.scrollHeight));
  const scrolled = await dialog.evaluate((n) => n.scrollTop + n.clientHeight >= n.scrollHeight - 2);
  expect(scrolled).toBe(true);
});
test('reduced motion, absence de vidéo auto et intro non bloquante', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero video')).not.toBeVisible();
  await expect(page.locator('.hero video')).not.toHaveAttribute('src');
  await page
    .locator('.hero')
    .getByRole('link', { name: /Télécharger l’app/ })
    .click();
  await expect(page).toHaveURL(/\/download\/$/);
});
test('l’intro joue dès la première arrivée, même à froid', async ({ page }) => {
  // La régression : elle ne jouait qu'au rechargement, parce qu'elle attendait
  // l'hydratation — le moment le plus lent de la toute première visite.
  const client = await page.context().newCDPSession(page);
  await client.send('Network.clearBrowserCache');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (700 * 1024) / 8,
    uploadThroughput: (300 * 1024) / 8,
  });
  await page.goto('/', { waitUntil: 'commit' });
  const intro = page.locator('.intro');
  // Visible dès que la feuille de style s'applique, sans attendre le bundle.
  await expect(intro).toBeVisible({ timeout: 15000 });
  // Puis elle s'efface d'elle-même et rend la main.
  await expect(intro).toBeHidden({ timeout: 6000 });
  expect(
    await page.evaluate(() => document.elementFromPoint(50, 300)?.closest('.intro') === null),
  ).toBe(true);
});

test('l’intro ne se rejoue pas pendant la session', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro')).toHaveCount(1);
  await page.goto('/creators/');
  await expect(page.locator('.intro')).toHaveCount(0);
  await page.goto('/');
  // Servie dans le HTML, mais neutralisée avant peinture par le garde de session.
  await expect(page.locator('.intro')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro-seen'))).toBe(
    true,
  );
});

test('l’intro est absente en reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('.intro')!).display),
  ).toBe('none');
});

test('l’apparition au scroll : rien ne clignote, rien ne reste caché', async ({ page }) => {
  await page.goto('/creators/');
  // Whatever is on screen at load must never have been hidden, whatever the viewport.
  const hiddenInView = () =>
    page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal')].filter((el) => {
          const box = el.getBoundingClientRect();
          const onScreen = box.top < innerHeight && box.bottom > 0;
          return onScreen && getComputedStyle(el).opacity !== '1';
        }).length,
    );
  expect(await hiddenInView()).toBe(0);
  // Blocks further down reveal as they are reached, and stay revealed.
  const below = page.locator('.page-sections .reveal').nth(6);
  await below.scrollIntoViewIfNeeded();
  await expect(below).toBeVisible();
  await expect.poll(() => below.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  // Every revealed block ends up visible, none is stranded.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.querySelectorAll('.reveal')].filter(
            (el) => getComputedStyle(el).opacity !== '1',
          ).length,
      ),
    )
    .toBe(0);
});

test('reduced motion : aucun bloc n’est masqué en attendant une animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/features/');
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal')].filter(
          (el) => getComputedStyle(el).opacity !== '1',
        ).length,
    ),
  ).toBe(0);
});

test('404 : la page propose la page visée par une faute de frappe', async ({ page }) => {
  // Servie pour une adresse inconnue, pré-rendue pour une autre : le chemin
  // demandé ne doit apparaître qu'après montage, sans casser l'hydratation.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (e) => {
    if (/hydrat|did not match/i.test(e.text())) errors.push(e.text());
  });
  const response = await page.goto('/creatrs/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('plus dans le cadre');
  await expect(page.locator('.not-found-lead code')).toHaveText('/creatrs/');
  const suggestion = page.locator('.not-found-suggestion');
  await expect(suggestion).toContainText('Creators');
  await expect(suggestion).toHaveAttribute('href', '/creators/');
  await suggestion.click();
  await expect(page).toHaveURL(/\/creators\/$/);
  expect(errors).toEqual([]);
});

test('404 : le nom français d’une page suffit à la retrouver', async ({ page }) => {
  await page.goto('/marques/');
  await expect(page.locator('.not-found-suggestion')).toHaveAttribute('href', '/brands/');
});

test('404 : rien de proche, aucune devinette, mais des destinations utiles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/wp-admin/');
  await expect(page.locator('.not-found-suggestion')).toHaveCount(0);
  const destinations = page
    .getByRole('navigation', { name: 'Pages principales' })
    .getByRole('link');
  await expect(destinations).toHaveCount(6);
  for (const link of await destinations.all())
    expect(await link.getAttribute('href')).toMatch(/^\/[a-z-]+\/$/);
  await expect(page.getByRole('link', { name: /Revenir à l’accueil/ })).toHaveAttribute(
    'href',
    '/',
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('HTML sans JavaScript et vraie réponse 404', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/creators/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('main')).toContainText('portfolio');
  // Without JavaScript the reveal animation must leave everything readable.
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal')].filter(
          (el) => getComputedStyle(el).opacity !== '1',
        ).length,
    ),
  ).toBe(0);
  const missing = await request.get('/page-inexistante/');
  expect(missing.status()).toBe(404);
  await context.close();
});
test('pages légales : structure, sommaire et accessibilité', async ({ page }) => {
  // The legal text loads as its own chunk: hydration must still line up exactly.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (e) => {
    if (e.type() === 'error' || /hydrat/i.test(e.text())) errors.push(e.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/privacy/', '/terms/', '/legal/']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('main')).toContainText('Dernière mise à jour');
    const toc = page.getByRole('navigation', { name: 'Sur cette page' });
    await expect(toc).toBeVisible();
    const violations = (
      await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    ).violations;
    expect(violations).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    // The document is interactive, not just painted: the chunk resolved.
    await expect(
      page.locator('.legal-toc-desktop a[aria-current], .legal-toc-mobile'),
    ).not.toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('pages légales : ancres profondes et sommaire actif', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // A deep link still lands on its section after a full reload.
  await page.goto('/privacy/#supprimer-mon-compte');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.getElementById('supprimer-mon-compte');
        return el ? Math.round(el.getBoundingClientRect().top) : -1;
      }),
    )
    .toBeLessThan(200);
  // The table of contents follows the reading position, and is reachable by keyboard.
  await expect
    .poll(() => page.locator('.legal-toc-desktop a[aria-current]').first().textContent())
    .toContain('Supprimer mon compte');
  const entry = page.locator('.legal-toc-desktop a').nth(3);
  await entry.focus();
  await expect(entry).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#donnees-fournies$/);
});

const allRoutes = [
  '/',
  '/creators/',
  '/brands/',
  '/features/',
  '/how-it-works/',
  '/security/',
  '/faq/',
  '/download/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/legal/',
];

test('accessibilité de toutes les routes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of allRoutes) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(violations.map((v) => `${route} ${v.id}`)).toEqual([]);
  }
});

test('aucun débordement horizontal, de l’iPhone SE au grand écran', async ({ page }, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'un seul passage suffit : les tailles sont pilotées ici',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of allRoutes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} déborde de ${overflow}px à ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test('les cibles tactiles du header restent atteignables sur petit écran', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/');
  for (const name of ['Ouvrir le menu']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(box.width).toBeGreaterThanOrEqual(40);
  }
  const language = await page.locator('header .nav-language .language-trigger').boundingBox();
  expect(language.height).toBeGreaterThanOrEqual(40);
  expect(language.width).toBeGreaterThanOrEqual(40);
});

for (const route of ['/', '/creators/', '/brands/'])
  test(`accessibilité, débordement et capture ${route}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    for (const image of await page.locator('main img, footer img').all()) {
      if (await image.isVisible()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (el) =>
                (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `docs/site/screenshots/${info.project.name}-${route.replaceAll('/', '') || 'home'}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `docs/site/screenshots/${info.project.name}-${route.replaceAll('/', '') || 'home'}-viewport.png`,
    });
  });
