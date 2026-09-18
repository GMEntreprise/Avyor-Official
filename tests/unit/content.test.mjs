import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCALES, DEFAULT_LOCALE } from '../../src/i18n/locales.ts';

const content = {};
for (const locale of LOCALES)
  content[locale] = (await import(`../../src/content/locales/${locale}.ts`))[locale];

const shell = Object.fromEntries(
  LOCALES.map((l) => [l, readFileSync(`src/content/locales/${l}.ts`, 'utf8')]),
);
const bodies = Object.fromEntries(
  LOCALES.map((l) => [l, readFileSync(`src/content/deep/${l}.ts`, 'utf8')]),
);
/** Everything a visitor can read in one language, wherever it is stored. */
const source = Object.fromEntries(LOCALES.map((l) => [l, shell[l] + bodies[l]]));

/** The pages a visitor reads to understand the product, with their minimum depth. */
const depth = {
  creators: 8,
  brands: 8,
  features: 8,
  'how-it-works': 10,
  security: 8,
  download: 5,
  contact: 3,
};

const blocksFor = (locale) =>
  Object.fromEntries(
    bodies[locale]
      .split(/\n {2}(?=(?:'[a-z-]+'|[a-z][a-z0-9]*): \[)/)
      .slice(1)
      .map((block) => [block.match(/^'?([a-z0-9-]+)'?:/)[1], block]),
  );

test('chaque page produit expose assez de sections, dans chaque langue', () => {
  for (const locale of LOCALES) {
    const blocks = blocksFor(locale);
    for (const [slug, minimum] of Object.entries(depth)) {
      const block = blocks[slug];
      assert.ok(block, `${locale} : contenu absent pour ${slug}`);
      const sections = block.split('title:').length - 1;
      assert.ok(
        sections >= minimum,
        `${locale} /${slug}/ : ${sections} sections pour ${minimum} attendues`,
      );
    }
  }
});

test('toutes les langues décrivent exactement le même site', () => {
  const reference = content[DEFAULT_LOCALE];
  for (const locale of LOCALES) {
    const c = content[locale];
    assert.deepEqual(
      c.pages.map((p) => p.slug),
      reference.pages.map((p) => p.slug),
      `${locale} : les pages ne correspondent pas`,
    );
    assert.deepEqual(
      c.pages.map((p) => Boolean(p.noindex)),
      reference.pages.map((p) => Boolean(p.noindex)),
      `${locale} : l’indexabilité diffère`,
    );
    assert.deepEqual(
      c.pages.map((p) => p.screen ?? null),
      reference.pages.map((p) => p.screen ?? null),
      `${locale} : les écrans illustrés diffèrent`,
    );
    assert.deepEqual(
      c.scenes.map((s) => s.id),
      reference.scenes.map((s) => s.id),
      `${locale} : les scènes diffèrent`,
    );
    assert.equal(c.faqs.length, reference.faqs.length, `${locale} : nombre de questions`);
    assert.deepEqual(
      Object.keys(c.related),
      Object.keys(reference.related),
      `${locale} : liens contextuels`,
    );
    assert.deepEqual(
      c.navigation.map(([, slug]) => slug),
      reference.navigation.map(([, slug]) => slug),
      `${locale} : navigation`,
    );
    assert.deepEqual(
      c.ui.gallery.shots.map(([scene]) => scene),
      reference.ui.gallery.shots.map(([scene]) => scene),
      `${locale} : captures de la galerie`,
    );
    assert.deepEqual(
      Object.keys(c.ui.screen.scenes),
      Object.keys(reference.ui.screen.scenes),
      `${locale} : descriptions d’écran`,
    );
  }
});

test('aucune chaîne vide, aucun lien contextuel vers une page inexistante', () => {
  // Le slug de l'accueil est vide par construction : c'est la racine.
  const walk = (value, path, locale) => {
    if (typeof value === 'string')
      assert.ok(
        value.trim().length > 0 || /\.pages\[0\]\.slug$/.test(path),
        `${locale} : ${path} est vide`,
      );
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, locale));
    else if (value && typeof value === 'object' && typeof value !== 'function')
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, locale);
  };
  for (const locale of LOCALES) {
    const c = content[locale];
    walk(c, locale, locale);
    const slugs = new Set(c.pages.map((p) => p.slug));
    for (const [from, block] of Object.entries(c.related))
      for (const [, slug] of block.links)
        assert.ok(slugs.has(slug), `${locale} : ${from} pointe vers /${slug}/ qui n’existe pas`);
    for (const [, slug] of c.navigation)
      assert.ok(slugs.has(slug), `${locale} : la navigation pointe vers /${slug}/`);
    for (const [, links] of c.ui.footer.columns)
      for (const [, slug] of links)
        assert.ok(slugs.has(slug), `${locale} : le pied de page pointe vers /${slug}/`);
  }
});

