#!/usr/bin/env node
/**
 * Import déterministe des commentaires BRH.
 *
 *   .docx  →  parseur OOXML  →  ancrage structurel  →  normalisation des
 *   références  →  validation  →  fichiers JSON statiques  →  rapports
 *
 * Idempotent : deux exécutions produisent des fichiers identiques au bit près
 * (aucun horodatage, clés triées). C'est vérifiable par empreinte SHA-256.
 *
 * Usage :
 *   node scripts/bible-commentary/import-brh.mjs [--dry-run] [--source=nt|torah]
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openDocx } from "./zip.mjs";
import { parseFootnotes, parseParagraphs } from "./docx.mjs";
import { SOURCES, walkSource } from "./brh-source.mjs";
import { buildBlocks, blocksToSearchText } from "./rich-text.mjs";
import { findDuplicates, loadVerseCounts, validateCommentary } from "./validate.mjs";
import { BIBLE_BOOKS, BOOK_ORDER } from "../../src/constants/bibleBooks.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT_DIR = path.join(ROOT, "public/assets/bible/commentary/brh");
const BIBLE_DATA_DIR = path.join(ROOT, "public/assets/bible/fra_brh_nt");
const DOCS_DIR = path.join(ROOT, "docs/bible");

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const onlySource = args.find((arg) => arg.startsWith("--source="))?.split("=")[1];

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/** JSON déterministe : clés triées, indentation stable, saut de ligne final. */
function stableStringify(value) {
  const sort = (input) => {
    if (Array.isArray(input)) return input.map(sort);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.keys(input)
          .sort()
          .map((key) => [key, sort(input[key])]),
      );
    }
    return input;
  };
  return `${JSON.stringify(sort(value), null, 2)}\n`;
}

/** Variante compacte : ces fichiers sont générés, jamais relus à la main. */
function compactStringify(value) {
  const sort = (input) => {
    if (Array.isArray(input)) return input.map(sort);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.keys(input)
          .sort()
          .map((key) => [key, sort(input[key])]),
      );
    }
    return input;
  };
  return `${JSON.stringify(sort(value))}\n`;
}

function scopeSlug(anchor) {
  if (anchor.scope === "verse") return String(anchor.verse);
  if (anchor.scope === "chapter") return "c";
  return "s";
}

/** Extrait les enregistrements d'un volume. */
function extractSource(source, verseCounts) {
  const filePath = path.join(ROOT, source.file);
  if (!existsSync(filePath)) {
    throw new Error(
      `Fichier source introuvable : ${source.file}\n` +
        "Place le .docx à la racine du dépôt (il n'est pas versionné : contenu sous droits).",
    );
  }

  const docx = openDocx(filePath);
  const documentXml = docx.readText("word/document.xml");
  const footnotesXml = docx.readText("word/footnotes.xml");

  const paragraphs = parseParagraphs(documentXml);
  const footnotes = parseFootnotes(footnotesXml);
  const walk = walkSource(paragraphs, source);

  const records = [];
  const invalid = [];
  let order = 0;

  const emit = (anchor, scope) => {
    const noteParagraphs = footnotes.get(anchor.footnoteId);
    if (!noteParagraphs) {
      invalid.push({
        code: "empty_content",
        detail: `note ${anchor.footnoteId} sans corps dans footnotes.xml`,
      });
      return;
    }

    const { blocks, plainText } = buildBlocks(noteParagraphs);
    const record = {
      id: `brh-${anchor.bookId}-${anchor.chapter ?? 0}-${scopeSlug(anchor)}-${anchor.footnoteId}`,
      source: "BRH",
      bookId: anchor.bookId,
      scope,
      kind: source.defaultKind,
      chapter: anchor.chapter ?? undefined,
      verseStart: scope === "verse" ? anchor.verse : undefined,
      verseEnd: scope === "verse" ? anchor.verse : undefined,
      blocks,
      plainText,
      searchText: blocksToSearchText(blocks),
      order: order++,
      sourceFootnoteId: anchor.footnoteId,
    };

    const error = validateCommentary(record, verseCounts);
    if (error) {
      invalid.push({ ...error, id: record.id });
      return;
    }
    records.push(record);
  };

  for (const anchor of walk.anchors) emit(anchor, anchor.scope);

  // Introductions de « rouleau » : rattachées au premier livre de leur groupe.
  // Celles restées sans livre (préface, annexes) ne sont PAS émises — elles ne
  // se rapportent à aucun passage. Elles restent comptées dans le rapport.
  const attachableSectionNotes = walk.sectionNotes.filter((note) => note.bookId);
  for (const note of attachableSectionNotes) {
    emit({ ...note, chapter: null, verse: null, scope: "section" }, "section");
  }

  return {
    walk,
    footnotes,
    records,
    invalid,
    attachableSectionNotes: attachableSectionNotes.length,
    filePath,
  };
}

