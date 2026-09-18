import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createDraft,
  saveDraft,
  publish,
  unpublish,
  archive,
  duplicate,
  listPublished,
  listDrafts,
  readArticle,
  syncRedirects,
  saveMedia,
  ConflictError,
  ValidationFailed,
} from '../../src/news/store.server.ts';

/** A throwaway content tree, so no test ever touches the real articles. */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'avyor-news-'));
  const paths = {
    published: join(root, 'news'),
    drafts: join(root, 'drafts'),
    media: join(root, 'media'),
    vercel: join(root, 'vercel.json'),
  };
  mkdirSync(paths.published);
  mkdirSync(paths.drafts);
  mkdirSync(paths.media);
  // The cover every test article points at: publication checks it exists.
  writeFileSync(join(paths.media, 'cover-0123abcd.webp'), '');
  writeFileSync(
    paths.vercel,
    JSON.stringify({
      redirects: [{ source: '/marques/', destination: '/brands/', permanent: true }],
    }),
  );
  return paths;
}

const NOW = new Date('2026-09-18T10:00:00Z');

/** Fills a fresh draft with everything publication requires. */
async function ready(paths, id, overrides = {}) {
  const draft = await createDraft(paths, { id, locale: 'fr' });
  return saveDraft(
    paths,
    {
      ...draft,
      title: 'Un titre éditorial',
      slug: `slug-${id}`,
      excerpt: 'Un extrait utile qui dit ce que le lecteur va apprendre.',
      cover: {
        src: '/news/media/cover-0123abcd.webp',
        width: 1600,
        height: 900,
        alt: 'Illustration',
      },
      cta: { label: 'Découvrir le parcours marque', slug: 'brands' },
      seo: { title: 'Titre SEO', description: 'Description SEO utile.', noindex: false },
      body: {
        type: 'doc',
        content: [
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Partie' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Texte publié.' }] },
        ],
      },
      ...overrides,
    },
    draft.revision,
  );
}

test('un nouvel article naît brouillon et n’existe pas côté public', async () => {
  const paths = sandbox();
  await createDraft(paths, { id: 'aaaa1111', locale: 'fr' });
  assert.equal(listDrafts(paths).length, 1);
  assert.equal(listPublished(paths).length, 0);
  assert.equal(readdirSync(paths.published).length, 0);
});

test('créer deux fois le même article ne produit qu’un brouillon', async () => {
  const paths = sandbox();
  const [a, b] = await Promise.all([
    createDraft(paths, { id: 'aaaa1111', locale: 'fr' }),
    createDraft(paths, { id: 'aaaa1111', locale: 'fr' }),
  ]);
  assert.equal(a.id, b.id);
  assert.equal(listDrafts(paths).length, 1);
});

test('la mise en forme survit à l’enregistrement puis à la relecture', async () => {
  const paths = sandbox();
  const draft = await createDraft(paths, { id: 'aaaa1111', locale: 'fr' });
  const body = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'gras', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' et ' },
          { type: 'text', text: 'les deux', marks: [{ type: 'bold' }, { type: 'italic' }] },
          { type: 'text', text: ' lien', marks: [{ type: 'link', attrs: { href: '/brands/' } }] },
        ],
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'un' }] }],
          },
        ],
      },
    ],
  };
  await saveDraft(paths, { ...draft, body }, draft.revision);
  assert.deepEqual(readArticle(paths, 'aaaa1111').draft.body, body);
});

test('une sauvegarde partie d’une version dépassée est refusée', async () => {
  const paths = sandbox();
  const draft = await createDraft(paths, { id: 'aaaa1111', locale: 'fr' });
  await saveDraft(paths, { ...draft, title: 'Premier' }, draft.revision);
  // Un deuxième onglet, ou un double clic, repart de la même révision.
  await assert.rejects(
    saveDraft(paths, { ...draft, title: 'Second' }, draft.revision),
    ConflictError,
  );
  assert.equal(readArticle(paths, 'aaaa1111').draft.title, 'Premier');
});