test('une langue traduite est vraiment traduite, pas recopiée', () => {
  const reference = content[DEFAULT_LOCALE];
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const c = content[locale];
    c.pages.forEach((page, i) => {
      for (const field of ['title', 'description', 'heading', 'intro'])
        assert.notEqual(
          page[field],
          reference.pages[i][field],
          `${locale} : /${page.slug}/ garde le ${field} de référence`,
        );
    });
    assert.notEqual(c.facts, reference.facts, `${locale} : la description du produit est recopiée`);
    c.faqs.forEach((faq, i) => {
      assert.notEqual(faq.q, reference.faqs[i].q, `${locale} : question ${i + 1} recopiée`);
      assert.notEqual(faq.a, reference.faqs[i].a, `${locale} : réponse ${i + 1} recopiée`);
    });
  }
});

/**
 * Ce que chaque langue doit dire, parce que l'application le fait ainsi.
 * Une traduction qui perdrait ces réserves promettrait ce que le produit ne
 * tient pas — c'est exactement ce que ce test empêche.
 */
const required = {
  fr: [
    /candidature envoyée ne peut pas être retirée/i,
    /Aucun délai n’est garanti/,
    /dépend du prestataire de paiement/i,
    /contre-offre/i,
    /conservée? par AVYOR/i,
    /score de confiance/i,
    /présélection|shortlist/i,
    /modèles guidés|modèles de vidéo/i,
    /missions?\b/i,
  ],
  en: [
    /cannot be withdrawn/i,
    /No timeframe is guaranteed/i,
    /depends on the payment provider/i,
    /counter-offer/i,
    /held by AVYOR/i,
    /trust score/i,
    /shortlist/i,
    /guided templates|guided video templates/i,
    /missions?\b/i,
  ],
  es: [
    /no se puede retirar/i,
    /no garantiza ningún plazo/i,
    /depende del proveedor de pagos/i,
    /contraoferta/i,
    /AVYOR retiene el importe/i,
    /puntuación de confianza/i,
    /preselecci/i,
    /plantillas guiadas/i,
    /misiones/i,
  ],
  he: [
    /לא ניתן למשוך/,
    /אינה מתחייבת לאף מסגרת זמן/,
    /תלויה בספק התשלומים/,
    /הצעה נגדית/,
    /AVYOR מחזיקה בסכום/,
    /ציון אמון/,
    /רשימה מקוצרת/,
    /תבניות מודרכות/,
    /משימות/,
  ],
  ar: [
    /لا يمكن سحب ترشيح/,
    /لا تضمن AVYOR أي مهلة/,
    /تعتمد على مزوّد الدفع/,
    /عرض مضاد/,
    /تحتفظ AVYOR بالمبلغ/,
    /درجة الثقة/,
    /القائمة المختصرة/,
    /قوالب موجّهة/,
    /المهام/,
  ],
};

test('chaque langue garde les réserves et les faits vérifiés dans l’app', () => {
  for (const locale of LOCALES) {
    assert.ok(required[locale], `aucune liste de vérification pour ${locale}`);
    for (const pattern of required[locale])
      assert.match(source[locale], pattern, `${locale} : ${pattern} absent du site`);
  }
});

test('le site ne promet ce que l’application ne fait pas dans aucune langue', () => {
  for (const locale of LOCALES) {
    // L'app affiche « Authentification à deux facteurs — Bientôt disponible ».
    assert.doesNotMatch(
      source[locale],
      /deux facteurs|2FA|double authentification|two[- ]factor/i,
      locale,
    );
    // Aucun délai chiffré : le versement dépend du calendrier de Stripe.
    assert.doesNotMatch(
      source[locale],
      /sous \d+ ?(jours?|heures?|h\b)|en \d+ ?jours? ouvr|within \d+ ?(days?|hours?)/i,
      locale,
    );
  }
});

test('aucun superlatif invérifiable, dans aucune langue', () => {
  for (const locale of LOCALES) {
    assert.doesNotMatch(
      source[locale],
      /révolutionnaire|revolutionary|leader du marché|market leader|n°ª?\s?1\b|\bnuméro un\b|le meilleur\b|\bthe best\b|100 ?%|sans risque|risk[- ]free|instantané|instant payout/i,
      locale,
    );
    // « garanti » et « parfait » ne sont fautifs qu'affirmés, pas niés.
    assert.doesNotMatch(
      source[locale],
      /(?<!aucun |n’est |n'est |jamais )\b(garanti|parfait)(e|s|es)?\b/i,
      locale,
    );
    assert.doesNotMatch(source[locale], /\b(?<!no timeframe )is guaranteed\b/i, locale);
  }
});

test('aucun chiffre de traction inventé, dans aucune langue', () => {
  for (const locale of LOCALES) {
    assert.doesNotMatch(
      source[locale],
      /\b\d[\d  ]{2,}\+? (créateurs|creators|marques|brands|utilisateurs|users|campagnes|campaigns)\b/i,
      locale,
    );
    assert.doesNotMatch(source[locale], /\b\d[.,]\d\s*\/\s*5\b/, locale);
    assert.doesNotMatch(source[locale], /\+\s?\d+\s?(%|k\b|K\b)/, locale);
  }
});
