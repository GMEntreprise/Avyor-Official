import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assignHeadingIds,
  slugify,
  headingAnchors,
  tableOfContents,
  readingMinutes,
  plainText,
  isSafeHref,
  validateArticle,
  normalizeSearch,
  searchArticles,
  paginate,
} from '../../src/news/model.ts';

const text = (value, marks) => ({ type: 'text', text: value, ...(marks ? { marks } : {}) });
const h = (level, content, id) => ({
  type: 'heading',
  attrs: { level, ...(id ? { id } : {}) },
  content,
});
const p = (...content) => ({ type: 'paragraph', content });
const doc = (...content) => ({ type: 'doc', content });

/* ------------------------------------------------------------------ ancres */

test('un slug se lit dans une URL : accents, ponctuation et espaces neutralisés', () => {
  assert.equal(slugify('Brief UGC : quoi préciser ?'), 'brief-ugc-quoi-preciser');
  assert.equal(slugify('  Œuvre & Été — l’été  '), 'oeuvre-ete-l-ete');
  assert.equal(slugify('Déjà—vu!!'), 'deja-vu');
  assert.equal(slugify('!!!'), '');
});

test('les ancres suivent le texte des titres, formaté ou non', () => {
  const anchors = headingAnchors(
    doc(h(2, [text('Le '), text('brief', [{ type: 'bold' }]), text(' idéal')]), p(text('x'))),
  );
  assert.deepEqual(anchors, ['le-brief-ideal']);
});

test('deux titres identiques reçoivent deux ancres distinctes et stables', () => {
  const d = doc(h(2, [text('Exemple')]), h(2, [text('Exemple')]), h(3, [text('Exemple')]));
  assert.deepEqual(headingAnchors(d), ['exemple', 'exemple-2', 'exemple-3']);
  // Déterministe : le même contenu donne les mêmes ancres, à chaque rendu.
  assert.deepEqual(headingAnchors(d), headingAnchors(structuredClone(d)));
});

test('une ancre enregistrée survit à la retouche du titre', () => {
  const before = doc(h(2, [text('Préparer le brief')], 'preparer-le-brief'));
  const after = doc(h(2, [text('Bien préparer son brief')], 'preparer-le-brief'));
  assert.deepEqual(headingAnchors(after), headingAnchors(before));
});

test('une ancre enregistrée invalide ou déjà prise est remplacée, jamais dupliquée', () => {
  const d = doc(
    h(2, [text('Un')], 'commun'),
    h(2, [text('Deux')], 'commun'),
    h(2, [text('Trois')], '"><script>'),
  );
  const anchors = headingAnchors(d);
  assert.equal(new Set(anchors).size, 3);
  assert.equal(anchors[0], 'commun');
  for (const a of anchors) assert.match(a, /^[a-z][a-z0-9-]*$/);
});

test('un titre sans lettre reçoit quand même une ancre valide', () => {
  assert.deepEqual(headingAnchors(doc(h(2, [text('2026')]), h(2, [text('?!')]))), [
    'section-2026',
    'section',
  ]);
});

test('avant la première publication, les ancres suivent le texte', () => {
  const d = doc(h(2, [text('Nouveau titre')], 'ancien-titre'));
  assert.equal(assignHeadingIds(d, { keep: false }).content[0].attrs.id, 'nouveau-titre');
});

test('après publication, une ancre reste, même quand le titre change', () => {
  const d = doc(h(2, [text('Nouveau titre')], 'ancien-titre'), h(2, [text('Autre')]));
  const out = assignHeadingIds(d, { keep: true });
  assert.equal(out.content[0].attrs.id, 'ancien-titre');
  assert.equal(out.content[1].attrs.id, 'autre');
  // Le document d'origine n'est pas modifié.
  assert.equal(d.content[1].attrs.id, undefined);
});

test('un titre coupé en deux par l’éditeur ne partage pas son ancre', () => {
  // Entrée au milieu d'un titre : les deux moitiés héritent du même id.
  const d = doc(h(2, [text('Première')], 'premiere'), h(2, [text('moitié')], 'premiere'));
  const ids = assignHeadingIds(d, { keep: true }).content.map((n) => n.attrs.id);
  assert.deepEqual(ids, ['premiere', 'moitie']);
});

/* ----------------------------------------------------------------- sommaire */

