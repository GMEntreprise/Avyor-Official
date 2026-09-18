import test from 'node:test';
import assert from 'node:assert/strict';
import { articles } from '../../scripts/news-seed-articles.mjs';
import {
  validateArticle,
  plainText,
  tableOfContents,
  readingMinutes,
} from '../../src/news/model.ts';

/** The seed spec, completed the way the seed script completes it. */
const asArticle = (spec) => ({
  ...spec.article,
  id: spec.id,
  locale: 'fr',
  slug: spec.slug,
  slugHistory: [],
  cover: { src: '/news/media/cover-0123abcd.webp', width: 1600, height: 900, alt: spec.coverAlt },
  seo: { ...spec.article.seo, noindex: false },
  revision: 1,
  createdAt: '2026-09-18T08:00:00.000Z',
  updatedAt: '2026-09-18T08:00:00.000Z',
  publishedAt: '2026-09-18T09:00:00.000Z',
});

const all = articles.map((spec) => ({ spec, article: asArticle(spec) }));
const text = (article) =>
  [
    article.title,
    article.excerpt,
    article.seo.title,
    article.seo.description,
    plainText(article.body),
  ].join('\n');

test('les quatre articles P1 sont prêts à être publiés, sans rien à compléter', () => {
  assert.equal(all.length, 4);
  for (const { article } of all)
    assert.deepEqual(
      validateArticle(article, { publishing: true, now: new Date('2026-09-19T00:00:00Z') }),
      [],
      article.title,
    );
});

test('adresses, identifiants et titres SEO sont uniques', () => {
  for (const field of ['id', 'slug'])
    assert.equal(new Set(all.map(({ article }) => article[field])).size, all.length, field);
  assert.equal(new Set(all.map(({ article }) => article.seo.title)).size, all.length);
});

test('chaque article a un sommaire et un outil de décision', () => {
  for (const { article } of all) {
    assert.ok(tableOfContents(article.body).length >= 3, `${article.title} : sommaire trop court`);
    const kinds = new Set(article.body.content.map((node) => node.type));
    const tools = article.body.content.filter(
      (node) =>
        node.type === 'table' || (node.type === 'callout' && node.attrs.variant !== 'warning'),
    );
    assert.ok(tools.length > 0, `${article.title} : aucun exemple, tableau ou liste à vérifier`);
    assert.ok(kinds.has('paragraph'));
    assert.ok(readingMinutes(article.body) >= 3, `${article.title} : trop court pour être utile`);
  }
});

test('la réponse centrale arrive dès l’introduction, en gras', () => {
  for (const { article } of all) {
    const opening = article.body.content.slice(0, 2);
    const bold = opening
      .flatMap((node) => node.content ?? [])
      .filter((n) => n.marks?.some((m) => m.type === 'bold'));
    assert.ok(bold.length > 0, `${article.title} : la réponse n’est pas mise en évidence au début`);
  }
});

test('aucune formule creuse ni promesse sans preuve', () => {
  const banned =
    /monde en constante évolution|révolutionn|libérez votre potentiel|incontournable|n°\s?1|numéro un|le meilleur|garanti(?!e? ?:)|100 ?%|sans risque|instantan/i;
  for (const { article } of all) assert.doesNotMatch(text(article), banned, article.title);
});

test('aucun chiffre de marché, d’audience ou de tarif inventé', () => {
  for (const { article } of all) {
    const content = text(article);
    // Pas de pourcentages, de volumes d'abonnés ou de tarifs moyens.
    assert.doesNotMatch(content, /\d+\s?%/, `${article.title} : pourcentage`);
    assert.doesNotMatch(content, /\d[\d  ]{2,}\s?(abonnés|followers|vues)/i, article.title);
    assert.doesNotMatch(content, /(tarif|prix) moyen/i, article.title);
    // Le seul montant cité est le seuil légal, sourcé.
    for (const [euros] of content.matchAll(/\d[\d  ]*\s?€/g))
      assert.match(euros, /1 000/, `${article.title} : montant non sourcé ${euros}`);
  }
});

test('les faits AVYOR cités correspondent à l’application', () => {
  const corpus = all.map(({ article }) => text(article)).join('\n');
  // Pièges connus du produit (voir CLAUDE.md).
  assert.doesNotMatch(corpus, /deux facteurs|2FA/i);
  assert.doesNotMatch(corpus, /(pouvez|peut) (retirer|annuler) (votre|une) candidature/i);
  assert.doesNotMatch(corpus, /sous \d+ ?(jours?|heures?)|en \d+ ?jours? ouvr/i);
  assert.match(corpus, /candidature envoyée ne peut pas être retirée/);
  assert.match(corpus, /conservée par AVYOR/);
  assert.match(corpus, /quatre étapes : informations, budget, ciblage/);
});

test('une règle juridique citée renvoie à sa source officielle', () => {
  for (const { article } of all) {
    const content = text(article);
    if (!/loi|décret/i.test(content)) continue;
    assert.ok(
      article.sources.some(
        (s) => s.url.startsWith('https://www.legifrance.gouv.fr/') && s.accessed,
      ),
      `${article.title} : règle citée sans source datée`,
    );
  }
});

test('un exemple est présenté comme un exemple', () => {
  for (const { article } of all)
    for (const node of article.body.content.filter(
      (n) => n.type === 'callout' && n.attrs.variant === 'example',
    ))
      assert.ok(plainText(node).length > 20, `${article.title} : exemple vide`);
});
