import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCALES, DEFAULT_LOCALE } from '../../src/i18n/locales.ts';

const legal = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`src/content/legal/${l}.json`, 'utf8'))]),
);
const docsOf = (locale) => Object.entries(legal[locale]);

test('les trois documents existent et sont structurellement complets', () => {
  for (const locale of LOCALES) {
    assert.deepEqual(
      docsOf(locale).map(([slug]) => slug),
      ['privacy', 'terms', 'legal'],
      locale,
    );
    for (const [slug, doc] of docsOf(locale)) {
      assert.ok(doc.title && doc.intro && doc.lastUpdated, `${locale}/${slug}`);
      assert.ok(doc.sections.length >= 9, `${locale}/${slug} reste trop court`);
    }
    assert.ok(legal[locale].privacy.sections.length >= 20, locale);
    assert.ok(legal[locale].terms.sections.length >= 20, locale);
  }
});

test('chaque section porte une ancre stable, unique et lisible dans une URL', () => {
  for (const locale of LOCALES)
    for (const [slug, doc] of docsOf(locale)) {
      const ids = doc.sections.map((s) => s.id);
      assert.equal(new Set(ids).size, ids.length, `ancres dupliquées dans ${locale}/${slug}`);
      for (const id of ids) assert.match(id, /^[a-z][a-z0-9-]*$/, `${locale}/${slug} : « ${id} »`);
      for (const s of doc.sections) assert.ok(s.title.length > 3, `${locale}/${slug}#${s.id}`);
    }
});

/**
 * Une ancre est une adresse : elle ne change pas d'une langue à l'autre, sinon
 * un lien profond envoyé dans une langue casserait dans toutes les autres.
 */
test('les ancres et les informations manquantes sont les mêmes partout', () => {
  const reference = legal[DEFAULT_LOCALE];
  for (const locale of LOCALES)
    for (const [slug, doc] of docsOf(locale)) {
      assert.deepEqual(
        doc.sections.map((s) => s.id),
        reference[slug].sections.map((s) => s.id),
        `${locale}/${slug} : les ancres divergent`,
      );
      assert.deepEqual(
        doc.sections.map((s) => Boolean(s.todo)),
        reference[slug].sections.map((s) => Boolean(s.todo)),
        `${locale}/${slug} : les informations manquantes divergent`,
      );
      assert.deepEqual(
        doc.sections.map((s) => (s.items ?? []).length),
        reference[slug].sections.map((s) => (s.items ?? []).length),
        `${locale}/${slug} : les listes divergent`,
      );
    }
});

test('une information juridique manquante est signalée, jamais inventée', () => {
  for (const locale of LOCALES) {
    const todos = docsOf(locale).flatMap(([slug, doc]) =>
      doc.sections.filter((s) => s.todo).map((s) => `${slug}#${s.id}`),
    );
    assert.ok(todos.length > 0, `${locale} : les données éditeur ne sont pas encore connues`);
    const all = JSON.stringify(legal[locale]);
    // No fabricated corporate identity, registration number or address.
    assert.doesNotMatch(all, /\bSIRET\s*:?\s*\d/i, locale);
    assert.doesNotMatch(all, /\b\d{3} ?\d{3} ?\d{3} ?\d{5}\b/, locale);
    assert.doesNotMatch(all, /\b(SAS|SARL|SASU|EURL|SA)\b(?=[^»]*\d)/, locale);
    assert.doesNotMatch(all, /\b\d{5}\s+[A-ZÉÈ][a-zéèêà-]+,?\s+France\b/, locale);
    // Every section either states something verified or says what is missing.
    for (const [slug, doc] of docsOf(locale))
      for (const s of doc.sections)
        assert.ok(s.body || s.todo, `${locale}/${slug}#${s.id} est vide`);
  }
});

/** La réserve honnête sur la sécurité doit survivre à la traduction. */
const securityCaveat = {
  fr: /Aucun système n’est infaillible/,
  en: /No system is infallible/,
  es: /Ningún sistema es infalible/,
  he: /אף מערכת אינה חסינה/,
  ar: /لا يوجد نظام معصوم من الخطأ/,
};

test('aucune promesse de sécurité absolue (les réserves, elles, sont permises)', () => {
  for (const locale of LOCALES) {
    const all = JSON.stringify(legal[locale]);
    assert.doesNotMatch(
      all,
      /\b(100 ?%|military[- ]grade|inviolable|zéro risque|zero risk|unhackable)\b/i,
      locale,
    );
    assert.doesNotMatch(
      all,
      /\b(?:est|sont|reste|restent)\s+(?:totalement|entièrement|parfaitement|toujours)\s+(?:sûr|sécuris)/i,
      locale,
    );
    assert.doesNotMatch(
      all,
      /\b(?:is|are)\s+(?:totally|entirely|perfectly|always)\s+secure\b/i,
      locale,
    );
    assert.ok(securityCaveat[locale], `aucune formulation attendue pour ${locale}`);
    assert.match(all, securityCaveat[locale], `${locale} : la réserve de sécurité a disparu`);
  }
});

/** Un document traduit est une aide à la lecture ; le français fait foi. */
test('chaque langue traduite annonce que le français fait foi', async () => {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const { [locale]: content } = await import(`../../src/content/locales/${locale}.ts`);
    assert.ok(
      content.ui.legal.translationNotice,
      `${locale} : aucune mention indiquant la version qui fait foi`,
    );
  }
});
