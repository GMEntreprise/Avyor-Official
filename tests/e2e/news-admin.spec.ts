import { test, expect, type Page } from '@playwright/test';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { rmSync } from 'node:fs';
import sharp from 'sharp';

/*
 * Le parcours complet d'un article, de l'admin au lecteur :
 * créer → mettre en forme → enregistrer → recharger → prévisualiser → publier
 * → ouvrir sans session → sommaire → recherche → changer l'adresse → dépublier.
 *
 * L'admin tourne sur un bac à sable jetable (NEWS_ROOT=.news-e2e, voir
 * playwright.config.ts) : ce test publie, mais jamais dans le vrai contenu.
 */
const ADMIN = 'http://127.0.0.1:5181/admin/';
const PUBLIC = 'http://127.0.0.1:4176';
const ROOT = '.news-e2e';

test.describe.configure({ mode: 'serial' });
test.beforeEach(() => {
  test.skip(test.info().project.name !== 'desktop', 'un seul passage suffit');
});

let server: ChildProcess | null = null;

// Le bac à sable repart vide : le serveur de développement, lui, persiste
// d'une exécution à l'autre.
test.beforeAll(() => {
  for (const dir of ['news', 'drafts', 'media', 'site'])
    rmSync(`${ROOT}/${dir}`, { recursive: true, force: true });
  rmSync(`${ROOT}/vercel.json`, { force: true });
});

