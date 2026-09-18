import test from 'node:test';
import assert from 'node:assert/strict';
import { articles } from '../../scripts/news-seed-articles.mjs';
import { LOCALES } from '../../src/i18n/locales.ts';
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
  locale: spec.locale,
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
const inLocale = (locale) => all.filter(({ article }) => article.locale === locale);
const text = (article) =>
  [
    article.title,
    article.excerpt,
    article.seo.title,
    article.seo.description,
    plainText(article.body),
  ].join('\n');

test('les quatre articles existent dans les cinq langues, prêts à être publiés', () => {
  assert.equal(all.length, 4 * LOCALES.length);
  for (const locale of LOCALES) assert.equal(inLocale(locale).length, 4, locale);
  for (const { article } of all)
    assert.deepEqual(
      validateArticle(article, { publishing: true, now: new Date('2026-09-19T00:00:00Z') }),
      [],
      `${article.locale} — ${article.title}`,
    );
});

test('chaque article désigne ses quatre traductions, et elles le désignent en retour', () => {
  // Une chaîne non réciproque est ignorée par Google, et le site ne la déclare
  // pas : c'est donc tout le maillage entre langues qui disparaîtrait.
  const byId = new Map(all.map(({ article }) => [article.id, article]));
  for (const { article } of all) {
    const translations = Object.entries(article.translations);
    assert.equal(translations.length, LOCALES.length - 1, `${article.locale} ${article.id}`);
    for (const [locale, id] of translations) {
      const other = byId.get(id);
      assert.ok(other, `${article.id} → ${id} introuvable`);
      assert.equal(other.locale, locale);
      assert.equal(other.translations[article.locale], article.id, `${id} ne renvoie pas`);
    }
  }
});

test('adresses, identifiants et titres SEO sont uniques', () => {
  assert.equal(new Set(all.map(({ article }) => article.id)).size, all.length, 'id');
  assert.equal(new Set(all.map(({ article }) => article.slug)).size, all.length, 'slug');
  for (const locale of LOCALES) {
    const here = inLocale(locale);
    assert.equal(new Set(here.map(({ article }) => article.seo.title)).size, here.length, locale);
    assert.equal(new Set(here.map(({ article }) => article.title)).size, here.length, locale);
  }
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
    // Mesuré en caractères, pas en minutes : le temps de lecture se calcule en
    // mots, et l'hébreu comme l'arabe disent la même chose en moins de mots.
    // Un seuil en minutes aurait déclaré « trop court » une traduction
    // complète.
    assert.ok(
      plainText(article.body).length >= 2500,
      `${article.locale} — ${article.title} : trop court pour être utile`,
    );
    assert.ok(readingMinutes(article.body) >= 2, article.title);
  }
});

