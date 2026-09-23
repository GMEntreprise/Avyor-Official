import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/*
 * Les pages de repli d'un lien profond, servies comme en production : le
 * serveur de prévisualisation applique les réécritures de `vercel.json`, donc
 * `/video/<id>/` arrive bien sur la page de la ressource, sans redirection.
 */
test('un lien vers une ressource ouvre une vraie page, pas une page blanche', async ({ page }) => {
  const response = await page.goto('/video/a1b2c3d4/');
  expect(response?.status()).toBe(200);
  // L'adresse ne bouge pas : un lien partagé reste ce lien.
  await expect(page).toHaveURL(/\/video\/a1b2c3d4\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Les deux plateformes sont proposées : c'est la seule action possible ici.
  await expect(page.locator('.store-card').first()).toBeVisible();
  const main = await page.locator('main').innerText();
  expect(main.length).toBeGreaterThan(160);
});

test('une ressource privée ne montre rien d’elle, et le dit', async ({ page }) => {
  await page.goto('/messages/a1b2c3d4/');
  await expect(page.locator('.app-link-private')).toBeVisible();
  const main = await page.locator('main').innerText();
  // Aucun identifiant, aucun nom : connaître l'adresse ne donne aucun accès.
  expect(main).not.toContain('a1b2c3d4');
});

test('un identifiant que l’application refuserait donne une vraie 404', async ({ page }) => {
  const response = await page.goto('/video/%20espace/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('le retour d’authentification n’a ni formulaire ni effet', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const response = await page.goto('/auth/reset-password/?code=abc#access_token=secret');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.locator('form, input').count()).toBe(0);
  // Rien ne part vers un tiers : le jeton reste dans le navigateur.
  const external = requests.filter((url) => !url.startsWith('http://127.0.0.1:4173'));
  expect(external).toEqual([]);
});

test('changer de langue conserve l’identifiant du lien', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'un seul passage suffit');
  await page.goto('/creator/zk39ab/');
  await page.locator('.language-trigger').first().click();
  await page.getByRole('menuitemradio', { name: /English/i }).click();
  await expect(page).toHaveURL(/\/en\/creator\/zk39ab\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('accessibilité et tenue sur petit écran', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/collaboration/a1b2c3d4/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
