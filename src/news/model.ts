import type {
  Article,
  NewsAudience,
  NewsTheme,
  PMDoc,
  PMNode,
  SearchEntry,
  TocEntry,
  ValidationError,
} from './types';

/*
 * Pure functions only: the build, the admin, the public page and the tests all
 * import this module, so a heading gets the same anchor wherever it is shown.
 */

export const AUDIENCES: NewsAudience[] = ['brands', 'creators', 'both'];
export const THEMES: NewsTheme[] = ['prepare', 'create', 'choose', 'measure'];
export const TYPES = ['guide', 'product', 'case'] as const;
export const PAGE_SIZE = 9;
const WORDS_PER_MINUTE = 220;

/* ------------------------------------------------------------------- texte */

/** Lowercase, accents folded, ligatures expanded: the form a search compares. */
export function normalizeSearch(value: string) {
  return value
    .replace(/œ/gi, 'oe')
    .replace(/æ/gi, 'ae')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** A URL-safe identifier made from any text. */
export function slugify(value: string) {
  return normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The readable text of a node and everything inside it. */
export function plainText(node: PMNode): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return ' ';
  const parts = (node.content ?? []).map(plainText);
  if (node.type === 'paragraph' || node.type === 'heading') return parts.join('');
  // Blocks are separated so words from two paragraphs never fuse.
  return parts.join(node.type === 'doc' ? '\n' : ' ');
}

export function readingMinutes(doc: PMDoc) {
  const words = plainText(doc).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/* ----------------------------------------------------------------- ancres */

const ANCHOR = /^[a-z][a-z0-9-]*$/;

function headings(doc: PMDoc) {
  return doc.content.filter((node) => node.type === 'heading');
}

/**
 * One anchor per heading, in document order.
 *
 * A stored id wins, so a heading keeps its address when its wording is
 * touched up — a link someone shared still lands on it. Missing, malformed or
 * already-taken ids fall back to the heading text, numbered when two headings
 * read the same. The same document always yields the same anchors.
 */
export function headingAnchors(doc: PMDoc): string[] {
  const taken = new Set<string>();
  const list = headings(doc);
  // Valid stored ids are reserved first, so a later duplicate cannot steal
  // the address of an earlier, already published heading.
  const kept = list.map((node) => {
    const id = node.attrs?.id;
    if (typeof id !== 'string' || !ANCHOR.test(id) || taken.has(id)) return null;
    taken.add(id);
    return id;
  });
  return list.map((node, i) => {
    const stored = kept[i];
    if (stored) return stored;
    const text = slugify(plainText(node));
    const base = !text ? 'section' : /^[a-z]/.test(text) ? text : `section-${text}`;
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    return id;
  });
}

/**
 * Writes the anchors into the document, as the admin does at every save.
 *
 * Until an article is published nobody can have linked to a section, so its
 * anchors follow the current wording (`keep: false`). Once it is online they
 * are kept (`keep: true`): the heading can be reworded, a shared link still
 * lands on it.
 */
export function assignHeadingIds(doc: PMDoc, { keep }: { keep: boolean }): PMDoc {
  const source: PMDoc = keep
    ? doc
    : {
        ...doc,
        content: doc.content.map((node) =>
          node.type === 'heading' ? { ...node, attrs: { ...node.attrs, id: null } } : node,
        ),
      };
  const anchors = headingAnchors(source);
  let i = 0;
  return {
    ...doc,
    content: doc.content.map((node) =>
      node.type === 'heading' ? { ...node, attrs: { ...node.attrs, id: anchors[i++] } } : node,
    ),
  };
}

/** H2 entries, with the H3 that follow each one nested beneath it. */
export function tableOfContents(doc: PMDoc): TocEntry[] {
  const anchors = headingAnchors(doc);
  const toc: TocEntry[] = [];
  headings(doc).forEach((node, i) => {
    const level = Number(node.attrs?.level);
    const entry: TocEntry = { id: anchors[i], text: plainText(node).trim(), children: [] };
    if (level === 2 || (level === 3 && toc.length === 0)) toc.push(entry);
    else if (level === 3) toc[toc.length - 1].children.push(entry);
  });
  return toc;
}

/* ----------------------------------------------------------------- sécurité */

/**
 * Where a link may lead: https, mail, a page of this site or a section of the
 * article. Everything else, from javascript: to protocol-relative URLs, is
 * refused rather than cleaned up.
 */
export function isSafeHref(href: unknown): boolean {
  if (typeof href !== 'string') return false;
  // Browsers ignore whitespace and control characters inside a scheme, so
  // they are removed before the scheme is judged.
  const compact = Array.from(href)
    .filter((c) => c.charCodeAt(0) > 32)
    .join('');
  if (!compact) return false;
  if (compact.startsWith('#')) return ANCHOR.test(compact.slice(1));
  if (compact.startsWith('/')) return !compact.startsWith('//');
  if (/^mailto:[^@\s]+@[^@\s]+$/i.test(compact)) return true;
  try {
    return new URL(compact).protocol === 'https:';
  } catch {
    return false;
  }
}

/** Where an image may come from: the media store of the site, fingerprinted. */
export const isMediaSrc = (src: unknown) =>
  typeof src === 'string' && /^\/news\/media\/[a-z0-9-]+-[a-f0-9]{8}\.(webp|png|jpe?g)$/.test(src);

const BLOCKS = new Set([
  'doc',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'image',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
  'callout',
  'text',
  'hardBreak',
  'horizontalRule',
]);
const MARKS = new Set(['bold', 'italic', 'link']);
export const CALLOUTS = ['example', 'checklist', 'warning'] as const;
/*
 * Un texte laissé en chantier ne se publie pas. Deux formes, et deux
 * sensibilités à la casse : les mots français s'écrivent comme on les écrit,
 * les marqueurs de rédaction sont des sigles en majuscules.
 *
 * « TODO » sans distinction de casse attrapait « todo », qui veut dire
 * « tout » en espagnol : aucun article espagnol n'aurait pu être publié.
 */
const PENDING = /à compléter|a completer|lorem ipsum/i;
const PENDING_MARKER = /\bTODO\b|\bTBD\b|\bFIXME\b/;

function checkNode(node: PMNode, path: string, errors: ValidationError[], depth = 0) {
  if (!node || typeof node !== 'object' || !BLOCKS.has(node.type)) {
    errors.push({ field: path, message: `Bloc non autorisé : ${node?.type ?? 'inconnu'}.` });
    return;
  }
  // The table of contents and the anchors are read from the top level only.
  if (node.type === 'heading' && depth > 1)
    errors.push({ field: path, message: 'Un titre ne peut pas être placé dans un autre bloc.' });
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level);
    if (level === 1)
      errors.push({ field: path, message: 'Un titre de niveau 1 (H1) est réservé au titre.' });
    else if (![2, 3, 4].includes(level))
      errors.push({ field: path, message: `Niveau de titre non autorisé : ${level}.` });
    if (!plainText(node).trim()) errors.push({ field: path, message: 'Titre vide.' });
  }
  if (node.type === 'image') {
    if (!isMediaSrc(node.attrs?.src))
      errors.push({ field: path, message: 'Image hors du stockage des médias du site.' });
    if (!String(node.attrs?.alt ?? '').trim())
      errors.push({ field: path, message: 'Image sans texte alternatif.' });
  }
  if (
    node.type === 'callout' &&
    !CALLOUTS.includes(String(node.attrs?.variant) as (typeof CALLOUTS)[number])
  )
    errors.push({ field: path, message: `Encadré inconnu : ${String(node.attrs?.variant)}.` });
  for (const mark of node.marks ?? []) {
    if (!MARKS.has(mark.type))
      errors.push({ field: path, message: `Mise en forme non autorisée : ${mark.type}.` });
    else if (mark.type === 'link' && !isSafeHref(mark.attrs?.href))
      errors.push({ field: path, message: `Lien refusé : ${String(mark.attrs?.href)}.` });
  }
  node.content?.forEach((child, i) => checkNode(child, `${path}.${i}`, errors, depth + 1));
}

