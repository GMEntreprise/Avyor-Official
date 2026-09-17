#!/usr/bin/env node
/**
 * Renomme « Blog » → « Actualités » (libellé visible uniquement — l'URL /blog
 * ne change pas) dans les 11 langues :
 *   navigation.blog   (navbar + footer)
 *   blogHero.badge    (badge du hero)
 * Réutilise la traduction exacte de blogPage.poster.sub pour la cohérence.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");
const LANGS = ["fr", "en", "es", "de", "it", "pt", "ar", "hi", "id", "ja", "zh"];

for (const lang of LANGS) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  // « Actualités » localisé = blogPage.poster.sub (déjà traduit), repli "Actualités".
  const word = json.blogPage?.poster?.sub || "Actualités";
  json.navigation ??= {};
  json.navigation.blog = word;
  json.blogHero ??= {};
  json.blogHero.badge = word;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → navigation.blog / blogHero.badge = « ${word} »`);
}
console.log("Terminé.");
