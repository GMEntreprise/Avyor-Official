#!/usr/bin/env node
/**
 * Phase 3 « Actualités » — clés i18n (11 langues) :
 *   blogPage.search.{open, placeholder, recent, popular, noResults, hint}
 *   blogPage.sections.forYou
 * Additif : n'écrase que ces clés, le reste est préservé.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N = resolve(__dirname, "../src/i18n");

const D = {
  fr: {
    open: "Rechercher un article…",
    placeholder: "Rechercher par titre, thème, mot-clé…",
    recent: "Recherches récentes",
    popular: "Sujets populaires",
    noResults: "Aucun article trouvé",
    hint: "pour ouvrir",
    forYou: "Pour vous",
  },
  en: {
    open: "Search an article…",
    placeholder: "Search by title, topic, keyword…",
    recent: "Recent searches",
    popular: "Popular topics",
    noResults: "No article found",
    hint: "to open",
    forYou: "For you",
  },
  es: {
    open: "Buscar un artículo…",
    placeholder: "Buscar por título, tema, palabra clave…",
    recent: "Búsquedas recientes",
    popular: "Temas populares",
    noResults: "Ningún artículo encontrado",
    hint: "para abrir",
    forYou: "Para ti",
  },
  de: {
    open: "Artikel suchen…",
    placeholder: "Nach Titel, Thema, Stichwort suchen…",
    recent: "Letzte Suchen",
    popular: "Beliebte Themen",
    noResults: "Kein Artikel gefunden",
    hint: "zum Öffnen",
    forYou: "Für dich",
  },
  it: {
    open: "Cerca un articolo…",
    placeholder: "Cerca per titolo, tema, parola chiave…",
    recent: "Ricerche recenti",
    popular: "Argomenti popolari",
    noResults: "Nessun articolo trovato",
    hint: "per aprire",
    forYou: "Per te",
  },
  pt: {
    open: "Procurar um artigo…",
    placeholder: "Procurar por título, tema, palavra-chave…",
    recent: "Pesquisas recentes",
    popular: "Temas populares",
    noResults: "Nenhum artigo encontrado",
    hint: "para abrir",
    forYou: "Para ti",
  },
  ar: {
    open: "ابحث عن مقال…",
    placeholder: "ابحث بالعنوان أو الموضوع أو كلمة مفتاحية…",
    recent: "عمليات البحث الأخيرة",
    popular: "مواضيع رائجة",
    noResults: "لا يوجد مقال",
    hint: "للفتح",
    forYou: "لك",
  },
  hi: {
    open: "लेख खोजें…",
    placeholder: "शीर्षक, विषय, कीवर्ड से खोजें…",
    recent: "हाल की खोजें",
    popular: "लोकप्रिय विषय",
    noResults: "कोई लेख नहीं मिला",
    hint: "खोलने के लिए",
    forYou: "आपके लिए",
  },
  id: {
    open: "Cari artikel…",
    placeholder: "Cari berdasarkan judul, topik, kata kunci…",
    recent: "Pencarian terkini",
    popular: "Topik populer",
    noResults: "Tidak ada artikel",
    hint: "untuk membuka",
    forYou: "Untukmu",
  },
  ja: {
    open: "記事を検索…",
    placeholder: "タイトル・テーマ・キーワードで検索…",
    recent: "最近の検索",
    popular: "人気のトピック",
    noResults: "記事が見つかりません",
    hint: "で開く",
    forYou: "あなたへ",
  },
  zh: {
    open: "搜索文章…",
    placeholder: "按标题、主题、关键词搜索…",
    recent: "最近搜索",
    popular: "热门主题",
    noResults: "未找到文章",
    hint: "打开",
    forYou: "为你推荐",
  },
};

for (const [lang, d] of Object.entries(D)) {
  const path = resolve(I18N, lang, "common.json");
  const json = JSON.parse(await readFile(path, "utf8"));
  json.blogPage ??= {};
  json.blogPage.search = {
    open: d.open,
    placeholder: d.placeholder,
    recent: d.recent,
    popular: d.popular,
    noResults: d.noResults,
    hint: d.hint,
  };
  json.blogPage.sections ??= {};
  json.blogPage.sections.forYou = d.forYou;
  await writeFile(path, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`✓ ${lang} → blogPage.search + sections.forYou`);
}
console.log("Terminé.");
