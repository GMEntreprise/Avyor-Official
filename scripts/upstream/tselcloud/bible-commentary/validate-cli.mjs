#!/usr/bin/env node
/**
 * Garde-fou du corpus de commentaires BRH — `bun run validate:brh-commentary`.
 *
 * Travaille sur les fichiers GÉNÉRÉS, jamais sur les `.docx` : ceux-ci ne sont
 * pas versionnés (contenu sous droits), le contrôle doit donc pouvoir tourner
 * en CI sur un dépôt propre.
 *
 * Échoue si : un fichier manque, un schéma est invalide, un index ne
 * correspond pas au contenu, un identifiant est dupliqué, une référence pointe
 * vers un livre inconnu, ou un commentaire est rattaché à un verset absent du
 * texte biblique servi.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BIBLE_BOOKS } from "../../src/constants/bibleBooks.ts";
import { loadVerseCounts } from "./validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = path.join(ROOT, "public/assets/bible/commentary/brh");
const BIBLE_DATA_DIR = path.join(ROOT, "public/assets/bible/fra_brh_nt");

const SCOPES = new Set(["book", "chapter", "verse", "range", "section"]);
const KINDS = new Set(["commentary", "translation-note"]);
const SPAN_TYPES = new Set(["text", "strong", "emphasis", "reference"]);
const BLOCK_TYPES = new Set(["paragraph", "list"]);

const errors = [];
const fail = (message) => errors.push(message);
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

function checkSpans(spans, context) {
  if (!Array.isArray(spans) || spans.length === 0) {
    fail(`${context} : spans vides`);
    return;
  }
  for (const span of spans) {
    if (!SPAN_TYPES.has(span.type)) fail(`${context} : type de span inconnu « ${span.type} »`);
    if (typeof span.text !== "string" || !span.text) fail(`${context} : span sans texte`);
    if (span.type === "reference") {
      if (!span.ref || !BIBLE_BOOKS[span.ref.bookId]) {
        fail(`${context} : référence vers un livre inconnu « ${span.ref?.bookId} »`);
      }
    }
  }
}

function checkCommentary(commentary, bookId, verseCounts, seenIds) {
  const context = `${bookId} ${commentary.id}`;

  if (typeof commentary.id !== "string" || !commentary.id)
    fail(`${context} : identifiant manquant`);
  if (seenIds.has(commentary.id)) fail(`${context} : identifiant dupliqué`);
  seenIds.add(commentary.id);

  if (!SCOPES.has(commentary.scope)) fail(`${context} : portée inconnue « ${commentary.scope} »`);
  if (!KINDS.has(commentary.kind)) fail(`${context} : nature inconnue « ${commentary.kind} »`);

  if (!Array.isArray(commentary.blocks) || commentary.blocks.length === 0) {
    fail(`${context} : aucun bloc de contenu`);
  } else {
    for (const block of commentary.blocks) {
      if (!BLOCK_TYPES.has(block.type)) {
        fail(`${context} : type de bloc inconnu « ${block.type} »`);
        continue;
      }
      if (block.type === "paragraph") checkSpans(block.spans, context);
      else {
        if (!Array.isArray(block.items) || block.items.length === 0) {
          fail(`${context} : liste vide`);
          continue;
        }
        for (const item of block.items) checkSpans(item.spans, context);
      }
    }
  }

  if (commentary.scope === "section") return;

  const book = BIBLE_BOOKS[bookId];
  if (
    !Number.isInteger(commentary.chapter) ||
    commentary.chapter < 1 ||
    commentary.chapter > book.chapters
  ) {
    fail(`${context} : chapitre ${commentary.chapter} hors de ${bookId} (1–${book.chapters})`);
    return;
  }

  if (commentary.scope !== "verse") return;

  if (!Number.isInteger(commentary.verseStart) || commentary.verseStart < 1) {
    fail(`${context} : verset invalide`);
    return;
  }
  if (!Number.isInteger(commentary.verseEnd) || commentary.verseEnd < commentary.verseStart) {
    fail(`${context} : plage invalide`);
    return;
  }

  const chapterVerses = verseCounts.get(bookId)?.get(commentary.chapter);
  if (chapterVerses && !chapterVerses.has(commentary.verseStart)) {
    fail(
      `${context} : rattaché à ${bookId} ${commentary.chapter}:${commentary.verseStart}, ` +
        "verset absent du texte BRH servi",
    );
  }
}

function main() {
  if (!existsSync(DIR)) {
    console.error(
      "[validate:brh-commentary] corpus absent — lance `bun run import:brh-commentary`.",
    );
    process.exit(1);
  }

  const manifest = readJson(path.join(DIR, "manifest.json"));
  const verseCounts = loadVerseCounts(BIBLE_DATA_DIR);
  const seenIds = new Set();

  let totalCommentaries = 0;

  for (const bookEntry of manifest.books) {
    const bookId = bookEntry.bookId;
    if (!BIBLE_BOOKS[bookId]) {
      fail(`manifeste : livre inconnu « ${bookId} »`);
      continue;
    }

    const indexFile = path.join(DIR, "index", `${bookId}.json`);
    if (!existsSync(indexFile)) {
      fail(`${bookId} : index manquant`);
      continue;
    }
    const index = readJson(indexFile);

    const chapterDir = path.join(DIR, "chapters", bookId);
    const chapterFiles = existsSync(chapterDir)
      ? readdirSync(chapterDir).filter((name) => name.endsWith(".json"))
      : [];

    /** Compteurs reconstruits depuis le contenu, pour les confronter à l'index. */
    const rebuilt = { verses: {}, chapters: [] };
    let bookCommentaries = 0;

    for (const fileName of chapterFiles) {
      const data = readJson(path.join(chapterDir, fileName));
      const chapter = Number(path.basename(fileName, ".json"));
      if (data.chapter !== chapter || data.bookId !== bookId) {
        fail(`${bookId}/${fileName} : en-tête incohérent`);
      }
      for (const commentary of data.commentaries) {
        bookCommentaries++;
        totalCommentaries++;
        checkCommentary(commentary, bookId, verseCounts, seenIds);
        if (commentary.scope === "chapter") {
          if (!rebuilt.chapters.includes(chapter)) rebuilt.chapters.push(chapter);
        } else if (commentary.scope === "verse") {
          const c = String(chapter);
          const v = String(commentary.verseStart);
          rebuilt.verses[c] ??= {};
          rebuilt.verses[c][v] = (rebuilt.verses[c][v] ?? 0) + 1;
        }
      }
    }

    const introFile = path.join(DIR, "intros", `${bookId}.json`);
    if (index.hasIntro && !existsSync(introFile))
      fail(`${bookId} : introduction annoncée mais absente`);
    if (existsSync(introFile)) {
      const intro = readJson(introFile);
      for (const commentary of intro.commentaries) {
        bookCommentaries++;
        totalCommentaries++;
        checkCommentary(commentary, bookId, verseCounts, seenIds);
      }
    }

    rebuilt.chapters.sort((a, b) => a - b);
    if (JSON.stringify(rebuilt.chapters) !== JSON.stringify(index.chapters)) {
      fail(`${bookId} : index des intros de chapitre incohérent avec le contenu`);
    }
    if (JSON.stringify(rebuilt.verses) !== JSON.stringify(index.verses)) {
      fail(`${bookId} : index des versets incohérent avec le contenu`);
    }
    if (bookCommentaries !== bookEntry.commentaries) {
      fail(
        `${bookId} : le manifeste annonce ${bookEntry.commentaries} commentaires, ` +
          `${bookCommentaries} trouvés`,
      );
    }
  }

  if (totalCommentaries !== manifest.totals.commentaries) {
    fail(`manifeste : total annoncé ${manifest.totals.commentaries}, ${totalCommentaries} trouvés`);
  }

  if (errors.length) {
    console.error(`[validate:brh-commentary] ${errors.length} erreur(s) :`);
    for (const error of errors.slice(0, 40)) console.error(`  - ${error}`);
    if (errors.length > 40) console.error(`  … et ${errors.length - 40} autres`);
    process.exit(1);
  }

  console.log(
    `[validate:brh-commentary] OK — ${totalCommentaries.toLocaleString("fr-FR")} commentaires, ` +
      `${manifest.books.length} livres, index cohérent, aucun verset fantôme.`,
  );
}

main();
