#!/usr/bin/env node
/** Fast, dependency-free regression guard for the three reported flows. */
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const [map, bible, contact, schema, app, sitemap, verse, reader, indicator, countries, stats] =
  await Promise.all([
    read("src/components/WorldPresenceSection/WorldMap.tsx"),
    read("src/components/bible/NavigationPicker.tsx"),
    read("src/components/Contact.tsx"),
    read("src/schemas/contact.ts"),
    read("src/App.tsx"),
    read("public/sitemap.xml"),
    read("src/components/bible/BibleVerse.tsx"),
    read("src/components/bible/BibleReader.tsx"),
    read("src/components/bible/commentary/VerseCommentaryButton.tsx"),
    read("src/data/countries.ts"),
    read("src/data/stats.ts"),
  ]);

assert.match(map, /cartocdn\.com/);
assert.match(map, /distanceTo\(e\.containerPoint\) > 6/);
assert.match(map, /dragged\.current/);
assert.match(bible, /setSelectedBook\(currentBook\)/);
assert.match(bible, /type="button"/);
assert.match(schema, /\.trim\(\)/);
assert.match(schema, /z\.preprocess/);
assert.match(contact, /normalizedData/);
assert.match(contact, /nameField\.ref\(element\)/);
assert.doesNotMatch(contact, /description:\s*error\.message/);
assert.match(app, /path="\/bible"/);
assert.match(sitemap, /https:\/\/connectstar\.app\/carte/);
for (const code of ["LT", "RW", "LV", "AE", "SA", "AL"]) {
  assert.match(countries, new RegExp(`code: "${code}"`));
}
assert.match(stats, /countries: 33/);

// ── Commentaires BRH : non-régression du lecteur ────────────────────────────
// Le sélecteur de livres desktop a déjà régressé une fois (docs/BIBLE_SELECTOR_AUDIT.md).
// La couche commentaires ne doit ni le toucher, ni capter les gestes existants.
assert.match(bible, /setSelectedBook\(currentBook\)/, "picker: resync livre/chapitre perdue");
assert.doesNotMatch(
  bible,
  /commentary/i,
  "picker: la couche commentaires ne doit pas s'y immiscer",
);

// Le clic sur un verset ouvre déjà `verseActions` : le bouton de commentaire
// doit rester un déclencheur distinct, sinon ce geste est cassé.
assert.match(
  indicator,
  /event\.stopPropagation\(\)/,
  "bouton commentaire: le clic doit être isolé",
);
assert.match(indicator, /aria-expanded/, "bouton commentaire: état accessible manquant");
assert.match(indicator, /aria-controls/, "bouton commentaire: liaison au panneau manquante");

// Découvrabilité : un libellé explicite, jamais un simple trait décoratif.
assert.match(indicator, /commentary\.badge/, "bouton commentaire: libellé visible manquant");
assert.match(verse, /VerseCommentaryButton/, "BibleVerse: bouton de commentaire absent");

// La couche est facultative : sans elle, le lecteur se comporte comme avant.
assert.match(verse, /commentaryCount = 0/, "BibleVerse: la couche doit rester optionnelle");
assert.match(reader, /commentary\?\./, "BibleReader: la couche doit rester optionnelle");

// L'index doit rester une lecture O(1) : jamais un balayage du corpus.
assert.doesNotMatch(verse, /\.filter\(/, "BibleVerse: aucun filtrage de corpus dans un verset");

console.log("[reliability-audit] map, bible selector, contact and BRH commentary guards: OK");
