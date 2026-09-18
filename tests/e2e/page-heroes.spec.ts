import { test, expect } from '@playwright/test';

const routes = ['creators', 'brands', 'features'] as const;

for (const slug of routes) {
  test(`${slug} : arrière-plan dédié, lecture et pause accessibles`, async ({ page }, info) => {
    const errors: string[] = [];
    const clips: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.url().includes('.mp4')) clips.push(request.url());
    });
    await page.goto(`/${slug}/`);
    const hero = page.locator(`[data-page-hero="${slug}"]`);
    await expect(hero).toBeVisible();
    const poster = hero.locator('picture img');
    await expect(poster).toBeVisible();
    await expect(poster).toHaveAttribute('src', new RegExp(`${slug}-desktop-.*\\.webp`));
    await expect(hero.locator('h1')).toHaveCount(1);
    const video = hero.locator('video');
    await expect(video).toHaveAttribute('src', new RegExp(`${slug}-${info.project.name}-.*\\.mp4`));
    await expect
      .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
      .toBeGreaterThan(0);
    const pause = hero.getByRole('button', { name: 'Mettre l’arrière-plan en pause' });
    await pause.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
    await expect(hero.getByRole('button', { name: 'Lire l’arrière-plan' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
    expect(clips.every((url) => url.includes(`${slug}-${info.project.name}-`))).toBe(true);
    expect(errors).toEqual([]);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: `docs/site/screenshots/${info.project.name}-${slug}-cinematic.png`,
    });
  });

  test(`${slug} : reduced motion garde le poster sans télécharger la vidéo`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const clips: string[] = [];
    page.on('request', (r) => {
      if (r.url().includes('.mp4')) clips.push(r.url());
    });
    await page.goto(`/${slug}/`);
    const hero = page.locator(`[data-page-hero="${slug}"]`);
    await expect(hero.locator('picture img')).toBeVisible();
    await expect(hero.locator('video')).not.toHaveAttribute('src');
    await expect(hero.locator('video')).not.toBeVisible();
    await expect(hero.locator('h1')).toBeVisible();
    expect(clips).toEqual([]);
  });
}

test('le téléchargement et les pages juridiques ne chargent pas ces fonds', async ({ page }) => {
  for (const slug of ['download', 'privacy', 'terms', 'legal']) {
    await page.goto(`/${slug}/`);
    await expect(page.locator('[data-page-hero]')).toHaveCount(0);
  }
});

test('économie de données et échec vidéo conservent un Hero lisible', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    });
  });
  await page.goto('/creators/');
  const hero = page.locator('[data-page-hero="creators"]');
  await expect(hero.locator('video')).not.toHaveAttribute('src');
  await expect(hero.locator('picture img')).toBeVisible();
  await page.route('**/*.mp4', (route) => route.abort());
  await hero.getByRole('button', { name: 'Lire l’arrière-plan' }).click();
  await expect(hero.locator('picture img')).toBeVisible();
  await expect(hero.locator('h1')).toBeVisible();
});

test('les trois posters et CTA restent accessibles sans JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const slug of routes) {
    await page.goto(`http://127.0.0.1:4173/${slug}/`);
    const hero = page.locator(`[data-page-hero="${slug}"]`);
    await expect(hero.locator('picture img')).toBeVisible();
    await expect(hero.getByRole('link', { name: /Découvrir AVYOR/ })).toBeVisible();
  }
  await context.close();
});

test('le fond se met en pause hors écran sans annuler une pause manuelle', async ({ page }) => {
  await page.goto('/creators/');
  const hero = page.locator('[data-page-hero="creators"]');
  const video = hero.locator('video');
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await hero.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await hero.getByRole('button', { name: 'Mettre l’arrière-plan en pause' }).click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await hero.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).not.toBeVisible();
  await expect(hero.locator('picture img')).toBeVisible();
});

test('les trois Heroes restent contenus de 320 à 1440 pixels', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of routes) {
      await page.goto(`/${slug}/`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      expect(
        await page
          .locator('[data-page-hero] picture img')
          .evaluate((el: HTMLImageElement) => el.currentSrc),
      ).toContain(`${slug}-${width <= 700 ? 'mobile' : 'desktop'}-`);
    }
  }
});

test('activer reduced motion pendant la lecture arrête et libère le média', async ({ page }) => {
  await page.goto('/creators/');
  const video = page.locator('[data-page-hero] video');
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);
  await expect(video).not.toHaveAttribute('src');
});