test('les ancres restent partageables, même sans alphabet latin', () => {
  // Une ancre se dérive du texte du titre : en hébreu et en arabe cela ne
  // donne rien, et toutes les sections finiraient sur « section-2 »,
  // « section-3 »… Ces deux langues écrivent donc leurs ancres à la main.
  for (const { article } of all) {
    const anchors = tableOfContents(article.body).map((entry) => entry.id);
    assert.equal(new Set(anchors).size, anchors.length, `${article.locale} : ancres en double`);
    if (!['he', 'ar'].includes(article.locale)) continue;
    for (const anchor of anchors)
      assert.doesNotMatch(
        anchor,
        /^section(-\d+)?$/,
        `${article.locale} — ${article.title} : ancre sans sens (${anchor})`,
      );
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

test('aucune formule creuse ni promesse sans preuve, dans aucune langue', () => {
  const banned = {
    fr: /monde en constante évolution|révolutionn|libérez votre potentiel|incontournable|n°\s?1|numéro un|le meilleur|garanti(?!e? ?:)|100 ?%|sans risque|instantan/i,
    en: /ever-changing world|revolutioni[sz]|unleash your potential|must-have solution|number one|guaranteed|100 ?%|risk-free|in no time/i,
    es: /mundo en constante|revolucion|revolución|libere su potencial|imprescindible|número uno|garantizado|100 ?%|sin riesgo|instantán/i,
    he: /מהפכ|שחררו את הפוטנציאל|הטוב ביותר|מובטח|100 ?%|ללא סיכון|באופן מיידי/,
    ar: /ثوري|أطلق العنان|الحل الأمثل|رقم 1|مضمون|100 ?%|بلا مخاطر|في لمح البصر/,
  };
  for (const { article } of all)
    assert.doesNotMatch(
      text(article),
      banned[article.locale],
      `${article.locale} — ${article.title}`,
    );
});

test('aucun chiffre de marché, d’audience ou de tarif inventé', () => {
  for (const { article } of all) {
    const content = text(article);
    // Pas de pourcentages, de volumes d'abonnés ou de tarifs moyens.
    assert.doesNotMatch(content, /\d+\s?%/, `${article.title} : pourcentage`);
    assert.doesNotMatch(
      content,
      /\d[\d  ]{2,}\s?(abonnés|followers|seguidores|עוקבים|متابع|vues|views|visualizaciones)/i,
      article.title,
    );
    assert.doesNotMatch(content, /(tarif|prix) moyen|average (price|rate)|precio medio/i, article.title);
    // Le seul montant cité est le seuil légal, sourcé.
    for (const [amount] of content.matchAll(/\d[\d\s]*\s?€|€\s?\d[\d\s,.]*/g))
      assert.match(amount, /1\s?000/, `${article.locale} — ${article.title} : montant ${amount}`);
  }
});

test('les faits AVYOR cités correspondent à l’application, dans chaque langue', () => {
  // Pièges connus du produit (voir CLAUDE.md) : ils doivent être dits juste
  // dans les cinq langues, pas seulement dans celle de référence.
  const required = {
    fr: [
      /candidature envoyée ne peut pas être retirée/,
      /conservée par AVYOR/,
      /quatre étapes : informations, budget, ciblage/,
    ],
    en: [
      /application that has been sent cannot be withdrawn/,
      /held by AVYOR/,
      /four steps: information, budget, targeting/,
    ],
    es: [
      /candidatura enviada no puede retirarse/,
      /conservada por AVYOR/,
      /cuatro pasos: información, presupuesto, segmentación/,
    ],
    he: [
      /מועמדות שנשלחה אינה ניתנת לביטול/,
      /נשמר אצל AVYOR/,
      /ארבעה שלבים: מידע, תקציב, פילוח/,
    ],
    ar: [
      /لا يمكن سحبه من التطبيق/,
      /يحتفظ AVYOR بالمبلغ/,
      /أربع خطوات: المعلومات، الميزانية، الاستهداف/,
    ],
  };
  for (const locale of LOCALES) {
    const corpus = inLocale(locale)
      .map(({ article }) => text(article))
      .join('\n');
    for (const rule of required[locale]) assert.match(corpus, rule, locale);
    assert.doesNotMatch(corpus, /deux facteurs|2FA|two-factor|dos factores/i, locale);
    assert.doesNotMatch(
      corpus,
      /(pouvez|peut) (retirer|annuler) (votre|une) candidature|can withdraw (your|an) application|puede retirar (su|una) candidatura/i,
      locale,
    );
    assert.doesNotMatch(corpus, /sous \d+ ?(jours?|heures?)|within \d+ (business|working) days/i, locale);
  }
});

test('une règle juridique citée renvoie à sa source officielle', () => {
  for (const { article } of all) {
    const content = text(article);
    // « צו » (décret) n'est pas cherché seul : ces deux lettres apparaissent
    // à l'intérieur de mots courants, et le test aurait crié au loup.
    if (!/loi|décret|\blaw\b|decree|\bley\b|decreto|חוק|قانون|مرسوم/i.test(content)) continue;
    assert.ok(
      article.sources.some(
        (s) => s.url.startsWith('https://www.legifrance.gouv.fr/') && s.accessed,
      ),
      `${article.locale} — ${article.title} : règle citée sans source datée`,
    );
  }
});

test('une règle française est annoncée comme française dans les autres langues', () => {
  // Un lecteur espagnol ou arabe n'a aucune raison de deviner que le seuil de
  // 1 000 € est français : le dire est une condition d'honnêteté.
  const french = {
    en: /in France|French law/i,
    es: /en Francia|ley francesa/i,
    he: /בצרפת|הצרפתי/,
    ar: /في فرنسا|الفرنسي/,
  };
  for (const { article } of all) {
    if (article.locale === 'fr' || !article.sources.length) continue;
    assert.match(text(article), french[article.locale], `${article.locale} — ${article.title}`);
  }
});

test('un exemple est présenté comme un exemple', () => {
  for (const { article } of all)
    for (const node of article.body.content.filter(
      (n) => n.type === 'callout' && n.attrs.variant === 'example',
    ))
      assert.ok(plainText(node).length > 20, `${article.title} : exemple vide`);
});
