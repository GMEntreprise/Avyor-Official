#!/usr/bin/env node
/**
 * build-coverage.mjs — ce que chaque version contient RÉELLEMENT.
 *
 * LE PROBLÈME : `BIBLE_BOOKS` porte UNE versification, et le site en sert
 * onze. Toutes les adresses `/bible/:version/...` étaient validées contre ce
 * seul registre, ce qui produisait deux défauts symétriques :
 *
 *   · des pages FANTÔMES — `/bible/BRH/PSA/23` répondait 200, avec un titre,
 *     et une description affirmant « Texte intégral ». La Bible des Racines
 *     Hébraïques ne contient aucun psaume : la page était vide, et
 *     l'affirmation fausse. 742 chapitres dans ce seul cas.
 *
 *   · des pages RÉELLES rendues introuvables — `/bible/NCL/DAN/13` (Suzanne)
 *     et `/bible/NCL/EST/16` existent dans la néo-Crampon, qui inclut les
 *     livres deutérocanoniques, mais répondaient 404.
 *
 * Ce script relit l'arborescence servie et n'écrit que les ÉCARTS au registre
 * canonique — un livre absent, ou un nombre de chapitres différent. Le reste
 * suit `BIBLE_BOOKS`, sans le recopier.
 *
 * Règle 8 de `moteur_seo.md` : un index dérivé se recompare à sa source par
 * test. `tests/unit/bible-coverage.test.ts` régénère et compare.
 *
 * Usage : bun run build:bible-coverage
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { BIBLE_BOOKS, BOOK_ORDER } from "../../src/constants/bibleBooks.ts";
import { BIBLE_VERSION_DATASETS } from "../../src/constants/bibleVersions.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BIBLE = join(ROOT, "public/assets/bible");

/**
 * Les chapitres réellement servis pour ce livre, dans ce jeu de données.
 *
 * On compte les fichiers `1.json`, `2.json`… et on s'arrête au premier trou :
 * un livre se lit d'un bout à l'autre, et annoncer un chapitre 14 quand le 13
 * manque casserait la navigation « chapitre suivant ».
 *
 * La borne haute est volontairement LARGE (999) et non `BIBLE_BOOKS` : c'est
 * ainsi qu'on découvre les versions qui vont PLUS LOIN que le registre —
 * Daniel 13-14 et Esther 11-16 dans la néo-Crampon, Joël 4 chez Darby.
 */
function chaptersOf(dataset, book) {
  const dossier = join(BIBLE, dataset, book);
  if (!existsSync(dossier)) return 0;
  let n = 0;
  while (n < 999 && existsSync(join(dossier, `${n + 1}.json`))) n += 1;
  return n;
}

export function measureCoverage() {
  const coverage = {};
  for (const [id, dataset] of Object.entries(BIBLE_VERSION_DATASETS)) {
    const ecarts = {};
    for (const book of BOOK_ORDER) {
      const reel = chaptersOf(dataset, book);
      if (reel !== BIBLE_BOOKS[book].chapters) ecarts[book] = reel;
    }
    if (Object.keys(ecarts).length) coverage[id] = ecarts;
  }
  return coverage;
}

/** `PSA` s'écrit nu, `1SA` doit être cité : une clé ne commence pas par un chiffre. */
const cle = (book) => (/^[A-Za-z_$][\w$]*$/.test(book) ? book : `"${book}"`);

export function renderCoverage(coverage) {
  const lignes = [];
  for (const [id, ecarts] of Object.entries(coverage)) {
    const absents = Object.entries(ecarts)
      .filter(([, n]) => n === 0)
      .map(([b]) => b);
    const differents = Object.entries(ecarts).filter(([, n]) => n > 0);
    lignes.push(`  ${id}: {`);
    if (absents.length) {
      lignes.push(`    // ${absents.length} livre(s) absent(s) de cette édition`);
      for (const book of absents) lignes.push(`    ${cle(book)}: 0,`);
    }
    for (const [book, n] of differents) {
      lignes.push(`    ${cle(book)}: ${n}, // ${BIBLE_BOOKS[book].chapters} au registre canonique`);
    }
    lignes.push("  },");
  }

  return `/**
 * Ce que chaque version contient réellement — les ÉCARTS au registre canonique.
 *
 * GÉNÉRÉ par \`bun run build:bible-coverage\`, jamais édité à la main.
 * \`tests/unit/bible-coverage.test.ts\` le régénère et le recompare à
 * l'arborescence servie (règle 8 de \`moteur_seo.md\`).
 *
 * Un livre à \`0\` est absent de cette édition. Un nombre différent est une
 * autre versification : Malachie compte 3 chapitres dans la numérotation
 * hébraïque et 4 dans la chrétienne, Joël l'inverse, et la néo-Crampon
 * inclut les additions deutérocanoniques de Daniel et d'Esther.
 *
 * Import relatif avec extension explicite : ce module est lu par le
 * navigateur, par les tests et par les fonctions Netlify.
 */
import type { BibleVersionId } from "./bibleVersions.ts";

import { BIBLE_BOOKS } from "./bibleBooks.ts";

type BookCode = keyof typeof BIBLE_BOOKS;

export const BIBLE_VERSION_COVERAGE: Partial<
  Record<BibleVersionId, Partial<Record<BookCode, number>>>
> = {
${lignes.join("\n")}
};

/**
 * Combien de chapitres cette version sert-elle pour ce livre ?
 *
 * \`0\` signifie « ce livre n'existe pas dans cette édition » — et donc un vrai
 * 404, pas une page vide affirmant servir le texte intégral.
 */
export function chaptersIn(version: BibleVersionId, book: string): number {
  if (!Object.prototype.hasOwnProperty.call(BIBLE_BOOKS, book)) return 0;
  const ecart = BIBLE_VERSION_COVERAGE[version]?.[book as BookCode];
  return ecart ?? BIBLE_BOOKS[book as BookCode].chapters;
}
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const coverage = measureCoverage();
  const cible = join(ROOT, "src/constants/bibleCoverage.ts");
  writeFileSync(cible, renderCoverage(coverage), "utf8");

  let fantomes = 0;
  let caches = 0;
  for (const ecarts of Object.values(coverage)) {
    for (const [book, n] of Object.entries(ecarts)) {
      const canonique = BIBLE_BOOKS[book].chapters;
      if (n < canonique) fantomes += canonique - n;
      else caches += n - canonique;
    }
  }
  console.log(
    `\n✓ src/constants/bibleCoverage.ts — ${Object.keys(coverage).length} version(s) avec écart`,
  );
  console.log(`  ${fantomes} chapitre(s) fantôme(s) désormais en 404`);
  console.log(`  ${caches} chapitre(s) réel(s) désormais accessible(s)\n`);
}
