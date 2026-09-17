/**
 * Lecteur ZIP minimal, sans dépendance — un `.docx` est une archive ZIP.
 *
 * Le projet a pour habitude des scripts Node autonomes (`seo-audit.mjs`,
 * `reliability-audit.mjs`) ; on ne tire pas une bibliothèque d'archive pour lire
 * deux fichiers XML. Seules les méthodes réellement employées par Word sont
 * gérées : 0 (stocké) et 8 (deflate).
 */
import { inflateRawSync } from "node:zlib";
import { readFileSync } from "node:fs";

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;

/** Recherche l'« End of Central Directory », en fin d'archive. */
function findEndOfCentralDirectory(buffer) {
  // Le commentaire final peut faire jusqu'à 65 535 octets.
  const start = Math.max(0, buffer.length - 22 - 0xffff);
  for (let i = buffer.length - 22; i >= start; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  throw new Error("Archive ZIP invalide : End of Central Directory introuvable.");
}

/**
 * Liste les entrées de l'archive sans les décompresser.
 * @returns {Map<string, {offset: number, method: number, compressedSize: number, uncompressedSize: number, crc32: number}>}
 */
function readCentralDirectory(buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  let cursor = buffer.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(cursor) !== CENTRAL_SIGNATURE) {
      throw new Error(`Archive ZIP corrompue : entrée ${i} illisible.`);
    }
    const method = buffer.readUInt16LE(cursor + 10);
    const crc32 = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const offset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.toString("utf8", cursor + 46, cursor + 46 + nameLength);

    entries.set(name, { offset, method, compressedSize, uncompressedSize, crc32 });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function readEntry(buffer, entry, name) {
  if (buffer.readUInt32LE(entry.offset) !== LOCAL_SIGNATURE) {
    throw new Error(`Entrée ZIP « ${name} » : en-tête local invalide.`);
  }
  const nameLength = buffer.readUInt16LE(entry.offset + 26);
  const extraLength = buffer.readUInt16LE(entry.offset + 28);
  const start = entry.offset + 30 + nameLength + extraLength;
  const raw = buffer.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) return raw;
  if (entry.method === 8) return inflateRawSync(raw);
  throw new Error(`Entrée ZIP « ${name} » : méthode de compression ${entry.method} non gérée.`);
}

/**
 * Ouvre un `.docx` et expose ses parties XML.
 * @param {string} filePath
 */
export function openDocx(filePath) {
  const buffer = readFileSync(filePath);
  const entries = readCentralDirectory(buffer);

  return {
    /** Noms de toutes les parties de l'archive. */
    names: () => [...entries.keys()],
    /** `true` si la partie existe. */
    has: (name) => entries.has(name),
    /**
     * Contenu texte d'une partie. Lève si absente : une partie manquante est
     * une anomalie de source, jamais un cas à ignorer silencieusement.
     */
    readText(name) {
      const entry = entries.get(name);
      if (!entry) {
        throw new Error(`Partie « ${name} » absente de ${filePath}.`);
      }
      return readEntry(buffer, entry, name).toString("utf8");
    },
  };
}