test('le sommaire vient des H2, avec les H3 rangés sous leur H2', () => {
  const toc = tableOfContents(
    doc(
      h(2, [text('Avant')]),
      h(3, [text('Le produit')]),
      h(3, [text('Le public')]),
      h(2, [text('Pendant')]),
      h(4, [text('Détail')]),
    ),
  );
  assert.deepEqual(toc, [
    {
      id: 'avant',
      text: 'Avant',
      children: [
        { id: 'le-produit', text: 'Le produit', children: [] },
        { id: 'le-public', text: 'Le public', children: [] },
      ],
    },
    { id: 'pendant', text: 'Pendant', children: [] },
  ]);
});

test('le sommaire et le rendu partagent exactement les mêmes ancres', () => {
  const d = doc(h(2, [text('Exemple')]), h(3, [text('Exemple')]), h(2, [text('Exemple')]));
  const fromToc = tableOfContents(d).flatMap((e) => [e.id, ...e.children.map((c) => c.id)]);
  const fromRender = headingAnchors(d).filter((_, i) => d.content[i].attrs.level <= 3);
  assert.deepEqual(fromToc.sort(), fromRender.sort());
});

test('un H3 avant tout H2 reste dans le sommaire', () => {
  const toc = tableOfContents(doc(h(3, [text('Préambule')]), h(2, [text('Suite')])));
  assert.equal(toc.length, 2);
  assert.equal(toc[0].text, 'Préambule');
});

/* ------------------------------------------------------------ lecture, texte */

test('le temps de lecture se calcule depuis le contenu, jamais en dessous d’une minute', () => {
  assert.equal(readingMinutes(doc(p(text('Court.')))), 1);
  const words = Array.from({ length: 660 }, () => 'mot').join(' ');
  assert.equal(readingMinutes(doc(p(text(words)))), 3);
});

test('le texte brut couvre listes, tableaux et encadrés', () => {
  const d = doc(
    { type: 'bulletList', content: [{ type: 'listItem', content: [p(text('item'))] }] },
    {
      type: 'table',
      content: [
        { type: 'tableRow', content: [{ type: 'tableCell', content: [p(text('cellule'))] }] },
      ],
    },
    { type: 'callout', attrs: { variant: 'checklist' }, content: [p(text('encadré'))] },
  );
  const t = plainText(d);
  for (const word of ['item', 'cellule', 'encadré']) assert.match(t, new RegExp(word));
});

/* ------------------------------------------------------------------ sécurité */

test('seuls les liens sûrs sont acceptés', () => {
  for (const ok of [
    'https://www.legifrance.gouv.fr/x',
    '/brands/',
    '/en/creators/',
    '#section',
    'mailto:shavod.web@gmail.com',
  ])
    assert.ok(isSafeHref(ok), ok);
  for (const bad of [
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>',
    'vbscript:x',
    '//evil.example/',
    'http://insecure.example/',
    'file:///etc/passwd',
    '',
  ])
    assert.ok(!isSafeHref(bad), bad);
});

const valid = () => ({
  id: 'abc12345',
  locale: 'fr',
  title: 'Brief UGC : quoi préciser pour éviter les allers-retours',
  slug: 'brief-ugc-quoi-preciser',
  slugHistory: [],
  excerpt:
    'Un brief flou coûte des allers-retours. Voici les points à fixer avant le tournage, avec un exemple annoté.',
  type: 'guide',
  audience: 'brands',
  theme: 'prepare',
  author: { kind: 'organization', name: 'Équipe éditoriale AVYOR' },
  featured: false,
  cover: { src: '/news/media/cover-0123abcd.webp', width: 1600, height: 900, alt: 'Illustration' },
  body: doc(h(2, [text('Un')]), p(text('Texte.')), h(2, [text('Deux')]), p(text('Texte.'))),
  sources: [],
  cta: { label: 'Découvrir le parcours marque', slug: 'brands' },
  related: [],
  translations: {},
  seo: {
    title: 'Brief UGC : les points à préciser | AVYOR',
    description:
      'Les informations à fixer dans un brief UGC pour éviter les allers-retours, avec un exemple annoté et une liste à cocher.',
    noindex: false,
  },
  revision: 1,
  createdAt: '2026-09-18T08:00:00.000Z',
  updatedAt: '2026-09-18T08:00:00.000Z',
  publishedAt: '2026-09-18T09:00:00.000Z',
});

test('un article complet passe la validation', () => {
  assert.deepEqual(validateArticle(valid()), []);
});

test('les erreurs désignent le champ fautif', () => {
  const a = valid();
  a.title = '';
  a.slug = 'Pas Un Slug';
  a.cover.alt = '';
  const fields = validateArticle(a).map((e) => e.field);
  assert.ok(fields.includes('title'));
  assert.ok(fields.includes('slug'));
  assert.ok(fields.includes('cover.alt'));
});

