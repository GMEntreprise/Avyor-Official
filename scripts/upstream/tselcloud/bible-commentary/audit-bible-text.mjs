#!/usr/bin/env node
/**
 * Audit du texte biblique BRH servi par le site.
 *
 * Compare, chapitre par chapitre, les numéros de versets présents dans les
 * `.docx` (source éditoriale) à ceux présents dans
 * `public/assets/bible/fra_brh_nt/` (ce que le lecteur affiche réellement).
 *
 * Ce contrôle est né d'un constat de l'import des commentaires : 32 notes ne
 * pouvaient pas être publiées parce que leur verset support n'existait pas
 * dans les données du site — dont 1 Corinthiens 13, qui s'arrête au verset 12.
 * Il fallait mesurer l'ampleur réelle du problème avant de corriger quoi que
 * ce soit.
 *
 * Ce script ne modifie rien : il constate.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openDocx } from "./zip.mjs";
import { parseParagraphs } from "./docx.mjs";
import { SOURCES, isParashaHeading, parseChapterHeading, verseNumberOf } from "./brh-source.mjs";
import { BIBLE_BOOKS, BOOK_ORDER } from "../../src/constants/bibleBooks.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BIBLE_DATA = path.join(ROOT, "public/assets/bible/fra_brh_nt");

const n = (value) => value.toLocaleString("fr-FR").replace(/ | /g, " ");

/**
 * Versets d'un chapitre tels que le `.docx` les donne.
 *
 * Un numéro de verset est un run en gras dont le texte est purement numérique.
 * Les numéros écrits entre parenthèses (Jean 7:53–8:11, la péricope) ne sont
 * pas des runs numériques : ils ne sont donc pas comptés ici, et ce n'est pas
 * une omission mais la structure réelle du document.
 */
export function versesFromSource() {
  const perChapter = new Map();

  for (const source of Object.values(SOURCES)) {
    const filePath = path.join(ROOT, source.file);
    if (!existsSync(filePath)) {
      throw new Error(
        `Source absente : ${source.file}\n` +
          "Cet audit a besoin des .docx (non versionnés, contenu sous droits).",
      );
    }

    const paragraphs = parseParagraphs(openDocx(filePath).readText("word/document.xml"));
    let current = null;

    paragraphs.forEach((paragraph) => {
      if (source.isSectionHeading(paragraph) && paragraph.text.trim()) {
        current = null;
        return;
      }

      if (source.isChapterHeading(paragraph)) {
        const heading = parseChapterHeading(paragraph.text);
        current = heading?.bookId ? heading : null;
        if (current) {
          const key = `${current.bookId}|${current.chapter}`;
          if (!perChapter.has(key)) {
            perChapter.set(key, {
              bookId: current.bookId,
              chapter: current.chapter,
              // Le titre annonce lui-même la plage : « … 13.1-13 ».
              announcedFrom: current.verseStart,
              announcedTo: current.verseEnd,
              verses: new Set(),
            });
          }
        }
        return;
      }

      if (!current) return;
      if (isParashaHeading(paragraph)) return;
      const entry = perChapter.get(`${current.bookId}|${current.chapter}`);
      for (const run of paragraph.runs) {
        const verse = verseNumberOf(run);
        if (verse !== null) entry.verses.add(verse);
      }
    });
  }

  return perChapter;
}

/** Versets réellement servis par le site pour un chapitre. */
function versesFromSite(bookId, chapter) {
  const file = path.join(BIBLE_DATA, bookId, `${chapter}.json`);
  if (!existsSync(file)) return null;
  const data = JSON.parse(readFileSync(file, "utf8"));
  const verses = (data?.chapter?.content ?? []).filter((item) => item?.type === "verse");
  return new Set(verses.map((verse) => verse.number));
}

