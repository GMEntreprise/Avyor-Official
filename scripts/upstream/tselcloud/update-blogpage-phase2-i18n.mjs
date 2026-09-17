#!/usr/bin/env node
/**
 * Phase 2 « Actualités » — clés i18n de l'accueil (11 langues) :
 *   blogPage.sections.{featured, explore, latest, readArticle, viewAll, articles}
 * Additif : n'écrase que blogPage.sections, le reste de blogPage est préservé.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const S = {
  fr: {
    featured: "À la une",
    explore: "Explorer par catégorie",
    latest: "Tous les articles",
    readArticle: "Lire l'article",
    viewAll: "Tout voir",
    articles: "articles",
  },
  en: {
    featured: "Featured",
    explore: "Explore by category",
    latest: "All articles",
    readArticle: "Read article",
    viewAll: "View all",
    articles: "articles",
  },
  es: {
    featured: "Destacado",
    explore: "Explorar por categoría",
    latest: "Todos los artículos",
    readArticle: "Leer artículo",
    viewAll: "Ver todo",
    articles: "artículos",
  },
  de: {
    featured: "Im Fokus",
    explore: "Nach Kategorie entdecken",
    latest: "Alle Artikel",
    readArticle: "Artikel lesen",
    viewAll: "Alle ansehen",
    articles: "Artikel",
  },
  it: {
    featured: "In evidenza",
    explore: "Esplora per categoria",
    latest: "Tutti gli articoli",
    readArticle: "Leggi l'articolo",
    viewAll: "Vedi tutti",
    articles: "articoli",
  },
  pt: {
    featured: "Em destaque",
    explore: "Explorar por categoria",
    latest: "Todos os artigos",
    readArticle: "Ler artigo",
    viewAll: "Ver tudo",
    articles: "artigos",
  },
  ar: {
    featured: "المميّز",
    explore: "استكشف حسب الفئة",
    latest: "كل المقالات",
    readArticle: "اقرأ المقال",
    viewAll: "عرض الكل",
    articles: "مقالات",
  },
  hi: {
    featured: "प्रमुख",
    explore: "श्रेणी से खोजें",
    latest: "सभी लेख",
    readArticle: "लेख पढ़ें",
    viewAll: "सभी देखें",
    articles: "लेख",
  },
  id: {
    featured: "Unggulan",
    explore: "Jelajahi per kategori",
    latest: "Semua artikel",
    readArticle: "Baca artikel",
    viewAll: "Lihat semua",
    articles: "artikel",
  },
  ja: {
    featured: "注目",
    explore: "カテゴリーで探す",
    latest: "すべての記事",
    readArticle: "記事を読む",
    viewAll: "すべて見る",
    articles: "記事",
  },
  zh: {
    featured: "焦点",
    explore: "按分类浏览",
    latest: "全部文章",
    readArticle: "阅读文章",
    viewAll: "查看全部",
    articles: "篇文章",
  },
};

for (const [lang, sections] of Object.entries(S)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.blogPage ??= {};
  json.blogPage.sections = sections;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → blogPage.sections`);
}
console.log("Terminé.");
