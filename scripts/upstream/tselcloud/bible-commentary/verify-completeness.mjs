#!/usr/bin/env node
/**
 * Contrôle d'exhaustivité — `bun run verify:brh-commentary`.
 *
 * Compare les fichiers SOURCES (.docx) au corpus PUBLIÉ, note par note, et
 * exige que chaque note du document soit soit publiée, soit expliquée. Aucune
 * note ne peut disparaître sans motif.
 *
 * Contrairement à `validate-cli.mjs` (qui contrôle la cohérence interne du
 * corpus généré et tourne en CI sans les .docx), ce script a besoin des
 * sources : il répond à la question « est-ce que TOUT y est ? ».
 *
 * Options : --verbose  liste chaque note non publiée avec son texte.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openDocx } from "./zip.mjs";
import { parseFootnotes, parseParagraphs } from "./docx.mjs";
import { SOURCES, walkSource } from "./brh-source.mjs";
import { buildBlocks } from "./rich-text.mjs";
import { loadVerseCounts } from "./validate.mjs";
import { BIBLE_BOOKS } from "../../src/constants/bibleBooks.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CORPUS = path.join(ROOT, "public/assets/bible/commentary/brh");
const BIBLE_DATA = path.join(ROOT, "public/assets/bible/fra_brh_nt");
const verbose = process.argv.includes("--verbose");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const n = (value) => value.toLocaleString("fr-FR").replace(/ | /g, " ");

/** Texte brut d'un commentaire publié, reconstruit depuis ses blocs. */
function publishedText(commentary) {
  const lines = [];
  for (const block of commentary.blocks) {
    if (block.type === "paragraph") {
      lines.push(block.spans.map((span) => span.text).join(""));
    } else {
      for (const item of block.items) {
        lines.push(`${item.marker} ${item.spans.map((span) => span.text).join("")}`);
      }
    }
  }
  return lines.join("\n");
}

/**
 * Charge tout le corpus publié, indexé par `<LIVRE>|<idNote>`.
 *
 * La clé DOIT inclure le livre : les identifiants de notes se recoupent entre
 * les deux documents (la note 27 existe dans la Torah ET dans le NT). Une clé
 * purement numérique ferait passer une note pour publiée alors qu'elle ne
 * l'est pas — exactement le genre de faux positif qui rendrait ce contrôle
 * inutile.
 */
function loadCorpus() {
  const byFootnote = new Map();
  const perBook = new Map();

  const walkDir = (dir, handler) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkDir(full, handler);
      else if (entry.name.endsWith(".json")) handler(full);
    }
  };

  const collect = (file) => {
    const data = readJson(file);
    for (const commentary of data.commentaries ?? []) {
      // id = brh-<LIVRE>-<chapitre>-<portée>-<idNote>
      const footnoteId = Number(commentary.id.split("-").pop());
      byFootnote.set(`${data.bookId}|${footnoteId}`, { ...commentary, bookId: data.bookId });
      perBook.set(data.bookId, (perBook.get(data.bookId) ?? 0) + 1);
    }
  };

  walkDir(path.join(CORPUS, "chapters"), collect);
  walkDir(path.join(CORPUS, "intros"), collect);
  return { byFootnote, perBook };
}