/** Rebuilds the public site from the sandbox, as a deployment would. */
async function deploy() {
  execFileSync('node', ['scripts/news-build-sandbox.mjs', ROOT], { stdio: 'ignore' });
  if (server) return;
  server = spawn('node', ['scripts/serve.mjs'], {
    env: {
      ...process.env,
      SERVE_DIR: `${ROOT}/site`,
      REDIRECTS_FILE: `${ROOT}/vercel.json`,
      PORT: '4176',
    },
    stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(PUBLIC);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

test.afterAll(() => {
  server?.kill();
});

async function field(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).fill(value);
}

test('parcours complet : de l’admin au lecteur, puis retour', async ({ page, browser }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (dialog) =>
    dialog.accept(dialog.message().startsWith('Adresse du lien') ? '/brands/' : undefined),
  );

  /* ---- Créer et mettre en forme ---------------------------------------- */
  await page.goto(ADMIN);
  await page.getByRole('button', { name: 'Nouvel article' }).click();
  await field(page, 'Titre', 'Préparer un tournage : la liste complète');
  await page.getByRole('button', { name: 'Depuis le titre' }).click();
  await expect(page.getByLabel('Slug (adresse)', { exact: true })).toHaveValue(
    'preparer-un-tournage-la-liste-complete',
  );
  await field(page, 'Extrait', 'Un extrait de test qui dit ce que l’article apporte au lecteur.');

  const editor = page.locator('.admin-editor-surface');
  await editor.click();
  await page.getByRole('button', { name: 'Titre de section (H2)' }).click();
  await page.keyboard.type('Avant le tournage');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Pensez au ');
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.type('son');
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.type(' et à la ');
  await page.keyboard.press('ControlOrMeta+i');
  await page.keyboard.type('lumière');
  await page.keyboard.press('ControlOrMeta+i');
  await page.keyboard.type(', puis lisez le ');
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.press('ControlOrMeta+i');
  await page.keyboard.type('brief');
  await page.keyboard.press('ControlOrMeta+i');
  await page.keyboard.press('ControlOrMeta+b');
  await page.keyboard.type(' de la marque');
  // Un lien sur le dernier mot : sélection au clavier, puis Ctrl/Cmd + K.
  for (let i = 0; i < 6; i++) await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('ControlOrMeta+k');
  await expect(editor.locator('a[href="/brands/"]')).toHaveText('marque');
  // Le curseur est laissé après le lien : « Entrée » ouvre un paragraphe.
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Liste numérotée' }).click();
  await page.keyboard.type('Charger la batterie');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Nettoyer l’objectif');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Titre de section (H2)' }).click();
  await page.keyboard.type('Pendant le tournage');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Filmez plusieurs prises de chaque plan, dont une ZYGOTEST.');

  // Image principale : un vrai PNG, envoyé au stockage des médias.
  const png = await sharp({ create: { width: 64, height: 36, channels: 3, background: '#3a2a9e' } })
    .png()
    .toBuffer();
  await page.locator('.admin-image input[type="file"]').first().setInputFiles({
    name: 'couverture.png',
    mimeType: 'image/png',
    buffer: png,
  });
  await expect(page.locator('.admin-image img').first()).toBeVisible();
  await page.getByLabel('Texte alternatif (obligatoire)').fill('Un décor de tournage violet');
  await field(page, 'Libellé du bouton', 'Découvrir le parcours Creator');
  await page.getByLabel('Page de destination').selectOption('creators');
  await field(page, 'Titre SEO', 'Préparer un tournage | AVYOR');
  await page
    .getByLabel('Description', { exact: true })
    .fill('Description de test pour le référencement.');

  /* ---- Enregistrer, recharger : la mise en forme est intacte ------------ */
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).click();
  await expect(page.getByText(/Brouillon enregistré/)).toBeVisible();
  await page.reload();
  await expect(editor.locator('h2')).toHaveCount(2);
  await expect(editor.locator('strong', { hasText: 'son' })).toBeVisible();
  await expect(editor.locator('em', { hasText: 'lumière' })).toBeVisible();
  await expect(editor.locator('strong em, em strong').filter({ hasText: 'brief' })).toBeVisible();
  await expect(editor.locator('a[href="/brands/"]')).toHaveText('marque');
  await expect(editor.locator('ol > li')).toHaveCount(2);

  /* ---- Aperçu : les mêmes ancres que le site public --------------------- */
  await page.getByRole('button', { name: 'Prévisualiser' }).click();
  const preview = page.locator('.admin-preview');
  await expect(preview.locator('.article-toc-desktop a')).toHaveCount(2);
  await expect(preview.locator('h2#avant-le-tournage')).toBeVisible();

  /* ---- Un brouillon n'est pas public ------------------------------------ */
  await deploy();
  const slug = 'preparer-un-tournage-la-liste-complete';
  expect((await page.request.get(`${PUBLIC}/news/${slug}/`)).status()).toBe(404);

  /* ---- Publier ---------------------------------------------------------- */
  await page.getByRole('button', { name: 'Revenir à l’édition' }).click();
  await page.getByRole('button', { name: 'Publier', exact: true }).click();
  await expect(page.getByText(/Publié dans content\/news/)).toBeVisible();
  await deploy();

  /* ---- Lire sans session ------------------------------------------------ */
  const visitor = await (await browser.newContext()).newPage();
  const response = await visitor.goto(`${PUBLIC}/news/${slug}/`);
  expect(response?.status()).toBe(200);
  await expect(visitor.getByRole('heading', { level: 1 })).toHaveText(
    'Préparer un tournage : la liste complète',
  );
  await expect(visitor.locator('.article-body strong', { hasText: 'son' })).toBeVisible();
  await visitor
    .locator('.article-toc-desktop')
    .getByRole('link', { name: 'Pendant le tournage' })
    .click();
  await expect(visitor).toHaveURL(/#pendant-le-tournage$/);
  await expect(visitor.locator('#pendant-le-tournage')).toBeFocused();
  // Retrouvé par la recherche, sur son contenu.
  await visitor.goto(`${PUBLIC}/news/?q=zygotest`);
  await expect(visitor.locator('.news-card-link')).toHaveText(
    'Préparer un tournage : la liste complète',
  );

  /* ---- Modifier sans publier : rien ne fuit ------------------------------ */
  await field(page, 'Titre', 'Titre en travaux, pas encore publié');
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).click();
  await expect(page.getByText(/Brouillon enregistré/)).toBeVisible();
  await deploy();
  await visitor.goto(`${PUBLIC}/news/${slug}/`);
  await expect(visitor.getByRole('heading', { level: 1 })).toHaveText(
    'Préparer un tournage : la liste complète',
  );

  /* ---- Changer l'adresse : l'ancienne redirige ---------------------------- */
  await field(page, 'Titre', 'Préparer un tournage : la liste complète');
  await field(page, 'Slug (adresse)', 'preparer-un-tournage');
  await page.getByRole('button', { name: 'Publier les modifications' }).click();
  await expect(page.getByText(/Publié dans content\/news/)).toBeVisible();
  await deploy();
  const moved = await page.request.get(`${PUBLIC}/news/${slug}/`, { maxRedirects: 0 });
  expect(moved.status()).toBe(308);
  expect(moved.headers().location).toBe('/news/preparer-un-tournage/');
  await visitor.goto(`${PUBLIC}/news/preparer-un-tournage/`);
  // L'ancre publiée a survécu à l'enregistrement : un lien partagé mène toujours à la section.
  await visitor.goto(`${PUBLIC}/news/preparer-un-tournage/#pendant-le-tournage`);
  await expect(visitor.locator('#pendant-le-tournage')).toBeInViewport();

  /* ---- Dépublier : retiré de partout ------------------------------------- */
  // La confirmation est acceptée par le gestionnaire de dialogues du test.
  await page.getByRole('button', { name: 'Dépublier' }).click();
  await expect(page.getByText(/Dépublié/)).toBeVisible();
  await deploy();
  expect((await page.request.get(`${PUBLIC}/news/preparer-un-tournage/`)).status()).toBe(404);
  const sitemap = await (await page.request.get(`${PUBLIC}/sitemap.xml`)).text();
  expect(sitemap).not.toContain('preparer-un-tournage');
  expect((await page.request.get(`${PUBLIC}/news/`)).status()).toBe(404);

  expect(errors).toEqual([]);
});

test('une mutation sans la session de l’admin est refusée', async ({ request }) => {
  const response = await request.post('http://127.0.0.1:5181/__news/api/articles', {
    data: { id: 'intrus000001', locale: 'fr' },
  });
  expect(response.status()).toBe(403);
});