function main() {
  const source = versesFromSource();
  const gaps = [];
  const missingFiles = [];
  const extras = [];

  const perBook = new Map();

  for (const [, entry] of source) {
    const site = versesFromSite(entry.bookId, entry.chapter);
    if (site === null) {
      missingFiles.push(`${entry.bookId} ${entry.chapter}`);
      continue;
    }

    const missing = [...entry.verses].filter((verse) => !site.has(verse)).sort((a, b) => a - b);
    const extra = [...site].filter((verse) => !entry.verses.has(verse)).sort((a, b) => a - b);

    if (!perBook.has(entry.bookId)) {
      perBook.set(entry.bookId, { chapters: 0, sourceVerses: 0, siteVerses: 0, missing: 0 });
    }
    const stats = perBook.get(entry.bookId);
    stats.chapters += 1;
    stats.sourceVerses += entry.verses.size;
    stats.siteVerses += site.size;
    stats.missing += missing.length;

    if (missing.length) {
      gaps.push({
        bookId: entry.bookId,
        chapter: entry.chapter,
        missing,
        announcedTo: entry.announcedTo,
        sourceCount: entry.verses.size,
        siteCount: site.size,
      });
    }
    if (extra.length) {
      extras.push({ bookId: entry.bookId, chapter: entry.chapter, extra });
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  AUDIT DU TEXTE BIBLIQUE BRH — .docx source  ↔  données servies   ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  let totalSource = 0;
  let totalSite = 0;
  let totalMissing = 0;

  console.log("  livre                    chapitres  versets source  versets servis  manquants");
  console.log("  " + "─".repeat(78));
  for (const bookId of BOOK_ORDER) {
    const stats = perBook.get(bookId);
    if (!stats) continue;
    totalSource += stats.sourceVerses;
    totalSite += stats.siteVerses;
    totalMissing += stats.missing;
    console.log(
      `  ${BIBLE_BOOKS[bookId].name.padEnd(24)} ${String(stats.chapters).padStart(9)} ` +
        `${String(stats.sourceVerses).padStart(15)} ${String(stats.siteVerses).padStart(15)} ` +
        `${String(stats.missing).padStart(10)}` +
        (stats.missing ? "  ←" : ""),
    );
  }
  console.log("  " + "─".repeat(78));
  console.log(
    `  ${"TOTAL".padEnd(24)} ${String([...perBook.values()].reduce((t, s) => t + s.chapters, 0)).padStart(9)} ` +
      `${n(totalSource).padStart(15)} ${n(totalSite).padStart(15)} ${n(totalMissing).padStart(10)}`,
  );

  if (missingFiles.length) {
    console.log(`\n■ Chapitres sans fichier sur le site (${missingFiles.length})`);
    for (const item of missingFiles) console.log(`    ${item}`);
  }

  if (gaps.length) {
    console.log(
      `\n■ Versets présents dans la source, absents du site (${gaps.length} chapitres)\n`,
    );
    for (const gap of gaps) {
      const truncated =
        gap.missing.length > 1 &&
        gap.missing[gap.missing.length - 1] === gap.announcedTo &&
        gap.missing.every((verse, index) => verse === gap.missing[0] + index);
      console.log(
        `    ${(BIBLE_BOOKS[gap.bookId].name + " " + gap.chapter).padEnd(24)} ` +
          `manque ${gap.missing.join(", ").padEnd(28)} ` +
          `(source ${gap.sourceCount}, site ${gap.siteCount})` +
          (truncated ? "  ← fin de chapitre tronquée" : ""),
      );
    }
  }

  if (extras.length) {
    console.log(`\n■ Versets servis mais absents de la source (${extras.length} chapitres)`);
    console.log("    (numéros entre parenthèses dans le .docx, ou découpage différent)\n");
    for (const extra of extras.slice(0, 20)) {
      console.log(
        `    ${(BIBLE_BOOKS[extra.bookId].name + " " + extra.chapter).padEnd(24)} ` +
          `en plus : ${extra.extra.join(", ")}`,
      );
    }
    if (extras.length > 20) console.log(`    … et ${extras.length - 20} autres chapitres`);
  }

  console.log(
    `\n■ Bilan : ${n(totalMissing)} verset(s) manquant(s) sur ${n(totalSource)} — ` +
      `${((totalMissing / totalSource) * 100).toFixed(2)} %\n`,
  );

  // Ce script constate, il ne bloque pas : la correction est un acte éditorial
  // séparé (voir `fix-bible-text.mjs`).
  process.exitCode = 0;
}

if (process.env.AUDIT_CLI !== "0") main();
