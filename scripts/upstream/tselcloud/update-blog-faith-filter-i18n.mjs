#!/usr/bin/env node
/**
 * Ajoute la clé `blogPage.filters.faith` (nouvelle catégorie « Foi ») dans les
 * 11 langues, en préservant l'ordre logique (juste après `all`).
 * Édition sûre : lecture JSON → insertion → réécriture UTF-8 (arabe/CJK OK).
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

// Libellé « Foi » traduit dans chaque langue.
const FAITH = {
  fr: "Foi",
  en: "Faith",
  es: "Fe",
  de: "Glaube",
  it: "Fede",
  pt: "Fé",
  ar: "الإيمان",
  hi: "आस्था",
  id: "Iman",
  ja: "信仰",
  zh: "信仰",
};

for (const [lang, label] of Object.entries(FAITH)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.blogPage ??= {};
  json.blogPage.filters ??= {};
  const f = json.blogPage.filters;
  // Réinsère les filtres avec `faith` juste après `all` (ordre stable).
  json.blogPage.filters = {
    all: f.all,
    faith: label,
    features: f.features,
    whatsnew: f.whatsnew,
    community: f.community,
    security: f.security,
  };
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → blogPage.filters.faith = « ${label} »`);
}
console.log("Terminé.");
