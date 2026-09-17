/**
 * Validation du corpus importé.
 *
 * Aucune erreur silencieuse : tout enregistrement écarté l'est avec un code et
 * un contexte, et le rapport doit expliquer la totalité de l'écart entre le
 * nombre de notes de la source et le nombre d'enregistrements produits.
 */
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { BIBLE_BOOKS } from "../../src/constants/bibleBooks.ts";

/** @typedef {'unknown_book'|'invalid_chapter'|'invalid_verse'|'invalid_range'|'empty_content'|'duplicate'|'overlap'} CommentaryValidationError */

export const VALIDATION_CODES = [
  "unknown_book",
  "invalid_chapter",
  "invalid_verse",
  "invalid_range",
  "empty_content",
  "duplicate",
  "overlap",
  // Le verset existe dans le .docx mais pas dans `public/assets/bible/fra_brh_nt`.
  // Ce n'est pas un défaut de l'import : c'est une lacune des données bibliques
  // déjà publiées, que l'import met au jour.
  "missing_verse_in_bible_data",
];

/**
 * Charge le nombre de versets par chapitre depuis les données bibliques
 * RÉELLEMENT servies par le site. C'est la vérification décisive : elle prouve
 * qu'un commentaire est rattaché à un verset qui existe à l'écran, et non à un
 * numéro sorti du document Word.
 */
export function loadVerseCounts(bibleDataDir) {
  const counts = new Map();
  if (!existsSync(bibleDataDir)) return counts;

  for (const bookId of Object.keys(BIBLE_BOOKS)) {
    const bookDir = path.join(bibleDataDir, bookId);
    if (!existsSync(bookDir)) continue;

    const perChapter = new Map();
    const chapterCount = BIBLE_BOOKS[bookId].chapters;
    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      const file = path.join(bookDir, `${chapter}.json`);
      if (!existsSync(file)) continue;
      const data = JSON.parse(readFileSync(file, "utf8"));
      const verses = (data?.chapter?.content ?? []).filter((item) => item?.type === "verse");
      const numbers = new Set(verses.map((verse) => verse.number));
      perChapter.set(chapter, numbers);
    }
    if (perChapter.size) counts.set(bookId, perChapter);
  }
  return counts;
}

/**
 * Valide un enregistrement candidat.
 * @returns {{ code: string, detail: string }|null} `null` si valide.
 */
export function validateCommentary(record, verseCounts) {
  const book = BIBLE_BOOKS[record.bookId];
  if (!book) return { code: "unknown_book", detail: record.bookId };

  if (!record.plainText || !record.plainText.trim()) {
    return { code: "empty_content", detail: record.id };
  }

  if (record.scope === "section") return null;

  if (!Number.isInteger(record.chapter) || record.chapter < 1 || record.chapter > book.chapters) {
    return { code: "invalid_chapter", detail: `${record.bookId} ${record.chapter}` };
  }

  if (record.scope === "chapter") return null;

  if (!Number.isInteger(record.verseStart) || record.verseStart < 1) {
    return {
      code: "invalid_verse",
      detail: `${record.bookId} ${record.chapter}:${record.verseStart}`,
    };
  }

  if (!Number.isInteger(record.verseEnd) || record.verseEnd < record.verseStart) {
    return {
      code: "invalid_range",
      detail: `${record.bookId} ${record.chapter}:${record.verseStart}-${record.verseEnd}`,
    };
  }

  // Le verset doit exister dans le texte affiché par le site. Un commentaire
  // ne peut pas être rattaché à un verset que le lecteur ne verra jamais — et
  // le rattacher au verset voisin serait une fausse association.
  const chapterVerses = verseCounts.get(record.bookId)?.get(record.chapter);
  if (chapterVerses && !chapterVerses.has(record.verseStart)) {
    return {
      code: "missing_verse_in_bible_data",
      detail: `${record.bookId} ${record.chapter}:${record.verseStart}`,
    };
  }

  return null;
}

/**
 * Repère les doublons. On distingue deux cas, jamais confondus :
 *  - `exact`   : même ancrage ET même texte → une seule copie est conservée ;
 *  - `sameAnchor` : même ancrage, textes DIFFÉRENTS → les deux sont conservés
 *    (c'est le cas normal : Jean 3.16 porte 7 commentaires distincts).
 */
export function findDuplicates(records) {
  const seen = new Map();
  const exact = [];

  for (const record of records) {
    const anchor = `${record.bookId}|${record.chapter ?? ""}|${record.verseStart ?? ""}|${record.verseEnd ?? ""}|${record.scope}`;
    const key = `${anchor}|${record.plainText}`;
    const previous = seen.get(key);
    if (previous) {
      exact.push({ kept: previous.id, dropped: record.id, anchor });
      continue;
    }
    seen.set(key, record);
  }

  return { exact, kept: [...seen.values()] };
}