const filled = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

/**
 * Everything that must hold before an article is saved, and — with
 * `publishing` — before it goes online. The build runs the same checks, so an
 * article that slips past the editor still cannot be published broken.
 */
export function validateArticle(
  article: Article,
  { publishing = false, now = new Date() }: { publishing?: boolean; now?: Date } = {},
): ValidationError[] {
  const errors: ValidationError[] = [];
  const add = (field: string, message: string) => errors.push({ field, message });

  if (!/^[a-z0-9]{8,}$/.test(String(article.id))) add('id', 'Identifiant invalide.');
  if (!filled(article.locale)) add('locale', 'Langue manquante.');
  if (!filled(article.title)) add('title', 'Le titre est obligatoire.');
  else if (article.title.length > 140) add('title', 'Titre trop long (140 caractères au plus).');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(article.slug)))
    add('slug', 'Le slug ne contient que des minuscules, chiffres et tirets.');
  if (!filled(article.excerpt)) add('excerpt', 'L’extrait est obligatoire.');
  else if (article.excerpt.length > 300)
    add('excerpt', 'Extrait trop long (300 caractères au plus).');
  if (!TYPES.includes(article.type as (typeof TYPES)[number])) add('type', 'Type inconnu.');
  if (!AUDIENCES.includes(article.audience)) add('audience', 'Public inconnu.');
  if (!THEMES.includes(article.theme)) add('theme', 'Thématique inconnue.');
  if (!filled(article.author?.name)) add('author.name', 'Auteur manquant.');
  if (!article.cover || !isMediaSrc(article.cover.src))
    add('cover.src', 'Image principale manquante ou hors du stockage des médias.');
  if (!filled(article.cover?.alt)) add('cover.alt', 'Texte alternatif de l’image obligatoire.');
  if (!filled(article.cta?.label)) add('cta.label', 'Libellé de l’action manquant.');
  if (!/^[a-z0-9-]*$/.test(String(article.cta?.slug))) add('cta.slug', 'Destination invalide.');
  if (!filled(article.seo?.title)) add('seo.title', 'Titre SEO obligatoire.');
  if (!filled(article.seo?.description)) add('seo.description', 'Description SEO obligatoire.');
  article.sources?.forEach((source, i) => {
    if (!filled(source.title)) add(`sources.${i}.title`, 'Titre de la source manquant.');
    if (!isSafeHref(source.url) || !/^https:/.test(source.url))
      add(`sources.${i}.url`, 'Une source est une adresse https.');
  });

  if (!article.body || article.body.type !== 'doc' || !Array.isArray(article.body.content))
    add('body', 'Contenu illisible.');
  else {
    checkNode(article.body, 'body', errors);
    if (!plainText(article.body).trim()) add('body', 'Le contenu est vide.');
  }

  if (publishing) {
    const body = article.body?.type === 'doc' ? plainText(article.body) : '';
    const pending = (value = '') => PENDING.test(value) || PENDING_MARKER.test(value);
    if ([article.title, article.excerpt, body].some((value) => pending(value ?? '')))
      add('body', 'Un marqueur « à compléter » ne peut pas être publié.');
    if (article.publishedAt && new Date(article.publishedAt).getTime() > now.getTime())
      add(
        'publishedAt',
        'Date de publication future : aucune programmation n’est exécutée sur ce site.',
      );
  }
  return errors;
}

/* ------------------------------------------------------- recherche, pages */

export interface SearchQuery {
  q?: string;
  audience?: string;
  theme?: string;
}

/** Every published article matching the query, in the order given. */
export function searchArticles<T extends SearchEntry>(index: T[], query: SearchQuery): T[] {
  const terms = normalizeSearch(query.q ?? '')
    .split(' ')
    .filter(Boolean);
  return index.filter((entry) => {
    // An article for both audiences concerns each of them.
    if (query.audience && entry.audience !== query.audience && entry.audience !== 'both')
      return false;
    if (query.theme && entry.theme !== query.theme) return false;
    if (!terms.length) return true;
    const haystack = normalizeSearch(`${entry.title} ${entry.excerpt} ${entry.text}`);
    return terms.every((term) => haystack.includes(term));
  });
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}