function buildBookFiles(records) {
  const byBook = new Map();
  for (const record of records) {
    if (!byBook.has(record.bookId)) byBook.set(record.bookId, []);
    byBook.get(record.bookId).push(record);
  }

  const books = [];
  for (const bookId of BOOK_ORDER) {
    const bookRecords = byBook.get(bookId);
    if (!bookRecords) continue;

    // Ordre de lecture : chapitre, puis verset, puis ordre du document.
    bookRecords.sort(
      (a, b) =>
        (a.chapter ?? 0) - (b.chapter ?? 0) ||
        (a.verseStart ?? 0) - (b.verseStart ?? 0) ||
        a.order - b.order,
    );

    /** Index léger : ce qui suffit à afficher les indicateurs, sans le texte. */
    const index = { verses: {}, chapters: [] };
    for (const record of bookRecords) {
      if (record.scope === "chapter") {
        if (!index.chapters.includes(record.chapter)) index.chapters.push(record.chapter);
        continue;
      }
      if (record.scope !== "verse") continue;
      const chapter = String(record.chapter);
      const verse = String(record.verseStart);
      index.verses[chapter] ??= {};
      index.verses[chapter][verse] = (index.verses[chapter][verse] ?? 0) + 1;
    }
    index.chapters.sort((a, b) => a - b);

    books.push({
      bookId,
      name: BIBLE_BOOKS[bookId].name,
      records: bookRecords,
      index,
    });
  }
  return books;
}

/** Projection publiée : `plainText` et l'id de note source restent hors ligne. */
function toPayload(record) {
  return {
    id: record.id,
    scope: record.scope,
    kind: record.kind,
    chapter: record.chapter,
    verseStart: record.verseStart,
    verseEnd: record.verseEnd,
    blocks: record.blocks,
    searchText: record.searchText,
    order: record.order,
  };
}

function formatCount(value) {
  return value.toLocaleString("fr-FR").replace(/ | /g, " ");
}