test('deux sauvegardes simultanées : une seule passe, jamais un fichier corrompu', async () => {
  const paths = sandbox();
  const draft = await createDraft(paths, { id: 'aaaa1111', locale: 'fr' });
  const results = await Promise.allSettled([
    saveDraft(paths, { ...draft, title: 'A' }, draft.revision),
    saveDraft(paths, { ...draft, title: 'B' }, draft.revision),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter((r) => r.reason instanceof ConflictError).length, 1);
  JSON.parse(readFileSync(join(paths.drafts, 'aaaa1111.json'), 'utf8'));
});

test('une image absente du stockage bloque la publication', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', {
    cover: { src: '/news/media/absente-deadbeef.webp', width: 1, height: 1, alt: 'x' },
  });
  await assert.rejects(publish(paths, 'aaaa1111', NOW), (error) =>
    error.errors.some((e) => e.field === 'cover.src'),
  );
});

test('un article incomplet ne se publie pas, et rien n’est écrit', async () => {
  const paths = sandbox();
  await createDraft(paths, { id: 'aaaa1111', locale: 'fr' });
  await assert.rejects(publish(paths, 'aaaa1111', NOW), ValidationFailed);
  assert.equal(listPublished(paths).length, 0);
});

test('publier crée la version publique et ferme le brouillon', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111');
  const article = await publish(paths, 'aaaa1111', NOW);
  assert.equal(article.status, 'published');
  assert.equal(article.publishedAt, NOW.toISOString());
  assert.equal(listPublished(paths).length, 1);
  assert.equal(readArticle(paths, 'aaaa1111').draft, undefined);
});

test('modifier un article publié ne touche pas la version en ligne avant publication', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111');
  const online = await publish(paths, 'aaaa1111', NOW);
  // Le brouillon d'un article en ligne repart de la version publiée.
  await saveDraft(paths, { ...online, title: 'Titre en travaux' }, online.revision);
  const { published, draft } = readArticle(paths, 'aaaa1111');
  assert.equal(published.title, 'Un titre éditorial');
  assert.equal(draft.title, 'Titre en travaux');
  assert.equal(draft.basedOnRevision, online.revision);
  assert.equal(listPublished(paths)[0].title, 'Un titre éditorial');
  // Republier conserve la date de première publication.
  const again = await publish(paths, 'aaaa1111', new Date('2026-09-20T10:00:00Z'));
  assert.equal(again.title, 'Titre en travaux');
  assert.equal(again.publishedAt, NOW.toISOString());
  assert.equal(again.updatedAt, '2026-09-20T10:00:00.000Z');
});

test('le slug est unique dans sa langue, même quand deux publications se croisent', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'meme-slug' });
  await ready(paths, 'bbbb2222', { slug: 'meme-slug' });
  const results = await Promise.allSettled([
    publish(paths, 'aaaa1111', NOW),
    publish(paths, 'bbbb2222', NOW),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const refused = results.find((r) => r.status === 'rejected').reason;
  assert.ok(refused instanceof ValidationFailed);
  assert.ok(refused.errors.some((e) => e.field === 'slug'));
});

test('le même slug reste permis dans une autre langue', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'meme-slug' });
  await ready(paths, 'bbbb2222', { slug: 'meme-slug', locale: 'en' });
  await publish(paths, 'aaaa1111', NOW);
  await publish(paths, 'bbbb2222', NOW);
  assert.equal(listPublished(paths).length, 2);
});

test('changer le slug publié redirige l’ancienne adresse, sans chaîne ni boucle', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'premier' });
  let online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'deuxieme' }, online.revision);
  online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'troisieme' }, online.revision);
  online = await publish(paths, 'aaaa1111', NOW);
  assert.deepEqual(online.slugHistory, ['premier', 'deuxieme']);
  const redirects = JSON.parse(readFileSync(paths.vercel, 'utf8')).redirects;
  const news = redirects.filter((r) => r.source.includes('/news/'));
  // Chaque ancienne adresse mène directement à l'actuelle.
  assert.deepEqual(
    news.map((r) => [r.source, r.destination, r.permanent]),
    [
      ['/news/premier/', '/news/troisieme/', true],
      ['/news/deuxieme/', '/news/troisieme/', true],
    ],
  );
  // Les autres redirections du site sont intactes.
  assert.ok(redirects.some((r) => r.source === '/marques/'));
});

