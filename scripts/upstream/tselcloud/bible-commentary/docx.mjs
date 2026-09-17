/**
 * OOXML (WordprocessingML) → paragraphes et runs typés.
 *
 * On ne conserve que ce que la source contient réellement et que l'affichage
 * utilisera : le texte, gras, italique, l'appartenance à une liste, et les
 * ancres de notes. Tout le reste (polices, couleurs, révisions, marque-pages)
 * est ignoré volontairement.
 */

/** Entités XML, y compris numériques — l'hébreu et le grec doivent survivre. */
export function decodeXmlText(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&");
}

const PARAGRAPH_RE = /<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>/g;
const RUN_RE = /<w:r\b[^>]*>[\s\S]*?<\/w:r>/g;
const TEXT_RE = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
const FOOTNOTE_REF_RE = /<w:footnoteReference[^>]*\bw:id="(-?\d+)"/g;

/** `<w:b/>` ou `<w:b w:val="1"/>` — `w:val="0"` désactive. */
function hasToggle(properties, tag) {
  const match = new RegExp(`<w:${tag}(?:\\s+w:val="([^"]*)")?\\s*/>`).exec(properties);
  if (!match) return false;
  const value = match[1];
  return value === undefined || value === "1" || value === "true" || value === "on";
}

function runProperties(runXml) {
  const match = /<w:rPr>([\s\S]*?)<\/w:rPr>/.exec(runXml);
  return match ? match[1] : "";
}

function paragraphProperties(paragraphXml) {
  const match = /<w:pPr>([\s\S]*?)<\/w:pPr>/.exec(paragraphXml);
  return match ? match[1] : "";
}

function parseRuns(paragraphXml) {
  const runs = [];
  for (const runXml of paragraphXml.match(RUN_RE) ?? []) {
    const properties = runProperties(runXml);

    let text = "";
    TEXT_RE.lastIndex = 0;
    let textMatch;
    while ((textMatch = TEXT_RE.exec(runXml)) !== null) {
      text += decodeXmlText(textMatch[1]);
    }
    // Tabulations et sauts de ligne comptent comme des séparateurs.
    if (/<w:tab\s*\/>/.test(runXml) && !text) text = " ";
    if (/<w:br\s*\/>/.test(runXml) && !text) text = " ";

    const footnoteIds = [];
    FOOTNOTE_REF_RE.lastIndex = 0;
    let footnoteMatch;
    while ((footnoteMatch = FOOTNOTE_REF_RE.exec(runXml)) !== null) {
      footnoteIds.push(Number(footnoteMatch[1]));
    }

    // `<w:footnoteRef/>` est le renvoi numéroté imprimé en tête de la note
    // elle-même : ce n'est pas du contenu, on le laisse de côté.
    const isFootnoteMarker = /<w:footnoteRef\s*\/>/.test(runXml);

    if (!text && footnoteIds.length === 0) continue;

    runs.push({
      text,
      bold: hasToggle(properties, "b"),
      italic: hasToggle(properties, "i"),
      superscript: /<w:vertAlign\s+w:val="superscript"\s*\/>/.test(properties),
      footnoteIds,
      isFootnoteMarker,
    });
  }
  return runs;
}

function parseParagraph(paragraphXml) {
  const properties = paragraphProperties(paragraphXml);
  const runs = parseRuns(paragraphXml);
  return {
    style: /<w:pStyle w:val="([^"]+)"/.exec(properties)?.[1] ?? "",
    outlineLevel: /<w:outlineLvl w:val="(\d)"/.exec(properties)?.[1] ?? null,
    /** Présence d'une numérotation Word (liste à puces ou numérotée). */
    listId: /<w:numId w:val="(\d+)"/.exec(properties)?.[1] ?? null,
    runs,
    text: runs.map((run) => run.text).join(""),
  };
}

/** Paragraphes d'une partie OOXML, dans l'ordre du document. */
export function parseParagraphs(xml) {
  const paragraphs = [];
  PARAGRAPH_RE.lastIndex = 0;
  let match;
  while ((match = PARAGRAPH_RE.exec(xml)) !== null) {
    paragraphs.push(parseParagraph(match[0]));
  }
  return paragraphs;
}

/**
 * `word/footnotes.xml` → identifiant de note vers ses paragraphes.
 * Les notes techniques de Word (`separator`, `continuationSeparator`) sont
 * écartées : ce ne sont pas des notes éditoriales.
 */
export function parseFootnotes(xml) {
  const notes = new Map();
  for (const noteXml of xml.match(/<w:footnote\b[^>]*>[\s\S]*?<\/w:footnote>/g) ?? []) {
    const header = /<w:footnote\b[^>]*>/.exec(noteXml)?.[0] ?? "";
    if (/w:type="[^"]+"/.test(header)) continue;

    const id = Number(/\bw:id="(-?\d+)"/.exec(header)?.[1]);
    if (!Number.isInteger(id)) continue;

    notes.set(id, parseParagraphs(noteXml));
  }
  return notes;
}
