/**
 * Structure éditoriale des deux volumes BRH.
 *
 * Les repères sont STRUCTURELS (styles Word, niveaux de plan, runs en gras) et
 * non textuels : aucune expression régulière fragile sur le texte affiché.
 * Chaque règle a été vérifiée sur l'intégralité des deux fichiers — voir
 * `docs/bible/BIBLE_COMMENTARY_AUDIT.md` §7.
 */
import { resolveBibleBookId } from "../../src/utils/bible/reference.ts";

/**
 * Titre de chapitre, auto-descriptif :
 *   « Beréchit/Genèse/Au commencement 1.1-31 »  (Torah : hébreu / français / sens)
 *   « Matityahou/Matthieu 1.1-25 »              (NT : hébreu / français)
 */
const CHAPTER_HEADING_RE = /^(.*?)\s(\d{1,3})\.(\d{1,3})\s*[-–—]\s*(\d{1,3})\s*$/;

/** Un run en gras dont le texte n'est QUE des chiffres est un numéro de verset. */
const VERSE_NUMBER_RE = /^\s*(\d{1,3})\s*$/;

/**
 * Le plus long chapitre du canon est le Psaume 119 (176 versets), et il
 * n'existe pas de verset 0. Un nombre hors de ces bornes est un chiffre en
 * gras dans le corps du texte, pas une numérotation.
 */
const MIN_VERSE = 1;
const MAX_VERSE = 176;

/**
 * Ligne d'ouverture d'une section de lecture hebdomadaire de la Torah
 * (« Parasha 17 : Yitro »). Son numéro est un run en gras SÉPARÉ : sans cette
 * garde, le parcours croit voir un verset 17 dans un chapitre qui n'en compte
 * que 16, et peut y rattacher les notes qui suivent.
 */
const PARASHA_RE = /^\s*Parasha\s+\d+\s*:/i;

export const SOURCES = {
  torah: {
    id: "torah",
    label: "La Torah — traduction du Pentateuque",
    file: "BRH LA TORAH_OCTOBRE 2024.docx",
    isChapterHeading: (p) => p.style === "Titre2",
    isSectionHeading: (p) => p.style === "TITRE10" || p.style === "Titre1",
    /**
     * Édition SANS commentaire (ISBN 978-2-491514-53-2) : ces notes sont des
     * notes de traduction, pas le commentaire messianique. Le typage est
     * volontaire — on ne présente jamais ces notes comme des commentaires.
     */
    defaultKind: "translation-note",
  },
  nt: {
    id: "nt",
    label: "La Brit Hadasha — traduction du Nouveau Testament",
    file: "BRH BRIT HADASHA POUR NOUVELLE EDITION.docx",
    isChapterHeading: (p) => p.outlineLevel === "1" || p.style === "Titre2",
    isSectionHeading: (p) => p.outlineLevel === "0",
    /** Édition AVEC commentaires (ISBN 978-2-491514-28-0). */
    defaultKind: "commentary",
  },
};

/**
 * Analyse un titre de chapitre.
 * @returns {{ labels: string[], bookId: string|null, chapter: number, verseStart: number, verseEnd: number }|null}
 */
export function parseChapterHeading(text) {
  const normalized = text.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();
  const match = CHAPTER_HEADING_RE.exec(normalized);
  if (!match) return null;

  const labels = match[1]
    .split("/")
    .map((label) => label.trim())
    .filter(Boolean);

  // Le nom du livre n'est pas à une position fixe : la Torah ajoute le SENS du
  // nom en troisième segment (« Beréchit/Genèse/Au commencement »). On essaie
  // donc tous les segments, jamais un index.
  let bookId = null;
  for (const label of labels) {
    const resolved = resolveBibleBookId(label);
    if (resolved) {
      bookId = resolved;
      break;
    }
  }

  return {
    labels,
    bookId,
    chapter: Number(match[2]),
    verseStart: Number(match[3]),
    verseEnd: Number(match[4]),
    raw: normalized,
  };
}

/** Numéro de verset porté par un run, ou `null`. */
export function verseNumberOf(run) {
  if (!run.bold) return null;
  const match = VERSE_NUMBER_RE.exec(run.text);
  if (!match) return null;
  const number = Number(match[1]);
  return number >= MIN_VERSE && number <= MAX_VERSE ? number : null;
}