test('un lien dangereux dans le corps bloque l’article', () => {
  const a = valid();
  a.body.content[1] = p(text('clic', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }]));
  assert.ok(validateArticle(a).some((e) => e.field.startsWith('body')));
});

test('un nœud ou une marque inconnus sont refusés, pas ignorés', () => {
  const a = valid();
  a.body.content.push({ type: 'rawHtml', attrs: { html: '<script>alert(1)</script>' } });
  assert.ok(validateArticle(a).some((e) => /rawHtml/.test(e.message)));
  const b = valid();
  b.body.content[1] = p(text('x', [{ type: 'onclick' }]));
  assert.ok(validateArticle(b).some((e) => /onclick/.test(e.message)));
});

test('le H1 appartient au titre de la page, jamais au corps', () => {
  const a = valid();
  a.body.content.unshift(h(1, [text('Titre')]));
  assert.ok(validateArticle(a).some((e) => /H1|niveau 1/.test(e.message)));
});

test('un titre caché dans un encadré est refusé : il n’aurait pas d’ancre', () => {
  const a = valid();
  a.body.content.push({
    type: 'callout',
    attrs: { variant: 'example' },
    content: [h(2, [text('Caché')])],
  });
  assert.ok(validateArticle(a).some((e) => /autre bloc/.test(e.message)));
});

test('une image sans texte alternatif est refusée', () => {
  const a = valid();
  a.body.content.push({ type: 'image', attrs: { src: '/news/media/x-0123abcd.webp', alt: '' } });
  assert.ok(validateArticle(a).some((e) => /alternatif/.test(e.message)));
});

test('une image hors du stockage des médias est refusée', () => {
  const a = valid();
  a.body.content.push({ type: 'image', attrs: { src: 'https://tracker.example/p.gif', alt: 'x' } });
  assert.ok(validateArticle(a).some((e) => /image/i.test(e.message)));
});

test('un marqueur « à compléter » ne peut pas partir en ligne', () => {
  const a = valid();
  a.body.content[1] = p(text('Montant : [À COMPLÉTER]'));
  assert.ok(validateArticle(a, { publishing: true }).some((e) => /compléter/i.test(e.message)));
});

test('une date de publication future est refusée : aucune programmation n’est exécutée', () => {
  const a = valid();
  a.publishedAt = '2999-01-01T00:00:00.000Z';
  assert.ok(
    validateArticle(a, { publishing: true, now: new Date('2026-09-18T10:00:00Z') }).some((e) =>
      /future/.test(e.message),
    ),
  );
});

/* --------------------------------------------------------- recherche, pages */

test('la recherche ignore la casse et les accents', () => {
  assert.equal(normalizeSearch('Créateur ÉTÉ'), 'createur ete');
  const index = [
    {
      id: '1',
      title: 'Préparer un brief',
      excerpt: '',
      text: '',
      audience: 'brands',
      theme: 'prepare',
    },
    {
      id: '2',
      title: 'Portfolio',
      excerpt: 'Créer ses projets',
      text: '',
      audience: 'creators',
      theme: 'create',
    },
    {
      id: '3',
      title: 'Mesurer',
      excerpt: '',
      text: 'le mot brief est ici',
      audience: 'brands',
      theme: 'measure',
    },
  ];
  assert.deepEqual(
    searchArticles(index, { q: 'BRIEF' }).map((a) => a.id),
    ['1', '3'],
  );
  assert.deepEqual(
    searchArticles(index, { q: 'creer' }).map((a) => a.id),
    ['2'],
  );
  assert.deepEqual(
    searchArticles(index, { audience: 'brands', theme: 'measure' }).map((a) => a.id),
    ['3'],
  );
  // « les deux » concerne aussi chaque public.
  index.push({
    id: '4',
    title: 'Feedback',
    excerpt: '',
    text: '',
    audience: 'both',
    theme: 'create',
  });
  assert.deepEqual(
    searchArticles(index, { audience: 'creators' }).map((a) => a.id),
    ['2', '4'],
  );
});

test('la pagination découpe l’ensemble, pas seulement ce qui est affiché', () => {
  const items = Array.from({ length: 20 }, (_, i) => i);
  assert.deepEqual(paginate(items, 1, 9), { items: items.slice(0, 9), page: 1, pages: 3 });
  assert.deepEqual(paginate(items, 3, 9), { items: items.slice(18), page: 3, pages: 3 });
  // Une page hors limite ramène à la dernière existante, jamais à une page vide.
  assert.equal(paginate(items, 9, 9).page, 3);
  assert.equal(paginate([], 1, 9).pages, 1);
});