function main() {
  if (!existsSync(CORPUS)) {
    console.error("[verify] corpus absent — lance `bun run import:brh-commentary`.");
    process.exit(1);
  }

  const { byFootnote } = loadCorpus();
  const verseCounts = loadVerseCounts(BIBLE_DATA);
  const problems = [];
  const summary = [];

  for (const source of Object.values(SOURCES)) {
    const filePath = path.join(ROOT, source.file);
    if (!existsSync(filePath)) {
      console.error(
        `[verify] source absente : ${source.file}\n` +
          "         Ce contrôle a besoin des .docx (non versionnés, sous droits).",
      );
      process.exit(1);
    }

    const docx = openDocx(filePath);
    const documentXml = docx.readText("word/document.xml");
    const paragraphs = parseParagraphs(documentXml);
    const footnotes = parseFootnotes(docx.readText("word/footnotes.xml"));
    const walk = walkSource(paragraphs, source);

    // ── 1. Aucune ancre du document n'échappe au parcours ───────────────────
    const refsInXml = [...documentXml.matchAll(/<w:footnoteReference[^>]*w:id="(\d+)"/g)].map((m) =>
      Number(m[1]),
    );
    const seenByWalk = new Set([
      ...walk.anchors.map((a) => a.footnoteId),
      ...walk.sectionNotes.map((s) => s.footnoteId),
      ...walk.outOfScripture.map((o) => o.footnoteId),
    ]);
    const escaped = refsInXml.filter((id) => !seenByWalk.has(id));
    if (escaped.length) {
      problems.push(
        `[${source.id}] ${escaped.length} ancre(s) du document échappent au parcours : ${escaped.slice(0, 10).join(", ")}`,
      );
    }

    // ── 2. Classement de CHAQUE note du fichier ────────────────────────────
    const anchorByFootnote = new Map(walk.anchors.map((a) => [a.footnoteId, a]));
    const sectionByFootnote = new Map(walk.sectionNotes.map((s) => [s.footnoteId, s]));
    const outOfScripture = new Set(walk.outOfScripture.map((o) => o.footnoteId));

    const classified = {
      published: [],
      outOfScripture: [],
      sectionUnattached: [],
      missingVerse: [],
      duplicate: [],
      unexplained: [],
    };

    /**
     * Textes déjà publiés sur un ancrage donné. La source peut porter DEUX
     * marqueurs distincts sur le même verset avec un texte identique (Luc 9:41
     * porte deux fois « Au pluriel. », sur deux mots différents). L'ancrage du
     * site étant au verset, afficher deux fois la même phrase n'apprendrait
     * rien : une seule copie est publiée.
     */
    const publishedTextsByAnchor = new Map();
    for (const [key, commentary] of byFootnote) {
      if (!key.startsWith("")) continue;
      const anchorKey = `${commentary.bookId}|${commentary.chapter ?? ""}|${commentary.verseStart ?? ""}|${commentary.scope}`;
      if (!publishedTextsByAnchor.has(anchorKey)) publishedTextsByAnchor.set(anchorKey, new Set());
      publishedTextsByAnchor.get(anchorKey).add(publishedText(commentary));
    }

    for (const [footnoteId, noteParagraphs] of footnotes) {
      const bookId =
        anchorByFootnote.get(footnoteId)?.bookId ??
        sectionByFootnote.get(footnoteId)?.bookId ??
        null;
      const published = bookId ? byFootnote.get(`${bookId}|${footnoteId}`) : undefined;
      const { plainText } = buildBlocks(noteParagraphs);

      if (published) {
        // ── 3. Le texte publié est-il celui de la source ? ─────────────────
        if (publishedText(published) !== plainText) {
          problems.push(`[${source.id}] note ${footnoteId} : le texte publié diffère de la source`);
        }
        classified.published.push(footnoteId);
        continue;
      }

      if (outOfScripture.has(footnoteId)) {
        classified.outOfScripture.push({ footnoteId, plainText });
        continue;
      }

      const section = sectionByFootnote.get(footnoteId);
      if (section) {
        classified.sectionUnattached.push({ footnoteId, plainText, label: section.label });
        continue;
      }

      const anchor = anchorByFootnote.get(footnoteId);
      if (anchor?.scope === "verse") {
        const chapterVerses = verseCounts.get(anchor.bookId)?.get(anchor.chapter);
        if (chapterVerses && !chapterVerses.has(anchor.verse)) {
          classified.missingVerse.push({
            footnoteId,
            plainText,
            reference: `${anchor.bookId} ${anchor.chapter}:${anchor.verse}`,
          });
          continue;
        }
      }

      if (anchor) {
        const anchorKey = `${anchor.bookId}|${anchor.chapter ?? ""}|${anchor.scope === "verse" ? anchor.verse : ""}|${anchor.scope}`;
        if (publishedTextsByAnchor.get(anchorKey)?.has(plainText)) {
          classified.duplicate.push({
            footnoteId,
            plainText,
            reference: `${anchor.bookId} ${anchor.chapter}:${anchor.verse ?? "-"}`,
          });
          continue;
        }
      }

      classified.unexplained.push({ footnoteId, plainText, anchor });
    }

    if (classified.unexplained.length) {
      problems.push(
        `[${source.id}] ${classified.unexplained.length} note(s) perdues SANS explication : ` +
          classified.unexplained
            .slice(0, 10)
            .map((x) => x.footnoteId)
            .join(", "),
      );
    }

    // ── 4. Couverture par livre et par chapitre ────────────────────────────
    const chapterNotes = new Map();
    for (const anchor of walk.anchors) {
      const key = `${anchor.bookId}|${anchor.chapter}`;
      if (!chapterNotes.has(key)) chapterNotes.set(key, { source: 0, published: 0 });
      chapterNotes.get(key).source += 1;
      if (byFootnote.has(`${anchor.bookId}|${anchor.footnoteId}`)) {
        chapterNotes.get(key).published += 1;
      }
    }

    const booksTouched = new Set(walk.chapters.map((c) => c.bookId));
    const chaptersWithoutFile = [];
    for (const [key, counts] of chapterNotes) {
      const [bookId, chapter] = key.split("|");
      const file = path.join(CORPUS, "chapters", bookId, `${chapter}.json`);
      if (counts.published > 0 && !existsSync(file)) {
        chaptersWithoutFile.push(`${bookId} ${chapter}`);
      }
    }
    if (chaptersWithoutFile.length) {
      problems.push(
        `[${source.id}] chapitres publiés sans fichier : ${chaptersWithoutFile.join(", ")}`,
      );
    }

    summary.push({ source, footnotes, walk, classified, booksTouched, chapterNotes });
  }

  // ── Rapport ─────────────────────────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  CONTRÔLE D'EXHAUSTIVITÉ — sources .docx  ↔  corpus publié       ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");

  let totalSource = 0;
  let totalPublished = 0;

  for (const entry of summary) {
    const { source, footnotes, walk, classified, booksTouched } = entry;
    const total = footnotes.size;
    const published = classified.published.length;
    totalSource += total;
    totalPublished += published;

    console.log(`\n■ ${source.label}`);
    console.log(`  fichier ................ ${source.file}`);
    console.log(`  nature des notes ....... ${source.defaultKind}`);
    console.log(`  livres ................. ${booksTouched.size}`);
    console.log(`  chapitres détectés ..... ${walk.chapters.length}`);
    console.log(`  ─────────────────────────────────────────────────────────`);
    console.log(`  notes dans le fichier .. ${n(total)}`);
    console.log(`  PUBLIÉES ............... ${n(published)}`);
    console.log(`  non publiées, dont :`);
    console.log(
      `    hors Écriture ........ ${n(classified.outOfScripture.length)}  (préface, annexes, épilogue)`,
    );
    console.log(
      `    section non ancrable . ${n(classified.sectionUnattached.length)}  (annexes sans livre suivant)`,
    );
    console.log(`    verset absent des données ${n(classified.missingVerse.length)}`);
    console.log(
      `    doublon exact ........ ${n(classified.duplicate.length)}  (même verset, même texte)`,
    );
    console.log(`    INEXPLIQUÉES ......... ${n(classified.unexplained.length)}`);
    const accounted =
      published +
      classified.outOfScripture.length +
      classified.sectionUnattached.length +
      classified.missingVerse.length +
      classified.duplicate.length +
      classified.unexplained.length;
    console.log(
      `  ─────────────────────────────────────────────────────────\n` +
        `  total comptabilisé ..... ${n(accounted)} / ${n(total)}  ${accounted === total ? "✓" : "✗ ÉCART"}`,
    );

    if (verbose) {
      for (const [label, list] of [
        ["hors Écriture", classified.outOfScripture],
        ["section non ancrable", classified.sectionUnattached],
        ["verset absent", classified.missingVerse],
        ["doublon exact", classified.duplicate],
        ["INEXPLIQUÉES", classified.unexplained],
      ]) {
        if (!list.length) continue;
        console.log(`\n  ── ${label} (${list.length}) ──`);
        for (const item of list) {
          const where = item.reference ?? item.label ?? "";
          console.log(
            `    note ${String(item.footnoteId).padStart(5)} ${where ? `[${where}] ` : ""}` +
              `« ${item.plainText.replace(/\s+/g, " ").slice(0, 90)}… »`,
          );
        }
      }
    }
  }

  // ── Couverture par livre ────────────────────────────────────────────────
  console.log("\n■ Couverture par livre — notes de la source vs publiées\n");
  console.log(
    "  livre                    ch. source  ch. publiés   notes source  notes publiées  versets",
  );
  console.log("  " + "─".repeat(88));

  for (const entry of summary) {
    const perBook = new Map();
    for (const anchor of entry.walk.anchors) {
      if (!perBook.has(anchor.bookId)) {
        perBook.set(anchor.bookId, {
          source: 0,
          published: 0,
          chaptersSource: new Set(),
          chaptersPublished: new Set(),
          verses: new Set(),
        });
      }
      const stats = perBook.get(anchor.bookId);
      stats.source += 1;
      stats.chaptersSource.add(anchor.chapter);
      if (byFootnote.has(`${anchor.bookId}|${anchor.footnoteId}`)) {
        stats.published += 1;
        stats.chaptersPublished.add(anchor.chapter);
        if (anchor.scope === "verse") stats.verses.add(`${anchor.chapter}:${anchor.verse}`);
      }
    }

    for (const [bookId, stats] of perBook) {
      const gap = stats.source - stats.published;
      const name = BIBLE_BOOKS[bookId].name;
      console.log(
        `  ${name.padEnd(24)} ${String(stats.chaptersSource.size).padStart(9)} ` +
          `${String(stats.chaptersPublished.size).padStart(12)} ` +
          `${String(stats.source).padStart(14)} ${String(stats.published).padStart(15)} ` +
          `${String(stats.verses.size).padStart(8)}` +
          (gap ? `   ← ${gap} non publiée(s)` : ""),
      );
    }
  }

  console.log("\n■ Total");
  console.log(`  notes des deux sources ... ${n(totalSource)}`);
  console.log(`  notes publiées ........... ${n(totalPublished)}`);
  console.log(
    `  écart .................... ${n(totalSource - totalPublished)} (détaillé ci-dessus, motif par motif)`,
  );

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problème(s) :`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log(
    "\n✓ Chaque note des deux documents est soit publiée, soit expliquée.\n" +
      "  Aucune perte silencieuse, aucun texte altéré.\n",
  );
}

main();