/** La ligne ouvre-t-elle une parasha ? (son numéro n'est pas un verset) */
export function isParashaHeading(paragraph) {
  return PARASHA_RE.test(paragraph.text);
}

/**
 * Parcourt le corps du document et produit les ancres de notes.
 *
 * Invariant capital : un titre de niveau « livre / section » CLÔT le contexte
 * de chapitre. Sans lui, les notes des annexes se rattachent au dernier verset
 * lu — le prototype naïf attribuait 122 notes à Apocalypse 22:21.
 */
export function walkSource(paragraphs, source) {
  const chapters = [];
  const anchors = [];
  /** Notes de préface, d'annexe ou d'épilogue : rattachables à aucun verset. */
  const outOfScripture = [];
  /** Notes portées par un titre de section (« rouleau »). */
  const sectionNotes = [];
  const unresolvedHeadings = [];

  let current = null;
  let currentVerse = null;
  let currentSection = null;
  /** Notes de section en attente du premier livre du groupe. */
  let pendingSectionNotes = [];
  let headingsSincePending = 0;

  paragraphs.forEach((paragraph, index) => {
    const footnoteIds = paragraph.runs.flatMap((run) => run.footnoteIds);

    if (source.isSectionHeading(paragraph) && paragraph.text.trim()) {
      current = null;
      currentVerse = null;
      currentSection = paragraph.text.trim();

      if (footnoteIds.length) {
        // Le livre n'est pas encore connu : un titre de section précède le
        // premier livre du groupe. Il est renseigné au premier chapitre
        // rencontré (voir plus bas).
        pendingSectionNotes = footnoteIds.map((footnoteId) => {
          const note = { footnoteId, label: currentSection, paragraphIndex: index, bookId: null };
          sectionNotes.push(note);
          return note;
        });
        headingsSincePending = 0;
        return;
      }

      // Une introduction de « rouleau » est suivie du titre de son premier
      // livre, puis immédiatement des chapitres. Au-delà d'un seul titre
      // intercalaire, on n'est plus dans ce groupe : c'est du liminaire
      // (préface, glossaire) qui ne doit surtout pas se rattacher à la Genèse.
      headingsSincePending += 1;
      if (headingsSincePending > 1) pendingSectionNotes = [];
      return;
    }

    if (source.isChapterHeading(paragraph)) {
      const heading = parseChapterHeading(paragraph.text);
      if (!heading) {
        unresolvedHeadings.push({ reason: "malformed", text: paragraph.text.trim(), index });
        return;
      }
      if (!heading.bookId) {
        unresolvedHeadings.push({ reason: "unknown_book", text: heading.raw, index });
        current = null;
        currentVerse = null;
        return;
      }

      current = { ...heading, paragraphIndex: index, section: currentSection };
      chapters.push(current);
      currentVerse = null;

      // Une note de section se rattache au premier livre de son groupe.
      for (const note of pendingSectionNotes) note.bookId = heading.bookId;
      pendingSectionNotes = [];

      for (const footnoteId of footnoteIds) {
        anchors.push({
          footnoteId,
          bookId: heading.bookId,
          chapter: heading.chapter,
          verse: null,
          scope: "chapter",
          paragraphIndex: index,
        });
      }
      return;
    }

    // Le numéro d'une parasha n'est pas un numéro de verset.
    if (isParashaHeading(paragraph)) return;

    for (const run of paragraph.runs) {
      const verseNumber = verseNumberOf(run);
      if (verseNumber !== null) currentVerse = verseNumber;

      for (const footnoteId of run.footnoteIds) {
        if (!current) {
          outOfScripture.push({ footnoteId, section: currentSection, paragraphIndex: index });
          continue;
        }
        anchors.push({
          footnoteId,
          bookId: current.bookId,
          chapter: current.chapter,
          verse: currentVerse,
          // Une note rencontrée avant le premier numéro de verset du chapitre
          // appartient au chapitre, pas au verset 1.
          scope: currentVerse === null ? "chapter" : "verse",
          paragraphIndex: index,
        });
      }
    }
  });

  return { chapters, anchors, outOfScripture, sectionNotes, unresolvedHeadings };
}