async function main() {
  const verseCounts = loadVerseCounts(BIBLE_DATA_DIR);
  const selected = Object.values(SOURCES).filter(
    (source) => !onlySource || source.id === onlySource,
  );
  if (selected.length === 0) {
    throw new Error(`Source inconnue : ${onlySource}. Valeurs possibles : nt, torah.`);
  }

  const allRecords = [];
  const report = [];

  for (const source of selected) {
    const extracted = extractSource(source, verseCounts);
    const { walk, footnotes, records, invalid } = extracted;

    const anchoredIds = new Set(walk.anchors.map((anchor) => anchor.footnoteId));
    const sectionIds = new Set(walk.sectionNotes.map((note) => note.footnoteId));
    const outOfScriptureIds = new Set(walk.outOfScripture.map((note) => note.footnoteId));

    report.push({
      source,
      footnotesInFile: footnotes.size,
      anchored: walk.anchors.length,
      sectionNotes: walk.sectionNotes.length,
      attachableSectionNotes: extracted.attachableSectionNotes,
      outOfScripture: walk.outOfScripture.length,
      chapters: walk.chapters.length,
      unresolvedHeadings: walk.unresolvedHeadings,
      records,
      invalid,
      accounted: anchoredIds.size + sectionIds.size + outOfScriptureIds.size,
      sourceChecksum: sha256(readFileSync(extracted.filePath)),
    });

    allRecords.push(...records);
  }

  const { exact: exactDuplicates, kept } = findDuplicates(allRecords);
  const books = buildBookFiles(kept);

  // ── Écriture ────────────────────────────────────────────────────────────
  if (!isDryRun) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
    mkdirSync(path.join(OUTPUT_DIR, "chapters"), { recursive: true });
    mkdirSync(path.join(OUTPUT_DIR, "index"), { recursive: true });
    mkdirSync(path.join(OUTPUT_DIR, "intros"), { recursive: true });

    const manifestBooks = [];
    for (const book of books) {
      let bytes = 0;

      // Un fichier par chapitre : c'est la granularité que le lecteur utilise
      // réellement, et celle déjà employée par `public/assets/bible/<version>/`.
      const byChapter = new Map();
      const intros = [];
      for (const record of book.records) {
        if (record.scope === "section") {
          intros.push(record);
          continue;
        }
        const chapter = record.chapter;
        if (!byChapter.has(chapter)) byChapter.set(chapter, []);
        byChapter.get(chapter).push(record);
      }

      if (byChapter.size) {
        mkdirSync(path.join(OUTPUT_DIR, "chapters", book.bookId), { recursive: true });
      }
      for (const [chapter, records] of [...byChapter].sort((a, b) => a[0] - b[0])) {
        const json = compactStringify({
          bookId: book.bookId,
          chapter,
          commentaries: records.map(toPayload),
        });
        bytes += Buffer.byteLength(json);
        writeFileSync(
          path.join(OUTPUT_DIR, "chapters", book.bookId, `${chapter}.json`),
          json,
          "utf8",
        );
      }

      if (intros.length) {
        const json = compactStringify({
          bookId: book.bookId,
          commentaries: intros.map(toPayload),
        });
        bytes += Buffer.byteLength(json);
        writeFileSync(path.join(OUTPUT_DIR, "intros", `${book.bookId}.json`), json, "utf8");
      }

      const indexJson = compactStringify({
        bookId: book.bookId,
        chapters: book.index.chapters,
        hasIntro: intros.length > 0,
        verses: book.index.verses,
      });
      writeFileSync(path.join(OUTPUT_DIR, "index", `${book.bookId}.json`), indexJson, "utf8");

      manifestBooks.push({
        bookId: book.bookId,
        commentaries: book.records.length,
        chapterIntros: book.index.chapters.length,
        bookIntro: intros.length > 0,
        versesCovered: Object.values(book.index.verses).reduce(
          (total, chapter) => total + Object.keys(chapter).length,
          0,
        ),
        bytes,
        indexBytes: Buffer.byteLength(indexJson),
      });
    }

    writeFileSync(
      path.join(OUTPUT_DIR, "manifest.json"),
      stableStringify({
        source: "BRH",
        edition: "Bible des Racines Hébraïques — Éditions Sh'ma",
        attribution: "© Éditions Sh'ma — tous droits réservés",
        // Volontairement pas d'horodatage : l'import doit être idempotent.
        volumes: report.map((entry) => ({
          id: entry.source.id,
          label: entry.source.label,
          file: entry.source.file,
          kind: entry.source.defaultKind,
          sourceChecksum: entry.sourceChecksum,
          footnotesInFile: entry.footnotesInFile,
        })),
        totals: {
          commentaries: kept.length,
          books: manifestBooks.length,
        },
        books: manifestBooks,
      }),
      "utf8",
    );
  }

  // ── Rapports ────────────────────────────────────────────────────────────
  const lines = [];
  lines.push("# Rapport d'import — commentaires BRH", "");
  lines.push(
    "> Généré par `bun run import:brh-commentary`. Ce fichier rend compte de la",
    "> TOTALITÉ des notes des fichiers sources : toute note non importée est",
    "> comptée et expliquée.",
    "",
  );

  for (const entry of report) {
    const kinds = new Map();
    for (const record of entry.records) {
      kinds.set(record.scope, (kinds.get(record.scope) ?? 0) + 1);
    }
    lines.push(`## ${entry.source.label}`, "");
    lines.push(`- Fichier : \`${entry.source.file}\``);
    lines.push(`- Empreinte SHA-256 de la source : \`${entry.sourceChecksum}\``);
    lines.push(`- Type de notes : \`${entry.source.defaultKind}\``);
    lines.push("");
    lines.push("| Poste | Nombre |", "|---|---:|");
    lines.push(`| Notes présentes dans le fichier | ${formatCount(entry.footnotesInFile)} |`);
    lines.push(`| Chapitres détectés | ${formatCount(entry.chapters)} |`);
    lines.push(`| Ancrées à un verset | ${formatCount(kinds.get("verse") ?? 0)} |`);
    lines.push(`| Ancrées à un chapitre | ${formatCount(kinds.get("chapter") ?? 0)} |`);
    lines.push(
      `| Notes de section (rouleaux) | ${formatCount(entry.sectionNotes)} dont ${formatCount(entry.attachableSectionNotes)} rattachables |`,
    );
    lines.push(`| Hors Écriture (préface, annexes) | ${formatCount(entry.outOfScripture)} |`);
    lines.push(`| Écartées par la validation | ${formatCount(entry.invalid.length)} |`);
    lines.push("");

    const total = entry.anchored + entry.sectionNotes + entry.outOfScripture;
    const balanced = total === entry.footnotesInFile;
    lines.push(
      `**Comptabilité** : ${formatCount(entry.anchored)} ancrées + ` +
        `${formatCount(entry.sectionNotes)} de section + ` +
        `${formatCount(entry.outOfScripture)} hors Écriture = ` +
        `${formatCount(total)} — ` +
        (balanced
          ? "**égal** au nombre de notes du fichier. Aucune donnée perdue."
          : `**ÉCART de ${formatCount(entry.footnotesInFile - total)} notes non expliqué.**`),
      "",
    );

    if (entry.unresolvedHeadings.length) {
      lines.push("### Titres de chapitre non résolus", "");
      for (const heading of entry.unresolvedHeadings.slice(0, 20)) {
        lines.push(`- \`${heading.reason}\` — « ${heading.text} » (paragraphe ${heading.index})`);
      }
      lines.push("");
    }

    if (entry.invalid.length) {
      const byCode = new Map();
      for (const error of entry.invalid) {
        if (!byCode.has(error.code)) byCode.set(error.code, []);
        byCode.get(error.code).push(error);
      }
      lines.push("### Enregistrements écartés", "");
      for (const [code, errors] of byCode) {
        lines.push(`- \`${code}\` : ${errors.length}`);
        for (const error of errors.slice(0, 8)) lines.push(`  - ${error.detail}`);
      }
      lines.push("");
    }
  }

  lines.push("## Doublons", "");
  lines.push(
    exactDuplicates.length === 0
      ? "Aucun doublon exact (même ancrage **et** même texte)."
      : `${formatCount(exactDuplicates.length)} doublons exacts fusionnés (même ancrage et même texte).`,
    "",
    "Les notes multiples sur un même verset avec des textes différents ne sont",
    "**pas** des doublons : Jean 3:16 porte 7 commentaires distincts. Elles sont",
    "toutes conservées.",
    "",
  );
  for (const duplicate of exactDuplicates.slice(0, 15)) {
    lines.push(
      `- \`${duplicate.anchor}\` — conservé \`${duplicate.kept}\`, écarté \`${duplicate.dropped}\``,
    );
  }
  if (exactDuplicates.length) lines.push("");

  const missingVerses = report.flatMap((entry) =>
    entry.invalid
      .filter((error) => error.code === "missing_verse_in_bible_data")
      .map((error) => error.detail),
  );
  if (missingVerses.length) {
    const counted = new Map();
    for (const detail of missingVerses) counted.set(detail, (counted.get(detail) ?? 0) + 1);
    lines.push("## Versets absents des données bibliques du site", "");
    lines.push(
      "Ces commentaires existent dans la source BRH, mais le verset qu'ils",
      "annotent **n'est pas présent** dans `public/assets/bible/fra_brh_nt`.",
      "Ils ne sont donc pas publiés : les rattacher au verset voisin serait une",
      "fausse association. Il ne s'agit pas d'un défaut de l'import mais d'une",
      "**lacune des données bibliques déjà en ligne**, que l'import met au jour.",
      "",
      "| Référence | Commentaires perdus |",
      "|---|---:|",
    );
    for (const [reference, count] of [...counted].sort()) {
      lines.push(`| ${reference} | ${count} |`);
    }
    lines.push(
      "",
      `**${formatCount(missingVerses.length)} commentaires** sont concernés. Corriger les fichiers`,
      "de chapitre concernés les rendra automatiquement disponibles au prochain import.",
      "",
    );
  }

  lines.push("## Total importé", "");
  lines.push("| Poste | Nombre |", "|---|---:|");
  lines.push(`| Enregistrements écrits | ${formatCount(kept.length)} |`);
  lines.push(`| Livres couverts | ${formatCount(books.length)} |`);
  lines.push("");

  if (!isDryRun) {
    mkdirSync(DOCS_DIR, { recursive: true });
    writeFileSync(
      path.join(DOCS_DIR, "BRH_COMMENTARY_IMPORT_REPORT.md"),
      `${lines.join("\n")}\n`,
      "utf8",
    );
  }

  // ── Couverture ──────────────────────────────────────────────────────────
  const coverage = [];
  coverage.push("# Couverture du corpus BRH", "");
  coverage.push(
    "> Généré par `bun run import:brh-commentary`. Chiffres mesurés, jamais estimés.",
    "",
  );
  coverage.push(
    "| Livre | Commentaires | Chapitres commentés | Versets couverts | Intros de chapitre |",
    "|---|---:|---:|---:|---:|",
  );
  let totalCommentaries = 0;
  let totalVerses = 0;
  for (const book of books) {
    const versesCovered = Object.values(book.index.verses).reduce(
      (total, chapter) => total + Object.keys(chapter).length,
      0,
    );
    totalCommentaries += book.records.length;
    totalVerses += versesCovered;
    coverage.push(
      `| ${book.name} | ${formatCount(book.records.length)} | ${formatCount(Object.keys(book.index.verses).length)} | ${formatCount(versesCovered)} | ${formatCount(book.index.chapters.length)} |`,
    );
  }
  coverage.push(
    `| **TOTAL** | **${formatCount(totalCommentaries)}** | | **${formatCount(totalVerses)}** | |`,
    "",
  );

  if (!isDryRun) {
    writeFileSync(
      path.join(DOCS_DIR, "BRH_COMMENTARY_COVERAGE.md"),
      `${coverage.join("\n")}\n`,
      "utf8",
    );
  }

  // ── Sortie console ──────────────────────────────────────────────────────
  for (const entry of report) {
    const total = entry.anchored + entry.sectionNotes + entry.outOfScripture;
    const status = total === entry.footnotesInFile ? "OK" : "ÉCART";
    console.log(
      `[${entry.source.id}] notes ${formatCount(entry.footnotesInFile)} | ancrées ${formatCount(entry.anchored)} | ` +
        `section ${entry.sectionNotes} | hors Écriture ${entry.outOfScripture} | ` +
        `écartées ${entry.invalid.length} | comptabilité ${status}`,
    );
  }
  for (const entry of report) {
    if (!entry.invalid.length) continue;
    const byCode = new Map();
    for (const error of entry.invalid) byCode.set(error.code, (byCode.get(error.code) ?? 0) + 1);
    console.log(
      `[${entry.source.id}] écartés : ` +
        [...byCode].map(([code, count]) => `${code} ×${count}`).join(", "),
    );
  }
  console.log(
    `[import] ${formatCount(kept.length)} commentaires, ${books.length} livres` +
      (isDryRun ? " (dry-run : rien n'a été écrit)" : ` → ${path.relative(ROOT, OUTPUT_DIR)}`),
  );
}

main().catch((error) => {
  console.error(`[import] ÉCHEC : ${error.message}`);
  process.exitCode = 1;
});