test('revenir à un ancien slug le retire de l’historique : pas de boucle', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'un' });
  let online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'deux' }, online.revision);
  online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'un' }, online.revision);
  online = await publish(paths, 'aaaa1111', NOW);
  assert.deepEqual(online.slugHistory, ['deux']);
  const news = JSON.parse(readFileSync(paths.vercel, 'utf8')).redirects.filter((r) =>
    r.source.includes('/news/'),
  );
  for (const r of news) assert.notEqual(r.source, r.destination);
});

test('une ancienne adresse d’un article ne peut pas devenir celle d’un autre', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'ancien' });
  const online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'nouveau' }, online.revision);
  await publish(paths, 'aaaa1111', NOW);
  await ready(paths, 'bbbb2222', { slug: 'ancien' });
  await assert.rejects(publish(paths, 'bbbb2222', NOW), ValidationFailed);
});

test('les redirections suivent la langue de l’article', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111', { slug: 'old', locale: 'en' });
  const online = await publish(paths, 'aaaa1111', NOW);
  await saveDraft(paths, { ...online, slug: 'new' }, online.revision);
  await publish(paths, 'aaaa1111', NOW);
  const news = JSON.parse(readFileSync(paths.vercel, 'utf8')).redirects.filter((r) =>
    r.source.includes('/news/'),
  );
  assert.deepEqual(news[0], {
    source: '/en/news/old/',
    destination: '/en/news/new/',
    permanent: true,
  });
});

test('dépublier retire l’article du public et garde son contenu en brouillon', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111');
  await publish(paths, 'aaaa1111', NOW);
  await unpublish(paths, 'aaaa1111');
  assert.equal(listPublished(paths).length, 0);
  assert.equal(existsSync(join(paths.published, 'aaaa1111.json')), false);
  const { draft } = readArticle(paths, 'aaaa1111');
  assert.equal(draft.status, 'draft');
  assert.equal(draft.title, 'Un titre éditorial');
});

test('archiver retire du public sans perdre le contenu', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111');
  await publish(paths, 'aaaa1111', NOW);
  await archive(paths, 'aaaa1111');
  assert.equal(listPublished(paths).length, 0);
  assert.equal(readArticle(paths, 'aaaa1111').draft.status, 'archived');
});

test('dupliquer produit un nouveau brouillon, jamais une seconde publication', async () => {
  const paths = sandbox();
  await ready(paths, 'aaaa1111');
  await publish(paths, 'aaaa1111', NOW);
  const copy = await duplicate(paths, 'aaaa1111', 'cccc3333');
  assert.equal(copy.status, 'draft');
  assert.equal(copy.publishedAt, null);
  assert.notEqual(copy.slug, 'slug-aaaa1111');
  assert.deepEqual(copy.slugHistory, []);
  assert.equal(listPublished(paths).length, 1);
});

test('syncRedirects est idempotent', async () => {
  const paths = sandbox();
  syncRedirects(paths);
  const once = readFileSync(paths.vercel, 'utf8');
  syncRedirects(paths);
  assert.equal(readFileSync(paths.vercel, 'utf8'), once);
});

/* ------------------------------------------------------------------ médias */

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

test('une image téléversée est vérifiée, réencodée et nommée par son contenu', async () => {
  const paths = sandbox();
  const media = await saveMedia(paths, PNG_1PX, 'Mon Image.png');
  assert.match(media.src, /^\/news\/media\/mon-image-[a-f0-9]{8}\.webp$/);
  assert.equal(media.width, 1);
  assert.ok(existsSync(join(paths.media, media.src.split('/').pop())));
  // Le même fichier donne la même adresse : rien n'est dupliqué.
  assert.equal((await saveMedia(paths, PNG_1PX, 'autre.png')).src.slice(-13), media.src.slice(-13));
});

test('un fichier qui n’est pas une image est refusé, quelle que soit son extension', async () => {
  const paths = sandbox();
  await assert.rejects(saveMedia(paths, Buffer.from('<svg onload="alert(1)">'), 'x.png'));
  await assert.rejects(saveMedia(paths, Buffer.from('<?php echo 1; ?>'), 'x.jpg'));
  await assert.rejects(saveMedia(paths, Buffer.alloc(9 * 1024 * 1024, 1), 'lourd.png'));
});
